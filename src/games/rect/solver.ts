/**
 * Rectangles' solver: the ladder `rect.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), the answer
 * check its rules compile to, and the search beneath the ladder.
 *
 * The answer is on the edges between squares side by side, each a line or
 * none. A clue's fits are the rectangles it allows round its square that the
 * marks leave open, which the description defines once (`fits`) and this
 * file reads where it needs them. Easy is `fit`, `reach` and `overlap`;
 * Normal adds `starve` and `line`. Beneath the ladder, a search by trial and
 * error ({@link searchAnswers}) counts a board's answers to two: it serves
 * the Solve command and `findMistakes`, and deals the Unreasonable tier.
 *
 * A hint walks the same ladder, one firing at a time ({@link hintWalk}).
 */

import {
  type Answer,
  type AnswerSearch,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
  solvedPositions,
} from "../../engine/answer-search.ts";
import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueAt,
  clueList,
  describedSpace,
  type GridSpace,
  rangeMask,
  rectCells,
  rectHolds,
  rectInner,
  rectRim,
  through,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  type ReasonOf,
  runLadder,
  type Taken,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import type { Rect } from "../../engine/types.ts";
import type { RectEdge } from "./hint-marks.ts";
import * as rect from "./rect.compiled.ts";
import { clueDimensions, HIDDEN, type RectClues } from "./state.ts";

/** What the description reads an edge as holding. */
export const WALL = 1;
const OPEN = 2;

/** The tier the whole ladder runs at. */
const TOP = rect.ladder.reduce((top, e) => Math.max(top, e.tier), 0);

// --- the board as the description reads it -----------------------------------

/** The last board size's space, which every move's `status` reads again. */
let lastSpace: GridSpace | null = null;
export function spaceOf(w: number, h: number): GridSpace {
  if (lastSpace?.w !== w || lastSpace.h !== h)
    lastSpace = describedSpace(rect.units, w, h);
  return lastSpace;
}

/** The board as the description deals it: each clue's size, 0 where it shows
 * none, and the shape of each that names one. Made afresh on each call: the
 * generator strips and moves clues in place, so nothing keyed on the arrays
 * can be trusted to match what they hold. */
function dealtOf({ grid, shapes }: RectClues): rect.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  const shapedAt: number[] = [];
  const shape: number[] = [];
  grid.forEach((n, c) => {
    if (!n) return;
    at.push(c);
    v.push(n === HIDDEN ? 0 : n);
    if (!shapes[c]) return;
    shapedAt.push(c);
    shape.push(shapes[c]);
  });
  return {
    number: clueList(at, v, grid.length),
    shape: clueList(shapedAt, shape, grid.length),
  };
}

/** Where edge `e` is in the game's own layout: a line on top of square `i`
 * (`hedge`), or on its left (`vedge`). */
export function lineOf(sp: GridSpace, e: number): RectEdge {
  const p = sp.edgeEnds[2 * e];
  const q = sp.edgeEnds[2 * e + 1];
  // A grid one square wide has its squares below one another `p + 1` apart.
  const down = q === p + sp.w;
  return { edge: down ? "h" : "v", x: q % sp.w, y: (q / sp.w) | 0 };
}

/** Whether the lines `hedge` and `vedge` divide the board `clues` into
 * rectangles each holding one clue of its size and shape: every edge with no
 * line is read as none. */
export function linesAnswer(
  w: number,
  h: number,
  clues: RectClues,
  hedge: Uint8Array,
  vedge: Uint8Array,
): boolean {
  const sp = spaceOf(w, h);
  const g = new Uint8Array(sp.edges.length);
  for (const e of sp.edges) {
    const { edge, x, y } = lineOf(sp, e);
    g[e] = (edge === "h" ? hedge : vedge)[y * w + x] ? WALL : OPEN;
  }
  return rect.isAnswer(g, sp, dealtOf(clues));
}

/** The rectangle the description numbers `r`. */
function rectOf(sp: GridSpace, r: number): Rect {
  const n = sp.cells.length;
  const a = Math.floor(r / n);
  const b = r % n;
  const x = a % sp.w;
  const y = (a / sp.w) | 0;
  return { x, y, w: (b % sp.w) - x + 1, h: ((b / sp.w) | 0) - y + 1 };
}

// --- why a firing set its edges ----------------------------------------------

/** Why a firing drew a rectangle or a line, in the player's terms: the clues
 * by their squares, and the squares the reason turns on. */
