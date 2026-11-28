/**
 * The value's piece (`play`'s `paint:`): grown or shrunk while it is placed
 * or taken away, drawn as given where the cell was dealt it, and joined to
 * its neighbors where its painter joins or runs.
 */

import {
  JOIN_DOWN,
  JOIN_LEFT,
  JOIN_RIGHT,
  JOIN_UP,
  JOINED_OPEN,
  joinToward,
} from "../../../render/piece.ts";
import type { Partition } from "../../../solve/describe-runtime.ts";
import { answerOf } from "../../answer.ts";
import { type Clues, type FillBoard, spaceOf } from "../../board.ts";
import { tallyPlaced } from "../../tally-display.ts";
import type { FillSetup } from "../setup.ts";
import { DIRS, ERR_AT, FIXED, JOIN_SHIFT, SHAPE_OPEN } from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

/** Each cell's join, the side its other half is on: a joining piece and
 * one beside it alike, each beside no other, or on a part played whole
 * (`play.whole`) the part's other square, once it holds a piece too. A run
 * of three stays apart. A piece that runs (`Painter.runs`) joins its line
 * as {@link runJoins} reads it. */
export function joinsOf<C extends Clues<C>>(
  cx: FillSetup<C>,
  b: FillBoard<C>,
): Uint8Array {
  const { module, tallied } = cx;
  const { byValue } = cx.pal;
  const out = new Uint8Array(b.values.length);
  const joins = (v: number) => byValue.get(v)?.painter.joins === true;
  const runs = (v: number) => byValue.get(v)?.painter.runs === true;
  const keys = [...byValue.keys()];
  if (!keys.some(joins) && !keys.some(runs)) return out;
  const sp = spaceOf(module, b);
  const part = module.play?.whole?.part;
  const whole =
    part === undefined ? null : (b.dealt[part as keyof C] as unknown as Partition);
  const alike = (c: number) => sp.adj4[c].filter((d) => b.values[d] === b.values[c]);
  const answer = keys.some(runs) && b.fixed.some((f) => f) ? answerOf(module, b) : null;
  // Once the tally's pieces are all placed, an open square holds none.
  const full =
    tallied !== null &&
    tallyPlaced(
      b.values,
      tallied.value,
      cx.tallyCounts(b, tallied.kind, tallied.count),
    );
  for (const c of sp.cells) {
    if (runs(b.values[c])) {
      out[c] = runJoins(b, answer, c, full);
      continue;
    }
    if (!joins(b.values[c])) continue;
    if (whole !== null) {
      const other = whole.cells[whole.of[c]]?.find((p) => p !== c);
      if (other !== undefined && b.values[other] !== 0)
        out[c] = joinToward(b.w, c, other);
      continue;
    }
    const mine = alike(c);
    if (mine.length === 1 && alike(mine[0]).length === 1)
      out[c] = joinToward(b.w, c, mine[0]);
  }
  return out;
}

/**
 * A running piece's sides, as `joined` (`Painter.runs`): those it runs on
 * to, or `JOINED_OPEN` where the board does not yet say which way it runs.
 * A cell the puzzle gave runs as the answer does, so its shape is the one
 * it was given. Any other is whole where every side is shut (the edge, a
 * decided other value, or an open square where `openShut`), runs on through
 * where it is alike on both sides of a line, and ends where it is shut on
 * one side and alike on the other.
 */
function runJoins<C>(
  b: FillBoard<C>,
  answer: Uint8Array | null,
  c: number,
  openShut: boolean,
): number {
  const { w, h } = b;
  const [x, y] = [c % w, Math.floor(c / w)];
  const v = b.values[c];
  const at = (d: number): number | null => {
    const [dx, dy] = DIRS[d];
    const [nx, ny] = [x + dx, y + dy];
    return nx < 0 || ny < 0 || nx >= w || ny >= h ? null : ny * w + nx;
  };
  const sides = [JOIN_UP, JOIN_RIGHT, JOIN_DOWN, JOIN_LEFT];
  if (b.fixed[c] && answer !== null)
    return sides.reduce((j, side, d) => {
      const n = at(d);
      return n !== null && answer[n] === answer[c] ? j | side : j;
    }, 0);
  const alike = sides.map((_, d) => {
    const n = at(d);
    return n !== null && b.values[n] === v;
  });
  const shut = sides.map((_, d) => {
    const n = at(d);
    return n === null || (b.values[n] !== v && (b.values[n] !== 0 || openShut));
  });
  if (shut.every((s) => s)) return 0;
  for (const [a, z] of [
    [0, 2],
    [1, 3],
  ]) {
    if (alike[a] && alike[z]) return sides[a] | sides[z];
    if (shut[a] && alike[z]) return sides[z];
    if (shut[z] && alike[a]) return sides[a];
  }
  return JOINED_OPEN;
}

/** The piece on the tile, and a piece taken away from it a moment ago:
 * `anim`, the value it grows from or shrinks into, and how far it has got,
 * 0 to 1. A piece taken away shrinks into its cell; one placed grows alone,
 * since two pieces in one cell read as neither. */
export function paintPiece<C extends Clues<C>>(
  cx: FillSetup<C>,
  { dr, tile, word, lineWord, n, piece }: TileFrame,
  anim: { readonly from: number; readonly frac: number } | null,
): void {
  const v = word & 0xff;
  const shrinking =
    anim !== null && v === 0 ? cx.pal.byValue.get(anim.from) : undefined;
  const occupied = n >= 0;
  if (shrinking !== undefined && anim !== null)
    shrinking.painter.paint(dr, tile, shrinking.slot, false, 1 - anim.frac, occupied);
  if (word & FIXED && piece?.painter.given !== undefined)
    piece.painter.given(dr, tile, piece.slot);
  else
    piece?.painter.paint(
      dr,
      tile,
      piece.slot,
      (word & ERR_AT) !== 0,
      anim?.frac ?? 1,
      occupied,
      ((lineWord >> JOIN_SHIFT) & 0xf) | (lineWord & SHAPE_OPEN ? JOINED_OPEN : 0),
    );
}
