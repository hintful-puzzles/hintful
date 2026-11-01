/**
 * A planning game's dead-end claims checked sound by search
 * (`docs/descriptions.md` § "Checking a dead-end claim sound"): on every
 * small board, every position the layers allow, every move played from each,
 * and the positions that can finish found by walking the moves backward from
 * the finished ones. A claim is sound where it holds of none of those.
 *
 * It runs the module `npm run describe` compiles from the description (here
 * compiled afresh, so a planted claim runs the same way), which is what the
 * app runs.
 */

import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { compilePlanning } from "../../src/describe/compile-position.ts";
import {
  OPEN_DOMAIN,
  type PlanningJson,
  planningWith,
} from "../../src/describe/description.ts";
import { type Expr, parse } from "../../src/describe/expr.ts";
import { CHECKED_POSITIONS } from "../../src/describe/soundness.ts";
import { describedSpace, type GridSpace } from "../../src/engine/describe-runtime.ts";
import type { Layers, PositionRules } from "../../src/engine/position-runtime.ts";
import { type Ctx, evaluate } from "../describe/evaluate.ts";
import type { Value } from "../describe/space.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** What a compiled planning module exports that the checker reads. */
interface Module {
  layers: readonly string[];
  deadEnds: readonly string[];
  rules(
    sp: GridSpace,
    cl: object,
    variations: readonly string[],
  ): PositionRules<Layers, unknown>;
  claims(
    sp: GridSpace,
    cl: object,
    variations: readonly string[],
  ): Readonly<Record<string, (p: Layers) => boolean>>;
}

let scratch: string | null = null;

/** The description compiled and imported, from a module of its own. */
export async function compiled(d: PlanningJson, label: string): Promise<Module> {
  scratch ??= mkdtempSync(join(tmpdir(), "dead-end-check-"));
  const path = join(scratch, `${d.game}-${label}.ts`);
  writeFileSync(
    path,
    compilePlanning(
      d,
      label,
      `${ROOT}src/engine/describe-runtime.ts`,
      `${ROOT}src/engine/position-runtime.ts`,
    ),
  );
  return (await import(path)) as Module;
}

/**
 * A board a game deals, for a description that reads what no size gives (a
 * relation, a table): its grid, what it deals, and its sizes by name. A game
 * whose description deals one lists the small boards it makes in
 * `research/technique-check/boards/<game>.ts`, as `boards()`, built by the
 * game's own dealing code, so a claim is checked on boards the game makes.
 */
export interface DealtBoard {
  w: number;
  h: number;
  dealt: Record<string, unknown>;
  sizes: Record<string, number>;
}

/** One board: its sizes, the variations it has on, and what it deals where
 * the game deals it. */
export interface World {
  sizes: Record<string, number>;
  variations: string[];
  board: DealtBoard | null;
}

export const worldName = (w: World): string =>
  [
    Object.entries(w.sizes)
      .map(([k, v]) => `${k}=${v}`)
      .join(" "),
    ...w.variations,
  ].join(", ");

function term(src: string, sizes: Record<string, number>): Value {
  const env = new Map<string, Value>(Object.entries(sizes));
  const bare: Ctx = {
    space: { names: new Map(env), fns: new Map(), cells: [] },
    defs: new Map(),
    clues: new Map(),
    clueOf: new Map(),
    board: { value: () => null, cand: () => [] },
    strict: false,
  };
  return evaluate(parse(src), env, bare);
}

function num(src: string, sizes: Record<string, number>): number {
  const v = term(src, sizes);
  if (typeof v !== "number") throw new TypeError(`${src} is not a number`);
  return v;
}

/** A layer as a world reads it: its values in order, how many cells each is
 * on where it is an arrangement, and where a value may stand. */
