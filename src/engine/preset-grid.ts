/**
 * The conventional preset menu, built from the boards a game names.
 *
 * A menu is a grid: each board at every tier, in the order the game lists the
 * boards, so a player who wants a small hard board or a large easy one finds
 * it without opening the Custom dialog. After the grid comes one board for
 * each thing that is neither a size nor a tier: a rule modifier, another
 * kind of board. A game with rulesets lists every ruleset's boards together
 * and `presetMenu` gives each a section.
 *
 * `preset-menu-shape.test.ts` holds every game's menu to this shape, however
 * the game builds it.
 */

import { difficultyChoiceItem, withTier } from "./difficulty.ts";
import type { ParamConfigItem, PresetMenu } from "./game.ts";

/** The most lines one section of a menu holds. */
export const MENU_SECTION_LINES = 12;

/** The most lines a whole menu holds, however many sections it has. */
export const MENU_LINES = 18;

interface PresetGridOptions<P> {
  /**
   * The first and last tier a board is offered at, for a board the game does
   * not offer at every tier. The reason belongs at the function: a deal that
   * takes seconds, a tier with nothing to deduce at that size.
   */
  tiers?(board: P): readonly [first: number, last: number] | null;
  /** The boards after the grid, one for each modifier or kind. */
  variants?: readonly P[];
}

/**
 * The menu of `boards`, each at every tier of the game's difficulty item (or
 * as it stands, in a game without tiers), followed by `opts.variants`.
 */
export function presetGrid<P>(
  paramConfig: readonly ParamConfigItem<P>[],
  boards: readonly P[],
  opts: PresetGridOptions<P> = {},
): PresetMenu<P> {
  const game = { paramConfig };
  const tierCount = difficultyChoiceItem(game)?.choices.length ?? 0;
  const grid = boards.flatMap((board) => {
    if (tierCount === 0) return [{ ...board }];
    const [first, last] = opts.tiers?.(board) ?? [0, tierCount - 1];
    const row: P[] = [];
    for (let tier = first; tier <= last; tier++) row.push(withTier(game, board, tier));
    return row;
  });
  const variants = (opts.variants ?? []).map((p) => ({ ...p }));
  return { submenu: [...grid, ...variants].map((params) => ({ params })) };
}
