/**
 * What a Loopy hint's words point at, by the kind of thing it is: each word that
 * names a mark on the board is a reference to the mark it points at
 * (`engine/contract/hint-words.ts`), drawn by `render.ts` and read by the hint's tests.
 *
 * The words themselves are the description's (`loopy.description.yaml`: a
 * technique's `says`, and `steps` for what the plan says), spoken by `hint.ts`.
 * **What a step decides is the ring**: an edge it sets is "this edge", drawn with
 * the hint's band, and a note it places is "this corner" or "these two edges",
 * drawn in the action color. **What it reasons from is outlined**: a clue is "this
 * 3", its face outlined; a dot is "the outlined dot"; a line it cites is "the
 * marked line"; a note it cites is "the marked corner" or "the marked pair", the
 * player's own note redrawn in the evidence color.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";
import type { LoopyPair } from "./state.ts";

/** An edge, a clue's face, a dot or a corner (a dline), each by its grid index. */
export const EDGE: MarkKind<number> = { name: "edge", key: String };
export const FACE: MarkKind<number> = { name: "clue", key: String };
export const DOT: MarkKind<number> = { name: "dot", key: String };
export const CORNER: MarkKind<number> = { name: "corner", key: String };

/** A pair note, the same whichever edge it is named from. */
export const PAIR: MarkKind<LoopyPair> = {
  name: "pair",
  key: (p) => (p.a < p.b ? `${p.a}:${p.b}` : `${p.b}:${p.a}`),
};
