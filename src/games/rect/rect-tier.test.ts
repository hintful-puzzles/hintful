/**
 * Rectangles' two tiers: Easy, which the hint finishes, and Unreasonable, a
 * board with one answer that the solver and the hint both stop short of.
 *
 * The answer counts here come from {@link countDivisions}, which covers the
 * grid a rectangle at a time from its first uncovered square, keeping a
 * rectangle only where it holds exactly one number and that number is its
 * area. It asks nothing of the solver or the search over it, so it can say
 * whether those two are right that a board has one answer.
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
import { itSlow } from "../../engine/testing/slow.ts";
import type { Rect } from "../../engine/types.ts";
import { rungsFinish } from "./hint.ts";
import { rectGame } from "./index.ts";
import { executeMove, isSolved, newState } from "./moves.ts";
import { answerOf, searchAnswers, solverFinishes } from "./solver.ts";
import { encodeNumbers, type RectMove, type RectParams } from "./state.ts";

/** Call `visit` with each rectangle whose top left is square `i`, lies on
 * squares `covered` leaves free, and has at least `minArea` squares. */
function eachRectAt(
  w: number,
  h: number,
  covered: Uint8Array,
  i: number,
  minArea: number,
  visit: (r: Rect) => void,
): void {
  const x0 = i % w;
  const y0 = (i - x0) / w;
  let widest = 0;
  while (x0 + widest < w && !covered[y0 * w + x0 + widest]) widest++;
  for (let rw = 1; rw <= widest; rw++)
    for (let rh = 1; y0 + rh <= h; rh++)
      if (rw * rh >= minArea) visit({ x: x0, y: y0, w: rw, h: rh });
}

function mark(w: number, covered: Uint8Array, r: Rect, value: number): void {
  for (let y = r.y; y < r.y + r.h; y++)
    for (let x = r.x; x < r.x + r.w; x++) covered[y * w + x] = value;
}

/** How many ways the grid divides into rectangles that each hold exactly one
 * number, equal to its area, as far as `limit`. */
function countDivisions(
  w: number,
  h: number,
  grid: ArrayLike<number>,
  limit = 2,
): number {
  const covered = new Uint8Array(w * h);
  let count = 0;
  const fill = (from: number): void => {
    if (count >= limit) return;
    let i = from;
    while (i < w * h && covered[i]) i++;
    if (i === w * h) {
      count++;
      return;
    }
    // The first uncovered square is the top left of its rectangle.
    eachRectAt(w, h, covered, i, 1, (r) => {
      let numbers = 0;
      let value = 0;
      for (let y = r.y; y < r.y + r.h; y++)
        for (let x = r.x; x < r.x + r.w; x++)
          if (grid[y * w + x]) {
            numbers++;
            value = grid[y * w + x] as number;
          }
      if (numbers !== 1 || value !== r.w * r.h) return;
      mark(w, covered, r, 1);
      fill(i + 1);
      mark(w, covered, r, 0);
    });
  };
  fill(0);
  return count;
}

const sized = (w: number, h: number, diff: number, expandfactor = 0): RectParams => ({
  w,
  h,
  expandfactor,
  diff,
});

/** A 5x5 board for each thing a board can be. */
const FIVE = sized(5, 5, DIFF_EASY);
/** One answer, which the solver and the hint stop short of. */
const NEEDS_SEARCH = "a3b3_2a3e4b4_2f4";
/** One answer, which the solver reaches. */
const SOLVER_FINISHES = "b2_2a2_2_2_2j3_3_2_2_3a";
/** Five 5s down the first column: the rows, and nothing else. */
const FIVE_ROWS = "5d5d5d5d5d";
/** The same with a 6, so that the numbers come to one square too many. */
const NO_ANSWER = "5d5d5d5d6d";
/** A 4x4 board with several answers, which `untiered-load.test.ts` held as
 * one deduction does not finish. */
const MANY_ANSWERS_4X4 = "2b2_2a2b2b2a2_2";

const numbersOf = (p: RectParams, desc: string): Int32Array => newState(p, desc).grid;

describe("the count of a Rectangles board's answers that the tests go by", () => {
  it("counts the boards whose answers are known", () => {
    const count = (desc: string, limit?: number) =>
      countDivisions(5, 5, numbersOf(FIVE, desc), limit);
    expect(count(SOLVER_FINISHES)).toBe(1);
    expect(count(NEEDS_SEARCH, 100)).toBe(1);
    expect(count(FIVE_ROWS, 100)).toBe(1);
    expect(count(NO_ANSWER)).toBe(0);
    expect(
      countDivisions(4, 4, numbersOf(sized(4, 4, DIFF_EASY), MANY_ANSWERS_4X4), 100),
    ).toBeGreaterThan(1);
    // Two 2s on a 2x2 board, corner to corner: two rows or two columns.
    expect(countDivisions(2, 2, [2, 0, 0, 2], 100)).toBe(2);
    // Side by side they are the two columns.
    expect(countDivisions(2, 2, [2, 2, 0, 0], 100)).toBe(1);
  });
});

