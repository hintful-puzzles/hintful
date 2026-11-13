/**
 * Palisade's solver: the ladder `palisade.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), the answer
 * check its rules compile to, and the search beneath the ladder.
 *
 * The answer is on the edges between squares side by side, each a wall or
 * none, and a group is the squares the edges known to have none join. The
 * ladder is Easy: upstream's six deductions, and `inside`, which opens an
 * edge whose two squares the open edges already join, as upstream's
 * union-find joined them without a mark. Beneath it, a search by trial and
 * error ({@link searchAnswers}) counts a board's answers to two: it serves
 * the Solve command and `findMistakes`, and deals the Unreasonable tier. An
 * Easy board is one the ladder finishes.
 *
 * A hint walks the same ladder, one firing at a time ({@link hintFirings}).
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import {
  BORDER,
  BORDER_D,
  BORDER_L,
  BORDER_R,
  BORDER_U,
  DISABLED,
  initBorders,
} from "../../engine/border-grid.ts";
import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import { Dsf } from "../../engine/dsf.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import * as palisade from "./palisade.compiled.ts";
import type { PalisadeShape } from "./state.ts";

/** What the description reads an edge as holding. */
export const WALL = 1;
const OPEN = 2;

/** Which of the ladder's techniques forced an edge. */
export type PalisadeRule = palisade.LadderId;

/** The ladder's techniques, in its order. */
export const palisadeLadderIds: readonly PalisadeRule[] = palisade.ladder.map(
  (e) => e.id,
);

/** What each technique says, as the hint's sentences read it. */
export type PalisadeSays = palisade.SaysById;

// --- the board as the description reads it -----------------------------------

/** The last board size's space, which every move's `status` reads again. */
let lastSpace: GridSpace | null = null;
function spaceOf(w: number, h: number): GridSpace {
  if (lastSpace?.w !== w || lastSpace.h !== h)
    lastSpace = describedSpace(palisade.units, w, h);
  return lastSpace;
}

/** The board as the description deals it: the numbers showing, each square's
 * from 0 to 4 and below 0 where it shows none, and the region size. */
function dealtOf(p: PalisadeShape, clues: Int8Array): palisade.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  clues.forEach((n, c) => {
    if (n < 0) return;
    at.push(c);
    v.push(n);
  });
  return { number: clueList(at, v, clues.length), k: p.k };
}

/** The side of square `a` that edge `e` is, and the square across it. */
function sideOf(sp: GridSpace, e: number, a: number): { dir: number; to: number } {
  const p = sp.edgeEnds[2 * e];
  const q = sp.edgeEnds[2 * e + 1];
  // A grid one square wide has its squares below one another `p + 1` apart.
  const down = q === p + sp.w;
  if (a === p) return { dir: down ? 2 : 1, to: q };
  return { dir: down ? 0 : 3, to: p };
}

/** What the description reads each edge as holding on `borders`, the
 * border-grid byte a square: a wall, a no-wall mark, or 0 for neither. */
function valuesOf(sp: GridSpace, borders: Uint8Array): Uint8Array {
  const values = new Uint8Array(sp.edges.length);
  for (const e of sp.edges) {
    const p = sp.edgeEnds[2 * e];
    const b = BORDER(sideOf(sp, e, p).dir);
    values[e] = borders[p] & b ? WALL : borders[p] & DISABLED(b) ? OPEN : 0;
  }
  return values;
}

/** Whether the edges `g` hold, every one without a wall read as none, divide
 * the grid into regions of `k` squares that meet every number. */
function wallsAnswer(g: ArrayLike<number>, sp: GridSpace, dl: palisade.Dealt): boolean {
  return palisade.isAnswer(
    Uint8Array.from(g, (v) => (v === WALL ? WALL : OPEN)),
    sp,
    dl,
  );
}

/** Whether `borders` is solved: the walls divide the grid into regions of `k`
 * squares, with no wall inside one, and every number counts the walls round
 * its square. An edge with no wall is read as none, marked or not. */
export function isSolved(
  p: PalisadeShape,
  clues: Int8Array,
  borders: Uint8Array,
): boolean {
  const sp = spaceOf(p.w, p.h);
  return wallsAnswer(valuesOf(sp, borders), sp, dealtOf(p, clues));
}

