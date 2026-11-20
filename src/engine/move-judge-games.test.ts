/**
 * Every game that judges a move (`Game.judgeMove`) says its own hint's moves
 * followed from the board: a hint's step is made from the position it is
 * shown on, so the walk aimed at its move reaches it at its first firing, and
 * the verdict names a technique. A move made only of notes (Map's Mark-all)
 * is not judged. A verdict names a technique as a player calls it, never by
 * its id, and every name a description declares reads as words.
 *
 * A game whose rules make no move wrong says so (`notApplicable.findMistakes`)
 * and judges none, and neither does a code-breaking game, read off its working
 * row. Which other hinting games do not judge a move is a ledger, one reason
 * each, so a game whose builder supplies `judgeMove` cannot leave it unwired.
 */
import { describe, expect, it } from "vitest";
import { verdictOf } from "./move-judge.ts";
import { sectionState } from "./sections.ts";
import { dealt } from "./testing/dealt.ts";
import {
  type AnyGame,
  REGISTERED_GAME_COUNT,
  workingRowExemption,
} from "./testing/enrollment.ts";
import { HINT_GAMES } from "./testing/hint-games.ts";
import { expectLedger } from "./testing/ledger.ts";

/** Every compiled description's names, by its module's path. */
const NAMED = import.meta.glob<Readonly<Record<string, string>>>(
  "../generated/**/*.compiled.ts",
  { eager: true, import: "NAMES" },
);

/** An id where a name should be: a camelCase word, or a library's dot. */
const ID = /\b[a-z]+[A-Z]\w*\b|\w\.\w/;

const OWN_SOLVER = "its hint is its own solver's, not the engine's walk";

/** A game whose rules make no move wrong (`notApplicable.findMistakes`) makes
 * no move a deduction forces either, so it has nothing to judge. */
const judgesNothing = (game: AnyGame): boolean =>
  sectionState(game, "findMistakes").kind === "notApplicable";

/** The other hinting games with no `judgeMove`, and why (`check-the-last-move`'s
 * proposal, "Which games"). */
const UNJUDGED: Readonly<Record<string, string>> = {
  ascent: OWN_SOLVER,
  blackbox:
    "a ray is a probe of the hidden arena, fired where the player chooses, so none is forced",
  mines: OWN_SOLVER,
  undead: OWN_SOLVER,
};

const DIRECT = /^Your last move follows from (?!the board)/;

describe("judgeMove", () => {
  it("asked the whole registry", () => {
    expect(REGISTERED_GAME_COUNT).toBeGreaterThan(50);
    expect(HINT_GAMES.length).toBeGreaterThan(50);
    expect(Object.keys(NAMED).length).toBeGreaterThan(40);
  });

  it("names every technique in words a verdict can say", () => {
    for (const [path, names] of Object.entries(NAMED))
      for (const [key, name] of Object.entries(names ?? {})) {
        const where = `${path} ${key}: "${name}"`;
        expect(name, where).not.toMatch(ID);
        expect(name, where).toMatch(/^[a-z0-9]/);
        // The hint's own lint: a name with no mark may not say "this".
        expect(
          () => verdictOf({ kind: "direct", techniques: [name] }),
          where,
        ).not.toThrow();
      }
  });

  it("is wired in every hinting game but the ledger's", () => {
    const judging = HINT_GAMES.filter(([, g]) => !judgesNothing(g));
    expect(judging.length).toBeGreaterThan(40);
    expectLedger(
      judging.filter(([, g]) => g.judgeMove === undefined).map(([id]) => id),
      UNJUDGED,
      {
        table: "UNJUDGED",
        file: "src/engine/move-judge-games.test.ts",
        found: "hinting games with a mistake check and no `judgeMove`",
        add: "wire `judgeMove`, or add it with why no move of its is forced",
      },
      [
        workingRowExemption(
          judging.map(([id]) => id),
          "a guess is a probe of the hidden answer, chosen freely, so none is forced",
        ),
      ],
    );
  });

  it("judges no move in a game whose rules make none wrong", () => {
    const nothing = HINT_GAMES.filter(([, g]) => judgesNothing(g));
    expect(nothing.length).toBeGreaterThan(10);
    expect(
      nothing.filter(([, g]) => g.judgeMove !== undefined).map(([id]) => id),
    ).toEqual([]);
  });

  for (const [id, game] of HINT_GAMES) {
    const judge = game.judgeMove;
    if (judge === undefined) continue;
    it(`${id}: a hint's own first moves followed, said directly`, () => {
      const params = game.defaultParams();
      const { desc, aux } = dealt(game, params);
      let state = game.newState(params, desc);
      const res = game.hint?.(state, aux, game.newUi(state));
      if (!res?.ok) throw new Error(`${id}: no hint on a fresh board`);
      let judged = 0;
      // Each step is shown on the board its move is made from, and the
      // board decides it at once, so each is direct: a firing the hint
      // shows no step for, or one that makes part of the move first, must
      // not make it read as chained.
      for (const step of res.steps.slice(0, 5)) {
        const after = game.executeMove(state, step.move);
        const verdict = judge(state, after);
        state = after;
        if (verdict === null) continue;
        expect(verdict.followed, step.explanation).toBe(true);
        expect(verdict.words.text, step.explanation).toMatch(DIRECT);
        expect(verdict.words.text, step.explanation).not.toMatch(ID);
        judged++;
      }
      expect(judged, `${id}: none of the first steps was judged`).toBeGreaterThan(0);
    });

    // Every mark of the answer is one the deductions reach, so a player's
    // mark is never left without words: one no firing makes (Tracks' side
    // a square's two rails close, the edges left once Loopy's loop closes)
    // is the game's to read off the marks (`EdgeHintSpec.holds`).
    if (game.solve !== undefined)
      it(`${id}: the whole answer, as one move, followed`, () => {
        const params = game.defaultParams();
        const { desc, aux } = dealt(game, params);
        const state = game.newState(params, desc);
        const solved = game.solve?.(state, state, aux);
        if (!solved?.ok) throw new Error(`${id}: no solve of its own board`);
        const after = game.executeMove(state, solved.move);
        const verdict = judge(state, after, game.newUi(state));
        expect(verdict?.followed, verdict?.words.text).toBe(true);
        expect(verdict?.words.text).not.toMatch(ID);
      });
  }
});
