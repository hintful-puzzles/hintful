/**
 * A hint on the edges between the squares of a square grid: the mark kind a
 * sentence names an edge by, the bits each square's tile key holds for it,
 * and their drawing (docs/hints-marks.md § "A mark on something that is not a
 * cell").
 *
 * A step asks for an edge as a line or a cross, and the edge is drawn as that
 * line or cross in the ring's ink: the move's own shape, recolored. An edge
 * the step reasons from, or one a supposition's chain would force, is drawn
 * in the outline's ink, and a chain's edge carries its place in the chain.
 * How a line and a cross look is the game's own, so the game declares them
 * ({@link EdgeShapes}); which sides of which squares carry what, in which ink,
 * and where the ordinal goes, is this module's.
 */

import type { GameDrawing } from "./game.ts";
import type { MarkKind, MarkRole } from "./hint-words.ts";
import { DOWN, RIGHT, type Side, type SquareEdges, sideOf } from "./square-edges.ts";
import type { Rect } from "./types.ts";

/** An edge of the board, by its `square-edges.ts` number, so one edge named
 * from the square on either side of it is one mark. */
export const EDGE: MarkKind<number> = { name: "edge", key: String };

/** The roles an edge is drawn in: the ring for what the step decides, the
 * outline for what it reasons from or a chain would force. */
export type EdgeRole = Extract<MarkRole, "ring" | "outline">;

/** One edge a step draws: the shape it asks for or would take, in which role,
 * and, on a chain, its place in it from 1. The edge is its number, or a side
 * of a square, which is how a side on the board's rim is named: it has no
 * square beyond it and no number. */
export interface EdgeHint {
  readonly edge: number | Side;
  readonly shape: "line" | "cross";
  readonly role: EdgeRole;
  readonly order?: number;
}

// A square's word: three bits a side, by direction, for what the side shows,
// then the ordinal of the edge on its right and of the edge below it, which
// the square draws as the edge's first square.
const SIDE_BITS = 3;
const RING_LINE = 1;
const RING_CROSS = 2;
const OUTLINE_LINE = 3;
const OUTLINE_CROSS = 4;
const ORDER_BITS = 5;
const K_ORDER = 4 * SIDE_BITS;
const MAX_ORDER = (1 << ORDER_BITS) - 1;

/** How many low bits of a square's word {@link edgeHintWords} uses; a game
 * that keeps the word beside bits of its own puts them above these. */
export const EDGE_HINT_BITS = K_ORDER + 2 * ORDER_BITS;

function sideMark({ shape, role }: EdgeHint): number {
  if (role === "ring") return shape === "line" ? RING_LINE : RING_CROSS;
  return shape === "line" ? OUTLINE_LINE : OUTLINE_CROSS;
}

/**
 * Each square's word for the edges a step draws, set on both squares of each
 * edge so each draws its half. An edge drawn in both roles is drawn as the
 * ring, which is what the step asks for.
 */
export function edgeHintWords(g: SquareEdges, hints: readonly EdgeHint[]): Int32Array {
  const out = new Int32Array(g.cells);
  // Each hint as the sides it is drawn on, the edge's first square's first.
  const sidesOf = ({ edge }: EdgeHint): Side[] => {
    const e = typeof edge === "number" ? edge : g.around[edge.cell * 4 + edge.dir];
    if (e < 0 && typeof edge !== "number") return [edge];
    return [g.a[e], g.b[e]].map((cell) => ({ cell, dir: sideOf(g, e, cell) }));
  };
  const key = ({ cell, dir }: Side): number => cell * 4 + dir;
  const ringed = new Set<number>();
  for (const h of hints) if (h.role === "ring") ringed.add(key(sidesOf(h)[0]));
  for (const h of hints) {
    const sides = sidesOf(h);
    if (h.role === "ring" || !ringed.has(key(sides[0])))
      for (const { cell, dir } of sides) {
        const shift = dir * SIDE_BITS;
        out[cell] = (out[cell] & ~(7 << shift)) | (sideMark(h) << shift);
      }
    const order = h.order ?? 0;
    if (order === 0) continue;
    const [{ cell, dir }] = sides;
    if (order < 0 || order > MAX_ORDER || (dir !== RIGHT && dir !== DOWN))
      throw new Error(`edge hint: no room for ordinal ${order} on side ${dir}`);
    out[cell] |= order << (K_ORDER + (dir === RIGHT ? 0 : ORDER_BITS));
  }
  return out;
}

/** How a game draws a line and a cross on sides of one square. `sides` is a
 * direction mask (`1 << d`); the line runs from the square's middle to each
 * side, and the cross sits on the side. */
export interface EdgeShapes {
  line(sides: number, ink: number, role: EdgeRole): void;
  cross(sides: number, ink: number, role: EdgeRole): void;
}

/** The game's palette slots for each role's ink. */
export interface EdgeInks {
  readonly ring: number;
  readonly outline: number;
}

function sidesWith(word: number, ...marks: number[]): number {
  let sides = 0;
  for (let d = 0; d < 4; d++)
    if (marks.includes((word >> (d * SIDE_BITS)) & 7)) sides |= 1 << d;
  return sides;
}

/** The sides of a square whose word draws the shape there, in either role:
 * where a game leaves out what it would draw on a side the hint takes. */
export function hintedSides(word: number, shape: EdgeHint["shape"]): number {
  return shape === "line"
    ? sidesWith(word, RING_LINE, OUTLINE_LINE)
    : sidesWith(word, RING_CROSS, OUTLINE_CROSS);
}

/**
 * Draw one square's half of the edges in its word, the outline's under the
 * ring's. Draw it under what the square holds: an edge a step asks for is
 * one the player has not decided, so nothing of theirs is on it.
 */
export function drawEdgeHints(word: number, inks: EdgeInks, shapes: EdgeShapes): void {
  const draw = (mark: number, ink: number, role: EdgeRole, cross: boolean): void => {
    const sides = sidesWith(word, mark);
    if (sides === 0) return;
    if (cross) shapes.cross(sides, ink, role);
    else shapes.line(sides, ink, role);
  };
  draw(OUTLINE_CROSS, inks.outline, "outline", true);
  draw(OUTLINE_LINE, inks.outline, "outline", false);
  draw(RING_CROSS, inks.ring, "ring", true);
  draw(RING_LINE, inks.ring, "ring", false);
}

/**
 * Draw the ordinals of the chain edges on the right of and below the square
 * whose tile is `box`, in the outline's ink: in the corner beside the edge,
 * the top-right for its right side and the bottom-left for its lower one, and
 * inset past an outline `band` wide. No line reaches a corner and the two
 * corners are apart, so no number is cut by a side or covered; the
 * bottom-right, `hint-ordinal.ts`'s corner for a cell, is where both edges
 * meet. Draw it over what the square holds.
 */
export function drawEdgeOrdinals(
  dr: GameDrawing,
  word: number,
  box: Rect,
  band: number,
  ink: number,
): void {
  const size = Math.max(9, Math.floor(box.w * 0.28));
  const inset = band + 1 + Math.floor(size / 2);
  for (const d of [RIGHT, DOWN]) {
    const order = (word >> (K_ORDER + (d === RIGHT ? 0 : ORDER_BITS))) & MAX_ORDER;
    if (order === 0) continue;
    dr.drawText(
      d === RIGHT
        ? { x: box.x + box.w - inset, y: box.y + inset }
        : { x: box.x + inset, y: box.y + box.h - inset },
      { align: "center", baseline: "mathematical", fontType: "variable", size },
      ink,
      String(order),
    );
  }
}
