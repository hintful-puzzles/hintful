/**
 * ABCD's solver: the ladder `abcd.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/ladder-runtime.ts`), the answer check
 * its rules compile to, and the search beneath the ladder.
 *
 * The ladder is upstream's three techniques (`abcd_solve_game`): a line
 * holding its count of a letter, a square down to one letter, and the runs
 * a line's open squares for a letter fall into. A placed letter leaves the
 * squares beside it, and diagonally beside it on a board with no diagonal
 * touching. Upstream has no technique of its own for the diagonals: that
 * weaker solver is the difficulty curve it shipped.
 *
 * Beneath the ladder, a search by trial and error over it
 * ({@link searchAnswers}) counts a clue set's answers. It is what an
 * Unreasonable board is dealt by, and what Solve and the mistake check know
 * the answer from at either tier. The hint never runs it.
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  perPlace,
  popcount,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
  uncluedPlacingRung,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import * as abcd from "./abcd.compiled.ts";
import {
  type AbcdParams,
  type AbcdState,
  EMPTY,
  horClue,
  letterBit,
  NO_NUMBER,
  verClue,
} from "./state.ts";

/** One pencil-mark cleanup: strike candidate `letter` at `(x, y)`. */
export interface AbcdMark {
  x: number;
  y: number;
  letter: number;
}

/**
 * The *obvious* pencil-mark eliminations given the placed letters, for the
 * adaptive mark-all — ABCD's analog of the Latin family's row/column duplicate
 * strikes (docs/mechanics.md § "Pencil marks: the full note-taking UX").
 * A penciled candidate `c` in an empty cell is struck when either:
 *   - an orthogonal (or, under `diag`, diagonal) neighbor already holds `c`; or
 *   - `c`'s row or column already holds its full clue count of `c`.
 * Both are the ladder's cheapest deductions (the placement's strikes and
 * `satisfied`), so a struck mark is never one a legal solution could keep.
 * Like `obviousCandidateMarks`, it never strikes a cell's last remaining
 * candidate.
 */
export function abcdObviousMarks(
  p: AbcdParams,
  grid: Int8Array,
  pencil: Int32Array,
  numbers: Int32Array,
): AbcdMark[] {
  const { w, h, n } = p;

  // Placed count per (row, letter) and (column, letter).
  const rowCount = new Int32Array(h * n);
  const colCount = new Int32Array(w * n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = grid[y * w + x] - 1;
      if (c >= 0) {
        rowCount[y * n + c]++;
        colCount[x * n + c]++;
      }
    }
  }

  const marks: AbcdMark[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (grid[i] !== EMPTY || pencil[i] === 0) continue;

      const noted: number[] = [];
      for (let c = 0; c < n; c++) if (pencil[i] & letterBit(c)) noted.push(c);

      const removable = noted.filter((c) => {
        if (neighbors(p, i).some((j) => grid[j] === c + 1)) return true;
        const rowClue = numbers[horClue(y, c, n)];
        const colClue = numbers[verClue(x, c, n, h)];
        return (
          (rowClue !== NO_NUMBER && rowCount[y * n + c] >= rowClue) ||
          (colClue !== NO_NUMBER && colCount[x * n + c] >= colClue)
        );
      });

      // Never empty a cell: if every note is removable, keep the lowest.
      if (removable.length === noted.length) removable.shift();
      for (const c of removable) marks.push({ x, y, letter: c });
    }
  }
  return marks;
}

/** The cells a letter at cell `i` keeps its twin out of: the four orthogonal
 * neighbors, and under `diag` the four diagonal ones too. */
export function neighbors(p: AbcdParams, i: number): number[] {
  const { w, h, diag } = p;
  const x = i % w;
  const y = (i / w) | 0;
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      if (dx !== 0 && dy !== 0 && !diag) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) out.push(ny * w + nx);
    }
  return out;
}

export type SolveStatus = "solved" | "ambiguous" | "contradiction";

