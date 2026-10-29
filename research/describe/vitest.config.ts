// The pilot's runs, by hand: `npx vitest run -c research/describe/vitest.config.ts`.
// The gate's config includes `src/**` only, so nothing here runs in the gate.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["research/describe/**/*.test.ts"],
    testTimeout: 600_000,
  },
});
