/**
 * The search that counts a board's answers, and what a game makes of its four
 * verdicts, over a toy: choose some of the numbers 1 to `n` to sum to a
 * target. A position is the numbers decided so far, taken or left.
 */
import { describe, expect, it } from "vitest";
import {
  type Answer,
  answerCache,
  DEALING_BUDGET,
  DIFF_EASY,
  DIFF_UNREASONABLE,
  dealUnreasonable,
  SEARCH_TIER_NAMES,
  searchAnswers,
  searchTierContract,
  searchTierItem,
  searchTierSegment,
  solvedPositions,
  solveFromAnswer,
} from "./answer-search.ts";
import { PUZZLE_NOT_REASONABLE } from "./hint-refusal.ts";
import { paramsCodec } from "./params-codec.ts";
import { RetryLimitExceeded, underDealTries } from "./retry-limit.ts";
import { MULTIPLE_SOLUTIONS, NO_SOLUTION } from "./solve-failure.ts";

/** Whether each of 1.. is taken, as far as it is decided. */
type Taken = boolean[];

/** The subsets of 1..`n` that sum to `target`, searched with no deduction but
 * the two that can say a position is impossible. `tried` collects every
 * position the search deduces on. */
function subsets(
  n: number,
  target: number,
  budget = 1_000,
  tried: Taken[] = [],
  given: Taken = [],
): Answer<number[]> {
  const sum = (taken: Taken) => taken.reduce((s, t, i) => s + (t ? i + 1 : 0), 0);
  return searchAnswers<Taken, number[]>({
    start: [...given],
    deduce(taken) {
      tried.push([...taken]);
      const rest = ((n + taken.length + 1) * (n - taken.length)) / 2;
      if (sum(taken) > target || sum(taken) + rest < target) return "contradiction";
      if (taken.length < n) return "stuck";
      return "solved";
    },
    assume: (taken) => [
      [...taken, true],
      [...taken, false],
    ],
    solution: (taken) => taken.flatMap((t, i) => (t ? [i + 1] : [])),
    budget,
  });
}

describe("searchAnswers", () => {
  it("returns the one answer", () => {
    // Only 1+2+3+4 reaches ten.
    expect(subsets(4, 10)).toEqual({ kind: "one", solution: [1, 2, 3, 4] });
    expect(subsets(4, 0)).toEqual({ kind: "one", solution: [] });
  });

  it("says several as soon as it has a second", () => {
    // 3, and 1+2.
    expect(subsets(4, 3)).toEqual({ kind: "several" });
  });

  it("says none where every position ends in a contradiction", () => {
    expect(subsets(4, 11)).toEqual({ kind: "none" });
  });

  it("says neither once its budget of positions is spent", () => {
    const tried: Taken[] = [];
    expect(subsets(4, 10, 1_000, tried).kind).toBe("one");
    // The answer is the fifth position tried; the other four prove it alone.
    expect(tried).toHaveLength(9);
    for (let budget = 0; budget <= 9; budget++)
      expect(subsets(4, 10, budget).kind, `budget ${budget}`).toBe(
        budget === 9 ? "one" : "out-of-reach",
      );
  });

  it("hands over the solved positions it came to, as many as were asked for", () => {
    // 1+4, 2+3: the two subsets of 1..4 that come to five, in search order.
    const fives = (limit: number, budget = 1_000) =>
      solvedPositions<Taken, number[]>(
        {
          start: [],
          deduce(taken) {
            const sum = taken.reduce((s, t, i) => s + (t ? i + 1 : 0), 0);
            if (sum > 5) return "contradiction";
            if (taken.length < 4) return "stuck";
            return sum === 5 ? "solved" : "contradiction";
          },
          assume: (taken) => [
            [...taken, true],
            [...taken, false],
          ],
          solution: () => [],
          budget,
        },
        limit,
      );
    const [first, second] = [
      [true, false, false, true],
      [false, true, true, false],
    ];
    expect(fives(1)).toEqual([first]);
    expect(fives(2)).toEqual([first, second]);
    // Asked for more than there are, it searches to the end.
    expect(fives(3)).toEqual([first, second]);
    expect(fives(2, 3)).toBeNull();
  });

  it("tries a position's assumptions in the order given, depth first", () => {
    const tried: Taken[] = [];
    subsets(2, 3, 1_000, tried);
    expect(tried).toEqual([[], [true], [true, true], [true, false], [false]]);
  });
});

