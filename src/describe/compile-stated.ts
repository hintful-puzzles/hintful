/**
 * A description's stated words, checked and written out: a technique's
 * `says` against its clauses, and the module's `STATED` table and planner
 * steps (`compile.ts`).
 */

import {
  type Slot as ClauseSlot,
  ringNames,
  STATED_INNER_WORDS,
  STATED_WORDS,
  slotsOf,
} from "../engine/stated-clauses.ts";
import {
  BOOL,
  CompileError,
  expect,
  NUM,
  type Sort,
  type Val,
} from "./compile-sorts.ts";
import type {
  GameWords,
  Says,
  StatedClauses,
  Step,
  StepTermKind,
  Technique,
  Wording,
} from "./description.ts";
import type { Expr } from "./expr.ts";

/**
 * Every slot of a technique's stated clauses names what the technique states:
 * a number term or a lexicon word said plainly, a role it marks or a term of
 * elements as a reference. A fact's clauses read the firing's terms and the
 * fact's own.
 */
export function checkStated(
  id: string,
  says: Says,
  /** Each variant's terms by sort, and the terms the game supplies as words
   * (`{ supplied: words }`), which have none: said as a list, as
   * alternatives or by how many. */
  variants: readonly {
    sorts: ReadonlyMap<string, Sort>;
    words?: readonly string[];
  }[],
  factSorts: ReadonlyMap<string, Sort> | null,
  units: ReadonlySet<string> = new Set(),
  /** A planner's step that decides elements of several sorts names one of
   * them in each ring reference, as a role of several sorts does. */
  ringSorts: readonly string[] | null = null,
): void {
  // A clause reads a lexicon word before a term, so a term of that name would
  // silently never be said.
  for (const name of new Set(
    [...variants, { sorts: factSorts ?? new Map() }].flatMap((v) => [
      ...v.sorts.keys(),
    ]),
  ))
    if (STATED_WORDS.has(name))
      throw new CompileError(
        `${id}: a term named ${name} is shadowed by the lexicon's word of that name: rename the term`,
      );
  const isNum = (s?: Sort): boolean => s?.k === "num" || s?.k === "int";
  const isElems = (s?: Sort): boolean =>
    s !== undefined && (s.k === "elem" || (s.k === "set" && s.of.k === "elem"));
  const check = (
    where: string,
    clauses: StatedClauses,
    sorts: ReadonlyMap<string, Sort>,
    roles: ReadonlyMap<string, ReadonlySet<string> | null>,
    words: ReadonlySet<string>,
  ): void => {
    for (const [part, src] of Object.entries(clauses) as [string, string][]) {
      let slots: ClauseSlot[];
      try {
        slots = slotsOf(src);
      } catch (e) {
        throw new CompileError(`${id}: says ${where}${part}: ${(e as Error).message}`);
      }
      const plain = (name: string, inner: boolean): void => {
        if (
          STATED_WORDS.has(name) ||
          isNum(sorts.get(name)) ||
          units.has(name) ||
          words.has(name)
        )
          return;
        if (inner && STATED_INNER_WORDS.has(name)) return;
        throw new CompileError(
          `${id}: says ${where}${part} says {${name}}, which is no number or unit term and no word of the lexicon`,
        );
      };
      for (const s of slots) {
        for (const n of s.numbers ?? [])
          if (units.has(n))
            throw new CompileError(
              `${id}: says ${where}${part} says {${n}} as a number, which is a unit term`,
            );
        for (const flag of s.flags)
          if (sorts.get(flag)?.k !== "bool")
            throw new CompileError(
              `${id}: says ${where}${part} chooses by {if ${flag}}, which is no flag term`,
            );
        // Squares the step places, whatever the description marks.
        if (s.role === "if" || s.role === "has" || s.role === "fit") continue;
        if (s.role === "ring" && s.name !== null && ringNames(s.name) !== null) {
          for (const n of s.inner) plain(n, true);
          continue;
        }
        if (s.role === null) plain(s.name as string, false);
        else if (s.name === null) {
          if (s.role !== "ring" && !roles.has(s.role))
            throw new CompileError(
              `${id}: says ${where}${part} names {${s.role}}, which it marks nothing in`,
            );
          if (roles.get(s.role) != null)
            throw new CompileError(
              `${id}: says ${where}${part} names {${s.role}}, which marks several sorts: name one, as {${s.role} ${[...(roles.get(s.role) as ReadonlySet<string>)][0]}}`,
            );
        } else if (roles.get(s.role)?.has(s.name)) {
          // A role of several sorts, and the reference names one of them.
        } else if (!isElems(sorts.get(s.name)))
          throw new CompileError(
            `${id}: says ${where}${part} names {${s.role} ${s.name}}, and ${s.name} is no term of elements`,
          );
        for (const n of s.inner) plain(n, true);
      }
    }
  };
  /** Each role a step marks, with the sorts it holds where it holds several. */
  const rolesOf = (
    marks: readonly { role: string; sort: string | null }[],
  ): Map<string, ReadonlySet<string> | null> =>
    new Map([
      ...[...new Set(marks.map((m) => m.role))].map(
        (role): [string, ReadonlySet<string> | null] => {
          const sortsOf = marks.filter((m) => m.role === role && m.sort !== null);
          return [
            role,
            sortsOf.length === 0 ? null : new Set(sortsOf.map((m) => m.sort as string)),
          ];
        },
      ),
      ...(ringSorts === null
        ? []
        : [["ring", new Set(ringSorts)] as [string, ReadonlySet<string>]]),
    ]);
  const wording = (words: readonly Wording[], i: number): string =>
    words.length > 1 ? `wording ${i} ` : "";
  // A step for one square (`shown: each`) is spoken with that square's fact
  // terms beside the firing's, so its clauses may read them (Clusters' `own`:
  // which of two counts' squares it is); its wording is still chosen by the
  // firing's.
  const own = says.each && factSorts !== null ? [...factSorts] : [];
  for (const [i, v] of says.variants.entries())
    for (const [j, w] of v.words.entries())
      check(
        `${v.name === null ? "" : `${v.name} `}${wording(v.words, j)}`,
        w.clauses,
        new Map([...variants[i].sorts, ...own]),
        rolesOf(v.marks),
        new Set(variants[i].words),
      );
  if (says.fact !== null && factSorts !== null) {
    const sorts = new Map([...variants.flatMap((v) => [...v.sorts]), ...factSorts]);
    const roles = new Map([
      ...says.variants.flatMap((v) => [...rolesOf(v.marks)]),
      ...rolesOf(says.fact.marks),
    ]);
    for (const [j, w] of says.fact.words.entries())
      check(
        `fact ${wording(says.fact.words, j)}`,
        w.clauses,
        sorts,
        roles,
        new Set(variants.flatMap((v) => v.words ?? [])),
      );
  }
}

