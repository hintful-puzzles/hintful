/**
 * The engine's own shipped sources, by module path — **excluding `testing/`**,
 * which is dev-only infrastructure by the repo's layout rather than by a list
 * of filenames anyone has to maintain.
 *
 * A rule about what a game says to a player cannot stop at the game
 * directories, because a family's narration is often written *once* in the
 * engine and shared: `latin-hint.ts` narrates for the Latin games and
 * `candidate-hint.ts` for the candidate-elimination ones, so a sweep over
 * `games/**` alone reports a clean collection while the sentence every one of
 * those games actually shows sits outside it.
 *
 * A module of its own because importing it reads every engine module, which
 * makes the importer run whole on any engine commit (`code-lines.ts` says why).
 *
 * Dev/test-only; never imported by production code.
 */
import { linesMatching, stripComments } from "./code-lines.ts";

const engineSource = (() => {
  // Root-anchored deliberately: a `../**/*.ts` glob from this file normalizes a
  // sibling back to `./name.ts`, so a `/testing/` filter would match nothing
  // and the exclusion below would not happen.
  const modules = import.meta.glob<string>("/src/engine/**/*.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  });
  const out = new Map<string, string>();
  for (const [path, text] of Object.entries(modules)) {
    if (path.includes(".test.") || path.includes("/engine/testing/")) continue;
    out.set(path.replace("/src/", ""), text);
  }
  return out;
})();

/** How many engine modules {@link engineCodeLinesMatching} scans — its vacuity
 * number. An unmatched glob yields `{}`, and every check over it then passes. */
export const SCANNED_ENGINE_FILES = engineSource.size;

/** Every line of the engine's shipped code matching `re`, tagged by module.
 * The engine counterpart to `codeLinesMatching` in `enrollment.ts`,
 * comment-stripped for the same reason. */
export function engineCodeLinesMatching(re: RegExp): { id: string; line: string }[] {
  return [...engineSource].flatMap(([path, text]) =>
    linesMatching(path, stripComments(text), re),
  );
}
