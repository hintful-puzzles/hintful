/**
 * Spaces, marks and answers on a board: the library's grid relations, and
 * dealt regions as variables so that a check covers every way of dealing them.
 */
import {
  type B,
  Connected,
  Dict,
  dictOf,
  type I,
  ite,
  type Node,
  type SetLike,
  show,
  sum,
  tup,
  where,
  Z3,
} from "./pzl.ts";

export type Cell = readonly [number, number];
export type Dir = readonly [number, number];

export function cell(x: number, y: number): Cell {
  return tup(x, y);
}

export const DIRS4: readonly Dir[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
export const DIRS8: readonly Dir[] = [...DIRS4, [1, 1], [1, -1], [-1, 1], [-1, -1]];
export const KNIGHT: readonly Dir[] = [
  [1, 2],
  [2, 1],
].flatMap(([a, b]) => [
  [a, b],
  [a, -b],
  [-a, b],
  [-a, -b],
]) as Dir[];

export class Grid {
  readonly cells: Cell[];
  readonly rows: Cell[][];
  readonly cols: Cell[][];
  readonly adj4: Dict<Cell, Cell[]>;
  readonly adj8: Dict<Cell, Cell[]>;

  constructor(
    readonly w: number,
    readonly h: number,
    readonly wrap = false,
  ) {
    this.cells = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) this.cells.push(cell(x, y));
    this.rows = [];
    for (let y = 0; y < h; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < w; x++) row.push(cell(x, y));
      this.rows.push(row);
    }
    this.cols = [];
    for (let x = 0; x < w; x++) {
      const col: Cell[] = [];
      for (let y = 0; y < h; y++) col.push(cell(x, y));
      this.cols.push(col);
    }
    this.adj4 = this.neighbors(DIRS4);
    this.adj8 = this.neighbors(DIRS8);
  }

  at(x: number, y: number): Cell | null {
    if (this.wrap) return cell(mod(x, this.w), mod(y, this.h));
    return x >= 0 && x < this.w && y >= 0 && y < this.h ? cell(x, y) : null;
  }

  neighbors(dirs: readonly Dir[]): Dict<Cell, Cell[]> {
    return dictOf(this.cells, (c) => {
      const ns: Cell[] = [];
      for (const [dx, dy] of dirs) {
        const n = this.at(c[0] + dx, c[1] + dy);
        if (n !== null && n !== c && !ns.includes(n)) ns.push(n);
      }
      return ns;
    });
  }

  /** The cells from c's neighbor in direction d to the edge, in order. */
  ray(c: Cell, d: Dir): Cell[] {
    const out: Cell[] = [];
    let [x, y] = c;
    for (;;) {
      x += d[0];
      y += d[1];
      const n = this.at(x, y);
      if (n === null || n === c || out.includes(n)) return out;
      out.push(n);
    }
  }

  /** Every run of k consecutive cells along a row or column, both ways. */
  runs(k: number): Cell[][] {
    const out: Cell[][] = [];
    for (const line of [...this.rows, ...this.cols])
      for (const seq of [line, [...line].reverse()])
        for (let i = 0; i + k <= seq.length; i++) out.push(seq.slice(i, i + k));
    return out;
  }

  windows2(): Cell[][] {
    const out: Cell[][] = [];
    for (let y = 0; y < this.h - 1; y++)
      for (let x = 0; x < this.w - 1; x++)
        out.push([cell(x, y), cell(x + 1, y), cell(x, y + 1), cell(x + 1, y + 1)]);
    return out;
  }

  rim(c: Cell): boolean {
    const [x, y] = c;
    return x === 0 || x === this.w - 1 || y === 0 || y === this.h - 1;
  }
}

export function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

/**
 * A dealt partition of the cells into k connected regions, as variables:
 * `label[c]` is the region of c. A check over these covers every partition of
 * the board into k connected regions. `fixed` deals one instead.
 */
export class Regions {
  readonly ids: number[];
  readonly label: Dict<Cell, I>;