/** A wording's clauses as `engine/stated.ts` renders them, with the reason it
 * may run past the line where it has one, which the sentence carries. */
function spokenClauses(w: Wording): StatedClauses & { long?: string } {
  return w.long === null ? w.clauses : { ...w.clauses, long: w.long.why };
}

/** The module's `STATED`: each kind of step's clauses as the description
 * states them, by wording, and each fact's, for `engine/stated.ts` to render.
 * A firing's `wording`, and a fact's, is the index of the one that held; it is
 * absent where there is one. Empty where nothing states a clause. */
export function statedTable(own: readonly Technique[]): string[] {
  const rows: string[] = [];
  for (const t of own) {
    if (t.says === null) continue;
    const fact =
      t.says.fact === null || t.says.fact.words.length === 0
        ? null
        : t.says.fact.words.map(spokenClauses);
    for (const v of t.says.variants) {
      if (v.words.length === 0 && fact === null) continue;
      const kind = v.name === null ? t.id : `${t.id}.${v.name}`;
      const several = v.terms
        .filter((x) => x.supplied === "several")
        .map((x) => x.name);
      const entry = {
        ...(v.words.length === 0 ? {} : { step: v.words.map(spokenClauses) }),
        ...(fact === null ? {} : { fact }),
        ...(several.length === 0 ? {} : { several }),
      };
      rows.push(`  ${JSON.stringify(kind)}: ${JSON.stringify(entry)},`);
    }
  }
  if (rows.length === 0) return [];
  return [
    "/** Each kind of step's words as the description states them, and each",
    " * fact's, by wording (`engine/stated.ts`); and the flag terms the engine",
    " * sets to whether the step decides several elements (`several`). */",
    "export const STATED = {",
    ...rows,
    "} as const;",
    "",
  ];
}

