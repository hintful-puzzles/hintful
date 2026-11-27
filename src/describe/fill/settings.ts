/**
 * The settings the params give (`settings:`), as the deal holds them
 * (`engine/fill/params/settings.ts`): each checked for what its kind needs,
 * its letters held in the one registry, and a choice's bounds with their
 * tiers by index.
 */

import type { FillSetting } from "../../engine/fill/params/settings.ts";
import { SQUARE_ONLY } from "../../engine/generate/symmetry.ts";
import { CompileError, type Env } from "../compile-sorts.ts";
import type {
  ChoiceJson,
  Description,
  DescriptionJson,
  SettingJson,
} from "../description.ts";
import { tierIndex } from "./emit.ts";
import type { Letters } from "./letters.ts";
import { blocksOf, fillBlocksOf } from "./partitions.ts";

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/** A setting as the deal holds it. */
export type SettingOut = Mutable<FillSetting>;

/** The Custom field `s` states, refused where it states none. */
function fieldOf(id: string, s: SettingJson) {
  if (s.kw === undefined || s.name === undefined || s.doc === undefined)
    throw new CompileError(`settings ${id}: no kw, name and doc`);
  return { kw: s.kw, name: s.name, doc: s.doc };
}

/** The letter `s` is written by, held for it. */
function letterOf(id: string, s: SettingJson, letters: Letters): string {
  if (s.letter === undefined) throw new CompileError(`settings ${id}: no letter`);
  letters.claim(s.letter, `settings ${id}`);
  return s.letter;
}

/** `s`'s bounds as the engine holds them, a tier's by its index. */
function choicesOut(id: string, cs: readonly ChoiceJson[], tiers: readonly string[]) {
  return cs.map(({ bounds, ...bare }) => {
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
                tier: tierIndex(tiers, t, `settings ${id}`),
                ...b,
              })),
            }),
      },
    };
  });
}

/** A choice: of a size, each a ruleset from the size's least, or of the
 * deal; written by its letter, or by its choices' codes, `""` the default's
 * alone. */
function choiceOut(
  json: DescriptionJson,
  env: Env,
  id: string,
  s: SettingJson,
  tiers: readonly string[],
  letters: Letters,
): SettingOut {
  const choices = s.choices ?? [];
  if (choices.length === 0) throw new CompileError(`settings ${id}: no choices`);
  const codes = choices.map((c) => c.code);
  const size = s.gives === "size";
  const range = json.sizes[id];
  if (size) {
    if (range === undefined || !env.sizes.names.has(id))
      throw new CompileError(`settings ${id}: gives no size beyond the grid's`);
    if (range.max === undefined || choices.length !== range.max - range.min + 1)
      throw new CompileError(`settings ${id}: not one choice a value of the size`);
  }
  const byDefault = s.default ?? 0;
  if (byDefault < 0 || byDefault >= choices.length)
    throw new CompileError(`settings ${id}: the default is no choice`);
  if (s.letter === undefined) {
    if (codes.some((c) => c === undefined))
      throw new CompileError(`settings ${id}: no letter, and not a code a choice`);
    if (new Set(codes).size !== codes.length)
      throw new CompileError(`settings ${id}: two choices of one code`);
    codes.forEach((c, i) => {
      if (c === "" && i !== byDefault)
        throw new CompileError(`settings ${id}: a code "" on a choice not the default`);
    });
    for (const c of codes as string[])
      if (c !== "" && letters.has(c[0] ?? ""))
        throw new CompileError(
          `settings ${id}: the code ${c} begins with a letter taken`,
        );
    // A code's first letter is its own, so no later field takes it.
    for (const c of new Set((codes as string[]).map((c) => c[0] ?? "")))
      if (c !== "") letters.claim(c, `settings ${id}`);
  } else {
    if (codes.some((c) => c !== undefined))
      throw new CompileError(`settings ${id}: a letter and codes`);
    letters.claim(s.letter, `settings ${id}`);
  }
  const symmetries = choices.filter((c) => c.symmetry !== undefined).length;
  if (symmetries > 0 && symmetries !== choices.length)
    throw new CompileError(`settings ${id}: a symmetry on some choices only`);
  for (const c of choices)
    if (
      c.symmetry !== undefined &&
      SQUARE_ONLY.has(c.symmetry) &&
      c.bounds?.square !== true &&
      json.space.grid?.w !== json.space.grid?.h
    )
      throw new CompileError(
        `settings ${id}: ${c.name} keeps ${c.symmetry}, which needs a square board`,
      );
  return {
    kind: "choice",
    id,
    ...(s.after === undefined ? {} : { after: s.after }),
    ...(s.letter === undefined ? {} : { letter: s.letter }),
    ...(size ? { gives: "size" as const } : fieldOf(id, s)),
    from: size ? (range?.min ?? 0) : 0,
    default: byDefault,
    choices: choicesOut(id, choices, tiers),
  };
}

