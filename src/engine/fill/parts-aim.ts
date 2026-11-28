/**
 * Where the player aims on a board of parts (`parts.ts`): a press on a
 * square addresses the part of the triangle it lands in, which the board
 * stores at `(part, 0)`, so the note-taking cell, the typing and a hint's
 * gesture read a part as any board reads a cell. The cursor walks the
 * squares, and selects the part of the triangle on the side it last moved
 * toward, which is how a square split between two parts names one.
 * Upstream map.c's `region_from_coords` and `region_from_ui_cursor`.
 */

import { fromCoord } from "../board/geometry.ts";
import type { Point } from "../contract/types.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  isCursorMove,
  moveCursor,
  newCursor,
} from "../input/pointer.ts";
import type { TargetGeometry } from "../input/target-verb.ts";
import type { FillBoard } from "./board.ts";
import type { FillUi } from "./play.ts";
import {
  BOTTOM,
  LEFT,
  type PartsGeometry,
  partAt,
  RIGHT,
  TOP,
} from "./render/parts-geometry.ts";

/** The aim of a board whose cells are parts: a {@link TargetGeometry} over
 * the stored cells, and where a press lands, which puts the cursor's square
 * under the pointer. */
export interface PartsAim<C, D> extends TargetGeometry<FillBoard<C>, FillUi, D, Point> {
  pressed(b: FillBoard<C>, ds: D, p: Point, ui: FillUi): void;
}

/** The triangle each arrow moves the cursor toward. */
const TOWARD: ReadonlyMap<number, number> = new Map([
  [CURSOR_UP, TOP],
  [CURSOR_DOWN, BOTTOM],
  [CURSOR_LEFT, LEFT],
  [CURSOR_RIGHT, RIGHT],
]);

/** The triangle a point `(dx, dy)` from a square's middle falls in, the
 * diagonals going to the top and bottom as upstream's do. */
function triangleAt(dx: number, dy: number): number {
  if (dx > dy) return -dx > dy ? TOP : RIGHT;
  return -dx > dy ? LEFT : BOTTOM;
}

export function partsAim<C, D extends { readonly tileSize: number }>(
  geometryOf: (b: FillBoard<C>) => PartsGeometry,
  origin: (tileSize: number, b: FillBoard<C>) => number,
): PartsAim<C, D> {
  /** The square and triangle a press at `p` on board `b` lands in, or
   * `null` off the board. */
  const landing = (
    b: FillBoard<C>,
    ts: number,
    p: Point,
  ): { x: number; y: number; toward: number } | null => {
    const g = geometryOf(b);
    const o = origin(ts, b);
    const x = fromCoord(p.x, ts, o);
    const y = fromCoord(p.y, ts, o);
    if (x < 0 || y < 0 || x >= g.w || y >= g.h) return null;
    const half = Math.floor(ts / 2);
    return {
      x,
      y,
      toward: triangleAt(p.x - o - x * ts - half, p.y - o - y * ts - half),
    };
  };
  /** The cursor's square, where it names the selected part; else a square
   * of that part, its label's, whose triangle toward the top is the part's
   * where it can be. */
  const squareOf = (g: PartsGeometry, ui: FillUi) => {
    const part = ui.cursor.x;
    const sq = ui.square;
    if (sq !== undefined && partAt(g, sq.toward, sq.y * g.w + sq.x) === part) return sq;
    const label = g.labels[part];
    const x = Math.min(g.w - 1, Math.floor(label.x / 2));
    const y = Math.min(g.h - 1, Math.floor(label.y / 2));
    const s = y * g.w + x;
    const toward = [TOP, BOTTOM, LEFT, RIGHT].find((t) => partAt(g, t, s) === part);
    return { x, y, toward: toward ?? TOP };
  };
  const aim: PartsAim<C, D> = {
    noun: "part",
    pointerTarget(b, ds, p) {
      const g = geometryOf(b);
      const at = landing(b, ds.tileSize, p);
      return at === null ? null : { x: partAt(g, at.toward, at.y * g.w + at.x), y: 0 };
    },
    /** A whole square's middle where the part has one, else the middle of
     * one of its triangles: a point the press itself reads as the part. */
    pointAt(b, ds, t, ui) {
      const g = geometryOf(b);
      const ts = ds.tileSize;
      const o = origin(ts, b);
      const half = Math.floor(ts / 2);
      const d = Math.floor(ts / 4);
      const probes = [
        [0, d],
        [-d, 0],
        [d, 0],
        [0, -d],
      ] as const;
      const on = (p: Point) => aim.pointerTarget(b, ds, p, ui)?.x === t.x;
      const middles = Array.from({ length: g.w * g.h }, (_, s) => ({
        x: o + (s % g.w) * ts + half,
        y: o + Math.floor(s / g.w) * ts + half,
      }));
      const whole = middles.find(
        (m) => on(m) && probes.every(([dx, dy]) => on({ x: m.x + dx, y: m.y + dy })),
      );
      if (whole !== undefined) return whole;
      for (const [dx, dy] of probes)
        for (const m of middles) {
          const p = { x: m.x + dx, y: m.y + dy };
          if (on(p)) return p;
        }
      throw new Error(`parts: part ${t.x} has no square`);
    },
    cursorTarget(b, ui) {
      return ui.cursor.x < geometryOf(b).n ? { x: ui.cursor.x, y: 0 } : null;
    },
    parkCursor(ui, t) {
      ui.cursor.x = t.x;
      ui.cursor.y = 0;
    },
    /** An arrow moves the cursor's square, shown where it was hidden, and
     * turns it toward the arrow's side even where it cannot move, so an
     * arrow at the edge selects the other part of a split square. */
    moveCursor(b, ui, button) {
      if (!isCursorMove(button)) return false;
      const g = geometryOf(b);
      const from = squareOf(g, ui);
      const walked = newCursor(from.x, from.y, ui.cursor.visible);
      const moved = moveCursor(walked, button, g.w, g.h);
      const toward = TOWARD.get(button) ?? from.toward;
      const part = partAt(g, toward, walked.y * g.w + walked.x);
      ui.square = { x: walked.x, y: walked.y, toward };
      const changed = moved || part !== ui.cursor.x;
      ui.cursor.x = part;
      ui.cursor.y = 0;
      ui.cursor.visible = true;
      return changed;
    },
    pressed(b, ds, p, ui) {
      const at = landing(b, ds.tileSize, p);
      if (at !== null) ui.square = at;
    },
  };
  return aim;
}
