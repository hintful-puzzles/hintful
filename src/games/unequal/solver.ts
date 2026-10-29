/**
 * Unequal solver — the Unequal-specific deductions (inequality "links" and
 * adjacency elimination) and the validator from `unequal.c`, riding on the
 * shared generic `LatinSolver` (`engine/latin.ts`).
 *
 * Two modes share one solver: **Unequal** uses `solverLinks` (greater-than bound
 * elimination); **Adjacent** uses `solverAdjacent` / `solverAdjacentSet`
 * (differ-by-1 elimination). The generic Latin layers (positional/set
 * elimination, forcing chains, recursion) supply everything else.
 */

import {
  clueAt,
  clueList,
  greatest,
  latinSpace,
  least,
} from "../../engine/describe-runtime.ts";
import {
  CHECK,
  compareRuns,
  compiledRung,
  type DeductionRecord,
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  LATIN_RUNGS,
  type LatinLadder,
  type LatinReason,
  type LatinRung,
  type LatinSolver,
  type LatinSolverConfig,
  latinSolver,
} from "../../engine/latin.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import * as adjacent from "./adjacent.compiled.ts";
import {
  ADJTHAN,
  DIFF_EXTREME,
  DIFF_LATIN,
  DIFF_RECURSIVE,
  DIFF_SET,
  type Mode,
} from "./state.ts";
import * as unequal from "./unequal.compiled.ts";

export { DIFF_AMBIGUOUS, DIFF_IMPOSSIBLE };

/** Why an Unequal-specific deduction ruled a candidate out — the premise the
 * hint narrates and highlights. Combined with {@link LatinReason} (the generic
 * positional/set deductions) it covers every technique the recording
 * solver fires. The `kind` fields never collide with the Latin reasons.
 *
 * `greater`/`lesser` fire only in Unequal mode (an inequality "link"), and carry
 * the cell across the `>` sign (`ox`,`oy`) plus that cell's binding value
 * (`bound`, 1-based): for `greater` the smaller cell can be no *less* than
 * `bound`, so this cell must exceed it; for `lesser` the larger cell can be no
 * *more* than `bound`, so this cell must fall short of it. `adjacent`/
 * `adjacentSet` fire only in Adjacent mode and carry the constraining neighbor
 * (`ox`,`oy`) and whether a bar joins them (`bar`). */
export type UnequalReason =
  | { kind: "greater"; ox: number; oy: number; bound: number }
  | { kind: "lesser"; ox: number; oy: number; bound: number }
  | { kind: "adjacent"; ox: number; oy: number; v: number; bar: boolean }
  | { kind: "adjacentSet"; ox: number; oy: number; bar: boolean }
  /** The singles the hint plan re-derives from the working board at placement
   * time (the recording solver records them all as `single`). */
  | SingleReason;

/** A reason attached to a recorded Unequal deduction. */
export type HintReason = UnequalReason | LatinReason;

/** One recorded Unequal deduction op (a {@link DeductionRecord} with a narrowed
 * reason). */
export interface HintOp extends DeductionRecord {
  reason: HintReason;
}

/** An inequality clue: the cell at `(gx, gy)` must hold a number greater (by at
 * least `len`) than the cell at `(lx, ly)`. */
interface SolverLink {
  gx: number;
  gy: number;
  lx: number;
  ly: number;
  len: number;
}

/** Shared, immutable solver context (upstream `struct solver_ctx`). The links
 * are derived once from the fixed adjacency flags, so one ctx serves the
 * fixpoint and every recursion level (where the C's `clone_ctx` rebuilds it). */
interface UnequalCtx {
  o: number;
  mode: Mode;
  flags: Int32Array;
  links: SolverLink[];
}

