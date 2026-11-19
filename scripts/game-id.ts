/**
 * Print a game's ID for a board: `npm run game-id -- <game> [<params>]
 * (--seed <seed> | --desc <desc>)`.
 *
 * A guard that pins a board (`warm-repaint.test.ts`'s `PINNED` and `WRONG`,
 * `no-solution-load.test.ts`'s `REFUSED`) takes it as `params:desc`. This
 * deals or reads the board through the midend the app runs
 * (`src/engine/testing/game-id-of.ts`) and prints the ID it announces, so a
 * pin is written without a throwaway test. Params left out are the game's
 * default.
 *
 * The engine is loaded through Vite's module runner, since Node cannot strip
 * the engine's types by itself.
 */
import path from "node:path";
import { runnerImport } from "vite";

const ROOT = path.resolve(import.meta.dirname, "..");
const USAGE =
  "usage: npm run game-id -- <game> [<params>] (--seed <seed> | --desc <desc>)";

function fail(message: string): never {
  console.error(`game-id: ${message}`);
  process.exit(2);
}

const args = process.argv.slice(2);
const positional: string[] = [];
let board: { seed: string } | { desc: string } | null = null;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--seed" || arg === "--desc") {
    const value = args[++i];
    if (value === undefined || board !== null) fail(USAGE);
    board = arg === "--seed" ? { seed: value } : { desc: value };
  } else if (arg.startsWith("--")) fail(`unknown option ${arg}\n${USAGE}`);
  else positional.push(arg);
}
if (board === null || positional.length < 1 || positional.length > 2) fail(USAGE);

const { module } = await runnerImport<
  typeof import("../src/engine/testing/game-id-of.ts")
>("/src/engine/testing/game-id-of.ts", {
  root: ROOT,
  configFile: false,
  logLevel: "warn",
});
const result = module.gameIdOf(positional[0], positional[1] ?? null, board);
if (!result.ok) fail(result.error);
console.log(result.id);
