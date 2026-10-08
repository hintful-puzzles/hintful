/**
 * The cross-game difficulty contract: how to read and set a tier on a params
 * object, and how to run the game's solver capped at one. **What the tiers
 * *are* is not part of it** — see {@link difficultyTiers}.
 *
 * **Why this exists.** Without one contract no two tiered games can be asked
 * about their tiers the same way, so a property that is *about* tiers can only
 * be asserted one game at a time, by hand. The property in question is
 * cap-monotonicity (a board solvable with the ladder capped at `d` is solvable
 * at every cap above `d`), and it is not theoretical: Boats shipped a solver
 * that solved boards at a *lower* cap which it failed at a higher one, which
 * silently broke Check & Save on every Easy board, because "solvable at Easy"
 * and "solvable at Tricky" were both true statements about different code paths
 * and nothing compared them. `difficulty-contract.test.ts` is the shared guard.
 *
 * **Why the accessors, rather than a documented field name.** The obstacle is
 * not that the params field is spelled `diff` in some games and `difficulty` in
 * others. It is that several games do not hold a number there at all — Galaxies,
 * Keen, Spokes and others type it as a string union or an enum, each with its
 * own private `diffToLevel`. A cross-game caller cannot write
 * `{ ...p, diff: cap }` for those, because `cap` is an index and the field is
 * not one. `tierOf` / `withTier` go through the game rather than around it.
 *
 * **Why a discriminated verdict, rather than the solvers' integers.** Every
 * game's solver reports some flavor of `-1 / 0 / 1`, and the meanings are not
 * uniform: Magnets' `0` is "ambiguous or unfinished", Boats' is "stuck",
 * Clusters returns a three-valued status enum, Tracks returns a record. Mapping
 * each to three named outcomes belongs in the per-game adapter, where the
 * knowledge is; propagating the raw integers would import every game's
 * convention into every cross-game consumer.
 *
 * **The contract describes; it never decides.** Adopting it changes no board a
 * game generates — a differential fixture that moves means an adapter
 * misreports its game's solver.
 */
// Type-only, so the `game.ts` ⇄ `difficulty.ts` pair is erased at compile time
// and no runtime cycle exists.
import type { ParamConfigItem } from "./game.ts";

/**
 * A capped solver's answer about one board.
 *
 * - `"solved"` — the solver reached the unique solution within the cap.
 * - `"unsolved"` — it ran out of technique (stuck, or the board is ambiguous at
 *   this cap). This is the *only* honest reading of most solvers' `0`, which is
 *   why "stuck" and "ambiguous" are not separate members: several games cannot
 *   distinguish them and a member no adapter can populate faithfully is worse
 *   than none.
 * - `"impossible"` — it proved the board inconsistent. Kept distinct from
 *   `"unsolved"` because it means the *desc* is wrong, not the cap too low, and
 *   a guard that saw it would be reporting a different bug.
 */
export type DifficultyVerdict = "solved" | "unsolved" | "impossible";

/** A solver bound to one board, callable at any cap. See
 * {@link solvableAtExactlyTier} for why the helpers take this rather than the
 * game: a generator applying its own acceptance rule cannot import its own
 * `index.ts` without closing a cycle, but it can always close over its solver. */
export type CappedSolve = (cap: number) => DifficultyVerdict;

/**
 * How to solve a tiered game capped at a tier, and which of its tiers are
 * exceptions to the shared guards. Optional on `Game`: a game without tiers
 * omits it.
 *
 * **The tier list, and how params hold a tier, are not here** — both are the
 * game's difficulty item ({@link difficultyItem}), from which
 * {@link difficultyTiers}, {@link tierOf} and {@link withTier} read. The
 * contract is the solver; the declaration is the menu.
 */
export interface DifficultyContract<Params> {
  /** Run the game's solver over `desc` with its deduction ladder capped at
   * `cap`, from a *fresh* solver state. Freshness is load-bearing: a reused
   * scratch can carry state that weakens the solver (Ascent's retained
   * `foundEndpoints` does) and leaves side effects for the next caller. */
  solveAtCap(p: Params, desc: string, cap: number): DifficultyVerdict;
}

