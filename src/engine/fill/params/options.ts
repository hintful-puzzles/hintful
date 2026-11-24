/** The settings the params give that only the deal reads (`deal.options`). */

import { noSuchTier } from "../../contract/difficulty.ts";
import type { ParamConfigItem } from "../../contract/game.ts";
import { parseConfigInt } from "../../game-id/params.ts";
import { num, type ParamsSegment } from "../../game-id/params-codec.ts";
import type { Symmetry } from "../../generate/symmetry.ts";
import type { FillDeal, FillParams } from "../game-id.ts";
import { beyond, type SizeBounds } from "./bounds.ts";

/** Bounds on a board's size a choice of an option sets: on its sides, that
 * it is square, and a tier's own, by the tier's index. */
export type ChoiceBounds = SizeBounds & {
  readonly square?: true;
  readonly tiers?: readonly (SizeBounds & { readonly tier: number })[];
};

/** A setting the params give that only the deal reads (`deal.options`): a
 * number from `min` to `max`, or with `choices` the index of one. A full ID
 * writes it as its letter and the number, or where its choices have codes,
 * as the choice's code, the default's never. */
export interface FillOption {
  /** Absent where the choices have codes. */
  readonly letter?: string;
  readonly kw: string;
  readonly name: string;
  readonly default: number;
  readonly doc: string;
  readonly min: number;
  readonly max: number;
  /** A number's words in a board's name, `{n}` the number. */
  readonly words?: string;
  readonly choices?: readonly {
    readonly name: string;
    readonly words?: string;
    readonly bounds?: ChoiceBounds;
    /** The symmetry the choice keeps, where the option is a symmetry. */
    readonly symmetry?: Symmetry;
    /** What a full ID writes for it, where the option has no letter. */
    readonly code?: string;
  }[];
}

/** Option `name`'s value on a board of `p`, its default where `p` names
 * none. */
export const optionOf = (deal: FillDeal, p: FillParams, name: string): number => {
  const o = deal.options?.[name];
  if (o === undefined) throw new Error(`deal: no option ${name}`);
  return p.options?.[name] ?? o.default;
};

/** The symmetry option `name` chooses on a board of `p`. */
export const symmetryOf = (deal: FillDeal, p: FillParams, name: string): Symmetry => {
  const s = deal.options?.[name]?.choices?.[optionOf(deal, p, name)]?.symmetry;
  if (s === undefined) throw new Error(`deal: option ${name} chooses no symmetry`);
  return s;
};

/** The symmetry the clues a deal of board `p` leaves keep: `none` where it
 * keeps none. */
export const symmetricOf = (deal: FillDeal, p: FillParams): Symmetry => {
  const s = deal.symmetric;
  if (s === undefined) return "none";
  return typeof s === "string" ? s : symmetryOf(deal, p, s.option);
};

/** Option `name` in the params, which only a full ID carries: its letter and
 * the number, or its choice's code, longest first where one begins another,
 * and the default's never written. Absent, it is the option's default. */
export function optionSegment(
  deal: FillDeal,
  config: readonly ParamConfigItem<FillParams>[],
  name: string,
  o: FillOption,
): ParamsSegment<FillParams> {
  const set = (p: FillParams, v: number) => {
    p.options = { ...p.options, [name]: v };
  };
  if (o.letter !== undefined)
    return num(
      config,
      o.letter,
      { get: (p) => optionOf(deal, p, name), set },
      { full: true, whenAbsent: (p) => set(p, o.default) },
    );
  const codes = (o.choices ?? []).map((c, i) => {
    if (c.code === undefined) throw new Error(`deal: option ${name} has no letter`);
    return [c.code, i] as const;
  });
  const longestFirst = [...codes].sort(([a], [b]) => b.length - a.length);
  return {
    encode: (p, full) => {
      const v = optionOf(deal, p, name);
      return full && v !== o.default ? (codes[v]?.[0] ?? "") : "";
    },
    decode: (s, i, p) => {
      const found = longestFirst.find(([code]) => s.startsWith(code, i));
      set(p, found?.[1] ?? o.default);
      return found === undefined ? i : i + found[0].length;
    },
  };
}

/** The Custom dialog's field for option `name`: a number, or a choice. A
 * board's name says it where it is not what a board of its size is usually
 * dealt with. */
export function optionItem(
  deal: FillDeal,
  name: string,
  o: FillOption,
  usual: (p: FillParams, name: string) => number,
): ParamConfigItem<FillParams> {
  const get = (p: FillParams) => optionOf(deal, p, name);
  const set = (p: FillParams, v: number) => {
    p.options = { ...p.options, [name]: v };
  };
  const words = (p: FillParams): string | null => {
    const v = get(p);
    if (v === usual(p, name)) return null;
    const choice = o.choices?.[v];
    if (choice !== undefined) return choice.words ?? choice.name;
    return o.words?.replace("{n}", String(v)) ?? null;
  };
  const label = { slot: "tail" as const, words };
  return o.choices === undefined
    ? {
        kw: o.kw,
        name: o.name,
        type: "string",
        doc: o.doc,
        bounds: { min: o.min, max: o.max },
        label,
        get: (p) => String(get(p)),
        set: (p, v) => set(p, parseConfigInt(v)),
      }
    : {
        kw: o.kw,
        name: o.name,
        type: "choices",
        choices: o.choices.map((c) => c.name),
        doc: o.doc,
        label,
        get,
        set,
      };
}

/** Why a full ID's board `p` cannot have option `name`'s value: past its
 * range, or past its choice's bounds; `null` where it can. An option is the
 * deal's alone, so only a full ID's is held to them. */
export function optionRefusal(
  deal: FillDeal,
  tiers: readonly string[],
  p: FillParams,
  name: string,
  o: FillOption,
): string | null {
  const v = optionOf(deal, p, name);
  if (v < o.min || v > o.max)
    return o.choices === undefined
      ? `${o.name} must be between ${o.min} and ${o.max}.`
      : `There is no such ${o.name.toLowerCase()}.`;
  const choice = o.choices?.[v];
  const b = choice?.bounds;
  if (choice === undefined || b === undefined) return null;
  if (b.square === true && p.w !== p.h)
    return `${choice.name}: the grid must be square.`;
  const past = beyond(b, p);
  if (past !== null) return `${choice.name}: ${past[0].toLowerCase()}${past.slice(1)}.`;
  for (const { tier, ...tb } of b.tiers ?? [])
    if (tier === p.diff && beyond(tb, p) !== null)
      return noSuchTier(
        `${p.w}x${p.h} puzzle with ${choice.name} ${o.name.toLowerCase()}`,
        tiers[tier],
      );
  return null;
}
