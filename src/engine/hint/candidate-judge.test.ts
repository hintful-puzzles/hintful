/**
 * The judge of a player's last move on a candidate plan (`candidate-judge.ts`),
 * on Towers: a move the board shows is named by its step's rung, one only a
 * chain reaches says so, a move a walk never makes is told apart, and the
 * notes are read as the player reads them, so penciling everything in is not
 * judged while writing fewer notes than the regions allow is. That each
 * judging game calls its hint's own steps followed is
 * `move-judge-games.test.ts`.
 */
import { describe, expect, it } from "vitest";
import { towersGame } from "../../games/towers/index.ts";
import type { TowersState } from "../../games/towers/state.ts";
import { NAMES } from "../../generated/games/towers/towers.compiled.ts";
import { dealt } from "../testing/dealt.ts";
import { verdictOf } from "./move-judge.ts";

const game = towersGame;
const params = game.defaultParams();
const { desc, aux } = dealt(game, params);
const fresh = (): TowersState => game.newState(params, desc);

const answer = (() => {
  const s = fresh();
  const solved = game.solve(s, s, aux);
  if (!solved?.ok) throw new Error("Towers did not solve its own board");
  return game.executeMove(s, solved.move).grid;
})();

function with_(s: TowersState, edit: (t: TowersState) => void): TowersState {
  const t = { ...s, grid: s.grid.slice(), pencil: s.pencil.slice() };
  edit(t);
  return t;
}

/** What a player calls the deduction of a step of `rung`. */
const nameOf = (rung: string): string => NAMES[rung as keyof typeof NAMES];

const DIRECT = /^Your last move follows from (?!the board)/;

const placed = (s: TowersState, i: number, n = answer[i]): TowersState =>
  with_(s, (t) => {
    t.grid[i] = n;
  });

describe("candidateJudge", () => {
  it("names a placement the board shows by its step's rung", () => {
    const s = fresh();
    const res = game.hint.plan(s, aux, game.newUi(s));
    if (!res?.ok) throw new Error("no hint");
    const step = res.steps[0];
    const v = game.hint.judgeMove?.(s, game.executeMove(s, step.move));
    expect(v?.followed).toBe(true);
    expect(v?.words.text).toMatch(DIRECT);
    expect(v?.words.text).toContain(nameOf(step.rung));
  });

  it("names directly a placement the board shows, though the hint takes it later", () => {
    const s = fresh();
    const res = game.hint.plan(s, aux, game.newUi(s));
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
    const v = game.hint.judgeMove?.(s, game.executeMove(s, later.move));
    expect(v?.words.text).toMatch(DIRECT);
    expect(v?.words.text).toContain(nameOf(later.rung));
  });

  it("names a journey's later leg as its first", () => {
    // A clue as high as the board places its whole line as one journey.
    for (let n = 0; n < 30; n++) {
      const board = dealt(game, params, n);
      const s = game.newState(params, board.desc);
      const res = game.hint.plan(s, board.aux, game.newUi(s));
      if (!res?.ok) continue;
      const later = res.steps.find(
        (step) => step.continuesPrevious === true && step.move.type === "set",
      );
      if (later === undefined) continue;
      const v = game.hint.judgeMove?.(s, game.executeMove(s, later.move));
      expect(v?.words.text).toMatch(DIRECT);
      expect(v?.words.text).toContain(nameOf(later.rung));
      return;
    }
    throw new Error("no board's hint walked a journey of placements");
  });

  it("says a placement only a chain reaches follows a few steps on", () => {
    const s = fresh();
    const chained = [...s.grid.keys()]
      .filter((i) => s.grid[i] === 0)
      .map((i) => game.hint.judgeMove?.(s, placed(s, i)))
      .find((v) => v?.words.text.includes("a few steps on"));
    if (!chained) throw new Error("no placement on the board took a chain");
    expect(chained.followed).toBe(true);
    // The plan hands the judge its trace, so where the chain began is named
    // (`move-judge.test.ts`, "where a chain began").
    const start = /^Your last move follows a few steps on, starting from (.+)\.$/.exec(
      chained.words.text,
    );
    expect(Object.values(NAMES)).toContain(start?.[1]);
  });

  it("tells apart a value the walk never places", () => {
    const s = fresh();
    const i = [...s.grid.keys()].find((k) => s.grid[k] === 0) ?? -1;
    // Check & save judges only a sound board, so a wrong value stands in
    // for a right move no deduction reaches.
    const wrong = (answer[i] % s.w) + 1;
    const v = game.hint.judgeMove?.(s, placed(s, i, wrong));
    expect(v?.followed).toBe(false);
    expect(v?.words.text).toBe(verdictOf({ kind: "unforced" }).words.text);
  });

  const penciled = (s: TowersState): TowersState =>
    with_(s, (t) => {
      for (let i = 0; i < t.grid.length; i++)
        if (t.grid[i] === 0) for (let n = 1; n <= t.w; n++) t.pencil[i] |= 1 << n;
    });

  it("does not judge penciling every candidate in", () => {
    const s = fresh();
    expect(game.hint.judgeMove?.(s, penciled(s))).toBeNull();
  });

  it("judges notes written into a cell with none by what they leave out", () => {
    const s = fresh();
    const i = [...s.grid.keys()].find((k) => s.grid[k] === 0) ?? -1;
    const one = with_(s, (t) => {
      t.pencil[i] = 1 << answer[i];
    });
    expect(game.hint.judgeMove?.(s, one)?.followed).toBe(true);
  });

  it("judges a note struck from a cell's notes", () => {
    const s = penciled(fresh());
    const i = [...s.grid.keys()].find((k) => s.grid[k] === 0) ?? -1;
    const struck = with_(s, (t) => {
      t.pencil[i] &= ~(1 << ((answer[i] % s.w) + 1));
    });
    expect(game.hint.judgeMove?.(s, struck)?.followed).toBe(true);
  });
});
