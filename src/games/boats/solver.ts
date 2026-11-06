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
  PLACE,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  runLadder,
  type Taken,
  TIERS,
  uncluedPlacingRung,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { NO_SOLUTION, type SolveFailure } from "../../engine/solve-failure.ts";
import { stepBudget } from "../../engine/step-budget.ts";
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
  DIFFCOUNT,
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
const SHIP = 1;
const SEA = 2;

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

/**
 * The named technique that forced a firing, carrying exactly what its
 * narration needs, in the order the tiers introduce them.
 */
export type BoatsTechnique =
  // --- Easy ---
  /** A given end cap or single says which way its boat runs. */
  | { kind: "givenClue"; shape: number }
  /** Boats never touch, so the diagonals of a segment are water. */
  | { kind: "neverTouch" }
  /** A line already shows all the ships its number allows. */
  | { kind: "lineSatisfied"; line: BoatsLine }
  /** A line has exactly as many free squares left as ships still to place. */
  | { kind: "lineForced"; line: BoatsLine }
  /** Every square of water is accounted for, so the rest is fleet. */
  | { kind: "allWaterPlaced" }
  /** A center segment with water to one side must run along the other axis. */
  | { kind: "centerForced"; vertical: boolean; center: Point; water: Point }
  /** Every 1-boat is placed, so a square hemmed in on all four sides is water. */
  | { kind: "isolated" }
  /** Every 1-boat is placed, so a segment hemmed in on three sides continues
   * into the fourth. */
  | { kind: "mustExtend" }
  // --- Normal ---
  /** A center segment's line cannot take the two more ships that direction needs. */
  | { kind: "centerCount"; line: BoatsLine; vertical: boolean; room: number }
  /** Filling a square would join runs into a boat longer than any left. */
  | { kind: "growTooLong"; joined: number; largest: number }
  /** Every boat of this length is placed, so an unfinished one must be longer. */
  | { kind: "mustGrow"; length: number }
  /** Every boat of this length is placed, so a run of exactly that length must
   * not be filled. */
  | { kind: "runTooShort"; length: number }
  /** The runs that can still hold the largest missing boat are exactly as many
   * as there are such boats, so every one of them is used. */
  | { kind: "onlyRunsLeft"; size: number; runs: number }
  // --- Tricky ---
  /** Three squares in a nearly-full line can't all be water, and whichever is
   * a ship, the middle one's two sides are water: an outer one touches them at
   * a corner, and the middle one (`middle`, when it counts) would fill its own
   * crossing line. */
  | { kind: "sharedDiagonal"; line: BoatsLine; room: number; middle: Point | null }
  // --- Hard ---
  /** The opposite placement immediately contradicts the board. `center` is the
   * given middle segment when the trial ran its boat one way through it
   * (`vertical`), rather than trying a single square. */
  | {
      kind: "refuted";
      trialShip: boolean;
      breach: BoatsBreach;
      center: { at: Point; vertical: boolean } | null;
      /** A square's trial: the line it was the last of its kind in, filled
       * with the other kind, and whether the crossing line was filled too.
       * `null` for a middle segment's. */
      filled: { horizontal: boolean; crossing: boolean } | null;
    };

/** The rungs a hint step can be: the techniques' kinds. */
export const BOATS_RUNGS = [
  "givenClue",
  "neverTouch",
  "lineSatisfied",
  "lineForced",
  "allWaterPlaced",
  "centerForced",
  "isolated",
  "mustExtend",
  "centerCount",
  "growTooLong",
  "mustGrow",
  "runTooShort",
  "onlyRunsLeft",
  "sharedDiagonal",
  "refuted",
] as const;
export type BoatsRung = (typeof BOATS_RUNGS)[number];

/** One deduction: what it forces, what follows from that by the never-touch
 * rule, and the squares it reasons over. */
