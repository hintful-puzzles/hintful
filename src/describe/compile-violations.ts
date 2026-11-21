/**
 * The violation check: where a board still being filled already breaks the
 * description's rules (`docs/descriptions.md` § "Where a rule breaks").
 *
 * Each statement is read three-valued: true or false of every completion of
 * the board, or undecided. A term the check does not bound itself is
 * evaluated as the answer check would, its reads of undecided elements
 * stopping it (`describe-runtime/violations.ts`), so its verdict is exact
 * where it reads only decided ones. Over that, the check bounds what a
 * partial board does say: the connectives and quantifiers by Kleene's
 * logic, a count or a sum by the interval its undecided members leave, a
 * term one undecided element stops by each value that element may hold, and
 * `matched` by Hall's condition on each group. A statement's leading
 * `forall`s and conjunctions say where it breaks: each binding whose body
 * is false is one violation, at the elements it binds.
 */

import { bindingLoops, compileExpr } from "./compile-expr.ts";
import {
  type ClueKind,
  CompileError,
  type Env,
  expect,
  Out,
  once,
  type Scope,
  type Val,
} from "./compile-sorts.ts";
import { inlined, substitute } from "./compile-terms.ts";
import type { Binder, Expr } from "./expr.ts";

/** A verdict's code: `0` false, `1` true, `2` undecided. */
const F = 0;
const T = 1;
const U = 2;

/** A numeric term's bounds on every completion, as the names holding them,
 * and, for a count, the names of the arrays of the answer's elements it
 * counted surely (`yes`) and surely not (`no`). */
interface Bounds {
  lo: string;
  hi: string;
  yes: string | null;
  no: string | null;
}

/** The arrays a check reads through: what a read recorded (`_rd`), and the
 * elements a deciding term named (`_wit`). */
const READ = "_rd";
const WITNESS = "_wit";
/** The guard of a binding no filter has made undecided: a `number`, so the
 * code may compare it with either verdict. */
const SURE = "_sure";

export interface Statement {
  /** The violation's `rule`. */
  name: string;
  expr: Expr;
  /** The variation that adds it, or `null`. */
  on: string | null;
}

/**
 * The function `violations(g, sp, cl?, variations?)`: each statement of the
 * shape, the rules and the dealt clues' meanings that the board `g`, a value
 * an element and 0 where it is undecided, already breaks.
 */
