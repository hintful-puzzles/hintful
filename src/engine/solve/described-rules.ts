/**
 * A game's `Game.rules` from its compiled description: the game says how its
 * state reads as the description's values, how big its space is and what the
 * board deals, and the module's own `violations` and `isAnswer` do the rest
 * (`docs/rendering.md` § "Live errors are the rules'").
 */

import type { RulesOf } from "../contract/rules.ts";
import { describedSpace, type GridSpace, type Violation } from "./describe-runtime.ts";

/** What a compiled description module offers the rules: `Deals` is what its
 * checks take after the space, the board's clues and the variations it has
 * on, as the module declares them. */
export interface RulesModule<Deals extends readonly unknown[]> {
  readonly units: readonly string[];
  violations(g: ArrayLike<number>, sp: GridSpace, ...deals: Deals): Violation[];
  isAnswer(g: ArrayLike<number>, sp: GridSpace, ...deals: Deals): boolean;
}

/** How a game's state reads as its description's board. */
export interface RulesReading<State, Deals extends readonly unknown[]> {
  /** The values, 0 where undecided ({@link RulesOf.grid}). */
  grid(state: State): Uint8Array;
  /** The space's width and height, and the regions a space of dealt blocks
   * has (Solo's jigsaw), as `describedSpace` takes them. */
  size(state: State): readonly [number, number, (readonly (readonly number[])[])?];
  /** The units the board has, where a variation adds one (Solo's
   * diagonals); the module's `units` when absent. */
  units?(state: State): readonly string[];
  /** What the module's checks take after the space, in its order. */
  deals(state: State): Deals;
}

export function describedRules<State, Deals extends readonly unknown[]>(
  module: RulesModule<Deals>,
  read: RulesReading<State, Deals>,
): RulesOf<State> {
  const space = (s: State): GridSpace =>
    describedSpace(read.units?.(s) ?? module.units, ...read.size(s));
  return {
    grid: read.grid,
    violations: (s, g) => module.violations(g, space(s), ...read.deals(s)),
    isAnswer: (s, g) => module.isAnswer(g, space(s), ...read.deals(s)),
  };
}
