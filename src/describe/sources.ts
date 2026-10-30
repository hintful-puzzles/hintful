/**
 * Which module each description compiles to, and with which libraries: what
 * `npm run describe` writes and `compile.test.ts` holds it to, in one place.
 * Paths are relative to the repository's root.
 */

import { compileGame, compileLibrary } from "./compile.ts";
import { type DescriptionFile, isFormal, isLibrary } from "./description.ts";

const RUNTIME = "src/engine/describe-runtime.ts";

/** `x.description.yaml` compiles to `x.compiled.ts` beside it. */
export function compiledPath(source: string): string {
  return source.replace(/\.description\.yaml$/, ".compiled.ts");
}

/** A library compiles, and a description that states techniques; one that
 * is a help page, or rules nothing runs yet, does not. */
export function compiles(file: DescriptionFile): boolean {
  return isLibrary(file) || ("techniques" in file && file.techniques !== undefined);
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

/** The module `source` compiles to, given every description by path. */
export function compileSource(
  source: string,
  all: ReadonlyMap<string, DescriptionFile>,
): string {
  const file = all.get(source);
  if (file === undefined || !compiles(file))
    throw new Error(`${source} does not compile`);
  const runtime = importPath(compiledPath(source), RUNTIME);
  if (isLibrary(file)) return compileLibrary(file, source, runtime);
  const libraries = [...all.values()].filter(isLibrary);
  if (!isFormal(file)) throw new Error(`${source} states no rules`);
  return compileGame(file, libraries, source, runtime);
}
