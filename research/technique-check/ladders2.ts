/**
 * Group C's other stated ladders (`techniques.md` § "Group C"): Ascent across
 * its adjacencies and a board shape, Path and Pairs, Flip's two press
 * patterns, and Net with and without wrapping.
 */

import { type Edge, edge, other } from "./numbers_loops.ts";
import {
  type Adj,
  And,
  Atom,
  type B,
  Connected,
  cmp,
  Dict,
  dictOf,
  type Elem,
  type Env,
  type Formula,
  type I,
  ite,
  type Link,
  lift,
  type Node,
  Not,
  Reach,
  range,
  show,
  sum,
  Technique,
  tup,
  type Verify,
  Z3,
} from "./pzl.ts";
import { comps, Game } from "./shading.ts";
import { type Cell, cd, cell, type Dir, mod } from "./space.ts";

// ------------------------------------------------------------------ Ascent

const HEX: readonly Dir[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
];
const ORTH: readonly Dir[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const KING: readonly Dir[] = [...ORTH, [1, 1], [1, -1], [-1, 1], [-1, -1]];

function cellsOf(w: number, h: number, walls: readonly Cell[] = []): Cell[] {
  const out: Cell[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const c = cell(x, y);
      if (!walls.includes(c)) out.push(c);
    }
  return out;
}

export interface AscentExtra {
  value: Dict<Cell, I>;
  cand: Dict<string, B>;
  cells: Cell[];
  adj: Dict<Cell, Cell[]>;
  dist: (a: Cell, b: Cell) => number;
  near: (a: Cell, b: Cell) => boolean;
  N: number;
}

/** Ascent (language.md's sample): the numbers 1..N on the board's cells, each
 * next to the one before under the mode's adjacency. `walls` removes cells
 * from the board, a board shape. `dist` and `near` are the code's: the mode's
 * metric on the whole rectangle, walls ignored. */
export function ascent(
  w: number,
  h: number,
  mode: string,
  walls: readonly Cell[] = [],
): Game<AscentExtra> {
  const dirs = mode === "orth" ? ORTH : mode === "hex" ? HEX : KING;
  const cells = cellsOf(w, h, walls);
  const adj = dictOf(cells, (c) =>
    dirs.map(([dx, dy]) => cell(c[0] + dx, c[1] + dy)).filter((d) => cells.includes(d)),
  );
  const N = cells.length;

  const dist = (a: Cell, b: Cell): number => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    if (mode === "orth") return Math.abs(dx) + Math.abs(dy);
    if (mode === "classic") return Math.max(Math.abs(dx), Math.abs(dy));
    return dx * dy > 0
      ? Math.abs(dx) + Math.abs(dy)
      : Math.max(Math.abs(dx), Math.abs(dy));
  };

  const near = (a: Cell, b: Cell) => a !== b && dist(a, b) === 1;
  const value = dictOf(cells, (c) => Z3.Int.const(`a_${show(c)}`));
  const nums = range(1, N + 1);
  const cand = new Dict<string, B>();
  for (const c of cells)
    for (const n of nums) cand.set(cd(c, n), Z3.Bool.const(`acand_${show(c)}_${n}`));
  const rules: Formula[] = [
    Atom(Z3.And(...cells.map((c) => Z3.And(value.at(c).ge(1), value.at(c).le(N))))),
    Atom(Z3.Distinct(...value.values())),
    ...cells.map((c) =>
      Atom(
        Z3.Implies(
          value.at(c).lt(N),
          Z3.Or(...adj.at(c).map((d) => value.at(d).eq(value.at(c).add(1)))),
        ),
      ),
    ),
  ];
  const consistent = Atom(
    Z3.And(
      ...cells.flatMap((c) =>
        nums.map((n) => Z3.Implies(value.at(c).eq(n), cand.at(cd(c, n)))),
      ),
    ),
  );

  const verify: Verify = (a) => {
    const v = a["value"];
    const got = cells.map((c) => v.at(c)).sort((p, q) => p - q);
    if (!got.every((x, i) => x === nums[i])) return false;
    const at = new Map(cells.map((c) => [v.at(c), c]));
    return nums.slice(0, -1).every((n) => {
      const here = at.get(n);
      const next = at.get(n + 1);
      return here !== undefined && next !== undefined && adj.at(here).includes(next);
    });
  };

  const name = `Ascent ${mode}${walls.length > 0 ? " walled" : ""} ${w}x${h}`;
  return new Game(name, rules, consistent, { value }, verify, {
    value,
    cand,
    cells,
    adj,
    dist,
    near,
    N,
  });
}

