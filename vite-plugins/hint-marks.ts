/**
 * The Hints section's list of marks, generated from the game's legend
 * (`Game.hintMarks`): a game page writes `{{hint-marks}}` where the list goes,
 * and the help build replaces it before the markdown is rendered.
 *
 * Read from the games themselves (`game-code.ts`), so the list cannot disagree
 * with what the hint validator holds the game to. A bound game's page without
 * the placeholder, or an unbound game's page with one, fails the build.
 */

import path from "node:path";
import type { Transform } from "./extra-pages.ts";
import { type GameCode, gameCode } from "./game-code.ts";

/** `source`, the help page of game `id`, with its list of marks in place. */
function expandHintMarks(code: GameCode, id: string, source: string): string {
  const { HINT_MARKS_PLACEHOLDER, getTsGame, legendMarkdown } = code;
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
export const withHintMarks: Transform = async (data, addWatchFile) => {
  const id = path.basename(String(data.sourceFile ?? ""), ".md");
  const code = await gameCode(addWatchFile);
  return { ...data, source: expandHintMarks(code, id, String(data.source ?? "")) };
};
