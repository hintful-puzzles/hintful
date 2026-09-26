/**
 * Untangle hint: move the point that takes the most crossings off the board,
 * and say how many.
 *
 * Untangle has no forced move, but it does have a measurable one: each step is
 * the single-point move that removes the most crossings, found by trying every
 * point that is in a crossing against a grid of spots over the whole board
 * (and against its place in the solved layout). The narration reports the
 * point's crossings before and after, counted with the game's own exact
 * `cross()`, and the render rings the crossings the move removes, so every
 * number the hint says is one the player can count on the board.
 *
 * **When no single move helps**, greedy play is stuck, and the step instead
 * moves a point to its place in the solved layout (`solution.ts`) — which
 * exists for every planar board, with or without the generator's `aux`. Points
 * already on their place are never moved again by either kind of step, which
 * is what makes the walk terminate and keeps it recompute-stable: a step either
 * removes a crossing without disturbing a placed point, or places one more
 * point, so a hint recomputed after any step cannot cycle.
 *
 * The plan is capped at a few steps: every step is a fresh measurement of the
 * board, so the next request continues exactly where this one stopped.
 */

import type { HintResult, HintStep } from "../../engine/game.ts";
import { ALREADY_SOLVED, NO_MOVE_WORTH_MAKING } from "../../engine/hint-refusal.ts";
import type { Point } from "../../engine/types.ts";
import { intersection, samePoint, segDist2, toRational, units } from "./geometry.ts";
import { say } from "./hint-text.ts";
import { closestOrientation, solvedLayout } from "./solution.ts";
import {
  cross,
  type Edge,
  findCrossings,
  placeMove,
  type RationalPoint,
  type UntangleMove,
  type UntangleState,
} from "./state.ts";

/** Highlight payload for a displayed step: the point to move, where to, and
 * where (model units) the crossings it removes sit now. `render.ts` reads the
 * point's current position from the live state. */
export interface UntangleHint {
  vertex: number;
  to: RationalPoint;
  cleared: Point[];
}

/** Spots tried per axis. Offset from the grid lines so a spot is not
 * collinear with points that sit on whole or half units. */
const GRID = 24;

/** How far (model units) a suggested spot keeps from another point, and a
 * point or line from a line it is not an end of — so the result never looks
 * as if a line runs through a point. */
const POINT_GAP = 0.3;
const LINE_GAP = 0.15;

/** Softening term for the spread score, so a coincident pair scores high but
 * finite. */
const SPREAD_EPS = 0.25;

const MAX_PLAN_STEPS = 6;

/** One board under consideration: positions, and what is fixed about it. */
class Board {
  readonly adj: number[][];
  pu: Point[];

  constructor(
    readonly n: number,
    readonly w: number,
    readonly edges: readonly Edge[],
    readonly pts: RationalPoint[],
  ) {
    this.adj = Array.from({ length: n }, () => []);
    for (const e of edges) {
      this.adj[e.a].push(e.b);
      this.adj[e.b].push(e.a);
    }
    this.pu = pts.map(units);
  }

  move(v: number, to: RationalPoint): void {
    this.pts[v] = to;
    this.pu[v] = units(to);
  }

  /** A counter of the crossings `v`'s lines would make with `v` at a given
   * spot — estimated in floats, for the search. Each of `v`'s lines is tested
   * against a flat copy of the lines it could cross, since the search calls
   * this hundreds of times per point. */
  estimator(v: number): (p: Point) => number {
    const pu = this.pu;
    const lines = this.adj[v].map((u) => {
      const segs: number[] = [];
      for (const f of this.edges) {
        if (f.a === v || f.b === v || f.a === u || f.b === u) continue;
        segs.push(pu[f.a].x, pu[f.a].y, pu[f.b].x, pu[f.b].y);
      }
      return { ux: pu[u].x, uy: pu[u].y, segs: Float64Array.from(segs) };
    });
    return (p) => {
      let c = 0;
      for (const { ux, uy, segs } of lines) {
        const dx = ux - p.x;
        const dy = uy - p.y;
        for (let i = 0; i < segs.length; i += 4) {
          const cx = segs[i];
          const cy = segs[i + 1];
          const ex = segs[i + 2] - cx;
          const ey = segs[i + 3] - cy;
          // Which side of line c-e are p and u, and of line p-u are c and e?
          const s1 = ex * (p.y - cy) - ey * (p.x - cx);
          const s2 = ex * (uy - cy) - ey * (ux - cx);
          if (s1 * s2 >= 0) continue;
          const s3 = dx * (cy - p.y) - dy * (cx - p.x);
          const s4 = dx * (segs[i + 3] - p.y) - dy * (segs[i + 2] - p.x);
          if (s3 * s4 < 0) c++;
        }
      }
      return c;
    };
  }

