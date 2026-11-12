/**
 * Bridges' solver: the ladder `bridges.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), and the answer
 * check its rules compile to.
 *
 * The answer is on the edges between squares, each holding one more than the
 * bridges running across it, so a bridge between two islands is one value on
 * every edge of its line. The marks hold what is known of each line, the same
 * on all its edges: a bridge drawn strikes the values below it, and a limit or
 * a cross those above.
 *
 * The ladder runs to a fixpoint ({@link solveFromScratch}), which is how the
 * generator grades a board and how Solve and the mistake check find its
 * answer. A hint walks the same ladder one firing at a time
 * ({@link bridgesWalk}).
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
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
} from "../../engine/ladder-runtime.ts";
import * as bridges from "./bridges.compiled.ts";
import {
  type BridgesOp,
  type BridgesState,
  G_LINEH,
  G_LINEV,
  G_NOLINEH,
  G_NOLINEV,
} from "./state.ts";

// --- what a firing points at, and why ----------------------------------------

/** A bridge span, by the two islands it runs between. */
export interface BridgesSpan {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** What each technique says, as the hint's sentences read it. */
export type BridgesSays = bridges.SaysById;

// --- the board as the description reads it -----------------------------------

/** What the description reads a line holding no bridge as. */
const NONE = 1;

/** A line two islands may be bridged along: a square between them at least,
 * and no island. */
interface Line {
  /** Its islands' cells, `a` above or left of `b`. */
  a: number;
  b: number;
  /** Its squares from `a` to `b`, both included. */
  cells: number[];
  /** Its edges, from `a`. */
  edges: number[];
  span: BridgesSpan;
}

/** A board's lines and what the description reads it as. */
export interface Geometry {
  sp: GridSpace;
  dealt: bridges.Dealt;
  lines: Line[];
  /** The line each edge is on, `-1` for none. */
  lineOf: Int32Array;
  /** The lines each island cell ends, by cell. */
  linesAt: number[][];
  variations: readonly string[];
}

function geometryOf(state: BridgesState): Geometry {
  const { w, h } = state;
  const sp = describedSpace(bridges.units, w, h);
  const lines: Line[] = [];
  const lineOf = new Int32Array(sp.edges.length).fill(-1);
  const linesAt: number[][] = Array.from({ length: w * h }, () => []);
  for (const is of state.islands) {
    for (const pt of is.points) {
      if (pt.dx === -1 || pt.dy === -1 || pt.off < 2) continue;
      const cells: number[] = [];
      for (let k = 0; k <= pt.off; k++)
        cells.push(state.idx(is.x + k * pt.dx, is.y + k * pt.dy));
      const edges = cells.slice(1).map((c, k) => sp.edgeOf(cells[k], c));
      const n = lines.length;
      const a = cells[0];
      const b = cells[cells.length - 1];
      for (const e of edges) lineOf[e] = n;
      linesAt[a].push(n);
      linesAt[b].push(n);
      lines.push({
        a,
        b,
        cells,
        edges,
        span: { x1: a % w, y1: (a / w) | 0, x2: b % w, y2: (b / w) | 0 },
      });
    }
  }
  const at: number[] = [];
  const v: number[] = [];
  for (const is of state.islands) {
    at.push(state.idx(is.x, is.y));
    v.push(is.count);
  }
  return {
    sp,
    dealt: { number: clueList(at, v, w * h), maxb: state.maxb },
    lines,
    lineOf,
    linesAt,
    variations: state.allowloops ? [] : ["no loops"],
  };
}

/** The values a line may hold, from `lo` to `hi` bridges. */
const between = (lo: number, hi: number): number =>
  ((1 << (hi + 2)) - 1) & ~((1 << (lo + 1)) - 1);

/** The first cell of a line, where the state keeps its bridges and marks. */
function firstCell(line: Line): number {
  return line.cells[1];
}

/** The bridges a line has on the state, and the most it may take. */
function lineOnState(state: BridgesState, line: Line): { lo: number; hi: number } {
  const c = firstCell(line);
  const x = c % state.w;
  const y = (c / state.w) | 0;
  const horizontal = line.span.y1 === line.span.y2;
  const lo = state.gridCount(x, y, horizontal ? G_LINEH : G_LINEV);
  const crossed = (state.grid[c] & (horizontal ? G_NOLINEH : G_NOLINEV)) !== 0;
  const hi = crossed ? 0 : state.maximum(horizontal ? 1 : 0, x, y);
  return { lo, hi: Math.max(lo, hi) };
}

/** A board the ladder works on: the marks, and what it reads them by. */
interface Deduction {
  state: BridgesState;
  geo: Geometry;
  m: CellMarks;
  ladder: Ladder;
}

/** The marks the state's bridges and limits make, or none where `cleared`. */
function deduction(state: BridgesState, cleared: boolean): Deduction {
  const geo = geometryOf(state);
  const domain = between(0, state.maxb);
  const grid = new Uint8Array(geo.sp.edges.length);
  const known = cleared ? [] : geo.lines.map((line) => lineOnState(state, line));
  known.forEach(({ lo, hi }, n) => {
    if (lo === hi) for (const e of geo.lines[n].edges) grid[e] = lo + NONE;
  });
  const m = new CellMarks(geo.sp, domain, grid, null, "edge");
  m.seed(grid);
  known.forEach(({ lo, hi }, n) => {
    for (const e of geo.lines[n].edges) m.cands[e] &= between(lo, hi);
  });
  return { state, geo, m, ladder: bridgesLadder(geo) };
}

/** The marks' reads the description makes, for a firing's reason and the
 * hint's status: what a line has and allows, and what an island needs. */
class Reads {
  constructor(
    readonly state: BridgesState,
    readonly geo: Geometry,
    readonly m: Pick<CellMarks, "cands">,
  ) {}

