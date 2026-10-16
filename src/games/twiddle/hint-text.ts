/**
 * Every sentence Twiddle's hint speaks.
 *
 * Each step names the tile it is putting in place (the sentence's aim,
 * "Working on tile 7:"; on a rows-only board, where a row's tiles share its
 * number, "Working on the outlined 2:"), then the turn. A free turn, one that
 * moves no finished tile, says what it does for the tile. The first turn of a
 * run says what the run does, and each later turn says which turn of the run it
 * is, since the one before need not still be on screen. "In place" is the
 * tile's own square and, where orientation matters, upright; the help page
 * says so. Which case a step is, and which tile, is `hint.ts`'s to decide; this
 * file decides only how it reads.
 *
 * The block to turn is what the step decides, so it is ringed; the tile the
 * step serves is outlined.
 */

import { joinNums } from "../../engine/hint-text.ts";
import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A block, by the top-left square of the ones it turns. */
export const BLOCK: MarkKind<Point> = { name: "block", key: (p) => `${p.x},${p.y}` };

/** A tile, by the cell it stands on when the step is shown. */
export const TILE: MarkKind<number> = { name: "tile", key: (c) => `${c}` };

/** The goal a step serves. */
export interface Goal {
  /** The cell the tile stands on now. */
  readonly at: number;
  /** The tile's number. */
  readonly number: number;
  /** Rows-only: every tile of a row carries its number, so the tile is named
   * by its outline, and it goes toward its row. */
  readonly rowsOnly: boolean;
}

/** The turn a step makes. */
export interface Turned {
  readonly block: Point;
  readonly clockwise: boolean;
}

/** What a run does besides putting the goal tile in place: nothing to the
 * finished tiles, or it puts these tiles before it in place too, by the
 * numbers the board shows (a broken-off run's tiles, put back). */
export type Before =
  | { readonly fixes: false }
  | { readonly fixes: true; readonly tiles: readonly number[] };

const turnWords = (t: Turned): Narration =>
  phrase`turn ${mark.as("ring", BLOCK, [t.block], "the ringed block")} ${t.clockwise ? "clockwise" : "anticlockwise"}`;

const aimOf = (g: Goal): Narration =>
  g.rowsOnly
    ? mark.the("outline", TILE, [g.at], `${g.number}`)
    : mark.as("outline", TILE, [g.at], `tile ${g.number}`);

/** "put it in place, finished tiles intact", or, where the run fixes tiles
 * before the goal's, what it puts in place. */
const runDoes = (g: Goal, before: Before, intact = true): string => {
  if (!before.fixes)
    return intact ? "put it in place, finished tiles intact" : "put it in place";
  if (g.rowsOnly) {
    const others = before.tiles.length;
    return `put it and ${others === 1 ? "one other" : `${others} others`} in place`;
  }
  const all = [...before.tiles, g.number];
  const first = all[0];
  const last = all[all.length - 1];
  return all.length > 2 && last - first === all.length - 1
    ? `put tiles ${first} to ${last} in place`
    : `put tiles ${joinNums(all)} in place`;
};

export const say = {
  /** A free turn that puts the tile in place. */
  home: (g: Goal, t: Turned): Sentence =>
    sentence({
      aim: aimOf(g),
      move: phrase`${turnWords(t)} to put it in place`,
      relation: { kind: "serves" },
    }),

  /** A free turn that carries the tile one turn nearer its place. */
  carry: (g: Goal, t: Turned): Sentence =>
    sentence({
      aim: aimOf(g),
      move: phrase`${turnWords(t)} to carry it toward ${g.rowsOnly ? "its row" : "its place"}`,
      relation: { kind: "serves" },
    }),

  /** A run of one turn: the end of a run the player broke off. */
  lastOfRun: (g: Goal, t: Turned, before: Before): Sentence =>
    sentence({
      aim: aimOf(g),
      move: phrase`${turnWords(t)} to ${runDoes(g, before)}`,
      relation: { kind: "serves" },
    }),

  /** The first turn of a run of `count`, two or more. */
  runStart: (g: Goal, t: Turned, count: number, before: Before): Sentence =>
    sentence({
      aim: aimOf(g),
      look: phrase`${String(count)} turns ${runDoes(g, before)}`,
      move: turnWords(t),
      relation: { kind: "sequence", at: "first" },
    }),

  /** Turn `index` (from 1) of a run of `count`, after the first. */
  runOn: (g: Goal, t: Turned, index: number, count: number, before: Before): Sentence =>
    sentence({
      aim: aimOf(g),
      move: phrase`${turnWords(t)}, ${index === count ? "the last" : `turn ${index}`} of the ${String(count)} that ${runDoes(g, before, false)}`,
      relation: { kind: "serves" },
    }),
};
