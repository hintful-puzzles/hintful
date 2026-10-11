/*
 * Check & save names a wrong entry in every game, whether or not the entry
 * breaks a rule.
 *
 * A game's `findMistakes` can be its rule checker alone. An entry that is
 * wrong and breaks nothing yet then passes it, the hint finds the board
 * doomed, and the player is told "these entries contradict each other" with no
 * cell marked. Bricks, Clusters and Subsets each shipped that.
 *
 * So for every game with `findMistakes`, `solve` and a hint, this deals one
 * board and plays single gestures on it, each from the opening position and
 * each chosen blind (`randomGesture`). A gesture made a **wrong entry** when
 * its moves, played on the solved board, leave that board unsolved. From such
 * a position one of three things holds: `findMistakes` reports something, or
 * the hint still finishes the board (the move was no entry: a turned Net tile,
 * a Dominosa line the hint takes back), or the check refuses in words of the
 * game's own that name the cause (Mines' opened mine).
 *
 * WHAT IT DOES NOT SEE.
 *  - **A mark that leaves a solved board solved**: a Guess rule-out, a Bridges
 *    island marked complete, a pencil note. Replaying one on the answer proves
 *    nothing, so each such mark is held by its own game's tests.
 *  - **A second wrong entry.** Every position here is one gesture deep.
 *  - **Another board.** One preset, the first the hook deals, and one desc.
 *  - **A game the gestures enter nothing wrong in**, which is {@link UNREACHED},
 *    asserted to be exactly the games that came back with none.
 *
 * ON {@link GESTURES}, measured 2026-10-11. Each of the three defects above,
 * put back, failed on its first or second gesture, so the count is set by the
 * games that are hard to enter anything in, and those are the ones that drag:
 * Ascent's first wrong entry came at gesture 105 and Boats' at 120, and at 180
 * they have one and two where most games have dozens. The last test holds that
 * floor, so a change to the gestures that loses a game says so. A wrong entry
 * that takes a particular drag to make is seen thinly or not at all.
 */
import { describe, expect, it } from "vitest";
import { hintFinishes } from "./hint-finishes.ts";
import { CONTRADICTION_UNLOCALIZED } from "./hint-refusal.ts";
import { Midend } from "./midend.ts";
import { randomNew } from "./random/index.ts";
import { NOT_STARTED } from "./solve-failure.ts";
import { dealt } from "./testing/dealt.ts";
import {
  type AnyGame,
  REGISTERED_GAME_COUNT,
  REGISTERED_GAMES,
} from "./testing/enrollment.ts";
import { gatePresets } from "./testing/hint-games.ts";
import { GESTURE_KINDS, randomGesture } from "./testing/input-probe.ts";

const GESTURES = 180;

const CHECKED = REGISTERED_GAMES.filter(
  ([, game]) => game.findMistakes && game.solve && game.hint,
);

/** The games no gesture made a wrong entry in, each with why. */
const UNREACHED: Record<string, string> = {
  guess:
    "A row of pegs is a probe and never a claim, and what the player claims is a rule-out, which leaves a solved board solved.",
};

interface Swept {
  /** How many gestures made a wrong entry. */
  wrongEntries: number;
  /** Each wrong entry the check did not name, as the moves that made it. */
  unnamed: string[];
}

const swept = new Map<string, Swept>();

function sweep(id: string, game: AnyGame): Swept {
  const known = swept.get(id);
  if (known) return known;
  const params = gatePresets(id, game)[0].params;
  const gameId = `${game.encodeParams(params, true)}:${dealt(game, params).desc}`;

  let current: unknown = null;
  let made: unknown[] = [];
  const heard: AnyGame = {
    ...game,
    executeMove: (state: unknown, move: unknown) => {
      made.push(move);
      current = game.executeMove(state, move);
      return current;
    },
  };
  const fresh = (): Midend<unknown, unknown, unknown, unknown, unknown> => {
    const m = new Midend(heard);
    expect(m.newGameFromId(gameId), `${id}: its own board did not load`).toBeNull();
    return m;
  };
  // A board laid out by its first move (Mines) has no answer until then, so
  // the hint's first move opens it, here and before every gesture.
  const answered = fresh();
  let opening: unknown[] = [];
  if (answered.solve() === NOT_STARTED) {
    expect(answered.executeHint(), `${id}: no hint to lay the board out`).toBeNull();
    opening = made.slice();
    expect(answered.solve(), `${id}: Solve refused its own board`).toBeNull();
  }
  const answer = current;
  expect(game.status(answer), `${id}: Solve did not solve`).toBe("solved");
  const open = (): Midend<unknown, unknown, unknown, unknown, unknown> => {
    const m = fresh();
    m.playMoves(opening);
    made = [];
    return m;
  };

  const rs = randomNew(`wrong-entry-${id}`);
  const result: Swept = { wrongEntries: 0, unnamed: [] };
  for (let n = 0; n < GESTURES; n++) {
    const m = open();
    randomGesture(m, m.size({ w: 600, h: 600 }), rs, GESTURE_KINDS[n % 3]);
    if (made.length === 0) continue;
    const position = current;
    let onAnswer = answer;
    try {
      for (const move of made) onAnswer = game.executeMove(onAnswer, move);
    } catch {
      // A move the solved board refuses is one the answer has no room for.
      onAnswer = null;
    }
    if (onAnswer !== null && game.status(onAnswer) === "solved") continue;
    result.wrongEntries++;
    if (game.findMistakes?.(position).length) continue;
    const entry = JSON.stringify(made);
    // A hint that deduces from the player's entries may throw on a wrong one
    // it was never meant to be handed, and that is the finding, not a crash.
    let told: string;
    try {
      if (hintFinishes(game, position)) continue;
      const verdict = m.check();
      if (verdict.kind === "dead-end" && verdict.reason !== CONTRADICTION_UNLOCALIZED)
        continue;
      told = JSON.stringify(verdict);
    } catch (thrown) {
      told = `threw: ${thrown instanceof Error ? thrown.message : String(thrown)}`;
    }
    result.unnamed.push(`${entry} -> ${told}`);
  }
  swept.set(id, result);
  return result;
}

describe("Check & save names a wrong entry", () => {
  it("swept a populated registry", () => {
    expect(REGISTERED_GAME_COUNT).toBeGreaterThanOrEqual(50);
    expect(CHECKED.length).toBeGreaterThanOrEqual(40);
  });

  for (const [id, game] of CHECKED) {
    it(`${id}: no wrong entry goes unnamed`, () => {
      expect(
        sweep(id, game).unnamed,
        `${id}: an entry the answer contradicts, from which the hint cannot ` +
          "finish, and `findMistakes` returns nothing. Compare the player's " +
          "entries with the answer there (docs/games/solver-and-generator.md " +
          '§ "Self-validating games run their rule checker")',
      ).toEqual([]);
    });
  }

  it("made a wrong entry in every game but the ones it says it cannot", () => {
    const none = CHECKED.filter(([id, game]) => sweep(id, game).wrongEntries === 0);
    expect(none.map(([id]) => id)).toEqual(Object.keys(UNREACHED).sort());
  });
});
