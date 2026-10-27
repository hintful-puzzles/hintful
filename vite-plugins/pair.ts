/**
 * The names of the two-state pair, where a game's help page writes
 * `{{pair:0}}` or `{{pair:1}}`: the help build replaces each before the
 * markdown is rendered, with the word the palette gives that member.
 */

import type { Transform } from "./extra-pages.ts";
import { gameCode } from "./game-code.ts";

export const withPair: Transform = async (data, addWatchFile) => {
  const { expandPair } = await gameCode(addWatchFile);
  return { ...data, source: expandPair(String(data.source ?? "")) };
};
