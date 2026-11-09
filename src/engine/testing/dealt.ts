/**
 * A board of given params, dealt once per worker and shared by every
 * cross-game sweep that asks for it.
 *
 * **Dealing is where a sweep's time goes, not checking.** Following a hint
 * plan to the end of a board is quick on nearly every preset, while dealing
 * the dearest boards (Group's larger Hard ones) takes many seconds, and a
 * sweep that seeded its own deal would deal them afresh for every guard. The
 * suite runs with `isolate: false`, so a module-level cache is one per worker
 * and every file in it reads the same boards.
 *
 * **What this gives up is that each guard could see a different board of the
 * same params.** Nothing relies on that: a guard that needs a property to
 * hold across boards takes several with `n`, and one that needs a particular
 * board pins its description (docs/testing.md § "Pinning a hint's
 * positions"). What it buys beside the time is that a failure in one guard
 * names a board every other guard also walked.
 *
 * A deal that throws is kept and thrown again, because an ungenerable board
 * can be the dearest of all: the generator makes every try it is allowed.
 *
 * **A run's workers share their boards too**, through the {@link DealStore}
 * the suite's setup installs (`scripts/checks/dealt-store.ts`): CI runs four
 * workers, and without it each dealt the same boards, 2,323 deals of 794
 * boards in the engine's tests (2026-11-09). Only a game registered under its
 * `id` is shared that way, since a test may hand over a copy of a game with
 * its generator changed, and a copy is its own object here as anywhere.
 *
 * Dev/test-only; never imported by production code.
 */
import { type RandomState, randomNew } from "../random/index.ts";
import { getTsGame } from "../registry.ts";
import { MAX_REGENERATE, RetryLimitExceeded, underDealTries } from "../retry-limit.ts";

/** A dealt board, as `newDesc` returns it. */
type Board = { desc: string; aux?: string };

export interface Dealing<Params> {
  /** Present on every game; a test's stand-in may leave it out. */
  readonly id?: string;
  encodeParams(p: Params, full: boolean): string;
  newDesc(p: Params, rng: RandomState): Board;
}

/** A deal as the workers of a run hand it to each other. */
export type StoredDeal = { cpu: number } & (
  | { board: Board }
  | { retryLimit: { label: string; max: number; message: string } }
  /** It threw something else, which each worker meets for itself. */
  | { unshared: true }
);

/**
 * The boards a run's workers deal, shared between them. `take` returns what a
 * worker already dealt under `key`, waiting while one is dealing it, or
 * returns `null` having made this worker the one to deal it, which then
 * `put`s it.
 */
export interface DealStore {
  take(key: string): StoredDeal | null;
  put(key: string, deal: StoredDeal): void;
}

let store: DealStore | null = null;

/** Shares this worker's deals through `next`, or stops sharing them; returns
 * the store it shared them through before. */
export function shareDealsThrough(next: DealStore | null): DealStore | null {
  const before = store;
  store = next;
  return before;
}

/**
 * The tries a deal that is known to end may make. The app finds a rare board
 * because its deadline counts no tries (`retry-limit.ts`), and a generator
 * called directly gives up at the house count, which a rare board (Bridges,
 * five islands on a 10x10 at Tricky) is far past. It
 * is a bound all the same, so that a cell which loses its tier fails and does
 * not spin.
 */
const RARE_BOARD_TRIES = 5_000_000;

/**
 * `game.newDesc`, for a test that deals a board it knows to be rare: one the
 * house count of tries gives up on and the app deals.
 */
export function dealRare<Params, Board extends { desc: string }>(
  game: { newDesc(p: Params, rng: RandomState): Board },
  params: Params,
  rng: RandomState,
): Board {
  return underDealTries(RARE_BOARD_TRIES, () => game.newDesc(params, rng));
}

type Deal = ({ board: Board } | { thrown: unknown }) & {
  /** The CPU microseconds the deal took. */
  cpu: number;
  /** The {@link openCostWindow} it was dealt in. */
  costWindow: number;
};

