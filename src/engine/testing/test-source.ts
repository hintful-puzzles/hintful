/**
 * The suite's own sources, by file path — the source scanners turned on the
 * tests rather than on what they test.
 *
 * **A rule about how a guard is written needs this, and nothing else can give
 * it.** Whether a cross-game sweep builds its own board population out of
 * `firstLeaf` and `withTier` is a fact about a test, and a sweep fixed once is
 * not a sweep that stays fixed: the only thing that makes such a rule stick is
 * a check that reads the tests.
 *
 * A module of its own because importing it reads every test file, which makes
 * the importer run whole on any commit that touches one (`code-lines.ts` says
 * why).
 *
 * Dev/test-only; never imported by production code.
 */
import {
  type ExportRef,
  importedModules,
  parsed,
  type UseKind,
  usesOf,
} from "./syntax.ts";

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

/** How many test files {@link testFilesUsing} scans — its vacuity
 * number. An unmatched glob yields `{}`, and every check over it then passes. */
export const SCANNED_TEST_FILES = testSource.size;

/** The test files, by repo-relative path, that use any of `refs` as `kind`
 * (`syntax.ts`'s `usesOf`). A comment *about* a helper is not a use, which
 * matters more here than anywhere, since a guard's comment is usually where
 * the pattern is explained. Throws when no test uses any of them: an export
 * was renamed or moved. */
export function testFilesUsing(refs: readonly ExportRef[], kind: UseKind): string[] {
  const found = [...testSource]
    .filter(([path, text]) =>
      refs.some((ref) => usesOf(parsed(path, text), ref).some((u) => u.kind === kind)),
    )
    .map(([path]) => path);
  if (found.length === 0)
    throw new Error(
      `test-source: no test uses ${refs.map((r) => r.name).join(" or ")}: renamed or moved?`,
    );
  return found;
}

/** The test files, by repo-relative path, that import `module` (repo-relative,
 * with its extension), for a value: a test that takes only its types runs
 * none of it. */
export function testFilesImporting(module: string): string[] {
  return [...testSource]
    .filter(([path, text]) =>
      importedModules(parsed(path, text), true).includes(module),
    )
    .map(([path]) => path);
}
