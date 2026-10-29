/**
 * Group A's games over dealt regions. The regions are variables (`Regions`),
 * so a check covers every partition of the board into k connected regions; the
 * verifier reads the partition back with the answer. A region clue is one
 * variable a region, `rc[r]`, -1 for none.
 */
import {
  And,
  Atom,
  type B,
  Connected,
  type Dict,
  dictOf,
  type Elem,
  type Formula,
  type I,
  ite,
  lift,
  product,
  range,
  sum,
  Technique,
  type Verify,
  where,
  Z3,
} from "./pzl.ts";
import { comps, Game, type Marked, no2x2, oneComp, UNKNOWN } from "./shading.ts";
import { type Cell, cell, type Grid, Regions, shading } from "./space.ts";

export interface Regioned extends Marked {
  reg: Regions;
}

export interface RegionClued extends Regioned {
  rc: Dict<number, I>;
}

export function regionClues(
  reg: Regions,
  top: number,
): { rc: Dict<number, I>; dom: Formula } {
  const rc = dictOf(reg.ids, (r) => Z3.Int.const(`rc_${r}`));
  const dom = And(
    ...reg.ids.map((r) => Atom(Z3.And(rc.at(r).ge(-1), rc.at(r).le(top)))),
  );
  return { rc, dom };
}

/** The clue of c's region. */
export function rcOf(reg: Regions, rc: Dict<number, I>, c: Cell): I {
  let t: I = Z3.Int.val(-1);
  for (const r of reg.ids) t = Z3.If(reg.label.at(c).eq(r), rc.at(r), t);
  return t;
}

export function countIn(reg: Regions, r: number, cond: (c: Cell) => B | boolean): I {
  return sum(reg.cells.map((c) => ite(Z3.And(reg.label.at(c).eq(r), cond(c)), 1, 0)));
}

export function regionsOf(
  cells: readonly Cell[],
  lab: Dict<Elem, number>,
): Map<number, Cell[]> {
  const out = new Map<number, Cell[]>();
  for (const c of cells) {
    const r = lab.at(c);
    const cs = out.get(r) ?? [];
    cs.push(c);
    out.set(r, cs);
  }
  return out;
}

/** The partition the verifier reads back: k connected regions. */
export function regionsOk(g: Grid, lab: Dict<Elem, number>, k: number): boolean {
  const regs = regionsOf(g.cells, lab);
  return (
    regs.size === k &&
    [...regs.values()].every((cs) => {
      const s = new Set(cs);
      return comps(cs, g.adj4, (c) => s.has(c)).length === 1;
    })
  );
}

function base(g: Grid, k: number, sizes: number | null = null, name = "reg") {
  const reg = new Regions(g.cells, g.adj4, k, name, null, sizes);
  const { value, mark, domain, consistent } = shading(g.cells);
  const rules: Formula[] = [domain, Atom(reg.wellformed())];
  return { reg, value, mark, rules, consistent };
}

const shadedIn = (cs: readonly Cell[], v: Dict<Elem, number>) =>
  cs.reduce((t, c) => t + v.at(c), 0);

const noWindow = (g: Grid, value: Dict<Cell, I>): Formula =>
  And(
    ...g
      .windows2()
      .map((q) => Atom(Z3.Not(Z3.And(...q.map((c) => value.at(c).eq(1)))))),
  );

// --------------------------------------------------------------------- LITS

/** A shape up to rotation and reflection: the least of its 8 images. */
export function normalShape(cells: readonly Cell[]): string {
  let best: number[][] | null = null;
  for (const [fx, fy, sw] of product<number>([
    [1, -1],
    [1, -1],
    [0, 1],
  ])) {
    let pts = cells.map(([x, y]) => (sw ? [y, x] : [x, y]));
    pts = pts.map(([x, y]) => [x * fx, y * fy]);
    const mx = Math.min(...pts.map((p) => p[0]));
    const my = Math.min(...pts.map((p) => p[1]));
    const img = pts
      .map(([x, y]) => [x - mx, y - my])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (best === null || lessImage(img, best)) best = img;
  }
  return JSON.stringify(best);
}

function lessImage(a: number[][], b: number[][]): boolean {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const d = a[i][0] - b[i][0] || a[i][1] - b[i][1];
    if (d !== 0) return d < 0;
  }
  return a.length < b.length;
}