/** A flag: a variation of its name, which only adds, or the deal's. */
function flagOut(
  json: DescriptionJson,
  id: string,
  s: SettingJson,
  letters: Letters,
): SettingOut {
  const letter = letterOf(id, s, letters);
  const { kind: _kind, letter: _letter, gives, after, ...rest } = s;
  if (gives === "variation") {
    const v = json.variations?.[id];
    if (v === undefined) throw new CompileError(`settings ${id}: no variation ${id}`);
    if (v.replace !== undefined)
      throw new CompileError(
        `settings ${id}: the variation replaces, so it is a ruleset`,
      );
    if (s.rule === undefined || typeof s.words !== "string")
      throw new CompileError(`settings ${id}: a variation has its rule and words`);
    // The board passes the variations after its clues, which an answer
    // check takes only where it reads one.
    if (Object.keys(json.clues ?? {}).length === 0)
      throw new CompileError(
        `settings ${id}: a fill game with variations deals a clue`,
      );
  }
  // A variation's field says its rule in place of a doc.
  const field = fieldOf(id, gives === "variation" ? { ...s, doc: "" } : s);
  return {
    kind: "flag",
    id,
    letter,
    ...(gives === "variation" ? { gives } : {}),
    ...(after === undefined ? {} : { after }),
    ...rest,
    ...field,
  };
}

/** A set: each member a kind of clue the deal deals, which the board's own
 * rules read none of. */
function setOut(
  d: Description,
  id: string,
  s: SettingJson,
  letters: Letters,
): SettingOut {
  const members = s.members ?? [];
  if (members.length === 0) throw new CompileError(`settings ${id}: no members`);
  for (const { kind, letter } of members) {
    const c = d.clueKinds.get(kind);
    if (c === undefined) throw new CompileError(`settings ${id}: no clue kind ${kind}`);
    if (c.complete || kind === "given")
      throw new CompileError(`settings ${id}: ${kind} is dealt whatever the params`);
    letters.claim(letter, `settings ${id}`);
  }
  if (new Set(members.map((m) => m.kind)).size !== members.length)
    throw new CompileError(`settings ${id}: a kind named twice`);
  return {
    kind: "set",
    id,
    ...(s.after === undefined ? {} : { after: s.after }),
    members,
  };
}

/** A tally: its id a board clue of two fields, each length and its count. */
function tallyOut(
  json: DescriptionJson,
  id: string,
  s: SettingJson,
  tiers: readonly string[],
  letters: Letters,
): SettingOut {
  const letter = letterOf(id, s, letters);
  const kind = json.clues?.[id];
  const fields = Object.keys(kind?.fields ?? {});
  if (kind?.at !== "board" || fields.length !== 2 || s.size === undefined)
    throw new CompileError(
      `settings ${id}: no board clue ${id} of two fields, a length and its count`,
    );
  if (s.counts === undefined) throw new CompileError(`settings ${id}: no counts`);
  const single = s.single === undefined ? -1 : tiers.indexOf(s.single);
  if (s.single !== undefined && single < 0)
    throw new CompileError(`settings ${id}: single names no tier ${s.single}`);
  return {
    kind: "tally",
    id,
    letter,
    index: fields[0],
    count: fields[1],
    size: { ...s.size, min: 1 },
    counts: s.counts,
    ...(single < 0 ? {} : { single }),
  };
}

