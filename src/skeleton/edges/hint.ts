/**
 * Skeleton's explained hint: the solver's compiled ladder walked one firing
 * at a time from the player's own lines and crosses (`skeletonWalk`), and
 * each firing turned into a step (docs/hints.md § "Recording the
 * deduction").
 *
 * Every fact a step rests on is a wall, a line or a cross on the board: the
 * ladder reads nothing else. The lines a Check tries are drawn thin where its
 * words outline them, and never played.
 */

import {
  describedEdgeHint,
  type EdgeSpoken,
} from "../../engine/described-edge-hint.ts";
import { Dsf } from "../../engine/dsf.ts";
import { type ShapedEdge, trackEdgeStep } from "../../engine/edge-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { LINE, OPEN } from "../../engine/line-drawing.ts";
import { pieceThrough, squareEdges } from "../../engine/square-edges.ts";
import type { Point } from "../../engine/types.ts";
import { type Clash, say } from "./hint-text.ts";
import {
  type SkeletonRung,
  type SkeletonSays,
  type SkeletonWalkContext,
  skeletonWalk,
} from "./solver.ts";
import {
  DIFF_NORMAL,
  executeMove,
  LINES_PER_SQUARE,
  type SkeletonMove,
  type SkeletonState,
} from "./state.ts";

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then. */
const PLAN_CAP = 24;

/** The edges a step tries lines on, as the board draws them. */
export interface SkeletonHighlights {
  tried: readonly ShapedEdge[];
}

/**
 * What lines on `tried` would break at once, on `edges` as the ladder had
 * them, in words: a line closing a loop short of every square, or a square
 * left with too few ways for its two lines. The ladder has proved that one
 * does; this finds which, to say it.
 */
function clashOf(
  state: SkeletonState,
  edges: Uint8Array,
  tried: readonly number[],
): Clash {
  const { w, h, walls } = state;
  const g = squareEdges(w, h);
  const at = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });
  const trial = edges.slice();
  const pieces = new Dsf(g.cells);
  for (let e = 0; e < g.edgeCount; e++)
    if (trial[e] === LINE) pieces.merge(g.a[e], g.b[e]);
  for (const e of tried) {
    if (pieces.equivalent(g.a[e], g.b[e]) && pieces.size(g.a[e]) < g.cells) {
      trial[e] = LINE;
      const piece = pieceThrough(g, (f) => trial[f] === LINE, g.a[e]);
      return { kind: "closed", squares: piece.map(at) };
    }
    trial[e] = LINE;
    pieces.merge(g.a[e], g.b[e]);
  }
  const lines = new Int32Array(g.cells);
  for (let e = 0; e < g.edgeCount; e++)
    if (trial[e] === LINE) {
      lines[g.a[e]]++;
      lines[g.b[e]]++;
    }
  // An edge a line may still take: open, no wall, both its squares short of
  // their lines, and not closing a loop short of every square.
  const live = (e: number): boolean => {
    const [i, j] = [g.a[e], g.b[e]];
    if (trial[e] !== OPEN || walls[e]) return false;
    if (lines[i] >= LINES_PER_SQUARE || lines[j] >= LINES_PER_SQUARE) return false;
    return !pieces.equivalent(i, j) || pieces.size(i) === g.cells;
  };
  for (let i = 0; i < g.cells; i++) {
    if (lines[i] >= LINES_PER_SQUARE) continue;
    let ways = lines[i];
    for (let k = 0; k < 4; k++) {
      const e = g.around[i * 4 + k];
      if (e >= 0 && live(e)) ways++;
    }
    if (ways < LINES_PER_SQUARE) return { kind: "stuck", at: at(i), ways };
  }
  throw new Error(`skeleton: lines on ${tried} break nothing`);
}

/** What a sentence is told besides the technique's terms: the edges the firing
 * decides, as the game numbers them, and the edges as the ladder had them
 * when it fired. */
interface Fired {
  edges: number[];
  before: Uint8Array;
  /** The edges a Check tries lines on, none for a count. */
  tried: number[];
}

const sentences: {
  [K in keyof SkeletonSays]: (
    spoken: EdgeSpoken<SkeletonSays[K]>,
    marked: Fired,
    state: SkeletonState,
  ) => Sentence;
} = {
  forced: ({ terms }, { edges }, { w }) =>
    say.forced({ x: terms.c % w, y: (terms.c / w) | 0 }, terms.need, edges),
  pairBreaks: (_spoken, { edges, before, tried }, state) =>
    say.pairBreaks(tried, edges[0], clashOf(state, before, tried)),
};

/** The plan from the player's lines and crosses. */
export const skeletonHint = describedEdgeHint<
  SkeletonState,
  SkeletonMove,
  SkeletonHighlights,
  Fired,
  SkeletonWalkContext,
  SkeletonSays,
  SkeletonRung
>({
  name: "skeleton hint",
  walk: (state) => skeletonWalk(state),
  // The whole ladder, from the Easy rung up.
  tiers: { lowest: () => DIFF_NORMAL, count: DIFF_NORMAL + 1 },
  done: (_marks, ctx) => ctx.complete(),
  plan: PLAN_CAP,
  step: ({ taken, says, ctx }) => {
    const edges = ctx.decided(taken);
    // Every edge a firing sets was open before it.
    const before = ctx.edges();
    for (const e of edges) before[e] = OPEN;
    const tried =
      "first" in says.terms
        ? [says.terms.first, says.terms.second].map((e) => ctx.edgeOf(e))
        : [];
    return [
      {
        move: {
          kind: "edges",
          changes: edges.map((edge) => ({ edge, mark: ctx.markOf(taken) })),
        },
        highlights: { tried: tried.map((edge) => ({ edge, mark: LINE })) },
        marked: { edges, before, tried },
      },
    ];
  },
  say: sentences,
});

/** Judge a move against the step on show by what it did to the edges, which
 * a solve never makes a step of. */
export function skeletonKeepTrack(
  move: SkeletonMove,
  step: HintStep<SkeletonMove>,
  state: SkeletonState,
): HintTrackVerdict {
  if (move.kind !== "edges" || step.move.kind !== "edges") return "off";
  return trackEdgeStep(
    step,
    step.move.changes,
    state.edges,
    executeMove(state, move).edges,
    (changes): SkeletonMove => ({ kind: "edges", changes }),
  );
}
