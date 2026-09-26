/**
 * Untangle's endgame: once few crossings are left, find a few points whose
 * re-placement clears every crossing they are in, and where each one goes.
 *
 * A single-point search (`hint.ts`) runs out near the end: every move that
 * clears one crossing makes another, and the walk thrashes. A person instead
 * picks out the few points causing the trouble and puts each where its lines
 * cross nothing. This does the same, in two parts.
 *
 * **Culprits.** Each crossing has one of its four points among the culprits (a
 * hitting set, searched smallest first, one group of crossings at a time). A
 * set whose placement fails grows by a neighbor of the culprit that had nowhere
 * to go, since moving that neighbor is what opens room for it. The points
 * whose neighbors go round them in a different order from the solved layout
 * are culprits for free: part of the board can be untangled locally yet
 * flipped relative to the rest, and then those points must move although they
 * are in no crossing.
 *
 * **Placement by face.** With the culprits lifted off, the lines left divide
 * the box into faces, and a culprit can only go in one that has all its
 * settled neighbors on its boundary. The search branches over faces (each
 * named by the wedge it opens at one neighbor) rather than over spots, trying a
 * few spots in each, and places the culprit with fewest options first. Each
 * culprit placed joins the settled drawing, and the next is placed against it.
 * The result is checked with the game's exact `cross()`.
 *
 * All the work is counted in candidate spots tested, not time, so a hint is the
 * same on every machine.
 */

import type { Point } from "../../engine/types.ts";
import {
  EDGE_GAP,
  pointSpacing,
  properCross,
  samePoint,
  segDist2,
  toRational,
  units,
} from "./geometry.ts";
import { cross, type Edge, type RationalPoint } from "./state.ts";

/** The endgame is tried only with at most this many crossings left. */
export const ENDGAME_CROSSINGS = 30;

/** Largest hitting set searched, and hitting sets tried per size. */
const MAX_HITTING = 6;
const SETS_PER_SIZE = 40;

/** Largest culprit set placed. Sets of up to 11 did not finish more boards
 * (design D8), and neither did flipping the points in mirror order whole
 * (`openspec/postmortems/2026-09-26-unflip-a-mirrored-untangle-cluster-withdrawal.md`). */
const MAX_CULPRITS = 8;

/** Candidate spots one request may test, over all culprit sets: the bound on
 * a request's cost. Twice this took the 20-point boards measured from 26.5
 * moves to 25.0 and the 25-point ones from 47.4 to 46.3, at 1.7 times the mean
 * request time (design D8). */
const WORK_BUDGET = 200_000;

/** Spots per axis of the grid every culprit is tried against, and the fractions
 * of a wedge and the distances (in point spacings) sampled near a neighbor. A
 * small face can fall between grid spots; the samples near its corners cannot
 * miss it. */
const GRID = 16;
const WEDGE_FRACTIONS = [0.5, 0.3, 0.7, 0.15, 0.85];
const WEDGE_RADII = [0.5, 0.8, 1.2, 1.7, 2.4];

/** Spots tried per face. */
const SPOTS_PER_FACE = 3;

/** Gaps a placement keeps, in point spacings, as the hint's spot search does:
 * from other points, and between a line and a point it does not end at. */
const POINT_GAP = 0.45;
const LINE_GAP = 0.2;

/** The gap, as a fraction of the full one, that a culprit left where it is
 * keeps from the lines and points it already sat beside: enough to rule out
 * touching, which the exact test would count as a crossing. */
const STAY_SCALE = 0.1;

/** How strongly a spot is drawn toward its settled neighbors' center, per
 * point spacing away, against how crowded it is. Without it a culprit takes the
 * emptiest corner and walls in the ones placed after it: on the owner's board
 * that cost 5 to 22 times the work, depending on the grid. */
const PULL = 3;

/** Softening term for the crowding score. */
const SPREAD_EPS = 0.25;

export interface EndgameMove {
  vertex: number;
  to: RationalPoint;
}

export interface Endgame {
  /** The moves, in the order they are to be made. */
  moves: EndgameMove[];
  /** Do the moves leave the board untangled, or only the movers' lines? */
  finishes: boolean;
}

