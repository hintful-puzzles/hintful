/**
 * The contract's sections, read off every registered game: each is
 * implemented, not applicable with the puzzle's reason, or absent, and a game
 * with an absent section is a draft.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { draftSections, notApplicableFeatures, sectionState } from "./sections.ts";

beforeAll(registerAllGames);

function games() {
  return registeredGameIds().map((id) => {
    const game = getTsGame(id);
    if (game === null) throw new Error(`${id} is registered but has no game`);
    return game;
  });
}

describe("contract sections", () => {
  it("reads a state for every section of every game", () => {
    const all = games();
    expect(all.length).toBeGreaterThanOrEqual(57);
    // Throws for a game that implements a section and also says it has none.
    for (const game of all) draftSections(game);
  });

  it("makes a game without a hint a draft, and a complete game not one", () => {
    const hintless = games().filter((g) => g.hint === undefined);
    // Known positives, and the rule that no reason can excuse a missing hint.
    expect(hintless.length).toBeGreaterThan(0);
    for (const game of hintless) expect(draftSections(game)).toContain("Hints");
    // Known negative: Palisade is the exemplar of a finished game.
    const palisade = getTsGame("palisade");
    expect(palisade && draftSections(palisade)).toEqual([]);
  });

  it("gives every reason as a sentence a player can read", () => {
    const reasons = games().flatMap((g) =>
      notApplicableFeatures(g).map(({ reason }) => `${g.id}: ${reason}`),
    );
    // Vacuity: the gravity, square and rearranging games all give reasons.
    expect(reasons.length).toBeGreaterThanOrEqual(25);
    for (const line of reasons) {
      const reason = line.slice(line.indexOf(": ") + 2);
      expect(line).toMatch(/: [A-Z]/);
      expect(line).toMatch(/\.$/);
      expect(reason.length, line).toBeGreaterThan(40);
    }
  });

  it("refuses a game that both implements a section and excuses it", () => {
    const both = {
      id: "both",
      solve: () => null,
      notApplicable: { solve: "It has no solution." },
    };
    expect(() => sectionState(both, "solve")).toThrow(/both|not applicable/);
  });
});
