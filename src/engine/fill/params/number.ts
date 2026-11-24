/** A setting the deal reads as a number from `min` to `max`. */

import { parseConfigInt } from "../../game-id/params.ts";
import { num } from "../../game-id/params-codec.ts";
import type { FillParams } from "../game-id.ts";
import {
  dealValue,
  type SettingBase,
  type SettingField,
  type SettingKind,
  setDealValue,
} from "./setting.ts";

/** A number the deal reads, written in a full ID as its letter and the
 * number, absent read as its default. */
export interface NumberSetting extends SettingBase, SettingField {
  readonly kind: "number";
  readonly letter: string;
  readonly min: number;
  readonly max: number;
  readonly default: number;
  /** What a board's name says of it, `{n}` the number. */
  readonly words?: string;
}

/** Why board `p` cannot have number `s` as it is: past its range. Only the
 * deal reads it, so only a full ID's is held to it. */
export function numberRefusal(
  s: NumberSetting,
  p: FillParams,
  full: boolean,
): string | null {
  const v = dealValue(p, s.id, s.default);
  return full && (v < s.min || v > s.max)
    ? `${s.name} must be between ${s.min} and ${s.max}.`
    : null;
}

export const number: SettingKind<NumberSetting> = {
  items(s, cx) {
    const get = (p: FillParams) => dealValue(p, s.id, s.default);
    return [
      {
        kw: s.kw,
        name: s.name,
        type: "string",
        doc: s.doc,
        bounds: { min: s.min, max: s.max },
        label: {
          slot: "tail",
          words: (p) =>
            get(p) === cx.usual(p, s.id)
              ? null
              : (s.words?.replace("{n}", String(get(p))) ?? null),
        },
        get: (p) => String(get(p)),
        set: (p, v) => setDealValue(p, s.id, parseConfigInt(v)),
      },
    ];
  },
  segments(s, config) {
    return {
      here: [
        num(
          config,
          s.letter,
          {
            get: (p) => dealValue(p, s.id, s.default),
            set: (p, v) => setDealValue(p, s.id, v),
          },
          { full: true, whenAbsent: (p) => setDealValue(p, s.id, s.default) },
        ),
      ],
    };
  },
  start(s, p, board) {
    setDealValue(p, s.id, board.settings?.[s.id] ?? s.default);
  },
};
