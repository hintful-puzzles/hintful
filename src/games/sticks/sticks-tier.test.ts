/**
 * Sticks' two tiers: Easy, which the solver's one deduction finishes, and
 * Unreasonable, a board with one answer that it does not reach.
 *
 * The answer counts here come from {@link countFills}, which lays a line in
 * every white square each way and reads the finished board against its
 * clues: a numbered line's length, and the lines meeting a numbered block.
 * It asks nothing of the solver's validator or the search over it, so it can
 * say whether those two are right that a board has one answer. It tries
 * every fill, so it is for boards of twenty white squares or so.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { DESC_CONTRADICTORY, DESC_NOT_UNIQUE } from "../../engine/desc-error.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { SYMM_NONE, SYMM_ROT2 } from "../../engine/symmetric-blacks.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import { sticksGame } from "./index.ts";
import { answerOf, searchAnswers, solverFinishes } from "./solver.ts";
import {
  F_BLOCK,
  F_HOR,
  F_VER,
  newState,
  type SticksMove,
  type SticksParams,
  type SticksState,
} from "./state.ts";

/** How many ways every white square takes a line so that each numbered line
 * is as long as its number, no line holds two numbers, and each numbered
 * block is met by as many lines as its number, as far as `limit`. */
function countFills(board: SticksState, limit = 2): number {
  const { w, h, numbers } = board;
  const s = w * h;
  const grid = board.grid.map((cell) => cell & F_BLOCK);
  const whites: number[] = [];
  for (let i = 0; i < s; i++) if (!grid[i]) whites.push(i);

  const holds = (): boolean => {
    for (let i = 0; i < s; i++) {
      const x = i % w;
      const y = (i - x) / w;
      if ((grid[i] as number) & F_BLOCK) {
        if ((numbers[i] as number) < 0) continue;
        let meeting = 0;
        if (x > 0 && grid[i - 1] === F_HOR) meeting++;
        if (x < w - 1 && grid[i + 1] === F_HOR) meeting++;
        if (y > 0 && grid[i - w] === F_VER) meeting++;
        if (y < h - 1 && grid[i + w] === F_VER) meeting++;
        if (meeting !== numbers[i]) return false;
        continue;
      }
      // A line is read once, from its first square.
      const across = grid[i] === F_HOR;
      const first = across
        ? x === 0 || grid[i - 1] !== F_HOR
        : y === 0 || grid[i - w] !== F_VER;
      if (!first) continue;
      let length = 0;
      let clues = 0;
      let clue = -1;
      for (let j = i; j < s; j += across ? 1 : w) {
        if (across && Math.floor(j / w) !== y) break;
        if (grid[j] !== grid[i]) break;
        length++;
        if ((numbers[j] as number) >= 0) {
          clues++;
          clue = numbers[j] as number;
        }
      }
      if (clues > 1 || (clues === 1 && clue !== length)) return false;
    }
    return true;
  };

  let count = 0;
  const lay = (k: number): void => {
    if (count >= limit) return;
    if (k === whites.length) {
      if (holds()) count++;
      return;
    }
    for (const line of [F_HOR, F_VER]) {
      grid[whites[k] as number] = line;
      lay(k + 1);
    }
    grid[whites[k] as number] = 0;
  };
  lay(0);
  return count;
}

const sized = (w: number, h: number, diff: number, symm = SYMM_ROT2): SticksParams => ({
  w,
  h,
  blackpc: 20,
  symm,
  diff,
});

const FOUR = sized(4, 4, DIFF_EASY);
/** A 4x4 board with one answer, on which the solver stops short. */
const NEEDS_SEARCH = "3b1aB1b2_1B1c1a";
/** A 4x4 board the solver finishes. */
const SOLVER_FINISHES = "c1_1B0_1cB2c4a";
/** No block and no number: every way of laying the lines fits. */
const MANY_ANSWERS = "p";
/** The corner square's line is four long, and the squares beside it and
 * below it each hold a line of one: it can run neither across nor down. */
const NO_ANSWER = "4_1b1k";

