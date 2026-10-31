/**
 * A description as its YAML states it, loaded: every formula parsed, so a
 * description that loads has no syntax error left in it. The compiler
 * (`compile.ts`) builds techniques from it, and the development tools under
 * `research/` read its rules too. Reading the file is `load.ts`'s.
 */

import { type Binder, type Expr, parse } from "./expr.ts";

/** A game's help page, as `description.schema.json` states it. */
export interface HelpJson {
  rules: string;
  controls: string;
  sections?: { heading: string; body: string }[];
  origins?: string;
  hints?: string;
  parameters?: { before?: string; after?: string };
}

/** A game's description that is its help page and no formal rules yet. */
export interface HelpOnlyJson {
  game: string;
  help: HelpJson;
}

/** A description with its formal rules, as `description.schema.json` states
 * it, and the help page of a cataloged game. */
export interface DescriptionJson {
  game: string;
  help?: HelpJson;
  name: string;
  family: string;
  sizes: Record<string, { min: number; max: number }>;
  space: {
    grid: { w: string; h: string };
    slots?: boolean;
    edges?: boolean;
    corners?: boolean;
    diagonals?: boolean;
    regions?: Record<string, "dealt" | string>;
    units: string[];
  };
  answer: { value: { sort: "cell"; domain: string } };
  given?: string[];
  marks?: Record<string, { sort: string; notation: string }>;
  define?: Record<string, string>;
  shape?: string[];
  rules?: Record<string, string>;
  clues?: Record<
    string,
    { at: string; value: string; means: string; complete?: boolean }
  >;
  freedom: { kind: string };
  deal?: Record<string, string>;
  tiers?: string[];
  /** Grading scales besides `tiers`, by name, each its tiers easiest first. */
  scales?: Record<string, string[]>;
  techniques?: TechniqueJson[];
  variations?: Record<string, VariationJson>;
}

/** The description with the named variations applied, in order. */
export function withVariations(
  json: DescriptionJson,
  names: readonly string[],
): DescriptionJson {
  let out = json;
  for (const name of names) {
    const v = json.variations?.[name];
    if (v === undefined) throw new Error(`${json.game}: no variation ${name}`);
    out = {
      ...out,
      space: {
        ...out.space,
        ...v.replace?.space,
        regions: { ...out.space.regions, ...v.replace?.space?.regions },
      },
      define: { ...out.define, ...v.add?.define },
      rules: { ...out.rules, ...v.add?.rules },
      clues: { ...out.clues, ...v.add?.clues },
      shape: [...(out.shape ?? []), ...(v.add?.shape ?? [])],
      techniques: [...(out.techniques ?? []), ...(v.add?.techniques ?? [])],
    };
  }
  return out;
}

/** The description as the compiled code reads it: every variation applied,
 * since one ladder runs on every board the game deals, and a name a board's
 * variations leave out is empty there. */
export function withEveryVariation(json: DescriptionJson): DescriptionJson {
  return withVariations(json, Object.keys(json.variations ?? {}));
}

/** A variation: blocks added to the description, or replacing its blocks of
 * the same name. */
export interface VariationJson {
  word: "board shape" | "modifier" | "ruleset" | "generator setting";
  add?: Pick<DescriptionJson, "define" | "rules" | "clues" | "shape" | "techniques">;
  replace?: { space?: Partial<DescriptionJson["space"]> };
}

/** A technique stated in the description, or one of a library's placed at a
 * tier of the game's (`use`: `"<library>.<id>"`). */
export type TechniqueJson =
  | ({ id: string } & Placing & StatedTechnique)
  | ({ use: string } & Placing);

/** Where a technique sits on the ladder. */
interface Placing {
  tier: string;
  from?: string;
  until?: string;
  rung?: string | string[];
}

/** What a technique says, wherever it is stated. */
export interface StatedTechnique {
  /** `"place"`: the engine runs it as each value is placed, with its first
   * binder bound to the placed cell, and not as a rung of the ladder. */
  on?: "place";
  for: string;
  premise?: string;
  conclude: string;
}

/** Techniques stated once, for every game that places them. */
export interface LibraryJson {
  library: string;
  techniques: Record<string, StatedTechnique>;
}

/** Whatever a `*.description.yaml` holds, once it has loaded. */
export type DescriptionFile = LibraryJson | DescriptionJson | HelpOnlyJson;

export function isLibrary(file: DescriptionFile): file is LibraryJson {
  return "library" in file;
}

/** A game's description that states its rules, not only its help page. */
export function isFormal(file: DescriptionFile): file is DescriptionJson {
  return "space" in file;
}

export interface Technique {
  id: string;
  /** Its tier, on its scale. */
  tier: number;
  /** The scale it grades on: one of the description's `scales`, or `null`
   * for its `tiers`. */
  scale: string | null;
  /** The least cap on its scale at which the ladder runs it, where that is
   * above its tier; `null` where it runs at every cap from its own. */
  from: number | null;
  /** The tier from which the ladder no longer runs it, at a cap that high;
   * `null` where it runs at every cap from its own. */
  until: number | null;
  /** The hint rungs a firing of it is recorded under. */
  rungs: string[];
  on: "place" | null;
  binders: Binder[];
  premise: Expr | null;
  conclude: Expr;
}

