/**
 * The board's untangled layout — what Solve lands on and what the hint falls
 * back to when no single move helps.
 *
 * It comes from the generator's `aux` when the session has one, and otherwise
 * from the edges alone (`planar.ts`), so a shared game ID or a resumed save can
 * be solved and hinted exactly like a freshly generated board. Either way the
 * result is **exact** (integer rationals) and **checked crossing-free with the
 * game's own `cross()`** before it is returned: a layout that failed the check
 * would hand the player a "solution" the board does not accept.
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
import { planarLayout } from "./planar.ts";
import {
  dihedralMatrix,
  type Edge,
  findCrossings,
  parseAux,
  type RationalPoint,
} from "./state.ts";

/** The margin the layout keeps inside the play box — the hint's frame margin,
 * so a point placed by the hint's fallback sits as far in as any other. */
const fillMargin = (n: number, w: number): number => EDGE_GAP * pointSpacing(n, w);

/** The closest, in point spacings, the relaxation lets a point come to another
 * point or to a line it is not an end of. */
const CLEARANCE = 0.4;

const RELAX_ITERATIONS = 120;

/** Distinct points, and no two lines crossing or touching. */
function isUntangled(pts: readonly RationalPoint[], edges: readonly Edge[]): boolean {
  const keys = new Set(
    pts.map((p) => `${(p.x / p.d).toFixed(9)},${(p.y / p.d).toFixed(9)}`),
  );
  if (keys.size !== pts.length) return false;
  return findCrossings(pts, edges).completed;
}

/** Scale `pts` (any units) to fill the box `m..w-m`, independently on each
 * axis when `stretch` (any affine map keeps a drawing crossing-free), else
 * uniformly about the center. */
function fillBox(pts: readonly Point[], w: number, stretch: boolean): Point[] {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const bw = Math.max(...xs) - minX;
  const bh = Math.max(...ys) - minY;
  const avail = w - 2 * fillMargin(pts.length, w);
  const sx = bw > 1e-9 ? avail / bw : 1;
  const sy = bh > 1e-9 ? avail / bh : 1;
  const s = Math.min(sx, sy);
  const kx = stretch ? sx : s;
  const ky = stretch ? sy : s;
  const ox = (w - bw * kx) / 2;
  const oy = (w - bh * ky) / 2;
  return pts.map((p) => ({ x: ox + (p.x - minX) * kx, y: oy + (p.y - minY) * ky }));
}

/**
 * Spread a crossing-free drawing out without ever letting it tangle: a
 * spring-and-repulsion pull on each point in turn, where a step is taken only
 * if the point's lines still cross nothing and it comes no closer than
 * `CLEARANCE` point spacings to any other point or line (or no closer than it
 * already was). The shift
 * drawing it starts from crowds its points along one edge of a triangle; this
 * is what makes the result read as a layout rather than a proof.
 */
function relax(start: readonly Point[], edges: readonly Edge[], w: number): Point[] {
  const n = start.length;
  const pos = start.map((p) => ({ ...p }));
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.a].push(e.b);
    adj[e.b].push(e.a);
  }
  const lo = fillMargin(n, w);
  const hi = w - lo;
  const minGap = CLEARANCE * pointSpacing(n, w);
  const k = (hi - lo) / Math.sqrt(n);

  /** The smallest distance from point `v` at `p` to another point or a line
   * it is not an end of, and from `v`'s lines to the other points — or -1 if
   * one of its lines would cross another. */
  const clearance = (v: number, p: Point): number => {
    let c2 = Infinity;
    for (let u = 0; u < n; u++) {
      if (u === v) continue;
      c2 = Math.min(c2, (p.x - pos[u].x) ** 2 + (p.y - pos[u].y) ** 2);
    }
    for (const e of edges) {
      if (e.a === v || e.b === v) continue;
      c2 = Math.min(c2, segDist2(p, pos[e.a], pos[e.b]));
      for (const u of adj[v]) {
        if (e.a === u || e.b === u) continue;
        if (properCross(p, pos[u], pos[e.a], pos[e.b])) return -1;
      }
    }
    for (const u of adj[v]) {
      for (let x = 0; x < n; x++) {
        if (x === v || x === u) continue;
        c2 = Math.min(c2, segDist2(pos[x], p, pos[u]));
      }
    }
    return Math.sqrt(c2);
  };

  for (let it = 0; it < RELAX_ITERATIONS; it++) {
    const temp = k * 0.25 * (1 - it / RELAX_ITERATIONS) + 0.005;
    for (let v = 0; v < n; v++) {
      let fx = 0;
      let fy = 0;
      for (let u = 0; u < n; u++) {
        if (u === v) continue;
        const dx = pos[v].x - pos[u].x;
        const dy = pos[v].y - pos[u].y;
        const d2 = Math.max(dx * dx + dy * dy, 1e-6);
        fx += (dx * k * k) / d2;
        fy += (dy * k * k) / d2;
      }
      for (const u of adj[v]) {
        const dx = pos[u].x - pos[v].x;
        const dy = pos[u].y - pos[v].y;
        const d = Math.hypot(dx, dy);
        fx += (dx * d) / k;
        fy += (dy * d) / k;
      }
      const f = Math.hypot(fx, fy);
      if (f < 1e-9) continue;
      const before = clearance(v, pos[v]);
      const floor = Math.min(minGap, before);
      // The full step, else half of it, else a quarter.
      for (let scale = 1; scale >= 0.25; scale /= 2) {
        const step = Math.min(f, temp) * scale;
        const p = {
          x: Math.min(hi, Math.max(lo, pos[v].x + (fx / f) * step)),
          y: Math.min(hi, Math.max(lo, pos[v].y + (fy / f) * step)),
        };
        if (clearance(v, p) >= floor) {
          pos[v] = p;
          break;
        }
      }
    }
  }
  return pos;
}