function newCtx(o: number, mode: Mode, flags: Int32Array): UnequalCtx {
  const links: SolverLink[] = [];
  if (mode === "unequal") {
    for (let x = 0; x < o; x++) {
      for (let y = 0; y < o; y++) {
        const f = flags[y * o + x];
        for (let i = 0; i < 4; i++) {
          if (f & ADJTHAN[i].f)
            links.push({
              gx: x,
              gy: y,
              lx: x + ADJTHAN[i].dx,
              ly: y + ADJTHAN[i].dy,
              len: 1,
            });
        }
      }
    }
  }
  return { o, mode, flags, links };
}

// --- min/max of a cell's remaining possibilities (solver_nminmax) ----------

/** The smallest and largest still-possible value indices (0-based) at `(x, y)`.
 * A filled cell pins both to `grid-1`. */
function nminmax(
  solver: LatinSolver,
  x: number,
  y: number,
): { min: number; max: number } {
  const o = solver.o;
  const v = solver.grid[y * o + x];
  if (v > 0) return { min: v - 1, max: v - 1 };
  let min = o;
  let max = 0;
  for (let n = 0; n < o; n++) {
    if (solver.cubeGet(x, y, n + 1)) {
      if (n > max) max = n;
      if (n < min) min = n;
    }
  }
  return { min, max };
}

// --- solver_links (Unequal-mode easy) --------------------------------------

function solverLinks(solver: LatinSolver, ctx: UnequalCtx): number {
  let total = 0;
  for (const link of ctx.links) {
    const { max: gmax } = nminmax(solver, link.gx, link.gy);
    const { min: lmin } = nminmax(solver, link.lx, link.ly);
    let nchanged = 0;

    for (let j = 0; j < solver.o; j++) {
      // Greater end: rule out values too small to satisfy the inequality. The
      // lesser cell can be no smaller than `lmin + 1` (1-based), so this cell
      // must exceed it.
      if (solver.cubeGet(link.gx, link.gy, j + 1) && j < lmin + link.len) {
        if (solver.recorder) {
          solver.recorder({
            kind: "elim",
            x: link.gx,
            y: link.gy,
            n: j + 1,
            reason: { kind: "greater", ox: link.lx, oy: link.ly, bound: lmin + 1 },
            group: solver.group,
          });
        }
        solver.cube[solver.cubepos(link.gx, link.gy, j + 1)] = 0;
        nchanged++;
      }
      // Lesser end: rule out values too large to satisfy the inequality. The
      // greater cell can be no larger than `gmax + 1` (1-based), so this cell
      // must fall short of it.
      if (solver.cubeGet(link.lx, link.ly, j + 1) && j > gmax - link.len) {
        if (solver.recorder) {
          solver.recorder({
            kind: "elim",
            x: link.lx,
            y: link.ly,
            n: j + 1,
            reason: { kind: "lesser", ox: link.gx, oy: link.gy, bound: gmax + 1 },
            group: solver.group,
          });
        }
        solver.cube[solver.cubepos(link.lx, link.ly, j + 1)] = 0;
        nchanged++;
      }
    }

    // On the hint-recording path, return as soon as one link fires, so each
    // recorded firing (one `solver.group`) covers a single `>` sign and a hint
    // step never narrates one clue while striking marks from another. Without a
    // recorder it accumulates across links, as the C does.
    if (solver.recorder && nchanged) return nchanged;
    total += nchanged;
  }
  return total;
}

// --- solver_adjacent (Adjacent-mode easy) ----------------------------------

