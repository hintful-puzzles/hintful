/**
 * Unruly solver: the solver/validation half of `unruly.c`. Five deductive
 * techniques gated by difficulty, plus the count/run validators the state and
 * renderer reuse.
 *
 * The solver mutates a private working grid in place: it fills thousands of
 * cells per board during generation, where a clone per fill would be wasteful.
 * The `Game`'s `executeMove` stays pure.
 */
import {
  type DeductionTechnique,
  runDeductionFixpoint,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { SweepOffers } from "../../engine/sweep-offers.ts";
import { DIFF_EASY, DIFF_NORMAL, DIFF_TRIVIAL, EMPTY, ONE, ZERO } from "./constants.ts";
import type { UnrulyMistake, UnrulyState } from "./state.ts";

/** A temporary fill used by the near-complete technique so it doesn't
 * perturb the running counts; never appears in a real state. */
const BOGUS = 3;

/** The minimal grid view the validators/solver operate on. `UnrulyState`
 * structurally satisfies it; the solver builds its own mutable one. */
export interface GridView {
  w2: number;
  h2: number;
  unique: boolean;
  grid: Uint8Array;
  /**
   * The hint path's: called where a technique has just made one firing, so
   * that a plan can offer it as a step of its own (`SweepOffers.keep`).
   */
  offer?: () => void;
}

// --- hint recording (the explained-deduction path) ----------------------
// Each technique optionally reports every cell it forces, with the premise
// that forces it, so `deduceHintPlan` can narrate the solve. The generator
// passes no recorder, so generation pays nothing.

/** Why a cell is forced — the premise the hint narrates and highlights. */
export type HintReason =
  // Two of three consecutive cells are `color`; a third would be three in
  // a row, so the empty one is the opposite. `refs` are the two filled cells.
  | { kind: "threes"; horizontal: boolean; refs: [number, number]; color: number }
  // A row/column already holds its full count of `full`, so every remaining
  // empty cell is `fill`. `line` is the row (horizontal) or column index.
  | { kind: "complete"; line: number; horizontal: boolean; fill: number; full: number }
  // Unique-rows: row/col `rowA` is full and `rowB` matches it everywhere it is
  // filled except here; making this cell `fill`'s opposite would duplicate it.
  | { kind: "unique"; rowA: number; rowB: number; horizontal: boolean; fill: number }
  // A row/column with one `full` cell left: it is pinned to the `window`
  // cells (anywhere else forces three `fill` in a row next to `anchor`), so
  // every other empty cell is `fill`. `anchor` is the abutting fill, or -1.
  | {
      kind: "nearcomplete";
      line: number;
      horizontal: boolean;
      fill: number;
      window: number[];
      anchor: number;
    };

/** One forced cell of a hint plan, in deduction order. `continuesPrevious`
 * marks the 2nd+ legs of a single firing (a whole-line fill) so the midend
 * presents them as one journey. */
export interface HintMove {
  index: number;
  value: number;
  reason: HintReason;
  continuesPrevious: boolean;
}

/** Invoked at each forced cell when the deduction is run for a hint. */
type Recorder = (
  index: number,
  value: number,
  reason: HintReason,
  continuesPrevious: boolean,
) => void;

const otherColor = (c: number): number => (c === ONE ? ZERO : ONE);

// --- error-overlay flags (set by validateRows, read by render.ts) -------
export const FE_HOR_ROW_LEFT = 0x0001;
const FE_HOR_ROW_MID = 0x0003;
export const FE_HOR_ROW_RIGHT = 0x0002;
export const FE_VER_ROW_TOP = 0x0004;
const FE_VER_ROW_MID = 0x000c;
export const FE_VER_ROW_BOTTOM = 0x0008;
export const FE_ROW_MATCH = 0x0020;
export const FE_COL_MATCH = 0x0040;

// --- scratch counts ------------------------------------------------------

/** Per-row and per-column counts of each color, kept in step with the grid
 * as the solver fills it. */
export interface Scratch {
  onesRows: Int32Array;
  onesCols: Int32Array;
  zerosRows: Int32Array;
  zerosCols: Int32Array;
}

export function newScratch(view: GridView): Scratch {
  const { w2, h2, grid } = view;
  const s: Scratch = {
    onesRows: new Int32Array(h2),
    onesCols: new Int32Array(w2),
    zerosRows: new Int32Array(h2),
    zerosCols: new Int32Array(w2),
  };
  for (let y = 0; y < h2; y++) {
    for (let x = 0; x < w2; x++) {
      const v = grid[y * w2 + x];
      if (v === ONE) {
        s.onesRows[y]++;
        s.onesCols[x]++;
      } else if (v === ZERO) {
        s.zerosRows[y]++;
        s.zerosCols[x]++;
      }
    }
  }
  return s;
}

// --- technique: impending threes (TRIVIAL) ------------------------------
// Two of three consecutive cells filled `check` and the third EMPTY forces
// the third to `block` (the opposite color). `rowcount`/`colcount` are the
// block color's counts, bumped as cells are filled.
function checkThrees(
  view: GridView,
  rowcount: Int32Array,
  colcount: Int32Array,
  horizontal: boolean,
  check: number,
  block: number,
  rec?: Recorder,
): number {
  const { w2, h2, grid } = view;
  const dx = horizontal ? 1 : 0;
  const dy = 1 - dx;
  let ret = 0;
  for (let y = dy; y < h2 - dy; y++) {
    for (let x = dx; x < w2 - dx; x++) {
      const i1 = (y - dy) * w2 + (x - dx);
      const i2 = y * w2 + x;
      const i3 = (y + dy) * w2 + (x + dx);
      let fillAt = -1;
      if (grid[i1] === check && grid[i2] === check && grid[i3] === EMPTY) fillAt = i3;
      else if (grid[i1] === check && grid[i2] === EMPTY && grid[i3] === check)
        fillAt = i2;
      else if (grid[i1] === EMPTY && grid[i2] === check && grid[i3] === check)
        fillAt = i1;
      if (fillAt >= 0) {
        if (rec) {
          // The two cells of the window that aren't the one being filled are
          // the same-color pair that forces it.
          const refs = [i1, i2, i3].filter((p) => p !== fillAt) as [number, number];
          rec(fillAt, block, { kind: "threes", horizontal, refs, color: check }, false);
        }
        ret++;
        grid[fillAt] = block;
        rowcount[Math.floor(fillAt / w2)]++;
        colcount[fillAt % w2]++;
        view.offer?.();
      }
    }
  }
  return ret;
}

function checkAllThrees(view: GridView, s: Scratch, rec?: Recorder): number {
  let ret = 0;
  ret += checkThrees(view, s.zerosRows, s.zerosCols, true, ONE, ZERO, rec);
  ret += checkThrees(view, s.onesRows, s.onesCols, true, ZERO, ONE, rec);
  ret += checkThrees(view, s.zerosRows, s.zerosCols, false, ONE, ZERO, rec);
  ret += checkThrees(view, s.onesRows, s.onesCols, false, ZERO, ONE, rec);
  return ret;
}

// --- fill an entire row/column with one color --------------------------
function fillRow(
  view: GridView,
  i: number,
  horizontal: boolean,
  rowcount: Int32Array,
  colcount: Int32Array,
  fill: number,
  rec?: Recorder,
  reason?: HintReason,
): number {
  const { w2, h2, grid } = view;
  let ret = 0;
  const n = horizontal ? w2 : h2;
  for (let j = 0; j < n; j++) {
    const p = horizontal ? i * w2 + j : j * w2 + i;
    if (grid[p] === EMPTY) {
      // The cells of one fillRow call all flow from a single firing, so the
      // first opens a journey and the rest continue it (`continuesPrevious`).
      if (rec && reason) rec(p, fill, reason, ret > 0);
      ret++;
      grid[p] = fill;
      rowcount[horizontal ? i : j]++;
      colcount[horizontal ? j : i]++;
    }
  }
  return ret;
}

// --- technique: single gap (TRIVIAL) ------------------------------------
// A row/column with its full count of one color and one short of the
// other has exactly one empty cell, which must be the other color.
function checkSingleGap(
  view: GridView,
  complete: Int32Array,
  horizontal: boolean,
  rowcount: Int32Array,
  colcount: Int32Array,
  fill: number,
  rec?: Recorder,
): number {
  const { w2, h2 } = view;
  const count = horizontal ? h2 : w2;
  const target = (horizontal ? w2 : h2) / 2;
  const other = horizontal ? rowcount : colcount;
  let ret = 0;
  for (let i = 0; i < count; i++) {
    if (complete[i] === target && other[i] === target - 1) {
      const reason: HintReason = {
        kind: "complete",
        line: i,
        horizontal,
        fill,
        full: otherColor(fill),
      };
      const n = fillRow(view, i, horizontal, rowcount, colcount, fill, rec, reason);
      ret += n;
      if (n > 0) view.offer?.();
    }
  }
  return ret;
}

function checkAllSingleGap(view: GridView, s: Scratch, rec?: Recorder): number {
  let ret = 0;
  ret += checkSingleGap(view, s.onesRows, true, s.zerosRows, s.zerosCols, ZERO, rec);
  ret += checkSingleGap(view, s.onesCols, false, s.zerosRows, s.zerosCols, ZERO, rec);
  ret += checkSingleGap(view, s.zerosRows, true, s.onesRows, s.onesCols, ONE, rec);
  ret += checkSingleGap(view, s.zerosCols, false, s.onesRows, s.onesCols, ONE, rec);
  return ret;
}

// --- technique: completed counts (EASY) ---------------------------------
// A row/column already holding its full count of one color fills the rest
// with the other color.
function checkCompleteNums(
  view: GridView,
  complete: Int32Array,
  horizontal: boolean,
  rowcount: Int32Array,
  colcount: Int32Array,
  fill: number,
  rec?: Recorder,
): number {
  const { w2, h2 } = view;
  const count = horizontal ? h2 : w2;
  const target = (horizontal ? w2 : h2) / 2;
  const other = horizontal ? rowcount : colcount;
  let ret = 0;
  for (let i = 0; i < count; i++) {
    if (complete[i] === target && other[i] < target) {
      const reason: HintReason = {
        kind: "complete",
        line: i,
        horizontal,
        fill,
        full: otherColor(fill),
      };
      const n = fillRow(view, i, horizontal, rowcount, colcount, fill, rec, reason);
      ret += n;
      if (n > 0) view.offer?.();
    }
  }
  return ret;
}

function checkAllCompleteNums(view: GridView, s: Scratch, rec?: Recorder): number {
  let ret = 0;
  ret += checkCompleteNums(view, s.onesRows, true, s.zerosRows, s.zerosCols, ZERO, rec);
  ret += checkCompleteNums(
    view,
    s.onesCols,
    false,
    s.zerosRows,
    s.zerosCols,
    ZERO,
    rec,
  );
  ret += checkCompleteNums(view, s.zerosRows, true, s.onesRows, s.onesCols, ONE, rec);
  ret += checkCompleteNums(view, s.zerosCols, false, s.onesRows, s.onesCols, ONE, rec);
  return ret;
}

// --- technique: unique rows/columns (EASY, unique mode) -----------------
// A full row/column matched in all but one place by a one-short row/column
// forces that one place to differ (else the two would become identical).
function checkUniques(
  view: GridView,
  rowcount: Int32Array,
  horizontal: boolean,
  check: number,
  block: number,
  s: Scratch,
  rec?: Recorder,
): number {
  const { w2, h2, grid } = view;
  const rmult = horizontal ? w2 : 1;
  const cmult = horizontal ? 1 : w2;
  const nr = horizontal ? h2 : w2;
  const nc = horizontal ? w2 : h2;
  const max = nc / 2;
  let ret = 0;
  for (let r = 0; r < nr; r++) {
    if (rowcount[r] !== max) continue;
    for (let r2 = 0; r2 < nr; r2++) {
      if (rowcount[r2] !== max - 1) continue;
      let nmatch = 0;
      let nonmatch = -1;
      for (let c = 0; c < nc; c++) {
        if (grid[r * rmult + c * cmult] === check) {
          if (grid[r2 * rmult + c * cmult] === check) nmatch++;
          else nonmatch = c;
        }
      }
      if (nmatch === max - 1 && nonmatch >= 0) {
        const i1 = r2 * rmult + nonmatch * cmult;
        if (grid[i1] !== EMPTY) continue;
        rec?.(
          i1,
          block,
          { kind: "unique", rowA: r, rowB: r2, horizontal, fill: block },
          false,
        );
        grid[i1] = block;
        if (block === ONE) {
          s.onesRows[Math.floor(i1 / w2)]++;
          s.onesCols[i1 % w2]++;
        } else {
          s.zerosRows[Math.floor(i1 / w2)]++;
          s.zerosCols[i1 % w2]++;
        }
        ret++;
        view.offer?.();
      }
    }
  }
  return ret;
}

function checkAllUniques(view: GridView, s: Scratch, rec?: Recorder): number {
  let ret = 0;
  ret += checkUniques(view, s.onesRows, true, ONE, ZERO, s, rec);
  ret += checkUniques(view, s.zerosRows, true, ZERO, ONE, s, rec);
  ret += checkUniques(view, s.onesCols, false, ONE, ZERO, s, rec);
  ret += checkUniques(view, s.zerosCols, false, ZERO, ONE, s, rec);
  return ret;
}

// --- technique: near-complete (NORMAL) ----------------------------------
// A row/column with one cell of the `complete` color left and at least two
// of `fill` left. Where three consecutive cells would all become `fill`
// unless that last cell goes among them, it must, so every other empty cell
// in the line is `fill`. (See unruly.c's worked example.)
function checkNearComplete(
  view: GridView,
  complete: Int32Array,
  horizontal: boolean,
  rowcount: Int32Array,
  colcount: Int32Array,
  fill: number,
  rec?: Recorder,
): number {
  const { w2, h2, grid } = view;
  const w = w2 / 2;
  const h = h2 / 2;
  const dx = horizontal ? 1 : 0;
  const dy = 1 - dx;
  let ret = 0;
  for (let y = dy; y < h2 - dy; y++) {
    if (horizontal && (complete[y] < w - 1 || rowcount[y] > w - 2)) continue;
    for (let x = dx; x < w2 - dx; x++) {
      if (!horizontal && (complete[x] < h - 1 || colcount[x] > h - 2)) continue;

      const i = horizontal ? y : x;
      const i1 = (y - dy) * w2 + (x - dx);
      const i2 = y * w2 + x;
      const i3 = (y + dy) * w2 + (x + dx);

      // The window the last cell is pinned to: two empties beside a `fill`
      // cell (the `anchor`), or three empties. BOGUS-mark it so `fillRow`
      // fills only the rest of the line, then restore it.
      let bogus: number[] | null = null;
      let anchor = -1;
      if (grid[i1] === fill && grid[i2] === EMPTY && grid[i3] === EMPTY) {
        bogus = [i2, i3];
        anchor = i1;
      } else if (grid[i1] === EMPTY && grid[i2] === fill && grid[i3] === EMPTY) {
        bogus = [i1, i3];
        anchor = i2;
      } else if (grid[i1] === EMPTY && grid[i2] === EMPTY && grid[i3] === fill) {
        bogus = [i1, i2];
        anchor = i3;
      } else if (grid[i1] === EMPTY && grid[i2] === EMPTY && grid[i3] === EMPTY) {
        bogus = [i1, i2, i3];
      }

      if (bogus) {
        const reason: HintReason = {
          kind: "nearcomplete",
          line: i,
          horizontal,
          fill,
          window: bogus,
          anchor,
        };
        for (const b of bogus) grid[b] = BOGUS;
        const n = fillRow(view, i, horizontal, rowcount, colcount, fill, rec, reason);
        ret += n;
        for (const b of bogus) grid[b] = EMPTY;
        if (n > 0) view.offer?.();
      }
    }
  }
  return ret;
}

function checkAllNearComplete(view: GridView, s: Scratch, rec?: Recorder): number {
  let ret = 0;
  ret += checkNearComplete(view, s.onesRows, true, s.zerosRows, s.zerosCols, ZERO, rec);
  ret += checkNearComplete(
    view,
    s.onesCols,
    false,
    s.zerosRows,
    s.zerosCols,
    ZERO,
    rec,
  );
  ret += checkNearComplete(view, s.zerosRows, true, s.onesRows, s.onesCols, ONE, rec);
  ret += checkNearComplete(view, s.zerosCols, false, s.onesRows, s.onesCols, ONE, rec);
  return ret;
}

// --- solve loop ----------------------------------------------------------

/**
 * Run the deductive techniques to a fixpoint, capped at tier `diff`. Mutates
 * `view.grid` and `scratch`. Returns the highest tier whose technique fired,
 * or `-1` if none did.
 *
 * Five techniques across three tiers, each declaring its own tier, so the
 * shared runner owns all of upstream's bookkeeping: restart on the first
 * firing, the running grade, and the tier cap. No technique can prove a
 * contradiction, so `impossible` is never reported.
 */
export function solveGame(view: GridView, scratch: Scratch, diff: number): number {
  const { grade } = runDeductionFixpoint({
    techniques: unrulyLadder(view, scratch),
    maxTier: diff,
    baseGrade: -1,
  });
  return grade;
}

/** The five techniques over `view`, each recording to `rec` where there is
 * one. */
function unrulyLadder(
  view: GridView,
  scratch: Scratch,
  rec?: Recorder,
): DeductionTechnique[] {
  const run = (sweep: () => number) => () => (sweep() ? 1 : 0);
  return [
    {
      id: "three-in-a-row",
      tier: DIFF_TRIVIAL,
      run: run(() => checkAllThrees(view, scratch, rec)),
    },
    {
      id: "single-gap",
      tier: DIFF_TRIVIAL,
      run: run(() => checkAllSingleGap(view, scratch, rec)),
    },
    {
      id: "complete-count",
      tier: DIFF_EASY,
      run: run(() => checkAllCompleteNums(view, scratch, rec)),
    },
    {
      // `unique` is a rule of the board (the "no two identical rows"
      // variant), not a rung ordering question, so it gates the technique
      // rather than being a runner predicate.
      id: "unique-rows",
      tier: DIFF_EASY,
      run: run(() => (view.unique ? checkAllUniques(view, scratch, rec) : 0)),
    },
    {
      id: "near-complete",
      tier: DIFF_NORMAL,
      run: run(() => checkAllNearComplete(view, scratch, rec)),
    },
  ];
}

/** Solve a copy of `grid` on `view`'s board, capped at tier `diff`, and return
 * the worked copy; the caller's grid is untouched. */
export function solveCopy(view: GridView, grid: Uint8Array, diff: number): GridView {
  const { w2, h2, unique } = view;
  const work: GridView = { w2, h2, unique, grid: Uint8Array.from(grid) };
  solveGame(work, newScratch(work), diff);
  return work;
}

/** Everything a hint firing writes, and the moves it has recorded. */
interface UnrulySnapshot {
  grid: Uint8Array;
  counts: Int32Array[];
  moves: HintMove[];
}

/**
 * Run the deduction from the player's current marks at full strength,
 * recording every forced cell in order — the explained-hint plan. Returns the
 * ordered forced moves; the first is the move to surface next.
 *
 * One firing at a time, each the one beside the plan's last where there is
 * one: a player works the rows and columns through the cells just filled.
 */
export function deduceHintPlan(state: UnrulyState): HintMove[] {
  const { w2, h2, unique } = state;
  const plan: HintMove[] = [];
  let moves: HintMove[] = [];
  const view: GridView = { w2, h2, unique, grid: Uint8Array.from(state.grid) };
  const s = newScratch(view);
  const counts = [s.onesRows, s.onesCols, s.zerosRows, s.zerosCols];
  const lineCells = (line: number, horizontal: boolean): number[] =>
    horizontal
      ? Array.from({ length: w2 }, (_, x) => line * w2 + x)
      : Array.from({ length: h2 }, (_, y) => y * w2 + line);
  const offers = new SweepOffers<UnrulySnapshot, HintMove[]>({
    save: () => ({
      grid: view.grid.slice(),
      counts: counts.map((c) => c.slice()),
      moves: [...moves],
    }),
    restore: (snap) => {
      view.grid.set(snap.grid);
      for (const [k, c] of counts.entries()) c.set(snap.counts[k]);
      moves = [...snap.moves];
    },
    recorded: () => [...moves],
    record: (m) => {
      moves = [...m];
    },
    // The pair that forces a cell, the row or rows a count reads, and the
    // cells it fills.
    reads: (m) => {
      if (m.length === 0) return [];
      const { reason } = m[0];
      const own = m.map((x) => x.index);
      switch (reason.kind) {
        case "threes":
          return [...reason.refs, ...own];
        case "complete":
        case "nearcomplete":
          return [...lineCells(reason.line, reason.horizontal), ...own];
        case "unique":
          return [
            ...lineCells(reason.rowA, reason.horizontal),
            ...lineCells(reason.rowB, reason.horizontal),
          ];
      }
    },
    writes: (_before, _after, m) => m.map((x) => x.index),
  });
  view.offer = () => {
    offers.keep();
  };
  const pass = singleFirings({
    techniques: offers.techniques(
      unrulyLadder(view, s, (index, value, reason, continuesPrevious) => {
        moves.push({ index, value, reason, continuesPrevious });
      }),
    ),
    budget: stepBudget("unruly hint"),
    continuing: true,
  });
  for (;;) {
    moves = [];
    if (!pass.next()) break;
    plan.push(...moves);
  }
  return plan;
}

// --- validators ----------------------------------------------------------

function validateRowsOriented(
  view: GridView,
  horizontal: boolean,
  check: number,
  errors: Int32Array | null,
): number {
  const { w2, h2, grid } = view;
  const dx = horizontal ? 1 : 0;
  const dy = 1 - dx;
  const err1 = horizontal ? FE_HOR_ROW_LEFT : FE_VER_ROW_TOP;
  const err2 = horizontal ? FE_HOR_ROW_MID : FE_VER_ROW_MID;
  const err3 = horizontal ? FE_HOR_ROW_RIGHT : FE_VER_ROW_BOTTOM;
  let ret = 0;
  for (let y = dy; y < h2 - dy; y++) {
    for (let x = dx; x < w2 - dx; x++) {
      const i1 = (y - dy) * w2 + (x - dx);
      const i2 = y * w2 + x;
      const i3 = (y + dy) * w2 + (x + dx);
      if (grid[i1] === check && grid[i2] === check && grid[i3] === check) {
        ret++;
        if (errors) {
          errors[i1] |= err1;
          errors[i2] |= err2;
          errors[i3] |= err3;
        }
      }
    }
  }
  return ret;
}

function validateUnique(
  view: GridView,
  horizontal: boolean,
  errors: Int32Array | null,
): number {
  const { w2, h2, grid } = view;
  const rmult = horizontal ? w2 : 1;
  const cmult = horizontal ? 1 : w2;
  const nr = horizontal ? h2 : w2;
  const nc = horizontal ? w2 : h2;
  const err = horizontal ? FE_ROW_MATCH : FE_COL_MATCH;
  let ret = 0;
  for (let r = 0; r < nr; r++) {
    let nfull = 0;
    for (let c = 0; c < nc; c++) if (grid[r * rmult + c * cmult] !== EMPTY) nfull++;
    if (nfull !== nc) continue;
    for (let r2 = r + 1; r2 < nr; r2++) {
      let match = true;
      for (let c = 0; c < nc; c++) {
        if (grid[r * rmult + c * cmult] !== grid[r2 * rmult + c * cmult]) {
          match = false;
          break;
        }
      }
      if (match) {
        if (errors) {
          for (let c = 0; c < nc; c++) {
            errors[r * rmult + c * cmult] |= err;
            errors[r2 * rmult + c * cmult] |= err;
          }
        }
        ret++;
      }
    }
  }
  return ret;
}

/** Mark every three-in-a-row run (and, in unique mode, every identical
 * full row/column pair) into `errors`. Returns `-1` if any error exists,
 * else `0`. */
export function validateRows(view: GridView, errors: Int32Array | null): number {
  let n = 0;
  n += validateRowsOriented(view, true, ONE, errors);
  n += validateRowsOriented(view, false, ONE, errors);
  n += validateRowsOriented(view, true, ZERO, errors);
  n += validateRowsOriented(view, false, ZERO, errors);
  if (view.unique) {
    n += validateUnique(view, true, errors);
    n += validateUnique(view, false, errors);
  }
  return n ? -1 : 0;
}

/** Count check: `-1` if any row/column exceeds its target (contradiction),
 * `+1` if any is still short (incomplete), `0` if every count is exact.
 * Optionally records per-row/column over-count flags into `errors`, laid
 * out as upstream: `[0,h2)` rows-ones, `[h2,2h2)` rows-zeros,
 * `[2h2,2h2+w2)` cols-ones, `[2h2+w2,2h2+2w2)` cols-zeros. */
export function validateCounts(view: GridView, errors: Uint8Array | null): number {
  const { w2, h2 } = view;
  const w = w2 / 2;
  const h = h2 / 2;
  const s = newScratch(view);
  let below = false;
  let above = false;

  for (let i = 0; i < w2; i++) {
    if (s.onesCols[i] < h || s.zerosCols[i] < h) below = true;
    if (s.onesCols[i] > h || s.zerosCols[i] > h) above = true;
    if (errors) {
      errors[2 * h2 + i] = s.onesCols[i] > h ? 1 : 0;
      errors[2 * h2 + w2 + i] = s.zerosCols[i] > h ? 1 : 0;
    }
  }
  for (let i = 0; i < h2; i++) {
    if (s.onesRows[i] < w || s.zerosRows[i] < w) below = true;
    if (s.onesRows[i] > w || s.zerosRows[i] > w) above = true;
    if (errors) {
      errors[i] = s.onesRows[i] > w ? 1 : 0;
      errors[h2 + i] = s.zerosRows[i] > w ? 1 : 0;
    }
  }

  return above ? -1 : below ? 1 : 0;
}

/** Is the grid finished: every count balanced and no rule broken? */
export function isComplete(view: GridView): boolean {
  return validateCounts(view, null) === 0 && validateRows(view, null) === 0;
}

/**
 * Mistake-check (Check & Save): re-solve from the **immutable clues alone**
 * to the unique solution, then flag every player-placed cell whose color
 * contradicts it. Returns `[]` when the clues don't deduce a complete
 * solution (a foreign / non-unique board — undecided, so nothing to flag),
 * matching Range/Mosaic. Pure (no state mutation).
 */
export function findMistakes(state: UnrulyState): UnrulyMistake[] {
  const { w2, grid, immutable } = state;
  const clues = grid.map((v, i) => (immutable[i] ? v : EMPTY));
  const solved = solveCopy(state, clues, Number.MAX_SAFE_INTEGER);
  if (!isComplete(solved)) return [];

  const mistakes: UnrulyMistake[] = [];
  for (let i = 0; i < grid.length; i++) {
    if (!immutable[i] && grid[i] !== EMPTY && grid[i] !== solved.grid[i]) {
      mistakes.push({ x: i % w2, y: Math.floor(i / w2) });
    }
  }
  return mistakes;
}

/** Run the full solver from a copy of `view`'s grid and return the solved
 * grid as a `'0'`/`'1'` string, or `null` if it doesn't reach a valid,
 * complete solution (Solve button). */
export function solveToString(view: GridView): string | null {
  const solved = solveCopy(view, view.grid, Number.MAX_SAFE_INTEGER);
  if (!isComplete(solved)) return null;
  let out = "";
  for (const v of solved.grid) out += v === ONE ? "1" : "0";
  return out;
}
