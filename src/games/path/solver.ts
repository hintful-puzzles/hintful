/**
 * Path's solver: the ladder `path.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/ladder-runtime.ts`), the answer check
 * its rules compile to, and the search beneath the ladder.
 *
 * The answer is on the edges between squares side by side, each a line or
 * none; a cross, a wall and an edge no line will take are all "none". The
 * description reads both rulesets as one, by how far apart the numbers a
 * line joins are (`step`): alike in Pairs, one apart in Path.
 *
 * The ladder runs to a fixpoint ({@link solvePath}), which is how the
 * generator grades a board; beneath it a search by trial and error
 * ({@link searchAnswer}) counts a board's answers to two, which deals the
 * Unreasonable tier and serves Solve and the mistake check. A hint walks the
 * same ladder one firing at a time ({@link pathWalk}).
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers,
} from "../../engine/answer-search.ts";
import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
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
import { CROSS, type EdgeMark, LINE, OPEN } from "../../engine/line-drawing.ts";
import {
  pieceThrough,
  type SquareEdges,
  squareEdges,
} from "../../engine/square-edges.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import * as path from "./path.compiled.ts";
import { DIFF_TRICKY, MODE_PATH, NO_END, type PathPuzzle } from "./state.ts";

/** What the description reads an edge as holding. */
const LINED = 1;
const NONE = 2;

/** Why a firing decides its edges, its edges numbered as the game's. */
export type PathReason =
  /** The square has only as many live edges as it still needs lines. */
  | { kind: "forced"; cell: number; need: number }
  /** A line on `tried` would break the board at once, so it is crossed out. */
  | { kind: "lineBreaks"; tried: number[] }
  /** Lines on `tried`, two of the three edges square `cell` has left, would
   * break the board at once, so it takes the third. */
  | { kind: "pairBreaks"; cell: number; tried: number[] }
  /** Square `cell` takes two of its four edges, and every pair of them that
   * leaves the firing's mark unmet is `ruledOut`. */
  | { kind: "weighed"; cell: number; ruledOut: number[][] };

/** One deduction: `edges` all take `mark`. */
export interface PathFiring {
  reason: PathReason;
  edges: number[];
  mark: typeof LINE | typeof CROSS;
}

/** The rungs, easiest first: the ladder's techniques. */
export const PATH_RUNGS = path.ladder.map((e) => e.id);
export type PathRung = path.LadderId;

/** The tier the whole ladder runs at. */
const TOP = DIFF_TRICKY;

// --- the board as the description reads it -----------------------------------

/** A board size's space, and its edges in both numberings: the game's
 * (`engine/square-edges.ts`) and the space's. */
interface Geometry {
  sp: GridSpace;
  g: SquareEdges;
  /** The space's edge for each of the game's. */
  toSp: Int32Array;
  /** The game's edge for each of the space's. */
  toGame: Int32Array;
}

/** The last board size's, which every hint and grade reads again. */
let lastGeometry: Geometry | null = null;
function geometryOf(w: number, h: number): Geometry {
  if (lastGeometry?.sp.w === w && lastGeometry.sp.h === h) return lastGeometry;
  const sp = describedSpace(path.units, w, h);
  const g = squareEdges(w, h);
  const toSp = new Int32Array(g.edgeCount);
  const toGame = new Int32Array(g.edgeCount);
  for (let e = 0; e < g.edgeCount; e++) {
    toSp[e] = sp.edgeOf(g.a[e], g.b[e]);
    toGame[toSp[e]] = e;
  }
  lastGeometry = { sp, g, toSp, toGame };
  return lastGeometry;
}

/** The board as the description deals it: the numbers, the walls, and how
 * far apart two numbers a line joins are. */
function dealtOf(puzzle: PathPuzzle, geo: Geometry): path.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  puzzle.ends.forEach((n, c) => {
    if (n === NO_END) return;
    at.push(c);
    v.push(n);
  });
  const walls: number[] = [];
  puzzle.walls.forEach((wall, e) => {
    if (wall) walls.push(geo.toSp[e]);
  });
  return {
    number: clueList(at, v, puzzle.ends.length),
    wall: clueList(
      walls,
      walls.map(() => 1),
      geo.sp.edges.length,
    ),
    step: puzzle.mode === MODE_PATH ? 1 : 0,
  };
}

/** A board the ladder works on: the marks, and what it reads them by. */
interface Deduction {
  puzzle: PathPuzzle;
  geo: Geometry;
  dl: path.Dealt;
  m: CellMarks;
  ladder: Ladder;
}

/** The marks `edges` hold as the description reads them: a line, or none
 * for a cross, and nothing for an open edge. */