export function violationCheck(
  statements: readonly Statement[],
  clueMeanings: readonly {
    kind: string;
    means: Expr;
    sorts: ClueKind;
    readsV: boolean;
  }[],
  domain: { mask: string; lines: string[] } | null,
  measured: (e: Expr) => Expr,
  repeat: Repeat,
  env: Env,
): string[] {
  const readsClues = { yes: false };
  const scratch: string[] = [];
  const cenv: Env = {
    ...env,
    answer: { repeats: env.answer?.repeats ?? false, partial: true },
    readsClues,
    scratch,
    memo: false,
    hoist: null,
    boardRoot: null,
    epoch: null,
    concluding: false,
  };
  cenv.used.add("heldIn");
  cenv.used.add("undecided");
  const out = new Out(1);
  out.emit("const _out: Violation[] = [];");
  out.emit(`const ${READ}: number[] = [];`);
  out.emit(`let ${WITNESS}: readonly number[] | null = null;`);
  out.emit(`const ${SURE}: number = ${T};`);
  const set = cenv.answerSort === "edge" ? "sp.edges" : "sp.cells";
  if (domain !== null) {
    if (domain.mask === "domainOf") readsClues.yes = true;
    out.entries.push(...domain.lines.map((text) => ({ indent: 1, text })));
    out.open(`for (const x of ${set}) {`);
    out.emit("const held = g[x];");
    const has =
      domain.mask === "domainOf"
        ? env.wide
          ? "domainOf(sp, cl, x, held)"
          : "(domainOf(sp, cl, x) >> held) & 1"
        : `(${domain.mask} >> held) & 1`;
    out.emit(
      `if (held > 0 && !(${has})) _out.push({ rule: "domain", clue: -1, at: [x] });`,
    );
    out.close();
  }
  // A rule may read the domain by name (Group's associativity).
  const base: Scope = new Map(
    domain?.mask === "_domain"
      ? [["domain", { code: "_domain", sort: { k: "set", of: { k: "num" } } }]]
      : [],
  );
  const c = new Check(
    cenv,
    out,
    measured,
    repeat === null
      ? null
      : { value: measured(repeat.value), times: measured(repeat.times) },
    domain === null || (domain.mask === "domainOf" && env.wide)
      ? null
      : domain.mask === "domainOf"
        ? (x) => {
            readsClues.yes = true;
            return `domainOf(sp, cl, ${x})`;
          }
        : () => domain.mask,
  );
  for (const s of statements) {
    if (s.on !== null) out.open(`if (variations.includes(${JSON.stringify(s.on)})) {`);
    c.statement(s.name, "-1", s.expr, base);
    if (s.on !== null) out.close();
  }
  for (const m of clueMeanings) {
    readsClues.yes = true;
    const k = Out.fresh("_k");
    const own: [string, Val][] = [];
    out.open(
      `for (let ${k} = 0; ${k} < cl.${m.kind}.${m.sorts.fields ? "n" : "at.length"}; ${k}++) {`,
    );
    if (m.sorts.fields)
      own.push(["k", { code: k, sort: { k: "elem", e: `clue ${m.kind}` } }]);
    else {
      const at = Out.fresh("_at");
      const v = Out.fresh("_v");
      if (m.sorts.per) {
        const per = Out.fresh("_per");
        cenv.used.add("perElement");
        cenv.used.add("perValue");
        out.emit(`const ${at} = perElement(cl.${m.kind}.at[${k}]);`);
        out.emit(`const ${per} = perValue(cl.${m.kind}.at[${k}]);`);
        out.emit(`const ${v} = cl.${m.kind}.v[${k}];`);
        own.push(["per", { code: per, sort: { k: "num" } }]);
      } else {
        out.emit(`const ${at} = cl.${m.kind}.at[${k}];`);
        if (m.readsV)
          out.emit(`const ${v} = cl.${m.kind}.${m.sorts.list ? "lists" : "v"}[${k}];`);
      }
      own.push(
        ["at", { code: at, sort: m.sorts.at }],
        ["v", { code: v, sort: m.sorts.v }],
      );
    }
    c.statement(`clue.${m.kind}`, k, m.means, new Map([...base, ...own]));
    out.close();
  }
  // A check no statement of which reads a witness keeps none, and a count
  // over no element of the answer names none.
  const all = out.entries.map((l) => ("text" in l ? l.text : "")).join("\n");
  const unread = (name: string): boolean =>
    (all.match(new RegExp(`\\b${name}\\b`, "g")) ?? []).length === 1;
  const kept = out.entries.filter((l) => {
    if (!("text" in l)) return true;
    if (!c.readsWitness && l.text.includes(WITNESS)) return false;
    const decl = /^const (_yes\d+|_no\d+): number\[\] = \[\];$/.exec(l.text);
    return decl === null || !unread(decl[1]);
  });
  out.entries.splice(0, out.entries.length, ...kept);
  if (!all.includes(SURE, all.indexOf(SURE) + SURE.length))
    out.entries.splice(
      out.entries.findIndex((l) => "text" in l && l.text.startsWith(`const ${SURE}`)),
      1,
    );
  out.emit("return _out;");
  if (c.triesValues)
    out.entries.unshift({ indent: 1, text: "const g = Int32Array.from(g0);" });
  const params = [
    c.triesValues ? "g0: ArrayLike<number>" : "g: ArrayLike<number>",
    "sp: GridSpace",
    ...(readsClues.yes ? ["cl: Dealt"] : []),
    ...(statements.some((s) => s.on !== null) ? ["variations: readonly string[]"] : []),
  ];
  return [
    "/** Each statement the board `g`, a value an element and 0 where it is",
    " * undecided, already breaks: false on every completion of it. */",
    `export function violations(${params.join(", ")}): Violation[] {`,
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    "}",
  ];
}

class Check {
  private readonly env: Env;
  private readonly out: Out;
  private readonly measured: (e: Expr) => Expr;
  private readonly repeat: Repeat;
  /** Whether a violation's place is read from the witness, so the code
   * keeps one. */
  readsWitness = false;
  /** Whether a term is read over an undecided element's values, which the
   * code writes into its own copy of the board. */
  triesValues = false;
  /** The code of the mask of values element `x` may hold, where the check
   * can read one. */
  private readonly domainOf: ((x: string) => string) | null;
  constructor(
    env: Env,
    out: Out,
    measured: (e: Expr) => Expr,
    repeat: Repeat,
    domainOf: ((x: string) => string) | null,
  ) {
    this.env = env;
    this.out = out;
    this.measured = measured;
    this.repeat = repeat;
    this.domainOf = domainOf;
  }

  /** Each violation of `e`, a statement named `rule` (of clue `clue`, or
   * `-1`), at the bindings of its leading `forall`s and conjunctions. */
  statement(rule: string, clue: string, e: Expr, scope: Scope): void {
    this.where(rule, clue, this.measured(e), scope, [], SURE);
  }

