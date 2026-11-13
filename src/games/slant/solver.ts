/**
 * Slant's solver: the ladder `slant.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), with the reason
 * each technique records for the hint; and the answer check its rules compile
 * to.
 *
 * One ladder serves the generator, which keeps a removed number only while
 * the board still solves, so its verdict on every intermediate board decides
 * which puzzles exist; `solve()`; `findMistakes`; the difficulty; and the
 * hint, which walks it. No technique supposes anything, so a board the ladder
 * fills is uniquely solved, at either tier.
 */
import {
  clueList,
  describedSpace,
  type GridSpace,
  type Reads,
  rangeMask,
  slash,
} from "../../engine/describe-runtime.ts";
import { FactGraph } from "../../engine/fact-graph.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  runLadder,
  type Taken,
  TIERS,
  uncluedPlacingRung,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import * as slant from "./slant.compiled.ts";
import { ALIKE_DOWN, ALIKE_RIGHT, DIFF_HARD, type Slash } from "./state.ts";

/** Solver verdicts (upstream's 0 / 1 / 2 return codes). */
export const SOLVE_IMPOSSIBLE = 0;
export const SOLVE_UNIQUE = 1;
export const SOLVE_NOT_CONVERGED = 2;
export type SolveVerdict =
  | typeof SOLVE_IMPOSSIBLE
  | typeof SOLVE_UNIQUE
  | typeof SOLVE_NOT_CONVERGED;

/** A diagonal as the description numbers it: 1 from above left to below
 * right, 2 from above right to below left. */
const BACK = 1;
const FORWARD = 2;
/** What an edge's mark starts with, every way two squares can meet, and the
 * mark of two squares slanting alike. */
const VEES = rangeMask(1, 3);
const ALIKE = 1 << 3;

/** A diagonal as the description numbers it, from the game's −1 and 1. */
const describedOf = (s: number): number => (s < 0 ? BACK : s > 0 ? FORWARD : 0);
const slashOf = (v: number): Slash => (v === BACK ? -1 : v === FORWARD ? 1 : 0);

/** The board as the description deals it: a number at each point that has
 * one. */
function dealtOf(clues: Int8Array): slant.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  clues.forEach((c, k) => {
    if (c >= 0) {
      at.push(k);
      v.push(c);
    }
  });
  return { n: clueList(at, v, clues.length) };
}

/**
 * Why one firing of Slant's ladder holds, built from its binding on the
 * marks it read.
 */
type SlantReason =
  /** The number at point `k` decides its open squares, counting the squares
   * `pair`, slanting alike, as one line where there are two. */
  | { kind: "clue"; k: number; pair: readonly [number, number] | null }
  /** The number at `k` needs one line from two open squares beside each
   * other, its other open squares the alike `pair` or none. */
  | { kind: "share"; k: number; pair: readonly [number, number] | null }
  | { kind: "loop" }
  | { kind: "deadEnd" }
  /** The square slants as the square `anchor`, which has its diagonal. */
  | { kind: "same"; anchor: number }
  /** A 1 or a 3 at `k` rules out the v-shape. */
  | { kind: "number"; k: number; c: number }
  /** The v-shape is ruled out across the 2 at `k`, because the pair across
   * it, edge `from`, cannot meet as `value`. */
  | { kind: "two"; k: number; from: number; value: number };

