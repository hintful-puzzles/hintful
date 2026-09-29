/**
 * The marks Tents' hint draws, as the engine's roles (`hint-words.ts`).
 *
 * A link a step asks for is drawn in the hint color between its tent and its
 * tree, so it is a kind of its own, ringed with the squares it joins. The
 * number a step counts with sits outside the grid and is recolored rather than
 * outlined; it is evidence, so it is an outline on a kind of its own, named as
 * the line's number.
 */

import type { MarkKind } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A link, from square `sq` toward direction `d`. */
export type HintLink = { readonly sq: number; readonly d: number };

export const LINK: MarkKind<HintLink> = {
  name: "link",
  key: (l) => `${l.sq}:${l.d}`,
};

/** A row's or column's number, by clue index (columns first). */
export const NUMBER: MarkKind<number> = {
  name: "number",
  key: (k) => `${k}`,
};

export const pointOf = (i: number, w: number): Point => ({
  x: i % w,
  y: Math.floor(i / w),
});

/** The squares of clue line `line` (columns first) on a `w` by `h` grid. */
export function lineSquares(line: number, w: number, h: number): number[] {
  const out: number[] = [];
  if (line < w) for (let y = 0; y < h; y++) out.push(y * w + line);
  else for (let x = 0; x < w; x++) out.push((line - w) * w + x);
  return out;
}
