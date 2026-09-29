/**
 * Every sentence Slant's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`hint.ts`'s
 * `narrate` and `vClause`); this file decides only how it reads: indication
 * first, the necessity voice, terse. Every word that points at the board is a
 * reference to the mark it points at (`engine/hint-words.ts`): the squares a
 * step decides and the same-slant mark it places are ringed, and the clues,
 * squares and marks it reasons from are outlined.
 */

import { CELL, mark, type Narration, phrase } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { SlantMark } from "./hint.ts";
import { ALIKE, CLUE } from "./hint-marks.ts";

/** How a slant reads, by its sign. */
const slashWord = (v: number): string => (v < 0 ? "a backslash" : "a forward slash");

const lines = (n: number): string =>
  n === 0 ? "no line" : n === 1 ? "one line" : `${n} lines`;

/** The squares a step decides: this leg's and the rest of its firing's. */
const decided = (cells: readonly Point[]): Narration =>
  mark.this("ring", CELL, cells, "square");

/** "it" or "they", for the squares a step decides. */
const subject = (cells: readonly Point[]): string => (cells.length > 1 ? "they" : "it");

/** A same-slant mark the step places, as the pair it joins. */
const joined = (m: SlantMark, words: string): Narration =>
  mark.as("ring", ALIKE, [m], words);

/** A clue the step reads, by its value and where it sits. */
const clueAt = (pts: readonly Point[], words: string): Narration =>
  mark.as("outline", CLUE, pts, words);

/** Squares the step reads, in the words the sentence gives them. */
const squaresAs = (cells: readonly Point[], words: string): Narration =>
  mark.as("outline", CELL, cells, words);

/**
 * What a clue already has from what the step reads: the same-slant pair it
 * counts as one line (`pair`, the marks joining it), and the decided squares
 * around it (`area`, of which `touching` touch it). Null when it reads
 * neither.
 */
export interface ClueSources {
  pair: readonly SlantMark[] | null;
  area: readonly Point[];
  touching: number;
}

/** The lines a clue has, by source; `both` when it names two, which leaves
 * the sentence room for little else. */
function has(src: ClueSources): { got: Narration; both: boolean } | null {
  const pair = src.pair?.length
    ? phrase`one line from ${mark.as("outline", ALIKE, src.pair, src.pair.length > 1 ? "its chained pair" : "its marked pair")}`
    : null;
  if (!src.area.length) return pair && { got: pair, both: false };
  const outlined = mark.the("outline", CELL, src.area, "square");
  if (!pair)
    return { got: phrase`${lines(src.touching)} from ${outlined}`, both: false };
  const n =
    src.touching === 0 ? "none" : src.touching === 1 ? "one" : `${src.touching}`;
  return { got: phrase`${pair} and ${n} from ${outlined}`, both: true };
}

