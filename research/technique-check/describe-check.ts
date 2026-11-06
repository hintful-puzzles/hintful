/**
 * A description's techniques checked sound against its own rules, read from
 * the description itself: the formulas are evaluated symbolically on a small
 * board, the marks and the answer as z3 variables, and a technique is sound
 * when no binding's premise holds while its conclusion fails, on any answer
 * the rules allow and any marks consistent with it.
 *
 * - **The marks**: each cell's candidates and whether it is placed, as z3
 *   booleans; consistent marks keep the answer's value among a cell's
 *   candidates, and a placed cell has just it.
 * - **The clues**: every clue the board could be dealt, each present or not
 *   (or, for a kind every place carries, with its value unknown), so one
 *   check covers every layout of the size.
 * - **A technique's reading**: `value(c)` is the placed value or `none`, as
 *   the compiled code reads it; `strike(c, d)` and `place(c, d)` are facts
 *   about the answer; a conclusion that is false claims the premise cannot
 *   hold.
 *
 * Bindings are enumerated with their guards; the first `split` binders are
 * concrete in the query, one query each, and the rest are one disjunction.
 */

import {
  type ClueKind,
  type Description,
  type DescriptionJson,
  edgeMarkOf,
  type LibraryJson,
  loadDescription,
  parseTechnique,
  type Technique,
  UNPLACED,
} from "../../src/describe/description.ts";
import type { Binder, Expr } from "../../src/describe/expr.ts";
import { parse } from "../../src/describe/expr.ts";
import {
  describedSpace,
  type GridSpace,
  latinSpace,
  perElement,
  perPlace,
  perValue,
  ray,
  slash,
  step,
  traceBeam,
  within,
} from "../../src/engine/describe-runtime.ts";
import { blocks } from "../describe/space.ts";
import { asZ3, type B, type I, Z3 } from "./pzl.ts";

type Bx = B | boolean;
type Nx = I | number;
/** An element's possible identities, each under its guard; `-1` is none. */
type Alt = readonly [number, Bx];

type V =
  | { k: "bool"; v: Bx }
  | { k: "num"; v: Nx }
  | { k: "elem"; sort: string; alts: readonly Alt[] }
  | { k: "vset"; mem: readonly Bx[] }
  | { k: "eset"; sort: string; mem: readonly Alt[] }
  | { k: "subsets"; of: V }
  | { k: "clues"; kind: string }
  /** One assignment of a filling, its values by cell. */
  | { k: "fill"; vals: ReadonlyMap<number, number> };

// --- truths and numbers that simplify their constants -----------------------

function and(...xs: Bx[]): Bx {
  const r: B[] = [];
  for (const x of xs) {
    if (x === false) return false;
    if (x !== true) r.push(x);
  }
  return r.length === 0 ? true : r.length === 1 ? r[0] : Z3.And(...r);
}
function or(...xs: Bx[]): Bx {
  const r: B[] = [];
  for (const x of xs) {
    if (x === true) return true;
    if (x !== false) r.push(x);
  }
  return r.length === 0 ? false : r.length === 1 ? r[0] : Z3.Or(...r);
}
const not = (x: Bx): Bx => (typeof x === "boolean" ? !x : Z3.Not(x));
const implies = (a: Bx, b: Bx): Bx => or(not(a), b);
function iff(a: Bx, b: Bx): Bx {
  if (typeof a === "boolean") return a ? b : not(b);
  if (typeof b === "boolean") return b ? a : not(a);
  return a.eq(b);
}
function ite(c: Bx, a: Nx, b: Nx): Nx {
  if (c === true) return a;
  if (c === false) return b;
  if (typeof a === "number" && typeof b === "number" && a === b) return a;
  return Z3.If(c, asZ3(a), asZ3(b));
}
function cmp(op: string, a: Nx, b: Nx): Bx {
  if (typeof a === "number" && typeof b === "number")
    switch (op) {
      case "=":
        return a === b;
      case "!=":
        return a !== b;
      case "<":
        return a < b;
      case "<=":
        return a <= b;
      case ">":
        return a > b;
      case ">=":
        return a >= b;
    }
  const x = asZ3(a);
  const y = asZ3(b);
  switch (op) {
    case "=":
      return x.eq(y);
    case "!=":
      return x.neq(y);
    case "<":
      return x.lt(y);
    case "<=":
      return x.le(y);
    case ">":
      return x.gt(y);
    case ">=":
      return x.ge(y);
  }
  throw new Error(`no comparison ${op}`);
}
function arith(op: string, a: Nx, b: Nx): Nx {
  if (typeof a === "number" && typeof b === "number")
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
    }
  const x = asZ3(a);
  const y = asZ3(b);
  switch (op) {
    case "+":
      return x.add(y);
    case "-":
      return x.sub(y);
    case "*":
      return x.mul(y);
  }
  throw new Error(`no arithmetic ${op} here`);
}
/** `a mod b` as the compiled code's `%` reads it, its sign the left side's:
 * z3's own is never negative. */
function remainder(a: Nx, b: Nx): Nx {
  if (typeof a === "number" && typeof b === "number") return a % b;
  const x = asZ3(a);
  const y = asZ3(b);
  return Z3.If(x.lt(0), x.neg().mod(y).neg(), x.mod(y));
}
const sumOf = (xs: Nx[]): Nx => xs.reduce<Nx>((s, x) => arith("+", s, x), 0);

// --- a small board ------------------------------------------------------------

/** A clue the board may be dealt: where it sits, whether it is there, and
 * its value. */
interface ClueSym {
  at: number;
  present: Bx;
  v: V;
  /** A clue at the board's fields, by name: a number, or one an element by
   * element. */
  fields?: ReadonlyMap<string, Nx | readonly Nx[]>;
}

/** The clues at the board each kind of them is checked with, each present
 * or not: two, so a technique comparing two is checked as one reading one. */
const BOARD_CLUES = 2;

/** A partition the board may be dealt: every connected region it could have
 * up to {@link REGION_CELLS} cells, each a part or not. */
interface PartitionSym {
  parts: number[][];
  present: B[];
}

interface Board {
  sp: GridSpace;
  order: number;
  /** The largest number a value set holds: values and row indices alike. */
  top: number;
  ans: I[];
  known: B[];
  cand: Bx[][];
  clues: Map<string, ClueSym[]>;
  regions: Map<string, PartitionSym>;
  /** Each relation the board deals, by name: whether `b` is in `name(a)`, by
   * `a` and `b`. */
  relations: ReadonlyMap<string, readonly (readonly Bx[])[]>;
  /** Constraints on the clue variables themselves (a value's range), and on
   * which regions a partition has. */
  clueDomain: Bx[];
  /** The description's sizes the board was built at, where they are not its
   * order alone. */
  sizes: ReadonlyMap<string, Nx>;
  /** The most cells a dealt partition's region has ({@link regionCells}). */
  regionCells: number;
  /** The mark on the edges, where the description has one that means
   * something of the answer: its name, each edge's candidates, and what each
   * edge's mark means, as the answer reads it (`edgeMeaning`). */
  edgeMark: {
    name: string;
    of: Expr;
    notation: Expr;
    cand: Bx[][];
    meaning: (Nx | null)[];
  } | null;
}

/**
 * The most cells a region of a dealt partition is checked with, by order. A
 * Keen cage holds up to six, but every region of four on a 4×4 board took
 * the checker past a 4 GB heap (2026-10-31), so a technique that reads one
 * region is checked on every shape up to these sizes and no larger.
 */
const REGION_CELLS: Readonly<Record<number, number>> = { 3: 4, 4: 3 };

/**
 * The most cells a region of a dealt partition is checked with in `d`'s
 * world at `order`: {@link REGION_CELLS}, or where no board with regions that
 * small has an answer, one more. Tectonic's every 2×2 block holds four
 * numbers, so only an area of four holds a 4, and with areas of three no
 * board has an answer (2026-11-01: each of Seismic's techniques took about
 * 30 s and 0.5 GB with areas of four on a 4×4).
 */
export async function regionCells(
  d: Description,
  order: number,
  sizes: ReadonlyMap<string, number> = new Map(),
): Promise<number> {
  const base = REGION_CELLS[order] ?? 2;
  return (await hasAnswer(d, order, sizes, base)) ? base : base + 1;
}

/** Every connected set of up to `most` cells of the grid, each in reading
 * order, smaller first. */
function connectedRegions(sp: GridSpace, most: number): number[][] {
  const seen = new Set<string>();
  let layer: number[][] = sp.cells.map((c) => [c]);
  const out: number[][] = [];
  for (let size = 1; size <= most && layer.length > 0; size++) {
    out.push(...layer);
    const next: number[][] = [];
    for (const r of layer)
      for (const c of r)
        for (const n of sp.adj4[c]) {
          if (r.includes(n)) continue;
          const grown = [...r, n].sort((a, b) => a - b);
          const key = grown.join(",");
          if (seen.has(key)) continue;
          seen.add(key);
          next.push(grown);
        }
    layer = next;
  }
  return out;
}

let boardCount = 0;

const BLOCKS = /^blocks\((\w+), *(\w+)\)$/;

/** The partition among `d`'s units, by name and how it is made. */
function unitRegion(d?: Description): [string, string] | null {
  const space = d?.json.space;
  return (
    Object.entries(space?.regions ?? {}).find(([n]) => space?.units.includes(n)) ?? null
  );
}

/**
 * Why no board of `d` can be built, or `null`. Boxes a board deals (Solo's
 * Jigsaw) are not built: as fixed boards, every 4x4 jigsaw up to symmetry
 * would multiply Solo's 44-minute check twentyfold.
 */
export function unbuilt(d: Description): string | null {
  const unit = unitRegion(d);
  return unit === null || BLOCKS.test(unit[1])
    ? null
    : `its ${unit[0]} partition is ${unit[1]}, and only blocks(a, b) is built`;
}

/**
 * The grid of `d`'s board of `order`: a Latin square, or where a partition is
 * among its units, a Sudoku whose boxes are that partition's `blocks(a, b)`
 * at the sizes that make the order, the squarest boxes first, with its
 * diagonals where `d` has them.
 */
