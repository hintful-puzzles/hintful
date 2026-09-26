// Tier-1 midend integration: drive the real `Midend` with the Twiddle
// game through a rotation, undo, redo, and solve, asserting the
// statusbar notifications and that a redraw paints the board.
import { beforeEach, describe, expect, it } from "vitest";
import { driveMidend } from "../../engine/testing/drive-midend.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { twiddleGame } from "./index.ts";

// 'A' rotates the top-left 2×2 block anticlockwise (dir -1).
const KEY_A = 0x41;

function harness() {
  const h = driveMidend(twiddleGame);
  const status = () => h.last("status-bar-change");
  return { m: h.midend, status };
}

describe("Twiddle midend lifecycle", () => {
  let h: ReturnType<typeof harness>;
  beforeEach(() => {
    h = harness();
    // A 3×3 board one anticlockwise turn of block (0,0) from solved:
    // 'A' (dir -1) at (0,0) restores 1..9.
    expect(h.m.newGameFromId("3x3n2:2,5,3,1,4,6,7,8,9")).toBeNull();
  });

  it("paints the board on a forced redraw", () => {
    const dr = new RecordingDrawing(h.m.getColorPalette(DEFAULT_BACKGROUND));
    h.m.forceRedraw(dr);
    expect(opsOfKind(dr.ops, "rect").length).toBeGreaterThan(0);
    // Bevel triangles per tile plus the two recessed-border bevels.
    expect(opsOfKind(dr.ops, "polygon").length).toBeGreaterThan(2);
    // One number per cell.
    expect(opsOfKind(dr.ops, "text").length).toBe(9);
  });

  it("rotates on a key and reports the move in the status bar", () => {
    expect(h.status()?.statusBarText).toContain("Moves: 0");
    expect(h.m.processInput(0, 0, KEY_A)).toBe(true);
    expect(h.status()?.statusBarText).toContain("COMPLETED!");
  });

  it("undo and redo restore the move count", () => {
    h.m.processInput(0, 0, KEY_A);
    expect(h.status()?.statusBarText).toContain("COMPLETED!");
    h.m.undo();
    expect(h.status()?.statusBarText).toContain("Moves: 0");
    h.m.redo();
    expect(h.status()?.statusBarText).toContain("COMPLETED!");
  });

  it("solve snaps to the solved board and reports auto-solve", () => {
    expect(h.m.solve()).toBeNull();
    expect(h.status()?.statusBarText).toContain("Moves since auto-solve");
  });
});