export function ascentLadder(gm: Game<AscentExtra>): Technique[] {
  const { value, cand, cells, adj, dist, near, N } = gm.extra;
  const nums = range(1, N + 1);
  const placed = (p: Cell, m: number) =>
    Z3.And(...nums.filter((k) => k !== m).map((k) => Z3.Not(cand.at(cd(p, k)))));
  return [
    new Technique(
      "singlePosition",
      [
        ["n", () => nums],
        ["c", () => cells],
      ],
      (e) =>
        lift(
          (n: number, c: Cell) =>
            Z3.And(
              ...cells.filter((x) => x !== c).map((x) => Z3.Not(cand.at(cd(x, n)))),
            ),
          e["n"],
          e["c"],
        ),
      (e) => lift((n: number, c: Cell) => value.at(c).eq(n), e["n"], e["c"]),
    ),
    new Technique(
      "proximity",
      [
        ["p", () => cells],
        ["m", () => nums],
        ["k", () => nums],
        ["c", () => cells],
      ],
      (e) =>
        lift(
          (p: Cell, m: number, k: number, c: Cell) =>
            Z3.And(placed(p, m), Z3.Bool.val(c !== p && dist(c, p) > Math.abs(m - k))),
          e["p"],
          e["m"],
          e["k"],
          e["c"],
        ),
      (e) => lift((k: number, c: Cell) => value.at(c).neq(k), e["k"], e["c"]),
    ),
    new Technique(
      "overlap",
      [
        ["n", () => nums],
        ["c", () => cells],
        ["s", () => [-1, 1]],
      ],
      (e) =>
        lift(
          (n: number, c: Cell, s: number) =>
            n + s >= 1 && n + s <= N
              ? Z3.And(
                  ...cells
                    .filter((x) => near(x, c))
                    .map((x) => Z3.Not(cand.at(cd(x, n + s)))),
                )
              : Z3.Bool.val(false),
          e["n"],
          e["c"],
          e["s"],
        ),
      (e) => lift((n: number, c: Cell) => value.at(c).neq(n), e["n"], e["c"]),
    ),
    new Technique(
      "deadEnd",
      [["c", () => cells.filter((c) => adj.at(c).length === 1)]],
      () => Atom(Z3.Bool.val(true)),
      (e) => lift((c: Cell) => Z3.Or(value.at(c).eq(1), value.at(c).eq(N)), e["c"]),
    ),
    new Technique(
      "singleNumber",
      [
        ["c", () => cells],
        ["n", () => nums],
      ],
      (e) =>
        lift(
          (c: Cell, n: number) =>
            Z3.And(
              ...nums.filter((k) => k !== n).map((k) => Z3.Not(cand.at(cd(c, k)))),
            ),
          e["c"],
          e["n"],
        ),
      (e) => lift((c: Cell, n: number) => value.at(c).eq(n), e["c"], e["n"]),
    ),
  ];
}

// -------------------------------------------------------------- Path, Pairs

export interface PathExtra {
  line: Dict<Edge, B>;
  emark: Dict<Edge, I>;
  clue: Dict<Cell, I>;
  cells: Cell[];
  edges: Edge[];
  at: Dict<Cell, Edge[]>;
  takes: (c: Cell) => I;
  fits: (p: I, q: I) => B;
  adj: Dict<Cell, Cell[]>;
}