  private where(
    rule: string,
    clue: string,
    e0: Expr,
    scope: Scope,
    bound: readonly string[],
    guard: string,
  ): void {
    const e = desugared(inlined(e0, scope, this.env), scope, this.repeat);
    const { out } = this;
    if (e.k === "bin" && e.op === "and") {
      this.where(rule, clue, e.a, scope, bound, guard);
      this.where(rule, clue, e.b, scope, bound, guard);
      return;
    }
    if (e.k === "bin" && e.op === "implies") {
      const a = this.verdict(e.a, scope);
      out.open(`if (${a} === ${T}) {`);
      this.where(rule, clue, e.b, scope, bound, guard);
      out.close();
      return;
    }
    if (e.k === "quant" && e.q === "forall") {
      // A binding a filter leaves undecided breaks nothing yet, so the
      // statement reads no further into it: Signpost's squares a given
      // number's links have not reached.
      this.stopped(() =>
        this.binders(
          e.binders,
          scope,
          guard,
          (sc, g, names) => this.where(rule, clue, e.body, sc, [...bound, ...names], g),
          [],
          true,
        ),
      );
      return;
    }
    out.emit(`${READ}.length = 0;`);
    out.emit(`${WITNESS} = null;`);
    const v = this.verdict(e, scope);
    // Under a binding whose filter is undecided, a false body breaks
    // nothing yet: the binding may not be one.
    out.open(`if (${v} === ${F} && ${guard} === ${T}) {`);
    if (bound.length === 0) this.readsWitness = true;
    const at =
      bound.length > 0 ? `[${bound.join(", ")}]` : `(${WITNESS} ?? ${READ}).slice()`;
    out.emit(`_out.push({ rule: ${JSON.stringify(rule)}, clue: ${clue}, at: ${at} });`);
    out.close();
  }

  /** Run `body` inside a block whose undecided reads, where nothing inside
   * catches them, leave the statement undecided. */
  private stopped(body: () => void): void {
    this.stoppedOr(body, []);
  }

  /**
   * Loops over `binders`, their filters read as verdicts: a binding a
   * filter is false of is skipped, and one it is undecided of goes on with
   * `guard` undecided. `body` gets the scope, the guard, and the names of
   * the bound elements that hold the answer's values. Where `sureOnly`, a
   * binding not surely one is skipped instead.
   */
  private binders(
    binders: readonly Binder[],
    scope: Scope,
    guard: string,
    body: (sc: Scope, guard: string, names: string[]) => void,
    names: string[] = [],
    sureOnly = false,
  ): void {
    if (binders.length === 0) {
      body(scope, guard, names);
      return;
    }
    const [first, ...rest] = binders;
    const { out, env } = this;
    const enter = (w: string) => (sureOnly ? `${w} === ${T}` : `${w} !== ${F}`);
    const inner = (sc: Scope, g: string, own: string[]) =>
      this.binders(rest, sc, g, body, own, sureOnly);
    const run =
      first.kind === "in" ? stretchOf({ k: "size", of: first.of }, scope, env) : null;
    const sides = run === null ? null : this.sureAndMaybe(run[2], scope);
    if (run !== null && sides !== null) {
      // A stretch of a set still being filled ranges over the run its
      // possible members make, surely over the run its sure ones do: Sticks'
      // line beside an open numbered square can no longer take that square.
      const [must, may, whole] = sides;
      env.used.add("stretch");
      env.used.add("decidedIf");
      const L = compileExpr(run[0], scope, env, out).code;
      const c = once(compileExpr(run[1], scope, env, out), out);
      const sure = Out.fresh("_rs");
      const v = Out.fresh(`v_${first.name}`);
      out.emit(`decidedIf(${whole});`);
      out.emit(`const ${sure} = stretch(sp.lineCells[${L}], ${c.code}, ${must});`);
      out.open(`for (const ${v} of stretch(sp.lineCells[${L}], ${c.code}, ${may})) {`);
      const sc = new Map(scope).set(first.name, { code: v, sort: c.sort });
      const own =
        c.sort.k === "elem" && c.sort.e === env.answerSort ? [...names, v] : names;
      const g = Out.fresh("_gd");
      out.emit(`const ${g}: number = ${sure}.includes(${v}) ? ${guard} : ${U};`);
      if (sureOnly) out.emit(`if (${g} !== ${T}) continue;`);
      if (first.where === null) inner(sc, g, own);
      else {
        const w = this.verdict(first.where, sc);
        out.open(`if (${enter(w)}) {`);
        const g2 = Out.fresh("_gd");
        out.emit(`const ${g2}: number = ${w} === ${T} ? ${g} : ${U};`);
        inner(sc, g2, own);
        out.close();
      }
      out.close();
      return;
    }
    bindingLoops([{ ...first, where: null }], scope, env, out, (sc) => {
      const v = sc.get(first.name);
      const own =
        v !== undefined && v.sort.k === "elem" && v.sort.e === env.answerSort
          ? [...names, v.code]
          : names;
      if (first.where === null) {
        inner(sc, guard, own);
        return;
      }
      const w = this.verdict(first.where, sc);
      out.open(`if (${enter(w)}) {`);
      const g = Out.fresh("_gd");
      out.emit(`const ${g}: number = ${w} === ${T} ? ${guard} : ${U};`);
      inner(sc, g, own);
      out.close();
    });
  }

