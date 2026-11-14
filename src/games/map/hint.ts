/**
 * Map's explained hint: the firings of the three techniques its description
 * states, compiled, read off the player's own board.
 *
 * ## What a region can still be
 *
 * A blank region's colors are its dots when it has any, and all four when it
 * has none, less every color a neighbor already shows. That is the player's
 * reading of the board, not a notation laid on top of it: Map's dots mark what
 * a region *might* be (its help page), a region with none is simply unmarked,
 * and a neighbor's color is on the board for anyone to see. So the Easy rung
 * needs no dots at all, and the hint places them only where a Normal or Hard
 * deduction removes a color no neighbor shows (docs/hints.md § "The quality bar",
 * rule 6).
 *
 * That is the candidate walk's implicit reading, and it is Map's default. The
 * player may choose the populate reading instead (the `hint-notes`
 * preference), and then the plan opens with the Mark-all press, fill and clean
 * ({@link markAll}), after which every blank region is dotted and the same
 * rungs read the dots. Map plans without `runCandidatePlan` because that walk
 * indexes cells on a grid, and Map's elements are the regions of a graph.
 *
 * ## Why reading the dots is sound
 *
 * `findMistakes` flags a wrong color and a region whose dots leave out its
 * answer, and the hint refuses on either. So wherever this runs, every color on
 * the board is right and every dotted region's dots hold its answer: the
 * colors computed here contain the truth, and each rung is sound on any such
 * superset (docs/hints-candidates.md § "Deduce from the notes when the mistake check
 * vouches for them").
 *
 * ## The ladder is the tiers
 *
 * A plan offers the lowest rung that fires anywhere, and chooses within it by
 * the frontier. Map's tiers are exactly its rungs, so an Easy board's plan
 * never shows a pair and a Normal board's never shows a weighing: continuing from
 * the last step is worth something, but not a harder technique than the board
 * needs.
 */

import type { CandidateReading } from "../../engine/candidate-hint.ts";
import { popcount } from "../../engine/describe-runtime.ts";
import { describedEdgeHint, type Fired } from "../../engine/described-edge-hint.ts";
import { spokenOf, techniqueOf } from "../../engine/described-hint.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import type {
  CellMarks,
  Firing,
  Ladder,
  Said,
  Taken,
} from "../../engine/ladder-runtime.ts";
import { techniqueFirings } from "../../engine/ladder-runtime.ts";
import { type Conclusion, colorsOf, say } from "./hint-text.ts";
import * as map from "./map.compiled.ts";
import { dealtOf, gridOf, mapLadder, mapMarks } from "./solver.ts";
import type { MapMove, MapOp, MapState } from "./state.ts";

const ALL = 0xf;

/** One region's dots as a setup step leaves them. */
interface RegionDots {
  region: number;
  dots: number;
}

/** What a step acts on and what it wants done, per region. */
export interface MapHint {
  /** The region a deduction acts on; none for a setup step. A list because
   * the frontier and the cross-game guards read every step's `targets`. */
  targets: number[];
  /** The end state: the target's color or exactly its dots, or for a setup
   * step (the Mark-all press) each region's dots. */
  want: SingleWant | { regions: RegionDots[] };
}

/** A deduction's end state for its one target. */
type SingleWant = { color: number } | { dots: number };

/** Every rung a Map step can be: the two halves of the Mark-all press, by
 * `markAll`'s own names, and the kinds the description's techniques say. The
 * legs that dot a pair's or a weighing's premise share that firing's rung. */
export const MAP_RUNGS = ["fill", "clean", ...map.SAYS_KINDS] as const;
export type MapRung = (typeof MAP_RUNGS)[number];

export type MapHintStep = HintStep<MapMove, MapHint, MapRung>;

/** The working board: the player's colors and dots, advanced as the plan is
 * built, and which region borders which. */
interface Work {
  readonly state: MapState;
  readonly coloring: Int32Array;
  readonly pencil: Int32Array;
  readonly borders: readonly (readonly number[])[];
}

/** The colors region `r` of `w` can still take (see the file comment). */
function colorsLeft(w: Work, r: number): number {
  let p = w.pencil[r] || ALL;
  for (const k of w.borders[r]) if (w.coloring[k] >= 0) p &= ~(1 << w.coloring[k]);
  return p;
}

/** The board as the compiled techniques read it, a color one more than its
 * index there. */
