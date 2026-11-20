/**
 * **The palette slots the engine fills for every game**: the roles every
 * board paints with the same color, so no game writes them.
 *
 * A game's own colors are numbered from {@link FIRST_GAME_SLOT}, and its
 * `colors()` starts from {@link rolePalette}. A game that paints a role in
 * another color (a cursor that is a wash, because green is spent) keeps a
 * slot of its own for it, under its own name, and says why.
 */

import type { Color } from "../contract/types.ts";
import { CURSOR, ERROR, FLASH, FLASH_LEAD, HINT_OUTLINE } from "./palette.ts";

/** The board: the host's background, which the midend lays on a fresh frame. */
export const COL_BACKGROUND = 0;
/** The body of the win flash (`winSlot`). */
export const COL_FLASH = 1;
/** The leading edge of the win flash (`winSlot`). */
export const COL_FLASH_LEAD = 2;
/** The outline round the cells a hint step reasons from. */
export const COL_HINT_OUTLINE = 3;
/** Something is wrong: a broken rule, or a cell Check & Save found wrong. */
export const COL_ERROR = 4;
/** The keyboard cursor. */
export const COL_CURSOR = 5;
/** The first slot a game numbers its own colors from. */
export const FIRST_GAME_SLOT = 6;

/** The roles' colors on a board of `background`, slot by slot: what a
 * game's `colors()` adds its own to. */
export function rolePalette(background: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = background;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_HINT_OUTLINE] = HINT_OUTLINE;
  out[COL_ERROR] = ERROR;
  out[COL_CURSOR] = CURSOR;
  return out;
}
