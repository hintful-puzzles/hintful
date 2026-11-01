/**
 * Clusters' solver: the ladder `clusters.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), with the
 * reason each technique records for the hint; the answer check its rules
 * compile to; the search for a board's answers over the ladder; and the
 * error overlay the renderer and the mistake check read.
 *
 * Easy's techniques each refute one color of one square by the rule it would
 * break at once, at the square or at a tile beside it. Normal's read two
 * tiles' counts over the squares both touch. Upstream's Normal ran the Easy
 * fixpoint from a supposed color, a Search, which the count replaced on
 * 2026-10-28; a board that needs it is Unreasonable, and the search for its
 * answer is {@link answerSearch}. The generator is solver-gated, so this
 * ladder's verdict on every board it tries decides which puzzles exist.
 */

import { type Answer, searchAnswers } from "../../engine/answer-search.ts";
import { clueList, describedSpace } from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  runLadder,
  TIERS as SCALE,
  type Taken,
} from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import * as clusters from "./clusters.compiled.ts";
import {
  type ClustersFill,
  COLMASK,
  DIFF_TRICKY,
  F_COLOR_0,
  F_COLOR_1,
  F_SINGLE,
  opposite,
} from "./state.ts";

export const COMPLETE = 0;
export const UNFINISHED = 1;
export const INVALID = 2;
export type ClustersStatus = typeof COMPLETE | typeof UNFINISHED | typeof INVALID;

const DX = [-1, 1, 0, 0];
const DY = [0, 0, -1, 1];

// --- the error overlay -------------------------------------------------------
//
// The overlay marks a tile whose rule is already broken on a board still
// being filled, which no rule of the answer says; the answer check is the
// description's rules, compiled.

/** Same- and other-color orthogonal-neighbor counts of cell `(x,y)` relative
 * to color `col` (a `COLMASK` value), plus how many neighbors exist at all
 * (`max`) — upstream `clusters_count` summed over the four directions. */
function neighborCounts(
  grid: Uint8Array,
  w: number,
  h: number,
  x: number,
  y: number,
  col: number,
): { same: number; other: number; max: number } {
  let same = 0;
  let other = 0;
  let max = 0;
  for (let d = 0; d < 4; d++) {
    const nx = x + DX[d];
    const ny = y + DY[d];
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    max++;
    const nc = grid[ny * w + nx] & COLMASK;
    if (nc === col) same++;
    else if (nc !== 0) other++;
  }
  return { same, other, max };
}

/** Which rule the filled cell `i` breaks, or null — upstream
 * `clusters_validate`'s three error conditions, in its order:
 *  - `surrounded`: wholly surrounded by the other color (`other === max`);
 *  - `dotOvercount`: a dot (`F_SINGLE`) touching more than one same-color
 *    neighbor;
 *  - `reachTwo`: a non-dot that can no longer reach two same-color neighbors
 *    (`other === max - 1`). */
function errorKind(
  grid: Uint8Array,
  w: number,
  h: number,
  i: number,
): ClustersRuleKind | null {
  const cell = grid[i];
  const col = cell & COLMASK;
  if (col === 0) return null;
  const x = i % w;
  const y = (i - x) / w;
  const { same, other, max } = neighborCounts(grid, w, h, x, y, col);
  if (other === max) return "surrounded";
  if (cell & F_SINGLE && same > 1) return "dotOvercount";
  if (!(cell & F_SINGLE) && other === max - 1) return "reachTwo";
  return null;
}

/** Classify `grid`: INVALID where a tile breaks a rule, else UNFINISHED where
 * a square is empty, else COMPLETE. `errors`, if given, collects the
 * offending cells. */
function classify(
  grid: Uint8Array,
  w: number,
  h: number,
  errors?: number[],
): ClustersStatus {
  let anyEmpty = false;
  let anyError = false;
  for (let i = 0; i < w * h; i++) {
    if (grid[i] === 0) {
      anyEmpty = true;
      continue;
    }
    if (errorKind(grid, w, h, i) !== null) {
      anyError = true;
      errors?.push(i);
    }
  }
  if (anyError) return INVALID;
  return anyEmpty ? UNFINISHED : COMPLETE;
}

/** Whether `grid` breaks a rule, is unfinished, or is complete, read off its
 * tiles. */
export function clustersStatus(grid: Uint8Array, w: number, h: number): ClustersStatus {
  return classify(grid, w, h);
}

/** The indices of every cell that breaks a rule, for `findMistakes` and the
 * live-error renderer. */
export function findErrors(grid: Uint8Array, w: number, h: number): number[] {
  const errors: number[] = [];
  classify(grid, w, h, errors);
  return errors;
}

// --- the described ladder ------------------------------------------------------

