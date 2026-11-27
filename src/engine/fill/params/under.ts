/** A deal statement that holds on a board of one variation or ruleset,
 * named in the description and resolved by the compiler. */

import type { FillDeal, FillParams } from "../game-id.ts";
import { settingOf } from "./settings.ts";

/** A variation on, by its name, or a ruleset, by its setting and the index
 * of its choice. */
export type Under =
  | { readonly with: string }
  | { readonly ruleset: { readonly setting: string; readonly choice: number } };

/** Whether a board of `p`, with `variations` on, is under `u`. */
export function isUnder(
  deal: FillDeal,
  p: FillParams,
  variations: readonly string[],
  u: Under,
): boolean {
  return "with" in u
    ? variations.includes(u.with)
    : settingOf(deal, p, u.ruleset.setting) === u.ruleset.choice;
}