/**
 * A tiered game's tier names, easiest first, indexed by cap — **read off the
 * game's own custom-params form**, which is where a player picks one.
 * `undefined` for a game that offers no difficulty choice.
 *
 * **One declaration, not two.** The form is the only list: it is the one a
 * player actually sees, and it is reachable at module load with no board in
 * hand. A second copy on the contract could only be held equal to it by an
 * assertion.
 *
 * **Why not from the technique ladder.** Three independent reasons, each fatal
 * on its own:
 *
 * 1. **The ladder declares tier *indices*; a tier list is *names*.**
 *    `DeductionTechnique.tier` is a `number`. "Easy" and "Unreasonable" are
 *    strings a player reads, and no projection invents them from integers.
 * 2. **The projection runs the wrong way.** `runDeductionFixpoint` *receives*
 *    `maxTier`, derived from a tier index — it is downstream of the tier list.
 *    And every ladder in this repo is an array literal built *inside* a solve,
 *    closing over board state, so there is nothing to interrogate at module
 *    load, which is when `paramConfig` and the params codec need the list.
 *    `engine/latin.ts` makes this vivid: it synthesizes its rungs as
 *    `0..maxdiff`, so asking that ladder for its tiers returns the cap it was
 *    handed.
 * 3. **A tier is not always a rung.** Towers/Keen/Group/Unequal/Mathrax put
 *    their top tier on `latinSolverRecurse`, outside the fixpoint entirely;
 *    Undead's only ladder on the shared runner is its *hint recorder*, whose
 *    two techniques both sit on tier 0 while the game offers three tiers. A
 *    ladder-derived list would be short for all of them.
 */
export function difficultyTiers<Params>(game: {
  paramConfig?: readonly ParamConfigItem<Params>[];
}): readonly string[] | null {
  return difficultyChoiceItem(game)?.choices ?? null;
}

/**
 * The name of the tier these params request, or `null` for a game with no
 * difficulty choice.
 */
export function tierNameOf<Params>(
  game: { paramConfig?: readonly ParamConfigItem<Params>[] },
  params: Params,
): string | null {
  const item = difficultyChoiceItem(game);
  return item === null ? null : (item.choices[item.get(params)] ?? null);
}

/** Which tier these params request, as an index into {@link difficultyTiers}.
 * A game with no difficulty item has none to request, so this throws. */
export function tierOf<Params>(
  game: { paramConfig?: readonly ParamConfigItem<Params>[] },
  params: Params,
): number {
  return requireItem(game).get(params);
}

/** The same params at a different tier. Pure — a new object, `params` left
 * alone — so a caller may probe every tier of one params object. */
export function withTier<Params>(
  game: { paramConfig?: readonly ParamConfigItem<Params>[] },
  params: Params,
  tier: number,
): Params {
  const copy = { ...params };
  requireItem(game).set(copy, tier);
  return copy;
}

function requireItem<Params>(game: {
  paramConfig?: readonly ParamConfigItem<Params>[];
}): Extract<ParamConfigItem<Params>, { type: "choices" }> {
  const item = difficultyChoiceItem(game);
  if (item === null) throw new Error("this game declares no difficulty item");
  return item;
}

/** The params key holding a tier index directly. */
type TierKey<P> = {
  [K in keyof P]-?: P[K] extends number ? K : never;
}[keyof P];

/** How a game's params hold a tier: the key of an index field, or accessors for
 * a game that stores a word or an enum there (Keen's `diff` is a letter). */
export type TierField<P> =
  | TierKey<P>
  | { get(p: P): number; set(p: P, tier: number): void };

/** The keyword of every difficulty field, which is how the engine finds one. */
export const DIFFICULTY_KW = "difficulty";

/** What the help says of every difficulty field, before a game's own words. */
const DIFFICULTY_DOC =
  'Determine the difficulty of the generated puzzle; see <a href="../features#difficulty">what the names mean</a>.';

/**
 * The Custom dialog's difficulty field, which every tiered game has and none
 * writes out: `kw: "difficulty"`, labeled "Difficulty", offering `tiers`, and
 * labeling a params set with the tier's name.
 *
 * It is also where the tier accessors come from ({@link tierOf},
 * {@link withTier}), so the dialog, the codec, the labels and the cross-game
 * guards all go through the one declaration. `doc` is the game's own sentence
 * about its tiers, if it has one, after the standard one.
 */