interface Layer {
  name: string;
  values: number[];
  arranged: number | null;
  /** The value exactly one cell holds, where the layer is a token. */
  once: number | null;
  /** Where a value other than 0 may stand, a formula of the cell `c`. */
  on: Expr | null;
  /** How many places the layer holds a value at: the cells, the faces, or
   * the board's one. */
  length: number;
  /** Whether it holds a value a cell, and so is read at a cell by `on`. */
  byCell: boolean;
  /** Whether its domain is not finite, and `values` the window searched. */
  open: boolean;
}

/**
 * A formula of one cell's values, layer by layer: what `on` may say. Anything
 * else is refused, so that whether a value may stand on a cell depends on
 * that cell alone and the universe is a product of each cell's states.
 */
function atCell(e: Expr, at: (layer: string) => number): number | boolean {
  const n = (x: Expr): number => {
    const v = atCell(x, at);
    if (typeof v !== "number") throw new TypeError("on: a number expected");
    return v;
  };
  const b = (x: Expr): boolean => {
    const v = atCell(x, at);
    if (typeof v !== "boolean") throw new TypeError("on: a truth expected");
    return v;
  };
  switch (e.k) {
    case "num":
      return e.v;
    case "not":
      return !b(e.of);
    case "neg":
      return -n(e.of);
    case "call":
      if (e.args.length !== 1 || e.args[0].k !== "name" || e.args[0].name !== "c")
        throw new TypeError(`on: ${e.fn} is read at c alone`);
      return at(e.fn);
    case "bin":
      switch (e.op) {
        case "and":
          return b(e.a) && b(e.b);
        case "or":
          return b(e.a) || b(e.b);
        case "=":
          return n(e.a) === n(e.b);
        case "!=":
          return n(e.a) !== n(e.b);
        case "<":
          return n(e.a) < n(e.b);
        case "<=":
          return n(e.a) <= n(e.b);
        case ">":
          return n(e.a) > n(e.b);
        case ">=":
          return n(e.a) >= n(e.b);
        case "+":
          return n(e.a) + n(e.b);
        case "-":
          return n(e.a) - n(e.b);
      }
  }
  throw new TypeError(`on: ${e.k} reads more than a cell's values`);
}

/**
 * Each cell's states over the layers that hold a value a cell, not a token
 * and not an arrangement, as one value of each: those every `on` admits. The
 * other layers are left at 0 while an `on` is read, and an `on` that reads
 * one of them is refused.
 */
function cellStates(layers: readonly Layer[]): number[][] {
  const free = layers.filter((l) => l.byCell && l.once === null && l.arranged === null);
  const out: number[][] = [];
  const pick = new Array<number>(free.length).fill(0);
  const go = (i: number): void => {
    if (i === free.length) {
      const at = (name: string): number => {
        const k = free.findIndex((l) => l.name === name);
        if (k < 0) throw new TypeError(`on: ${name} is not a layer an on may read`);
        return pick[k];
      };
      if (
        free.every(
          (l, k) => l.on === null || pick[k] === 0 || atCell(l.on, at) === true,
        )
      )
        out.push(pick.slice());
      return;
    }
    for (const v of free[i].values) {
      pick[i] = v;
      go(i + 1);
    }
  };
  go(0);
  return out;
}

/** Whether token `l` may stand on a cell in state `state` of the free
 * layers. */
function tokenAdmits(
  l: Layer,
  free: readonly Layer[],
  state: readonly number[],
): boolean {
  if (l.on === null) return true;
  return (
    atCell(l.on, (name) => {
      const k = free.findIndex((f) => f.name === name);
      if (k < 0) throw new TypeError(`on: ${name} is not a layer an on may read`);
      return state[k];
    }) === true
  );
}

/** How many positions a world's layers allow, over `cells` cells: exact but
 * for two tokens with an `on` each, where it is a bound above. */
