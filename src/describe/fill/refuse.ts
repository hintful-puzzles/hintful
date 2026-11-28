/**
 * `deal.refuse`: a board the deal draws again where a part of the ladder
 * alone places every square of the answer holding one value
 * (`engine/fill/deal/accept.ts`). Its techniques by id go in the deal, and
 * the value, a formula of the board's sizes, is written `refusePlaces`.
 */

import { compileExpr } from "../compile-expr.ts";
import { CompileError, type Env, Out } from "../compile-sorts.ts";
import { kindsRead } from "../compile-terms.ts";
import { type Description, type DescriptionJson, sampleOf } from "../description.ts";
import { type Expr, parse } from "../expr.ts";
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

/** A keep: one formula, or one a tier by its name. */
type Keep = string | Readonly<Record<string, string>>;

/**
 * `dealKeeps(sp, cl, tier)`, whether `deal.keep` holds of a board's clues
 * and sizes at tier `tier` as the answer derives them; and `firstKeeps`, the
 * same of `sample.first.keep` on the clues the first cells derive, which it
 * reads alone. Refused where a keep names a tier the description lacks or
 * leaves one out, or a formula is no truth; and a first cells' keep reading
 * a kind the domain does not, or kept by neither a build nor a uniform
 * sample.
 */
export function keepsOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const sample = sampleOf(json);
  const first = sample !== null && "first" in sample ? sample.first?.keep : undefined;
  if (
    first !== undefined &&
    !(sample !== null && ("build" in sample || "uniform" in sample))
  )
    throw new CompileError(
      "deal sample first keep: a layout a build or a uniform sample keeps, and neither",
    );
  if (first !== undefined) {
    const dealt = kindsRead(d.domain, d.defs);
    const sources = typeof first === "string" ? [first] : Object.values(first);
    for (const src of sources)
      for (const k of kindsRead(parse(src), d.defs))
        if (!dealt.has(k))
          throw new CompileError(
            `deal sample first keep: ${src} reads ${k}, which the first cells do not deal`,
          );
  }
  return [
    ...keepOf(json, env, measured, json.deal?.keep ?? null, "dealKeeps", "deal keep", [
      "/** Whether the deal keeps a board of these clues and sizes at `tier`",
      " * (`deal.keep`). */",
    ]),
    ...keepOf(
      json,
      env,
      measured,
      first ?? null,
      "firstKeeps",
      "deal sample first keep",
      [
        "/** Whether the build keeps first cells dealing these clues, of these",
        " * sizes, at `tier` (`deal.sample.first.keep`). */",
      ],
    ),
  ];
}

function keepOf(
  json: DescriptionJson,
  env: Env,
  measured: (e: Expr) => Expr,
  keep: Keep | null,
  name: string,
  what: string,
  doc: readonly string[],
): string[] {
  if (keep === null) return [];
  const tiers = json.tiers ?? [];
  const byTier: readonly (readonly [number, string])[] =
    typeof keep === "string"
      ? [[-1, keep]]
      : Object.entries(keep).map(([tier, src]) => {
          const i = tiers.indexOf(tier);
          if (i < 0) throw new CompileError(`${what}: no tier ${tier}`);
          return [i, src] as const;
        });
  if (typeof keep !== "string" && byTier.length !== tiers.length)
    throw new CompileError(`${what}: a formula a tier, and not every tier has one`);
  const scratch: string[] = [];
  const read = new Set<string>();
  const kenv = {
    ...answerEnv(env, { yes: false }, scratch),
    sizes: { names: env.sizes.names, read },
  };
  const lines: string[] = [];
  for (const [tier, src] of byTier) {
    const out = new Out(tier < 0 ? 1 : 2);
    const e = compileExpr(measured(parse(src)), new Map(), kenv, out);
    if (e.sort.k !== "bool") throw new CompileError(`${what}: ${src} is not a truth`);
    const ret = [...out.text(), `${tier < 0 ? "  " : "    "}return ${e.code};`];
    lines.push(...(tier < 0 ? ret : [`  if (tier === ${tier}) {`, ...ret, "  }"]));
  }
  const body = [
    ...scratch.map((s) => `  ${s}`),
    ...lines,
    ...(typeof keep === "string" ? [] : ["  return true;"]),
  ];
  return [
    "",
    ...doc,
    `export function ${name}(${[
      param("sp", "GridSpace", body),
      param(
        "cl",
        read.size === 0
          ? "Dealt"
          : `Dealt & Readonly<Record<${[...read]
              .sort()
              .map((n) => JSON.stringify(n))
              .join(" | ")}, number>>`,
        body,
      ),
      param("tier", "number", body),
    ].join(", ")}): boolean {`,
    ...body,
    "}",
  ];
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
