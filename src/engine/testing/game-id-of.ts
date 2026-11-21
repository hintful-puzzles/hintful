/**
 * The game ID the app shows for a board, from its game, its params and a seed
 * or a desc: what a pin in a cross-game guard is written as
 * (`npm run game-id`, `scripts/game-id.ts`).
 *
 * It loads the board through the midend, as the Enter-game-ID dialog does,
 * and returns the ID the midend announces, so the params come out in their
 * full encoding, tier included, and a desc the game refuses is refused here
 * in the game's own words. A seed deals as the app deals a `#seed` ID; the
 * board it deals is the generator's of today, which is why a pin is the
 * desc and never the seed.
 *
 * Dev/test-only; never imported by production code.
 */
import "../../games/index.ts";
import { Midend } from "../midend/midend.ts";
import { getTsGame, registeredGameIds } from "../midend/registry.ts";

export type GameIdResult = { ok: true; id: string } | { ok: false; error: string };

/** The ID of `game`'s board at `params` (its default where `null`), dealt
 * from `board.seed` or read from `board.desc`. */
export function gameIdOf(
  game: string,
  params: string | null,
  board: { seed: string } | { desc: string },
): GameIdResult {
  const found = getTsGame(game);
  if (found === null)
    return {
      ok: false,
      error: `no game "${game}"; the games are ${registeredGameIds().sort().join(", ")}`,
    };
  const m = new Midend(found);
  let announced: string | null = null;
  m.setCallbacks(
    (message) => {
      if (message.type === "game-id-change") announced = message.currentGameId;
    },
    () => {},
  );
  const encoded = params ?? found.encodeParams(found.defaultParams(), true);
  const id = "seed" in board ? `${encoded}#${board.seed}` : `${encoded}:${board.desc}`;
  const error = m.newGameFromId(id);
  if (error !== null) return { ok: false, error: `${id}: ${error}` };
  if (announced === null)
    return { ok: false, error: `${id}: the midend announced no ID` };
  return { ok: true, id: announced };
}
