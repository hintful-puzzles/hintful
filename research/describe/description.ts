/**
 * A description as its JSON states it (`description.schema.json`), loaded:
 * every formula parsed, so a description that loads has no syntax error left
 * in it, and instantiated on one dealt board.
 */

import {
  type Board,
  type Clue,
  type Ctx,
  type Definition,
  evaluate,
} from "./evaluate.ts";
import { type Binder, type Expr, parse } from "./expr.ts";
import {
  blocks,
  buildSpace,
  type Elem,
  type Space,
  type SpaceSpec,
  type Value,
} from "./space.ts";

/** The JSON, as the schema states it. */
export interface DescriptionJson {
  $schema?: string;
  game: string;
  name: string;
  family: string;
  note?: string;
  sizes: Record<string, { min: number; max: number }>;
  space: {
    grid: { w: string; h: string };
    slots?: boolean;
    edges?: boolean;
    diagonals?: boolean;
    regions?: Record<string, "dealt" | string>;
    units: string[];
  };
  answer: { value: { sort: "cell"; domain: string } };
  given?: string[];
  marks?: Record<string, { sort: string; notation: string; note?: string }>;
  define?: Record<string, string>;
  shape?: string[];
  rules?: Record<string, string>;
  clues?: Record<
    string,
    { at: string; value: string; means: string; complete?: boolean; note?: string }
  >;
  freedom: { kind: string; note?: string };
  deal?: Record<string, string>;
  tiers?: string[];
  techniques?: TechniqueJson[];
  variations?: Record<string, VariationJson>;
}

/** A variation as `language.md` § "Variations" states one: blocks added to
 * the description, or replacing its blocks of the same name. The word is the
 * investigation's claim, and nothing here computes it. */