/** Setting `id` of the description, `s`, as the deal holds it, by its kind. */
function settingOut(
  json: DescriptionJson,
  d: Description,
  env: Env,
  tiers: readonly string[],
  letters: Letters,
  id: string,
  s: SettingJson,
): SettingOut {
  if (s.gives === "variation" && s.kind !== "flag")
    throw new CompileError(`settings ${id}: a variation is a flag`);
  switch (s.kind) {
    case "flag":
      return flagOut(json, id, s, letters);
    case "number": {
      const letter = letterOf(id, s, letters);
      const { min, max } = s;
      if (min === undefined || max === undefined)
        throw new CompileError(`settings ${id}: no min and max`);
      const byDefault = s.default ?? min;
      if (byDefault < min || byDefault > max)
        throw new CompileError(`settings ${id}: the default is out of range`);
      const size = s.gives === "size";
      if (size) {
        const range = json.sizes[id];
        if (range === undefined || !env.sizes.names.has(id))
          throw new CompileError(`settings ${id}: gives no size beyond the grid's`);
        // The rules are checked sound on the size's range, so the params give
        // no value past it.
        if (min < range.min || (range.max !== undefined && max > range.max))
          throw new CompileError(`settings ${id}: a range past the size's`);
      }
      return {
        kind: "number",
        id,
        ...(size ? { gives: "size" as const } : {}),
        letter,
        ...(s.after === undefined ? {} : { after: s.after }),
        ...fieldOf(id, s),
        min,
        max,
        default: byDefault,
        ...(typeof s.words === "string" ? { words: s.words } : {}),
      };
    }
    case "choice":
      return choiceOut(json, env, id, s, tiers, letters);
    case "set":
      return setOut(d, id, s, letters);
    case "tally":
      return tallyOut(json, id, s, tiers, letters);
    case "blocks": {
      const b = fillBlocksOf(json, env, id, s);
      letters.claim(b.letter, `settings ${id}`);
      return { kind: "blocks", id, ...b };
    }
  }
}

/**
 * Every setting of `json.settings`, in its order, as the deal holds it. A
 * size beyond the grid's no setting gives, a letter two fields take, or a
 * second ruleset field, is refused.
 */
export function settingsOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  tiers: readonly string[],
  letters: Letters,
): SettingOut[] {
  const out = Object.entries(json.settings ?? {}).map(([id, s]) =>
    settingOut(json, d, env, tiers, letters, id, s),
  );
  // A board sized by its blocks gives their sizes as its own.
  const blocks: readonly (number | string)[] = out.some((s) => s.kind === "blocks")
    ? (blocksOf(json, env.boxes) ?? [])
    : [];
  for (const n of env.sizes.names)
    if (!blocks.includes(n) && !sizeSettings(out).some((s) => s.id === n))
      throw new CompileError(`settings: ${n} is a size the params must give`);
  // The Custom dialog has one ruleset field.
  const rulesets = out.filter(
    (s) => s.kind === "blocks" || (s.kind === "choice" && s.gives === "size"),
  );
  if (rulesets.length > 1)
    throw new CompileError("settings: a game has one field of rulesets");
  return out;
}

/** The flag of `settings` named `id`, refused where there is none, for the
 * deal key `where`. */
export function dealFlag(
  settings: readonly SettingOut[],
  id: string,
  where: string,
): string {
  const s = settings.find((x) => x.id === id);
  if (s?.kind !== "flag" || s.gives !== undefined)
    throw new CompileError(`${where}: ${id} is no flag of the deal's`);
  return id;
}

/** The sizes the settings give, each with its least and its count of
 * values. */
export const sizeSettings = (
  settings: readonly SettingOut[],
): { id: string; from: number; values: number }[] =>
  settings.flatMap((s) =>
    s.kind === "choice" && s.gives === "size"
      ? [{ id: s.id, from: s.from, values: s.choices.length }]
      : s.kind === "number" && s.gives === "size"
        ? [{ id: s.id, from: s.min, values: s.max - s.min + 1 }]
        : [],
  );
