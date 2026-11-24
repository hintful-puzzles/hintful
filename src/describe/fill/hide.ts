/**
 * The hide of a fill game's deal (`engine/fill/deal/hide.ts`), `deal.hide`:
 * the kinds it hides, in its order, and by kind whether it is tried first,
 * the tier it is first hidden at, the boards it is hidden whole on, the
 * formula ranking its clues and the flag it is hidden under; and the
 * symmetry of the clues it leaves.
 */

import { SYMMETRIES, type Symmetry } from "../../engine/generate/symmetry.ts";
import { compileExpr } from "../compile-expr.ts";
import {
  type ClueKind,
  CompileError,
  type Env,
  Out,
  type Val,
} from "../compile-sorts.ts";
import type { Description, DescriptionJson, SizeBoundsJson } from "../description.ts";
import type { Expr } from "../expr.ts";
import { parse } from "../expr.ts";
import { answerEnv, param, tierIndex } from "./emit.ts";
import { dealFlag, type SettingOut } from "./settings.ts";

/** A kind the deal hides as `FillDeal.hide` holds it: `by` is compiled
 * into `hideRank`, and the rest are the deal's. */
export interface HiddenKindOut {
  kind: string;
  first?: true;
  from?: number;
  whole?: { below: number; bounds: SizeBoundsJson; with?: string };
  when?: string;
}

/** What a kind's entry in `deal.hide` may say. */
const PROPERTIES = ["first", "by", "from", "whole", "when"] as const;

/** `deal.hide`'s entries, in its order, each with its properties: one kind,
 * a list of them, or by kind its properties (`null` for none). */
function hideEntries(json: DescriptionJson): [string, Record<string, unknown>][] {
  const h = json.deal?.["hide"];
  if (h === undefined) return [];
  if (typeof h === "string") return [[h, {}]];
  if (Array.isArray(h) && h.every((k) => typeof k === "string"))
    return h.map((k: string) => [k, {}]);
  if (typeof h === "object" && h !== null && !Array.isArray(h))
    return Object.entries(h as Record<string, unknown>).map(([k, v]) => {
      if (v !== null && (typeof v !== "object" || Array.isArray(v)))
        throw new CompileError(`deal hide: ${k}'s properties, or none`);
      return [k, (v ?? {}) as Record<string, unknown>];
    });
  throw new CompileError(
    "deal hide: a clue kind, a list of them, or their properties by kind",
  );
}

/** `deal.hide` as the deal reads it; `null` where it hides nothing. */
export function hideOf(
  json: DescriptionJson,
  d: Description,
  settings: readonly SettingOut[],
): HiddenKindOut[] | null {
  const entries = hideEntries(json);
  if (entries.length === 0) return null;
  const tiers = json.tiers ?? [];
  const out = entries.map(([kind, props]): HiddenKindOut => {
    const c = d.clueKinds.get(kind);
    if (c === undefined) throw new CompileError(`deal hide: no clue kind ${kind}`);
    if (c.complete)
      throw new CompileError(`deal hide: ${kind} is complete, so none of it is hidden`);
    for (const p of Object.keys(props))
      if (!(PROPERTIES as readonly string[]).includes(p))
        throw new CompileError(
          `deal hide: ${kind}'s ${p} is none of ${PROPERTIES.join(", ")}`,
        );
    const { first, from, whole, when } = props;
    if (first !== undefined && first !== true)
      throw new CompileError(`deal hide: ${kind}'s first is true, or absent`);
    return {
      kind,
      ...(first === true ? { first: true as const } : {}),
      ...(from === undefined ? {} : { from: fromOf(kind, from, tiers) }),
      ...(whole === undefined ? {} : { whole: wholeOf(json, kind, whole, tiers) }),
      ...(when === undefined
        ? {}
        : { when: dealFlag(settings, String(when), `deal hide: ${kind}'s when`) }),
    };
  });
  const firsts = out.filter((h) => h.first === true).length;
  if (firsts === out.length && firsts > 0)
    throw new CompileError("deal hide: every kind first, and none after them");
  return out;
}

/** A kind's `from`: the tier, by its index, below which it is kept whole. */
function fromOf(kind: string, tier: unknown, tiers: readonly string[]): number {
  if (typeof tier !== "string")
    throw new CompileError(`deal hide: ${kind}'s from is a tier, by its name`);
  const i = tierIndex(tiers, tier, "deal hide");
  if (i === 0)
    throw new CompileError(`deal hide: ${kind} from the lowest tier is every tier`);
  return i;
}

