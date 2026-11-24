/** The deal setting that says how thoroughly the hide tries the clues. */

import type { ParamConfigItem } from "../../contract/game.ts";
import { num, type ParamsSegment } from "../../game-id/params-codec.ts";
import type { FillDeal, FillParams } from "../game-id.ts";

/** A deal setting the player may turn off (`deal.thorough`): on, the hide
 * tries every clue; off, as many as the board's shorter side. A menu board
 * and a new size have it on where they are narrower than `offFrom`. */
export interface FillThorough {
  readonly letter: string;
  readonly kw: string;
  readonly name: string;
  readonly doc: string;
  readonly offFrom: number;
}

/** The setting's default for a board `w` squares wide. */
const thoroughBy = (t: FillThorough, w: number): boolean => w < t.offFrom;

/** `p` with the deal's setting at its default for its size, where the deal
 * has one. */
export const withThorough = (deal: FillDeal, p: FillParams): FillParams =>
  deal.thorough === undefined ? p : { ...p, thorough: thoroughBy(deal.thorough, p.w) };

/** The setting's Custom field, named where it is not the size's default. */
export const thoroughItem = (t: FillThorough): ParamConfigItem<FillParams> => ({
  kw: t.kw,
  name: t.name,
  type: "boolean",
  doc: t.doc,
  label: {
    slot: "tail",
    words: (p) =>
      p.thorough === thoroughBy(t, p.w)
        ? null
        : `${p.thorough ? "slower" : "faster"} generation`,
  },
  get: (p) => p.thorough ?? thoroughBy(t, p.w),
  set: (p, v) => {
    p.thorough = v;
  },
});

/** The setting in the params, which only a full ID carries, and only where
 * it is off: absent, it is on whatever the size, as upstream reads it, so an
 * upstream ID deals as it did there. */
export const thoroughSegment = (
  config: readonly ParamConfigItem<FillParams>[],
  t: FillThorough,
): ParamsSegment<FillParams> =>
  num(
    config,
    t.letter,
    {
      get: (p) => (p.thorough ? 1 : 0),
      set: (p, v) => {
        p.thorough = v !== 0;
      },
    },
    {
      full: true,
      omitWhen: (p) => p.thorough !== false,
      whenAbsent: (p) => {
        p.thorough = true;
      },
    },
  );
