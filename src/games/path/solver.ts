/**
 * Path's deductions: one ladder, run two ways.
 *
 * {@link solvePath} runs it to a fixpoint, which is how the generator grades a
 * board and how Solve and the mistake check find the answer.
 * {@link pathRecordingPass} runs the same rungs one firing at a time, and the
 * hint narrates each (docs/solver-and-generator.md § "One engine, two
 * projections").
 *
 * Every rung decides an edge only where the rules force it, so a board the
 * ladder finishes has exactly one answer. Each rung stays true as more of the
 * board is decided, so the order they fire in cannot change where the ladder
 * ends (docs/solver-and-generator.md § "A fixpoint is order-independent only
 * if every rule is monotone").
 *
 * Normal's and Tricky's rungs are one supposition, followed by the Easy rung
 * until the board breaks, for at most {@link CHAIN_LIMITS} firings: Tricky's
 * walk is the longer. A third way to break, squares the supposition walls
 * off from the numbers they need, was tried for Tricky and declined
 * (2026-10-22): beside the longer walk it changed neither how fast Tricky
 * boards are found nor how many numbers they keep, and in place of it Tricky
 * boards were seldom found at all.
 * No rung crosses out an edge whose line would join two different numbers in
 * Pairs, or two numbers out of order in Path: the edge counts as closed
 * (`PathBoard.live`), as a player sees it is. In Pairs there is no rung
 * against closing a loop either. Pairs' generator lays no path that touches
 * itself, so no piece of a dealt board's answer has its two ends side by
 * side, and inside a supposition a loop is a clash. Path's one line fills
 * the board and touches itself everywhere, so a piece's two ends are often
 * side by side, and the edge between them counts as closed too.
 */

import {
  type DeductionTechnique,
  type FiringTally,
  type LadderCandidate,
  runDeductionFixpoint,
  type SingleFirings,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
import { Dsf } from "../../engine/dsf.ts";
import { CROSS, type EdgeMark, LINE, OPEN } from "../../engine/line-drawing.ts";
import {
  across,
  pieceThrough,
  type SquareEdges,
  squareEdges,
} from "../../engine/square-edges.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  MODE_PATH,
  NO_END,
  type PathPuzzle,
  startEdges,
} from "./state.ts";

/** What breaks a board: a square with more lines than it takes, or too few
 * ways left for the lines it takes; or lines that close a loop, or that join
 * two numbers that may not meet, at `edge`. */
export type PathClash =
  | { kind: "crowded" | "stuck"; cell: number }
  | { kind: "closed" | "joined"; edge: number };

/** Supposing `supposed` on `edge` leads, by the Easy rung's `chain`, to
 * `clash`. */
interface Supposition {
  edge: number;
  supposed: typeof LINE | typeof CROSS;
  chain: PathFiring[];
  clash: PathClash;
}

/** Why a firing decides its edges. */
export type PathReason =
  /** The square has only as many live edges as it still needs lines. */
  | { kind: "forced"; cell: number; need: number }
  /** A supposition whose walk is no longer than Normal's. */
  | ({ kind: "lookahead" } & Supposition)
  /** A supposition whose walk is no longer than Tricky's. */
  | ({ kind: "long-lookahead" } & Supposition);

/** One deduction: `edges` all take `mark`. */
export interface PathFiring {
  reason: PathReason;
  edges: number[];
  mark: typeof LINE | typeof CROSS;
}

/** The rungs, easiest first, by the `kind` of the reason a firing carries. */
export const PATH_RUNGS = [
  "forced",
  "lookahead",
  "long-lookahead",
] as const satisfies readonly PathReason["kind"][];
export type PathRung = (typeof PATH_RUNGS)[number];

/** The two supposition rungs. */
type SupposingRung = Extract<PathRung, "lookahead" | "long-lookahead">;

/** The longest chain of Easy firings each supposition rung may take to break
 * the board. A bound keeps the walk one a player can follow a firing at a
 * time, rather than a search, so each is load-bearing for its tier's name
 * (docs/solver-and-generator.md § "Check, Tactic, Search"). Tricky's walk is
 * twice Normal's: at 9, an 11x11 Tricky board took longer to find, a median
 * 0.7 s against 0.5 s and at worst 2.2 s against 0.6 s (2026-10-22). */
