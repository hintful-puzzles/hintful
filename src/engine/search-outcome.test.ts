import { describe, expect, it } from "vitest";
import { PUZZLE_NOT_REASONABLE, SEARCH_OUT_OF_REACH } from "./hint-refusal.ts";
import {
  type SearchOutcome,
  searchRefusal,
  searchVerdict,
  solveBySearch,
} from "./search-outcome.ts";
import { NO_SOLUTION, NO_SOLUTION_FROM_HERE } from "./solve-failure.ts";

const found = (...line: string[]): SearchOutcome<string> => ({ kind: "found", line });
const lost: SearchOutcome<string> = { kind: "lost" };
const past: SearchOutcome<string> = { kind: "out-of-reach" };

describe("what a search's outcome means", () => {
  it("refuses a lost position as lost, and one past the search as out of reach", () => {
    expect(searchRefusal({ kind: "lost" })).toEqual({
      ok: false,
      error: NO_SOLUTION_FROM_HERE,
    });
    expect(searchRefusal({ kind: "out-of-reach" })).toEqual({
      ok: false,
      error: SEARCH_OUT_OF_REACH,
    });
  });

  it("judges a rival by what the search settled", () => {
    expect(searchVerdict(found("a"))).toBe("finishes");
    expect(searchVerdict(lost)).toBe("lost");
    expect(searchVerdict(past)).toBe("unknown");
  });
});

describe("Solve by search", () => {
  const solve = (answers: Record<string, SearchOutcome<string>>) => {
    const asked: string[] = [];
    const result = solveBySearch(
      "dealt",
      "player",
      (s: string) => {
        asked.push(s);
        return answers[s];
      },
      (from, line) => `${from}:${line.join("")}`,
    );
    return { asked, result };
  };

  it("finishes from the player's position where a line is found there", () => {
    const { asked, result } = solve({ player: found("a", "b"), dealt: found("c") });
    expect(result).toEqual({ ok: true, move: "player:ab" });
    expect(asked).toEqual(["player"]);
  });

  it("falls back on the dealt board, lost or past the search", () => {
    for (const player of [lost, past]) {
      const { asked, result } = solve({ player, dealt: found("c") });
      expect(result).toEqual({ ok: true, move: "dealt:c" });
      expect(asked).toEqual(["player", "dealt"]);
    }
  });

  it("says the dealt board has no solution only where that was proved", () => {
    expect(solve({ player: past, dealt: lost }).result).toEqual({
      ok: false,
      error: NO_SOLUTION,
    });
    expect(solve({ player: lost, dealt: past }).result).toEqual({
      ok: false,
      error: PUZZLE_NOT_REASONABLE,
    });
  });
});
