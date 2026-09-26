// Tier-1 midend integration: drive the real `Midend` with Flood through
// a winning fill, a losing fill (exhausting the limit → "lost"), undo /
// redo, a forced redraw, and a hint.
import { describe, expect, it } from "vitest";
import { CURSOR_RIGHT, CURSOR_SELECT } from "../../engine/pointer.ts";
import { driveMidend } from "../../engine/testing/drive-midend.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { floodGame } from "./index.ts";

function harness() {
  const h = driveMidend(floodGame);
  const status = () => h.last("game-state-change")?.status;
  const statusBar = () => h.last("status-bar-change");
  /** A forced redraw, recorded. */
  const painted = () => {
    const dr = new RecordingDrawing(h.midend.getColorPalette(DEFAULT_BACKGROUND));
    h.midend.forceRedraw(dr);
    return dr.ops;
  };
  return { m: h.midend, status, statusBar, painted };
}

describe("Flood midend lifecycle", () => {
  it("paints the board on a forced redraw", () => {
    const h = harness();
    // 3×3, three colors, generous limit.
    expect(h.m.newGameFromId("3x3c3m9:011000222,9")).toBeNull();
    const ops = h.painted();
    // Background + recessed bevels + one rect per tile.
    expect(opsOfKind(ops, "rect").length).toBeGreaterThanOrEqual(9);
    expect(opsOfKind(ops, "polygon").length).toBe(2);
  });

  it("a fill advances the move counter", () => {
    const h = harness();
    expect(h.m.newGameFromId("3x3c3m9:011000222,9")).toBeNull();
    expect(h.statusBar()?.statusBarText).toContain("0 / 9 moves");
    // Move the cursor to (1,0) (color 1) and fill.
    expect(h.m.processInput(0, 0, CURSOR_RIGHT)).toBe(true);
    expect(h.m.processInput(0, 0, CURSOR_SELECT)).toBe(true);
    expect(h.statusBar()?.statusBarText).toContain("1 / 9 moves");
  });

  it("completing within the limit reports solved", () => {
    const h = harness();
    // 2×1 board: corner color 0, other cell color 1 — one fill wins.
    expect(h.m.newGameFromId("2x1c3m5:01,5")).toBeNull();
    expect(h.status()).toBe("ongoing");
    h.m.processInput(0, 0, CURSOR_RIGHT); // cursor to (1,0)
    h.m.processInput(0, 0, CURSOR_SELECT); // fill color 1
    expect(h.status()).toBe("solved");
    expect(h.statusBar()?.statusBarText).toContain("COMPLETED!");
  });

  it("exhausting the limit unsolved reports lost", () => {
    const h = harness();
    // 3×1 board 0,1,2 with limit 1: a single fill cannot complete it.
    expect(h.m.newGameFromId("3x1c3m1:012,1")).toBeNull();
    h.m.processInput(0, 0, CURSOR_RIGHT); // cursor to (1,0), color 1
    h.m.processInput(0, 0, CURSOR_SELECT); // fill color 1 → 1,1,2 (incomplete)
    expect(h.status()).toBe("lost");
    expect(h.statusBar()?.statusBarText).toContain("FAILED!");
  });

  it("undo and redo restore the move count", () => {
    const h = harness();
    expect(h.m.newGameFromId("3x3c3m9:011000222,9")).toBeNull();
    h.m.processInput(0, 0, CURSOR_RIGHT);
    h.m.processInput(0, 0, CURSOR_SELECT);
    expect(h.statusBar()?.statusBarText).toContain("1 / 9 moves");
    h.m.undo();
    expect(h.statusBar()?.statusBarText).toContain("0 / 9 moves");
    h.m.redo();
    expect(h.statusBar()?.statusBarText).toContain("1 / 9 moves");
  });

  it("surfaces a hint and renders its SOLNNEXT circle", () => {
    const h = harness();
    expect(h.m.newGameFromId("3x3c3m9:011000222,9")).toBeNull();
    expect(h.m.hint()).toBeNull();
    // The hint highlights the next-fill squares with a separator-color
    // circle (palette index 1).
    expect(opsOfKind(h.painted(), "circle").some((o) => o.fill === 1)).toBe(true);
  });
});
