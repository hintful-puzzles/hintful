import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { game } from "../../generated/games/kakurasu/kakurasu.game.ts";

// Rows 4, 9, 1, 4 and columns 4, 2, 3, 6: the answer is
//   # . # .
//   . # # #
//   # . . .
//   . . . #
const ID = "4x4:4,9,1,4,4,2,3,6";

describe("kakurasu", () => {
  it("outlines a square Check & Save finds wrong, which breaks no number yet", () => {
    // Row 2's first square is clear in the answer; shading it leaves every
    // number reachable, so only the mistake check can paint it.
    const errorOps = (showMistakes: boolean) =>
      renderScenario({ game, id: ID, moves: [{ set: [4, 1] }], showMistakes });
    const shown = errorOps(true);
    expect(shown.mistakeCount).toBe(1);
    const count = (r: typeof shown) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    expect(count(errorOps(false))).toBe(0);
    expect(count(shown)).toBeGreaterThan(0);
  });
});
