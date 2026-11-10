/**
 * Recompresses every PNG the build emits, losslessly.
 *
 * Gzip cannot shrink a PNG, and the icons (captured from the live game by
 * `src/puzzle/icon-capture.ts`) come out of the browser's encoder unoptimized:
 * measured 2026-11-10, sharp's best lossless encode took the 124 committed icons
 * from 458 KB to 295 KB, pixel for pixel. It applies to whatever PNG the bundle
 * holds, so a new game's icons are covered with no list to keep.
 *
 * Lossless on purpose. Sharp's palette mode would save another third, but it
 * moves pixel values (up to 10 of 255 in a third of the icons), which a player
 * can see; that is the owner's call, not a build default.
 */
import sharp from "sharp";
import type { Plugin } from "vite";

/** The PNG re-encoded losslessly, or the input when that is not smaller. */
export async function optimizePng(png: Uint8Array): Promise<Uint8Array> {
  const out = await sharp(png)
    .png({ compressionLevel: 9, effort: 10, palette: false })
    .toBuffer();
  return out.length < png.length ? out : png;
}

export function optimizePngs(): Plugin {
  return {
    name: "optimize-png",
    apply: "build",
    async generateBundle(_options, bundle) {
      for (const item of Object.values(bundle)) {
        if (item.type !== "asset" || !item.fileName.endsWith(".png")) continue;
        if (typeof item.source === "string") continue;
        item.source = await optimizePng(item.source);
      }
    },
  };
}
