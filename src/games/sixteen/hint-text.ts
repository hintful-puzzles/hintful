/**
 * Every sentence Sixteen's hint speaks.
 *
 * Goal:tactic narration, shared in shape with Fifteen: the prefix names the
 * tile being worked toward home (the sentence's aim), the tactic says
 * where this move sends it, and a trailing clause says *why* — ", its final
 * spot" when the journey ends in the tile's solved cell, else the shared staging
 * marker. Where it goes is a square marked on the board, never a row or column
 * number the board does not draw; a two-leg preview marks both landings, and
 * this move's is the nearer. Which tile, which squares and whether it arrives
 * are `index.ts`'s `narrateStep` to decide; this file decides only how it reads.
 *
 * Everything a step marks is what it decides, so everything is ringed in the
 * roles of `engine/hint-words.ts`, whatever its glyph: the tile to move (filled,
 * with the arrow to click beside its line) and the squares its journey lands on
 * (outlined, the nearer dashed). The words that point at them are references.
 */

import { HINT_SETTING_UP } from "../../engine/hint-text.ts";
import {
  type MarkKind,
  mark,
  Narration,
  phrase,
  type Sentence,
  sentence,
} from "../../engine/hint-words.ts";

/** A tile, by its number, wherever it sits; its mark includes the arrow that
 * slides it. */
export const TILE: MarkKind<number> = { name: "tile", key: (t) => `${t}` };

/** A square of the board, by flat index. */
export const SQUARE: MarkKind<number> = { name: "square", key: (i) => `${i}` };

export const say = {
  /**
   * One slide of `tile`'s journey to `target`, previewing the next landing,
   * `onward`, when the next move continues the same journey perpendicular to
   * this one. A continuation leg (`continues`) repeats neither the verb's
   * setup nor the why — leg 0 of its journey already carried both and is still
   * on screen. `home` is whether the journey ends in the tile's solved cell.
   */
  step: (p: {
    tile: number;
    target: number;
    onward: number | null;
    continues: boolean;
    home: boolean;
  }): Sentence => {
    const it = mark.as("ring", TILE, [p.tile], "it");
    const to =
      p.onward === null
        ? mark.as("ring", SQUARE, [p.target], "the ringed square")
        : phrase`${mark.as("ring", SQUARE, [p.target], "the nearer ringed square")}, then ${mark.as("ring", SQUARE, [p.onward], "the other")}`;
    const tactic = p.continues
      ? phrase`move ${it} on to ${to}`
      : phrase`move ${it} to ${to}`;
    const suffix = p.continues
      ? ""
      : p.home
        ? ", its final spot"
        : ` ${HINT_SETTING_UP}`;
    // A continuation leg serves the same aim with nothing more to say: its
    // first leg is still on screen.
    return sentence({
      aim: Narration.plain(`tile ${p.tile}`),
      move: phrase`${tactic}${suffix}`,
      relation: { kind: "serves" },
    });
  },
};
