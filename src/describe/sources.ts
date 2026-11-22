/**
 * Which module each description compiles to, and with which libraries: what
 * `npm run describe` writes, in one place. Paths are relative to the
 * repository's root.
 */

import { compileGame, compileLibrary } from "./compile.ts";
import { compilePlanning } from "./compile-position.ts";
import {
  type DescriptionFile,
  isFormal,
  isLibrary,
  isPlanning,
} from "./description.ts";

const RUNTIME = "src/engine/solve/describe-runtime.ts";
const POSITION_RUNTIME = "src/engine/solve/position-runtime.ts";
const STEP_VOICE = "src/engine/hint/step-voice.ts";

/** Where every compiled module is written: generated, and ignored by git. */
export const GENERATED = "src/generated";

/** `src/d/x.description.yaml` compiles to `src/generated/d/x.compiled.ts`: the
 * same place under the generated directory, so a module's imports of the
 * runtime are as deep as its description's directory. */
export function compiledPath(source: string): string {
  if (!source.startsWith("src/")) throw new Error(`${source} is not under src/`);
  return `${GENERATED}/${source.slice("src/".length)}`.replace(
    /\.description\.yaml$/,
    ".compiled.ts",
  );
}

/** A library compiles, a description that states techniques, and a planning
 * game's; one that is a help page, or rules nothing runs yet, does not. */
export function compiles(file: DescriptionFile): boolean {
  return (
    isLibrary(file) ||
    isPlanning(file) ||
    ("techniques" in file && file.techniques !== undefined)
  );
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

/** The files a game born from its description (`catalog:`) is beside its
 * compiled module, by path: its catalog entry, which imports nothing but a
 * type so the Vite config may load it, and the module that registers the
 * engine's game built from the compiled one. None for any other description. */
export function bornFiles(
  source: string,
  file: DescriptionFile,
): ReadonlyMap<string, string> {
  if (!("catalog" in file) || file.catalog === undefined) return new Map();
  const { game, play } = file;
  if (play?.boards === undefined || play.hintMarks === undefined)
    throw new Error(
      `${source}: a game born from its description states play's boards and hintMarks`,
    );
  const compiled = compiledPath(source);
  const dir = compiled.slice(0, compiled.lastIndexOf("/") + 1);
  const header = `// Written by \`npm run describe\` from ${source}: edit that, not this.\n\n`;
  const catalog = `${dir}${game}.catalog.ts`;
  const module = `${dir}${game}.game.ts`;
  return new Map([
    [
      catalog,
      `${header}import type { PuzzleData } from "${importPath(catalog, "src/engine/contract/catalog.ts")}";\n\nexport const entry: PuzzleData = ${JSON.stringify(file.catalog, null, 2)};\n`,
    ],
    [
      module,
      [
        header.trimEnd(),
        "",
        `import { fillGame } from "${importPath(module, "src/engine/fill/game.ts")}";`,
        `import { registerGame } from "${importPath(module, "src/engine/midend/registry.ts")}";`,
        `import * as compiled from "./${game}.compiled.ts";`,
        "",
        `export const game = fillGame(${JSON.stringify(game)}, compiled);`,
        "",
        "registerGame(game);",
        "",
      ].join("\n"),
    ],
  ]);
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
  const stepVoice = importPath(compiledPath(source), STEP_VOICE);
  if (isLibrary(file)) return compileLibrary(file, source, runtime, stepVoice);
  if (isPlanning(file))
    return compilePlanning(
      file,
      source,
      runtime,
      importPath(compiledPath(source), POSITION_RUNTIME),
      stepVoice,
    );
  const libraries = [...all.values()].filter(isLibrary);
  if (!isFormal(file)) throw new Error(`${source} states no rules`);
  return compileGame(file, libraries, source, runtime, stepVoice);
}
