/**
 * Whether the game's own deductions reach a player's move from the position
 * before it: what Check & save says of the last move (`quick-save`, "Check &
 * save judges the last move").
 *
 * Every board the app deals has one answer, so a correct move is always
 * forced by the board; what tells a player something is whether a deduction
 * the game teaches makes it. The judge is the hint's own walk, from the
 * position before the move, aimed at the move's facts: it takes a firing that
 * makes one the moment one is on offer, and walks on as the hint would until
 * one is or nothing follows. A verdict names the techniques, by what a player
 * calls them (the description's `names`), and marks nothing: the owner found
 * a quoted step "an extremely over-detailed display of an alternate
 * deduction" (2026-11-18).
 *
 * What is here is about the description's marks and nothing else; a hint
 * builder drives the walk (`described-firing-hint.ts`,
 * `described-edge-hint.ts`).
 */
import { type Facts, MARK, PLACE, STRIKE, STRIKE_EDGE } from "./describe-runtime.ts";
import type { FactGraph } from "./fact-graph.ts";
import type { MoveVerdict } from "./game.ts";
import { phrase, type Sentence, unshaped } from "./hint-words.ts";
import type { CellMarks, Firing } from "./ladder-runtime.ts";

/** A fact a move made: a value placed, a candidate struck, an edge's mark
 * struck, a cell marked; `at` is the cell or the edge. */
export interface MovedFact {
  readonly kind: number;
  readonly at: number;
  readonly value: number;
}

/**
 * The facts a move made, from the marks of the position before it, a second
 * copy of them, and the marks after it, in the order a verdict names them:
 * the values placed, then what was struck or marked on its own. A placement
 * strikes what the game's placing techniques strike with it, and those are
 * the placement's, not the player's: they are read off `placed`, which the
 * placements are made on. A value taken back or written over, and a
 * candidate given back, are no fact a deduction makes and are left out.
 */
export function movedFacts(
  before: CellMarks,
  placed: CellMarks,
  after: CellMarks,
): MovedFact[] {
  const out: MovedFact[] = [];
  for (let c = 0; c < before.grid.length; c++) {
    const v = after.grid[c];
    if (before.grid[c] !== 0 || v === 0) continue;
    out.push({ kind: PLACE, at: c, value: v });
    if (placed.grid[c] === 0) placed.place(c, v);
  }
  for (let c = 0; c < placed.cands.length; c++) {
    if (after.grid[c] !== 0) continue;
    for (let gone = placed.cands[c] & ~after.cands[c]; gone !== 0; gone &= gone - 1)
      out.push({ kind: STRIKE, at: c, value: 31 - Math.clz32(gone & -gone) });
  }
  for (let e = 0; e < placed.edgeCands.length; e++)
    for (
      let gone = placed.edgeCands[e] & ~after.edgeCands[e];
      gone !== 0;
      gone &= gone - 1
    )
      out.push({ kind: STRIKE_EDGE, at: e, value: 31 - Math.clz32(gone & -gone) });
  for (let c = 0; c < placed.marked.length; c++)
    if (placed.marked[c] === -1 && after.marked[c] !== -1)
      out.push({ kind: MARK, at: c, value: after.marked[c] });
  return out;
}

/** Whether marks `m` hold the fact: its value placed, its candidate or edge
 * mark gone (a placement of another value takes the candidate), its mark
 * made. With `struck`, a value left the one candidate counts as placed. */
function reached(m: CellMarks, f: MovedFact, struck = false): boolean {
  switch (f.kind) {
    case PLACE:
      return (
        m.grid[f.at] === f.value ||
        (struck && m.grid[f.at] === 0 && m.cands[f.at] === 1 << f.value)
      );
    case STRIKE:
      return !m.has(f.at, f.value);
    case STRIKE_EDGE:
      return ((m.edgeCand(f.at) >> f.value) & 1) === 0;
    case MARK:
      return m.markOf(f.at) === f.value;
    default:
      return false;
  }
}

/** Whether one of a firing's facts (kind, element, value) makes `f`, or
 * for a placement, has a part in making it: a strike of another value. */
function makes(kind: number, at: number, value: number, f: MovedFact): boolean {
  if (at !== f.at) return false;
  if (f.kind === STRIKE)
    return (
      (kind === STRIKE && value === f.value) || (kind === PLACE && value !== f.value)
    );
  if (f.kind === PLACE) return value === f.value ? kind === PLACE : kind === STRIKE;
  return kind === f.kind && value === f.value;
}