  /** The lines of `v`'s crossing pairs with `v` at `p`, exactly. */
  crossingsAt(v: number, p: RationalPoint): { u: number; f: Edge }[] {
    const out: { u: number; f: Edge }[] = [];
    for (const u of this.adj[v]) {
      for (const f of this.edges) {
        if (f.a === v || f.b === v || f.a === u || f.b === u) continue;
        if (cross(p, this.pts[u], this.pts[f.a], this.pts[f.b])) out.push({ u, f });
      }
    }
    return out;
  }

  /** Is `p` a clear spot for `v`: away from the other points, off every line
   * it is not an end of, and with its own lines passing no other point? */
  isClear(v: number, p: Point): boolean {
    const pu = this.pu;
    for (let x = 0; x < this.n; x++) {
      if (x === v) continue;
      if ((p.x - pu[x].x) ** 2 + (p.y - pu[x].y) ** 2 < POINT_GAP ** 2) return false;
      for (const u of this.adj[v]) {
        if (x !== u && segDist2(pu[x], p, pu[u]) < LINE_GAP ** 2) return false;
      }
    }
    for (const f of this.edges) {
      if (f.a === v || f.b === v) continue;
      if (segDist2(p, pu[f.a], pu[f.b]) < LINE_GAP ** 2) return false;
    }
    return true;
  }

  /** How crowded `v` would be at `p` (lower is more spacious). The walls of
   * the box count as neighbors along their length, or the roomiest spot is
   * always against a wall and the board ends up hugging its frame. */
  crowding(v: number, p: Point): number {
    let s = 0;
    for (let u = 0; u < this.n; u++) {
      if (u !== v)
        s += 1 / (Math.hypot(p.x - this.pu[u].x, p.y - this.pu[u].y) + SPREAD_EPS);
    }
    const wallWeight = Math.sqrt(this.n);
    for (const gap of [p.x, p.y, this.w - p.x, this.w - p.y]) {
      s += wallWeight / (gap + SPREAD_EPS);
    }
    return s;
  }

  centroid(v: number): Point | null {
    const nb = this.adj[v];
    if (nb.length === 0) return null;
    let x = 0;
    let y = 0;
    for (const u of nb) {
      x += this.pu[u].x;
      y += this.pu[u].y;
    }
    return { x: x / nb.length, y: y / nb.length };
  }

  /** Where `v`'s crossings that a move to `to` removes sit now. */
  cleared(v: number, to: RationalPoint): Point[] {
    const after = this.crossingsAt(v, to);
    return this.crossingsAt(v, this.pts[v])
      .filter(({ u, f }) => !after.some((a) => a.u === u && a.f === f))
      .map(({ u, f }) =>
        intersection(this.pu[v], this.pu[u], this.pu[f.a], this.pu[f.b]),
      );
  }
}

/** The spots tried for every point: an offset grid over the play box. */
function gridSpots(w: number): RationalPoint[] {
  const lo = 0.3;
  const span = w - 2 * lo;
  const spots: RationalPoint[] = [];
  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      spots.push(
        toRational({
          x: lo + (span * (i + 0.37)) / (GRID - 0.26),
          y: lo + (span * (j + 0.61)) / (GRID - 0.26),
        }),
      );
    }
  }
  return spots;
}

interface Clearing {
  vertex: number;
  to: RationalPoint;
  before: number;
  after: number;
}

/**
 * The unplaced point and clear spot that remove the most crossings, the
 * roomiest spot among equals — checked exactly, or `null` if no single move
 * removes any.
 */
