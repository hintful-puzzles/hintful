/**
 * The hide of a fill game's deal (`engine/fill/deal/hide.ts`): which kinds
 * it hides, in what order and from which tier, which it hides whole, where
 * a formula ranks a clue, the setting that hides one more kind, and the
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
import type { Letters } from "./letters.ts";

/** `deal.hide`, one kind or several, those tried before the rest
 * (`hideFirst`), and the tier each is first hidden at (`hideFrom`). */
export function hideOf(
  json: DescriptionJson,
  d: Description,
): {
  hide: string | readonly string[] | null;
  hideFirst: readonly string[] | null;
  hideFrom: Record<string, number> | null;
  hideWhole: Record<string, HideWhole> | null;
} {
  const hideJson = json.deal?.["hide"];
  // One kind, or several hidden in one random order.
  const hide =
    typeof hideJson === "string" ||
    (Array.isArray(hideJson) && hideJson.every((k) => typeof k === "string"))
      ? (hideJson as string | readonly string[])
      : null;
  if (hideJson !== undefined && hide === null)
    throw new CompileError("deal hide: a clue kind, or a list of them");
  const kinds = typeof hide === "string" ? [hide] : (hide ?? []);
  for (const k of kinds) {
    const c = d.clueKinds.get(k);
    if (c === undefined) throw new CompileError(`deal hide: no clue kind ${k}`);
    if (c.complete)
      throw new CompileError(`deal hide: ${k} is complete, so none of it is hidden`);
  }
  const first = json.deal?.["hideFirst"];
  const hideFirst =
    Array.isArray(first) && first.every((k) => typeof k === "string")
      ? (first as string[])
      : null;
  if (first !== undefined) {
    if (hideFirst === null || hideFirst.length === 0)
      throw new CompileError("deal hideFirst: a list of the kinds deal hide names");
    for (const k of hideFirst)
      if (!kinds.includes(k))
        throw new CompileError(`deal hideFirst: ${k} is not hidden`);
    if (hideFirst.length >= kinds.length)
      throw new CompileError("deal hideFirst: every hidden kind, and none after them");
  }
  return {
    hide,
    hideFirst,
    hideFrom: hideFromOf(json, kinds),
    hideWhole: hideWholeOf(json, kinds),
  };
}

const SIZE_MEASURES = ["sum", "area", "shorter", "longer"] as const;

/** `deal.hideWhole`: each kind of `hidden` the deal hides whole below a
 * tier, by the tier's index (past the last where none is named), with a
 * variation on where one is named, on a board within the bounds; `null`
 * where there is none. */
function hideWholeOf(
  json: DescriptionJson,
  hidden: readonly string[],
): Record<string, HideWhole> | null {
  const whole = json.deal?.["hideWhole"];
  if (whole === undefined) return null;
  if (typeof whole !== "object" || whole === null || Array.isArray(whole))
    throw new CompileError("deal hideWhole: a tier and bounds by clue kind");
  const out: Record<string, HideWhole> = {};
  for (const [kind, spec] of Object.entries(whole as Record<string, unknown>)) {
    if (!hidden.includes(kind))
      throw new CompileError(`deal hideWhole: ${kind} is no kind the deal hides`);
    const {
      below,
      with: variation,
      ...bounds
    } = spec as { below?: unknown; with?: unknown } & SizeBoundsJson;
    if (below !== undefined && typeof below !== "string")
      throw new CompileError(`deal hideWhole: ${kind} below a tier, by its name`);
    if (variation !== undefined && json.variations?.[variation as string] === undefined)
      throw new CompileError(
        `deal hideWhole: ${kind} with ${String(variation)}, no variation`,
      );
    if (below === undefined && variation === undefined)
      throw new CompileError(
        `deal hideWhole: ${kind} below a tier or with a variation`,
      );
    for (const name of Object.keys(bounds))
      if (!(SIZE_MEASURES as readonly string[]).includes(name))
        throw new CompileError(`deal hideWhole: ${kind}'s ${name} is no size bound`);
    const tiers = json.tiers ?? [];
    out[kind] = {
      below:
        below === undefined ? tiers.length : tierIndex(tiers, below, "deal hideWhole"),
      bounds,
      ...(variation === undefined ? {} : { with: variation as string }),
    };
    if (out[kind].below === 0)
      throw new CompileError(
        `deal hideWhole: ${kind} below the lowest tier is no board`,
      );
  }
  return out;
}

/** A kind hidden whole (`FillDeal.hideWhole`). */
interface HideWhole {
  below: number;
  bounds: SizeBoundsJson;
  with?: string;
}

/** `deal.hideFrom`: each kind of `hidden` the deal keeps whole below a
 * tier, by the tier's index; `null` where there is none. */
