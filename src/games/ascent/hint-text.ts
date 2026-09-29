/**
 * Every sentence Ascent's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values ([`hint.ts`](./hint.ts)'s
 * `narrate`); this file decides only how it reads. Numbers arrive as the board
 * shows them, counting from 1, each with the square it stands on. Each sentence
 * runs indication, reasoning, conclusion, with the conclusion in the necessity
 * voice (docs/games/hints.md § "Writing the narration").
 *
 * The words are the help page's: a **step** is one move to a neighboring
 * square, so a number sits within as many steps of another as they are apart
 * in the sequence; a square is a **dead end** when the path can reach it from
 * only one neighbor; a **run** is the missing numbers between two placed ones,
 * and it **steps** from one to the other through empty squares. In Edges mode a
 * number's own line is named by its shape ("on its column"), in every technique
 * alike.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the squares a step fills are ringed, and a whole
 * run's route is drawn as a line through them; a placed number the sentence
 * names, an arrow it reads and a square it reasons from are outlined; the line
 * an arrow points along, a run's reach and the squares no other run reaches are
 * striped. `hint.ts` draws what the words name, so the two cannot disagree.
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
} from "../../engine/hint-words.ts";
import type { LineKind } from "./premises.ts";

/** A square of the board, by index. */
export const SQUARE: MarkKind<number> = { name: "square", key: String };

/** A square of a whole run's route, drawn as the game's path line through it:
 * the line is the ring on the squares it passes through. */
export const PATH: MarkKind<number> = {
  name: "path",
  key: String,
  within: (i) => ({ kind: SQUARE.name, key: String(i) }),
};

const ring = (at: readonly number[], words: string): Narration =>
  mark.as("ring", SQUARE, at, words);
const outlined = (at: readonly number[], words: string): Narration =>
  mark.as("outline", SQUARE, at, words);
const striped = (at: readonly number[], words: string): Narration =>
  mark.as("stripes", SQUARE, at, words);
/** A placed number, named by its value. */
const num = (p: { m: number; cell: number }): Narration => outlined([p.cell], `${p.m}`);

/** An arrow and the line it points along: "its column", or with no line, "its
 * column" pointing at the arrow alone. */
export interface Arrowed {
  kind: LineKind;
  arrow: number;
  /** The squares of its line, when the step stripes it. */
  line: readonly number[] | null;
}

/** "its column": the arrow is "its", its striped line the "column". */
const itsLine = (a: Arrowed): Narration =>
  a.line
    ? phrase`${outlined([a.arrow], "its")} ${striped(a.line, a.kind)}`
    : outlined([a.arrow], `its ${a.kind}`);

/** How close a number must be to `b`, which is `d` places from it in the sequence. */
const near = (b: Bound): Narration =>
  b.d === 1 ? phrase`next to ${num(b)}` : phrase`within ${b.d} steps of ${num(b)}`;

/** Two bounds joined, the second's "steps" left implied after a first that
 * said it: "within 2 steps of 23 and 4 of 29". */
const nearBoth = (a: Bound, b: Bound): Narration =>
  a.d > 1 && b.d > 1
    ? phrase`${near(a)} and ${b.d} of ${num(b)}`
    : phrase`${near(a)} and ${near(b)}`;

/** A run of missing numbers, named by the placed numbers at its ends. */
export interface RunEnds {
  from: number | null;
  to: number | null;
  /** The squares of the ends that are placed. */
  cells: readonly number[];
}

/**
 * A run of missing numbers, named by the placed numbers at its ends: the
 * numbers in between follow from them, so naming those too is only noise
 * (owner, 2026-09-27). Either end may be absent, at an end of the path.
 */
const runWords = (r: RunEnds): string =>
  r.from !== null && r.to !== null
    ? `the run between ${r.from} and ${r.to}`
    : r.from !== null
      ? `the run after ${r.from}`
      : `the run before ${r.to}`;

const runName = (r: RunEnds, cap = false): Narration => {
  const w = runWords(r);
  return outlined(r.cells, cap ? w[0].toUpperCase() + w.slice(1) : w);
};

/** A placed number a premise measures from: its value, how far it is, and its
 * square. */
export interface Bound {
  m: number;
  d: number;
  cell: number;
}

/**
 * The run that comes closest to a square without reaching it. A run of one
 * number must touch both ends, so the square fails when it does not touch one
 * of them (`need`, the ends it misses); a longer run is too far away. Only
 * placed numbers are named: a sentence speaks of what is on the board, and of
 * the number it places (owner, 2026-09-27).
 */