export type RectReason =
  | {
      kind: "fit";
      clue: number;
      rect: Rect;
      /** Why each other rectangle of the clue's around it fails. */
      offBoard: boolean;
      blockers: number[];
      crossesLine: boolean;
      /** Some would leave out squares of the clue's own drawn rectangle. */
      leavesOut: boolean;
    }
  | { kind: "boxed"; clue: number; rect: Rect }
  | { kind: "reach"; clue: number; rect: Rect; square: number }
  | { kind: "overlap"; clue: number; rect: Rect; other: number; core: number[] }
  | { kind: "starve"; clue: number; rect: Rect; starved: number[]; stranded: number[] }
  | {
      kind: "line";
      edge: RectEdge;
      /** The clues with a fit across the edge. */
      clues: number[];
      /** Squares one of them would take that the clues `owners` cover
       * wherever they go. */
      takes: number[];
      owners: number[];
      /** Squares one would leave out that only it reaches. */
      misses: number[];
    };

/** The rungs a step can be, cheapest first: the ladder's techniques. */
export const RECT_RUNGS = rect.ladder.map((e) => e.id);
export type RectRung = rect.LadderId;

/**
 * Why the other rectangles round the clue at `c` fail, on the marks the
 * firing read: off the board, taking in another clue, crossing a line, or
 * leaving out a square an open edge joins to them, which is part of the
 * clue's own drawn rectangle or of another's.
 */
function fitReason(m: CellMarks, dl: rect.Dealt, q: number, r: number): RectReason {
  const { sp } = m;
  const { w, h } = sp;
  const c = dl.number.at[q];
  const size = dl.number.v[q];
  const shape = Math.max(0, clueAt(dl.shape, c));
  const cx = c % w;
  const cy = (c / w) | 0;
  const open = sp.edges.filter((e) => m.grid[e] === OPEN);
  const own = through(sp, c, open);
  let offBoard = false;
  let crossesLine = false;
  let leavesOut = false;
  const blockers = new Set<number>();
  for (const [rw, rh] of clueDimensions(shape, size === 0 ? HIDDEN : size, w, h))
    for (let y = cy - rh + 1; y <= cy; y++)
      for (let x = cx - rw + 1; x <= cx; x++) {
        if (x < 0 || y < 0 || x + rw > w || y + rh > h) {
          // A clue with no size allows rectangles without end past the board.
          if (size !== 0) offBoard = true;
          continue;
        }
        const s = (y * w + x) * sp.cells.length + (y + rh - 1) * w + x + rw - 1;
        if (s === r) continue;
        const other = rectCells(sp, s).find(
          (x) => x !== c && clueAt(dl.number, x) >= 0,
        );
        if (other !== undefined) blockers.add(other);
        else if (rectInner(sp, s).some((e) => m.grid[e] === WALL)) crossesLine = true;
        else
          for (const e of rectRim(sp, s)) {
            if (m.grid[e] !== OPEN) continue;
            const p = sp.edgeEnds[2 * e];
            const out = rectHolds(sp, s, p) ? sp.edgeEnds[2 * e + 1] : p;
            if (own.includes(out)) leavesOut = true;
            else crossesLine = true;
            break;
          }
      }
  return {
    kind: "fit",
    clue: c,
    rect: rectOf(sp, r),
    offBoard,
    blockers: [...blockers].sort((a, b) => a - b),
    crossesLine,
    leavesOut,
  };
}

/** A reason built once a firing, from its binding, and shared by each of its
 * edges: a firing draws a whole rectangle. */
function perFiring<B extends object>(
  build: (binding: B, m: CellMarks) => RectReason,
): ReasonOf<B> {
  let last: B | null = null;
  let reason: RectReason | null = null;
  return (binding, _at, _n, m) => {
    if (binding !== last || reason === null) {
      last = binding;
      reason = build(binding, m);
    }
    return reason;
  };
}

const sorted = (xs: Iterable<number>): number[] => [...xs].sort((a, b) => a - b);

/** The ladder over the dealt board, each technique with its reason: built
 * from the binding, on the marks before the firing. */
function rectLadder(dl: rect.Dealt): Ladder {
  const at = (q: number): number => dl.number.at[q];
  return describedLadder(rect, {
    fit: compiledRung(
      rect.fit,
      dl,
      perFiring(({ q, F }: rect.FitBinding, m) => fitReason(m, dl, q, F[0])),
    ),
    uncovered: compiledRung(rect.uncovered, dl, () => {
      throw new Error("an uncovered square makes no fact, only a contradiction");
    }),
    boxed: compiledRung(
      rect.boxed,
      dl,
      perFiring(({ q, r }: rect.BoxedBinding, m) => ({
        kind: "boxed",
        clue: at(q),
        rect: rectOf(m.sp, r),
      })),
    ),
    reach: compiledRung(
      rect.reach,
      dl,
      perFiring(({ c, q, r }: rect.ReachBinding, m) => ({
        kind: "reach",
        clue: at(q),
        rect: rectOf(m.sp, r),
        square: c,
      })),
    ),
    overlap: compiledRung(
      rect.overlap,
      dl,
      perFiring(({ p, K, q, F, r }: rect.OverlapBinding, m) => ({
        kind: "overlap",
        clue: at(q),
        rect: rectOf(m.sp, r),
        other: at(p),
        // The squares of the core some fit of the clue would take.
        core: K.filter((x) => F.some((s) => rectHolds(m.sp, s, x))),
      })),
    ),
    starve: compiledRung(
      rect.starve,
      dl,
      perFiring(({ q, r, Z, U }: rect.StarveBinding, m) => ({
        kind: "starve",
        clue: at(q),
        rect: rectOf(m.sp, r),
        starved: sorted(Z.map(at)),
        stranded: sorted(U),
      })),
    ),
    line: compiledRung(
      rect.line,
      dl,
      perFiring(({ e, C, O, T, M }: rect.LineBinding, m) => ({
        kind: "line",
        edge: lineOf(m.sp, e),
        clues: C.map(at),
        takes: sorted(T),
        owners: O.map(at),
        misses: sorted(M),
      })),
    ),
  });
}

