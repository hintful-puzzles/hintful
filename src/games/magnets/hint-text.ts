/**
 * Every sentence the Magnets hint speaks, and every word inside one.
 *
 * The deduction decides *which* sentence and *with what values*
 * ([`hint.ts`](./hint.ts)'s `narrate`); this file decides only how it reads.
 * Values arrive as the board means them (a pole, an axis, a count), never as
 * words, and each fact arrives with the marks that show it: every word that
 * points at the board is a reference to its mark (`engine/hint-words.ts`). The
 * squares a step decides are ringed; the squares and clue digits it reasons
 * from are outlined, the digits whatever color the game paints them; the line
 * it counts along is striped.
 *
 * A line is "this row" or "this column", never a number: Magnets draws no line
 * numbers, and the hint marks the line's clue digits instead (docs/hints.md
 * § "Name elements by what the player can see").
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import { NEGATIVE, POSITIVE } from "./state.ts";

export type Axis = "row" | "column";

/** A row or column, as the solver names it. */
export interface LineEl {
  roworcol: number;
  num: number;
}

/** A square of the board, by index. */
export const SQUARE: MarkKind<number> = { name: "square", key: String };

/** A clue digit, by its index around the board (`clueIndex`). */
export const CLUE: MarkKind<number> = { name: "clue", key: String };

/** A row or column, clue slots included. */
export const LINE: MarkKind<LineEl> = {
  name: "line",
  key: (l) => `${l.roworcol}:${l.num}`,
};

/** Why a pole cannot go at a square, as the board shows it. */
export type Cause =
  /** The pole already at `at`, beside the square. */
  | { kind: "touch"; at: number }
  /** The line's clue for the pole is met, `marked` when only by counting the
   * marked magnets lying along it. `line` tells two ends' lines apart; `clue`
   * is the digit met, and `hatched` the line when it is the one striped. */
  | {
      kind: "full";
      axis: Axis;
      line: number;
      marked: boolean;
      clue: number;
      hatched: LineEl | null;
    };

/** Why a square of a counted line cannot take the line's pole, as what that
 * pole there would do: touch its own kind or exceed the square's line's clue, or
 * force the opposite pole on the other end into one of those. Each carries the
 * marks that show it: the pole touched, or the clue digit met. */
export type RuleOut =
  | { kind: "touch"; at: readonly number[] }
  | { kind: "full"; axis: Axis; clues: readonly number[] }
  | { kind: "partnerTouch"; at: readonly number[] }
  /** The other end's met line, by where it lies from the line the sentence
   * counts: that line itself, the one beside it, or one across it. Two
   * parallel lines are never both "a column", since the player has to tell
   * which one the hatch is. */
  | { kind: "partnerFull"; axis: Axis; place: LinePlace; clues: readonly number[] };

/** What an `onlyEndLeft` step concludes: `squares` squares of tiles
 * crossing the line, or one end of a tile lying along it, with why its far
 * end (`far`) cannot take the pole. */
export type OnlyEnd =
  | { kind: "crosses"; squares: number }
  | { kind: "along"; why: RuleOut; far: number };

/** Where a line lies from the counted one. */
export type LinePlace = "same" | "beside" | "across";

/** The marks a sentence about a line points at: the line, the clue digits it
 * counts with, and the squares the step decides. */
export interface LineMarks {
  line: LineEl;
  clues: readonly number[];
  targets: readonly number[];
}

/** The pole as the board draws it. */
const glyph = (pole: number): string => (pole === POSITIVE ? "+" : "−");

/** "+s", "−s". */
const glyphs = (pole: number): string => `${glyph(pole)}s`;

const other = (pole: number): number => (pole === POSITIVE ? NEGATIVE : POSITIVE);

/** "one more +", "3 more −s". */
const more = (n: number, pole: number): string =>
  n === 1 ? `one more ${glyph(pole)}` : `${n} more ${glyphs(pole)}`;

const ring = (els: readonly number[], words: string): Narration =>
  mark.as("ring", SQUARE, els, words);
const outlined = (els: readonly number[], words: string): Narration =>
  mark.as("outline", SQUARE, els, words);
const clue = (els: readonly number[], words: string): Narration =>
  mark.as("outline", CLUE, els, words);
/** The line the sentence counts along: "this row". */
const thisLine = (m: LineMarks, axis: Axis): Narration =>
  mark.as("stripes", LINE, [m.line], `this ${axis}`);
/** A line named by a cause, "row", striped when it is the one hatched: the
 * stripes legend's word for what it marks. */
