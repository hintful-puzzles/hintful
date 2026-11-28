/**
 * A fill game's params, from its description: `WxH`, `d<letter>` and the
 * settings the deal reads, and what `FillDeal` says of a deal. The desc is
 * `desc.ts`'s.
 */

import { difficultyItem, noSuchTier } from "../contract/difficulty.ts";
import type { ParamConfigItem } from "../contract/game.ts";
import { dimensionParamConfig, parseConfigInt } from "../game-id/params.ts";
import {
  choice,
  dims,
  paramsCodec,
  size,
  unusedLetter,
} from "../game-id/params-codec.ts";
import type { Symmetry } from "../generate/symmetry.ts";
import { type GridSpace, type Partition, perPlace } from "../solve/describe-runtime.ts";
import type { Clues } from "./board.ts";
import type { IdSegment } from "./desc.ts";
import { equalSize } from "./divide.ts";
import type { FillGrow } from "./grow.ts";
import { beyond, type FillBounds, type SizeBounds } from "./params/bounds.ts";
import { leastWords } from "./params/choice.ts";
import type { PresetSettings, SettingContext } from "./params/setting.ts";
import {
  type FillSetting,
  kindOf,
  settingRefusal,
  sizeChoices,
} from "./params/settings.ts";
import { piecesOf, tallyClue, tallyIn } from "./params/tally.ts";
import { tierAliasSegment, tierFlagSegment } from "./params/tiers.ts";
import type { PartsSpace } from "./parts.ts";
import { type Sample, samplePieces } from "./sample.ts";

/** The elements of the space a clue kind sits at. */
export type Universe = "cells" | "lines" | "edges" | "slots" | "corners";

/** The elements a clue kind sits at: the space's, the parts of the deal's
 * one partition, or a clue at the board's records. */
export type ClueUniverse = Universe | "parts" | "board";

/** The clue kinds at the dealt partition's parts. */
export const partKindsOf = (deal?: FillDeal): string[] =>
  Object.entries(deal?.universes ?? {})
    .filter(([, u]) => u === "parts")
    .map(([k]) => k);

/** The values kind `kind`, one a value, is dealt for on a board whose
 * domain tops at `top`: its own list, or each from 1. */
export const valuesOfKind = (
  deal: FillDeal,
  kind: string,
  top: number,
): readonly number[] =>
  deal.perOf?.[kind] ?? Array.from({ length: top }, (_, d) => d + 1);

/** How many elements kind `kind` may sit at on a board dealt `clues`. */
export function elementCount<C extends Clues<C>>(
  deal: FillDeal,
  sp: GridSpace,
  clues: C,
  kind: string,
): number {
  const u = deal.universes[kind];
  if (u === undefined) throw new Error(`deal: no clue kind ${kind}`);
  if (u === "board") return recordsOf(deal, kind).keys.length;
  if (u !== "parts")
    // A kind one a value sits at an element and a value.
    return deal.perValue?.includes(kind) === true
      ? perPlace(sp[u].length, 0)
      : sp[u].length;
  // A board its partition is not dealt on has no part for it (Solo's
  // cages, Killer's alone).
  return (
    (clues[partitionOfKind(deal, kind) as keyof C] as Partition | undefined)?.parts
      .length ?? 0
  );
}

/** The records a clue at the board the deal derives may hold. */
export function recordsOf(deal: FillDeal, kind: string): FillRecords {
  const r = deal.records?.[kind];
  if (r === undefined)
    throw new Error(`deal: ${kind} is no clue at the board it derives`);
  return r;
}

/** The partition kind `kind` sits at the parts of. */
export function partitionOfKind(deal: FillDeal, kind: string): string {
  const partition = deal.partsOf?.[kind];
  if (partition === undefined) throw new Error(`deal: ${kind} sits at parts of none`);
  return partition;
}

/** A kind the deal hides (`FillDeal.hide`). */
export interface HiddenKind {
  readonly kind: string;
  /** Its clues are each tried before those of a kind without (upstream's
   * givens before its clues). */
  readonly first?: true;
  /** Kept whole on a board below this tier, by its index. */
  readonly from?: number;
  /** Hidden whole on a board below a tier, by the tier's index, with
   * variation `with` on or of `ruleset`, a choice of a size's setting by
   * its index, where given, and within bounds: the answer is drawn again
   * until the board finishes without it. */
  readonly whole?: {
    readonly below: number;
    readonly bounds: SizeBounds;
    readonly with?: string;
    readonly ruleset?: { readonly setting: string; readonly choice: number };
  };
  /** Hidden only where this flag is on, and then a board hiding none of it
   * is drawn again. */
  readonly when?: string;
  /** The hidden kind whose clue at the same place goes first: this kind's
   * clue there is tried straight after that one goes, and kept while it is
   * shown (Salad's ball, left where its number was). */
  readonly after?: string;
  /** A clue goes only while another of its value stays shown, so each value
   * the kind deals keeps a clue (upstream map.c's colors). */
  readonly last?: true;
}