function marksOf(w: Work): CellMarks {
  const m = mapMarks(w.coloring.length, gridOf(w.coloring));
  for (let r = 0; r < w.coloring.length; r++)
    m.cands[r] = (w.coloring[r] >= 0 ? 1 << w.coloring[r] : colorsLeft(w, r)) << 1;
  return m;
}

/** The ops taking region `r` from dots `from` to dots `to`, one toggle each. */
function dotOps(r: number, from: number, to: number): MapOp[] {
  return colorsOf(from ^ to).map((bit) => ({ op: "pencil", region: r, bit }));
}

// --- the Mark-all press -------------------------------------------------------

/**
 * What the Mark-all press does to a board: `fill` dots all four colors into
 * every blank region with no dots, and once none is left, `clean` removes from
 * each blank region the dots of colors a neighbor shows. Empty when there is
 * nothing to do, which makes the press no move.
 *
 * The fill is additive (`candidate-hint.ts`'s `adaptiveMarkAll` § "The
 * additive rule, stated once"): a region the player has dotted keeps its dots.
 * A clean that would empty a region keeps its lowest dot, as
 * `obviousCandidateMarks` does, so a board contradicting itself does not cycle
 * between the two.
 *
 * The hint's populate setup is this same press, so a player who presses the
 * button while the setup step is shown has done exactly what it asked.
 */
export function markAll(
  state: Pick<MapState, "map" | "coloring" | "pencil">,
): { kind: "fill" | "clean"; regions: RegionDots[] } | null {
  const { coloring, pencil } = state;
  const { graph, n } = state.map;
  const { borders } = dealtOf(graph, n);
  const fill: RegionDots[] = [];
  for (let r = 0; r < n; r++)
    if (coloring[r] < 0 && pencil[r] === 0) fill.push({ region: r, dots: ALL });
  if (fill.length > 0) return { kind: "fill", regions: fill };
  const clean: RegionDots[] = [];
  for (let r = 0; r < n; r++) {
    if (coloring[r] >= 0) continue;
    let shown = 0;
    for (const k of borders[r]) if (coloring[k] >= 0) shown |= 1 << coloring[k];
    let struck = pencil[r] & shown;
    if (struck === pencil[r]) struck &= struck - 1;
    if (struck) clean.push({ region: r, dots: pencil[r] & ~struck });
  }
  return clean.length > 0 ? { kind: "clean", regions: clean } : null;
}

/** The move taking each region of `regions` from the dots `pencil` shows to its
 * wanted dots. */
export function regionsMove(
  pencil: ArrayLike<number>,
  regions: readonly RegionDots[],
): MapMove {
  return {
    ops: regions.flatMap(({ region, dots }) => dotOps(region, pencil[region], dots)),
  };
}

/** The move that realizes `want` on region `r` whose dots are `dots`. */
function moveFor(r: number, dots: number, want: SingleWant): MapMove {
  return "color" in want
    ? { ops: [{ op: "color", region: r, color: want.color }] }
    : { ops: dotOps(r, dots, want.dots) };
}

/** Rule `struck` out of region `r`, as whichever move the board calls for. */
function narrowing(w: Work, r: number, struck: number): Conclusion {
  const left = colorsLeft(w, r) & ~struck;
  if (popcount(left) === 1) return { kind: "place", color: colorsOf(left)[0] };
  if (w.pencil[r]) return { kind: "strike", struck: w.pencil[r] & struck };
  return { kind: "mark", left };
}

function wantOf(w: Work, r: number, c: Conclusion): SingleWant {
  switch (c.kind) {
    case "place":
      return { color: c.color };
    case "strike":
      return { dots: w.pencil[r] & ~c.struck };
    case "mark":
      return { dots: c.left };
  }
}

/** Play `want` on the working board. */
function apply(w: Work, r: number, want: SingleWant): void {
  if ("color" in want) {
    w.coloring[r] = want.color;
    w.pencil[r] = 0;
  } else w.pencil[r] = want.dots;
}

/** What a firing's sentence is told: the words its leg's reading made. */
interface Marked {
  words: Sentence;
}

/** One leg of a firing: a step's move, highlights and words, built against the
 * working board as it stands when taken, so a later leg sees what an earlier
 * one decided. */
interface Leg {
  move: MapMove;
  highlights: MapHint;
  marked: Marked;
}

function leg(w: Work, r: number, want: SingleWant, words: Sentence): Leg {
  const made: Leg = {
    move: moveFor(r, w.pencil[r], want),
    highlights: { targets: [r], want },
    marked: { words },
  };
  apply(w, r, want);
  return made;
}

