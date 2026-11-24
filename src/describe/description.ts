/**
 * A description as its YAML states it, loaded: every formula parsed, so a
 * description that loads has no syntax error left in it. The compiler
 * (`compile.ts`) builds techniques from it, and the development tools under
 * `research/` read its rules too. Reading the file is `load.ts`'s.
 */

import type * as Schema from "../generated/describe/description.schema.ts";
import { type Binder, type Expr, parse } from "./expr.ts";

/** A game's file as `description.schema.json` states it, before `load.ts`
 * reads it: every description type below is named from it. */
type Game = Schema.Game;
/** `T` with the fields `K` stated. */
type Stated<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };

export type HelpJson = Schema.Help;

/** A game's description that is its help page and no formal rules yet. */
export type HelpOnlyJson = Stated<Pick<Game, "game" | "help">, "help">;

export type SizeRange = NonNullable<Game["sizes"]>[string];

/** The fields only a planning game's description states. */
type PlanningOnly = "position" | "moves" | "finish" | "lose" | "deadEnds" | "views";

/** A description with its formal rules, and the help page of a cataloged
 * game: its techniques as `load.ts` leaves them, each kind of rule expanded
 * and each `{broke}` said. */
export type DescriptionJson = Stated<
  Omit<Game, PlanningOnly | "techniques" | "variations" | "steps" | "settings">,
  "produces" | "sizes" | "answer" | "freedom"
> & {
  space: Stated<Schema.Space, "units">;
  settings?: Record<string, SettingJson>;
  techniques?: TechniqueJson[];
  steps?: Record<string, StatedStep>;
  variations?: Record<string, VariationJson>;
};

export type PlayJson = NonNullable<Game["play"]>;

/** Bounds on a board's two sides together: their sum, their product, the
 * shorter and the longer. */
export type SizeBoundsJson = Omit<NonNullable<PlayJson["bounds"]>, "tiers">;

/** Every key of any member of `U`. */
type KeyOfAny<U> = U extends unknown ? keyof U : never;

/** The union `U` with each member's absent fields readable, as `undefined`,
 * so a field several kinds share reads without first asking the kind. */
type Readable<U, All = U> = U extends unknown
  ? U & { [K in Exclude<KeyOfAny<All>, keyof U>]?: undefined }
  : never;

/** A setting the params give, of one `kind`, each a module of
 * `engine/fill/params/` that says what its fields mean. */
export type SettingJson = Readable<Schema.Setting>;

/** The board clue a `tally` setting gives, which the ID does not write, or
 * `null`. */
export const tallyKindOf = (json: DescriptionJson): string | null =>
  Object.entries(json.settings ?? {}).find(([, s]) => s.kind === "tally")?.[0] ?? null;

/** One choice of a setting. */
export type ChoiceJson = NonNullable<
  Extract<SettingJson, { choices?: unknown }>["choices"]
>[number];

type DealJson = NonNullable<Game["deal"]>;

/** How a description's deal samples an answer, or `null` where it does not. */
export function sampleOf(json: DescriptionJson): SampleJson | null {
  return json.deal?.sample ?? null;
}

/** The partitions the deal divides at random (`deal.divide`), one or a
 * list, in the order it divides them: none where it divides none. */
export function dividesOf(json: DescriptionJson): readonly DivideJson[] {
  const g = json.deal?.divide;
  return g === undefined ? [] : Array.isArray(g) ? g : [g];
}

export type DivideJson = Schema.Divide;

/** The kinds dealt one a part (`deal.oneKind`), or `null`. */
export function oneKindOf(json: DescriptionJson): OneKindJson | null {
  return json.deal?.oneKind ?? null;
}

export type OneKindJson = NonNullable<DealJson["oneKind"]>;

/** The partition the deal grows round its answer (`deal.grow`), or `null`
 * where it grows none. */
export function growOf(json: DescriptionJson): GrowJson | null {
  return json.deal?.grow ?? null;
}

export type GrowJson = NonNullable<DealJson["grow"]>;

export type SampleJson = NonNullable<DealJson["sample"]>;

export type GameWords = NonNullable<Game["words"]>;

