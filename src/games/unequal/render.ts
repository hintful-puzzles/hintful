/**
 * Unequal's clues as drawn — port of `draw_gts` from `unequal.c`: a
 * greater-than chevron in the gap between two cells, pointing toward the
 * smaller. The cells, the gaps and everything else on the board are the shared
 * edge-clue renderer's (`engine/edge-clue-latin/render.ts`).
 */

import {
  COL_BACKGROUND,
  COL_TEXT,
  clueColor,
  gap,
} from "../../engine/edge-clue-latin/render.ts";
import {
  F_ADJ_DOWN,
  F_ADJ_LEFT,
  F_ADJ_RIGHT,
  F_ADJ_UP,
  F_ERROR_DOWN,
  F_ERROR_LEFT,
  F_ERROR_RIGHT,
  F_ERROR_UP,
  F_SPENT_DOWN,
  F_SPENT_LEFT,
  F_SPENT_RIGHT,
  F_SPENT_UP,
} from "../../engine/edge-clue-latin/state.ts";
import type { GameDrawing } from "../../engine/game.ts";

/** A greater-than chevron (upstream `draw_gt`), a 6-point polygon. */
function drawGt(
  dr: GameDrawing,
  ox: number,
  oy: number,
  dx1: number,
  dy1: number,
  dx2: number,
  dy2: number,
  col: number,
): void {
  const xdx = dx1 + dx2 ? 0 : 1;
  const xdy = dx1 + dx2 ? 1 : 0;
  dr.drawPolygon(
    [
      { x: ox + xdx, y: oy + xdy },
      { x: ox + xdx + dx1, y: oy + xdy + dy1 },
      { x: ox + xdx + dx1 + dx2, y: oy + xdy + dy1 + dy2 },
      { x: ox - xdx + dx1 + dx2, y: oy - xdy + dy1 + dy2 },
      { x: ox - xdx + dx1, y: oy - xdy + dy1 },
      { x: ox - xdx, y: oy - xdy },
    ],
    col,
    col,
  );
}

/** Draw the greater-than signs emanating from a cell: a sign is flagged, and
 * drawn, at its greater end. */
export function drawSigns(
  dr: GameDrawing,
  ts: number,
  ox: number,
  oy: number,
  f: number,
): void {
  const g = gap(ts);
  const g2 = Math.floor((g + 1) / 2);
  const g4 = Math.floor((g + 1) / 4);

  if (f & F_ADJ_UP) {
    dr.drawRect({ x: ox, y: oy - g, w: ts, h: g }, COL_BACKGROUND);
    drawGt(
      dr,
      ox + g2,
      oy - g4,
      g2,
      -g2,
      g2,
      g2,
      clueColor(f, F_ERROR_UP, F_SPENT_UP, COL_TEXT),
    );
    dr.drawUpdate({ x: ox, y: oy - g, w: ts, h: g });
  }
  if (f & F_ADJ_RIGHT) {
    dr.drawRect({ x: ox + ts, y: oy, w: g, h: ts }, COL_BACKGROUND);
    drawGt(
      dr,
      ox + ts + g4,
      oy + g2,
      g2,
      g2,
      -g2,
      g2,
      clueColor(f, F_ERROR_RIGHT, F_SPENT_RIGHT, COL_TEXT),
    );
    dr.drawUpdate({ x: ox + ts, y: oy, w: g, h: ts });
  }
  if (f & F_ADJ_DOWN) {
    dr.drawRect({ x: ox, y: oy + ts, w: ts, h: g }, COL_BACKGROUND);
    drawGt(
      dr,
      ox + g2,
      oy + ts + g4,
      g2,
      g2,
      g2,
      -g2,
      clueColor(f, F_ERROR_DOWN, F_SPENT_DOWN, COL_TEXT),
    );
    dr.drawUpdate({ x: ox, y: oy + ts, w: ts, h: g });
  }
  if (f & F_ADJ_LEFT) {
    dr.drawRect({ x: ox - g, y: oy, w: g, h: ts }, COL_BACKGROUND);
    drawGt(
      dr,
      ox - g4,
      oy + g2,
      -g2,
      g2,
      g2,
      g2,
      clueColor(f, F_ERROR_LEFT, F_SPENT_LEFT, COL_TEXT),
    );
    dr.drawUpdate({ x: ox - g, y: oy, w: g, h: ts });
  }
}
