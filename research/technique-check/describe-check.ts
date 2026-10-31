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
  type Description,
  type DescriptionJson,
  type LibraryJson,
  loadDescription,
  parseTechnique,
  type Technique,
} from "../../src/describe/description.ts";
import type { Binder, Expr } from "../../src/describe/expr.ts";
import { parse } from "../../src/describe/expr.ts";
import { type GridSpace, latinSpace } from "../../src/engine/describe-runtime.ts";
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
}

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
  /** Constraints on the clue variables themselves (a value's range), and on
   * which regions a partition has. */
  clueDomain: Bx[];
}

/**
 * The most cells a region of a dealt partition is checked with, by order. A
 * Keen cage holds up to six, but every region of four on a 4×4 board took
 * the checker past a 4 GB heap (2026-10-31), so a technique that reads one
 * region is checked on every shape up to these sizes and no larger.
 */
const REGION_CELLS: Readonly<Record<number, number>> = { 3: 4, 4: 3 };

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

function makeBoard(order: number): Board {
  const sp = latinSpace(order);
  const tag = `b${boardCount++}`;
  const n = order * order;
  const ans = Array.from({ length: n }, (_, c) => Z3.Int.const(`${tag}_ans_${c}`));
  const known = Array.from({ length: n }, (_, c) => Z3.Bool.const(`${tag}_known_${c}`));
  const cand = Array.from({ length: n }, (_, c) =>
    Array.from(
      { length: order + 1 },
      (_, d): Bx => (d === 0 ? false : Z3.Bool.const(`${tag}_cand_${c}_${d}`)),
    ),
  );
  return {
    sp,
    order,
    top: order,
    ans,
    known,
    cand,
    clues: new Map(),
    regions: new Map(),
    clueDomain: [],
  };
}

/** Every partition the description deals, symbolically, and the rule that
 * the regions present cover each cell once. */
function dealPartitions(d: Description, board: Board): void {
  for (const [name, how] of Object.entries(d.json.space.regions ?? {})) {
    if (how !== "dealt")
      throw new Error(`partition ${name}: only a dealt one is checked`);
    const parts = connectedRegions(board.sp, REGION_CELLS[board.order] ?? 2);
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
  return ctx.mode === "rule" ? a : ite(ctx.board.known[c], a, -1);
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
        case "units":
          return allOf("line", sp.lines);
        case "slots":
          return allOf("slot", sp.slots);
        case "corners":
          return allOf("corner", sp.corners);
        case "domain":
          return vsetOf(board, (d) => d >= 1 && d <= board.order);
        case "order":
        case "w":
        case "h":
          return { k: "num", v: board.order };
      }
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
    case "/":
      throw new Error(`${op} is not checked yet`);
  }
}

function inEset(id: number, s: V): Bx {
  if (s.k !== "eset") throw new TypeError("not an element set");
  return or(...s.mem.filter(([x]) => x === id).map(([, g]) => g));
}

