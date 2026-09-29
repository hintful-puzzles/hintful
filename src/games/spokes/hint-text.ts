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

/** What a leg marks: the spokes still to decide and the hubs reasoned from. */
export interface Marked {
  spokes: readonly Spoke[];
  hubs: readonly number[];
}

const spokes = (m: Marked): Narration => mark.this("ring", SPOKE, m.spokes, "spoke");
const hub = (m: Marked, words = "the outlined hub"): Narration =>
  mark.as("outline", HUB, m.hubs, words);

export const say = {
  twoOnes: (m: Marked): Narration =>
    phrase`Connecting ${hub(m, "the outlined 1-hubs")} would strand them from the rest, so rule out ${spokes(m)}.`,

  /** The hub's count leaves exactly its free spokes, `count` of them. */
  saturation: (count: number, m: Marked): Narration =>
    count === 1
      ? phrase`${hub(m).capitalized()} has only one free spoke left for its count, so ${spokes(m)} must be a line.`
      : phrase`${hub(m).capitalized()} has just enough free spokes left for its count, so ${spokes(m)} must all be lines.`,

  exhaustion: (m: Marked): Narration =>
    phrase`${hub(m).capitalized()} already has all its lines, so none of its other spokes can be one. Rule out ${spokes(m)}.`,

  /** The trial (a line when `asLine`, else a mark) breaks the board in the
   * way `breakKind` names. */
  contradiction: (
    asLine: boolean,
    breakKind: SpokesFiring["breakKind"],
    m: Marked,
  ): Narration => {
    const consequence =
      breakKind === "overfilled"
        ? phrase`over-fill ${hub(m)}`
        : breakKind === "crossing"
          ? phrase`force the diagonals of ${hub(m, "the outlined hubs")} to cross`
          : m.hubs.length > 0
            ? phrase`strand ${hub(m, "the outlined hubs")}`
            : phrase`strand a group of hubs`;
    return asLine
      ? phrase`Drawing ${mark.as("ring", SPOKE, m.spokes, "this line")} would ${consequence}, so rule it out.`
      : phrase`Ruling ${spokes(m)} out would ${consequence}, so it must be a line.`;
  },

  /** Legs 2+ of a multi-spoke firing, reading as the same deduction; `line`
   * when the firing draws lines rather than marks. Names the spokes the
   * firing still has to settle and the hub it reasons from, which the leg
   * still shows. */
  continuation: (line: boolean, m: Marked): Narration => {
    const rest = mark.as("ring", SPOKE, m.spokes, (els) =>
      els.length === 1 ? "this one" : "these",
    );
    return line
      ? phrase`And ${rest} must be ${m.spokes.length === 1 ? "a line" : "lines"} too, for ${hub(m)}.`
      : phrase`And rule ${rest} out too, for ${hub(m)}.`;
  },
};
