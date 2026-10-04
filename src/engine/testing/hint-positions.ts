/**
 * The positions a hint's sentences are tested on: found by one scan, pinned as
 * inputs, and found again by one command.
 *
 * A hint test needs a board on which each sentence, rung or mark fires. A pin
 * is the right shape for it (an input, never a seed: AGENTS.md § "Method"),
 * and the costly one to keep, because the scan that found it used to be
 * written for the occasion and deleted. {@link describeHintPins} keeps the
 * scan beside the pins: a game names its kinds, each the sentence a hint opens
 * with or a predicate over that step, pins one position a kind, and a pin that
 * stops firing fails with the command that scans again.
 *
 * The scan walks hint-guided play as `hint-resume.test.ts` does, taking the
 * plan's first step and asking again, so a position it reports is one a player
 * following hints reaches. Its report says how many of the positions walked
 * each kind held on, which is the power argument a pin owes: a kind that held
 * on 3 of 1,400 is one generator change from holding on none.
 *
 * Dev/test-only; never imported by production code.
 */
import { describe, expect, it } from "vitest";
import type { Game, HintStep } from "../game.ts";
import { randomNew } from "../random/index.ts";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env;
/** Set to scan again instead of testing the pins. */
const SCANNING = Boolean(env?.["HINT_SCAN"]);

/** A position: a board as `params:desc`, and the moves played on it. A bare
 * string is a board with no moves played. The moves may be their JSON, which
 * is how the scan writes more than a few: a formatter leaves a string on one
 * line, where the same moves as a literal run to hundreds. */
export type HintPin<Move> =
  | string
  | { readonly id: string; readonly moves: readonly Move[] | string };

/** A pin as the source text the scan reports. */
function pinSource<M>(pin: HintPin<M>): string {
  if (typeof pin === "string") return JSON.stringify(pin);
  const moves = JSON.stringify(pin.moves);
  const written = moves.length > 80 ? `'${moves}'` : moves;
  return `{ id: ${JSON.stringify(pin.id)}, moves: ${written} }`;
}

/** What makes a step of a kind: the sentence it says, or anything else about
 * the step and the board it is asked from. */
export type HintKind<State, Move, Highlights> =
  | RegExp
  | ((step: HintStep<Move, Highlights>, state: State) => boolean);

function isOfKind<S, M, H>(
  kind: HintKind<S, M, H>,
  step: HintStep<M, H>,
  state: S,
): boolean {
  return kind instanceof RegExp ? kind.test(step.explanation) : kind(step, state);
}

export interface HintPositionScan<
  Params,
  State,
  Move,
  Ui,
  DrawState,
  Highlights,
  Kind extends string,
> {
  // biome-ignore lint/suspicious/noExplicitAny: the mistake type plays no part here.
  game: Game<Params, State, Move, Ui, DrawState, any, Highlights>;
  /** What to find a position for: whether the step a hint opens with, on the
   * board it is asked from, is of this kind. */
  kinds: Record<Kind, HintKind<State, Move, Highlights>>;
  /** The boards the scan deals: every seed at each of these. */
  params: readonly Params[];
  /** How many seeds a params; 12 when omitted. */
  seeds?: number;
  /** The most hints followed on one board; 400 when omitted. */
  maxSteps?: number;
  /** A position's own desc, for a game whose board mid-game is one a desc can
   * write. The scan then reports a position as a board, with no moves. */
  descOf?: (state: State) => string;
  /** Moves the scan plays on a fresh board before it asks for a hint: a
   * mark-all, an opening click. A pin keeps them with the rest of its moves. */
  opening?: (state: State) => readonly Move[];
  /** The `Ui` a hint is asked under, where the kinds want one that `newUi`
   * does not give: a candidate reading. */
  ui?: (state: State) => Ui;
  /** A second line of play on every board, for kinds that following the hint
   * never meets: a hint keeps to winning lines, so the sentences about a
   * losing move are spoken only off them. It names the move played at each
   * turn, given the one the hint offers (null where it refuses), and ends the
   * line with null. */
  stray?: (state: State, turn: number, hinted: Move | null) => Move | null;
}

interface HintPositionReport<Move, Kind extends string> {
  /** Positions a hint was asked from. */
  walked: number;
  boards: number;
  kinds: Record<Kind, { held: number; pin: HintPin<Move> | null; depth: number }>;
}

/** The board a pin names, and the plan a hint gives there. */
function loadPosition<P, S, M, U, D, H, K extends string>(
  scan: HintPositionScan<P, S, M, U, D, H, K>,
  id: string,
  moves: readonly M[],
) {
  const { game } = scan;
  const colon = id.indexOf(":");
  const params = game.decodeParams(id.slice(0, colon));
  let state = game.newState(params, id.slice(colon + 1));
  for (const m of moves) state = game.executeMove(state, m);
  const ui = scan.ui?.(state) ?? game.newUi(state);
  const plan = game.hint?.(state, undefined, ui) ?? null;
  const step = plan?.ok ? (plan.steps[0] as HintStep<M, H>) : null;
  return { state, plan, step };
}

/** Walk hint-guided play on the scan's boards, and say how many positions each
 * kind held on and which of them took the fewest moves to reach. */
