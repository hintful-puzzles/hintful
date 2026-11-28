/**
 * The cells a sample's `first` deals its value on before the rest of the
 * answer is drawn: by the build (`build.ts`) and the scatter
 * (`samplers.ts`).
 */

import { retryLimit } from "../../contract/retry-limit.ts";
import { placeSymmetricBlacks } from "../../generate/symmetric-blacks.ts";
import { SET_BLACKS_SYMM } from "../../generate/symmetry.ts";
import { type RandomState, randomUpto } from "../../random/index.ts";
import type { FillDeal, FillParams } from "../game-id.ts";
import { isOn, settingOf, symmetryOf } from "../params/settings.ts";
import { type FirstCells, rampedShare } from "../sample.ts";
import { opening } from "./opened.ts";

/** The resolution a cell's chance is drawn at. */
const CHANCE = 1 << 20;

/** The cells `first` deals its value on, 0 on every other: those an opening
 * leaves, at its chance a cell, or by the share and the symmetry the
 * options give (upstream's lightup.c `set_blacks`). */
export function firstLaid(
  first: FirstCells,
  deal: FillDeal,
  p: FillParams,
  rs: RandomState,
  draw: number,
): Uint8Array {
  const values = typeof first.value === "number" ? [first.value] : first.value;
  const pick = (): number =>
    values.length === 1 ? values[0] : values[randomUpto(rs, values.length)];
  if (first.opened !== undefined) {
    const { symmetry, when } = first.opened;
    const kept = when === undefined || isOn(deal, p, when) ? symmetry : undefined;
    return opening(p.w, p.h, kept ?? "none", rs).map((on) => (on ? pick() : 0));
  }
  return first.chance === undefined
    ? setBlacks(first, deal, p, rs, draw, pick)
    : byChance(first.chance, first.within, p, rs, pick);
}

/** Each cell laid a value at `chance`, the board drawn again until the share
 * laid is `within`'s (upstream undead.c's `new_game_desc`, which lays a
 * mirror on two squares in five and draws again where the monsters are under
 * 0.48 or over 0.78 of the squares). */
function byChance(
  chance: number,
  within: FirstCells["within"],
  p: FillParams,
  rs: RandomState,
  pick: () => number,
): Uint8Array {
  const n = p.w * p.h;
  const start = new Uint8Array(n);
  const attempt = retryLimit(`deal: first cells (${p.w}x${p.h})`);
  for (;;) {
    attempt();
    let laid = 0;
    for (let c = 0; c < n; c++) {
      const on = randomUpto(rs, CHANCE) < chance * CHANCE;
      start[c] = on ? pick() : 0;
      if (on) laid++;
    }
    // A bound written as a decimal never loses a cell to its binary fraction.
    if (
      within === undefined ||
      (laid >= within.min * n - 1e-9 && laid <= within.max * n + 1e-9)
    )
      return start;
  }
}

/** The cells laid by the share and the symmetry the options give. */
function setBlacks(
  first: FirstCells,
  deal: FillDeal,
  p: FillParams,
  rs: RandomState,
  draw: number,
  pick: () => number,
): Uint8Array {
  const { share, symmetry: option } = first;
  if (share === undefined || option === undefined)
    throw new Error("deal: first cells laid by no share and symmetry");
  const start = new Uint8Array(p.w * p.h);
  const symmetry = symmetryOf(deal, p, option);
  const symm = SET_BLACKS_SYMM[symmetry];
  if (symm === undefined) throw new Error(`deal: first cells keep no ${symmetry}`);
  placeSymmetricBlacks({
    w: p.w,
    h: p.h,
    blackpc: rampedShare(first.ramp, settingOf(deal, p, share), draw),
    symm,
    rs,
    isBlack: (x, y) => start[y * p.w + x] !== 0,
    setBlack: (x, y, on) => {
      start[y * p.w + x] = on ? pick() : 0;
    },
  });
  return start;
}
