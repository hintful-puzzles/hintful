/**
 * Every trail on a Wordtrail board that spells a word: what the description
 * deals as its `trail` clues, which every deduction and the answer check
 * read, and the generator's test of a board's uniqueness.
 *
 * A trail is squares side by side, none twice, whose letters read from its
 * first square spell a common word (`engine/word-list`) as long as one of
 * the listed lengths. A word reads one way, so squares that spell a word
 * both ways round (TUB and BUT) are two trails, one each way.
 */

import {
  commonSpan,
  narrowCommon,
  type WordSpan,
} from "../../engine/word-list/index.ts";

/** A trail, its squares in reading order. */
export type Trail = readonly number[];

/** A letter, 1 for a to 26 for z, as the board holds it. */
export const letterChar = (letter: number): string => String.fromCharCode(96 + letter);

/** The word `trail` spells on `letters`, in lowercase. */
export const spell = (letters: Uint8Array, trail: Trail): string =>
  trail.map((i) => letterChar(letters[i])).join("");

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
  // Each wanted length's words that begin with the path's letters.
  const extend = (i: number, spans: readonly WordSpan[]): void => {
    const letter = letterChar(letters[i]);
    const next: WordSpan[] = [];
    for (const span of spans) {
      const narrowed = narrowCommon(span, letter);
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
  const start = wanted.map(commonSpan);
  for (let i = 0; i < w * h; i++) if (letters[i] !== 0) extend(i, start);
  return out;
}
