/**
 * Boats' solver: the ladder `boats.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/ladder-runtime.ts`), with the reason
 * each technique records for the hint; and the answer check its rules
 * compile to.
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

import {
  clueList,
  describedSpace,
  type GridSpace,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  type Said,
  TIERS,
  uncluedPlacingRung,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { NO_SOLUTION, type SolveFailure } from "../../engine/solve-failure.ts";
import type { Point } from "../../engine/types.ts";
import * as boats from "./boats.compiled.ts";
import {
  type BoatsBoard,
  type BoatsState,
  boardOf,
  CORRUPT,
  cloneBoard,
  DIFF_EASY,
  DIFF_HARD,
  EMPTY,
  isShip,
  NO_CLUE,
  SHIP_VAGUE,
  STATUS_INVALID,
  WATER,
} from "./state.ts";
import {
  adjustShips,
  checkCollision,
  checkFleet,
  countShips,
  FE_COLLISION,
  FE_FLEET,
  FE_MISMATCH,
  fleetShipCount,
  validateFullState,
  validateGridClues,
} from "./validate.ts";

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

/** The description's line for a border number's slot: its lines are the
 * rows and then the columns, where a slot is a column and then a row. */
function lineOfSlot(b: BoatsBoard, slot: number): number {
  return slot < b.w ? b.h + slot : slot - b.w;
}
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

// --- the hint's vocabulary ---------------------------------------------------

/** A square the deduction decides, and what it decides it to be. */
export interface BoatsSquare {
  x: number;
  y: number;
  ship: boolean;
}

/** A row or column, named the way the player reads it: 1-based, counting from
 * the top / the left, alongside the occupancy number drawn beside it. */
export interface BoatsLine {
  horizontal: boolean;
  /** 0-based row (`horizontal`) or column index. */
  index: number;
  /** The occupancy number, which may be one the deduction read from the
   * fleet — see {@link BoatsLine.deduced}. */
  clue: number;
  /** True when the puzzle hides this number and the deduction read it, so
   * the narration must say where it came from rather than cite a number the
   * player cannot see. */
  deduced: boolean;
}

/** Why the board rejects a Hard tier's trial — read off the validators' own
 * error arrays (docs/hints-marks.md § "Read the reason off the validator"). */
export type BoatsBreach =
  /** Two boats would touch, if only at a corner. */
  | { kind: "collision" }
  /** A row or column's occupancy number could no longer be met. */
  | { kind: "count"; line: BoatsLine }
  /** The fleet has no boat of the size that would be formed. */
  | { kind: "fleet" }
  /** More (or fewer) ship squares than the whole fleet accounts for. */
  | { kind: "fleetTotal"; tooMany: boolean }
  /** A given segment's own shape would be contradicted. */
  | { kind: "clue" }
  /**
   * The board is left with no legal way to finish, without one rule naming
   * itself the culprit. Honest catch-all rather than a fabricated cause
   * (docs/hints-marks.md § "Honest non-local evidence").
   */
  | { kind: "unfinishable" };

/** What a trial says beside what its description says of it: the rule its
 * supposition breaks, and the squares that rule flags. */
interface TrialSays<T> {
  terms: T & { breach: BoatsBreach };
  marks: {
    outline: readonly number[];
    stripes: readonly number[];
    reads: readonly number[];
  };
}

/** What each technique says, as the hint's sentences read it: the compiled
 * module's, with the three trials' completed by their reason callbacks. */
export type BoatsSays = Omit<
  boats.SaysById,
  "lastWater" | "lastShip" | "centerTrial"
> & {
  lastWater: TrialSays<boats.SaysById["lastWater"]["terms"]>;
  lastShip: TrialSays<boats.SaysById["lastShip"]["terms"]>;
  centerTrial: TrialSays<boats.SaysById["centerTrial"]["terms"]>;
};

// --- the reasons, read off each firing's binding -----------------------------

/** What the reasons read beside the marks: the board's size and clues. */
interface Board {
  b: BoatsBoard;
  sp: GridSpace;
}

