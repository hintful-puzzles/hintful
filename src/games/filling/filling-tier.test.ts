/**
 * Filling's two tiers: Easy, which the solver's four deductions finish, and
 * Unreasonable, a board with one answer that they do not reach.
 *
 * The answer counts here come from {@link countAnswers}, which writes a
 * number into one empty square after another in reading order and backs out
 * where a region is already too big, or is shut in at the wrong size. It
 * keeps no candidates, merges nothing and deduces nothing, so it shares
 * nothing with the solver or the search over it, and can say whether those
 * two are right that a board has one answer.
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
import { fillingGame } from "./index.ts";
import { answerOf, searchAnswers, solveFilling } from "./solver.ts";
import {
  type FillingMove,
  type FillingParams,
  largestNumber,
  newState,
  status,
} from "./state.ts";

/** How many ways the empty squares of `clues` can be filled so that every
 * group of equal numbers has its number's size, counted as far as `limit`. */
function countAnswers(
  clues: ArrayLike<number>,
  w: number,
  h: number,
  limit = 2,
): number {
  const sz = w * h;
  const top = largestNumber(w, h);
  const grid = Array.from(clues);
  const beside = (i: number): number[] => {
    const out: number[] = [];
    if (i % w > 0) out.push(i - 1);
    if (i % w < w - 1) out.push(i + 1);
    if (i >= w) out.push(i - w);
    if (i + w < sz) out.push(i + w);
    return out;
  };
  /** Whether the group of equal numbers at `i` can still come out right: not
   * over its size, and not under it with no empty square beside it. */
  const groupHolds = (i: number): boolean => {
    const n = grid[i] as number;
    const seen = new Set([i]);
    let open = false;
    for (const c of seen)
      for (const b of beside(c)) {
        if (grid[b] === 0) open = true;
        else if (grid[b] === n) seen.add(b);
      }
    return seen.size <= n && (open || seen.size === n);
  };
  const holdsAround = (i: number): boolean =>
    [i, ...beside(i)].every((c) => grid[c] === 0 || groupHolds(c));

  let count = 0;
  const fill = (from: number): void => {
    let i = from;
    while (i < sz && grid[i] !== 0) i++;
    if (i === sz) {
      count++;
      return;
    }
    for (let n = 1; n <= top && count < limit; n++) {
      grid[i] = n;
      if (holdsAround(i)) fill(i + 1);
    }
    grid[i] = 0;
  };
  // The clues themselves may already break the rule.
  for (let i = 0; i < sz; i++) if (grid[i] !== 0 && !groupHolds(i)) return 0;
  fill(0);
  return count;
}

const sized = (w: number, h: number, diff: number): FillingParams => ({ w, h, diff });

const cluesOf = (w: number, h: number, desc: string): Uint8Array =>
  newState(sized(w, h, DIFF_EASY), desc).clues;

/** A 5x5 board with one answer, on which the solver stops short after two
 * squares. */
const NEEDS_SEARCH = "2a3a34f22c3b43a22";
const NEEDS_SEARCH_ANSWER = "2233345554452244534443322";
/** A 3x1 board the solver finishes. */
const SOLVER_FINISHES = "1a2";
/** A 3x1 board with nothing on it: three of a kind, or a pair and a one
 * either way round. */
const MANY_ANSWERS = "c";
/** Three squares in a row all holding 2. */
const NO_ANSWER = "222";

describe("the answer counter these tests judge by", () => {
  it("counts the boards whose answers are known", () => {
    expect(countAnswers(cluesOf(3, 1, SOLVER_FINISHES), 3, 1)).toBe(1);
    expect(countAnswers(cluesOf(3, 1, MANY_ANSWERS), 3, 1, 100)).toBe(3);
    expect(countAnswers(cluesOf(3, 1, NO_ANSWER), 3, 1)).toBe(0);
    // A 2x2 board is a one and the three squares round it, four ways.
    expect(countAnswers(cluesOf(2, 2, "d"), 2, 2, 100)).toBe(4);
    expect(countAnswers(cluesOf(5, 5, NEEDS_SEARCH), 5, 5, 100)).toBe(1);
  });
});