export interface Definition {
  params: string[];
  body: Expr;
}

export interface Description {
  json: DescriptionJson;
  defs: Map<string, Definition>;
  /** The shape and the rules, each by name. */
  rules: { name: string; expr: Expr }[];
  clueKinds: Map<string, { at: string; value: Expr; means: Expr }>;
  domain: Expr;
  techniques: Technique[];
  tiers: string[];
}

function parseBinders(src: string): Binder[] {
  const e = parse(`exists ${src}: true`);
  if (e.k !== "quant") throw new SyntaxError(`not binders: ${src}`);
  return e.binders;
}

/** What a technique's place on a game's ladder gives it. */
type Placed = "tier" | "scale" | "from" | "until" | "rungs";

/** A technique placed on no ladder: a library's, read alone. */
export const UNPLACED: Pick<Technique, Placed> = {
  tier: 0,
  scale: null,
  from: null,
  until: null,
  rungs: [],
};

/** A library's or a description's technique, parsed. */
export function parseTechnique(
  where: string,
  id: string,
  stated: StatedTechnique,
): Omit<Technique, Placed> {
  const at = (part: string, src: string): Expr => {
    try {
      return parse(src);
    } catch (e) {
      throw new SyntaxError(`${where} ${id} ${part}: ${(e as Error).message}`);
    }
  };
  let binders: Binder[];
  try {
    binders = parseBinders(stated.for);
  } catch (e) {
    throw new SyntaxError(`${where} ${id} for: ${(e as Error).message}`);
  }
  return {
    id,
    on: stated.on ?? null,
    binders,
    premise: stated.premise === undefined ? null : at("premise", stated.premise),
    conclude: at("conclude", stated.conclude),
  };
}

export function loadDescription(
  json: DescriptionJson,
  libraries: readonly LibraryJson[] = [],
): Description {
  const at = (where: string, src: string): Expr => {
    try {
      return parse(src);
    } catch (e) {
      throw new SyntaxError(`${json.game} ${where}: ${(e as Error).message}`);
    }
  };
  const defs = new Map<string, Definition>();
  for (const [head, body] of Object.entries(json.define ?? {})) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*)(?:\(([^)]*)\))?$/.exec(head);
    if (m === null)
      throw new SyntaxError(`${json.game}: bad definition head "${head}"`);
    const params = (m[2] ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    defs.set(m[1], { params, body: at(`define ${head}`, body) });
  }
  const rules: Description["rules"] = [];
  (json.shape ?? []).forEach((s, i) => {
    rules.push({ name: `shape ${i}`, expr: at(`shape ${i}`, s) });
  });
  for (const [name, s] of Object.entries(json.rules ?? {}))
    rules.push({ name, expr: at(`rule ${name}`, s) });
  const clueKinds: Description["clueKinds"] = new Map();
  for (const [kind, c] of Object.entries(json.clues ?? {}))
    clueKinds.set(kind, {
      at: c.at,
      value: at(`clue ${kind} value`, c.value),
      means: at(`clue ${kind}`, c.means),
    });
  const tiers = json.tiers ?? [];
  const scales = Object.entries(json.scales ?? {});
  const techniques = (json.techniques ?? []).map((t): Technique => {
    let parsed: Omit<Technique, Placed>;
    if ("use" in t) {
      const [lib, name] = t.use.split(".");
      const found = libraries.find((l) => l.library === lib)?.techniques[name];
      if (found === undefined)
        throw new SyntaxError(`${json.game}: no technique ${t.use}`);
      parsed = parseTechnique(json.game, t.use, found);
    } else {
      parsed = parseTechnique(json.game, t.id, t);
    }
    const [scale, onScale] = tiers.includes(t.tier)
      ? [null, tiers]
      : (scales.find(([, ts]) => ts.includes(t.tier)) ?? [null, null]);
    if (onScale === null)
      throw new SyntaxError(`${json.game} ${parsed.id}: no tier "${t.tier}"`);
    const tier = onScale.indexOf(t.tier);
    // A tier above the technique's own, on its scale.
    const above = (field: string, name?: string): number | null => {
      if (name === undefined) return null;
      const i = onScale.indexOf(name);
      if (i <= tier)
        throw new SyntaxError(
          `${json.game} ${parsed.id}: ${field} "${name}" is no tier above its own`,
        );
      return i;
    };
    const from = above("from", t.from);
    const until = above("until", t.until);
    if (from !== null && until !== null && until <= from)
      throw new SyntaxError(`${json.game} ${parsed.id}: until is not above from`);
    return {
      ...parsed,
      tier,
      scale,
      from,
      until,
      rungs: t.rung === undefined ? [] : typeof t.rung === "string" ? [t.rung] : t.rung,
    };
  });
  return {
    json,
    defs,
    rules,
    clueKinds,
    domain: at("answer domain", json.answer.value.domain),
    techniques,
    tiers,
  };
}
