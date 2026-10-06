/**
 * Tier-2.5 render scenarios for the Slant hint: drive a real Midend to a
 * displayed hint step and capture `redraw`. Targeted op assertions (the ringed
 * `COL_HINT` target, the recolored clue digit, the outlined `COL_HINT_CELL`
 * evidence) plus one snapshot, so a render regression is a reviewable text
 * diff.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { describeHintKindPins } from "../../engine/testing/hint-positions.ts";
import { expectRing, isThin, markSides } from "../../engine/testing/mark-shape.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import type { SlantHint } from "./hint.ts";
import { slantGame } from "./index.ts";
import { COL_GRID, COL_HINT, COL_HINT_CELL, COL_HINT_REF } from "./render.ts";
import { DIFF_EASY, DIFF_HARD } from "./state.ts";

const lit = (step: HintStep<unknown>): SlantHint => {
  if (!step.highlights) throw new Error("a Slant step always has highlights");
  return step.highlights as SlantHint;
};

const pinned = describeHintKindPins({
  game: slantGame,
  params: [
    { w: 5, h: 5, diff: DIFF_EASY },
    { w: 8, h: 8, diff: DIFF_HARD },
  ],
  kinds: {
    // A clue firing: it carries a driving clue.
    clue: (step) => lit(step).clues?.length === 1,
    loop: (step) => step.rung === "loop",
    // Always a plan's second step: asked afresh, the square it decides is
    // explained by another rung.
    equivalence: "equiv",
  },
  pins: {
    /** Held on 1060 of 1156 positions walked. */
    clue: "5x5de:e11a42c1b1c2b1a1a22a1e",
    /** Held on 59 of 1156 positions walked. */
    loop: {
      id: "8x8dh:j33a3a11b3b2b2d21c1b313131b32d1b12313g2a12b0c1c",
      moves:
        '[{"type":"set","x":0,"y":7,"v":1},{"type":"set","x":1,"y":7,"v":-1},{"type":"set","x":3,"y":3,"v":-1},{"type":"set","x":4,"y":3,"v":1},{"type":"alike","x":0,"y":1,"dir":"right","on":true},{"type":"set","x":0,"y":0,"v":-1},{"type":"set","x":1,"y":0,"v":1},{"type":"set","x":1,"y":1,"v":1},{"type":"set","x":0,"y":1,"v":1},{"type":"set","x":2,"y":1,"v":-1},{"type":"set","x":2,"y":0,"v":1},{"type":"set","x":0,"y":2,"v":1},{"type":"set","x":1,"y":2,"v":-1}]',
    },
    /** Held on 560 of 1156 positions walked. */
    equivalence: "8x8dh:1a111111a12c1e11c3112a21c1a13211a1b3b3b11b23a2d13131a1b1d1b",
  },
});

/** The frame a pinned position's hint draws, through a real `Midend`. */
function hintFrame(kind: Parameters<typeof pinned>[0]) {
  const result = renderPinnedHint(slantGame, pinned(kind));
  return { ...result, h: lit(result.step) };
}

describe("Slant hint render scenarios", () => {
  it("opener frame: ringed target(s), recolored clue digit, board intact", () => {
    const { recording, h, size } = hintFrame("clue");

    // The target and any siblings are **ringed**, four thin rects each and none
    // solid: a blue square in Slant would read as a slash already placed.
    expectRing(recording.ops, COL_HINT, 1 + (h.siblings?.length ?? 0));
    // The driving clue's digit recolors COL_HINT (the clue↔move tie).
    expect(recording.ops.some((o) => o.op === "text" && o.color === COL_HINT)).toBe(
      true,
    );
    // Other clue digits still drawn; the grid frame is present.
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);
    expect(recording.ops.some((o) => "color" in o && o.color === COL_GRID)).toBe(true);
    expect(size.w).toBeGreaterThan(0);

    expect(recording.ops).toMatchSnapshot();
  });

  it("loop frame: the closing chain outlines COL_HINT_CELL under one ringed target", () => {
    const { recording, h } = hintFrame("loop");

    expect(h.area?.length ?? 0).toBeGreaterThan(0);
    // Exactly one ringed target (loop firings force a single square).
    expectRing(recording.ops, COL_HINT);
    // The chain is **outlined**, not shaded: its squares carry the very
    // diagonals the deduction reasons from.
    const chain = markSides(recording.ops, COL_HINT_CELL);
    expect(chain.length).toBeGreaterThan(0);
    for (const s of chain) expect(isThin(s)).toBe(true);
  });

  it("equivalence frame: the cited anchor rings COL_HINT_REF", () => {
    const { recording, h } = hintFrame("equivalence");

    expect(h.ref).toBeDefined();
    expectRing(recording.ops, COL_HINT);
    expect(recording.ops.some((o) => "color" in o && o.color === COL_HINT_REF)).toBe(
      true,
    );
  });
});
