/**
 * A fill game's game ID, from its description: the params, `WxH` and
 * `d<letter>`, and the desc, the clues by the segments `id:` lists, after
 * cspuz's serializer combinators. Tents' `id:` keeps upstream's grammar byte
 * for byte, so its IDs and shared links do not change
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 8).
 */

import { Dsf } from "../board/dsf.ts";
import type { DescParse } from "../contract/desc-error.ts";
import {
  DESC_CONTRADICTORY,
  DESC_MALFORMED,
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
} from "../contract/desc-error.ts";
import { difficultyItem, noSuchTier } from "../contract/difficulty.ts";
import type { ParamConfigItem } from "../contract/game.ts";
import {
  encodeBlockStructure,
  readBlockStructure,
} from "../game-id/block-structure.ts";
import { isDigit, parseLeadingInt } from "../game-id/decimal.ts";
import { c2n, n2c } from "../game-id/desc-alphabet.ts";
import { type DescReader, readDesc } from "../game-id/desc-reader.ts";
import { readDotRuns, writeDotRuns } from "../game-id/dot-runs.ts";
import { modifierItem } from "../game-id/modifier.ts";
import {
  dimensionParamConfig,
  parseConfigInt,
  unreadParams,
} from "../game-id/params.ts";
import {
  choice,
  dims,
  flag,
  letters,
  num,
  type ParamsSegment,
  paramsCodec,
  size,
  unusedLetter,
} from "../game-id/params-codec.ts";
import { RULESET_KW, type Ruleset, rulesetItem } from "../game-id/ruleset.ts";
import { encodeRunLength } from "../game-id/run-length.ts";
import { encodeWallRuns, readRegionWalls } from "../game-id/wall-runs.ts";
import { regionNumbers } from "../generate/divide.ts";
import type { Symmetry } from "../generate/symmetry.ts";
import {
  type ClueList,
  clueList,
  type GridSpace,
  inHexagon,
  type ListClues,
  listAt,
  listClues,
  type Partition,
  partition,
} from "../solve/describe-runtime.ts";
import type { Clues } from "./board.ts";
import type { FillGrow, GrowSizes } from "./grow.ts";
import { type Sample, samplePieces } from "./sample.ts";

/** A segment of the desc: where a one-valued clue kind sits, as upstream's
 * run code; a dealt partition as the walls between its parts
 * (`engine/game-id/wall-runs.ts`); a two-valued kind at cells as upstream's
 * dot runs, its value the
 * letter's case (`cases`, lowercase then uppercase), after `before` and
 * written only where one is dealt where `before` is given; a list kind's
 * lists, `.` within one and `/` between two; or a kind's values, the first
 * after `before` and the rest after commas (or `between`), in the space's
 * order or the columns first. */
export type IdSegment =
  | { readonly runs: string }
  | { readonly walls: string }
  | {
      readonly dots: string;
      readonly cases: readonly [number, number];
      readonly before?: string;
    }
  | { readonly lists: string; readonly order?: "columns" }
  /** A clue on every cell, each one character of the desc alphabet. */
  | { readonly cells: string }
  | {
      readonly digits: string;
      readonly apart?: string;
      /** Written before the segment, which is written only where a clue of
       * the kind is dealt (Towers' givens after `,`), unless `always`. */
      readonly before?: string;
      /** The segment behind `before` is written with no clue dealt too, as
       * its blanks (Seismic's `,zj`). */
      readonly always?: true;
      /** A one-valued kind at cells written in the stream as its capital
       * letter, by the letter. */
      readonly letters?: Readonly<Record<string, string>>;
      /** By letter, a kind at cells whose digit may follow the letter, on
       * its cell (Sticks' numbered block, `B2`). */
      readonly after?: Readonly<Record<string, string>>;
      /** By number, a one-valued kind at cells written as that number in
       * place of one of the segment's own (Bricks' unknown number, `7`). */
      readonly also?: Readonly<Record<string, string>>;
    }
  | {
      readonly numbers: string;
      readonly before?: string;
      /** What stands between two elements, where not a comma. */
      readonly between?: string;
      readonly order?: "columns";
      /** What an element without a clue is written as, where not nothing. */
      readonly hidden?: string;
      /** Whether a comma follows every element, the last too, rather than
       * standing between two. */
      readonly closed?: true;
    }
  /** A cell kind written a letter a clue, each letter one of its values,
   * between runs of empty cells `a` to `z`, the last run left off. */
  | { readonly glyphs: string; readonly values: Readonly<Record<string, number>> }
  /** A record a cell, closed by a comma: its clue of `records` as a number,
   * 0 for none, then a side letter (`SIDES`) for each clue of `sides`, a kind
   * at edges valued one of the edge's ends, that it is the value of. Where
   * `both`, `sides` is valued 0 or 1 at every edge, and an edge's clue 1 is
   * written from both its ends (upstream's Adjacent), every other edge's 0. */
  | { readonly records: string; readonly sides: string; readonly both?: true }
  /** A dealt partition as upstream's block structure
   * (`engine/game-id/block-structure.ts`), after `before` and before
   * `after` where given; with them, nothing on a board that does not deal
   * it (`FillDivide.variation`). */
  | {
      readonly blocks: string;
      readonly before?: string;
      readonly after?: string;
      /** A letter's repeats written out, never counted (Solo's). */
      readonly counts?: false;
    }
  /** A clue a part of partition `parts`, in the order of the parts' first
   * cells: its kind's letter (`letters`, by letter), then its number. */
  | {
      readonly parts: string;
      readonly before?: string;
      readonly letters: Readonly<Record<string, string>>;
    }
  /** A clue an element of its kinds' one place, in the space's order,
   * between runs of 1 to 26 elements without one, `a` to `z`, the last run
   * written too (upstream Mathrax's): its code, by `codes`, a kind followed
   * by the clue's number, or a kind and one of its values (`parity 0`)
   * standing whole. The longest code that matches is read. */
  | { readonly codes: Readonly<Record<string, string>>; readonly before?: string };

/** The largest value a cell holds: a domain is a bit a value in an int. */
const MOST_VALUE = 31;

/** A record's side letters, up, right, down and left (upstream unequal.c's
 * `adjthan` order). */
