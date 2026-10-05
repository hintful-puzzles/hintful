/**
 * The Parameters section, generated from the game's `paramConfig`: a game page
 * writes `{{parameters}}` under its `## <Name> parameters` heading, and the
 * help build replaces it before the markdown is rendered.
 *
 * A game with rulesets (`engine/ruleset.ts`) has its list of them generated
 * too, where its page writes `{{rulesets}}`, and a game with rule modifiers
 * (`engine/modifier.ts`) theirs at `{{modifiers}}`; a declaring game's page
 * without the placeholder, or another game's page with one, fails the build.
 *
 * Where a page's prose names a choice of one of those fields it writes
 * `{{choice:kw:index}}`, which `expandChoices` replaces with the choice's name.
 *
 * Read by importing the games themselves, as `hint-marks.ts` does, so the list
 * cannot disagree with the Custom dialog. A page without the placeholder fails
 * the build.
 */

import path from "node:path";
import {
  MODIFIERS_PLACEHOLDER,
  modifiersMarkdown,
  modifiersOf,
} from "../src/engine/modifier.ts";
import {
  expandChoices,
  PARAMETERS_PLACEHOLDER,
  parametersMarkdown,
} from "../src/engine/param-help.ts";
import { getTsGame } from "../src/engine/registry.ts";
import {
  RULESETS_PLACEHOLDER,
  rulesetField,
  rulesetsMarkdown,
} from "../src/engine/ruleset.ts";
import "../src/games/index.ts";
import type { Transform } from "./extra-pages.ts";

/**
 * `source` with `list` where it writes `placeholder`. A game that declares
 * `what` has a list, and its page carries the placeholder once; a game that
 * declares none has `""`, and its page carries no placeholder.
 */
function withList(
  id: string,
  source: string,
  placeholder: string,
  list: string,
  what: string,
): string {
  const written = source.split(placeholder).length - 1;
  if (written !== (list ? 1 : 0))
    throw new Error(
      list
        ? `help/games/${id}.md: the game declares ${what}, so its rules write ${placeholder} once, where their list goes`
        : `help/games/${id}.md: ${placeholder} needs the game to declare ${what}`,
    );
  return list ? source.replace(placeholder, list) : source;
}

/** `source`, the help page of game `id`, with its parameters in place. */
function expandParameters(id: string, source: string): string {
  const game = getTsGame(id);
  if (!game) throw new Error(`help/games/${id}.md: no registered game "${id}"`);
  if (!source.includes(PARAMETERS_PLACEHOLDER))
    throw new Error(
      `help/games/${id}.md: its parameters section writes ${PARAMETERS_PLACEHOLDER} where the generated list goes`,
    );
  const config = game.paramConfig ?? [];
  const rulesets = rulesetField(game)?.rulesets ?? [];
  const modifiers = modifiersOf(game);
  const listed = withList(
    id,
    withList(id, source, RULESETS_PLACEHOLDER, rulesetsMarkdown(rulesets), "rulesets"),
    MODIFIERS_PLACEHOLDER,
    modifiersMarkdown(modifiers),
    "rule modifiers",
  );
  try {
    return expandChoices(config, listed).replace(
      PARAMETERS_PLACEHOLDER,
      parametersMarkdown(config),
    );
  } catch (e) {
    throw new Error(`help/games/${id}.md: ${e instanceof Error ? e.message : e}`);
  }
}

/** The transform: the page's game is its file's name. */
export const withParameters: Transform = (data) => {
  const id = path.basename(String(data.sourceFile ?? ""), ".md");
  return { ...data, source: expandParameters(id, String(data.source ?? "")) };
};
