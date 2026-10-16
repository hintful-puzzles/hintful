/**
 * Every sentence Same Game's hint speaks.
 *
 * Which sentence a removal gets is `hint.ts`'s to decide, from what it has
 * checked about the removal and its rivals; this file decides only how it
 * reads.
 */

import type { ColorWord } from "../../engine/color/color-word.ts";
import { TEN_NAMES } from "../../engine/color/colors.ts";
import type { HintMarkLegend } from "../../engine/game.ts";
import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Relation,
  type Sentence,
  sentence,
  unshaped,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A group, named as one thing over its squares. */
const GROUP = whole(CELL);

/** The word for color `c` (`1..ncols`), from the palette the tiles are
 * painted in, so the word and the square cannot disagree. */
export const colorName = (c: number): ColorWord => TEN_NAMES[c - 1];

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "the group to remove, edged on its inside so that it shows on a blue group too.",
    outline:
      "a square that is the last of its color, or that has no square of its color beside it (*the outlined square*); or the other groups that also keep the board clearable (*the outlined groups*).",
    stripes:
      "another group whose removal would leave the board so it can never be cleared (*the striped group*).",
  },
};

const thisGroup = (g: readonly Point[]): Narration =>
  mark.this("ring", GROUP, g, "group");
const remove = (g: readonly Point[]): Narration => phrase`remove ${thisGroup(g)}`;
const theRival = (r: readonly Point[]): Narration =>
  mark.the("stripes", GROUP, r, "group");
const theSquare = (p: Point): Narration => mark.the("outline", CELL, [p], "square");
/** Each outlined group a separate shape: two groups never share a color where
 * they touch, so the renderer outlines each on its own. */
const theGroups = (gs: readonly (readonly Point[])[]): Narration =>
  mark.as("outline", CELL, gs.flat(), () =>
    gs.length > 1 ? "the outlined groups" : "the outlined group",
  );

/**
 * Every sentence runs from what to look at to the move (docs/hints.md § "Lead
 * with the indication"). A trap is answered by the move as one way to avoid
 * it, since the other groups were never judged. Only `only`, where every
 * rival was proved to leave a board that can never be cleared, says the move
 * is forced; the relations of the four rival claims are the judging's own.
 */
export const say = {
  /** The removal that empties the board. */
  last: (g: readonly Point[]): Sentence =>
    sentence({
      move: remove(g),
      relation: { kind: "effect", effect: phrase`that clears the board` },
    }),

  /** The only group on the board. */
  none: (g: readonly Point[], relation: Relation): Sentence =>
    sentence({ look: phrase`There is no other group`, move: remove(g), relation }),

  /** A rival leaves `victim` the last square of color `c`. */
  lastOfColor: (
    g: readonly Point[],
    rival: readonly Point[],
    victim: Point,
    c: number,
  ): Sentence =>
    sentence({
      look: phrase`Removing ${theRival(rival)} would leave ${theSquare(victim)} the last ${colorName(c)} one`,
      move: remove(g),
      relation: { kind: "answers", how: "One way to avoid it" },
    }),

  /** A rival leaves no two squares of one color side by side. */
  stuck: (g: readonly Point[], rival: readonly Point[]): Sentence =>
    sentence({
      look: phrase`Removing ${theRival(rival)} would leave no two touching squares of one color`,
      move: remove(g),
      relation: { kind: "answers", how: "One way to avoid it" },
    }),

  /** Every rival was searched to the end, and none leaves a board that can be
   * cleared. */
  only: (g: readonly Point[], relation: Relation): Sentence =>
    sentence({
      look: phrase`Removing any other group would leave a board that can never be cleared`,
      move: remove(g),
      relation,
    }),

  /** Every rival was settled: `goods` leave a board that can be cleared, the
   * rest do not. */
  onlyThese: (
    g: readonly Point[],
    goods: readonly (readonly Point[])[],
    relation: Relation,
  ): Sentence =>
    sentence({
      look: phrase`Only ${thisGroup(g)} and ${theGroups(goods)} keep the board clearable`,
      move: remove(g),
      relation,
    }),

  /** `goods` leave a board that can be cleared, at least one rival does not,
   * and some were not settled. */
  alsoThese: (
    g: readonly Point[],
    goods: readonly (readonly Point[])[],
    relation: Relation,
  ): Sentence =>
    sentence({
      look: phrase`${thisGroup(g)} and ${theGroups(goods)} keep the board clearable; some others do not`,
      move: remove(g),
      relation,
    }),

  /** Every rival leaves a board that can still be cleared. */
  anyGroup: (g: readonly Point[], relation: Relation): Sentence =>
    sentence({
      look: phrase`Removing any group here keeps the board clearable`,
      move: remove(g),
      relation,
    }),

  /** `lone` has no square of its color beside it, and removing the group
   * brings one beside it. */
  joins: (g: readonly Point[], lone: Point, c: number): Sentence =>
    sentence({
      look: phrase`${theSquare(lone)} has no ${colorName(c)} square beside it`,
      move: remove(g),
      relation: { kind: "answers", how: "One way to bring one beside it" },
    }),

  /** Nothing settled worth saying. That the board can still be cleared after
   * it goes without saying: the hint offers no other kind of removal. */
  plain: (g: readonly Point[]): Sentence =>
    unshaped(phrase`Remove ${thisGroup(g)}.`, "bare"),
};
