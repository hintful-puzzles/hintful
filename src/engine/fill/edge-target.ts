/**
 * Where the player aims on an answer on the edges: the edge between two
 * squares, as the half-grid point `border-grid.ts`'s cursor rests on,
 * `(2x + 1, 2y + 1)` the middle of square `(x, y)`. So the fill input keeps
 * one target, a `Point`, on either sort, and the cursor is its own target.
 */

import type { Point } from "../contract/types.ts";
import type { GridCursor } from "../input/pointer.ts";
import type { Sweep, TargetGeometry } from "../input/target-verb.ts";
import {
  type BorderEdge,
  type BorderGridSize,
  type BorderOf,
  borderGridGeometry,
  DX,
  DY,
  edgeSweepReach,
} from "../mechanics/border-grid.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";

/** The half-grid point of edge `e`. */
const pointOf = ({ x, y, dir }: BorderEdge): Point => ({
  x: 2 * x + 1 + DX[dir],
  y: 2 * y + 1 + DY[dir],
});

/** The edge at half-grid point `p`, named from the square left of it or
 * above it; `null` on a square's middle or a corner. */
function edgeOfPoint({ x, y }: Point): BorderEdge | null {
  if (x % 2 === y % 2) return null;
  return x % 2 === 0
    ? { x: x / 2 - 1, y: (y - 1) / 2, dir: 1 }
    : { x: (x - 1) / 2, y: y / 2 - 1, dir: 2 };
}

/** The edge at target `p`, which a target always is. */
function edgeAt(p: Point): BorderEdge {
  const e = edgeOfPoint(p);
  if (e === null) throw new Error(`(${p.x}, ${p.y}) is not an edge's point`);
  return e;
}

/** The two squares either side of the edge at half-grid point `p`, the one
 * left of it or above it first. */
export function squaresOfEdge(p: Point): readonly [Point, Point] {
  const { x, y, dir } = edgeAt(p);
  return [
    { x, y },
    { x: x + DX[dir], y: y + DY[dir] },
  ];
}

/** The space's edge at half-grid point `p`, `-1` where none is. */
export function elementAtPoint(sp: GridSpace, p: Point): number {
  const e = edgeOfPoint(p);
  if (e === null || e.x < 0 || e.y < 0) return -1;
  const a = e.y * sp.w + e.x;
  const across = e.dir === 1 ? e.x + 1 < sp.w : e.y + 1 < sp.h;
  return across ? sp.edgeOf(a, e.dir === 1 ? a + 1 : a + sp.w) : -1;
}

/** The half-grid point of the space's edge `e`. */
export function pointOfElement(sp: GridSpace, e: number): Point {
  const p = sp.edgeEnds[2 * e];
  const q = sp.edgeEnds[2 * e + 1];
  const x = p % sp.w;
  const y = Math.floor(p / sp.w);
  // A grid one square wide has its squares below one another `p + 1` apart.
  return q === p + sp.w
    ? { x: 2 * x + 1, y: 2 * y + 2 }
    : { x: 2 * x + 2, y: 2 * y + 1 };
}

/** The geometry of the edges of a grid drawn `border` in: a press aims at
 * the nearest edge, and the half-grid cursor steps between the edges and the
 * squares' middles (`moveBorderCursor`). */
export function edgeGeometry<
  State extends BorderGridSize,
  DrawState extends { readonly tileSize: number },
>(
  border: BorderOf<State>,
): TargetGeometry<State, { cursor: GridCursor }, DrawState, Point> {
  const g = borderGridGeometry<State, DrawState>(border);
  return {
    noun: g.noun,
    pointerTarget(s, ds, p, ui) {
      const e = g.pointerTarget(s, ds, p, ui);
      return e === null ? null : pointOf(e);
    },
    pointAt: (s, ds, t, ui) => g.pointAt(s, ds, edgeAt(t), ui),
    cursorTarget(s, ui) {
      const e = g.cursorTarget(s, ui);
      return e === null ? null : pointOf(e);
    },
    parkCursor(ui, t) {
      ui.cursor.x = t.x;
      ui.cursor.y = t.y;
    },
    moveCursor: g.moveCursor,
  };
}

/** How near its middle a drag takes an edge, as `border-grid.ts` reaches. */
export function edgeReach<
  State extends BorderGridSize,
  DrawState extends { readonly tileSize: number },
>(
  border: BorderOf<State>,
): Required<Pick<Sweep<State, DrawState, Point>, "within" | "middle">> {
  const reach = edgeSweepReach<State, DrawState>(border);
  return {
    within: (ds, s, t) => reach.within(ds, s, edgeAt(t)),
    middle: (ds, s, t) => reach.middle(ds, s, edgeAt(t)),
  };
}
