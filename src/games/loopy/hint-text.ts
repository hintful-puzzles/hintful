/**
 * Every sentence Loopy's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values ([`hint.ts`](./hint.ts)'s
 * `planSteps`); this file decides only how it reads. Each sentence runs indication,
 * reasoning, conclusion, with the conclusion in the necessity voice
 * (docs/games/hints.md § "Writing the narration"). A clue is "this 3" because the
 * hint outlines its face, a dot is "the ringed dot", and an edge the move sets is
 * "this edge", the one drawn with the hint's band. An edge the loop cannot use
 * "can't be a line", as a Palisade edge "can't be a wall".
 *
 * **Notes are named by what they look like.** A step placing a note calls it "this
 * corner" or "these two edges", drawn in the hint's action color; a note the step
 * reasons from is "the marked corner" or "the marked pair", the player's own note
 * redrawn in the evidence color. A corner *needs a line* (at least one), *can take
 * one line at most*, or *takes exactly one line*; a pair's edges *match* (both lines
 * or neither) or are *opposites* (exactly one is a line), which the help teaches
 * once rather than every step repeating (docs/games/hints.md § "Rules belong in the
 * help").
 */

/** What a corner is known to carry. */
export type CornerBound = "atLeastOne" | "atMostOne" | "exactlyOne";

/** How a corner step ends: the corner against the lines already at its dot. */
export type CornerThen = "otherLine" | "bothLines" | "otherEmpty" | "neither" | "exit";

const verdict = (line: boolean): string =>
  line ? "must be a line" : "can't be a line";

/** "all 3" for a clue's whole count, and "its line" for a 1's. */
const allOf = (clue: number): string => (clue === 1 ? "its line" : `all ${clue}`);

const takes = (bound: CornerBound): string => {
  switch (bound) {
    case "atLeastOne":
      return "needs a line";
    case "atMostOne":
      return "can take one line at most";
    case "exactlyOne":
      return "takes exactly one line";
  }
};

/** What two related edges give a count between them. */
const gives = (opposite: boolean): string => (opposite ? "exactly 1" : "0 or 2");

const pairVerdict = (opposite: boolean): string =>
  opposite ? "must be opposites" : "must match";

/** The corner notes a count leans on, each counting one line between its edges. */
const counting = (corners: number): string => {
  if (corners === 0) return "";
  return corners === 1
    ? ", counting the marked corner as one"
    : ", counting each marked corner as one";
};

const dotHas = (lines: number): string => (lines === 1 ? "one line" : "no line");

const CORNER_THEN: Record<CornerThen, string> = {
  otherLine: "; one edge there is ruled out, so the other must be a line.",
  bothLines: "; the ringed dot takes both or neither, so both must be lines.",
  otherEmpty: "; one edge there is already a line, so this edge can't be one.",
  neither: "; the ringed dot takes both or neither, so neither can be a line.",
  exit: "; the ringed dot has no line yet, so this edge must be its second.",
};

