/**
 * Every game that declares what a placement rules out (`Game.rulesOut`) is
 * played to the end by its own hint, through a real `Midend`, with the
 * preference on.
 *
 * The walk holds three things at once. The brought marks are sound: a wrong
 * one is a mistake, and the hint refuses a board with a mistake on it, so the
 * walk would stop short of a finished board. The step is judged by the
 * player's move alone: a step whose gesture the brought marks put "off" its
 * step throws. And the plan ends where marks are brought: a step planned
 * without them could ask for a square they already marked, and its gesture
 * would complete nothing.
 */
import { describe, expect, it } from "vitest";
import { fakeGame } from "./fake-game.ts";
import { ALREADY_SOLVED } from "./hint-refusal.ts";
import { Midend } from "./midend.ts";
import { LEFT_BUTTON } from "./pointer.ts";
import { RULES_OUT_PREF } from "./rules-out.ts";
import { beginDealt } from "./testing/dealt.ts";
import { driveMidend } from "./testing/drive-midend.ts";
import { REGISTERED_GAMES } from "./testing/enrollment.ts";
import { gatePresets } from "./testing/hint-games.ts";

/** Far above any plan a gate preset's board needs, so only a loop trips it. */
const MAX_STEPS = 2000;

const DECLARING = REGISTERED_GAMES.filter(([, game]) => game.rulesOut !== undefined);

/** The counter whose first step up brings a second. */
const bringing: typeof fakeGame = {
  ...fakeGame,
  rulesOut: {
    name: "Count on by two from nothing",
    bring: (before, after) => (before.count === 0 && after.count === 1 ? "inc" : null),
  },
};

describe("the midend brings what a placement rules out", () => {
  const begun = (on: boolean | null) => {
    const d = driveMidend(bringing);
    if (on !== null) d.midend.setPreferences({ [RULES_OUT_PREF]: on });
    d.midend.newGame();
    return d.midend;
  };
  const count = (m: { formatAsText(): string | null }) => m.formatAsText();

  it("offers the preference in the game's words, off to begin with", () => {
    const m = begun(null);
    expect(m.getPreferencesConfig().items[RULES_OUT_PREF]).toEqual({
      type: "boolean",
      name: "Count on by two from nothing",
    });
    expect(m.getPreferences()[RULES_OUT_PREF]).toBe(false);
    m.processInput(0, 0, LEFT_BUTTON);
    expect(count(m)).toBe("count=1");
  });

  it("offers nothing to a game that declares nothing", () => {
    const d = driveMidend(fakeGame);
    expect(d.midend.getPreferencesConfig().items[RULES_OUT_PREF]).toBeUndefined();
  });

  it("brings the marks with the move, and one Undo takes both back", () => {
    const m = begun(true);
    m.processInput(0, 0, LEFT_BUTTON);
    expect(count(m)).toBe("count=2");
    m.undo();
    expect(count(m)).toBe("count=0");
    m.redo();
    expect(count(m)).toBe("count=2");
  });

  it("keeps the two as one step of Undo across a save", () => {
    const m = begun(true);
    m.processInput(0, 0, LEFT_BUTTON);
    const loaded = begun(true);
    expect(loaded.loadGame(m.saveGame())).toBeNull();
    expect(count(loaded)).toBe("count=2");
    loaded.undo();
    expect(count(loaded)).toBe("count=0");
  });

  it("ends a plan at its first step that brings marks", () => {
    const m = begun(true);
    expect(m.hint()).toBeNull();
    expect(m.activeHintStep()?.explanation).toBe("Increment the counter to 1");
    // Judged as the player's move alone, the click completes the step; the
    // plan made without the brought step ends there.
    m.processInput(0, 0, LEFT_BUTTON);
    expect(m.activeHintStep()).toBeNull();
    expect(m.hint()).toBeNull();
    expect(m.activeHintStep()?.explanation).toBe("Increment the counter to 3");
  });
});

describe("a placement brings what it rules out", () => {
  it("finds the games that declare it", () => {
    expect(DECLARING.map(([id]) => id)).toEqual(
      expect.arrayContaining(["lightup", "starbattle", "tents"]),
    );
  });

  for (const [id, game] of DECLARING) {
    it(`${id}: the hint finishes the board with the marks brought`, () => {
      const rulesOut = game.rulesOut;
      if (!rulesOut) throw new Error(`${id}: declares no rulesOut`);
      let brought = 0;
      const counting = {
        ...game,
        rulesOut: {
          ...rulesOut,
          bring: (before: unknown, after: unknown) => {
            const move = rulesOut.bring(before, after);
            if (move !== null) brought++;
            return move;
          },
        },
      };
      for (const { title, params } of gatePresets(game)) {
        const midend = new Midend(counting);
        midend.setPreferences({ [RULES_OUT_PREF]: true });
        expect(beginDealt(midend, game, params), title).toBeNull();
        let refusal: string | null = null;
        for (let steps = 0; refusal === null; steps++) {
          expect(steps, title).toBeLessThan(MAX_STEPS);
          refusal = midend.executeHint();
        }
        // An Unreasonable board may outrun deduction; the walk asks only
        // that nothing it brought was wrong.
        if (refusal !== ALREADY_SOLVED) expect(midend.findMistakes(), title).toBe(0);
      }
      // A walk that never brought a mark would pass having tested nothing.
      expect(brought, `${id}: no move brought marks`).toBeGreaterThan(0);
    });
  }
});
