/**
 * The suite's own sources, by file path — the source scanners turned on the
 * tests rather than on what they test.
 *
 * **A rule about how a guard is written needs this, and nothing else can give
 * it.** `slice-the-first-leaf-hint-guards-by-axis` found every cross-game sweep
 * but one building its own board population out of `firstLeaf` and `withTier`,
 * including three inside the file whose main walk had already been fixed. The
 * lesson there is not the count: it is that a sweep fixed once is not a sweep
 * that stays fixed, and the only thing that makes such a rule stick is a check
 * that reads the tests.
 *
 * A module of its own because importing it reads every test file, which makes
 * the importer run whole on any commit that touches one (`code-lines.ts` says
 * why).
 *
 * Dev/test-only; never imported by production code.
 */
import { linesMatching, stripComments } from "./code-lines.ts";

const testSource = (() => {
  const modules = {
    ...import.meta.glob<string>("/src/**/*.test.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
    ...import.meta.glob<string>("/scripts/**/*.test.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
  };
  const out = new Map<string, string>();
  for (const [path, text] of Object.entries(modules)) out.set(path.slice(1), text);
  return out;
})();

/** How many test files {@link testCodeLinesMatching} scans — its vacuity
 * number. An unmatched glob yields `{}`, and every check over it then passes. */
export const SCANNED_TEST_FILES = testSource.size;

/** Every line of the suite's own code matching `re`, tagged by file path.
 * Comment-stripped like the other scanners, so a doc comment *about* a pattern
 * does not read as a use of it — which matters more here than anywhere, since
 * a guard's comment is usually where the pattern is explained. */
export function testCodeLinesMatching(re: RegExp): { id: string; line: string }[] {
  return [...testSource].flatMap(([path, text]) =>
    linesMatching(path, stripComments(text), re),
  );
}
