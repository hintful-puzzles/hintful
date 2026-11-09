/**
 * Ascent's solver: the ladder `ascent.description.yaml` states, compiled, on
 * the engine's wide marks and runner (`engine/ladder-runtime.ts`), and the
 * answer check its rules compile to. The generator removes a clue only while
 * the ladder at the board's tier still solves the result, so its verdict on
 * every intermediate board decides which puzzles exist; `solve()`,
 * `findMistakes` and the difficulty ask it too. No tier supposes anything.
 *
 * The hand-written rungs below the ladder are the hint's own readings, run on
 * a `SolverScratch` of their own until the hint walks the compiled firings.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import { clueList, describedSpace } from "../../engine/describe-runtime.ts";
import {
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  placingRung,
  runLadder,
  TIERS,
  WideCellMarks,
} from "../../engine/ladder-runtime.ts";
import * as ascent from "./ascent.compiled.ts";
import {
  type AscentState,
  CELL_MULTIPLE,
  CELL_NONE,
  fromNumberEdge,
  isEdgeValid,
  isHexagonal,
  isNear,
  isNumberEdge,
  isObstacle,
  MODE_EDGES,
  MODE_ORTHOGONAL,
  NUMBER_EMPTY,
  NUMBER_WALL,
  stepDistance,
  updatePositions,
} from "./state.ts";

/** The hint's own readings of a board: a candidate bitmap of number by
 * square, which its rungs below read and narrow. */
export class SolverScratch {
  readonly w: number;
  readonly h: number;
  readonly mode: number;
  /** The last number on the path (set by the caller before each solve). */
  end: number;

  readonly positions: Int32Array;
  readonly grid: Int16Array;
  /** Candidate bitmap: `marks[i*s + n]` is 1 if number `n` may sit at cell `i`. */
  readonly marks: Uint8Array;
  /** Scratch for `solverOverlap`: `overlap[i]` prev-adjacency, `overlap[i+s]` next. */
  readonly overlap: Uint8Array;
  /**
   * The hint's recorder. While `recording`, a placing rung stops at its first
   * placement and leaves it in `placed`, so one firing is one step. The
   * generator never sets it, so its sweeps place everything they find.
   */
  recording = false;
  placed: { n: number; cell: number } | null = null;
  /** The hint's run in progress: while set, a placing rung places only numbers
   * from `lo` to `hi`, still judging each square against every number. */
  focus: { lo: number; hi: number } | null = null;

  constructor(w: number, h: number, mode: number, last: number) {
    const n = w * h;
    this.w = w;
    this.h = h;
    this.mode = mode;
    this.end = last;
    this.positions = new Int32Array(n).fill(CELL_NONE);
    this.grid = new Int16Array(n).fill(NUMBER_EMPTY);
    this.marks = new Uint8Array(n * n);
    this.overlap = new Uint8Array(n * 2);
  }
}

export function solverPlace(sc: SolverScratch, pos: number, num: number): number {
  const s = sc.w * sc.h;

  sc.grid[pos] = num;
  sc.positions[num] = sc.positions[num] === CELL_NONE ? pos : CELL_MULTIPLE;

  /* Rule out this number in all other cells */
  for (let i = 0; i < s; i++) {
    if (i === pos) continue;
    sc.marks[i * s + num] = 0;
  }
  /* Rule out all other numbers in this cell, the last one included (upstream
   * stops one short; see `fix-ascent-last-number-reach`). */
  for (let nn = 0; nn <= sc.end; nn++) {
    if (nn === num) continue;
    sc.marks[pos * s + nn] = 0;
  }

  return 1;
}

export function solverSinglePosition(sc: SolverScratch): number {
  const s = sc.w * sc.h;
  let ret = 0;

  for (let n = 0; n <= sc.end; n++) {
    if (sc.positions[n] !== CELL_NONE) continue;
    if (sc.focus && (n < sc.focus.lo || n > sc.focus.hi)) continue;
    let found = CELL_NONE;
    for (let i = 0; i < s; i++) {
      if (sc.grid[i] !== NUMBER_EMPTY) continue;
      if (!sc.marks[i * s + n]) continue;
      found = found === CELL_NONE ? i : CELL_MULTIPLE;
    }
    if (found >= 0) {
      ret += solverPlace(sc, found, n);
      if (sc.recording) {
        sc.placed = { n, cell: found };
        return ret;
      }
    }
  }

  return ret;
}

export function solverSingleNumber(sc: SolverScratch, simple: boolean): number {
  const s = sc.w * sc.h;
  let ret = 0;

  for (let i = 0; i < s; i++) {
    if (sc.grid[i] !== NUMBER_EMPTY) continue;
    let found = NUMBER_EMPTY;
    for (let n = 0; n <= sc.end; n++) {
      if (!sc.marks[i * s + n]) continue;
      found = found === NUMBER_EMPTY ? n : NUMBER_WALL;
    }
    if (found >= 0) {
      if (sc.focus && (found < sc.focus.lo || found > sc.focus.hi)) continue;
      if (
        simple &&
        (found === 0 || sc.positions[found - 1] === CELL_NONE) &&
        (found === sc.end || sc.positions[found + 1] === CELL_NONE)
      ) {
        continue;
      }
      ret += solverPlace(sc, i, found);
      if (sc.recording) {
        sc.placed = { n: found, cell: i };
        return ret;
      }
    }
  }

  return ret;
}

