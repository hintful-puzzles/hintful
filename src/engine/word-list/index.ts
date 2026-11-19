/**
 * The word games' English word lists: the answers a game may deal, the
 * common words a board of words is judged by, and the guesses a player may
 * type, each a superset of the one before. What each list holds and where
 * it comes from is `scripts/word-list.ts`, which generates `data.ts`.
 *
 * Each length's words are one sorted string, so membership is a binary search
 * over fixed-width slices, and nothing is parsed or allocated at load.
 */

import { type RandomState, randomUpto } from "../random/index.ts";
import { ANSWERS, COMMON, GUESSES } from "./data.ts";

/** The word lengths the lists hold, shortest first. */
export const WORD_LENGTHS: readonly number[] = Object.keys(GUESSES)
  .map(Number)
  .filter((length) => GUESSES[length] !== "")
  .sort((a, b) => a - b);

function listed(list: Readonly<Record<number, string>>, word: string): boolean {
  const words = list[word.length];
  if (words === undefined) return false;
  const length = word.length;
  let low = 0;
  let high = words.length / length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    const candidate = words.slice(middle * length, (middle + 1) * length);
    if (candidate === word) return true;
    if (candidate < word) low = middle + 1;
    else high = middle;
  }
  return false;
}

/** Whether `word`, in lowercase letters, is an accepted guess. */
export function isGuess(word: string): boolean {
  return listed(GUESSES, word);
}

/** Whether `word`, in lowercase letters, is a common word: one a board of
 * words counts, and a hint may name. */
export function isCommon(word: string): boolean {
  return listed(COMMON, word);
}

/** Whether `word`, in lowercase letters, is one a game may deal. */
export function isAnswer(word: string): boolean {
  return listed(ANSWERS, word);
}

/** How many answers there are of `length` letters. */
export function answerCount(length: number): number {
  return (ANSWERS[length] ?? "").length / length;
}

/** Each list's words of `length` letters, in order, split once. */
const split = new Map<string, readonly string[]>();
function wordsOf(
  name: "answers" | "common" | "guesses",
  list: Readonly<Record<number, string>>,
  length: number,
): readonly string[] {
  const key = `${name}${length}`;
  let words = split.get(key);
  if (words === undefined) {
    const all = list[length] ?? "";
    words = Array.from({ length: all.length / length }, (_, i) =>
      all.slice(i * length, (i + 1) * length),
    );
    split.set(key, words);
  }
  return words;
}

/** Every answer of `length` letters, in alphabetical order. */
export const answerWords = (length: number): readonly string[] =>
  wordsOf("answers", ANSWERS, length);

/** Every common word of `length` letters, in alphabetical order. */
export const commonWords = (length: number): readonly string[] =>
  wordsOf("common", COMMON, length);

/** Every accepted guess of `length` letters, in alphabetical order. */
export const guessWords = (length: number): readonly string[] =>
  wordsOf("guesses", GUESSES, length);

/**
 * The common words of `length` letters that begin with the letters a search
 * has matched so far: the run of them in the sorted list, from `lo` up to
 * `hi`, the first `depth` letters of each matched. A search over a board
 * spells a trail a letter at a time with {@link narrowCommon}, and stops
 * where no word is left.
 */
export interface WordSpan {
  readonly length: number;
  readonly lo: number;
  readonly hi: number;
  readonly depth: number;
}

/** Every common word of `length` letters, none of their letters matched. */
export function commonSpan(length: number): WordSpan {
  return { length, lo: 0, hi: (COMMON[length] ?? "").length / length, depth: 0 };
}

/** The words of `span` whose next letter is `letter`, in lowercase, or
 * `null` where none is. A span whose every letter is matched is one word. */
export function narrowCommon(span: WordSpan, letter: string): WordSpan | null {
  const { length, depth } = span;
  if (depth >= length) return null;
  const words = COMMON[length];
  const at = (i: number): string => words[i * length + depth];
  // The words of a span share their first `depth` letters, so they are
  // sorted by the next one: two searches find the run that has `letter`.
  const first = (above: (c: string) => boolean): number => {
    let low = span.lo;
    let high = span.hi;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (above(at(middle))) high = middle;
      else low = middle + 1;
    }
    return low;
  };
  const lo = first((c) => c >= letter);
  const hi = first((c) => c > letter);
  return lo < hi ? { length, lo, hi, depth: depth + 1 } : null;
}

/** A uniformly random answer of `length` letters. */
export function drawAnswer(length: number, rs: RandomState): string {
  const count = answerCount(length);
  if (count === 0) throw new RangeError(`no answers of ${length} letters`);
  const at = randomUpto(rs, count) * length;
  return ANSWERS[length].slice(at, at + length);
}
