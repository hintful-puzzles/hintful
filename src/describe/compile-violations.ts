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
  elem,
  expect,
  expectElem,
  Out,
  once,
  type Scope,
  type Val,
} from "./compile-sorts.ts";
import {
  cycleOf,
  freeNames,
  inlined,
  joinOf,
  pointCycleOf,
  substitute,
} from "./compile-terms.ts";
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

/**
 * A mark the player sets that says something of the answer through one
 * definition at its element (Tracks' square marked track: `2 - drawn(at) /
 * 2`). The check bounds that definition by the values the mark allows.
 */
export interface MarkRead {
  /** The definition the mark's term reads. */
  def: string;
  /** What the mark sits on. */
  sort: "cell" | "edge";
  /** The mark's term, `at` its element. */
  of: Expr;
  /** The same with the definition's call read as the name `_d`. */
  ofDef: Expr;
}

export interface Statement {
  /** The violation's `rule`. */
  name: string;
  expr: Expr;
  /** The variation that adds it, or `null`. */
  on: string | null;
  /** The labels its breach is drawn as (`breaches`), none where it is drawn
   * at its squares. */
  labels: readonly LabelSource[];
}

/** A label of a breach, read in the binding that breaks the statement: the
 * square, and the text, each piece as written or a number. */
export interface LabelSource {
  at: Expr;
  place: "above" | "below";
  says: readonly (string | Expr)[];
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
  mark: MarkRead | null = null,
  narrowed = false,
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
  const domainOf =
    domain === null || (domain.mask === "domainOf" && env.wide)
      ? null
      : domain.mask === "domainOf"
        ? (x: string) => {
            readsClues.yes = true;
            return `domainOf(sp, cl, ${x})`;
          }
        : () => domain.mask;
  if (narrowed && domainOf === null)
    throw new Error(
      "the answer's candidates narrow a domain the check reads per element",
    );
  const c = new Check(
    cenv,
    out,
    measured,
    repeat === null
      ? null
      : { value: measured(repeat.value), times: measured(repeat.times) },
    // The player's candidates narrow each element's domain (a Bridges line
    // from the bridges drawn to its limit).
    narrowed && domainOf !== null ? (x) => `(${domainOf(x)} & cands[${x}])` : domainOf,
    mark,
  );
  for (const s of statements) {
    const from = out.entries.length;
    const hoisted = scratch.length;
    if (s.on !== null) out.open(`if (variations.includes(${JSON.stringify(s.on)})) {`);
    c.statement(s.name, "-1", s.expr, base, s.labels);
    if (s.on !== null) out.close();
    // A statement whose code reads nothing of the board `g` is the same of
    // every board the deal makes: it says whether the board was dealt
    // right, which the deal and the answer check settle, and never where a
    // player's board breaks: Path's numbers, counted over every square for
    // every number, at every redraw. `overDomain` takes
    // the board only once a read of it has stopped a term, and a read may
    // be hoisted ahead of the statements (Slant's `linked`).
    const text = [
      ...out.entries.slice(from).map((l) => ("text" in l ? l.text : "")),
      ...scratch.slice(hoisted),
    ]
      .join("\n")
      .replaceAll("overDomain(g,", "");
    if (!/\bg\b/.test(text)) {
      out.entries.splice(from);
      scratch.splice(hoisted);
    }
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
  const holds = [
    ...(c.readsMarks && mark !== null ? marksHold(mark, cenv, readsClues) : []),
    ...(narrowed
      ? [`  for (const x of ${set}) if (!((cands[x] >> g[x]) & 1)) return false;`]
      : []),
  ];
  if (holds.length > 0) holds.push("  return true;");
  if (c.readsMarks && mark !== null) {
    // `_at` is a name the code may leave unread (Tracks' term reads only `_d`).
    const at = { code: "_at", sort: elem(mark.sort) };
    const of = compileExpr(
      mark.ofDef,
      new Map<string, Val>([
        ["at", at],
        ["_d", { code: "_d", sort: { k: "num" } }],
      ]),
      cenv,
      new Out(0),
    );
    scratch.unshift(`const _ofMark = (_at: number, _d: number): number => ${of.code};`);
  }
  const params = [
    c.triesValues ? "g0: ArrayLike<number>" : "g: ArrayLike<number>",
    "sp: GridSpace",
    ...(readsClues.yes ? ["cl: Dealt"] : []),
    ...(statements.some((s) => s.on !== null) ? ["variations: readonly string[]"] : []),
    ...(c.readsMarks ? ["marks: ArrayLike<number>"] : []),
    ...(narrowed ? ["cands: ArrayLike<number>"] : []),
  ];
  // `marksHold` takes what `violations` does, a name its body leaves unread
  // marked so.
  const plain = params.map((p) => {
    const q = p.replace(/^g0:/, "g:");
    const name = q.slice(0, q.indexOf(":"));
    return holds.some((l) => new RegExp(`\\b${name}\\b`).test(l)) ? q : `_${q}`;
  });
  return [
    "/** Each statement the board `g`, a value an element and 0 where it is",
    " * undecided, already breaks: false on every completion of it. */",
    `export function violations(${params.join(", ")}): Violation[] {`,
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    "}",
    ...(holds.length === 0
      ? []
      : [
          "",
          "/** Whether the player's marks, each a mask of the values it allows",
          " * (`marks` off the answer's elements, `cands` on them), hold of the",
          " * whole board `g`. */",
          `export function marksHold(${plain.join(", ")}): boolean {`,
          ...holds,
          "}",
        ]),
  ];
}

/** `marksHold`'s reading of the marks off the answer's elements: each mark's
 * term read on the whole board, and the mark holding that value. */
function marksHold(mark: MarkRead, env: Env, readsClues: { yes: boolean }): string[] {
  const scratch: string[] = [];
  const henv: Env = {
    ...env,
    answer: { repeats: env.answer?.repeats ?? false },
    readsClues,
    scratch,
    memo: false,
    hoist: null,
    boardRoot: null,
    epoch: null,
    concluding: false,
  };
  const out = new Out(2);
  const of = compileExpr(
    mark.of,
    new Map([["at", { code: "at", sort: elem(mark.sort) }]]),
    henv,
    out,
  );
  expect(of, "num", "a mark's term");
  return [
    ...scratch.map((s) => `  ${s}`),
    `  for (const at of sp.${mark.sort === "cell" ? "cells" : "edges"}) {`,
    ...out.text(),
    `    if (!((marks[at] >> (${of.code})) & 1)) return false;`,
    "  }",
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
  private readonly mark: MarkRead | null;
  /** Whether a bound read the player's marks, so the check takes them. */
  readsMarks = false;
  constructor(
    env: Env,
    out: Out,
    measured: (e: Expr) => Expr,
    repeat: Repeat,
    domainOf: ((x: string) => string) | null,
    mark: MarkRead | null,
  ) {
    this.env = env;
    this.out = out;
    this.measured = measured;
    this.repeat = repeat;
    this.domainOf = domainOf;
    this.mark = mark;
  }

  /** The labels of the statement being read, its breach drawn as them. */
  private labels: readonly LabelSource[] = [];

  /** Each violation of `e`, a statement named `rule` (of clue `clue`, or
   * `-1`), at the bindings of its leading `forall`s and conjunctions, each
   * drawn as `labels` where there are any. */
  statement(
    rule: string,
    clue: string,
    e: Expr,
    scope: Scope,
    labels: readonly LabelSource[] = [],
  ): void {
    this.labels = labels;
    this.where(rule, clue, this.measured(e), scope, [], SURE);
    this.labels = [];
  }

  /** A cycle's or a diagonal's violation names no binding to label. */
  private unlabeled(rule: string, form: string): void {
    if (this.labels.length > 0)
      throw new CompileError(
        `breaches: ${rule} is read as ${form}, which labels nothing`,
      );
  }

  /** Push the violation at `at`, with its labels read in `scope`; a label
   * that reads a square still open drops them all, the breach then drawn at
   * its squares. */
  private push(rule: string, clue: string, at: string, scope: Scope): void {
    const { out, env } = this;
    const head = `rule: ${JSON.stringify(rule)}, clue: ${clue}`;
    if (this.labels.length === 0) {
      out.emit(`_out.push({ ${head}, at: ${at} });`);
      return;
    }
    // The place first: a label's reads join the ones it was read from.
    const where = Out.fresh("_bat");
    const labels = Out.fresh("_lb");
    out.emit(`const ${where} = ${at};`);
    out.emit(`let ${labels}: BreachLabel[] | null = null;`);
    out.open("try {");
    const made = this.labels.map((l) => {
      const square = compileExpr(this.measured(l.at), scope, env, out);
      expectElem(square, "cell", `breaches: ${rule}'s label`);
      const says = l.says.map((p) => {
        if (typeof p === "string") return JSON.stringify(p);
        const v = compileExpr(this.measured(p), scope, env, out);
        expect(v, "num", `breaches: ${rule}'s label text`);
        return v.code;
      });
      return `{ at: ${square.code}, place: "${l.place}", says: [${says.join(", ")}] }`;
    });
    out.emit(`${labels} = [${made.join(", ")}];`);
    out.close("} catch (e) {");
    out.emit("  undecided(e);");
    out.emit("}");
    out.emit(
      `_out.push(${labels} === null ? { ${head}, at: ${where} } : { ${head}, at: ${where}, labels: ${labels} });`,
    );
  }

  private where(
    rule: string,
    clue: string,
    e0: Expr,
    scope: Scope,
    bound: readonly string[],
    guard: string,
  ): void {
    const e = heldLetsInPlace(
      desugared(inlined(e0, scope, this.env), scope, this.repeat),
      scope,
      this.env,
    );
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
    const cycle =
      e.k === "quant" && this.env.answerSort === "edge"
        ? cycleOf(e, scope, this.env)
        : null;
    if (cycle !== null) {
      this.unlabeled(rule, "a cycle");
      // Read as one: the sure edges, and each of them on a cycle of the
      // others, found together rather than by a walk from each.
      const sure = Out.fresh("_se");
      out.emit(`const ${sure}: number[] = [];`);
      this.stopped(() =>
        this.binders(
          [cycle],
          scope,
          guard,
          (sc, g) =>
            out.emit(
              `if (${g} === ${T}) ${sure}.push(${(sc.get(cycle.name) as Val).code});`,
            ),
          [],
          true,
        ),
      );
      this.env.used.add("cycleEdges");
      const x = Out.fresh("_cy");
      out.open(`for (const ${x} of cycleEdges(sp, ${sure})) {`);
      out.emit(
        `_out.push({ rule: ${JSON.stringify(rule)}, clue: ${clue}, at: [${[...bound, x].join(", ")}] });`,
      );
      out.close();
      return;
    }
    const diagonals =
      e.k === "quant" && this.env.answerSort === "cell"
        ? pointCycleOf(e, scope, this.env)
        : null;
    if (diagonals !== null) {
      this.unlabeled(rule, "a cycle of diagonals");
      // The same over the points: each drawn diagonal, by its square and
      // the two points it joins, and those on a cycle of the others.
      const lines = Out.fresh("_dl");
      out.emit(`const ${lines}: number[] = [];`);
      this.stopped(() =>
        this.binders(
          diagonals,
          scope,
          guard,
          (sc, g) =>
            out.emit(
              `if (${g} === ${T}) ${lines}.push(${diagonals
                .map((b) => (sc.get(b.name) as Val).code)
                .join(", ")});`,
            ),
          [],
          true,
        ),
      );
      this.env.used.add("cycleDiagonals");
      const x = Out.fresh("_cy");
      out.open(`for (const ${x} of cycleDiagonals(sp, ${lines})) {`);
      out.emit(
        `_out.push({ rule: ${JSON.stringify(rule)}, clue: ${clue}, at: [${[...bound, x].join(", ")}] });`,
      );
      out.close();
      return;
    }
    if (e.k === "quant" && e.q === "forall" && joinOf(e) === null) {
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
    this.push(rule, clue, at, scope);
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
    if (first.kind === "in" && heldSet(first.of, scope, env)) {
      // A set read from the answer ranges over its possible members, surely
      // over its sure ones: the numbers a Path line surely reaches. Where
      // only sure bindings are wanted, it ranges over its sure ones alone,
      // which a walk finds without the possible ones (Separate's region of
      // a letter, all the board on an empty one).
      const sureWalk =
        sureOnly &&
        !this.premade.has(first.of) &&
        throughSet(inlined(first.of, scope, this.env), scope, env) !== null;
      const [must, mayAll, whole] =
        this.premade.get(first.of) ??
        this.members(first.of, scope, sureWalk ? NO_MAY : null);
      const may = sureWalk ? must : mayAll;
      // Its sort, from code compiled only to learn it.
      const sort = compileExpr(
        first.of,
        scope,
        { ...env, scratch: [], used: new Set(), readsClues: { yes: false } },
        new Out(0),
      ).sort;
      const of = sort.k === "set" ? sort.of : sort;
      env.used.add("decidedIf");
      out.emit(`decidedIf(${whole});`);
      const sure = Out.fresh("_ms");
      out.emit(`const ${sure} = new Set(${must});`);
      const v = Out.fresh(`v_${first.name}`);
      out.open(`for (const ${v} of ${may}) {`);
      const sc = new Map(scope).set(first.name, { code: v, sort: of });
      const own = of.k === "elem" && of.e === env.answerSort ? [...names, v] : names;
      const g = Out.fresh("_gd");
      out.emit(`const ${g}: number = ${sure}.has(${v}) ? ${guard} : ${U};`);
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
    const e = heldLetsInPlace(
      desugared(inlined(e0, scope, this.env), scope, this.repeat),
      scope,
      this.env,
    );
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
    if (e.k === "call" && e.fn === "connected" && e.args.length === 1) {
      const S = this.sureAndMaybe(e.args[0], scope);
      if (S !== null) {
        // The sure members split among the groups the possible ones make
        // are apart on every completion: Range's clear squares cut off.
        const [must, may, whole] = S;
        this.env.used.add("apart");
        const w = Out.fresh("_ap");
        out.emit(`const ${w} = ${whole} ? apart(sp, ${must}, ${may}) : null;`);
        out.emit(`let ${r}: number = ${U};`);
        out.open(`if (${w} !== null) {`);
        out.emit(`${r} = ${F};`);
        out.emit(`${WITNESS} = ${w};`);
        out.close(`} else if (${whole} && ${must}.length === ${may}.length) {`);
        out.emit(`  ${r} = ${T};`);
        out.emit("}");
        return r;
      }
    }
    const join = e.k === "quant" ? joinOf(e) : null;
    if (join !== null) {
      const E = this.sureAndMaybe(join.E, scope);
      if (E !== null) {
        // Each sure member of A and B must reach the others through the
        // possible members of E: Spokes' hubs joined by lines.
        const [mustE, mayE, wholeE] = E;
        const ends = [join.A, join.B].map((s) => this.sureAndMaybe(s, scope));
        const [A, B] = ends as [[string, string, string], [string, string, string]];
        this.env.used.add("apartThrough");
        const need = Out.fresh("_nd");
        const w = Out.fresh("_ap");
        out.emit(
          `const ${need} = ${A[0]}.length > 0 && ${B[0]}.length > 0 ? [...${A[0]}, ...${B[0]}] : [];`,
        );
        out.emit(
          `const ${w} = ${wholeE} ? apartThrough(sp, ${need}, ${mustE}, ${mayE}) : null;`,
        );
        out.emit(`let ${r}: number = ${U};`);
        out.open(`if (${w} !== null) {`);
        out.emit(`${r} = ${F};`);
        out.emit(`${WITNESS} = ${w};`);
        out.close(
          `} else if (${wholeE} && ${mustE}.length === ${mayE}.length && ${A[0]}.length === ${A[1]}.length && ${B[0]}.length === ${B[1]}.length) {`,
        );
        out.emit(`  ${r} = ${T};`);
        out.emit("}");
        return r;
      }
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
    if (
      e.k === "bin" &&
      (e.op === "in" || e.op === "notin") &&
      !readsHeld(e.a) &&
      heldSet(e.b, scope, this.env)
    ) {
      // In where a sure member, out where no possible one: a square a Path
      // line's sure links reach is on its piece.
      const x = once(compileExpr(e.a, scope, this.env, out), out).code;
      const [must, may, whole] = this.members(
        e.b,
        scope,
        (m) => `!${m}.includes(${x})`,
      );
      const [yes, no] = e.op === "in" ? [T, F] : [F, T];
      out.emit(
        `const ${r}: number = ${must}.includes(${x}) ? ${yes} : ${whole} && !${may}.includes(${x}) ? ${no} : ${U};`,
      );
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
    const { out } = this;
    if (
      this.mark !== null &&
      e0.k === "call" &&
      e0.fn === this.mark.def &&
      e0.args.length === 1 &&
      !scope.has(e0.fn)
    ) {
      // The definition the player's mark speaks of, narrowed to what the
      // mark allows: a Tracks square marked track counts as track.
      const x = once(compileExpr(e0.args[0], scope, this.env, out), out).code;
      const inner = this.bounds(inlined(e0, scope, this.env), scope);
      this.readsMarks = true;
      this.env.used.add("markRange");
      const r = Out.fresh("_mr");
      out.emit(
        `const ${r} = markRange(${inner.lo}, ${inner.hi}, marks[${x}], (d) => _ofMark(${x}, d));`,
      );
      return { lo: `${r}[0]`, hi: `${r}[1]`, yes: inner.yes, no: inner.no };
    }
    const e = inlined(e0, scope, this.env);
    const lo = Out.fresh("_lo");
    const hi = Out.fresh("_hi");
    const aCounted = e.k === "bin" && counted(e.a, scope, this.env);
    // An element's value its domain bounds: a Bridges edge's `value(e) - 1`,
    // the bridges it carries, is at least what its candidates allow.
    const valued = (x: Expr): boolean =>
      this.domainOf !== null &&
      x.k === "call" &&
      x.fn === "value" &&
      x.args.length === 1;
    if (
      e.k === "bin" &&
      (e.op === "+" || e.op === "-" || e.op === "*") &&
      (aCounted || counted(e.b, scope, this.env) || valued(e.a) || valued(e.b))
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
      // What its filters name is not where the count breaks: WordTrail's
      // count of squares whose piece is a word's length.
      const saved = Out.fresh("_wsv");
      out.emit(`const ${saved}: readonly number[] | null = ${WITNESS};`);
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
      out.emit(`${WITNESS} = ${saved};`);
      // A count over no element of the answer names none, and where it
      // breaks is what it read (a Dominosa square's barred sides).
      return named ? { lo, hi, yes, no } : { lo, hi, yes: null, no: null };
    }
    if (agg !== null && (agg.fn === "min" || agg.fn === "max")) {
      // The least or greatest of the terms of the members a completion may
      // keep, `-1` where it may keep none: Range's view stops at the first
      // square that may be shaded at the soonest, and at the first that
      // surely is at the latest.
      const min = agg.fn === "min";
      const [mayLo, mayHi, sureLo, sureHi, any] = [
        "_mlo",
        "_mhi",
        "_slo",
        "_shi",
        "_any",
      ].map((p) => Out.fresh(p));
      out.emit(`let ${lo} = -Infinity;`);
      out.emit(`let ${hi} = Infinity;`);
      out.emit(`let ${mayLo} = Infinity;`);
      out.emit(`let ${mayHi} = -1;`);
      out.emit(`let ${sureLo} = -1;`);
      out.emit(`let ${sureHi} = Infinity;`);
      // Whether any member is sure, which only the least reads.
      if (min) out.emit(`let ${any} = false;`);
      const last = agg.binders.at(-1);
      const saved = Out.fresh("_wsv");
      out.emit(`const ${saved}: readonly number[] | null = ${WITNESS};`);
      this.stoppedOr(() => {
        this.binders(agg.binders, scope, SURE, (sc, g) => {
          const p = agg.where === null ? null : this.verdict(agg.where, sc);
          const sure = p === null ? g : Out.fresh("_s");
          if (p !== null)
            out.emit(
              `const ${sure}: number = ${g} === ${T} && ${p} === ${T} ? ${T} : ${g} === ${F} || ${p} === ${F} ? ${F} : ${U};`,
            );
          out.open(`if (${sure} !== ${F}) {`);
          const t = this.bounds(agg.term ?? nm(last?.name ?? ""), sc);
          out.emit(`${mayLo} = Math.min(${mayLo}, ${t.lo});`);
          out.emit(`${mayHi} = Math.max(${mayHi}, ${t.hi});`);
          out.open(`if (${sure} === ${T}) {`);
          if (min) out.emit(`${any} = true;`);
          out.emit(`${sureLo} = Math.max(${sureLo}, ${t.lo});`);
          out.emit(`${sureHi} = Math.min(${sureHi}, ${t.hi});`);
          out.close();
          out.close();
        });
        if (min) {
          out.emit(`${lo} = ${any} ? ${mayLo} : -1;`);
          out.emit(`${hi} = ${any} ? ${sureHi} : ${mayHi};`);
        } else {
          out.emit(`${lo} = ${sureLo};`);
          out.emit(`${hi} = ${mayHi};`);
        }
      }, [`${lo} = -Infinity;`, `${hi} = Infinity;`]);
      out.emit(`${WITNESS} = ${saved};`);
      return { lo, hi, yes: null, no: null };
    }
    if (e.k === "size" && heldSet(e.of, scope, this.env)) {
      // A set holds its sure members at least and its possible ones at most.
      const [must, may, whole] = this.members(e.of, scope);
      out.emit(`const ${lo} = ${must}.length;`);
      out.emit(`const ${hi} = ${whole} ? ${may}.length : Infinity;`);
      if (throughSet(inlined(e.of, scope, this.env), scope, this.env) === null)
        return { lo, hi, yes: null, no: null };
      // A region too big is named by its sure squares, one too small by its
      // possible ones; where the answer is on the edges, by the edges round
      // them: Palisade's region outlined.
      if (this.env.answerSort !== "edge") return { lo, hi, yes: must, no: may };
      this.env.used.add("rimEdges");
      return { lo, hi, yes: `rimEdges(sp, ${must})`, no: `rimEdges(sp, ${may})` };
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

  /** A set of elements as two arrays, those surely in it and those that may
   * be, and whether the second is whole, which it is not where reading the
   * set's members stopped: for `{x in S where P}`, and for any set
   * {@link heldSet} reads; `null` for any other term. */
  private sureAndMaybe(e0: Expr, scope: Scope): [string, string, string] | null {
    const e = inlined(e0, scope, this.env);
    const filtered =
      e.k === "agg" &&
      e.fn === "set" &&
      e.binders.length === 1 &&
      e.term?.k === "name" &&
      e.term.name === e.binders[0].name;
    if (!filtered && !heldSet(e, scope, this.env)) return null;
    return this.members(e, scope);
  }

  /** The walks made of each `through` set that reads nothing a statement
   * binds, by the set's text: per square, the sure walk that reached it
   * and what that walk read, and the possible walk. */
  private readonly walks = new Map<string, { sure: string; may: string }>();

  /** The arrays {@link members} keeps a `through`'s walks of its set in, or
   * `null` where its set reads a name `scope` binds (the line Path's loop
   * rule leaves out), so that the walks differ from binding to binding. */
  private walkCache(e: Expr, scope: Scope): { sure: string; may: string } | null {
    if (e.k !== "call") return null;
    const free = new Set<string>();
    freeNames(e.args[1], free, new Set());
    if ([...free].some((n) => scope.has(n))) return null;
    const key = JSON.stringify(inlined(e.args[1], scope, this.env));
    let made = this.walks.get(key);
    if (made === undefined) {
      const sure = Out.fresh("_ws");
      const may = Out.fresh("_wm");
      const { scratch } = this.env;
      scratch?.push(
        `const ${sure}: ({ m: number[]; r: number[] } | undefined)[] = [];`,
      );
      // Declared once a check reads the possible walk: one ranging only
      // over sure bindings never does.
      let declared = false;
      made = {
        sure,
        get may() {
          if (!declared) scratch?.push(`const ${may}: (number[] | undefined)[] = [];`);
          declared = true;
          return may;
        },
      };
      this.walks.set(key, made);
    }
    return made;
  }

  /**
   * The set `e` as {@link sureAndMaybe}'s three names. A set of the board's
   * elements read from the answer (`heldSet`) is bounded by its form:
   * `through(c, {e in edges where P})` reaches surely across the edges P is
   * true of and at most across those it is not false of (Path's line from a
   * square, the numbers at its ends known once its sure lines reach them);
   * a union by its two sides; and a set over binders by each binding a
   * filter or a binder's own set leaves sure or possible. Any other set is
   * evaluated as the answer check would, whole where nothing it read was
   * undecided. Where `needMay`, given the sure members' name, is false, a
   * `through`'s possible members are left unread and empty: a membership
   * its sure ones settle needs no walk over the board.
   */
  private members(
    e0: Expr,
    scope: Scope,
    needMay: ((must: string) => string) | null = null,
  ): [string, string, string] {
    const e = inlined(e0, scope, this.env);
    const { out, env } = this;
    const must = Out.fresh("_must");
    const may = Out.fresh("_may");
    const ok = Out.fresh("_ok");
    const walked = throughSet(e, scope, env);
    if (walked !== null) {
      const [cArg, bnd] = walked;
      const c = once(compileExpr(cArg, scope, env, out), out).code;
      const x = Out.fresh("_ce");
      const crosses = Out.fresh("_cr");
      out.open(`const ${crosses} = (${x}: number): number => {`);
      const p =
        bnd.where === null
          ? `${T}`
          : this.verdict(
              bnd.where,
              new Map(scope).set(bnd.name, { code: x, sort: elem("edge") }),
            );
      out.emit(`return ${p};`);
      out.close("};");
      env.used.add("throughWhere");
      const sureWalk = `[...throughWhere(sp, ${c}, (x) => ${crosses}(x) === ${T})]`;
      const mayWalk = `[...throughWhere(sp, ${c}, (x) => ${crosses}(x) !== ${F})]`;
      const n = Out.fresh("_n");
      const cache = this.walkCache(e, scope);
      // A set that reads nothing the statement binds is the same set from
      // every square, so a walk from one square is every square's it
      // reaches: Path's piece is walked once, not once a square of it.
      const hit = Out.fresh("_hit");
      if (cache === null) out.emit(`const ${must}: number[] = ${sureWalk};`);
      else {
        out.emit(`let ${must}: number[];`);
        out.emit(`const ${hit} = ${cache.sure}[${c}];`);
        out.open(`if (${hit} !== undefined) {`);
        out.emit(`${must} = ${hit}.m;`);
        out.emit(`${READ}.push(...${hit}.r);`);
        out.close("} else {");
        out.emit(`  const ${n} = ${READ}.length;`);
        out.emit(`  ${must} = ${sureWalk};`);
        out.emit(`  const _made = { m: ${must}, r: ${READ}.slice(${n}) };`);
        out.emit(`  for (const y of ${must}) ${cache.sure}[y] = _made;`);
        out.emit("}");
      }
      if (needMay === NO_MAY) return [must, "([] as number[])", "true"];
      if (cache === null) {
        // What the possible members were read from names nothing: a walk
        // over them may cross the whole board.
        out.emit(`const ${n} = ${READ}.length;`);
        out.emit(
          `const ${may}: number[] = ${needMay === null ? mayWalk : `${needMay(must)} ? ${mayWalk} : []`};`,
        );
        out.emit(`${READ}.length = ${n};`);
      } else {
        out.emit(`let ${may}: number[] = [];`);
        out.open(`if (${needMay === null ? "true" : needMay(must)}) {`);
        out.emit(`const ${hit}m = ${cache.may}[${c}];`);
        out.open(`if (${hit}m !== undefined) {`);
        out.emit(`${may} = ${hit}m;`);
        out.close("} else {");
        out.emit(`  const ${n}m = ${READ}.length;`);
        out.emit(`  ${may} = ${mayWalk};`);
        out.emit(`  ${READ}.length = ${n}m;`);
        out.emit(`  for (const y of ${may}) ${cache.may}[y] = ${may};`);
        out.emit("}");
        out.close();
      }
      out.emit(`const ${ok} = true;`);
      return [must, may, ok];
    }
    if (e.k === "bin" && e.op === "+") {
      const [A, B] = [e.a, e.b].map((s) =>
        heldSet(s, scope, env) ? this.members(s, scope) : this.evaluated(s, scope),
      );
      out.emit(`const ${must}: number[] = [...new Set([...${A[0]}, ...${B[0]}])];`);
      out.emit(`const ${may}: number[] = [...new Set([...${A[1]}, ...${B[1]}])];`);
      out.emit(`const ${ok} = ${A[2]} && ${B[2]};`);
      return [must, may, ok];
    }
    if (e.k !== "agg" || e.fn !== "set") return this.evaluated(e, scope);
    out.emit(`let ${must}: number[] = [];`);
    out.emit(`let ${may}: number[] = [];`);
    out.emit(`let ${ok} = true;`);
    const memo = this.overWalk(e, scope);
    if (memo === null) {
      this.setLoop(e, scope, must, may, ok);
      return [must, may, ok];
    }
    // Made once a walk: Path's numbers at the ends of a piece, the same
    // from every square of it. The sure members are made over the sure
    // walk and the possible ones over the possible walk, each kept by its
    // own, since an open square is a sure walk of its own in an open
    // region that is one possible walk.
    const [wm, wy, wok] = memo.walk;
    const [hitM, hitY, okY, scrap] = ["_hit", "_hit", "_ok", "_scrap"].map((p) =>
      Out.fresh(p),
    );
    out.emit(`const ${hitM} = ${memo.sure}.get(${wm});`);
    out.open(`if (${hitM} !== undefined) {`);
    out.emit(`${must} = ${hitM}.m;`);
    out.emit(`${ok} = ${hitM}.ok;`);
    out.emit(`${READ}.push(...${hitM}.r);`);
    out.close();
    out.open("else {");
    const n0 = Out.fresh("_n");
    out.emit(`const ${n0} = ${READ}.length;`);
    out.emit(`const ${scrap}: number[] = [];`);
    this.premade.set(memo.of, [wm, wm, wok]);
    this.setLoop(e, scope, must, scrap, ok);
    out.emit(
      `${memo.sure}.set(${wm}, { m: ${must}, ok: ${ok}, r: ${READ}.slice(${n0}) });`,
    );
    out.close();
    out.emit(`let ${okY} = true;`);
    out.emit(`const ${hitY} = ${memo.may}.get(${wy});`);
    out.open(`if (${hitY} !== undefined) {`);
    out.emit(`${may} = ${hitY}.p;`);
    out.emit(`${okY} = ${hitY}.ok;`);
    out.close();
    out.open("else {");
    const n1 = Out.fresh("_n");
    out.emit(`const ${n1} = ${READ}.length;`);
    out.emit(`const ${scrap}: number[] = [];`);
    this.premade.set(memo.of, ["([] as number[])", wy, wok]);
    this.setLoop(e, scope, scrap, may, okY);
    out.emit(`${READ}.length = ${n1};`);
    out.emit(`${memo.may}.set(${wy}, { p: ${may}, ok: ${okY} });`);
    out.close();
    this.premade.delete(memo.of);
    out.emit(`${ok} = ${ok} && ${okY};`);
    out.emit(`if (!${ok}) ${must} = [];`);
    return [must, may, ok];
  }

  /** The loop that fills `must` and `may`, both fresh arrays, with the set
   * over binders `e`'s sure and possible members, `ok` false where reading
   * them stopped. */
  private setLoop(
    e: Extract<Expr, { k: "agg" }>,
    scope: Scope,
    must: string,
    may: string,
    ok: string,
  ): void {
    const { out, env } = this;
    const own =
      e.binders.length === 1 &&
      e.term?.k === "name" &&
      e.term.name === e.binders[0].name;
    this.stoppedOr(
      () =>
        this.binders(e.binders, scope, SURE, (sc, g) => {
          const n = Out.fresh("_n");
          out.emit(`const ${n} = ${READ}.length;`);
          const x = own
            ? (sc.get(e.binders[0].name) as Val).code
            : once(compileExpr(e.term ?? nm(""), sc, env, out), out).code;
          const p = e.where === null ? g : this.verdict(e.where, sc);
          out.open(`if (${p} === ${T} && ${g} === ${T}) {`);
          out.emit(`${must}.push(${x});`);
          // Only a sure member's reads name where the set stands.
          out.close(`} else ${READ}.length = ${n};`);
          out.emit(`if (${p} !== ${F} && ${g} !== ${F}) ${may}.push(${x});`);
        }),
      [`${ok} = false;`],
    );
    // A set whose members are themselves undecided says nothing.
    out.emit(`if (!${ok}) ${must}.length = 0;`);
    if (!own) {
      out.emit(`${must}.splice(0, ${must}.length, ...new Set(${must}));`);
      out.emit(`${may}.splice(0, ${may}.length, ...new Set(${may}));`);
    }
  }

  /** A `through`'s walks already made, by the binder set they are of, for
   * {@link binders} to range over. */
  private readonly premade = new Map<Expr, [string, string, string]>();

  /**
   * For a set over binders whose first ranges over a `through` whose walks
   * are kept ({@link walkCache}), and whose rest reads nothing else the
   * statement binds: the walks, made here, and the store that keeps the set
   * by them. `null` for any other set.
   */
  private overWalk(
    e: Extract<Expr, { k: "agg" }>,
    scope: Scope,
  ): { of: Expr; walk: [string, string, string]; sure: string; may: string } | null {
    const [first, ...rest] = e.binders;
    if (first?.kind !== "in") return null;
    const of = inlined(first.of, scope, this.env);
    if (throughSet(of, scope, this.env) === null || this.walkCache(of, scope) === null)
      return null;
    const free = new Set<string>();
    freeNames(
      { ...e, binders: [{ ...first, of: nm("cells") }, ...rest] },
      free,
      new Set(),
    );
    if ([...free].some((n) => scope.has(n))) return null;
    const walk = this.members(first.of, scope);
    const sure = Out.fresh("_sms");
    const may = Out.fresh("_smm");
    this.env.scratch?.push(
      `const ${sure} = new WeakMap<number[], { m: number[]; ok: boolean; r: number[] }>();`,
      `const ${may} = new WeakMap<number[], { p: number[]; ok: boolean }>();`,
    );
    return { of: first.of, walk, sure, may };
  }

  /** A set as the answer check reads it, in {@link members}' three names:
   * its members both sure and possible, whole where no read stopped it. */
  private evaluated(e: Expr, scope: Scope): [string, string, string] {
    const { out } = this;
    const must = Out.fresh("_must");
    const ok = Out.fresh("_ok");
    out.emit(`let ${must}: number[] = [];`);
    out.emit(`let ${ok} = true;`);
    this.stoppedOr(() => {
      const v = compileExpr(e, scope, this.env, out);
      out.emit(`${must} = [...${v.code}];`);
    }, [`${ok} = false;`]);
    return [must, must, ok];
  }
}

/** `through(c, {e in edges where P})`, its set stated in place and its cell
 * reading no value of the answer, as the cell and the set's binder; `null`
 * for any other term. */
function throughSet(e: Expr, scope: Scope, env: Env): [Expr, Binder] | null {
  if (e.k !== "call" || e.fn !== "through" || e.args.length !== 2) return null;
  const [c, S0] = e.args;
  const S = inlined(S0, scope, env);
  if (readsHeld(c) || S.k !== "agg" || S.fn !== "set" || S.where !== null) return null;
  const [bnd, ...more] = S.binders;
  if (bnd === undefined || more.length > 0 || bnd.kind !== "in") return null;
  if (bnd.of.k !== "name" || bnd.of.name !== "edges" || scope.has("edges")) return null;
  if (S.term?.k !== "name" || S.term.name !== bnd.name) return null;
  return [c, bnd];
}

/**
 * Whether `e` is a set of elements the check reads as its sure and possible
 * members (`Check.members`): a `through` stated in place, a union with such
 * a set on a side, or a set over binders one of whose sets is such a set or
 * whose filters or term read the answer. A set that reads no value of the
 * answer is evaluated as it is.
 */
function heldSet(e0: Expr, scope: Scope, env: Env): boolean {
  const e = inlined(e0, scope, env);
  if (throughSet(e, scope, env) !== null) return true;
  if (e.k === "bin" && e.op === "+")
    return heldSet(e.a, scope, env) || heldSet(e.b, scope, env);
  if (e.k !== "agg" || e.fn !== "set") return false;
  return (
    e.binders.some(
      (b) =>
        (b.kind === "in" && heldSet(b.of, scope, env)) ||
        (b.where !== null && readsHeld(b.where)),
    ) ||
    (e.where !== null && readsHeld(e.where)) ||
    (e.term !== null && readsHeld(e.term))
  );
}

/**
 * `forall O = S, ...: P`, S a set read from the answer ({@link heldSet}), as
 * the same statement with S written in place of O: a binder's set is
 * evaluated whole, which an undecided element stops, where one written in
 * place is read as its sure and possible members (Palisade's region, too
 * big once its sure squares are). The through form ({@link joinOf}) is
 * matched whole with its binder, so it keeps it.
 */
function heldLetsInPlace(e: Expr, scope: Scope, env: Env): Expr {
  if (e.k !== "quant" || joinOf(e) !== null) return e;
  const i = e.binders.findIndex(
    (b) => b.kind === "let" && b.where === null && heldSet(b.of, scope, env),
  );
  if (i < 0) return e;
  const L = e.binders[i];
  const S = inlined(L.of, scope, env);
  const avoid = new Set<string>();
  freeNames(S, avoid, new Set());
  const rest: Expr = {
    ...e,
    binders: e.binders.slice(i + 1),
  };
  const after = substitute(
    rest.binders.length === 0 ? e.body : rest,
    new Map([[L.name, S]]),
    avoid,
  );
  const binders = e.binders.slice(0, i);
  if (binders.length === 0) return heldLetsInPlace(after, scope, env);
  return { ...e, binders, body: after };
}

/** `Check.members`' `needMay` where the possible members are never read: a
 * walk's sure members alone are made. */
const NO_MAY = (): string => "false";

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
  if (e.k === "size" && heldSet(e.of, scope, env)) return true;
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
