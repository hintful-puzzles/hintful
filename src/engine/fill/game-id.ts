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
import type { GridSpace, Partition } from "../solve/describe-runtime.ts";
import type { Clues } from "./board.ts";
import type { IdSegment } from "./desc.ts";
import type { FillGrow } from "./grow.ts";
import {
  blocksItems,
  blocksRefusal,
  blocksSegment,
  type FillBlocks,
} from "./params/blocks.ts";
import { beyond, type FillBounds, type SizeBounds } from "./params/bounds.ts";
import {
  type FillHideFlag,
  type FillOnlyFlag,
  flagItem,
  flagSegment,
} from "./params/flags.ts";
import {
  type FillKindLetter,
  kindItems,
  kindLettersRefusal,
  kindLettersSegment,
} from "./params/kind-letters.ts";
import {
  type FillModifier,
  modifierItems,
  modifierRefusal,
  modifierSegments,
} from "./params/modifiers.ts";
import {
  type FillOption,
  optionItem,
  optionRefusal,
  optionSegment,
} from "./params/options.ts";
import {
  type FillSetting,
  leastWords,
  settingItem,
  settingRefusal,
  settingSegment,
} from "./params/settings.ts";
import {
  type FillTally,
  piecesOf,
  tallyClue,
  tallyCountsSegment,
  tallyItems,
  tallyRefusal,
  tallySizeSegment,
} from "./params/tally.ts";
import { type FillThorough, thoroughItem, thoroughSegment } from "./params/thorough.ts";
import { tierAliasSegment, tierFlagSegment } from "./params/tiers.ts";
import { type Sample, samplePieces } from "./sample.ts";

/** The elements of the space a clue kind sits at. */
export type Universe = "cells" | "lines" | "edges" | "slots" | "corners";

/** The elements a clue kind sits at: the space's, or the parts of the deal's
 * one partition. */
export type ClueUniverse = Universe | "parts";

/** The clue kinds at the dealt partition's parts. */
export const partKindsOf = (deal?: FillDeal): string[] =>
  Object.entries(deal?.universes ?? {})
    .filter(([, u]) => u === "parts")
    .map(([k]) => k);

/** How many elements kind `kind` may sit at on a board dealt `clues`. */
export function elementCount<C extends Clues<C>>(
  deal: FillDeal,
  sp: GridSpace,
  clues: C,
  kind: string,
): number {
  const u = deal.universes[kind];
  if (u === undefined) throw new Error(`deal: no clue kind ${kind}`);
  if (u !== "parts") return sp[u].length;
  // A board its partition is not dealt on has no part for it (Solo's
  // cages, Killer's alone).
  return (
    (clues[partitionOfKind(deal, kind) as keyof C] as Partition | undefined)?.parts
      .length ?? 0
  );
}

/** The partition kind `kind` sits at the parts of. */
export function partitionOfKind(deal: FillDeal, kind: string): string {
  const partition = deal.partsOf?.[kind];
  if (partition === undefined) throw new Error(`deal: ${kind} sits at parts of none`);
  return partition;
}

