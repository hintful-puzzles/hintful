/**
 * The transform that writes the lists of games into the site's own help
 * pages (`src/puzzle/game-lists.ts` says which). The games that declare
 * `ignoresSecondaryButton` are read from the games themselves
 * (`game-code.ts`), and only a page that names them loads them.
 */

import { insertGameLists, NO_RIGHT_CLICK } from "../src/puzzle/game-lists.ts";
import { puzzleCatalog } from "./catalog.ts";
import type { Transform } from "./extra-pages.ts";
import { gameCode } from "./game-code.ts";

export const withGameLists: Transform = async (data, addWatchFile) => {
  const source = String(data.source ?? "");
  let noRightClick: string[] = [];
  if (source.includes(NO_RIGHT_CLICK)) {
    const code = await gameCode(addWatchFile);
    noRightClick = code
      .registeredGameIds()
      .filter((id) => code.getTsGame(id)?.ignoresSecondaryButton === true);
  }
  return { ...data, source: insertGameLists(puzzleCatalog, source, noRightClick) };
};