const lineWord = (hatched: LineEl | null, axis: Axis): Narration | string =>
  hatched ? mark.as("stripes", LINE, [hatched], axis) : axis;

/** How a met count was met: a marked magnet lying along the line brings one +
 * and one − to it whichever way round it turns, and the help says so. */
const counting = (c: { marked: boolean }): string =>
  c.marked ? ", counting marked magnets" : "";

type Full = Cause & { kind: "full" };

/** "its row's clue", with the row striped when it is the one hatched. The clue
 * is drawn in a color, and the outline legend teaches its word. */
const itsClues = (
  hatched: LineEl | null,
  axis: Axis,
  clues: readonly number[],
  noun: string,
): Narration => phrase`its ${lineWord(hatched, axis)}'s ${clue(clues, noun)}`;

const itsClue = (c: Full): Narration => itsClues(c.hatched, c.axis, [c.clue], "clue");

/** Why `pole` cannot go at the square: "beside another +", "as its row already
 * has all its +s". */
function because(pole: number, c: Cause): Narration {
  if (c.kind === "touch")
    return phrase`beside ${outlined([c.at], `another ${glyph(pole)}`)}`;
  // "Already" gives way to the counting clause, which says the same thing.
  return phrase`as its ${lineWord(c.hatched, c.axis)} ${c.marked ? "" : "already "}has ${clue([c.clue], `all its ${glyphs(pole)}`)}${counting(c)}`;
}

/** What `pole` at a square would do: "touch a +", "exceed its row's clue". Two
 * premises in one sentence are said this way because "would exceed" is true
 * whether or not the count needs marked magnets to be met, so it needs no
 * counting clause to stay honest, and the help teaches that they count. */
const wouldBreak = (pole: number, c: Cause): Narration =>
  c.kind === "touch"
    ? phrase`touch ${outlined([c.at], `a ${glyph(pole)}`)}`
    : phrase`exceed ${itsClue(c)}`;

const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);

const orJoin = (said: readonly Narration[]): Narration =>
  said
    .slice(1)
    .reduce(
      (acc, s, i) => phrase`${acc}${i === said.length - 2 ? " or " : ", "}${s}`,
      said[0],
    );

/** What `pole` at a ruled-out square would do, over every reason of one kind:
 * "touch a +", "put one − too many in the column beside it or a row". "Too
 * many" and "exceed" hold whether or not the count is met only by counting
 * marked magnets, so neither needs a counting clause. A met line is named by
 * where it lies, and the words point at its clue, which is what the board
 * marks of it. */
function wouldDo(pole: number, rs: readonly RuleOut[]): Narration {
  const o = glyph(other(pole));
  const [first] = rs;
  const at = rs.flatMap((r) => ("at" in r ? r.at : []));
  const clues = rs.flatMap((r) => ("clues" in r ? r.clues : []));
  switch (first.kind) {
    case "touch":
      return phrase`touch ${outlined(at, `a ${glyph(pole)}`)}`;
    case "full":
      return phrase`exceed ${clue(clues, clues.length > 1 ? "a clue" : "its clue")}`;
    case "partnerTouch":
      return phrase`put a ${o} beside ${outlined(at, `a ${o}`)}`;
    // The clue its partner's pole would overrun is outlined, so the words
    // need not say which line it counts, nor which pole: `together` says the
    // same of both.
    case "partnerFull":
      return phrase`exceed ${clue(clues, "a clue")}`;
  }
}

/** Every distinct thing a pole would do across the ruled-out squares, one
 * clause per kind in a fixed order so one board always reads the same:
 * "touch a + or exceed its clue". Where both kinds of a family are there, the
 * pole's and its partner's, they are said as one, whose outlines say which:
 * "make like poles touch", "exceed a clue". Three reasons said kind by kind
 * cannot fit the narration limit beside the count (owner, 2026-10-18). */
function wouldDoAny(pole: number, rs: readonly RuleOut[]): Narration {
  const said: Narration[] = [];
  for (const [mine, partners] of FAMILIES) {
    const own = rs.filter((r) => r.kind === mine);
    const theirs = rs.filter((r) => r.kind === partners);
    if (own.length > 0 && theirs.length > 0)
      said.push(together(mine, [...own, ...theirs]));
    else if (own.length > 0) said.push(wouldDo(pole, own));
    else if (theirs.length > 0) said.push(wouldDo(pole, theirs));
  }
  return orJoin(said);
}
const FAMILIES: readonly (readonly [RuleOut["kind"], RuleOut["kind"]])[] = [
  ["touch", "partnerTouch"],
  ["full", "partnerFull"],
];

