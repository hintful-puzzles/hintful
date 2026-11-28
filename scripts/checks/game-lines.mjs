#!/usr/bin/env node
/**
 * The TypeScript under `src/games/` only shrinks (`a-game-from-its-description-alone`,
 * design.md § "The figures, and the ratchet"). A game is heading to be its
 * description alone, so a game's hand-written code is what a born game no
 * longer needs; this holds the count to a committed ceiling, and the change
 * that lowers the count lowers the ceiling with it.
 *
 * Tests are not counted: a born game keeps its tests. Files are read from
 * disk, not from git, so a new untracked file counts before it is added.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CEILING = 110_054;

const games = fileURLToPath(new URL("../../src/games", import.meta.url));
let lines = 0;
for (const entry of readdirSync(games, { recursive: true })) {
  const file = String(entry);
  if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
  const text = readFileSync(join(games, file), "utf8");
  lines += text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
}

if (lines > CEILING) {
  console.error(
    `✗ game-lines: src/games/ holds ${lines} lines of TypeScript, tests excluded, ` +
      `${lines - CEILING} over the ceiling of ${CEILING}.`,
  );
  console.error(
    "  A game's logic belongs in its description and the engine (docs/descriptions.md).",
  );
  process.exit(1);
}
if (lines < CEILING) {
  console.error(
    `✗ game-lines: src/games/ holds ${lines} lines of TypeScript, tests excluded; ` +
      `lower CEILING in scripts/checks/game-lines.mjs from ${CEILING} to ${lines}.`,
  );
  process.exit(1);
}
console.log(`✓ game-lines: ${lines} lines under src/games/, at the ceiling.`);
