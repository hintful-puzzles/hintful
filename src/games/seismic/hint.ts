/**
 * Seismic's explained hint: the shared candidate walk (`runCandidatePlan`), with
 * Seismic's reach and its own rungs.
 *
 * **Deduced from the player's notes, not from the givens alone.** A candidate game
 * normally re-solves from the placed numbers and only compares the result with the
 * notes, because a note can be wrong (docs/games/hints.md § "The recorder and the
 * soundness boundary"). Seismic's `findMistakes` refuses the hint on any note that
 * has crossed out its cell's answer, so wherever this runs every cell's notes still
 * hold that answer, and a single or a starved area read off them is as sound as one
 * read off the solver's own candidates. So Seismic records nothing: its rungs read
 * the candidates the walk shows (`RungContext.shown`), which is also the deduction
 * the player can check against their screen.
 *
 * **Parallel to the solver's rungs, and held to them.** Each finder is the
 * one-firing form of a rung in `solver.ts`: the walk's naked singles are `marks`,
 * {@link hiddenSingles} is `areas` together with the single it leaves, and
 * {@link starves} is `attempt`. A rung sweeps the whole board and applies all it
 * finds, while a step is one firing, and the rules are a few lines each, so
 * re-deriving them costs less than threading an early return through all three.
 * The generator never calls this file, so no board changes. `seismic-hint.test.ts`
 * holds {@link starves} to `placeNumber` and `regionsViable`'s own verdicts, and
 * every plan to finishing its board.
 */

import {
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidatePlanPrefs,
  keepCandidateHintTrack,
  type NoteEncoding,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import {
  type CandidateRung,
  type Firing,
  runCandidatePlan,
} from "../../engine/candidate-plan.ts";
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { candidateConclusions } from "../../engine/hint-text.ts";
import type { CellRegion } from "../../engine/latin-hint.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import {
  areaBits,
  MODE_TECTONIC,
  numBit,
  type SeismicBoard,
  type SeismicMove,
  type SeismicState,
} from "./state.ts";

export type SeismicHint = CandidateHighlights;

/** Why a number is placed or ruled out. */
type SeismicReason =
  /** The cell is a whole area. */
  | { kind: "singleton" }
  /** Its notes are down to one. */
  | { kind: "single" }
  /** It has no notes, and every other number is already within reach. */
  | { kind: "regionsFull" }
  /** No other cell of its area can hold the number. */
  | { kind: "hidden"; area: readonly number[] }
  /** Every home the area has left for `n` is within reach of the struck cells. */
  | { kind: "starve"; n: number; area: readonly number[] };

/** Seismic's moves already carry the shared names; only the note bit differs, and
 * a placement bakes in no auto-pencil, which Seismic does not have. */
const seismicCandidateMoves: CandidateMoveAdapter<SeismicMove> = {
  read: (m) => (m.type === "solve" ? null : m),
  strike: (marks) => ({ type: "pencilStrike", marks }),
  place: (x, y, n) => ({ type: "set", x, y, n, pencil: false }),
  bit: numBit,
};

/** A board whose notes may be the candidates the walk shows rather than the
 * player's own. */
type NotesView = Omit<SeismicBoard, "pencil"> & { readonly pencil: ArrayLike<number> };

/** An area left with no home for `n` by an `n` in any of `targets`. */
export interface Starve {
  n: number;
  area: readonly number[];
  targets: number[];
}

const cellOf = (b: { w: number }, i: number): Point => ({
  x: i % b.w,
  y: (i / b.w) | 0,
});

/**
 * Would an `n` at `i` rule out an `n` at `j`? `placeNumber`'s rule, asked of one
 * pair: the same area, or the mode's keep-apart reach (`n` cells along a row or
 * column in Seismic, the eight neighbors in Tectonic).
 */
function clashes(b: NotesView, i: number, j: number, n: number): boolean {
  if (i === j) return false;
  if (b.dsf.equivalent(i, j)) return true;
  const dx = Math.abs((i % b.w) - (j % b.w));
  const dy = Math.abs(((i / b.w) | 0) - ((j / b.w) | 0));
  return b.mode === MODE_TECTONIC
    ? dx <= 1 && dy <= 1
    : (dx === 0 && dy <= n) || (dy === 0 && dx <= n);
}

/**
 * The player's board, as the plan works on it. A placed cell's notes read as the
 * number it holds, because the rules read a placed cell's candidates that way and
 * whatever notes the player left under a number mean nothing.
 */
