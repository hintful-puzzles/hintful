/**
 * Following a hint step that asks for a set of targets, judged by what the
 * player's move did to the board.
 *
 * A step that decides several squares or edges at once is one step, and the
 * player makes it one click or one drag at a time, in any order and by any
 * gesture that spells the same result. So the move is judged by its effect,
 * not its ops: every element it changed must be one the step asks for, set the
 * way the step asks, and the step then shrinks to what is left
 * (docs/hints-marks.md § "Group one firing into one step").
 *
 * The games supply only what is theirs: which elements the move changed and
 * to what (a board diff, or a move's own list of cells), how a target is keyed
 * and what it wants, and whether a target already holds on the board after the
 * move. Rebuilding the shrunk step's move and highlights stays with the game,
 * because each spells its move differently.
 */

import type { HintStep, HintTrackVerdict } from "./game.ts";

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

/**
 * Following one leg of a journey: a step the player makes whole, in any order
 * of its squares, that the step does not shrink to. Judged by the leg's own
 * squares alone: `"completed"` once every one holds, `"onTrack"` once some do,
 * and `"off"` for a leg with no squares, or where the move set one of them to
 * what the leg does not ask. What the move did elsewhere is no part of it.
 */
export function trackLeg<Target, Value>(spec: {
  targets: readonly Target[];
  want(t: Target): Value;
  /** What the target's square held before the move, and holds after it. */
  was(t: Target): Value;
  now(t: Target): Value;
}): HintTrackVerdict {
  if (spec.targets.length === 0) return "off";
  let done = 0;
  for (const t of spec.targets) {
    if (spec.now(t) === spec.want(t)) done++;
    else if (spec.now(t) !== spec.was(t)) return "off";
  }
  if (done === spec.targets.length) return "completed";
  return done > 0 ? "onTrack" : "off";
}

/** How a game spells a step's targets, for following the step by what a move
 * did to the board ({@link keepTrackBy}). */
export interface TargetCodec<State, Move, H, Target, Key, Value> {
  /** Whether a move can be no part of a step (a solve, a hint request). */
  foreign(m: Move): boolean;
  /** The board after the move, or `null` where it cannot be made. */
  execute(state: State, m: Move): State | null;
  /** What the step still asks for. */
  targets(step: HintStep<Move, H>): readonly Target[];
  /** Every element that differs between two boards, with what it holds in the
   * second. */
  changesOf(before: State, after: State): ReadonlyMap<Key, Value>;
  /** The element a target names, as {@link changesOf} keys it. */
  key(t: Target, state: State): Key;
  /** The value the target asks its element to take. */
  want(t: Target): Value;
  /** The value the target's element holds on a board. */
  valueOf(state: State, t: Target): Value;
  /** The step's move and highlights where only `left` is still to make. */
  narrowed(
    step: HintStep<Move, H>,
    left: readonly Target[],
    state: State,
  ): Pick<HintStep<Move, H>, "move" | "highlights">;
  /** The key of the target's ring in the step's words. */
  ring(t: Target, state: State): string;
}

/** A game's `hintKeepTrack` from how it spells its targets: the move is judged
 * by {@link trackTargets}, and a step on track shrinks in place to what is
 * left, its words keeping only the rings of the targets left. */
export function keepTrackBy<State, Move, H, Target, Key, Value>(
  codec: TargetCodec<State, Move, H, Target, Key, Value>,
): (m: Move, step: HintStep<Move, H>, state: State) => HintTrackVerdict {
  return (m, step, state) => {
    if (codec.foreign(m)) return "off";
    const after = codec.execute(state, m);
    if (after === null) return "off";
    const { verdict, left } = trackTargets({
      targets: codec.targets(step),
      changes: codec.changesOf(state, after),
      key: (t) => codec.key(t, state),
      want: codec.want,
      holds: (t) => codec.valueOf(after, t) === codec.want(t),
    });
    if (verdict !== "onTrack") return verdict;
    Object.assign(step, codec.narrowed(step, left, state));
    if (step.words) {
      const kept = new Set(left.map((t) => codec.ring(t, state)));
      step.words = step.words.narrow(
        (role, _kind, key) => role !== "ring" || kept.has(key),
      );
      step.explanation = step.words.text;
    }
    return verdict;
  };
}

/**
 * The {@link TargetTrack.changes} of a board with one value per cell: every
 * index in `[0, size)` whose value differs, with the value it now holds.
 * A game whose elements are not simply its cells (edges, links) keys its own.
 */
export function changedCells<V>(
  size: number,
  before: (i: number) => V,
  after: (i: number) => V,
): Map<number, V> {
  const out = new Map<number, V>();
  for (let i = 0; i < size; i++) {
    const v = after(i);
    if (before(i) !== v) out.set(i, v);
  }
  return out;
}
