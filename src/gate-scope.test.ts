/*
 * **The gate's per-commit scopings, and the claims each one rests on.** Every
 * scoping here narrows what a *commit* costs and never what protects the
 * branch, and each rests on something that could quietly stop being true. That
 * is the shape of the failure this repo punishes hardest — a dropped check that
 * reports success — so the claims are asserted rather than trusted, and they are
 * asserted where they can fail: here, on every commit that touches source.
 *
 * **The documentation-only fast path** rests on one claim: **nothing under
 * `docs/`, `openspec/` or the root agent files is read by a test or by the
 * production build.** If that stops being true, a commit touching those paths
 * would skip `vitest run` and `vite build` while genuinely affecting them.
 *
 * **A deferred assertion** (`PRECOMMIT_HOOK_RUN`, `engine/testing/slow.ts`)
 * rests on a different one: **CI is the backstop.** The hook sets
 * `GATE_PRECOMMIT` and CI does not, so work skipped for a commit still runs on
 * every push. Set it in both and the deferred assertions run *nowhere* while
 * both runs report green, which is why the last test below reads the two files
 * rather than taking the arrangement on trust.
 *
 * ON THE INSTRUMENT. This scans for the **shape of a read** — an
 * `import.meta.glob`, `readFileSync`, `readdirSync` or `fs.read*` whose path
 * argument names one of the skipped roots — not for the roots' names anywhere
 * in the file. A plain mention is what most of these files do: dozens cite
 * `docs/games/*.md` and `AGENTS.md` in prose, and a name-keyed scan would
 * convict all of them. (Keying on a name is this repo's most repeated
 * instrument failure; see AGENTS.md, "A scan that keys on a name".)
 *
 * The scan covers the test tree *and* the build side, because `vite build`
 * reads through `vite.config.ts` and `vite-plugins/` — `extra-pages.ts` globs
 * `help/**`, which is exactly why `help/` is NOT on the skip list.
 */
import { describe, expect, it } from "vitest";
// Read as text, the way the About dialog reads the licenses — `import.meta.glob`
// cannot take an extension-less dotfile path (`../.husky/pre-commit` reaches
// picomatch as an empty pattern and throws at transform time).
import ciWorkflow from "../.github/workflows/ci.yml?raw";
import preCommitHook from "../.husky/pre-commit?raw";

/** Every source and test module, plus the build side, as raw text. */
const sources = {
  ...import.meta.glob<string>("./**/*.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  ...import.meta.glob<string>("../vite-plugins/*.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  ...import.meta.glob<string>("../vite.config.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
};

/**
 * The roots `scripts/gate.sh` skips the heavy branches for. Kept in step with
 * the pattern there by hand — which is safe *because* this test fails the
 * moment one of them acquires a reader, rather than because the two lists are
 * derived from each other.
 */
const SKIPPED_ROOTS = ["docs/", "openspec/", "AGENTS.md", "CLAUDE.md"];

/** A read whose path argument names one of the skipped roots. */
const READ_CALL =
  /(?:import\.meta\.glob|readFileSync|readdirSync|readFile|fs\.read\w*)\s*(?:<[^>]*>)?\s*\(\s*(["'`])([^"'`]+)\1/g;

interface Offender {
  file: string;
  path: string;
}

const offenders: Offender[] = [];
let filesScanned = 0;
for (const [file, text] of Object.entries(sources)) {
  filesScanned++;
  for (const m of text.matchAll(READ_CALL)) {
    const path = m[2];
    if (SKIPPED_ROOTS.some((root) => path.includes(root))) {
      offenders.push({ file, path });
    }
  }
}

describe("the gate's per-commit scopings stay safe", () => {
  it("is not vacuous — the tree was read and reads were found", () => {
    // An unmatched glob yields `{}`, and the assertion below would then pass
    // over nothing. The second check proves the *pattern* still matches: this
    // repo has several tests that read source through `import.meta.glob`.
    expect(filesScanned).toBeGreaterThan(200);
    const anyRead = Object.values(sources).filter((t) => {
      READ_CALL.lastIndex = 0;
      return READ_CALL.test(t);
    });
    expect(anyRead.length).toBeGreaterThan(5);
  });

  it("no test or build input reads a path the gate may skip", () => {
    expect(
      offenders.map((o) => `${o.file} reads ${o.path}`).sort(),
      "this path is now a real input, so a documentation-only commit can no " +
        "longer skip vitest/vite build — remove it from the pattern in " +
        "scripts/gate.sh and from SKIPPED_ROOTS here",
    ).toEqual([]);
  });

  it("keeps GATE_PRECOMMIT a hook-only toggle, so CI is still the backstop", () => {
    // The second scoping in this gate that narrows a *commit* rather than the
    // branch: `PRECOMMIT_HOOK_RUN` (engine/testing/slow.ts) lets a check defer
    // to push, and every such deferral rests on one claim — CI leaves the
    // toggle unset and runs everything. Asserted here rather than trusted,
    // because the failure is silent in the worst direction: set it in CI and
    // the deferred checks run **nowhere**, while both runs report green.
    // Vacuity: a `?raw` import that resolved to nothing would make every
    // assertion below pass over an empty string.
    expect(preCommitHook.length, "the pre-commit hook read empty").toBeGreaterThan(200);
    expect(ciWorkflow.length, "the CI workflow read empty").toBeGreaterThan(200);
    const ci = ciWorkflow;
    const hook = preCommitHook;
    // The hook sets it (so the narrowing is reachable at all) ...
    expect(hook, "the hook no longer sets GATE_PRECOMMIT").toMatch(/GATE_PRECOMMIT=1/);
    // ... and CI runs the gate without it (so nothing hides from `main`).
    expect(ci, "CI no longer runs the full gate").toMatch(/npm run gate/);
    expect(
      /GATE_PRECOMMIT/.test(ci),
      "CI sets GATE_PRECOMMIT, so every check deferred to push now runs nowhere",
    ).toBe(false);
  });

  it("does not skip help/, which is a build input and a test subject", () => {
    // The counterpart guarantee: `help/` must NEVER join SKIPPED_ROOTS. It is
    // globbed by `help-coverage.test.ts` and rendered by `extra-pages.ts`, and
    // this change's own `::icon::` check fails the *build* on a bad help page.
    expect(SKIPPED_ROOTS).not.toContain("help/");
    const helpReaders = Object.entries(sources).filter(([, text]) => {
      READ_CALL.lastIndex = 0;
      return [...text.matchAll(READ_CALL)].some((m) => m[2].includes("help/"));
    });
    // Proves the previous assertion is meaningful: help/ *is* read, so if it
    // were on the skip list the first test would have caught it.
    expect(helpReaders.length).toBeGreaterThan(0);
  });
});
