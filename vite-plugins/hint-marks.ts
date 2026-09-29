/**
 * The Hints section's list of marks, generated from the game's legend
 * (`Game.hintMarks`): a game page writes `{{hint-marks}}` where the list goes,
 * and the help build replaces it before the markdown is rendered.
 *
 * Read by importing the games themselves, as `vite.config.ts` already imports
 * the catalog, so the list cannot disagree with what the hint validator holds
 * the game to. A bound game's page without the placeholder, or an unbound
 * game's page with one, fails the build.
 */

import path from "node:path";
import { HINT_MARKS_PLACEHOLDER, legendMarkdown } from "../src/engine/hint-words.ts";
import { getTsGame } from "../src/engine/registry.ts";
import "../src/games/index.ts";
import type { Transform } from "./extra-pages.ts";

/** `source`, the help page of game `id`, with its list of marks in place. */
function expandHintMarks(id: string, source: string): string {
  const legend = getTsGame(id)?.hintMarks;
  const has = source.includes(HINT_MARKS_PLACEHOLDER);
  if (legend && !has)
    throw new Error(
      `help/games/${id}.md: the game declares hintMarks, so its Hints section writes ${HINT_MARKS_PLACEHOLDER} where its list of marks goes`,
    );
  if (!legend && has)
    throw new Error(
      `help/games/${id}.md: ${HINT_MARKS_PLACEHOLDER} needs the game to declare hintMarks`,
    );
  return legend
    ? source.replace(HINT_MARKS_PLACEHOLDER, legendMarkdown(legend.roles))
    : source;
}

/** The transform: the page's game is its file's name. */
export const withHintMarks: Transform = (data) => {
  const id = path.basename(String(data.sourceFile ?? ""), ".md");
  return { ...data, source: expandHintMarks(id, String(data.source ?? "")) };
};
