/**
 * Every sentence Loopy's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values ([`hint.ts`](./hint.ts)'s
 * `narrate`); this file decides only how it reads. Each sentence runs indication,
 * reasoning, conclusion, with the conclusion in the necessity voice
 * (docs/games/hints.md § "Writing the narration"). A clue is "this 3" because the
 * hint outlines its face, a dot is "the ringed dot", and an edge the move sets is
 * "this edge", the one drawn with the hint's band. An edge the loop cannot use
 * "can't be a line", as a Palisade edge "can't be a wall".
 *
 * **The words for the two hidden facts.** A *corner* is two edges meeting at a dot
 * around one face, drawn as a wedge in that face's angle: filled when the loop
 * needs a line there, outlined when it can take one at most. A *pair* is two edges
 * known to match (both lines or neither) or to be opposites, drawn as a connector
 * between them marked `=` or `≠`. A step resting on more than a sentence can say
 * numbers every fact behind it in the order it was found, and names the marks it
 * concludes from by number. What links one numbered mark to the next is always the
 * clue or dot beside it and the marks before it, which the help page teaches once
 * rather than every step repeating (docs/games/hints.md § "Rules belong in the
 * help").
 */

import { joinWith } from "../../engine/hint-text.ts";

/** What a corner is known to carry. */
export type CornerBound = "atLeastOne" | "atMostOne" | "exactlyOne";

/** How a corner step ends: the corner against the lines already at its dot. */
export type CornerThen = "otherLine" | "bothLines" | "otherEmpty" | "neither" | "exit";

/** What a sentence says about a corner, and how the reader can check it: from the
 * clue beside it in words, or by the number on its mark. */
export type CornerSubject =
  | { kind: "clue"; clue: number; total: number; bound: CornerBound }
  | { kind: "numbered"; labels: readonly number[]; bound: CornerBound };

const verdict = (line: boolean): string =>
  line ? "must be a line" : "can't be a line";

/** "all 3" for a clue's whole count, and "its line" for a 1's. */
const allOf = (clue: number): string => (clue === 1 ? "its line" : `all ${clue}`);

const capitalized = (s: string): string => s[0].toUpperCase() + s.slice(1);

/** A numbered corner mark by its labels. A mark shows two numbers when two facts
 * about one corner were found at different points of the chain. */
const cornerName = (labels: readonly number[]): string =>
  labels.length === 1
    ? `corner ${labels[0]}`
    : `the corner marked ${joinWith(labels.map(String))}`;

const cornerList = (labels: readonly number[]): string =>
  labels.length === 1
    ? `corner ${labels[0]}`
    : `corners ${joinWith(labels.map(String))}`;

const pairsMake = (pairs: number): string =>
  pairs === 1 ? "the numbered pair makes" : "the numbered pairs make";

function cornerClause(subject: CornerSubject): string {
  if (subject.kind === "numbered") {
    const name = capitalized(cornerName(subject.labels));
    switch (subject.bound) {
      case "atLeastOne":
        return `${name} needs a line`;
      case "atMostOne":
        return `${name} can take one line at most`;
      case "exactlyOne":
        return `${name} takes exactly one line`;
    }
  }
  const { clue, total } = subject;
  switch (subject.bound) {
    case "atLeastOne":
      return total === 0
        ? `This ${clue}'s other edges are ruled out, so it needs a line at the marked corner`
        : `This ${clue}'s other edges give it ${total} at most, so it needs a line at the marked corner`;
    case "atMostOne":
      // Any corner of a 1 takes one line at most, whatever its other edges hold.
      return clue === 1
        ? "This 1 takes one line, so the marked corner can take one at most"
        : `This ${clue}'s other edges already give it ${total}, so the marked corner can take one line at most`;
    case "exactlyOne":
      return `This ${clue}'s other edges give it exactly ${clue - 1}, so the marked corner takes exactly one line`;
  }
}

const CORNER_THEN: Record<CornerThen, string> = {
  otherLine: "; one edge there is ruled out, so the other must be a line.",
  bothLines: "; the ringed dot takes both or neither, so both must be lines.",
  otherEmpty: "; one edge there is already a line, so this edge can't be one.",
  neither: "; the ringed dot takes both or neither, so neither can be a line.",
  exit: "; the ringed dot has no line yet, so this edge must be its second.",
};

