/**
 * Galaxies' solver: the ladder `galaxies.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), the answer
 * check its rules compile to, and the search beneath the ladder.
 *
 * The answer is on the edges between squares side by side, each a line or
 * none, and the player's arrows are a mark on each square naming a dot: the
 * dot at the center of its galaxy. Every technique is Normal. Beneath the
 * ladder, a search by trial and error ({@link solverState}) counts a board's
 * answers to two: it deals the Unreasonable tier, and serves Solve and the
 * mistake check.
 *
 * A hint walks the same ladder, one firing at a time ({@link hintWalk}).
 */

import {
  type AnswerSearch,
  type Deduced,
  searchAnswers,
} from "../../engine/answer-search.ts";
import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  MARK,
  opp,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  type Taken,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import type { Point } from "../../engine/types.ts";
import * as galaxies from "./galaxies.compiled.ts";
import {
  addAssoc,
  F_DOT,
  F_DOT_BLACK,
  F_EDGE_SET,
  F_TILE_ASSOC,
  type GalaxiesState,
  idx,
} from "./state.ts";

export enum GalaxiesDiff {
  /** Finished by the ladder. */
  Normal = 0,
  /** One answer, which the search proves and the ladder does not reach. */
  Unreasonable = 1,
  /** No consistent solution exists. */
  Impossible = 2,
  /** More than one solution exists. */
  Ambiguous = 3,
  /** The ladder stopped short where the search was not asked for, or the
   * search ran out of positions. */
  Unfinished = 4,
}

/** What the description reads an edge as holding. */
const WALL = 1;
const OPEN = 2;

/** The tier the whole ladder runs at. */
const TOP = galaxies.ladder.reduce((top, e) => Math.max(top, e.tier), 0);

/**
 * The positions the search may try before it gives up, which decides which
 * Unreasonable boards exist (`AnswerSearch.budget`): lowering it refuses
 * boards in saved games.
 */
const SEARCH_BUDGET = 2_000;

// --- the board as the description reads it -----------------------------------

/** The last board size's space, which every hint and grade reads again. */
let lastSpace: GridSpace | null = null;
function spaceOf(w: number, h: number): GridSpace {
  if (lastSpace?.w !== w || lastSpace.h !== h)
    lastSpace = describedSpace(galaxies.units, w, h);
  return lastSpace;
}

/** The center the description numbers `p`, on the state's half grid. */
function centerPoint(sp: GridSpace, p: number): Point {
  const cx = 2 * sp.w - 1;
  return { x: (p % cx) + 1, y: ((p / cx) | 0) + 1 };
}

/** The square `c` on the state's half grid. */
function cellPoint(sp: GridSpace, c: number): Point {
  return { x: 2 * (c % sp.w) + 1, y: 2 * ((c / sp.w) | 0) + 1 };
}

/** Edge `e` on the state's half grid: halfway between its two squares. */
function edgePoint(sp: GridSpace, e: number): Point {
  const p = sp.edgeEnds[2 * e];
  const q = sp.edgeEnds[2 * e + 1];
  return {
    x: (p % sp.w) + (q % sp.w) + 1,
    y: ((p / sp.w) | 0) + ((q / sp.w) | 0) + 1,
  };
}

/** The board as the description deals it: a dot at each center the state
 * holds one, in the order of `s.dots`, which is each dot's clue index. */
function dealtOf(s: GalaxiesState, sp: GridSpace): galaxies.Dealt {
  const cx = 2 * sp.w - 1;
  const at = s.dots.map((d) => (d.y - 1) * cx + d.x - 1);
  return {
    dot: clueList(
      at,
      at.map(() => 1),
      sp.centers.length,
    ),
  };
}

// --- why a firing set what it set --------------------------------------------

/**
 * One deduction firing, in the player's terms, on the state's half grid. Every
 * association carries `opp`, the 180° partner the game commits in the same
 * move, because the hint's targets are the pair and its narration says so.
 */
export type GalaxiesFiring =
  /** The cells a dot sits on belong to it. */
  | { kind: "dotTile"; dot: Point; tiles: Point[] }
  /** Two neighbors in different galaxies: a wall must run between them. */
  | { kind: "separate"; edge: Point; tiles: [Point, Point]; dots: [Point, Point] }
  /** A galaxy's boundary is symmetric, so a wall is mirrored about the dot:
   * `from` beside `tile` stands for the one beside `opp`. */
  | {
      kind: "mirrorWall";
      edge: Point;
      from: Point;
      tile: Point;
      opp: Point;
      dot: Point;
    }
  /** Every way out of a cell leads into the same galaxy. */
  | {
      kind: "enclosed";
      tile: Point;
      opp: Point | null;
      dot: Point;
      openings: Point[];
      /** Every tile already in that dot's galaxy, which the sentence names. */
      galaxy: Point[];
    }
  /** Only one dot's galaxy can still stretch to a cell. */
  | { kind: "onlyReach"; tile: Point; opp: Point | null; dot: Point; region: Point[] }
  /** A detached piece of a galaxy has one square left to grow through. */
  | {
      kind: "exclave";
      tile: Point;
      opp: Point | null;
      dot: Point;
      component: Point[];
    }
  /** Only one dot could own this cell at all, by the dots alone: the dot a
   * drag from it rings. */
  | { kind: "soleOwner"; tile: Point; opp: Point | null; dot: Point };

