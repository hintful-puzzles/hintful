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
import { kindsRead } from "../compile-terms.ts";
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
  whole?: {
    below: number;
    bounds: SizeBoundsJson;
    with?: string;
    ruleset?: { setting: string; choice: number };
  };
  when?: string;
  after?: string;
}

/** What a kind's entry in `deal.hide` may say. */
type HideJson = NonNullable<NonNullable<DescriptionJson["deal"]>["hide"]>;
type HideProps = NonNullable<Exclude<HideJson, string | string[]>[string]>;

/** `deal.hide`'s entries, in its order, each with its properties: one kind,
 * a list of them, or by kind its properties (`null` for none). */
function hideEntries(json: DescriptionJson): [string, HideProps][] {
  const h = json.deal?.hide;
  if (h === undefined) return [];
  if (typeof h === "string") return [[h, {}]];
  if (Array.isArray(h)) return h.map((k) => [k, {}]);
  return Object.entries(h).map(([k, v]) => [k, v ?? {}]);
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
    const { first, from, whole, when, after } = props;
    if (after !== undefined) {
      const by = entries.find(([k]) => k === after && k !== kind);
      if (by === undefined)
        throw new CompileError(
          `deal hide: ${kind} after ${after}, no other kind hidden`,
        );
      if (d.clueKinds.get(after)?.at !== c.at)
        throw new CompileError(`deal hide: ${kind} after ${after}, at other places`);
      if (by[1].after !== undefined)
        throw new CompileError(
          `deal hide: ${kind} after ${after}, itself after another`,
        );
    }
    return {
      kind,
      ...(first === true ? { first: true as const } : {}),
      ...(from === undefined ? {} : { from: fromOf(kind, from, tiers) }),
      ...(whole === undefined
        ? {}
        : { whole: wholeOf(json, settings, kind, whole, tiers) }),
      ...(when === undefined
        ? {}
        : { when: dealFlag(settings, when, `deal hide: ${kind}'s when`) }),
      ...(after === undefined ? {} : { after }),
    };
  });
  const firsts = out.filter((h) => h.first === true).length;
  if (firsts === out.length && firsts > 0)
    throw new CompileError("deal hide: every kind first, and none after them");
  const read = readByTechniques(d);
  for (const { kind } of out)
    if (!read.has(kind) && !isGiven(d.clueKinds.get(kind)?.means ?? null))
      throw new CompileError(
        `deal hide: no technique reads ${kind}, so the hide keeps none of it`,
      );
  return out;
}

const GIVEN = JSON.stringify(parse("value(at) = v"));

/** Whether a kind means the answer's value at its cell: a given, which a
 * technique reads as the value placed there. */
const isGiven = (means: Expr | null): boolean => JSON.stringify(means) === GIVEN;

/** The kinds a technique reads, or the domain every tier's notes start
 * from. The hide keeps a clue only where the ladder read it, so a kind none
 * reads is hidden whole, and a fixture of it tests nothing of its deal. */
function readByTechniques(d: Description): Set<string> {
  const read = kindsRead(d.domain, d.defs);
  for (const t of d.techniques)
    for (const e of [
      ...t.binders.flatMap((b) => [b.of, b.where]),
      t.premise,
      t.conclude,
    ])
      if (e !== null) kindsRead(e, d.defs, read);
  return read;
}

/** A kind's `from`: the tier, by its index, below which it is kept whole. */
function fromOf(kind: string, tier: string, tiers: readonly string[]): number {
  const i = tierIndex(tiers, tier, "deal hide");
  if (i === 0)
    throw new CompileError(`deal hide: ${kind} from the lowest tier is every tier`);
  return i;
}

/** A kind's `whole`: hidden whole on a board below a tier, by the tier's
 * index (past the last where none is named), with a variation on or of a
 * ruleset where one is named, within the bounds. */
function wholeOf(
  json: DescriptionJson,
  settings: readonly SettingOut[],
  kind: string,
  spec: NonNullable<HideProps["whole"]>,
  tiers: readonly string[],
): NonNullable<HiddenKindOut["whole"]> {
  const { below, with: named, ...bounds } = spec;
  const ruleset = named === undefined ? null : rulesetNamed(settings, named);
  if (named !== undefined && ruleset === null && json.variations?.[named] === undefined)
    throw new CompileError(
      `deal hide: ${kind} whole with ${named}, no variation or ruleset`,
    );
  if (below === undefined && named === undefined)
    throw new CompileError(
      `deal hide: ${kind} whole below a tier, or with a variation or ruleset`,
    );
  const at = below === undefined ? tiers.length : tierIndex(tiers, below, "deal hide");
  if (at === 0)
    throw new CompileError(
      `deal hide: ${kind} whole below the lowest tier is no board`,
    );
  return {
    below: at,
    bounds,
    ...(named === undefined ? {} : ruleset === null ? { with: named } : { ruleset }),
  };
}

/** The ruleset of name `name`, by its setting and its choice's index; `null`
 * where no choice of a size is so named. */
function rulesetNamed(
  settings: readonly SettingOut[],
  name: string,
): { setting: string; choice: number } | null {
  for (const s of settings) {
    if (s.kind !== "choice" || s.gives !== "size") continue;
    const choice = s.choices.findIndex((c) => c.name === name);
    if (choice >= 0) return { setting: s.id, choice };
  }
  return null;
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
  const by = hideEntries(json).flatMap(([kind, { by: src }]) =>
    src === undefined ? [] : [{ kind, src }],
  );
  if (by.length === 0) return [];
  const scratch: string[] = [];
  const henv = answerEnv(env, { yes: false }, scratch);
  const lines: string[] = [];
  for (const { kind, src } of by) {
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
