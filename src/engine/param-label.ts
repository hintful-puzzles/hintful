/**
 * The one way a set of params is named for a player: the preset menu's
 * titles, the type header of a custom game, and anywhere else a board's
 * params are shown as words.
 *
 * A label is composed from the `paramConfig` items, each of which says which
 * slot its words fill (`ParamLabel`), behind the name of the game's ruleset if
 * it has them (`ruleset.ts`):
 *
 * ```
 *   [ruleset: ]size[ kind…][ tier][, tail…]
 *   Seismic: 7x7        Easy
 *            10x10 Squares Normal
 *            6x6          Normal, identity hidden
 * ```
 *
 * The order of the slots is a convention every game shares: a player reading
 * the Type menu of one game has learned where the tier is in all of them. The
 * words are each game's, and a field whose words are `null` is left out, which
 * is how a default goes unsaid.
 */

import type { ParamConfigItem, ParamLabel, PresetMenu } from "./game.ts";
import { rulesetField } from "./ruleset.ts";

type Slot = ParamLabel<unknown>["slot"];

/** The words `item` contributes to a label of `p`, if any. */
function wordsOf<P>(item: ParamConfigItem<P>, p: P): string | null {
  const label = item.label;
  if (!label) return null;
  if (label.words) return label.words(p);
  if (item.type === "choices") return item.choices[item.get(p)] ?? null;
  if (item.type === "string") return item.get(p);
  return null;
}

/**
 * What choice `index` of the choices field `kw` is called: the one name a menu
 * section's title and a help page's `{{choice:kw:index}}` both say, so neither
 * is a typed copy of the dialog's.
 */
export function choiceName<P>(
  config: readonly ParamConfigItem<P>[],
  kw: string,
  index: number,
): string {
  const item = config.find((i) => i.kw === kw);
  if (item?.type !== "choices") throw new Error(`no choices field "${kw}"`);
  const name = item.choices[index] ?? null;
  if (name === null) throw new Error(`"${kw}" has no choice ${index}`);
  return name;
}

/** The label of params `p`, composed from the game's `paramConfig`. */
export function describeParams<P>(
  game: { paramConfig?: readonly ParamConfigItem<P>[] },
  p: P,
): string {
  const slots: Record<Slot, string[]> = {
    size: [],
    kind: [],
    tier: [],
    tail: [],
  };
  for (const item of game.paramConfig ?? []) {
    const words = wordsOf(item, p);
    if (item.label && words) slots[item.label.slot].push(words);
  }
  const body = [...slots.size, ...slots.kind, ...slots.tier].join(" ");
  const tails = slots.tail.join(", ");
  const main = body && tails ? `${body}, ${tails}` : body || tails;
  const ruleset = rulesetField(game);
  return ruleset ? `${ruleset.choices[ruleset.get(p)]}: ${main}` : main;
}

/** A preset menu with every leaf titled. */
export interface TitledPresetMenu<P> {
  title: string;
  params?: P;
  submenu?: TitledPresetMenu<P>[];
}

/**
 * The game's preset menu with each leaf titled: its own name where upstream
 * gave it one, and its params' label otherwise. What the app's Type menu shows,
 * and what a test reading a title should read.
 */
export function presetMenu<P>(game: {
  paramConfig?: readonly ParamConfigItem<P>[];
  presets(): PresetMenu<P>;
}): TitledPresetMenu<P> {
  const walk = (menu: PresetMenu<P>): TitledPresetMenu<P> => {
    if (menu.submenu)
      return { title: menu.title ?? "", submenu: menu.submenu.map(walk) };
    const params = menu.params as P;
    return { title: menu.title ?? describeParams(game, params), params };
  };
  return byRuleset(game, walk(game.presets()));
}

/**
 * `menu` with a section for each ruleset its presets hold, in the field's
 * order and under the ruleset's name, so two puzzles' boards are never one
 * list. The game writes its presets flat: a section of its own could mix them.
 */
function byRuleset<P>(
  game: { paramConfig?: readonly ParamConfigItem<P>[] },
  menu: TitledPresetMenu<P>,
): TitledPresetMenu<P> {
  const item = rulesetField(game);
  const leaves = menu.submenu ?? [];
  if (item === null) return menu;
  if (leaves.some((m) => m.submenu))
    throw new Error("a game with a ruleset lists its presets flat");
  const sections = item.choices
    .map((title, i) => ({
      title,
      submenu: leaves.filter((m) => item.get(m.params as P) === i),
    }))
    .filter((s) => s.submenu.length > 0);
  return sections.length > 1 ? { ...menu, submenu: sections } : menu;
}
