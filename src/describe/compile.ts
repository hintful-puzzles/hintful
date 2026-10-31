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
  UNPLACED,
  withEveryVariation,
} from "./description.ts";
import type { Binder, Expr } from "./expr.ts";

/** A region's sort names its partition, as a clue's names its kind. */
type ElemSort =
  | "cell"
  | "line"
  | "edge"
  | "slot"
  | "corner"
  | `clue ${string}`
  | `region ${string}`;

type Sort =
  | { k: "num" }
  | { k: "bool" }
  | { k: "none" }
  | { k: "elem"; e: ElemSort }
  | { k: "set"; of: Sort }
  | { k: "subsets"; of: Sort }
  | { k: "clues"; kind: string }
  /** A filling's values, read `f(x)`: an array by cell, `-1` off its set. */
  | { k: "fill" };

const NUM: Sort = { k: "num" };
const BOOL: Sort = { k: "bool" };
const elem = (e: ElemSort): Sort => ({ k: "elem", e });
const setOf = (of: Sort): Sort => ({ k: "set", of });

/** A compiled term: TypeScript that computes it, once its statements have run. */
interface Val {
  code: string;
  sort: Sort;
  /** For a name a term may read: the slot from which it is defined. */
  at?: Slot;
  /** For a name bound by a loop over an array: the array's code and the
   * loop's counter, which is the name's index in it. */
  pos?: { arr: string; i: string };
  /** For a name bound by `=`: the code of the term it names. */
  names?: string;
}

/** The code a set is, a name bound by `=` read as its term: so a filling of
 * `K = cells(r)` and a sum over `cells(r)` are over one set. */
const setKey = (v: Val): string => v.names ?? v.code;

/**
 * A place in the code, just after a name is bound, where a term that reads
 * nothing bound later can be computed once (§ "What a technique compiles
 * to"). `loops` counts the loops open there, so a term used inside more of
 * them is computed fewer times in the slot.
 */
interface Slot {
  seq: number;
  indent: number;
  loops: number;
  lines: Line[];
  /** The terms computed here, by their code, each to its name. */
  made: Map<string, Val>;
}

