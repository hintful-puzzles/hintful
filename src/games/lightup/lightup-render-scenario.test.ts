/**
 * Tier-2.5 render scenarios for the Light Up hint: drive a real Midend to
 * a displayed hint step and capture `redraw`. Targeted op assertions (the
 * blue `COL_HINT` targets, the `COL_HINT_CELL` evidence shade, the violet
 * dark-square ring) plus one snapshot so a render regression is a
 * reviewable text diff (`vitest -u` re-baselines an intended change; the
 * targeted assertions survive a careless `-u`).
 *
 * Each frame is a pinned position whose hint opens with the firing.
 */
import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { SYMM_ROT4 } from "../../engine/symmetric-blacks.ts";
import { describeHintKindPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { lightupGame } from "./index.ts";
import {
  COL_GRID,
  COL_HINT,
  COL_HINT_CELL,
  COL_HINT_DARKREF,
  COL_HINT_LITERF,
} from "./render.ts";
import type { LightupParams } from "./state.ts";

const EASY: LightupParams = { w: 7, h: 7, blackpc: 20, symm: SYMM_ROT4, difficulty: 0 };
const TRICKY: LightupParams = { ...EASY, difficulty: 1 };

/** Each firing's frame, by the shape of its marks rather than its wording, so
 * a pin survives a rewording of the sentence. */
const pinned = describeHintKindPins({
  game: lightupGame,
  params: [EASY, TRICKY],
  kinds: {
    // A clue that forces several bulbs at once.
    clueSaturated: (step) =>
      step.highlights?.kind === "light" &&
      step.highlights.targets.length > 1 &&
      step.highlights.clue !== undefined,
    forcedLight: (step) =>
      step.rung === "forcedLight" &&
      step.highlights?.dark !== undefined &&
      // an outlined square beside the dark one: the corridor
      stepMarks(step).of("outline", CELL).length > 1,
    clueSatisfied: (step) =>
      step.highlights?.kind === "impossible" && step.highlights.targets.length > 1,
    // `discountUnlit` is the only firing that crosses a square out while
    // ringing a dark one.
    discount: (step) =>
      step.highlights?.kind === "impossible" &&
      step.highlights.dark !== undefined &&
      step.highlights.targets.length === 1,
  },
  pins: {
    /** Held on 41 of 282 positions walked. */
    clueSaturated: "7x7b20s4d0:bBe2c3c3aBaBgBaBaBcBc2e3b",
    /** Held on 32 of 282 positions walked. */
    forcedLight: {
      id: "7x7b20s4d0:a2aBi3cBcBaBaBa2cBc0i0aBa",
      moves:
        '[{"ops":[{"kind":"impossible","x":1,"y":5},{"kind":"impossible","x":0,"y":4},{"kind":"impossible","x":0,"y":6}]},{"ops":[{"kind":"light","x":3,"y":3}]},{"ops":[{"kind":"impossible","x":2,"y":6},{"kind":"impossible","x":4,"y":6},{"kind":"impossible","x":3,"y":5}]}]',
    },
    /** Held on 41 of 282 positions walked. */
    clueSatisfied: "7x7b20s4d0:i21hBbBaBa1b0h13i",
    /** Held on 15 of 282 positions walked. */
    discount: {
      id: "7x7b20s4d1:b1h3cBd1g0d3c2hBb",
      moves:
        '[{"ops":[{"kind":"impossible","x":1,"y":4},{"kind":"impossible","x":0,"y":3},{"kind":"impossible","x":0,"y":5}]}]',
    },
  },
});

/** The frame a pinned position's hint draws, through a real `Midend`. */
function hintFrame(kind: Parameters<typeof pinned>[0]) {
  const result = renderPinnedHint(lightupGame, pinned(kind));
  const { step } = result;
  if (!step.highlights) throw new Error("a Light Up step always has highlights");
  return { recording: result.recording, size: result.size, h: step.highlights };
}

describe("Light Up hint render scenarios", () => {
  it("opener frame: grouped ringed targets, recolored clue digit, board intact", () => {
    const { recording, h, size } = hintFrame("clueSaturated");
    expect(h.targets.length).toBeGreaterThan(1);
    expect(h.clue).toBeDefined();

    // Every target is **ringed** COL_HINT (a mark, not the bulb the player must
    // place) — four thin rects each, and no solid one.
    expectRing(recording.ops, COL_HINT, h.targets.length);
    // The driving clue's digit recolors COL_HINT (the clue↔move tie).
    expect(recording.ops.some((o) => o.op === "text" && o.color === COL_HINT)).toBe(
      true,
    );
    // Clue digits elsewhere still drawn; the grid frame is present.
    expect(recording.ops.some((o) => o.op === "text" && o.color !== COL_HINT)).toBe(
      true,
    );
    expect(recording.ops.some((o) => "color" in o && o.color === COL_GRID)).toBe(true);
    expect(size.w).toBeGreaterThan(0);

    expect(recording.ops).toMatchSnapshot();
  });

  it("forcedLight frame: corridor shaded, dark square ringed violet, one blue target", () => {
    const { recording, h } = hintFrame("forcedLight");
    expect(h.dark).toBeDefined();
    // One ringed target; corridor evidence cues (shade on a dark square,
    // green ring on a lit one, so at least one of the two cues must appear);
    // the violet ring.
    expectRing(recording.ops, COL_HINT);
    expect(
      recording.ops.some(
        (o) =>
          (o.op === "rect" && o.color === COL_HINT_CELL) ||
          (o.op === "line" && o.color === COL_HINT_LITERF),
      ),
    ).toBe(true);
    expect(
      recording.ops.some((o) => "color" in o && o.color === COL_HINT_DARKREF),
    ).toBe(true);
  });

  it("clueSatisfied frame: grouped impossible-mark targets are all ringed", () => {
    const { recording, h } = hintFrame("clueSatisfied");
    expect(h.kind).toBe("impossible");
    expectRing(recording.ops, COL_HINT, h.targets.length);
  });

  it("discount frame: the dark square rings violet over its shaded rule-out set", () => {
    const { recording, h } = hintFrame("discount");
    expect(h.kind).toBe("impossible");
    expect(h.targets.length).toBe(1);
    expect(
      recording.ops.some((o) => "color" in o && o.color === COL_HINT_DARKREF),
    ).toBe(true);
    expect(
      recording.ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL),
    ).toBe(true);
  });
});