/** A family's two kinds said as one. */
function together(family: RuleOut["kind"], rs: readonly RuleOut[]): Narration {
  if (family === "touch")
    return phrase`make ${mark.as(
      "outline",
      SQUARE,
      rs.flatMap((r) => ("at" in r ? r.at : [])),
      "like poles",
    )} touch`;
  return phrase`exceed ${clue(
    rs.flatMap((r) => ("clues" in r ? r.clues : [])),
    "a clue",
  )}`;
}

/** "; a + in an outlined tile would …", or nothing when no empty square is ruled
 * out and the board's placed squares already say it all. `ruled` is the
 * squares the clause rules out, with the far halves of their tiles when the
 * step outlines them; `tiles` is how many tiles they make when the step
 * outlines each of them whole, and 0 when it does not: an outline the sentence
 * never names reads as the thing the sentence is about. */
const anywhereElse = (
  pole: number,
  rs: readonly RuleOut[],
  ruled: readonly number[],
  tiles: number,
): Narration | string =>
  rs.length === 0
    ? ""
    : phrase`; a ${glyph(pole)} ${outlined(ruled, where(tiles))} would ${wouldDoAny(pole, rs)}`;

/** Where the ruled-out squares are: "in an outlined tile", or "in an outlined
 * square" when the outlines do not make them tiles. */
const where = (tiles: number): string =>
  tiles === 0
    ? "in an outlined square"
    : tiles === 1
      ? "in the outlined tile"
      : "in an outlined tile";

/** The squares a line's other squares are ruled out by, as a count premise
 * cites them. */
export interface Elsewhere {
  why: readonly RuleOut[];
  ruled: readonly number[];
  tiles: number;
}

const NEUTRAL_WORDS = phrase`it must be neutral`;

/** "this row's clues", the clue digits a count reads, and the verb agreeing
 * with them: `verb` is its singular and plural. */
const itsLineClues = (
  m: LineMarks,
  axis: Axis,
  verb: readonly [string, string],
): Narration =>
  phrase`${thisLine(m, axis)}'s ${clue(m.clues, plural(m.clues.length, "clue", "clues"))} ${plural(m.clues.length, ...verb)}`;

/** "each ringed tile", which agrees with one tile or several. */
const eachTile = (targets: readonly number[]): Narration =>
  mark.the("ring", SQUARE, targets, "tile", "each");

/** "in the ringed square", where a pole must go. */
const inRinged = (targets: readonly number[]): Narration =>
  phrase`in ${ring(targets, "the ringed square")}`;

/** Where the poles a count needs go, the squares by name: "this square must
 * be +", "these 2 squares must be +s". */
const placed = (targets: readonly number[], pole: number): Narration =>
  targets.length === 1
    ? phrase`${ring(targets, "this square")} must be ${glyph(pole)}`
    : phrase`${ring(targets, `these ${targets.length} squares`)} must be ${glyphs(pole)}`;

