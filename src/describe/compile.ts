/**
 * The compiler from a description's techniques to TypeScript
 * (`openspec/changes/compile-the-latin-ladder/design.md`): each technique
 * becomes a function over `engine/describe-runtime.ts`'s marks and grid that enumerates its
 * bindings in the order its binders are written, and fires the first whose
 * conclusion changes the marks.
 *
 * Every term is given a sort before any code is written, and the sort decides
 * the representation: a number, a truth, an element as its index, a set of
 * values as a bitmask, a set of elements as an ordered array. A formula that
 * reads a name or calls a function the grid does not have, or mixes sorts,
 * is refused here, so a description that compiles is well-sorted.
 */

import {
  type Definition,
  type DescriptionJson,
  type LibraryJson,
  loadDescription,
  parseTechnique,
  type Technique,
} from "./description.ts";
import type { Binder, Expr } from "./expr.ts";

type ElemSort = "cell" | "line" | "edge" | `clue ${string}`;

type Sort =
  | { k: "num" }
  | { k: "bool" }
  | { k: "none" }
  | { k: "elem"; e: ElemSort }
  | { k: "set"; of: Sort }
  | { k: "subsets"; of: Sort }
  | { k: "clues"; kind: string };

const NUM: Sort = { k: "num" };
const BOOL: Sort = { k: "bool" };
const elem = (e: ElemSort): Sort => ({ k: "elem", e });
const setOf = (of: Sort): Sort => ({ k: "set", of });

/** A compiled term: TypeScript that computes it, once its statements have run. */
interface Val {
  code: string;
  sort: Sort;
}

function show(s: Sort): string {
  switch (s.k) {
    case "elem":
      return s.e;
    case "set":
      return `set of ${show(s.of)}`;
    case "subsets":
      return `subsets of ${show(s.of)}`;
    case "clues":
      return `clues(${s.kind})`;
    default:
      return s.k;
  }
}

/** A set of values is a bitmask; any other set an array. */
const isMask = (s: Sort): boolean => s.k === "set" && s.of.k === "num";
const isArray = (s: Sort): boolean => s.k === "set" && s.of.k !== "num";
const scalar = (s: Sort): boolean => s.k === "num" || s.k === "elem" || s.k === "none";

function tsType(s: Sort): string {
  if (s.k === "bool") return "boolean";
  if (isArray(s)) return "readonly number[]";
  return "number";
}

class CompileError extends Error {}

/** The code being written: statements at an indent, and fresh names. */
class Out {
  readonly lines: string[] = [];
  private depth: number;
  private static n = 0;
  constructor(depth: number) {
    this.depth = depth;
  }
  emit(line: string): void {
    this.lines.push(`${"  ".repeat(this.depth)}${line}`);
  }
  open(line: string): void {
    this.emit(line);
    this.depth++;
  }
  close(line = "}"): void {
    this.depth--;
    this.emit(line);
  }
  static fresh(prefix: string): string {
    return `${prefix}${++Out.n}`;
  }
  static reset(): void {
    Out.n = 0;
  }
}

interface ClueKind {
  at: Sort;
  v: Sort;
}

interface Env {
  defs: ReadonlyMap<string, Definition>;
  clues: ReadonlyMap<string, ClueKind>;
  /** The runtime helpers the code calls, to import. */
  used: Set<string>;
  /** The declarations of the arrays a technique's comprehensions reuse, made
   * once a call; `null` outside a technique's body. */
  scratch: string[] | null;
  /** Whether `strike` and `place` may be called: in a conclusion only. */
  concluding: boolean;
  /** Whether the function keeps each cell's candidates as it first reads
   * them (`cands`), until a firing it goes on from changes the marks. */
  memo: boolean;
  /** Whether the code reads the clues, so the function takes them. */
  readsClues: { yes: boolean };
}

type Scope = ReadonlyMap<string, Val>;

const NAMES: Record<string, Val> = {
  cells: { code: "sp.cells", sort: setOf(elem("cell")) },
  rows: { code: "sp.rows", sort: setOf(elem("line")) },
  cols: { code: "sp.cols", sort: setOf(elem("line")) },
  lines: { code: "sp.lines", sort: setOf(elem("line")) },
  units: { code: "sp.units", sort: setOf(elem("line")) },
  domain: { code: "b.domain", sort: setOf(NUM) },
  true: { code: "true", sort: BOOL },
  false: { code: "false", sort: BOOL },
  none: { code: "-1", sort: { k: "none" } },
};

function expect(v: Val, k: Sort["k"], what: string): void {
  if (v.sort.k !== k)
    throw new CompileError(`${what}: expected ${k}, got ${show(v.sort)}`);
}

function expectElem(v: Val, e: ElemSort, what: string): void {
  if (!(v.sort.k === "elem" && v.sort.e === e) && v.sort.k !== "none")
    throw new CompileError(`${what}: expected a ${e}, got ${show(v.sort)}`);
}

