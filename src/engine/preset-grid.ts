/**
 * The preset menu, built from the boards a game names (`Game.menu`).
 *
 * A menu is a grid: each board at every tier, in the order the game lists the
 * boards, so a player who wants a small hard board or a large easy one finds
 * it without opening the Custom dialog. After the grid comes one board for
 * each thing that is neither a size nor a tier: a rule modifier, another
 * kind of board. A game with rulesets lists every ruleset's boards together
 * and `presetMenu` gives each a section.
 *
 * `preset-menu-shape.test.ts` holds every game's menu to this shape.
 */

import { difficultyChoiceItem, withTier } from "./difficulty.ts";
import type { ParamConfigItem, PresetBoards, PresetMenu } from "./game.ts";

/** The most lines one section of a menu holds. */
export const MENU_SECTION_LINES = 12;

/** The most lines a whole menu holds, however many sections it has. */
export const MENU_LINES = 18;

/**
 * The menu of `menu.boards`, each at every tier of the game's difficulty item
 * (or as it stands, in a game without tiers), followed by `menu.variants` and
 * then the section of `menu.more`.
 */
export function presetGrid<P>(
  paramConfig: readonly ParamConfigItem<P>[],
  menu: PresetBoards<P>,
): PresetMenu<P> {
  const game = { paramConfig };
  const tierCount = difficultyChoiceItem(game)?.choices.length ?? 0;
  const grid = menu.boards.flatMap((board) => {
    if (tierCount === 0) return [{ ...board }];
    const [first, last] = menu.tiers?.(board) ?? [0, tierCount - 1];
    const row: P[] = [];
    for (let tier = first; tier <= last; tier++) row.push(withTier(game, board, tier));
    return row;
  });
  const line = (params: P): PresetMenu<P> => {
    const title = menu.title?.(params) ?? null;
    return title === null ? { params } : { title, params };
  };
  const lines = [...grid, ...(menu.variants ?? []).map((p) => ({ ...p }))].map(line);
  if (menu.more === undefined) return { submenu: lines };
  const more = { title: "More...", submenu: menu.more.map((p) => line({ ...p })) };
  return { submenu: [...lines, more] };
}
