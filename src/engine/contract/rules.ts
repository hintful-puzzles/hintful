/**
 * A board as its description's rules read it: what the live error marks are
 * drawn from, and what the violation guard checks them sound on.
 */

import type { Violation } from "../solve/describe-runtime.ts";

export interface RulesOf<State> {
  /** The answer's elements' values as the description reads them, 0 where
   * the player has decided none. */
  grid(state: State): Uint8Array;
  /** Each statement `g`, `grid(state)` or the same board with values
   * changed, already breaks: the compiled module's `violations` over the
   * board `state` deals. */
  violations(state: State, g: ArrayLike<number>): readonly Violation[];
}