const everyCell = (cells: readonly Cell[]) => dictOf<Cell, boolean>(cells, () => true);

/** Path (collection) in its two rulesets. Lines on edges; a square with no
 * number takes two, a numbered one `takes` (Path: one at 1 and the highest,
 * else two; Pairs: one); no cycle; two numbers joined by a line through
 * unnumbered squares must `fits` (Path: differ by one; Pairs: equal). The deal
 * is part of a board: Path's numbers are 1..K once each, Pairs' each on two
 * squares. */
export function pathGame(w: number, h: number, mode: string, top = 4): Game<PathExtra> {
  const cells = cellsOf(w, h);
  const adj = dictOf(cells, (c) =>
    [
      cell(c[0] + 1, c[1]),
      cell(c[0] - 1, c[1]),
      cell(c[0], c[1] + 1),
      cell(c[0], c[1] - 1),
    ].filter((d) => cells.includes(d)),
  );
  const edgeSet = new Set<Edge>();
  for (const a of cells) for (const b of adj.at(a)) edgeSet.add(edge(a, b));
  const edges = [...edgeSet].sort(cmp);
  const at = dictOf(cells, (c) => edges.filter((e) => e.includes(c)));
  const line = dictOf(edges, (e) => Z3.Bool.const(`pl_${show(e)}`));
  const emark = dictOf(edges, (e) => Z3.Int.const(`pm_${show(e)}`));
  const clue = dictOf(cells, (c) => Z3.Int.const(`pc_${show(c)}`));
  const K = Z3.Int.const("pK");
  const deg = dictOf(cells, (c) => sum(at.at(c).map((e) => ite(line.at(e), 1, 0))));
  const numbered = (c: Cell) => clue.at(c).gt(0);

  const takes = (c: Cell): I => {
    if (mode === "pairs") return ite(numbered(c), 1, 2);
    return ite(Z3.And(numbered(c), Z3.Or(clue.at(c).eq(1), clue.at(c).eq(K))), 1, 2);
  };

  const fits = (p: I, q: I): B =>
    mode === "path" ? Z3.Or(p.sub(q).eq(1), q.sub(p).eq(1)) : p.eq(q);

  const linked = dictOf(cells, (c) =>
    at.at(c).map((e): Link<Cell> => [other(e, c), line.at(e)]),
  );
  const countOf = (n: number) => sum(cells.map((c) => ite(clue.at(c).eq(n), 1, 0)));
  const rules: Formula[] = [
    Atom(Z3.And(...cells.map((c) => Z3.And(clue.at(c).ge(0), clue.at(c).le(top))))),
    Atom(Z3.And(K.ge(2), K.le(top))),
  ];
  if (mode === "path")
    rules.push(
      ...range(1, top + 1).map((n) => Atom(countOf(n).eq(ite(K.ge(n), 1, 0)))),
    );
  else
    rules.push(
      ...range(1, top + 1).map((n) => Atom(Z3.Or(countOf(n).eq(0), countOf(n).eq(2)))),
    );
  rules.push(...cells.map((c) => Atom(deg.at(c).eq(takes(c)))));
  // No cycle: a line's two ends are never otherwise joined.
  for (const e of edges) {
    const [a, b] = e;
    const others = dictOf(cells, (c) =>
      at
        .at(c)
        .filter((x) => x !== e)
        .map((x): Link<Cell> => [other(x, c), line.at(x)]),
    );
    rules.push(
      Atom(
        Z3.Implies(
          line.at(e),
          Not(Reach(new Map([[a, true]]), b, everyCell(cells), others)).z(1),
        ),
      ),
    );
  }
  // Joined numbers fit: a chain from a to b through unnumbered squares.
  for (const a of cells)
    for (const b of cells)
      if (cmp(a, b) < 0) {
        const inner = dictOf(cells, (c) =>
          Z3.Or(Z3.Not(numbered(c)), Z3.Bool.val(c === a || c === b)),
        );
        const chain = Reach(new Map([[a, true]]), b, inner, linked);
        rules.push(
          Atom(
            Z3.Implies(
              Z3.And(numbered(a), numbered(b)),
              Z3.Or(Not(chain).z(1), fits(clue.at(a), clue.at(b))),
            ),
          ),
        );
      }
  const consistent = Atom(
    Z3.And(
      ...edges.map((e) =>
        Z3.And(
          emark.at(e).ge(0),
          emark.at(e).le(2),
          Z3.Implies(emark.at(e).neq(2), Z3.Eq(emark.at(e).eq(1), line.at(e))),
        ),
      ),
    ),
  );

  const verify: Verify = (a) => {
    const ln = a["line"];
    const cl = a["clue"];
    const vals = cells.map((c) => cl.at(c));
    const k = Math.max(...vals);
    if (mode === "path") {
      const got = vals.filter((v) => v !== 0).sort((p, q) => p - q);
      if (got.length !== k || !got.every((v, i) => v === i + 1)) return false;
    }
    if (
      mode === "pairs" &&
      range(1, top + 1).some(
        (n) => ![0, 2].includes(vals.filter((v) => v === n).length),
      )
    )
      return false;
    for (const c of cells) {
      const want = !cl.at(c)
        ? 2
        : mode === "pairs" || cl.at(c) === 1 || cl.at(c) === k
          ? 1
          : 2;
      if (at.at(c).reduce((t, e) => t + ln.at(e), 0) !== want) return false;
    }
    const nb = dictOf(cells, (c) =>
      at
        .at(c)
        .filter((e) => ln.at(e))
        .map((e) => other(e, c)),
    );
    for (const comp of comps(cells, nb, () => true)) {
      const es = edges.filter((e) => ln.at(e) && comp.includes(e[0]));
      if (es.length !== comp.length - 1) return false;
      const ends = comp.filter((c) => cl.at(c));
      // walk the piece from each numbered square to the next numbered one
      for (const s of ends)
        for (const first of nb.at(s)) {
          let prev = s;
          let cur = first;
          while (!cl.at(cur)) {
            const nxt = nb.at(cur).filter((x) => x !== prev);
            if (nxt.length === 0) break;
            prev = cur;
            cur = nxt[0];
          }
          if (cl.at(cur)) {
            const p = cl.at(s);
            const q = cl.at(cur);
            if (
              (mode === "path" && Math.abs(p - q) !== 1) ||
              (mode === "pairs" && p !== q)
            )
              return false;
          }
        }
    }
    return true;
  };

  const name = `${mode === "path" ? "Path" : "Pairs"} ${w}x${h}`;
  return new Game(name, rules, consistent, { line, clue }, verify, {
    line,
    emark,
    clue,
    cells,
    edges,
    at,
    takes,
    fits,
    adj,
  });
}