  constructor(
    readonly cells: Cell[],
    readonly adj: Dict<Cell, Cell[]>,
    readonly k: number,
    name = "reg",
    fixed: ReadonlyMap<Cell, number> | null = null,
    readonly sizes: number | null = null,
  ) {
    this.ids = [];
    for (let r = 0; r < k; r++) this.ids.push(r);
    this.label =
      fixed !== null
        ? dictOf(cells, (c) => Z3.Int.val(fixed.get(c) ?? -1))
        : dictOf(cells, (c) => Z3.Int.const(`${name}_${show(c)}`));
  }

  cellsOf(r: number): Dict<Cell, B> {
    return dictOf(this.cells, (c) => this.label.at(c).eq(r));
  }

  wellformed(): B {
    const cs: B[] = this.cells.map((c) =>
      Z3.And(this.label.at(c).ge(0), this.label.at(c).lt(this.k)),
    );
    for (const r of this.ids) {
      const m = this.cellsOf(r);
      cs.push(Z3.Or(...m.values()));
      cs.push(Connected(m, this.adj).z(1));
      if (this.sizes !== null)
        cs.push(sum([...m.values()].map((g) => ite(g, 1, 0))).eq(this.sizes));
    }
    return Z3.And(...cs);
  }

  same(a: Cell, b: Cell): B {
    return this.label.at(a).eq(this.label.at(b));
  }
}

export interface Shading {
  value: Dict<Cell, I>;
  mark: Dict<Cell, I>;
  domain: B;
  consistent: B;
}

/** An answer cell -> {0 clear, 1 shaded}, and marks {0, 1, 2 unknown}
 * consistent with it. */
export function shading(cells: readonly Cell[], name = "value"): Shading {
  const value = dictOf(cells, (c) => Z3.Int.const(`${name}_${show(c)}`));
  const mark = dictOf(cells, (c) => Z3.Int.const(`mark_${show(c)}`));
  const domain = Z3.And(...[...value.values()].map((v) => Z3.And(v.ge(0), v.le(1))));
  const consistent = Z3.And(
    ...[...mark].map(([c, m]) =>
      Z3.And(m.ge(0), m.le(2), Z3.Implies(m.neq(2), m.eq(value.at(c)))),
    ),
  );
  return { value, mark, domain, consistent };
}

export interface Candidates {
  value: Dict<Cell, I>;
  cand: Dict<string, B>;
  domain: B;
  consistent: B;
}

/** The key of a cell's candidate, side or turning: cell c, number d. */
export function cd(c: Cell, d: number): string {
  return `${show(c)}_${d}`;
}

/** An answer cell -> digits, and candidate marks that never strike the
 * answer's digit. */
export function candidates(
  cells: readonly Cell[],
  digits: readonly number[],
  name = "value",
): Candidates {
  const value = dictOf(cells, (c) => Z3.Int.const(`${name}_${show(c)}`));
  const cand = new Dict<string, B>();
  for (const c of cells)
    for (const d of digits) cand.set(cd(c, d), Z3.Bool.const(`cand_${show(c)}_${d}`));
  const domain = Z3.And(
    ...cells.map((c) => Z3.Or(...digits.map((d) => value.at(c).eq(d)))),
  );
  const consistent = Z3.And(
    ...cells.flatMap((c) =>
      digits.map((d) => Z3.Implies(value.at(c).eq(d), cand.at(cd(c, d)))),
    ),
  );
  return { value, cand, domain, consistent };
}

export function known(mark: Dict<Cell, I>, c: Cell, v: number): B {
  return mark.at(c).eq(v);
}

export function shadedSet(
  value: Dict<Cell, I>,
  cells: readonly Cell[],
  v = 1,
): Dict<Cell, B> {
  return dictOf(cells, (c) => value.at(c).eq(v));
}

export function connectedWhere(
  value: Dict<Cell, I>,
  cells: SetLike<Cell>,
  adj: Dict<Cell, Cell[]>,
  v: number,
): Node {
  return Connected(
    where(cells, (c) => value.at(c).eq(v)),
    adj,
  );
}
