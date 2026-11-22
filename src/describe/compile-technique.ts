/**
 * A technique compiled to a function (`compile.ts`): its binders' loops, the
 * reads it makes again before it concludes, and the stale-read guard.
 */

import { MADE } from "../engine/solve/marks-made.ts";
import { bindingLoops, compileExpr, type Recheck, witnessOf } from "./compile-expr.ts";
import { drawBrokeSets, MAX_GROWTH, power, techniqueGrowth } from "./compile-growth.ts";
import {
  answerCount,
  BOOL,
  CompileError,
  type Env,
  elem,
  expect,
  expectElem,
  isArray,
  isSetOf,
  type Line,
  Out,
  once,
  type Scope,
  type Shared,
  type Slot,
  type Sort,
  show,
  suppliedSort,
  tsType,
  type Val,
} from "./compile-sorts.ts";
import { checkStated, wordingIndex } from "./compile-stated.ts";
import { freeNames, readsMarks } from "./compile-terms.ts";
import type { SaidTerm, SuppliedKind, Technique } from "./description.ts";
import { type Binder, children, type Expr } from "./expr.ts";
import { footprintOf } from "./footprint.ts";

// --- a technique ------------------------------------------------------------

export const capitalized = (id: string): string => id[0].toUpperCase() + id.slice(1);

