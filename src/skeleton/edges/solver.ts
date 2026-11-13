/**
 * Skeleton's solver: the ladder `skeleton.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), and the
 * answer check its rules compile to.
 *
 * The answer is on the edges between squares side by side, each a line or
 * none; a cross, a wall and an edge no line will take are all "none".
 * {@link solveSkeleton} runs the ladder to a fixpoint, which is how the
 * generator grades a board and how Solve and the mistake check find the
 * answer. {@link skeletonWalk} hands the engine the ladder to take one firing
 * at a time, and the hint narrates each (docs/solver-and-generator.md § "One engine, two
 * projections").
 *
 * Every technique decides an edge only where the rules force it, so a board
 * the ladder finishes has exactly one answer.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
import {
  CellMarks,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
  type Taken,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { CROSS, type EdgeMark, LINE, OPEN } from "../../engine/line-drawing.ts";
import { type SquareEdges, squareEdges } from "../../engine/square-edges.ts";
import * as skeleton from "./skeleton.compiled.ts";
import { DIFF_NORMAL, LINES_PER_SQUARE } from "./state.ts";

/** What the description reads an edge as holding. */
const LINED = 1;
const NONE = 2;

/** The rungs, easiest first: the ladder's techniques. */
export const SKELETON_RUNGS = skeleton.SAYS_KINDS;
export type SkeletonRung = (typeof SKELETON_RUNGS)[number];
/** What each technique says of a firing. */
export type SkeletonSays = skeleton.SaysById;

/** The board the ladder works on: the walls, and the edges it writes as it
 * goes, each `OPEN`, `LINE` or `CROSS`. */
export interface SkeletonBoard {
  w: number;
  h: number;
  walls: Uint8Array;
  edges: Uint8Array;
}

// --- the board as the description reads it -----------------------------------

/** A board size's space, and its edges in both numberings: the game's
 * (`engine/square-edges.ts`) and the space's. */
interface Geometry {
  sp: GridSpace;
  g: SquareEdges;
  /** The space's edge for each of the game's. */
  toSp: Int32Array;
  /** The game's edge for each of the space's. */
  toGame: Int32Array;
}

function geometryOf(w: number, h: number): Geometry {
  const sp = describedSpace(skeleton.units, w, h);
  const g = squareEdges(w, h);
  const toSp = new Int32Array(g.edgeCount);
  const toGame = new Int32Array(g.edgeCount);
  for (let e = 0; e < g.edgeCount; e++) {
    toSp[e] = sp.edgeOf(g.a[e], g.b[e]);
    toGame[toSp[e]] = e;
  }
  return { sp, g, toSp, toGame };
}

/** The walls as the description deals them. */
function dealtOf(board: SkeletonBoard, geo: Geometry): skeleton.Dealt {
  const walls: number[] = [];
  board.walls.forEach((wall, e) => {
    if (wall) walls.push(geo.toSp[e]);
  });
  return {
    wall: clueList(
      walls,
      walls.map(() => 1),
      geo.sp.edges.length,
    ),
  };
}

/** The ladder. It reads the walls as the marks hold them, crossed out. */
function skeletonLadder(): Ladder {
  return describedLadder(skeleton, {
    forced: uncluedRung(skeleton.forced),
    pairBreaks: uncluedRung(skeleton.pairBreaks),
  });
}

/** The ladder's marks over `board`, and what it reads them by. */
interface Deduction {
  geo: Geometry;
  m: CellMarks;
  ladder: Ladder;
}

/** The marks `board` holds as the description reads them: a line, none for
 * a cross or a wall, and nothing for an open edge. */
function deduction(board: SkeletonBoard): Deduction {
  const geo = geometryOf(board.w, board.h);
  const grid = new Uint8Array(geo.sp.edges.length);
  for (let e = 0; e < geo.g.edgeCount; e++) {
    if (board.walls[e] || board.edges[e] === CROSS) grid[geo.toSp[e]] = NONE;
    else if (board.edges[e] === LINE) grid[geo.toSp[e]] = LINED;
  }
  const m = new CellMarks(geo.sp, rangeMask(LINED, NONE), grid, null, "edge");
  m.seed(grid);
  return { geo, m, ladder: skeletonLadder() };
}

/** Write the marks back onto `board`: a line, a cross where the marks say
 * none and there is no wall, and open where they say nothing. */
