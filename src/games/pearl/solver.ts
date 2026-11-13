/**
 * Pearl's solver: the ladder `pearl.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`) over the board
 * read as a tiling (`engine/square-tiling.ts`): each square a dot, each edge
 * between two squares side by side an edge, the loop's or not.
 *
 * One ladder serves the generator, which keeps a removed pearl only while
 * the ladder still finishes the board at its tier, so its verdict on every
 * intermediate board decides which puzzles exist (the frozen differential
 * holds those verdicts to upstream's); Solve; the mistake check's answer;
 * the difficulty probe; and the hint, which walks it from the player's lines
 * and crosses (`hint.ts`). No technique supposes anything, so a board the
 * ladder finishes has one answer.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  type GridSpace,
  rangeMask,
  tilingSpace,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import { DIRECTIONS, dirX, dirY, opposite } from "../../engine/square-edges.ts";
import { type SquareTiling, squareTiling } from "../../engine/square-tiling.ts";
import * as pearl from "./pearl.compiled.ts";
import { NOCLUE, type PearlState } from "./state.ts";

/** What the description reads a line as, and an edge with none. */
export const LINE = 1;
export const NONE = 2;

/** A board's squares as a tiling, and the space the ladder reads it as. */
export interface PearlGeometry extends SquareTiling {
  readonly w: number;
  readonly h: number;
  readonly sp: GridSpace;
}

const geometries = new Map<string, PearlGeometry>();

/** The tiling of a `w × h` board, built once a shape. */
function geometryOf(w: number, h: number): PearlGeometry {
  const key = `${w}x${h}`;
  let g = geometries.get(key);
  if (g === undefined) {
    const t = squareTiling(w, h, false);
    g = { ...t, w, h, sp: tilingSpace(t.tiling) };
    geometries.set(key, g);
  }
  return g;
}

/** The edge across side `d` of square `sq`, or -1 off the board. */
export const sideEdge = (g: PearlGeometry, sq: number, d: number): number =>
  g.sideEdge[sq * 16 + d];

/** The board as the description deals it: a pearl on each square that has
 * one, numbered as the game stores it (1 black, 2 white). */
function dealtOf(clues: Uint8Array): pearl.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  clues.forEach((c, i) => {
    if (c !== NOCLUE) {
      at.push(i);
      v.push(c);
    }
  });
  return { pearl: clueList(at, v, clues.length) };
}

/** The ladder over the dealt pearls. */
function pearlLadder(dl: pearl.Dealt): Ladder {
  const rung = <B extends object>(
    run: (b: never, sp: GridSpace, cl: pearl.Dealt, fire: never) => number,
  ) => compiledRung(run as Parameters<typeof compiledRung<B, pearl.Dealt>>[0], dl);
  return describedLadder(pearl, {
    square: rung(pearl.square),
    blackPearl: rung(pearl.blackPearl),
    blackRunsOn: rung(pearl.blackRunsOn),
    blackCannotRunOn: rung(pearl.blackCannotRunOn),
    whiteCannotTurn: rung(pearl.whiteCannotTurn),
    whiteTurnsOpposite: rung(pearl.whiteTurnsOpposite),
    closed: rung(pearl.closed),
    earlyLoop: rung(pearl.earlyLoop),
    earlyThrough: rung(pearl.earlyThrough),
  });
}

/** A board's ladder and what it reads the board as. */
export interface Kept {
  readonly clues: Uint8Array;
  readonly g: PearlGeometry;
  readonly dl: pearl.Dealt;
  readonly ladder: Ladder;
}

const ladders = new WeakMap<Uint8Array, Kept>();

/** The ladder of a board, kept per clue array while its pearls are the
 * same: the generator removes pearls from one array between solves. */
export function ladderOf(w: number, h: number, clues: Uint8Array): Kept {
  const kept = ladders.get(clues);
  if (
    kept !== undefined &&
    kept.g.w === w &&
    kept.g.h === h &&
    kept.clues.every((c, i) => c === clues[i])
  )
    return kept;
  const dl = dealtOf(clues);
  const made: Kept = {
    clues: clues.slice(),
    g: geometryOf(w, h),
    dl,
    ladder: pearlLadder(dl),
  };
  ladders.set(clues, made);
  return made;
}

/** Fresh marks on `g`, each edge as `known` has it (0 open, {@link LINE},
 * {@link NONE}). */
