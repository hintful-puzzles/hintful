/**
 * Every hint step is played by its gesture, through a real `Midend`.
 *
 * The midend plays a step by sending the game's gesture for it through
 * `interpretMove` (`Midend.executeHint`) and throws when the gesture makes a
 * move off the step, presses a key the player has no control for, or ends
 * short. So walking each hinted game's plans is the whole check: a step no
 * pointer makes cannot be walked. The midend's own tests (`midend.test.ts`,
 * "plays a step's gesture, never its move") show each of those refusals
 * firing.
 */
import { describe, expect, it } from "vitest";
import { HINT_GAMES } from "../testing/hint-games.ts";
import { walkHints } from "../testing/hint-walk.ts";

/** Far above any plan a gate preset's board needs, so only a loop trips it. */
const MAX_STEPS = 2000;

describe("every hint step is one the pointer makes", () => {
  it("walks every hinted game", () => {
    expect(HINT_GAMES.length).toBeGreaterThan(40);
  });

  for (const [name, game] of HINT_GAMES) {
    it(`${name}: each step's gesture completes it`, () => {
      const { steps } = walkHints(
        game,
        { steps: MAX_STEPS },
        {
          played(_, i, { title, midend, observed }) {
            // The app is told the mode a gesture leaves (Marks switched on
            // for a press and off after, or Guess's row choosing it): its
            // Marks key shows it. The midend keeps its `Ui` private, so it is
            // read here as the field it is.
            const { ui } = midend as unknown as { ui: { pencilMode?: boolean } };
            expect(
              observed.last("game-state-change")?.pencilMode,
              `${title} step ${i}`,
            ).toBe(ui.pencilMode === true);
          },
        },
      );
      // A game whose every board is refused from the start would pass having
      // played nothing.
      expect(steps, `${name}: no hint step was played`).toBeGreaterThan(0);
    });
  }
});
