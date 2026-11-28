/** Check & Save's mark on a cell it found wrong: a red outline inset from its
 * edges, on a raised value's top where the value stands (`three-d.ts`). A
 * link it found wrong is the link's own (`links.ts`), and so is a slot of a
 * board of features (`features.ts`), which then takes no outline. */

import { COL_ERROR } from "../../../color/roles.ts";
import type { GameDrawing } from "../../../contract/game.ts";
import { drawThickRectOutline } from "../../../render/draw.ts";
import type { FillMistake } from "../../answer.ts";
import { FEATURE_WRONG_SHIFT, MISTAKE } from "../tile-word.ts";

/** Into the tile words `word`, and the edge words `edgeWord` where a slot
 * says it, the cells Check & Save found wrong. */
export function addMistakes(
  word: Int32Array,
  edgeWord: Int32Array,
  mistakes: readonly FillMistake[],
): void {
  for (const m of mistakes)
    if (m.slots !== undefined) edgeWord[m.cell] |= m.slots << FEATURE_WRONG_SHIFT;
    else if (m.kind !== "mark") word[m.cell] |= MISTAKE;
}

/** The mark on a cell whose face is at `(tx, ty)`. */
export function drawMistake(dr: GameDrawing, ts: number, tx: number, ty: number): void {
  const thick = Math.max(1, Math.floor(ts / 16));
  const inset = Math.max(2, Math.floor(ts / 8));
  const span = ts - 2 * inset;
  drawThickRectOutline(dr, tx + inset, ty + inset, span, span, thick, COL_ERROR);
}
