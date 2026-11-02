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
    /** The board as a rectangle, or, in its place, a count of cells with no
     * geometry, whose neighbors are a relation the board deals. */
    grid?: { w: string; h: string };
    cells?: string;
    /** Relations the board deals, each a set of cells for each cell. */
    relations?: Record<string, "dealt">;
    slots?: boolean;
    edges?: boolean;
    corners?: boolean;
    diagonals?: boolean;
    regions?: Record<string, "dealt" | string>;
    units: string[];
  };
  answer: {
    value: {
      sort: "cell";
      domain: string;
      repeat?: { value: string; times: string };
    };
  };
  given?: string[];
  marks?: Record<string, { sort: string; notation: string }>;
  define?: Record<string, string>;
  shape?: string[];
  rules?: Record<string, string>;
  clues?: Record<
    string,
    {
      at: string;
      per?: "value";
      value?: string;
      fields?: Record<string, { at?: string; value: string }>;
      means: string;
      complete?: boolean;
    }
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
    const added = v.add?.space;
    for (const r of Object.keys(added?.regions ?? {}))
      if (out.space.regions?.[r] !== undefined)
        throw new Error(`${json.game}: ${name} adds region ${r}, which it has`);
    for (const r of Object.keys(v.replace?.space?.regions ?? {}))
      if (out.space.regions?.[r] === undefined)
        throw new Error(`${json.game}: ${name} replaces region ${r}, which it lacks`);
    out = {
      ...out,
      space: {
        ...out.space,
        ...v.replace?.space,
        ...(added?.diagonals ? { diagonals: true } : {}),
        regions: {
          ...out.space.regions,
          ...v.replace?.space?.regions,
          ...added?.regions,
        },
        units: [
          ...(v.replace?.space?.units ?? out.space.units),
          ...(added?.units ?? []),
        ],
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
  add?: Pick<DescriptionJson, "define" | "rules" | "clues" | "shape" | "techniques"> & {
    space?: {
      diagonals?: true;
      regions?: Record<string, "dealt" | string>;
      units?: string[];
    };
  };
  replace?: { space?: Partial<DescriptionJson["space"]> };
}

/**
 * What a variation is, read off what it does. One that only adds is a
 * modifier: an added rule, clue or unit can only remove answers, so a
 * technique sound without it stays sound with it. One that replaces is a
 * ruleset, whose techniques are checked on its boards and the plain game's.
 */
export const variationWord = (v: {
  readonly replace?: unknown;
}): "modifier" | "ruleset" => (v.replace === undefined ? "modifier" : "ruleset");

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
   * binder bound to the placed cell, and not as a rung of the ladder;
   * `"strike"`, as a fact strikes a value from the cell. */
  on?: "place" | "strike";
  for: string;
  premise?: string;
  conclude: string;
}

/** Techniques stated once, for every game that places them. */
export interface LibraryJson {
  library: string;
  techniques: Record<string, StatedTechnique>;
}

/** One layer of a planning game's position: a value a cell. */
export interface LayerJson {
  /** `integers` where it is not finite. */
  domain: string;
  /** Where the domain is `integers`, the values the checker searches. */
  checked?: string;
  /** The layer is an arrangement: each value of its domain on this many
   * cells. */
  arranged?: string;
  /** Exactly one cell holds this value, every other another of the domain. */
  once?: string;
  /** Where this formula of the cell `c` is false, the layer holds 0. */
  on?: string;
  /** A value a move copies and no rule reads. */
  carried?: true;
  /** The layer holds a value a face, or one for the whole board, not a value
   * a cell. */
  over?: "faces" | "board";
}

/** A layer's domain where it is not finite. */
export const OPEN_DOMAIN = "integers";

/** A table the board deals: a function of its arguments' sorts to an
 * element. */
export interface TableJson {
  of: ("cell" | "face" | "num")[];
  to: "cell" | "face";
}

/** Cells a move assigns: its binders, the last of them the cell, and a term
 * for each layer it assigns, read on the position before the move. With no
 * binders, it assigns layers over the board. */
export type AssignJson = { for?: string } & Record<string, string>;

/** A move of a planning game: its arguments, its guard, and what it sets. */
export interface MoveJson {
  for: string;
  when?: string;
  set: AssignJson[];
}

