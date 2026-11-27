/** What the first frame draws under every tile: the grid's frame, each
 * line's fixed label (`labels:`) before its start, and the values heading
 * the margin of clues one a value, where the board has them. */

import type { GameDrawing } from "../../contract/game.ts";
import { glyphFont } from "../../render/draw.ts";
import type { Clues, FillBoard } from "../board.ts";
import type { FillDrawState } from "../render.ts";
import { marginHeadings } from "../value-margin.ts";
import type { CellLayout } from "./cell-text.ts";
import { COL_GRID, COL_LABEL } from "./palette.ts";
import type { FillSetup } from "./setup.ts";

export function drawFrame<C extends Clues<C>>(
  cx: FillSetup<C>,
  lay: CellLayout,
  dr: GameDrawing,
  ds: FillDrawState,
  state: FillBoard<C>,
): void {
  const { coord, cellX } = lay;
  const { labelStart } = cx;
  const ts = ds.tileSize;
  const { w, h } = state;
  // A walled board's frame is a wall: each cell paints its own top and
  // left, so this is the bottom and right of the last row and column. A
  // hexagon's edge is each of its cells' own, and so is a gapped board's.
  if (cx.hexagon || cx.gapped) {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (lay.m.drawn(state, x, y))
          dr.drawRect(
            { x: cellX(x, y, h, ts), y: coord(y, ts), w: ts + 1, h: ts + 1 },
            COL_GRID,
          );
  } else
    dr.drawRect(
      { x: coord(0, ts), y: coord(0, ts), w: w * ts + 1, h: h * ts + 1 },
      ds.parts === null ? COL_GRID : cx.pal.COL_WALL,
    );
  // Each value heading its clues in the margin, as large as they are.
  if (cx.margined)
    for (const { x, y, v } of marginHeadings(cx.marginValues(state)))
      dr.drawText(
        { x: coord(x, ts) + Math.floor(ts / 2), y: coord(y, ts) + Math.floor(ts / 2) },
        glyphFont(Math.floor(ts / 2)),
        COL_LABEL,
        cx.glyph(v),
      );
  if (labelStart === undefined) return;
  const size = Math.floor((ts * 2) / 5);
  const font = {
    align: "center",
    baseline: "mathematical",
    fontType: "variable",
    size,
  } as const;
  const at = lay.start(ts) - Math.floor(ts / 2);
  for (let y = 0; y < h; y++)
    dr.drawText(
      { x: at, y: coord(y, ts) + Math.floor(ts / 2) },
      font,
      COL_LABEL,
      labelStart(y),
    );
  for (let x = 0; x < w; x++)
    dr.drawText(
      { x: coord(x, ts) + Math.floor(ts / 2), y: at },
      font,
      COL_LABEL,
      labelStart(x),
    );
}