/** What a compiled fill module says of its deal (`deal`). */
export interface FillDeal {
  /** Whether the grid is as high as it is wide, so one size gives both. */
  readonly square?: true;
  /** Where the board is a hexagon (`describe-runtime/hexagon.ts`): the clue kind
   * every cell outside it holds, which the desc does not write. */
  readonly hexagon?: { readonly outside: string };
  /** Where the board's cells are a partition's parts (`parts.ts`): the
   * partition of the params' squares, the size counting its parts, and the
   * relations read off it, the parts sharing a side. */
  readonly parts?: PartsSpace;
  /** The settings the params give, in their order (`params/settings.ts`). */
  readonly settings: readonly FillSetting[];
  readonly sample: Sample | null;
  /** The kinds the deal hides while the board still finishes, in one random
   * order, each as `HiddenKind` says. */
  readonly hide?: readonly HiddenKind[];
  /** The techniques, by id, that may not alone place every square of the
   * answer holding the module's `refusePlaces`: a board they finish so is
   * drawn again. */
  readonly refuse?: { readonly by: readonly string[] };
  /** Where a search tier's strip starts every draw: from every clue, not
   * from a board of the lowest tier one draw in eight (Sticks'). */
  readonly stripFrom?: "everyClue";
  /** A bare letter older IDs write for a tier, by its index: read, never
   * written. */
  readonly tierFlag?: { readonly letter: string; readonly tier: number };
  /** Bare letters older IDs write after the size or the tier: read, never
   * written, and changing nothing. */
  readonly unusedLetters?: Readonly<Record<string, "size" | "tier">>;
  /** Retired tier letters a `d` may carry, each read as a tier's index. */
  readonly tierAliases?: Readonly<Record<string, number>>;
  /** The clue kind at a cell of which two side by side and alike are both
   * taken off, so the answer is the ladder's and not the sample. */
  readonly unpair?: string;
  /** The kind on every cell numbered as a Latin square, and the value under
   * which a cell is renumbered to repeat a number of its row or column
   * (`latin-numbers.ts`). */
  readonly latin?: { readonly kind: string; readonly under: number };
  /** The symmetry the clues it leaves keep, or the setting that chooses it:
   * the clues at the squares of one orbit are hidden together. */
  readonly symmetric?: Symmetry | { readonly option: string };
  /** The flag under which the hide tries every clue, and as many as the
   * board's shorter side where it is off; absent, it tries every one. */
  readonly thorough?: string;
  /** How it grows a dealt partition round the answer. */
  readonly grow?: FillGrow;
  /** How it divides each dealt partition it divides, apart from the answer
   * and in this order (`divide.ts`). */
  readonly divide?: readonly FillDivide[];
  /** The dealt partition merged on the answer: a cell a part while the
   * answer is drawn, then neighbors joined while it keeps its rules
   * (`deal/partition.ts`' `merged`). */
  readonly merge?: { readonly partition: string };
  /** The kinds at the divided partition's parts dealt one a part. */
  readonly oneKind?: {
    readonly kinds: readonly string[];
    readonly partition: string;
    /** Some of `kinds` it deals alone where the flag `when` is on. */
    readonly alone?: { readonly kinds: readonly string[]; readonly when: string };
  };
  /** Kinds at one place of which an element holds one clue: the first in
   * this order the answer makes there (`deal.oneKind`'s `pick: first`). */
  readonly firstKind?: readonly string[];
  readonly id: readonly IdSegment[];
  /** Each of `id`'s segments' clue kinds, by its index, where a ruleset
   * deals a kind (`Choice.deals`): a segment whose every kind the board is
   * not dealt is neither written nor read. */
  readonly idKinds?: readonly (readonly string[])[];
  /** Where each clue kind sits. */
  readonly universes: Readonly<Record<string, ClueUniverse>>;
  /** The kinds dealt one a value at each element (`per: value`), each clue
   * at its element and value's place (`perPlace`). */
  readonly perValue?: readonly string[];
  /** The values a kind of `perValue` is dealt for, by kind, where those are
   * some of the domain's alone (Magnets' + and −); else each from 1. */
  readonly perOf?: Readonly<Record<string, readonly number[]>>;
  /** The partition each kind at parts sits at, by kind. */
  readonly partsOf?: Readonly<Record<string, string>>;
  /** The records each clue at the board the deal derives may hold, by kind
   * (Undead's totals). */
  readonly records?: Readonly<Record<string, FillRecords>>;
  /** The dealt partitions, by name: Norinori's regions. */
  readonly partitions?: readonly string[];
  readonly tierLetters: string;
  /** Each clue kind's smallest value, which a desc may not go below. */
  readonly least?: Readonly<Record<string, number>>;
  readonly sizes: Readonly<
    Record<
      string,
      { readonly min: number; readonly max?: number; readonly step?: number }
    >
  >;
}