export const say = {
  /** A marked magnet whose pole `banned` cannot go at this end, so the end
   * takes the other pole. `partner` is the magnet's other end. */
  magnetHere: (
    targets: readonly number[],
    partner: number,
    banned: number,
    cause: Cause,
  ): Sentence =>
    so({
      look: phrase`${outlined([partner], "This magnet")}'s ${ring(targets, "ringed end")} can't be ${glyph(banned)}, ${because(banned, cause)}`,
      move: phrase`it must be ${glyph(other(banned))}`,
    }),

  /** A marked magnet whose pole `banned` cannot go at the far end, so it goes
   * at this one. */
  magnetThere: (
    targets: readonly number[],
    partner: number,
    banned: number,
    cause: Cause,
  ): Sentence =>
    so({
      look: phrase`${outlined([partner], "This magnet's other end")} can't be ${glyph(banned)}, ${because(banned, cause)}`,
      move: phrase`${ring(targets, "the ringed end")} must be ${glyph(banned)}`,
    }),

  // A tile is a magnet or neutral, so "it can't be a magnet" would only
  // restate "it must be neutral".
  /** Both ends touch the same pole, at `a` and `b`. */
  bothEndsTouch: (
    targets: readonly number[],
    pole: number,
    at: readonly number[],
  ): Sentence =>
    so({
      look: phrase`Both ends of ${ring(targets, "this tile")} touch ${outlined(at, `a ${glyph(pole)}`)}`,
      move: NEUTRAL_WORDS,
    }),

  /** The tile lies along a line whose `pole` count is met: a magnet there
   * would add one more. */
  alongFull: (targets: readonly number[], pole: number, c: Full): Sentence =>
    so({
      look: phrase`${ring(targets, "This tile")} lies along a ${lineWord(c.hatched, c.axis)} with ${clue([c.clue], `all its ${glyphs(pole)}`)}${counting(c)}`,
      move: NEUTRAL_WORDS,
    }),

  /** Each end is in its own line of one axis, both with their `pole` count
   * met. */
  bothInFull: (targets: readonly number[], pole: number, a: Full, b: Full): Sentence =>
    so({
      look: phrase`Both ends of ${ring(targets, "this tile")} are in ${a.axis}s with ${clue([a.clue, b.clue], `all their ${glyphs(pole)}`)}${a.marked || b.marked ? ", counting marked magnets" : ""}`,
      move: NEUTRAL_WORDS,
    }),

  /** Neither end can take `pole`, for a different reason at each. */
  neitherEnd: (
    targets: readonly number[],
    pole: number,
    one: Cause,
    two: Cause,
  ): Sentence => {
    // The touch first, so a mixed pair always reads the same way round.
    const [a, b] = one.kind === "touch" ? [one, two] : [two, one];
    const what =
      a.kind === "full" && b.kind === "full"
        ? a.axis === b.axis
          ? phrase`exceed ${clue([a.clue, b.clue], `its ${a.axis}'s clue`)} at both ends`
          : // Two lines named, so neither is the one striped.
            phrase`exceed ${clue([a.clue], `its ${a.axis}'s clue`)} at one end and ${clue([b.clue], `its ${b.axis}'s`)} at the other`
        : phrase`${wouldBreak(pole, a)} at one end and ${wouldBreak(pole, b)} at the other`;
    return so({
      look: phrase`No ${glyph(pole)} fits in ${ring(targets, "this tile")}: it would ${what}`,
      move: NEUTRAL_WORDS,
    });
  },

  /** One end can take neither pole. */
  oneEndNeither: (targets: readonly number[], plus: Cause, minus: Cause): Sentence => {
    let why: Narration;
    if (plus.kind === "touch" && minus.kind === "touch") {
      why = phrase`it touches both ${outlined([plus.at], "a +")} and ${outlined([minus.at], "a −")}`;
    } else if (plus.kind === "full" && minus.kind === "full") {
      why =
        plus.axis === minus.axis
          ? phrase`a + or − would exceed ${itsClues(plus.hatched, plus.axis, [plus.clue, minus.clue], "clues")}`
          : phrase`a + would exceed ${itsClue(plus)}, and a − ${clue([minus.clue], `its ${minus.axis}'s`)}`;
    } else {
      const [touch, full, filled] =
        plus.kind === "touch"
          ? [plus, minus as Full, NEGATIVE]
          : [minus as Cause & { kind: "touch" }, plus as Full, POSITIVE];
      why = phrase`it touches ${outlined([touch.at], `a ${glyph(other(filled))}`)}, and a ${glyph(filled)} would exceed ${itsClue(full)}`;
    }
    return so({
      look: phrase`One end of ${ring(targets, "this tile")} can't be + or −: ${why}`,
      move: NEUTRAL_WORDS,
    });
  },

  /** Every empty square of the line needs a pole. */
  polesEverywhere: (m: LineMarks, axis: Axis): Sentence =>
    so({
      look: phrase`${itsLineClues(m, axis, ["needs", "need"])} a + or − in every one of its empty squares`,
      move: phrase`${eachTile(m.targets)} must be a magnet`,
    }),

  /** The line has room for one more neutral square: none of its tiles
   * lying along it can be neutral. */
  oneNeutralLeft: (m: LineMarks, axis: Axis, tiles: number): Sentence =>
    so({
      look: phrase`${itsLineClues(m, axis, ["leaves", "leave"])} room for just one more neutral square`,
      move: phrase`${ring(m.targets, plural(tiles, "the ringed tile", "each ringed tile"))} lying along it must be a magnet`,
    }),

  /** The line needs as many more `pole`s as it has undecided tiles. */
  everyDominoNeeded: (m: LineMarks, axis: Axis, pole: number, n: number): Sentence =>
    n === 1
      ? so({
          look: phrase`${thisLine(m, axis)} needs ${clue(m.clues, more(n, pole))} and has only ${ring(m.targets, "this undecided tile")}`,
          move: phrase`it must be a magnet`,
        })
      : so({
          look: phrase`${thisLine(m, axis)} needs ${clue(m.clues, more(n, pole))} and has only ${n} undecided tiles`,
          move: phrase`${eachTile(m.targets)} must be a magnet`,
        }),

  /** The line needs `n` more `pole`s and has exactly `n` squares that can
   * still take one; `elsewhere` is why each of its other empty squares
   * cannot. */
  lineExact: (
    m: LineMarks,
    axis: Axis,
    pole: number,
    n: number,
    elsewhere: Elsewhere,
  ): Sentence => {
    const rest = anywhereElse(pole, elsewhere.why, elsewhere.ruled, elsewhere.tiles);
    // Where every other empty square is ruled out by name, that leaves the
    // ringed ones, and the count need not say so too.
    if (rest !== "")
      return so({
        look: phrase`${thisLine(m, axis)} needs ${clue(m.clues, more(n, pole))}${rest}`,
        move: placed(m.targets, pole),
      });
    return n === 1
      ? so({
          look: phrase`${thisLine(m, axis)} needs ${clue(m.clues, more(n, pole))} and only ${ring(m.targets, "this square")} can take one${rest}`,
          move: phrase`it must be ${glyph(pole)}`,
        })
      : so({
          look: phrase`${thisLine(m, axis)} needs ${clue(m.clues, more(n, pole))} and only ${ring(m.targets, `these ${n} squares`)} can take one${rest}`,
          move: phrase`they must be ${glyphs(pole)}`,
        });
  },

  /** The line's clues are met, so every empty square in it is neutral: the
   * `neutralExact` premise with no marked magnet in the line to set aside. */
  noPolesLeft: (m: LineMarks, axis: Axis): Sentence =>
    so({
      look: phrase`${itsLineClues(m, axis, ["leaves", "leave"])} no room for another + or −`,
      move: phrase`${ring(m.targets, "all its empty squares")} must be neutral`,
    }),

  /** The line needs `n` more neutral squares and exactly `n` are not in
   * marked magnets, which are `marked`'s squares. */
  neutralExact: (
    m: LineMarks,
    axis: Axis,
    n: number,
    marked: readonly number[],
  ): Sentence =>
    n === 1
      ? so({
          look: phrase`${thisLine(m, axis)} needs ${clue(m.clues, "1 more neutral square")}; only ${ring(m.targets, "the ringed one")} isn't in ${mark.paren("outline", SQUARE, marked, "a marked magnet")}`,
          move: NEUTRAL_WORDS,
        })
      : so({
          look: phrase`${thisLine(m, axis)} needs ${clue(m.clues, `${n} more neutral squares`)}; only ${ring(m.targets, `these ${n}`)} aren't in ${mark.paren("outline", SQUARE, marked, "marked magnets")}`,
          move: phrase`they must be neutral`,
        }),

  /** Every empty square in the line holds a pole, alternating, with one more
   * `pole` than its opposite: only the one odd-length gap can supply it. */
  oddGap: (m: LineMarks, axis: Axis, pole: number): Sentence =>
    so({
      look: phrase`${thisLine(m, axis)}'s empty squares take alternating poles, ${clue(m.clues, `one more ${glyph(pole)} than ${glyph(other(pole))}`)}`,
      move: phrase`${ring(m.targets, "this odd-length gap")} must start with ${glyph(pole)}`,
    }),

  /** The line needs a `pole` from each tile that can still give one, and
   * `elsewhere` is why no other square of it can. `end`
   * is what the step concludes: the squares of the tiles crossing the line
   * (each its tile's only square in it), or one end of a tile lying along
   * it and why its far end cannot take the pole. */
  onlyEndLeft: (
    m: LineMarks,
    axis: Axis,
    pole: number,
    n: number,
    elsewhere: Elsewhere,
    end: OnlyEnd,
  ): Sentence => {
    // The count is of tiles, not squares: a tile lying along the line has
    // two open squares in it but gives it one pole.
    const need = clue(m.clues, more(n, pole));
    const head =
      n === 1
        ? phrase`${thisLine(m, axis)} needs ${need} from only ${ring(m.targets, "this tile")}`
        : phrase`${thisLine(m, axis)} needs ${need} from just ${n} tiles`;
    const rest = anywhereElse(pole, elsewhere.why, elsewhere.ruled, elsewhere.tiles);
    // A tile lying along the line takes a second sentence of look: the count
    // picks the tile, then its far end is ruled out to pick the end.
    if (end.kind === "along")
      return so({
        look: phrase`${head}${rest}. A ${glyph(pole)} at ${outlined([end.far], "its far end")} would ${wouldDoAny(pole, [end.why])}`,
        move: phrase`it must go ${inRinged(m.targets)}`,
      });
    return so({ look: phrase`${head}${rest}`, move: placed(m.targets, pole) });
  },
};