interface Line {
  indent: number;
  text: string;
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

/** The code being written: statements at an indent, the slots among them,
 * and fresh names. */
class Out {
  readonly entries: (Line | Slot)[] = [];
  private depth: number;
  private static n = 0;
  private static slots = 0;
  constructor(depth: number) {
    this.depth = depth;
  }
  emit(line: string): void {
    this.entries.push({ indent: this.depth, text: line });
  }
  open(line: string): void {
    this.emit(line);
    this.depth++;
  }
  close(line = "}"): void {
    this.depth--;
    this.emit(line);
  }
  /** A slot here, `loops` deep. */
  slot(loops: number): Slot {
    const s: Slot = {
      seq: ++Out.slots,
      indent: this.depth,
      loops,
      lines: [],
      made: new Map(),
    };
    this.entries.push(s);
    return s;
  }
  /** `inner`'s statements and slots here, at this indent. */
  append(inner: Out): void {
    for (const e of inner.entries) {
      e.indent += this.depth;
      this.entries.push(e);
    }
  }
  text(): string[] {
    const pad = (n: number): string => "  ".repeat(n);
    return this.entries.flatMap((e) =>
      "text" in e
        ? [`${pad(e.indent)}${e.text}`]
        : e.lines.map((l) => `${pad(e.indent + l.indent)}${l.text}`),
    );
  }
  static fresh(prefix: string): string {
    return `${prefix}${++Out.n}`;
  }
  static reset(): void {
    Out.n = 0;
    Out.slots = 0;
  }
}

interface ClueKind {
  at: Sort;
  v: Sort;
}

interface Env {
  defs: ReadonlyMap<string, Definition>;
  clues: ReadonlyMap<string, ClueKind>;
  /** The partitions the board deals, by name. */
  regions: ReadonlySet<string>;
  /** The partition among the units, whose parts are the space's boxes: its
   * name, or `null` where there is none. */
  boxes: string | null;
  /** Whether the space has its diagonals. */
  diagonals: boolean;
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
  /** Whether the code reads what the board deals, its clues or partitions,
   * so the function takes them. */
  readsClues: { yes: boolean };
  /** Where a technique's body moves terms to; `null` outside one, and in
   * code that is compiled only for its sort. */
  hoist: Hoist | null;
  /** Whether a technique's body keeps a projection of fillings, valid while
   * the kept candidates are: then it counts their generations in `_epoch`.
   * `null` outside a technique. */
  epoch: { used: boolean } | null;
}

interface Hoist {
  /** The function's start, for a term that reads no bound name. */
  root: Slot;
  /** The loops open where the code is being written. */
  loops: number;
  /** Whether `value` and `known` may be read early: only where nothing the
   * technique concludes is a placement, the one fact that changes them. */
  marks: boolean;
}

type Scope = ReadonlyMap<string, Val>;

const NAMES: Record<string, Val> = {
  cells: { code: "sp.cells", sort: setOf(elem("cell")) },
  rows: { code: "sp.rows", sort: setOf(elem("line")) },
  cols: { code: "sp.cols", sort: setOf(elem("line")) },
  lines: { code: "sp.lines", sort: setOf(elem("line")) },
  units: { code: "sp.units", sort: setOf(elem("line")) },
  slots: { code: "sp.slots", sort: setOf(elem("slot")) },
  corners: { code: "sp.corners", sort: setOf(elem("corner")) },
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
  if (env.hoist !== null && e.k !== "num" && e.k !== "name") {
    const v = hoisted(e, scope, env, env.hoist);
    if (v !== null) return v;
  }
  return compileNode(e, scope, env, out);
}

/** The functions a term may call and still be computed early: none reads
 * the candidates, binds a name, or makes a fact. */
const EARLY = new Set([
  "value",
  "known",
  "clue",
  "at",
  "v",
  "x",
  "y",
  "cell",
  "row",
  "col",
  "edge",
  "end1",
  "end2",
  "other",
  "abs",
  "range",
  "sight",
  "opposite",
  "across",
  "nth",
  "index",
]);

/**
 * Whether `e` can be computed anywhere its names are bound: it binds no name
 * of its own, reads no candidate, makes no fact and calls no definition that
 * does. `bound` says which names are its inputs; `marks` is set where it
 * reads `value` or `known`.
 */
function early(
  e: Expr,
  bound: (n: string) => boolean,
  env: Env,
  marks: { read: boolean },
): boolean {
  const all = (xs: readonly Expr[]): boolean =>
    xs.every((x) => early(x, bound, env, marks));
  switch (e.k) {
    case "num":
      return true;
    case "name":
      return (
        bound(e.name) ||
        NAMES[e.name] !== undefined ||
        env.regions.has(e.name) ||
        e.name === env.boxes ||
        (e.name === "diagonals" && env.diagonals) ||
        e.name === "order" ||
        e.name === "w" ||
        e.name === "h"
      );
    case "set":
      return all(e.elems);
    case "size":
    case "not":
    case "neg":
      return early(e.of, bound, env, marks);
    case "bin":
      if ((e.op === "in" || e.op === "notin") && e.b.k === "call" && e.b.fn === "cand")
        return false;
      return all([e.a, e.b]);
    case "quant":
    case "agg":
      return false;
    case "call": {
      if (e.fn === "value" || e.fn === "known") marks.read = true;
      if (e.fn === "clue") return all(e.args.slice(1));
      if (EARLY.has(e.fn) || partOf(e.fn, env)) return all(e.args);
      const def = env.defs.get(e.fn);
      if (def === undefined || !all(e.args)) return false;
      return early(def.body, (n) => def.params.includes(n), env, marks);
    }
  }
}

/** The names `e` reads from its scope; a definition's body reads only its
 * parameters, which are its arguments. */
function namesIn(e: Expr, into: Set<string>, env: Env): void {
  switch (e.k) {
    case "name":
      into.add(e.name);
      return;
    case "set":
      for (const x of e.elems) namesIn(x, into, env);
      return;
    case "size":
    case "not":
    case "neg":
      namesIn(e.of, into, env);
      return;
    case "bin":
      namesIn(e.a, into, env);
      namesIn(e.b, into, env);
      return;
    case "call":
      for (const x of e.fn === "clue" ? e.args.slice(1) : e.args) namesIn(x, into, env);
      return;
    default:
      return;
  }
}

/** A read a slot keeps for every use after it, though no loop is left. */
const isRead = (e: Expr): boolean =>
  e.k === "size" ||
  (e.k === "call" && (e.fn === "value" || e.fn === "known" || e.fn === "clue"));

/**
 * `e` computed in the slot of the last name it reads, where that takes it out
 * of a loop or it is a read the slot can share: the name it is kept under,
 * or `null` where it is computed where it stands.
 */
function hoisted(e: Expr, scope: Scope, env: Env, h: Hoist): Val | null {
  const marks = { read: false };
  if (!early(e, (n) => scope.has(n), env, marks)) return null;
  if (marks.read && !h.marks) return null;
  const names = new Set<string>();
  namesIn(e, names, env);
  let slot = h.root;
  for (const n of names) {
    const v = scope.get(n);
    if (v === undefined) continue;
    if (v.at === undefined) return null;
    if (v.at.seq > slot.seq) slot = v.at;
  }
  if (slot.loops === h.loops && !isRead(e)) return null;
  // Its own terms are moved as it is, so a read it makes is the one every
  // other term there shares: `clue(sum, k)` and `clue(sum, k) = none` read
  // the clue once.
  const tmp = new Out(0);
  const v = compileNode(e, scope, env, tmp);
  if (isArray(v.sort) || v.sort.k === "subsets" || v.sort.k === "clues") return null;
  if (tmp.entries.length === 0) {
    const made = slot.made.get(v.code);
    if (made !== undefined) return made;
  }
  const t = Out.fresh("_h");
  for (const l of tmp.entries) if ("text" in l) slot.lines.push(l);
  slot.lines.push({ indent: 0, text: `const ${t} = ${v.code};` });
  const val: Val = { code: t, sort: v.sort, at: slot };
  if (tmp.entries.length === 0) slot.made.set(v.code, val);
  return val;
}

function compileNode(e: Expr, scope: Scope, env: Env, out: Out): Val {
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

/** Whether `fn` names a partition, which as a function gives a cell's part. */
const partOf = (fn: string, env: Env): boolean =>
  env.regions.has(fn) || fn === env.boxes;

function name(n: string, scope: Scope, env: Env, out: Out): Val {
  const bound = scope.get(n);
  if (bound !== undefined) return bound;
  const known = NAMES[n];
  if (known !== undefined) return known;
  if (env.regions.has(n)) {
    env.readsClues.yes = true;
    return { code: `cl.${n}.parts`, sort: setOf(elem(`region ${n}`)) };
  }
  if (n === env.boxes) return { code: "sp.boxes", sort: setOf(elem("line")) };
  if (n === "diagonals" && env.diagonals)
    return { code: "sp.diagonals", sort: setOf(elem("line")) };
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
  if (inner.entries.length === 0)
    return { code: `(${left} ${op === "and" ? "&&" : "||"} ${vb.code})`, sort: BOOL };
  const r = Out.fresh("_c");
  out.emit(`let ${r} = ${left};`);
  out.open(op === "and" ? `if (${r}) {` : `if (!${r}) {`);
  out.append(inner);
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
    let v = `v_${bnd.name}`;
    let closeBlock = false;
    let skip = "continue";
    let sort: Sort;
    let pos: Val["pos"];
    let names: string | null = null;
    let where = bnd.where;
    if (bnd.kind === "fill") {
      const f = fillLoop(bnd, sc, env, out);
      v = f.code;
      sort = { k: "fill" };
      where = f.rest;
    } else if (bnd.kind === "let") {
      const t = compileExpr(bnd.of, sc, env, out);
      sort = t.sort;
      names = setKey(t);
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
    } else if (bnd.of.k === "call" && bnd.of.fn === "before") {
      // The members ahead of x, read in place up to x's index.
      const [xe, le] = bnd.of.args;
      if (bnd.of.args.length !== 2) throw new CompileError("before takes 2");
      const L = compileExpr(le, sc, env, out);
      const x = compileExpr(xe, sc, env, out);
      if (!isArray(L.sort) || L.sort.k !== "set" || !sameSort(x.sort, L.sort.of))
        throw new CompileError(`before(${show(x.sort)}, ${show(L.sort)})`);
      sort = L.sort.of;
      const a = Out.fresh("_a");
      const n = Out.fresh("_n");
      const ix = Out.fresh("_i");
      out.emit(`const ${a} = ${L.code};`);
      out.emit(
        `const ${n} = ${x.pos?.arr === L.code ? x.pos.i : `${a}.indexOf(${x.code})`};`,
      );
      out.open(`for (let ${ix} = 0; ${ix} < ${n}; ${ix}++) {`);
      out.emit(`const ${v} = ${a}[${ix}];`);
      pos = { arr: L.code, i: ix };
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
        pos = { arr: s.code, i: ix };
      } else throw new CompileError(`${bnd.name} in ${show(s.sort)}: not a set`);
    }
    // Every binder of a set, and every filling, opened one loop.
    const loop = bnd.kind !== "let";
    const h = env.hoist;
    if (h !== null && loop) h.loops++;
    const inner = new Map(sc);
    inner.set(bnd.name, {
      code: v,
      sort,
      at: h === null ? undefined : out.slot(h.loops),
      ...(pos === undefined ? {} : { pos }),
      ...(names === null ? {} : { names }),
    });
    if (where !== null) {
      const w = compileExpr(where, inner, env, out);
      expect(w, "bool", `where of ${bnd.name}`);
      out.emit(`if (!(${w.code})) ${skip};`);
    }
    walk(i + 1, inner);
    if (h !== null && loop) h.loops--;
    if (loop || closeBlock) out.close();
  };
  walk(0, scope);
}

