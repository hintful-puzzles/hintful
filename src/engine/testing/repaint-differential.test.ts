import { describe, expect, it } from "vitest";
import { RecordingDrawing } from "./recording-drawing.ts";
import { BoxRaster } from "./repaint-differential.ts";

describe("BoxRaster", () => {
  it("paints a ring along its stroke and not through its middle, so a stale one shows", () => {
    const dr = new RecordingDrawing([[0, 0, 0]]);
    dr.drawRing({ x: 10, y: 10, w: 20, h: 20 }, { enclose: [], avoid: [] }, 2);
    const blank = new BoxRaster(40, 40);
    const ringed = new BoxRaster(40, 40);
    ringed.apply(dr.ops);
    const changed = [...ringed.px.keys()].filter((i) => ringed.px[i] !== blank.px[i]);
    expect(changed.length).toBeGreaterThan(40);
    // The middle is untouched, and the top of the ring is painted.
    expect(ringed.px[20 * 40 + 20]).toBe(blank.px[20 * 40 + 20]);
    expect(changed.some((i) => Math.floor(i / 40) === 11 && i % 40 === 20)).toBe(true);
  });
});