export const say = {
  // --- steps that set lines ---------------------------------------------------

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

  /** The owner's shape, 2026-09-19, with the premise that makes it follow: the
   * dots' existing lines are *why* joining them leaves the clue short, since
   * each would then be full and rule out the clue's edge on its far side.
   *
   * Names the excluded edge by what it would join, never by direction, because
   * most of Loopy's tilings have no top; says "already have a line" rather than
   * "incoming", because the player sees lines and not a direction of travel;
   * and gives both halves of the conclusion, because settling the whole face is
   * the step's point. It uses no picture of the loop's path: "the long way
   * around" fits a 3 in a square, and not a 2 whose fourth edge is already out.
   *
   * The clue appears twice and is right both times: the face ends with exactly
   * the clue's count of lines, whether or not some edge was already ruled out. */
  clueBlockedPair: (clue: number): string =>
    `Both ringed dots already have a line, so joining them leaves this ${clue} short. That edge is out; the other ${clue} are lines.`,

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

  /** A clue's other edges can give it one line fewer than it needs. */
  boundLine: (clue: number, corners: number): string =>
    `This ${clue}'s other edges can give it only ${clue - 1}${counting(corners)}, so this edge must be a line.`,

  /** A clue's other edges already give it every line it needs. */
  boundEmpty: (clue: number, corners: number): string =>
    `This ${clue} already has ${allOf(clue)}${counting(corners)}, so this edge can't be a line.`,

  corner: (bound: CornerBound, then: CornerThen): string =>
    `The marked corner ${takes(bound)}${CORNER_THEN[then]}`,

  /** Two edges of a clue that match, with room for one more line (`line` false:
   * neither can be one) or one more empty edge (`line` true: both must be lines). */
  matchingPair: (clue: number, line: boolean): string => {
    const room = line
      ? `this ${clue} can spare one more edge, so both must be lines.`
      : `this ${clue} has room for one more line, so neither can be one.`;
    return `The marked pair makes these two edges match, and ${room}`;
  },

  /** A clue needing `needed` more from its three open edges, two of which the pair
   * relates. */
  parityFace: (
    clue: number,
    needed: number,
    opposite: boolean,
    line: boolean,
  ): string =>
    `This ${clue} needs ${needed} more; the marked pair makes two of its open edges give ${gives(opposite)}, so this edge ${verdict(line)}.`,

  /** A dot with three open edges, two of which the pair relates. That a dot takes 0
   * or 2 lines is the game's rule, taught by the help rather than repeated here. */
  parityDot: (dotLines: number, opposite: boolean, line: boolean): string =>
    `The ringed dot has ${dotHas(dotLines)}; the marked pair makes two of its open edges give ${gives(opposite)}, so this edge ${verdict(line)}.`,

  related: (opposite: boolean, fromLine: boolean, line: boolean): string =>
    `The marked pair makes this edge ${opposite ? "the opposite of" : "match"} the marked ${fromLine ? "line" : "ruled-out edge"}, so it ${verdict(line)}.`,

  // --- steps that place a corner note -----------------------------------------

  /** A corner read off its dot's own line: the dot has a line elsewhere (at most
   * one here), and these two edges are its only ways on (at least one). */
  cornerAtDot: (bound: CornerBound): string =>
    bound === "atMostOne"
      ? "The ringed dot already has a line, so this corner can take one line at most."
      : `The line at the ringed dot can only go on through this corner, so it ${takes(bound)}.`,

  /** A corner read off a clue's count of its other edges. */
  cornerFromClue: (
    clue: number,
    total: number,
    corners: number,
    bound: "atLeastOne" | "atMostOne",
  ): string => {
    if (bound === "atLeastOne") {
      return total === 0 && corners === 0
        ? `This ${clue}'s other edges are ruled out, so this corner needs a line.`
        : `This ${clue}'s other edges can give it ${total} at most${counting(corners)}, so this corner needs a line.`;
    }
    // Any corner of a 1 takes one line at most, whatever its other edges hold.
    return clue === 1 && corners === 0
      ? "This 1 takes one line, so this corner can take one at most."
      : `This ${clue}'s other edges already give it ${total}${counting(corners)}, so this corner can take one line at most.`;
  },

  cornerAcross:
    "The marked corner across the ringed dot needs a line, so this corner can take one line at most.",

  cornerOppositeExit:
    "The marked corner takes exactly one of the ringed dot's two lines, so this corner needs the other.",

  cornerFromPair: (bound: CornerBound): string =>
    `The marked pair makes this corner's edges opposites, so it ${takes(bound)}.`,

  // --- steps that place a pair note -------------------------------------------

  /** A clue with only these two edges open, needing `needed` more. */
  pairAtClue: (clue: number, needed: number, opposite: boolean): string =>
    `Only these two of this ${clue}'s edges are still open, and it needs ${needed} more, so they ${pairVerdict(opposite)}.`,

  pairAtDot: (dotLines: number, opposite: boolean): string =>
    `Only these two of the ringed dot's edges are still open, and it has ${dotHas(dotLines)}, so they ${pairVerdict(opposite)}.`,

  pairAtCorner:
    "The marked corner takes exactly one line, so these two edges must be opposites.",

  /** A clue with four open edges, two of which the marked pair relates. */
  pairAcrossClue: (
    clue: number,
    needed: number,
    pairOpposite: boolean,
    opposite: boolean,
  ): string =>
    `This ${clue} needs ${needed} more from four open edges, and the marked pair gives ${gives(pairOpposite)}, so these two ${pairVerdict(opposite)}.`,

  pairAcrossDot: (dotLines: number, pairOpposite: boolean, opposite: boolean): string =>
    `The ringed dot has ${dotHas(dotLines)} and four open edges; the marked pair gives ${gives(pairOpposite)}, so these two ${pairVerdict(opposite)}.`,

  /** Two pairs sharing an edge relate their other two edges. `first` and `second`
   * say whether each pair is opposites. */
  pairChain: (first: boolean, second: boolean): string => {
    if (first !== second) {
      return "One of these edges matches the edge the marked pairs share and the other is its opposite, so they must be opposites.";
    }
    return first
      ? "These two edges are each the opposite of the edge the marked pairs share, so they must match."
      : "These two edges each match the edge the marked pairs share, so they must match.";
  },
};
