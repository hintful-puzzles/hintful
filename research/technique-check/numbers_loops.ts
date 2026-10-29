/**
 * Group A's number games without clues (Sukoro, View) and its two loop games
 * (Pipe Link, Reflect Link).
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
  show,
  sorted,
  sum,
  Technique,
  tup,
  type Verify,
  where,
  Z3,
} from "./pzl.ts";
import { comps, Game, type Marked, oneComp } from "./shading.ts";
import { type Cell, cell, DIRS4, type Dir, type Grid } from "./space.ts";

/** A cell with no number. */
const NONE = -1;
/** A mark: not yet known. */
const UNSEEN = -2;

function numberedBoard(g: Grid, top: number, name: string) {
  const value = dictOf(g.cells, (c) => Z3.Int.const(`${name}_${show(c)}`));
  const mark = dictOf(g.cells, (c) => Z3.Int.const(`nmark_${show(c)}`));
  const lo = name === "sukoro" ? 1 : 0;
  const domain = And(
    ...g.cells.map((c) =>
      Atom(
        Z3.Or(value.at(c).eq(NONE), Z3.And(value.at(c).ge(lo), value.at(c).le(top))),
      ),
    ),
  );
  const consistent = And(
    ...g.cells.map((c) =>
      Atom(Z3.Implies(mark.at(c).neq(UNSEEN), mark.at(c).eq(value.at(c)))),
    ),
  );
  const num = (c: Cell) => value.at(c).neq(NONE);
  const common: Formula[] = [
    domain,
    Connected(where(g.cells, num), g.adj4),
    And(
      ...g.cells.flatMap((a) =>
        g.adj4
          .at(a)
          .map((b) =>
            Atom(Z3.Implies(Z3.And(num(a), num(b)), value.at(a).neq(value.at(b)))),
          ),
      ),
    ),
  ];
  return { value, mark, consistent, rules: common };
}

function commonOk(g: Grid, v: Dict<Elem, number>): boolean {
  if (!oneComp(g.cells, g.adj4, (c) => v.at(c) !== NONE)) return false;
  return !g.cells.some((a) =>
    g.adj4.at(a).some((b) => v.at(a) !== NONE && v.at(a) === v.at(b)),
  );
}

/** Sukoro (corpus 50): a number counts its numbered neighbors; neighbors'
 * numbers differ; the numbers are connected. */
export function sukoro(g: Grid): Game<Marked> {
  const { value, mark, consistent, rules } = numberedBoard(g, 4, "sukoro");
  rules.push(
    ...g.cells.map((c) =>
      Atom(
        Z3.Implies(
          value.at(c).neq(NONE),
          value
            .at(c)
            .eq(sum(g.adj4.at(c).map((d) => ite(value.at(d).neq(NONE), 1, 0)))),
        ),
      ),
    ),
  );

  const verify: Verify = (a) => {
    const v = a["value"];
    if (
      g.cells.some((c) => v.at(c) !== NONE && !(v.at(c) >= 1 && v.at(c) <= 4)) ||
      !commonOk(g, v)
    )
      return false;
    return g.cells.every(
      (c) =>
        v.at(c) === NONE ||
        v.at(c) === g.adj4.at(c).filter((d) => v.at(d) !== NONE).length,
    );
  };

  return new Game("Sukoro", rules, consistent, { value }, verify, { value, mark });
}

/** View (corpus 51): a number counts the empty cells it sees in the four
 * directions, up to a number or the edge; neighbors' numbers differ; the
 * numbers are connected. */
export function view(g: Grid): Game<Marked> {
  const { value, mark, consistent, rules } = numberedBoard(g, g.w + g.h - 2, "view");
  for (const c of g.cells) {
    let seen: I = Z3.Int.val(0);
    for (const d of DIRS4) {
      const ray = g.ray(c, d);
      for (let i = 0; i < ray.length; i++)
        seen = seen.add(
          ite(Z3.And(...ray.slice(0, i + 1).map((x) => value.at(x).eq(NONE))), 1, 0),
        );
    }
    rules.push(Atom(Z3.Implies(value.at(c).neq(NONE), value.at(c).eq(seen))));
  }

  const verify: Verify = (a) => {
    const v = a["value"];
    if (!commonOk(g, v)) return false;
    for (const c of g.cells)
      if (v.at(c) !== NONE) {
        let seen = 0;
        for (const d of DIRS4)
          for (const x of g.ray(c, d)) {
            if (v.at(x) !== NONE) break;
            seen++;
          }
        if (v.at(c) !== seen) return false;
      }
    return true;
  };

  return new Game("View", rules, consistent, { value }, verify, { value, mark });
}

