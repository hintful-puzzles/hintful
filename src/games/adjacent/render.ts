/**
 * Adjacent's clues as drawn — port of `draw_adjs` from `unequal.c`: a bar in
 * the gap between two cells whose numbers differ by one. The cells, the gaps
 * and everything else on the board are the shared edge-clue renderer's
 * (`engine/edge-clue-latin/render.ts`).
 */

import {
  COL_BACKGROUND,
  COL_ERROR,
  COL_GRID,
  clueColor,
  gap,
  rectOutline,
} from "../../engine/edge-clue-latin/render.ts";
import {
  F_ADJ_DOWN,
  F_ADJ_RIGHT,
  F_ERROR_DOWN,
  F_ERROR_RIGHT,
  F_SPENT_DOWN,
  F_SPENT_RIGHT,
} from "../../engine/edge-clue-latin/state.ts";
import type { GameDrawing } from "../../engine/game.ts";

/** Draw the bars a cell owns: only RIGHT and DOWN, so each gap is drawn once.
 * A pure error (numbers one apart where no bar says so) draws a red outline
 * bar. */
export function drawBars(
  dr: GameDrawing,
  ts: number,
  ox: number,
  oy: number,
  f: number,
): void {
  const g = gap(ts);
  const g38 = Math.floor((3 * (g + 1)) / 8);
  const g4 = Math.floor((g + 1) / 4);

  if (f & (F_ADJ_RIGHT | F_ERROR_RIGHT)) {
    if (f & F_ADJ_RIGHT) {
      dr.drawRect(
        { x: ox + ts + g38, y: oy, w: g4, h: ts },
        clueColor(f, F_ERROR_RIGHT, F_SPENT_RIGHT, COL_GRID),
      );
    } else {
      rectOutline(dr, ox + ts + g38, oy, g4, ts, COL_ERROR);
    }
  } else {
    dr.drawRect({ x: ox + ts + g38, y: oy, w: g4, h: ts }, COL_BACKGROUND);
  }
  dr.drawUpdate({ x: ox + ts, y: oy, w: g, h: ts });

  if (f & (F_ADJ_DOWN | F_ERROR_DOWN)) {
    if (f & F_ADJ_DOWN) {
      dr.drawRect(
        { x: ox, y: oy + ts + g38, w: ts, h: g4 },
        clueColor(f, F_ERROR_DOWN, F_SPENT_DOWN, COL_GRID),
      );
    } else {
      rectOutline(dr, ox, oy + ts + g38, ts, g4, COL_ERROR);
    }
  } else {
    dr.drawRect({ x: ox, y: oy + ts + g38, w: ts, h: g4 }, COL_BACKGROUND);
  }
  dr.drawUpdate({ x: ox, y: oy + ts, w: ts, h: g });
}