export type StatedStep = Schema.Steps[string];

export type StepTermKind = NonNullable<StatedStep["terms"]>[string];

export type StepMarkRole = keyof NonNullable<StatedStep["marks"]>;

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
    for (const k of Object.keys(v.replace?.clues ?? {}))
      if (out.clues?.[k] === undefined)
        throw new Error(
          `${json.game}: ${name} replaces clue kind ${k}, which it lacks`,
        );
    for (const k of Object.keys(v.add?.clues ?? {}))
      if (out.clues?.[k] !== undefined)
        throw new Error(`${json.game}: ${name} adds clue kind ${k}, which it has`);
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
      clues: { ...out.clues, ...v.replace?.clues, ...v.add?.clues },
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

/** A variation as the file states it, a fill game's or a planning game's. */
type SchemaVariation = NonNullable<Game["variations"]>[string];

/** A variation: blocks added to the description, or replacing its blocks of
 * the same name; its techniques as `load.ts` leaves them. */
export type VariationJson = Omit<SchemaVariation, "add"> & {
  add?: Omit<NonNullable<SchemaVariation["add"]>, "techniques"> & {
    techniques?: TechniqueJson[];
  };
};

/**
 * What a variation is, read off what it does. One that only adds is a
 * modifier: an added rule, clue or unit can only remove answers, so a
 * technique sound without it stays sound with it. One that replaces is a
 * ruleset, whose techniques are checked on its boards and the plain game's.
 */
export const variationWord = (v: {
  readonly replace?: unknown;
}): "modifier" | "ruleset" => (v.replace === undefined ? "modifier" : "ruleset");

/** Where a technique sits on the ladder. */
type Placing = Pick<
  Extract<Schema.Technique, { use: string }>,
  "tier" | "from" | "until" | "rung"
>;

/** A technique stated in the description, or one of a library's placed at a
 * tier of the game's, as `load.ts` leaves them: a kind of rule's placement is
 * expanded to the technique it states. */
export type TechniqueJson =
  | ({ id: string } & Placing & StatedTechnique)
  | ({ use: string } & Placing);

type SchemaSays = NonNullable<Schema.Statement["says"]>;

/** What a technique says, wherever it is stated, as `load.ts` leaves it. */
export type StatedTechnique = Omit<Schema.Statement, "says"> & {
  says?: StatedSays;
  /** The defect planted in a technique a kind of rule expanded to
   * (`kinds.ts`), which a game's plants file then does not state. */
  plant?: { for?: string; conclude?: string };
  /** The kind of rule it was placed as (`kinds.ts`), where it was. */
  fromKind?: string;
};

/** A technique's `says`, with the terms `load.ts` adds for `{broke}`. */
export type StatedSays = Omit<SchemaSays, "terms" | "arms"> & {
  terms?: Record<string, SaidTermJson>;
  arms?: Record<
    string,
    Omit<NonNullable<SchemaSays["arms"]>[string], "terms"> & {
      terms?: Record<string, SaidTermJson>;
    }
  >;
};

/** The clauses a step's words are said in, each a relation of its own. */
type ClauseName =
  | "look"
  | "follows"
  | "move"
  | "effect"
  | "aim"
  | "answers"
  | "again"
  | "later";

/** A step's words as a description states them: clauses with slots, which
 * `engine/hint/stated.ts` renders (docs/hints.md § "Writing the narration"). */
export type StatedClauses = Pick<StatedStep, ClauseName>;

/** Clauses, and the wordings tried before them in order, the first whose
 * `when` holds giving the step its words; a part a wording does not state is
 * the clauses'. */
type Worded = StatedClauses & Pick<StatedStep, "long" | "wordings">;

export type SaidRole = keyof Schema.SaidMarks;

export type SuppliedKind = Extract<Schema.SaidTerm, { supplied: string }>["supplied"];

/** A term as a description states it, or a term of the break that held,
 * which the loader adds for `{broke}` (`term: null` for whether that break
 * held). */
type SaidTermJson = Schema.SaidTerm | { broke: string; term: string | null };