function solverAdjacent(solver: LatinSolver, ctx: UnequalCtx): number {
  const o = solver.o;
  let total = 0;
  for (let x = 0; x < o; x++) {
    for (let y = 0; y < o; y++) {
      const v = solver.grid[y * o + x];
      if (v === 0) continue;
      const f = ctx.flags[y * o + x];
      for (let i = 0; i < 4; i++) {
        const isadjacent = (f & ADJTHAN[i].f) !== 0;
        const nx = x + ADJTHAN[i].dx;
        const ny = y + ADJTHAN[i].dy;
        if (nx < 0 || ny < 0 || nx >= o || ny >= o) continue;
        let nchanged = 0;
        for (let n = 0; n < o; n++) {
          const gd = Math.abs(n + 1 - v);
          if (isadjacent && gd === 1) continue;
          if (!isadjacent && gd !== 1) continue;
          if (!solver.cubeGet(nx, ny, n + 1)) continue;
          if (solver.recorder) {
            solver.recorder({
              kind: "elim",
              x: nx,
              y: ny,
              n: n + 1,
              reason: { kind: "adjacent", ox: x, oy: y, v, bar: isadjacent },
              group: solver.group,
            });
          }
          solver.cube[solver.cubepos(nx, ny, n + 1)] = 0;
          nchanged++;
        }
        // One filled cell + direction = one adjacency-clue firing (see the
        // `solverLinks` note); return per firing on the recording path.
        if (solver.recorder && nchanged) return nchanged;
        total += nchanged;
      }
    }
  }
  return total;
}

// --- solver_adjacent_set (Adjacent-mode tricky) ----------------------------

function solverAdjacentSet(solver: LatinSolver, ctx: UnequalCtx): number {
  const o = solver.o;
  let nchanged = 0;
  const scratch = new Int8Array(o);
  for (let x = 0; x < o; x++) {
    for (let y = 0; y < o; y++) {
      const f = ctx.flags[y * o + x];
      for (let i = 0; i < 4; i++) {
        const isadjacent = (f & ADJTHAN[i].f) !== 0;
        const nx = x + ADJTHAN[i].dx;
        const ny = y + ADJTHAN[i].dy;
        if (nx < 0 || ny < 0 || nx >= o || ny >= o) continue;

        // Build the maximum set of values (nx,ny) could take given (x,y)'s
        // possibilities and the adjacency clue.
        scratch.fill(0);
        for (let n = 0; n < o; n++) {
          if (!solver.cubeGet(x, y, n + 1)) continue;
          for (let nn = 0; nn < o; nn++) {
            if (n === nn) continue;
            const gd = Math.abs(nn - n);
            if (isadjacent && gd !== 1) continue;
            if (!isadjacent && gd === 1) continue;
            scratch[nn] = 1;
          }
        }

        // Remove (nx,ny) possibilities not indicated in scratch.
        let fired = 0;
        for (let n = 0; n < o; n++) {
          if (scratch[n] === 1) continue;
          if (!solver.cubeGet(nx, ny, n + 1)) continue;
          if (solver.recorder) {
            solver.recorder({
              kind: "elim",
              x: nx,
              y: ny,
              n: n + 1,
              reason: { kind: "adjacentSet", ox: x, oy: y, bar: isadjacent },
              group: solver.group,
            });
          }
          solver.cube[solver.cubepos(nx, ny, n + 1)] = 0;
          nchanged++;
          fired++;
        }
        // One cell + direction = one firing; return per firing when recording.
        if (solver.recorder && fired) return nchanged;
      }
    }
  }
  return nchanged;
}

// --- mode-dispatching usersolvers ------------------------------------------

function solverEasy(solver: LatinSolver, ctx: UnequalCtx): number {
  return ctx.mode === "adjacent"
    ? solverAdjacent(solver, ctx)
    : solverLinks(solver, ctx);
}

function solverSet(solver: LatinSolver, ctx: UnequalCtx): number {
  return ctx.mode === "adjacent" ? solverAdjacentSet(solver, ctx) : 0;
}

// --- validator -------------------------------------------------------------

