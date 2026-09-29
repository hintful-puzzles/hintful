/**
 * The one way a set of params is named for a player: the preset menu's
 * titles, the type header of a custom game, and anywhere else a board's
 * params are shown as words.
 *
 * A label is composed from the `paramConfig` items, each of which says which
 * slot its words fill (`ParamLabel`):
 *
 * ```
 *   [lead: ]size[ kind…][ tier][, tail…]
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

/** The label of params `p`, composed from the game's `paramConfig`. */
export function describeParams<P>(
  game: { paramConfig?: readonly ParamConfigItem<P>[] },
  p: P,
): string {
  const slots: Record<Slot, string[]> = {
    lead: [],
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
  return slots.lead.length ? `${slots.lead.join(" ")}: ${main}` : main;
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
  return walk(game.presets());
}