/** How many of `wanted` a firing's facts make on marks `m`. A placement is
 * made by placing it, or by striking what leaves it the cell's one candidate
 * (`struck`, as {@link reached} reads it); a strike that only narrows the
 * cell is not counted, or it would be taken before the firing that decides
 * the cell. */
function aimsAt(
  facts: Facts,
  wanted: readonly MovedFact[],
  m: CellMarks,
  struck: (f: MovedFact) => boolean,
): number {
  let n = 0;
  for (const f of wanted) {
    let made = false;
    let gone = 0;
    for (let i = 0; i < facts.length && !made; i += 3) {
      if (f.kind !== PLACE) made = makes(facts[i], facts[i + 1], facts[i + 2], f);
      else if (facts[i + 1] === f.at) {
        if (facts[i] === PLACE && facts[i + 2] === f.value) made = true;
        if (facts[i] === STRIKE) gone |= 1 << facts[i + 2];
      }
    }
    if (!made && gone !== 0 && struck(f))
      made = (m.cands[f.at] & ~gone) === 1 << f.value;
    if (made) n++;
  }
  return n;
}

/**
 * Where a chain to fact `f` may have begun: of the firings the walk took
 * (`made`, each the ids of the graph's facts it made), `reachedAt` is the one
 * (past the first) that made it. The fact rests on every fact up to then that
 * makes it, which for a value placed by striking the rest is every strike in
 * its cell, from whichever firing. Where every firing they rest on said what
 * it read (`FactGraph.restsOn`, complete), the chain is those, and the
 * candidates their firings; where one did not, or the graph names none
 * before `reachedAt`, or `reachedAt` made none of them, the chain is every
 * fact made up to `reachedAt`, and every firing before it is a candidate.
 * Earliest first; `null` where the first firing made it.
 */
function chainOf(
  graph: FactGraph,
  made: readonly (readonly number[])[],
  f: MovedFact,
  reachedAt: number,
): { candidates: readonly number[]; chain: ReadonlySet<number> } | null {
  const before = made.slice(0, reachedAt + 1).flat();
  // A value placed by striking the rest rests on every strike in its cell,
  // and they may come from several firings.
  const ids = before.filter((x) => {
    const g = graph.facts[x];
    const sameSpace = (g.about.space === "edges") === (f.kind === STRIKE_EDGE);
    return sameSpace && makes(g.kind, g.about.at, g.value, f);
  });
  if (reachedAt === 0) return null;
  const every = {
    candidates: [...made.keys()].slice(0, reachedAt),
    chain: new Set(before),
  };
  if (!(made[reachedAt] ?? []).some((x) => ids.includes(x))) return every;
  const rests = ids.map((x) => graph.restsOn(x));
  if (!rests.every((r) => r.complete)) return every;
  const chain = new Set([...ids, ...rests.flatMap((r) => r.facts.map((g) => g.id))]);
  const firingOf = (x: number): number => made.findIndex((m) => m.includes(x));
  const candidates = [...new Set([...chain].map(firingOf))]
    .filter((k) => k >= 0 && k < reachedAt)
    .sort((a, b) => a - b);
  // The walk took the firing that made the fact the moment it was on offer,
  // so where it came later the fact rests on something before it that the
  // graph does not say: what a firing cites may leave out what the player
  // sees (Loopy's lines).
  return candidates.length > 0 ? { candidates, chain } : every;
}

/** The most firings a chain's replays may ask a technique to offer again,
 * all told: each offer reads the board, and a check past it names no start.
 * Every judging game's default board stayed within it (2026-11-18,
 * `close-trace-gaps`' design). */
const MOST_OFFERS = 4000;

/**
 * What a judging walk kept of how it reached the move: the facts it made and
 * what each rests on, the firings it took, and the marks it began on, made
 * again, on which a chain's firings are replayed. The graph says what a
 * chain rests on only as far as its firings say what they read, too widely
 * where a formula reads a whole line, and too narrowly where it leaves out
 * what the player sees (Loopy's lines), so the replay is what decides: the
 * start named is a firing the chain's firings cannot reach the move without,
 * the earliest the search finds. What a builder writes to the marks beside
 * the firings (Pearl's line carried on through a pearl) is kept as the
 * firing's before it (`adopt`), and made again with it.
 */
