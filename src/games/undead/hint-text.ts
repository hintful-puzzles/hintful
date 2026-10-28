/**
 * Every sentence Undead's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`, which reads a sightline's two clues off the board); this file
 * decides only how it reads: the spotted indication first, then the reasoning,
 * then a necessity-voice conclusion (docs/hints.md § "Writing the
 * narration"). A monster set arrives as its bitmask.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the cells the step decides are ringed, and so is
 * each pencil mark it crosses out; the sightline it reasons from is outlined.
 */

import {
  CELL,
  mark,
  Narration,
  NOTE,
  type Note,
  phrase,
  type Sentence,
  sentence,
  so,
  unshaped,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { MON_GHOST, MON_VAMPIRE, MONSTERS } from "./state.ts";

/** What a step marks: the cells it decides, the pencil marks it crosses out
 * (a note's `n` is the monster's bit), and the sightline it reasons from. */
export interface Marked {
  targets: readonly Point[];
  notes: readonly Note[];
  area: readonly Point[];
}

/** Singular monster name for a single bit. */
function monsterName(bit: number): string {
  return bit === MON_GHOST ? "ghost" : bit === MON_VAMPIRE ? "vampire" : "zombie";
}

/** Human list of the monsters in a bitmask: "ghost", "ghost or vampire",
 * "ghost, vampire or zombie". */
function joinMonsters(bits: number, conj: "or" | "and" = "or"): string {
  const names = MONSTERS.filter((b) => bits & b).map(monsterName);
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} ${conj} ${names[names.length - 1]}`;
}

const bitsOf = (notes: readonly Note[]): number => notes.reduce((b, k) => b | k.n, 0);

/** The cells the step decides, as "this cell" / "these cells". */
const thisCell = (m: Marked): Narration => mark.this("ring", CELL, m.targets, "cell");

/** The cells a step strikes notes in, striped: the step decides the notes,
 * which their strikes mark, and a cell on the sightline lies inside its
 * outline, where an outline of its own would not show. */
const struckCell = (m: Marked): Narration =>
  mark.this(
    "stripes",
    CELL,
    [...new Map(m.notes.map((k) => [CELL.key(k), { x: k.x, y: k.y }])).values()],
    "cell",
  );

/** The struck pencil marks, "the struck ghost and vampire", in words that
 * follow them when a step shrinks. Several cells' notes of one monster are
 * "the struck ghosts". */
const struck = (m: Marked): Narration =>
  mark.as("strike", NOTE, m.notes, (els) => {
    const cells = new Set(els.map((e) => CELL.key(e))).size;
    return `the struck ${joinMonsters(bitsOf(els), "and")}${cells > 1 ? "s" : ""}`;
  });

const sightline = (m: Marked, words: string): Narration =>
  mark.as("outline", CELL, m.area, words);

export const say = {
  // Undead's opener is its own: it pencils monsters, not the candidate games'
  // values (`engine/hint-text.ts`'s `populateText`).
  populate: unshaped(
    Narration.plain(
      "Start by penciling every monster into each empty cell, so there is something to cross out.",
    ),
    "setup",
  ),

  /** A later cell of the same sightline firing. */
  sightlineNext: (m: Marked): Sentence =>
    sentence({
      move: phrase`${struck(m)} in ${struckCell(m)} must go too`,
      relation: { kind: "again", basis: sightline(m, "the same sightline") },
    }),

  // Which monster shows where is the game's rule, and the help teaches it
  // (help/games/undead.md); the step says only what this sightline's two
  // clues decide (docs/hints.md § "Rules belong in the help").
  /** The sightline's clues `a` and `b` leave no room for `bits` in the cell. */
  sightline: (a: number, b: number, bits: number, m: Marked): Sentence =>
    so({
      look: phrase`${sightline(m, "This sightline")}'s ${a} and ${b} leave no room for a ${joinMonsters(bits)} in ${struckCell(m)}`,
      move: phrase`${struck(m)} must go`,
    }),

  total: (monster: number, m: Marked): Sentence => {
    const name = monsterName(monster);
    return so({
      look: phrase`No ${name}s are left to place`,
      follows: phrase`no undecided cell can be one`,
      move: phrase`${struck(m)} in ${struckCell(m)} must go`,
    });
  },

  onlyCells: (monster: number, m: Marked): Sentence => {
    const name = monsterName(monster);
    return so({
      look: phrase`Exactly as many cells can still hold a ${name} as there are ${name}s left to place`,
      move: phrase`${thisCell(m)} can only be a ${name}`,
    });
  },

  /** A placement: `bits` is the one monster the cell's notes still allow. */
  single: (bits: number, m: Marked): Sentence =>
    so({
      look: phrase`Every other monster is crossed out in ${thisCell(m)}`,
      move: phrase`it can only be a ${joinMonsters(bits)}`,
    }),
};
