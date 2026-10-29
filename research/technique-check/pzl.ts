/**
 * Compile the language's forms to z3, and check techniques and entailment.
 *
 * The forms of `language.md` § "Expressions" are built as a small tree of nodes
 * and compiled for a polarity: a node asserted (+1) or denied (-1). Polarity is
 * what lets a fixed point be stated either way, exactly: asserted, a member of a
 * least fixed point carries a derivation rank; denied, a closed set witnesses
 * that it is not reached. Entailment needs both, since it denies the rules of
 * one game while asserting the other's.
 *
 * Elements are numbers, strings and tuples of them (cells, units, digits). A
 * tuple is interned by `tup`, so one value stands for each tuple and a `Map`
 * keyed by elements finds it by identity. A technique's bound variables are
 * symbolic: each is a one-hot choice among its set's elements inside the one
 * query, so a technique is checked by one solver call however many bindings it
 * has. A term over a symbolic element (`value(c)` with `c` bound) is the sum
 * over its possible elements, each under its guard.
 *
 * Sets are maps from element to membership, a boolean or a z3 formula. A
 * membership that is a formula comes from a bound variable or from dealt
 * regions, never from an answer-dependent predicate: those are written with the
 * fixed-point nodes below.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { type Arith, type Bool, init, type Model } from "z3-solver";

const { Context } = await init();
export const Z3 = Context("main");
export type B = Bool<"main">;
export type I = Arith<"main">;
export type Formula = Node | B | boolean;

let freshCount = 0;

export function fresh(prefix: string): string {
  return `${prefix}#${freshCount++}`;
}

export function asZ3(x: boolean | B): B;
export function asZ3(x: number | I): I;
export function asZ3(x: boolean | number | B | I): B | I {
  if (typeof x === "boolean") return Z3.Bool.val(x);
  if (typeof x === "number") return Z3.Int.val(x);
  return x;
}

/** z3's `Sum`, with the empty sum 0. */
export function sum(xs: readonly (I | number)[]): I {
  if (xs.length === 0) return Z3.Int.val(0);
  const [first, ...rest] = xs;
  return Z3.Sum(asZ3(first), ...rest);
}

/** 1 where `b` holds, else 0. */
export function ite(b: B | boolean, x: I | number, y: I | number): I {
  return Z3.If(b, asZ3(x), asZ3(y));
}

// ------------------------------------------------------------------ elements

export type Elem = number | string | Tup;
export type Tup = readonly Elem[];

const interned = new Map<string, Tup>();

/** An element as Python writes it, which is also its key when interned. */
export function show(e: Elem): string {
  if (typeof e === "number") return String(e);
  if (typeof e === "string")
    return e.includes("'") && !e.includes('"') ? `"${e}"` : `'${e}'`;
  if (e.length === 1) return `(${show(e[0])},)`;
  return `(${e.map(show).join(", ")})`;
}

/** The one value standing for this tuple. */
export function tup<T extends Elem[]>(...xs: T): Readonly<T> {
  const key = show(xs);
  const found = interned.get(key);
  if (found !== undefined) return found as Readonly<T>;
  Object.freeze(xs);
  interned.set(key, xs);
  return xs;
}

/** Python's ordering of elements: numbers and strings by value, tuples by
 * their members in turn. */
export function cmp(a: Elem, b: Elem): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "string" && typeof b === "string") return a < b ? -1 : a > b ? 1 : 0;
  if (typeof a === "object" && typeof b === "object") {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const c = cmp(a[i], b[i]);
      if (c !== 0) return c;
    }
    return a.length - b.length;
  }
  throw new Error(`cannot order ${show(a)} and ${show(b)}`);
}

export function sorted<E extends Elem>(xs: Iterable<E>): E[] {
  return [...xs].sort(cmp);
}

/** A map that throws on a missing key, for the tables Python indexes. */
export class Dict<K, V> extends Map<K, V> {
  at(k: K): V {
    const v = this.get(k);
    if (v === undefined && !this.has(k))
      throw new Error(
        `no key ${typeof k === "object" || typeof k === "number" || typeof k === "string" ? show(k as Elem) : String(k)}`,
      );
    return v as V;
  }
}