/** Whether a step's term is words the clause says as they are: a unit's name,
 * a word the planner makes, one of the words the term lists, or another
 * step's clause. */
const saidPlainly = (kind: StepTermKind): boolean =>
  kind === "unit" || kind === "word" || typeof kind !== "string";

/** The steps a `clause` or `clauses` term may speak, or null for any other
 * term. */
const clauseOf = (kind: StepTermKind): readonly string[] | null =>
  typeof kind !== "object" || Array.isArray(kind)
    ? null
    : "clause" in kind
      ? kind.clause
      : "clauses" in kind
        ? kind.clauses
        : null;

/** A step's term as `StepsById` types it. */
const stepTermType = (kind: StepTermKind): string =>
  typeof kind !== "string"
    ? "clause" in kind
      ? `StepClause<StepsById<E>, ${kind.clause.map((w) => JSON.stringify(w)).join(" | ")}, E>`
      : "clauses" in kind
        ? `readonly StepClause<StepsById<E>, ${kind.clauses.map((w) => JSON.stringify(w)).join(" | ")}, E>[]`
        : kind.map((w) => JSON.stringify(w)).join(" | ")
    : kind === "flag"
      ? "boolean"
      : kind === "unit"
        ? "Unit"
        : kind === "word"
          ? "string"
          : kind === "values"
            ? "readonly number[]"
            : "number";

/** A planner's kind of step checks as a technique's `says` does, over the
 * terms and marks it declares: a number term is a number, a flag a truth, and
 * a list of values checks as a number, being said and counted as one is. */
function checkStep(step: Step): void {
  const sorts = new Map<string, Sort>(
    step.terms.flatMap((t): [string, Sort][] =>
      saidPlainly(t.kind) ? [] : [[t.name, t.kind === "flag" ? BOOL : NUM]],
    ),
  );
  // A unit or word term is a word, said plainly and read by nothing else.
  const units = new Set(
    step.terms.filter((t) => saidPlainly(t.kind)).map((t) => t.name),
  );
  for (const u of units)
    if (STATED_WORDS.has(u))
      throw new CompileError(
        `${step.id}: a term named ${u} is shadowed by the lexicon's word of that name: rename the term`,
      );
  const says: Says = {
    each: false,
    legs: false,
    witness: false,
    reads: false,
    fact: null,
    variants: [
      {
        name: null,
        when: null,
        terms: [],
        marks: step.marks.map((m) => ({ ...m, expr: { k: "num", v: 0 } })),
        words: step.words,
      },
    ],
  };
  checkStated(
    step.id,
    says,
    [{ sorts }],
    null,
    units,
    typeof step.ring === "string" ? null : step.ring,
  );
  for (const [i, w] of step.words.entries())
    if (w.when !== null) stepWhen(step, w.when, `wording ${i} when`);
}

/** A wording's `when` of a planner's step as code over its terms (`t`) and
 * marks (`m`): a term, a size `|outlineAngle|` of the marks of one role and
 * sort or `|ring|` of what the step decides (`r`), a number, and the
 * connectives. */