/** The ladder over the dealt numbers, each technique with its reason. */
function slantLadder(dl: slant.Dealt): Ladder {
  return describedLadder(slant, {
    clue: compiledRung(
      slant.clue,
      dl,
      ({ k }): SlantReason => ({
        kind: "clue",
        k,
        pair: null,
      }),
    ),
    pair: compiledRung(
      slant.pair,
      dl,
      ({ k, a, b }): SlantReason => ({
        kind: "clue",
        k,
        pair: [b, a],
      }),
    ),
    share: compiledRung(
      slant.share,
      dl,
      ({ k, R }): SlantReason => ({
        kind: "share",
        k,
        pair: R.length === 2 ? [R[0], R[1]] : null,
      }),
    ),
    loop: uncluedRung(slant.loop, (): SlantReason => ({ kind: "loop" })),
    deadEnd: compiledRung(slant.deadEnd, dl, (): SlantReason => ({ kind: "deadEnd" })),
    same: uncluedRung(
      slant.same,
      ({ q }): SlantReason => ({ kind: "same", anchor: q }),
    ),
    drawn: uncluedPlacingRung(slant.drawn),
    one: compiledRung(
      slant.one,
      dl,
      ({ k }): SlantReason => ({
        kind: "number",
        k,
        c: 1,
      }),
    ),
    three: compiledRung(
      slant.three,
      dl,
      ({ k }): SlantReason => ({
        kind: "number",
        k,
        c: 3,
      }),
    ),
    two: compiledRung(
      slant.two,
      dl,
      ({ k, f, i, j }, _e, n): SlantReason => ({
        kind: "two",
        k,
        from: f,
        // The pair across meets at the 2 only where this one meets away from
        // it, and away only where this one meets at it.
        value: n === i ? 3 - j : j,
      }),
    ),
  });
}

/** The marks over `grid`, a value a square and 0 for none, each pair able to
 * meet every way but those `alike` marks as slanting alike. */
function marksOf(
  sp: GridSpace,
  grid: Uint8Array,
  ladder: Ladder,
  alike: Uint8Array | null,
  graph: FactGraph | null = null,
): CellMarks {
  const m = new CellMarks(sp, rangeMask(1, 2), grid);
  m.placing = ladder.placing;
  m.striking = ladder.striking;
  // A diagonal given strikes v-shapes as it is seeded: a hint keeps those.
  if (graph !== null) m.graph = graph;
  // A diagonal seeded strikes the v-shapes it rules out (`drawn`).
  m.edgeCands.fill(VEES);
  m.seed(grid);
  if (alike !== null) {
    const { w } = sp;
    alike.forEach((bits, i) => {
      if (bits & ALIKE_RIGHT) m.edgeCands[sp.edgeOf(i, i + 1)] = ALIKE;
      if (bits & ALIKE_DOWN) m.edgeCands[sp.edgeOf(i, i + w)] = ALIKE;
    });
  }
  return m;
}

/**
 * Solve `clues` by the ladder up to `cap`, writing the diagonals it draws
 * into `soln` (−1 `\`, 1 `/`, 0 none), and say whether it filled the board
 * with an answer.
 */
export function slantSolve(
  w: number,
  h: number,
  clues: Int8Array,
  soln: Int8Array,
  cap: number,
): SolveVerdict {
  const dl = dealtOf(clues);
  const ladder = slantLadder(dl);
  const sp = describedSpace(slant.units, w, h);
  const grid = new Uint8Array(w * h);
  const m = marksOf(sp, grid, ladder, null);
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {}),
  );
  for (let i = 0; i < grid.length; i++) soln[i] = slashOf(grid[i]);
  if (impossible) return SOLVE_IMPOSSIBLE;
  if (grid.includes(0)) return SOLVE_NOT_CONVERGED;
  return slant.isAnswer(grid, sp, dl) ? SOLVE_UNIQUE : SOLVE_IMPOSSIBLE;
}

/** Solve a board's clues from scratch at the top tier, as `solve()` and
 * `findMistakes` need. */
export function solveFromClues(
  w: number,
  h: number,
  clues: Int8Array,
): { soln: Int8Array } | { error: "impossible" | "ambiguous" } {
  const soln = new Int8Array(w * h);
  const ret = slantSolve(w, h, clues, soln, DIFF_HARD);
  if (ret === SOLVE_UNIQUE) return { soln };
  return { error: ret === SOLVE_IMPOSSIBLE ? "impossible" : "ambiguous" };
}

// --- the hint's plan --------------------------------------------------------

/** The hint's techniques that draw a diagonal. */
export type SlantTechnique = "clue-fill" | "clue-empty" | "loop" | "deadend" | "equiv";

/** One square placed by a firing. */
export interface SlantPlacement {
  x: number;
  y: number;
  v: Slash;
}

