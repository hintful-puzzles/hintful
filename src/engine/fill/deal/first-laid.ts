/**
 * The cells a sample's `first` deals its value on before the rest of the
 * answer is drawn: by the build (`build.ts`) and the scatter
 * (`samplers.ts`).
 */

import { placeSymmetricBlacks } from "../../generate/symmetric-blacks.ts";
import { SET_BLACKS_SYMM } from "../../generate/symmetry.ts";
import type { RandomState } from "../../random/index.ts";
import type { FillDeal, FillParams } from "../game-id.ts";
import { settingOf, symmetryOf } from "../params/settings.ts";
import { type FirstCells, rampedShare } from "../sample.ts";

/** The cells `first` deals its value on, by the share and the symmetry the
 * options give, 0 on every other. Upstream's lightup.c `set_blacks`. */
export function firstLaid(
  first: FirstCells,
  deal: FillDeal,
  p: FillParams,
  rs: RandomState,
  draw: number,
): Uint8Array {
  const start = new Uint8Array(p.w * p.h);
  const symmetry = symmetryOf(deal, p, first.symmetry);
  const symm = SET_BLACKS_SYMM[symmetry];
  if (symm === undefined) throw new Error(`deal: first cells keep no ${symmetry}`);
  placeSymmetricBlacks({
    w: p.w,
    h: p.h,
    blackpc: rampedShare(first.ramp, settingOf(deal, p, first.share), draw),
    symm,
    rs,
    isBlack: (x, y) => start[y * p.w + x] === first.value,
    setBlack: (x, y, on) => {
      start[y * p.w + x] = on ? first.value : 0;
    },
  });
  return start;
}