export function marksOn(g: PearlGeometry, known: Uint8Array): CellMarks {
  const m = new CellMarks(g.sp, rangeMask(LINE, NONE), known, null, "edge");
  m.seed(known);
  return m;
}

/**
 * Run the ladder up to tier `cap` from the pearls alone: the marks it ends
 * with, and 0 where it found them inconsistent, 1 where they are the
 * board's one answer, 2 where it stopped short.
 *
 * @param firings the census sink, forwarded to the runner; only
 *   `pearl-ladder.test.ts` passes one.
 */
export function pearlMarks(
  w: number,
  h: number,
  clues: Uint8Array,
  cap: number,
  firings?: FiringTally,
): { ret: number; grid: Uint8Array } {
  const { g, dl, ladder } = ladderOf(w, h, clues);
  const m = marksOn(g, new Uint8Array(g.sp.edges.length));
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {}),
    { firings },
  );
  const grid = Uint8Array.from(m.grid);
  if (impossible) return { ret: 0, grid };
  if (grid.includes(0)) return { ret: 2, grid };
  return { ret: pearl.isAnswer(grid, g.sp, dl) ? 1 : 0, grid };
}

/** Whether the lines a player has drawn are the answer to the pearls: the
 * description's rules, compiled, over every edge a line or none. */
export function isSolved(
  state: Pick<PearlState, "w" | "h" | "clues" | "lines">,
): boolean {
  const { g, dl } = ladderOf(state.w, state.h, state.clues);
  const grid = new Uint8Array(g.sp.edges.length);
  for (let e = 0; e < grid.length; e++) {
    const i = g.edgeSquare[e];
    const d = g.edgeSide[e];
    const j = i + dirY(d) * state.w + dirX(d);
    grid[e] = state.lines[i] & d || state.lines[j] & opposite(d) ? LINE : NONE;
  }
  return pearl.isAnswer(grid, g.sp, dl);
}

/** Each square's lines, as direction bits, where `grid` has every edge of
 * it known; `-1` where it has not. */
function squareLines(g: PearlGeometry, grid: ArrayLike<number>, sq: number): number {
  let lines = 0;
  for (const d of DIRECTIONS) {
    const e = sideEdge(g, sq, d);
    if (e < 0) continue;
    if (grid[e] === 0) return -1;
    if (grid[e] === LINE) lines |= d;
  }
  return lines;
}

/**
 * @param clues clue grid (NOCLUE/CORNER/STRAIGHT), length w*h
 * @param result out array (length w*h): each square's lines as direction
 *   bits, written when solved, or under `partial` for each square whose
 *   edges the ladder settled
 * @param difficulty the highest tier to run (`DIFF_COUNT` runs them all)
 * @param partial when true, transcribe what the ladder settled even if
 *   unsolved
 * @returns 0 inconsistent, 1 unique, 2 ambiguous
 */
export function pearlSolve(
  w: number,
  h: number,
  clues: Uint8Array,
  result: Uint8Array,
  difficulty: number,
  partial: boolean,
): number {
  const { ret, grid } = pearlMarks(w, h, clues, difficulty);
  if (ret === 1 || partial) transcribe(geometryOf(w, h), grid, result);
  return ret;
}

/** Transcribe the settled squares into `result`. */
function transcribe(g: PearlGeometry, grid: Uint8Array, result: Uint8Array): void {
  const { w, h } = g;
  for (let sq = 0; sq < w * h; sq++) {
    // A square with an edge still open keeps the caller's prior value: only
    // possible under `partial`.
    const lines = squareLines(g, grid, sq);
    if (lines >= 0) result[sq] = lines;
  }

  // Fix up reciprocity: never leave a square linked to a neighbor that
  // does not link back (can happen when we give up on an impossible board).
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      for (const d of DIRECTIONS) {
        const nx = x + dirX(d);
        const ny = y + dirY(d);
        const linksBack =
          nx >= 0 && nx < w && ny >= 0 && ny < h && result[ny * w + nx] & opposite(d);
        if (!linksBack) result[y * w + x] &= ~d;
      }
}

/** Easiest difficulty (0-based) at which `clues` has a unique solution, or
 * -1 if none. */
export function gradePearl(w: number, h: number, clues: Uint8Array): number {
  for (let diff = 0; diff < pearl.tiers.length; diff++)
    if (pearlMarks(w, h, clues, diff).ret === 1) return diff;
  return -1;
}
