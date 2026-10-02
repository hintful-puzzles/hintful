/**
 * Every sentence Mines' hint speaks.
 *
 * `hint.ts` decides which sentence and with what squares; this file decides
 * only how it reads: the pattern first, then why it forces the move, then the
 * conclusion in the necessity voice (docs/games/hints.md § "Writing the
 * narration"). Each deduction is written as a **premise**, and the sentence
 * ends on whichever conclusion the step's leg acts on: the ringed squares are
 * mines, are safe, or carry a flag that must come off.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the squares the step decides are ringed; the
 * numbers it reasons from, and the mines they already touch, are outlined; and
 * the one set of squares the reasoning treats as a whole (the squares two
 * numbers share, a number's squares beyond another's, the squares a count
 * covers) is striped. A number is named by its value, and two outlined numbers
 * of one value by where they sit, so "the outlined 1" always means one square.
 */

import {
  CELL,
  mark,
  Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A number the sentence names: where it is and its value. */
export interface Clue {
  readonly at: Point;
  readonly value: number;
}

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth"];

/** The words that tell apart outlined numbers of one value: upper and lower,
 * or left and right, for two; their order from the top or the left for more. */
function qualifiers(clues: readonly Clue[]): Map<string, string> {
  const key = (c: Clue): string => `${c.at.x},${c.at.y}`;
  const out = new Map<string, string>();
  const byValue = new Map<number, Clue[]>();
  for (const c of clues) {
    const same = byValue.get(c.value) ?? [];
    if (!same.some((s) => key(s) === key(c))) same.push(c);
    byValue.set(c.value, same);
  }
  for (const same of byValue.values()) {
    if (same.length < 2) continue;
    const vertical = new Set(same.map((c) => c.at.y)).size === same.length;
    const sorted = [...same].sort((p, q) =>
      vertical ? p.at.y - q.at.y : p.at.x - q.at.x || p.at.y - q.at.y,
    );
    sorted.forEach((c, i) => {
      if (same.length === 2)
        out.set(
          key(c),
          vertical ? (i === 0 ? "upper" : "lower") : i === 0 ? "left" : "right",
        );
      else
        out.set(
          key(c),
          `${ORDINALS[i] ?? `${i + 1}th`} from the ${vertical ? "top" : "left"}`,
        );
    });
  }
  return out;
}

const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);
const minesWord = (n: number): string => `${n} ${plural(n, "mine", "mines")}`;

/** The references one step's sentence makes, built over every number it names
 * so that two of one value are told apart. */
export class Words {
  private readonly names: Map<string, string>;

  constructor(clues: readonly Clue[]) {
    this.names = qualifiers(clues);
  }

  private label(c: Clue): string {
    const q = this.names.get(`${c.at.x},${c.at.y}`);
    if (q === undefined) return `outlined ${c.value}`;
    return q.includes(" from ")
      ? `outlined ${c.value} ${q}`
      : `${q} outlined ${c.value}`;
  }

  /** "the outlined 3", "the upper outlined 1". */
  clue(c: Clue): Narration {
    return mark.as("outline", CELL, [c.at], `the ${this.label(c)}`);
  }

  /** "the outlined 3's". */
  clues(c: Clue): Narration {
    return mark.as("outline", CELL, [c.at], `the ${this.label(c)}'s`);
  }
}

/** A deduction, said up to the point where it concludes. */
export interface Premise {
  /** Words that end before the conclusion: "the outlined 2 already touches
   * both its mines (outlined)". */
  readonly words: Narration;
  /** What it proves about the ringed squares when nothing else is said. */
  readonly proves: "safe" | "mine";
}

/** "the ringed squares must be safe" / "… must be a mine" / "… must all be
 * mines", agreeing with the ringed squares however a followed step has
 * re-counted them. */
function conclusion(at: readonly Point[], kind: "safe" | "mine"): Narration {
  return mark.as("ring", CELL, at, (els) => {
    const one = els.length === 1;
    const subject = one ? "the ringed square" : "the ringed squares";
    if (kind === "safe") return `${subject} must be safe`;
    return one ? `${subject} must be a mine` : `${subject} must all be mines`;
  });
}

const capital = (n: Narration): Narration => n.capitalized();

/** The step's sentence: the premise, then what it makes of the ringed squares. */
export const conclude = {
  /** "…, so the ringed squares must be safe." / "… must all be mines." */
  plain: (
    p: Premise,
    ring: readonly Point[],
    kind: "safe" | "mine" = p.proves,
  ): Sentence => so({ look: p.words, move: conclusion(ring, kind) }),
};

