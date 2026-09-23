/**
 * Every sentence the Magnets hint speaks, and every word inside one.
 *
 * The deduction decides *which* sentence and *with what values*
 * ([`hint.ts`](./hint.ts)'s `narrate`); this file decides only how it reads.
 * Values arrive as the board means them (a pole, an axis, a count), never as
 * words.
 *
 * A line is "this row" or "this column", never a number: Magnets draws no line
 * numbers, and the hint marks the line's clue digits instead (docs/games/hints.md
 * § "Name elements by what the player can see").
 */

import { NEGATIVE, POSITIVE } from "./state.ts";

export type Axis = "row" | "column";

/** Why a pole cannot go at a square, as the board shows it. */
export type Cause =
  | { kind: "touch" }
  /** The line's clue for the pole is met, `marked` when only by counting the
   * marked magnets lying along it. `line` tells two ends' lines apart. */
  | { kind: "full"; axis: Axis; line: number; marked: boolean };

/** Why a square of a counted line cannot take the line's pole, as what that
 * pole there would do: touch its own kind or overfill the square's line, or
 * force the opposite pole on the other end into one of those. */
export type RuleOut =
  | { kind: "touch" }
  | { kind: "full"; axis: Axis }
  | { kind: "partnerTouch" }
  /** The other end's met line, by where it lies from the line the sentence
   * counts: that line itself, the one beside it, or one across it. Two
   * parallel lines are never both "a column", since the player has to tell
   * which one the hatch is. */
  | { kind: "partnerFull"; axis: Axis; place: LinePlace };

/** Where a line lies from the counted one. */
export type LinePlace = "same" | "beside" | "across";

/** The pole as the board draws it. */
const glyph = (pole: number): string => (pole === POSITIVE ? "+" : "−");

/** "+s", "−s". */
const glyphs = (pole: number): string => `${glyph(pole)}s`;

const other = (pole: number): number => (pole === POSITIVE ? NEGATIVE : POSITIVE);

/** "one more +", "3 more −s". */
const more = (n: number, pole: number): string =>
  n === 1 ? `one more ${glyph(pole)}` : `${n} more ${glyphs(pole)}`;

/** Whose line a clause is about: the square the sentence is on, or the far end. */
type Where = "here" | "there";

/** How a met count was met: a marked magnet lying along the line brings one +
 * and one − to it whichever way round it turns, and the help says so. */
const counting = (c: { marked: boolean }): string =>
  c.marked ? ", counting marked magnets" : "";

/** Why `pole` cannot go at the square: "beside another +", "as its row already
 * has all its +s". */
function because(pole: number, c: Cause, where: Where): string {
  if (c.kind === "touch") return `beside another ${glyph(pole)}`;
  const whose = where === "here" ? `as its ${c.axis}` : `whose ${c.axis}`;
  // "Already" gives way to the counting clause, which says the same thing.
  return `${whose} ${c.marked ? "" : "already "}has all its ${glyphs(pole)}${counting(c)}`;
}

/** What `pole` at a square would do: "touch a +", "overfill its row". Two
 * premises in one sentence are said this way because "would overfill" is true
 * whether or not the count needs marked magnets to be met, so it needs no
 * counting clause to stay honest, and the help teaches that they count. */
const wouldBreak = (pole: number, c: Cause): string =>
  c.kind === "touch" ? `touch a ${glyph(pole)}` : `overfill its ${c.axis}`;

const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);

/** "row", "column", or "row or column" when a reason holds along both. */
const axesWord = (axes: ReadonlySet<Axis>): string =>
  axes.size === 2 ? "row or column" : [...axes][0];

/** A met line named from the counted one: "this column", "the column beside
 * it", "a row". */
const placed = (axis: Axis, place: LinePlace): string =>
  place === "same"
    ? `this ${axis}`
    : place === "beside"
      ? `the ${axis} beside it`
      : `a ${axis}`;

const orList = (said: readonly string[]): string =>
  said.length === 1
    ? said[0]
    : `${said.slice(0, -1).join(", ")} or ${said[said.length - 1]}`;

/** What `pole` at a ruled-out square would do, over every reason of one kind:
 * "touch a +", "put one − too many in the column beside it or a row". "Too
 * many" and "overfill" hold whether or not the count is met only by counting
 * marked magnets, so neither needs a counting clause. */
