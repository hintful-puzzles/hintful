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
   * reads them in place. The methods below are what they give. */
  readonly grid: Uint8Array | Int8Array;
  readonly cands: Int32Array;
  /** The cells placed since the marks were last set wholesale, in order,
   * and a count of those settings: what a structure kept over the marks
   * catches up from, a placement at a time, as long as the epoch holds. */
  readonly log: readonly number[];
  readonly epoch: number;
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
}

/** One firing's facts, three numbers each: {@link STRIKE}, {@link PLACE},
 * {@link STRIKE_EDGE} or {@link MARK}, the cell or the edge, the value. */
export type Facts = readonly number[];
export const STRIKE = 0;
export const PLACE = 1;
/** A value struck from an edge's mark. */
export const STRIKE_EDGE = 2;
/** A cell marked with an element: the value is the element. */
export const MARK = 3;

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
export type Fire<B> = (binding: B, facts: Facts) => boolean;

/** A clue kind as dealt: the element each clue sits at and its value, by
 * clue index, and the clue at each element (`-1` where there is none). */
export interface ClueList {
  readonly at: Int32Array;
  readonly v: Int32Array;
  readonly byAt: Int32Array;
}

/** The clue list of `n` clues, over `elements` elements to sit at. */
export function clueList(
  at: readonly number[],
  v: readonly number[],
  elements: number,
): ClueList {
  const byAt = new Int32Array(elements).fill(-1);
  at.forEach((e, k) => {
    byAt[e] = k;
  });
  return { at: Int32Array.from(at), v: Int32Array.from(v), byAt };
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
  const k = x < 0 ? -1 : list.byAt[x];
  return k < 0 ? -1 : list.v[k];
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
  /** The eight around, clockwise from up, those on the grid. */
  readonly adj8: readonly (readonly number[])[];
  /** Two cells an edge, in reading order of the first, its right edge before
   * its lower. */
  readonly edgeEnds: Int32Array;
  /** Every edge, in that order. */
  readonly edges: readonly number[];
  /** The edge between two orthogonal neighbors, or `-1`. */
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
): GridSpace {
  const key = `${units.join(",")} ${w} ${h}`;
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
    sp = gridSpace(units, w, h, parts);
    cache.set(key, sp);
  }
  return sp;
}

/** The `o × o` Latin grid: its units are its rows and columns. */
export function latinSpace(o: number): GridSpace {
  return describedSpace(["rows", "cols"], o, o);
}

function gridSpace(
  unitNames: readonly string[],
  w: number,
  h: number,
  boxCells: readonly (readonly number[])[],
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
    if (y + 1 < h) {
      down[c] = ends.length / 2;
      ends.push(c, c + w);
    }
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
    adj8,
    edgeEnds: Int32Array.from(ends),
    edges: Array.from({ length: ends.length / 2 }, (_, e) => e),
    // A division game reads an edge by its squares in every rung's inner
    // loop: `right` holds -1 at a row's end, and a grid one square wide has
    // its squares below one another 1 apart, so `w` is tried first.
    edgeOf(a, b) {
      const lo = a < b ? a : b;
      const gap = a < b ? b - a : a - b;
      if (gap === w) return down[lo];
      if (gap === 1) return right[lo];
      return -1;
    },
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
  for (const x of b) if (!out.includes(x)) out.push(x);
  return out;
}

/** `a - b` of element sets, in `a`'s order. */
export function minus(a: readonly number[], b: readonly number[]): number[] {
  return a.filter((x) => !b.includes(x));
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

/** The cells a chain has reached, by the walk that reached them. */
let reached = new Int32Array(0);
let walk = 0;

/**
 * `chain(c)`: `c` and the cells its value steps to ({@link step}), each from
 * the one before, ending at a cell whose value names no cell or one already
 * reached; in reading order, the order the soundness checker can give a set
 * the marks decide. `value` reads a cell's value, `-1` where it has none.
 */
export function chain(
  sp: GridSpace,
  value: (c: number) => number,
  c: number,
): readonly number[] {
  if (c < 0) return [];
  if (reached.length < sp.cells.length) reached = new Int32Array(sp.cells.length);
  if (++walk === 0x7fffffff) {
    reached.fill(0);
    walk = 1;
  }
  const out: number[] = [];
  for (let at = c; at >= 0 && reached[at] !== walk; at = step(sp, at, value(at))) {
    reached[at] = walk;
    out.push(at);
  }
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
  for (let i = 0; i < out.length; i++)
    for (const q of sp.adj4[out[i]]) {
      if (reached[q] === walk || !crossable[sp.edgeOf(out[i], q)]) continue;
      reached[q] = walk;
      out.push(q);
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
  for (let i = 0; i < out.length; i++)
    for (const q of sp.adj4[out[i]]) {
      if (reached[q] === mine || !crosses(sp.edgeOf(out[i], q))) continue;
      reached[q] = mine;
      out.push(q);
    }
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}

/** The cells joined across a set of edges: `of(c)` is `c`'s group in
 * reading order, one list that each of its cells reads, so a cell is in a
 * group exactly where `of` gives it that list. */
export interface EdgeGroups {
  of(c: number): readonly number[];
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
class EdgeGroupsKept {
  epoch = -1;
  read = 0;
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
    const merged = mergeSorted(g[sp.edgeEnds[2 * e]], g[sp.edgeEnds[2 * e + 1]]);
    for (const x of merged) g[x] = merged;
  }

  /** Join `group`'s squares afresh across the edges still in the set, where
   * one has left it: only its own squares can come apart, and their parents
   * all lie among them. */
  split(group: readonly number[]): void {
    const sp = this.sp as GridSpace;
    if (this.mine.length !== this.parent.length)
      this.mine = new Int32Array(this.parent.length);
    const mark = ++this.marked;
    for (const x of group) {
      this.parent[x] = x;
      this.mine[x] = mark;
    }
    for (const x of group)
      for (const q of sp.adj4[x])
        if (q > x && this.mine[q] === mark && this.in[sp.edgeOf(x, q)] === 1)
          this.parent[this.root(x)] = this.root(q);
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
    const changed = byEdge ? [0] : [0, 0, 0, 0];
    for (; this.read < log.length; this.read++) {
      const x = log[this.read];
      let n = 0;
      if (byEdge) changed[n++] = x;
      else for (const q of sp.adj4[x]) changed[n++] = sp.edgeOf(x, q);
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
    return { of: (c) => (c < 0 ? NO_CELLS : groupOf[c]) };
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
  /** The values kept for the board `on` (its dealt clues, or its space where
   * it reads none), for as long as the board is: the definition reads
   * nothing a placement changes. */
  board(on: object): Kept<T>;
}

/** A store of one definition's values, which the compiled module makes once
 * for it. */
export function keptStore<T>(): KeptStore<T> {
  const byMarks = new WeakMap<Marks, { placed: number; kept: Kept<T> }>();
  const byBoard = new WeakMap<object, Kept<T>>();
  // A run reads one marks object, or one board, many times over, so the last
  // one read is looked at first.
  let lastMarks: Marks | null = null;
  let lastPlaced = -1;
  let lastKept: Kept<T> = [];
  let lastBoard: object | null = null;
  let lastOfBoard: Kept<T> = [];
  return {
    marks(b) {
      if (b === lastMarks && b.placed === lastPlaced) return lastKept;
      let at = byMarks.get(b);
      if (at === undefined || at.placed !== b.placed) {
        at = { placed: b.placed, kept: [] };
        byMarks.set(b, at);
      }
      lastMarks = b;
      lastPlaced = b.placed;
      lastKept = at.kept;
      return at.kept;
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
