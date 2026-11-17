/**
 * Every sentence Undead's hint speaks, as the description states it
 * (`undead.description.yaml`'s `steps`).
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`, which reads a sightline's two clues off the board); the words are
 * the description's, and a step that strikes pencil marks closes on them in
 * the engine's words. A struck note's `n` is its monster's bit, which the
 * voice reads as the description's number.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the cells the step decides are ringed, and so is
 * each pencil mark it crosses out; the sightline it reasons from is outlined.
 */

import { CELL, type Note, type Sentence, unshaped } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { voice } from "../../generated/games/undead/undead.compiled.ts";
import { MON_GHOST, MON_VAMPIRE, MONSTERS } from "./state.ts";

/** What a step marks: the cells it decides, the pencil marks it crosses out
 * (a note's `n` is the monster's bit), and the sightline it reasons from. */
export interface Marked {
  targets: readonly Point[];
  notes: readonly Note[];
  area: readonly Point[];
}

/** The monster a description's number names: 1 a ghost, 2 a vampire, 3 a
 * zombie, which is the bit's place in {@link MONSTERS}. */
const monsterOf = (n: number): string => {
  const bit = MONSTERS[n - 1];
  return bit === MON_GHOST ? "ghost" : bit === MON_VAMPIRE ? "vampire" : "zombie";
};

/** The monster a step names, by the description's number. */
const numberOf = (bit: number): number => MONSTERS.indexOf(bit as 1 | 2 | 4) + 1;

const speak = voice<Point>({ kind: CELL, value: monsterOf, noteValue: numberOf });

/** The cells a step strikes notes in, striped: the step decides the notes,
 * which their strikes mark, and a cell on the sightline lies inside its
 * outline, where an outline of its own would not show. */
const struckCells = (m: Marked): Point[] => [
  ...new Map(m.notes.map((k) => [CELL.key(k), { x: k.x, y: k.y }])).values(),
];

export const say = {
  // Undead's opener is its own: it pencils monsters, not the candidate games'
  // values (`engine/hint-text.ts`'s `populateText`).
  populate: unshaped(speak.premise("populate", {}), "setup"),

  /** The sightline's clues `a` and `b` leave no room for the struck monsters
   * in the cell; `later` is a later cell of the same sightline firing. */
  sightline: (a: number, b: number, m: Marked, later: boolean): Sentence =>
    speak.sentence("sightline", {
      ring: m.targets,
      strikes: m.notes,
      later,
      terms: { a, b },
      marks: { outline: { sight: m.area }, stripes: { at: struckCells(m) } },
    }),

  total: (monster: number, m: Marked): Sentence =>
    speak.sentence("total", {
      ring: m.targets,
      terms: { d: numberOf(monster) },
      strikes: m.notes,
    }),

  onlyCells: (monster: number, m: Marked): Sentence =>
    speak.sentence("onlyCells", { ring: m.targets, terms: { d: numberOf(monster) } }),

  /** A placement: `bits` is the one monster the cell's notes still allow. */
  single: (bits: number, m: Marked): Sentence =>
    speak.sentence("single", { ring: m.targets, terms: { d: numberOf(bits) } }),
};
