/**
 * The collection's games. Importing this module registers every one: each
 * game's `index.ts` registers itself as it loads, and this loads every
 * directory's, so a game is registered by existing. The worker's dispatch
 * seam (`createTsEngine`) finds them in the registry.
 *
 * It then holds the registry and the catalog to the directories: every
 * directory registers a game under its own name and has a catalog entry
 * (`catalog.ts`), and no catalog entry sits where there is no game. A game
 * absent from the registry cannot be played, and one absent from the catalog
 * cannot be reached, so either is an error as the games load.
 */

import { hasTsGame } from "../engine/midend/registry.ts";

const directoryOf = (path: string) => path.split("/")[1] ?? path;

// Bound to a name: Vite compiles `Object.keys(import.meta.glob(...))` written
// as one expression to the paths alone, importing none of the modules.
const games = import.meta.glob("./*/index.ts", { eager: true });
// A game born from its description: the compiler writes the module that
// registers it, and its catalog entry, under the generated directory.
const born = import.meta.glob("../generated/games/*/*.game.ts", { eager: true });
const bornOf = (path: string) => path.split("/")[3] ?? path;
const directories = [
  ...Object.keys(games).map(directoryOf),
  ...Object.keys(born).map(bornOf),
];
// The paths alone, which is all this needs of the entries.
const cataloged = [
  ...Object.keys(import.meta.glob("./*/catalog.ts")).map(directoryOf),
  ...Object.keys(import.meta.glob("../generated/games/*/*.catalog.ts")).map(bornOf),
];

const unregistered = directories.filter((id) => !hasTsGame(id));
if (unregistered.length > 0) {
  throw new Error(
    `src/games/${unregistered.join(", ")}: index.ts registers no game under its directory's name`,
  );
}
const uncataloged = directories.filter((id) => !cataloged.includes(id));
if (uncataloged.length > 0) {
  throw new Error(`src/games/${uncataloged.join(", ")}: no catalog.ts`);
}
const gameless = cataloged.filter((id) => !directories.includes(id));
if (gameless.length > 0) {
  throw new Error(`src/games/${gameless.join(", ")}: a catalog.ts with no index.ts`);
}
