/**
 * The clues at a dealt partition's parts, each drawn at its part's first
 * cell as its number and its sign, in the place `cell-text.ts` fits a hint's
 * ring round: in ink, red where it breaks, gray where the player marked it
 * done.
 */

import { COL_ERROR } from "../../../color/roles.ts";
import type { Rect } from "../../../contract/types.ts";
import { textBox } from "../../../render/ring.ts";
import { type Clues, type FillBoard, listOf } from "../../board.ts";
import { signedText } from "../../corners.ts";
import type { CellLayout } from "../cell-text.ts";
import { COL_INK } from "../palette.ts";
import type { FillSetup } from "../setup.ts";
import { LABEL_BROKEN, LABEL_DONE } from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

/** Each part's clue by its first cell: its kind, its index in the kind's
 * list, and its text. */
export function labelsOf<C extends Clues<C>>(
  cx: FillSetup<C>,
  b: FillBoard<C>,
): Map<number, { kind: keyof C & string; k: number; text: string }> {
  const out = new Map<number, { kind: keyof C & string; k: number; text: string }>();
  // Blocks a variation deals are absent from a board it is off on.
  const by = cx.labelParts(b);
  if (by === null) return out;
  const { cells } = by;
  for (const kind of cx.partKinds) {
    const list = listOf(b.dealt, kind);
    list.at.forEach((r, k) => {
      out.set(cells[r][0], {
        kind,
        k,
        text: signedText(cx.play.signs?.[kind] ?? null, list.v[k], 0, Infinity),
      });
    });
  }
  return out;
}

export function paintPartClue(
  COL_DONE: number,
  { dr, ts, at, lineWord, part, label, lay }: TileFrame,
): void {
  if (label === null) return;
  const { origin, options } = lay.labelText(ts, at, part?.walls ?? null, label);
  const ink =
    lineWord & LABEL_BROKEN ? COL_ERROR : lineWord & LABEL_DONE ? COL_DONE : COL_INK;
  dr.drawText(origin, options, ink, label);
}

/** The clue of the part holding cell `c`, with the box it is drawn in at
 * its part's first cell, whose walls are `wallsAt`; `null` where the part has
 * none or the board has no clues at parts. */
export function partClueBox<C extends Clues<C>>(
  cx: FillSetup<C>,
  lay: CellLayout,
  ts: number,
  b: FillBoard<C>,
  c: number,
  wallsAt: (first: number) => number | null,
): { readonly box: Rect; readonly kind: string; readonly k: number } | null {
  if (!cx.labeled) return null;
  // A partition a variation adds is dealt only on a board with it on.
  const parts = cx.labelParts(b);
  if (parts === null) return null;
  const { of, cells } = parts;
  const first = cells[of[c]][0];
  const label = labelsOf(cx, b).get(first);
  if (label === undefined) return null;
  const at = [first % b.w, Math.floor(first / b.w), b.h] as const;
  const { origin, options } = lay.labelText(ts, at, wallsAt(first), label.text);
  return {
    box: textBox(origin, options, label.text),
    kind: label.kind,
    k: label.k,
  };
}
