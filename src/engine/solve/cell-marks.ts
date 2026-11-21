/**
 * The marks a compiled technique reads, whatever the board, and what a
 * technique run as a value is placed or struck is (`docs/descriptions.md`
 * § "The runtime a ladder runs on").
 *
 * A game's solver extends {@link CellMarks} only where it keeps what no
 * description states, a Search (the Latin and Sudoku forcing chains and
 * recursion); a game whose whole solve is its ladder uses it as it is.
 */

import type { DeductionRecorder } from "./deduction-record.ts";
import {
  type EdgeGroups,
  EdgeRelation,
  type Facts,
  type Footprint,
  forkKept,
  type GridSpace,
  type GroupChanges,
  type Inverse,
  inverseOf,
  MARK,
  type Marks,
  RELATE,
  STRIKE,
  STRIKE_EDGE,
} from "./describe-runtime.ts";
import type { FactGraph } from "./fact-graph.ts";
import { MADE } from "./marks-made.ts";
import type { StepBudget } from "./step-budget.ts";

/** Why a placement struck a value from a cell: the value just placed at
 * `(px, py)`. */
export interface DupReason {
  kind: "dup";
  n: number;
  px: number;
  py: number;
}

/**
 * The cull of a value that may repeat (Salad's empty square): it has been
 * placed all `times` times in this line, so the count forces it, not the one
 * placement. Recorded only where a description declares a repeated value, and
 * kept apart from {@link DupReason} so a game that declares none is not asked
 * to narrate it.
 */
export interface RepeatFullReason {
  kind: "repeatFull";
  n: number;
  line: "row" | "col";
  index: number;
  times: number;
}

/** A technique run as each value is placed, on the cell placed. */
export type PlaceRung = (m: CellMarks, c: number) => void;

/** A technique run as a value is struck from a cell, on the cell struck. */
export type StrikeRung = (m: CellMarks, c: number) => void;

/**
 * The marks a compiled technique reads, over a {@link GridSpace}: a value per
 * cell (0 where there is none, as every game's grid holds it, since no value
 * of a domain is 0) and the values each may still hold, as a bitmask.
 */
export class CellMarks implements Marks {
  readonly sp: GridSpace;
  /** The values placed, 0 where none is: the caller's own array, written in
   * place. */
  grid: Uint8Array | Int8Array | Int16Array;
  /** The values each cell may still hold, as a bitmask (bit `d`). */
  readonly cands: Int32Array;
  /** The values each edge's mark may still hold, as a bitmask, where the
   * description marks the edges, or on a tiling each angle's, or each
   * cell's where the answer is on the edges ({@link markOn}); the game seeds
   * them. */
  readonly edgeCands: Int32Array;
  /** What the mark {@link edgeCands} holds sits on. */
  readonly markOn: "edge" | "angle" | "cell";
  /** How the edges' values are known to relate, where the description
   * keeps a relation over them (Loopy's pairs); made at its first use. */
  private relation: EdgeRelation | null = null;
  /** The element each cell's mark names, `-1` where none, where the
   * description marks each cell with one; the game seeds them. */
  readonly marked: Int32Array;
  placed = 0;
  readonly log: number[] = [];
  epoch = 0;
  readonly made = new Int32Array(Object.keys(MADE).length);
  readonly kept = new Map<unknown, unknown>();
  readonly domain: number;
  readonly repeat: number;
  readonly times: number;
  /** The techniques run as each value is placed, in the description's
   * order. */
  placing: readonly PlaceRung[] = [];
  /** The techniques run as a fact strikes a value from a cell, in the
   * description's order. A placement narrows its cell without them: what a
   * placed value rules out is the placing techniques' to follow. */
  striking: readonly StrikeRung[] = [];

  /** The hint path's: every fact a firing makes, with its reason. Unset on
   * the solve path, which then records nothing. */
  recorder?: DeductionRecorder;
  /** The hint path's fixpoint budget, set with {@link recorder}. */
  budget?: StepBudget;
  /** The facts a walk keeps (`ladder-walk.ts`), where one is walking: a
   * placing technique's strikes are made inside the placement, so it records
   * them here as a firing of their own. Set before {@link seed} to keep the
   * strikes the given values make; the walk then keeps this one. */
  graph?: FactGraph;
  /** Whether a recorded run takes every firing of a technique's pass, as the
   * solve path does, rather than one a pass. For a caller that asks which
   * firings a solve made and not the order a hint would make them in: one
   * firing a pass reads the whole board again for each. */
  wholePasses = false;
  /** The firing being made: bumped before each technique is tried, so every
   * record of one firing shares it. */
  group = 0;

