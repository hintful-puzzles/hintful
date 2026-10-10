/**
 * Signpost's two tiers: Easy, which the solver's forced links finish, and
 * Unreasonable, a board with one answer that they do not reach.
 *
 * The answer counts here come from {@link countChains}, which numbers the
 * squares 1, 2, 3 and on, each next square one the last one's arrow points
 * at, and gives up a branch where a given number is in the wrong place. It
 * makes no link and asks nothing of the solver or the search over it, so it
 * can say whether those two are right that a board has one answer.
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
import { signpostGame } from "./index.ts";
import { executeMove } from "./moves.ts";
import { answerOf, searchAnswers, solverFinishes } from "./solver.ts";
import {
  DXS,
  DYS,
  FLAG_IMMUTABLE,
  type SignpostMove,
  type SignpostParams,
  type SignpostState,
} from "./state.ts";

const newState = (p: SignpostParams, desc: string): SignpostState =>
  signpostGame.newState(p, desc);

/** Whether `to` lies along the arrow of `from`. */
function pointsAt(s: SignpostState, from: number, to: number): boolean {
  const d = s.dirs[from] as number;
  let x = (from % s.w) + (DXS[d] as number);
  let y = Math.floor(from / s.w) + (DYS[d] as number);
  while (x >= 0 && x < s.w && y >= 0 && y < s.h) {
    if (y * s.w + x === to) return true;
    x += DXS[d] as number;
    y += DYS[d] as number;
  }
  return false;
}

/** How many ways the squares number 1 to n, each number's arrow pointing at
 * the next and every given number where it is given, as far as `limit`. */
function countChains(board: SignpostState, limit = 2): number {
  const { n } = board;
  /** The number given on a square, 0 for none, and the square given a number. */
  const given = new Int32Array(n);
  const where = new Int32Array(n + 1).fill(-1);
  for (let i = 0; i < n; i++)
    if ((board.flags[i] as number) & FLAG_IMMUTABLE) {
      given[i] = board.nums[i] as number;
      where[given[i] as number] = i;
    }
  const used = new Uint8Array(n);
  let count = 0;
  const fits = (cell: number, k: number): boolean =>
    !used[cell] &&
    (given[cell] === 0 || given[cell] === k) &&
    (where[k] === -1 || where[k] === cell);
  const number = (cell: number, k: number): void => {
    if (count >= limit) return;
    if (k === n) {
      count++;
      return;
    }
    used[cell] = 1;
    for (let next = 0; next < n; next++)
      if (fits(next, k + 1) && pointsAt(board, cell, next)) number(next, k + 1);
    used[cell] = 0;
  };
  for (let start = 0; start < n; start++) if (fits(start, 1)) number(start, 1);
  return count;
}

const sized = (
  w: number,
  h: number,
  diff: number,
  forceCornerStart = true,
): SignpostParams => ({ w, h, forceCornerStart, diff });

const FOUR = sized(4, 4, DIFF_EASY);
/** A 4x4 board with one answer, on which the solver stops short. */
const NEEDS_SEARCH = "1edgeddbgbfgacca16a";
/** A 4x4 board the solver finishes. */
const SOLVER_FINISHES = "1eeeedgcfb8gahbca16a";
/** The same without its 8, which then goes in more than one place. */
const MANY_ANSWERS = "1eeeedgcfbgahbca16a";
/** The same with the 1's arrow pointing off the top of the grid. */
const NO_ANSWER = "1aeeedgcfb8gahbca16a";

describe("the chain counter these tests judge by", () => {
  it("counts the boards whose answers are known", () => {
    const count = (desc: string) => countChains(newState(FOUR, desc), 100);
    expect(count(SOLVER_FINISHES)).toBe(1);
    expect(count(NEEDS_SEARCH)).toBe(1);
    expect(count(MANY_ANSWERS)).toBeGreaterThan(1);
    expect(count(NO_ANSWER)).toBe(0);
    // Three squares in a row, each arrow pointing along it: with nothing
    // given the chain runs left to right, the only way the arrows allow.
    expect(countChains(newState(sized(3, 1, DIFF_EASY), "cca"))).toBe(1);
    // Ends given the wrong way round: no way.
    expect(countChains(newState(sized(3, 1, DIFF_EASY), "3cc1a"))).toBe(0);
  });
});

