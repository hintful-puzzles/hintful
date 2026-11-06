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
  rangeMask,
  slash,
} from "../../engine/describe-runtime.ts";
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
): CellMarks {
  const m = new CellMarks(sp, rangeMask(1, 2), grid);
  m.placing = ladder.placing;
  m.striking = ladder.striking;
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
 * counted as one line), both of the pair's v-shapes ruled out, or the
 * player's own mark.
 */
export type MergeWhy =
  | { kind: "clue"; pt: number; c: number; pair: [number, number] | null }
  | { kind: "vshape" }
  | { kind: "note" };

/** One same-slant merge, between two edge-adjacent squares. */
export interface SlantMerge {
  a: number;
  b: number;
  why: MergeWhy;
  /** The number of firings recorded before it. */
  tick: number;
}

/** Why each same-slant fact holds, which the hint cites. */
export class SlantTrace {
  /** Per `sq * 4 + bit`, why that v-shape was ruled out: bit 0 a pair with
   * the square to the right meeting below, 1 above; bit 2 a pair with the
   * square below meeting right, 3 left. */
  readonly vWhy: (VWhy | null)[];
  readonly merges: SlantMerge[] = [];
  tick = 0;
  constructor(w: number, h: number) {
    this.vWhy = new Array<VWhy | null>(w * h * 4).fill(null);
  }
}

/** The bit of edge `e`'s first square for its mark's value `n`, 1 at the
 * first end of their side and 2 at its second. */
function bitOf(sp: GridSpace, e: number, n: number): number {
  const a = sp.edgeEnds[2 * e];
  const across = sp.edgeEnds[2 * e + 1] === a + 1;
  return a * 4 + (across ? (n === 1 ? 1 : 0) : n === 1 ? 3 : 2);
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
): { firings: SlantFiring[]; trace: SlantTrace } {
  const dl = dealtOf(clues);
  const ladder = slantLadder(dl);
  const sp = describedSpace(slant.units, w, h);
  const grid = Uint8Array.from(soln, describedOf);
  const m = marksOf(sp, grid, ladder, alike);
  m.budget = stepBudget("slant hint");
  const trace = new SlantTrace(w, h);
  // What the player's diagonals rule out, past what their marks say.
  const marked = marksOf(sp, new Uint8Array(w * h), ladder, alike).edgeCands;
  drawnWhy(sp, trace, grid, marked, m.edgeCands);
  for (const e of sp.edges)
    if (m.edgeCands[e] === ALIKE)
      trace.merges.push({
        a: sp.edgeEnds[2 * e],
        b: sp.edgeEnds[2 * e + 1],
        why: { kind: "note" },
        tick: 0,
      });
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
  const walk = ladderWalk(m, ladder.entries, { [TIERS]: NORMAL }, reads);
  const firings: SlantFiring[] = [];
  for (;;) {
    const before = Int32Array.from(m.edgeCands);
    const taken = walk.next();
    if (taken === null || taken === "contradiction") break;
    const { facts, reasons } = taken;
    const r0 = reasons[0] as SlantReason;
    const placed = new Map<number, number>();
    for (let i = 0; i < facts.length; i += 3)
      if (facts[i] === 1) placed.set(facts[i + 1], facts[i + 2]);
    if (placed.size > 0) {
      firings.push(firingOf(sp, clues, r0, placed, Int8Array.from(grid, slashOf)));
      drawnWhy(sp, trace, grid, before, m.edgeCands);
      trace.tick++;
      continue;
    }
    // A pair's mark narrowed: why each v-shape is ruled out, and the pairs
    // it leaves slanting alike.
    for (let i = 0; i < facts.length; i += 3) {
      const e = facts[i + 1];
      const r = reasons[i / 3] as SlantReason;
      if (before[e] === m.edgeCands[e]) continue;
      if (r.kind === "share") {
        if (m.edgeCands[e] === ALIKE && before[e] !== ALIKE)
          trace.merges.push({
            a: sp.edgeEnds[2 * e],
            b: sp.edgeEnds[2 * e + 1],
            why: { kind: "clue", pt: r.k, c: clues[r.k], pair: pairOf(r.pair) },
            tick: trace.tick,
          });
        before[e] = m.edgeCands[e];
        continue;
      }
      const why = vWhyOf(sp, r, trace, grid);
      if (why === null) {
        // Across a 2 from a pair slanting alike, which no v-shape says: the
        // 2 has its one line from them, and needs one from these.
        if (r.kind !== "two") throw new Error("slant hint: a v-shape with no reason");
        if (m.edgeCands[e] === ALIKE && before[e] !== ALIKE)
          trace.merges.push({
            a: sp.edgeEnds[2 * e],
            b: sp.edgeEnds[2 * e + 1],
            why: {
              kind: "clue",
              pt: r.k,
              c: 2,
              pair: [sp.edgeEnds[2 * r.from], sp.edgeEnds[2 * r.from + 1]],
            },
            tick: trace.tick,
          });
        before[e] = m.edgeCands[e];
        continue;
      }
      const n = facts[i + 2];
      trace.vWhy[bitOf(sp, e, n)] = why;
      if (m.edgeCands[e] === ALIKE && (before[e] & ~(1 << n)) === ALIKE)
        trace.merges.push({
          a: sp.edgeEnds[2 * e],
          b: sp.edgeEnds[2 * e + 1],
          why: { kind: "vshape" },
          tick: trace.tick,
        });
      before[e] &= ~(1 << n);
    }
  }
  return { firings, trace };
}

