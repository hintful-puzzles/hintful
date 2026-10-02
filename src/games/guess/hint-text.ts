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
  type Sentence,
  sentence,
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

export function say(r: Reason, m: GuessMarks): Sentence {
  const row = mark.the("stripes", ROW, m.line, "row");
  const slots = mark.the("outline", SLOT, m.slots, "slot");
  const framed = (words = "the framed colors"): Narration =>
    mark.as("ring", COLOR, m.marked, words);
  // A deduction's rule-outs are the framed colors, so each sentence ends by
  // naming them as what is out.
  const out =
    m.marked.length > 1
      ? phrase`${framed()} are out`
      : phrase`${framed("the framed color")} is out`;
  // Guess's hint searches, so "so" claims every rival lost. A deduction's
  // rule-out is proved from the scores, which leaves no rival standing, and
  // the one answer left is the only guess that can win.
  const proved = (look: Narration, follows: Narration | null, move = out): Sentence =>
    sentence({
      look,
      ...(follows ? { follows } : {}),
      move,
      relation: { kind: "forced", rivals: "lost" },
    });
  switch (r.kind) {
    case "scoredNothing":
      return proved(
        phrase`${row} scored nothing`,
        phrase`none of its colors can be in the answer`,
      );
    case "noBlack":
      return proved(
        phrase`${row} scored no black pegs`,
        phrase`none of its colors can be where it was guessed`,
      );
    case "everyPegScored":
      return proved(
        phrase`Every peg of ${row} scored`,
        phrase`the answer can only use its colors`,
      );
    case "noRepeats":
      return proved(
        phrase`${slots} can only be one color, and no color repeats`,
        phrase`no other slot can hold it`,
      );
    case "blacksForced":
      return r.black === 1
        ? proved(
            phrase`${row}'s 1 black can only be in ${slots}`,
            phrase`that peg is right`,
          )
        : proved(
            phrase`${row}'s ${r.black} blacks can only be in ${slots}`,
            phrase`those pegs are right`,
          );
    case "blacksAccounted":
      return r.black === 1
        ? proved(
            phrase`${slots} accounts for ${row}'s black peg`,
            phrase`its other pegs are misplaced`,
          )
        : proved(
            phrase`${slots} account for ${row}'s ${r.black} blacks`,
            phrase`its other pegs are misplaced`,
          );
    case "totalAccounted":
      return proved(
        phrase`${slots} account for all ${pegs(r.total)} ${row} scored`,
        null,
      );
    case "onlyAnswer":
      return proved(
        phrase`Only one answer fits every score so far`,
        null,
        phrase`guess ${framed()}`,
      );
    // A probe is not forced: it is chosen by what it leaves, so it is narrated
    // by that, or, past the enumeration budget, as one of the guesses that fit.
    case "opening":
      return sentence({
        look: phrase`Nothing is scored yet`,
        move: phrase`guess ${framed()}`,
        relation: {
          kind: "effect",
          effect: phrase`whatever they score, at most ${r.worst} of the ${r.fitting} answers will be left`,
        },
      });
    case "probe":
      return sentence({
        look: phrase`${r.fitting} answers fit every score so far, and ${framed()} are one`,
        move: phrase`guess them`,
        relation: {
          kind: "effect",
          effect: phrase`at most ${r.worst} will be left`,
        },
      });
    case "probeFits":
      return sentence({
        look: phrase`Only guesses that fit every score so far can win`,
        move: phrase`guess ${framed()}`,
        relation: { kind: "oneOf" },
      });
  }
}