describe("the fill counter these tests judge by", () => {
  it("counts the boards whose answers are known", () => {
    const count = (desc: string, limit?: number) =>
      countFills(newState(FOUR, desc), limit);
    expect(count(SOLVER_FINISHES)).toBe(1);
    expect(count(NEEDS_SEARCH, 100)).toBe(1);
    expect(count(NO_ANSWER)).toBe(0);
    // Sixteen free squares, each line either way.
    expect(count(MANY_ANSWERS, 100_000)).toBe(65_536);
    // A 2x2 board whose top left square holds a 2: its line runs across the
    // top or down the left, and the other two squares go either way each.
    expect(countFills(newState(sized(2, 2, DIFF_EASY), "2c"), 100)).toBe(8);
  });
});

describe("sticks' search for a board's answers", () => {
  const answers = (desc: string, budget?: number) => {
    const board = newState(FOUR, desc);
    return searchAnswers(board.grid, board.numbers, 4, 4, budget).kind;
  };

  it("says one, several or none", () => {
    expect(answers(NEEDS_SEARCH)).toBe("one");
    expect(answers(SOLVER_FINISHES)).toBe("one");
    expect(answers(MANY_ANSWERS)).toBe("several");
    expect(answers(NO_ANSWER)).toBe("none");
  });

  it("says neither once its budget is spent", () => {
    // The solver finishes a board in the one position the search starts from.
    expect(answers(SOLVER_FINISHES, 1)).toBe("one");
    expect(answers(NEEDS_SEARCH, 1)).toBe("out-of-reach");
  });

  // Which square is assumed, and which way first, is part of the budget: it
  // decides which boards are dealt and which pasted ones open.
  it("takes exactly five positions for a board that needs them", () => {
    expect(answers(NEEDS_SEARCH, 4)).toBe("out-of-reach");
    expect(answers(NEEDS_SEARCH, 5)).toBe("one");
  });

  it("takes one position for every Easy board", () => {
    for (const side of [4, 5, 7]) {
      const p = sized(side, side, DIFF_EASY);
      for (let seed = 0; seed < 8; seed++) {
        const { desc } = sticksGame.newDesc(p, randomNew(`one-position-${seed}`));
        const board = newState(p, desc);
        expect(searchAnswers(board.grid, board.numbers, side, side, 1).kind, desc).toBe(
          "one",
        );
      }
    }
  });

  it("agrees with the count on boards of every kind", () => {
    // Dealt boards, which have one answer; the same with numbers taken away,
    // which often have several; and with one number changed, which mostly
    // have none.
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    const judge = (board: SticksState, label: string): void => {
      const answer = searchAnswers(board.grid, board.numbers, board.w, board.h);
      tally[answer.kind]++;
      const count = countFills(board);
      expect(answer.kind, label).toBe(
        count === 0 ? "none" : count === 1 ? "one" : "several",
      );
    };
    for (const [w, h] of [
      [3, 3],
      [2, 6],
      [4, 4],
      [3, 5],
    ] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const rng = randomNew(`agree-${w}x${h}-${seed}`);
        const p = sized(
          w,
          h,
          seed % 2 === 0 ? DIFF_EASY : DIFF_UNREASONABLE,
          SYMM_NONE,
        );
        const dealt = newState(p, sticksGame.newDesc(p, rng).desc);
        const label = `${w}x${h} seed ${seed}`;
        judge(dealt, label);

        const shown = Array.from(dealt.numbers, (c, i) => (c >= 0 ? i : -1)).filter(
          (i) => i >= 0,
        );
        if (shown.length === 0) continue;
        const fewer = { ...dealt, numbers: dealt.numbers.slice() };
        for (let gone = 0; gone < 2; gone++)
          fewer.numbers[shown[randomUpto(rng, shown.length)] as number] = -1;
        judge(fewer, `${label}, numbers taken away`);

        const changed = { ...dealt, numbers: dealt.numbers.slice() };
        const at = shown[randomUpto(rng, shown.length)] as number;
        changed.numbers[at] = ((changed.numbers[at] as number) % 3) + 1;
        judge(changed, `${label}, one number changed`);
      }
    }
    expect(tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(160);
    expect(tally.several).toBeGreaterThan(40);
    expect(tally.none).toBeGreaterThan(40);
  });
});

