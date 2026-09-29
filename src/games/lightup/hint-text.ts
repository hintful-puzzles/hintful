/**
 * Every sentence Light Up's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`, which reads the frame the player is looking at); this file decides
 * only how it reads: the indication first, the conclusion in the necessity
 * voice (docs/games/hints.md § "Necessity for deductions, imperative for
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
  forcedLightSelf: (m: Marked): Narration =>
    m.area.length > 0
      ? phrase`Nothing else can light ${these(m, "dark square")}: ${mark.the("outline", CELL, m.area, "square", "each")} is ruled out or already lit. It must hold a bulb.`
      : phrase`Nothing else can light ${these(m, "dark square")}: every square that could is ruled out or already lit. It must hold a bulb.`,

  forcedLightOther: (m: Marked): Narration =>
    m.area.length > 0
      ? phrase`${others(m).capitalized()} can't light ${darkSquare(m)}, so only ${these(m, "square")} can: it must hold a bulb.`
      : phrase`Only ${these(m, "square")} can still light ${darkSquare(m)}, so ${these(m, "one")} must hold a bulb.`,

  /** The clue `n` is met; the ringed free neighbors are left to cross out. */
  clueSatisfied: (n: number, m: Marked): Narration => {
    if (n === 0) {
      return phrase`${clue(m)} is 0: no bulb may sit beside it. So ${ringed(m, "its")} can't hold a bulb.`;
    }
    const bulbs =
      n === 1 ? "its bulb" : n === 2 ? "both its bulbs" : `all ${n} of its bulbs`;
    return phrase`${clue(m)} already has ${mark.paren("outline", CELL, m.area, bulbs)}, so ${ringed(m, "its other")} can't hold a bulb.`;
  },

  /** The clue still needs a bulb in each of its free neighbors, which are the
   * ringed squares; counted from them, so a partly followed step re-counts. */
  clueSaturated: (m: Marked): Narration =>
    phrase`${clue(m)} ${mark.as("ring", CELL, m.targets, (els) =>
      els.length === 1
        ? "still needs 1 more bulb and has exactly 1 free neighbor left, so the ringed one must be a bulb"
        : `still needs ${els.length} more bulbs and has exactly ${els.length} free neighbors left, so each ringed one must be a bulb`,
    )}.`,

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
  discountUnlit: (darkInSet: boolean, m: Marked): Narration =>
    darkInSet
      ? phrase`${darkSquare(m).capitalized()} must be lit by itself or by ${m.area.length === 1 ? "" : "one of "}${others(m)}, and a bulb here would leave each of them lit or beside a full clue, so ${these(m, "square")} can't hold a bulb.`
      : phrase`One of ${others(m)} must light ${darkSquare(m)}, and a bulb here would leave each of them lit or beside a full clue, so ${these(m, "square")} can't hold a bulb.`,

  discountClue: (m: Marked): Narration =>
    phrase`${clue(m)} needs a bulb in one of ${others(m)}, and a bulb here would leave each of them lit or beside a full clue, so ${these(m, "square")} can't hold a bulb.`,
};
