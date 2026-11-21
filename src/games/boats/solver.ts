/**
 * Boats' solver: the ladder `boats.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/solve/cell-marks.ts` and
 * `ladder-runtime.ts`), with the reason each technique records for the hint;
 * and the answer check its rules compile to.
 *
 * One ladder serves the generator, which keeps a removed clue only while the
 * board still solves, so its verdict on every intermediate board decides
 * which puzzles exist; `solve()`; `findMistakes`; the difficulty; and the
 * hint, which walks it. No technique guesses: the Hard tier's trials suppose
 * one square the last of its kind its line needs, fill the rest of the line
 * the other way, and read the rules once, a Check
 * (docs/solver-and-generator.md § "Check, Tactic, Search"). So a board the
 * ladder fills is uniquely solved, at every tier.
 */

import { PUZZLE_NOT_REASONABLE } from "../../engine/contract/hint-refusal.ts";
import type { RulesOf } from "../../engine/contract/rules.ts";
import { NO_SOLUTION, type SolveFailure } from "../../engine/contract/solve-failure.ts";
import type { Point } from "../../engine/contract/types.ts";
import { CellMarks } from "../../engine/solve/cell-marks.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  rangeMask,
} from "../../engine/solve/describe-runtime.ts";
import { describedRules } from "../../engine/solve/described-rules.ts";
import {
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../../engine/solve/ladder-runtime.ts";
import * as boats from "../../generated/games/boats/boats.compiled.ts";
import {
  type BoatsBoard,
  type BoatsState,
  boardOf,
  CORRUPT,
  DIFF_EASY,
  DIFF_HARD,
  EMPTY,
  isShip,
  NO_CLUE,
  SHIP_VAGUE,
  WATER,
} from "./state.ts";
import { adjustShips } from "./validate.ts";

/**
 * What a solve concluded: solved, with the highest tier a firing needed;
 * stuck, the ladder out of firings with the board unfinished; or invalid,
 * the board contradicting itself.
 */
export type BoatsSolveResult =
  | { kind: "solved"; diff: number }
  | { kind: "stuck" }
  | { kind: "invalid" };

// --- primitive placements --------------------------------------------------

/**
 * Upstream `boats_solver_place_water`. Returns how many squares changed (0 if
 * out of bounds or already water). Writing over a ship yields `CORRUPT`, which
 * the validator reads as a contradiction.
 */
export function placeWater(b: BoatsBoard, x: number, y: number): number {
  const { w, h, grid } = b;
  if (x < 0 || x >= w || y < 0 || y >= h) return 0;
  const i = y * w + x;
  if (isShip(grid[i])) {
    grid[i] = CORRUPT;
    return 1;
  }
  if (grid[i] === EMPTY) {
    grid[i] = WATER;
    return 1;
  }
  return 0;
}

/**
 * Upstream `boats_solver_place_ship`: place a ship and, since boats never touch
 * diagonally, water on all four diagonal neighbors. Out of bounds places
 * nothing.
 */
function placeShip(b: BoatsBoard, x: number, y: number): number {
  const { w, h, grid } = b;
  if (x < 0 || x >= w || y < 0 || y >= h) return 0;
  const i = y * w + x;
  if (grid[i] === WATER) {
    grid[i] = CORRUPT;
    return 1;
  }
  if (grid[i] === EMPTY) {
    grid[i] = SHIP_VAGUE;
    let ret = 1;
    ret += placeWater(b, x - 1, y - 1);
    ret += placeWater(b, x + 1, y - 1);
    ret += placeWater(b, x - 1, y + 1);
    ret += placeWater(b, x + 1, y + 1);
    return ret;
  }
  return 0;
}

/** Upstream `boats_solver_fill_row`: fill an axis-aligned block. */
export function fillRow(
  b: BoatsBoard,
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  fill: number,
): number {
  let ret = 0;
  for (let x = sx; x <= ex; x++) {
    for (let y = sy; y <= ey; y++) {
      if (b.grid[y * b.w + x] !== EMPTY) continue;
      if (isShip(fill)) ret += placeShip(b, x, y);
      else if (fill === WATER) ret += placeWater(b, x, y);
    }
  }
  return ret;
}

// --- the board as the description reads it ---------------------------------

/** A square's value as the description numbers it: a boat segment and
 * water. */
export const SHIP = 1;
export const SEA = 2;

const describedOf = (cell: number): number =>
  isShip(cell) ? SHIP : cell === WATER ? SEA : 0;

/** A border number's slot for the description's line: its lines are the
 * rows and then the columns, where a slot is a column and then a row. */
function slotOfLine(b: BoatsBoard, L: number): number {
  return L < b.h ? b.w + L : L - b.h;
}

/** The board as the description deals it: a number beside each line that
 * shows one, each given square, and the fleet. */
function dealtOf(b: BoatsBoard): boats.Dealt {
  const nAt: number[] = [];
  const nV: number[] = [];
  for (let L = 0; L < b.w + b.h; L++) {
    const v = b.borderClues[slotOfLine(b, L)];
    if (v === NO_CLUE) continue;
    nAt.push(L);
    nV.push(v);
  }
  const segAt: number[] = [];
  const segV: number[] = [];
  b.gridClues.forEach((v, c) => {
    if (v === EMPTY) return;
    segAt.push(c);
    segV.push(v);
  });
  return {
    n: clueList(nAt, nV, b.w + b.h),
    seg: clueList(segAt, segV, b.w * b.h),
    fleet: {
      n: b.fleet,
      length: Array.from({ length: b.fleet }, (_, i) => i + 1),
      boats: b.fleetData.slice(0, b.fleet),
    },
  };
}

/** The board as its rules read it: a boat segment, water, or nothing yet. */
export const rules: RulesOf<BoatsState> = describedRules(boats, {
  grid: (s) => Uint8Array.from(s.grid, describedOf),
  size: (s) => [s.params.w, s.params.h],
  deals: (s) => [dealtOf(boardOf(s))],
});

/** Per-square live marks: two boats touching at a corner, the flag on the
 * top-left square of the four; a given segment the board contradicts; and a
 * square of a boat no length in the fleet fits. */
export const FE_COLLISION = 0x01;
export const FE_MISMATCH = 0x02;
export const FE_FLEET = 0x04;

const TOUCHING: boats.RuleName = "shape.0";
const NO_LENGTH: boats.RuleName = "shape.1";
const TOO_LONG: boats.RuleName = "shape.4";

/** Where the board breaks its rules, as the renderer draws it: each border
 * number broken, by its slot, and each square's `FE_*` marks. The fleet's
 * total, which the numbers count out line by line, is drawn by none. */
export function brokenMarks(s: BoatsState): { slots: Uint8Array; cells: Int32Array } {
  const { w, h } = s.params;
  const slots = new Uint8Array(w + h);
  const cells = new Int32Array(w * h);
  const board = boardOf(s);
  const dl = dealtOf(board);
  const g = rules.grid(s);
  for (const v of rules.violations(s, g)) {
    if (v.rule === TOUCHING) {
      const [a, b] = v.at;
      cells[Math.min(a % w, b % w) + Math.min((a / w) | 0, (b / w) | 0) * w] |=
        FE_COLLISION;
    } else if (v.rule === "clue.seg") cells[dl.seg.at[v.clue]] |= FE_MISMATCH;
    else if (v.rule === "clue.n") slots[slotOfLine(board, dl.n.at[v.clue])] = 1;
    else if (v.rule === TOO_LONG) cells[v.at[0]] |= FE_FLEET;
    else if (v.rule === NO_LENGTH) {
      // The boat its head starts, right or down.
      const c = v.at[0];
      const step = c % w < w - 1 && g[c + 1] === SHIP ? 1 : w;
      for (let x = c; x < w * h && g[x] === SHIP; x += step) {
        cells[x] |= FE_FLEET;
        if (step === 1 && x % w === w - 1) break;
      }
    }
  }
  return { slots, cells };
}

// --- the hint's vocabulary ---------------------------------------------------

/** A square the deduction decides, and what it decides it to be. */
export interface BoatsSquare {
  x: number;
  y: number;
  ship: boolean;
}

/** The marks as the game's grid: a ship segment and water, the rest empty. */
function gameGrid(m: CellMarks): Int8Array {
  return Int8Array.from(m.grid, (v) =>
    v === SHIP ? SHIP_VAGUE : v === SEA ? WATER : EMPTY,
  );
}

/** The marks over `grid`, a value a square and 0 for none. False where two
 * of its values clash. The water round the segments `grid` starts with is
 * left to `near`, so the hint walks it as a step the player sees: seeding
 * runs no placing technique. */
function marksOf(sp: GridSpace, grid: Uint8Array, ladder: Ladder): CellMarks | null {
  const m = new CellMarks(sp, rangeMask(1, 2), grid);
  if (!m.seed(grid)) return null;
  m.placing = ladder.placing;
  return m;
}

// --- the solve ---------------------------------------------------------------

/**
 * Solve `b` from its clues alone by the ladder up to `cap`. **Writes `b.grid`**:
 * on return it holds however far the deduction got, each segment's shape
 * resolved from its neighbors.
 */
export function solveBoats(b: BoatsBoard, cap: number): BoatsSolveResult {
  const sp = describedSpace(boats.units, b.w, b.h);
  const dl = dealtOf(b);
  const ladder = describedLadder(boats, dl);
  const grid = new Uint8Array(b.w * b.h);
  const m = marksOf(sp, grid, ladder);
  if (m === null) return { kind: "invalid" };
  const grades: Record<string, number> = {};
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: cap }, grades),
  );
  if (impossible) {
    b.grid.set(gameGrid(m));
    adjustShips(b);
    return { kind: "invalid" };
  }
  // The game is won once the fleet is placed, the water unmarked, and so is
  // the solve: the squares left open are water where that is an answer, and
  // no other answer has a segment more.
  if (grid.includes(0)) {
    const sea = grid.map((v) => (v === 0 ? SEA : v));
    if (boats.isAnswer(sea, sp, dl)) grid.set(sea);
  }
  b.grid.set(gameGrid(m));
  adjustShips(b);
  if (grid.includes(0)) return { kind: "stuck" };
  if (!boats.isAnswer(grid, sp, dl)) return { kind: "invalid" };
  return { kind: "solved", diff: grades[TIERS] ?? DIFF_EASY };
}

