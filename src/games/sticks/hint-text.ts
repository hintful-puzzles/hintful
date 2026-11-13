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

import type { FiringSpoken } from "../../engine/described-firing-hint.ts";
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
import type { SticksState } from "./state.ts";
import type { SaysById } from "./sticks.compiled.ts";

/** The way a step's square is forced to run. */
type To = "hor" | "ver";

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

/** The orientation ruled out, an opening leg's supposition of it on the
 * square, and the move naming the one left. */
function frame(
  to: To,
  m: SticksMarks,
): { bad: string; supposed: Narration; move: Narration } {
  const bad = ORIENT[to === "hor" ? "ver" : "hor"];
  return {
    bad,
    supposed: phrase`a ${bad} line on ${square(m)}`,
    move: phrase`${square(m)} must be ${ORIENT[to]}`,
  };
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
  tooLong: (
    reason: { value: number; size: number },
    to: To,
    m: SticksMarks,
    later: boolean,
  ): Sentence => {
    const { bad, supposed, move } = frame(to, m);
    const run = cellsRef(m, `${reason.size} squares`);
    return later
      ? continues(
          move,
          phrase`a ${bad} line would run ${clueRef(m, `the ${reason.value}`)}'s line to ${run}`,
        )
      : opens(
          phrase`${supposed.capitalized()} would run ${clueRef(m, `the ${reason.value}`)}'s line to ${run}, too long for it`,
          move,
        );
  },

  // Leads with the clue, not with the ruled-out move: the signal a player has
  // to learn to look for here is a number running out of room, which they will
  // not spot from the square being acted on.
  unreachable: (
    reason: { value: number; max: number },
    to: To,
    m: SticksMarks,
    later: boolean,
  ): Sentence => {
    const { bad, supposed, move } = frame(to, m);
    const room = cellsRef(m, `${reason.max} square${reason.max === 1 ? "" : "s"}`);
    return later
      ? continues(
          move,
          phrase`a ${bad} line would leave ${clueRef(m, `the ${reason.value}`)} only ${room}`,
        )
      : opens(
          phrase`${clueRef(m, `The ${reason.value}`)} needs more room, and ${supposed} would leave it ${room}`,
          move,
        );
  },

  /** A line here would join clues showing `vals` into one line. */
  twoClues: (vals: number[], to: To, m: SticksMarks, later: boolean): Sentence => {
    const { bad, supposed, move } = frame(to, m);
    const squares = mark.the("outline", CELL, m.cells, "square");
    const line = phrase`one line, ${squares}`;
    if (later)
      return continues(
        move,
        phrase`a ${bad} line would join ${clueRef(m, "the same numbers")} into ${line}`,
      );
    // An opening leg names its square in the supposition too, so a pair is
    // joined "along" the squares, in fewer words than "into one line, …".
    const joined =
      vals.length !== 2
        ? phrase`put ${clueRef(m, `${vals.length} numbers`)} on ${line}`
        : vals[0] === vals[1]
          ? phrase`join ${clueRef(m, `two ${vals[0]}s`)} along ${squares}`
          : phrase`join ${clueRef(m, `the ${vals[0]} and the ${vals[1]}`)} along ${squares}`;
    // One number per line is the rule, and the help teaches it
    // (docs/hints.md § "Rules belong in the help").
    return opens(phrase`${supposed.capitalized()} would ${joined}`, move);
  },

  // No "another" at a black 0: nothing runs into it yet, so the word would be
  // false exactly where the rule is starkest (docs/hints.md
  // § "Sanity-read at the degenerate extremes").
  overConnected: (
    reason: { value: number },
    to: To,
    m: SticksMarks,
    later: boolean,
  ): Sentence => {
    const { bad, supposed, move } = frame(to, m);
    const black = (cap: boolean) =>
      clueRef(m, `${cap ? "The" : "the"} ${reason.value} block`);
    const lines = cellsRef(
      m,
      `its ${reason.value} line${reason.value === 1 ? "" : "s"}`,
    );
    if (later)
      return continues(
        move,
        m.cells.length
          ? phrase`${black(false)} already has ${lines}, and a ${bad} line would add another`
          : phrase`a ${bad} line would run into ${black(false)}`,
      );
    return opens(
      reason.value === 0
        ? phrase`${black(true)} takes no lines, and ${supposed} would run into it`
        : phrase`${black(true)} has ${lines}, and ${supposed} would add another`,
      move,
    );
  },

  starved: (
    reason: { value: number },
    to: To,
    m: SticksMarks,
    later: boolean,
  ): Sentence => {
    const { bad, supposed, move } = frame(to, m);
    const black = clueRef(m, `The ${reason.value} block`);
    if (later)
      return continues(
        move,
        phrase`a ${bad} line would close a side ${clueRef(m, `the ${reason.value} block`)} needs, like ${mark.the("outline", CELL, m.cells, ["one", "ones"])}`,
      );
    return opens(
      reason.value === 1
        ? phrase`${black} has one open side, and ${supposed} would close it`
        : phrase`${black} needs ${cellsRef(m, `${reason.value === 2 ? "both" : `${reason.value}`} outlined sides`)}, and ${supposed} shuts one`,
      move,
    );
  },
};