export function dictOf<K, V>(keys: Iterable<K>, f: (k: K) => V): Dict<K, V> {
  const out = new Dict<K, V>();
  for (const k of keys) out.set(k, f(k));
  return out;
}

/** Every combination of one member from each list, in order. */
export function product<T>(lists: readonly (readonly T[])[]): T[][] {
  let out: T[][] = [[]];
  for (const l of lists) {
    const next: T[][] = [];
    for (const p of out) for (const x of l) next.push([...p, x]);
    out = next;
  }
  return out;
}

export function range(a: number, b?: number): number[] {
  const [lo, hi] = b === undefined ? [0, a] : [a, b];
  const out: number[] = [];
  for (let i = lo; i < hi; i++) out.push(i);
  return out;
}

/** A symbolic element: exactly one of `guards` holds in any model. */
export class Sym {
  constructor(readonly guards: Dict<Elem, B>) {}
}

export type Bound = Elem | Sym;

/** An element, concrete or symbolic, as element -> guard. */
export function guards(x: Bound): Dict<Elem, B> {
  return x instanceof Sym ? x.guards : new Dict([[x, Z3.Bool.val(true)]]);
}

/**
 * Apply a function of concrete elements to concrete or symbolic arguments. A
 * z3 Bool result is joined by `or`, an Int by a guarded sum, a node by `Or` of
 * guarded nodes. The arguments are not checked against `f`'s parameter types:
 * a bound variable's elements are whatever its set held.
 */
export function lift<A extends Elem[]>(f: (...xs: A) => Node, ...args: Bound[]): Node;
export function lift<A extends Elem[]>(
  f: (...xs: A) => B | boolean,
  ...args: Bound[]
): B;
export function lift<A extends Elem[]>(
  f: (...xs: A) => I | number,
  ...args: Bound[]
): I;
export function lift<A extends Elem[]>(
  f: (...xs: A) => Node | B | boolean | I | number,
  ...args: Bound[]
): Node | B | I {
  const call = (es: Elem[]) => f(...(es as A));
  if (!args.some((a) => a instanceof Sym)) {
    const r = call(args as Elem[]);
    return r instanceof Node
      ? r
      : typeof r === "boolean" || typeof r === "number"
        ? asZ3Any(r)
        : r;
  }
  const parts: [B, Node | B | boolean | I | number][] = [];
  for (const combo of product(args.map((a) => [...guards(a)]))) {
    const g = Z3.And(...combo.map(([, gd]) => gd));
    parts.push([g, call(combo.map(([e]) => e))]);
  }
  const first = parts[0][1];
  if (first instanceof Node)
    return Or(...parts.map(([g, n]) => And(Atom(g), n as Node)));
  if (typeof first === "boolean" || Z3.isBool(first))
    return Z3.Or(...parts.map(([g, v]) => Z3.And(g, asZ3(v as B | boolean))));
  let total: I = Z3.Int.val(0);
  for (const [g, v] of parts) total = total.add(Z3.If(g, asZ3(v as I | number), 0));
  return total;
}

function asZ3Any(x: boolean | number): B | I {
  return typeof x === "boolean" ? Z3.Bool.val(x) : Z3.Int.val(x);
}

/** Two elements are the same element. */
export function same(a: Bound, b: Bound): B {
  const ga = guards(a);
  const gb = guards(b);
  const both = [...ga].filter(([e]) => gb.has(e));
  return both.length > 0
    ? Z3.Or(...both.map(([e, g]) => Z3.And(g, gb.at(e))))
    : Z3.Bool.val(false);
}

// ---------------------------------------------------------------------- sets

export type Membership = boolean | B;
export type Members<E extends Elem = Elem> = Dict<E, Membership>;
export type SetLike<E extends Elem = Elem> = Map<E, Membership> | readonly E[];

/** A set as element -> membership. */
export function members<E extends Elem>(s: SetLike<E>): Map<E, Membership> {
  if (s instanceof Map) return s;
  return new Dict(s.map((e) => [e, true]));
}