function member(x: V, s: V): Bx {
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
    // being candidates where it is drawn from the marks.
    const cells = known(evaluate(b.of, env, ctx), `fill ${b.name}`);
    const vals = new Map<number, number>();
    const assign = (j: number, g: Bx): void => {
      if (g === false) return;
      if (j === cells.length) {
        next({ k: "fill", vals: new Map(vals) }, g);
        return;
      }
      const c = cells[j];
      for (let d = 1; d <= ctx.board.order; d++) {
        vals.set(c, d);
        if (b.from !== undefined && b.from !== "cand")
          throw new Error(`fill ${b.name} from ${b.from}`);
        assign(
          j + 1,
          and(g, b.from === "cand" ? (ctx.board.cand[c][d] ?? false) : true),
        );
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

function call(fn: string, args: readonly Expr[], env: Env, ctx: Ctx): V {
  const { board } = ctx;
  const { sp } = board;
  if (fn === "clues") {
    const a = args[0];
    if (a.k !== "name") throw new TypeError("clues(kind)");
    return { k: "clues", kind: a.name };
  }
  if (fn === "clue") {
    const a = args[0];
    if (a.k !== "name") throw new TypeError("clue(kind, x)");
    const x = evaluate(args[1], env, ctx);
    const list = board.clues.get(a.name) ?? [];
    return lift(x, "clue", (id) => {
      const here = list.filter((k) => k.at === id);
      if (here.length === 0) return { k: "num", v: -1 };
      return join([
        ...here.map((k) => [k.present, k.v] as const),
        [not(or(...here.map((k) => k.present))), { k: "num", v: -1 }],
      ]);
    });
  }
  if (fn === "latin") {
    // `latin(value, lines)`: the answer distinct in every line.
    const lines = evaluate(args[1], env, ctx);
    if (lines.k !== "eset") throw new TypeError("latin(f, lines)");
    return {
      k: "bool",
      v: and(
        ...lines.mem.map(([L, g]) =>
          implies(g, Z3.Distinct(...sp.lineCells[L].map((c) => board.ans[c]))),
        ),
      ),
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
  };
  const cellFn = (f: (c: number) => V): V =>
    lift(vs[0], fn, (c) => {
      if (c >= 0) return f(c);
      const v = nothing[fn];
      if (v === undefined) throw new Error(`${fn} of none`);
      return v;
    });
  switch (fn) {
    case "cells": {
      const s = vs[0];
      const part =
        s.k === "elem" && s.sort.startsWith("region ")
          ? board.regions.get(s.sort.slice("region ".length))
          : undefined;
      if (part !== undefined) return lift(s, fn, (r) => allOf("cell", part.parts[r]));
      if (s.k === "elem" && s.sort === "corner")
        return lift(s, fn, (k) => allOf("cell", sp.cornerCells[k]));
      return lift(vs[0], fn, (L) => allOf("cell", sp.lineCells[L]));
    }
    case "row":
      return cellFn((c) => elem("line", sp.rowOf[c]));
    case "col":
      return cellFn((c) => elem("line", sp.colOf[c]));
    case "peers":
      return cellFn((c) => allOf("cell", sp.peers[c]));
    case "adj4":
      return cellFn((c) => allOf("cell", sp.adj4[c]));
    case "sight":
      return lift(vs[0], fn, (s) => allOf("cell", sp.sight[s]));
    case "opposite":
      return lift(vs[0], fn, (s) => elem("slot", sp.opposite[s]));
    case "corners":
      return cellFn((c) => allOf("corner", sp.cellCorners[c]));
    case "across":
      return lift(vs[0], fn, (k) =>
        lift(vs[1], fn, (c) => {
          const cs = sp.cornerCells[k];
          return elem("cell", cs[3 - cs.indexOf(c)]);
        }),
      );
    case "nth": {
      // Past either end is none.
      const L = known(vs[0], fn);
      const v0 = vs[0];
      const i = num(vs[1], fn);
      const at: Alt[] = L.map((id, j) => [id, cmp("=", i, j)] as const);
      at.push([-1, not(or(...at.map(([, g]) => g)))]);
      return {
        k: "elem",
        sort: v0.k === "eset" ? v0.sort : "?",
        alts: at.filter(([, g]) => g !== false),
      };
    }
    case "index": {
      const L = known(vs[1], fn);
      return lift(vs[0], fn, (id) => ({ k: "num", v: L.indexOf(id) }));
    }
    case "before": {
      const L = known(vs[1], fn);
      const sort = vs[1].k === "eset" ? vs[1].sort : "?";
      return lift(vs[0], fn, (id) => {
        const i = L.indexOf(id);
        return allOf(sort, i < 0 ? [] : L.slice(0, i));
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
      return cellFn((c) => ({ k: "bool", v: board.known[c] }));
    case "value":
      return cellFn((c) => ({ k: "num", v: cellValue(ctx, c) }));
    case "cand":
      return cellFn((c) => vsetOf(board, (d) => board.cand[c][d] ?? false));
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
    case "v": {
      const k = vs[0];
      const at =
        k.k === "elem"
          ? ctx.d.clueKinds.get(k.sort.slice("clue ".length))?.at
          : undefined;
      const sort = at === undefined ? "?" : placeSort(board, at);
      return join(
        clueOf(ctx, k).map(
          ({ clue, g }) => [g, fn === "at" ? elem(sort, clue.at) : clue.v] as const,
        ),
      );
    }
    case "strike":
    case "place": {
      if (!ctx.concluding) throw new Error(`${fn} outside a conclusion`);
      const d = num(vs[1], fn);
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

/** Every clue of each kind the board could be dealt (`describe-check.ts`'s
 * header): an element per member of a kind whose value is an element set,
 * each present or not; one clue a place, its value unknown, for a kind whose
 * values are numbers. */
function dealSymbolically(d: Description, board: Board): void {
  const ctx: Ctx = { board, d, mode: "rule", concluding: false };
  for (const [kind, c] of d.clueKinds) {
    const part = board.regions.get(c.at);
    const places =
      c.at === "edge"
        ? board.sp.edgeEnds.length / 2
        : c.at === "slot"
          ? board.sp.slots.length
          : c.at === "corner"
            ? board.sp.corners.length
            : part !== undefined
              ? part.parts.length
              : null;
    if (places === null)
      throw new Error(
        `clue ${kind}: only edge, slot, corner and region clues are checked yet`,
      );
    const complete = d.json.clues?.[kind]?.complete === true;
    const list: ClueSym[] = [];
    for (let e = 0; e < places; e++) {
      const here = new Map([["at", elem(placeSort(board, c.at), e)]]);
      // A range of numbers is read as its bounds, which a value set of the
      // board's own size could not hold: a cage's sum runs past the order.
      if (c.value.k === "call" && c.value.fn === "range" && !complete) {
        const [lo, hi] = c.value.args.map((a) => num(evaluate(a, here, ctx), "range"));
        const v = Z3.Int.const(`clue_${kind}_${e}_v_${boardCount}`);
        const present = Z3.Bool.const(`clue_${kind}_${e}_${boardCount}`);
        board.clueDomain.push(and(cmp(">=", v, lo), cmp("<=", v, hi)));
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

/** The rules, the answer's domain, and marks consistent with the answer. */
function worldOf(d: Description, board: Board): Bx[] {
  const ctx: Ctx = { board, d, mode: "rule", concluding: false };
  const out: Bx[] = [...board.clueDomain];
  const dom = evaluate(d.domain, new Map(), ctx);
  if (dom.k !== "vset")
    throw new TypeError("the answer's domain is not a set of values");
  board.ans.forEach((a, c) => {
    out.push(or(...dom.mem.map((g, n) => and(g, a.eq(n)))));
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
  for (const r of d.rules) out.push(bool(evaluate(r.expr, new Map(), ctx), r.name));
  for (const [kind, c] of d.clueKinds)
    for (const k of board.clues.get(kind) ?? [])
      out.push(
        implies(
          k.present,
          bool(
            evaluate(
              c.means,
              new Map([
                ["at", elem(placeSort(board, c.at), k.at)],
                ["v", k.v],
              ]),
              ctx,
            ),
            `clue ${kind}`,
          ),
        ),
      );
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
): Promise<string[]> {
  const board = makeBoard(order);
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

/** Check one technique sound against `d`'s rules on an `order` board. */
export async function checkTechnique(
  d: Description,
  t: Technique,
  order: number,
  split = 1,
): Promise<Verdict> {
  const t0 = performance.now();
  const board = makeBoard(order);
  dealPartitions(d, board);
  dealSymbolically(d, board);
  const world = worldOf(d, board);
  const ctx: Ctx = { board, d, mode: "technique", concluding: false };
  const solver = new Z3.Solver();
  for (const w of world) solver.add(asZ3(w));
  // The first `split` binders concrete, one query each; the rest one
  // disjunction of every binding's premise without its conclusion.
  const groups = new Map<string, Bx[]>();
  bindings(t.binders, 0, new Map(), true, ctx, (env, g) => {
    const premise =
      t.premise === null ? true : bool(evaluate(t.premise, env, ctx), "premise");
    const concl = bool(
      evaluate(t.conclude, env, { ...ctx, concluding: true }),
      "conclusion",
    );
    const key = t.binders
      .slice(0, split)
      .map((b) => show(env.get(b.name) ?? null))
      .join(" ");
    const list = groups.get(key) ?? [];
    list.push(and(g, premise, not(concl)));
    groups.set(key, list);
  });
  let queries = 0;
  for (const [key, parts] of groups) {
    const bad = or(...parts);
    if (bad === false) continue;
    queries++;
    solver.push();
    solver.add(asZ3(bad));
    const r = await solver.check();
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
 * the library's own, whose only rule is that no value repeats in a line. */
export function libraryDescription(lib: LibraryJson): {
  d: Description;
  techniques: Technique[];
} {
  const json: DescriptionJson = {
    game: lib.library,
    name: lib.library,
    family: lib.library,
    sizes: { order: { min: 3, max: 16 } },
    space: { grid: { w: "order", h: "order" }, edges: true, units: ["rows", "cols"] },
    answer: { value: { sort: "cell", domain: "range(1, order)" } },
    shape: ["latin(value, lines)"],
    freedom: { kind: "fill" },
    tiers: ["any"],
  };
  const d = loadDescription(json);
  const techniques = Object.entries(lib.techniques).map(
    ([id, stated]): Technique => ({
      ...parseTechnique(lib.library, id, stated),
      tier: 0,
      until: null,
      rungs: [],
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
