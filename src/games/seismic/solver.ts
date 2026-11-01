/**
 * Seismic's solver: the ladder `seismic.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), with the reason
 * each technique records for the hint; and the board's validation.
 *
 * One ladder serves the generator (which strips a clue only while the board
 * still solves, so the solver's verdict on every intermediate board decides
 * which puzzles exist), `solve()`, `findMistakes` (a board the ladder drives to
 * completion is *forced*, hence uniquely solved: no rung supposes anything)
 * and the hint, which records it.
 *
 * Easy is the singles, a square's and an area's; Normal adds the starved area,
 * which is upstream's trial placement as the deduction it always comes to once
 * the singles are spent (`seismic-hint.test.ts` holds it to the trial).
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import { describedSpace, partition, rangeMask } from "../../engine/describe-runtime.ts";
import type { Dsf } from "../../engine/dsf.ts";
import { auditingPremises, offerReplay } from "../../engine/firing-replay.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderReplay,
  ladderTechniques,
  placingRung,
  runLadder,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import * as seismic from "./seismic.compiled.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  FM_ERRORDIST,
  FM_ERRORDUP,
  MODE_SEISMIC,
  numBit,
  type SeismicBoard,
} from "./state.ts";

/** `solveGame` could not drive the board to a complete, valid solution. */
export const SOLVE_FAILED = -1;

export const STATUS_COMPLETE = 0;
export const STATUS_UNFINISHED = 1;
export const STATUS_INVALID = 2;

/** Why a number is placed or ruled out, as the solver records it. */
export type SeismicRecordReason =
  /** Its square is down to one number. */
  | { kind: "single" }
  /** No other square of its area can hold the number. */
  | { kind: "hidden"; area: readonly number[] }
  /** Every home the area has left for `n` is near the struck squares. */
  | { kind: "starve"; n: number; area: readonly number[] };

const areasByDsf = new WeakMap<Dsf, ReturnType<typeof partition>>();

/** The board as the description deals it: its areas, in the order of their
 * first square, and its keep-apart rule. The partition is kept for the life
 * of the board's areas, which every solve of it shares. */
export function dealtOf(board: SeismicBoard): seismic.Dealt {
  let area = areasByDsf.get(board.dsf);
  if (area === undefined) {
    const byRoot = new Map<number, number[]>();
    for (let i = 0; i < board.grid.length; i++) {
      const root = board.dsf.canonify(i);
      const cells = byRoot.get(root);
      if (cells) cells.push(i);
      else byRoot.set(root, [i]);
    }
    area = partition([...byRoot.values()], board.grid.length);
    areasByDsf.set(board.dsf, area);
  }
  return { area, mode: board.mode };
}

/** The ladder over the dealt areas, each technique with its reason. */
export function seismicLadder(dl: seismic.Dealt): Ladder {
  return describedLadder(seismic, {
    cull: placingRung(seismic.cull, dl),
    lone: uncluedRung(seismic.lone, (): SeismicRecordReason => ({ kind: "single" })),
    areaSingle: compiledRung(
      seismic.areaSingle,
      dl,
      ({ r }): SeismicRecordReason => ({ kind: "hidden", area: dl.area.cells[r] }),
    ),
    starve: compiledRung(
      seismic.starve,
      dl,
      ({ r, n }): SeismicRecordReason => ({
        kind: "starve",
        n,
        area: dl.area.cells[r],
      }),
    ),
  });
}

/**
 * The marks over `grid`, each square able to hold what its area admits, the
 * numbers on it placed and culled; `null` where two of them clash. The marks
 * are the solver's own, never the player's notes.
 */
export function marksOf(
  board: SeismicBoard,
  grid: Uint8Array,
  dl: seismic.Dealt,
  ladder: Ladder,
): CellMarks | null {
  const largest = Math.max(...dl.area.cells.map((cs) => cs.length));
  const m = new CellMarks(
    describedSpace(seismic.units, board.w, board.h),
    rangeMask(1, largest),
    grid,
  );
  m.placing = ladder.placing;
  return m.seed(grid, (c) => seismic.domainOf(m.sp, dl, c)) ? m : null;
}

/**
 * Run the ladder to a fixpoint, no harder than `maxDiff`, filling `board`'s
 * grid in place and leaving its notes the solver's candidates. Returns the
 * difficulty needed, or {@link SOLVE_FAILED} if the board did not come out
 * complete and valid.
 *
 * Callers that need the original back (the generator's clue-stripping loop)
 * snapshot it first.
 */