/** Bind a value to a const when it will be read more than once. */
function once(v: Val, out: Out): Val {
  if (/^[A-Za-z_$][\w$]*$/.test(v.code) || /^-?\d+$/.test(v.code)) return v;
  const t = Out.fresh("_t");
  out.emit(`const ${t} = ${v.code};`);
  return { code: t, sort: v.sort };
}

function sameSort(a: Sort, b: Sort): boolean {
  if (a.k === "none" || b.k === "none") return scalar(a) && scalar(b);
  if (a.k !== b.k) return false;
  if (a.k === "elem" && b.k === "elem") return a.e === b.e;
  if (a.k === "set" && b.k === "set") return sameSort(a.of, b.of);
  return true;
}

/** A cell's candidates through the function's `cands`, read once a cell. */
const candOf = (c: string): string =>
  `(cands[${c}] >= 0 ? cands[${c}] : (cands[${c}] = b.cand(${c})))`;

function compileExpr(e: Expr, scope: Scope, env: Env, out: Out): Val {
  switch (e.k) {
    case "num":
      return { code: String(e.v), sort: NUM };
    case "name":
      return name(e.name, scope, env, out);
    case "set":
      return setLiteral(e.elems, scope, env, out);
    case "size": {
      const s = compileExpr(e.of, scope, env, out);
      if (isMask(s.sort)) {
        env.used.add("popcount");
        return { code: `popcount(${s.code})`, sort: NUM };
      }
      if (isArray(s.sort)) return { code: `${s.code}.length`, sort: NUM };
      throw new CompileError(`|…| of ${show(s.sort)}`);
    }
    case "not": {
      const v = compileExpr(e.of, scope, env, out);
      expect(v, "bool", "not");
      return { code: `!(${v.code})`, sort: BOOL };
    }
    case "neg": {
      const v = compileExpr(e.of, scope, env, out);
      expect(v, "num", "-");
      return { code: `-(${v.code})`, sort: NUM };
    }
    case "bin":
      return binary(e, scope, env, out);
    case "quant":
      return quantifier(e, scope, env, out);
    case "agg":
      return aggregate(e, scope, env, out);
    case "call":
      return call(e.fn, e.args, scope, env, out);
  }
}

function name(n: string, scope: Scope, env: Env, out: Out): Val {
  const bound = scope.get(n);
  if (bound !== undefined) return bound;
  const known = NAMES[n];
  if (known !== undefined) return known;
  if (n === "order" || n === "w") return { code: "sp.w", sort: NUM };
  if (n === "h") return { code: "sp.h", sort: NUM };
  const def = env.defs.get(n);
  if (def !== undefined && def.params.length === 0)
    return compileExpr(def.body, new Map(), env, out);
  throw new CompileError(`unknown name "${n}"`);
}

function setLiteral(elems: readonly Expr[], scope: Scope, env: Env, out: Out): Val {
  if (elems.length === 0)
    throw new CompileError("{} has no sort; write a comprehension");
  const vs = elems.map((x) => compileExpr(x, scope, env, out));
  const sort = vs[0].sort;
  if (!vs.every((v) => sameSort(v.sort, sort)))
    throw new CompileError(
      `a set of mixed sorts: ${vs.map((v) => show(v.sort)).join(", ")}`,
    );
  if (sort.k === "num")
    return {
      code: `(${vs.map((v) => `(1 << ${v.code})`).join(" | ")})`,
      sort: setOf(NUM),
    };
  if (sort.k !== "elem") throw new CompileError(`a set of ${show(sort)}`);
  env.used.add("setOf");
  return { code: `setOf(${vs.map((v) => v.code).join(", ")})`, sort: setOf(sort) };
}

/** A connective whose right side may need statements: they run only where
 * the left side leaves the answer open, so a premise can guard what it reads. */
function shortCircuit(
  op: "and" | "or" | "implies",
  a: Expr,
  b: Expr,
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  const va = compileExpr(a, scope, env, out);
  expect(va, "bool", op);
  const inner = new Out(0);
  const vb = compileExpr(b, scope, env, inner);
  expect(vb, "bool", op);
  const left = op === "implies" ? `!(${va.code})` : va.code;
  if (inner.lines.length === 0)
    return { code: `(${left} ${op === "and" ? "&&" : "||"} ${vb.code})`, sort: BOOL };
  const r = Out.fresh("_c");
  out.emit(`let ${r} = ${left};`);
  out.open(op === "and" ? `if (${r}) {` : `if (!${r}) {`);
  for (const line of inner.lines) out.emit(line);
  out.emit(`${r} = ${vb.code};`);
  out.close();
  return { code: r, sort: BOOL };
}

