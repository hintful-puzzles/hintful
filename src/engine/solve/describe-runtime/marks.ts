/** The marks a compiled technique reads, the facts it makes, and the
 * footprint and witness of a firing (`describe-runtime.ts`). */

import type { EdgeGroups } from "./kept.ts";
import type { GridSpace } from "./space.ts";

/** The marks a technique reads. */
export interface Marks {
  /** Every value of the answer's domain, as a bitmask. */
  readonly domain: number;
  /** The one value that appears more than once in each unit, or 0 where
   * none does, and how many times (1 where none does): `times(d)` is
   * `times` for `repeat` and 1 for every other value. Fields, not a method,
   * so a compiled read is two loads every Latin game can inline. */
  readonly repeat: number;
  readonly times: number;
  /** How many values have been placed, the seeding's included: a term that
   * reads only the values placed may be kept while it stands. */
  readonly placed: number;
  /** The values placed, 0 where none is, and the values each cell may
   * still hold, as a bitmask (bit `d`): fields, so a compiled technique
   * reads them in place. The methods below are what they give. Where the
   * domain is wide, `cands` holds nothing, and the methods read the
   * candidates. */
  readonly grid: Uint8Array | Int8Array | Int16Array;
  readonly cands: Int32Array;
  /** The cells placed since the marks were last set wholesale, in order,
   * and a count of those settings: what a structure kept over the marks
   * catches up from, a placement at a time, as long as the epoch holds. */
  readonly log: readonly number[];
  readonly epoch: number;
  /** How many facts have changed each kind of mark, indexed by `MADE`
   * (`marks-made.ts`): a compiled binding compares them before it fires, so one
   * that read a mark a fact has changed since does not fire on what it read. */
  readonly made: Int32Array;
  /** The structures kept over these marks, by what each keeps
   * ({@link keptEdgeGroups}). */
  readonly kept: Map<unknown, unknown>;
  /** Whether the cell holds a value. */
  known(c: number): boolean;
  /** The cell's value, or `-1` where it has none. */
  value(c: number): number;
  /** The values the cell may still hold, as a bitmask. */
  cand(c: number): number;
  /** Whether the cell may still hold `d`. */
  has(c: number, d: number): boolean;
  /** How many values the cell may still hold, the least of them (`-1`
   * where none), and all of them in order: what a wide domain's compiled
   * technique reads of a cell's candidates. */
  candCount(c: number): number;
  candFirst(c: number): number;
  candList(c: number): readonly number[];
  /** The elements of a technique's first binder its solve run is still to
   * visit, 1 each, by {@link Footprint}; `null` where every one is visited
   * (`skipping` off, or marks that keep no such sets). `groups` are the
   * groups of the footprint's `sets`, in order, as the run reads them. */
  visit?(f: Footprint, groups?: readonly EdgeGroups[]): Uint8Array | null;
  /** Strike `d` from the cell, where a technique has no `fire` to tell. */
  strikeAt(c: number, d: number): void;
  /** Place `d` in the cell, where a technique has no `fire` to tell. */
  placeAt(c: number, d: number): void;
  /** The values an edge's mark may still hold, as a bitmask, where the
   * description marks the edges (Slant's v-shapes); 0 where it does not. */
  edgeCand(e: number): number;
  /** Strike `d` from the edge's mark, where a technique has no `fire` to
   * tell. */
  edgeStrikeAt(e: number, d: number): void;
  /** The element a cell's mark names, where the description marks each
   * cell with one (Galaxies' arrow to a dot), or `-1` where it names none. */
  markOf(c: number): number;
  /** Mark the cell with `q`, where a technique has no `fire` to tell. */
  markAt(c: number, q: number): void;
  /** What is known of how two edges' values relate, where the description
   * keeps a relation over the edges (Loopy's pairs): bit 1 where they may
   * be alike, bit 2 where they may be opposite. */
  pairOf(e: number, f: number): number;
  /** The edges whose values are known alike or opposite to `e`'s, `e`
   * among them. */
  relatedOf(e: number): readonly number[];
  /** Relate two edges, 1 alike and 2 opposite, where a technique has no
   * `fire` to tell. */
  relateAt(e: number, f: number, d: number): void;
}

