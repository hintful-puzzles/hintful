/**
 * Rome's explained hint: the shared candidate-elimination plan, walked over
 * arrows instead of digits.
 *
 * ## What this game was picked to press on, and what it found
 *
 * Rome is the collection's only candidate game whose candidates are **not
 * values** (its notes are direction bits) and whose uniqueness regions come
 * from a **`Dsf`** rather than from `y * w + x` arithmetic. Three of the four
 * things that were expected to chafe did not:
 *
 * - **The region adapter is six lines** (`romeRegions`), and
 *   `CellRegion.holdsEvery` turned out to be `size === 4` — which is
 *   `find4Position`'s own guard, written years earlier and independently. A
 *   region of four squares must hold all four arrows; a smaller one only
 *   forbids repeats. That is exactly the distinction the engine's flag draws,
 *   so the dsf needed translating, not reasoning about.
 * - **`NoteEncoding` fit a game whose values are bits**, near-identically:
 *   `bit` is a lookup and `values` is 4. What it was *missing* was a way to say
 *   what a blank square's full note set is, because Rome's is bounded by the
 *   grid edge and so differs square to square; that is now `NoteEncoding.all`.
 * - **The dsf-reachability rungs needed no rung slot of their own.** `loops`,
 *   `expand` and `find-4-position` all write to `pencil`, so all three are
 *   ordinary candidate eliminations whose *reason* happens to be a fact about a
 *   graph. Reachability is a premise, not a plan shape, and `plan.rungs` is
 *   unused here.
 *
 * ## Solving from the player's board, and why that is sound
 *
 * `candidateHint` refuses on any mistake, and Rome's `findMistakes` flags both
 * a placed arrow the solution disagrees with **and** a square whose marks have
 * crossed out its answer. So wherever this runs, every placed arrow is right
 * and every square's marks still hold its answer — which is what makes reading
 * a naked single off the player's own notes sound (docs/games/hints.md
 * § "Deduce from the notes when the mistake check vouches for them").
 */