/**
 * Why each v-shape struck between `before` and `after` is ruled out: a
 * diagonal in `grid` missing that end of the pair's side, which `drawn`
 * follows as it is drawn; and the pairs that leaves slanting alike.
 */
function drawnWhy(
  sp: GridSpace,
  trace: SlantTrace,
  grid: Uint8Array,
  before: Int32Array,
  after: Int32Array,
): void {
  for (const e of sp.edges) {
    const gone = before[e] & ~after[e];
    if (gone === 0) continue;
    const ends = [sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]];
    const side = sp.cellPoints[ends[0]].filter((k) =>
      sp.cellPoints[ends[1]].includes(k),
    );
    for (let n = 1; n <= 2; n++) {
      if (!((gone >> n) & 1)) continue;
      const sq = ends.find(
        (c) => grid[c] !== 0 && grid[c] !== slash(sp, c, side[n - 1]),
      );
      if (sq === undefined)
        throw new Error("slant hint: a v-shape struck by no diagonal");
      trace.vWhy[bitOf(sp, e, n)] = { kind: "slash", sq };
    }
    if (after[e] === ALIKE && before[e] !== ALIKE)
      trace.merges.push({
        a: ends[0],
        b: ends[1],
        why: { kind: "vshape" },
        tick: trace.tick,
      });
  }
}

const pairOf = (p: readonly [number, number] | null): [number, number] | null =>
  p === null ? null : [p[0], p[1]];

/**
 * Why a v-shape is ruled out, in the trace's words; `null` where it is ruled
 * out across a 2 from a pair whose v-shapes no reason rules out, a pair the
 * player or a number marked alike with its squares still open. A pair marked
 * alike that has since a diagonal is read by it, as a v-shape a diagonal
 * rules out is.
 */
function vWhyOf(
  sp: GridSpace,
  r: SlantReason,
  trace: SlantTrace,
  grid: Uint8Array,
): VWhy | null {
  switch (r.kind) {
    case "number":
      return { kind: "clue", pt: r.k, c: r.c };
    case "two": {
      const from = bitOf(sp, r.from, r.value);
      if (trace.vWhy[from] === null) {
        const ends = [sp.edgeEnds[2 * r.from], sp.edgeEnds[2 * r.from + 1]];
        const side = sp.cellPoints[ends[0]].filter((k) =>
          sp.cellPoints[ends[1]].includes(k),
        );
        const at = side[r.value - 1];
        const sq = ends.find((c) => grid[c] !== 0 && grid[c] !== slash(sp, c, at));
        if (sq === undefined) return null;
        trace.vWhy[from] = { kind: "slash", sq };
      }
      return { kind: "two", pt: r.k, from };
    }
    default:
      throw new Error(`slant hint: ${r.kind} narrows no v-shape`);
  }
}

/** A firing that draws diagonals, as the hint narrates it. */
function firingOf(
  sp: GridSpace,
  clues: Int8Array,
  r: SlantReason,
  placed: ReadonlyMap<number, number>,
  grid: Int8Array,
): SlantFiring {
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
