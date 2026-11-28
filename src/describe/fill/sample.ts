/**
 * The answer a fill game's deal samples (`engine/fill/deal/samplers.ts`):
 * what each sample lays, and what a sample's settings need of the rest of
 * the deal.
 */

import { type GroupSample, groupTable } from "../../engine/fill/group-table.ts";
import type { WallsSample } from "../../engine/fill/sample.ts";
import { SET_BLACKS_SYMM } from "../../engine/generate/symmetry.ts";
import { CompileError, type Env } from "../compile-sorts.ts";
import { kindsRead } from "../compile-terms.ts";
import {
  type Description,
  type DescriptionJson,
  type SampleJson,
  sampleOf,
} from "../description.ts";
import { sizesFunction } from "./emit.ts";
import type { SettingOut } from "./settings.ts";
import { sizeSettings } from "./sizes.ts";
import { underOf } from "./under.ts";

/** The value a sample lays, 0 where it lays no one value: it builds the
 * answer, draws a Latin square, or searches one. */
export function sampledValue(sample: SampleJson | null): number {
  if (
    sample === null ||
    "build" in sample ||
    "group" in sample ||
    "latin" in sample ||
    "once" in sample ||
    "search" in sample ||
    "uniform" in sample ||
    "walls" in sample
  )
    return 0;
  if ("dominoes" in sample) return sample.dominoes.value;
  if ("lines" in sample) return sample.lines.value;
  if ("picture" in sample) return sample.picture.value;
  if ("pieces" in sample) return sample.pieces.value;
  return sample.scatter.value;
}

/**
 * The sample as the deal reads it (`engine/fill/sample.ts`' `Sample`): a
 * partition's walls take the value the play paints `wall` between two parts
 * and its one other value inside one, so the deal and the drawing cannot
 * disagree on which is the wall. Refused where the answer is not on the
 * edges, where no value or more than one is painted a wall, or where the
 * play has no one other value; and a division into equal parts of a size
 * the params do not give.
 */
export function dealtSample(
  json: DescriptionJson,
  sample: SampleJson | null,
  settings: readonly SettingOut[],
):
  | Exclude<SampleJson, { walls: unknown } | { group: unknown }>
  | WallsSample
  | GroupSample
  | null {
  if (sample !== null && "group" in sample)
    return groupSampleOf(json, sample, settings);
  if (sample === null || !("walls" in sample)) return sample;
  if (json.answer.value.sort !== "edge")
    throw new CompileError("deal sample walls: the answer is not on the edges");
  const values = Object.entries(json.play?.values ?? {});
  const walls = values.filter(([, v]) => v.paint === "wall");
  const others = values.filter(([, v]) => v.paint !== "wall");
  if (walls.length !== 1 || others.length !== 1)
    throw new CompileError(
      "deal sample walls: the play places two values, one painted wall",
    );
  const { equal } = sample.walls;
  if (typeof equal === "string" && equal !== "w" && json.sizes[equal] === undefined)
    throw new CompileError(
      `deal sample walls: equal parts of ${equal}, which is no size`,
    );
  return {
    walls: {
      division: { equal },
      value: Number(walls[0][0]),
      rest: Number(others[0][0]),
    },
  };
}

/**
 * A group's table as the deal reads it, its `hidden` resolved. Refused where
 * the board is not square, where a side the sizes allow has no group of its
 * order, and where a group's generators are not each a permutation of its
 * elements, or their table is not filled or is no group's: a row or column
 * holding an element twice, or a product that is not associative.
 */
function groupSampleOf(
  json: DescriptionJson,
  sample: Extract<SampleJson, { group: unknown }>,
  settings: readonly SettingOut[],
): GroupSample {
  const { tables, hidden } = sample.group;
  const grid = json.space.grid;
  if (grid === undefined || grid.w !== grid.h)
    throw new CompileError("deal sample group: the board is not square");
  const side = json.sizes[grid.w];
  if (side !== undefined)
    for (let n = side.min; n <= (side.max ?? side.min); n++)
      if (tables[String(n)] === undefined)
        throw new CompileError(`deal sample group: no group of order ${n}`);
  for (const [key, groups] of Object.entries(tables)) {
    const n = Number(key);
    const letters = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
    for (const gens of groups) {
      const where = `deal sample group: order ${n}'s group ${gens.join(" ")}`;
      for (const gen of gens)
        if ([...gen].sort().join("") !== letters.join(""))
          throw new CompileError(`${where}: ${gen} is no permutation of ${n} elements`);
      const t = groupTable(n, gens);
      if (t === null) throw new CompileError(`${where}: its table is not filled`);
      const problem = notAGroup(t, n);
      if (problem !== null) throw new CompileError(`${where}: ${problem}`);
    }
  }
  return {
    group: {
      tables,
      ...(hidden === undefined
        ? {}
        : { hidden: underOf(json, settings, hidden, "deal sample group hidden") }),
    },
  };
}