  /** Whether the answer's values sit on the edges between cells
   * (Separate's walls), so that a "cell" here is an edge's index and its
   * values are written on the two cells either side. */
  readonly onEdges: boolean;

  /** Whether a technique's solve run visits only the elements a fact
   * reached since a binding there found nothing ({@link visit}). Off only
   * to compare a run with one that visits every element. */
  static skipping = true;
  /** Each technique's elements still to visit, by its footprint, with the
   * footprint read backwards and how far it has read each set's groups'
   * changes. */
  private readonly visits = new Map<Footprint, Visits>();

  constructor(
    sp: GridSpace,
    domain: number,
    grid: Uint8Array | Int8Array | Int16Array,
    repeat: { value: number; times: number } | null = null,
    held: "cell" | "edge" = "cell",
    markOn: "edge" | "angle" | "cell" = sp.tiling ? "angle" : "edge",
  ) {
    this.sp = sp;
    this.domain = domain;
    this.grid = grid;
    this.onEdges = held === "edge";
    this.cands = new Int32Array(this.onEdges ? sp.edges.length : sp.cells.length);
    this.markOn = markOn;
    this.edgeCands = new Int32Array(
      markOn === "angle"
        ? sp.angles.length
        : markOn === "cell"
          ? sp.cells.length
          : sp.edgeEnds.length / 2,
    );
    this.marked = new Int32Array(sp.cells.length).fill(-1);
    this.repeat = repeat?.value ?? 0;
    this.times = repeat?.times ?? 1;
  }

  known(c: number): boolean {
    return this.grid[c] !== 0;
  }
  value(c: number): number {
    return this.grid[c] || -1;
  }
  cand(c: number): number {
    return this.cands[c];
  }
  has(c: number, d: number): boolean {
    // A shift counts mod 32: a value outside 0 to 31 would read another bit.
    return d >>> 0 < 32 && ((this.cands[c] >> d) & 1) !== 0;
  }
  candCount(c: number): number {
    let n = 0;
    for (let m = this.cands[c]; m !== 0; m &= m - 1) n++;
    return n;
  }
  candFirst(c: number): number {
    const m = this.cands[c];
    return m === 0 ? -1 : 31 - Math.clz32(m & -m);
  }
  candList(c: number): readonly number[] {
    const out: number[] = [];
    for (let m = this.cands[c]; m !== 0; m &= m - 1) out.push(31 - Math.clz32(m & -m));
    return out;
  }
  /** Take `d` from the cell's candidates, and keep only `d`: the two
   * writes {@link strikeAt} and {@link place} make, a wide domain's in its
   * words. */
  protected drop(c: number, d: number): void {
    this.cands[c] &= ~(1 << d);
  }
  protected keepOnly(c: number, d: number): void {
    this.cands[c] &= 1 << d;
  }
  /** Start every cell from its domain. */
  protected seedCands(domainOf?: (c: number) => number): void {
    const { cands } = this;
    for (let c = 0; c < cands.length; c++)
      cands[c] = domainOf ? domainOf(c) & this.domain : this.domain;
  }
  strikeAt(c: number, d: number): void {
    if (!this.has(c, d)) return;
    this.drop(c, d);
    this.made[MADE.cand]++;
    if (this.visits.size > 0) this.reached("answer", c);
    for (const run of this.striking) run(this, c);
  }

