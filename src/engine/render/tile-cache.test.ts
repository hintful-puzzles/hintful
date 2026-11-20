import { describe, expect, it } from "vitest";
import { OVERLAY_FLAG, OverlaySidecar } from "./overlay-sidecar.ts";
import { TileCache } from "./tile-cache.ts";

describe("TileCache", () => {
  it("paints every tile on the first frame, then only a changed key", () => {
    const tiles = new TileCache(3);
    expect([0, 1, 2].map((i) => tiles.changed(i, 0))).toEqual([true, true, true]);
    expect([0, 1, 2].map((i) => tiles.changed(i, i === 1 ? 5 : 0))).toEqual([
      false,
      true,
      false,
    ]);
    expect(tiles.shown(1)).toBe(5);
  });

  it("repaints a tile whose overlay moved under an unchanged key, once", () => {
    const wrong = new OverlaySidecar(2);
    const tiles = new TileCache(2, { overlays: [wrong] });
    tiles.changed(0, 7);
    tiles.changed(1, 7);
    wrong.packCells([{ x: 1, y: 0 }], (x) => x);
    expect(tiles.overlayMoved(1)).toBe(true);
    expect([tiles.changed(0, 7), tiles.changed(1, 7)]).toEqual([false, true]);
    expect(tiles.changed(1, 7)).toBe(false);
    expect(wrong.packed[1]).toBe(OVERLAY_FLAG);
  });

  it("compares every word of a wide key", () => {
    const tiles = new TileCache(1, { words: 2 });
    tiles.changed(0, 1, 2);
    expect(tiles.changed(0, 1, 2)).toBe(false);
    expect(tiles.changed(0, 1, 3)).toBe(true);
  });

  it("says first frame once, and repaints what it forgot", () => {
    const tiles = new TileCache(1);
    expect([tiles.firstFrame(), tiles.firstFrame()]).toEqual([true, false]);
    tiles.changed(0, 4);
    tiles.forget(0);
    expect(tiles.changed(0, 4)).toBe(true);
  });
});