  /** The name of a verdict on `e`, a truth, written into the code. */
  verdict(e0: Expr, scope: Scope): string {
    const e = desugared(inlined(e0, scope, this.env), scope, this.repeat);
    const { out } = this;
    const r = Out.fresh("_vd");
    if (e.k === "not") {
      const a = this.verdict(e.of, scope);
      out.emit(`const ${r}: number = ${a} === ${U} ? ${U} : ${T} - ${a};`);
      return r;
    }
    if (e.k === "bin" && (e.op === "and" || e.op === "or" || e.op === "implies")) {
      // `a implies b` is `not a or b`, read with `a` first as written.
      const and = e.op === "and";
      const stop = and ? F : T;
      const a0 = this.verdict(e.a, scope);
      const a = e.op === "implies" ? this.negated(a0) : a0;
      out.emit(`let ${r}: number = ${a};`);
      out.open(`if (${r} !== ${stop}) {`);
      const b = this.verdict(e.b, scope);
      out.emit(
        `${r} = ${b} === ${stop} ? ${stop} : ${r} === ${U} || ${b} === ${U} ? ${U} : ${and ? T : F};`,
      );
      out.close();
      return r;
    }
    if (e.k === "bin" && e.op === "iff") {
      const a = this.verdict(e.a, scope);
      const b = this.verdict(e.b, scope);
      out.emit(
        `const ${r}: number = ${a} === ${U} || ${b} === ${U} ? ${U} : ${a} === ${b} ? ${T} : ${F};`,
      );
      return r;
    }
    if (
      e.k === "bin" &&
      COMPARE.has(e.op) &&
      (counted(e.a, scope, this.env) || counted(e.b, scope, this.env))
    ) {
      const a = this.bounds(e.a, scope);
      const b = this.bounds(e.b, scope);
      out.emit(`let ${r}: number = ${U};`);
      // Each comparison decided by the bounds: false where they keep the
      // two sides apart, and then the side over or under names where.
      const lt = (x: Bounds, y: Bounds) => `${x.hi} < ${y.lo}`;
      const gt = (x: Bounds, y: Bounds) => `${x.lo} > ${y.hi}`;
      const point = `${a.lo} === ${a.hi} && ${b.lo} === ${b.hi}`;
      const [falseIf, trueIf] = ((): [[string, Bounds | null, boolean][], string] => {
        switch (e.op) {
          case "=":
            return [
              [
                [gt(a, b), a, true],
                [lt(a, b), a, false],
              ],
              `${point} && ${a.lo} === ${b.lo}`,
            ];
          case "!=":
            return [
              [[`${point} && ${a.lo} === ${b.lo}`, null, true]],
              `${gt(a, b)} || ${lt(a, b)}`,
            ];
          case "<":
            return [[[`${a.lo} >= ${b.hi}`, a, true]], lt(a, b)];
          case "<=":
            return [[[gt(a, b), a, true]], `${a.hi} <= ${b.lo}`];
          case ">":
            return [[[`${a.hi} <= ${b.lo}`, a, false]], gt(a, b)];
          default:
            return [[[lt(a, b), a, false]], `${a.lo} >= ${b.hi}`];
        }
      })();
      for (const [cond, side, over] of falseIf) {
        out.open(`if (${cond}) {`);
        out.emit(`${r} = ${F};`);
        const w = side === null ? null : over ? side.yes : side.no;
        if (w !== null) out.emit(`${WITNESS} = ${w};`);
        out.close();
      }
      out.emit(`if (${trueIf}) ${r} = ${T};`);
      return r;
    }
    if (e.k === "quant") {
      const forall = e.q === "forall";
      out.emit(`let ${r}: number = ${forall ? T : F};`);
      const label = Out.fresh("V");
      out.open(`${label}: {`);
      this.stoppedOr(
        () =>
          this.binders(e.binders, scope, SURE, (sc, g) => {
            const b = this.verdict(e.body, sc);
            const decided = forall ? F : T;
            out.open(`if (${b} === ${decided} && ${g} === ${T}) {`);
            out.emit(`${r} = ${decided};`);
            out.emit(`break ${label};`);
            out.close();
            out.emit(
              `if (${b} === ${U} || (${g} === ${U} && ${b} === ${decided})) ${r} = ${U};`,
            );
          }),
        // A binder's set undecided leaves the whole undecided: a binding
        // that decided it has broken out of the block first.
        [`${r} = ${U};`],
      );
      out.close();
      return r;
    }
    const held = e.k === "bin" && (e.op === "=" || e.op === "!=") ? heldIs(e) : null;
    if (held !== null && this.domainOf !== null) {
      // `value(x) = k` of an undecided x is false where x's domain has no k:
      // a square that is no tree is never one.
      const { out: o, env } = this;
      o.emit(`let ${r}: number = ${U};`);
      o.open("try {");
      const x = compileExpr(held.x, scope, env, o);
      const xs = once(x, o).code;
      const k = once(compileExpr(held.k, scope, env, o), o).code;
      const mask = this.domainOf(xs);
      const yes = e.k === "bin" && e.op === "=" ? T : F;
      o.open(`if (${xs} < 0 || g[${xs}] > 0) {`);
      o.emit(`if (${xs} >= 0) ${READ}.push(${xs});`);
      o.emit(`${r} = (${xs} < 0 ? -1 : g[${xs}]) === ${k} ? ${yes} : ${T - yes};`);
      o.close(`} else if (!(${k} > 0 && ${k} < 32 && (${mask} >> ${k}) & 1)) {`);
      o.emit(`  ${r} = ${T - yes};`);
      o.emit("}");
      o.close("} catch (e) {");
      o.emit("  undecided(e);");
      o.emit("}");
      return r;
    }
    if (e.k === "call" && e.fn === "matched") {
      const sides = e.args.map((a) => this.sureAndMaybe(a, scope));
      if (sides.length === 2 && sides[0] !== null && sides[1] !== null) {
        const [A, B] = sides as [[string, string, string], [string, string, string]];
        this.env.used.add("unmatched");
        this.env.used.add("matched");
        const w = Out.fresh("_um");
        // Where either set's members were not all read, nothing is decided.
        out.emit(
          `const ${w} = ${A[2]} && ${B[2]} ? unmatched(sp, ${A[0]}, ${A[1]}, ${B[0]}, ${B[1]}) : null;`,
        );
        out.emit(`let ${r}: number = ${U};`);
        out.open(`if (${w} === null) {`);
        out.close(`} else if (${w}.length > 0) {`);
        out.emit(`${r} = ${F};`);
        out.emit(`${WITNESS} = ${w};`);
        out.close(
          `} else if (${A[0]}.length === ${A[1]}.length && ${B[0]}.length === ${B[1]}.length) {`,
        );
        out.emit(`${r} = matched(sp, ${A[0]}, ${B[0]}) ? ${T} : ${F};`);
        out.emit(`if (${r} === ${F}) ${WITNESS} = [...${A[0]}, ...${B[0]}];`);
        out.emit("}");
        return r;
      }
    }
    return this.leaf(e, scope, r);
  }

