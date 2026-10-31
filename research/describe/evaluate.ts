/**
 * The meaning of a formula on one instance: `language.md` § "Expressions",
 * evaluated over a finite board.
 *
 * A board may be partial. Reading the answer of a cell with no value either
 * yields `none` (a technique reads the marks, and asks `known(c)` first) or
 * throws {@link Unknown}, which {@link satisfiable} catches to try each value
 * the cell may take.
 */

import type { Definition } from "../../src/describe/description.ts";
import type { Binder, Expr } from "../../src/describe/expr.ts";
import {
  asElem,
  asNum,
  asSet,
  type Elem,
  isElem,
  member,
  type Space,
  same,
  show,
  type Value,
} from "./space.ts";

/** A board as formulas read it: the answer so far and the marks. */
export interface Board {
  value(c: Elem): number | null;
  /** The candidates the marks leave; a cell with a value has just it. */
  cand(c: Elem): number[];
}

export class Unknown extends Error {
  constructor(readonly cell: Elem) {
    super(`unknown ${cell.label}`);
  }
}

/** A dealt clue: its kind, where it sits and its value. */
export interface Clue {
  kind: string;
  at: Value;
  v: Value;
}

export interface Ctx {
  space: Space;
  defs: Map<string, Definition>;
  clues: Map<string, Elem[]>;
  clueOf: Map<Elem, Clue>;
  board: Board;
  /** Whether reading an unknown value throws {@link Unknown}. */
  strict: boolean;
  /** Collects a conclusion's facts, when one is being evaluated. */
  facts?: Fact[];
}

export type Fact = { k: "strike" | "place"; cell: Elem; d: number };

type Env = ReadonlyMap<string, Value>;

function truth(v: Value, what: string): boolean {
  if (typeof v !== "boolean")
    throw new TypeError(`${what}: expected a truth, got ${show(v)}`);
  return v;
}

/** Every binding of `bs`, in order, each passed to `visit`; `visit` returns
 * `false` to stop early, and so does this. */
export function bindings(
  bs: readonly Binder[],
  env: Env,
  ctx: Ctx,
  visit: (env: Env) => boolean,
  from = 0,
): boolean {
  if (from === bs.length) return visit(env);
  const b = bs[from];
  const next = (v: Value): boolean => {
    const inner = new Map(env);
    inner.set(b.name, v);
    if (b.where !== null && !truth(evaluate(b.where, inner, ctx), `where of ${b.name}`))
      return true;
    return bindings(bs, inner, ctx, visit, from + 1);
  };
  if (b.kind === "let") return next(evaluate(b.of, env, ctx));
  for (const v of asSet(evaluate(b.of, env, ctx), `the set of ${b.name}`))
    if (!next(v)) return false;
  return true;
}

export function evaluate(e: Expr, env: Env, ctx: Ctx): Value {
  switch (e.k) {
    case "num":
      return e.v;
    case "name": {
      const v = env.get(e.name);
      if (v !== undefined) return v;
      if (e.name === "true") return true;
      if (e.name === "false") return false;
      if (e.name === "none") return null;
      const s = ctx.space.names.get(e.name);
      if (s !== undefined) return s;
      const def = ctx.defs.get(e.name);
      if (def !== undefined && def.params.length === 0)
        return evaluate(def.body, new Map(), ctx);
      throw new ReferenceError(`unknown name "${e.name}"`);
    }
    case "set": {
      const out: Value[] = [];
      for (const x of e.elems) {
        const v = evaluate(x, env, ctx);
        if (!member(v, out)) out.push(v);
      }
      return out;
    }
    case "size":
      return asSet(evaluate(e.of, env, ctx), "|…|").length;
    case "not":
      return !truth(evaluate(e.of, env, ctx), "not");
    case "neg":
      return -asNum(evaluate(e.of, env, ctx), "-");
    case "bin":
      return binary(e.op, e.a, e.b, env, ctx);
    case "quant": {
      const want = e.q === "forall";
      let result = want;
      bindings(e.binders, env, ctx, (inner) => {
        if (truth(evaluate(e.body, inner, ctx), e.q) !== want) {
          result = !want;
          return false;
        }
        return true;
      });
      return result;
    }
    case "agg":
      return aggregate(e, env, ctx);
    case "call":
      return call(e.fn, e.args, env, ctx);
  }
}

