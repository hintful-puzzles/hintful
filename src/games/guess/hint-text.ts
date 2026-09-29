/**
 * Every sentence Guess's hint speaks.
 *
 * The board carries the references, so the sentences use three words for them
 * and nothing else, each a reference to the mark it names
 * (`engine/hint-words.ts`): the **striped row** is the scored guess a step
 * reads (the hint's line hatch, docs/games/hints.md § "Hatch the line the
 * sentence names"), an **outlined answer slot** is one whose marks it leans on,
 * and the **framed colors** are the blocks in the answer row the step acts on,
 * which is the ring's role. They are called framed rather than ringed because
 * the mark follows the block's square shape (`render.ts`, `drawAnswerSlot`), and
 * a sentence naming a shape the board does not draw sends the player looking
 * for it. Colors have no names in this game, and positions no numbers, so
 * neither is spoken.
 *
 * A deduction ends on the marks it makes; a probe ends on what was counted.
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
} from "../../engine/hint-words.ts";
import type { SlotMark } from "./state.ts";

/** A scored row, by index, taken as a whole. */
export const ROW: MarkKind<number> = {
  name: "row",
  key: (r) => `${r}`,
  unit: () => "",
};

/** An answer slot, by position. */
export const SLOT: MarkKind<number> = { name: "slot", key: (p) => `${p}` };

/** A color in an answer slot: a rule-out to set, or a probe's pick. */
export const COLOR: MarkKind<SlotMark> = {
  name: "color",
  key: (m) => `${m.pos}:${m.color}`,
};

export type Reason =
  | { kind: "scoredNothing" }
  | { kind: "noBlack" }
  | { kind: "everyPegScored" }
  | { kind: "noRepeats" }
  | { kind: "blacksForced"; black: number }
  | { kind: "blacksAccounted"; black: number }
  | { kind: "totalAccounted"; total: number }
  | { kind: "onlyAnswer" }
  | { kind: "opening"; fitting: number; worst: number }
  | { kind: "probe"; fitting: number; worst: number }
  | { kind: "probeFits" };

/** What a step marks: the scored rows it reads, the answer slots it leans on,
 * and the colors it acts on. */
interface GuessMarks {
  line: readonly number[];
  slots: readonly number[];
  marked: readonly SlotMark[];
}

const pegs = (n: number): string => (n === 1 ? "1 peg" : `${n} pegs`);

export function say(r: Reason, m: GuessMarks): Narration {
  const row = mark.the("stripes", ROW, m.line, "row");
  const Row = row.capitalized();
  const slots = mark.the("outline", SLOT, m.slots, "slot");
  const framed = (words = "the framed colors"): Narration =>
    mark.as("ring", COLOR, m.marked, words);
  // A deduction's rule-outs are the framed colors, so each sentence ends by
  // naming them as what is out.
  const out =
    m.marked.length > 1
      ? phrase`${framed()} are out`
      : phrase`${framed("the framed color")} is out`;
  switch (r.kind) {
    case "scoredNothing":
      return phrase`${Row} scored nothing, so none of its colors can be in the answer: ${out}.`;
    case "noBlack":
      return phrase`${Row} scored no black pegs, so none of its colors can be where it was guessed: ${out}.`;
    case "everyPegScored":
      return phrase`Every peg of ${row} scored, so the answer can only use its colors: ${out}.`;
    case "noRepeats":
      return phrase`${slots.capitalized()} can only be one color, and no color repeats, so no other slot can hold it: ${out}.`;
    case "blacksForced":
      return r.black === 1
        ? phrase`${Row}'s 1 black can only be in ${slots}, so that peg is right: ${out}.`
        : phrase`${Row}'s ${r.black} blacks can only be in ${slots}, so those pegs are right: ${out}.`;
    case "blacksAccounted":
      return r.black === 1
        ? phrase`${slots.capitalized()} accounts for ${row}'s black peg, so its other pegs are misplaced: ${out}.`
        : phrase`${slots.capitalized()} account for ${row}'s ${r.black} blacks, so its other pegs are misplaced: ${out}.`;
    case "totalAccounted":
      return phrase`${slots.capitalized()} account for all ${pegs(r.total)} ${row} scored, so ${out}.`;
    case "onlyAnswer":
      return phrase`Only one answer fits every score so far: ${framed()}.`;
    case "opening":
      return phrase`Nothing is scored yet. Guess ${framed()}: whatever they score, at most ${r.worst} of the ${r.fitting} answers will be left.`;
    case "probe":
      return phrase`${r.fitting} answers fit every score so far, and ${framed()} are one. Guess them, and at most ${r.worst} will be left.`;
    case "probeFits":
      return phrase`Guess ${framed()}: only a guess that fits every score so far can win, and they do.`;
  }
}
