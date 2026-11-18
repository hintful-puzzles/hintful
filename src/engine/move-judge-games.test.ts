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
import { Midend } from "./midend.ts";
import { beginDealt, dealt } from "./testing/dealt.ts";
import { REGISTERED_GAME_COUNT } from "./testing/enrollment.ts";
import { HINT_GAMES } from "./testing/hint-games.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";

const OWN_SOLVER = "its hint is its own solver's, not the engine's walk";
const NOT_MARKS = "its moves are not marks a deduction makes";
const HIDDEN = "its answer is hidden, so no probe is forced";

/** The hinting games with no `judgeMove`, and why (`check-the-last-move`'s
 * proposal, "Which games"). */
const UNJUDGED: Readonly<Record<string, string>> = {
  ascent: OWN_SOLVER,
  blackbox: HIDDEN,
  cube: NOT_MARKS,
  fifteen: NOT_MARKS,
  flip: NOT_MARKS,
  flood: NOT_MARKS,
  guess: HIDDEN,
  inertia: NOT_MARKS,
  mines: OWN_SOLVER,
  netslide: NOT_MARKS,
  numgame: NOT_MARKS,
  pegs: NOT_MARKS,
  samegame: NOT_MARKS,
  sixteen: NOT_MARKS,
  slide: NOT_MARKS,
  sokoban: NOT_MARKS,
  twiddle: NOT_MARKS,
  undead: OWN_SOLVER,
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
        // A step quoted alone states its whole reason, never a journey's
        // "...and" that leans on a leg before it.
        expect(verdict.words.text, step.explanation).not.toMatch(/: (\.\.\.|…)/);
        judged++;
      }
      expect(judged, `${id}: none of the first steps was judged`).toBeGreaterThan(0);
    });

    // A verdict marks the board after the move, where the hint marked it
    // before: a ring round a value just placed must fit clear of its text.
    it(`${id}: the board paints a verdict on the hint's first moves`, () => {
      const midend = new Midend(game);
      expect(beginDealt(midend, game, game.defaultParams())).toBeNull();
      const palette = game.colors(DEFAULT_BACKGROUND);
      let painted = 0;
      for (let k = 0; k < 5 && midend.hint() === null; k++) {
        const step = midend.activeHintStep();
        if (step === null) break;
        midend.playMoves([step.move]);
        const verdict = midend.check();
        if (!("judged" in verdict) || verdict.judged !== true) continue;
        midend.timer(60);
        midend.redraw(new RecordingDrawing(palette));
        painted++;
      }
      expect(painted, `${id}: no verdict was painted`).toBeGreaterThan(0);
    });
  }
});