function binary(op: string, ea: Expr, eb: Expr, env: Env, ctx: Ctx): Value {
  // The connectives short-circuit, so a premise can guard what it reads.
  if (op === "and")
    return truth(evaluate(ea, env, ctx), "and") && truth(evaluate(eb, env, ctx), "and");
  if (op === "or")
    return truth(evaluate(ea, env, ctx), "or") || truth(evaluate(eb, env, ctx), "or");
  if (op === "implies")
    return (
      !truth(evaluate(ea, env, ctx), "implies") ||
      truth(evaluate(eb, env, ctx), "implies")
    );
  const a = evaluate(ea, env, ctx);
  const b = evaluate(eb, env, ctx);
  switch (op) {
    case "iff":
      return truth(a, "iff") === truth(b, "iff");
    case "=":
      return same(a, b);
    case "!=":
      return !same(a, b);
    case "<":
      return asNum(a, "<") < asNum(b, "<");
    case "<=":
      return asNum(a, "<=") <= asNum(b, "<=");
    case ">":
      return asNum(a, ">") > asNum(b, ">");
    case ">=":
      return asNum(a, ">=") >= asNum(b, ">=");
    case "in":
      return member(a, asSet(b, "in"));
    case "notin":
      return !member(a, asSet(b, "not in"));
    case "subset": {
      const bs = asSet(b, "subset");
      return asSet(a, "subset").every((x) => member(x, bs));
    }
    case "+":
      if (Array.isArray(a))
        return [...a, ...asSet(b, "+").filter((x) => !member(x, a))];
      return asNum(a, "+") + asNum(b, "+");
    case "-":
      if (Array.isArray(a)) {
        const bs = asSet(b, "-");
        return a.filter((x) => !member(x, bs));
      }
      return asNum(a, "-") - asNum(b, "-");
    case "*":
      return asNum(a, "*") * asNum(b, "*");
    case "/":
      return Math.trunc(asNum(a, "/") / asNum(b, "/"));
    case "mod":
      return asNum(a, "mod") % asNum(b, "mod");
  }
  throw new Error(`no operator ${op}`);
}

function aggregate(e: Extract<Expr, { k: "agg" }>, env: Env, ctx: Ctx): Value {
  const term = (inner: Env): Value => {
    if (e.term !== null) return evaluate(e.term, inner, ctx);
    const last = e.binders[e.binders.length - 1];
    return inner.get(last.name) ?? null;
  };
  switch (e.fn) {
    case "count": {
      let n = 0;
      bindings(e.binders, env, ctx, () => {
        n++;
        return true;
      });
      return n;
    }
    case "sum":
    case "prod": {
      let acc = e.fn === "sum" ? 0 : 1;
      bindings(e.binders, env, ctx, (inner) => {
        const t = asNum(term(inner), e.fn);
        acc = e.fn === "sum" ? acc + t : acc * t;
        return true;
      });
      return acc;
    }
    case "min":
    case "max": {
      let acc: number | null = null;
      bindings(e.binders, env, ctx, (inner) => {
        const t = asNum(term(inner), e.fn);
        acc = acc === null ? t : e.fn === "min" ? Math.min(acc, t) : Math.max(acc, t);
        return true;
      });
      return acc;
    }
    case "distinct": {
      const seen: Value[] = [];
      let ok = true;
      bindings(e.binders, env, ctx, (inner) => {
        const t = term(inner);
        if (member(t, seen)) {
          ok = false;
          return false;
        }
        seen.push(t);
        return true;
      });
      return ok;
    }
    case "set": {
      const out: Value[] = [];
      bindings(e.binders, env, ctx, (inner) => {
        const t = term(inner);
        if (!member(t, out)) out.push(t);
        return true;
      });
      return out;
    }
    case "the": {
      const out: Value[] = [];
      bindings(e.binders, env, ctx, (inner) => {
        out.push(term(inner));
        return out.length < 2;
      });
      return out.length === 1 ? out[0] : null;
    }
  }
}