/** A term a firing says: its formula, where the game supplies it its kind,
 * or where it is a break's, the break and its term (`null`: whether it was
 * the break that held), read at the firing's witness. `expr` is `null` for
 * both of the last. */
export interface SaidTerm {
  name: string;
  expr: Expr | null;
  supplied: SuppliedKind | null;
  broke: { name: string; term: string | null } | null;
}

/** One set a firing marks: its role, and where the role holds several sorts,
 * the sort it is of (checked against the formula's when compiled). `expr` is
 * `null` where the game supplies the set. */
export interface SaidMark {
  role: SaidRole;
  sort: string | null;
  expr: Expr | null;
}

/** Techniques stated once, for every game that places them, as `load.ts`
 * leaves them. */
export type LibraryJson = Omit<Schema.Library, "techniques"> & {
  techniques: Record<string, StatedTechnique>;
};

export type LayerJson = Schema.Layer;

/** A layer's domain where it is not finite. */
export const OPEN_DOMAIN = "integers";

export type AssignJson = Schema.Assignments[number];

export type MoveJson = NonNullable<Game["moves"]>[string];

/** A planning game's description: a position, the moves that change it, the
 * finish, a lost position, and what proves a position can no longer finish. */
export type PlanningJson = Stated<
  Pick<
    Game,
    | "game"
    | "help"
    | "produces"
    | "sizes"
    | "space"
    | "given"
    | "define"
    | "freedom"
    | "deal"
    | "steps"
    | "variations"
    | PlanningOnly
  >,
  "produces" | "sizes" | "space" | "position" | "freedom" | "moves" | "finish"
>;

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

/** What a mark that narrows a number of the answer sits on. */
export type MarkSort = "edge" | "angle" | "cell";

/** The one mark a description keeps for its techniques to read that narrows
 * a number of the answer (its `of`), its name and what it sits on, or
 * `null`: on the edges, a tiling's angles, or the cells where the answer is
 * on the edges (Tracks' squares). A mark with no `of` is a play aid no
 * technique reads, or the candidates. */
export function edgeMarkOf(
  json: DescriptionJson,
): { name: string; of: string; sort: MarkSort } | null {
  const read = Object.entries(json.marks ?? {}).filter(
    ([, m]) =>
      (m.sort === "edge" || m.sort === "angle" || m.sort === "cell") &&
      m.of !== undefined &&
      !candidates(json, m),
  );
  if (read.length > 1)
    throw new Error(
      `${json.game}: one mark that narrows the answer, not ${read.length}`,
    );
  if (read.length === 0) return null;
  const [name, m] = read[0];
  if (m.sort === "angle" && json.space.tiling === undefined)
    throw new Error(`${name}: a mark on the angles is a tiling's`);
  if (m.sort === json.answer.value.sort)
    throw new Error(`${name}: a mark that narrows the answer sits off its elements`);
  return { name, of: m.of as string, sort: m.sort as MarkSort };
}

/** Whether a mark is the answer's own candidates: on its elements, its term
 * the value. */
function candidates(json: DescriptionJson, m: { sort: string; of?: string }): boolean {
  return m.sort === json.answer.value.sort && m.of?.replaceAll(" ", "") === "value(at)";
}

/**
 * Whether the player's marks narrow the answer's own elements, a set of the
 * values each may hold (Bridges' line, from the bridges drawn to its
 * limit): declared as a mark on the answer's sort whose `of` is
 * `value(at)`. The violation check then reads them where it reads a domain.
 */
export function narrowsAnswer(json: DescriptionJson): boolean {
  return Object.values(json.marks ?? {}).some((m) => candidates(json, m));
}

/** What a relation over the edges is written: each pair known alike or
 * opposite (Loopy's pairs). */
const RELATION_NOTATION = "alike or opposite";

/**
 * The one relation a description keeps over its edges for its techniques to
 * read, `name(e, f)` the relations still open between two (1 alike, 2
 * opposite), `related(e)` the edges related to one, and made by
 * `relate(e, f, d)`: its name, or `null`.
 */