export function minus<E extends Elem>(s: SetLike<E>, ...xs: Bound[]): Members<E> {
  const out = new Dict<E, Membership>(members(s));
  for (const x of xs)
    for (const [e, g] of guards(x)) {
      const m = out.get(e as E);
      if (m !== undefined) out.set(e as E, Z3.And(asZ3(m), Z3.Not(g)));
    }
  return out;
}

/** The set f(e) for the element x, concrete or symbolic. */
export function unionOver<E extends Elem, F extends Elem>(
  x: Bound,
  f: (e: E) => SetLike<F>,
): Members<F> {
  const out = new Dict<F, Membership>();
  for (const [e, g] of guards(x))
    for (const [m, mg] of members(f(e as E))) {
      const term = Z3.And(g, asZ3(mg));
      const had = out.get(m);
      out.set(m, had !== undefined ? Z3.Or(asZ3(had), term) : term);
    }
  return out;
}

/** Elements of s with cond, a predicate of a concrete element returning a z3
 * Bool that does not depend on polarity. */
export function where<E extends Elem>(
  s: SetLike<E>,
  cond: (e: E) => B | boolean,
): Dict<E, B> {
  const out = new Dict<E, B>();
  for (const [e, g] of members(s)) out.set(e, Z3.And(asZ3(g), asZ3(cond(e))));
  return out;
}

// --------------------------------------------------------------------- nodes

export abstract class Node {
  abstract z(pol: number): B;
}

export function node(x: Formula): Node {
  return x instanceof Node ? x : Atom(x);
}

/** A formula with no fixed point in it: the same either way. */
class AtomNode extends Node {
  readonly f: B;
  constructor(f: B | boolean) {
    super();
    this.f = asZ3(f);
  }
  z(pol: number): B {
    return pol > 0 ? this.f : Z3.Not(this.f);
  }
}

export function Atom(f: B | boolean): Node {
  return new AtomNode(f);
}

class AndNode extends Node {
  readonly xs: Node[];
  constructor(xs: Formula[]) {
    super();
    this.xs = xs.map(node);
  }
  z(pol: number): B {
    const parts = this.xs.map((x) => x.z(pol));
    return pol > 0 ? Z3.And(...parts) : Z3.Or(...parts);
  }
}

export function And(...xs: Formula[]): Node {
  return new AndNode(xs);
}

class OrNode extends Node {
  readonly xs: Node[];
  constructor(xs: Formula[]) {
    super();
    this.xs = xs.map(node);
  }
  z(pol: number): B {
    const parts = this.xs.map((x) => x.z(pol));
    return pol > 0 ? Z3.Or(...parts) : Z3.And(...parts);
  }
}

export function Or(...xs: Formula[]): Node {
  return new OrNode(xs);
}

class NotNode extends Node {
  readonly x: Node;
  constructor(x: Formula) {
    super();
    this.x = node(x);
  }
  z(pol: number): B {
    return this.x.z(-pol);
  }
}

export function Not(x: Formula): Node {
  return new NotNode(x);
}

export function Implies(a: Formula, b: Formula): Node {
  return Or(Not(a), b);
}

class ForallNode<E extends Elem> extends Node {
  readonly s: Map<E, Membership>;
  constructor(
    s: SetLike<E>,
    readonly body: (e: E) => Formula,
  ) {
    super();
    this.s = members(s);
  }
  z(pol: number): B {
    const s = [...this.s];
    if (pol > 0)
      return Z3.And(...s.map(([e, g]) => Z3.Implies(asZ3(g), node(this.body(e)).z(1))));
    return Z3.Or(...s.map(([e, g]) => Z3.And(asZ3(g), node(this.body(e)).z(-1))));
  }
}

export function Forall<E extends Elem>(s: SetLike<E>, body: (e: E) => Formula): Node {
  return new ForallNode(s, body);
}

