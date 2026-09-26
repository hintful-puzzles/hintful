/**
 * Every sentence Pearl's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values ([`hint.ts`](./hint.ts)'s
 * `narrate`); this file decides only how it reads. Each sentence runs
 * indication, reasoning, conclusion, with the conclusion in the necessity voice
 * (docs/games/hints.md § "Writing the narration").
 *
 * The words are the help page's: the loop runs along the **edges** between
 * squares, and an edge the step decides is "this edge", drawn in the hint's
 * color as the line or cross it asks for. Squares the step reasons from are
 * outlined, so "the outlined square" and "the outlined line" point at them. That
 * a black pearl's line goes straight on through the squares either side of it,
 * and that a white pearl's turns in a square beside it, is the game's rule and
 * sits in the help (docs/games/hints.md § "Rules belong in the help").
 */

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

export const say = {
  // --- a square read off its own edges --------------------------------------

  /** `edges` is how many edges the step rules out. */
  squareFull: (edges: number): string =>
    `This square already has its two lines, so ${edges === 1 ? "this edge can't be a line" : "its other edges can't be lines"}.`,

  lineGoesOn:
    "The line in this square has no other way to go on, so this edge must be a line.",

  deadEnd:
    "This square has no line and no other open edge, so a line here would dead-end: this edge can't be a line.",

  /** One axis of a black pearl, whose opposite edge is a line (`line`), ruled
   * out, or the board's edge. */
  blackOpposite: (opposite: "line" | "ruledOut" | "boardEdge"): string => {
    if (opposite === "line")
      return "This black pearl must turn, and the opposite edge is a line, so this edge can't be one.";
    const which =
      opposite === "boardEdge"
        ? "the board's edge is opposite"
        : "the opposite edge is ruled out";
    return `This black pearl must turn, and ${which}, so this edge must be a line.`;
  },

  whiteCarriesOn:
    "A white pearl's line runs straight through it, so the line here must leave by the opposite edge.",

  /** A white pearl with an edge ruled out along one axis, so it runs `along`. */
  whiteBlocked: (along: Axis, boardEdge: boolean): string =>
    boardEdge
      ? "This white pearl sits on the board's edge, so its line must run along it."
      : `A white pearl's line runs straight through it, and one edge is ruled out, so it must run ${runs(along)}.`,

  // --- the pearls' longer reach ---------------------------------------------

  blackRunsOn:
    "A black pearl's line runs straight through the next square, so this line must carry on out of its far side.",

  /** The square past a black pearl cannot carry its line straight on, so the
   * pearl's edge toward it is out. */
  blackCannotRunOn: (why: NoStraight): string =>
    `The outlined square ${NO_STRAIGHT[why]}, so this black pearl's line can't run straight through it.`,

  /** Neither neighbor along `blocked` can turn into the pearl. */
  whiteCannotTurn: (blocked: Axis, along: Axis): string =>
    `Neither outlined square ${beside(blocked)} can turn into this white pearl, so its line must run ${runs(along)}.`,

  /** The step decides the edge that makes the square on the other side turn:
   * its straight-on edge ruled out, or its one way to turn drawn. */
  whiteTurnsOpposite:
    "This white pearl's line goes straight through the outlined square, so it must turn in the square on its other side.",

  // --- loops that would close too soon --------------------------------------

  closesEarly: (out: LeftOut): string =>
    `Joining the ends of the outlined line here would close a loop that misses ${misses(out)}, so this edge can't be a line.`,

  /** A plain square whose one way through joins the ends of one line. It has
   * no other: that is why the rung's conclusion is the whole square. */
  closesEarlyThrough: (out: LeftOut): string =>
    `Any line through this square would close the outlined line into a loop that misses ${misses(out)}, so it must stay empty.`,

  /** A white pearl that would join the ends running `blocked`, so runs `along`. */
  closesEarlyWhite: (blocked: Axis, along: Axis, out: LeftOut): string =>
    `${blocked === "across" ? "Across" : "Up and down"}, this white pearl would close the outlined line into a loop that misses ${misses(out)}, so it must run ${runs(along)}.`,
};