  visit(f: Footprint, groups: readonly EdgeGroups[] = []): Uint8Array | null {
    if (!CellMarks.skipping) return null;
    let kept = this.visits.get(f);
    if (kept === undefined) {
      const by = inverseOf(this.sp, f, this.cands.length, this.edgeCands.length);
      kept = { at: new Uint8Array(by.n).fill(1), by, seen: [] };
      this.visits.set(f, kept);
    }
    const { at, by, seen } = kept;
    // A binding reads two squares' groups only by whether they are one, which
    // a join or a split changes only for the squares the change lists.
    for (let s = 0; s < by.group.length; s++) {
      const changes = groups[s]?.changes;
      const was = seen[s];
      if (changes === undefined) {
        at.fill(1);
        seen[s] = null;
        continue;
      }
      if (was?.of !== changes || was.made !== changes.made) at.fill(1);
      else {
        const { start, list } = by.group[s];
        for (let i = was.read; i < changes.changed.length; i++)
          for (const x of changes.changed[i])
            for (let j = start[x]; j < start[x + 1]; j++) at[list[j]] = 1;
      }
      seen[s] = { of: changes, made: changes.made, read: changes.changed.length };
    }
    return at;
  }

  /** A fact changed `kind`'s element `x`: every binding that reads it is to
   * be visited again. */
  private reached(kind: "answer" | "edgeMark", x: number): void {
    for (const { at, by } of this.visits.values()) {
      const { start, list } = by[kind];
      for (let i = start[x]; i < start[x + 1]; i++) at[list[i]] = 1;
    }
  }

  /** The marks changed wholesale, or a relation changed whole classes:
   * every binding is to be visited again, or every one that reads the
   * relation. */
  private reachedAll(relation: boolean): void {
    for (const { at, by } of this.visits.values())
      if (!relation || by.relation) at.fill(1);
  }
  placeAt(c: number, d: number): void {
    this.place(c, d);
  }
  edgeCand(e: number): number {
    return this.edgeCands[e];
  }
  edgeStrikeAt(e: number, d: number): void {
    if ((this.edgeCands[e] & (1 << d)) === 0) return;
    this.edgeCands[e] &= ~(1 << d);
    this.made[MADE.edgeMark]++;
    if (this.visits.size > 0) this.reached("edgeMark", e);
  }
  markOf(c: number): number {
    return this.marked[c];
  }
  /** A mark counts as a placement, since what reads it is kept while none
   * is made. */
  markAt(c: number, q: number): void {
    this.marked[c] = q;
    this.placed++;
    this.made[MADE.cellMark]++;
  }
  /** The relation over the edges, made empty at its first use. */
  get pairs(): EdgeRelation {
    this.relation ??= new EdgeRelation(this.sp.edges.length);
    return this.relation;
  }
  pairOf(e: number, f: number): number {
    return this.pairs.of(e, f);
  }
  relatedOf(e: number): readonly number[] {
    return this.pairs.related(e);
  }
  relateAt(e: number, f: number, d: number): void {
    if (!this.pairs.relate(e, f, d)) return;
    this.made[MADE.relation]++;
    if (this.visits.size > 0) this.reachedAll(true);
  }
  /** Forget every relation, as a game does before it seeds the player's
   * own. */
  clearPairs(): void {
    this.relation = null;
    this.reachedAll(true);
  }

  /**
   * Every cell may hold what `domainOf` gives it (the description's domain
   * where it gives none), and each value `grid` holds is placed. False where
   * a value is placed in a cell that can no longer hold it, as two givens
   * that clash leave one. Records nothing: a given is not a deduction.
   */
  seed(
    grid: Uint8Array | Int8Array | Int16Array,
    domainOf?: (c: number) => number,
  ): boolean {
    this.grid = grid;
    this.reachedAll(false);
    this.placed++;
    this.epoch++;
    this.log.length = 0;
    this.seedCands(domainOf);
    const recorder = this.recorder;
    this.recorder = undefined;
    try {
      for (let c = 0; c < this.cands.length; c++) {
        const d = grid[c];
        if (d === 0) continue;
        if (!this.has(c, d)) return false;
        this.place(c, d);
      }
    } finally {
      this.recorder = recorder;
    }
    return true;
  }

  /**
   * Place `d` in `c`, recorded with `reason` where one is given, and run
   * the techniques that run on placing. The cell keeps no other value, and
   * `d` only if it had it, so a placement of a struck value leaves the marks
   * inconsistent for a technique to read.
   */
  place(c: number, d: number, reason: object | null = null): void {
    const rec = this.recorder;
    if (rec && reason !== null) {
      const w = this.sp.w;
      const at = this.cellOf(c);
      rec({
        kind: "place",
        x: at % w,
        y: (at / w) | 0,
        n: d,
        reason,
        group: this.group,
      });
    }
    this.keepOnly(c, d);
    this.grid[c] = d;
    this.placed++;
    this.made[MADE.value]++;
    this.made[MADE.cand]++;
    this.log.push(c);
    if (this.visits.size > 0) this.reached("answer", c);
    for (const run of this.placing) run(this, c);
  }