/** A clue at the board the deal derives: its fields in order, and each record
 * it may hold as the values of every field but the last, which the answer
 * gives and the ID writes. */
export interface FillRecords {
  readonly fields: readonly string[];
  readonly keys: readonly (readonly number[])[];
  /** Where the deal reads a record a binding (`deal.records`), as many
   * records as the board deals, each one list field, whose members run from
   * `least` to `most`: Crossing's numbers. `keys` is then empty. */
  readonly bound?: { readonly least: number; readonly most: number };
}

/** A dealt partition divided at random apart from the answer
 * (`deal.divide`), as `FillDivision` cuts it. One with a `variation` is
 * divided only on a board it is on (the blocks Solo's Jigsaw deals). */
export type FillDivide = FillDivision & {
  readonly partition: string;
  readonly variation?: string;
};

/** How a division cuts the board into parts: into small parts, each cell
 * joined at odds `pairs` to a neighbor alone, then each left alone to a
 * neighboring part under `most` cells; a part at a time grown to a size
 * drawn from one of `sizes`, the first, or with `by` the one at the
 * setting's value less its least; the board tiled by parts of `equal`
 * cells, a number, a size the params give, or `w`, the board's width; or
 * tiled by `dominoes`, a square left alone where the area is odd. */
export type FillDivision =
  | { readonly dominoes: true }
  | { readonly pairs: number; readonly most: number }
  | {
      readonly sizes: readonly (readonly number[])[];
      readonly by?: { readonly size: string; readonly min: number };
    }
  | { readonly equal: number | string }
  | { readonly seeds: string };

/** The divides of `deal` a board with `variations` on is dealt. */
export const dividesOn = (
  deal: FillDeal,
  variations: readonly string[],
): readonly FillDivide[] =>
  (deal.divide ?? []).filter(
    (d) => d.variation === undefined || variations.includes(d.variation),
  );

export interface FillParams {
  w: number;
  h: number;
  diff: number;
  /** The variations on, by name, in the settings' order; absent where none
   * is, as on every board of a game with none. */
  variations?: readonly string[];
  /** The sizes beyond the grid's, by name, in a game whose params give any;
   * absent in any other. */
  sizes?: Readonly<Record<string, number>>;
  /** The settings only the deal reads, by id (`params/setting.ts`), in a game
   * that has any; absent in any other. */
  settings?: Readonly<Record<string, number>>;
  /** The tally's count of each length from 1, in a game whose params give
   * one; absent in any other. */
  tally?: readonly number[];
}

/** The sizes beyond the grid's that `p` gives. */
export const sizesOf = (p: FillParams): Readonly<Record<string, number>> =>
  p.sizes ?? {};

/** The clues the params give a board of `p`: its sizes beyond the grid's,
 * and its tally. */
export const givenOf = (
  deal: FillDeal,
  p: FillParams,
): Readonly<
  Record<string, number | Readonly<Record<string, number | readonly number[]>>>
> => {
  const t = tallyIn(deal);
  return t === null ? sizesOf(p) : { ...sizesOf(p), [t.id]: tallyClue(t, p) };
};

/** Each clue kind's largest value at an element (`clueMax`); a partition has
 * none. A kind at a partition's parts reads the part's cells off `cl`, the
 * clues read so far, which hold the partition. */
export type ClueMax<C> = {
  readonly [K in keyof C]?: (sp: GridSpace, at: number, cl: C) => number;
};

/** Each setting of `deal` set on `p`, a preset board's params, as `board`
 * names it or at its default. */
export function startSettings(
  deal: FillDeal,
  p: FillParams,
  board: PresetSettings,
): FillParams {
  const out = { ...p };
  for (const s of deal.settings) kindOf(s).start(s, out, board);
  return out;
}

/**
 * The params' custom form and codec: the grid's size, or its blocks; the
 * settings written after it; the tier by its letter, which only a full ID
 * carries; the settings written after the tier; and what the form's bounds
 * cannot say, a size off its step or past the bounds. Each kind of setting
 * is a module of `params/`, and the settings' order is the params' grammar
 * and the dialog's.
 */
