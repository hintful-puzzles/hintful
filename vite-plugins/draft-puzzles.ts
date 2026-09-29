/**
 * `virtual:draft-puzzles`: each draft game's id, mapped to the player-facing
 * names of the contract sections it lacks (`src/engine/sections.ts`). The home
 * screen labels those games from it.
 *
 * Computed from the registered games when the module is first loaded, because
 * the home screen never loads game code itself: every game runs in its own
 * page's worker. The games are imported lazily, so a build or test run that
 * never asks for this module pays nothing for it.
 */

import type { Plugin } from "vite";

const ID = "virtual:draft-puzzles";
const RESOLVED = `\0${ID}`;

/** The module's contents: every draft among the registered games. */
async function draftPuzzlesModule(): Promise<string> {
  const { registerAllGames } = await import("../src/games/index.ts");
  const { getTsGame, registeredGameIds } = await import("../src/engine/registry.ts");
  const { draftSections } = await import("../src/engine/sections.ts");
  registerAllGames();
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
    load: (id) => (id === RESOLVED ? draftPuzzlesModule() : null),
  };
}
