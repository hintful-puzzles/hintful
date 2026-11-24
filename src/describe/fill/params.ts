/**
 * The params of a fill game as the deal holds them (`engine/fill/params/`):
 * the sizes beyond the grid's, the deal's options, the tally, the kind
 * letters, the modifiers and the retired tier letters.
 */

import { SQUARE_ONLY, type Symmetry } from "../../engine/generate/symmetry.ts";
import { CompileError, type Env } from "../compile-sorts.ts";
import {
  type Description,
  type DescriptionJson,
  type KindLetterJson,
  kindLettersJsonOf,
  type OptionJson,
  optionsOf,
  type PlayJson,
  type SizeBoundsJson,
} from "../description.ts";
import { tierIndex } from "./emit.ts";
import type { Letters } from "./letters.ts";
import { blocksOf } from "./partitions.ts";

/** A size beyond the grid's as the deal holds it (`FillSetting`). */
export type FillSettingJson = ({ letter: string } | { letters: string[] }) & {
  size: string;
  min: number;
  rulesets: { name: string; rule: string; least?: number }[];
};

/** The letters a setting is written by in the params: its one before the
 * number, or each of its bare ones but the one written as nothing. */
const settingLetters = (s: { letter?: string; letters?: readonly string[] }) =>
  s.letter !== undefined ? [s.letter] : (s.letters ?? []).filter((l) => l !== "");

/**
 * The sizes beyond the grid's that the params give, from `play.sizes`: each
 * a size the rules read that the grid is not measured in, with one ruleset a
 * value. A size with no setting, a setting of no such size, a letter another
 * field takes, or a second ruleset field is refused.
 */
export function settingsOf(
  json: DescriptionJson,
  env: Env,
  letters: Letters,
): FillSettingJson[] {
  const given = json.play?.sizes ?? {};
  // A board sized by its blocks gives their sizes as its own.
  const blocks: readonly (number | string)[] =
    json.play?.blocks === undefined ? [] : (blocksOf(json, env.boxes) ?? []);
  for (const n of env.sizes.names)
    if (given[n] === undefined && !blocks.includes(n))
      throw new CompileError(`play sizes: ${n} is a size the params must give`);
  const out = Object.entries(given).map(([size, s]) => {
    const range = json.sizes[size];
    if (range === undefined || !env.sizes.names.has(size))
      throw new CompileError(`play sizes: ${size} is no size beyond the grid's`);
    for (const letter of settingLetters(s)) letters.claim(letter, "play sizes");
    if (range.max === undefined || s.rulesets.length !== range.max - range.min + 1)
      throw new CompileError(`play sizes: ${size} has not one ruleset a value`);
    const rest = { size, min: range.min, rulesets: s.rulesets };
    if (s.letters === undefined) return { ...rest, letter: s.letter };
    if (s.letters.length !== s.rulesets.length)
      throw new CompileError(`play sizes: ${size} has not one letter a ruleset`);
    return { ...rest, letters: s.letters };
  });
  // The Custom dialog has one ruleset field.
  if (out.length > 1)
    throw new CompileError("play sizes: a game has one field of rulesets");
  return out;
}

/** Bounds as the engine holds them (`SizeBounds`), a tier's by its index. */
type BoundsOut = SizeBoundsJson & {
  square?: true;
  tiers?: (SizeBoundsJson & { tier: number })[];
};

/**
 * The deal's options as the engine holds them (`FillOption`): each choice's
 * bounds with its tiers by index. A letter another field takes, a number
 * with no range, or a default out of range, is refused.
 */
export function optionsJsonOf(
  json: DescriptionJson,
  tiers: readonly string[],
  letters: Letters,
): Record<
  string,
  Omit<OptionJson, "choices"> & {
    choices?: {
      name: string;
      words?: string;
      bounds?: BoundsOut;
      symmetry?: Symmetry;
      code?: string;
    }[];
  }
