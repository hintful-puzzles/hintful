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
 * point, so a hint recomputed after any step cannot cycle. Such a step is
 * narrated only by what the player can see (`narrate`): the solved layout it
 * heads for is nothing they have ever been shown.
 *
 * **Once few crossings are left**, single moves thrash, so the hint first looks
 * for a journey (`endgame.ts`): a few marked points moved so that none of
 * their lines crosses anything, found by lifting them off and placing them one
 * at a time into the faces of what remains. A journey is the whole plan, one
 * leg per point, each narrated by what it does to its own point's crossings.
 * It keeps the walk terminating by the same argument, since its first leg
 * always cuts crossings without moving a placed point (see `planEndgame`).
 *
 * Otherwise the plan is capped at a few steps: every step is a fresh
 * measurement of the board, so the next request continues exactly where this
 * one stopped. It stops early once few crossings are left, so that the next
 * request can look for a journey.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { NO_MOVE_WORTH_MAKING } from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { ENDGAME_CROSSINGS, type Endgame, planEndgame } from "./endgame.ts";
import {
  EDGE_GAP,
  intersection,
  pointSpacing,
  samePoint,
  segDist2,
  toRational,
  units,
} from "./geometry.ts";
import { type Crossing, say, type UntangleMarks } from "./hint-text.ts";
import {
  FRAME_MARGIN,
  HALF_PIXEL,
  snapCellsLandable,
  snapCenter,
  snapDenominator,
  withinReach,
} from "./landing.ts";
import { orientations, solvedLayout } from "./solution.ts";
import {
  cross,
  type Edge,
  findCrossings,
  placeMove,
  type RationalPoint,
  type UntangleMove,
  type UntangleState,
} from "./state.ts";

/** What a step is, by the sentence its move earns: a move that removes
 * crossings of its point, one that removes none, and a leg of an endgame's
 * journey of several points. */
export const UNTANGLE_RUNGS = ["clear", "rearrange", "journey"] as const;
export type UntangleRung = (typeof UNTANGLE_RUNGS)[number];

type Step = HintStep<UntangleMove, unknown, UntangleRung>;
type Said = { rung: UntangleRung; words: Sentence };

/** Spots tried per axis. Offset from the grid lines so a spot is not
 * collinear with points that sit on whole or half units. */
const GRID = 24;

/** How far, in point spacings, a suggested spot keeps from another point, and
 * a point from a line it is not an end of (either way round) — so a move lands
 * in open space and never looks as if a line runs through a point. */
const POINT_GAP = 0.45;
const LINE_GAP = 0.2;

/** The gaps' scale for the second search, when no roomy spot helps. Slightly
 * tighter is enough: in a sample of 12 boards followed to the end, it took the
 * rearranging steps with no visible payoff from 55 to none. */
const CRAMPED = 0.8;

/** Softening term for the spread score, so a coincident pair scores high but
 * finite. */
const SPREAD_EPS = 0.25;

const MAX_PLAN_STEPS = 6;

/** How far a spot is moved to one the pointer can land on: in the layout's
 * 1/64 steps off the snap grid (an eighth of a unit), in cells on it. */
const NUDGE_REACH = 8;
const SNAP_REACH = 2;

/** Added to every clearance {@link Board.steady} measures in floats: far above
 * their rounding error on these boards, and far below any gap it keeps. */
const FLOAT_MARGIN = 1e-9;

/** Passes over the solved layout moving its points onto landable spots, each
 * move able to unsettle a point already checked. */
const LAYOUT_PASSES = 4;

/** How many placements a stall-breaking step looks one move past. */
const LOOKAHEAD = 6;

/** One board under consideration: positions, and what is fixed about it. */
class Board {
  readonly adj: number[][];
  pu: Point[];
  /** The gaps above, and the frame margin, in model units for this board. */
  readonly pointGap: number;
  readonly lineGap: number;
  readonly edgeGap: number;
  /** How far each point may sit from where this board has it, on each axis:
   * nothing for one the player placed, {@link Board.drift} for one a planned
   * step drops, wherever the pointer lands it. */
  readonly loose: number[];
  /** Whether a spot must be a snap cell (the snap-to-grid preference). */
  snap = false;

