/**
 * Tier-2.5 render scenarios for the Pattern hint: drive a real Midend to a
 * displayed hint step and capture `redraw`. The targeted op assertions (the
 * `COL_HINT` ring, the line's hatch, the clue text, the grid frame)
 * stand beside the snapshot so a careless `vitest -u` cannot erase them.
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { type PatternHint, patternGame } from "./index.ts";
import { COL_GRID, COL_HINT, COL_HINT_BLACKREF } from "./render.ts";

const P = { w: 10, h: 10 };

function boardId(seed: string): string {
  const { desc } = patternGame.newDesc(P, randomNew(seed));
  return `10x10:${desc}`;
}

describe("Pattern hint render scenarios", () => {
  it("opener frame: a ringed COL_HINT target on a hatched line, clues intact", () => {
    const { recording, hint, size } = renderScenario({
      game: patternGame,
      id: boardId("pattern-hint-opener"),
      showHint: true,
    });

    // A hint step is on display.
    expect(hint).toBeDefined();
    const hl = hint?.highlights as PatternHint | undefined;
    expect(hl).toBeDefined();

    // The forced cell(s) are **ringed** COL_HINT — never filled with it, and
    // never pre-filled with the black/white the move will place.
    expectRing(recording.ops, COL_HINT, hl?.cells.length);
    // The reasoned line is hatched, every square of it and its clue strip, in
    // one strip.
    const hatches = opsOfKind(recording.ops, "hatch");
    const line = hl?.line ?? -1;
    expect(hatches).toHaveLength((line < P.w ? P.h : P.w) + 1);
    for (const h of hatches) expect(h.color).toBe(COL_HINT);
    // One strip: every rect's center across the line within a pixel or two of
    // the others (the clue strip starts at the cell's edge, a cell inside its
    // grid lines).
    const across = hatches.map((h) => (line < P.w ? h.x + h.w / 2 : h.y + h.h / 2));
    expect(Math.max(...across) - Math.min(...across)).toBeLessThanOrEqual(2);
    // The clue numbers are still drawn (the hint overlays, it doesn't erase).
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);
    // The outer grid frame is drawn.
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_GRID)).toBe(
      true,
    );
    // The board fills its declared size.
    expect(size.w).toBeGreaterThan(0);

    expect(recording.ops).toMatchSnapshot();
  });

  it("ringed-premise frame: a cited black mark rings COL_HINT_BLACKREF", () => {
    // Walk the plan to the first step that cites an already-placed black mark
    // (an overlap anchored by an earlier deduction), and assert the teal ring.
    const { recording, hint } = renderScenario({
      game: patternGame,
      id: boardId("pattern-hint-ring"),
      showHint: true,
      hintUntil: (step) => {
        const hl = step.highlights as PatternHint | undefined;
        return (hl?.blackRefs.length ?? 0) > 0;
      },
    });

    const hl = hint?.highlights as PatternHint | undefined;
    expect(hl?.blackRefs.length ?? 0).toBeGreaterThan(0);
    // The cited black premise is ringed in the black-reference color.
    expect(
      recording.ops.some((o) => o.op === "rect" && o.color === COL_HINT_BLACKREF),
    ).toBe(true);
  });
});
