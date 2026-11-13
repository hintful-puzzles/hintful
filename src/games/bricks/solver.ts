/**
 * Bricks' solver: the ladder `bricks.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), the answer check
 * its rules compile to, and the search beneath the ladder.
 *
 * Every technique is upstream's one (`bricks_solver_try`): suppose a color in
 * an open square and see a rule broken at once, so the square is the other
 * color. The description states each way a rule breaks as its own technique:
 * a shaded brick above left nothing to rest on, a number left too few
 * squares, three in a row, a brick with nothing beneath it, and a number
 * given too many.
 *
 * Beneath the ladder, a search by trial and error over it
 * ({@link searchAnswers}) counts a board's answers. It is what an
 * Unreasonable board is dealt by, and what Solve and the mistake check know
 * the answer from at either tier. The hint never runs it.
 *
 * The live error overlay ({@link bricksValidate}) stays the game's own: it
 * judges a board still being filled, which no rule of the answer says, and
 * localizes each break into the flags the renderer draws.
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
} from "../../engine/describe-runtime.ts";
import { entryMistakes } from "../../engine/entry-mistakes.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  type LadderEntry,
  ladderTechniques,
  runLadder,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import * as bricks from "./bricks.compiled.ts";
import {
  BRICKS_STEPS,
  type BricksMistake,
  type BricksState,
  type CellColor,
  COL_MASK,
  F_BOUND,
  F_EMPTY,
  F_SHADE,
  F_UNSHADE,
  FE_ERROR,
  FE_LINE_LEFT,
  FE_LINE_RIGHT,
  FE_TOPLEFT,
  FE_TOPRIGHT,
  FE_WRONG,
  NUM_MASK,
} from "./state.ts";

/** What the description reads a square as holding: a shaded brick, or
 * nothing, which a clear square, a number and a hole all hold. */
const SHADED = 1;
const CLEAR = 2;

/** The number upstream writes for a square that shows none (`?`). */
const UNKNOWN_NUMBER = 7;

/** A board as its padded grid: a state, or a board being dealt. */
interface Board {
  w: number;
  h: number;
  grid: Uint16Array;
}

/** The values the description reads off a padded grid: a number or a hole
 * holds nothing, and an empty square no value. */
function valuesOf(grid: Uint16Array): Uint8Array {
  return Uint8Array.from(grid, (cell) => {
    if (cell & F_BOUND || !(cell & COL_MASK)) return CLEAR;
    const color = cell & COL_MASK;
    return color === F_SHADE ? SHADED : color === F_UNSHADE ? CLEAR : 0;
  });
}

/** The values of a board's numbers and holes alone, every square open. */
const givenOf = (grid: Uint16Array): Uint8Array =>
  valuesOf(grid.map((cell) => (cell & COL_MASK ? F_EMPTY : cell)));

/** The board as the description deals it: its holes and its numbers. A
 * number upstream leaves unknown is a hole. */
function dealtOf({ w, h, grid }: Board): bricks.Dealt {
  const holes: number[] = [];
  const at: number[] = [];
  const values: number[] = [];
  for (let c = 0; c < w * h; c++) {
    const cell = grid[c];
    if (cell & COL_MASK) continue;
    if (cell & F_BOUND || (cell & NUM_MASK) === UNKNOWN_NUMBER) holes.push(c);
    else {
      at.push(c);
      values.push(cell & NUM_MASK);
    }
  }
  return {
    hole: clueList(holes, new Array<number>(holes.length).fill(0), w * h),
    number: clueList(at, values, w * h),
  };
}

/** The space a board's ladder runs on. */
function bricksSpace(w: number, h: number): GridSpace {
  return describedSpace(bricks.units, w, h);
}

/** The marks over `values`, every open square either color. */
function bricksMarks(sp: GridSpace, dl: bricks.Dealt, values: Uint8Array): CellMarks {
  const m = new CellMarks(sp, ~0, values);
  // A number or a hole is placed clear, which its domain allows.
  m.seed(values, (c) => bricks.domainOf(sp, dl, c));
  return m;
}

/** The ladder over the dealt board. */
function bricksLadder(dl: bricks.Dealt): Ladder {
  return describedLadder(bricks, {
    strandSupport: uncluedRung(bricks.strandSupport),
    undercount: compiledRung(bricks.undercount, dl),
    three: uncluedRung(bricks.three),
    unsupported: compiledRung(bricks.unsupported, dl),
    overcount: compiledRung(bricks.overcount, dl),
  });
}

/** Run the ladder on `m` to a fixpoint and say what it reached. */
function deduce(m: CellMarks, ladder: Ladder, dl: bricks.Dealt): Deduced {
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: 0 }, {});
  if (runLadder(m, techniques)) return "contradiction";
  if (m.grid.includes(0)) return "stuck";
  return bricks.isAnswer(m.grid, m.sp, dl) ? "solved" : "contradiction";
}

/** The ladder's run from the board's numbers, the colors `grid` holds not
 * read: what it reached, and the marks it reached it on. */
