/**
 * The expression compiler (`compile.ts`): a term to the code that computes
 * it, with its bindings, quantifiers, aggregates and calls. They are one
 * module because each compiles its subterms through `compileExpr`.
 */

import {
  centerCall,
  clueField,
  diagonalCall,
  edgeBetween,
  edgeStrike,
  layerRead,
  matchedCall,
  NAMES,
  noGeometry,
  rectCall,
  relationCall,
  TILING_ONLY,
  tilingCall,
} from "./compile-geometry.ts";
import {
  BOARD_WALKS,
  LINE_WALKS,
  loopDepth,
  memberTable,
  SCANNED_SET,
  walks,
} from "./compile-growth.ts";
import {
  answerCount,
  type Block,
  BOOL,
  type ClueKind,
  CompileError,
  candOf,
  clueKindArg,
  type Env,
  elem,
  exact,
  expect,
  expectElem,
  fieldOf,
  type Hoist,
  hasRead,
  heldName,
  INT,
  isArray,
  isMask,
  isSetOf,
  type Line,
  MASK_IN_WIDE,
  markRead,
  marksRead,
  maskHas,
  NOT_WIDE,
  NUM,
  Out,
  once,
  type Scope,
  type Slot,
  type Sort,
  sameSort,
  scalar,
  setKey,
  setOf,
  sharedReach,
  show,
  supposedRead,
  timesOf,
  tsType,
  type Val,
} from "./compile-sorts.ts";
import { wordingIndex } from "./compile-stated.ts";
import type { FreshRead, Reread } from "./compile-technique.ts";
import {
  chainPin,
  chainsKept,
  cluePin,
  countedSlope,
  cycleOf,
  early,
  emptyAhead,
  FACTS,
  fillConjuncts,
  freeNames,
  inlined,
  isBentSight,
  isRead,
  joinOf,
  keptChain,
  keptWhilePlaced,
  mentions,
  monotone,
  namesIn,
  partOf,
  pinOf,
  type RoundName,
  readOf,
  reads,
  readsAtEdge,
  readsMarks,
  readsOnlyAt,
  readsRound,
  SIGHT_BENT,
  sameTerm,
  sharedKey,
  sizeTest,
} from "./compile-terms.ts";
import type { Definition } from "./description.ts";
import type { Binder, Expr } from "./expr.ts";

export function compileExpr(e: Expr, scope: Scope, env: Env, out: Out): Val {
  if (env.hoist !== null && e.k !== "num" && e.k !== "name") {
    const v = hoisted(e, scope, env, env.hoist);
    if (v !== null) return v;
  }
  const shared = env.shared;
  if (shared === undefined) return compileNode(e, scope, env, out);
  if (e.k === "call" && FACTS.some((f) => mentions(e, f, env.defs, new Set())))
    shared.made.clear();
  if (e.k !== "agg" && e.k !== "quant") return compileNode(e, scope, env, out);
  if (FACTS.some((f) => mentions(e, f, env.defs, new Set())))
    return compileNode(e, scope, env, out);
  const key = sharedKey(e, scope, env);
  const kept = shared.made.get(key);
  if (kept !== undefined && sharedReach(kept.out, kept.path, out)) return kept.val;
  const v = compileNode(e, scope, env, out);
  // Only a number or a truth its own loop declared is kept: a set's array is
  // emptied where its site runs again, and a read the runtime answers is
  // cheap.
  const total = v.sort.k === "num" || v.sort.k === "bool" || isMask(v.sort);
  if (total && /^_[gq]\d+$/.test(v.code))
    shared.made.set(key, {
      out,
      path: [...out.blocks],
      val: { code: v.code, sort: v.sort },
    });
  return v;
}

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
  // A set is moved only where it is a fresh array no code writes, made by a
  // sum or difference of sets: Net's reach took the same difference of a
  // square's sides from `P` for each side of the square beside it.
  const fresh =
    e.k === "bin" && (e.op === "+" || e.op === "-") && tmp.entries.length === 0;
  if ((isArray(v.sort) && !fresh) || v.sort.k === "subsets" || v.sort.k === "clues")
    return null;
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
      // The size of `{x in S where P}` over one binder is a count, its
      // elements as distinct as S's: counted, never gathered.
      const of = inlined(e.of, scope, env);
      if (
        of.k === "agg" &&
        of.fn === "set" &&
        of.binders.length === 1 &&
        of.where === null &&
        of.term?.k === "name" &&
        of.term.name === of.binders[0].name
      )
        return compileNode(
          { k: "agg", fn: "count", binders: of.binders, where: null, term: null },
          scope,
          env,
          out,
        );
      if (keptChain(e.of, env)) {
        const c = compileExpr(
          (e.of as Extract<Expr, { k: "call" }>).args[0],
          scope,
          env,
          out,
        );
        expectElem(c, "cell", "chain");
        env.used.add("chainLength");
        return {
          code: `chainLength(sp, b, ${namedBy(Out.fresh("_x"), env)}, ${c.code})`,
          sort: NUM,
        };
      }
      const s = compileExpr(e.of, scope, env, out);
      if (s.sort.k === "cands") return { code: `b.candCount(${s.code})`, sort: NUM };
      if (isMask(s.sort)) {
        env.used.add("popcount");
        return { code: `popcount(${s.code})`, sort: NUM };
      }
      if (isArray(s.sort)) return { code: `${s.code}.length`, sort: NUM };
      if (s.sort.k === "list") {
        env.used.add("listLength");
        return { code: `listLength(${s.code})`, sort: NUM };
      }
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

/** A `with`'s supposition: the names of the cell, or of the set of cells
 * (`many`), and of the value it is supposed to hold. */
export interface Supposed {
  cell: string;
  value: string;
  many: boolean;
}

/**
 * `with place(c, d): P`: `P` read on the marks with `c` holding `d`, or each
 * member of `c` where it is a set of cells. Its reads of the marks see the
 * supposition (`env.supposed`), so none of them is computed outside it, and
 * nothing in it concludes.
 */
