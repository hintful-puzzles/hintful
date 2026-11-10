import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { optimizePng } from "./optimize-png.ts";

/** A board-like image: flat fills, a grid, and a half-transparent corner. */
async function sample(): Promise<Buffer> {
  const size = 64;
  const raw = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const line = x % 16 === 0 || y % 16 === 0;
      raw[i] = line ? 0 : 240;
      raw[i + 1] = line ? 0 : 200 - (y >> 4) * 20;
      raw[i + 2] = line ? 0 : 120;
      raw[i + 3] = x < 8 && y < 8 ? 100 : 255;
    }
  }
  // Written at the weakest compression, as an encoder that does not optimize.
  return sharp(raw, { raw: { width: size, height: size, channels: 4 } })
    .png({ compressionLevel: 0, palette: false })
    .toBuffer();
}

describe("optimizePng", () => {
  it("is smaller and pixel for pixel the same, alpha included", async () => {
    const before = await sample();
    const after = Buffer.from(await optimizePng(before));
    expect(after.length).toBeLessThan(before.length);
    const raw = (png: Buffer) => sharp(png).ensureAlpha().raw().toBuffer();
    expect((await raw(after)).equals(await raw(before))).toBe(true);
  });

  it("never returns a larger file than it was given", async () => {
    const once = Buffer.from(await optimizePng(await sample()));
    const twice = await optimizePng(once);
    expect(twice.length).toBeLessThanOrEqual(once.length);
  });
});
