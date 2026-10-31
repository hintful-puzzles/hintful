/**
 * Towers (Skyscrapers) solver — the two Towers-specific deductions
 * (`solver_easy`, `solver_hard`) and the validator (`towers_valid`) from
 * `towers.c`, riding on the shared generic `LatinSolver` (`engine/latin.ts`).
 *
 * The clue heuristics work in terms of the cells *along* a clue's line of
 * sight, nearest the clue first (`lineCells`); a taller tower hides every
 * shorter one behind it, so the clue counts the increasing-maxima run seen
 * from that edge. The generic Latin layers (positional/set elimination,
 * forcing chains, recursion) supply everything else.
 */

import { clueAt, clueList } from "../../engine/describe-runtime.ts";
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
import {
  DIFF_EASY,
  DIFF_EXTREME,
  DIFF_HARD,
  DIFF_UNREASONABLE,
  lineCells,
} from "./state.ts";
import * as towers from "./towers.compiled.ts";

export { DIFF_AMBIGUOUS, DIFF_IMPOSSIBLE };

/** Why a Towers-specific deduction forced a candidate change — the premise the
 * hint narrates and highlights. Together with {@link LatinReason} it covers
 * every technique the hint narrates; the `kind`s never collide.
 * `fullLine`/`tallestNearest` come from the hint planner's own extreme-clue
 * check, not from the recording solver. */
export type TowersReason =
  /** A clue equal to the grid width — the whole line must climb `1..w`. */
  | { kind: "fullLine"; clue: number; clueVal: number }
  /** A clue of `1` — the tallest tower must stand next to the clue. */
  | { kind: "tallestNearest"; clue: number; clueVal: number }
  /** A pair of facing clues summing to `w+1` fixes the tallest tower's spot. */
  | { kind: "facing"; clue: number; clue2: number; clueVal: number }
  /** The clue already sees an increasing run one short of its count, so the
   * cell next to the clue must hold the tallest remaining tower. */
  | { kind: "lineFull"; clue: number; clueVal: number }
  /** A height too tall to hide this close to the clue (the lower-bound rule). */
  | { kind: "lowerBound"; clue: number; clueVal: number; height: number }
  /** No valid height arrangement giving exactly `clueVal` visible towers puts
   * this height here (the hard exhaustive-arrangement rule). */
  | { kind: "arrangement"; clue: number; clueVal: number }
  /** The singles the hint plan re-derives from the working board at placement
   * time (the recording solver records them all as `single`). */
  | SingleReason;

/** A reason attached to a recorded Towers deduction. */
export type HintReason = TowersReason | LatinReason;

/** One recorded Towers deduction op (a {@link DeductionRecord} with a narrowed
 * reason). */
export interface HintOp extends DeductionRecord {
  reason: HintReason;
}

/** Shared, mutable solver context (upstream `struct solver_ctx`). `started`
 * gates the one-off facing-clue deduction and, as upstream's, persists across
 * the fixpoint and recursion (no per-recursion copy). */
interface TowersCtx {
  w: number;
  clues: Int32Array;
  started: boolean;
}

// --- solver_easy -----------------------------------------------------------

