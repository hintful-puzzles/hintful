// Tier-1 midend integration: drive the real `Midend` with the Fifteen
// game through a slide, undo, redo, and a hint, asserting the
// statusbar notifications and that a redraw paints the board.
import { beforeEach, describe, expect, it } from "vitest";
import { CURSOR_LEFT } from "../../engine/pointer.ts";
import { driveMidend } from "../../engine/testing/drive-midend.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { fifteenGame } from "./index.ts";

function harness() {
  const h = driveMidend(fifteenGame);
  const status = () => h.last("status-bar-change");
  /** A forced redraw, recorded. */
  const painted = () => {
    const dr = new RecordingDrawing(h.midend.getColorPalette(DEFAULT_BACKGROUND));
    h.midend.forceRedraw(dr);
    return dr.ops;
  };
  return { m: h.midend, status, painted };
}

describe("Fifteen midend lifecycle", () => {
  let h: ReturnType<typeof harness>;
  beforeEach(() => {
    h = harness();
    // A 4×4 board with the gap at (0,3): tiles 13,14,15 are shifted one
    // cell right of home, so a single rightward slide is legal and the
    // board is not already solved.
    expect(h.m.newGameFromId("4x4:1,2,3,4,5,6,7,8,9,10,11,12,0,13,14,15")).toBeNull();
  });

  it("paints the board on a forced redraw", () => {
    const ops = h.painted();
    // A background rect, the two recessed-border bevels, and a numbered
    // beveled tile (3 polygons each) for every non-gap cell.
    expect(opsOfKind(ops, "rect").length).toBeGreaterThan(0);
    expect(opsOfKind(ops, "polygon").length).toBeGreaterThan(2);
    expect(opsOfKind(ops, "text").length).toBe(15);
  });

  it("slides on a cursor key and reports the move in the status bar", () => {
    expect(h.status()?.statusBarText).toContain("Moves: 0");
    // Default arrow semantics: CURSOR_LEFT moves a tile left, i.e. the
    // gap moves right — legal from (0,3).
    expect(h.m.processInput(0, 0, CURSOR_LEFT)).toBe(true);
    expect(h.status()?.statusBarText).toContain("Moves: 1");
  });

  it("undo and redo restore the move count", () => {
    h.m.processInput(0, 0, CURSOR_LEFT);
    expect(h.status()?.statusBarText).toContain("Moves: 1");
    h.m.undo();
    expect(h.status()?.statusBarText).toContain("Moves: 0");
    h.m.redo();
    expect(h.status()?.statusBarText).toContain("Moves: 1");
  });

  it("surfaces a hint and renders it with the hint color", () => {
    // hint() returns undefined on success.
    expect(h.m.hint()).toBeNull();
    // The hinted tile is filled with COL_HINT (palette index 4).
    expect(opsOfKind(h.painted(), "rect").some((o) => o.color === 4)).toBe(true);
  });

  it("stretches a hint-executed move to the uniform 1s, despite Fifteen's 0.13s base", () => {
    // Fifteen's own slide (0.13s) is far shorter than the auto-hint dwell, so
    // a hint move stretches to HINT_ANIM_S (1.0s): the dwell is filled by
    // continuous motion, not a pause.
    const mPrivate = h.m as unknown as { animLength: number };

    // A manual slide is NOT stretched — it keeps Fifteen's own 0.13s.
    h.m.processInput(0, 0, CURSOR_LEFT);
    expect(mPrivate.animLength).toBeCloseTo(0.13);

    // A hint-executed move stretches to the uniform 1s.
    expect(h.m.executeHint()).toBeNull();
    expect(mPrivate.animLength).toBeCloseTo(1.0);
    expect(h.m.currentAnimationMs()).toBeCloseTo(1000);
  });
});
