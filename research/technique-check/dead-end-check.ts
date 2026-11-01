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

import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { compilePlanning } from "../../src/describe/compile-position.ts";
import { type PlanningJson, planningWith } from "../../src/describe/description.ts";
import { parse } from "../../src/describe/expr.ts";
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

/** One board: its sizes and the variations it has on. */
export interface World {
  sizes: Record<string, number>;
  variations: string[];
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

/** A layer as a world reads it: its values in order, and how many cells
 * each is on where it is an arrangement. */
interface Layer {
  name: string;
  values: number[];
  arranged: number | null;
  /** The value exactly one cell holds, where the layer is a token. */
  once: number | null;
}

/** How many positions a world's layers allow, over `cells` cells. */
function universeSize(layers: readonly Layer[], cells: number): number {
  let n = 1;
  for (const l of layers) {
    if (l.once !== null) n *= cells * (l.values.length - 1) ** (cells - 1);
    else if (l.arranged === null) n *= l.values.length ** cells;
    else {
      if (l.values.length * l.arranged !== cells) return 0;
      let ways = 1;
      for (let i = 2; i <= cells; i++) ways *= i;
      for (let i = 2; i <= l.arranged; i++) ways /= i ** l.values.length;
      n *= Math.round(ways);
    }
    if (n > CHECKED_POSITIONS) return n;
  }
  return n;
}

/** Each world of small sizes whose positions are few enough to search
 * whole, under each set of the description's variations. */
export function worlds(
  d: PlanningJson,
): { world: World; layers: Layer[]; size: number }[] {
  const names = Object.keys(d.sizes);
  const combos: Record<string, number>[] = [{}];
  for (const n of names) {
    const { min, max } = d.sizes[n];
    const next: Record<string, number>[] = [];
    for (const c of combos)
      for (let v = min; v <= Math.min(max, min + 3); v++) next.push({ ...c, [n]: v });
    combos.splice(0, combos.length, ...next);
  }
  const varNames = Object.keys(d.variations ?? {});
  const subsets: string[][] = [[]];
  for (const v of varNames) for (const s of [...subsets]) subsets.push([...s, v]);
  const out: { world: World; layers: Layer[]; size: number }[] = [];
  for (const sizes of combos)
    for (const variations of subsets) {
      const position = planningWith(d, variations).json.position;
      const layers = Object.entries(position).map(([name, l]) => {
        const values = term(l.domain, sizes);
        if (!Array.isArray(values)) throw new TypeError(`${name}: no domain`);
        return {
          name,
          values: (values as number[]).slice().sort((a, b) => a - b),
          arranged: l.arranged === undefined ? null : num(l.arranged, sizes),
          once: l.once === undefined ? null : num(l.once, sizes),
        };
      });
      const cells = num(d.space.grid.w, sizes) * num(d.space.grid.h, sizes);
      const size = universeSize(layers, cells);
      if (size > 0 && size <= CHECKED_POSITIONS)
        out.push({ world: { sizes, variations }, layers, size });
    }
  return out;
}

/** Every position the layers allow, each layer's values over the cells. */
function* positions(
  layers: readonly Layer[],
  all: readonly string[],
  cells: number,
): Generator<Record<string, Int32Array>> {
  const fillings = (l: Layer): Int32Array[] => {
    const out: Int32Array[] = [];
    const a = new Int32Array(cells);
    if (l.once !== null) {
      // The token on each cell in turn, every other cell any other value.
      const token = l.once;
      const others = l.values.filter((v) => v !== token);
      for (let at = 0; at < cells; at++) {
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
  };
  const each = layers.map(fillings);
  const pick = new Array<number>(layers.length).fill(0);
  if (each.some((f) => f.length === 0)) return;
  while (true) {
    const p: Record<string, Int32Array> = {};
    for (const name of all) p[name] = new Int32Array(cells);
    layers.forEach((l, i) => {
      p[l.name] = each[i][pick[i]];
    });
    yield p;
    let i = layers.length - 1;
    while (i >= 0 && ++pick[i] === each[i].length) pick[i--] = 0;
    if (i < 0) return;
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
  // A world deals sizes only: a claim over a dealt relation would need every
  // relation enumerated too, which no description has asked for yet.
  if (Object.keys(d.space.relations ?? {}).length > 0)
    throw new Error(`${d.game}: the checker deals no relation`);
  const w = num(d.space.grid.w, world.sizes);
  const h = num(d.space.grid.h, world.sizes);
  const cells = w * h;
  const sp = describedSpace([], w, h);
  const dealt: Record<string, number> = {};
  for (const [k, v] of Object.entries(world.sizes))
    if (k !== d.space.grid.w && k !== d.space.grid.h) dealt[k] = v;
  const rules = mod.rules(sp, dealt, world.variations);
  const claims = mod.claims(sp, dealt, world.variations);
  const active = new Set(layers.map((l) => l.name));
  // A position's key: each layer's value's place in its domain, in mixed
  // radix over the cells, or -1 for a value outside it.
  let space = 1;
  for (const l of layers) space *= l.values.length ** cells;
  if (space > Number.MAX_SAFE_INTEGER)
    throw new Error(`${worldName(world)}: keys overflow`);
  const key = (p: Layers): number => {
    let k = 0;
    for (const l of layers) {
      const a = p[l.name];
      for (let c = 0; c < cells; c++) {
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
  for (const p of positions(layers, mod.layers, cells)) {
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
  };
  // Forward edges, by position, in one array.
  const start = new Int32Array(all.length + 1);
  const to: number[] = [];
  const permute = d.freedom.kind === "permute";
  const firstMoves = permute ? JSON.stringify(rules.moves(all[0])) : "";
  for (let i = 0; i < all.length && result.broken === null; i++) {
    const p = all[i];
    const ms = rules.moves(p);
    if (permute && JSON.stringify(ms) !== firstMoves)
      result.broken = `permute: the moves differ at ${show(p, mod.layers)}`;
    for (const m of ms) {
      const q = rules.play(p, m);
      const j = inactiveClear(q) ? (ids.get(key(q)) ?? -1) : -1;
      if (j < 0) {
        result.broken = `${JSON.stringify(m)} leaves the layers' values from ${show(p, mod.layers)}`;
        break;
      }
      to.push(j);
    }
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