function solverNear(
  sc: SolverScratch,
  near: number,
  num: number,
  distance: number,
): number {
  const w = sc.w;
  const s = sc.h * w;
  let ret = 0;

  for (let i = 0; i < s; i++) {
    if (!sc.marks[i * s + num]) continue;
    if (stepDistance(i, near, w, sc.mode) <= distance) continue;
    sc.marks[i * s + num] = 0;
    ret++;
  }

  return ret;
}

export function solverProximitySimple(sc: SolverScratch): number {
  const end = sc.end;
  let ret = 0;

  for (let n = 0; n <= end; n++) {
    const i = sc.positions[n];
    if (i < 0) continue;
    if (n > 0 && sc.positions[n - 1] === CELL_NONE) ret += solverNear(sc, i, n - 1, 1);
    if (n < end && sc.positions[n + 1] === CELL_NONE)
      ret += solverNear(sc, i, n + 1, 1);
  }

  return ret;
}

export function solverProximityFull(sc: SolverScratch): number {
  const end = sc.end;
  let ret = 0;

  for (let n = 0; n <= end; n++) {
    const i = sc.positions[n];
    if (i < 0) continue;

    let n2 = n - 1;
    while (n2 >= 0 && sc.positions[n2] === CELL_NONE) {
      ret += solverNear(sc, i, n2, Math.abs(n - n2));
      n2--;
    }
    n2 = n + 1;
    while (n2 <= end && sc.positions[n2] === CELL_NONE) {
      ret += solverNear(sc, i, n2, Math.abs(n - n2));
      n2++;
    }
  }

  return ret;
}

export function solverOverlap(sc: SolverScratch): number {
  const { w, mode } = sc;
  const s = w * sc.h;
  let ret = 0;

  for (let n = 0; n <= sc.end; n++) {
    if (sc.positions[n] !== CELL_NONE) continue;

    sc.overlap.fill(0, 0, s * 2);

    if (n > 0) {
      for (let i1 = 0; i1 < s; i1++) {
        if (sc.marks[i1 * s + (n - 1)]) {
          for (let i2 = 0; i2 < s; i2++) {
            if (isNear(i1, i2, w, mode)) sc.overlap[i2] = 1;
          }
        }
      }
    }

    if (n < sc.end) {
      for (let i1 = 0; i1 < s; i1++) {
        if (sc.marks[i1 * s + (n + 1)]) {
          for (let i2 = 0; i2 < s; i2++) {
            if (isNear(i1, i2, w, mode)) sc.overlap[i2 + s] = 1;
          }
        }
      }
    }

    for (let i1 = 0; i1 < s; i1++) {
      if (!sc.marks[i1 * s + n]) continue;
      if ((n === 0 || sc.overlap[i1]) && (n === sc.end || sc.overlap[i1 + s])) continue;
      sc.marks[i1 * s + n] = 0;
      ret++;
    }
  }

  return ret;
}

function solverEdges(sc: SolverScratch): void {
  const { w, h } = sc;
  const s = w * h;

  for (let i1 = 0; i1 < s; i1++) {
    if (!isNumberEdge(sc.grid[i1])) continue;
    const n = fromNumberEdge(sc.grid[i1]);
    for (let i2 = 0; i2 < s; i2++) {
      if (sc.marks[i2 * s + n] && !isEdgeValid(i1, i2, w, h)) sc.marks[i2 * s + n] = 0;
    }
  }
}

/** Load `puzzle` into the scratch and seed every candidate. */
export function solverStart(puzzle: Int16Array, sc: SolverScratch): void {
  const s = sc.w * sc.h;

  if (puzzle !== sc.grid) sc.grid.set(puzzle);
  updatePositions(sc.positions, sc.grid, s);
  sc.marks.fill(0, 0, s * s);

  /* Seed candidate possibilities. */
  for (let n = 0; n < s; n++) {
    const i = sc.positions[n];
    if (i >= 0) {
      sc.marks[i * s + n] = 1;
      continue;
    }
    for (let ii = 0; ii < s; ii++) {
      if (sc.grid[ii] === NUMBER_EMPTY) sc.marks[ii * s + n] = 1;
    }
  }

  solverEdges(sc);
}

// --- the described ladder ---------------------------------------------------

/** Which squares are neighbors, as the description numbers it. */
function movesOf(mode: number): number {
  if (mode === MODE_ORTHOGONAL) return 0;
  return isHexagonal(mode) ? 1 : 2;
}

/** The board as the description deals it: a given number at its square, a
 * wall at each obstacle, an arrow at each of an Edges board's, each number
 * counted from 1, and the path's last number. */
