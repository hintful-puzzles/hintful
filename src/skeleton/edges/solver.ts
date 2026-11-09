/**
 * Skeleton's solver: the ladder `skeleton.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), with the
 * reason each technique records for the hint, and the answer check its rules
 * compile to.
 *
 * The answer is on the edges between squares side by side, each a line or
 * none; a cross, a wall and an edge no line will take are all "none".
 * {@link solveSkeleton} runs the ladder to a fixpoint, which is how the
 * generator grades a board and how Solve and the mistake check find the
 * answer. {@link skeletonWalk} takes it one firing at a time, and the hint
 * narrates each (docs/solver-and-generator.md § "One engine, two
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
  type LadderWalk,
  ladderTechniques,
  ladderWalk,
  type ReasonOf,
  runLadder,
  TIERS as SCALE,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { CROSS, type EdgeMark, LINE, OPEN } from "../../engine/line-drawing.ts";
import { type SquareEdges, squareEdges } from "../../engine/square-edges.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import * as skeleton from "./skeleton.compiled.ts";
import { DIFF_NORMAL, LINES_PER_SQUARE } from "./state.ts";

/** What the description reads an edge as holding. */
const LINED = 1;
const NONE = 2;

/** Why a firing decides its edges, its edges numbered as the game's. */
export type SkeletonReason =
  /** The square has only as many live edges as it still needs lines. */
  | { kind: "forced"; cell: number; need: number }
  /** Lines on `tried`, two of the three edges square `cell` has left, would
   * break the board at once, so it takes the third. */
  | { kind: "pairBreaks"; cell: number; tried: number[] };

/** The rungs, easiest first: the ladder's techniques. */
export const SKELETON_RUNGS = skeleton.ladder.map((e) => e.id);
export type SkeletonRung = skeleton.LadderId;

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

/** A reason built once a firing, from its binding, and shared by each of its
 * facts. */
function perFiring<B extends object>(
  build: (binding: B) => SkeletonReason,
): ReasonOf<B> {
  let last: B | null = null;
  let reason: SkeletonReason | null = null;
  return (binding) => {
    if (binding !== last || reason === null) {
      last = binding;
      reason = build(binding);
    }
    return reason;
  };
}

/** The ladder, each technique with its reason. It reads the walls as the
 * marks hold them, crossed out. */
function skeletonLadder(geo: Geometry): Ladder {
  const { sp, toGame } = geo;
  const edge = (c: number, y: number): number => toGame[sp.edgeOf(c, y)];
  return describedLadder(skeleton, {
    forced: uncluedRung(
      skeleton.forced,
      perFiring(({ c, n }) => ({ kind: "forced", cell: c, need: n })),
    ),
    pairBreaks: uncluedRung(
      skeleton.pairBreaks,
      perFiring(({ c, i, j }) => ({
        kind: "pairBreaks",
        cell: c,
        tried: [edge(c, i), edge(c, j)],
      })),
    ),
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
  return { geo, m, ladder: skeletonLadder(geo) };
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

/** A firing a walk took: its edges, as the game numbers them, all `mark`. */
export interface SkeletonFiring {
  reason: SkeletonReason;
  edges: number[];
  mark: typeof LINE | typeof CROSS;
}

/**
 * The hint's walk over the ladder from `board`'s lines and crosses, one
 * firing a call: the one that carries on from the squares the last decided
 * (`ladderWalk`). Each is written onto `board` as it is taken. No tier cap:
 * a board that arrives by its ID carries no tier, and the ladder tries the
 * Easy technique first, which is the order a hint wants anyway.
 */
export function skeletonWalk(
  board: SkeletonBoard,
  budget: StepBudget,
): () => SkeletonFiring | null | "contradiction" {
  const d = deduction(board);
  const { geo, m, ladder } = d;
  m.budget = budget;
  const { g, toGame } = geo;
  // A firing reads a square and the squares around it, or the squares of
  // the edges it tries lines on.
  const reads = ({ reasons }: { reasons: readonly object[] }): number[] => {
    const reason = reasons[0] as SkeletonReason;
    if (reason.kind !== "forced") return reason.tried.flatMap((e) => [g.a[e], g.b[e]]);
    const out = [reason.cell];
    for (let k = 0; k < 4; k++) {
      const e = g.around[reason.cell * 4 + k];
      if (e >= 0) out.push(g.a[e] === reason.cell ? g.b[e] : g.a[e]);
    }
    return out;
  };
  const walk: LadderWalk = ladderWalk(
    m,
    ladder.entries,
    { [SCALE]: DIFF_NORMAL },
    reads,
  );
  return () => {
    const taken = walk.next();
    if (taken === null || taken === "contradiction") return taken;
    writeBack(d, board);
    const edges: number[] = [];
    for (let i = 0; i < taken.facts.length; i += 3)
      edges.push(toGame[taken.facts[i + 1]]);
    return {
      reason: taken.reasons[0] as SkeletonReason,
      edges,
      // Every fact of a firing places the one value its technique concludes.
      mark: taken.facts[2] === LINED ? LINE : CROSS,
    };
  };
}
