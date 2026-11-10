/**
 * Writes `precache-size.json`: the size of every precached file and their
 * total, for the download's progress and for the size shown to a player.
 *
 * It is a file because Workbox drops any manifest field but `url` and
 * `revision`, so the worker cannot be handed sizes in its manifest. The worker
 * fetches it at install to weight progress by bytes (a count of files moves as
 * far for a 3 KB icon as for the 640 KiB game worker); the settings dialog
 * fetches it to show the download's size before there is a worker to ask.
 *
 * A size is the file gzipped on its own, the best build-time estimate of what
 * the host sends; a figure shown to a player is "about" that.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import type { ManifestTransform } from "workbox-build";

/** The file the worker and page fetch, relative to the output directory. */
export const PRECACHE_SIZE_FILE = "precache-size.json";

export interface PrecacheSizes {
  /** Sum of `sizes`. */
  bytes: number;
  /** Manifest URL (relative to the scope) to gzipped bytes. */
  sizes: Record<string, number>;
}

/** A manifest transform that leaves the manifest alone and writes the sizes. */
export function precacheSizes(outDir: string): ManifestTransform {
  return (entries) => {
    const sizes: Record<string, number> = {};
    let bytes = 0;
    for (const entry of entries) {
      const file = path.join(outDir, entry.url.split(/[?#]/)[0] ?? entry.url);
      const size = zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length;
      sizes[entry.url] = size;
      bytes += size;
    }
    const sizeFile: PrecacheSizes = { bytes, sizes };
    fs.writeFileSync(path.join(outDir, PRECACHE_SIZE_FILE), JSON.stringify(sizeFile));
    return { manifest: entries };
  };
}