/** What a compiled fill module says of its deal (`deal`). */
export interface FillDeal {
  /** Whether the grid is as high as it is wide, so one size gives both. */
  readonly square?: true;
  /** Where the board is a hexagon (`describe-runtime/hexagon.ts`): the clue kind
   * every cell outside it holds, which the desc does not write. */
  readonly hexagon?: { readonly outside: string };
  readonly settings?: readonly FillSetting[];
  /** The settings only the deal reads, by name. */
  readonly options?: Readonly<Record<string, FillOption>>;
  readonly sample: Sample | null;
  /** The clue kind the deal hides while the board still finishes, or the
   * kinds it hides in one random order. */
  readonly hide?: string | readonly string[];
  /** The kinds of `hide` whose clues are each tried before any of the rest
   * (upstream's givens before its clues). */
  readonly hideFirst?: readonly string[];
  /** A kind of `hide` kept whole on a board below a tier, by the tier's
   * index. */
  readonly hideFrom?: Readonly<Record<string, number>>;
  /** A kind of `hide` hidden whole on a board below a tier, by the tier's
   * index, with variation `with` on where given, and within bounds: the
   * answer is drawn again until the board finishes without it. */
  readonly hideWhole?: Readonly<
    Record<
      string,
      { readonly below: number; readonly bounds: SizeBounds; readonly with?: string }
    >
  >;
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
  /** The symmetry the clues it leaves keep, or the option that chooses it:
   * the clues at the squares of one orbit are hidden together. */
  readonly symmetric?: Symmetry | { readonly option: string };
  readonly thorough?: FillThorough;
  /** The board kind the params give as a count of pieces of each length. */
  readonly tally?: FillTally;
  /** The setting under which the deal hides a kind beside `hide`'s, off by
   * default. */
  readonly hideFlag?: FillHideFlag;
  /** How it grows a dealt partition round the answer. */
  readonly grow?: FillGrow;
  /** How it divides each dealt partition it divides, apart from the answer
   * and in this order (`divide.ts`). */
  readonly divide?: readonly FillDivide[];
  /** The kinds at the divided partition's parts dealt one a part. */
  readonly oneKind?: { readonly kinds: readonly string[]; readonly partition: string };
  /** The setting under which `oneKind` deals some of its kinds alone. */
  readonly onlyFlag?: FillOnlyFlag;
  /** Kinds at one place of which an element holds one clue: the first in
   * this order the answer makes there. */
  readonly firstKind?: readonly string[];
  /** Kinds the player switches on and off, each by its letter after the
   * tier, in this order; every one on where none is written. */
  readonly kindLetters?: readonly FillKindLetter[];
  /** Where the board is sized by its blocks (`play.blocks`). */
  readonly blocks?: FillBlocks;
  readonly id: readonly IdSegment[];
  /** Where each clue kind sits. */
  readonly universes: Readonly<Record<string, ClueUniverse>>;
  /** The partition each kind at parts sits at, by kind. */
  readonly partsOf?: Readonly<Record<string, string>>;
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

/** A dealt partition divided at random apart from the answer
 * (`deal.divide`): into small parts, each cell joined at odds `pairs` to a
 * neighbor alone, then each left alone to a neighboring part under `most`
 * cells; a part at a time grown to a size drawn from one of `sizes`, the
 * first, or with `by` the one at the setting's value less its least; or the
 * board tiled by parts of `equal` cells, a number, a size the params give, or
 * `w`, the board's width. One with a `variation` is divided only on a board
 * it is on (the blocks Solo's Jigsaw deals). */
export type FillDivide = (
  | { readonly partition: string; readonly pairs: number; readonly most: number }
  | {
      readonly partition: string;
      readonly sizes: readonly (readonly number[])[];
      readonly by?: { readonly size: string; readonly min: number };
    }
  | { readonly partition: string; readonly equal: number | string }
) & { readonly variation?: string };

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
  /** The variations on, by name, in the modifiers' order; absent where none
   * is, as on every board of a game with none. */
  variations?: readonly string[];
  /** Whether the deal hides thoroughly, in a game whose deal has the
   * setting; absent in any other. */
  thorough?: boolean;
  /** The sizes beyond the grid's, by name, in a game whose params give any
   * (`FillDeal.settings`); absent in any other. */
  sizes?: Readonly<Record<string, number>>;
  /** The deal's options, by name, in a game whose deal has any
   * (`FillDeal.options`); absent in any other. */
  options?: Readonly<Record<string, number>>;
  /** The tally's count of each length from 1, in a game whose params give
   * one (`FillDeal.tally`); absent in any other. */
  tally?: readonly number[];
  /** Whether the deal hides, in a game whose deal has the setting
   * (`FillDeal.hideFlag`); absent in any other. */
  hides?: boolean;
  /** Whether the deal deals some kinds alone, in a game whose deal has the
   * setting (`FillDeal.onlyFlag`); absent in any other. */
  only?: boolean;
  /** The kinds of `FillDeal.kindLetters` on, in the letters' order, in a
   * game whose deal has them; absent in any other. */
  kinds?: readonly string[];
}

/** The clues the params give a board of `p`: its sizes beyond the grid's,
 * and its tally. */
export const givenOf = (
  deal: FillDeal,
  p: FillParams,
): Readonly<
  Record<string, number | Readonly<Record<string, number | readonly number[]>>>
> =>
  deal.tally === undefined
    ? sizesOf(p)
    : { ...sizesOf(p), [deal.tally.kind]: tallyClue(deal.tally, p) };

/** The variations `p` has on. */
export const variationsOf = (p: FillParams): readonly string[] => p.variations ?? [];

/** The sizes beyond the grid's that `p` gives. */
export const sizesOf = (p: FillParams): Readonly<Record<string, number>> =>
  p.sizes ?? {};

/** Each clue kind's largest value at an element (`clueMax`); a partition has
 * none. A kind at a partition's parts reads the part's cells off `cl`, the
 * clues read so far, which hold the partition. */
export type ClueMax<C> = {
  readonly [K in keyof C]?: (sp: GridSpace, at: number, cl: C) => number;
};

/**
 * The params' custom form and codec: the size within the description's
 * `sizes`, each modifier by its letter, and the tier by its letter, which
 * only a full ID carries; and what the form's bounds cannot say, a size off
 * its step or past a modifier's `most`. Each setting is a module of
 * `params/`; the order of each list below is the dialog's, and the codec's is
 * the params' grammar.
 */
