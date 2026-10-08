/**
 * Every hint step is played by its gesture, through a real `Midend`.
 *
 * The midend plays a step by sending the game's gesture for it through
 * `interpretMove` (`Midend.executeHint`) and throws when the gesture makes a
 * move off the step, presses a key the player has no control for, or ends
 * short. So walking each hinted game's plans with `executeHint` is the whole
 * check: a step no pointer makes cannot be walked. The midend's own tests
 * (`midend.test.ts`, "plays a step's gesture, never its move") show each of
 * those refusals firing.
 */
import { describe, expect, it } from "vitest";
import { Midend } from "./midend.ts";
import { beginDealt } from "./testing/dealt.ts";
import { gatePresets, HINT_GAMES } from "./testing/hint-games.ts";

/** Far above any plan a gate preset's board needs, so only a loop trips it. */
const MAX_STEPS = 2000;

describe("every hint step is one the pointer makes", () => {
  it("walks every hinted game", () => {
    expect(HINT_GAMES.length).toBeGreaterThan(40);
  });

  for (const [name, game] of HINT_GAMES) {
    it(`${name}: each step's gesture completes it`, () => {
      const presets = gatePresets(name, game);
      expect(presets.length, `${name}: no preset to walk`).toBeGreaterThan(0);
      let played = 0;
      for (const { title, params } of presets) {
        const midend = new Midend(game);
        expect(beginDealt(midend, game, params), title).toBeNull();
        for (let steps = 0; steps < MAX_STEPS; steps++) {
          if (midend.executeHint() !== null) break;
          played++;
        }
      }
      // A game whose every board is refused from the start would pass having
      // played nothing.
      expect(played, `${name}: no hint step was played`).toBeGreaterThan(0);
    });
  }
});
