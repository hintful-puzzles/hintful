/**
 * The partitions a fill game deals (`engine/fill/deal/partition.ts`): grown
 * round the answer, divided apart from it, or cut into blocks a formula or
 * the params give.
 */

import { CompileError, type Env } from "../compile-sorts.ts";
import type {
  DescriptionJson,
  DivideJson,
  GrowJson,
  MergeJson,
  SampleJson,
  SettingJson,
} from "../description.ts";
import { parse } from "../expr.ts";
import { sizesFunction } from "./emit.ts";
import { sampledValue } from "./sample.ts";

/** The sizes the settings give (`sizes.ts`' `sizeSettings`). */
type SizeSettings = readonly { id: string; from: number; values: number }[];

/** The partitions the board deals, by name: a partition among the units
 * the board deals (Solo's jigsaw blocks) first, then the rest. */
export const dealtPartitions = (env: Env): string[] => [
  ...(env.boxesDealt && env.boxes !== null ? [env.boxes] : []),
  ...env.regions,
];

/** Refuses a grow, a divide or a merge of no dealt partition, a merge beside
 * either of the others, and a dealt partition the deal neither grows,
 * divides nor merges. */
export function checkPartitions(
  grow: GrowJson | null,
  divides: readonly DivideJson[],
  merge: MergeJson | null,
  sample: SampleJson | null,
  partitions: readonly string[],
  tiers: readonly string[],
  env: Env,
): void {
  const dividedNames = divides.map((x) => x.partition);
  if (divides.length > 0 && grow !== null)
    throw new CompileError("deal divide: a partition grown, and one divided");
  if (merge !== null) {
    if (grow !== null || divides.length > 0)
      throw new CompileError(
        "deal merge: a partition merged, and one grown or divided",
      );
    if (!partitions.includes(merge.partition))
      throw new CompileError(`deal merge: ${merge.partition} is no dealt partition`);
  }
  if (grow !== null) {
    if (!env.regions.has(grow.partition))
      throw new CompileError(`deal grow: ${grow.partition} is no dealt partition`);
    if (sampledValue(sample) === 0)
      throw new CompileError("deal grow: a partition is grown round a sampled value");
    if (grow.closed !== undefined && grow.closed.oneIn.length !== tiers.length)
      throw new CompileError("deal grow: closed oneIn is not one number a tier");
  }
  for (const name of dividedNames) {
    if (!partitions.includes(name))
      throw new CompileError(`deal divide: ${name} is no dealt partition`);
    if (dividedNames.indexOf(name) !== dividedNames.lastIndexOf(name))
      throw new CompileError(`deal divide: ${name} is divided twice`);
  }
  for (const r of partitions)
    if (grow?.partition !== r && merge?.partition !== r && !dividedNames.includes(r))
      throw new CompileError(
        `${r}: a fill game's dealt partition is one the deal grows, divides or merges`,
      );
}

/** A divide of `deal.divide` as the deal reads it (`FillDivide`): a divide
 * by drawn sizes with `by` holds the setting's least, and one list a value
 * of it; one into equal parts names a number, `w` or a size. */
function divideDeal(
  divide: DivideJson,
  settings: SizeSettings,
  json: DescriptionJson,
):
  | Exclude<DivideJson, { sizes: number[][] }>
  | { partition: string; sizes: number[][]; by?: { size: string; min: number } } {
  if ("equal" in divide) {
    const { equal } = divide;
    if (typeof equal === "string" && equal !== "w" && json.sizes[equal] === undefined)
      throw new CompileError(`deal divide: equal parts of ${equal}, which is no size`);
    return divide;
  }
  if (!("sizes" in divide)) return divide;
  const { partition, sizes, by } = divide;
  if (by === undefined) {
    if (sizes.length !== 1)
      throw new CompileError("deal divide: several lists of sizes, and no by");
    return { partition, sizes };
  }
  const s = settings.find((x) => x.id === by);
  if (s === undefined)
    throw new CompileError(`deal divide: ${by} is no size the params give`);
  if (sizes.length !== s.values)
    throw new CompileError(`deal divide: not one list of sizes a value of ${by}`);
  return { partition, sizes, by: { size: by, min: s.from } };
}

/** A divide as the deal reads it: a partition a variation deals is divided
 * only where it is on. */
export function divideOn(
  x: DivideJson,
  settings: SizeSettings,
  json: DescriptionJson,
): ReturnType<typeof divideDeal> & { variation?: string } {
  const by = dealtBy(json, x.partition);
  return {
    ...divideDeal(x, settings, json),
    ...(by === null ? {} : { variation: by }),
  };
}

/** The variation under which partition `r` is dealt, where the plain board
 * deals none: one that replaces a partition cut otherwise (Solo's Jigsaw
 * blocks) or adds it (Solo's Killer cages). `null` where every board deals
 * it, or none. */
export function dealtBy(json: DescriptionJson, r: string): string | null {
  if (json.space.regions?.[r] === "dealt") return null;
  const by = Object.entries(json.variations ?? {}).filter(
    ([, v]) =>
      v.replace?.space?.regions?.[r] === "dealt" ||
      v.add?.space?.regions?.[r] === "dealt",
  );
  if (by.length > 1)
    throw new CompileError(`${r}: dealt by ${by.map(([n]) => n).join(" and ")}`);
  return by[0]?.[0] ?? null;
}

