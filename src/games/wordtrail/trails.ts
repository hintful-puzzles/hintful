/**
 * Every trail on a Wordtrail board that spells a word: what the description
 * deals as its `trail` clues, which every deduction and the answer check
 * read, and the generator's test of a board's uniqueness.
 *
 * A trail is squares side by side, none twice, whose letters read from its
 * first square spell an accepted guess (`engine/word-list`) as long as one
 * of the listed lengths. A word reads one way, so squares that spell a word
 * both ways round (SIP and PIS) are two trails, one each way.
 */

import {
  type GuessSpan,
  guessSpan,
  narrowGuesses,
} from "../../engine/word-list/index.ts";

/** A trail, its squares in reading order. */
export type Trail = readonly number[];

/** A letter, 1 for a to 26 for z, as the board holds it. */
export const letterChar = (letter: number): string => String.fromCharCode(96 + letter);

/** The squares beside square `i` on a `w` × `h` grid, up, down, left, right. */
export function neighbors(w: number, h: number, i: number): number[] {
  const x = i % w;
  const out: number[] = [];
  if (i >= w) out.push(i - w);
  if (i + w < w * h) out.push(i + w);
  if (x > 0) out.push(i - 1);
  if (x < w - 1) out.push(i + 1);
  return out;
}

/**
 * Every trail on the board spelling a word of one of `lengths`, each once,
 * in the order a search from the first square in reading order meets them.
 * `letters` holds 0 for a dark square.
 */
export function trailsOf(
  w: number,
  h: number,
  letters: Uint8Array,
  lengths: readonly number[],
): Trail[] {
  const wanted = [...new Set(lengths)];
  const longest = Math.max(...wanted);
  const out: Trail[] = [];
  const path: number[] = [];
  const on = new Uint8Array(w * h);
  // Each wanted length's guesses that begin with the path's letters.
  const extend = (i: number, spans: readonly GuessSpan[]): void => {
    const letter = letterChar(letters[i]);
    const next: GuessSpan[] = [];
    for (const span of spans) {
      const narrowed = narrowGuesses(span, letter);
      if (narrowed !== null) next.push(narrowed);
    }
    if (next.length === 0) return;
    path.push(i);
    on[i] = 1;
    if (next.some((s) => s.depth === s.length)) out.push(path.slice());
    if (path.length < longest) {
      const longer = next.filter((s) => s.depth < s.length);
      for (const j of neighbors(w, h, i))
        if (letters[j] !== 0 && !on[j]) extend(j, longer);
    }
    path.pop();
    on[i] = 0;
  };
  const start = wanted.map(guessSpan);
  for (let i = 0; i < w * h; i++) if (letters[i] !== 0) extend(i, start);
  return out;
}