function bestClearing(
  board: Board,
  spots: readonly RationalPoint[],
  placed: readonly boolean[],
  targets: readonly RationalPoint[] | null,
): Clearing | null {
  const found: { v: number; p: RationalPoint; gain: number }[] = [];
  for (let v = 0; v < board.n; v++) {
    if (placed[v]) continue;
    const estimate = board.estimator(v);
    const base = estimate(board.pu[v]);
    if (base === 0) continue;
    const options = spots.slice();
    if (targets) options.push(targets[v]);
    const c = board.centroid(v);
    if (c) options.push(toRational(c));
    for (const p of options) {
      const gain = base - estimate(units(p));
      if (gain > 0) found.push({ v, p, gain });
    }
  }
  found.sort((a, b) => b.gain - a.gain);

  // Settle the candidates one gain at a time, best first: only the spots that
  // tie for the best gain still standing need the dearer clearance, spread and
  // exact checks.
  const before = new Map<number, number>();
  for (let i = 0; i < found.length; ) {
    let j = i;
    while (j < found.length && found[j].gain === found[i].gain) j++;
    // Among equals, a move onto the point's place in the solved layout first
    // — it will not have to move again — then the roomiest spot.
    const tier = found
      .slice(i, j)
      .filter(({ v, p }) => board.isClear(v, units(p)))
      .map((c) => ({
        ...c,
        home: targets !== null && samePoint(c.p, targets[c.v]) ? 0 : 1,
        crowd: board.crowding(c.v, units(c.p)),
      }))
      .sort((a, b) => a.home - b.home || a.crowd - b.crowd || a.v - b.v);
    for (const { v, p } of tier) {
      let b = before.get(v);
      if (b === undefined) {
        b = board.crossingsAt(v, board.pts[v]).length;
        before.set(v, b);
      }
      const after = board.crossingsAt(v, p).length;
      if (after < b) return { vertex: v, to: p, before: b, after };
    }
    i = j;
  }
  return null;
}

/** The unplaced point whose move to its place leaves the fewest crossings,
 * preferring a place no other point is sitting near. */
function nextToPlace(
  board: Board,
  placed: readonly boolean[],
  targets: readonly RationalPoint[],
): number {
  let best = -1;
  let bestKey = [Infinity, Infinity];
  for (let v = 0; v < board.n; v++) {
    if (placed[v]) continue;
    const t = units(targets[v]);
    const estimate = board.estimator(v);
    const delta = estimate(t) - estimate(board.pu[v]);
    const crowded = board.pu.some(
      (q, u) => u !== v && (q.x - t.x) ** 2 + (q.y - t.y) ** 2 < POINT_GAP ** 2,
    )
      ? 1
      : 0;
    if (delta < bestKey[0] || (delta === bestKey[0] && crowded < bestKey[1])) {
      best = v;
      bestKey = [delta, crowded];
    }
  }
  return best;
}

function step(
  board: Board,
  vertex: number,
  to: RationalPoint,
  explanation: string,
): HintStep<UntangleMove, UntangleHint> {
  return {
    move: placeMove(vertex, to),
    explanation,
    highlights: { vertex, to, cleared: board.cleared(vertex, to) },
  };
}

export function deduceUntangleHintPlan(
  state: UntangleState,
  aux?: string,
): HintResult<UntangleMove, UntangleHint> {
  if (state.completed) return { ok: false, error: ALREADY_SOLVED };

  const board = new Board(state.n, state.w, state.edges, state.pts.slice());
  const layout = solvedLayout(state.n, state.w, state.edges, aux);
  const targets = layout ? closestOrientation(layout, board.pts, state.w) : null;
  const spots = gridSpots(state.w);
  const steps: HintStep<UntangleMove, UntangleHint>[] = [];

  while (steps.length < MAX_PLAN_STEPS) {
    if (findCrossings(board.pts, state.edges).completed) break;
    const placed = board.pts.map(
      (p, v) => targets !== null && samePoint(p, targets[v]),
    );

    const clearing = bestClearing(board, spots, placed, targets);
    if (clearing) {
      const { vertex, to, before, after } = clearing;
      steps.push(step(board, vertex, to, say.clear(before, after)));
      board.move(vertex, to);
      continue;
    }

    if (targets === null) break;
    const v = nextToPlace(board, placed, targets);
    if (v < 0) break;
    steps.push(step(board, v, targets[v], say.rebuild));
    board.move(v, targets[v]);
  }

  if (steps.length === 0) return { ok: false, error: NO_MOVE_WORTH_MAKING };
  return { ok: true, steps };
}