// --- deduction ---------------------------------------------------------------

/** The working state of a deduction: the marks on the edges, and the ladder
 * over the board's clues. */
interface Deduction {
  m: CellMarks;
  ladder: Ladder;
  dl: rect.Dealt;
}

/** The marks over `grid`, a value an edge and 0 where none is known: every
 * edge undecided where none is given. */
function deduction(
  w: number,
  h: number,
  clues: RectClues,
  grid: Uint8Array | null = null,
): Deduction {
  const sp = spaceOf(w, h);
  const dl = dealtOf(clues);
  const g = grid ?? new Uint8Array(sp.edges.length);
  const m = new CellMarks(sp, rangeMask(WALL, OPEN), g, null, "edge");
  m.seed(g);
  return { m, ladder: rectLadder(dl), dl };
}

/** A copy of `d` that shares no marks with it, for a search to assume on. */
function copied(d: Deduction): Deduction {
  const m = new CellMarks(d.m.sp, d.m.domain, d.m.grid.slice(), null, "edge");
  m.cands.set(d.m.cands);
  return { ...d, m };
}

/** Where the ladder left the marks, it having found nothing inconsistent:
 * solved where every edge is decided and the rules hold, inconsistent where
 * every edge is decided and they do not. */
function verdictOf({ m, dl }: Deduction): Deduced {
  // An edge with no value fails the answer check's domain, so the check, a
  // walk from every edge, is asked only of a whole board.
  if (m.grid.includes(0)) return "stuck";
  return rect.isAnswer(m.grid, m.sp, dl) ? "solved" : "contradiction";
}

/**
 * Run the ladder on `d` to a fixpoint, the techniques of `cap` and below, and
 * say what it reached. `firings` is the ladder census's channel.
 */
function deduce(d: Deduction, cap = TOP, firings?: FiringTally): Deduced {
  const { m, ladder } = d;
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {}),
    { firings },
  );
  return impossible ? "contradiction" : verdictOf(d);
}

/** Whether the techniques of `tier` and below finish the board `clues` from
 * no edge decided, by default all of them. */
export function ladderFinishes(
  w: number,
  h: number,
  clues: RectClues,
  tier = TOP,
): boolean {
  return deduce(deduction(w, h, clues), tier) === "solved";
}

// --- the search for a board's answers ---------------------------------------

/** A board's one answer: the lines of its rectangles. */
export interface RectSolution {
  readonly hedge: Uint8Array;
  readonly vedge: Uint8Array;
}
export type RectAnswer = Answer<RectSolution>;

/**
 * The positions the search may try before it gives up, which decides which
 * Unreasonable boards exist ({@link AnswerSearch.budget}): lowering it
 * refuses boards in saved games.
 */
const SEARCH_BUDGET = 2_000;

/** The lines the marks hold, every edge without one read as none. */
function linesOf(m: CellMarks): RectSolution {
  const { sp } = m;
  const hedge = new Uint8Array(sp.cells.length);
  const vedge = new Uint8Array(sp.cells.length);
  for (const e of sp.edges) {
    if (m.grid[e] !== WALL) continue;
    const { edge, x, y } = lineOf(sp, e);
    (edge === "h" ? hedge : vedge)[y * sp.w + x] = 1;
  }
  return { hedge, vedge };
}

/** Draw the rectangle `r` into the marks: a line round it, none inside. */
function drawn(d: Deduction, r: number): Deduction {
  const next = copied(d);
  const { m } = next;
  for (const e of rectInner(m.sp, r)) if (m.grid[e] === 0) m.place(e, OPEN);
  for (const e of rectRim(m.sp, r)) if (m.grid[e] === 0) m.place(e, WALL);
  return next;
}