export function relationMarkOf(json: DescriptionJson): string | null {
  const read = Object.entries(json.marks ?? {}).filter(
    ([, m]) => m.sort === "edge" && m.notation === RELATION_NOTATION,
  );
  if (read.length > 1)
    throw new Error(`${json.game}: one relation over the edges, not ${read.length}`);
  return read[0]?.[0] ?? null;
}

/**
 * The one mark a description keeps on the cells that names an element, read
 * `name(c)`, the element or `none`, and made by `mark(c, x)`: its name, the
 * clue kind whose clues it names (`notation: "one of clues(kind)"`), and what
 * a cell's naming `v` means of the answer, or `null`.
 */
export function cellMarkOf(
  json: DescriptionJson,
): { name: string; kind: string; means: string } | null {
  const read = Object.entries(json.marks ?? {}).filter(
    ([, m]) => m.sort === "cell" && m.means !== undefined,
  );
  if (read.length > 1)
    throw new Error(`${json.game}: one mark naming an element, not ${read.length}`);
  if (read.length === 0) return null;
  const [name, m] = read[0];
  const kind = /^one of clues\((\w+)\)$/.exec(m.notation)?.[1];
  if (kind === undefined)
    throw new Error(`${name}: a mark on the cells names one of clues(kind)`);
  return { name, kind, means: m.means as string };
}

/**
 * The player's candidate notes, where the description keeps them: a mark on
 * the answer's elements that is a set of its domain and says nothing of the
 * answer itself (no `of`, no `means`), read only by the player and the hint.
 * Its name, or `null`.
 */
export function noteMarkOf(json: DescriptionJson): string | null {
  const read = Object.entries(json.marks ?? {}).filter(
    ([, m]) =>
      m.sort === json.answer.value.sort &&
      m.of === undefined &&
      m.means === undefined &&
      m.notation.startsWith("set of "),
  );
  if (read.length > 1)
    throw new Error(`${json.game}: one mark of candidate notes, not ${read.length}`);
  if (read.length === 0) return null;
  const [name, m] = read[0];
  if (m.notation !== `set of ${json.answer.value.domain}`)
    throw new Error(
      `${name}: candidate notes are a set of the answer's domain, ${json.answer.value.domain}`,
    );
  return name;
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
  /** What a player calls it (`names`, by its id or else a rung's); `null`
   * where the description names it nothing. */
  name: string | null;
  on: "place" | "strike" | null;
  /** The kind of rule it was placed as (`kinds.ts`), `null` where it is
   * stated: the walk of a board's notes knows its own singles and cull by
   * it. */
  kind: string | null;
  binders: Binder[];
  premise: Expr | null;
  conclude: Expr;
  /** What a hint step for a firing speaks of: named terms, and the sets of
   * elements marked by role; `null` where it says nothing. */
  says: Says | null;
}

/** What a firing speaks of: the terms and marks a step has, and where the step
 * reads differently by condition, one variant an arm (`name`, `when`), in the
 * order the arms are tried. A technique without arms has one variant. */
export interface Says {
  /** Whether a step is made for each square the firing decides. */
  each: boolean;
  /** Whether the steps after the first are the same insight continued (the
   * squares' steps are then `each`'s). */
  legs: boolean;
  /** Whether a step is made for each value the firing strikes, on a board of
   * notes. */
  byValue: boolean;
  /** Whether a firing carries what held in its `where`s and `premise`. */
  witness: boolean;
  /** Whether a firing carries the elements its `where`s and `premise` read. */
  reads: boolean;
  /** What each fact has of its own, read in the conclusion's scope where it is
   * made; `null` where none does. */
  fact: {
    terms: { name: string; expr: Expr }[];
    marks: SaidMark[];
    /** The clauses a square's step says, by wording. */
    words: Wording[];
  } | null;
  variants: {
    name: string | null;
    when: Expr | null;
    terms: SaidTerm[];
    marks: SaidMark[];
    /** The step's stated words, by wording. */
    words: Wording[];
  }[];
}

/** A step's words one way. The first wording whose `when` holds is said; the
 * last one's is `null`, and the list is empty where nothing is stated. */