  /** How far a drop aimed at a spot can land from it, on each axis. A snapped
   * drop lands on the cell itself: `snapCellsLandable` keeps cells more than a
   * half-pixel box apart, so no other cell is within reach of one. */
  get drift(): number {
    return this.snap ? 0 : HALF_PIXEL;
  }

  constructor(
    readonly n: number,
    readonly w: number,
    readonly edges: readonly Edge[],
    readonly pts: RationalPoint[],
  ) {
    const spacing = pointSpacing(n, w);
    this.pointGap = POINT_GAP * spacing;
    this.lineGap = LINE_GAP * spacing;
    this.edgeGap = EDGE_GAP * spacing;
    this.adj = Array.from({ length: n }, () => []);
    for (const e of edges) {
      this.adj[e.a].push(e.b);
      this.adj[e.b].push(e.a);
    }
    this.pu = pts.map(units);
    this.loose = new Array<number>(n).fill(0);
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

  /** The lines of `v`'s crossing pairs with `v` at `p`, exactly as the board
   * counts them. `cross()` is not symmetric when a point lies on a line, so
   * each pair is tested in `findCrossings`' argument order — the later edge
   * first — or a count could differ by one from the red lines on screen. */
  crossingsAt(v: number, p: RationalPoint): { u: number; f: Edge }[] {
    const { edges } = this;
    const at = (x: number): RationalPoint => (x === v ? p : this.pts[x]);
    const out: { u: number; f: Edge }[] = [];
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (e.a !== v && e.b !== v) continue;
      const u = e.a === v ? e.b : e.a;
      for (let j = 0; j < edges.length; j++) {
        const f = edges[j];
        if (f.a === v || f.b === v || f.a === u || f.b === u) continue;
        const [hi, lo] = j > i ? [f, e] : [e, f];
        if (cross(at(hi.a), at(hi.b), at(lo.a), at(lo.b))) out.push({ u, f });
      }
    }
    return out;
  }

