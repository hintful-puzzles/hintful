/**
 * "a 8" is the article trap (docs/games/hints.md § "Name a square by its
 * value"): a sentence that puts "a" before a number reads wrong at 8, 11 and
 * 18. Six sentences in four games shipped it until the hint text moved into
 * one file per game and a single sweep could see them all. Each is pinned here
 * at the value that exposed it, beside a value that must keep "a".
 */

import { describe, expect, it } from "vitest";
import {
  type Marked as CrossingMarked,
  say as crossing,
} from "../games/crossing/hint-text.ts";
import { say as dominosa } from "../games/dominosa/hint-text.ts";
import { say as keen } from "../games/keen/hint-text.ts";
import { indefinite, noteText } from "./hint-text.ts";

type SharedDigit = Parameters<typeof crossing.sharedDigit>[0];
type NoteStrike = Parameters<typeof crossing.noteStrike>[0];

describe("a number after an article gets the article it is pronounced with", () => {
  it("indefinite picks by pronunciation, and capitalizes on request", () => {
    expect(["8", "11", "18", "80", "3", "1", "12"].map((s) => indefinite(s))).toEqual([
      "an",
      "an",
      "an",
      "an",
      "a",
      "a",
      "a",
    ]);
    expect(indefinite("8", true)).toBe("An");
    expect(indefinite("3", true)).toBe("A");
  });

  it("Keen's cage line", () => {
    const cage = [{ x: 0, y: 0 }];
    expect(keen.cageLine(cage, 0, 15, 8, true).text).toContain(
      "places an 8 in its row",
    );
    expect(keen.cageLine(cage, 0, 15, 3, false).text).toContain(
      "places a 3 in its column",
    );
  });

  it("Crossing's shared digit and single note strike", () => {
    const at = { x: 0, y: 0 };
    const marked = (digits: number[]): CrossingMarked => ({
      targets: [at],
      notes: digits.map((n) => ({ ...at, n })),
      run: [at],
      otherRun: [],
      fitting: [1, 2],
      otherFitting: [],
      number: null,
    });
    const shared = (digit: number) =>
      crossing.sharedDigit(
        { technique: "sharedDigit", digit } as SharedDigit,
        true,
        marked([]),
      ).text;
    expect(shared(8)).toContain("has an 8 in this square");
    expect(shared(3)).toContain("has a 3 in this square");
    const strike = (digits: number[]) =>
      crossing.noteStrike(
        { technique: "noteStrike", digits } as NoteStrike,
        false,
        marked(digits),
      ).text;
    expect(strike([8])).toContain("puts an 8 in this square");
    expect(strike([3])).toContain("puts a 3 in this square");
  });

  it("the shared note step, before a word rather than a value", () => {
    // Group's noun is "element": "rules out a element" shipped.
    const vocab = (noun: string) => ({ noun, placedVerb: "placed", regions: "row" });
    const at = { x: 0, y: 0 };
    expect(noteText(at, [], true, vocab("element")).text).toContain(
      "rules out an element yet",
    );
    expect(noteText(at, [], true, vocab("number")).text).toContain(
      "rules out a number yet",
    );
  });

  it("Dominosa's duplicate dominoes", () => {
    const spot = [0, 1] as const;
    expect(dominosa.barrier("localDuplicate", 8, 8, spot, []).text).toMatch(
      /^An 8–8 domino here/,
    );
    expect(dominosa.barrier("localDuplicate", 1, 8, spot, []).text).toMatch(
      /^A 1–8 domino here/,
    );
  });
});