> {
  return Object.fromEntries(
    Object.entries(optionsOf(json)).map(([name, o]) => {
      const codes = o.choices?.map((c) => c.code) ?? [];
      if (o.letter === undefined) {
        // Written by its codes in place of a letter: one a choice, and none
        // beginning with a letter another field is written by.
        if (codes.length === 0 || codes.some((c) => c === undefined || c === ""))
          throw new CompileError(
            `deal options: ${name} has no letter, and not a code a choice`,
          );
        if (new Set(codes).size !== codes.length)
          throw new CompileError(`deal options: ${name} has two choices of one code`);
        for (const c of codes as string[])
          if (letters.has(c[0] ?? ""))
            throw new CompileError(
              `deal options: ${name}'s code ${c} begins with a letter taken`,
            );
      } else {
        if (codes.some((c) => c !== undefined))
          throw new CompileError(`deal options: ${name} has a letter and codes`);
        letters.claim(o.letter, "deal options");
      }
      const symmetries = o.choices?.filter((c) => c.symmetry !== undefined).length ?? 0;
      if (symmetries > 0 && symmetries !== o.choices?.length)
        throw new CompileError(
          `deal options: ${name} has a symmetry on some choices only`,
        );
      for (const c of o.choices ?? [])
        if (
          c.symmetry !== undefined &&
          SQUARE_ONLY.has(c.symmetry) &&
          c.bounds?.square !== true &&
          json.space.grid?.w !== json.space.grid?.h
        )
          throw new CompileError(
            `deal options: ${name}'s ${c.name} keeps ${c.symmetry}, which needs a square board`,
          );
      const [min, max] =
        o.choices === undefined ? [o.min, o.max] : [0, o.choices.length - 1];
      if (min === undefined || max === undefined)
        throw new CompileError(`deal options: ${name} has no min and max`);
      if (o.default < min || o.default > max)
        throw new CompileError(`deal options: ${name}'s default is out of range`);
      const choices = o.choices?.map(({ bounds, ...bare }) => {
        if (bounds === undefined) return bare;
        const { tiers: byTier, ...all } = bounds;
        return {
          ...bare,
          bounds: {
            ...all,
            ...(byTier === undefined
              ? {}
              : {
                  tiers: Object.entries(byTier).map(([t, b]) => ({
                    tier: tierIndex(tiers, t, `deal options ${name}`),
                    ...b,
                  })),
                }),
          },
        };
      });
      return [name, { ...o, min, max, ...(choices === undefined ? {} : { choices }) }];
    }),
  );
}

type TallyJson = NonNullable<PlayJson["tally"]>;

/** The module's tally (`engine/fill/params/tally.ts`'s `FillTally`). */
interface Tally {
  kind: string;
  index: string;
  count: string;
  size: TallyJson["size"] & { min: number };
  counts: TallyJson["counts"];
  single?: number;
}

/** `play.tally`: a board kind of two fields, each length and its count, the
 * params give; `null` where there is none. */
export function tallyOf(
  json: DescriptionJson,
  tiers: readonly string[],
  letters: Letters,
): Tally | null {
  const t = json.play?.tally;
  if (t === undefined) return null;
  letters.claim(t.size.letter, "play tally");
  const kind = json.clues?.[t.kind];
  const fields = Object.keys(kind?.fields ?? {});
  if (kind?.at !== "board" || fields.length !== 2)
    throw new CompileError(
      `play tally: ${t.kind} is no board clue of two fields, a length and its count`,
    );
  const single = t.single === undefined ? -1 : tiers.indexOf(t.single);
  if (t.single !== undefined && single < 0)
    throw new CompileError(`play tally: single names no tier ${t.single}`);
  return {
    kind: t.kind,
    index: fields[0],
    count: fields[1],
    size: { ...t.size, min: 1 },
    counts: t.counts,
    ...(single < 0 ? {} : { single }),
  };
}

/** `deal.kindLetters`: each a kind of clue the deal deals, and a kind the
 * board's own rules read none of; `null` where there are none. */
export function kindLettersOf(
  json: DescriptionJson,
  d: Description,
): readonly KindLetterJson[] | null {
  const letters = kindLettersJsonOf(json);
  if (letters === null) return null;
  for (const { kind } of letters) {
    const c = d.clueKinds.get(kind);
    if (c === undefined)
      throw new CompileError(`deal kindLetters: no clue kind ${kind}`);
    if (c.complete || kind === "given")
      throw new CompileError(`deal kindLetters: ${kind} is dealt whatever the params`);
  }
  if (new Set(letters.map((l) => l.kind)).size !== letters.length)
    throw new CompileError("deal kindLetters: a kind named twice");
  if (new Set(letters.map((l) => l.letter)).size !== letters.length)
    throw new CompileError("deal kindLetters: a letter named twice");
  return letters;
}

/** The modifiers, each a variation the description has that only adds: a
 * ruleset would need a choice, which no fill game offers yet. */
export function checkedModifiers(
  json: DescriptionJson,
  modifiers: NonNullable<PlayJson["modifiers"]>,
  letters: Letters,
): NonNullable<PlayJson["modifiers"]> {
  for (const [name, m] of Object.entries(modifiers)) {
    const v = json.variations?.[name];
    if (v === undefined)
      throw new CompileError(`play modifiers: ${name} is no variation`);
    if (v.replace !== undefined)
      throw new CompileError(`play modifiers: ${name} replaces, so it is a ruleset`);
    letters.claim(m.letter, "play modifiers");
  }
  // The board passes the variations after its clues, which an answer check
  // takes only where it reads one.
  if (Object.keys(json.clues ?? {}).length === 0)
    throw new CompileError("play modifiers: a fill game with variations deals a clue");
  return modifiers;
}

/** The retired tier letters, each the index of the tier it reads as. */
export function tierAliasesOf(
  json: DescriptionJson,
  tiers: readonly string[],
  tierLetters: string,
): Record<string, number> | null {
  if (json.tierAliases === undefined) return null;
  return Object.fromEntries(
    Object.entries(json.tierAliases).map(([letter, tier]) => {
      if (tierLetters.includes(letter))
        throw new CompileError(`tierAliases: ${letter} is a tier's own letter`);
      return [letter, tierIndex(tiers, tier, "tierAliases")];
    }),
  );
}