describe("filling's search for a board's answers", () => {
  const answers = (w: number, h: number, desc: string, budget?: number) =>
    searchAnswers(cluesOf(w, h, desc), w, h, budget);

  it("says one, several or none", () => {
    const one = answers(5, 5, NEEDS_SEARCH);
    expect(one.kind === "one" && one.solution.join("")).toBe(NEEDS_SEARCH_ANSWER);
    expect(answers(3, 1, SOLVER_FINISHES).kind).toBe("one");
    expect(answers(3, 1, MANY_ANSWERS).kind).toBe("several");
    expect(answers(3, 1, NO_ANSWER).kind).toBe("none");
  });

  it("says neither once its budget is spent", () => {
    // The solver finishes a board in the one position the search starts from.
    expect(answers(3, 1, SOLVER_FINISHES, 1).kind).toBe("one");
    expect(answers(5, 5, NEEDS_SEARCH, 1).kind).toBe("out-of-reach");
    expect(answers(5, 5, NEEDS_SEARCH, 5).kind).toBe("out-of-reach");
  });

  // With one position to spend the search can only say "none" of a board its
  // deductions call impossible as it stands, so each of these is the
  // solver's own verdict and not something the search worked out.
  it.each([
    ["a region past its size", 3, 1, "222"],
    ["a region shut in short of its size", 3, 1, "121"],
    ["a region with too little room left", 4, 1, "13a1"],
  ] as const)("is told by the solver of %s", (_what, w, h, desc) => {
    expect(answers(w, h, desc, 1).kind).toBe("none");
    expect(countAnswers(cluesOf(w, h, desc), w, h)).toBe(0);
  });

  it("finds none where an empty square takes no number", () => {
    // The solver calls this stuck; the square divides into no positions.
    expect(answers(3, 1, "1a1").kind).toBe("none");
    expect(countAnswers(cluesOf(3, 1, "1a1"), 3, 1)).toBe(0);
  });

  it("is not told a board merely short of finished is impossible", () => {
    expect(answers(3, 1, MANY_ANSWERS, 1).kind).toBe("out-of-reach");
  });

  it("agrees with the count on boards of every kind", () => {
    // Dealt boards, which have one answer; the same with clues taken away,
    // which often have several; and with one clue changed, which mostly have
    // none.
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    const judge = (clues: number[], w: number, h: number, label: string): void => {
      const answer = searchAnswers(clues, w, h);
      tally[answer.kind]++;
      const count = countAnswers(clues, w, h);
      expect(answer.kind, label).toBe(
        count === 0 ? "none" : count === 1 ? "one" : "several",
      );
    };
    for (const [w, h] of [
      [3, 3],
      [2, 5],
      [4, 4],
      [5, 4],
      [5, 5],
    ] as const) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = randomNew(`agree-${w}x${h}-${seed}`);
        const p = sized(w, h, seed % 2 === 0 ? DIFF_EASY : DIFF_UNREASONABLE);
        const dealt = Array.from(newState(p, fillingGame.newDesc(p, rng).desc).clues);
        const label = `${w}x${h} seed ${seed}`;
        judge(dealt, w, h, label);

        const given = dealt.flatMap((n, i) => (n === 0 ? [] : [i]));
        const fewer = dealt.slice();
        for (let gone = 0; gone < 2 && given.length > 0; gone++)
          fewer[given[randomUpto(rng, given.length)] as number] = 0;
        judge(fewer, w, h, `${label}, clues taken away`);

        if (given.length === 0) continue;
        const changed = dealt.slice();
        const at = given[randomUpto(rng, given.length)] as number;
        changed[at] = ((changed[at] as number) % largestNumber(w, h)) + 1;
        judge(changed, w, h, `${label}, one clue changed`);
      }
    }
    expect(tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(300);
    expect(tally.several).toBeGreaterThan(100);
    expect(tally.none).toBeGreaterThan(100);
  });
});

