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
 * Read from the games themselves (`game-code.ts`), as `hint-marks.ts` does, so
 * the list cannot disagree with the Custom dialog. A page without the
 * placeholder fails the build.
 */

import path from "node:path";
import type { Transform } from "./extra-pages.ts";
import { type GameCode, gameCode } from "./game-code.ts";

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
function expandParameters(code: GameCode, id: string, source: string): string {
  const {
    expandChoices,
    getTsGame,
    MODIFIERS_PLACEHOLDER,
    modifiersMarkdown,
    modifiersOf,
    PARAMETERS_PLACEHOLDER,
    parametersMarkdown,
    RULESETS_PLACEHOLDER,
    rulesetField,
    rulesetsMarkdown,
  } = code;
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
export const withParameters: Transform = async (data, addWatchFile) => {
  const id = path.basename(String(data.sourceFile ?? ""), ".md");
  const code = await gameCode(addWatchFile);
  return { ...data, source: expandParameters(code, id, String(data.source ?? "")) };
};
