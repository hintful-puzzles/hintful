/**
 * Which module each description compiles to, and with which libraries: what
 * `npm run describe` writes and `compile.test.ts` holds it to, in one place.
 * Paths are relative to the repository's root.
 */

import { compileGame, compileLibrary } from "./compile.ts";
import type { DescriptionJson, LibraryJson } from "./description.ts";

const RUNTIME = "src/engine/describe-runtime.ts";

/** `x.description.json` compiles to `x.compiled.ts` beside it. */
export function compiledPath(source: string): string {
  return source.replace(/\.description\.json$/, ".compiled.ts");
}

/** The import path from `from`'s directory to `to`, both from the root. */
function importPath(from: string, to: string): string {
  const a = from.split("/").slice(0, -1);
  const b = to.split("/");
  let i = 0;
  while (i < a.length && i < b.length - 1 && a[i] === b[i]) i++;
  const up = a.slice(i).map(() => "..");
  const path = [...up, ...b.slice(i)].join("/");
  return up.length === 0 ? `./${path}` : path;
}

function isLibrary(json: unknown): json is LibraryJson {
  return typeof json === "object" && json !== null && "library" in json;
}

/** The module `source` compiles to, given every description by path. */
export function compileSource(
  source: string,
  all: ReadonlyMap<string, unknown>,
): string {
  const json = all.get(source);
  const runtime = importPath(compiledPath(source), RUNTIME);
  if (isLibrary(json)) return compileLibrary(json, source, runtime);
  const libraries = [...all.values()].filter(isLibrary);
  return compileGame(json as DescriptionJson, libraries, source, runtime);
}