function spaceOf(
  order: number,
  d?: Description,
): { sp: GridSpace; sizes: ReadonlyMap<string, number> } {
  const space = d?.json.space;
  const unit = unitRegion(d);
  if (d === undefined || space === undefined)
    return { sp: latinSpace(order), sizes: new Map() };
  // A board of cells alone (Map's regions) has as many as the square of the
  // order; its neighbors are a relation dealt on them.
  if (space.grid === undefined) {
    const count = order * order;
    const name = space.cells ?? "";
    return {
      sp: describedSpace(space.units, count, 1),
      sizes: /^\d+$/.test(name) ? new Map() : new Map([[name, count]]),
    };
  }
  // A side the description fixes (Guess's one row) is its own; any other is
  // the order.
  const side = (s: string): number => (/^\d+$/.test(s) ? Number(s) : order);
  if (unit === null)
    return {
      sp: describedSpace(space.units, side(space.grid.w), side(space.grid.h)),
      sizes: new Map(),
    };
  const m = BLOCKS.exec(unit[1]);
  if (m === null) throw new Error(`${unit[0]}: only blocks(a, b) is checked`);
  const range = (name: string): number[] => {
    const s = d.json.sizes[name];
    if (s === undefined) throw new Error(`blocks: no size ${name}`);
    return Array.from({ length: s.max - s.min + 1 }, (_, i) => s.min + i);
  };
  const fits = range(m[1])
    .flatMap((a) => range(m[2]).map((b) => [a, b] as const))
    .filter(([a, b]) => a * b === order)
    .sort((x, y) => Math.min(...y) - Math.min(...x));
  if (fits.length === 0) throw new Error(`no board of order ${order}`);
  const [a, b] = fits[0];
  return {
    sp: describedSpace(space.units, order, order, blocks(a, b)),
    sizes: new Map([
      [m[1], a],
      [m[2], b],
    ]),
  };
}

/** The size the answer's domain ends at, where it is `range(a, s)` of a
 * size the grid does not give (Guess's colors), or `null`: a board's
 * values then reach it, past the order. */
function domainBound(d: Description): string | null {
  const e = d.domain;
  if (e.k !== "call" || e.fn !== "range") return null;
  const hi = e.args[1];
  const { grid } = d.json.space;
  return hi.k === "name" &&
    hi.name in d.json.sizes &&
    hi.name !== grid?.w &&
    hi.name !== grid?.h
    ? hi.name
    : null;
}

/** The number the answer's domain ends at where it is `range(a, k)` of a
 * number (Map's four colors), which a board's values reach whatever its
 * order; `0` elsewhere. */
function domainEnd(d: Description): number {
  // A domain stated as the values of a range that pass a test (Rome's goal,
  // a value no arrow is) ends where the range does.
  const e =
    d.domain.k === "agg" && d.domain.fn === "set" && d.domain.binders[0]?.kind === "in"
      ? d.domain.binders[0].of
      : d.domain;
  if (e.k !== "call" || e.fn !== "range") return 0;
  const hi = e.args[1];
  return hi.k === "num" ? hi.v : 0;
}

function makeBoard(
  order: number,
  d?: Description,
  more: ReadonlyMap<string, number> = new Map(),
  cells: number = REGION_CELLS[order] ?? 2,
): Board {
  const space = spaceOf(order, d);
  const { sp } = space;
  const fixed = new Map([...space.sizes, ...more]);
  const tag = `b${boardCount++}`;
  const n = sp.cells.length;
  const bound = d === undefined ? null : domainBound(d);
  const top = Math.max(
    order,
    d === undefined ? 0 : domainEnd(d),
    (bound === null ? null : fixed.get(bound)) ?? 0,
  );
  // A count wider than the board (Mines' mines) is one unknown, which is
  // every value it can take at once: its worlds' union.
  const sizes = new Map<string, Nx>(fixed);
  const clueDomain: Bx[] = [];
  if (d !== undefined)
    for (const name of openSizes(d, order)) {
      const v = Z3.Int.const(`${tag}_size_${name}`);
      sizes.set(name, v);
      const { min } = d.json.sizes[name];
      clueDomain.push(and(cmp(">=", v, min), cmp("<=", v, n)));
    }
  // The answer's values sit on its cells, or on its edges (Separate's).
  const held = d?.answerSort === "edge" ? sp.edges.length : n;
  const ans = Array.from({ length: held }, (_, c) => Z3.Int.const(`${tag}_ans_${c}`));
  const known = Array.from({ length: held }, (_, c) =>
    Z3.Bool.const(`${tag}_known_${c}`),
  );
  const cand = Array.from({ length: held }, (_, c) =>
    Array.from(
      { length: top + 1 },
      (_, d): Bx => (d === 0 ? false : Z3.Bool.const(`${tag}_cand_${c}_${d}`)),
    ),
  );
  // Every relation on the cells, each pair in it or not, a cell with itself
  // too: nothing the description says makes one symmetric.
  const relations = new Map(
    Object.keys(d?.json.space.relations ?? {}).map((name) => [
      name,
      sp.cells.map((a) =>
        sp.cells.map((b): Bx => Z3.Bool.const(`${tag}_${name}_${a}_${b}`)),
      ),
    ]),
  );
  const mark = d === undefined ? null : edgeMarkOf(d.json);
  const notation = mark === null ? null : d?.json.marks?.[mark.name]?.notation;
  const set =
    notation === undefined || notation === null ? null : /^set of (.*)$/.exec(notation);
  if (mark !== null && set === null)
    throw new Error(`${mark.name}: only a mark that is a set of values is checked`);
  const edgeCount = sp.edgeEnds.length / 2;
  return {
    sp,
    order,
    top,
    ans,
    known,
    cand,
    clues: new Map(),
    regions: new Map(),
    relations,
    regionCells: cells,
    clueDomain,
    sizes,
    edgeMark:
      mark === null || set === null
        ? null
        : {
            name: mark.name,
            of: parse(mark.of),
            notation: parse(set[1]),
            cand: Array.from({ length: edgeCount }, (_, e) =>
              Array.from(
                { length: Math.max(top, MARK_TOP) + 1 },
                (_, n): Bx =>
                  n === 0 ? false : Z3.Bool.const(`${tag}_mark_${e}_${n}`),
              ),
            ),
            meaning: Array.from({ length: edgeCount }, () => null),
          },
  };
}

/** The largest value an edge's mark is checked holding, where the board's
 * order is smaller. */
const MARK_TOP = 3;

/** What edge `e`'s mark means of the answer: its `of`, read in a rule. */
function edgeMeaning(ctx: Ctx, e: number): Nx {
  const mark = ctx.board.edgeMark;
  if (mark === null) throw new Error("no mark on the edges");
  const known = mark.meaning[e];
  if (known !== null) return known;
  const v = num(
    evaluate(mark.of, new Map([["at", elem("edge", e)]]), {
      ...ctx,
      mode: "rule",
      concluding: false,
      supposed: [],
    }),
    mark.name,
  );
  mark.meaning[e] = v;
  return v;
}

/** The sizes an `order` board does not fix whose range is wider than its
 * cells, so that no size of the board holds them all: each is checked as one
 * unknown, not a world a value. The answer's domain's bound is not one. */
function openSizes(d: Description, order: number): string[] {
  const { grid } = d.json.space;
  const { sp, sizes } = spaceOf(order, d);
  const bound = domainBound(d);
  return Object.entries(d.json.sizes)
    .filter(
      ([name, { max }]) =>
        name !== "order" &&
        name !== "w" &&
        name !== "h" &&
        name !== grid?.w &&
        name !== grid?.h &&
        name !== bound &&
        !sizes.has(name) &&
        max > sp.cells.length,
    )
    .map(([name]) => name);
}

/** Every partition the description deals, symbolically, and the rule that
 * the regions present cover each cell once. */
function dealPartitions(d: Description, board: Board): void {
  for (const [name, how] of Object.entries(d.json.space.regions ?? {})) {
    // A partition among the units is the space's boxes.
    if (d.json.space.units.includes(name)) continue;
    if (how !== "dealt")
      throw new Error(`partition ${name}: only a dealt one is checked`);
    const parts = connectedRegions(board.sp, board.regionCells);
    const present = parts.map((_, i) => Z3.Bool.const(`${name}_${i}_${boardCount}`));
    board.regions.set(name, { parts, present });
    for (const c of board.sp.cells) {
      const holding = present.filter((_, i) => parts[i].includes(c));
      board.clueDomain.push(or(...holding));
      for (let i = 0; i < holding.length; i++)
        for (let j = i + 1; j < holding.length; j++)
          board.clueDomain.push(not(and(holding[i], holding[j])));
    }
  }
}

/** The element sort a clue kind's place is: a partition's region, or a
 * sort of the grid's own. */
const placeSort = (board: Board, at: string): string =>
  board.regions.has(at) ? `region ${at}` : at;

// --- evaluation ---------------------------------------------------------------

interface Ctx {
  board: Board;
  d: Description;
  /** A technique reads the marks; a rule reads the answer. */
  mode: "technique" | "rule";
  concluding: boolean;
  /** The `with`s the formula is inside, innermost first. */
  supposed: readonly Supposition[];
}

/** `with place(c, v)`: the cell, its alternatives under their guards, and
 * the value it is supposed to hold. */
interface Supposition {
  at: readonly Alt[];
  v: Nx;
}

type Env = ReadonlyMap<string, V>;

const bool = (v: V, what: string): Bx => {
  if (v.k !== "bool") throw new TypeError(`${what}: not a truth`);
  return v.v;
};
const num = (v: V, what: string): Nx => {
  if (v.k !== "num") throw new TypeError(`${what}: not a number`);
  return v.v;
};
const alts = (v: V, what: string): readonly Alt[] => {
  if (v.k !== "elem") throw new TypeError(`${what}: not an element`);
  return v.alts;
};
const elem = (sort: string, id: number): V => ({ k: "elem", sort, alts: [[id, true]] });
/** The values `step` reads as a direction. */
const DIRECTIONS = [1, 2, 3, 4] as const;
const allOf = (sort: string, ids: readonly number[]): V => ({
  k: "eset",
  sort,
  mem: ids.map((id) => [id, true] as const),
});

/** An ordered set's members where every one is certain, as a line or a
 * slot's sight is: what reading a position in it needs. */
function known(v: V, what: string): number[] {
  if (v.k !== "eset" || v.mem.some(([, g]) => g !== true))
    throw new TypeError(`${what}: not a set whose members are known`);
  return v.mem.map(([id]) => id);
}

/** A value per alternative of an element, joined under the alternatives'
 * guards, which are exclusive. */
function lift(v: V, what: string, f: (id: number) => V): V {
  const as = alts(v, what).filter(([, g]) => g !== false);
  const parts = as.map(([id, g]) => [g, f(id)] as const);
  return join(parts);
}

