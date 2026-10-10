/**
 * Palisade solver.
 *
 * Upstream's six DSF deductions, run to a fixpoint and each annotated with its
 * upstream name; `solver()` returns whether the clue set is fully solved. The
 * search for a board's answers is trial and error over them.
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import {
  BORDER,
  buildDsf,
  DX,
  DY,
  FLIP,
  initBorders,
  outOfBounds,
} from "../../engine/border-grid.ts";
import { Dsf } from "../../engine/dsf.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { bitcount, EMPTY, isSolved, type PalisadeShape } from "./state.ts";

// --- hint-mode deduction trace --------------------------------------------

/** Which of the six deductions forced an edge (for hint narration). */
export type SolverRule =
  | "cluesVersusRegionSize"
  | "numberExhausted"
  | "notTooBig"
  | "notTooSmall"
  | "noDanglingEdges"
  | "equivalentEdges";

/** A single edge the solver forced, in player-visible terms: a `"wall"`
 * (a `disconnect`) or a `"nowall"` (an individually-forced `connect`),
 * named by the rule that produced it. `(x,y)` + `dir` is the edge on the
 * primary cell; interior only (the rim is never re-decided). `cells` is the
 * deduction's evidence for highlighting (a clue pair, a region). Edges sharing
 * a `group` are one firing — a single logical deduction (the `equivalentEdges`
 * pair, a `numberExhausted` sweep) — and the hint presents them as one
 * journey. */
export interface ForcedEdge {
  x: number;
  y: number;
  dir: number;
  kind: "wall" | "nowall";
  rule: SolverRule;
  cells?: number[];
  group: number;
}

class SolverCtx {
  readonly w: number;
  readonly h: number;
  readonly k: number;
  readonly clues: Int8Array;
  readonly borders: Uint8Array;
  readonly dsf: Dsf;
  /** Hint mode: when set, `disconnect`/`connectEdge`/`notTooSmall` push the
   * player-visible edges they force here. Null on the solve and generator
   * paths. */
  record: ForcedEdge[] | null = null;
  /** The rule currently sweeping — stamped on each recorded edge. */
  rule: SolverRule = "cluesVersusRegionSize";
  /** Edges recorded inside one `firing(...)` share `currentGroup`; outside one
   * (-1), each edge gets a fresh id (a one-edge group = an ordinary step). */
  private nextGroup = 0;
  private currentGroup = -1;

  constructor(
    p: PalisadeShape,
    clues: Int8Array,
    borders: Uint8Array,
    dsf = new Dsf(p.w * p.h),
  ) {
    this.w = p.w;
    this.h = p.h;
    this.k = p.k;
    this.clues = clues;
    this.borders = borders;
    this.dsf = dsf;
  }

  /** Run `fn` as a single logical deduction: every edge it records shares
   * one firing id, so the hint groups them into one multi-leg journey. */
  firing(fn: () => void): void {
    const outer = this.currentGroup;
    this.currentGroup = this.nextGroup++;
    fn();
    this.currentGroup = outer;
  }

  recordEdge(i: number, dir: number, kind: "wall" | "nowall", cells?: number[]): void {
    if (!this.record) return;
    this.record.push({
      x: i % this.w,
      y: Math.floor(i / this.w),
      dir,
      kind,
      rule: this.rule,
      cells,
      group: this.currentGroup >= 0 ? this.currentGroup : this.nextGroup++,
    });
  }

  /** All cells the DSF currently puts in the same region as `cell`. Hint
   * mode only (callers guard with `this.record`); O(w·h). */
  regionCells(cell: number): number[] {
    const rep = this.dsf.canonify(cell);
    const out: number[] = [];
    for (let c = 0; c < this.w * this.h; c++) {
      if (this.dsf.canonify(c) === rep) out.push(c);
    }
    return out;
  }

  /** The cell across edge `dir` of `i`, or -1 off the grid. */
  neighbor(i: number, dir: number): number {
    const x = (i % this.w) + DX[dir];
    const y = Math.floor(i / this.w) + DY[dir];
    if (outOfBounds(x, y, this.w, this.h)) return -1;
    return y * this.w + x;
  }

  connect(i: number, j: number): void {
    this.dsf.merge(i, j);
  }

