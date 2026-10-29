/**
 * Group A's constraint games on a grid, as `corpus/` and `collection/` describe
 * them: each game's rules in z3, the same rules as a plain evaluation (the
 * verifier every counterexample must pass), and the techniques stated for it
 * in `techniques.md`.
 *
 * A game is a function of a board that returns a Game. Answers are `value`
 * (and, where a game has them, `clue` and `region`); marks are `mark`. Clues
 * are free variables: 0 is no clue.
 */
import {
  type Adj,
  And,
  type AnswerVars,
  Atom,
  Connected,
  type Dict,
  dictOf,
  type Elem,
  type Env,
  Forall,
  type Formula,
  guards,
  type I,
  ite,
  lift,
  minus,
  Not,
  Reach,
  show,
  sum,
  Technique,
  tup,
  type Verify,
  where,
  Z3,
} from "./pzl.ts";
import { type Cell, DIRS4, type Dir, type Grid, shading } from "./space.ts";

export const UNKNOWN = 2;

export class Game<X = unknown> {
  constructor(
    readonly name: string,
    readonly rules: Formula[],
    readonly consistent: Formula,
    readonly answerVars: AnswerVars,
    readonly verify: Verify | null,
    readonly extra: X,
  ) {}
}

/** What every shading game's techniques read. */
export interface Marked {
  value: Dict<Cell, I>;
  mark: Dict<Cell, I>;
}

export interface Clued extends Marked {
  clue: Dict<Cell, I>;
}

// ------------------------------------------------------------ plain helpers

/** The components of the cells satisfying keep, under adj. */
export function comps<E extends Elem>(
  cells: readonly E[],
  adj: ReadonlyMap<E, readonly E[]>,
  keep: (c: E) => boolean,
): E[][] {
  const seen = new Set<E>();
  const out: E[][] = [];
  for (const c of cells) {
    if (seen.has(c) || !keep(c)) continue;
    const comp: E[] = [];
    const todo = [c];
    seen.add(c);
    while (todo.length > 0) {
      const x = todo.pop() as E;
      comp.push(x);
      for (const y of adj.get(x) ?? [])
        if (!seen.has(y) && keep(y)) {
          seen.add(y);
          todo.push(y);
        }
    }
    out.push(comp);
  }
  return out;
}

export function oneComp<E extends Elem>(
  cells: readonly E[],
  adj: ReadonlyMap<E, readonly E[]>,
  keep: (c: E) => boolean,
): boolean {
  return comps(cells, adj, keep).length <= 1;
}

export function no2x2(g: Grid, v: Dict<Elem, number>, color: number): boolean {
  return g.windows2().every((q) => !q.every((c) => v.at(c) === color));
}

/** Cells seen from c in direction d before the first cell with `stop`. */
export function sight(g: Grid, c: Cell, d: Dir, stop: (x: Cell) => boolean): number {
  let n = 0;
  for (const x of g.ray(c, d)) {
    if (stop(x)) break;
    n++;
  }
  return n;
}

export function isRectangle(cells: readonly Cell[]): boolean {
  const xs = cells.map((c) => c[0]);
  const ys = cells.map((c) => c[1]);
  return (
    cells.length ===
    (Math.max(...xs) - Math.min(...xs) + 1) * (Math.max(...ys) - Math.min(...ys) + 1)
  );
}

export const manhattan = (a: Cell, b: Cell): number =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

// --------------------------------------------------------------- the games

export function clueVars(g: Grid, top: number): { clue: Dict<Cell, I>; dom: Formula } {
  const clue = dictOf(g.cells, (c) => Z3.Int.const(`clue_${show(c)}`));
  const dom = And(
    ...g.cells.map((c) => Atom(Z3.And(clue.at(c).ge(0), clue.at(c).le(top)))),
  );
  return { clue, dom };
}

const noWindow = (g: Grid, value: Dict<Cell, I>, color: number): Formula[] => [
  And(
    ...g
      .windows2()
      .map((q) => Atom(Z3.Not(Z3.And(...q.map((c) => value.at(c).eq(color)))))),
  ),
];

/** Nurikabe (corpus 1): shaded connected, no 2x2 shaded, every island has
 * exactly one clue, its size. */