describe("rect's search for a board's answers", () => {
  const answers = (desc: string, budget?: number) =>
    searchAnswers(5, 5, numbersOf(FIVE, desc), budget).kind;

  it("says one, several or none", () => {
    expect(answers(NEEDS_SEARCH)).toBe("one");
    expect(answers(SOLVER_FINISHES)).toBe("one");
    expect(answers(NO_ANSWER)).toBe("none");
    expect(
      searchAnswers(4, 4, numbersOf(sized(4, 4, DIFF_EASY), MANY_ANSWERS_4X4)).kind,
    ).toBe("several");
    // No number at all: nothing divides the grid.
    expect(answers("y")).toBe("none");
  });

  it("says neither once its budget is spent", () => {
    // The solver finishes a board in the one position the search starts from.
    expect(answers(SOLVER_FINISHES, 1)).toBe("one");
    expect(answers(NEEDS_SEARCH, 1)).toBe("out-of-reach");
  });

  // Which number is assumed is part of the budget: it decides which boards
  // are dealt and which pasted ones open.
  it("takes exactly three positions for a board that needs them", () => {
    expect(answers(NEEDS_SEARCH, 2)).toBe("out-of-reach");
    expect(answers(NEEDS_SEARCH, 3)).toBe("one");
  });

  it("takes one position for every Easy board", () => {
    for (const side of [5, 7, 9]) {
      const p = sized(side, side, DIFF_EASY);
      for (let seed = 0; seed < 8; seed++) {
        const { desc } = rectGame.newDesc(p, randomNew(`one-position-${seed}`));
        expect(searchAnswers(side, side, numbersOf(p, desc), 1).kind, desc).toBe("one");
      }
    }
  });

  it("agrees with the count on boards of every kind", () => {
    // Dealt boards, which have one answer; the same with a number moved to
    // the square beside it, which often have none or several; and with two
    // numbers swapped.
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    for (const [w, h] of [
      [4, 5],
      [5, 5],
      [6, 6],
      [3, 8],
      [7, 7],
    ] as const) {
      const judge = (grid: Int32Array, label: string): void => {
        const answer = searchAnswers(w, h, grid);
        tally[answer.kind]++;
        const count = countDivisions(w, h, grid);
        expect(answer.kind, label).toBe(
          count === 0 ? "none" : count === 1 ? "one" : "several",
        );
      };
      for (let seed = 0; seed < 30; seed++) {
        const rng = randomNew(`agree-${w}x${h}-${seed}`);
        const p = sized(w, h, seed % 2 === 0 ? DIFF_EASY : DIFF_UNREASONABLE);
        const dealt = numbersOf(p, rectGame.newDesc(p, rng).desc);
        const label = `${w}x${h} seed ${seed}`;
        judge(dealt, label);

        const shown = Array.from(dealt, (v, i) => (v ? i : -1)).filter((i) => i >= 0);
        const moved = dealt.slice();
        for (let tries = 0; tries < 20; tries++) {
          const from = shown[randomUpto(rng, shown.length)] as number;
          const to = from + ([1, -1, w, -w][randomUpto(rng, 4)] as number);
          const sameRowOrColumn = Math.abs((to % w) - (from % w)) <= 1;
          if (to < 0 || to >= w * h || moved[to] || !sameRowOrColumn) continue;
          moved[to] = moved[from] as number;
          moved[from] = 0;
          break;
        }
        judge(moved, `${label}, a number moved`);

        const swapped = dealt.slice();
        const a = shown[randomUpto(rng, shown.length)] as number;
        const b = shown[randomUpto(rng, shown.length)] as number;
        swapped[a] = dealt[b] as number;
        swapped[b] = dealt[a] as number;
        judge(swapped, `${label}, two numbers swapped`);
      }
    }
    expect(tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(220);
    expect(tally.several).toBeGreaterThan(15);
    expect(tally.none).toBeGreaterThan(100);
  });
});

describe("an Unreasonable Rectangles board", () => {
  it.each([
    sized(5, 5, DIFF_UNREASONABLE),
    sized(7, 7, DIFF_UNREASONABLE),
    sized(3, 10, DIFF_UNREASONABLE),
    sized(11, 11, DIFF_UNREASONABLE, Math.fround(0.5)),
  ])("%o is dealt with one answer that the solver and the hint do not reach", (p) => {
    for (let seed = 0; seed < 3; seed++) {
      const { desc, aux } = rectGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      expect(solverFinishes(p.w, p.h, state.grid), desc).toBe(false);
      expect(rungsFinish(state), desc).toBe(false);
      if (p.w * p.h <= 49) expect(countDivisions(p.w, p.h, state.grid), desc).toBe(1);
      // The answer the mistake check goes by is the division the board was
      // drawn as, which Solve replays.
      const searched = rectGame.solve?.(state, state);
      const replayed = rectGame.solve?.(state, state, aux);
      if (!searched?.ok || !replayed?.ok) throw new Error(`${desc}: no answer found`);
      expect(searched.move).toEqual(replayed.move);
      expect(isSolved(executeMove(state, searched.move)), desc).toBe(true);
    }
  });

  // The smallest boards the generator deals at the tier, and a thin one.
  describeDealtTiers(rectGame, ["4x5du", "5x5du", "3x10du"]);
  // The largest board on the menu at the tier, and the largest dealt at it.
  describeDealtTiers(rectGame, ["15x15du", "19x19du"], { seldom: true });

  /**
   * Every board of a shape: each division of it into rectangles, with each
   * rectangle's number on each of its squares. That takes in boards with a 1
   * on them, which the generator does not deal and a player can paste.
   */
  const eachBoard = (w: number, h: number, visit: (grid: Int32Array) => void): void => {
    const covered = new Uint8Array(w * h);
    const rects: Rect[] = [];
    const numbers = new Int32Array(w * h);
    const place = (k: number): void => {
      const r = rects[k];
      if (r === undefined) {
        visit(numbers);
        return;
      }
      for (let y = r.y; y < r.y + r.h; y++)
        for (let x = r.x; x < r.x + r.w; x++) {
          numbers[y * w + x] = r.w * r.h;
          place(k + 1);
          numbers[y * w + x] = 0;
        }
    };
    const fill = (from: number): void => {
      let i = from;
      while (i < w * h && covered[i]) i++;
      if (i === w * h) {
        place(0);
        return;
      }
      eachRectAt(w, h, covered, i, 1, (r) => {
        mark(w, covered, r, 1);
        rects.push(r);
        fill(i + 1);
        rects.pop();
        mark(w, covered, r, 0);
      });
    };
    fill(0);
  };

  /** How many boards of the shape have one answer that neither the solver
   * nor the hint reaches, and how many boards there are. */
  const needingSearch = (w: number, h: number): { found: number; boards: number } => {
    const p = sized(w, h, DIFF_EASY);
    let found = 0;
    let boards = 0;
    eachBoard(w, h, (grid) => {
      boards++;
      if (solverFinishes(w, h, grid)) return;
      if (countDivisions(w, h, grid) !== 1) return;
      if (!rungsFinish(newState(p, encodeNumbers(grid, w * h)))) found++;
    });
    return { found, boards };
  };

  // Each of these is every board of its shape, so it is a proof for it.
  it.each([
    [1, 2, 3],
    [1, 5, 55],
    [1, 8, 987],
    [2, 2, 21],
    [2, 3, 152],
    [2, 4, 1133],
    [2, 5, 8535],
    [3, 3, 3232],
  ])("no %ix%i board needs a search and has one answer", (w, h, count) => {
    expect(needingSearch(w, h)).toEqual({ found: 0, boards: count });
  });

  itSlow.each([
    [2, 6, 64_520],
    [2, 7, 488_291],
    [2, 8, 3_696_773],
    [3, 4, 71_624],
  ])("no %ix%i board needs a search and has one answer", (w, h, count) => {
    expect(needingSearch(w, h)).toEqual({ found: 0, boards: count });
  });

  // The same walk finds the tier on the smallest boards that have it, so it
  // can see one. The generator deals a 3x5 board of it once in 6,500 draws.
  itSlow("a 3x5 board can need a search and have one answer", () => {
    expect(needingSearch(3, 5).found).toBe(48);
  });

  describeAbsentTiers(rectGame, ["1x9du", "2x8du", "3x3du", "4x3du"], { budgets: 1 });
});

describe("a pasted Rectangles board", () => {
  const load = (id: string) => {
    const me = new Midend(rectGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`5x5:${NEEDS_SEARCH}`)).toBe("5x5du");
    expect(load(`5x5de:${NEEDS_SEARCH}`)).toBe("5x5du");
    expect(load(`5x5du:${NEEDS_SEARCH}`)).toBe("5x5du");
  });

  it("that the hint finishes opens as Easy", () => {
    expect(load(`5x5:${SOLVER_FINISHES}`)).toBe("5x5de");
    expect(load(`5x5de:${SOLVER_FINISHES}`)).toBe("5x5de");
    expect(load(`5x5:${FIVE_ROWS}`)).toBe("5x5de");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`4x4:${MANY_ANSWERS_4X4}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x4du:${MANY_ANSWERS_4X4}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`5x5:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable Rectangles board", () => {
  it("stops short, and goes on from a rectangle drawn rightly", () => {
    const p = sized(5, 5, DIFF_UNREASONABLE);
    const me = new Midend(rectGame);
    expect(me.newGameFromId(`5x5du:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");
    const { hedge, vedge } = answer.solution;

    /** The answer's rectangle over the first square not yet in a finished
     * one. */
    const nextRect = (): Rect | null => {
      const i = state.correct.indexOf(0);
      if (i < 0) return null;
      let x = i % p.w;
      let y = (i - x) / p.w;
      while (x > 0 && !vedge[y * p.w + x]) x--;
      while (y > 0 && !hedge[y * p.w + x]) y--;
      let w = 1;
      while (x + w < p.w && !vedge[y * p.w + x + w]) w++;
      let h = 1;
      while (y + h < p.h && !hedge[(y + h) * p.w + x]) h++;
      return { x, y, w, h };
    };

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (let plan = rectGame.hint?.(state); plan?.ok; plan = rectGame.hint?.(state))
        for (const step of plan.steps) {
          state = rectGame.executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    followHint();
    expect(rectGame.status(state)).toBe("ongoing");
    expect(rectGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    // A rectangle drawn wrongly is what the mistake check is there to catch:
    // the answer's, one square narrower or shorter.
    const right = nextRect();
    if (!right) throw new Error("no unfinished square where the hint stopped");
    const wrong: RectMove = {
      type: "rect",
      erasing: false,
      ...right,
      ...(right.w > 1 ? { w: right.w - 1 } : { h: right.h - 1 }),
    };
    const tried = rectGame.executeMove(state, wrong);
    expect(rectGame.findMistakes?.(tried)?.length).toBeGreaterThan(0);

    // Drawing rectangles rightly, one at a time, the hint finishes the board.
    for (let tries = 0; rectGame.status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(12);
      const r = nextRect();
      if (!r) break;
      const move: RectMove = { type: "rect", erasing: false, ...r };
      state = rectGame.executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(rectGame.status(state)).toBe("solved");
  });
});

describe("the tier in Rectangles' params", () => {
  const refusal = (id: string) =>
    paramsError(rectGame, rectGame.decodeParams(id), true);

  it("is refused only where no board has it", () => {
    expect(refusal("7x7du")).toBeNull();
    expect(refusal("4x4du")).toBeNull();
    expect(refusal("3x5du")).toBeNull();
    expect(refusal("2x9du")).toBeNull();
    expect(refusal("2x8de")).toBeNull();
    expect(refusal("2x8du")).toBe("No 2x8 puzzle is Unreasonable.");
    expect(refusal("4x3du")).toBe("No 4x3 puzzle is Unreasonable.");
    expect(refusal("3x3du")).toBe("No 3x3 puzzle is Unreasonable.");
    expect(refusal("1x30du")).toBe("No 1x30 puzzle is Unreasonable.");
  });

  it("bounds an Unreasonable board by its area", () => {
    expect(refusal("19x19du")).toBeNull();
    expect(refusal("20x20du")).toBeNull();
    expect(refusal("8x50du")).toBeNull();
    expect(refusal("21x21du")).toMatch(/at most 400 squares/);
    expect(refusal("21x21de")).toBeNull();
    // A board that arrives with its description is not held to it.
    expect(paramsError(rectGame, sized(30, 30, DIFF_UNREASONABLE), false)).toBeNull();
  });

  it("offers the two largest sizes on the menu at Easy alone", () => {
    const menu = (rectGame.presets().submenu ?? []).map((item) =>
      rectGame.encodeParams(item.params as RectParams, true),
    );
    expect(menu).toEqual([
      "7x7de",
      "7x7du",
      "9x9de",
      "9x9du",
      "11x11de",
      "11x11du",
      "13x13de",
      "13x13du",
      "15x15de",
      "15x15du",
      "17x17de",
      "19x19de",
    ]);
  });
});