export interface Wording {
  when: Expr | null;
  clauses: StatedClauses;
  /** The `long` that covers it: where it is stated, and why the wording needs
   * the room; `null` where none does. */
  long: { at: string; why: string } | null;
  /** Where it is stated, for a message. */
  label: string;
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
  /** Whether a clue is a list of its values, in order (Pattern's run
   * lengths), read `clue(kind, x)` as the whole list. */
  list: boolean;
  /** Its values; `null` for a clue at the board, whose fields say theirs. */
  value: Expr | null;
  /** A clue at the board's fields, by name: the element sort each is one
   * of, `null` for one a clue, whether it is a list of its values, in order
   * (Crossing's digits of a number), and its values. Empty for any other. */
  fields: ReadonlyMap<string, { at: string | null; list: boolean; value: Expr }>;
  means: Expr;
  /** Whether every element carries one, so an absent clue is a fact: a deal
   * hides none, and an ID may leave one of its values unwritten. */
  complete: boolean;
}

/** Where a clue that sits at no element is: a whole-board clue, as a
 * guess's score is. */
const BOARD = "board";

export interface Description {
  json: DescriptionJson;
  defs: Map<string, Definition>;
  /** The terms of each break clause, by its name: its definition is in
   * `defs`, and a technique's witness reads these where it held. */
  breaks: Map<string, { params: string[]; terms: { name: string; expr: Expr }[] }>;
  /** The shape and the rules, each by name. */
  rules: { name: string; expr: Expr }[];
  clueKinds: Map<string, ClueKind>;
  /** What holds a value of the answer: a cell, or an edge between two. */
  answerSort: "cell" | "edge";
  domain: Expr;
  /** Whether a value may run past 31, so a cell's candidates are no mask. */
  wide: boolean;
  /** The cell a cell `c`'s value `d` names, which `to(c)` reads and
   * `chain(c)` follows; `null` where the answer names none. */
  to: Expr | null;
  /** The value of the domain that may appear more than once in a unit, and
   * how many times; `null` where each appears once. */
  repeat: { value: Expr; times: Expr } | null;
  techniques: Technique[];
  /** The kinds of step the game's planner emits. */
  steps: Step[];
  tiers: string[];
  rulesOut: { name: string; placing: number; techniques: string[] } | null;
}

/** A kind of step a planner emits, parsed. */
export interface Step {
  id: string;
  ring: string | string[];
  terms: { name: string; kind: StepTermKind }[];
  marks: { role: StepMarkRole; sort: string }[];
  /** The step's stated words, by wording. */
  words: Wording[];
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
type Placed = "tier" | "scale" | "from" | "until" | "rungs" | "name";

/** A technique placed on no ladder: a library's, read alone. */
export const UNPLACED: Pick<Technique, Placed> = {
  tier: 0,
  scale: null,
  from: null,
  until: null,
  rungs: [],
  name: null,
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
    kind: stated.fromKind ?? null,
    binders,
    premise: stated.premise === undefined ? null : at("premise", stated.premise),
    conclude: at("conclude", stated.conclude),
    says: stated.says === undefined ? null : parseSays(stated.says, at),
  };
}

/** The clauses a part of a `says` states; `null` where it states none. */
function clausesOf(part: StatedClauses): StatedClauses | null {
  const { aim, answers, look, follows, move, effect, again, later } = part;
  if (
    aim === undefined &&
    answers === undefined &&
    look === undefined &&
    follows === undefined &&
    move === undefined &&
    effect === undefined &&
    again === undefined &&
    later === undefined
  )
    return null;
  return {
    ...(aim === undefined ? {} : { aim }),
    ...(answers === undefined ? {} : { answers }),
    ...(look === undefined ? {} : { look }),
    ...(follows === undefined ? {} : { follows }),
    ...(move === undefined ? {} : { move }),
    ...(effect === undefined ? {} : { effect }),
    ...(again === undefined ? {} : { again }),
    ...(later === undefined ? {} : { later }),
  };
}

/** A part's wordings, each over the part's own clauses (over `base`), and
 * those clauses last where the last wording has a `when`; empty where nothing
 * is stated. */