export interface BoatsFiring {
  technique: BoatsTechnique;
  /** The squares the player is asked to decide — always still undecided. */
  squares: BoatsSquare[];
  /**
   * Water that follows from this firing's own placements because boats never
   * touch. Shown as part of the step so the player sees the rule doing its
   * work, but never narrated separately.
   */
  consequences: BoatsSquare[];
  /** The particular cells the deduction reasons from, outlined `COL_HINT_CELL`. */
  evidence: Point[];
  /** The row or column the sentence names ("Row 3 still needs…"), hatched with
   * its clue; empty when it names none (docs/hints-marks.md § "Hatch the line
   * the sentence names"). */
  line: Point[];
  /**
   * The grid **as this firing fired** — every earlier firing applied, this one
   * not yet. The step's move is built against it (a `fill` move is a rectangle
   * that sets every still-empty cell in its span), and it is the board the
   * narration and the shaded area describe.
   */
  grid: Int8Array;
}

/** What a firing's reason carries: its technique, in the narration's terms,
 * and the squares and line it reasons from. */
interface BoatsReason {
  technique: BoatsTechnique;
  evidence: readonly number[];
  line: number;
}

// --- the reasons, read off each firing's binding -----------------------------

/** What the reasons read beside the marks: the board's size and clues. */
interface Board {
  b: BoatsBoard;
  sp: GridSpace;
}

const pointOf = (sp: GridSpace, c: number): Point => ({
  x: c % sp.w,
  y: (c / sp.w) | 0,
});

/** The square beside `c` in direction `d`, numbered as `step` numbers them:
 * 1 up, 2 down, 3 left, 4 right; -1 off the board. */
