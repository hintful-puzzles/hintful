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
  type CandidatePlanPrefs,
  keepCandidateHintTrack,
  type Mark,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import { type DupReason, runCandidatePlan } from "../../engine/candidate-plan.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Premise } from "../../engine/hint-text.ts";
import type { Narration } from "../../engine/hint-words.ts";
import type { CellRegion } from "../../engine/latin-hint.ts";
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
    if (m.kind === "pencilAdd") return { type: "pencilAdd", marks: [...m.marks] };
    // `solve`, and the two "clear this square" moves, are Rome's own.
    return null;
  },
  strike: (marks) => ({ kind: "pencilStrike", marks }),
  add: (marks) => ({ kind: "pencilAdd", marks }),
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
  | { kind: "regionsFull" }
  | { kind: "hiddenSingle"; n: number; region: readonly number[] };

const cellsOf = (w: number, cells: readonly number[]): Point[] =>
  cells.map((i) => ({ x: i % w, y: (i / w) | 0 }));

/** The sentence a placement speaks, at the placed square `m`. What it marks is
 * what it names: the square ringed, and the area a hidden single reasons over
 * striped (docs/games/hints.md § "Bind the words to the marks"). */
function narrate(reason: RomeHintReason | DupReason, m: Mark, w: number): Narration {
  switch (reason.kind) {
    case "single":
      return say.single(m, m.n);
    case "regionsFull":
      return say.regionsFull(m, m.n);
    case "hiddenSingle":
      return say.hiddenSingle(cellsOf(w, reason.region), m, reason.n);
    default:
      throw new Error(`a ${reason.kind} deduction strikes`);
  }
}

/** A strike's premise, which the walk concludes with the move it makes.
 * `struck` is the struck arrows, all in one square except for a pair's.
 * `areaOf` is the area a square belongs to. */
function premise(
  reason: RomeHintReason | DupReason,
  struck: readonly Mark[],
  w: number,
  areaOf: (x: number, y: number) => readonly number[],
): Premise {
  const at = struck[0];
  const n = at.n;
  switch (reason.kind) {
    case "dup": {
      const placed = { x: reason.px, y: reason.py };
      const area = cellsOf(w, areaOf(reason.px, reason.py));
      return { premise: say.dup(area, placed, reason.n), where: say.dupWhere };
    }
    // The walk back to this square *is* the premise, and its order is the fact
    // the marks would otherwise lose (docs/games/hints.md § "Number the chain").
    case "loop": {
      const path = reason.path.map((i, k) => ({
        x: i % w,
        y: (i / w) | 0,
        order: k + 1,
      }));
      return { premise: say.loop(path, n) };
    }
    case "onlyHome":
      return {
        premise: say.onlyHome(cellsOf(w, reason.region), at, [...reason.only]),
        struck: say.onlyHomeStruck,
      };
    case "reach":
      return {
        premise: say.reach(cellsOf(w, reason.group), at),
        struck: say.reachStruck,
      };
    case "opposite":
      return {
        premise: say.opposite(
          { x: reason.px, y: reason.py },
          cellsOf(w, areaOf(reason.px, reason.py)),
          n,
          axisOf(n),
        ),
        named: true,
      };
    case "pair":
      return {
        premise: say.pair(cellsOf(w, reason.pair), cellsOf(w, reason.region), [
          ...reason.values,
        ]),
        where: say.pairWhere,
      };
    default:
      throw new Error(`a ${reason.kind} deduction places`);
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
  { autoClean, reading }: CandidatePlanPrefs,
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
    reading,
    label: "rome hint plan",
    // Every rung, not the puzzle's own tier — which a `RomeState` does not
    // carry anyway. Upstream's gating is by ladder position, so a rung above a
    // board's tier can only run once everything easier is exhausted, which on a
    // board solvable at its tier never happens before it is finished.
    // `solutionGrid` reads the ladder the same way.
    record: () => recordRomeDeductions(boardOf(state, grid), DIFFCOUNT),
    regionsOf,
    singleReason: (n, why) => {
      switch (why.kind) {
        case "naked":
          return { kind: "single" };
        case "regionsFull":
          return { kind: "regionsFull" };
        case "hidden":
          return { kind: "hiddenSingle", n, region: Array.from(why.region.cells) };
      }
    },
    placeWords: (m, reason) => ({ words: narrate(reason, m, w) }),
    strikeWords: (struck, reason) => premise(reason, struck, w, areaOf),
    conclude: say.conclude,
    // Every deduction here is about one square, so a firing's strikes stay
    // together; only the `pair` rung reaches several, and its sentence speaks
    // for the whole area at once.
    strikeAxis: (op) => (op.reason.kind === "pair" ? null : op.y * w + op.x),
    notes: {
      populate: say.populate,
      cleanObvious: say.cleanObvious,
      note: (at, values, every) => say.note(at, values, every),
    },
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
