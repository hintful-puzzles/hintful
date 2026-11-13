/**
 * Separate's solver: the ladder `separate.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), the answer
 * check its rules compile to, and the search beneath the ladder.
 *
 * The answer is on the edges between squares side by side, each a wall or
 * none, and a group is the squares the edges known to have none join. The
 * ladder is Easy, the three rungs upstream's `solver_attempt` ran: two groups
 * that hold a letter in common are walled apart, two with a wall between them
 * already have the rest of the edges between them walled, and a group short
 * of its size with one square left to grow into takes it. Beneath it, a search
 * by trial and error ({@link searchAnswers}) counts a board's answers to two:
 * it serves the Solve command and `findMistakes`, and deals the Unreasonable
 * tier. An Easy board is one the ladder finishes.
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
  type Said,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import * as separate from "./separate.compiled.ts";
import type { SeparateShape } from "./state.ts";

/** What the description reads an edge as holding. */
export const WALL = 1;
const OPEN = 2;

/** What each technique says, as the hint's sentences read it. */
export type SeparateSays = separate.SaysById;

// --- the board as the description reads it -----------------------------------

/** The last board size's space, which every move's `status` reads again. */
let lastSpace: GridSpace | null = null;
function spaceOf(w: number, h: number): GridSpace {
  if (lastSpace?.w !== w || lastSpace.h !== h)
    lastSpace = describedSpace(separate.units, w, h);
  return lastSpace;
}

/** The board as the description deals it: a letter on every square, and the
 * region size. */
function dealtOf(p: SeparateShape, letters: Uint8Array): separate.Dealt {
  const at = Array.from(letters, (_, c) => c);
  return { letter: clueList(at, Array.from(letters), letters.length), k: p.k };
}

/** The side of square `a` that edge `e` is, and the square across it. */
export function sideOf(
  sp: GridSpace,
  e: number,
  a: number,
): { dir: number; to: number } {
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

/** Whether `borders` is solved: the walls divide the grid into regions of `k`
 * squares, each holding no letter twice, with no wall inside one. An edge
 * with no wall is read as none, marked or not. */
export function isSolved(
  w: number,
  h: number,
  k: number,
  letters: Uint8Array,
  borders: Uint8Array,
): boolean {
  const sp = spaceOf(w, h);
  const g = valuesOf(sp, borders).map((v) => (v === WALL ? WALL : OPEN));
  return separate.isAnswer(g, sp, dealtOf({ w, h, k }, letters));
}

/** The ladder over the dealt board. */
function separateLadder(dl: separate.Dealt): Ladder {
  return describedLadder(separate, {
    sharedLetter: compiledRung(separate.sharedLetter, dl),
    walledApart: uncluedRung(separate.walledApart),
    onlyWay: compiledRung(separate.onlyWay, dl),
  });
}

/** The working state of a deduction: the marks on the edges, and the ladder
 * over the board's letters. */
export interface Deduction {
  m: CellMarks;
  ladder: Ladder;
  dl: separate.Dealt;
}

/** The marks over `borders`, each wall and no-wall mark on it placed, and
 * every edge undecided where no `borders` is given. */
export function deduction(
  p: SeparateShape,
  letters: Uint8Array,
  borders: Uint8Array | null = null,
): Deduction {
  const sp = spaceOf(p.w, p.h);
  const dl = dealtOf(p, letters);
  const grid =
    borders === null ? new Uint8Array(sp.edges.length) : valuesOf(sp, borders);
  const m = new CellMarks(sp, rangeMask(WALL, OPEN), grid, null, "edge");
  m.seed(grid);
  return { m, ladder: separateLadder(dl), dl };
}

/** `d`'s marks, kept, over the board `letters` deals: for a generator that
 * changes letters no firing has read, which leaves every fact true. */
export function redealt(
  d: Deduction,
  p: SeparateShape,
  letters: Uint8Array,
): Deduction {
  const dl = dealtOf(p, letters);
  return { m: d.m, ladder: separateLadder(dl), dl };
}

/** A copy of `d` that shares no marks with it, for a search to assume on. */
function copied(d: Deduction): Deduction {
  const m = new CellMarks(d.m.sp, d.m.domain, d.m.grid.slice(), null, "edge");
  m.cands.set(d.m.cands);
  return { ...d, m };
}

/** The squares the edges known to have no wall join. */
export function groupsOf(m: CellMarks): Dsf {
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
 * Run the ladder on `d` to a fixpoint and say what it reached. `read`, where
 * given, is told each square whose letter a firing read: the two that share
 * a letter, the only reading of a letter the ladder makes. `firings` is the
 * ladder census's channel (`separate-ladder.test.ts`).
 */
export function deduce(
  d: Deduction,
  read: Uint8Array | null = null,
  firings?: FiringTally,
): Deduced {
  const { m, ladder, dl } = d;
  if (read !== null) {
    m.recorder = (rec) => {
      const said = rec.reason as Said<separate.SharedLetterBinding, unknown>;
      // Only `sharedLetter`'s binding names the squares that hold the letter.
      if (!("d" in said.binding)) return;
      read[said.binding.x] = 1;
      read[said.binding.y] = 1;
    };
    m.wholePasses = true;
  }
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: 0 }, {}),
    {
      firings,
    },
  );
  m.recorder = undefined;
  if (impossible) return "contradiction";
  if (m.grid.includes(0)) return "stuck";
  return separate.isAnswer(m.grid, m.sp, dl) ? "solved" : "contradiction";
}