function wouldDo(pole: number, rs: readonly RuleOut[]): string {
  const o = glyph(other(pole));
  const [first] = rs;
  switch (first.kind) {
    case "touch":
      return `touch a ${glyph(pole)}`;
    case "full":
      return `overfill its ${axesWord(new Set(rs.flatMap((r) => ("axis" in r ? [r.axis] : []))))}`;
    case "partnerTouch":
      return `put a ${o} beside a ${o}`;
    case "partnerFull": {
      const has = (place: LinePlace) =>
        rs.some((r) => r.kind === "partnerFull" && r.place === place);
      const lines = PLACES.flatMap((place) => {
        const at = rs.find((r) => r.kind === "partnerFull" && r.place === place);
        if (!at || at.kind !== "partnerFull") return [];
        // After "this column", its neighbor is "the one beside it".
        if (place === "beside" && has("same")) return ["the one beside it"];
        return [placed(at.axis, place)];
      });
      return `put one ${o} too many in ${orList(lines)}`;
    }
  }
}
const PLACES: readonly LinePlace[] = ["same", "beside", "across"];

/** Every distinct thing a pole would do across the ruled-out squares, one
 * clause per kind in a fixed order so one board always reads the same:
 * "touch a + or overfill its row". */
function wouldDoAny(pole: number, rs: readonly RuleOut[]): string {
  const said: string[] = [];
  for (const kind of KINDS) {
    const ofKind = rs.filter((r) => r.kind === kind);
    if (ofKind.length > 0) said.push(wouldDo(pole, ofKind));
  }
  return orList(said);
}
const KINDS: readonly RuleOut["kind"][] = [
  "touch",
  "full",
  "partnerTouch",
  "partnerFull",
];

/** "; a + anywhere else would …", or nothing when no empty square is ruled
 * out and the board's placed squares already say it all. */
const anywhereElse = (pole: number, rs: readonly RuleOut[]): string =>
  rs.length === 0
    ? ""
    : `; a ${glyph(pole)} anywhere else would ${wouldDoAny(pole, rs)}`;

type Full = Cause & { kind: "full" };

