/**
 * Group C's games whose variations need every rung stated (`techniques.md` §
 * "Group C", `rungs.md`): Solo and Jigsaw, Seismic and Tectonic, Star Battle
 * by its star count. A technique general in a relation or a parameter reads it
 * from the game it is checked in, as the vocabulary rule says.
 */
import {
  And,
  Atom,
  type B,
  type Bound,
  cmp,
  Dict,
  dictOf,
  type Env,
  Forall,
  type Formula,
  type I,
  ite,
  lift,
  type Membership,
  minus,
  Not,
  Or,
  range,
  show,
  sum,
  Technique,
  tup,
  unionOver,
  type Verify,
  Z3,
} from "./pzl.ts";
import { countIn, regionsOf, regionsOk } from "./regions.ts";
import { Game } from "./shading.ts";
import { type Cell, cd, cell, type Grid, Regions, shading } from "./space.ts";

/** A unit: a row, column or region, by kind and index. */
export type Unit = readonly [string, number];

export function asBool(m: Membership): B {
  return typeof m === "boolean" ? Z3.Bool.val(m) : m;
}

function unitCellsOf(g: Grid, reg: Regions): (u: Unit) => Dict<Cell, Membership> {
  return ([kind, i]) => {
    if (kind === "row") return dictOf<Cell, Membership>(g.rows[i], () => true);
    if (kind === "col") return dictOf<Cell, Membership>(g.cols[i], () => true);
    return dictOf<Cell, Membership>(g.cells, (c) => reg.label.at(c).eq(i));
  };
}

function unitsOf(n: number, last: string): Unit[] {
  return [
    ...range(n).map((i) => tup("row", i)),
    ...range(n).map((i) => tup("col", i)),
    ...range(n).map((r) => tup(last, r)),
  ];
}

// ------------------------------------------------------------------- Solo

export interface SoloExtra {
  value: Dict<Cell, I>;
  cand: Dict<string, B>;
  units: Unit[];
  unitCells: (u: Unit) => Dict<Cell, Membership>;
  digits: number[];
  sees: (a: Cell, b: Cell) => B;
  n: number;
}

/** Solo (language.md's sample): a Latin square over rows, columns and blocks.
 * Jigsaw deals the blocks as any n connected regions of n cells; here they are
 * variables, so a check covers every jigsaw of the size. */
export function solo(
  g: Grid,
  rw: number,
  rh: number,
  jigsaw: boolean,
): Game<SoloExtra> {
  const n = rw * rh;
  const digits = range(1, n + 1);
  const value = dictOf(g.cells, (c) => Z3.Int.const(`v_${show(c)}`));
  const cand = new Dict<string, B>();
  for (const c of g.cells)
    for (const d of digits) cand.set(cd(c, d), Z3.Bool.const(`cand_${show(c)}_${d}`));
  const reg = jigsaw
    ? new Regions(g.cells, g.adj4, n, "blk", null, n)
    : new Regions(
        g.cells,
        g.adj4,
        n,
        "blk",
        dictOf(
          g.cells,
          ([x, y]) => Math.trunc(y / rh) * Math.trunc(n / rw) + Math.trunc(x / rw),
        ),
      );
  const units = unitsOf(n, "blk");
  const unitCells = unitCellsOf(g, reg);

  const rules: Formula[] = [
    Atom(Z3.And(...g.cells.map((c) => Z3.And(value.at(c).ge(1), value.at(c).le(n))))),
  ];
  if (jigsaw) rules.push(Atom(reg.wellformed()));
  for (const a of g.cells)
    for (const b of g.cells)
      if (cmp(a, b) < 0) {
        const line = a[0] === b[0] || a[1] === b[1];
        rules.push(
          Atom(
            Z3.Implies(
              Z3.Or(line, reg.label.at(a).eq(reg.label.at(b))),
              value.at(a).neq(value.at(b)),
            ),
          ),
        );
      }
  const consistent = Atom(
    Z3.And(
      ...g.cells.flatMap((c) =>
        digits.map((d) => Z3.Implies(value.at(c).eq(d), cand.at(cd(c, d)))),
      ),
    ),
  );

  const verify: Verify = (a) => {
    const v = a["value"];
    const lab = a["region"];
    const regs = regionsOf(g.cells, lab);
    if (
      jigsaw &&
      !(regionsOk(g, lab, n) && [...regs.values()].every((cs) => cs.length === n))
    )
      return false;
    const groups = [...g.rows, ...g.cols, ...regs.values()];
    return groups.every((grp) => new Set(grp.map((c) => v.at(c))).size === grp.length);
  };

  const sees = (a: Cell, b: Cell): B =>
    Z3.And(
      Z3.Bool.val(a !== b),
      Z3.Or(
        Z3.Bool.val(a[0] === b[0] || a[1] === b[1]),
        reg.label.at(a).eq(reg.label.at(b)),
      ),
    );

  return new Game(
    `Solo${jigsaw ? " Jigsaw" : ""} ${n}x${n}`,
    rules,
    consistent,
    { value, region: reg.label },
    verify,
    {
      value,
      cand,
      units,
      unitCells,
      digits,
      sees,
      n,
    },
  );
}