const CHAIN_LIMITS: Readonly<Record<SupposingRung, number>> = {
  lookahead: 6,
  "long-lookahead": 12,
};

/** The rung a supposition whose walk takes `firings` firings belongs to. */
function supposingRung(firings: number): SupposingRung {
  return firings <= CHAIN_LIMITS.lookahead ? "lookahead" : "long-lookahead";
}

/** How far a supposition's walk runs before it gives up. The Easy rung fires
 * every square it can, and some settle a corner the break never reads, so a
 * walk is measured against {@link CHAIN_LIMITS} only once it is
 * {@link pruned} to the firings its break needs, which is the walk the hint
 * shows: twice Tricky's limit leaves it room for the corners. */
const RUN_LIMIT = 24;

/** The board the ladder works on: the puzzle, and the edges it writes as it
 * goes. */
export class PathBoard {
  readonly g: SquareEdges;
  readonly w: number;
  readonly h: number;
  readonly ends: Uint8Array;
  /** The pieces of line, kept up to date by {@link set}, or `null` until
   * they are next asked for. */
  private cached: Pieces | null = null;
  /** 1 on a square {@link forcedAt} last found nothing on, with no edge it
   * reads written since: a scan for a square that fires passes it by. */
  private readonly quiet: Uint8Array;

  constructor(
    readonly puzzle: PathPuzzle,
    readonly edges: Uint8Array,
    quiet?: Uint8Array,
  ) {
    ({ w: this.w, h: this.h, ends: this.ends } = puzzle);
    this.g = squareEdges(this.w, this.h);
    this.quiet = quiet ?? new Uint8Array(this.g.cells);
  }

  /** A copy to suppose on, which knows the squares this board knows are
   * quiet. */
  copy(): PathBoard {
    return new PathBoard(this.puzzle, this.edges.slice(), this.quiet.slice());
  }

  /** Put `mark` on edge `e`. Every write to a board the ladder reads goes
   * through here, so that {@link pieces} is never stale. A new line joins
   * two pieces where they stand, and a cross leaves them as they are; only
   * taking a line away rebuilds them. */
  set(e: number, mark: EdgeMark): void {
    const was = this.edges[e];
    this.edges[e] = mark;
    if (was === mark) return;
    this.stir(e, was === LINE, mark === LINE);
    if (this.cached === null) return;
    if (was === LINE) this.cached = null;
    else if (mark === LINE) this.cached.add(this, e);
  }

  /**
   * Mark the squares not quiet whose {@link forcedAt} a write to edge `e`
   * can change. A cross changes only the live edges of its two squares. A
   * line changes the lines of its two squares, so the live edges of the
   * squares beside them; and it joins two pieces, so the number the piece
   * reaches may change at the piece's free ends, and with it the live edges
   * there and beside them. Taking a line away is not reasoned about: no rung
   * does it.
   */
  private stir(e: number, wasLine: boolean, isLine: boolean): void {
    const { g } = this;
    const [i, j] = [g.a[e], g.b[e]];
    if (wasLine) {
      this.quiet.fill(0);
      return;
    }
    this.quiet[i] = this.quiet[j] = 0;
    if (!isLine) return;
    for (const k of pieceThrough(g, (f) => this.edges[f] === LINE, i)) {
      if (k !== i && k !== j && !this.spare(k)) continue;
      this.quiet[k] = 0;
      for (let d = 0; d < 4; d++) {
        const f = g.around[k * 4 + d];
        if (f >= 0) this.quiet[across(g, f, k)] = 0;
      }
    }
  }

  /** Whether square `i` is quiet: see {@link quiet}. */
  isQuiet(i: number): boolean {
    return this.quiet[i] === 1;
  }

  /** Record that {@link forcedAt} found nothing on square `i`. */
  hush(i: number): void {
    this.quiet[i] = 1;
  }

  /** The pieces the lines make now. */
  pieces(): Pieces {
    this.cached ??= new Pieces(this);
    return this.cached;
  }