function deduction(puzzle: PathPuzzle, edges: ArrayLike<number>): Deduction {
  const geo = geometryOf(puzzle.w, puzzle.h);
  const dl = dealtOf(puzzle, geo);
  const grid = new Uint8Array(geo.sp.edges.length);
  for (let e = 0; e < geo.g.edgeCount; e++)
    if (edges[e] !== OPEN) grid[geo.toSp[e]] = edges[e] === LINE ? LINED : NONE;
  const m = new CellMarks(geo.sp, rangeMask(LINED, NONE), grid, null, "edge");
  m.seed(grid);
  return { puzzle, geo, dl, m, ladder: pathLadder(geo, dl) };
}

/** A copy of `d` that shares no marks with it, for a search to assume on. */
function copied(d: Deduction): Deduction {
  const m = new CellMarks(d.m.sp, d.m.domain, d.m.grid.slice(), null, "edge");
  m.cands.set(d.m.cands);
  return { ...d, m };
}

/** The edges the marks hold, as the game's marks: a line, a cross where the
 * marks say none, and open where they say nothing. */
function edgesOf(d: Deduction): Uint8Array {
  const { g, toSp } = d.geo;
  const out = new Uint8Array(g.edgeCount);
  for (let e = 0; e < g.edgeCount; e++) {
    const v = d.m.grid[toSp[e]];
    out[e] = v === LINED ? LINE : v === NONE ? CROSS : OPEN;
  }
  return out;
}

/** Whether some square still lacks a line it takes. */
function unfinished(d: Deduction): boolean {
  const { g, toSp } = d.geo;
  for (let i = 0; i < g.cells; i++) {
    let lines = 0;
    for (let k = 0; k < 4; k++) {
      const e = g.around[i * 4 + k];
      if (e >= 0 && d.m.grid[toSp[e]] === LINED) lines++;
    }
    if (lines < d.puzzle.takes[i]) return true;
  }
  return false;
}

/** Where the ladder left the marks, it having found nothing inconsistent:
 * solved where every square has its lines and the rules hold of them, an
 * edge without a line taking none. */
function verdictOf(d: Deduction): Deduced {
  if (unfinished(d)) return "stuck";
  const g = d.m.grid.map((v) => (v === LINED ? LINED : NONE));
  return path.isAnswer(g, d.m.sp, d.dl) ? "solved" : "contradiction";
}

/** Run the ladder on `d` to a fixpoint at `cap` and say what it reached. */
function deduce(d: Deduction, cap: number, firings?: FiringTally): Deduced {
  const { m, ladder } = d;
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {}),
    {
      firings,
    },
  );
  return impossible ? "contradiction" : verdictOf(d);
}

// --- why a firing set what it set --------------------------------------------

/** A reason built once a firing, from its binding, and shared by each of its
 * facts. */
function perFiring<B extends object>(
  build: (binding: B, m: CellMarks) => PathReason,
): ReasonOf<B> {
  let last: B | null = null;
  let reason: PathReason | null = null;
  return (binding, _at, _n, m) => {
    if (binding !== last || reason === null) {
      last = binding;
      reason = build(binding, m);
    }
    return reason;
  };
}

/** The ladder over the dealt board, each technique with its reason. */
function pathLadder(geo: Geometry, dl: path.Dealt): Ladder {
  const { sp, toGame } = geo;
  const edge = (c: number, y: number): number => toGame[sp.edgeOf(c, y)];
  return describedLadder(path, {
    forced: compiledRung(
      path.forced,
      dl,
      perFiring(({ c, n }) => ({ kind: "forced", cell: c, need: n })),
    ),
    lineBreaks: compiledRung(
      path.lineBreaks,
      dl,
      perFiring(({ e }) => ({ kind: "lineBreaks", tried: [toGame[e]] })),
    ),
    pairBreaks: compiledRung(
      path.pairBreaks,
      dl,
      perFiring(({ c, i, j }) => ({
        kind: "pairBreaks",
        cell: c,
        tried: [edge(c, i), edge(c, j)],
      })),
    ),
    weighed: compiledRung(
      path.weighed,
      dl,
      perFiring(({ c, U, P, X }) => {
        // The pairs of the square's four edges. Each pair without an edge
        // of `P` breaks, and so does each with an edge of `X`.
        const pairs: { tried: number[]; ys: number[] }[] = [];
        for (let a = 0; a < U.length; a++)
          for (let b = a + 1; b < U.length; b++)
            pairs.push({ tried: [edge(c, U[a]), edge(c, U[b])], ys: [U[a], U[b]] });
        // A line asked for is said against the pairs that leave it unmet;
        // a cross against those that take it.
        const ruledOut =
          P.length > 0
            ? pairs.filter(({ ys }) => !P.every((y) => ys.includes(y)))
            : pairs.filter(({ ys }) => ys.some((y) => X.includes(y)));
        return { kind: "weighed", cell: c, ruledOut: ruledOut.map((p) => p.tried) };
      }),
    ),
  });
}