function universeSize(layers: readonly Layer[], cells: number): number {
  const free = layers.filter((l) => l.byCell && l.once === null && l.arranged === null);
  const states = cellStates(layers);
  let n = states.length ** cells;
  for (const l of layers) {
    if (l.once !== null) {
      const admits = states.filter((s) => tokenAdmits(l, free, s)).length;
      n *= (cells * admits * (l.values.length - 1) ** (cells - 1)) / states.length;
    } else if (!l.byCell) n *= l.values.length ** l.length;
    else if (l.arranged !== null) {
      if (l.values.length * l.arranged !== cells) return 0;
      let ways = 1;
      for (let i = 2; i <= cells; i++) ways *= i;
      for (let i = 2; i <= l.arranged; i++) ways /= i ** l.values.length;
      n *= Math.round(ways);
    }
    if (n > CHECKED_POSITIONS) return n;
  }
  return Math.round(n);
}

/** The small boards a game deals, for a description that reads what it
 * deals. */
async function dealtBoards(d: PlanningJson): Promise<DealtBoard[]> {
  const path = fileURLToPath(new URL(`boards/${d.game}.ts`, import.meta.url));
  if (!existsSync(path))
    throw new Error(
      `${d.game}: its description reads what the board deals, so boards/${d.game}.ts lists the boards to check`,
    );
  const mod = (await import(path)) as { boards(): DealtBoard[] };
  return mod.boards();
}

/** Each world of small sizes whose positions are few enough to search
 * whole, under each set of the description's variations. */
export async function worlds(
  d: PlanningJson,
): Promise<{ world: World; layers: Layer[]; size: number }[]> {
  const deals =
    Object.keys(d.space.relations ?? {}).length +
      Object.keys(d.space.tables ?? {}).length >
    0;
  const boards: { sizes: Record<string, number>; board: DealtBoard | null }[] = deals
    ? (await dealtBoards(d)).map((b) => ({ sizes: b.sizes, board: b }))
    : [];
  if (!deals) {
    const combos: Record<string, number>[] = [{}];
    for (const n of Object.keys(d.sizes)) {
      const { min, max } = d.sizes[n];
      const next: Record<string, number>[] = [];
      for (const c of combos)
        for (let v = min; v <= Math.min(max, min + 3); v++) next.push({ ...c, [n]: v });
      combos.splice(0, combos.length, ...next);
    }
    boards.push(...combos.map((sizes) => ({ sizes, board: null })));
  }
  const varNames = Object.keys(d.variations ?? {});
  const subsets: string[][] = [[]];
  for (const v of varNames) for (const s of [...subsets]) subsets.push([...s, v]);
  const out: { world: World; layers: Layer[]; size: number }[] = [];
  for (const { sizes, board } of boards)
    for (const variations of subsets) {
      const cells =
        board === null ? gridOf(d, sizes).w * gridOf(d, sizes).h : board.w * board.h;
      const faces = d.space.faces === undefined ? 0 : num(d.space.faces, sizes);
      const position = planningWith(d, variations).json.position;
      const layers = Object.entries(position)
        .filter(([, l]) => l.carried !== true)
        .map(([name, l]) => {
          const open = l.domain.trim() === OPEN_DOMAIN;
          if (open && l.checked === undefined)
            throw new Error(
              `${d.game}: ${name}'s domain is not finite and names no window, so its claims are beyond the checker`,
            );
          const values = term(open ? (l.checked as string) : l.domain, sizes);
          if (!Array.isArray(values)) throw new TypeError(`${name}: no domain`);
          const byCell = l.over === undefined;
          return {
            name,
            values: (values as number[]).slice().sort((a, b) => a - b),
            arranged: l.arranged === undefined ? null : num(l.arranged, sizes),
            once: l.once === undefined ? null : num(l.once, sizes),
            on: l.on === undefined ? null : parse(l.on),
            length: l.over === "board" ? 1 : byCell ? cells : faces,
            byCell,
            open,
          };
        });
      for (const l of layers)
        if (l.on !== null && (!l.byCell || l.arranged !== null))
          throw new Error(`${d.game}: ${l.name}'s on is read of a cell layer alone`);
      const size = universeSize(layers, cells);
      if (size > 0 && size <= CHECKED_POSITIONS)
        out.push({ world: { sizes, variations, board }, layers, size });
    }
  return out;
}

