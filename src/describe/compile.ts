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
  cellMarkOf,
  type Definition,
  type ClueKind as DescribedClueKind,
  type Description,
  type DescriptionJson,
  edgeMarkOf,
  type LibraryJson,
  loadDescription,
  parseTechnique,
  type Technique,
  UNPLACED,
  withEveryVariation,
} from "./description.ts";
import { type Binder, type Expr, parse } from "./expr.ts";

/** A region's sort names its partition, as a clue's names its kind. */
type ElemSort =
  | "cell"
  | "face"
  | "line"
  | "edge"
  | "slot"
  | "corner"
  | "point"
  | "center"
  | "rect"
  | `clue ${string}`
  | `region ${string}`;

type Sort =
  | { k: "num" }
  /** An integer of a domain that is not finite, computed exactly: the
   * runtime's `Exact`, a double while it is a safe integer. */
  | { k: "int" }
  | { k: "bool" }
  | { k: "none" }
  | { k: "elem"; e: ElemSort }
  | { k: "set"; of: Sort }
  | { k: "subsets"; of: Sort }
  | { k: "clues"; kind: string }
  /** A filling's values, read `f(x)`: an array by cell, `-1` off its set. */
  | { k: "fill" };

const NUM: Sort = { k: "num" };
const INT: Sort = { k: "int" };
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
  /** For a name bound to each subset of an array: the array's code, the
   * loop's counter, whose bits name the members, and the slot ahead of the
   * loop. */
  members?: { els: string; k: string; pre: Slot };
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
  if (s.k === "int") return "number | bigint";
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

/** A clue kind's sorts. A clue at the board has no place or value of its
 * own (`none`), and its fields are read as functions of it. */
interface ClueKind {
  at: Sort;
  v: Sort;
  /** A clue at its element for each value, dealt at `perPlace(x, d)`. */
  per: boolean;
  /** A clue at the board's fields, by name: the element sort a field is one
   * of where it is one an element, and its values' sort. */
  fields: ReadonlyMap<string, { at: ElemSort | null; v: Sort }> | null;
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
  /** Whether the answer's domain is a cell's (it reads `c`), so `domain`
   * alone names nothing. */
  cellDomain: boolean;
  /** The description's sizes the grid does not give, which the board deals
   * where a technique reads one: those read, by name. */
  sizes: { names: ReadonlySet<string>; read: Set<string> };
  /** The runtime helpers the code calls, to import. */
  used: Set<string>;
  /** The declarations of the arrays a technique's comprehensions reuse, made
   * once a call; `null` outside a technique's body. */
  scratch: string[] | null;
  /** Whether `strike` and `place` may be called: in a conclusion only. */
  concluding: boolean;
  /** Where the code is the answer check, which reads a whole grid's values
   * (`g`) rather than the marks: whether the description has a repeated
   * value, which the check then reads with its count from the description
   * (`_repeat`, `_times`) rather than from the marks. `null` elsewhere. */
  answer: { repeats: boolean } | null;
  /** Where the code reads a planning game's position (`p`): its layers, each
   * read as a function of a cell, or of a face. `null` elsewhere. */
  position: ReadonlyMap<string, LayerSort> | null;
  /** The carried layer whose assignment is being compiled, the one place a
   * read of it is allowed; `null` elsewhere. */
  carrying: string | null;
  /** The tables the board deals, by name: a planning game's. */
  tables: ReadonlyMap<string, { of: Sort[]; to: Sort }>;
  /** Whether the space is a rectangle, with the geometry that reads one;
   * false on a board of cells alone. */
  geometry: boolean;
  /** The size counting the faces, a second sort of element, or `null` where
   * the space has none. */
  faces: string | null;
  /** What holds a value of the answer, which `known`, `value`, `cand`,
   * `place` and `strike` read: a cell, or an edge (Separate's walls). */
  answerSort: "cell" | "edge";
  /** Whether the function keeps each cell's candidates as it first reads
   * them (`cands`), until a firing it goes on from changes the marks. */
  memo: boolean;
  /** Set where a technique's body reads a cell's candidates through
   * `cands`, which it then keeps; absent outside a technique. */
  readsCands?: { yes: boolean };
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
  /** Where a planning game's function computes each definition that reads
   * itself once, ahead of its body: the statements, and the array of each
   * such definition's set, by name. `null` elsewhere. */
  prelude: Prelude | null;
  /** The relations the board deals, each a set of cells for each cell, read
   * `name(c)`: a planning game's. */
  relations: ReadonlySet<string>;
  /** The name of the mark the description keeps on each edge, read
   * `name(e)` as the values it may still hold, or `null` where it keeps
   * none. */
  edgeMark: string | null;
  /** The mark the description keeps on each cell naming a clue of `kind`,
   * read `name(c)` and made by `mark(c, q)`, or `null` where it keeps none. */
  cellMark: { name: string; kind: string } | null;
  /** The suppositions of the `with`s the code is inside, innermost first:
   * the names of the cell and of the value it is supposed to hold. */
  supposed: readonly { cell: string; value: string }[];
  /** The definitions a game's techniques keep for each argument, by name,
   * each compiled once as an exported function of the module
   * (`keptDefinition`); `null` where nothing is kept. */
  kept: {
    defs: Map<string, { sort: Sort; clues: boolean; board: boolean; code: string }>;
    /** The module's runtime helpers, which a function first compiled
     * inside a probe still needs. */
    used: Set<string>;
  } | null;
}

/** What a position's layer holds a value of (an element's, or the board's
 * one value), whether no rule reads it, and whether its domain is not
 * finite. */
interface LayerSort {
  readonly over: ElemSort | "board";
  readonly carried: boolean;
  readonly open: boolean;
}

interface Prelude {
  readonly out: Out;
  readonly fixed: Map<string, string>;
  /** The definition whose least fixed point is being compiled, and its
   * array, while its body is: a read of it inside is a read of the array. */
  fixing: { name: string; arr: string } | null;
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
  points: { code: "sp.points", sort: setOf(elem("point")) },
  centers: { code: "sp.centers", sort: setOf(elem("center")) },
  edges: { code: "sp.edges", sort: setOf(elem("edge")) },
  domain: { code: "b.domain", sort: setOf(NUM) },
  true: { code: "true", sort: BOOL },
  false: { code: "false", sort: BOOL },
  none: { code: "-1", sort: { k: "none" } },
};

/** What a board of cells alone has none of: the names and functions that
 * read a rectangle. */
const GEOMETRY = new Set([
  "rows",
  "cols",
  "lines",
  "units",
  "slots",
  "corners",
  "points",
  "centers",
  "opp",
  "edges",
  "slash",
  "linked",
  "through",
  "w",
  "h",
  "order",
  "row",
  "col",
  "peers",
  "adj4",
  "adj8",
  "ray",
  "step",
  "chain",
  "stretch",
  "connected",
  "cuts",
  "reaches",
  "beam",
  "ahead",
  "within",
  "on_grid",
  "units_of",
  "x",
  "y",
  "cell",
  "edge",
  "rects",
  "width",
  "height",
  "inner",
  "rim",
]);

function expect(v: Val, k: Sort["k"], what: string): void {
  if (v.sort.k !== k)
    throw new CompileError(`${what}: expected ${k}, got ${show(v.sort)}`);
}

function expectElem(v: Val, e: ElemSort, what: string): void {
  if (!(v.sort.k === "elem" && v.sort.e === e) && v.sort.k !== "none")
    throw new CompileError(`${what}: expected a ${e}, got ${show(v.sort)}`);
}

const isSetOf = (s: Sort, e: ElemSort): boolean =>
  s.k === "set" && s.of.k === "elem" && s.of.e === e;

/** The elements that hold the answer's values, as code: the space's cells,
 * or its edges. */
const answerSet = (env: Env): string =>
  env.answerSort === "edge" ? "sp.edges" : "sp.cells";
const answerCount = (env: Env): string => `${answerSet(env)}.length`;

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
function candOf(c: string, env: Env): string {
  if (env.readsCands) env.readsCands.yes = true;
  return `(cands[${c}] >= 0 ? cands[${c}] : (cands[${c}] = b.cand(${c})))`;
}

function compileExpr(e: Expr, scope: Scope, env: Env, out: Out): Val {
  if (env.hoist !== null && e.k !== "num" && e.k !== "name") {
    const v = hoisted(e, scope, env, env.hoist);
    if (v !== null) return v;
  }
  return compileNode(e, scope, env, out);
}

/** The functions a term may call and still be computed early: none reads
 * the candidates, binds a name, or makes a fact. Nor may one throw: a moved
 * term is computed whether or not the guard around it holds. */
const EARLY = new Set([
  "value",
  "known",
  "clue",
  "at",
  "per",
  "v",
  "stretch",
  "connected",
  "cuts",
  "reaches",
  "step",
  "chain",
  "slash",
  "linked",
  "through",
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
  "times",
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
        env.sizes.names.has(e.name) ||
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
    case "with":
      return false;
    case "call": {
      if (e.fn === "value" || e.fn === "known" || e.fn === "chain" || e.fn === "linked")
        marks.read = true;
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
      if (v.sort.k === "int") {
        env.used.add("isub");
        return { code: `isub(0, ${v.code})`, sort: INT };
      }
      expect(v, "num", "-");
      return { code: `-(${v.code})`, sort: NUM };
    }
    case "bin":
      return binary(e, scope, env, out);
    case "quant":
      return quantifier(e, scope, env, out);
    case "agg":
      return aggregate(e, scope, env, out);
    case "with":
      return supposing(e, scope, env, out);
    case "call":
      return call(e.fn, e.args, scope, env, out);
  }
}

/**
 * `with place(c, d): P`: `P` read on the marks with `c` holding `d`. Its
 * reads of the marks see the supposition (`env.supposed`), so none of them
 * is computed outside it, and nothing in it concludes.
 */
