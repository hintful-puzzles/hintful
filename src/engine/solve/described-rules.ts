/**
 * A game's `Game.rules` from its compiled description: the game says how its
 * state reads as the description's values, how big its space is and what the
 * board deals, and the module's own `violations` and `isAnswer` do the rest
 * (`docs/rendering.md` § "Live errors are the rules'").
 */

import type { RulesOf } from "../contract/rules.ts";
import {
  describedSpace,
  type EdgeGeometry,
  type GridSpace,
  type Violation,
} from "./describe-runtime.ts";

/** What a compiled description module offers the rules: `Deals` is what its
 * checks take after the space, the board's clues and the variations it has
 * on, as the module declares them. */
export interface RulesModule<Deals extends readonly unknown[]> {
  readonly units: readonly string[];
  /** Which squares a link joins, where not only those side by side
   * (Spokes' king edges). */
  readonly edgeGeometry?: EdgeGeometry;
  violations(g: ArrayLike<number>, sp: GridSpace, ...deals: Deals): Violation[];
  isAnswer(g: ArrayLike<number>, sp: GridSpace, ...deals: Deals): boolean;
  /** Where the checks read the player's marks, the last of `Deals`: whether
   * they hold of a whole board. */
  marksHold?(g: ArrayLike<number>, sp: GridSpace, ...deals: Deals): boolean;
}

/** How a game's state reads as its description's board. */
export interface RulesReading<State, Deals extends readonly unknown[]> {
  /** The values, 0 where undecided ({@link RulesOf.grid}). */
  grid(state: State): Uint8Array | Uint16Array;
  /** The units the board has, where a variation adds one (Solo's
   * diagonals); the module's `units` when absent. */
  units?(state: State): readonly string[];
  /** What the module's checks take after the space, in its order. */
  deals(state: State): Deals;
}

/** Where the board's elements are: a grid's size, or a space the game
 * builds itself (Loopy's tiling). */
export type RulesSpace<State> =
  | {
      /** The space's width and height, and the regions a space of dealt
       * blocks has (Solo's jigsaw), as `describedSpace` takes them. */
      size(state: State): readonly [number, number, (readonly (readonly number[])[])?];
      space?: never;
    }
  | { space(state: State): GridSpace; size?: never };

/**
 * `values`, a `w` by `h` board's, with each undecided square orthogonally
 * beside one holding `v` read as holding `as`, in place: for a game whose
 * rules say so of every answer (Range's and Singles' square beside a shaded
 * one is clear), so a statement read alone sees it, as the player does. A
 * group of open squares the shading cuts off is then clear where it meets
 * the cut.
 */
export function besideHeld(
  values: Uint8Array,
  w: number,
  h: number,
  v: number,
  as: number,
): Uint8Array {
  const held = values.slice();
  for (let i = 0; i < values.length; i++) {
    if (held[i] !== v) continue;
    const x = i % w;
    for (const p of [i - w, i + w, x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1])
      if (p >= 0 && p < w * h && values[p] === 0) values[p] = as;
  }
  return values;
}

/**
 * `values`, one per edge of `sp`, `line`, `none` or 0 where undecided, with
 * what "the lines are one loop, two at each dot they pass" makes certain of
 * every answer read in place: an open edge at a dot with two lines holds
 * none, and once the lines close a loop, which can only be the loop, every
 * open edge does. So a loop closed with lines elsewhere is finished as it
 * stands, and a clue it leaves short shows (Loopy's and Pearl's).
 */
export function oneLoopHeld(
  values: Uint8Array,
  sp: GridSpace,
  line: number,
  none: number,
): Uint8Array {
  const n = sp.cells.length;
  const parent = Int32Array.from({ length: n }, (_, i) => i);
  const root = (c: number): number => {
    while (parent[c] !== c) c = parent[c] = parent[parent[c]];
    return c;
  };
  const lines = new Int32Array(n);
  let closed = false;
  for (const e of sp.edges) {
    if (values[e] !== line) continue;
    const a = sp.edgeEnds[2 * e];
    const b = sp.edgeEnds[2 * e + 1];
    lines[a]++;
    lines[b]++;
    const [ra, rb] = [root(a), root(b)];
    if (ra === rb) closed = true;
    else parent[ra] = rb;
  }
  for (const e of sp.edges)
    if (
      values[e] === 0 &&
      (closed || lines[sp.edgeEnds[2 * e]] === 2 || lines[sp.edgeEnds[2 * e + 1]] === 2)
    )
      values[e] = none;
  return values;
}

/**
 * `values`, one per edge of `sp`, `wall`, `none` or 0 where undecided, with
 * what "the walls divide the grid into regions of `k` squares" makes certain
 * of every answer read in place: an open edge between two squares of a group
 * the walls close off, of `k` squares or fewer, holds none, since a region
 * holding either square is the whole group. So a wall inside such a group
 * already stands inside a region (Palisade's and Separate's).
 */
export function regionsHeld(
  values: Uint8Array,
  sp: GridSpace,
  k: number,
  wall: number,
  none: number,
): Uint8Array {
  const n = sp.cells.length;
  const parent = Int32Array.from({ length: n }, (_, i) => i);
  const root = (c: number): number => {
    while (parent[c] !== c) c = parent[c] = parent[parent[c]];
    return c;
  };
  for (const e of sp.edges) {
    if (values[e] === wall) continue;
    const [ra, rb] = [root(sp.edgeEnds[2 * e]), root(sp.edgeEnds[2 * e + 1])];
    if (ra !== rb) parent[ra] = rb;
  }
  const size = new Int32Array(n);
  for (let c = 0; c < n; c++) size[root(c)]++;
  for (const e of sp.edges) {
    const r = root(sp.edgeEnds[2 * e]);
    if (values[e] === 0 && r === root(sp.edgeEnds[2 * e + 1]) && size[r] <= k)
      values[e] = none;
  }
  return values;
}

export function describedRules<State, Deals extends readonly unknown[]>(
  module: RulesModule<Deals>,
  read: RulesReading<State, Deals> & RulesSpace<State>,
): RulesOf<State> {
  const space = (s: State): GridSpace => {
    if (read.space !== undefined) return read.space(s);
    const [w, h, parts = []] = read.size(s);
    return describedSpace(
      read.units?.(s) ?? module.units,
      w,
      h,
      parts,
      module.edgeGeometry,
    );
  };
  const { marksHold } = module;
  return {
    grid: read.grid,
    violations: (s, g) => module.violations(g, space(s), ...read.deals(s)),
    isAnswer: (s, g) => module.isAnswer(g, space(s), ...read.deals(s)),
    ...(marksHold === undefined
      ? {}
      : {
          marksHold: (s: State, g: ArrayLike<number>) =>
            marksHold(g, space(s), ...read.deals(s)),
        }),
  };
}
