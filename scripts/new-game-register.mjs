#!/usr/bin/env node
/**
 * Register a game `scripts/new-game.sh` has just copied: its catalog entry, its
 * line in the registry, and, where its change is open, the change's promise of
 * a spec.
 *
 * Usage: node scripts/new-game-register.mjs <gameId> <description> <objective>
 *
 * **It registers at once so that the first verdict is a whole one.** No
 * cross-game guard reads a game until it is registered, and the records those
 * guards hold by hand refuse a new game one by one; registered from the start,
 * `npm run game` names them all on its first run. The entry describes the
 * skeleton's puzzle, as the copy's help page does, until the author replaces
 * both, and the family is the one the copy's description names.
 *
 * **A change scaffolded without a delta says so with `skip_specs`**, which
 * `openspec validate` refuses once a spec delta exists. A game owes its spec
 * from its first line, so the promise goes here, and the verdict names the
 * spec as owed from its first run rather than at the end.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const [game, description, objective] = process.argv.slice(2);
if (!game || !description || !objective) {
  console.error("usage: new-game-register.mjs <gameId> <description> <objective>");
  process.exit(2);
}
const pascal = game[0].toUpperCase() + game.slice(1);
const fail = (msg) => {
  console.error(`new-game-register: ${msg}`);
  process.exit(1);
};

const family = /^family: (\w+)$/m.exec(
  readFileSync(`src/games/${game}/${game}.description.yaml`, "utf8"),
)?.[1];
if (!family) fail(`src/games/${game}/${game}.description.yaml names no family`);

/** Put `insert` into `lines` before the first of `keyed` (line indices with
 * their sort keys) whose key sorts after `key`, else before line `end`. */
function insertSorted(lines, keyed, key, end, insert) {
  const at = keyed.find(([, k]) => k > key)?.[0] ?? end;
  lines.splice(at, 0, ...insert);
}

// The catalog: an entry among the sorted ids of `puzzleCatalog`.
const catalogPath = "src/puzzle/catalog-data.ts";
const catalog = readFileSync(catalogPath, "utf8").split("\n");
const open = catalog.indexOf("export const puzzleCatalog = {");
const close = catalog.findIndex((l, i) => i > open && l.startsWith("} as const"));
if (open < 0 || close < 0) fail(`${catalogPath} has no puzzleCatalog object`);
const ids = [];
for (let i = open + 1; i < close; i++) {
  const id = /^ {2}([a-z0-9]+): \{$/.exec(catalog[i])?.[1];
  if (id === game) fail(`${catalogPath} already has ${game}`);
  if (id) ids.push([i, id]);
}
insertSorted(catalog, ids, game, close, [
  `  ${game}: {`,
  `    name: ${JSON.stringify(pascal)},`,
  "    aliases: [],",
  `    description: ${JSON.stringify(description)},`,
  `    objective: ${JSON.stringify(objective)},`,
  '    collection: "own",',
  `    family: ${JSON.stringify(family)},`,
  "  },",
]);
writeFileSync(catalogPath, catalog.join("\n"));

// The registry: an import, sorted by biome after, and a line in
// `registerAllGames`.
const registryPath = "src/games/index.ts";
const registry = readFileSync(registryPath, "utf8").split("\n");
const lastImport = registry.findLastIndex((l) => l.startsWith("import "));
const start = registry.indexOf("export function registerAllGames(): void {");
if (lastImport < 0 || start < 0) fail(`${registryPath} has no registerAllGames`);
registry.splice(lastImport + 1, 0, `import { ${game}Game } from "./${game}/index.ts";`);
const end = registry.findIndex((l, i) => i > start + 1 && l === "}");
registry.splice(end, 0, `  registerGame(${game}Game);`);
writeFileSync(registryPath, registry.join("\n"));

// The change's promise of no spec, where the change is open.
const meta = `openspec/changes/add-${game}/.openspec.yaml`;
if (existsSync(meta)) {
  const text = readFileSync(meta, "utf8");
  if (/^skip_specs: true$/m.test(text)) {
    // The comment above `schema` says why the change has no delta; it goes too.
    const kept = text
      .split("\n")
      .filter((l) => l !== "skip_specs: true")
      .join("\n")
      .replace(/^(#.*\n)+(?=schema:)/, "");
    writeFileSync(meta, kept);
    console.log(`${meta}: skip_specs removed; the game's spec is owed now.`);
  }
}