/** Sukoro: a number whose numbered neighbors already make its count has its
 * other neighbors empty. */
export function sukoroFull(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  return new Technique(
    "full",
    [
      ["c", () => g.cells],
      ["n", () => g.cells],
    ],
    (e) =>
      lift(
        (c: Cell, n: Cell) =>
          Z3.And(
            Z3.Bool.val(g.adj4.at(c).includes(n)),
            mark.at(c).ge(0),
            mark.at(n).eq(UNSEEN),
            mark.at(c).eq(sum(g.adj4.at(c).map((d) => ite(mark.at(d).ge(0), 1, 0)))),
          ),
        e["c"],
        e["n"],
      ),
    (e) => lift((n: Cell) => value.at(n).eq(NONE), e["n"]),
  );
}

/** View: a number whose known empty runs already add up to it sees no
 * further, so the cell past each run holds a number. */
export function viewSeen(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  const run = (c: Cell, d: Dir): I => {
    const ray = g.ray(c, d);
    return sum(
      ray.map((_, i) =>
        ite(Z3.And(...ray.slice(0, i + 1).map((x) => mark.at(x).eq(NONE))), 1, 0),
      ),
    );
  };
  const premise = (c: Cell): B =>
    Z3.And(mark.at(c).ge(0), mark.at(c).eq(sum(DIRS4.map((d) => run(c, d)))));
  const conclusion = (c: Cell, d: Dir): B => {
    const ray = g.ray(c, d);
    return Z3.And(
      ...ray.map((x, i) => {
        const before = Z3.And(...ray.slice(0, i).map((y) => mark.at(y).eq(NONE)));
        return Z3.Implies(Z3.And(before, mark.at(x).neq(NONE)), value.at(x).neq(NONE));
      }),
    );
  };
  const dirs = DIRS4.map(([dx, dy]) => tup(dx, dy));
  return new Technique(
    "seen",
    [
      ["c", () => g.cells],
      ["d", () => dirs],
    ],
    (e) => lift(premise, e["c"]),
    (e) => lift(conclusion, e["c"], e["d"]),
  );
}

// ----------------------------------------------------------------- the loops

export type Edge = readonly [Cell, Cell];

/** The edge between two cells, its ends in order. */
export function edge(a: Cell, b: Cell): Edge {
  const [p, q] = sorted([a, b]);
  return tup(p, q);
}

export function edgesOf(g: Grid): { es: Edge[]; at: Dict<Cell, Edge[]> } {
  const set = new Set<Edge>();
  for (const a of g.cells) for (const b of g.adj4.at(a)) set.add(edge(a, b));
  const es = sorted(set);
  const at = dictOf(g.cells, (c) => es.filter((e) => e.includes(c)));
  return { es, at };
}

/** The far end of e from c. */
export function other(e: Edge, c: Cell): Cell {
  return e[1] === c ? e[0] : e[1];
}

function loopBoard(g: Grid, name: string) {
  const { es, at } = edgesOf(g);
  const line = dictOf(es, (e) => Z3.Bool.const(`${name}_${show(e)}`));
  // 0 cross, 1 line, 2 unknown
  const emark = dictOf(es, (e) => Z3.Int.const(`emark_${show(e)}`));
  const consistent = And(
    ...es.map((e) =>
      Atom(
        Z3.And(
          emark.at(e).ge(0),
          emark.at(e).le(2),
          Z3.Implies(emark.at(e).neq(2), Z3.Eq(emark.at(e).eq(1), line.at(e))),
        ),
      ),
    ),
  );
  const deg = dictOf(g.cells, (c) => sum(at.at(c).map((e) => ite(line.at(e), 1, 0))));
  const linked = dictOf(g.cells, (c) =>
    at.at(c).map((e): readonly [Cell, B] => [other(e, c), line.at(e)]),
  );
  return { es, at, line, emark, consistent, deg, linked };
}

const CORNERS: Record<number, readonly Dir[]> = {
  1: [
    [1, 0],
    [0, 1],
  ],
  2: [
    [-1, 0],
    [0, 1],
  ],
  3: [
    [1, 0],
    [0, -1],
  ],
  4: [
    [-1, 0],
    [0, -1],
  ],
};

