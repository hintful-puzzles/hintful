/**
 * What a compiled technique reads: the grid's elements numbered, the marks,
 * and the dealt clues. `compile.ts` writes code against these and nothing
 * else, so these are the whole of a technique's view of a board.
 *
 * An element is its index: a cell `y·w + x`, a line its row `y`, `h + x`
 * for a column, and after the columns a space's boxes and then its
 * diagonals, an edge its place in {@link GridSpace.edgeEnds}, a corner
 * `y·(w − 1) + x` for the one below and right of cell `(x, y)`, a point
 * `y·(w + 1) + x` for the one above and left of it, a rectangle `a·n + b`
 * for its top left cell `a` and bottom right `b` on a grid of `n` cells, a
 * region its part's index in its {@link Partition}. `-1` is
 * `none`, for an element and for a value alike, since no value is negative.
 * A set of values is a bitmask (bit `d`); a set of elements an ordered array.
 */

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
  ...says: S extends undefined ? [] : [S]
) => boolean;

/** A clue kind as dealt: the element each clue sits at and its value, by
 * clue index; and at each element, the clue there and its value (`-1` where
 * there is none). `clueAt` reads the value by element, one load a read where
 * the clue's index would make it two. */
export interface ClueList {
  readonly at: Int32Array;
  readonly v: Int32Array;
  readonly byAt: Int32Array;
  readonly valueAt: Int32Array;
}

/** The clue list of `n` clues, over `elements` elements to sit at. */
export function clueList(
  at: readonly number[],
  v: readonly number[],
  elements: number,
): ClueList {
  const byAt = new Int32Array(elements).fill(-1);
  const valueAt = new Int32Array(elements).fill(-1);
  at.forEach((e, k) => {
    byAt[e] = k;
    valueAt[e] = v[k];
  });
  return { at: Int32Array.from(at), v: Int32Array.from(v), byAt, valueAt };
}

/** Each clue list's elements by the value of the clue there, built at the
 * first read: a list is never changed once made. */
const byValue = new WeakMap<ClueList, Map<number, number[]>>();
const NO_ELEMENTS: readonly number[] = [];

/** `{x in cells where clue(kind, x) = v}`: the elements whose clue holds
 * `v`, `-1` for none, in order, read off an index rather than a scan of
 * every element. */
export function cluesValued(list: ClueList, v: number): readonly number[] {
  let index = byValue.get(list);
  if (index === undefined) {
    index = new Map();
    for (let x = 0; x < list.byAt.length; x++) {
      // An element with no clue reads as -1, as `clueAt` reads it.
      const held = clueAt(list, x);
      const at = index.get(held);
      if (at === undefined) index.set(held, [x]);
      else at.push(x);
    }
    byValue.set(list, index);
  }
  return index.get(v) ?? NO_ELEMENTS;
}

/** Where a clue of a kind dealt once for each value (`per: value`) sits: at
 * its element `x` for the value `d`, both read back by {@link perElement}
 * and {@link perValue}. A value fits the candidate bitmask's 31 bits. */
export function perPlace(x: number, d: number): number {
  return x * 32 + d;
}
export function perElement(place: number): number {
  return place >> 5;
}
export function perValue(place: number): number {
  return place & 31;
}

/** `clue(kind, x)`: the value of the clue at `x`, or `-1`. */
export function clueAt(list: ClueList, x: number): number {
  return x < 0 ? -1 : list.valueAt[x];
}

/** A clue kind whose clue is a list of numbers (`list: true`), as dealt:
 * the element each clue sits at and its list, by clue index, and the clue
 * at each element (`-1` where there is none). */
export interface ListClues {
  readonly at: Int32Array;
  readonly lists: readonly Int32Array[];
  readonly byAt: Int32Array;
}

/** The list clues `lists`, each at its element of `at`, over `elements`
 * elements to sit at. */
export function listClues(
  at: readonly number[],
  lists: readonly (readonly number[])[],
  elements: number,
): ListClues {
  const byAt = new Int32Array(elements).fill(-1);
  at.forEach((e, k) => {
    byAt[e] = k;
  });
  return {
    at: Int32Array.from(at),
    lists: lists.map((l) => Int32Array.from(l)),
    byAt,
  };
}

/** `clue(kind, x)` of a list kind: the list at `x`, or `null`. */
export function listAt(clues: ListClues, x: number): Int32Array | null {
  const k = x < 0 ? -1 : clues.byAt[x];
  return k < 0 ? null : clues.lists[k];
}

/** `A = B` of two lists: the same numbers in the same order. A list a
 * clue kind has none of equals nothing. */