/** Whether the whole grid `grid` is an answer to the board `b` deals. */
export function isBoatsAnswer(b: BoatsBoard, grid: ArrayLike<number>): boolean {
  const sp = describedSpace(boats.units, b.w, b.h);
  return boats.isAnswer(Uint8Array.from(grid, describedOf), sp, dealtOf(b));
}

// --- entry points for `solve()` and `findMistakes()` ------------------------

/**
 * Solve from the given clues alone and return the completed grid. The
 * player's own marks play no part. Every technique is sound and a higher cap
 * only adds some, so the top cap solves whatever any cap does.
 */
export function solveToGrid(
  state: BoatsState,
): { ok: true; grid: Int8Array } | { ok: false; error: SolveFailure } {
  const b = boardOf(state);
  const result = solveBoats(b, DIFF_HARD);
  if (result.kind === "invalid") return { ok: false, error: NO_SOLUTION };
  if (result.kind === "stuck") return { ok: false, error: PUZZLE_NOT_REASONABLE };
  return { ok: true, grid: b.grid };
}

/** A cell the player has decided that the unique solution contradicts. */
export type BoatsMistake = Point;

/**
 * Re-solve the puzzle from its clues to the unique solution and report every
 * square the player has decided differently — the Check & Save basis
 * (docs/solver-and-generator.md § "The solvable-game contract"). Returns
 * `[]` when the board is not uniquely deducible, so a puzzle the solver cannot
 * finish never accuses the player.
 *
 * A re-solve is the right basis here rather than the live rule checks, which
 * this game also renders: a player can place a locally-legal boat on a square
 * the solution has as water without yet exceeding a number or touching another
 * boat, and a live-only check would let Check & Save bless that board.
 */