describe("answerCache", () => {
  it("searches each board once, whatever was found", () => {
    const answers = answerCache<object, number>();
    const [a, b] = [{}, {}];
    let searches = 0;
    const search = (kind: "several" | "none") => () => {
      searches++;
      return { kind };
    };
    expect(answers(a, search("several"))).toEqual({ kind: "several" });
    expect(answers(a, search("none"))).toEqual({ kind: "several" });
    expect(answers(b, search("none"))).toEqual({ kind: "none" });
    expect(searches).toBe(2);
  });
});

describe("solveFromAnswer", () => {
  it("makes the move of one answer, and says which way a board lacks one", () => {
    const solve = (answer: Answer<number>) =>
      solveFromAnswer(answer, (n) => `set ${n}`);
    expect(solve({ kind: "one", solution: 7 })).toEqual({ ok: true, move: "set 7" });
    expect(solve({ kind: "several" })).toEqual({
      ok: false,
      error: MULTIPLE_SOLUTIONS,
    });
    expect(solve({ kind: "none" })).toEqual({ ok: false, error: NO_SOLUTION });
    expect(solve({ kind: "out-of-reach" })).toEqual({
      ok: false,
      error: PUZZLE_NOT_REASONABLE,
    });
  });
});

describe("dealUnreasonable", () => {
  /** A board of the toy: the numbers from 1 whose taking it shows. Its
   * deduction finishes it only where it shows them all. */
  interface Board {
    n: number;
    target: number;
    given: Taken;
  }
  const board = (n: number, target: number, given: Taken = []): Board => ({
    n,
    target,
    given,
  });
  /** A board that shows every number of the answer that takes them all. */
  const full = (n: number): Board =>
    board(n, (n * (n + 1)) / 2, Array<boolean>(n).fill(true));
  const toy = {
    label: "toy: Unreasonable generation",
    deduced: (b: Board) => b.given.length === b.n,
    answer: (b: Board, budget = 1_000) => subsets(b.n, b.target, budget, [], b.given),
  };
  /** Hide the last number shown while the search still proves one answer. */
  const hideFromTheEnd = (b: Board, one: () => boolean) => {
    while (b.given.length > 0) {
      const last = b.given.pop() as boolean;
      if (one()) continue;
      b.given.push(last);
      return;
    }
  };
  /** Deals `boards` in turn, then throws. */
  const drawEach = (boards: (Board | null)[]) => {
    const left = [...boards];
    return () => {
      if (left.length === 0) throw new Error("drew past the last board");
      return left.shift() as Board | null;
    };
  };

  it("keeps the first board with one answer that deduction stops short of", () => {
    const kept = board(4, 10);
    const draw = drawEach([
      // 1+2, which deduction finishes; 3 or 1+2; a try that drew nothing.
      board(4, 3, [true, true, false, false]),
      board(4, 3),
      null,
      kept,
      board(4, 0),
    ]);
    expect(dealUnreasonable({ ...toy, draw })).toBe(kept);
    // The board after it was not drawn.
    expect(draw()).toEqual(board(4, 0));
  });

  it("strips a board within the dealing budget, which is under the game's own", () => {
    // Showing all but its last k numbers, this board takes 2k+1 positions.
    const stripped = dealUnreasonable({
      ...toy,
      draw: () => full(16),
      strip: hideFromTheEnd,
    });
    const hidden = 16 - stripped.given.length;
    expect(2 * hidden + 1).toBeLessThanOrEqual(DEALING_BUDGET);
    expect(2 * (hidden + 1) + 1).toBeGreaterThan(DEALING_BUDGET);
    // With no strip the same board is asked within the game's budget, and
    // kept showing nothing.
    const bare = board(16, 136);
    expect(toy.answer(bare, DEALING_BUDGET).kind).toBe("out-of-reach");
    expect(dealUnreasonable({ ...toy, draw: () => bare })).toBe(bare);
  });

  it("strips only a board the search proves within the dealing budget", () => {
    const kept = full(4);
    const strips: Board[] = [];
    const dealt = dealUnreasonable({
      ...toy,
      draw: drawEach([board(16, 136), kept]),
      strip(b, one) {
        strips.push(b);
        hideFromTheEnd(b, one);
      },
    });
    expect(strips).toEqual([kept]);
    expect(dealt).toBe(kept);
    expect(dealt.given).toEqual([]);
  });

  it("throws away a board its strip left with a second answer", () => {
    const broken = board(4, 3, [true, true, false, false]);
    const kept = full(4);
    const dealt = dealUnreasonable({
      ...toy,
      draw: drawEach([broken, kept]),
      strip(b, one) {
        if (b === broken) b.given = [];
        else hideFromTheEnd(b, one);
      },
    });
    expect(dealt).toBe(kept);
  });

  it("runs its bound out where no board has the tier", () => {
    let draws = 0;
    const deal = () =>
      dealUnreasonable({
        ...toy,
        draw: () => {
          draws++;
          return board(4, 3);
        },
      });
    expect(() => underDealTries(25, deal)).toThrow(
      new RetryLimitExceeded(toy.label, 25),
    );
    expect(draws).toBe(25);
  });
});