export interface Traced {
  readonly graph: FactGraph;
  /** The firings the walk took, with the graph's facts each made. */
  readonly walked: readonly TracedFiring[];
  /** The marks the walk began on, made again. */
  fresh(): CellMarks;
  /** What the builder does to the marks before each firing, where it is no
   * firing's (the candidate plan's obvious clean). */
  between?(m: CellMarks): void;
  /** Keep what the builder wrote to the walk's marks since its last firing
   * as that firing's facts (`LadderWalk.trace`), asked before the judge
   * reads the marks. */
  adopt?(): void;
}

/**
 * A firing a judging walk took, as a replay makes it again: its facts, the
 * graph's facts it made (its own from `from`, then its placements' culls, up
 * to `to`), and its technique, by `id`, which offers what it would fire on
 * other marks. A ladder walk's `taken` are these as they are; a walk of
 * another kind says what its technique offers (`candidate-plan.ts`).
 */
export interface TracedFiring {
  readonly firing: Firing & {
    readonly entry: {
      readonly id: string;
      readonly run: {
        firings(m: CellMarks): readonly Firing[] | "contradiction";
      };
    };
  };
  readonly from: number;
  readonly to: number;
}

/** Whether marks `m` hold a firing's fact: its value placed, its candidate
 * or edge mark gone, its mark made. */
const holdsFact = (m: CellMarks, kind: number, at: number, value: number): boolean =>
  reached(m, { kind, at, value });

/**
 * Whether the walked firings that made a fact of `chain` (graph ids), less
 * those `dropped`, made again in order on fresh marks, leave `target` true:
 * `null` where they do, else why not. A firing is made again where its
 * technique offers one making each of its facts in the chain that the marks
 * do not hold yet, and its placements' where one of theirs is (they are made
 * with them). One no longer offered, since a dropped firing was what it
 * rested on, is passed over: whether the move rests on it is the target's
 * to say, and a firing the move does not need must not decide it.
 */
function replays(
  replay: Traced,
  chain: ReadonlySet<number>,
  dropped: (k: number) => boolean,
  target: (m: CellMarks) => boolean,
  offers: { left: number },
): string | null {
  let passed: string | null = null;
  const m = replay.fresh();
  for (const [k, { firing, from, to }] of replay.walked.entries()) {
    const own = from + firing.facts.length / 3;
    let inChain = false;
    for (let id = from; id < to && !inChain; id++) inChain = chain.has(id);
    if (!inChain || dropped(k)) continue;
    replay.between?.(m);
    let culls = false;
    for (let id = own; id < to && !culls; id++) culls = chain.has(id);
    const { facts } = firing;
    const want: number[] = [];
    for (let i = 0; i < facts.length; i += 3)
      if (
        (chain.has(from + i / 3) || (culls && facts[i] === PLACE)) &&
        !holdsFact(m, facts[i], facts[i + 1], facts[i + 2])
      )
        want.push(i);
    if (want.length === 0) {
      besides(m, replay.graph, own, to);
      continue;
    }
    if (--offers.left < 0) return "the replays offered too many firings";
    const offered = firing.entry.run.firings(m);
    const match =
      offered === "contradiction"
        ? undefined
        : offered.find((g) =>
            want.every((i) => {
              for (let j = 0; j < g.facts.length; j += 3)
                if (
                  g.facts[j] === facts[i] &&
                  g.facts[j + 1] === facts[i + 1] &&
                  g.facts[j + 2] === facts[i + 2]
                )
                  return true;
              return false;
            }),
          );
    if (match === undefined) {
      passed ??= `${firing.entry.id} (firing ${k}) is not offered`;
      continue;
    }
    m.group++;
    m.applyFacts(match.facts, (i) => match.reasons[i / 3]);
    besides(m, replay.graph, own, to);
  }
  replay.between?.(m);
  return target(m) ? null : (passed ?? "the move is not made");
}

/** Make on `m` the graph's facts `from` to `to` that it does not hold yet:
 * what a firing's placements struck and its builder wrote beside it, which
 * follow from the firing as it was made. */
function besides(m: CellMarks, graph: FactGraph, from: number, to: number): void {
  const facts: number[] = [];
  for (let id = from; id < to; id++) {
    const { kind, about, value } = graph.facts[id];
    if (about.space !== "relations" && !holdsFact(m, kind, about.at, value))
      facts.push(kind, about.at, value);
  }
  if (facts.length > 0) m.applyFacts(facts, null);
}

/** What a chain's replay found: where it stopped short of the move with
 * all its firings (`null` where it reached it), and each candidate start
 * the search left out alone, in the order tried, with its technique and
 * where the replay stopped without its firings. The start named is the
 * first tried that the chain cannot reach the move without. */
