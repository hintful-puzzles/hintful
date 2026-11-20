/**
 * What a term reads, before any code is written for it: the names it binds
 * and reads, the marks it reaches, and the rewrites of one term into
 * another that the compiler (`compile.ts`) reads a binding through.
 */

import { NAMES } from "./compile-geometry.ts";
import { loopDepth, walks } from "./compile-growth.ts";
import { CompileError, type Env, type Scope, scalar } from "./compile-sorts.ts";
import type { Definition } from "./description.ts";
import { type Binder, children, type Expr } from "./expr.ts";

/** The calls that make a fact. */
export const FACTS = ["place", "strike", "mark"] as const;

/** A term's statement, the code of each name it reads from its scope, and
 * the suppositions it is read under. */
export function sharedKey(e: Expr, scope: Scope, env: Env): string {
  const free = new Set<string>();
  freeNames(e, free, new Set());
  const names = [...free]
    .sort()
    .map((n) => `${n}=${scope.get(n)?.code ?? ""}`)
    .join(",");
  return `${JSON.stringify(e)}|${names}|${JSON.stringify(env.supposed)}`;
}

/** Whether `e` is a sightline bent by a clue kind's mirrors. */
export const isBentSight = (fn: string, args: readonly Expr[]): boolean =>
  SIGHT_BENT.has(fn) && (fn !== "sight" || args.length === 2);

/** A call's arguments that are values, not a clue kind's name. */
function valueArgs(e: Extract<Expr, { k: "call" }>): readonly Expr[] {
  if (e.fn === "clue") return e.args.slice(1);
  return isBentSight(e.fn, e.args) ? e.args.slice(0, 1) : e.args;
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
  "run_lengths",
  "connected",
  "cuts",
  "cut_edges",
  "matched",
  "reaches",
  "step",
  "compass",
  "to",
  "chain",
  "last",
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
  // A tiling's geometry (`tilingCall`).
  "edges",
  "faces",
  "angles",
  "apex",
  "ends",
  "abs",
  "bits",
  "times",
  "range",
  "sight",
  "sight_direct",
  "sight_bent",
  "sight_twice",
  "sight_exit",
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
export function early(
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
      if (
        e.fn === "value" ||
        e.fn === "known" ||
        e.fn === "to" ||
        e.fn === "chain" ||
        e.fn === "last" ||
        e.fn === "linked"
      )
        marks.read = true;
      if (e.fn === "clue" || isBentSight(e.fn, e.args)) return all(valueArgs(e));
      if (EARLY.has(e.fn) || partOf(e.fn, env)) return all(e.args);
      const def = env.defs.get(e.fn);
      if (def === undefined || !all(e.args)) return false;
      return early(def.body, (n) => def.params.includes(n), env, marks);
    }
  }
}

/** The names `e` reads from its scope; a definition's body reads only its
 * parameters, which are its arguments. */
export function namesIn(e: Expr, into: Set<string>, env: Env): void {
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
      for (const x of valueArgs(e)) namesIn(x, into, env);
      return;
    default:
      return;
  }
}

/** A read a slot keeps for every use after it, though no loop is left. */
export const isRead = (e: Expr): boolean =>
  e.k === "size" ||
  (e.k === "call" && (e.fn === "value" || e.fn === "known" || e.fn === "clue"));

/** Whether `fn` names a partition, which as a function gives a cell's part. */
export const partOf = (fn: string, env: Env): boolean =>
  env.regions.has(fn) || fn === env.boxes;

/**
 * Write the loops of `binders`, each binding's statements written by `body`
 * inside them. A binding a `where` refuses is skipped: `continue` inside a
 * loop, and leaving a labeled block for a name bound by `=`.
 */
/**
 * Where the names bound from `binders[i]` on are costly to make (a walk or
 * a loop) and the next set binder reads none of them, whether that set has
 * a member, read before they are made: where it has none there is no
 * binding, so they are not made. `null` where the check would not pay, or
 * where there is no loop of these binders' own to pass on to. Net's
 * `sealNote` made a square's reach for every square, the squares with every
 * side known among them.
 */