/** A firing that draws diagonals, as the hint narrates it. */
export interface SlantFiring {
  technique: SlantTechnique;
  /** Its place in the walk's graph. */
  id: number;
  /** The squares this one firing forces (1, or up to 4 for a clue), round
   * a clue in the order upstream went round it. */
  moves: SlantPlacement[];
  /** Driving clue point and value (clue-fill / clue-empty). */
  clue?: { x: number; y: number; c: number };
  /** Two squares round the clue that slant alike, counted as one line. */
  pair?: [number, number];
  /** The board just after this firing, so its evidence is read from the
   * board it fired on rather than the one the step is shown on. */
  grid: Int8Array;
}

/**
 * Why one v-shape of a pair was ruled out: a diagonal already in the pair, a
 * 1 or 3 clue at a corner the pair shares, or the same v-shape ruled out on
 * the far side of a 2 (`from` is that square's bit, as `sq * 4 + bit`).
 */
export type VWhy =
  | { kind: "slash"; sq: number }
  | { kind: "clue"; pt: number; c: number }
  | { kind: "two"; pt: number; from: number };

/**
 * Why two adjacent squares slant alike: a clue with one line left and only
 * these two open squares around it (`pair` is a same-slant pair the clue
 * counted as one line), or both of the pair's v-shapes ruled out. A pair the
 * player marked is no merge: nothing made it.
 */
export type MergeWhy =
  | { kind: "clue"; pt: number; c: number; pair: [number, number] | null }
  | { kind: "vshape" };

/** One same-slant merge, between two edge-adjacent squares. */
export interface SlantMerge {
  a: number;
  b: number;
  why: MergeWhy;
}

/** What a firing cites of the same-slant marks: the edges of the path of
 * pairs joining two squares it needs alike, and the square with a diagonal
 * that path ends at, where the firing takes its diagonal from one. */
export interface SlantCites {
  path: readonly number[];
  anchor: number | null;
}

/**
 * The hint's walk: every firing that draws a diagonal, in order, and the
 * facts the walk made with what the hint says of them. The walk's graph
 * (`engine/fact-graph.ts`) holds which fact rests on which; what only Slant
 * knows is kept beside it by fact or firing.
 */
export interface SlantPlan {
  firings: SlantFiring[];
  graph: FactGraph;
  /** The merge a fact made, by that fact: the strike that left its pair
   * slanting alike, which is the note a step may place. */
  merges: ReadonlyMap<number, SlantMerge>;
  /** What each firing cites, by its place in the graph. */
  cites: ReadonlyMap<number, SlantCites>;
  /** Why the v-shape `sq * 4 + bit` is ruled out, as the walk stood after
   * fact `at`, where a fact's own firing ruled it out; `null` where only the
   * pair itself, marked alike, does. */
  vWhy(key: number, at: number): VWhy | null;
  /** The two squares of a pair, by its edge. */
  ends(e: number): readonly [number, number];
}

/** The bit of edge `e`'s first square for its mark's value `n`, 1 at the
 * first end of their side and 2 at its second. */
function bitOf(sp: GridSpace, e: number, n: number): number {
  const a = sp.edgeEnds[2 * e];
  const across = sp.edgeEnds[2 * e + 1] === a + 1;
  return a * 4 + (across ? (n === 1 ? 1 : 0) : n === 1 ? 3 : 2);
}

/** The edge and the mark's value that `bitOf` made `key` from. */
function edgeOfBit(sp: GridSpace, key: number): { e: number; n: number } {
  const a = key >> 2;
  const bit = key & 3;
  const across = bit < 2;
  return {
    e: sp.edgeOf(a, across ? a + 1 : a + sp.w),
    n: bit === 1 || bit === 3 ? 1 : 2,
  };
}

/** The squares round point `k` in the order upstream goes round it: above
 * left, below left, below right, above right. */
function roundOf(sp: GridSpace, k: number): number[] {
  const W = sp.w + 1;
  const px = k % W;
  const py = (k / W) | 0;
  const out: number[] = [];
  for (const [x, y] of [
    [px - 1, py - 1],
    [px - 1, py],
    [px, py],
    [px, py - 1],
  ])
    if (x >= 0 && y >= 0 && x < sp.w && y < sp.h) out.push(y * sp.w + x);
  return out;
}

