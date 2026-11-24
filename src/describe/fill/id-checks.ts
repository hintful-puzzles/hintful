/**
 * The checks of a fill game's `id:`, the segments its game ID is written by
 * (`engine/fill/desc.ts`): each segment can write the kind it names, and the
 * ID names every clue kind and dealt partition once. What the compiler
 * reads of a segment kind is a line of {@link SEGMENTS}, keyed as the
 * engine's kinds are, so a kind the compiler cannot read does not compile.
 * The compiler runs under node's type stripping, which cannot load the
 * engine's segment modules, so it reads their types alone.
 */

import type { IdSegment, SegmentKey, SegmentOf } from "../../engine/fill/desc.ts";
import { codeSaid } from "../../engine/fill/segments/code-said.ts";
import { CompileError, type Env } from "../compile-sorts.ts";
import type { Description, DescriptionJson } from "../description.ts";
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

/** What a segment's check reads: the whole `id:`, and where in it the
 * segment is. */
interface IdCheck {
  readonly id: readonly IdSegment[];
  readonly i: number;
  readonly d: Description;
  readonly env: Env;
  readonly json: DescriptionJson;
}

/** What the compiler reads of a segment kind, `S` its entry. */
interface SegmentRead<S> {
  /** The clue kinds, or the dealt partition, `seg` writes. */
  names(seg: S): readonly string[];
  /** Refuses `seg` where it cannot write what it names. */
  check(seg: S, cx: IdCheck): void;
}

/** A segment that writes a dealt partition's walls. */
function partition<S>(name: (seg: S) => string): SegmentRead<S> {
  return {
    names: (seg) => [name(seg)],
    check(seg, { env }) {
      const kind = name(seg);
      if (!dealtPartitions(env).includes(kind))
        throw new CompileError(`id: walls of ${kind}, which is no dealt partition`);
    },
  };
}

/** Whether `id` writes partition `name` before its `i`th segment. */
const writtenBefore = (id: readonly IdSegment[], i: number, name: string): boolean =>
  id
    .slice(0, i)
    .some(
      (s) => ("blocks" in s && s.blocks === name) || ("walls" in s && s.walls === name),
    );

/** The clue kind `kind`, refused where there is none. */
function clueKind(kind: string, d: Description) {
  const c = d.clueKinds.get(kind);
  if (c === undefined) throw new CompileError(`id: no clue kind ${kind}`);
  return c;
}

/**
 * The clue kind a segment of numbers is of, the first of `names`, refused
 * where it is valued an element, which only a record's sides write; and
 * each further kind it names a cell's one-valued marker, but a kind whose
 * digit follows a letter (`after`).
 */
function numbered(
  names: readonly string[],
  { d, env }: IdCheck,
  after: Readonly<Record<string, string>> = {},
) {
  const [kind, ...more] = names;
  const c = clueKind(kind, d);
  if (isElement(env, kind))
    throw new CompileError(
      `id: ${kind} is valued an element, which only a record's sides write`,
    );
  for (const m of more)
    if (!Object.values(after).includes(m) && !markerKind(d, m))
      throw new CompileError(
        `id: the letter of ${m}, which is not a cell's one-valued marker`,
      );
  return { kind, c, values: valuesOf(d, kind) };
}

/** A segment of one kind's numbers, refused as {@link numbered} refuses
 * it, and by `more` beside. */
function numbers<S>(
  name: (seg: S) => string,
  more: (seg: S, cx: IdCheck, kind: ReturnType<typeof numbered>) => void = () => {},
): SegmentRead<S> {
  return {
    names: (seg) => [name(seg)],
    check: (seg, cx) => more(seg, cx, numbered([name(seg)], cx)),
  };
}

/** The kinds a `digits` segment writes: its own, then the kinds its letters
 * write, those whose digit follows a letter, and those it writes as a
 * number past its own. */
const digitsNames = (seg: SegmentOf<"digits">): string[] => [
  seg.digits,
  ...Object.values(seg.letters ?? {}),
  ...Object.values(seg.after ?? {}),
  ...Object.values(seg.also ?? {}),
];

