/**
 * "a 8" is the article trap (docs/hints.md § "Name a square by its
 * value"): a sentence that puts "a" before a number reads wrong at 8, 11 and
 * 18. Each sentence that has made it is pinned here at the value that exposed
 * it, beside a value that must keep "a".
 */

import { describe, expect, it } from "vitest";
import {
  type Marked as CrossingMarked,
  say as crossing,
} from "../games/crossing/hint-text.ts";
import { STATED as DOMINOSA } from "../games/dominosa/dominosa.compiled.ts";
import { SPOT } from "../games/dominosa/kinds.ts";
import { say as keen } from "../games/keen/hint-text.ts";
import { indefinite } from "./hint-text.ts";
import { CELL } from "./hint-words.ts";
import { statedSentence } from "./stated.ts";

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
    expect(keen.cageLine(cage, 0, 15, [8], true).text).toContain(
      "places an 8 in its row",
    );
    expect(keen.cageLine(cage, 0, 15, [3], false).text).toContain(
      "places a 3 in its column",
    );
    expect(keen.cageLine(cage, 0, 15, [1, 8], false).text).toContain(
      "places a 1 and an 8 in its column",
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
      against: [],
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

  it("Dominosa's duplicate dominoes", () => {
    const said = (lo: number, hi: number): string =>
      statedSentence(DOMINOSA.localDuplicate.step[0], {
        kind: CELL,
        ringKind: SPOT,
        at: (c) => ({ x: c, y: 0 }),
        ring: [[0, 1]],
        marks: { outline: [], stripes: [] },
        terms: { lo, hi },
        value: String,
      }).text;
    expect(said(8, 8)).toMatch(/^An 8–8 domino on the ringed spot/);
    expect(said(1, 8)).toMatch(/^A 1–8 domino on the ringed spot/);
  });
});