/** The highest tier the ladder grades: Normal. */
const NORMAL = DIFF_HARD;

/**
 * The edges joining `from` to the nearest square `goal` accepts, through the
 * pairs `order` holds slanting alike; shortest first, ties by the order the
 * pairs became alike. `null` where there is none.
 */
function linkPath(
  sp: GridSpace,
  order: readonly number[],
  from: number,
  goal: (sq: number) => boolean,
): { path: number[]; end: number } | null {
  const adj = new Map<number, { to: number; e: number }[]>();
  for (const e of order) {
    const a = sp.edgeEnds[2 * e];
    const b = sp.edgeEnds[2 * e + 1];
    for (const [u, v] of [
      [a, b],
      [b, a],
    ]) {
      const list = adj.get(u) ?? [];
      list.push({ to: v, e });
      adj.set(u, list);
    }
  }
  const prev = new Map<number, { from: number; e: number } | null>([[from, null]]);
  const queue = [from];
  for (let qi = 0; qi < queue.length; qi++) {
    const u = queue[qi];
    if (u !== from && goal(u)) {
      const path: number[] = [];
      for (let p = prev.get(u); p; p = prev.get(p.from)) path.push(p.e);
      return { path, end: u };
    }
    for (const x of adj.get(u) ?? []) {
      if (prev.has(x.to)) continue;
      prev.set(x.to, { from: u, e: x.e });
      queue.push(x.to);
    }
  }
  return null;
}

/**
 * The ladder walked from the player's diagonals and same-slant marks, one
 * firing at a time (`ladderWalk`): every firing that draws a diagonal, in
 * order, and why each same-slant fact it rests on holds. A firing that only
 * narrows a pair's v-shapes, or marks a pair alike, is no step of its own:
 * the hint places a mark where a later step cites it.
 */