/** A planning game's variation: what it adds, and the layers it replaces. */
export interface PlanningVariationJson {
  add?: {
    /** Layers of new names, each all zeros on a board without the
     * variation. */
    position?: Record<string, LayerJson>;
    define?: Record<string, string>;
    finish?: string[];
    deadEnds?: Record<string, string>;
    /** Assignments added to a move of the description's, by its name. */
    moves?: Record<string, { set: AssignJson[] }>;
  };
  replace?: { position?: Record<string, LayerJson> };
}

/**
 * A planning game's description: a position, the moves that change it, the
 * finish, a lost position, and what proves a position can no longer finish,
 * as `description.schema.json` states it.
 */
export interface PlanningJson {
  game: string;
  help?: HelpJson;
  name: string;
  family: string;
  sizes: Record<string, { min: number; max: number }>;
  space: {
    /** The board as a rectangle, or, in its place, a count of cells with no
     * geometry. */
    grid?: { w: string; h: string };
    cells?: string;
    units: string[];
    /** Relations the board deals, each a set of cells for each cell. */
    relations?: Record<string, "dealt">;
    /** A size the board deals: how many faces, a second sort of element. */
    faces?: string;
    tables?: Record<string, TableJson>;
  };
  position: Record<string, LayerJson>;
  given?: string[];
  define?: Record<string, string>;
  /** Definitions the game reads beside the rules, each of cells, its last
   * parameter the cell: compiled to the cells it holds of. */
  views?: string[];
  freedom: { kind: "permute" | "transition" };
  moves: Record<string, MoveJson>;
  finish: string[];
  lose?: string[];
  /** Each claim by id: a formula true only of a position from which no line
   * of moves finishes. */
  deadEnds?: Record<string, string>;
  deal?: Record<string, string>;
  variations?: Record<string, PlanningVariationJson>;
}

/** A planning description with the named variations applied, in order: an
 * added finish, claim or assignment marked with the variation it needs. */
export interface PlanningApplied {
  json: PlanningJson;
  finish: { src: string; on: string | null }[];
  deadEnds: { id: string; src: string; on: string | null }[];
  moves: {
    name: string;
    for: string;
    when: string | null;
    set: { assign: AssignJson; on: string | null }[];
  }[];
}

/** The planning description with `names` applied, each variation's
 * additions kept apart, so the compiled rules run them only where it is on. */
export function planningWith(
  json: PlanningJson,
  names: readonly string[],
): PlanningApplied {
  const out: PlanningApplied = {
    json,
    finish: json.finish.map((src) => ({ src, on: null })),
    deadEnds: Object.entries(json.deadEnds ?? {}).map(([id, src]) => ({
      id,
      src,
      on: null,
    })),
    moves: Object.entries(json.moves).map(([name, m]) => ({
      name,
      for: m.for,
      when: m.when ?? null,
      set: m.set.map((assign) => ({ assign, on: null })),
    })),
  };
  let position = json.position;
  let define = json.define ?? {};
  for (const name of names) {
    const v = json.variations?.[name];
    if (v === undefined) throw new Error(`${json.game}: no variation ${name}`);
    for (const layer of Object.keys(v.replace?.position ?? {}))
      if (json.position[layer] === undefined)
        throw new Error(
          `${json.game}: ${name} replaces layer ${layer}, which it lacks`,
        );
    for (const layer of Object.keys(v.add?.position ?? {}))
      if (position[layer] !== undefined)
        throw new Error(`${json.game}: ${name} adds layer ${layer}, which it has`);
    position = { ...position, ...v.replace?.position, ...v.add?.position };
    define = { ...define, ...v.add?.define };
    out.finish.push(...(v.add?.finish ?? []).map((src) => ({ src, on: name })));
    for (const [id, src] of Object.entries(v.add?.deadEnds ?? {})) {
      if (out.deadEnds.some((c) => c.id === id))
        throw new Error(`${json.game}: ${name} adds claim ${id}, which it has`);
      out.deadEnds.push({ id, src, on: name });
    }
    for (const [move, added] of Object.entries(v.add?.moves ?? {})) {
      const m = out.moves.find((x) => x.name === move);
      if (m === undefined)
        throw new Error(`${json.game}: ${name} adds to no move ${move}`);
      m.set.push(...added.set.map((assign) => ({ assign, on: name })));
    }
  }
  out.json = { ...json, position, define };
  return out;
}

/** Whatever a `*.description.yaml` holds, once it has loaded. */
export type DescriptionFile =
  | LibraryJson
  | DescriptionJson
  | PlanningJson
  | HelpOnlyJson;

export function isLibrary(file: DescriptionFile): file is LibraryJson {
  return "library" in file;
}

