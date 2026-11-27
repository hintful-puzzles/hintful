/** A setting on or off: a variation the player switches on, or a setting of
 * the deal. */

import { noSuchTier } from "../../contract/difficulty.ts";
import type { ParamConfigItem } from "../../contract/game.ts";
import { modifierItem } from "../../game-id/modifier.ts";
import { flag as flagSegment, num } from "../../game-id/params-codec.ts";
import type { FillParams } from "../game-id.ts";
import { beyond, type SizeBounds } from "./bounds.ts";
import {
  dealValue,
  type SettingBase,
  type SettingContext,
  type SettingField,
  type SettingKind,
  setDealValue,
} from "./setting.ts";

/** A flag, written by its letter where it is on. Where it `gives` a
 * variation, the variation of its id, with the variation's rule; else the
 * deal reads it. Upstream's bytes may write it where off instead, as its
 * letter and `0`, absent read as on (`written: off`), and it may be on by
 * default on a board narrower than `onBelow`. */
export interface FlagSetting extends SettingBase, SettingField {
  readonly kind: "flag";
  readonly letter: string;
  /** What a board's name says where it is on; or, where its default goes by
   * the board's size, what it says where it is on or off against it. */
  readonly words?: string | { readonly on: string; readonly off: string };
  readonly written?: "off";
  readonly onBelow?: number;
  readonly gives?: "variation";
  /** A variation's rule and what else its help entry says. */
  readonly rule?: string;
  readonly note?: string;
  /** The most lines a board 2i squares across may have the other way, with
   * the variation on. */
  readonly most?: readonly number[];
  /** What a board with the variation on is held to. */
  readonly bounds?: SizeBounds;
  /** Of a flag the deal reads, what a board of each tier, by its index, is
   * held to where the flag is off. */
  readonly offBounds?: {
    readonly tiers: readonly (SizeBounds & { readonly tier: number })[];
  };
}

/** The variations `p` has on. */
export const variationsOf = (p: FillParams): readonly string[] => p.variations ?? [];

/** The flag's default on a board `w` squares wide: 1 for on. */
export const flagDefault = (s: FlagSetting, w: number): number =>
  s.onBelow !== undefined && w < s.onBelow ? 1 : 0;

/** Whether deal flag `s` is on for board `p`. */
const dealOn = (s: FlagSetting, p: FillParams): boolean =>
  dealValue(p, s.id, flagDefault(s, p.w)) === 1;

/** What a board's name says of deal flag `s` on `p`, or nothing. */
function dealWords(s: FlagSetting, p: FillParams): string | null {
  const { words } = s;
  if (words === undefined) return null;
  const on = dealOn(s, p);
  if (typeof words === "string") return on ? words : null;
  return on === (flagDefault(s, p.w) === 1) ? null : on ? words.on : words.off;
}

/** Why board `p` cannot have flag `s` as it is: the bounds of the variation
 * it gives, on; or, of one the deal reads, its tier's bounds off, which only
 * a full ID's tier names. */
export function flagRefusal(
  s: FlagSetting,
  p: FillParams,
  full: boolean,
  cx: SettingContext,
): string | null {
  if (s.gives !== "variation") {
    if (!full || s.offBounds === undefined || dealOn(s, p)) return null;
    const off =
      typeof s.words === "object" ? s.words.off : `no ${s.name.toLowerCase()}`;
    for (const { tier, ...b } of s.offBounds.tiers)
      if (tier === p.diff && beyond(b, p) !== null)
        return noSuchTier(`${p.w}x${p.h} puzzle with ${off}`, cx.tiers[tier]);
    return null;
  }
  if (!variationsOf(p).includes(s.id)) return null;
  const past = s.bounds === undefined ? null : beyond(s.bounds, p);
  if (past !== null) return `${s.name}: ${past[0].toLowerCase()}${past.slice(1)}.`;
  const { most } = s;
  if (most === undefined) return null;
  for (const [across, along, side, other] of [
    [p.w, p.h, "wide", "high"],
    [p.h, p.w, "high", "wide"],
  ] as const) {
    const bound = most[across / 2];
    if (bound !== undefined && along > bound)
      return `${s.name}: a grid ${across} ${side} can be at most ${bound} ${other}.`;
  }
  return null;
}

export const flag: SettingKind<FlagSetting> = {
  items(s, cx) {
    if (s.gives !== "variation")
      return [
        {
          kw: s.kw,
          name: s.name,
          type: "boolean",
          doc: s.doc,
          label: { slot: "tail", words: (p) => dealWords(s, p) },
          get: (p) => dealOn(s, p),
          set: (p, v) => setDealValue(p, s.id, v ? 1 : 0),
        },
      ];
    const named = cx.deal.settings
      .filter((x) => x.kind === "flag" && x.gives === "variation")
      .map((x) => x.id);
    if (s.rule === undefined || typeof s.words !== "string")
      throw new Error(`settings: ${s.id} gives a variation, and has no rule or words`);
    const item: ParamConfigItem<FillParams> = modifierItem<FillParams>({
      kw: s.kw,
      name: s.name,
      type: "boolean",
      when: true,
      words: s.words,
      slot: "tail",
      rule: s.rule,
      ...(s.note === undefined ? {} : { note: s.note }),
      get: (p) => variationsOf(p).includes(s.id),
      // In the settings' order, whichever is set first, after any the
      // sizes put on (dealt blocks), and absent where none is on.
      set: (p, on) => {
        const now = [
          ...variationsOf(p).filter((n) => !named.includes(n)),
          ...named.filter((n) => (n === s.id ? on : variationsOf(p).includes(n))),
        ];
        if (now.length > 0) p.variations = now;
        else delete p.variations;
      },
    });
    return [item];
  },
  segments(s, config) {
    if (s.written !== "off")
      return {
        here: [
          flagSegment(
            config,
            s.letter,
            s.kw,
            s.gives === "variation" ? {} : { full: true },
          ),
        ],
      };
    // Only where it is off, and absent it is on whatever the size, as
    // upstream reads it, so an upstream ID deals as it did there.
    return {
      here: [
        num(
          config,
          s.letter,
          {
            get: (p) => (dealOn(s, p) ? 1 : 0),
            set: (p, v) => setDealValue(p, s.id, v === 0 ? 0 : 1),
          },
          {
            full: true,
            omitWhen: (p) => dealOn(s, p),
            whenAbsent: (p) => setDealValue(p, s.id, 1),
          },
        ),
      ],
    };
  },
  start(s, p, board) {
    // A variation is on where a variant board names it, before the settings.
    if (s.gives === "variation") return;
    setDealValue(p, s.id, board.settings?.[s.id] ?? flagDefault(s, p.w));
  },
};
