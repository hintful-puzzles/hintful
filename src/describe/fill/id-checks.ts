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
import { codeSaid, isNumberCode } from "../../engine/fill/segments/code-said.ts";
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
 * The clue kind a segment of numbers is of, refused where it is valued an
 * element, which only a record's sides write.
 */
function numbered(kind: string, { d, env }: IdCheck) {
  const c = clueKind(kind, d);
  if (isElement(env, kind))
    throw new CompileError(
      `id: ${kind} is valued an element, which only a record's sides write`,
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
    check: (seg, cx) => more(seg, cx, numbered(name(seg), cx)),
  };
}

/** A stream's codes, each with what it stands for. */
const codesOf = (seg: SegmentOf<"codes">) =>
  Object.entries(seg.codes ?? {}).map(([code, s]) => ({ code, ...codeSaid(s) }));

/** The kinds a stream writes: its own, its codes', and those whose number
 * may follow a code. */
const streamNames = (seg: SegmentOf<"codes">): string[] => [
  ...new Set([
    ...(seg.digits === undefined ? [] : [seg.digits]),
    ...codesOf(seg).flatMap((c) =>
      c.follows === null ? [c.kind] : [c.kind, c.follows],
    ),
  ]),
];

/** Refuses a stream's codes where they cannot be read back: codes of kinds
 * that sit at different places, at a part or on the board, or apart from
 * the segment's own kind's cells; a clue a code could be written by two
 * ways, or a value no code writes; a number standing for a kind where it
 * may be one of the segment's own; and a number after a code that is not
 * a cell's digit. */
function checkCodes(
  seg: SegmentOf<"codes">,
  { d, env }: IdCheck,
  own: ReturnType<typeof numbered> | null,
): void {
  const said = codesOf(seg);
  if (said.length === 0) return;
  const ats = new Set(said.map((s) => d.clueKinds.get(s.kind)?.at));
  const [at] = ats;
  if (at === undefined || ats.size > 1 || env.regions.has(at) || at === "board")
    throw new CompileError(
      "id: codes of kinds that are not all clues at one place of the space",
    );
  if (own !== null && at !== "cell")
    throw new CompileError(`id: codes beside digits of ${own.kind}, not at cells`);
  for (const { code, kind, value, follows } of said) {
    if (isElement(env, kind))
      throw new CompileError(
        `id: the code ${code} of ${kind}, which is valued an element`,
      );
    const vs = valuesOf(d, kind);
    if (value !== null && vs !== null && (value < vs[0] || value > vs[1]))
      throw new CompileError(
        `id: the code ${code}, ${kind} ${value}, which it cannot be`,
      );
    if (seg.apart !== undefined && code.startsWith(seg.apart))
      throw new CompileError(`id: the code ${code} begins with the stream's apart`);
    if (isNumberCode(code)) {
      if (own === null || value === null || follows !== null)
        throw new CompileError(
          `id: the number ${code}, which stands whole for a kind, in place of one of digits' own`,
        );
      if (own.values === null || Number(code) <= own.values[1])
        throw new CompileError(
          `id: ${code} written for another kind, which a clue of ${own.kind} may be`,
        );
    }
    if (follows !== null) {
      // The number after a code is one digit, written straight after it.
      const tv = valuesOf(d, follows);
      if (value === null)
        throw new CompileError(`id: the code ${code} has a number after it twice`);
      if (
        d.clueKinds.get(follows)?.at !== "cell" ||
        tv === null ||
        tv[0] < 0 ||
        tv[1] > 9
      )
        throw new CompileError(
          `id: digits of ${follows} after ${code}, which is not a cell's clue of the values 0 to 9`,
        );
    }
  }
  // A kind is written by its number after its code, or wholly by the codes
  // of each of its values.
  for (const kind of new Set(said.map((s) => s.kind))) {
    const numberedCodes = said.filter(
      (s) => s.kind === kind && s.value === null,
    ).length;
    const whole = said.filter((s) => s.kind === kind && s.value !== null);
    const vs = valuesOf(d, kind);
    if (numberedCodes > 1)
      throw new CompileError(
        `id: ${kind} has ${numberedCodes} codes its number follows`,
      );
    if (new Set(whole.map((s) => s.value)).size !== whole.length)
      throw new CompileError(`id: two codes of one value of ${kind}`);
    if (numberedCodes === 0 && (vs === null || whole.length !== vs[1] - vs[0] + 1))
      throw new CompileError(`id: a value of ${kind} that no code writes`);
  }
}

/** Refuses `sides` that name a side twice, one way and the other. */
function checkSides(sides: readonly string[]): void {
  const named = sides.map((s) => s.split(" ")[0]);
  if (new Set(named).size !== named.length)
    throw new CompileError(`id: sides ${sides.join(", ")}, a side named twice`);
}

