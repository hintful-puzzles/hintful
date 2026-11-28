/**
 * The four colors a map is colored in (`FOUR_FILLS`), each a painter whose
 * piece is its surface: a cell holding it is filled in the color, and a note
 * of it is a dot in the color as a mark (`FOUR_FILL_MARKS`), which reads on
 * a surface that is not the color in both schemes.
 */

import { FOUR_FILL_MARKS, FOUR_FILLS } from "../../color/colors.ts";
import type { Color } from "../../contract/types.ts";
import type { Painter } from "./painter.ts";

/** The `k`th of the four colors. */
function four(k: number): Painter {
  const colors: readonly Color[] = [FOUR_FILLS[k], FOUR_FILL_MARKS[k]];
  return {
    colors: () => colors,
    surface: 0,
    // The surface is the whole piece.
    paint() {},
    note(dr, box, slot) {
      const r = Math.min(box.w, box.h) / 2;
      dr.drawCircle(
        { x: box.x + box.w / 2, y: box.y + box.h / 2 },
        r,
        slot[1],
        slot[1],
      );
    },
  };
}

export const pink = four(0);
export const yellow = four(1);
export const teal = four(2);
export const violet = four(3);