/** A game's description that states its rules as an answer, not only its
 * help page. */
export function isFormal(file: DescriptionFile): file is DescriptionJson {
  return "space" in file && !("position" in file);
}

/** A planning game's description: a position and its moves. */
export function isPlanning(file: DescriptionFile): file is PlanningJson {
  return "position" in file;
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
  on: "place" | "strike" | null;
  binders: Binder[];
  premise: Expr | null;
  conclude: Expr;
}

export interface Definition {
  params: string[];
  body: Expr;
}

/** A clue kind, parsed. A clue at the board sits at no element and has
 * fields in place of one value, each read as a function of the clue
 * (`black(k)`), and of a cell where the field is one a cell (`peg(k, s)`). */
export interface ClueKind {
  at: string;
  /** Whether a clue sits at its element once for each value of the answer's
   * domain (ABCD's count of each letter a line holds), read
   * `clue(kind, x, d)`, its meaning reading the value as `per`. */
  per: boolean;
  /** Its values; `null` for a clue at the board, whose fields say theirs. */
  value: Expr | null;
  /** A clue at the board's fields, by name: the element sort each is one
   * of, `null` for one a clue, and its values. Empty for any other. */
  fields: ReadonlyMap<string, { at: string | null; value: Expr }>;
  means: Expr;
}

/** Where a clue that sits at no element is: a whole-board clue, as a
 * guess's score is. */
const BOARD = "board";

export interface Description {
  json: DescriptionJson;
  defs: Map<string, Definition>;
  /** The shape and the rules, each by name. */
  rules: { name: string; expr: Expr }[];
  clueKinds: Map<string, ClueKind>;
  domain: Expr;
  /** The value of the domain that may appear more than once in a unit, and
   * how many times; `null` where each appears once. */
  repeat: { value: Expr; times: Expr } | null;
  techniques: Technique[];
  tiers: string[];
}

export function parseBinders(src: string): Binder[] {
  const e = parse(`exists ${src}: true`);
  if (e.k !== "quant") throw new SyntaxError(`not binders: ${src}`);
  return e.binders;
}

/** A description's `define` block, each definition by its name. */
export function parseDefinitions(
  game: string,
  define: Readonly<Record<string, string>>,
): Map<string, Definition> {
  const defs = new Map<string, Definition>();
  for (const [head, body] of Object.entries(define)) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*)(?:\(([^)]*)\))?$/.exec(head);
    if (m === null) throw new SyntaxError(`${game}: bad definition head "${head}"`);
    const params = (m[2] ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    let parsed: Expr;
    try {
      parsed = parse(body);
    } catch (e) {
      throw new SyntaxError(`${game} define ${head}: ${(e as Error).message}`);
    }
    defs.set(m[1], { params, body: parsed });
  }
  return defs;
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
  const defs = parseDefinitions(json.game, json.define ?? {});
  const rules: Description["rules"] = [];
  (json.shape ?? []).forEach((s, i) => {
    rules.push({ name: `shape ${i}`, expr: at(`shape ${i}`, s) });
  });
  for (const [name, s] of Object.entries(json.rules ?? {}))
    rules.push({ name, expr: at(`rule ${name}`, s) });
  const clueKinds: Description["clueKinds"] = new Map();
  for (const [kind, c] of Object.entries(json.clues ?? {})) {
    const fields = Object.entries(c.fields ?? {});
    if (
      (c.at === BOARD) !== fields.length > 0 ||
      (c.at === BOARD) !== (c.value === undefined)
    )
      throw new SyntaxError(
        `${json.game} clue ${kind}: a clue at the board has fields, and any other a value`,
      );
    if (c.per !== undefined && c.at === BOARD)
      throw new SyntaxError(
        `${json.game} clue ${kind}: a clue at the board is per nothing`,
      );
    clueKinds.set(kind, {
      at: c.at,
      per: c.per === "value",
      value: c.value === undefined ? null : at(`clue ${kind} value`, c.value),
      fields: new Map(
        fields.map(([name, f]) => [
          name,
          { at: f.at ?? null, value: at(`clue ${kind} ${name}`, f.value) },
        ]),
      ),
      means: at(`clue ${kind}`, c.means),
    });
  }
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
    repeat:
      json.answer.value.repeat === undefined
        ? null
        : {
            value: at("answer repeat value", json.answer.value.repeat.value),
            times: at("answer repeat times", json.answer.value.repeat.times),
          },
    techniques,
    tiers,
  };
}