type Spoken<K extends keyof SaysById> = FiringSpoken<SaysById[K]>;

/** What a step's marks are, read off what the description says of a firing: the
 * square it decides, the clue cells its sentence names, and the rest of the
 * evidence. `kept` is where the square belongs to the evidence: the run a
 * length argument measures contains the square being decided (the outline is
 * less it), where the lines a block already counts, and the room a number is
 * left, do not. */
function marksOf(
  s: Spoken<keyof SaysById>,
  state: SticksState,
  clues: readonly number[],
  kept: boolean,
): { m: SticksMarks; to: To } {
  const [target] = s.targets;
  return {
    m: {
      target,
      // The square's own clue, or -1: what the closing sentence names it by.
      clue: state.numbers[target.y * state.w + target.x],
      clues: clues.map(s.at),
      cells: kept ? [...s.outline, ...s.targets] : s.outline,
    },
    to: s.placing(1).length > 0 ? "hor" : "ver",
  };
}

/** Each technique's sentence, from what its description says of a firing
 * (`engine/described-firing-hint.ts`): a step a square, the later squares of a
 * firing continuing the first. */
export const sentences = {
  overConnected: (s: Spoken<"overConnected">, state: SticksState): Sentence => {
    const { m, to } = marksOf(s, state, [s.terms.clue], false);
    return say.overConnected({ value: s.terms.value }, to, m, s.later);
  },
  twoClues: (s: Spoken<"twoClues">, state: SticksState): Sentence => {
    const joined = s.facts[0].terms.clues;
    const { m, to } = marksOf(s, state, joined, true);
    return say.twoClues(
      joined.map((c) => state.numbers[c]),
      to,
      m,
      s.later,
    );
  },
  tooLong: (s: Spoken<"tooLong">, state: SticksState): Sentence => {
    const { m, to } = marksOf(s, state, [s.terms.clue], true);
    return say.tooLong(
      { value: s.terms.value, size: s.facts[0].terms.size },
      to,
      m,
      s.later,
    );
  },
  starved: (s: Spoken<"starved">, state: SticksState): Sentence => {
    const { m, to } = marksOf(s, state, [s.terms.clue], false);
    return say.starved({ value: s.terms.value }, to, m, s.later);
  },
  unreachable: (s: Spoken<"unreachable">, state: SticksState): Sentence => {
    const { m, to } = marksOf(s, state, [s.terms.clue], false);
    return say.unreachable(
      { value: s.terms.value, max: s.facts[0].terms.max },
      to,
      m,
      s.later,
    );
  },
};