/** The ladder over the dealt board. */
function palisadeLadder(dl: palisade.Dealt): Ladder {
  return describedLadder(palisade, {
    cluesVersusRegionSize: compiledRung(palisade.cluesVersusRegionSize, dl),
    numberExhausted: compiledRung(palisade.numberExhausted, dl),
    notTooBig: compiledRung(palisade.notTooBig, dl),
    notTooSmall: compiledRung(palisade.notTooSmall, dl),
    noDanglingEdges: uncluedRung(palisade.noDanglingEdges),
    equivalentEdges: compiledRung(palisade.equivalentEdges, dl),
    inside: uncluedRung(palisade.inside),
  });
}

/** The working state of a deduction: the marks on the edges, and the ladder
 * over the board's numbers. */
export interface Deduction {
  m: CellMarks;
  ladder: Ladder;
  dl: palisade.Dealt;
}

/** The marks over `borders`, each wall and no-wall mark on it placed, and
 * every edge undecided where no `borders` is given. */
export function deduction(
  p: PalisadeShape,
  clues: Int8Array,
  borders: Uint8Array | null = null,
): Deduction {
  const sp = spaceOf(p.w, p.h);
  const dl = dealtOf(p, clues);
  const grid =
    borders === null ? new Uint8Array(sp.edges.length) : valuesOf(sp, borders);
  const m = new CellMarks(sp, rangeMask(WALL, OPEN), grid, null, "edge");
  m.seed(grid);
  return { m, ladder: palisadeLadder(dl), dl };
}

/** A copy of `d` that shares no marks with it, for a search to assume on. */
function copied(d: Deduction): Deduction {
  const m = new CellMarks(d.m.sp, d.m.domain, d.m.grid.slice(), null, "edge");
  m.cands.set(d.m.cands);
  return { ...d, m };
}

/** The squares the edges known to have no wall join. */
function groupsOf(m: CellMarks): Dsf {
  const { sp } = m;
  const dsf = new Dsf(sp.cells.length);
  for (const e of sp.edges)
    if (m.grid[e] === OPEN) dsf.merge(sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]);
  return dsf;
}

/** What the marks hold on the edge between squares `a` and `b` side by side:
 * a wall, none, or 0 where neither is known. */
export function edgeValue(m: CellMarks, a: number, b: number): number {
  return m.grid[m.sp.edgeOf(a, b)];
}

/**
 * Where the ladder left the marks, it having found nothing inconsistent.
 * `"solved"` is the walls a division into regions of `k` that meets every
 * number: no further wall can then be drawn, since one would cut a region
 * short or stand inside it, so the edges still undecided are open.
 *
 * Under a wrong assumption the ladder may stop on marks that cannot be
 * finished without a rung saying so, and this says so where it can see it at
 * once: a wall inside a group, a group past `k`, or a number with more walls
 * than it shows or too few edges left to reach it.
 */
function verdictOf(d: Deduction): Deduced {
  const { m, dl } = d;
  const { sp } = m;
  if (wallsAnswer(m.grid, sp, dl)) return "solved";
  if (!m.grid.includes(0)) return "contradiction";
  const groups = groupsOf(m);
  for (const e of sp.edges)
    if (
      m.grid[e] === WALL &&
      groups.equivalent(sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1])
    )
      return "contradiction";
  for (const c of sp.cells) if (groups.size(c) > dl.k) return "contradiction";
  const { at, v } = dl.number;
  for (let i = 0; i < at.length; i++) {
    const c = at[i];
    let walls = 4 - sp.adj4[c].length;
    let undecided = 0;
    for (const y of sp.adj4[c]) {
      const value = edgeValue(m, c, y);
      if (value === WALL) walls++;
      else if (value === 0) undecided++;
    }
    if (walls > v[i] || walls + undecided < v[i]) return "contradiction";
  }
  return "stuck";
}

/**
 * Run the ladder on `d` to a fixpoint and say what it reached. `firings` is
 * the ladder census's channel (`palisade-ladder.test.ts`).
 */
export function deduce(d: Deduction, firings?: FiringTally): Deduced {
  const { m, ladder } = d;
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: 0 }, {}),
    { firings },
  );
  return impossible ? "contradiction" : verdictOf(d);
}

/** Whether the ladder finishes the board the numbers `clues` deal, from no
 * edge decided. */
export function ladderSolves(p: PalisadeShape, clues: Int8Array): boolean {
  return deduce(deduction(p, clues)) === "solved";
}

/** The walls of the answer the marks hold, every edge without one open: the
 * border-grid byte a square, walls only, the rim's included. */