export function difficultyItem<P>(
  tiers: readonly string[],
  field: TierField<P>,
  opts: { doc?: string; retired?: number } = {},
): ParamConfigItem<P> {
  const access =
    typeof field === "object"
      ? field
      : {
          get: (p: P) => p[field] as number,
          set: (p: P, tier: number) => {
            (p as Record<TierKey<P>, number>)[field] = tier;
          },
        };
  return {
    kw: DIFFICULTY_KW,
    name: "Difficulty",
    type: "choices",
    choices: [...tiers],
    ...(opts.retired ? { retired: opts.retired } : {}),
    doc: opts.doc ? `${DIFFICULTY_DOC} ${opts.doc}` : DIFFICULTY_DOC,
    label: { slot: "tier" },
    get: access.get,
    set: access.set,
  };
}

/**
 * Does this board's tier allow positions that need trial and error?
 *
 * Only a tier named {@link SEARCH_TIER} does: the name *is* the promise, which
 * is why the check reads the name rather than a position on the ladder. A game
 * with no tiers has none to blame, so nothing it deals permits search, and a
 * hint that runs out of deduction on one of its boards is a defect.
 */
export function permitsSearch<Params>(
  game: { paramConfig?: readonly ParamConfigItem<Params>[] },
  params: Params,
): boolean {
  return tierNameOf(game, params) === SEARCH_TIER;
}

/** Does the game have a tier that allows trial and error at all? */
export function offersSearch<Params>(game: {
  paramConfig?: readonly ParamConfigItem<Params>[];
}): boolean {
  return difficultyTiers(game)?.includes(SEARCH_TIER) ?? false;
}

/** The game's {@link difficultyItem}, whole, or `null` for a game without
 * tiers. */
export function difficultyChoiceItem<Params>(game: {
  paramConfig?: readonly ParamConfigItem<Params>[];
}): Extract<ParamConfigItem<Params>, { type: "choices" }> | null {
  const item = game.paramConfig?.find((i) => i.kw === DIFFICULTY_KW);
  return item?.type === "choices" ? item : null;
}

/**
 * The collection's difficulty scale, easiest first — the words a game's tiers
 * are named from unless it declares an override.
 *
 * `Unreasonable` is deliberately **not** in it: it is not a rung of this scale
 * but a promise about one, reserved by the `engine-difficulty` spec for a tier whose
 * boards can require Search and forbidden elsewhere. {@link tierNames} appends
 * it on request, which is why that request is a declared fact about the top
 * rung rather than a position.
 */
const TIER_SCALE = ["Easy", "Normal", "Tricky", "Hard", "Extreme"] as const;

/** The one tier name that promises a board may need Search. */
const SEARCH_TIER = "Unreasonable";

/**
 * The conventional names for a game with `count` tiers: the first `count` of
 * {@link TIER_SCALE}, with the last replaced by `"Unreasonable"` when the
 * game's top rung can require Search.
 *
 * ```
 *   tierNames(2)                    Easy · Normal
 *   tierNames(2, { search: true })  Easy · Unreasonable
 *   tierNames(4)                    Easy · Normal · Tricky · Hard
 *   tierNames(4, { search: true })  Easy · Normal · Tricky · Unreasonable
 *   tierNames(6, { search: true })  Easy · Normal · Tricky · Hard · Extreme · Unreasonable
 * ```
 *
 * **Why positional.** Deriving the name from the position makes it a bijection
 * — "Tricky" is the third rung everywhere it appears — which is the only
 * property that makes a tier name worth reading across a collection, and it
 * spares a new game from inventing names for its levels (an owner decision:
 * convention over configuration).
 *
 * **`search` is about the rung, never the count.** A two-tier game whose harder
 * rung backtracks is `Easy · Unreasonable`; a six-tier game whose top rung is a
 * bounded tactic never earns the word. Getting this from the position instead
 * would publish the promise `features.md` § "Difficulty" makes to players and
 * break it.
 *
 * **Override by writing the array instead**, and say why in the change. No game
 * does, and `difficulty-contract.test.ts` holds every tier list to this scale.
 */
