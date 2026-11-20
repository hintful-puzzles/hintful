/*
 * No test file mocks a module.
 *
 * The suite runs with `isolate: false` (see `vitest.config.ts` for why), so a
 * worker keeps one module graph from file to file. `vi.mock` does not replace a
 * module that graph already holds: it changes what the registry hands out to
 * imports evaluated after it. So a mocked test works only when no earlier file
 * in its worker loaded anything between it and the mocked module, and nothing
 * in a file can arrange that.
 *
 * Twice that failed. First, two files mocked `store/saved-games.ts` with
 * different factories, and the second to load got the first's spies. That was
 * met with a rule of one mocking file per module, which could not see the
 * second failure: `help-command-links.test.ts` and
 * `puzzle-command-homes.test.ts` import `screens/puzzle-screen.ts` unmocked, so
 * whenever either ran first, `puzzle-screen.test.ts`'s mocks of the dialogs
 * never reached the screen. Eight tests failed and one waited on a real modal
 * until the hour-long timeout. `utils/errors.test.ts` failed the same way
 * behind any file that imports `puzzle/puzzle.ts`.
 *
 * `vi.spyOn` on the real export has neither problem. Vitest compiles an import
 * into a property read on the exporting module's namespace at call time, so a
 * spy reaches every importer however early it loaded, and `restoreAllMocks`
 * gives the next file the real function back. Spy on the namespace
 * (`import * as toast from "./dialogs/toast.ts"`) or on the shared object
 * (`savedGames`), in a `beforeEach`.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { nodesOf, parsed } from "./engine/testing/syntax.ts";

/** Every test module, eagerly, as raw text; Vite resolves these at build. */
const sources = Object.entries(
  import.meta.glob(["./**/*.test.ts", "../vite-plugins/**/*.test.ts"], {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>,
);

/** The `vi` members that register a module factory or stand-in. */
const MOCKING = ["mock", "doMock", "hoisted"];

/** The calls in `text` that mock a module: `vi.mock(…)` and its kin, read off
 * the syntax tree, so a comment or a string naming one is not a call. */
const mocks = (text: string, path = "src/plant.test.ts"): string[] =>
  [...nodesOf(parsed(path, text))]
    .filter(
      (n): n is ts.CallExpression =>
        ts.isCallExpression(n) &&
        ts.isPropertyAccessExpression(n.expression) &&
        ts.isIdentifier(n.expression.expression) &&
        n.expression.expression.text === "vi" &&
        MOCKING.includes(n.expression.name.text),
    )
    .map((c) => c.expression.getText());

describe("no test file mocks a module", () => {
  it("scanned the test tree with a pattern that matches a mock", () => {
    // This check's failure mode is looking at nothing: a mis-rooted glob, or a
    // pattern that stopped matching the call, would report a clean suite.
    expect(sources.length, "scanned implausibly few test files").toBeGreaterThan(200);
    expect(
      sources.some(([path]) => path.startsWith("../vite-plugins/")),
      "scanned no vite-plugins test",
    ).toBe(true);
    for (const call of [
      'vi.mock("../dialogs/toast.ts", () => ({}))',
      "vi.doMock('./x.ts')",
      "vi\n  .mock(`./x.ts`)",
      "const spies = vi.hoisted(() => ({}))",
    ]) {
      expect(mocks(call), call).toHaveLength(1);
    }
    expect(mocks("vi.spyOn(toast, 'showToast')")).toEqual([]);
    expect(mocks('// vi.mock("./x.ts")\nconst s = "vi.mock(";')).toEqual([]);
  });

  it("finds no vi.mock, vi.doMock or vi.hoisted", () => {
    const mocking = sources
      .filter(([path, text]) => mocks(text, path).length > 0)
      .map(([path]) => path);
    expect(
      mocking,
      "under `isolate: false` a module mock misses any importer an earlier file " +
        "in the worker already loaded; spy on the real export instead",
    ).toEqual([]);
  });
});
