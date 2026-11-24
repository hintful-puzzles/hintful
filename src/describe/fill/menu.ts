/**
 * The preset menu of a fill game (`engine/fill/game.ts`'s presets): its boards, as
 * their params write them, the default and the tiers each stops at, the
 * variant boards, and the bounds the sizes alone cannot say.
 */

import { CompileError } from "../compile-sorts.ts";
import {
  type DescriptionJson,
  onlyFlagOf,
  optionsOf,
  type PlayJson,
} from "../description.ts";
import { present } from "./emit.ts";
import { blocksOf } from "./partitions.ts";

/** A board's `WxH` as its size, each size beyond the grid's it gives after
 * it by its params letter (`8x8s2`, two stars), a size it does not name at
 * its least, and each deal option it names by its letter (`7x7s4`). A letter
 * that is neither's is refused. */
export const sizeOf =
  (json: DescriptionJson) =>
  (
    b: string,
  ): {
    w: number;
    h: number;
    sizes?: Record<string, number>;
    options?: Record<string, number>;
    tally?: number;
  } => {
    const blocks = json.play?.blocks;
    // A board sized by its blocks is written as its ID writes it: `{b}x{a}`
    // of `blocks(a, b)`, or `{b}` and the letter where they are dealt.
    const cut =
      blocks === undefined
        ? null
        : blocksOf(
            json,
            Object.keys(json.space.regions ?? {}).find((r) =>
              json.space.units.includes(r),
            ) ?? null,
          );
    const dealtAt =
      blocks === undefined ? null : new RegExp(`^(\\d+)${blocks.letter}`).exec(b);
    const written =
      dealtAt === null ? b : `${dealtAt[1]}x1${b.slice(dealtAt[0].length)}`;
    const m = /^(\d+)x(\d+)((?:[a-z]\d+|[A-Za-z](?!\d))*)$/.exec(written);
    if (m === null) throw new CompileError(`play boards: ${b} is not WxH`);
    const sizes: Record<string, number> = Object.fromEntries(
      Object.keys(json.play?.sizes ?? {}).map((n) => [n, json.sizes[n]?.min ?? 0]),
    );
    if (cut !== null) {
      const [down, across] = cut;
      const side = Number(m[1]) * Number(m[2]);
      sizes[String(across)] = Number(m[1]);
      sizes[String(down)] = Number(m[2]);
      m[1] = String(side);
      m[2] = String(side);
    }
    const options: Record<string, number> = {};
    let tally: number | null = null;
    for (const [, letter, n] of m[3].matchAll(/([A-Za-z])(\d*)/g)) {
      // A bare letter is a ruleset written by its own (`6x6T`, Tectonic).
      if (n === "") {
        const bare = Object.entries(json.play?.sizes ?? {}).find(([, s]) =>
          s.letters?.includes(letter),
        );
        if (bare === undefined)
          throw new CompileError(`play boards: ${b}: ${letter} is no ruleset's letter`);
        const [name, s] = bare;
        sizes[name] = (json.sizes[name]?.min ?? 0) + (s.letters ?? []).indexOf(letter);
        continue;
      }
      if (letter === json.play?.tally?.size.letter) {
        tally = Number(n);
        continue;
      }
      const named = Object.entries(json.play?.sizes ?? {}).find(
        ([, s]) => s.letter === letter,
      );
      const option = Object.entries(optionsOf(json)).find(
        ([, o]) => o.letter === letter,
      );
      if (named !== undefined) sizes[named[0]] = Number(n);
      else if (option !== undefined) options[option[0]] = Number(n);
      else
        throw new CompileError(
          `play boards: ${b}: ${letter} is no size's letter or option's`,
        );
    }
    return {
      w: Number(m[1]),
      h: Number(m[2]),
      ...(Object.keys(sizes).length === 0 ? {} : { sizes }),
      ...(Object.keys(options).length === 0 ? {} : { options }),
      ...present("tally", tally),
    };
  };

/** The Custom field of the deal's setting `key`, where it states one. */
function dealSettingKw(json: DescriptionJson, key: string): string | null {
  const f = json.deal?.[key];
  return typeof f === "object" && f !== null && "kw" in f && typeof f.kw === "string"
    ? f.kw
    : null;
}

