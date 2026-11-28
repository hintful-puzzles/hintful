/**
 * `deal.records`: a clue at the board dealt one record a binding (Crossing's
 * numbers, a run's digits), and the sites each binding reads its list off,
 * which typing goes along (`play.along`).
 */

import { bindingLoops, compileExpr } from "../compile-expr.ts";
import {
  CompileError,
  type Env,
  expect,
  isArray,
  isSetOf,
  Out,
} from "../compile-sorts.ts";
import {
  type Description,
  type DescriptionJson,
  parseBinders,
} from "../description.ts";
import type { Expr } from "../expr.ts";
import { parse } from "../expr.ts";
import { answerEnv, param } from "./emit.ts";

/** `deal.records`: by clue kind at the board, the binding a record is read
 * at and a formula of it a field. */
export function recordsOf(
  json: DescriptionJson,
): Readonly<Record<string, Readonly<Record<string, string>>>> {
  return (json.deal?.records ?? {}) as Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
}

/**
 * The records a clue at the board deals one a binding of `deal.records`
 * (Crossing's numbers, a run's digits): each field its formula of the
 * binding, a list field the answer's values along the ordered cells its
 * formula gives; then sorted, field by field, a list shorter first and then
 * member by member, so the order says nothing of where each was read. The
 * binding may read the kinds `dealt` before it, as a cell's kind may.
 */
export function recordsBound(
  kind: string,
  c: Description["clueKinds"] extends ReadonlyMap<string, infer K> ? K : never,
  bound: Readonly<Record<string, string>>,
  dealt: readonly string[],
  env: Env,
  measured: (e: Expr) => Expr,
  derive: Out,
): string {
  const refuse = (why: string): never => {
    throw new CompileError(`deal records ${kind}: ${why}`);
  };
  const { for: binding, ...given } = bound;
  const fields = [...c.fields];
  for (const f of Object.keys(given))
    if (!c.fields.has(f)) refuse(`${f} is no field of the clue`);
  for (const [f, x] of fields) {
    if (given[f] === undefined) refuse(`the field ${f} is read off no formula`);
    if (x.at !== null)
      refuse(`the field ${f} is at an element, which no binding gives`);
  }
  const readsClues = { yes: false };
  const scratch: string[] = [];
  const henv = answerEnv(env, readsClues, scratch);
  const loops = new Out(0);
  const at = (f: string): string => `${kind}_${f}`;
  bindingLoops(
    parseBinders(binding).map((b) => ({
      ...b,
      of: measured(b.of),
      where: b.where === null ? null : measured(b.where),
    })),
    new Map(),
    henv,
    loops,
    (sc) => {
      for (const [f, x] of fields) {
        const v = compileExpr(measured(parse(given[f] as string)), sc, henv, loops);
        if (!x.list) {
          expect(v, "num", `deal records ${kind}.${f}`);
          loops.emit(`${at(f)}.push(${v.code});`);
          continue;
        }
        if (!isArray(v.sort) || !isSetOf(v.sort, "cell"))
          refuse(`the list field ${f} is read off an ordered set of cells`);
        loops.emit(`${at(f)}.push(Int32Array.from(${v.code}, (_x) => g[_x]));`);
      }
    },
  );
  for (const [f, x] of fields)
    derive.emit(`const ${at(f)}: ${x.list ? "Int32Array" : "number"}[] = [];`);
  // The clues dealt so far, which the binding reads where it reads any.
  const handed = `cl_${kind}`;
  if (readsClues.yes)
    derive.emit(
      `const ${handed} = { ${[...dealt, ...[...env.sizes.read].map((n) => `${n}: sizes.${n}`)].join(", ")} } as unknown as Dealt;`,
    );
  // The binding runs in `deriveClues`, which holds no `cl`: a clue read, and
  // the clues handed to a definition that reads one (Crossing's runs between
  // its walls), are the ones dealt so far.
  const handedFor = (text: string): string => text.replace(/\bcl\b/g, handed);
  for (const e of loops.entries)
    for (const line of "text" in e ? [e] : e.lines) line.text = handedFor(line.text);
  for (const s of scratch) derive.emit(handedFor(s));
  derive.append(loops);
  // Each record's place in the sorted order, its fields compared in turn.
  const order = `_order_${kind}`;
  derive.emit(
    `const ${order} = ${at(fields[0][0])}.map((_r, _i) => _i).sort((_a, _b) => ${fields
      .map(([f, x]) =>
        x.list
          ? `compareLists(${at(f)}[_a], ${at(f)}[_b])`
          : `${at(f)}[_a] - ${at(f)}[_b]`,
      )
      .join(" || ")});`,
  );
  if (fields.some(([, x]) => x.list)) env.used.add("compareLists");
  return `${kind}: { n: ${order}.length, ${fields
    .map(([f]) => `${f}: ${order}.map((_i) => ${at(f)}[_i])`)
    .join(", ")} }`;
}

/**
 * `recordSites(sp, cl)`: the ordered cells each binding of `deal.records`
 * for the list `kind` reads its list field off (Crossing's runs), for
 * typing along them (`play.along`). A site is read off the clues alone, so
 * a binding or a formula that reads the values is refused, and so is a
 * list the deal reads off no binding.
 */
export function recordSitesOf(
  json: DescriptionJson,
  d: Description,
  kind: string,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const refuse = (why: string): never => {
    throw new CompileError(`play along: ${why}`);
  };
  const bound = recordsOf(json)[kind];
  if (bound === undefined) refuse(`the deal reads ${kind} off no \`deal.records\``);
  const { for: binding, ...given } = bound;
  const c = d.clueKinds.get(kind);
  const [field] = [...(c?.fields ?? [])].filter(([, x]) => x.list).map(([f]) => f);
  if (field === undefined || given[field] === undefined)
    refuse(`${kind} has no list field read off a binding`);
  const scratch: string[] = [];
  const henv = answerEnv(env, { yes: false }, scratch);
  const loops = new Out(1);
  bindingLoops(
    parseBinders(binding).map((b) => ({
      ...b,
      of: measured(b.of),
      where: b.where === null ? null : measured(b.where),
    })),
    new Map(),
    henv,
    loops,
    (sc) => {
      const v = compileExpr(measured(parse(given[field] as string)), sc, henv, loops);
      if (!isArray(v.sort) || !isSetOf(v.sort, "cell"))
        refuse(`${kind}'s ${field} is read off no ordered set of cells`);
      loops.emit(`_sites.push(Int32Array.from(${v.code}));`);
    },
  );
  const body = [
    ...scratch.map((s) => `  ${s}`),
    "  const _sites: Int32Array[] = [];",
    ...loops.text(),
    "  return _sites;",
  ];
  if (body.some((l) => /\bg\b/.test(l)))
    refuse(`${kind}'s sites read the values, and a site is the clues'`);
  return [
    "",
    `/** The ordered cells each ${kind} record is read along, one a binding of`,
    " * `deal.records`: the sites typing goes along (`play.along`). */",
    `export function recordSites(${param("sp", "GridSpace", body)}, ${param("cl", "Dealt", body)}): Int32Array[] {`,
    ...body,
    "}",
  ];
}