/** Path's rungs, general in `takes` and `fits`: each reads them from the game
 * it is checked in. */
export function pathLadder(gm: Game<PathExtra>): Technique[] {
  const { line, emark, clue, cells, edges, at, takes, fits, adj } = gm.extra;
  const linesAt = (c: Cell) => sum(at.at(c).map((e) => ite(emark.at(e).eq(1), 1, 0)));
  const spare = (c: Cell) => linesAt(c).lt(takes(c));
  const live = (e: Edge) => Z3.And(emark.at(e).eq(2), spare(e[0]), spare(e[1]));
  const marked: Adj<Cell> = dictOf(cells, (c) =>
    at.at(c).map((e): Link<Cell> => [other(e, c), emark.at(e).eq(1)]),
  );

  /** p is the number at a, or reached from a along drawn lines through
   * unnumbered squares. */
  const endOf = (a: Cell, p: Cell): B => {
    const inner = dictOf(cells, (c) => Z3.Or(clue.at(c).eq(0), Z3.Bool.val(c === p)));
    return Z3.And(
      clue.at(p).gt(0),
      a !== p
        ? Z3.Or(
            Z3.Bool.val(a === p),
            Reach(new Map([[a, Z3.Bool.val(true)]]), p, inner, marked).z(1),
          )
        : Z3.Bool.val(true),
    );
  };

  return [
    new Technique(
      "forced",
      [
        ["c", () => cells],
        ["e", () => edges],
      ],
      (e) =>
        lift(
          (c: Cell, ed: Edge) =>
            Z3.And(
              Z3.Bool.val(at.at(c).includes(ed)),
              live(ed),
              spare(c),
              linesAt(c)
                .add(sum(at.at(c).map((x) => ite(live(x), 1, 0))))
                .eq(takes(c)),
            ),
          e["c"],
          e["e"],
        ),
      (e) => lift((ed: Edge) => line.at(ed), e["e"]),
    ),
    new Technique(
      "joined",
      [
        ["e", () => edges],
        ["p", () => cells],
        ["q", () => cells],
      ],
      (e) =>
        lift(
          (ed: Edge, p: Cell, q: Cell) =>
            Z3.And(
              Z3.Bool.val(p !== q),
              emark.at(ed).eq(2),
              Z3.And(
                Z3.Or(clue.at(ed[0]).eq(0), Z3.Bool.val(ed[0] === p)),
                Z3.Or(clue.at(ed[1]).eq(0), Z3.Bool.val(ed[1] === q)),
              ),
              endOf(ed[0], p),
              endOf(ed[1], q),
              Z3.Not(fits(clue.at(p), clue.at(q))),
            ),
          e["e"],
          e["p"],
          e["q"],
        ),
      (e) => lift((ed: Edge) => Z3.Not(line.at(ed)), e["e"]),
    ),
    new Technique(
      "closed",
      [["e", () => edges]],
      (e) =>
        lift(
          (ed: Edge) =>
            Z3.And(
              emark.at(ed).eq(2),
              Reach(
                new Map([[ed[0], Z3.Bool.val(true)]]),
                ed[1],
                everyCell(cells),
                marked,
              ).z(1),
            ),
          e["e"],
        ),
      (e) => lift((ed: Edge) => Z3.Not(line.at(ed)), e["e"]),
    ),
    // stuck: a line on e fills a, so a's other open edges die; a neighbor c of
    // a then cannot reach its count.
    new Technique(
      "stuck",
      [
        ["e", () => edges],
        ["i", () => [0, 1]],
        ["c", () => cells],
      ],
      (e) =>
        lift(
          (ed: Edge, i: number, c: Cell) =>
            Z3.And(
              Z3.Bool.val(adj.at(ed[i]).includes(c) && c !== ed[1 - i]),
              emark.at(ed).eq(2),
              linesAt(ed[i]).add(1).eq(takes(ed[i])),
              linesAt(c)
                .add(
                  sum(
                    at
                      .at(c)
                      .filter((x) => !x.includes(ed[i]))
                      .map((x) => ite(live(x), 1, 0)),
                  ),
                )
                .lt(takes(c)),
            ),
          e["e"],
          e["i"],
          e["c"],
        ),
      (e) => lift((ed: Edge) => Z3.Not(line.at(ed)), e["e"]),
    ),
  ];
}

