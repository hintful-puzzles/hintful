/**
 * Every game that judges a move (`Game.judgeMove`) says its own hint's moves
 * followed from the board: a hint's step is made from the position it is
 * shown on, so the walk aimed at its move reaches it at its first firing, and
 * the verdict quotes a step. A move made only of notes (Map's Mark-all) is
 * not judged.
 *
 * And which hinting games do not judge a move is a ledger, one reason each,
 * so a game whose builder supplies `judgeMove` cannot leave it unwired.
 */
import { describe, expect, it } from "vitest";
import { dealt } from "./testing/dealt.ts";
import { REGISTERED_GAME_COUNT } from "./testing/enrollment.ts";
import { HINT_GAMES } from "./testing/hint-games.ts";

const OWN_SOLVER = "its hint is its own solver's, not the engine's walk";
const NOT_MARKS = "its moves are not marks a deduction makes";
const HIDDEN = "its answer is hidden, so no probe is forced";
const LATER = "check-the-last-move task 4";

/** The hinting games with no `judgeMove`, and why (`check-the-last-move`'s
 * proposal, "Which games"). */
const UNJUDGED: Readonly<Record<string, string>> = {
  abcd: LATER,
  adjacent: LATER,
  ascent: OWN_SOLVER,
  blackbox: HIDDEN,
  crossing: LATER,
  cube: NOT_MARKS,
  fifteen: NOT_MARKS,
  filling: LATER,
  flip: NOT_MARKS,
  flood: NOT_MARKS,
  group: LATER,
  guess: HIDDEN,
  inertia: NOT_MARKS,
  keen: LATER,
  loopy: LATER,
  mathrax: LATER,
  mines: OWN_SOLVER,
  net: LATER,
  netslide: NOT_MARKS,
  numgame: NOT_MARKS,
  pattern: LATER,
  pegs: NOT_MARKS,
  rome: LATER,
  salad: LATER,
  samegame: NOT_MARKS,
  seismic: LATER,
  sixteen: NOT_MARKS,
  slant: LATER,
  slide: NOT_MARKS,
  sokoban: NOT_MARKS,
  solo: LATER,
  subsets: LATER,
  towers: LATER,
  twiddle: NOT_MARKS,
  undead: OWN_SOLVER,
  unequal: LATER,
  unruly: LATER,
  untangle: NOT_MARKS,
};

const LEAD = /^Your last move followed from the board: /;

describe("judgeMove", () => {
  it("asked the whole registry", () => {
    expect(REGISTERED_GAME_COUNT).toBeGreaterThan(50);
    expect(HINT_GAMES.length).toBeGreaterThan(50);
  });

  it("is wired in every hinting game but the ledger's", () => {
    const unjudged = HINT_GAMES.filter(([, g]) => g.judgeMove === undefined).map(
      ([id]) => id,
    );
    expect(unjudged).toEqual(Object.keys(UNJUDGED).sort());
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
        expect(verdict.words.text, step.explanation).toMatch(LEAD);
        judged++;
      }
      expect(judged, `${id}: none of the first steps was judged`).toBeGreaterThan(0);
    });
  }
});
