import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { game } from "../../generated/games/kakurasu/kakurasu.game.ts";

/** A position for every kind of step. */
describeHintPins({
  game,
  params: [
    { w: 5, h: 5, diff: 0 },
    { w: 5, h: 5, diff: 1 },
    { w: 7, h: 7, diff: 0 },
    { w: 7, h: 7, diff: 1 },
  ],
  pins: {
    /** Held on 839 of 901 positions walked. */
    lineMet: "5x5de:11,0,14,6,9,9,4,8,4,13",
    /** Held on 901 of 901 positions walked. */
    lineFull: "5x5de:6,3,10,7,1,15,9,3,7,1",
    /** Held on 708 of 901 positions walked. */
    tooMuch: "5x5de:4,13,3,8,3,14,8,6,7,2",
    /** Held on 304 of 901 positions walked. */
    everyWay: "7x7dn:12,12,22,11,24,10,16,12,15,10,11,12,25,16",
    /** Held on 58 of 901 positions walked. */
    noWay: {
      id: "7x7dn:14,4,19,12,12,11,13,28,11,10,11,12,15,10",
      moves:
        '[{"set":[0,1,7,1,14,1,21,1,28,1,35,1,42,1]},{"set":[10,2,11,2,12,2,13,2]},{"set":[9,1]},{"set":[8,2]}]',
    },
  },
});

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
