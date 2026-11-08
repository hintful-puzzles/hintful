/**
 * A technique's footprint: the marks a binding at one element of its first
 * binder reads, each named by the steps through the board's geometry from
 * that element to the marked one. A binding that found nothing finds nothing
 * again until one of those marks changes, so a solve visits again only the
 * elements a fact reached (`docs/descriptions.md` § "What a technique
 * compiles to").
 *
 * A technique whose reads cannot all be named that way is whole, `null`, and
 * runs over every element. What this cannot follow it calls whole, so a
 * footprint never leaves out a read: a missed read would skip a binding that
 * now fires.
 */
import type { Footprint, FootprintStep as Step } from "../engine/describe-runtime.ts";
import type { Definition, Technique } from "./description.ts";
import type { Binder, Expr } from "./expr.ts";

/** Which marks a read is of: the answer's (`known`, `value`, `cand`), or the
 * edge mark. */
type MarkKind = Footprint["reads"][number]["kind"];

/** What the analysis knows of the space and the marks. */
export interface FootprintEnv {
  readonly defs: ReadonlyMap<string, Definition>;
  /** Only a tiling's geometry is followed yet; elsewhere every technique is
   * whole. */
  readonly tiling: boolean;
  readonly answerSort: "cell" | "edge";
  readonly edgeMark: string | null;
  readonly edgeMarkSort: "edge" | "angle";
  readonly relation: string | null;
}

type Sort = Footprint["sort"];

/** What an expression is: free of marks (`fixed`); a value read off marks
 * the footprint holds (`local`); elements reached from the first binder's
 * element by each of `paths`; elements of a sort reached some other way
 * (`free`); or a function bound by a filling (`fillFn`). */
type Kind =
  | { k: "fixed" }
  | { k: "local" }
  | { k: "elems"; sort: Sort; paths: readonly (readonly Step[])[] }
  | { k: "free"; sort: Sort }
  | { k: "fillFn" };

class Whole extends Error {}

const FIXED: Kind = { k: "fixed" };
const LOCAL: Kind = { k: "local" };

const SORT_NAMES: Readonly<Record<string, Sort>> = {
  faces: "face",
  cells: "cell",
  edges: "edge",
  angles: "angle",
};

/** The geometry a tiling's functions read: by function and the argument's
 * sort, the step and the sort it reaches (`tilingCall` in `compile.ts`). */
const GEOMETRY: Readonly<Record<string, Partial<Record<Sort, [Step, Sort]>>>> = {
  edges: {
    face: ["faceEdges", "edge"],
    angle: ["angleEdges", "edge"],
    cell: ["cellEdges", "edge"],
  },
  angles: { face: ["faceAngles", "angle"], cell: ["cellAngles", "angle"] },
  cells: { face: ["faceCells", "cell"] },
  faces: { edge: ["edgeFaces", "face"] },
  apex: { angle: ["angleCell", "cell"] },
  ends: { edge: ["edgeEnds", "cell"] },
  end1: { edge: ["edgeEnds", "cell"] },
  end2: { edge: ["edgeEnds", "cell"] },
};

/** Functions that read no marks and whose value is a number or a truth. */
const PURE = new Set(["clue", "index", "abs", "range"]);

/** Functions whose value is one of their first argument's members. */
const MEMBER = new Set(["first", "nth"]);

interface Ctx {
  readonly env: FootprintEnv;
  readonly reads: { steps: readonly Step[]; kind: MarkKind }[];
  relation: boolean;
  /** Definitions being read, against a definition that reads itself. */
  readonly open: Set<string>;
}

type Scope = ReadonlyMap<string, Kind>;

