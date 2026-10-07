/**
 * A game's **rulesets**: the different puzzles it plays on one board, as
 * Seismic's Tectonic is. A game that has them declares them once, with
 * {@link rulesetItem} in its `paramConfig`, and the Custom dialog's field, the
 * word in front of a params label, the Type menu's sections and the help
 * page's list of rules are all built from that.
 *
 * A field that only changes the board's shape or look is not a ruleset.
 */

import type { ParamConfigItem } from "./game.ts";
import type { OnlyOf } from "./only.ts";

/** One puzzle a game plays. */
export interface Ruleset {
  /** What a player picks it by, everywhere it is named. */
  readonly name: string;
  /** The rule that sets it apart, as its line of the help page's list says it
   * (markdown, after "Name: "). */
  readonly rule: string;
  /**
   * The settings this puzzle does not take whole, by the field's `kw`: the
   * choices it offers of a choices field, by index, or the one value a
   * checkbox has in it. A field left out is taken as it stands. From this the
   * engine builds what the Custom dialog offers while the ruleset is chosen,
   * the refusal of a params set that asks for anything else, and the sentence
   * in the field's help entry (`only.ts`).
   */
  readonly only?: OnlyOf;
}

type ChoicesItem<P> = Extract<ParamConfigItem<P>, { type: "choices" }>;

/** The params key holding a ruleset's index directly. */
type IndexKey<P> = {
  [K in keyof P]-?: P[K] extends number ? K : never;
}[keyof P];

/** The keyword of every ruleset field, which is how the engine finds one. */
export const RULESET_KW = "ruleset";

export const RULESETS_PLACEHOLDER = "{{rulesets}}";

/**
 * The Custom dialog's ruleset field: `kw: "ruleset"`, labeled "Game mode" and
 * offering each ruleset by name. `field` is the params key holding the index,
 * or accessors for a game that stores a word there.
 */
export function rulesetItem<P>(
  rulesets: readonly Ruleset[],
  field: IndexKey<P> | { get(p: P): number; set(p: P, index: number): void },
): ParamConfigItem<P> {
  const access =
    typeof field === "object"
      ? field
      : {
          get: (p: P) => p[field] as number,
          set: (p: P, index: number) => {
            (p as Record<IndexKey<P>, number>)[field] = index;
          },
        };
  const names = rulesets.map((r) => r.name);
  return {
    kw: RULESET_KW,
    name: "Game mode",
    type: "choices",
    choices: names,
    rulesets,
    doc: `Which puzzle to play: ${names.slice(0, -1).join(", ")} or ${names.at(-1)}. The rules of each are at the top of this page.`,
    get: access.get,
    set: access.set,
  };
}

/** The game's {@link rulesetItem}, or `null` for a game with one puzzle. */
export function rulesetField<P>(game: {
  paramConfig?: readonly ParamConfigItem<P>[];
}): (ChoicesItem<P> & { rulesets: readonly Ruleset[] }) | null {
  const item = game.paramConfig?.find((i) => i.kw === RULESET_KW);
  if (item?.type !== "choices" || !item.rulesets) return null;
  return { ...item, rulesets: item.rulesets };
}

/** The help page's list of rulesets, one line each: what a page's
 * {@link RULESETS_PLACEHOLDER} becomes. */
export function rulesetsMarkdown(rulesets: readonly Ruleset[]): string {
  return rulesets.map((r) => `* ${r.name}: ${r.rule}`).join("\n");
}
