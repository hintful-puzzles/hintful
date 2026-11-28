/**
 * What every part of the fill compiler (`compile-fill.ts`) writes its
 * functions and objects with.
 */

import { compileExpr } from "../compile-expr.ts";
import { CompileError, type Env, Out } from "../compile-sorts.ts";
import { parse } from "../expr.ts";

/** A compiling environment that reads a whole board `g`, as the answer
 * check does. */
export function answerEnv(
  env: Env,
  readsClues: { yes: boolean },
  scratch: string[],
): Env {
  return {
    ...env,
    answer: { repeats: false },
    readsClues,
    scratch,
    memo: false,
    hoist: null,
    boardRoot: null,
    epoch: null,
    concluding: false,
  };
}

/**
 * A module function `name(sp, cl)` of the board's space and sizes, `doc` its
 * JSDoc, returning what `returned` writes of its terms: each a number, a
 * formula of the sizes, or absent (`null`). A formula that is no number is
 * refused, `where` naming it.
 */
export function sizesFunction(
  env: Env,
  where: string,
  doc: string,
  name: string,
  type: string,
  returned: (term: (v?: number | string) => string) => string,
): string[] {
  const read = new Set<string>();
  const scratch: string[] = [];
  const out = new Out(1);
  const genv = {
    ...answerEnv(env, { yes: false }, scratch),
    sizes: { names: env.sizes.names, read },
  };
  const term = (v?: number | string): string => {
    if (v === undefined) return "null";
    if (typeof v === "number") return String(v);
    const got = compileExpr(parse(v), new Map(), genv, out);
    if (got.sort.k !== "int" && got.sort.k !== "num")
      throw new CompileError(`${where}: ${v} is not a number`);
    return got.code;
  };
  const value = returned(term);
  const body = [...scratch.map((s) => `  ${s}`), ...out.text(), `  return ${value};`];
  const sizes = [...read].sort().map((n) => JSON.stringify(n));
  return [
    "",
    doc,
    `export function ${name}(${[
      param("sp", "GridSpace", body),
      sizes.length === 0
        ? "_cl: object"
        : `cl: Readonly<Record<${sizes.join(" | ")}, number>>`,
    ].join(", ")}): ${type} {`,
    ...body,
    "}",
  ];
}

/** A function's parameter, `_`-prefixed where its body leaves it unread. */
export const param = (name: string, type: string, body: readonly string[]): string =>
  body.some((l) => new RegExp(`\\b${name}\\b`).test(l))
    ? `${name}: ${type}`
    : `_${name}: ${type}`;

/** `{ [key]: value }` to spread into a module's object, or nothing where
 * `value` is absent, so the module holds no `null` field. */
export function present<K extends string, V>(
  key: K,
  value: V | null,
): Partial<Record<K, V>> {
  return value === null ? {} : ({ [key]: value } as Record<K, V>);
}

/** The index of tier `name`, refused where there is no such tier. */
export function tierIndex(
  tiers: readonly string[],
  name: string,
  where: string,
): number {
  const i = tiers.indexOf(name);
  if (i < 0) throw new CompileError(`${where}: ${name} is no tier`);
  return i;
}
