/** The sizes beyond the grid's that the params give (`play.sizes`), each
 * with a ruleset a value. */

import type { ParamConfigItem } from "../../contract/game.ts";
import { letters, num, type ParamsSegment } from "../../game-id/params-codec.ts";
import { RULESET_KW, rulesetItem } from "../../game-id/ruleset.ts";
import type { FillParams } from "../game-id.ts";

/** A size beyond the grid's that the params give (`play.sizes`): its letter
 * in the params, before the number, or its `letters`, one written bare a
 * value, `""` written as nothing (Seismic's Tectonic `T`); and the Custom
 * dialog's ruleset field, one ruleset a value from the size's `min` up. A
 * ruleset's `least` is the narrowest board it has an answer on. */
export type FillSetting = (
  | { readonly letter: string; readonly letters?: undefined }
  | { readonly letters: readonly string[]; readonly letter?: undefined }
) & {
  readonly size: string;
  readonly min: number;
  readonly rulesets: readonly {
    readonly name: string;
    readonly rule: string;
    readonly least?: number;
  }[];
};

/** The setting `s`'s ruleset on a board of `p`, by its index. */
const rulesetOf = (s: FillSetting, p: FillParams): number =>
  (p.sizes?.[s.size] ?? s.min) - s.min;

/** Each ruleset's narrowest board, said beside the size: a sentence after
 * the size's doc, or nothing. */
export function leastWords(settings: readonly FillSetting[]): string {
  const leasts = settings.flatMap((s) =>
    s.rulesets.flatMap((r) =>
      r.least === undefined ? [] : [`${r.least} with ${r.name}`],
    ),
  );
  return leasts.length === 0
    ? ""
    : ` It must be at least ${leasts.slice(0, -1).join(", ")}${leasts.length > 1 ? " and " : ""}${leasts.at(-1)}.`;
}

/** The Custom dialog's ruleset field for setting `s`. */
export const settingItem = (s: FillSetting): ParamConfigItem<FillParams> =>
  rulesetItem<FillParams>(s.rulesets, {
    get: (p) => rulesetOf(s, p),
    set: (p, index) => {
      p.sizes = { ...p.sizes, [s.size]: s.min + index };
    },
  });

/** A size the params give, written as the number itself after its letter,
 * or as its ruleset's bare letter (the ruleset field's). */
export const settingSegment = (
  config: readonly ParamConfigItem<FillParams>[],
  s: FillSetting,
): ParamsSegment<FillParams> =>
  s.letters === undefined
    ? num(config, s.letter, {
        get: (p) => p.sizes?.[s.size] ?? s.min,
        set: (p, v) => {
          p.sizes = { ...p.sizes, [s.size]: v };
        },
      })
    : letters(config, RULESET_KW, s.letters);

/** Why board `p` has no ruleset of setting `s`, or one too narrow, or
 * `null`. */
export function settingRefusal(
  s: FillSetting,
  p: FillParams,
  square: boolean,
): string | null {
  const ruleset = s.rulesets[rulesetOf(s, p)];
  if (ruleset === undefined) return "There is no such game mode.";
  if (ruleset.least !== undefined && Math.min(p.w, p.h) < ruleset.least)
    return square
      ? `${ruleset.name}: the grid size must be at least ${ruleset.least}.`
      : `${ruleset.name}: width and height must both be at least ${ruleset.least}.`;
  return null;
}