export type Rival =
  | { kind: "one"; run: RunEnds; need: number[] }
  | { kind: "run"; run: RunEnds };

/**
 * Why no other run fills a square: none comes within two steps of it
 * (`none`), the one that does fails (a {@link Rival}), or several come close
 * and each falls short (`unnamed`), too many to name at a glance.
 */
export type Others = { kind: "none" } | { kind: "unnamed" } | Rival;

function othersText(o: Others, at: readonly number[]): Narration | string {
  if (o.kind === "none") return "no other run comes close";
  if (o.kind === "unnamed") return "no other run can reach it";
  if (o.kind === "run") return phrase`${runName(o.run)} is too far away`;
  return phrase`${runName(o.run)} can't, as ${ring(at, "this square")} doesn't touch ${o.need.join(" or ")}`;
}

/**
 * A step count that rules out the rest of the run: this square is `d` steps
 * from the placed `m`, too far for the run's numbers on the side away from it.
 */
export interface Count {
  m: number;
  d: number;
  cell: number;
  /** Which of the run's numbers it rules out, relative to the one placed. */
  side: "lower" | "higher";
}

/**
 * What a number must be near, in Edges mode: placed number `m` at `cell`, or
 * the line of the missing `m` (`line`, its arrow and shape), `d` places away in
 * the sequence.
 */
export interface Near {
  m: number;
  d: number;
  cell: number;
  line: Arrowed | null;
}

/** The collection's limit on a step's sentence (`hint-quality.test.ts`). */
export const GLANCE = 120;

/** "11's row", "20". */
const nearTarget = (p: Near): Narration =>
  p.line
    ? p.line.line
      ? phrase`${outlined([p.line.arrow], `${p.m}'s`)} ${striped(p.line.line, p.line.kind)}`
      : outlined([p.line.arrow], `${p.m}'s ${p.line.kind}`)
    : num({ m: p.m, cell: p.cell });
const stepsOf = (d: number) => (d === 1 ? "a step" : `${d} steps`);

/** Narrations joined as a sentence lists them: "7, 3 and 18". */
function listed(xs: readonly (string | Narration)[]): Narration {
  let out = phrase``;
  xs.forEach((x, i) => {
    const sep = i === 0 ? "" : i === xs.length - 1 ? " and " : ", ";
    out = phrase`${out}${sep}${x}`;
  });
  return out;
}

/** "within a step of 11's row and 13's row and 3 steps of 20": premises of one
 * distance share it. */
function within(ps: readonly Near[]): Narration {
  const groups: { d: number; targets: Narration[] }[] = [];
  for (const p of [...ps].sort((a, b) => a.d - b.d)) {
    const g = groups.at(-1);
    if (g && g.d === p.d) g.targets.push(nearTarget(p));
    else groups.push({ d: p.d, targets: [nearTarget(p)] });
  }
  const parts = groups.map((g) => {
    let joined = phrase``;
    g.targets.forEach((t, i) => {
      joined = i === 0 ? t : phrase`${joined} and ${t}`;
    });
    return phrase`${stepsOf(g.d)} of ${joined}`;
  });
  let out = parts[0];
  for (const p of parts.slice(1)) out = phrase`${out} and ${p}`;
  return phrase`within ${out}`;
}

/** Why a dead end cannot hold the path's other end. */
export type EndRuledOut = "placed" | "reach" | "arrow";

/** A number that could go where the step places `n`, but cannot: its arrow
 * (`arrow`, -1 when it has none) and what it is too far from. */
export interface Out {
  m: number;
  arrow: number;
  by: Near;
}