function join(parts: readonly (readonly [Bx, V])[]): V {
  if (parts.length === 0) throw new Error("nothing to join");
  if (parts.length === 1 && parts[0][0] === true) return parts[0][1];
  const first = parts[0][1];
  switch (first.k) {
    case "bool":
      return { k: "bool", v: or(...parts.map(([g, x]) => and(g, bool(x, "join")))) };
    case "num": {
      let acc: Nx = num(parts[parts.length - 1][1], "join");
      for (let i = parts.length - 2; i >= 0; i--)
        acc = ite(parts[i][0], num(parts[i][1], "join"), acc);
      return { k: "num", v: acc };
    }
    case "elem": {
      const out = new Map<number, Bx>();
      for (const [g, x] of parts)
        for (const [id, h] of alts(x, "join"))
          out.set(id, or(out.get(id) ?? false, and(g, h)));
      return { k: "elem", sort: first.sort, alts: [...out] };
    }
    case "vset": {
      const mem = first.mem.map((_, d) =>
        or(
          ...parts.map(([g, x]) =>
            and(g, x.k === "vset" ? (x.mem[d] ?? false) : false),
          ),
        ),
      );
      return { k: "vset", mem };
    }
    case "eset": {
      const out = new Map<number, Bx>();
      for (const [g, x] of parts)
        if (x.k === "eset")
          for (const [id, h] of x.mem) out.set(id, or(out.get(id) ?? false, and(g, h)));
      return { k: "eset", sort: first.sort, mem: [...out] };
    }
    default:
      throw new Error(`cannot join ${first.k}`);
  }
}

function vsetOf(board: Board, members: (d: number) => Bx): V {
  return {
    k: "vset",
    mem: Array.from({ length: board.top + 1 }, (_, d) => members(d)),
  };
}

/** The value of cell `c`: the answer in a rule, the placed value or none in a
 * technique. */
function cellValue(ctx: Ctx, c: number): Nx {
  const a = ctx.board.ans[c];
  if (ctx.mode === "rule") return a;
  let v: Nx = ite(ctx.board.known[c], a, -1);
  // The `with`s in force, the innermost read last so that it decides.
  for (let i = ctx.supposed.length - 1; i >= 0; i--)
    v = ite(supposedAt(ctx.supposed[i], c), ctx.supposed[i].v, v);
  return v;
}

/** Whether cell `c` is placed, under the suppositions in force. */
function knownAt(ctx: Ctx, c: number): Bx {
  return or(ctx.board.known[c], ...ctx.supposed.map((s) => supposedAt(s, c)));
}

/** Whether value `d` is among cell `c`'s candidates, under the suppositions
 * in force: just the supposed value where `c` is a supposed cell. */
function candAt(ctx: Ctx, c: number, d: number): Bx {
  let g: Bx = ctx.board.cand[c][d] ?? false;
  for (let i = ctx.supposed.length - 1; i >= 0; i--) {
    const s = ctx.supposed[i];
    const at = supposedAt(s, c);
    g = or(and(at, cmp("=", s.v, d)), and(not(at), g));
  }
  return g;
}

/** Whether `s` supposes a value in cell `c`. */
const supposedAt = (s: Supposition, c: number): Bx =>
  s.at.find(([id]) => id === c)?.[1] ?? false;

/** A number under exclusive guards that cover every case. */
function joinNum(parts: readonly (readonly [Bx, number])[]): Nx {
  let acc: Nx = parts[parts.length - 1][1];
  for (let i = parts.length - 2; i >= 0; i--) acc = ite(parts[i][0], parts[i][1], acc);
  return acc;
}

/** Alternatives with one guard an id, the guards of a repeated id joined. */
function merged(parts: readonly (readonly [number, Bx])[]): Alt[] {
  const out = new Map<number, Bx>();
  for (const [id, g] of parts) out.set(id, or(out.get(id) ?? false, g));
  return [...out].filter(([, g]) => g !== false);
}

/** A cell the tracer asked about that the path so far has not settled. */
class Unsettled {
  constructor(readonly c: number) {}
}

const beamCache = new WeakMap<Board, Map<string, (readonly [Bx, number])[]>>();

/**
 * Every way the beam from slot `s` can go, as {@link traceBeam} says, each
 * under the guard of what the cells it asked about hold: in a rule, a ball
 * or not in the answer; in a technique, a ball placed, an empty square
 * placed, or nothing placed, which ends the path there. Cell `u`, where it is
 * not none, is taken to hold `d`. The tracer itself walks the paths, asked
 * again with each cell it stops at settled each way, so the check reads the
 * physics the runtime does.
 */
function beamPaths(ctx: Ctx, s: number, u: number, d: Nx): (readonly [Bx, number])[] {
  const { board } = ctx;
  if (ctx.supposed.length > 0) throw new TypeError("a beam is not read under with");
  const key = `${ctx.mode} ${s} ${u} ${d}`;
  const memo = typeof d === "number" ? beamCache.get(board)?.get(key) : undefined;
  if (memo !== undefined) return memo;
  const ways = (c: number): (readonly [Bx, boolean | null])[] => {
    if (c === u)
      return [
        [cmp("=", d, 1), true],
        [not(cmp("=", d, 1)), false],
      ];
    const ball = cmp("=", board.ans[c], 1);
    if (ctx.mode === "rule")
      return [
        [ball, true],
        [not(ball), false],
      ];
    const k = board.known[c];
    return [
      [and(k, ball), true],
      [and(k, not(ball)), false],
      [not(k), null],
    ];
  };
  const out: (readonly [Bx, number])[] = [];
  const settled = new Map<number, boolean | null>();
  const walk = (g: Bx): void => {
    if (g === false) return;
    let r: number;
    try {
      r = traceBeam(board.sp, s, (c) => {
        const v = settled.get(c);
        if (v === undefined) throw new Unsettled(c);
        return v;
      });
    } catch (e) {
      if (!(e instanceof Unsettled)) throw e;
      for (const [h, v] of ways(e.c)) {
        settled.set(e.c, v);
        walk(and(g, h));
      }
      settled.delete(e.c);
      return;
    }
    out.push([g, r]);
  };
  walk(true);
  if (typeof d === "number") {
    const m = beamCache.get(board) ?? new Map();
    beamCache.set(board, m);
    m.set(key, out);
  }
  return out;
}

/** `times(d)`: the repeated value's count, 1 for every other. */
function timesOf(ctx: Ctx, d: Nx): Nx {
  const r = ctx.d.repeat;
  if (r === null) return 1;
  const at = num(evaluate(r.value, new Map(), ctx), "repeat value");
  const times = num(evaluate(r.times, new Map(), ctx), "repeat times");
  return ite(cmp("=", d, at), times, 1);
}

function evaluate(e: Expr, env: Env, ctx: Ctx): V {
  const { board } = ctx;
  const { sp } = board;
  switch (e.k) {
    case "num":
      return { k: "num", v: e.v };
    case "name": {
      const bound = env.get(e.name);
      if (bound !== undefined) return bound;
      switch (e.name) {
        case "true":
          return { k: "bool", v: true };
        case "false":
          return { k: "bool", v: false };
        case "none":
          return { k: "elem", sort: "none", alts: [[-1, true]] };
        case "cells":
          return allOf("cell", sp.cells);
        case "rows":
          return allOf("line", sp.rows);
        case "cols":
          return allOf("line", sp.cols);
        case "lines":
          return allOf("line", sp.lines);
        case "units":
          return allOf("line", sp.units);
        case "diagonals":
          return allOf("line", sp.diagonals);
        case "slots":
          return allOf("slot", sp.slots);
        case "corners":
          return allOf("corner", sp.corners);
        case "points":
          return allOf("point", sp.points);
        case "edges":
          return allOf("edge", sp.edges);
        case "domain":
          return evaluate(ctx.d.domain, new Map(), ctx);
        case "order":
          return { k: "num", v: board.order };
        case "w":
          return { k: "num", v: sp.w };
        case "h":
          return { k: "num", v: sp.h };
      }
      const size = board.sizes.get(e.name);
      if (size !== undefined) return { k: "num", v: size };
      if (ctx.d.json.space.units.includes(e.name)) return allOf("line", sp.boxes);
      const part = board.regions.get(e.name);
      if (part !== undefined)
        return {
          k: "eset",
          sort: `region ${e.name}`,
          mem: part.present.map((g, i) => [i, g] as const),
        };
      const def = ctx.d.defs.get(e.name);
      if (def !== undefined && def.params.length === 0)
        return evaluate(def.body, new Map(), ctx);
      throw new ReferenceError(`unknown name ${e.name}`);
    }
    case "set": {
      const vs = e.elems.map((x) => evaluate(x, env, ctx));
      if (vs.every((v) => v.k === "num"))
        return vsetOf(board, (d) => or(...vs.map((v) => cmp("=", num(v, "{}"), d))));
      const out = new Map<number, Bx>();
      for (const v of vs)
        for (const [id, g] of alts(v, "{}")) out.set(id, or(out.get(id) ?? false, g));
      return { k: "eset", sort: vs[0].k === "elem" ? vs[0].sort : "?", mem: [...out] };
    }
    case "size": {
      const s = evaluate(e.of, env, ctx);
      if (s.k === "vset") return { k: "num", v: sumOf(s.mem.map((g) => ite(g, 1, 0))) };
      if (s.k === "eset")
        return { k: "num", v: sumOf(s.mem.map(([, g]) => ite(g, 1, 0))) };
      throw new TypeError("|…| of a non-set");
    }
    case "not":
      return { k: "bool", v: not(bool(evaluate(e.of, env, ctx), "not")) };
    case "neg":
      return { k: "num", v: arith("-", 0, num(evaluate(e.of, env, ctx), "-")) };
    case "bin":
      return binary(e, env, ctx);
    case "quant": {
      const forall = e.q === "forall";
      const parts: Bx[] = [];
      bindings(e.binders, 0, env, true, ctx, (inner, g) => {
        const body = bool(evaluate(e.body, inner, ctx), e.q);
        parts.push(forall ? implies(g, body) : and(g, body));
      });
      return { k: "bool", v: forall ? and(...parts) : or(...parts) };
    }
    case "agg":
      return aggregate(e, env, ctx);
    case "call":
      return call(e.fn, e.args, env, ctx);
    case "with": {
      if (ctx.mode !== "technique") throw new TypeError("with in a rule");
      const at = alts(evaluate(e.cell, env, ctx), "with");
      const v = num(evaluate(e.value, env, ctx), "with");
      return evaluate(e.body, env, {
        ...ctx,
        concluding: false,
        supposed: [{ at, v }, ...ctx.supposed],
      });
    }
  }
}

