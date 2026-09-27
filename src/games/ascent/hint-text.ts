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
 * only one neighbor; a **run** is the missing numbers between two placed ones,
 * and it **steps** from one to the other through empty squares. The square a
 * step fills is "this square", the squares it reasons from are outlined, and
 * what is striped is either the line an arrow points along or the squares a
 * run can reach.
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

/**
 * The run that comes closest to a square without reaching it. A single number
 * `k` must touch both its neighbors in the sequence (`need`, the ones the square
 * does not touch); a longer run `lo`..`hi` is too far from its ends `ends`.
 */
export type Rival =
  | { kind: "one"; k: number; need: number[]; touches: boolean }
  | { kind: "run"; lo: number; hi: number; ends: number[] };

function rivalText(r: Rival): string {
  if (r.kind === "run")
    return `the run ${r.lo} to ${r.hi} is too far from ${r.ends.join(" and ")}`;
  const need = r.need.join(" and ");
  return r.touches
    ? `${r.k} would have to touch ${need} too`
    : `${r.k} would have to touch ${need}`;
}

/**
 * A step count ruling out part of the run: this square is `d` steps from `m`,
 * too far for `k` and (when `more`) every number beyond it in direction `dir`.
 */
export interface Count {
  m: number;
  d: number;
  k: number;
  more: boolean;
  dir: "up" | "down";
}

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

  /**
   * Only `n` can fill this square: the one run that comes close fails (`rival`,
   * or none does), and the step counts to the run's own ends rule out the rest
   * of it (`counts`, empty when `n` is its run's only number).
   */
  fill: (n: number, rival: Rival | null, counts: Count[]): string => {
    const why = rival === null ? "no other run comes close" : rivalText(rival);
    const rest = counts.map(
      (c) =>
        `${c.d} steps from ${c.m} is too far for ${c.k}${c.more ? ` ${c.dir}` : ""}`,
    );
    return `Only ${n} can fill this square: ${[why, ...rest].join(", and ")}.`;
  },

  /**
   * Of all the runs of missing numbers, only `lo`..`hi` reaches this square
   * (its reach is striped), and of its numbers only `n` does. `from` and `to`
   * are its placed ends, either absent at an end of the path; `byRoute` when
   * reach is counted through empty squares.
   */
  onlyRun: (
    n: number,
    lo: number,
    hi: number,
    from: number | null,
    to: number | null,
    byRoute: boolean,
  ): string => {
    const ends =
      from !== null && to !== null
        ? `between ${from} and ${to}`
        : from !== null
          ? `after ${from}`
          : `before ${to}`;
    const reach = byRoute
      ? "can step here through empty squares"
      : "can reach this square";
    if (lo === hi) return `Only ${n}, ${ends}, ${reach}, so it must be ${n}.`;
    return `Only the run ${lo} to ${hi} ${ends} ${reach}, and of those only ${n} can, so it must be ${n}.`;
  },

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
};