/** The rungs a step can be: the ladder's techniques. */
export const GALAXIES_RUNGS = galaxies.ladder.map((e) => e.id);
export type GalaxiesRung = galaxies.LadderId;

/**
 * A firing in the player's terms, from the terms its technique said and the
 * marks `m` as they stood before it: what a reason reads of the marks is the
 * arrows and lines it was found on, not the ones it made.
 */
export function reasonOf(
  m: CellMarks,
  dl: galaxies.Dealt,
  kind: keyof galaxies.SaysById,
  terms: galaxies.SaysById[keyof galaxies.SaysById]["terms"],
): GalaxiesFiring {
  const { sp } = m;
  const dot = (q: number): Point => centerPoint(sp, dl.dot.at[q]);
  /** A square claimed for dot `q`, with the partner the move brings. */
  const claim = (c: number, q: number) => {
    const o = opp(sp, c, dl.dot.at[q]);
    return {
      tile: cellPoint(sp, c),
      opp: o < 0 ? null : cellPoint(sp, o),
      dot: dot(q),
    };
  };
  const cells = (xs: readonly number[]): Point[] => xs.map((c) => cellPoint(sp, c));
  const t = <K extends keyof galaxies.SaysById>(): galaxies.SaysById[K]["terms"] =>
    terms as galaxies.SaysById[K]["terms"];
  switch (kind) {
    case "dotTile": {
      const { q } = t<"dotTile">();
      return {
        kind,
        dot: dot(q),
        tiles: cells(sp.centerCells[dl.dot.at[q]].filter((c) => m.markOf(c) !== q)),
      };
    }
    case "separate": {
      const { e, p, q } = t<"separate">();
      return {
        kind,
        edge: edgePoint(sp, e),
        tiles: [
          cellPoint(sp, sp.edgeEnds[2 * e]),
          cellPoint(sp, sp.edgeEnds[2 * e + 1]),
        ],
        dots: [dot(p), dot(q)],
      };
    }
    case "enclosed": {
      const { c, N, q } = t<"enclosed">();
      return {
        kind,
        ...claim(c, q),
        openings: cells(N),
        galaxy: cells(sp.cells.filter((x) => m.markOf(x) === q)),
      };
    }
    case "soleOwner": {
      const { c, K } = t<"soleOwner">();
      return { kind, ...claim(c, K[0]) };
    }
    case "onlyReach": {
      const { c, K } = t<"onlyReach">();
      return {
        kind,
        ...claim(c, K[0]),
        region: cells(galaxies.reach(m, sp, dl, K[0])),
      };
    }
    case "exclave": {
      const { q, G, L } = t<"exclave">();
      return { kind, ...claim(L[0], q), component: cells(G) };
    }
    case "mirrorWall": {
      const { e, a, q, a2 } = t<"mirrorWall">();
      const at = edgePoint(sp, e);
      const d = dot(q);
      return {
        kind,
        edge: at,
        // The edge `e` turns to about the dot: a line, or the grid's rim.
        from: { x: 2 * d.x - at.x, y: 2 * d.y - at.y },
        tile: cellPoint(sp, a2),
        opp: cellPoint(sp, a),
        dot: d,
      };
    }
  }
}

/** The ladder over the dealt board: each technique as the description states
 * it, a firing recording what it says. */
function galaxiesLadder(dl: galaxies.Dealt): Ladder {
  return describedLadder(galaxies, {
    dotTile: compiledRung(galaxies.dotTile, dl),
    split: uncluedRung(galaxies.split, () => {
      throw new Error("a line inside a galaxy makes no fact, only a contradiction");
    }),
    separate: uncluedRung(galaxies.separate),
    enclosed: compiledRung(galaxies.enclosed, dl),
    soleOwner: compiledRung(galaxies.soleOwner, dl),
    onlyReach: compiledRung(galaxies.onlyReach, dl),
    exclave: compiledRung(galaxies.exclave, dl),
    mirrorWall: compiledRung(galaxies.mirrorWall, dl),
  });
}

// --- deduction ---------------------------------------------------------------

/** The working state of a deduction: the marks, and the ladder over the
 * board's dots. */
interface Deduction {
  m: CellMarks;
  ladder: Ladder;
  dl: galaxies.Dealt;
}

