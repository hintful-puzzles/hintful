/**
 * Every sentence Dominosa's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `hint`, which reads the two numbers off the board); this file decides only
 * how it reads. Every word that points at the board is a reference to the mark
 * it points at (`engine/hint-words.ts`): the spot a step decides is ringed, and
 * the squares it reasons from are outlined.
 */

import { indefinite } from "../../engine/hint-text.ts";
import {
  CELL,
  type MarkKind,
  mark,
  type Narration,
  phrase,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { BarrierTechnique, PlaceTechnique } from "./solver.ts";

/** A spot: two neighboring squares, by index, which a domino could cover. A
 * step decides one, and rings both its squares: joined as one domino when it
 * places one there, or apart with a line drawn between them when it rules one
 * out. */
type Spot = readonly [number, number];

export const SPOT: MarkKind<Spot> = {
  name: "spot",
  key: ([a, b]) => (a < b ? `${a}-${b}` : `${b}-${a}`),
};

/** The domino two numbers make, lowest first: "2–5". */
function domino(a: number, b: number): string {
  return a <= b ? `${a}–${b}` : `${b}–${a}`;
}

const at = (spot: Spot, words: string): Narration =>
  mark.as("ring", SPOT, [spot], words);

const outlined = (cells: readonly Point[], noun: string, det?: string): Narration =>
  mark.the("outline", CELL, cells, noun, det);

export const say = {
  /** A placement of the domino showing `a` and `b`. */
  place: (
    technique: PlaceTechnique,
    a: number,
    b: number,
    spot: Spot,
    evidence: readonly Point[],
  ): Narration => {
    const dom = domino(a, b);
    if (technique === "squareOnly")
      return phrase`${outlined(evidence, "square").capitalized()} has only one neighbor left to pair with, so the ${dom} domino must go ${at(spot, "here")}.`;
    return phrase`The ${dom} domino has only one spot left where it fits, because every other pairing is blocked, so it must go ${at(spot, "here")}.`;
  },

  /** A later barrier of the same firing, whose reason the first one gave. */
  barrierNext: (spot: Spot, evidence: readonly Point[]): Narration =>
    evidence.length
      ? phrase`${at(spot, "This spot")} can't hold a domino either, for the same reason about ${outlined(evidence, "square")}.`
      : phrase`${at(spot, "This spot")} can't hold a domino for the same reason.`,

  /** A barrier between two squares showing `a` and `b`. */
  barrier: (
    technique: BarrierTechnique,
    a: number,
    b: number,
    spot: Spot,
    evidence: readonly Point[],
  ): Narration => {
    const dom = domino(a, b);
    switch (technique) {
      case "squareSingleDomino":
        return phrase`${outlined(evidence, "square").capitalized()} can only be part of the ${dom} domino, so ${dom} can't sit ${at(spot, "here")} instead.`;
      case "mustOverlap":
        return phrase`${mark.as("outline", CELL, evidence, "Every remaining spot for the outlined domino")} overlaps ${at(spot, "this pair")}, so no other domino can go there.`;
      case "localDuplicate":
        return phrase`${indefinite(dom, true)} ${dom} domino ${at(spot, "here")} would force a second ${dom} at ${outlined(evidence, "square")}, but each domino is used once, so it can't.`;
      case "localDuplicate2":
        return phrase`A domino ${at(spot, "here")} would leave ${outlined(evidence, "square", "both")} needing one and the same domino, a duplicate, so it can't.`;
      case "parity":
        return phrase`A domino ${at(spot, "here")} would split the empty squares into odd-sized regions, which dominoes can't fill, so it can't go there.`;
      case "set":
        return phrase`${outlined(evidence, "square").capitalized()} can only hold one set of dominoes, which uses the ${dom}, so ${dom} can't sit ${at(spot, "here")} as well.`;
    }
  },
};
