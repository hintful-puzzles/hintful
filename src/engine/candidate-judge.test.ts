/**
 * The judge of a player's last move on a candidate plan (`candidate-judge.ts`),
 * on Towers: a move the board shows is named in its step's sentence, one only
 * a chain reaches rings its square, a move a walk never makes is told apart,
 * and the notes are read as the player reads them, so penciling everything
 * in is not judged while writing fewer notes than the regions allow is. *
 * That each judging game calls its hint's own steps followed is
 * `move-judge-games.test.ts`.
 */
import { describe, expect, it } from "vitest";
import { towersGame } from "../games/towers/index.ts";
import type { TowersState } from "../games/towers/state.ts";
import { dealt } from "./testing/dealt.ts";

const game = towersGame;
const params = game.defaultParams();
const { desc, aux } = dealt(game, params);
const fresh = (): TowersState => game.newState(params, desc);

const answer = (() => {
  const s = fresh();
  const solved = game.solve?.(s, s, aux);
  if (!solved?.ok) throw new Error("Towers did not solve its own board");
  return game.executeMove(s, solved.move).grid;
})();

function with_(s: TowersState, edit: (t: TowersState) => void): TowersState {
  const t = { ...s, grid: s.grid.slice(), pencil: s.pencil.slice() };
  edit(t);
  return t;
}

/** What a check says of a move the board shows, in its step's words. */
const direct = (explanation: string): string =>
  `Your last move followed from the board: ${explanation.charAt(0).toLowerCase()}${explanation.slice(1)}`;

const placed = (s: TowersState, i: number, n = answer[i]): TowersState =>
  with_(s, (t) => {
    t.grid[i] = n;
  });

describe("candidateJudge", () => {
  it("names a placement the board shows in its step's words", () => {
    const s = fresh();
    const res = game.hint?.(s, aux, game.newUi(s));
    if (!res?.ok) throw new Error("no hint");
    const step = res.steps[0];
    const v = game.judgeMove?.(s, game.executeMove(s, step.move));
    expect(v?.followed).toBe(true);
    expect(v?.words.text).toBe(direct(step.explanation));
  });

  it("names directly a placement the board shows, though the hint takes it later", () => {
    const s = fresh();
    const res = game.hint?.(s, aux, game.newUi(s));
    if (!res?.ok) throw new Error("no hint");
    // Another firing of the rung the hint opens with, which the board as
    // dealt shows as plainly.
    const later = res.steps
      .slice(1)
      .find(
        (step) =>
          step.rung === res.steps[0].rung &&
          step.move.type === "set" &&
          step.continuesPrevious !== true,
      );
    if (later === undefined) throw new Error("the hint fires its first rung once");
    const v = game.judgeMove?.(s, game.executeMove(s, later.move));
    expect(v?.words.text).toBe(direct(later.explanation));
  });

  it("quotes a journey's later leg in words that stand alone", () => {
    // A clue as high as the board places its whole line as one journey.
    for (let n = 0; n < 30; n++) {
      const board = dealt(game, params, n);
      const s = game.newState(params, board.desc);
      const res = game.hint?.(s, board.aux, game.newUi(s));
      if (!res?.ok) continue;
      const later = res.steps.find(
        (step) => step.continuesPrevious === true && step.move.type === "set",
      );
      if (later === undefined) continue;
      const v = game.judgeMove?.(s, game.executeMove(s, later.move));
      expect(v?.words.text).toMatch(/^Your last move followed from the board: /);
      expect(v?.words.text).not.toMatch(/: (\.\.\.|…)/);
      return;
    }
    throw new Error("no board's hint walked a journey of placements");
  });

  it("rings a placement only a chain reaches", () => {
    const s = fresh();
    const chained = [...s.grid.keys()]
      .filter((i) => s.grid[i] === 0)
      .map((i) => ({ i, v: game.judgeMove?.(s, placed(s, i)) }))
      .find(({ v }) => v?.words.text.includes("a few steps on"));
    if (!chained?.v) throw new Error("no placement on the board took a chain");
    expect(chained.v.followed).toBe(true);
    expect(chained.v.words.text).toMatch(/the ringed cell is decided/);
    expect(chained.v.highlights?.targets).toEqual([
      { x: chained.i % s.w, y: Math.floor(chained.i / s.w) },
    ]);
  });

  it("tells apart a value the walk never places", () => {
    const s = fresh();
    const i = [...s.grid.keys()].find((k) => s.grid[k] === 0) ?? -1;
    // Check & save judges only a sound board, so a wrong value stands in
    // for a right move no deduction reaches.
    const wrong = (answer[i] % s.w) + 1;
    const v = game.judgeMove?.(s, placed(s, i, wrong));
    expect(v?.followed).toBe(false);
    expect(v?.words.text).toMatch(/^Your last move was right, but nothing/);
  });

  const penciled = (s: TowersState): TowersState =>
    with_(s, (t) => {
      for (let i = 0; i < t.grid.length; i++)
        if (t.grid[i] === 0) for (let n = 1; n <= t.w; n++) t.pencil[i] |= 1 << n;
    });

  it("does not judge penciling every candidate in", () => {
    const s = fresh();
    expect(game.judgeMove?.(s, penciled(s))).toBeNull();
  });

  it("judges notes written into a cell with none by what they leave out", () => {
    const s = fresh();
    const i = [...s.grid.keys()].find((k) => s.grid[k] === 0) ?? -1;
    const one = with_(s, (t) => {
      t.pencil[i] = 1 << answer[i];
    });
    expect(game.judgeMove?.(s, one)?.followed).toBe(true);
  });

  it("judges a note struck from a cell's notes", () => {
    const s = penciled(fresh());
    const i = [...s.grid.keys()].find((k) => s.grid[k] === 0) ?? -1;
    const struck = with_(s, (t) => {
      t.pencil[i] &= ~(1 << ((answer[i] % s.w) + 1));
    });
    expect(game.judgeMove?.(s, struck)?.followed).toBe(true);
  });
});