export interface AbcdSolveResult {
  status: SolveStatus;
  /** The working grid at the end, letter `i` as `i + 1` (the unique solution
   * when `status` is `"solved"`; a partial/contradictory fill otherwise). */
  grid: Int8Array;
}

/** The variations a board has on, by the description's names. */
function variationsOf(p: AbcdParams): string[] {
  return p.diag ? ["no diagonal"] : [];
}

/** The board's numbers as the description deals them: each shown number at
 * its line, for its letter, a letter one more than its index. */
export function dealtOf(p: AbcdParams, numbers: Int32Array): abcd.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  numbers.forEach((clue, i) => {
    if (clue === NO_NUMBER) return;
    at.push(perPlace((i / p.n) | 0, (i % p.n) + 1));
    v.push(clue);
  });
  return { count: clueList(at, v, perPlace(p.w + p.h, 0)), n: p.n };
}

/** Why a line's technique fired, for the hint: the line, the letter (one
 * more than its index), and the line's number for it. */
export interface LineReason {
  kind: "satisfied" | "runs";
  line: number;
  d: number;
  clue: number;
}

/** The ladder over the dealt numbers, each technique with its reason. */
export function abcdLadder(p: AbcdParams, dl: abcd.Dealt): Ladder {
  return describedLadder(
    abcd,
    {
      placed: uncluedPlacingRung(abcd.placed),
      placedDiagonal: uncluedPlacingRung(abcd.placedDiagonal),
      satisfied: compiledRung(
        abcd.satisfied,
        dl,
        ({ L, d, v }): LineReason => ({ kind: "satisfied", line: L, d, clue: v }),
      ),
      single: uncluedRung(abcd.single, () => ({ kind: "single" })),
      runs: compiledRung(
        abcd.runs,
        dl,
        ({ L, d, v }): LineReason => ({ kind: "runs", line: L, d, clue: v }),
      ),
    },
    undefined,
    variationsOf(p),
  );
}

/** The space a board's ladder runs on. */
export function abcdSpace(p: AbcdParams): GridSpace {
  return describedSpace(abcd.units, p.w, p.h);
}

/** The marks over `grid`, every letter open in every empty cell and each
 * letter on it placed; `null` where two of them clash. */
export function abcdMarks(
  p: AbcdParams,
  grid: Int8Array,
  ladder: Ladder,
): CellMarks | null {
  const m = new CellMarks(abcdSpace(p), rangeMask(1, p.n), grid);
  m.placing = ladder.placing;
  return m.seed(grid) ? m : null;
}

/** Whether the board is solved: every square a letter, by the rules the
 * description compiles to. */
export function isCompleted(state: {
  params: AbcdParams;
  grid: Int8Array;
  numbers: Int32Array;
}): boolean {
  const p = state.params;
  return abcd.isAnswer(
    state.grid,
    abcdSpace(p),
    dealtOf(p, state.numbers),
    variationsOf(p),
  );
}

export function status(state: AbcdState): "solved" | "ongoing" {
  return isCompleted(state) ? "solved" : "ongoing";
}

/** Run the ladder on `m` to a fixpoint and say what it reached. */
function deduce(
  m: CellMarks,
  ladder: Ladder,
  p: AbcdParams,
  dl: abcd.Dealt,
  firings?: FiringTally,
): Deduced {
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: 0 }, {});
  if (runLadder(m, techniques, { firings })) return "contradiction";
  if (m.grid.includes(EMPTY)) return "stuck";
  return abcd.isAnswer(m.grid, m.sp, dl, variationsOf(p)) ? "solved" : "contradiction";
}

/** Run the deductive solver on `numbers` from a blank board. */
export function solveAbcd(
  p: AbcdParams,
  numbers: Int32Array,
  firings?: FiringTally,
): AbcdSolveResult {
  const dl = dealtOf(p, numbers);
  const ladder = abcdLadder(p, dl);
  const grid = new Int8Array(p.w * p.h);
  const m = abcdMarks(p, grid, ladder) as CellMarks;
  const got = deduce(m, ladder, p, dl, firings);
  const status: SolveStatus =
    got === "solved" ? "solved" : got === "stuck" ? "ambiguous" : "contradiction";
  return { status, grid };
}