export function deduceHintPlan(
  w: number,
  h: number,
  clues: Int8Array,
  soln: Int8Array,
  alike: Uint8Array,
): SlantPlan {
  const dl = dealtOf(clues);
  const ladder = slantLadder(dl);
  const sp = describedSpace(slant.units, w, h);
  const grid = Uint8Array.from(soln, describedOf);
  // What the player's marks say alone, to tell what a diagonal rules out.
  const marked = marksOf(sp, new Uint8Array(w * h), ladder, alike).edgeCands;
  const graph = new FactGraph();
  const m = marksOf(sp, grid, ladder, alike, graph);
  m.budget = stepBudget("slant hint");
  const initial = grid.slice();
  /** The board each firing of the graph was made on, by its place. */
  const boardOf: Uint8Array[] = [];
  let board = initial;
  let stamped = 0;
  const stamp = (): void => {
    const last = graph.facts.at(-1);
    for (; last !== undefined && stamped <= last.firing; stamped++)
      boardOf[stamped] = board;
  };
  stamp();
  const reasonOf = new Map<number, SlantReason>();
  const ends = (e: number): [number, number] => [
    sp.edgeEnds[2 * e],
    sp.edgeEnds[2 * e + 1],
  ];

  /** A diagonal on `b` in a square of edge `e`'s pair that misses the
   * corner v-shape `n` meets at. */
  const slashWhy = (e: number, n: number, b: Uint8Array): VWhy | null => {
    const pair = ends(e);
    const side = sp.cellPoints[pair[0]].filter((k) =>
      sp.cellPoints[pair[1]].includes(k),
    );
    const sq = pair.find((c) => b[c] !== 0 && b[c] !== slash(sp, c, side[n - 1]));
    return sq === undefined ? null : { kind: "slash", sq };
  };
  /** Why v-shape `key` was ruled out by a fact before `limit`, a diagonal
   * read on `at` where no number's reason says. */
  const strikeWhy = (key: number, limit: number, at: Uint8Array): VWhy | null => {
    const { e, n } = edgeOfBit(sp, key);
    const f = graph.factsAbout("edges", e).find((q) => q.id < limit && q.value === n);
    let why: VWhy | null = null;
    if (f !== undefined) {
      const r = reasonOf.get(f.id);
      if (r === undefined) why = slashWhy(e, n, boardOf[f.firing]);
      else if (r.kind === "number") why = { kind: "clue", pt: r.k, c: r.c };
      else if (r.kind === "two") {
        const from = bitOf(sp, r.from, r.value);
        if (strikeWhy(from, f.id, boardOf[f.firing]) !== null)
          why = { kind: "two", pt: r.k, from };
      }
    }
    return why ?? slashWhy(e, n, initial) ?? slashWhy(e, n, at);
  };

  // The pairs slanting alike, in the order they became so, which breaks the
  // ties of a path.
  const order: number[] = [];
  const known = new Set<number>();
  const merges = new Map<number, SlantMerge>();
  /** The fact that left edge `e`, which held `mask`, slanting alike, among
   * those made from fact `from` on. */
  const completing = (e: number, mask: number, from: number): number => {
    for (const f of graph.factsAbout("edges", e)) {
      if (f.id < from) continue;
      mask &= ~(1 << f.value);
      if (mask === ALIKE) return f.id;
    }
    throw new Error("slant hint: a pair left alike by no fact");
  };
  const mergeOf = (e: number, fact: number): SlantMerge => {
    const r = reasonOf.get(fact);
    const [a, b] = ends(e);
    if (r?.kind === "share")
      return {
        a,
        b,
        why: { kind: "clue", pt: r.k, c: clues[r.k], pair: pairOf(r.pair) },
      };
    if (r?.kind === "two") {
      // Across a 2 from a pair no v-shape rules out, which the player or a
      // number marked alike: the 2 has its one line from them, and needs one
      // from these.
      const fact0 = graph.facts[fact];
      if (
        strikeWhy(bitOf(sp, r.from, r.value), fact0.id, boardOf[fact0.firing]) === null
      )
        return {
          a,
          b,
          why: { kind: "clue", pt: r.k, c: 2, pair: ends(r.from) },
        };
    }
    return { a, b, why: { kind: "vshape" } };
  };
  // The pairs a given diagonal leaves alike come first, then the player's.
  const seeded: number[] = [];
  const marks: number[] = [];
  for (const e of sp.edges)
    if (m.edgeCands[e] === ALIKE) (marked[e] !== ALIKE ? seeded : marks).push(e);
  for (const e of seeded) {
    const fact = completing(e, marked[e], 0);
    merges.set(fact, mergeOf(e, fact));
  }
  for (const e of [...seeded, ...marks]) {
    order.push(e);
    known.add(e);
  }

  // What a firing rests on, with the squares it fills: the squares round
  // the number it reads, the squares slanting alike with the one it decides,
  // or the squares round that one, whose diagonals close the loop or the
  // dead end. A player works round the diagonals just drawn.
  const reads = ({ facts, reasons }: Taken): number[] => {
    const out: number[] = [];
    for (let i = 0; i < facts.length; i += 3) {
      const c = facts[i + 1];
      const r = reasons[i / 3] as SlantReason;
      if (r.kind === "clue" || r.kind === "share" || r.kind === "number")
        out.push(...sp.pointCells[r.k]);
      else if (r.kind === "two") out.push(...sp.pointCells[r.k]);
      else if (r.kind === "same") out.push(r.anchor);
      if (r.kind === "two" || r.kind === "number") continue;
      out.push(c);
      if (r.kind === "loop" || r.kind === "deadEnd") out.push(...sp.adj8[c]);
    }
    return out;
  };
  // What a firing cites is one path of pairs, which a player can follow, and
  // not every pair the formula read (`alike` reads them all): the pairs
  // joining the squares it needs alike, and the square it takes its
  // diagonal from.
  const cites = new Map<number, SlantCites>();
  const pending: { cites: SlantCites | null } = { cites: null };
  const cite = (f: Taken): Reads | null => {
    const r = f.reasons[0] as SlantReason;
    let link: { path: number[]; end: number } | null = null;
    if (r.kind === "same") {
      link = linkPath(sp, order, f.facts[1], (sq) => grid[sq] !== 0);
      if (link === null) throw new Error("slant hint: an equivalence with no path");
    } else if ((r.kind === "clue" || r.kind === "share") && r.pair !== null) {
      const [a, b] = r.pair;
      link = linkPath(sp, order, a, (sq) => sq === b);
      if (link === null) throw new Error("slant hint: a pair with no path");
    } else if (r.kind === "two") {
      // The pair across a 2 that the player or a number marked alike.
      const open = (f.reasons as SlantReason[]).some(
        (q) =>
          q.kind === "two" &&
          strikeWhy(bitOf(sp, q.from, q.value), graph.facts.length, grid) === null,
      );
      if (open) {
        const [a, b] = ends(r.from);
        link = linkPath(sp, order, a, (sq) => sq === b);
      }
    }
    if (link === null) return null;
    const anchor = r.kind === "same" ? link.end : null;
    pending.cites = { path: link.path, anchor };
    return { cells: anchor === null ? [] : [anchor], edges: link.path };
  };
  const walk = ladderWalk(m, ladder.entries, { [TIERS]: NORMAL }, reads, {
    citing: cite,
  });
  const firings: SlantFiring[] = [];
  for (;;) {
    const before = Int32Array.from(m.edgeCands);
    const first = graph.facts.length;
    pending.cites = null;
    const taken = walk.next();
    if (taken === null || taken === "contradiction") break;
    const { facts, reasons } = taken;
    const id = graph.facts[first].firing;
    for (let i = 0; i < reasons.length; i++)
      reasonOf.set(first + i, reasons[i] as SlantReason);
    const placed = new Map<number, number>();
    for (let i = 0; i < facts.length; i += 3)
      if (facts[i] === 1) placed.set(facts[i + 1], facts[i + 2]);
    if (placed.size > 0) {
      board = grid.slice();
      firings.push({
        ...firingOf(
          sp,
          clues,
          reasons[0] as SlantReason,
          placed,
          Int8Array.from(grid, slashOf),
        ),
        id,
      });
    }
    stamp();
    if (pending.cites !== null) cites.set(id, pending.cites);
    for (const e of sp.edges) {
      if (m.edgeCands[e] !== ALIKE || known.has(e)) continue;
      known.add(e);
      order.push(e);
      const fact = completing(e, before[e], first);
      merges.set(fact, mergeOf(e, fact));
    }
  }
  return {
    firings,
    graph,
    merges,
    cites,
    vWhy: (key, at) => strikeWhy(key, at + 1, boardOf[graph.facts[at].firing]),
    ends,
  };
}

