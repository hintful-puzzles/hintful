/**
 * The marks Bridges' hint draws, as the engine's kinds (`hint-words.ts`): the
 * bridges, crosses and limits a step decides are the ring, on spans, and the
 * island a sentence is about, the islands it counts and the bridges between
 * them are outlined pieces. `render.ts` paints them and the steps
 * `bridges.description.yaml` declares name them.
 */

import type { MarkKind } from "../../engine/hint-words.ts";
import type { BridgesSpan } from "./solver.ts";

const spanKey = (s: BridgesSpan): string => {
  const a = `${s.x1},${s.y1}`;
  const b = `${s.x2},${s.y2}`;
  return a < b ? `${a}-${b}` : `${b}-${a}`;
};

/** A span between two islands, the same from either end. */
export const SPAN: MarkKind<BridgesSpan> = { name: "span", key: spanKey };

/** An island, or a bridge span the argument counts. One kind for both, so
 * "these 3 islands" can name a group with the bridges that link it. */
export type Piece = { x: number; y: number } | BridgesSpan;

export const PIECE: MarkKind<Piece> = {
  name: "piece",
  key: (p) => ("x1" in p ? spanKey(p) : `${p.x},${p.y}`),
};
