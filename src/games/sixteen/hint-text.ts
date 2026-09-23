/**
 * Every sentence Sixteen's hint speaks.
 *
 * Goal:tactic narration, shared in shape with Fifteen: the prefix names the
 * tile being worked toward home (the engine's `workingOn`), the tactic says
 * where this move sends it, and a trailing clause says *why* — ", its final
 * spot" when the journey ends in the tile's solved cell, else the shared staging
 * marker. Where it goes is the square outlined on the board, never a row or
 * column number the board does not draw; a two-leg preview outlines both
 * landings, and this move's is the nearer. Which tile, which squares and
 * whether it arrives are `index.ts`'s `narrateStep` to decide; this file decides
 * only how it reads.
 */

import { HINT_SETTING_UP, workingOn } from "../../engine/hint-text.ts";

export const say = {
  /**
   * One slide of `tile`'s journey, previewing the next when it continues the
   * same journey perpendicular to this one (`previews`). A continuation leg
   * (`continues`) repeats neither the verb nor the why — leg 0 of its journey
   * already carried both and is still on screen. `home` is whether the journey
   * ends in the tile's solved cell.
   */
  step: (p: {
    tile: number;
    continues: boolean;
    previews: boolean;
    home: boolean;
  }): string => {
    const to = p.previews ? "the nearer outlined square" : "the outlined square";
    let tactic = p.continues ? `then to ${to}` : `move it to ${to}`;
    if (p.previews) tactic += ", then the other";
    const suffix = p.continues
      ? ""
      : p.home
        ? ", its final spot"
        : ` ${HINT_SETTING_UP}`;
    return `${workingOn(p.tile)}${tactic}${suffix}.`;
  },
};
