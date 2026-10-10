/**
 * Range's two tiers: Easy, which the three rules finish, and Unreasonable, a
 * board with one answer that they do not reach.
 *
 * The answer counts here come from {@link countAnswers}, which shades every
 * set of squares with no two side by side and none on a number, and reads
 * each against the numbers and for the clear squares being one group. It asks
 * nothing of the rules, the error checker or the search over them, so it can
 * say whether those are right that a board has one answer. It is for boards
 * of thirty squares or so.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { DESC_CONTRADICTORY, DESC_NOT_UNIQUE } from "../../engine/desc-error.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import { rangeGame } from "./index.ts";
import { answerOf, deductionFinishes, searchAnswers } from "./solver.ts";
import {
  BLACK,
  EMPTY,
  encodeDesc,
  newState,
  type RangeMove,
  type RangeParams,
} from "./state.ts";

/** How many ways squares with no number can be shaded, no two side by side,
 * so that each number sees its count and the clear squares are one group, as
 * far as `limit`. */
function countAnswers(clues: Int8Array, w: number, h: number, limit = 2): number {
  const n = w * h;
  const shaded = new Uint8Array(n);
  const holds = (): boolean => {
    for (let i = 0; i < n; i++) {
      const clue = clues[i] as number;
      if (clue <= 0) continue;
      const x = i % w;
      const y = (i - x) / w;
      let seen = 1;
      for (let c = x - 1; c >= 0 && !shaded[y * w + c]; c--) seen++;
      for (let c = x + 1; c < w && !shaded[y * w + c]; c++) seen++;
      for (let r = y - 1; r >= 0 && !shaded[r * w + x]; r--) seen++;
      for (let r = y + 1; r < h && !shaded[r * w + x]; r++) seen++;
      if (seen !== clue) return false;
    }
    const first = shaded.indexOf(0);
    if (first < 0) return true;
    const reachedFrom = new Uint8Array(n);
    reachedFrom[first] = 1;
    const todo = [first];
    let reached = 0;
    for (let i = todo.pop(); i !== undefined; i = todo.pop()) {
      reached++;
      const x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
        if (j < 0 || j >= n || shaded[j] || reachedFrom[j]) continue;
        reachedFrom[j] = 1;
        todo.push(j);
      }
    }
    return reached === shaded.filter((cell) => cell === 0).length;
  };
  let count = 0;
  const place = (i: number): void => {
    if (count >= limit) return;
    if (i === n) {
      if (holds()) count++;
      return;
    }
    place(i + 1);
    if ((clues[i] as number) > 0) return;
    if ((i % w > 0 && shaded[i - 1]) || (i >= w && shaded[i - w])) return;
    shaded[i] = 1;
    place(i + 1);
    shaded[i] = 0;
  };
  place(0);
  return count;
}

const sized = (w: number, h: number, diff: number): RangeParams => ({ w, h, diff });

/** A 4x4 board for each thing a board can be. */
const FOUR = sized(4, 4, DIFF_EASY);
/** One answer, which the rules stop short of. */
const NEEDS_SEARCH = "d3_4d4_5d";
/** One answer, which the rules reach. */
const SOLVER_FINISHES = "2f6_4f4";
/** No number at all. */
const MANY_ANSWERS = "p";
/** A 7 in one corner, which sees its whole row and column, and a 1 in the
 * opposite corner, which is shut in. */
const NO_ANSWER = "7n1";

const cluesOf = (desc: string): Int8Array => newState(FOUR, desc).clues;

describe("the count of a Range board's answers that the tests go by", () => {
  it("counts the boards whose answers are known", () => {
    const count = (desc: string, limit?: number) =>
      countAnswers(cluesOf(desc), 4, 4, limit);
    expect(count(SOLVER_FINISHES)).toBe(1);
    expect(count(NEEDS_SEARCH, 100)).toBe(1);
    expect(count(NO_ANSWER)).toBe(0);
    // The board `untiered-load.test.ts` held: it has three answers.
    expect(count("c6h3_6b", 100)).toBe(3);
    // A 2x1 board with no number: neither square shaded, or either one.
    expect(countAnswers(Int8Array.from([EMPTY, EMPTY]), 2, 1, 100)).toBe(3);
    // A row of three with a 2 at one end: the far end is shaded.
    expect(countAnswers(Int8Array.from([2, EMPTY, EMPTY]), 3, 1, 100)).toBe(1);
  });
});