export const say = {
  // Continuation legs belong to a clue firing (only clue firings force
  // several squares); keep them in the necessity voice.
  /** A later square forced by the same clue; `away` when it slants away. */
  continuation: (
    clue: Point,
    area: readonly Point[],
    cells: readonly Point[],
    away: boolean,
  ): Narration => {
    const same = clueAt([clue], "the same clue").capitalized();
    const toward = away ? "away" : "toward the clue";
    return area.length
      ? phrase`${same}, with ${mark.the("outline", CELL, area, "square")}, forces ${decided(cells)} too, so ${subject(cells)} must slant ${toward}.`
      : phrase`${same} forces ${decided(cells)} too, so ${subject(cells)} must slant ${toward}.`;
  },

  /** A clue `c` still short of diagonals, needing one from each of `cells`. */
  clueFill: (
    clue: Point,
    c: number,
    src: ClueSources,
    cells: readonly Point[],
  ): Narration => {
    const it = mark.this("outline", CLUE, [clue], `${c} clue`).capitalized();
    const held = has(src);
    if (held === null)
      return c === 4
        ? phrase`${it} must be touched by all four diagonals, so ${decided(cells)} must slant toward it.`
        : phrase`${it} needs a line from every square around it, so ${decided(cells)} must slant toward it.`;
    return held.both
      ? phrase`${it} has ${held.got}, so ${decided(cells)} must slant toward it.`
      : phrase`${it} has ${held.got} and needs ${cells.length} more, so ${decided(cells)} must slant toward it.`;
  },

  /** A clue `c` already touched by all its diagonals. */
  clueEmpty: (
    clue: Point,
    c: number,
    src: ClueSources,
    cells: readonly Point[],
  ): Narration => {
    const it = mark.this("outline", CLUE, [clue], `${c} clue`).capitalized();
    if (c === 0)
      return src.area.length
        ? phrase`${it} is touched by no diagonals, so ${decided(cells)} must slant away from it, like ${mark.the("outline", CELL, src.area, "square")}.`
        : phrase`${it} is touched by no diagonals, so ${decided(cells)} must slant away from it.`;
    const held = has(src);
    if (held === null) throw new Error("slant hint: a full clue with no lines");
    return held.both
      ? phrase`${it} has ${held.got}, so ${decided(cells)} must slant away.`
      : phrase`${it} already has ${held.got}, so ${decided(cells)} must slant away from it.`;
  },

  loop: (cell: Point, area: readonly Point[]): Narration =>
    phrase`Diagonals in ${mark.the("outline", CELL, area, "square")} join two corners of ${decided([cell])}, so it must slant the other way to avoid a loop.`,

  deadend: (cell: Point, area: readonly Point[]): Narration =>
    phrase`${mark.the("outline", CELL, area, "square").capitalized()} ${area.length > 1 ? "leave" : "leaves"} two corners of ${decided([cell])} one way out each, so it must slant the other way or seal a loop.`,

  /** A square whose same-slant partner `anchor`, holding `v`, is already
   * placed, joined to it by `marks`. */
  equiv: (
    cell: Point,
    anchor: Point,
    v: number,
    marks: readonly SlantMark[],
  ): Narration => {
    const by = mark.the("outline", ALIKE, marks, "mark").capitalized();
    return phrase`${by} ${marks.length > 1 ? "link" : "links"} ${decided([cell])} to ${mark.the("outline", CELL, [anchor], "square")}, so it must be ${slashWord(v)} too.`;
  },

  // --- the same-slant mark, placed as a step -----------------------------

  // "From just these two" is the premise: exactly one of two squares side by
  // side around a point touches it only when they slant the same way.
  /** Two squares around a clue `c` that must share its one remaining line. */
  markClue: (clue: Point, c: number, src: ClueSources, m: SlantMark): Narration => {
    const it = mark.this("outline", CLUE, [clue], `${c} clue`).capitalized();
    const held = has(src);
    return held === null
      ? phrase`${it} needs one line, from just ${joined(m, "these two squares")}, so they must slant the same way.`
      : phrase`${it} has ${held.got} and needs ${c > 1 ? "one more" : "one"} from ${joined(m, "these two")}, so they must slant the same way.`;
  },

  /** Two side-by-side squares with both v-shapes ruled out, by one clause
   * each or by one `vBoth` for both. */
  markV: (m: SlantMark, clauses: Narration[]): Narration => {
    const both =
      clauses.length === 1 ? clauses[0] : phrase`${clauses[0]}, or both ${clauses[1]}`;
    return phrase`${joined(m, "these two").capitalized()} can't both ${both}, so they must slant the same way.`;
  },

  // A v-shape clause says what the pair can't both do at one end of its
  // shared side: touch it, or (which rules out the other v-shape) slant away
  // from it. `where` places that end: "above", "on the left", and so on.
  vClause: {
    one: (pt: Point, where: string): Narration =>
      phrase`touch ${clueAt([pt], `the 1 ${where}`)}`,
    three: (pt: Point, where: string): Narration =>
      phrase`slant away from ${clueAt([pt], `the 3 ${where}`)}`,
    /** One of the pair is placed and misses the corner `where`. */
    placed: (where: string): Narration =>
      phrase`touch the corner ${where}, as one already slants away from it`,
    /**
     * Across a 2 `where`: the pair across it gives it at least one line
     * (`touch`: so these two can't both touch it) or at most one (so they
     * can't both slant away from it), because of `end` at the far side. The
     * far side is `beyond`: the pairs across the 2s after this one, the 2s
     * themselves (a line of them, each passing it on, when there are any),
     * and the 1 or 3 that caps them, if a clue does.
     */
    across: (
      touch: boolean,
      two: Point,
      where: string,
      end: "one" | "three" | "touches" | "misses",
      beyond: Beyond,
    ): Narration => {
      const the2 = clueAt([two], `the 2 ${where}`);
      const head = touch ? phrase`touch ${the2}` : phrase`slant away from ${the2}`;
      const line = beyond.twos.length > 0;
      const pair = line
        ? phrase`along ${clueAt(beyond.twos, "the 2s beyond it")}, the last of ${squaresAs(beyond.pairs, "their pairs")}`
        : squaresAs(beyond.pairs, "the pair across it");
      const one = line
        ? phrase`along ${clueAt(beyond.twos, "the 2s beyond it")}, one of the last of ${squaresAs(beyond.pairs, "their pairs")}`
        : phrase`one of ${squaresAs(beyond.pairs, "the pair across it")}`;
      const it = line ? "the last 2" : "it";
      const cap = (d: string): Narration =>
        beyond.cap ? clueAt([beyond.cap], `the ${d}`) : phrase`the ${d}`;
      const why = {
        one: () => phrase`${pair} can't both touch ${cap("1")}`,
        three: () => phrase`${pair} can't both slant away from ${cap("3")}`,
        touches: () => phrase`${one} already touches ${it}`,
        misses: () => phrase`${one} already slants away from ${it}`,
      }[end]();
      return phrase`${head}, as ${why}`;
    },
  },

  /**
   * A pair on a straight line of 2s (`twos`) capped at each end by the same
   * kind of limit (the help's "Lines of 2s"): a 1, or a placed diagonal meeting
   * the 2 at that end, for `one`; a 3, or a diagonal missing it, otherwise.
   * `caps` are the clues that cap it, and `pairs` the pairs across its 2s.
   */
  vLine: (
    m: SlantMark,
    twos: readonly Point[],
    pairs: readonly Point[],
    one: boolean,
    caps: readonly Point[],
  ): Narration => {
    const digit = one ? "1" : "3";
    const diagonal = one ? "meeting" : "missing";
    const single = twos.length === 1;
    const it = single ? "it" : caps.length === 0 ? "the end 2s" : "the end 2";
    const capWords =
      caps.length === 2
        ? clueAt(caps, `two ${digit}s`)
        : caps.length === 0
          ? phrase`two diagonals ${diagonal} ${it}`
          : phrase`${clueAt(caps, `a ${digit}`)} and a diagonal ${diagonal} ${it}`;
    const head = mark.this("outline", CLUE, twos, "2").capitalized();
    const theirs = squaresAs(pairs, single ? "its pair" : "their pairs");
    return phrase`${head} and ${theirs} line up between ${capWords}, so ${joined(m, "these two")} must slant the same way.`;
  },

  /**
   * Both v-shapes carried across one 2, from the pair across it (`pair`): a
   * diagonal of that pair already `touches` the 2 (so it gives one line) or
   * misses it (so at most one), and what lies beyond the pair supplies the
   * other bound, either `end` directly or along more 2s.
   */
  vAcross: (
    m: SlantMark,
    two: Point,
    pair: readonly Point[],
    touches: boolean,
    end: "one" | "three" | "touches" | "misses",
    beyond: Beyond,
  ): Narration => {
    const cap =
      end === "one" || end === "three"
        ? beyond.cap
          ? clueAt([beyond.cap], end === "one" ? "a 1" : "a 3")
          : phrase`${end === "one" ? "a 1" : "a 3"}`
        : phrase`a diagonal ${end === "touches" ? "meeting" : "missing"} the end 2`;
    const far =
      beyond.twos.length === 0
        ? phrase`${cap} beyond`
        : phrase`${clueAt(beyond.twos, "2s")} and ${squaresAs(beyond.pairs, "their pairs")} beyond ending in ${cap}`;
    const bounds = touches
      ? phrase`gives it one line and, with ${far}, no more`
      : phrase`gives it at most one line and, with ${far}, at least one`;
    return phrase`${squaresAs(pair, "The pair across")} ${mark.this("outline", CLUE, [two], "2")} ${bounds}, so ${joined(m, "these two")} must slant the same way.`;
  },

  /** Both v-shapes ruled out by the same kind of clue, one at each end. */
  vBoth: (digit: number, pts: readonly Point[]): Narration =>
    digit === 1
      ? phrase`touch ${clueAt(pts, "either 1")}`
      : phrase`slant away from ${clueAt(pts, "either 3")}`,
};

/** What lies beyond a 2 along a line of them: the 2s after it, the pairs
 * across those, and the clue capping the line, when one does. */
export interface Beyond {
  twos: readonly Point[];
  pairs: readonly Point[];
  cap: Point | null;
}
