/**
 * **The guard under `scripts/checks/select-tests.ts`.**
 *
 * The pre-commit hook may run a *subset* of the suite, chosen by that script
 * from two channels: the static import graph, and a walk that follows imports
 * and the `import.meta.glob` calls of every module it visits
 * (`scripts/checks/reach.ts`). A test that reaches its
 * subject through some **third** channel is invisible to both, and the failure
 * is silent — the commit passes, having never run the guard.
 *
 * So this asserts the two properties the selector's soundness rests on, and it
 * asserts them by reading the tree rather than by trusting a list:
 *
 *  1. every `import.meta.glob` call in a test file takes a **literal** pattern
 *     — a string, or an array of strings — so the selector can see where it
 *     points;
 *  2. no test file reads the filesystem directly (`node:fs`), which would be a
 *     coupling neither channel models.
 *
 * This is the same shape as `gate-scope.test.ts`, which keeps the
 * documentation-only shortcut honest by failing when a test acquires a read of
 * a path that shortcut assumes is inert. Both exist because the gate's
 * scopings are only safe while an assumption about the tree holds, and an
 * assumption nothing checks is one that has already started to drift.
 *
 * **CI is the backstop, not this file.** `.github/workflows/gate.yml` runs the
 * whole suite on every push to `main`, so a selector bug costs a slower
 * feedback loop rather than a broken `main`. That is the same argument that
 * lets the hook run `biome check --staged` while CI runs `biome ci .`.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { importsOf, nodesOf, parsed } from "./engine/testing/syntax.ts";

/** Every test file's source, keyed by path. Read as text through the same
 * mechanism the selector parses — which is the point: if this glob stops
 * matching, the count guard below fails rather than the sweep quietly
 * shrinking. */
const testSources = import.meta.glob<string>("./**/*.test.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Files that legitimately reach the filesystem, with the reason. Each is
 * outside the gate's `include` (`src/**`), so the selector never has to model
 * it — `scripts/checks/diff.vitest.config.mts` runs them on demand. */
const FS_READERS_OUTSIDE_THE_GATE = "scripts/checks/";

/** Every `import.meta.glob(…)` call in a file, read off its syntax tree as the
 * selector's own walk reads them: a comment or a string that discusses one is
 * no call. */
function globCalls(path: string, source: string): ts.CallExpression[] {
  return [...nodesOf(parsed(path, source))].filter(
    (n): n is ts.CallExpression =>
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      n.expression.name.text === "glob" &&
      ts.isMetaProperty(n.expression.expression) &&
      n.expression.expression.keywordToken === ts.SyntaxKind.ImportKeyword,
  );
}

/** A pattern the selector can read: a string, or an array of strings. */
function isLiteralPattern(arg?: ts.Expression): boolean {
  if (arg === undefined) return false;
  if (ts.isStringLiteralLike(arg)) return true;
  return ts.isArrayLiteralExpression(arg) && arg.elements.every(ts.isStringLiteralLike);
}

/** The filesystem modules, under either spelling. */
const FS = new Set(["fs", "node:fs", "fs/promises", "node:fs/promises"]);

/** Whether a file reaches `fs`: an import of it, static or dynamic, or a
 * `require` of it. */
function readsFs(path: string, source: string): boolean {
  const sf = parsed(path, source);
  if (importsOf(sf).some((e) => FS.has(e.spec))) return true;
  return [...nodesOf(sf)].some(
    (n) =>
      ts.isCallExpression(n) &&
      ts.isIdentifier(n.expression) &&
      n.expression.text === "require" &&
      n.arguments[0] !== undefined &&
      ts.isStringLiteralLike(n.arguments[0]) &&
      FS.has(n.arguments[0].text),
  );
}

describe("the pre-commit test selector can see every coupling", () => {
  it("looked at every test file in the suite", () => {
    // The vacuity guard this repo owes every derived sweep: an
    // `import.meta.glob` that matched nothing yields `{}`, and every assertion
    // below would then pass over an empty set and report health.
    expect(Object.keys(testSources).length).toBeGreaterThan(250);
  });

  it("every import.meta.glob pattern is statically resolvable", () => {
    // A computed pattern is one `select-tests.ts` cannot resolve. Its walk then
    // takes the test to read everything, so it is selected on every commit and
    // never narrowed: safe, and the whole of the saving lost for that file.
    // The vitest graph channel alone would miss it. Vite accepts two literal
    // forms and BOTH are fine — a single pattern, and an array of them:
    //
    //   import.meta.glob("../games/**\/*.ts", …)
    //   import.meta.glob(["../templates/*.hbs", "../help/*.hbs"], …)
    //
    // Find every *call*, then classify its pattern — never search for the
    // shape you expect (`docs/method.md` § "A scan that keys on a name").
    const offenders: string[] = [];
    let calls = 0;

    for (const [file, source] of Object.entries(testSources)) {
      for (const call of globCalls(file, source)) {
        calls++;
        if (!isLiteralPattern(call.arguments[0])) offenders.push(file);
      }
    }

    expect(
      calls,
      "no import.meta.glob call found — the scan is broken",
    ).toBeGreaterThan(20);
    expect(
      offenders,
      "a computed glob pattern cannot be resolved by scripts/checks/reach.ts, so " +
        "the pre-commit hook runs this test in full on every commit. " +
        "Use a string literal or an array of them, or teach the walk.",
    ).toEqual([]);
  });

  it("sees each shape it judges, and not a mention of one", () => {
    const patterns = (src: string) =>
      globCalls("src/plant.test.ts", src).map((c) => isLiteralPattern(c.arguments[0]));
    expect(patterns('import.meta.glob("./*.ts");')).toEqual([true]);
    expect(
      patterns('import.meta.glob<string>([\n  "./a/*.ts",\n  "./b/*.ts",\n]);'),
    ).toEqual([true]);
    expect(patterns("import.meta.glob(`./${dir}/*.ts`);")).toEqual([false]);
    expect(
      patterns("// import.meta.glob(dir)\nconst s = 'import.meta.glob(x)';"),
    ).toEqual([]);
    for (const reads of [
      'import { readFileSync } from "node:fs";',
      'import fs from "fs";',
      'const fs = await import("node:fs/promises");',
      'const fs = require("fs");',
    ])
      expect(readsFs("src/plant.test.ts", reads), reads).toBe(true);
    expect(readsFs("src/plant.test.ts", '// import "node:fs";')).toBe(false);
  });

  it("no test in the gate reads the filesystem directly", () => {
    // `node:fs` reaches a file through neither the import graph nor a glob, so
    // the selector cannot model it. The four files that legitimately do this
    // live in `scripts/checks/`, outside the gate's include, and run on demand
    // via `npm run diff`.
    const offenders = Object.entries(testSources)
      .filter(([file]) => !file.includes(FS_READERS_OUTSIDE_THE_GATE))
      .filter(([file, source]) => readsFs(file, source))
      .map(([file]) => file);

    expect(
      offenders,
      "a test reading the filesystem directly is invisible to the pre-commit " +
        "selector. Read the file through `import.meta.glob(..., '?raw')` " +
        "instead, which both the selector and Vite can see.",
    ).toEqual([]);
  });
});
