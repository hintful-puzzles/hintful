/**
 * The live error marks, from where the board breaks its rules
 * (`docs/rendering.md` § "Live errors are the rules'"): what a game's redraw
 * paints red, read off the violations its `rules` report.
 */

import type { RulesOf } from "../contract/rules.ts";
import type { Violation } from "../solve/describe-runtime.ts";

export interface LiveErrors {
  /** Per element of the answer, cell or edge: 1 where a violation other
   * than a pair is at it. */
  readonly at: Uint8Array;
  /** The two elements of each violation at exactly two, drawn between them
   * where the game has a mark for that (two tents touching). */
  readonly pairs: readonly (readonly [number, number])[];
  /** The clues broken, by kind, each by its index in its kind's list. */
  readonly clues: ReadonlyMap<string, ReadonlySet<number>>;
  /** The elements of each violation other than a clue's, by the statement
   * it breaks: for a game that draws a rule's breach its own way (Unruly's
   * bar along a run of three), named by its module's `RuleName`. */
  readonly byRule: ReadonlyMap<string, readonly (readonly number[])[]>;
}

/** The marks of `violations` over `n` elements. */
function liveErrorsOf(violations: readonly Violation[], n: number): LiveErrors {
  const at = new Uint8Array(n);
  const pairs: [number, number][] = [];
  const clues = new Map<string, Set<number>>();
  const byRule = new Map<string, (readonly number[])[]>();
  for (const v of violations) {
    if (v.clue < 0) {
      const list = byRule.get(v.rule) ?? [];
      byRule.set(v.rule, list);
      list.push(v.at);
    }
    if (v.clue >= 0) {
      const kind = v.rule.slice("clue.".length);
      const s = clues.get(kind) ?? new Set<number>();
      clues.set(kind, s);
      s.add(v.clue);
      continue;
    }
    if (v.at.length === 2) pairs.push([v.at[0], v.at[1]]);
    else for (const x of v.at) at[x] = 1;
  }
  return { at, pairs, clues, byRule };
}

/** The live errors of `state` as `g` holds its values: the state's own, or a
 * gesture's preview of them. */
export function liveErrors<State>(
  rules: RulesOf<State>,
  state: State,
  g: Uint8Array = rules.grid(state),
): LiveErrors {
  return liveErrorsOf(rules.violations(state, g), g.length);
}