/** One firing's facts, three numbers each: {@link STRIKE}, {@link PLACE},
 * {@link STRIKE_EDGE}, {@link MARK} or {@link RELATE}, the cell or the edge,
 * the value. */
export type Facts = readonly number[];
export const STRIKE = 0;
export const PLACE = 1;
/** A value struck from the mark on an edge, or on an angle. */
export const STRIKE_EDGE = 2;
/** A cell marked with an element: the value is the element. */
export const MARK = 3;
/** Two edges related: the edge, then `4·f + d` for the other edge `f` and
 * the relation `d`, 1 alike and 2 opposite. */
export const RELATE = 4;

/** A step through a tiling's geometry: the {@link GridSpace} array read. */
export type FootprintStep =
  | "faceEdges"
  | "angleEdges"
  | "cellEdges"
  | "faceAngles"
  | "cellAngles"
  | "faceCells"
  | "edgeFaces"
  | "angleCell"
  | "edgeEnds";

/**
 * What a binding at one element of a technique's first binder reads: each
 * read as the steps from that element to the marked one, and of which marks
 * (the answer's, the edge mark, or the group a set of edges joins the square
 * into); and whether it reads the relation over the edges, which a relating
 * fact changes for whole classes. `sets` names the sets of edges bound ahead
 * of the first binder, whose groups a `group` read's `set` indexes and the
 * technique hands {@link Marks.visit} in that order. The compiler emits it
 * (`src/describe/footprint.ts`).
 */
export interface Footprint {
  readonly sort: "face" | "cell" | "edge" | "angle";
  readonly reads: readonly {
    readonly steps: readonly FootprintStep[];
    readonly kind: "answer" | "edgeMark" | "group";
    readonly set?: number;
  }[];
  readonly relation: boolean;
  readonly sets?: readonly string[];
}

/** For each marked element, the first-binder elements whose bindings read
 * it, as offsets into a list (`start[x]` to `start[x + 1]`). */
export interface ReadBy {
  readonly start: Int32Array;
  readonly list: Int32Array;
}

/** A footprint read backwards on one board: how many elements its first
 * binder has, and which of them read each answer element, each marked one,
 * and each square's group in each of its sets. */
export interface Inverse {
  readonly n: number;
  readonly answer: ReadBy;
  readonly edgeMark: ReadBy;
  readonly group: readonly ReadBy[];
  readonly relation: boolean;
}

const inverses = new WeakMap<GridSpace, Map<Footprint, Inverse>>();

/** The elements `steps` reach from `x`, a negative entry (a face's missing
 * dot) dropped. */
function reach(sp: GridSpace, x: number, steps: readonly FootprintStep[]): number[] {
  let at = [x];
  for (const s of steps) {
    const next: number[] = [];
    for (const y of at) {
      if (s === "angleCell") next.push(sp.angleCell[y]);
      else if (s === "edgeEnds") next.push(sp.edgeEnds[2 * y], sp.edgeEnds[2 * y + 1]);
      else next.push(...sp[s][y]);
    }
    at = next.filter((y) => y >= 0);
  }
  return at;
}

function readBy(pairs: readonly number[][], size: number): ReadBy {
  const start = new Int32Array(size + 1);
  for (let t = 0; t < size; t++) start[t + 1] = start[t] + (pairs[t]?.length ?? 0);
  const list = new Int32Array(start[size]);
  for (let t = 0; t < size; t++) list.set(pairs[t] ?? [], start[t]);
  return { start, list };
}

/** `f` read backwards on `sp`, built once a board. `answers` and `marked`
 * are how many answer elements and marked elements the marks hold. */
