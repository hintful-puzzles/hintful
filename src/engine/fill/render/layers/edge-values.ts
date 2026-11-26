/**
 * An answer on the edges (`answer.value.sort: edge`): each edge's value is
 * drawn by its edge painter (`pieces/edge-value.ts`), each of the edge's two
 * squares its half in its own clip, red where a rule breaks at the edge or
 * Check & Save found it wrong; and the half-grid cursor where it rests on an
 * edge or a corner.
 */

import { COL_CURSOR, COL_ERROR } from "../../../color/roles.ts";
import type { GridCursor } from "../../../input/pointer.ts";
import { drawRectCorners } from "../../../render/draw.ts";
import type { FillMistake } from "../../answer.ts";
import { type Clues, type FillBoard, spaceOf } from "../../board.ts";
import type { FillPalette } from "../palette.ts";
import type { FillSetup } from "../setup.ts";
import {
  CORNER_CURSOR_SHIFT,
  DIRS,
  dirTo,
  EDGE_CURSOR_SHIFT,
  EDGE_ERR_SHIFT,
  EDGE_MISTAKE_SHIFT,
  EDGE_VALUE_BITS,
} from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

const VALUE_MASK = (1 << EDGE_VALUE_BITS) - 1;

/** Each cell's edge word on `shown`, with `errors` the edges a rule breaks
 * at and `mistakes` those Check & Save found wrong; all 0 on an answer on
 * the cells. */
export function edgeWordsOf<C extends Clues<C>>(
  cx: FillSetup<C>,
  shown: FillBoard<C>,
  errors: Uint8Array,
  mistakes: readonly FillMistake[],
): Int32Array {
  const { w, h } = shown;
  const out = new Int32Array(w * h);
  if (!cx.onEdges) return out;
  const sp = spaceOf(cx.module, shown);
  const wrong = new Set<number>();
  for (const m of mistakes) if (m.kind === "value") wrong.add(m.cell);
  for (const e of sp.edges) {
    const v = shown.values[e];
    if (v > VALUE_MASK) throw new Error(`edge ${e}: value ${v} has no room in a side`);
    const ends = [sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]] as const;
    const flags =
      (errors[e] === 1 && v !== 0 ? 1 << EDGE_ERR_SHIFT : 0) |
      (wrong.has(e) ? 1 << EDGE_MISTAKE_SHIFT : 0);
    for (const [a, b] of [ends, [ends[1], ends[0]] as const]) {
      const d = dirTo(w, a, b);
      if (d < 0) throw new Error(`edge ${e}: cells ${a} and ${b} are not side by side`);
      out[a] |= (v << (EDGE_VALUE_BITS * d)) | (flags << d);
    }
  }
  return out;
}

/** The bits of square `(x, y)`'s edge word for the half-grid `cursor`: the
 * side or the corner of the square it rests on. Its middle is the tile
 * word's `CURSOR`. */
export function edgeCursorBits(cursor: GridCursor, x: number, y: number): number {
  const u = cursor.x - 2 * x;
  const v = cursor.y - 2 * y;
  if (!cursor.visible || u < 0 || u > 2 || v < 0 || v > 2 || (u === 1 && v === 1))
    return 0;
  if (u % 2 !== v % 2) {
    const d = v === 0 ? 0 : u === 2 ? 1 : v === 2 ? 2 : 3;
    return 1 << (EDGE_CURSOR_SHIFT + d);
  }
  const k = v === 0 ? u / 2 : 3 - u / 2;
  return 1 << (CORNER_CURSOR_SHIFT + k);
}

/** The tile's part of the cursor on one of its sides or corners: corner
 * brackets round the point, as a square's cursor is drawn, each tile the
 * point touches drawing what lies in its clip. */
export function paintEdgeCursor(f: TileFrame): void {
  const { tile, ts, edgeWord } = f;
  const thick = Math.max(2, ts >> 4);
  for (let d = 0; d < 4; d++)
    if (edgeWord & (1 << (EDGE_CURSOR_SHIFT + d))) {
      const [dx, dy] = DIRS[d];
      const half = Math.floor(ts / 2);
      const x = tile.x + half + dx * half;
      const y = tile.y + half + dy * half;
      drawRectCorners(f.dr, x, y, Math.floor(ts / 4), COL_CURSOR, thick);
    }
  for (let k = 0; k < 4; k++)
    if (edgeWord & (1 << (CORNER_CURSOR_SHIFT + k))) {
      const x = tile.x + (k === 1 || k === 2 ? ts : 0);
      const y = tile.y + (k >= 2 ? ts : 0);
      drawRectCorners(f.dr, x, y, Math.floor(ts / 6), COL_CURSOR, thick);
    }
}

/** The tile's half of the value on each of its sides. */
export function paintEdgeValues(pal: FillPalette, f: TileFrame): void {
  for (let d = 0; d < 4; d++) {
    const v = (f.edgeWord >> (EDGE_VALUE_BITS * d)) & VALUE_MASK;
    const placed = v === 0 ? undefined : pal.edgeByValue.get(v);
    if (placed === undefined) continue;
    const bad =
      f.edgeWord & ((1 << (EDGE_ERR_SHIFT + d)) | (1 << (EDGE_MISTAKE_SHIFT + d)));
    placed.painter.paint(f.dr, f.tile, d, bad !== 0 ? COL_ERROR : placed.slot[0]);
  }
}