  /** The edges around square `i` that hold `mark`. */
  edgesAt(i: number, mark: EdgeMark): number[] {
    const out: number[] = [];
    for (let k = 0; k < 4; k++) {
      const e = this.g.around[i * 4 + k];
      if (e >= 0 && this.edges[e] === mark) out.push(e);
    }
    return out;
  }

  /** How many lines square `i` has. Counted rather than listed, as
   * {@link edgesAt} would, since a supposition asks it of every square at
   * every firing. */
  lines(i: number): number {
    let n = 0;
    for (let k = 0; k < 4; k++) {
      const e = this.g.around[i * 4 + k];
      if (e >= 0 && this.edges[e] === LINE) n++;
    }
    return n;
  }

  /** How many lines square `i` takes. */
  takes(i: number): number {
    return this.puzzle.takes[i];
  }

  /** Whether square `i` takes another line. */
  spare(i: number): boolean {
    return this.lines(i) < this.takes(i);
  }

  /** Whether a line could still go on edge `e`: it is neither line nor cross,
   * both its squares take another line, and it would not join two numbers
   * that may not meet, whether they sit on its squares or the lines from
   * them end there; in Path, nor close a loop. Each of these a player sees
   * at a glance (owner, 2026-10-21), so such an edge is as good as crossed
   * out and no step asks for its cross. */
  live(e: number): boolean {
    const [i, j] = [this.g.a[e], this.g.b[e]];
    if (this.edges[e] !== OPEN || !this.spare(i) || !this.spare(j)) return false;
    return this.pieces().meets(i, j);
  }

  /** The {@link live} edges around square `i`. */
  liveAt(i: number): number[] {
    return this.edgesAt(i, OPEN).filter((e) => this.live(e));
  }

  /** How many {@link live} edges square `i` has. */
  liveCount(i: number): number {
    let n = 0;
    for (let k = 0; k < 4; k++) {
      const e = this.g.around[i * 4 + k];
      if (e >= 0 && this.live(e)) n++;
    }
    return n;
  }

  /** Whether some square still lacks a line it takes. */
  unfinished(): boolean {
    for (let i = 0; i < this.g.cells; i++)
      if (this.lines(i) < this.takes(i)) return true;
    return false;
  }
}

/**
 * The pieces of path the lines make: each piece's two end squares, and the
 * number nearest each end along it. That is all either ruleset's rule reads.
 * In Pairs two pieces may meet where their numbers are alike or one has none.
 * In Path, where every number is on one square, a piece's numbers run in
 * order, and two pieces may meet where the numbers nearest the meeting ends
 * are one apart: a line from the 3 that meets a line whose nearest number is
 * the 5 must miss the 4, and one that meets the 4 cannot pass it in the
 * wrong order, because the 4's own piece cannot hold the 3 too.
 */
class Pieces {
  readonly dsf: Dsf;
  private readonly mode: number;
  /** At each piece's root, its two end squares: the same square twice for a
   * piece of one square. */
  private readonly endA: Int32Array;
  private readonly endB: Int32Array;
  /** At each piece's root, the number nearest {@link endA} and
   * {@link endB} along the piece, or {@link NO_END}. */
  private readonly nearA: Int32Array;
  private readonly nearB: Int32Array;
  /** The first line that breaks a rule, or `null`. */
  clash: PathClash | null = null;

  constructor(b: PathBoard) {
    const { g } = b;
    this.mode = b.puzzle.mode;
    this.dsf = new Dsf(g.cells);
    this.endA = Int32Array.from({ length: g.cells }, (_, i) => i);
    this.endB = this.endA.slice();
    this.nearA = Int32Array.from(b.ends);
    this.nearB = this.nearA.slice();
    for (let e = 0; e < g.edgeCount; e++) if (b.edges[e] === LINE) this.add(b, e);
  }

  /** Whether numbers `p` and `q` may be joined, either being
   * {@link NO_END}. */
  private fits(p: number, q: number): boolean {
    if (p === NO_END || q === NO_END) return true;
    return this.mode === MODE_PATH ? Math.abs(p - q) === 1 : p === q;
  }