export function fillParams(
  deal: FillDeal,
  tiers: readonly string[],
  defaults: () => FillParams,
  modifiers: Readonly<Record<string, FillModifier>> = {},
  bounds: FillBounds = { all: {}, tiers: [] },
  /** The value of option `name` a board of `p`'s size is dealt with unless
   * it says otherwise: a preset's own, else the option's default. A board's
   * name says an option only where it differs. */
  usual: (p: FillParams, name: string) => number = (_p, name) =>
    deal.options?.[name]?.default ?? 0,
): {
  paramConfig: ParamConfigItem<FillParams>[];
  encodeParams(p: FillParams, full: boolean): string;
  decodeParams(s: string): FillParams;
  validateParams(p: FillParams, full: boolean): string | null;
} {
  const w = deal.sizes["w"];
  const step = w?.step;
  const settings = deal.settings ?? [];
  const options = Object.entries(deal.options ?? {});
  const sizeBounds =
    w === undefined
      ? {}
      : { bounds: { min: w.min, ...(w.max === undefined ? {} : { max: w.max }) } };
  const least = leastWords(settings);
  const { blocks, tally, hideFlag, onlyFlag, thorough } = deal;
  const paramConfig: ParamConfigItem<FillParams>[] = [
    ...(blocks !== undefined
      ? blocksItems(blocks)
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
    ...settings.map(settingItem),
    ...(tally === undefined ? [] : tallyItems(tally)),
    ...options.map(([name, o]) => optionItem(deal, name, o, usual)),
    difficultyItem(tiers, "diff"),
    ...(hideFlag === undefined ? [] : [flagItem(hideFlag, "hides")]),
    ...(onlyFlag === undefined ? [] : [flagItem(onlyFlag, "only")]),
    ...kindItems(deal),
    ...modifierItems(modifiers),
    ...(thorough === undefined ? [] : [thoroughItem(thorough)]),
  ];
  const unused = (after: "size" | "tier") =>
    Object.entries(deal.unusedLetters ?? {})
      .filter(([, at]) => at === after)
      .map(([letter]) => unusedLetter<FillParams>(letter));
  return {
    paramConfig,
    ...paramsCodec(defaults, [
      blocks !== undefined
        ? blocksSegment(blocks)
        : deal.square === true
          ? size(paramConfig, "grid-size")
          : dims(paramConfig),
      ...unused("size"),
      ...settings.map((s) => settingSegment(paramConfig, s)),
      ...(tally === undefined ? [] : [tallySizeSegment(tally)]),
      ...modifierSegments(paramConfig, modifiers),
      // After the modifiers' letters, as upstream solo.c writes its
      // symmetry after `x` and `k`.
      ...options.map(([name, o]) => optionSegment(deal, paramConfig, name, o)),
      ...(thorough === undefined ? [] : [thoroughSegment(paramConfig, thorough)]),
      ...(deal.tierFlag === undefined ? [] : [tierFlagSegment(deal.tierFlag)]),
      ...(deal.tierAliases === undefined ? [] : [tierAliasSegment(deal.tierAliases)]),
      choice(paramConfig, "d", "difficulty", deal.tierLetters, { full: true }),
      ...unused("tier"),
      ...(hideFlag === undefined ? [] : [flagSegment(paramConfig, hideFlag)]),
      ...(onlyFlag === undefined ? [] : [flagSegment(paramConfig, onlyFlag)]),
      ...(deal.kindLetters === undefined ? [] : [kindLettersSegment(deal.kindLetters)]),
      ...(tally === undefined ? [] : [tallyCountsSegment(tally)]),
    ]),
    validateParams(p, full) {
      // Each refusal is returned as the call, so the refusal scan reads its
      // sentences.
      if (tally !== undefined && tallyRefusal(tally, tiers, p, full) !== null)
        return tallyRefusal(tally, tiers, p, full);
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
        return `The ${tally?.kind ?? "pieces"} does not fit into the grid.`;
      for (const s of settings)
        if (settingRefusal(s, p, deal.square === true) !== null)
          return settingRefusal(s, p, deal.square === true);
      if (blocks !== undefined && blocksRefusal(blocks, p) !== null)
        return blocksRefusal(blocks, p);
      const outside = beyond(bounds.all, p);
      if (outside !== null) return `${outside}.`;
      if (full && deal.kindLetters !== undefined && kindLettersRefusal(p) !== null)
        return kindLettersRefusal(p);
      if (full)
        for (const [name, o] of options)
          if (optionRefusal(deal, tiers, p, name, o) !== null)
            return optionRefusal(deal, tiers, p, name, o);
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
      return modifierRefusal(modifiers, p);
    },
  };
}
