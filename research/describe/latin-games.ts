/** The games built on `src/engine/latin.ts`, and the boards their preset
 * menus offer, for the runs that compare the compiled ladder with the
 * hand-written one. */
import type { Game, PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { groupGame } from "../../src/games/group/index.ts";
import { keenGame } from "../../src/games/keen/index.ts";
import { mathraxGame } from "../../src/games/mathrax/index.ts";
import { saladGame } from "../../src/games/salad/index.ts";
import { towersGame } from "../../src/games/towers/index.ts";
import { unequalGame } from "../../src/games/unequal/index.ts";

// biome-ignore lint/suspicious/noExplicitAny: a walk over any Latin game.
export type AnyGame = Game<any, any, any, any, any, any>;

export const LATIN_GAMES: [string, AnyGame][] = [
  ["unequal", unequalGame as AnyGame],
  ["towers", towersGame as AnyGame],
  ["keen", keenGame as AnyGame],
  ["group", groupGame as AnyGame],
  ["mathrax", mathraxGame as AnyGame],
  ["salad", saladGame as AnyGame],
];

export function presetParams(game: AnyGame): unknown[] {
  const out: unknown[] = [];
  const walk = (menu: PresetMenu<unknown>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(game));
  return out;
}
