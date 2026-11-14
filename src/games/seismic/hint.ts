/**
 * Seismic's explained hint: the shared candidate walk (`runCandidatePlan`),
 * with Seismic's reach: a placed number rules itself out as far as the mode
 * says, which no fixed region can.
 *
 * **Deduced from the player's notes, as Abcd's is.** `findMistakes` refuses the
 * hint on any note that has crossed out its square's answer, so the plan
 * records nothing: the walk reads the singles off the notes it shows, an
 * area's hidden one included, and the starved area is the compiled `starve`
 * run on them (`techniqueRung`). `seismic-hint.test.ts` holds the starved area
 * to upstream's trial placement, and every plan to finishing its board.
 */

import {
  adaptiveMarkAll,
  anyEmptyLacksNotes,
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidatePlanPrefs,
  candidateGesture,
  keepCandidateHintTrack,
  type Mark,
  type NoteEncoding,
  obviousCandidateMarks,
  type Reach,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import {
  CANDIDATE_RUNGS,
  type CandidateRung,
  type NotesLadder,
  type PlanRung,
  runCandidatePlan,
  techniqueRung,
} from "../../engine/candidate-plan.ts";
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import { describedSpace, rangeMask } from "../../engine/describe-runtime.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import { candidateConclusions } from "../../engine/hint-text.ts";
import { digitKeyCode } from "../../engine/key-labels.ts";
import { CellMarks, type Said } from "../../engine/ladder-runtime.ts";
import type { CellRegion } from "../../engine/latin-hint.ts";
import type { NoteTakingUi } from "../../engine/note-taking-cell.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import * as seismic from "./seismic.compiled.ts";
import { dealtOf, seismicLadder } from "./solver.ts";
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
  /** Its square is down to one number. */
  | { kind: "single" }
  /** It has no notes, and every other number is already within reach. */
  | { kind: "regionsFull" }
  /** No other square of its area can hold the number. */
  | { kind: "hidden"; area: readonly number[] }
  /** Its square is a whole area, so it is a 1 however the walk came to it. */
  | { kind: "singleton" }
  /** Every home the area has left for `n` is near the struck squares. */
  | { kind: "starve"; n: number; area: readonly number[] };

/** Every rung a Seismic step can be: the walk's own, and the kinds of
 * {@link SeismicReason}. */
export const SEISMIC_RUNGS = [
  ...CANDIDATE_RUNGS,
  "singleton",
  "single",
  "regionsFull",
  "hidden",
  "starve",
] as const;
export type SeismicRung = (typeof SEISMIC_RUNGS)[number];

/** Seismic's moves already carry the shared names; only the note bit differs, and
 * a placement bakes in no auto-pencil, which Seismic does not have. */
const seismicCandidateMoves: CandidateMoveAdapter<SeismicMove> = {
  read: (m) => (m.type === "solve" ? null : m),
  strike: (marks) => ({ type: "pencilStrike", marks }),
  place: (x, y, n) => ({ type: "set", x, y, n, pencil: false }),
  bit: numBit,
};

const cellOf = (b: { w: number }, i: number): Point => ({
  x: i % b.w,
  y: (i / b.w) | 0,
});

/** The cells `marks` lie in, each once. A starve strikes one number, so one
 * note per cell. */
const cellsOfMarks = (marks: readonly Point[]): Point[] =>
  marks.map(({ x, y }) => ({ x, y }));

/**
 * What an `n` at `i` rules out: the squares the description's `cull` strikes
 * it from on a board where `i` holds it and every square could hold anything,
 * its area and as far as the mode reaches. Asked once a square and number.
 */
function seismicReach(b: SeismicBoard): Reach {
  const dl = dealtOf(b);
  const sp = describedSpace(seismic.units, b.w, b.h);
  const reached = new Map<number, number[]>();
  return (i, n) => {
    const key = i * 16 + n;
    let cells = reached.get(key);
    if (!cells) {
      const grid = new Uint8Array(b.grid.length);
      grid[i] = n;
      const m = new CellMarks(sp, ~0, grid);
      m.cands.fill(~0);
      const out: number[] = [];
      seismic.cull(m, sp, dl, i, (_, facts) => {
        for (let k = 0; k < facts.length; k += 3) out.push(facts[k + 1]);
        return true;
      });
      cells = out;
      reached.set(key, cells);
    }
    return cells;
  };
}

/**
 * The Mark-all press: fill every empty cell that has no notes with the
 * numbers its area's size allows, and once none is left, strike each note a
 * placed number rules out, by the reach the hint's own opening clean reads.
 */
export function markAll(state: SeismicState): SeismicMove | null {
  const { grid, pencil, w, dsf } = state;
  return adaptiveMarkAll<SeismicMove, Mark>(
    anyEmptyLacksNotes(grid, pencil),
    () =>
      obviousCandidateMarks(grid, pencil, w, seismicReach(state), {
        bit: numBit,
        values: 9,
        all: (i) => areaBits(dsf.size(i)),
      }),
    seismicCandidateMoves,
  );
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

export function buildSteps(
  state: SeismicState,
  { autoClean, reading }: CandidatePlanPrefs,
): HintStep<SeismicMove, SeismicHint, SeismicRung>[] {
  const { w, dsf, mode } = state;
  const tectonic = mode === MODE_TECTONIC;
  const grid = state.grid.slice();
  // A placed cell carries no notes on the walk's board, and a note no area of
  // that size can hold has no strike anywhere.
  const pencil = new Int32Array(grid.length);
  for (let i = 0; i < grid.length; i++)
    pencil[i] = grid[i] ? 0 : state.pencil[i] & areaBits(dsf.size(i));
  const dl = dealtOf(state);
  const { area } = dl;
  const reach = seismicReach(state);
  const enc = {
    bit: numBit,
    values: 9,
    all: (i: number) => areaBits(dsf.size(i)),
  } satisfies NoteEncoding;
  const sp = describedSpace(seismic.units, state.w, state.h);
  const on: NotesLadder = {
    ladder: seismicLadder(dl),
    marks: () => new CellMarks(sp, rangeMask(1, 9), grid),
    enc,
  };

  const cellsOf = (area: readonly number[]): Point[] =>
    area.map((j) => cellOf(state, j));
  type Rung = CandidateRung<SeismicMove, SeismicHint, DeductionRecord, SeismicReason>;
  // A square that is a whole area needs no notes, so it leads before they are
  // set up; after, its note shows it.
  const singleton: Rung = ({ populated }) =>
    populated
      ? []
      : area.cells
          .filter((cells) => cells.length === 1 && grid[cells[0]] === 0)
          .map(([i]) => [
            { place: { ...cellOf(state, i), n: 1 }, reason: { kind: "singleton" } },
          ]);
  const starve = techniqueRung<
    SeismicMove,
    SeismicHint,
    DeductionRecord,
    SeismicReason
  >(on, "starve", ({ facts, reasons }) => {
    const { r, n } = (reasons[0] as Said<unknown, seismic.SaysById["starve"]>).says
      .terms;
    const strike: Mark[] = [];
    for (let k = 0; k < facts.length; k += 3)
      strike.push({ ...cellOf(state, facts[k + 1]), n });
    return [{ strike, reason: { kind: "starve", n, area: area.cells[r] } }];
  });
  const steps: HintStep<SeismicMove, SeismicHint, PlanRung<SeismicReason>>[] = [];
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
    regionsOf: (x, y) => [{ cells: area.cells[area.of[y * w + x]], holdsEvery: true }],
    reach,
    rungs: [singleton, starve],
    singleReason: (_n, why) =>
      why.kind === "hidden"
        ? { kind: "hidden", area: Array.from(why.region.cells) }
        : why.kind === "naked"
          ? { kind: "single" }
          : { kind: "regionsFull" },
    placeWords: (m, reason) => {
      // A whole-area cell is a 1 however the walk came to it.
      if (dsf.size(m.y * w + m.x) === 1)
        return { words: say.singleton(m), rung: "singleton" };
      switch (reason.kind) {
        case "single":
          return { words: say.naked(m, w) };
        case "regionsFull":
          return { words: say.regionsFull(m, m.n, tectonic) };
        case "hidden":
          return { words: say.hidden(cellsOf(reason.area), m, m.n) };
        default:
          throw new Error(`seismic: a ${reason.kind} places nothing`);
      }
    },
    strikeWords: (marks, reason) => {
      switch (reason.kind) {
        case "dup":
          return {
            premise: say.cull({ x: reason.px, y: reason.py }, reason.n, tectonic),
            struck: say.culled(reason.n),
          };
        case "starve": {
          const targets = cellsOfMarks(marks);
          return {
            premise: say.starve(cellsOf(reason.area), reason.n, targets, tectonic),
            struck: say.starved(reason.n, targets.length),
            // The area's notes are where it can put its `n`: the premise.
            reads: cellsOf(reason.area),
          };
        }
        default:
          throw new Error(`seismic: a ${reason.kind} strikes nothing`);
      }
    },
    conclude: candidateConclusions({ value: String, cell: "cell" }),
    notes: {
      populate: say.populate,
      cleanObvious: say.clean(tectonic),
      note: (at, values, every) => say.note(at, values, every, tectonic),
    },
  });
  return steps;
}

export function hintKeepTrack(
  m: SeismicMove,
  step: HintStep<SeismicMove, SeismicHint, SeismicRung>,
  state: SeismicState,
): HintTrackVerdict {
  return keepCandidateHintTrack(m, step, state.pencil, state.w, seismicCandidateMoves);
}

/** How the pointer makes a step's `move`, with `at` the middle of a cell and
 * `markAll` what the mark-all control makes now. */
export function hintGesture(
  ui: NoteTakingUi,
  at: (x: number, y: number) => Point,
  move: SeismicMove,
  markAll: SeismicMove | null,
): PointerAction[] {
  return candidateGesture(move, ui, at, digitKeyCode, seismicCandidateMoves, markAll);
}

export function refreshHintStep(
  step: HintStep<SeismicMove, SeismicHint, SeismicRung>,
  state: SeismicState,
): HintStep<SeismicMove, SeismicHint, SeismicRung> | null {
  return refreshCandidateHintStep(
    step,
    state.grid,
    state.pencil,
    state.w,
    seismicCandidateMoves,
  );
}