// -------------------------------------------------------------------- Flip

/** Whether an odd number of the formulas hold. */
export function parity(bs: readonly B[]): B {
  let out: B = Z3.Bool.val(false);
  for (const b of bs) out = Z3.Xor(out, b);
  return out;
}

export interface FlipExtra {
  press: Dict<Cell, B>;
  unlit: Dict<Cell, B>;
  pmark: Dict<Cell, I>;
  /** Whether pressing i flips j, keyed by `tup(i, j)`. */
  M: Dict<Elem, B>;
  cells: Cell[];
  order: Map<Cell, number>;
}

/** Flip (collection): pressing a square flips a pattern; the answer is a set
 * of presses that leaves every square lit. Crosses' pattern is the square and
 * its four neighbors; Random's, the square and a dealt selection of its eight,
 * here variables. */
export function flip(w: number, h: number, mode: string): Game<FlipExtra> {
  const cells = cellsOf(w, h);
  const order = new Map(cells.map((c, i) => [c, i]));
  const press = dictOf(cells, (c) => Z3.Bool.const(`fp_${show(c)}`));
  const unlit = dictOf(cells, (c) => Z3.Bool.const(`fu_${show(c)}`));
  const pmark = dictOf(cells, (c) => Z3.Int.const(`fm_${show(c)}`));
  const M = new Dict<Elem, B>();
  for (const i of cells)
    for (const j of cells) {
      const cheb = Math.max(Math.abs(i[0] - j[0]), Math.abs(i[1] - j[1]));
      const taxi = Math.abs(i[0] - j[0]) + Math.abs(i[1] - j[1]);
      M.set(
        tup(i, j),
        mode === "crosses"
          ? Z3.Bool.val(i === j || taxi === 1)
          : i === j
            ? Z3.Bool.val(true)
            : cheb === 1
              ? Z3.Bool.const(`fM_${show(i)}_${show(j)}`)
              : Z3.Bool.val(false),
      );
    }
  const flips = (j: Cell) => cells.map((i) => Z3.And(M.at(tup(i, j)), press.at(i)));
  const rules = cells.map((j) => Atom(Z3.Eq(unlit.at(j), parity(flips(j)))));
  const consistent = Atom(
    Z3.And(
      ...cells.map((c) =>
        Z3.And(
          pmark.at(c).ge(0),
          pmark.at(c).le(2),
          Z3.Implies(pmark.at(c).neq(2), Z3.Eq(pmark.at(c).eq(1), press.at(c))),
        ),
      ),
    ),
  );
  return new Game(`Flip ${mode} ${w}x${h}`, rules, consistent, {}, null, {
    press,
    unlit,
    pmark,
    M,
    cells,
    order,
  });
}

