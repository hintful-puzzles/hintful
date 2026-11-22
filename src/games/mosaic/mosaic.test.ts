/**
 * Mosaic, born from its description: what only this game's statements decide.
 * The engine's own tests read fill games for the digit runs, the deal's
 * setting, the hide, the search tier, the numbers on their cells and the
 * clear square (`engine/fill/*.test.ts`), and the cross-game guards reach it
 * as a registered game. What is left here is a position for every kind of
 * step its hint takes, upstream's IDs read as the right numbers, the numbers
 * a step reasons from circled, the numbers left counted, and a wrong square
 * outlined.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR, COL_HINT_OUTLINE } from "../../engine/color/roles.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import type { DrawOp } from "../../engine/testing/recording-drawing.ts";
import {
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { game } from "../../generated/games/mosaic/mosaic.game.ts";

const SHADED = 1;
const CLEAR = 2;

/** A position for every kind of step. */
const pinned = describeHintPins({
  game,
  params: [
    { w: 10, h: 10, diff: 0, thorough: true },
    { w: 10, h: 10, diff: 2, thorough: true },
  ],
  pins: {
    "alone.met":
      "10x10:0c4a5c2a3456b5a25a655b3b55a5a20a22a44b11c4a232c14a3c5f5c8d44d4b3d5c",
    "alone.exact":
      "10x10:c3c4442a4a5a44b3a4a4d53b3a133b23a3b4a7a1a2a5b3c323g212a5b5a0b32a2e02e2",
    "compared.more":
      "10x10du:a42b35d5a4c6a4b335b4743f67b5543b5b5b6a4f4a443b3a44a4b55e2345a4a433a1d",
    "compared.same": {
      id: "10x10du:a6b2c2c5c1g3c2a33a5a32d435c55c44a43d23a2a455a1d4a5b2f34d64e",
      moves:
        '[{"set":[0,1,1,1,2,1,10,1,11,1,12,1]},{"set":[82,1,83,1,84,1,92,1,93,1,94,1]},{"set":[85,2,95,2]}]',
    },
  },
});

/** The numbers a frame circles, one per circle: a circle is round a number
 * when the number's text is drawn at its center. */
function circledNumbers(ops: readonly DrawOp[]): string[] {
  const centers = new Set<string>();
  for (const o of ops)
    if (o.op === "circle" && o.fill === -1) centers.add(`${o.cx},${o.cy}`);
  return [...centers].map((c) => {
    const text = ops.find((o) => o.op === "text" && `${o.x},${o.y}` === c);
    return text?.op === "text" ? text.text : "none";
  });
}

describe("mosaic", () => {
  it("reads upstream's run code as the numbers on their squares", () => {
    // A digit is a shown number, a letter a run of squares without one, and
    // the last run is written.
    const board = game.newState(game.decodeParams("3x3"), "1a2a4a1a3");
    expect(Array.from(board.dealt.count.at)).toEqual([0, 2, 4, 6, 8]);
    expect(Array.from(board.dealt.count.v)).toEqual([1, 2, 4, 1, 3]);
    expect(game.newState(game.decodeParams("3x3"), "i").dealt.count.at).toHaveLength(0);
  });

  it.each([
    "alone.met",
    "alone.exact",
    "compared.more",
    "compared.same",
  ] as const)("circles each number a %s step names, and outlines its block", (rung) => {
    const { recording, hint } = renderPinnedHint(game, pinned(rung));
    // The numbers the sentence names, by their values: "this 3", "the upper
    // 7", "Both 5s".
    const said = [
      ...hint.explanation.matchAll(/(?:[Tt]his|[Tt]he \w+|Both) (\d)\b/g),
    ].map((m) => m[1]);
    const circled = circledNumbers(recording.ops);
    expect(circled.length).toBe(rung.startsWith("compared") ? 2 : 1);
    if (!hint.explanation.startsWith("Both"))
      expect(circled.sort()).toEqual(said.slice(0, circled.length).sort());
    expect(
      recording.ops.some((o) => o.op === "rect" && o.color === COL_HINT_OUTLINE),
    ).toBe(true);
  });

  it("counts the numbers left, and says nothing once every one is done", () => {
    const p = game.decodeParams("3x3");
    const board = game.newState(p, "1a2a4a1a3");
    expect(game.statusbarText?.(board, game.newUi(board))).toBe("Clues left: 5");
    const solved = game.solve(board, board);
    if (!solved.ok) throw new Error("no answer");
    const done = game.executeMove(board, solved.move);
    expect(game.statusbarText?.(done, game.newUi(done))).toBe("");
  });

  it("outlines a square Check & Save finds wrong, which breaks no number yet", () => {
    const id =
      "10x10:0c4a5c2a3456b5a25a655b3b55a5a20a22a44b11c4a232c14a3c5f5c8d44d4b3d5c";
    const fresh = game.newState(game.decodeParams("10x10"), id.split(":")[1]);
    const solved = game.solve(fresh, fresh);
    if (!solved.ok) throw new Error("no answer");
    const answer = game.executeMove(fresh, solved.move).values;
    const count = (r: ReturnType<typeof renderScenario>) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    for (let c = 0; c < answer.length; c++) {
      const moves = [{ set: [c, answer[c] === SHADED ? CLEAR : SHADED] }];
      if (count(renderScenario({ game, id, moves })) > 0) continue;
      const shown = renderScenario({ game, id, moves, showMistakes: true });
      expect(shown.mistakeCount).toBe(1);
      expect(count(shown)).toBeGreaterThan(0);
      return;
    }
    throw new Error("no wrong square that breaks no number");
  });
});
