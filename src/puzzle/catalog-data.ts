/**
 * How the games' catalog entries become the catalog. Each game's entry is its
 * own `src/games/<id>/catalog.ts`, of the shape `src/engine/contract/catalog.ts`
 * declares. Two readers find them, because the Vite config cannot use
 * `import.meta.glob`: the app's (`catalog.ts`) and the config's
 * (`vite-plugins/catalog.ts`). Both assemble through `catalogFrom`, and this
 * module imports only a type, which the config's bundle erases, so the config
 * loads nothing of the engine.
 */

import type { PuzzleData } from "../engine/contract/catalog.ts";

/** A game's catalog module: `src/games/<id>/catalog.ts`. */
export interface CatalogModule {
  entry: PuzzleData;
}

// A hand-written game's `games/<id>/catalog.ts`, or the
// `generated/games/<id>/<id>.catalog.ts` the compiler writes for a game born
// from its description.
const MODULE_PATH = /(?:^|\/)games\/([a-z0-9]+)\/(?:\1\.)?catalog\.ts$/;

/**
 * The catalog, from the games' catalog modules keyed by their paths: each
 * entry under its directory's name, in id order, which is the order the home
 * screen and menus show.
 */
export function catalogFrom(
  modules: Readonly<Record<string, CatalogModule>>,
): Readonly<Record<string, PuzzleData>> {
  const entries = Object.entries(modules).map(
    ([path, { entry }]): [string, PuzzleData] => {
      const id = MODULE_PATH.exec(path)?.[1];
      if (id === undefined) throw new Error(`${path} is not a game's catalog module`);
      return [id, entry];
    },
  );
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return Object.fromEntries(entries);
}