  private drawn(e: number): number {
    const c = this.m.cands[e];
    return c === 0 ? this.state.maxb + 1 : 31 - Math.clz32(c & -c) - NONE;
  }
  private limit(e: number): number {
    const c = this.m.cands[e];
    return c === 0 ? -1 : 31 - Math.clz32(c) - NONE;
  }
  has(line: Line): number {
    return Math.max(
      this.drawn(line.edges[0]),
      this.drawn(line.edges[line.edges.length - 1]),
    );
  }
  allows(line: Line): number {
    return Math.min(
      this.limit(line.edges[0]),
      this.limit(line.edges[line.edges.length - 1]),
    );
  }
  clue(c: number): number {
    return this.geo.dealt.number.valueAt[c];
  }
  lines(c: number): Line[] {
    return this.geo.linesAt[c].map((n) => this.geo.lines[n]);
  }
  /** `hasAt` for the line `tried` supposed to hold `j`. */
  private hasAt(line: Line, tried: Line | null, j: number): number {
    return line === tried ? j : this.has(line);
  }
  needAt(c: number, tried: Line | null = null, j = 0): number {
    let n = this.clue(c);
    for (const line of this.lines(c)) n -= this.hasAt(line, tried, j);
    return n;
  }
  need(c: number): number {
    return this.needAt(c);
  }
  other(line: Line, c: number): number {
    return line.a === c ? line.b : line.a;
  }
  /** Whether a bridge drawn, or the line `tried`, crosses `line`. */
  crossedAt(line: Line, tried: Line | null = null): boolean {
    const { sp } = this.geo;
    const horizontal = line.span.y1 === line.span.y2;
    for (const mid of line.cells.slice(1, -1)) {
      for (const p of sp.adj4[mid]) {
        const sameRow = ((p / this.state.w) | 0) === ((mid / this.state.w) | 0);
        if (horizontal === sameRow) continue;
        const e = sp.edgeOf(mid, p);
        if (this.drawn(e) > 0) return true;
        const n = this.geo.lineOf[e];
        if (n >= 0 && this.geo.lines[n] === tried) return true;
      }
    }
    return false;
  }
  /** How many more bridges `line` may take, read from its island `c`. */
  more(line: Line, c: number): number {
    if (
      this.need(c) <= 0 ||
      this.need(this.other(line, c)) <= 0 ||
      this.crossedAt(line)
    )
      return 0;
    const has = this.has(line);
    return Math.max(
      0,
      Math.min(
        this.state.maxb,
        this.allows(line) - has,
        this.clue(c) - has,
        this.clue(this.other(line, c)) - has,
      ),
    );
  }
  most(line: Line, c: number): number {
    return this.has(line) + this.more(line, c);
  }
  /** Whether island `c` is left short with `tried` supposed to hold `j`. */
  starvedAt(c: number, tried: Line, j: number): boolean {
    const need = this.needAt(c, tried, j);
    if (need < 0) return true;
    let avail = 0;
    for (const line of this.lines(c)) {
      if (this.crossedAt(line, tried)) continue;
      const far = this.other(line, c);
      avail += Math.max(
        0,
        Math.min(
          this.state.maxb,
          this.needAt(far, tried, j),
          this.allows(line) - this.hasAt(line, tried, j),
        ),
      );
    }
    return avail < need;
  }
  /** The island index of cell `c`. */
  index(c: number): number {
    return this.state.gridi[c];
  }
  /** The bridges known between the islands `cells`, for an outline. */
  spansAmong(cells: readonly number[]): BridgesSpan[] {
    const member = new Set(cells);
    return this.geo.lines
      .filter((l) => member.has(l.a) && member.has(l.b) && this.has(l) > 0)
      .map((l) => l.span);
  }
}

/** The ladder over the dealt board: each technique as the description states
 * it, a firing recording what it says. */
function bridgesLadder(geo: Geometry): Ladder {
  const dl = geo.dealt;
  return describedLadder(
    bridges,
    {
      exactSpace: compiledRung(bridges.exactSpace, dl),
      everyNeighbor: compiledRung(bridges.everyNeighbor, dl),
      needsThisWay: compiledRung(bridges.needsThisWay, dl),
      sealing: compiledRung(bridges.sealing, dl),
      loop: compiledRung(bridges.loop, dl),
      tooMany: compiledRung(bridges.tooMany, dl),
      mustReachOut: compiledRung(bridges.mustReachOut, dl),
    },
    undefined,
    geo.variations,
  );
}

// --- solving -----------------------------------------------------------------

/** The cap of a tier past every technique's. */
const TOP = 2;

/** The value grid the marks' known bridges make: every line at what it
 * has, every other edge none. */
function answerGrid(d: Deduction): Uint8Array {
  const r = new Reads(d.state, d.geo, d.m);
  const g = new Uint8Array(d.geo.sp.edges.length).fill(NONE);
  for (const line of d.geo.lines) {
    const has = r.has(line);
    for (const e of line.edges) g[e] = has + NONE;
  }
  return g;
}

/** Whether some island still needs a bridge, by the marks. */
function unfinished(d: Deduction): boolean {
  const r = new Reads(d.state, d.geo, d.m);
  return d.state.islands.some((is) => r.need(d.state.idx(is.x, is.y)) > 0);
}

/** Run the ladder on `d` to a fixpoint at `cap` and say what it reached. */
function deduce(
  d: Deduction,
  cap: number,
  firings?: FiringTally,
): "solved" | "stuck" | "contradiction" {
  const { m, ladder } = d;
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: Math.min(cap, TOP) }, {}),
    { firings },
  );
  if (impossible) return "contradiction";
  if (unfinished(d)) return "stuck";
  return bridges.isAnswer(answerGrid(d), d.geo.sp, d.geo.dealt, d.geo.variations)
    ? "solved"
    : "contradiction";
}