function wallsOf(m: CellMarks): Uint8Array {
  const { sp } = m;
  const sol = initBorders(sp.w, sp.h);
  for (const e of sp.edges) {
    if (m.grid[e] !== WALL) continue;
    const p = sp.edgeEnds[2 * e];
    const down = sideOf(sp, e, p).dir === 2;
    sol[p] |= down ? BORDER_D : BORDER_R;
    sol[sp.edgeEnds[2 * e + 1]] |= down ? BORDER_U : BORDER_L;
  }
  return sol;
}

/** The unique solution's wall bytes (only wall bits set, including the rim),
 * or `null` if the ladder does not finish the board. */
export function solveToBorders(p: PalisadeShape, clues: Int8Array): Uint8Array | null {
  const d = deduction(p, clues);
  return deduce(d) === "solved" ? wallsOf(d.m) : null;
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a clue set's answers; the one answer is
 * each cell's walls. */
export type PalisadeAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one an edge
 * assumed a wall or not and the ladder run from it.
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
 * Count a clue set's answers up to two, by trial and error over the ladder:
 * where it stops, take an undecided edge of the number with the fewest left
 * and assume it each way.
 */
export function searchAnswers(
  p: PalisadeShape,
  clues: Int8Array,
  budget: number = SEARCH_BUDGET,
): PalisadeAnswer {
  return searchBoard<Deduction, Uint8Array>({
    start: deduction(p, clues),
    deduce: (d) => deduce(d),
    assume: assumeEdge,
    solution: (d) => wallsOf(d.m),
    budget,
  });
}

/**
 * The two positions a stuck one divides into: one undecided edge, a wall and
 * then not. The edge is the first undecided one of the number with the
 * fewest undecided edges, where either way is likeliest to settle the number;
 * with no such number it is the first undecided edge on the board. Not a
 * wall, the edge joins two groups, so every edge between them is open, since
 * no rung decides an edge inside one group before `inside`.
 */
function assumeEdge(d: Deduction): Deduction[] {
  const { m } = d;
  const { sp } = m;
  const { byAt } = d.dl.number;
  let at = -1;
  let to = -1;
  let fewest = Number.POSITIVE_INFINITY;
  for (const c of sp.cells) {
    let undecided = 0;
    let first = -1;
    for (const y of sp.adj4[c]) {
      if (edgeValue(m, c, y) !== 0) continue;
      undecided++;
      if (first < 0) first = y;
    }
    if (undecided === 0) continue;
    // A square without a number is taken only until a number's edge is found.
    const rank = byAt[c] < 0 ? 8 : undecided;
    if (rank >= fewest) continue;
    fewest = rank;
    at = c;
    to = first;
  }
  if (at < 0) return [];
  const walled = copied(d);
  walled.m.place(sp.edgeOf(at, to), WALL);
  const joined = copied(d);
  const groups = groupsOf(m);
  const ours = groups.canonify(at);
  const theirs = groups.canonify(to);
  for (const c of sp.cells) {
    if (groups.canonify(c) !== ours) continue;
    for (const q of sp.adj4[c])
      if (groups.canonify(q) === theirs) joined.m.place(sp.edgeOf(c, q), OPEN);
  }
  return [walled, joined];
}

/** Keyed on a state's clues, which every state of a game shares. */
const answers = answerCache<Int8Array, Uint8Array>();

/** What a search of a state's clues established about their answers. The
 * player's edges are not read. */
export function answerOf(state: PalisadeShape & { clues: Int8Array }): PalisadeAnswer {
  return answers(state.clues, () => searchAnswers(state, state.clues));
}

// --- the hint's walk ---------------------------------------------------------

/** What the hint's sentences need of the board besides what a firing says. */
export interface PalisadeWalkContext {
  sp: GridSpace;
  dl: palisade.Dealt;
}

/** Whether the walls the marks hold are the answer, an edge not walled being
 * read as open, marked or not. */
export function wallsAreAnswer(m: CellMarks, { dl }: PalisadeWalkContext): boolean {
  return wallsAnswer(m.grid, m.sp, dl);
}

/**
 * The marks over the player's `borders` (their no-wall marks joining squares,
 * their walls keeping groups apart) and the ladder, for the engine's walk to
 * take a firing at a time (`engine/described-edge-hint.ts`).
 */
export function palisadeWalk(
  state: PalisadeShape & { clues: Int8Array; borders: Uint8Array },
): {
  marks: CellMarks;
  entries: Ladder["entries"];
  ctx: PalisadeWalkContext;
} {
  const d = deduction(state, state.clues, state.borders);
  return { marks: d.m, entries: d.ladder.entries, ctx: { sp: d.m.sp, dl: d.dl } };
}