export function sameList(
  a: ArrayLike<number> | null,
  b: ArrayLike<number> | null,
): boolean {
  if (a === null || b === null || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** `|l|` of a list: how many numbers it holds, none for a list a clue kind
 * has none of. */
export function listLength(l: ArrayLike<number> | null): number {
  return l === null ? 0 : l.length;
}

/** `nth(l, i)`: the list's member at `i`, counted from 0, or none (`-1`)
 * past either end. */
export function nth(l: ArrayLike<number> | null, i: number): number {
  return l === null || i < 0 || i >= l.length ? -1 : l[i];
}

/** `runs(L, S)`: the lengths of the maximal runs of `S` along the line
 * `L`, in `L`'s order. */
export function runsOf(L: readonly number[], S: readonly number[]): Int32Array {
  const out: number[] = [];
  let run = 0;
  for (const c of L) {
    if (S.includes(c)) run++;
    else if (run > 0) {
      out.push(run);
      run = 0;
    }
  }
  if (run > 0) out.push(run);
  return Int32Array.from(out);
}

/** Scratch for {@link runFits}, grown to the longest line asked. */
let fitFrom = new Uint8Array(0);
let fitTo = new Uint8Array(0);
let fitBlocked = new Int32Array(0);
let fitClear = new Uint8Array(0);
let fitCover = new Int32Array(0);
let fitEnd = new Int32Array(0);

/** {@link runFits}' last question and answer about each list of lengths: a
 * technique asks one line again for each of its squares, the pin alone
 * differing, which the projection answers for all of them, and a solve asks
 * every line again each pass, most of them unchanged since. */
interface FitsAsked {
  masks: Int32Array;
  v: number;
  fits: boolean;
  out: Int32Array;
}
const asked = new WeakMap<object, FitsAsked>();

/**
 * Whether some filling of a line's `n` squares, each a value of its mask in
 * `masks` (bit `d` for value `d`), has its squares of value `v` in runs of
 * the lengths `R`, in order: `exists fill f of cells(L): run_lengths(L, {x in
 * cells(L) where f(x) = v}) = R`, compiled. Where `out` is given, each
 * square's place in it gets the values that square takes in some such
 * filling, the projection a pinned `f(x) = t` reads.
 *
 * A dynamic program over the places a run may start, `(i, j)`: the first
 * `i` squares filled with `j` runs, the square before `i` not `v`. Every
 * filling is one path through it, so the work is the line's length times
 * its runs, where listing the fillings is exponential in the line's length
 * (a line of 30 with seven runs of 1 has 346,104).
 */
export function runFits(
  masks: Int32Array,
  n: number,
  v: number,
  R: ArrayLike<number> | null,
  out: Int32Array | null,
): boolean {
  if (R === null) return false;
  let last = asked.get(R);
  if (last !== undefined && last.masks.length === n && last.v === v) {
    let same = true;
    for (let i = 0; i < n && same; i++) same = masks[i] === last.masks[i];
    if (same) {
      if (out !== null) out.set(last.out);
      return last.fits;
    }
  }
  if (last === undefined || last.masks.length !== n) {
    last = { masks: new Int32Array(n), v, fits: false, out: new Int32Array(n) };
    asked.set(R, last);
  }
  last.masks.set(masks.subarray(0, n));
  last.v = v;
  last.fits = fitsOf(masks, n, v, R, last.out);
  if (out !== null) out.set(last.out);
  return last.fits;
}

/** {@link runFits}, asked afresh: `out`, where given, is emptied where no
 * filling fits. */
function fitsOf(
  masks: Int32Array,
  n: number,
  v: number,
  R: ArrayLike<number>,
  out: Int32Array | null,
): boolean {
  const k = R.length;
  const bit = 1 << v;
  const stride = n + 1;
  const size = (k + 1) * stride;
  if (fitFrom.length < size) {
    fitFrom = new Uint8Array(size * 2);
    fitTo = new Uint8Array(size * 2);
  }
  if (fitBlocked.length < n + 1) {
    fitBlocked = new Int32Array((n + 1) * 2);
    fitClear = new Uint8Array((n + 1) * 2);
    fitCover = new Int32Array((n + 1) * 2);
  }
  if (fitEnd.length < size) fitEnd = new Int32Array(size * 2);
  const blocked = fitBlocked;
  const clear = fitClear;
  // How many squares before each place cannot hold `v`, and whether each
  // square can hold another value.
  blocked[0] = 0;
  for (let i = 0; i < n; i++) {
    blocked[i + 1] = blocked[i] + ((masks[i] & bit) === 0 ? 1 : 0);
    clear[i] = (masks[i] & ~bit) !== 0 ? 1 : 0;
  }
  // Where the j-th run from place i leads: its squares all may hold `v`, and
  // the square after it, if any, may hold another value; -1 where it cannot.
  const end = fitEnd;
  for (let j = 0; j < k; j++) {
    const r = R[j];
    for (let i = 0; i < n; i++) {
      const e = i + r;
      end[j * stride + i] =
        r <= 0 || e > n || blocked[e] - blocked[i] > 0
          ? -1
          : e === n
            ? n
            : clear[e]
              ? e + 1
              : -1;
    }
  }
  const from = fitFrom;
  const to = fitTo;
  from.fill(0, 0, size);
  to.fill(0, 0, size);
  from[0] = 1;
  for (let j = 0; j <= k; j++)
    for (let i = 0; i < n; i++) {
      if (!from[j * stride + i]) continue;
      if (clear[i]) from[j * stride + i + 1] = 1;
      if (j < k) {
        const e = end[j * stride + i];
        if (e >= 0) from[(j + 1) * stride + e] = 1;
      }
    }
  if (!from[k * stride + n]) {
    out?.fill(0, 0, n);
    return false;
  }
  if (out === null) return true;
  to[k * stride + n] = 1;
  for (let j = k; j >= 0; j--)
    for (let i = n - 1; i >= 0; i--) {
      let reach = clear[i] === 1 && to[j * stride + i + 1] === 1;
      if (!reach && j < k) {
        const e = end[j * stride + i];
        reach = e >= 0 && to[(j + 1) * stride + e] === 1;
      }
      if (reach) to[j * stride + i] = 1;
    }
  // A square some run covers on a path through, counted by where each such
  // run starts and ends; a square a path passes clear.
  const cover = fitCover;
  cover.fill(0, 0, n + 1);
  out.fill(0, 0, n);
  for (let j = 0; j <= k; j++)
    for (let i = 0; i < n; i++) {
      if (!from[j * stride + i]) continue;
      if (clear[i] && to[j * stride + i + 1]) out[i] |= masks[i] & ~bit;
      if (j === k) continue;
      const e = end[j * stride + i];
      if (e < 0 || !to[(j + 1) * stride + e]) continue;
      const r = R[j];
      cover[i]++;
      cover[i + r]--;
      if (e > i + r) out[i + r] |= masks[i + r] & ~bit;
    }
  let covered = 0;
  for (let i = 0; i < n; i++) {
    covered += cover[i];
    if (covered > 0) out[i] |= bit;
  }
  return true;
}

/** A partition of the cells the board deals: its parts by index, each
 * part's cells in reading order, and the part holding each cell (`-1` where
 * none does). */
export interface Partition {
  readonly parts: readonly number[];
  readonly cells: readonly (readonly number[])[];
  readonly of: Int32Array;
}

/** The partition of a board of `n` cells whose parts, in order, hold
 * `cells`. */
export function partition(cells: readonly (readonly number[])[], n: number): Partition {
  const of = new Int32Array(n).fill(-1);
  cells.forEach((cs, r) => {
    for (const c of cs) of[c] = r;
  });
  return {
    parts: cells.map((_, r) => r),
    cells: cells.map((cs) => cs.toSorted((a, b) => a - b)),
    of,
  };
}

/** A rectangular grid's elements and relations, numbered. */
export interface GridSpace {
  readonly w: number;
  readonly h: number;
  readonly cells: readonly number[];
  readonly rows: readonly number[];
  readonly cols: readonly number[];
  /** The rows, then the columns. */
  readonly lines: readonly number[];
  /** The parts of the partition its description lists among its units, as
   * lines: a Sudoku's boxes, Seismic's areas. None on a Latin square. */
  readonly boxes: readonly number[];
  /** The two diagonals, as lines, where the description has them: the main
   * one, then the other, each top to bottom. */
  readonly diagonals: readonly number[];
  /** The lines no value repeats in, in the order the description lists
   * them. */
  readonly units: readonly number[];
  /** The units holding each cell, in {@link units}' order. */
  readonly unitsOf: readonly (readonly number[])[];
  /** Each line's cells: a row's left to right, a column's top to bottom, a
   * box's in reading order. */
  readonly lineCells: readonly (readonly number[])[];
  readonly rowOf: Int32Array;
  readonly colOf: Int32Array;
  /** The box holding each cell, `-1` where there are none. */
  readonly boxOf: Int32Array;
  /**
   * The cells sharing a unit with each cell, each once: on a Latin square the
   * row's and the column's interleaved by index (the row's first at each),
   * as the Latin engine has always visited them; on any other units, in
   * reading order, as Solo always has.
   */
  readonly peers: readonly (readonly number[])[];
  /** Up, right, down, left, those on the grid. */
  readonly adj4: readonly (readonly number[])[];
  /** The edge to each of `adj4`'s cells, in its order: what `edge(x, y)`
   * reads where `y` is bound by a loop over `adj4(x)`. */
  readonly adj4Edges: readonly (readonly number[])[];
  /** The eight around, clockwise from up, those on the grid. */
  readonly adj8: readonly (readonly number[])[];
  /** The edge to each of `adj8`'s cells, in its order, `-1` to a diagonal
   * neighbor where the edges are only the orthogonal ones. */
  readonly adj8Edges: readonly (readonly number[])[];
  /** Whether a diagonal neighbor is across an edge too: Spokes' king's-move
   * links between hubs. */
  readonly king: boolean;
  /** The cells across an edge from each cell: `adj4`, or `adj8` on a king's
   * space. */
  readonly edgeAdj: readonly (readonly number[])[];
  /** The edge to each of `edgeAdj`'s cells, in its order. */
  readonly cellEdges: readonly (readonly number[])[];
  /** Two cells an edge, the first before the second in reading order, in
   * reading order of the pair: a cell's right edge before its lower ones. */
  readonly edgeEnds: Int32Array;
  /** Every edge, in that order. */
  readonly edges: readonly number[];
  /** The other diagonal of the square of four cells a diagonal edge crosses,
   * `-1` for an orthogonal edge. */
  readonly crossing: Int32Array;
  /** The edge between two neighbors, or `-1`. */
  edgeOf(a: number, b: number): number;
  /** One slot beyond each end of every line, numbered as Towers deals its
   * clues: above each column, below each, left of each row, right of each. */
  readonly slots: readonly number[];
  /** Each slot's line, nearest the slot first. */
  readonly sight: readonly (readonly number[])[];
  /** The slot at the other end of each slot's line. */
  readonly opposite: Int32Array;
  /** Every point where four cells meet, in reading order. */
  readonly corners: readonly number[];
  /** Each corner's four cells, in reading order. */
  readonly cornerCells: readonly (readonly number[])[];
  /** Each cell's corners, those inside the grid: below right, above right,
   * below left, above left, the order Mathrax has always read its clues in. */
  readonly cellCorners: readonly (readonly number[])[];
  /** Every point where cells meet, the grid's border included, in reading
   * order: `y·(w + 1) + x` for the one above and left of cell `(x, y)`. */
  readonly points: readonly number[];
  /** Each point's cells, one to four, in reading order. */
  readonly pointCells: readonly (readonly number[])[];
  /** Each cell's four points, in reading order. */
  readonly cellPoints: readonly (readonly number[])[];
  /** Every center a square can be turned about, in reading order: a
   * square's middle, the middle of a side between two squares, and a point
   * inside the grid where four meet. On the half grid, where square `(x, y)`
   * is `(2x + 1, 2y + 1)`, the one at `(X, Y)`, each from 1 to `2w - 1` and
   * `2h - 1`, is `(Y − 1)·(2w − 1) + X − 1`. */
  readonly centers: readonly number[];
  /** The squares round each center, one, two or four, in reading order. */
  readonly centerCells: readonly (readonly number[])[];
  /** Whether the board is a tiling ({@link tilingSpace}): its cells the
   * dots, joined by its edges, and its faces and angles the two sorts
   * below. None of either on a rectangle. */
  readonly tiling: boolean;
  /** Every face, in the tiling's order. */
  readonly faces: readonly number[];
  /** Each face's dots, and its edges, round it: edge `i` joins dots `i`
   * and `i + 1`. */
  readonly faceCells: readonly (readonly number[])[];
  readonly faceEdges: readonly (readonly number[])[];
  /** Each face's angles, one at each of its dots, in `faceCells`' order. */
  readonly faceAngles: readonly (readonly number[])[];
  /** The faces either side of each edge, one at the tiling's rim. */
  readonly edgeFaces: readonly (readonly number[])[];
  /** Every angle: two edges side by side round a dot, numbered
   * `2·e + (1 where the dot is e's first end)` for its first edge `e`, the
   * other following it in the dot's turn. */
  readonly angles: readonly number[];
  /** Each angle's two edges, in the dot's turn, and its dot. */
  readonly angleEdges: readonly (readonly number[])[];
  readonly angleCell: Int32Array;
  /** Each dot's angles, in its turn: angle `j` between its edges `j` and
   * `j + 1`. */
  readonly cellAngles: readonly (readonly number[])[];
}

/** A tiling's dots, edges and faces, as `engine/grid` makes them: each
 * dot's edges in one turn, each face's dots and edges round it. */
export interface Tiling {
  readonly dots: readonly { readonly edges: readonly { readonly index: number }[] }[];
  readonly edges: readonly {
    readonly dot1: { readonly index: number };
    readonly dot2: { readonly index: number };
    readonly face1: { readonly index: number } | null;
    readonly face2: { readonly index: number } | null;
  }[];
  readonly faces: readonly {
    readonly dots: readonly ({ readonly index: number } | null)[];
    readonly edges: readonly ({ readonly index: number } | null)[];
  }[];
}

const tilings = new WeakMap<Tiling, GridSpace>();

/**
 * The space of a tiling (Loopy's): its dots are the cells, each edge joins
 * two, and its faces and angles are elements of their own. It has no rows,
 * columns, points or corners, which the compiler refuses on it, and is a
 * row of its dots where a structure reads `w` and `h`. Kept for the life of
 * the tiling.
 */
export function tilingSpace(t: Tiling): GridSpace {
  const kept = tilings.get(t);
  if (kept !== undefined) return kept;
  const n = t.dots.length;
  const cells = Array.from({ length: n }, (_, c) => c);
  const ends: number[] = [];
  const key = new Map<number, number>();
  t.edges.forEach((e, i) => {
    ends.push(e.dot1.index, e.dot2.index);
    const lo = Math.min(e.dot1.index, e.dot2.index);
    const hi = Math.max(e.dot1.index, e.dot2.index);
    key.set(lo * n + hi, i);
  });
  const edgeOf = (a: number, b: number): number =>
    key.get(Math.min(a, b) * n + Math.max(a, b)) ?? -1;
  const cellEdges = t.dots.map((d) => d.edges.map((e) => e.index));
  const edgeAdj = cellEdges.map((es, c) =>
    es.map((e) => (ends[2 * e] === c ? ends[2 * e + 1] : ends[2 * e])),
  );
  const angleOf = (c: number, e: number): number => 2 * e + (ends[2 * e] === c ? 1 : 0);
  const cellAngles = cellEdges.map((es, c) => es.map((e) => angleOf(c, e)));
  const angleEdges: number[][] = Array.from({ length: ends.length }, () => []);
  const angleCell = new Int32Array(ends.length).fill(-1);
  cellEdges.forEach((es, c) => {
    es.forEach((e, j) => {
      const a = angleOf(c, e);
      angleEdges[a] = [e, es[(j + 1) % es.length]];
      angleCell[a] = c;
    });
  });
  const faceCells = t.faces.map((f) => f.dots.map((d) => d?.index ?? -1));
  const faceEdges = t.faces.map((f) => f.edges.map((e) => e?.index ?? -1));
  // A face's angle at its dot `i` lies between its edges `i − 1` and `i`.
  const faceAngles = faceCells.map((ds, f) =>
    ds.map((c, i) => angleOf(c, faceEdges[f][i])),
  );
  const edgeFaces = t.edges.map((e) =>
    [e.face1, e.face2].flatMap((f) => (f === null ? [] : [f.index])),
  );
  const none: readonly (readonly number[])[] = [];
  const sp: GridSpace = {
    w: n,
    h: 1,
    cells,
    rows: [],
    cols: [],
    lines: [],
    boxes: [],
    diagonals: [],
    units: [],
    unitsOf: cells.map(() => []),
    lineCells: [],
    rowOf: new Int32Array(n),
    colOf: new Int32Array(n),
    boxOf: new Int32Array(n).fill(-1),
    peers: none,
    adj4: none,
    adj4Edges: none,
    adj8: none,
    adj8Edges: none,
    king: false,
    edgeAdj,
    cellEdges,
    edgeEnds: Int32Array.from(ends),
    edges: t.edges.map((_, e) => e),
    crossing: new Int32Array(t.edges.length).fill(-1),
    edgeOf,
    slots: [],
    sight: [],
    opposite: new Int32Array(0),
    corners: [],
    cornerCells: [],
    cellCorners: none,
    points: [],
    pointCells: [],
    cellPoints: none,
    centers: [],
    centerCells: [],
    tiling: true,
    faces: t.faces.map((_, f) => f),
    faceCells,
    faceEdges,
    faceAngles,
    edgeFaces,
    angles: Array.from({ length: ends.length }, (_, a) => a),
    angleEdges,
    angleCell,
    cellAngles,
  };
  tilings.set(t, sp);
  return sp;
}

/** The eight steps to a neighbor, clockwise from up, as `adj8` lists them. */
const COMPASS = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
] as const;

const plain = new Map<string, GridSpace>();
const parted = new WeakMap<readonly (readonly number[])[], Map<string, GridSpace>>();

/**
 * The `w × h` grid whose units are `units`, a compiled module's: `rows`,
 * `cols` (or `lines`, both), `diagonals`, and the name of the one partition
 * among them, whose parts are `parts`. Rows and columns are lines whether or
 * not they are units. Kept for the life of `parts` where there are any,
 * which a board shares across every solve of it.
 */
export function describedSpace(
  units: readonly string[],
  w: number,
  h: number,
  parts: readonly (readonly number[])[] = [],
  edges: EdgeGeometry = "square",
): GridSpace {
  const key = `${units.join(",")} ${w} ${h} ${edges}`;
  let cache = plain;
  if (parts.length > 0) {
    let byKey = parted.get(parts);
    if (byKey === undefined) {
      byKey = new Map();
      parted.set(parts, byKey);
    }
    cache = byKey;
  }
  let sp = cache.get(key);
  if (sp === undefined) {
    sp = gridSpace(units, w, h, parts, edges === "king");
    cache.set(key, sp);
  }
  return sp;
}

/** Which neighbors an edge joins: those side by side, or on a king's space
 * those corner to corner too (a compiled module's `edgeGeometry`). */
export type EdgeGeometry = "square" | "king";

/** The `o × o` Latin grid: its units are its rows and columns. */
export function latinSpace(o: number): GridSpace {
  return describedSpace(["rows", "cols"], o, o);
}

function gridSpace(
  unitNames: readonly string[],
  w: number,
  h: number,
  boxCells: readonly (readonly number[])[],
  king: boolean,
): GridSpace {
  const n = w * h;
  const hasDiagonals = unitNames.includes("diagonals");
  const cells = Array.from({ length: n }, (_, c) => c);
  const rows = Array.from({ length: h }, (_, y) => y);
  const cols = Array.from({ length: w }, (_, x) => h + x);
  const lines = [...rows, ...cols];
  const boxes = boxCells.map((_, i) => h + w + i);
  const diagonals = hasDiagonals
    ? [h + w + boxes.length, h + w + boxes.length + 1]
    : [];
  const lineCells = [
    ...rows.map((y) => Array.from({ length: w }, (_, x) => y * w + x)),
    ...cols.map((L) => Array.from({ length: h }, (_, y) => y * w + (L - h))),
    ...boxCells.map((cs) => cs.toSorted((a, b) => a - b)),
    ...(hasDiagonals
      ? [
          Array.from({ length: w }, (_, i) => i * w + i),
          Array.from({ length: w }, (_, i) => i * w + (w - 1 - i)),
        ]
      : []),
  ];
  const units = unitNames.flatMap((u) =>
    u === "rows"
      ? rows
      : u === "cols"
        ? cols
        : u === "lines"
          ? lines
          : u === "diagonals"
            ? diagonals
            : boxes,
  );
  const unitsOf = cells.map((c) => units.filter((L) => lineCells[L].includes(c)));
  // The Latin engine has always visited a cell's peers row and column
  // interleaved.
  const latin = units.length === lines.length && lines.every((L) => units.includes(L));
  const rowOf = new Int32Array(n);
  const colOf = new Int32Array(n);
  const boxOf = new Int32Array(n).fill(-1);
  for (const L of boxes) for (const c of lineCells[L]) boxOf[c] = L;
  const peers: number[][] = [];
  const adj4: number[][] = [];
  const adj8: number[][] = [];
  const right = new Int32Array(n).fill(-1);
  const down = new Int32Array(n).fill(-1);
  const downLeft = new Int32Array(n).fill(-1);
  const downRight = new Int32Array(n).fill(-1);
  const ends: number[] = [];
  for (let c = 0; c < n; c++) {
    const x = c % w;
    const y = (c / w) | 0;
    rowOf[c] = y;
    colOf[c] = h + x;
    const ps: number[] = [];
    for (let i = 0; i < Math.max(w, h); i++) {
      if (i < w && i !== x) ps.push(y * w + i);
      if (i < h && i !== y) ps.push(i * w + x);
    }
    peers.push(ps);
    const around: number[] = [];
    if (y > 0) around.push(c - w);
    if (x + 1 < w) around.push(c + 1);
    if (y + 1 < h) around.push(c + w);
    if (x > 0) around.push(c - 1);
    adj4.push(around);
    const ring: number[] = [];
    for (const [dx, dy] of COMPASS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) ring.push(ny * w + nx);
    }
    adj8.push(ring);
    if (x + 1 < w) {
      right[c] = ends.length / 2;
      ends.push(c, c + 1);
    }
    if (king && y + 1 < h && x > 0) {
      downLeft[c] = ends.length / 2;
      ends.push(c, c + w - 1);
    }
    if (y + 1 < h) {
      down[c] = ends.length / 2;
      ends.push(c, c + w);
    }
    if (king && y + 1 < h && x + 1 < w) {
      downRight[c] = ends.length / 2;
      ends.push(c, c + w + 1);
    }
  }
  // `right` holds -1 at a row's end, and a grid one square wide has its
  // squares below one another 1 apart, so `w` is tried first.
  const square = (a: number, b: number): number => {
    const lo = a < b ? a : b;
    const gap = a < b ? b - a : a - b;
    if (gap === w) return down[lo];
    if (gap === 1) return right[lo];
    return -1;
  };
  // On a grid two wide a cell's lower left neighbor is 1 after it, as its
  // right one is, so a diagonal is told by the rows.
  const edgeOf = king
    ? (a: number, b: number): number => {
        const lo = a < b ? a : b;
        const hi = a < b ? b : a;
        if (((hi / w) | 0) !== ((lo / w) | 0) + 1)
          return hi === lo + 1 ? right[lo] : -1;
        const dx = (hi % w) - (lo % w);
        if (dx === 0) return down[lo];
        if (dx === 1) return downRight[lo];
        return dx === -1 ? downLeft[lo] : -1;
      }
    : square;
  const adj4Edges = adj4.map((around, c) => around.map((q) => edgeOf(c, q)));
  const adj8Edges = adj8.map((around, c) => around.map((q) => edgeOf(c, q)));
  const crossing = new Int32Array(ends.length / 2).fill(-1);
  for (let c = 0; c < n; c++) {
    if (downRight[c] < 0) continue;
    crossing[downRight[c]] = downLeft[c + 1];
    crossing[downLeft[c + 1]] = downRight[c];
  }
  const colCells = lineCells.slice(h);
  const rowCells = lineCells.slice(0, h);
  const sight = [
    ...colCells,
    ...colCells.map((cs) => cs.toReversed()),
    ...rowCells,
    ...rowCells.map((cs) => cs.toReversed()),
  ];
  const cw = w - 1;
  const corners = Array.from({ length: cw * (h - 1) }, (_, k) => k);
  const cornerCells = corners.map((k) => {
    const c = ((k / cw) | 0) * w + (k % cw);
    return [c, c + 1, c + w, c + w + 1];
  });
  const cellCorners = cells.map((c) => {
    const x = c % w;
    const y = (c / w) | 0;
    const out: number[] = [];
    for (const kx of [x, x - 1])
      for (const ky of [y, y - 1])
        if (kx >= 0 && ky >= 0 && kx < cw && ky < h - 1) out.push(ky * cw + kx);
    return out;
  });
  const pw = w + 1;
  const points = Array.from({ length: pw * (h + 1) }, (_, k) => k);
  const pointCells = points.map((k) => {
    const px = k % pw;
    const py = (k / pw) | 0;
    const out: number[] = [];
    for (const [x, y] of [
      [px - 1, py - 1],
      [px, py - 1],
      [px - 1, py],
      [px, py],
    ])
      if (x >= 0 && y >= 0 && x < w && y < h) out.push(y * w + x);
    return out;
  });
  const cellPoints = cells.map((c) => {
    const k = ((c / w) | 0) * pw + (c % w);
    return [k, k + 1, k + pw, k + pw + 1];
  });
  const cx = 2 * w - 1;
  const centers = Array.from({ length: Math.max(0, cx * (2 * h - 1)) }, (_, p) => p);
  const centerCells = centers.map((p) => {
    const X = (p % cx) + 1;
    const Y = ((p / cx) | 0) + 1;
    const out: number[] = [];
    for (const y of Y & 1 ? [(Y - 1) / 2] : [Y / 2 - 1, Y / 2])
      for (const x of X & 1 ? [(X - 1) / 2] : [X / 2 - 1, X / 2]) out.push(y * w + x);
    return out;
  });
  const opposite = Int32Array.from(sight, (_, s) =>
    s < 2 * w ? (s < w ? s + w : s - w) : s < 2 * w + h ? s + h : s - h,
  );
  if (!latin) {
    for (const c of cells)
      peers[c] = cells.filter(
        (k) => k !== c && unitsOf[k].some((L) => unitsOf[c].includes(L)),
      );
  }
  return {
    w,
    h,
    cells,
    rows,
    cols,
    lines,
    boxes,
    diagonals,
    units,
    unitsOf,
    lineCells,
    rowOf,
    colOf,
    boxOf,
    peers,
    adj4,
    adj4Edges,
    adj8,
    adj8Edges,
    king,
    edgeAdj: king ? adj8 : adj4,
    cellEdges: king ? adj8Edges : adj4Edges,
    edgeEnds: Int32Array.from(ends),
    edges: Array.from({ length: ends.length / 2 }, (_, e) => e),
    crossing,
    edgeOf,
    slots: sight.map((_, s) => s),
    sight,
    opposite,
    corners,
    cornerCells,
    cellCorners,
    points,
    pointCells,
    cellPoints,
    centers,
    centerCells,
    tiling: false,
    faces: [],
    faceCells: [],
    faceEdges: [],
    faceAngles: [],
    edgeFaces: [],
    angles: [],
    angleEdges: [],
    angleCell: new Int32Array(0),
    cellAngles: [],
  };
}