  /** Merge across edge `dir` of `i` and, in hint mode, record it as a forced
   * no-wall. Callers check `maybe(i, dir)` first, so the edge is genuinely
   * undecided: a player's own no-wall mark, seeded into the DSF, is never
   * re-recorded. */
  connectEdge(i: number, dir: number, cells?: number[]): void {
    this.recordEdge(i, dir, "nowall", cells);
    this.connect(i, this.neighbor(i, dir));
  }

  /** Is there a wall on edge `dir` of `i`? Bounds-safe (the rim is
   * always walled), so it never indexes off-grid. */
  disconnectedDir(i: number, dir: number): boolean {
    return (this.borders[i] & BORDER(dir)) !== 0;
  }

  /** Are `i` and its `dir`-neighbor known to be in one region? */
  connectedDir(i: number, dir: number): boolean {
    const j = this.neighbor(i, dir);
    return j >= 0 && this.dsf.equivalent(i, j);
  }

  /** Neither walled nor known-connected: the edge is still undecided. */
  maybe(i: number, dir: number): boolean {
    return !this.disconnectedDir(i, dir) && !this.connectedDir(i, dir);
  }

  /** Set a wall on edge `dir` of `i`, recording both shared sides. In
   * hint mode, record a genuinely-new wall as a forced edge. */
  disconnect(i: number, dir: number, cells?: number[]): void {
    const newWall = !(this.borders[i] & BORDER(dir));
    const j = this.neighbor(i, dir);
    this.borders[i] |= BORDER(dir);
    if (j >= 0) this.borders[j] |= BORDER(FLIP(dir));
    if (newWall) this.recordEdge(i, dir, "wall", cells);
  }
}

// --- the six deductions ---------------------------------------------------

/** `solver_connected_clues_versus_region_size` — idempotent, run once. */
function connectedCluesVersusRegionSize(ctx: SolverCtx): void {
  ctx.rule = "cluesVersusRegionSize";
  const { w, h, k, clues } = ctx;
  const wh = w * h;
  for (let i = 0; i < wh; i++) {
    if (clues[i] === EMPTY) continue;
    for (let dir = 0; dir < 4; dir++) {
      if (ctx.disconnectedDir(i, dir)) continue;
      const j = ctx.neighbor(i, dir);
      if (j < 0 || clues[j] === EMPTY) continue;
      if (
        8 - clues[i] - clues[j] > k ||
        (clues[i] === 3 && clues[j] === 3 && k !== 2)
      ) {
        ctx.disconnect(i, dir, ctx.record ? [i, j] : undefined);
      }
    }
  }
}

/** `solver_number_exhausted`. */
function numberExhausted(ctx: SolverCtx): boolean {
  ctx.rule = "numberExhausted";
  const { w, h, clues, borders } = ctx;
  const wh = w * h;
  let changed = false;
  for (let i = 0; i < wh; i++) {
    if (clues[i] === EMPTY) continue;

    if (bitcount(borders[i]) === clues[i]) {
      // All this clue's walls are placed: the rest are non-walls — one
      // firing (the clue's remaining edges are forced together).
      ctx.firing(() => {
        for (let dir = 0; dir < 4; dir++) {
          if (!ctx.maybe(i, dir)) continue;
          ctx.connectEdge(i, dir, ctx.record ? [i] : undefined);
          changed = true;
        }
      });
      continue;
    }

    let off = 0;
    for (let dir = 0; dir < 4; dir++) {
      if (!ctx.disconnectedDir(i, dir) && ctx.connectedDir(i, dir)) off++;
    }
    if (clues[i] === 4 - off) {
      // Every remaining edge must be a wall to reach the clue — one firing.
      ctx.firing(() => {
        for (let dir = 0; dir < 4; dir++) {
          if (!ctx.maybe(i, dir)) continue;
          ctx.disconnect(i, dir, ctx.record ? [i] : undefined);
          changed = true;
        }
      });
    }
  }
  return changed;
}

/** `solver_not_too_big`. */
function notTooBig(ctx: SolverCtx): boolean {
  ctx.rule = "notTooBig";
  const { w, h, k } = ctx;
  const wh = w * h;
  let changed = false;
  for (let i = 0; i < wh; i++) {
    const size = ctx.dsf.size(i);
    for (let dir = 0; dir < 4; dir++) {
      if (!ctx.maybe(i, dir)) continue;
      const j = ctx.neighbor(i, dir);
      if (size + ctx.dsf.size(j) <= k) continue;
      ctx.disconnect(
        i,
        dir,
        ctx.record ? [...ctx.regionCells(i), ...ctx.regionCells(j)] : undefined,
      );
      changed = true;
    }
  }
  return changed;
}