function binary(e: Extract<Expr, { k: "bin" }>, scope: Scope, env: Env, out: Out): Val {
  const { op } = e;
  if (op === "and" || op === "or" || op === "implies")
    return shortCircuit(op, e.a, e.b, scope, env, out);
  // `d in cand(c)` reads one place of the cube, which is cheaper than any
  // kept mask: a mask is kept for what reads the whole of it.
  if ((op === "in" || op === "notin") && e.b.k === "call" && e.b.fn === "cand") {
    const d = compileExpr(e.a, scope, env, out);
    expect(d, "num", op);
    const c = compileExpr(e.b.args[0], scope, env, out);
    expectElem(c, "cell", "cand");
    const has = `b.has(${c.code}, ${d.code})`;
    return { code: op === "in" ? has : `!${has}`, sort: BOOL };
  }
  const a = compileExpr(e.a, scope, env, out);
  const b = compileExpr(e.b, scope, env, out);
  switch (op) {
    case "iff":
      expect(a, "bool", op);
      expect(b, "bool", op);
      return { code: `(${a.code} === ${b.code})`, sort: BOOL };
    case "=":
    case "!=": {
      if (!sameSort(a.sort, b.sort))
        throw new CompileError(`${show(a.sort)} ${op} ${show(b.sort)}`);
      if (isArray(a.sort)) {
        env.used.add("sameSet");
        const eq = `sameSet(${a.code}, ${b.code})`;
        return { code: op === "=" ? eq : `!${eq}`, sort: BOOL };
      }
      return {
        code: `(${a.code} ${op === "=" ? "===" : "!=="} ${b.code})`,
        sort: BOOL,
      };
    }
    case "<":
    case "<=":
    case ">":
    case ">=":
      expect(a, "num", op);
      expect(b, "num", op);
      return { code: `(${a.code} ${op} ${b.code})`, sort: BOOL };
    case "in":
    case "notin": {
      if (b.sort.k !== "set" || !sameSort(a.sort, b.sort.of))
        throw new CompileError(`${show(a.sort)} in ${show(b.sort)}`);
      const has = isMask(b.sort)
        ? `((${b.code} >> ${a.code}) & 1) !== 0`
        : `${b.code}.includes(${a.code})`;
      return { code: op === "in" ? `(${has})` : `!(${has})`, sort: BOOL };
    }
    case "subset":
      if (!sameSort(a.sort, b.sort) || a.sort.k !== "set")
        throw new CompileError(`${show(a.sort)} subset ${show(b.sort)}`);
      if (isMask(a.sort))
        return { code: `((${a.code} & ~${b.code}) === 0)`, sort: BOOL };
      env.used.add("subsetOf");
      return { code: `subsetOf(${a.code}, ${b.code})`, sort: BOOL };
    case "+":
    case "-":
      if (a.sort.k === "num") {
        expect(b, "num", op);
        return { code: `(${a.code} ${op} ${b.code})`, sort: NUM };
      }
      if (!sameSort(a.sort, b.sort) || a.sort.k !== "set")
        throw new CompileError(`${show(a.sort)} ${op} ${show(b.sort)}`);
      if (isMask(a.sort))
        return {
          code: op === "+" ? `(${a.code} | ${b.code})` : `(${a.code} & ~${b.code})`,
          sort: a.sort,
        };
      env.used.add(op === "+" ? "union" : "minus");
      return {
        code: `${op === "+" ? "union" : "minus"}(${a.code}, ${b.code})`,
        sort: a.sort,
      };
    case "*":
    case "/":
    case "mod":
      expect(a, "num", op);
      expect(b, "num", op);
      if (op === "*") return { code: `(${a.code} * ${b.code})`, sort: NUM };
      if (op === "/") return { code: `Math.trunc(${a.code} / ${b.code})`, sort: NUM };
      return { code: `(${a.code} % ${b.code})`, sort: NUM };
  }
}

/**
 * Write the loops of `binders`, each binding's statements written by `body`
 * inside them. A binding a `where` refuses is skipped: `continue` inside a
 * loop, and leaving a labeled block for a name bound by `=`.
 */