export function findMistakes(state: BoatsState): readonly BoatsMistake[] {
  const { w, h } = state.params;
  const solved = solveToGrid(state);
  if (!solved.ok) return [];

  const out: BoatsMistake[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const player = state.grid[i];
      if (player === EMPTY) continue;
      if (isShip(player) !== isShip(solved.grid[i])) out.push({ x, y });
    }
  }
  return out;
}

// --- the hint's walk ---------------------------------------------------------

/**
 * What a hint walks: the ladder over the player's own board, as
 * marks that leave the water round a segment to `touch`, so the walk shows it
 * as part of the step that places the segment. Null where the board's marks
 * clash.
 */
export function hintWalk(
  state: BoatsState,
): { marks: CellMarks; entries: Ladder["entries"] } | null {
  const b = boardOf(state);
  const sp = describedSpace(boats.units, b.w, b.h);
  const ladder = describedLadder(boats, dealtOf(b));
  const m = marksOf(sp, Uint8Array.from(b.grid, describedOf), ladder);
  return m === null ? null : { marks: m, entries: ladder.entries };
}

/**
 * The lowest tier at which the puzzle solves from its clues alone, so the walk
 * teaches the tier the board needs and does not move as the player plays
 * (docs/hints-search.md § "Recompute-stable plans").
 */
export function lowestSolvingDiff(state: BoatsState): number {
  const result = solveBoats(boardOf(state), DIFF_HARD);
  return result.kind === "solved" ? result.diff : DIFF_HARD;
}