export function solveGame(
  board: SeismicBoard,
  maxDiff: number,
  firings?: FiringTally,
): number {
  const dl = dealtOf(board);
  const ladder = seismicLadder(dl);
  const m = marksOf(board, board.grid, dl, ladder);
  if (m === null) return SOLVE_FAILED;
  const grades = { [TIERS]: DIFF_EASY };
  runLadder(m, ladderTechniques(m, ladder.entries, { [TIERS]: maxDiff }, grades), {
    firings,
  });
  for (let c = 0; c < board.pencil.length; c++) board.pencil[c] = m.cands[c] >> 1;
  return validateGame(board) === STATUS_COMPLETE ? grades[TIERS] : SOLVE_FAILED;
}

/**
 * The recording solver on the numbers `grid` holds (never the player's
 * notes), up to `maxDiff`: every number it places and rules out, in order,
 * each with the reason the hint narrates. `grid` is not modified.
 */
export function recordSeismicDeductions(
  board: SeismicBoard,
  grid: Uint8Array,
  maxDiff: number = DIFF_NORMAL,
): DeductionRecord[] {
  const ops: DeductionRecord[] = [];
  const dl = dealtOf(board);
  const ladder = seismicLadder(dl);
  const m = marksOf(board, grid.slice(), dl, ladder);
  if (m === null) return ops;
  m.recorder = (rec) => ops.push(rec);
  m.budget = stepBudget("seismic hint");
  const techniquesOn = (on: CellMarks) =>
    ladderTechniques(on, ladder.entries, { [TIERS]: maxDiff }, { [TIERS]: DIFF_EASY });
  const replay = auditingPremises()
    ? ladderReplay(
        m,
        (values) => {
          const fresh = marksOf(board, Uint8Array.from(values), dl, ladder);
          if (fresh === null)
            throw new Error("seismic replay: the edited board clashes");
          return fresh;
        },
        techniquesOn,
      )
    : null;
  runLadder(m, techniquesOn(m));
  if (replay) offerReplay(replay);
  return ops;
}

/**
 * Classify the board and refresh its live error flags: a number duplicated
 * inside its region gets `FM_ERRORDUP`, one sitting within an equal number's
 * keep-apart range gets `FM_ERRORDIST`. Both are *local* consistency checks —
 * weaker than `findMistakes`, which asks whether the board contradicts the
 * unique solution.
 */
export function validateGame(board: SeismicBoard): number {
  const { w, h, grid, flags, dsf } = board;
  const s = w * h;
  /** Numbers placed at least once in the region rooted here. */
  const singles = new Int32Array(s);
  /** Numbers placed at least twice. */
  const doubles = new Int32Array(s);
  /** Numbers whose keep-apart range covers this cell. */
  const ranges = new Int32Array(s);
  let status = STATUS_COMPLETE;

  for (let i = 0; i < s; i++) {
    if (grid[i] === 0) continue;
    const x = i % w;
    const y = (i / w) | 0;
    const n = numBit(grid[i]);

    const c = dsf.canonify(i);
    doubles[c] |= n & singles[c];
    singles[c] |= n;

    if (board.mode === MODE_SEISMIC) {
      for (let j = 1; j <= grid[i]; j++) {
        if (x + j < w) ranges[i + j] |= n;
        if (x - j >= 0) ranges[i - j] |= n;
        if (y - j >= 0) ranges[i - j * w] |= n;
        if (y + j < h) ranges[i + j * w] |= n;
      }
    } else {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          if (x + dx >= 0 && x + dx < w && y + dy >= 0 && y + dy < h)
            ranges[i + dx + dy * w] |= n;
        }
      }
    }
  }

  for (let i = 0; i < s; i++) {
    // An empty cell keeps whatever flags it had; upstream does the same, and it
    // is invisible either way (only a placed number is drawn in an error hue).
    if (grid[i] === 0) continue;
    const c = dsf.canonify(i);

    if (doubles[c] & numBit(grid[i])) {
      status = STATUS_INVALID;
      flags[i] |= FM_ERRORDUP;
    } else {
      flags[i] &= ~FM_ERRORDUP;
    }

    if (ranges[i] & numBit(grid[i])) {
      status = STATUS_INVALID;
      flags[i] |= FM_ERRORDIST;
    } else {
      flags[i] &= ~FM_ERRORDIST;
    }
  }

  if (status !== STATUS_INVALID) {
    for (let i = 0; i < s; i++) {
      if (grid[i] === 0) {
        status = STATUS_UNFINISHED;
        break;
      }
    }
  }

  return status;
}