/**
 * The positions a stuck one divides into: the clue with the fewest fits, more
 * than one, takes each in turn. Its fits hold every rectangle its answer may
 * have, so between them they hold every answer. Where no clue has more than
 * one, the ladder has drawn every clue's, and a board left unfinished then has
 * a square no clue can reach: none.
 */
function assumeFit(d: Deduction): Deduction[] {
  const { m, dl } = d;
  let fewest: readonly number[] | null = null;
  for (let q = 0; q < dl.number.at.length; q++) {
    const F = rect.fits(m, m.sp, dl, q);
    if (F.length > 1 && (fewest === null || F.length < fewest.length)) fewest = F;
  }
  return fewest === null ? [] : fewest.map((r) => drawn(d, r));
}

/** The search of a board's clues: the ladder whole, then a clue's fits. */
function boardSearch(
  w: number,
  h: number,
  clues: RectClues,
  budget: number,
): AnswerSearch<Deduction, RectSolution> {
  return {
    start: deduction(w, h, clues),
    deduce: (d) => deduce(d),
    assume: assumeFit,
    solution: (d) => linesOf(d.m),
    budget,
  };
}

/** Count a board's answers up to two, by trial and error over the ladder. */
export function searchAnswers(
  w: number,
  h: number,
  clues: RectClues,
  budget: number = SEARCH_BUDGET,
): RectAnswer {
  return searchBoard(boardSearch(w, h, clues, budget));
}

/**
 * The first two answers that search comes to, or the one or none there are,
 * each as the rectangle of every clue in reading order. Null where the
 * budget ran out first.
 */
export function firstTwoAnswers(
  w: number,
  h: number,
  clues: RectClues,
  budget: number,
): Rect[][] | null {
  const found = solvedPositions(boardSearch(w, h, clues, budget), 2);
  return (
    found?.map(({ m, dl }) => {
      const open = m.sp.edges.filter((e) => m.grid[e] === OPEN);
      return [...dl.number.at].map((c) => boundsOf(m.sp, through(m.sp, c, open)));
    }) ?? null
  );
}

/** The rectangle the squares `cells` fill. */
function boundsOf(sp: GridSpace, cells: readonly number[]): Rect {
  const xs = cells.map((c) => c % sp.w);
  const ys = cells.map((c) => (c / sp.w) | 0);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x + 1, h: Math.max(...ys) - y + 1 };
}

/** Keyed on a state's sizes, which every state of one game shares, and
 * which are made with its shapes. */
const answers = answerCache<Int32Array, RectSolution>();

/** What a search of a state's clues established about their answers. The
 * player's lines are not read. */
export function answerOf(state: RectClues & { w: number; h: number }): RectAnswer {
  return answers(state.grid, () => searchAnswers(state.w, state.h, state));
}

// --- the hint's walk ---------------------------------------------------------

/** One firing, in the player's terms: why, and the edges it decided. */
export type RectFiring = RectReason & { facts: readonly number[] };

/** The squares a firing's reason turns on, which a plan continues from. */
function readsOf(sp: GridSpace, r: RectReason): number[] {
  const cells = (x: Rect): number[] => {
    const out: number[] = [];
    for (let y = x.y; y < x.y + x.h; y++)
      for (let i = x.x; i < x.x + x.w; i++) out.push(y * sp.w + i);
    return out;
  };
  switch (r.kind) {
    case "fit":
      return [...cells(r.rect), ...r.blockers];
    case "boxed":
    case "reach":
      return cells(r.rect);
    case "overlap":
      return [...cells(r.rect), r.other, ...r.core];
    case "starve":
      return [...cells(r.rect), ...r.starved, ...r.stranded];
    case "line": {
      const i = r.edge.y * sp.w + r.edge.x;
      return [
        i,
        r.edge.edge === "v" ? i - 1 : i - sp.w,
        ...r.clues,
        ...r.takes,
        ...r.owners,
        ...r.misses,
      ];
    }
  }
}

/**
 * The ladder's firings from the marks `grid` (the player's lines, and the
 * inside of each rectangle they drew round a clue), one a call, each the one
 * that carries on from the rectangles the plan is working on (`ladderWalk`),
 * or `null` when the ladder has nothing left.
 */
export function hintWalk(
  w: number,
  h: number,
  clues: RectClues,
  grid: Uint8Array,
  budget: StepBudget,
): () => RectFiring | null {
  const { m, ladder } = deduction(w, h, clues, grid);
  m.budget = budget;
  const walk = ladderWalk(m, ladder.entries, { [TIERS]: TOP }, (f: Taken) =>
    readsOf(m.sp, f.reasons[0] as RectReason),
  );
  return () => {
    const taken = walk.next();
    if (taken === null || taken === "contradiction") return null;
    return { ...(taken.reasons[0] as RectReason), facts: taken.facts };
  };
}