  private negated(v: string): string {
    const r = Out.fresh("_vd");
    this.out.emit(`const ${r}: number = ${v} === ${U} ? ${U} : ${T} - ${v};`);
    return r;
  }

  /** A truth evaluated as the answer check does, undecided where it read an
   * undecided element. */
  private leaf(e: Expr, scope: Scope, r: string): string {
    const { out, env } = this;
    out.emit(`let ${r}: number = ${U};`);
    if (this.domainOf === null) {
      out.open("try {");
      const v = compileExpr(e, scope, env, out);
      expect(v, "bool", "a rule");
      out.emit(`${r} = ${v.code} ? ${T} : ${F};`);
      out.close("} catch (e) {");
      out.emit("  undecided(e);");
      out.emit("}");
      return r;
    }
    // Stopped by one undecided element, the term is read over each value
    // that element may hold: a digit no digit across a Mathrax clue pairs
    // with breaks it while the square across is open.
    const f = Out.fresh("_lf");
    out.open(`const ${f} = (): boolean => {`);
    const v = compileExpr(e, scope, env, out);
    expect(v, "bool", "a rule");
    out.emit(`return ${v.code};`);
    out.close("};");
    const x = Out.fresh("_x");
    env.used.add("stoppedAt");
    env.used.add("overDomain");
    this.triesValues = true;
    out.open("try {");
    out.emit(`${r} = ${f}() ? ${T} : ${F};`);
    out.close("} catch (e) {");
    out.emit("  undecided(e);");
    out.emit(`  const ${x} = stoppedAt();`);
    out.emit(
      `  if (${x} >= 0) ${r} = overDomain(g, ${x}, ${this.domainOf(x)}, ${READ}, ${f});`,
    );
    out.emit("}");
    return r;
  }

