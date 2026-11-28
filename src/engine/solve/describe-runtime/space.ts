/** The grid a compiled technique reads: its elements numbered, its units
 * and partitions, a tiling's, and the cells near a cell
 * (`describe-runtime.ts`). */

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

/** The partition of the squares of a `w` by `h` grid whose parts are a
 * board's cells (a description's `space.parts`, Map's regions), and each
 * part's neighbors across a side, increasing (a corner does not count),
 * which a relation `sides` reads. */
export interface Squares extends Partition {
  readonly w: number;
  readonly h: number;
  readonly sides: readonly (readonly number[])[];
}

/** `p`, a partition of the squares of a `w` by `h` grid, with its parts'
 * sides. */
export function squares(p: Partition, w: number, h: number): Squares {
  const { of } = p;
  const near = Array.from({ length: p.cells.length }, () => new Set<number>());
  const join = (a: number, b: number): void => {
    if (of[a] === of[b]) return;
    near[of[a]].add(of[b]);
    near[of[b]].add(of[a]);
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const c = y * w + x;
      if (x + 1 < w) join(c, c + 1);
      if (y + 1 < h) join(c, c + w);
    }
  return { ...p, w, h, sides: near.map((s) => [...s].sort((a, b) => a - b)) };
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

/** A tiling's dots, edges and faces, as `engine/board/grid` makes them: each
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
let last: {
  units: readonly string[];
  w: number;
  h: number;
  parts: readonly (readonly number[])[];
  edges: EdgeGeometry;
  sp: GridSpace;
} | null = null;

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
  // A game asks again for its board's space on every move it checks, so the
  // last one asked for is looked at before a key is built.
  const l = last;
  if (
    l !== null &&
    l.units === units &&
    l.w === w &&
    l.h === h &&
    l.parts === parts &&
    l.edges === edges
  )
    return l.sp;
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
  last = { units, w, h, parts, edges, sp };
  return sp;
}

const blockings = new Map<string, readonly (readonly number[])[]>();

/**
 * `blocks(bw, bh)`, a description's partition of a square board `bw·bh`
 * cells wide into blocks `bw` wide and `bh` tall: each block's cells in
 * reading order, the blocks in reading order. One list a shape, since
 * {@link describedSpace} keeps a space for the life of its parts.
 */
export function blocks(bw: number, bh: number): readonly (readonly number[])[] {
  const key = `${bw}x${bh}`;
  const kept = blockings.get(key);
  if (kept !== undefined) return kept;
  const n = bw * bh;
  const out: number[][] = [];
  for (let by = 0; by < bw; by++)
    for (let bx = 0; bx < bh; bx++) {
      const part: number[] = [];
      for (let y = by * bh; y < (by + 1) * bh; y++)
        for (let x = bx * bw; x < (bx + 1) * bw; x++) part.push(y * n + x);
      out.push(part);
    }
  blockings.set(key, out);
  return out;
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
