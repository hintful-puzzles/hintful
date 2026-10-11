/**
 * **The key decides which way a modified arrow acts**, swept through the real
 * registry and a real `Midend`, so a game is covered the day it is registered.
 *
 * Shift or Ctrl with an arrow is a gesture of the game's own, and what it does
 * differs from game to game. What none may do is answer an arrow and its
 * opposite alike: that is a game reading the direction off something other
 * than the key, and it shows only where the cursor cannot follow the key,
 * which no test pressing from the first column finds.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { builtGames } from "./testing/enrollment.ts";
import {
  CURSOR_CAP,
  type ModifierArrows,
  modifierArrows,
} from "./testing/input-probe.ts";

beforeAll(registerAllGames);

describe("the key decides which way a modified arrow acts", () => {
  const answers = new Map<string, ModifierArrows>();
  beforeAll(() => {
    for (const { id, game } of builtGames()) answers.set(id, modifierArrows(game, id));
  });
  // A game takes a modified arrow by one changing its board: no list is kept.
  const takers = () => [...answers].filter(([, r]) => r.acted > 0);

  it("sweeps a non-trivial population, and walks every cursor to the end", () => {
    expect(answers.size).toBeGreaterThanOrEqual(57);
    const capped = [...answers]
      .filter(([, r]) => r.positions >= CURSOR_CAP)
      .map(([id]) => id);
    expect(capped).toEqual([]);
  });

  it("finds the games that take a modified arrow", () => {
    const ids = takers().map(([id]) => id);
    // Sixteen is the game this was first seen to convict, so it is the one
    // the sweep must still reach; the count is a floor under the population.
    expect(ids).toContain("sixteen");
    expect(ids.length).toBeGreaterThanOrEqual(10);
  });

  it("no game answers a modified arrow and its opposite alike", () => {
    const alike = [...answers].flatMap(([id, r]) =>
      r.alike.slice(0, 3).map((how) => `${id}: ${how}`),
    );
    const reach = takers()
      .map(([id, r]) => `${id} ${r.acted}/${r.pairs}`)
      .join(", ");
    expect(alike, `pairs that changed a board, of pairs pressed: ${reach}`).toEqual([]);
  });
});