  /** Put the marks back as `grid` and `cands` hold them, as a search does
   * between its branches: a setting wholesale, which no log can follow. */
  restore(grid: ArrayLike<number>, cands: ArrayLike<number>): void {
    this.grid.set(grid);
    this.cands.set(cands);
    this.reachedAll(false);
    this.placed++;
    this.epoch++;
    this.log.length = 0;
  }

  /**
   * Make a compiled firing's facts, recording each with the reason `reasonOf`
   * gives it. Every reason is taken before any fact is made, from the marks
   * the firing read.
   */
  applyFacts(facts: Facts, reasonOf: ((i: number) => object) | null): void {
    const w = this.sp.w;
    const rec = this.recorder;
    const reasons: object[] | null = rec ? [] : null;
    if (reasons && reasonOf)
      for (let i = 0; i < facts.length; i += 3) reasons.push(reasonOf(i));
    for (let i = 0; i < facts.length; i += 3) {
      const c = facts[i + 1];
      const n = facts[i + 2];
      const reason = reasons ? (reasons[i / 3] ?? null) : null;
      // An edge's mark is no cell's, so its strike is not recorded: a hint
      // reads it from the firing's facts (Slant's).
      if (facts[i] === STRIKE_EDGE) {
        this.edgeStrikeAt(c, n);
        continue;
      }
      // Nor is a cell's mark a value: a hint reads it from the facts too
      // (Galaxies' arrows).
      if (facts[i] === MARK) {
        this.markAt(c, n);
        continue;
      }
      // Nor a relation between two edges (Loopy's pairs).
      if (facts[i] === RELATE) {
        this.relateAt(c, n >> 2, n & 3);
        continue;
      }
      if (facts[i] !== STRIKE) {
        // Two facts of one firing can place one cell (Towers' facing pairs
        // of a row and a column); the cell was open when both were made.
        if (this.grid[c] === 0) this.place(c, n, reason);
        continue;
      }
      if (rec && this.has(c, n)) {
        const at = this.cellOf(c);
        rec({ kind: "elim", x: at % w, y: (at / w) | 0, n, reason, group: this.group });
      }
      this.strikeAt(c, n);
    }
  }

  /** The cell a record names for the element `c`: itself, or where the
   * values sit on edges, the edge's first cell. */
  private cellOf(c: number): number {
    return this.onEdges ? this.sp.edgeEnds[2 * c] : c;
  }

  /** Why the value placed in `placed` was struck from `struck`. */
  cullReason(placed: number, struck: number): DupReason | RepeatFullReason {
    const { sp } = this;
    const n = this.grid[placed];
    const px = placed % sp.w;
    const py = (placed / sp.w) | 0;
    if (n !== this.repeat) return { kind: "dup", n, px, py };
    const inRow = sp.rowOf[struck] === sp.rowOf[placed];
    return {
      kind: "repeatFull",
      n,
      line: inRow ? "row" : "col",
      index: inRow ? py : px,
      times: this.times,
    };
  }

  /** The values each cell may hold, by cell. */
  snapshot(): Int32Array {
    return this.cands.slice();
  }

  /**
   * Marks that start as these do, on a grid of their own, as a search's
   * branch does: each technique visits only what a fact reaches from here,
   * since a binding that found nothing on these marks finds nothing on the
   * copy. The techniques run on placing and striking are the caller's to
   * set, as on any new marks. Marks that relate edges are not forked: no
   * game that relates them forks yet, and a copy of the relation is not
   * built until one does.
   */
  fork(): CellMarks {
    if (this.relation !== null)
      throw new Error("marks that relate edges are not forked");
    // A game's own marks keep what these do not copy (`LatinSolver`'s).
    if (this.constructor !== CellMarks) throw new Error("only plain marks are forked");
    const m = new CellMarks(
      this.sp,
      this.domain,
      this.grid.slice(),
      { value: this.repeat, times: this.times },
      this.onEdges ? "edge" : "cell",
      this.markOn,
    );
    m.cands.set(this.cands);
    m.edgeCands.set(this.edgeCands);
    m.marked.set(this.marked);
    m.placed = this.placed;
    m.epoch = this.epoch;
    const copies = forkKept(this, m.kept);
    for (const [f, { at, by, seen }] of this.visits) {
      const again = at.slice();
      // A set's groups the fork does not carry, or changes the technique has
      // not yet read, are read again whole.
      const carried = seen.map((was) => {
        const copy = was === null ? undefined : copies.get(was.of);
        if (
          was === null ||
          copy === undefined ||
          was.made !== was.of.made ||
          was.read !== was.of.changed.length
        ) {
          again.fill(1);
          return null;
        }
        return { of: copy, made: copy.made, read: copy.changed.length };
      });
      m.visits.set(f, { at: again, by, seen: carried });
    }
    return m;
  }
}

