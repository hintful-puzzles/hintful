/**
 * The Vite config imports no game or engine code (`game-code.ts` says why).
 *
 * Asked of Vite, not of the import lines: `loadConfigFromFile` reports every
 * file the bundled config was built from, which is the list a dev server
 * restarts on, lazy `import()`s and re-exports included.
 */

import path from "node:path";
import { loadConfigFromFile } from "vite";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(import.meta.dirname, "..");

describe("vite.config.ts", () => {
  it("is built from no file under src/games/ or src/engine/", async () => {
    const loaded = await loadConfigFromFile(
      { command: "serve", mode: "development" },
      path.join(ROOT, "vite.config.ts"),
      ROOT,
      "silent",
    );
    const files = (loaded?.dependencies ?? []).map((f) => path.relative(ROOT, f));
    // The instrument sees the config's own plugins, or an empty list would pass.
    expect(files).toContain(path.join("vite-plugins", "game-code.ts"));
    expect(files.filter((f) => /^src\/(games|engine)\//.test(f))).toEqual([]);
  });
});