const pairOf = (p: readonly [number, number] | null): [number, number] | null =>
  p === null ? null : [p[0], p[1]];

/** A firing that draws diagonals, as the hint narrates it. */
function firingOf(
  sp: GridSpace,
  clues: Int8Array,
  r: SlantReason,
  placed: ReadonlyMap<number, number>,
  grid: Int8Array,
): Omit<SlantFiring, "id"> {
  const { w } = sp;
  const W = w + 1;
  const move = (c: number): SlantPlacement => ({
    x: c % w,
    y: (c / w) | 0,
    v: slashOf(placed.get(c) ?? 0),
  });
  if (r.kind === "clue") {
    const order = roundOf(sp, r.k).filter((c) => placed.has(c));
    const touches = order.some((c) => placed.get(c) === slash(sp, c, r.k));
    return {
      technique: touches ? "clue-fill" : "clue-empty",
      moves: order.map(move),
      clue: { x: r.k % W, y: (r.k / W) | 0, c: clues[r.k] },
      ...(r.pair === null ? {} : { pair: [r.pair[0], r.pair[1]] as [number, number] }),
      grid,
    };
  }
  const technique: SlantTechnique =
    r.kind === "loop" ? "loop" : r.kind === "deadEnd" ? "deadend" : "equiv";
  if (r.kind !== "loop" && r.kind !== "deadEnd" && r.kind !== "same")
    throw new Error(`slant hint: ${r.kind} draws no diagonal`);
  return { technique, moves: [...placed.keys()].map(move), grid };
}
