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
  /** The one value that appears more than once in each unit, or 0 where
   * none does, and how many times (1 where none does): `times(d)` is
   * `times` for `repeat` and 1 for every other value. Fields, not a method,
   * so a compiled read is two loads every Latin game can inline. */
  readonly repeat: number;
  readonly times: number;
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

/** `ray(c, n)`: the cells from `n` on, each a step from `c` to `n` further,
 * up to the grid's edge. */
export function ray(sp: GridSpace, c: number, n: number): number[] {
  const dx = (n % sp.w) - (c % sp.w);
  const dy = ((n / sp.w) | 0) - ((c / sp.w) | 0);
  const out: number[] = [];
  for (
    let x = n % sp.w, y = (n / sp.w) | 0;
    x >= 0 && x < sp.w && y >= 0 && y < sp.h;
    x += dx, y += dy
  )
    out.push(y * sp.w + x);
  return out;
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
