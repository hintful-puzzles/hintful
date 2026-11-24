/**
 * The steps a fill game's deal takes after it derives the clues
 * (`engine/fill/deal/clue-steps.ts`): the Latin renumber, the first kind
 * kept at a place, and the one kind dealt a part, with how well a clue of
 * each suits a part.
 */

import { compileExpr } from "../compile-expr.ts";
import {
  type ClueKind,
  CompileError,
  type Env,
  expect,
  Out,
  type Val,
} from "../compile-sorts.ts";
import {
  type Description,
  type DescriptionJson,
  type OneKindJson,
  oneKindOf,
} from "../description.ts";
import type { Expr } from "../expr.ts";
import { parse } from "../expr.ts";
import { answerEnv, param, tierIndex } from "./emit.ts";
import { dealFlag, type SettingOut } from "./settings.ts";

/** `deal.latin`: a kind on every cell the deal numbers as a Latin square
 * and renumbers under `under` (`engine/fill/deal/latin-numbers.ts`), never derived
 * from the answer; `null` where it deals none. */
export function latinOf(
  json: DescriptionJson,
  d: Description,
): { readonly kind: string; readonly under: number } | null {
  const latin = json.deal?.["latin"];
  if (latin === undefined) return null;
  if (typeof latin !== "object" || latin === null)
    throw new CompileError("deal latin: { kind, under }");
  const { kind, under } = latin as { kind?: unknown; under?: unknown };
  if (typeof kind !== "string" || d.clueKinds.get(kind)?.at !== "cell")
    throw new CompileError(`deal latin: ${String(kind)} is no clue kind at a cell`);
  if (typeof under !== "number" || json.play?.values?.[String(under)] === undefined)
    throw new CompileError(
      `deal latin: under ${String(under)}, which is no value played`,
    );
  if (json.deal?.["hide"] !== undefined)
    throw new CompileError("deal latin: every number is shown, and none hidden");
  return { kind, under };
}

/** `deal.oneKind` with `pick: first`: kinds at one place of which each
 * element keeps the first the answer makes there; `null` where there is
 * none. */
export function firstKindOf(
  json: DescriptionJson,
  d: Description,
): readonly string[] | null {
  const one = oneKindOf(json);
  if (one?.pick !== "first") return null;
  const { kinds } = one;
  if (one.poor !== undefined || one.never !== undefined || one.alone !== undefined)
    throw new CompileError(
      "deal oneKind: poor, never and alone choose in turn, and it picks first",
    );
  const places = new Set(kinds.map((k) => d.clueKinds.get(k)?.at));
  for (const k of kinds) {
    const c = d.clueKinds.get(k);
    if (c === undefined) throw new CompileError(`deal oneKind: no clue kind ${k}`);
    if (c.complete)
      throw new CompileError(`deal oneKind: ${k} is complete, a clue at every element`);
  }
  if (places.size !== 1 || kinds.length < 2)
    throw new CompileError("deal oneKind: two kinds or more, at one place");
  return kinds;
}

/** `deal.oneKind`'s kinds, at the partition the deal divides, with the
 * setting that deals some alone; `null` where the deal deals every clue it
 * derives. */
export function oneKindDeal(
  json: DescriptionJson,
  d: Description,
  partition: string | null,
  settings: readonly SettingOut[],
): {
  json: OneKindJson;
  deal: {
    kinds: readonly string[];
    partition: string;
    alone?: { kinds: readonly string[]; when: string };
  };
} | null {
  const one = oneKindOf(json);
  if (one === null || one.pick === "first") return null;
  const { alone } = one;
  if (partition === null)
    throw new CompileError(
      "deal oneKind: kinds at the parts of a partition the deal divides",
    );
  for (const k of one.kinds)
    if (d.clueKinds.get(k)?.at !== partition)
      throw new CompileError(
        `deal oneKind: ${k} is no clue kind at a part of ${partition}`,
      );
  // Every clue at a part is one of them, as a part holds one.
  for (const [k, c] of d.clueKinds)
    if (c.at === partition && !one.kinds.includes(k))
      throw new CompileError(
        `deal oneKind: ${k} sits at a part, and is none of its kinds`,
      );
  for (const k of [...Object.keys(one.poor ?? {}), ...Object.keys(one.never ?? {})])
    if (!one.kinds.includes(k))
      throw new CompileError(`deal oneKind: ${k} is none of its kinds`);
  for (const k of alone?.kinds ?? [])
    if (!one.kinds.includes(k))
      throw new CompileError(`deal oneKind alone: ${k} is none of its kinds`);
  return {
    json: one,
    deal: {
      kinds: one.kinds,
      partition,
      ...(alone === undefined
        ? {}
        : {
            alone: {
              kinds: alone.kinds,
              when: dealFlag(settings, alone.when, "deal oneKind alone"),
            },
          }),
    },
  };
}

/**
 * `suits(sp, cl, kind, at, v, tier)`: how well a clue of `kind` valued `v`
 * suits part `at` on a board of tier `tier`, by `deal.oneKind`'s formulas: 0
 * where `never` refuses it, 1 where it is `poor` (from its tier), else 2.
 */
export function suitsOf(
  one: OneKindJson,
  env: Env,
  measured: (e: Expr) => Expr,
  tiers: readonly string[],
): string[] {
  const scratch: string[] = [];
  const out = new Out(1);
  const henv = answerEnv(env, { yes: false }, scratch);
  const scope = (kind: string) => {
    const sorts = env.clues.get(kind) as ClueKind;
    return new Map<string, Val>([
      ["at", { code: "at", sort: sorts.at }],
      ["v", { code: "v", sort: sorts.v }],
    ]);
  };
  const test = (kind: string, src: string, what: string): string => {
    const e = compileExpr(measured(parse(src)), scope(kind), henv, out);
    expect(e, "bool", `deal oneKind: ${what} of ${kind}`);
    return e.code;
  };
  for (const [kind, src] of Object.entries(one.never ?? {}))
    out.emit(
      `if (kind === ${JSON.stringify(kind)} && (${test(kind, src, "never")})) return 0;`,
    );
  for (const [kind, p] of Object.entries(one.poor ?? {})) {
    const { when, from } = typeof p === "string" ? { when: p, from: null } : p;
    const tier = from === null ? null : tierIndex(tiers, from, "deal oneKind poor");
    out.emit(
      `if (kind === ${JSON.stringify(kind)}${tier === null ? "" : ` && tier >= ${tier}`} && (${test(kind, when, "poor")})) return 1;`,
    );
  }
  const body = [...scratch.map((s) => `  ${s}`), ...out.text(), "  return 2;"];
  return [
    "",
    "/** How well a clue of `kind` valued `v` suits part `at` on a board of tier",
    " * `tier` (`deal.oneKind`): 0 never, 1 poor, 2 well. */",
    `export function suits(${[
      param("sp", "GridSpace", body),
      param("cl", "Dealt", body),
      param("kind", "string", body),
      param("at", "number", body),
      param("v", "number", body),
      param("tier", "number", body),
    ].join(", ")}): number {`,
    ...body,
    "}",
  ];
}