  /** The bounds on a numeric term over every completion. */
  private bounds(e0: Expr, scope: Scope): Bounds {
    const e = inlined(e0, scope, this.env);
    const { out } = this;
    const lo = Out.fresh("_lo");
    const hi = Out.fresh("_hi");
    const aCounted = e.k === "bin" && counted(e.a, scope, this.env);
    if (
      e.k === "bin" &&
      (e.op === "+" || e.op === "-" || e.op === "*") &&
      (aCounted || counted(e.b, scope, this.env))
    ) {
      const a = this.bounds(e.a, scope);
      const b = this.bounds(e.b, scope);
      if (e.op === "+") {
        out.emit(`const ${lo} = ${a.lo} + ${b.lo};`);
        out.emit(`const ${hi} = ${a.hi} + ${b.hi};`);
      } else if (e.op === "-") {
        out.emit(`const ${lo} = ${a.lo} - ${b.hi};`);
        out.emit(`const ${hi} = ${a.hi} - ${b.lo};`);
      } else {
        const ps = Out.fresh("_ps");
        out.emit(
          `const ${ps} = [${a.lo} * ${b.lo}, ${a.lo} * ${b.hi}, ${a.hi} * ${b.lo}, ${a.hi} * ${b.hi}].map((p) => (Number.isNaN(p) ? 0 : p));`,
        );
        out.emit(`const ${lo} = Math.min(...${ps});`);
        out.emit(`const ${hi} = Math.max(...${ps});`);
      }
      // A scaled count still names where it is over or under.
      const one =
        e.op === "*" ? (aCounted ? a : b) : e.op === "-" ? a : aCounted ? a : b;
      return { lo, hi, yes: one.yes, no: one.no };
    }
    const agg = lastFilterOut(sizeAsCount(e));
    if (agg !== null && (agg.fn === "count" || agg.fn === "sum")) {
      const yes = Out.fresh("_yes");
      const no = Out.fresh("_no");
      out.emit(`let ${lo} = 0;`);
      out.emit(`let ${hi} = 0;`);
      out.emit(`const ${yes}: number[] = [];`);
      out.emit(`const ${no}: number[] = [];`);
      let named = false;
      this.stoppedOr(
        () =>
          this.binders(agg.binders, scope, SURE, (sc, g, names) => {
            const p = agg.where === null ? null : this.verdict(agg.where, sc);
            const sure = p === null ? g : Out.fresh("_s");
            if (p !== null)
              out.emit(
                `const ${sure}: number = ${g} === ${T} && ${p} === ${T} ? ${T} : ${g} === ${F} || ${p} === ${F} ? ${F} : ${U};`,
              );
            const el = names.at(-1);
            if (agg.fn === "count") {
              out.emit(`if (${sure} === ${T}) ${lo}++;`);
              out.emit(`if (${sure} !== ${F}) ${hi}++;`);
            } else {
              if (agg.term === null) throw new CompileError("sum with no term");
              const t = this.bounds(agg.term, sc);
              out.open(`if (${sure} === ${T}) {`);
              out.emit(`${lo} += ${t.lo};`);
              out.emit(`${hi} += ${t.hi};`);
              out.close(`} else if (${sure} === ${U}) {`);
              out.emit(`${lo} += Math.min(0, ${t.lo});`);
              out.emit(`${hi} += Math.max(0, ${t.hi});`);
              out.emit("}");
            }
            if (el !== undefined) {
              named = true;
              out.emit(`if (${sure} === ${T}) ${yes}.push(${el});`);
              out.emit(`else if (${sure} === ${F}) ${no}.push(${el});`);
            }
          }),
        // A set it counts over that is itself undecided bounds nothing.
        [`${lo} = -Infinity;`, `${hi} = Infinity;`],
      );
      // A count over no element of the answer names none, and where it
      // breaks is what it read (a Dominosa square's barred sides).
      return named ? { lo, hi, yes, no } : { lo, hi, yes: null, no: null };
    }
    const run = stretchOf(e, scope, this.env);
    const sides = run === null ? null : this.sureAndMaybe(run[2], scope);
    if (run !== null && sides !== null) {
      // A stretch only grows as its set does: Bricks' run of three is three
      // once three bricks sit in a row, whatever squares are still open.
      const [must, may, whole] = sides;
      const L = compileExpr(run[0], scope, this.env, out).code;
      const c = compileExpr(run[1], scope, this.env, out).code;
      this.env.used.add("stretch");
      out.emit(`const ${lo} = stretch(sp.lineCells[${L}], ${c}, ${must}).length;`);
      out.emit(
        `const ${hi} = ${whole} ? stretch(sp.lineCells[${L}], ${c}, ${may}).length : Infinity;`,
      );
      return { lo, hi, yes: null, no: null };
    }
    out.emit(`let ${lo} = -Infinity;`);
    out.emit(`let ${hi} = Infinity;`);
    out.open("try {");
    if (
      e.k === "call" &&
      e.fn === "value" &&
      e.args.length === 1 &&
      this.domainOf !== null
    ) {
      // An undecided element's value lies within its domain: a Keen cage's
      // empty square adds at least 1 to its sum.
      const xs = once(compileExpr(e.args[0], scope, this.env, out), out).code;
      const mask = Out.fresh("_dm");
      out.open(`if (${xs} < 0 || g[${xs}] > 0) {`);
      out.emit(`if (${xs} >= 0) ${READ}.push(${xs});`);
      out.emit(`${lo} = ${hi} = ${xs} < 0 ? -1 : g[${xs}];`);
      out.close("} else {");
      out.emit(`  const ${mask} = ${this.domainOf(xs)};`);
      out.emit(
        `  if (${mask} !== 0) { ${lo} = 31 - Math.clz32(${mask} & -${mask}); ${hi} = 31 - Math.clz32(${mask}); }`,
      );
      out.emit("}");
      out.close("} catch (e) {");
      out.emit("  undecided(e);");
      out.emit("}");
      return { lo, hi, yes: null, no: null };
    }
    const v = compileExpr(e, scope, this.env, out);
    expect(v, "num", "a bound");
    out.emit(`${lo} = ${hi} = ${v.code};`);
    out.close("} catch (e) {");
    out.emit("  undecided(e);");
    out.emit("}");
    return { lo, hi, yes: null, no: null };
  }

