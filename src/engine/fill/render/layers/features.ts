/**
 * On a board whose values are sets of features (`play.numbers.features`,
 * Subsets'), a square drawn as its features' slots, as upstream subsets.c
 * draws a cell's letters: a feature's letter where the square holds it, a
 * cross where it lacks it, and nothing where that is still open. A placed
 * value decides every slot; an open square's notes are the values it can
 * still hold, and decide a slot where they all agree.
 */

import { COL_CURSOR, COL_ERROR } from "../../../color/roles.ts";
import { drawRectCorners, glyphFont } from "../../../render/draw.ts";
import { drawRuledOutCross } from "../../../render/piece.ts";
import { featureAgreement } from "../../features.ts";
import { COL_GRID, COL_INK } from "../palette.ts";
import { FEATURE_CURSOR_SHIFT, FEATURE_WRONG_SHIFT, NOTES_MODE } from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";
import { numeralInk } from "./numerals.ts";

export function paintFeatures(
  features: { readonly names: string; readonly of: (d: number) => number },
  COL_ENTRY: number,
  { dr, ts, at, word, noteWord, edgeWord, part, lay }: TileFrame,
): void {
  const v = word & 0xff;
  const { all, any } = featureAgreement(
    v !== 0 ? 1 << v : noteWord & ~NOTES_MODE,
    features.of,
  );
  // Check & Save's slots decided against the answer, drawn red.
  const wrong = (edgeWord >> FEATURE_WRONG_SHIFT) & 0xf;
  const ink = v !== 0 ? numeralInk(word, COL_ENTRY) : COL_ENTRY;
  const slots = lay.featureSlots(ts, at, part?.walls ?? null, features.names.length);
  const font = glyphFont(Math.floor((slots[0].w * 3) / 4));
  slots.forEach((box, k) => {
    // The line between two slots, along each one's right and bottom side
    // that another slot is past.
    const right = slots[k + 1];
    if (right !== undefined && right.y === box.y)
      dr.drawRect({ x: box.x + box.w, y: box.y, w: 1, h: box.h }, COL_GRID);
    if (slots.some((s) => s.x === box.x && s.y === box.y + box.h))
      dr.drawRect({ x: box.x, y: box.y + box.h, w: box.w, h: 1 }, COL_GRID);
    const bit = 1 << k;
    if (all & bit)
      dr.drawText(
        { x: box.x + box.w / 2, y: box.y + box.h / 2 },
        font,
        wrong & bit ? COL_ERROR : ink,
        features.names[k],
      );
    else if (!(any & bit))
      drawRuledOutCross(dr, box, wrong & bit ? COL_ERROR : COL_INK);
    // The cursor, as upstream subsets.c's: corners round its slot's middle.
    if (((edgeWord >> FEATURE_CURSOR_SHIFT) & 0xf) === k + 1)
      drawRectCorners(
        dr,
        box.x + Math.floor(box.w / 2),
        box.y + Math.floor(box.h / 2),
        Math.floor(box.w * 0.4) - 1,
        COL_CURSOR,
        Math.max(1, ts >> 4),
      );
  });
}