export function workingBoard(state: SeismicState): SeismicBoard {
  const { w, h, mode, dsf, grid } = state;
  const pencil = state.pencil.slice();
  for (let i = 0; i < grid.length; i++)
    pencil[i] = grid[i] ? numBit(grid[i]) : pencil[i] & areaBits(dsf.size(i));
  return { w, h, mode, dsf, grid: grid.slice(), flags: state.flags.slice(), pencil };
}

/** Each area's cells, areas in the order of their first cell. */
export function areasOf(b: Pick<SeismicBoard, "dsf" | "grid">): number[][] {
  const byRoot = new Map<number, number[]>();
  for (let i = 0; i < b.grid.length; i++) {
    const root = b.dsf.canonify(i);
    const cells = byRoot.get(root);
    if (cells) cells.push(i);
    else byRoot.set(root, [i]);
  }
  return [...byRoot.values()];
}

/** The empty cells of `area` still noting `n`, or `null` when `n` is already
 * placed there. */
function homesOf(b: NotesView, area: readonly number[], n: number): number[] | null {
  if (area.some((j) => b.grid[j] === n)) return null;
  return area.filter((j) => b.grid[j] === 0 && (b.pencil[j] & numBit(n)) !== 0);
}

/** Every number with one home left in its area, as the cell and the number. A
 * home whose notes are down to that one number is a naked single instead, as
 * the shared classifier (`classifyPlacementInRegions`) calls it: the cell alone
 * says so, without the area. */
export function hiddenSingles(
  b: NotesView,
  areas: readonly (readonly number[])[],
): { cell: number; n: number; area: readonly number[] }[] {
  const out: { cell: number; n: number; area: readonly number[] }[] = [];
  for (const area of areas)
    for (let n = 1; n <= area.length; n++) {
      const homes = homesOf(b, area, n);
      if (homes?.length === 1 && b.pencil[homes[0]] !== numBit(n))
        out.push({ cell: homes[0], n, area });
    }
  return out;
}

/**
 * **The trial rung, as the deduction it always comes to.** `solverAttempt` places
 * a candidate, lets `placeNumber` strike it from every cell it clashes with, and
 * rejects it when some area has no home left for a number it owes. An `n` placed
 * at `c` takes `n` from other cells and other numbers from `c` alone, so the area
 * left short is either `c`'s own, missing a number only `c` could hold — a hidden
 * single — or another area that has lost its last `n`.
 *
 * That second case is this finder: an area whose every remaining home for `n`
 * clashes with `c`. It is one placement and one look at one area, so it is a
 * **Check** (docs/games/solver-and-generator.md § "Check, Tactic, Search"), and
 * every cell that clashes with all of those homes is ruled out by the same fact,
 * which makes them one firing.
 */
export function* starves(
  b: NotesView,
  areas: readonly (readonly number[])[],
): Generator<Starve> {
  for (const area of areas) {
    for (let n = 1; n <= area.length; n++) {
      const homes = homesOf(b, area, n);
      if (!homes || homes.length === 0) continue;
      const targets: number[] = [];
      for (let c = 0; c < b.grid.length; c++) {
        if (b.grid[c] !== 0 || !(b.pencil[c] & numBit(n))) continue;
        if (b.dsf.equivalent(c, area[0])) continue;
        if (homes.every((h) => clashes(b, c, h, n))) targets.push(c);
      }
      if (targets.length > 0) yield { n, area, targets };
    }
  }
}

type Rung = CandidateRung<SeismicMove, SeismicHint, DeductionRecord, SeismicReason>;
type SeismicFiring = Firing<SeismicMove, SeismicHint, SeismicReason>;

