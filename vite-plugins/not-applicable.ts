/**
 * The "Not in this game" section, generated from the game's
 * `Game.notApplicable` reasons and inserted above the page's last section,
 * which `help-coverage.test.ts` holds to be its parameters. A page writes
 * nothing for it: the whole section comes from the contract.
 *
 * Read by importing the games themselves, as `hint-marks.ts` does.
 */

import path from "node:path";
import { getTsGame } from "../src/engine/registry.ts";
import { notApplicableMarkdown } from "../src/engine/sections.ts";
import "../src/games/index.ts";
import type { Transform } from "./extra-pages.ts";

/** `source`, the help page of game `id`, with its reasons in place. */
function insertNotApplicable(id: string, source: string): string {
  const game = getTsGame(id);
  if (!game) throw new Error(`help/games/${id}.md: no registered game "${id}"`);
  const section = notApplicableMarkdown(game);
  if (section === "") return source;
  const last = source.lastIndexOf("\n## ");
  if (last < 0) throw new Error(`help/games/${id}.md: no section to insert above`);
  return `${source.slice(0, last + 1)}${section}\n${source.slice(last + 1)}`;
}

/** The transform: the page's game is its file's name. */
export const withNotApplicable: Transform = (data) => {
  const id = path.basename(String(data.sourceFile ?? ""), ".md");
  return { ...data, source: insertNotApplicable(id, String(data.source ?? "")) };
};