export function soloLadder(g: Grid, gm: Game<SoloExtra>): Technique[] {
  const { value, cand, units, unitCells: uc, digits, sees, n } = gm.extra;
  const cells = g.cells;
  const notCand = (c: Cell, d: number) => Z3.Not(cand.at(cd(c, d)));
  const inUnit = (u: Bound, c: Bound) =>
    lift((uu: Unit, cc: Cell) => uc(uu).get(cc) ?? false, u, c);
  const unitOf = (e: Env) => unionOver(e["u"], uc);
  const only = (c: Cell, ds: readonly number[]) =>
    Z3.And(...digits.filter((d) => !ds.includes(d)).map((d) => notCand(c, d)));
  const out: Technique[] = [];

  out.push(
    new Technique(
      "hiddenSingle",
      [
        ["u", () => units],
        ["d", () => digits],
        ["c", unitOf],
      ],
      (e) =>
        Forall(minus(unitOf(e), e["c"]), (c2) =>
          lift((d: number) => notCand(c2, d), e["d"]),
        ),
      (e) => lift((c: Cell, d: number) => value.at(c).eq(d), e["c"], e["d"]),
    ),
  );
  out.push(
    new Technique(
      "nakedSingle",
      [
        ["c", () => cells],
        ["d", () => digits],
      ],
      (e) =>
        lift(
          (c: Cell, d: number) =>
            Z3.And(...digits.filter((d2) => d2 !== d).map((d2) => notCand(c, d2))),
          e["c"],
          e["d"],
        ),
      (e) => lift((c: Cell, d: number) => value.at(c).eq(d), e["c"], e["d"]),
    ),
  );
  // intersect: d's candidates in u1 all inside u2 strike d from u2's other cells.
  out.push(
    new Technique(
      "intersect",
      [
        ["u1", () => units],
        ["u2", () => units],
        ["d", () => digits],
        ["c", () => cells],
      ],
      (e) =>
        And(
          Forall(cells, (x) =>
            Or(
              Not(inUnit(e["u1"], x)),
              inUnit(e["u2"], x),
              lift((d: number) => notCand(x, d), e["d"]),
            ),
          ),
          inUnit(e["u2"], e["c"]),
          Not(inUnit(e["u1"], e["c"])),
        ),
      (e) => lift((c: Cell, d: number) => value.at(c).neq(d), e["c"], e["d"]),
    ),
  );
  // subset, naked pair: two cells of u whose candidates lie in {d1, d2}
  // strike d1 and d2 from the rest of u.
  const pairs: (readonly [number, number])[] = [];
  for (const d1 of digits)
    for (const d2 of digits) if (d1 < d2) pairs.push(tup(d1, d2));
  out.push(
    new Technique(
      "subset",
      [
        ["u", () => units],
        ["p", () => pairs],
        ["a", () => cells],
        ["b", () => cells],
        ["c", () => cells],
        ["i", () => [0, 1]],
      ],
      (e) =>
        And(
          inUnit(e["u"], e["a"]),
          inUnit(e["u"], e["b"]),
          inUnit(e["u"], e["c"]),
          lift(
            (a: Cell, b: Cell, c: Cell) => Z3.Bool.val(new Set([a, b, c]).size === 3),
            e["a"],
            e["b"],
            e["c"],
          ),
          lift((a: Cell, p: readonly number[]) => only(a, p), e["a"], e["p"]),
          lift((b: Cell, p: readonly number[]) => only(b, p), e["b"], e["p"]),
        ),
      (e) =>
        lift(
          (c: Cell, p: readonly number[], i: number) => value.at(c).neq(p[i]),
          e["c"],
          e["p"],
          e["i"],
        ),
    ),
  );
  // subset, hidden pair: d1 and d2 have no candidate in u outside a and b, so
  // a holds one of them.
  out.push(
    new Technique(
      "hiddenPair",
      [
        ["u", () => units],
        ["p", () => pairs],
        ["a", () => cells],
        ["b", () => cells],
      ],
      (e) =>
        And(
          inUnit(e["u"], e["a"]),
          inUnit(e["u"], e["b"]),
          lift((a: Cell, b: Cell) => Z3.Bool.val(a !== b), e["a"], e["b"]),
          Forall(cells, (x) =>
            Or(
              Not(inUnit(e["u"], x)),
              lift(
                (a: Cell, b: Cell) => Z3.Bool.val(x === a || x === b),
                e["a"],
                e["b"],
              ),
              lift(
                (p: readonly number[]) => Z3.And(notCand(x, p[0]), notCand(x, p[1])),
                e["p"],
              ),
            ),
          ),
        ),
      (e) =>
        lift(
          (a: Cell, p: readonly number[]) =>
            Z3.Or(value.at(a).eq(p[0]), value.at(a).eq(p[1])),
          e["a"],
          e["p"],
        ),
    ),
  );
  // fish, size 2 (an X-wing) over rows and columns.
  const rpairs: (readonly [number, number])[] = [];
  for (const i of range(n)) for (const j of range(n)) if (i < j) rpairs.push(tup(i, j));
  out.push(
    new Technique(
      "fish",
      [
        ["d", () => digits],
        ["r", () => rpairs],
        ["k", () => rpairs],
        ["c", () => cells],
      ],
      (e) =>
        lift(
          (d: number, r: readonly number[], k: readonly number[], c: Cell) =>
            Z3.And(
              Z3.Bool.val(k.includes(c[0]) && !r.includes(c[1])),
              ...r.flatMap((y) =>
                range(n)
                  .filter((x) => !k.includes(x))
                  .map((x) => notCand(cell(x, y), d)),
              ),
            ),
          e["d"],
          e["r"],
          e["k"],
          e["c"],
        ),
      (e) => lift((c: Cell, d: number) => value.at(c).neq(d), e["c"], e["d"]),
    ),
  );
  // wing (XY): m holds {x, y}, e1 {x, z}, e2 {y, z}, m sees both ends, and t
  // sees both ends: t is not z.
  const trip: (readonly [number, number, number])[] = [];
  for (const x of digits)
    for (const y of digits)
      for (const z of digits)
        if (new Set([x, y, z]).size === 3 && x < y) trip.push(tup(x, y, z));
  type V3 = readonly [number, number, number];
  out.push(
    new Technique(
      "wing",
      [
        ["v", () => trip],
        ["m", () => cells],
        ["e1", () => cells],
        ["e2", () => cells],
        ["t", () => cells],
      ],
      (e) =>
        And(
          lift((m: Cell, v: V3) => only(m, [v[0], v[1]]), e["m"], e["v"]),
          lift((a: Cell, v: V3) => only(a, [v[0], v[2]]), e["e1"], e["v"]),
          lift((b: Cell, v: V3) => only(b, [v[1], v[2]]), e["e2"], e["v"]),
          lift(sees, e["m"], e["e1"]),
          lift(sees, e["m"], e["e2"]),
          lift(sees, e["t"], e["e1"]),
          lift(sees, e["t"], e["e2"]),
        ),
      (e) => lift((t: Cell, v: V3) => value.at(t).neq(v[2]), e["t"], e["v"]),
    ),
  );
  // forcingChain, three links: s holds {a, b}; q1 sees s and holds {b, c};
  // q2 sees q1 and holds {c, a}. Either s or q2 is a, so a cell seeing both
  // is not a.
  const trip3: V3[] = [];
  for (const a of digits)
    for (const b of digits)
      for (const c of digits)
        if (new Set([a, b, c]).size === 3) trip3.push(tup(a, b, c));
  out.push(
    new Technique(
      "forcingChain",
      [
        ["v", () => trip3],
        ["s", () => cells],
        ["q1", () => cells],
        ["q2", () => cells],
        ["t", () => cells],
      ],
      (e) =>
        And(
          lift((s: Cell, v: V3) => only(s, [v[0], v[1]]), e["s"], e["v"]),
          lift((q: Cell, v: V3) => only(q, [v[1], v[2]]), e["q1"], e["v"]),
          lift((q: Cell, v: V3) => only(q, [v[2], v[0]]), e["q2"], e["v"]),
          lift(sees, e["q1"], e["s"]),
          lift(sees, e["q2"], e["q1"]),
          lift(sees, e["t"], e["s"]),
          lift(sees, e["t"], e["q2"]),
        ),
      (e) => lift((t: Cell, v: V3) => value.at(t).neq(v[0]), e["t"], e["v"]),
    ),
  );
  return out;
}

