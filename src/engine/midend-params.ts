import { fieldLabel, type Game } from "./game.ts";
import { configNarrowing, onlyError } from "./only.ts";
import { describeParams, presetMenu, type TitledPresetMenu } from "./param-label.ts";
import { paramsError, UnreadableParams } from "./params.ts";
import type {
  ConfigDescription,
  ConfigValues,
  CustomParamsEncoding,
  PresetMenuEntry,
  Size,
} from "./types.ts";

/** A checkbox's value as a config form submits it. */
export const asChecked = (v: unknown): boolean => v === true || v === "true" || v === 1;

/** What of a game its params are read with, none of it about a board. */
type AnyGame<Params> = Pick<
  Game<Params, unknown, unknown, unknown, unknown>,
  | "defaultParams"
  | "encodeParams"
  | "decodeParams"
  | "transposeParams"
  | "computeSize"
  | "paramConfig"
  | "menu"
  | "validateParams"
>;

/** The largest integer tile size at which a board with `params` fits
 * `maxSize`: upstream midend_size's binary search, in its `user_size` form,
 * where the tile may exceed the game's preferred size to fill the slot. */
export function largestTile<Params>(
  game: AnyGame<Params>,
  params: Params,
  maxSize: Size,
): number {
  const fits = (ts: number): boolean => {
    const s = game.computeSize(params, ts);
    return s.w <= maxSize.w && s.h <= maxSize.h;
  };
  let hi = 1;
  do {
    hi *= 2;
  } while (fits(hi));
  let lo = 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

/**
 * The params the next New game deals at: what `setParams` and the custom
 * dialog change, and what `getParams` reports. Upstream `me->params`. The
 * board on screen has params of its own, which the midend keeps.
 */
export class ChosenParams<Params> {
  public params: Params;

  constructor(private readonly game: AnyGame<Params>) {
    this.params = game.defaultParams();
  }

  public encoded(): string {
    return this.game.encodeParams(this.params, true);
  }

  /** Choose the params `params` encodes; why they cannot be, or `null`. */
  public set(params: string): string | null {
    let decoded: Params;
    try {
      decoded = this.game.decodeParams(params);
    } catch (e) {
      return e instanceof UnreadableParams
        ? e.message
        : `These parameters can't be read (${(e as Error).message}).`;
    }
    const err = paramsError(this.game, decoded, true);
    if (err) return err;
    this.params = decoded;
    return null;
  }

  public describe(params: string): string {
    return describeParams(this.game, this.game.decodeParams(params));
  }

  /** The params `params` encodes, turned on their side, or `null` for a game
   * that does not turn or params that do not read. */
  public turn(params: string): string | null {
    let decoded: Params;
    try {
      decoded = this.game.decodeParams(params);
    } catch {
      return null;
    }
    const turned = this.game.transposeParams?.(decoded) ?? null;
    return turned === null ? null : this.game.encodeParams(turned, true);
  }

  /** The chosen params, or the same board turned on its side when that draws
   * at a larger tile in `area`. Decided at deal time only: `params` keeps
   * the orientation the player chose, so the next deal on a screen held the
   * other way round turns back. A tie keeps the chosen orientation, which is
   * what leaves a square board alone. A size the game would refuse to deal is
   * never turned to: a bound may hold on one of width and height alone. */
  public toFit(area: Size): Params {
    const turned = this.game.transposeParams?.(this.params) ?? null;
    if (turned === null || paramsError(this.game, turned, true) !== null)
      return this.params;
    return largestTile(this.game, turned, area) >
      largestTile(this.game, this.params, area)
      ? turned
      : this.params;
  }

  public presets(): PresetMenuEntry[] {
    const walk = (menu: TitledPresetMenu<Params>): PresetMenuEntry => {
      if (menu.submenu) {
        return { title: menu.title, params: "", submenu: menu.submenu.map(walk) };
      }
      return {
        title: menu.title,
        label: menu.label ?? menu.title,
        params: menu.params ? this.game.encodeParams(menu.params, true) : "",
      };
    };
    const root = walk(presetMenu(this.game));
    return root.submenu ?? [root];
  }

  // --- custom params ----------------------------------------------

  public customConfig(): ConfigDescription {
    const items: ConfigDescription["items"] = {};
    for (const item of this.game.paramConfig) {
      items[item.kw] =
        item.type === "boolean"
          ? { type: "boolean", name: item.name }
          : item.type === "choices"
            ? { type: "choices", name: item.name, choicenames: item.choices }
            : { type: "string", name: fieldLabel(item) };
    }
    const narrowing = configNarrowing(this.game.paramConfig);
    return narrowing.length > 0 ? { items, narrowing } : { items };
  }

  /** Current custom-params values read off the chosen params, turned as
   * `board` was dealt: a string for a text field, a boolean for a checkbox,
   * the selected zero-based index for a choices item. */
  public customValues(board: Params): ConfigValues {
    const values: ConfigValues = {};
    const shown = this.asDealt(board);
    for (const item of this.game.paramConfig) {
      values[item.kw] = item.get(shown);
    }
    return values;
  }

  /** The chosen params, turned the way `board` was dealt, so the dialog shows
   * the size the player is looking at. Derived by comparing encodings rather
   * than remembered, so no path that deals or loads a board can leave it
   * stale. */
  private asDealt(board: Params): Params {
    const turned = this.game.transposeParams?.(this.params) ?? null;
    if (turned === null) return this.params;
    const dealt = this.game.encodeParams(board, true);
    const dealtTurned =
      this.game.encodeParams(turned, true) === dealt &&
      this.game.encodeParams(this.params, true) !== dealt;
    return dealtTurned ? turned : this.params;
  }

  /** Map submitted form `values` onto a *copy* of the chosen params (never
   * the live params, so a rejected edit leaves the running game untouched),
   * coercing each to its item's type exactly as preferences are. Only keys
   * the form actually submitted are applied; the rest keep their current
   * value. */
  private fromCustomValues(values: ConfigValues): Params {
    const draft = structuredClone(this.params);
    for (const item of this.game.paramConfig) {
      const v = values[item.kw];
      if (v === undefined) continue;
      if (item.type === "boolean") {
        item.set(draft, asChecked(v));
      } else if (item.type === "choices") {
        const n = Number(v);
        if (!Number.isNaN(n)) item.set(draft, n);
      } else {
        item.set(draft, String(v));
      }
    }
    return draft;
  }

  /**
   * Why the form's `values` cannot be played, or `null`: the `draft` they
   * make, and before it the values as submitted against what the deciding
   * fields leave (`only.ts`). A game may hold two fields in one of its params (Ascent's
   * ruleset and grid type), where a pair it has no value for never reaches the
   * draft, so the draft alone would pass it.
   */
  private customValuesError(values: ConfigValues, draft: Params): string | null {
    const submitted = onlyError(this.game.paramConfig, (item) => {
      const v = values[item.kw] ?? item.get(this.params);
      return item.type === "boolean" ? asChecked(v) : v;
    });
    return submitted ?? paramsError(this.game, draft, true);
  }

  /** Choose the params the custom form's `values` make; why they cannot be,
   * or `null`. A game with no custom form changes nothing. */
  public setCustom(values: ConfigValues): string | null {
    if (this.game.paramConfig.length === 0) return null;
    const draft = this.fromCustomValues(values);
    const err = this.customValuesError(values, draft);
    if (err) return err;
    this.params = draft;
    return null;
  }

  public encodeCustom(values: ConfigValues): CustomParamsEncoding {
    if (this.game.paramConfig.length === 0) {
      return { ok: true, params: this.encoded() };
    }
    const draft = this.fromCustomValues(values);
    const error = this.customValuesError(values, draft);
    if (error) return { ok: false, error };
    return { ok: true, params: this.game.encodeParams(draft, true) };
  }
}