/** Which rule a refuted coloring breaks. */
export type ClustersRuleKind = "surrounded" | "dotOvercount" | "reachTwo";

/** The rule violation a refuted coloring runs into: `cell` is where the
 * board breaks (the tentatively-colored cell itself, or a neighbor). */
export interface ClustersContradiction {
  kind: ClustersRuleKind;
  cell: number;
}

export type ClustersReason =
  | { kind: "direct"; at: ClustersContradiction }
  /** Tile `b`'s count over the squares it shares with tile `a` settles
   * `a`'s other empty neighbors: `full` where `a`'s last tile of its color
   * must be among the shared squares, `short` where at most `most` of them
   * can take `a`'s color and `a` needs every other. */
  | { kind: "count"; a: number; b: number; shared: number[]; form: "full" }
  | {
      kind: "count";
      a: number;
      b: number;
      shared: number[];
      form: "short";
      most: number;
    };

/** The rungs a hint step can be: the reasons' kinds. */
export const CLUSTERS_RUNGS = ["direct", "count"] as const;
export type ClustersRung = (typeof CLUSTERS_RUNGS)[number];

/** One forced move: coloring `index` with `refuted` breaks `reason`, so it
 * must be `fill`. */
export interface ClustersDeduction {
  index: number;
  fill: ClustersFill;
  refuted: ClustersFill;
  reason: ClustersReason;
}

/** The rule a tile breaks with `room` squares beside it that hold or may hold
 * its color: none is surrounded, one is too few for a tile without a dot. */
const starved = (room: number): ClustersRuleKind =>
  room < 1 ? "surrounded" : "reachTwo";

/** The board's dots as the description reads them: where each is and its
 * color. */
function dealtOf(grid: Uint8Array): clusters.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  grid.forEach((tile, i) => {
    if (!(tile & F_SINGLE)) return;
    at.push(i);
    v.push(tile & COLMASK);
  });
  return { dot: clueList(at, v, grid.length) };
}

/** The ladder over the dots `dealt` deals. */
function clustersLadder(dealt: clusters.Dealt): Ladder {
  const direct = (kind: ClustersRuleKind, cell: number): ClustersReason => ({
    kind: "direct",
    at: { kind, cell },
  });
  return describedLadder(clusters, {
    broken: compiledRung(clusters.broken, dealt, () => {
      throw new Error("a broken tile makes no fact, only a contradiction");
    }),
    refute: compiledRung(clusters.refute, dealt, ({ x, d, n, e, r }) =>
      direct(n === x || e !== d ? starved(r) : "dotOvercount", n),
    ),
    countFull: compiledRung(
      clusters.countFull,
      dealt,
      ({ a, b, S }): ClustersReason => ({
        kind: "count",
        a,
        b,
        shared: [...S],
        form: "full",
      }),
    ),
    countShort: compiledRung(
      clusters.countShort,
      dealt,
      ({ a, b, S, most }): ClustersReason => ({
        kind: "count",
        a,
        b,
        shared: [...S],
        form: "short",
        most,
      }),
    ),
  });
}

/** The values a square may hold: either color. */
const DOMAIN = (1 << F_COLOR_0) | (1 << F_COLOR_1);

/** The marks the ladder reads, on `colors`, each square's color or 0. */
function marksOf(colors: Uint8Array, w: number, h: number): CellMarks {
  const m = new CellMarks(describedSpace(clusters.units, w, h), DOMAIN, colors);
  m.seed(colors);
  return m;
}

/** Whether every square of `grid` holds a color and the rules hold of them,
 * by the rules the description compiles to. */
export function isAnswer(grid: Uint8Array, w: number, h: number): boolean {
  return clusters.isAnswer(
    grid.map((tile) => tile & COLMASK),
    describedSpace(clusters.units, w, h),
    dealtOf(grid),
  );
}

/** How a run of the ladder over `colors` ended. */
function verdictOf(
  impossible: boolean,
  colors: Uint8Array,
  grid: Uint8Array,
  w: number,
  h: number,
): ClustersStatus {
  if (impossible) return INVALID;
  if (colors.includes(0)) return UNFINISHED;
  return isAnswer(grid, w, h) ? COMPLETE : INVALID;
}

/**
 * Run the ladder to a fixpoint capped at tier `maxdiff`, coloring `grid`'s
 * empty squares in place, and say how it ended: COMPLETE where it solved the
 * board, INVALID on a contradiction, UNFINISHED where it stopped short.
 */
export function solveGame(
  grid: Uint8Array,
  w: number,
  h: number,
  maxdiff: number,
): ClustersStatus {
  const colors = grid.map((tile) => tile & COLMASK);
  const m = marksOf(colors, w, h);
  const { entries } = clustersLadder(dealtOf(grid));
  const impossible = runLadder(
    m,
    ladderTechniques(m, entries, { [SCALE]: maxdiff }, {}),
  );
  for (let i = 0; i < grid.length; i++) if (grid[i] === 0) grid[i] = colors[i];
  return verdictOf(impossible, colors, grid, w, h);
}