  private stoppedOr(body: () => void, onStop: readonly string[]): void {
    const { out } = this;
    out.open("try {");
    body();
    out.close("} catch (e) {");
    out.emit("  undecided(e);");
    for (const s of onStop) out.emit(`  ${s}`);
    out.emit("}");
  }

  /** A set `{x in S where P}` of the answer's elements as two arrays, those
   * surely in it and those that may be, and whether the second is whole,
   * which it is not where reading the set's members stopped; `null` for any
   * other term. */
  private sureAndMaybe(e0: Expr, scope: Scope): [string, string, string] | null {
    const e = inlined(e0, scope, this.env);
    if (
      e.k !== "agg" ||
      e.fn !== "set" ||
      e.binders.length !== 1 ||
      e.term?.k !== "name" ||
      e.term.name !== e.binders[0].name
    )
      return null;
    const { out } = this;
    const must = Out.fresh("_must");
    const may = Out.fresh("_may");
    out.emit(`const ${must}: number[] = [];`);
    out.emit(`const ${may}: number[] = [];`);
    const ok = Out.fresh("_ok");
    out.emit(`let ${ok} = true;`);
    this.stoppedOr(
      () =>
        this.binders(e.binders, scope, SURE, (sc, g) => {
          const x = sc.get(e.binders[0].name) as Val;
          const p = e.where === null ? g : this.verdict(e.where, sc);
          out.emit(`if (${p} === ${T} && ${g} === ${T}) ${must}.push(${x.code});`);
          out.emit(`if (${p} !== ${F}) ${may}.push(${x.code});`);
        }),
      [`${ok} = false;`],
    );
    // A set whose members are themselves undecided says nothing.
    out.emit(`if (!${ok}) ${must}.length = 0;`);
    return [must, may, ok];
  }
}

/** The answer's value that may repeat in a unit, and how often. */
type Repeat = { value: Expr; times: Expr } | null;

const COMPARE: ReadonlySet<string> = new Set(["=", "!=", "<", "<=", ">", ">="]);

/** `value(x) = k` (or `k = value(x)`) as its element and its value, where
 * `k` reads no value of the answer; `null` for any other comparison. */
function heldIs(e: Extract<Expr, { k: "bin" }>): { x: Expr; k: Expr } | null {
  const of = (a: Expr, b: Expr) =>
    a.k === "call" && a.fn === "value" && a.args.length === 1 && !readsHeld(b)
      ? { x: a.args[0], k: b }
      : null;
  return of(e.a, e.b) ?? of(e.b, e.a);
}

/** Whether `e` may read a value of the answer: a call of anything but the
 * space's own functions of elements is taken to. */
function readsHeld(e: Expr): boolean {
  switch (e.k) {
    case "num":
    case "name":
      return false;
    case "call":
      return !PURE.has(e.fn) || e.args.some(readsHeld);
    case "bin":
      return readsHeld(e.a) || readsHeld(e.b);
    case "not":
    case "neg":
    case "size":
      return readsHeld(e.of);
    default:
      return true;
  }
}

/** Functions that read the board's shape and clues, never the answer. */
const PURE: ReadonlySet<string> = new Set([
  "clue",
  "abs",
  "x",
  "y",
  "cell",
  "edge",
  "at",
  "w",
  "h",
  "row",
  "col",
  "cells",
  "adj4",
  "adj8",
  "peers",
  "end1",
  "end2",
  "ends",
  "other",
]);

/** Whether `e` is a count or sum, or arithmetic over one: a term the check
 * bounds rather than evaluates. */
function counted(e0: Expr, scope: Scope, env: Env): boolean {
  // A count may be written through a definition, as Light Up's `bulbs(k)`.
  const e = inlined(e0, scope, env);
  const a = sizeAsCount(e);
  if (a !== null) return a.fn === "count" || a.fn === "sum";
  if (stretchOf(e, scope, env) !== null) return true;
  return (
    e.k === "bin" &&
    (e.op === "+" || e.op === "-" || e.op === "*") &&
    (counted(e.a, scope, env) || counted(e.b, scope, env))
  );
}