export const say = {
  /** A marked magnet whose pole `banned` cannot go at this end, so the end
   * takes the other pole. */
  magnetHere: (banned: number, cause: Cause): string =>
    `This magnet's ${glyph(banned)} can't go here, ${because(banned, cause, "here")}, so this end must be ${glyph(other(banned))}.`,

  /** A marked magnet whose pole `banned` cannot go at the far end, so it goes
   * at this one. */
  magnetThere: (banned: number, cause: Cause): string =>
    `This magnet's ${glyph(banned)} can't go at the other end, ${because(banned, cause, "there")}, so it must go here.`,

  /** Both ends touch the same pole. */
  bothEndsTouch: (pole: number): string =>
    `Both ends of this domino touch a ${glyph(pole)}, so it can't be a magnet: it must be neutral.`,

  /** The domino lies along a line whose `pole` count is met: a magnet there
   * would add one more. */
  alongFull: (pole: number, c: Full): string =>
    `This domino lies along a ${c.axis} with all its ${glyphs(pole)}${counting(c)}, so it can't be a magnet: it must be neutral.`,

  /** Each end is in its own line of one axis, both with their `pole` count
   * met. */
  bothInFull: (pole: number, a: Full, b: Full): string =>
    a.marked || b.marked
      ? `Both ends of this domino are in ${a.axis}s with all their ${glyphs(pole)}, counting marked magnets, so it must be neutral.`
      : `Both ends of this domino are in ${a.axis}s with all their ${glyphs(pole)}, so it can't be a magnet: it must be neutral.`,

  /** Neither end can take `pole`, for a different reason at each. */
  neitherEnd: (pole: number, one: Cause, two: Cause): string => {
    // The touch first, so a mixed pair always reads the same way round.
    const [a, b] = one.kind === "touch" ? [one, two] : [two, one];
    const what =
      a.kind === "full" && b.kind === "full"
        ? `overfill its ${a.axis} at one end and its ${b.axis} at the other`
        : `${wouldBreak(pole, a)} at one end and ${wouldBreak(pole, b)} at the other`;
    return `This domino can't hold a ${glyph(pole)}: it would ${what}, so it must be neutral.`;
  },

  /** One end can take neither pole. */
  oneEndNeither: (plus: Cause, minus: Cause): string => {
    let why: string;
    if (plus.kind === "touch" && minus.kind === "touch") {
      why = "it touches both a + and a −";
    } else if (plus.kind === "full" && minus.kind === "full") {
      why =
        plus.axis === minus.axis
          ? `a + or − there would overfill its ${plus.axis}`
          : `a + there would overfill its ${plus.axis}, and a − its ${minus.axis}`;
    } else {
      const [touched, filled] =
        plus.kind === "touch" ? [POSITIVE, NEGATIVE] : [NEGATIVE, POSITIVE];
      const full = (plus.kind === "full" ? plus : minus) as Full;
      why = `it touches a ${glyph(touched)}, and a ${glyph(filled)} there would overfill its ${full.axis}`;
    }
    return `One end of this domino can't be + or −: ${why}. It must be neutral.`;
  },

  /** Every empty square of the line needs a pole. */
  polesEverywhere: (axis: Axis): string =>
    `This ${axis}'s clues need a + or − in every one of its empty squares, so each domino there must be a magnet.`,

  /** The line has room for one more neutral square: none of its dominoes
   * lying along it can be neutral. */
  oneNeutralLeft: (axis: Axis, dominoes: number): string =>
    `This ${axis} has room for just one more neutral square, so ${plural(dominoes, "this domino", "these dominoes")} lying along it must be ${plural(dominoes, "a magnet", "magnets")}.`,

  /** The line needs as many more `pole`s as it has undecided dominoes. */
  everyDominoNeeded: (axis: Axis, pole: number, n: number): string =>
    n === 1
      ? `This ${axis} needs ${more(n, pole)} and has only this undecided domino, so it must be a magnet.`
      : `This ${axis} needs ${more(n, pole)} and has only ${n} undecided dominoes, so each must be a magnet.`,

  /** The line needs `n` more `pole`s and has exactly `n` squares that can
   * still take one; `elsewhere` is why each of its other empty squares
   * cannot. */
  lineExact: (
    axis: Axis,
    pole: number,
    n: number,
    elsewhere: readonly RuleOut[],
  ): string =>
    n === 1
      ? `This ${axis} needs ${more(n, pole)} and only this square can still take one${anywhereElse(pole, elsewhere)}, so it must be ${glyph(pole)}.`
      : `This ${axis} needs ${more(n, pole)} and only these ${n} squares can still take one${anywhereElse(pole, elsewhere)}, so they must be ${glyphs(pole)}.`,

  /** The line's clues are met, so every empty square in it is neutral: the
   * `neutralExact` premise with no marked magnet in the line to set aside. */
  noPolesLeft: (axis: Axis): string =>
    `This ${axis}'s clues leave no room for another + or −, so all its empty squares must be neutral.`,

  /** The line needs `n` more neutral squares and exactly `n` are not in
   * marked magnets. */
  neutralExact: (axis: Axis, n: number): string =>
    n === 1
      ? `This ${axis} needs one more neutral square and only this one isn't in a marked magnet, so it must be neutral.`
      : `This ${axis} needs ${n} more neutral squares and only these ${n} aren't in marked magnets, so they must be neutral.`,

  /** Every empty square in the line holds a pole, alternating, with one more
   * `pole` than its opposite: only the one odd-length gap can supply it. */
  oddGap: (axis: Axis, pole: number): string =>
    `This ${axis}'s empty squares take alternating poles, one more ${glyph(pole)} than ${glyph(other(pole))}: this odd-length gap must start with ${glyph(pole)}.`,

  /** The line needs a `pole` from each domino that can still give one, and
   * `elsewhere` is why no other square of it can. `otherEnd` is why a domino
   * lying along the line cannot take it at its far end, and `null` for one
   * crossing the line, which has only this square in it. */
  onlyEndLeft: (
    axis: Axis,
    pole: number,
    n: number,
    elsewhere: readonly RuleOut[],
    otherEnd: RuleOut | null,
  ): string => {
    const head =
      n === 1
        ? `This ${axis} needs ${more(n, pole)} and only this domino can still give it`
        : `This ${axis} needs ${more(n, pole)} and just ${n} dominoes can still give one`;
    const tail =
      otherEnd === null
        ? `, so this square must be ${glyph(pole)}.`
        : `. At its other end a ${glyph(pole)} would ${wouldDoAny(pole, [otherEnd])}, so this end must be ${glyph(pole)}.`;
    return `${head}${anywhereElse(pole, elsewhere)}${tail}`;
  },
};
