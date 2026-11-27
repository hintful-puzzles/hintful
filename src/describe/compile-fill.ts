/**
 * What the engine's fill board (`engine/fill/`) reads of a description that
 * the techniques and the checks do not: whether a cell's mark may stand on
 * the values (a mark's `while`), and, for a game whose deal samples an
 * answer, the clues that answer deals, from each clue kind's `means`
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 4 and
 * § 7). Each concept is a module of `fill/`; this file keeps the order the
 * module's parts are written in, and assembles the `deal` object and
 * `clueMax`.
 */

import { compileExpr } from "./compile-expr.ts";
import {
  type ClueKind,
  CompileError,
  type Env,
  Out,
  type Val,
} from "./compile-sorts.ts";
import {
  type Description,
  type DescriptionJson,
  dividesOf,
  growOf,
  sampleOf,
  tallyKindOf,
} from "./description.ts";
import type { Expr } from "./expr.ts";
import { firstKindOf, latinOf, oneKindDeal, suitsOf } from "./fill/clue-steps.ts";
import { derivedClues } from "./fill/derive.ts";
import { answerEnv, param, present, tierIndex } from "./fill/emit.ts";
import { hideOf, hideRankOf, symmetricOf } from "./fill/hide.ts";
import { checkNamed, checkSegments, hexagonOf } from "./fill/id-checks.ts";
import { Letters } from "./fill/letters.ts";
import { partsOfKinds, universesOf } from "./fill/locations.ts";
import { numbersOf } from "./fill/numbers.ts";
import { tierAliasesOf } from "./fill/params.ts";
import {
  checkPartitions,
  dealtPartitions,
  divideOn,
  growByOf,
} from "./fill/partitions.ts";
import { markWhileOf, playOf } from "./fill/play.ts";
import { checkFirst, checkSample, dealtSample, sampledValue } from "./fill/sample.ts";
import {
  dealFlag,
  type SettingOut,
  settingsOf,
  sizeSettings,
} from "./fill/settings.ts";
import { flagKind, markerKind } from "./fill/values.ts";

/** The fill board's part of a game's module, in the order it is written. */
export function fillOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const letters = new Letters();
  const settings =
    json.play === undefined ? [] : settingsOf(json, d, env, json.tiers ?? [], letters);
  return [
    ...(json.play === undefined
      ? []
      : [
          "",
          "/** The sort of element the answer's values sit on. */",
          `export const answerSort = ${JSON.stringify(d.answerSort)};`,
        ]),
    ...markWhileOf(json, env, measured),
    ...derivedClues(json, d, env, measured),
    ...playOf(json, d, env, measured),
    ...dealOf(json, d, env, measured, letters, settings),
    ...numbersOf(json, d, env, measured),
  ];
}

/**
 * `deal`, what the engine deals a fill game's board by and writes its game
 * ID with: the sample, the codec's segments, the tiers' letters and the
 * sizes; and `clueMax`, each clue kind's largest value at an element, from
 * its `value: range(lo, hi)`, which bounds what a game ID may say. Nothing
 * where there is no `play:`.
 */
function dealOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
  letters: Letters,
  settings: readonly SettingOut[],
): string[] {
  if (json.play === undefined) return [];
  const kinds = [...d.clueKinds.keys()];
  const partitions = dealtPartitions(env);
  const id =
    json.id ?? kinds.map((k, i) => ({ numbers: k, ...(i > 0 ? { before: "," } : {}) }));
  const isMarker = (kind: string): boolean => markerKind(d, kind);
  const hexagon = hexagonOf(json, isMarker);
  // The tally is the params', which the ID does not write.
  const written = kinds.filter((k) => k !== tallyKindOf(json));
  checkNamed(id, [...written, ...partitions], hexagon?.outside ?? null);
  checkSegments(id, d, env, json);
  const hide = hideOf(json, d, settings);
  const hides = hide !== null;
  const thoroughJson = json.deal?.thorough;
  const thorough =
    thoroughJson === undefined
      ? null
      : dealFlag(settings, thoroughJson, "deal thorough");
  if (thorough !== null && !hides)
    throw new CompileError(
      "deal thorough: a setting of how the deal hides, and no hide",
    );
  const stripFrom = json.deal?.stripFrom;
  if (stripFrom !== undefined && !hides)
    throw new CompileError("deal stripFrom: everyClue, where the deal hides");
  const symmetric = json.deal?.symmetric;
  if (symmetric !== undefined && hide?.length !== 1)
    throw new CompileError(
      "deal symmetric: the symmetry of the clues left, and no hide of one kind",
    );
  const tiers = json.tiers ?? [];
  const tierLetters =
    json.tierLetters ?? tiers.map((t) => t[0]?.toLowerCase() ?? "").join("");
  if (tierLetters.length !== tiers.length || new Set(tierLetters).size !== tiers.length)
    throw new CompileError(`tierLetters: ${tierLetters} is not one letter a tier`);
  const universes = universesOf(json, d, env);
  const perValue = kinds.filter((k) => env.clues.get(k)?.per === true);
  const partsOf = partsOfKinds(d, universes);
  const sample = sampleOf(json);
  const grow = growOf(json);
  const divides = dividesOf(json);
  const dividedNames = divides.map((x) => x.partition);
  checkPartitions(grow, divides, sample, partitions, tiers, env);
  const divided =
    divides.length === 0
      ? null
      : divides.map((x) => divideOn(x, sizeSettings(settings), json));
  // The kinds dealt one a part sit at the parts of one partition divided.
  const oneKind = oneKindDeal(
    json,
    d,
    dividedNames.find((r) => [...d.clueKinds.values()].some((c) => c.at === r)) ??
      dividedNames[0] ??
      null,
    settings,
  );
  checkSample(json, d, sample, settings, hides);
  const unpair = json.deal?.unpair;
  const latin = latinOf(json, d);
  checkFirst(sample, settings, hides);
  const symmetricDeal = symmetricOf(symmetric, settings);
  const tierFlag =
    json.tierFlag === undefined
      ? null
      : {
          letter: json.tierFlag.letter,
          tier: tierIndex(tiers, json.tierFlag.tier, "tierFlag"),
        };
  if (tierFlag !== null) letters.claim(tierFlag.letter, "tierFlag");
  const unusedLetters = json.unusedLetters ?? null;
  const firstKind = firstKindOf(json, d);
  const tierAliases = tierAliasesOf(json, tiers, tierLetters);
  const { grid } = json.space;
  // A retired letter is one an old ID may still hold, so no field takes it.
  for (const letter of Object.keys(unusedLetters ?? {}))
    if (letters.has(letter))
      throw new CompileError(`unusedLetters: the letter ${letter} is taken`);
  const deal = {
    ...(grid !== undefined && grid.w === grid.h ? { square: true } : {}),
    ...(hexagon === null ? {} : { hexagon }),
    settings,
    sample: dealtSample(json, sample),
    ...present("hide", hide),
    ...(stripFrom === undefined ? {} : { stripFrom }),
    ...present("tierFlag", tierFlag),
    ...present("unusedLetters", unusedLetters),
    ...present("tierAliases", tierAliases),
    ...(typeof unpair === "string" ? { unpair } : {}),
    ...present("latin", latin),
    ...present("symmetric", symmetricDeal),
    ...present("thorough", thorough),
    ...present("divide", divided),
    ...(oneKind === null ? {} : { oneKind: oneKind.deal }),
    ...present("firstKind", firstKind),
    ...(grow === null
      ? {}
      : {
          grow: {
            partition: grow.partition,
            value: sampledValue(sample),
            ...(grow.closed === undefined ? {} : { closed: grow.closed }),
          },
        }),
    // A record's sides of a kind valued 0 or 1 are written from both ends.
    id: id.map((seg) =>
      "records" in seg && flagKind(d, seg.sides) ? { ...seg, both: true } : seg,
    ),
    universes,
    ...present("perValue", perValue.length === 0 ? null : perValue),
    ...partsOf,
    ...(partitions.length === 0 ? {} : { partitions }),
    tierLetters,
    sizes: json.sizes,
  };
  const { max, least } = clueMaxOf(json, d, env, measured);
  return [
    "",
    "/** How the engine deals the board and writes its game ID. */",
    `export const deal = ${JSON.stringify({ ...deal, least })} as const;`,
    "",
    "/** Each clue kind's largest value at an element. */",
    "export const clueMax = {",
    ...max,
    "};",
    ...(grow === null ? [] : growByOf(grow, env)),
    ...(oneKind === null ? [] : suitsOf(oneKind.json, env, measured, tiers)),
    ...hideRankOf(json, env, measured),
  ];
}

/** `clueMax`'s methods, each kind's largest value at an element, and each
 * kind's smallest value, which the ID refuses below. */
function clueMaxOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): { max: string[]; least: Record<string, number> } {
  const max: string[] = [];
  const least: Record<string, number> = {};
  for (const [kind, c] of d.clueKinds) {
    if (kind === tallyKindOf(json)) continue;
    const sorts = env.clues.get(kind) as ClueKind;
    // A value that is one of the board's elements (a sign's greater end) is
    // written by where it lies, never as a number.
    if (sorts.v.k === "elem") continue;
    const range = c.value === null ? null : measured(c.value);
    if (
      range === null ||
      range.k !== "call" ||
      range.fn !== "range" ||
      range.args.length !== 2
    )
      throw new CompileError(
        `clue ${kind}: a fill game's clue values are a range(lo, hi)`,
      );
    const [lo] = range.args;
    if (lo.k !== "num")
      throw new CompileError(
        `clue ${kind}: a fill game's clue values start at a number`,
      );
    least[kind] = lo.v;
    const scratch: string[] = [];
    const out = new Out(2);
    const hi = compileExpr(
      range.args[1],
      new Map<string, Val>([["at", { code: "at", sort: sorts.at }]]),
      answerEnv(env, { yes: false }, scratch),
      out,
    );
    const body = [
      ...scratch.map((s) => `    ${s}`),
      ...out.text(),
      `    return Number(${hi.code});`,
    ];
    // A part's cells are the partition's, which the clues read so far hold.
    max.push(
      `  ${kind}(${param("sp", "GridSpace", body)}, ${param("at", "number", body)}, ${param("cl", "Dealt", body)}): number {`,
      ...body,
      "  },",
    );
  }
  return { max, least };
}
