/**
 * The checks of a fill game's `id:`, the segments its game ID is written by
 * (`engine/fill/desc.ts`): each segment can write the kind it names, and the
 * ID names every clue kind and dealt partition once.
 */

import { CompileError, type Env } from "../compile-sorts.ts";
import {
  codeOf,
  type Description,
  type DescriptionJson,
  type IdSegmentJson,
  type SizeRange,
  segmentKinds,
} from "../description.ts";
import { dealtPartitions } from "./partitions.ts";
import {
  flagKind,
  isElement,
  lowBound,
  markerKind,
  partBound,
  sizeBound,
  valuesOf,
} from "./values.ts";

/** Refuses a `codes` segment whose kinds sit at different places, or at a
 * part, whose code a clue could be written by two ways, or that leaves a
 * value of a kind no code writes. */
function checkCodes(codes: Readonly<Record<string, string>>, d: Description, env: Env) {
  const said = Object.entries(codes).map(([code, s]) => ({ code, ...codeOf(s) }));
  const ats = new Set(said.map((s) => d.clueKinds.get(s.kind)?.at));
  const [at] = ats;
  if (at === undefined || ats.size > 1 || env.regions.has(at) || at === "board")
    throw new CompileError(
      "id: codes of kinds that are not all clues at one place of the space",
    );
  for (const { code, kind, value } of said) {
    if (isElement(env, kind))
      throw new CompileError(
        `id: the code ${code} of ${kind}, which is valued an element`,
      );
    const vs = valuesOf(d, kind);
    if (value !== null && vs !== null && (value < vs[0] || value > vs[1]))
      throw new CompileError(
        `id: the code ${code}, ${kind} ${value}, which it cannot be`,
      );
  }
  // A kind is written by its number after its code, or wholly by the codes
  // of each of its values.
  const kinds = new Set(said.map((s) => s.kind));
  for (const kind of kinds) {
    const numbered = said.filter((s) => s.kind === kind && s.value === null).length;
    const whole = said.filter((s) => s.kind === kind && s.value !== null);
    const vs = valuesOf(d, kind);
    if (numbered > 1)
      throw new CompileError(`id: ${kind} has ${numbered} codes its number follows`);
    if (new Set(whole.map((s) => s.value)).size !== whole.length)
      throw new CompileError(`id: two codes of one value of ${kind}`);
    if (numbered === 0 && (vs === null || whole.length !== vs[1] - vs[0] + 1))
      throw new CompileError(`id: a value of ${kind} that no code writes`);
  }
}

