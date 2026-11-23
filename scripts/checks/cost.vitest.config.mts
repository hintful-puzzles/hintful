// The config `npm run compare-cost` runs its worker with
// (`scripts/compare-cost.ts`), in each tree it compares. One file in one
// thread: a forked worker's instructions are not in the count `/usr/bin/time`
// reports for the process it wraps, and a thread's are.
import { defineConfig } from "vitest/config";
import { describeFirst } from "../../vite-plugins/describe.ts";

export default defineConfig({
  plugins: [describeFirst()],
  test: {
    include: ["scripts/checks/cost-walk.test.ts"],
    environment: "node",
    pool: "threads",
    maxWorkers: 1,
    // A backstop against a runaway walk, as `diff.vitest.config.mts` argues.
    testTimeout: 3_600_000,
  },
});
