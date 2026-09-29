/**
 * The Parameters section, generated from the game's `paramConfig`: a game page
 * writes `{{parameters}}` under its `## <Name> parameters` heading, and the
 * help build replaces it before the markdown is rendered.
 *
 * Read by importing the games themselves, as `hint-marks.ts` does, so the list
 * cannot disagree with the Custom dialog. A page without the placeholder fails
 * the build.
 */

import path from "node:path";
import {
  PARAMETERS_PLACEHOLDER,
  parametersMarkdown,
} from "../src/engine/param-help.ts";
import { getTsGame } from "../src/engine/registry.ts";
import "../src/games/index.ts";
import type { Transform } from "./extra-pages.ts";

/** `source`, the help page of game `id`, with its parameters in place. */
function expandParameters(id: string, source: string): string {
  const game = getTsGame(id);
  if (!game) throw new Error(`help/games/${id}.md: no registered game "${id}"`);
  if (!source.includes(PARAMETERS_PLACEHOLDER))
    throw new Error(
      `help/games/${id}.md: its parameters section writes ${PARAMETERS_PLACEHOLDER} where the generated list goes`,
    );
  return source.replace(
    PARAMETERS_PLACEHOLDER,
    parametersMarkdown(game.paramConfig ?? []),
  );
}

/** The transform: the page's game is its file's name. */
export const withParameters: Transform = (data) => {
  const id = path.basename(String(data.sourceFile ?? ""), ".md");
  return { ...data, source: expandParameters(id, String(data.source ?? "")) };
};