// ---------------------------------------------------------------- Seismic

export interface SeismicExtra {
  value: Dict<Cell, I>;
  cand: Dict<string, B>;
  reg: Regions;
  digits: number[];
  clash: (a: Cell, b: Cell, n: number | I) => B;
  areaSize: (c: Cell) => I;
}

/** Seismic (collection): areas of size N hold 1..N once; two equal numbers n
 * may not `clash`. Seismic's clash: same row or column, n or fewer apart.
 * Tectonic's: the eight neighbors. The areas are variables. */
export function seismic(g: Grid, k: number, tectonic: boolean): Game<SeismicExtra> {
  const reg = new Regions(g.cells, g.adj4, k, "area");
  const value = dictOf(g.cells, (c) => Z3.Int.const(`sv_${show(c)}`));
  const digits = range(1, 6);
  const cand = new Dict<string, B>();
  for (const c of g.cells)
    for (const d of digits) cand.set(cd(c, d), Z3.Bool.const(`scand_${show(c)}_${d}`));
  const size = dictOf(reg.ids, (r) => countIn(reg, r, () => Z3.Bool.val(true)));

  const areaSize = (c: Cell): I => {
    let t: I = Z3.Int.val(0);
    for (const r of reg.ids) t = Z3.If(reg.label.at(c).eq(r), size.at(r), t);
    return t;
  };

  const clash = (a: Cell, b: Cell, n: number | I): B => {
    if (a === b) return Z3.Bool.val(false);
    if (tectonic) return Z3.Bool.val(g.adj8.at(a).includes(b));
    const dx = Math.abs(a[0] - b[0]);
    const dy = Math.abs(a[1] - b[1]);
    if (dx === 0 || dy === 0)
      return typeof n === "number" ? Z3.Bool.val(dx + dy <= n) : n.ge(dx + dy);
    return Z3.Bool.val(false);
  };

  const rules: Formula[] = [Atom(reg.wellformed())];
  rules.push(
    ...g.cells.map((c) =>
      Atom(
        Z3.And(
          value.at(c).ge(1),
          value.at(c).le(areaSize(c)),
          value.at(c).le(Math.max(...digits)),
        ),
      ),
    ),
  );
  for (const a of g.cells)
    for (const b of g.cells)
      if (cmp(a, b) < 0) {
        rules.push(
          Atom(
            Z3.Implies(
              reg.label.at(a).eq(reg.label.at(b)),
              value.at(a).neq(value.at(b)),
            ),
          ),
        );
        rules.push(
          Atom(
            Z3.Implies(value.at(a).eq(value.at(b)), Z3.Not(clash(a, b, value.at(a)))),
          ),
        );
      }
  const consistent = Atom(
    Z3.And(
      ...g.cells.flatMap((c) =>
        digits.map((d) => Z3.Implies(value.at(c).eq(d), cand.at(cd(c, d)))),
      ),
    ),
  );

  const verify: Verify = (a) => {
    const v = a["value"];
    const lab = a["region"];
    if (!regionsOk(g, lab, k)) return false;
    for (const cs of regionsOf(g.cells, lab).values()) {
      const got = cs.map((c) => v.at(c)).sort((p, q) => p - q);
      if (!got.every((x, i) => x === i + 1)) return false;
    }
    for (const x of g.cells)
      for (const y of g.cells)
        if (x !== y && v.at(x) === v.at(y)) {
          if (tectonic && g.adj8.at(x).includes(y)) return false;
          const dx = Math.abs(x[0] - y[0]);
          const dy = Math.abs(x[1] - y[1]);
          if (!tectonic && (dx === 0 || dy === 0) && dx + dy <= v.at(x)) return false;
        }
    return true;
  };

  return new Game(
    tectonic ? "Tectonic" : "Seismic",
    rules,
    consistent,
    { value, region: reg.label },
    verify,
    {
      value,
      cand,
      reg,
      digits,
      clash,
      areaSize,
    },
  );
}