/** `|stretch(L, c, S)|`'s three arguments, where its line and cell read no
 * value of the answer; `null` for any other term. */
function stretchOf(
  e: Expr,
  scope: Scope,
  env: Env,
): readonly [Expr, Expr, Expr] | null {
  if (e.k !== "size") return null;
  const of = inlined(e.of, scope, env);
  if (of.k !== "call" || of.fn !== "stretch" || of.args.length !== 3) return null;
  const [L, c, S] = of.args;
  return readsHeld(L) || readsHeld(c) ? null : [L, c, S];
}

/** `|{x in S where P}|` as `count(x in S where P)`; an aggregate as it is. */
function sizeAsCount(e: Expr): Extract<Expr, { k: "agg" }> | null {
  if (e.k === "agg") return e;
  if (
    e.k === "size" &&
    e.of.k === "agg" &&
    e.of.fn === "set" &&
    e.of.binders.length === 1 &&
    e.of.term?.k === "name" &&
    e.of.term.name === e.of.binders[0].name
  )
    return {
      k: "agg",
      fn: "count",
      binders: e.of.binders,
      where: e.of.where,
      term: null,
    };
  return null;
}

/** An aggregate with its last binder's filter as its own `where`, the same
 * aggregate: a member the filter is false of is then one counted surely
 * not, which names where a count falls short, rather than skipped. */
function lastFilterOut(
  agg: Extract<Expr, { k: "agg" }> | null,
): Extract<Expr, { k: "agg" }> | null {
  const last = agg?.binders.at(-1);
  if (agg === null || last === undefined || last.where === null) return agg;
  return {
    ...agg,
    binders: [...agg.binders.slice(0, -1), { ...last, where: null }],
    where:
      agg.where === null
        ? last.where
        : { k: "bin", op: "and", a: last.where, b: agg.where },
  };
}

/**
 * `e` restated where a form says more where it is written out: `latin(f, U)`
 * as no two cells of a unit holding the same value, and `distinct(t over x
 * in S)` as no two members' terms equal, so each pair that repeats is its
 * own violation. A latin square that allows a value more than once (`times`)
 * is left whole.
 */
function desugared(e: Expr, scope: Scope, repeat: Repeat): Expr {
  if (e.k === "call" && e.fn === "latin" && e.args.length === 2) {
    const [f, units] = e.args;
    if (f.k !== "name") return e;
    const u = fresh("u", scope);
    const c = fresh("c", scope);
    const cells: Expr = { k: "call", fn: "cells", args: [nm(u)] };
    const term: Expr = { k: "call", fn: f.name, args: [nm(c)] };
    const once: Expr = {
      k: "agg",
      fn: "distinct",
      binders: [
        {
          name: c,
          kind: "in",
          of: cells,
          // The value that repeats is counted apart.
          where:
            repeat === null ? null : { k: "bin", op: "!=", a: term, b: repeat.value },
        },
      ],
      where: null,
      term,
    };
    const body: Expr =
      repeat === null
        ? once
        : {
            k: "bin",
            op: "and",
            a: once,
            b: {
              k: "bin",
              op: "<=",
              a: {
                k: "agg",
                fn: "count",
                binders: [{ name: c, kind: "in", of: cells, where: null }],
                where: { k: "bin", op: "=", a: term, b: repeat.value },
                term: null,
              },
              b: repeat.times,
            },
          };
    return {
      k: "quant",
      q: "forall",
      binders: [{ name: u, kind: "in", of: units, where: null }],
      body,
    };
  }
  if (
    e.k === "agg" &&
    e.fn === "distinct" &&
    e.binders.length === 1 &&
    e.binders[0].kind === "in" &&
    e.term !== null
  ) {
    const [b] = e.binders;
    const other = fresh(`${b.name}_`, scope);
    const of = b.of;
    return {
      k: "quant",
      q: "forall",
      binders: [
        b,
        {
          name: other,
          kind: "in",
          of: { k: "call", fn: "before", args: [nm(b.name), of] },
          where:
            b.where === null
              ? null
              : substitute(b.where, new Map([[b.name, nm(other)]]), new Set()),
        },
      ],
      body: {
        k: "bin",
        op: "!=",
        a: e.term,
        b: substitute(e.term, new Map([[b.name, nm(other)]]), new Set()),
      },
    };
  }
  return e;
}

const nm = (name: string): Expr => ({ k: "name", name });

function fresh(prefix: string, scope: Scope): string {
  let n = 0;
  while (scope.has(`${prefix}${n}`)) n++;
  return `${prefix}${n}`;
}
