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

/**
 * A run of missing numbers, named by the placed numbers at its ends: the
 * numbers in between follow from them, so naming those too is only noise
 * (owner, 2026-09-27). Either end may be absent, at an end of the path.
 */
const runName = (from: number | null, to: number | null): string =>
  from !== null && to !== null
    ? `the run between ${from} and ${to}`
    : from !== null
      ? `the run after ${from}`
      : `the run before ${to}`;

const capitalized = (s: string) => s[0].toUpperCase() + s.slice(1);

/** A placed number a premise measures from: its value and how far it is. */
export interface Bound {
  m: number;
  d: number;
}

const ARROW = "on its arrow's striped line";

/**
 * The run that comes closest to a square without reaching it, between `from`
 * and `to`. A run of one number must touch both, so the square fails when it
 * does not touch one of them (`need`, the ends it misses); a longer run is too
 * far away. Only placed numbers are named: a sentence speaks of what is on the
 * board, and of the number it places (owner, 2026-09-27).
 */
export type Rival =
  | { kind: "one"; from: number | null; to: number | null; need: number[] }
  | { kind: "run"; from: number | null; to: number | null };

function rivalText(r: Rival): string {
  if (r.kind === "run") return `${runName(r.from, r.to)} is too far away`;
  return `${runName(r.from, r.to)} can't, as this square doesn't touch ${r.need.join(" or ")}`;
}

/**
 * A step count that rules out the rest of the run: this square is `d` steps
 * from the placed `m`, too far for the run's numbers on the side away from it.
 */
export interface Count {
  m: number;
  d: number;
  /** Which of the run's numbers it rules out, relative to the one placed. */
  side: "lower" | "higher";
}

/**
 * What a number must be near, in Edges mode: placed number `m`, or the line of
 * the missing `m` (`line`, its shape), `d` places away in the sequence.
 */
export interface Near {
  m: number;
  d: number;
  line: "row" | "column" | "diagonal" | null;
}

/** The collection's limit on a step's sentence (`hint-quality.test.ts`). */
export const GLANCE = 120;

const nearTarget = (p: Near) => (p.line ? `${p.m}'s ${p.line}` : `${p.m}`);
const stepsOf = (d: number) => (d === 1 ? "a step" : `${d} steps`);

/** "within a step of 11's row and 13's row and 3 steps of 20": premises of one
 * distance share it. */
function within(ps: readonly Near[]): string {
  const groups: { d: number; targets: string[] }[] = [];
  for (const p of [...ps].sort((a, b) => a.d - b.d)) {
    const g = groups.at(-1);
    if (g && g.d === p.d) g.targets.push(nearTarget(p));
    else groups.push({ d: p.d, targets: [nearTarget(p)] });
  }
  return `within ${groups.map((g) => `${stepsOf(g.d)} of ${g.targets.join(" and ")}`).join(" and ")}`;
}

