/**
 * The contract's sections, read off every registered game: each is
 * implemented, not applicable with the puzzle's reason, or absent, and a game
 * with an absent section is a draft.
 */
import { describe, expect, it } from "vitest";
import { DRAFT_HINT, hasHint } from "./game.ts";
import { getTsGame } from "./registry.ts";
import { draftSections, notApplicableFeatures, sectionState } from "./sections.ts";
import { REGISTERED_GAMES } from "./testing/enrollment.ts";

function games() {
  return REGISTERED_GAMES.map(([, game]) => game);
}

describe("contract sections", () => {
  it("reads a state for every section of every game", () => {
    const all = games();
    expect(all.length).toBeGreaterThanOrEqual(57);
    // Throws for a game that implements a section and also says it has none.
    for (const game of all) draftSections(game);
  });

  it("makes a game without a hint a draft, and a complete game not one", () => {
    const palisade = getTsGame("palisade");
    if (!palisade) throw new Error("palisade is not registered");
    // Every game ships a hint, so the positive is a finished game with its
    // hint taken away, and the rule holds for any game that lands without one.
    const hintless = [
      { ...palisade, hint: DRAFT_HINT },
      ...games().filter((g) => !hasHint(g)),
    ];
    for (const game of hintless) expect(draftSections(game)).toContain("Hints");
    // Known negative: Palisade is the exemplar of a finished game.
    expect(draftSections(palisade)).toEqual([]);
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
      transposeParams: () => null,
      notApplicable: { transposeParams: "It has one shape." },
    };
    expect(() => sectionState(both, "transposeParams")).toThrow(/both|not applicable/);
  });
});