function bindingLoops(
  binders: readonly Binder[],
  scope: Scope,
  env: Env,
  out: Out,
  body: (scope: Scope) => void,
): void {
  const walk = (i: number, sc: Scope): void => {
    if (i === binders.length) {
      body(sc);
      return;
    }
    const bnd = binders[i];
    const v = `v_${bnd.name}`;
    let closeBlock = false;
    let skip = "continue";
    let sort: Sort;
    if (bnd.kind === "let") {
      const t = compileExpr(bnd.of, sc, env, out);
      sort = t.sort;
      if (bnd.where !== null) {
        const label = Out.fresh("L");
        out.open(`${label}: {`);
        closeBlock = true;
        skip = `break ${label}`;
      }
      out.emit(`const ${v} = ${t.code};`);
    } else if (bnd.of.k === "call" && bnd.of.fn === "clues") {
      const kind = clueKindArg(bnd.of.args, env);
      env.readsClues.yes = true;
      sort = elem(`clue ${kind}`);
      out.open(`for (let ${v} = 0; ${v} < cl.${kind}.at.length; ${v}++) {`);
    } else {
      const s = compileExpr(bnd.of, sc, env, out);
      if (s.sort.k === "subsets") {
        const of = s.sort.of;
        sort = of;
        const els = Out.fresh("_e");
        const k = Out.fresh("_k");
        const j = Out.fresh("_j");
        if (isMask(of)) {
          env.used.add("valuesOf");
          out.emit(`const ${els} = valuesOf(${s.code});`);
        } else out.emit(`const ${els} = ${s.code};`);
        // Counted in binary with the set's last member as the lowest bit, so
        // the subsets of {1, 2, 3} come as {3}, {2}, {2, 3}, {1}, ...
        out.open(`for (let ${k} = 0; ${k} < 1 << ${els}.length; ${k}++) {`);
        if (isMask(of)) {
          out.emit(`let ${v} = 0;`);
          out.emit(
            `for (let ${j} = 0; ${j} < ${els}.length; ${j}++) if ((${k} >> (${els}.length - 1 - ${j})) & 1) ${v} |= 1 << ${els}[${j}];`,
          );
        } else {
          out.emit(`const ${v}: number[] = [];`);
          out.emit(
            `for (let ${j} = 0; ${j} < ${els}.length; ${j}++) if ((${k} >> (${els}.length - 1 - ${j})) & 1) ${v}.push(${els}[${j}]);`,
          );
        }
      } else if (isMask(s.sort)) {
        sort = NUM;
        const m = Out.fresh("_m");
        out.open(`for (let ${m} = ${s.code}; ${m} !== 0; ${m} &= ${m} - 1) {`);
        out.emit(`const ${v} = 31 - Math.clz32(${m} & -${m});`);
      } else if (isArray(s.sort) && s.sort.k === "set") {
        sort = s.sort.of;
        const a = Out.fresh("_a");
        const ix = Out.fresh("_i");
        out.emit(`const ${a} = ${s.code};`);
        out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
        out.emit(`const ${v} = ${a}[${ix}];`);
      } else throw new CompileError(`${bnd.name} in ${show(s.sort)}: not a set`);
    }
    const inner = new Map(sc);
    inner.set(bnd.name, { code: v, sort });
    if (bnd.where !== null) {
      const w = compileExpr(bnd.where, inner, env, out);
      expect(w, "bool", `where of ${bnd.name}`);
      out.emit(`if (!(${w.code})) ${skip};`);
    }
    walk(i + 1, inner);
    if (bnd.kind === "in" || closeBlock) out.close();
  };
  walk(0, scope);
}

function clueKindArg(args: readonly Expr[], env: Env): string {
  const a = args[0];
  if (args.length !== 1 || a.k !== "name" || !env.clues.has(a.name))
    throw new CompileError("clues(kind) names a clue kind of the description");
  return a.name;
}

/** Whether `name` is read anywhere in `e`. */
function reads(e: Expr, name: string): boolean {
  switch (e.k) {
    case "num":
      return false;
    case "name":
      return e.name === name;
    case "set":
      return e.elems.some((x) => reads(x, name));
    case "size":
    case "not":
    case "neg":
      return reads(e.of, name);
    case "bin":
      return reads(e.a, name) || reads(e.b, name);
    case "call":
      return e.args.some((x) => reads(x, name));
    case "quant":
    case "agg":
      return (
        e.binders.some(
          (b) => reads(b.of, name) || (b.where !== null && reads(b.where, name)),
        ) ||
        (e.k === "quant"
          ? reads(e.body, name)
          : e.term !== null && reads(e.term, name)) ||
        (e.k === "agg" && e.where !== null && reads(e.where, name))
      );
  }
}

/**
 * `exists d in S: d in T` and `forall d in S: d in T` (or `not in`), where
 * both are sets of values, as the bitwise test it is: one AND, not a loop
 * over `S`'s members. `null` where the quantifier has another shape.
 */
function setQuantifier(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  const [b, ...more] = e.binders;
  const body = e.body;
  if (b === undefined || more.length > 0 || b.kind !== "in" || b.where !== null)
    return null;
  if (body.k !== "bin" || (body.op !== "in" && body.op !== "notin")) return null;
  if (body.a.k !== "name" || body.a.name !== b.name || reads(body.b, b.name))
    return null;
  const probe: Env = { ...env, used: new Set(), scratch: null };
  if (!isMask(compileExpr(b.of, scope, probe, new Out(0)).sort)) return null;
  if (!isMask(compileExpr(body.b, scope, probe, new Out(0)).sort)) return null;
  const s = compileExpr(b.of, scope, env, out);
  const t = compileExpr(body.b, scope, env, out);
  // The members of S that the body holds of: in T, or outside it.
  const hit = body.op === "in" ? `(${s.code} & ${t.code})` : `(${s.code} & ~${t.code})`;
  const miss =
    body.op === "in" ? `(${s.code} & ~${t.code})` : `(${s.code} & ${t.code})`;
  return {
    code: e.q === "exists" ? `(${hit} !== 0)` : `(${miss} === 0)`,
    sort: BOOL,
  };
}

function quantifier(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  const forall = e.q === "forall";
  const masked = setQuantifier(e, scope, env, out);
  if (masked !== null) return masked;
  const r = Out.fresh("_q");
  const label = Out.fresh("Q");
  out.emit(`let ${r} = ${forall};`);
  out.open(`${label}: {`);
  bindingLoops(e.binders, scope, env, out, (sc) => {
    const v = compileExpr(e.body, sc, env, out);
    expect(v, "bool", e.q);
    out.open(`if (${forall ? `!(${v.code})` : v.code}) {`);
    out.emit(`${r} = ${!forall};`);
    out.emit(`break ${label};`);
    out.close();
  });
  out.close();
  return { code: r, sort: BOOL };
}

