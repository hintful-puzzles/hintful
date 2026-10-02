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
 * `continues` is a later leg of the same firing (the same clue and the same
 * rule ruling out a further square), so it drops the premise the opening leg
 * has already taught and gives, after the move, only what this square adds:
 * its own numbers, in the necessity voice. Its orientation carries no "too",
 * because a black clue's legs on different sides of it are forced different
 * ways.
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
  so,
} from "../../engine/hint-words.ts";
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

/** The orientation ruled out, and the move naming the one left. */
function frame(to: To, m: SticksMarks): { bad: string; move: Narration } {
  const bad = ORIENT[to === "hor" ? "ver" : "hor"];
  return { bad, move: phrase`${square(m)} must be ${ORIENT[to]}` };
}

/** An opening leg: the look rules the other orientation out. */
const opens = (look: Narration, move: Narration): Sentence => so({ look, move });

/** A later leg: the move, then what this square adds to the opening's reason. */
const continues = (move: Narration, basis: Narration): Sentence =>
  sentence({ move, relation: { kind: "again", basis } });

const clueRef = (m: SticksMarks, words: string): Narration =>
  mark.as("outline", CELL, m.clues, words);

const cellsRef = (m: SticksMarks, words: string): Narration =>
  mark.as("outline", CELL, m.cells, words);

export const say = {
  tooLong: (reason: R<"tooLong">, to: To, m: SticksMarks, later: boolean): Sentence => {
    const { bad, move } = frame(to, m);
    const run = cellsRef(m, `${reason.size} squares`);
    return later
      ? continues(
          move,
          phrase`a ${bad} line would run ${clueRef(m, `the ${reason.value}`)}'s line to ${run}`,
        )
      : opens(
          phrase`A ${bad} line here would run ${clueRef(m, `the ${reason.value}`)}'s line to ${run}, too long for it`,
          move,
        );
  },

  // Leads with the clue, not with the ruled-out move: the signal a player has
  // to learn to look for here is a number running out of room, which they will
  // not spot from the square being acted on.
  unreachable: (
    reason: R<"unreachable">,
    to: To,
    m: SticksMarks,
    later: boolean,
  ): Sentence => {
    const { bad, move } = frame(to, m);
    const room = cellsRef(m, `${reason.max} square${reason.max === 1 ? "" : "s"}`);
    return later
      ? continues(
          move,
          phrase`a ${bad} line would leave ${clueRef(m, `the ${reason.value}`)} only ${room}`,
        )
      : opens(
          phrase`${clueRef(m, `The ${reason.value}`)} needs a longer line, and a ${bad} line here would leave it only ${room}`,
          move,
        );
  },

  /** A line here would join clues showing `vals` into one line. */
  twoClues: (vals: number[], to: To, m: SticksMarks, later: boolean): Sentence => {
    const { bad, move } = frame(to, m);
    const line = cellsRef(m, "one line");
    if (later)
      return continues(
        move,
        phrase`a ${bad} line would join ${clueRef(m, "the same numbers")} into ${line}`,
      );
    const joined =
      vals.length !== 2
        ? phrase`put ${clueRef(m, `${vals.length} numbers`)} on ${line}`
        : vals[0] === vals[1]
          ? phrase`join ${clueRef(m, `two ${vals[0]}s`)} into ${line}`
          : phrase`join ${clueRef(m, `the ${vals[0]} and the ${vals[1]}`)} into ${line}`;
    // One number per line is the rule, and the help teaches it
    // (docs/games/hints.md § "Rules belong in the help").
    return opens(phrase`A ${bad} line here would ${joined}`, move);
  },

  // No "another" at a black 0: nothing runs into it yet, so the word would be
  // false exactly where the rule is starkest (docs/games/hints.md
  // § "Sanity-read at the degenerate extremes").
  overConnected: (
    reason: R<"overConnected">,
    to: To,
    m: SticksMarks,
    later: boolean,
  ): Sentence => {
    const { bad, move } = frame(to, m);
    const black = (cap: boolean) =>
      clueRef(m, `${cap ? "The" : "the"} black ${reason.value}`);
    const lines = cellsRef(
      m,
      `its ${reason.value} line${reason.value === 1 ? "" : "s"}`,
    );
    if (later)
      return continues(
        move,
        m.cells.length
          ? phrase`${black(false)} already has ${lines}, and a ${bad} line would add another`
          : phrase`a ${bad} line here would run into ${black(false)}`,
      );
    return opens(
      reason.value === 0
        ? phrase`${black(true)} takes no lines, and a ${bad} line here would run straight into it`
        : phrase`${black(true)} already has ${lines}, and a ${bad} line here would add another`,
      move,
    );
  },

  starved: (reason: R<"starved">, to: To, m: SticksMarks, later: boolean): Sentence => {
    const { bad, move } = frame(to, m);
    const black = clueRef(m, `The black ${reason.value}`);
    if (later)
      return continues(
        move,
        phrase`a ${bad} line would close a side ${clueRef(m, `the black ${reason.value}`)} needs, like ${mark.the("outline", CELL, m.cells, ["one", "ones"])}`,
      );
    return opens(
      reason.value === 1
        ? phrase`${black} has one open side left, and a ${bad} line here would close it off`
        : phrase`${black} needs ${cellsRef(m, reason.value === 2 ? "both" : `all ${reason.value}`)} of its open sides, and a ${bad} line here would close one`,
      move,
    );
  },
};
