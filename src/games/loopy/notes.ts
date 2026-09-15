/**
 * Loopy's notes: where a corner is, and how a press cycles a note, shared by the
 * pointer, the keyboard and the renderer so the three cannot disagree about which
 * corner is meant.
 *
 * A **corner note** belongs to a dline (`dlines.ts`): two edges adjacent around a
 * dot, which is one angle of a face or of the outside of the board. Which of the
 * two angles between those edges is meant is read off that face, not off the
 * direction a dot's edges run in, because that direction is not the same on every
 * tiling (floret and both Penrose tilings run the other way), and a hat or a
 * spectre has corners wider than a half turn. `loopy-notes.test.ts` checks every
 * corner of every tiling against the face it belongs to.
 */

import type { Grid, GridDot, GridFace } from "../../engine/grid/index.ts";
import { LEFT_BUTTON, MIDDLE_BUTTON, RIGHT_BUTTON } from "../../engine/pointer.ts";
import type { LoopyCursor } from "./cursor.ts";
import { dlineEnds, dlineIndexFromDot, dlineIndexFromFace } from "./dlines.ts";
import type { PairRelation } from "./index.ts";

const TAU = 2 * Math.PI;

/** An angle folded into `[0, 2π)`. */
const turn = (a: number): number => ((a % TAU) + TAU) % TAU;

/** The direction of an edge away from one of its dots. */
function edgeAngle(dot: GridDot, edge: number): number {
  const e = dot.edges.find((x) => x.index === edge);
  if (!e) throw new Error(`loopy notes: edge ${edge} does not meet dot ${dot.index}`);
  const far = e.dot1 === dot ? e.dot2 : e.dot1;
  return Math.atan2(far.y - dot.y, far.x - dot.x);
}

/** Whether a grid point lies inside a face. */
function insideFace(f: GridFace, x: number, y: number): boolean {
  let inside = false;
  const n = f.dots.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = f.dots[i];
    const b = f.dots[j];
    if (a === null || b === null) continue;
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x)
      inside = !inside;
  }
  return inside;
}

/** Each dline's face, or `null` for a corner of the outside of the board. */
const facesOf = new WeakMap<Grid, (GridFace | null)[]>();

function faceOfCorner(g: Grid, dline: number): GridFace | null {
  let faces = facesOf.get(g);
  if (!faces) {
    const table: (GridFace | null)[] = new Array(2 * g.numEdges).fill(null);
    for (const f of g.faces) {
      for (let i = 0; i < f.order; i++) table[dlineIndexFromFace(f, i)] = f;
    }
    facesOf.set(g, table);
    faces = table;
  }
  return faces[dline];
}

/**
 * A corner's angle: its dot, the direction of its first edge, and the signed turn
 * to its second, positive the way `Math.atan2` increases.
 *
 * Of the two ways round, the one taken is the one a point just off the dot along
 * its middle lies in the corner's face (or in no face at the dot, for the outside).
 */
export function cornerArc(
  g: Grid,
  dline: number,
): { dot: GridDot; from: number; sweep: number } {
  const { dot, first, second } = dlineEnds(g, dline);
  const from = edgeAngle(dot, first);
  const up = turn(edgeAngle(dot, second) - from);
  const face = faceOfCorner(g, dline);
  const r = 1e-3 * g.tileSize;
  const mid = from + up / 2;
  const x = dot.x + r * Math.cos(mid);
  const y = dot.y + r * Math.sin(mid);
  const inCorner =
    face !== null
      ? insideFace(face, x, y)
      : !dot.faces.some((f) => f !== null && insideFace(f, x, y));
  return { dot, from, sweep: inCorner ? up : up - TAU };
}

/** Whether a direction from a corner's dot lies within its angle. */
function within(arc: { from: number; sweep: number }, theta: number): boolean {
  return arc.sweep >= 0
    ? turn(theta - arc.from) < arc.sweep
    : turn(arc.from - theta) < -arc.sweep;
}

/**
 * The corner a point in grid coordinates falls in: the angle, around the dot
 * nearest it, between the two adjacent edges either side of it. `null` well off
 * the board, where no dot is within two tiles.
 *
 * Found around the nearest dot rather than inside a face, so it works the same at
 * the edge of the board, where the corner belongs to no face.
 */
export function cornerAt(g: Grid, x: number, y: number): number | null {
  let best: GridDot | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const d of g.dots) {
    const distance = (d.x - x) ** 2 + (d.y - y) ** 2;
    if (distance < bestDistance) {
      best = d;
      bestDistance = distance;
    }
  }
  if (best === null || best.order < 2 || bestDistance > (2 * g.tileSize) ** 2)
    return null;
  const theta = Math.atan2(y - best.y, x - best.x);
  let nearest: number | null = null;
  for (let j = 0; j < best.order; j++) {
    const dline = dlineIndexFromDot(best, j);
    if (within(cornerArc(g, dline), theta)) return dline;
    nearest ??= dline;
  }
  // Only rounding at an edge's own direction lands here.
  return nearest;
}

/** The corner Enter notes: at the cursor's dot, following its chosen edge round
 * the dot. `null` until an edge is chosen. */
export function cursorCorner(g: Grid, cursor: LoopyCursor): number | null {
  if (cursor.edge < 0) return null;
  const dot = g.dots[cursor.dot];
  const j = dot.edges.findIndex((e) => e.index === cursor.edge);
  return j < 0 || dot.order < 2 ? null : dlineIndexFromDot(dot, j);
}

/** A corner note's next state: the left button cycles none, at least one line, at
 * most one, exactly one; the right button the other way; the middle clears. */
export function nextCornerNote(bits: number, button: number): number | null {
  switch (button) {
    case LEFT_BUTTON:
      return (bits + 1) % 4;
    case RIGHT_BUTTON:
      return (bits + 3) % 4;
    case MIDDLE_BUTTON:
      return 0;
    default:
      return null;
  }
}

const RELATIONS: readonly PairRelation[] = ["none", "match", "opposite"];

/** A pair note's next state: the left button cycles none, match, opposites; the
 * right button the other way; the middle clears. */
export function nextPairNote(
  relation: PairRelation,
  button: number,
): PairRelation | null {
  const i = RELATIONS.indexOf(relation);
  switch (button) {
    case LEFT_BUTTON:
      return RELATIONS[(i + 1) % 3];
    case RIGHT_BUTTON:
      return RELATIONS[(i + 2) % 3];
    case MIDDLE_BUTTON:
      return "none";
    default:
      return null;
  }
}