function wordingsOf(
  part: Worded,
  label: string,
  at: (part: string, src: string) => Expr,
  base: StatedClauses | null = null,
  baseLong: Wording["long"] = null,
): Wording[] {
  const own = { ...base, ...clausesOf(part) };
  const partLong = part.long === undefined ? baseLong : { at: label, why: part.long };
  const list = part.wordings ?? [];
  const words: Wording[] = list.map((w, i) => {
    if (w.when === undefined && i < list.length - 1)
      throw new SyntaxError(
        `${label} wording ${i}: only the last wording may have no when`,
      );
    const here = `${label} wording ${i}`;
    return {
      when: w.when === undefined ? null : at(`${here} when`, w.when),
      clauses: { ...own, ...clausesOf(w) },
      long: w.long === undefined ? partLong : { at: here, why: w.long },
      label: here,
    };
  });
  const last = words.at(-1);
  if (last === undefined ? Object.keys(own).length > 0 : last.when !== null)
    words.push({ when: null, clauses: own, long: partLong, label });
  return words;
}

function parseSays(stated: StatedSays, at: (part: string, src: string) => Expr): Says {
  if (stated.arms !== undefined && stated.wordings !== undefined)
    throw new SyntaxError("says: wordings go on its arms where it has arms");
  const variant = (
    name: string | null,
    when: Expr | null,
    own: Pick<StatedSays, "terms" | "marks"> & Worded,
  ): Says["variants"][number] => {
    const { terms, marks } = own;
    const label = `says${name === null ? "" : ` ${name}`}`;
    return {
      name,
      when,
      terms: Object.entries({ ...stated.terms, ...terms }).map(
        ([n, src]): SaidTerm =>
          typeof src === "string"
            ? { name: n, expr: at(`${label} ${n}`, src), supplied: null, broke: null }
            : "broke" in src
              ? {
                  name: n,
                  expr: null,
                  supplied: null,
                  broke: { name: src.broke, term: src.term },
                }
              : { name: n, expr: null, supplied: src.supplied, broke: null },
      ),
      marks: (
        Object.entries({ ...stated.marks, ...marks }) as [
          SaidRole,
          string | Record<string, string>,
        ][]
      ).flatMap(([role, src]): SaidMark[] =>
        typeof src === "string"
          ? [{ role, sort: null, expr: at(`${label} ${role}`, src) }]
          : "supplied" in src
            ? [{ role, sort: null, expr: null }]
            : Object.entries(src).map(([sort, s]) => ({
                role,
                sort,
                expr: at(`${label} ${role} ${sort}`, s),
              })),
      ),
      words:
        name === null
          ? wordingsOf(stated, label, at)
          : wordingsOf(
              own,
              label,
              at,
              clausesOf(stated),
              stated.long === undefined ? null : { at: "says", why: stated.long },
            ),
    };
  };
  const witness = stated.witness === true;
  const reads = stated.reads === true;
  const legs = stated.shown === "legs";
  const each = legs || stated.shown === "each";
  const fact =
    stated.fact === undefined
      ? null
      : {
          terms: Object.entries(stated.fact.terms ?? {}).map(([n, src]) => ({
            name: n,
            expr: at(`says fact ${n}`, src),
          })),
          marks: (Object.entries(stated.fact.marks ?? {}) as [SaidRole, string][]).map(
            ([role, src]): SaidMark => ({
              role,
              sort: null,
              expr: at(`says fact ${role}`, src),
            }),
          ),
          words: wordingsOf(stated.fact, "says fact", at),
        };
  const byValue = stated.shown === "value";
  if (stated.arms === undefined)
    return {
      each,
      legs,
      byValue,
      witness,
      reads,
      fact,
      variants: [variant(null, null, {})],
    };
  return {
    each,
    legs,
    byValue,
    witness,
    reads,
    fact,
    variants: Object.entries(stated.arms).map(([name, arm]) =>
      variant(name, at(`says ${name} when`, arm.when), arm),
    ),
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
  const breaks: Description["breaks"] = new Map();
  for (const [head, b] of Object.entries(json.breaks ?? {})) {
    // The loader puts its definition in `define`, where every reader of the
    // file finds it (`load.ts`).
    const [[name, def]] = parseDefinitions(json.game, { [head]: b.when });
    if (!defs.has(name)) defs.set(name, def);
    breaks.set(name, {
      params: def.params,
      terms: Object.entries(b.terms ?? {}).map(([n, src]) => ({
        name: n,
        expr: at(`break ${name} ${n}`, src),
      })),
    });
  }
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
    if (c.list === true && (c.at === BOARD || c.per !== undefined))
      throw new SyntaxError(
        `${json.game} clue ${kind}: a list sits at an element, once`,
      );
    clueKinds.set(kind, {
      at: c.at,
      per: c.per === "value",
      list: c.list === true,
      value: c.value === undefined ? null : at(`clue ${kind} value`, c.value),
      fields: new Map(
        fields.map(([name, f]) => {
          if (f.list === true && f.at !== undefined)
            throw new SyntaxError(
              `${json.game} clue ${kind} ${name}: a list is one a clue, at no element`,
            );
          // `Dealt` holds the clues' count beside their fields, as `n`.
          if (name === "n")
            throw new SyntaxError(
              `${json.game} clue ${kind} n: a field may not be named n, the count of the clues`,
            );
          return [
            name,
            {
              at: f.at ?? null,
              list: f.list === true,
              value: at(`clue ${kind} ${name}`, f.value),
            },
          ];
        }),
      ),
      means: at(`clue ${kind}`, c.means),
      complete: c.complete === true,
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
    const rungs =
      t.rung === undefined ? [] : typeof t.rung === "string" ? [t.rung] : t.rung;
    const names = json.names ?? {};
    const key = [parsed.id, ...rungs].find((k) => Object.hasOwn(names, k));
    const name = key === undefined ? null : names[key];
    return { ...parsed, tier, scale, from, until, rungs, name };
  });
  return {
    json,
    defs,
    breaks,
    rules,
    clueKinds,
    answerSort: json.answer.value.sort,
    domain: at("answer domain", json.answer.value.domain),
    wide: json.answer.value.wide === true,
    to:
      json.answer.value.to === undefined ? null : at("answer to", json.answer.value.to),
    repeat:
      json.answer.value.repeat === undefined
        ? null
        : {
            value: at("answer repeat value", json.answer.value.repeat.value),
            times: at("answer repeat times", json.answer.value.repeat.times),
          },
    techniques,
    steps: stepsOf(json.steps ?? {}, at),
    tiers,
    rulesOut: rulesOutOf(json, techniques),
  };
}

/** The description's `rulesOut`, its techniques checked to be the game's. */
function rulesOutOf(
  json: DescriptionJson,
  techniques: readonly Technique[],
): { name: string; placing: number; techniques: string[] } | null {
  const r = json.rulesOut;
  if (r === undefined) return null;
  for (const named of r.techniques) {
    const [id, arm] = named.split(".");
    const t = techniques.find((x) => x.id === id);
    if (t === undefined)
      throw new SyntaxError(`${json.game} rulesOut: no technique ${id}`);
    if (t.says === null)
      throw new SyntaxError(
        `${json.game} rulesOut: ${id} says nothing, so a move's evidence is not known`,
      );
    if (arm !== undefined && !t.says.variants.some((v) => v.name === arm))
      throw new SyntaxError(`${json.game} rulesOut: ${id} has no arm ${arm}`);
  }
  return r;
}

/** A game's kinds of planner step, parsed. */
export function stepsOf(
  steps: Record<string, StatedStep>,
  at: (part: string, src: string) => Expr,
): Step[] {
  return Object.entries(steps).map(([id, s]): Step => {
    const label = `step ${id}`;
    return {
      id,
      ring: s.ring,
      terms: Object.entries(s.terms ?? {}).map(([name, kind]) => ({ name, kind })),
      marks: (Object.entries(s.marks ?? {}) as [StepMarkRole, string[]][]).flatMap(
        ([role, sorts]) => sorts.map((sort) => ({ role, sort })),
      ),
      words: wordingsOf(s, label, at),
    };
  });
}
