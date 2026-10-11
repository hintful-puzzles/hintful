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
 *
 * THE SECOND QUESTION: A RIGHT ENTRY. A hint carries on from wherever the
 * player is, so from a position with nothing wrong on it the hint finishes the
 * board, on a tier that allows no trial and error. Range's did not: one white
 * mark the answer agrees with left a board its rules ran out on, because a
 * rule concluded less from a board that said more. `hint-resume.test.ts`
 * cannot see that, since its walk passes only through positions the hint's
 * own order makes. Two kinds of position are asked here:
 *  - **a gesture whose moves leave the solved board solved**, with no mistake
 *    reported;
 *  - **steps of the opening plan played out of their order**: every step
 *    alone, and {@link PAIRS} pairs, wherever `findMistakes` reports nothing.
 *    They are not replayed on the answer, which refuses a Signpost link it
 *    already has and is unsolved by a toggled mark.
 *
 * Measured 2026-10-11 with Range's rule put back: the gestures found it once
 * in 180, the steps alone three times in 42 and the pairs five times in 60.
 * A second and a third blind gesture cost a third of a second each over the
 * file and found nothing the first did not, in any game, and neither did
 * larger subsets of the plan, which caught Range's rule in none of 39: the
 * steps around the one played early make up for it.
 */
import { describe, expect, it } from "vitest";
import { permitsSearch } from "./difficulty.ts";
import { hintFinishes } from "./hint-finishes.ts";
import { CONTRADICTION_UNLOCALIZED } from "./hint-refusal.ts";
import { Midend } from "./midend.ts";
import { randomNew, randomUpto } from "./random/index.ts";
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
const PAIRS = 60;

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
  /** Whether the board's tier is one the hint finishes by deduction. */
  deduced: boolean;
  /** How many positions had nothing wrong on them: after a gesture, and after
   * steps of the opening plan played out of their order. */
  rightEntries: number;
  /** How many of those were steps of the plan. */
  outOfOrder: number;
  /** Each right entry the hint did not finish the board from. */
  stalled: string[];
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
  // On a tier that allows trial and error the hint may stop on any position.
  const deduced = !permitsSearch(game, params);
  const result: Swept = {
    wrongEntries: 0,
    unnamed: [],
    deduced,
    rightEntries: 0,
    outOfOrder: 0,
    stalled: [],
  };
  /** Ask the hint to finish from a position with nothing wrong on it. */
  const finishFrom = (position: unknown, entry: string): void => {
    result.rightEntries++;
    let ran: string | null = null;
    try {
      if (!hintFinishes(game, position)) ran = "the hint refused";
    } catch (thrown) {
      ran = `threw: ${thrown instanceof Error ? thrown.message : String(thrown)}`;
    }
    if (ran !== null) result.stalled.push(`${entry} -> ${ran}`);
  };

  let start = game.newState(params, dealt(game, params).desc);
  for (const move of opening) start = game.executeMove(start, move);
  const plan = deduced ? game.hint?.(start) : undefined;
  const steps = plan?.ok ? plan.steps : [];
  const alone = steps.map((_, i) => [i]);
  // Drawn from a stream of their own, so the gestures stay the ones measured.
  const pairRs = randomNew(`out-of-order-${id}`);
  const pairs = Array.from({ length: steps.length > 1 ? PAIRS : 0 }, () =>
    [randomUpto(pairRs, steps.length), randomUpto(pairRs, steps.length)].sort(
      (a, b) => a - b,
    ),
  );
  for (const picked of [...alone, ...pairs]) {
    let position = start;
    try {
      for (const i of picked) position = game.executeMove(position, steps[i].move);
    } catch {
      // A step that leans on the ones before it is no entry by itself.
      continue;
    }
    // A step the hint would make is right where it means the same played
    // early, and one that does not (a turn of a tile turned twice) is left to
    // the check to name.
    if (game.findMistakes?.(position).length) continue;
    result.outOfOrder++;
    finishFrom(position, `plan steps ${picked.join(" and ")}`);
  }

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
    if (onAnswer !== null && game.status(onAnswer) === "solved") {
      if (deduced && !game.findMistakes?.(position).length)
        finishFrom(position, JSON.stringify(made));
      continue;
    }
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

  for (const [id, game] of CHECKED) {
    it(`${id}: the hint finishes from every right entry`, () => {
      expect(
        sweep(id, game).stalled,
        `${id}: a position with nothing wrong on it that the hint does not ` +
          "finish the board from. A rule that reads the board must conclude " +
          "no less from one that says more (docs/games/hints.md " +
          '§ "A hint carries on from an entry the player made first")',
      ).toEqual([]);
    });
  }

  it("made a wrong entry in every game but the ones it says it cannot", () => {
    const none = CHECKED.filter(([id, game]) => sweep(id, game).wrongEntries === 0);
    expect(none.map(([id]) => id)).toEqual(Object.keys(UNREACHED).sort());
  });

  it("played a step of the plan out of its order in every game that deduces", () => {
    const results = CHECKED.map(([id, game]) => [id, sweep(id, game)] as const);
    const none = results.filter(([, r]) => r.deduced && r.outOfOrder === 0);
    expect(none.map(([id]) => id)).toEqual([]);
    const reached = results.filter(([, r]) => r.outOfOrder >= 20);
    expect(reached.length).toBeGreaterThanOrEqual(35);
  });
});
