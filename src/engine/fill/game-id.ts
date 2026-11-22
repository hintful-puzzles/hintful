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
  DESC_MALFORMED,
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
} from "../contract/desc-error.ts";
import { difficultyItem, noSuchTier } from "../contract/difficulty.ts";
import type { ParamConfigItem } from "../contract/game.ts";
import { isDigit } from "../game-id/decimal.ts";
import { readDesc } from "../game-id/desc-reader.ts";
import { readDotRuns, writeDotRuns } from "../game-id/dot-runs.ts";
import { modifierItem } from "../game-id/modifier.ts";
import { dimensionParamConfig, parseConfigInt } from "../game-id/params.ts";
import {
  choice,
  dims,
  flag,
  num,
  type ParamsSegment,
  paramsCodec,
  size,
} from "../game-id/params-codec.ts";
import { rulesetItem } from "../game-id/ruleset.ts";
import { encodeRunLength } from "../game-id/run-length.ts";
import { encodeWallRuns, readRegionWalls } from "../game-id/wall-runs.ts";
import { regionNumbers } from "../generate/divide.ts";
import {
  type ClueList,
  clueList,
  type GridSpace,
  inHexagon,
  type Partition,
  partition,
} from "../solve/describe-runtime.ts";
import type { Clues } from "./board.ts";
import type { FillGrow, GrowSizes } from "./grow.ts";
import type { Sample } from "./sample.ts";

/** A segment of the desc: where a one-valued clue kind sits, as upstream's
 * run code; a dealt partition as the walls between its parts
 * (`engine/game-id/wall-runs.ts`); a two-valued kind at cells as upstream's
 * dot runs, its value the
 * letter's case (`cases`, lowercase then uppercase); or a kind's values, the
 * first after `before` and the rest after commas, in the space's order or
 * the columns first. */
export type IdSegment =
  | { readonly runs: string }
  | { readonly walls: string }
  | { readonly dots: string; readonly cases: readonly [number, number] }
  | {
      readonly digits: string;
      readonly apart?: string;
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
  | { readonly numbers: string; readonly before?: string; readonly order?: "columns" };

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
 * in the params, and the Custom dialog's ruleset field, one ruleset a value
 * from the size's `min` up. A ruleset's `least` is the narrowest board it
 * has an answer on. */
export interface FillSetting {
  readonly size: string;
  readonly letter: string;
  readonly min: number;
  readonly rulesets: readonly {
    readonly name: string;
    readonly rule: string;
    readonly least?: number;
  }[];
}

/** Bounds on a board's size a choice of an option sets: on its sides, that
 * it is square, and a tier's own, by the tier's index. */
export type ChoiceBounds = SizeBounds & {
  readonly square?: true;
  readonly tiers?: readonly (SizeBounds & { readonly tier: number })[];
};

/** A setting the params give that only the deal reads (`deal.options`): a
 * number from `min` to `max`, or with `choices` the index of one. A full ID
 * writes it as its letter and the number. */
export interface FillOption {
  readonly letter: string;
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
  }[];
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
  /** Where a search tier's strip starts every draw: from every clue, not
   * from a board of the lowest tier one draw in eight (Sticks'). */
  readonly stripFrom?: "everyClue";
  /** The one-valued kind at cells that `hide`'s clue sits over: dealt where
   * none of `hide`'s is shown, so a clue hidden leaves it. */
  readonly leaves?: string;
  /** A bare letter older IDs write for a tier, by its index: read, never
   * written. */
  readonly tierFlag?: { readonly letter: string; readonly tier: number };
  /** Retired tier letters a `d` may carry, each read as a tier's index. */
  readonly tierAliases?: Readonly<Record<string, number>>;
  /** The clue kind at a cell of which two side by side and alike are both
   * taken off, so the answer is the ladder's and not the sample. */
  readonly unpair?: string;
  /** The symmetry the clues it leaves keep: a clue and its partner under a
   * half turn are hidden together. */
  readonly symmetric?: "halfTurn";
  readonly thorough?: FillThorough;
  /** How it grows a dealt partition round the answer. */
  readonly grow?: FillGrow;
  readonly id: readonly IdSegment[];
  /** Where each clue kind sits. */
  readonly universes: Readonly<Record<string, "cells" | "lines">>;
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
}

/** Option `name`'s value on a board of `p`, its default where `p` names
 * none. */
export const optionOf = (deal: FillDeal, p: FillParams, name: string): number => {
  const o = deal.options?.[name];
  if (o === undefined) throw new Error(`deal: no option ${name}`);
  return p.options?.[name] ?? o.default;
};

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
 * none. */
export type ClueMax<C> = {
  readonly [K in keyof C]?: (sp: GridSpace, at: number) => number;
};