describe("range's search for a board's answers", () => {
  const answers = (desc: string, budget?: number) =>
    searchAnswers(cluesOf(desc), 4, 4, budget).kind;

  it("says one, several or none", () => {
    expect(answers(NEEDS_SEARCH)).toBe("one");
    expect(answers(SOLVER_FINISHES)).toBe("one");
    expect(answers(MANY_ANSWERS)).toBe("several");
    expect(answers(NO_ANSWER)).toBe("none");
  });

  it("says neither once its budget is spent", () => {
    // The rules finish a board in the one position the search starts from.
    expect(answers(SOLVER_FINISHES, 1)).toBe("one");
    expect(answers(NEEDS_SEARCH, 1)).toBe("out-of-reach");
  });

  // Which square is assumed, and which way first, is part of the budget: it
  // decides which boards are dealt and which pasted ones open.
  it("takes exactly nine positions for a board that needs them", () => {
    expect(answers(NEEDS_SEARCH, 8)).toBe("out-of-reach");
    expect(answers(NEEDS_SEARCH, 9)).toBe("one");
  });

  // So is how early a position no answer fits is seen to be one: while it
  // still has undecided squares, by a number that can no longer see its
  // count. Waiting for a full grid takes this board five positions, and one
  // 9x13 board 231 for 13.
  it("sees a position no answer fits before it is full", () => {
    expect(countAnswers(cluesOf("a3d4b4d5a"), 4, 4)).toBe(1);
    expect(answers("a3d4b4d5a", 2)).toBe("out-of-reach");
    expect(answers("a3d4b4d5a", 3)).toBe("one");
  });

  it("takes one position for every Easy board", () => {
    for (const [w, h] of [
      [4, 4],
      [6, 9],
      [8, 12],
    ] as const) {
      const p = sized(w, h, DIFF_EASY);
      for (let seed = 0; seed < 8; seed++) {
        const { desc } = rangeGame.newDesc(p, randomNew(`one-position-${seed}`));
        expect(searchAnswers(newState(p, desc).clues, w, h, 1).kind, desc).toBe("one");
      }
    }
  });

  it("agrees with the count on boards of every kind", () => {
    // Dealt boards, which have one answer; the same with a number taken
    // away, which often have several; and with one number changed, which
    // mostly have none.
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    for (const [w, h] of [
      [2, 3],
      [3, 4],
      [4, 4],
      [4, 5],
      [5, 5],
      [3, 7],
    ] as const) {
      const judge = (clues: Int8Array, label: string): void => {
        const answer = searchAnswers(clues, w, h);
        tally[answer.kind]++;
        const count = countAnswers(clues, w, h);
        expect(answer.kind, label).toBe(
          count === 0 ? "none" : count === 1 ? "one" : "several",
        );
      };
      for (let seed = 0; seed < 30; seed++) {
        const rng = randomNew(`agree-${w}x${h}-${seed}`);
        const p = sized(w, h, seed % 2 === 0 ? DIFF_EASY : DIFF_UNREASONABLE);
        const dealt = newState(p, rangeGame.newDesc(p, rng).desc).clues;
        const label = `${w}x${h} seed ${seed}`;
        judge(dealt, label);

        const shown = Array.from(dealt, (v, i) => (v > 0 ? i : -1)).filter(
          (i) => i >= 0,
        );
        if (shown.length === 0) continue;
        const fewer = dealt.slice();
        fewer[shown[randomUpto(rng, shown.length)] as number] = EMPTY;
        judge(fewer, `${label}, a number taken away`);

        const changed = dealt.slice();
        const at = shown[randomUpto(rng, shown.length)] as number;
        changed[at] = ((changed[at] as number) % 5) + 1;
        judge(changed, `${label}, one number changed`);
      }
    }
    expect(tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(220);
    expect(tally.several).toBeGreaterThan(100);
    expect(tally.none).toBeGreaterThan(100);
  });
});

describe("an Unreasonable Range board", () => {
  it.each([
    sized(2, 3, DIFF_UNREASONABLE),
    sized(4, 4, DIFF_UNREASONABLE),
    sized(5, 5, DIFF_UNREASONABLE),
    sized(6, 9, DIFF_UNREASONABLE),
  ])("%o is dealt with one answer that the rules do not reach", (p) => {
    for (let seed = 0; seed < 3; seed++) {
      const { desc } = rangeGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      const n = p.w * p.h;
      expect(deductionFinishes(state.clues, p.w, p.h), desc).toBe(false);
      if (n <= 25) expect(countAnswers(state.clues, p.w, p.h), desc).toBe(1);
      // Its numbers are still turned half way round onto each other.
      for (let i = 0; i < n; i++)
        expect((state.clues[i] as number) > 0, desc).toBe(
          (state.clues[n - 1 - i] as number) > 0,
        );
      // And the answer Solve and the mistake check go by solves it.
      const solved = rangeGame.solve?.(state, state);
      if (!solved?.ok) throw new Error(`${desc}: no answer found`);
      expect(rangeGame.status(rangeGame.executeMove(state, solved.move)), desc).toBe(
        "solved",
      );
    }
  });

  // The smallest boards that carry the tier.
  describeDealtTiers(rangeGame, ["2x3du", "3x4du", "4x4du"]);
  // The largest preset.
  describeDealtTiers(rangeGame, ["11x16du"], { seldom: true });

  /**
   * Every board of a shape: each way of shading it that the rules allow, with
   * each set of its clear squares showing its number. That is more than the
   * generator can deal, which keeps its numbers symmetric.
   */
  const eachBoard = (w: number, h: number, visit: (clues: Int8Array) => void): void => {
    const n = w * h;
    for (let blacks = 0; blacks < 1 << n; blacks++) {
      const grid = new Int8Array(n);
      for (let i = 0; i < n; i++) if ((blacks >> i) & 1) grid[i] = BLACK;
      // The grid with every clear square a number: a board the count calls
      // one answer exactly when the shading is allowed.
      const whites: number[] = [];
      for (let i = 0; i < n; i++) {
        if (grid[i] === BLACK) continue;
        whites.push(i);
        const x = i % w;
        const y = (i - x) / w;
        let seen = 1;
        for (let c = x - 1; c >= 0 && grid[y * w + c] !== BLACK; c--) seen++;
        for (let c = x + 1; c < w && grid[y * w + c] !== BLACK; c++) seen++;
        for (let r = y - 1; r >= 0 && grid[r * w + x] !== BLACK; r--) seen++;
        for (let r = y + 1; r < h && grid[r * w + x] !== BLACK; r++) seen++;
        grid[i] = seen;
      }
      const full = grid.map((v) => (v === BLACK ? EMPTY : v));
      if (countAnswers(full, w, h) !== 1) continue;
      for (let shown = 0; shown < 1 << whites.length; shown++) {
        const clues = new Int8Array(n);
        whites.forEach((cell, k) => {
          if ((shown >> k) & 1) clues[cell] = full[cell] as number;
        });
        visit(clues);
      }
    }
  };

  /** How many boards of the shape the rules leave unfinished with exactly
   * one answer, how many of those have their numbers turned half way round
   * onto each other as a dealt board's are, and how many the rules finish. */
  const needingSearch = (
    w: number,
    h: number,
  ): { found: number; symmetric: number; finished: number } => {
    const n = w * h;
    let found = 0;
    let symmetric = 0;
    let finished = 0;
    eachBoard(w, h, (clues) => {
      if (deductionFinishes(clues, w, h)) {
        finished++;
        return;
      }
      if (countAnswers(clues, w, h) !== 1) return;
      found++;
      if (clues.every((v, i) => v > 0 === (clues[n - 1 - i] as number) > 0))
        symmetric++;
    });
    return { found, symmetric, finished };
  };

  // Each of these is every board of its shape, so it is a proof for it.
  it.each([
    [1, 3],
    [1, 5],
    [1, 8],
  ])("no %ix%i board needs a search and has one answer", (w, h) => {
    const { found, finished } = needingSearch(w, h);
    expect(found).toBe(0);
    expect(finished).toBeGreaterThan(0);
  });

  // The same walk finds the tier on the smallest board that has it, so it
  // can see one.
  it("a 2x3 board can need a search and have one answer", () => {
    expect(needingSearch(2, 3).found).toBeGreaterThan(0);
  });

  // The generator ran its retry bound out on a 3x3 board every time it was
  // asked, 300,000 draws in all. The walk says what that is and is not: 3x3
  // boards with the tier exist, so the size is not refused as having none,
  // and none of them has symmetric numbers, so the generator cannot deal one
  // and gives up in about a second.
  it("a 3x3 board can too, though never with symmetric numbers", () => {
    expect(needingSearch(3, 3)).toEqual({ found: 176, symmetric: 0, finished: 4253 });
  });

  describeAbsentTiers(rangeGame, ["1x6du", "7x1du"]);
});

describe("a pasted Range board", () => {
  const load = (id: string) => {
    const me = new Midend(rangeGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`4x4:${NEEDS_SEARCH}`)).toBe("4x4du");
    expect(load(`4x4de:${NEEDS_SEARCH}`)).toBe("4x4du");
    expect(load(`4x4du:${NEEDS_SEARCH}`)).toBe("4x4du");
  });

  it("that the rules finish opens as Easy", () => {
    expect(load(`4x4:${SOLVER_FINISHES}`)).toBe("4x4de");
    expect(load(`4x4de:${SOLVER_FINISHES}`)).toBe("4x4de");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`4x4:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x4du:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    // The board `untiered-load.test.ts` held as one deduction does not
    // finish: it has three answers.
    expect(load("4x4:c6h3_6b")).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x4:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable Range board", () => {
  it("stops where the rules do, and goes on from a square filled rightly", () => {
    const p = sized(4, 4, DIFF_UNREASONABLE);
    const me = new Midend(rangeGame);
    expect(me.newGameFromId(`4x4du:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");

    /** The first undecided square, filled as the answer has it (or the other
     * way). */
    const firstEmpty = (rightly: boolean): RangeMove | null => {
      const i = state.grid.indexOf(EMPTY);
      if (i < 0) return null;
      const shaded = (answer.solution[i] === BLACK) === rightly;
      return {
        sets: [
          { r: Math.floor(i / p.w), c: i % p.w, value: shaded ? "black" : "white" },
        ],
      };
    };

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (let plan = rangeGame.hint?.(state); plan?.ok; plan = rangeGame.hint?.(state))
        for (const step of plan.steps) {
          state = rangeGame.executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    followHint();
    expect(rangeGame.status(state)).toBe("ongoing");
    expect(rangeGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    // A square filled wrongly is what the mistake check is there to catch.
    const wrong = firstEmpty(false);
    if (!wrong) throw new Error("no undecided square where the hint stopped");
    const tried = rangeGame.executeMove(state, wrong);
    expect(rangeGame.findMistakes?.(tried)?.length).toBeGreaterThan(0);

    // Filling squares rightly, one at a time, the hint finishes the board.
    for (let tries = 0; rangeGame.status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(16);
      const move = firstEmpty(true);
      if (!move) break;
      state = rangeGame.executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(rangeGame.status(state)).toBe("solved");
  });
});

describe("the tier in Range's params", () => {
  const refusal = (id: string) =>
    paramsError(rangeGame, rangeGame.decodeParams(id), true);

  it("is written in the full form only", () => {
    const p = sized(9, 13, DIFF_UNREASONABLE);
    expect(rangeGame.encodeParams(p, true)).toBe("9x13du");
    expect(rangeGame.encodeParams(p, false)).toBe("9x13");
    expect(rangeGame.decodeParams("9x13du")).toEqual(p);
    expect(encodeDesc(4, Int8Array.from([2, 0, 0, 2]))).toBe("2b2");
  });

  it("is refused only where no board has it", () => {
    expect(refusal("6x9du")).toBeNull();
    expect(refusal("2x3du")).toBeNull();
    expect(refusal("3x4du")).toBeNull();
    expect(refusal("3x3de")).toBeNull();
    expect(refusal("3x3du")).toBeNull();
    expect(refusal("1x6de")).toBeNull();
    expect(refusal("1x6du")).toBe("No 1x6 puzzle is Unreasonable.");
    expect(refusal("40x1du")).toBe("No 40x1 puzzle is Unreasonable.");
  });

  it("bounds an Unreasonable board by its area", () => {
    expect(refusal("15x20du")).toBeNull();
    expect(refusal("5x60du")).toBeNull();
    expect(refusal("2x126du")).toBeNull();
    expect(refusal("18x18du")).toMatch(/at most 300 squares/);
    expect(refusal("3x125du")).toMatch(/at most 300 squares/);
    expect(refusal("18x18de")).toBeNull();
    // A board that arrives with its description is not held to it.
    expect(paramsError(rangeGame, sized(18, 18, DIFF_UNREASONABLE), false)).toBeNull();
  });
});