const deals = new WeakMap<object, Map<string, Deal>>();

/**
 * The cost budget charges a test file for every board it uses, whichever
 * file in the worker dealt it first, so that a file's cost does not depend on
 * what its worker ran before it (`scripts/checks/test-cost-setup.ts`). Read
 * off `globalThis`, as `slow.ts` reads the environment, since the app's
 * tsconfig has no Node types.
 */
const host = (
  globalThis as { process?: { cpuUsage(): { user: number; system: number } } }
).process;

function cpuNow(): number {
  if (host === undefined) return 0;
  const { user, system } = host.cpuUsage();
  return user + system;
}

/** Which test file the worker is running, as a count of the files it has. */
let costWindow = 0;
/** The deals this file used that an earlier file in the worker paid for. */
let inherited = new Set<Deal>();
/** The CPU microseconds of the deals this file made. */
let dealtHere = 0;

/** Starts charging deals to a new test file. */
export function openCostWindow(): void {
  costWindow++;
  inherited = new Set();
  dealtHere = 0;
}

/** The CPU microseconds of the boards this file used and did not deal. */
export function inheritedDealCost(): number {
  let micros = 0;
  for (const deal of inherited) micros += deal.cpu;
  return micros;
}

/** The CPU microseconds of the boards this file dealt itself: how much of a
 * suite's cost is dealing, which writing a board down would save. */
export function ownDealCost(): number {
  return dealtHere;
}

function used(deal: Deal): void {
  if (deal.costWindow !== costWindow) inherited.add(deal);
}

/** Deals a board, timed, keeping what it threw. */
function timed(make: () => Board): Deal {
  const start = cpuNow();
  let outcome: { board: Board } | { thrown: unknown };
  try {
    outcome = { board: make() };
  } catch (thrown) {
    outcome = { thrown };
  }
  const cpu = cpuNow() - start;
  dealtHere += cpu;
  return { ...outcome, cpu, costWindow };
}

/** The deal under `key`, from the run's store where another worker made it,
 * else {@link timed} here and handed to the others. A deal from the store is
 * charged as one an earlier file dealt. */
function dealShared(game: { id?: string }, key: string, make: () => Board): Deal {
  const shared =
    store !== null && game.id !== undefined && getTsGame(game.id) === game
      ? store
      : null;
  const at = `${game.id}|${key}`;
  const stored = shared?.take(at) ?? null;
  if (stored !== null && !("unshared" in stored)) {
    const outcome =
      "board" in stored
        ? { board: stored.board }
        : {
            thrown: Object.assign(
              new RetryLimitExceeded(stored.retryLimit.label, stored.retryLimit.max),
              { message: stored.retryLimit.message },
            ),
          };
    return { ...outcome, cpu: stored.cpu, costWindow: -1 };
  }
  const deal = timed(make);
  if (shared !== null && stored === null) shared.put(at, toStored(deal));
  return deal;
}

function toStored(deal: Deal): StoredDeal {
  const { cpu } = deal;
  if ("board" in deal) return { cpu, board: deal.board };
  const { thrown } = deal;
  if (thrown instanceof RetryLimitExceeded)
    return {
      cpu,
      retryLimit: { label: thrown.label, max: thrown.max, message: thrown.message },
    };
  return { cpu, unshared: true };
}

function dealsOf(game: object): Map<string, Deal> {
  let ofGame = deals.get(game);
  if (ofGame === undefined) {
    ofGame = new Map();
    deals.set(game, ofGame);
  }
  return ofGame;
}

/**
 * Whether `params` deals its first {@link dealt} board under the house count
 * of tries, which keeps that board for `dealt` when it does. A size the game
 * accepts may be one whose boards are too rare to find, as a refusal rests
 * only on there being none, so a sweep that picks its own board asks this.
 *
 * A deal that throws for any other reason counts as prompt and is kept, so
 * that the guard handed the board reports it. A deal that runs out its tries
 * is remembered too, since asking again would spend them all again.
 */