class ExistsNode<E extends Elem> extends Node {
  readonly s: Map<E, Membership>;
  constructor(
    s: SetLike<E>,
    readonly body: (e: E) => Formula,
  ) {
    super();
    this.s = members(s);
  }
  z(pol: number): B {
    const s = [...this.s];
    if (pol > 0)
      return Z3.Or(...s.map(([e, g]) => Z3.And(asZ3(g), node(this.body(e)).z(1))));
    return Z3.And(...s.map(([e, g]) => Z3.Implies(asZ3(g), node(this.body(e)).z(-1))));
  }
}

export function Exists<E extends Elem>(s: SetLike<E>, body: (e: E) => Formula): Node {
  return new ExistsNode(s, body);
}

/** How many elements of s satisfy cond (a z3 Bool of a concrete element). */
export function count<E extends Elem>(s: SetLike<E>, cond: (e: E) => B | boolean): I {
  return sum(
    [...members(s)].map(([e, g]) => ite(Z3.And(asZ3(g), asZ3(cond(e))), 1, 0)),
  );
}

// ------------------------------------------------------------ fixed points

/** A neighbor, alone or with a z3 guard when the step depends on the answer
 * (a drawn edge). */
export type Link<E extends Elem = Elem> = E | readonly [E, B];
export type Adj<E extends Elem = Elem> = ReadonlyMap<E, readonly Link<E>[]>;

function adjOf<E extends Elem>(adj: Adj<E>, e: E): readonly Link<E>[] {
  const out = adj.get(e);
  if (out === undefined) throw new Error(`no neighbors of ${show(e)}`);
  return out;
}

/** e's neighbors as [neighbor, guard]. */
export function stepsOf<E extends Elem>(adj: Adj<E>, e: E): [E, B][] {
  return adjOf(adj, e).map((y) =>
    Array.isArray(y) && y.length === 2 && Z3.isExpr(y[1])
      ? [y[0] as E, y[1] as B]
      : [y as E, Z3.Bool.val(true)],
  );
}

/**
 * `target` is in the least set holding `sources` and closed under steps from a
 * member to a neighbor in `within`: the chain of language.md, and the
 * commonest least fixed point. `adj` maps an element to its neighbors;
 * `within` and `sources` are sets with z3 memberships; `target` an element.
 */
class ReachNode extends Node {
  readonly sources: Map<Elem, Membership>;
  readonly within: Map<Elem, Membership>;
  constructor(
    sources: SetLike,
    readonly target: Bound,
    within: SetLike,
    readonly adj: Adj,
  ) {
    super();
    this.sources = members(sources);
    this.within = members(within);
  }

  z(pol: number): B {
    const inn = new Dict([...this.within].map(([e, g]) => [e, asZ3(g)]));
    const src = new Dict([...this.sources].map(([e, g]) => [e, asZ3(g)]));
    const tag = fresh("reach");
    const tg = guards(this.target);
    if (pol > 0) {
      // A derivation: each reached element has a rank, a source at 0 and
      // every other one step past a reached neighbor of lower rank.
      const got = dictOf(inn.keys(), (e) => Z3.Bool.const(`${tag}_in_${show(e)}`));
      const rank = dictOf(inn.keys(), (e) => Z3.Int.const(`${tag}_rk_${show(e)}`));
      const cs: B[] = [];
      for (const [e, ine] of inn) {
        const base = Z3.And(ine, src.get(e) ?? Z3.Bool.val(false), rank.at(e).eq(0));
        const steps = stepsOf(this.adj, e)
          .filter(([y]) => inn.has(y))
          .map(([y, lk]) => Z3.And(got.at(y), ine, lk, rank.at(y).lt(rank.at(e))));
        cs.push(Z3.Implies(got.at(e), Z3.Or(base, ...steps)));
        cs.push(rank.at(e).ge(0));
      }
      const hit = [...tg]
        .filter(([e]) => got.has(e))
        .map(([e, g]) => Z3.And(g, got.at(e)));
      cs.push(Z3.Or(...(hit.length > 0 ? hit : [Z3.Bool.val(false)])));
      return Z3.And(...cs);
    }
    // Not reached: a set holding every source and closed under steps, that
    // does not hold the target. The least fixed point is inside any such set.
    const closed = dictOf(inn.keys(), (e) => Z3.Bool.const(`${tag}_cl_${show(e)}`));
    const cs: B[] = [];
    for (const [e, ine] of inn) {
      cs.push(Z3.Implies(Z3.And(ine, src.get(e) ?? Z3.Bool.val(false)), closed.at(e)));
      for (const [y, lk] of stepsOf(this.adj, e))
        if (inn.has(y))
          cs.push(Z3.Implies(Z3.And(closed.at(e), inn.at(y), lk), closed.at(y)));
    }
    cs.push(
      Z3.And(
        ...[...tg]
          .filter(([e]) => inn.has(e))
          .map(([e, g]) =>
            Z3.Implies(g, Z3.Or(Z3.Not(inn.at(e)), Z3.Not(closed.at(e)))),
          ),
      ),
    );
    return Z3.And(...cs);
  }
}

