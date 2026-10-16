/**
 * A Hint pressed while the stepper's applied move still animates shows the next
 * step, and that step is still on display once the move lands.
 *
 * The press is answered before the animation's settle advances the plan, so in
 * every game whose hinted move animates the two can disagree: the press shows
 * the step in flight, and the settle then hides it, leaving the control armed
 * to apply a step the player never saw. `midend.test.ts` pins the mechanism on
 * a fake game; this walks the real ones, whose `refreshHintStep` and win flash
 * take part in the settle.
 */
import { describe, expect, it } from "vitest";
import { Midend } from "./midend.ts";
import { beginDealt } from "./testing/dealt.ts";
import { gatePresets, HINT_GAMES } from "./testing/hint-games.ts";

/** Longer than any move's animation and flash, so one tick lands the move. */
const LAND_S = 60;

describe("a hint asked mid-animation shows the next step", () => {
  const animated: string[] = [];

  for (const [name, game] of HINT_GAMES) {
    it(`${name}: the step shown mid-animation outlives the landing`, () => {
      const [first] = gatePresets(name, game);
      expect(first, `${name}: no preset to walk`).toBeDefined();
      const midend = new Midend(game);
      expect(beginDealt(midend, game, first.params), first.title).toBeNull();
      if (midend.hint() !== null) return;
      const applied = midend.activeHintStep();
      expect(midend.executeHint(true)).toBeNull();
      if (midend.currentAnimationMs() === 0) return;
      // The applied step may have finished the board: then nothing is armed.
      if (midend.hint() !== null) return;
      animated.push(name);
      const shown = midend.activeHintStep();
      expect(shown, `${name}: the press showed no step`).not.toBeNull();
      expect(shown, `${name}: the press showed the step in flight`).not.toBe(applied);
      midend.timer(LAND_S);
      expect(midend.activeHintStep()?.explanation, `${name}: the landing hid it`).toBe(
        shown?.explanation,
      );
    });
  }

  // A sweep in which no game animated would pass having tested nothing.
  it("met games whose hinted move animates", () => {
    expect(animated.length).toBeGreaterThan(0);
  });
});