export function inverseOf(
  sp: GridSpace,
  f: Footprint,
  answers: number,
  marked: number,
): Inverse {
  let byBoard = inverses.get(sp);
  if (byBoard === undefined) {
    byBoard = new Map();
    inverses.set(sp, byBoard);
  }
  const kept = byBoard.get(f);
  if (kept !== undefined) return kept;
  const n =
    f.sort === "face"
      ? sp.faces.length
      : f.sort === "angle"
        ? sp.angles.length
        : f.sort === "edge"
          ? sp.edges.length
          : sp.cells.length;
  const answer: number[][] = Array.from({ length: answers }, () => []);
  const mark: number[][] = Array.from({ length: marked }, () => []);
  const group = (f.sets ?? []).map((): number[][] =>
    Array.from({ length: sp.cells.length }, () => []),
  );
  for (let x = 0; x < n; x++)
    for (const r of f.reads) {
      const into =
        r.kind === "answer" ? answer : r.kind === "edgeMark" ? mark : group[r.set ?? 0];
      if (into === undefined)
        throw new Error(`a footprint reads set ${r.set}, past its sets`);
      for (const t of reach(sp, x, r.steps)) {
        const at = into[t];
        if (at === undefined)
          throw new Error(`a footprint reaches ${r.kind} ${t}, past the marks`);
        if (at.at(-1) !== x) at.push(x);
      }
    }
  const made: Inverse = {
    n,
    answer: readBy(answer, answers),
    edgeMark: readBy(mark, marked),
    group: group.map((g) => readBy(g, sp.cells.length)),
    relation: f.relation,
  };
  byBoard.set(f, made);
  return made;
}

/**
 * What is known of how the edges' values relate, two at a time: classes of
 * edges each known alike or opposite to the class's root, joined as facts
 * relate them. Each class keeps its members, so a read of the edges related
 * to one walks only them.
 */
export class EdgeRelation {
  private readonly root: Int32Array;
  /** Whether each edge is opposite its parent. */
  private readonly flip: Uint8Array;
  private readonly members: number[][];

  constructor(n: number) {
    this.root = Int32Array.from({ length: n }, (_, e) => e);
    this.flip = new Uint8Array(n);
    this.members = Array.from({ length: n }, (_, e) => [e]);
  }

  /** The root of `e`'s class, with whether `e` is opposite it in the low
   * bit: `2·root + opposite`. */
  private find(e: number): number {
    let o = 0;
    let r = e;
    while (this.root[r] !== r) {
      o ^= this.flip[r];
      r = this.root[r];
    }
    return 2 * r + o;
  }

  /** Bit 1 where the two may be alike, bit 2 where they may be opposite. */
  of(e: number, f: number): number {
    const a = this.find(e);
    const b = this.find(f);
    if (a >> 1 !== b >> 1) return 6;
    return (a & 1) === (b & 1) ? 2 : 4;
  }

  /** The edges related to `e`, `e` among them. */
  related(e: number): readonly number[] {
    return this.members[this.find(e) >> 1];
  }

  /** Relate `e` and `f`, `d` 1 alike and 2 opposite; false where they were
   * related already. */
  relate(e: number, f: number, d: number): boolean {
    const a = this.find(e);
    const b = this.find(f);
    const ra = a >> 1;
    const rb = b >> 1;
    if (ra === rb) return false;
    const [big, small] =
      this.members[ra].length >= this.members[rb].length ? [ra, rb] : [rb, ra];
    this.root[small] = big;
    this.flip[small] = (a & 1) ^ (b & 1) ^ (d === 2 ? 1 : 0);
    for (const x of this.members[small]) this.members[big].push(x);
    this.members[small] = [];
    return true;
  }
}

/**
 * What held in a firing's `for ... where` and `premise`, read on the marks
 * before its facts are made: the part of a formula a firing's words need and
 * its binding does not say. A node is there only for a part that was visited
 * and was true (a false branch is never in it).
 *
 * - `arm`: which side of an `or` held, the left (0) tried first.
 * - `member`: the binders' values of the first member an `exists` held for.
 * - `supposing`: the cell, or the cells, and the value a `with` placed, and
 *   what held under it.
 * - `def`: a definition read, and what held in its body; a break clause's
 *   (`breaks`) carries the terms its words read, read where it held.
 * - `all`: the parts of an `and` that have any.
 */
