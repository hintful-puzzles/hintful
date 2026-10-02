/**
 * Every sentence Pearl's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values ([`hint.ts`](./hint.ts)'s
 * `narrate`); this file decides only how it reads. Each sentence runs
 * indication, reasoning, conclusion, with the conclusion in the necessity voice
 * (docs/games/hints.md § "Writing the narration").
 *
 * The words are the help page's: the loop runs along the **edges** between
 * squares. Every word that points at the board is a reference to the mark it
 * points at (`engine/hint-words.ts`): an edge the step decides is the ring,
 * drawn in the hint's color as the line or cross it asks for, and named "this
 * edge", or by the pearl or square whose edges they are; the squares the step
 * reasons from are outlined, so "the outlined square" and "the outlined line"
 * point at them. That a black pearl's line goes straight on through the squares
 * either side of it, and that a white pearl's turns in a square beside it, is
 * the game's rule and sits in the help (docs/games/hints.md § "Rules belong in
 * the help").
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";

/** An edge, by the square it leaves rightward or downward. */
export interface Edge {
  readonly sq: number;
  readonly dir: number;
}

export const EDGE: MarkKind<Edge> = { name: "edge", key: (e) => `${e.sq}:${e.dir}` };

/** A square, by its index. */
export const SQUARE: MarkKind<number> = { name: "square", key: String };

/** What a step marks: the edges its own deduction decides, the lines a black
 * or a white pearl carries on from them, and the squares it reasons from. */
export interface Marked {
  own: readonly Edge[];
  black: readonly Edge[];
  white: readonly Edge[];
  area: readonly number[];
}

/** Which way a line runs through a square. */
export type Axis = "across" | "upDown";

/** Why the square past a black pearl cannot carry its line straight on. */
export type NoStraight = "blackPearl" | "sideLine" | "farEdge" | "boardEdge";

/** What an early loop would leave out: a pearl, or only lines. */
export type LeftOut = "pearl" | "lines";

const runs = (axis: Axis): string => (axis === "across" ? "across" : "up and down");

const beside = (axis: Axis): string =>
  axis === "across" ? "to its left or right" : "above or below it";

const misses = (out: LeftOut): string => (out === "pearl" ? "a pearl" : "other lines");

/** What stops the square past a black pearl running straight on, said of
 * "the outlined square". */
const NO_STRAIGHT: Record<NoStraight, string> = {
  blackPearl: "holds a black pearl, which must turn",
  sideLine: "has a line off to the side",
  farEdge: "has its far edge ruled out",
  boardEdge: "is at the board's edge",
};

/** The step's own edges, in the words given. */
const own = (m: Marked, words: string): Narration =>
  mark.as("ring", EDGE, m.own, words);
const thisEdge = (m: Marked): Narration => mark.this("ring", EDGE, m.own, "edge");
/** The square the step reads, in the words given ("this black pearl"). */
const area = (m: Marked, words: string): Narration =>
  mark.as("outline", SQUARE, m.area, words);

/** A step that also draws the line on through the white pearl (`several`:
 * pearls) it runs into says so after its own move, whichever deduction it is
 * (the owner's 2026-09-27 request): the run-on is part of the step's move. */
const throughNextWhite = (m: Marked): Narration =>
  phrase`It runs straight on ${mark.as("ring", EDGE, m.white, `through the next white ${m.white.length > 1 ? "pearls" : "pearl"}`)} too`;

/** The look forces the move, and with it any run-on through a white pearl. */
const forced = (
  m: Marked,
  look: Narration,
  move: Narration,
  follows?: Narration,
): Sentence =>
  so({
    look,
    follows,
    move: m.white.length > 0 ? phrase`${move}. ${throughNextWhite(m)}` : move,
  });