function deduceBoard(board: Board): { deduced: Deduced; values: Uint8Array } {
  const dl = dealtOf(board);
  const values = givenOf(board.grid);
  const m = bricksMarks(bricksSpace(board.w, board.h), dl, values);
  return { deduced: deduce(m, bricksLadder(dl), dl), values };
}

/** Whether the ladder alone finishes the board from its numbers. The colors
 * `grid` holds are not read. */
export function deductionFinishes(board: Board): boolean {
  return deduceBoard(board).deduced === "solved";
}

/** The squares the ladder shades from the board's numbers, by padded
 * index. The colors `grid` holds are not read. */
export function deducedBricks(board: Board): boolean[] {
  return Array.from(deduceBoard(board).values, (d) => d === SHADED);
}

/** Whether a state's bricks are an answer to its board, by the rules the
 * description compiles to. A square left empty is not shaded. */
export function isSolved(state: BricksState): boolean {
  const values = valuesOf(state.grid).map((v) => v || CLEAR);
  return bricks.isAnswer(values, bricksSpace(state.w, state.h), dealtOf(state));
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a board's answers; the one answer is
 * each square's color, by padded index. */
export type BricksAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one an open square
 * assumed one color and the deduction run from it.
 *
 * It decides which Unreasonable boards exist: a board that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the ladder.
 * Where it stops, the first open square that the ladder refutes one color in
 * takes the other, which is one position and no split: upstream's Normal
 * lookahead, so a board it dealt is searched in about one position a square.
 * Where no color is refuted, the first open square is assumed clear, and
 * then shaded, as upstream's trial did. `grid` is read for its numbers only.
 */
export function searchAnswers(
  board: Board,
  budget: number = SEARCH_BUDGET,
): BricksAnswer {
  const dl = dealtOf(board);
  const ladder = bricksLadder(dl);
  const sp = bricksSpace(board.w, board.h);
  const branch = (m: CellMarks, at: number, d: number): CellMarks => {
    const sub = new CellMarks(sp, m.domain, m.grid.slice());
    sub.cands.set(m.cands);
    sub.place(at, d);
    return sub;
  };
  return searchBoard<CellMarks, Uint8Array>({
    start: bricksMarks(sp, dl, givenOf(board.grid)),
    deduce: (m) => deduce(m, ladder, dl),
    assume(m) {
      const first = m.grid.indexOf(0);
      if (first < 0) return [];
      for (let at = first; at < m.grid.length; at++) {
        if (m.grid[at] !== 0) continue;
        for (const d of [CLEAR, SHADED])
          if (deduce(branch(m, at, d), ladder, dl) === "contradiction")
            return [branch(m, at, CLEAR + SHADED - d)];
      }
      return [CLEAR, SHADED].map((d) => branch(m, first, d));
    },
    solution: (m) => Uint8Array.from(m.grid),
    budget,
  });
}

/** Keyed on a state's dealt board, which every state of a game shares. */
const answers = answerCache<Uint16Array, Uint8Array>();

/** What a search of a state's numbers established about their answers. The
 * player's colors are not read. */
export function answerOf(state: BricksState): BricksAnswer {
  return answers(state.board, () => searchAnswers(state));
}

/** The answer as the colors a solve move paints, by padded index. */
export function answerColors(solution: Uint8Array): CellColor[] {
  return Array.from(solution, (d) => (d === SHADED ? "shade" : "unshade"));
}

// --- the hint's walk ---------------------------------------------------------

/** The kinds of step a hint can be, which the description's `says` names. */
export const BRICKS_RUNGS = bricks.SAYS_KINDS;
export type BricksRung = (typeof BRICKS_RUNGS)[number];

/**
 * What a hint walks from the player's own marks: the marks over the squares
 * they have shaded or cleared, and the ladder's techniques. The caller
 * guarantees the board agrees with its unique answer, so every firing is
 * correct.
 */
export function hintWalk(state: BricksState): {
  marks: CellMarks;
  entries: readonly LadderEntry[];
} {
  const dl = dealtOf(state);
  return {
    marks: bricksMarks(bricksSpace(state.w, state.h), dl, valuesOf(state.grid)),
    entries: bricksLadder(dl).entries,
  };
}

/**
 * The cells Check & Save refuses on, with the flags the render overlay draws:
 * every cell the validity pass finds breaking a rule, and every cell shaded or
 * ruled out against the answer (`FE_WRONG`), which need break none. A board
 * without exactly one answer the search found reports its broken rules alone.
 */
export function findMistakes(state: BricksState): BricksMistake[] {
  const { grid, w, h } = state;
  const errors = new Uint16Array(w * h);
  bricksValidate(grid, w, h, errors);
  const answer = answerOf(state);
  if (answer.kind === "one") {
    const solved = answer.solution;
    const wrong = entryMistakes(
      {
        answer: Uint16Array.from(solved, (d) => (d === SHADED ? F_SHADE : F_UNSHADE)),
        entry: grid.map((c) => c & COL_MASK),
        empty: F_EMPTY,
        // A number, and a hole beside the board, have no play color.
        fixed: (i) => (grid[i] & COL_MASK) === 0,
      },
      (index) => ({ index }),
    );
    for (const { index } of wrong) errors[index] |= FE_WRONG;
  }
  const out: BricksMistake[] = [];
  for (let i = 0; i < errors.length; i++) {
    if (errors[i] !== 0) out.push({ index: i, flags: errors[i] });
  }
  return out;
}

// --- the live error overlay --------------------------------------------------

export type BricksStatus = "complete" | "unfinished" | "invalid";

// Rank so `max` is a plain numeric comparison (upstream STATUS_* ints).
const RANK = { complete: 0, unfinished: 1, invalid: 2 } as const;
const worse = (a: BricksStatus, b: BricksStatus): BricksStatus =>
  RANK[a] >= RANK[b] ? a : b;

function validateThrees(
  w: number,
  h: number,
  grid: Uint16Array,
  errors: Uint16Array | null,
): BricksStatus {
  let ret: BricksStatus = "complete";
  for (let y = 0; y < h; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i1 = y * w + x - 1;
      const i2 = y * w + x;
      const i3 = y * w + x + 1;
      if (
        (grid[i1] & COL_MASK) === F_SHADE &&
        (grid[i2] & COL_MASK) === F_SHADE &&
        (grid[i3] & COL_MASK) === F_SHADE
      ) {
        ret = "invalid";
        if (errors) {
          errors[i1] |= FE_LINE_LEFT;
          errors[i2] |= FE_LINE_LEFT | FE_LINE_RIGHT;
          errors[i3] |= FE_LINE_RIGHT;
        }
      }
    }
  }
  return ret;
}