function supposing(
  e: Extract<Expr, { k: "with" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  return compileExpr(e.body, scope, suppose(e, scope, env, out).env, out);
}

/** The environment `e`'s body is read in, and the names its cell and value
 * are held in, which `with` has written. */
function suppose(
  e: Extract<Expr, { k: "with" }>,
  scope: Scope,
  env: Env,
  out: Out,
): { env: Env } & Supposed {
  if (env.answer !== null || env.position !== null)
    throw new CompileError(
      "with supposes a value on the marks, which only a technique reads",
    );
  const c = compileExpr(e.cell, scope, env, out);
  const many = isSetOf(c.sort, env.answerSort);
  if (!many) expectElem(c, env.answerSort, "with");
  const d = compileExpr(e.value, scope, env, out);
  expect(d, "num", "with");
  const cell = Out.fresh("_wc");
  const value = Out.fresh("_wd");
  out.emit(`const ${cell} = ${c.code};`);
  out.emit(`const ${value} = ${d.code};`);
  const inner: Env = {
    ...env,
    concluding: false,
    supposed: [{ cell, value, many }, ...env.supposed],
    hoist: env.hoist === null ? null : { ...env.hoist, marks: false },
  };
  // A truth in a premise, and a set where a `says` reads one under a
  // supposition; whoever reads it checks its sort.
  return { env: inner, cell, value, many };
}

/**
 * What held in `e`, which is true here, as the code of a `Witness` value
 * (`describe-runtime.ts`) or `null` where nothing in it is worth reporting,
 * with the statements that compute it written to `out`. It is written only
 * where a hint reads it, on the marks before a firing's facts are made, so a
 * part is read here a second time and the solve path never runs it.
 *
 * It follows `and` (each side), `or` (the side that held, the left first),
 * `exists` (the first member the body held for), `with` and a definition's
 * body. Anything else, a `not`, a `forall`, an aggregate, has no witness: a
 * `forall` has no one member, and what a `not` holds is a fact about
 * something that did not happen.
 */
export function witnessOf(e: Expr, scope: Scope, env: Env, out: Out): string | null {
  const bool = (x: Expr, sc: Scope = scope): Val => {
    const v = compileExpr(x, sc, env, out);
    expect(v, "bool", "witness");
    return once(v, out);
  };
  const of = (w: string | null): string => w ?? "null";
  // A break clause's node carries the terms its words read, read here, where
  // it held, under the suppositions in force, its parameters the arguments.
  const said = (name: string, inner: Scope): string => {
    const brk = env.breaks.of.get(name);
    if (brk === undefined) return "";
    const fields = brk.terms.map(({ name: term, expr }) => {
      const v = compileExpr(expr, inner, env, out);
      const key = `${name}.${term}`;
      const was = env.breaks.sorts.get(key);
      if (was !== undefined && !sameSort(was, v.sort))
        throw new CompileError(`break ${name}: ${term} is read as two sorts`);
      env.breaks.sorts.set(key, v.sort);
      return `${term}: ${isArray(v.sort) ? `${v.code}.slice()` : v.code}`;
    });
    return `, says: { ${fields.join(", ")} }`;
  };
  if (e.k === "name" && !scope.has(e.name)) {
    const def = env.defs.get(e.name);
    if (def === undefined || def.params.length > 0) return null;
    return `{ held: "def", name: ${JSON.stringify(e.name)}, of: ${of(witnessOf(def.body, scope, env, out))}${said(e.name, new Map())} }`;
  }
  // A definition's parameters are its arguments' values where it is called,
  // as `definitionCall` binds them: an argument that reads the marks is read
  // outside a `with` its body supposes. One that reads itself has no witness.
  const def = e.k === "call" && !scope.has(e.fn) ? env.defs.get(e.fn) : undefined;
  if (e.k === "call" && def !== undefined && def.params.length === e.args.length) {
    if (mentions(def.body, e.fn, env.defs, new Set())) return null;
    const inner = new Map<string, Val>();
    def.params.forEach((p, i) => {
      inner.set(p, once(compileExpr(e.args[i], scope, env, out), out));
    });
    return `{ held: "def", name: ${JSON.stringify(e.fn)}, of: ${of(witnessOf(def.body, inner, env, out))}${said(e.fn, inner)} }`;
  }
  if (e.k === "bin" && e.op === "and") {
    const parts = [e.a, e.b]
      .map((x) => witnessOf(x, scope, env, out))
      .filter((w): w is string => w !== null);
    if (parts.length === 0) return null;
    env.used.add("witnessAll");
    return parts.length === 1 ? parts[0] : `witnessAll(${parts.join(", ")})`;
  }
  if (e.k === "bin" && e.op === "or") {
    const r = Out.fresh("_wo");
    out.emit(`let ${r}: Witness | null = null;`);
    const left = bool(e.a);
    out.open(`if (${left.code}) {`);
    out.emit(
      `${r} = { held: "arm", arm: 0, of: ${of(witnessOf(e.a, scope, env, out))} };`,
    );
    out.close();
    out.open(`if (!${left.code}) {`);
    out.emit(
      `${r} = { held: "arm", arm: 1, of: ${of(witnessOf(e.b, scope, env, out))} };`,
    );
    out.close();
    return r;
  }
  if (e.k === "with") {
    const s = suppose(e, scope, env, out);
    const inner = witnessOf(e.body, scope, s.env, out);
    const cell = s.many ? `${s.cell}.slice()` : s.cell;
    return `{ held: "supposing", cell: ${cell}, value: ${s.value}, of: ${of(inner)} }`;
  }
  if (e.k === "quant" && e.q === "exists") {
    const r = Out.fresh("_wm");
    const label = Out.fresh("W");
    out.emit(`let ${r}: Witness | null = null;`);
    out.open(`${label}: {`);
    bindingLoops(e.binders, scope, env, out, (sc) => {
      const v = bool(e.body, sc);
      out.open(`if (${v.code}) {`);
      const member = e.binders
        .filter((b) => b.kind !== "fill")
        .map((b) => {
          const val = sc.get(b.name);
          if (val === undefined) throw new Error(`witness: ${b.name} is not bound`);
          return `${b.name}: ${val.code}${isArray(val.sort) ? ".slice()" : ""}`;
        });
      const inner = witnessOf(e.body, sc, env, out);
      out.emit(
        `${r} = { held: "member", member: { ${member.join(", ")} }, of: ${of(inner)} };`,
      );
      out.emit(`break ${label};`);
      out.close();
    });
    out.close();
    return r;
  }
  return null;
}

function name(n: string, scope: Scope, env: Env, out: Out): Val {
  const bound = scope.get(n);
  if (bound !== undefined) return bound;
  if (n === "domain" && env.wide) throw new CompileError(NOT_WIDE);
  if (n === "domain" && env.cellDomain)
    throw new CompileError("the domain is each cell's here: read a cell's candidates");
  if (n === "domain" && env.position !== null)
    throw new CompileError("a position has a domain a layer, read by the checker only");
  const refused = noGeometry(n, env);
  if (refused !== null) throw new CompileError(refused);
  if (env.tiling && n === "faces")
    return { code: "sp.faces", sort: setOf(elem("face")) };
  if (env.tiling && n === "angles")
    return { code: "sp.angles", sort: setOf(elem("angle")) };
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
    if (env.readsSizes !== undefined) env.readsSizes.yes = true;
    else env.readsClues.yes = true;
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
  if (sort.k === "num") {
    if (env.wide && !elems.every((x) => x.k === "num" && x.v >= 0 && x.v <= 31))
      throw new CompileError(MASK_IN_WIDE);
    return {
      code: `(${vs.map((v) => `(1 << ${v.code})`).join(" | ")})`,
      sort: setOf(NUM),
    };
  }
  if (sort.k !== "elem") throw new CompileError(`a set of ${show(sort)}`);
  env.used.add("setOf");
  return { code: `setOf(${vs.map((v) => v.code).join(", ")})`, sort: setOf(sort) };
}

/** Whether a set literal's members are all elements of one sort, as a probe
 * that writes nothing reads them. */
function setLiteralElements(elems: readonly Expr[], scope: Scope, env: Env): boolean {
  const probe: Env = {
    ...env,
    used: new Set(),
    scratch: null,
    hoist: null,
    boardRoot: null,
    shared: undefined,
  };
  const sorts = elems.map((x) => compileExpr(x, scope, probe, new Out(0)).sort);
  // Numbers too where the domain is wide, as no mask holds them.
  const looped = (s: Sort): boolean =>
    s.k === "elem" || (env.wide === true && s.k === "num");
  return sorts.every((s) => looped(s) && sameSort(s, sorts[0]));
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
  const inner = new Out(0, out);
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
      hasRead(x, at, env, d.bit === true),
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
  // `x in chain(c)` asks whether the walk from `c` reaches `x`, which the
  // marks' kept chains answer without walking it.
  if ((op === "in" || op === "notin") && keptChain(e.b, env)) {
    const x = compileExpr(e.a, scope, env, out);
    expectElem(x, "cell", op);
    const c = compileExpr(
      (e.b as Extract<Expr, { k: "call" }>).args[0],
      scope,
      env,
      out,
    );
    expectElem(c, "cell", "chain");
    env.used.add("chainHas");
    const code = `chainHas(sp, b, ${namedBy(Out.fresh("_x"), env)}, ${x.code}, ${c.code})`;
    return { code: op === "in" ? code : `!${code}`, sort: BOOL };
  }
  // Read otherwise, it walks from `c` no further than `x`: decided on a
  // board still being filled once the links reach it.
  if (
    (op === "in" || op === "notin") &&
    e.b.k === "call" &&
    e.b.fn === "chain" &&
    e.b.args.length === 1
  ) {
    const x = compileExpr(e.a, scope, env, out);
    expectElem(x, "cell", op);
    const c = compileExpr(e.b.args[0], scope, env, out);
    expectElem(c, "cell", "chain");
    env.used.add("chainHolds");
    const code = `chainHolds(sp, ${namedBy(Out.fresh("_x"), env)}, ${c.code}, ${x.code})`;
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
  // `x in range(lo, hi)` compares the number with the range's ends: a
  // range's mask holds 0 to 31 alone, and a clue's value (a product of six
  // squares) runs far past it.
  if (
    (op === "in" || op === "notin") &&
    a.sort.k === "num" &&
    e.b.k === "call" &&
    e.b.fn === "range" &&
    e.b.args.length === 2
  ) {
    const lo = compileExpr(e.b.args[0], scope, env, out);
    const hi = compileExpr(e.b.args[1], scope, env, out);
    expect(lo, "num", "range");
    expect(hi, "num", "range");
    const code = `(${lo.code} <= ${a.code} && ${a.code} <= ${hi.code})`;
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
      if (a.sort.k === "list") {
        env.used.add("sameList");
        const eq = `sameList(${a.code}, ${b.code})`;
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
      const marks = memberTable(b, env);
      const has = isMask(b.sort)
        ? maskHas(b.code, a.code, a.bit === true)
        : marks !== null
          ? `${marks}[${a.code} + 1] === 1`
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

export function bindingLoops(
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
    let edgeSet: Val["edgeSet"] | null = null;
    let bit = false;
    let where = bnd.where;
    if (bnd === env.visitBinder && env.visitAt !== undefined)
      env.visitAt.slot = out.slot(env.hoist?.loops ?? 0);
    // A count may be taken ahead of the binder's set, and again once its
    // name is bound, ahead of its filter.
    const recheck = env.recheck?.binders === binders ? env.recheck : null;
    if (recheck !== null)
      recheck.chain.push({ slot: out.slot(0), loops: recheck.loops.length });
    if (bnd.kind === "fill") {
      if (env.wide) throw new CompileError(`${bnd.name}: ${NOT_WIDE}`);
      const f = fillLoop(bnd, sc, env, out);
      v = f.code;
      sort = { k: "fill" };
      where = f.rest;
    } else if (bnd.kind === "let") {
      const empty = emptyAhead(binders, i, env);
      if (empty !== null) {
        const has = compileExpr(empty, sc, env, out);
        out.emit(`if (!(${has.code})) continue;`);
      }
      const t = compileExpr(bnd.of, sc, env, out);
      sort = t.sort;
      names = setKey(t);
      const of = bnd.of;
      const at = sc;
      edgeSet = () => keptEdgeSet(of, at, env);
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
    } else if (
      bnd.of.k === "name" &&
      bnd.of.name === "cells" &&
      keptPin(bnd, sc, env) !== null
    ) {
      // The cells where a kept definition has one value, read off an index
      // of every cell's, made once a placement: the where still reads each.
      const pin = keptPin(bnd, sc, env) as { fn: string; read: string; value: Expr };
      const t = once(compileExpr(pin.value, sc, env, out), out);
      expect(t, "num", `${pin.fn}(${bnd.name})`);
      sort = elem("cell");
      const a = Out.fresh("_a");
      const ix = Out.fresh("_i");
      out.emit(
        `const ${a} = ${pin.fn}Kept.valued(b, ${pin.read}, sp.cells, ${t.code});`,
      );
      out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
      out.emit(`const ${v} = ${a}[${ix}];`);
      pos = { arr: a, i: ix };
    } else if (
      bnd.of.k === "name" &&
      bnd.of.name === "cells" &&
      valuePin(bnd, sc, env) !== null
    ) {
      // The cells holding one value, read off an index of every cell's, made
      // once a placement: the where still reads each.
      const t = once(compileExpr(valuePin(bnd, sc, env) as Expr, sc, env, out), out);
      expect(t, "num", `value(${bnd.name})`);
      env.used.add("cellsValued");
      sort = elem("cell");
      const a = Out.fresh("_a");
      const ix = Out.fresh("_i");
      out.emit(`const ${a} = cellsValued(b, sp.cells, ${t.code});`);
      out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
      out.emit(`const ${v} = ${a}[${ix}];`);
      pos = { arr: a, i: ix };
    } else if (
      bnd.of.k === "name" &&
      bnd.of.name === "cells" &&
      chainPin(bnd, sc, env) !== null
    ) {
      // The cells whose chain holds one cell, read off the kept chains'
      // tree under it: the where still reads each, so it says what it said.
      const pin = chainPin(bnd, sc, env) as Expr;
      const x = once(compileExpr(pin, sc, env, out), out);
      expectElem(x, "cell", "chain");
      env.used.add("chainHolders");
      sort = elem("cell");
      const a = Out.fresh("_a");
      const ix = Out.fresh("_i");
      out.emit(
        `const ${a} = chainHolders(sp, b, ${namedBy(Out.fresh("_x"), env)}, ${x.code});`,
      );
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
    } else if (
      bnd.of.k === "set" &&
      bnd.of.elems.length <= 4 &&
      setLiteralElements(bnd.of.elems, sc, env)
    ) {
      // A set stated member by member is looped over as its members, with
      // no array made: Bridges' `{edge(c, y), end(c, y)}` and the `{c}` of
      // a conditional sum are read for every line at every rung. A member
      // equal to one before it is passed over, as the set holds it once.
      const vals = bnd.of.elems.map((x) => once(compileExpr(x, sc, env, out), out));
      const es = vals.map((x) => x.code);
      sort = vals[0].sort;
      const ix = Out.fresh("_i");
      out.open(`for (let ${ix} = 0; ${ix} < ${es.length}; ${ix}++) {`);
      out.emit(
        `const ${v} = ${es
          .slice(0, -1)
          .map((e, i) => `${ix} === ${i} ? ${e} : `)
          .join("")}${es[es.length - 1]};`,
      );
      for (let i = 1; i < es.length; i++)
        out.emit(
          `if (${ix} === ${i} && (${es
            .slice(0, i)
            .map((e) => `${v} === ${e}`)
            .join(" || ")})) continue;`,
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
        bit = true;
      } else if (s.sort.k === "cands") {
        // Listed before the loop, so a strike the loop makes moves nothing
        // it walks.
        sort = NUM;
        const a = Out.fresh("_a");
        const ix = Out.fresh("_i");
        out.emit(`const ${a} = b.candList(${s.code});`);
        out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
        out.emit(`const ${v} = ${a}[${ix}];`);
        bit = true;
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
    binderOpened(recheck, out, loop);
    const bound: Val = {
      code: v,
      sort,
      at: h === null ? undefined : out.slot(h.loops),
      ...(pos === undefined ? {} : { pos }),
      ...(members === undefined ? {} : { members }),
      ...(names === null ? {} : { names }),
      ...(edgeSet === null ? {} : { edgeSet }),
      ...(bit ? { bit } : {}),
    };
    inner.set(bnd.name, bound);
    if (bnd === env.visitBinder) {
      if (skip !== "continue")
        throw new CompileError(`${bnd.name}: a visited binder loops`);
      out.emit(
        `if (_visit !== null) { if (_visit[${v}] === 0) continue; _visit[${v}] = 0; }`,
      );
    }
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
    binderClosed(recheck, loop);
    if (h !== null && loop) h.loops--;
    if (loop || closeBlock) out.close();
  };
  walk(0, scope);
}

/**
 * Where `bnd`, a binder over the cells, has a conjunct `value(x) = t`, `t`
 * reading nothing `bnd` binds, and `value` reads the marks' own grid: `t`, so
 * the cells can be read off an index of every cell's value (Crossing's
 * squares holding a number's first digit).
 */
function valuePin(bnd: Binder, scope: Scope, env: Env): Expr | null {
  if (bnd.kind !== "in" || bnd.where === null) return null;
  for (const c of fillConjuncts(bnd.where, scope, env)) {
    if (c.k !== "bin" || c.op !== "=") continue;
    for (const [side, other] of [
      [c.a, c.b],
      [c.b, c.a],
    ] as const) {
      if (
        side.k !== "call" ||
        side.fn !== "value" ||
        scope.has("value") ||
        side.args.length !== 1 ||
        side.args[0].k !== "name" ||
        side.args[0].name !== bnd.name
      )
        continue;
      const reads = new Set<string>();
      freeNames(other, reads, new Set());
      if (reads.has(bnd.name)) continue;
      const mark = Out.mark();
      const y = Out.fresh("_y");
      const probe = new Out(0);
      const f = compileExpr(
        side,
        new Map([...scope, [bnd.name, { code: y, sort: elem("cell") }]]),
        env,
        probe,
      );
      Out.rewind(mark);
      if (probe.entries.length === 0 && f.code === `(b.grid[${y}] || -1)`) return other;
    }
  }
  return null;
}

/**
 * Where `bnd`, a binder over the cells, has a conjunct `f(x) = t` of a
 * definition `f` kept for the marks, `t` reading nothing `bnd` binds: `f`,
 * the code reading it of a cell, and `t`, so the cells can be read off an
 * index of every cell's value (Signpost's squares holding a number).
 */
function keptPin(
  bnd: Binder,
  scope: Scope,
  env: Env,
): { fn: string; read: string; value: Expr } | null {
  if (bnd.kind !== "in" || bnd.where === null) return null;
  for (const c of fillConjuncts(bnd.where, scope, env)) {
    if (c.k !== "bin" || c.op !== "=") continue;
    for (const [side, other] of [
      [c.a, c.b],
      [c.b, c.a],
    ] as const) {
      if (
        side.k !== "call" ||
        scope.has(side.fn) ||
        !env.defs.has(side.fn) ||
        side.args.length !== 1 ||
        side.args[0].k !== "name" ||
        side.args[0].name !== bnd.name
      )
        continue;
      const reads = new Set<string>();
      freeNames(other, reads, new Set());
      if (reads.has(bnd.name)) continue;
      const mark = Out.mark();
      const y = Out.fresh("_y");
      const probe = new Out(0);
      const f = compileExpr(
        side,
        new Map([...scope, [bnd.name, { code: y, sort: elem("cell") }]]),
        env,
        probe,
      );
      if (
        probe.entries.length > 0 ||
        f.sort.k !== "num" ||
        !f.code.startsWith(`${side.fn}(b, `)
      ) {
        Out.rewind(mark);
        continue;
      }
      return { fn: side.fn, read: `(${y}: number): number => ${f.code}`, value: other };
    }
  }
  return null;
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
  const probe: Env = {
    ...env,
    used: new Set(),
    scratch: null,
    hoist: null,
    boardRoot: null,
  };
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
    const probe: Env = {
      ...env,
      used: new Set(),
      scratch: null,
      hoist: null,
      boardRoot: null,
    };
    if (setKey(compileExpr(b.of, scope, probe, new Out(0))) !== set) continue;
    return { fn: agg.fn, t, unless };
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
  // A filling gives values to what holds the answer's: cells, or edges.
  const held = elem(env.answerSort);
  if (!(isArray(s.sort) && s.sort.k === "set" && sameSort(s.sort.of, held)))
    throw new CompileError(
      `fill ${f} of ${show(s.sort)}: not a set of ${env.answerSort}s`,
    );
  if (bnd.from !== undefined && bnd.from !== "cand")
    throw new CompileError(`fill ${f} from ${bnd.from}: only from cand`);
  const a = Out.fresh("_a");
  const fv = heldName("_f", env);
  const last = heldName("_l", env);
  const st = Out.fresh("_s");
  // Each a call: the values by cell, the set they were last given over, so
  // the next enumeration clears it, and each depth's last value tried.
  const decls = [
    `const ${fv} = new Int32Array(${answerCount(env)}).fill(-1);`,
    `let ${last}: readonly number[] = [];`,
    `const ${st}: number[] = [];`,
  ];
  if (env.scratch !== null && env.held !== undefined) {
    env.held.push(
      `let ${fv} = new Int32Array(0);`,
      `let ${last}: readonly number[] = [];`,
    );
    // Cleared whole each run: the set it was last given over may be a
    // scratch array the run before has since refilled.
    env.scratch.push(
      `if (${fv}.length < ${answerCount(env)}) ${fv} = new Int32Array(${answerCount(env)}).fill(-1);`,
      `else ${fv}.fill(-1);`,
      `${last} = [];`,
      `const ${st}: number[] = [];`,
    );
  } else if (env.scratch !== null) env.scratch.push(...decls);
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
      expectElem(x, env.answerSort, f);
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
        inner.set(pair.x, { code: e, sort: held });
        inner.set(pair.y, { code: y, sort: held });
        const flat: Env = { ...env, hoist: null, boundSets: env.hoist !== null };
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
          env.memo ? candOf(e, env) : marksRead("cand", e, env),
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
  const probe: Env = {
    ...env,
    used: new Set(),
    scratch: null,
    hoist: null,
    boardRoot: null,
  };
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
  const probe: Env = {
    ...env,
    used: new Set(),
    scratch: null,
    hoist: null,
    boardRoot: null,
  };
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
  const pj = heldName("_p", env);
  const last = heldName("_l", env);
  const any = Out.fresh("_y");
  const made = Out.fresh("_g");
  const decls = [
    `const ${pj} = new Int32Array(${answerCount(env)});`,
    `let ${last}: readonly number[] = [];`,
    `let ${any} = false;`,
  ];
  if (env.scratch !== null && env.held !== undefined) {
    env.held.push(
      `let ${pj} = new Int32Array(0);`,
      `let ${last}: readonly number[] = [];`,
    );
    // Cleared whole each run, as the filling's values are.
    env.scratch.push(
      `if (${pj}.length < ${answerCount(env)}) ${pj} = new Int32Array(${answerCount(env)});`,
      `else ${pj}.fill(0);`,
      `${last} = [];`,
      `let ${any} = false;`,
    );
  } else if (env.scratch !== null) env.scratch.push(...decls);
  else for (const d of decls) out.emit(d);
  // The rest's names are bound anew there, so the projection is due again.
  slot.lines.push({ indent: 0, text: `let ${made} = -1;` });
  out.open(`if (${made} !== _epoch) {`);
  out.emit(`${made} = _epoch;`);
  const x0 = Out.fresh("_e");
  out.emit(`for (const ${x0} of ${last}) ${pj}[${x0}] = 0;`);
  out.emit(`${any} = false;`);
  const pattern = onlyRunPattern(bnd, [...rest, e.body], scope, env);
  if (pattern !== null) {
    // Every filling at once, by the line's dynamic program.
    const S = once(compileExpr(bnd.of, scope, env, out), out);
    const o = Out.fresh("_o");
    const fits = fitsCall(bnd, S, pattern, o, scope, env, out);
    out.open(`if (${fits}) {`);
    out.emit(`${last} = ${S.code};`);
    out.emit(`${any} = true;`);
    out.emit(
      `for (let ${x0} = 0; ${x0} < ${S.code}.length; ${x0}++) ${pj}[${S.code}[${x0}]] = ${o}[${x0}];`,
    );
    out.close();
  } else {
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
  }
  out.close();
  const x = once(compileExpr(pin.x, scope, env, out), out);
  expectElem(x, env.answerSort, f);
  const t = once(compileExpr(pin.t, scope, env, out), out);
  expect(t, "num", f);
  const s = compileExpr(bnd.of, scope, env, out);
  // Off S, f(x) is -1, which only a t of -1 equals. A numeral t is widened,
  // which the typechecker otherwise calls a comparison that cannot hold.
  return {
    code: `((((${pj}[${x.code}] >> ${t.code}) & 1) !== 0) || ((${t.code} as number) === -1 && ${any} && !${s.code}.includes(${x.code})))`,
    sort: BOOL,
  };
}

/** `run_lengths(L, {x in cells(L) where f(x) = v}) = R`, either way round, where
 * the filling `f` is of `cells(L)` itself and neither `v` nor `R` reads it:
 * the line, the run value and the lengths. */
function runPatternOf(
  c: Expr,
  f: string,
  set: string,
  scope: Scope,
  env: Env,
): { L: Expr; v: Expr; R: Expr } | null {
  if (c.k !== "bin" || c.op !== "=") return null;
  for (const [r, R] of [
    [c.a, c.b],
    [c.b, c.a],
  ]) {
    if (r.k !== "call" || r.fn !== "run_lengths" || r.args.length !== 2 || reads(R, f))
      continue;
    const [L, T] = r.args;
    if (reads(L, f) || T.k !== "agg" || T.fn !== "set" || T.where !== null) continue;
    const [b] = T.binders;
    if (T.binders.length !== 1 || b.kind !== "in" || b.where === null) continue;
    if (T.term?.k !== "name" || T.term.name !== b.name) continue;
    const cellsOfL: Expr = { k: "call", fn: "cells", args: [L] };
    if (JSON.stringify(b.of) !== JSON.stringify(cellsOfL)) continue;
    const pin = pinOf(b.where, f);
    if (pin === null || pin.x.k !== "name" || pin.x.name !== b.name) continue;
    const probe: Env = {
      ...env,
      used: new Set(),
      scratch: null,
      hoist: null,
      boardRoot: null,
    };
    if (setKey(compileExpr(cellsOfL, scope, probe, new Out(0))) !== set) continue;
    return { L, v: pin.t, R };
  }
  return null;
}

/** The run pattern a filling's conditions `conds` are, read through the
 * definitions they call, where they are that and nothing else (a `true`
 * aside), and the filling is of a line's squares from `cand` or from the
 * domain; else `null`. */
function onlyRunPattern(
  bnd: Binder,
  conds: readonly Expr[],
  scope: Scope,
  env: Env,
): { L: Expr; v: Expr; R: Expr } | null {
  if (bnd.kind !== "fill" || (bnd.from !== undefined && bnd.from !== "cand"))
    return null;
  const cs = conds
    .flatMap((c) => fillConjuncts(c, scope, env))
    .filter((c) => !(c.k === "name" && c.name === "true"));
  if (cs.length !== 1) return null;
  const probe: Env = {
    ...env,
    used: new Set(),
    scratch: null,
    hoist: null,
    boardRoot: null,
  };
  const s = compileExpr(bnd.of, scope, probe, new Out(0));
  return runPatternOf(cs[0], bnd.name, setKey(s), scope, env);
}

/**
 * The runtime's `runFits` over the filling `bnd` of the line `S`, with its
 * squares' masks read from `cand` or the domain: TypeScript that is whether
 * any filling fits `pattern`, and that writes each square's values over the
 * fillings into `o`, by the square's place on the line, where `o` is given.
 */
function fitsCall(
  bnd: Binder,
  S: Val,
  pattern: { L: Expr; v: Expr; R: Expr },
  o: string | null,
  scope: Scope,
  env: Env,
  out: Out,
): string {
  const v = compileExpr(pattern.v, scope, env, out);
  expect(v, "num", "run_lengths");
  const R = compileExpr(pattern.R, scope, env, out);
  if (R.sort.k !== "list")
    throw new CompileError(`run_lengths(L, S) = ${show(R.sort)}`);
  const m = Out.fresh("_m");
  const i = Out.fresh("_i");
  const x = Out.fresh("_e");
  const decls = [
    `const ${m} = new Int32Array(${answerCount(env)});`,
    ...(o === null ? [] : [`const ${o} = new Int32Array(${answerCount(env)});`]),
  ];
  if (env.scratch !== null) env.scratch.push(...decls);
  else for (const d of decls) out.emit(d);
  const mask =
    bnd.from === undefined
      ? "b.domain"
      : supposedRead(
          x,
          env,
          (sup) => `(1 << ${sup.value})`,
          env.memo ? candOf(x, env) : marksRead("cand", x, env),
        );
  out.open(`for (let ${i} = 0; ${i} < ${S.code}.length; ${i}++) {`);
  out.emit(`const ${x} = ${S.code}[${i}];`);
  out.emit(`${m}[${i}] = ${mask};`);
  out.close();
  env.used.add("runFits");
  const fits = Out.fresh("_y");
  out.emit(
    `const ${fits} = runFits(${m}, ${S.code}.length, ${v.code}, ${R.code}, ${o ?? "null"});`,
  );
  return fits;
}

/**
 * `exists fill f of cells(L) [from cand] where ...: ...` whose conditions,
 * its `where` and its body alike, are one run pattern (`runPatternOf`) and
 * any number of pins `f(x) = t`: decided by the runtime's `runFits`, a
 * dynamic program over the line, where listing the fillings would take time
 * exponential in the line's length. `null` for any other shape.
 */
function runFill(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  const [bnd, ...more] = e.binders;
  if (e.q !== "exists" || more.length > 0 || bnd.kind !== "fill") return null;
  const f = bnd.name;
  const conds = [
    ...(bnd.where === null ? [] : fillConjuncts(bnd.where, scope, env)),
    e.body,
  ];
  const pinned = conds.flatMap((c) => {
    const pin = pinOf(c, f);
    return pin === null ? [] : [pin];
  });
  const pattern = onlyRunPattern(
    bnd,
    conds.filter((c) => pinOf(c, f) === null),
    scope,
    env,
  );
  if (pattern === null) return null;
  const S = once(compileExpr(bnd.of, scope, env, out), out);
  const o = Out.fresh("_o");
  const tests = [
    fitsCall(bnd, S, pattern, pinned.length > 0 ? o : null, scope, env, out),
  ];
  for (const pin of pinned) {
    const px = once(compileExpr(pin.x, scope, env, out), out);
    expectElem(px, env.answerSort, f);
    const t = once(compileExpr(pin.t, scope, env, out), out);
    expect(t, "num", f);
    const at = Out.fresh("_p");
    out.emit(`const ${at} = ${S.code}.indexOf(${px.code});`);
    // Off the line f(x) is -1, which only a t of -1 equals.
    tests.push(
      `(${at} < 0 ? (${t.code} as number) === -1 : ((${o}[${at}] >> ${t.code}) & 1) !== 0)`,
    );
  }
  return { code: `(${tests.join(" && ")})`, sort: BOOL };
}

/**
 * A `sum`, `count`, `forall` or `exists` over the set `linked(k)` of the
 * marks, whose term reads them only round its own point, read from the sum
 * the runtime keeps over each group as the hand-written solver kept its
 * groups' exits (`linkedSum`): joined as two groups join, and moved a
 * placement at a time. Without it, every read walked the whole group. `null`
 * where the aggregate is not one.
 */
function linkedAggregate(
  how: "sum" | "count" | "forall" | "exists",
  binders: readonly Binder[],
  where: Expr | null,
  term: Expr | null,
  scope: Scope,
  env: Env,
): Val | null {
  const { kept } = env;
  if (
    kept === null ||
    env.answer !== null ||
    env.position !== null ||
    env.supposed.length > 0 ||
    binders.length !== 1 ||
    binders[0].kind !== "in"
  )
    return null;
  const [binder] = binders;
  const of = binder.of;
  const set =
    of.k === "name"
      ? scope.get(of.name)
      : of.k === "call" && of.fn === "linked" && !scope.has("linked")
        ? compileExpr(of, scope, env, new Out(0))
        : undefined;
  if (set?.group === undefined) return null;
  const filter =
    binder.where === null
      ? where
      : where === null
        ? binder.where
        : ({ k: "bin", op: "and", a: binder.where, b: where } as const);
  const point = new Map<string, RoundName>([[binder.name, "point"]]);
  if (filter !== null && !readsRound(filter, point, env)) return null;
  if (term !== null && !readsRound(term, point, env)) return null;

  const key = JSON.stringify([how, binder.name, filter, term]);
  let made = kept.terms.get(key);
  if (made === undefined) {
    const v = `v_${binder.name}`;
    const readsClues = { yes: false };
    const body = new Out(1);
    const sc: Scope = new Map([[binder.name, { code: v, sort: elem("point") }]]);
    const own: Env = {
      ...env,
      used: kept.used,
      readsClues,
      readsSizes: undefined,
      scratch: null,
      hoist: null,
      boardRoot: null,
      concluding: false,
      memo: false,
      epoch: null,
    };
    if (how !== "count" && term === null) return null;
    Out.own("", () => {
      if (filter !== null) {
        const w = compileExpr(filter, sc, own, body);
        expect(w, "bool", how);
        body.emit(`if (!(${w.code})) return 0;`);
      }
      if (term === null || how === "count") body.emit("return 1;");
      else {
        const t = compileExpr(term, sc, own, body);
        expect(t, how === "sum" ? "num" : "bool", how);
        body.emit(
          how === "sum"
            ? `return ${t.code};`
            : `return (${t.code}) ? ${how === "forall" ? "0 : 1" : "1 : 0"};`,
        );
      }
    });
    const fn = `linkTerm${kept.terms.size}`;
    const text = body.text();
    // A term that reads no marks, or no geometry, leaves its parameter unread.
    const param = (p: string): string =>
      new RegExp(`\\b${p}\\.`).test(text.join("\n")) ? p : `_${p}`;
    kept.defs.set(fn, {
      sort: NUM,
      clues: readsClues.yes,
      board: false,
      code: [
        `/** What each point of a group adds to a ${how} kept over the group. */`,
        `function ${fn}(${param("b")}: Marks, ${param("sp")}: GridSpace, ${readsClues.yes ? "cl: Dealt" : "_cl: null"}, ${v}: number): number {`,
        ...text,
        "}",
      ].join("\n"),
    });
    made = { fn, clues: readsClues.yes };
    kept.terms.set(key, made);
  }
  if (made.clues) env.readsClues.yes = true;
  env.used.add("linkedSum");
  const sum = `linkedSum(sp, b, ${made.clues ? "cl" : "null"}, ${made.fn}, ${set.group})`;
  switch (how) {
    case "forall":
      return { code: `(${sum} === 0)`, sort: BOOL };
    case "exists":
      return { code: `(${sum} > 0)`, sort: BOOL };
    default:
      return { code: sum, sort: NUM };
  }
}

/**
 * Where `of`, the set a binder names, is `{x in edges where P}` and `P`
 * reads the marks only at the edge (`readsAtEdge`), and at most one number
 * bound before it: `P` compiled once as a function of the module, so the
 * groups the set joins are kept on the marks a placement at a time
 * (`keptEdgeGroups`) rather than joined afresh at each binding, which
 * cost Filling's deals a fifth of their time. `null` for any other set.
 */
function keptEdgeSet(
  of: Expr,
  scope: Scope,
  env: Env,
): ReturnType<NonNullable<Val["edgeSet"]>> {
  const { kept } = env;
  if (
    kept === null ||
    env.answer !== null ||
    env.position !== null ||
    env.supposed.length > 0
  )
    return null;
  const set = inlined(of, scope, env);
  if (
    set.k !== "agg" ||
    set.fn !== "set" ||
    set.binders.length !== 1 ||
    set.where !== null ||
    set.term?.k !== "name"
  )
    return null;
  const [bnd] = set.binders;
  if (
    bnd.kind !== "in" ||
    bnd.of.k !== "name" ||
    bnd.of.name !== "edges" ||
    scope.has("edges") ||
    bnd.where === null ||
    set.term.name !== bnd.name
  )
    return null;
  const outer = new Set<string>();
  if (!readsAtEdge(bnd.where, bnd.name, scope, env, outer) || outer.size > 1)
    return null;
  const [a] = outer;
  const key = JSON.stringify(["edges", bnd.name, bnd.where, a ?? null]);
  let made = kept.terms.get(key);
  if (made === undefined) {
    const v = `v_${bnd.name}`;
    const readsClues = { yes: false };
    const body = new Out(1);
    const sc = new Map<string, Val>([[bnd.name, { code: v, sort: elem("edge") }]]);
    if (a !== undefined) sc.set(a, { code: "a", sort: (scope.get(a) as Val).sort });
    const own: Env = {
      ...env,
      used: kept.used,
      readsClues,
      readsSizes: undefined,
      scratch: null,
      hoist: null,
      boardRoot: null,
      concluding: false,
      memo: false,
      epoch: null,
    };
    const where = bnd.where;
    const w = Out.own("", () => compileExpr(where, sc, own, body));
    expect(w, "bool", `{${bnd.name} in edges where …}`);
    body.emit(`return ${w.code};`);
    const fn = `edgeHolds${kept.terms.size}`;
    const text = body.text();
    const param = (p: string): string =>
      new RegExp(`\\b${p}\\b`).test(text.join("\n")) ? p : `_${p}`;
    kept.defs.set(fn, {
      sort: BOOL,
      clues: readsClues.yes,
      board: false,
      code: [
        "/** Whether an edge is in a set whose groups are kept on the marks. */",
        `function ${fn}(${param("b")}: Marks, ${param("sp")}: GridSpace, ${readsClues.yes ? "cl: Dealt" : "_cl: null"}, ${v}: number, ${param("a")}: number): boolean {`,
        ...text,
        "}",
      ].join("\n"),
    });
    made = { fn, clues: readsClues.yes };
    kept.terms.set(key, made);
  }
  return {
    fn: made.fn,
    arg: a === undefined ? "0" : (scope.get(a) as Val).code,
    clues: made.clues,
  };
}

/**
 * In the answer check, a statement about the graph a set of edges makes,
 * read as one over the graph: the through form (`joinOf`) as every member
 * of its two sets in one group, where pair by pair it is quadratic in the
 * squares (Net's network on a large board), and "no line closes a loop"
 * (`cycleOf`) as no line on a cycle, where line by line it is a walk from
 * each. `null` for any other statement, and in any other check, where the
 * statement is read on marks or a board still open.
 */
function wholeGraph(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  if (env.answer === null || env.answer.partial === true || env.supposed.length > 0)
    return null;
  const join = joinOf(e);
  if (join !== null) {
    const E = once(compileExpr(join.E, scope, env, out), out).code;
    const [A, B] = [join.A, join.B].map(
      (s) => once(compileExpr(s, scope, env, out), out).code,
    );
    const [groups, all, r] = ["_eg", "_all", "_q"].map((p) => Out.fresh(p));
    env.used.add("edgeGroups");
    out.emit(`const ${groups} = edgeGroups(sp, [...${E}]);`);
    out.emit(`const ${all} = [...${A}, ...${B}];`);
    out.emit(
      `const ${r} = [...${A}].length === 0 || [...${B}].length === 0 || ${all}.every((c) => ${groups}.of(c) === ${groups}.of(${all}[0]));`,
    );
    return { code: r, sort: BOOL };
  }
  const cycle = env.answerSort === "edge" ? cycleOf(e, scope, env) : null;
  if (cycle === null) return null;
  const set: Expr = {
    k: "agg",
    fn: "set",
    binders: [cycle],
    where: null,
    term: { k: "name", name: cycle.name },
  };
  const E = once(compileExpr(set, scope, env, out), out).code;
  env.used.add("cycleEdges");
  return { code: `(cycleEdges(sp, [...${E}]).length === 0)`, sort: BOOL };
}

/**
 * `forall R = through(x, O): P` (or `exists`), `O` a set whose groups are
 * kept (`keptEdgeSet`), and `P` reading `R` but no marks and nothing else
 * bound: a truth about the group, so it is made once a group, kept by the
 * group's list beside where `O` is bound and read by every square of it.
 * Galaxies' `finished(x, O)` was made once a square, and for each dot near
 * it. `null` for any other quantifier.
 */
function groupQuantifier(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  if (env.hoist === null || e.binders.length !== 1) return null;
  const [bnd] = e.binders;
  if (bnd.kind !== "let" || bnd.where !== null) return null;
  const of = inlined(bnd.of, scope, env);
  if (
    of.k !== "call" ||
    of.fn !== "through" ||
    of.args.length !== 2 ||
    scope.has("through")
  )
    return null;
  const [, setArg] = of.args;
  if (setArg.k !== "name") return null;
  const O = scope.get(setArg.name);
  const kept = O?.edgeSet?.() ?? null;
  if (O?.at === undefined || kept === null) return null;
  const free = new Set<string>();
  freeNames(e.body, free, new Set([bnd.name]));
  if ([...free].some((n) => scope.has(n))) return null;
  if (readsMarks(e.body, env)) return null;
  const R = once(compileExpr(bnd.of, scope, env, out), out);
  const key = `memo ${e.q} ${bnd.name} ${JSON.stringify(e.body)}`;
  let memo = O.at.made.get(key);
  if (memo === undefined) {
    const m = Out.fresh("_memo");
    O.at.lines.push({
      indent: 0,
      text: `const ${m} = new Map<readonly number[], boolean>();`,
    });
    memo = { code: m, sort: BOOL };
    O.at.made.set(key, memo);
  }
  const v = Out.fresh("_gq");
  out.emit(`let ${v} = ${memo.code}.get(${R.code});`);
  out.open(`if (${v} === undefined) {`);
  const inner = new Map(scope);
  inner.set(bnd.name, { code: R.code, sort: R.sort });
  // The quantifier read with its one binding made: its body, as it is.
  const body = quantifierOver(e, inner, env, out);
  out.emit(`${v} = ${body};`);
  out.emit(`${memo.code}.set(${R.code}, ${v});`);
  out.close();
  return { code: v, sort: BOOL };
}

/**
 * `set(t over x in through(c, O) …)`, `O` a set of edges a binder or a
 * parameter names, and the rest reading no marks and no name bound after
 * `O`: a set made of the group, so it is made once a group, kept by the
 * group's list beside where `O` is bound. Net's `run` made the dead ends
 * round a reach's group once from each side of the square it walked from,
 * and those walks mostly meet one group. `null` for any other aggregate.
 */
function groupSet(
  e: Extract<Expr, { k: "agg" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  if (env.hoist === null || e.fn !== "set" || e.where !== null) return null;
  const [first, ...rest] = e.binders;
  if (first?.kind !== "in") return null;
  const of = first.of;
  if (
    of.k !== "call" ||
    of.fn !== "through" ||
    of.args.length !== 2 ||
    scope.has("through")
  )
    return null;
  const [, setArg] = of.args;
  if (setArg.k !== "name") return null;
  const O = scope.get(setArg.name);
  if (O?.at === undefined || !isSetOf(O.sort, "edge")) return null;
  const Oat = O.at;
  // The set with its group a name of its own, which nothing else binds.
  const group = Out.fresh("_grp");
  const over: Extract<Expr, { k: "agg" }> = {
    ...e,
    binders: [{ ...first, of: { k: "name", name: group } }, ...rest],
  };
  // What the set reads past its group: names bound no later than `O`, so the
  // group's set stands for as long as `O` does.
  const free = new Set<string>();
  freeNames(over, free, new Set([group]));
  for (const n of free) {
    const v = scope.get(n);
    if (v !== undefined && (v.at === undefined || v.at.seq > Oat.seq)) return null;
  }
  if (readsMarks(over, env)) return null;
  const R = once(compileExpr(first.of, scope, env, out), out);
  const key = `memo set ${JSON.stringify(e)}`;
  const kept = Oat.made.get(key);
  const m = kept?.code ?? Out.fresh("_memo");
  const v = Out.fresh("_gs");
  out.emit(`let ${v} = ${m}.get(${R.code});`);
  out.open(`if (${v} === undefined) {`);
  const inner = new Map(scope);
  inner.set(group, { code: R.code, sort: R.sort });
  const made = compileNode(over, inner, env, out);
  // A set of elements is the site's array, which its next making empties:
  // the memo keeps a copy.
  out.emit(`${v} = ${made.code}${isArray(made.sort) ? ".slice()" : ""};`);
  out.emit(`${m}.set(${R.code}, ${v});`);
  out.close();
  if (kept === undefined) {
    Oat.lines.push({
      indent: 0,
      text: `const ${m} = new Map<readonly number[], ${tsType(made.sort)}>();`,
    });
    Oat.made.set(key, { code: m, sort: made.sort });
  }
  return { code: v, sort: made.sort };
}

/** A quantifier whose one binding is in `scope` already: its body. */
function quantifierOver(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): string {
  const v = compileExpr(e.body, scope, env, out);
  expect(v, "bool", e.q);
  return v.code;
}

function quantifier(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  const linked = linkedAggregate(e.q, e.binders, null, e.body, scope, env);
  if (linked !== null) return linked;
  const whole = wholeGraph(e, scope, env, out);
  if (whole !== null) return whole;
  const ofGroup = groupQuantifier(e, scope, env, out);
  if (ofGroup !== null) return ofGroup;
  const forall = e.q === "forall";
  const masked =
    setQuantifier(e, scope, env, out) ?? rectQuantifier(e, scope, env, out);
  if (masked !== null) return masked;
  const projected = projection(e, scope, env, out);
  if (projected !== null) return projected;
  const fitted = runFill(e, scope, env, out);
  if (fitted !== null) return fitted;
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
  if (e.fn === "sum" || e.fn === "count") {
    const linked = linkedAggregate(e.fn, e.binders, e.where, e.term, scope, env);
    if (linked !== null) return linked;
  }
  const ofGroup = groupSet(e, scope, env, out);
  if (ofGroup !== null) return ofGroup;
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
      if (countedSlope(e) !== 0) {
        // Of the numbers a range counts, the first that passes from the end
        // the answer lies at is the answer: a position along a long line, or
        // Signpost's nearest number held, found without reading the rest.
        out.open(`${label}: {`);
        bindingLoops(
          e.binders,
          scope,
          env,
          out,
          (sc) => {
            const t = once(term(sc), out);
            expect(t, "num", e.fn);
            out.emit(`${r} = ${t.code};`);
            out.emit(`break ${label};`);
          },
          (e.fn === "max") === (countedSlope(e) === 1),
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
      const probe: Env = {
        ...env,
        used: new Set(),
        scratch: null,
        hoist: null,
        boardRoot: null,
      };
      bindingLoops(e.binders, scope, probe, new Out(0), (sc) => {
        termSort =
          e.term === null
            ? name(last.name, sc, probe, new Out(0)).sort
            : compileExpr(e.term, sc, probe, new Out(0)).sort;
      });
      if (!scalar(termSort) || termSort.k === "none")
        throw new CompileError(`set(…) of ${show(termSort)}`);
      sort = setOf(termSort);
      if (isMask(sort) && env.wide) throw new CompileError(MASK_IN_WIDE);
      // A member already kept is told by the site's marks, not a scan of
      // what it has kept, which grows quadratic over a reach across the
      // board (Net's `run`).
      const marks =
        !plain && !isMask(sort) && env.scratch !== null ? heldName("_st", env) : null;
      if (isMask(sort)) {
        out.emit(`let ${r} = 0;`);
        if (memberUnion(e, r, scope, env, out)) break;
      } else if (env.scratch !== null) {
        // One array a site, emptied each time the site is evaluated: its
        // value is read only until the site is evaluated again, and a
        // reason copies what it keeps.
        env.scratch.push(`const ${r}: number[] = [];`);
        out.emit(`${r}.length = 0;`);
        if (marks !== null) {
          // A rung's stamps outlive its run: the pass only grows, so a
          // stamp from an earlier run never matches.
          if (env.held !== undefined) env.held.push(`const ${marks} = stamps();`);
          else env.scratch.push(`const ${marks} = stamps();`);
          env.used.add("stamps");
          env.used.add("addOnce");
          out.emit(`${marks}.pass++;`);
        }
      } else out.emit(`const ${r}: number[] = [];`);
      loops((sc) => {
        const t = once(term(sc), out);
        if (t.sort.k === "num") out.emit(`${r} |= 1 << ${t.code};`);
        else if (plain) out.emit(`${r}.push(${t.code});`);
        else if (marks !== null) {
          // A short set is scanned in place, which a call to stamp costs
          // more than: Palisade's deals took 1.13 of the time stamping every
          // member (2026-11-09).
          const v = Out.fresh("_t");
          out.emit(`const ${v} = ${t.code};`);
          out.emit(
            `if (${r}.length < ${SCANNED_SET}) { if (!${r}.includes(${v})) ${r}.push(${v}); } else addOnce(${r}, ${marks}, ${v});`,
          );
        } else out.emit(`if (!${r}.includes(${t.code})) ${r}.push(${t.code});`);
      });
      break;
    }
  }
  return { code: r, sort };
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

/** `sight(s, M)` and its kin: the sightline from slot `s`, turned by the
 * mirrors clue kind `M` deals, 1 `\` and 2 `/`. */
function bentSight(
  fn: string,
  args: readonly Expr[],
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  if (args.length !== 2) throw new CompileError(`${fn}(s, mirrors) takes 2`);
  const m = args[1];
  if (m.k !== "name" || !env.clues.has(m.name))
    throw new CompileError(
      `${fn}(s, M): M names a clue kind of the description${m.k === "name" ? `, and ${m.name} is none` : ""}`,
    );
  const kind = env.clues.get(m.name) as ClueKind;
  if (!sameSort(kind.at, elem("cell")) || kind.per)
    throw new CompileError(`${fn}(s, ${m.name}): the mirrors sit one a cell`);
  const refused = noGeometry("slots", env);
  if (refused !== null) throw new CompileError(refused);
  const s = compileExpr(args[0], scope, env, out);
  expectElem(s, "slot", fn);
  env.readsClues.yes = true;
  env.used.add("sights");
  const field = SIGHT_BENT.get(fn) as string;
  return {
    code: `sights(sp, cl.${m.name})[${s.code}].${field}`,
    sort: field === "exit" ? elem("slot") : setOf(elem("cell")),
  };
}

/** A call with a form of its own, `latin(…)` or a bent sightline, or null. */
function ownForm(
  fn: string,
  args: readonly Expr[],
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  if (fn === "latin") return latin(args, scope, env, out);
  if (isBentSight(fn, args)) return bentSight(fn, args, scope, env, out);
  if (fn === "stretch") return stretchOver(args, scope, env, out);
  return null;
}

/**
 * `stretch(L, c, {x in cells(L) where P})`, `P` tested from `c` outward:
 * the run reads its own squares and the two that end it, so a boat walled in
 * by water is read whole with the rest of its row still open. `null` for any
 * other set, which `stretch` reads whole.
 */
function stretchOver(
  args: readonly Expr[],
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  if (args.length !== 3) return null;
  const [line, at] = args;
  // The set may be written through a definition, as Boats' `shipsOf(L)`.
  const S = inlined(args[2], scope, env);
  if (S.k !== "agg" || S.fn !== "set" || S.binders.length !== 1) return null;
  const b = S.binders[0];
  if (b.kind !== "in" || S.term?.k !== "name" || S.term.name !== b.name) return null;
  if (
    b.of.k !== "call" ||
    b.of.fn !== "cells" ||
    b.of.args.length !== 1 ||
    !sameTerm(b.of.args[0], line, scope, env)
  )
    return null;
  const L = compileExpr(line, scope, env, out);
  expectElem(L, "line", "stretch");
  const c = once(compileExpr(at, scope, env, out), out);
  expectElem(c, "cell", "stretch");
  const x = Out.fresh("_sx");
  const inS = Out.fresh("_in");
  const inner = new Map(scope).set(b.name, { code: x, sort: elem("cell") });
  out.open(`const ${inS} = (${x}: number): boolean => {`);
  const tests = [b.where, S.where].flatMap((w) => {
    if (w === null) return [];
    const v = compileExpr(w, inner, env, out);
    expect(v, "bool", "stretch");
    return [v.code];
  });
  out.emit(`return ${tests.length > 0 ? tests.join(" && ") : "true"};`);
  out.close("};");
  env.used.add("stretchWhere");
  return {
    code: `stretchWhere(sp.lineCells[${L.code}], ${c.code}, ${inS})`,
    sort: setOf(elem("cell")),
  };
}

/** `clue(kind, x)`, or `clue(kind, x, d)` of a clue per value: the clue of
 * that kind at `x`. */
function clueCall(args: readonly Expr[], scope: Scope, env: Env, out: Out): Val {
  const a = args[0];
  if (a.k !== "name" || !env.clues.has(a.name))
    throw new CompileError(
      `clue(kind, x) names a clue kind of the description${a.k === "name" ? `, and ${a.name} is none` : ""}`,
    );
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
  if (kind.list) {
    env.used.add("listAt");
    return { code: `listAt(cl.${a.name}, ${x.code})`, sort: kind.v };
  }
  env.used.add("clueAt");
  if (!kind.per) return { code: `clueAt(cl.${a.name}, ${x.code})`, sort: kind.v };
  const d = compileExpr(args[2], scope, env, out);
  expect(d, "num", "clue");
  env.used.add("perPlace");
  const place = `(${x.code} < 0 ? -1 : perPlace(${x.code}, ${d.code}))`;
  return { code: `clueAt(cl.${a.name}, ${place})`, sort: kind.v };
}

/**
 * A `place` or `strike` whose technique `says` something of each fact: on a
 * hint's path it reads what the fact has of its own where the fact is made,
 * in the conclusion's scope (the `forall` binders, and any `with` it writes),
 * and records it beside the fact, in step with `facts`.
 */
function factWithSays(
  fn: "strike" | "place",
  c: string,
  dv: Val,
  site: NonNullable<Env["factSays"]>,
  scope: Scope,
  env: Env,
  out: Out,
): void {
  const d = dv.code;
  const cond =
    fn === "strike" ? hasRead(c, d, env, dv.bit === true) : `!${marksRead("known", c)}`;
  out.open(`if (${cond}) {`);
  out.emit(`if (fire === null) { b.${fn}At(${c}, ${d}); changed = true; }`);
  out.open("if (fire !== null) {");
  const inner: Env = {
    ...env,
    concluding: false,
    shared: { made: new Map() },
    recheck: undefined,
  };
  const fields = { terms: [] as string[], marks: [] as string[] };
  const read = (e: Expr, group: "terms" | "marks", name: string): string => {
    const r = compileExpr(e, scope, inner, out);
    if (group === "marks" && !isArray(r.sort))
      throw new CompileError(`says fact marks ${name} is not a set of elements`);
    fields[group].push(`${name}: ${tsType(r.sort)};`);
    if (group === "terms") site.sorts.set(name, r.sort);
    return `${name}: ${isArray(r.sort) ? `${r.code}.slice()` : r.code}`;
  };
  const terms = site.says.terms.map((x) => read(x.expr, "terms", x.name));
  const marks = site.says.marks.map((x) => read(x.expr as Expr, "marks", x.role));
  site.fields.terms = fields.terms;
  site.fields.marks = fields.marks;
  // The wording that holds for this square, read where the fact is made.
  const wording =
    site.says.words.length > 1
      ? `wording: ${wordingIndex(site.says.words, "says fact", (e) => compileExpr(e, scope, inner, out))}, `
      : "";
  out.emit(`facts.push(${fn === "strike" ? "STRIKE" : "PLACE"}, ${c}, ${d});`);
  out.emit(
    `${site.buffer}.push({ ${wording}terms: { ${terms.join(", ")} }, marks: { ${marks.join(", ")} } });`,
  );
  out.close();
  out.close();
  env.used.add(fn === "strike" ? "STRIKE" : "PLACE");
}

/** `least_start(L, R, k, v)` or `greatest_start`: where run k of the runs R
 * of value v starts at the earliest or the latest on L, over the marks. A
 * hint's words read it. */
function runStartOf(fn: string, vs: readonly Val[], env: Env, out: Out): Val {
  expectElem(vs[0], "line", fn);
  if (vs[1].sort.k !== "list") throw new CompileError(`${fn}(L, R, k, v): R is a list`);
  expect(vs[2], "num", fn);
  expect(vs[3], "num", fn);
  if (env.supposed.length > 0)
    throw new CompileError(`${fn} reads the marks, and no supposition`);
  const held = markRead("value", { code: "_x", sort: elem("cell") }, env, out);
  env.used.add("runStart");
  return {
    code: `runStart(${vs[1].code}, ${vs[2].code}, sp.lineCells[${vs[0].code}].map((_x) => ${held.code}), ${vs[3].code}, ${fn === "greatest_start"})`,
    sort: NUM,
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
  const own = ownForm(fn, args, scope, env, out);
  if (own !== null) return own;
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
  const refused = noGeometry(fn, env);
  if (refused !== null) throw new CompileError(refused);
  if (!env.tiling && TILING_ONLY.has(fn))
    throw new CompileError(`${fn}: only a tiling has angles`);
  if (env.position !== null && (fn === "value" || fn === "known" || fn === "cand"))
    throw new CompileError(`${fn}: a position is read by its layers`);
  if (fn === "clue") return clueCall(args, scope, env, out);
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
    expectElem(x, env.answerSort, fn);
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
    tilingCall(fn, vs, env) ??
    relationCall(fn, vs, env, out) ??
    diagonalCall(fn, vs, env) ??
    rectCall(fn, vs, env) ??
    centerCall(fn, vs, env, out);
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
    case "compass":
      arity(3);
      expect(vs[1], "num", fn);
      expect(vs[2], "num", fn);
      env.used.add("compass");
      return {
        code: `compass(sp, ${cell(0)}, ${vs[1].code}, ${vs[2].code})`,
        sort: elem("cell"),
      };
    case "to":
      arity(1);
      return {
        code: `(${namedBy(Out.fresh("_x"), env)})(${cell(0)})`,
        sort: elem("cell"),
      };
    case "chain": {
      arity(1);
      env.used.add("chain");
      return {
        code: `chain(sp, ${namedBy(Out.fresh("_x"), env)}, ${cell(0)})`,
        sort: setOf(elem("cell")),
      };
    }
    case "onward": {
      arity(2);
      expect(vs[1], "num", fn);
      env.used.add("onward");
      return {
        code: `onward(${namedBy(Out.fresh("_x"), env)}, ${cell(0)}, ${vs[1].code})`,
        sort: elem("cell"),
      };
    }
    case "last": {
      arity(1);
      const kept = chainsKept(env);
      env.used.add(kept ? "chainEnd" : "lastOf");
      const next = namedBy(Out.fresh("_x"), env);
      return {
        code: kept
          ? `chainEnd(sp, b, ${next}, ${cell(0)})`
          : `lastOf(${next}, ${cell(0)})`,
        sort: elem("cell"),
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
        if (env.answer.partial) {
          // A beam reads the grid itself: decided only on a whole one.
          env.used.add("decidedAll");
          return {
            code: `(decidedAll(g, sp.cells), beamOf(sp, g, ${vs[0].code}))`,
            sort: NUM,
          };
        }
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
      expect(vs[1], "num", fn);
      if (L.sort.k === "list") {
        // A list's member, none past either end.
        env.used.add("nth");
        return { code: `nth(${L.code}, ${vs[1].code})`, sort: NUM };
      }
      if (!isArray(L.sort) || L.sort.k !== "set")
        throw new CompileError(`nth of ${show(L.sort)}: not an ordered set or a list`);
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
    case "run_lengths": {
      // The lengths of the maximal runs of S along L, in L's order.
      arity(2);
      expectElem(vs[0], "line", fn);
      const S = vs[1];
      if (!isSetOf(S.sort, "cell"))
        throw new CompileError(`run_lengths(L, ${show(S.sort)}): S is a set of cells`);
      env.used.add("runsOf");
      return {
        code: `runsOf(sp.lineCells[${vs[0].code}], ${S.code})`,
        sort: { k: "list" },
      };
    }
    case "least_start":
    case "greatest_start":
      arity(4);
      return runStartOf(fn, vs, env, out);
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
    case "cut_edges": {
      // The members of E whose two cells E joins only through them.
      arity(1);
      const E = vs[0];
      if (!isSetOf(E.sort, "edge"))
        throw new CompileError(`cut_edges(${show(E.sort)}): E is a set of edges`);
      env.used.add("cutEdges");
      return { code: `cutEdges(sp, ${E.code})`, sort: setOf(elem("edge")) };
    }
    case "matched":
      arity(2);
      return matchedCall(vs, env);
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
      return { code: edgeBetween(cell(0), cell(1), vs[0], vs[1]), sort: elem("edge") };
    case "crossedBy": {
      arity(1);
      expectElem(vs[0], "edge", fn);
      return { code: `sp.crossing[${vs[0].code}]`, sort: elem("edge") };
    }
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
    case "bits":
      // A number's one bits are a set of numbers as the mask holds one; none,
      // a number below 0, has none.
      arity(1);
      expect(vs[0], "num", fn);
      return { code: `Math.max(0, ${vs[0].code})`, sort: setOf(NUM) };
    case "times":
      arity(1);
      expect(vs[0], "num", fn);
      return { code: timesOf(vs[0].code, env), sort: NUM };
    case "range":
      arity(2);
      expect(vs[0], "num", fn);
      expect(vs[1], "num", fn);
      if (env.wide) throw new CompileError(MASK_IN_WIDE);
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
      if (s.sort.k === "cands") return { code: `b.candFirst(${s.code})`, sort: NUM };
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
        ((vs[0].sort.e === "edge" && env.answerSort !== "edge") ||
          vs[0].sort.e === "angle" ||
          (vs[0].sort.e === "cell" &&
            env.answerSort !== "cell" &&
            env.edgeMarkSort === "cell"))
      )
        return edgeStrike(fn, vs, env, out);
      expectElem(vs[0], env.answerSort, fn);
      const c = once(vs[0], out);
      expect(vs[1], "num", fn);
      const d = once(vs[1], out);
      // A fact that changes nothing is left out, so a binding fires only
      // where its conclusion changes the marks.
      if (env.factSays !== undefined) {
        factWithSays(fn, c.code, d, env.factSays, scope, env, out);
        return { code: "true", sort: BOOL };
      }
      out.emit(
        fn === "strike"
          ? `if (${hasRead(c.code, d.code, env, d.bit === true)}) { if (fire === null) { b.strikeAt(${c.code}, ${d.code}); changed = true; } else facts.push(STRIKE, ${c.code}, ${d.code}); }`
          : `if (!${marksRead("known", c.code)}) { if (fire === null) { b.placeAt(${c.code}, ${d.code}); changed = true; } else facts.push(PLACE, ${c.code}, ${d.code}); }`,
      );
      env.used.add(fn === "strike" ? "STRIKE" : "PLACE");
      return { code: "true", sort: BOOL };
    }
  }
  const def = env.defs.get(fn);
  if (def !== undefined) return definitionCall(fn, def, args, vs, env, out);
  throw new CompileError(`unknown function "${fn}"`);
}

/**
 * The function from a cell to the cell its value names by the answer's `to`,
 * -1 where it holds no value or names none: what `to(c)` and `chain(c)`
 * read. The value is read as the technique reads it, under any `with`. `x`
 * is the name of its parameter.
 */
function namedBy(x: string, env: Env): string {
  const to = env.to ?? null;
  if (to === null)
    throw new CompileError(
      "to and chain follow the answer's `to`, which it does not say",
    );
  const out = new Out(1);
  const read = markRead("value", { code: x, sort: elem("cell") }, env, out);
  const d = Out.fresh("_d");
  out.emit(`const ${d} = ${read.code};`);
  out.emit(`if (${d} < 0) return -1;`);
  // Compiled where it is read, not moved out of the function it makes.
  const scope = new Map<string, Val>([
    ["c", { code: x, sort: elem("cell") }],
    ["d", { code: d, sort: NUM }],
  ]);
  const v = compileExpr(
    to,
    scope,
    { ...env, hoist: null, boardRoot: null, shared: undefined },
    out,
  );
  expectElem(v, "cell", "the answer's to");
  // One line, as every term's code is.
  return [
    `(${x}: number): number => {`,
    `if (${x} < 0) return -1;`,
    ...out.text().map((l) => l.trim()),
    `return ${v.code};`,
    "}",
  ].join(" ");
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
    // A group's set is not made where it is passed: a sum over it reads the
    // runtime's kept sums, and the set itself is read from the groups kept.
    const v = vs[i].group === undefined ? once(vs[i], out) : vs[i];
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
  return rungKept(fn, def, vs, inner, env) ?? compileExpr(def.body, inner, env, out);
}

/**
 * A definition that reads the marks, of one or two elements, kept by the
 * rung reading it for each argument until a firing changes the marks, as
 * the rung keeps its candidates (`candOf`): Bridges' `need(c)` and
 * `has(c, y)` are read for an island and each of its lines by every line
 * near it, and made again at each read they cost Bridges' deals four times
 * its hand-written ladder's (2026-11-08). Compiled once, as a function of
 * the module that the rung passes its candidates to, and whose map each rung
 * that calls it empties where it empties its candidates. Only one whose
 * loops nest two deep, through the definitions it reads, is kept: a single
 * loop over a few cells costs less to make again than to look up, and kept,
 * Mosaic's `need(c)` over its 3x3 block cost its deals a quarter more
 * (2026-11-08). None is kept under a supposition, whose reads differ. `null`
 * where the definition is not one.
 */
function rungKept(
  fn: string,
  def: Definition,
  vs: readonly Val[],
  inner: Scope,
  env: Env,
): Val | null {
  const { memos, kept } = env;
  if (
    memos === undefined ||
    kept === null ||
    !env.memo ||
    env.supposed.length > 0 ||
    vs.length === 0 ||
    vs.length > 2 ||
    vs.some((v) => v.sort.k !== "elem" || v.group !== undefined) ||
    loopDepth(def.body, env.defs) < 2 ||
    !readsMarks(def.body, env) ||
    FACTS.some((f) => mentions(def.body, f, env.defs, new Set()))
  )
    return null;
  const name = `${fn}Marked`;
  const key = `rung ${fn}`;
  let made = kept.defs.get(key);
  if (made === undefined) {
    const ps = def.params.map((p) => `v_${p}`);
    const readsClues = { yes: false };
    const nested = new Map<string, readonly string[]>();
    const body = new Out(1);
    const val = Out.own(name, () =>
      compileExpr(
        def.body,
        new Map(def.params.map((p, i) => [p, { code: ps[i], sort: vs[i].sort }])),
        {
          ...env,
          used: kept.used,
          readsClues,
          readsSizes: undefined,
          readsCands: { yes: false },
          memos: nested,
          scratch: null,
          hoist: null,
          boardRoot: null,
          shared: undefined,
          epoch: null,
          concluding: false,
        },
        body,
      ),
    );
    if (val.sort.k !== "num" && val.sort.k !== "bool") return null;
    const type = tsType(val.sort);
    const map = `${name}Kept`;
    // An element is an index from -1, `none`, past which the second
    // argument's fits in 2^20, and the key a double holds exactly.
    const at = ps.length === 1 ? ps[0] : `(${ps[0]} + 1) * 1048577 + (${ps[1]} + 1)`;
    const lines = [...body.text(), `  const _made = ${val.code};`];
    const reads = (n: string): string =>
      lines.some((l) => new RegExp(`(?<!\\.)\\b${n}\\b`).test(l)) ? n : `_${n}`;
    made = {
      sort: val.sort,
      clues: readsClues.yes,
      board: false,
      maps: [map, ...[...nested.values()].flat()],
      code: [
        `const ${map} = new Map<number, ${type}>();`,
        "",
        `/** \`${fn}(${def.params.join(", ")})\` as the description defines it, kept by`,
        " * the rung that reads it until a firing changes the marks. */",
        `export function ${name}(${reads("b")}: Marks, ${reads("sp")}: GridSpace, ${readsClues.yes ? "cl: Dealt, " : ""}${reads("cands")}: Int32Array, ${ps.map((p) => `${p}: number`).join(", ")}): ${type} {`,
        `  const _was = ${map}.get(${at});`,
        "  if (_was !== undefined) return _was;",
        ...lines,
        `  ${map}.set(${at}, _made);`,
        "  return _made;",
        "}",
      ].join("\n"),
    };
    kept.defs.set(key, made);
  }
  if (made.clues) env.readsClues.yes = true;
  if (env.readsCands) env.readsCands.yes = true;
  memos.set(name, made.maps ?? []);
  const args = def.params.map((p) => inner.get(p)?.code ?? "");
  return {
    code: `${name}(b, sp, ${made.clues ? "cl, " : ""}cands, ${args.join(", ")})`,
    sort: made.sort,
  };
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
    env.position !== null ||
    env.supposed.length > 0 ||
    vs.length === 0 ||
    vs.some((v) => v.sort.k !== "elem" && v.sort.k !== "num") ||
    !keptWhilePlaced(def.body, env, new Set(), new Set(def.params))
  )
    return null;
  // One that reads no marks is made once a board, so a loop or a walk
  // repays the keeping; one made again after each placement needs two, or
  // one read inside a loop that does not bind its argument, which would
  // otherwise make it again on each pass for the same argument (Mosaic's
  // `need(c)`, read for each clue near `c`).
  const board = !readsMarks(def.body, env);
  // The answer check reads a grid and no marks, so only what is kept for the
  // board is the same there: inlined, Crossing's `head(L, c)` walked the
  // board again for every square of every line, two thirds of its deals.
  if (env.answer !== null && !board) return null;
  const depth = loopDepth(def.body, env.defs);
  const h = env.hoist;
  const repeated =
    depth >= 1 &&
    h !== null &&
    vs.every((v) => v.at !== undefined && v.at.loops < h.loops);
  if (
    depth < 2 &&
    !repeated &&
    !(board && (depth === 1 || walks(def.body, env.defs, new Set())))
  )
    return null;
  // Of several arguments, one is kept only for the board: kept for the marks,
  // each pair's value made again after every placement cost Rect's and
  // Path's deals more than it saved (2026-11-08).
  if (vs.length > 1 && !board) return null;
  let made = kept.defs.get(fn);
  if (made === undefined) {
    // Compiled once, as a function of its own. A mask is not kept: its
    // loops are over values, and cost less to make again than to look up. A
    // number or a truth whose loops nest two deep is: Boats' `done(m)`
    // counts the closed boats over the whole board.
    const ps = def.params.map((p) => `v_${p}`);
    const readsClues = { yes: false };
    const body = new Out(1);
    const val = Out.own(fn, () =>
      compileExpr(
        def.body,
        new Map(def.params.map((p, i) => [p, { code: ps[i], sort: vs[i].sort }])),
        // Its own arrays, not a technique's reused ones: each is kept.
        {
          ...env,
          used: kept.used,
          readsClues,
          readsSizes: undefined,
          scratch: null,
          hoist: null,
          boardRoot: null,
          concluding: false,
          memo: false,
          epoch: null,
        },
        body,
      ),
    );
    // An element is kept as its index: Bridges' `far(c, y)`, the island a
    // ray from an island reaches, is read for every line at every rung.
    if (
      !isArray(val.sort) &&
      val.sort.k !== "num" &&
      val.sort.k !== "bool" &&
      val.sort.k !== "elem"
    )
      return null;
    // A statement whose loop compiles away costs less than the lookup: Rect's
    // `meets(r, s)` is a comparison of corners, and kept, its deals took 1.09
    // of the time (2026-11-08).
    if (
      body.entries.length === 0 &&
      !BOARD_WALKS.test(val.code) &&
      !LINE_WALKS.test(val.code)
    )
      return null;
    const type = tsType(val.sort);
    // One array a parameter, the last holding the values: `under[i]` is the
    // type of what the array reached by the first `i` arguments holds.
    const under = [type];
    for (let i = 1; i < ps.length; i++) under.push(`Kept<${under[i - 1]}>`);
    const held = under[ps.length - 1];
    const last = ps[ps.length - 1];
    const reach = ps
      .slice(0, -1)
      .map(
        (p, i) => `  const _kept${i + 1} = (_kept${i === 0 ? "" : i}[${p}] ??= []);`,
      );
    const at = ps.length === 1 ? "_kept" : `_kept${ps.length - 1}`;
    kept.used.add("keptStore");
    kept.used.add("type Kept");
    const store = `${fn}Kept`;
    const keptAt = board
      ? `${store}.board(${readsClues.yes ? "cl" : "sp"})`
      : `${store}.marks(b)`;
    const spParam = [keptAt, val.code, ...body.text()].some((l) => /\bsp\b/.test(l))
      ? "sp"
      : "_sp";
    // The board last read and its values, in the module: asking the store
    // at every read cost Net's deals a twentieth, its function shared by
    // every store.
    const on = readsClues.yes ? "cl" : spParam;
    made = {
      sort: val.sort,
      clues: readsClues.yes,
      board,
      code: [
        `const ${store} = keptStore<${held}>();`,
        ...(board
          ? [`let ${fn}On: object | null = null;`, `let ${fn}At: Kept<${held}> = [];`]
          : []),
        "",
        `/** \`${fn}(${def.params.join(", ")})\` as the description defines it, kept for the`,
        board
          ? " * board, since it reads no marks. */"
          : " * marks while no value is placed in them. */",
        `export function ${fn}(${board ? "" : "b: Marks, "}${spParam}: GridSpace, ${readsClues.yes ? "cl: Dealt, " : ""}${ps.map((p) => `${p}: number`).join(", ")}): ${type} {`,
        ...(board
          ? [
              `  if (${on} !== ${fn}On) {`,
              `    ${fn}At = ${keptAt};`,
              `    ${fn}On = ${on};`,
              "  }",
              `  const _kept: Kept<${held}> = ${fn}At;`,
            ]
          : [`  const _kept: Kept<${held}> = ${keptAt};`]),
        ...reach,
        `  if (${at}[${last}] !== undefined) return ${at}[${last}];`,
        ...body.text(),
        `  const _made = ${val.code};`,
        `  ${at}[${last}] = _made;`,
        "  return _made;",
        "}",
      ].join("\n"),
    };
    kept.defs.set(fn, made);
  }
  if (made.clues) env.readsClues.yes = true;
  const call = `${fn}(${made.board ? "" : "b, "}sp, ${made.clues ? "cl, " : ""}${vs.map((v) => v.code).join(", ")})`;
  // A value kept for the board is read from its table, fetched once a run,
  // and the function asked only for one not yet made: asking the store for
  // the table at each read was a tenth of Net's deals, which read a square's
  // `arms(c)` in every filling.
  const root = env.hoist?.root ?? env.boardRoot ?? undefined;
  if (!made.board || vs.length !== 1 || root === undefined)
    return { code: call, sort: made.sort };
  const fetch = `${fn}Kept.board(${made.clues ? "cl" : "sp"})`;
  let table = root.made.get(fetch);
  if (table === undefined) {
    const t = Out.fresh("_k");
    root.lines.push({ indent: 0, text: `const ${t} = ${fetch};` });
    table = { code: t, sort: made.sort };
    root.made.set(fetch, table);
  }
  return { code: `(${table.code}[${vs[0].code}] ?? ${call})`, sort: made.sort };
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

/**
 * A technique's bindings, each checked before it fires that what it read of
 * the marks still holds: a solve makes each fact as it concludes it, so a
 * binding that read a set before an earlier binding's fact reads it stale,
 * and would conclude from marks no longer there (§ "What a technique
 * compiles to"). Where a count of the facts made has moved since the
 * binding first read the marks, its binders' reads are made again.
 */
export interface Recheck {
  /** The binders whose loops the counts are taken in: the technique's own. */
  binders: readonly Binder[];
  /** The slots a count may be taken in, outermost first: the function's
   * start, and ahead of each binder in scope and of its filter, each with
   * how many of the binders' loops are open there. */
  chain: { slot: Slot; loops: number }[];
  /** The statements opening the binders' loops open where the code is
   * written, outermost first. */
  loops: Line[];
  /** Where a binding is checked, ahead of its premise, with the slots in
   * scope there, the loops open, the visited binder's element, which a
   * binding passed over is visited again at, and its reads made again. */
  checks: {
    at: Slot;
    chain: readonly { slot: Slot; loops: number }[];
    loops: readonly Line[];
    visit: string | null;
    reads: readonly Reread[];
    fresh: readonly FreshRead[];
  }[];
}

/** A binder's loop, if it opens one, is open: a count may be taken inside. */
function binderOpened(r: Recheck | null, out: Out, loop: boolean): void {
  if (r === null) return;
  if (loop) r.loops.push((out.blocks.at(-1) as Block).line);
  r.chain.push({ slot: out.slot(0), loops: r.loops.length });
}

/** A binder's scope is closed, with the slots its own and its loop's. */
function binderClosed(r: Recheck | null, loop: boolean): void {
  if (r === null) return;
  r.chain.splice(-2);
  if (loop) r.loops.pop();
}