export const say = {
  /** No board yet: the generator lays the mines out around the first square
   * opened, never in it or beside it. */
  firstClick: (at: Point): Sentence =>
    so({
      look: phrase`no mine is ever laid in the first square you open or beside it`,
      follows: phrase`${mark.this("ring", CELL, [at], "square")} can't hold one`,
      move: phrase`open it to begin`,
    }),

  /** Back at the start of a board already laid out: its first square is drawn
   * with a cross. */
  restart: (at: Point): Sentence =>
    so({
      look: phrase`the board began at ${mark.the("ring", CELL, [at], "square")}, drawn with a cross`,
      follows: phrase`it can't hold a mine`,
      move: phrase`open it`,
    }),

  /** A number already touching all its mines. */
  satisfied: (w: Words, c: Clue, minesAt: readonly Point[]): Premise => ({
    proves: "safe",
    words:
      c.value === 0
        ? phrase`${w.clue(c)} has no mine around it`
        : phrase`${w.clue(c)} already touches ${mark.paren("outline", CELL, minesAt, c.value === 1 ? "its mine" : c.value === 2 ? "both its mines" : `all ${c.value} of its mines`)}`,
  }),

  /** A number with exactly as many unopened squares as mines still to place.
   * The mines it already touches are flagged, so "still needs" counts them
   * without outlining them. */
  full: (w: Words, c: Clue, hasMines: boolean, unopened: number): Premise => ({
    proves: "mine",
    words: hasMines
      ? phrase`${w.clue(c)} still needs ${minesWord(unopened)} and has just ${unopened} unopened ${plural(unopened, "square", "squares")} left around it`
      : phrase`${w.clue(c)} has exactly ${unopened} unopened ${plural(unopened, "square", "squares")} around it`,
  }),
};

/** How one side of rung 2 or 3 is named, and what it is said to need. */
export interface SideWords {
  /** "the outlined 3", "the striped squares". */
  readonly subject: Narration;
  /** "the outlined 3's", "the striped squares'". */
  readonly possessive: Narration;
  /** "needs 2 mines", "still needs 2 mines", "hold exactly 2 mines". */
  readonly needs: string;
  /** Whether the side is the one region the sentence stripes. */
  readonly striped: boolean;
  /** Whether {@link subject} takes a singular verb. */
  readonly singular: boolean;
  /** The side's squares when they all lie inside the other side's: "the
   * outlined 1's striped squares", "the striped squares". */
  readonly own: Narration;
}

/** A number as a side of rung 2. `stripes` are its squares when they all lie
 * inside the other side's and nothing else is striped. */
export function numberSide(
  w: Words,
  c: Clue,
  need: number,
  hasMines: boolean,
  stripes: readonly Point[] | null,
): SideWords {
  return {
    subject: w.clue(c),
    possessive: w.clues(c),
    needs: `${hasMines ? "still needs" : "needs"} ${minesWord(need)}`,
    striped: false,
    singular: true,
    own: stripes
      ? phrase`${w.clues(c)} ${mark.as("stripes", CELL, stripes, (els) => (els.length === 1 ? "striped square" : "striped squares"))}`
      : phrase`${w.clues(c)} unopened squares`,
  };
}

/** A nested pair's region as a side of rung 3: striped when it is the one
 * region the sentence marks, named through its two numbers otherwise. */
export function regionSide(
  w: Words,
  outer: Clue,
  inner: Clue,
  cells: readonly Point[],
  need: number,
  marked: boolean,
): SideWords {
  const hold = `${plural(cells.length, "holds", "hold")} exactly ${minesWord(need)}`;
  if (marked) {
    const striped = mark.as("stripes", CELL, cells, (els) =>
      els.length === 1 ? "the striped square" : "the striped squares",
    );
    return {
      subject: striped,
      possessive: mark.as("stripes", CELL, cells, (els) =>
        els.length === 1 ? "the striped square's" : "the striped squares'",
      ),
      needs: hold,
      striped: true,
      singular: cells.length === 1,
      own: striped,
    };
  }
  const name = phrase`${w.clues(outer)} squares beyond ${w.clues(inner)}`;
  return {
    subject: name,
    possessive: phrase`those squares'`,
    needs: hold,
    striped: false,
    singular: false,
    own: name,
  };
}

/** "all touch the outlined 3 too" / "are all among the striped squares": how
 * the inner side's squares lie inside the outer side's. */
function within(outer: SideWords): Narration {
  return outer.striped
    ? phrase`are all among ${outer.subject}`
    : phrase`all touch ${outer.subject} too`;
}

const theMines = (side: SideWords, n: number): Narration =>
  n === 1
    ? phrase`${side.possessive} mine`
    : phrase`all ${n} of ${side.possessive} mines`;