function range(a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

/** The subsets of `s` (of size `k`, if given), counted in binary with `s`'s
 * last member as the lowest bit, as the compiler enumerates them. */
function subsets(s: Value[], k: number | null): Value[][] {
  const out: Value[][] = [];
  for (let m = 0; m < 1 << s.length; m++) {
    const sub = s.filter((_, i) => (m >> (s.length - 1 - i)) & 1);
    if (k === null || sub.length === k) out.push(sub);
  }
  return out;
}

function call(fn: string, args: readonly Expr[], env: Env, ctx: Ctx): Value {
  const arg = (i: number): Value => evaluate(args[i], env, ctx);
  switch (fn) {
    case "value": {
      const c = asElem(arg(0), "value");
      const v = ctx.board.value(c);
      if (v === null && ctx.strict) throw new Unknown(c);
      return v;
    }
    case "known":
      return ctx.board.value(asElem(arg(0), "known")) !== null;
    case "cand":
      return ctx.board.cand(asElem(arg(0), "cand"));
    case "range":
      return range(asNum(arg(0), "range"), asNum(arg(1), "range"));
    case "abs":
      return Math.abs(asNum(arg(0), "abs"));
    case "index": {
      const x = arg(0);
      return asSet(arg(1), "index").findIndex((y) => same(x, y));
    }
    case "subsets":
      return subsets(
        asSet(arg(0), "subsets"),
        args.length > 1 ? asNum(arg(1), "subsets") : null,
      );
    case "before": {
      // The elements of an ordered set ahead of one of them.
      const x = arg(0);
      const L = asSet(arg(1), "before");
      const i = L.findIndex((y) => same(x, y));
      return i < 0 ? [] : L.slice(0, i);
    }
    case "first":
      return asSet(arg(0), "first")[0] ?? null;
    case "nth":
      return asSet(arg(0), "nth")[asNum(arg(1), "nth")] ?? null;
    case "clues":
      return ctx.clues.get(asName(args[0])) ?? [];
    case "at":
    case "v": {
      const k = ctx.clueOf.get(asElem(arg(0), fn));
      if (k === undefined) throw new TypeError(`${fn}: not a clue`);
      return fn === "at" ? k.at : k.v;
    }
    case "clue": {
      // The clue of a kind at an element, or none.
      const kind = asName(args[0]);
      const x = arg(1);
      const k = (ctx.clues.get(kind) ?? []).find((c) =>
        same(ctx.clueOf.get(c)?.at ?? null, x),
      );
      return k === undefined ? null : (ctx.clueOf.get(k)?.v ?? null);
    }
    case "latin": {
      // `latin(f, U)`: no value of `f` more than `times` of it in any unit of
      // `U`, once but for a repeated value; a full unit then holds each
      // exactly that often. The solver recognizes the call and propagates it
      // natively.
      const f = asName(args[0]);
      const times = ctx.space.fns.get("times");
      for (const u of asSet(arg(1), "latin")) {
        const seen: Value[] = [];
        for (const c of asSet(ctx.space.fns.get("cells")?.([u]) ?? null, "latin")) {
          const v = call(f, [{ k: "name", name: "$c" }], new Map([["$c", c]]), ctx);
          const most = times === undefined ? 1 : asNum(times([v]), "times");
          if (seen.filter((s) => same(s, v)).length >= most) return false;
          seen.push(v);
        }
      }
      return true;
    }
    case "strike":
    case "place": {
      if (ctx.facts === undefined) throw new TypeError(`${fn} outside a conclusion`);
      ctx.facts.push({ k: fn, cell: asElem(arg(0), fn), d: asNum(arg(1), fn) });
      return true;
    }
  }
  const lib = ctx.space.fns.get(fn);
  if (lib !== undefined) return lib(args.map((_, i) => arg(i)));
  const def = ctx.defs.get(fn);
  if (def !== undefined) {
    if (def.params.length !== args.length)
      throw new TypeError(`${fn} takes ${def.params.length}`);
    const inner = new Map<string, Value>();
    def.params.forEach((p, i) => {
      inner.set(p, arg(i));
    });
    return evaluate(def.body, inner, ctx);
  }
  throw new ReferenceError(`unknown function "${fn}"`);
}

function asName(e: Expr): string {
  if (e.k !== "name") throw new TypeError("expected a name");
  return e.name;
}

/** The outcome of {@link satisfiable} when it ran out of tries. */
export const UNDECIDED = "undecided";

/**
 * Whether some value for each unknown cell the formula reads, from `domain`,
 * makes it true: the formula's cells are tried one by one, as evaluation
 * reaches each, so a formula that fails early is refused early. `domain` is
 * told the values tried so far, so it can keep them apart where the rules do.
 */
export function satisfiable(
  e: Expr,
  env: Env,
  ctx: Ctx,
  domain: (c: Elem, tried: ReadonlyMap<Elem, number>) => number[],
  budget = 20_000,
): boolean | typeof UNDECIDED {
  const extra = new Map<Elem, number>();
  const base = ctx.board;
  const board: Board = {
    value: (c) => extra.get(c) ?? base.value(c),
    cand: (c) => {
      const v = extra.get(c);
      return v === undefined ? base.cand(c) : [v];
    },
  };
  const inner: Ctx = { ...ctx, board, strict: true };
  let tries = 0;
  const search = (): boolean | typeof UNDECIDED => {
    if (++tries > budget) return UNDECIDED;
    try {
      return truth(evaluate(e, env, inner), "a rule");
    } catch (err) {
      if (!(err instanceof Unknown)) throw err;
      let undecided = false;
      for (const v of domain(err.cell, extra)) {
        extra.set(err.cell, v);
        const r = search();
        extra.delete(err.cell);
        if (r === true) return true;
        if (r === UNDECIDED) undecided = true;
      }
      return undecided ? UNDECIDED : false;
    }
  };
  return search();
}

export { isElem };
