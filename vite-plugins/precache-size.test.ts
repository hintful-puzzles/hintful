import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  PRECACHE_SIZE_FILE,
  type PrecacheSizes,
  precacheSizes,
} from "./precache-size.ts";

describe("precacheSizes", () => {
  it("writes each file's gzipped size and their sum, and leaves the manifest alone", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "precache-size-"));
    try {
      const text = "puzzle ".repeat(500);
      fs.writeFileSync(path.join(dir, "a.js"), text);
      fs.writeFileSync(path.join(dir, "b.png"), "x");
      const entries = [
        { url: "a.js", revision: null, size: 0 },
        { url: "b.png", revision: "r", size: 0 },
      ];

      const result = await precacheSizes(dir)(entries);
      expect(result.manifest).toEqual(entries);

      const written = JSON.parse(
        fs.readFileSync(path.join(dir, PRECACHE_SIZE_FILE), "utf8"),
      ) as PrecacheSizes;
      const gz = (s: string) => zlib.gzipSync(s, { level: 9 }).length;
      expect(written.sizes).toEqual({ "a.js": gz(text), "b.png": gz("x") });
      expect(written.bytes).toBe(gz(text) + gz("x"));
      expect(gz(text)).toBeLessThan(text.length / 10); // gzipped, not raw
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});