export function tierNames(count: number, opts?: { search?: boolean }): string[] {
  const room = TIER_SCALE.length + (opts?.search ? 1 : 0);
  if (!Number.isInteger(count) || count < 2 || count > room) {
    // Loud rather than short: a silently-truncated list would give the game
    // fewer tier names than tiers, and every cross-game guard iterates the
    // names. Widen TIER_SCALE deliberately if a game ever needs a seventh rung.
    throw new RangeError(
      `tierNames: ${count} tiers is outside the scale (2..${room}${
        opts?.search ? " with search" : ""
      })`,
    );
  }
  const named = TIER_SCALE.slice(0, opts?.search ? count - 1 : count);
  return opts?.search ? [...named, SEARCH_TIER] : [...named];
}

/** Bind a contract to one board, for the closure-shaped helpers below. */
export function cappedSolveFor<Params>(
  contract: DifficultyContract<Params>,
  p: Params,
  desc: string,
): CappedSolve {
  return (cap) => contract.solveAtCap(p, desc, cap);
}

/**
 * The refusal for a size none of whose boards needs the tier asked for, as a
 * game's `validateParams` returns it when a board is to be dealt:
 * `noSuchTier("3x3 puzzle", "Tricky")`. `what` names the boards the way the
 * game's menu does, with whatever else about them makes the tier absent.
 */
export function noSuchTier(what: string, tier: string): string {
  return `No ${what} is ${tier}.`;
}

/**
 * The refusal for a size whose boards at the tier exist and are found too
 * seldom to wait for: `tooRareToDeal("maps of 8 regions", "Normal")`. `what`
 * is plural. Never {@link noSuchTier} for one of these: the board exists.
 */
export function tooRareToDeal(what: string, tier: string): string {
  return `${tier} ${what} are too rare to deal.`;
}

/**
 * What a player is told when a generator ran its retry budget out. It cannot
 * know whether the tier is rare at this size or absent, so it says both.
 * `tier` is `null` for a game without tiers.
 */
export function dealGaveUp(tier: string | null): string {
  const what = tier === null ? "puzzle" : `${tier} puzzle`;
  return `No ${what} of this type was found. It may be too rare to deal, or there may be none: try again, or choose another type.`;
}

/**
 * Does this board genuinely need tier `tier` — solvable there, and *not* at the
 * tier below it?
 *
 * This is the generator-acceptance rule that makes a tier mean what it says.
 *
 * **It takes a closure, not a `Game`.** A generator is where this rule belongs,
 * and a generator cannot reach the contract on its own `Game` — `index.ts`
 * imports `generator.ts`, so the call would close an import cycle. Closing over
 * the game's own solver has no such problem and needs no new module.
 *
 * **It asks the cheap question first.** For `tier > 0` it solves at `tier - 1`
 * before `tier`, so a board the easier ladder already cracks is rejected
 * without ever paying for the deeper solve — and a generator that retries in a
 * loop pays the cheap half far more often than the expensive one. That ordering
 * is not a micro-optimization: it measured making Clusters' whole generator
 * *faster than it had been before it had tiers* (10×10 Tricky worst case
 * 25.0 s → 10.9 s). It also leaves a game free to
 * answer both questions from a single fixpoint if its tiers are nested rungs of
 * one — this helper never dictates how many passes a verdict costs, only which
 * question is asked first.
 *
 * The easiest tier has nothing below it, so there it means "solvable at all".
 */
export function solvableAtExactlyTier(solve: CappedSolve, tier: number): boolean {
  if (tier > 0 && solve(tier - 1) === "solved") return false;
  return solve(tier) === "solved";
}

/**
 * The lowest cap at which this board solves, or `null` if no cap up to
 * `tierCount - 1` does. Every solver is monotone in its cap
 * (`difficulty-contract.test.ts`), so every cap from there up solves it too.
 */
export function lowestSolvingCap(solve: CappedSolve, tierCount: number): number | null {
  for (let cap = 0; cap < tierCount; cap++) {
    if (solve(cap) === "solved") return cap;
  }
  return null;
}
