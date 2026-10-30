/**
 * Every game's help page as the help build renders it, for the tests that read
 * one: each `src/games/<id>/<id>.description.yaml` through `gameHelpPage`, the
 * function the build calls. Read through Vite's glob, so only a test or the
 * build can import it; the registry must be filled before a page is asked for.
 */

import { PARAMETERS_PLACEHOLDER } from "../engine/param-help.ts";
import { getTsGame } from "../engine/registry.ts";
import { rulesetField } from "../engine/ruleset.ts";
import { puzzleDataMap } from "../puzzle/catalog.ts";
import type { HelpJson } from "./description.ts";
import { gameHelpPage } from "./help-page.ts";
import { loadDescriptionFile } from "./load.ts";
import { descriptionPath } from "./paths.ts";

const texts = import.meta.glob<string>("../games/*/*.description.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Every game's description, by its path from the repository's root. */
export const gameDescriptions: ReadonlyMap<string, string> = new Map(
  Object.entries(texts).map(([p, t]) => [`src/${p.slice("../".length)}`, t]),
);

function textOf(id: string): string {
  const text = gameDescriptions.get(descriptionPath(id));
  if (text === undefined) throw new Error(`${descriptionPath(id)} is missing`);
  return text;
}

const pages = new Map<string, string>();

/** Game `id`'s help page, the markdown the help build's transforms take. */
export function helpPage(id: string): string {
  let page = pages.get(id);
  if (page === undefined) {
    const game = getTsGame(id);
    if (!game) throw new Error(`${descriptionPath(id)}: no registered game "${id}"`);
    page = gameHelpPage(id, textOf(id), {
      name: puzzleDataMap[id].name,
      rulesets: rulesetField(game) !== null,
      parameters: PARAMETERS_PLACEHOLDER,
    });
    pages.set(id, page);
  }
  return page;
}

/** The words of game `id`'s help fields, apart, the renderer's headings
 * aside; it needs no registry, so a test may read it as it collects. */
export function helpProse(id: string): string {
  const { sections = [], parameters = {}, ...fields } = gameHelp(id);
  return [
    ...Object.values(fields),
    ...sections.flatMap((s) => [s.heading, s.body]),
    ...Object.values(parameters),
  ].join("\n\n");
}

/** Game `id`'s help fields, as its description states them. */
export function gameHelp(id: string): HelpJson {
  const file = loadDescriptionFile(textOf(id), descriptionPath(id));
  if (!("help" in file) || file.help === undefined)
    throw new Error(`${descriptionPath(id)} carries no help`);
  return file.help;
}
