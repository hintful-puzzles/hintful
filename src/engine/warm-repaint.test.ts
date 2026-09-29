/**
 * The cross-game guard on every render cache: **a frame drawn on a warm draw
 * state looks like the same frame drawn on a fresh one.**
 *
 * `testing/repaint-differential.ts` says what is compared and why the
 * comparison is sound. What it catches is any way a tile can fail to repaint —
 * flags sharing a bit, a value overflowing its field, a painter input missing
 * from the key — which is why this replaced the per-module flag lists: a
 * module listing its own flags cannot see the flag it forgot, and none of the
 * collisions that census found was two named flags sharing a bit.
 *
 * Population: every registered game, from the registry.
 *
 * **A pass is only as strong as what the run showed the game**, so each game
 * also answers for its reach. An animation the midend armed must have been
 * painted part-way at least once, which is what failed while the run ticked
 * its clock in whole seconds; and a game with a hint must have painted a hint
 * frame. Mistake frames are counted but not required: reaching a board with a
 * mistake takes a move that is specific to the game, which is why
 * `src/mistake-overlay-coverage.test.ts` is a ledger rather than a guard.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import type { AnyGame } from "./testing/input-probe.ts";
import { repaintDifferential } from "./testing/repaint-differential.ts";

const IDS = registeredGameIds().sort();
const EVENTS = 60;

describe("a warm frame matches a fresh one", () => {
  it("is not vacuous — the registry offered every game", () => {
    expect(IDS.length).toBeGreaterThan(50);
  });

  it.each(IDS)("%s: repaints every tile it must", (id) => {
    const game = getTsGame(id) as AnyGame;
    const run = repaintDifferential(game, id, EVENTS);
    expect(run.mismatch, JSON.stringify(run.mismatch)).toBeNull();
    expect(run.frames).toBeGreaterThan(EVENTS);
    if (run.reached.armed > 0) {
      expect(
        run.reached.animated,
        "armed an animation, painted none of it",
      ).toBeGreaterThan(0);
    }
    if (typeof game.hint === "function") {
      expect(run.reached.hinted, "has a hint, painted no hint frame").toBeGreaterThan(
        0,
      );
    }
  });
});
