import { describe, expect, it } from "vitest";
import { randomNew } from "../random/index.ts";
import { ANSWERS, COMMON, GUESSES } from "./data.ts";
import {
  answerCount,
  commonSpan,
  drawAnswer,
  isAnswer,
  isCommon,
  isGuess,
  narrowCommon,
  WORD_LENGTHS,
  type WordSpan,
} from "./index.ts";

function words(list: Readonly<Record<number, string>>, length: number): string[] {
  return list[length].match(new RegExp(`.{${length}}`, "g")) ?? [];
}

describe("word-list", () => {
  it("holds sorted, distinct, lowercase words of each length, answers among common words among guesses", () => {
    expect(WORD_LENGTHS).toEqual([3, 4, 5, 6, 7, 8]);
    for (const length of WORD_LENGTHS) {
      for (const list of [ANSWERS, COMMON, GUESSES]) {
        const all = words(list, length);
        expect(list[length].length).toBe(all.length * length);
        expect(all.every((w) => /^[a-z]+$/.test(w))).toBe(true);
        expect(all.every((w, i) => i === 0 || all[i - 1] < w)).toBe(true);
      }
      expect(words(ANSWERS, length).every(isCommon)).toBe(true);
      expect(words(COMMON, length).every(isGuess)).toBe(true);
    }
  });

  it("counts a common word and its plural, but no obscure, rude or abbreviated word", () => {
    for (const word of ["cats", "walked", "gland"]) expect(isCommon(word)).toBe(true);
    // REE is SCOWL size 80; BITCHY is excluded, BITCHES with BITCH, its
    // lemma; MPH is an abbreviation and XII a numeral.
    for (const word of ["ree", "bitchy", "bitches", "mph", "xii"]) {
      expect(isCommon(word)).toBe(false);
    }
    // A player may still type them as a guess.
    expect(isGuess("ree")).toBe(true);
  });

  it("finds every listed word, at both ends, and no near miss", () => {
    for (const length of WORD_LENGTHS) {
      const all = words(GUESSES, length);
      for (const word of [all[0], all[all.length - 1], all[all.length >> 1]]) {
        expect(isGuess(word)).toBe(true);
      }
    }
    expect(isGuess("crane")).toBe(true);
    expect(isAnswer("crane")).toBe(true);
    expect(isGuess("cranx")).toBe(false);
    expect(isGuess("aaaaa")).toBe(false);
    expect(isGuess("crane".toUpperCase())).toBe(false);
    expect(isGuess("ab")).toBe(false);
    expect(isGuess("")).toBe(false);
    // A guess that is no answer: an inflection.
    expect(isGuess("cranes")).toBe(true);
    expect(isAnswer("cranes")).toBe(false);
  });

  it("narrows a length's common words a letter at a time to exactly those that begin so", () => {
    const spell = (word: string, length: number) => {
      let span: WordSpan | null = commonSpan(length);
      for (const letter of word) span = span && narrowCommon(span, letter);
      return span;
    };
    for (const length of WORD_LENGTHS) {
      const all = words(COMMON, length);
      for (const prefix of [
        "c",
        "cr",
        "qu",
        "zz",
        "a",
        all[all.length - 1].slice(0, 2),
      ]) {
        const span = spell(prefix, length);
        const expected = all.filter((w) => w.startsWith(prefix));
        if (expected.length === 0) expect(span).toBeNull();
        else expect(all.slice(span?.lo, span?.hi)).toEqual(expected);
      }
      // Every letter matched: the one word, and nothing past it.
      const whole = spell(all[7], length);
      expect(whole && all.slice(whole.lo, whole.hi)).toEqual([all[7]]);
      expect(whole && narrowCommon(whole, "a")).toBeNull();
    }
    expect(spell("crane", 5)).not.toBeNull();
    expect(spell("cranx", 5)).toBeNull();
  });

  it("deals the same answer from the same seed, and every answer it deals is one", () => {
    const first = drawAnswer(5, randomNew("seed"));
    expect(drawAnswer(5, randomNew("seed"))).toBe(first);
    const rs = randomNew("many");
    const dealt = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const word = drawAnswer(5, rs);
      expect(isAnswer(word)).toBe(true);
      dealt.add(word);
    }
    expect(dealt.size).toBeGreaterThan(150);
    expect(answerCount(5)).toBeGreaterThan(1000);
    expect(() => drawAnswer(2, rs)).toThrow(RangeError);
  });
});