export function nurikabe(g: Grid): Game<Clued> {
  const { value, mark, domain, consistent } = shading(g.cells);
  const n = g.cells.length;
  const { clue, dom: cdom } = clueVars(g, n);
  const idx = new Map(g.cells.map((c, i) => [c, i]));
  const ix = (c: Cell) => idx.get(c) ?? -1;
  const lab = dictOf(g.cells, (c) => Z3.Int.const(`lab_${show(c)}`));
  const clear = (c: Cell) => value.at(c).eq(0);
  const rules: Formula[] = [
    domain,
    cdom,
    Connected(
      where(g.cells, (c) => value.at(c).eq(1)),
      g.adj4,
    ),
    ...noWindow(g, value, 1),
  ];
  for (const c of g.cells) {
    rules.push(
      Atom(Z3.Implies(clue.at(c).gt(0), Z3.And(clear(c), lab.at(c).eq(ix(c))))),
    );
    rules.push(
      Atom(
        Z3.Implies(
          clear(c),
          Z3.Or(...g.cells.map((k) => Z3.And(lab.at(c).eq(ix(k)), clue.at(k).gt(0)))),
        ),
      ),
    );
    for (const d of g.adj4.at(c))
      rules.push(Atom(Z3.Implies(Z3.And(clear(c), clear(d)), lab.at(c).eq(lab.at(d)))));
  }
  for (const k of g.cells) {
    const isl = where(g.cells, (c) => Z3.And(clear(c), lab.at(c).eq(ix(k))));
    rules.push(
      Atom(
        Z3.Implies(
          clue.at(k).gt(0),
          sum([...isl.values()].map((m) => ite(m, 1, 0))).eq(clue.at(k)),
        ),
      ),
    );
    rules.push(Connected(isl, g.adj4));
  }

  const verify: Verify = (a) => {
    const v = a["value"];
    const cl = a["clue"];
    if (!oneComp(g.cells, g.adj4, (c) => v.at(c) === 1) || !no2x2(g, v, 1))
      return false;
    for (const comp of comps(g.cells, g.adj4, (c) => v.at(c) === 0)) {
      const ks = comp.filter((c) => cl.at(c) > 0);
      if (ks.length !== 1 || cl.at(ks[0]) !== comp.length) return false;
    }
    return g.cells.every((c) => cl.at(c) === 0 || v.at(c) === 0);
  };

  return new Game("Nurikabe", rules, consistent, { value, clue }, verify, {
    value,
    mark,
    clue,
  });
}

/** Mochikoro (corpus 2): clear cells connected diagonally too, every clear
 * area a rectangle holding at most one clue, its size; no 2x2 shaded. */
export function mochikoro(g: Grid): Game<Clued> {
  const { value, mark, domain, consistent } = shading(g.cells);
  const { clue, dom: cdom } = clueVars(g, g.cells.length);
  const idx = new Map(g.cells.map((c, i) => [c, i]));
  const ix = (c: Cell) => idx.get(c) ?? -1;
  const lab = dictOf(g.cells, (c) => Z3.Int.const(`mlab_${show(c)}`));
  const clear = (c: Cell) => value.at(c).eq(0);
  const rules: Formula[] = [
    domain,
    cdom,
    Connected(
      where(g.cells, (c) => value.at(c).eq(0)),
      g.adj8,
    ),
    ...noWindow(g, value, 1),
  ];
  for (const c of g.cells) {
    rules.push(
      Atom(Z3.Implies(clear(c), Z3.And(lab.at(c).ge(0), lab.at(c).lt(g.cells.length)))),
    );
    for (const d of g.adj4.at(c))
      rules.push(Atom(Z3.Implies(Z3.And(clear(c), clear(d)), lab.at(c).eq(lab.at(d)))));
  }
  for (const a of g.cells)
    for (const b of g.cells) {
      if (ix(b) <= ix(a)) continue;
      const box: Cell[] = [];
      for (let x = Math.min(a[0], b[0]); x <= Math.max(a[0], b[0]); x++)
        for (let y = Math.min(a[1], b[1]); y <= Math.max(a[1], b[1]); y++)
          box.push(g.at(x, y) as Cell);
      const same = Z3.And(clear(a), clear(b), lab.at(a).eq(lab.at(b)));
      rules.push(
        Atom(
          Z3.Implies(
            same,
            Z3.And(...box.map((x) => Z3.And(clear(x), lab.at(x).eq(lab.at(a))))),
          ),
        ),
      );
      rules.push(
        Atom(
          Z3.Implies(
            Z3.And(clue.at(a).gt(0), clue.at(b).gt(0)),
            lab.at(a).neq(lab.at(b)),
          ),
        ),
      );
    }
  for (const c of g.cells) {
    const size = sum(
      g.cells.map((x) => ite(Z3.And(clear(x), lab.at(x).eq(lab.at(c))), 1, 0)),
    );
    rules.push(
      Atom(Z3.Implies(clue.at(c).gt(0), Z3.And(clear(c), size.eq(clue.at(c))))),
    );
  }

  const verify: Verify = (a) => {
    const v = a["value"];
    const cl = a["clue"];
    if (!oneComp(g.cells, g.adj8, (c) => v.at(c) === 0) || !no2x2(g, v, 1))
      return false;
    for (const comp of comps(g.cells, g.adj4, (c) => v.at(c) === 0)) {
      const ks = comp.filter((c) => cl.at(c) > 0);
      if (
        !isRectangle(comp) ||
        ks.length > 1 ||
        ks.some((k) => cl.at(k) !== comp.length)
      )
        return false;
    }
    return g.cells.every((c) => cl.at(c) === 0 || v.at(c) === 0);
  };

  return new Game("Mochikoro", rules, consistent, { value, clue }, verify, {
    value,
    mark,
    clue,
  });
}