/** Seismic's rungs, each reading the clash relation of the game it is
 * checked in. */
export function seismicLadder(g: Grid, gm: Game<SeismicExtra>): Technique[] {
  const { value, cand, reg, digits, clash, areaSize } = gm.extra;
  const cells = g.cells;
  const only = (c: Cell, d: number) =>
    Z3.And(...digits.filter((d2) => d2 !== d).map((d2) => Z3.Not(cand.at(cd(c, d2)))));
  return [
    new Technique(
      "nakedSingle",
      [
        ["c", () => cells],
        ["d", () => digits],
      ],
      (e) => lift(only, e["c"], e["d"]),
      (e) => lift((c: Cell, d: number) => value.at(c).eq(d), e["c"], e["d"]),
    ),
    // strike: a cell down to n strikes n from every cell it clashes with, and
    // from the rest of its area.
    new Technique(
      "strike",
      [
        ["p", () => cells],
        ["d", () => digits],
        ["c", () => cells],
      ],
      (e) =>
        lift(
          (p: Cell, d: number, c: Cell) =>
            Z3.And(
              Z3.Bool.val(p !== c),
              only(p, d),
              Z3.Or(clash(p, c, d), reg.label.at(p).eq(reg.label.at(c))),
            ),
          e["p"],
          e["d"],
          e["c"],
        ),
      (e) => lift((c: Cell, d: number) => value.at(c).neq(d), e["c"], e["d"]),
    ),
    // hiddenSingle in an area: n, owed by c's area, has no other home there.
    new Technique(
      "hiddenSingle",
      [
        ["c", () => cells],
        ["d", () => digits],
      ],
      (e) =>
        lift(
          (c: Cell, d: number) =>
            Z3.And(
              areaSize(c).ge(d),
              ...cells
                .filter((x) => x !== c)
                .map((x) =>
                  Z3.Implies(
                    reg.label.at(x).eq(reg.label.at(c)),
                    Z3.Not(cand.at(cd(x, d))),
                  ),
                ),
            ),
          e["c"],
          e["d"],
        ),
      (e) => lift((c: Cell, d: number) => value.at(c).eq(d), e["c"], e["d"]),
    ),
    // starve: every home of n in a's area, which owes n, clashes with c.
    new Technique(
      "starve",
      [
        ["a", () => cells],
        ["d", () => digits],
        ["c", () => cells],
      ],
      (e) =>
        lift(
          (a: Cell, d: number, c: Cell) =>
            Z3.And(
              reg.label.at(c).neq(reg.label.at(a)),
              areaSize(a).ge(d),
              ...cells.map((h) =>
                Z3.Implies(
                  Z3.And(reg.label.at(h).eq(reg.label.at(a)), cand.at(cd(h, d))),
                  clash(c, h, d),
                ),
              ),
            ),
          e["a"],
          e["d"],
          e["c"],
        ),
      (e) => lift((c: Cell, d: number) => value.at(c).neq(d), e["c"], e["d"]),
    ),
  ];
}