/**
 * Solve `state` in place from its clues alone at `difficulty` (0, 1 or 2;
 * higher caps nothing more). Clears every bridge and mark first, so the state
 * must be a working copy the caller is happy to have overwritten; solved, it
 * holds the answer's bridges. Returns 1 if solved, 0 otherwise.
 */
export function solveFromScratch(
  state: BridgesState,
  difficulty: number,
  firings?: FiringTally,
): number {
  state.mapClear();
  const d = deduction(state, true);
  if (deduce(d, difficulty, firings) !== "solved") return 0;
  const r = new Reads(state, d.geo, d.m);
  for (const line of d.geo.lines) {
    const has = r.has(line);
    if (has === 0) continue;
    const a = state.islandAt(line.span.x1, line.span.y1);
    const b = state.islandAt(line.span.x2, line.span.y2);
    if (a === null || b === null) throw new Error("bridges: a line ends off an island");
    state.islandJoin(a, b, has, false);
  }
  state.mapUpdatePossibles();
  return 1;
}

/** Whether the bridges on `state` answer the board, by its rules. */
export function bridgesSolved(state: BridgesState): boolean {
  const geo = geometryOf(state);
  const g = new Uint8Array(geo.sp.edges.length).fill(NONE);
  for (const line of geo.lines) {
    const { lo } = lineOnState(state, line);
    for (const e of line.edges) g[e] = lo + NONE;
  }
  return bridges.isAnswer(g, geo.sp, geo.dealt, geo.variations);
}

