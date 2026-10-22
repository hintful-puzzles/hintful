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
 * both, and the games it was first seen to convict are pinned.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { REGISTERED_GAME_COUNT, REGISTERED_GAMES } from "./testing/enrollment.ts";
import { type InputAnswers, inputAnswers } from "./testing/input-probe.ts";
import { inSweep } from "./testing/slow.ts";

beforeAll(registerAllGames);

/**
 * Games that make a move that leaves the board as it was, which the midend
 * keeps out. Each is a positive the sweep must find, or it could report an
 * empty history of such moves by reaching none: a game here that stops making
 * the move comes off the list, and the list is never left empty.
 */
const MAKES_AN_UNCHANGED_MOVE = [
  "abcd",
  "galaxies",
  "group",
  "loopy",
  "mathrax",
  "untangle",
];

/**
 * Games that answer "nothing happened" to an input that changed the frame,
 * each with the input. The midend claims it for them, and these are the
 * positives the sweep must find, or it could report no frame left unclaimed
 * by reaching none: a game that begins to answer for itself comes off the
 * list, and the list is never left empty.
 */
const ANSWERS_NOTHING_AND_CHANGES_THE_FRAME: Record<string, string> = {
  clusters: "a drag that hides the cursor",
  crossing: "a key that puts the held number down",
  group: "a drag along the legend",
  netslide: "a press that hides the cursor",
  samegame: "a press that hides the cursor, a key that shows it",
  signpost: "a press that hides the cursor",
  tracks: "a press that hides the cursor",
};

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

  it("still sees the moves the midend keeps out", () => {
    expect(MAKES_AN_UNCHANGED_MOVE.length).toBeGreaterThan(0);
    expect(
      MAKES_AN_UNCHANGED_MOVE.filter(inSweep).filter(
        (id) => answers(id).unchanged === 0,
      ),
    ).toEqual([]);
  });

  it("still sees the inputs the midend claims for a game", () => {
    const positives = Object.keys(ANSWERS_NOTHING_AND_CHANGES_THE_FRAME);
    expect(positives.length).toBeGreaterThan(0);
    expect(
      positives.filter(inSweep).filter((id) => answers(id).claimedForGame === 0),
    ).toEqual([]);
  });
});