// ------------------------------------------------------------ Star Battle

export interface StarExtra {
  value: Dict<Cell, I>;
  mark: Dict<Cell, I>;
  units: Unit[];
  unitCells: (u: Unit) => Dict<Cell, Membership>;
  k: number;
  reg: Regions;
}

/** Star Battle (collection): `stars` (the parameter k) a row, column and
 * region, no two touching. Regions are variables unless `fixed` deals them. */
export function starbattle(
  g: Grid,
  stars: number,
  fixed: ReadonlyMap<Cell, number> | null = null,
): Game<StarExtra> {
  const n = g.w;
  const reg = new Regions(g.cells, g.adj4, n, "sreg", fixed);
  const { value, mark, domain, consistent } = shading(g.cells);
  const units = unitsOf(n, "reg");
  const unitCells = unitCellsOf(g, reg);

  const rules: Formula[] = [
    domain,
    ...(fixed === null ? [Atom(reg.wellformed())] : []),
  ];
  rules.push(
    ...units.map((u) =>
      Atom(
        sum([...unitCells(u)].map(([c, m]) => Z3.If(asBool(m), value.at(c), 0))).eq(
          stars,
        ),
      ),
    ),
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
    if (fixed === null && !regionsOk(g, lab, n)) return false;
    const groups = [...g.rows, ...g.cols, ...regionsOf(g.cells, lab).values()];
    return (
      groups.every((grp) => grp.reduce((t, c) => t + v.at(c), 0) === stars) &&
      !g.cells.some((x) => g.adj8.at(x).some((y) => v.at(x) === 1 && v.at(y) === 1))
    );
  };

  return new Game(
    `Star Battle k=${stars} ${n}x${n}`,
    rules,
    consistent,
    { value, region: reg.label },
    verify,
    {
      value,
      mark,
      units,
      unitCells,
      k: stars,
      reg,
    },
  );
}

