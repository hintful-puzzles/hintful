/*
 * A game with no difficulty tiers says whether deduction finishes a board, and
 * says it truly.
 *
 * A tiered game's pasted board is held to its solver through the tiers. An
 * untiered one is held through `finishesByDeduction`, and without an answer
 * every board that parses loads: Palisade would open `5x5n5:a`, a board with
 * no clues, and its hint throws on the first press. `registerGame` refuses a
 * game that does not answer, so what is left to hold is an answer that says
 * yes too readily: `nothingToDeduce`, which turns the check off, and a test
 * of a game's own.
 */
import { describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { DESC_NOT_DEDUCIBLE, loadVerdict, validateDesc } from "./desc-error.ts";
import { fakeGame } from "./fake-game.ts";
import { hintAndSolveFinish, nothingToDeduce } from "./hint-finishes.ts";
import { PUZZLE_NOT_REASONABLE } from "./hint-refusal.ts";
import { _resetRegistry, registerGame } from "./registry.ts";
import { NO_SOLUTION } from "./solve-failure.ts";
import { stripComments } from "./testing/code-lines.ts";
import {
  membersNotMentioning,
  REGISTERED_GAME_COUNT,
  REGISTERED_GAMES,
} from "./testing/enrollment.ts";

const UNTIERED = REGISTERED_GAMES.filter(([, game]) => game.difficulty === undefined);

/**
 * What a game's code writes to end a hint with "nothing further follows by
 * deduction": the refusal itself, or a call that returns it for the game.
 * {@link RELAYS} is held to the engine's own source below, so a second helper
 * that returns the refusal cannot go unlisted.
 */
const RELAYS: Record<string, string> = {
  "candidate-hint.ts": "candidateHint(",
};
const REFUSAL = "DEDUCTION_EXHAUSTED";

/** The untiered games whose own code can end a hint that way. */
function canRunOutOfDeduction(): string[] {
  const ids = UNTIERED.map(([id]) => id);
  const mentions = (marker: string) => {
    const without = new Set(membersNotMentioning(ids, marker));
    return (id: string) => !without.has(id);
  };
  const ways = [REFUSAL, ...Object.values(RELAYS)].map(mentions);
  return ids.filter((id) => ways.some((names) => names(id)));
}

describe("an untiered game's answer to whether deduction finishes a board", () => {
  it("is given by every one of them", () => {
    expect(REGISTERED_GAME_COUNT).toBeGreaterThanOrEqual(57);
    expect(UNTIERED.length).toBeGreaterThanOrEqual(20);
    const silent = UNTIERED.filter(
      ([, game]) => game.finishesByDeduction === undefined,
    );
    expect(silent.map(([id]) => id)).toEqual([]);
  });

  it("is nothingToDeduce exactly where the hint cannot run out of deduction", () => {
    const declared = UNTIERED.filter(
      ([, game]) => game.finishesByDeduction !== nothingToDeduce,
    ).map(([id]) => id);
    // Both halves have members, or the comparison is between two empty lists.
    // The deducing half shrinks as its games gain tiers and leave the
    // untiered ones; Mines, whose answer is hidden, is the one that stays.
    expect(declared.length).toBeGreaterThanOrEqual(1);
    expect(UNTIERED.length - declared.length).toBeGreaterThanOrEqual(10);
    expect(declared).toEqual(canRunOutOfDeduction());
  });

  /**
   * A game ID each such game reads and deduction does not finish, so that a
   * test of a game's own that always says yes is not taken for an answer. One
   * entry per game that does not answer `nothingToDeduce`, held to that set.
   */
  const NOT_FINISHED: Record<string, string> = {
    mines: "8x8n10:4,4,u02800402a20040a0",
    net: "5x5:142c49b8aa4de5acd7b749286",
    range: "4x4:c6h3_6b",
    rect: "4x4:2b2_2a2b2b2a2_2",
    signpost: "4x4c:1eceeedagdahgbbb16a",
    sticks: "5x5b20s2:1aB_1_2bBcB1aB3cB_1a3aB0a1",
  };

  it("refuses a board that parses and deduction does not finish", () => {
    const deducing = UNTIERED.filter(
      ([, game]) => game.finishesByDeduction !== nothingToDeduce,
    );
    expect(Object.keys(NOT_FINISHED).sort()).toEqual(deducing.map(([id]) => id));
    for (const [id, game] of deducing) {
      const gameId = NOT_FINISHED[id] as string;
      const sep = gameId.indexOf(":");
      const params = game.decodeParams(gameId.slice(0, sep));
      const desc = gameId.slice(sep + 1);
      expect(validateDesc(game, params, desc), `${id} reads ${gameId}`).toBeNull();
      expect(loadVerdict(game, params, desc), `${id} refuses ${gameId}`).toBe(
        DESC_NOT_DEDUCIBLE,
      );
    }
  });

  it("counts every engine helper that returns the refusal for a game", () => {
    const modules = import.meta.glob<string>("./*.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    });
    const returning = Object.entries(modules)
      .filter(([path]) => !path.includes(".test."))
      .filter(([, text]) => stripComments(text).includes(`error: ${REFUSAL}`))
      .map(([path]) => path.slice(2))
      .sort();
    expect(Object.keys(modules).length).toBeGreaterThanOrEqual(50);
    // The fake game is a game, not a helper one calls.
    expect(returning).toEqual([...Object.keys(RELAYS), "fake-game.ts"].sort());
  });
});

describe("registering a game", () => {
  /** What `registerGame` throws for `game`, with the registry put back. */
  function refusal(game: typeof fakeGame): string | null {
    try {
      registerGame(game);
      return null;
    } catch (e) {
      return String(e);
    } finally {
      _resetRegistry();
      registerAllGames();
    }
  }

  it("refuses an untiered game that does not say whether deduction finishes a board", () => {
    expect(fakeGame.difficulty).toBeUndefined();
    expect(refusal({ ...fakeGame, finishesByDeduction: undefined })).toMatch(
      /says whether deduction finishes a board/,
    );
    expect(refusal({ ...fakeGame, finishesByDeduction: nothingToDeduce })).toBeNull();
  });

  it("refuses a game that says a board has no solution in two ways", () => {
    const proving = {
      ...fakeGame,
      finishesByDeduction: nothingToDeduce,
      hasNoSolution: () => false,
    };
    expect(fakeGame.findMistakes).toBeUndefined();
    expect(refusal(proving)).toBeNull();
    expect(refusal({ ...proving, findMistakes: () => [] })).toMatch(
      /leaves hasNoSolution out/,
    );
  });

  it("refuses a tiered game that answers a second time", () => {
    const tiered = { ...fakeGame, difficulty: { solveAtCap: () => "solved" as const } };
    expect(refusal({ ...tiered, finishesByDeduction: undefined })).toBeNull();
    expect(refusal({ ...tiered, finishesByDeduction: nothingToDeduce })).toMatch(
      /leaves finishesByDeduction out/,
    );
  });
});

describe("hintAndSolveFinish", () => {
  const start = { count: 0, target: 3 };
  /** The fake game with a hint that plans one step and stops at `reach`. */
  const hinting = (reach: number, solves = true): typeof fakeGame => ({
    ...fakeGame,
    hint: (s) =>
      s.count < reach
        ? { ok: true, steps: [{ move: "inc", rung: "inc", explanation: "" }] }
        : { ok: false, error: PUZZLE_NOT_REASONABLE },
    solve: () =>
      solves ? { ok: true, move: "solve" } : { ok: false, error: NO_SOLUTION },
  });

  it("follows the hint, a plan at a time, to a solved board", () => {
    expect(hintAndSolveFinish(hinting(3), start)).toBe(true);
  });

  it("says no where the hint stops short", () => {
    expect(hintAndSolveFinish(hinting(2), start)).toBe(false);
  });

  it("says no where Solve refuses, whatever the hint can do", () => {
    expect(hintAndSolveFinish(hinting(3, false), start)).toBe(false);
  });

  it("throws for a game with no hint to follow", () => {
    expect(() => hintAndSolveFinish({ ...fakeGame, hint: undefined }, start)).toThrow(
      /needs a hint/,
    );
  });
});