/** The number beside line `L`: shown, or read from the fleet where every
 * other line the same way shows one or is decided; -1 where neither. */
function numOf(B: Board, m: CellMarks, L: number): number {
  const { b, sp } = B;
  const shown = b.borderClues[slotOfLine(b, L)];
  if (shown !== NO_CLUE) return shown;
  const rows = L < b.h;
  let sum = 0;
  for (let M = rows ? 0 : b.h; M < (rows ? b.h : b.h + b.w); M++) {
    if (M === L) continue;
    const v = b.borderClues[slotOfLine(b, M)];
    if (v !== NO_CLUE) {
      sum += v;
      continue;
    }
    const cells = sp.lineCells[M];
    if (cells.some((c) => !m.known(c))) return -1;
    sum += cells.filter((c) => m.grid[c] === SHIP).length;
  }
  const v = fleetShipCount(b) - sum;
  return v >= 0 && v <= sp.lineCells[L].length ? v : -1;
}

function lineOf(B: Board, m: CellMarks, L: number): BoatsLine {
  const { b } = B;
  const horizontal = L < b.h;
  return {
    horizontal,
    index: horizontal ? L : L - b.h,
    clue: numOf(B, m, L),
    deduced: b.borderClues[slotOfLine(b, L)] === NO_CLUE,
  };
}

/** The marks as the game's grid: a ship segment and water, the rest empty. */
function gameGrid(m: CellMarks): Int8Array {
  return Int8Array.from(m.grid, (v) =>
    v === SHIP ? SHIP_VAGUE : v === SEA ? WATER : EMPTY,
  );
}

/**
 * Classify *why* a trial board is contradictory by running the validation
 * family with its own error arrays and reading the flags back (Bricks'
 * pattern, docs/hints-marks.md § "Read the reason off the validator"). A
 * fixed priority picks the clearest reason when several fire at once, and
 * every branch ends in a reason, `unfinishable` the honest catch-all, since
 * `validateFullState` says INVALID through paths that flag nothing.
 */
function classifyBreach(
  B: Board,
  m: CellMarks,
  trial: BoatsBoard,
): { breach: BoatsBreach; cells: number[] } {
  const { w, h } = trial;
  const cellErrs = new Int32Array(w * h);
  const lineErrs = new Int32Array(w + h);

  const countStatus = countShips(trial, undefined, undefined, lineErrs);
  const collided = checkCollision(trial, cellErrs);
  const fleetStatus = checkFleet(trial, undefined, cellErrs);
  validateGridClues(trial, cellErrs);

  const cellsAt = (pred: (i: number) => boolean): number[] => {
    const out: number[] = [];
    for (let i = 0; i < w * h; i++) if (pred(i)) out.push(i);
    return out;
  };
  const flagged = (mask: number) => cellsAt((i) => (cellErrs[i] & mask) !== 0);

  // A `CORRUPT` square is a placement over its opposite, which in a trial
  // only the never-touch water round a segment makes: two boats touching.
  const corrupt = cellsAt((i) => trial.grid[i] === CORRUPT);
  if (collided || corrupt.length > 0) {
    // The collision flag sits on the top-left cell of the offending 2×2; show
    // all four, so the player sees the corner rather than one lone square.
    const cells = [...corrupt];
    for (const c of flagged(FE_COLLISION)) cells.push(c, c + 1, c + w, c + w + 1);
    return { breach: { kind: "collision" }, cells };
  }

  if (countStatus === STATUS_INVALID)
    for (let slot = 0; slot < w + h; slot++) {
      if (lineErrs[slot] !== STATUS_INVALID) continue;
      const L = lineOfSlot(trial, slot);
      return {
        breach: { kind: "count", line: lineOf(B, m, L) },
        cells: [...B.sp.lineCells[L]],
      };
    }

  const fleetCells = flagged(FE_FLEET);
  if (fleetCells.length > 0) return { breach: { kind: "fleet" }, cells: fleetCells };

  const clueCells = flagged(FE_MISMATCH);
  if (clueCells.length > 0) return { breach: { kind: "clue" }, cells: clueCells };

  // `adjustShips`' own verdict: too many ship squares for the fleet, or too
  // few squares left undecided to fit it.
  const maxShips = fleetShipCount(trial);
  let ships = 0;
  let water = 0;
  for (let i = 0; i < w * h; i++) {
    if (isShip(trial.grid[i])) ships++;
    else if (trial.grid[i] === WATER) water++;
  }
  if (ships > maxShips || w * h - water < maxShips)
    return {
      breach: { kind: "fleetTotal", tooMany: ships > maxShips },
      cells: cellsAt((i) => isShip(trial.grid[i])),
    };

  // …and `checkFleet` reporting one size over-placed without flagging it.
  if (fleetStatus === STATUS_INVALID)
    return { breach: { kind: "fleet" }, cells: cellsAt((i) => isShip(trial.grid[i])) };

  return { breach: { kind: "unfinishable" }, cells: [] };
}

