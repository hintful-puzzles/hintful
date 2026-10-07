/**
 * The names of the two-state pair, where a game's help page writes
 * `{{pair:0}}` or `{{pair:1}}`: the help build replaces each before the
 * markdown is rendered, with the word the palette gives that member.
 */

import { expandPair } from "../src/engine/piece.ts";
import type { Transform } from "./extra-pages.ts";

export const withPair: Transform = (data) => ({
  ...data,
  source: expandPair(String(data.source ?? "")),
});