/** Do edges `e` and `f` share a point? */
const adjacent = (e: Edge, f: Edge): boolean =>
  f.a === e.a || f.a === e.b || f.b === e.a || f.b === e.b;

/** The crossing pairs as edge indices, tested exactly as `findCrossings` does. */
function crossingPairs(
  pts: readonly RationalPoint[],
  edges: readonly Edge[],
): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e = edges[i];
      const f = edges[j];
      if (!adjacent(e, f) && cross(pts[f.a], pts[f.b], pts[e.a], pts[e.b]))
        out.push([i, j]);
    }
  }
  return out;
}

/** Does any crossing, tested exactly as `findCrossings` does, have one of
 * `points` at an end? */
function anyCrossingTouches(
  pts: readonly RationalPoint[],
  edges: readonly Edge[],
  points: readonly number[],
): boolean {
  const touches = (e: Edge) => points.includes(e.a) || points.includes(e.b);
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e = edges[i];
      const f = edges[j];
      if (!touches(e) && !touches(f)) continue;
      if (!adjacent(e, f) && cross(pts[f.a], pts[f.b], pts[e.a], pts[e.b])) return true;
    }
  }
  return false;
}

/** How many crossings `v`'s lines make, each pair tested in `findCrossings`'
 * argument order, so the count is the board's own. */
function lineCrossings(
  pts: readonly RationalPoint[],
  edges: readonly Edge[],
  v: number,
): number {
  let c = 0;
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    if (e.a !== v && e.b !== v) continue;
    for (let j = 0; j < edges.length; j++) {
      const f = edges[j];
      if (adjacent(e, f)) continue;
      const [hi, lo] = j > i ? [f, e] : [e, f];
      if (cross(pts[hi.a], pts[hi.b], pts[lo.a], pts[lo.b])) c++;
    }
  }
  return c;
}

/** How many crossings a move takes off the board (negative if it adds). */
function cutBy(
  pts: readonly RationalPoint[],
  edges: readonly Edge[],
  { vertex, to }: EndgameMove,
): number {
  const after = pts.slice();
  after[vertex] = to;
  return lineCrossings(pts, edges, vertex) - lineCrossings(after, edges, vertex);
}

/** The crossing pairs in groups that share a point, so that each group can be
 * cleared on its own. */
function clusters(
  pairs: readonly [number, number][],
  edges: readonly Edge[],
): [number, number][][] {
  const parent = pairs.map((_, i) => i);
  const find = (i: number): number => {
    let r = i;
    while (parent[r] !== r) {
      parent[r] = parent[parent[r]];
      r = parent[r];
    }
    return r;
  };
  const owner = new Map<number, number>();
  pairs.forEach(([i, j], k) => {
    for (const v of [edges[i].a, edges[i].b, edges[j].a, edges[j].b]) {
      const o = owner.get(v);
      if (o === undefined) owner.set(v, k);
      else parent[find(k)] = find(o);
    }
  });
  const groups = new Map<number, [number, number][]>();
  pairs.forEach((p, k) => {
    const g = groups.get(find(k)) ?? [];
    g.push(p);
    groups.set(find(k), g);
  });
  return [...groups.values()];
}

/** The sets of at most `k` points that touch every crossing pair, up to `cap`
 * of them, found by branching on an untouched pair's four points. */
function hittingSets(
  pairs: readonly [number, number][],
  edges: readonly Edge[],
  k: number,
  cap: number,
): number[][] {
  const seen = new Set<string>();
  const out: number[][] = [];
  const ends = pairs.map(([i, j]) => [edges[i].a, edges[i].b, edges[j].a, edges[j].b]);
  const chosen: number[] = [];
  const rec = (): void => {
    if (out.length >= cap) return;
    const open = ends.find((vs) => !vs.some((v) => chosen.includes(v)));
    if (open === undefined) {
      const set = chosen.slice().sort((a, b) => a - b);
      const key = set.join(",");
      if (!seen.has(key)) {
        seen.add(key);
        out.push(set);
      }
      return;
    }
    if (chosen.length === k) return;
    for (const v of open) {
      chosen.push(v);
      rec();
      chosen.pop();
    }
  };
  rec();
  return out;
}