const SIDES = "URDL";
const SIDE_STEP: readonly (readonly [number, number])[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/** The cell a step of side `d` from cell `c` reaches, `-1` off the grid. */
function across(sp: GridSpace, c: number, d: number): number {
  const [dx, dy] = SIDE_STEP[d];
  const x = (c % sp.w) + dx;
  const y = Math.floor(c / sp.w) + dy;
  return x < 0 || y < 0 || x >= sp.w || y >= sp.h ? -1 : y * sp.w + x;
}

/** A deal setting the player may turn off (`deal.thorough`): on, the hide
 * tries every clue; off, as many as the board's shorter side. A menu board
 * and a new size have it on where they are narrower than `offFrom`. */
export interface FillThorough {
  readonly letter: string;
  readonly kw: string;
  readonly name: string;
  readonly doc: string;
  readonly offFrom: number;
}

/** A size beyond the grid's that the params give (`play.sizes`): its letter
 * in the params, before the number, or its `letters`, one written bare a
 * value, `""` written as nothing (Seismic's Tectonic `T`); and the Custom
 * dialog's ruleset field, one ruleset a value from the size's `min` up. A
 * ruleset's `least` is the narrowest board it has an answer on. */
export type FillSetting = (
  | { readonly letter: string; readonly letters?: undefined }
  | { readonly letters: readonly string[]; readonly letter?: undefined }
) & {
  readonly size: string;
  readonly min: number;
  readonly rulesets: readonly {
    readonly name: string;
    readonly rule: string;
    readonly least?: number;
  }[];
};

/** Bounds on a board's size a choice of an option sets: on its sides, that
 * it is square, and a tier's own, by the tier's index. */
export type ChoiceBounds = SizeBounds & {
  readonly square?: true;
  readonly tiers?: readonly (SizeBounds & { readonly tier: number })[];
};

/** A setting the params give that only the deal reads (`deal.options`): a
 * number from `min` to `max`, or with `choices` the index of one. A full ID
 * writes it as its letter and the number, or where its choices have codes,
 * as the choice's code, the default's never. */
export interface FillOption {
  /** Absent where the choices have codes. */
  readonly letter?: string;
  readonly kw: string;
  readonly name: string;
  readonly default: number;
  readonly doc: string;
  readonly min: number;
  readonly max: number;
  /** A number's words in a board's name, `{n}` the number. */
  readonly words?: string;
  readonly choices?: readonly {
    readonly name: string;
    readonly words?: string;
    readonly bounds?: ChoiceBounds;
    /** The symmetry the choice keeps, where the option is a symmetry. */
    readonly symmetry?: Symmetry;
    /** What a full ID writes for it, where the option has no letter. */
    readonly code?: string;
  }[];
}

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

/**
 * A board kind of two fields that the params give (`play.tally`): for each
 * length from 1 to the size, the count of pieces of it (Boats' fleet). The
 * size is written by its letter (`f3`), and the counts after a comma at the
 * params' end (`,3,2,1`); absent, a size of `size.default` and a count of
 * each length one more than the next's, from one of the longest.
 */
export interface FillTally {
  readonly kind: string;
  /** The kind's fields: each length, and the count of pieces of it. */
  readonly index: string;
  readonly count: string;
  readonly size: {
    readonly letter: string;
    readonly kw: string;
    readonly name: string;
    readonly doc: string;
    readonly min: number;
    readonly max: number;
    readonly default: number;
  };
  readonly counts: { readonly kw: string; readonly name: string; readonly doc: string };
  /** The tier a tally of one piece is dealt at alone, by its index. */
  readonly single?: number;
}

/** A setting the player may turn on, under which the deal hides `kind`
 * too (`deal.hideFlag`), written after the tier by its letter. */
export interface FillHideFlag {
  readonly kind: string;
  readonly letter: string;
  readonly kw: string;
  readonly name: string;
  readonly doc: string;
  /** What a board's name says where it is on. */
  readonly words: string;
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

/** A setting the player may turn on, under which the deal deals `kinds`
 * alone of `deal.oneKind`'s (`deal.onlyFlag`), written after the tier by its
 * letter. */
export interface FillOnlyFlag {
  readonly kinds: readonly string[];
  readonly letter: string;
  readonly kw: string;
  readonly name: string;
  readonly doc: string;
  /** What a board's name says where it is on. */
  readonly words: string;
}

/** A kind of clue the player may switch off (`deal.kindLetters`). */
export interface FillKindLetter {
  readonly letter: string;
  readonly kind: string;
  readonly kw: string;
  readonly name: string;
  readonly doc: string;
  /** What a board's name calls the kind, where it says which are on. */
  readonly word: string;
}

/**
 * A board sized by its blocks (`play.blocks`): the params give how many
 * blocks it has across, `across`, each that many squares tall, and down,
 * `down`, each that many wide, the grid `across * down` on a side; a board of
 * blocks one square wide deals its blocks instead, the variation `dealtBy`
 * (Solo's Jigsaw, `across` then the order). Written `{across}x{down}`, or
 * `{across}` and `letter` where the blocks are dealt, and a bare number read
 * as that many both ways, as upstream solo.c reads it.
 */
export interface FillBlocks {
  readonly across: string;
  readonly down: string;
  readonly letter: string;
  readonly dealtBy: string;
  readonly columns: {
    readonly kw: string;
    readonly name: string;
    readonly doc: string;
  };
  readonly rows: { readonly kw: string; readonly name: string };
  /** The puzzle with blocks cut, then the one with them dealt. */
  readonly rulesets: readonly [Ruleset, Ruleset];
  readonly bounds: Readonly<
    Record<"across" | "down", { readonly min: number; readonly max: number }>
  >;
}

/** The blocks across and down board `p` has. */
const blocksOn = (b: FillBlocks, p: FillParams): [number, number] => {
  const s = sizesOf(p);
  return [s[b.across] ?? b.bounds.across.min, s[b.down] ?? b.bounds.down.min];
};

/** Sets `p` to `across` blocks by `down`: the sizes, the grid, and the
 * variation that deals the blocks, on where they are one square wide. */
export function setBlocks(
  b: FillBlocks,
  p: FillParams,
  across: number,
  down: number,
): void {
  p.sizes = { ...p.sizes, [b.across]: across, [b.down]: down };
  p.w = p.h = across * down;
  const rest = variationsOf(p).filter((v) => v !== b.dealtBy);
  const now = down === 1 ? [b.dealtBy, ...rest] : rest;
  if (now.length > 0) p.variations = now;
  else delete p.variations;
}

/** The squarest blocks of an `order` grid, `[across, down]` with `across ≤
 * down`, or dealt blocks where the order is prime. */
function squarest(order: number): [number, number] {
  for (let a = Math.floor(Math.sqrt(order)); a >= 2; a--)
    if (order % a === 0) return [a, order / a];
  return [order, 1];
}

/** The Custom dialog's fields of a board sized by its blocks: across, down,
 * and the ruleset, last, since choosing it folds the two (the midend sets
 * fields in order). */
function blocksItems(b: FillBlocks): ParamConfigItem<FillParams>[] {
  return [
    {
      kw: b.columns.kw,
      name: b.columns.name,
      type: "string",
      doc: b.columns.doc,
      bounds: b.bounds.across,
      label: {
        slot: "size",
        // Dealt blocks have no width and height, so it says its grid's.
        words: (p) => {
          const [a, d] = blocksOn(b, p);
          return d === 1 ? `${a}x${a}` : `${a}x${d}`;
        },
      },
      get: (p) => String(blocksOn(b, p)[0]),
      set: (p, v) => setBlocks(b, p, parseConfigInt(v), blocksOn(b, p)[1]),
    },
    {
      kw: b.rows.kw,
      name: b.rows.name,
      type: "string",
      doc: { with: b.columns.kw },
      bounds: b.bounds.down,
      get: (p) => String(blocksOn(b, p)[1]),
      set: (p, v) => setBlocks(b, p, blocksOn(b, p)[0], parseConfigInt(v)),
    },
    rulesetItem<FillParams>(b.rulesets, {
      get: (p) => (blocksOn(b, p)[1] === 1 ? 1 : 0),
      set: (p, i) => {
        const [a, d] = blocksOn(b, p);
        if (i === 1 && d !== 1) setBlocks(b, p, a * d, 1);
        else if (i === 0 && d === 1) setBlocks(b, p, ...squarest(a));
      },
    }),
  ];
}

/** A board's blocks in the params: `{across}x{down}`, or `{across}` and the
 * letter where they are dealt. Read as upstream solo.c reads them: a bare
 * number is that many both ways, and the letter after `{a}x{d}` makes a
 * board of dealt blocks of the order `a * d`. */
function blocksSegment(b: FillBlocks): ParamsSegment<FillParams> {
  return {
    encode: (p) => {
      const [a, d] = blocksOn(b, p);
      return d === 1 ? `${a}${b.letter}` : `${a}x${d}`;
    },
    decode: (s, i, p) => {
      const first = parseLeadingInt(s, i);
      let [a, d] = [first.value, first.value];
      let at = first.next;
      let seenDown = false;
      if (s[at] === "x" && isDigit(s[at + 1] ?? "")) {
        const down = parseLeadingInt(s, at + 1);
        d = down.value;
        at = down.next;
        seenDown = true;
      }
      if (s[at] === b.letter) {
        at++;
        if (seenDown) a *= d;
        d = 1;
      }
      setBlocks(b, p, a, d);
      return at;
    },
  };
}

/** A variation the player may switch on (`play.modifiers`). */
export interface FillModifier {
  readonly letter: string;
  readonly kw: string;
  readonly name: string;
  readonly words: string;
  readonly rule: string;
  readonly note?: string;
  /** The most lines a board 2i squares across may have the other way. */
  readonly most?: readonly number[];
  /** What a board with it on is held to. */
  readonly bounds?: SizeBounds;
}

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

/** Each length's count of a tally of `size`, where the params name none:
 * one of the longest, and one more of each shorter. */
export const tallyDefault = (size: number): number[] =>
  Array.from({ length: size }, (_, i) => size - i);

/** The tally `p` gives, its default where `p` names none. */
export const tallyOf = (
  t: FillTally,
  p: Pick<FillParams, "tally">,
): readonly number[] => p.tally ?? tallyDefault(t.size.default);

/** The board clue the tally of `p` is: each length and its count. */
export const tallyClue = (
  t: FillTally,
  p: FillParams,
): Readonly<Record<string, number | readonly number[]>> => {
  const counts = tallyOf(t, p);
  return {
    n: counts.length,
    [t.index]: counts.map((_, i) => i + 1),
    [t.count]: counts,
  };
};

/** The count of the tally's pieces of each length on a board of `p`. */
export const piecesOf = (deal: FillDeal, p: FillParams): readonly number[] => {
  if (deal.tally === undefined) throw new Error("deal: pieces, and no tally");
  return tallyOf(deal.tally, p);
};

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

/** Counts read from `s` for a tally of `size`: numbers apart by anything
 * else, 0 for each the text runs out before (upstream boats.c). */
function readCounts(s: string, size: number): number[] {
  const nums = [...s.matchAll(/\d+/g)].map((m) => Number(m[0]));
  return Array.from({ length: size }, (_, i) => nums[i] ?? 0);
}

/** The Custom dialog's two fields of a tally: its size, and its counts,
 * blank where they are the size's default. */
function tallyItems(t: FillTally): ParamConfigItem<FillParams>[] {
  const counts = (p: FillParams): string => {
    const c = tallyOf(t, p);
    const def = tallyDefault(c.length);
    return c.every((n, i) => n === def[i]) ? "" : c.join(",");
  };
  return [
    {
      kw: t.size.kw,
      name: t.size.name,
      type: "string",
      doc: t.size.doc,
      bounds: { min: t.size.min, max: t.size.max },
      label: { slot: "tail", words: (p) => `size ${tallyOf(t, p).length}` },
      get: (p) => String(tallyOf(t, p).length),
      // A new size takes its default counts, as upstream's dialog does.
      set: (p, v) => {
        p.tally = tallyDefault(parseConfigInt(v));
      },
    },
    {
      kw: t.counts.kw,
      name: t.counts.name,
      type: "string",
      doc: t.counts.doc,
      label: {
        slot: "tail",
        words: (p) => (counts(p) === "" ? null : `${t.kind} ${counts(p)}`),
      },
      get: counts,
      set: (p, v) => {
        const size = tallyOf(t, p).length;
        p.tally = v === "" ? tallyDefault(size) : readCounts(v, size);
      },
    },
  ];
}

/** The tally's size by its letter, after the grid's, where it is not the
 * default; absent, the default size. */
function tallySizeSegment(t: FillTally): ParamsSegment<FillParams> {
  return {
    encode: (p) => `${t.size.letter}${tallyOf(t, p).length}`,
    decode: (s, i, p) => {
      if (s[i] !== t.size.letter) {
        p.tally = tallyDefault(t.size.default);
        return i;
      }
      const parsed = parseLeadingInt(s, i + 1);
      p.tally = tallyDefault(parsed.value);
      return parsed.next;
    },
  };
}

/** The tally's counts after a comma, last in the params and always
 * written; absent, the size's default. */
function tallyCountsSegment(t: FillTally): ParamsSegment<FillParams> {
  return {
    encode: (p) => `,${tallyOf(t, p).join(",")}`,
    decode: (s, i, p) => {
      if (s[i] !== ",") return i;
      for (let j = i; j < s.length; j++)
        if (s[j] !== "," && !isDigit(s[j])) unreadParams(s, j);
      p.tally = readCounts(s.slice(i), tallyOf(t, p).length);
      return s.length;
    },
  };
}

/** Why a tally cannot be dealt on a board of `p`, or `null`. */
function tallyRefusal(
  t: FillTally,
  tiers: readonly string[],
  p: FillParams,
  full: boolean,
): string | null {
  const counts = tallyOf(t, p);
  const size = counts.length;
  const name = t.size.name;
  if (size < t.size.min || size > t.size.max)
    return `${name} must be between ${t.size.min} and ${t.size.max}.`;
  if (size > p.w && size > p.h)
    return `${name} must be smaller than the width and height.`;
  const pieces = counts.reduce((a, b) => a + b, 0);
  if (pieces === 0) return `The ${t.kind} must contain at least 1 piece.`;
  if (full && pieces === 1 && t.single !== undefined && p.diff !== t.single)
    return noSuchTier(`puzzle with one piece in its ${t.kind}`, tiers[p.diff]);
  return null;
}

/** A flag's Custom field, on the params' field `field`. */
const flagItem = (
  f: FillHideFlag | FillOnlyFlag,
  field: "hides" | "only",
): ParamConfigItem<FillParams> => ({
  kw: f.kw,
  name: f.name,
  type: "boolean",
  doc: f.doc,
  label: { slot: "tail", words: (p) => (p[field] === true ? f.words : null) },
  get: (p) => p[field] === true,
  set: (p, v) => {
    p[field] = v;
  },
});

/** Option `name`'s value on a board of `p`, its default where `p` names
 * none. */
export const optionOf = (deal: FillDeal, p: FillParams, name: string): number => {
  const o = deal.options?.[name];
  if (o === undefined) throw new Error(`deal: no option ${name}`);
  return p.options?.[name] ?? o.default;
};

/** The symmetry option `name` chooses on a board of `p`. */
export const symmetryOf = (deal: FillDeal, p: FillParams, name: string): Symmetry => {
  const s = deal.options?.[name]?.choices?.[optionOf(deal, p, name)]?.symmetry;
  if (s === undefined) throw new Error(`deal: option ${name} chooses no symmetry`);
  return s;
};

/** The symmetry the clues a deal of board `p` leaves keep: `none` where it
 * keeps none. */
export const symmetricOf = (deal: FillDeal, p: FillParams): Symmetry => {
  const s = deal.symmetric;
  if (s === undefined) return "none";
  return typeof s === "string" ? s : symmetryOf(deal, p, s.option);
};

/** The kinds of `deal.kindLetters` board `p` deals, in the letters' order:
 * every one where `p` names none. */
export const kindsOn = (deal: FillDeal, p: FillParams): readonly string[] =>
  p.kinds ?? (deal.kindLetters ?? []).map((l) => l.kind);

/** The variations `p` has on. */
export const variationsOf = (p: FillParams): readonly string[] => p.variations ?? [];

/** The sizes beyond the grid's that `p` gives. */
export const sizesOf = (p: FillParams): Readonly<Record<string, number>> =>
  p.sizes ?? {};

/** The setting `s`'s ruleset on a board of `p`, by its index. */
const rulesetOf = (s: FillSetting, p: FillParams): number =>
  (p.sizes?.[s.size] ?? s.min) - s.min;

/** The setting's default for a board `w` squares wide. */
const thoroughBy = (t: FillThorough, w: number): boolean => w < t.offFrom;

/** `p` with the deal's setting at its default for its size, where the deal
 * has one. */
export const withThorough = (deal: FillDeal, p: FillParams): FillParams =>
  deal.thorough === undefined ? p : { ...p, thorough: thoroughBy(deal.thorough, p.w) };

/** Each clue kind's largest value at an element (`clueMax`); a partition has
 * none. A kind at a partition's parts reads the part's cells off `cl`, the
 * clues read so far, which hold the partition. */
export type ClueMax<C> = {
  readonly [K in keyof C]?: (sp: GridSpace, at: number, cl: C) => number;
};

/** The largest value of kind `kind` at element `at`, beside the clues `cl`
 * read so far; none are needed where the kind is not at a part. */
const maxOf = <C>(
  clueMax: ClueMax<C>,
  kind: keyof C,
  sp: GridSpace,
  at: number,
  cl: Partial<C> = {},
) => {
  const max = clueMax[kind];
  if (max === undefined) throw new Error(`id: ${String(kind)} has no values`);
  // A kind not at a part reads nothing of `cl`; one at a part is read after
  // its partition (the compiler holds `parts` after it).
  return max(sp, at, cl as C);
};

/** Each border between two cells side by side, 1 where it divides two parts
 * of `p`: those inside the rows first, then those between them, as
 * `encodeWallRuns` writes them. */
function wallsOf(p: Partition, w: number, h: number): Uint8Array {
  const out: number[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w - 1; x++)
      out.push(p.of[y * w + x] === p.of[y * w + x + 1] ? 0 : 1);
  for (let y = 0; y < h - 1; y++)
    for (let x = 0; x < w; x++)
      out.push(p.of[y * w + x] === p.of[(y + 1) * w + x] ? 0 : 1);
  return Uint8Array.from(out);
}

/** A partition's parts in the order of their first cells, as a `parts`
 * segment writes them. */
const byFirstCell = (cells: readonly (readonly number[])[]): number[] =>
  cells.map((_, r) => r).sort((a, b) => cells[a][0] - cells[b][0]);

/** A partition from each cell's part, the parts numbered as `regionNumbers`
 * numbers them: in the order their first cells are met. */
export function partitionOf(parts: ArrayLike<number>): Partition {
  const cells: number[][] = [];
  for (let c = 0; c < parts.length; c++) {
    cells[parts[c]] ??= [];
    cells[parts[c]].push(c);
  }
  return partition(cells, parts.length);
}

type Bound = { readonly min?: number; readonly max?: number };

/** Bounds on a board's two sides together (`play.bounds`). */
export interface SizeBounds {
  readonly sum?: Bound;
  readonly area?: Bound;
  readonly shorter?: Bound;
  readonly longer?: Bound;
}

/** What the sizes alone cannot say of a board, and of a board of a tier, by
 * the tier's index. */
export interface FillBounds {
  readonly all: SizeBounds;
  readonly tiers: readonly (SizeBounds & { readonly tier: number })[];
}

/** Each bound's measure of a board, and the start of what a board below or
 * above it is told, which ends with the bound. */
const MEASURES: Readonly<
  Record<
    keyof SizeBounds,
    { of(w: number, h: number): number; below: string; above: string }
  >
> = {
  sum: {
    of: (w, h) => w + h,
    below: "Width plus height must be at least",
    above: "Width plus height must be at most",
  },
  area: {
    of: (w, h) => w * h,
    below: "The number of squares must be at least",
    above: "The number of squares must be at most",
  },
  shorter: {
    of: Math.min,
    below: "Width and height must both be at least",
    above: "Width or height must be at most",
  },
  longer: {
    of: Math.max,
    below: "Width or height must be at least",
    above: "Width and height must both be at most",
  },
};

/** Whether board `p` is within `bounds`. */
export const within = (bounds: SizeBounds, p: FillParams): boolean =>
  beyond(bounds, p) === null;

/** What a board `p` past one of `bounds` is told, without its full stop, or
 * `null` within them. */
function beyond(bounds: SizeBounds, p: FillParams): string | null {
  for (const [name, m] of Object.entries(MEASURES)) {
    const b = bounds[name as keyof SizeBounds];
    if (b === undefined) continue;
    const n = m.of(p.w, p.h);
    if (b.min !== undefined && n < b.min) return `${m.below} ${b.min}`;
    if (b.max !== undefined && n > b.max) return `${m.above} ${b.max}`;
  }
  return null;
}

/**
 * The params' custom form and codec: the size within the description's
 * `sizes`, each modifier by its letter, and the tier by its letter, which
 * only a full ID carries; and what the form's bounds cannot say, a size off
 * its step or past a modifier's `most`.
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
  const named = Object.entries(modifiers);
  const settings = deal.settings ?? [];
  const options = Object.entries(deal.options ?? {});
  const sizeBounds =
    w === undefined
      ? {}
      : { bounds: { min: w.min, ...(w.max === undefined ? {} : { max: w.max }) } };
  // Each ruleset's narrowest board, said beside the size.
  const leasts = settings.flatMap((s) =>
    s.rulesets.flatMap((r) =>
      r.least === undefined ? [] : [`${r.least} with ${r.name}`],
    ),
  );
  const leastWords =
    leasts.length === 0
      ? ""
      : ` It must be at least ${leasts.slice(0, -1).join(", ")}${leasts.length > 1 ? " and " : ""}${leasts.at(-1)}.`;
  const { blocks } = deal;
  const paramConfig: ParamConfigItem<FillParams>[] = [
    ...(blocks !== undefined
      ? blocksItems(blocks)
      : deal.square === true
        ? [
            {
              kw: "grid-size",
              name: "Grid size",
              type: "string" as const,
              doc: `Width and height of the grid, which is square.${leastWords}`,
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
            doc: `Size of the grid in squares.${step === 2 ? " Both must be even." : ""}${leastWords}`,
            ...sizeBounds,
          })),
    ...settings.map((s) =>
      rulesetItem<FillParams>(s.rulesets, {
        get: (p) => rulesetOf(s, p),
        set: (p, index) => {
          p.sizes = { ...p.sizes, [s.size]: s.min + index };
        },
      }),
    ),
    ...(deal.tally === undefined ? [] : tallyItems(deal.tally)),
    ...options.map(([name, o]) => optionItem(deal, name, o, usual)),
    difficultyItem(tiers, "diff"),
    ...(deal.hideFlag === undefined ? [] : [flagItem(deal.hideFlag, "hides")]),
    ...(deal.onlyFlag === undefined ? [] : [flagItem(deal.onlyFlag, "only")]),
    ...kindItems(deal),
    ...named.map(([variation, m]) =>
      modifierItem<FillParams>({
        kw: m.kw,
        name: m.name,
        type: "boolean",
        when: true,
        words: m.words,
        slot: "tail",
        rule: m.rule,
        ...(m.note === undefined ? {} : { note: m.note }),
        get: (p) => variationsOf(p).includes(variation),
        // In the modifiers' order, whichever is set first, after any the
        // sizes put on (dealt blocks), and absent where none is on.
        set: (p, on) => {
          const now = [
            ...variationsOf(p).filter((n) => modifiers[n] === undefined),
            ...named
              .map(([n]) => n)
              .filter((n) => (n === variation ? on : variationsOf(p).includes(n))),
          ];
          if (now.length > 0) p.variations = now;
          else delete p.variations;
        },
      }),
    ),
  ];
  const { thorough } = deal;
  if (thorough !== undefined)
    paramConfig.push({
      kw: thorough.kw,
      name: thorough.name,
      type: "boolean",
      doc: thorough.doc,
      // Named where it is not the size's default.
      label: {
        slot: "tail",
        words: (p) =>
          p.thorough === thoroughBy(thorough, p.w)
            ? null
            : `${p.thorough ? "slower" : "faster"} generation`,
      },
      get: (p) => p.thorough ?? thoroughBy(thorough, p.w),
      set: (p, v) => {
        p.thorough = v;
      },
    });
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
      // A size the params give, written as the number itself after its
      // letter, or as its ruleset's bare letter (the ruleset field's).
      ...settings.map((s) =>
        s.letters === undefined
          ? num(paramConfig, s.letter, {
              get: (p) => p.sizes?.[s.size] ?? s.min,
              set: (p, v) => {
                p.sizes = { ...p.sizes, [s.size]: v };
              },
            })
          : letters(paramConfig, RULESET_KW, s.letters),
      ),
      ...(deal.tally === undefined ? [] : [tallySizeSegment(deal.tally)]),
      ...named.map(([, m]) => flag(paramConfig, m.letter, m.kw)),
      // After the modifiers' letters, as upstream solo.c writes its
      // symmetry after `x` and `k`.
      ...options.map(([name, o]) => optionSegment(deal, paramConfig, name, o)),
      // A deal setting, which only a full ID carries, and only where it is
      // off: absent, it is on whatever the size, as upstream reads it, so an
      // upstream ID deals as it did there.
      ...(thorough === undefined
        ? []
        : [
            num(
              paramConfig,
              thorough.letter,
              {
                get: (p) => (p.thorough ? 1 : 0),
                set: (p, v) => {
                  p.thorough = v !== 0;
                },
              },
              {
                full: true,
                omitWhen: (p) => p.thorough !== false,
                whenAbsent: (p) => {
                  p.thorough = true;
                },
              },
            ),
          ]),
      ...(deal.tierFlag === undefined ? [] : [tierFlagSegment(deal.tierFlag)]),
      ...(deal.tierAliases === undefined ? [] : [tierAliasSegment(deal.tierAliases)]),
      choice(paramConfig, "d", "difficulty", deal.tierLetters, { full: true }),
      ...unused("tier"),
      ...(deal.hideFlag === undefined
        ? []
        : [flag(paramConfig, deal.hideFlag.letter, deal.hideFlag.kw, { full: true })]),
      ...(deal.onlyFlag === undefined
        ? []
        : [flag(paramConfig, deal.onlyFlag.letter, deal.onlyFlag.kw, { full: true })]),
      ...(deal.kindLetters === undefined ? [] : [kindLettersSegment(deal.kindLetters)]),
      ...(deal.tally === undefined ? [] : [tallyCountsSegment(deal.tally)]),
    ]),
    validateParams(p, full) {
      // Returned as the call, so the refusal scan reads its sentences.
      if (deal.tally !== undefined && tallyRefusal(deal.tally, tiers, p, full) !== null)
        return tallyRefusal(deal.tally, tiers, p, full);
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
        return `The ${deal.tally?.kind ?? "pieces"} does not fit into the grid.`;
      for (const s of settings) {
        const ruleset = s.rulesets[rulesetOf(s, p)];
        if (ruleset === undefined) return "There is no such game mode.";
        if (ruleset.least !== undefined && Math.min(p.w, p.h) < ruleset.least)
          return deal.square === true
            ? `${ruleset.name}: the grid size must be at least ${ruleset.least}.`
            : `${ruleset.name}: width and height must both be at least ${ruleset.least}.`;
      }
      if (blocks !== undefined) {
        const [a, d] = blocksOn(blocks, p);
        const { across, down } = blocks.bounds;
        if (a < across.min || a > across.max)
          return `${blocks.columns.name} must be between ${across.min} and ${across.max}.`;
        if (d < down.min || d > down.max)
          return `${blocks.rows.name} must be between ${down.min} and ${down.max}.`;
      }
      const outside = beyond(bounds.all, p);
      if (outside !== null) return `${outside}.`;
      if (full && deal.kindLetters !== undefined && p.kinds?.length === 0)
        return "At least one clue type must be enabled.";
      // An option is the deal's alone, so only a full ID's is held to its
      // range and its choice's bounds.
      if (full)
        for (const [name, o] of options) {
          const v = optionOf(deal, p, name);
          if (v < o.min || v > o.max)
            return o.choices === undefined
              ? `${o.name} must be between ${o.min} and ${o.max}.`
              : `There is no such ${o.name.toLowerCase()}.`;
          const choice = o.choices?.[v];
          const b = choice?.bounds;
          if (choice === undefined || b === undefined) continue;
          if (b.square === true && p.w !== p.h)
            return `${choice.name}: the grid must be square.`;
          const past = beyond(b, p);
          if (past !== null)
            return `${choice.name}: ${past[0].toLowerCase()}${past.slice(1)}.`;
          for (const { tier, ...tb } of b.tiers ?? [])
            if (tier === p.diff && beyond(tb, p) !== null)
              return noSuchTier(
                `${p.w}x${p.h} puzzle with ${choice.name} ${o.name.toLowerCase()}`,
                tiers[tier],
              );
        }
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
      for (const [variation, m] of named) {
        if (!variationsOf(p).includes(variation)) continue;
        const past = m.bounds === undefined ? null : beyond(m.bounds, p);
        if (past !== null)
          return `${m.name}: ${past[0].toLowerCase()}${past.slice(1)}.`;
        const { most } = m;
        if (most === undefined) continue;
        for (const [across, along, side, other] of [
          [p.w, p.h, "wide", "high"],
          [p.h, p.w, "high", "wide"],
        ] as const) {
          const bound = most[across / 2];
          if (bound !== undefined && along > bound)
            return `${m.name}: a grid ${across} ${side} can be at most ${bound} ${other}.`;
        }
      }
      return null;
    },
  };
}

/** The Custom dialog's check box for each kind of `deal.kindLetters`; the
 * first carries a board name's words for them all: which are on or which
 * are off, whichever list is shorter, and nothing where every one is on. */
function kindItems(deal: FillDeal): ParamConfigItem<FillParams>[] {
  const letters = deal.kindLetters ?? [];
  const words = (p: FillParams): string | null => {
    const on = new Set(kindsOn(deal, p));
    const said = (yes: boolean) =>
      letters.filter((l) => on.has(l.kind) === yes).map((l) => l.word);
    const [shown, hidden] = [said(true), said(false)];
    if (hidden.length === 0) return null;
    return shown.length <= hidden.length
      ? `only ${shown.join("/")}`
      : `no ${hidden.join("/")}`;
  };
  return letters.map((l, i) => ({
    kw: l.kw,
    name: l.name,
    type: "boolean",
    doc: l.doc,
    ...(i === 0 ? { label: { slot: "tail" as const, words } } : {}),
    get: (p) => kindsOn(deal, p).includes(l.kind),
    set: (p, v) => {
      const on = new Set(kindsOn(deal, p));
      if (v) on.add(l.kind);
      else on.delete(l.kind);
      p.kinds = letters.map((x) => x.kind).filter((k) => on.has(k));
    },
  }));
}

/** The kinds on, each by its letter in the letters' order, which only a
 * full ID carries and only where some kind is off: no letter is every kind
 * (upstream mathrax.c's). */
function kindLettersSegment(
  letters: readonly FillKindLetter[],
): ParamsSegment<FillParams> {
  return {
    encode: (p, full) => {
      const on = p.kinds ?? letters.map((l) => l.kind);
      if (!full || on.length === letters.length) return "";
      return letters
        .filter((l) => on.includes(l.kind))
        .map((l) => l.letter)
        .join("");
    },
    decode: (s, i, p) => {
      const on: string[] = [];
      for (const l of letters)
        if (s[i] === l.letter) {
          on.push(l.kind);
          i++;
        }
      p.kinds = on.length === 0 ? letters.map((l) => l.kind) : on;
      return i;
    },
  };
}

/** A retired tier letter, read after `d` as the tier it stands for and never
 * written (Bricks' `t`, upstream's Tricky, whose boards are Unreasonable). */
function tierAliasSegment(
  aliases: NonNullable<FillDeal["tierAliases"]>,
): ParamsSegment<FillParams> {
  return {
    encode: () => "",
    decode: (s, i, p) => {
      const tier = s[i] === "d" ? aliases[s[i + 1] ?? ""] : undefined;
      if (tier === undefined) return i;
      p.diff = tier;
      return i + 2;
    },
  };
}

/** A bare letter older IDs write for a tier, before the tier's own `d`: read
 * as that tier, and never written. */
function tierFlagSegment(
  flag: NonNullable<FillDeal["tierFlag"]>,
): ParamsSegment<FillParams> {
  return {
    encode: () => "",
    decode: (s, i, p) => {
      if (s[i] !== flag.letter) return i;
      p.diff = flag.tier;
      return i + 1;
    },
  };
}

/** Option `name` in the params, which only a full ID carries: its letter and
 * the number, or its choice's code, longest first where one begins another,
 * and the default's never written. Absent, it is the option's default. */
function optionSegment(
  deal: FillDeal,
  config: readonly ParamConfigItem<FillParams>[],
  name: string,
  o: FillOption,
): ParamsSegment<FillParams> {
  const set = (p: FillParams, v: number) => {
    p.options = { ...p.options, [name]: v };
  };
  if (o.letter !== undefined)
    return num(
      config,
      o.letter,
      { get: (p) => optionOf(deal, p, name), set },
      { full: true, whenAbsent: (p) => set(p, o.default) },
    );
  const codes = (o.choices ?? []).map((c, i) => {
    if (c.code === undefined) throw new Error(`deal: option ${name} has no letter`);
    return [c.code, i] as const;
  });
  const longestFirst = [...codes].sort(([a], [b]) => b.length - a.length);
  return {
    encode: (p, full) => {
      const v = optionOf(deal, p, name);
      return full && v !== o.default ? (codes[v]?.[0] ?? "") : "";
    },
    decode: (s, i, p) => {
      const found = longestFirst.find(([code]) => s.startsWith(code, i));
      set(p, found?.[1] ?? o.default);
      return found === undefined ? i : i + found[0].length;
    },
  };
}

/** The Custom dialog's field for option `name`: a number, or a choice. A
 * board's name says it where it is not what a board of its size is usually
 * dealt with. */
function optionItem(
  deal: FillDeal,
  name: string,
  o: FillOption,
  usual: (p: FillParams, name: string) => number,
): ParamConfigItem<FillParams> {
  const get = (p: FillParams) => optionOf(deal, p, name);
  const set = (p: FillParams, v: number) => {
    p.options = { ...p.options, [name]: v };
  };
  const words = (p: FillParams): string | null => {
    const v = get(p);
    if (v === usual(p, name)) return null;
    const choice = o.choices?.[v];
    if (choice !== undefined) return choice.words ?? choice.name;
    return o.words?.replace("{n}", String(v)) ?? null;
  };
  const label = { slot: "tail" as const, words };
  return o.choices === undefined
    ? {
        kw: o.kw,
        name: o.name,
        type: "string",
        doc: o.doc,
        bounds: { min: o.min, max: o.max },
        label,
        get: (p) => String(get(p)),
        set: (p, v) => set(p, parseConfigInt(v)),
      }
    : {
        kw: o.kw,
        name: o.name,
        type: "choices",
        choices: o.choices.map((c) => c.name),
        doc: o.doc,
        label,
        get,
        set,
      };
}

/** The elements a kind sits at, in the order a segment writes them: a cell's
 * kind by rows or by columns, a line's kind the rows then the columns, or
 * the columns first. */
function elements(
  sp: GridSpace,
  universe: Universe,
  order?: "columns",
): readonly number[] {
  const { w, h } = sp;
  if (order !== "columns") return sp[universe];
  if (universe === "edges" || universe === "slots" || universe === "corners")
    throw new Error(`id: a kind at ${universe} is written in their order`);
  if (universe === "lines") return [...sp.lines.slice(h), ...sp.lines.slice(0, h)];
  const out: number[] = [];
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) out.push(y * w + x);
  return out;
}

/** The space's elements kind `kind` sits at; a kind at parts is written by
 * a `parts` segment alone, which the compiler holds it to. */
function universeOf(deal: FillDeal, kind: string): Universe {
  const u = deal.universes[kind];
  if (u === undefined) throw new Error(`id: no clue kind ${kind}`);
  if (u === "parts") throw new Error(`id: ${kind} sits at parts`);
  return u;
}

/** Each of `kinds` a digits segment marks, with the cells it holds before
 * the desc is read: a hexagon's outside kind holds every cell `written`
 * leaves out, and every other kind none. */
function markedStart(
  deal: FillDeal,
  sp: GridSpace,
  written: readonly number[],
  kinds: readonly string[],
): Map<string, number[]> {
  const out = new Map<string, number[]>(kinds.map((k) => [k, []]));
  const outside = deal.hexagon?.outside;
  if (outside === undefined) return out;
  const on = new Set(written);
  out.set(
    outside,
    sp.cells.filter((c) => !on.has(c)),
  );
  return out;
}

/** The cells a desc writes, in the space's order: every one, or a
 * hexagon's alone. */
function boardCells(deal: FillDeal, sp: GridSpace): readonly number[] {
  if (deal.hexagon === undefined) return sp.cells;
  return sp.cells.filter((c) => inHexagon(sp.w, sp.h, c % sp.w, Math.floor(c / sp.w)));
}

/** A clue list at parts as a list at cells, each clue at its part's first
 * cell (Solo's Killer totals); none on a board without the partition. */
function atFirstCells(
  list: ClueList,
  parts: Partition | null,
  sp: GridSpace,
): ClueList {
  const n = sp.cells.length;
  if (parts === null) return clueList([], [], n);
  const byCell = Array.from(
    list.at,
    (r, k) => [parts.cells[r][0], list.v[k]] as const,
  ).sort((a, b) => a[0] - b[0]);
  return clueList(
    byCell.map(([c]) => c),
    byCell.map(([, v]) => v),
    n,
  );
}

/** The clues a `digits` segment writes of kind `kind`, at cells: a kind at
 * parts at each part's first cell. */
function digitsListOf<C extends Clues<C>>(
  deal: FillDeal,
  sp: GridSpace,
  dealt: C,
  kind: string,
): ClueList {
  const list = dealt[kind as keyof C] as ClueList;
  if (deal.universes[kind] !== "parts") return list;
  const parts = dealt[partitionOfKind(deal, kind) as keyof C] as Partition | undefined;
  return atFirstCells(list, parts ?? null, sp);
}

/** A clue list at cells, each in one part, as the list at those parts: one
 * clue a part, where `null` holds which part has none or two. */
function atParts(list: ClueList, parts: Partition): ClueList | null {
  const v = new Array<number>(parts.parts.length).fill(-1);
  for (let k = 0; k < list.at.length; k++) {
    const r = parts.of[list.at[k]];
    if (v[r] >= 0) return null;
    v[r] = list.v[k];
  }
  if (v.some((x) => x < 0)) return null;
  return clueList(parts.parts, v, parts.parts.length);
}

/** The desc of the clues `dealt`, by the deal's `id`. */
export function encodeDesc<C extends Clues<C>>(
  deal: FillDeal,
  sp: GridSpace,
  dealt: C,
): string {
  let out = "";
  const listOf = (kind: string): ClueList => dealt[kind as keyof C] as ClueList;
  for (const seg of deal.id) {
    if ("walls" in seg) {
      out += encodeWallRuns(
        wallsOf(dealt[seg.walls as keyof C] as Partition, sp.w, sp.h),
      );
      continue;
    }
    if ("blocks" in seg) {
      const partition = dealt[seg.blocks as keyof C] as Partition | undefined;
      if (partition === undefined) continue;
      const { of } = partition;
      out += seg.before ?? "";
      out += encodeBlockStructure(sp.w, sp.h, (a, b) => of[a] === of[b], seg.counts);
      out += seg.after ?? "";
      continue;
    }
    if ("parts" in seg) {
      out += seg.before ?? "";
      const { cells } = dealt[seg.parts as keyof C] as Partition;
      const letters = Object.entries(seg.letters);
      for (const r of byFirstCell(cells)) {
        const written = letters.flatMap(([letter, kind]) => {
          const list = listOf(kind);
          return list.byAt[r] >= 0 ? [`${letter}${list.v[list.byAt[r]]}`] : [];
        });
        // A part holds one clue, which the deal deals it.
        if (written.length !== 1)
          throw new Error(`id: part ${r} holds ${written.length} clues`);
        out += written[0];
      }
      continue;
    }
    if ("runs" in seg) {
      // `_` a clue with no gap before it, `a` to `y` one after a gap of 1 to
      // 25, `z` 25 empty cells with more to come, and a last clue past the
      // end.
      const list = listOf(seg.runs);
      const n = sp.cells.length;
      let gap = 0;
      for (let c = 0; c <= n; c++) {
        if (c === n || list.byAt[c] >= 0) {
          out += gap === 0 ? "_" : String.fromCharCode(96 + gap);
          gap = 0;
          continue;
        }
        gap++;
        if (gap > 25) {
          out += "z";
          gap -= 25;
        }
      }
      continue;
    }
    if ("digits" in seg) {
      const list = digitsListOf(deal, sp, dealt, seg.digits);
      // Behind its mark, the segment is written only where it holds a clue,
      // unless it is always written.
      if (seg.before !== undefined && seg.always !== true && list.at.length === 0)
        continue;
      out += seg.before ?? "";
      const cells = boardCells(deal, sp);
      const marked = Object.entries(seg.letters ?? {}).map(
        ([letter, kind]) => [letter, listOf(kind)] as const,
      );
      const after = new Map(
        Object.entries(seg.after ?? {}).map(([letter, kind]) => [letter, listOf(kind)]),
      );
      const also = Object.entries(seg.also ?? {}).map(
        ([number, kind]) => [number, listOf(kind)] as const,
      );
      const letterAt = (c: number): string | null =>
        marked.find(([, l]) => l.valueAt[c] >= 0)?.[0] ?? null;
      /** The number cell `c` is written as: its own clue's, or another
       * kind's that is written as a number. */
      const numberAt = (c: number): string | null =>
        list.valueAt[c] >= 0
          ? String(list.valueAt[c])
          : (also.find(([, l]) => l.valueAt[c] >= 0)?.[0] ?? null);
      // The board cell before each, `-1` for the first: a cell off the board
      // is never written, and ends a run of letters (upstream bricks.c).
      const before = new Int32Array(sp.cells.length).fill(-1);
      const onBoard = new Uint8Array(sp.cells.length);
      cells.forEach((c, i) => {
        onBoard[c] = 1;
        if (i > 0) before[c] = cells[i - 1];
      });
      // A number straight after a written cell has no run before it, so
      // `apart` there.
      const apart = (c: number): string =>
        seg.apart !== undefined &&
        before[c] >= 0 &&
        (numberAt(before[c]) !== null || letterAt(before[c]) !== null)
          ? seg.apart
          : "";
      out += encodeRunLength(
        sp.cells.length,
        (c) => {
          if (onBoard[c] === 0) return "";
          const number = numberAt(c);
          if (number !== null) return apart(c) + number;
          const letter = letterAt(c);
          const n = letter === null ? -1 : (after.get(letter)?.valueAt[c] ?? -1);
          return letter === null ? null : n >= 0 ? letter + String(n) : letter;
        },
        { keepTrailingBlanks: true },
      );
      continue;
    }
    if ("dots" in seg) {
      const list = listOf(seg.dots);
      // Behind its mark, the segment is written only where it holds a clue.
      if (seg.before !== undefined && list.at.length === 0) continue;
      const [lower, upper] = seg.cases;
      out +=
        (seg.before ?? "") +
        writeDotRuns(sp.cells.length, (c) => {
          const v = list.valueAt[c];
          return v === upper ? 1 : v === lower ? 0 : null;
        });
      continue;
    }
    if ("lists" in seg) {
      const lists = dealt[seg.lists as keyof C] as ListClues;
      out += elements(sp, universeOf(deal, seg.lists), seg.order)
        .map((e) => Array.from(listAt(lists, e) ?? []).join("."))
        .join("/");
      continue;
    }
    if ("cells" in seg) {
      const list = listOf(seg.cells);
      for (const c of sp.cells) out += n2c(list.valueAt[c]);
      continue;
    }
    if ("records" in seg) {
      const numbers = listOf(seg.records);
      const sides = listOf(seg.sides);
      for (const c of sp.cells) {
        out += String(Math.max(0, numbers.valueAt[c]));
        for (let d = 0; d < SIDES.length; d++) {
          const n = across(sp, c, d);
          if (n >= 0 && sides.valueAt[sp.edgeOf(c, n)] === (seg.both ? 1 : c))
            out += SIDES[d];
        }
        out += ",";
      }
      continue;
    }
    if ("codes" in seg) {
      out += seg.before ?? "";
      const codes = codesOf(seg.codes);
      const kinds = [...new Set(codes.map((c) => c.kind))];
      // A run is written when a clue ends it, at the end, or before a 27th.
      let run = 0;
      const flush = (): void => {
        if (run > 0) out += String.fromCharCode(96 + run);
        run = 0;
      };
      for (const e of sp[universeOf(deal, kinds[0])]) {
        const here = kinds.flatMap((kind) => {
          const v = listOf(kind).valueAt[e];
          return v >= 0 ? [{ kind, v }] : [];
        });
        if (here.length > 1)
          throw new Error(`id: element ${e} holds ${here.length} clues`);
        if (here.length === 0) {
          if (run === 26) flush();
          run++;
          continue;
        }
        flush();
        const [{ kind, v }] = here;
        const whole = codes.find((c) => c.kind === kind && c.value === v);
        const numbered = codes.find((c) => c.kind === kind && c.value === null);
        if (whole === undefined && numbered === undefined)
          throw new Error(`id: no code writes ${kind} ${v}`);
        out += whole?.code ?? `${numbered?.code}${v}`;
      }
      flush();
      continue;
    }
    if ("glyphs" in seg) {
      const list = listOf(seg.glyphs);
      const letter = new Map(Object.entries(seg.values).map(([l, v]) => [v, l]));
      // A run is written when a clue ends it or it reaches 26, so one at the
      // end is left off (upstream boats.c).
      let run = 0;
      for (const c of sp.cells) {
        const v = list.valueAt[c];
        if (v < 0) run++;
        if (run > 0 && (run === 26 || v >= 0)) {
          out += String.fromCharCode(96 + run);
          run = 0;
        }
        if (v >= 0) out += letter.get(v) ?? "";
      }
      continue;
    }
    const list = listOf(seg.numbers);
    elements(sp, universeOf(deal, seg.numbers), seg.order).forEach((e, i) => {
      if (i === 0) out += seg.before ?? "";
      else if (seg.closed !== true) out += seg.between ?? ",";
      const v = list.valueAt[e];
      out += v >= 0 ? String(v) : (seg.hidden ?? "");
      if (seg.closed === true) out += ",";
    });
  }
  return out;
}

const isRunChar = (ch: string): boolean => ch === "_" || (ch >= "a" && ch <= "z");

/** A `runs` segment: the cells each letter's run of empty cells ends
 * before, of `n`. */
function readRunCells(r: DescReader, n: number): ClueList {
  const at: number[] = [];
  let pos = 0;
  for (;;) {
    const ch = r.char(isRunChar);
    if (ch === "z") {
      // `z` is written only with empty cells still to follow it.
      pos += 25;
      if (pos >= n) r.fail(DESC_TOO_LONG);
      continue;
    }
    pos += ch === "_" ? 0 : ch.charCodeAt(0) - 96;
    if (pos > n) r.fail(DESC_TOO_LONG);
    if (pos === n) break;
    at.push(pos++);
  }
  return clueList(
    at,
    at.map(() => 0),
    n,
  );
}

/** A `glyphs` segment: a run letter skips 1 to 26 empty cells of `n`, and
 * each of `values`' letters is a clue on the next. */
function readGlyphs(
  r: DescReader,
  n: number,
  values: Readonly<Record<string, number>>,
): ClueList {
  const at: number[] = [];
  const v: number[] = [];
  let cell = 0;
  while (r.peekIs((ch) => (ch >= "a" && ch <= "z") || Object.hasOwn(values, ch))) {
    const ch = r.char();
    if (ch >= "a" && ch <= "z") {
      cell += ch.charCodeAt(0) - 96;
      if (cell > n) r.fail(DESC_TOO_LONG);
      continue;
    }
    if (cell >= n) r.fail(DESC_TOO_LONG);
    at.push(cell++);
    v.push(values[ch]);
  }
  return clueList(at, v, n);
}

/** A `codes` segment's codes, each with the kind it stands for and, where
 * it stands whole, the value: the longest first, as they are read. */
function codesOf(
  codes: Readonly<Record<string, string>>,
): { readonly code: string; readonly kind: string; readonly value: number | null }[] {
  return Object.entries(codes)
    .map(([code, said]) => {
      const [kind, value] = said.split(" ");
      return { code, kind, value: value === undefined ? null : Number(value) };
    })
    .sort((a, b) => b.code.length - a.code.length);
}

/** A `codes` segment: a run letter skips 1 to 26 elements, and a code is a
 * clue on the next, its number after it where the code stands for a kind
 * alone; the elements end with the segment. */
function readCodes<C extends Clues<C>>(
  r: DescReader,
  deal: FillDeal,
  sp: GridSpace,
  clueMax: ClueMax<C>,
  seg: { readonly codes: Readonly<Record<string, string>>; readonly before?: string },
): Map<string, ClueList> {
  if (seg.before !== undefined) r.expect(seg.before);
  const codes = codesOf(seg.codes);
  const read = new Map(
    codes.map((c) => [c.kind, { at: [] as number[], v: [] as number[] }]),
  );
  const elements = sp[universeOf(deal, codes[0].kind)];
  const n = elements.length;
  for (let pos = 0; pos < n; ) {
    if (r.peekIs((ch) => ch >= "a" && ch <= "z")) {
      pos += r.char().charCodeAt(0) - 96;
      if (pos > n) r.fail(DESC_TOO_LONG);
      continue;
    }
    const code = codes.find((c) => r.accept(c.code));
    if (code === undefined) {
      // Refused: a character no code begins with, or the end of the desc.
      r.char(() => false);
      continue;
    }
    const e = elements[pos++];
    const least = deal.least?.[code.kind] ?? 0;
    const got = read.get(code.kind) as { at: number[]; v: number[] };
    got.at.push(e);
    got.v.push(code.value ?? r.int(least, maxOf(clueMax, code.kind as keyof C, sp, e)));
  }
  return new Map(
    [...read].map(([kind, { at, v }]) => [kind, clueList(at, v, n)] as const),
  );
}

/** A `lists` segment: every element's list, an empty one written as
 * nothing, held in the space's order. */
/**
 * A `digits` segment's clues, by kind: its own kind's, and each kind its
 * letters, the numbers after them and its `also` numbers stand for. A digit
 * is one cell's clue, a letter a run of 1 to 26 without one; the last run is
 * written, so the cells end with the segment. With `apart`, a clue is a whole
 * number, and `apart` is between two with no run between them, exactly
 * there. Behind its `before`, the segment is read only where the mark is.
 * A clue's most may read a partition read before it, in `cl` (Seismic's
 * given, at most its area's size).
 */
function readDigits<C extends Clues<C>>(
  r: DescReader,
  deal: FillDeal,
  sp: GridSpace,
  clueMax: ClueMax<C>,
  seg: Extract<IdSegment, { readonly digits: string }>,
  cl: Partial<C>,
): Map<string, ClueList> {
  const kind = seg.digits as keyof C;
  const all = sp.cells.length;
  const out = new Map<string, ClueList>();
  if (seg.before !== undefined && !r.accept(seg.before)) {
    out.set(seg.digits, clueList([], [], all));
    return out;
  }
  const least = deal.least?.[seg.digits] ?? 0;
  const cells = boardCells(deal, sp);
  const n = cells.length;
  const at: number[] = [];
  const v: number[] = [];
  const letters = seg.letters ?? {};
  const also = seg.also ?? {};
  const markedAt = markedStart(deal, sp, cells, [
    ...Object.values(letters),
    ...Object.values(also),
  ]);
  // The largest number the segment reads: its own kind's, or one that
  // stands for another kind.
  const topAlso = Math.max(-1, ...Object.keys(also).map(Number));
  const after = seg.after ?? {};
  const numberedAt = new Map<string, { at: number[]; v: number[] }>(
    Object.values(after).map((k) => [k, { at: [], v: [] }]),
  );
  const isRun = (x: string) => x >= "a" && x <= "z";
  const isLetter = (x: string) => x in letters;
  // Whether the cell before was written, so a clue here has no run before it.
  let afterClue = false;
  for (let pos = 0; pos < n; ) {
    if (r.peekIs(isRun)) {
      pos += r.char().charCodeAt(0) - 96;
      if (pos > n) r.fail(DESC_TOO_LONG);
      afterClue = false;
      continue;
    }
    const c = cells[pos];
    if (r.peekIs(isLetter)) {
      const letter = r.char();
      markedAt.get(letters[letter])?.push(c);
      const k = after[letter];
      if (k !== undefined && r.peekIs(isDigit)) {
        const value = Number(r.char());
        if (value > maxOf(clueMax, k as keyof C, sp, c, cl)) r.fail(DESC_OUT_OF_RANGE);
        const got = numberedAt.get(k);
        got?.at.push(c);
        got?.v.push(value);
      }
      pos++;
      afterClue = true;
      continue;
    }
    const max = Math.max(maxOf(clueMax, kind, sp, c, cl), topAlso);
    let value: number;
    if (seg.apart === undefined) {
      value = Number(r.char(isDigit));
      if (value < least || value > max) r.fail(DESC_OUT_OF_RANGE);
    } else {
      if (afterClue) r.expect(seg.apart);
      value = r.int(least, max);
    }
    pos++;
    afterClue = true;
    const other = also[String(value)];
    if (other !== undefined) {
      markedAt.get(other)?.push(c);
      continue;
    }
    if (value > maxOf(clueMax, kind, sp, c, cl)) r.fail(DESC_OUT_OF_RANGE);
    at.push(c);
    v.push(value);
  }
  out.set(seg.digits, clueList(at, v, all));
  for (const [k, got] of numberedAt) out.set(k, clueList(got.at, got.v, all));
  for (const [k, marked] of markedAt) {
    const sorted = marked.toSorted((a, b) => a - b);
    out.set(
      k,
      clueList(
        sorted,
        sorted.map(() => 0),
        all,
      ),
    );
  }
  return out;
}

function readLists<C extends Clues<C>>(
  r: DescReader,
  deal: FillDeal,
  sp: GridSpace,
  clueMax: ClueMax<C>,
  seg: { readonly lists: string; readonly order?: "columns" },
): ListClues {
  const kind = seg.lists as keyof C;
  const universe = universeOf(deal, seg.lists);
  const least = deal.least?.[seg.lists] ?? 0;
  const read = elements(sp, universe, seg.order).map((e, i) => {
    if (i > 0) r.expect("/");
    const list: number[] = [];
    if (r.peekIs(isDigit))
      do list.push(r.int(least, maxOf(clueMax, kind, sp, e)));
      while (r.accept("."));
    return [e, list] as const;
  });
  read.sort((a, b) => a[0] - b[0]);
  return listClues(
    read.map(([e]) => e),
    read.map(([, list]) => list),
    sp[universe].length,
  );
}

/** A `records` segment: a cell's number (0 for none) and the sides whose
 * edge's clue it is the value of, or, where `both`, whose edge's clue is 1,
 * a record a cell, each closed by a comma. */
function readRecords<C extends Clues<C>>(
  r: DescReader,
  deal: FillDeal,
  sp: GridSpace,
  clueMax: ClueMax<C>,
  seg: { readonly records: string; readonly sides: string; readonly both?: true },
): readonly [ClueList, ClueList] {
  const kind = seg.records as keyof C;
  const least = deal.least?.[seg.records] ?? 1;
  const at: number[] = [];
  const v: number[] = [];
  // The end each edge's clue is valued, -1 for none; where `both`, one less
  // than the ends that write it.
  const end = new Int32Array(sp.edges.length).fill(-1);
  for (const c of sp.cells) {
    const n = r.int(0, maxOf(clueMax, kind, sp, c));
    if (n > 0) {
      if (n < least) r.fail(DESC_OUT_OF_RANGE);
      at.push(c);
      v.push(n);
    }
    for (let d = 0; d < SIDES.length; d++) {
      if (!r.accept(SIDES[d])) continue;
      const other = across(sp, c, d);
      if (other < 0) r.fail(DESC_OUT_OF_RANGE);
      const e = sp.edgeOf(c, other);
      if (seg.both) end[e]++;
      // A clue valued both its ends says two things of one edge.
      else if (end[e] >= 0) r.fail(DESC_CONTRADICTORY);
      else end[e] = c;
    }
    r.expect(",");
  }
  if (seg.both) {
    // An edge written from one end alone says two things of it.
    if (sp.edges.some((e) => end[e] === 0)) r.fail(DESC_CONTRADICTORY);
    return [
      clueList(at, v, sp.cells.length),
      clueList(
        sp.edges,
        sp.edges.map((e) => (end[e] > 0 ? 1 : 0)),
        sp.edges.length,
      ),
    ];
  }
  const edges = sp.edges.filter((e) => end[e] >= 0);
  return [
    clueList(at, v, sp.cells.length),
    clueList(
      edges,
      edges.map((e) => end[e]),
      sp.edges.length,
    ),
  ];
}

/** Whether `parts`, read as the partition `name`, are as the deal divides
 * it: where it divides it into equal parts, every part as large as the
 * rest, and as large as the division says where the board's width says it
 * (a desc names no size). A partition divided otherwise, or not, holds. */
function equalParts(
  deal: FillDeal,
  name: string,
  sp: GridSpace,
  parts: Partition,
): boolean {
  const divide = deal.divide?.find((d) => d.partition === name);
  if (divide === undefined || !("equal" in divide)) return true;
  const { equal } = divide;
  const k =
    typeof equal === "number" ? equal : equal === "w" ? sp.w : parts.cells[0].length;
  return parts.cells.every((cs) => cs.length === k);
}

/** The clues `desc` deals, each number read within its kind's largest value
 * at its element. */
export function decodeDesc<C extends Clues<C>>(
  deal: FillDeal,
  sp: GridSpace,
  // Not read for `C`, which `ClueMax` cannot say: the caller's board says it.
  clueMax: ClueMax<NoInfer<C>>,
  desc: string,
  /** What the grown partition's parts hold on this board, where the deal
   * grows one. */
  grown: GrowSizes | null = null,
  /** The variations the board has on, which say whether it deals a
   * partition a variation deals. */
  variations: readonly string[] = [],
): DescParse<C> {
  return readDesc(desc, (r) => {
    const out: Partial<Record<keyof C, ClueList | ListClues | Partition>> = {};
    for (const seg of deal.id) {
      if ("walls" in seg) {
        const n = sp.cells.length;
        const joined = new Dsf(n);
        readRegionWalls(r, joined, sp.w, sp.h);
        const parts = partitionOf(regionNumbers(joined, n));
        // A part too small to hold what the deal grows each part round, or
        // a count of parts the rules do not allow, has no answer.
        const sized = deal.grow?.partition === seg.walls ? grown : null;
        if (parts.cells.some((cs) => cs.length < (sized?.holds ?? 1)))
          r.fail(DESC_MALFORMED);
        const count = sized?.parts ?? null;
        if (count !== null && parts.cells.length !== count) r.fail(DESC_MALFORMED);
        // A part the deal divides to drawn sizes holds a number for each of
        // its cells (Seismic's areas), and a cell holds at most 31.
        const divided = deal.divide?.find((d) => d.partition === seg.walls);
        if (
          divided !== undefined &&
          "sizes" in divided &&
          parts.cells.some((cs) => cs.length > MOST_VALUE)
        )
          r.fail(DESC_OUT_OF_RANGE);
        if (!equalParts(deal, seg.walls, sp, parts)) r.fail(DESC_MALFORMED);
        out[seg.walls as keyof C] = parts;
        continue;
      }
      if ("blocks" in seg) {
        const divide = deal.divide?.find((d) => d.partition === seg.blocks);
        if (divide !== undefined && !dividesOn(deal, variations).includes(divide))
          continue;
        if (seg.before !== undefined) r.expect(seg.before);
        const n = sp.cells.length;
        const joined = new Dsf(n);
        readBlockStructure(r, joined, sp.w, sp.h);
        const parts = partitionOf(regionNumbers(joined, n));
        if (!equalParts(deal, seg.blocks, sp, parts)) r.fail(DESC_MALFORMED);
        out[seg.blocks as keyof C] = parts;
        if (seg.after !== undefined) r.expect(seg.after);
        continue;
      }
      if ("parts" in seg) {
        if (seg.before !== undefined) r.expect(seg.before);
        const { cells } = out[seg.parts as keyof C] as Partition;
        const read = new Map<string, { at: number[]; v: number[] }>(
          Object.values(seg.letters).map((k) => [k, { at: [], v: [] }]),
        );
        for (const part of byFirstCell(cells)) {
          const kind = seg.letters[r.char((c) => Object.hasOwn(seg.letters, c))];
          const least = deal.least?.[kind] ?? 0;
          const max = maxOf(clueMax, kind as keyof C, sp, part, out as Partial<C>);
          const got = read.get(kind) as { at: number[]; v: number[] };
          got.at.push(part);
          got.v.push(r.int(least, max));
        }
        for (const [kind, { at, v }] of read) {
          const order = at.map((_, i) => i).sort((a, b) => at[a] - at[b]);
          out[kind as keyof C] = clueList(
            order.map((i) => at[i]),
            order.map((i) => v[i]),
            cells.length,
          );
        }
        continue;
      }
      if ("runs" in seg) {
        out[seg.runs as keyof C] = readRunCells(r, sp.cells.length);
        continue;
      }
      if ("digits" in seg && deal.universes[seg.digits] === "parts") {
        // A part's clue, written at one of its cells, on a board that deals
        // the partition (Solo's Killer totals, upstream reading one
        // anywhere in its cage); read at most its part's largest.
        const parts = out[partitionOfKind(deal, seg.digits) as keyof C] as
          | Partition
          | undefined;
        const kind = seg.digits as keyof C;
        if (parts === undefined) {
          out[kind] = clueList([], [], 0);
          continue;
        }
        const atCell: ClueMax<C> = {
          [kind]: (s: GridSpace, c: number, cl: C) =>
            maxOf(clueMax, kind, s, parts.of[c], cl),
        } as ClueMax<C>;
        const cells = readDigits(r, deal, sp, atCell, seg, out as Partial<C>).get(
          seg.digits,
        );
        const list = cells === undefined ? null : atParts(cells, parts);
        if (list === null) r.fail(DESC_MALFORMED);
        out[kind] = list as ClueList;
        continue;
      }
      if ("digits" in seg) {
        for (const [kind, list] of readDigits(
          r,
          deal,
          sp,
          clueMax,
          seg,
          out as Partial<C>,
        ))
          out[kind as keyof C] = list;
        continue;
      }
      if ("dots" in seg) {
        const at: number[] = [];
        const v: number[] = [];
        if (seg.before === undefined || r.accept(seg.before))
          readDotRuns(r, sp.cells.length, (c, kind) => {
            at.push(c);
            v.push(seg.cases[kind]);
          });
        out[seg.dots as keyof C] = clueList(at, v, sp.cells.length);
        continue;
      }
      if ("lists" in seg) {
        out[seg.lists as keyof C] = readLists(r, deal, sp, clueMax, seg);
        continue;
      }
      if ("glyphs" in seg) {
        out[seg.glyphs as keyof C] = readGlyphs(r, sp.cells.length, seg.values);
        continue;
      }
      if ("codes" in seg) {
        for (const [kind, list] of readCodes(r, deal, sp, clueMax, seg))
          out[kind as keyof C] = list;
        continue;
      }
      if ("cells" in seg) {
        const kind = seg.cells as keyof C;
        const least = deal.least?.[seg.cells] ?? 0;
        const v = sp.cells.map((c) => {
          const n = c2n(r.char((ch) => c2n(ch) !== null)) ?? -1;
          if (n < least || n > maxOf(clueMax, kind, sp, c)) r.fail(DESC_OUT_OF_RANGE);
          return n;
        });
        out[kind] = clueList(sp.cells, v, sp.cells.length);
        continue;
      }
      if ("records" in seg) {
        const [numbers, sides] = readRecords(r, deal, sp, clueMax, seg);
        out[seg.records as keyof C] = numbers;
        out[seg.sides as keyof C] = sides;
        continue;
      }
      const kind = seg.numbers as keyof C;
      const universe = universeOf(deal, seg.numbers);
      const at: number[] = [];
      const v: number[] = [];
      elements(sp, universe, seg.order).forEach((e, i) => {
        if (i === 0) {
          if (seg.before !== undefined) r.expect(seg.before);
        } else if (seg.closed !== true) r.expect(seg.between ?? ",");
        // An absent clue is written as `hidden`, or as nothing.
        if (seg.hidden !== undefined && r.accept(seg.hidden)) {
          if (seg.closed === true) r.expect(",");
          return;
        }
        if (seg.hidden === undefined && !r.peekIs(isDigit)) return;
        at.push(e);
        v.push(r.int(deal.least?.[seg.numbers] ?? 0, maxOf(clueMax, kind, sp, e)));
        if (seg.closed === true) r.expect(",");
      });
      // The elements in the space's order, as a list is held.
      const byAt = at.map((e, k) => [e, v[k]] as const).sort((a, b) => a[0] - b[0]);
      out[kind] = clueList(
        byAt.map(([e]) => e),
        byAt.map(([, x]) => x),
        sp[universe].length,
      );
    }
    r.end();
    // The compiler holds `id` to naming every kind once.
    return out as C;
  });
}