// --- solving -----------------------------------------------------------------

/** Where a solve left a board: how it ended, and its edges then. */
export interface PathSolve {
  verdict: DifficultyVerdict;
  /** The edges as the game marks them: a line, a cross where the ladder
   * decided none, and open where it decided nothing. */
  edges: Uint8Array;
  /** Whether some square still lacks a line it takes. */
  unfinished: boolean;
}

/**
 * Solve with the ladder capped at tier `cap`, from `edges` (the board's
 * start where none are given), and say how it ended. `firings` takes a count
 * of each technique's firings, for a census.
 */
export function solvePath(
  puzzle: PathPuzzle,
  cap: number,
  opts: { edges?: ArrayLike<number>; firings?: FiringTally } = {},
): PathSolve {
  const d = deduction(puzzle, opts.edges ?? startMarks(puzzle));
  const reached = deduce(d, cap, opts.firings);
  return {
    verdict:
      reached === "contradiction"
        ? "impossible"
        : reached === "solved"
          ? "solved"
          : "unsolved",
    edges: edgesOf(d),
    unfinished: unfinished(d),
  };
}

/** The edges of `puzzle` before any move: a cross on each wall. */
function startMarks(puzzle: PathPuzzle): Uint8Array {
  return puzzle.walls.map((wall) => (wall ? CROSS : OPEN));
}

/** Whether the lines solve the puzzle: each square has the lines it takes,
 * and the rules hold of them. A cross and an open edge are the same here, so
 * a player need cross nothing out to finish. */
export function isComplete(puzzle: PathPuzzle, edges: ArrayLike<number>): boolean {
  const geo = geometryOf(puzzle.w, puzzle.h);
  const g = new Uint8Array(geo.sp.edges.length).fill(NONE);
  for (let e = 0; e < geo.g.edgeCount; e++)
    if (edges[e] === LINE) g[geo.toSp[e]] = LINED;
  return path.isAnswer(g, geo.sp, dealtOf(puzzle, geo));
}

/** How many positions {@link searchAnswer} may try. A board below
 * Unreasonable needs one, as the ladder finishes it. A board dealt before
 * 2026-10-28 at Normal or Tricky may need a lookahead the ladder no longer
 * has: 265 of them, dealt at every preset of both tiers, needed a median of 5
 * and at most 1365 to prove their one answer (2026-10-28). Lowering it
 * refuses boards in saved games. */
const ANSWER_BUDGET = 5000;

/** The positions a stuck one divides into: an edge both of whose squares
 * still take a line, as a line and crossed. A stuck board has one, or its
 * short square would have too few edges left, which `forced` refuses. */
function assumeEdge(d: Deduction): Deduction[] {
  const { sp } = d.m;
  const spare = (c: number): boolean => {
    let lines = 0;
    for (const y of sp.adj4[c]) if (d.m.grid[sp.edgeOf(c, y)] === LINED) lines++;
    return lines < d.puzzle.takes[c];
  };
  for (const e of sp.edges) {
    if (d.m.known(e) || !spare(sp.edgeEnds[2 * e]) || !spare(sp.edgeEnds[2 * e + 1]))
      continue;
    return [LINED, NONE].map((v) => {
      const next = copied(d);
      next.m.place(e, v);
      return next;
    });
  }
  return [];
}

/** The board's answers, counted to two by trial and error over the ladder at
 * every tier. The answer is the board's edges. */
export function searchAnswer(
  puzzle: PathPuzzle,
  budget = ANSWER_BUDGET,
): Answer<Uint8Array> {
  return searchAnswers<Deduction, Uint8Array>({
    start: deduction(puzzle, startMarks(puzzle)),
    deduce: (d) => deduce(d, TOP),
    assume: assumeEdge,
    solution: edgesOf,
    budget,
  });
}

/** Each board's answer, by its numbers, which every state of a board shares. */
const answers = answerCache<Uint8Array, readonly EdgeMark[]>();

/** The board's answer as marks, its lines and its walls' crosses, which
 * Solve and the mistake check go by at every tier. */
export function answerOf(puzzle: PathPuzzle): Answer<readonly EdgeMark[]> {
  return answers(puzzle.ends, () => {
    const answer = searchAnswer(puzzle);
    if (answer.kind !== "one") return answer;
    const marks = Array.from(
      answer.solution,
      (m, e): EdgeMark => (m === LINE ? LINE : puzzle.walls[e] ? CROSS : OPEN),
    );
    return { kind: "one", solution: marks };
  });
}

// --- the hint's walk ---------------------------------------------------------

/** The lowest number on the piece of line through square `i` on `edges`, or
 * {@link NO_END}: in Pairs, its one number. */