/** What makes table `t` of `n` elements no group's, or `null`. */
function notAGroup(t: Uint8Array, n: number): string | null {
  const at = (a: number, b: number) => t[(a - 1) * n + (b - 1)];
  for (let i = 0; i < n; i++) {
    const row = new Set<number>();
    const col = new Set<number>();
    for (let j = 0; j < n; j++) {
      row.add(t[i * n + j]);
      col.add(t[j * n + i]);
    }
    if (row.size < n || col.size < n) return "an element twice in a line";
  }
  for (let a = 1; a <= n; a++)
    for (let b = 1; b <= n; b++)
      for (let c = 1; c <= n; c++)
        if (at(at(a, b), c) !== at(a, at(b, c)))
          return `(${a}·${b})·${c} is not ${a}·(${b}·${c})`;
  return null;
}

/** Refuses a sample of lines counted by no size the params give, an unpair
 * of a board not graded by a climb, and a scatter's mend, climb or first
 * cells where it does not redraw a cell at a time. */
export function checkSample(
  json: DescriptionJson,
  d: Description,
  sample: SampleJson | null,
  settings: readonly SettingOut[],
  hides: boolean,
): void {
  if (sample !== null && "lines" in sample) {
    const { count } = sample.lines;
    if (
      typeof count === "string" &&
      !sizeSettings(settings).some((s) => s.id === count)
    )
      throw new CompileError(`deal sample: ${count} is no size the params give`);
  }
  const unpair = json.deal?.unpair;
  if (unpair !== undefined) {
    if (d.clueKinds.get(unpair)?.at !== "cell")
      throw new CompileError(`deal unpair: ${unpair} is no clue kind at a cell`);
    if (hides)
      throw new CompileError(
        "deal unpair: a board's answer is the ladder's, and a hide",
      );
    const s = sampleOf(json);
    if (s === null || !("scatter" in s) || s.climb !== true)
      throw new CompileError("deal unpair: a board unpaired is graded by a climb");
  }
  if (sample !== null && "scatter" in sample) {
    if ((sample.mend === true || sample.climb === true) && sample.scatter.each !== true)
      throw new CompileError(
        "deal sample: a mend and a climb redraw a cell at a time, so take `each`",
      );
    if (sample.climb === true && hides)
      throw new CompileError(
        "deal sample: a climb keeps what the ladder decided, and a hide",
      );
    if (
      sample.first !== undefined &&
      (sample.scatter.each !== true || sample.climb === true)
    )
      throw new CompileError(
        "deal sample: first cells are kept by a scatter of `each` that does not climb",
      );
  }
}

/** A build or a uniform sample on first cells, given the clue kinds the
 * answer's domain reads: the clues those cells derive that the build and
 * the first cells' keep read (Undead's mirrors, Light Up's walls). Every other kind derived from first cells alone is no
 * answer's: a sightline's count of a board of mirrors and nothing else. The
 * first cells' `keep` is the module's `firstKeeps`, the sightlines' `open`
 * its `sightlinesOpen` and the fallback's `most` its `fallbackMost`, so the
 * deal holds none of them. */
export function withBuildReads<S extends object>(
  sample: S | null,
  d: Description,
): S | null {
  if (sample === null) return sample;
  const without = (o: unknown, key: string): object => {
    const { [key]: _, ...rest } = o as Record<string, unknown>;
    return rest;
  };
  return {
    ...sample,
    ...("sightlines" in sample
      ? { sightlines: without(sample.sightlines, "open") }
      : {}),
    ...("fallback" in sample ? { fallback: without(sample.fallback, "most") } : {}),
    ...("build" in sample &&
    typeof sample.build === "object" &&
    sample.build !== null &&
    "count" in sample.build
      ? { build: { ...sample.build, count: true } }
      : {}),
    ...("first" in sample ? { first: without(sample.first, "keep") } : {}),
    ...("first" in sample && ("build" in sample || "uniform" in sample)
      ? { reads: [...kindsRead(d.domain, d.defs)].sort() }
      : {}),
  };
}

