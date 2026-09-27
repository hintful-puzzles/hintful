/**
 * Every sentence Ascent's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values ([`hint.ts`](./hint.ts)'s
 * `narrate`); this file decides only how it reads. Numbers arrive as the board
 * shows them, counting from 1. Each sentence runs indication, reasoning,
 * conclusion, with the conclusion in the necessity voice (docs/games/hints.md
 * § "Writing the narration").
 *
 * The words are the help page's: a **step** is one move to a neighboring
 * square, so a number sits within as many steps of another as they are apart
 * in the sequence; a square is a **dead end** when the path can reach it from
 * only one neighbor; a missing run of numbers **steps** from one placed number
 * to the next through empty squares. The square a step fills is "this square",
 * the squares it reasons from are outlined, and the line an arrow points along
 * is striped.
 */

/** How close a number must be to `m`, which is `d` places from it in the sequence. */
const near = (d: number, m: number): string =>
  d === 1 ? `next to ${m}` : `within ${d} steps of ${m}`;

/** Two bounds joined, the second's "steps" left implied after a first that
 * said it: "within 2 steps of 23 and 4 of 29". */
const nearBoth = (a: Bound, b: Bound): string =>
  a.d > 1 && b.d > 1
    ? `${near(a.d, a.m)} and ${b.d} of ${b.m}`
    : `${near(a.d, a.m)} and ${near(b.d, b.m)}`;

/** The run of numbers from `lo` to `hi`. */
const run = (lo: number, hi: number): string =>
  lo === hi ? `${lo}` : `The numbers ${lo} to ${hi}`;

/** A placed number a premise measures from: its value and how far it is. */
export interface Bound {
  m: number;
  d: number;
}

const ARROW = "on its arrow's striped line";

/** Why a dead end cannot hold the path's other end. */
export type EndRuledOut = "placed" | "reach" | "arrow";

export const say = {
  /** `n` must sit next to each of `beside`, its placed neighbors in the
   * sequence; `arrow` when its arrow's line is needed to single the square out. */
  touch: (n: number, beside: number[], arrow: boolean): string => {
    const where =
      beside.length === 2
        ? `next to both ${beside[0]} and ${beside[1]}`
        : beside.length === 1
          ? `next to ${beside[0]}`
          : "";
    if (!arrow) {
      if (!where) return `This is the last empty square, so it must be ${n}.`;
      return `${n} must sit ${where}, and this is the only empty square that does, so it must be ${n}.`;
    }
    if (!where)
      return `${n} must sit ${ARROW}, and this is its only empty square, so it must be ${n}.`;
    return `${n} must sit ${where}, ${ARROW}. Only this square does, so it must be ${n}.`;
  },

  /** `n` must be within reach of each bound; `arrow` as for {@link say.touch}. */
  reach: (n: number, bounds: Bound[], arrow: boolean): string => {
    const where =
      bounds.length === 2
        ? nearBoth(bounds[0], bounds[1])
        : near(bounds[0].d, bounds[0].m);
    if (!arrow)
      return `${n} must be ${where}, and only this empty square is, so it must be ${n}.`;
    return `${n} must be ${where}, ${ARROW}. Only this square is, so it must be ${n}.`;
  },

  /** The path can reach this square from one neighbor only; `other` is the
   * path's other end, and `why` it cannot be here. */
  deadEnd: (n: number, other: number, why: EndRuledOut): string => {
    const lead =
      "Only the outlined square leads into this one, so the path must end here.";
    if (why === "placed") return `${lead} With ${other} placed, it must be ${n}.`;
    if (why === "reach") return `${lead} ${other} can't reach it, so it must be ${n}.`;
    return `${lead} ${other}'s arrow points elsewhere, so it must be ${n}.`;
  },

  /** No missing number but `n` can reach this square; `beside` is its placed
   * neighbor in the sequence, which the square touches, when there is one. */
  only: (n: number, beside: number | null): string =>
    beside === null
      ? `No missing number but ${n} can reach this square, so it must be ${n}.`
      : `This square is next to ${beside}, and no other missing number can reach it, so it must be ${n}.`,

  /**
   * The missing run `lo`..`hi` must step between its placed ends, `from` below
   * and `to` above (either may be absent, at an end of the path), through the
   * outlined squares, and `n` has only this square on any such route.
   */
  route: (
    n: number,
    lo: number,
    hi: number,
    from: number | null,
    to: number | null,
  ) => {
    const numbers = run(lo, hi);
    const way =
      from !== null && to !== null
        ? `from ${from} to ${to}`
        : from !== null
          ? `on from ${from}`
          : `back from ${to}`;
    return `${numbers} must step ${way} through the outlined squares, so ${n} can only go here.`;
  },

  /** No missing number but `n` can step to this square through empty squares;
   * `beside` as for {@link say.only}. */
  routeOnly: (n: number, beside: number | null): string =>
    beside === null
      ? `No missing number but ${n} can step to this square through empty squares, so it must be ${n}.`
      : `This square is next to ${beside}, and no other missing number can step to it through empty squares, so it must be ${n}.`,
};