function binary(e: Extract<Expr, { k: "bin" }>, env: Env, ctx: Ctx): V {
  const { op } = e;
  if (op === "and" || op === "or" || op === "implies") {
    const a = bool(evaluate(e.a, env, ctx), op);
    if ((op === "and" && a === false) || (op !== "and" && a === (op === "or")))
      return { k: "bool", v: op !== "and" };
    const b = bool(evaluate(e.b, env, ctx), op);
    return {
      k: "bool",
      v: op === "and" ? and(a, b) : op === "or" ? or(a, b) : implies(a, b),
    };
  }
  const a = evaluate(e.a, env, ctx);
  const b = evaluate(e.b, env, ctx);
  switch (op) {
    case "iff":
      return { k: "bool", v: iff(bool(a, op), bool(b, op)) };
    case "=":
    case "!=": {
      const eq = equal(a, b);
      return { k: "bool", v: op === "=" ? eq : not(eq) };
    }
    case "<":
    case "<=":
    case ">":
    case ">=":
      return { k: "bool", v: cmp(op, num(a, op), num(b, op)) };
    case "in":
    case "notin": {
      const m = member(a, b);
      return { k: "bool", v: op === "in" ? m : not(m) };
    }
    case "subset": {
      if (a.k === "vset" && b.k === "vset")
        return {
          k: "bool",
          v: and(...a.mem.map((g, d) => implies(g, b.mem[d] ?? false))),
        };
      if (a.k === "eset" && b.k === "eset")
        return {
          k: "bool",
          v: and(...a.mem.map(([id, g]) => implies(g, inEset(id, b)))),
        };
      throw new TypeError("subset of non-sets");
    }
    case "+":
    case "-": {
      if (a.k === "num") return { k: "num", v: arith(op, a.v, num(b, op)) };
      // A comprehension that binds nothing is an empty set of values, of
      // whatever the other side holds.
      const empty = (v: V): boolean =>
        v.k === "vset" && v.mem.every((g) => g === false);
      if (a.k === "eset" && empty(b)) return a;
      if (b.k === "eset" && empty(a)) return op === "+" ? b : { ...b, mem: [] };
      if (a.k === "vset" && b.k === "vset")
        return {
          k: "vset",
          mem: a.mem.map((g, d) =>
            op === "+" ? or(g, b.mem[d] ?? false) : and(g, not(b.mem[d] ?? false)),
          ),
        };
      if (a.k === "eset" && b.k === "eset") {
        const out = new Map<number, Bx>(
          a.mem.map(([id, g]) => [id, op === "+" ? g : and(g, not(inEset(id, b)))]),
        );
        if (op === "+")
          for (const [id, g] of b.mem) out.set(id, or(out.get(id) ?? false, g));
        return { k: "eset", sort: a.sort, mem: [...out] };
      }
      throw new TypeError(`${op} of mixed sorts`);
    }
    case "*":
      return { k: "num", v: arith("*", num(a, op), num(b, op)) };
    case "mod":
      return { k: "num", v: remainder(num(a, op), num(b, op)) };
    case "/": {
      // Truncating, as the compiled code divides; only a number the board
      // fixes (a line's length) is divided yet.
      const x = num(a, op);
      const y = num(b, op);
      if (typeof x !== "number" || typeof y !== "number")
        throw new Error("/ of a number the board does not fix is not checked yet");
      return { k: "num", v: Math.trunc(x / y) };
    }
  }
}

/** Whether the cells, each a member under its guard in `mem`, are one group
 * side by side: each reached from the first member through members, in as
 * many steps as a path can take. */
function connectedOf(sp: GridSpace, mem: readonly Bx[]): Bx {
  let reach: Bx[] = mem.map((g, c) => and(g, ...mem.slice(0, c).map(not)));
  for (let k = 1; k < mem.length; k++) {
    const was = reach;
    reach = mem.map((g, c) => and(g, or(was[c], ...sp.adj4[c].map((p) => was[p]))));
  }
  return and(...mem.map((g, c) => implies(g, reach[c])));
}

const linkedCache = new WeakMap<Board, Map<string, V>>();

/**
 * `linked(k)` read as reach: a point is in it where a point it shares a
 * square with is, the square's diagonal joining the two, as many steps as
 * the board has points. A read under no supposition is kept for the board.
 */
function linkedOf(ctx: Ctx, k: number): V {
  const { board } = ctx;
  const { sp } = board;
  const key = `${ctx.mode} ${k}`;
  const cache = ctx.supposed.length === 0 ? linkedCache.get(board) : undefined;
  const kept = cache?.get(key);
  if (kept !== undefined) return kept;
  // Each point's diagonal neighbors, each under its square holding the
  // diagonal joining them.
  const joins: (readonly [number, Bx])[][] = sp.points.map(() => []);
  for (const c of sp.cells) {
    const v = cellValue(ctx, c);
    const [tl, tr, bl, br] = sp.cellPoints[c];
    for (const [p, q] of [
      [tl, br],
      [tr, bl],
    ]) {
      const g = cmp("=", v, slash(sp, c, p));
      joins[p].push([q, g]);
      joins[q].push([p, g]);
    }
  }
  let reach: Bx[] = sp.points.map((p) => p === k);
  for (let i = 1; i < sp.points.length; i++) {
    const was = reach;
    reach = sp.points.map((p) =>
      or(was[p], ...joins[p].map(([q, g]) => and(was[q], g))),
    );
  }
  const out: V = {
    k: "eset",
    sort: "point",
    mem: sp.points.map((p) => [p, reach[p]] as const).filter(([, g]) => g !== false),
  };
  if (ctx.supposed.length === 0) {
    const m = linkedCache.get(board) ?? new Map<string, V>();
    m.set(key, out);
    linkedCache.set(board, m);
  }
  return out;
}

function inEset(id: number, s: V): Bx {
  if (s.k !== "eset") throw new TypeError("not an element set");
  return or(...s.mem.filter(([x]) => x === id).map(([, g]) => g));
}

function member(x: V, s: V): Bx {
  // A comprehension that binds nothing is an empty set of values, whatever
  // it would have held: an element is in it nowhere.
  if (s.k === "vset" && x.k === "elem" && s.mem.every((g) => g === false)) return false;
  if (s.k === "vset") {
    const n = num(x, "in");
    return or(...s.mem.map((g, d) => and(cmp("=", n, d), g)));
  }
  return or(...alts(x, "in").map(([id, g]) => and(g, inEset(id, s))));
}

function equal(a: V, b: V): Bx {
  if (a.k === "bool") return iff(a.v, bool(b, "="));
  if (a.k === "num") {
    if (b.k === "elem")
      return or(...b.alts.map(([id, g]) => and(g, cmp("=", a.v, id))));
    return cmp("=", a.v, num(b, "="));
  }
  if (a.k === "elem") {
    if (b.k === "num") return equal(b, a);
    return or(
      ...a.alts.flatMap(([x, g]) =>
        alts(b, "=")
          .filter(([y]) => y === x)
          .map(([, h]) => and(g, h)),
      ),
    );
  }
  if (a.k === "vset" && b.k === "vset")
    return and(...a.mem.map((g, d) => iff(g, b.mem[d] ?? false)));
  if (a.k === "eset" && b.k === "eset") {
    const ids = new Set([...a.mem.map(([id]) => id), ...b.mem.map(([id]) => id)]);
    return and(...[...ids].map((id) => iff(inEset(id, a), inEset(id, b))));
  }
  throw new TypeError(`= of ${a.k} and ${b.k}`);
}

/** Every binding of `bs` from `i`, each with the guard under which it is one. */
function bindings(
  bs: readonly Binder[],
  i: number,
  env: Env,
  guard: Bx,
  ctx: Ctx,
  visit: (env: Env, guard: Bx) => void,
): void {
  if (guard === false) return;
  if (i === bs.length) {
    visit(env, guard);
    return;
  }
  const b = bs[i];
  const next = (v: V, g: Bx): void => {
    const inner = new Map(env);
    inner.set(b.name, v);
    const w =
      b.where === null
        ? true
        : bool(evaluate(b.where, inner, ctx), `where of ${b.name}`);
    bindings(bs, i + 1, inner, and(guard, g, w), ctx, visit);
  };
  if (b.kind === "let") {
    next(evaluate(b.of, env, ctx), true);
    return;
  }
  if (b.kind === "fill") {
    // Every assignment of a value to each member, each under its values
    // being candidates where it is drawn from the marks. A set the marks
    // decide, as the open squares of a line are, is filled over every square
    // that may be in it: a value given one that is not is never read, since
    // whatever ranges over the set reads it under its membership.
    // A set built from nothing has no sort, and is a set of values.
    const of = evaluate(b.of, env, ctx);
    const empty = of.k === "vset" && of.mem.every((g) => g === false);
    if (of.k !== "eset" && !empty) throw new TypeError(`fill ${b.name}: not a set`);
    const cells =
      of.k === "eset" ? of.mem.flatMap(([id, g]) => (g === false ? [] : [id])) : [];
    const vals = new Map<number, number>();
    const assign = (j: number, g: Bx): void => {
      if (g === false) return;
      if (j === cells.length) {
        next({ k: "fill", vals: new Map(vals) }, g);
        return;
      }
      const c = cells[j];
      for (let d = 1; d <= ctx.board.top; d++) {
        vals.set(c, d);
        if (b.from !== undefined && b.from !== "cand")
          throw new Error(`fill ${b.name} from ${b.from}`);
        assign(j + 1, and(g, b.from === "cand" ? candAt(ctx, c, d) : true));
      }
      vals.delete(c);
    };
    assign(0, true);
    return;
  }
  const s = evaluate(b.of, env, ctx);
  if (s.k === "clues") {
    (ctx.board.clues.get(s.kind) ?? []).forEach((k, i) => {
      next(elem(`clue ${s.kind}`, i), k.present);
    });
    return;
  }
  if (s.k === "vset") {
    s.mem.forEach((g, d) => {
      if (g !== false) next({ k: "num", v: d }, g);
    });
    return;
  }
  if (s.k === "eset") {
    for (const [id, g] of s.mem) if (g !== false) next(elem(s.sort, id), g);
    return;
  }
  if (s.k === "subsets") {
    // Counted in binary with the set's last member lowest, as compiled.
    const of = s.of;
    const support =
      of.k === "vset"
        ? of.mem.flatMap((g, d) => (g === false ? [] : [[d, g] as const]))
        : of.k === "eset"
          ? of.mem.filter(([, g]) => g !== false)
          : [];
    const n = support.length;
    for (let m = 0; m < 1 << n; m++) {
      const chosen = support.filter((_, j) => (m >> (n - 1 - j)) & 1);
      const g = and(...chosen.map(([, h]) => h));
      const ids = new Set(chosen.map(([x]) => x));
      const sub: V =
        of.k === "vset"
          ? vsetOf(ctx.board, (d) => ids.has(d))
          : {
              k: "eset",
              sort: of.k === "eset" ? of.sort : "?",
              mem: chosen.map(([x]) => [x, true] as const),
            };
      next(sub, g);
    }
    return;
  }
  throw new TypeError(`${b.name} in a ${s.k}`);
}

/** A clue element's clues: an element of sort `clue <kind>` is its index in
 * the kind's list. */