/** `solver_not_too_small` — a region with a single way to grow grows. */
function notTooSmall(ctx: SolverCtx): boolean {
  ctx.rule = "notTooSmall";
  const { w, h, k } = ctx;
  const wh = w * h;
  const outs = new Int32Array(wh).fill(-1); // -1 none, -2 several
  // The undecided growth edge(s) toward `outs[ci]`: count + the last one,
  // so a region with a single way out can record that forced no-wall.
  const outCount = new Int32Array(wh);
  const outCell = new Int32Array(wh).fill(-1);
  const outDir = new Int32Array(wh).fill(-1);
  let changed = false;

  for (let i = 0; i < wh; i++) {
    const ci = ctx.dsf.canonify(i);
    if (ctx.dsf.size(ci) === k) continue;
    for (let dir = 0; dir < 4; dir++) {
      if (!ctx.maybe(i, dir)) continue;
      const cj = ctx.dsf.canonify(ctx.neighbor(i, dir));
      if (outs[ci] === -1) {
        outs[ci] = cj;
        outCount[ci] = 1;
        outCell[ci] = i;
        outDir[ci] = dir;
      } else if (outs[ci] === cj) {
        outCount[ci]++;
      } else outs[ci] = -2;
    }
  }

  for (let i = 0; i < wh; i++) {
    const j = outs[i];
    if (i !== ctx.dsf.canonify(i)) continue;
    if (j < 0) continue;
    // A single undecided exit means that exact edge is forced no-wall.
    if (outCount[i] === 1) {
      const region = ctx.record ? ctx.regionCells(i) : undefined;
      ctx.recordEdge(outCell[i], outDir[i], "nowall", region);
    }
    ctx.connect(i, j);
    changed = true;
  }
  return changed;
}

/** `solver_no_dangling_edges` — vertex parity of incident walls. */
function noDanglingEdges(ctx: SolverCtx): boolean {
  ctx.rule = "noDanglingEdges";
  const { w, h, borders } = ctx;
  let changed = false;
  for (let r = 1; r < h; r++) {
    for (let c = 1; c < w; c++) {
      const i = r * w + c;
      const j = i - w - 1;
      let noline = 0;
      // Aligned with BORDER_[U0 R1 D2 L3].
      const squares = [i, j, j, i];
      let e = -1;
      let f = -1;
      let de = -1;
      let df = -1;

      for (let dir = 0; dir < 4; dir++) {
        if (!ctx.connectedDir(squares[dir], dir)) {
          df = dir;
          f = squares[df];
          if (e !== -1) continue;
          e = f;
          de = df;
        } else noline++;
      }

      // The four cells meeting at this vertex, highlighting "this corner".
      const corner = ctx.record ? [i, i - 1, i - w, j] : undefined;

      // Exactly one unconnected pair cannot happen: three connected pairs round
      // a vertex put all four squares in one class, the fourth pair included.
      if (4 - noline !== 2) continue;

      if (borders[e] & BORDER(de)) {
        if (!(borders[f] & BORDER(df))) {
          ctx.disconnect(f, df, corner);
          changed = true;
        }
      } else if (borders[f] & BORDER(df)) {
        ctx.disconnect(e, de, corner);
        changed = true;
      }
    }
  }
  return changed;
}

/** `solver_equivalent_edges` — two edges to one region share a fate. */
function equivalentEdges(ctx: SolverCtx): boolean {
  ctx.rule = "equivalentEdges";
  const { w, h, clues } = ctx;
  const wh = w * h;
  let changed = false;

  for (let i = 0; i < wh; i++) {
    if (clues[i] < 1 || clues[i] > 3) continue;
    let nOn = 0;
    let nOff = 0;
    if (clues[i] === 2) {
      for (let dir = 0; dir < 4; dir++) {
        if (ctx.disconnectedDir(i, dir)) nOn++;
        else if (ctx.connectedDir(i, dir)) nOff++;
      }
    }
    for (let dirj = 0; dirj < 4; dirj++) {
      if (!ctx.maybe(i, dirj)) continue;
      const j = ctx.neighbor(i, dirj);
      for (let dirk = dirj + 1; dirk < 4; dirk++) {
        if (!ctx.maybe(i, dirk)) continue;
        const kk = ctx.neighbor(i, dirk);
        if (!ctx.dsf.equivalent(j, kk)) continue;
        // The shared region the two edges lead into, captured before any
        // merge. The clue cell `i` is deliberately excluded: it is the
        // decider, not part of the region.
        const region = ctx.record ? ctx.regionCells(j) : undefined;
        if (nOn + 2 > clues[i]) {
          ctx.firing(() => {
            ctx.connectEdge(i, dirj, region);
            ctx.connectEdge(i, dirk, region);
          });
          changed = true;
        } else if (nOff + 2 > 4 - clues[i]) {
          ctx.firing(() => {
            ctx.disconnect(i, dirj, region);
            ctx.disconnect(i, dirk, region);
          });
          changed = true;
        }
      }
    }
  }
  return changed;
}

