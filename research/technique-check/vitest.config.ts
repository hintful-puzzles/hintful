// The checker's runs, by hand: `npx vitest run -c research/technique-check/vitest.config.ts`.
// The gate's config includes `src/**` only, so nothing here runs in the gate.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["research/technique-check/**/*.test.ts"],
    // A run is a long series of solver calls, the slowest of them an hour.
    testTimeout: 86_400_000,
    // One file at a time, so a run's timings are not shared with another's.
    fileParallelism: false,
  },
});