/** Rung 2 and 3's premises. */
export const sayPair = {
  /** Both sides keep squares of their own: the heavy side needs more than the
   * light side allows in the shared squares. */
  split: (
    heavy: SideWords,
    light: SideWords,
    lightNeed: number,
    shared: Narration,
  ): Premise => ({
    proves: "mine",
    words: phrase`${heavy.subject} ${heavy.needs}, but ${light.subject} ${light.singular ? "allows" : "allow"} at most ${lightNeed} in ${shared}`,
  }),

  /** What a leg after `split`'s mines rests on: the light side's mines are
   * all in the shared squares. */
  splitThen: (light: SideWords, lightNeed: number, shared: Narration): Premise => ({
    proves: "safe",
    words: phrase`that puts ${theMines(light, lightNeed)} in ${shared}`,
  }),

  /** `split`, said for its safe squares alone (its mines were already
   * flagged). */
  splitSafeOnly: (
    heavy: SideWords,
    light: SideWords,
    lightNeed: number,
    shared: Narration,
  ): Premise => ({
    proves: "safe",
    words: phrase`${heavy.subject} ${heavy.needs}, which leaves ${theMines(light, lightNeed)} in ${shared}`,
  }),

  /** One side's squares all lie inside the other's, and both need the same:
   * the other side's own squares are safe. */
  same: (inner: SideWords, outer: SideWords, need: number): Premise => ({
    proves: "safe",
    words: phrase`${inner.own} ${within(outer)}, and both need ${minesWord(need)}`,
  }),

  /** One side's squares all lie inside the other's, which needs more than
   * they can hold: the other side's own squares are mines. */
  more: (inner: SideWords, outer: SideWords, innerNeed: number): Premise => ({
    proves: "mine",
    words: phrase`${outer.subject} ${outer.needs}, and at most ${innerNeed} can be among ${inner.own}`,
  }),
};

/** A number nested in another, said before the deduction that uses it: the
 * outer one's squares beyond the inner one's hold exactly the difference.
 *
 * With the deduction after it, this runs past the 120 characters
 * `hint-quality.test.ts` asks for, and so can a count of several numbers below;
 * neither has a `LONG_NARRATIONS` entry, because the narration walk (every
 * Mines preset, three seeds each, 2026-10-01) never reaches either over 120.
 * How often each rung fires is measured in
 * `derive-completion-from-the-position`'s design.md § "Mines' hint". */
export const sayRegion = (
  w: Words,
  outer: Clue,
  inner: Clue,
  cells: readonly Point[] | null,
  need: number,
): Narration =>
  cells
    ? phrase`${capital(w.clues(inner))} unopened squares all touch ${w.clue(outer)}, whose ${mark.paren("stripes", CELL, cells, "others")} hold exactly ${minesWord(need)}. `
    : phrase`${capital(w.clues(inner))} unopened squares all touch ${w.clue(outer)}, whose others hold exactly ${minesWord(need)}. `;

/** Prefix a premise with the region sentences it rests on. */
export function after(prefix: readonly Narration[], p: Premise): Premise {
  if (prefix.length === 0) return p;
  return { proves: p.proves, words: Narration.join([...prefix, capital(p.words)]) };
}

export const sayCount = {
  /** Every mine is found: whatever is still unopened is safe. */
  allFound: (total: number): Premise => ({
    proves: "safe",
    words: phrase`all ${total} mines are found`,
  }),

  /** As many mines left as unopened squares. */
  allMines: (left: number): Premise => ({
    proves: "mine",
    words: phrase`${minesWord(left)} ${plural(left, "is", "are")} left and just ${left} unopened ${plural(left, "square", "squares")}`,
  }),

  /** The counted numbers need every mine left among squares none of them
   * share: everything outside is safe. */
  outsideSafe: (
    left: number,
    members: number,
    numbers: Narration,
    counted: Narration,
  ): Premise => ({
    proves: "safe",
    words: phrase`${minesWord(left)} ${plural(left, "is", "are")} left, and ${numbers} ${plural(members, "needs", "need")} ${left === 1 ? "it" : `all ${left}`} in ${counted}${members === 1 ? "" : ", which none of them share"}`,
  }),

  /** The counted numbers leave exactly as many mines as there are squares
   * outside them: everything outside is a mine. */
  outsideMines: (
    left: number,
    need: number,
    members: number,
    numbers: Narration,
    counted: Narration,
  ): Premise => ({
    proves: "mine",
    words: phrase`${minesWord(left)} ${plural(left, "is", "are")} left, and ${numbers} ${plural(members, "needs", "need")} just ${need} in ${counted}${members === 1 ? "" : ", which none of them share"}`,
  }),
};