export function fillParams(
  deal: FillDeal,
  tiers: readonly string[],
  defaults: () => FillParams,
  bounds: FillBounds = { all: {}, tiers: [] },
  usual: SettingContext["usual"] = (_p, id) => {
    const s = deal.settings.find((x) => x.id === id);
    return s !== undefined && "default" in s ? s.default : 0;
  },
): {
  paramConfig: ParamConfigItem<FillParams>[];
  encodeParams(p: FillParams, full: boolean): string;
  decodeParams(s: string): FillParams;
  validateParams(p: FillParams, full: boolean): string | null;
} {
  const w = deal.sizes["w"];
  const step = w?.step;
  const cx: SettingContext = { deal, tiers, usual };
  const blocks = deal.settings.find((s) => s.kind === "blocks") ?? null;
  const placed = (after: "size" | "tier") =>
    deal.settings.filter(
      (s) => s.kind !== "blocks" && (s.after === "tier") === (after === "tier"),
    );
  const sizeBounds =
    w === undefined
      ? {}
      : { bounds: { min: w.min, ...(w.max === undefined ? {} : { max: w.max }) } };
  const least = leastWords(sizeChoices(deal));
  const itemsOf = (after: "size" | "tier") =>
    placed(after).flatMap((s) => kindOf(s).items(s, cx));
  const paramConfig: ParamConfigItem<FillParams>[] = [
    ...(blocks !== null
      ? kindOf(blocks).items(blocks, cx)
      : deal.square === true
        ? [
            {
              kw: "grid-size",
              name: "Grid size",
              type: "string" as const,
              doc: `Width and height of the grid, which is square.${least}`,
              ...sizeBounds,
              label: {
                slot: "size" as const,
                words: (p: FillParams) => `${p.w}x${p.w}`,
              },
              get: (p: FillParams) => String(p.w),
              set: (p: FillParams, v: string) => {
                p.w = p.h = parseConfigInt(v);
              },
            },
          ]
        : dimensionParamConfig<FillParams>({
            doc: `Size of the grid in squares.${step === 2 ? " Both must be even." : ""}${least}`,
            ...sizeBounds,
          })),
    ...itemsOf("size"),
    difficultyItem(tiers, "diff"),
    ...itemsOf("tier"),
  ];
  const unused = (after: "size" | "tier") =>
    Object.entries(deal.unusedLetters ?? {})
      .filter(([, at]) => at === after)
      .map(([letter]) => unusedLetter<FillParams>(letter));
  const segmentsOf = deal.settings.map((s) => ({
    s,
    ...kindOf(s).segments(s, paramConfig, cx),
  }));
  const here = (after: "size" | "tier") =>
    segmentsOf
      .filter(
        ({ s }) => s.kind !== "blocks" && (s.after === "tier") === (after === "tier"),
      )
      .flatMap((x) => x.here);
  return {
    paramConfig,
    ...paramsCodec(defaults, [
      ...(blocks !== null
        ? segmentsOf.filter(({ s }) => s === blocks).flatMap((x) => x.here)
        : [deal.square === true ? size(paramConfig, "grid-size") : dims(paramConfig)]),
      ...unused("size"),
      ...here("size"),
      ...(deal.tierFlag === undefined ? [] : [tierFlagSegment(deal.tierFlag)]),
      ...(deal.tierAliases === undefined ? [] : [tierAliasSegment(deal.tierAliases)]),
      choice(paramConfig, "d", "difficulty", deal.tierLetters, { full: true }),
      ...unused("tier"),
      ...here("tier"),
      ...segmentsOf.flatMap((x) => (x.last === undefined ? [] : [x.last])),
    ]),
    validateParams(p, full) {
      // Returned as the call, so the refusal scan reads its sentences; the
      // second call is made only on a refusal.
      for (const s of deal.settings)
        if (settingRefusal(s, p, full, cx) !== null)
          return settingRefusal(s, p, full, cx);
      // The pieces fit where they can be laid on the board, taken upright.
      const { sample } = deal;
      if (
        sample !== null &&
        "pieces" in sample &&
        samplePieces(
          sample,
          Math.min(p.w, p.h),
          Math.max(p.w, p.h),
          piecesOf(deal, p),
          null,
        ) === null
      )
        return `The ${tallyIn(deal)?.id ?? "pieces"} does not fit into the grid.`;
      // Parts of one size tile the board where it divides the board's area.
      if (
        sample !== null &&
        "walls" in sample &&
        "equal" in sample.walls.division &&
        (p.w * p.h) % equalSize(sample.walls.division, p, sizesOf(p)) !== 0
      )
        return `The region size must divide the number of squares, ${p.w * p.h}.`;
      const outside = beyond(bounds.all, p);
      if (outside !== null) return `${outside}.`;
      // A tier's own bounds hold of the board a deal makes, which only a full
      // ID's tier names.
      if (full)
        for (const { tier, ...b } of bounds.tiers)
          if (tier === p.diff && beyond(b, p) !== null)
            return noSuchTier(`${p.w}x${p.h} puzzle`, tiers[tier]);
      if (step !== undefined && (p.w % step !== 0 || p.h % step !== 0))
        return step === 2
          ? "Width and height must both be even."
          : `Width and height must both be multiples of ${step}.`;
      return null;
    },
  };
}
