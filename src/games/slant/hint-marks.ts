/**
 * The marks Slant's hint draws, as the engine's roles (`hint-words.ts`).
 *
 * Slant's clues sit on grid points, not in squares, and its same-slant marks
 * sit across the side two squares share, so each is a kind of its own: a clue
 * recolored in the hint color is an outline on its point, and a same-slant mark
 * is ringed when the step places it and outlined when the step cites it.
 */

import { CELL, type MarkKind, type MarkRef } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { SlantHint, SlantMark } from "./hint.ts";

/** A clue, on the grid point it sits on. */
export const CLUE: MarkKind<Point> = {
  name: "clue",
  key: (p) => `${p.x},${p.y}`,
};

/** A same-slant mark, across the side a square shares with its neighbor to
 * the `dir`. */
export const ALIKE: MarkKind<SlantMark> = {
  name: "alike",
  key: (m) => `${m.x},${m.y},${m.dir}`,
};

/** What a step's highlights draw: the `drawn` half of Slant's legend. */
export function slantHintMarks(h: SlantHint): MarkRef[] {
  return [
    {
      role: "ring",
      kind: CELL,
      elements: [...(h.target ? [h.target] : []), ...(h.siblings ?? [])],
    },
    { role: "ring", kind: ALIKE, elements: h.mark ? [h.mark] : [] },
    {
      role: "outline",
      kind: CELL,
      elements: [...(h.area ?? []), ...(h.ref ? [h.ref] : [])],
    },
    { role: "outline", kind: CLUE, elements: h.clues ?? [] },
    { role: "outline", kind: ALIKE, elements: h.marks ?? [] },
  ] as MarkRef[];
}