function numberOf(
  puzzle: PathPuzzle,
  g: SquareEdges,
  edges: Uint8Array,
  i: number,
): number {
  let low = NO_END;
  for (const j of pieceThrough(g, (e) => edges[e] === LINE, i)) {
    const n = puzzle.ends[j];
    if (n !== NO_END && (low === NO_END || n < low)) low = n;
  }
  return low;
}

/**
 * The numbers whose lines a firing's premise reads, which a hint plan
 * continues from: a player follows a line from its number, so a plan works on
 * one number's line until nothing more follows for it. A forced square reads
 * the line it is on and the lines of the full squares beside it; a line
 * tried reads the lines at its edges, and a square weighed its own.
 */
function numbersRead(d: Deduction, reason: PathReason): number[] {
  const { puzzle } = d;
  const { g } = d.geo;
  const edges = edgesOf(d);
  const on = (i: number): number[] => {
    const v = numberOf(puzzle, g, edges, i);
    return v === NO_END ? [] : [v];
  };
  const lines = (i: number): number => {
    let n = 0;
    for (let k = 0; k < 4; k++) {
      const e = g.around[i * 4 + k];
      if (e >= 0 && edges[e] === LINE) n++;
    }
    return n;
  };
  switch (reason.kind) {
    case "forced": {
      // Its own line, and the lines of the full squares beside it, across an
      // edge still open. Not the line across a cross: the cross was made for
      // that line's sake and says nothing more about it, so a square it
      // forces belongs to its own line.
      const i = reason.cell;
      const out = on(i);
      for (let k = 0; k < 4; k++) {
        const e = g.around[i * 4 + k];
        if (e < 0 || edges[e] !== OPEN) continue;
        const j = g.a[e] === i ? g.b[e] : g.a[e];
        // Two numbers side by side close their edge from the start: no step
        // made it, so it continues from none.
        if (puzzle.ends[i] !== NO_END && puzzle.ends[j] !== NO_END) continue;
        if (lines(j) >= puzzle.takes[j]) out.push(...on(j));
      }
      return out;
    }
    case "lineBreaks":
    case "pairBreaks":
      return reason.tried.flatMap((e) => [...on(g.a[e]), ...on(g.b[e])]);
    case "weighed":
      return on(reason.cell);
  }
}

/** The numbers a firing's lines extend, read once it is made; a cross
 * writes none, as it serves the line in hand, so the plan stays with that
 * line. */
function numbersWritten(d: Deduction, firing: PathFiring): number[] {
  if (firing.mark !== LINE) return [];
  const { g } = d.geo;
  const edges = edgesOf(d);
  return firing.edges.flatMap((e) =>
    [g.a[e], g.b[e]]
      .map((i) => numberOf(d.puzzle, g, edges, i))
      .filter((v) => v !== NO_END),
  );
}

/** A taken firing in the game's terms: its reason, and the edges it set. */
function firingOf(d: Deduction, taken: Taken): PathFiring {
  const { toGame } = d.geo;
  const edges: number[] = [];
  let mark: typeof LINE | typeof CROSS = LINE;
  for (let i = 0; i < taken.facts.length; i += 3) {
    edges.push(toGame[taken.facts[i + 1]]);
    mark = taken.facts[i + 2] === LINED ? LINE : CROSS;
  }
  return { reason: taken.reasons[0] as PathReason, edges, mark };
}

/**
 * The ladder's firings from `edges`, the player's lines and crosses, one a
 * call, each the one that carries on from the line the plan is working on
 * (`ladderWalk`): `next` gives the firing just made, with the edges as they
 * stood before it, or `null` when no rung fires, and `impossible` says
 * whether a technique found the marks inconsistent. No tier cap: a board
 * that arrives by its ID carries no tier, and the ladder tries the Easy rung
 * first, which is the order a hint wants anyway.
 */
export function pathWalk(
  puzzle: PathPuzzle,
  edges: ArrayLike<number>,
  budget: StepBudget,
): {
  next(): { firing: PathFiring; before: Uint8Array } | null;
  impossible(): boolean;
} {
  const d = deduction(puzzle, edges);
  d.m.budget = budget;
  let impossible = false;
  const walk = ladderWalk(
    d.m,
    d.ladder.entries,
    { [TIERS]: TOP },
    (f) => numbersRead(d, f.reasons[0] as PathReason),
    { writes: (f) => numbersWritten(d, firingOf(d, f)) },
  );
  return {
    next() {
      if (impossible) return null;
      const before = edgesOf(d);
      const taken = walk.next();
      if (taken === "contradiction") impossible = true;
      if (taken === null || taken === "contradiction") return null;
      return { firing: firingOf(d, taken), before };
    },
    impossible: () => impossible,
  };
}