/** lastChance, general in the pattern: for the last flipper i of square j in
 * reading order, every other flipper of j decided, j still unlit after them:
 * press i. */
export function flipLadder(gm: Game<FlipExtra>): Technique[] {
  const { press, unlit, pmark, M, cells, order } = gm.extra;
  const ord = (c: Cell) => order.get(c) ?? -1;

  const premise = (i: Cell, j: Cell): B => {
    const last = Z3.And(
      M.at(tup(i, j)),
      ...cells.filter((k) => ord(k) > ord(i)).map((k) => Z3.Not(M.at(tup(k, j)))),
    );
    const decided = Z3.And(
      ...cells
        .filter((k) => k !== i)
        .map((k) => Z3.Implies(M.at(tup(k, j)), pmark.at(k).neq(2))),
    );
    const after = parity([
      unlit.at(j),
      ...cells
        .filter((k) => k !== i)
        .map((k) => Z3.And(M.at(tup(k, j)), pmark.at(k).eq(1))),
    ]);
    return Z3.And(last, decided, after);
  };

  return [
    new Technique(
      "lastChance",
      [
        ["i", () => cells],
        ["j", () => cells],
      ],
      (e) => lift(premise, e["i"], e["j"]),
      (e) => lift((i: Cell) => press.at(i), e["i"]),
    ),
  ];
}

// --------------------------------------------------------------------- Net