/** The marks `s` holds as the description reads them: each line inside the
 * grid, and each square's arrow to a dot. */
function deduction(s: GalaxiesState): Deduction {
  const sp = spaceOf(s.w, s.h);
  const dl = dealtOf(s, sp);
  const g = new Uint8Array(sp.edges.length);
  for (const e of sp.edges) {
    const { x, y } = edgePoint(sp, e);
    if (s.flags[idx(s, x, y)] & F_EDGE_SET) g[e] = WALL;
  }
  const m = new CellMarks(sp, rangeMask(WALL, OPEN), g, null, "edge");
  m.seed(g);
  const dotOf = new Map(s.dots.map((d, q) => [idx(s, d.x, d.y), q]));
  for (const c of sp.cells) {
    const { x, y } = cellPoint(sp, c);
    const i = idx(s, x, y);
    if (!(s.flags[i] & F_TILE_ASSOC)) continue;
    const q = dotOf.get(idx(s, s.dotx[i], s.doty[i]));
    if (q !== undefined) m.markAt(c, q);
  }
  return { m, ladder: galaxiesLadder(dl), dl };
}

/** A copy of `d` that shares no marks with it, for a search to assume on. */
function copied(d: Deduction): Deduction {
  const m = new CellMarks(d.m.sp, d.m.domain, d.m.grid.slice(), null, "edge");
  m.cands.set(d.m.cands);
  m.marked.set(d.m.marked);
  return { ...d, m };
}

/** The lines of the answer the arrows draw, every square having one: a line
 * between squares of two dots, none between squares of one. `null` where a
 * square has none yet. */
function linesOf(m: CellMarks): Uint8Array | null {
  if (m.marked.includes(-1)) return null;
  const { sp } = m;
  const g = new Uint8Array(sp.edges.length);
  for (const e of sp.edges)
    g[e] =
      m.marked[sp.edgeEnds[2 * e]] === m.marked[sp.edgeEnds[2 * e + 1]] ? OPEN : WALL;
  return g;
}

/** Where the ladder left the marks, it having found nothing inconsistent:
 * solved where every square has an arrow, the lines they draw hold every
 * line the marks do, and the rules hold of them. */
function verdictOf({ m, dl }: Deduction): Deduced {
  const g = linesOf(m);
  if (g === null) return "stuck";
  for (const e of m.sp.edges)
    if (m.grid[e] === WALL && g[e] !== WALL) return "contradiction";
  return galaxies.isAnswer(g, m.sp, dl) ? "solved" : "contradiction";
}

/** Run the ladder on `d` to a fixpoint and say what it reached. `firings`
 * is the ladder census's channel. */
function deduce(d: Deduction, firings?: FiringTally): Deduced {
  const { m, ladder } = d;
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: TOP }, {}),
    { firings },
  );
  return impossible ? "contradiction" : verdictOf(d);
}

/** The dots square `c` could still be, by the description's own reach. */
function candidates({ m, dl }: Deduction, c: number): readonly number[] {
  return galaxies
    .near(m.sp, dl, c)
    .filter((q) => galaxies.reach(m, m.sp, dl, q).includes(c));
}

/**
 * The positions a stuck one divides into: the square with fewest dots it
 * could be, more than one, takes each in turn, with its partner. Between them
 * they hold every answer, since the reach holds every dot a square's answer
 * can be.
 */
function assumeDot(d: Deduction): Deduction[] {
  const { m, dl } = d;
  let best: { c: number; K: readonly number[] } | null = null;
  for (const c of m.sp.cells) {
    if (m.markOf(c) >= 0) continue;
    const K = candidates(d, c);
    if (K.length > 1 && (best === null || K.length < best.K.length)) best = { c, K };
  }
  if (best === null) return [];
  const { c, K } = best;
  const out: Deduction[] = [];
  for (const q of K) {
    const o = opp(m.sp, c, dl.dot.at[q]);
    if (o < 0 || (m.markOf(o) >= 0 && m.markOf(o) !== q)) continue;
    const next = copied(d);
    next.m.markAt(c, q);
    next.m.markAt(o, q);
    out.push(next);
  }
  return out;
}

/** Write the answer the marks `m` hold into `s`: every square's arrow, and
 * the lines inside the grid. */
function writeAnswer(s: GalaxiesState, m: CellMarks, dots: readonly Point[]): void {
  const g = linesOf(m);
  if (g === null) throw new Error("galaxies: an answer has an arrow on every square");
  const { sp } = m;
  for (const c of sp.cells) {
    const { x, y } = cellPoint(sp, c);
    const d = dots[m.markOf(c)];
    addAssoc(s, x, y, d.x, d.y);
  }
  for (const e of sp.edges) {
    const { x, y } = edgePoint(sp, e);
    const i = idx(s, x, y);
    if (g[e] === WALL) s.flags[i] |= F_EDGE_SET;
    else s.flags[i] &= ~F_EDGE_SET;
  }
}