/** What the compiler reads of a stream, by either of its keys. */
const STREAM: SegmentRead<SegmentOf<"codes">> = {
  names: streamNames,
  check(seg, cx) {
    const { id, i, env, json } = cx;
    if (seg.lastRun === false && i !== id.length - 1)
      throw new CompileError("id: a stream whose last run is left off comes last");
    if (seg.digits === undefined) {
      checkCodes(seg, cx, null);
      return;
    }
    const own = numbered(seg.digits, cx);
    const { kind, c, values } = own;
    checkCodes(seg, cx, own);
    if (seg.sides !== undefined && c.at !== "slot")
      throw new CompileError(`id: sides, on digits of ${kind}, which is not at a slot`);
    if (seg.sides !== undefined) checkSides(seg.sides);
    // A glyph is one character, as the board draws the value: an answer's
    // value given or a clue that says one, on a board of numbers.
    if (seg.glyphs === true) {
      if (json.play?.numbers === undefined)
        throw new CompileError(`id: glyphs of ${kind}, on a board that draws none`);
      if (kind !== "given" && json.clues?.[kind]?.glyph !== true)
        throw new CompileError(
          `id: glyphs of ${kind}, which is no given and no clue with \`glyph\``,
        );
      if (seg.apart !== undefined)
        throw new CompileError(`id: glyphs of ${kind}, one character, and an apart`);
      if (codesOf(seg).some((s) => isNumberCode(s.code)))
        throw new CompileError(
          `id: glyphs of ${kind}, and a number standing for a kind`,
        );
      return;
    }
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
    if (partClue && (!writtenBefore(id, i, c.at) || seg.codes !== undefined))
      throw new CompileError(
        `id: digits of ${kind}, a clue at a part, alone in its segment and after its partition`,
      );
    if (seg.apart !== undefined && c.at !== "cell" && !partClue)
      throw new CompileError(`id: digits of ${kind}, which is not a cell's clue`);
  },
};

const SEGMENTS: { readonly [K in SegmentKey]: SegmentRead<SegmentOf<K>> } = {
  blocks: partition((seg) => seg.blocks),
  walls: partition((seg) => seg.walls),
  parts: {
    // A part's one clue is named by its code; the partition is the
    // `blocks` or `walls` segment's.
    names: (seg) => [...new Set(Object.values(seg.codes).map((s) => codeSaid(s).kind))],
    check(seg, { id, i, d, env }) {
      if (!env.regions.has(seg.parts))
        throw new CompileError(
          `id: parts of ${seg.parts}, which is no dealt partition`,
        );
      // A part holds one clue, so its code says its kind, and its number
      // follows.
      for (const [code, s] of Object.entries(seg.codes)) {
        const { kind: k, value, follows } = codeSaid(s);
        const at = d.clueKinds.get(k)?.at;
        if (at !== seg.parts || isElement(env, k) || value !== null || follows !== null)
          throw new CompileError(
            `id: parts' code ${code} for ${s}, which is no number at a part of ${seg.parts}`,
          );
      }
      // Each part is written after the partition, which says where it is.
      if (!writtenBefore(id, i, seg.parts))
        throw new CompileError(`id: parts of ${seg.parts} before the partition itself`);
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
  spans: numbers(
    (seg) => seg.spans,
    (_seg, { d }, { kind }) => {
      if (!markerKind(d, kind))
        throw new CompileError(
          `id: spans of ${kind}, which is not a cell's one-valued marker`,
        );
    },
  ),
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
  numbers: numbers(
    (seg) => seg.numbers,
    (seg, { json, id, i }, { kind, c }) => {
      // Records read a binding are as many as the board deals, so they are
      // read to the desc's end.
      if (json.deal?.records?.[kind] !== undefined && i !== id.length - 1)
        throw new CompileError(
          `id: numbers of ${kind}, whose records the deal reads a binding, end the desc, and come last`,
        );
      if (seg.sides === undefined) return;
      if (c.at !== "slot")
        throw new CompileError(
          `id: sides, on numbers of ${kind}, which is not at a slot`,
        );
      checkSides(seg.sides);
    },
  ),
  // Last, as `engine/fill/desc.ts` holds them: a `parts` entry holds
  // `codes` too.
  codes: STREAM,
  digits: STREAM,
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

/** The clue kinds, or the dealt partition, `seg` writes. */
export const segmentNames = (seg: IdSegment): readonly string[] =>
  readOf(seg).names(seg);

/** Refuses an `id:` segment that cannot write the kind it names. */
export function checkSegments(
  id: readonly IdSegment[],
  d: Description,
  env: Env,
  json: DescriptionJson,
): void {
  for (const [i, seg] of id.entries()) {
    readOf(seg).check(seg, { id, i, d, env, json });
    // Only `numbers` writes a clue one a value, each element's values in
    // turn.
    if (!("numbers" in seg))
      for (const kind of readOf(seg).names(seg))
        if (env.clues.get(kind)?.per === true)
          throw new CompileError(`id: ${kind} is one a value, which numbers writes`);
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
