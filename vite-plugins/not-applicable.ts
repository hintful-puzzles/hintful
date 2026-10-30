/**
 * The "Not in this game" section, generated from the game's
 * `Game.notApplicable` reasons and inserted above the page's last section,
 * which `help-coverage.test.ts` holds to be its parameters. A page writes
 * nothing for it: the whole section comes from the contract.
 *
 * Read from the games themselves (`game-code.ts`), as `hint-marks.ts` does.
 */

import { descriptionPath } from "../src/describe/paths.ts";
import { pageGame } from "./description-page.ts";
import type { Transform } from "./extra-pages.ts";
import { type GameCode, gameCode } from "./game-code.ts";

/** `source`, the help page of game `id`, with its reasons in place. */
function insertNotApplicable(code: GameCode, id: string, source: string): string {
  const game = code.getTsGame(id);
  if (!game) throw new Error(`${descriptionPath(id)}: no registered game "${id}"`);
  const section = code.notApplicableMarkdown(game);
  if (section === "") return source;
  const last = source.lastIndexOf("\n## ");
  if (last < 0) throw new Error(`${descriptionPath(id)}: no section to insert above`);
  return `${source.slice(0, last + 1)}${section}\n${source.slice(last + 1)}`;
}

/** The transform: the page's game is its file's name. */
export const withNotApplicable: Transform = async (data, addWatchFile) => {
  const id = pageGame(data);
  const code = await gameCode(addWatchFile);
  return { ...data, source: insertNotApplicable(code, id, String(data.source ?? "")) };
};