function clueOf(ctx: Ctx, v: V): { clue: ClueSym; g: Bx }[] {
  if (v.k !== "elem" || !v.sort.startsWith("clue ")) throw new TypeError("not a clue");
  const list = ctx.board.clues.get(v.sort.slice("clue ".length)) ?? [];
  return v.alts.map(([i, g]) => ({ clue: list[i], g }));
}

function aggregate(e: Extract<Expr, { k: "agg" }>, env: Env, ctx: Ctx): V {
  const last = e.binders[e.binders.length - 1];
  const parts: { g: Bx; t: V }[] = [];
  bindings(e.binders, 0, env, true, ctx, (inner, g) => {
    const t =
      e.term === null ? (inner.get(last.name) as V) : evaluate(e.term, inner, ctx);
    parts.push({ g, t });
  });
  switch (e.fn) {
    case "count":
      return { k: "num", v: sumOf(parts.map((p) => ite(p.g, 1, 0))) };
    case "distinct": {
      const pairs: Bx[] = [];
      for (let i = 0; i < parts.length; i++)
        for (let j = i + 1; j < parts.length; j++)
          pairs.push(
            implies(and(parts[i].g, parts[j].g), not(equal(parts[i].t, parts[j].t))),
          );
      return { k: "bool", v: and(...pairs) };
    }
    case "sum":
      return { k: "num", v: sumOf(parts.map((p) => ite(p.g, num(p.t, "sum"), 0))) };
    case "prod":
      return {
        k: "num",
        v: parts.reduce<Nx>(
          (acc, p) => arith("*", acc, ite(p.g, num(p.t, "prod"), 1)),
          1,
        ),
      };
    case "min":
    case "max": {
      let acc: Nx = -1;
      for (const p of parts) {
        const t = num(p.t, e.fn);
        acc = ite(
          and(p.g, or(cmp("=", acc, -1), cmp(e.fn === "min" ? "<" : ">", t, acc))),
          t,
          acc,
        );
      }
      return { k: "num", v: acc };
    }
    case "the": {
      const only = (i: number): Bx =>
        and(parts[i].g, ...parts.filter((_, j) => j !== i).map((p) => not(p.g)));
      if (parts.length === 0) return { k: "elem", sort: "none", alts: [[-1, true]] };
      const first = parts[0].t;
      if (first.k === "num") {
        let acc: Nx = -1;
        parts.forEach((p, i) => {
          acc = ite(only(i), num(p.t, "the"), acc);
        });
        return { k: "num", v: acc };
      }
      const exactly = or(...parts.map((_, i) => only(i)));
      const out: Alt[] = parts.flatMap((p, i) =>
        alts(p.t, "the").map(([id, g]) => [id, and(only(i), g)] as const),
      );
      out.push([-1, not(exactly)]);
      return { k: "elem", sort: first.k === "elem" ? first.sort : "?", alts: out };
    }
    case "set": {
      if (parts.length === 0) return vsetOf(ctx.board, () => false);
      if (parts[0].t.k === "num")
        return vsetOf(ctx.board, (d) =>
          or(...parts.map((p) => and(p.g, cmp("=", num(p.t, "set"), d)))),
        );
      const out = new Map<number, Bx>();
      for (const p of parts)
        for (const [id, g] of alts(p.t, "set"))
          if (id >= 0) out.set(id, or(out.get(id) ?? false, and(p.g, g)));
      return {
        k: "eset",
        sort: parts[0].t.k === "elem" ? parts[0].t.sort : "?",
        mem: [...out],
      };
    }
    default:
      throw new Error(`${e.fn}(…) is not checked yet`);
  }
}

/**
 * The readings of a board of diagonals (Slant's): its points, which way a
 * diagonal runs through one, the points the diagonals join, the cells
 * joined across a set of edges, and the mark on the edges. `null` for any
 * other function.
 */
function diagonalCall(fn: string, vs: readonly V[], ctx: Ctx): V | null {
  const { board } = ctx;
  const { sp } = board;
  const mark = board.edgeMark;
  // The mark on an edge: its candidates, which only a technique reads.
  if (mark !== null && fn === mark.name) {
    if (ctx.mode === "rule") throw new TypeError(`${fn} in a rule`);
    return lift(vs[0], fn, (e) =>
      vsetOf(board, (n) => (e < 0 ? false : (mark.cand[e][n] ?? false))),
    );
  }
  switch (fn) {
    case "points":
      return lift(vs[0], fn, (c) => allOf("point", c < 0 ? [] : sp.cellPoints[c]));
    case "slash":
      return lift(vs[0], fn, (c) =>
        lift(vs[1], fn, (k) => ({
          k: "num",
          v: c < 0 || k < 0 ? -1 : slash(sp, c, k),
        })),
      );
    case "linked":
      return lift(vs[0], fn, (k) => (k < 0 ? allOf("point", []) : linkedOf(ctx, k)));
    case "through": {
      // Read as reach: a cell is in it where a cell beside it is, across an
      // edge of the set, as many steps as the board has cells.
      const E =
        vs[1].k === "vset" && vs[1].mem.every((g) => g === false)
          ? allOf("edge", [])
          : vs[1];
      if (E.k !== "eset") throw new TypeError(`${fn}: not a set of edges`);
      return lift(vs[0], fn, (c) => {
        if (c < 0) return allOf("cell", []);
        const across = sp.cells.map((x) =>
          sp.adj4[x].map((p) => [p, inEset(sp.edgeOf(x, p), E)] as const),
        );
        let reach: Bx[] = sp.cells.map((x) => x === c);
        for (let k = 1; k < sp.cells.length; k++) {
          const was = reach;
          reach = sp.cells.map((x) =>
            or(was[x], ...across[x].map(([p, g]) => and(was[p], g))),
          );
        }
        return {
          k: "eset",
          sort: "cell",
          mem: sp.cells
            .map((x) => [x, reach[x]] as const)
            .filter(([, g]) => g !== false),
        };
      });
    }
  }
  return null;
}