/** LITS (corpus 4): four shaded cells a region, connected; all shaded
 * connected; no 2x2 shaded; touching tetrominoes of two regions not alike.
 * The encoding leaves out the tetromino's own connectivity and `alike`; the
 * verifier holds them. */
export function lits(g: Grid, k: number): Game<Regioned> {
  const { reg, value, mark, rules, consistent } = base(g, k);
  rules.push(
    ...reg.ids.map((r) => Atom(countIn(reg, r, (c) => value.at(c).eq(1)).eq(4))),
  );
  rules.push(
    Connected(
      where(g.cells, (c) => value.at(c).eq(1)),
      g.adj4,
    ),
    noWindow(g, value),
  );

  const verify: Verify = (a) => {
    const v = a["value"];
    const lab = a["region"];
    if (
      !regionsOk(g, lab, k) ||
      !oneComp(g.cells, g.adj4, (c) => v.at(c) === 1) ||
      !no2x2(g, v, 1)
    )
      return false;
    const tet = new Map<number, string>();
    for (const [r, cs] of regionsOf(g.cells, lab)) {
      const sh = cs.filter((c) => v.at(c) === 1);
      const s = new Set(sh);
      if (sh.length !== 4 || !oneComp(sh, g.adj4, (c) => s.has(c))) return false;
      tet.set(r, normalShape(sh));
    }
    for (const c of g.cells)
      for (const d of g.adj4.at(c))
        if (
          v.at(c) === 1 &&
          v.at(d) === 1 &&
          lab.at(c) !== lab.at(d) &&
          tet.get(lab.at(c)) === tet.get(lab.at(d))
        )
          return false;
    return true;
  };

  return new Game("LITS", rules, consistent, { value, region: reg.label }, verify, {
    value,
    mark,
    reg,
  });
}

/** Norinori (corpus 5): two shaded cells a region; every shaded cell has
 * exactly one shaded neighbor. */
export function norinori(g: Grid, k: number): Game<Regioned> {
  const { reg, value, mark, rules, consistent } = base(g, k);
  rules.push(
    ...reg.ids.map((r) => Atom(countIn(reg, r, (c) => value.at(c).eq(1)).eq(2))),
  );
  rules.push(
    ...g.cells.map((c) =>
      Atom(
        Z3.Implies(value.at(c).eq(1), sum(g.adj4.at(c).map((d) => value.at(d))).eq(1)),
      ),
    ),
  );

  const verify: Verify = (a) => {
    const v = a["value"];
    const lab = a["region"];
    if (!regionsOk(g, lab, k)) return false;
    if ([...regionsOf(g.cells, lab).values()].some((cs) => shadedIn(cs, v) !== 2))
      return false;
    return g.cells.every((c) => v.at(c) === 0 || shadedIn(g.adj4.at(c), v) === 1);
  };

  return new Game("Norinori", rules, consistent, { value, region: reg.label }, verify, {
    value,
    mark,
    reg,
  });
}

/** LITS: a region with four cells left that are not clear has them all shaded
 * (a region holds four). */
export function litsFour(g: Grid, gm: Game<Regioned>): Technique {
  const { value, mark, reg } = gm.extra;
  return new Technique(
    "four",
    [["c", () => g.cells]],
    (e) =>
      lift(
        (c: Cell) =>
          Z3.And(
            mark.at(c).eq(UNKNOWN),
            sum(
              g.cells.map((x) =>
                ite(
                  Z3.And(reg.label.at(x).eq(reg.label.at(c)), mark.at(x).neq(0)),
                  1,
                  0,
                ),
              ),
            ).eq(4),
          ),
        e["c"],
      ),
    (e) => lift((c: Cell) => value.at(c).eq(1), e["c"]),
  );
}

/** Norinori: a shaded cell with a shaded neighbor has its other neighbors
 * clear. */