/** Star Battle's rungs, general in k: each reads the k of the game it is
 * checked in. Marks: 1 star, 0 cross, 2 unknown. */
export function starbattleLadder(g: Grid, gm: Game<StarExtra>): Technique[] {
  const { value, mark, units, unitCells: uc, k } = gm.extra;
  const cells = g.cells;
  const inU = (uu: Unit, c: Cell): B => asBool(uc(uu).get(c) ?? false);
  const starsOf = (uu: Unit): I =>
    sum([...uc(uu)].map(([c, m]) => ite(Z3.And(asBool(m), mark.at(c).eq(1)), 1, 0)));
  const inu = (u: Bound, c: Bound) => lift(inU, u, c);
  const starsIn = (u: Bound) => lift(starsOf, u);
  const openIn = (uu: Unit, c: Cell) => Z3.And(inU(uu, c), mark.at(c).eq(2));
  const need = (u: Bound) => Z3.Int.val(k).sub(starsIn(u));
  const touch = (a: Cell, b: Cell) =>
    a !== b && Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1;

  /** At least m cells of `pool`, no two touching; m is at most 3, so it is
   * first-order. */
  const roomAtLeast = (pool: (c: Cell) => B, m: number): B => {
    if (m <= 0) return Z3.Bool.val(true);
    const parts: B[] = [];
    for (const a of cells) {
      if (m === 1) {
        parts.push(pool(a));
        continue;
      }
      for (const b of cells) {
        if (cmp(b, a) <= 0 || touch(a, b)) continue;
        if (m === 2) {
          parts.push(Z3.And(pool(a), pool(b)));
          continue;
        }
        for (const c of cells) {
          if (cmp(c, b) <= 0 || touch(a, c) || touch(b, c)) continue;
          parts.push(Z3.And(pool(a), pool(b), pool(c)));
        }
      }
    }
    return parts.length > 0 ? Z3.Or(...parts) : Z3.Bool.val(false);
  };

  const lacksRoom = (pool: (c: Cell) => B, needTerm: I): B =>
    Z3.Or(
      ...range(1, k + 1).map((m) =>
        Z3.And(needTerm.eq(m), Z3.Not(roomAtLeast(pool, m))),
      ),
    );

  const lines = units.slice(0, 2 * g.w);
  const regs = units.slice(2 * g.w);
  /** k less the stars u holds, less one more where u holds c. */
  const owed = (u: Unit, c: Cell | null): I => {
    const t = Z3.Int.val(k).sub(starsOf(u));
    return c === null ? t : t.sub(ite(inU(u, c), 1, 0));
  };

  return [
    new Technique(
      "around",
      [
        ["s", () => cells],
        ["c", () => cells],
      ],
      (e) =>
        lift(
          (s: Cell, c: Cell) => Z3.And(Z3.Bool.val(touch(s, c)), mark.at(s).eq(1)),
          e["s"],
          e["c"],
        ),
      (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
    ),
    new Technique(
      "full",
      [
        ["u", () => units],
        ["c", () => cells],
      ],
      (e) =>
        And(
          inu(e["u"], e["c"]),
          lift((c: Cell) => mark.at(c).eq(2), e["c"]),
          Atom(need(e["u"]).eq(0)),
        ),
      (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
    ),
    new Technique(
      "exact",
      [
        ["u", () => units],
        ["c", () => cells],
      ],
      (e) =>
        And(
          inu(e["u"], e["c"]),
          lift((c: Cell) => mark.at(c).eq(2), e["c"]),
          Atom(need(e["u"]).gt(0)),
          Atom(
            lift(
              (uu: Unit) => sum(cells.map((x) => ite(openIn(uu, x), 1, 0))),
              e["u"],
            ).eq(need(e["u"])),
          ),
        ),
      (e) => lift((c: Cell) => value.at(c).eq(1), e["c"]),
    ),
    // confined, one line and one region: r's open cells all in line L and
    // need(r) = need(L): L's other open cells are no star; and the other half,
    // L's open cells all in r: r's other open cells are no star.
    new Technique(
      "confinedLine",
      [
        ["L", () => lines],
        ["r", () => regs],
        ["c", () => cells],
      ],
      (e) =>
        And(
          lift(
            (L: Unit, r: Unit, c: Cell) =>
              Z3.And(
                mark.at(c).eq(2),
                inU(L, c),
                Z3.Not(inU(r, c)),
                ...cells.map((x) => Z3.Implies(openIn(r, x), inU(L, x))),
              ),
            e["L"],
            e["r"],
            e["c"],
          ),
          Atom(need(e["r"]).eq(need(e["L"]))),
        ),
      (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
    ),
    new Technique(
      "confinedRegion",
      [
        ["L", () => lines],
        ["r", () => regs],
        ["c", () => cells],
      ],
      (e) =>
        And(
          lift(
            (L: Unit, r: Unit, c: Cell) =>
              Z3.And(
                mark.at(c).eq(2),
                inU(r, c),
                Z3.Not(inU(L, c)),
                ...cells.map((x) => Z3.Implies(openIn(L, x), inU(r, x))),
              ),
            e["L"],
            e["r"],
            e["c"],
          ),
          Atom(need(e["r"]).eq(need(e["L"]))),
        ),
      (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
    ),
    // needed: without c, u has no room for its need.
    new Technique(
      "needed",
      [
        ["u", () => units],
        ["c", () => cells],
      ],
      (e) =>
        And(
          inu(e["u"], e["c"]),
          lift((c: Cell) => mark.at(c).eq(2), e["c"]),
          Atom(
            lift(
              (uu: Unit, c: Cell) =>
                lacksRoom(
                  (x) => Z3.And(Z3.Bool.val(x !== c), openIn(uu, x)),
                  owed(uu, null),
                ),
              e["u"],
              e["c"],
            ),
          ),
        ),
      (e) => lift((c: Cell) => value.at(c).eq(1), e["c"]),
    ),
    // crowded: a star at c, with its touching cells crossed, leaves a unit U
    // without room for what U then still needs.
    new Technique(
      "crowded",
      [
        ["c", () => cells],
        ["U", () => units],
      ],
      (e) =>
        And(
          lift((c: Cell) => mark.at(c).eq(2), e["c"]),
          Atom(
            lift(
              (c: Cell, U: Unit) =>
                lacksRoom(
                  (x) => Z3.And(Z3.Bool.val(x !== c && !touch(x, c)), openIn(U, x)),
                  owed(U, c),
                ),
              e["c"],
              e["U"],
            ),
          ),
        ),
      (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
    ),
    // starved: as crowded, and the star also completes each of its own units
    // that needed one, crossing their other open cells.
    new Technique(
      "starved",
      [
        ["c", () => cells],
        ["U", () => units],
      ],
      (e) =>
        And(
          lift((c: Cell) => mark.at(c).eq(2), e["c"]),
          Atom(
            lift(
              (c: Cell, U: Unit) =>
                lacksRoom(
                  (x) =>
                    Z3.And(
                      Z3.Bool.val(x !== c && !touch(x, c)),
                      openIn(U, x),
                      ...units.map((o) =>
                        Z3.Not(Z3.And(inU(o, c), inU(o, x), owed(o, null).eq(1))),
                      ),
                    ),
                  owed(U, c),
                ),
              e["c"],
              e["U"],
            ),
          ),
        ),
      (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
    ),
  ];
}