function writeBack(d: Deduction, board: SkeletonBoard): void {
  const { g, toSp } = d.geo;
  for (let e = 0; e < g.edgeCount; e++) {
    if (board.walls[e]) continue;
    const v = d.m.grid[toSp[e]];
    board.edges[e] = v === LINED ? LINE : v === NONE ? CROSS : OPEN;
  }
}

/** Whether the lines make one loop through every square, crossing no wall,
 * by the rules the description compiles to. A cross and an open edge are the
 * same here, so a player need cross nothing out to finish. */
export function isComplete(board: SkeletonBoard): boolean {
  const geo = geometryOf(board.w, board.h);
  const g = new Uint8Array(geo.sp.edges.length).fill(NONE);
  for (let e = 0; e < geo.g.edgeCount; e++)
    if (board.edges[e] === LINE) g[geo.toSp[e]] = LINED;
  return skeleton.isAnswer(g, geo.sp, dealtOf(board, geo));
}

/**
 * Solve `board` in place with the ladder capped at tier `cap`, and say how it
 * ended. `firings` takes a count of each technique's firings, for a census.
 */
export function solveSkeleton(
  board: SkeletonBoard,
  cap: number,
  firings?: FiringTally,
): DifficultyVerdict {
  const d = deduction(board);
  const { m, ladder } = d;
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [SCALE]: cap }, {}),
    {
      firings,
    },
  );
  writeBack(d, board);
  if (impossible) return "impossible";
  const { g } = d.geo;
  for (let i = 0; i < g.cells; i++) {
    let lines = 0;
    for (let k = 0; k < 4; k++) {
      const e = g.around[i * 4 + k];
      if (e >= 0 && board.edges[e] === LINE) lines++;
    }
    if (lines < LINES_PER_SQUARE) return "unsolved";
  }
  return isComplete(board) ? "solved" : "impossible";
}

/** The lines of a board's answer, or `null` where the ladder does not reach
 * one. */
export function answerOf(
  w: number,
  h: number,
  walls: Uint8Array,
): readonly EdgeMark[] | null {
  const board: SkeletonBoard = { w, h, walls, edges: new Uint8Array(walls.length) };
  if (solveSkeleton(board, DIFF_NORMAL) !== "solved") return null;
  return Array.from(board.edges, (m) => (m === LINE ? LINE : OPEN));
}

/** What the hint's steps are built from besides the technique's terms. */
export interface SkeletonWalkContext {
  /** Whether the lines already are the answer. */
  complete(): boolean;
  /** The edges' marks as the game numbers them, as the walk's marks hold them
   * now (a wall reads as open). */
  edges(): Uint8Array;
  /** The game's edge for one of the space's. */
  edgeOf(spaceEdge: number): number;
  /** The edges a taken firing decides, as the game numbers them. */
  decided(taken: Taken): number[];
  /** The mark a taken firing makes on each. */
  markOf(taken: Taken): typeof LINE | typeof CROSS;
}

/**
 * The ladder over `state`'s lines and crosses, for the engine's hint to walk
 * (`engine/described-edge-hint.ts`). No tier cap: a board that arrives by its
 * ID carries no tier, and the ladder tries the Easy technique first, which is
 * the order a hint wants anyway.
 */
export function skeletonWalk(state: SkeletonBoard): {
  marks: CellMarks;
  entries: Ladder["entries"];
  ctx: SkeletonWalkContext;
} {
  const board: SkeletonBoard = { ...state, edges: state.edges.slice() };
  const d = deduction(board);
  const { geo } = d;
  const edges = (): Uint8Array => {
    writeBack(d, board);
    return board.edges.slice();
  };
  return {
    marks: d.m,
    entries: d.ladder.entries,
    ctx: {
      complete: () => {
        writeBack(d, board);
        return isComplete(board);
      },
      edges,
      edgeOf: (e) => geo.toGame[e],
      decided: (taken) => {
        const out: number[] = [];
        for (let i = 0; i < taken.facts.length; i += 3)
          out.push(geo.toGame[taken.facts[i + 1]]);
        return out;
      },
      // Every fact of a firing places the one value its technique concludes.
      markOf: (taken) => (taken.facts[2] === LINED ? LINE : CROSS),
    },
  };
}