/**
 * `menu`, what the preset menu offers beside its grid of `boards`: the
 * default board where it is not the first, the tiers a board stops at, and
 * the variant boards, a tier by its index. Nothing where the description
 * states none. A board not in `boards`, a tier not in `tiers` or a variation
 * the description lacks is refused.
 */
export function menuOf(
  json: DescriptionJson,
  p: Pick<PlayJson, "boards" | "boardTiers" | "variants" | "defaultTier"> & {
    byDefault?: string;
  },
): string[] {
  const { boards, byDefault, defaultTier, boardTiers, variants } = p;
  if (
    byDefault === undefined &&
    defaultTier === undefined &&
    boardTiers === undefined &&
    variants === undefined
  )
    return [];
  const tiers = json.tiers ?? [];
  const tierOf = (name: string, where: string): number => {
    const i = tiers.indexOf(name);
    if (i < 0) throw new CompileError(`play ${where}: ${name} is no tier`);
    return i;
  };
  const board = (b: string, where: string) => {
    if (!boards?.includes(b))
      throw new CompileError(`play ${where}: ${b} is not in boards`);
    return sizeOf(json)(b);
  };
  // The default board is offered at its tier.
  const first = boards?.[0];
  const offered = boardTiers?.[byDefault ?? first ?? ""] ?? [tiers[0], tiers.at(-1)];
  const dealtAt = defaultTier === undefined ? null : tierOf(defaultTier, "defaultTier");
  if (
    dealtAt !== null &&
    (dealtAt < tierOf(offered[0] ?? "", "defaultTier") ||
      dealtAt > tierOf(offered[1] ?? "", "defaultTier"))
  )
    throw new CompileError(
      `play defaultTier: the menu does not offer the default board at ${defaultTier}`,
    );
  const menu = {
    ...(byDefault === undefined ? {} : { default: board(byDefault, "default") }),
    ...present("defaultTier", dealtAt),
    tiers: Object.entries(boardTiers ?? {}).map(([b, [first, last]]) => ({
      ...board(b, "boardTiers"),
      first: tierOf(first, "boardTiers"),
      last: tierOf(last, "boardTiers"),
    })),
    variants: (variants ?? []).map((v) => {
      // A deal's setting is named by its Custom field, a variation by its name.
      const settings = Object.entries({
        only: onlyFlagOf(json)?.kw ?? null,
        hides: dealSettingKw(json, "hideFlag"),
      }).filter(([, kw]) => kw !== null && v.with.includes(kw));
      const variations = v.with.filter(
        (name) => !settings.some(([, kw]) => kw === name),
      );
      for (const name of variations)
        if (json.variations?.[name] === undefined)
          throw new CompileError(`play variants: ${name} is no variation or setting`);
      return {
        ...board(v.board, "variants"),
        variations,
        ...Object.fromEntries(settings.map(([field]) => [field, true])),
        diff: tierOf(v.tier, "variants"),
      };
    }),
  };
  return [
    "",
    "/** The preset menu beside its grid: the default board, the tiers a board",
    " * stops at, and the variant boards. */",
    `export const menu = ${JSON.stringify(menu)} as const;`,
  ];
}

/**
 * `bounds`, what the sizes alone cannot say of a board (`play.bounds`), a
 * tier's by its index. Nothing where the description states none; a tier
 * not in `tiers` is refused.
 */
export function boundsOf(json: DescriptionJson, bounds: PlayJson["bounds"]): string[] {
  if (bounds === undefined) return [];
  const { tiers: byTier, ...all } = bounds;
  const tiers = json.tiers ?? [];
  const out = {
    all,
    tiers: Object.entries(byTier ?? {}).map(([name, b]) => {
      const tier = tiers.indexOf(name);
      if (tier < 0) throw new CompileError(`play bounds: ${name} is no tier`);
      return { tier, ...b };
    }),
  };
  return [
    "",
    "/** What the sizes alone cannot say of a board, and of a board of a tier. */",
    `export const bounds = ${JSON.stringify(out)} as const;`,
  ];
}