  /** The number nearest square `i` along its piece, where `i` is one of its
   * ends. */
  nearAt(i: number): number {
    const r = this.dsf.canonify(i);
    return this.endA[r] === i ? this.nearA[r] : this.nearB[r];
  }

  /** Whether a line between squares `i` and `j`, each an end of its piece,
   * breaks no rule. */
  meets(i: number, j: number): boolean {
    if (this.dsf.equivalent(i, j)) return this.mode !== MODE_PATH;
    return this.fits(this.nearAt(i), this.nearAt(j));
  }

  /** Join the pieces at the two ends of line `e`. */
  add(b: PathBoard, e: number): void {
    const { g } = b;
    const [u, v] = [g.a[e], g.b[e]];
    const [x, y] = [this.dsf.canonify(u), this.dsf.canonify(v)];
    if (x === y) {
      this.clash ??= { kind: "closed", edge: e };
      return;
    }
    // A square already in the middle of its piece has a third line; no
    // move or rung lays one, so this is a board loaded as it was saved.
    for (const [i, r] of [
      [u, x],
      [v, y],
    ])
      if (this.endA[r] !== i && this.endB[r] !== i) {
        this.clash ??= { kind: "crowded", cell: i };
        return;
      }
    const [p, q] = [this.nearAt(u), this.nearAt(v)];
    if (!this.fits(p, q)) {
      this.clash ??= { kind: "joined", edge: e };
      return;
    }
    // The ends left are the far ones, and a far end with no number nearer
    // it on its own piece is nearest the number across the join.
    const [farX, nearX] =
      this.endA[x] === u
        ? [this.endB[x], this.nearB[x]]
        : [this.endA[x], this.nearA[x]];
    const [farY, nearY] =
      this.endA[y] === v
        ? [this.endB[y], this.nearB[y]]
        : [this.endA[y], this.nearA[y]];
    this.dsf.merge(x, y);
    const r = this.dsf.canonify(x);
    this.endA[r] = farX;
    this.nearA[r] = nearX !== NO_END ? nearX : q;
    this.endB[r] = farY;
    this.nearB[r] = nearY !== NO_END ? nearY : p;
  }

  /** The lowest number on the piece through square `i`, or {@link NO_END}:
   * in Pairs, its one number. */
  numberOf(i: number): number {
    const r = this.dsf.canonify(i);
    const [p, q] = [this.nearA[r], this.nearB[r]];
    if (p === NO_END || q === NO_END) return p === NO_END ? q : p;
    return Math.min(p, q);
  }
}

/** The first thing that breaks `b`, or `null`. */
function clashOf(b: PathBoard): PathClash | null {
  // A loop or a join first: it is on the board as drawn, where a square short
  // of ways is a count the player makes.
  const joined = b.pieces().clash;
  if (joined) return joined;
  for (let i = 0; i < b.g.cells; i++) {
    const lines = b.lines(i);
    const need = b.takes(i);
    if (lines > need) return { kind: "crowded", cell: i };
    if (lines < need && lines + b.liveAt(i).length < need)
      return { kind: "stuck", cell: i };
  }
  return null;
}

/** Whether `firing` is still a deduction on `b` as it stands: its square
 * still has exactly its edges for the lines it needs. A supposition's chain is
 * cut down to the firings its break needs by asking this of each that is
 * left. */
function stillHolds(b: PathBoard, firing: PathFiring): boolean {
  const { reason } = firing;
  if (reason.kind !== "forced") return false;
  const live = b.liveAt(reason.cell);
  const need = b.takes(reason.cell) - b.lines(reason.cell);
  return (
    need === live.length &&
    need === firing.edges.length &&
    firing.edges.every((e) => live.includes(e))
  );
}

/** Whether the lines solve the puzzle: each square has the lines it takes,
 * and no line breaks a rule. Then in Pairs every path runs between two like
 * numbers; in Path the 1 and the highest number are the only squares that
 * take one line, so the lines are one path between them, through the numbers
 * in order. A cross and an open edge are the same here, so a player need
 * cross nothing out to finish. */