/** Refuses an `id:` segment that cannot write the kind it names. */
export function checkSegments(
  id: readonly IdSegmentJson[],
  d: Description,
  env: Env,
  sizes: Readonly<Record<string, SizeRange>>,
  json: DescriptionJson,
): void {
  for (const [i, seg] of id.entries()) {
    const [kind, ...more] = segmentKinds(seg);
    if ("walls" in seg || "blocks" in seg) {
      if (!dealtPartitions(env).includes(kind))
        throw new CompileError(`id: walls of ${kind}, which is no dealt partition`);
      continue;
    }
    if ("parts" in seg) {
      if (!env.regions.has(seg.parts))
        throw new CompileError(
          `id: parts of ${seg.parts}, which is no dealt partition`,
        );
      // A part holds one clue, so its letter says its kind.
      for (const k of segmentKinds(seg)) {
        const at = d.clueKinds.get(k)?.at;
        if (at !== seg.parts || isElement(env, k))
          throw new CompileError(
            `id: parts' letter for ${k}, which is no number at a part of ${seg.parts}`,
          );
      }
      // Each part is written after the partition, which says where it is.
      const blocks = id.findIndex(
        (s) =>
          ("blocks" in s && s.blocks === seg.parts) ||
          ("walls" in s && s.walls === seg.parts),
      );
      if (blocks < 0 || blocks > i)
        throw new CompileError(`id: parts of ${seg.parts} before the partition itself`);
      continue;
    }
    if ("codes" in seg) {
      checkCodes(seg.codes, d, env);
      continue;
    }
    const c = d.clueKinds.get(kind);
    if (c === undefined) throw new CompileError(`id: no clue kind ${kind}`);
    if ("records" in seg) {
      // 0 is a record's cell with no clue, so no clue is 0.
      const lo = c.value?.k === "call" ? c.value.args[0] : undefined;
      if (c.at !== "cell" || isElement(env, kind) || lo?.k !== "num" || lo.v < 1)
        throw new CompileError(
          `id: records of ${kind}, which is not a cell's number from 1 up`,
        );
      const sides = d.clueKinds.get(seg.sides);
      if (
        sides?.at !== "edge" ||
        !(isElement(env, seg.sides) || flagKind(d, seg.sides))
      )
        throw new CompileError(
          `id: sides of ${seg.sides}, which is not an edge's clue valued one of its ends, nor 0 or 1 at every edge`,
        );
      continue;
    }
    // Only a record says which end of an edge a clue is valued.
    if (isElement(env, kind))
      throw new CompileError(
        `id: ${kind} is valued an element, which only a record's sides write`,
      );
    const values = valuesOf(d, kind);
    if ("runs" in seg && !markerKind(d, kind))
      throw new CompileError(
        `id: runs of ${kind}, which is not a cell's one-valued marker`,
      );
    const after = "digits" in seg ? (seg.after ?? {}) : {};
    for (const m of more)
      if (!Object.values(after).includes(m) && !markerKind(d, m))
        throw new CompileError(
          `id: the letter of ${m}, which is not a cell's one-valued marker`,
        );
    if ("digits" in seg) {
      for (const letter of Object.keys(seg.letters ?? {}))
        if (seg.apart === letter)
          throw new CompileError(`id: the letter ${letter} is the digits' apart`);
      // The segment behind its mark is written where its own kind has a
      // clue, so it holds no other kind's.
      if (
        seg.before !== undefined &&
        more.length + Object.keys(seg.also ?? {}).length > 0
      )
        throw new CompileError(
          `id: digits of ${kind} after ${seg.before}, written only where ${kind} has a clue, and another kind in the segment`,
        );
      // A letter's number is one digit, written straight after it.
      for (const [letter, k] of Object.entries(after)) {
        const vs = valuesOf(d, k);
        if (seg.letters?.[letter] === undefined)
          throw new CompileError(`id: a number after ${letter}, which is no letter`);
        if (d.clueKinds.get(k)?.at !== "cell" || vs === null || vs[0] < 0 || vs[1] > 9)
          throw new CompileError(
            `id: digits of ${k} after ${letter}, which is not a cell's clue of the values 0 to 9`,
          );
      }
      // A number another kind is written as is past every one of the
      // segment's own.
      for (const n of Object.keys(seg.also ?? {}))
        if (values === null || Number(n) <= values[1])
          throw new CompileError(
            `id: ${n} written for another kind, which a clue of ${kind} may be`,
          );
    }
    // A dot run's case is its value, one of two.
    if (
      "dots" in seg &&
      (c.at !== "cell" ||
        values === null ||
        values[1] - values[0] !== 1 ||
        [...seg.cases].sort().join() !== values.join())
    )
      throw new CompileError(
        `id: dots of ${kind}, which is not a cell's clue of the values ${seg.cases.join(" and ")}`,
      );
    if ("dots" in seg && i !== id.length - 1)
      throw new CompileError(`id: dots of ${kind} end the desc, and come last`);
    // A digit is a clue's value, so every value is one, the most a size
    // bounds it by too (Mathrax's givens, to `w`); with a mark between two
    // side by side, a clue is a whole number of any size.
    const top = values?.[1] ?? partBound(c.value, json) ?? sizeBound(c.value, sizes);
    if (
      "digits" in seg &&
      seg.apart === undefined &&
      (c.at !== "cell" || (values?.[0] ?? lowBound(c.value)) < 0 || top > 9)
    )
      throw new CompileError(
        `id: digits of ${kind}, which is not a cell's clue of the values 0 to 9`,
      );
    if ("cells" in seg && c.at !== "cell")
      throw new CompileError(`id: cells of ${kind}, which is not a cell's clue`);
    // A part's clue is written at the part's first cell (Solo's Killer
    // totals), so its partition is read before it, and nothing else is.
    const partClue = env.regions.has(c.at);
    const readBefore = id
      .slice(0, i)
      .some(
        (s) =>
          ("blocks" in s && s.blocks === c.at) || ("walls" in s && s.walls === c.at),
      );
    const alone =
      "digits" in seg &&
      Object.keys({ ...seg.letters, ...seg.after, ...seg.also }).length === 0;
    if ("digits" in seg && partClue && (!readBefore || !alone))
      throw new CompileError(
        `id: digits of ${kind}, a clue at a part, alone in its segment and after its partition`,
      );
    if ("digits" in seg && seg.apart !== undefined && c.at !== "cell" && !partClue)
      throw new CompileError(`id: digits of ${kind}, which is not a cell's clue`);
  }
}

/** The grid's hexagon, its outside kind held to be a cell's marker. */
export function hexagonOf(
  json: DescriptionJson,
  isMarker: (kind: string) => boolean,
): { outside: string } | null {
  const hexagon = json.space.grid?.hexagon;
  if (hexagon === undefined) return null;
  if (!isMarker(hexagon.outside))
    throw new CompileError(
      `space hexagon: outside ${hexagon.outside}, which is not a cell's one-valued marker`,
    );
  return hexagon;
}

/** Refuses an ID that names a clue kind or partition other than once. A
 * hexagon's corners hold its `outside` kind unwritten, so the ID may name it
 * nowhere. */
export function checkNamed(
  id: readonly IdSegmentJson[],
  kinds: readonly string[],
  outside: string | null,
): void {
  const named = id.flatMap(segmentKinds);
  for (const kind of kinds) {
    const n = named.filter((k) => k === kind).length;
    if (n !== 1 && !(n === 0 && kind === outside))
      throw new CompileError(`id: clue kind or partition ${kind} is not named once`);
  }
}