/** N E S W, a quarter turn clockwise each. */
const NET_DIRS: readonly Dir[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

export interface NetExtra {
  cells: Cell[];
  nbr: (c: Cell, d: number) => Cell | null;
  wireR: (c: Cell, d: number, r: number) => B;
  cand: Dict<string, B>;
  rot: Dict<Cell, I>;
  barrier: Dict<string, B>;
}

/** Net (collection): each tile turned so the wires form one tree over every
 * tile. The dealt masks and barriers are variables, so a check covers every
 * deal. Without wrapping the border is a wall. */
export function net(w: number, h: number, wrap: boolean): Game<NetExtra> {
  const cells = cellsOf(w, h);

  const nbr = (c: Cell, d: number): Cell | null => {
    const x = c[0] + NET_DIRS[d][0];
    const y = c[1] + NET_DIRS[d][1];
    if (wrap) return cell(mod(x, w), mod(y, h));
    return x >= 0 && x < w && y >= 0 && y < h ? cell(x, y) : null;
  };

  const mask = new Dict<string, B>();
  const cand = new Dict<string, B>();
  const barrier = new Dict<string, B>();
  for (const c of cells)
    for (const d of range(4)) mask.set(cd(c, d), Z3.Bool.const(`nm_${show(c)}_${d}`));
  const rot = dictOf(cells, (c) => Z3.Int.const(`nr_${show(c)}`));
  for (const c of cells)
    for (const r of range(4)) cand.set(cd(c, r), Z3.Bool.const(`nc_${show(c)}_${r}`));
  for (const c of cells)
    for (const d of range(4))
      barrier.set(cd(c, d), Z3.Bool.const(`nb_${show(c)}_${d}`));
  const wireR = (c: Cell, d: number, r: number) => mask.at(cd(c, mod(d - r, 4)));
  const wire = (c: Cell, d: number) =>
    Z3.Or(...range(4).map((r) => Z3.And(rot.at(c).eq(r), wireR(c, d, r))));
  const rules: Formula[] = cells.map((c) =>
    Atom(Z3.And(rot.at(c).ge(0), rot.at(c).le(3))),
  );
  const links = new Dict<Cell, Link<Cell>[]>();
  for (const c of cells) {
    links.set(c, []);
    for (const d of range(4)) {
      const u = nbr(c, d);
      if (u === null) {
        rules.push(Atom(Z3.Not(wire(c, d))));
        continue;
      }
      rules.push(Atom(Z3.Eq(wire(c, d), wire(u, (d + 2) % 4))));
      rules.push(Atom(Z3.Eq(barrier.at(cd(c, d)), barrier.at(cd(u, (d + 2) % 4)))));
      rules.push(Atom(Z3.Implies(barrier.at(cd(c, d)), Z3.Not(wire(c, d)))));
      links.at(c).push([u, wire(c, d)]);
    }
    rules.push(Atom(Z3.Or(...range(4).map((d) => wire(c, d)))));
  }
  rules.push(Connected(everyCell(cells), links));
  const edgesUsed = sum(
    cells.flatMap((c) =>
      [1, 2].filter((d) => nbr(c, d) !== null).map((d) => ite(wire(c, d), 1, 0)),
    ),
  );
  rules.push(Atom(edgesUsed.eq(cells.length - 1)));
  const consistent = Atom(
    Z3.And(
      ...cells.flatMap((c) =>
        range(4).map((r) => Z3.Implies(rot.at(c).eq(r), cand.at(cd(c, r)))),
      ),
    ),
  );
  return new Game(
    `Net${wrap ? " wrapping" : ""} ${w}x${h}`,
    rules,
    consistent,
    {},
    null,
    {
      cells,
      nbr,
      wireR,
      cand,
      rot,
      barrier,
    },
  );
}

export function netLadder(gm: Game<NetExtra>): Technique[] {
  const { cells, nbr, wireR, cand, rot, barrier } = gm.extra;

  /** Every turning left to u agrees its side d is wire (s) or not. */
  const sideKnown = (u: Cell, d: number, s: boolean): B =>
    Z3.And(
      ...range(4).map((r) => Z3.Implies(cand.at(cd(u, r)), Z3.Eq(wireR(u, d, r), s))),
    );

  const maybe = (c: Cell, d: number): B => {
    const u = nbr(c, d);
    if (u === null) return Z3.Bool.val(false);
    return Z3.And(
      Z3.Not(barrier.at(cd(c, d))),
      Z3.Or(...range(4).map((r) => Z3.And(cand.at(cd(c, r)), wireR(c, d, r)))),
      Z3.Or(
        ...range(4).map((r) => Z3.And(cand.at(cd(u, r)), wireR(u, (d + 2) % 4, r))),
      ),
    );
  };

  const knownWire = (c: Cell, d: number): B => {
    const u = nbr(c, d);
    if (u === null) return Z3.Bool.val(false);
    return Z3.And(sideKnown(c, d, true), sideKnown(u, (d + 2) % 4, true));
  };

  const sidePremise = (t: Cell, r: number, d: number): B => {
    const u = nbr(t, d);
    // the border is a wall
    if (u === null) return wireR(t, d, r);
    return Z3.Or(
      Z3.And(barrier.at(cd(t, d)), wireR(t, d, r)),
      Z3.And(sideKnown(u, (d + 2) % 4, true), Z3.Not(wireR(t, d, r))),
      Z3.And(sideKnown(u, (d + 2) % 4, false), wireR(t, d, r)),
    );
  };

  const known: Adj<Cell> = dictOf(cells, (c) =>
    range(4)
      .filter((d) => nbr(c, d) !== null)
      .map((d): Link<Cell> => [nbr(c, d) as Cell, knownWire(c, d)]),
  );

  const loopPremise = (t: Cell, r: number, d1: number, d2: number): Node => {
    const u1 = nbr(t, d1);
    const u2 = nbr(t, d2);
    if (u1 === null || u2 === null || u1 === u2 || u1 === t || u2 === t)
      return Atom(Z3.Bool.val(false));
    return And(
      Atom(Z3.And(wireR(t, d1, r), wireR(t, d2, r))),
      Reach(
        new Map([[u1, Z3.Bool.val(true)]]),
        u2,
        dictOf(cells, (c) => Z3.Bool.val(c !== t)),
        known,
      ),
    );
  };

  const sealedPremise = (t: Cell, r: number, x: Cell): Node => {
    const steps = new Dict<Cell, Link<Cell>[]>();
    for (const c of cells) {
      steps.set(c, []);
      for (const d of range(4)) {
        const u = nbr(c, d);
        if (u === null) continue;
        let g: B;
        if (c === t)
          g = Z3.And(wireR(t, d, r), u !== t ? maybe(c, d) : Z3.Bool.val(false));
        else if (u === t) g = Z3.And(wireR(t, (d + 2) % 4, r), maybe(c, d));
        else g = maybe(c, d);
        steps.at(c).push([u, g]);
      }
    }
    return Not(Reach(new Map([[t, Z3.Bool.val(true)]]), x, everyCell(cells), steps));
  };

  const neighborPremise = (t: Cell, r: number, d: number): B => {
    const u = nbr(t, d);
    if (u === null || u === t) return Z3.Bool.val(false);
    return Z3.And(
      ...range(4).map((q) =>
        Z3.Implies(
          cand.at(cd(u, q)),
          Z3.Not(Z3.Eq(wireR(u, (d + 2) % 4, q), wireR(t, d, r))),
        ),
      ),
    );
  };

  const outR = (e: Env) =>
    lift((t: Cell, r: number) => rot.at(t).neq(r), e["t"], e["r"]);
  const four = () => range(4);
  return [
    new Technique(
      "side",
      [
        ["t", () => cells],
        ["r", four],
        ["d", four],
      ],
      (e) => lift(sidePremise, e["t"], e["r"], e["d"]),
      outR,
    ),
    new Technique(
      "loop",
      [
        ["t", () => cells],
        ["r", four],
        ["d1", four],
        ["d2", four],
      ],
      (e) => lift(loopPremise, e["t"], e["r"], e["d1"], e["d2"]),
      outR,
    ),
    new Technique(
      "sealed",
      [
        ["t", () => cells],
        ["r", four],
        ["x", () => cells],
      ],
      (e) => lift(sealedPremise, e["t"], e["r"], e["x"]),
      outR,
    ),
    new Technique(
      "neighbor",
      [
        ["t", () => cells],
        ["r", four],
        ["d", four],
      ],
      (e) => lift(neighborPremise, e["t"], e["r"], e["d"]),
      outR,
    ),
  ];
}
