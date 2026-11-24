/** A setting that is one of its choices: a size the rules read, each value
 * a ruleset, or a setting of the deal. */

import { noSuchTier } from "../../contract/difficulty.ts";
import type { ParamConfigItem } from "../../contract/game.ts";
import { num, type ParamsSegment } from "../../game-id/params-codec.ts";
import { rulesetItem } from "../../game-id/ruleset.ts";
import type { Symmetry } from "../../generate/symmetry.ts";
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

/** Bounds on a board's size a choice sets: on its sides, that it is
 * square, and a tier's own, by the tier's index. */
export type ChoiceBounds = SizeBounds & {
  readonly square?: true;
  readonly tiers?: readonly (SizeBounds & { readonly tier: number })[];
};

/** One choice of a setting. */
export interface Choice {
  readonly name: string;
  /** What a board's name says of it, where not its name. */
  readonly words?: string;
  /** What the params write for it, where the setting has no letter; `""`,
   * the default's alone, written as nothing. */
  readonly code?: string;
  readonly bounds?: ChoiceBounds;
  /** The symmetry it keeps, where the setting is a symmetry. */
  readonly symmetry?: Symmetry;
  /** Where it is a ruleset: its rule, and the narrowest board it has an
   * answer on. */
  readonly rule?: string;
  readonly least?: number;
}

/** A choice, its index from `from`. Where it `gives` a size, the size of its
 * id, each choice a ruleset with the Custom dialog's ruleset field, written
 * in a brief ID; else only the deal reads it, and a full ID alone writes it,
 * never at its default. Either is written as its letter and the value, or
 * with no letter as its choice's code. */
export interface ChoiceSetting extends SettingBase, Partial<SettingField> {
  readonly kind: "choice";
  readonly letter?: string;
  readonly gives?: "size";
  readonly from: number;
  readonly default: number;
  readonly choices: readonly Choice[];
}

/** The index of the choice `s` has on board `p`. */
export const choiceOf = (s: ChoiceSetting, p: FillParams): number =>
  s.gives === "size"
    ? (p.sizes?.[s.id] ?? s.from + s.default) - s.from
    : dealValue(p, s.id, s.default);

/** Sets `s` to its choice `index` on `p`. */
function setChoice(s: ChoiceSetting, p: FillParams, index: number): void {
  if (s.gives === "size") p.sizes = { ...p.sizes, [s.id]: s.from + index };
  else setDealValue(p, s.id, index);
}

/** Each ruleset's narrowest board, said beside the grid's size: a sentence
 * after its doc, or nothing. */
export function leastWords(settings: readonly ChoiceSetting[]): string {
  const leasts = settings.flatMap((s) =>
    s.choices.flatMap((r) =>
      r.least === undefined ? [] : [`${r.least} with ${r.name}`],
    ),
  );
  return leasts.length === 0
    ? ""
    : ` It must be at least ${leasts.slice(0, -1).join(", ")}${leasts.length > 1 ? " and " : ""}${leasts.at(-1)}.`;
}

/** A setting written by its choices' codes, longest first where one begins
 * another; absent, its default. */
function codesSegment(s: ChoiceSetting): ParamsSegment<FillParams> {
  const codes = s.choices.map((c, i) => {
    if (c.code === undefined) throw new Error(`settings: ${s.id} has no letter`);
    return [c.code, i] as const;
  });
  const longestFirst = codes
    .filter(([code]) => code !== "")
    .sort(([a], [b]) => b.length - a.length);
  return {
    encode: (p, full) => {
      if (s.gives !== "size" && !full) return "";
      const v = choiceOf(s, p);
      return v === s.default ? "" : (codes[v]?.[0] ?? "");
    },
    decode: (str, i, p) => {
      const found = longestFirst.find(([code]) => str.startsWith(code, i));
      setChoice(s, p, found?.[1] ?? s.default);
      return found === undefined ? i : i + found[0].length;
    },
  };
}

/** Why board `p` cannot have choice `s` as it is: a ruleset's least board,
 * or the bounds a choice of the deal's sets. */
export function choiceRefusal(
  s: ChoiceSetting,
  p: FillParams,
  full: boolean,
  cx: SettingContext,
): string | null {
  const v = choiceOf(s, p);
  const c = s.choices[v];
  if (s.gives === "size") {
    if (c === undefined) return "There is no such game mode.";
    if (c.least !== undefined && Math.min(p.w, p.h) < c.least)
      return cx.deal.square === true
        ? `${c.name}: the grid size must be at least ${c.least}.`
        : `${c.name}: width and height must both be at least ${c.least}.`;
    return null;
  }
  // Only the deal reads it, so only a full ID's is held to it.
  if (!full) return null;
  const what = (s.name ?? s.id).toLowerCase();
  if (c === undefined) return `There is no such ${what}.`;
  const b = c.bounds;
  if (b === undefined) return null;
  if (b.square === true && p.w !== p.h) return `${c.name}: the grid must be square.`;
  const past = beyond(b, p);
  if (past !== null) return `${c.name}: ${past[0].toLowerCase()}${past.slice(1)}.`;
  for (const { tier, ...tb } of b.tiers ?? [])
    if (tier === p.diff && beyond(tb, p) !== null)
      return noSuchTier(`${p.w}x${p.h} puzzle with ${c.name} ${what}`, cx.tiers[tier]);
  return null;
}

export const choice: SettingKind<ChoiceSetting> = {
  items(s, cx) {
    const get = (p: FillParams) => choiceOf(s, p);
    const set = (p: FillParams, v: number) => setChoice(s, p, v);
    if (s.gives === "size")
      return [
        rulesetItem<FillParams>(
          s.choices.map((c) => ({
            name: c.name,
            rule: c.rule ?? "",
            ...(c.least === undefined ? {} : { least: c.least }),
          })),
          { get, set },
        ),
      ];
    if (s.kw === undefined || s.name === undefined || s.doc === undefined)
      throw new Error(`settings: ${s.id} has no Custom field`);
    const item: ParamConfigItem<FillParams> = {
      kw: s.kw,
      name: s.name,
      type: "choices",
      choices: s.choices.map((c) => c.name),
      doc: s.doc,
      label: {
        slot: "tail",
        words: (p) => {
          const v = get(p);
          if (v === cx.usual(p, s.id)) return null;
          const c = s.choices[v];
          return c === undefined ? null : (c.words ?? c.name);
        },
      },
      get,
      set,
    };
    return [item];
  },
  segments(s, config) {
    if (s.letter === undefined) return { here: [codesSegment(s)] };
    const access = {
      get: (p: FillParams) => s.from + choiceOf(s, p),
      set: (p: FillParams, v: number) => setChoice(s, p, v - s.from),
    };
    return {
      here: [
        s.gives === "size"
          ? num(config, s.letter, access)
          : num(config, s.letter, access, {
              full: true,
              whenAbsent: (p) => setChoice(s, p, s.default),
            }),
      ],
    };
  },
  start(s, p, board) {
    if (s.gives === "size")
      p.sizes = { ...p.sizes, [s.id]: board.sizes?.[s.id] ?? s.from + s.default };
    else setDealValue(p, s.id, board.settings?.[s.id] ?? s.default);
  },
};