export function emptyAhead(
  binders: readonly Binder[],
  i: number,
  env: Env,
): Expr | null {
  const prior = binders[i - 1];
  if (prior === undefined || prior.kind === "let") return null;
  let j = i;
  while (binders[j]?.kind === "let") j++;
  const next = binders[j];
  // A set with no filter of its own is rarely empty: the check would only
  // cost.
  if (next === undefined || next.kind !== "in" || next.where === null) return null;
  const lets = binders.slice(i, j);
  if (
    !lets.some((b) => walks(b.of, env.defs, new Set()) || loopDepth(b.of, env.defs) > 0)
  )
    return null;
  const cheap = (e: Expr | null): boolean =>
    e === null || (!walks(e, env.defs, new Set()) && loopDepth(e, env.defs) === 0);
  if (!cheap(next.of) || !cheap(next.where)) return null;
  const read = new Set<string>();
  freeNames(next.of, read, new Set());
  if (next.where !== null) freeNames(next.where, read, new Set([next.name]));
  if (lets.some((b) => read.has(b.name))) return null;
  return {
    k: "quant",
    q: "exists",
    binders: [next],
    body: { k: "name", name: "true" },
  };
}

/**
 * Where `bnd`, a binder over the cells, opens its where with `clue(kind, x)
 * = t` of a kind dealt once an element, `t` reading nothing `bnd` binds: the
 * kind and `t`, so the cells can be read off the clue list's index. A
 * definition is read as its body (Dominosa's `num(c) = a`).
 */