export interface ChainAudit {
  readonly whole: string | null;
  readonly tried: readonly {
    readonly start: string | null;
    readonly without: string | null;
  }[];
  /** Whether the chain reached the move without every candidate, so the
   * firing that made it made it from the board. */
  readonly alone: boolean;
  /** How many candidates, earliest first, the search passed over before the
   * start it named; every one where it named none. */
  readonly passed: number;
  /** How many firings the replays asked a technique to offer again. */
  readonly offers: number;
}

/** Who hears each chain's replay: a test, which can see what was not
 * named and why. */
let listener: ((found: ChainAudit) => void) | null = null;

/** Hear each chained verdict's replay, until `null` (test-only). */
export function auditChains(listen: ((found: ChainAudit) => void) | null): void {
  listener = listen;
}

/**
 * A walk judging a move, as a builder drives it: what it aims at, whether
 * the walked marks hold every fact yet, and what each firing it took made
 * (the graph's ids) and which technique made it.
 */
export interface Judging {
  /**
   * How well a firing, by its facts, aims at the facts not yet reached: 2
   * where it makes every one, 1 where some, else 0. `entry` names its
   * technique: offered before the walk has taken a firing, one that makes
   * the whole move is a technique that makes it from the board.
   */
  aim(f: { readonly facts: Facts; readonly entry?: { readonly name: string } }): number;
  done(m: CellMarks): boolean;
  made: number[][];
  /** The technique of each firing in {@link made}, by its name; `null`
   * where its builder names none. */
  techniques: (string | null)[];
  /** How the walk reached the move, where the builder keeps it. */
  traced: Traced | null;
  /**
   * Records a firing the walk took, by its technique's `name`: the graph's
   * facts from `known` on are what it made (none where there is no graph),
   * and `shown` whether the hint shows a step for it. A firing that shows
   * none is the hint's bookkeeping: its facts go with the next one's, so it
   * neither opens a chain nor is named.
   */
  took(
    graph: FactGraph | null,
    known: number,
    name: string | null,
    shown: boolean,
  ): void;
  /** Whether the marks decide a fact they hold no mark for, as the board
   * reads them (`EdgeHintSpec.holds`): a mark no firing makes, where a
   * walk ends on the answer or the description reads it off other marks. */
  holds?: (m: CellMarks, f: MovedFact) => boolean;
}

/**
 * What the walk found of a move: no deduction reached it; every technique
 * that makes the whole of it from the board as it stood (`direct`); a chain,
 * and the technique it began with, `null` where its replay does not confirm
 * one ({@link Traced}); or the
 * marks already on the board decided it (`shown`), the player writing down
 * what they show.
 */
export type Judged =
  | { kind: "unforced" }
  | { kind: "direct"; techniques: readonly string[] }
  | { kind: "chained"; technique: string | null }
  | { kind: "shown" };

/**
 * Judge `moved` by a walk: `walk` runs the builder's steps with the
 * {@link Judging} given it, aimed at the facts not yet reached and ending
 * once all are. A fact the marks held before any firing is one the board
 * already decided: judged only where the move made nothing else. `null`
 * where nothing is left to judge.
 */