function cornerEdges(c: Cell, k: number): Edge[] {
  return CORNERS[k].map(([dx, dy]) => edge(c, cell(c[0] + dx, c[1] + dy)));
}

export interface Looped {
  line: Dict<Edge, B>;
  emark: Dict<Edge, I>;
  at: Dict<Cell, Edge[]>;
}

/** Reflect Link (corpus 26) on an instance with no cross clue, so no square
 * is crossed: one loop through some squares, and a triangle's square is the
 * corner it shows (unnumbered triangles; a number is one more clue that only
 * removes answers). */
export function reflect(g: Grid): Game<Looped & { tri: Dict<Cell, I> }> {
  const { at, line, emark, consistent, deg, linked } = loopBoard(g, "rline");
  const tri = dictOf(g.cells, (c) => Z3.Int.const(`tri_${show(c)}`));
  const rules: Formula[] = g.cells.map((c) =>
    Atom(Z3.Or(deg.at(c).eq(0), deg.at(c).eq(2))),
  );
  rules.push(Atom(Z3.Or(...g.cells.map((c) => deg.at(c).gt(0)))));
  rules.push(
    Connected(
      where(g.cells, (c) => deg.at(c).gt(0)),
      linked,
    ),
  );
  for (const c of g.cells) {
    const ok = [1, 2, 3, 4].filter((k) => cornerEdges(c, k).every((e) => line.has(e)));
    rules.push(Atom(Z3.Or(tri.at(c).eq(0), ...ok.map((k) => tri.at(c).eq(k)))));
    for (const k of ok)
      rules.push(
        Atom(
          Z3.Implies(
            tri.at(c).eq(k),
            Z3.And(deg.at(c).eq(2), ...cornerEdges(c, k).map((e) => line.at(e))),
          ),
        ),
      );
  }

  const verify: Verify = (a) => {
    const ln = a["line"];
    const t = a["tri"];
    const d = dictOf(g.cells, (c) => at.at(c).reduce((s, e) => s + ln.at(e), 0));
    if (
      g.cells.some((c) => d.at(c) !== 0 && d.at(c) !== 2) ||
      ![...d.values()].some((x) => x > 0)
    )
      return false;
    const nb = dictOf(g.cells, (c) =>
      at
        .at(c)
        .filter((e) => ln.at(e))
        .map((e) => other(e, c)),
    );
    if (comps(g.cells, nb, (c) => d.at(c) > 0).length !== 1) return false;
    return g.cells.every(
      (c) =>
        t.at(c) === 0 ||
        (d.at(c) === 2 && cornerEdges(c, t.at(c)).every((e) => (ln.get(e) ?? 0) === 1)),
    );
  };

  return new Game("Reflect Link", rules, consistent, { line, tri }, verify, {
    line,
    emark,
    at,
    tri,
  });
}

/** Pipe Link (corpus 25), as a consequence of its rules: every square holds a
 * piece, two lines or a crossing of four. The trace's being one is left out;
 * a weaker rule set can only make a technique look less sound. */
export function pipelink(g: Grid): Game<Looped> {
  const { at, line, emark, consistent, deg } = loopBoard(g, "pline");
  const rules = g.cells.map((c) => Atom(Z3.Or(deg.at(c).eq(2), deg.at(c).eq(4))));
  return new Game("Pipe Link", rules, consistent, { line }, () => true, {
    line,
    emark,
    at,
  });
}

/** Pipe Link: a square with only two edges not crossed out takes both, since
 * every square is on the loop. */
export function pipeCorner(g: Grid, gm: Game<Looped>): Technique {
  const { line, emark, at } = gm.extra;
  return new Technique(
    "corner",
    [
      ["c", () => g.cells],
      ["e", () => g.cells.flatMap((c) => at.at(c))],
    ],
    (e) =>
      lift(
        (c: Cell, ed: Edge) =>
          Z3.And(
            Z3.Bool.val(at.at(c).includes(ed)),
            sum(at.at(c).map((x) => ite(emark.at(x).neq(0), 1, 0))).eq(2),
            emark.at(ed).neq(0),
          ),
        e["c"],
        e["e"],
      ),
    (e) => lift((ed: Edge) => line.at(ed), e["e"]),
  );
}
