/**
 * Every sentence Loopy's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values ([`hint.ts`](./hint.ts)'s
 * `planSteps`); this file decides only how it reads. Each sentence runs indication,
 * reasoning, conclusion, with the conclusion in the necessity voice
 * (docs/games/hints.md § "Writing the narration"). An edge the loop cannot use
 * "can't be a line", as a Palisade edge "can't be a wall".
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`). **What the step decides is the ring**: an edge it sets
 * is "this edge", drawn with the hint's band, and a note it places is "this corner"
 * or "these two edges", drawn in the action color. **What it reasons from is
 * outlined**: a clue is "this 3", its face outlined; a dot is "the outlined dot";
 * a line it cites is "the marked line"; a note it cites is "the marked corner" or
 * "the marked pair", the player's own note redrawn in the evidence color.
 *
 * **Notes are named by what they look like.** A corner *needs a line* (at least
 * one), *can take one line at most*, or *takes exactly one line*; a pair's edges
 * *match* (both lines or neither) or are *opposites* (exactly one is a line), which
 * the help teaches once rather than every step repeating (docs/games/hints.md
 * § "Rules belong in the help").
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { LoopyPair } from "./state.ts";

/** An edge, a clue's face, a dot or a corner (a dline), each by its grid index. */
export const EDGE: MarkKind<number> = { name: "edge", key: String };
export const FACE: MarkKind<number> = { name: "clue", key: String };
export const DOT: MarkKind<number> = { name: "dot", key: String };
export const CORNER: MarkKind<number> = { name: "corner", key: String };

/** A pair note, the same whichever edge it is named from. */
export const PAIR: MarkKind<LoopyPair> = {
  name: "pair",
  key: (p) => (p.a < p.b ? `${p.a}:${p.b}` : `${p.b}:${p.a}`),
};

/** What a step marks: what it decides (the edges it sets, or the note it places)
 * and what it reasons from. */
export interface Marked {
  readonly targets: readonly number[];
  readonly placedCorner: number | null;
  readonly placedPair: LoopyPair | null;
  readonly faces: readonly number[];
  readonly dots: readonly number[];
  readonly edges: readonly number[];
  readonly corners: readonly number[];
  readonly pairs: readonly LoopyPair[];
}

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

const dotHas = (lines: number): string => (lines === 1 ? "one line" : "no line");

// --- the references --------------------------------------------------------

/** The clue the sentence is about: "this 3", its face outlined. */
const thisClue = (m: Marked, clue: number, tail = ""): Narration =>
  mark.as("outline", FACE, m.faces, `this ${clue}${tail}`);

/** The dot(s) the sentence names. */
const dot = (m: Marked, words = "the outlined dot"): Narration =>
  mark.as("outline", DOT, m.dots, words);

/** The edges the step sets, in words that may follow how many are left. */
const setting = (
  m: Marked,
  words: string | ((n: number) => string) = (n) =>
    n === 1 ? "this edge" : "these edges",
): Narration =>
  mark.as("ring", EDGE, m.targets, (els) =>
    typeof words === "string" ? words : words(els.length),
  );

const thisEdge = (m: Marked): Narration => setting(m);

/** The note the step places. */
const thisCorner = (m: Marked): Narration =>
  mark.as(
    "ring",
    CORNER,
    m.placedCorner === null ? [] : [m.placedCorner],
    "this corner",
  );
const placedPair = (m: Marked, words: string): Narration =>
  mark.as("ring", PAIR, m.placedPair === null ? [] : [m.placedPair], words);

const citedPair = (m: Marked, words = "the marked pair"): Narration =>
  mark.as("outline", PAIR, m.pairs, words);
const citedCorner = (m: Marked, words = "the marked corner"): Narration =>
  mark.as("outline", CORNER, m.corners, words);
const citedLine = (m: Marked, words: string): Narration =>
  mark.as("outline", EDGE, m.edges, words);

/** The corner notes a count leans on, each counting one line between its edges. */
const counting = (m: Marked): Narration => {
  const n = m.corners.length;
  if (n === 0) return phrase``;
  return n === 1
    ? phrase`, counting ${citedCorner(m)} as one`
    : phrase`, counting ${citedCorner(m, "each marked corner")} as one`;
};

/** "this edge can't be a line" or "its other edges can't be lines", as many as
 * are left. */