export function judgeByWalk(
  moved: readonly MovedFact[],
  walk: (judging: Judging) => void,
): Judged | null {
  // How many firings the walk had taken when its marks first held each fact.
  const at = moved.map(() => -1);
  // Per fact, whether striking may place it, read the first time asked.
  let struck: boolean[] | null = null;
  // The walked marks, which `done` is handed before each firing.
  let marks: CellMarks | null = null;
  // The facts of firings that showed no step, since the last that did.
  let carried: number[] = [];
  // Whether the last firing taken showed a step, so its facts are in `made`.
  let lastShown = false;
  // The technique of the first firing in `carried`.
  let carriedName: string | null = null;
  // Each technique offered before the first firing that makes the move.
  const whole = new Set<string>();
  const judging: Judging = {
    took(graph, known, name, shown) {
      if (graph !== null)
        for (let id = known; id < graph.facts.length; id++) carried.push(id);
      lastShown = shown;
      if (!shown) {
        carriedName ??= name;
        return;
      }
      carriedName = null;
      this.made.push(carried);
      this.techniques.push(name);
      carried = [];
    },
    // A firing that makes every fact left before one that makes some: a
    // count would prefer one that makes many of the strikes a placement
    // brings along (Light Up's lit squares) to the one that places it.
    // An arrow, since a walk is handed it alone.
    aim: (f) => {
      const wanted = moved.filter((_, i) => at[i] < 0);
      const n =
        marks === null
          ? 0
          : aimsAt(f.facts, wanted, marks, (g) => struck?.[moved.indexOf(g)] === true);
      const rank = n === 0 ? 0 : n === wanted.length ? 2 : 1;
      if (rank === 2 && judging.made.length === 0 && f.entry !== undefined)
        whole.add(f.entry.name);
      return rank;
    },
    made: [],
    techniques: [],
    traced: null,
    done(m) {
      marks = m;
      // What the builder wrote since the last firing is that firing's.
      const { traced } = this;
      if (traced?.adopt !== undefined) {
        const known = traced.graph.facts.length;
        traced.adopt();
        const into = lastShown ? this.made.at(-1) : carried;
        for (let id = known; id < traced.graph.facts.length; id++) into?.push(id);
      }
      // A walk that only strikes leaves a value the one candidate, where
      // marks read off a board place it (Bridges' lines); a cell already so
      // when the walk began is the player's notes, which a firing places.
      if (struck === null)
        struck = moved.map(
          (f) => f.kind === PLACE && m.grid[f.at] === 0 && m.candCount(f.at) > 1,
        );
      // A fact made by a firing that showed no step is the next one's, which
      // its facts go with.
      const by = this.made.length + (carried.length > 0 ? 1 : 0);
      for (const [i, f] of moved.entries())
        if (at[i] < 0 && (reached(m, f, struck[i]) || this.holds?.(m, f) === true))
          at[i] = by;
      return at.every((n) => n >= 0);
    },
  };
  walk(judging);
  // A walk may end on the firing that made the last fact, before it asks
  // again: Loopy's stops on a solved board, so the move closing the loop
  // read as reached by nothing.
  if (marks !== null) judging.done(marks);
  // Where it ends on firings that showed no step, theirs are the last.
  if (carried.length > 0) {
    judging.made.push(carried);
    judging.techniques.push(carriedName);
  }
  // A fact the board decided before any firing is not judged, but where the
  // move is all such.
  const judged = moved.flatMap((_, i) => (at[i] !== 0 ? [i] : []));
  if (judged.length === 0) return at.some((n) => n === 0) ? { kind: "shown" } : null;
  if (judged.some((i) => at[i] < 0)) return { kind: "unforced" };
  const first = Math.min(...judged.map((i) => at[i]));
  const { techniques } = judging;
  // A move the board decides at once in part begins with that part's firing.
  if (first === 1) {
    if (judged.every((i) => at[i] === 1)) {
      const taken = techniques[0];
      const names = [...new Set([...(taken === null ? [] : [taken]), ...whole])];
      if (names.length > 0) return { kind: "direct", techniques: names };
    }
    return { kind: "chained", technique: techniques[0] ?? null };
  }
  // A walk that keeps no trace cannot say where the chain began.
  const { traced } = judging;
  if (traced === null) return { kind: "chained", technique: null };
  const i = judged.find((k) => at[k] === first) ?? judged[0];
  const found = chainOf(traced.graph, judging.made, moved[i], first - 1);
  if (found === null) return { kind: "chained", technique: null };
  const target = (m: CellMarks): boolean =>
    reached(m, moved[i], struck?.[i]) || judging.holds?.(m, moved[i]) === true;
  // The walked firings that made a fact of firing `k` of `made`.
  const of = (k: number) => {
    const facts = new Set(judging.made[k]);
    return (w: number): boolean => {
      const { from, to } = traced.walked[w];
      for (let id = from; id < to; id++) if (facts.has(id)) return true;
      return false;
    };
  };
  const { candidates } = found;
  const offers = { left: MOST_OFFERS };
  const all = replays(traced, found.chain, () => false, target, offers);
  // Where the chain stops short without candidates `from` to `to` (`why`,
  // `null` where it reaches the move); `null` past the bound.
  const asked = new Map<number, { why: string | null }>();
  const without = (from: number, to: number): { why: string | null } | null => {
    const key = from * candidates.length + to;
    const known = asked.get(key);
    if (known !== undefined) return known;
    const left = candidates.slice(from, to + 1).map(of);
    const why = replays(
      traced,
      found.chain,
      (w) => left.some((d) => d(w)),
      target,
      offers,
    );
    if (offers.left < 0) return null;
    const got = { why };
    asked.set(key, got);
    return got;
  };
  const tried: { start: string | null; without: string | null }[] = [];
  let named: string | null = null;
  let alone = false;
  let passed = candidates.length;
  // Leaving more out seldom brings the move back, so the earliest candidate
  // the chain cannot do without is found by halving: the first `j` such that
  // the chain without every candidate from `lo` to `j` stops short. Left out
  // alone, it is confirmed; where the chain reaches the move without it (a
  // later candidate stood in for it), the search goes on past it.
  let lo = 0;
  search: while (all === null && lo < candidates.length) {
    const rest = without(lo, candidates.length - 1);
    // Without every candidate, the firing that made the move makes it from
    // the board: the walk came to it late only by the order it takes them in
    // (Adjacent's, a placement's cull the aim does not count).
    if (rest?.why === null && lo === 0) alone = true;
    if (rest === null || rest.why === null) break;
    let a = lo;
    let b = candidates.length - 1;
    while (a < b) {
      const mid = (a + b) >> 1;
      const half = without(lo, mid);
      if (half === null) break search;
      if (half.why === null) a = mid + 1;
      else b = mid;
    }
    const one = without(a, a);
    if (one === null) break;
    const { why } = one;
    tried.push({ start: techniques[candidates[a]], without: why });
    if (why !== null) {
      named = techniques[candidates[a]];
      passed = a;
      break;
    }
    lo = a + 1;
  }
  listener?.({ whole: all, tried, alone, passed, offers: MOST_OFFERS - offers.left });
  const maker = techniques[first - 1];
  if (alone && maker !== null) return { kind: "direct", techniques: [maker] };
  return { kind: "chained", technique: named };
}

