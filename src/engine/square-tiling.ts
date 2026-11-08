/**
 * A grid of squares read as a tiling (`describe-runtime.ts`'s `Tiling`):
 * each square is a dot, joined to the squares beside it by the sides
 * between them, which are its edges, and a face lies where four squares
 * meet. On a wrapping board the sides across the grid's edge join too, so
 * the grid is a torus. Net's description reads its board so: a dot's two
 * edges meet at a corner exactly where they bound one face.
 */

import type { Tiling } from "./describe-runtime.ts";
import { D, DX, DY, L, R, U } from "./square-edges.ts";

/** A square grid as a tiling, and where each side of each square is in it. */
export interface SquareTiling {
  readonly tiling: Tiling;
  /** The edge across side `d` (a direction bit) of square `i`, at
   * `i * 16 + d`, or -1 where the side joins no square. */
  readonly sideEdge: Int32Array;
  /** Each edge's square and the side of it the edge is across: the square
   * to its left or above it. */
  readonly edgeSquare: Int32Array;
  readonly edgeSide: Uint8Array;
}

const DIRECTION_OF: Readonly<Record<number, number>> = {
  [R]: 0,
  [U]: 1,
  [L]: 2,
  [D]: 3,
};

/**
 * The `w × h` grid of squares as a tiling, wrapping where `wrapping` says.
 * A dimension of 1 never wraps: its one square would be beside itself, and
 * a wire across that side would close a loop at once. A dimension of 2
 * wraps into two edges between the same two squares.
 *
 * Each square's edges are in its turn, clockwise from up; each face's
 * squares and edges are round it from its upper left square, and its angle
 * at square `i` lies between its edges `i - 1` and `i`, as a tiling's is.
 */
export function squareTiling(w: number, h: number, wrapping: boolean): SquareTiling {
  const n = w * h;
  const wrapX = wrapping && w > 1;
  const wrapY = wrapping && h > 1;
  const sideEdge = new Int32Array(n * 16).fill(-1);
  const edgeSquare: number[] = [];
  const edgeSide: number[] = [];
  const ends: [number, number][] = [];
  const at = (x: number, y: number): number => ((y + h) % h) * w + ((x + w) % w);
  // A square's right and lower sides, in reading order of their squares.
  for (let i = 0; i < n; i++) {
    const x = i % w;
    const y = (i / w) | 0;
    for (const d of [R, D]) {
      const dir = DIRECTION_OF[d];
      const nx = x + DX[dir];
      const ny = y + DY[dir];
      const inside = nx < w && ny < h;
      if (!inside && !(d === R ? wrapX : wrapY)) continue;
      const j = at(nx, ny);
      const e = ends.length;
      ends.push([i, j]);
      edgeSquare.push(i);
      edgeSide.push(d);
      sideEdge[i * 16 + d] = e;
      sideEdge[j * 16 + (d === R ? L : U)] = e;
    }
  }
  const edgeAt = (i: number, d: number): number => sideEdge[i * 16 + d];
  // A face is the corner where a square's right and lower sides meet the
  // square diagonally below it: present where all four of its sides are.
  const faces: { dots: number[]; edges: number[] }[] = [];
  const edgeFaces: number[][] = ends.map(() => []);
  for (let i = 0; i < n; i++) {
    const x = i % w;
    const y = (i / w) | 0;
    const right = at(x + 1, y);
    const below = at(x, y + 1);
    const diagonal = at(x + 1, y + 1);
    const top = edgeAt(i, R);
    const left = edgeAt(i, D);
    const bottom = edgeAt(below, R);
    const side = edgeAt(right, D);
    if (top < 0 || left < 0 || bottom < 0 || side < 0) continue;
    const f = faces.length;
    // Round the face from its upper left square: right, down, left, up.
    faces.push({ dots: [i, right, diagonal, below], edges: [top, side, bottom, left] });
    for (const e of [top, side, bottom, left]) edgeFaces[e].push(f);
  }
  const index = (k: number): { readonly index: number } => ({ index: k });
  const tiling: Tiling = {
    dots: Array.from({ length: n }, (_, i) => ({
      edges: [U, R, D, L].flatMap((d) => {
        const e = edgeAt(i, d);
        return e < 0 ? [] : [index(e)];
      }),
    })),
    edges: ends.map(([a, b], e) => ({
      dot1: index(a),
      dot2: index(b),
      face1: edgeFaces[e].length > 0 ? index(edgeFaces[e][0]) : null,
      face2: edgeFaces[e].length > 1 ? index(edgeFaces[e][1]) : null,
    })),
    faces: faces.map((f) => ({ dots: f.dots.map(index), edges: f.edges.map(index) })),
  };
  return {
    tiling,
    sideEdge,
    edgeSquare: Int32Array.from(edgeSquare),
    edgeSide: Uint8Array.from(edgeSide),
  };
}