function solverEasy(solver: LatinSolver, ctx: TowersCtx): number {
  const w = ctx.w;
  const clues = ctx.clues;
  const posOf = new Int32Array(w + 1);
  let ret = 0;

  if (!ctx.started) {
    ctx.started = true;
    /*
     * One-off: a pair of facing clues summing to w+1 means the line is two
     * increasing runs back-to-back, so the tallest tower's position is fixed
     * — place it immediately.
     */
    for (let c = 0; c < 3 * w; c = c === w - 1 ? 2 * w : c + 1) {
      const c2 = c + w;
      if (clues[c] && clues[c2] && clues[c] + clues[c2] === w + 1) {
        const cells = lineCells(c, w);
        const cell = cells[clues[c] - 1];
        if (!solver.cubeGet(cell.x, cell.y, w)) return -1;
        // A tower already standing there is no deduction.
        if (solver.grid[cell.y * w + cell.x] === 0) {
          solver.place(
            cell.x,
            cell.y,
            w,
            solver.recorder
              ? { kind: "facing", clue: c, clue2: c2, clueVal: clues[c] }
              : undefined,
          );
          ret = 1;
        }
      }
    }
    if (ret) return ret;
  }

  for (let c = 0; c < 4 * w; c++) {
    const clue = clues[c];
    if (!clue) continue;
    const cells = lineCells(c, w);

    // posOf[v-1] = position (along the line) of height v, or w if absent.
    for (let i = 0; i < w; i++) posOf[i] = w;
    for (let i = 0; i < w; i++) {
      const v = solver.grid[cells[i].y * w + cells[i].x];
      if (v) posOf[v - 1] = i;
    }

    // Find the increasing run of the very highest heights already visible.
    let n = 0;
    let furthest = w;
    for (let i = w; i >= 1; i--) {
      if (posOf[i - 1] === w) {
        break;
      } else if (posOf[i - 1] < furthest) {
        furthest = posOf[i - 1];
        n++;
      }
    }

    if (clue === n + 1 && furthest > 1) {
      /*
       * We can already see an increasing run of the highest heights, one
       * short of the clue, so the cell next to the clue must hold the final
       * (largest-so-far) one — rule out the small heights there.
       */
      let j = furthest - 1; // number of small heights we can rule out
      for (let i = 1; i <= w && j > 0; i++) {
        if (posOf[i - 1] < w && posOf[i - 1] >= furthest) continue; // elsewhere
        j--;
        const cell = cells[0];
        if (solver.cubeGet(cell.x, cell.y, i)) {
          if (solver.recorder) {
            solver.recorder({
              kind: "elim",
              x: cell.x,
              y: cell.y,
              n: i,
              reason: { kind: "lineFull", clue: c, clueVal: clue },
              group: solver.group,
            });
          }
          solver.cube[solver.cubepos(cell.x, cell.y, i)] = 0;
          ret = 1;
        }
      }
    }

    if (ret) return ret;

    /*
     * Lower bounds: the largest height can't sit in the first (clue−1) cells,
     * the second-largest (discounting any already hidden behind a larger one)
     * not in the first (clue−2), and so on.
     */
    let rank = 0;
    for (let height = w; height > 0; height--) {
      if (posOf[height - 1] < w) {
        let mm: number;
        for (mm = height + 1; mm < w; mm++) {
          if (posOf[mm] < posOf[height - 1]) break;
        }
        if (mm < w) continue; // this height is behind a larger one; skip
      }
      for (let j = 0; j < clue - rank - 1; j++) {
        const cell = cells[j];
        if (solver.cubeGet(cell.x, cell.y, height)) {
          if (solver.recorder) {
            solver.recorder({
              kind: "elim",
              x: cell.x,
              y: cell.y,
              n: height,
              reason: { kind: "lowerBound", clue: c, clueVal: clue, height },
              group: solver.group,
            });
          }
          solver.cube[solver.cubepos(cell.x, cell.y, height)] = 0;
          ret = 1;
        }
      }
      rank++;
    }

    // On the hint-recording path, return as soon as a clue's lower-bound
    // eliminations fire, so each recorded firing (one `solver.group`) covers a
    // single clue and a step's struck marks never bleed in from another clue's
    // line. The recorder-off path keeps accumulating across clues, as upstream
    // does (the differential checks it); `lineFull` above returns per clue on
    // every path.
    if (solver.recorder && ret) return ret;
  }

  return ret;
}

// --- solver_hard -----------------------------------------------------------

function solverHard(solver: LatinSolver, ctx: TowersCtx): number {
  const w = ctx.w;
  const clues = ctx.clues;
  const possible = new Int32Array(w);
  const stack = new Int32Array(w + 1);

  for (let c = 0; c < 4 * w; c++) {
    const clue = clues[c];
    if (!clue) continue;
    const cells = lineCells(c, w);

    for (let i = 0; i < w; i++) possible[i] = 0;

    /*
     * Enumerate every height arrangement of the line consistent with the cube
     * and giving exactly `clue` visible towers, OR-ing each into `possible`
     * (per-position set of heights that can occur). `stack` holds the heights
     * placed so far; `best`/`n` track the running maximum and visible count.
     */
    let i = 0;
    stack[0] = 0;
    let best = 0;
    let n = 0;
    let bitmap = 0;

    while (true) {
      if (i < w) {
        const limit = n === clue ? best : w;
        const cell = cells[i];
        let j = stack[i] + 1;
        for (; j <= limit; j++) {
          if (bitmap & (1 << j)) continue;
          if (!solver.cubeGet(cell.x, cell.y, j)) continue;
          break;
        }

        if (j > limit) {
          i--;
          if (i < 0) break;
          bitmap &= ~(1 << stack[i]);
          if (stack[i] === best) {
            n--;
            best = 0;
            for (let k = 0; k < i; k++) if (best < stack[k]) best = stack[k];
          }
        } else {
          bitmap |= 1 << j;
          stack[i++] = j;
          if (j > best) {
            best = j;
            n++;
          }
          stack[i] = 0;
        }
      } else {
        if (n === clue) {
          for (let j = 0; j < w; j++) possible[j] |= 1 << stack[j];
        }
        i--;
        bitmap &= ~(1 << stack[i]);
        if (stack[i] === best) {
          n--;
          best = 0;
          for (let k = 0; k < i; k++) if (best < stack[k]) best = stack[k];
        }
      }
    }

    let ret = 0;
    for (let pos = 0; pos < w; pos++) {
      const cell = cells[pos];
      for (let j = 1; j <= w; j++) {
        if (solver.cubeGet(cell.x, cell.y, j) && !(possible[pos] & (1 << j))) {
          if (solver.recorder) {
            solver.recorder({
              kind: "elim",
              x: cell.x,
              y: cell.y,
              n: j,
              reason: { kind: "arrangement", clue: c, clueVal: clue },
              group: solver.group,
            });
          }
          solver.cube[solver.cubepos(cell.x, cell.y, j)] = 0;
          ret = 1;
        }
      }
      // Revert to easier deductions as soon as one clue yields something.
      if (ret) return ret;
    }
  }

  return 0;
}