/** A technique's elements still to visit ({@link CellMarks.visit}), and for
 * each set of edges its footprint reads the groups of, the changes it has
 * read: `null` where the groups were not kept. */
interface Visits {
  readonly at: Uint8Array;
  readonly by: Inverse;
  readonly seen: ({ of: GroupChanges; made: number; read: number } | null)[];
}

/**
 * The marks of a wide domain, whose values run past 31 (Ascent's numbers, up
 * to the board's square count): each cell's candidates are `words` words of
 * 32 bits, bit `d` of the cell's row, and `cands` holds nothing. A compiled
 * wide technique reads them only through the candidate methods.
 */
export class WideCellMarks extends CellMarks {
  /** The most a value may be, and the words each cell's row takes. */
  readonly most: number;
  readonly words: number;
  /** Every cell's candidates, row after row. */
  readonly wide: Int32Array;
  /** Whether cell `c`'s domain holds `d`, which seeding asks of every value
   * from 1 to {@link most}. */
  private readonly inDomain: (c: number, d: number) => boolean;

  constructor(
    sp: GridSpace,
    most: number,
    grid: Int16Array,
    inDomain: (c: number, d: number) => boolean,
  ) {
    super(sp, 0, grid);
    this.most = most;
    this.words = (most >> 5) + 1;
    this.wide = new Int32Array(sp.cells.length * this.words);
    this.inDomain = inDomain;
  }

  override cand(): number {
    throw new Error("a wide domain's candidates are no mask");
  }
  override has(c: number, d: number): boolean {
    return (
      d >= 0 &&
      d <= this.most &&
      ((this.wide[c * this.words + (d >> 5)] >>> (d & 31)) & 1) !== 0
    );
  }
  override candCount(c: number): number {
    let n = 0;
    const at = c * this.words;
    for (let i = 0; i < this.words; i++)
      for (let m = this.wide[at + i]; m !== 0; m &= m - 1) n++;
    return n;
  }
  override candFirst(c: number): number {
    const at = c * this.words;
    for (let i = 0; i < this.words; i++) {
      const m = this.wide[at + i];
      if (m !== 0) return i * 32 + 31 - Math.clz32(m & -m);
    }
    return -1;
  }
  override candList(c: number): readonly number[] {
    const out: number[] = [];
    const at = c * this.words;
    for (let i = 0; i < this.words; i++)
      for (let m = this.wide[at + i]; m !== 0; m &= m - 1)
        out.push(i * 32 + 31 - Math.clz32(m & -m));
    return out;
  }
  protected override drop(c: number, d: number): void {
    this.wide[c * this.words + (d >> 5)] &= ~(1 << (d & 31));
  }
  protected override keepOnly(c: number, d: number): void {
    const at = c * this.words;
    const kept = this.has(c, d);
    this.wide.fill(0, at, at + this.words);
    if (kept) this.wide[at + (d >> 5)] = 1 << (d & 31);
  }
  protected override seedCands(): void {
    const { wide, words, most } = this;
    wide.fill(0);
    for (let c = 0; c < this.sp.cells.length; c++)
      for (let d = 1; d <= most; d++)
        if (this.inDomain(c, d)) wide[c * words + (d >> 5)] |= 1 << (d & 31);
  }
  override restore(grid: ArrayLike<number>, cands: ArrayLike<number>): void {
    super.restore(grid, []);
    this.wide.set(cands);
  }
  override snapshot(): Int32Array {
    return this.wide.slice();
  }
}