function scanHintPositions<P, S, M, U, D, H, K extends string>(
  scan: HintPositionScan<P, S, M, U, D, H, K>,
): HintPositionReport<M, K> {
  const { game, descOf } = scan;
  const hint = game.hint?.bind(game);
  if (!hint) throw new Error(`${game.id} has no hint to scan`);
  const names = Object.keys(scan.kinds) as K[];
  const kinds = Object.fromEntries(
    names.map((k) => [k, { held: 0, pin: null, depth: 0 }]),
  ) as HintPositionReport<M, K>["kinds"];
  let walked = 0;
  let boards = 0;
  for (const params of scan.params) {
    const encoded = game.encodeParams(params, true);
    for (let n = 0; n < (scan.seeds ?? 12); n++) {
      const { desc } = game.newDesc(params, randomNew(`hint-scan-${n}`));
      const id = `${encoded}:${desc}`;
      boards++;
      // One line of play following the hint, and one the game steers.
      for (const stray of scan.stray ? [null, scan.stray] : [null]) {
        let state = game.newState(params, desc);
        const moves: M[] = [...(scan.opening?.(state) ?? [])];
        for (const m of moves) state = game.executeMove(state, m);
        const ui = scan.ui?.(state) ?? game.newUi(state);
        for (let k = 0; k < (scan.maxSteps ?? 400); k++) {
          if (game.status(state) !== "ongoing") break;
          // With no `aux`, as a pin is loaded: a `params:desc` carries none.
          const plan = hint(state, undefined, ui);
          const step = plan.ok ? (plan.steps[0] as HintStep<M, H>) : null;
          if (step) walked++;
          for (const name of step ? names : []) {
            if (!step || !isOfKind(scan.kinds[name], step, state)) continue;
            const kind = kinds[name];
            kind.held++;
            // The fewest moves of any position holding the kind: the shortest
            // pin to keep, and the least play for a later change to disturb.
            if (kind.pin !== null && moves.length >= kind.depth) continue;
            kind.depth = moves.length;
            kind.pin = descOf
              ? `${encoded}:${descOf(state)}`
              : moves.length > 0
                ? { id, moves: [...moves] }
                : id;
          }
          const next = stray
            ? stray(state, k, step?.move ?? null)
            : (step?.move ?? null);
          if (next === null) break;
          state = game.executeMove(state, next);
          moves.push(next);
        }
      }
    }
  }
  return { walked, boards, kinds };
}

/** The report as a `pins` literal to paste, each pin under the count it rests
 * on. */
function pinsLiteral<M, K extends string>(
  id: string,
  report: HintPositionReport<M, K>,
): string {
  const lines = [
    `${id}: ${report.walked} positions walked on ${report.boards} boards.`,
    "",
  ];
  for (const [name, kind] of Object.entries(report.kinds) as [
    K,
    HintPositionReport<M, K>["kinds"][K],
  ][]) {
    lines.push(`  /** Held on ${kind.held} of ${report.walked} positions walked. */`);
    lines.push(
      kind.pin === null
        ? `  // ${name}: not found`
        : `  ${name}: ${pinSource(kind.pin)},`,
    );
  }
  return lines.join("\n");
}

/** A pinned position, loaded: the board, and the plan a hint gives there. */
export interface PinnedPosition<State, Move, Highlights> {
  /** The pin, as `renderScenario` takes it. */
  id: string;
  moves: readonly Move[];
  state: State;
  /** The step the plan opens with, which is of the pin's kind. */
  step: HintStep<Move, Highlights>;
  steps: readonly HintStep<Move, Highlights>[];
}

/**
 * Declare a game's pinned hint positions, one a kind, and return the loader a
 * test reads them through.
 *
 * It declares one test: every pin's hint opens with a step of the pin's kind.
 * Run with `HINT_SCAN=1`, that test scans instead and fails with the report,
 * as pins to paste. The types require a pin for every kind, so a kind the scan
 * cannot reach is not a kind here: build its board by hand in the game's test.
 */
export function describeHintPins<P, S, M, U, D, H, K extends string>(
  spec: HintPositionScan<P, S, M, U, D, H, K> & { pins: Record<K, HintPin<M>> },
): (kind: K) => PinnedPosition<S, M, H> {
  const { game } = spec;
  const again = (): string => {
    const path = expect.getState().testPath ?? "<this file>";
    return `HINT_SCAN=1 npx vitest run ${path.slice(path.indexOf("src/"))}`;
  };

  // A pin is loaded once: its hint may be a search, and every test that reads
  // it would otherwise pay for the plan again.
  const loaded = new Map<K, PinnedPosition<S, M, H>>();
  const at = (kind: K): PinnedPosition<S, M, H> => {
    const held = loaded.get(kind);
    if (held) return held;
    const pin = spec.pins[kind];
    const id = typeof pin === "string" ? pin : pin.id;
    const played = typeof pin === "string" ? [] : pin.moves;
    const moves: readonly M[] =
      typeof played === "string" ? (JSON.parse(played) as M[]) : played;
    const { state, plan, step } = loadPosition(spec, id, moves);
    if (!plan?.ok || !step || !isOfKind(spec.kinds[kind], step, state)) {
      const said = plan?.ok
        ? `"${plan.steps[0].explanation}"`
        : (plan?.error ?? "none");
      throw new Error(
        `${game.id}: the position pinned for "${kind}" no longer fires it (the hint there: ${said}). Find one that does:\n  ${again()}`,
      );
    }
    const position = {
      id,
      moves,
      state,
      step,
      steps: plan.steps as readonly HintStep<M, H>[],
    };
    loaded.set(kind, position);
    return position;
  };

  describe(`${game.id}: pinned hint positions`, () => {
    it.skipIf(SCANNING)("every kind's pin opens with a step of its kind", () => {
      const names = Object.keys(spec.kinds) as K[];
      // Vacuity: a spec with no kinds would pin nothing and pass.
      expect(names.length).toBeGreaterThan(0);
      for (const kind of names) at(kind);
    });

    it.runIf(SCANNING)("scan (HINT_SCAN): the report is the failure", () => {
      throw new Error(pinsLiteral(game.id, scanHintPositions(spec)));
    });
  });

  return at;
}