export function norinoriPair(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  return new Technique(
    "pair",
    [
      ["s", () => g.cells],
      ["t", () => g.cells],
      ["c", () => g.cells],
    ],
    (e) =>
      lift(
        (s: Cell, t: Cell, c: Cell) =>
          Z3.And(
            Z3.Bool.val(
              g.adj4.at(s).includes(t) && g.adj4.at(s).includes(c) && c !== t,
            ),
            mark.at(s).eq(1),
            mark.at(t).eq(1),
          ),
        e["s"],
        e["t"],
        e["c"],
      ),
    (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
  );
}

// -------------------------------------------------------- Heyawake and Hinge

/** Heyawake (corpus 3): no two shaded touch, clear connected, a room's clue
 * counts its shaded cells, and no run of clear cells crosses two room
 * borders. */
export function heyawake(g: Grid, k: number): Game<RegionClued> {
  const { reg, value, mark, rules, consistent } = base(g, k, null, "room");
  const { rc, dom: rdom } = regionClues(reg, g.cells.length);
  rules.push(
    rdom,
    Connected(
      where(g.cells, (c) => value.at(c).eq(0)),
      g.adj4,
    ),
  );
  rules.push(
    ...g.cells.flatMap((a) =>
      g.adj4
        .at(a)
        .map((b) => Atom(Z3.Not(Z3.And(value.at(a).eq(1), value.at(b).eq(1))))),
    ),
  );
  rules.push(
    ...reg.ids.map((r) =>
      Atom(
        Z3.Implies(
          rc.at(r).ge(0),
          countIn(reg, r, (c) => value.at(c).eq(1)).eq(rc.at(r)),
        ),
      ),
    ),
  );
  for (const L of [...g.rows, ...g.cols])
    for (let i = 0; i < L.length; i++)
      for (let j = i + 2; j < L.length; j++) {
        const run = Z3.And(...L.slice(i, j + 1).map((c) => value.at(c).eq(0)));
        const borders = sum(
          range(i, j).map((t) =>
            ite(reg.label.at(L[t]).neq(reg.label.at(L[t + 1])), 1, 0),
          ),
        );
        rules.push(Atom(Z3.Implies(run, borders.le(1))));
      }

  const verify: Verify = (a) => {
    const v = a["value"];
    const lab = a["region"];
    const cl = a["rc"];
    if (!regionsOk(g, lab, k) || !oneComp(g.cells, g.adj4, (c) => v.at(c) === 0))
      return false;
    if (g.cells.some((x) => g.adj4.at(x).some((y) => v.at(x) === 1 && v.at(y) === 1)))
      return false;
    for (const [r, cs] of regionsOf(g.cells, lab))
      if (cl.at(r) >= 0 && shadedIn(cs, v) !== cl.at(r)) return false;
    for (const L of [...g.rows, ...g.cols])
      for (let i = 0; i < L.length; i++)
        for (let j = i + 1; j < L.length; j++)
          if (L.slice(i, j + 1).every((c) => v.at(c) === 0))
            if (range(i, j).filter((t) => lab.at(L[t]) !== lab.at(L[t + 1])).length > 1)
              return false;
    return true;
  };

  return new Game(
    "Heyawake",
    rules,
    consistent,
    { value, region: reg.label, rc },
    verify,
    {
      value,
      mark,
      reg,
      rc,
    },
  );
}

/** Hinge's rule for one shaded block: the edges inside it that cross a region
 * border are exactly the block's edges across one grid line, one unbroken run
 * along it, and the block is its own mirror image across it. */
export function hingeBlockOk(
  g: Grid,
  lab: Dict<Elem, number>,
  block: readonly Cell[],
): boolean {
  const bset = new Set(block);
  const inner: [Cell, Cell][] = [];
  for (const a of block)
    for (const b of g.adj4.at(a))
      if (bset.has(b) && (a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])))
        inner.push([a, b]);
  const xEdges = inner.filter(([a, b]) => lab.at(a) !== lab.at(b));
  if (xEdges.length === 0) return false;
  const vertical = new Set(
    xEdges.filter(([a, b]) => a[1] === b[1]).map(([a]) => a[0] + 0.5),
  );
  const horizontal = new Set(
    xEdges.filter(([a, b]) => a[0] === b[0]).map(([a]) => a[1] + 0.5),
  );
  if (vertical.size + horizontal.size !== 1) return false;
  const sameEdges = (xs: [Cell, Cell][]) =>
    xs.length === xEdges.length && xs.every((x) => xEdges.includes(x));
  const unbroken = (ns: number[]) => {
    const s = [...ns].sort((p, q) => p - q);
    return s.every((n, i) => n === s[0] + i);
  };
  if (vertical.size > 0) {
    const line = [...vertical][0];
    const across = inner.filter(
      ([a, b]) => a[1] === b[1] && Math.min(a[0], b[0]) + 0.5 === line,
    );
    if (!sameEdges(across)) return false;
    if (!unbroken(across.map(([a]) => a[1]))) return false;
    return block.every(([x, y]) => bset.has(cell(Math.round(2 * line - x), y)));
  }
  const line = [...horizontal][0];
  const across = inner.filter(
    ([a, b]) => a[0] === b[0] && Math.min(a[1], b[1]) + 0.5 === line,
  );
  if (!sameEdges(across)) return false;
  if (!unbroken(across.map(([a]) => a[0]))) return false;
  return block.every(([x, y]) => bset.has(cell(x, Math.round(2 * line - y))));
}

