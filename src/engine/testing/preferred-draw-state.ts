/**
 * The draw state a freshly dealt board is built with, for a test that calls
 * `interpretMove` or `redraw` directly.
 *
 * The midend builds a draw state at the tile size on screen, and before any
 * resize that is the game's preferred one. This spells the midend's default
 * (`?? 32`) once, rather than in every test; a test that needs a specific tile
 * size calls `game.newDrawState(state, tileSize)` itself.
 */

import type { Game } from "../game.ts";

export function preferredDrawState<Params, State, Move, Ui, DrawState>(
  game: Game<Params, State, Move, Ui, DrawState>,
  state: State,
): DrawState {
  return game.newDrawState(state, game.preferredTileSize ?? 32);
}