export function cluePin(
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

/**
 * Where `bnd`, a binder over the cells, has a conjunct `t in chain(x)` of the
 * chains the marks keep, `t` reading nothing `bnd` binds: `t`, so the cells
 * can be read off the tree of the cells whose chain holds it.
 */
export function chainPin(bnd: Binder, scope: Scope, env: Env): Expr | null {
  if (bnd.kind !== "in" || bnd.where === null || !chainsKept(env)) return null;
  for (const c of fillConjuncts(bnd.where, scope, env)) {
    if (c.k !== "bin" || c.op !== "in") continue;
    const ch = inlined(c.b, scope, env);
    if (!keptChain(ch, env)) continue;
    const [at] = (ch as Extract<Expr, { k: "call" }>).args;
    if (at.k !== "name" || at.name !== bnd.name) continue;
    const reads = new Set<string>();
    freeNames(c.a, reads, new Set());
    if (!reads.has(bnd.name)) return c.a;
  }
  return null;
}

/** A call of a definition read as its body, its parameters replaced by the
 * arguments, until it is no such call. */
export function inlined(e: Expr, scope: Scope, env: Env): Expr {
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
export function fillConjuncts(e: Expr, scope: Scope, env: Env): Expr[] {
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
export function readsOnlyAt(e: Expr, f: string, at: ReadonlySet<string>): boolean {
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

/** `f(t)`'s argument, where `e` is a read of the filling `f`; else `null`. */
export const readOf = (e: Expr, f: string): Expr | null =>
  e.k === "call" && e.fn === f && e.args.length === 1 ? e.args[0] : null;

/** `f(x) = t`, either way round, where neither `x` nor `t` reads `f`. */
export function pinOf(c: Expr, f: string): { x: Expr; t: Expr } | null {
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

/** Where `where`'s first conjunct compares `|name|` with a term that does not
 * read `name`: the comparison, as TypeScript, and the term. */
export function sizeTest(
  name: string,
  where: Expr | null,
): { op: string; of: Expr } | null {
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

/** Whether `name` is read anywhere in `e`. */
export function reads(e: Expr, name: string): boolean {
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

/** The names `e` reads that it does not bind, function names included. */
export function freeNames(
  e: Expr,
  into: Set<string>,
  bound: ReadonlySet<string>,
): void {
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

/** How a name in a term summed over a group reaches the marks: the group's
 * point, a square round it, or anything else bound inside the term. */
export type RoundName = "point" | "round" | "other";

/**
 * Whether `e` reads the marks only at the squares round the point it is
 * about, and no name from outside it: then a placement changes it only at
 * the placed square's own points, which is what lets the runtime keep a sum
 * of it over a group a placement at a time.
 */
export function readsRound(
  e: Expr,
  names: ReadonlyMap<string, RoundName>,
  env: Env,
  depth = 0,
): boolean {
  if (depth > 8) return false;
  const all = (es: readonly Expr[], ns = names): boolean =>
    es.every((x) => readsRound(x, ns, env, depth));
  switch (e.k) {
    case "num":
      return true;
    case "name": {
      if (names.has(e.name) || env.clues.has(e.name)) return true;
      const def = env.defs.get(e.name);
      if (def !== undefined)
        return (
          def.params.length === 0 && readsRound(def.body, new Map(), env, depth + 1)
        );
      return NAMES[e.name] !== undefined;
    }
    case "call": {
      const { fn, args } = e;
      // Not `cand`: a strike is not logged, so a kept sum would miss it.
      if (fn === "value" || fn === "known") {
        const [c] = args;
        return args.length === 1 && c.k === "name" && names.get(c.name) === "round";
      }
      if (MARK_READS.has(fn) || isMarkRead(fn, env) || names.has(fn)) return false;
      if (!all(args)) return false;
      const def = env.defs.get(fn);
      if (def === undefined) return true;
      if (def.params.length !== args.length) return false;
      const inner = new Map<string, RoundName>();
      def.params.forEach((p, i) => {
        const a = args[i];
        inner.set(p, a.k === "name" ? (names.get(a.name) ?? "other") : "other");
      });
      return readsRound(def.body, inner, env, depth + 1);
    }
    case "with":
      return false;
    case "quant":
    case "agg": {
      const inner = new Map(names);
      for (const b of e.binders) {
        if (b.kind === "fill" || !readsRound(b.of, inner, env, depth)) return false;
        const round =
          b.kind === "in" &&
          b.of.k === "call" &&
          b.of.fn === "cells" &&
          b.of.args.length === 1 &&
          b.of.args[0].k === "name" &&
          inner.get(b.of.args[0].name) === "point";
        inner.set(b.name, round ? "round" : "other");
        if (b.where !== null && !readsRound(b.where, inner, env, depth)) return false;
      }
      const rest =
        e.k === "quant" ? [e.body] : [e.where, e.term].filter((x) => x !== null);
      return all(rest, inner);
    }
    default:
      return all(children(e));
  }
}

/**
 * Whether `e` reads the marks only through `value` and `known` of edge `x`
 * (an answer on the edges) or of `end1(x)` and `end2(x)` (one on the cells),
 * and from outside only clues, constants and the scalar names it adds to
 * `outer`: then a placement changes it only at the edges its index names.
 * Candidates are not read, since a strike is not logged.
 */
export function readsAtEdge(
  e: Expr,
  x: string,
  scope: Scope,
  env: Env,
  outer: Set<string>,
  depth = 0,
): boolean {
  if (depth > 8) return false;
  const go = (y: Expr): boolean => readsAtEdge(y, x, scope, env, outer, depth);
  switch (e.k) {
    case "num":
      return true;
    case "name": {
      if (e.name === x || env.clues.has(e.name)) return true;
      const bound = scope.get(e.name);
      if (bound !== undefined) {
        if (!scalar(bound.sort)) return false;
        outer.add(e.name);
        return true;
      }
      const def = env.defs.get(e.name);
      if (def !== undefined)
        return (
          def.params.length === 0 &&
          readsAtEdge(def.body, x, scope, env, outer, depth + 1)
        );
      return NAMES[e.name] !== undefined;
    }
    case "call": {
      const { fn, args } = e;
      const isX = (a: Expr): boolean => a.k === "name" && a.name === x;
      if (fn === "value" || fn === "known") {
        const [c] = args;
        if (args.length !== 1) return false;
        return env.answerSort === "edge"
          ? isX(c)
          : c.k === "call" && (c.fn === "end1" || c.fn === "end2") && isX(c.args[0]);
      }
      if (MARK_READS.has(fn) || isMarkRead(fn, env) || scope.has(fn)) return false;
      const def = env.defs.get(fn);
      if (def !== undefined) {
        const body = inlined(e, scope, env);
        return body !== e && readsAtEdge(body, x, scope, env, outer, depth + 1);
      }
      return args.every(go);
    }
    case "not":
    case "neg":
    case "size":
      return go(e.of);
    case "bin":
      return go(e.a) && go(e.b);
    default:
      return false;
  }
}

/**
 * Where an aggregate's one binder counts a range and its term is that
 * binder plus or minus what does not read it, so that a `min` or a `max` is
 * the first number that passes counted from one end: 1 where the term rises
 * with the binder, -1 where it falls; 0 where it is not of that shape.
 */
export function countedSlope(e: Extract<Expr, { k: "agg" }>): number {
  if (e.binders.length !== 1) return 0;
  const [b] = e.binders;
  if (b.kind !== "in" || b.of.k !== "call" || b.of.fn !== "range") return 0;
  if (e.term === null) return 1;
  // How the term moves with the binder: null where it is not a sum of the
  // binder once and what does not read it.
  const slope = (x: Expr): number | null => {
    if (x.k === "name" && x.name === b.name) return 1;
    const reads = new Set<string>();
    freeNames(x, reads, new Set());
    if (!reads.has(b.name)) return 0;
    if (x.k !== "bin" || (x.op !== "+" && x.op !== "-")) return null;
    const l = slope(x.a);
    const r = slope(x.b);
    if (l === null || r === null) return null;
    return x.op === "+" ? l + r : l - r;
  };
  const s = slope(e.term);
  return s === 1 || s === -1 ? s : 0;
}

/**
 * Whether `e` reads the marks only through `value` and `known`, which change
 * only as a value is placed, and makes no fact: so it holds while
 * `b.placed` stands. Its free names, those no binder of its own binds, are
 * added to `free`.
 */
export function keptWhilePlaced(
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
        e.fn === "linked" ||
        // A strike from an edge's mark and a relation count as no
        // placement, as a cell's mark does.
        (e.fn !== "mark" && e.fn !== env.cellMark?.name && isMarkRead(e.fn, env))
      )
        return false;
      if (!all(valueArgs(e))) return false;
      const def = env.defs.get(e.fn);
      return (
        def === undefined ||
        keptWhilePlaced(def.body, env, new Set(), new Set(def.params))
      );
    }
  }
}

/** A sightline bent by the mirrors a clue kind deals, and what it reads:
 * the field of the runtime's `SightSets` each function is. */
export const SIGHT_BENT: ReadonlyMap<string, string> = new Map([
  ["sight", "all"],
  ["sight_direct", "direct"],
  ["sight_bent", "bent"],
  ["sight_twice", "twice"],
  ["sight_exit", "exit"],
]);

/** Whether chains are read off what the marks keep (`chainsOf`): on the
 * marks themselves, under no supposition, and not by the answer check. */
export const chainsKept = (env: Env): boolean =>
  !env.answer && env.position === null && env.supposed.length === 0;

/** Whether `e` is a chain the marks keep. */
export const keptChain = (e: Expr, env: Env): boolean =>
  e.k === "call" && e.fn === "chain" && e.args.length === 1 && chainsKept(env);

// --- a definition that reads itself -----------------------------------------

/** The functions that read the marks, rather than the board. */
const MARK_READS = new Set([
  "value",
  "known",
  "cand",
  "to",
  "chain",
  "last",
  "linked",
  "place",
  "strike",
  "beam",
  "ahead",
]);

/** Whether `e` reads the marks, itself or through a definition, a supposition
 * included: what a definition kept for the whole board must not do. */
export function readsMarks(e: Expr, env: Env, seen: Set<string> = new Set()): boolean {
  if (e.k === "with") return true;
  const name = e.k === "call" ? e.fn : e.k === "name" ? e.name : null;
  if (name !== null) {
    if (e.k === "call" && (MARK_READS.has(name) || isMarkRead(name, env))) return true;
    const d = env.defs.get(name);
    if (d !== undefined && !seen.has(name)) {
      seen.add(name);
      if (readsMarks(d.body, env, seen)) return true;
    }
  }
  return children(e).some((c) => readsMarks(c, env, seen));
}

/** Whether `fn` reads or makes one of the description's own marks: the mark
 * naming an element a cell, the mark on the edges or angles, or the
 * relation over the edges. */
function isMarkRead(fn: string, env: Env): boolean {
  return (
    fn === "mark" ||
    fn === env.cellMark?.name ||
    fn === env.edgeMark ||
    (env.relation !== null &&
      (fn === env.relation || fn === "related" || fn === "relate"))
  );
}

/** Whether `e` reads definition `fn`, itself or through the definitions it
 * calls. */
export function mentions(
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
export function monotone(
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