export interface Searched {
  /** Where to look for a counterexample, narrowing the rules. */
  search: Formula[];
}

/** Hinge (corpus 6): every shaded block is split by a region border into two
 * mirror halves; a region's clue counts its shaded cells. The encoding holds
 * the clues and that a shaded cell has a shaded neighbor across or along the
 * block; the verifier holds the whole rule. */
export function hinge(g: Grid, k: number): Game<RegionClued & Searched> {
  const { reg, value, mark, rules, consistent } = base(g, k);
  const { rc, dom: rdom } = regionClues(reg, g.cells.length);
  rules.push(rdom);
  rules.push(
    ...reg.ids.map((r) =>
      Atom(
        Z3.Implies(
          rc.at(r).ge(0),
          countIn(reg, r, (c) => value.at(c).eq(1)).eq(rc.at(r)),
        ),
      ),
    ),
  );
  rules.push(
    ...g.cells.map((c) =>
      Atom(
        Z3.Implies(
          value.at(c).eq(1),
          Z3.Or(...g.adj4.at(c).map((d) => value.at(d).eq(1))),
        ),
      ),
    ),
  );

  const verify: Verify = (a) => {
    const v = a["value"];
    const lab = a["region"];
    const cl = a["rc"];
    if (!regionsOk(g, lab, k)) return false;
    for (const [r, cs] of regionsOf(g.cells, lab))
      if (cl.at(r) >= 0 && shadedIn(cs, v) !== cl.at(r)) return false;
    return comps(g.cells, g.adj4, (c) => v.at(c) === 1).every((b) =>
      hingeBlockOk(g, lab, b),
    );
  };

  // Where to look for a counterexample: blocks that are dominoes across a
  // region border, each a valid Hinge block. A search narrowed so can find an
  // answer but cannot show there is none (run_a says so).
  const search = g.cells.map((c) =>
    Atom(
      Z3.Implies(
        value.at(c).eq(1),
        Z3.And(
          sum(g.adj4.at(c).map((d) => value.at(d))).eq(1),
          ...g.adj4
            .at(c)
            .map((d) =>
              Z3.Implies(value.at(d).eq(1), reg.label.at(d).neq(reg.label.at(c))),
            ),
        ),
      ),
    ),
  );
  return new Game(
    "Hinge",
    rules,
    consistent,
    { value, region: reg.label, rc },
    verify,
    {
      value,
      mark,
      reg,
      rc,
      search,
    },
  );
}

