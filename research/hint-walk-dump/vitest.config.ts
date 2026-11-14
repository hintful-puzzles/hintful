// A dump's runs, by hand: `DUMP_GAME=<id> DUMP_OUT=<file> npx vitest run -c
// research/hint-walk-dump/vitest.config.ts`. The gate's config includes
// `src/**` only, so nothing here runs in the gate.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["research/hint-walk-dump/**/*.test.ts"],
    testTimeout: 1_800_000,
  },
});