// --- validator -------------------------------------------------------------

function towersValid(solver: LatinSolver, ctx: TowersCtx): boolean {
  const w = ctx.w;
  const clues = ctx.clues;
  for (let c = 0; c < 4 * w; c++) {
    const clue = clues[c];
    if (!clue) continue;
    const cells = lineCells(c, w);
    let n = 0;
    let best = 0;
    for (let i = 0; i < w; i++) {
      const v = solver.grid[cells[i].y * w + cells[i].x];
      if (v > best) {
        best = v;
        n++;
      }
    }
    if (n !== clue) return false;
  }
  return true;
}

// --- the described ladder ----------------------------------------------------

/** The facing pair whose tower a facing firing placed in `cell`: the first,
 * as the firing's facts are made in the pairs' order. */
function facingReason(
  P: readonly number[],
  cell: number,
  cl: towers.Clues,
  sp: LatinSolver["sp"],
): TowersReason {
  const s = P.find((s) => sp.sight[s][clueAt(cl.sees, s) - 1] === cell) as number;
  return {
    kind: "facing",
    clue: s,
    clue2: sp.opposite[s],
    clueVal: clueAt(cl.sees, s),
  };
}

const TOWERS_LADDER: Record<towers.LadderId, (cl: towers.Clues) => LatinRung> = {
  facing: (cl) =>
    compiledRung(towers.facing, cl, ({ P }, cell, _n, solver) =>
      facingReason(P, cell, cl, solver.sp),
    ),
  bounds: (cl) =>
    compiledRung(
      towers.bounds,
      cl,
      ({ s, v, near }, _c, n): TowersReason =>
        near
          ? { kind: "lineFull", clue: s, clueVal: v }
          : { kind: "lowerBound", clue: s, clueVal: v, height: n },
    ),
  "latin.hiddenSingle": () => LATIN_RUNGS["latin.hiddenSingle"],
  "latin.single": () => LATIN_RUNGS["latin.single"],
  arrangement: (cl) =>
    compiledRung(
      towers.arrangement,
      cl,
      ({ s, v }): TowersReason => ({ kind: "arrangement", clue: s, clueVal: v }),
    ),
  "latin.set": () => LATIN_RUNGS["latin.set"],
  "latin.fish": () => LATIN_RUNGS["latin.fish"],
  "latin.wing": () => LATIN_RUNGS["latin.wing"],
};

/** The ladder over the dealt clues: each clue at its slot, which is its index
 * in `clues`, in that order. */
function describedLadder(w: number, clues: Int32Array): LatinLadder {
  const at: number[] = [];
  const v: number[] = [];
  clues.forEach((n, s) => {
    if (n) {
      at.push(s);
      v.push(n);
    }
  });
  const cl: towers.Clues = { sees: clueList(at, v, 4 * w) };
  return {
    ladder: towers.ladder.map(({ id, tier }) => ({ tier, run: TOWERS_LADDER[id](cl) })),
  };
}

// --- driver ----------------------------------------------------------------

function solveHandWritten(
  w: number,
  clues: Int32Array,
  soln: Uint8Array,
  maxdiff: number,
  recorder?: (rec: DeductionRecord) => void,
  cubeOut?: Uint8Array,
): number {
  const ctx: TowersCtx = { w, clues, started: false };
  return latinSolver<TowersCtx>(soln, w, {
    maxdiff,
    diffSimple: DIFF_EASY,
    diffSet0: DIFF_HARD,
    diffSet1: DIFF_EXTREME,
    diffRecursive: DIFF_UNREASONABLE,
    usersolvers: [solverEasy, solverHard, null, null],
    valid: towersValid,
    ctx,
    recorder,
    cubeOut,
  });
}