export const say = {
  /** A clue with all its lines; `edges` is how many of its edges the step rules out. */
  clueFull: (clue: number, edges: number): string => {
    if (clue === 0) {
      return edges === 1
        ? "A 0 takes no lines, so this edge can't be a line."
        : "A 0 takes no lines, so its edges can't be lines.";
    }
    const has = clue === 1 ? "its line" : `all ${clue} of its lines`;
    const which =
      edges === 1 ? "this edge can't be a line" : "its other edges can't be lines";
    return `This ${clue} already has ${has}, so ${which}.`;
  },

  /** A clue with only as many edges left as it needs; `edges` is how many the step
   * draws. */
  clueStarved: (clue: number, edges: number): string => {
    if (clue === 1)
      return "Only one of this 1's edges isn't ruled out, so it must be a line.";
    const which =
      edges === 1 ? "this last one must be a line too" : "all of them must be lines";
    return `Only ${clue} of this ${clue}'s edges aren't ruled out, so ${which}.`;
  },

  // Two premises: the clue can spare one open edge, and the ringed dot already
  // spends it, because the dot's existing line means the two edges there cannot
  // both be lines.
  clueOneShort: (clue: number): string =>
    `This ${clue} can spare one open edge and must spare one at the ringed dot, which already has a line; the rest must be lines.`,

  deadEnd:
    "The ringed dot has no line and no other open edge, so a line here would dead-end: this edge can't be a line.",

  lineContinues:
    "The line at the ringed dot has no other way to go on, so this edge must be a line.",

  dotFull: (edges: number): string =>
    `The ringed dot already has its two lines, so ${edges === 1 ? "this edge can't be a line" : "its other edges can't be lines"}.`,

  /** The edge would close the marked lines too early: some drawn line would be left
   * out of the loop, or the outlined clues would stay unmet. */
  earlyLoop: (because: "strayLines" | "unmetClues", unmet: number): string => {
    if (because === "strayLines") {
      return "This edge would close the marked lines into a loop that leaves other lines out, so it can't be a line.";
    }
    const clues = unmet === 1 ? "the outlined clue" : "the outlined clues";
    return `This edge would close the marked lines into a loop with ${clues} still unmet, so it can't be a line.`;
  },

  closesLoop:
    "This edge closes the marked lines into one loop that meets every clue, so it must be a line.",

  /** A clue's other edges can give it one line fewer than it needs, counting each
   * marked corner once because its dot already has a line. */
  boundLine: (clue: number, corners: number): string => {
    const why =
      corners === 1
        ? "the marked corner's dot already has a line"
        : "each marked corner's dot already has a line";
    return `This ${clue}'s other edges can give it only ${clue - 1}, as ${why}, so this edge must be a line.`;
  },

  /** A clue already has its count once each marked corner gives it one, because the
   * line at the corner's dot must go on through it. */
  boundEmpty: (clue: number, corners: number): string => {
    const marked =
      corners === 1
        ? "the marked corner, where the dot's line must go on"
        : `the ${corners} marked corners, where each dot's line must go on`;
    return `This ${clue} already has ${allOf(clue)} counting ${marked}, so this edge can't be a line.`;
  },

  boundLineChain: (clue: number, labels: readonly number[]): string =>
    `This ${clue}'s other edges can give it only ${clue - 1}, counting one for ${cornerList(labels)}, so this edge must be a line.`,

  boundEmptyChain: (clue: number, labels: readonly number[]): string =>
    `This ${clue} already has ${allOf(clue)} counting ${cornerList(labels)}, so this edge can't be a line.`,

  corner: (subject: CornerSubject, then: CornerThen): string =>
    `${cornerClause(subject)}${CORNER_THEN[then]}`,

  /** Two edges of a clue that match, with room for one more line (`line` false:
   * neither can be one) or one more empty edge (`line` true: both must be lines). */
  matchingPair: (clue: number, pairs: number, line: boolean): string => {
    const room = line
      ? `this ${clue} can spare one more edge, so both must be lines.`
      : `this ${clue} has room for one more line, so neither can be one.`;
    return `${capitalized(pairsMake(pairs))} these two edges match, and ${room}`;
  },

  /** A clue needing `needed` more from its three open edges, two of which the pairs
   * relate. */
  parityFace: (
    clue: number,
    needed: number,
    pairs: number,
    opposite: boolean,
    line: boolean,
  ): string =>
    `This ${clue} needs ${needed} more; ${pairsMake(pairs)} two of its open edges give ${opposite ? "exactly 1" : "0 or 2"}, so this edge ${verdict(line)}.`,

  /** A dot with three open edges, two of which the pairs relate. That a dot takes 0
   * or 2 lines is the game's rule, taught by the help rather than repeated here. */
  parityDot: (
    dotLines: number,
    pairs: number,
    opposite: boolean,
    line: boolean,
  ): string =>
    `The ringed dot has ${dotLines === 1 ? "one line" : "no line"}; ${pairsMake(pairs)} two of its open edges give ${opposite ? "exactly 1" : "0 or 2"}, so this edge ${verdict(line)}.`,

  related: (
    pairs: number,
    opposite: boolean,
    fromLine: boolean,
    line: boolean,
  ): string =>
    `${capitalized(pairsMake(pairs))} this edge ${opposite ? "the opposite of" : "match"} the marked ${fromLine ? "line" : "ruled-out edge"}, so it ${verdict(line)}.`,
};
