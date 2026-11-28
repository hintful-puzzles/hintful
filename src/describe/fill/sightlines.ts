/**
 * `deal.sample.sightlines`: the sightlines a build gives unique fillings
 * before it builds the rest (`engine/fill/deal/sightlines.ts`). The deal
 * holds the kinds; the module gets `sightClue`, the value the end kind's
 * clue at a slot derives from a board, and `sightlinesOpen`, how many cells
 * the tier leaves the build.
 */

import { compileExpr } from "../compile-expr.ts";
import {
  type ClueKind,
  CompileError,
  type Env,
  Out,
  type Val,
} from "../compile-sorts.ts";
import type { Description, DescriptionJson } from "../description.ts";
import { type Expr, parse } from "../expr.ts";
import { solvedFor } from "./derive.ts";
import { answerEnv, param } from "./emit.ts";

/** What `sample.sightlines` says, as the description writes it. */
interface SightlinesJson {
  readonly through: string;
  readonly ends: string;
  readonly open: string | Readonly<Record<string, string>>;
}

/** The sample's sightlines, or `null` where it gives none. */
function sightlinesJson(json: DescriptionJson): SightlinesJson | null {
  const sample = json.deal?.sample;
  if (sample === undefined || !("sightlines" in sample)) return null;
  return (sample.sightlines as SightlinesJson | undefined) ?? null;
}

/**
 * The module's `sightClue` and `sightlinesOpen`. Refused where the sample
 * builds no answer; where `through` is no kind at a cell, or `ends` no kind
 * at a slot whose meaning is `E = v`; and where `open` names a tier the
 * description lacks, leaves one out, or is no number.
 */
export function sightlinesOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const s = sightlinesJson(json);
  if (s === null) return [];
  const sample = json.deal?.sample;
  if (sample === undefined || !("build" in sample))
    throw new CompileError(
      "deal sample sightlines: unique sightlines a build lays, and no build",
    );
  if (d.clueKinds.get(s.through)?.at !== "cell")
    throw new CompileError(
      `deal sample sightlines: ${s.through} is no clue kind at a cell`,
    );
  const ends = d.clueKinds.get(s.ends);
  const solved = ends === undefined ? null : solvedFor(measured(ends.means));
  if (ends?.at !== "slot" || solved === null)
    throw new CompileError(
      `deal sample sightlines: ${s.ends} is no clue kind at a slot meaning \`E = v\``,
    );
  return [...clueOf(s.ends, solved, env), ...openOf(json, s.open, env, measured)];
}

/** `sightClue(g, sp, cl, at)`: the value a clue of `kind` at slot `at`
 * derives from board `g`, its meaning solved for it. */
function clueOf(kind: string, solved: Expr, env: Env): string[] {
  const scratch: string[] = [];
  const out = new Out(1);
  const sorts = env.clues.get(kind) as ClueKind;
  const e = compileExpr(
    solved,
    new Map<string, Val>([["at", { code: "at", sort: sorts.at }]]),
    answerEnv(env, { yes: false }, scratch),
    out,
  );
  const body = [
    ...scratch.map((l) => `  ${l}`),
    ...out.text(),
    `  return Number(${e.code});`,
  ];
  return [
    "",
    `/** The value a ${kind} clue at slot \`at\` derives from the board \`g\`. */`,
    `export function sightClue(${[
      "g: ArrayLike<number>",
      param("sp", "GridSpace", body),
      param("cl", "Dealt", body),
      param("at", "number", body),
    ].join(", ")}): number {`,
    ...body,
    "}",
  ];
}

/** `sightlinesOpen(sp, cl, tier, n)`: the most cells the sightlines leave
 * undecided at `tier`, `n` those the first cells leave. */
function openOf(
  json: DescriptionJson,
  open: SightlinesJson["open"],
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const tiers = json.tiers ?? [];
  const byTier: readonly (readonly [number, string])[] =
    typeof open === "string"
      ? [[-1, open]]
      : Object.entries(open).map(([tier, src]) => {
          const i = tiers.indexOf(tier);
          if (i < 0)
            throw new CompileError(`deal sample sightlines open: no tier ${tier}`);
          return [i, src] as const;
        });
  if (typeof open !== "string" && byTier.length !== tiers.length)
    throw new CompileError(
      "deal sample sightlines open: a formula a tier, and not every tier has one",
    );
  const scratch: string[] = [];
  const read = new Set<string>();
  const oenv = {
    ...answerEnv(env, { yes: false }, scratch),
    sizes: { names: env.sizes.names, read },
  };
  const lines: string[] = [];
  for (const [tier, src] of byTier) {
    const out = new Out(tier < 0 ? 1 : 2);
    const e = compileExpr(
      measured(parse(src)),
      new Map<string, Val>([["n", { code: "n", sort: { k: "num" } }]]),
      oenv,
      out,
    );
    if (e.sort.k !== "int" && e.sort.k !== "num")
      throw new CompileError(`deal sample sightlines open: ${src} is not a number`);
    const ret = [
      ...out.text(),
      `${tier < 0 ? "  " : "    "}return Math.floor(${e.code});`,
    ];
    lines.push(...(tier < 0 ? ret : [`  if (tier === ${tier}) {`, ...ret, "  }"]));
  }
  const body = [
    ...scratch.map((l) => `  ${l}`),
    ...lines,
    ...(typeof open === "string" ? [] : ["  return 0;"]),
  ];
  return [
    "",
    "/** The most cells the sightlines leave the build at `tier`, `n` those",
    " * the first cells leave (`deal.sample.sightlines.open`). */",
    `export function sightlinesOpen(${[
      param("sp", "GridSpace", body),
      param(
        "cl",
        read.size === 0
          ? "Dealt"
          : `Dealt & Readonly<Record<${[...read]
              .sort()
              .map((x) => JSON.stringify(x))
              .join(" | ")}, number>>`,
        body,
      ),
      param("tier", "number", body),
      param("n", "number", body),
    ].join(", ")}): number {`,
    ...body,
    "}",
  ];
}