export function isComplete(puzzle: PathPuzzle, edges: Uint8Array): boolean {
  const board = new PathBoard(puzzle, edges);
  for (let i = 0; i < board.g.cells; i++)
    if (board.lines(i) !== board.takes(i)) return false;
  // Every square has its lines, so a piece that reaches no number is a loop.
  const pieces = new Pieces(board);
  if (pieces.clash) return false;
  for (let i = 0; i < board.g.cells; i++)
    if (pieces.numberOf(i) === NO_END) return false;
  return true;
}

// --- the rungs ---------------------------------------------------------------

/** Square `i`'s firing where it has only as many live edges as it still
 * needs lines, `null` where it has not, or `"contradiction"` where it has too
 * many lines or too few ways left to take them. */
function forcedAt(b: PathBoard, i: number): PathFiring | null | "contradiction" {
  const need = b.takes(i) - b.lines(i);
  if (need < 0) return "contradiction";
  if (need === 0) return null;
  const live = b.liveCount(i);
  if (need > live) return "contradiction";
  if (need < live) return null;
  return { reason: { kind: "forced", cell: i, need }, edges: b.liveAt(i), mark: LINE };
}

/** The first square {@link forcedAt} fires on, `null` when none does, or
 * `"contradiction"`. Quiet squares are passed by, and every square found
 * with nothing is quiet from then on. */
function findForced(b: PathBoard): PathFiring | null | "contradiction" {
  if (b.pieces().clash) return "contradiction";
  for (let i = 0; i < b.g.cells; i++) {
    if (b.isQuiet(i)) continue;
    const found = forcedAt(b, i);
    if (found !== null) return found;
    b.hush(i);
  }
  return null;
}

/** As {@link findForced}, but a contradiction anywhere comes before a firing
 * ahead of it: a supposition stops where the board breaks, not one firing
 * later. */
function forcedOrBroken(b: PathBoard): PathFiring | null | "contradiction" {
  if (b.pieces().clash) return "contradiction";
  let first: PathFiring | null = null;
  for (let i = 0; i < b.g.cells; i++) {
    if (b.isQuiet(i)) continue;
    const found = forcedAt(b, i);
    if (found === "contradiction") return found;
    if (found === null) b.hush(i);
    first ??= found;
  }
  return first;
}

/** Every forced firing on `b`, for a plan that chooses among them. */
function allForced(b: PathBoard): PathFiring[] | "contradiction" {
  if (b.pieces().clash) return "contradiction";
  const out: PathFiring[] = [];
  for (let i = 0; i < b.g.cells; i++) {
    const found = forcedAt(b, i);
    if (found === "contradiction") return found;
    if (found !== null) out.push(found);
  }
  return out;
}

/**
 * The numbers whose lines a firing's premise reads, which a hint plan
 * continues from: a player follows a line from its number, so a plan works on
 * one number's line until nothing more follows for it. A forced square reads
 * the line it is on and the lines whose squares closed its edges; a
 * supposition reads the lines at its edge.
 */
function numbersReadBy(b: PathBoard, firing: PathFiring): number[] {
  const { g } = b;
  const pieces = b.pieces();
  const on = (i: number): number[] => {
    const v = pieces.numberOf(i);
    return v === NO_END ? [] : [v];
  };
  const { reason } = firing;
  switch (reason.kind) {
    case "forced": {
      // Its own line, and the lines of the full squares beside it. Not the
      // line across a cross: the cross was made for that line's sake and says
      // nothing more about it, so a square it forces belongs to its own line.
      const out = on(reason.cell);
      for (let k = 0; k < 4; k++) {
        const e = g.around[reason.cell * 4 + k];
        if (e < 0 || b.edges[e] !== OPEN || b.live(e)) continue;
        const j = across(g, e, reason.cell);
        // Two numbers side by side close their edge from the start: no step
        // made it, so it continues from none.
        if (b.ends[reason.cell] !== NO_END && b.ends[j] !== NO_END) continue;
        if (!b.spare(j)) out.push(...on(j));
      }
      return out;
    }
    case "lookahead":
    case "long-lookahead":
      return [...on(g.a[reason.edge]), ...on(g.b[reason.edge])];
  }
}

