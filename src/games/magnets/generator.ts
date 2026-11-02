/**
 * Magnets generator — upstream's `new_game_desc` and its helpers (`gen_game`,
 * `lay_dominoes`, `check_difficulty` in `magnets.c`), its RNG draws in
 * upstream's order, graded by the compiled ladder (`solver.ts`).
 *
 * Strategy: lay a random domino tiling, fill it with a valid solution (a few
 * neutral dominoes first, then prefer magnets), derive the row/column counts,
 * reject boards not soluble at exactly the target difficulty, and — for strip
 * mode — remove clues in shuffled order while the board stays uniquely
 * solvable.
 */
import { dominoLayout } from "../../engine/laydomino.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import {
  cellValue,
  dealtOf,
  deduce,
  givenValues,
  magnetsLadder,
  magnetsMarks,
  magnetsSpace,
  solveMagnets,
  whichOf,
} from "./solver.ts";
import {
  COLUMN,
  DIFF_EASY,
  encodeDesc,
  type MagnetsParams,
  NEGATIVE,
  NEUTRAL,
  POSITIVE,
  ROW,
} from "./state.ts";

const GRID2CHAR = [".", "+", "-"];

interface GenBoard {
  w: number;
  h: number;
  dominoes: Int32Array;
  /** the laid solution (EMPTY/POSITIVE/NEGATIVE per cell). */
  grid: Int32Array;
  rowcount: Int32Array;
  colcount: Int32Array;
}

/**
 * Fill the domino tiling with a valid magnet/neutral solution, or return null
 * when this attempt reaches a contradiction. Each square is laid in a
 * shuffled order, and the ladder over a board with no numbers, which reads
 * only the tiles and the poles, decides what it can before the next.
 */
function layDominoes(
  w: number,
  h: number,
  dominoes: Int32Array,
  rs: RandomState,
): Int32Array | null {
  const wh = w * h;
  const common = {
    dominoes,
    rowcount: new Int32Array(3 * h).fill(-1),
    colcount: new Int32Array(3 * w).fill(-1),
  };
  const dl = dealtOf(w, h, common);
  const ladder = magnetsLadder(dl);
  const m = magnetsMarks(magnetsSpace(w, h), dl, ladder, givenValues(w, h, common));
  if (m === null) throw new Error("magnets: a tiling with no clues clashes");
  const order = Array.from({ length: wh }, (_, i) => i);
  shuffle(order, rs);

  const nInitialNeutral = wh > 100 ? 5 : Math.floor(wh / 10);
  const plus = cellValue(POSITIVE);
  const minus = cellValue(NEGATIVE);

  for (let n = 0; n < wh; n++) {
    const i = order[n];
    if (m.known(i)) continue; // already laid here

    const d =
      n < nInitialNeutral
        ? cellValue(NEUTRAL)
        : m.has(i, plus)
          ? plus
          : m.has(i, minus)
            ? minus
            : cellValue(NEUTRAL);
    if (!m.has(i, d)) return null;
    m.place(i, d);
    const verdict = deduce(m, ladder, dl, DIFF_EASY);
    if (verdict < 0) return null;
    if (verdict > 0) break;
  }
  return Int32Array.from(m.grid, whichOf);
}

/** Lay a tiling and a full solution; derive the row/column counts. */
function genGame(w: number, h: number, rs: RandomState): GenBoard {
  const dominoes = dominoLayout(w, h, rs);

  let grid: Int32Array | null = null;
  const attempt = retryLimit("magnets: layDominoes");
  while (!grid) {
    attempt();
    grid = layDominoes(w, h, dominoes, rs);
  }

  const colcount = new Int32Array(3 * w);
  const rowcount = new Int32Array(3 * h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const val = grid[y * w + x];
      colcount[x * 3 + val]++;
      rowcount[y * 3 + val]++;
    }
  }
  return { w, h, dominoes, grid, rowcount, colcount };
}

/** For a scratch index `num` (0..2·(w+h)-1), the (which, roworcol, index). */
function decodeClueSlot(
  w: number,
  h: number,
  num: number,
): { which: number; roworcol: number; index: number } {
  const which = num < w + h ? POSITIVE : NEGATIVE;
  const n = num % (w + h);
  return n < w
    ? { which, roworcol: COLUMN, index: n }
    : { which, roworcol: ROW, index: n - w };
}

/**
 * Gate difficulty and (for strip mode) minimize the clue set, mutating
 * `board.rowcount`/`board.colcount` in place. Returns whether to accept the
 * board. Upstream's `check_difficulty`.
 */
function checkDifficulty(p: MagnetsParams, board: GenBoard, rs: RandomState): boolean {
  const { w, h, rowcount, colcount } = board;

  const solveFresh = (cap: number) => solveMagnets(w, h, board, cap);

  if (p.diff > DIFF_EASY && solveFresh(p.diff - 1).verdict > 0) return false; // too easy
  const solved = solveFresh(p.diff);
  if (solved.verdict <= 0) return false; // not soluble at requested difficulty
  if (!p.stripclues) return true;

  const order = Array.from({ length: 2 * (w + h) }, (_, i) => i);
  shuffle(order, rs);

  for (const num of order) {
    const { which, roworcol, index } = decodeClueSlot(w, h, num);
    const targets = roworcol === COLUMN ? colcount : rowcount;
    const base = index * 3;

    // Remove clue (its color and the derived neutral), remembering both.
    const target = targets[base + which];
    const targetn = targets[base + NEUTRAL];
    targets[base + which] = -1;
    targets[base + NEUTRAL] = -1;

    // Removing a clue can't make a contradiction, only room for another
    // answer, or none the ladder reaches.
    const r = solveFresh(p.diff);
    if (r.verdict <= 0 || r.grid.some((v, k) => v !== solved.grid[k])) {
      targets[base + which] = target;
      targets[base + NEUTRAL] = targetn;
    }
  }
  return true;
}

export function newMagnetsDesc(
  p: MagnetsParams,
  rs: RandomState,
): { desc: string; aux: string } {
  const attempt = retryLimit("magnets: generation");
  while (true) {
    attempt();
    const board = genGame(p.w, p.h, rs);
    if (checkDifficulty(p, board, rs)) {
      const { w, h, dominoes, grid, rowcount, colcount } = board;
      return {
        desc: encodeDesc(w, h, dominoes, rowcount, colcount),
        aux: Array.from(grid, (v) => GRID2CHAR[v]).join(""),
      };
    }
  }
}
