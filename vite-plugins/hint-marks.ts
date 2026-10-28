/**
 * The Hints section's generated parts: the list of marks, from the game's
 * legend (`Game.hintMarks`), where a game page writes `{{hint-marks}}`; and
 * what a wing is, for a game whose hint can be one (`"wing"` among its
 * `hintRungs`), where it writes `{{wing}}`. The help build replaces each before
 * the markdown is rendered.
 *
 * Read from the games themselves (`game-code.ts`), so a page cannot disagree
 * with what the hint does. A page without a part its game owes, or with one
 * its game does not, fails the build.
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

/** `source`, the help page of game `id`, with what a wing is in place. */
function expandWing(code: GameCode, id: string, source: string): string {
  const { WING_PLACEHOLDER, getTsGame, wingHelp } = code;
  const owed = getTsGame(id)?.hintRungs?.includes("wing") ?? false;
  const has = source.match(WING_PLACEHOLDER) !== null;
  if (owed && !has)
    throw new Error(
      `help/games/${id}.md: the game's hint can be a wing, so its Hints section writes {{wing}} among the ideas it teaches`,
    );
  if (!owed && has)
    throw new Error(`help/games/${id}.md: {{wing}} needs a hint that can be a wing`);
  return source.replace(WING_PLACEHOLDER, (_, cell?: string) => wingHelp(cell));
}

/** The transform: the page's game is its file's name. */
export const withHintMarks: Transform = async (data, addWatchFile) => {
  const id = path.basename(String(data.sourceFile ?? ""), ".md");
  const code = await gameCode(addWatchFile);
  const source = expandHintMarks(code, id, String(data.source ?? ""));
  return { ...data, source: expandWing(code, id, source) };
};
