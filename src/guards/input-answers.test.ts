/**
 * **What an input's answer leaves behind**, swept through the real registry
 * and a real `Midend`, so a game is covered the day it is registered.
 *
 * Two rules, and the engine holds both (`Midend.interpret`): a move that
 * leaves the board as it was is no step of the history, and an input that
 * changed what the `Ui` shows is claimed whatever the game answered. So what
 * is guarded is that the engine can tell, for every game's state and `Ui`:
 * that it keeps out every such move and no other, and that what it reads as
 * shown is what each game paints, so no frame changes under an input left
 * unclaimed.
 *
 * The games still make the moves the midend keeps out and still give the
 * answers it overrules, which is what the sweep is trusted on: it counts
 * both, and over the whole collection it must find some of each, or it could
 * report a clean history by reaching none. Which games they are is not kept:
 * a game born from its description stops making them, and a list of games
 * was edited by each such move (2026-11-24: Group, Crossing, Signpost and
 * Tracks answered nothing to an input that changed the frame; Abcd,
 * Galaxies, Group, Loopy and Untangle made moves that changed nothing).
 */

import { describe, expect, it } from "vitest";
import "../games/index.ts";
import {
  REGISTERED_GAME_COUNT,
  REGISTERED_GAMES,
} from "../engine/testing/enrollment.ts";
import { type InputAnswers, inputAnswers } from "../engine/testing/input-probe.ts";
import { itOverWholeSweep } from "../engine/testing/slow.ts";

describe("what an input's answer leaves behind", () => {
  // Swept a game at a time and on first asking, so a run scoped to one game
  // sweeps that game alone (`testing/game-scope.ts`).
  const games = new Map(REGISTERED_GAMES);
  const swept = new Map<string, InputAnswers>();
  const answers = (id: string): InputAnswers => {
    const game = games.get(id);
    if (game === undefined) throw new Error(`${id} is not a registered game`);
    const known = swept.get(id) ?? inputAnswers(game, id);
    swept.set(id, known);
    return known;
  };

  it("sweeps a non-trivial population", () => {
    expect(REGISTERED_GAME_COUNT).toBeGreaterThanOrEqual(57);
  });

  for (const [id] of REGISTERED_GAMES) {
    it(`${id}: a move is a step exactly when it changed the board, and a changed frame is claimed`, () => {
      const r = answers(id);
      expect(r.recorded, `moves recorded of ${r.inputs} inputs sent`).toBeGreaterThan(
        0,
      );
      expect(
        r.recordedUnchanged.slice(0, 3),
        "a move that left the board as it was is a step of the history",
      ).toEqual([]);
      expect(
        r.droppedChanged.slice(0, 3),
        "a move that changed the board is left out of the history",
      ).toEqual([]);
      expect(
        r.unpainted.slice(0, 3),
        "a Ui the game changed while answering nothing is left unpainted",
      ).toEqual([]);
      expect(
        r.silent.slice(0, 3),
        "an input that changed the frame is left unclaimed",
      ).toEqual([]);
    });
  }

  itOverWholeSweep("still sees the moves the midend keeps out", () => {
    const making = REGISTERED_GAMES.filter(([id]) => answers(id).unchanged > 0);
    expect(
      making.length,
      "no game made a move that left the board as it was: the sweep may reach none",
    ).toBeGreaterThan(0);
  });

  itOverWholeSweep("still sees the inputs the midend claims for a game", () => {
    const claimed = REGISTERED_GAMES.filter(([id]) => answers(id).claimedForGame > 0);
    expect(
      claimed.length,
      "no game answered nothing to an input that changed the frame: the sweep may reach none",
    ).toBeGreaterThan(0);
  });
});