function hideFromOf(
  json: DescriptionJson,
  hidden: readonly string[],
): Record<string, number> | null {
  const from = json.deal?.["hideFrom"];
  if (from === undefined) return null;
  if (typeof from !== "object" || Array.isArray(from))
    throw new CompileError("deal hideFrom: a tier by clue kind");
  const out: Record<string, number> = {};
  for (const [kind, tier] of Object.entries(from)) {
    if (!hidden.includes(kind))
      throw new CompileError(`deal hideFrom: ${kind} is no kind the deal hides`);
    if (typeof tier !== "string")
      throw new CompileError(`deal hideFrom: ${kind}'s tier by its name`);
    out[kind] = tierIndex(json.tiers ?? [], tier, "deal hideFrom");
    if (out[kind] === 0)
      throw new CompileError(
        `deal hideFrom: ${kind} from the lowest tier is every tier`,
      );
  }
  return out;
}

/**
 * `hideRank(sp, cl, kind, at)`: where the hide puts a clue of `kind` at
 * `at`, by `deal.hideBy`'s formula of `at`: a higher one is hidden first.
 * None where the deal states no formula.
 */
export function hideRankOf(
  json: DescriptionJson,
  env: Env,
  measured: (e: Expr) => Expr,
  hidden: readonly string[],
): string[] {
  const by = json.deal?.["hideBy"];
  if (by === undefined) return [];
  if (typeof by !== "object" || by === null || Array.isArray(by))
    throw new CompileError("deal hideBy: a formula of `at` by clue kind");
  const scratch: string[] = [];
  const henv = answerEnv(env, { yes: false }, scratch);
  const lines: string[] = [];
  for (const [kind, src] of Object.entries(by as Record<string, unknown>)) {
    if (!hidden.includes(kind))
      throw new CompileError(`deal hideBy: ${kind} is no kind the deal hides`);
    if (typeof src !== "string")
      throw new CompileError(`deal hideBy: ${kind}'s formula of \`at\``);
    const sorts = env.clues.get(kind) as ClueKind;
    const out = new Out(2);
    const e = compileExpr(
      measured(parse(src)),
      new Map<string, Val>([["at", { code: "at", sort: sorts.at }]]),
      henv,
      out,
    );
    if (e.sort.k !== "int" && e.sort.k !== "num")
      throw new CompileError(`deal hideBy: ${kind}'s formula is not a number`);
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
    "/** Where the hide puts a clue of `kind` at `at` (`deal.hideBy`): a higher",
    " * one is hidden first. */",
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

/** The module's hide flag (`engine/fill/params/flags.ts`'s `FillHideFlag`). */
interface HideFlag {
  kind: string;
  letter: string;
  kw: string;
  name: string;
  doc: string;
  words: string;
}

/** `deal.hideFlag`: the setting under which the deal hides a clue kind
 * beside `deal.hide`'s, whose hide it joins; `null` where there is none. */
export function hideFlagOf(
  json: DescriptionJson,
  d: Description,
  hides: boolean,
  letters: Letters,
): HideFlag | null {
  const f = json.deal?.["hideFlag"];
  if (f === undefined) return null;
  if (!hides)
    throw new CompileError("deal hideFlag: a setting of the hide, and no hide");
  const { kind, letter, kw, name, doc, words } = f as Record<string, unknown>;
  if (![kind, letter, kw, name, doc, words].every((s) => typeof s === "string"))
    throw new CompileError("deal hideFlag: { kind, letter, kw, name, doc, words }");
  if (!d.clueKinds.has(kind as string))
    throw new CompileError(`deal hideFlag: no clue kind ${String(kind)}`);
  letters.claim(letter as string, "deal hideFlag");
  return { kind, letter, kw, name, doc, words } as HideFlag;
}

/** `deal.symmetric` as the deal reads it: a symmetry by its name, or the
 * option whose choices name them; `null` where the deal keeps none. */
export function symmetricOf(
  symmetric: unknown,
  options: Readonly<Record<string, { choices?: readonly { symmetry?: Symmetry }[] }>>,
): Symmetry | { option: string } | null {
  if (symmetric === undefined) return null;
  if ((SYMMETRIES as readonly unknown[]).includes(symmetric))
    return symmetric as Symmetry;
  const choices =
    typeof symmetric === "string" ? options[symmetric]?.choices : undefined;
  if (choices?.every((c) => c.symmetry !== undefined))
    return { option: symmetric as string };
  throw new CompileError(
    `deal symmetric: ${String(symmetric)} is no symmetry (${SYMMETRIES.join(", ")}) nor an option of them`,
  );
}