function solveDescribed(
  w: number,
  clues: Int32Array,
  soln: Uint8Array,
  maxdiff: number,
  recorder?: (rec: DeductionRecord) => void,
  cubeOut?: Uint8Array,
): number {
  return latinSolver<TowersCtx>(soln, w, {
    maxdiff,
    diffRecursive: DIFF_UNREASONABLE,
    valid: towersValid,
    ctx: { w, clues, started: false },
    recorder,
    cubeOut,
    ...describedLadder(w, clues),
  });
}

/**
 * Solve the `w × w` Towers board with edge `clues` into `soln` (0 = blank),
 * up to difficulty `maxdiff`. Returns the difficulty level reached, or a
 * `DIFF_IMPOSSIBLE`/`DIFF_AMBIGUOUS`/`DIFF_UNFINISHED` sentinel.
 */
export function solveTowers(
  w: number,
  clues: Int32Array,
  soln: Uint8Array,
  maxdiff: number,
  recorder?: (rec: DeductionRecord) => void,
): number {
  if (COMPARE.handWritten) return solveHandWritten(w, clues, soln, maxdiff, recorder);
  if (!COMPARE.on) return solveDescribed(w, clues, soln, maxdiff, recorder);
  // Both ladders on copies, compared in what they return, the grid, the cube
  // and every record; the compiled one's results are the call's.
  const input = soln.join(",");
  const g1 = soln.slice();
  const c0 = new Uint8Array(w * w * w);
  const c1 = new Uint8Array(w * w * w);
  const r0: DeductionRecord[] = [];
  const r1: DeductionRecord[] = [];
  const hand = solveHandWritten(
    w,
    clues,
    g1,
    maxdiff,
    recorder ? (r) => r0.push(r) : undefined,
    c1,
  );
  const built = solveDescribed(
    w,
    clues,
    soln,
    maxdiff,
    recorder ? (r) => r1.push(r) : undefined,
    c0,
  );
  COMPARE.compared++;
  for (const r of r0) {
    const k = (r.reason as { kind?: string } | null)?.kind ?? "none";
    COMPARE.reasons.set(k, (COMPARE.reasons.get(k) ?? 0) + 1);
  }
  const a = r0.map((r) => JSON.stringify(r));
  const b = r1.map((r, i) => JSON.stringify(sortKeysLike(r, r0[i] ?? null)));
  let at = 0;
  while (at < a.length && a[at] === b[at]) at++;
  const what = [
    hand !== built ? "return" : "",
    g1.some((v, i) => v !== soln[i]) ? "grid" : "",
    c0.some((v, i) => v !== c1[i]) ? "cube" : "",
    at < a.length || at < b.length ? "records" : "",
  ].filter((s) => s !== "");
  if (what.length > 0)
    COMPARE.mismatches.push({
      what: what.join(" "),
      input,
      clues: clues.join(","),
      w,
      maxdiff,
      hand,
      built,
      record: at,
      handRecord: a[at] ?? null,
      builtRecord: b[at] ?? null,
    });
  for (const r of r1) recorder?.(r);
  return built;
}

/** The comparison's switch and tally (`describe-towers` tasks 2.3). */
export const COMPARE = {
  on: false,
  /** Run the hand-written deductions alone, for the speed runs. */
  handWritten: false,
  compared: 0,
  mismatches: [] as Record<string, unknown>[],
  /** The hand-written records compared, by their reason's kind. */
  reasons: new Map<string, number>(),
};

/** `r`'s JSON with its reason's keys in `like`'s order, so key order is not a
 * difference. */
function sortKeysLike(r: DeductionRecord, like: DeductionRecord | null): unknown {
  if (like === null) return r;
  const order = (a: unknown, b: unknown): unknown => {
    if (a === null || typeof a !== "object" || b === null || typeof b !== "object")
      return a;
    if (Array.isArray(a))
      return a.map((x, i) => order(x, Array.isArray(b) ? b[i] : undefined));
    const out: Record<string, unknown> = {};
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    for (const k of Object.keys(bo)) if (k in ao) out[k] = order(ao[k], bo[k]);
    for (const k of Object.keys(ao)) if (!(k in out)) out[k] = ao[k];
    return out;
  };
  return order(r, like);
}

/**
 * Run the recording solver on a sound candidate cube seeded from `grid` (the
 * placed givens/entries only — never the player's notes), up to `maxdiff`, and
 * return every candidate elimination and cell placement it makes, in solver
 * order, each tagged with the rule + premise that forced it — the raw
 * deduction script a hint narrates. `grid` is read-only (a copy is solved).
 */
export function recordTowersDeductions(
  w: number,
  clues: Int32Array,
  grid: Uint8Array,
  maxdiff: number,
): HintOp[] {
  const ops: HintOp[] = [];
  solveTowers(w, clues, grid.slice(), maxdiff, (rec) => ops.push(rec as HintOp));
  return ops;
}