const SIZE_MEASURES = ["sum", "area", "shorter", "longer"] as const;

/** A kind's `whole`: hidden whole on a board below a tier, by the tier's
 * index (past the last where none is named), with a variation on where one
 * is named, within the bounds. */
function wholeOf(
  json: DescriptionJson,
  kind: string,
  spec: unknown,
  tiers: readonly string[],
): { below: number; bounds: SizeBoundsJson; with?: string } {
  if (typeof spec !== "object" || spec === null || Array.isArray(spec))
    throw new CompileError(
      `deal hide: ${kind}'s whole is a tier, a variation and bounds`,
    );
  const {
    below,
    with: variation,
    ...bounds
  } = spec as { below?: unknown; with?: unknown } & SizeBoundsJson;
  if (below !== undefined && typeof below !== "string")
    throw new CompileError(`deal hide: ${kind} whole below a tier, by its name`);
  if (variation !== undefined && json.variations?.[variation as string] === undefined)
    throw new CompileError(
      `deal hide: ${kind} whole with ${String(variation)}, no variation`,
    );
  if (below === undefined && variation === undefined)
    throw new CompileError(`deal hide: ${kind} whole below a tier or with a variation`);
  for (const name of Object.keys(bounds))
    if (!(SIZE_MEASURES as readonly string[]).includes(name))
      throw new CompileError(`deal hide: ${kind}'s whole ${name} is no size bound`);
  const at = below === undefined ? tiers.length : tierIndex(tiers, below, "deal hide");
  if (at === 0)
    throw new CompileError(
      `deal hide: ${kind} whole below the lowest tier is no board`,
    );
  return {
    below: at,
    bounds,
    ...(variation === undefined ? {} : { with: variation as string }),
  };
}

/**
 * `hideRank(sp, cl, kind, at)`: where the hide puts a clue of `kind` at
 * `at`, by its `by`, a formula of `at`: a higher one is hidden first. None
 * where no kind states one.
 */
export function hideRankOf(
  json: DescriptionJson,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const by = hideEntries(json).filter(([, props]) => props["by"] !== undefined);
  if (by.length === 0) return [];
  const scratch: string[] = [];
  const henv = answerEnv(env, { yes: false }, scratch);
  const lines: string[] = [];
  for (const [kind, props] of by) {
    const src = props["by"];
    if (typeof src !== "string")
      throw new CompileError(`deal hide: ${kind}'s by is a formula of \`at\``);
    const sorts = env.clues.get(kind) as ClueKind;
    const out = new Out(2);
    const e = compileExpr(
      measured(parse(src)),
      new Map<string, Val>([["at", { code: "at", sort: sorts.at }]]),
      henv,
      out,
    );
    if (e.sort.k !== "int" && e.sort.k !== "num")
      throw new CompileError(`deal hide: ${kind}'s by is not a number`);
    lines.push(
      `  if (kind === ${JSON.stringify(kind)}) {`,
      ...out.text(),
      `    return Number(${e.code});`,
      "  }",
    );
  }
  const body = [...scratch.map((s) => `  ${s}`), ...lines, "  return 0;"];
  return [
    "",
    "/** Where the hide puts a clue of `kind` at `at` (its `by` in `deal.hide`):",
    " * a higher one is hidden first. */",
    `export function hideRank(${[
      param("sp", "GridSpace", body),
      param("cl", "Dealt", body),
      param("kind", "string", body),
      param("at", "number", body),
    ].join(", ")}): number {`,
    ...body,
    "}",
  ];
}

/** `deal.symmetric` as the deal reads it: a symmetry by its name, or the
 * setting whose choices name them; `null` where the deal keeps none. */
export function symmetricOf(
  symmetric: unknown,
  settings: readonly SettingOut[],
): Symmetry | { option: string } | null {
  if (symmetric === undefined) return null;
  if ((SYMMETRIES as readonly unknown[]).includes(symmetric))
    return symmetric as Symmetry;
  const s = settings.find((x) => x.id === symmetric);
  if (s?.kind === "choice" && s.choices.every((c) => c.symmetry !== undefined))
    return { option: s.id };
  throw new CompileError(
    `deal symmetric: ${String(symmetric)} is no symmetry (${SYMMETRIES.join(", ")}) nor a setting of them`,
  );
}
