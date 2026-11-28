/**
 * A breach the description labels (`breaches`): each label written small in
 * red on its square, above or below the value, as upstream Group writes a
 * failed product's `(ab)c` over the square holding it and `a(bc)` under.
 */

import { COL_ERROR } from "../../../color/roles.ts";
import { glyphFont } from "../../../render/draw.ts";
import type { BreachLabel } from "../../../solve/describe-runtime.ts";
import type { TileFrame } from "./layer.ts";

/** A square's labels as written: one of each place, the first a breach
 * gives it. */
export type Breach = { readonly above: string | null; readonly below: string | null };

/** Each labeled square's labels, their values written by `glyph`. */
export function breachesOf(
  labels: readonly BreachLabel[],
  glyph: (v: number) => string,
): Map<number, Breach> {
  const out = new Map<number, { above: string | null; below: string | null }>();
  for (const l of labels) {
    const b = out.get(l.at) ?? { above: null, below: null };
    out.set(l.at, b);
    b[l.place] ??= l.says.map((p) => (typeof p === "string" ? p : glyph(p))).join("");
  }
  return out;
}

/** The key a square's labels are drawn by: `null` where it has none. */
export const breachKey = (b: Breach | null): string | null =>
  b === null ? null : `${b.above ?? ""}\n${b.below ?? ""}`;

export function paintBreach({ dr, ts, tx, ty, breach }: TileFrame): void {
  if (breach === null) return;
  const options = glyphFont(Math.trunc(ts / 6));
  const x = tx + Math.trunc(ts / 2);
  const inset = Math.trunc(ts / 6);
  if (breach.above !== null)
    dr.drawText({ x, y: ty + inset }, options, COL_ERROR, breach.above);
  if (breach.below !== null)
    dr.drawText({ x, y: ty + ts - inset }, options, COL_ERROR, breach.below);
}
