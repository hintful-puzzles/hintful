/** A setting that is a number from `min` to `max`: a size the rules read, or
 * one the deal reads. */

import { noSuchTier } from "../../contract/difficulty.ts";
import { parseConfigInt } from "../../game-id/params.ts";
import { num } from "../../game-id/params-codec.ts";
import type { FillParams } from "../game-id.ts";
import { type FlagSetting, variationsOf } from "./flag.ts";
import {
  dealValue,
  type SettingBase,
  type SettingContext,
  type SettingField,
  type SettingKind,
  setDealValue,
} from "./setting.ts";

/** A number, written as its letter and the number. Where it `gives` a size,
 * the size of its id, written in a brief ID; else only the deal reads it, a
 * full ID alone writes it, and absent it is read as its default. */
export interface NumberSetting extends SettingBase, SettingField {
  readonly kind: "number";
  readonly letter: string;
  readonly gives?: "size";
  readonly min: number;
  readonly max: number;
  readonly default: number;
  /** What a board's name says of it, `{n}` the number. */
  readonly words?: string;
  /** By a variation's id, the least it may be with the variation on. */
  readonly least?: Readonly<Record<string, number>>;
  /** The side of the grid it is less than (Salad's symbols, fewer than a
   * line's squares). */
  readonly under?: "w" | "h";
  /** Never more than the board's squares (Map's regions). */
  readonly atMost?: "area";
  /** Where an ID leaves it out, one for every this many squares, rounded
   * down, in place of `default` (upstream map.c's regions, one in 8). */
  readonly onePer?: number;
  /** By a tier, by its index, the least it may be on a board of that tier,
   * and whether it is fewer than the board's squares there; a board past
   * them has no such tier (Map's few regions above Easy). */
  readonly tiers?: readonly {
    readonly tier: number;
    readonly min?: number;
    readonly under?: "area";
  }[];
}

/** The value `s` has on board `p`. */
const numberOf = (s: NumberSetting, p: FillParams): number =>
  s.gives === "size" ? (p.sizes?.[s.id] ?? s.default) : dealValue(p, s.id, s.default);

/** Sets `s` to `v` on `p`. */
function setNumber(s: NumberSetting, p: FillParams, v: number): void {
  if (s.gives === "size") p.sizes = { ...p.sizes, [s.id]: v };
  else setDealValue(p, s.id, v);
}

/** Why board `p` cannot have number `s` as it is: past its range, or below
 * its least under a variation on, named by the variation's setting. One only
 * the deal reads is held to it in a full ID alone, which names it. */
export function numberRefusal(
  s: NumberSetting,
  p: FillParams,
  full: boolean,
  cx: SettingContext,
): string | null {
  if (!full && s.gives !== "size") return null;
  const v = numberOf(s, p);
  if (v < s.min || v > s.max) return `${s.name} must be between ${s.min} and ${s.max}.`;
  if (s.under !== undefined && v >= p[s.under])
    return cx.deal.square === true
      ? `${s.name} must be less than the grid size.`
      : `${s.name} must be less than the ${s.under === "w" ? "width" : "height"}.`;
  const area = p.w * p.h;
  if (s.atMost === "area" && v > area)
    return `${s.name} must be at most the number of squares, ${area}.`;
  for (const [variation, least] of Object.entries(s.least ?? {}))
    if (variationsOf(p).includes(variation) && v < least) {
      const by = cx.deal.settings.find(
        (x): x is FlagSetting => x.kind === "flag" && x.id === variation,
      );
      return `${s.name} must be at least ${least} with ${(by?.name ?? variation).toLowerCase()}.`;
    }
  // A tier's bounds hold of the board a deal makes, which only a full ID's
  // tier names.
  if (full)
    for (const t of s.tiers ?? [])
      if (
        t.tier === p.diff &&
        ((t.min !== undefined && v < t.min) || (t.under === "area" && v >= area))
      )
        return noSuchTier(
          `${p.w}x${p.h} puzzle with ${s.words?.replace("{n}", String(v)) ?? `${s.name} ${v}`}`,
          cx.tiers[t.tier],
        );
  return null;
}

/** What `s` is on board `p` where its ID leaves it out. */
const absentOf = (s: NumberSetting, p: FillParams): number =>
  s.onePer === undefined ? s.default : Math.floor((p.w * p.h) / s.onePer);

export const number: SettingKind<NumberSetting> = {
  items(s, cx) {
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
            s.gives !== "size" && numberOf(s, p) === cx.usual(p, s.id)
              ? null
              : (s.words?.replace("{n}", String(numberOf(s, p))) ?? null),
        },
        get: (p) => String(numberOf(s, p)),
        set: (p, v) => setNumber(s, p, parseConfigInt(v)),
      },
    ];
  },
  segments(s, config) {
    const access = {
      get: (p: FillParams) => numberOf(s, p),
      set: (p: FillParams, v: number) => setNumber(s, p, v),
    };
    return {
      here: [
        s.gives === "size"
          ? num(config, s.letter, access, {
              whenAbsent: (p) => setNumber(s, p, absentOf(s, p)),
            })
          : num(config, s.letter, access, {
              full: true,
              whenAbsent: (p) => setNumber(s, p, absentOf(s, p)),
            }),
      ],
    };
  },
  start(s, p, board) {
    const v = s.gives === "size" ? board.sizes?.[s.id] : board.settings?.[s.id];
    setNumber(s, p, v ?? s.default);
  },
};
