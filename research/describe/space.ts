/**
 * The library's spaces (`language.md` § "The library"), as the elements and
 * relations an instance's formulas read.
 *
 * An element is an interned object, so two references to one cell are `===`
 * and a set of elements is an array compared by membership.
 */

export interface Elem {
  readonly sort: string;
  readonly id: number;
  readonly label: string;
}

export type Value = number | boolean | Elem | Value[] | null;

export function isElem(v: Value): v is Elem {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function asSet(v: Value, what: string): Value[] {
  if (!Array.isArray(v)) throw new TypeError(`${what}: expected a set, got ${show(v)}`);
  return v;
}

export function asNum(v: Value, what: string): number {
  if (typeof v !== "number")
    throw new TypeError(`${what}: expected a number, got ${show(v)}`);
  return v;
}

export function asElem(v: Value, what: string): Elem {
  if (!isElem(v)) throw new TypeError(`${what}: expected an element, got ${show(v)}`);
  return v;
}

export function show(v: Value): string {
  if (v === null) return "none";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `{${v.map(show).join(", ")}}`;
  return v.label;
}

export function same(a: Value, b: Value): boolean {
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((x) => b.some((y) => same(x, y)));
  return a === b;
}

export function member(x: Value, s: Value[]): boolean {
  return s.some((y) => same(x, y));
}

/** What a space gives an instance: named sets, and functions of elements. */
export interface Space {
  readonly names: Map<string, Value>;
  readonly fns: Map<string, (args: Value[]) => Value>;
  /** Every cell, in index order: the answer's domain of definition. */
  readonly cells: Elem[];
}

export interface SpaceSpec {
  grid: { w: number; h: number };
  /** One slot outside each end of every row and column (Towers' clues). */
  slots?: boolean;
  /** The orthogonal pairs, as `edge` elements. */
  edges?: boolean;
  /** The points inside the grid where four cells meet (Mathrax's clues). */
  corners?: boolean;
  /** The two diagonals of a square grid, as lines (Solo's X). */
  diagonals?: boolean;
  /** Named partitions of the cells: each part's cell indices. A partition the
   * library builds, as `blocks(rw, rh)`, arrives here already built. */
  regions?: Record<string, number[][]>;
  /** The named sets of lines and regions in which no value repeats, which
   * `units`, `units_of` and `peers` read. */
  units: string[];
}

export function buildSpace(spec: SpaceSpec): Space {
  const { w, h } = spec.grid;
  const names = new Map<string, Value>();
  const fns = new Map<string, (args: Value[]) => Value>();
  const cells: Elem[] = [];
  const pos = new Map<Elem, { x: number; y: number }>();
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const c: Elem = { sort: "cell", id: y * w + x, label: `(${x},${y})` };
      cells.push(c);
      pos.set(c, { x, y });
    }
  const at = (x: number, y: number): Elem | null =>
    x >= 0 && y >= 0 && x < w && y < h ? cells[y * w + x] : null;
  const where = (v: Value): { x: number; y: number } => {
    const p = pos.get(asElem(v, "cell"));
    if (p === undefined) throw new TypeError(`not a cell: ${show(v)}`);
    return p;
  };

  // A line is an element too (a row can be bound and named), and its cells
  // are an ordered list read by `cells(L)`.
  const lineCells = new Map<Elem, Elem[]>();
  const line = (sort: string, id: number, label: string, cs: Elem[]): Elem => {
    const L: Elem = { sort, id, label };
    lineCells.set(L, cs);
    return L;
  };
  const rows: Elem[] = [];
  const cols: Elem[] = [];
  for (let y = 0; y < h; y++)
    rows.push(line("row", y, `row ${y}`, cells.slice(y * w, (y + 1) * w)));
  for (let x = 0; x < w; x++)
    cols.push(
      line(
        "col",
        x,
        `column ${x}`,
        cells.filter((c) => where(c).x === x),
      ),
    );
  const rowOf = (c: Value): Elem => rows[where(c).y];
  const colOf = (c: Value): Elem => cols[where(c).x];

  names.set("cells", cells);
  names.set("rows", rows);
  names.set("cols", cols);
  names.set("w", w);
  names.set("h", h);
  fns.set("x", ([c]) => where(c).x);
  fns.set("y", ([c]) => where(c).y);
  fns.set("cell", ([x, y]) => at(asNum(x, "x"), asNum(y, "y")));
  fns.set("row", ([c]) => rowOf(c));
  fns.set("col", ([c]) => colOf(c));
  fns.set("adj4", ([c]) => {
    const { x, y } = where(c);
    return [at(x, y - 1), at(x + 1, y), at(x, y + 1), at(x - 1, y)].filter(
      (n): n is Elem => n !== null,
    );
  });

  if (spec.diagonals) {
    const main = line(
      "diagonal",
      0,
      "the main diagonal",
      rows.map((_, i) => cells[i * w + i]),
    );
    const anti = line(
      "diagonal",
      1,
      "the anti-diagonal",
      rows.map((_, i) => cells[i * w + (w - 1 - i)]),
    );
    names.set("diagonals", [main, anti]);
  }
  for (const [name, parts] of Object.entries(spec.regions ?? {})) {
    const rs = parts.map((p, i) =>
      line(
        name,
        i,
        `${name} ${i}`,
        p.map((j) => cells[j]),
      ),
    );
    names.set(name, rs);
  }
  names.set("lines", [...rows, ...cols]);

  if (spec.slots) {
    // Slots in Towers' clue order: top, bottom, left, right; each sees its
    // line from its own end.
    const slots: Elem[] = [];
    const sees = new Map<Elem, Elem[]>();
    const add = (label: string, cs: Elem[]) => {
      const s: Elem = { sort: "slot", id: slots.length, label };
      slots.push(s);
      sees.set(s, cs);
    };
    for (let x = 0; x < w; x++) add(`above column ${x}`, lineCells.get(cols[x]) ?? []);
    for (let x = 0; x < w; x++)
      add(`below column ${x}`, [...(lineCells.get(cols[x]) ?? [])].reverse());
    for (let y = 0; y < h; y++) add(`left of row ${y}`, lineCells.get(rows[y]) ?? []);
    for (let y = 0; y < h; y++)
      add(`right of row ${y}`, [...(lineCells.get(rows[y]) ?? [])].reverse());
    names.set("slots", slots);
    fns.set("sight", ([s]) => sees.get(asElem(s, "slot")) ?? []);
    // The slot at the other end of a slot's line.
    fns.set("opposite", ([s]) => {
      const i = asElem(s, "slot").id;
      const n = slots.length / 4;
      return slots[i % (2 * n) < n ? i + n : i - n];
    });
  }

  if (spec.edges) {
    const edges: Elem[] = [];
    const ends = new Map<Elem, [Elem, Elem]>();
    for (const c of cells) {
      const { x, y } = where(c);
      for (const n of [at(x + 1, y), at(x, y + 1)]) {
        if (n === null) continue;
        const e: Elem = {
          sort: "edge",
          id: edges.length,
          label: `${c.label}-${n.label}`,
        };
        edges.push(e);
        ends.set(e, [c, n]);
      }
    }
    names.set("edges", edges);
    const endsOf = (e: Value): [Elem, Elem] => {
      const p = ends.get(asElem(e, "edge"));
      if (p === undefined) throw new TypeError(`not an edge: ${show(e)}`);
      return p;
    };
    fns.set("ends", ([e]) => endsOf(e));
    fns.set("end1", ([e]) => endsOf(e)[0]);
    fns.set("end2", ([e]) => endsOf(e)[1]);
    fns.set("other", ([e, c]) => {
      const [a, b] = endsOf(e);
      return c === a ? b : a;
    });
    fns.set(
      "edge",
      ([a, b]) =>
        edges.find((e) => {
          const [p, q] = endsOf(e);
          return (p === a && q === b) || (p === b && q === a);
        }) ?? null,
    );
  }

  if (spec.corners) {
    // In reading order, each the corner below and right of cell (x, y), its
    // cells in reading order; a cell's are read below right, above right,
    // below left, above left, as the compiled code reads them.
    const corners: Elem[] = [];
    const cornerAt = new Map<string, Elem>();
    for (let y = 0; y + 1 < h; y++)
      for (let x = 0; x + 1 < w; x++) {
        const k = line("corner", corners.length, `corner (${x},${y})`, [
          cells[y * w + x],
          cells[y * w + x + 1],
          cells[(y + 1) * w + x],
          cells[(y + 1) * w + x + 1],
        ]);
        corners.push(k);
        cornerAt.set(`${x},${y}`, k);
      }
    names.set("corners", corners);
    fns.set("corners", ([c]) => {
      const { x, y } = where(c);
      return [
        [x, y],
        [x, y - 1],
        [x - 1, y],
        [x - 1, y - 1],
      ].flatMap(([kx, ky]) => cornerAt.get(`${kx},${ky}`) ?? []);
    });
    fns.set("across", ([k, c]) => {
      const cs = lineCells.get(asElem(k, "corner")) ?? [];
      const i = cs.indexOf(asElem(c, "cell"));
      if (i < 0) throw new TypeError(`${show(c)} is not at ${show(k)}`);
      return cs[3 - i];
    });
  }

  const units: Elem[] = spec.units.flatMap((n) => {
    const v = names.get(n);
    if (!Array.isArray(v)) throw new TypeError(`no such set of units: ${n}`);
    return v.filter(isElem);
  });
  names.set("units", units);
  fns.set("cells", ([L]) => {
    const cs = lineCells.get(asElem(L, "line or region"));
    if (cs === undefined) throw new TypeError(`no cells: ${show(L)}`);
    return cs;
  });
  // The units a cell is in, and the cells that share a unit with it.
  const unitsOf = new Map<Elem, Elem[]>();
  for (const u of units)
    for (const c of lineCells.get(u) ?? [])
      unitsOf.set(c, [...(unitsOf.get(c) ?? []), u]);
  fns.set("units_of", ([c]) => unitsOf.get(asElem(c, "cell")) ?? []);
  // A cell's row and column interleaved by index, the row's first at each, as
  // the Latin engine visits them (`src/engine/describe-runtime.ts`), then the cells
  // of its other units in their order.
  const peers = new Map<Elem, Elem[]>();
  for (const c of cells) {
    const { x, y } = where(c);
    const ps = new Set<Elem>();
    for (let i = 0; i < Math.max(w, h); i++) {
      if (i < w && i !== x && units.includes(rows[y])) ps.add(cells[y * w + i]);
      if (i < h && i !== y && units.includes(cols[x])) ps.add(cells[i * w + x]);
    }
    for (const u of unitsOf.get(c) ?? [])
      for (const d of lineCells.get(u) ?? []) if (d !== c) ps.add(d);
    peers.set(c, [...ps]);
  }
  fns.set("peers", ([c]) => peers.get(asElem(c, "cell")) ?? []);

  return { names, fns, cells };
}

/** `blocks(rw, rh)`: an `n × n` board, `n = rw·rh`, cut into `rw × rh`
 * rectangles, as cell indices in reading order. */
export function blocks(rw: number, rh: number): number[][] {
  const n = rw * rh;
  const out: number[][] = [];
  for (let by = 0; by < rw; by++)
    for (let bx = 0; bx < rh; bx++) {
      const part: number[] = [];
      for (let y = by * rh; y < (by + 1) * rh; y++)
        for (let x = bx * rw; x < (bx + 1) * rw; x++) part.push(y * n + x);
      out.push(part);
    }
  return out;
}