/** A board's width and height, from its sizes. */
function gridOf(
  d: PlanningJson,
  sizes: Record<string, number>,
): { w: number; h: number } {
  if (d.space.grid === undefined)
    throw new Error(`${d.game}: a board of cells alone is dealt (boards/${d.game}.ts)`);
  return { w: num(d.space.grid.w, sizes), h: num(d.space.grid.h, sizes) };
}

/** Every filling of one layer that is not a free cell layer: a token's (on
 * the cells `may` admits), an arrangement's, or a face layer's. */
function fillings(l: Layer, may: (c: number) => boolean): Int32Array[] {
  const cells = l.length;
  const out: Int32Array[] = [];
  const a = new Int32Array(cells);
  if (l.once !== null) {
    // The token on each cell in turn, every other cell any other value.
    const token = l.once;
    const others = l.values.filter((v) => v !== token);
    for (let at = 0; at < cells; at++) {
      if (!may(at)) continue;
      const go = (i: number): void => {
        if (i === cells) {
          out.push(a.slice());
          return;
        }
        if (i === at) {
          a[i] = token;
          go(i + 1);
          return;
        }
        for (const v of others) {
          a[i] = v;
          go(i + 1);
        }
      };
      go(0);
    }
    return out;
  }
  if (l.arranged === null) {
    const go = (i: number): void => {
      if (i === cells) {
        out.push(a.slice());
        return;
      }
      for (const v of l.values) {
        a[i] = v;
        go(i + 1);
      }
    };
    go(0);
    return out;
  }
  const left = l.values.map(() => l.arranged as number);
  const go = (i: number): void => {
    if (i === cells) {
      out.push(a.slice());
      return;
    }
    for (let k = 0; k < l.values.length; k++)
      if (left[k] > 0) {
        left[k]--;
        a[i] = l.values[k];
        go(i + 1);
        left[k]++;
      }
  };
  go(0);
  return out;
}

/**
 * Every position the layers allow: each cell in each of its states over the
 * free cell layers, then each token on each cell its `on` admits there, and
 * every filling of the arrangements and the face layers.
 */
function* positions(
  layers: readonly Layer[],
  all: readonly string[],
  cells: number,
  sizes: ReadonlyMap<string, number>,
): Generator<Record<string, Int32Array>> {
  const free = layers.filter((l) => l.byCell && l.once === null && l.arranged === null);
  const rest = layers.filter((l) => !free.includes(l));
  const states = cellStates(layers);
  const pick = new Int32Array(cells);
  while (true) {
    const freeLayers = free.map((_, k) => Int32Array.from(pick, (s) => states[s][k]));
    // The tokens' and the others' fillings, given the free layers.
    const each = rest.map((l) =>
      l.once !== null
        ? fillings(l, (c) => tokenAdmits(l, free, states[pick[c]]))
        : fillings(l, () => true),
    );
    if (each.every((f) => f.length > 0)) {
      const at = new Array<number>(rest.length).fill(0);
      while (true) {
        const p: Record<string, Int32Array> = {};
        for (const name of all) p[name] = new Int32Array(sizes.get(name) ?? cells);
        free.forEach((l, k) => {
          p[l.name] = freeLayers[k];
        });
        rest.forEach((l, i) => {
          p[l.name] = each[i][at[i]];
        });
        yield p;
        let i = rest.length - 1;
        while (i >= 0 && ++at[i] === each[i].length) at[i--] = 0;
        if (i < 0) break;
      }
    }
    let c = cells - 1;
    while (c >= 0 && ++pick[c] === states.length) pick[c--] = 0;
    if (c < 0) return;
  }
}

/** How often a claim held, how often of a position that can finish, and
 * the first such. */
