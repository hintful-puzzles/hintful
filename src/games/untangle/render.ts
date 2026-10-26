/**
 * Untangle rendering — idiomatic port of `game_redraw` (untangle.c:1799).
 *
 * There is no sensible partial redraw for this game (any vertex move can
 * change which edges cross), so it is a **full-frame** repaint with a
 * single early-out: recompute every vertex's pixel position, and if nothing
 * the frame depends on has changed, skip drawing entirely (the cheap guard
 * against repainting a frame that is already on the canvas). No per-tile
 * cache.
 *
 * The win flash runs over the points in the order a diagonal sweep meets them
 * where they are drawn: a lit point is the highlight's color, ring and all,
 * and a line is drawn in it while the first of its ends is lit.
 */

import { drawRectOutline, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import { textBox } from "../../engine/ring.ts";
import type { DrawTextOptions, Point, Rect } from "../../engine/types.ts";
import {
  type Flash,
  sweepRanks,
  WIN_NONE,
  type WinTone,
  winSlot,
} from "../../engine/win-wave.ts";
import { CROSSING, SPOT, VERTEX } from "./hint-text.ts";
import {
  CIRCLE_RADIUS,
  DRAG_THRESHOLD,
  PLAY_BORDER_INSET,
  packEdge,
  type RationalPoint,
  type UntangleDrawState,
  type UntangleMove,
  type UntangleState,
  type UntangleUi,
} from "./state.ts";

// Palette indices (must match `untangleGame.colors`). Exported so the
// render tests can assert on the exact color an op carries.
export const COL_BACKGROUND = 1;
export const COL_LINE = 2;
export const COL_CROSSEDLINE = 3;
export const COL_OUTLINE = 4;
export const COL_POINT = 5;
export const COL_DRAGPOINT = 6;
export const COL_CURSORPOINT = 7;
export const COL_NEIGHBOR = 8;
export const COL_FLASH = 9;
export const COL_FLASH_LEAD = 10;
/** The ring round a crossing a hint step removes. */
export const COL_HINT_CELL = 11;

/** Radius (px) of the ring round a crossing a hint step removes — just wider
 * than a point, so a ring is never mistaken for one. */
const CROSSING_RING = CIRCLE_RADIUS + 3;
/** The hint's ring round a point or a spot: as wide as a crossing's, and
 * stroked as thick. */
const RING_HALF = CROSSING_RING + 2;
/** The ring round the point a step moves and round its spot: wider, so the
 * end of the move's line each holds reads as pointing at the other, and the
 * moved point stands apart from the others still to move. */
const MOVE_RING_HALF = CROSSING_RING + 7;
const RING_THICKNESS = 2;
/** The disc in the spot's ring: smaller than a point, so the ring reads round
 * it. */
const SPOT_RADIUS = CIRCLE_RADIUS - 2;

/** Where a point's index number is drawn, which the point and a ring round
 * it both read. */
function numberText(at: Point): { origin: Point; options: DrawTextOptions } {
  return { origin: at, options: glyphFont(Math.trunc((DRAG_THRESHOLD * 3) / 2)) };
}

/** Linear interpolation between two rational points (upstream `mix`),
 * keeping exact integer rational arithmetic. `t` runs 0→1. */
function mix(a: RationalPoint, b: RationalPoint, t: number): RationalPoint {
  return {
    d: a.d * b.d,
    x: Math.trunc(a.x * b.d + t * (b.x * a.d - a.x * b.d)),
    y: Math.trunc(a.y * b.d + t * (b.y * a.d - a.y * b.d)),
  };
}

export function redrawUntangle(
  dr: GameDrawing,
  ds: UntangleDrawState,
  prev: UntangleState | null,
  s: UntangleState,
  ui: UntangleUi,
  animTime: number,
  flash: Flash,
  hint?: HintStep<UntangleMove>,
): void {
  const n = s.n;
  const ts = ds.tileSize;

  // Recompute every vertex's pixel position, noting whether any moved, and
  // whether the win flash reached or left one.
  let pointsMoved = false;
  let litChanged = false;
  const animLen = ui.animLength;
  for (let i = 0; i < n; i++) {
    let p = s.pts[i];
    if (ui.dragPoint === i) p = ui.newPoint;
    if (prev && animLen > 0) p = mix(prev.pts[i], p, animTime / animLen);
    const x = Math.trunc((p.x * ts) / p.d);
    const y = Math.trunc((p.y * ts) / p.d);
    if (ds.x[i] !== x || ds.y[i] !== y) pointsMoved = true;
    ds.x[i] = x;
    ds.y[i] = y;
  }
  // The points sit on no grid, so a point's position is its rank in the sweep.
  const rank = flash.winning
    ? sweepRanks(ds.x.map((x, i) => ({ x, y: ds.y[i] })))
    : new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    const lit = flash.winning ? flash.win(rank[i]) : WIN_NONE;
    if (ds.lit[i] !== lit) litChanged = true;
    ds.lit[i] = lit;
  }

  // The step's marks. The ringed point its move places is the one the line
  // runs from; any other ringed point is one still to move.
  const marks = stepMarks(hint);
  const ringed = marks.of("ring", VERTEX);
  const moved = hint?.move.points[0]?.i ?? -1;
  const [spot] = marks.of("ring", SPOT);

  // Hint marker pixels (or -1 when none is drawn). Folded into the
  // early-out so a manual hint, which moves no vertex, still repaints.
  const hintVertex = ringed.includes(moved) ? moved : -1;
  const hintTx = spot ? Math.trunc((spot.x * ts) / spot.d) : -1;
  const hintTy = spot ? Math.trunc((spot.y * ts) / spot.d) : -1;

  // Early-out: nothing visible changed.
  if (
    ds.started &&
    !litChanged &&
    ds.dragPoint === ui.dragPoint &&
    ds.cursorPoint === ui.cursorPoint &&
    ds.hintVertex === hintVertex &&
    ds.hintTx === hintTx &&
    ds.hintTy === hintTy &&
    !pointsMoved
  ) {
    return;
  }
  ds.dragPoint = ui.dragPoint;
  ds.cursorPoint = ui.cursorPoint;
  ds.hintVertex = hintVertex;
  ds.hintTx = hintTx;
  ds.hintTy = hintTy;
  ds.started = true;

  // Full-frame: fill the background every repaint.
  const size = s.w * ts;
  dr.drawRect({ x: 0, y: 0, w: size, h: size }, COL_BACKGROUND);

  // Frame the playable area so the drop zone is unambiguous (the gray
  // beyond it — e.g. layout padding — is dead space). Drags clamp a
  // vertex blob to just inside this border (`PLAY_MARGIN`).
  drawRectOutline(
    dr,
    PLAY_BORDER_INSET,
    PLAY_BORDER_INSET,
    size - 2 * PLAY_BORDER_INSET,
    size - 2 * PLAY_BORDER_INSET,
    COL_OUTLINE,
  );

  const flashColor = (tone: WinTone): number | null =>
    tone ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD) : null;

  // Edges. Show crossed edges red when the preference is on; during an
  // animation the crossings reflect the from-state, matching upstream.
  const crossSource = prev ?? s;
  for (let i = 0; i < s.edges.length; i++) {
    const e = s.edges[i];
    // The end the highlight reaches first is the one the line lights with.
    const first = rank[e.a] <= rank[e.b] ? e.a : e.b;
    const lit = flashColor(ds.lit[first]);
    const color =
      lit ??
      (ui.showCrossedEdges && crossSource.crosses[i] ? COL_CROSSEDLINE : COL_LINE);
    // A lit line is wider: one pixel of a flash color is lost on the board.
    dr.drawLine(
      { x: ds.x[e.a], y: ds.y[e.a] },
      { x: ds.x[e.b], y: ds.y[e.b] },
      color,
      lit === null ? 1 : 3,
    );
  }

  // Vertices, in a fixed z-order so the drag/cursor point sits on top.
  const drawOrder = [COL_POINT, COL_NEIGHBOR, COL_CURSORPOINT, COL_DRAGPOINT];
  for (const thisColor of drawOrder) {
    for (let i = 0; i < n; i++) {
      let c: number;
      if (ui.dragPoint === i) c = COL_DRAGPOINT;
      else if (ui.cursorPoint === i) c = COL_CURSORPOINT;
      else if (ui.dragPoint >= 0 && s.edgeSet.has(packEdge(ui.dragPoint, i, n)))
        c = COL_NEIGHBOR;
      else c = COL_POINT;
      if (c !== thisColor) continue;

      if (ui.vertexNumbers) {
        // Blank the blob area, to the highlight's color under a lit point,
        // then draw the index number in `c`.
        const ground = flashColor(ds.lit[i]) ?? COL_BACKGROUND;
        dr.drawCircle({ x: ds.x[i], y: ds.y[i] }, DRAG_THRESHOLD, ground, ground);
        const { origin, options } = numberText({ x: ds.x[i], y: ds.y[i] });
        dr.drawText(origin, options, c, String(i));
      } else {
        // A lit point is the highlight's color to its edge. It rests in the
        // pair's yellow, which is the body's color, and with its ink ring kept
        // the body would pass over it unseen.
        const lit = flashColor(ds.lit[i]);
        dr.drawCircle(
          { x: ds.x[i], y: ds.y[i] },
          CIRCLE_RADIUS,
          lit ?? c,
          lit ?? COL_OUTLINE,
        );
      }
    }
  }

  // Ring each crossing the move removes, so the count the hint states is
  // one the player can see. Unfilled, so the crossing stays visible inside.
  for (const c of marks.of("outline", CROSSING)) {
    const center = { x: Math.trunc(c.x * ts), y: Math.trunc(c.y * ts) };
    dr.drawCircle(center, CROSSING_RING, -1, COL_HINT_CELL);
    dr.drawCircle(center, CROSSING_RING + 1, -1, COL_HINT_CELL);
  }
  // The step's rings: round every ringed point, the one it moves and, on a
  // journey, those still to move after it, so the count in the narration is
  // one the player can see; and round the spot the moved point goes to. A
  // ring may reach anywhere on the board, which every frame repaints whole.
  const board = { x: 0, y: 0, w: size, h: size };
  const ring = (
    at: Point,
    half: number,
    enclose: Rect[],
    inside?: (ink: number) => void,
  ): void =>
    dr.drawRing(
      { x: at.x - half, y: at.y - half, w: 2 * half, h: 2 * half },
      { enclose, avoid: [] },
      RING_THICKNESS,
      { room: board, inside },
    );
  // The move is the line from the point to its spot: each end's ring holds
  // its own end of it, from the edge of the point's blob or of the spot. The
  // ends come from the move, not from which of the two the words still mark,
  // so hiding one leaves the other's end of the line as it is: what hiding a
  // reference takes away is what the app reads as that reference's marks. The
  // point is where it is drawn now (ds.x/y), so during an auto-hint slide the
  // line shrinks to nothing as the point arrives.
  const dest = hint?.move.points[0];
  const from = moved >= 0 ? { x: ds.x[moved], y: ds.y[moved] } : null;
  const to = dest
    ? { x: Math.trunc((dest.x * ts) / dest.d), y: Math.trunc((dest.y * ts) / dest.d) }
    : null;
  const blob = ui.vertexNumbers ? DRAG_THRESHOLD : CIRCLE_RADIUS;
  const length = from && to ? Math.hypot(to.x - from.x, to.y - from.y) : 0;
  const leg = (ink: number): void => {
    if (!from || !to || length <= blob + SPOT_RADIUS) return;
    const ux = (to.x - from.x) / length;
    const uy = (to.y - from.y) / length;
    dr.drawLine(
      { x: from.x + ux * blob, y: from.y + uy * blob },
      { x: to.x - ux * SPOT_RADIUS, y: to.y - uy * SPOT_RADIUS },
      ink,
      2,
    );
  };
  for (const v of ringed) {
    const at = { x: ds.x[v], y: ds.y[v] };
    const { origin, options } = numberText(at);
    const own = ui.vertexNumbers ? [textBox(origin, options, String(v))] : [];
    if (v === hintVertex) ring(at, MOVE_RING_HALF, own, leg);
    else ring(at, RING_HALF, own);
  }
  // The spot is where the point lands: a disc in the ring's ink.
  if (spot && to)
    ring(to, MOVE_RING_HALF, [], (ink) => {
      leg(ink);
      dr.drawCircle(to, SPOT_RADIUS, ink, ink);
    });

  dr.drawUpdate({ x: 0, y: 0, w: size, h: size });
}