/**
 * A filling's conjuncts, `a and b and c` as `[a, b, c]`, and a call of a definition read as its body's, its
 * parameters replaced by the arguments: so a condition stated once, as
 * Keen's `apart(f, K)`, is kept as each cell is assigned wherever it is
 * written.
 */
function fillConjuncts(e: Expr, scope: Scope, env: Env): Expr[] {
  if (e.k === "bin" && e.op === "and")
    return [...fillConjuncts(e.a, scope, env), ...fillConjuncts(e.b, scope, env)];
  const def = e.k === "call" && !scope.has(e.fn) ? env.defs.get(e.fn) : undefined;
  if (e.k !== "call" || def === undefined || def.params.length !== e.args.length)
    return [e];
  const sub = new Map(def.params.map((p, i) => [p, e.args[i]] as const));
  const avoid = new Set<string>();
  for (const a of e.args) freeNames(a, avoid, new Set());
  return fillConjuncts(substitute(def.body, sub, avoid), scope, env);
}

/** `e` with each name `sub` maps replaced by its term, refusing a binder that
 * would capture a name the terms read (`avoid`). */
function substitute(
  e: Expr,
  sub: ReadonlyMap<string, Expr>,
  avoid: ReadonlySet<string>,
): Expr {
  const go = (x: Expr): Expr => substitute(x, sub, avoid);
  switch (e.k) {
    case "num":
      return e;
    case "name":
      return sub.get(e.name) ?? e;
    case "set":
      return { ...e, elems: e.elems.map(go) };
    case "size":
    case "not":
    case "neg":
      return { ...e, of: go(e.of) };
    case "bin":
      return { ...e, a: go(e.a), b: go(e.b) };
    case "call": {
      const to = sub.get(e.fn);
      if (to !== undefined && to.k !== "name")
        throw new CompileError(`${e.fn}(…): its argument is not a name`);
      return { ...e, fn: to?.k === "name" ? to.name : e.fn, args: e.args.map(go) };
    }
    case "quant":
    case "agg": {
      const inner = new Map(sub);
      const binders = e.binders.map((b) => {
        const of = substitute(b.of, inner, avoid);
        if (avoid.has(b.name))
          throw new CompileError(
            `a definition's binder ${b.name} would capture an argument`,
          );
        inner.delete(b.name);
        return {
          ...b,
          of,
          where: b.where === null ? null : substitute(b.where, inner, avoid),
        };
      });
      const rest = (x: Expr | null): Expr | null =>
        x === null ? null : substitute(x, inner, avoid);
      return e.k === "quant"
        ? { ...e, binders, body: rest(e.body) as Expr }
        : { ...e, binders, where: rest(e.where), term: rest(e.term) };
    }
  }
}

/** Whether `e` reads the filling `f` only as `f(x)` of the names `at`. */
function readsOnlyAt(e: Expr, f: string, at: ReadonlySet<string>): boolean {
  const go = (x: Expr | null): boolean => x === null || readsOnlyAt(x, f, at);
  switch (e.k) {
    case "num":
      return true;
    case "name":
      return e.name !== f;
    case "set":
      return e.elems.every(go);
    case "size":
    case "not":
    case "neg":
      return go(e.of);
    case "bin":
      return go(e.a) && go(e.b);
    case "call": {
      if (e.fn !== f) return e.args.every(go);
      const [x] = e.args;
      return e.args.length === 1 && x.k === "name" && at.has(x.name);
    }
    case "quant":
    case "agg":
      return (
        e.binders.every((b) => go(b.of) && go(b.where)) &&
        (e.k === "quant" ? go(e.body) : go(e.where) && go(e.term))
      );
  }
}

/** `forall x in S, y in before(x, S) [where P]: B`, over the filling's own
 * set `S` and reading it only at `x` and `y`: a condition on each pair. */