/** Run the six deductions to a fixpoint. `tick` is called once per pass. */
function runToFixpoint(ctx: SolverCtx, tick?: () => void): void {
  connectedCluesVersusRegionSize(ctx); // idempotent, run once
  let changed = true;
  while (changed) {
    tick?.();
    changed = false;
    if (numberExhausted(ctx)) changed = true;
    if (notTooBig(ctx)) changed = true;
    if (notTooSmall(ctx)) changed = true;
    if (noDanglingEdges(ctx)) changed = true;
    if (equivalentEdges(ctx)) changed = true;
  }
}

/**
 * Run the solver in place on `borders` (which must start as the grid
 * rim). Returns whether the clue set is fully solved.
 */
export function solver(
  p: PalisadeShape,
  clues: Int8Array,
  borders: Uint8Array,
): boolean {
  runToFixpoint(new SolverCtx(p, clues, borders));
  return isSolved(p.w, p.h, p.k, clues, borders);
}

/** Solve a clue set from the bare rim; returns the solution walls, or
 * null if the clue set is not (uniquely) solver-solvable. */
export function solveToBorders(p: PalisadeShape, clues: Int8Array): Uint8Array | null {
  const borders = initBorders(p.w, p.h);
  return solver(p, clues, borders) ? borders : null;
}

/**
 * Hint mode: seed the solver from the player's `playerBorders` (their
 * walls copied in, their no-wall marks pre-merged into the DSF) and run
 * the deductions to a fixpoint, returning every player-visible edge they
 * force, in discovery order. Pure: `playerBorders` is not mutated. The
 * physical edges are de-duplicated (two under-sized regions can each
 * record the shared edge between them).
 */
