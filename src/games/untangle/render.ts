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
export const COL_HINT = 10;
export const COL_FLASH_LEAD = 11;

/** Radius (px) of the ring round a crossing a hint step removes — just wider
 * than a point, so a ring is never mistaken for one. */
const CROSSING_RING = CIRCLE_RADIUS + 3;

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
        dr.drawText(
          { x: ds.x[i], y: ds.y[i] },
          glyphFont(Math.trunc((DRAG_THRESHOLD * 3) / 2)),
          c,
          String(i),
        );
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

  // Hint: a line from the hinted vertex to its suggested destination, and
  // a marker at the destination. The source is the vertex's *current*
  // drawn position (ds.x/y), so during an auto-hint slide the line shrinks
  // to nothing as the vertex arrives.
  // Ring each crossing the move removes, so the count the hint states is
  // one the player can see. Unfilled, so the crossing stays visible inside.
  for (const c of marks.of("outline", CROSSING)) {
    const center = { x: Math.trunc(c.x * ts), y: Math.trunc(c.y * ts) };
    dr.drawCircle(center, CROSSING_RING, -1, COL_HINT);
    dr.drawCircle(center, CROSSING_RING + 1, -1, COL_HINT);
  }
  // On a journey, ring the marked points still to move after this one, so
  // the count in the narration is one the player can see.
  for (const v of ringed) {
    if (v === moved) continue;
    const center = { x: ds.x[v], y: ds.y[v] };
    dr.drawCircle(center, CROSSING_RING, -1, COL_HINT);
    dr.drawCircle(center, CROSSING_RING + 1, -1, COL_HINT);
  }
  if (hintVertex >= 0 && spot) {
    dr.drawLine(
      { x: ds.x[hintVertex], y: ds.y[hintVertex] },
      { x: hintTx, y: hintTy },
      COL_HINT,
      2,
    );
  }
  if (spot) {
    dr.drawCircle({ x: hintTx, y: hintTy }, CIRCLE_RADIUS, COL_HINT, COL_OUTLINE);
  }
  if (hintVertex >= 0) {
    // The point the step moves wears the hint color too, so "this point" in
    // the narration names one of the two ends of the line.
    dr.drawCircle(
      { x: ds.x[hintVertex], y: ds.y[hintVertex] },
      CIRCLE_RADIUS,
      COL_HINT,
      COL_OUTLINE,
    );
  }

  dr.drawUpdate({ x: 0, y: 0, w: size, h: size });
}