export const say = {
  // --- a square read off its own edges --------------------------------------

  squareFull: (m: Marked): Sentence =>
    forced(
      m,
      phrase`${area(m, "This square")} already has its two lines`,
      m.own.length === 1
        ? phrase`${thisEdge(m)} can't be a line`
        : phrase`${own(m, "its other edges")} can't be lines`,
    ),

  lineGoesOn: (m: Marked): Sentence =>
    forced(
      m,
      phrase`The line in ${area(m, "this square")} has no other way to go on`,
      phrase`${thisEdge(m)} must be a line`,
    ),

  deadEnd: (m: Marked): Sentence =>
    forced(
      m,
      phrase`${area(m, "This square")} has no line and no other open edge`,
      phrase`${thisEdge(m)} can't be a line`,
      phrase`a line here would dead-end`,
    ),

  /** One axis of a black pearl, whose opposite edge is a line (`line`), ruled
   * out, or the board's edge; `runsOn` when the step also draws that line on
   * through the next square. */
  blackOpposite: (
    opposite: "line" | "ruledOut" | "boardEdge",
    m: Marked,
    runsOn = false,
  ): Sentence => {
    const pearl = area(m, "This black pearl");
    if (opposite === "line")
      return forced(
        m,
        phrase`${pearl} must turn, and the opposite edge is a line`,
        phrase`${thisEdge(m)} can't be one`,
      );
    const which =
      opposite === "boardEdge"
        ? "the board's edge is opposite"
        : "the opposite edge is ruled out";
    return forced(
      m,
      phrase`${pearl} must turn, and ${which}`,
      runsOn
        ? phrase`its line must run ${mark.as("ring", EDGE, [...m.own, ...m.black], "this way through the next square")}`
        : phrase`${thisEdge(m)} must be a line`,
    );
  },

  whiteCarriesOn: (m: Marked): Sentence =>
    forced(
      m,
      phrase`${area(m, "This white pearl")}'s line runs straight through it`,
      phrase`it must leave by ${own(m, "the opposite edge")}`,
    ),

  /** A white pearl with an edge ruled out along one axis, so it runs `along`. */
  whiteBlocked: (along: Axis, boardEdge: boolean, m: Marked): Sentence =>
    boardEdge
      ? forced(
          m,
          phrase`${area(m, "This white pearl")} sits on the board's edge`,
          phrase`${own(m, "its line")} must run along it`,
        )
      : forced(
          m,
          phrase`${area(m, "This white pearl")} has one edge ruled out, and its line runs straight through`,
          phrase`${own(m, "the line")} must run ${runs(along)}`,
        ),

  // --- the pearls' longer reach ---------------------------------------------

  blackRunsOn: (m: Marked): Sentence =>
    forced(
      m,
      phrase`${area(m, "The outlined black pearl")}'s line runs straight through the next square`,
      phrase`${own(m, "this line")} must carry on out of its far side`,
    ),

  /** The square past a black pearl cannot carry its line straight on, so the
   * pearl's edge toward it is out. */
  blackCannotRunOn: (why: NoStraight, m: Marked): Sentence =>
    forced(
      m,
      phrase`${area(m, "The outlined square")} ${NO_STRAIGHT[why]}`,
      phrase`${own(m, "this black pearl's line")} can't run straight through it`,
    ),

  /** Neither neighbor along `blocked` can turn into the pearl, whose edges
   * the step decides. */
  whiteCannotTurn: (blocked: Axis, along: Axis, m: Marked): Sentence =>
    forced(
      m,
      phrase`Neither ${area(m, `outlined square ${beside(blocked)}`)} can turn into ${own(m, "this white pearl")}`,
      phrase`its line must run ${runs(along)}`,
    ),

  /** The step decides the edge that makes the square on the other side turn:
   * its straight-on edge ruled out (`line` false), or its one way to turn
   * drawn. */
  whiteTurnsOpposite: (line: boolean, m: Marked): Sentence =>
    forced(
      m,
      phrase`The white pearl runs straight through ${area(m, "the outlined square")}`,
      phrase`${thisEdge(m)} ${line ? "must be a line" : "can't be a line"}`,
      phrase`it turns on its other side`,
    ),

  // --- loops that would close too soon --------------------------------------

  closesEarly: (out: LeftOut, m: Marked): Sentence =>
    forced(
      m,
      phrase`Joining the ends of ${area(m, "the outlined line")} here would close a loop that misses ${misses(out)}`,
      phrase`${thisEdge(m)} can't be a line`,
    ),

  /** A plain square whose one way through joins the ends of one line. It has
   * no other: that is why the rung's conclusion is the whole square, whose
   * edges are the ring. */
  closesEarlyThrough: (out: LeftOut, m: Marked): Sentence =>
    forced(
      m,
      phrase`Any line through ${own(m, "this square")} would close ${area(m, "the outlined line")} into a loop that misses ${misses(out)}`,
      phrase`it must stay empty`,
    ),

  /** A white pearl that would join the ends running `blocked`, so runs
   * `along`; the step decides its edges. */
  closesEarlyWhite: (blocked: Axis, along: Axis, out: LeftOut, m: Marked): Sentence =>
    forced(
      m,
      phrase`${blocked === "across" ? "Across" : "Up and down"}, ${own(m, "this white pearl")} would close ${area(m, "the outlined line")} into a loop that misses ${misses(out)}`,
      phrase`it must run ${runs(along)}`,
    ),
};
