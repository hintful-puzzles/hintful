/**
 * Every sentence Netslide's hint speaks, and the words inside them.
 *
 * Which tile a step is about, where it is going and whether it arrives are
 * `hint.ts`'s `narrateStep` to decide; this file decides only how it reads.
 *
 * Every clause is a claim, and every clause has to earn the width it takes on
 * the hint bar. Two things are worth saying about the tile being placed:
 *
 * - it sits on a line that **cannot be slid**, so only the perpendicular line can
 *   shift it — a single degree of freedom, and the game's whole technique;
 * - or its destination is a cell the finished board wants its wires in, which is
 *   just stated, plainly.
 *
 * What is *not* said: that the source can never move. That is a **rule of the
 * game**, not a deduction about this move — the board already shows it (no arrows
 * are drawn beside the source's row or column) and it belongs in the help text.
 * Saying it every step made the commonest sentence 1.8× the length of the rest and
 * taught nothing the second time.
 *
 * A line is "this row", striped on the board, never a number the board does not
 * draw, and never "the center": `cx` is `⌊w/2⌋`, so on an even-sized board the
 * source is visibly off-center and the player can see the claim is false.
 *
 * Everything else a step marks is what it decides, so it is ringed in the roles
 * of `engine/hint-words.ts`, whatever its glyph: the tile to move (a double ring,
 * with the arrow to click in the hint's color) and the squares the slide takes
 * it to (a solid outline where it belongs, a dashed one on the way). The words
 * that point at them are references.
 *
 * The move itself is *not* forced by logic — Netslide is a movement game — so
 * the conclusion is an imperative, never a modal of necessity.
 */

import { HINT_SETTING_UP } from "../../engine/hint-text.ts";
import {
  CELL,
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { D, L, R, U, wireCount } from "./state.ts";

/** The tile a step moves, by the cell it sits in; its mark includes the arrow
 * that slides it. */
export const TILE: MarkKind<number> = { name: "tile", key: String };

/** A square the slide takes the tile to, by flat index. */
export const SQUARE: MarkKind<number> = { name: "square", key: String };

/** What a step marks: the tile (wired as `mask`), where this slide lands it,
 * where its journey ends, and the line the sentence names (empty when none). */
export interface Marked {
  tile: number;
  mask: number;
  landing: number;
  destination: number;
  line: readonly Point[];
}

/** A tile's name is its shape, which is the one thing about it the player can
 * see. There is no "tile 8" in Netslide, so the shape names the *kind* and the
 * board's mark says *which one*. */
function tileName(mask: number): string {
  const wires = wireCount(mask);
  if (wires === 1) return "loose end";
  if (wires === 3) return "T-piece";
  if (wires === 4) return "cross";
  return mask === (L | R) || mask === (U | D) ? "straight" : "corner";
}

const tile = (m: Marked, words: string): Narration =>
  mark.as("ring", TILE, [m.tile], words);
const thisTile = (m: Marked, lead = "this"): Narration =>
  tile(m, `${lead} ${tileName(m.mask)}`);

/** Where the slide takes the tile: its landing, and the end of its journey
 * when that is further on. */
const place = (m: Marked): Narration =>
  m.landing === m.destination
    ? mark.as("ring", SQUARE, [m.landing], "the ringed square")
    : mark.as("ring", SQUARE, [m.landing, m.destination], "the two ringed squares");

const thisLine = (m: Marked, noun: "row" | "column"): Narration =>
  mark.this("stripes", whole(CELL), m.line, noun);

/** How a first leg closes: on the arrival, or on the shared staging marker. */
const tail = (home: boolean): string =>
  home ? ", where it belongs" : ` ${HINT_SETTING_UP}`;

/** What a slide that a look explains does: it arrives, or it only stages the
 * tile, what `HINT_SETTING_UP` says elsewhere. The planner chose the move
 * among others as good, so the sentence says what it does (`effect`) rather
 * than that the look forces it. */
const arrives = (home: boolean, where = "there"): Narration =>
  home ? phrase`it belongs ${where}` : phrase`that sets it up`;

/** The slide as a step toward placing its tile: the tile is the aim, and the
 * planner, not a deduction, chose it. */
const working = (m: Marked, move: Narration): Sentence =>
  sentence({ aim: thisTile(m), move, relation: { kind: "serves" } });

export const say = {
  /** A later leg of the journey: it does not re-explain the why, since leg one
   * carried it and is still on screen, so it serves the same tile. */
  next: (m: Marked, home: boolean): Sentence =>
    working(
      m,
      phrase`take ${tile(m, "it")} on to ${place(m)}${home ? ", where it belongs" : ""}`,
    ),

  /** The tile sits in the source's row, striped. */
  rowFixed: (m: Marked, home: boolean): Sentence =>
    sentence({
      look: phrase`${thisLine(m, "row")} never slides`,
      follows: phrase`only a column move shifts ${thisTile(m)}`,
      move: phrase`take it to ${place(m)}`,
      relation: { kind: "effect", effect: arrives(home) },
    }),

  /** The tile sits in the source's column, striped. */
  colFixed: (m: Marked, home: boolean): Sentence =>
    sentence({
      look: phrase`${thisLine(m, "column")} never slides`,
      follows: phrase`only a row move shifts ${thisTile(m)}`,
      move: phrase`take it to ${place(m)}`,
      relation: { kind: "effect", effect: arrives(home) },
    }),

  // Stated, not argued: *why* the source is fixed is a rule, and rules live in
  // the help text. "Belongs beside the source" is itself the arrival, so the
  // arriving leg closes on it; a leg still on its way says so as its look and
  // closes on setting things up, so "belongs" is never said twice.
  besideSource: (m: Marked, home: boolean): Sentence =>
    home
      ? sentence({
          move: phrase`take ${thisTile(m)} to ${place(m)}`,
          relation: { kind: "effect", effect: arrives(true, "beside the source") },
        })
      : sentence({
          look: phrase`${thisTile(m)} belongs beside the source`,
          move: phrase`take it to ${place(m)}`,
          relation: { kind: "effect", effect: arrives(false) },
        }),

  working: (m: Marked, home: boolean): Sentence =>
    working(m, phrase`take it to ${place(m)}${tail(home)}`),
};