/**
 * A Hard trial's reason: what its description says of it, and the rule that
 * breaks on the board with `ships` and `waters` placed as the trial supposes.
 * A line that could no longer reach its number is the one line the sentence
 * names, so it is hatched and not outlined.
 */
function trialReason<Binding, T extends object>(
  B: Board,
  m: CellMarks,
  binding: Binding,
  says: { terms: T; marks: { outline?: readonly number[] } },
  ships: readonly number[],
  waters: readonly number[],
): Said<Binding, TrialSays<T>> {
  const trial = cloneBoard(B.b);
  trial.grid.set(gameGrid(m));
  const { w } = B.sp;
  for (const c of ships) placeShip(trial, c % w, (c / w) | 0);
  for (const c of waters) placeWater(trial, c % w, (c / w) | 0);
  validateFullState(trial);
  const found = classifyBreach(B, m, trial);
  const outline = says.marks.outline ?? [];
  const { breach } = found;
  const counted = breach.kind === "count";
  const stripes = counted
    ? B.sp.lineCells[
        breach.line.horizontal ? breach.line.index : B.b.h + breach.line.index
      ]
    : [];
  return {
    binding,
    says: {
      terms: { ...says.terms, breach: found.breach },
      marks: {
        outline: counted ? outline : [...outline, ...found.cells],
        stripes: [...stripes],
        reads: [...stripes],
      },
    },
  };
}

/** The ladder over the dealt board: each technique records what it says
 * for the hint, the three trials adding the rule they break. */
function boatsLadder(B: Board, dl: boats.Dealt): Ladder {
  return describedLadder(boats, {
    given: compiledRung(boats.given, dl),
    near: uncluedRung(boats.near),
    touch: uncluedPlacingRung(boats.touch),
    lineShips: compiledRung(boats.lineShips, dl),
    total: compiledRung(boats.total, dl),
    center: compiledRung(boats.center, dl),
    extend: compiledRung(boats.extend, dl),
    lineWater: compiledRung(boats.lineWater, dl),
    isolated: compiledRung(boats.isolated, dl),
    grow: compiledRung(boats.grow, dl),
    onlyFit: compiledRung(boats.onlyFit, dl),
    centerRoom: compiledRung(boats.centerRoom, dl),
    tooLong: compiledRung(boats.tooLong, dl),
    shortRun: compiledRung(boats.shortRun, dl),
    hidden: compiledRung(boats.hidden, dl),
    onlyRuns: compiledRung(boats.onlyRuns, dl),
    shared: compiledRung(boats.shared, dl),
    lastWater: compiledRung(boats.lastWater, dl, (binding, _c, _n, m, says) =>
      trialReason(B, m, binding, says, binding.H, [binding.c]),
    ),
    lastShip: compiledRung(boats.lastShip, dl, (binding, _c, _n, m, says) =>
      trialReason(B, m, binding, says, [binding.c], binding.W),
    ),
    centerTrial: compiledRung(boats.centerTrial, dl, (binding, _c, _n, m, says) =>
      trialReason(B, m, binding, says, binding.S, []),
    ),
  });
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
  const ladder = boatsLadder({ b, sp }, dl);
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
  const ladder = boatsLadder({ b, sp }, dealtOf(b));
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
