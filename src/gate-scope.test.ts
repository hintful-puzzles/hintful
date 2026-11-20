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
 * **A hook's narrowing to the games a change reaches** (`GATE_GAME_SCOPE`,
 * read only beside `GATE_PRECOMMIT`, `engine/testing/game-scope.ts`) rests on
 * a different one: **CI is the backstop.** The two local hooks set
 * `GATE_PRECOMMIT` and CI does not, so work skipped locally still runs in CI
 * on every push. Set it in both and the skipped cases run *nowhere* while
 * both runs report green, which is why a test below reads the files rather
 * than taking the arrangement on trust.
 *
 * **A commit's per-game work, limited to the games it stages**, rests on a
 * third: **the push runs the rest.** `.husky/pre-push` hands the gate the
 * commit the remote has, and a test below holds it to that.
 *
 * ON THE INSTRUMENT. This reads each file's syntax tree for the **shape of a
 * read** — an `import.meta.glob`, a `read*` call or `new URL` whose literal
 * path argument, or an import whose specifier, names one of the skipped
 * roots — not for the roots' names anywhere in the file. A path assembled at
 * run time from parts is outside what it sees. A plain mention is what most of these files do: dozens cite
 * `docs/*.md` and `AGENTS.md` in prose, and a name-keyed scan would
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
import ts from "typescript";
import { describe, expect, it } from "vitest";
// Read as text, the way the About dialog reads the licenses — `import.meta.glob`
// cannot take an extension-less dotfile path (`../.husky/pre-commit` reaches
// picomatch as an empty pattern and throws at transform time).
import gateWorkflow from "../.github/workflows/gate.yml?raw";
import preCommitHook from "../.husky/pre-commit?raw";
import prePushHook from "../.husky/pre-push?raw";
import gateScript from "../scripts/gate.sh?raw";
import { importsOf, nodesOf, parsed } from "./engine/testing/syntax.ts";

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

/** Whether a call reads a path: `import.meta.glob`, `new URL`, or any
 * function whose name starts `read` (`readFileSync`, `fs.readdir`…), taken
 * as a superset and judged by its literal path. */
function isReadCall(n: ts.Node): n is ts.CallExpression | ts.NewExpression {
  if (ts.isNewExpression(n))
    return ts.isIdentifier(n.expression) && n.expression.text === "URL";
  if (!ts.isCallExpression(n)) return false;
  const e = n.expression;
  if (ts.isPropertyAccessExpression(e) && ts.isMetaProperty(e.expression))
    return e.name.text === "glob";
  const name = ts.isIdentifier(e)
    ? e.text
    : ts.isPropertyAccessExpression(e)
      ? e.name.text
      : "";
  return /^read[A-Z]/.test(name);
}

/** A read call's literal path argument: one string, or an array of them. */
function literalPaths(arg?: ts.Expression): string[] {
  if (arg === undefined) return [];
  if (ts.isStringLiteralLike(arg)) return [arg.text];
  if (ts.isArrayLiteralExpression(arg))
    return arg.elements.filter(ts.isStringLiteralLike).map((e) => e.text);
  return [];
}

/** The read calls in `text`, by the syntax tree: a comment is no call. */
const readCalls = (text: string, path: string) =>
  [...nodesOf(parsed(path, text))].filter(isReadCall);

/** Every path `text` reads: a read call's literal path, or an import's
 * specifier, static or dynamic (with `?raw` it reads any file). */
function pathsRead(text: string, path: string): string[] {
  return [
    ...readCalls(text, path).flatMap((c) => literalPaths(c.arguments?.[0])),
    ...importsOf(parsed(path, text)).map((e) => e.spec),
  ];
}

interface Offender {
  file: string;
  path: string;
}