function unequalValid(solver: LatinSolver, ctx: UnequalCtx): boolean {
  const o = solver.o;
  if (ctx.mode === "adjacent") {
    for (let x = 0; x + 1 < o; x++) {
      for (let y = 0; y + 1 < o; y++) {
        const v = solver.grid[y * o + x];
        for (let i = 0; i < 4; i++) {
          const shouldBeAdj = (ctx.flags[y * o + x] & ADJTHAN[i].f) !== 0;
          const nx = x + ADJTHAN[i].dx;
          const ny = y + ADJTHAN[i].dy;
          if (nx < 0 || ny < 0 || nx >= o || ny >= o) continue;
          const nv = solver.grid[ny * o + nx];
          const isAdj = Math.abs(v - nv) === 1;
          if (isAdj && !shouldBeAdj) return false;
          if (!isAdj && shouldBeAdj) return false;
        }
      }
    }
  } else {
    for (const link of ctx.links) {
      const gv = solver.grid[link.gy * o + link.gx];
      const lv = solver.grid[link.ly * o + link.lx];
      if (gv <= lv) return false;
    }
  }
  return true;
}

// --- the described ladder ----------------------------------------------------

const xy = (c: number, o: number) => ({ x: c % o, y: (c / o) | 0 });

/** A struck end's other end can be no less (or, for the smaller end, no more)
 * than this, as the board stood: its least or greatest candidate, past the
 * values altogether when it has none. */
function signReason(
  { big, small }: unequal.SignBinding,
  cell: number,
  solver: LatinSolver,
): UnequalReason {
  const o = solver.o;
  if (cell === big) {
    const m = solver.cand(small);
    const { x, y } = xy(small, o);
    return { kind: "greater", ox: x, oy: y, bound: m === 0 ? o + 1 : least(m) };
  }
  const m = solver.cand(big);
  const { x, y } = xy(big, o);
  return { kind: "lesser", ox: x, oy: y, bound: m === 0 ? 1 : greatest(m) };
}

const UNEQUAL_RUNGS: Record<unequal.LadderId, (cl: unequal.Clues) => LatinRung> = {
  "latin.hiddenSingle": () => LATIN_RUNGS["latin.hiddenSingle"],
  "latin.single": () => LATIN_RUNGS["latin.single"],
  sign: (cl) =>
    compiledRung(unequal.sign, cl, (binding, cell, _n, solver) =>
      signReason(binding, cell, solver),
    ),
  "latin.set": () => LATIN_RUNGS["latin.set"],
  "latin.fish": () => LATIN_RUNGS["latin.fish"],
  "latin.wing": () => LATIN_RUNGS["latin.wing"],
};

const ADJACENT_RUNGS: Record<adjacent.LadderId, (cl: adjacent.Clues) => LatinRung> = {
  "latin.hiddenSingle": () => LATIN_RUNGS["latin.hiddenSingle"],
  "latin.single": () => LATIN_RUNGS["latin.single"],
  adjacent: (cl) =>
    compiledRung(
      adjacent.adjacent,
      cl,
      ({ a, e }, _c, _n, solver): UnequalReason => ({
        kind: "adjacent",
        ...oxy(a, solver.o),
        v: solver.value(a),
        bar: clueAt(cl.bar, e) === 1,
      }),
    ),
  adjacentSet: (cl) =>
    compiledRung(
      adjacent.adjacentSet,
      cl,
      ({ a, e }, _c, _n, solver): UnequalReason => ({
        kind: "adjacentSet",
        ...oxy(a, solver.o),
        bar: clueAt(cl.bar, e) === 1,
      }),
    ),
  "latin.set": () => LATIN_RUNGS["latin.set"],
  "latin.fish": () => LATIN_RUNGS["latin.fish"],
  "latin.wing": () => LATIN_RUNGS["latin.wing"],
};

const oxy = (c: number, o: number) => ({ ox: c % o, oy: (c / o) | 0 });

/**
 * The board's clues as its description deals them. A sign is flagged at its
 * greater end, taken column by column and each cell's signs up, right, down,
 * left; a bar from both ends, so an edge's clue reads either.
 */