function pairOf(
  c: Expr,
  f: string,
  set: string,
  scope: Scope,
  env: Env,
): { x: string; y: string; when: Expr | null; body: Expr } | null {
  if (c.k !== "quant" || c.q !== "forall" || c.binders.length !== 2) return null;
  const [bx, by] = c.binders;
  if (bx.kind !== "in" || bx.where !== null || by.kind !== "in") return null;
  if (by.of.k !== "call" || by.of.fn !== "before" || by.of.args.length !== 2)
    return null;
  const [xe, s2] = by.of.args;
  if (xe.k !== "name" || xe.name !== bx.name) return null;
  const probe: Env = { ...env, used: new Set(), scratch: null, hoist: null };
  for (const s of [bx.of, s2]) {
    if (reads(s, f) || setKey(compileExpr(s, scope, probe, new Out(0))) !== set)
      return null;
  }
  const at = new Set([bx.name, by.name]);
  if (
    !readsOnlyAt(c.body, f, at) ||
    (by.where !== null && !readsOnlyAt(by.where, f, at))
  )
    return null;
  return { x: bx.name, y: by.name, when: by.where, body: c.body };
}

/** `sum(x in S of f(x)) = t` or the `prod`, either way round, over the
 * filling's own set and with `t` reading no filling; optionally the right
 * side of an `or` whose left reads none, which is then its guard. */
function totalOf(
  c: Expr,
  f: string,
  set: string,
  scope: Scope,
  env: Env,
): { fn: "sum" | "prod"; t: Expr; unless: Expr | null } | null {
  let unless: Expr | null = null;
  let eq = c;
  if (c.k === "bin" && c.op === "or" && !reads(c.a, f)) {
    unless = c.a;
    eq = c.b;
  }
  if (eq.k !== "bin" || eq.op !== "=") return null;
  for (const [agg, t] of [
    [eq.a, eq.b],
    [eq.b, eq.a],
  ]) {
    if (agg.k !== "agg" || (agg.fn !== "sum" && agg.fn !== "prod") || reads(t, f))
      continue;
    const [b] = agg.binders;
    if (
      agg.binders.length !== 1 ||
      b.kind !== "in" ||
      b.where !== null ||
      agg.where !== null
    )
      continue;
    const x = agg.term === null ? null : readOf(agg.term, f);
    if (x?.k !== "name" || x.name !== b.name || reads(b.of, f)) continue;
    const probe: Env = { ...env, used: new Set(), scratch: null, hoist: null };
    if (setKey(compileExpr(b.of, scope, probe, new Out(0))) !== set) continue;
    return { fn: agg.fn, t, unless };
  }
  return null;
}

/** `f(t)`'s argument, where `e` is a read of the filling `f`; else `null`. */
const readOf = (e: Expr, f: string): Expr | null =>
  e.k === "call" && e.fn === f && e.args.length === 1 ? e.args[0] : null;

/** `f(x) = t`, either way round, where neither `x` nor `t` reads `f`. */
function pinOf(c: Expr, f: string): { x: Expr; t: Expr } | null {
  if (c.k !== "bin" || c.op !== "=") return null;
  for (const [r, t] of [
    [c.a, c.b],
    [c.b, c.a],
  ]) {
    const x = readOf(r, f);
    if (x !== null && !reads(x, f) && !reads(t, f)) return { x, t };
  }
  return null;
}

/**
 * Open the depth-first enumeration of a filling `fill f of S [from cand]`:
 * each element of `S` in order takes each of its values ascending, and the
 * code after this runs once a whole assignment, where `continue` goes on to
 * the next. Two kinds of `where` conjunct are kept as each element is
 * assigned rather than once it is whole, which bounds the work and not the
 * result: `distinct(f(x) over x in T)` passes over a value an earlier member
 * of `T` holds, and `f(x) = t` gives `x` the one value `t`. `rest` is the
 * conjuncts left for the whole assignment. The values are kept by cell, so
 * `f(x)` is one read, and are `-1` off `S`.
 */