export function Reach<E extends Elem>(
  sources: SetLike<E>,
  target: Bound,
  within: SetLike<E>,
  adj: Adj<E>,
): Node {
  return new ReachNode(sources as SetLike, target, within as SetLike, adj as Adj);
}

/** b is reached from a by steps inside `within` (a and b inside it). */
export function reaches<E extends Elem>(
  a: Bound,
  b: Bound,
  within: SetLike<E>,
  adj: Adj<E>,
): Node {
  return new ReachNode(guards(a), b, within as SetLike, adj as Adj);
}

/** The members of `s` form one component under `adj`: language.md's
 * `connected`. Asserted, a root and distances; denied, two members and a
 * closed set that holds one and not the other. */
class ConnectedNode extends Node {
  readonly s: Map<Elem, Membership>;
  constructor(
    s: SetLike,
    readonly adj: Adj,
  ) {
    super();
    this.s = members(s);
  }

  z(pol: number): B {
    const inn = new Dict([...this.s].map(([e, g]) => [e, asZ3(g)]));
    const tag = fresh("conn");
    if (pol > 0) {
      const dist = dictOf(inn.keys(), (e) => Z3.Int.const(`${tag}_d_${show(e)}`));
      const root = dictOf(inn.keys(), (e) => Z3.Bool.const(`${tag}_r_${show(e)}`));
      const n = inn.size;
      const cs: B[] = [
        atMost([...root.values()], 1),
        Z3.Implies(Z3.Or(...inn.values()), Z3.Or(...root.values())),
      ];
      for (const [e, ine] of inn) {
        cs.push(Z3.Implies(root.at(e), Z3.And(ine, dist.at(e).eq(0))));
        const nbrs = stepsOf(this.adj, e).filter(([y]) => inn.has(y));
        const step =
          nbrs.length > 0
            ? Z3.Or(
                ...nbrs.map(([y, lk]) =>
                  Z3.And(inn.at(y), lk, dist.at(y).eq(dist.at(e).sub(1))),
                ),
              )
            : Z3.Bool.val(false);
        cs.push(
          Z3.Implies(
            Z3.And(ine, Z3.Not(root.at(e))),
            Z3.And(dist.at(e).ge(1), dist.at(e).le(n), step),
          ),
        );
      }
      return Z3.And(...cs);
    }
    const p = choose(this.s, `${tag}_p`);
    const q = choose(this.s, `${tag}_q`);
    return Z3.And(
      p.constraint,
      q.constraint,
      Reach(p.sym.guards, q.sym, this.s, this.adj).z(-1),
    );
  }
}

export function Connected<E extends Elem>(s: SetLike<E>, adj: Adj<E>): Node {
  return new ConnectedNode(s as SetLike, adj as Adj);
}

function atMost(bs: B[], k: number): B {
  if (bs.length === 0) return Z3.Bool.val(true);
  return Z3.AtMost(bs as [B, ...B[]], k);
}

// ------------------------------------------------------------------ fillings

export class Undecided extends Error {}

/**
 * `exists fill f of S: P(f)`: some assignment of a value from `domain(e)` to
 * each element of S makes P hold. Asserted, the assignment is fresh variables;
 * denied, every assignment is enumerated (the sets a board bounds are small),
 * and the check gives up past `cap` assignments.
 */
