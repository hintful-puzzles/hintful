/**
 * Every sentence Spokes' hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`, every claim of which `deduceSpokesPlan` has checked); this file
 * decides only how it reads: one crisp line for a player who knows the rules,
 * premise then conclusion, in the necessity voice.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the spokes the step decides are the ring (drawn as
 * a line in the hint color, or a ring round the rim dot to rule out), and the
 * hubs it reasons from are outlined.
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
  so,
} from "../../engine/hint-words.ts";
import type { SpokesFiring } from "./solver.ts";

/** A spoke, by its canonical end (`dir < 4`), so both ends compare equal. */
export interface Spoke {
  readonly index: number;
  readonly dir: number;
}

export const SPOKE: MarkKind<Spoke> = {
  name: "spoke",
  key: (s) => `${s.index}:${s.dir}`,
};

/** A hub, by its cell index. */
export const HUB: MarkKind<number> = { name: "hub", key: String };

/** A hub and the number on it. */
export interface Hub {
  readonly index: number;
  readonly number: number;
}

/** What a leg marks: the spokes still to decide and the hubs reasoned from. */
export interface Marked {
  spokes: readonly Spoke[];
  hubs: readonly number[];
}

const spokes = (m: Marked): Narration => mark.this("ring", SPOKE, m.spokes, "spoke");
const hub = (m: Marked, words = "the outlined hub"): Narration =>
  mark.as("outline", HUB, m.hubs, words);

export const say = {
  twoOnes: (m: Marked): Sentence =>
    so({
      look: phrase`Connecting ${hub(m, "the outlined 1-hubs")} would strand them from the rest`,
      move: phrase`rule out ${spokes(m)}`,
    }),

  /** The hub's count leaves exactly its free spokes, `count` of them. */
  saturation: (count: number, m: Marked): Sentence =>
    count === 1
      ? so({
          look: phrase`${hub(m)} has only one free spoke left for its count`,
          move: phrase`${spokes(m)} must be a line`,
        })
      : so({
          look: phrase`${hub(m)} has just enough free spokes left for its count`,
          move: phrase`${spokes(m)} must all be lines`,
        }),

  exhaustion: (m: Marked): Sentence =>
    so({
      look: phrase`${hub(m)} already has all its lines`,
      follows: phrase`none of its other spokes can be one`,
      move: phrase`rule out ${spokes(m)}`,
    }),

  /**
   * The spoke tried the other way (a line when `asLine`, else ruled out)
   * breaks the board at once in the way `breakKind` names, at `broken`. A
   * rule-out that left the hub `filled` no spoke to spare names it first,
   * since its other spokes are what break the board.
   */
  breaks: (
    asLine: boolean,
    breakKind: SpokesFiring["breakKind"],
    m: Marked,
    filled: Hub | null,
    broken: readonly Hub[],
  ): Sentence => {
    const at = (words: string): Narration =>
      mark.as(
        "outline",
        HUB,
        broken.map((h) => h.index),
        words,
      );
    const named =
      broken.length === 1 ? `the outlined ${broken[0].number}` : "the outlined hubs";
    // Two outlined hubs of one number are told apart by order: the one the
    // rule-out leaves short is named first.
    const same =
      filled !== null && broken.length === 1 && broken[0].number === filled.number;
    const one = same ? "the other" : named;
    // After "leave the outlined 7 no spare spoke and", a starved hub shares
    // the verb, which keeps the sentence within its length.
    const consequence =
      breakKind === "overfilled"
        ? filled === null
          ? phrase`give ${at(one)} too many lines`
          : phrase`overfill ${at(one)}`
        : breakKind === "starved"
          ? filled === null
            ? phrase`leave ${at(one)} too few spokes`
            : phrase`${at(one)} too few spokes`
          : breakKind === "crossing"
            ? phrase`force the diagonals of ${at("the outlined hubs")} to cross`
            : broken.length > 0
              ? phrase`strand ${at("the outlined hubs")}`
              : phrase`strand a group of hubs`;
    if (asLine)
      return so({
        look: phrase`Drawing ${mark.as("ring", SPOKE, m.spokes, "this line")} would ${consequence}`,
        move: phrase`rule it out`,
      });
    const short =
      filled === null
        ? phrase``
        : phrase` leave ${mark.as("outline", HUB, [filled.index], same ? `one outlined ${filled.number}` : `the outlined ${filled.number}`)} no spare spoke and`;
    return so({
      look: phrase`Ruling ${spokes(m)} out would${short} ${consequence}`,
      move: phrase`it must be a line`,
    });
  },

  /** Legs 2+ of a multi-spoke firing, reading as the same deduction; `line`
   * when the firing draws lines rather than marks. Names the spokes the
   * firing still has to settle and the hub it reasons from, which the leg
   * still shows. */
  continuation: (line: boolean, m: Marked): Sentence => {
    const rest = spokes(m);
    return sentence({
      move: line
        ? phrase`${rest} must be ${m.spokes.length === 1 ? "a line" : "lines"} too`
        : phrase`rule ${rest} out too`,
      relation: { kind: "again", basis: hub(m) },
    });
  },
};