/** `found` as the candidates a plan's frontier chooses among. A line writes
 * the number whose line it extends; a cross writes none, as it serves the
 * line in hand, so the plan stays with that line. */
function offered(
  b: PathBoard,
  apply: (found: PathFiring | null | "contradiction") => number,
  found: readonly PathFiring[] | "contradiction",
): LadderCandidate[] | "contradiction" {
  if (found === "contradiction") return found;
  return found.map((firing) => ({
    reads: () => numbersReadBy(b, firing),
    writes: () => {
      if (firing.mark !== LINE) return [];
      const pieces = b.pieces();
      return firing.edges.flatMap((e) =>
        [b.g.a[e], b.g.b[e]].map((i) => pieces.numberOf(i)).filter((v) => v !== NO_END),
      );
    },
    take: () => {
      apply(firing);
    },
  }));
}

/** A writer of firings onto `board`, handing each to `record`. */
function applier(
  board: PathBoard,
  record?: (firing: PathFiring) => void,
): (found: PathFiring | null | "contradiction") => number {
  return (found) => {
    if (found === "contradiction") return -1;
    if (found === null) return 0;
    for (const e of found.edges) board.set(e, found.mark);
    record?.(found);
    return 1;
  };
}

/**
 * The Easy firings that follow from supposing `mark` on edge `e`, up to the
 * board breaking, or `null` where it does not break within `limit` firings.
 * The squares quiet on `b` stay quiet until the walk touches them, so on a
 * board where nothing fires, only those can.
 */
function suppose(
  b: PathBoard,
  e: number,
  mark: typeof LINE | typeof CROSS,
  limit: number,
): { chain: PathFiring[]; clash: PathClash } | null {
  const trial = b.copy();
  trial.set(e, mark);
  const chain: PathFiring[] = [];
  for (;;) {
    const found = forcedOrBroken(trial);
    // The Easy rung's contradiction is a square or a line {@link clashOf}
    // names; one scan of the squares serves both.
    if (found === "contradiction") {
      const clash = clashOf(trial);
      return clash && { chain, clash };
    }
    if (found === null || chain.length >= limit) return null;
    for (const f of found.edges) trial.set(f, found.mark);
    chain.push(found);
  }
}

/**
 * `walk`, from supposing `mark` on edge `e` of `b`, cut down to the firings
 * its break needs: numbered, a firing the break never reads would claim an
 * order of consequence that is not there. Each firing is dropped, last first,
 * where the ones left still follow one from the next and still break the
 * board, which is then said as it breaks with those alone.
 */
function pruned(
  b: PathBoard,
  e: number,
  mark: typeof LINE | typeof CROSS,
  walk: { chain: PathFiring[]; clash: PathClash },
): { chain: PathFiring[]; clash: PathClash } {
  const breaks = (chain: readonly PathFiring[]): PathClash | null => {
    const edges = b.edges.slice();
    edges[e] = mark;
    const trial = new PathBoard(b.puzzle, edges);
    for (const link of chain) {
      if (!stillHolds(trial, link)) return null;
      for (const f of link.edges) trial.set(f, link.mark);
    }
    return clashOf(trial);
  };
  let chain = walk.chain;
  for (let k = chain.length - 1; k >= 0; k--) {
    const without = chain.filter((_, j) => j !== k);
    if (breaks(without)) chain = without;
  }
  return { chain, clash: breaks(chain) ?? walk.clash };
}

/**
 * A live edge one of whose marks breaks the board within `kind`'s walk, which
 * must then take the other mark. With `shortest`, the one that breaks it in
 * the fewest firings, as a hint narrates; without, the first found from edge
 * `from` on, as grading wants, since the ladder ends in the same place
 * whichever valid firing it takes first.
 */