function supposing(
  e: Extract<Expr, { k: "with" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  if (env.answer !== null || env.position !== null)
    throw new CompileError(
      "with supposes a value on the marks, which only a technique reads",
    );
  const c = compileExpr(e.cell, scope, env, out);
  expectElem(c, env.answerSort, "with");
  const d = compileExpr(e.value, scope, env, out);
  expect(d, "num", "with");
  const cell = Out.fresh("_wc");
  const value = Out.fresh("_wd");
  out.emit(`const ${cell} = ${c.code};`);
  out.emit(`const ${value} = ${d.code};`);
  const inner: Env = {
    ...env,
    concluding: false,
    supposed: [{ cell, value }, ...env.supposed],
    hoist: env.hoist === null ? null : { ...env.hoist, marks: false },
  };
  const body = compileExpr(e.body, scope, inner, out);
  expect(body, "bool", "with");
  return body;
}

/** `known(c)`, `value(c)` or `cand(c)` of cell `c`: the grid's in the answer
 * check, the marks' in a technique, under the suppositions in force. */
function markRead(fn: "known" | "value" | "cand", c: Val, env: Env, out: Out): Val {
  if (env.answer) {
    if (fn === "cand")
      throw new CompileError("a rule reads the answer, never the marks");
    return fn === "known"
      ? { code: `(g[${c.code}] > 0)`, sort: BOOL }
      : { code: `(g[${c.code}] || -1)`, sort: NUM };
  }
  if (env.supposed.length === 0 && !(fn === "cand" && env.memo)) {
    const sort = fn === "known" ? BOOL : fn === "value" ? NUM : setOf(NUM);
    return { code: `b.${fn}(${c.code})`, sort };
  }
  const x = once(c, out).code;
  if (fn === "known")
    return { code: supposedRead(x, env, () => "true", `b.known(${x})`), sort: BOOL };
  if (fn === "value")
    return { code: supposedRead(x, env, (s) => s.value, `b.value(${x})`), sort: NUM };
  const plain = env.memo ? candOf(x, env) : `b.cand(${x})`;
  return {
    code: supposedRead(x, env, (s) => `(1 << ${s.value})`, plain),
    sort: setOf(NUM),
  };
}

/** A read of cell `x`'s marks under the suppositions in force, innermost
 * first: `held(s)` is the read where `x` is the supposed cell `s`. */
function supposedRead(
  x: string,
  env: Env,
  held: (s: { cell: string; value: string }) => string,
  plain: string,
): string {
  return env.supposed.reduceRight(
    (acc, s) => `(${x} === ${s.cell} ? ${held(s)} : ${acc})`,
    plain,
  );
}

/** Whether `fn` names a partition, which as a function gives a cell's part. */
const partOf = (fn: string, env: Env): boolean =>
  env.regions.has(fn) || fn === env.boxes;

function name(n: string, scope: Scope, env: Env, out: Out): Val {
  const bound = scope.get(n);
  if (bound !== undefined) return bound;
  if (n === "domain" && env.cellDomain)
    throw new CompileError("the domain is each cell's here: read a cell's candidates");
  if (n === "domain" && env.position !== null)
    throw new CompileError("a position has a domain a layer, read by the checker only");
  if (!env.geometry && GEOMETRY.has(n))
    throw new CompileError(`${n}: the board is cells alone, with no geometry`);
  const layer = env.position?.get(n);
  if (layer?.over === "board") return layerRead(n, layer, "0", env);
  if (n === "integers")
    throw new CompileError(
      "integers is a move's binder's set alone: it has no end to list",
    );
  const known = NAMES[n];
  if (known !== undefined) return known;
  if (n === "faces" && env.faces !== null) {
    env.sizes.read.add(env.faces);
    env.readsClues.yes = true;
    env.used.add("facesOf");
    return { code: `facesOf(cl.${env.faces})`, sort: setOf(elem("face")) };
  }
  const table = env.tables.get(n);
  if (table !== undefined && table.of.length === 0) {
    env.readsClues.yes = true;
    return { code: `cl.${n}`, sort: table.to };
  }
  if (env.regions.has(n)) {
    env.readsClues.yes = true;
    return { code: `cl.${n}.parts`, sort: setOf(elem(`region ${n}`)) };
  }
  if (n === env.boxes) return { code: "sp.boxes", sort: setOf(elem("line")) };
  if (n === "diagonals" && env.diagonals)
    return { code: "sp.diagonals", sort: setOf(elem("line")) };
  if (n === "order" || n === "w") return { code: "sp.w", sort: NUM };
  if (n === "h") return { code: "sp.h", sort: NUM };
  if (env.sizes.names.has(n)) {
    env.sizes.read.add(n);
    env.readsClues.yes = true;
    return { code: `cl.${n}`, sort: NUM };
  }
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
  // Typed, since a left side TypeScript has narrowed to `true` (a chain of
  // conclusions, each true once made) would type the name as `true`.
  out.emit(`let ${r}: boolean = ${left};`);
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
    expectElem(c, env.answerSort, "cand");
    const x = env.supposed.length === 0 ? c.code : once(c, out).code;
    const at = env.supposed.length === 0 ? d.code : once(d, out).code;
    const has = supposedRead(
      x,
      env,
      (s) => `${at} === ${s.value}`,
      `b.has(${x}, ${at})`,
    );
    return { code: op === "in" ? has : `!${has}`, sort: BOOL };
  }
  // `q in linked(k)` asks whether two points share a group, which the marks'
  // own groups answer without listing one.
  if (
    (op === "in" || op === "notin") &&
    e.b.k === "call" &&
    e.b.fn === "linked" &&
    e.b.args.length === 1 &&
    !env.answer &&
    env.supposed.length === 0
  ) {
    const q = compileExpr(e.a, scope, env, out);
    expectElem(q, "point", op);
    const k = compileExpr(e.b.args[0], scope, env, out);
    expectElem(k, "point", "linked");
    env.used.add("linkedWith");
    const code = `linkedWith(sp, b, ${q.code}, ${k.code})`;
    return { code: op === "in" ? code : `!${code}`, sort: BOOL };
  }
  const a = compileExpr(e.a, scope, env, out);
  // `c in cells(r)` of a rectangle a binder names compares the cell with its
  // sides, and no list of its cells is made.
  const named = e.b.k === "call" && e.b.fn === "cells" ? e.b.args[0] : undefined;
  const r = named?.k === "name" ? scope.get(named.name) : undefined;
  if ((op === "in" || op === "notin") && r?.sort.k === "elem" && r.sort.e === "rect") {
    expectElem(a, "cell", op);
    env.used.add("rectHolds");
    const code = `rectHolds(sp, ${r.code}, ${a.code})`;
    return { code: op === "in" ? code : `!${code}`, sort: BOOL };
  }
  const b = compileExpr(e.b, scope, env, out);
  if (a.sort.k === "int" || b.sort.k === "int") return exact(op, a, b, env);
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
      // A group of cells joined across a set of edges, read through the
      // groups joined where the set is bound, is one list each of its cells
      // reads: a cell is in it where its own group is that list, and no
      // list is walked.
      const group = /^(_eg\d+)\.of\(/.exec(setKey(b));
      if (group !== null) {
        const same = `(${group[1]}.of(${a.code}) === ${b.code})`;
        return { code: op === "in" ? same : `!${same}`, sort: BOOL };
      }
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

/** A side of an exact operation: a number of a finite domain is a safe
 * integer, so an exact one as it is. */
function exactSide(v: Val, op: string): string {
  if (v.sort.k !== "int") expect(v, "num", op);
  return v.code;
}

/** The runtime's exact arithmetic, by operator. */
const EXACT_OP = {
  "+": "iadd",
  "-": "isub",
  "*": "imul",
  "/": "idiv",
  mod: "imod",
} as const;

/**
 * An operation one side of which is an exact integer: the result of
 * arithmetic is one too. An exact value is a double exactly where it is a
 * safe integer, so `===` and `<` compare two of them, or one and a number,
 * as they are. `/` truncates and `mod` takes the dividend's sign, as on
 * numbers.
 */
function exact(op: Extract<Expr, { k: "bin" }>["op"], a: Val, b: Val, env: Env): Val {
  switch (op) {
    case "=":
    case "!=":
      return {
        code: `(${exactSide(a, op)} ${op === "=" ? "===" : "!=="} ${exactSide(b, op)})`,
        sort: BOOL,
      };
    case "<":
    case "<=":
    case ">":
    case ">=":
      return { code: `(${exactSide(a, op)} ${op} ${exactSide(b, op)})`, sort: BOOL };
    case "+":
    case "-":
    case "*":
    case "/":
    case "mod": {
      const fn = EXACT_OP[op];
      env.used.add(fn);
      return { code: `${fn}(${exactSide(a, op)}, ${exactSide(b, op)})`, sort: INT };
    }
    default:
      throw new CompileError(`${show(a.sort)} ${op} ${show(b.sort)}`);
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
  descending = false,
): void {
  const walk = (i: number, sc: Scope): void => {
    if (i === binders.length) {
      body(sc);
      return;
    }
    const bnd = binders[i];
    let v = `v_${bnd.name}`;
    // A definition's binder named as the variable an argument is held in
    // (`spots(y)`, its body binding `y` again) would capture it.
    const held = new RegExp(`\\b${v}\\b`);
    for (const [name, val] of sc)
      if (name !== bnd.name && held.test(val.code)) {
        v = Out.fresh(`${v}_`);
        break;
      }
    let closeBlock = false;
    let skip = "continue";
    let sort: Sort;
    let pos: Val["pos"];
    let members: Val["members"];
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
      const n = env.clues.get(kind)?.fields ? "n" : "at.length";
      out.open(`for (let ${v} = 0; ${v} < cl.${kind}.${n}; ${v}++) {`);
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
    } else if (
      bnd.of.k === "name" &&
      bnd.of.name === "cells" &&
      cluePin(bnd, sc, env)
    ) {
      // The cells whose clue holds one value, read off the clue list's
      // index: the where still reads each, so it says what it said.
      const pin = cluePin(bnd, sc, env) as { kind: string; value: Expr };
      const t = once(compileExpr(pin.value, sc, env, out), out);
      // `none`, an element with no clue, is indexed as `clueAt` reads it.
      if (t.sort.k !== "none") expect(t, "num", `clue(${pin.kind}, ${bnd.name})`);
      env.readsClues.yes = true;
      env.used.add("cluesValued");
      sort = elem("cell");
      const a = Out.fresh("_a");
      const ix = Out.fresh("_i");
      out.emit(`const ${a} = cluesValued(cl.${pin.kind}, ${t.code});`);
      out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
      out.emit(`const ${v} = ${a}[${ix}];`);
      pos = { arr: a, i: ix };
    } else if (bnd.of.k === "call" && bnd.of.fn === "range") {
      // Counted rather than read off a mask, which holds no number past 31
      // and none below 0: a position along a line of a large board.
      if (bnd.of.args.length !== 2) throw new CompileError("range takes 2");
      const [a, b] = bnd.of.args.map((x) => {
        const t = once(compileExpr(x, sc, env, out), out);
        expect(t, "num", "range");
        return t;
      });
      sort = NUM;
      out.open(
        descending
          ? `for (let ${v} = ${b.code}; ${v} >= ${a.code}; ${v}--) {`
          : `for (let ${v} = ${a.code}; ${v} <= ${b.code}; ${v}++) {`,
      );
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
        // Where a union over the subset's members is kept a member each
        // (`memberUnion`), what is kept is declared here, once a set.
        if (!isMask(of) && env.hoist !== null)
          members = { els, k, pre: out.slot(env.hoist.loops) };
        // Counted in binary with the set's last member as the lowest bit, so
        // the subsets of {1, 2, 3} come as {3}, {2}, {2, 3}, {1}, ...
        // A filter that opens on the subset's size is read off the counter,
        // before the subset is built (Mines' `count`, by its fewest numbers),
        // and a size it pins counts only the subsets of that size, in the
        // same order.
        const size = sizeTest(bnd.name, bnd.where);
        if (size?.op === "===") {
          const e = once(compileExpr(size.of, sc, env, out), out);
          expect(e, "num", `|${bnd.name}|`);
          env.used.add("nextOfSize");
          const n = Out.fresh("_n");
          out.emit(`const ${n} = 1 << ${els}.length;`);
          out.open(
            `for (let ${k} = ${e.code} > ${els}.length ? ${n} : (1 << ${e.code}) - 1; ${k} < ${n}; ${k} = ${e.code} === 0 ? ${n} : nextOfSize(${k})) {`,
          );
        } else out.open(`for (let ${k} = 0; ${k} < 1 << ${els}.length; ${k}++) {`);
        if (size !== null && size.op !== "===") {
          const e = compileExpr(size.of, sc, env, out);
          expect(e, "num", `|${bnd.name}|`);
          env.used.add("popcount");
          out.emit(`if (!(popcount(${k}) ${size.op} ${e.code})) continue;`);
        }
        if (isMask(of)) {
          out.emit(`let ${v} = 0;`);
          out.emit(
            `for (let ${j} = 0; ${j} < ${els}.length; ${j}++) if ((${k} >> (${els}.length - 1 - ${j})) & 1) ${v} |= 1 << ${els}[${j}];`,
          );
        } else {
          // The subset is read only until the next is counted, as a set
          // comprehension's array is (`aggregate`).
          if (env.scratch !== null) {
            const kept = Out.fresh("_g");
            env.scratch.push(`const ${kept}: number[] = [];`);
            out.emit(`const ${v} = ${kept};`);
            out.emit(`${v}.length = 0;`);
          } else out.emit(`const ${v}: number[] = [];`);
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
    const bound: Val = {
      code: v,
      sort,
      at: h === null ? undefined : out.slot(h.loops),
      ...(pos === undefined ? {} : { pos }),
      ...(members === undefined ? {} : { members }),
      ...(names === null ? {} : { names }),
    };
    inner.set(bnd.name, bound);
    if (where !== null) {
      const w = compileExpr(where, inner, env, out);
      expect(w, "bool", `where of ${bnd.name}`);
      out.emit(`if (!(${w.code})) ${skip};`);
      // What the rest reads of this name is computed past the filter, so a
      // binding it skips does not pay for it; what the filter computed is
      // shared.
      if (bound.at !== undefined && h !== null) {
        const after = out.slot(h.loops);
        after.made = bound.at.made;
        inner.set(bnd.name, { ...bound, at: after });
      }
    }
    walk(i + 1, inner);
    if (h !== null && loop) h.loops--;
    if (loop || closeBlock) out.close();
  };
  walk(0, scope);
}

/**
 * Where `bnd`, a binder over the cells, opens its where with `clue(kind, x)
 * = t` of a kind dealt once an element, `t` reading nothing `bnd` binds: the
 * kind and `t`, so the cells can be read off the clue list's index. A
 * definition is read as its body (Dominosa's `num(c) = a`).
 */
function cluePin(
  bnd: Binder,
  scope: Scope,
  env: Env,
): { kind: string; value: Expr } | null {
  if (bnd.kind !== "in" || bnd.where === null) return null;
  const [first] = fillConjuncts(bnd.where, scope, env);
  if (first === undefined || first.k !== "bin" || first.op !== "=") return null;
  const kindOf = (e: Expr): string | null => {
    const read = inlined(e, scope, env);
    if (read.k !== "call" || read.fn !== "clue" || read.args.length !== 2) return null;
    const [k, x] = read.args;
    if (k.k !== "name" || x.k !== "name" || x.name !== bnd.name) return null;
    const kind = env.clues.get(k.name);
    return kind === undefined || kind.per || kind.fields ? null : k.name;
  };
  for (const [side, other] of [
    [first.a, first.b],
    [first.b, first.a],
  ] as const) {
    const kind = kindOf(side);
    if (kind === null) continue;
    const reads = new Set<string>();
    freeNames(other, reads, new Set());
    if (!reads.has(bnd.name)) return { kind, value: other };
  }
  return null;
}

/** A call of a definition read as its body, its parameters replaced by the
 * arguments, until it is no such call. */
function inlined(e: Expr, scope: Scope, env: Env): Expr {
  const def = e.k === "call" && !scope.has(e.fn) ? env.defs.get(e.fn) : undefined;
  if (e.k !== "call" || def === undefined || def.params.length !== e.args.length)
    return e;
  const sub = new Map(def.params.map((p, i) => [p, e.args[i]] as const));
  const avoid = new Set<string>();
  for (const a of e.args) freeNames(a, avoid, new Set());
  return inlined(substitute(def.body, sub, avoid), scope, env);
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
    case "with":
      return { ...e, cell: go(e.cell), value: go(e.value), body: go(e.body) };
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
    case "with":
      return go(e.cell) && go(e.value) && go(e.body);
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
      // Each element still to be given a value adds at least the domain's
      // least and at most its greatest, so a sum that cannot come to `t`
      // either way is passed over; a product that does not divide `t` never
      // comes to it, while it is positive. The whole condition is read again
      // once the filling is.
      rest.push(c);
      const unless =
        total.unless === null
          ? null
          : once(compileExpr(total.unless, scope, env, out), out);
      if (unless !== null) expect(unless, "bool", "or");
      const t = once(compileExpr(total.t, scope, env, out), out);
      expect(t, "num", total.fn);
      const lo = Out.fresh("_lo");
      const hi = Out.fresh("_hi");
      if (total.fn === "sum") {
        out.emit(`const ${lo} = 31 - Math.clz32(b.domain & -b.domain);`);
        out.emit(`const ${hi} = 31 - Math.clz32(b.domain);`);
      }
      checks.push((o) => {
        const p = Out.fresh("_t");
        o.open(unless === null ? "{" : `if (!${unless.code}) {`);
        o.emit(`let ${p} = ${d};`);
        o.emit(
          `for (let ${j} = 0; ${j} < ${i}; ${j}++) ${p} ${total.fn === "sum" ? "+=" : "*="} ${fv}[${a}[${j}]];`,
        );
        if (total.fn === "sum") {
          const left = `(${a}.length - ${i} - 1)`;
          o.emit(`if (${p} + ${left} * ${lo} > ${t.code}) continue;`);
          o.emit(`if (${p} + ${left} * ${hi} < ${t.code}) continue;`);
        } else o.emit(`if (${p} > 0 && ${t.code} % ${p} !== 0) continue;`);
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
    bnd.from === undefined
      ? "b.domain"
      : supposedRead(
          e,
          env,
          (s) => `(1 << ${s.value})`,
          env.memo ? candOf(e, env) : `b.cand(${e})`,
        );
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

/** Where `where`'s first conjunct compares `|name|` with a term that does not
 * read `name`: the comparison, as TypeScript, and the term. */
function sizeTest(name: string, where: Expr | null): { op: string; of: Expr } | null {
  let first = where;
  while (first !== null && first.k === "bin" && first.op === "and") first = first.a;
  if (first === null || first.k !== "bin") return null;
  const ops: Readonly<Record<string, string>> = {
    "=": "===",
    "<=": "<=",
    "<": "<",
    ">=": ">=",
    ">": ">",
  };
  const op = ops[first.op];
  const { a, b } = first;
  if (op === undefined || a.k !== "size" || a.of.k !== "name" || a.of.name !== name)
    return null;
  return reads(b, name) ? null : { op, of: b };
}

function clueKindArg(args: readonly Expr[], env: Env): string {
  const a = args[0];
  if (args.length !== 1 || a.k !== "name" || !env.clues.has(a.name))
    throw new CompileError("clues(kind) names a clue kind of the description");
  return a.name;
}

/** The clue at the board's field named `fn`, with its kind, or `null`. */
function fieldOf(
  fn: string,
  env: Env,
): { kind: string; at: ElemSort | null; v: Sort } | null {
  for (const [kind, c] of env.clues) {
    const f = c.fields?.get(fn);
    if (f !== undefined) return { kind, ...f };
  }
  return null;
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
    case "with":
      return reads(e.cell, name) || reads(e.value, name) || reads(e.body, name);
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

/**
 * `exists x in cells(r): x in cells(s)` and `forall x in cells(r): x in
 * cells(s)` (or `not in`), `r` and `s` rectangles, as a comparison of their
 * sides: whether they meet, or one lies within the other. `null` where the
 * quantifier has another shape.
 */
function rectQuantifier(
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
  if (body.a.k !== "name" || body.a.name !== b.name) return null;
  const cellsOf = (x: Expr): Expr | null =>
    x.k === "call" &&
    x.fn === "cells" &&
    x.args.length === 1 &&
    !reads(x.args[0], b.name)
      ? x.args[0]
      : null;
  const re = cellsOf(b.of);
  const se = cellsOf(body.b);
  if (re === null || se === null) return null;
  const probe: Env = { ...env, used: new Set(), scratch: null, hoist: null };
  const isRect = (x: Expr): boolean => {
    const s = compileExpr(x, scope, probe, new Out(0)).sort;
    return s.k === "elem" && s.e === "rect";
  };
  if (!isRect(re) || !isRect(se)) return null;
  const r = compileExpr(re, scope, env, out);
  const s = compileExpr(se, scope, env, out);
  // Every cell of r in s is r within s; some is r meeting s; `not in`
  // turns each into the other's negation.
  const within = e.q === "forall" ? body.op === "in" : body.op === "notin";
  const fn = within ? "rectWithin" : "rectMeets";
  env.used.add(fn);
  const call = `${fn}(sp, ${r.code}, ${s.code})`;
  return { code: body.op === "notin" ? `!${call}` : call, sort: BOOL };
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
  const masked =
    setQuantifier(e, scope, env, out) ?? rectQuantifier(e, scope, env, out);
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

/** Whether an aggregate's one binder counts a range and its term is that
 * binder, so a `min` or a `max` is the first number that passes. */
function countedSelf(e: Extract<Expr, { k: "agg" }>): boolean {
  if (e.binders.length !== 1) return false;
  const [b] = e.binders;
  return (
    b.kind === "in" &&
    b.of.k === "call" &&
    b.of.fn === "range" &&
    (e.term === null || (e.term.k === "name" && e.term.name === b.name))
  );
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
      if (countedSelf(e)) {
        // Of the numbers a range counts, the first that passes from the end
        // the answer lies at is the answer: a position along a long line,
        // found without reading the rest of it.
        out.open(`${label}: {`);
        bindingLoops(
          e.binders,
          scope,
          env,
          out,
          (sc) => {
            out.emit(`${r} = ${name(last.name, sc, env, out).code};`);
            out.emit(`break ${label};`);
          },
          e.fn === "max",
        );
        out.close();
        break;
      }
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
      if (isMask(sort)) {
        out.emit(`let ${r} = 0;`);
        if (memberUnion(e, r, scope, env, out)) break;
      } else if (env.scratch !== null) {
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

/**
 * Whether `e` reads the marks only through `value` and `known`, which change
 * only as a value is placed, and makes no fact: so it holds while
 * `b.placed` stands. Its free names, those no binder of its own binds, are
 * added to `free`.
 */
function keptWhilePlaced(
  e: Expr,
  env: Env,
  free: Set<string>,
  own: ReadonlySet<string> = new Set(),
): boolean {
  const all = (xs: readonly (Expr | null)[], names = own): boolean =>
    xs.every((x) => x === null || keptWhilePlaced(x, env, free, names));
  const binders = (bs: readonly Binder[], rest: readonly (Expr | null)[]): boolean => {
    const names = new Set(own);
    for (const b of bs) {
      if (b.kind === "fill" || !all([b.of], names)) return false;
      names.add(b.name);
      if (!all([b.where], names)) return false;
    }
    return all(rest, names);
  };
  switch (e.k) {
    case "num":
      return true;
    case "name":
      if (!own.has(e.name)) free.add(e.name);
      return true;
    case "set":
      return all(e.elems);
    case "size":
    case "not":
    case "neg":
      return all([e.of]);
    case "bin":
      return all([e.a, e.b]);
    case "quant":
      return binders(e.binders, [e.body]);
    case "agg":
      return binders(e.binders, [e.where, e.term]);
    case "with":
      return false;
    case "call": {
      if (
        e.fn === "cand" ||
        e.fn === "place" ||
        e.fn === "strike" ||
        e.fn === "chain" ||
        e.fn === "linked" ||
        e.fn === env.edgeMark
      )
        return false;
      if (!all(e.fn === "clue" ? e.args.slice(1) : e.args)) return false;
      const def = env.defs.get(e.fn);
      return (
        def === undefined ||
        keptWhilePlaced(def.body, env, new Set(), new Set(def.params))
      );
    }
  }
}

/**
 * `set(t over x in T, …)` of numbers, `T` each subset of an array: the union
 * of each member's own set, which the rest of the comprehension makes from
 * the member alone. Each member's is kept ahead of the loop over the
 * subsets, made again once a value has been placed since, so a subset's is
 * an OR of its members'. The union goes into `r`; false where `e` is not of
 * that shape, and nothing is written.
 */
function memberUnion(
  e: Extract<Expr, { k: "agg" }>,
  r: string,
  scope: Scope,
  env: Env,
  out: Out,
): boolean {
  const [first, ...rest] = e.binders;
  if (
    env.hoist === null ||
    env.answer !== null ||
    env.supposed.length > 0 ||
    e.where !== null ||
    first.kind !== "in" ||
    first.of.k !== "name"
  )
    return false;
  const T = scope.get(first.of.name);
  const of = T?.sort;
  if (T?.members === undefined || of?.k !== "set") return false;
  const { els, k, pre } = T.members;
  const each: Extract<Expr, { k: "agg" }> = { ...e, binders: rest };
  const free = new Set<string>();
  const parts: (Expr | null)[] = [first.where, rest.length > 0 ? each : e.term];
  if (
    !parts.every(
      (p) => p === null || keptWhilePlaced(p, env, free, new Set([first.name])),
    )
  )
    return false;
  for (const n of free) {
    const v = scope.get(n);
    if (v !== undefined && (v.at === undefined || v.at.seq > pre.seq)) return false;
  }
  const kept = Out.fresh("_pm");
  const at = Out.fresh("_pp");
  pre.lines.push({ indent: 0, text: `const ${kept}: number[] = [];` });
  pre.lines.push({ indent: 0, text: `let ${at} = -1;` });
  const j = Out.fresh("_j");
  const x = Out.fresh("v_m");
  out.open(`if (${at} !== b.placed) {`);
  out.emit(`${at} = b.placed;`);
  out.open(`for (let ${j} = 0; ${j} < ${els}.length; ${j}++) {`);
  out.emit(`const ${x} = ${els}[${j}];`);
  const inner = new Map(scope).set(first.name, { code: x, sort: of.of });
  const flat: Env = { ...env, hoist: null };
  let mask: Val;
  if (rest.length > 0) mask = aggregate(each, inner, flat, out);
  else {
    const t = once(
      e.term === null
        ? name(first.name, inner, flat, out)
        : compileExpr(e.term, inner, flat, out),
      out,
    );
    expect(t, "num", "set");
    mask = { code: `(1 << ${t.code})`, sort: setOf(NUM) };
  }
  if (first.where !== null) {
    const w = compileExpr(first.where, inner, flat, out);
    expect(w, "bool", `where of ${first.name}`);
    out.emit(`${kept}[${j}] = ${w.code} ? ${mask.code} : 0;`);
  } else out.emit(`${kept}[${j}] = ${mask.code};`);
  out.close();
  out.close();
  out.emit(
    `for (let ${j} = 0; ${j} < ${els}.length; ${j}++) if ((${k} >> (${els}.length - 1 - ${j})) & 1) ${r} |= ${kept}[${j}];`,
  );
  return true;
}

/**
 * `latin(f, U)`: no value of `f` more often in a unit of `U` than `times`
 * allows it, which on a whole grid is each value exactly that often. A rule
 * of the answer, so read only by the answer check.
 */
function latin(args: readonly Expr[], scope: Scope, env: Env, out: Out): Val {
  const [f, units] = args;
  if (!env.answer) throw new CompileError("latin(f, U) is a rule of the answer");
  if (args.length !== 2 || f.k !== "name")
    throw new CompileError("latin(f, U) names an answer function and a set of units");
  const U = compileExpr(units, scope, env, out);
  if (U.sort.k !== "set" || U.sort.of.k !== "elem")
    throw new CompileError(`latin over ${show(U.sort)}`);
  const r = Out.fresh("_q");
  const label = Out.fresh("Q");
  const u = Out.fresh("_u");
  const c = Out.fresh("_c");
  const seen = Out.fresh("_n");
  out.emit(`let ${r} = true;`);
  // A value is a bit of a 32-bit mask, so fewer than 32.
  out.emit(`const ${seen} = new Int32Array(32);`);
  out.open(`${label}: for (const ${u} of ${U.code}) {`);
  out.emit(`${seen}.fill(0);`);
  const cells = call(
    "cells",
    [{ k: "name", name: "$u" }],
    new Map([...scope, ["$u", { code: u, sort: U.sort.of }]]),
    env,
    out,
  );
  out.open(`for (const ${c} of ${cells.code}) {`);
  const v = once(
    call(
      f.name,
      [{ k: "name", name: "$c" }],
      new Map([["$c", { code: c, sort: elem("cell") }]]),
      env,
      out,
    ),
    out,
  );
  expect(v, "num", "latin");
  out.open(`if (++${seen}[${v.code}] > ${timesOf(v.code, env)}) {`);
  out.emit(`${r} = false;`);
  out.emit(`break ${label};`);
  out.close();
  out.close();
  out.close();
  return { code: r, sort: BOOL };
}

/** `times(d)` in the answer check: the description's count for its repeated
 * value, 1 for every other. */
const timesOf = (d: string, env: Env): string =>
  env.answer === null
    ? `(${d} === b.repeat ? b.times : 1)`
    : env.answer.repeats
      ? `(${d} === _repeat ? _times : 1)`
      : "1";

/** Layer `fn`'s value at place `at`: exact where its domain is not finite,
 * which a layer holds as a safe integer (`held`). */
function layerRead(fn: string, layer: LayerSort, at: string, env: Env): Val {
  if (layer.carried && env.carrying !== fn)
    throw new CompileError(
      `${fn} is carried: no rule reads it, but its own assignment`,
    );
  const code = `p.${fn}[${at}]`;
  return { code, sort: layer.open ? INT : NUM };
}

/** `at(k)`, `v(k)` or `per(k)` of a clue `k`: a clue per value sits at its
 * element and the value both. */
function clueField(fn: string, k: Val, env: Env): Val {
  if (k.sort.k !== "elem" || !k.sort.e.startsWith("clue "))
    throw new CompileError(`${fn} of ${show(k.sort)}: not a clue`);
  const kind = k.sort.e.slice("clue ".length);
  const decl = env.clues.get(kind) as ClueKind;
  if (decl.fields)
    throw new CompileError(`${fn} of a clue at the board: read its fields`);
  env.readsClues.yes = true;
  const code = `cl.${kind}.${fn === "v" ? "v" : "at"}[${k.code}]`;
  if (fn === "v") return { code, sort: decl.v };
  if (fn === "per" && !decl.per)
    throw new CompileError(`per of a ${kind} clue: it is one an element`);
  if (!decl.per) return { code, sort: decl.at };
  const read = fn === "at" ? "perElement" : "perValue";
  env.used.add(read);
  return { code: `${read}(${code})`, sort: fn === "at" ? decl.at : NUM };
}

/**
 * The readings of a rectangle on the grid, its arguments compiled: the ones
 * holding a cell, and a rectangle's cells, width, height, the edges inside it
 * and the edges round it. `null` for any other function, and for `cells` of
 * anything else.
 */
function rectCall(fn: string, vs: readonly Val[], env: Env): Val | null {
  const arity = (n: number): void => {
    if (vs.length !== n) throw new CompileError(`${fn} takes ${n}, given ${vs.length}`);
  };
  const isRect = (v?: Val): boolean => v?.sort.k === "elem" && v.sort.e === "rect";
  switch (fn) {
    case "cells":
      if (!isRect(vs[0])) return null;
      arity(1);
      env.used.add("rectCells");
      return { code: `rectCells(sp, ${vs[0].code})`, sort: setOf(elem("cell")) };
    case "rects":
      // The rectangles on the grid holding a cell, of a number of cells or,
      // where it is 0, of any.
      arity(2);
      expectElem(vs[0], "cell", fn);
      expect(vs[1], "num", fn);
      env.used.add("rectsOf");
      return {
        code: `rectsOf(sp, ${vs[0].code}, ${vs[1].code})`,
        sort: setOf(elem("rect")),
      };
    case "width":
    case "height":
    case "inner":
    case "rim": {
      arity(1);
      expectElem(vs[0], "rect", fn);
      const f = `rect${fn[0].toUpperCase()}${fn.slice(1)}`;
      env.used.add(f);
      return {
        code: `${f}(sp, ${vs[0].code})`,
        sort: fn === "width" || fn === "height" ? NUM : setOf(elem("edge")),
      };
    }
    default:
      return null;
  }
}

/**
 * The readings of a board of diagonals (Slant's), its arguments compiled:
 * the mark on the edges, the squares round a point and a square's corners,
 * which way a diagonal runs
 * through one, the points the diagonals join, and the cells joined across a
 * set of edges. `null` for any other function.
 */
function diagonalCall(fn: string, vs: readonly Val[], env: Env): Val | null {
  const arity = (n: number): void => {
    if (vs.length !== n) throw new CompileError(`${fn} takes ${n}, given ${vs.length}`);
  };
  const cell = (i: number): string => {
    expectElem(vs[i], "cell", fn);
    return vs[i].code;
  };
  // The mark on an edge, which only a technique reads.
  if (fn === env.edgeMark) {
    arity(1);
    if (env.answer) throw new CompileError("a rule reads the answer, never the marks");
    expectElem(vs[0], "edge", fn);
    return { code: `b.edgeCand(${vs[0].code})`, sort: setOf(NUM) };
  }
  switch (fn) {
    case "cells": {
      // The squares round a point; any other `cells` is not this board's.
      const s = vs[0]?.sort;
      if (s?.k !== "elem" || s.e !== "point") return null;
      arity(1);
      return { code: `sp.pointCells[${vs[0].code}]`, sort: setOf(elem("cell")) };
    }
    case "points":
      arity(1);
      return { code: `sp.cellPoints[${cell(0)}]`, sort: setOf(elem("point")) };
    case "slash":
      arity(2);
      expectElem(vs[1], "point", fn);
      env.used.add("slash");
      return { code: `slash(sp, ${cell(0)}, ${vs[1].code})`, sort: NUM };
    case "linked": {
      arity(1);
      expectElem(vs[0], "point", fn);
      // The marks' own groups, kept while no value is placed, where nothing
      // is supposed.
      if (!env.answer && env.supposed.length === 0) {
        env.used.add("linkedOf");
        return { code: `linkedOf(sp, b, ${vs[0].code})`, sort: setOf(elem("point")) };
      }
      // A cell's value read as the technique reads it, under any `with`.
      const x = Out.fresh("_x");
      const read = markRead("value", { code: x, sort: elem("cell") }, env, new Out(0));
      // The answer check reads one grid, so its groups are joined once a
      // check, not walked from each point.
      if (env.answer && env.supposed.length === 0 && env.scratch !== null) {
        if (!env.scratch.some((s) => s.startsWith("const _links ")))
          env.scratch.push(
            `const _links = pointGroups(sp, (${x}: number) => ${read.code});`,
          );
        env.used.add("pointGroups");
        return { code: `_links.of(${vs[0].code})`, sort: setOf(elem("point")) };
      }
      env.used.add("linked");
      return {
        code: `linked(sp, (${x}: number) => ${read.code}, ${vs[0].code})`,
        sort: setOf(elem("point")),
      };
    }
    case "through": {
      arity(2);
      const E = vs[1];
      if (!isSetOf(E.sort, "edge"))
        throw new CompileError(
          `through(c, E): E is a set of edges, not ${show(E.sort)}`,
        );
      // A set of edges a binder names is joined into groups once where it
      // is bound, so each square's is a lookup, not a walk over the set.
      if (E.at !== undefined && env.hoist !== null) {
        const key = `edgeGroups(sp, ${E.code})`;
        let groups = E.at.made.get(key);
        if (groups === undefined) {
          const t = Out.fresh("_eg");
          E.at.lines.push({ indent: 0, text: `const ${t} = ${key};` });
          groups = { code: t, sort: E.sort, at: E.at };
          E.at.made.set(key, groups);
        }
        env.used.add("edgeGroups");
        return { code: `${groups.code}.of(${cell(0)})`, sort: setOf(elem("cell")) };
      }
      env.used.add("through");
      return { code: `through(sp, ${cell(0)}, ${E.code})`, sort: setOf(elem("cell")) };
    }
  }
  return null;
}

/**
 * The readings of a board turned about its centers (Galaxies'), its
 * arguments compiled: the squares round a center, the square one turns to
 * about it, and the mark naming a clue each cell may hold, read `name(c)`
 * and made by `mark(c, q)`. `null` for any other function.
 */
function centerCall(fn: string, vs: readonly Val[], env: Env, out: Out): Val | null {
  const arity = (n: number): void => {
    if (vs.length !== n) throw new CompileError(`${fn} takes ${n}, given ${vs.length}`);
  };
  const mark = env.cellMark;
  if (mark !== null && fn === mark.name) {
    arity(1);
    if (env.answer) throw new CompileError("a rule reads the answer, never the marks");
    expectElem(vs[0], "cell", fn);
    return { code: `b.markOf(${vs[0].code})`, sort: elem(`clue ${mark.kind}`) };
  }
  switch (fn) {
    case "cells": {
      const s = vs[0]?.sort;
      if (s?.k !== "elem" || s.e !== "center") return null;
      arity(1);
      return { code: `sp.centerCells[${vs[0].code}]`, sort: setOf(elem("cell")) };
    }
    case "opp":
      arity(2);
      expectElem(vs[0], "cell", fn);
      expectElem(vs[1], "center", fn);
      env.used.add("opp");
      return { code: `opp(sp, ${vs[0].code}, ${vs[1].code})`, sort: elem("cell") };
    case "mark": {
      if (mark === null) throw new CompileError("mark(c, q): no mark names a clue");
      if (!env.concluding) throw new CompileError(`${fn} outside a conclusion`);
      arity(2);
      expectElem(vs[0], "cell", fn);
      expectElem(vs[1], `clue ${mark.kind}`, fn);
      const c = once(vs[0], out);
      const q = once(vs[1], out);
      // A cell off the grid, or one naming another clue, cannot name this
      // one: the conclusion is false. One naming it already is no fact.
      const t = Out.fresh("_mk");
      out.emit(`let ${t} = ${c.code} >= 0;`);
      out.emit(
        `if (${t}) { const _was = b.markOf(${c.code}); if (_was >= 0) ${t} = _was === ${q.code}; else if (fire === null) { b.markAt(${c.code}, ${q.code}); changed = true; } else facts.push(MARK, ${c.code}, ${q.code}); }`,
      );
      env.used.add("MARK");
      return { code: t, sort: BOOL };
    }
    default:
      return null;
  }
}

/** `strike(e, d)` of an edge's mark, which is only ever narrowed. */
function edgeStrike(fn: string, vs: readonly Val[], env: Env, out: Out): Val {
  if (fn === "place" || env.edgeMark === null)
    throw new CompileError(`${fn}(e, d): only a strike from an edge's mark`);
  const e = once(vs[0], out);
  expect(vs[1], "num", fn);
  const d = once(vs[1], out);
  out.emit(
    `if ((b.edgeCand(${e.code}) >> ${d.code}) & 1) { if (fire === null) { b.edgeStrikeAt(${e.code}, ${d.code}); changed = true; } else facts.push(STRIKE_EDGE, ${e.code}, ${d.code}); }`,
  );
  env.used.add("STRIKE_EDGE");
  return { code: "true", sort: BOOL };
}

/**
 * `through(c, {e in edges where P})`, its set stated in place rather than
 * bound: a walk from `c` that asks `P` of each edge it meets
 * (`throughWhere`), never the set of every edge. `null` for any other
 * `through`.
 */
function throughStated(
  args: readonly Expr[],
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  const set = inlined(args[1], scope, env);
  if (set.k !== "agg" || set.fn !== "set" || set.where !== null) return null;
  const [bnd, ...more] = set.binders;
  if (bnd === undefined || more.length > 0 || bnd.kind !== "in") return null;
  if (bnd.of.k !== "name" || bnd.of.name !== "edges" || scope.has("edges")) return null;
  if (set.term?.k !== "name" || set.term.name !== bnd.name) return null;
  const c = compileExpr(args[0], scope, env, out);
  expectElem(c, "cell", "through");
  const e = Out.fresh("_te");
  const inner = new Map(scope);
  inner.set(bnd.name, { code: e, sort: elem("edge") });
  const body = new Out(0);
  // Asked once an edge met, so nothing in it is moved out of the walk.
  const test =
    bnd.where === null
      ? { code: "true", sort: BOOL }
      : compileExpr(bnd.where, inner, { ...env, hoist: null }, body);
  expect(test, "bool", "through's set");
  const lines = body.text().join(" ");
  env.used.add("throughWhere");
  return {
    code: `throughWhere(sp, ${c.code}, (${e}: number): boolean => { ${lines} return ${test.code}; })`,
    sort: setOf(elem("cell")),
  };
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
  if (fn === "latin") return latin(args, scope, env, out);
  const layer = env.position?.get(fn);
  if (layer !== undefined) {
    // A layer of the position, read at a cell, or at a face.
    if (layer.over === "board")
      throw new CompileError(`${fn} is the board's one value, read by its name`);
    if (args.length !== 1)
      throw new CompileError(`${fn} takes 1, given ${args.length}`);
    const c = compileExpr(args[0], scope, env, out);
    expectElem(c, layer.over, fn);
    return layerRead(fn, layer, c.code, env);
  }
  const table = env.tables.get(fn);
  if (table !== undefined) {
    if (args.length !== table.of.length)
      throw new CompileError(`${fn} takes ${table.of.length}, given ${args.length}`);
    env.readsClues.yes = true;
    let code = `cl.${fn}`;
    args.forEach((a, i) => {
      const v = compileExpr(a, scope, env, out);
      const want = table.of[i];
      if (want.k === "num") expect(v, "num", fn);
      else if (want.k === "elem") expectElem(v, want.e, fn);
      code += `[${v.code}]`;
    });
    return { code, sort: table.to };
  }
  if (!env.geometry && GEOMETRY.has(fn))
    throw new CompileError(`${fn}: the board is cells alone, with no geometry`);
  if (env.position !== null && (fn === "value" || fn === "known" || fn === "cand"))
    throw new CompileError(`${fn}: a position is read by its layers`);
  if (fn === "clue") {
    const a = args[0];
    if (a.k !== "name" || !env.clues.has(a.name))
      throw new CompileError("clue(kind, x) names a clue kind of the description");
    const kind = env.clues.get(a.name) as ClueKind;
    if (kind.fields)
      throw new CompileError(`clue(${a.name}, x): a clue at the board sits at nothing`);
    if (args.length !== (kind.per ? 3 : 2))
      throw new CompileError(
        kind.per ? `clue(${a.name}, x, d): one a value` : `clue(${a.name}, x)`,
      );
    const x = compileExpr(args[1], scope, env, out);
    if (!sameSort(x.sort, kind.at))
      throw new CompileError(`clue(${a.name}, ${show(x.sort)})`);
    env.readsClues.yes = true;
    env.used.add("clueAt");
    if (!kind.per) return { code: `clueAt(cl.${a.name}, ${x.code})`, sort: kind.v };
    const d = compileExpr(args[2], scope, env, out);
    expect(d, "num", "clue");
    env.used.add("perPlace");
    const place = `(${x.code} < 0 ? -1 : perPlace(${x.code}, ${d.code}))`;
    return { code: `clueAt(cl.${a.name}, ${place})`, sort: kind.v };
  }
  const field = fieldOf(fn, env);
  if (field !== null) {
    // A clue at the board's field, read of the clue, and of an element
    // where it is one an element.
    const want = field.at === null ? 1 : 2;
    if (args.length !== want)
      throw new CompileError(`${fn} takes ${want}, given ${args.length}`);
    const k = compileExpr(args[0], scope, env, out);
    expectElem(k, `clue ${field.kind}`, fn);
    env.readsClues.yes = true;
    let code = `cl.${field.kind}.${fn}[${k.code}]`;
    if (field.at !== null) {
      const x = compileExpr(args[1], scope, env, out);
      expectElem(x, field.at, fn);
      code += `[${x.code}]`;
    }
    return { code, sort: field.v };
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
  if (env.relations.has(fn)) {
    if (args.length !== 1)
      throw new CompileError(`${fn} takes 1, given ${args.length}`);
    const c = compileExpr(args[0], scope, env, out);
    expectElem(c, "cell", fn);
    env.readsClues.yes = true;
    return { code: `cl.${fn}[${c.code}]`, sort: setOf(elem("cell")) };
  }
  const filling = scope.get(fn);
  if (filling?.sort.k === "fill") {
    if (args.length !== 1)
      throw new CompileError(`${fn} takes 1, given ${args.length}`);
    const x = compileExpr(args[0], scope, env, out);
    expectElem(x, "cell", fn);
    return { code: `${filling.code}[${x.code}]`, sort: NUM };
  }
  if (fn === "through" && args.length === 2) {
    const walked = throughStated(args, scope, env, out);
    if (walked !== null) return walked;
  }
  const vs = args.map((x) => compileExpr(x, scope, env, out));
  const arity = (n: number): void => {
    if (vs.length !== n) throw new CompileError(`${fn} takes ${n}, given ${vs.length}`);
  };
  const cell = (i: number): string => {
    expectElem(vs[i], "cell", fn);
    return vs[i].code;
  };
  const shaped =
    diagonalCall(fn, vs, env) ?? rectCall(fn, vs, env) ?? centerCall(fn, vs, env, out);
  if (shaped !== null) return shaped;
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
    case "adj8":
      arity(1);
      return { code: `sp.${fn}[${cell(0)}]`, sort: setOf(elem("cell")) };
    case "ray":
      arity(2);
      env.used.add("ray");
      return { code: `ray(sp, ${cell(0)}, ${cell(1)})`, sort: setOf(elem("cell")) };
    case "step":
      arity(2);
      expect(vs[1], "num", fn);
      env.used.add("step");
      return { code: `step(sp, ${cell(0)}, ${vs[1].code})`, sort: elem("cell") };
    case "chain": {
      // A cell's value read as the technique reads it, under any `with`.
      arity(1);
      const x = Out.fresh("_x");
      const read = markRead("value", { code: x, sort: elem("cell") }, env, new Out(0));
      env.used.add("chain");
      return {
        code: `chain(sp, (${x}: number) => ${read.code}, ${cell(0)})`,
        sort: setOf(elem("cell")),
      };
    }
    case "beam": {
      if (vs.length !== 1 && vs.length !== 3)
        throw new CompileError(`beam takes 1 or 3, given ${vs.length}`);
      expectElem(vs[0], "slot", fn);
      if (env.supposed.length > 0)
        throw new CompileError("a beam is not read under with");
      if (env.answer) {
        if (vs.length === 3) throw new CompileError("a rule reads beam(s) alone");
        env.used.add("beamOf");
        return { code: `beamOf(sp, g, ${vs[0].code})`, sort: NUM };
      }
      env.used.add("beam");
      if (vs.length === 1) return { code: `beam(sp, b, ${vs[0].code})`, sort: NUM };
      expect(vs[2], "num", fn);
      return {
        code: `beam(sp, b, ${vs[0].code}, ${cell(1)}, ${vs[2].code})`,
        sort: NUM,
      };
    }
    case "ahead":
      arity(1);
      expectElem(vs[0], "slot", fn);
      if (env.answer)
        throw new CompileError("a rule reads the answer, never the marks");
      if (env.supposed.length > 0)
        throw new CompileError("a beam is not read under with");
      env.used.add("ahead");
      return { code: `ahead(sp, b, ${vs[0].code})`, sort: elem("cell") };
    case "within":
      arity(2);
      expect(vs[1], "num", fn);
      env.used.add("within");
      return {
        code: `within(sp, ${cell(0)}, ${vs[1].code})`,
        sort: setOf(elem("cell")),
      };
    case "on_grid": {
      arity(2);
      expect(vs[0], "num", fn);
      expect(vs[1], "num", fn);
      const x = once(vs[0], out);
      const y = once(vs[1], out);
      return {
        code: `(${x.code} >= 0 && ${x.code} < sp.w && ${y.code} >= 0 && ${y.code} < sp.h)`,
        sort: BOOL,
      };
    }
    case "units_of":
      arity(1);
      return { code: `sp.unitsOf[${cell(0)}]`, sort: setOf(elem("line")) };
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
    case "stretch": {
      // The maximal run of S along L that holds c.
      arity(3);
      expectElem(vs[0], "line", fn);
      const S = vs[2];
      if (!isSetOf(S.sort, "cell"))
        throw new CompileError(`stretch(L, c, ${show(S.sort)}): S is a set of cells`);
      env.used.add("stretch");
      return {
        code: `stretch(sp.lineCells[${vs[0].code}], ${cell(1)}, ${S.code})`,
        sort: setOf(elem("cell")),
      };
    }
    case "connected":
    case "cuts": {
      // Whether the cells S are one group side by side, and the members
      // without which the rest are not.
      arity(1);
      const S = vs[0];
      if (!isSetOf(S.sort, "cell"))
        throw new CompileError(`${fn}(${show(S.sort)}): S is a set of cells`);
      env.used.add(fn);
      return {
        code: `${fn}(sp, ${S.code})`,
        sort: fn === "connected" ? BOOL : setOf(elem("cell")),
      };
    }
    case "reaches": {
      // How many members of S square c reaches through members side by
      // side once t is taken out.
      arity(3);
      const S = vs[1];
      if (!isSetOf(S.sort, "cell"))
        throw new CompileError(`reaches(c, ${show(S.sort)}, t): S is a set of cells`);
      env.used.add("reaches");
      return { code: `reaches(sp, ${cell(0)}, ${S.code}, ${cell(2)})`, sort: NUM };
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
        L.code === "sp.corners" ||
        L.code === "sp.points" ||
        L.code === "sp.edges" ||
        L.code.startsWith("facesOf(")
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
    case "value":
    case "cand":
      arity(1);
      expectElem(vs[0], env.answerSort, fn);
      return markRead(fn, vs[0], env, out);
    case "abs":
      arity(1);
      expect(vs[0], "num", fn);
      return { code: `Math.abs(${vs[0].code})`, sort: NUM };
    case "times":
      arity(1);
      expect(vs[0], "num", fn);
      return { code: timesOf(vs[0].code, env), sort: NUM };
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
    case "per":
    case "v":
      arity(1);
      return clueField(fn, vs[0], env);
    case "strike":
    case "place": {
      if (!env.concluding) throw new CompileError(`${fn} outside a conclusion`);
      arity(2);
      if (
        vs[0].sort.k === "elem" &&
        vs[0].sort.e === "edge" &&
        env.answerSort !== "edge"
      )
        return edgeStrike(fn, vs, env, out);
      expectElem(vs[0], env.answerSort, fn);
      const c = once(vs[0], out);
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
  if (def !== undefined) return definitionCall(fn, def, args, vs, env, out);
  throw new CompileError(`unknown function "${fn}"`);
}

/** A call of a definition the description makes, its arguments compiled. */
function definitionCall(
  fn: string,
  def: Definition,
  args: readonly Expr[],
  vs: readonly Val[],
  env: Env,
  out: Out,
): Val {
  if (def.params.length !== vs.length)
    throw new CompileError(`${fn} takes ${def.params.length}, given ${vs.length}`);
  const fixing = env.prelude?.fixing ?? null;
  const last = vs.length - 1;
  if (fixing?.name === fn) {
    // A self read passes the parameters before the last through as they
    // are, so it reads the set being computed.
    args.slice(0, last).forEach((a, i) => {
      if (!(a.k === "name" && a.name === def.params[i]))
        throw new CompileError(
          `${fn} reads itself with ${def.params[i]} changed: its fixed point is in ${def.params[last]} alone`,
        );
    });
    expectElem(vs[last], "cell", fn);
    return { code: `(${fixing.arr}[${vs[last].code}] === 1)`, sort: BOOL };
  }
  if (mentions(def.body, fn, env.defs, new Set())) {
    expectElem(vs[last], "cell", fn);
    const fixed = fixedPoint(fn, def, vs.slice(0, last), env);
    const at =
      last === 0
        ? fixed
        : `${fixed}(${vs
            .slice(0, last)
            .map((v) => v.code)
            .join(", ")})`;
    return { code: `(${at}[${vs[last].code}] === 1)`, sort: BOOL };
  }
  const kept = keptDefinition(fn, def, vs, env);
  if (kept !== null) return kept;
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

/**
 * A definition of one element whose set of elements a technique reads, kept
 * for each element while no value is placed in the marks (`keptOf`): Rect's
 * `fits(q)` is read for every other clue inside loops over the clues, and
 * kept, it is made once a clue between placements and shared by every rung.
 * Only one that reads the marks through `value` and `known` alone, and no
 * name of the technique, is kept. `null` where the definition is not one.
 */
function keptDefinition(
  fn: string,
  def: Definition,
  vs: readonly Val[],
  env: Env,
): Val | null {
  const { kept } = env;
  if (
    kept === null ||
    env.answer !== null ||
    env.position !== null ||
    env.supposed.length > 0 ||
    def.params.length !== 1 ||
    vs[0].sort.k !== "elem" ||
    loopDepth(def.body, env.defs) < 2 ||
    !keptWhilePlaced(def.body, env, new Set(), new Set(def.params))
  )
    return null;
  let made = kept.defs.get(fn);
  if (made === undefined) {
    // Compiled once, as a function of its own: only a set of elements is
    // kept, since a number or a mask costs less to make again than to look
    // up.
    const v = `v_${def.params[0]}`;
    const readsClues = { yes: false };
    const body = new Out(1);
    const val = compileExpr(
      def.body,
      new Map([[def.params[0], { code: v, sort: vs[0].sort }]]),
      // Its own arrays, not a technique's reused ones: each is kept.
      {
        ...env,
        used: kept.used,
        readsClues,
        scratch: null,
        hoist: null,
        concluding: false,
        memo: false,
        epoch: null,
      },
      body,
    );
    if (!isArray(val.sort)) return null;
    const type = tsType(val.sort);
    // One that reads no marks is the board's, kept for as long as it is.
    const board = !readsMarks(
      def.body,
      env.defs,
      new Set(),
      env.cellMark?.name ?? null,
    );
    kept.used.add("keptStore");
    kept.used.add("type Kept");
    const store = `${fn}Kept`;
    const keptAt = board
      ? `${store}.board(${readsClues.yes ? "cl" : "sp"})`
      : `${store}.marks(b)`;
    made = {
      sort: val.sort,
      clues: readsClues.yes,
      board,
      code: [
        `const ${store} = keptStore<${type}>();`,
        "",
        `/** \`${fn}(${def.params[0]})\` as the description defines it, kept for the`,
        board
          ? " * board, since it reads no marks. */"
          : " * marks while no value is placed in them. */",
        `export function ${fn}(${board ? "" : "b: Marks, "}sp: GridSpace, ${readsClues.yes ? "cl: Dealt, " : ""}${v}: number): ${type} {`,
        `  const _kept: Kept<${type}> = ${keptAt};`,
        `  if (_kept[${v}] !== undefined) return _kept[${v}];`,
        ...body.text(),
        `  const _made = ${val.code};`,
        `  _kept[${v}] = _made;`,
        "  return _made;",
        "}",
      ].join("\n"),
    };
    kept.defs.set(fn, made);
  }
  if (made.clues) env.readsClues.yes = true;
  return {
    code: `${fn}(${made.board ? "" : "b, "}sp, ${made.clues ? "cl, " : ""}${vs[0].code})`,
    sort: made.sort,
  };
}

/** How deep the loops of `e` nest, through the definitions it reads: a set
 * made by one loop costs about what looking it up does. */
function loopDepth(
  e: Expr,
  defs: ReadonlyMap<string, Definition>,
  seen: ReadonlySet<string> = new Set(),
): number {
  const inner = Math.max(0, ...children(e).map((c) => loopDepth(c, defs, seen)));
  if (e.k === "quant" || e.k === "agg") return inner + 1;
  const def = e.k === "call" && !seen.has(e.fn) ? defs.get(e.fn) : undefined;
  if (def === undefined) return inner;
  return Math.max(
    inner,
    loopDepth(def.body, defs, new Set([...seen, e.k === "call" ? e.fn : ""])),
  );
}

// --- a definition that reads itself -----------------------------------------

/** The functions that read the marks, rather than the board. */
const MARK_READS = new Set([
  "value",
  "known",
  "cand",
  "chain",
  "linked",
  "place",
  "strike",
]);

/** Whether `e` reads the marks, itself or through a definition, a supposition
 * included: what a definition kept for the whole board must not do. */
function readsMarks(
  e: Expr,
  defs: ReadonlyMap<string, Definition>,
  seen: Set<string>,
  cellMark: string | null,
): boolean {
  if (e.k === "with") return true;
  const name = e.k === "call" ? e.fn : e.k === "name" ? e.name : null;
  if (name !== null) {
    if (
      e.k === "call" &&
      (MARK_READS.has(name) || name === cellMark || name === "mark")
    )
      return true;
    const d = defs.get(name);
    if (d !== undefined && !seen.has(name)) {
      seen.add(name);
      if (readsMarks(d.body, defs, seen, cellMark)) return true;
    }
  }
  return children(e).some((c) => readsMarks(c, defs, seen, cellMark));
}

/** The terms directly under `e`. */
function children(e: Expr): Expr[] {
  switch (e.k) {
    case "num":
    case "name":
      return [];
    case "call":
      return e.args;
    case "set":
      return e.elems;
    case "size":
    case "not":
    case "neg":
      return [e.of];
    case "bin":
      return [e.a, e.b];
    case "with":
      return [e.cell, e.value, e.body];
    case "quant":
      return [
        ...e.binders.flatMap((b) => [b.of, ...(b.where ? [b.where] : [])]),
        e.body,
      ];
    case "agg":
      return [
        ...e.binders.flatMap((b) => [b.of, ...(b.where ? [b.where] : [])]),
        ...(e.where ? [e.where] : []),
        ...(e.term ? [e.term] : []),
      ];
  }
}

/** Whether `e` reads definition `fn`, itself or through the definitions it
 * calls. */
function mentions(
  e: Expr,
  fn: string,
  defs: ReadonlyMap<string, Definition>,
  seen: Set<string>,
): boolean {
  if (e.k === "call") {
    if (e.fn === fn) return true;
    const d = defs.get(e.fn);
    if (d !== undefined && !seen.has(e.fn)) {
      seen.add(e.fn);
      if (mentions(d.body, fn, defs, seen)) return true;
    }
  }
  return children(e).some((c) => mentions(c, fn, defs, seen));
}

/**
 * Refuse a read of `fn` in `e` that could make the set `fn` defines lose a
 * member as it gains one, so that its least fixed point is the set the
 * description means: a read is allowed where it stands positively, under
 * `and`, `or`, `exists`, a `forall`'s body, and the right of `implies`.
 */
function monotone(
  e: Expr,
  fn: string,
  positive: boolean,
  defs: ReadonlyMap<string, Definition>,
): void {
  const none = (...es: (Expr | null)[]): void => {
    for (const x of es)
      if (x !== null && mentions(x, fn, defs, new Set()))
        throw new CompileError(
          `${fn} reads itself where a larger set could make it smaller, or through another definition`,
        );
  };
  switch (e.k) {
    case "call":
      if (e.fn !== fn) {
        none(e);
        return;
      }
      if (!positive) throw new CompileError(`${fn} reads itself under a negation`);
      none(...e.args);
      return;
    case "not":
      monotone(e.of, fn, !positive, defs);
      return;
    case "bin":
      if (e.op === "and" || e.op === "or") {
        monotone(e.a, fn, positive, defs);
        monotone(e.b, fn, positive, defs);
      } else if (e.op === "implies") {
        monotone(e.a, fn, !positive, defs);
        monotone(e.b, fn, positive, defs);
      } else none(e.a, e.b);
      return;
    case "quant":
      for (const b of e.binders) {
        none(b.of);
        if (b.where !== null)
          monotone(b.where, fn, e.q === "exists" ? positive : !positive, defs);
      }
      monotone(e.body, fn, positive, defs);
      return;
    default:
      none(e);
  }
}

/**
 * The array holding definition `fn`'s least fixed point, computed once at
 * the top of the function being compiled: the least set of cells for which
 * its body holds, its reads of itself read as membership. It reads only the
 * position and its parameters, so it is the same wherever the function reads
 * it with the same values of the parameters before its last: one set, or,
 * with such parameters, a function giving the set for their values.
 */
function fixedPoint(
  fn: string,
  def: Definition,
  earlier: readonly Val[],
  env: Env,
): string {
  const pre = env.prelude;
  if (pre === null)
    throw new CompileError(
      `${fn} reads itself, which only a planning game's rules may`,
    );
  const kept = pre.fixed.get(fn);
  if (kept !== undefined) return kept;
  monotone(def.body, fn, true, env.defs);
  for (const v of earlier)
    if (v.sort.k !== "num" && v.sort.k !== "elem")
      throw new CompileError(
        `${fn}: a fixed point's parameters are numbers and elements`,
      );
  const arr = Out.fresh("_fix");
  const c = Out.fresh("_c");
  const grew = Out.fresh("_grew");
  // The parameters before the last, as the function computing the set for
  // each of their values names them.
  const names = earlier.map(() => Out.fresh("_a"));
  const scope = new Map<string, Val>(
    earlier.map((v, i) => [def.params[i], { code: names[i], sort: v.sort }]),
  );
  scope.set(def.params[earlier.length], { code: c, sort: elem("cell") });
  // The body first, so a fixed point it reads is computed ahead of this one.
  const body = new Out(0);
  const outer = pre.fixing;
  pre.fixing = { name: fn, arr };
  const v = compileExpr(def.body, scope, env, body);
  pre.fixing = outer;
  expect(v, "bool", fn);
  const out = pre.out;
  // With parameters before the last, a set for each of their values, made
  // when it is first read and kept for the call.
  const sets = names.length > 0 ? Out.fresh("_sets") : "";
  const key = names.length === 1 ? names[0] : `[${names.join(", ")}].join()`;
  const of = `${arr}Of`;
  if (names.length > 0) {
    out.emit(
      `const ${sets} = new Map<${names.length === 1 ? "number" : "string"}, Uint8Array>();`,
    );
    out.open(
      `const ${of} = (${names.map((n) => `${n}: number`).join(", ")}): Uint8Array => {`,
    );
    out.emit(`const kept = ${sets}.get(${key});`);
    out.emit("if (kept !== undefined) return kept;");
  }
  out.emit(`const ${arr} = new Uint8Array(sp.cells.length);`);
  out.open(`for (let ${grew} = true; ${grew}; ) {`);
  out.emit(`${grew} = false;`);
  out.open(`for (let ${c} = 0; ${c} < sp.cells.length; ${c}++) {`);
  out.emit(`if (${arr}[${c}] === 1) continue;`);
  out.append(body);
  out.open(`if (${v.code}) {`);
  out.emit(`${arr}[${c}] = 1;`);
  out.emit(`${grew} = true;`);
  out.close();
  out.close();
  out.close();
  const made = names.length > 0 ? of : arr;
  if (names.length > 0) {
    out.emit(`${sets}.set(${key}, ${arr});`);
    out.emit(`return ${arr};`);
    out.close("};");
  }
  pre.fixed.set(fn, made);
  return made;
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
  const onPlace = t.on !== null;
  // A strike runs no placing technique, so a rung's reads of `value` and
  // `known` hold across one (`hoist` below).
  if (t.on === "strike" && places(t.conclude, env))
    throw new CompileError(`${t.id}: a technique run on striking only strikes`);
  // A rung reads a cell's candidates many times a scan, so it keeps them;
  // a technique run on placing or striking reads few, each time, and does
  // not.
  const scratch: string[] = [];
  const epoch = { used: false };
  const readsCands = { yes: false };
  const tenv: Env = {
    ...env,
    readsClues,
    readsCands,
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
  // emptied each call: a rung never runs inside its own call (a firing runs
  // only the techniques run on placing and striking), `fire` reads the facts
  // before it returns, and one run on striking, which a strike of its own
  // runs again, has its facts copied before they are made
  // (`strikingRung`). The candidates are kept only by a technique that
  // reads them, which is known once its body is compiled.
  const buffer = `${fnName}Cands`;
  const keep = body.slot(0);
  const refills: Slot[] = [];
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
      refills.push(body.slot(0));
      if (epoch.used) body.emit("_epoch++;");
    }
    body.close();
  };
  let params: string;
  if (onPlace) {
    const [first, ...rest] = t.binders;
    if (first === undefined || first.kind !== "in")
      throw new CompileError(
        `${t.id}: a technique run on ${t.on === "strike" ? "striking binds the struck" : "placing binds the placed"} cell first`,
      );
    const of = compileExpr(first.of, new Map(), { ...tenv, hoist: null }, new Out(0));
    const held = env.answerSort;
    if (!isSetOf(of.sort, held))
      throw new CompileError(`${t.id}: its first binder is not over ${held}s`);
    const sc = new Map<string, Val>([
      [first.name, { code: `v_${first.name}`, sort: elem(held), at: tenv.hoist.root }],
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
  if (readsCands.yes) {
    keep.lines.push(
      {
        indent: 0,
        text: `if (${buffer}.length < ${answerCount(env)}) ${buffer} = new Int32Array(${answerCount(env)});`,
      },
      { indent: 0, text: `const cands = ${buffer};` },
      { indent: 0, text: "cands.fill(-1);" },
    );
    for (const s of refills) s.lines.push({ indent: 0, text: "cands.fill(-1);" });
  }
  const clueParam = readsClues.yes ? "cl: Dealt, " : "";
  const text = [...scratch.map((d) => `  ${d}`), ...body.text()];
  // The generated code names nothing else `sp`, so a body that never says it
  // reads no geometry, and the parameter is marked unread.
  const spParam = text.some((l) => /\bsp\b/.test(l)) ? "sp" : "_sp";
  const lines = [
    `export interface ${bindingType} {`,
    ...fields,
    "}",
    "",
    `const ${fnName}Facts: number[] = [];`,
    ...(readsCands.yes ? [`let ${buffer} = new Int32Array(0);`] : []),
    "",
    `export function ${fnName}(b: Marks, ${spParam}: GridSpace, ${clueParam}${params}fire: Fire<${bindingType}> | null): number {`,
    ...text,
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
    case "with":
      return places(e.body, env);
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
    cellDomain: false,
    sizes: { names: new Set(), read: new Set() },
    used,
    concluding: false,
    answer: null,
    position: null,
    carrying: null,
    tables: new Map(),
    geometry: true,
    faces: null,
    answerSort: "cell",
    memo: false,
    scratch: null,
    readsClues: { yes: false },
    hoist: null,
    epoch: null,
    prelude: null,
    relations: new Set(),
    edgeMark: null,
    cellMark: null,
    supposed: [],
    kept: null,
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

/** The element sort a clue, or a clue at the board's field, sits at. */
function placeSort(what: string, at: string, env: Env): ElemSort {
  if (
    at === "edge" ||
    at === "cell" ||
    at === "line" ||
    at === "slot" ||
    at === "corner" ||
    at === "point" ||
    at === "center"
  )
    return at;
  if (env.regions.has(at)) return `region ${at}`;
  throw new CompileError(`${what}: no element sort "${at}"`);
}

/** The sort of the members of `value`, a set, which may read `at`. */
function valuesSort(what: string, value: Expr, at: Sort | null, env: Env): Sort {
  // Compiled only for its sort, so what it would call is not imported.
  const v = compileExpr(
    value,
    new Map(at === null ? [] : [["at", { code: "at", sort: at }]]),
    {
      ...env,
      used: new Set(),
      readsClues: { yes: false },
      sizes: { ...env.sizes, read: new Set() },
    },
    new Out(0),
  );
  if (v.sort.k !== "set") throw new CompileError(`${what}: its values are not a set`);
  return v.sort.of;
}

/** The type a clue at the board is dealt as: how many there are, and each
 * field's values by clue, and by element where it is one an element. */
function recordsType(fields: NonNullable<ClueKind["fields"]>): string {
  const parts = [...fields].map(
    ([name, f]) =>
      `readonly ${name}: readonly ${f.at === null ? "number" : "(readonly number[])"}[]`,
  );
  return `{ readonly n: number; ${parts.join("; ")} }`;
}

/** The sorts of a clue kind's place and value, or of a clue at the board's
 * fields, from its declaration. */
function clueSorts(kind: string, c: DescribedClueKind, env: Env): ClueKind {
  if (c.value === null) {
    const fields = new Map<string, { at: ElemSort | null; v: Sort }>();
    for (const [name, f] of c.fields) {
      if (env.defs.has(name) || env.clues.has(name) || env.regions.has(name))
        throw new CompileError(`clue ${kind}: its field ${name} is named twice`);
      const at = f.at === null ? null : placeSort(`clue ${kind} ${name}`, f.at, env);
      const v = valuesSort(`clue ${kind} ${name}`, f.value, null, env);
      if (v.k !== "num")
        throw new CompileError(`clue ${kind} ${name}: its values are not numbers`);
      fields.set(name, { at, v });
    }
    return { at: { k: "none" }, v: { k: "none" }, per: false, fields };
  }
  const at = elem(placeSort(`clue ${kind}`, c.at, env));
  return {
    at,
    v: valuesSort(`clue ${kind}`, c.value, at, env),
    per: c.per,
    fields: null,
  };
}

/**
 * The ladder's order: the description's, but a technique a variation adds,
 * which the description lists after its own, goes before the first of a
 * higher tier on its scale, so a ladder in tier order stays in tier order
 * with the variation on.
 */
function rungOrder(
  techniques: readonly Technique[],
  addedBy: ReadonlyMap<string, string>,
): Technique[] {
  const out = techniques.filter((t) => !addedBy.has(t.id));
  for (const t of techniques.filter((x) => addedBy.has(x.id))) {
    const at = out.findIndex((x) => x.scale === t.scale && x.tier > t.tier);
    out.splice(at < 0 ? out.length : at, 0, t);
  }
  return out;
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
  const grid = space.grid ?? null;
  if ((grid === null) === (space.cells === undefined))
    throw new CompileError(`${json.game}: a space is a grid or cells, one of them`);
  const relations = Object.keys(space.relations ?? {});
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
    // A size the grid is not measured in: `order`, `w` and `h` are the
    // space's own.
    sizes: {
      names: new Set(
        Object.keys(d.json.sizes).filter(
          (n) =>
            grid === null ||
            (n !== "order" && n !== "w" && n !== "h" && n !== grid.w && n !== grid.h),
        ),
      ),
      read: new Set(),
    },
    cellDomain: false,
    used,
    concluding: false,
    answer: null,
    position: null,
    carrying: null,
    tables: new Map(),
    geometry: grid !== null,
    faces: null,
    answerSort: d.answerSort,
    memo: false,
    scratch: null,
    readsClues: { yes: false },
    hoist: null,
    epoch: null,
    prelude: null,
    relations: new Set(relations),
    edgeMark: edgeMarkOf(d.json)?.name ?? null,
    cellMark: cellMarkOf(d.json),
    supposed: [],
    kept: { defs: new Map(), used },
  };
  for (const [kind, c] of d.clueKinds) clues.set(kind, clueSorts(kind, c, env));
  const domainLines = cellDomain(d.domain, env, d.json.sizes);
  const own = d.techniques.filter((t) => !t.id.includes("."));
  const code = own.map((t) => compileTechnique(t, env).code);
  const kept = env.kept?.defs ?? new Map();
  for (const fn of kept.keys())
    if (own.some((t) => t.id === fn))
      throw new CompileError(`${fn}: a kept definition and a technique share the name`);
  code.push(...[...kept.values()].map((k) => k.code));
  const check = answerCheck(json, d, env);
  const scales = Object.entries(d.json.scales ?? {});
  const sizes = [...env.sizes.read].sort();
  const clueLines =
    clues.size + regions.size + relations.length + sizes.length === 0
      ? []
      : [
          "/** What the board deals: its partitions by name, its relations, a set of",
          " * cells for each cell, its clues by kind, and the sizes a technique or the",
          " * rules read that the grid does not give. */",
          "export interface Dealt {",
          ...[...regions].map((r) => `  ${r}: Partition;`),
          ...relations.map((r) => `  readonly ${r}: readonly (readonly number[])[];`),
          ...[...clues].map(
            ([k, c]) => `  ${k}: ${c.fields ? recordsType(c.fields) : "ClueList"};`,
          ),
          ...sizes.map((n) => `  ${n}: number;`),
          "}",
          "",
        ];
  const ids = d.techniques.filter((t) => t.on === null).map((t) => t.id);
  const placing = d.techniques.filter((t) => t.on === "place").map((t) => t.id);
  const striking = d.techniques.filter((t) => t.on === "strike").map((t) => t.id);
  // A technique a variation adds runs only on a board the variation is on.
  const addedBy = new Map<string, string>();
  for (const [name, v] of Object.entries(json.variations ?? {}))
    for (const t of v.add?.techniques ?? [])
      addedBy.set("use" in t ? t.use : t.id, name);
  const quoted = (xs: readonly string[]): string =>
    xs.length === 0 ? "never" : xs.map((id) => JSON.stringify(id)).join(" | ");
  const onCellEntry = (id: string): string => {
    const by = addedBy.get(id);
    const fields = [
      `id: ${JSON.stringify(id)}`,
      ...(by === undefined ? [] : [`variation: ${JSON.stringify(by)}`]),
    ];
    return `  { ${fields.join(", ")} },`;
  };
  const ladder = [
    "/** The units no value repeats in, in the description's order: the",
    " * engine builds the space from them. */",
    `export const units: readonly string[] = ${JSON.stringify(space.units)};`,
    "",
    "/** Every technique a rung runs, by id: the description's, in its order. */",
    `export type LadderId = ${quoted(ids)};`,
    "",
    "/** Every technique run as each value is placed, by id. */",
    `export type PlacingId = ${quoted(placing)};`,
    "",
    "/** The techniques run as each value is placed, in the description's order,",
    " * each with the variation that adds it where one does. */",
    "export const placing: readonly { id: PlacingId; variation?: string }[] = [",
    ...placing.map(onCellEntry),
    "];",
    "",
    "/** Every technique run as a value is struck from a cell, by id. */",
    `export type StrikingId = ${quoted(striking)};`,
    "",
    "/** The techniques run as a value is struck from a cell, in the",
    " * description's order, each with the variation that adds it where one",
    " * does. */",
    "export const striking: readonly { id: StrikingId; variation?: string }[] = [",
    ...striking.map(onCellEntry),
    "];",
    "",
    "/** The ladder: each technique's tier, on its scale where that is not the",
    " * description's tiers, the least cap it runs at where that is above its",
    " * tier, the cap from which it no longer runs where it has one, and the",
    " * variation that adds it where one does, in the order the description",
    " * lists them, a variation's before the first of a higher tier. */",
    "export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number; variation?: string }[] = [",
    ...rungOrder(
      d.techniques.filter((t) => t.on === null),
      addedBy,
    ).map((t) => {
      const by = addedBy.get(t.id);
      const fields = [
        `id: ${JSON.stringify(t.id)}`,
        `tier: ${t.tier}`,
        ...(t.scale === null ? [] : [`scale: ${JSON.stringify(t.scale)}`]),
        ...(t.from === null ? [] : [`from: ${t.from}`]),
        ...(t.until === null ? [] : [`until: ${t.until}`]),
        ...(by === undefined ? [] : [`variation: ${JSON.stringify(by)}`]),
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
    runtimeImport(
      used,
      [...clues.values()].some((c) => c.fields === null),
      regions.size > 0,
      runtime,
    ),
    "",
    ...clueLines,
    ...ladder,
    ...domainLines,
    "",
    ...check,
    "",
    code.join("\n\n"),
  ].join("\n")}\n`;
}

/**
 * The answer check: whether a whole grid, a value a cell and 0 where it has
 * none, is an answer to the board `cl` deals. Every cell holds a value of its
 * domain, and the shape, the rules and each dealt clue's meaning hold of it.
 * A rule a variation adds holds only where the board has the variation on,
 * as a technique a variation adds runs only there; a clue kind or partition
 * a variation adds is dealt empty where it is off.
 */
function answerCheck(json: DescriptionJson, d: Description, env: Env): string[] {
  const readsClues = { yes: false };
  const scratch: string[] = [];
  const cenv: Env = {
    ...env,
    answer: { repeats: d.repeat !== null },
    readsClues,
    scratch,
    memo: false,
    hoist: null,
    epoch: null,
    concluding: false,
  };
  const out = new Out(1);
  // A check reads a whole grid it never changes, so what a rule binds is
  // made once where it is bound: a set of edges is joined into groups there,
  // not walked again from each square (Rectangles' shape).
  cenv.hoist = { root: out.slot(0), loops: 0, marks: true };
  // A board of cells alone is measured in nothing.
  const { grid } = json.space;
  const measured = grid === undefined ? (e: Expr) => e : measuredBy(grid);
  const scope = new Map<string, Val>();
  out.open(`for (const cell of ${answerSet(env)}) {`);
  out.emit("const held = g[cell];");
  if (env.cellDomain) {
    readsClues.yes = true;
    out.emit("if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;");
    out.close();
  } else {
    const at = new Out(1);
    const dom = compileExpr(measured(d.domain), scope, cenv, at);
    if (!isMask(dom.sort)) throw new CompileError("the domain is not a set of values");
    out.emit("if (!(held > 0 && (_domain >> held) & 1)) return false;");
    out.close();
    out.entries.unshift(...at.entries, {
      indent: 1,
      text: `const _domain = ${dom.code};`,
    });
    scope.set("domain", { code: "_domain", sort: setOf(NUM) });
  }
  if (d.repeat !== null) {
    const value = compileExpr(measured(d.repeat.value), scope, cenv, out);
    const times = compileExpr(measured(d.repeat.times), scope, cenv, out);
    out.emit(`const _repeat = ${value.code};`);
    out.emit(`const _times = ${times.code};`);
  }
  // A variation's own rules, each after the description's.
  const rules = [
    ...(json.shape ?? []).map((src) => ({ src, on: null as string | null })),
    ...Object.values(json.rules ?? {}).map((src) => ({ src, on: null })),
    ...Object.entries(json.variations ?? {}).flatMap(([name, v]) => [
      ...(v.add?.shape ?? []).map((src) => ({ src, on: name })),
      ...Object.values(v.add?.rules ?? {}).map((src) => ({ src, on: name })),
    ]),
  ];
  for (const { src, on } of rules) {
    if (on !== null) out.open(`if (variations.includes(${JSON.stringify(on)})) {`);
    const v = compileExpr(measured(parse(src)), scope, cenv, out);
    expect(v, "bool", `rule ${src}`);
    out.emit(`if (!(${v.code})) return false;`);
    if (on !== null) out.close();
  }
  for (const [kind, c] of d.clueKinds) {
    const sorts = env.clues.get(kind) as ClueKind;
    const k = Out.fresh("_k");
    const at = Out.fresh("_at");
    const v = Out.fresh("_v");
    const per = sorts.per ? Out.fresh("_per") : "";
    readsClues.yes = true;
    // A clue at the board is `k` in its meaning, its fields read of it.
    const own: [string, Val][] = sorts.fields
      ? [["k", { code: k, sort: elem(`clue ${kind}`) }]]
      : [
          ["at", { code: at, sort: sorts.at }],
          ["v", { code: v, sort: sorts.v }],
          ...(sorts.per ? [["per", { code: per, sort: NUM }] as [string, Val]] : []),
        ];
    out.open(
      `for (let ${k} = 0; ${k} < cl.${kind}.${sorts.fields ? "n" : "at.length"}; ${k}++) {`,
    );
    if (sorts.per) {
      cenv.used.add("perElement");
      cenv.used.add("perValue");
      out.emit(`const ${at} = perElement(cl.${kind}.at[${k}]);`);
      out.emit(`const ${per} = perValue(cl.${kind}.at[${k}]);`);
      out.emit(`const ${v} = cl.${kind}.v[${k}];`);
    } else if (!sorts.fields) {
      out.emit(`const ${at} = cl.${kind}.at[${k}];`);
      // A clue whose place is the whole of what it says (a block) has a value
      // its meaning never reads.
      if (reads(c.means, "v")) out.emit(`const ${v} = cl.${kind}.v[${k}];`);
    }
    const means = compileExpr(
      measured(c.means),
      new Map([...scope, ...own]),
      cenv,
      out,
    );
    expect(means, "bool", `clue ${kind}`);
    out.emit(`if (!(${means.code})) return false;`);
    out.close();
  }
  out.emit("return true;");
  const params = [
    "g: ArrayLike<number>",
    "sp: GridSpace",
    ...(readsClues.yes ? ["cl: Dealt"] : []),
    ...(rules.some((r) => r.on !== null) ? ["variations: readonly string[]"] : []),
  ];
  return [
    "/** Whether `g`, a value a cell and 0 where it has none, is an answer to the",
    " * board: every cell a value of its domain, and every rule and dealt clue",
    " * true of it, a variation's rules where `variations` has it on. */",
    `export function isAnswer(${params.join(", ")}): boolean {`,
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    "}",
  ];
}

/**
 * A formula with the space's own measures read off the grid: where the
 * description measures its grid in a term of other sizes (Solo's `c * r`),
 * that term is the grid's width or height.
 */
function measuredBy(grid: { w: string; h: string }): (e: Expr) => Expr {
  const w = JSON.stringify(parse(grid.w));
  const h = JSON.stringify(parse(grid.h));
  const go = (e: Expr): Expr => {
    // A grid one cell high is measured in no term: a 1 is a 1.
    if (e.k === "num") return e;
    const s = JSON.stringify(e);
    if (s === w) return { k: "name", name: "w" };
    if (s === h) return { k: "name", name: "h" };
    const opt = (x: Expr | null): Expr | null => (x === null ? null : go(x));
    const binders = (bs: readonly Binder[]): Binder[] =>
      bs.map((b) => ({ ...b, of: go(b.of), where: opt(b.where) }));
    switch (e.k) {
      case "name":
        return e;
      case "call":
        return { ...e, args: e.args.map(go) };
      case "set":
        return { ...e, elems: e.elems.map(go) };
      case "size":
      case "not":
      case "neg":
        return { ...e, of: go(e.of) };
      case "bin":
        return { ...e, a: go(e.a), b: go(e.b) };
      case "with":
        return { ...e, cell: go(e.cell), value: go(e.value), body: go(e.body) };
      case "quant":
        return { ...e, binders: binders(e.binders), body: go(e.body) };
      case "agg":
        return {
          ...e,
          binders: binders(e.binders),
          where: opt(e.where),
          term: opt(e.term),
        };
    }
  };
  return go;
}

/**
 * Where the answer's domain is a cell's (it reads `c`, as Seismic's is its
 * area's numbers), the function the engine seeds each cell's candidates
 * from, and `domain` alone is then refused in a technique; nothing where it
 * is the board's.
 */
function cellDomain(
  domain: Expr,
  env: Env,
  sizes: Readonly<Record<string, unknown>>,
): string[] {
  const names = new Set<string>();
  freeNames(domain, names, new Set());
  // Solo's board is measured in a `c`, which is no cell.
  if (!names.has("c") || "c" in sizes) return [];
  env.cellDomain = true;
  const out = new Out(1);
  const scope = new Map<string, Val>([["c", { code: "v_c", sort: elem("cell") }]]);
  const v = compileExpr(domain, scope, env, out);
  if (!isMask(v.sort)) throw new CompileError("the domain is not a set of values");
  const cl = env.readsClues.yes ? "cl: Dealt, " : "_cl: Dealt, ";
  env.readsClues.yes = false;
  const body = [...out.text(), `  return ${v.code};`];
  const sp = body.some((l) => /\bsp\b/.test(l)) ? "sp" : "_sp";
  return [
    "",
    "/** The values each cell may hold, by cell: its domain. */",
    `export function domainOf(${sp}: GridSpace, ${cl}v_c: number): number {`,
    ...body,
    "}",
  ];
}

/** The expression compiler, for the position rules' compiler
 * (`compile-position.ts`), which writes other functions from the same
 * terms. */
export {
  bindingLoops,
  CompileError,
  compileExpr,
  type Env,
  expect,
  HEADER,
  type LayerSort,
  Out,
  type Sort,
  show,
  type Val,
};