export function buildSteps(
  state: SeismicState,
  { autoClean, reading }: CandidatePlanPrefs,
): HintStep<SeismicMove, SeismicHint>[] {
  const { w, dsf, mode } = state;
  const tectonic = mode === MODE_TECTONIC;
  const grid = state.grid.slice();
  // A placed cell carries no notes on the walk's board, and a note no area of
  // that size can hold has no strike anywhere.
  const pencil = new Int32Array(grid.length);
  for (let i = 0; i < grid.length; i++)
    pencil[i] = grid[i] ? 0 : state.pencil[i] & areaBits(dsf.size(i));
  const board = { ...state, grid };
  const areas = areasOf(board);
  const areaOf = new Array<readonly number[]>(grid.length);
  for (const area of areas) for (const i of area) areaOf[i] = area;
  const view = (shown: ArrayLike<number>): NotesView => ({ ...board, pencil: shown });

  // What an `n` at `i` rules out, `clashes` asked of every cell once.
  const reached = new Map<number, number[]>();
  const reach = (i: number, n: number): number[] => {
    const key = i * 16 + n;
    let cells = reached.get(key);
    if (!cells) {
      cells = [];
      for (let j = 0; j < grid.length; j++) if (clashes(board, i, j, n)) cells.push(j);
      reached.set(key, cells);
    }
    return cells;
  };
  const enc: NoteEncoding = {
    bit: numBit,
    values: 9,
    all: (i) => areaBits(dsf.size(i)),
  };
  const place = (i: number, n: number, reason: SeismicReason): SeismicFiring => [
    { place: { ...cellOf(state, i), n }, reason },
  ];

  /** A blank cell that is a whole area, which can only hold a 1. Needs no notes,
   * so it fires in the opening too. */
  const singletons: Rung = () => {
    const out: SeismicFiring[] = [];
    for (let i = 0; i < grid.length; i++)
      if (grid[i] === 0 && dsf.size(i) === 1)
        out.push(place(i, 1, { kind: "singleton" }));
    return out;
  };
  const hidden: Rung = ({ populated, shown }) =>
    populated
      ? hiddenSingles(view(shown), areas).map(({ cell, n, area }) =>
          place(cell, n, { kind: "hidden", area }),
        )
      : [];
  // Normal's technique, so only once no single is left: an Easy board, which the
  // singles alone certify, is never taught it.
  const starved: Rung = ({ populated, nothingEarlier, shown }) =>
    populated && nothingEarlier
      ? [...starves(view(shown), areas)].map(({ n, area, targets }) => [
          {
            strike: targets.map((c) => ({ ...cellOf(state, c), n })),
            reason: { kind: "starve", n, area },
          },
        ])
      : [];

  const hatch = (area: readonly number[]): Point[] => area.map((j) => cellOf(state, j));
  const steps: HintStep<SeismicMove, SeismicHint>[] = [];
  runCandidatePlan<
    SeismicMove,
    SeismicHint,
    DeductionRecord,
    SeismicReason,
    CellRegion
  >({
    w,
    steps,
    grid,
    pencil,
    enc,
    moves: seismicCandidateMoves,
    autoClean,
    reading,
    label: "seismic hint plan",
    record: () => [],
    regionsOf: (x, y) => [{ cells: areaOf[y * w + x], holdsEvery: true }],
    reach,
    rungs: [singletons, hidden, starved],
    singleReason: (_n, why) =>
      why.kind === "hidden"
        ? { kind: "hidden", area: Array.from(why.region.cells) }
        : why.kind === "naked"
          ? { kind: "single" }
          : { kind: "regionsFull" },
    placeWords: (m, reason) => {
      // A whole-area cell is a 1 however the walk came to it.
      if (dsf.size(m.y * w + m.x) === 1)
        return { explanation: say.singleton, area: [], hatch: [{ x: m.x, y: m.y }] };
      switch (reason.kind) {
        case "single":
          return { explanation: say.naked(m.n), area: [] };
        case "regionsFull":
          return { explanation: say.regionsFull(m.n, tectonic), area: [] };
        case "hidden":
          return { explanation: say.hidden(m.n), area: [], hatch: hatch(reason.area) };
        default:
          throw new Error(`seismic: a ${reason.kind} places nothing`);
      }
    },
    strikeWords: (marks, reason) => {
      switch (reason.kind) {
        case "dup":
          return {
            premise: say.cull(reason.n, tectonic),
            struck: say.culled(reason.n),
            area: [{ x: reason.px, y: reason.py }],
          };
        case "starve": {
          const targets = marks.length;
          return {
            premise: say.starve(reason.n, targets, tectonic),
            struck: say.starved(reason.n, targets),
            area: [],
            hatch: hatch(reason.area),
            // The area's notes are where it can put its `n`: the premise.
            reads: hatch(reason.area),
          };
        }
        default:
          throw new Error(`seismic: a ${reason.kind} strikes nothing`);
      }
    },
    conclude: candidateConclusions({ value: String }),
    notes: {
      populate: say.populate,
      cleanObvious: say.clean(tectonic),
      note: (_cell, values, every) => say.note(values, every, tectonic),
    },
  });
  return steps;
}

export function hintKeepTrack(
  m: SeismicMove,
  step: HintStep<SeismicMove, SeismicHint>,
  state: SeismicState,
): HintTrackVerdict {
  return keepCandidateHintTrack(m, step, state.pencil, state.w, seismicCandidateMoves);
}

export function refreshHintStep(
  step: HintStep<SeismicMove, SeismicHint>,
  state: SeismicState,
): HintStep<SeismicMove, SeismicHint> | null {
  return refreshCandidateHintStep(
    step,
    state.grid,
    state.pencil,
    state.w,
    seismicCandidateMoves,
  );
}
