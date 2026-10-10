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
import { builtGames } from "./testing/enrollment.ts";
import { type InputAnswers, inputAnswers } from "./testing/input-probe.ts";

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
  "pearl",
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
  const answers = new Map<string, InputAnswers>();
  beforeAll(() => {
    for (const { id, game } of builtGames()) answers.set(id, inputAnswers(game, id));
  });
  const named = (pick: (r: InputAnswers) => readonly string[]) =>
    [...answers].flatMap(([id, r]) =>
      pick(r)
        .slice(0, 3)
        .map((how) => `${id}: ${how}`),
    );
  const reach = () =>
    [...answers].map(([id, r]) => `${id} ${r.recorded}/${r.inputs}`).join(", ");

  it("sweeps a non-trivial population, and makes a move in every game", () => {
    expect(answers.size).toBeGreaterThanOrEqual(57);
    const still = [...answers].filter(([, r]) => r.recorded === 0).map(([id]) => id);
    expect(still, `moves recorded of inputs sent: ${reach()}`).toEqual([]);
  });

  it("no move that left the board as it was is a step of the history", () => {
    expect(named((r) => r.recordedUnchanged)).toEqual([]);
  });

  it("no move that changed the board is left out of the history", () => {
    expect(named((r) => r.droppedChanged)).toEqual([]);
  });

  it("still sees the moves the midend keeps out", () => {
    const makes = [...answers].filter(([, r]) => r.unchanged > 0).map(([id]) => id);
    expect(MAKES_AN_UNCHANGED_MOVE.length).toBeGreaterThan(0);
    expect(makes).toEqual(expect.arrayContaining(MAKES_AN_UNCHANGED_MOVE));
  });

  it("no Ui a game changed while answering nothing is left unpainted", () => {
    expect(named((r) => r.unpainted)).toEqual([]);
  });

  it("no input that changed the frame is left unclaimed", () => {
    expect(named((r) => r.silent)).toEqual([]);
  });

  it("still sees the inputs the midend claims for a game", () => {
    const claimed = [...answers]
      .filter(([, r]) => r.claimedForGame > 0)
      .map(([id]) => id);
    const positives = Object.keys(ANSWERS_NOTHING_AND_CHANGES_THE_FRAME);
    expect(positives.length).toBeGreaterThan(0);
    expect(claimed).toEqual(expect.arrayContaining(positives));
  });
});
