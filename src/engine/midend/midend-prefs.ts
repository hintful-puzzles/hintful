import type { Game } from "../contract/game.ts";
import type { ConfigDescription, ConfigValues } from "../contract/types.ts";
import { asChecked } from "./midend-params.ts";
import { RULES_OUT_PREF } from "./rules-out.ts";

/** The preference key of the solve timer, which the engine offers in every
 * game beside the game's own `prefs`. */
export const SHOW_TIMER_PREF = "show-timer";

/** What of a game its preferences are read with. */
type PrefsGame<Ui> = Pick<
  Game<unknown, unknown, unknown, Ui, unknown>,
  "prefs" | "rulesOut"
>;

/**
 * The player's preferences: the game's own, which live on its `Ui`, and the
 * engine's, which live here.
 */
export class Preferences<Ui> {
  constructor(private readonly game: PrefsGame<Ui>) {}

  /** Last-applied user preference values, keyed by pref `kw`. Retained
   * across new games / loads because the midend recreates `ui` (via
   * `newUi`) on every new board, which would otherwise reset prefs to
   * their `newUi` defaults; {@link applyTo} re-applies these onto each
   * fresh ui. Never serialized (the app persists prefs per-puzzle). */
  private values: ConfigValues = {};
  /** The `show-timer` preference. Every game has it, and it starts on: the
   * readout is small enough that a player who does not want it can switch it
   * off, where one who does would not know to look. */
  public showTimer = true;
  /** The {@link RULES_OUT_PREF} preference, off until the player asks for it:
   * marks they did not make are a surprise to one who has not. */
  public bringRuledOut = false;

  public config(): ConfigDescription {
    const items: ConfigDescription["items"] = {};
    for (const p of this.game.prefs ?? []) {
      items[p.kw] =
        p.type === "boolean"
          ? { type: "boolean", name: p.name }
          : { type: "choices", name: p.name, choicenames: p.choices };
    }
    const rulesOut = this.game.rulesOut;
    if (rulesOut) items[RULES_OUT_PREF] = { type: "boolean", name: rulesOut.name };
    items[SHOW_TIMER_PREF] = { type: "boolean", name: "Show timer" };
    return { items };
  }

  /** Current preference values read off `ui`: a boolean for a boolean item,
   * the selected zero-based index for a choices item. */
  public read(ui: Ui): ConfigValues {
    const values: ConfigValues = {};
    for (const p of this.game.prefs ?? []) {
      values[p.kw] = p.get(ui);
    }
    if (this.game.rulesOut) values[RULES_OUT_PREF] = this.bringRuledOut;
    values[SHOW_TIMER_PREF] = this.showTimer;
    return values;
  }

  /** Merge `values` into the retained set (the form may submit only the
   * changed keys). Whether they set the timer's preference. */
  public merge(values: ConfigValues): boolean {
    this.values = { ...this.values, ...values };
    // The engine's own preferences are read here and never reach `applyTo`.
    const showTimer = values[SHOW_TIMER_PREF];
    if (showTimer !== undefined) this.showTimer = asChecked(showTimer);
    const bring = values[RULES_OUT_PREF];
    if (bring !== undefined) this.bringRuledOut = asChecked(bring);
    return showTimer !== undefined;
  }

  /** Write the retained preference values onto `ui`, coercing each to its
   * item's type (the app form supplies a boolean for a checkbox and a
   * numeric index for a choice, but DB-loaded JSON or a legacy value may
   * arrive loosely typed). Applies only keys present, leaving the `newUi`
   * default for the rest. */
  public applyTo(ui: Ui): void {
    for (const p of this.game.prefs ?? []) {
      const v = this.values[p.kw];
      if (v === undefined) continue;
      if (p.type === "boolean") {
        p.set(ui, asChecked(v));
      } else {
        const n = Number(v);
        if (!Number.isNaN(n)) p.set(ui, n);
      }
    }
  }
}