/** Each point's neighbors in the order they go round it. */
function rotations(pu: readonly Point[], adj: readonly number[][]): number[][] {
  return adj.map((nb, v) => {
    const angle = (u: number) => Math.atan2(pu[u].y - pu[v].y, pu[u].x - pu[v].x);
    return nb.slice().sort((a, b) => angle(a) - angle(b));
  });
}

/** Are two circular orders the same, starting anywhere? */
function sameCycle(a: readonly number[], b: readonly number[]): boolean {
  const k = b.indexOf(a[0]);
  return k >= 0 && a.every((x, i) => b[(k + i) % b.length] === x);
}

/**
 * The points of degree 3 or more whose neighbors go round them in a different
 * order from the solved layout's, for whichever mirror image of it disagrees
 * less. Around a point of degree 2 or less every order is the same one.
 *
 * On a graph that is not 3-connected, parts can flip legitimately, so this is
 * a guide to which culprits to try first, never a set that must move: on the
 * 25-point boards measured it named up to 15 points on a board a few moves from
 * solved.
 */
function wrongOrder(
  pu: readonly Point[],
  layout: readonly Point[],
  adj: readonly number[][],
): number[] {
  const now = rotations(pu, adj);
  const goal = rotations(layout, adj);
  const wrong = (mirror: boolean): number[] => {
    const out: number[] = [];
    for (let v = 0; v < adj.length; v++) {
      if (adj[v].length < 3) continue;
      const g = mirror ? goal[v].slice().reverse() : goal[v];
      if (!sameCycle(now[v], g)) out.push(v);
    }
    return out;
  };
  const a = wrong(false);
  const b = wrong(true);
  return a.length <= b.length ? a : b;
}

interface Candidate {
  p: RationalPoint;
  u: Point;
}

/** The search that re-places culprit sets on one board. */
class Placer {
  readonly adj: number[][];
  readonly spacing: number;
  readonly pointGap: number;
  readonly lineGap: number;
  readonly edgeGap: number;
  readonly grid: Candidate[] = [];
  /** Candidate spots tested so far. */
  work = 0;

