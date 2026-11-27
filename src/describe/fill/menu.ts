/**
 * The preset menu of a fill game (`engine/fill/game.ts`'s presets): its boards, as
 * their params write them, the default and the tiers each stops at, the
 * variant boards, and the bounds the sizes alone cannot say.
 */

import { CompileError } from "../compile-sorts.ts";
import type { DescriptionJson, PlayJson } from "../description.ts";
import { present } from "./emit.ts";
import { blocksOf } from "./partitions.ts";

/** A board's `WxH` as its size, and each setting it names after it by its
 * letter and number (`8x8s2`, two stars) or by a choice's code (`6x6T`); a
 * size it does not name at its least. A letter no setting's is refused. */
export const sizeOf =
  (json: DescriptionJson) =>
  (
    b: string,
  ): {
    w: number;
    h: number;
    sizes?: Record<string, number>;
    settings?: Record<string, number>;
    tally?: number;
  } => {
    const named = Object.entries(json.settings ?? {});
    const blocks = named.find(([, s]) => s.kind === "blocks")?.[1];
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
      named
        .filter(([, s]) => s.gives === "size")
        .map(([n]) => [n, json.sizes[n]?.min ?? 0]),
    );
    if (cut !== null) {
      const [down, across] = cut;
      const side = Number(m[1]) * Number(m[2]);
      sizes[String(across)] = Number(m[1]);
      sizes[String(down)] = Number(m[2]);
      m[1] = String(side);
      m[2] = String(side);
    }
    const settings: Record<string, number> = {};
    let tally: number | null = null;
    for (const [, letter, n] of m[3].matchAll(/([A-Za-z])(\d*)/g)) {
      // A bare letter is a choice written by its code (`6x6T`, Tectonic).
      if (n === "") {
        const coded = named.find(([, s]) => s.choices?.some((c) => c.code === letter));
        if (coded === undefined)
          throw new CompileError(`play boards: ${b}: ${letter} is no choice's code`);
        const [id, s] = coded;
        const index = (s.choices ?? []).findIndex((c) => c.code === letter);
        if (s.gives === "size") sizes[id] = (json.sizes[id]?.min ?? 0) + index;
        else settings[id] = index;
        continue;
      }
      const found = named.find(([, s]) => s.letter === letter && s.kind !== "blocks");
      if (found === undefined)
        throw new CompileError(`play boards: ${b}: ${letter} is no setting's letter`);
      const [id, s] = found;
      if (s.kind === "tally") tally = Number(n);
      else if (s.gives === "size") sizes[id] = Number(n);
      else settings[id] = Number(n);
    }
    return {
      w: Number(m[1]),
      h: Number(m[2]),
      ...(Object.keys(sizes).length === 0 ? {} : { sizes }),
      ...(Object.keys(settings).length === 0 ? {} : { settings }),
      ...present("tally", tally),
    };
  };

/**
 * `menu`, what the preset menu offers beside its grid of `boards`: the
 * default board where it is not the first, the tiers a board stops at and
 * those it skips between, and the variant boards, a tier by its index.
 * Nothing where the description states none. A default or a board stopping
 * at tiers not in `boards`, a tier not in `tiers`, a skip outside its
 * board's first and last or a variation the description lacks is refused.
 */
export function menuOf(
  json: DescriptionJson,
  p: Pick<
    PlayJson,
    "boards" | "boardTiers" | "boardSkips" | "variants" | "defaultTier"
  > & {
    byDefault?: string;
  },
): string[] {
  const { boards, byDefault, defaultTier, boardTiers, boardSkips, variants } = p;
  if (
    byDefault === undefined &&
    defaultTier === undefined &&
    boardTiers === undefined &&
    boardSkips === undefined &&
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
    ...(boardSkips === undefined
      ? {}
      : {
          skips: Object.entries(boardSkips).map(([b, skipped]) => {
            const [first, last] = (boardTiers?.[b] ?? [tiers[0], tiers.at(-1)]).map(
              (t) => tierOf(t ?? "", "boardTiers"),
            );
            return {
              ...board(b, "boardSkips"),
              tiers: skipped.map((t) => {
                const i = tierOf(t, "boardSkips");
                if (i <= (first ?? 0) || i >= (last ?? 0))
                  throw new CompileError(
                    `play boardSkips: ${b} skips ${t}, not between its first and last tier`,
                  );
                return i;
              }),
            };
          }),
        }),
    variants: (variants ?? []).map((v) => {
      // A flag of the deal's is on by its name, and a variation by its own.
      const flags = v.with.filter((id) => {
        const s = json.settings?.[id];
        return s?.kind === "flag" && s.gives === undefined;
      });
      const variations = v.with.filter((id) => !flags.includes(id));
      for (const name of variations)
        if (json.variations?.[name] === undefined)
          throw new CompileError(`play variants: ${name} is no variation or flag`);
      // A variant may need sizes no board of the grid has (ABCD's rule
      // against diagonal touching, five letters or more).
      const sized = sizeOf(json)(v.board);
      return {
        ...sized,
        ...(flags.length === 0
          ? {}
          : {
              settings: {
                ...sized.settings,
                ...Object.fromEntries(flags.map((id) => [id, 1])),
              },
            }),
        variations,
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
