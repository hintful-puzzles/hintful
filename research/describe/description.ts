/**
 * A description instantiated on one dealt board, for the interpreter to read.
 * Loading a description is `src/describe/description.ts`'s, which the
 * compiler shares.
 */

import { readFileSync } from "node:fs";
import {
  type Description,
  type DescriptionJson,
  isFormal,
  isLibrary,
  type LibraryJson,
} from "../../src/describe/description.ts";
import { parse } from "../../src/describe/expr.ts";
import { loadDescriptionFile } from "../../src/describe/load.ts";
import { type Board, type Clue, type Ctx, evaluate } from "./evaluate.ts";
import {
  blocks,
  buildSpace,
  type Elem,
  type Space,
  type SpaceSpec,
  type Value,
} from "./space.ts";

const ROOT = new URL("../../", import.meta.url).pathname;

function load(path: string) {
  return loadDescriptionFile(readFileSync(ROOT + path, "utf8"), path);
}

/** The rules of the description at `path`, from the repository's root. */
export function describedGame(path: string): DescriptionJson {
  const file = load(path);
  if (!isFormal(file)) throw new Error(`${path} states no rules`);
  return file;
}

/** The library at `path`, from the repository's root. */
export function describedLibrary(path: string): LibraryJson {
  const file = load(path);
  if (!isLibrary(file)) throw new Error(`${path} is not a library`);
  return file;
}

/** The description with the named variations applied, in order. Only the
 * interpreter reads a variation: no compiled game has one yet. */
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