/** The most techniques a verdict names; the rest it counts. */
const MOST_NAMED = 3;

/** How long a verdict naming three may run before it names two and counts
 * the third: about two lines on a phone. */
const TWO_LINES = 90;

const SPELLED = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

/** `names` joined as a verdict says them: "A", "A, or B", "A, B, or C", and
 * past what fits, the first two and how many more. */
function namesOf(names: readonly string[], lead: string): string {
  const said = (shown: readonly string[], more: number): string => {
    const tail = more === 0 ? [] : [`${SPELLED[more] ?? String(more)} more`];
    const all = [...shown, ...tail];
    return all.length === 1
      ? all[0]
      : `${all.slice(0, -1).join(", ")}, or ${all[all.length - 1]}`;
  };
  if (names.length <= 2) return said(names, 0);
  const three = said(names.slice(0, MOST_NAMED), names.length - MOST_NAMED);
  if (names.length === MOST_NAMED && lead.length + three.length <= TWO_LINES)
    return three;
  return said(names.slice(0, 2), names.length - 2);
}

/** What a check says of a move a walk judged: the words are this table's
 * (the technical writer's, accepted by the owner 2026-11-18), and no builder
 * writes its own. */
export function verdictOf(judged: Judged): MoveVerdict {
  const say = (words: string): Sentence => unshaped(phrase`${words}`, "evident");
  switch (judged.kind) {
    case "unforced":
      return {
        followed: false,
        words: say(
          "Your last move is correct, but nothing on the board forces it yet: was it a stroke of insight?",
        ),
      };
    case "shown":
      return {
        followed: true,
        words: say("Your last move writes down what the board already shows."),
      };
    case "chained":
      return {
        followed: true,
        words: say(
          judged.technique === null
            ? "Your last move follows from the board, a few steps on."
            : `Your last move follows a few steps on, starting from ${judged.technique}.`,
        ),
      };
    case "direct": {
      const lead = "Your last move follows from ";
      return {
        followed: true,
        words: say(`${lead}${namesOf(judged.techniques, lead)}.`),
      };
    }
  }
}

/**
 * `Game.hint.judgeMove` for a hint whose steps a game builds from its own walk:
 * the move's facts are the difference of the marks the hint reads off the
 * board before and after it (`marks`, `null` where the board breaks the
 * rules), and `walk` runs the hint's walk from the position before, aimed by
 * the judging given it.
 */
export function judgeWalked<State>(
  before: State,
  after: State,
  marks: (state: State) => CellMarks | null,
  walk: (judging: Judging) => void,
): MoveVerdict | null {
  const was = marks(before);
  const placed = marks(before);
  const now = marks(after);
  if (was === null || placed === null || now === null) return null;
  const moved = movedFacts(was, placed, now);
  if (moved.length === 0) return null;
  const judged = judgeByWalk(moved, walk);
  return judged === null ? null : verdictOf(judged);
}
