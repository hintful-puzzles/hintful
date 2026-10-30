/**
 * The Controls paragraph of a game whose input is targets and verbs, generated
 * from its `Game.targetVerbs`: its page writes `{{controls}}` where the
 * paragraph goes, and the help build replaces it before the markdown is
 * rendered.
 *
 * Read from the games themselves (`game-code.ts`), as `hint-marks.ts` does, so
 * the page cannot name a key the game does not bind. A declaring game's page
 * without the placeholder, or another game's page with one, fails the build.
 */

import { descriptionPath } from "../src/describe/paths.ts";
import { pageGame } from "./description-page.ts";
import type { Transform } from "./extra-pages.ts";
import { type GameCode, gameCode } from "./game-code.ts";

/** `source`, the help page of game `id`, with its Controls paragraph in place. */
function expandControls(code: GameCode, id: string, source: string): string {
  const { CONTROLS_PLACEHOLDER, controlsMarkdown, getTsGame } = code;
  const verbs = getTsGame(id)?.targetVerbs;
  const has = source.includes(CONTROLS_PLACEHOLDER);
  if (verbs && !has)
    throw new Error(
      `${descriptionPath(id)}: the game declares targetVerbs, so its Controls section writes ${CONTROLS_PLACEHOLDER} where the generated paragraph goes`,
    );
  if (!verbs && has)
    throw new Error(
      `${descriptionPath(id)}: ${CONTROLS_PLACEHOLDER} needs the game to declare targetVerbs`,
    );
  return verbs ? source.replace(CONTROLS_PLACEHOLDER, controlsMarkdown(verbs)) : source;
}

/** The transform: the page's game is its file's name. */
export const withControls: Transform = async (data, addWatchFile) => {
  const id = pageGame(data);
  const code = await gameCode(addWatchFile);
  return { ...data, source: expandControls(code, id, String(data.source ?? "")) };
};
