// Seed for the in-process render-snapshot harness, on Palisade: frames reached
// through the real Midend and asserted with no browser and no human eyeball.
//
//  1. the `equivalentEdges` hint frame — both forced edges COL_HINT, the
//     referenced region outlined in COL_HINT_CELL, clue digits still drawn
//     (the spec's "hint frame asserted without a browser" scenario);
//  2. a fixed opener frame snapshot — a render regression is a
//     reviewable text diff (the spec's "render regression is a snapshot
//     diff" scenario).
import { describe, expect, it } from "vitest";
import { EDGE } from "../../engine/border-grid-hint.ts";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { describeHintKindPins } from "../../engine/testing/hint-positions.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import {
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { palisadeGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL } from "./render.ts";

// What an equivalentEdges frame marks: a sibling edge AND a hatched *region*
// (more than one cell). numberExhausted journeys carry siblings too, but
// outline a single clue cell.
const isEquivalentEdgesFrame = (step?: HintStep<unknown>): boolean =>
  stepMarks(step).of("ring", EDGE).length > 1 &&
  stepMarks(step).of("stripes", CELL).length > 1;

/** A position whose hint opens with an `equivalentEdges` deduction. */
const pinned = describeHintKindPins({
  game: palisadeGame,
  params: [palisadeGame.decodeParams("5x5n5"), palisadeGame.decodeParams("8x6n6")],
  kinds: { equivalentEdges: (step) => step.rung === "equivalentEdges" },
  pins: {
    /** Held on 56 of 1307 positions walked. */
    equivalentEdges: {
      id: "5x5n5:c2d2d22a13b222",
      moves:
        '[{"type":"edges","edits":[{"x":0,"y":4,"flag":16},{"x":0,"y":3,"flag":64}]},{"type":"edges","edits":[{"x":0,"y":4,"flag":32},{"x":1,"y":4,"flag":128}]}]',
    },
  },
});

describe("Palisade render scenarios", () => {
  it("reaches the equivalentEdges hint frame in-process and paints it", () => {
    const result = renderPinnedHint(palisadeGame, pinned("equivalentEdges"));
    const ops = result.recording.ops;
    const ofKind = (kind: "rect" | "line", color: number): number =>
      ops.filter((o) => o.op === kind && o.color === color).length;

    // Both forced edges are drawn in COL_HINT as what they must become (they
    // share a fate, so they share a shape): a wall as the edge, not a wall as
    // a cross on it, two strokes from each of its two cells. They lie over
    // "the same region", hatched, one hatch per cell of it, and outlined
    // nowhere.
    const ringed = stepMarks(result.hint).of("ring", EDGE);
    expect(ringed.length).toBeGreaterThanOrEqual(2);
    if (ringed[0].kind === "wall") {
      expect(ofKind("rect", COL_HINT)).toBeGreaterThanOrEqual(ringed.length);
      expect(ofKind("line", COL_HINT)).toBe(0);
    } else {
      expect(ofKind("line", COL_HINT)).toBe(4 * ringed.length);
      expect(ofKind("rect", COL_HINT)).toBe(0);
    }
    const hatches = opsOfKind(ops, "hatch");
    expect(new Set(hatches.map((h) => `${h.x},${h.y}`)).size).toBe(
      stepMarks(result.hint).of("stripes", CELL).length,
    );
    expect(ofKind("rect", COL_HINT_CELL)).toBe(0);

    // Hatching the region does not erase the clues: digits are still drawn.
    expect(ops.some((o) => o.op === "text")).toBe(true);

    // The displayed step really is the equivalentEdges one (a sibling
    // edge, and a multi-cell hatched region).
    expect(isEquivalentEdgesFrame(result.hint)).toBe(true);
  });

  it("matches the opener-frame snapshot", () => {
    // A fixed descriptive board → a stable frame, exercising a different
    // rule than equivalentEdges. Its opening deduction rules out more than one
    // edge, so the first leg crosses the firing's other edges in COL_HINT
    // alongside the action edge: the grouped-journey rendering.
    const { recording, hint } = renderScenario({
      game: palisadeGame,
      id: "5x5n5:e21c2a31e222a1",
      showHint: true,
    });

    expect(hint).toBeDefined();
    expect(stepMarks(hint ?? undefined).of("ring", EDGE)[0].kind).toBe("nowall");
    expect(recording.ops.some((o) => o.op === "line" && o.color === COL_HINT)).toBe(
      true,
    );
    expect(recording.ops).toMatchSnapshot();
  });
});
