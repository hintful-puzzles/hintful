/**
 * What a carry holds (`carry.ts`), drawn under the pointer: a disc in its
 * value's surface with the value's piece on it, or where it holds no value
 * its notes dotted over it, upstream map.c's drag blob. It crosses squares as
 * it moves, so the pixels under it are saved before it is drawn and put back
 * before the next frame draws anything (`docs/rendering.md` § "A cursor is
 * usually a cache key, not a blitter").
 */

import type { GameDrawing } from "../../contract/game.ts";
import type { Point, Rect } from "../../contract/types.ts";
import { glyphFont } from "../../render/draw.ts";
import type { Carried } from "../play.ts";
import { COL_CELL, COL_INK, type FillPalette } from "./palette.ts";

/** The draw state's sprite: its saved pixels, and where they were saved
 * from, `null` while nothing is drawn. */
export interface CarriedSprite {
  bl: unknown;
  at: Point | null;
}

export const newCarriedSprite = (): CarriedSprite => ({ bl: null, at: null });

/** How a board draws what a carry holds. */
export interface CarriedLook {
  /** The fill of a disc holding value `v`, 0 for none. */
  surface(v: number): number;
  /** Value `v`'s piece, in `box`. */
  piece(dr: GameDrawing, box: Rect, v: number): void;
  /** Value `v`'s note, in `box`. */
  note(dr: GameDrawing, box: Rect, v: number): void;
}

/** How a board of palette `pal` draws what a carry holds: a value by its
 * painter where it has one, else its glyph by `glyph`, as its cells do. */
export function carriedLook(
  pal: Pick<FillPalette, "byValue" | "COL_ENTRY" | "COL_PENCIL">,
  glyph: (v: number) => string,
): CarriedLook {
  const { byValue, COL_ENTRY, COL_PENCIL } = pal;
  const text = (dr: GameDrawing, box: Rect, color: number, v: number) =>
    dr.drawText(
      { x: box.x + box.w / 2, y: box.y + box.h / 2 },
      glyphFont(Math.floor((box.h * 7) / 10)),
      color,
      glyph(v),
    );
  return {
    surface: (v) => {
      const placed = byValue.get(v);
      if (placed === undefined || placed.painter.surface === null) return COL_CELL;
      return placed.slot[placed.painter.surface];
    },
    piece: (dr, box, v) => {
      const placed = byValue.get(v);
      if (placed === undefined) text(dr, box, COL_ENTRY, v);
      else placed.painter.paint(dr, box, placed.slot, false);
    },
    note: (dr, box, v) => {
      const placed = byValue.get(v);
      if (placed === undefined) text(dr, box, COL_PENCIL, v);
      else if (placed.painter.note !== undefined)
        placed.painter.note(dr, box, placed.slot);
      else placed.painter.paint(dr, box, placed.slot, false);
    },
  };
}

/** The sprite's side at tile size `ts`: the disc and its outline. */
const sideOf = (ts: number): number => ts + 3;

/** Put back what the sprite covered. */
export function eraseCarried(dr: GameDrawing, sprite: CarriedSprite, ts: number): void {
  if (sprite.at === null || sprite.bl === null) return;
  const side = sideOf(ts);
  dr.blitterLoad(sprite.bl, sprite.at);
  dr.drawUpdate({ ...sprite.at, w: side, h: side });
  sprite.at = null;
}

/** The middle of each note of `notes` on a disc at `(x, y)`, and the dots'
 * radius: up to four values in upstream map.c's formation, a value a row
 * stepping right; more in a grid over the disc's inscribed square. */
function noteDots(
  notes: number,
  x: number,
  y: number,
  ts: number,
): { v: number; at: Point; r: number }[] {
  const values: number[] = [];
  for (let v = 1; v < 32; v++) if (notes & (1 << v)) values.push(v);
  const top = values.at(-1) ?? 0;
  if (top <= 4)
    return values.map((v) => ({
      v,
      at: {
        x: x + Math.trunc((((((v - 1) * 4 + 2) % 10) - 3) * ts) / 10),
        y: y + Math.trunc((((v - 1) * 2 - 3) * ts) / 10),
      },
      r: Math.floor(ts / 8),
    }));
  const k = Math.ceil(Math.sqrt(top));
  const side = Math.floor((ts * 7) / 10);
  const pitch = side / k;
  return values.map((v) => ({
    v,
    at: {
      x: Math.round(x - side / 2 + (((v - 1) % k) + 0.5) * pitch),
      y: Math.round(y - side / 2 + (Math.floor((v - 1) / k) + 0.5) * pitch),
    },
    r: Math.max(1, Math.floor(pitch * 0.4)),
  }));
}

/** Draw what `carried` holds under the pointer, saving what it covers. */
export function drawCarried(
  dr: GameDrawing,
  sprite: CarriedSprite,
  ts: number,
  carried: Carried | null,
  look: CarriedLook,
): void {
  if (carried === null) return;
  const side = sideOf(ts);
  const half = Math.floor(ts / 2);
  const { x, y } = carried.at;
  sprite.bl ??= dr.blitterNew({ w: side, h: side });
  sprite.at = { x: x - half - 2, y: y - half - 2 };
  dr.blitterSave(sprite.bl, sprite.at);
  dr.drawCircle({ x, y }, half, look.surface(carried.value), COL_INK);
  if (carried.value > 0) {
    // The piece in three quarters of the disc, as a cell's in its tile.
    const inner = Math.floor((ts * 3) / 4);
    look.piece(
      dr,
      {
        x: x - Math.floor(inner / 2),
        y: y - Math.floor(inner / 2),
        w: inner,
        h: inner,
      },
      carried.value,
    );
  }
  for (const { v, at, r } of noteDots(carried.notes, x, y, ts))
    look.note(dr, { x: at.x - r, y: at.y - r, w: 2 * r, h: 2 * r }, v);
  dr.drawUpdate({ ...sprite.at, w: side, h: side });
}