const ruledOut = (m: Marked): Narration =>
  setting(m, (n) =>
    n === 1 ? "this edge can't be a line" : "its other edges can't be lines",
  );

/** How a corner step ends: what the corner meets at its dot, and the move. */
const cornerThen = (
  m: Marked,
  then: CornerThen,
): { readonly why: Narration; readonly move: Narration } => {
  switch (then) {
    case "otherLine":
      return {
        why: phrase`one edge there is ruled out`,
        move: phrase`${setting(m, "the other")} must be a line`,
      };
    case "bothLines":
      return {
        why: phrase`${dot(m)} takes both or neither`,
        move: phrase`${setting(m, "both")} must be lines`,
      };
    case "otherEmpty":
      return {
        why: phrase`one edge there is already a line`,
        move: phrase`${thisEdge(m)} can't be one`,
      };
    case "neither":
      return {
        why: phrase`${dot(m)} takes both or neither`,
        move: phrase`${setting(m, "neither")} can be a line`,
      };
    case "exit":
      return {
        why: phrase`${dot(m)} has no line yet`,
        move: phrase`${thisEdge(m)} must be its second`,
      };
  }
};

export const say = {
  // --- steps that set lines ---------------------------------------------------

  /** A clue with all its lines. */
  clueFull: (clue: number, m: Marked): Sentence => {
    if (clue === 0) {
      return so({
        look: phrase`${thisClue(m, 0)} takes no lines`,
        move: setting(m, (n) =>
          n === 1 ? "this edge can't be a line" : "its edges can't be lines",
        ),
      });
    }
    const has = clue === 1 ? "its line" : `all ${clue} of its lines`;
    return so({
      look: phrase`${thisClue(m, clue)} already has ${has}`,
      move: ruledOut(m),
    });
  },

  /** A clue with only as many edges left as it needs. */
  clueStarved: (clue: number, m: Marked): Sentence => {
    if (clue === 1)
      return so({
        look: phrase`Only one of ${thisClue(m, 1, "'s")} edges isn't ruled out`,
        move: phrase`${setting(m, "it")} must be a line`,
      });
    return so({
      look: phrase`Only ${clue} of ${thisClue(m, clue, "'s")} edges aren't ruled out`,
      move: setting(m, (n) =>
        n === 1 ? "this last one must be a line too" : "all of them must be lines",
      ),
    });
  },

  // Two premises: the clue can spare one open edge, and the outlined dot already
  // spends it, because the dot's existing line means the two edges there cannot
  // both be lines.
  clueOneShort: (clue: number, m: Marked): Sentence =>
    so({
      look: phrase`${thisClue(m, clue)} can spare one open edge and must spare it at ${dot(m)}, which has a line`,
      move: phrase`${setting(m, "the rest")} must be lines`,
    }),

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
  clueBlockedPair: (clue: number, m: Marked): Sentence =>
    so({
      look: phrase`${dot(m, "Both outlined dots")} already have a line`,
      follows: phrase`joining them leaves ${thisClue(m, clue)} short`,
      move: setting(m, `that edge is out and the other ${clue} are lines`),
    }),

  deadEnd: (m: Marked): Sentence =>
    so({
      look: phrase`${dot(m, "The outlined dot")} has no line and no other open edge`,
      follows: phrase`a line here would dead-end`,
      move: phrase`${thisEdge(m)} can't be a line`,
    }),

  lineContinues: (m: Marked): Sentence =>
    so({
      look: phrase`The line at ${dot(m)} has no other way to go on`,
      move: phrase`${thisEdge(m)} must be a line`,
    }),

  dotFull: (m: Marked): Sentence =>
    so({
      look: phrase`${dot(m, "The outlined dot")} already has its two lines`,
      move: ruledOut(m),
    }),

  /** The edge would close the marked lines too early: some drawn line would be left
   * out of the loop, or the outlined clues would stay unmet. */
  earlyLoop: (because: "strayLines" | "unmetClues", m: Marked): Sentence => {
    const edge = thisEdge(m);
    const lines = citedLine(m, "the marked lines");
    const move = phrase`it can't be a line`;
    if (because === "strayLines") {
      return so({
        look: phrase`${edge} would close ${lines} into a loop that leaves other lines out`,
        move,
      });
    }
    const clues = mark.as("outline", FACE, m.faces, (els) =>
      els.length === 1 ? "the outlined clue" : "the outlined clues",
    );
    return so({
      look: phrase`${edge} would close ${lines} into a loop with ${clues} still unmet`,
      move,
    });
  },

  closesLoop: (m: Marked): Sentence =>
    so({
      look: phrase`${thisEdge(m)} closes ${citedLine(m, "the marked lines")} into one loop that meets every clue`,
      move: phrase`it must be a line`,
    }),

  /** A clue's other edges can give it one line fewer than it needs. */
  boundLine: (clue: number, m: Marked): Sentence =>
    so({
      look: phrase`${thisClue(m, clue, "'s")} other edges can give it only ${clue - 1}${counting(m)}`,
      move: phrase`${thisEdge(m)} must be a line`,
    }),

  /** A clue's other edges already give it every line it needs. */
  boundEmpty: (clue: number, m: Marked): Sentence =>
    so({
      look: phrase`${thisClue(m, clue)} already has ${allOf(clue)}${counting(m)}`,
      move: phrase`${thisEdge(m)} can't be a line`,
    }),

  corner: (bound: CornerBound, then: CornerThen, m: Marked): Sentence => {
    const { why, move } = cornerThen(m, then);
    return so({
      look: phrase`${citedCorner(m, "The marked corner")} ${takes(bound)}; ${why}`,
      move,
    });
  },

  /** Two edges of a clue that match, with room for one more line (`line` false:
   * neither can be one) or one more empty edge (`line` true: both must be lines). */
  matchingPair: (clue: number, line: boolean, m: Marked): Sentence => {
    const room = line
      ? phrase`${thisClue(m, clue)} can spare one more edge`
      : phrase`${thisClue(m, clue)} has room for one more line`;
    return so({
      look: phrase`${citedPair(m, "The marked pair")} makes ${setting(m, "these two edges")} match, and ${room}`,
      move: phrase`${line ? "both must be lines" : "neither can be one"}`,
    });
  },

  /** A clue needing `needed` more from its three open edges, two of which the pair
   * relates. */
  parityFace: (
    clue: number,
    needed: number,
    opposite: boolean,
    line: boolean,
    m: Marked,
  ): Sentence =>
    so({
      look: phrase`${thisClue(m, clue)} needs ${needed} more; ${citedPair(m)} makes two of its open edges give ${gives(opposite)}`,
      move: phrase`${thisEdge(m)} ${verdict(line)}`,
    }),

  /** A dot with three open edges, two of which the pair relates. That a dot takes 0
   * or 2 lines is the game's rule, taught by the help rather than repeated here. */
  parityDot: (
    dotLines: number,
    opposite: boolean,
    line: boolean,
    m: Marked,
  ): Sentence =>
    so({
      look: phrase`${dot(m, "The outlined dot")} has ${dotHas(dotLines)}; ${citedPair(m)} makes two of its open edges give ${gives(opposite)}`,
      move: phrase`${thisEdge(m)} ${verdict(line)}`,
    }),

  related: (opposite: boolean, fromLine: boolean, line: boolean, m: Marked): Sentence =>
    so({
      look: phrase`${citedPair(m, "The marked pair")} makes ${thisEdge(m)} ${opposite ? "the opposite of" : "match"} ${citedLine(m, `the marked ${fromLine ? "line" : "ruled-out edge"}`)}`,
      move: phrase`it ${verdict(line)}`,
    }),

  // --- steps that place a corner note -----------------------------------------

  /** A corner read off its dot's own line: the dot has a line elsewhere (at most
   * one here), and these two edges are its only ways on (at least one). */
  cornerAtDot: (bound: CornerBound, m: Marked): Sentence =>
    bound === "atMostOne"
      ? so({
          look: phrase`${dot(m, "The outlined dot")} already has a line`,
          move: phrase`${thisCorner(m)} can take one line at most`,
        })
      : so({
          look: phrase`The line at ${dot(m)} can only go on through ${thisCorner(m)}`,
          move: phrase`it ${takes(bound)}`,
        }),

  /** A corner read off a clue's count of its other edges. */
  cornerFromClue: (
    clue: number,
    total: number,
    bound: "atLeastOne" | "atMostOne",
    m: Marked,
  ): Sentence => {
    if (bound === "atLeastOne") {
      return so({
        look:
          total === 0 && m.corners.length === 0
            ? phrase`${thisClue(m, clue, "'s")} other edges are ruled out`
            : phrase`${thisClue(m, clue, "'s")} other edges can give it ${total} at most${counting(m)}`,
        move: phrase`${thisCorner(m)} needs a line`,
      });
    }
    // Any corner of a 1 takes one line at most, whatever its other edges hold.
    return clue === 1 && m.corners.length === 0
      ? so({
          look: phrase`${thisClue(m, 1)} takes one line`,
          move: phrase`${thisCorner(m)} can take one at most`,
        })
      : so({
          look: phrase`${thisClue(m, clue, "'s")} other edges already give it ${total}${counting(m)}`,
          move: phrase`${thisCorner(m)} can take one line at most`,
        });
  },

  cornerAcross: (m: Marked): Sentence =>
    so({
      look: phrase`${citedCorner(m, "The marked corner")} across ${dot(m)} needs a line`,
      move: phrase`${thisCorner(m)} can take one line at most`,
    }),

  cornerOppositeExit: (m: Marked): Sentence =>
    so({
      look: phrase`${citedCorner(m, "The marked corner")} takes exactly one of ${dot(m, "the outlined dot's")} two lines`,
      move: phrase`${thisCorner(m)} needs the other`,
    }),

  cornerFromPair: (bound: CornerBound, m: Marked): Sentence =>
    so({
      look: phrase`${citedPair(m, "The marked pair")} makes ${mark.as("ring", CORNER, m.placedCorner === null ? [] : [m.placedCorner], "this corner's")} edges opposites`,
      move: phrase`it ${takes(bound)}`,
    }),

  // --- steps that place a pair note -------------------------------------------

  /** A clue with only these two edges open, needing `needed` more. */
  pairAtClue: (clue: number, needed: number, opposite: boolean, m: Marked): Sentence =>
    so({
      look: phrase`Only ${placedPair(m, "these two")} of ${thisClue(m, clue, "'s")} edges are still open, and it needs ${needed} more`,
      move: phrase`they ${pairVerdict(opposite)}`,
    }),

  pairAtDot: (dotLines: number, opposite: boolean, m: Marked): Sentence =>
    so({
      look: phrase`Only ${placedPair(m, "these two")} of ${dot(m, "the outlined dot's")} edges are still open, and it has ${dotHas(dotLines)}`,
      move: phrase`they ${pairVerdict(opposite)}`,
    }),

  pairAtCorner: (m: Marked): Sentence =>
    so({
      look: phrase`${citedCorner(m, "The marked corner")} takes exactly one line`,
      move: phrase`${placedPair(m, "these two edges")} must be opposites`,
    }),

  /** A clue with four open edges, two of which the marked pair relates. */
  pairAcrossClue: (
    clue: number,
    needed: number,
    pairOpposite: boolean,
    opposite: boolean,
    m: Marked,
  ): Sentence =>
    so({
      look: phrase`${thisClue(m, clue)} needs ${needed} more from four open edges, and ${citedPair(m)} gives ${gives(pairOpposite)}`,
      move: phrase`${placedPair(m, "these two")} ${pairVerdict(opposite)}`,
    }),

  pairAcrossDot: (
    dotLines: number,
    pairOpposite: boolean,
    opposite: boolean,
    m: Marked,
  ): Sentence =>
    so({
      look: phrase`${dot(m, "The outlined dot")} has ${dotHas(dotLines)} and four open edges; ${citedPair(m)} gives ${gives(pairOpposite)}`,
      move: phrase`${placedPair(m, "these two")} ${pairVerdict(opposite)}`,
    }),

  /** Two pairs sharing an edge relate their other two edges. `first` and `second`
   * say whether each pair is opposites. */
  pairChain: (first: boolean, second: boolean, m: Marked): Sentence => {
    const shared = phrase`${citedLine(m, "the edge")} ${citedPair(m, "the marked pairs")} share`;
    if (first !== second) {
      return so({
        look: phrase`One of ${placedPair(m, "these edges")} matches ${shared} and the other is its opposite`,
        move: phrase`they must be opposites`,
      });
    }
    return so({
      look: first
        ? phrase`${placedPair(m, "These two edges")} are each the opposite of ${shared}`
        : phrase`${placedPair(m, "These two edges")} each match ${shared}`,
      move: phrase`they must match`,
    });
  },
};
