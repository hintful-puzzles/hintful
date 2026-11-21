#!/usr/bin/env node
/**
 * Register a game `scripts/new-game.sh` has just copied: its catalog entry,
 * `src/games/<id>/catalog.ts`, and, where its change is open, the change's
 * promise of a spec. The copy's `index.ts` registers the game itself, and
 * `src/games/index.ts` loads every directory's, so no shared file is edited.
 *
 * Usage: node scripts/new-game-register.mjs <gameId> <description> <objective> <family>
 *
 * **It registers at once so that the first verdict is a whole one.** No
 * cross-game guard reads a game until it is registered, and the records those
 * guards hold by hand refuse a new game one by one; registered from the start,
 * `npm run game` names them all on its first run. The entry describes the
 * skeleton's puzzle, as the copy's help page does, until the author replaces
 * both. `family` is the catalog's (`puzzleFamilies` in `src/engine/contract/catalog.ts`),
 * which the skeleton's kind names: a description's `produces` is another
 * vocabulary, and a code game's is `code` where the catalog's is `hidden`.
 *
 * **A change scaffolded without a delta says so with `skip_specs`**, which
 * `openspec validate` refuses once a spec delta exists. A game owes its spec
 * from its first line, so the promise goes here, and the verdict names the
 * spec as owed from its first run rather than at the end.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const [game, description, objective, family] = process.argv.slice(2);
if (!game || !description || !objective || !family) {
  console.error(
    "usage: new-game-register.mjs <gameId> <description> <objective> <family>",
  );
  process.exit(2);
}

const catalogPath = `src/games/${game}/catalog.ts`;
if (existsSync(catalogPath)) {
  console.error(`new-game-register: ${catalogPath} already exists`);
  process.exit(1);
}
writeFileSync(
  catalogPath,
  [
    'import type { PuzzleData } from "../../engine/contract/catalog.ts";',
    "",
    "export const entry: PuzzleData = {",
    `  name: ${JSON.stringify(game[0].toUpperCase() + game.slice(1))},`,
    "  aliases: [],",
    `  description: ${JSON.stringify(description)},`,
    `  objective: ${JSON.stringify(objective)},`,
    '  collection: "own",',
    `  family: ${JSON.stringify(family)},`,
    "};",
    "",
  ].join("\n"),
);

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
