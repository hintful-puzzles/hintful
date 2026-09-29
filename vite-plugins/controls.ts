/**
 * The Controls paragraph of a game whose input is targets and verbs, generated
 * from its `Game.targetVerbs`: its page writes `{{controls}}` where the
 * paragraph goes, and the help build replaces it before the markdown is
 * rendered.
 *
 * Read by importing the games themselves, as `hint-marks.ts` does, so the page
 * cannot name a key the game does not bind. A declaring game's page without the
 * placeholder, or another game's page with one, fails the build.
 */

import path from "node:path";
import { getTsGame } from "../src/engine/registry.ts";
import { CONTROLS_PLACEHOLDER, controlsMarkdown } from "../src/engine/target-verb.ts";
import "../src/games/index.ts";
import type { Transform } from "./extra-pages.ts";

/** `source`, the help page of game `id`, with its Controls paragraph in place. */
function expandControls(id: string, source: string): string {
  const verbs = getTsGame(id)?.targetVerbs;
  const has = source.includes(CONTROLS_PLACEHOLDER);
  if (verbs && !has)
    throw new Error(
      `help/games/${id}.md: the game declares targetVerbs, so its Controls section writes ${CONTROLS_PLACEHOLDER} where the generated paragraph goes`,
    );
  if (!verbs && has)
    throw new Error(
      `help/games/${id}.md: ${CONTROLS_PLACEHOLDER} needs the game to declare targetVerbs`,
    );
  return verbs ? source.replace(CONTROLS_PLACEHOLDER, controlsMarkdown(verbs)) : source;
}

/** The transform: the page's game is its file's name. */
export const withControls: Transform = (data) => {
  const id = path.basename(String(data.sourceFile ?? ""), ".md");
  return { ...data, source: expandControls(id, String(data.source ?? "")) };
};