function call(fn: string, args: readonly Expr[], env: Env, ctx: Ctx): V {
  const { board } = ctx;
  const { sp } = board;
  if (fn === "clues") {
    const a = args[0];
    if (a.k !== "name") throw new TypeError("clues(kind)");
    return { k: "clues", kind: a.name };
  }
  const field = [...ctx.d.clueKinds.values()].find((c) => c.fields.has(fn));
  if (field !== undefined) {
    // A clue at the board's field, of the clue, and of a cell where it is
    // one a cell.
    const k = evaluate(args[0], env, ctx);
    const x = field.fields.get(fn)?.at === null ? null : evaluate(args[1], env, ctx);
    return join(
      clueOf(ctx, k).map(({ clue, g }) => {
        const f = clue.fields?.get(fn);
        if (f === undefined) throw new Error(`no field ${fn}`);
        if (!Array.isArray(f)) return [g, { k: "num", v: f as Nx }] as const;
        const at = x as V;
        return [
          g,
          lift(at, fn, (c) => ({ k: "num", v: (f as readonly Nx[])[c] })),
        ] as const;
      }),
    );
  }
  if (fn === "clue") {
    const a = args[0];
    if (a.k !== "name") throw new TypeError("clue(kind, x)");
    const x = evaluate(args[1], env, ctx);
    const list = board.clues.get(a.name) ?? [];
    // A clue per value sits at its element for the value read third.
    const per = args.length === 3 ? num(evaluate(args[2], env, ctx), "clue") : null;
    if (per !== null && typeof per !== "number")
      throw new TypeError("clue(kind, x, d): d is a value the binding gives");
    return lift(x, "clue", (e) => {
      const id = per === null ? e : perPlace(e, per);
      const here = list.filter((k) => k.at === id);
      if (here.length === 0) return { k: "num", v: -1 };
      return join([
        ...here.map((k) => [k.present, k.v] as const),
        [not(or(...here.map((k) => k.present))), { k: "num", v: -1 }],
      ]);
    });
  }
  if (fn === "latin") {
    // `latin(value, lines)`: the answer distinct in every line, or where a
    // value repeats, each value of the domain `times(d)` times in each.
    const lines = evaluate(args[1], env, ctx);
    if (lines.k !== "eset") throw new TypeError("latin(f, lines)");
    const dom = evaluate(ctx.d.domain, new Map(), ctx);
    if (dom.k !== "vset")
      throw new TypeError("latin: the domain is not a set of values");
    const each = (cells: readonly number[]): Bx =>
      ctx.d.repeat === null
        ? Z3.Distinct(...cells.map((c) => board.ans[c]))
        : and(
            ...dom.mem.map((g, n) =>
              implies(
                g,
                cmp(
                  "=",
                  sumOf(cells.map((c) => ite(board.ans[c].eq(n), 1, 0))),
                  timesOf(ctx, n),
                ),
              ),
            ),
          );
    return {
      k: "bool",
      v: and(...lines.mem.map(([L, g]) => implies(g, each(sp.lineCells[L])))),
    };
  }
  const filling = env.get(fn);
  if (filling?.k === "fill") {
    const x = evaluate(args[0], env, ctx);
    return lift(x, fn, (c) => ({ k: "num", v: filling.vals.get(c) ?? -1 }));
  }
  const vs = args.map((x) => evaluate(x, env, ctx));
  // None, which an element may be under some guard, reads as nothing: no
  // value, no candidates, no fact about it holding.
  const nothing: Record<string, V> = {
    known: { k: "bool", v: false },
    value: { k: "num", v: -1 },
    cand: vsetOf(board, () => false),
    strike: { k: "bool", v: false },
    place: { k: "bool", v: false },
    x: { k: "num", v: -1 },
    y: { k: "num", v: -1 },
    corners: allOf("corner", []),
    row: { k: "elem", sort: "none", alts: [[-1, true]] },
    col: { k: "elem", sort: "none", alts: [[-1, true]] },
    adj4: allOf("cell", []),
    adj8: allOf("cell", []),
  };
  const cellFn = (f: (c: number) => V): V =>
    lift(vs[0], fn, (c) => {
      if (c >= 0) return f(c);
      const v = nothing[fn];
      if (v === undefined) throw new Error(`${fn} of none`);
      return v;
    });
  const diagonal = diagonalCall(fn, vs, ctx);
  if (diagonal !== null) return diagonal;
  // A partition named as a function: the part holding a cell, and of none,
  // none.
  const none: V = { k: "elem", sort: "none", alts: [[-1, true]] };
  if (ctx.d.json.space.units.includes(fn) && board.regions.get(fn) === undefined)
    return lift(vs[0], fn, (c) => (c < 0 ? none : elem("line", sp.boxOf[c])));
  // A relation the board deals: each cell in it where that pair is, and of
  // none, nothing.
  const related = board.relations.get(fn);
  if (related !== undefined)
    return lift(vs[0], fn, (a) =>
      a < 0
        ? allOf("cell", [])
        : {
            k: "eset",
            sort: "cell",
            mem: sp.cells.map((b) => [b, related[a][b]] as const),
          },
    );
  const holding = board.regions.get(fn);
  if (holding !== undefined)
    return lift(vs[0], fn, (c) => {
      if (c < 0) return none;
      const at = holding.parts.flatMap((p, i) =>
        p.includes(c) ? [[i, holding.present[i]] as const] : [],
      );
      return { k: "elem", sort: `region ${fn}`, alts: at };
    });
  switch (fn) {
    case "cells": {
      const s = vs[0];
      const part =
        s.k === "elem" && s.sort.startsWith("region ")
          ? board.regions.get(s.sort.slice("region ".length))
          : undefined;
      if (part !== undefined)
        return lift(s, fn, (r) => allOf("cell", r < 0 ? [] : part.parts[r]));
      if (s.k === "elem" && s.sort === "corner")
        return lift(s, fn, (k) => allOf("cell", sp.cornerCells[k]));
      if (s.k === "elem" && s.sort === "point")
        return lift(s, fn, (k) => allOf("cell", k < 0 ? [] : sp.pointCells[k]));
      return lift(vs[0], fn, (L) => allOf("cell", L < 0 ? [] : sp.lineCells[L]));
    }
    case "row":
      return cellFn((c) => elem("line", sp.rowOf[c]));
    case "col":
      return cellFn((c) => elem("line", sp.colOf[c]));
    case "peers":
      return cellFn((c) => allOf("cell", sp.peers[c]));
    case "units_of":
      return cellFn((c) => allOf("line", sp.unitsOf[c]));
    case "adj4":
      return cellFn((c) => allOf("cell", sp.adj4[c]));
    case "adj8":
      return cellFn((c) => allOf("cell", sp.adj8[c]));
    case "within": {
      const r = num(vs[1], fn);
      if (typeof r !== "number") throw new Error("within: a distance the board fixes");
      return cellFn((c) => allOf("cell", within(sp, c, r)));
    }
    case "ray":
      // A cell with itself names no direction.
      return lift(vs[0], fn, (c) =>
        lift(vs[1], fn, (n) =>
          allOf("cell", c < 0 || n < 0 || c === n ? [] : ray(sp, c, n)),
        ),
      );
    case "step": {
      // Each direction under the value naming it, and none under every
      // other value.
      const d = num(vs[1], fn);
      return lift(vs[0], fn, (c) => {
        if (c < 0) return none;
        const named = DIRECTIONS.map((k) => cmp("=", d, k));
        return {
          k: "elem",
          sort: "cell",
          alts: merged([
            ...DIRECTIONS.map((k, i) => [step(sp, c, k), named[i]] as const),
            [-1, not(or(...named))],
          ]),
        };
      });
    }
    case "chain":
      // Read as reach: a cell is in it where a member beside it holds the
      // value stepping to it, as many steps as the board has cells.
      return lift(vs[0], fn, (c) => {
        if (c < 0) return allOf("cell", []);
        let reach: Bx[] = sp.cells.map((x) => x === c);
        for (let k = 1; k < sp.cells.length; k++) {
          const was = reach;
          reach = sp.cells.map((x) =>
            or(
              was[x],
              ...sp.adj4[x].map((p) =>
                and(
                  was[p],
                  cmp(
                    "=",
                    cellValue(ctx, p),
                    DIRECTIONS.find((d) => step(sp, p, d) === x) ?? -1,
                  ),
                ),
              ),
            ),
          );
        }
        return {
          k: "eset",
          sort: "cell",
          mem: sp.cells
            .map((x) => [x, reach[x]] as const)
            .filter(([, g]) => g !== false),
        };
      });
    case "sight":
      return lift(vs[0], fn, (s) => allOf("cell", sp.sight[s]));
    case "opposite":
      return lift(vs[0], fn, (s) => elem("slot", sp.opposite[s]));
    case "corners":
      return cellFn((c) => allOf("corner", sp.cellCorners[c]));
    case "beam": {
      // With a cell and a value, as if the cell held it; a cell that is none
      // supposes nothing.
      const as = vs.length === 3 ? alts(vs[1], fn) : ([[-1, true]] as const);
      const d = vs.length === 3 ? num(vs[2], fn) : 0;
      return lift(vs[0], fn, (s) =>
        join(
          as
            .filter(([, g]) => g !== false)
            .map(([u, g]) => [
              g,
              {
                k: "num",
                v: joinNum(
                  beamPaths(ctx, s, u, d).map(([p, r]) => [p, r < 0 ? -1 : r]),
                ),
              },
            ]),
        ),
      );
    }
    case "ahead":
      return lift(vs[0], fn, (s) => ({
        k: "elem",
        sort: "cell",
        alts: merged(beamPaths(ctx, s, -1, 0).map(([p, r]) => [r < 0 ? ~r : -1, p])),
      }));
    case "across":
      return lift(vs[0], fn, (k) =>
        lift(vs[1], fn, (c) => {
          const cs = sp.cornerCells[k];
          return elem("cell", cs[3 - cs.indexOf(c)]);
        }),
      );
    case "nth": {
      // Past either end is none.
      const v0 = vs[0];
      const i = num(vs[1], fn);
      // In a set the marks decide, a member is the ith where it is in the
      // set and i of the members before it are.
      if (v0.k === "eset" && v0.mem.some(([, g]) => g !== true)) {
        const at: Alt[] = v0.mem.map(([id, g], j) => {
          const before = sumOf(v0.mem.slice(0, j).map(([, h]) => ite(h, 1, 0)));
          return [id, and(g, cmp("=", before, i))] as const;
        });
        at.push([-1, not(or(...at.map(([, g]) => g)))]);
        return { k: "elem", sort: v0.sort, alts: at.filter(([, g]) => g !== false) };
      }
      const L = known(v0, fn);
      const at: Alt[] = L.map((id, j) => [id, cmp("=", i, j)] as const);
      at.push([-1, not(or(...at.map(([, g]) => g)))]);
      return {
        k: "elem",
        sort: v0.k === "eset" ? v0.sort : "?",
        alts: at.filter(([, g]) => g !== false),
      };
    }
    case "index": {
      // In a set the marks decide, the members before one each count under
      // their guard, and an element not in it is at -1.
      const L = vs[1];
      if (L.k !== "eset") throw new TypeError(`${fn}: not a set`);
      return lift(vs[0], fn, (id) => {
        const i = L.mem.findIndex(([m]) => m === id);
        if (i < 0) return { k: "num", v: -1 };
        const before = sumOf(L.mem.slice(0, i).map(([, g]) => ite(g, 1, 0)));
        return { k: "num", v: ite(L.mem[i][1], before, -1) };
      });
    }
    case "stretch": {
      // A cell of L is in the stretch round c where every cell from c to it
      // is in S.
      // A comprehension that binds nothing is an empty set of values.
      const S =
        vs[2].k === "vset" && vs[2].mem.every((g) => g === false)
          ? allOf("cell", [])
          : vs[2];
      if (S.k !== "eset") throw new TypeError(`${fn}: not a set`);
      return lift(vs[0], fn, (L) =>
        lift(vs[1], fn, (c): V => {
          // A line that is none holds nothing.
          const cells = L < 0 ? [] : sp.lineCells[L];
          const i = cells.indexOf(c);
          const mem: Alt[] = cells.map((y, j) => {
            const span = j < i ? cells.slice(j, i + 1) : cells.slice(i, j + 1);
            return [y, i < 0 ? false : and(...span.map((x) => inEset(x, S)))] as const;
          });
          return { k: "eset", sort: "cell", mem: mem.filter(([, g]) => g !== false) };
        }),
      );
    }
    case "connected":
    case "cuts": {
      const S =
        vs[0].k === "vset" && vs[0].mem.every((g) => g === false)
          ? allOf("cell", [])
          : vs[0];
      if (S.k !== "eset") throw new TypeError(`${fn}: not a set`);
      const mem = sp.cells.map((c) => inEset(c, S));
      if (fn === "connected") return { k: "bool", v: connectedOf(sp, mem) };
      const cut: Alt[] = sp.cells.map(
        (c) =>
          [
            c,
            and(
              mem[c],
              not(
                connectedOf(
                  sp,
                  mem.map((g, i) => (i === c ? false : g)),
                ),
              ),
            ),
          ] as const,
      );
      return { k: "eset", sort: "cell", mem: cut.filter(([, g]) => g !== false) };
    }
    case "before": {
      // A set the marks decide keeps its order, so the members before one
      // are the earlier squares that may be in it, each under its guard.
      const L = vs[1];
      if (L.k !== "eset") throw new TypeError(`${fn}: not a set`);
      return lift(vs[0], fn, (id) => {
        const i = L.mem.findIndex(([m]) => m === id);
        return { k: "eset", sort: L.sort, mem: i < 0 ? [] : L.mem.slice(0, i) };
      });
    }
    case "x":
      return cellFn((c) => ({ k: "num", v: c % sp.w }));
    case "y":
      return cellFn((c) => ({ k: "num", v: (c / sp.w) | 0 }));
    case "cell": {
      // Off the grid is none, which a guard on the grid never reaches.
      const x = num(vs[0], fn);
      const y = num(vs[1], fn);
      const at: Alt[] = sp.cells.map(
        (c) => [c, and(cmp("=", x, c % sp.w), cmp("=", y, (c / sp.w) | 0))] as const,
      );
      at.push([-1, not(or(...at.map(([, g]) => g)))]);
      return { k: "elem", sort: "cell", alts: at.filter(([, g]) => g !== false) };
    }
    case "edge":
      return lift(vs[0], fn, (a) =>
        lift(vs[1], fn, (b) => elem("edge", sp.edgeOf(a, b))),
      );
    case "ends":
      return lift(vs[0], fn, (e) =>
        allOf("cell", [sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]]),
      );
    case "end1":
    case "end2":
      return lift(vs[0], fn, (e) =>
        elem("cell", sp.edgeEnds[2 * e + (fn === "end1" ? 0 : 1)]),
      );
    case "other":
      return lift(vs[0], fn, (e) =>
        lift(vs[1], fn, (c) =>
          elem(
            "cell",
            sp.edgeEnds[2 * e] === c ? sp.edgeEnds[2 * e + 1] : sp.edgeEnds[2 * e],
          ),
        ),
      );
    case "known":
      return cellFn((c) => ({ k: "bool", v: knownAt(ctx, c) }));
    case "value":
      return cellFn((c) => ({ k: "num", v: cellValue(ctx, c) }));
    case "cand":
      return cellFn((c) => vsetOf(board, (d) => candAt(ctx, c, d)));
    case "abs": {
      const a = num(vs[0], fn);
      return {
        k: "num",
        v:
          typeof a === "number"
            ? Math.abs(a)
            : ite(cmp("<", a, 0), arith("-", 0, a), a),
      };
    }
    case "times":
      return { k: "num", v: timesOf(ctx, num(vs[0], fn)) };
    case "range": {
      const a = num(vs[0], fn);
      const b = num(vs[1], fn);
      // Each member under its being between the ends, which may be unknown.
      return vsetOf(board, (d) => and(cmp(">=", d, a), cmp("<=", d, b)));
    }
    case "subsets":
      return { k: "subsets", of: vs[0] };
    case "first": {
      const s = vs[0];
      if (s.k === "vset") {
        const out: Alt[] = s.mem.map(
          (g, d) => [d, and(g, ...s.mem.slice(0, d).map(not))] as const,
        );
        let acc: Nx = -1;
        for (let i = out.length - 1; i >= 0; i--) acc = ite(out[i][1], out[i][0], acc);
        return { k: "num", v: acc };
      }
      if (s.k !== "eset") throw new TypeError("first of a non-set");
      const out: Alt[] = s.mem.map(
        ([id, g], i) =>
          [id, and(g, ...s.mem.slice(0, i).map(([, h]) => not(h)))] as const,
      );
      out.push([-1, and(...s.mem.map(([, g]) => not(g)))]);
      return { k: "elem", sort: s.sort, alts: out };
    }
    case "at":
    case "per":
    case "v": {
      const k = vs[0];
      const decl =
        k.k === "elem" ? ctx.d.clueKinds.get(k.sort.slice("clue ".length)) : undefined;
      const sort = decl === undefined ? "?" : placeSort(board, decl.at);
      // A clue per value sits at its element and the value both.
      const place = (at: number): number => (decl?.per ? perElement(at) : at);
      return join(
        clueOf(ctx, k).map(({ clue, g }) => {
          if (fn === "v") return [g, clue.v] as const;
          if (fn === "at") return [g, elem(sort, place(clue.at))] as const;
          return [g, { k: "num", v: perValue(clue.at) } as V] as const;
        }),
      );
    }
    case "strike":
    case "place": {
      if (!ctx.concluding) throw new Error(`${fn} outside a conclusion`);
      const d = num(vs[1], fn);
      // A strike on an edge is a fact about what its mark means, where the
      // answer is not the edges'.
      if (vs[0].k === "elem" && vs[0].sort === "edge" && ctx.d.answerSort !== "edge") {
        if (fn === "place") throw new Error("place on an edge");
        return lift(vs[0], fn, (e) => ({
          k: "bool",
          v: e < 0 ? false : cmp("!=", edgeMeaning(ctx, e), d),
        }));
      }
      return cellFn((c) => ({
        k: "bool",
        v: cmp(fn === "strike" ? "!=" : "=", board.ans[c], d),
      }));
    }
  }
  const def = ctx.d.defs.get(fn);
  if (def !== undefined) {
    const inner = new Map<string, V>();
    def.params.forEach((p, i) => {
      inner.set(p, vs[i]);
    });
    return evaluate(def.body, inner, ctx);
  }
  throw new ReferenceError(`unknown function ${fn}`);
}

