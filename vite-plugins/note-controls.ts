/**
 * The two Controls sentences every note-taking game's page shares, each
 * generated where the game has what it describes: `{{mark-all}}` for a game
 * with `markAll`, and `{{sticky-pencil}}` for one offering the sticky
 * pencil preference. The help build replaces each before the markdown is
 * rendered.
 *
 * Read by importing the games themselves, as `controls.ts` does. A page
 * without a sentence its game owes, or with one its game does not, fails the
 * build.
 */

import path from "node:path";
import { MARK_ALL_HELP, MARK_ALL_PLACEHOLDER } from "../src/engine/candidate-hint.ts";
import {
  offersStickyPencil,
  STICKY_PENCIL_HELP,
  STICKY_PENCIL_PLACEHOLDER,
} from "../src/engine/pencil-prefs.ts";
import { getTsGame } from "../src/engine/registry.ts";
import "../src/games/index.ts";
import type { Transform } from "./extra-pages.ts";

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
      `help/games/${id}.md: the game ${what}, so its Controls section writes ${placeholder} where the generated sentence goes`,
    );
  if (!owed && has)
    throw new Error(`help/games/${id}.md: ${placeholder} needs a game that ${what}`);
  return owed ? source.replace(placeholder, sentence) : source;
}

/** The transform: the page's game is its file's name. */
export const withNoteControls: Transform = (data) => {
  const id = path.basename(String(data.sourceFile ?? ""), ".md");
  const game = getTsGame(id);
  const markAll = expand(
    id,
    String(data.source ?? ""),
    MARK_ALL_PLACEHOLDER,
    MARK_ALL_HELP,
    game?.markAll !== undefined,
    "has a markAll",
  );
  const source = expand(
    id,
    markAll,
    STICKY_PENCIL_PLACEHOLDER,
    STICKY_PENCIL_HELP,
    game !== null && offersStickyPencil(game),
    "offers the sticky pencil preference",
  );
  return { ...data, source };
};