  /** Is `p` a clear spot for `v`: off the frame, away from the other points,
   * off every line it is not an end of, and with its own lines passing no
   * other point? `scale` shrinks the point and line gaps, never the frame's. */
  isClear(v: number, p: Point, scale = 1): boolean {
    const { pu, edgeGap, w } = this;
    const pointGap = this.pointGap * scale;
    const lineGap = this.lineGap * scale;
    // A hairline under the margin passes: the solved layout sits exactly on
    // it before positions are rounded to 1/64.
    if (Math.min(p.x, p.y, w - p.x, w - p.y) < edgeGap - 1 / 32) return false;
    for (let x = 0; x < this.n; x++) {
      if (x === v) continue;
      if ((p.x - pu[x].x) ** 2 + (p.y - pu[x].y) ** 2 < pointGap ** 2) return false;
      for (const u of this.adj[v]) {
        if (x !== u && segDist2(pu[x], p, pu[u]) < lineGap ** 2) return false;
      }
    }
    for (const f of this.edges) {
      if (f.a === v || f.b === v) continue;
      if (segDist2(p, pu[f.a], pu[f.b]) < lineGap ** 2) return false;
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
  cleared(v: number, to: RationalPoint): Crossing[] {
    const after = this.crossingsAt(v, to);
    return this.crossingsAt(v, this.pts[v])
      .filter(({ u, f }) => !after.some((a) => a.u === u && a.f === f))
      .map(({ u, f }) => ({
        ...intersection(this.pu[v], this.pu[u], this.pu[f.a], this.pu[f.b]),
        lines: `${v}-${u}x${f.a}-${f.b}`,
      }));
  }

  /** Is `v`'s set of crossing pairs the same with `v` at `p` as at `q`? */
  sameCrossings(v: number, p: RationalPoint, q: RationalPoint): boolean {
    const a = this.crossingsAt(v, p);
    const b = this.crossingsAt(v, q);
    return (
      a.length === b.length && a.every((c) => b.some((d) => d.u === c.u && d.f === c.f))
    );
  }

  /**
   * Do `v`'s crossing pairs stay the same wherever `v` lands within `hv` of
   * `q` on each axis, and every other point within its own `loose` of where
   * this board has it?
   *
   * Two closed segments change whether they meet only where an end of one lies
   * on the other: elsewhere they either cross properly or keep a gap, and both
   * survive a small enough nudge. The positions allowed form a product of
   * squares, which is connected, so a pair that can never pass through such a
   * position keeps its status throughout. An end `X` (off by at most `hX` on
   * each axis) can lie on a segment `YZ` (ends off by at most `hY`, `hZ`) only
   * if its nominal position is within `hX + max(hY, hZ)` of the nominal segment
   * on each axis, and so within `√2` times that in a straight line. So every end
   * of either line of each pair `crossingsAt` counts is kept further than that
   * from the other line. The distances are floats, and the margin added is far
   * above their error on a board this size, which only makes the test stricter.
   */
  steady(v: number, q: Point, hv: number): boolean {
    const { pu, loose } = this;
    const at = (x: number) => (x === v ? q : pu[x]);
    const slack = (x: number) => (x === v ? hv : loose[x]);
    const apart = (x: number, a: number, b: number): boolean => {
      const h = slack(x) + Math.max(slack(a), slack(b));
      if (h === 0) return true;
      // An end fixed exactly on a fixed end of the other line stays on it.
      const pinned = (e: number) =>
        slack(x) === 0 && slack(e) === 0 && samePoint(this.pts[x], this.pts[e]);
      if (x !== v && (pinned(a) || pinned(b))) return true;
      const r = Math.SQRT2 * h + FLOAT_MARGIN;
      return segDist2(at(x), at(a), at(b)) > r * r;
    };
    for (const u of this.adj[v]) {
      for (const f of this.edges) {
        if (f.a === v || f.b === v || f.a === u || f.b === u) continue;
        if (
          !apart(v, f.a, f.b) ||
          !apart(u, f.a, f.b) ||
          !apart(f.a, v, u) ||
          !apart(f.b, v, u)
        ) {
          return false;
        }
      }
    }
    // Nor may it share a spot with another point, where a drag grabs either.
    for (let x = 0; x < this.n; x++) {
      if (x !== v && !apart(x, v, v)) return false;
    }
    return true;
  }

  /** Are `v`'s crossing pairs where it stands certain, wherever the points a
   * planned step dropped have landed? */
  steadyWhere(v: number): boolean {
    return this.steady(v, this.pu[v], this.loose[v]);
  }

  /**
   * The spot nearest `t`, at most `reach` grid steps from it, where the pointer
   * can drop `v` and that gives `v` the crossing pairs it has at `t`; `t`
   * itself when it is one, `null` when none is near. Off the snap grid the
   * steps are the layout's 1/64; on it, a spot is a snap cell.
   */
  land(
    v: number,
    t: RationalPoint,
    reach = this.snap ? SNAP_REACH : NUDGE_REACH,
  ): RationalPoint | null {
    const { w } = this;
    for (const q of this.spotsNear(t, reach)) {
      const p = units(q);
      if (Math.min(p.x, p.y, w - p.x, w - p.y) < FRAME_MARGIN) continue;
      // Two points on one spot would be one blob, and a drag grabs either.
      if (this.pts.some((x, i) => i !== v && samePoint(x, q))) continue;
      if (!this.steady(v, p, this.drift)) continue;
      if (samePoint(q, t) || this.sameCrossings(v, q, t)) return q;
    }
    return null;
  }

  /** The grid spots within `reach` steps of `t` on each axis, nearest first. */
  private spotsNear(t: RationalPoint, reach: number): RationalPoint[] {
    const { n, w } = this;
    const tu = units(t);
    let d = toRational(tu).d;
    let at = (k: number) => k;
    let index = (c: number) => Math.round(c * d);
    let valid = (_k: number) => true;
    if (this.snap) {
      if (!snapCellsLandable(n, w)) return [];
      d = snapDenominator(n);
      at = (g) => snapCenter(w, g);
      index = (c) => Math.round((c * n - c - w / 2) / w);
      valid = (g) => g >= 0 && g <= n - 2;
    }
    const gx = index(tu.x);
    const gy = index(tu.y);
    const out: { q: RationalPoint; dist: number }[] = [];
    for (let i = -reach; i <= reach; i++) {
      for (let j = -reach; j <= reach; j++) {
        if (!valid(gx + i) || !valid(gy + j)) continue;
        const q = { x: at(gx + i), y: at(gy + j), d };
        const u = units(q);
        out.push({ q, dist: (u.x - tu.x) ** 2 + (u.y - tu.y) ** 2 });
      }
    }
    return out.sort((a, b) => a.dist - b.dist).map((o) => o.q);
  }
}

/** The spots tried for every point: an offset grid over the play box, inside
 * the frame margin `lo`. */
function gridSpots(w: number, lo: number): RationalPoint[] {
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

/** Each point's place in the solved layout, moved onto a spot the pointer can
 * land on; `null` for a point with no such spot near its place, and for all of
 * them when there is no layout. */
type Places = readonly (RationalPoint | null)[] | null;

interface Clearing {
  vertex: number;
  to: RationalPoint;
}

/**
 * The unplaced point and clear spot that remove the most crossings, the
 * roomiest spot among equals — checked exactly, or `null` if no single move
 * to a spot clear at gap `scale` removes any.
 */
function bestClearing(
  board: Board,
  spots: readonly RationalPoint[],
  placed: readonly boolean[],
  targets: Places,
  scale: number,
): Clearing | null {
  const found: { v: number; p: RationalPoint; gain: number }[] = [];
  for (let v = 0; v < board.n; v++) {
    if (placed[v]) continue;
    const estimate = board.estimator(v);
    const base = estimate(board.pu[v]);
    if (base === 0) continue;
    const options = spots.slice();
    const home = targets?.[v] ?? null;
    if (home !== null) options.push(home);
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
      .filter(({ v, p }) => board.isClear(v, units(p), scale))
      .map((c) => {
        const home = targets?.[c.v] ?? null;
        return {
          ...c,
          home: home !== null && samePoint(c.p, home) ? 0 : 1,
          crowd: board.crowding(c.v, units(c.p)),
        };
      })
      .sort((a, b) => a.home - b.home || a.crowd - b.crowd || a.v - b.v);
    for (const { v, p } of tier) {
      let b = before.get(v);
      if (b === undefined) {
        b = board.steadyWhere(v) ? board.crossingsAt(v, board.pts[v]).length : -1;
        before.set(v, b);
      }
      // The spot moved to where the pointer can drop the point, with the same
      // crossings, so the counts below are what any drop there makes.
      const to = b < 0 ? null : board.land(v, p);
      if (to === null) continue;
      const after = board.crossingsAt(v, to).length;
      if (after < b) return { vertex: v, to };
    }
    i = j;
  }
  return null;
}

/**
 * The unplaced point to move to its place when no move removes a crossing.
 *
 * Any unplaced point keeps the walk terminating, so the choice is free, and it
 * is made for what the player sees. A point in no crossing, or one a hair from
 * its place, makes a move with nothing to show for it, so those go last; so
 * does a place that is crowded or has a line through it. Among the rest, each
 * placement is tried and the next move searched, and the one whose next move
 * removes the most crossings, less any the placement adds, wins — the payoff
 * the narration can then name.
 */
function nextToPlace(
  board: Board,
  spots: readonly RationalPoint[],
  placed: readonly boolean[],
  targets: readonly (RationalPoint | null)[],
): number {
  const candidates: { v: number; rank: number; net: number }[] = [];
  for (let v = 0; v < board.n; v++) {
    const place = targets[v];
    if (placed[v] || place === null) continue;
    // The place is fixed, so it is one to drop the point on only if the pointer
    // can land it there with the crossings the step will count.
    if (!board.steadyWhere(v) || board.land(v, place, 0) === null) continue;
    const t = units(place);
    const here = board.pu[v];
    const estimate = board.estimator(v);
    const now = estimate(here);
    const idle = now === 0 || Math.hypot(t.x - here.x, t.y - here.y) < board.pointGap;
    const crowded = !board.isClear(v, t);
    candidates.push({
      v,
      rank: (idle ? 2 : 0) + (crowded ? 1 : 0),
      net: -(estimate(t) - now),
    });
  }
  if (candidates.length === 0) return -1;
  const bestRank = Math.min(...candidates.map((c) => c.rank));
  // Each lookahead is a full search, so only the few that add fewest crossings
  // are looked past.
  const tier = candidates
    .filter((c) => c.rank === bestRank)
    .sort((a, b) => b.net - a.net || a.v - b.v)
    .slice(0, LOOKAHEAD);

  // Look one move past each placement in the best tier.
  const trialPlaced = placed.slice();
  for (const c of tier) {
    const from = board.pts[c.v];
    const place = targets[c.v];
    if (place === null) continue;
    board.move(c.v, place);
    trialPlaced[c.v] = true;
    const next =
      bestClearing(board, spots, trialPlaced, targets, 1) ??
      bestClearing(board, spots, trialPlaced, targets, CRAMPED);
    if (next) {
      const x = next.vertex;
      c.net +=
        board.crossingsAt(x, board.pts[x]).length -
        board.crossingsAt(x, next.to).length;
    }
    trialPlaced[c.v] = false;
    board.move(c.v, from);
  }
  tier.sort((a, b) => b.net - a.net || a.v - b.v);
  return tier[0].v;
}

/** A planned move and the exact counts its sentence is built from. */
interface Planned {
  vertex: number;
  to: RationalPoint;
  /** The point's crossings before and after the move. */
  before: number;
  after: number;
  cleared: Crossing[];
}

function plan(board: Board, vertex: number, to: RationalPoint): Planned {
  return {
    vertex,
    to,
    before: board.crossingsAt(vertex, board.pts[vertex]).length,
    after: board.crossingsAt(vertex, to).length,
    cleared: board.cleared(vertex, to),
  };
}

/** A step's sentence. A move to the solved layout is narrated by what it does
 * on the board — the layout itself is nothing the player can see — and by the
 * crossings the next move removes, when that repays what this one adds. */
function narrate(p: Planned, next: Planned | null): Said {
  const m: UntangleMarks = {
    vertex: p.vertex,
    to: p.to,
    cleared: p.cleared,
    marked: [],
  };
  if (p.after < p.before)
    return { rung: "clear", words: say.clear(m, p.before, p.after) };
  // "…but frees a move that removes N" justifies the move, so it is said only
  // when the next move takes back at least what this one adds.
  const gain = next === null ? 0 : next.before - next.after;
  const opens = gain > 0 && gain >= p.after - p.before ? gain : null;
  return { rung: "rearrange", words: say.rearrange(m, p.before, p.after, opens) };
}

/**
 * The solved layout with every point moved onto a spot the pointer can drop it
 * on: steady, so the layout stays crossing-free wherever each point lands
 * within {@link HALF_PIXEL} of its place, or with snapping on, on a snap cell
 * of its own. A point is moved only to a spot with the crossing pairs its
 * place had, which is none, so the moves keep the layout solved; a point with
 * no such spot near has no place.
 */
function landedLayout(
  state: UntangleState,
  layout: readonly RationalPoint[],
  snap: boolean,
): (RationalPoint | null)[] {
  const b = new Board(state.n, state.w, state.edges, layout.slice());
  b.snap = snap;
  b.loose.fill(b.drift);
  const places: (RationalPoint | null)[] = layout.slice();
  for (let pass = 0; pass < LAYOUT_PASSES; pass++) {
    let moved = false;
    for (let v = 0; v < state.n; v++) {
      const t = places[v];
      if (t === null) continue;
      const q = b.land(v, t);
      places[v] = q;
      if (q !== null && !samePoint(q, t)) {
        b.move(v, q);
        moved = true;
      }
    }
    if (!moved) break;
  }
  return places.map((t, v) => (t !== null && b.steadyWhere(v) ? t : null));
}

interface LandedOrientation {
  oriented: RationalPoint[];
  places: (RationalPoint | null)[];
}

/** Per solved layout (`solvedLayout` returns one array per board), and per
 * snap setting: the landed places depend on nothing else. */
const landedCache = new WeakMap<
  readonly RationalPoint[],
  Map<boolean, LandedOrientation[]>
>();

/** `layout` under each symmetry of the square, with its landed places. */
function landedOrientations(
  state: UntangleState,
  layout: readonly RationalPoint[],
  snap: boolean,
): LandedOrientation[] {
  let bySnap = landedCache.get(layout);
  if (bySnap === undefined) {
    bySnap = new Map();
    landedCache.set(layout, bySnap);
  }
  let out = bySnap.get(snap);
  if (out === undefined) {
    out = orientations(layout, state.w).map((oriented) => ({
      oriented,
      places: landedLayout(state, oriented, snap),
    }));
    bySnap.set(snap, out);
  }
  return out;
}

/**
 * The solved layout under whichever of the square's symmetries has the most
 * points of the board on their places, then the least motion to it, with those
 * places moved to land on (`landedLayout`). This is `closestOrientation`'s
 * criterion, counted against the landed places: a point the hint placed is on
 * one of those, not on the layout's own spot, and counting it against the
 * layout's spot let the orientation turn under a point just placed and send
 * the hint back for it.
 */
function closestPlaces(
  state: UntangleState,
  layout: readonly RationalPoint[],
  snap: boolean,
): { layout: RationalPoint[]; places: (RationalPoint | null)[] } {
  const options = landedOrientations(state, layout, snap).map(
    ({ oriented, places }) => {
      let placed = 0;
      let dist = 0;
      for (const [v, p] of state.pts.entries()) {
        if (onItsPlace(p, places[v])) placed++;
        const a = units(p);
        const b = units(oriented[v]);
        dist += (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      }
      return { layout: oriented, places, placed, dist };
    },
  );
  return options.reduce((best, o) =>
    o.placed > best.placed || (o.placed === best.placed && o.dist < best.dist)
      ? o
      : best,
  );
}

/** Each point's place, as the hint measures "on its place", on `state`: `null`
 * when there is no solved layout. */
export function solvedPlaces(
  state: UntangleState,
  aux?: string,
  snap = false,
): (RationalPoint | null)[] | null {
  const layout = solvedLayout(state.n, state.w, state.edges, aux);
  return layout ? closestPlaces(state, layout, snap).places : null;
}

/** Is `p` on its place: within the half-pixel box a drop aimed at the place
 * lands in? Such a point is never moved again, which is what keeps the walk
 * terminating; within that box its crossings are the place's own. */
const onItsPlace = (p: RationalPoint, place: RationalPoint | null): boolean =>
  place !== null && withinReach(p, place);

export function deduceUntangleHintPlan(
  state: UntangleState,
  aux?: string,
  snap = false,
): HintResult<UntangleMove, unknown, UntangleRung> {
  const board = new Board(state.n, state.w, state.edges, state.pts.slice());
  board.snap = snap;
  const layout = solvedLayout(state.n, state.w, state.edges, aux);
  const closest = layout ? closestPlaces(state, layout, snap) : null;
  const oriented = closest?.layout ?? null;
  const targets = closest?.places ?? null;
  const spots = gridSpots(state.w, Math.max(board.edgeGap, FRAME_MARGIN));
  /** The next move from the board as it stands, or `null` when it is solved or
   * nothing is left to try. */
  const nextMove = (): Planned | null => {
    if (findCrossings(board.pts, state.edges).completed) return null;
    const placed = board.pts.map((p, v) => onItsPlace(p, targets?.[v] ?? null));
    // A roomy spot if one removes a crossing, else a tighter one: a cramped
    // move that helps beats a rearrangement the player cannot see a reason for.
    const clearing =
      bestClearing(board, spots, placed, targets, 1) ??
      bestClearing(board, spots, placed, targets, CRAMPED);
    if (clearing) return plan(board, clearing.vertex, clearing.to);
    if (targets === null) return null;
    const v = nextToPlace(board, spots, placed, targets);
    const place = v < 0 ? null : targets[v];
    return place === null ? null : plan(board, v, place);
  };

  const onPlace = board.pts.map((p, v) => onItsPlace(p, targets?.[v] ?? null));
  const endgame = planEndgame(
    state.n,
    state.w,
    state.edges,
    board.pts,
    oriented,
    onPlace,
  );
  // On a board of its own: a journey given up on leaves its legs moved.
  const trial = new Board(state.n, state.w, state.edges, state.pts.slice());
  trial.snap = snap;
  const legs = endgame === null ? null : journey(trial, endgame);
  if (legs !== null) return { ok: true, steps: legs };

  const planned: Planned[] = [];
  let next = nextMove();
  while (next !== null && planned.length < MAX_PLAN_STEPS) {
    planned.push(next);
    board.move(next.vertex, next.to);
    board.loose[next.vertex] = board.drift;
    next = nextMove();
    // Once few crossings are left, the next request may find a journey, so
    // the plan stops here rather than walk past it.
    if (findCrossings(board.pts, state.edges).count <= ENDGAME_CROSSINGS) break;
  }
  if (planned.length === 0) return { ok: false, error: NO_MOVE_WORTH_MAKING };

  // `next` is now the move after the plan's last step, so that step is narrated
  // exactly as it would be at the head of the next request's plan.
  const steps = planned.map((p, i): Step => {
    const { rung, words } = narrate(p, planned[i + 1] ?? next);
    return { move: placeMove(p.vertex, p.to), rung, explanation: words.text, words };
  });
  return { ok: true, steps };
}

/**
 * A step is followed by dropping its point within the half-pixel box of the
 * spot it asks for, where the pointer puts it at every tile size from
 * `TS_MIN` up, with the crossing pairs it has at the spot: those are what the
 * step's words count and ring. The hint asks only for spots whose whole box
 * gives those pairs, so every such drop completes the step; a drop outside the
 * box is off the plan, whose later steps count on the point being in it.
 */
export function untangleKeepTrack(
  m: UntangleMove,
  step: HintStep<UntangleMove>,
  state: UntangleState,
): HintTrackVerdict {
  const want = step.move;
  if (m.solving || m.points.length !== 1 || want.points.length !== 1) return "off";
  const [got] = m.points;
  const [to] = want.points;
  if (got.i !== to.i || !withinReach(got, to)) return "off";
  const board = new Board(state.n, state.w, state.edges, state.pts.slice());
  return board.sameCrossings(to.i, got, to) ? "completed" : "off";
}

/**
 * An endgame's moves as one journey: every leg is narrated by what it does to
 * its own point's crossings, counted exactly on the board as it then stands,
 * and marks the points still to move after it. `null` when a leg has no spot
 * near its own that the pointer can land on with the same crossings, or when,
 * so moved, the journey no longer does what its first leg says.
 */
function journey(board: Board, { moves, finishes }: Endgame): Step[] | null {
  const steps: Step[] = [];
  for (const [i, leg] of moves.entries()) {
    const { vertex } = leg;
    const to = board.steadyWhere(vertex) ? board.land(vertex, leg.to) : null;
    if (to === null) return null;
    const p = plan(board, vertex, to);
    board.move(vertex, to);
    board.loose[vertex] = board.drift;
    const m: UntangleMarks = {
      vertex,
      to,
      cleared: p.cleared,
      marked: moves.slice(i + 1).map((mv) => mv.vertex),
    };
    const { rung, words }: Said =
      moves.length === 1
        ? narrate(p, null)
        : {
            rung: "journey",
            words: say.journey(m, i, moves.length, finishes, p.before, p.after),
          };
    steps.push({
      move: placeMove(vertex, to),
      rung,
      explanation: words.text,
      words,
      ...(i > 0 ? { continuesPrevious: true } : {}),
    });
  }
  const done = finishes
    ? findCrossings(board.pts, board.edges).completed
    : moves.every(
        ({ vertex }) => board.crossingsAt(vertex, board.pts[vertex]).length === 0,
      );
  return done ? steps : null;
}