function findSupposition(
  b: PathBoard,
  kind: SupposingRung,
  shortest: boolean,
  from = 0,
): PathFiring | null {
  let best: PathFiring | null = null;
  let fewest = Number.POSITIVE_INFINITY;
  const limit = CHAIN_LIMITS[kind];
  // Hushes every square that does not fire, so that no supposition looks at
  // it again until its walk touches it.
  findForced(b);
  const count = b.g.edgeCount;
  for (let k = 0; k < count; k++) {
    const e = (from + k) % count;
    if (!b.live(e)) continue;
    for (const supposed of [LINE, CROSS] as const) {
      const walk = suppose(b, e, supposed, RUN_LIMIT);
      if (walk === null) continue;
      // Grading takes a walk already within the limit as it is; a hint
      // shows every walk cut down.
      const cut =
        !shortest && walk.chain.length <= limit ? walk : pruned(b, e, supposed, walk);
      if (cut.chain.length > limit || cut.chain.length >= fewest) continue;
      fewest = cut.chain.length;
      best = {
        reason: { kind: supposingRung(fewest), edge: e, supposed, ...cut },
        edges: [e],
        mark: supposed === LINE ? CROSS : LINE,
      };
      if (!shortest) return best;
    }
  }
  return best;
}

/** The ladder over `board`. A rung that fires writes its edges, and hands
 * the firing to `record` where there is one, which wants each supposition
 * the shortest there is. */
function ladder(
  board: PathBoard,
  record?: (firing: PathFiring) => void,
): DeductionTechnique[] {
  const apply = applier(board, record);
  const narrated = record !== undefined;
  const supposing = (kind: SupposingRung, tier: number): DeductionTechnique => {
    // Where grading left off: the suppositions before it failed last time,
    // and most still do.
    let from = 0;
    return {
      id: kind satisfies PathRung,
      tier,
      run: () => {
        const found = findSupposition(board, kind, narrated, from);
        if (found !== null) from = found.edges[0];
        return apply(found);
      },
      // The shortest walk only: every supposition is dear, and the frontier
      // reaches this rung only where no easier firing continues.
      available: () => {
        const found = findSupposition(board, kind, true);
        return offered(board, apply, found ? [found] : []);
      },
    };
  };
  return [
    {
      id: "forced" satisfies PathRung,
      tier: DIFF_EASY,
      run: () => apply(findForced(board)),
      available: () => offered(board, apply, allForced(board)),
    },
    supposing("lookahead", DIFF_NORMAL),
    supposing("long-lookahead", DIFF_TRICKY),
  ];
}

/**
 * Solve in place with the ladder capped at tier `cap`, and say how it ended.
 * `firings` takes a count of each rung's firings, for a census.
 */
export function solvePath(
  board: PathBoard,
  cap: number,
  firings?: FiringTally,
): DifficultyVerdict {
  const { impossible } = runDeductionFixpoint({
    techniques: ladder(board),
    maxTier: cap,
    firings,
    settled: () => !board.unfinished(),
  });
  if (impossible) return "impossible";
  if (board.unfinished()) return "unsolved";
  return isComplete(board.puzzle, board.edges) ? "solved" : "impossible";
}

/** The marks of a board's answer, its lines and its walls' crosses, or
 * `null` where the ladder does not reach one. */
export function answerOf(puzzle: PathPuzzle): readonly EdgeMark[] | null {
  const board = new PathBoard(puzzle, startEdges(puzzle));
  if (solvePath(board, DIFF_TRICKY) !== "solved") return null;
  return Array.from(board.edges, (m, e) =>
    m === LINE ? LINE : puzzle.walls[e] ? CROSS : OPEN,
  );
}

/** The ladder one firing at a time, writing `board` as it goes: `next` gives
 * the firing just made, or `null` when no rung fires. */
export function pathRecordingPass(
  board: PathBoard,
  budget: StepBudget,
): { next(): PathFiring | null; impossible(): boolean } {
  let last: PathFiring | null = null;
  const pass: SingleFirings = singleFirings({
    techniques: ladder(board, (firing) => {
      last = firing;
    }),
    budget,
    settled: () => !board.unfinished(),
    // A plan stays with the line it is working on before it moves on.
    continuing: true,
  });
  return {
    next: () => (pass.next() ? last : null),
    impossible: () => pass.impossible(),
  };
}