describe("an Unreasonable Filling board", () => {
  it.each([
    sized(2, 2, DIFF_UNREASONABLE),
    sized(4, 4, DIFF_UNREASONABLE),
    sized(5, 5, DIFF_UNREASONABLE),
    sized(3, 8, DIFF_UNREASONABLE),
    sized(6, 6, DIFF_UNREASONABLE),
  ])("%o is dealt with one answer that the solver does not reach", (p) => {
    for (let seed = 0; seed < 4; seed++) {
      const { desc } = fillingGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      expect(solveFilling(state.clues, p.w, p.h).solved, desc).toBe(false);
      expect(countAnswers(state.clues, p.w, p.h), desc).toBe(1);
      // And the answer Solve and the mistake check go by is that grid.
      const solved = fillingGame.solve?.(state, state);
      if (!solved?.ok) throw new Error(`${desc}: no answer found`);
      expect(status(fillingGame.executeMove(state, solved.move)), desc).toBe("solved");
    }
  });

  // The smallest boards that carry the tier, 1x5 the one found most seldom.
  describeDealtTiers(fillingGame, ["1x2du", "2x2du", "1x5du", "5x1du", "2x3du"]);
  // The presets' largest, and the largest the bound admits.
  describeDealtTiers(fillingGame, ["13x17du", "15x20du", "2x150du"], {
    seldom: true,
  });

  // Every clue set of a strip of one, three or four squares, lying either
  // way: wherever one has a single answer, the solver finishes it.
  it.each([
    [1, 1],
    [1, 3],
    [3, 1],
    [1, 4],
    [4, 1],
  ] as const)("no %dx%d board is one", (w, h) => {
    const sz = w * h;
    const base = largestNumber(w, h) + 1;
    let withOneAnswer = 0;
    for (let code = 0; code < base ** sz; code++) {
      const clues = Array.from(
        { length: sz },
        (_, i) => Math.floor(code / base ** i) % base,
      );
      if (countAnswers(clues, w, h) !== 1) continue;
      withOneAnswer++;
      expect(searchAnswers(clues, w, h).kind, clues.join("")).toBe("one");
      expect(solveFilling(clues, w, h).solved, clues.join("")).toBe(true);
    }
    expect(withOneAnswer).toBeGreaterThan(1);
  });

  describeAbsentTiers(fillingGame, ["1x1du", "1x3du", "3x1du", "1x4du", "4x1du"]);
});

describe("the size of a Filling board", () => {
  const refusal = (id: string) =>
    paramsError(fillingGame, fillingGame.decodeParams(id), true);

  it.each([
    "17x17de",
    "17x17du",
    "15x20du",
    "1x300de",
    "2x150du",
  ])("%s is inside the bound", (id) => {
    expect(refusal(id)).toBeNull();
  });

  it.each([
    "18x17de",
    "18x17du",
    "20x20de",
    "1x301de",
  ])("%s is refused when a board is to be dealt", (id) => {
    expect(refusal(id)).toMatch(/at most 300/);
  });

  it("a board that arrives with its description is not held to it", () => {
    expect(paramsError(fillingGame, sized(25, 25, DIFF_EASY), false)).toBeNull();
    expect(paramsError(fillingGame, sized(1, 3, DIFF_UNREASONABLE), false)).toBeNull();
  });
});

describe("a pasted Filling board", () => {
  const load = (id: string) => {
    const me = new Midend(fillingGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`5x5:${NEEDS_SEARCH}`)).toBe("5x5du");
    expect(load(`5x5de:${NEEDS_SEARCH}`)).toBe("5x5du");
    expect(load(`5x5du:${NEEDS_SEARCH}`)).toBe("5x5du");
  });

  it("that the solver finishes opens as Easy", () => {
    expect(load(`3x1:${SOLVER_FINISHES}`)).toBe("3x1de");
    expect(load(`3x1de:${SOLVER_FINISHES}`)).toBe("3x1de");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`3x1:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`3x1du:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`3x1:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
    // The board `untiered-load.test.ts` held as one deduction does not
    // finish: it has several answers.
    expect(load("7x9:a4ga99a447c5a6774a5d55d4b4f83g3284a4a")).toBe(DESC_NOT_UNIQUE);
  });
});

describe("the hint on an Unreasonable Filling board", () => {
  it("stops where the solver does, and goes on from a number tried rightly", () => {
    const p = sized(5, 5, DIFF_UNREASONABLE);
    const me = new Midend(fillingGame);
    expect(me.newGameFromId(`5x5du:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");
    const firstEmpty = () => state.board.indexOf(0);

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (
        let plan = fillingGame.hint?.(state);
        plan?.ok;
        plan = fillingGame.hint?.(state)
      )
        for (const step of plan.steps) {
          state = fillingGame.executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    expect(followHint()).toBeGreaterThan(0);
    expect(status(state)).toBe("ongoing");
    expect(fillingGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    const open = firstEmpty();
    const right = answer.solution[open] as number;
    // A number tried wrongly is what the mistake check is there to catch.
    const tried = fillingGame.executeMove(state, {
      type: "set",
      cells: [open],
      value: (right % 5) + 1,
    });
    expect(fillingGame.findMistakes?.(tried)).toEqual([
      { x: open % 5, y: Math.floor(open / 5) },
    ]);

    // Trying numbers rightly, one empty square at a time, the hint finishes it.
    for (let tries = 0; status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(25);
      const i = firstEmpty();
      const move: FillingMove = {
        type: "set",
        cells: [i],
        value: answer.solution[i] as number,
      };
      state = fillingGame.executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(status(state)).toBe("solved");
  });
});