function dealtOf(puzzle: Int16Array, mode: number): ascent.Dealt {
  const s = puzzle.length;
  const number: [number[], number[]] = [[], []];
  const wall: [number[], number[]] = [[], []];
  const arrow: [number[], number[]] = [[], []];
  const add = (list: [number[], number[]], at: number, v: number): void => {
    list[0].push(at);
    list[1].push(v);
  };
  let open = 0;
  for (let i = 0; i < s; i++) {
    const v = puzzle[i];
    // An arrow is an obstacle too, so it is told apart first.
    if (isNumberEdge(v)) add(arrow, i, fromNumberEdge(v) + 1);
    else if (isObstacle(v)) add(wall, i, 0);
    else {
      open++;
      if (v >= 0) add(number, i, v + 1);
    }
  }
  return {
    number: clueList(number[0], number[1], s),
    wall: clueList(wall[0], wall[1], s),
    arrow: clueList(arrow[0], arrow[1], s),
    moves: movesOf(mode),
    top: open,
  };
}

/** Why a technique fired, for the hint that is to walk the ladder: its id
 * and binding. */
interface DescribedReason {
  kind: ascent.LadderId;
  binding: object;
}

const reasonOf =
  (kind: ascent.LadderId) =>
  (binding: object): DescribedReason => ({ kind, binding });

/** The ladder over the board `dl`, with an Edges board's own techniques where
 * it has arrows. */
function ascentLadder(dl: ascent.Dealt, mode: number): Ladder<WideCellMarks> {
  return describedLadder<ascent.LadderId, ascent.PlacingId, WideCellMarks>(
    ascent,
    {
      once: placingRung(ascent.once, dl),
      onlySquare: compiledRung(ascent.onlySquare, dl, reasonOf("onlySquare")),
      nextTo: compiledRung(ascent.nextTo, dl, reasonOf("nextTo")),
      reach: compiledRung(ascent.reach, dl, reasonOf("reach")),
      overlap: compiledRung(ascent.overlap, dl, reasonOf("overlap")),
      onlyNumberNear: compiledRung(
        ascent.onlyNumberNear,
        dl,
        reasonOf("onlyNumberNear"),
      ),
      onlyNumber: compiledRung(ascent.onlyNumber, dl, reasonOf("onlyNumber")),
      onLine: compiledRung(ascent.onLine, dl, reasonOf("onLine")),
      overlapEdges: compiledRung(ascent.overlapEdges, dl, reasonOf("overlapEdges")),
    },
    undefined,
    mode === MODE_EDGES ? ["Edges"] : [],
  );
}

/**
 * The board's numbers as the description holds them: each given counted from
 * 1, a wall or an arrow `top + 1`, an empty square 0.
 */
function describedValues(puzzle: Int16Array, top: number): Int16Array {
  const values = new Int16Array(puzzle.length);
  for (let i = 0; i < puzzle.length; i++) {
    const v = puzzle[i];
    values[i] = v >= 0 ? v + 1 : v === NUMBER_EMPTY ? 0 : top + 1;
  }
  return values;
}

/** What a solve leaves: the board with every number it placed, in the
 * game's numbering, and whether that is the board's answer. */
export interface AscentSolved {
  grid: Int16Array;
  solved: boolean;
}

/**
 * Solve `puzzle`, a `w`×`h` board of `mode`, by the described ladder up to
 * the tier `cap`. No technique supposes anything, so a board the ladder
 * fills is uniquely solved.
 */
export function ascentSolve(
  puzzle: Int16Array,
  w: number,
  h: number,
  mode: number,
  cap: number,
  firings?: FiringTally,
): AscentSolved {
  const dl = dealtOf(puzzle, mode);
  const sp = describedSpace(ascent.units, w, h);
  const values = describedValues(puzzle, dl.top);
  const m = new WideCellMarks(sp, dl.top + 1, values, (c, d) =>
    ascent.domainOf(sp, dl, c, d),
  );
  const ladder = ascentLadder(dl, mode);
  m.placing = ladder.placing;
  m.striking = ladder.striking;
  const grid = puzzle.slice();
  if (!m.seed(values)) return { grid, solved: false };
  const broken = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {}),
    { firings },
  );
  for (let i = 0; i < grid.length; i++)
    if (grid[i] === NUMBER_EMPTY && values[i] > 0 && values[i] <= dl.top)
      grid[i] = values[i] - 1;
  return {
    grid,
    solved: !broken && !values.includes(0) && ascent.isAnswer(values, sp, dl),
  };
}

/** Whether the board is solved: its numbers are the answer, by the
 * description's rules. */
export function isSolved(s: AscentState): boolean {
  const dl = dealtOf(s.grid, s.mode);
  const values = describedValues(s.grid, dl.top);
  if (values.includes(0)) return false;
  const sp = describedSpace(ascent.units, s.w, s.h);
  return ascent.isAnswer(values, sp, dl);
}
