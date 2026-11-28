/**
 * The band of every value beneath the board (`play.band`, Subsets' tally of
 * the sets): each value a square can hold, laid as the list beneath a board
 * lays its records (`record-list.ts`), a value of features written as its
 * letters with `_` for each it lacks, as upstream subsets.c writes them.
 * What the band holds and where each value lies, for the renderer and the
 * input. A press on a value spotlights the squares that can still hold it,
 * washed as a highlight is (`render/layers/wash.ts`); with a square in
 * focus by its badge (`render/sites/badges.ts`), it strikes the value from
 * the square's notes or gives it back.
 *
 * The band's other part: the site that draws it, `render/sites/band.ts`.
 */

import { UI_UPDATE, type UiUpdate } from "../contract/game.ts";
import { domainMask, type FillBoard, type FillModule, spaceOf } from "./board.ts";
import type { FillMove } from "./notes.ts";
import type { FillUi } from "./play.ts";

/** The values of board `b`'s band, smallest first: every value a square of
 * it can hold. */
export function bandValues<C>(module: FillModule<C>, b: FillBoard<C>): number[] {
  const mask = domainMask(module, spaceOf(module, b), b.dealt);
  const out: number[] = [];
  for (let v = 1; v < 32; v++) if (mask & (1 << v)) out.push(v);
  return out;
}

/** How value `v` is written in the band: a value of features `of` as each
 * feature's letter of `names`, or `_` where it lacks it; any other value as
 * its glyph. */
export function bandText(
  v: number,
  glyph: (v: number) => string,
  features: { readonly names: string; readonly of: (d: number) => number } | null,
): string {
  if (features === null) return glyph(v);
  const has = features.of(v);
  return Array.from(features.names, (name, k) => (has & (1 << k) ? name : "_")).join(
    "",
  );
}

/** Whether square `c` of board `b` can still hold `v`: it holds it, or it is
 * open and its notes hold it. */
export const canHold = <C>(b: FillBoard<C>, c: number, v: number): boolean =>
  b.values[c] === v || (b.values[c] === 0 && ((b.pencil?.[c] ?? 0) & (1 << v)) !== 0);

/** A press on value `v` of board `b`'s band. With an open square in focus,
 * `v` struck from its notes or given back, nothing where it is the last;
 * otherwise `v`'s squares spotlit, or the spotlight put out where it was on
 * them, and the focus with it. */
export function pressBand<C>(
  b: FillBoard<C>,
  ui: FillUi,
  v: number,
): FillMove | UiUpdate | null {
  const c = ui.focus ?? -1;
  if (c >= 0 && b.values[c] === 0 && !b.fixed[c]) {
    const notes = b.pencil?.[c] ?? 0;
    const marks = [{ x: c % b.w, y: Math.floor(c / b.w), n: v }];
    if (!(notes & (1 << v))) return { type: "pencilAdd", marks };
    return notes === 1 << v ? null : { type: "pencilStrike", marks };
  }
  ui.spotlit = ui.spotlit === v ? 0 : v;
  ui.focus = -1;
  return UI_UPDATE;
}

/** A press on square `c`'s badge: the square put in focus, or out of it
 * where it was, and the spotlight put out. */
export function pressBadge(ui: FillUi, c: number): UiUpdate {
  ui.focus = ui.focus === c ? -1 : c;
  ui.spotlit = 0;
  return UI_UPDATE;
}

/** The number of squares of board `b` that hold each value of `values`, by
 * its index there. */
export function placedCounts<C>(b: FillBoard<C>, values: readonly number[]): number[] {
  const at = new Map(values.map((v, i) => [v, i]));
  const out = values.map(() => 0);
  for (const v of b.values) {
    const i = at.get(v);
    if (i !== undefined) out[i]++;
  }
  return out;
}