const offenders: Offender[] = [];
let filesScanned = 0;
for (const [file, text] of Object.entries(sources)) {
  filesScanned++;
  for (const path of pathsRead(text, file)) {
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
    const anyRead = Object.entries(sources).filter(
      ([file, t]) => readCalls(t, file).length > 0,
    );
    expect(anyRead.length).toBeGreaterThan(5);
    // Each shape sees a read known to be there: an array of globs, and a
    // `?raw` import; and a read written in a comment is none.
    const read = (file: string) => pathsRead(sources[file] ?? "", file);
    expect(read("./project-identity.test.ts")).toContain("../README.md");
    expect(read("./dialogs/about-dialog.ts")).toContain("../../LICENSE.md?raw");
    expect(
      pathsRead(
        '// readFileSync("docs/a.md")\nnew URL("../docs/b.md", u);',
        "plant.ts",
      ),
    ).toEqual(["../docs/b.md"]);
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
    // Three listings, a push's, a commit's and `npm run fast-checks`'s. The
    // shortcut reads the first two, and the third scopes biome.
    const listings = [...gateScript.matchAll(/changed=\$\(git diff ([^)]*)\)/g)];
    expect(listings.map((m) => m[1])).toEqual([
      '--name-only --no-renames "$GATE_SINCE" HEAD',
      "--cached --name-only --no-renames",
      "--name-only --no-renames HEAD; git ls-files --others --exclude-standard",
    ]);
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

  it("runs the research tools' guards in CI, since a commit may skip them", () => {
    // `research/` is on the skip list, and its tools import `src/`: a change
    // there that breaks one is caught by CI's step for their guards or by
    // nothing. The step's script names the config whose glob finds them.
    expect(gateWorkflow, "CI no longer runs the research guards").toMatch(
      /^\s*run: npm run test:research-guards\s*$/m,
    );
  });

  it("keeps GATE_PRECOMMIT a hook-only toggle, so CI is still the backstop", () => {
    // The second scoping in this gate that narrows a local run rather than
    // the branch: the toggle lets a hook skip other games' cases
    // (engine/testing/game-scope.ts), and that rests on one claim — CI leaves
    // the toggle unset and runs everything. Asserted here rather than trusted,
    // because the failure is silent in the worst direction: set it in CI and
    // the skipped cases run **nowhere**, while both runs report green.
    // Vacuity: a `?raw` import that resolved to nothing would make every
    // assertion below pass over an empty string.
    expect(preCommitHook.length, "the pre-commit hook read empty").toBeGreaterThan(200);
    expect(prePushHook.length, "the pre-push hook read empty").toBeGreaterThan(200);
    expect(gateWorkflow.length, "the gate workflow read empty").toBeGreaterThan(200);
    // The hooks set it (so the narrowing is reachable at all) ...
    for (const hook of [preCommitHook, prePushHook])
      expect(hook, "a hook no longer sets GATE_PRECOMMIT").toMatch(/GATE_PRECOMMIT=1/);
    // ... and CI runs the gate without it (so nothing hides from `main`).
    // A step running the whole gate, not the deploy's build-only run.
    expect(gateWorkflow, "CI no longer runs the full gate").toMatch(
      /^\s*run: npm run gate\s*$/m,
    );
    expect(
      /GATE_PRECOMMIT|GATE_SINCE/.test(gateWorkflow),
      "CI sets a hook's toggle, so every check deferred to CI now runs nowhere",
    ).toBe(false);
  });

  it("hands the push what the commits left out, and to nothing else", () => {
    // A commit runs the per-game work of the games it stages and no other, so
    // the rest has to run somewhere before the commits leave this machine.
    // The push's role is its base commit: unset in the commit hook, where it
    // would make the commit run the push's plan, and set in the push hook,
    // where its absence would make the push run a commit's plan over nothing.
    expect(prePushHook, "the push hook no longer names its base").toMatch(
      /GATE_SINCE=\$since sh scripts\/gate\.sh/,
    );
    expect(/GATE_SINCE/.test(preCommitHook)).toBe(false);
  });

  it("never cancels a run of the whole gate in CI", () => {
    // The wide boards of every sweep run in CI alone, so a canceled run is a
    // commit nothing judged at that width.
    expect(gateWorkflow).toMatch(/^\s*cancel-in-progress: false\s*$/m);
    expect(/cancel-in-progress: true/.test(gateWorkflow)).toBe(false);
  });

  it("does not skip help/, which is a build input and a test subject", () => {
    // The counterpart guarantee: `help/` must NEVER join SKIPPED_ROOTS. It is
    // globbed by `help-coverage.test.ts` and rendered by `extra-pages.ts`, and
    // this change's own `::icon::` check fails the *build* on a bad help page.
    expect(SKIPPED_ROOTS).not.toContain("help/");
    const helpReaders = Object.entries(sources).filter(([file, text]) =>
      pathsRead(text, file).some((path) => path.includes("help/")),
    );
    // Proves the previous assertion is meaningful: help/ *is* read, so if it
    // were on the skip list the first test would have caught it.
    expect(helpReaders.length).toBeGreaterThan(0);
  });
});
