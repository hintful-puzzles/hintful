/**
 * The settings the params give (a description's `settings:`), each of one
 * kind, a module of this folder and a line of {@link SETTING_KINDS}; and how
 * the deal reads one by its id.
 */

import type { Symmetry } from "../../generate/symmetry.ts";
import type { FillDeal, FillParams } from "../game-id.ts";
import { blocks, blocksRefusal } from "./blocks.ts";
import { type ChoiceSetting, choice, choiceOf, choiceRefusal } from "./choice.ts";
import { type FlagSetting, flag, flagDefault, flagRefusal } from "./flag.ts";
import { number, numberRefusal } from "./number.ts";
import { set, setRefusal } from "./set.ts";
import { dealValue, type SettingContext, type SettingKind } from "./setting.ts";
import { tally, tallyRefusal } from "./tally.ts";

/** Every kind of setting, by its `kind`. */
const SETTING_KINDS = { flag, number, choice, set, tally, blocks } as const;

type Kinds = typeof SETTING_KINDS;

/** A setting of kind `K`. */
type SettingOf<K extends keyof Kinds> =
  Kinds[K] extends SettingKind<infer S> ? S : never;

/** A setting the params give: an entry of the deal's `settings`. */
export type FillSetting = { [K in keyof Kinds]: SettingOf<K> }[keyof Kinds];

/** The kind of setting `s` is. */
export const kindOf = (s: FillSetting): SettingKind<FillSetting> =>
  // `s.kind` names the kind whose entry `s` is.
  SETTING_KINDS[s.kind] as SettingKind<FillSetting>;

/** The deal's setting `id`, refused where it has none. */
function settingNamed(deal: FillDeal, id: string): FillSetting {
  const s = deal.settings.find((x) => x.id === id);
  if (s === undefined) throw new Error(`deal: no setting ${id}`);
  return s;
}

/** Why board `p` cannot have setting `s` as it is, or `null`; `full` where
 * the board is a full ID's, which names what only the deal reads. Each
 * kind's refusal is called by its name, so the refusal scan reads its
 * sentences. */
export function settingRefusal(
  s: FillSetting,
  p: FillParams,
  full: boolean,
  cx: SettingContext,
): string | null {
  switch (s.kind) {
    case "flag":
      return flagRefusal(s, p, full, cx);
    case "number":
      return numberRefusal(s, p, full, cx);
    case "choice":
      return choiceRefusal(s, p, full, cx);
    case "set":
      return setRefusal(s, p, full);
    case "tally":
      return tallyRefusal(s, p, full, cx);
    case "blocks":
      return blocksRefusal(s, p);
  }
}

/** The value of the deal's flag, number or choice `id` on a board of `p`,
 * its default where `p` names none: a flag 1 for on, a choice its index. */
export function settingOf(deal: FillDeal, p: FillParams, id: string): number {
  const s = settingNamed(deal, id);
  switch (s.kind) {
    case "flag":
      return dealValue(p, id, flagDefault(s, p.w));
    case "number":
      return dealValue(p, id, s.default);
    case "choice":
      return choiceOf(s, p);
    default:
      throw new Error(`deal: setting ${id} is a ${s.kind}, not one value`);
  }
}

/** Whether the deal's flag `id` is on for a board of `p`. */
export const isOn = (deal: FillDeal, p: FillParams, id: string): boolean =>
  settingOf(deal, p, id) === 1;

/** The symmetry the choice `id` chooses on a board of `p`. */
export function symmetryOf(deal: FillDeal, p: FillParams, id: string): Symmetry {
  const s = settingNamed(deal, id);
  const sym = s.kind === "choice" ? s.choices[choiceOf(s, p)]?.symmetry : undefined;
  if (sym === undefined) throw new Error(`deal: setting ${id} chooses no symmetry`);
  return sym;
}

/** The symmetry the clues a deal of board `p` leaves keep: `none` where it
 * keeps none. */
export const symmetricOf = (deal: FillDeal, p: FillParams): Symmetry => {
  const s = deal.symmetric;
  if (s === undefined) return "none";
  return typeof s === "string" ? s : symmetryOf(deal, p, s.option);
};

/** The settings that are choices of a size, each a ruleset. */
export const sizeChoices = (deal: FillDeal): ChoiceSetting[] =>
  deal.settings.filter(
    (s): s is ChoiceSetting => s.kind === "choice" && s.gives === "size",
  );

/** The flags that give variations, in their order. */
export const variationFlags = (deal: FillDeal): FlagSetting[] =>
  deal.settings.filter(
    (s): s is FlagSetting => s.kind === "flag" && s.gives === "variation",
  );