/** Heyawake: a cell beside a shaded cell is clear. */
export function heyawakeAdjacent(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  return new Technique(
    "adjacent",
    [
      ["s", () => g.cells],
      ["c", () => g.cells],
    ],
    (e) =>
      lift(
        (s: Cell, c: Cell) =>
          Z3.And(Z3.Bool.val(g.adj4.at(s).includes(c)), mark.at(s).eq(1)),
        e["s"],
        e["c"],
      ),
    (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
  );
}

/** Hinge: a cell whose neighbors are all clear is clear, since a block of one
 * cell has no border inside it. */
export function hingeAlone(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  return new Technique(
    "alone",
    [["c", () => g.cells]],
    (e) =>
      lift((c: Cell) => Z3.And(...g.adj4.at(c).map((d) => mark.at(d).eq(0))), e["c"]),
    (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
  );
}

// -------------------------------------------------- Stostone and Shimaguni

/** Each region holds one connected block of shaded cells, at least one cell,
 * and shaded cells of two regions never touch. */
function oneBlockRules(g: Grid, reg: Regions, value: Dict<Cell, I>): Formula[] {
  const rules: Formula[] = [];
  for (const r of reg.ids) {
    rules.push(Atom(countIn(reg, r, (c) => value.at(c).eq(1)).ge(1)));
    rules.push(
      Connected(
        where(g.cells, (c) => Z3.And(reg.label.at(c).eq(r), value.at(c).eq(1))),
        g.adj4,
      ),
    );
  }
  rules.push(
    ...g.cells.flatMap((a) =>
      g.adj4
        .at(a)
        .map((b) =>
          Atom(
            Z3.Not(
              Z3.And(
                value.at(a).eq(1),
                value.at(b).eq(1),
                reg.label.at(a).neq(reg.label.at(b)),
              ),
            ),
          ),
        ),
    ),
  );
  return rules;
}

function oneBlockOk(g: Grid, v: Dict<Elem, number>, lab: Dict<Elem, number>): boolean {
  for (const cs of regionsOf(g.cells, lab).values()) {
    const sh = cs.filter((c) => v.at(c) === 1);
    const s = new Set(sh);
    if (sh.length === 0 || !oneComp(sh, g.adj4, (c) => s.has(c))) return false;
  }
  return !g.cells.some((a) =>
    g.adj4.at(a).some((b) => v.at(a) === 1 && v.at(b) === 1 && lab.at(a) !== lab.at(b)),
  );
}

/** The blocks fall under gravity until none moves: the set of shaded cells
 * after the fall. A block moves down one when every cell below it is free or
 * its own. */
export function fall(
  g: Grid,
  v: Dict<Elem, number>,
  lab: Dict<Elem, number>,
): Set<Cell> {
  const pos = new Set(g.cells.filter((c) => v.at(c) === 1));
  const owner = new Map<Cell, number>([...pos].map((c) => [c, lab.at(c)]));
  let moved = true;
  while (moved) {
    moved = false;
    for (const r of [...new Set(owner.values())].sort((a, b) => a - b)) {
      const cells = [...pos].filter((c) => owner.get(c) === r);
      const below = cells.map(([x, y]) => cell(x, y + 1));
      if (below.every((b) => b[1] < g.h && (!pos.has(b) || owner.get(b) === r))) {
        for (const c of cells) {
          pos.delete(c);
          owner.delete(c);
        }
        for (const b of below) {
          pos.add(b);
          owner.set(b, r);
        }
        moved = true;
      }
    }
  }
  return pos;
}

/** Stostone (corpus 17): one block a region, blocks of two regions never
 * touch, a clue counts its region's block, and when the blocks fall they fill
 * the bottom half exactly. The fall is encoded as the corpus states it, an
 * order-keeping downward shift a region that packs the bottom half; the
 * verifier simulates gravity. */
export function stostone(g: Grid, k: number): Game<RegionClued> {
  const { reg, value, mark, rules, consistent } = base(g, k);
  const { rc, dom: rdom } = regionClues(reg, g.cells.length);
  rules.push(rdom, ...oneBlockRules(g, reg, value));
  rules.push(
    ...reg.ids.map((r) =>
      Atom(
        Z3.Implies(
          rc.at(r).ge(0),
          countIn(reg, r, (c) => value.at(c).eq(1)).eq(rc.at(r)),
        ),
      ),
    ),
  );
  const d = dictOf(reg.ids, (r) => Z3.Int.const(`drop_${r}`));
  rules.push(...reg.ids.map((r) => Atom(Z3.And(d.at(r).ge(0), d.at(r).le(g.h)))));

  const drop = (c: Cell): I => {
    let t: I = Z3.Int.val(0);
    for (const r of reg.ids) t = Z3.If(reg.label.at(c).eq(r), d.at(r), t);
    return t;
  };
  const landed = (c: Cell) => drop(c).add(c[1]);

  rules.push(
    ...g.cells.map((c) => Atom(Z3.Implies(value.at(c).eq(1), landed(c).lt(g.h)))),
  );
  for (let x = 0; x < g.w; x++) {
    const col = range(g.h).map((y) => cell(x, y));
    for (let ty = 0; ty < g.h; ty++) {
      const lands = sum(
        col.map((c) => ite(Z3.And(value.at(c).eq(1), landed(c).eq(ty)), 1, 0)),
      );
      rules.push(Atom(lands.eq(ty >= Math.trunc(g.h / 2) ? 1 : 0)));
    }
    for (const a of col)
      for (const b of col)
        if (a[1] < b[1])
          rules.push(
            Atom(
              Z3.Implies(
                Z3.And(value.at(a).eq(1), value.at(b).eq(1)),
                landed(a).lt(landed(b)),
              ),
            ),
          );
  }

  const verify: Verify = (a) => {
    const v = a["value"];
    const lab = a["region"];
    const cl = a["rc"];
    if (!regionsOk(g, lab, k) || !oneBlockOk(g, v, lab)) return false;
    for (const [r, cs] of regionsOf(g.cells, lab))
      if (cl.at(r) >= 0 && shadedIn(cs, v) !== cl.at(r)) return false;
    const after = fall(g, v, lab);
    const bottom = g.cells.filter((c) => c[1] >= Math.trunc(g.h / 2));
    return after.size === bottom.length && bottom.every((c) => after.has(c));
  };

  return new Game(
    "Stostone",
    rules,
    consistent,
    { value, region: reg.label, rc },
    verify,
    {
      value,
      mark,
      reg,
      rc,
    },
  );
}

/** Shimaguni (written here from pzprjs's rules): one block a region, blocks of
 * two regions never touch, blocks of two neighboring regions differ in size,
 * and a clue counts its region's block. */
export function shimaguni(g: Grid, k: number): Game<RegionClued> {
  const { reg, value, mark, rules, consistent } = base(g, k);
  const { rc, dom: rdom } = regionClues(reg, g.cells.length);
  rules.push(rdom, ...oneBlockRules(g, reg, value));
  const size = dictOf(reg.ids, (r) => countIn(reg, r, (c) => value.at(c).eq(1)));
  rules.push(
    ...reg.ids.map((r) => Atom(Z3.Implies(rc.at(r).ge(0), size.at(r).eq(rc.at(r))))),
  );
  for (const a of g.cells)
    for (const b of g.adj4.at(a))
      for (const r1 of reg.ids)
        for (const r2 of reg.ids)
          if (r1 < r2)
            rules.push(
              Atom(
                Z3.Implies(
                  Z3.And(reg.label.at(a).eq(r1), reg.label.at(b).eq(r2)),
                  size.at(r1).neq(size.at(r2)),
                ),
              ),
            );

  const verify: Verify = (a) => {
    const v = a["value"];
    const lab = a["region"];
    const cl = a["rc"];
    if (!regionsOk(g, lab, k) || !oneBlockOk(g, v, lab)) return false;
    const regs = regionsOf(g.cells, lab);
    const sz = new Map([...regs].map(([r, cs]) => [r, shadedIn(cs, v)]));
    if ([...regs.keys()].some((r) => cl.at(r) >= 0 && sz.get(r) !== cl.at(r)))
      return false;
    return !g.cells.some((x) =>
      g.adj4
        .at(x)
        .some(
          (y) => lab.at(x) !== lab.at(y) && sz.get(lab.at(x)) === sz.get(lab.at(y)),
        ),
    );
  };

  return new Game(
    "Shimaguni",
    rules,
    consistent,
    { value, region: reg.label, rc },
    verify,
    {
      value,
      mark,
      reg,
      rc,
    },
  );
}

/** Stostone: a column already holding half its height in shaded cells has its
 * other cells clear, since the fall keeps every column's count and leaves the
 * bottom half full. */
export function stostoneColumn(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  return new Technique(
    "column",
    [["c", () => g.cells]],
    (e) =>
      lift(
        (c: Cell) =>
          Z3.And(
            mark.at(c).eq(UNKNOWN),
            sum(range(g.h).map((y) => ite(mark.at(cell(c[0], y)).eq(1), 1, 0))).eq(
              Math.trunc(g.h / 2),
            ),
          ),
        e["c"],
      ),
    (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
  );
}

/** Shimaguni: a region of two cells beside a region whose clue is 1 has both
 * its cells shaded, since its block cannot also be one cell. */
export function shimaguniDiffer(g: Grid, gm: Game<RegionClued>): Technique {
  const { value, reg, rc } = gm.extra;
  return new Technique(
    "differ",
    [
      ["a", () => g.cells],
      ["b", () => g.cells],
      ["c", () => g.cells],
    ],
    (e) =>
      lift(
        (a: Cell, b: Cell, c: Cell) =>
          Z3.And(
            Z3.Bool.val(g.adj4.at(a).includes(b)),
            reg.label.at(a).neq(reg.label.at(b)),
            reg.label.at(c).eq(reg.label.at(a)),
            sum(g.cells.map((x) => ite(reg.label.at(x).eq(reg.label.at(a)), 1, 0))).eq(
              2,
            ),
            rcOf(reg, rc, b).eq(1),
          ),
        e["a"],
        e["b"],
        e["c"],
      ),
    (e) => lift((c: Cell) => value.at(c).eq(1), e["c"]),
  );
}

// ------------------------------------------------- Star Battle and N-Queens

/** Star Battle (collection): `stars` a row, column and region, no two
 * touching, even diagonally. Here k is the number of regions (= the size). */
export function starbattle(
  g: Grid,
  k: number,
  stars = 1,
): Game<Regioned & { stars: number }> {
  const { reg, value, mark, rules, consistent } = base(g, k);
  rules.push(
    ...[...g.rows, ...g.cols].map((L) =>
      Atom(sum(L.map((c) => value.at(c))).eq(stars)),
    ),
  );
  rules.push(
    ...reg.ids.map((r) => Atom(countIn(reg, r, (c) => value.at(c).eq(1)).eq(stars))),
  );
  rules.push(
    ...g.cells.flatMap((a) =>
      g.adj8
        .at(a)
        .map((b) => Atom(Z3.Not(Z3.And(value.at(a).eq(1), value.at(b).eq(1))))),
    ),
  );

  const verify: Verify = (a) => {
    const v = a["value"];
    const lab = a["region"];
    if (!regionsOk(g, lab, k)) return false;
    if ([...g.rows, ...g.cols].some((L) => shadedIn(L, v) !== stars)) return false;
    if ([...regionsOf(g.cells, lab).values()].some((cs) => shadedIn(cs, v) !== stars))
      return false;
    return !g.cells.some((x) =>
      g.adj8.at(x).some((y) => v.at(x) === 1 && v.at(y) === 1),
    );
  };

  return new Game(
    `Star Battle ${stars}`,
    rules,
    consistent,
    { value, region: reg.label },
    verify,
    {
      value,
      mark,
      reg,
      stars,
    },
  );
}

/** N-Queens (corpus 65): n queens, no two in a row, column or diagonal. */
export function nqueens(g: Grid): Game<Marked> {
  const { value, mark, domain, consistent } = shading(g.cells);
  const attack = (a: Cell, b: Cell) =>
    a !== b &&
    (a[0] === b[0] || a[1] === b[1] || Math.abs(a[0] - b[0]) === Math.abs(a[1] - b[1]));
  const before = (a: Cell, b: Cell) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const rules: Formula[] = [domain, Atom(sum(g.cells.map((c) => value.at(c))).eq(g.w))];
  rules.push(
    ...g.cells.flatMap((a) =>
      g.cells
        .filter((b) => before(a, b) && attack(a, b))
        .map((b) => Atom(Z3.Not(Z3.And(value.at(a).eq(1), value.at(b).eq(1))))),
    ),
  );

  const verify: Verify = (a) => {
    const v = a["value"];
    const qs = g.cells.filter((c) => v.at(c) === 1);
    return qs.length === g.w && !qs.some((x) => qs.some((y) => attack(x, y)));
  };

  return new Game("N-Queens", rules, consistent, { value }, verify, { value, mark });
}

/** N-Queens: no queen on a queen's diagonal, at any distance. */
export function nqueensDiagonal(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  const diag = (a: Cell, b: Cell) =>
    a !== b && Math.abs(a[0] - b[0]) === Math.abs(a[1] - b[1]);
  return new Technique(
    "diagonal",
    [
      ["q", () => g.cells],
      ["c", () => g.cells],
    ],
    (e) =>
      lift(
        (q: Cell, c: Cell) => Z3.And(Z3.Bool.val(diag(q, c)), mark.at(q).eq(1)),
        e["q"],
        e["c"],
      ),
    (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
  );
}
