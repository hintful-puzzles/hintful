/**
 * Tier-2.5 render scenarios for Rectangles: drive a real Midend to a target
 * frame and capture `redraw`. Targeted op assertions (number text, the gray
 * correct-rectangle fill after solving, the red mistake overlay) plus a
 * snapshot so a render regression is a reviewable text diff (`vitest -u`
 * re-baselines; the targeted assertions survive a careless `-u`).
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY } from "../../engine/answer-search.ts";
import { randomNew } from "../../engine/random/index.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import { type Flash, sweepStep } from "../../engine/win-wave.ts";
import { newDesc } from "./generator.ts";
import { rectGame } from "./index.ts";
import { newState } from "./moves.ts";
import {
  BORDER,
  COL_CORRECT,
  COL_FLASH,
  COL_FLASH_LEAD,
  COL_MISTAKE,
  PREFERRED_TILE_SIZE,
} from "./render.ts";
import type { RectMove, RectParams } from "./state.ts";

const P: RectParams = { w: 7, h: 7, expandfactor: 0, diff: DIFF_EASY };
const ID = `${rectGame.encodeParams(P, true)}#rect-scenario`;

describe("rect render scenarios", () => {
  it("opener frame: number text drawn, no correct-fill yet", () => {
    const { recording } = renderScenario({ game: rectGame, id: ID });
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);
    // Nothing is complete on a blank board, so no gray correct fill.
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_CORRECT)).toBe(
      false,
    );
    expect(recording.ops).toMatchSnapshot();
  });

  it("solved frame: gray correct fill covers the board", () => {
    // Build the solve move from the same id's board.
    const { desc } = newDesc(P, randomNew("rect-scenario"));
    const st = newState(P, desc);
    const solveMove = rectGame.solve?.(st, st, undefined);
    if (!solveMove?.ok) throw new Error("unsolvable");
    const { recording } = renderScenario({
      game: rectGame,
      id: ID,
      moves: [solveMove.move],
    });
    // Every cell is correct → gray COL_CORRECT fill appears; flash is 0 here.
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_CORRECT)).toBe(
      true,
    );
  });

  it("win flash: lights each cell's ground in turn, bottom left to top right", () => {
    const { desc } = newDesc(P, randomNew("rect-scenario"));
    const st = newState(P, desc);
    const solveMove = rectGame.solve?.(st, st, undefined);
    if (!solveMove?.ok) throw new Error("unsolvable");
    const solved = rectGame.executeMove(st, solveMove.move);
    const TS = PREFERRED_TILE_SIZE;
    const paint = (flash: Flash) => {
      const dr = new RecordingDrawing(rectGame.colors(DEFAULT_BACKGROUND));
      const ds = preferredDrawState(rectGame, solved);
      rectGame.redraw(dr, ds, null, solved, 1, rectGame.newUi(solved), 0, flash);
      return dr.ops;
    };
    // The cells whose ground is the flash color, each as its index.
    // Lit is either tone of the highlight, and the flash shows both.
    const tones = new Set<number>();
    const isLit = (color: number) =>
      (color === COL_FLASH || color === COL_FLASH_LEAD) && tones.add(color).size > 0;
    const run = winFlashRun(paint, (ops) =>
      ops.flatMap((o) =>
        o.op === "rect" && o.w === TS - 1 && o.h === TS - 1 && isLit(o.color)
          ? [((o.y - 1 - BORDER) / TS) * P.w + (o.x - 1 - BORDER) / TS]
          : [],
      ),
    );
    expectWinFlashTravels(run, P.w * P.h, (i) =>
      sweepStep(i % P.w, Math.floor(i / P.w)),
    );
    expect(tones.size).toBe(2);
  });

  it("mistake frame: a wrong wall shows the red overlay", () => {
    const { desc } = newDesc(P, randomNew("rect-scenario"));
    const st = newState(P, desc);
    const solveMove = rectGame.solve?.(st, st, undefined);
    if (!solveMove?.ok) throw new Error("unsolvable");
    const solved = rectGame.executeMove(st, solveMove.move);
    // Find an interior vedge not in the solution.
    let wrong: RectMove | null = null;
    for (let y = 0; y < P.h && !wrong; y++)
      for (let x = 1; x < P.w; x++)
        if (!solved.vedge[y * P.w + x]) {
          wrong = { type: "edge", edge: "v", x, y };
          break;
        }
    if (!wrong) throw new Error("no free edge");
    const { recording, mistakeCount } = renderScenario({
      game: rectGame,
      id: ID,
      moves: [wrong],
      showMistakes: true,
    });
    expect(mistakeCount).toBeGreaterThan(0);
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_MISTAKE)).toBe(
      true,
    );
  });
});