function fillLoop(
  bnd: Binder,
  scope: Scope,
  env: Env,
  out: Out,
): { code: string; arr: string; rest: Expr | null } {
  const f = bnd.name;
  const s = compileExpr(bnd.of, scope, env, out);
  if (!(isArray(s.sort) && s.sort.k === "set" && sameSort(s.sort.of, elem("cell"))))
    throw new CompileError(`fill ${f} of ${show(s.sort)}: not a set of cells`);
  if (bnd.from !== undefined && bnd.from !== "cand")
    throw new CompileError(`fill ${f} from ${bnd.from}: only from cand`);
  const a = Out.fresh("_a");
  const fv = Out.fresh("_f");
  const last = Out.fresh("_l");
  const st = Out.fresh("_s");
  // Each a call: the values by cell, the set they were last given over, so
  // the next enumeration clears it, and each depth's last value tried.
  const decls = [
    `const ${fv} = new Int32Array(sp.cells.length).fill(-1);`,
    `let ${last}: readonly number[] = [];`,
    `const ${st}: number[] = [];`,
  ];
  if (env.scratch !== null) env.scratch.push(...decls);
  else for (const d of decls) out.emit(d);
  out.emit(`const ${a} = ${s.code};`);
  // Each check is written into the loop over a cell's values, where
  // `continue` passes over the value.
  const checks: ((o: Out) => void)[] = [];
  const rest: Expr[] = [];
  const e = Out.fresh("_e");
  const d = Out.fresh("_d");
  const i = Out.fresh("_i");
  const j = Out.fresh("_j");
  const valueLoop = Out.fresh("V");
  let paired = false;
  const filling: Val = { code: fv, sort: { k: "fill" } };
  for (const c of bnd.where === null ? [] : fillConjuncts(bnd.where, scope, env)) {
    const pinned = pinOf(c, f);
    const term = c.k === "agg" && c.fn === "distinct" ? c.term : null;
    const over = c.k === "agg" ? c.binders : [];
    const pair = pinned === null ? pairOf(c, f, setKey(s), scope, env) : null;
    const total =
      pinned === null && pair === null ? totalOf(c, f, setKey(s), scope, env) : null;
    if (pinned !== null) {
      const x = once(compileExpr(pinned.x, scope, env, out), out);
      expectElem(x, "cell", f);
      const t = once(compileExpr(pinned.t, scope, env, out), out);
      expect(t, "num", f);
      checks.push((o) =>
        o.emit(`if (${e} === ${x.code} && ${d} !== ${t.code}) continue;`),
      );
    } else if (pair !== null) {
      // Each pair is checked once the later of its two cells has its value:
      // the whole condition, so it is not read again.
      paired = true;
      checks.push((o) => {
        const y = Out.fresh("_y");
        const inner = new Map(scope);
        inner.set(f, filling);
        inner.set(pair.x, { code: e, sort: elem("cell") });
        inner.set(pair.y, { code: y, sort: elem("cell") });
        const flat: Env = { ...env, hoist: null };
        o.open(`for (let ${j} = 0; ${j} < ${i}; ${j}++) {`);
        o.emit(`const ${y} = ${a}[${j}];`);
        if (pair.when !== null) {
          const w = compileExpr(pair.when, inner, flat, o);
          expect(w, "bool", `where of ${pair.y}`);
          o.emit(`if (!(${w.code})) continue;`);
        }
        const b = compileExpr(pair.body, inner, flat, o);
        expect(b, "bool", "forall");
        o.emit(`if (!(${b.code})) continue ${valueLoop};`);
        o.close();
      });
    } else if (total !== null) {
      // No value is negative, so a sum past `t` stays past it; a product
      // that does not divide `t` never comes to it, while it is positive. The
      // whole condition is read again once the filling is.
      rest.push(c);
      const unless =
        total.unless === null
          ? null
          : once(compileExpr(total.unless, scope, env, out), out);
      if (unless !== null) expect(unless, "bool", "or");
      const t = once(compileExpr(total.t, scope, env, out), out);
      expect(t, "num", total.fn);
      checks.push((o) => {
        const p = Out.fresh("_t");
        o.open(unless === null ? "{" : `if (!${unless.code}) {`);
        o.emit(`let ${p} = ${d};`);
        o.emit(
          `for (let ${j} = 0; ${j} < ${i}; ${j}++) ${p} ${total.fn === "sum" ? "+=" : "*="} ${fv}[${a}[${j}]];`,
        );
        o.emit(
          total.fn === "sum"
            ? `if (${p} > ${t.code}) continue;`
            : `if (${p} > 0 && ${t.code} % ${p} !== 0) continue;`,
        );
        o.close();
      });
    } else if (
      term !== null &&
      over.length === 1 &&
      over[0].kind === "in" &&
      over[0].where === null &&
      !reads(over[0].of, f) &&
      readOf(term, f)?.k === "name" &&
      (readOf(term, f) as { name: string }).name === over[0].name
    ) {
      const T = once(compileExpr(over[0].of, scope, env, out), out);
      if (!sameSort(T.sort, s.sort))
        throw new CompileError(`distinct(${f}(…) over ${show(T.sort)})`);
      const inT = (x: string): string =>
        T.code === s.code ? "true" : `${T.code}.includes(${x})`;
      checks.push((o) =>
        o.emit(
          `if (${inT(e)}) { let ${j} = 0; while (${j} < ${i} && !(${fv}[${a}[${j}]] === ${d} && ${inT(`${a}[${j}]`)})) ${j}++; if (${j} < ${i}) continue; }`,
        ),
      );
    } else rest.push(c);
  }
  const mask =
    bnd.from === undefined ? "b.domain" : env.memo ? candOf(e) : `b.cand(${e})`;
  const r = Out.fresh("_r");
  const once0 = Out.fresh("_o");
  out.emit(`for (const ${e} of ${last}) ${fv}[${e}] = -1;`);
  out.emit(`${last} = ${a};`);
  out.emit(`let ${i} = 0;`);
  out.emit(`${st}[0] = 0;`);
  // The empty set has one filling, the empty one.
  out.emit(`let ${once0} = ${a}.length === 0;`);
  out.open("for (;;) {");
  out.open(`if (${a}.length === 0) {`);
  out.emit(`if (!${once0}) break;`);
  out.emit(`${once0} = false;`);
  out.close();
  out.open(`while (${a}.length > 0 && ${i} >= 0) {`);
  out.emit(`const ${e} = ${a}[${i}];`);
  out.emit(`if (${st}[${i}] > 0) ${fv}[${e}] = -1;`);
  out.emit(`let ${r} = ${mask} & ~((2 << ${st}[${i}]) - 1);`);
  out.emit(`let ${d} = 0;`);
  out.open(`${paired ? `${valueLoop}: ` : ""}for (; ${r} !== 0; ${r} &= ${r} - 1) {`);
  out.emit(`${d} = 31 - Math.clz32(${r} & -${r});`);
  // The value is the cell's while it is checked, for a pair to read; a value
  // passed over is replaced before any check reads the cell again.
  out.emit(`${fv}[${e}] = ${d};`);
  for (const check of checks) check(out);
  out.emit("break;");
  out.close();
  out.open(`if (${r} === 0) {`);
  out.emit(`${st}[${i}] = 0;`);
  out.emit(`${i}--;`);
  out.emit("continue;");
  out.close();
  out.emit(`${st}[${i}] = ${d};`);
  out.emit(`if (${i} === ${a}.length - 1) break;`);
  out.emit(`${i}++;`);
  out.emit(`${st}[${i}] = 0;`);
  out.close();
  out.emit(`if (${i} < 0) break;`);
  return {
    code: fv,
    arr: a,
    rest:
      rest.length === 0
        ? null
        : rest.reduce((x, y) => ({ k: "bin", op: "and", a: x, b: y })),
  };
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
      return e.fn === name || e.args.some((x) => reads(x, name));
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
  const probe: Env = { ...env, used: new Set(), scratch: null, hoist: null };
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

/** The names `e` reads that it does not bind, function names included. */
function freeNames(e: Expr, into: Set<string>, bound: ReadonlySet<string>): void {
  switch (e.k) {
    case "num":
      return;
    case "name":
      if (!bound.has(e.name)) into.add(e.name);
      return;
    case "set":
      for (const x of e.elems) freeNames(x, into, bound);
      return;
    case "size":
    case "not":
    case "neg":
      freeNames(e.of, into, bound);
      return;
    case "bin":
      freeNames(e.a, into, bound);
      freeNames(e.b, into, bound);
      return;
    case "call":
      if (!bound.has(e.fn)) into.add(e.fn);
      for (const x of e.args) freeNames(x, into, bound);
      return;
    case "quant":
    case "agg": {
      const inner = new Set(bound);
      for (const b of e.binders) {
        freeNames(b.of, into, inner);
        inner.add(b.name);
        if (b.where !== null) freeNames(b.where, into, inner);
      }
      if (e.k === "quant") freeNames(e.body, into, inner);
      else {
        if (e.term !== null) freeNames(e.term, into, inner);
        if (e.where !== null) freeNames(e.where, into, inner);
      }
      return;
    }
  }
}

/**
 * `exists fill f of S where ... and f(x) = t: B`, asked inside loops that
 * bind only `x` and `t`, as the projection it is: every filling the rest
 * allows, enumerated once where the rest's names are bound, keeps the values
 * it gives each cell, and the question is whether `t` is among `x`'s. It is
 * enumerated again only once the kept candidates it read are cleared
 * (`_epoch`), so it answers as the pinned enumeration would. `null` where
 * the quantifier has another shape, or computing it earlier saves no loop.
 */
function projection(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  const h = env.hoist;
  const [bnd, ...more] = e.binders;
  if (e.q !== "exists" || more.length > 0 || h === null || env.epoch === null)
    return null;
  if (bnd.kind !== "fill" || bnd.where === null) return null;
  const f = bnd.name;
  const cs = fillConjuncts(bnd.where, scope, env);
  const at = cs.findIndex((c) => pinOf(c, f) !== null);
  if (at < 0) return null;
  const pin = pinOf(cs[at], f) as { x: Expr; t: Expr };
  const rest = cs.filter((_, i) => i !== at);
  const names = new Set<string>();
  const own = new Set([f]);
  freeNames(bnd.of, names, new Set());
  for (const c of rest) freeNames(c, names, own);
  freeNames(e.body, names, own);
  let slot = h.root;
  for (const n of names) {
    const v = scope.get(n);
    if (v === undefined) continue;
    if (v.at === undefined) return null;
    if (v.at.seq > slot.seq) slot = v.at;
  }
  if (slot.loops >= h.loops) return null;
  if (!env.epoch.used) {
    env.epoch.used = true;
    h.root.lines.push({ indent: 0, text: "let _epoch = 0;" });
  }
  const pj = Out.fresh("_p");
  const last = Out.fresh("_l");
  const any = Out.fresh("_y");
  const made = Out.fresh("_g");
  const decls = [
    `const ${pj} = new Int32Array(sp.cells.length);`,
    `let ${last}: readonly number[] = [];`,
    `let ${any} = false;`,
  ];
  if (env.scratch !== null) env.scratch.push(...decls);
  else for (const d of decls) out.emit(d);
  // The rest's names are bound anew there, so the projection is due again.
  slot.lines.push({ indent: 0, text: `let ${made} = -1;` });
  out.open(`if (${made} !== _epoch) {`);
  out.emit(`${made} = _epoch;`);
  const x0 = Out.fresh("_e");
  out.emit(`for (const ${x0} of ${last}) ${pj}[${x0}] = 0;`);
  out.emit(`${any} = false;`);
  const where =
    rest.length === 0
      ? null
      : rest.reduce((a, b): Expr => ({ k: "bin", op: "and", a, b }));
  const fl = fillLoop({ ...bnd, where }, scope, env, out);
  h.loops++;
  const inner = new Map(scope);
  inner.set(f, { code: fl.code, sort: { k: "fill" }, at: out.slot(h.loops) });
  for (const cond of [fl.rest, e.body]) {
    if (cond === null) continue;
    const v = compileExpr(cond, inner, env, out);
    expect(v, "bool", "exists fill");
    out.emit(`if (!(${v.code})) continue;`);
  }
  out.emit(`${last} = ${fl.arr};`);
  out.emit(`${any} = true;`);
  out.emit(`for (const ${x0} of ${fl.arr}) ${pj}[${x0}] |= 1 << ${fl.code}[${x0}];`);
  h.loops--;
  out.close();
  out.close();
  const x = once(compileExpr(pin.x, scope, env, out), out);
  expectElem(x, "cell", f);
  const t = once(compileExpr(pin.t, scope, env, out), out);
  expect(t, "num", f);
  const s = compileExpr(bnd.of, scope, env, out);
  // Off S, f(x) is -1, which only a t of -1 equals.
  return {
    code: `((((${pj}[${x.code}] >> ${t.code}) & 1) !== 0) || (${t.code} === -1 && ${any} && !${s.code}.includes(${x.code})))`,
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
  const projected = projection(e, scope, env, out);
  if (projected !== null) return projected;
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
      const probe: Env = { ...env, used: new Set(), scratch: null, hoist: null };
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
  if (partOf(fn, env)) {
    // A partition named as a function: the part holding a cell.
    if (args.length !== 1)
      throw new CompileError(`${fn} takes 1, given ${args.length}`);
    const c = compileExpr(args[0], scope, env, out);
    expectElem(c, "cell", fn);
    if (fn === env.boxes) return { code: `sp.boxOf[${c.code}]`, sort: elem("line") };
    env.readsClues.yes = true;
    return { code: `cl.${fn}.of[${c.code}]`, sort: elem(`region ${fn}`) };
  }
  const filling = scope.get(fn);
  if (filling?.sort.k === "fill") {
    if (args.length !== 1)
      throw new CompileError(`${fn} takes 1, given ${args.length}`);
    const x = compileExpr(args[0], scope, env, out);
    expectElem(x, "cell", fn);
    return { code: `${filling.code}[${x.code}]`, sort: NUM };
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
    case "cells": {
      arity(1);
      const s = vs[0].sort;
      if (s.k === "elem" && s.e.startsWith("region ")) {
        env.readsClues.yes = true;
        return {
          code: `cl.${s.e.slice("region ".length)}.cells[${vs[0].code}]`,
          sort: setOf(elem("cell")),
        };
      }
      if (s.k === "elem" && s.e === "corner")
        return { code: `sp.cornerCells[${vs[0].code}]`, sort: setOf(elem("cell")) };
      expectElem(vs[0], "line", fn);
      return { code: `sp.lineCells[${vs[0].code}]`, sort: setOf(elem("cell")) };
    }
    case "row":
    case "col":
      arity(1);
      return { code: `sp.${fn}Of[${cell(0)}]`, sort: elem("line") };
    case "peers":
    case "adj4":
      arity(1);
      return { code: `sp.${fn}[${cell(0)}]`, sort: setOf(elem("cell")) };
    case "sight":
      arity(1);
      expectElem(vs[0], "slot", fn);
      return { code: `sp.sight[${vs[0].code}]`, sort: setOf(elem("cell")) };
    case "opposite":
      arity(1);
      expectElem(vs[0], "slot", fn);
      return { code: `sp.opposite[${vs[0].code}]`, sort: elem("slot") };
    case "corners":
      arity(1);
      return { code: `sp.cellCorners[${cell(0)}]`, sort: setOf(elem("corner")) };
    case "across": {
      // A corner's diagonal pairs each sum to its first and last cells' sum.
      arity(2);
      expectElem(vs[0], "corner", fn);
      const k = once(vs[0], out);
      const cs = `sp.cornerCells[${k.code}]`;
      return { code: `(${cs}[0] + ${cs}[3] - ${cell(1)})`, sort: elem("cell") };
    }
    case "nth": {
      arity(2);
      const L = vs[0];
      if (!isArray(L.sort) || L.sort.k !== "set")
        throw new CompileError(`nth of ${show(L.sort)}: not an ordered set`);
      expect(vs[1], "num", fn);
      return { code: `(${L.code}[${vs[1].code}] ?? -1)`, sort: L.sort.of };
    }
    case "index":
    case "before": {
      arity(2);
      const [x, L] = vs;
      if (!isArray(L.sort) || L.sort.k !== "set" || !sameSort(x.sort, L.sort.of))
        throw new CompileError(`${fn}(${show(x.sort)}, ${show(L.sort)})`);
      if (fn === "before") {
        env.used.add("before");
        return { code: `before(${x.code}, ${L.code})`, sort: L.sort };
      }
      // A name bound by a loop over the same array is at the loop's counter,
      // and the space numbers its own elements in the order it lists them.
      if (x.pos?.arr === L.code) return { code: x.pos.i, sort: NUM };
      if (
        L.code === "sp.cells" ||
        L.code === "sp.slots" ||
        L.code === "sp.lines" ||
        L.code === "sp.corners"
      )
        return { code: x.code, sort: NUM };
      return { code: `${L.code}.indexOf(${x.code})`, sort: NUM };
    }
    case "x":
      arity(1);
      return { code: `(${cell(0)} % sp.w)`, sort: NUM };
    case "y":
      arity(1);
      return { code: `((${cell(0)} / sp.w) | 0)`, sort: NUM };
    case "cell":
      arity(2);
      expect(vs[0], "num", fn);
      expect(vs[1], "num", fn);
      return { code: `(${vs[1].code} * sp.w + ${vs[0].code})`, sort: elem("cell") };
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
    const h = env.hoist;
    def.params.forEach((p, i) => {
      const v = once(vs[i], out);
      // A parameter is a name the body may read early, from where it is
      // bound: a literal anywhere, the argument's own name from its slot.
      const at =
        h === null
          ? undefined
          : /^-?\d+$/.test(v.code)
            ? h.root
            : (v.at ?? out.slot(h.loops));
      inner.set(p, { ...v, at });
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
    { ...env, used: new Set(), scratch: null, hoist: null },
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
  const epoch = { used: false };
  const tenv: Env = {
    ...env,
    readsClues,
    memo: !onPlace,
    scratch,
    hoist: null,
    epoch: onPlace ? null : epoch,
  };
  if (t.binders.some((b) => b.kind === "fill"))
    throw new CompileError(`${t.id}: a filling binds in a quantifier, not a technique`);
  const sorts = binderSorts(t, tenv);
  const fields = sorts.map((s) => `  ${s.name}: ${tsType(s.sort)};`);
  const body = new Out(1);
  body.emit(`const facts = ${fnName}Facts;`);
  body.emit("let fired = 0;");
  body.emit("let changed = false;");
  // A solve makes each fact as it concludes it, so a placement would change
  // a `value` or `known` read before it; a strike changes neither.
  tenv.hoist = { root: body.slot(0), loops: 0, marks: !places(t.conclude, env) };
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
      if (epoch.used) body.emit("_epoch++;");
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
    const of = compileExpr(first.of, new Map(), { ...tenv, hoist: null }, new Out(0));
    if (!(of.sort.k === "set" && of.sort.of.k === "elem" && of.sort.of.e === "cell"))
      throw new CompileError(`${t.id}: its first binder is not over cells`);
    const sc = new Map<string, Val>([
      [
        first.name,
        { code: `v_${first.name}`, sort: elem("cell"), at: tenv.hoist.root },
      ],
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
  const clueParam = readsClues.yes ? "cl: Dealt, " : "";
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
    ...body.text(),
    "}",
  ];
  return { code: lines.join("\n"), clues: readsClues.yes };
}

/** Whether `e` makes a placement, in a definition it calls included. */
function places(e: Expr, env: Env): boolean {
  switch (e.k) {
    case "num":
    case "name":
      return false;
    case "set":
      return e.elems.some((x) => places(x, env));
    case "size":
    case "not":
    case "neg":
      return places(e.of, env);
    case "bin":
      return places(e.a, env) || places(e.b, env);
    case "quant":
      return (
        e.binders.some(
          (b) => places(b.of, env) || (b.where !== null && places(b.where, env)),
        ) || places(e.body, env)
      );
    case "agg":
      return (
        e.binders.some((b) => places(b.of, env)) ||
        (e.term !== null && places(e.term, env))
      );
    case "call": {
      if (e.fn === "place") return true;
      const def = env.defs.get(e.fn);
      return (
        e.args.some((x) => places(x, env)) ||
        (def !== undefined && places(def.body, env))
      );
    }
  }
}

// --- modules ----------------------------------------------------------------

/** What a module needs from the runtime, as an import line. */
function runtimeImport(
  used: ReadonlySet<string>,
  clues: boolean,
  regions: boolean,
  runtime: string,
): string {
  const names = [
    ...(clues ? ["type ClueList"] : []),
    "type Fire",
    "type GridSpace",
    "type Marks",
    ...(regions ? ["type Partition"] : []),
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
    regions: new Set(),
    boxes: null,
    diagonals: false,
    used,
    concluding: false,
    memo: false,
    scratch: null,
    readsClues: { yes: false },
    hoist: null,
    epoch: null,
  };
  const parts = Object.entries(lib.techniques).map(([id, stated]) => {
    const t: Technique = { ...parseTechnique(lib.library, id, stated), ...UNPLACED };
    const out = compileTechnique(t, env);
    if (out.clues)
      throw new CompileError(
        `${lib.library}.${id}: a library technique reads no clues`,
      );
    return out.code;
  });
  return `${[HEADER(source), "", runtimeImport(used, false, false, runtime), "", parts.join("\n\n")].join("\n")}\n`;
}

/** The sort of a clue kind's place and value, from its declaration. */
function clueSorts(kind: string, at: string, value: Expr, env: Env): ClueKind {
  const atSort: Sort =
    at === "edge" || at === "cell" || at === "line" || at === "slot" || at === "corner"
      ? elem(at)
      : env.regions.has(at)
        ? elem(`region ${at}`)
        : NUM;
  if (atSort.k === "num")
    throw new CompileError(`clue ${kind}: no element sort "${at}"`);
  // Compiled only for its sort, so what it would call is not imported.
  const v = compileExpr(
    value,
    new Map([["at", { code: "at", sort: atSort }]]),
    { ...env, used: new Set(), readsClues: { yes: false } },
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
  const d = loadDescription(withEveryVariation(json), libraries);
  const used = new Set<string>();
  const clues = new Map<string, ClueKind>();
  const { space } = d.json;
  const parts = Object.keys(space.regions ?? {});
  const unitParts = parts.filter((name) => space.units.includes(name));
  if (unitParts.length > 1)
    throw new CompileError(`${unitParts.join(", ")}: one partition among the units`);
  // A partition among the units is the space's boxes, dealt or not.
  const boxes = unitParts[0] ?? null;
  const regions = new Set(
    parts.filter((name) => name !== boxes && space.regions?.[name] === "dealt"),
  );
  for (const kind of d.clueKinds.keys())
    if (regions.has(kind))
      throw new CompileError(
        `${kind}: a partition and a clue kind are dealt by one name`,
      );
  const env: Env = {
    defs: d.defs,
    clues,
    regions,
    boxes,
    diagonals: space.diagonals === true,
    used,
    concluding: false,
    memo: false,
    scratch: null,
    readsClues: { yes: false },
    hoist: null,
    epoch: null,
  };
  for (const [kind, c] of d.clueKinds)
    clues.set(kind, clueSorts(kind, c.at, c.value, env));
  const own = d.techniques.filter((t) => !t.id.includes("."));
  const code = own.map((t) => compileTechnique(t, env).code);
  const scales = Object.entries(d.json.scales ?? {});
  const clueLines =
    clues.size + regions.size === 0
      ? []
      : [
          "/** What the board deals: its partitions by name, and its clues by kind. */",
          "export interface Dealt {",
          ...[...regions].map((r) => `  ${r}: Partition;`),
          ...[...clues.keys()].map((k) => `  ${k}: ClueList;`),
          "}",
          "",
        ];
  const ids = d.techniques.filter((t) => t.on === null).map((t) => t.id);
  const ladder = [
    "/** Every technique a rung runs, by id: the description's, in its order. */",
    `export type LadderId = ${ids.map((id) => JSON.stringify(id)).join(" | ")};`,
    "",
    "/** The ladder: each technique's tier, on its scale where that is not the",
    " * description's tiers, the least cap it runs at where that is above its",
    " * tier, and the cap from which it no longer runs where it has one, in the",
    " * order the description lists them. */",
    "export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number }[] = [",
    ...d.techniques
      .filter((t) => t.on === null)
      .map((t) => {
        const fields = [
          `id: ${JSON.stringify(t.id)}`,
          `tier: ${t.tier}`,
          ...(t.scale === null ? [] : [`scale: ${JSON.stringify(t.scale)}`]),
          ...(t.from === null ? [] : [`from: ${t.from}`]),
          ...(t.until === null ? [] : [`until: ${t.until}`]),
        ];
        return `  { ${fields.join(", ")} },`;
      }),
    "];",
    "",
    `/** The description's tiers, by name. */`,
    `export const tiers: readonly string[] = ${JSON.stringify(d.tiers)};`,
    ...(scales.length === 0
      ? []
      : [
          "",
          "/** Its other scales' tiers, by scale. */",
          `export const scales: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(Object.fromEntries(scales))};`,
        ]),
  ];
  return `${[
    HEADER(source),
    "",
    runtimeImport(used, clues.size > 0, regions.size > 0, runtime),
    "",
    ...clueLines,
    ...ladder,
    "",
    code.join("\n\n"),
  ].join("\n")}\n`;
}

export { CompileError };
