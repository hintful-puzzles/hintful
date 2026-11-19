// The research tools' own guards, which CI's gate workflow runs
// (`npm run test:research-guards`): a file named `*.guard.test.ts` here holds
// checks quick enough for every push, and any long report beside them runs
// only when its environment asks. Not in the commit hook, so a commit touching
// only `research/` keeps the documentation-only path (`scripts/gate.sh`, 1d).
import { defineConfig } from "vitest/config";
import { describeFirst } from "../vite-plugins/describe.ts";

export default defineConfig({
  plugins: [describeFirst()],
  test: {
    include: ["research/**/*.guard.test.ts"],
    testTimeout: 600_000,
  },
});
