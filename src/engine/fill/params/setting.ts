/**
 * What a kind of setting is: a setting the params give (`settings:` in a
 * description), its Custom fields, its place in the params, the boards it
 * refuses, and the value a preset board starts it at. A kind is one module
 * of this folder and one line of `settings.ts`' registry.
 */

import type { ParamConfigItem } from "../../contract/game.ts";
import type { ParamsSegment } from "../../game-id/params-codec.ts";
import type { FillDeal, FillParams } from "../game-id.ts";

/** What every setting has: its name, which a deal key that reads it names
 * and a board's variations or sizes hold where it gives one, and where the
 * params write it, after the size or after the tier. */
export interface SettingBase {
  readonly id: string;
  readonly after?: "tier";
}

/** A setting's Custom field. */
export interface SettingField {
  readonly kw: string;
  readonly name: string;
  readonly doc: string;
}

/** What a kind reads beside its setting. */
export interface SettingContext {
  readonly deal: FillDeal;
  readonly tiers: readonly string[];
  /** The value setting `id` has on a board of `p`'s size unless it says
   * otherwise: a preset's own, else the setting's default. A board's name
   * says a setting only where it differs. */
  usual(p: FillParams, id: string): number;
}

/** A preset board, as the settings start from it: its size, and the sizes,
 * deal settings and tally it names. */
export interface PresetSettings {
  readonly sizes?: Readonly<Record<string, number>>;
  readonly settings?: Readonly<Record<string, number>>;
  readonly tally?: number;
}

/** A kind of setting, `S` its entry in the deal's `settings`. */
export interface SettingKind<S> {
  /** Its Custom fields, in the dialog's order. */
  items(s: S, cx: SettingContext): ParamConfigItem<FillParams>[];
  /** Its segments of the params, where it stands, and any written last of
   * all (a tally's counts). */
  segments(
    s: S,
    config: readonly ParamConfigItem<FillParams>[],
    cx: SettingContext,
  ): {
    readonly here: ParamsSegment<FillParams>[];
    readonly last?: ParamsSegment<FillParams>;
  };
  /** Sets it on `p`, a preset board's params, as `board` names it, or at its
   * default. */
  start(s: S, p: FillParams, board: PresetSettings): void;
}

/** The deal setting `id`'s value on `p`, `fallback` where `p` names none. */
export const dealValue = (p: FillParams, id: string, fallback: number): number =>
  p.settings?.[id] ?? fallback;

/** Sets the deal setting `id` of `p` to `v`. */
export function setDealValue(p: FillParams, id: string, v: number): void {
  p.settings = { ...p.settings, [id]: v };
}