/** The footprint of `t`, or `null` where it is whole. */
export function footprintOf(t: Technique, env: FootprintEnv): Footprint | null {
  if (!env.tiling || t.on !== null) return null;
  const [first, ...rest] = t.binders;
  if (first === undefined || first.kind !== "in" || first.of.k !== "name") return null;
  const sort = SORT_NAMES[first.of.name];
  if (sort === undefined) return null;
  const ctx: Ctx = { env, reads: [], relation: false, open: new Set() };
  try {
    let scope: Scope = new Map([[first.name, { k: "elems", sort, paths: [[]] }]]);
    if (first.where !== null) kindOf(first.where, scope, ctx);
    scope = binders(rest, scope, ctx);
    if (t.premise !== null) kindOf(t.premise, scope, ctx);
    kindOf(t.conclude, scope, ctx);
  } catch (e) {
    if (e instanceof Whole) return null;
    throw e;
  }
  const seen = new Set<string>();
  const reads = ctx.reads.filter((r) => {
    const key = `${r.kind}:${r.steps.join(",")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { sort, reads, relation: ctx.relation };
}

function binders(bs: readonly Binder[], scope: Scope, ctx: Ctx): Scope {
  let sc = new Map(scope);
  for (const b of bs) {
    if (b.kind === "fill") {
      // A filling of S from the answer's marks reads them at every member.
      const of = kindOf(b.of, sc, ctx);
      if (b.from !== "cand") throw new Whole();
      read(of, "answer", ctx);
      sc.set(b.name, { k: "fillFn" });
    } else if (b.kind === "let") sc.set(b.name, kindOf(b.of, sc, ctx));
    else sc.set(b.name, memberOf(kindOf(b.of, sc, ctx)));
    if (b.where !== null) kindOf(b.where, sc, ctx);
    sc = new Map(sc);
  }
  return sc;
}

/** A member of a set of kind `s`. */
function memberOf(s: Kind): Kind {
  if (s.k === "fillFn") throw new Whole();
  return s;
}

/** Record that marks of `kind` are read at the elements `at`. */
function read(at: Kind, kind: MarkKind, ctx: Ctx): void {
  if (at.k !== "elems") throw new Whole();
  for (const steps of at.paths) ctx.reads.push({ steps, kind });
}

/** Of two kinds a value is computed from, what the value is. */
function join(a: Kind, b: Kind): Kind {
  if (a.k === "local" || b.k === "local") return LOCAL;
  if (a.k === "fixed" && b.k === "fixed") return FIXED;
  return LOCAL;
}

function kindOf(e: Expr, scope: Scope, ctx: Ctx): Kind {
  switch (e.k) {
    case "num":
      return FIXED;
    case "name": {
      const bound = scope.get(e.name);
      if (bound !== undefined) return bound;
      const sort = SORT_NAMES[e.name];
      if (sort !== undefined) return { k: "free", sort };
      const def = ctx.env.defs.get(e.name);
      if (def !== undefined) return definition(e.name, def, [], ctx);
      // A size, `none`, a constant.
      return FIXED;
    }
    case "set": {
      const ks = e.elems.map((x) => kindOf(x, scope, ctx));
      if (ks.every((k) => k.k === "fixed")) return FIXED;
      if (ks.every((k) => k.k === "elems")) return union(ks);
      if (ks.some((k) => k.k === "elems" || k.k === "free" || k.k === "fillFn"))
        throw new Whole();
      return LOCAL;
    }
    case "size":
    case "not":
    case "neg":
      return value(kindOf(e.of, scope, ctx));
    case "bin": {
      const a = kindOf(e.a, scope, ctx);
      const b = kindOf(e.b, scope, ctx);
      // A set's members less some: still members of the first.
      if (e.op === "-" && a.k === "elems") return a;
      if (e.op === "-" && a.k === "free") return a;
      return join(value(a), value(b));
    }
    case "quant": {
      const sc = binders(e.binders, scope, ctx);
      return value(kindOf(e.body, sc, ctx));
    }
    case "agg": {
      const sc = binders(e.binders, scope, ctx);
      const w = e.where === null ? FIXED : value(kindOf(e.where, sc, ctx));
      if (e.fn === "set" || e.fn === "the") {
        // The members a comprehension keeps are its term's, or its binder's.
        const last = e.binders[e.binders.length - 1];
        const term =
          e.term !== null
            ? kindOf(e.term, sc, ctx)
            : last === undefined
              ? FIXED
              : (sc.get(last.name) ?? FIXED);
        if (term.k === "elems" || term.k === "free") return term;
        return join(w, value(term));
      }
      const term = e.term === null ? FIXED : value(kindOf(e.term, sc, ctx));
      return join(w, term);
    }
    case "with":
      throw new Whole();
    case "call":
      return call(e.fn, e.args, scope, ctx);
  }
}

/** A value read off `k`: an element's index is a number the footprint
 * fixes, so it is local where reached from the first binder. */
function value(k: Kind): Kind {
  if (k.k === "fillFn") throw new Whole();
  if (k.k === "free") return LOCAL;
  if (k.k === "elems") return LOCAL;
  return k;
}

function union(ks: readonly Kind[]): Kind {
  const first = ks[0];
  if (first === undefined || first.k !== "elems") throw new Whole();
  const paths: (readonly Step[])[] = [];
  for (const k of ks) {
    if (k.k !== "elems" || k.sort !== first.sort) throw new Whole();
    paths.push(...k.paths);
  }
  return { k: "elems", sort: first.sort, paths };
}

function call(fn: string, args: readonly Expr[], scope: Scope, ctx: Ctx): Kind {
  const { env } = ctx;
  const bound = scope.get(fn);
  if (bound?.k === "fillFn") {
    for (const a of args) kindOf(a, scope, ctx);
    return LOCAL;
  }
  const def = env.defs.get(fn);
  if (def !== undefined)
    return definition(
      fn,
      def,
      args.map((a) => kindOf(a, scope, ctx)),
      ctx,
    );
  const ks = (): Kind[] => args.map((a) => kindOf(a, scope, ctx));
  const geometry = GEOMETRY[fn];
  if (geometry !== undefined && args.length === 1) {
    const [arg] = ks();
    if (arg.k === "fixed") return FIXED;
    if (arg.k !== "elems" && arg.k !== "free") throw new Whole();
    const step = geometry[arg.sort];
    if (step === undefined) throw new Whole();
    if (arg.k === "free") return { k: "free", sort: step[1] };
    return {
      k: "elems",
      sort: step[1],
      paths: arg.paths.map((p) => [...p, step[0]]),
    };
  }
  switch (fn) {
    case "known":
    case "value":
    case "cand": {
      const [at, ...more] = ks();
      read(at, "answer", ctx);
      for (const m of more) value(m);
      return LOCAL;
    }
    case "place":
    case "strike": {
      const [at, d] = ks();
      value(d);
      const isMark =
        env.edgeMark !== null &&
        at.k === "elems" &&
        at.sort === env.edgeMarkSort &&
        at.sort !== env.answerSort;
      read(at, isMark ? "edgeMark" : "answer", ctx);
      return LOCAL;
    }
    case "before": {
      const [, of] = ks();
      return of;
    }
  }
  if (env.edgeMark !== null && fn === env.edgeMark) {
    const [at] = ks();
    read(at, "edgeMark", ctx);
    return LOCAL;
  }
  if (env.relation !== null && (fn === env.relation || fn === "relate")) {
    ctx.relation = true;
    for (const k of ks()) value(k);
    return LOCAL;
  }
  if (env.relation !== null && fn === "related") {
    ctx.relation = true;
    const [e] = ks();
    value(e);
    return { k: "free", sort: "edge" };
  }
  if (MEMBER.has(fn)) {
    const [of, ...more] = ks();
    for (const m of more) value(m);
    if (of.k === "elems" || of.k === "free" || of.k === "fixed") return of;
    return LOCAL;
  }
  if (PURE.has(fn)) {
    return ks().map(value).reduce(join, FIXED);
  }
  throw new Whole();
}

function definition(
  name: string,
  def: Definition,
  args: readonly Kind[],
  ctx: Ctx,
): Kind {
  if (ctx.open.has(name)) throw new Whole();
  ctx.open.add(name);
  const scope = new Map(
    def.params.map((p, i): [string, Kind] => [p, args[i] ?? FIXED]),
  );
  const k = kindOf(def.body, scope, ctx);
  ctx.open.delete(name);
  return k;
}