export type Witness =
  | { held: "arm"; arm: 0 | 1; of: Witness | null }
  | {
      held: "member";
      member: Readonly<Record<string, number | readonly number[]>>;
      of: Witness | null;
    }
  | {
      held: "supposing";
      cell: number | readonly number[];
      value: number;
      of: Witness | null;
    }
  | {
      held: "def";
      name: string;
      of: Witness | null;
      says?: Readonly<Record<string, unknown>>;
    }
  | { held: "all"; of: readonly Witness[] };

/**
 * The elements whose marks a firing's `for ... where` and `premise` read, in
 * the order first read, each once: cells (or the game's own elements) and
 * edges. What a firing rests on is the facts that made these what they are.
 * `relations`, where a game reads any, are the pairs of edges whose relation
 * a firing used, each as {@link relationKey} names it (Loopy's pairs).
 * `edgeValues`, where a game says it, are edge marks a firing rests on by one
 * struck value only (`[at, value]`), where `edges` would take every strike
 * there: Loopy's corner bit, whose other bit the firing does not use.
 */
export interface Reads {
  cells: number[];
  edges: number[];
  relations?: number[];
  edgeValues?: (readonly [at: number, value: number])[];
}

/** The element a relation between two edges is about, whichever way round
 * they are given: the key a {@link RELATE} fact and a firing's
 * {@link Reads.relations} name it by. */
export const relationKey = (e: number, f: number): number =>
  e < f ? e * 2 ** 24 + f : f * 2 ** 24 + e;

/** The parts of an `and` that have a witness: `null` for none, the part
 * itself for one. */
export function witnessAll(...parts: (Witness | null)[]): Witness | null {
  const some = parts.filter((p): p is Witness => p !== null);
  if (some.length === 0) return null;
  return some.length === 1 ? some[0] : { held: "all", of: some };
}

/** Every node of `w`, outermost first: `w` itself, then what held under it. */
export function witnessNodes(w: Witness | null): Witness[] {
  if (w === null) return [];
  return [w, ...(w.held === "all" ? w.of.flatMap(witnessNodes) : witnessNodes(w.of))];
}

/** The break that held in `w`: the innermost node of a definition named in
 * `breaks`, the first such where several held side by side, with the terms
 * its words read; `null` where none did. */
export function brokeAt(
  w: Witness | null,
  breaks: readonly string[],
): { name: string; says: Readonly<Record<string, unknown>> } | null {
  if (w === null) return null;
  const under =
    w.held === "all"
      ? (w.of.map((x) => brokeAt(x, breaks)).find((x) => x !== null) ?? null)
      : brokeAt(w.of, breaks);
  if (under !== null) return under;
  return w.held === "def" && breaks.includes(w.name)
    ? { name: w.name, says: w.says ?? {} }
    : null;
}

/** The first node of `w`, outermost first, that is the definition `name`'s. */
export function witnessOfDef(w: Witness | null, name: string): Witness | null {
  if (w === null) return null;
  if (w.held === "def" && w.name === name) return w;
  if (w.held === "all") {
    for (const part of w.of) {
      const found = witnessOfDef(part, name);
      if (found !== null) return found;
    }
    return null;
  }
  return witnessOfDef(w.of, name);
}

/**
 * Called once a binding's conclusion has facts that change the marks, with
 * the binding's names and the facts, before any is applied: what a hint
 * records. It returns whether the technique goes on to its later bindings.
 *
 * Where a technique is given no `fire` (`null`), nothing records, and it
 * makes each fact as it concludes it (`strikeAt`, `placeAt`) and goes on to
 * every later binding. That is sound because a fact concluded on marks a
 * firing has narrowed still holds, and a solve reaches the same fixpoint
 * whichever order its facts come in.
 */
export type Fire<B, S = undefined> = (
  binding: B,
  facts: Facts,
  ...says: [S] extends [undefined] ? [] : [S]
) => boolean;
