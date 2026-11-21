// On-demand config for the ADVISORY, non-gating checks in this directory.
// Kept separate from vitest.config.ts so the commit/CI gate (which uses the
// default config, include `src/**`) never runs these — they are slow, or they
// report rather than assert. That exclusion is by construction rather than by
// luck: the gate's include is `src/**/*.test.ts`, and nothing here is under
// `src/`, which is the whole reason the files below sit in `scripts/checks/`
// instead of beside the tests they resemble. Usage:
//   npm run diff                                                          # all
//   npx vitest run -c scripts/checks/diff.vitest.config.mts -t collide    # one
import { defineConfig } from "vitest/config";
import { describeFirst } from "../../vite-plugins/describe.ts";

export default defineConfig({
  plugins: [describeFirst()],
  test: {
    include: [
      "scripts/checks/color-inventory.test.ts",
      "scripts/checks/color-dark-check.test.ts",
      "scripts/checks/color-collide.test.ts",
      "scripts/checks/contact-sheet.test.ts",
      "scripts/checks/hint-deixis.test.ts",
      "scripts/checks/hint-area-names.test.ts",
      "scripts/checks/hint-depth.test.ts",
      "scripts/checks/tier-walk.test.ts",
      "scripts/checks/deal-walk.test.ts",
      "scripts/checks/deal-profile.test.ts",
      "scripts/checks/deal-compare.test.ts",
    ],
    environment: "node",
    // The same absurd ceiling `vitest.config.ts` argues for at length, and for
    // the same reason: a timeout here is a backstop against a runaway test, not
    // a performance assertion, and this box is deliberately busy. Without it
    // these inherit vitest's 5 s default — which the deixis sweep blew through
    // the day it started reading the presets menu, *after* running to
    // completion and writing its report, because a synchronous test cannot be
    // interrupted. A check that did all its work and is then marked failed is
    // the worst of both.
    testTimeout: 3_600_000,
    hookTimeout: 3_600_000,
  },
});