class ExistsFillNode<E extends Elem> extends Node {
  static cap = 20000;
  readonly s: Map<E, Membership>;
  constructor(
    s: SetLike<E>,
    readonly domain: (e: E) => readonly number[],
    readonly body: (f: Dict<E, I>) => Formula,
  ) {
    super();
    this.s = members(s);
  }

  z(pol: number): B {
    const elems = [...this.s.keys()];
    if (pol > 0) {
      const tag = fresh("fill");
      const f = dictOf(elems, (e) => Z3.Int.const(`${tag}_${show(e)}`));
      const dom = elems.map((e) =>
        Z3.Implies(
          asZ3(this.s.get(e) ?? false),
          Z3.Or(...this.domain(e).map((v) => f.at(e).eq(v))),
        ),
      );
      return Z3.And(...dom, node(this.body(f)).z(1));
    }
    const doms = elems.map((e) => this.domain(e));
    const total = doms.reduce((t, d) => t * d.length, 1);
    if (total > ExistsFillNode.cap)
      throw new Undecided(`a denied filling of ${total} assignments`);
    const out: B[] = [];
    for (const vals of product(doms)) {
      const f = new Dict(elems.map((e, i) => [e, Z3.Int.val(vals[i])]));
      out.push(node(this.body(f)).z(-1));
    }
    return Z3.And(...out);
  }
}

export function ExistsFill<E extends Elem>(
  s: SetLike<E>,
  domain: (e: E) => readonly number[],
  body: (f: Dict<E, I>) => Formula,
): Node {
  return new ExistsFillNode(s, domain, body);
}

export function ForallFill<E extends Elem>(
  s: SetLike<E>,
  domain: (e: E) => readonly number[],
  body: (f: Dict<E, I>) => Formula,
): Node {
  return Not(ExistsFill(s, domain, (f) => Not(body(f))));
}

// ------------------------------------------------------------------ bindings

export interface Choice {
  sym: Sym;
  constraint: B;
}

/** A symbolic element of s, constrained to be exactly one member. */
export function choose(s: SetLike, name: string): Choice {
  const ms = members(s);
  const gs = dictOf(ms.keys(), (e) => Z3.Bool.const(`${name}=${show(e)}`));
  const all = [...gs.values()];
  const one =
    all.length > 0
      ? Z3.PbEq(all as [B, ...B[]], all.map(() => 1) as [number, ...number[]], 1)
      : Z3.Bool.val(false);
  const c = Z3.And(
    one,
    Z3.And(...[...ms].map(([e, m]) => Z3.Implies(gs.at(e), asZ3(m)))),
  );
  return { sym: new Sym(gs), constraint: c };
}

// ------------------------------------------------------------------- queries

/** A technique's bound variables by name: each a concrete element or a Sym. */
export type Env = Record<string, Bound>;

/** A technique: bound variables, each over a set that may name an earlier one,
 * a premise and a conclusion, both functions of the bound elements. */
export class Technique {
  constructor(
    readonly name: string,
    readonly binds: readonly (readonly [string, (env: Env) => SetLike])[],
    readonly premise: (env: Env) => Formula,
    readonly conclusion: (env: Env) => Formula,
  ) {}
}

/** An answer's z3 terms by name, element by element. */
export type AnswerVars = Record<string, ReadonlyMap<Elem, B | I>>;
/** An answer read back: a Bool as 0 or 1, an Int as its value. */
export type Answer = Record<string, Dict<Elem, number>>;
export type Verify = (a: Answer) => boolean;

export interface Checked {
  verdict: string;
  model: Model<"main"> | null;
  env: Env;
}

export async function solve(
  constraints: B[],
  timeoutS: number | null = null,
): Promise<{ r: string; model: Model<"main"> | null }> {
  const s = new Z3.Solver();
  if (timeoutS) s.set("timeout", Math.trunc(timeoutS * 1000));
  s.add(...constraints);
  const r = await s.check();
  return { r, model: r === "sat" ? s.model() : null };
}

