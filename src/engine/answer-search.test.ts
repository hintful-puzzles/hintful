/**
 * The search that counts a board's answers, and what a game makes of its four
 * verdicts, over a toy: choose some of the numbers 1 to `n` to sum to a
 * target. A position is the numbers decided so far, taken or left.
 */
import { describe, expect, it } from "vitest";
import {
  type Answer,
  answerCache,
  DIFF_EASY,
  DIFF_UNREASONABLE,
  SEARCH_TIER_NAMES,
  searchAnswers,
  searchTierContract,
  searchTierItem,
  searchTierSegment,
  solveFromAnswer,
} from "./answer-search.ts";
import { PUZZLE_NOT_REASONABLE } from "./hint-refusal.ts";
import { paramsCodec } from "./params-codec.ts";
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
): Answer<number[]> {
  const sum = (taken: Taken) => taken.reduce((s, t, i) => s + (t ? i + 1 : 0), 0);
  return searchAnswers<Taken, number[]>({
    start: [],
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