// --- a description's board, rules and marks -----------------------------------

/** {@link BOARD_CLUES} clues at the board of a kind, each present or not,
 * and each field's value unknown within its range: one a clue, or one an
 * element of the field's sort. */
function boardClues(kind: string, fields: ClueKind["fields"], ctx: Ctx): ClueSym[] {
  const { board } = ctx;
  return Array.from({ length: BOARD_CLUES }, (_, k): ClueSym => {
    const values = new Map<string, Nx | readonly Nx[]>();
    for (const [name, f] of fields) {
      if (f.value.k !== "call" || f.value.fn !== "range")
        throw new Error(
          `clue ${kind} ${name}: a field is checked with a range of values`,
        );
      const [lo, hi] = f.value.args.map((a) =>
        num(evaluate(a, new Map(), ctx), "range"),
      );
      const one = (id: string): I => {
        const v = Z3.Int.const(`clue_${kind}_${k}_${name}${id}_${boardCount}`);
        board.clueDomain.push(and(cmp(">=", v, lo), cmp("<=", v, hi)));
        return v;
      };
      if (f.at === null) values.set(name, one(""));
      else {
        if (f.at !== "cell")
          throw new Error(`clue ${kind} ${name}: only a field a cell is checked yet`);
        values.set(
          name,
          board.sp.cells.map((c) => one(`_${c}`)),
        );
      }
    }
    return {
      at: -1,
      present: Z3.Bool.const(`clue_${kind}_${k}_${boardCount}`),
      v: { k: "num", v: -1 },
      fields: values,
    };
  });
}

/** Every clue of each kind the board could be dealt (`describe-check.ts`'s
 * header): an element per member of a kind whose value is an element set,
 * each present or not; one clue a place, its value unknown, for a kind whose
 * values are numbers. */
function dealSymbolically(d: Description, board: Board): void {
  const ctx: Ctx = { board, d, mode: "rule", concluding: false, supposed: [] };
  for (const [kind, c] of d.clueKinds) {
    if (c.value === null) {
      board.clues.set(kind, boardClues(kind, c.fields, ctx));
      continue;
    }
    const part = board.regions.get(c.at);
    const places =
      c.at === "edge"
        ? board.sp.edgeEnds.length / 2
        : c.at === "slot"
          ? board.sp.slots.length
          : c.at === "corner"
            ? board.sp.corners.length
            : c.at === "cell"
              ? board.sp.cells.length
              : c.at === "point"
                ? board.sp.points.length
                : c.at === "line"
                  ? board.sp.lines.length
                  : part !== undefined
                    ? part.parts.length
                    : null;
    if (places === null)
      throw new Error(
        `clue ${kind}: only edge, slot, corner, cell, point, line and region clues are checked yet`,
      );
    const complete = d.json.clues?.[kind]?.complete === true;
    const list: ClueSym[] = [];
    if (c.per) {
      // One clue at each place for each value the domain may hold, each
      // present or not, its value within its range.
      if (c.value.k !== "call" || c.value.fn !== "range")
        throw new Error(`clue ${kind}: a clue per value is checked with a range`);
      const dom = domainOfAny(d, ctx);
      for (let e = 0; e < places; e++) {
        const here = new Map([["at", elem(placeSort(board, c.at), e)]]);
        const [lo, hi] = c.value.args.map((a) => num(evaluate(a, here, ctx), "range"));
        dom.forEach((g, n) => {
          if (g === false) return;
          const v = Z3.Int.const(`clue_${kind}_${e}_${n}_v_${boardCount}`);
          const present = Z3.Bool.const(`clue_${kind}_${e}_${n}_${boardCount}`);
          board.clueDomain.push(
            and(cmp(">=", v, lo), cmp("<=", v, hi)),
            implies(present, g),
          );
          list.push({ at: perPlace(e, n), present, v: { k: "num", v } });
        });
      }
      board.clues.set(kind, list);
      continue;
    }
    for (let e = 0; e < places; e++) {
      const here = new Map([["at", elem(placeSort(board, c.at), e)]]);
      // A range of numbers is read as its bounds, which a value set of the
      // board's own size could not hold: a cage's sum runs past the order.
      // A complete kind at a partition's regions is on every region dealt.
      if (
        c.value.k === "call" &&
        c.value.fn === "range" &&
        (!complete || part !== undefined)
      ) {
        const [lo, hi] = c.value.args.map((a) => num(evaluate(a, here, ctx), "range"));
        const v = Z3.Int.const(`clue_${kind}_${e}_v_${boardCount}`);
        board.clueDomain.push(and(cmp(">=", v, lo), cmp("<=", v, hi)));
        if (complete && part !== undefined) {
          list.push({ at: e, present: part.present[e], v: { k: "num", v } });
          continue;
        }
        const present = Z3.Bool.const(`clue_${kind}_${e}_${boardCount}`);
        if (part !== undefined)
          board.clueDomain.push(implies(present, part.present[e]));
        list.push({ at: e, present, v: { k: "num", v } });
        continue;
      }
      if (part !== undefined)
        throw new Error(
          `clue ${kind}: a region's clue is checked with a range of values`,
        );
      const values = evaluate(c.value, here, ctx);
      if (values.k === "eset") {
        for (const [id] of values.mem)
          list.push({
            at: e,
            present: Z3.Bool.const(`clue_${kind}_${e}_${id}_${boardCount}`),
            v: elem("cell", id),
          });
      } else if (values.k === "vset") {
        const v = Z3.Int.const(`clue_${kind}_${e}_v_${boardCount}`);
        board.clueDomain.push(or(...values.mem.map((g, n) => and(g, v.eq(n)))));
        list.push({
          at: e,
          present: complete ? true : Z3.Bool.const(`clue_${kind}_${e}_${boardCount}`),
          v: { k: "num", v },
        });
      }
    }
    board.clues.set(kind, list);
  }
}

/** The answer's domain at cell `c`. A domain may be the cell's own
 * (Seismic's, its area's numbers), unless the board is measured in a `c`
 * (Solo's). */
function domainAt(d: Description, ctx: Ctx, c: number): Bx[] {
  const at = "c" in d.json.sizes ? new Map() : new Map([["c", elem("cell", c)]]);
  const dom = evaluate(d.domain, at, ctx);
  if (dom.k !== "vset")
    throw new TypeError("the answer's domain is not a set of values");
  return [...dom.mem];
}

/** The values some cell's domain holds: what a clue per value is dealt at. */
function domainOfAny(d: Description, ctx: Ctx): Bx[] {
  const each = ctx.board.ans.map((_, c) => domainAt(d, ctx, c));
  return Array.from({ length: ctx.board.top + 1 }, (_, n) =>
    or(...each.map((mem) => mem[n] ?? false)),
  );
}