/** Legs ruling `struck` out of each of `targets`, skipping one an earlier leg
 * already settled. */
function narrowLegs(
  w: Work,
  targets: readonly number[],
  struck: number,
  speak: (k: number, c: Conclusion) => Sentence,
): Leg[] {
  const out: Leg[] = [];
  for (const k of targets) {
    if (w.coloring[k] >= 0 || !(colorsLeft(w, k) & struck)) continue;
    const c = narrowing(w, k, struck);
    out.push(leg(w, k, wantOf(w, k, c), speak(k, c)));
  }
  return out;
}

// --- the rungs --------------------------------------------------------------

/** What the walk carries: the working board, the ladder, and the weighings the
 * marks hold, by the middle region, color and ends they share. */
interface Walk {
  readonly w: Work;
  readonly ladder: Ladder;
  weighings: Map<string, number[]> | null;
}

/** What a firing of technique `K` said: its terms. */
type Terms<K extends keyof map.SaysById> = map.SaysById[K]["terms"];

/** The terms a firing of `K` recorded for its first fact. */
const termsOf = <K extends keyof map.SaysById>(f: Firing): Terms<K> =>
  (f.reasons[0] as Said<unknown, map.SaysById[K]>).says.terms;

/** The regions a firing strikes from, each once, in the order it strikes. */
function struckRegions(facts: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < facts.length; i += 3)
    if (!out.includes(facts[i + 1])) out.push(facts[i + 1]);
  return out;
}

const weighKey = ({ m, x, E }: Terms<"weigh">): string => `${m},${x},${E}`;

/**
 * A weighing strikes one region a firing, and the firings that share a middle
 * region, a color and their ends are one step's targets: the regions each
 * strikes, from the marks as the working board shows them.
 */
function weighingsOf(walk: Walk): Map<string, number[]> {
  if (walk.weighings === null) {
    const found = new Map<string, number[]>();
    for (const f of techniqueFirings(walk.ladder, "weigh", marksOf(walk.w))) {
      const key = weighKey(termsOf<"weigh">(f));
      const ks = found.get(key);
      if (ks) ks.push(f.facts[1]);
      else found.set(key, [f.facts[1]]);
    }
    walk.weighings = found;
  }
  return walk.weighings;
}

/** The regions a weighing firing strikes, with every other firing's that shares
 * its middle region, color and ends. */
const weighStruck = (walk: Walk, taken: Taken): number[] =>
  weighingsOf(walk).get(weighKey(spokenOf<map.WeighSays>(taken).says.terms)) ?? [
    taken.facts[1],
  ];

/** The neighbors of blank region `r` whose colors took something from what it
 * started with: all of its colored neighbors when it has no dots, and only the
 * ones matching a dot when it has. */
function citedBy(w: Work, r: number): number[] {
  const base = w.pencil[r] || ALL;
  return w.borders[r].filter((k) => w.coloring[k] >= 0 && base & (1 << w.coloring[k]));
}

/** The regions a firing's premise reads, which the walk continues from. */
function readsOf(taken: Taken, walk: Walk): number[] {
  switch (techniqueOf(taken)) {
    case "lone":
      // The neighbors that are the premise are read, but not outlined: their
      // fills are the evidence, and outlines around a small region's neighbors
      // swamp the region itself (owner playtest, 2026-09-25).
      return [taken.facts[1], ...citedBy(walk.w, taken.facts[1])];
    case "pair": {
      const { a, b } = spokenOf<map.PairSays>(taken).says.terms;
      return [a, b, ...struckRegions(taken.facts)];
    }
    default: {
      const { m, E } = spokenOf<map.WeighSays>(taken).says.terms;
      return [m, ...E, ...weighStruck(walk, taken)];
    }
  }
}

/** The regions a firing's legs write: the premise regions that are dotted, and
 * the ones struck from. */
function writesOf(taken: Taken, walk: Walk): number[] {
  switch (techniqueOf(taken)) {
    case "lone":
      return [taken.facts[1]];
    case "pair": {
      const { a, b } = spokenOf<map.PairSays>(taken).says.terms;
      return [...undotted(walk.w, [a, b]), ...struckRegions(taken.facts)];
    }
    default: {
      const { m, E } = spokenOf<map.WeighSays>(taken).says.terms;
      return [...undotted(walk.w, [m, ...E]), ...weighStruck(walk, taken)];
    }
  }
}

