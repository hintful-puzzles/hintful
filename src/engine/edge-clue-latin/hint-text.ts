/**
 * The words the edge-clue games' hints share: the value vocabulary for the
 * generic Latin arms (`engine/hint-text.ts`), and the outline of the two cells
 * either side of a clue, which every clue sentence marks.
 *
 * A value prints as the board draws it, `state.ts`'s `displayChar` at the grid's
 * order, which runs 0-based digits and then letters once the order passes 9.
 */

import { joinWith, type LatinVocab } from "../hint-text.ts";
import { CELL, mark, type Narration } from "../hint-words.ts";
import type { Point } from "../types.ts";
import { displayChar } from "./state.ts";

/** The value vocabulary for the shared generic-Latin arms. */
export function edgeClueVocab(order: number): LatinVocab {
  return { noun: "number", value: (n) => displayChar(n, order) };
}

/** Values that all go ("clashes with 1 and 2"), as the board prints them. */
export const allOf = (ns: number[], order: number): string =>
  joinWith(ns.map((n) => displayChar(n, order)));

/**
 * The two cells a clue deduction is about: the struck cell `at`, and the cell
 * across the clue, `other`. Both are outlined, and the words naming the clue
 * between them are that outline.
 */
export interface CluePair {
  at: Point;
  other: Point;
}

/** `words` naming the clue, outlining both its cells. */
export const theClue = (p: CluePair, words: string): Narration =>
  mark.as("outline", CELL, [p.at, p.other], words);
/** `words` naming the cell across the clue, outlining it. */
export const across = (p: CluePair, words: string): Narration =>
  mark.as("outline", CELL, [p.other], words);