/** Names joined as a sentence lists them: "7, 3 and 18". */
const listed = (xs: readonly string[]) =>
  xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`;

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
    if (why === "reach")
      return `${lead} The path's ${n === 1 ? "last" : "first"} number can't reach it, so it must be ${n}.`;
    return `${lead} ${other}'s arrow points elsewhere, so it must be ${n}.`;
  },

  /**
   * Only `n` can fill this square: the one run that comes close fails (`rival`,
   * or none does), and the step counts to the run's own ends rule out the rest
   * of it (`counts`, empty when `n` is its run's only number).
   */
  fill: (n: number, rival: Rival | null, counts: Count[]): string => {
    const why = rival === null ? "no other run comes close" : rivalText(rival);
    if (counts.length === 0) return `Only ${n} can fill this square: ${why}.`;
    const rest =
      counts.length === 2
        ? `${counts[0].d} steps from ${counts[0].m} and ${counts[1].d} from ${counts[1].m} rule out the rest`
        : `${counts[0].d} steps from ${counts[0].m} rules out anything ${counts[0].side}`;
    return `Only ${n} can fill this square: ${why}, and ${rest}.`;
  },

  /**
   * Of all the runs of missing numbers, only the one between `from` and `to`
   * reaches this square (its reach is striped), and of its numbers only `n`
   * does; `single` when `n` is its only number. `byRoute` when reach is counted
   * through empty squares.
   */
  onlyRun: (
    n: number,
    single: boolean,
    from: number | null,
    to: number | null,
    byRoute: boolean,
  ): string => {
    const reach = byRoute
      ? "can step here through empty squares"
      : "can reach this square";
    // A single number is named for itself: "Only 3, between 2 and 4, …".
    const who = single
      ? `Only ${n}, ${runName(from, to).slice("the run ".length)},`
      : `Only ${runName(from, to)}`;
    if (single) return `${who} ${reach}, so it must be ${n}.`;
    return `${who} ${reach}, and of its numbers only ${n} can, so it must be ${n}.`;
  },

  /**
   * The run between `from` and `to` must step through the outlined squares, one
   * square per number, and `n` has only this square on any such route.
   */
  route: (n: number, from: number | null, to: number | null) =>
    `${capitalized(runName(from, to))} must step through the outlined squares, so ${n} can only go here.`,

  /**
   * Edges: `n` is on its arrow's line (`own`, its shape; `null` when it has no
   * arrow) and within reach of each of `near`, and only this square is.
   */
  lines: (n: number, own: Near["line"], near: readonly Near[]): string =>
    own
      ? `${n} must be on its ${own}, ${within(near)}. Only this square is, so it must be ${n}.`
      : `${n} has no arrow, but must be ${within(near)}. Only this square is, so it must be ${n}.`,

  /**
   * Edges: of the missing numbers, only `n` and those of `out` can stand here
   * (their arrows point here, or they have none), and each of `out` is too far
   * from what it must be near.
   */
  pointers: (
    n: number,
    ownArrow: boolean,
    out: readonly { m: number; arrowless: boolean; by: Near }[],
  ): string => {
    if (out.length === 0)
      return ownArrow
        ? `Of the missing numbers, only ${n}'s arrow points here, so it must be ${n}.`
        : `No missing number's arrow points here, and only ${n} has none, so it must be ${n}.`;
    // A number without an arrow points nowhere, so it "could go" here.
    const arrowless = !ownArrow || out.some((o) => o.arrowless);
    const names = [...out.map((o) => o.m), n]
      .sort((a, b) => a - b)
      .map((m) =>
        (m === n ? !ownArrow : out.find((o) => o.m === m)?.arrowless)
          ? `${m} (no arrow)`
          : `${m}`,
      );
    const lead = `Of the missing numbers, only ${listed(names)} ${arrowless ? "could go" : "point"} here`;
    const why = out.map((o, k) =>
      k === 0
        ? `${o.m} is too far from ${nearTarget(o.by)}`
        : `${o.m} from ${nearTarget(o.by)}`,
    );
    const full = `${lead}. ${listed(why)}, so it must be ${n}.`;
    if (full.length <= GLANCE) return full;
    // Too many to name each reason at a glance: they are drawn instead.
    const drawn = out.some((o) => o.by.line === null)
      ? "the striped lines and outlined numbers"
      : "the striped lines";
    const shorter = [
      `${lead}, and ${drawn} rule out all but ${n}, so it must be ${n}.`,
      `Of the missing numbers that ${arrowless ? "could go" : "point"} here, ${drawn} rule out all but ${n}, so it must be ${n}.`,
    ];
    return shorter.find((s) => s.length <= GLANCE) ?? shorter[shorter.length - 1];
  },

  /**
   * The whole run between `from` and `to` has one route: through the empty
   * squares at all ("plain"), through every striped square no other run can
   * reach ("must"), or the only one leaving the run between `room.from` and
   * `room.to` a way through what is left ("room").
   */
  wholeRun: (
    from: number | null,
    to: number | null,
    why:
      | { kind: "plain" }
      | { kind: "must" }
      | { kind: "room"; from: number | null; to: number | null },
  ): string => {
    const run = runName(from, to);
    if (why.kind === "must")
      return `No other run reaches the striped squares, so ${run} must take them all, and only one route does.`;
    if (why.kind === "room")
      return `Only one route for ${run} leaves ${runName(why.from, why.to)} a way through, so it must take the line.`;
    return `${capitalized(run)} has only one route through the empty squares, so it must go along the line.`;
  },
};
