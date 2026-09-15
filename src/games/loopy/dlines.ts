/**
 * **Dlines** — the solver's pair-of-adjacent-edges bookkeeping, and the single
 * highest-risk coupling in the whole Loopy port.
 *
 * A dline is a pair of edges meeting at a common dot and adjacent around it —
 * equivalently a (dot, face) corner. Upstream's insight is that such a pair is
 * uniquely named by an **(edge, which-end)** combination, because a dline
 * always runs in its common dot's edge order: so there are exactly
 * `2 × numEdges` of them, indexed `2 * edge.index + (edge.dot1 === dot ? 1 : 0)`.
 * Each slot holds two bits: "at least one of the pair is YES" and "at most one
 * of the pair is YES". (Knowing *both* or *neither* is YES is already recorded
 * more directly, in the line states themselves.)
 *
 * Both index formulas depend on `grid.ts` reproducing `grid_make_consistent`'s
 * **ordering** conventions exactly:
 *
 * - {@link dlineIndexFromDot}`(d, i)` names the pair
 *   `(d.edges[i], d.edges[(i + 1) % d.order])` — **in the dot's edge order**, which
 *   is one rotational sense for the whole grid: clockwise on screen for most
 *   tilings, anticlockwise for floret and both Penrose tilings (`notes.ts`).
 * - {@link dlineIndexFromFace}`(f, i)` names the pair *starting* at
 *   `f.edges[i]` read **in the opposite sense around the face**, and relies on the
 *   interleaving convention that the common dot of that pair is exactly
 *   `f.dots[i]`.
 *
 * **If those orderings are off, nothing crashes and nothing asserts.** Every
 * dline deduction silently indexes the wrong pair, the solver quietly gets
 * weaker, and — because the generator is solver-gated — the game generates
 * *different puzzles* rather than showing a visible fault. Upstream eyeballed
 * this with `DEBUG_DLINES` printfs; `dlines.test.ts` asserts it across all 18
 * tilings.
 */
import type { Grid, GridDot, GridFace } from "../../engine/grid/index.ts";

/** Number of dline slots a grid needs. */
export function dlineCount(g: Grid): number {
  return 2 * g.numEdges;
}

/**
 * Index of the dline whose **first** edge (reading `d.edges` in order) is
 * `d.edges[i]`. Mirrors `dline_index_from_dot`.
 */
export function dlineIndexFromDot(d: GridDot, i: number): number {
  const e = d.edges[i];
  return 2 * e.index + (e.dot1 === d ? 1 : 0);
}

/**
 * Index of the dline whose **second** edge (reading `f.edges` in order) is
 * `f.edges[i]` — equivalently, the pair starting at `f.edges[i]` read
 * anticlockwise around the face. By the grid's layout conventions the pair's
 * common dot is `f.dots[i]`. Mirrors `dline_index_from_face`.
 */
export function dlineIndexFromFace(f: GridFace, i: number): number {
  // biome-ignore lint/style/noNonNullAssertion: a consistent grid has every face edge and dot set.
  const e = f.edges[i]!;
  // biome-ignore lint/style/noNonNullAssertion: ditto.
  const d = f.dots[i]!;
  return 2 * e.index + (e.dot1 === d ? 1 : 0);
}

/**
 * The dot and the two edges a dline index names: the inverse of
 * {@link dlineIndexFromDot}. The pair is `(first, second)` clockwise around
 * `dot`.
 */
export function dlineEnds(
  g: Grid,
  index: number,
): { dot: GridDot; first: number; second: number } {
  const e = g.edges[index >> 1];
  const dot = index & 1 ? e.dot1 : e.dot2;
  const j = dot.edges.indexOf(e);
  return { dot, first: e.index, second: dot.edges[(j + 1) % dot.order].index };
}

/** Do we know at least one of this dline's two edges is YES? */
export function isAtLeastOne(dlines: Uint8Array, index: number): boolean {
  return (dlines[index] & 1) !== 0;
}

/** Record "at least one of this pair is YES". Returns whether this was new
 * information (upstream's `SET_BIT`, whose return value drives the solver's
 * progress reporting). */
export function setAtLeastOne(dlines: Uint8Array, index: number): boolean {
  if ((dlines[index] & 1) !== 0) return false;
  dlines[index] |= 1;
  return true;
}

/** Do we know at most one of this dline's two edges is YES? */
export function isAtMostOne(dlines: Uint8Array, index: number): boolean {
  return (dlines[index] & 2) !== 0;
}

/** Record "at most one of this pair is YES". Returns whether this was new
 * information. */
export function setAtMostOne(dlines: Uint8Array, index: number): boolean {
  if ((dlines[index] & 2) !== 0) return false;
  dlines[index] |= 2;
  return true;
}
