/**
 * Cross-game guarantee: pressing Hint over and over finishes any board, from
 * any position a player can reach (`engine-hints`, "Pressing Hint over and
 * over finishes any board").
 *
 * Every game with a hint deals its default board, which random input then
 * plays as a careless player would: wrong entries, lines in the wrong place, a
 * lost game. From there the Hint button is pressed as the app's stepper
 * presses it, a show and then an apply, and a refusal is applied for its way
 * forward (`WAY_FORWARD`) until the board is solved. A refusal with no way
 * forward fails: a dealt board has its one answer, so none of the exceptions
 * the requirement names applies to it.
 *
 * A game with a tier that allows trial and error deals a board of that tier
 * too, played from the start, which is where the hint runs out of deduction
 * and applying it reveals a piece of the answer.
 */
import { describe, expect, it } from "vitest";
import { permitsSearch } from "./difficulty.ts";
import { ALREADY_SOLVED } from "./hint-refusal.ts";
import { Midend } from "./midend.ts";
import { randomNew } from "./random/index.ts";
import { HINT_GAMES } from "./testing/hint-games.ts";
import {
  type AnyGame,
  type AnyMidend,
  GESTURE_KINDS,
  probeBoard,
  randomGesture,
} from "./testing/input-probe.ts";
import { leafPresets } from "./testing/presets.ts";

/** How many random gestures scramble a board before the hint is asked. */
const GESTURES = 40;
/** Far above any board's step count: a step is one press of each beat. */
const PRESS_LIMIT = 3000;

/** Press Hint, show then apply, until the board is solved; the refusals met
 * on the way, in order. Throws on one with no way forward. */
function finishByHint(id: string, m: AnyMidend): string[] {
  const met: string[] = [];
  for (let presses = 0; presses < PRESS_LIMIT; presses++) {
    const refusal = m.hint();
    if (refusal === ALREADY_SOLVED) return met;
    if (refusal !== null) {
      const way = m.hintWayForward();
      if (way === null)
        throw new Error(`${id}: refused with no way forward: ${refusal}`);
      met.push(way);
    }
    const err = m.executeHint(true);
    if (err !== null) throw new Error(`${id}: applying the hint failed: ${err}`);
    m.timer(60);
  }
  throw new Error(
    `${id}: ${PRESS_LIMIT} presses of Hint did not finish the board; the last refusals' ways forward: ${met.slice(-5).join(", ") || "none"}`,
  );
}

describe("pressing Hint over and over finishes any board", () => {
  it.each(HINT_GAMES)("%s: from a board random input has played", (id, game) => {
    const b = probeBoard(game, id);
    const rs = randomNew(`hint-finishes-${id}`);
    for (let k = 0; k < GESTURES; k++)
      randomGesture(b.m, b.size, rs, GESTURE_KINDS[k % GESTURE_KINDS.length]);
    finishByHint(id, b.m);
    expect(b.m.hint()).toBe(ALREADY_SOLVED);
  });

  const searchTiers = HINT_GAMES.flatMap(([id, game]) => {
    const preset = leafPresets(game).find((p) => permitsSearch(game, p.params));
    return preset ? [[id, game, preset] as const] : [];
  });

  it.each(
    searchTiers,
  )("%s: from a board of the tier that allows trial and error", (id, game, preset) => {
    const m = new Midend(game as AnyGame);
    const err = m.newGameFromId(
      `${game.encodeParams(preset.params, true)}#hint-finishes-${id}`,
    );
    if (err !== null) throw new Error(`${id}: ${err}`);
    finishByHint(id, m);
    expect(m.hint()).toBe(ALREADY_SOLVED);
  });
});