export interface CheckOptions {
  timeoutS?: number | null;
  split?: number;
  answerVars?: AnswerVars | null;
  verify?: Verify | null;
  rounds?: number;
}

/**
 * Is the technique sound on this board? Returns the verdict, with the model
 * and bindings of a counterexample: 'sound', 'unsound' with the
 * counterexample, or 'unknown' on timeout.
 *
 * The rules are compiled into one incremental solver once. The first `split`
 * bound variables are enumerated, each prefix one push of the solver; the rest
 * are symbolic inside that query. split=0 is one query for the whole
 * technique, split=binds.length is experiment C's one query a binding.
 *
 * With `verify`, every counterexample is read back as concrete values of
 * `answerVars` and judged by `verify`, a plain evaluation of the rules written
 * apart from the z3 encoding. The encoded `rules` may then be a consequence of
 * the game's rules, with more answers: a counterexample `verify` rejects is
 * blocked and the search goes on. So 'unsound' rests on an answer the
 * independent reading accepts, and 'sound' on an encoding that may only be
 * weaker than the game.
 */
export async function checkTechnique(
  rules: readonly Formula[],
  consistent: Formula,
  technique: Technique,
  {
    timeoutS = null,
    split = 0,
    answerVars = null,
    verify = null,
    rounds = 200,
  }: CheckOptions = {},
): Promise<Checked> {
  const s = new Z3.Solver();
  if (timeoutS) s.set("timeout", Math.trunc(timeoutS * 1000));
  s.add(...rules.map((r) => node(r).z(1)));
  s.add(node(consistent).z(1));
  let rejected = 0;

  async function* prefixes(i: number, env: Env, gs: B[]): AsyncGenerator<[Env, B[]]> {
    if (i === split) {
      yield [env, gs];
      return;
    }
    const [name, setf] = technique.binds[i];
    for (const [e, g] of members(setf(env))) {
      if (g === false || (typeof g !== "boolean" && Z3.isFalse(await Z3.simplify(g))))
        continue;
      yield* prefixes(i + 1, { ...env, [name]: e }, [...gs, asZ3(g)]);
    }
  }

  for await (const [prefix, prefixGuards] of prefixes(0, {}, [])) {
    const env: Env = { ...prefix };
    const cs: B[] = [...prefixGuards];
    for (const [name, setf] of technique.binds.slice(split)) {
      const ch = choose(setf(env), `bind_${name}`);
      env[name] = ch.sym;
      cs.push(ch.constraint);
    }
    cs.push(node(technique.premise(env)).z(1));
    cs.push(node(technique.conclusion(env)).z(-1));
    s.push();
    s.add(...cs);
    try {
      for (;;) {
        const r = await s.check();
        if (r === "unsat") break;
        if (r !== "sat") return { verdict: "unknown", model: null, env };
        const m = s.model();
        if (verify === null || answerVars === null)
          return { verdict: "unsound", model: m, env };
        const values: Record<string, Dict<Elem, B | I>> = {};
        const concrete: Answer = {};
        for (const [k, d] of Object.entries(answerVars)) {
          values[k] = new Dict();
          concrete[k] = new Dict();
          for (const [e, t] of d) {
            const v = Z3.isBool(t) ? m.eval(t, true) : m.eval(t as I, true);
            values[k].set(e, v);
            concrete[k].set(e, concreteOf(v));
          }
        }
        if (verify(concrete)) return { verdict: "unsound", model: m, env };
        rejected++;
        if (rejected > rounds) return { verdict: "unknown", model: null, env };
        const differ: B[] = [];
        for (const [k, d] of Object.entries(answerVars))
          for (const [e, t] of d) differ.push(Z3.Not(Z3.Eq(t, values[k].at(e))));
        s.add(Z3.Or(...differ));
      }
    } finally {
      s.pop();
    }
  }
  return {
    verdict: rejected === 0 ? "sound" : `sound (${rejected} rejected)`,
    model: null,
    env: {},
  };
}