/** The sorts each binder of a technique takes, for its binding's type. */
function binderSorts(t: Technique, env: Env): { name: string; sort: Sort }[] {
  const sorts: { name: string; sort: Sort }[] = [];
  const probe = new Out(0);
  bindingLoops(
    t.binders,
    new Map(),
    { ...env, used: new Set(), scratch: null, hoist: null, boardRoot: null },
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

/** One of a binding's reads of the marks made again: the statements that
 * make it, its truth, and how many of the binders' loops are open where a
 * binding it fails is left, so that the bindings it governs are passed over
 * with it. */
export interface Reread {
  lines: readonly Line[];
  code: string;
  leave: number;
}

/**
 * A binding's reads of the marks that a fact made since could have changed:
 * whether each binder's element is still in its set, each `=` names what its
 * term reads now, and each `where` holds, compiled at the binding, outermost
 * first. A read is made again only where another binding's facts can come
 * between it and the binding, a loop opened since; and only where it reads
 * the marks, since the board's deal and the binders' names do not change. A
 * read the language cannot state again (a subset's membership) is false, so
 * its bindings are passed over whenever a count moves. A set named by `=`
 * that the binding reads only by its groups is read again only at those
 * groups (`groupRereads`).
 */
function rereads(
  binders: readonly Binder[],
  rest: readonly (Expr | null)[],
  scope: Scope,
  env: Env,
): Reread[] {
  const out: { expr: Expr; read: number; leave: number; set?: number }[] = [];
  const levels = new Map<string, number>();
  let loops = 0;
  for (const [i, bnd] of binders.entries()) {
    const name: Expr = { k: "name", name: bnd.name };
    if (bnd.kind === "let") {
      if (readsMarks(bnd.of, env))
        out.push({
          expr: { k: "bin", op: "=", a: name, b: bnd.of },
          read: loops,
          leave: loops,
          set: i,
        });
    } else {
      loops++;
      // The set is read ahead of the binder's own loop, an element of it at
      // a time in it.
      if (readsMarks(bnd.of, env))
        out.push({ expr: memberOf(name, bnd.of), read: loops - 1, leave: loops });
    }
    if (bnd.where !== null && readsMarks(bnd.where, env))
      out.push({ expr: bnd.where, read: loops, leave: loops });
    levels.set(bnd.name, loops);
  }
  return out
    .filter((r) => r.read < loops)
    .flatMap(({ expr, leave, set }): Reread[] => {
      if (set !== undefined) {
        const after = [
          binders[set].where,
          ...binders.slice(set + 1).flatMap((b) => [b.of, b.where]),
          ...rest,
        ].filter((e): e is Expr => e !== null);
        const groups = groupRereads(binders[set].name, after, levels, scope, env);
        if (groups !== null) return groups;
      }
      const o = new Out(0);
      const mark = Out.mark();
      const used = new Set(env.used);
      const scratch: string[] = [];
      try {
        const v = compileExpr(expr, scope, { ...env, scratch }, o);
        expect(v, "bool", "a read made again");
        env.scratch?.push(...scratch);
        return [{ lines: flatLines(o), code: v.code, leave }];
      } catch (e) {
        if (!(e instanceof CompileError)) throw e;
        Out.rewind(mark);
        env.used.clear();
        for (const u of used) env.used.add(u);
        return [{ lines: [], code: "false", leave }];
      }
    });
}

/**
 * A set `S` named by `=` ahead of the loops, read by the binding only as the
 * groups `through(t, S)` of terms `t` of the binders, its groups kept on the
 * marks: whether each such group is the one the binding took, the kept
 * groups caught up and read at `t`. A placement elsewhere leaves the binding
 * as it was, where reading `S` whole again would pass it over: Filling's
 * `O = alike` changed with nearly every placement, and ended each run at
 * its first. A group's read fails for the bindings of its terms' values, so
 * that is the scope it leaves. `null` where `after`, what is read after `S`
 * is bound, reads it otherwise, or its groups are not kept.
 */
function groupRereads(
  s: string,
  after: readonly Expr[],
  levels: ReadonlyMap<string, number>,
  scope: Scope,
  env: Env,
): Reread[] | null {
  const terms = new Map<string, Expr>();
  if (!after.every((e) => throughOnly(e, s, new Set(), terms))) return null;
  const S = scope.get(s);
  const kept = S?.edgeSet?.() ?? null;
  if (S?.at === undefined || kept === null) return null;
  const key = `keptEdgeGroups(sp, b, ${kept.clues ? "cl" : "null"}, ${kept.fn}, ${kept.arg}, ${env.answerSort === "edge"})`;
  // The groups the binding read, taken where `S` is bound.
  const then = S.at.made.get(key);
  if (then === undefined) return null;
  const reads: Reread[] = [];
  for (const t of terms.values()) {
    if (readsMarks(t, env)) return null;
    const names = new Set<string>();
    freeNames(t, names, new Set());
    let leave = levels.get(s) ?? 0;
    for (const n of names) leave = Math.max(leave, levels.get(n) ?? 0);
    const o = new Out(0);
    const x = compileExpr(t, scope, env, o);
    expectElem(x, "cell", "through");
    const now = Out.fresh("_now");
    const was = `${then.code}.of(${x.code})`;
    reads.push({
      lines: [
        ...flatLines(o),
        { indent: 0, text: `const ${now} = ${key}.of(${x.code});` },
      ],
      code: `${now} === ${was} || sameSet(${now}, ${was})`,
      leave,
    });
  }
  if (kept.clues) env.readsClues.yes = true;
  env.used.add("keptEdgeGroups");
  env.used.add("sameSet");
  return reads;
}

/** One of a binding's reads made afresh for the stale-read guard: the
 * statements that make it, its truth, and what it reads, for the error. */
export interface FreshRead {
  lines: readonly Line[];
  code: string;
  what: string;
}

/**
 * Every read a binding makes of its binders, made afresh at the binding for
 * the stale-read guard (`staleChecking` in the runtime): each element still
 * in its set, each `=` naming what its term reads, each `where` holding. It
 * is written apart from `rereads` and narrows nothing: every binder, whether
 * or not a fact could have come between, read from the marks with no count.
 * A set the binding reads only by its groups is compared at those groups,
 * joined afresh from the set read now, not the kept ones. A read the
 * language cannot state again is not made.
 */
function freshReads(
  binders: readonly Binder[],
  rest: readonly (Expr | null)[],
  scope: Scope,
  env: Env,
): FreshRead[] {
  const out: FreshRead[] = [];
  const attempt = (what: string, make: (o: Out, e: Env) => string): void => {
    const o = new Out(0);
    const mark = Out.mark();
    const used = new Set(env.used);
    try {
      // No buffer is kept for the function: a build drops the guard, and a
      // buffer declared outside it would be made on every call.
      const code = make(o, { ...env, scratch: null });
      out.push({ lines: flatLines(o), code, what });
    } catch (e) {
      if (!(e instanceof CompileError)) throw e;
      Out.rewind(mark);
      env.used.clear();
      for (const u of used) env.used.add(u);
    }
  };
  const truth = (expr: Expr) => (o: Out, e: Env) => {
    const v = compileExpr(expr, scope, e, o);
    expect(v, "bool", "a read made afresh");
    return v.code;
  };
  for (const [i, bnd] of binders.entries()) {
    const name: Expr = { k: "name", name: bnd.name };
    if (bnd.kind === "let") {
      const after = [
        bnd.where,
        ...binders.slice(i + 1).flatMap((b) => [b.of, b.where]),
        ...rest,
      ].filter((e): e is Expr => e !== null);
      const terms = new Map<string, Expr>();
      const S = scope.get(bnd.name);
      // Asking for a set's kept groups declares what keeps them, so only a
      // set read by its groups alone asks.
      const kept = after.every((e) => throughOnly(e, bnd.name, new Set(), terms))
        ? (S?.edgeSet?.() ?? null)
        : null;
      const then =
        kept === null || S?.at === undefined
          ? undefined
          : S.at.made.get(
              `keptEdgeGroups(sp, b, ${kept.clues ? "cl" : "null"}, ${kept.fn}, ${kept.arg}, ${env.answerSort === "edge"})`,
            );
      if (then !== undefined)
        attempt(`${bnd.name}'s groups`, (o, e) => {
          const now = compileExpr(bnd.of, scope, e, o);
          const groups = Out.fresh("_fg");
          o.emit(`const ${groups} = edgeGroups(sp, ${now.code});`);
          e.used.add("edgeGroups");
          e.used.add("sameSet");
          return [...terms.values()]
            .map((t) => {
              const x = compileExpr(t, scope, e, o);
              expectElem(x, "cell", "through");
              return `sameSet(${groups}.of(${x.code}), ${then.code}.of(${x.code}))`;
            })
            .join(" && ");
        });
      else attempt(`${bnd.name} =`, truth({ k: "bin", op: "=", a: name, b: bnd.of }));
    } else if (bnd.kind === "in")
      attempt(`${bnd.name} in`, truth(memberOf(name, bnd.of)));
    if (bnd.where !== null) attempt(`where of ${bnd.name}`, truth(bnd.where));
  }
  return out;
}

/** Whether `e` reads the set named `s` only as `through(t, s)`, each `t`
 * bound outside `e` (gathered into `terms`, by its form). */
function throughOnly(
  e: Expr,
  s: string,
  local: ReadonlySet<string>,
  terms: Map<string, Expr>,
): boolean {
  if (e.k === "name") return e.name !== s;
  const [t, set] = e.k === "call" && e.fn === "through" ? e.args : [];
  if (set?.k === "name" && set.name === s && !local.has(s)) {
    const names = new Set<string>();
    freeNames(t, names, new Set());
    if ([...names].some((n) => local.has(n))) return false;
    terms.set(JSON.stringify(t), t);
    return throughOnly(t, s, local, terms);
  }
  if (e.k === "quant" || e.k === "agg") {
    const inner = new Set([...local, ...e.binders.map((b) => b.name)]);
    return children(e).every((c) => throughOnly(c, s, inner, terms));
  }
  return children(e).every((c) => throughOnly(c, s, local, terms));
}

/** `x in of`, where `of` is a range or a set stated member by member, which
 * a binder ranges over but no `in` reads, as the comparisons they are. */
function memberOf(x: Expr, of: Expr): Expr {
  if (of.k === "call" && of.fn === "range" && of.args.length === 2) {
    const [lo, hi] = of.args;
    return {
      k: "bin",
      op: "and",
      a: { k: "bin", op: "<=", a: lo, b: x },
      b: { k: "bin", op: "<=", a: x, b: hi },
    };
  }
  if (of.k === "set" && of.elems.length > 0)
    return of.elems
      .map((e): Expr => ({ k: "bin", op: "=", a: x, b: e }))
      .reduce((a, b) => ({ k: "bin", op: "or", a, b }));
  return { k: "bin", op: "in", a: x, b: of };
}

/** `o`'s statements, its slots' among them, each at its indent in `o`. */
function flatLines(o: Out): Line[] {
  return o.entries.flatMap((e) =>
    "text" in e
      ? [{ indent: e.indent, text: e.text }]
      : e.lines.map((l) => ({ indent: e.indent + l.indent, text: l.text })),
  );
}

/** The kinds of mark ({@link MADE}) each of the marks' members a compiled
 * line names reads; a write, what to visit, or a size the marks hold, reads
 * none a binding rests on. Any other mention of the marks, `b` passed to a function of the
 * runtime, reads every kind. */
const READS = new Map<string, number>([
  ...["grid", "known", "value"].map((m): [string, number] => [m, 1 << MADE.value]),
  ...["cands", "cand", "has", "candCount", "candFirst", "candList"].map(
    (m): [string, number] => [m, 1 << MADE.cand],
  ),
  ["edgeCand", 1 << MADE.edgeMark],
  ["markOf", 1 << MADE.cellMark],
  ...["pairOf", "relatedOf"].map((m): [string, number] => [m, 1 << MADE.relation]),
  // The count of placements and cell marks, by which a kept term is kept.
  ["placed", (1 << MADE.value) | (1 << MADE.cellMark)],
  ...[
    "placeAt",
    "strikeAt",
    "edgeStrikeAt",
    "markAt",
    "relateAt",
    "visit",
    "domain",
    "repeat",
    "times",
  ].map((m): [string, number] => [m, 0]),
]);
const EVERY_KIND = (1 << Object.keys(MADE).length) - 1;

/** The kinds of mark a line of compiled code reads: the code names the
 * marks `b` and nothing else so (`compileTechnique`'s signature). */
function kindsRead(line: string): number {
  let kinds = 0;
  for (const m of line.matchAll(/\bb\b(?:\.(\w+))?/g))
    kinds |= m[1] === undefined ? EVERY_KIND : (READS.get(m[1]) ?? EVERY_KIND);
  return kinds;
}

/**
 * Write each binding's check: for each kind of mark read ahead of it, the
 * count of facts that changed that kind is taken in the latest slot in scope
 * that no read of the kind precedes, and a binding whose counts moved reads
 * its binders again; one whose reads no longer hold leaves their scope, its
 * element left to visit again. A technique run on placing is run again, by
 * `rerun`. Whether a left loop marked the run to be run again.
 */
function rechecked(r: Recheck, body: Out, rerun: string | null, env: Env): boolean {
  // A kind of mark the description keeps none of no fact changes.
  const kept =
    (1 << MADE.value) |
    (1 << MADE.cand) |
    (env.edgeMark === null ? 0 : 1 << MADE.edgeMark) |
    (env.cellMark === null ? 0 : 1 << MADE.cellMark) |
    (env.relation === null ? 0 : 1 << MADE.relation);
  const before = new Map<Slot, number>();
  let read = 0;
  for (const e of body.entries) {
    if ("text" in e) {
      read |= kindsRead(e.text);
      continue;
    }
    before.set(e, read);
    for (const l of e.lines) read |= kindsRead(l.text);
  }
  const taken = new Map<string, string>();
  const labels = new Map<Line, string>();
  let stale = false;
  for (const check of r.checks) {
    if (check.reads.length === 0) continue;
    const kinds = (before.get(check.at) ?? EVERY_KIND) & kept;
    const moved: string[] = [];
    for (const k of Object.values(MADE)) {
      if ((kinds & (1 << k)) === 0) continue;
      let place = check.chain[0];
      for (let i = check.chain.length - 1; i >= 0; i--)
        if (((before.get(check.chain[i].slot) ?? EVERY_KIND) & (1 << k)) === 0) {
          place = check.chain[i];
          break;
        }
      // Only a loop opened since the count runs another binding, whose
      // facts could move it.
      if (place.loops === check.loops.length) continue;
      const at = place.slot;
      const key = `${at.seq}_${k}`;
      let name = taken.get(key);
      if (name === undefined) {
        name = `${Out.fresh("_m")}_${k}`;
        taken.set(key, name);
        at.lines.push({ indent: 0, text: `const ${name} = b.made[${k}];` });
      }
      moved.push(`b.made[${k}] !== ${name}`);
    }
    if (moved.length === 0) continue;
    const again =
      check.visit === null ? "" : `if (_visit !== null) _visit[${check.visit}] = 1; `;
    const lines: Line[] = [{ indent: 0, text: `if (${moved.join(" || ")}) {` }];
    // A read that fails fails for every binding it governs, so its scope is
    // left: its loop goes on to the next, and the function's start is left
    // by returning.
    for (const read of check.reads) {
      let leave: string;
      if (read.leave === 0)
        leave = rerun === null ? "return fired;" : `return ${rerun} | fired;`;
      else {
        const loop = check.loops[read.leave - 1];
        let label = labels.get(loop);
        if (label === undefined) {
          // A technique's binders' loops nest in one chain, so the depth
          // names one in the function; a fresh name would renumber the
          // module's others.
          label = `R${read.leave}`;
          labels.set(loop, label);
          const i = body.entries.indexOf(loop);
          if (i < 0)
            throw new CompileError("a binder's loop is not the technique's own");
          body.entries.splice(i, 0, { indent: loop.indent, text: `${label}:` });
        }
        if (rerun !== null) stale = true;
        leave = `${rerun === null ? "" : "_stale = true; "}continue ${label};`;
      }
      for (const l of read.lines) lines.push({ indent: l.indent + 1, text: l.text });
      lines.push({ indent: 1, text: `if (!(${read.code})) { ${again}${leave} }` });
    }
    lines.push({ indent: 0, text: "}" });
    check.at.lines.push(...lines);
  }
  if (stale) r.chain[0].slot.lines.push({ indent: 0, text: "let _stale = false;" });
  return stale;
}

/** Write each binding's stale-read guard, after its reads made again: under
 * the runtime's switch, every read of its binders made afresh, each that no
 * longer holds an error. */
function freshChecked(r: Recheck, id: string, env: Env): void {
  for (const check of r.checks) {
    if (check.fresh.length === 0) continue;
    env.used.add("staleChecking");
    env.used.add("freshBinding");
    // The guard is half again the module's size: a build drops it. `DEV` is
    // the module's (`runtimeImport`).
    const lines: Line[] = [{ indent: 0, text: "if (DEV && staleChecking) {" }];
    for (const read of check.fresh)
      for (const l of read.lines) lines.push({ indent: l.indent + 1, text: l.text });
    const holds = check.fresh.map((read) => read.code).join(", ");
    const what = check.fresh.map((read) => JSON.stringify(read.what)).join(", ");
    lines.push(
      {
        indent: 1,
        text: `freshBinding(${JSON.stringify(id)}, [${holds}], [${what}]);`,
      },
      { indent: 0, text: "}" },
    );
    check.at.lines.push(...lines);
  }
}

/** A technique compiled: its function, whether it reads the board's clues,
 * and the bindings that name a clue: each a cell's, whose clue is the one at
 * it, and each a clue's index in its kind's list, by the kind. */
export interface CompiledTechnique {
  readonly code: string;
  readonly clues: boolean;
  readonly reads: {
    readonly cells: readonly string[];
    readonly clues: Readonly<Record<string, string>>;
  };
}

export function compileTechnique(t: Technique, env: Env): CompiledTechnique {
  const fnName = t.id.includes(".") ? t.id.slice(t.id.indexOf(".") + 1) : t.id;
  return Out.own(fnName, () => techniqueFunction(t, fnName, env));
}

function techniqueFunction(t: Technique, fnName: string, env: Env): CompiledTechnique {
  const bindingType = `${capitalized(fnName)}Binding`;
  const saysType = `${capitalized(fnName)}Says`;
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
  const held: string[] = [];
  const epoch = { used: false };
  const readsCands = { yes: false };
  const memos = new Map<string, readonly string[]>();
  const tenv: Env = {
    ...env,
    readsClues,
    readsCands,
    memos: onPlace ? undefined : memos,
    memo: !onPlace,
    scratch,
    ...(onPlace ? {} : { held }),
    hoist: null,
    boardRoot: null,
    epoch: onPlace ? null : epoch,
    factSays:
      t.says?.fact == null
        ? undefined
        : {
            says: t.says.fact,
            buffer: `${fnName}FactSays`,
            fields: { terms: [], marks: [] },
            sorts: new Map(),
          },
  };
  if (t.binders.some((b) => b.kind === "fill"))
    throw new CompileError(`${t.id}: a filling binds in a quantifier, not a technique`);
  const sorts = binderSorts(t, tenv);
  const fields = sorts.map((s) => `  ${s.name}: ${tsType(s.sort)};`);
  const body = new Out(1);
  body.emit(`const facts = ${fnName}Facts;`);
  body.emit("let fired = 0;");
  body.emit("let changed = false;");
  const recheck: Recheck = {
    binders: [],
    chain: [{ slot: body.slot(0), loops: 0 }],
    loops: [],
    checks: [],
  };
  // A solve makes each fact as it concludes it, so a placement would change
  // a `value` or `known` read before it; a strike changes neither.
  tenv.hoist = { root: body.slot(0), loops: 0, marks: !places(t.conclude, env) };
  tenv.boardRoot = tenv.hoist.root;
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
  // Nothing is moved out of a binding's reads made again, nor shared with
  // what was computed before the facts that made a read stale.
  const readEnv = (): Env => ({
    ...benv,
    hoist: null,
    boardRoot: null,
    shared: { made: new Map() },
    recheck: undefined,
    visitBinder: undefined,
    visitAt: undefined,
  });
  // The fields of what a firing says, by group, as the module's type for it.
  const saysFields = {
    variants: [] as {
      name: string | null;
      terms: string[];
      marks: string[];
      sorts: Map<string, Sort>;
      /** The terms the game supplies as words, which have no sort. */
      words: string[];
      /** Whether a firing carries the `wording` that held. */
      worded: boolean;
      /** The fields of the terms and marks the game supplies. */
      supplied: { terms: string[]; marks: string[] };
    }[],
  };
  const fire = (sc: Scope): void => {
    const shared: Shared = { made: new Map() };
    const visited =
      benv.visitBinder === undefined ? undefined : sc.get(benv.visitBinder.name);
    recheck.checks.push({
      at: body.slot(0),
      chain: [...recheck.chain],
      loops: [...recheck.loops],
      visit: visited?.code ?? null,
      reads: rereads(recheck.binders, [t.premise, t.conclude], sc, readEnv()),
      fresh: freshReads(t.binders, [t.premise, t.conclude], sc, readEnv()),
    });
    if (t.premise !== null) {
      const p = compileExpr(t.premise, sc, { ...tenv, shared }, body);
      expect(p, "bool", "premise");
      body.emit(`if (!(${p.code})) continue;`);
    }
    body.emit("facts.length = 0;");
    if (tenv.factSays !== undefined) body.emit(`${tenv.factSays.buffer}.length = 0;`);
    body.emit("changed = false;");
    const c = compileExpr(t.conclude, sc, { ...tenv, concluding: true, shared }, body);
    expect(c, "bool", "conclusion");
    // A set is a buffer the next binding refills, and a reason may keep it
    // past that, as a plan does, so the binding holds a copy.
    const binding = `{ ${sorts
      .map((s) => `${s.name}: v_${s.name}${isArray(s.sort) ? ".slice()" : ""}`)
      .join(", ")} }`;
    // A conclusion that is false proves the marks inconsistent.
    body.emit(`if (!(${c.code})) return -1;`);
    body.open("if (changed || facts.length > 0) {");
    body.emit("fired = 1;");
    // What the step speaks of is read here, on the marks before the facts are
    // made, and only on a hint's path: a solve passes no `fire`.
    let said = "";
    if (t.says !== null) {
      said = ", _says";
      body.open("if (fire !== null) {");
      saysFields.variants.length = 0;
      const { variants } = t.says;
      const arms = variants[0].name !== null;
      // The arm that holds, the first true one: every condition is read where
      // the others are, on the marks before the facts are made.
      if (arms) {
        const holds = variants.map((v) => {
          const w = compileExpr(v.when as Expr, sc, { ...tenv, shared }, body);
          expect(w, "bool", `says ${v.name} when`);
          return w.code;
        });
        body.emit(`let _arm = -1;`);
        body.emit(
          holds
            .map((h, i) => `if (${h}) _arm = ${i};`)
            .reduceRight(
              (rest, line, i) =>
                i === holds.length - 1 ? line : `${line} else ${rest}`,
              "",
            ),
        );
      }
      if (tenv.factSays !== undefined)
        body.emit(
          `if (${tenv.factSays.buffer}.length * 3 !== facts.length) throw new Error(${JSON.stringify(`${t.id}: a fact of its conclusion is made where says.fact is not read`)});`,
        );
      // What held in the technique's `where`s and `premise`, read on the
      // same marks as the terms.
      if (t.says.witness) {
        env.used.add("type Witness");
        env.used.add("witnessAll");
        const held = [
          ...t.binders.flatMap((b) => (b.kind === "fill" ? [] : [b.where])),
          t.premise,
        ].filter((x): x is Expr => x !== null);
        const parts = held
          // Its buffers are declared where it is read, not once a call.
          .map((x) =>
            witnessOf(
              x,
              sc,
              { ...tenv, shared: { made: new Map() }, scratch: null },
              body,
            ),
          )
          .filter((w): w is string => w !== null);
        body.emit(
          `const _w: Witness | null = ${
            parts.length === 0
              ? "null"
              : parts.length === 1
                ? parts[0]
                : `witnessAll(${parts.join(", ")})`
          };`,
        );
      }
      // The elements those same formulas read, a second time on the same
      // marks, recording each read of a mark.
      if (t.says.reads) {
        env.used.add("type Reads");
        body.emit(`const _rc: number[] = [];`);
        body.emit(`const _re: number[] = [];`);
        const readEnv: Env = {
          ...tenv,
          shared: { made: new Map() },
          scratch: null,
          // In place: a read moved out of its loop would run before `_rc`
          // is declared, and one shared with the solve path's is not made.
          hoist: null,
          boardRoot: null,
          reads: { cells: "_rc", edges: "_re" },
        };
        // What a binder is drawn from or defined as is read too: a number's
        // lines left are the marks round it, bound before any `where`.
        for (const x of [
          ...t.binders.flatMap((b) => (b.kind === "fill" ? [] : [b.of, b.where])),
          t.premise,
        ]) {
          if (x === null) continue;
          const v = compileExpr(x, sc, readEnv, body);
          if (x === t.premise || t.binders.some((b) => b.where === x)) {
            expect(v, "bool", "reads");
            once(v, body);
          } else if (/_r[ce]\.push\(/.test(v.code)) {
            // A value is wanted for its reads alone.
            body.emit(`void (${v.code});`);
          }
        }
        body.emit(
          `const _r: Reads = { cells: [...new Set(_rc)], edges: [...new Set(_re)] };`,
        );
      }
      if (arms) body.emit(`let _says: ${saysType} | null = null;`);
      for (const [i, v] of variants.entries()) {
        const fields = { terms: [] as string[], marks: [] as string[] };
        const supplied = { terms: [] as string[], marks: [] as string[] };
        const words: string[] = [];
        const sorts = new Map<string, Sort>();
        // A term read inside an arm is not in scope in another.
        const inArm: Shared = { made: new Map(shared.made) };
        if (arms) body.open(`if (_arm === ${i}) {`);
        // Where the step has wordings, each term and mark is bound once, for
        // their `when`s to read by name.
        const worded = v.words.length > 1;
        const named = new Map(sc);
        const read = (e: Expr, group: "terms" | "marks", name: string): string => {
          const r = compileExpr(e, sc, { ...tenv, shared: inArm }, body);
          if (group === "marks" && !isArray(r.sort))
            throw new CompileError(
              `${t.id}: says marks ${name} is not a set of elements`,
            );
          fields[group].push(`${name}: ${tsType(r.sort)};`);
          if (group === "terms") sorts.set(name, r.sort);
          // A set is a buffer the next binding refills.
          const code = isArray(r.sort) ? `${r.code}.slice()` : r.code;
          if (!worded) return `${name}: ${code}`;
          const bound = `_sw_${name}`;
          body.emit(`const ${bound} = ${code};`);
          named.set(name, { code: bound, sort: r.sort });
          return `${name}: ${bound}`;
        };
        // What the game supplies is a placeholder here, which its hook for
        // the technique replaces; a wording's `when` cannot read it, for the
        // wording is chosen before the game supplies it.
        const placeholder = (
          kind: SuppliedKind,
          group: "terms" | "marks",
          name: string,
        ): string => {
          // Words are no sort the checker has: said as they are, and read by
          // nothing else.
          if (kind === "words") {
            fields[group].push(`${name}: readonly string[];`);
            supplied[group].push(`${name}: readonly string[];`);
            words.push(name);
            return `${name}: []`;
          }
          const sort = suppliedSort(kind);
          fields[group].push(`${name}: ${tsType(sort)};`);
          if (kind !== "several") supplied[group].push(`${name}: ${tsType(sort)};`);
          if (group === "terms") sorts.set(name, sort);
          return `${name}: ${isArray(sort) ? "[]" : sort.k === "bool" ? "false" : sort.k === "elem" ? "-1" : "0"}`;
        };
        // A term of a break (`{broke}`, `load.ts`) is read off the witness:
        // whether the break that held is this one, or its term where it is,
        // the placeholder elsewhere.
        let at: string | null = null;
        const broken = (b: NonNullable<SaidTerm["broke"]>, name: string): string => {
          if (!t.says?.witness)
            throw new CompileError(
              `${t.id}: ${name} is a break's, read off a witness it does not say`,
            );
          if (at === null) {
            env.used.add("brokeAt");
            at = Out.fresh("_bk");
            body.emit(
              `const ${at} = brokeAt(_w, ${JSON.stringify([...env.breaks.of.keys()])});`,
            );
            // Its words would say the last break's, with none of its terms.
            body.emit(
              `if (${at} === null) throw new Error(${JSON.stringify(`${t.id}: its witness holds no break`)});`,
            );
          }
          const sort =
            b.term === null ? BOOL : env.breaks.sorts.get(`${b.name}.${b.term}`);
          if (sort === undefined)
            throw new CompileError(
              `${t.id}: its witness never holds break ${b.name}, whose ${b.term} it says`,
            );
          fields.terms.push(`${name}: ${tsType(sort)};`);
          sorts.set(name, sort);
          const none = isArray(sort)
            ? "[]"
            : sort.k === "bool"
              ? "false"
              : sort.k === "elem"
                ? "-1"
                : "0";
          const held = `${at}?.name === ${JSON.stringify(b.name)}`;
          const code =
            b.term === null
              ? held
              : `(${held} ? (${at}.says[${JSON.stringify(b.term)}] as ${tsType(sort)}) : ${none})`;
          if (isArray(sort) && b.term !== null) brokeSets.set(name, `_sw_${name}`);
          if (!worded && !isArray(sort)) return `${name}: ${code}`;
          body.emit(`const _sw_${name} = ${code};`);
          named.set(name, { code: `_sw_${name}`, sort });
          return `${name}: _sw_${name}`;
        };
        // A break's set of elements, by term, which its words may draw.
        const brokeSets = new Map<string, string>();
        const terms = v.terms.map((x) =>
          x.broke !== null
            ? broken(x.broke, x.name)
            : x.supplied === null
              ? read(x.expr as Expr, "terms", x.name)
              : placeholder(x.supplied, "terms", x.name),
        );
        const marks: string[] = [];
        for (const role of new Set(v.marks.map((m) => m.role))) {
          const ofRole = v.marks.filter((m) => m.role === role);
          if (ofRole[0].sort === null) {
            const { expr } = ofRole[0];
            marks.push(
              expr === null
                ? placeholder("elements", "marks", role)
                : read(expr, "marks", role),
            );
            continue;
          }
          // A role holding several sorts is an object of a set by sort. A
          // wording's `when` reads each by the role and the sort, `outlineFace`.
          const parts = ofRole.map((m) => {
            const r = compileExpr(m.expr as Expr, sc, { ...tenv, shared: inArm }, body);
            if (r.sort.k !== "set" || r.sort.of.k !== "elem" || r.sort.of.e !== m.sort)
              throw new CompileError(
                `${t.id}: says marks ${role} ${m.sort} is not a set of ${m.sort}s, but ${show(r.sort)}`,
              );
            const code = `${r.code}.slice()`;
            if (!worded) return { sort: m.sort, code };
            const name = `${role}${(m.sort as string).replace(/^./, (c) => c.toUpperCase())}`;
            body.emit(`const _sw_${name} = ${code};`);
            named.set(name, { code: `_sw_${name}`, sort: r.sort });
            return { sort: m.sort, code: `_sw_${name}` };
          });
          fields.marks.push(
            `${role}: { ${parts.map((p) => `${JSON.stringify(p.sort)}: readonly number[];`).join(" ")} };`,
          );
          marks.push(
            `${role}: { ${parts.map((p) => `${JSON.stringify(p.sort)}: ${p.code}`).join(", ")} }`,
          );
        }
        drawBrokeSets(t.id, v, brokeSets, marks, fields.marks);
        const own =
          tenv.factSays === undefined ? "" : `, facts: ${tenv.factSays.buffer}.slice()`;
        const readsSupplied = (e: Expr): void => {
          const free = new Set<string>();
          freeNames(e, free, new Set());
          const name = v.terms.find(
            (x) => x.supplied !== null && free.has(x.name),
          )?.name;
          if (name !== undefined)
            throw new CompileError(
              `${t.id}: a wording's when reads ${name}, which is supplied after the wording is chosen: choose by {if ${name}: …} in the clause`,
            );
        };
        const wording = worded
          ? `, wording: ${wordingIndex(
              v.words,
              `${t.id}: says${v.name === null ? "" : ` ${v.name}`}`,
              (e) => {
                readsSupplied(e);
                return compileExpr(e, named, { ...tenv, shared: inArm }, body);
              },
            )}`
          : "";
        body.emit(
          `${arms ? "" : "const "}_says = { ${arms ? `arm: ${JSON.stringify(v.name)}, ` : ""}terms: { ${terms.join(", ")} }, marks: { ${marks.join(", ")} }${wording}${own}${t.says.witness ? ", witness: _w" : ""}${t.says.reads ? ", reads: _r" : ""} };`,
        );
        if (arms) body.close();
        saysFields.variants.push({
          name: v.name,
          ...fields,
          sorts,
          words,
          worded,
          supplied,
        });
      }
      if (arms)
        body.emit(
          `if (_says === null) throw new Error(${JSON.stringify(`${t.id}: no arm of says holds`)});`,
        );
    }
    // A technique run on placing makes every firing; a rung stops at the
    // first unless `fire` asks for the rest.
    if (onPlace) {
      body.emit(
        `${t.says === null ? "if (fire !== null) " : ""}fire(${binding}, facts${said});`,
      );
      if (t.says !== null) body.close();
    } else {
      body.emit(
        t.says === null
          ? `if (fire !== null && !fire(${binding}, facts)) return 1;`
          : `if (!fire(${binding}, facts${said})) return 1;`,
      );
      if (t.says !== null) body.close();
      // The firing changed the marks the kept candidates were read from.
      refills.push(body.slot(0));
      if (epoch.used) body.emit("_epoch++;");
    }
    body.close();
  };
  // The binders' statements share their terms as a premise's do: no fact is
  // made among them, and one is read again only where `sharedReach` allows.
  // Bridges' `cap(c, y)` reads `has(c, y)` three times in one `where`.
  const benv: Env = { ...tenv, shared: { made: new Map() }, recheck };
  const foot = footprintOf(t, env);
  const footName = `${fnName}Footprint`;
  const visitAt = { slot: null as Slot | null, groups: new Map<string, string>() };
  if (foot !== null) {
    benv.visitBinder = t.binders[foot.sets?.length ?? 0];
    benv.visitAt = visitAt;
    env.used.add("type Footprint");
  }
  let params: string;
  if (onPlace) {
    const [first, ...rest] = t.binders;
    if (first === undefined || first.kind !== "in")
      throw new CompileError(
        `${t.id}: a technique run on ${t.on === "strike" ? "striking binds the struck" : "placing binds the placed"} cell first`,
      );
    const of = compileExpr(
      first.of,
      new Map(),
      { ...tenv, hoist: null, boardRoot: null },
      new Out(0),
    );
    const held = env.answerSort;
    if (!isSetOf(of.sort, held))
      throw new CompileError(`${t.id}: its first binder is not over ${held}s`);
    const sc = new Map<string, Val>([
      [first.name, { code: `v_${first.name}`, sort: elem(held), at: tenv.hoist.root }],
    ]);
    if (first.where !== null) {
      const w = compileExpr(first.where, sc, benv, body);
      expect(w, "bool", `where of ${first.name}`);
      body.emit(`if (!(${w.code})) return 0;`);
    }
    recheck.binders = rest;
    bindingLoops(rest, sc, benv, body, fire);
    params = `v_${first.name}: number, `;
  } else {
    recheck.binders = t.binders;
    bindingLoops(t.binders, new Map(), benv, body, fire);
    params = "";
  }
  const end = body.slot(0);
  body.emit("return fired;");
  // A read made again runs only once a fact has moved a count, so it is no
  // part of what a run costs.
  const growth = techniqueGrowth(body.text());
  // Before the `_visit` line, which reads what to visit and no mark.
  // A technique run on placing is not run again by a fixpoint, so where it
  // passed a binding over it runs again on the cell.
  const rerun = onPlace
    ? `${fnName}(b, sp, ${readsClues.yes ? "cl, " : ""}v_${t.binders[0].name}, fire)`
    : null;
  if (rechecked(recheck, body, rerun, env))
    end.lines.push({ indent: 0, text: `if (_stale) return ${rerun} | fired;` });
  freshChecked(recheck, t.id, env);
  if (foot !== null) {
    if (visitAt.slot === null)
      throw new CompileError(`${t.id}: its visited binder was not met`);
    // A set whose groups are not kept hands none, and its technique visits
    // every element each run.
    const groups = (foot.sets ?? []).map(
      (name) => visitAt.groups.get(`v_${name}`) ?? "undefined",
    );
    const args = groups.length === 0 ? footName : `${footName}, [${groups.join(", ")}]`;
    visitAt.slot.lines.push({
      indent: 0,
      text: `const _visit = fire === null ? (b.visit?.(${args}) ?? null) : null;`,
    });
  }
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
  // A probe of the body's sorts may have called a function the body does
  // not.
  const called = body.text().join("\n");
  const maps = new Set(
    [...memos].flatMap(([name, m]) => (called.includes(`${name}(`) ? m : [])),
  );
  for (const m of maps)
    for (const s of [keep, ...refills])
      s.lines.push({ indent: 0, text: `${m}.clear();` });
  const clueParam = readsClues.yes ? "cl: Dealt, " : "";
  const text = [...scratch.map((d) => `  ${d}`), ...body.text()];
  // The generated code names nothing else `sp`, so a body that never says it
  // reads no geometry, and the parameter is marked unread.
  const spParam = text.some((l) => /\bsp\b/.test(l)) ? "sp" : "_sp";
  if (growth > MAX_GROWTH)
    throw new CompileError(
      `${t.id}: its dearest read grows with the board as ${power(growth)}, past ${power(MAX_GROWTH)}: bind a set once outside the loops that read it, or keep what it reads (docs/descriptions.md § "What a technique compiles to")`,
    );
  if (t.says !== null)
    checkStated(t.id, t.says, saysFields.variants, tenv.factSays?.sorts ?? null);
  // The game's hook supplies a technique's terms whichever arm held, so every
  // arm supplies the same.
  const suppliedFields = ((): { terms: string[]; marks: string[] } | null => {
    const [first] = saysFields.variants;
    if (first === undefined) return null;
    const key = JSON.stringify(first.supplied);
    if (saysFields.variants.some((v) => JSON.stringify(v.supplied) !== key))
      throw new CompileError(
        `${t.id}: its arms supply different terms or marks: declare what the game supplies on its says, for every arm`,
      );
    return first.supplied.terms.length + first.supplied.marks.length === 0
      ? null
      : first.supplied;
  })();
  const lines = [
    `export interface ${bindingType} {`,
    ...fields,
    "}",
    "",
    ...(t.says === null
      ? []
      : [
          ...(tenv.factSays === undefined
            ? []
            : [
                `/** What a square the firing decides has of its own, read where it is made. */`,
                `export interface ${saysType}Fact {`,
                ...(tenv.factSays.says.words.length > 1
                  ? [
                      "  /** The index of the wording that held (`STATED`). */",
                      "  wording: number;",
                    ]
                  : []),
                `  terms: { ${tenv.factSays.fields.terms.join(" ")} };`,
                `  marks: { ${tenv.factSays.fields.marks.join(" ")} };`,
                "}",
                "",
              ]),
          `/** What a step for a firing of it speaks of: its terms, and the elements it marks by role${saysFields.variants[0].name === null ? "" : "; the arm that holds says which way it reads"}${tenv.factSays === undefined ? "" : "; and `facts`, what each of its facts has of its own"}. */`,
          ...(saysFields.variants[0].name === null
            ? [
                `export interface ${saysType} {`,
                `  terms: { ${saysFields.variants[0].terms.join(" ")} };`,
                `  marks: { ${saysFields.variants[0].marks.join(" ")} };`,
                ...(saysFields.variants[0].worded
                  ? [
                      "  /** The index of the wording that held (`STATED`). */",
                      "  wording: number;",
                    ]
                  : []),
                ...(tenv.factSays === undefined ? [] : [`  facts: ${saysType}Fact[];`]),
                ...(t.says.witness ? ["  witness: Witness | null;"] : []),
                ...(t.says.reads ? ["  reads: Reads;"] : []),
                "}",
              ]
            : [
                `export type ${saysType} =`,
                ...saysFields.variants.map(
                  (v) =>
                    `  | { arm: ${JSON.stringify(v.name)}; terms: { ${v.terms.join(" ")} }; marks: { ${v.marks.join(" ")} }${v.worded ? "; wording: number" : ""}${tenv.factSays === undefined ? "" : `; facts: ${saysType}Fact[]`}${t.says?.witness ? "; witness: Witness | null" : ""}${t.says?.reads ? "; reads: Reads" : ""} }`,
                ),
                ";",
              ]),
          "",
          ...(suppliedFields === null
            ? []
            : [
                "/** What the game's hook for it supplies: the terms and marks it declares `supplied`. */",
                `export interface ${capitalized(fnName)}Supplied {`,
                ...(suppliedFields.terms.length === 0
                  ? []
                  : [`  terms: { ${suppliedFields.terms.join(" ")} };`]),
                ...(suppliedFields.marks.length === 0
                  ? []
                  : [`  marks: { ${suppliedFields.marks.join(" ")} };`]),
                "}",
                "",
              ]),
        ]),
    `const ${fnName}Facts: number[] = [];`,
    ...(tenv.factSays === undefined
      ? []
      : [`const ${fnName}FactSays: ${saysType}Fact[] = [];`]),
    ...(readsCands.yes ? [`let ${buffer} = new Int32Array(0);`] : []),
    ...held,
    ...(foot === null
      ? []
      : [
          "",
          "/** What a binding at one element of its first binder reads. */",
          `const ${footName}: Footprint = ${JSON.stringify(foot)};`,
        ]),
    "",
    `/** Its dearest read grows with the board as ${power(growth)}. */`,
    `export function ${fnName}(b: Marks, ${spParam}: GridSpace, ${clueParam}${params}fire: Fire<${bindingType}${t.says === null ? "" : `, ${saysType}`}> | null): number {`,
    ...text,
    "}",
  ];
  const named = (s: { sort: Sort }): string | null =>
    s.sort.k === "elem" ? s.sort.e : null;
  return {
    code: lines.join("\n"),
    clues: readsClues.yes,
    reads: {
      cells: sorts.filter((s) => named(s) === "cell").map((s) => s.name),
      clues: Object.fromEntries(
        sorts.flatMap((s) => {
          const e = named(s);
          return e?.startsWith("clue ") ? [[s.name, e.slice("clue ".length)]] : [];
        }),
      ),
    },
  };
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