describe("the two tiers", () => {
  interface P {
    diff: number;
  }
  const config = [searchTierItem<P>("diff", "What each asks.")];
  const codec = paramsCodec<P>(
    () => ({ diff: DIFF_EASY }),
    [searchTierSegment(config)],
  );

  it("are Easy and Unreasonable, in that order", () => {
    expect(SEARCH_TIER_NAMES).toEqual(["Easy", "Unreasonable"]);
    expect(SEARCH_TIER_NAMES[DIFF_UNREASONABLE]).toBe("Unreasonable");
  });

  it("are written in the full params only, and absent reads as Easy", () => {
    expect(codec.encodeParams({ diff: DIFF_EASY }, true)).toBe("de");
    expect(codec.encodeParams({ diff: DIFF_UNREASONABLE }, true)).toBe("du");
    expect(codec.encodeParams({ diff: DIFF_UNREASONABLE }, false)).toBe("");
    expect(codec.decodeParams("du")).toEqual({ diff: DIFF_UNREASONABLE });
    expect(codec.decodeParams("")).toEqual({ diff: DIFF_EASY });
  });

  it("solve at Easy where deduction finishes, and above it where the search says one", () => {
    /** The contract's verdicts at the two caps for a board whose deduction
     * finishes or not and whose search says `kind`. */
    const verdicts = (finishes: boolean, kind: Answer<null>["kind"]) => {
      const contract = searchTierContract<P, string>({
        newState: (_p, desc) => desc,
        deductionFinishes: () => finishes,
        answerOf: () => (kind === "one" ? { kind, solution: null } : { kind }),
      });
      return [DIFF_EASY, DIFF_UNREASONABLE].map((cap) =>
        contract.solveAtCap({ diff: DIFF_EASY }, "", cap),
      );
    };
    expect(verdicts(true, "one")).toEqual(["solved", "solved"]);
    expect(verdicts(false, "one")).toEqual(["unsolved", "solved"]);
    expect(verdicts(false, "several")).toEqual(["unsolved", "unsolved"]);
    expect(verdicts(false, "out-of-reach")).toEqual(["unsolved", "unsolved"]);
    expect(verdicts(false, "none")).toEqual(["unsolved", "impossible"]);
  });
});
