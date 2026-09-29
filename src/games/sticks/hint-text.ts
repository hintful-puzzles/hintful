/**
 * Every sentence Sticks' hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`, which reads the clue numbers off the board); this file decides
 * only how it reads: why the square can only take one orientation, by naming
 * the clue the other orientation would break and how it would break it.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the square the step decides is ringed (its line
 * drawn in the hint color), and the cells its argument rests on are outlined.
 *
 * `continues` is a later leg of the same firing — the same clue and the same
 * rule ruling out a further square — so it says so and drops the premise the
 * opening leg has already taught, while keeping its own numbers and the
 * necessity modal (Slant's leg convention).
 */

import { CELL, mark, type Narration, phrase } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { SticksFiring, SticksReason } from "./solver.ts";

type R<K extends SticksReason["kind"]> = Extract<SticksReason, { kind: K }>;
type To = SticksFiring["to"];

const ORIENT = { hor: "horizontal", ver: "vertical" } as const;

/** Where a step's marks sit: the square it decides, its own clue (-1 when it
 * has none), and the cells its argument rests on, by the part each plays. */
export interface SticksMarks {
  target: Point;
  clue: number;
  /** The clue cell or cells the sentence names. */
  clues: readonly Point[];
  /** The rest of the evidence: a line's squares, a black clue's lines or its
   * open sides. */
  cells: readonly Point[];
}

/** The square decided, by its number when it has one ("this 2"): there is
 * otherwise no value to name it by, and the clue in the sentence locates it. */
const square = (m: SticksMarks): Narration =>
  mark.this("ring", CELL, [m.target], m.clue === -1 ? "square" : `${m.clue}`);

/** The orientation ruled out, and the closing sentence naming the one left. */
function frame(to: To, m: SticksMarks): { bad: string; tail: Narration } {
  const bad = ORIENT[to === "hor" ? "ver" : "hor"];
  return { bad, tail: phrase`So ${square(m)} must be ${ORIENT[to]}.` };
}

const clueRef = (m: SticksMarks, words: string): Narration =>
  mark.as("outline", CELL, m.clues, words);

const cellsRef = (m: SticksMarks, words: string): Narration =>
  mark.as("outline", CELL, m.cells, words);

export const say = {
  tooLong: (
    reason: R<"tooLong">,
    to: To,
    m: SticksMarks,
    continues: boolean,
  ): Narration => {
    const { bad, tail } = frame(to, m);
    const run = cellsRef(m, `${reason.size} squares`);
    return continues
      ? phrase`${clueRef(m, `The ${reason.value}`)} rules ${square(m)} out too: a ${bad} line would run its line to ${run}. ${tail}`
      : phrase`A ${bad} line here would run ${clueRef(m, `the ${reason.value}`)}'s line to ${run}, too long for it. ${tail}`;
  },

  // Leads with the clue, not with the ruled-out move: the signal a player has
  // to learn to look for here is a number running out of room, which they will
  // not spot from the square being acted on.
  unreachable: (
    reason: R<"unreachable">,
    to: To,
    m: SticksMarks,
    continues: boolean,
  ): Narration => {
    const { bad, tail } = frame(to, m);
    const room = cellsRef(m, `${reason.max} square${reason.max === 1 ? "" : "s"}`);
    return continues
      ? phrase`${clueRef(m, `The ${reason.value}`)} rules ${square(m)} out too: a ${bad} line would leave it only ${room}. ${tail}`
      : phrase`${clueRef(m, `The ${reason.value}`)} needs a longer line, and a ${bad} line here would leave it only ${room}. ${tail}`;
  },

  /** A line here would join clues showing `vals` into one line. */
  twoClues: (vals: number[], to: To, m: SticksMarks, continues: boolean): Narration => {
    const { bad, tail } = frame(to, m);
    const line = cellsRef(m, "one line");
    if (continues)
      return phrase`${clueRef(m, "The same numbers")} rule ${square(m)} out too: a ${bad} line would join them into ${line}. ${tail}`;
    const joined =
      vals.length !== 2
        ? phrase`put ${clueRef(m, `${vals.length} numbers`)} on ${line}`
        : vals[0] === vals[1]
          ? phrase`join ${clueRef(m, `two ${vals[0]}s`)} into ${line}`
          : phrase`join ${clueRef(m, `the ${vals[0]} and the ${vals[1]}`)} into ${line}`;
    // One number per line is the rule, and the help teaches it
    // (docs/games/hints.md § "Rules belong in the help").
    return phrase`A ${bad} line here would ${joined}. ${tail}`;
  },

  // No "as well" on the continuation: at a black 0 nothing runs into it yet,
  // so the word would be false exactly where the rule is starkest
  // (docs/games/hints.md § "Sanity-read at the degenerate extremes").
  overConnected: (
    reason: R<"overConnected">,
    to: To,
    m: SticksMarks,
    continues: boolean,
  ): Narration => {
    const { bad, tail } = frame(to, m);
    const black = (cap: boolean) =>
      clueRef(m, `${cap ? "The" : "the"} black ${reason.value}`);
    const lines = cellsRef(
      m,
      `its ${reason.value} line${reason.value === 1 ? "" : "s"}`,
    );
    if (continues)
      return m.cells.length
        ? phrase`${black(true)} rules ${square(m)} out too: a ${bad} line here would add to ${lines}. ${tail}`
        : phrase`${black(true)} rules ${square(m)} out too: a ${bad} line here would run into it. ${tail}`;
    return reason.value === 0
      ? phrase`${black(true)} takes no lines, and a ${bad} line here would run straight into it. ${tail}`
      : phrase`${black(true)} already has ${lines}, and a ${bad} line here would add another. ${tail}`;
  },

  starved: (
    reason: R<"starved">,
    to: To,
    m: SticksMarks,
    continues: boolean,
  ): Narration => {
    const { bad, tail } = frame(to, m);
    const black = clueRef(m, `The black ${reason.value}`);
    // The continuation leads with the ruled-out line: "rules this square out
    // too" leaves no room to name the open sides still drawn.
    if (continues)
      return phrase`A ${bad} line would close another side ${clueRef(m, `the black ${reason.value}`)} needs, like ${mark.the("outline", CELL, m.cells, ["one", "ones"])}. ${tail}`;
    return reason.value === 1
      ? phrase`${black} has one open side left, and a ${bad} line here would close it off. ${tail}`
      : phrase`${black} needs ${cellsRef(m, reason.value === 2 ? "both" : `all ${reason.value}`)} of its open sides, and a ${bad} line here would close one. ${tail}`;
  },
};