/**
 * `growBy(sp, cl)`, what a grown partition's parts hold on a board: `holds`,
 * `smallest` and `parts`, each a number or a formula of the board's sizes
 * (`engine/fill/grow.ts`'s `GrowSizes`).
 */
export function growByOf(grow: GrowJson, env: Env): string[] {
  return sizesFunction(
    env,
    "deal grow",
    "/** What the grown partition's parts hold on a board of these sizes. */",
    "growBy",
    "{ holds: number; smallest: number; parts: number | null }",
    (term) =>
      `{ holds: ${term(grow.holds)}, smallest: ${term(grow.smallest)}, parts: ${term(grow.parts)} }`,
  );
}

/**
 * The width and height of the blocks the partition among the units is cut
 * into, where a formula and not a deal gives it: `blocks(a, b)`, each a
 * number or a size the params give. `null` where the partition is dealt or
 * there is none. A partition stated by any other formula, or one that is no
 * unit, is refused: nothing builds it.
 */
export function blocksOf(
  json: DescriptionJson,
  boxes: string | null,
): [number | string, number | string] | null {
  let out: [number | string, number | string] | null = null;
  for (const [name, how] of Object.entries(json.space.regions ?? {})) {
    if (how === "dealt") continue;
    if (name !== boxes)
      throw new CompileError(`${name}: a partition by formula is one among the units`);
    const e = parse(how);
    const args =
      e.k === "call" && e.fn === "blocks" && e.args.length === 2
        ? e.args.map((a) =>
            a.k === "num"
              ? a.v
              : a.k === "name" && a.name in json.sizes
                ? a.name
                : null,
          )
        : [];
    const [bw, bh] = args;
    if (args.length !== 2 || bw === null || bh === null)
      throw new CompileError(
        `${name}: a partition by formula is blocks(a, b), each a number or a size`,
      );
    out = [bw, bh];
  }
  return out;
}

/**
 * A `blocks` setting as the deal reads it (`BlocksSetting`): the blocks must
 * be `blocks(a, b)` of two sizes, the grid `a * b` on a side, and a
 * variation must deal them, which is on where `a`, the blocks' width, is 1;
 * `rulesets` names that variation and one other puzzle.
 */
export function fillBlocksOf(
  json: DescriptionJson,
  env: Env,
  id: string,
  given: SettingJson,
): FillBlocksJson {
  const { letter, columns, rows } = given;
  if (letter === undefined || columns === undefined || rows === undefined)
    throw new CompileError(`settings ${id}: blocks have a letter, columns and rows`);
  const cut = blocksOf(json, env.boxes);
  const dealtBy = boxesDealtBy(json, env);
  const [down, across] = cut ?? [];
  if (typeof down !== "string" || typeof across !== "string" || dealtBy === null)
    throw new CompileError(
      `settings ${id}: the blocks are blocks(a, b) of two sizes, and a variation deals them`,
    );
  const side = (f?: string) => (f ?? "").replace(/\s+/g, "");
  const grid = json.space.grid;
  if (
    side(grid?.w) !== side(grid?.h) ||
    ![`${across}*${down}`, `${down}*${across}`].includes(side(grid?.w))
  )
    throw new CompileError(`settings ${id}: the grid is ${across} * ${down} on a side`);
  const [a, d] = [json.sizes[across], json.sizes[down]];
  if (a?.max === undefined || d?.max === undefined || d.min !== 1)
    throw new CompileError(
      `settings ${id}: ${across} and ${down} have a max, and ${down} goes down to 1`,
    );
  const rulesets = given.rulesets ?? {};
  const names = Object.keys(rulesets);
  const cutName = names.find((n) => n !== dealtBy);
  if (cutName === undefined || !names.includes(dealtBy))
    throw new CompileError(`settings ${id}: rulesets name ${dealtBy} and one other`);
  return {
    across,
    down,
    letter,
    dealtBy,
    columns,
    rows,
    rulesets: [
      { name: cutName, rule: rulesets[cutName] ?? "" },
      { name: dealtBy, rule: rulesets[dealtBy] ?? "" },
    ],
    bounds: {
      across: { min: a.min, max: a.max },
      down: { min: d.min, max: d.max },
    },
  };
}

/** A board sized by its blocks as the deal holds it (`FillBlocks`). */
type FillBlocksJson = {
  across: string;
  down: string;
  letter: string;
  dealtBy: string;
  columns: { kw: string; name: string; doc: string };
  rows: { kw: string; name: string };
  rulesets: [{ name: string; rule: string }, { name: string; rule: string }];
  bounds: Record<"across" | "down", { min: number; max: number }>;
};

/** The variation under which the partition among the units, cut by blocks
 * on every other board, is dealt (Solo's Jigsaw), or `null` where none
 * deals it. */
export function boxesDealtBy(json: DescriptionJson, env: Env): string | null {
  return env.boxes === null ? null : dealtBy(json, env.boxes);
}
