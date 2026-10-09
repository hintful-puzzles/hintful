/*
 * **The gate's per-commit scopings, and the claims each one rests on.** Every
 * scoping here narrows what a *commit* costs and never what protects the
 * branch, and each rests on something that could quietly stop being true. That
 * is the shape of the failure this repo punishes hardest — a dropped check that
 * reports success — so the claims are asserted rather than trusted, and they are
 * asserted where they can fail: here, on every commit that touches source.
 *
 * **The documentation-only fast path** rests on one claim: **no path the
 * shortcut's pattern in `scripts/gate.sh` matches is read by a test or by the
 * production build.** If that stops being true, a commit touching those paths
 * would skip `vitest run` and `vite build` while genuinely affecting them.
 *
 * **A deferred assertion and a sweep's smaller per-commit amount**
 * (`PRECOMMIT_HOOK_RUN` and `perCommit`, `engine/testing/slow.ts`)
 * rest on a different one: **CI is the backstop.** The hook sets
 * `GATE_PRECOMMIT` and CI does not, so work skipped for a commit still runs on
 * every push. Set it in both and the deferred assertions run *nowhere* while
 * both runs report green, which is why the last test below reads the two files
 * rather than taking the arrangement on trust.
 *
 * ON THE INSTRUMENT. This scans for the **shape of a read** — an
 * `import.meta.glob`, `readFileSync`, `readdirSync`, `fs.read*` or `new URL`
 * whose path argument, or an import whose specifier, names one of the skipped
 * roots — not for the roots' names anywhere in the file. A path assembled at
 * run time from parts is outside what it sees. A plain mention is what most of these files do: dozens cite
 * `docs/games/*.md` and `AGENTS.md` in prose, and a name-keyed scan would
 * convict all of them. (Keying on a name is this repo's most repeated
 * instrument failure; see docs/method.md, "A scan that keys on a name".)
 *
 * The scan covers everything the skipped steps load. `vite build` reads through
 * `vite.config.ts` and `vite-plugins/` — `extra-pages.ts` globs `help/**`,
 * which is exactly why `help/` is NOT on the skip list. `vitest run` loads
 * `vitest.config.ts` before any test, and the TypeScript under `scripts/` is
 * the selector and the scan pass the shortcut also skips, and the test files
 * the on-demand config runs. The `.mjs` checks there are the fast prefix,
 * which the shortcut does not skip, and several read `docs/` on purpose.
 */
import { describe, expect, it } from "vitest";
// Read as text, the way the About dialog reads the licenses — `import.meta.glob`
// cannot take an extension-less dotfile path (`../.husky/pre-commit` reaches
// picomatch as an empty pattern and throws at transform time).
import ciWorkflow from "../.github/workflows/ci.yml?raw";
import preCommitHook from "../.husky/pre-commit?raw";
import gateScript from "../scripts/gate.sh?raw";

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
  ...import.meta.glob<string>(["../vite.config.ts", "../vitest.config.ts"], {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  ...import.meta.glob<string>("../scripts/**/*.{ts,mts}", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
};

/**
 * The pattern `scripts/gate.sh` tests the staged paths against. The roots are
 * read out of it, so the shortcut and this guard cannot name two sets.
 */
const SHORTCUT_PATTERN = /grep -qvE '\^\(([^']+)\)'/g;
const shortcutPatterns = [...gateScript.matchAll(SHORTCUT_PATTERN)].map((m) => m[1]);

/** The roots `scripts/gate.sh` skips the heavy branches for. */
const SKIPPED_ROOTS = (shortcutPatterns[0] ?? "")
  .split("|")
  .map((alternative) => alternative.replace(/\\/g, "").replace(/\$$/, ""));