function concreteOf(v: B | I): number {
  if (Z3.isBool(v)) return Z3.isTrue(v) ? 1 : 0;
  if (Z3.isIntVal(v)) return Number(v.value());
  throw new Error(`not a concrete value: ${v.toString()}`);
}

/** Does every answer of Y's rules satisfy X's? 'entails', 'not' with a
 * counterexample, or 'unknown'. */
export async function checkEntails(
  rulesY: readonly Formula[],
  rulesX: readonly Formula[],
  timeoutS: number | null = null,
): Promise<{ verdict: string; model: Model<"main"> | null }> {
  const cs = [...rulesY.map((r) => node(r).z(1)), And(...rulesX).z(-1)];
  const { r, model } = await solve(cs, timeoutS);
  return {
    verdict: r === "unsat" ? "entails" : r === "sat" ? "not" : "unknown",
    model,
  };
}

/** One check's line in a results table. */
export interface ResultRow {
  check: string;
  verdict: string;
  seconds: number;
  binding: string | null;
}

/** The runs `PAIRS` names, space or comma separated, or all of them. */
export function pairsToRun(all: readonly string[]): string[] {
  const named = (process.env["PAIRS"] ?? "").split(/[\s,]+/).filter((p) => p !== "");
  return named.length > 0 ? named : [...all];
}

/** Print a line as it is reached, past vitest's console capture. */
export function say(line: string): void {
  process.stdout.write(`${line}\n`);
}

/** Python's `{x:n}` on a string: left-aligned in n columns. */
export function pad(s: string, n: number): string {
  return s.padEnd(n);
}

/** Python's `{x:n.1f}`: right-aligned in n columns, one decimal. */
export function fixed(x: number, n: number): string {
  return x.toFixed(1).padStart(n);
}

/**
 * Merge this run's lines into a results table, one line a check, keyed by
 * pair: a pair run again replaces its lines, and the others stay. `name` is a
 * file beside this module.
 */
export function writeResults(
  name: string,
  results: ReadonlyMap<string, readonly ResultRow[]>,
): void {
  const path = new URL(name, import.meta.url);
  const table = new Map<string, string[]>();
  if (existsSync(path))
    for (const line of readFileSync(path, "utf8").split("\n"))
      if (line.trim()) {
        const key = line.split(/\s+/)[0];
        const rows = table.get(key) ?? [];
        rows.push(line);
        table.set(key, rows);
      }
  for (const [pair, rows] of results)
    table.set(
      pair,
      rows.map(
        (r) =>
          `${pad(pair, 4)} ${pad(r.check, 58)} ${pad(r.verdict, 28)} ${fixed(r.seconds, 7)}s` +
          (r.binding ? `   at ${r.binding}` : ""),
      ),
    );
  const order = (k: string): [string, number] => [
    k[0],
    Number(k.slice(1).replace(/\D/g, "") || 0),
  ];
  const keys = [...table.keys()].sort((a, b) => {
    const [a0, a1] = order(a);
    const [b0, b1] = order(b);
    return a0 < b0 ? -1 : a0 > b0 ? 1 : a1 - b1;
  });
  writeFileSync(
    path,
    `${keys.map((k) => (table.get(k) ?? []).join("\n")).join("\n")}\n`,
  );
}

/** The element each bound variable took in a model. */
export function bindingOf(model: Model<"main">, env: Env): Record<string, Elem> {
  const out: Record<string, Elem> = {};
  for (const [k, sym] of Object.entries(env)) {
    if (!(sym instanceof Sym)) {
      out[k] = sym;
      continue;
    }
    for (const [e, g] of sym.guards) if (Z3.isTrue(model.eval(g, true))) out[k] = e;
  }
  return out;
}

/** A binding as Python prints the dict: `{'c': (0, 0)}`, or with `quoted`
 * each element as its string, as the results tables hold it. */
export function showBinding(b: Record<string, Elem>, quoted = false): string {
  return `{${Object.entries(b)
    .map(([k, e]) => `${show(k)}: ${quoted ? show(show(e)) : show(e)}`)
    .join(", ")}}`;
}
