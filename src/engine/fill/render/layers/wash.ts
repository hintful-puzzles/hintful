/** The wash (`play.wash`): which cells' surface takes it, and which of them
 * leave their secondary piece out; and the player's highlights
 * (`play.highlights`). `surface.ts` paints them. */

import { canHold } from "../../band.ts";
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

/** Each cell's highlight (`play.highlights`): one more than the index of
 * the first the player shows that holds there, 0 where none does. The
 * band's spotlight (`band.ts`) is one past the last, and covers the rest:
 * it is what the player asked to see last. */
export function highlightsOf<C extends Clues<C>>(
  { module, play }: FillSetup<C>,
  b: FillBoard<C>,
  ui: FillUi,
): Uint8Array {
  const out = new Uint8Array(b.values.length);
  painted(module, play, b, ui, out);
  const v = ui.spotlit ?? 0;
  if (v !== 0) {
    const spot = (play.highlights?.length ?? 0) + 1;
    for (let c = 0; c < out.length; c++) if (canHold(b, c, v)) out[c] = spot;
  }
  return out;
}

/** Writes into `out` each cell's highlight of `play.highlights`. */
function painted<C extends Clues<C>>(
  module: FillSetup<C>["module"],
  play: FillSetup<C>["play"],
  b: FillBoard<C>,
  ui: FillUi,
  out: Uint8Array,
): void {
  const { highlighted } = module;
  if (highlighted === undefined) return;
  const shown = (play.highlights ?? []).flatMap((h, k) =>
    (ui.highlights?.[k] ?? h.on) ? [k] : [],
  );
  if (shown.length === 0) return;
  const sp = spaceOf(module, b);
  for (const c of sp.cells)
    for (const k of shown)
      if (highlighted[k](b.values, sp, b.dealt, c)) {
        out[c] = k + 1;
        break;
      }
}