export function deduceForcedEdges(
  p: PalisadeShape,
  clues: Int8Array,
  playerBorders: Uint8Array,
): ForcedEdge[] {
  const noWallDsf = buildDsf(p.w, p.h, playerBorders, false);
  const ctx = new SolverCtx(p, clues, playerBorders.slice(), noWallDsf);
  ctx.record = [];
  // The generator's `solver()` runs the same fixpoint unguarded; bound this
  // hint-only path against a non-terminating fixpoint regression.
  const budget = stepBudget("palisade hint");
  runToFixpoint(ctx, () => budget.tick());

  const seen = new Set<number>();
  const out: ForcedEdge[] = [];
  for (const e of ctx.record) {
    const i = e.y * p.w + e.x;
    const j = i + DY[e.dir] * p.w + DX[e.dir];
    const lo = Math.min(i, j);
    const horizontal = Math.max(i, j) - lo === 1;
    const id = lo * 2 + (horizontal ? 0 : 1); // unique per physical edge
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(e);
  }
  return out;
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a clue set's answers; the one answer is
 * each cell's walls. */
export type PalisadeAnswer = Answer<Uint8Array>;

/** The edges decided so far: the walls, and the cells known to be joined. An
 * edge is undecided while it has no wall and its two cells are not joined. */
interface Position {
  borders: Uint8Array;
  dsf: Dsf;
}

/**
 * Where the deductions leave a position. `"solved"` is every edge decided
 * and the walls a division into regions of `k` that meets every clue.
 *
 * The deductions never say "impossible": each decides an edge or does
 * nothing, which is all a board with an answer asks of them. Under a wrong
 * assumption they stop on a position that cannot be finished, and this is
 * what says so: a region past its size, a wall inside a region, a clue with
 * too many walls or too few edges left to make them, or a region short of
 * its size with no undecided edge to grow through.
 */
function verdictOf(ctx: SolverCtx): Deduced {
  const { w, h, k, clues, borders, dsf } = ctx;
  const wh = w * h;
  // The walls can be a whole division while squares of one region are still
  // to be joined: nothing is left to decide then, since a further wall would
  // cut a region short.
  if (isSolved(w, h, k, clues, borders)) return "solved";
  const canGrow = new Uint8Array(wh);
  let open = false;
  for (let i = 0; i < wh; i++) {
    if (dsf.size(i) > k) return "contradiction";
    let undecided = 0;
    for (let dir = 0; dir < 4; dir++) {
      if (ctx.disconnectedDir(i, dir)) {
        if (ctx.connectedDir(i, dir)) return "contradiction";
      } else if (!ctx.connectedDir(i, dir)) undecided++;
    }
    if (undecided > 0) {
      open = true;
      canGrow[dsf.canonify(i)] = 1;
    }
    if (clues[i] === EMPTY) continue;
    const walls = bitcount(borders[i]);
    if (walls > clues[i] || walls + undecided < clues[i]) return "contradiction";
  }
  if (!open) return "contradiction";
  for (let i = 0; i < wh; i++)
    if (dsf.size(i) < k && !canGrow[dsf.canonify(i)]) return "contradiction";
  return "stuck";
}

/**
 * The positions a search may try before it gives up, each one an edge
 * assumed a wall or not and the six deductions run from it.
 *
 * It decides which Unreasonable boards exist: a clue set that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games. A dealt board needs 30 at most,
 * the generator's own bound, so the rest is room for a pasted one. Measured
 * 2026-10-10, running it out on a board with half its clues gone takes half
 * a second at 12×15 and a second at 15×20.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a clue set's answers up to two, by trial and error over the solver:
 * where it stops, take an undecided edge of the clue with the fewest left
 * and assume it each way.
 */
export function searchAnswers(
  p: PalisadeShape,
  clues: Int8Array,
  budget: number = SEARCH_BUDGET,
): PalisadeAnswer {
  return searchBoard<Position, Uint8Array>({
    start: { borders: initBorders(p.w, p.h), dsf: new Dsf(p.w * p.h) },
    deduce(position) {
      const ctx = new SolverCtx(p, clues, position.borders, position.dsf);
      runToFixpoint(ctx);
      return verdictOf(ctx);
    },
    assume: (position) => assumeEdge(p, clues, position),
    solution: (position) => position.borders,
    budget,
  });
}

/**
 * The two positions a stuck one divides into: one undecided edge, a wall and
 * then not. The edge is the first undecided one of the clue with the fewest
 * undecided edges, where either way is likeliest to settle the clue. With no
 * such clue it is the first undecided edge on the board.
 */
function assumeEdge(
  p: PalisadeShape,
  clues: Int8Array,
  position: Position,
): Position[] {
  const ctx = new SolverCtx(p, clues, position.borders, position.dsf);
  const wh = p.w * p.h;
  let at = -1;
  let atDir = -1;
  let fewest = Number.POSITIVE_INFINITY;
  for (let i = 0; i < wh; i++) {
    let undecided = 0;
    let first = -1;
    for (let dir = 0; dir < 4; dir++) {
      if (!ctx.maybe(i, dir)) continue;
      undecided++;
      if (first < 0) first = dir;
    }
    if (undecided === 0) continue;
    // A cell without a clue is taken only until a clue's edge is found.
    const rank = clues[i] === EMPTY ? 8 : undecided;
    if (rank >= fewest) continue;
    fewest = rank;
    at = i;
    atDir = first;
  }
  if (at < 0) return [];
  const walled: Position = {
    borders: position.borders.slice(),
    dsf: position.dsf.clone(),
  };
  new SolverCtx(p, clues, walled.borders, walled.dsf).disconnect(at, atDir);
  const joined: Position = {
    borders: position.borders.slice(),
    dsf: position.dsf.clone(),
  };
  joined.dsf.merge(at, ctx.neighbor(at, atDir));
  return [walled, joined];
}

/** Keyed on a state's clues, which every state of a game shares. */
const answers = answerCache<Int8Array, Uint8Array>();

/** What a search of a state's clues established about their answers. The
 * player's edges are not read. */
export function answerOf(state: PalisadeShape & { clues: Int8Array }): PalisadeAnswer {
  return answers(state.clues, () => searchAnswers(state, state.clues));
}