/** Nurikabe's `unreachable` (corpus 1), in the form that reads the clues and
 * the board alone: a cell farther from every clue than the clue's island can
 * stretch is shaded. */
export function nurikabeUnreachable(g: Grid, gm: Game<Clued>): Technique {
  const { value, mark, clue } = gm.extra;
  return new Technique(
    "unreachable",
    [["c", () => g.cells]],
    (e) =>
      lift(
        (c: Cell) =>
          Z3.And(
            mark.at(c).eq(UNKNOWN),
            Z3.And(
              ...g.cells.map((k) =>
                Z3.Implies(clue.at(k).gt(0), clue.at(k).le(manhattan(k, c))),
              ),
            ),
          ),
        e["c"],
      ),
    (e) => lift((c: Cell) => value.at(c).eq(1), e["c"]),
  );
}

/** Mochikoro's rectangle completion: three clear cells of a 2x2 window make
 * the fourth clear, since a clear area is a rectangle. */
export function mochikoroRectangle(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  const wins = g.windows2().map((q) => tupOf(q));
  return new Technique(
    "rectangle",
    [
      ["q", () => wins],
      ["c", () => wins.flat()],
    ],
    (e) =>
      lift(
        (q: readonly Cell[], c: Cell) =>
          Z3.And(
            Z3.Bool.val(q.includes(c)),
            ...q.filter((x) => x !== c).map((x) => mark.at(x).eq(0)),
          ),
        e["q"],
        e["c"],
      ),
    (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
  );
}

/** No 2x2 of one color: three of a window marked x make the fourth not x. */
export function windowsCompletion(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  const wins = g.windows2().map((q) => tupOf(q));
  return new Technique(
    "no2x2",
    [
      ["q", () => wins],
      ["c", () => g.cells],
      ["x", () => [0, 1]],
    ],
    (e) =>
      lift(
        (q: readonly Cell[], c: Cell, x: number) =>
          Z3.And(
            Z3.Bool.val(q.includes(c)),
            ...q.filter((y) => y !== c).map((y) => mark.at(y).eq(x)),
          ),
        e["q"],
        e["c"],
        e["x"],
      ),
    (e) => lift((c: Cell, x: number) => value.at(c).neq(x), e["c"], e["x"]),
  );
}

/** A list of cells as one interned element, a window or a run. */
export function tupOf(cells: readonly Cell[]): readonly Cell[] {
  return tup(...cells);
}

// ----------------------------------------------------- Yin-Yang and Unruly

/** Yin-Yang (corpus 7): each color connected, no 2x2 of one color. */
export function yinyang(g: Grid): Game<Marked> {
  const { value, mark, domain, consistent } = shading(g.cells);
  const rules: Formula[] = [
    domain,
    Connected(
      where(g.cells, (c) => value.at(c).eq(0)),
      g.adj4,
    ),
    Connected(
      where(g.cells, (c) => value.at(c).eq(1)),
      g.adj4,
    ),
    And(
      ...g
        .windows2()
        .map((q) =>
          Atom(
            Z3.Not(
              Z3.Or(
                Z3.And(...q.map((c) => value.at(c).eq(0))),
                Z3.And(...q.map((c) => value.at(c).eq(1))),
              ),
            ),
          ),
        ),
    ),
  ];

  const verify: Verify = (a) => {
    const v = a["value"];
    return (
      oneComp(g.cells, g.adj4, (c) => v.at(c) === 0) &&
      oneComp(g.cells, g.adj4, (c) => v.at(c) === 1) &&
      no2x2(g, v, 0) &&
      no2x2(g, v, 1)
    );
  };

  return new Game("Yin-Yang", rules, consistent, { value }, verify, { value, mark });
}

/** Unruly (collection): no three in a row of one color, every row and column
 * half each color. */
export function unruly(g: Grid): Game<Marked> {
  const { value, mark, domain, consistent } = shading(g.cells);
  const rules: Formula[] = [
    domain,
    ...g
      .runs(3)
      .map(([a, b, c]) =>
        Atom(Z3.Not(Z3.And(value.at(a).eq(value.at(b)), value.at(b).eq(value.at(c))))),
      ),
    ...[...g.rows, ...g.cols].map((L) =>
      Atom(
        sum(L.map((c) => value.at(c)))
          .mul(2)
          .eq(L.length),
      ),
    ),
  ];

  const verify: Verify = (a) => {
    const v = a["value"];
    if (g.runs(3).some(([x, y, z]) => v.at(x) === v.at(y) && v.at(y) === v.at(z)))
      return false;
    return [...g.rows, ...g.cols].every(
      (L) => 2 * L.reduce((t, c) => t + v.at(c), 0) === L.length,
    );
  };

  return new Game("Unruly", rules, consistent, { value }, verify, { value, mark });
}

export function unrulyThrees(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  const runs = g.runs(3).map((t) => tupOf(t));
  return new Technique(
    "threes",
    [
      ["t", () => runs],
      ["x", () => [0, 1]],
    ],
    (e) =>
      lift(
        (t: readonly Cell[], x: number) =>
          Z3.And(mark.at(t[0]).eq(x), mark.at(t[1]).eq(x)),
        e["t"],
        e["x"],
      ),
    (e) =>
      lift((t: readonly Cell[], x: number) => value.at(t[2]).neq(x), e["t"], e["x"]),
  );
}

// ------------------------------------------------------------ Range and Cave

/** 1 + the clear cells seen from c in the four directions, until shaded. */
export function seesTerms(g: Grid, value: Dict<Cell, I>): Dict<Cell, I> {
  return dictOf(g.cells, (c) => {
    let total: I = Z3.Int.val(1);
    for (const d of DIRS4) {
      const ray = g.ray(c, d);
      for (let i = 0; i < ray.length; i++)
        total = total.add(
          ite(Z3.And(...ray.slice(0, i + 1).map((x) => value.at(x).eq(0))), 1, 0),
        );
    }
    return total;
  });
}

export function seesOk(
  g: Grid,
  v: Dict<Elem, number>,
  cl: Dict<Elem, number>,
): boolean {
  for (const c of g.cells)
    if (cl.at(c) > 0) {
      if (v.at(c) !== 0) return false;
      const seen = DIRS4.reduce((t, d) => t + sight(g, c, d, (x) => v.at(x) === 1), 0);
      if (1 + seen !== cl.at(c)) return false;
    }
  return true;
}

const noTouch = (g: Grid, value: Dict<Cell, I>): Formula =>
  And(
    ...g.cells.flatMap((a) =>
      g.adj4
        .at(a)
        .map((b) => Atom(Z3.Not(Z3.And(value.at(a).eq(1), value.at(b).eq(1))))),
    ),
  );

/** Range (collection sample): no two shaded touch, clear connected, a clue
 * sees its number of cells. */
export function rangeGame(g: Grid): Game<Clued> {
  const { value, mark, domain, consistent } = shading(g.cells);
  const { clue, dom: cdom } = clueVars(g, g.w + g.h - 1);
  const s = seesTerms(g, value);
  const rules: Formula[] = [
    domain,
    cdom,
    Connected(
      where(g.cells, (c) => value.at(c).eq(0)),
      g.adj4,
    ),
    noTouch(g, value),
    ...g.cells.map((c) =>
      Atom(
        Z3.Implies(clue.at(c).gt(0), Z3.And(value.at(c).eq(0), s.at(c).eq(clue.at(c)))),
      ),
    ),
  ];

  const verify: Verify = (a) => {
    const v = a["value"];
    const cl = a["clue"];
    return (
      oneComp(g.cells, g.adj4, (c) => v.at(c) === 0) &&
      g.cells.every((x) =>
        g.adj4.at(x).every((y) => !(v.at(x) === 1 && v.at(y) === 1)),
      ) &&
      seesOk(g, v, cl)
    );
  };

  return new Game("Range", rules, consistent, { value, clue }, verify, {
    value,
    mark,
    clue,
  });
}

/** Cave (corpus 9): clear connected, every shaded group reaches the rim, a
 * clue sees its number of cells; shaded cells may touch. */
export function cave(g: Grid): Game<Clued> {
  const { value, mark, domain, consistent } = shading(g.cells);
  const { clue, dom: cdom } = clueVars(g, g.w + g.h - 1);
  const s = seesTerms(g, value);
  const shaded = where(g.cells, (c) => value.at(c).eq(1));
  const rim = dictOf(g.cells, (c) => Z3.And(value.at(c).eq(1), Z3.Bool.val(g.rim(c))));
  const rules: Formula[] = [
    domain,
    cdom,
    Connected(
      where(g.cells, (c) => value.at(c).eq(0)),
      g.adj4,
    ),
    Forall(shaded, (c) => Reach(rim, c, shaded, g.adj4)),
    ...g.cells.map((c) =>
      Atom(
        Z3.Implies(clue.at(c).gt(0), Z3.And(value.at(c).eq(0), s.at(c).eq(clue.at(c)))),
      ),
    ),
  ];

  const verify: Verify = (a) => {
    const v = a["value"];
    const cl = a["clue"];
    return (
      oneComp(g.cells, g.adj4, (c) => v.at(c) === 0) &&
      comps(g.cells, g.adj4, (c) => v.at(c) === 1).every((comp) =>
        comp.some((x) => g.rim(x)),
      ) &&
      seesOk(g, v, cl)
    );
  };

  return new Game("Cave", rules, consistent, { value, clue }, verify, {
    value,
    mark,
    clue,
  });
}

/** Range's `connect` (experiment C): a cell whose shading would part two
 * cells not shaded is clear. */
export function rangeConnect(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  const premise = (e: Env): Formula => {
    const within = minus(
      where(g.cells, (x) => mark.at(x).neq(1)),
      e["c"],
    );
    return And(
      lift((c: Cell) => mark.at(c).eq(UNKNOWN), e["c"]),
      lift((p: Cell) => mark.at(p).neq(1), e["p"]),
      lift((q: Cell) => mark.at(q).neq(1), e["q"]),
      Not(Reach(guards(e["p"]), e["q"], within, g.adj4 as Adj<Elem>)),
    );
  };
  return new Technique(
    "connect",
    [
      ["c", () => g.cells],
      ["p", (e) => minus(g.cells, e["c"])],
      ["q", (e) => minus(g.cells, e["c"])],
    ],
    premise,
    (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
  );
}

/** Range's `adjacency`: a cell beside a shaded cell is clear. */
export function rangeAdjacency(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  return new Technique(
    "adjacency",
    [
      ["s", () => g.cells],
      ["c", () => g.cells],
    ],
    (e) =>
      lift(
        (s: Cell, c: Cell) =>
          Z3.And(mark.at(s).eq(1), Z3.Bool.val(g.adj4.at(s).includes(c))),
        e["s"],
        e["c"],
      ),
    (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
  );
}

/** Cave: a cell off the rim whose every neighbor is clear is clear, since a
 * shaded cell there could not reach the rim. */
export function caveEnclosed(g: Grid, gm: Game<Marked>): Technique {
  const { value, mark } = gm.extra;
  return new Technique(
    "enclosed",
    [["c", () => g.cells]],
    (e) =>
      lift(
        (c: Cell) =>
          Z3.And(Z3.Bool.val(!g.rim(c)), ...g.adj4.at(c).map((d) => mark.at(d).eq(0))),
        e["c"],
      ),
    (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
  );
}
