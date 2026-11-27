/**
 * `deal.refuse`: a board the deal draws again where a part of the ladder
 * alone places every square of the answer holding one value
 * (`engine/fill/deal/accept.ts`). Its techniques by id go in the deal, and
 * the value, a formula of the board's sizes, is written `refusePlaces`.
 */

import { compileExpr } from "../compile-expr.ts";
import { CompileError, type Env, Out } from "../compile-sorts.ts";
import type { Description, DescriptionJson } from "../description.ts";
import { parse } from "../expr.ts";
import { answerEnv, param } from "./emit.ts";

/** `deal.refuse`'s techniques, each one the ladder holds; `null` where the
 * deal refuses no such board. */
export function refuseOf(
  json: DescriptionJson,
  d: Description,
): { by: readonly string[] } | null {
  const refuse = json.deal?.refuse;
  if (refuse === undefined) return null;
  if (json.answer.value.sort !== "cell")
    throw new CompileError(
      "deal refuse: the squares of a value, on no answer at cells",
    );
  const ids = new Set(d.techniques.map((t) => t.id));
  for (const id of refuse.by)
    if (!ids.has(id)) throw new CompileError(`deal refuse: no technique ${id}`);
  return { by: refuse.by };
}

/** `refusePlaces(sp, cl)`: the value whose squares `deal.refuse`'s
 * techniques must not place alone, on a board of these sizes. */
export function refusePlacesOf(json: DescriptionJson, env: Env): string[] {
  const refuse = json.deal?.refuse;
  if (refuse === undefined) return [];
  const read = new Set<string>();
  const scratch: string[] = [];
  const out = new Out(1);
  const genv = {
    ...answerEnv(env, { yes: false }, scratch),
    sizes: { names: env.sizes.names, read },
  };
  const got = compileExpr(parse(refuse.places), new Map(), genv, out);
  if (got.sort.k !== "int" && got.sort.k !== "num")
    throw new CompileError(`deal refuse: ${refuse.places} is not a number`);
  const body = [
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    `  return ${got.code};`,
  ];
  const sizes = [...read].sort().map((n) => JSON.stringify(n));
  return [
    "",
    "/** The value whose squares the deal's refused techniques must not place",
    " * alone, on a board of these sizes. */",
    `export function refusePlaces(${[
      param("sp", "GridSpace", body),
      sizes.length === 0
        ? "_cl: object"
        : `cl: Readonly<Record<${sizes.join(" | ")}, number>>`,
    ].join(", ")}): number {`,
    ...body,
    "}",
  ];
}
