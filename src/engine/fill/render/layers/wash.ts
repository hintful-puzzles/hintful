/** The wash (`play.wash`): which cells' surface takes it, and which of them
 * leave their secondary piece out. `surface.ts` paints it. */

import { type Clues, type FillBoard, spaceOf } from "../../board.ts";
import type { FillUi } from "../../play.ts";
import type { FillSetup } from "../setup.ts";
import { WASH_HIDES, WASHED } from "../tile-word.ts";

/** Each cell's wash bits: `WASHED` on a cell the board washes that was not
 * dealt, and `WASH_HIDES` too where it holds the secondary value and the
 * preference leaves that piece out. */
export function washesOf<C extends Clues<C>>(
  { module, play }: FillSetup<C>,
  b: FillBoard<C>,
  ui: FillUi,
): Uint16Array {
  const out = new Uint16Array(b.values.length);
  const { washed } = module;
  if (washed === undefined) return out;
  const sp = spaceOf(module, b);
  for (const c of sp.cells) {
    if (b.fixed[c] || !washed(b.values, sp, b.dealt, c)) continue;
    out[c] = WASHED;
    if (!ui.washedMarks && b.values[c] === play.secondary) out[c] |= WASH_HIDES;
  }
  return out;
}