export function dealsPromptly<Params>(game: Dealing<Params>, params: Params): boolean {
  const ofGame = dealsOf(game);
  const key = `${game.encodeParams(params, true)}#0`;
  const kept = ofGame.get(key);
  if (kept !== undefined) {
    used(kept);
    return true;
  }
  const slow = slowOf(game);
  const refused = slow.get(key);
  if (refused !== undefined) {
    used(refused);
    return false;
  }
  const rng = seedOf(key);
  // Its own key in the store: the board it finds is the rare deal's, but a
  // refusal is not.
  const deal = dealShared(game, `${key} promptly`, () =>
    underDealTries(MAX_REGENERATE, () => game.newDesc(params, rng)),
  );
  used(deal);
  if ("thrown" in deal && deal.thrown instanceof RetryLimitExceeded) {
    slow.set(key, deal);
    return false;
  }
  ofGame.set(key, deal);
  return true;
}

/** The params whose first board {@link dealsPromptly} found too rare. */
const slowDeals = new WeakMap<object, Map<string, Deal>>();

function slowOf(game: object): Map<string, Deal> {
  let ofGame = slowDeals.get(game);
  if (ofGame === undefined) {
    ofGame = new Map();
    slowDeals.set(game, ofGame);
  }
  return ofGame;
}

/**
 * The `n`th board of `params`: the same one for every caller in this worker.
 * Take `n` above zero only where a second board of the same params is what the
 * property needs.
 */
export function dealt<Params>(game: Dealing<Params>, params: Params, n = 0): Board {
  const ofGame = dealsOf(game);
  const key = `${game.encodeParams(params, true)}#${n}`;
  let deal = ofGame.get(key);
  if (deal === undefined) {
    // As a rare board is dealt: a sweep is handed the types the app deals,
    // and the app's deal counts no tries.
    deal = dealShared(game, key, () => dealRare(game, params, seedOf(key)));
    ofGame.set(key, deal);
  }
  used(deal);
  if ("thrown" in deal) throw deal.thrown;
  return deal.board;
}

/** The seed of the board {@link dealt} keeps under `key`. */
function seedOf(key: string): RandomState {
  return randomNew(`dealt-${key}`);
}

/**
 * The `n`th board of `params` dealt again from {@link dealt}'s seed, and kept
 * by nobody: the board a test compares with `dealt`'s, having changed
 * something the generator reads, as `ladder-skip.test.ts` turns skipping off.
 */
export function dealtAgain<Params>(
  game: Dealing<Params>,
  params: Params,
  n = 0,
): Board {
  return dealRare(game, params, seedOf(`${game.encodeParams(params, true)}#${n}`));
}

/** The part of a midend {@link beginDealt} drives. */
interface Beginning {
  setParams(params: string): string | null;
  dealParams(): string;
  newGame(
    fitTo?: undefined,
    kept?: { params: string; desc: string; aux: string | null } | null,
  ): string | null;
}

/**
 * Begin `midend` on the `n`th shared board of `params`, by the route New game
 * takes with a board dealt ahead: the generator's `aux` arrives with it, as it
 * does for a board the player was dealt. The refusal as the midend words it,
 * or `null`.
 */
export function beginDealt<Params>(
  midend: Beginning,
  game: Dealing<Params>,
  params: Params,
  n = 0,
): string | null {
  const encoded = game.encodeParams(params, true);
  const refused = midend.setParams(encoded);
  if (refused !== null) return refused;
  // A kept board at other params is dealt over in silence, from a fresh seed.
  if (midend.dealParams() !== encoded)
    throw new Error(`the midend deals ${midend.dealParams()}, not ${encoded}`);
  let board: Board;
  try {
    board = dealt(game, params, n);
  } catch (e) {
    // The generator found no board, which the midend reports and does not throw.
    if (e instanceof RetryLimitExceeded) return e.message;
    throw e;
  }
  return midend.newGame(undefined, {
    params: encoded,
    desc: board.desc,
    aux: board.aux ?? null,
  });
}
