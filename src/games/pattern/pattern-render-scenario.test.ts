/**
 * Tier-2.5 render scenarios for the Pattern hint: drive a real Midend to a
 * displayed hint step and capture `redraw`. The targeted op assertions (the
 * `COL_HINT` ring, the line's hatch, the clue text, the grid frame)
 * stand beside the snapshot so a careless `vitest -u` cannot erase them.
 */
import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { describeHintKindPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import {
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { cellAt, LINE } from "./hint-marks.ts";
import { type PatternHint, patternGame } from "./index.ts";
import { COL_GRID, COL_HINT, COL_HINT_BLACKREF } from "./render.ts";
import { deduceHintPlan } from "./solver.ts";

const P = patternGame.decodeParams("10x10");

/** A position whose hint opens with a step citing a black mark on the board.
 * The hint's steps are the solver's firings in order, so the step a plan opens
 * with is the first firing. */
const pinned = describeHintKindPins({
  game: patternGame,
  params: [P],
  kinds: {
    citesBlack: (_, state) => (deduceHintPlan(state)[0]?.blackRefs.length ?? 0) > 0,
  },
  pins: {
    /** Held on 215 of 736 positions walked. */
    citesBlack: {
      id: "10x10:3.4/3.3/3.3/1.1.1.1/7/3.2/3.1/4/3/3.1/3.3/3.4/4.5/4/3.1/1/5/3.1/6/1.3",
      moves:
        '[{"type":"fillCells","value":1,"cells":[20]},{"type":"fillCells","value":1,"cells":[60,70]},{"type":"fillCells","value":1,"cells":[34,44,54,64]},{"type":"fillCells","value":1,"cells":[12]}]',
    },
  },
});

describe("Pattern hint render scenarios", () => {
  it("opener frame: a ringed COL_HINT target on a hatched line, clues intact", () => {
    const { recording, hint, size } = renderScenario({
      game: patternGame,
      id: "10x10:1.3/2.3/7/7.2/7.2/1.1.1.2/1.1.1.1/1/1.1/4/6/4/5/3/5/5/5.1.2/2.1/7/3.1",
      showHint: true,
    });

    // A hint step is on display.
    expect(hint).toBeDefined();
    const hl = hint?.highlights as PatternHint | undefined;
    expect(hl).toBeDefined();

    // The forced cell(s) are **ringed** COL_HINT — never filled with it, and
    // never pre-filled with the piece or dot the move will place.
    expectRing(recording.ops, COL_HINT, hl?.cells.length);
    // The reasoned line is hatched, every square of it and its clue strip, in
    // one strip.
    const hatches = opsOfKind(recording.ops, "hatch");
    const [line] = stepMarks(hint).of("stripes", LINE);
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
    // A step that cites an already-placed black mark (an overlap anchored by
    // an earlier deduction) rings it teal.
    const position = pinned("citesBlack");
    const [cited] = deduceHintPlan(position.state);
    const { recording, hint } = renderPinnedHint(patternGame, position);

    expect((hint?.highlights as PatternHint).cells).toEqual(cited.cells);
    expect(stepMarks(hint).of("outline", CELL)).toEqual(
      expect.arrayContaining(cited.blackRefs.map((i) => cellAt(i, P.w))),
    );
    // The cited black premise is ringed in the black-reference color.
    expect(
      recording.ops.some((o) => o.op === "rect" && o.color === COL_HINT_BLACKREF),
    ).toBe(true);
  });
});