const SEGMENTS: { readonly [K in SegmentKey]: SegmentRead<SegmentOf<K>> } = {
  blocks: partition((seg) => seg.blocks),
  walls: partition((seg) => seg.walls),
  parts: {
    // A part's one clue is named by its letter; the partition is the
    // `blocks` or `walls` segment's.
    names: (seg) => Object.values(seg.letters),
    check(seg, { id, i, d, env }) {
      if (!env.regions.has(seg.parts))
        throw new CompileError(
          `id: parts of ${seg.parts}, which is no dealt partition`,
        );
      // A part holds one clue, so its letter says its kind.
      for (const k of Object.values(seg.letters)) {
        const at = d.clueKinds.get(k)?.at;
        if (at !== seg.parts || isElement(env, k))
          throw new CompileError(
            `id: parts' letter for ${k}, which is no number at a part of ${seg.parts}`,
          );
      }
      // Each part is written after the partition, which says where it is.
      if (!writtenBefore(id, i, seg.parts))
        throw new CompileError(`id: parts of ${seg.parts} before the partition itself`);
    },
  },
  codes: {
    names: (seg) => [...new Set(Object.values(seg.codes).map((c) => codeSaid(c).kind))],
    /** Refuses codes of kinds that sit at different places, or at a part,
     * a clue a code could be written by two ways, or a value of a kind no
     * code writes. */
    check(seg, { d, env }) {
      const said = Object.entries(seg.codes).map(([code, s]) => ({
        code,
        ...codeSaid(s),
      }));
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
      // A kind is written by its number after its code, or wholly by the
      // codes of each of its values.
      const kinds = new Set(said.map((s) => s.kind));
      for (const kind of kinds) {
        const numbered = said.filter((s) => s.kind === kind && s.value === null).length;
        const whole = said.filter((s) => s.kind === kind && s.value !== null);
        const vs = valuesOf(d, kind);
        if (numbered > 1)
          throw new CompileError(
            `id: ${kind} has ${numbered} codes its number follows`,
          );
        if (new Set(whole.map((s) => s.value)).size !== whole.length)
          throw new CompileError(`id: two codes of one value of ${kind}`);
        if (numbered === 0 && (vs === null || whole.length !== vs[1] - vs[0] + 1))
          throw new CompileError(`id: a value of ${kind} that no code writes`);
      }
    },
  },
  records: {
    names: (seg) => [seg.records, seg.sides],
    check(seg, { d, env }) {
      const kind = seg.records;
      const c = clueKind(kind, d);
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
    },
  },
  runs: numbers(
    (seg) => seg.runs,
    (_seg, { d }, { kind }) => {
      if (!markerKind(d, kind))
        throw new CompileError(
          `id: runs of ${kind}, which is not a cell's one-valued marker`,
        );
    },
  ),
  digits: {
    names: digitsNames,
    check(seg, cx) {
      const { id, i, d, env, json } = cx;
      const after = seg.after ?? {};
      const names = digitsNames(seg);
      const { kind, c, values } = numbered(names, cx, after);
      for (const letter of Object.keys(seg.letters ?? {}))
        if (seg.apart === letter)
          throw new CompileError(`id: the letter ${letter} is the digits' apart`);
      // The segment behind its mark is written where its own kind has a
      // clue, so it holds no other kind's.
      if (
        seg.before !== undefined &&
        names.length - 1 + Object.keys(seg.also ?? {}).length > 0
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
      // A digit is a clue's value, so every value is one, the most a size
      // bounds it by too (Mathrax's givens, to `w`); with a mark between two
      // side by side, a clue is a whole number of any size.
      const top =
        values?.[1] ?? partBound(c.value, json) ?? sizeBound(c.value, json.sizes);
      if (
        seg.apart === undefined &&
        (c.at !== "cell" || (values?.[0] ?? lowBound(c.value)) < 0 || top > 9)
      )
        throw new CompileError(
          `id: digits of ${kind}, which is not a cell's clue of the values 0 to 9`,
        );
      // A part's clue is written at the part's first cell (Solo's Killer
      // totals), so its partition is read before it, and nothing else is.
      const partClue = env.regions.has(c.at);
      const alone =
        Object.keys({ ...seg.letters, ...seg.after, ...seg.also }).length === 0;
      if (partClue && (!writtenBefore(id, i, c.at) || !alone))
        throw new CompileError(
          `id: digits of ${kind}, a clue at a part, alone in its segment and after its partition`,
        );
      if (seg.apart !== undefined && c.at !== "cell" && !partClue)
        throw new CompileError(`id: digits of ${kind}, which is not a cell's clue`);
    },
  },
  dots: numbers(
    (seg) => seg.dots,
    (seg, { id, i }, { kind, c, values }) => {
      // A dot run's case is its value, one of two.
      if (
        c.at !== "cell" ||
        values === null ||
        values[1] - values[0] !== 1 ||
        [...seg.cases].sort().join() !== values.join()
      )
        throw new CompileError(
          `id: dots of ${kind}, which is not a cell's clue of the values ${seg.cases.join(" and ")}`,
        );
      if (i !== id.length - 1)
        throw new CompileError(`id: dots of ${kind} end the desc, and come last`);
    },
  ),
  cells: numbers(
    (seg) => seg.cells,
    (_seg, _cx, { kind, c }) => {
      if (c.at !== "cell")
        throw new CompileError(`id: cells of ${kind}, which is not a cell's clue`);
    },
  ),
  lists: numbers((seg) => seg.lists),
  numbers: numbers((seg) => seg.numbers),
  glyphs: numbers((seg) => seg.glyphs),
};

const KEYS = Object.keys(SEGMENTS) as SegmentKey[];

/** What the compiler reads of the kind `seg` is. */
function readOf(seg: IdSegment): SegmentRead<IdSegment> {
  const key = KEYS.find((k) => k in seg);
  if (key === undefined)
    throw new CompileError(`id: no segment kind for ${JSON.stringify(seg)}`);
  // `key` is in `seg`, so `seg` is the kind's own entry.
  return SEGMENTS[key] as SegmentRead<IdSegment>;
}

/** Refuses an `id:` segment that cannot write the kind it names. */
export function checkSegments(
  id: readonly IdSegment[],
  d: Description,
  env: Env,
  json: DescriptionJson,
): void {
  for (const [i, seg] of id.entries()) readOf(seg).check(seg, { id, i, d, env, json });
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
  id: readonly IdSegment[],
  kinds: readonly string[],
  outside: string | null,
): void {
  const named = id.flatMap((seg) => readOf(seg).names(seg));
  for (const kind of kinds) {
    const n = named.filter((k) => k === kind).length;
    if (n !== 1 && !(n === 0 && kind === outside))
      throw new CompileError(`id: clue kind or partition ${kind} is not named once`);
  }
}