export interface VariationJson {
  word: "board shape" | "modifier" | "ruleset" | "generator setting";
  note?: string;
  add?: Pick<DescriptionJson, "define" | "rules" | "clues" | "shape" | "techniques">;
  replace?: { space?: Partial<DescriptionJson["space"]> };
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

/** A technique stated in the description, or one of a library's placed at a
 * tier of the game's (`use`: `"<library>.<id>"`). */
export type TechniqueJson =
  | ({ id: string; tier: string; rung?: string | string[] } & StatedTechnique)
  | { use: string; tier: string; rung?: string | string[] };

/** What a technique says, wherever it is stated. */
export interface StatedTechnique {
  note?: string;
  for: string;
  premise?: string;
  conclude: string;
}

/** Techniques stated once, for every game that places them. */
export interface LibraryJson {
  library: string;
  note?: string;
  techniques: Record<string, StatedTechnique>;
}

export interface Technique {
  id: string;
  tier: number;
  /** The hint rungs a firing of it is recorded under. */
  rungs: string[];
  binders: Binder[];
  premise: Expr | null;
  conclude: Expr;
}

export interface Description {
  json: DescriptionJson;
  defs: Map<string, Definition>;
  /** The shape and the rules, each by name. */
  rules: { name: string; expr: Expr }[];
  clueKinds: Map<string, { means: Expr }>;
  domain: Expr;
  techniques: Technique[];
  tiers: string[];
}

function parseBinders(src: string): Binder[] {
  const e = parse(`exists ${src}: true`);
  if (e.k !== "quant") throw new SyntaxError(`not binders: ${src}`);
  return e.binders;
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
  const clueKinds = new Map<string, { means: Expr }>();
  for (const [kind, c] of Object.entries(json.clues ?? {}))
    clueKinds.set(kind, { means: at(`clue ${kind}`, c.means) });
  const tiers = json.tiers ?? [];
  const techniques = (json.techniques ?? []).map((t): Technique => {
    let id: string;
    let stated: StatedTechnique;
    if ("use" in t) {
      const [lib, name] = t.use.split(".");
      const found = libraries.find((l) => l.library === lib)?.techniques[name];
      if (found === undefined)
        throw new SyntaxError(`${json.game}: no technique ${t.use}`);
      id = t.use;
      stated = found;
    } else {
      id = t.id;
      stated = t;
    }
    const tier = tiers.indexOf(t.tier);
    if (tier < 0) throw new SyntaxError(`${json.game} ${id}: no tier "${t.tier}"`);
    let binders: Binder[];
    try {
      binders = parseBinders(stated.for);
    } catch (e) {
      throw new SyntaxError(`${json.game} ${id} for: ${(e as Error).message}`);
    }
    return {
      id,
      tier,
      rungs: t.rung === undefined ? [] : typeof t.rung === "string" ? [t.rung] : t.rung,
      binders,
      premise:
        stated.premise === undefined ? null : at(`${id} premise`, stated.premise),
      conclude: at(`${id} conclude`, stated.conclude),
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

/** What a game hands over for its board to be read by a description: the one
 * per-game piece (design.md § "What a game still writes"). */
export interface Dealt {
  /** The description's variations this board is dealt under. */
  variations?: string[];
  sizes: Record<string, number>;
  /** The partitions the description calls `dealt`, as cell indices. */
  regions?: Record<string, number[][]>;
  /** The dealt clues; `at` and `v` may name the space's elements. */
  clues(space: Space): Clue[];
  /** The givens, by cell index; 0 is none. */
  givens: ArrayLike<number>;
}

/** One description on one dealt board. */
export interface Instance {
  d: Description;
  space: Space;
  clues: Map<string, Elem[]>;
  clueOf: Map<Elem, Clue>;
  domain: number[];
  givens: ArrayLike<number>;
  ctx(board: Board, strict: boolean): Ctx;
}

const NO_BOARD: Board = { value: () => null, cand: () => [] };

export function instantiate(d: Description, dealt: Dealt): Instance {
  const sizeEnv = new Map<string, Value>(Object.entries(dealt.sizes));
  const bare: Ctx = {
    space: { names: new Map(sizeEnv), fns: new Map(), cells: [] },
    defs: d.defs,
    clues: new Map(),
    clueOf: new Map(),
    board: NO_BOARD,
    strict: false,
  };
  const num = (src: string): number => {
    const v = evaluate(parse(src), sizeEnv, bare);
    if (typeof v !== "number") throw new TypeError(`${src} is not a number`);
    return v;
  };
  const regions: Record<string, number[][]> = {};
  for (const [name, how] of Object.entries(d.json.space.regions ?? {})) {
    if (how === "dealt") {
      const r = dealt.regions?.[name];
      if (r === undefined) throw new Error(`${d.json.game}: no dealt ${name}`);
      regions[name] = r;
      continue;
    }
    const m = /^blocks\((\w+), *(\w+)\)$/.exec(how);
    if (m === null) throw new SyntaxError(`${d.json.game}: unknown partition ${how}`);
    regions[name] = blocks(num(m[1]), num(m[2]));
  }
  const spec: SpaceSpec = {
    grid: { w: num(d.json.space.grid.w), h: num(d.json.space.grid.h) },
    slots: d.json.space.slots,
    edges: d.json.space.edges,
    diagonals: d.json.space.diagonals,
    regions,
    units: d.json.space.units,
  };
  const space = buildSpace(spec);
  for (const [k, v] of sizeEnv) space.names.set(k, v);
  const clues = new Map<string, Elem[]>();
  const clueOf = new Map<Elem, Clue>();
  for (const kind of d.clueKinds.keys()) clues.set(kind, []);
  for (const c of dealt.clues(space)) {
    const list = clues.get(c.kind);
    if (list === undefined) throw new Error(`${d.json.game}: no clue kind ${c.kind}`);
    const e: Elem = {
      sort: `clue ${c.kind}`,
      id: list.length,
      label: `${c.kind} clue ${list.length}`,
    };
    list.push(e);
    clueOf.set(e, c);
  }
  const ctx = (board: Board, strict: boolean): Ctx => ({
    space,
    defs: d.defs,
    clues,
    clueOf,
    board,
    strict,
  });
  const dom = evaluate(d.domain, new Map(), ctx(NO_BOARD, false));
  if (!Array.isArray(dom) || !dom.every((x) => typeof x === "number"))
    throw new TypeError(`${d.json.game}: the domain is not a set of numbers`);
  space.names.set("domain", dom);
  return {
    d,
    space,
    clues,
    clueOf,
    domain: dom as number[],
    givens: dealt.givens,
    ctx,
  };
}