/** The walls of the answer the marks hold, every edge decided: the border-grid
 * byte a square, walls only, the rim's included. */
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

/**
 * The unique solution's wall bytes (only wall bits set, including the rim), or
 * `null` if the ladder does not finish the board.
 */
export function solveToBorders(
  p: SeparateShape,
  letters: Uint8Array,
): Uint8Array | null {
  const d = deduction(p, letters);
  return deduce(d) === "solved" ? wallsOf(d.m) : null;
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a board's answers; the one answer is each
 * square's walls. */
export type SeparateAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one a region
 * assumed to take a neighbor or not and the ladder run from it.
 *
 * It decides which Unreasonable boards exist: a board that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games. A dealt board needs 30 at most,
 * the generator's own bound, so the rest is room for a pasted one: measured
 * 2026-10-10, a fill drawn at random with one answer needs a median of 85 at
 * 6×6 with six letters and 197 at most of 30.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the ladder:
 * where it stops, take the group with the fewest squares it could still
 * grow into and assume it takes the first of them, then that it does not.
 */
export function searchAnswers(
  p: SeparateShape,
  letters: Uint8Array,
  budget: number = SEARCH_BUDGET,
): SeparateAnswer {
  return searchBoard<Deduction, Uint8Array>({
    start: deduction(p, letters),
    deduce: (d) => deduce(d),
    assume: assumeNeighbor,
    solution: (d) => wallsOf(d.m),
    budget,
  });
}

/**
 * The two positions a stuck one divides into: one group and one square
 * beside it that it may still take, joined and then walled apart. The group
 * is the one with the fewest such squares, where ruling one out is likeliest
 * to force another. Joined, every edge between the group and the square's is
 * open, since no rung decides an edge inside one group; walled apart, the
 * edges to the square are walls, and `walledApart` walls the rest.
 */
function assumeNeighbor(d: Deduction): Deduction[] {
  const { m } = d;
  const { sp } = m;
  const n = sp.cells.length;
  const groups = groupsOf(m);
  // Which groups have a wall between them already.
  const apart = new Set<number>();
  for (const e of sp.edges) {
    if (m.grid[e] !== WALL) continue;
    const a = groups.canonify(sp.edgeEnds[2 * e]);
    const b = groups.canonify(sp.edgeEnds[2 * e + 1]);
    apart.add(a * n + b).add(b * n + a);
  }
  const choices = new Int32Array(n);
  const first = new Int32Array(n).fill(-1);
  for (const c of sp.cells) {
    const root = groups.canonify(c);
    if (groups.size(root) >= d.dl.k) continue;
    for (const s of sp.adj4[c]) {
      const other = groups.canonify(s);
      if (other === root || apart.has(root * n + other)) continue;
      choices[root]++;
      if (first[root] < 0) first[root] = s;
    }
  }
  let at = -1;
  for (let root = 0; root < n; root++)
    if (choices[root] > 0 && (at < 0 || choices[root] < choices[at])) at = root;
  if (at < 0) return [];
  const s = first[at];
  const theirs = groups.canonify(s);
  return [OPEN, WALL].map((value) => {
    const sub = copied(d);
    for (const c of sp.cells) {
      if (groups.canonify(c) !== at) continue;
      for (const q of sp.adj4[c])
        if (value === OPEN ? groups.canonify(q) === theirs : q === s)
          sub.m.place(sp.edgeOf(c, q), value);
    }
    return sub;
  });
}

/** Keyed on a state's letters, which every state of a game shares. */
const answers = answerCache<Uint8Array, Uint8Array>();

/** What a search of a state's letters established about their answers. The
 * player's edges are not read. */
export function answerOf(
  state: SeparateShape & { letters: Uint8Array },
): SeparateAnswer {
  return answers(state.letters, () => searchAnswers(state, state.letters));
}

// --- the hint's walk ---------------------------------------------------------

/** What the hint's sentences need of the board besides what a firing says. */
export interface SeparateWalkContext {
  sp: GridSpace;
  dl: separate.Dealt;
}

/** Whether the walls the marks hold are the answer, an edge not walled being
 * read as open, marked or not. */
export function wallsAreAnswer(m: CellMarks, { dl }: SeparateWalkContext): boolean {
  return separate.isAnswer(
    m.grid.map((v) => (v === WALL ? WALL : OPEN)),
    m.sp,
    dl,
  );
}

/**
 * The marks over the player's `borders` (their no-wall marks joining squares,
 * their walls keeping groups apart) and the ladder, for the engine's walk to
 * take a firing at a time (`engine/described-edge-hint.ts`).
 */
export function separateWalk(
  state: SeparateShape & { letters: Uint8Array; borders: Uint8Array },
): {
  marks: CellMarks;
  entries: Ladder["entries"];
  ctx: SeparateWalkContext;
} {
  const d = deduction(state, state.letters, state.borders);
  return { marks: d.m, entries: d.ladder.entries, ctx: { sp: d.m.sp, dl: d.dl } };
}