/** The regions of `regions` whose dots are not yet the colors they can be. */
const undotted = (w: Work, regions: readonly number[]): number[] =>
  regions.filter((r) => w.pencil[r] !== colorsLeft(w, r));

/** The legs of a firing, built against the working board as the firing found
 * it, which each leg then advances. */
function legsOf({
  taken,
  says,
  ctx,
}: Fired<map.SaysById[keyof map.SaysById], Walk>): Leg[] {
  const { w } = ctx;
  switch (techniqueOf(taken)) {
    case "lone": {
      const r = taken.facts[1];
      const color = taken.facts[2] - 1;
      const dots = w.pencil[r];
      let others = 0;
      for (const k of citedBy(w, r)) others |= 1 << w.coloring[k];
      const words =
        dots === 0
          ? say.touchesTheRest(r, color, others)
          : others === 0
            ? say.lastDot(r, color)
            : say.deadDots(r, color);
      return [leg(w, r, { color }, words)];
    }
    case "pair": {
      const { a, b, colors } = says.terms as Terms<"pair">;
      const v = colors >> 1;
      const pair = [{ region: a }, { region: b }];
      return [
        ...premiseDots(w, [a, b]),
        ...narrowLegs(w, struckRegions(taken.facts), v, (k, c) =>
          say.pair(k, pair, v, c),
        ),
      ];
    }
    default: {
      const { m, x, E, self } = says.terms as Terms<"weigh">;
      return [
        ...premiseDots(w, [m, ...E]),
        ...narrowLegs(w, weighStruck(ctx, taken), 1 << (x - 1), (k, c) =>
          say.weigh(
            k,
            { region: m },
            E.map((region) => ({ region })),
            x - 1,
            self,
            c,
          ),
        ),
      ];
    }
  }
}

/**
 * Before a pair or a weighing is stated, each region its premise rests on
 * shows its colors as dots, one leg per region that does not already. "Can
 * only be yellow or teal" is then on the board rather than a sum the player
 * has to work out from the neighbors and hold while following the deduction
 * (owner playtests, 2026-09-25, a chain first and then a pair). It is the
 * notation a player solving alone would make, and the deduction's step then
 * reads straight off it.
 */
function premiseDots(w: Work, regions: readonly number[]): Leg[] {
  const out: Leg[] = [];
  for (const r of regions) {
    const two = colorsLeft(w, r);
    if (w.pencil[r] === two) continue;
    let touched = 0;
    for (const k of w.borders[r]) if (w.coloring[k] >= 0) touched |= 1 << w.coloring[k];
    const said =
      w.pencil[r] === 0 ? say.premiseDot(r, touched, two) : say.premiseTrim(r, two);
    out.push(leg(w, r, { dots: two }, said));
  }
  return out;
}

/**
 * The populate reading's opening: the Mark-all press, fill then clean, as one
 * journey, each half only when the board needs it. After it every blank region
 * shows its colors as dots and the rungs run exactly as they do on a board the
 * player dotted by hand.
 */
function setUp(w: Work, steps: MapHintStep[]): void {
  for (let first = true; ; first = false) {
    const press = markAll({ map: w.state.map, coloring: w.coloring, pencil: w.pencil });
    if (!press) return;
    const clean = press.kind === "clean";
    const words = clean ? say.cleanNeighbors : say.fillAll;
    steps.push({
      move: regionsMove(w.pencil, press.regions),
      rung: press.kind,
      explanation: words.text,
      words,
      // Rings nothing: a clean strikes from nearly every blank region, and a
      // band around each ran together into one mark over the whole board
      // (browser check, 2026-09-25). The sentence names every blank region.
      highlights: { targets: [], want: { regions: press.regions } },
      continuesPrevious: !first,
    });
    for (const { region, dots } of press.regions) w.pencil[region] = dots;
    if (clean) return;
  }
}

/** The working board of `state`. */
function workOf(state: MapState): Work {
  return {
    state,
    coloring: Int32Array.from(state.coloring),
    pencil: Int32Array.from(state.pencil),
    borders: dealtOf(state.map.graph, state.map.n).borders,
  };
}

/**
 * The deduction, walked by the engine one firing a step. A region's colors are
 * its dots and what its neighbors show (see the file comment), which the marks
 * are not left to carry: before every firing they are brought down to the
 * working board, which the legs of the steps so far have advanced.
 */
const deduction = describedEdgeHint<
  MapState,
  MapMove,
  MapHint,
  Marked,
  Walk,
  map.SaysById,
  MapRung
