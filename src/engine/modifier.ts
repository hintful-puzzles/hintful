/**
 * A game's **rule modifiers**: settings that add, remove or bound one rule and
 * hold together with each other, as Solo's X, Jigsaw and Killer do. (Settings
 * that exclude each other are rulesets, `ruleset.ts`.)
 *
 * A game declares one with {@link modifierItem} in its `paramConfig`, and the
 * field's help entry, its words in a params label and its line of the help
 * page's list of modifiers are built from that, so a rule a setting changes is
 * stated once and a title's word for it is the word the help explains.
 */

import type { ParamConfigItem, ParamLabel } from "./game.ts";

/** What a modifier item carries beside its dialog field. */
export interface Modifier {
  /** What a title and the help call a board the rule applies to: "wrapping",
   * "no loops", "Killer". */
  readonly words: string;
  /** The rule, as its line of the help's list says it after the words
   * (markdown, starting lower-case, ending in a full stop). */
  readonly rule: string;
  /** For a checkbox, the value at which the rule applies. A choice bounds its
   * rule at every value and has none. */
  readonly when?: boolean;
}

type Slot = ParamLabel<unknown>["slot"];

interface ModifierCommon {
  kw: string;
  name: string;
  words: string;
  rule: string;
  /** What else the field's help entry says: a size the rule needs, a limit it
   * brings. */
  note?: string;
}

/** A checkbox whose rule applies at one of its two values. */
type CheckboxModifier<P> = ModifierCommon & {
  type: "boolean";
  /** The value at which the rule applies. The other is the plain game. */
  when: boolean;
  /** Where the words go in a params label, or `null` when another field's
   * words already say them. */
  slot: Slot | null;
  get(p: P): boolean;
  set(p: P, value: boolean): void;
};

/** A choice that bounds a rule at every value, with label words of its own. */
type ChoiceModifier<P> = ModifierCommon & {
  type: "choices";
  choices: string[];
  label: ParamLabel<P>;
  get(p: P): number;
  set(p: P, value: number): void;
};

export const MODIFIERS_PLACEHOLDER = "{{modifiers}}";

const capitalized = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The Custom dialog's field for a rule modifier. */
export function modifierItem<P>(
  spec: CheckboxModifier<P> | ChoiceModifier<P>,
): ParamConfigItem<P> {
  const { kw, name, words, rule } = spec;
  const modifier: Modifier = { words, rule };
  const note = spec.note ? ` ${spec.note}` : "";
  if (spec.type === "choices") {
    return {
      kw,
      name,
      type: "choices",
      choices: spec.choices,
      modifier,
      doc: `${capitalized(rule)}${note}`,
      label: spec.label,
      get: spec.get,
      set: spec.set,
    };
  }
  const { when, slot } = spec;
  return {
    kw,
    name,
    type: "boolean",
    modifier: { ...modifier, when },
    doc: `When ${when ? "on" : "off"}, ${rule}${note}`,
    ...(slot === null
      ? {}
      : { label: { slot, words: (p: P) => (spec.get(p) === when ? words : null) } }),
    get: spec.get,
    set: spec.set,
  };
}

/** The game's modifiers, in dialog order. */
export function modifiersOf<P>(game: {
  paramConfig?: readonly ParamConfigItem<P>[];
}): Modifier[] {
  return (game.paramConfig ?? []).flatMap((i) => (i.modifier ? [i.modifier] : []));
}

/** The help page's list of modifiers, one line each: what a page's
 * {@link MODIFIERS_PLACEHOLDER} becomes. */
export function modifiersMarkdown(modifiers: readonly Modifier[]): string {
  return modifiers.map((m) => `* **${capitalized(m.words)}**: ${m.rule}`).join("\n");
}