// --- the hint's walk ---------------------------------------------------------

/** What a hint reads a firing by, beside the marks. */
export interface BridgesWalkContext {
  geo: Geometry;
}

/**
 * What a hint walks: the ladder on the player's own bridges and marks, which
 * the engine's walk takes a firing at a time (`engine/described-edge-hint.ts`).
 * `state` is read, never written.
 */
export function bridgesWalk(state: BridgesState): {
  marks: CellMarks;
  entries: Ladder["entries"];
  ctx: BridgesWalkContext;
} {
  const d = deduction(state, false);
  return { marks: d.m, entries: d.ladder.entries, ctx: { geo: d.geo } };
}

/** The cap a hint's walk starts at: the board's own tier. */
export const walkTier = (state: BridgesState): number =>
  Math.min(state.params.difficulty, TOP);

/** How many tiers the ladder has. */
export const TIER_COUNT = TOP + 1;

/** The island cells a firing's lines join, which a player's attention moves to. */
export function linesJoined(geo: Geometry, taken: Taken): number[] {
  const out = new Set<number>();
  for (let i = 0; i < taken.facts.length; i += 3) {
    const n = geo.lineOf[taken.facts[i + 1]];
    if (n >= 0) out.add(n);
  }
  return [...out].flatMap((n) => [geo.lines[n].a, geo.lines[n].b]);
}

/**
 * The moves a firing made, from what each line it decided had and allowed
 * before (`before`, the marks' candidates as the firing found them) to what
 * the marks hold now: a count of bridges, a cross, or a limit, each from the
 * island cell `from` where that is an end of the line, since a sentence reasons
 * from it.
 */
export function firingOps(
  state: BridgesState,
  geo: Geometry,
  marks: CellMarks,
  before: Int32Array,
  taken: Taken,
  from: number,
): BridgesOp[] {
  const now = new Reads(state, geo, marks);
  const was = new Reads(state, geo, { cands: before });
  const touched = new Set<number>();
  for (let i = 0; i < taken.facts.length; i += 3) {
    const n = geo.lineOf[taken.facts[i + 1]];
    if (n >= 0) touched.add(n);
  }
  const ops: BridgesOp[] = [];
  for (const n of touched) {
    const line = geo.lines[n];
    const s = line.span;
    const ends =
      line.b === from ? { x1: s.x2, y1: s.y2, x2: s.x1, y2: s.y1 } : { ...s };
    const has = now.has(line);
    const allows = now.allows(line);
    // A step's moves are all the player is shown, so the line must hold no
    // more than a count of bridges and a limit can say, at both ends.
    const first = marks.cands[line.edges[0]];
    if (first !== between(has, allows) || marks.cands[line.edges.at(-1) ?? 0] !== first)
      throw new Error("bridges: a firing leaves a line its marks cannot show");
    if (has > was.has(line)) ops.push({ op: "L", ...ends, n: has });
    if (allows < was.allows(line))
      ops.push(allows === 0 ? { op: "N", ...ends } : { op: "C", ...ends, n: allows });
  }
  return ops;
}

/** The spans of the lines whose first edges are `edges`, once each, in the
 * order the board's lines run. */
export function spansOf(geo: Geometry, edges: readonly number[]): BridgesSpan[] {
  return [...new Set(edges.map((e) => geo.lineOf[e]))]
    .sort((a, b) => a - b)
    .map((n) => geo.lines[n].span);
}
