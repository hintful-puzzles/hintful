/**
 * Matching lines of source **code**, with the comments gone: the shared step
 * under every guard that reads source as text (`enrollment.ts` for the games,
 * `engine-source.ts` and `test-source.ts` for the rest).
 *
 * Each source a guard can read lives in a module of its own, so a guard
 * imports only the globs it scans. The pre-commit hook's scope is decided by
 * what a test file reaches (`scripts/checks/reach.ts`), and a glob reached
 * through a helper counts as read by every file importing that helper.
 *
 * Dev/test-only; never imported by production code.
 */
import ts from "typescript";

/**
 * Source text with every comment removed — **because a comment is not a use**.
 * A raw-text scan once scored a flag consumed on the strength of a
 * commented-out line, and convicted Net of a stylus branch for the comment
 * documenting its absence.
 *
 * Stripping beats a narrower marker, because narrowing the key is the error:
 * `& MOD_STYLUS` misses a game that writes the test across two lines. Key on the
 * name, take the superset, and remove the one context in which a name is not a
 * use. `transpileModule` is the cheap way to drop comments without mangling a
 * string that contains `//`; at ~5 ms per file a whole-collection scan pays
 * ~1.5 s once per worker, and only the guards that scan pay it.
 */
export const stripComments = (text: string): string =>
  ts.transpileModule(text, {
    compilerOptions: { removeComments: true, target: ts.ScriptTarget.ESNext },
  }).outputText;

/** Every line of `code` matching `re`, trimmed and tagged with `id`. */
export function linesMatching(id: string, code: string, re: RegExp) {
  return code
    .split("\n")
    .filter((line) => re.test(line))
    .map((line) => ({ id, line: line.trim() }));
}