/** The generator's layout, scaled up to fill the box. */
function fromAux(aux: string, n: number, edges: readonly Edge[], w: number) {
  const raw = parseAux(aux, n);
  if (raw === null || !isUntangled(raw, edges)) return null;
  const filled = fillBox(raw.map(units), w, false).map(toRational);
  // Rounding a scaled layout could in principle close a near-collinear gap;
  // the unscaled one is exact.
  return isUntangled(filled, edges) ? filled : raw;
}

/** A layout computed from the edges alone, or `null` for a non-planar graph
 * (which only a hand-typed description can be). */
function fromEdges(n: number, edges: readonly Edge[], w: number) {
  const grid = planarLayout(n, edges);
  if (grid === null) return null;
  const stretched = fillBox(grid, w, true);
  const relaxed = relax(stretched, edges, w).map(toRational);
  if (isUntangled(relaxed, edges)) return relaxed;
  const plain = stretched.map(toRational);
  if (isUntangled(plain, edges)) return plain;
  // The shift drawing itself, exactly: integer grid points need no rounding.
  const sx = Math.max(1, ...grid.map((p) => p.x));
  const sy = Math.max(1, ...grid.map((p) => p.y));
  const d = 2 * sx * sy;
  return grid.map((p) => ({
    x: sx * sy + 2 * p.x * (w - 1) * sy,
    y: sx * sy + 2 * p.y * (w - 1) * sx,
    d,
  }));
}

/** Layouts per board and per aux. Keyed on the frozen `edges` array, which
 * every state of one game shares by reference. */
const cache = new WeakMap<readonly Edge[], Map<string, RationalPoint[] | null>>();

/** The board's untangled layout, in a fixed orientation, or `null` if the
 * graph has none. */
export function solvedLayout(
  n: number,
  w: number,
  edges: readonly Edge[],
  aux?: string,
): RationalPoint[] | null {
  let perBoard = cache.get(edges);
  if (perBoard === undefined) {
    perBoard = new Map();
    cache.set(edges, perBoard);
  }
  const key = aux ?? "";
  const hit = perBoard.get(key);
  if (hit !== undefined) return hit;
  const layout = (aux ? fromAux(aux, n, edges, w) : null) ?? fromEdges(n, edges, w);
  perBoard.set(key, layout);
  return layout;
}

/**
 * `layout` under whichever of the square's eight symmetries has the most
 * points of `pts` already exactly in place, then the least motion (upstream
 * Solve's criterion). Putting the placed count first is what lets a hint
 * recomputed mid-plan pick up the orientation it was building.
 */
export function closestOrientation(
  layout: readonly RationalPoint[],
  pts: readonly RationalPoint[],
  w: number,
): RationalPoint[] {
  let best: RationalPoint[] = [];
  let bestPlaced = -1;
  let bestDist = Infinity;
  for (let k = 0; k < 8; k++) {
    const t = orientLayout(layout, w, k);
    let placed = 0;
    let dist = 0;
    for (let v = 0; v < pts.length; v++) {
      if (samePoint(pts[v], t[v])) placed++;
      const a = units(pts[v]);
      const b = units(t[v]);
      dist += (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    }
    if (placed > bestPlaced || (placed === bestPlaced && dist < bestDist)) {
      best = t;
      bestPlaced = placed;
      bestDist = dist;
    }
  }
  return best;
}

/** `layout` under dihedral symmetry `k` of the `w`-square — exact, since each
 * symmetry only negates and swaps coordinates about the center. */
function orientLayout(
  layout: readonly RationalPoint[],
  w: number,
  k: number,
): RationalPoint[] {
  const [m0, m1, m2, m3] = dihedralMatrix(k);
  return layout.map((p) => {
    const px = 2 * p.x - w * p.d;
    const py = 2 * p.y - w * p.d;
    return {
      x: m0 * px + m1 * py + w * p.d,
      y: m2 * px + m3 * py + w * p.d,
      d: 2 * p.d,
    };
  });
}
