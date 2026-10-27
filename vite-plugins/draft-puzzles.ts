/**
 * `virtual:draft-puzzles`: each draft game's id, mapped to the player-facing
 * names of the contract sections it lacks (`src/engine/sections.ts`). The home
 * screen labels those games from it.
 *
 * Computed from the registered games when the module is first loaded, because
 * the home screen never loads game code itself: every game runs in its own
 * page's worker. The games are loaded through `game-code.ts` only then, so a
 * build or test run that never asks for this module pays nothing for it, and
 * an edit to a game reloads the module in dev.
 */

import type { Plugin } from "vite";
import { gameCode } from "./game-code.ts";

const ID = "virtual:draft-puzzles";
const RESOLVED = `\0${ID}`;

/** The module's contents: every draft among the registered games. */
async function draftPuzzlesModule(watch: (file: string) => void): Promise<string> {
  const { draftSections, getTsGame, registeredGameIds } = await gameCode(watch);
  const drafts: Record<string, string[]> = {};
  for (const id of registeredGameIds()) {
    const game = getTsGame(id);
    const missing = game === null ? [] : draftSections(game);
    if (missing.length > 0) drafts[id] = missing;
  }
  return `export default ${JSON.stringify(drafts)};\n`;
}

export function draftPuzzles(): Plugin {
  return {
    name: "draft-puzzles",
    resolveId: (id) => (id === ID ? RESOLVED : null),
    load(id) {
      return id === RESOLVED
        ? draftPuzzlesModule((file) => this.addWatchFile(file))
        : null;
    },
  };
}