describe("signpost's search for a board's answers", () => {
  const answers = (desc: string, budget?: number) =>
    searchAnswers(newState(FOUR, desc), budget).kind;

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

  // The order squares are assumed in is part of the budget: it decides which
  // boards are dealt and which pasted ones open.
  it("takes exactly five positions for a board that needs them", () => {
    expect(answers(NEEDS_SEARCH, 4)).toBe("out-of-reach");
    expect(answers(NEEDS_SEARCH, 5)).toBe("one");
  });

  // The solver makes several links in a pass, which can leave a blank square
  // inside a chain. Numbering that chain 0, 1, 2 as though the numbers were
  // given forced links on this board until one chain was left, and it has two.
  it("does not take a chain's place in line for given numbers", () => {
    const p = sized(5, 5, DIFF_EASY, false);
    const board = newState(p, "ceeefdcegeaaca1abfggeab25a18gh");
    expect(countChains(board)).toBe(2);
    expect(searchAnswers(board).kind).toBe("several");
  });

  it("takes one position for every Easy board", () => {
    for (const side of [4, 5, 6, 7]) {
      const p = sized(side, side, DIFF_EASY, side % 2 === 0);
      for (let seed = 0; seed < 10; seed++) {
        const { desc } = signpostGame.newDesc(p, randomNew(`one-position-${seed}`));
        expect(searchAnswers(newState(p, desc), 1).kind, desc).toBe("one");
      }
    }
  });

  it("agrees with the count on boards of every kind", () => {
    // Dealt boards, which have one answer; the same with given numbers taken
    // away, which often have several; and with one arrow turned, which mostly
    // have none.
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    const judge = (p: SignpostParams, desc: string, label: string): void => {
      const board = newState(p, desc);
      const answer = searchAnswers(board);
      tally[answer.kind]++;
      const count = countChains(board);
      expect(answer.kind, `${label} ${desc}`).toBe(
        count === 0 ? "none" : count === 1 ? "one" : "several",
      );
    };
    for (const [w, h] of [
      [3, 3],
      [2, 5],
      [4, 4],
      [1, 8],
      [5, 5],
    ] as const) {
      for (let seed = 0; seed < 50; seed++) {
        const rng = randomNew(`agree-${w}x${h}-${seed}`);
        const p = sized(w, h, seed % 2 === 0 ? DIFF_EASY : DIFF_UNREASONABLE, false);
        const { desc } = signpostGame.newDesc(p, rng);
        const label = `${w}x${h} seed ${seed}`;
        judge(p, desc, label);

        // Every given number but the first and last, gone.
        const last = String(w * h);
        const bare = desc.replace(/\d+/g, (m) => (m === "1" || m === last ? m : ""));
        judge(p, bare, `${label}, numbers taken away`);

        // One arrow turned a quarter of the way round.
        const arrows = [...desc.matchAll(/[a-h]/g)];
        const at = arrows[randomUpto(rng, arrows.length)] as RegExpMatchArray;
        const turned = String.fromCharCode(
          97 + (((at[0] as string).charCodeAt(0) - 97 + 2) % 8),
        );
        const index = at.index as number;
        judge(
          p,
          desc.slice(0, index) + turned + desc.slice(index + 1),
          `${label}, one arrow turned`,
        );
      }
    }
    expect(tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(250);
    expect(tally.several).toBeGreaterThan(40);
    expect(tally.none).toBeGreaterThan(80);
  });
});

/** Every board of a shape the generator could deal: each chain of arrows
 * through all its squares, with every set of given numbers that includes the
 * first and the last. `corners` keeps the chains from the top left square to
 * the bottom right. */
function eachBoard(
  w: number,
  h: number,
  corners: boolean,
  visit: (desc: string) => void,
): void {
  const n = w * h;
  const dirTo = (a: number, b: number): number => {
    const dx = (b % w) - (a % w);
    const dy = Math.floor(b / w) - Math.floor(a / w);
    if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return -1;
    for (let d = 0; d < 8; d++)
      if (DXS[d] === Math.sign(dx) && DYS[d] === Math.sign(dy)) return d;
    return -1;
  };
  const order: number[] = [];
  const used = new Uint8Array(n);
  const extend = (): void => {
    if (order.length === n) {
      if (corners && order[n - 1] !== n - 1) return;
      const number = new Int32Array(n);
      const arrow = new Int32Array(n);
      order.forEach((cell, k) => {
        number[cell] = k + 1;
        arrow[cell] = k + 1 < n ? dirTo(cell, order[k + 1] as number) : 0;
      });
      for (let mask = 0; mask < 1 << Math.max(0, n - 2); mask++) {
        let desc = "";
        for (let cell = 0; cell < n; cell++) {
          const k = number[cell] as number;
          const given = k === 1 || k === n || ((mask >> (k - 2)) & 1) === 1;
          desc += `${given ? k : ""}${String.fromCharCode(97 + (arrow[cell] as number))}`;
        }
        visit(desc);
      }
      return;
    }
    const last = order[order.length - 1] as number;
    for (let cell = 0; cell < n; cell++) {
      if (used[cell] || dirTo(last, cell) < 0) continue;
      used[cell] = 1;
      order.push(cell);
      extend();
      order.pop();
      used[cell] = 0;
    }
  };
  for (let start = 0; start < (corners ? 1 : n); start++) {
    used[start] = 1;
    order.push(start);
    extend();
    order.pop();
    used[start] = 0;
  }
}

describe("an Unreasonable Signpost board", () => {
  it.each([
    sized(4, 4, DIFF_UNREASONABLE),
    sized(5, 5, DIFF_UNREASONABLE, false),
    sized(6, 6, DIFF_UNREASONABLE),
    sized(3, 8, DIFF_UNREASONABLE, false),
  ])("%o is dealt with one answer that the solver does not reach", (p) => {
    for (let seed = 0; seed < 4; seed++) {
      const { desc } = signpostGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      expect(solverFinishes(state), desc).toBe(false);
      expect(countChains(state), desc).toBe(1);
      // And the answer Solve and the mistake check go by is that chain.
      const solved = signpostGame.solve?.(state, state);
      if (!solved?.ok) throw new Error(`${desc}: no answer found`);
      expect(signpostGame.status(executeMove(state, solved.move)), desc).toBe("solved");
    }
  });

  // The smallest boards that carry the tier.
  describeDealtTiers(signpostGame, ["1x6cdu", "6x1du", "3x3du", "2x5cdu"]);
  // The largest preset, and the largest board dealt.
  describeDealtTiers(signpostGame, ["7x7cdu", "15x15cdu"], { seldom: true });

  /** No board of the shape is one the solver leaves unfinished with exactly
   * one answer. This is every board the generator could deal, so it is a
   * proof for the shape. */
  const noneNeedsSearch = (w: number, h: number, corners: boolean): void => {
    const p = sized(w, h, DIFF_EASY, corners);
    let boards = 0;
    let finished = 0;
    eachBoard(w, h, corners, (desc) => {
      boards++;
      const board = newState(p, desc);
      if (solverFinishes(board)) finished++;
      else if (countChains(board) === 1)
        throw new Error(`${w}x${h} ${desc} needs a search and has one answer`);
    });
    expect(boards).toBeGreaterThan(0);
    expect(finished).toBeGreaterThan(0);
  };

  it.each([
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [5, 1],
    [2, 2],
    [2, 3],
    [3, 2],
  ] as const)("no %dx%d board needs a search and has one answer", (w, h) => {
    noneNeedsSearch(w, h, true);
    noneNeedsSearch(w, h, false);
  });

  it("no 2x4 or 3x3 board with its ends in the corners does", () => {
    noneNeedsSearch(2, 4, true);
    noneNeedsSearch(4, 2, true);
    noneNeedsSearch(3, 3, true);
  });

  // Half a million boards each.
  itSlow("no 2x4 board with free ends does", () => {
    noneNeedsSearch(2, 4, false);
    noneNeedsSearch(4, 2, false);
  });

  // The same walk finds the tier where it is dealt, so it can see one.
  it("a 1x6 board can need a search and have one answer", () => {
    let found = 0;
    eachBoard(1, 6, true, (desc) => {
      const board = newState(sized(1, 6, DIFF_EASY), desc);
      if (!solverFinishes(board) && countChains(board) === 1) found++;
    });
    expect(found).toBe(2);
  });

  describeAbsentTiers(signpostGame, ["1x5cdu", "2x2du", "2x3du", "2x4cdu", "3x3cdu"]);
});

describe("a pasted Signpost board", () => {
  const load = (id: string) => {
    const me = new Midend(signpostGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`4x4:${NEEDS_SEARCH}`)).toMatch(/^4x4c?du$/);
    expect(load(`4x4cde:${NEEDS_SEARCH}`)).toBe("4x4cdu");
    expect(load(`4x4cdu:${NEEDS_SEARCH}`)).toBe("4x4cdu");
  });

  it("that the solver finishes opens as Easy", () => {
    expect(load(`4x4c:${SOLVER_FINISHES}`)).toBe("4x4cde");
    expect(load(`4x4cde:${SOLVER_FINISHES}`)).toBe("4x4cde");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`4x4c:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x4cdu:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    // The board `untiered-load.test.ts` held as one deduction does not
    // finish: it has several answers too.
    expect(load("4x4c:1eceeedagdahgbbb16a")).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x4c:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable Signpost board", () => {
  it("stops where the solver does, and goes on from a link tried rightly", () => {
    const p = sized(4, 4, DIFF_UNREASONABLE);
    const me = new Midend(signpostGame);
    expect(me.newGameFromId(`4x4cdu:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");
    const link = (from: number, to: number): SignpostMove => ({
      type: "link",
      fromX: from % 4,
      fromY: Math.floor(from / 4),
      toX: to % 4,
      toY: Math.floor(to / 4),
    });
    /** The first square with no link out, linked as the answer has it. */
    const linkRightly = (): SignpostMove | null => {
      for (let i = 0; i < 16; i++)
        if (state.next[i] === -1 && answer.solution[i] !== -1)
          return link(i, answer.solution[i] as number);
      return null;
    };
    /** A link the rules allow and the answer does not have. */
    const linkWrongly = (): SignpostMove | null => {
      for (let i = 0; i < 16; i++) {
        if (state.next[i] !== -1 || answer.solution[i] === -1) continue;
        for (let to = 0; to < 16; to++) {
          if (to === answer.solution[i] || !pointsAt(state, i, to)) continue;
          try {
            executeMove(state, link(i, to));
          } catch {
            continue;
          }
          return link(i, to);
        }
      }
      return null;
    };

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (
        let plan = signpostGame.hint?.(state);
        plan?.ok;
        plan = signpostGame.hint?.(state)
      )
        for (const step of plan.steps) {
          state = executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    expect(followHint()).toBeGreaterThan(0);
    expect(signpostGame.status(state)).toBe("ongoing");
    expect(signpostGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    // A link tried wrongly is what the mistake check is there to catch.
    const wrong = linkWrongly();
    if (!wrong) throw new Error("no wrong link to try where the hint stopped");
    expect(
      signpostGame.findMistakes?.(executeMove(state, wrong))?.length,
    ).toBeGreaterThan(0);

    // Trying links rightly, one at a time, the hint finishes the board.
    for (let tries = 0; signpostGame.status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(16);
      const move = linkRightly();
      if (!move) break;
      state = executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(signpostGame.status(state)).toBe("solved");
  });
});

describe("the tier in Signpost's params", () => {
  const refusal = (id: string) =>
    paramsError(signpostGame, signpostGame.decodeParams(id), true);

  it("is refused only where no board has it", () => {
    expect(refusal("4x4cdu")).toBeNull();
    expect(refusal("1x6cdu")).toBeNull();
    expect(refusal("3x3du")).toBeNull();
    expect(refusal("2x5cdu")).toBeNull();
    expect(refusal("2x3cde")).toBeNull();
    expect(refusal("1x5du")).toBe("No 1x5 puzzle is Unreasonable.");
    expect(refusal("2x3cdu")).toBe("No 2x3 puzzle is Unreasonable.");
    expect(refusal("4x2du")).toBe("No 4x2 puzzle is Unreasonable.");
    expect(refusal("3x3cdu")).toBe(
      "No 3x3 puzzle with its ends in the corners is Unreasonable.",
    );
  });

  it("bounds an Unreasonable board by its area and its longer side", () => {
    expect(refusal("15x15cdu")).toBeNull();
    expect(refusal("9x25du")).toBeNull();
    expect(refusal("7x30cdu")).toBeNull();
    expect(refusal("16x16cdu")).toMatch(/at most 225 squares and be at most 30 long/);
    expect(refusal("5x45cdu")).toMatch(/at most 225 squares and be at most 30 long/);
    expect(refusal("16x16cde")).toBeNull();
    // A board that arrives with its description is not held to it.
    expect(
      paramsError(signpostGame, sized(20, 20, DIFF_UNREASONABLE), false),
    ).toBeNull();
  });
});
