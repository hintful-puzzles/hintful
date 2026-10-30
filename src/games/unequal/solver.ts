/**
 * Unequal solver: the ladder its two descriptions state
 * (`unequal.description.yaml` for the signs, `adjacent.description.yaml` for
 * the bars), compiled, with the reason each records for the hint, and the
 * validator from `unequal.c`, on the shared `LatinSolver` (`engine/latin.ts`),
 * whose forcing chains and recursion are the search above the ladder.
 */

import {
  clueAt,
  clueList,
  greatest,
  latinSpace,
  least,
} from "../../engine/describe-runtime.ts";
import {
  compiledRung,
  type DeductionRecord,
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  LATIN_RUNGS,
  type LatinLadder,
  type LatinReason,
  type LatinRung,
  type LatinSolver,
  latinSolver,
} from "../../engine/latin.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import * as adjacent from "./adjacent.compiled.ts";
import { ADJTHAN, DIFF_RECURSIVE, type Mode } from "./state.ts";
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

/** An inequality clue: the cell at `(gx, gy)` must hold a number greater than
 * the cell at `(lx, ly)`. */
interface SolverLink {
  gx: number;
  gy: number;
  lx: number;
  ly: number;
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
            });
        }
      }
    }
  }
  return { o, mode, flags, links };
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

/** The cell across a sign or bar, as a reason names it. */
const across = (c: number, o: number) => ({ ox: c % o, oy: (c / o) | 0 });

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
    return { kind: "greater", ...across(small, o), bound: m === 0 ? o + 1 : least(m) };
  }
  const m = solver.cand(big);
  return { kind: "lesser", ...across(big, o), bound: m === 0 ? 1 : greatest(m) };
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
        ...across(a, solver.o),
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
        ...across(a, solver.o),
        bar: clueAt(cl.bar, e) === 1,
      }),
    ),
  "latin.set": () => LATIN_RUNGS["latin.set"],
  "latin.fish": () => LATIN_RUNGS["latin.fish"],
  "latin.wing": () => LATIN_RUNGS["latin.wing"],
};

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
 * or a `DIFF_IMPOSSIBLE`/`DIFF_AMBIGUOUS`/`DIFF_UNFINISHED` sentinel. Each tier
 * runs the techniques the mode's description places at it, and the
 * recursive tier the engine's forcing chains and recursion. When `cubeOut` is
 * given it receives the final candidate cube (the generator grades clues by it).
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
  return latinSolver<UnequalCtx>(soln, o, {
    maxdiff,
    diffRecursive: DIFF_RECURSIVE,
    valid: unequalValid,
    ctx: newCtx(o, mode, flags),
    cubeOut,
    recorder,
    ...describedLadder(o, mode, flags),
  });
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