/** `fallbackMost(sp, cl)`, the most cells a build may give its fallback
 * value on a board of these sizes; nothing where it has no fallback. */
export function fallbackMostOf(json: DescriptionJson, env: Env): string[] {
  const sample = sampleOf(json);
  if (sample === null || !("fallback" in sample) || sample.fallback === undefined)
    return [];
  const { most } = sample.fallback;
  return sizesFunction(
    env,
    "deal sample fallback",
    "/** The most cells the build gives its fallback value on a board of these sizes. */",
    "fallbackMost",
    "number",
    (term) => term(most),
  );
}

/** `buildCount(sp, cl)`, how many cells, the first in a build's order, take
 * its value on a board of these sizes; nothing where the build has no
 * count. A build's `prefer` goes with a count alone. */
export function buildCountOf(json: DescriptionJson, env: Env): string[] {
  const sample = sampleOf(json);
  if (sample === null || !("build" in sample) || typeof sample.build !== "object")
    return [];
  const { count, prefer } = sample.build;
  if (prefer !== undefined && count === undefined)
    throw new CompileError("deal sample build: a preference with no count");
  if (count === undefined) return [];
  return sizesFunction(
    env,
    "deal sample build count",
    "/** How many cells, the first in the build's order, take its value on a board of these sizes. */",
    "buildCount",
    "number",
    (term) => term(count),
  );
}

/** Refuses first cells whose share is no number the options give, or whose
 * symmetry is no option of the symmetries first cells keep; first cells at a
 * chance, or those an opening leaves, with a share or a symmetry besides, a
 * bound on the share laid and no chance, an opening's symmetry turned on by
 * no flag or a flag that turns on none; and a first value no clue kind the
 * domain reads fixes, for a build, which reads those alone. */
export function checkFirst(
  sample: SampleJson | null,
  settings: readonly SettingOut[],
  d: Description,
): void {
  if (sample === null || !("first" in sample) || sample.first === undefined) return;
  const { share, symmetry, chance, within, opened, ramp } = sample.first;
  if (opened !== undefined) {
    if ([share, symmetry, chance, within, ramp].some((x) => x !== undefined))
      throw new CompileError(
        "deal sample first: cells an opening leaves, and a share, a symmetry or a chance",
      );
    if (
      opened.when !== undefined &&
      !settings.some((s) => s.id === opened.when && s.kind === "flag")
    )
      throw new CompileError(
        `deal sample first opened: when ${opened.when}, which is no flag the settings give`,
      );
    if (opened.when !== undefined && opened.symmetry === undefined)
      throw new CompileError(
        "deal sample first opened: a flag that turns on no symmetry",
      );
  } else if (chance !== undefined) {
    if (share !== undefined || symmetry !== undefined)
      throw new CompileError(
        "deal sample first: cells laid each at a chance, and a share or a symmetry",
      );
    if (within !== undefined && !(within.min <= within.max))
      throw new CompileError(
        `deal sample first: within ${within.min} to ${within.max}, which holds no share`,
      );
  } else checkShared(sample.first, settings);
  if ("build" in sample && [...kindsRead(d.domain, d.defs)].length === 0)
    throw new CompileError(
      "deal sample first: the build reads the clue kinds the domain reads, and it reads none",
    );
}

/** Refuses first cells laid by a share that is no number the options give,
 * or a symmetry that is no option of the symmetries first cells keep. */
function checkShared(
  { share, symmetry, within }: { share?: string; symmetry?: string; within?: unknown },
  settings: readonly SettingOut[],
): void {
  if (within !== undefined)
    throw new CompileError(
      "deal sample first: a bound on the share laid, and no chance",
    );
  if (!settings.some((s) => s.id === share && s.kind === "number"))
    throw new CompileError(
      `deal sample first: ${share} is no number the settings give`,
    );
  const chosen = settings.find((s) => s.id === symmetry);
  const kept =
    chosen?.kind === "choice" && chosen.gives === undefined
      ? chosen.choices.map((c) => c.symmetry)
      : undefined;
  if (
    kept === undefined ||
    kept.some((s) => s === undefined || SET_BLACKS_SYMM[s] === undefined)
  )
    throw new CompileError(
      `deal sample first: ${symmetry} is no option of the symmetries first cells keep (${Object.keys(SET_BLACKS_SYMM).join(", ")})`,
    );
}
