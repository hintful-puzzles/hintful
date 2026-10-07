/**
 * Every sentence the Tracks hint speaks, and every word inside one.
 *
 * The deduction decides *which* sentence and *with what values*
 * ([`hint.ts`](./hint.ts)'s `narrate`); this file decides only how it reads,
 * so a wording pass happens here and nowhere else. Values arrive as the board
 * means them (an axis, a count, a direction), never as words: the plural, the
 * "both" at two and the name of a direction are this file's to choose.
 *
 * Each sentence runs indication, reasoning, conclusion, with the conclusion in
 * the necessity voice (docs/games/hints.md § "Writing the narration"), and a
 * line is always "this column" / "this row", striped through its clue: Tracks
 * draws no line numbers to name it by.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the squares and sides the step decides are the
 * ring, the squares, sides and clue it reasons from are outlined, and the line
 * or closed block it is about is striped.
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import { D, L, R, U } from "./state.ts";

export type Axis = "row" | "column";

/** A square, one side of a square, or a clue in the margin (`0..w-1` columns,
 * then rows). One kind for all three, so one reference can name a clue with
 * the squares it counts. A side is keyed from its right or lower square, so
 * both squares it separates name it alike. */
export type Piece =
  | { readonly x: number; readonly y: number; readonly dir?: undefined }
  | { readonly x: number; readonly y: number; readonly dir: number }
  | { readonly clue: number };

function pieceKey(p: Piece): string {
  if ("clue" in p) return `clue ${p.clue}`;
  if (p.dir === undefined) return `${p.x},${p.y}`;
  if (p.dir === L) return `${p.x - 1},${p.y}:${R}`;
  if (p.dir === U) return `${p.x},${p.y - 1}:${D}`;
  return `${p.x},${p.y}:${p.dir}`;
}

export const PIECE: MarkKind<Piece> = { name: "piece", key: pieceKey };

/** A whole row or column, by clue index, striped through its clue. */
export const LINE: MarkKind<number> = { name: "line", key: String };

/** What a step marks, as its words name it. */
export interface Marked {
  /** The squares and sides the step decides; `emptied` and `filled` split the
   * squares by what they become. */
  readonly decided: readonly Piece[];
  readonly emptied: readonly Piece[];
  readonly filled: readonly Piece[];
  /** The squares and sides it reasons from, and the clues it counts. */
  readonly cells: readonly Piece[];
  readonly sides: readonly Piece[];
  readonly clues: readonly Piece[];
  /** The line it names, or the closed block. */
  readonly line: readonly number[];
  readonly block: readonly Piece[];
}

/** Where a neighbor sits, as in "none above" / "none to the left". */
function towards(dir: number): string {
  if (dir === U) return "above";
  if (dir === D) return "below";
  return dir === L ? "to the left" : "to the right";
}

/** Which way a track carries on, as in "carry on upward". */
function onward(dir: number): string {
  if (dir === U) return "upward";
  if (dir === D) return "downward";
  return dir === L ? "to the left" : "to the right";
}

const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);

const decided = (m: Marked, words: string): Narration =>
  mark.as("ring", PIECE, m.decided, words);
const thisSide = (m: Marked): Narration =>
  mark.as("ring", PIECE, m.decided, (els) =>
    els.length === 1 ? "this side" : "these sides",
  );
const line = (m: Marked, words: string): Narration =>
  mark.as("stripes", LINE, m.line, words);
const clue = (m: Marked, words: string): Narration =>
  mark.as("outline", PIECE, m.clues, words);
const cells = (m: Marked, words: string): Narration =>
  mark.as("outline", PIECE, m.cells, words);
const sides = (m: Marked, words: string): Narration =>
  mark.as("outline", PIECE, m.sides, words);