function stepWhen(step: Step, e: Expr, where: string): string {
  const fail = (what: string): never => {
    throw new CompileError(`${step.id}: ${where} reads ${what}`);
  };
  const term = (name: string): Step["terms"][number] =>
    step.terms.find((t) => t.name === name) ?? fail(`${name}, which is no term`);
  const num = (x: Expr): string => {
    if (x.k === "num") return String(x.v);
    if (x.k === "name") {
      if (term(x.name).kind !== "number") fail(`${x.name} as a number, a flag`);
      return `t.${x.name}`;
    }
    if (x.k === "size" && x.of.k === "name") {
      const { name } = x.of;
      // What the step decides: none where a move gains nothing to point at.
      if (name === "ring") return "r.length";
      // A ring of several sorts is read by sort (`s`), as a mark is.
      const ringSort = (typeof step.ring === "string" ? [] : step.ring).find(
        (sort) => `ring${sort[0].toUpperCase()}${sort.slice(1)}` === name,
      );
      if (ringSort !== undefined)
        return `(s[${JSON.stringify(ringSort)}]?.length ?? 0)`;
      const mark = step.marks.find(
        (m) => m.role + m.sort[0].toUpperCase() + m.sort.slice(1) === name,
      );
      if (mark === undefined) return fail(`|${name}|, which is no mark of the step`);
      return `m.${mark.role}.${mark.sort}.length`;
    }
    return fail("a number it cannot compile");
  };
  const bool = (x: Expr): string => {
    if (x.k === "name") {
      if (term(x.name).kind !== "flag") fail(`${x.name} as a flag, a number`);
      return `t.${x.name}`;
    }
    if (x.k === "not") return `!${bool(x.of)}`;
    if (x.k === "bin") {
      if (x.op === "and" || x.op === "or")
        return `(${bool(x.a)} ${x.op === "and" ? "&&" : "||"} ${bool(x.b)})`;
      // A word term is compared with one of its words: `why = corner`.
      if ((x.op === "=" || x.op === "!=") && x.a.k === "name") {
        const kind = term(x.a.name).kind;
        if (Array.isArray(kind)) {
          const word = x.b.k === "name" ? x.b.name : null;
          if (word === null || !kind.includes(word))
            fail(`${x.a.name} against no word of it`);
          return `(t.${x.a.name} ${x.op === "=" ? "===" : "!=="} ${JSON.stringify(word)})`;
        }
      }
      if (["=", "!=", "<", "<=", ">", ">="].includes(x.op))
        return `(${num(x.a)} ${x.op === "=" ? "===" : x.op === "!=" ? "!==" : x.op} ${num(x.b)})`;
    }
    return fail("a condition it cannot compile");
  };
  const body = bool(e);
  // A parameter the condition does not read is named `_`, as `noUnusedParameters` asks.
  const reads = (p: string): boolean => new RegExp(`\\b${p}[.[]`).test(body);
  const ring = reads("s") ? `, ${reads("r") ? "r" : "_r"}, s` : reads("r") ? ", r" : "";
  return `(${reads("t") ? "t" : "_t"}, ${reads("m") ? "m" : "_m"}${ring}) => ${body}`;
}

/** The module's planner steps: each kind's clauses in `STATED`'s form, what
 * the planner supplies, and each wording's `when` as code. `stepVoice` is the
 * specifier the module imports `step-voice.ts` by. */
