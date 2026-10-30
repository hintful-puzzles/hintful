/**
 * The Controls sentences the engine writes for a game's page, each generated
 * where the game has what it describes: `{{mark-all}}` for a game with
 * `markAll`, `{{sticky-pencil}}` for one offering the sticky pencil
 * preference, and `{{rules-out}}` for one declaring what a placement rules
 * out. The help build replaces each before the markdown is rendered.
 *
 * Read from the games themselves (`game-code.ts`), as `controls.ts` does. A
 * page without a sentence its game owes, or with one its game does not, fails
 * the build.
 */

import { descriptionPath } from "../src/describe/paths.ts";
import { pageGame } from "./description-page.ts";
import type { Transform } from "./extra-pages.ts";
import { gameCode } from "./game-code.ts";

/** `source`, the help page of game `id`, with `sentence` where `placeholder`
 * stands. `owed` is whether the game has what the sentence describes, and
 * `what` names that for the refusal. */
function expand(
  id: string,
  source: string,
  placeholder: string,
  sentence: string,
  owed: boolean,
  what: string,
): string {
  const has = source.includes(placeholder);
  if (owed && !has)
    throw new Error(
      `${descriptionPath(id)}: the game ${what}, so its Controls section writes ${placeholder} where the generated sentence goes`,
    );
  if (!owed && has)
    throw new Error(`${descriptionPath(id)}: ${placeholder} needs a game that ${what}`);
  return owed ? source.replace(placeholder, sentence) : source;
}

/** The transform: the page's game is its file's name. */
export const withNoteControls: Transform = async (data, addWatchFile) => {
  const id = pageGame(data);
  const {
    getTsGame,
    MARK_ALL_HELP,
    MARK_ALL_PLACEHOLDER,
    offersStickyPencil,
    RULES_OUT_PLACEHOLDER,
    rulesOutHelp,
    STICKY_PENCIL_HELP,
    STICKY_PENCIL_PLACEHOLDER,
  } = await gameCode(addWatchFile);
  const game = getTsGame(id);
  const markAll = expand(
    id,
    String(data.source ?? ""),
    MARK_ALL_PLACEHOLDER,
    MARK_ALL_HELP,
    game?.markAll !== undefined,
    "has a markAll",
  );
  const sticky = expand(
    id,
    markAll,
    STICKY_PENCIL_PLACEHOLDER,
    STICKY_PENCIL_HELP,
    game !== null && offersStickyPencil(game),
    "offers the sticky pencil preference",
  );
  const rulesOut = game?.rulesOut;
  const source = expand(
    id,
    sticky,
    RULES_OUT_PLACEHOLDER,
    rulesOutHelp(rulesOut?.name ?? ""),
    rulesOut !== undefined,
    "declares rulesOut",
  );
  return { ...data, source };
};
