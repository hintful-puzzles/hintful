// Seed for the in-process render-snapshot harness, on Palisade: frames reached
// through the real Midend and asserted with no browser and no human eyeball.
//
//  1. the `equivalentEdges` hint frame — both forced edges ringed, the
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
import { expectRing, ringsOf } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import {
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { palisadeGame } from "./index.ts";
import { COL_HINT_CELL } from "./render.ts";

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
    // Both forced edges are ringed, each by a pill drawn from both of its
    // cells, with what they must become inside (they share a fate, so they
    // share a shape): a wall as the edge, not a wall as a cross on it, two
    // strokes from each of its two cells. They lie over "the same region",
    // hatched, one hatch per cell of it, and outlined nowhere.
    const ringed = stepMarks(result.hint).of("ring", EDGE);
    expect(ringed.length).toBeGreaterThanOrEqual(2);
    expectRing(ops, { rings: 2 * ringed.length });
    const ink = ringsOf(ops)[0].color;
    const echoes = (kind: "rect" | "line"): number =>
      ops.filter((o) => o.op === kind && o.color === ink).length;
    if (ringed[0].kind === "wall") {
      expect(echoes("rect")).toBe(2 * ringed.length);
      expect(echoes("line")).toBe(0);
    } else {
      expect(echoes("line")).toBe(4 * ringed.length);
      expect(echoes("rect")).toBe(0);
    }
    const hatches = opsOfKind(ops, "hatch");
    expect(new Set(hatches.map((h) => `${h.x},${h.y}`)).size).toBe(
      stepMarks(result.hint).of("stripes", CELL).length,
    );
    expect(ops.filter((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toEqual([]);

    // Hatching the region does not erase the clues: digits are still drawn.
    expect(ops.some((o) => o.op === "text")).toBe(true);

    // The displayed step really is the equivalentEdges one (a sibling
    // edge, and a multi-cell hatched region).
    expect(isEquivalentEdgesFrame(result.hint)).toBe(true);
  });

  it("matches the opener-frame snapshot", () => {
    // A fixed descriptive board → a stable frame, exercising a different
    // rule than equivalentEdges. Its opening deduction rules out more than one
    // edge, so the first leg rings the firing's other edges, a cross inside
    // each, alongside the action edge: the grouped-journey rendering.
    const { recording, hint } = renderScenario({
      game: palisadeGame,
      id: "5x5n5:e21c2a31e222a1",
      showHint: true,
    });

    expect(hint).toBeDefined();
    expect(stepMarks(hint ?? undefined).of("ring", EDGE)[0].kind).toBe("nowall");
    const [ring] = ringsOf(recording.ops);
    expect(recording.ops.some((o) => o.op === "line" && o.color === ring.color)).toBe(
      true,
    );
    expect(recording.ops).toMatchSnapshot();
  });
});
