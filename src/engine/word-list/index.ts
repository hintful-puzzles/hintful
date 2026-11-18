/**
 * The word games' English word list: the answers a game may deal, and the
 * guesses it accepts, a superset of them. What each list holds and where it
 * comes from is `scripts/word-list.ts`, which generates `data.ts`.
 *
 * Each length's words are one sorted string, so membership is a binary search
 * over fixed-width slices, and nothing is parsed or allocated at load.
 */

import { type RandomState, randomUpto } from "../random/index.ts";
import { ANSWERS, GUESSES } from "./data.ts";

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
  name: "answers" | "guesses",
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

/** Every accepted guess of `length` letters, in alphabetical order. */
export const guessWords = (length: number): readonly string[] =>
  wordsOf("guesses", GUESSES, length);

/** A uniformly random answer of `length` letters. */
export function drawAnswer(length: number, rs: RandomState): string {
  const count = answerCount(length);
  if (count === 0) throw new RangeError(`no answers of ${length} letters`);
  const at = randomUpto(rs, count) * length;
  return ANSWERS[length].slice(at, at + length);
}