/** The rules, the answer's domain, and marks consistent with the answer. */
function worldOf(d: Description, board: Board): Bx[] {
  const ctx: Ctx = { board, d, mode: "rule", concluding: false, supposed: [] };
  const out: Bx[] = [...board.clueDomain];
  board.ans.forEach((a, c) => {
    const dom = { mem: domainAt(d, ctx, c) };
    out.push(or(...dom.mem.map((g, n) => and(g, a.eq(n)))));
    // A mark is of a value of the domain, which may be fewer than the order.
    board.cand[c].forEach((g, n) => {
      if (n > 0) out.push(implies(g, dom.mem[n] ?? false));
    });
    // Consistent marks: the answer is never struck, and a placed cell holds
    // just it.
    out.push(or(...board.cand[c].map((g, n) => and(g, a.eq(n)))));
    out.push(
      implies(
        board.known[c],
        and(...board.cand[c].map((g, n) => (n === 0 ? true : iff(g, a.eq(n))))),
      ),
    );
  });
  // A consistent mark on an edge holds what its `of` reads of the answer,
  // and only values its notation names.
  const mark = board.edgeMark;
  if (mark !== null) {
    const dom = evaluate(mark.notation, new Map(), ctx);
    if (dom.k !== "vset") throw new TypeError(`${mark.name}: not a set of values`);
    mark.cand.forEach((cands, e) => {
      const means = edgeMeaning(ctx, e);
      out.push(or(...cands.map((g, n) => and(g, cmp("=", means, n)))));
      cands.forEach((g, n) => {
        if (n > 0) out.push(implies(g, dom.mem[n] ?? false));
      });
    });
  }
  for (const r of d.rules) out.push(bool(evaluate(r.expr, new Map(), ctx), r.name));
  for (const [kind, c] of d.clueKinds)
    (board.clues.get(kind) ?? []).forEach((k, i) => {
      // A clue at the board is `k` in its meaning.
      const own = new Map(
        c.value === null
          ? [["k", elem(`clue ${kind}`, i)]]
          : c.per
            ? [
                ["at", elem(placeSort(board, c.at), perElement(k.at))],
                ["per", { k: "num", v: perValue(k.at) } as V],
                ["v", k.v],
              ]
            : [
                ["at", elem(placeSort(board, c.at), k.at)],
                ["v", k.v],
              ],
      );
      out.push(implies(k.present, bool(evaluate(c.means, own, ctx), `clue ${kind}`)));
    });
  return out;
}

export interface Verdict {
  technique: string;
  order: number;
  verdict: "sound" | "unsound" | "unknown";
  queries: number;
  seconds: number;
  /** The first binding found unsound, by its names' concrete values. */
  at?: string;
}

/**
 * The clue kinds a board of `order` cannot hold one of under the rules. A
 * technique's reading of such a kind is checked on no board, however sound
 * its verdict: Mathrax's quotient needs two disjoint pairs of one ratio
 * around a corner, which no Latin square smaller than 6 has.
 */
export async function impossibleKinds(
  d: Description,
  order: number,
  sizes: ReadonlyMap<string, number> = new Map(),
  cells?: number,
): Promise<string[]> {
  const board = makeBoard(order, d, sizes, cells);
  dealPartitions(d, board);
  dealSymbolically(d, board);
  const solver = new Z3.Solver();
  for (const w of worldOf(d, board)) solver.add(asZ3(w));
  const out: string[] = [];
  for (const [kind, list] of board.clues) {
    const any = or(...list.map((k) => k.present));
    if (any === false) {
      out.push(kind);
      continue;
    }
    solver.push();
    solver.add(asZ3(any));
    if ((await solver.check()) === "unsat") out.push(kind);
    solver.pop();
  }
  return out;
}

/**
 * Each assignment of the sizes an `order` board does not fix (Salad's
 * `nums`, Seismic's `mode`), over their ranges, where a repeated value
 * appears at least once, which is where the rest of the domain fits the
 * board: one map a board, and one empty map where there are none.
 */
export function sizings(d: Description, order: number): Map<string, number>[] {
  const { grid } = d.json.space;
  const fixed = new Set([
    "order",
    "w",
    "h",
    ...(grid === undefined ? [] : [grid.w, grid.h]),
    ...spaceOf(order, d).sizes.keys(),
  ]);
  // A size wider than the board is one unknown on it, not a world a value.
  const open = new Set(openSizes(d, order));
  const free = Object.entries(d.json.sizes).filter(
    ([n]) => !fixed.has(n) && !open.has(n),
  );
  const bound = domainBound(d);
  let out: Map<string, number>[] = [new Map()];
  for (const [name, { min, max: most }] of free) {
    // A domain past the order reaches one value further than the cells
    // (Guess at one more color than slots): further adds nothing new.
    const max = name === bound ? Math.min(most, order + 1) : most;
    out = out.flatMap((m) =>
      Array.from({ length: max - min + 1 }, (_, i) => new Map([...m, [name, min + i]])),
    );
  }
  return out.filter((sizes) => {
    const ctx: Ctx = {
      board: makeBoard(order, d, sizes),
      d,
      mode: "rule",
      concluding: false,
      supposed: [],
    };
    if (d.repeat === null) return true;
    const times = num(evaluate(d.repeat.times, new Map(), ctx), "repeat times");
    return typeof times === "number" && times >= 1;
  });
}

/** Whether `d`'s rules allow any answer on an `order` board: where they do
 * not, every technique is sound there and says nothing. */
export async function hasAnswer(
  d: Description,
  order: number,
  sizes: ReadonlyMap<string, number> = new Map(),
  cells?: number,
): Promise<boolean> {
  const board = makeBoard(order, d, sizes, cells);
  dealPartitions(d, board);
  dealSymbolically(d, board);
  const solver = new Z3.Solver();
  for (const w of worldOf(d, board)) solver.add(asZ3(w));
  return (await solver.check()) === "sat";
}

/** How long the default solver is given a query before the bit-blasting
 * one is asked, and z3's own "no limit". */
const QUICK_MS = Number(process.env["CHECK_QUICK_MS"] ?? 60_000);
const NO_LIMIT = 4_294_967_295;

/** Check one technique sound against `d`'s rules on an `order` board. */
export async function checkTechnique(
  d: Description,
  t: Technique,
  order: number,
  sizes: ReadonlyMap<string, number> = new Map(),
  split = 1,
  cells?: number,
  run: {
    /** Only every `of`th query, from the `index`th: one process's share. */
    shard?: { index: number; of: number };
    /** Called every 50 queries with how many are done of how many due, and
     * the first binders of the query starting. */
    progress?: (done: number, of: number, at: string) => void;
  } = {},
): Promise<Verdict> {
  const t0 = performance.now();
  const board = makeBoard(order, d, sizes, cells);
  dealPartitions(d, board);
  dealSymbolically(d, board);
  const world = worldOf(d, board);
  const ctx: Ctx = { board, d, mode: "technique", concluding: false, supposed: [] };
  const solver = new Z3.Solver();
  const rules = world.map((w) => asZ3(w));
  for (const w of rules) solver.add(w);
  // A count of squares, a sum of terms each 0 or 1 (Mines' mine total read
  // alone), sends the default search splitting square by square past an
  // hour, and bit-blasted to SAT it is settled in seconds (2026-11-02). A
  // query the default does not settle in a minute is asked of that, and
  // where it cannot encode the query, of the default again without a limit;
  // each answers soundly, so which settles a query is only a matter of time.
  const blasted = Z3.AndThen(
    "simplify",
    "lia2card",
    "pb2bv",
    "bit-blast",
    "sat",
  ).solver();
  for (const w of rules) blasted.add(w);
  // The first `split` binders concrete, one query each; the rest one
  // disjunction of every binding's premise without its conclusion, built as
  // its query runs, so that one group is held at a time.
  const all: { env: Env; g: Bx }[] = [];
  bindings(t.binders.slice(0, split), 0, new Map(), true, ctx, (env, g) => {
    all.push({ env, g });
  });
  const { shard, progress } = run;
  const heads =
    shard === undefined ? all : all.filter((_, i) => i % shard.of === shard.index);
  let queries = 0;
  for (const [done, head] of heads.entries()) {
    const key = t.binders
      .slice(0, split)
      .map((b) => show(head.env.get(b.name) ?? null))
      .join(" ");
    if (done % 50 === 0) progress?.(done, heads.length, key);
    const parts: Bx[] = [];
    bindings(t.binders, split, head.env, head.g, ctx, (env, g) => {
      const premise =
        t.premise === null ? true : bool(evaluate(t.premise, env, ctx), "premise");
      const concl = bool(
        evaluate(t.conclude, env, { ...ctx, concluding: true }),
        "conclusion",
      );
      parts.push(and(g, premise, not(concl)));
    });
    const bad = or(...parts);
    if (bad === false) continue;
    queries++;
    // Split deeper, a run makes thousands of queries, and what the solver
    // keeps between pushes grew Mines' `count` past z3's 2 GB heap on a 4×4
    // board (2026-11-01); a reset solver starts each from the rules alone.
    if (split > 1) {
      solver.reset();
      for (const w of rules) solver.add(w);
    }
    solver.push();
    solver.add(asZ3(bad));
    solver.set("timeout", QUICK_MS);
    let r = await solver.check();
    if (r === "unknown") {
      blasted.push();
      blasted.add(asZ3(bad));
      r = await blasted.check();
      blasted.pop();
    }
    if (r === "unknown") {
      solver.set("timeout", NO_LIMIT);
      r = await solver.check();
    }
    solver.pop();
    if (r !== "unsat")
      return {
        technique: t.id,
        order,
        verdict: r === "sat" ? "unsound" : "unknown",
        queries,
        seconds: (performance.now() - t0) / 1000,
        at: key,
      };
  }
  return {
    technique: t.id,
    order,
    verdict: "sound",
    queries,
    seconds: (performance.now() - t0) / 1000,
  };
}

function show(v: V | null): string {
  if (v === null) return "?";
  if (v.k === "num") return typeof v.v === "number" ? String(v.v) : "?";
  if (v.k === "elem") return v.alts.length === 1 ? `${v.sort} ${v.alts[0][0]}` : "?";
  return v.k;
}

/** A library's techniques as a description's: placed on a Latin square of
 * the library's own, whose only rule is that no value repeats in a line, or
 * with `repeat`, that its last value appears twice in each and the others
 * once. */
export function libraryDescription(
  lib: LibraryJson,
  repeat = false,
): {
  d: Description;
  techniques: Technique[];
} {
  const json: DescriptionJson = {
    game: lib.library,
    name: lib.library,
    family: lib.library,
    sizes: { order: { min: 3, max: 16 } },
    space: { grid: { w: "order", h: "order" }, edges: true, units: ["rows", "cols"] },
    answer: {
      value: repeat
        ? {
            sort: "cell",
            domain: "range(1, order - 1)",
            repeat: { value: "order - 1", times: "2" },
          }
        : { sort: "cell", domain: "range(1, order)" },
    },
    shape: ["latin(value, lines)"],
    freedom: { kind: "fill" },
    tiers: ["any"],
  };
  const d = loadDescription(json);
  const techniques = Object.entries(lib.techniques).map(
    ([id, stated]): Technique => ({
      ...parseTechnique(lib.library, id, stated),
      ...UNPLACED,
    }),
  );
  return { d, techniques };
}

/** `t` with its conclusion or a binder's set replaced, for a planted defect. */
export function planted(
  t: Technique,
  patch: { conclude?: string; for?: string },
): Technique {
  return {
    ...t,
    id: `${t.id} (planted)`,
    binders:
      patch.for === undefined
        ? t.binders
        : parseTechnique("planted", t.id, { for: patch.for, conclude: "true" }).binders,
    conclude: patch.conclude === undefined ? t.conclude : parse(patch.conclude),
  };
}