/** A read call's path argument: one literal, or an array of them. */
const READ_CALL =
  /(?:import\.meta\.glob|readFileSync|readdirSync|readFile|fs\.read\w*|new URL)\s*(?:<[^(]*>)?\s*\(\s*(\[[^\]]*\]|(["'`])[^"'`]+\2)/g;
/**
 * An import's specifier, static or dynamic: with `?raw` it reads any file. Only
 * a dynamic import takes a template literal, and prose says "from `docs/…`".
 */
const IMPORT =
  /\bfrom\s*(["'])(?<static>[^"'\n]+)\1|\bimport\s*\(?\s*(["'`])(?<dynamic>[^"'`\n]+)\3/g;
const LITERAL = /(["'`])([^"'`\n]+)\1/g;

/** Every path `text` reads, by either shape. */
function pathsRead(text: string): string[] {
  const fromCalls = [...text.matchAll(READ_CALL)].flatMap((call) =>
    [...call[1].matchAll(LITERAL)].map((literal) => literal[2]),
  );
  const fromImports = [...text.matchAll(IMPORT)].map(
    (m) => m.groups?.["static"] ?? m.groups?.["dynamic"] ?? "",
  );
  return [...fromCalls, ...fromImports];
}

interface Offender {
  file: string;
  path: string;
}

const offenders: Offender[] = [];
let filesScanned = 0;
for (const [file, text] of Object.entries(sources)) {
  filesScanned++;
  for (const path of pathsRead(text)) {
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
    const anyRead = Object.values(sources).filter(
      (t) => [...t.matchAll(READ_CALL)].length > 0,
    );
    expect(anyRead.length).toBeGreaterThan(5);
    // Each shape sees a read known to be there: an array of globs, and a
    // `?raw` import.
    expect(pathsRead(sources["./project-identity.test.ts"])).toContain("../README.md");
    expect(pathsRead(sources["./dialogs/about-dialog.ts"])).toContain(
      "../../LICENSE.md?raw",
    );
    // Each file outside `src/` that a skipped step loads was read, by its key.
    for (const loaded of [
      "../vite.config.ts",
      "../vitest.config.ts",
      "../vite-plugins/extra-pages.ts",
      "../scripts/checks/select-tests.ts",
      "../scripts/checks/source-scans.ts",
      "../scripts/checks/diff.vitest.config.mts",
    ])
      expect(sources[loaded]?.length ?? 0, `${loaded} was not read`).toBeGreaterThan(0);
  });

  it("counts a deleted path, and both paths of a moved one, as staged", () => {
    // The shortcut asks whether *every* staged path is documentation, so a
    // listing that leaves a path out answers yes for a commit that deletes a
    // source file beside a docs edit, or moves one into `docs/`. A filter on
    // the kind of change is how a deletion drops out, and rename detection is
    // how the path a file left does.
    const listings = [
      ...gateScript.matchAll(/staged=\$\(git diff --cached ([^)]*)\)/g),
    ];
    expect(listings.map((m) => m[1])).toEqual(["--name-only --no-renames"]);
  });

  it("reads the skipped roots out of the shortcut's own pattern", () => {
    // One pattern, or the roots below are those of some other grep.
    expect(shortcutPatterns).toHaveLength(1);
    expect(SKIPPED_ROOTS).toContain("docs/");
    // Each alternative is a plain path, so nothing of the pattern's syntax
    // was taken for part of a name.
    for (const root of SKIPPED_ROOTS) {
      expect(root).toMatch(/^[\w.-]+\/?$/);
    }
  });

  it("no test or build input reads a path the gate may skip", () => {
    expect(
      offenders.map((o) => `${o.file} reads ${o.path}`).sort(),
      "this path is now a real input, so a documentation-only commit can no " +
        "longer skip vitest/vite build — remove it from the pattern in " +
        "scripts/gate.sh",
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
    // A step running the whole gate, not only the deploy's build-only run.
    expect(ci, "CI no longer runs the full gate").toMatch(/^\s*run: npm run gate\s*$/m);
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
    const helpReaders = Object.values(sources).filter((text) =>
      pathsRead(text).some((path) => path.includes("help/")),
    );
    // Proves the previous assertion is meaningful: help/ *is* read, so if it
    // were on the skip list the first test would have caught it.
    expect(helpReaders.length).toBeGreaterThan(0);
  });
});
