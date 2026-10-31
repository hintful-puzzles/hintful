/**
 * What a compiled technique reads: the grid's elements numbered, the marks,
 * and the dealt clues. `compile.ts` writes code against these and nothing
 * else, so these are the whole of a technique's view of a board.
 *
 * An element is its index: a cell `y·w + x`, a line its row `y`, `h + x`
 * for a column, and after the columns a space's boxes and then its
 * diagonals, an edge its place in {@link GridSpace.edgeEnds}, a corner
 * `y·(w − 1) + x` for the one below and right of cell `(x, y)`, a region
 * its part's index in its {@link Partition}. `-1` is
 * `none`, for an element and for a value alike, since no value is negative.
 * A set of values is a bitmask (bit `d`); a set of elements an ordered array.
 */

/** The marks a technique reads. */
export interface Marks {
  /** Every value of the answer's domain, as a bitmask. */
  readonly domain: number;
  /** How many times `d` appears in each unit: `times(d)`. */
  multiplicity(d: number): number;
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
}

/** One firing's facts, three numbers each: {@link STRIKE} or {@link PLACE},
 * the cell, the value. */
export type Facts = readonly number[];
export const STRIKE = 0;
export const PLACE = 1;

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
  /** A Sudoku's boxes, as lines: the parts of the partition its description
   * lists among its units. None on a Latin square. */
  readonly boxes: readonly number[];
  /** The two diagonals, as lines, where the description has them: the main
   * one, then the other, each top to bottom. */
  readonly diagonals: readonly number[];
  /** The lines no value repeats in. */
  readonly units: readonly number[];
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
   * as the Latin engine has always visited them; where there are boxes, in
   * reading order, as Solo always has.
   */
  readonly peers: readonly (readonly number[])[];
  /** Up, right, down, left, those on the grid. */
  readonly adj4: readonly (readonly number[])[];
  /** Two cells an edge, in reading order of the first, its right edge before
   * its lower. */
  readonly edgeEnds: Int32Array;
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
}

const spaces = new Map<number, GridSpace>();

/** The `o × o` Latin grid: its units are its rows and columns. */
export function latinSpace(o: number): GridSpace {
  let sp = spaces.get(o);
  if (sp === undefined) {
    sp = gridSpace(o, o);
    spaces.set(o, sp);
  }
  return sp;
}

const sudokus = new WeakMap<readonly (readonly number[])[], GridSpace[]>();

/**
 * The Sudoku grid whose boxes hold `boxCells`, with its two diagonals as
 * units too where `diagonals` is set. Its units are the boxes, then the rows,
 * then the columns, then the diagonals: the order Solo has always scanned
 * them in. Kept for the life of `boxCells`, which a board shares across every
 * solve of it.
 */
export function sudokuSpace(
  boxCells: readonly (readonly number[])[],
  diagonals: boolean,
): GridSpace {
  let both = sudokus.get(boxCells);
  if (both === undefined) {
    both = [];
    sudokus.set(boxCells, both);
  }
  const at = diagonals ? 1 : 0;
  both[at] ??= gridSpace(boxCells.length, boxCells.length, boxCells, diagonals);
  return both[at];
}

function gridSpace(
  w: number,
  h: number,
  boxCells: readonly (readonly number[])[] = [],
  hasDiagonals = false,
): GridSpace {
  const n = w * h;
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
  const units = boxes.length > 0 ? [...boxes, ...lines, ...diagonals] : lines;
  const rowOf = new Int32Array(n);
  const colOf = new Int32Array(n);
  const boxOf = new Int32Array(n).fill(-1);
  for (const L of boxes) for (const c of lineCells[L]) boxOf[c] = L;
  const peers: number[][] = [];
  const adj4: number[][] = [];
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
  const opposite = Int32Array.from(sight, (_, s) =>
    s < 2 * w ? (s < w ? s + w : s - w) : s < 2 * w + h ? s + h : s - h,
  );
  if (boxes.length > 0) {
    const unitsOf = cells.map((c) => units.filter((L) => lineCells[L].includes(c)));
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
    lineCells,
    rowOf,
    colOf,
    boxOf,
    peers,
    adj4,
    edgeEnds: Int32Array.from(ends),
    edgeOf(a, b) {
      if (a > b) return this.edgeOf(b, a);
      if (b === a + 1 && a % w !== w - 1) return right[a];
      if (b === a + w) return down[a];
      return -1;
    },
    slots: sight.map((_, s) => s),
    sight,
    opposite,
    corners,
    cornerCells,
    cellCorners,
  };
}

// --- what the generated code calls for its set algebra -------------------

/** The members of a set of values, counted in a fixed number of steps, as
 * compiled code counts a subset many times a scan. */
export function popcount(m: number): number {
  let v = m - ((m >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (Math.imul((v + (v >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24) & 0xff;
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

/** `range(a, b)` as a set of values. */
export function rangeMask(a: number, b: number): number {
  if (a > b) return 0;
  // Bits a to b at once, where both are places of a 32-bit mask.
  if (a >= 0 && b < 30) return (2 << b) - (1 << a);
  let m = 0;
  for (let d = a; d <= b; d++) m |= 1 << d;
  return m;
}