import {
  type CandidateHighlights,
  type CandidateMoveAdapter,
  keepCandidateHintTrack,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import {
  type DupReason,
  runCandidatePlan,
  valuesOf,
} from "../../engine/candidate-plan.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { CellRegion } from "../../engine/latin-hint.ts";
import type { OrderedCell } from "../../engine/overlay-sidecar.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import { type RomeHintOp, type RomeReason, recordRomeDeductions } from "./solver.ts";
import {
  DIFFCOUNT,
  DIR_COUNT,
  dirBit,
  dirValue,
  FM_FIXED,
  FM_GOAL,
  placedValues,
  type RomeBoard,
  type RomeDir,
  type RomeMove,
  type RomeState,
  romeNotes,
  romeRegions,
} from "./state.ts";

/**
 * Rome's dialect of the three canonical candidate moves: its own are keyed by
 * `kind` rather than `type`, and its arrows are bits rather than values.
 *
 * `place` is supplied because the default builds a `{ type: "set" }` Rome
 * cannot execute; it ignores `autoElim` because Rome has no auto-pencil
 * preference for it to read.
 */
export const romeCandidateMoves: CandidateMoveAdapter<RomeMove> = {
  read: (m) => {
    if (m.kind === "place" && m.dir !== null)
      return { type: "set", x: m.x, y: m.y, n: dirValue(m.dir), pencil: false };
    if (m.kind === "pencil" && m.dir !== null)
      return { type: "set", x: m.x, y: m.y, n: dirValue(m.dir), pencil: true };
    if (m.kind === "pencilAll") return { type: "pencilAll" };
    if (m.kind === "pencilStrike") return { type: "pencilStrike", marks: [...m.marks] };
    // `solve`, and the two "clear this square" moves, are Rome's own.
    return null;
  },
  strike: (marks) => ({ kind: "pencilStrike", marks }),
  populate: () => ({ kind: "pencilAll" }),
  place: (x, y, n) => ({ kind: "place", x, y, dir: dirBit(n) as RomeDir }),
  bit: dirBit,
};

/** Rome's hint highlights are the shared candidate shape: the evidence to
 * shade, the squares acted on, and the marks struck. */
export type RomeHint = CandidateHighlights;

/**
 * Why the plan's next step is forced: everything the solver records, plus the
 * one arm the plan synthesizes.
 *
 * The solver only ever *places* a naked single, so `hiddenSingle` is never
 * recorded — but the plan may reach a square before it has taken every strike
 * the solver took, and then the same placement is forced by its area instead.
 * Re-deriving which it is from the working board is the shared classifier's
 * whole job (docs/games/hints.md § "Re-derive a placement's why").
 */
type RomeHintReason =
  | RomeReason
  | { kind: "hiddenSingle"; n: number; region: readonly number[] };

const cellsOf = (w: number, cells: readonly number[]): Point[] =>
  cells.map((i) => ({ x: i % w, y: (i / w) | 0 }));

/** What a reason marks: the particular squares it rests on, outlined, and the
 * area or group its sentence is about ("its area", "the striped group"),
 * hatched (docs/games/hints.md § "Hatch the line the sentence names").
 * `areaOf` is the outlined area a square belongs to. */
function marks(
  reason: RomeHintReason | DupReason,
  w: number,
  areaOf: (x: number, y: number) => readonly number[],
): { area: OrderedCell[]; hatch?: Point[] } {
  switch (reason.kind) {
    case "single":
      return { area: [] };
    case "hiddenSingle":
    case "onlyHome":
      return { area: [], hatch: cellsOf(w, reason.region) };
    case "dup":
      return {
        area: [{ x: reason.px, y: reason.py }],
        hatch: cellsOf(w, areaOf(reason.px, reason.py)),
      };
    // The walk back to this square *is* the premise, and its order is the fact
    // the marks would otherwise lose (docs/games/hints.md § "Number the chain").
    case "loop":
      return {
        area: reason.path.map((i, k) => ({ x: i % w, y: (i / w) | 0, order: k + 1 })),
      };
    case "reach":
      return { area: [], hatch: cellsOf(w, reason.group) };
    case "opposite":
      return { area: [{ x: reason.px, y: reason.py }] };
    case "pair":
      return { area: cellsOf(w, reason.pair), hatch: cellsOf(w, reason.region) };
  }
}

/** The sentence a reason speaks. `ns` is the values the step acts on. */
function narrate(reason: RomeHintReason | DupReason, ns: number[]): string {
  switch (reason.kind) {
    case "single":
      return say.single(ns[0]);
    case "hiddenSingle":
      return say.hiddenSingle(reason.n);
    case "dup":
      return say.dup(reason.n);
    case "loop":
      return say.loop(ns[0]);
    case "onlyHome":
      return say.onlyHome([...reason.only]);
    case "reach":
      return say.reach();
    case "opposite":
      return say.opposite(ns[0], axisOf(ns[0]));
    case "pair":
      return say.pair([...reason.values]);
  }
}

/** The two arrows a square restricted to one axis may take — the premise an
 * `opposite` firing rests on, derived from the struck direction rather than
 * carried, because the rung only ever fires on an exact axis pair. */
function axisOf(n: number): number[] {
  return n <= 2 ? [1, 2] : [3, 4];
}

/** The board the recording solver runs on: the puzzle's clues and goals, plus
 * every arrow the plan has placed on its working grid so far. */
function boardOf(state: RomeState, grid: Uint8Array): RomeBoard {
  const { w, h, regions } = state;
  const out: RomeBoard = {
    w,
    h,
    regions,
    grid: new Int32Array(grid.length),
    pencil: new Int32Array(grid.length),
  };
  for (let i = 0; i < grid.length; i++) {
    out.grid[i] =
      (state.grid[i] & (FM_FIXED | FM_GOAL)) |
      (grid[i] > 0 && grid[i] <= DIR_COUNT ? dirBit(grid[i]) : 0);
  }
  return out;
}

export function buildSteps(
  state: RomeState,
  autoClean: boolean,
): HintStep<RomeMove, RomeHint>[] {
  const { w, h } = state;
  const steps: HintStep<RomeMove, RomeHint>[] = [];
  const grid = placedValues(state);
  const pencil = Int32Array.from(state.pencil);
  const regionsOf = romeRegions(state);
  const areaOf = (x: number, y: number): readonly number[] =>
    Array.from(regionsOf(x, y)[0].cells);
  const enc = romeNotes(w, h);

  runCandidatePlan<RomeMove, RomeHint, RomeHintOp, RomeHintReason, CellRegion>({
    w,
    steps,
    grid,
    pencil,
    enc,
    moves: romeCandidateMoves,
    autoClean,
    label: "rome hint plan",
    // Every rung, not the puzzle's own tier — which a `RomeState` does not
    // carry anyway. Upstream's gating is by ladder position, so a rung above a
    // board's tier can only run once everything easier is exhausted, which on a
    // board solvable at its tier never happens before it is finished.
    // `solutionGrid` reads the ladder the same way.
    record: () => recordRomeDeductions(boardOf(state, grid), DIFFCOUNT),
    regionsOf,
    singleReason: (n, why) =>
      why.kind === "naked"
        ? { kind: "single" }
        : { kind: "hiddenSingle", n, region: Array.from(why.region.cells) },
    placeWords: (m, reason) => ({
      explanation: narrate(reason, [m.n]),
      ...marks(reason, w, areaOf),
    }),
    strikeWords: (struck, reason) => ({
      explanation: narrate(reason, valuesOf(struck)),
      ...marks(reason, w, areaOf),
    }),
    // Every deduction here is about one square, so a firing's strikes stay
    // together; only the `pair` rung reaches several, and its sentence speaks
    // for the whole area at once.
    strikeAxis: (op) => (op.reason.kind === "pair" ? null : op.y * w + op.x),
    notes: { populate: say.populate, cleanObvious: say.cleanObvious },
  });
  return steps;
}

/** Classify a player move against the displayed step (shared bookkeeping, in
 * Rome's move dialect). */
export function hintKeepTrack(
  m: RomeMove,
  step: HintStep<RomeMove, RomeHint>,
  state: RomeState,
): HintTrackVerdict {
  return keepCandidateHintTrack(m, step, state.pencil, state.w, romeCandidateMoves);
}

/** Re-validate a stored step against the current board before display. */
export function refreshHintStep(
  step: HintStep<RomeMove, RomeHint>,
  state: RomeState,
): HintStep<RomeMove, RomeHint> | null {
  return refreshCandidateHintStep(
    step,
    placedValues(state),
    state.pencil,
    state.w,
    romeCandidateMoves,
  );
}