/**
 * `opp(c, p)`: the square that square `c` turns to about center `p`, half a
 * turn, or `-1` where that is off the grid. On the half grid it is
 * `2p − c`, so the square at `(x, y)` turns to `(X − 1 − x, Y − 1 − y)`.
 */
export function opp(sp: GridSpace, c: number, p: number): number {
  if (c < 0 || p < 0) return -1;
  const cx = 2 * sp.w - 1;
  const x = (p % cx) - (c % sp.w);
  const y = ((p / cx) | 0) - ((c / sp.w) | 0);
  return x < 0 || y < 0 || x >= sp.w || y >= sp.h ? -1 : y * sp.w + x;
}

// --- what the generated code calls for its set algebra -------------------

/** The members of a set of values, counted in a fixed number of steps, as
 * compiled code counts a subset many times a scan. */
export function popcount(m: number): number {
  let v = m - ((m >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (Math.imul((v + (v >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24) & 0xff;
}

/**
 * An integer of a domain that is not finite, computed exactly: a double
 * exactly where it is a safe integer, and a `bigint` past that. Kept so, two
 * of them are equal exactly where `===` says, and `<` orders them, or one and
 * a number, as they are; a double's arithmetic is many times a `bigint`'s
 * speed, and few values leave it.
 */
type Exact = number | bigint;

/** `v` as an `Exact`: a double where it is a safe integer. */
function exactOf(v: bigint): Exact {
  const n = Number(v);
  return Number.isSafeInteger(n) ? n : v;
}

// A double's result of two safe integers is exact where it is a safe
// integer: a true result past one rounds to a double past one too. A
// quotient's double is never rounded across a whole number, since the
// numbers are below 2^53. Division by zero leaves the doubles, and BigInt
// throws.

export function iadd(a: Exact, b: Exact): Exact {
  if (typeof a === "number" && typeof b === "number" && Number.isSafeInteger(a + b))
    return a + b;
  return exactOf(BigInt(a) + BigInt(b));
}

export function isub(a: Exact, b: Exact): Exact {
  if (typeof a === "number" && typeof b === "number" && Number.isSafeInteger(a - b))
    return a - b;
  return exactOf(BigInt(a) - BigInt(b));
}

export function imul(a: Exact, b: Exact): Exact {
  if (typeof a === "number" && typeof b === "number" && Number.isSafeInteger(a * b))
    return a * b + 0;
  return exactOf(BigInt(a) * BigInt(b));
}

/** The quotient, truncated. */
export function idiv(a: Exact, b: Exact): Exact {
  if (typeof a === "number" && typeof b === "number") {
    const q = Math.trunc(a / b);
    if (Number.isSafeInteger(q)) return q + 0;
  }
  return exactOf(BigInt(a) / BigInt(b));
}

/** The remainder, with the dividend's sign. */
export function imod(a: Exact, b: Exact): Exact {
  if (typeof a === "number" && typeof b === "number") {
    const r = a % b;
    if (Number.isSafeInteger(r)) return r + 0;
  }
  return exactOf(BigInt(a) % BigInt(b));
}

/** An exact integer as a layer whose domain is not finite holds it: a double,
 * a safe integer, so that a read of the layer is exact as it is. */
export function held(v: Exact): number {
  if (typeof v === "bigint")
    throw new RangeError(`${v} is past what a layer holds exactly`);
  return v;
}

/** The least value of a set of values, or `-1`. */
export function least(m: number): number {
  return m === 0 ? -1 : 31 - Math.clz32(m & -m);
}

/** The greatest value of a set of values, or `-1`. */
export function greatest(m: number): number {
  return m === 0 ? -1 : 31 - Math.clz32(m);
}

/** A set of values' members, ascending. */
export function valuesOf(m: number): number[] {
  const out: number[] = [];
  for (let v = m; v; v &= v - 1) out.push(31 - Math.clz32(v & -v));
  return out;
}

/** `{a, b, ...}` of elements: each once, in the order written. */
export function setOf(...xs: number[]): number[] {
  const out: number[] = [];
  for (const x of xs) if (!out.includes(x)) out.push(x);
  return out;
}

/** `a + b` of element sets: `a`, then what `b` adds, in order. */
export function union(a: readonly number[], b: readonly number[]): number[] {
  const out = a.slice();
  // A scan of `out` for each member is quadratic, which a reach over a whole
  // board (Net's) spends most of its time in; marks pay only past a few.
  if (a.length + b.length <= SMALL_SET) {
    for (const x of b) if (!out.includes(x)) out.push(x);
    return out;
  }
  const ep = stamped(a, b);
  if (ep < 0) {
    const seen = new Set(a);
    for (const x of b)
      if (!seen.has(x)) {
        seen.add(x);
        out.push(x);
      }
    return out;
  }
  for (const x of b)
    if (setMarks[x] !== ep) {
      setMarks[x] = ep;
      out.push(x);
    }
  return out;
}

/** Which elements a set holds, by index past the element (`none` at 0), so
 * a set bound once and asked about in a loop is asked in constant time. */
export function memberMarks(s: readonly number[]): Uint8Array {
  let top = -1;
  for (const x of s) if (x > top) top = x;
  const m = new Uint8Array(top + 2);
  for (const x of s) m[x + 1] = 1;
  return m;
}

/** A comprehension's marks on what it has kept, by element, as
 * {@link stamped}'s are: one a site, a pass each time the site is made. */
export interface Stamps {
  m: Int32Array;
  pass: number;
  /** The pass whose members so far are all stamped. */
  full: number;
}

export function stamps(): Stamps {
  return { m: new Int32Array(0), pass: 0, full: 0 };
}

/** Add `t` to the set `r` a comprehension is making, where it has not yet
 * been added this pass. */
export function addOnce(r: number[], s: Stamps, t: number): void {
  // The members added before the first call of a pass were scanned for, not
  // stamped (the compiled site scans a short set itself).
  if (s.full !== s.pass) {
    s.full = s.pass;
    for (const x of r) if (x >= 0) stampOne(s, x);
  }
  if (t < 0) {
    if (!r.includes(t)) r.push(t);
    return;
  }
  if (t < s.m.length && s.m[t] === s.pass) return;
  stampOne(s, t);
  r.push(t);
}

function stampOne(s: Stamps, t: number): void {
  if (t >= s.m.length) {
    const m = new Int32Array(Math.max(64, 2 * t + 2));
    m.set(s.m);
    s.m = m;
  }
  s.m[t] = s.pass;
}

/** `a - b` of element sets, in `a`'s order. */
export function minus(a: readonly number[], b: readonly number[]): number[] {
  if (b.length <= SMALL_SET) return a.filter((x) => !b.includes(x));
  const ep = stamped(b, a);
  if (ep < 0) {
    const gone = new Set(b);
    return a.filter((x) => !gone.has(x));
  }
  return a.filter((x) => setMarks[x] !== ep);
}

/** The size up to which a scan beats marking. */
const SMALL_SET = 16;

/** Marks on elements, by index: an element is marked in a pass where its
 * entry holds the pass's number, so a pass starts without clearing any. One
 * pass is live at a time, and only inside the function that started it. A
 * `Set` cost Net's reach over the whole board a tenth of a deal. */
let setMarks = new Int32Array(1024);
let setPass = 0;

/** Start a pass that marks `marked`, sized for every element of it and of
 * `also`; `-1` where either holds `none`, which no entry can mark. */
function stamped(marked: readonly number[], also: readonly number[]): number {
  let top = setMarks.length - 1;
  let least = 0;
  for (const x of marked)
    if (x > top) top = x;
    else if (x < least) least = x;
  for (const x of also)
    if (x > top) top = x;
    else if (x < least) least = x;
  if (least < 0) return -1;
  if (top >= setMarks.length) setMarks = new Int32Array(2 * top + 2);
  if (setPass === 0x7fffffff) {
    setMarks.fill(0);
    setPass = 0;
  }
  const ep = ++setPass;
  for (const x of marked) setMarks[x] = ep;
  return ep;
}

/** `a subset b` of element sets. */
export function subsetOf(a: readonly number[], b: readonly number[]): boolean {
  return a.every((x) => b.includes(x));
}

/** `a = b` of element sets: the same members, whatever their order. */
export function sameSet(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && subsetOf(a, b);
}

/** `before(x, L)`: the members of `L` ahead of `x`, none where `x` is not
 * one. */
export function before(x: number, L: readonly number[]): readonly number[] {
  const i = L.indexOf(x);
  return i < 0 ? [] : L.slice(0, i);
}

/** `stretch(L, c, S)`: the cells of the line `L` round `c`, in `L`'s order,
 * each in `S` with none outside it between: the maximal run of `S` along `L`
 * holding `c`, none where `S` or `L` does not hold `c`. */
export function stretch(
  L: readonly number[],
  c: number,
  S: readonly number[],
): readonly number[] {
  const i = L.indexOf(c);
  if (i < 0 || !S.includes(c)) return [];
  let a = i;
  while (a > 0 && S.includes(L[a - 1])) a--;
  let b = i + 1;
  while (b < L.length && S.includes(L[b])) b++;
  return L.slice(a, b);
}

/** `connected(S)`: whether the cells `S` are one group, each reaching every
 * other through members side by side. None and one are. */
export function connected(sp: GridSpace, S: readonly number[]): boolean {
  if (S.length < 2) return true;
  const inS = new Uint8Array(sp.w * sp.h);
  for (const c of S) inS[c] = 1;
  const queue = [S[0]];
  inS[S[0]] = 2;
  for (let i = 0; i < queue.length; i++)
    for (const p of sp.adj4[queue[i]])
      if (inS[p] === 1) {
        inS[p] = 2;
        queue.push(p);
      }
  return queue.length === S.length;
}

/**
 * `matched(A, B)`: whether the cells `A` and `B` pair off one to one, each
 * member of `A` with a member of `B` side by side (Tents' tents and trees).
 * Kuhn's augmenting paths, from each member of `A` in turn.
 */
export function matched(
  sp: GridSpace,
  A: readonly number[],
  B: readonly number[],
): boolean {
  if (A.length !== B.length) return false;
  const n = sp.w * sp.h;
  const inB = new Uint8Array(n);
  for (const c of B) inB[c] = 1;
  const partner = new Int32Array(n).fill(-1);
  const seen = new Int32Array(n).fill(-1);
  const augment = (a: number, round: number): boolean => {
    for (const b of sp.adj4[a]) {
      if (inB[b] === 0 || seen[b] === round) continue;
      seen[b] = round;
      if (partner[b] < 0 || augment(partner[b], round)) {
        partner[b] = a;
        return true;
      }
    }
    return false;
  };
  for (let i = 0; i < A.length; i++) if (!augment(A[i], i)) return false;
  return true;
}

/**
 * `cuts(S)`: the members of `S` without which the rest are not one group, in
 * `S`'s order. A depth-first search counts, for each member, the pieces its
 * own group falls into without it (Hopcroft and Tarjan's articulation
 * points, a group of one falling into none), and the rest are one group
 * where that leaves one piece in all.
 */
export function cuts(sp: GridSpace, S: readonly number[]): readonly number[] {
  const n = sp.w * sp.h;
  const inS = new Uint8Array(n);
  for (const c of S) inS[c] = 1;
  const disc = new Int32Array(n).fill(-1);
  const low = new Int32Array(n);
  const pieces = new Int32Array(n);
  const parent = new Int32Array(n).fill(-1);
  const next = new Int32Array(n);
  let time = 0;
  let groups = 0;
  for (const root of S) {
    if (disc[root] >= 0) continue;
    groups++;
    disc[root] = low[root] = time++;
    const stack = [root];
    while (stack.length > 0) {
      const v = stack[stack.length - 1];
      const around = sp.adj4[v];
      if (next[v] < around.length) {
        const u = around[next[v]++];
        if (!inS[u]) continue;
        if (disc[u] < 0) {
          parent[u] = v;
          disc[u] = low[u] = time++;
          stack.push(u);
        } else if (u !== parent[v]) low[v] = Math.min(low[v], disc[u]);
        continue;
      }
      stack.pop();
      const p = parent[v];
      if (p < 0) continue;
      low[p] = Math.min(low[p], low[v]);
      if (low[v] >= disc[p]) pieces[p]++;
    }
  }
  // Without c, its own group's pieces stand beside the other groups, and a
  // member other than a root keeps the piece holding its parent.
  return S.filter((c) => groups - 1 + pieces[c] + (parent[c] >= 0 ? 1 : 0) >= 2);
}

/**
 * `cut_edges(E)`: the members of `E` whose two cells `E` joins only through
 * them, in `E`'s order. One depth-first search over the cells, across the
 * members (Tarjan's bridges): the edge a cell was reached by is one where
 * nothing below the cell reaches back above it. It answers for every member
 * what `end2(e) not in through(end1(e), E - {e})` asks of one, each of which
 * is a walk of its own.
 */
export function cutEdges(sp: GridSpace, E: readonly number[]): readonly number[] {
  const n = sp.cells.length;
  const inE = new Uint8Array(sp.edgeEnds.length / 2);
  for (const e of E) inE[e] = 1;
  const disc = new Int32Array(n).fill(-1);
  const low = new Int32Array(n);
  // The edge each cell was reached by, -1 at a root.
  const via = new Int32Array(n).fill(-1);
  const next = new Int32Array(n);
  const bridge = new Uint8Array(inE.length);
  let time = 0;
  for (const e of E) {
    for (let end = 0; end < 2; end++) {
      const root = sp.edgeEnds[2 * e + end];
      if (disc[root] >= 0) continue;
      disc[root] = low[root] = time++;
      const stack = [root];
      while (stack.length > 0) {
        const v = stack[stack.length - 1];
        const across = sp.edgeAdj[v];
        if (next[v] < across.length) {
          const k = next[v]++;
          const x = sp.cellEdges[v][k];
          if (!inE[x] || x === via[v]) continue;
          const u = across[k];
          if (disc[u] < 0) {
            via[u] = x;
            disc[u] = low[u] = time++;
            stack.push(u);
          } else low[v] = Math.min(low[v], disc[u]);
          continue;
        }
        stack.pop();
        const x = via[v];
        if (x < 0) continue;
        const p =
          sp.edgeEnds[2 * x] === v ? sp.edgeEnds[2 * x + 1] : sp.edgeEnds[2 * x];
        low[p] = Math.min(low[p], low[v]);
        if (low[v] > disc[p]) bridge[x] = 1;
      }
    }
  }
  return E.filter((e) => bridge[e] === 1);
}

/** The set, square and answers {@link reaches} last searched: a technique
 * asks of one group's reach once for each square in it. */
let reachSet: readonly number[] | null = null;
let reachLength = -1;
let reachFrom = -1;
let reachSpace: GridSpace | null = null;
/** How many members `c` reaches with each square taken out, by square, -1
 * where the square is not one `c` reaches. */
let reachKept = new Int32Array(0);
/** The search's own arrays, a square each, kept between searches. */
let reachIn = new Uint8Array(0);
let reachDisc = new Int32Array(0);
let reachLow = new Int32Array(0);
let reachSize = new Int32Array(0);
let reachLost = new Int32Array(0);
let reachParent = new Int32Array(0);
let reachNext = new Int32Array(0);

/**
 * `reaches(c, S, t)`: how many members of `S` the square `c` reaches through
 * members side by side once `t` is taken out, `c` among them; 0 where `c` is
 * `t` or not in `S`. One search from `c` answers every `t` (Hopcroft and
 * Tarjan's: a member cuts off each child in the search tree whose subtree
 * reaches no higher than it), so it is kept for the set and square last
 * asked. A set is read as it was first asked: the compiled code never
 * changes one it has bound.
 */
export function reaches(
  sp: GridSpace,
  c: number,
  S: readonly number[],
  t: number,
): number {
  if (
    S !== reachSet ||
    S.length !== reachLength ||
    c !== reachFrom ||
    sp !== reachSpace
  )
    searchReach(sp, c, S);
  if (c < 0 || t === c) return 0;
  const kept = t < 0 ? -1 : reachKept[t];
  // A square outside c's group takes nothing from it.
  return kept >= 0 ? kept : reachKept[c];
}

function searchReach(sp: GridSpace, c: number, S: readonly number[]): void {
  reachSet = S;
  reachLength = S.length;
  reachFrom = c;
  reachSpace = sp;
  const n = sp.w * sp.h;
  if (reachKept.length < n) {
    reachKept = new Int32Array(n);
    reachIn = new Uint8Array(n);
    reachDisc = new Int32Array(n);
    reachLow = new Int32Array(n);
    reachSize = new Int32Array(n);
    reachLost = new Int32Array(n);
    reachParent = new Int32Array(n);
    reachNext = new Int32Array(n);
  }
  reachKept.fill(-1, 0, n);
  const inS = reachIn;
  const disc = reachDisc;
  const low = reachLow;
  const size = reachSize;
  const lost = reachLost;
  const parent = reachParent;
  const next = reachNext;
  // Only the members are read before they are written.
  for (const x of S) {
    inS[x] = 1;
    disc[x] = -1;
    size[x] = 0;
    lost[x] = 0;
    parent[x] = -1;
    next[x] = 0;
  }
  if (c < 0 || !inS[c]) {
    for (const x of S) inS[x] = 0;
    if (c >= 0) reachKept[c] = 0;
    return;
  }
  const order: number[] = [];
  let time = 0;
  disc[c] = low[c] = time++;
  const stack = [c];
  while (stack.length > 0) {
    const v = stack[stack.length - 1];
    const around = sp.adj4[v];
    if (next[v] < around.length) {
      const u = around[next[v]++];
      if (!inS[u]) continue;
      if (disc[u] < 0) {
        parent[u] = v;
        disc[u] = low[u] = time++;
        stack.push(u);
      } else if (u !== parent[v]) low[v] = Math.min(low[v], disc[u]);
      continue;
    }
    stack.pop();
    order.push(v);
    size[v] += 1;
    const p = parent[v];
    if (p < 0) continue;
    size[p] += size[v];
    low[p] = Math.min(low[p], low[v]);
    if (low[v] >= disc[p]) lost[p] += size[v];
  }
  const total = size[c];
  reachKept[c] = total;
  for (const v of order) if (v !== c) reachKept[v] = total - 1 - lost[v];
  for (const x of S) inS[x] = 0;
}

const rays = new WeakMap<GridSpace, Map<number, readonly number[]>>();
/** The space asked last and its rays, by `c` and `n`. */
let raySpace: GridSpace | null = null;
let lastRays = new Map<number, readonly number[]>();

/** `ray(c, n)`: the cells from `n` on, each a step from `c` to `n` further,
 * up to the grid's edge. Built once a space, `c` and `n`: a technique asks
 * it of every arm of every cell it binds, every pass (Range's `seen`), and
 * building it each time was a quarter of a large board's deal. */
export function ray(sp: GridSpace, c: number, n: number): readonly number[] {
  if (sp !== raySpace) {
    let bySpace = rays.get(sp);
    if (bySpace === undefined) {
      bySpace = new Map();
      rays.set(sp, bySpace);
    }
    raySpace = sp;
    lastRays = bySpace;
  }
  const key = c * sp.cells.length + n;
  const known = lastRays.get(key);
  if (known !== undefined) return known;
  const dx = (n % sp.w) - (c % sp.w);
  const dy = ((n / sp.w) | 0) - ((c / sp.w) | 0);
  const out: number[] = [];
  for (
    let x = n % sp.w, y = (n / sp.w) | 0;
    x >= 0 && x < sp.w && y >= 0 && y < sp.h;
    x += dx, y += dy
  )
    out.push(y * sp.w + x);
  lastRays.set(key, out);
  return out;
}

/** `step(c, d)`: the cell beside `c` in direction `d`, numbered as the
 * slots are, 1 up, 2 down, 3 left, 4 right; none off the grid, and for any
 * other `d`. */
export function step(sp: GridSpace, c: number, d: number): number {
  const x = c % sp.w;
  const y = (c / sp.w) | 0;
  switch (d) {
    case 1:
      return y > 0 ? c - sp.w : -1;
    case 2:
      return y + 1 < sp.h ? c + sp.w : -1;
    case 3:
      return x > 0 ? c - 1 : -1;
    case 4:
      return x + 1 < sp.w ? c + 1 : -1;
    default:
      return -1;
  }
}

/** The compass's steps, from up clockwise, as `compass` numbers them from 1. */
const COMPASS_DX = [0, 1, 1, 1, 0, -1, -1, -1];
const COMPASS_DY = [-1, -1, 0, 1, 1, 1, 0, -1];

/**
 * `compass(c, a, k)`: the cell `k` squares from `c` along compass direction
 * `a`, numbered from 1 up and clockwise, so 2 is up and right and 8 up and
 * left; none off the grid, and for `k` below 1 or any other `a`.
 */
export function compass(sp: GridSpace, c: number, a: number, k: number): number {
  if (c < 0 || k < 1 || a < 1 || a > 8) return -1;
  const x = (c % sp.w) + k * COMPASS_DX[a - 1];
  const y = ((c / sp.w) | 0) + k * COMPASS_DY[a - 1];
  return x >= 0 && x < sp.w && y >= 0 && y < sp.h ? y * sp.w + x : -1;
}

/** The cells a chain has reached, by the walk that reached them. */
let reached = new Int32Array(0);
let walk = 0;

/**
 * `chain(c)`: `c` and the cells its value names (the answer's `to`), each
 * from the one before, ending at a cell whose value names no cell or one
 * already reached; in reading order, the order the soundness checker can
 * give a set the marks decide. `next` is the cell a cell's value names, `-1`
 * where it has none.
 */
export function chain(
  sp: GridSpace,
  next: (c: number) => number,
  c: number,
): readonly number[] {
  if (c < 0) return [];
  if (reached.length < sp.cells.length) reached = new Int32Array(sp.cells.length);
  if (++walk === 0x7fffffff) {
    reached.fill(0);
    walk = 1;
  }
  const out: number[] = [];
  for (let at = c; at >= 0 && reached[at] !== walk; at = next(at)) {
    reached[at] = walk;
    out.push(at);
  }
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}

/**
 * The chains of every cell of some marks at once, kept while their values
 * stand: each cell's chain read as a tree of the cells leading into the
 * cell it ends at, so that its length and whether it holds a cell are
 * lookups. Each cell names one cell, so a group holds at most one loop, and
 * each cell of a loop roots a tree of its own.
 */
interface Chains {
  placed: number;
  epoch: number;
  /** `|chain(c)|`. */
  len: Int32Array;
  /** The cell each cell's tree is rooted at: the cell its chain ends at,
   * or the first cell of the loop it runs into. */
  root: Int32Array;
  /** Each cell's loop, by one of its cells, -1 for none. */
  loop: Int32Array;
  /** When the walk of the trees enters each cell and leaves it: a cell's
   * chain holds the cells whose interval holds its own. */
  enter: Int32Array;
  leave: Int32Array;
  /** The cell entered at each tick of the walk's clock, -1 at a tick that
   * leaves one: a cell's tree is the cells entered between its ticks. */
  tick: Int32Array;
}

/** The key the marks keep their {@link Chains} under. */
const CHAINS = Symbol("chains");

function chainsOf(sp: GridSpace, b: Marks, next: (c: number) => number): Chains {
  const was = b.kept.get(CHAINS) as Chains | undefined;
  if (was !== undefined && was.placed === b.placed && was.epoch === b.epoch) return was;
  const n = sp.cells.length;
  const to = new Int32Array(n);
  for (let c = 0; c < n; c++) to[c] = next(c);
  const loop = new Int32Array(n).fill(-1);
  // 0 unseen, 1 on the walk being made, 2 done.
  const seen = new Uint8Array(n);
  const path: number[] = [];
  for (let c = 0; c < n; c++) {
    path.length = 0;
    let at = c;
    while (at >= 0 && seen[at] === 0) {
      seen[at] = 1;
      path.push(at);
      at = to[at];
    }
    if (at >= 0 && seen[at] === 1)
      for (let i = path.indexOf(at); i < path.length; i++) loop[path[i]] = at;
    for (const p of path) seen[p] = 2;
  }
  const loopSize = new Int32Array(n);
  for (let c = 0; c < n; c++) if (loop[c] >= 0) loopSize[loop[c]]++;
  // The trees: each cell off a loop under the cell it names.
  const first = new Int32Array(n).fill(-1);
  const sibling = new Int32Array(n).fill(-1);
  for (let c = n - 1; c >= 0; c--) {
    if (loop[c] >= 0 || to[c] < 0) continue;
    sibling[c] = first[to[c]];
    first[to[c]] = c;
  }
  const len = new Int32Array(n);
  const root = new Int32Array(n);
  const enter = new Int32Array(n);
  const leave = new Int32Array(n);
  const tick = new Int32Array(2 * n).fill(-1);
  const stack: number[] = [];
  // Each cell is pushed as it is entered, and left once its last child has
  // been: `child` is the next of its children to enter.
  const child = first;
  let clock = 0;
  for (let r = 0; r < n; r++) {
    if (loop[r] < 0 && to[r] >= 0) continue;
    root[r] = r;
    len[r] = loop[r] >= 0 ? loopSize[loop[r]] : 1;
    tick[clock] = r;
    enter[r] = clock++;
    stack.push(r);
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      const k = child[top];
      if (k < 0) {
        leave[top] = clock++;
        stack.pop();
        continue;
      }
      child[top] = sibling[k];
      root[k] = r;
      len[k] = len[top] + 1;
      tick[clock] = k;
      enter[k] = clock++;
      stack.push(k);
    }
  }
  const made: Chains = {
    placed: b.placed,
    epoch: b.epoch,
    len,
    root,
    loop,
    enter,
    leave,
    tick,
  };
  b.kept.set(CHAINS, made);
  return made;
}

/** `|chain(c)|` on the marks, from their kept chains. */
export function chainLength(
  sp: GridSpace,
  b: Marks,
  next: (c: number) => number,
  c: number,
): number {
  return c < 0 ? 0 : chainsOf(sp, b, next).len[c];
}

/** Whether `x` is in `chain(c)` on the marks, from their kept chains. */
export function chainHas(
  sp: GridSpace,
  b: Marks,
  next: (c: number) => number,
  x: number,
  c: number,
): boolean {
  if (x < 0 || c < 0) return false;
  const s = chainsOf(sp, b, next);
  const r = s.root[c];
  if (s.loop[x] >= 0) return s.loop[x] === s.loop[r];
  return s.root[x] === r && s.enter[x] <= s.enter[c] && s.leave[c] <= s.leave[x];
}

/** `last(c)` on the marks, from their kept chains: the cell `c`'s chain
 * ends at, none where it runs into a loop. */
export function chainEnd(
  sp: GridSpace,
  b: Marks,
  next: (c: number) => number,
  c: number,
): number {
  if (c < 0) return -1;
  const s = chainsOf(sp, b, next);
  return s.loop[s.root[c]] >= 0 ? -1 : s.root[c];
}

/** `last(c)` walked: the cell `c`'s chain ends at, none where it runs into
 * a loop. */
export function lastOf(next: (c: number) => number, c: number): number {
  const seen = new Set<number>();
  for (let at = c; at >= 0; at = next(at)) {
    if (seen.has(at)) return -1;
    seen.add(at);
    if (next(at) < 0) return at;
  }
  return -1;
}

/** The cells whose chain holds `x` on the marks, in reading order: `x`'s
 * tree read off the kept chains, or on a loop every cell running into it. */
export function chainHolders(
  sp: GridSpace,
  b: Marks,
  next: (c: number) => number,
  x: number,
): number[] {
  if (x < 0) return [];
  const s = chainsOf(sp, b, next);
  const out: number[] = [];
  if (s.loop[x] >= 0) {
    for (let k = 0; k < s.root.length; k++)
      if (s.loop[s.root[k]] === s.loop[x]) out.push(k);
    return out;
  }
  for (let t = s.enter[x]; t < s.leave[x]; t++) if (s.tick[t] >= 0) out.push(s.tick[t]);
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}

/**
 * `slash(c, k)`: the value cell `c` holds where its diagonal meets point
 * `k`, 1 for the one from above left to below right and 2 for the other;
 * none where `k` is not one of its points.
 */
export function slash(sp: GridSpace, c: number, k: number): number {
  if (c < 0 || k < 0) return -1;
  // Square c's corner above left is point c + y, and its other three are
  // 1, w + 1 and w + 2 past it.
  const d = k - c - ((c / sp.w) | 0);
  return d === 0 || d === sp.w + 2 ? 1 : d === 1 || d === sp.w + 1 ? 2 : -1;
}

/**
 * A sum over a group of points of what `term` gives each, kept at the
 * group's root: added together as two groups join, and moved by the change
 * in a point's term as a placement touches it. A term reads the marks only
 * at the squares round its point, so a placement changes only its own
 * square's points' terms.
 */
export type LinkTerm<C> = (b: Marks, sp: GridSpace, cl: C, q: number) => number;

interface LinkSum {
  term: unknown;
  cl: unknown;
  at: (q: number) => number;
  /** Each point's term, and each root's sum. */
  value: Float64Array;
  sum: Float64Array;
}

/** The marks {@link linkedOf} last read, at which epoch and how far into its
 * log, and the groups of points their diagonals join, as a union-find: each
 * point's parent and group size, the diagonal each square was joined at (0
 * for none), every group's points by its root, once listed, and the sums kept
 * over the groups. */
let linkMarks: Marks | null = null;
let linkSpace: GridSpace | null = null;
let linkEpoch = -1;
let linkRead = 0;
let linkParent = new Int32Array(0);
let linkSize = new Int32Array(0);
let linkJoined = new Int8Array(0);
let linkListed = false;
const linkMembers = new Map<number, number[]>();
const linkSums: LinkSum[] = [];

function linkRoot(i: number): number {
  while (linkParent[i] !== i) {
    linkParent[i] = linkParent[linkParent[i]];
    i = linkParent[i];
  }
  return i;
}

function mergeSorted(a: readonly number[], b: readonly number[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) out.push(a[i] < b[j] ? a[i++] : b[j++]);
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}

/** Join square `c`'s points as diagonal `v` does, merging the groups' lists
 * and sums into the larger group's. False where the square was joined at the
 * other diagonal, which the marks have taken back. */
function linkJoin(sp: GridSpace, c: number, v: number): boolean {
  const was = linkJoined[c];
  if (v === was) return true;
  if (was !== 0) return false;
  linkJoined[c] = v;
  const ps = sp.cellPoints[c];
  let p = linkRoot(v === 1 ? ps[0] : ps[1]);
  let q = linkRoot(v === 1 ? ps[3] : ps[2]);
  if (p === q) return true;
  if (linkSize[p] > linkSize[q]) [p, q] = [q, p];
  linkParent[p] = q;
  linkSize[q] += linkSize[p];
  // A list handed out stays as it was, since a technique may place while it
  // reads one, so the joined group's is a new list, in point order as a
  // listing from scratch gives it.
  if (linkListed) {
    linkMembers.set(q, mergeSorted(linkMembers.get(q) ?? [], linkMembers.get(p) ?? []));
    linkMembers.delete(p);
  }
  for (const s of linkSums) s.sum[q] += s.sum[p];
  return true;
}

/** Move each kept sum by the change in the terms of square `c`'s points. */
function linkTouch(sp: GridSpace, c: number): void {
  for (const s of linkSums)
    for (const q of sp.cellPoints[c]) {
      const now = s.at(q);
      s.sum[linkRoot(q)] += now - s.value[q];
      s.value[q] = now;
    }
}

/**
 * The groups of points the diagonals `b` holds join, brought up to date from
 * the cells `b` has placed since they were last read, as the hand-written
 * solver kept them: a placement joins at most two groups. Marks set
 * wholesale since, or whose square has lost or changed its diagonal, are
 * joined afresh from their grid.
 */
function linkGroups(sp: GridSpace, b: Marks): void {
  linkCatchUp(sp, b);
  if (keptCheck) checkLinked(sp, b);
}

function linkCatchUp(sp: GridSpace, b: Marks): void {
  if (b === linkMarks && sp === linkSpace && b.epoch === linkEpoch) {
    const { log } = b;
    if (linkRead === log.length) return;
    for (; linkRead < log.length; linkRead++) {
      const c = log[linkRead];
      const raw = b.grid[c];
      if (!linkJoin(sp, c, raw === 1 || raw === 2 ? raw : 0)) break;
      linkTouch(sp, c);
    }
    if (linkRead === log.length) return;
  }
  linkMarks = b;
  linkSpace = sp;
  linkEpoch = b.epoch;
  linkRead = b.log.length;
  const n = sp.points.length;
  if (linkParent.length < n) {
    linkParent = new Int32Array(n);
    linkSize = new Int32Array(n);
  }
  for (let i = 0; i < n; i++) {
    linkParent[i] = i;
    linkSize[i] = 1;
  }
  if (linkJoined.length < sp.cells.length) linkJoined = new Int8Array(sp.cells.length);
  linkJoined.fill(0);
  linkMembers.clear();
  linkListed = false;
  linkSums.length = 0;
  for (const c of sp.cells) {
    const raw = b.grid[c];
    linkJoin(sp, c, raw === 1 || raw === 2 ? raw : 0);
  }
}

/** {@link linked} on the marks' own values, outside any supposition: the
 * groups are kept up to date a placement, not walked each read. */
export function linkedOf(sp: GridSpace, b: Marks, k: number): readonly number[] {
  if (k < 0) return [];
  linkGroups(sp, b);
  if (!linkListed) {
    for (const p of sp.points) {
      const r = linkRoot(p);
      const group = linkMembers.get(r);
      if (group === undefined) linkMembers.set(r, [p]);
      else group.push(p);
    }
    linkListed = true;
  }
  return linkMembers.get(linkRoot(k)) ?? [];
}

/** The sum of `term` over {@link linkedOf}`(k)`, kept as the groups are
 * (0 where `k` is no point). */
export function linkedSum<C>(
  sp: GridSpace,
  b: Marks,
  cl: C,
  term: LinkTerm<C>,
  k: number,
): number {
  if (k < 0) return 0;
  linkGroups(sp, b);
  let s = linkSums.find((x) => x.term === term && x.cl === cl);
  if (s === undefined) {
    const n = sp.points.length;
    const at = (q: number): number => term(b, sp, cl, q);
    s = { term, cl, at, value: new Float64Array(n), sum: new Float64Array(n) };
    for (const q of sp.points) {
      s.value[q] = at(q);
      s.sum[linkRoot(q)] += s.value[q];
    }
    linkSums.push(s);
  }
  return s.sum[linkRoot(k)];
}

/** Whether `q` is in {@link linkedOf}`(k)`. */
export function linkedWith(sp: GridSpace, b: Marks, q: number, k: number): boolean {
  if (k < 0 || q < 0) return false;
  linkGroups(sp, b);
  return linkRoot(q) === linkRoot(k);
}

/**
 * The groups of points the diagonals `value` reads join, for reading one
 * grid many times (an answer check): `of(k)` is {@link linked}`(k)`, each
 * group listed once it is read.
 */
export function pointGroups(
  sp: GridSpace,
  value: (c: number) => number,
): { of(k: number): readonly number[] } {
  const parent = Int32Array.from(sp.points, (_, i) => i);
  const root = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  for (const c of sp.cells) {
    const v = value(c);
    if (v !== 1 && v !== 2) continue;
    const ps = sp.cellPoints[c];
    parent[root(v === 1 ? ps[0] : ps[1])] = root(v === 1 ? ps[3] : ps[2]);
  }
  let members: Map<number, number[]> | null = null;
  return {
    of(k) {
      if (k < 0) return [];
      if (members === null) {
        members = new Map();
        for (const p of sp.points) {
          const r = root(p);
          const group = members.get(r);
          if (group === undefined) members.set(r, [p]);
          else group.push(p);
        }
      }
      return members.get(root(k)) ?? [];
    },
  };
}

/** The points a walk has reached, by the walk that reached them. */
let met = new Int32Array(0);
let metWalk = 0;

/**
 * `linked(k)`: `k` and the points joined to it by the diagonals the cells
 * hold, in reading order. `value` reads a cell's value, `-1` where it has
 * none.
 */
export function linked(
  sp: GridSpace,
  value: (c: number) => number,
  k: number,
): readonly number[] {
  if (k < 0) return [];
  if (met.length < sp.points.length) met = new Int32Array(sp.points.length);
  if (++metWalk === 0x7fffffff) {
    met.fill(0);
    metWalk = 1;
  }
  const out = [k];
  met[k] = metWalk;
  for (let i = 0; i < out.length; i++) {
    const p = out[i];
    for (const c of sp.pointCells[p]) {
      const v = value(c);
      const at = sp.cellPoints[c].indexOf(p);
      if (v !== (at === 0 || at === 3 ? 1 : 2)) continue;
      const q = sp.cellPoints[c][3 - at];
      if (met[q] === metWalk) continue;
      met[q] = metWalk;
      out.push(q);
    }
  }
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}

/** The edges {@link through} may cross, set for one call. */
let crossable = new Uint8Array(0);

/**
 * `through(c, E)`: `c` and the cells reached from it across the edges `E`,
 * each between two orthogonal neighbors, in reading order.
 */
export function through(
  sp: GridSpace,
  c: number,
  E: readonly number[],
): readonly number[] {
  if (c < 0) return [];
  const n = sp.cells.length;
  if (reached.length < n) reached = new Int32Array(n);
  const edges = sp.edgeEnds.length / 2;
  if (crossable.length < edges) crossable = new Uint8Array(edges);
  if (++walk === 0x7fffffff) {
    reached.fill(0);
    walk = 1;
  }
  for (const e of E) crossable[e] = 1;
  const out = [c];
  reached[c] = walk;
  for (let i = 0; i < out.length; i++) {
    const across = sp.edgeAdj[out[i]];
    const by = sp.cellEdges[out[i]];
    for (let k = 0; k < across.length; k++) {
      const q = across[k];
      if (reached[q] === walk || !crossable[by[k]]) continue;
      reached[q] = walk;
      out.push(q);
    }
  }
  for (const e of E) crossable[e] = 0;
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}

/**
 * `through(c, {e in edges where P})`: {@link through} over the edges `crosses`
 * holds of, asked only of the edges the walk from `c` meets. A set of edges
 * stated in place, not bound, is read this way, so a walk along one piece of
 * line costs the piece, not the board: a supposed line changes the set at
 * every look (Path's).
 */
export function throughWhere(
  sp: GridSpace,
  c: number,
  crosses: (e: number) => boolean,
): readonly number[] {
  if (c < 0) return [];
  const n = sp.cells.length;
  if (reached.length < n) reached = new Int32Array(n);
  if (++walk === 0x7fffffff) {
    reached.fill(0);
    walk = 1;
  }
  // `crosses` may walk too (a piece's ends read inside a stretch's test),
  // which takes the counter on: this walk's cells are the ones marked with
  // its own.
  const mine = walk;
  const out = [c];
  reached[c] = mine;
  for (let i = 0; i < out.length; i++) {
    const across = sp.edgeAdj[out[i]];
    const by = sp.cellEdges[out[i]];
    for (let k = 0; k < across.length; k++) {
      const q = across[k];
      if (reached[q] === mine || !crosses(by[k])) continue;
      reached[q] = mine;
      out.push(q);
    }
  }
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}

/** The cells joined across a set of edges: `of(c)` is `c`'s group in
 * reading order, one list that each of its cells reads, so a cell is in a
 * group exactly where `of` gives it that list. */
export interface EdgeGroups {
  of(c: number): readonly number[];
  /** Where the groups are kept on the marks, what has changed in them. */
  readonly changes?: GroupChanges;
}

/**
 * The changes to kept groups since they were last made afresh (`made`
 * counts the times): for each join, the smaller group's squares, and for
 * each split, the squares of the group split. Whether two squares share a
 * group changes only for squares of one of these, so a binding that reads
 * none of them reads the same.
 */
export interface GroupChanges {
  readonly made: number;
  readonly changed: readonly (readonly number[])[];
}

/** A set of edges {@link edgeGroups} joined: the space, a hash and a copy of
 * the set, and the groups. */
interface JoinedSet {
  sp: GridSpace;
  hash: number;
  edges: number[];
  groups: EdgeGroups;
}

/** How many sets {@link edgeGroups} keeps: a ladder binds one a value of
 * the domain in each of several rungs (Filling's nine numbers). */
const KEPT_SETS = 32;
const joinedSets: JoinedSet[] = [];
let nextKept = 0;

/**
 * The cells joined across the edges `E`, for reading {@link through} from
 * many cells over one set: `of(c)` is `through(c, E)`, each group listed
 * once it is read. The groups of the sets last asked for are kept while one
 * is asked for again: each rung of a ladder binds its sets afresh after
 * every firing, and most firings leave them as they were (Separate's walls,
 * Filling's room for each number).
 */
export function edgeGroups(sp: GridSpace, E: readonly number[]): EdgeGroups {
  let hash = E.length;
  for (const e of E) hash = Math.imul(hash ^ e, 0x9e3779b1);
  for (const kept of joinedSets)
    if (
      kept.hash === hash &&
      kept.sp === sp &&
      kept.edges.length === E.length &&
      E.every((e, i) => e === kept.edges[i])
    )
      return kept.groups;
  const joined = { sp, hash, edges: E.slice(), groups: joinedAcross(sp, E) };
  joinedSets[nextKept] = joined;
  nextKept = (nextKept + 1) % KEPT_SETS;
  return joined.groups;
}

function joinedAcross(sp: GridSpace, E: readonly number[]): EdgeGroups {
  const n = sp.cells.length;
  const root = (p: Int32Array, i: number): number => {
    while (p[i] !== i) {
      p[i] = p[p[i]];
      i = p[i];
    }
    return i;
  };
  const parent = new Int32Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  for (const e of E)
    parent[root(parent, sp.edgeEnds[2 * e])] = root(parent, sp.edgeEnds[2 * e + 1]);
  // Each cell's group, by cell: the cells are met in reading order, so each
  // group's list is too. A root's list is made when its first cell is met.
  const byRoot = new Array<number[]>(n);
  const groupOf = new Array<number[]>(n);
  for (let x = 0; x < n; x++) {
    const r = root(parent, x);
    let group = byRoot[r];
    if (group === undefined) {
      group = [];
      byRoot[r] = group;
    }
    group.push(x);
    groupOf[x] = group;
  }
  const none: readonly number[] = [];
  return { of: (c) => (c < 0 ? none : groupOf[c]) };
}

/** Whether edge `e` is in a set {@link keptEdgeGroups} keeps, by the marks
 * at the edge or at its two squares; `a` is the one number the set's
 * statement reads from outside it (0 where it reads none). */
export type EdgeHolds<C> = (
  b: Marks,
  sp: GridSpace,
  cl: C,
  e: number,
  a: number,
) => boolean;

const NO_CELLS: readonly number[] = [];

/** The groups one set of edges joins, kept over one marks. */
class EdgeGroupsKept implements GroupChanges {
  epoch = -1;
  read = 0;
  made = 0;
  changed: (readonly number[])[] = [];
  sp: GridSpace | null = null;
  cl: unknown = null;
  parent = new Int32Array(0);
  /** Whether each edge is in the set. */
  in = new Uint8Array(0);
  /** Each cell's group, in reading order: every cell of a group holds the
   * one list, and a list once made is never changed. */
  groupOf: (readonly number[])[] = [];
  /** Whether `groupOf` has been handed out since it was last copied: a
   * handle reads the groups as they were when it was taken, so a join
   * after it writes a copy. */
  handed = false;
  constructor(
    private readonly holds: EdgeHolds<unknown>,
    private readonly a: number,
  ) {}

  root(i: number): number {
    const p = this.parent;
    while (p[i] !== i) {
      p[i] = p[p[i]];
      i = p[i];
    }
    return i;
  }

  rebuild(b: Marks, sp: GridSpace, cl: unknown): void {
    this.epoch = b.epoch;
    this.read = b.log.length;
    this.made++;
    this.changed = [];
    this.sp = sp;
    this.cl = cl;
    const n = sp.cells.length;
    const edges = sp.edgeEnds.length / 2;
    if (this.parent.length !== n) this.parent = new Int32Array(n);
    if (this.in.length !== edges) this.in = new Uint8Array(edges);
    for (let i = 0; i < n; i++) this.parent[i] = i;
    for (let e = 0; e < edges; e++) {
      const now = this.holds(b, sp, cl, e, this.a);
      this.in[e] = now ? 1 : 0;
      if (now)
        this.parent[this.root(sp.edgeEnds[2 * e])] = this.root(sp.edgeEnds[2 * e + 1]);
    }
    const byRoot = new Array<number[]>(n);
    const groupOf = new Array<number[]>(n);
    for (let x = 0; x < n; x++) {
      const r = this.root(x);
      let group = byRoot[r];
      if (group === undefined) {
        group = [];
        byRoot[r] = group;
      }
      group.push(x);
      groupOf[x] = group;
    }
    this.groupOf = groupOf;
    this.handed = false;
  }

  /** A copy for a fork of the marks these are caught up with, which reads
   * the fork's log from its start. The two share their lists until either
   * changes them. */
  fork(): EdgeGroupsKept {
    const k = new EdgeGroupsKept(this.holds, this.a);
    k.epoch = this.epoch;
    k.sp = this.sp;
    k.cl = this.cl;
    k.parent = this.parent.slice();
    k.in = this.in.slice();
    k.groupOf = this.groupOf;
    k.handed = true;
    this.handed = true;
    return k;
  }

  /** The lists about to change, copied first where a handle reads them. */
  writable(): (readonly number[])[] {
    if (this.handed) {
      this.groupOf = this.groupOf.slice();
      this.handed = false;
    }
    return this.groupOf;
  }

  /** Join edge `e`'s squares' groups into one new list. */
  join(e: number): void {
    const sp = this.sp as GridSpace;
    const p = this.root(sp.edgeEnds[2 * e]);
    const q = this.root(sp.edgeEnds[2 * e + 1]);
    if (p === q) return;
    this.parent[p] = q;
    const g = this.writable();
    const a = g[sp.edgeEnds[2 * e]];
    const b = g[sp.edgeEnds[2 * e + 1]];
    this.changed.push(a.length <= b.length ? a : b);
    const merged = mergeSorted(a, b);
    for (const x of merged) g[x] = merged;
  }

  /** Join `group`'s squares afresh across the edges still in the set, where
   * one has left it: only its own squares can come apart, and their parents
   * all lie among them. */
  split(group: readonly number[]): void {
    const sp = this.sp as GridSpace;
    this.changed.push(group);
    if (this.mine.length !== this.parent.length)
      this.mine = new Int32Array(this.parent.length);
    const mark = ++this.marked;
    for (const x of group) {
      this.parent[x] = x;
      this.mine[x] = mark;
    }
    for (const x of group) {
      const across = sp.edgeAdj[x];
      const by = sp.cellEdges[x];
      for (let k = 0; k < across.length; k++)
        if (across[k] > x && this.mine[across[k]] === mark && this.in[by[k]] === 1)
          this.parent[this.root(x)] = this.root(across[k]);
    }
    const g = this.writable();
    const lists = new Map<number, number[]>();
    for (const x of group) {
      const r = this.root(x);
      let list = lists.get(r);
      if (list === undefined) {
        list = [];
        lists.set(r, list);
      }
      list.push(x);
      g[x] = list;
    }
  }

  /** The squares of the group a split is under way in, by a count of splits. */
  mine = new Int32Array(0);
  marked = 0;

  /** Catch up from the marks' log: a placement can change only the edges
   * whose condition reads its index, the edge itself where `byEdge`, else
   * the square's own edges. The edges that leave the set split their groups
   * before those that join it join theirs. */
  update(b: Marks, sp: GridSpace, cl: unknown, byEdge: boolean): EdgeGroups {
    if (b.epoch !== this.epoch || sp !== this.sp || cl !== this.cl)
      this.rebuild(b, sp, cl);
    const { log } = b;
    const changed = byEdge ? [0] : [0, 0, 0, 0, 0, 0, 0, 0];
    for (; this.read < log.length; this.read++) {
      const x = log[this.read];
      let n = 0;
      if (byEdge) changed[n++] = x;
      else for (const e of sp.cellEdges[x]) changed[n++] = e;
      let left = false;
      for (let i = 0; i < n; i++) {
        const e = changed[i];
        const now = this.holds(b, sp, cl, e, this.a);
        if (now === (this.in[e] === 1)) changed[i] = -1;
        else {
          this.in[e] = now ? 1 : 0;
          if (!now) left = true;
        }
      }
      if (left)
        for (let i = 0; i < n; i++) {
          const e = changed[i];
          if (e < 0 || this.in[e] === 1) continue;
          const group = this.groupOf[sp.edgeEnds[2 * e]];
          // A group two edges left is split once: the first split gives its
          // squares new lists.
          if (this.groupOf[group[0]] === group) this.split(group);
        }
      for (let i = 0; i < n; i++) {
        const e = changed[i];
        if (e >= 0 && this.in[e] === 1) this.join(e);
      }
    }
    if (keptCheck) checkKeptGroups(b, sp, cl, this.holds, this.a, this.groupOf);
    this.handed = true;
    const groupOf = this.groupOf;
    return { of: (c) => (c < 0 ? NO_CELLS : groupOf[c]), changes: this };
  }
}

/** Whether every kept structure is checked against one made afresh at each
 * read, and how many reads have been: a guard's switch, never set in play. */
let keptCheck = false;
let keptChecked = 0;

/** Turn the check of kept structures against fresh ones on or off, and say
 * how many reads it checked since it was last turned. */
export function setKeptCheck(on: boolean): number {
  keptCheck = on;
  const n = keptChecked;
  keptChecked = 0;
  return n;
}

/** Whether a compiled binding, before it fires, reads all its binders afresh
 * from the marks and fails where one no longer holds, as the compiler's
 * reads made again should have passed it over: a guard's switch, never set
 * in play. Compiled code reads it as it stands, through the import. */
export let staleChecking = false;
let freshChecked = 0;

/** Turn the stale-read guard on or off, and say how many bindings it
 * checked since it was last turned. */
export function setStaleCheck(on: boolean): number {
  staleChecking = on;
  const n = freshChecked;
  freshChecked = 0;
  return n;
}

/** A binding about to fire, with its reads made afresh: each `holds[i]` is
 * whether the read `what[i]` names is true of the marks now. */
export function freshBinding(
  technique: string,
  holds: readonly boolean[],
  what: readonly string[],
): void {
  const i = holds.indexOf(false);
  if (i >= 0)
    throw new Error(`${technique} fired on a stale read: ${what[i]} no longer holds`);
  freshChecked++;
}

function checkKeptGroups(
  b: Marks,
  sp: GridSpace,
  cl: unknown,
  holds: EdgeHolds<unknown>,
  a: number,
  groupOf: readonly (readonly number[])[],
): void {
  const fresh = joinedAcross(
    sp,
    sp.edges.filter((e) => holds(b, sp, cl, e, a)),
  );
  for (const c of sp.cells) {
    const want = fresh.of(c);
    const got = groupOf[c];
    if (want.length !== got.length || want.some((x, i) => x !== got[i]))
      throw new Error(`kept edge groups: square ${c} is in [${got}], not [${want}]`);
  }
  keptChecked++;
}

/** The linked groups and their sums, against the marks' groups made afresh. */
function checkLinked(sp: GridSpace, b: Marks): void {
  const fresh = pointGroups(sp, (c) => b.value(c));
  for (const p of sp.points) {
    const want = fresh.of(p);
    for (const q of want)
      if (linkRoot(q) !== linkRoot(p))
        throw new Error(`kept linked groups: point ${q} is not with ${p}`);
    if (linkSize[linkRoot(p)] !== want.length)
      throw new Error(`kept linked groups: point ${p}'s group is not [${want}]`);
    if (want[0] !== p) continue;
    for (const s of linkSums) {
      const sum = want.reduce((t, q) => t + s.at(q), 0);
      if (s.sum[linkRoot(p)] !== sum)
        throw new Error(
          `kept linked sum: point ${p}'s group sums ${s.sum[linkRoot(p)]}, not ${sum}`,
        );
    }
  }
  keptChecked++;
}

/**
 * The cells joined across the edges `holds` is true of, as {@link edgeGroups}
 * joins a set it is given, kept on the marks: caught up from their log, a
 * placement rechecking only the edges it could change, so a set that grows
 * as values are placed (the edges with no wall, the pairs of equal numbers)
 * is joined an edge at a time. An edge that leaves the set starts it again
 * from the marks, as does a new epoch. `byEdge` says the answer is on the
 * edges, so a placement is at an edge; otherwise it is at a square.
 */
export function keptEdgeGroups<C>(
  sp: GridSpace,
  b: Marks,
  cl: C,
  holds: EdgeHolds<C>,
  a: number,
  byEdge: boolean,
): EdgeGroups {
  let byA = b.kept.get(holds) as Map<number, EdgeGroupsKept> | undefined;
  if (byA === undefined) {
    byA = new Map();
    b.kept.set(holds, byA);
  }
  let kept = byA.get(a);
  if (kept === undefined) {
    kept = new EdgeGroupsKept(holds as EdgeHolds<unknown>, a);
    byA.set(a, kept);
  }
  return kept.update(b, sp, cl, byEdge);
}

/**
 * Copy into `into` the groups kept over the marks `from` that have caught up
 * with them, for a fork of the marks whose log starts empty: each copy, by
 * the groups it copies. Whatever else is kept is made afresh on the fork.
 */
export function forkKept(
  from: Marks,
  into: Map<unknown, unknown>,
): Map<GroupChanges, GroupChanges> {
  const copies = new Map<GroupChanges, GroupChanges>();
  for (const [key, byA] of from.kept) {
    if (!(byA instanceof Map)) continue;
    const forked = new Map<number, EdgeGroupsKept>();
    for (const [a, kept] of byA)
      if (
        kept instanceof EdgeGroupsKept &&
        kept.epoch === from.epoch &&
        kept.read === from.log.length
      ) {
        const copy = kept.fork();
        forked.set(a, copy);
        copies.set(kept, copy);
      }
    if (forked.size > 0) into.set(key, forked);
  }
  return copies;
}

/** The next mask above `k` with as many bits set (Gosper's hack), so a
 * `subsets` binder of one size counts only those. */
export function nextOfSize(k: number): number {
  const c = k & -k;
  const r = k + c;
  return (((r ^ k) >>> 2) / c) | r;
}

/** A cell's content as a beam reads it: `true` where it holds what deflects
 * one, `false` where it is empty, `null` where nothing says. */
export type Deflects = (c: number) => boolean | null;

/** The steps a beam takes, clockwise from up, as `(dx, dy)`. */
const STEPS = [0, -1, 1, 0, 0, 1, -1, 0];

/**
 * Where a beam fired in from slot `s` goes, Black Box's physics, as one
 * number: the slot it comes out at, `s` itself where it is reflected, and
 * `sp.slots.length` where a deflecting cell absorbs it, or, where it first
 * looks at a cell `holds` says nothing of and that cell decides what it does,
 * `~c` for that cell. A beam meeting a deflecting cell head-on is absorbed;
 * one diagonally ahead turns it away; one beside the square it enters by
 * reflects it before it enters, and a head-on one there absorbs it first.
 * One tracer for an answer and for partial marks, so they cannot disagree.
 */
export function traceBeam(sp: GridSpace, s: number, holds: Deflects): number {
  const { w, h } = sp;
  let x: number;
  let y: number;
  let dir: number;
  if (s < w) [x, y, dir] = [s, -1, 2];
  else if (s < 2 * w) [x, y, dir] = [s - w, h, 0];
  else if (s < 2 * w + h) [x, y, dir] = [-1, s - 2 * w, 1];
  else [x, y, dir] = [w, s - 2 * w - h, 3];
  /** What lies ahead of `(x, y)`, turned `side` steps from the beam's way
   * first (-1 left, 1 right): off the grid, never a deflecting cell. */
  const look = (side: number): { at: number; v: boolean | null } => {
    const d = 2 * dir;
    let ax = x + STEPS[d];
    let ay = y + STEPS[d + 1];
    if (side !== 0) {
      const e = 2 * ((dir + side + 4) % 4);
      ax += STEPS[e];
      ay += STEPS[e + 1];
    }
    if (ax < 0 || ay < 0 || ax >= w || ay >= h) return { at: -1, v: false };
    const at = ay * w + ax;
    return { at, v: holds(at) };
  };
  const front = look(0);
  if (front.v === null) return ~front.at;
  if (front.v) return sp.slots.length;
  const left = look(-1);
  const right = look(1);
  if (left.v || right.v) return s;
  if (left.v === null) return ~left.at;
  if (right.v === null) return ~right.at;
  x += STEPS[2 * dir];
  y += STEPS[2 * dir + 1];
  for (;;) {
    if (y < 0) return x;
    if (y >= h) return w + x;
    if (x < 0) return 2 * w + y;
    if (x >= w) return 2 * w + h + y;
    const ahead = look(0);
    if (ahead.v === null) return ~ahead.at;
    if (ahead.v) return sp.slots.length;
    const l = look(-1);
    if (l.v === null) return ~l.at;
    if (l.v) {
      dir = (dir + 1) % 4;
      continue;
    }
    const r = look(1);
    if (r.v === null) return ~r.at;
    if (r.v) {
      dir = (dir + 3) % 4;
      continue;
    }
    x += STEPS[2 * dir];
    y += STEPS[2 * dir + 1];
  }
}

/** What a cell holds as a sightline reads it: 1 a mirror `\`, 2 a mirror
 * `/`, 0 none. */
export type MirrorAt = (c: number) => number;

/** A sightline: every cell it passes, mirrors included, in the order it
 * passes them, and the slot it comes out at. */
export interface Sightline {
  readonly visits: readonly number[];
  readonly exit: number;
}

/**
 * The sightline in from slot `s` (Undead's): straight on through each cell,
 * turned a quarter turn by each mirror, and out at the slot it reaches. It
 * never comes back out at `s`, since a mirror never turns it right round.
 * One tracer for the game, the compiled code and the checker.
 */
export function traceSight(sp: GridSpace, s: number, mirrorAt: MirrorAt): Sightline {
  let at = sightEntry(sp, s);
  const visits: number[] = [];
  for (;;) {
    const next = sightAhead(sp, at);
    if (next.exit >= 0) return { visits, exit: next.exit };
    visits.push(next.c);
    at = { c: next.c, dir: sightTurn(at.dir, mirrorAt(next.c)) };
  }
}

/** Where a sightline stands: a cell, or `-1` beyond the slot it comes in
 * from, and the way it heads, clockwise from up. */
export interface SightAt {
  readonly c: number;
  readonly dir: number;
  /** The cell off the grid it stands on, before it enters. */
  readonly x?: number;
  readonly y?: number;
}

/** A sightline about to come in from slot `s`. */
export function sightEntry(sp: GridSpace, s: number): SightAt {
  const { w, h } = sp;
  if (s < w) return { c: -1, x: s, y: -1, dir: 2 };
  if (s < 2 * w) return { c: -1, x: s - w, y: h, dir: 0 };
  if (s < 2 * w + h) return { c: -1, x: -1, y: s - 2 * w, dir: 1 };
  return { c: -1, x: w, y: s - 2 * w - h, dir: 3 };
}

/** What lies a step ahead of a sightline: the cell it passes next, or the
 * slot it comes out at (`exit`, `-1` while it stays on the grid). */
export function sightAhead(sp: GridSpace, at: SightAt): { c: number; exit: number } {
  const { w, h } = sp;
  const x = (at.c < 0 ? (at.x as number) : at.c % w) + STEPS[2 * at.dir];
  const y = (at.c < 0 ? (at.y as number) : (at.c / w) | 0) + STEPS[2 * at.dir + 1];
  if (y < 0) return { c: -1, exit: x };
  if (y >= h) return { c: -1, exit: w + x };
  if (x < 0) return { c: -1, exit: 2 * w + y };
  if (x >= w) return { c: -1, exit: 2 * w + h + y };
  return { c: y * w + x, exit: -1 };
}

/** The way a sightline heads on from a cell holding `m` (0 none, 1 `\`, 2
 * `/`), having come in heading `dir`: `\` swaps down with right and up with
 * left, `/` down with left and up with right. */
export function sightTurn(dir: number, m: number): number {
  if (m === 1) return 3 - dir;
  if (m === 2) return dir ^ 1;
  return dir;
}

/** What `sight(s, M)` and its kin read of one sightline, each in the order
 * it first passes them: the cells other than mirrors it passes; those it
 * passes before its first mirror, each once, since it runs straight; those
 * it passes after one; those it passes twice after one, across and up or
 * down; and the slot it comes out at. A cell is passed at most twice, once
 * each way across. */
export interface SightSets {
  readonly all: readonly number[];
  readonly direct: readonly number[];
  readonly bent: readonly number[];
  readonly twice: readonly number[];
  readonly exit: number;
}

/** {@link SightSets} of the sightline from slot `s`. */
export function sightSets(sp: GridSpace, s: number, mirrorAt: MirrorAt): SightSets {
  const { visits, exit } = traceSight(sp, s, mirrorAt);
  const all: number[] = [];
  const direct: number[] = [];
  const bent: number[] = [];
  const twice: number[] = [];
  let mirrored = false;
  for (const c of visits) {
    if (mirrorAt(c) !== 0) {
      mirrored = true;
      continue;
    }
    if (!all.includes(c)) all.push(c);
    if (!mirrored) direct.push(c);
    else if (!bent.includes(c)) bent.push(c);
    else twice.push(c);
  }
  return { all, direct, bent, twice, exit };
}

/** Each board's sightlines, by the mirrors dealt: a clue list is never
 * changed once made. */
const sightCache = new WeakMap<
  ClueList,
  { sp: GridSpace; sets: readonly SightSets[] }
>();

/** Every slot's {@link SightSets}, the mirrors the clues `mirrors` deal
 * (1 `\`, 2 `/`), traced once a board. */
export function sights(sp: GridSpace, mirrors: ClueList): readonly SightSets[] {
  const kept = sightCache.get(mirrors);
  if (kept !== undefined && kept.sp === sp) return kept.sets;
  const mirrorAt = (c: number): number => Math.max(0, mirrors.valueAt[c]);
  const sets = sp.slots.map((s) => sightSets(sp, s, mirrorAt));
  sightCache.set(mirrors, { sp, sets });
  return sets;
}

/** The value a cell holds where it deflects a beam. */
const DEFLECTS = 1;

/** `beam(s)` on the marks: where the beam from slot `s` goes, `-1` where a
 * cell no value is placed in decides it; with `c` and `v`, as if `c` held
 * `v`. */
export function beam(sp: GridSpace, b: Marks, s: number, c = -1, v = 0): number {
  const r = traceBeam(sp, s, (d) =>
    d === c ? v === DEFLECTS : b.known(d) ? b.value(d) === DEFLECTS : null,
  );
  return r < 0 ? -1 : r;
}

/** `ahead(s)`: the first cell the beam from slot `s` looks at that decides
 * where it goes and holds no value, or `-1`. */
export function ahead(sp: GridSpace, b: Marks, s: number): number {
  const r = traceBeam(sp, s, (d) => (b.known(d) ? b.value(d) === DEFLECTS : null));
  return r < 0 ? ~r : -1;
}

/** `beam(s)` in an answer `g`. */
export function beamOf(sp: GridSpace, g: ArrayLike<number>, s: number): number {
  return traceBeam(sp, s, (d) => g[d] === DEFLECTS);
}

const balls = new WeakMap<GridSpace, (readonly (readonly number[])[])[]>();
/** The space asked last and its balls by distance: a technique asks of one
 * space many times a pass, so this saves the two lookups a call. */
let lastSpace: GridSpace | null = null;
let lastBalls: (readonly (readonly number[])[])[] = [];

/** `within(c, r)`: the cells at most `r` king's moves from `c`, `c` among
 * them, in reading order. Built once a space and distance, since a technique
 * asks it of every cell it binds. */
export function within(sp: GridSpace, c: number, r: number): readonly number[] {
  if (sp !== lastSpace) {
    let bySpace = balls.get(sp);
    if (bySpace === undefined) {
      bySpace = [];
      balls.set(sp, bySpace);
    }
    lastSpace = sp;
    lastBalls = bySpace;
  }
  const bySpace = lastBalls;
  let ball = bySpace[r];
  if (ball === undefined) {
    const { w, h } = sp;
    ball = sp.cells.map((a) => {
      const ax = a % w;
      const ay = (a / w) | 0;
      const out: number[] = [];
      for (let y = Math.max(0, ay - r); y <= Math.min(h - 1, ay + r); y++)
        for (let x = Math.max(0, ax - r); x <= Math.min(w - 1, ax + r); x++)
          out.push(y * w + x);
      return out;
    });
    bySpace[r] = ball;
  }
  return ball[c] ?? [];
}

// --- definitions kept --------------------------------------------------------

/** A definition's values, by its argument: a sparse array, an argument not
 * yet read a hole. */
export type Kept<T> = T[];

/** Where one definition keeps its values: for each marks object or board it
 * is read on. */
export interface KeptStore<T> {
  /** The values kept for the marks `b`, emptied once a value has been
   * placed since, which is the one change to what a kept definition reads. A
   * marks object reads one board, so the board needs no key of its own. */
  marks(b: Marks): Kept<T>;
  /** The cells whose value on the marks `b` is `t`, in reading order: an
   * index of every cell's value, `of` reading each, made once a placement. */
  valued(
    b: Marks,
    of: (x: number) => T,
    cells: readonly number[],
    t: T,
  ): readonly number[];
  /** The values kept for the board `on` (its dealt clues, or its space where
   * it reads none), for as long as the board is: the definition reads
   * nothing a placement changes. */
  board(on: object): Kept<T>;
}

/** A store of one definition's values, which the compiled module makes once
 * for it. */
export function keptStore<T>(): KeptStore<T> {
  interface Held {
    placed: number;
    kept: Kept<T>;
    index: Map<T, number[]> | null;
  }
  const byMarks = new WeakMap<Marks, Held>();
  const byBoard = new WeakMap<object, Kept<T>>();
  const none: readonly number[] = [];
  // A run reads one marks object, or one board, many times over, so the last
  // one read is looked at first.
  let lastMarks: Marks | null = null;
  let last: Held = { placed: -1, kept: [], index: null };
  let lastBoard: object | null = null;
  let lastOfBoard: Kept<T> = [];
  const held = (b: Marks): Held => {
    if (b === lastMarks && b.placed === last.placed) return last;
    let at = byMarks.get(b);
    if (at === undefined || at.placed !== b.placed) {
      at = { placed: b.placed, kept: [], index: null };
      byMarks.set(b, at);
    }
    lastMarks = b;
    last = at;
    return at;
  };
  return {
    marks: (b) => held(b).kept,
    valued(b, of, cells, t) {
      const at = held(b);
      if (at.index === null) {
        const index = new Map<T, number[]>();
        for (const x of cells) {
          const v = of(x);
          const list = index.get(v);
          if (list === undefined) index.set(v, [x]);
          else list.push(x);
        }
        at.index = index;
      }
      return at.index.get(t) ?? none;
    },
    board(on) {
      if (on === lastBoard) return lastOfBoard;
      let kept = byBoard.get(on);
      if (kept === undefined) {
        kept = [];
        byBoard.set(on, kept);
      }
      lastBoard = on;
      lastOfBoard = kept;
      return kept;
    },
  };
}

const placedValues = keptStore<number>();

/** `{x in cells where value(x) = t}` on the marks `b`: the cells holding `t`,
 * `-1` for those holding none, in order, read off an index of every cell's
 * value made once a placement rather than a scan for each `t`. */
export function cellsValued(
  b: Marks,
  cells: readonly number[],
  t: number,
): readonly number[] {
  return placedValues.valued(b, (x) => b.grid[x] || -1, cells, t);
}

// --- rectangles --------------------------------------------------------------

/** The rectangle whose top left cell is `a` and bottom right `b`. */
const rectOf = (sp: GridSpace, a: number, b: number): number => a * sp.cells.length + b;
const topLeft = (sp: GridSpace, r: number): number => Math.floor(r / sp.cells.length);
const bottomRight = (sp: GridSpace, r: number): number => r % sp.cells.length;

/** Each space's rectangles by the cell they hold and their size, built at the
 * first read of each. */
const rectLists = new WeakMap<GridSpace, Map<number, readonly number[]>>();

/**
 * `rects(c, n)`: the rectangles on the grid that hold cell `c`, of `n` cells,
 * or of any number where `n` is 0: by width, then height, then from the
 * top, then from the left, as the game has always tried them.
 */
export function rectsOf(sp: GridSpace, c: number, n: number): readonly number[] {
  let bySpace = rectLists.get(sp);
  if (bySpace === undefined) {
    bySpace = new Map();
    rectLists.set(sp, bySpace);
  }
  const key = c * (sp.cells.length + 1) + n;
  let list = bySpace.get(key);
  if (list === undefined) {
    const { w, h } = sp;
    const cx = c % w;
    const cy = (c / w) | 0;
    const out: number[] = [];
    for (let rw = 1; rw <= w; rw++)
      for (let rh = 1; rh <= h; rh++) {
        if (n > 0 && rw * rh !== n) continue;
        for (let y = Math.max(0, cy - rh + 1); y <= cy && y + rh <= h; y++)
          for (let x = Math.max(0, cx - rw + 1); x <= cx && x + rw <= w; x++)
            out.push(rectOf(sp, y * w + x, (y + rh - 1) * w + x + rw - 1));
      }
    list = out;
    bySpace.set(key, list);
  }
  return list;
}

/** `width(r)`, the columns the rectangle spans. */
export function rectWidth(sp: GridSpace, r: number): number {
  return (bottomRight(sp, r) % sp.w) - (topLeft(sp, r) % sp.w) + 1;
}

/** `height(r)`, the rows the rectangle spans. */
export function rectHeight(sp: GridSpace, r: number): number {
  return ((bottomRight(sp, r) / sp.w) | 0) - ((topLeft(sp, r) / sp.w) | 0) + 1;
}

/** `c in cells(r)`, without listing them. */
export function rectHolds(sp: GridSpace, r: number, c: number): boolean {
  const a = topLeft(sp, r);
  const b = bottomRight(sp, r);
  const x = c % sp.w;
  const y = (c / sp.w) | 0;
  return (
    x >= a % sp.w && x <= b % sp.w && y >= ((a / sp.w) | 0) && y <= ((b / sp.w) | 0)
  );
}

/** `exists x in cells(r): x in cells(s)`, from the sides alone. */
export function rectMeets(sp: GridSpace, r: number, s: number): boolean {
  const { w } = sp;
  const a = topLeft(sp, r);
  const b = bottomRight(sp, r);
  const c = topLeft(sp, s);
  const d = bottomRight(sp, s);
  return (
    a % w <= d % w &&
    c % w <= b % w &&
    ((a / w) | 0) <= ((d / w) | 0) &&
    ((c / w) | 0) <= ((b / w) | 0)
  );
}

/** `forall x in cells(r): x in cells(s)`, from the sides alone. */
export function rectWithin(sp: GridSpace, r: number, s: number): boolean {
  return rectHolds(sp, s, topLeft(sp, r)) && rectHolds(sp, s, bottomRight(sp, r));
}

/** Each space's lists of a rectangle's cells, inner edges and rim, by the
 * rectangle, sparse: a ladder reads the same few rectangles' lists on every
 * pass. */
type RectParts = (readonly number[])[][];
const rectParts = new WeakMap<GridSpace, RectParts>();
let lastPartsSpace: GridSpace | null = null;
let lastParts: RectParts = [];

function keptPart(
  sp: GridSpace,
  part: number,
  r: number,
  make: (sp: GridSpace, r: number) => readonly number[],
): readonly number[] {
  if (sp !== lastPartsSpace) {
    let parts = rectParts.get(sp);
    if (parts === undefined) {
      parts = [[], [], []];
      rectParts.set(sp, parts);
    }
    lastPartsSpace = sp;
    lastParts = parts;
  }
  const kept = lastParts[part];
  if (kept[r] === undefined) kept[r] = make(sp, r);
  return kept[r];
}

/** `cells(r)`, in reading order. */
export function rectCells(sp: GridSpace, r: number): readonly number[] {
  return keptPart(sp, 0, r, cellsOfRect);
}

/** `inner(r)`: the edges between two of the rectangle's cells, in the
 * space's order. */
export function rectInner(sp: GridSpace, r: number): readonly number[] {
  return keptPart(sp, 1, r, innerOfRect);
}

/** `rim(r)`: the edges between one of the rectangle's cells and a cell
 * outside it, in the space's order. */
export function rectRim(sp: GridSpace, r: number): readonly number[] {
  return keptPart(sp, 2, r, rimOfRect);
}

function cellsOfRect(sp: GridSpace, r: number): readonly number[] {
  const a = topLeft(sp, r);
  const b = bottomRight(sp, r);
  const out: number[] = [];
  for (let y = (a / sp.w) | 0; y <= ((b / sp.w) | 0); y++)
    for (let x = a % sp.w; x <= b % sp.w; x++) out.push(y * sp.w + x);
  return out;
}

function innerOfRect(sp: GridSpace, r: number): readonly number[] {
  const a = topLeft(sp, r);
  const b = bottomRight(sp, r);
  const out: number[] = [];
  for (let y = (a / sp.w) | 0; y <= ((b / sp.w) | 0); y++)
    for (let x = a % sp.w; x <= b % sp.w; x++) {
      const c = y * sp.w + x;
      if (x < b % sp.w) out.push(sp.edgeOf(c, c + 1));
      if (y < ((b / sp.w) | 0)) out.push(sp.edgeOf(c, c + sp.w));
    }
  return out;
}

function rimOfRect(sp: GridSpace, r: number): readonly number[] {
  const { w, h } = sp;
  const a = topLeft(sp, r);
  const b = bottomRight(sp, r);
  const x0 = a % w;
  const y0 = (a / w) | 0;
  const x1 = b % w;
  const y1 = (b / w) | 0;
  const out: number[] = [];
  for (let y = y0 - 1; y <= y1; y++)
    for (let x = x0 - 1; x <= x1; x++) {
      if (x < 0 || y < 0) continue;
      const c = y * w + x;
      // The edge on the cell's right, then the one below it, each across
      // the rectangle's side.
      if (y >= y0 && x + 1 < w && (x === x0 - 1 || x === x1))
        out.push(sp.edgeOf(c, c + 1));
      if (x >= x0 && y + 1 < h && (y === y0 - 1 || y === y1))
        out.push(sp.edgeOf(c, c + w));
    }
  return out;
}

const faceLists: number[][] = [];

/** `faces`, on a board with `n` of them: each numbered, in order. */
export function facesOf(n: number): readonly number[] {
  faceLists[n] ??= Array.from({ length: n }, (_, f) => f);
  return faceLists[n];
}

/** `range(a, b)` as a set of values. */
export function rangeMask(a: number, b: number): number {
  if (a > b) return 0;
  // Bits a to b at once, where both are places of a 32-bit mask.
  if (a >= 0 && b < 30) return (2 << b) - (1 << a);
  let m = 0;
  for (let d = a; d <= b; d++) m |= 1 << d;
  return m;
}