/** How many positions {@link answerSearch} may try. Lowering it refuses
 * boards in saved games: those of Unreasonable, and those dealt at Normal
 * before 2026-10-28, which may need the supposition Normal then had. Of 90 of
 * those, dealt at 7x7, 6x8 and 9x9, 74 do, and each took at most 25 positions
 * (2026-10-28). */
const ANSWER_BUDGET = 5000;

/**
 * The answers of the board `givens` holds, counted to two by trial and error
 * over the whole ladder: where it stops, an empty square is tried in each
 * color and the ladder run again. The answer is the board's tiles.
 */
export function answerSearch(
  givens: Uint8Array,
  w: number,
  h: number,
  budget = ANSWER_BUDGET,
): Answer<Uint8Array> {
  return searchAnswers<Uint8Array, Uint8Array>({
    start: givens.slice(),
    deduce: (grid) => {
      const status = solveGame(grid, w, h, DIFF_TRICKY);
      if (status === COMPLETE) return "solved";
      return status === INVALID ? "contradiction" : "stuck";
    },
    assume: (grid) => {
      const i = grid.indexOf(0);
      return [F_COLOR_0, F_COLOR_1].map((fill) => {
        const copy = grid.slice();
        copy[i] = fill;
        return copy;
      });
    },
    solution: (grid) => grid.slice(),
    budget,
  });
}

// --- hint plan --------------------------------------------------------------

/** The whole remaining plan. `verdict` COMPLETE means the deductions solve
 * the board — which also *certifies the position*: the rules only break more
 * as squares fill, so a complete grid the rules hold of is the unique
 * solution, and a position containing a wrong tile cannot end COMPLETE.
 *
 * On a board this deduction solves from its givens, which every dealt board
 * is, such a position ends INVALID and never UNFINISHED. Each refutation the
 * solve from the givens used still holds with more cells filled, so the plan
 * goes on placing solution colors until it meets the wrong tile, and that
 * tile's own refutation is then on the board: a broken tile at once, or one
 * the single-cell refutations run into. UNFINISHED is left for a board the
 * deduction cannot finish from its givens, which only a typed-in description
 * can be. */
export interface ClustersHintPlan {
  verdict: ClustersStatus;
  deductions: ClustersDeduction[];
}

/**
 * Walk the ladder from the player's current grid, one firing at a time, the
 * one that carries on from the squares the last colored (`ladderWalk`), and
 * record each square it colors with the rule its other color would break, or
 * the counts that settle it: the data a hint narrates. A count firing colors
 * several squares, each a deduction of its own with the firing's reason.
 * Operates on a copy.
 */
export function deduceHintPlan(
  grid0: Uint8Array,
  w: number,
  h: number,
): ClustersHintPlan {
  const grid = grid0.slice();
  const colors = grid.map((tile) => tile & COLMASK);
  const m = marksOf(colors, w, h);
  m.budget = stepBudget("clusters hint");
  const around = (c: number): number[] => {
    const x = c % w;
    const y = (c - x) / w;
    return [
      c,
      ...(x > 0 ? [c - 1] : []),
      ...(x < w - 1 ? [c + 1] : []),
      ...(y > 0 ? [c - w] : []),
      ...(y < h - 1 ? [c + w] : []),
    ];
  };
  // The squares a firing colors, and the tile whose rule its other color
  // breaks or the two tiles whose counts it reads, each with the squares
  // beside it.
  const reads = ({ facts, reasons }: Taken): number[] => {
    const reason = reasons[0] as ClustersReason;
    const read = reason.kind === "direct" ? [reason.at.cell] : [reason.a, reason.b];
    const own: number[] = [];
    for (let i = 0; i < facts.length; i += 3) own.push(facts[i + 1] as number);
    return [...own, ...read].flatMap(around);
  };
  const { entries } = clustersLadder(dealtOf(grid));
  const walk = ladderWalk(m, entries, { [SCALE]: DIFF_TRICKY }, reads);
  const deductions: ClustersDeduction[] = [];
  let f = walk.next();
  for (; f !== null && f !== "contradiction"; f = walk.next())
    for (let i = 0; i < f.facts.length; i += 3) {
      const index = f.facts[i + 1] as number;
      const fill = f.facts[i + 2] as ClustersFill;
      grid[index] = fill;
      deductions.push({
        index,
        fill,
        refuted: opposite(fill),
        reason: f.reasons[i / 3] as ClustersReason,
      });
    }
  return { verdict: verdictOf(f === "contradiction", colors, grid, w, h), deductions };
}