export const say = {
  /** A square with `open` sides left, fewer than the two a track needs. */
  onlyOneSideLeft: (open: number, m: Marked): Sentence =>
    open === 0
      ? so({
          look: phrase`${sides(m, "Every side")} of ${decided(m, "this square")} is blocked`,
          follows: phrase`no track can reach it`,
          move: phrase`it must be empty`,
        })
      : so({
          look: phrase`${sides(m, "Every side")} of ${decided(m, "this square")} but one is blocked, and track needs two`,
          move: phrase`it must be empty`,
        }),

  bothSidesLeft: (m: Marked): Sentence =>
    so({
      look: phrase`The track here has ${sides(m, "two sides blocked")}`,
      move: phrase`it must run ${decided(m, "through the other two")}`,
    }),

  /** A line whose `target` track squares are all laid. */
  clueFull: (axis: Axis, target: number, m: Marked): Sentence => {
    if (target === 0) {
      return so({
        look: phrase`${line(m, `This ${axis}`)}'s ${clue(m, "clue")} is 0`,
        follows: phrase`no track can run along it at all`,
        move: phrase`${decided(m, "every square in it")} must be empty`,
      });
    }
    const has =
      target === 1
        ? phrase`${cells(m, "the one track square")} ${clue(m, "its clue")} allows`
        : target === 2
          ? phrase`${cells(m, "both of the track squares")} ${clue(m, "its clue")} allows`
          : phrase`${cells(m, `all ${target} of the track squares`)} ${clue(m, "its clue")} allows`;
    return so({
      look: phrase`${line(m, `This ${axis}`)} already has ${has}`,
      move: phrase`${decided(m, "every other square in it")} must be empty`,
    });
  },

  /** A line of `len` squares whose empties are all marked, `target` short of
   * full. */
  clueExact: (axis: Axis, target: number, len: number, m: Marked): Sentence => {
    const room = len - target;
    if (room === 0) {
      return so({
        look: phrase`${line(m, `This ${axis}`)}'s ${clue(m, `clue is ${target}`)} and it is ${len} squares long`,
        move: phrase`${decided(m, "every square in it")} must carry track`,
      });
    }
    const marked = plural(room, "it is already marked", "they are already marked");
    return so({
      look: phrase`${line(m, `This ${axis}`)} ${clue(m, `can leave only ${room} ${plural(room, "square", "squares")} empty`)} and ${cells(m, marked)}`,
      move: phrase`${decided(m, "every other square in it")} must carry track`,
    });
  },

  wouldCloseLoop: (m: Marked): Sentence =>
    so({
      look: phrase`${cells(m, "The outlined track")} already joins the squares ${decided(m, "this side")} separates`,
      follows: phrase`crossing it would close a loop`,
      move: phrase`it must be blocked`,
    }),

  wouldStrandTrack: (m: Marked): Sentence =>
    so({
      look: phrase`Joining here would link A's run to B's and finish the track, stranding ${cells(m, "the outlined track")}`,
      move: phrase`${thisSide(m)} must be blocked`,
    }),

  /** Finishing here would leave the named line's clue unmet by the track
   * squares it has. */
  wouldFinishEarly: (axis: Axis, m: Marked): Sentence =>
    so({
      look: phrase`Joining A's run to B's here would finish the track with ${line(m, `this ${axis}`)}'s ${mark.as("outline", PIECE, [...m.clues, ...m.cells], "clue short")}`,
      move: phrase`${thisSide(m)} must be blocked`,
    }),

  // "No way across it": every unfinished square has a side blocked across the
  // line, which is what the outlined squares and their bars show.
  looseEndSpans: (axis: Axis, m: Marked): Sentence =>
    so({
      look: phrase`${line(m, `This ${axis}`)} has ${clue(m, "two track squares left")} and ${mark.as("outline", PIECE, [...m.cells, ...m.sides], "no way across it")}`,
      move: phrase`the loose end must run ${decided(m, "straight on")}`,
    }),

  /** Track here would carry on toward `dir`, which the line can afford once:
   * this square empties and the next fills. */
  sharedFateBoth: (axis: Axis, dir: number, m: Marked): Sentence =>
    so({
      look: phrase`Track ${mark.as("ring", PIECE, m.emptied, "here")} ${sides(m, `would run on ${onward(dir)}`)}, but ${line(m, `this ${axis}`)} ${clue(m, "has one track and one empty left")}`,
      move: phrase`${mark.as("ring", PIECE, m.emptied, "this")} must be empty, ${mark.as("ring", PIECE, m.filled, "the next")} track`,
    }),

  sharedFateFills: (axis: Axis, dir: number, m: Marked): Sentence =>
    so({
      look: phrase`Track ${decided(m, "here")} ${sides(m, `would carry on ${onward(dir)}`)}, but ${line(m, `this ${axis}`)} ${mark.as("outline", PIECE, [...m.clues, ...m.cells], "has room for one more track square")}`,
      move: phrase`${decided(m, "this")} must be empty`,
    }),

  /** No track here means none in the neighbor toward `behind` either. */
  sharedFateEmpties: (axis: Axis, behind: number, m: Marked): Sentence =>
    so({
      look: phrase`No track ${decided(m, "here")} ${sides(m, `means none ${towards(behind)} either`)}, but ${line(m, `this ${axis}`)} ${mark.as("outline", PIECE, [...m.clues, ...m.cells], "can spare just one more empty")}`,
      move: phrase`${decided(m, "this")} must carry track`,
    }),

  // "Every entry needs an exit" is the parity argument in the player's terms:
  // the track begins and ends off the board, so it crosses any closed block's
  // border an even number of times.
  crossingParity: (crossings: number, carries: boolean, m: Marked): Sentence => {
    const marked =
      crossings === 0
        ? "no crossing is marked yet"
        : `${crossings} ${plural(crossings, "crossing is", "crossings are")} marked`;
    return so({
      look: phrase`Every entry to ${mark.as("stripes", PIECE, m.block, "the striped block")} needs an exit, and ${sides(m, marked)}`,
      move: phrase`${decided(m, "this last side")} must ${carries ? "carry track" : "be blocked"}`,
    });
  },
};
