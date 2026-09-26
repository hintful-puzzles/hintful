/**
 * Following a hint step that asks for a set of targets, judged by what the
 * player's move did to the board.
 *
 * A step that decides several squares or edges at once is one step, and the
 * player makes it one click or one drag at a time, in any order and by any
 * gesture that spells the same result. So the move is judged by its effect,
 * not its ops: every element it changed must be one the step asks for, set the
 * way the step asks, and the step then shrinks to what is left
 * (docs/games/hints.md § "Group one firing into one step").
 *
 * The games supply only what is theirs: which elements the move changed and
 * to what (a board diff, or a move's own list of cells), how a target is keyed
 * and what it wants, and whether a target already holds on the board after the
 * move. Rebuilding the shrunk step's move and highlights stays with the game,
 * because each spells its move differently.
 */

import type { HintTrackVerdict } from "./game.ts";

export interface TargetTrack<Target, Key, Value> {
  /** What the step still asks for. */
  targets: readonly Target[];
  /** Every element the move changed, with the value it now holds; `null` for
   * a move no step of this kind is ever made by (a solve, a hint request). */
  changes: ReadonlyMap<Key, Value> | null;
  /** The element a target names, as {@link changes} keys it. */
  key(t: Target): Key;
  /** The value the target asks that element to take. */
  want(t: Target): Value;
  /** Whether the target holds on the board after the move. */
  holds(t: Target): boolean;
}

/**
 * `"off"` if the move changed nothing, or changed anything the step does not
 * ask for or not the way it asks; otherwise `"completed"` once every target
 * holds, else `"onTrack"` with `left`, the targets that do not yet.
 */
export function trackTargets<Target, Key, Value>(
  spec: TargetTrack<Target, Key, Value>,
): { verdict: HintTrackVerdict; left: Target[] } {
  const { targets, changes } = spec;
  if (!changes || changes.size === 0) return { verdict: "off", left: [] };
  const wanted = new Map(targets.map((t) => [spec.key(t), spec.want(t)]));
  for (const [k, v] of changes) {
    if (!wanted.has(k) || wanted.get(k) !== v) return { verdict: "off", left: [] };
  }
  const left = targets.filter((t) => !spec.holds(t));
  return { verdict: left.length === 0 ? "completed" : "onTrack", left };
}