function stepOf(sp: GridSpace, c: number, d: number): number {
  const { w, h } = sp;
  const x = c % w;
  const y = (c / w) | 0;
  if (d === 1) return y > 0 ? c - w : -1;
  if (d === 2) return y < h - 1 ? c + w : -1;
  if (d === 3) return x > 0 ? c - 1 : -1;
  return x < w - 1 ? c + 1 : -1;
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

/** The segments of the boat through ship `c`, along its row and its column. */
function boatAt(sp: GridSpace, m: CellMarks, c: number): number[] {
  const out = [c];
  for (const d of [1, 2, 3, 4])
    for (let x = stepOf(sp, c, d); x >= 0 && m.grid[x] === SHIP; x = stepOf(sp, x, d))
      out.push(x);
  return out;
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

/** A Hard trial's reason: the board with `ships` and `waters` placed as the
 * trial supposes, and the rule that breaks. */
function trialReason(
  B: Board,
  m: CellMarks,
  ships: readonly number[],
  waters: readonly number[],
  technique: (breach: BoatsBreach) => BoatsTechnique,
  evidence: readonly number[],
): BoatsReason {
  const trial = cloneBoard(B.b);
  trial.grid.set(gameGrid(m));
  const { w } = B.sp;
  for (const c of ships) placeShip(trial, c % w, (c / w) | 0);
  for (const c of waters) placeWater(trial, c % w, (c / w) | 0);
  validateFullState(trial);
  const found = classifyBreach(B, m, trial);
  // A line that could no longer reach its number is the one line the
  // sentence names, so it is the hatch rather than an outline.
  if (found.breach.kind === "count") {
    const { line } = found.breach;
    return {
      technique: technique(found.breach),
      evidence,
      line: line.horizontal ? line.index : B.b.h + line.index,
    };
  }
  return {
    technique: technique(found.breach),
    evidence: [...evidence, ...found.cells],
    line: -1,
  };
}

/** The runs that could take a boat of `size` along them, as `takes` reads
 * them, each as its squares. */
function runsTaking(B: Board, m: CellMarks, size: number): number[][] {
  const { b, sp } = B;
  const out: number[][] = [];
  for (let L = 0; L < b.w + b.h; L++) {
    const cells = sp.lineCells[L];
    const v = b.borderClues[slotOfLine(b, L)];
    const lineShips = cells.filter((c) => m.grid[c] === SHIP).length;
    let run: number[] = [];
    for (let i = 0; i <= cells.length; i++) {
      if (i < cells.length && m.grid[cells[i]] !== SEA) {
        run.push(cells[i]);
        continue;
      }
      const ships = run.filter((c) => m.grid[c] === SHIP).length;
      if (
        run.length >= size &&
        ships < run.length &&
        (v === NO_CLUE || v - lineShips + ships >= size)
      )
        out.push(run);
      run = [];
    }
  }
  return out;
}

/** The ladder over the dealt board, each technique with its reason. */
function boatsLadder(B: Board, dl: boats.Dealt): Ladder {
  const { b, sp } = B;
  const none: readonly number[] = [];
  // A line's number decides its open squares: boat segments, or water.
  const line = (L: number, ships: boolean, m: CellMarks): BoatsReason => {
    const ln = lineOf(B, m, L);
    return {
      technique: ships
        ? { kind: "lineForced", line: ln }
        : { kind: "lineSatisfied", line: ln },
      evidence: none,
      line: L,
    };
  };
  return describedLadder(boats, {
    given: compiledRung(
      boats.given,
      dl,
      ({ c, v }): BoatsReason => ({
        technique: { kind: "givenClue", shape: v },
        evidence: [c],
        line: -1,
      }),
    ),
    near: uncluedRung(
      boats.near,
      ({ c }): BoatsReason => ({
        technique: { kind: "neverTouch" },
        evidence: [c],
        line: -1,
      }),
    ),
    touch: uncluedPlacingRung(boats.touch),
    lineShips: compiledRung(boats.lineShips, dl, ({ L }, _c, _n, m) =>
      line(L, true, m),
    ),
    total: compiledRung(
      boats.total,
      dl,
      (): BoatsReason => ({
        technique: { kind: "allWaterPlaced" },
        evidence: none,
        line: -1,
      }),
    ),
    center: compiledRung(boats.center, dl, ({ c, a, b: o }, _c, _n, m): BoatsReason => {
      // The side that is water, or off the board, which counts as water and
      // the narration names as the board's edge.
      const d =
        [a, o].find((e) => stepOf(sp, c, e) < 0 || m.grid[stepOf(sp, c, e)] === SEA) ??
        a;
      const x = stepOf(sp, c, d);
      return {
        technique: {
          kind: "centerForced",
          vertical: a === 3,
          center: pointOf(sp, c),
          water: x >= 0 ? pointOf(sp, x) : offBoard(sp, c, d),
        },
        evidence: x >= 0 ? [c, x] : [c],
        line: -1,
      };
    }),
    extend: compiledRung(
      boats.extend,
      dl,
      ({ c }): BoatsReason => ({
        technique: { kind: "mustExtend" },
        evidence: [c],
        line: -1,
      }),
    ),
    lineWater: compiledRung(boats.lineWater, dl, ({ L }, _c, _n, m) =>
      line(L, false, m),
    ),
    isolated: compiledRung(
      boats.isolated,
      dl,
      ({ c }): BoatsReason => ({
        technique: { kind: "isolated" },
        evidence: [1, 2, 3, 4].map((d) => stepOf(sp, c, d)).filter((x) => x >= 0),
        line: -1,
      }),
    ),
    grow: compiledRung(
      boats.grow,
      dl,
      ({ G }): BoatsReason => ({
        technique: { kind: "mustGrow", length: G.length },
        evidence: G,
        line: -1,
      }),
    ),
    onlyFit: compiledRung(
      boats.onlyFit,
      dl,
      ({ m: size }, _c, _n, m): BoatsReason => ({
        technique: { kind: "onlyRunsLeft", size, runs: 1 },
        evidence: runsTaking(B, m, size).flat(),
        line: -1,
      }),
    ),
    centerRoom: compiledRung(
      boats.centerRoom,
      dl,
      ({ c, L, v }, _c, _n, m): BoatsReason => ({
        technique: {
          kind: "centerCount",
          line: lineOf(B, m, L),
          vertical: L < b.h,
          room: v - sp.lineCells[L].filter((x) => m.grid[x] === SHIP).length,
        },
        evidence: [c],
        line: L,
      }),
    ),
    tooLong: compiledRung(boats.tooLong, dl, ({ M, c }, _c, _n, m): BoatsReason => {
      const segs = [1, 2, 3, 4]
        .map((d) => stepOf(sp, c, d))
        .filter((x) => x >= 0 && m.grid[x] === SHIP)
        .flatMap((x) => boatAt(sp, m, x));
      return {
        technique: {
          kind: "growTooLong",
          joined: 1 + segs.length,
          largest: Math.max(M, 0),
        },
        evidence: segs,
        line: -1,
      };
    }),
    shortRun: compiledRung(
      boats.shortRun,
      dl,
      ({ R }): BoatsReason => ({
        technique: { kind: "runTooShort", length: R.length },
        evidence: R,
        line: -1,
      }),
    ),
    hidden: compiledRung(boats.hidden, dl, ({ L }, _c, n, m) => line(L, n === SHIP, m)),
    onlyRuns: compiledRung(
      boats.onlyRuns,
      dl,
      ({ m: size, r }, _c, _n, m): BoatsReason => ({
        technique: { kind: "onlyRunsLeft", size, runs: r },
        evidence: runsTaking(B, m, size).flat(),
        line: -1,
      }),
    ),
    shared: compiledRung(boats.shared, dl, ({ L, t, k, K }, _c, _n, m): BoatsReason => {
      const outer = [1, 2, 3, 4]
        .map((d) => stepOf(sp, k, d))
        .filter((x) => x >= 0 && sp.lineCells[L].includes(x) && !m.known(x));
      const kNum = numOf(B, m, K);
      const middle =
        !m.known(k) &&
        kNum >= 0 &&
        kNum - sp.lineCells[K].filter((x) => m.grid[x] === SHIP).length === 1;
      return {
        technique: {
          kind: "sharedDiagonal",
          line: lineOf(B, m, L),
          room: t,
          middle: middle ? pointOf(sp, k) : null,
        },
        evidence: middle ? [k, ...outer] : outer,
        line: L,
      };
    }),
    lastWater: compiledRung(boats.lastWater, dl, ({ L, c, H }, _c, _n, m) =>
      trialReason(
        B,
        m,
        H,
        [c],
        (breach) => ({
          kind: "refuted",
          trialShip: false,
          breach,
          center: null,
          filled: {
            horizontal: L < b.h,
            crossing: H.some((x) => !sp.lineCells[L].includes(x)),
          },
        }),
        none,
      ),
    ),
    lastShip: compiledRung(boats.lastShip, dl, ({ L, c, W }, _c, _n, m) =>
      trialReason(
        B,
        m,
        [c],
        W,
        (breach) => ({
          kind: "refuted",
          trialShip: true,
          breach,
          center: null,
          filled: {
            horizontal: L < b.h,
            crossing: W.some((x) => !sp.lineCells[L].includes(x)),
          },
        }),
        none,
      ),
    ),
    centerTrial: compiledRung(boats.centerTrial, dl, ({ c, L, S }, _c, _n, m) =>
      trialReason(
        B,
        m,
        S,
        none,
        (breach) => ({
          kind: "refuted",
          trialShip: true,
          breach,
          center: { at: pointOf(sp, c), vertical: L >= b.h },
          filled: null,
        }),
        [c],
      ),
    ),
  });
}

/** The point just off the board beside square `c` in direction `d`, which
 * the narration names as the board's edge. */
function offBoard(sp: GridSpace, c: number, d: number): Point {
  const { x, y } = pointOf(sp, c);
  if (d === 1) return { x, y: y - 1 };
  if (d === 2) return { x, y: y + 1 };
  if (d === 3) return { x: x - 1, y };
  return { x: x + 1, y };
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

// --- the hint's plan ---------------------------------------------------------

/** Runaway/UX cap on plan length, matching Spokes and Bricks: a player rarely
 * follows more than a few steps before diverging, and a recompute yields the
 * next batch. */
const HINT_PLAN_MAX = 40;

export interface BoatsPlan {
  firings: BoatsFiring[];
  /** The difficulty cap the plan was walked at. */
  diff: number;
}

/**
 * The lowest cap at which the puzzle solves from its clues alone, so the
 * walk teaches the tier the board needs and does not move as the player
 * plays (docs/hints-search.md § "Recompute-stable plans").
 */
function lowestSolvingDiff(state: BoatsState): number {
  const result = solveBoats(boardOf(state), DIFF_HARD);
  return result.kind === "solved" ? result.diff : DIFF_HARD;
}

const squareOf = (sp: GridSpace, c: number, ship: boolean): BoatsSquare => ({
  ...pointOf(sp, c),
  ship,
});

/**
 * The ladder walked from the player's board at `cap`, one firing at a time
 * (`ladderWalk`).
 */
function planAt(state: BoatsState, cap: number): BoatsPlan {
  const b = boardOf(state);
  const sp = describedSpace(boats.units, b.w, b.h);
  const B: Board = { b, sp };
  const ladder = boatsLadder(B, dealtOf(b));
  const grid = Uint8Array.from(b.grid, describedOf);
  const firings: BoatsFiring[] = [];
  const m = marksOf(sp, grid, ladder);
  if (m === null) return { firings, diff: cap };
  m.budget = stepBudget("boats hint");
  // What a firing rests on, with the squares it decides: its evidence and its
  // line. A player works round the boats just placed.
  const reads = ({ facts, reasons }: Taken): number[] => {
    const r = reasons[0] as BoatsReason;
    const out = [...r.evidence];
    if (r.line >= 0) out.push(...sp.lineCells[r.line]);
    for (let i = 0; i < facts.length; i += 3) out.push(facts[i + 1]);
    return out;
  };
  const walk = ladderWalk(m, ladder.entries, { [TIERS]: cap }, reads);
  while (firings.length < HINT_PLAN_MAX) {
    const before = gameGrid(m);
    const taken = walk.next();
    if (taken === null || taken === "contradiction") break;
    const { facts, reasons } = taken;
    const r = reasons[0] as BoatsReason;
    const primary = new Set<number>();
    const squares: BoatsSquare[] = [];
    for (let i = 0; i < facts.length; i += 3) {
      if (facts[i] !== PLACE) continue;
      const c = facts[i + 1];
      if (before[c] !== EMPTY || primary.has(c)) continue;
      primary.add(c);
      squares.push(squareOf(sp, c, facts[i + 2] === SHIP));
    }
    const consequences: BoatsSquare[] = [];
    for (let c = 0; c < grid.length; c++)
      if (before[c] === EMPTY && grid[c] !== 0 && !primary.has(c))
        consequences.push(squareOf(sp, c, grid[c] === SHIP));
    firings.push({
      technique: r.technique,
      squares,
      consequences,
      evidence: r.evidence.filter((c) => !primary.has(c)).map((c) => pointOf(sp, c)),
      line: r.line >= 0 ? sp.lineCells[r.line].map((c) => pointOf(sp, c)) : [],
      grid: before,
    });
  }
  return { firings, diff: cap };
}

/**
 * Walk the deduction from the player's board, one firing at a time.
 *
 * Starts at the puzzle's own difficulty and escalates only if that tier has
 * nothing left to say — so the plan teaches the simplest technique that works,
 * while a board the player has walked into a harder corner still gets advice.
 */
export function deduceBoatsPlan(state: BoatsState): BoatsPlan {
  const lowest = lowestSolvingDiff(state);
  let last = planAt(state, lowest);
  for (let d = lowest + 1; d < DIFFCOUNT && last.firings.length === 0; d++)
    last = planAt(state, d);
  return last;
}
