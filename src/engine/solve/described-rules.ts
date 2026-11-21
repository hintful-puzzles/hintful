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
}

/** How a game's state reads as its description's board. */
export interface RulesReading<State, Deals extends readonly unknown[]> {
  /** The values, 0 where undecided ({@link RulesOf.grid}). */
  grid(state: State): Uint8Array | Uint16Array;
  /** The space's width and height, and the regions a space of dealt blocks
   * has (Solo's jigsaw), as `describedSpace` takes them. */
  size(state: State): readonly [number, number, (readonly (readonly number[])[])?];
  /** The units the board has, where a variation adds one (Solo's
   * diagonals); the module's `units` when absent. */
  units?(state: State): readonly string[];
  /** What the module's checks take after the space, in its order. */
  deals(state: State): Deals;
}

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

export function describedRules<State, Deals extends readonly unknown[]>(
  module: RulesModule<Deals>,
  read: RulesReading<State, Deals>,
): RulesOf<State> {
  const space = (s: State): GridSpace => {
    const [w, h, parts = []] = read.size(s);
    return describedSpace(
      read.units?.(s) ?? module.units,
      w,
      h,
      parts,
      module.edgeGeometry,
    );
  };
  return {
    grid: read.grid,
    violations: (s, g) => module.violations(g, space(s), ...read.deals(s)),
    isAnswer: (s, g) => module.isAnswer(g, space(s), ...read.deals(s)),
  };
}