function describedLadder(o: number, mode: Mode, flags: Int32Array): LatinLadder {
  const sp = latinSpace(o);
  const edges = sp.edgeEnds.length / 2;
  if (mode === "unequal") {
    const at: number[] = [];
    const v: number[] = [];
    for (let x = 0; x < o; x++)
      for (let y = 0; y < o; y++)
        for (const dir of ADJTHAN)
          if (flags[y * o + x] & dir.f) {
            const big = y * o + x;
            at.push(sp.edgeOf(big, (y + dir.dy) * o + x + dir.dx));
            v.push(big);
          }
    const cl: unequal.Clues = { greater: clueList(at, v, edges) };
    return {
      ladder: unequal.ladder.map(({ id, tier }) => ({
        tier,
        run: UNEQUAL_RUNGS[id](cl),
      })),
    };
  }
  const at: number[] = [];
  const v: number[] = [];
  for (let e = 0; e < edges; e++) {
    const a = sp.edgeEnds[2 * e];
    const b = sp.edgeEnds[2 * e + 1];
    const dir = b === a + 1 ? ADJTHAN[1] : ADJTHAN[2];
    at.push(e);
    v.push(flags[a] & dir.f ? 1 : 0);
  }
  const cl: adjacent.Clues = { bar: clueList(at, v, edges) };
  return {
    ladder: adjacent.ladder.map(({ id, tier }) => ({
      tier,
      run: ADJACENT_RUNGS[id](cl),
    })),
  };
}

// --- driver ----------------------------------------------------------------

/**
 * Solve the `o × o` Unequal board (with adjacency `flags`) into `soln`
 * (0 = blank), up to difficulty `maxdiff`. Returns the difficulty level reached,
 * or a `DIFF_IMPOSSIBLE`/`DIFF_AMBIGUOUS`/`DIFF_UNFINISHED` sentinel. Mirrors
 * `unequal.c`'s `solver_state` → `latin_solver_main`, by tier: Easy→simple,
 * Normal→the clue deductions, Tricky→set₀, Hard→set₁,
 * Unreasonable→forcing and recursion. When `cubeOut` is given it receives the final
 * candidate cube (the generator grades clues by it).
 */
export function solveUnequal(
  o: number,
  mode: Mode,
  flags: Int32Array,
  soln: Uint8Array,
  maxdiff: number,
  cubeOut?: Uint8Array,
  recorder?: (rec: DeductionRecord) => void,
): number {
  const ctx = newCtx(o, mode, flags);
  const common = {
    maxdiff,
    diffRecursive: DIFF_RECURSIVE,
    valid: unequalValid,
    ctx,
    cubeOut,
    recorder,
  };
  const built: LatinSolverConfig<UnequalCtx> = {
    ...common,
    ...describedLadder(o, mode, flags),
  };
  const hand: LatinSolverConfig<UnequalCtx> = {
    ...common,
    diffSimple: DIFF_LATIN,
    diffSet0: DIFF_SET,
    diffSet1: DIFF_EXTREME,
    usersolvers: [null, solverEasy, solverSet, null, null],
  };
  if (CHECK.selfCheck) compareRuns(soln, o, hand, built);
  if (CHECK.handWritten) return latinSolver<UnequalCtx>(soln, o, hand);
  return latinSolver<UnequalCtx>(soln, o, built);
}

/**
 * Run the recording solver on a sound candidate cube seeded from `grid` (the
 * placed givens/entries only — never the player's notes), up to `maxdiff`, and
 * return every candidate elimination and cell placement it makes, in solver
 * order, each tagged with the rule + premise that forced it. This is the raw
 * deduction script a hint narrates. `grid` is treated read-only (a working copy
 * is solved internally).
 */
export function recordUnequalDeductions(
  o: number,
  mode: Mode,
  flags: Int32Array,
  grid: Uint8Array,
  maxdiff: number,
): HintOp[] {
  const ops: HintOp[] = [];
  solveUnequal(o, mode, flags, grid.slice(), maxdiff, undefined, (rec) =>
    ops.push(rec as HintOp),
  );
  return ops;
}