export const say = {
  /** `n` must sit next to each of `beside`, its placed neighbors in the
   * sequence; `line`, its arrow's, when that is needed to single the square out. */
  touch: (
    at: readonly number[],
    n: number,
    beside: Bound[],
    line: Arrowed | null,
  ): Narration => {
    const where =
      beside.length === 2
        ? phrase`next to both ${num(beside[0])} and ${num(beside[1])}`
        : beside.length === 1
          ? phrase`next to ${num(beside[0])}`
          : null;
    if (!line) {
      if (!where)
        return phrase`${ring(at, "This")} is the last empty square, so it must be ${n}.`;
      return phrase`${n} must sit ${where}, and ${ring(at, "this")} is the only empty square that does, so it must be ${n}.`;
    }
    if (!where)
      return phrase`${n} must be on ${itsLine(line)}, and ${ring(at, "this")} is its only empty square, so it must be ${n}.`;
    return phrase`${n} must sit ${where}, on ${itsLine(line)}. Only ${ring(at, "this square")} does, so it must be ${n}.`;
  },

  /** `n` must be within reach of each bound; `line` as for {@link say.touch}. */
  reach: (
    at: readonly number[],
    n: number,
    bounds: Bound[],
    line: Arrowed | null,
  ): Narration => {
    const where =
      bounds.length === 2 ? nearBoth(bounds[0], bounds[1]) : near(bounds[0]);
    if (!line)
      return phrase`${n} must be ${where}, and only ${ring(at, "this empty square")} is, so it must be ${n}.`;
    return phrase`${n} must be ${where}, on ${itsLine(line)}. Only ${ring(at, "this square")} is, so it must be ${n}.`;
  },

  /** The path can reach this square from one neighbor only (`open`); `other`
   * is the path's other end, and `why` it cannot be here. */
  deadEnd: (
    at: readonly number[],
    open: number,
    n: number,
    other: number,
    why: EndRuledOut,
  ): Narration => {
    const lead = phrase`Only ${outlined([open], "the outlined square")} leads into ${ring(at, "this one")}, so the path must end here.`;
    if (why === "placed") return phrase`${lead} With ${other} placed, it must be ${n}.`;
    if (why === "reach")
      return phrase`${lead} The path's ${n === 1 ? "last" : "first"} number can't reach it, so it must be ${n}.`;
    return phrase`${lead} ${other}'s arrow points elsewhere, so it must be ${n}.`;
  },

  /**
   * Only `n` can fill this square: no other run can (`others`), and the step
   * counts to the run's own ends rule out the rest of it (`counts`, empty when
   * `n` is its run's only number).
   */
  fill: (
    at: readonly number[],
    n: number,
    others: Others,
    counts: Count[],
  ): Narration => {
    const why = othersText(others, at);
    const lead = phrase`Only ${n} can fill ${ring(at, "this square")}: ${why}`;
    if (counts.length === 0) return phrase`${lead}.`;
    const rest =
      counts.length === 2
        ? phrase`${counts[0].d} steps from ${num(counts[0])} and ${counts[1].d} from ${num(counts[1])} rule out the rest`
        : phrase`${counts[0].d} steps from ${num(counts[0])} rules out anything ${counts[0].side}`;
    return phrase`${lead}, and ${rest}.`;
  },

  /**
   * Of all the runs of missing numbers, only `run` reaches this square (its
   * reach, `reach`, is striped), and of its numbers only `n` does; `single`
   * when `n` is its only number. `byRoute` when reach is counted through empty
   * squares.
   */
  onlyRun: (
    at: readonly number[],
    n: number,
    single: boolean,
    run: RunEnds,
    reach: readonly number[],
    byRoute: boolean,
  ): Narration => {
    const reaches = byRoute
      ? phrase`${striped(reach, "can step")} ${ring(at, "here")} through empty squares`
      : phrase`${striped(reach, "can reach")} ${ring(at, "this square")}`;
    // A single number is named for itself: "Only 3, between 2 and 4, …".
    const who = single
      ? phrase`Only ${n}, ${outlined(run.cells, runWords(run).slice("the run ".length))},`
      : phrase`Only ${runName(run)}`;
    if (single) return phrase`${who} ${reaches}, so it must be ${n}.`;
    return phrase`${who} ${reaches}, and of its numbers only ${n} can, so it must be ${n}.`;
  },

  /**
   * `run` must step through the outlined squares (`through`), one square per
   * number, and `n` has only this square on any such route.
   */
  route: (
    at: readonly number[],
    n: number,
    run: RunEnds,
    through: readonly number[],
  ): Narration =>
    phrase`${runName(run, true)} must step through ${outlined(through, "the outlined squares")}, so ${n} can only go ${ring(at, "here")}.`,

  /**
   * Edges: `n` is on its arrow's line (`own`; `null` when it has no arrow) and
   * within reach of each of `near`, and only this square is.
   */
  lines: (
    at: readonly number[],
    n: number,
    own: Arrowed | null,
    near: readonly Near[],
  ): Narration =>
    own
      ? phrase`${n} must be on ${itsLine(own)}, ${within(near)}. Only ${ring(at, "this square")} is, so it must be ${n}.`
      : phrase`${n} has no arrow, but must be ${within(near)}. Only ${ring(at, "this square")} is, so it must be ${n}.`,

  /**
   * Edges: of the missing numbers, only `n` and those of `out` can stand here
   * (their arrows point here, or they have none), and each of `out` is too far
   * from what it must be near. `own` is `n`'s arrow, -1 when it has none.
   */
  pointers: (
    at: readonly number[],
    n: number,
    own: number,
    out: readonly Out[],
  ): Narration => {
    const here = ring(at, "here");
    if (out.length === 0)
      return own >= 0
        ? phrase`Of the missing numbers, only ${outlined([own], `${n}'s arrow`)} points ${here}, so it must be ${n}.`
        : phrase`No missing number's arrow points ${here}, and only ${n} has none, so it must be ${n}.`;
    // A number without an arrow points nowhere, so it "could go" here.
    const arrowless = own < 0 || out.some((o) => o.arrow < 0);
    const all = [...out, { m: n, arrow: own }].sort((a, b) => a.m - b.m);
    const names = all.map((o) =>
      o.arrow < 0 ? `${o.m} (no arrow)` : outlined([o.arrow], `${o.m}`),
    );
    const lead = phrase`Of the missing numbers, only ${listed(names)} ${arrowless ? "could go" : "point"} ${here}`;
    const why = out.map((o, k) =>
      k === 0
        ? phrase`${o.m} is too far from ${nearTarget(o.by)}`
        : phrase`${o.m} from ${nearTarget(o.by)}`,
    );
    const full = phrase`${lead}. ${listed(why)}, so it must be ${n}.`;
    if (full.text.length <= GLANCE) return full;
    // Too many to name each reason at a glance: they are drawn instead, and the
    // words point at them together. What these words do not name is not drawn
    // (`hint.ts` draws from the words).
    const lines = out.flatMap((o) => o.by.line?.line ?? []);
    const placed = out.flatMap((o) => (o.by.line ? [] : [o.by.cell]));
    const drawn =
      placed.length > 0
        ? phrase`${striped(lines, "the striped lines")} and ${outlined(placed, "outlined numbers")}`
        : striped(lines, "the striped lines");
    const shorter = [
      phrase`${lead}, and ${drawn} rule out all but ${n}, so it must be ${n}.`,
      phrase`Of the missing numbers that ${arrowless ? "could go" : "point"} ${here}, ${drawn} rule out all but ${n}, so it must be ${n}.`,
    ];
    return shorter.find((s) => s.text.length <= GLANCE) ?? shorter[shorter.length - 1];
  },

  /**
   * The whole run `run` has one route (`route`, drawn as a line): through the
   * empty squares at all ("plain"), through every striped square no other run
   * can reach ("must"), or the only one leaving the run `room` a way through
   * what is left ("room"). `arrows`, in Edges mode, the arrows of the run's
   * numbers when they are what leave only that route.
   */
  wholeRun: (
    run: RunEnds,
    route: readonly number[],
    why:
      | { kind: "plain" }
      | { kind: "must"; squares: readonly number[] }
      | { kind: "room"; run: RunEnds },
    arrows: readonly number[] | null,
  ): Narration => {
    const path = (words: string) => mark.as("ring", PATH, route, words);
    // Edges: the arrows are why there is one route, so the sentence says so.
    // The route is "the one drawn", since "the line" would read as an arrow's.
    if (arrows && why.kind === "plain")
      return phrase`With each number on ${outlined(arrows, "its arrow's")} line, ${runName(run)} has only one route, so it must take ${path("the one drawn")}.`;
    if (arrows && why.kind === "must") {
      const said = phrase`No other run reaches ${striped(why.squares, "the striped squares")}, so ${runName(run)} must take them, on ${path("the one route")} ${outlined(arrows, "its arrows")} allow.`;
      if (said.text.length <= GLANCE) return said;
    }
    if (why.kind === "must")
      return phrase`No other run reaches ${striped(why.squares, "the striped squares")}, so ${runName(run)} must take them all, and only ${path("one route")} does.`;
    if (why.kind === "room")
      return phrase`Only one route for ${runName(run)} leaves ${runName(why.run)} a way through, so it must take ${path("the line")}.`;
    return phrase`${runName(run, true)} has only one route through the empty squares, so it must go along ${path("the line")}.`;
  },
};