export function stepsBlock(
  steps: readonly Step[],
  own: readonly Technique[],
  words: GameWords | null,
  stepVoice: string,
): string[] {
  if (steps.length === 0) return [];
  for (const s of steps) {
    // A step is a kind of its own, but one name must not have the technique's
    // stated words and the planner's both.
    if (
      own.some((t) => t.id === s.id && t.says?.variants.some((v) => v.words.length > 0))
    )
      throw new CompileError(
        `${s.id}: a technique states its words and a step has the name`,
      );
    checkStep(s);
    // A clause term speaks another step's move, which must be one.
    for (const t of s.terms)
      for (const id of clauseOf(t.kind) ?? []) {
        const named = steps.find((x) => x.id === id);
        if (named === undefined)
          throw new CompileError(
            `${s.id}: its clause term ${t.name} names ${id}, no step`,
          );
        if (named.words.some((w) => w.clauses.move === undefined))
          throw new CompileError(
            `${s.id}: its clause term ${t.name} names ${id}, which states no move in some wording`,
          );
      }
  }
  const clauseTerms = (s: Step): string[] =>
    s.terms.filter((t) => clauseOf(t.kind) !== null).map((t) => t.name);
  const sortsOf = (s: Step, role: string): string[] =>
    s.marks.filter((m) => m.role === role).map((m) => m.sort);
  return [
    "/** What the planner supplies for each kind of step it emits, over the",
    " * elements `E` it marks: its terms, and the elements marked by role and sort. */",
    // A game whose steps mark nothing (Flood's) reads no element type.
    `export interface StepsById<${steps.some((s) => s.marks.length > 0 || clauseTerms(s).length > 0) ? "E" : "_E"}> {`,
    ...steps.map((s) => {
      const roles = [...new Set(s.marks.map((m) => m.role))];
      const marks = roles
        .map(
          (r) =>
            `${r}: { ${sortsOf(s, r)
              .map((x) => `${x}: readonly E[]`)
              .join("; ")} }`,
        )
        .join("; ");
      const terms =
        s.terms.length === 0
          ? "Record<string, never>"
          : `{ ${s.terms
              .map((t) => `${t.name}: ${stepTermType(t.kind)}`)
              .join("; ")} }`;
      return `  ${s.id}: { ring: ${JSON.stringify(s.ring)}; terms: ${terms}; marks: { ${marks} } };`;
    }),
    "}",
    "",
    "/** Each kind of step the planner emits: its clauses by wording, the",
    " * condition under which each wording is the one said (`null`: always), and",
    " * its terms that are another step's clause, which the voice speaks. */",
    "export const STEPS: {",
    "  readonly [K in keyof StepsById<unknown>]: {",
    '    readonly ring: StepsById<unknown>[K]["ring"];',
    "    readonly spoken?: readonly string[];",
    "    readonly clauses: readonly { aim?: string; answers?: string; look?: string; follows?: string; move?: string; effect?: string; again?: string; later?: string; long?: string }[];",
    "    readonly when: readonly (",
    "      | null",
    "      | ((",
    '          t: StepsById<unknown>[K]["terms"],',
    '          m: StepsById<unknown>[K]["marks"],',
    "          r: readonly unknown[],",
    "          s: Readonly<Record<string, readonly unknown[]>>,",
    "        ) => boolean)",
    "    )[];",
    "  };",
    "} = {",
    ...steps.flatMap((s) => [
      `  ${s.id}: {`,
      `    ring: ${JSON.stringify(s.ring)},`,
      ...(clauseTerms(s).length === 0
        ? []
        : [`    spoken: ${JSON.stringify(clauseTerms(s))},`]),
      `    clauses: ${JSON.stringify(s.words.map(spokenClauses))},`,
      `    when: [${s.words.map((w) => (w.when === null ? "null" : stepWhen(s, w.when, "when"))).join(", ")}],`,
      "  },",
    ]),
    "};",
    "",
    `import { ${steps.some((s) => clauseTerms(s).length > 0) ? "type StepClause, " : ""}stepVoice, type StepVoice, ${steps.some((s) => s.terms.some((t) => t.kind === "unit")) ? "type Unit, " : ""}type Voice } from "${stepVoice}";`,
    "",
    "/** The steps, spoken: a game declares once what its marks are drawn on and",
    " * how its values print, the description's nouns filled in. */",
    "export const voice = <E>(v: Voice<E>): StepVoice<StepsById<E>, E> =>",
    `  stepVoice<StepsById<E>, E>(STEPS, { ${[
      ...(words?.cell === undefined ? [] : [`noun: ${JSON.stringify(words.cell)}, `]),
      ...(words?.alongside === undefined
        ? []
        : [`alongside: ${JSON.stringify(words.alongside)}, `]),
    ].join("")}...v });`,
    "",
  ];
}

/** The index of the first of `words` whose `when` holds, as code; the last
 * has none and holds always. */
export function wordingIndex(
  words: readonly Wording[],
  label: string,
  compiled: (e: Expr) => Val,
): string {
  const holds = words.slice(0, -1).map((w, i) => {
    const v = compiled(w.when as Expr);
    expect(v, "bool", `${label} wording ${i} when`);
    return `${v.code} ? ${i} : `;
  });
  return `(${holds.join("")}${words.length - 1})`;
}