describe("an Unreasonable Sticks board", () => {
  it.each([
    sized(3, 3, DIFF_UNREASONABLE, SYMM_NONE),
    sized(4, 4, DIFF_UNREASONABLE),
    sized(5, 5, DIFF_UNREASONABLE),
    sized(2, 8, DIFF_UNREASONABLE, SYMM_NONE),
  ])("%o is dealt with one answer that the solver does not reach", (p) => {
    for (let seed = 0; seed < 3; seed++) {
      const { desc } = sticksGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      expect(solverFinishes(state), desc).toBe(false);
      expect(countFills(state), desc).toBe(1);
      // And the answer Solve and the mistake check go by is that fill.
      const solved = sticksGame.solve?.(state, state);
      if (!solved?.ok) throw new Error(`${desc}: no answer found`);
      expect(sticksGame.status(sticksGame.executeMove(state, solved.move)), desc).toBe(
        "solved",
      );
    }
  });

  // The smallest boards that carry the tier.
  describeDealtTiers(sticksGame, ["2x5b20s0du", "3x3b20s0du", "5x2b20s2du"]);
  // The largest preset.
  describeDealtTiers(sticksGame, ["10x10b20s2du"], { seldom: true });

  /**
   * Every board of a shape the generator could deal: each set of blocks, each
   * way of laying the lines, each square a line's number could sit on, and
   * each set of numbers left showing.
   */
  const eachBoard = (
    w: number,
    h: number,
    visit: (board: SticksState) => void,
  ): void => {
    const s = w * h;
    for (let blocks = 0; blocks < 1 << s; blocks++) {
      const whites: number[] = [];
      for (let i = 0; i < s; i++) if (!((blocks >> i) & 1)) whites.push(i);
      for (let fill = 0; fill < 1 << whites.length; fill++) {
        const grid = new Uint8Array(s);
        for (let i = 0; i < s; i++) if ((blocks >> i) & 1) grid[i] = F_BLOCK;
        whites.forEach((cell, k) => {
          grid[cell] = (fill >> k) & 1 ? F_HOR : F_VER;
        });
        // Each block's number, and each line as its squares in order.
        const blockClues: [number, number][] = [];
        const lines: number[][] = [];
        for (let i = 0; i < s; i++) {
          const x = i % w;
          const y = (i - x) / w;
          if ((grid[i] as number) & F_BLOCK) {
            let meeting = 0;
            if (x > 0 && grid[i - 1] === F_HOR) meeting++;
            if (x < w - 1 && grid[i + 1] === F_HOR) meeting++;
            if (y > 0 && grid[i - w] === F_VER) meeting++;
            if (y < h - 1 && grid[i + w] === F_VER) meeting++;
            blockClues.push([i, meeting]);
            continue;
          }
          const across = grid[i] === F_HOR;
          const first = across
            ? x === 0 || grid[i - 1] !== F_HOR
            : y === 0 || grid[i - w] !== F_VER;
          if (!first) continue;
          const line: number[] = [];
          for (let j = i; j < s; j += across ? 1 : w) {
            if (across && Math.floor(j / w) !== y) break;
            if (grid[j] !== grid[i]) break;
            line.push(j);
          }
          lines.push(line);
        }
        // Each line's number on each of its squares in turn.
        const place = (k: number, clues: [number, number][]): void => {
          if (k < lines.length) {
            const line = lines[k] as number[];
            for (const cell of line) place(k + 1, [...clues, [cell, line.length]]);
            return;
          }
          for (let shown = 0; shown < 1 << clues.length; shown++) {
            const numbers = new Int16Array(s).fill(-1);
            clues.forEach(([cell, value], c) => {
              if ((shown >> c) & 1) numbers[cell] = value;
            });
            visit({ w, h, grid: grid.map((cell) => cell & F_BLOCK), numbers });
          }
        };
        place(0, blockClues);
      }
    }
  };

  /** How many boards of the shape the solver leaves unfinished with exactly
   * one answer. The same board is reached from more than one fill, and is
   * counted each time. */
  const needingSearch = (w: number, h: number): number => {
    let found = 0;
    let finished = 0;
    eachBoard(w, h, (board) => {
      if (solverFinishes(board)) finished++;
      else if (countFills(board) === 1) found++;
    });
    expect(finished).toBeGreaterThan(0);
    return found;
  };

  // This is every board of the shape, so it is a proof for it.
  it("no 2x2 board needs a search and has one answer", () => {
    expect(needingSearch(2, 2)).toBe(0);
  });

  // The same walk finds the tier one size up, so it can see one. The
  // generator seldom reaches a 2x3 board of it, and gives up in under a
  // second when it does not; none was dealt in 120,000 fills with the blocks
  // turned half way round, which is why a sample is not what refuses a size.
  it("a 2x3 board can need a search and have one answer", () => {
    expect(needingSearch(2, 3)).toBeGreaterThan(0);
  });

  describeAbsentTiers(sticksGame, ["2x2b20s0du", "2x2b50s2du"]);
});

