/**
 * Every sentence Light Up's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`, which reads the frame the player is looking at); this file decides
 * only how it reads: the indication first, the conclusion in the necessity
 * voice (docs/hints.md § "Necessity for deductions, imperative for
 * moves"). Where a second mark is on the board, "this square" is never left
 * bare.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the squares the step decides are ringed, and
 * everything it reasons from is outlined — the driving clue, the dark square
 * that has to be lit, and the squares that could light it or fill the clue.
 * Those are told apart by their nouns: "the outlined clue", "the outlined dark
 * square", and "the other outlined squares" for the set.
 */

import {
  CELL,
  mark,
  type Narration,
  type Noun,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** The cells a step marks: the ones it decides, the evidence set, the dark
 * square it is about and the driving clue (null when absent). */
export interface Marked {
  targets: readonly Point[];
  area: readonly Point[];
  dark: Point | null;
  clue: Point | null;
}

const these = (m: Marked, noun: Noun): Narration =>
  mark.this("ring", CELL, m.targets, noun);
const clue = (m: Marked): Narration =>
  mark.the("outline", CELL, m.clue ? [m.clue] : [], "clue").capitalized();
const darkSquare = (m: Marked): Narration =>
  mark.the("outline", CELL, m.dark ? [m.dark] : [], "dark square");
/** The evidence set, beside the dark square or the clue that is also
 * outlined. */
const others = (m: Marked): Narration =>
  mark.as("outline", CELL, m.area, (els) =>
    els.length === 1 ? "the other outlined square" : "the other outlined squares",
  );
/** The ringed squares, re-counted when a partly followed step narrows them. */
const ringed = (m: Marked, lead: string): Narration =>
  mark.as("ring", CELL, m.targets, (els) =>
    els.length === 1 ? `${lead} ringed free neighbor` : `${lead} ringed free neighbors`,
  );

export const say = {
  /** This dark square has nothing else to light it. `area` holds the squares
   * that could (dark ones ruled out, lit ones), so the sentence names them; a
   * corridor of just this square shows no second mark, and then the bare
   * deictic is right. */
  forcedLightSelf: (m: Marked): Sentence =>
    m.area.length > 0
      ? so({
          look: phrase`${mark.the("outline", CELL, m.area, "square", "each")} is ruled out or already lit`,
          follows: phrase`nothing else can light ${these(m, "dark square")}`,
          move: phrase`it must hold a bulb`,
        })
      : so({
          look: phrase`Every other square that could light ${these(m, "dark square")} is ruled out or already lit`,
          move: phrase`it must hold a bulb`,
        }),

  forcedLightOther: (m: Marked): Sentence =>
    m.area.length > 0
      ? so({
          look: phrase`${others(m)} can't light ${darkSquare(m)}`,
          follows: phrase`only ${these(m, "square")} can`,
          move: phrase`it must hold a bulb`,
        })
      : so({
          look: phrase`Only ${these(m, "square")} can still light ${darkSquare(m)}`,
          move: phrase`it must hold a bulb`,
        }),

  /** The clue `n` is met; the ringed free neighbors are left to cross out. */
  clueSatisfied: (n: number, m: Marked): Sentence => {
    if (n === 0) {
      return so({
        look: phrase`${clue(m)} is 0`,
        follows: phrase`no bulb may sit beside it`,
        move: phrase`${ringed(m, "its")} can't hold a bulb`,
      });
    }
    const bulbs =
      n === 1 ? "its bulb" : n === 2 ? "both its bulbs" : `all ${n} of its bulbs`;
    return so({
      look: phrase`${clue(m)} already has ${mark.paren("outline", CELL, m.area, bulbs)}`,
      move: phrase`${ringed(m, "its other")} can't hold a bulb`,
    });
  },

  /** The clue still needs a bulb in each of its free neighbors, which are the
   * ringed squares; both parts count from them, so a partly followed step
   * re-counts. */
  clueSaturated: (m: Marked): Sentence =>
    so({
      look: phrase`${clue(m)} still needs ${mark.as("ring", CELL, m.targets, (els) =>
        els.length === 1 ? "1 more bulb" : `${els.length} more bulbs`,
      )} and has exactly ${mark.as("ring", CELL, m.targets, (els) =>
        els.length === 1 ? "1 free neighbor" : `${els.length} free neighbors`,
      )} left`,
      move: phrase`${mark.as("ring", CELL, m.targets, (els) =>
        els.length === 1 ? "the ringed one" : "each ringed one",
      )} must be a bulb`,
    }),

  // Several marks are in view (target, evidence set, dark square), so "a bulb
  // here" is tied to the set by the relation `discountSet` guarantees:
  // *reach*, the target rules out every member by lighting it or by filling a
  // clue beside it. The tie cannot be positional: across 133 discount firings
  // the driving clue was never adjacent to or collinear with the target, nor
  // was the dark square collinear with it. And the dark square is itself a set
  // member in over half of all firings (`litCells(…, true)` includes the
  // source), where it is outlined as the dark square rather than among the
  // others, so the sentence names it among the squares that could light it.
  /** One of the other outlined squares (plus the dark square itself, when
   * `darkInSet`) must light the dark square. */
  // "Rule out" is lit, or beside a full clue: the help's rules, which the
  // outlines let the player check square by square. Where the dark square
  // could hold a bulb itself, it is among "every square that could light" it.
  discountUnlit: (m: Marked): Sentence =>
    so({
      look: phrase`A bulb here rules out ${mark.the("outline", CELL, m.area, "square", "every")} that can light ${darkSquare(m)}`,
      move: phrase`${these(m, "square")} can't hold a bulb`,
    }),

  discountClue: (m: Marked): Sentence =>
    so({
      look: phrase`A bulb here rules out ${mark.the("outline", CELL, m.area, "square", "every")} left for ${mark.the("outline", CELL, m.clue ? [m.clue] : [], "clue")}'s bulb`,
      move: phrase`${these(m, "square")} can't hold a bulb`,
    }),
};