function validateGravity(
  w: number,
  h: number,
  grid: Uint16Array,
  errors: Uint16Array | null,
): BricksStatus {
  let ret: BricksStatus = "complete";
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      const i1 = y * w + x;
      if ((grid[i1] & COL_MASK) !== F_SHADE) continue;

      const i2 = (y + 1) * w + x - 1;
      const i3 = (y + 1) * w + x;

      let n2 = x === 0 ? F_BOUND : grid[i2];
      if (!(n2 & F_BOUND)) n2 &= COL_MASK;
      let n3 = grid[i3];
      if (!(n3 & F_BOUND)) n3 &= COL_MASK;

      if (n2 !== F_SHADE && n3 !== F_SHADE) ret = worse("unfinished", ret);

      const w2 = !n2 || n2 === F_UNSHADE || n2 === F_BOUND;
      const w3 = !n3 || n3 === F_UNSHADE || n3 === F_BOUND;

      if (w2 && w3) {
        ret = "invalid";
        if (errors) {
          errors[i1] |= FE_ERROR;
          if (n2 !== F_BOUND) errors[i2] |= FE_TOPRIGHT;
          if (n3 !== F_BOUND) errors[i3] |= FE_TOPLEFT;
        }
      }
    }
  }
  return ret;
}

function validateCounts(
  w: number,
  h: number,
  grid: Uint16Array,
  errors: Uint16Array | null,
): BricksStatus {
  let ret: BricksStatus = "complete";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let n = grid[y * w + x];
      if (n & COL_MASK || n & F_BOUND) continue;
      n &= NUM_MASK;
      if (n === UNKNOWN_NUMBER) continue;

      let shade = 0;
      let unshade = 0;
      for (const [dx, dy] of BRICKS_STEPS) {
        const x2 = x + dx;
        const y2 = y + dy;
        if (x2 < 0 || x2 >= w || y2 < 0 || y2 >= h) {
          unshade++;
        } else {
          const n2 = grid[y2 * w + x2];
          if (n2 & COL_MASK) {
            const c = n2 & COL_MASK;
            if (c === F_SHADE) shade++;
            else if (c === F_UNSHADE) unshade++;
          } else {
            unshade++;
          }
        }
      }

      if (shade < n) ret = worse(ret, "unfinished");
      if (shade > n || 6 - unshade < n) {
        ret = "invalid";
        if (errors) errors[y * w + x] |= FE_ERROR;
      }
    }
  }
  return ret;
}

/**
 * The live validity pass (upstream `bricks_validate`), which the renderer
 * and the mistake check draw from: COMPLETE, UNFINISHED or INVALID, and when
 * `errors` is given it is cleared and each break's localized `FE_*` flags are
 * ORed in. It never decides that a board is solved ({@link isSolved} does).
 */
export function bricksValidate(
  grid: Uint16Array,
  w: number,
  h: number,
  errors: Uint16Array | null = null,
): BricksStatus {
  errors?.fill(0);
  let ret = validateThrees(w, h, grid, errors);
  ret = worse(validateGravity(w, h, grid, errors), ret);
  return worse(validateCounts(w, h, grid, errors), ret);
}