describe("a pasted Sticks board", () => {
  const load = (id: string) => {
    const me = new Midend(sticksGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`4x4b20s2:${NEEDS_SEARCH}`)).toBe("4x4b20s2du");
    expect(load(`4x4b20s2de:${NEEDS_SEARCH}`)).toBe("4x4b20s2du");
    expect(load(`4x4b20s2du:${NEEDS_SEARCH}`)).toBe("4x4b20s2du");
  });

  it("that the solver finishes opens as Easy", () => {
    expect(load(`4x4b20s2:${SOLVER_FINISHES}`)).toBe("4x4b20s2de");
    expect(load(`4x4b20s2de:${SOLVER_FINISHES}`)).toBe("4x4b20s2de");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`4x4b20s2:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x4b20s2du:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    // The board `untiered-load.test.ts` held as one deduction does not
    // finish: it has several answers too.
    expect(load("5x5b20s2:1aB_1_2bBcB1aB3cB_1a3aB0a1")).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x4b20s2:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable Sticks board", () => {
  it("stops where the solver does, and goes on from a line tried rightly", () => {
    const p = sized(4, 4, DIFF_UNREASONABLE);
    const me = new Midend(sticksGame);
    expect(me.newGameFromId(`4x4b20s2du:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");
    /** The first blank square, with the line the answer has there (or the
     * other one). */
    const firstBlank = (rightly: boolean): SticksMove | null => {
      const index = state.grid.indexOf(0);
      if (index < 0) return null;
      const across = ((answer.solution[index] as number) & F_HOR) !== 0;
      return {
        kind: "set",
        changes: [{ index, line: across === rightly ? "hor" : "ver" }],
      };
    };

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (
        let plan = sticksGame.hint?.(state);
        plan?.ok;
        plan = sticksGame.hint?.(state)
      )
        for (const step of plan.steps) {
          state = sticksGame.executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    expect(followHint()).toBeGreaterThan(0);
    expect(sticksGame.status(state)).toBe("ongoing");
    expect(sticksGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    // A line tried wrongly is what the mistake check is there to catch.
    const wrong = firstBlank(false);
    if (!wrong) throw new Error("no blank square where the hint stopped");
    const tried = sticksGame.executeMove(state, wrong);
    expect(sticksGame.findMistakes?.(tried)?.length).toBeGreaterThan(0);

    // Trying lines rightly, one at a time, the hint finishes the board.
    for (let tries = 0; sticksGame.status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(16);
      const move = firstBlank(true);
      if (!move) break;
      state = sticksGame.executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(sticksGame.status(state)).toBe("solved");
  });
});

describe("the tier in Sticks' params", () => {
  const refusal = (id: string) =>
    paramsError(sticksGame, sticksGame.decodeParams(id), true);

  it("is refused only where no board has it", () => {
    expect(refusal("5x5b20s2du")).toBeNull();
    expect(refusal("2x5b20s0du")).toBeNull();
    expect(refusal("3x3b20s0du")).toBeNull();
    expect(refusal("2x3b20s0du")).toBeNull();
    expect(refusal("2x2b20s0de")).toBeNull();
    expect(refusal("2x2b20s0du")).toBe("No 2x2 puzzle is Unreasonable.");
  });

  it("bounds an Unreasonable board by its area and its longer side", () => {
    expect(refusal("10x10b20s2du")).toBeNull();
    expect(refusal("4x25b20s2du")).toBeNull();
    expect(refusal("2x30b20s2du")).toBeNull();
    expect(refusal("11x11b20s2du")).toMatch(
      /at most 100 squares and be at most 30 long/,
    );
    expect(refusal("2x40b20s2du")).toMatch(
      /at most 100 squares and be at most 30 long/,
    );
    expect(refusal("11x11b20s2de")).toBeNull();
    // A board that arrives with its description is not held to it.
    expect(paramsError(sticksGame, sized(12, 12, DIFF_UNREASONABLE), false)).toBeNull();
  });
});