/** The largest value of kind `kind` at element `at`. */
const maxOf = <C>(clueMax: ClueMax<C>, kind: keyof C, sp: GridSpace, at: number) => {
  const max = clueMax[kind];
  if (max === undefined) throw new Error(`id: ${String(kind)} has no values`);
  return max(sp, at);
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
  const paramConfig: ParamConfigItem<FillParams>[] = [
    ...(deal.square === true
      ? [
          {
            kw: "grid-size",
            name: "Grid size",
            type: "string" as const,
            doc: `Width and height of the grid, which is square.${leastWords}`,
            ...sizeBounds,
            label: { slot: "size" as const, words: (p: FillParams) => `${p.w}x${p.w}` },
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
    ...options.map(([name, o]) => optionItem(deal, name, o, usual)),
    difficultyItem(tiers, "diff"),
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
        // In the modifiers' order, whichever is set first, and absent where
        // none is on.
        set: (p, on) => {
          const now = named
            .map(([n]) => n)
            .filter((n) => (n === variation ? on : variationsOf(p).includes(n)));
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
  return {
    paramConfig,
    ...paramsCodec(defaults, [
      deal.square === true ? size(paramConfig, "grid-size") : dims(paramConfig),
      // A size the params give, written as the number itself.
      ...settings.map((s) =>
        num(paramConfig, s.letter, {
          get: (p) => p.sizes?.[s.size] ?? s.min,
          set: (p, v) => {
            p.sizes = { ...p.sizes, [s.size]: v };
          },
        }),
      ),
      // An option only the deal reads, which only a full ID carries: absent,
      // it is the option's default.
      ...options.map(([name, o]) =>
        num(
          paramConfig,
          o.letter,
          {
            get: (p) => optionOf(deal, p, name),
            set: (p, v) => {
              p.options = { ...p.options, [name]: v };
            },
          },
          {
            full: true,
            whenAbsent: (p) => {
              p.options = { ...p.options, [name]: o.default };
            },
          },
        ),
      ),
      ...named.map(([, m]) => flag(paramConfig, m.letter, m.kw)),
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
    ]),
    validateParams(p, full) {
      for (const s of settings) {
        const ruleset = s.rulesets[rulesetOf(s, p)];
        if (ruleset === undefined) return "There is no such game mode.";
        if (ruleset.least !== undefined && Math.min(p.w, p.h) < ruleset.least)
          return deal.square === true
            ? `${ruleset.name}: the grid size must be at least ${ruleset.least}.`
            : `${ruleset.name}: width and height must both be at least ${ruleset.least}.`;
      }
      const outside = beyond(bounds.all, p);
      if (outside !== null) return `${outside}.`;
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
        const { most } = m;
        if (most === undefined || !variationsOf(p).includes(variation)) continue;
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

/** A bare letter older IDs write for a tier, before the tier's own `d`: read
 * as that tier, and never written. */
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
  universe: "cells" | "lines",
  order?: "columns",
): readonly number[] {
  const { w, h } = sp;
  if (order !== "columns") return sp[universe];
  if (universe === "lines") return [...sp.lines.slice(h), ...sp.lines.slice(0, h)];
  const out: number[] = [];
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) out.push(y * w + x);
  return out;
}

function universeOf(deal: FillDeal, kind: string): "cells" | "lines" {
  const u = deal.universes[kind];
  if (u === undefined) throw new Error(`id: no clue kind ${kind}`);
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
      const list = listOf(seg.digits);
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
      const [lower, upper] = seg.cases;
      out += writeDotRuns(sp.cells.length, (c) => {
        const v = list.valueAt[c];
        return v === upper ? 1 : v === lower ? 0 : null;
      });
      continue;
    }
    const list = listOf(seg.numbers);
    elements(sp, universeOf(deal, seg.numbers), seg.order).forEach((e, i) => {
      out += i === 0 ? (seg.before ?? "") : ",";
      const v = list.valueAt[e];
      if (v >= 0) out += String(v);
    });
  }
  return out;
}

const isRunChar = (ch: string): boolean => ch === "_" || (ch >= "a" && ch <= "z");

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
): DescParse<C> {
  return readDesc(desc, (r) => {
    const out: Partial<Record<keyof C, ClueList | Partition>> = {};
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
        out[seg.walls as keyof C] = parts;
        continue;
      }
      if ("runs" in seg) {
        const n = sp.cells.length;
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
        out[seg.runs as keyof C] = clueList(
          at,
          at.map(() => 0),
          n,
        );
        continue;
      }
      if ("digits" in seg) {
        // A digit is one cell's clue, a letter a run of 1 to 26 without one;
        // the last run is written, so the cells end with the segment. With
        // `apart`, a clue is a whole number, and `apart` is between two with
        // no run between them, exactly there.
        const kind = seg.digits as keyof C;
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
        // Whether the cell before was written, so a clue here has no run
        // before it.
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
              if (value > maxOf(clueMax, k as keyof C, sp, c))
                r.fail(DESC_OUT_OF_RANGE);
              const got = numberedAt.get(k);
              got?.at.push(c);
              got?.v.push(value);
            }
            pos++;
            afterClue = true;
            continue;
          }
          const max = Math.max(maxOf(clueMax, kind, sp, c), topAlso);
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
          if (value > maxOf(clueMax, kind, sp, c)) r.fail(DESC_OUT_OF_RANGE);
          at.push(c);
          v.push(value);
        }
        const all = sp.cells.length;
        out[kind] = clueList(at, v, all);
        for (const [k, got] of numberedAt)
          out[k as keyof C] = clueList(got.at, got.v, all);
        for (const [k, marked] of markedAt) {
          const sorted = marked.toSorted((a, b) => a - b);
          out[k as keyof C] = clueList(
            sorted,
            sorted.map(() => 0),
            all,
          );
        }
        continue;
      }
      if ("dots" in seg) {
        const at: number[] = [];
        const v: number[] = [];
        readDotRuns(r, sp.cells.length, (c, kind) => {
          at.push(c);
          v.push(seg.cases[kind]);
        });
        out[seg.dots as keyof C] = clueList(at, v, sp.cells.length);
        continue;
      }
      const kind = seg.numbers as keyof C;
      const universe = universeOf(deal, seg.numbers);
      const at: number[] = [];
      const v: number[] = [];
      elements(sp, universe, seg.order).forEach((e, i) => {
        if (i === 0) {
          if (seg.before !== undefined) r.expect(seg.before);
        } else r.expect(",");
        // An absent clue is written as nothing.
        if (!r.peekIs(isDigit)) return;
        at.push(e);
        v.push(r.int(0, maxOf(clueMax, kind, sp, e)));
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
