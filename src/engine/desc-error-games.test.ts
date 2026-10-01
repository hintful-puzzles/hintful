/*
 * A malformed game ID is refused, never thrown.
 *
 * The Enter Game ID dialog shows what `validateDesc` returns, and a player
 * types whatever they type. A throw there is an unhandled rejection in the
 * worker rather than a sentence, so every game is fed a few descriptions no
 * generator writes and must answer each one.
 *
 * Every game must refuse at least one of them: a `validateDesc` that accepted
 * all of these would be accepting everything, and would pass the no-throw half
 * by checking nothing.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import type { Game } from "./game.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";

beforeAll(registerAllGames);

type AnyGame = Game<unknown, unknown, unknown, unknown, unknown>;

const MALFORMED = ["", "!", "~,~,~", "_", "9".repeat(4000), "z".repeat(4000)];

describe("a malformed game ID", () => {
  it("is refused by every game, never thrown", () => {
    const ids = registeredGameIds();
    // Vacuity: how many games did we look at?
    expect(ids.length).toBeGreaterThanOrEqual(50);

    const threw: string[] = [];
    const acceptsAll: string[] = [];
    for (const id of ids) {
      const game = getTsGame(id) as AnyGame | undefined;
      if (!game) throw new Error(`${id} is registered but has no game object`);
      const params = game.defaultParams();
      let refused = 0;
      for (const desc of MALFORMED) {
        try {
          if (game.validateDesc(params, desc) !== null) refused++;
        } catch (e) {
          threw.push(`${id} on ${JSON.stringify(desc.slice(0, 12))}: ${e}`);
        }
      }
      if (refused === 0) acceptsAll.push(id);
    }
    expect(threw).toEqual([]);
    expect(acceptsAll).toEqual([]);
  });
});