  constructor(
    readonly n: number,
    readonly w: number,
    readonly edges: readonly Edge[],
    readonly start: readonly RationalPoint[],
  ) {
    this.spacing = pointSpacing(n, w);
    this.pointGap = POINT_GAP * this.spacing;
    this.lineGap = LINE_GAP * this.spacing;
    this.edgeGap = EDGE_GAP * this.spacing;
    this.adj = Array.from({ length: n }, () => []);
    for (const e of edges) {
      this.adj[e.a].push(e.b);
      this.adj[e.b].push(e.a);
    }
    // Offset from the grid lines so a spot is not collinear with points that
    // sit on whole or half units.
    const lo = this.edgeGap;
    const span = w - 2 * lo;
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const p = toRational({
          x: lo + (span * (i + 0.37)) / (GRID - 0.26),
          y: lo + (span * (j + 0.61)) / (GRID - 0.26),
        });
        this.grid.push({ p, u: units(p) });
      }
    }
  }

  /**
   * Re-place `culprits` so that none of their lines crosses anything, testing
   * no more than `budget` spots; if not, the culprits that were left with
   * nowhere to go, most often first. Culprits that can stay where they are do.
   */
  place(
    culprits: readonly number[],
    budget: number,
  ): { pts: RationalPoint[] } | { stuck: number[] } {
    const pts = this.start.slice();
    const pu = pts.map(units);
    const settled = this.start.map(() => true);
    for (const v of culprits) settled[v] = false;
    const limit = this.work + budget;
    const stuck = new Map<number, number>();
    const settledDegree = (v: number) => this.adj[v].filter((u) => settled[u]).length;

    const rec = (todo: number[]): boolean => {
      if (todo.length === 0) return !anyCrossingTouches(pts, this.edges, culprits);
      if (this.work > limit) return false;
      // Fail first: the culprit with fewest places left goes next, and one with
      // none ends this branch before anything else is placed around it.
      let best = -1;
      let opts: Candidate[] = [];
      for (let i = 0; i < todo.length; i++) {
        const o = this.options(todo[i], pts, pu, settled);
        if (o.length === 0) {
          stuck.set(todo[i], (stuck.get(todo[i]) ?? 0) + 1);
          return false;
        }
        if (
          best < 0 ||
          o.length < opts.length ||
          (o.length === opts.length &&
            settledDegree(todo[i]) > settledDegree(todo[best]))
        ) {
          best = i;
          opts = o;
        }
      }
      const v = todo[best];
      const rest = todo.filter((_, i) => i !== best);
      for (const c of opts) {
        pts[v] = c.p;
        pu[v] = c.u;
        settled[v] = true;
        if (rec(rest)) return true;
        settled[v] = false;
        pts[v] = this.start[v];
        pu[v] = units(this.start[v]);
        if (this.work > limit) return false;
      }
      return false;
    };
    if (rec(culprits.slice())) return { pts };
    return {
      stuck: [...stuck.entries()]
        .sort((a, b) => b[1] - a[1] || a[0] - b[0])
        .map(([v]) => v),
    };
  }

  /**
   * Where `v` can go against the settled drawing: staying put, where that
   * works, then a few spots in each face that sees all its settled neighbors,
   * every face's best before any face's second.
   */
  options(
    v: number,
    pts: readonly RationalPoint[],
    pu: readonly Point[],
    settled: readonly boolean[],
  ): Candidate[] {
    const nb = this.adj[v].filter((u) => settled[u]);
    const lines: number[] = [];
    for (const f of this.edges) {
      if (settled[f.a] && settled[f.b]) lines.push(f.a, f.b);
    }
    const moved = (x: number): boolean => pts[x] !== this.start[x];

    /** Do `v`'s lines from `p` to its settled neighbors cross nothing, keeping
     * the line gap? With `staying`, `v` is where the player left it, and only
     * the lines and points the search has moved must keep the full gap: the
     * rest is how the board already looks. */
    const sees = (p: Point, staying: boolean): boolean => {
      const full = this.lineGap ** 2;
      const slack = (this.lineGap * STAY_SCALE) ** 2;
      const gap2 = (...xs: number[]): number =>
        staying && !xs.some(moved) ? slack : full;
      for (let i = 0; i < lines.length; i += 2) {
        const a = lines[i];
        const b = lines[i + 1];
        if (segDist2(p, pu[a], pu[b]) < gap2(a, b)) return false;
        for (const u of nb) {
          if (u !== a && u !== b && properCross(p, pu[u], pu[a], pu[b])) return false;
        }
      }
      for (const u of nb) {
        for (let x = 0; x < this.n; x++) {
          if (x === u || x === v || !settled[x]) continue;
          if (segDist2(pu[x], p, pu[u]) < gap2(u, x)) return false;
        }
      }
      return true;
    };

    const roomy = (p: Point): boolean => {
      const { w, edgeGap } = this;
      // A hairline under the margin passes, as in the hint's own spot search.
      if (Math.min(p.x, p.y, w - p.x, w - p.y) < edgeGap - 1 / 32) return false;
      for (let x = 0; x < this.n; x++) {
        if (x === v || !settled[x]) continue;
        if ((p.x - pu[x].x) ** 2 + (p.y - pu[x].y) ** 2 < this.pointGap ** 2)
          return false;
      }
      return true;
    };

    // Lower is better: roomy, and near the settled neighbors. The walls count
    // as neighbors along their length, as in the hint's spot search.
    const center =
      nb.length === 0
        ? null
        : {
            x: nb.reduce((s, u) => s + pu[u].x, 0) / nb.length,
            y: nb.reduce((s, u) => s + pu[u].y, 0) / nb.length,
          };
    const score = (p: Point): number => {
      let s = 0;
      for (let x = 0; x < this.n; x++) {
        if (x !== v && settled[x])
          s += 1 / (Math.hypot(p.x - pu[x].x, p.y - pu[x].y) + SPREAD_EPS);
      }
      const wallWeight = Math.sqrt(this.n);
      for (const gap of [p.x, p.y, this.w - p.x, this.w - p.y]) {
        s += wallWeight / (gap + SPREAD_EPS);
      }
      if (center !== null) {
        s += (PULL * Math.hypot(p.x - center.x, p.y - center.y)) / this.spacing;
      }
      return s;
    };

    // The face a spot is in, named by the wedge at one settled neighbor that the
    // line to it leaves through: two spots in one wedge are in one face.
    const anchor = nb.length > 0 ? nb[0] : -1;
    const around =
      anchor < 0
        ? []
        : this.adj[anchor]
            .filter((u) => settled[u])
            .map((u) => ({
              u,
              t: Math.atan2(pu[u].y - pu[anchor].y, pu[u].x - pu[anchor].x),
            }));
    const faceOf = (p: Point): number => {
      if (around.length < 2) return 0;
      const t = Math.atan2(p.y - pu[anchor].y, p.x - pu[anchor].x);
      let face = -1;
      let least = Infinity;
      for (const a of around) {
        const turn = (((t - a.t) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        if (turn < least) {
          least = turn;
          face = a.u;
        }
      }
      return face;
    };

    const out: Candidate[] = [];
    const here: Candidate = { p: this.start[v], u: units(this.start[v]) };
    this.work++;
    const crowdedByMoved = pu.some(
      (q, x) =>
        x !== v &&
        settled[x] &&
        moved(x) &&
        (q.x - here.u.x) ** 2 + (q.y - here.u.y) ** 2 < this.pointGap ** 2,
    );
    if (!crowdedByMoved && sees(here.u, true)) out.push(here);

    const faces = new Map<number, { c: Candidate; score: number }[]>();
    const consider = (c: Candidate): void => {
      this.work++;
      if (!roomy(c.u) || !sees(c.u, false)) return;
      const key = faceOf(c.u);
      const list = faces.get(key) ?? [];
      list.push({ c, score: score(c.u) });
      faces.set(key, list);
    };
    for (const c of this.grid) consider(c);
    for (const u of nb) {
      const a = pu[u];
      const round = this.adj[u]
        .filter((x) => settled[x])
        .map((x) => Math.atan2(pu[x].y - a.y, pu[x].x - a.x))
        .sort((p, q) => p - q);
      const wedges: [number, number][] =
        round.length === 0
          ? [[0, 2 * Math.PI]]
          : round.map((t, i) => [
              t,
              (i + 1 < round.length ? round[i + 1] : round[0] + 2 * Math.PI) - t,
            ]);
      for (const [from, width] of wedges) {
        for (const f of WEDGE_FRACTIONS) {
          for (const r of WEDGE_RADII) {
            const p = toRational({
              x: a.x + r * this.spacing * Math.cos(from + f * width),
              y: a.y + r * this.spacing * Math.sin(from + f * width),
            });
            consider({ p, u: units(p) });
          }
        }
      }
    }

    // Within a face the spot still matters to the culprits placed after it, so
    // each face offers a few, best first and each well clear of the ones before.
    const picks = [...faces.values()].map((list) => {
      list.sort((a, b) => a.score - b.score);
      const chosen: { c: Candidate; score: number }[] = [];
      for (const s of list) {
        if (chosen.length >= SPOTS_PER_FACE) break;
        const far = chosen.every(
          (o) => Math.hypot(o.c.u.x - s.c.u.x, o.c.u.y - s.c.u.y) > this.spacing,
        );
        if (far) chosen.push(s);
      }
      return chosen;
    });
    picks.sort((a, b) => a[0].score - b[0].score);
    for (let round = 0; round < SPOTS_PER_FACE; round++) {
      for (const list of picks) {
        const c = list[round]?.c;
        if (c !== undefined && !samePoint(c.p, here.p)) out.push(c);
      }
    }
    return out;
  }
}

/**
 * Order a plan's moves. The final board is the same in any order, so each step
 * takes the move that takes most crossings off the board as it then stands —
 * except that the first is never a frozen point's.
 */
function orderMoves(
  start: readonly RationalPoint[],
  edges: readonly Edge[],
  moves: readonly EndgameMove[],
  frozen: readonly boolean[],
): EndgameMove[] {
  const pts = start.slice();
  const left = moves.slice();
  const out: EndgameMove[] = [];
  while (left.length > 0) {
    let bestI = 0;
    let bestCut = -Infinity;
    for (let i = 0; i < left.length; i++) {
      if (out.length === 0 && frozen[left[i].vertex]) continue;
      const cut = cutBy(pts, edges, left[i]);
      if (cut > bestCut) {
        bestCut = cut;
        bestI = i;
      }
    }
    const [m] = left.splice(bestI, 1);
    pts[m.vertex] = m.to;
    out.push(m);
  }
  return out;
}

/**
 * A journey from this board: moves that leave every mover's lines crossing
 * nothing, or `null` when there are too many crossings for it or no culprit set
 * small enough can be re-placed within the budget. `targets` is the solved
 * layout, if there is one.
 *
 * `frozen` points (the ones on their place in the solved layout) keep the hint
 * terminating, recomputed after any step: a journey's first move never moves
 * one and always takes a crossing off the board, and a journey that does not
 * finish the board moves none at all. So every step, of whatever kind, either
 * places a point or cuts crossings without unplacing one; only a journey that
 * ends solved moves a placed point, after its first step.
 */
export function planEndgame(
  n: number,
  w: number,
  edges: readonly Edge[],
  pts: readonly RationalPoint[],
  targets: readonly RationalPoint[] | null,
  frozen: readonly boolean[],
): Endgame | null {
  const pairs = crossingPairs(pts, edges);
  if (pairs.length === 0 || pairs.length > ENDGAME_CROSSINGS) return null;
  const placer = new Placer(n, w, edges, pts);
  const wrong =
    targets === null
      ? []
      : wrongOrder(pts.map(units), targets.map(units), placer.adj).filter(
          (v) => !frozen[v],
        );
  const finishes = (set: readonly number[]): boolean =>
    pairs.every(([i, j]) =>
      [edges[i].a, edges[i].b, edges[j].a, edges[j].b].some((v) => set.includes(v)),
    );

  // Culprit sets waiting to be tried. Each group of crossings that shares no
  // point with the rest seeds its own sets, so one can be cleared without
  // searching the others' culprits alongside it.
  const queue: number[][] = [];
  const seen = new Set<string>();
  const offer = (set: Iterable<number>): void => {
    const culprits = [...new Set(set)].sort((a, b) => a - b);
    const key = culprits.join(",");
    if (culprits.length > MAX_CULPRITS || seen.has(key)) return;
    if (culprits.some((v) => frozen[v]) && !finishes(culprits)) return;
    seen.add(key);
    queue.push(culprits);
  };
  for (let k = 1; k <= MAX_HITTING; k++) {
    for (const group of clusters(pairs, edges)) {
      for (const hit of hittingSets(group, edges, k, SETS_PER_SIZE)) {
        offer([...hit, ...wrong]);
        offer(hit);
      }
    }
  }

  // Ranked by the points a set adds to the ones in the wrong order, then by
  // size: those will likely have to move anyway.
  const extra = (set: readonly number[]): number =>
    set.filter((v) => !wrong.includes(v)).length;
  const sooner = (a: readonly number[], b: readonly number[]): boolean =>
    extra(a) < extra(b) || (extra(a) === extra(b) && a.length < b.length);
  while (queue.length > 0 && placer.work < WORK_BUDGET) {
    let next = 0;
    for (let i = 1; i < queue.length; i++) {
      if (sooner(queue[i], queue[next])) next = i;
    }
    const [culprits] = queue.splice(next, 1);
    const got = placer.place(culprits, WORK_BUDGET - placer.work);
    if ("stuck" in got) {
      for (const s of got.stuck.slice(0, 2)) {
        for (const x of placer.adj[s]) {
          if (!culprits.includes(x)) offer([...culprits, x]);
        }
      }
      continue;
    }
    const moves = orderMoves(
      pts,
      edges,
      culprits
        .filter((v) => !samePoint(got.pts[v], pts[v]))
        .map((v) => ({ vertex: v, to: got.pts[v] })),
      frozen,
    );
    if (
      moves.length > 0 &&
      !frozen[moves[0].vertex] &&
      cutBy(pts, edges, moves[0]) > 0
    ) {
      return { moves, finishes: finishes(culprits) };
    }
  }
  return null;
}