export interface ClaimResult {
  fires: number;
  unsound: number;
  witness: string | null;
}

/** What one world's search found about each claim. */
export interface WorldResult {
  world: World;
  positions: number;
  finishable: number;
  /** A move played from a position that leaves the layers' values, or
   * `permute` found false: the rules are not what the world says. */
  broken: string | null;
  /** No position has a move (Twiddle's block wider than the board): the
   * world checks nothing. */
  moveless: boolean;
  claims: Map<string, ClaimResult>;
  /** Positions that cannot finish and that no claim holds of. */
  missed: number;
  /** Positions with a move out of an open layer's window, a line the search
   * does not follow: a claim is refuted only by a line inside it. */
  beyond: number;
}

const show = (p: Layers, names: readonly string[]): string =>
  names.map((n) => `${n} ${[...p[n]].join(",")}`).join("; ");

/** One world searched whole: every claim of `mod` on every position. */
export function checkWorld(
  d: PlanningJson,
  mod: Module,
  world: World,
  layers: readonly Layer[],
): WorldResult {
  const board = world.board;
  const { w, h } = board ?? gridOf(d, world.sizes);
  const cells = w * h;
  const sp = describedSpace([], w, h);
  const dealt: Record<string, unknown> = { ...board?.dealt };
  if (board === null) {
    const grid = d.space.grid as { w: string; h: string };
    for (const [k, v] of Object.entries(world.sizes))
      if (k !== grid.w && k !== grid.h) dealt[k] = v;
  }
  const rules = mod.rules(sp, dealt, world.variations);
  const claims = mod.claims(sp, dealt, world.variations);
  const active = new Set(layers.map((l) => l.name));
  // The length of each layer, by name: a face layer's is the faces', a
  // board layer's one, and a layer the checker holds at 0 has its own.
  const position = planningWith(d, world.variations).json.position;
  const faces = d.space.faces === undefined ? 0 : num(d.space.faces, world.sizes);
  const lengths = new Map(
    mod.layers.map((n) => {
      const over = position[n]?.over;
      return [n, over === "faces" ? faces : over === "board" ? 1 : cells];
    }),
  );
  // A position whose finite layers hold values of their domains, and some
  // open layer one outside its window.
  const outside = (p: Layers): boolean => {
    let out = false;
    for (const l of layers)
      for (let c = 0; c < l.length; c++)
        if (!l.values.includes(p[l.name][c])) {
          if (!l.open) return false;
          out = true;
        }
    return out;
  };
  // A position's key: each layer's value's place in its domain, in mixed
  // radix over its places, or -1 for a value outside it.
  let space = 1;
  for (const l of layers) space *= l.values.length ** l.length;
  if (space > Number.MAX_SAFE_INTEGER)
    throw new Error(`${worldName(world)}: keys overflow`);
  const key = (p: Layers): number => {
    let k = 0;
    for (const l of layers) {
      const a = p[l.name];
      for (let c = 0; c < l.length; c++) {
        const i = l.values.indexOf(a[c]);
        if (i < 0) return -1;
        k = k * l.values.length + i;
      }
    }
    return k;
  };
  const inactiveClear = (p: Layers): boolean =>
    mod.layers.every((n) => active.has(n) || p[n].every((v) => v === 0));
  const all: Layers[] = [];
  const ids = new Map<number, number>();
  for (const p of positions(layers, mod.layers, cells, lengths)) {
    ids.set(key(p), all.length);
    all.push(p);
  }
  const result: WorldResult = {
    world,
    positions: all.length,
    finishable: 0,
    broken: null,
    moveless: false,
    claims: new Map(
      mod.deadEnds.map((id) => [id, { fires: 0, unsound: 0, witness: null }]),
    ),
    missed: 0,
    beyond: 0,
  };
  // Forward edges, by position, in one array.
  const start = new Int32Array(all.length + 1);
  const to: number[] = [];
  const permute = d.freedom.kind === "permute";
  if (permute && layers.some((l) => l.open))
    result.broken = "permute: a layer whose domain is not finite moves no piece";
  const firstMoves = permute ? JSON.stringify(rules.moves(all[0])) : "";
  for (let i = 0; i < all.length && result.broken === null; i++) {
    const p = all[i];
    const ms = rules.moves(p);
    if (permute && JSON.stringify(ms) !== firstMoves)
      result.broken = `permute: the moves differ at ${show(p, mod.layers)}`;
    let leaves = false;
    for (const m of ms) {
      const q = rules.play(p, m);
      const j = inactiveClear(q) ? (ids.get(key(q)) ?? -1) : -1;
      if (j < 0 && inactiveClear(q) && outside(q)) {
        leaves = true;
        continue;
      }
      if (j < 0) {
        result.broken = `${JSON.stringify(m)} leaves the layers' values from ${show(p, mod.layers)}`;
        break;
      }
      to.push(j);
    }
    if (leaves) result.beyond++;
    start[i + 1] = to.length;
  }
  if (result.broken !== null) return result;
  // Where nothing moves, a position finishes only as it stands, so a claim
  // is tested against nothing but the finish.
  if (to.length === 0) {
    result.moveless = true;
    return result;
  }
  if (permute) {
    // The same moves everywhere; each must move the pieces the same way: a
    // cell takes its value from one cell, the same on every position, the
    // first layer as it stands and every other turned by a fixed amount.
    const ms = rules.moves(all[0]);
    const piece = mod.layers[0];
    for (const m of ms) {
      const probe: Record<string, Int32Array> = {};
      for (const n of mod.layers) probe[n] = new Int32Array(cells);
      for (let c = 0; c < cells; c++) probe[piece][c] = c;
      const e = rules.play(probe, m);
      for (let i = 0; i < all.length && result.broken === null; i++) {
        const p = all[i];
        const q = all[to[start[i] + ms.indexOf(m)]];
        for (const l of layers)
          for (let c = 0; c < cells; c++) {
            const src = e[piece][c];
            const want =
              l.name === piece
                ? p[piece][src]
                : l.values[
                    (l.values.indexOf(p[l.name][src]) + e[l.name][c]) % l.values.length
                  ];
            if (q[l.name][c] !== want) {
              result.broken = `permute: ${JSON.stringify(m)} moves ${l.name} otherwise at ${show(p, mod.layers)}`;
              break;
            }
          }
      }
    }
    if (result.broken !== null) return result;
  }
  // Backward from the finished positions, over the edges reversed.
  const inCount = new Int32Array(all.length + 1);
  for (const j of to) inCount[j + 1]++;
  for (let i = 0; i < all.length; i++) inCount[i + 1] += inCount[i];
  const from = new Int32Array(to.length);
  const fill = inCount.slice();
  for (let i = 0; i < all.length; i++)
    for (let e = start[i]; e < start[i + 1]; e++) from[fill[to[e]]++] = i;
  const can = new Uint8Array(all.length);
  const todo: number[] = [];
  for (let i = 0; i < all.length; i++)
    if (rules.finished(all[i])) {
      can[i] = 1;
      todo.push(i);
    }
  while (todo.length > 0) {
    const j = todo.pop() as number;
    for (let e = inCount[j]; e < inCount[j + 1]; e++) {
      const i = from[e];
      if (!can[i]) {
        can[i] = 1;
        todo.push(i);
      }
    }
  }
  for (let i = 0; i < all.length; i++) {
    if (can[i]) result.finishable++;
    let any = false;
    for (const id of mod.deadEnds) {
      if (!claims[id](all[i])) continue;
      any = true;
      const r = result.claims.get(id) as ClaimResult;
      r.fires++;
      if (can[i]) {
        r.unsound++;
        r.witness ??= show(all[i], mod.layers);
      }
    }
    if (!can[i] && !any) result.missed++;
  }
  return result;
}