function aggregate(
  e: Extract<Expr, { k: "agg" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  const r = Out.fresh("_g");
  const label = Out.fresh("G");
  const last = e.binders[e.binders.length - 1];
  const term = (sc: Scope): Val =>
    e.term === null ? name(last.name, sc, env, out) : compileExpr(e.term, sc, env, out);
  let sort: Sort = NUM;
  const loops = (body: (sc: Scope) => void): void => {
    out.open(`${label}: {`);
    bindingLoops(e.binders, scope, env, out, body);
    out.close();
  };
  switch (e.fn) {
    case "count":
      out.emit(`let ${r} = 0;`);
      loops(() => out.emit(`${r}++;`));
      break;
    case "sum":
    case "prod":
      out.emit(`let ${r} = ${e.fn === "sum" ? 0 : 1};`);
      loops((sc) => {
        const t = term(sc);
        expect(t, "num", e.fn);
        out.emit(`${r} ${e.fn === "sum" ? "+=" : "*="} ${t.code};`);
      });
      break;
    case "min":
    case "max":
      // `-1` is none, below every value, so the first term always replaces it.
      out.emit(`let ${r} = -1;`);
      loops((sc) => {
        const t = once(term(sc), out);
        expect(t, "num", e.fn);
        out.emit(
          `if (${r} === -1 || ${t.code} ${e.fn === "min" ? "<" : ">"} ${r}) ${r} = ${t.code};`,
        );
      });
      break;
    case "the": {
      const n = Out.fresh("_n");
      out.emit(`let ${r} = -1;`);
      out.emit(`let ${n} = 0;`);
      loops((sc) => {
        const t = term(sc);
        if (!scalar(t.sort)) throw new CompileError(`the(…) of ${show(t.sort)}`);
        sort = t.sort;
        out.open(`if (++${n} === 2) {`);
        out.emit(`${r} = -1;`);
        out.emit(`break ${label};`);
        out.close();
        out.emit(`${r} = ${t.code};`);
      });
      break;
    }
    case "distinct": {
      const seen = Out.fresh("_s");
      out.emit(`let ${r} = true;`);
      out.emit(`const ${seen}: number[] = [];`);
      loops((sc) => {
        const t = once(term(sc), out);
        if (!scalar(t.sort)) throw new CompileError(`distinct(…) of ${show(t.sort)}`);
        out.open(`if (${seen}.includes(${t.code})) {`);
        out.emit(`${r} = false;`);
        out.emit(`break ${label};`);
        out.close();
        out.emit(`${seen}.push(${t.code});`);
      });
      sort = BOOL;
      break;
    }
    case "set": {
      // A comprehension over one set's members gives each once already.
      const plain =
        e.binders.length === 1 &&
        e.binders[0].kind === "in" &&
        e.term?.k === "name" &&
        e.term.name === e.binders[0].name;
      // The term's sort decides the result's representation, so it is read
      // off a pass whose code is thrown away before the result is declared.
      let termSort: Sort = NUM;
      const probe: Env = { ...env, used: new Set(), scratch: null };
      bindingLoops(e.binders, scope, probe, new Out(0), (sc) => {
        termSort =
          e.term === null
            ? name(last.name, sc, probe, new Out(0)).sort
            : compileExpr(e.term, sc, probe, new Out(0)).sort;
      });
      if (!scalar(termSort) || termSort.k === "none")
        throw new CompileError(`set(…) of ${show(termSort)}`);
      sort = setOf(termSort);
      if (isMask(sort)) out.emit(`let ${r} = 0;`);
      else if (env.scratch !== null) {
        // One array a site, emptied each time the site is evaluated: its
        // value is read only until the site is evaluated again, and a
        // reason copies what it keeps.
        env.scratch.push(`const ${r}: number[] = [];`);
        out.emit(`${r}.length = 0;`);
      } else out.emit(`const ${r}: number[] = [];`);
      loops((sc) => {
        const t = once(term(sc), out);
        if (t.sort.k === "num") out.emit(`${r} |= 1 << ${t.code};`);
        else if (plain) out.emit(`${r}.push(${t.code});`);
        else out.emit(`if (!${r}.includes(${t.code})) ${r}.push(${t.code});`);
      });
      break;
    }
  }
  return { code: r, sort };
}

function call(
  fn: string,
  args: readonly Expr[],
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  if (fn === "clues")
    throw new CompileError("clues(kind) is read only as a binder's set");
  if (fn === "clue") {
    const a = args[0];
    if (args.length !== 2 || a.k !== "name" || !env.clues.has(a.name))
      throw new CompileError("clue(kind, x) names a clue kind of the description");
    const kind = env.clues.get(a.name) as ClueKind;
    const x = compileExpr(args[1], scope, env, out);
    if (!sameSort(x.sort, kind.at))
      throw new CompileError(`clue(${a.name}, ${show(x.sort)})`);
    env.readsClues.yes = true;
    env.used.add("clueAt");
    return { code: `clueAt(cl.${a.name}, ${x.code})`, sort: kind.v };
  }
  const vs = args.map((x) => compileExpr(x, scope, env, out));
  const arity = (n: number): void => {
    if (vs.length !== n) throw new CompileError(`${fn} takes ${n}, given ${vs.length}`);
  };
  const cell = (i: number): string => {
    expectElem(vs[i], "cell", fn);
    return vs[i].code;
  };
  switch (fn) {
    case "cells":
      arity(1);
      expectElem(vs[0], "line", fn);
      return { code: `sp.lineCells[${vs[0].code}]`, sort: setOf(elem("cell")) };
    case "row":
    case "col":
      arity(1);
      return { code: `sp.${fn}Of[${cell(0)}]`, sort: elem("line") };
    case "peers":
    case "adj4":
      arity(1);
      return { code: `sp.${fn}[${cell(0)}]`, sort: setOf(elem("cell")) };
    case "x":
      arity(1);
      return { code: `(${cell(0)} % sp.w)`, sort: NUM };
    case "y":
      arity(1);
      return { code: `((${cell(0)} / sp.w) | 0)`, sort: NUM };
    case "edge":
      arity(2);
      return { code: `sp.edgeOf(${cell(0)}, ${cell(1)})`, sort: elem("edge") };
    case "ends":
    case "end1":
    case "end2":
    case "other": {
      expectElem(vs[0], "edge", fn);
      const e = once(vs[0], out);
      const p = `sp.edgeEnds[2 * ${e.code}]`;
      const q = `sp.edgeEnds[2 * ${e.code} + 1]`;
      if (fn === "ends") {
        arity(1);
        return { code: `[${p}, ${q}]`, sort: setOf(elem("cell")) };
      }
      if (fn !== "other") {
        arity(1);
        return { code: fn === "end1" ? p : q, sort: elem("cell") };
      }
      arity(2);
      const c = once({ code: cell(1), sort: vs[1].sort }, out);
      return { code: `(${p} === ${c.code} ? ${q} : ${p})`, sort: elem("cell") };
    }
    case "known":
      arity(1);
      return { code: `b.known(${cell(0)})`, sort: BOOL };
    case "value":
      arity(1);
      return { code: `b.value(${cell(0)})`, sort: NUM };
    case "cand":
      arity(1);
      if (!env.memo) return { code: `b.cand(${cell(0)})`, sort: setOf(NUM) };
      return {
        code: candOf(once({ code: cell(0), sort: vs[0].sort }, out).code),
        sort: setOf(NUM),
      };
    case "abs":
      arity(1);
      expect(vs[0], "num", fn);
      return { code: `Math.abs(${vs[0].code})`, sort: NUM };
    case "range":
      arity(2);
      expect(vs[0], "num", fn);
      expect(vs[1], "num", fn);
      env.used.add("rangeMask");
      return { code: `rangeMask(${vs[0].code}, ${vs[1].code})`, sort: setOf(NUM) };
    case "subsets":
      arity(1);
      if (vs[0].sort.k !== "set")
        throw new CompileError(`subsets of ${show(vs[0].sort)}`);
      return { code: vs[0].code, sort: { k: "subsets", of: vs[0].sort } };
    case "first": {
      arity(1);
      const s = vs[0];
      if (isMask(s.sort)) {
        env.used.add("least");
        return { code: `least(${s.code})`, sort: NUM };
      }
      if (s.sort.k !== "set") throw new CompileError(`first of ${show(s.sort)}`);
      const a = once(s, out);
      return { code: `(${a.code}.length > 0 ? ${a.code}[0] : -1)`, sort: s.sort.of };
    }
    case "at":
    case "v": {
      arity(1);
      const k = vs[0].sort;
      if (k.k !== "elem" || !k.e.startsWith("clue "))
        throw new CompileError(`${fn} of ${show(k)}: not a clue`);
      const kind = k.e.slice("clue ".length);
      const decl = env.clues.get(kind) as ClueKind;
      env.readsClues.yes = true;
      return {
        code: `cl.${kind}.${fn}[${vs[0].code}]`,
        sort: fn === "at" ? decl.at : decl.v,
      };
    }
    case "strike":
    case "place": {
      if (!env.concluding) throw new CompileError(`${fn} outside a conclusion`);
      arity(2);
      const c = once({ code: cell(0), sort: vs[0].sort }, out);
      expect(vs[1], "num", fn);
      const d = once(vs[1], out);
      // A fact that changes nothing is left out, so a binding fires only
      // where its conclusion changes the marks.
      out.emit(
        fn === "strike"
          ? `if (b.has(${c.code}, ${d.code})) { if (fire === null) { b.strikeAt(${c.code}, ${d.code}); changed = true; } else facts.push(STRIKE, ${c.code}, ${d.code}); }`
          : `if (!b.known(${c.code})) { if (fire === null) { b.placeAt(${c.code}, ${d.code}); changed = true; } else facts.push(PLACE, ${c.code}, ${d.code}); }`,
      );
      env.used.add(fn === "strike" ? "STRIKE" : "PLACE");
      return { code: "true", sort: BOOL };
    }
  }
  const def = env.defs.get(fn);
  if (def !== undefined) {
    if (def.params.length !== vs.length)
      throw new CompileError(`${fn} takes ${def.params.length}, given ${vs.length}`);
    const inner = new Map<string, Val>();
    def.params.forEach((p, i) => {
      inner.set(p, once(vs[i], out));
    });
    return compileExpr(def.body, inner, env, out);
  }
  throw new CompileError(`unknown function "${fn}"`);
}

// --- a technique ------------------------------------------------------------

const capitalized = (id: string): string => id[0].toUpperCase() + id.slice(1);

/** The sorts each binder of a technique takes, for its binding's type. */
function binderSorts(t: Technique, env: Env): { name: string; sort: Sort }[] {
  const sorts: { name: string; sort: Sort }[] = [];
  const probe = new Out(0);
  bindingLoops(
    t.binders,
    new Map(),
    { ...env, used: new Set(), scratch: null },
    probe,
    (sc) => {
      for (const b of t.binders) {
        const v = sc.get(b.name);
        if (v !== undefined) sorts.push({ name: b.name, sort: v.sort });
      }
    },
  );
  return sorts;
}

function compileTechnique(t: Technique, env: Env): { code: string; clues: boolean } {
  const fnName = t.id.includes(".") ? t.id.slice(t.id.indexOf(".") + 1) : t.id;
  const bindingType = `${capitalized(fnName)}Binding`;
  const readsClues = { yes: false };
  const onPlace = t.on === "place";
  // A rung reads a cell's candidates many times a scan, so it keeps them;
  // a technique run on placing reads few, on every placement, and does not.
  const scratch: string[] = [];
  const tenv: Env = { ...env, readsClues, memo: !onPlace, scratch };
  const sorts = binderSorts(t, tenv);
  const fields = sorts.map((s) => `  ${s.name}: ${tsType(s.sort)};`);
  const body = new Out(1);
  body.emit(`const facts = ${fnName}Facts;`);
  body.emit("let fired = 0;");
  body.emit("let changed = false;");
  // The facts and the kept candidates live in one buffer each a function,
  // emptied each call: a technique never runs inside its own call (a firing
  // that places runs only the technique run on placing), and `fire` reads the
  // facts before it returns.
  const buffer = `${fnName}Cands`;
  if (!onPlace) {
    body.emit(
      `if (${buffer}.length < sp.cells.length) ${buffer} = new Int32Array(sp.cells.length);`,
    );
    body.emit(`const cands = ${buffer};`);
    body.emit("cands.fill(-1);");
  }
  const fire = (sc: Scope): void => {
    if (t.premise !== null) {
      const p = compileExpr(t.premise, sc, tenv, body);
      expect(p, "bool", "premise");
      body.emit(`if (!(${p.code})) continue;`);
    }
    body.emit("facts.length = 0;");
    body.emit("changed = false;");
    const c = compileExpr(t.conclude, sc, { ...tenv, concluding: true }, body);
    expect(c, "bool", "conclusion");
    const binding = `{ ${sorts.map((s) => `${s.name}: v_${s.name}`).join(", ")} }`;
    // A conclusion that is false proves the marks inconsistent.
    body.emit(`if (!(${c.code})) return -1;`);
    body.open("if (changed || facts.length > 0) {");
    body.emit("fired = 1;");
    // A technique run on placing makes every firing; a rung stops at the
    // first unless `fire` asks for the rest.
    if (onPlace) body.emit(`if (fire !== null) fire(${binding}, facts);`);
    else {
      body.emit(`if (fire !== null && !fire(${binding}, facts)) return 1;`);
      // The firing changed the marks the kept candidates were read from.
      body.emit("cands.fill(-1);");
    }
    body.close();
  };
  let params: string;
  if (onPlace) {
    const [first, ...rest] = t.binders;
    if (first === undefined || first.kind !== "in")
      throw new CompileError(
        `${t.id}: a technique run on placing binds the placed cell first`,
      );
    const of = compileExpr(first.of, new Map(), tenv, new Out(0));
    if (!(of.sort.k === "set" && of.sort.of.k === "elem" && of.sort.of.e === "cell"))
      throw new CompileError(`${t.id}: its first binder is not over cells`);
    const sc = new Map<string, Val>([
      [first.name, { code: `v_${first.name}`, sort: elem("cell") }],
    ]);
    if (first.where !== null) {
      const w = compileExpr(first.where, sc, tenv, body);
      expect(w, "bool", `where of ${first.name}`);
      body.emit(`if (!(${w.code})) return 0;`);
    }
    bindingLoops(rest, sc, tenv, body, fire);
    params = `v_${first.name}: number, `;
  } else {
    bindingLoops(t.binders, new Map(), tenv, body, fire);
    params = "";
  }
  body.emit("return fired;");
  const clueParam = readsClues.yes ? "cl: Clues, " : "";
  const lines = [
    `export interface ${bindingType} {`,
    ...fields,
    "}",
    "",
    `const ${fnName}Facts: number[] = [];`,
    ...(onPlace ? [] : [`let ${buffer} = new Int32Array(0);`]),
    "",
    `export function ${fnName}(b: Marks, sp: GridSpace, ${clueParam}${params}fire: Fire<${bindingType}> | null): number {`,
    ...scratch.map((d) => `  ${d}`),
    ...body.lines,
    "}",
  ];
  return { code: lines.join("\n"), clues: readsClues.yes };
}

// --- modules ----------------------------------------------------------------

/** What a module needs from the runtime, as an import line. */
function runtimeImport(
  used: ReadonlySet<string>,
  clues: boolean,
  runtime: string,
): string {
  const names = [
    ...(clues ? ["type ClueList"] : []),
    "type Fire",
    "type GridSpace",
    "type Marks",
    ...[...used].sort(),
  ];
  return `import { ${names.join(", ")} } from "${runtime}";`;
}

const HEADER = (source: string): string =>
  `// Compiled by \`npm run describe\` from ${source}: edit that, not this.`;

/** A library's techniques, each a function over any grid's units. */
export function compileLibrary(
  lib: LibraryJson,
  source: string,
  runtime: string,
): string {
  Out.reset();
  const used = new Set<string>();
  const env: Env = {
    defs: new Map(),
    clues: new Map(),
    used,
    concluding: false,
    memo: false,
    scratch: null,
    readsClues: { yes: false },
  };
  const parts = Object.entries(lib.techniques).map(([id, stated]) => {
    const t: Technique = {
      ...parseTechnique(lib.library, id, stated),
      tier: 0,
      rungs: [],
    };
    const out = compileTechnique(t, env);
    if (out.clues)
      throw new CompileError(
        `${lib.library}.${id}: a library technique reads no clues`,
      );
    return out.code;
  });
  return `${[HEADER(source), "", runtimeImport(used, false, runtime), "", parts.join("\n\n")].join("\n")}\n`;
}

/** The sort of a clue kind's place and value, from its declaration. */
function clueSorts(kind: string, at: string, value: Expr, env: Env): ClueKind {
  const atSort: Sort =
    at === "edge"
      ? elem("edge")
      : at === "cell"
        ? elem("cell")
        : at === "line"
          ? elem("line")
          : NUM;
  if (atSort.k === "num")
    throw new CompileError(`clue ${kind}: no element sort "${at}"`);
  const v = compileExpr(
    value,
    new Map([["at", { code: "at", sort: atSort }]]),
    env,
    new Out(0),
  );
  if (v.sort.k !== "set")
    throw new CompileError(`clue ${kind}: its values are not a set`);
  return { at: atSort, v: v.sort.of };
}

/**
 * A game's own techniques, its clue lists, and its ladder: every technique,
 * the library's it places included, by id and tier in the description's
 * order, which is the order a rung runs them in.
 */
export function compileGame(
  json: DescriptionJson,
  libraries: readonly LibraryJson[],
  source: string,
  runtime: string,
): string {
  Out.reset();
  const d = loadDescription(json, libraries);
  const used = new Set<string>();
  const clues = new Map<string, ClueKind>();
  const env: Env = {
    defs: d.defs,
    clues,
    used,
    concluding: false,
    memo: false,
    scratch: null,
    readsClues: { yes: false },
  };
  for (const [kind, c] of d.clueKinds)
    clues.set(kind, clueSorts(kind, c.at, c.value, env));
  const own = d.techniques.filter((t) => !t.id.includes("."));
  const parts = own.map((t) => compileTechnique(t, env).code);
  const clueLines = [
    "/** The dealt clues, by kind. */",
    "export interface Clues {",
    ...[...clues.keys()].map((k) => `  ${k}: ClueList;`),
    "}",
  ];
  const ids = d.techniques.filter((t) => t.on === null).map((t) => t.id);
  const ladder = [
    "/** Every technique a rung runs, by id: the description's, in its order. */",
    `export type LadderId = ${ids.map((id) => JSON.stringify(id)).join(" | ")};`,
    "",
    "/** The ladder: each technique's tier, in the order the description lists them. */",
    "export const ladder: readonly { id: LadderId; tier: number }[] = [",
    ...d.techniques
      .filter((t) => t.on === null)
      .map((t) => `  { id: ${JSON.stringify(t.id)}, tier: ${t.tier} },`),
    "];",
    "",
    `/** The description's tiers, by name. */`,
    `export const tiers: readonly string[] = ${JSON.stringify(d.tiers)};`,
  ];
  return `${[
    HEADER(source),
    "",
    runtimeImport(used, true, runtime),
    "",
    ...clueLines,
    "",
    ...ladder,
    "",
    parts.join("\n\n"),
  ].join("\n")}\n`;
}

export { CompileError };
