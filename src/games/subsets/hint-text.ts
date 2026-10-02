/**
 * Every sentence Subsets' hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `stepsForFiring`); this file decides only how it reads. Each leg of a firing
 * is one letter with its own string, *attention → deduction → action*, and a
 * collapse's lead leg gains a "why not X" example in its premise. Every word that points at the
 * board is a reference to the mark it points at (`engine/hint-words.ts`): the
 * letter a step decides is ringed, and so is a set it rules out; the cell and
 * the sets it reasons from are outlined; and the one cell a set still fits is
 * striped.
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
import { SLOT, type Slot, TALLY_SET } from "./hint-marks.ts";
import {
  bitList,
  type CollapseExclusion,
  type RuleOutMark,
  type SubsetsDeduction,
} from "./solver.ts";

const LETTER = (bit: number): string => String.fromCharCode(65 + bit);

/** Oxford-comma join: "A", "A and C", "A, C and D". */
function joinAnd(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** A set-value as "{A, C}", or "the empty set" for `{}`. */
function setLabel(value: number, n: number): string {
  const letters = bitList(value, n).map(LETTER);
  return letters.length ? `{${letters.join(",")}}` : "the empty set";
}

const lettersOf = (mask: number, n: number): string =>
  joinAnd(bitList(mask, n).map(LETTER));

/** The marks a letter step draws: the letter it decides, the neighbor cell
 * and the tally sets it reasons from, and a hidden single's one home. */
export interface LegMarks {
  slot: Slot;
  cells: readonly Point[];
  sets: readonly number[];
  spotlight: readonly Point[];
}

const outlinedCell = (cells: readonly Point[], noun = "cell"): Narration =>
  mark.the("outline", CELL, cells, noun);

export const say = {
  /**
   * The per-slot narration of leg `k` of a firing. The lead leg (`k === 0`)
   * states the sub-goal (why this set/cell), with a collapse's example of a
   * set that cannot go here (`exclusion`) inside its premise; continuation
   * legs are terser but still specific to their own slot toward that sub-goal.
   */
  leg: (
    d: SubsetsDeduction,
    k: number,
    m: LegMarks,
    exclusion: Narration | null = null,
  ): Sentence => {
    const set = d.sets[k];
    const first = k === 0;
    const L = LETTER(set.bit);
    const letter = mark.as("ring", SLOT, [m.slot], L);
    const known = set.type === "known";
    const act = known ? phrase`mark ${letter} present` : phrase`clear ${letter}`;
    // The cell the step fills: a hidden single's one home when it is drawn,
    // else the cell the ringed letter sits in.
    const here = m.spotlight.length
      ? mark.this("stripes", CELL, m.spotlight, "cell")
      : mark.this("ring", SLOT, [m.slot], "cell");
    // A continuation leg rests on the lead's reasoning, and names its own
    // referent so it never leans on a bare pronoun.
    const again = (basis: Narration): Sentence =>
      sentence({
        move: phrase`${act} in ${here} too`,
        relation: { kind: "again", basis },
      });
    const r = d.reason;

    if (r.kind === "arrowKnown") {
      return first
        ? so({
            look: phrase`${outlinedCell(m.cells)}'s set lies inside ${here}'s and has ${L} marked`,
            follows: phrase`${L} must be here too`,
            move: act,
          })
        : again(phrase`${outlinedCell(m.cells)}'s ${L} is marked`);
    }
    if (r.kind === "arrowMask") {
      return first
        ? so({
            look: phrase`${here}'s set lies inside ${outlinedCell(m.cells)}'s, which has no ${L}`,
            follows: phrase`${L} can't be here either`,
            move: act,
          })
        : again(phrase`${outlinedCell(m.cells)} has no ${L}`);
    }

    // Placement reasons — the referent is the outlined set(s), named in full
    // on every leg (never "it"/"them").
    const plural = m.sets.length > 1;
    const sets = mark.the("outline", TALLY_SET, m.sets, "set");

    if (!first)
      return again(
        known
          ? plural
            ? phrase`${sets} all contain ${L}`
            : phrase`${sets} contains ${L}`
          : plural
            ? phrase`none of ${sets} has ${L}`
            : phrase`${sets} has no ${L}`,
      );

    const attn =
      r.kind === "hiddenSingle"
        ? phrase`${sets} can go nowhere but ${here}`
        : phrase`only ${sets} can still go in ${here}`;
    // With an example between them, the sets are named again rather than by a
    // pronoun whose nearest antecedent would be the example's set.
    if (exclusion) {
      const has = known
        ? plural
          ? phrase`${sets.capitalized()} all contain ${L}`
          : phrase`${sets.capitalized()} contains ${L}`
        : plural
          ? phrase`None of ${sets} has ${L}`
          : phrase`${sets.capitalized()} has no ${L}`;
      return so({ look: phrase`${attn}. ${exclusion} ${has}`, move: act });
    }
    const has = known
      ? plural
        ? `they all contain ${L}`
        : `it contains ${L}`
      : plural
        ? `none of them has ${L}`
        : `it has no ${L}`;
    return so({ look: phrase`${attn}, and ${has}`, move: act });
  },

  /**
   * A rule-out step. The horseshoe needs a strictly smaller set at its subset
   * end and a strictly bigger one at its superset end (the help teaches why),
   * so a set with no such partner among the outlined sets, which are what the
   * outlined cell can still hold, cannot go here.
   */
  ruleOut: (
    rule: RuleOutMark,
    n: number,
    target: Point,
    via: Point,
    sets: readonly number[],
  ): Sentence => {
    const label = setLabel(rule.value, n);
    const partner = rule.why.head
      ? `a bigger set holding ${label}`
      : `a smaller set inside ${label}`;
    return so({
      look: phrase`no ${mark.as("outline", TALLY_SET, sets, "outlined set")} is ${partner}`,
      move: phrase`the horseshoe to ${outlinedCell([via])} rules ${mark.as("ring", TALLY_SET, [rule.value], label)} out of ${mark.this("ring", CELL, [target], "cell")}`,
    });
  },

  /** The example a collapse's premise gives: a competitor set and the visible
   * rule that blocks it, in the cell `blocker`. */
  exclusion: (ex: CollapseExclusion, n: number, blocker: Point): Narration => {
    const label = setLabel(ex.value, n);
    const b = ex.block;
    if (b.kind === "placed")
      return phrase`For instance, ${label} is already placed ${mark.paren("outline", CELL, [blocker], "on the board")}.`;
    if (b.kind === "arrow") {
      return b.mustContain
        ? phrase`For instance, the horseshoe to ${outlinedCell([blocker])} needs ${lettersOf(b.letters, n)} present, so ${label} can't go here.`
        : phrase`For instance, the horseshoe to ${outlinedCell([blocker])} won't allow ${lettersOf(b.letters, n)}, so ${label} can't go here.`;
    }
    return phrase`For instance, with no horseshoe to ${outlinedCell([blocker], "neighbor")}, neither set may contain the other, but ${label} would, so it can't go here.`;
  },
};