/**
 * Grade `s` from the marks it holds, writing the answer into it where one is
 * found: `Normal` where the ladder finishes it, and at `maxDiff`
 * `Unreasonable`, `Unreasonable` where the search proves it has one answer.
 * Otherwise `Impossible`, `Ambiguous`, or `Unfinished` where the ladder
 * stopped short below `Unreasonable` or the search ran out of positions.
 */
export function solverState(
  s: GalaxiesState,
  maxDiff: GalaxiesDiff,
  firings?: FiringTally,
): GalaxiesDiff {
  const d = deduction(s);
  const ladder = deduce(d, firings);
  if (ladder === "contradiction") return GalaxiesDiff.Impossible;
  if (ladder === "solved") {
    writeAnswer(s, d.m, s.dots);
    return GalaxiesDiff.Normal;
  }
  if (maxDiff < GalaxiesDiff.Unreasonable) return GalaxiesDiff.Unfinished;
  const search: AnswerSearch<Deduction, CellMarks> = {
    start: d,
    deduce: (x) => deduce(x),
    assume: assumeDot,
    solution: (x) => x.m,
    budget: SEARCH_BUDGET,
  };
  const answer = searchAnswers(search);
  switch (answer.kind) {
    case "one":
      writeAnswer(s, answer.solution, s.dots);
      return GalaxiesDiff.Unreasonable;
    case "several":
      return GalaxiesDiff.Ambiguous;
    case "none":
      return GalaxiesDiff.Impossible;
    case "out-of-reach":
      return GalaxiesDiff.Unfinished;
  }
}

// --- the hint's walk ---------------------------------------------------------

/** The squares a firing's reason turns on, which a plan continues from: a
 * player follows a galaxy as it grows. */
export function readsOf(sp: GridSpace, f: GalaxiesFiring): number[] {
  const out: number[] = [];
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object" && "x" in v && "y" in v) {
      const p = v as Point;
      // A square's own; an edge's or a dot's by the squares round it.
      for (const x of [(p.x - 1) >> 1, p.x >> 1])
        for (const y of [(p.y - 1) >> 1, p.y >> 1])
          if (x >= 0 && y >= 0 && x < sp.w && y < sp.h) out.push(y * sp.w + x);
    }
  };
  Object.values(f).forEach(walk);
  return out;
}

/** The tier the hint's walk runs at: the whole ladder. */
export const HINT_TIER = TOP;

/** The techniques the hint takes first, and only where nothing else follows. */
export const HINT_ROLES = {
  // Every rung after it reads a dot's own squares as its own.
  prerequisite: ["dotTile"] satisfies GalaxiesRung[],
  // Mirroring a line is Galaxies' signature technique, but as the
  // routine source of lines it buried everything else (58% of a 7x7
  // plan's steps, measured), while the lines it drew early are the ones
  // "these two squares are in different galaxies" says later in the
  // game's plainest terms. So it fires only where nothing else does.
  fallback: ["mirrorWall"] satisfies GalaxiesRung[],
};

/** What the hint walks: the marks `s` holds (the player's lines and arrows),
 * the ladder over them, and the board's dots. */
export function galaxiesWalk(s: GalaxiesState): {
  marks: CellMarks;
  entries: Ladder["entries"];
  dl: galaxies.Dealt;
} {
  const { m, ladder, dl } = deduction(s);
  return { marks: m, entries: ladder.entries, dl };
}

/** The marks as they stood before `taken` was made, given the candidates
 * `before` the walk saw: a copy with the firing's lines and arrows undone. */
export function marksBefore(m: CellMarks, before: Int32Array, taken: Taken): CellMarks {
  const c = new CellMarks(m.sp, m.domain, m.grid.slice(), null, "edge");
  c.cands.set(before);
  c.marked.set(m.marked);
  for (let i = 0; i < taken.facts.length; i += 3) {
    if (taken.facts[i] === MARK) c.marked[taken.facts[i + 1]] = -1;
    else c.grid[taken.facts[i + 1]] = 0;
  }
  return c;
}

/** Upstream's `clear_game(state, false)`: clear everything but the dots and the
 * border edges, giving the board's starting position. */
export function clearForSolve(s: GalaxiesState): void {
  for (let y = 1; y < s.sy - 1; y++) {
    for (let x = 1; x < s.sx - 1; x++) {
      const i = idx(s, x, y);
      s.flags[i] &= F_DOT | F_DOT_BLACK;
      s.dotx[i] = 0;
      s.doty[i] = 0;
      if (s.flags[i] & F_DOT) s.nassoc[i] = 0;
    }
  }
}