>({
  name: "map hint plan",
  walk: (state) => {
    const w = workOf(state);
    const ladder = mapLadder(dealtOf(state.map.graph, state.map.n));
    return {
      marks: marksOf(w),
      entries: ladder.entries.filter((e) =>
        (map.SAYS_KINDS as readonly string[]).includes(e.id),
      ),
      ctx: { w, ladder, weighings: null },
    };
  },
  // Map's tiers are its rungs: the walk offers the lowest that fires.
  tiers: { lowest: () => map.tiers.length - 1, count: map.tiers.length },
  done: (_m, { w }) => !w.coloring.includes(-1),
  settle: (m, walk) => {
    const left = marksOf(walk.w);
    for (let r = 0; r < m.cands.length; r++) {
      for (let d = 1; d <= 4; d++) if (m.has(r, d) && !left.has(r, d)) m.strikeAt(r, d);
      // A leg that colored a region the firing only narrowed.
      if (m.grid[r] === 0 && left.grid[r] !== 0) m.place(r, left.grid[r]);
    }
    walk.weighings = null;
    return true;
  },
  reads: readsOf,
  writes: writesOf,
  step: (fired) => legsOf(fired),
  // Every technique's words are its legs', made in `legsOf`.
  say: (_spoken, { words }) => words,
});

/** The whole plan from `state`'s board, opening with the Mark-all press where
 * the player reads dots that way: a refusal where deduction has run out and
 * the board needs no press. */
export function mapHint(
  state: MapState,
  reading: CandidateReading,
): HintResult<MapMove, MapHint, MapRung> {
  const w = workOf(state);
  const steps: MapHintStep[] = [];
  if (reading === "populate") setUp(w, steps);
  const got = deduction({ ...state, pencil: w.pencil });
  if (got.ok) return { ok: true, steps: [...steps, ...got.steps] };
  return steps.length > 0 ? { ok: true, steps } : got;
}

/** The dots a step wants, per region, or `null` for a placement. */
function wantedDots(hl: MapHint): readonly RegionDots[] | null {
  const { want } = hl;
  if ("color" in want) return null;
  return "regions" in want
    ? want.regions
    : [{ region: hl.targets[0], dots: want.dots }];
}

/** Classify a player move against the displayed step, on the board it is about
 * to change. */
export function hintKeepTrack(
  m: MapMove,
  step: MapHintStep,
  state: MapState,
): HintTrackVerdict {
  const hl = step.highlights as MapHint;
  const wanted = wantedDots(hl);
  if (!wanted) {
    const r = hl.targets[0];
    const { color } = hl.want as { color: number };
    return m.ops.length === 1 &&
      m.ops[0].op === "color" &&
      m.ops[0].region === r &&
      m.ops[0].color === color
      ? "completed"
      : "off";
  }
  // Dots: every toggle must move its region toward the wanted set.
  const goal = new Map(wanted.map(({ region, dots }) => [region, dots]));
  const now = new Map(wanted.map(({ region }) => [region, state.pencil[region]]));
  for (const op of m.ops) {
    const want = goal.get(op.region);
    const dots = now.get(op.region);
    if (op.op !== "pencil" || want === undefined || dots === undefined) return "off";
    if (!((dots ^ want) & (1 << op.bit))) return "off";
    now.set(op.region, dots ^ (1 << op.bit));
  }
  for (const [region, want] of goal)
    if (state.coloring[region] < 0 && now.get(region) !== want) return "onTrack";
  return "completed";
}

/** Rebuild a stored step's move against the board it is about to be shown on,
 * or drop it once the board already shows what it wants. A step the board has
 * not moved under comes back as itself. */
export function refreshHintStep(
  step: MapHintStep,
  state: MapState,
): MapHintStep | null {
  const hl = step.highlights as MapHint;
  const wanted = wantedDots(hl);
  if (!wanted) return state.coloring[hl.targets[0]] >= 0 ? null : step;
  const left = wanted.filter(
    ({ region, dots }) => state.coloring[region] < 0 && state.pencil[region] !== dots,
  );
  if (left.length === 0) return null;
  const move = regionsMove(state.pencil, left);
  if (sameOps(move.ops, step.move.ops)) return step;
  if (!("regions" in hl.want)) return { ...step, move };
  return { ...step, move, highlights: { ...hl, want: { regions: left } } };
}

export function sameOps(a: readonly MapOp[], b: readonly MapOp[]): boolean {
  return (
    a.length === b.length &&
    a.every((op, i) => JSON.stringify(op) === JSON.stringify(b[i]))
  );
}