/**
 * A grid of letters with none beside its twin (nor diagonally, under `diag`),
 * each square's letter drawn from those its neighbors so far leave it, in
 * reading order: what a board's numbers are counted from.
 */
export function drawAnswer(
  p: AbcdParams,
  pick: (letters: number) => number,
): Int8Array {
  const grid = new Int8Array(p.w * p.h);
  const hidden = new Int32Array((p.w + p.h) * p.n).fill(NO_NUMBER);
  const ladder = abcdLadder(p, dealtOf(p, hidden));
  const m = abcdMarks(p, grid, ladder) as CellMarks;
  for (const c of m.sp.cells) {
    const cands = m.cand(c);
    let k = pick(popcount(cands));
    let d = 0;
    for (let bits = cands; bits !== 0; bits &= bits - 1) {
      if (k-- === 0) {
        d = 31 - Math.clz32(bits & -bits);
        break;
      }
    }
    m.place(c, d);
  }
  return grid;
}

/** What a search established about a clue set's answers; the one answer is
 * its grid, letter `i` as `i + 1`. */
export type AbcdAnswer = Answer<Int8Array>;

/**
 * The positions a search may try before it gives up, each one a letter
 * assumed in a cell and the ladder run from it.
 *
 * It decides which Unreasonable boards exist: a clue set that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games. Measured 2026-10-10: a board dealt
 * at a preset needs a median of 3 to 13 and the hardest of 1,250 needed 265.
 * At the largest sizes dealt the median is 130 to 400, the hardest seen
 * needed 1,884, and up to a third of fills run the budget out, at about a
 * tenth of a second each.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a clue set's answers up to two, by trial and error over the ladder:
 * where it stops, take the empty cell with the fewest letters left, the first
 * such in reading order, and assume each in turn.
 */
export function searchAnswers(
  p: AbcdParams,
  numbers: Int32Array,
  budget: number = SEARCH_BUDGET,
): AbcdAnswer {
  const dl = dealtOf(p, numbers);
  const ladder = abcdLadder(p, dl);
  return searchBoard<CellMarks, Int8Array>({
    start: abcdMarks(p, new Int8Array(p.w * p.h), ladder) as CellMarks,
    deduce: (m) => deduce(m, ladder, p, dl),
    assume: (m) => assumeLetters(m, ladder),
    solution: (m) => m.grid as Int8Array,
    budget,
  });
}

/** The positions a stuck one divides into: its empty cell with the fewest
 * candidates, the first such in reading order, holding each of them. */
function assumeLetters(m: CellMarks, ladder: Ladder): CellMarks[] {
  let at = -1;
  let fewest = 33;
  for (let c = 0; c < m.grid.length; c++)
    if (m.grid[c] === EMPTY && popcount(m.cands[c]) < fewest) {
      at = c;
      fewest = popcount(m.cands[c]);
    }
  const out: CellMarks[] = [];
  for (let bits = at < 0 ? 0 : m.cands[at]; bits !== 0; bits &= bits - 1) {
    const sub = new CellMarks(m.sp, m.domain, m.grid.slice());
    sub.placing = ladder.placing;
    sub.cands.set(m.cands);
    sub.place(at, 31 - Math.clz32(bits & -bits));
    out.push(sub);
  }
  return out;
}

/** Keyed on a state's clues, which every state of a game shares. */
const answers = answerCache<Int32Array, Int8Array>();

/** What a search of a state's clue set established about its answers. The
 * player's letters and marks are not read. */
export function answerOf(state: {
  params: AbcdParams;
  numbers: Int32Array;
}): AbcdAnswer {
  return answers(state.numbers, () => searchAnswers(state.params, state.numbers));
}
