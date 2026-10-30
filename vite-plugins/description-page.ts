/**
 * A game's help page, read from its description: the first transform of the
 * per-game pages, which are virtual pages each naming its game in `gameId`
 * and its catalog name in `gameName`. It renders the description's `help` to
 * the markdown the transforms after it take (`src/describe/help-page.ts`).
 *
 * The description is read and validated here, on the configuration's side:
 * the game collection's module runner cannot evaluate the YAML and schema
 * parsers, which are CommonJS. What the page needs of the game comes from the
 * collection.
 */

import fs from "node:fs";
import path from "node:path";
import { gameHelpPage } from "../src/describe/help-page.ts";
import { descriptionPath } from "../src/describe/paths.ts";
import type { Transform, TransformData } from "./extra-pages.ts";
import { gameCode } from "./game-code.ts";

/** The game a per-game help page is of. */
export function pageGame(data: TransformData): string {
  const id = data["gameId"];
  if (typeof id !== "string") throw new Error("a game's help page has a gameId");
  return id;
}

export const withDescription: Transform = async (data, addWatchFile) => {
  const id = pageGame(data);
  const sourceFile = path.resolve(descriptionPath(id));
  addWatchFile?.(sourceFile);
  const code = await gameCode(addWatchFile);
  const game = code.getTsGame(id);
  if (!game) throw new Error(`${descriptionPath(id)}: no registered game "${id}"`);
  const source = gameHelpPage(id, fs.readFileSync(sourceFile, "utf8"), {
    name: String(data["gameName"]),
    rulesets: code.rulesetField(game) !== null,
    parameters: code.PARAMETERS_PLACEHOLDER,
  });
  return { ...data, sourceFile, source };
};
