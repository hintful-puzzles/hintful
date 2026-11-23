/**
 * The clues a fill board draws in the gaps between its cells (`play.gaps`):
 * which is at an edge, and which way it points, for the renderer and the
 * text format alike.
 */

import { EDGE_PAINTERS, type EdgePainter, type Side } from "../render/pieces/edge.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import { type Clues, type FillBoard, listOf } from "./board.ts";
import type { FillPlay } from "./play.ts";

/** The clue in the gap of edge `e`: the index of its kind among `play.gaps`'
 * and that kind's painter, and the side, from its valued end, its other end
 * lies on. */
export interface GapClue {
  readonly kind: number;
  readonly painter: EdgePainter;
  readonly toward: Side;
  /** The kind's name, and the clue's index in its list. */
  readonly name: string;
  readonly k: number;
}

/** The kinds `play.gaps` names, in its order, each with its painter. */
export const gapKindsOf = <C>(
  play: FillPlay,
): readonly (readonly [keyof C & string, EdgePainter])[] =>
  Object.entries(play.gaps ?? {}).map(
    ([kind, name]) => [kind as keyof C & string, EDGE_PAINTERS[name]] as const,
  );

/** The clue at edge `e` of the board `b` on its space `sp`, the first of
 * `kinds` that has one; `null` where none does. */
export function gapClueAt<C extends Clues<C>>(
  kinds: readonly (readonly [keyof C & string, EdgePainter])[],
  b: FillBoard<C>,
  sp: GridSpace,
  e: number,
): GapClue | null {
  for (const [i, [kind, painter]] of kinds.entries()) {
    const list = listOf(b.dealt, kind);
    const k = list.byAt[e];
    if (k < 0) continue;
    const [a, z] = [sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]];
    // `z` is right of `a` or below it.
    const right = Math.floor(z / b.w) === Math.floor(a / b.w);
    const fromA = list.v[k] === a;
    const toward: Side = right ? (fromA ? 1 : 3) : fromA ? 2 : 0;
    return { kind: i, painter, toward, name: kind, k };
  }
  return null;
}
