/**
 * The game catalog, for the Vite config, which reads it as it loads: the
 * puzzle and help pages it serves, and the count the pages state.
 *
 * Read from `src/games/<id>/catalog.ts`, the population the app's own reader
 * (`src/puzzle/catalog.ts`) globs. The config's bundler does not expand a
 * glob, so this lists the directories and has Node import each module, whose
 * only import is a type. A directory without one fails the config load, as
 * it fails the app's catalog check (`src/games/index.ts`).
 *
 * Those imports are not part of the config's bundle, so Vite does not restart
 * on an edit to one: `catalogRestart` does. The fragment keeps Node's module
 * cache, which outlives a restart and keys on it, from serving a module as it
 * was. It ends in `.ts` because Vite, which loads this module in a test, takes
 * the language from the end of the whole URL.
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Plugin } from "vite";
import type { PuzzleData } from "../src/engine/catalog.ts";
import { type CatalogModule, catalogFrom } from "../src/puzzle/catalog-data.ts";

const GAMES = path.resolve(import.meta.dirname, "../src/games");

/** Every game's catalog entry, by id, in id order, as the files are now. */
async function readCatalog(): Promise<Readonly<Record<string, PuzzleData>>> {
  const ids = fs
    .readdirSync(GAMES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const modules = await Promise.all(
    ids.map(async (id): Promise<[string, CatalogModule]> => {
      const file = path.join(GAMES, id, "catalog.ts");
      const url = `${pathToFileURL(file).href}#${fs.statSync(file).mtimeMs}.ts`;
      const module: CatalogModule = await import(url);
      return [`games/${id}/catalog.ts`, module];
    }),
  );
  return catalogFrom(Object.fromEntries(modules));
}

export const puzzleCatalog = await readCatalog();

const CATALOG_FILE = /\/src\/games\/[^/]+\/catalog\.ts$/;

/** Restarts the dev server when a game's catalog entry is added, edited or
 * removed, so the pages built from the catalog follow it. */
export function catalogRestart(): Plugin {
  return {
    name: "catalog-restart",
    configureServer(server) {
      const restart = (file: string) => {
        if (CATALOG_FILE.test(file.split(path.sep).join("/"))) void server.restart();
      };
      server.watcher.on("add", restart);
      server.watcher.on("change", restart);
      server.watcher.on("unlink", restart);
    },
  };
}
