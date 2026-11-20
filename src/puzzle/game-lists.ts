/**
 * The lists of games on the site's own help pages, written where a page puts
 * a marker, so a new game is on them by being what it is
 * (`vite-plugins/game-lists.ts` runs this over every `help/*.md`):
 *
 * - `{{puzzle-list}}`, on a line of its own: the table of every cataloged
 *   game, sorted by name, with its link, its help link and the puzzles it is
 *   similar to (`PuzzleData.similar`).
 * - `{{no-right-click-games}}`: the names of the games given, as "A, B and
 *   C". The plugin gives those that declare `ignoresSecondaryButton`.
 *
 * It is given the catalog, and imports nothing but a type, so the Vite config
 * may import it.
 */

import type { PuzzleData } from "../engine/catalog.ts";

type Catalog = Readonly<Record<string, PuzzleData>>;

const TABLE = /^\{\{puzzle-list\}\}$/m;
export const NO_RIGHT_CLICK = "{{no-right-click-games}}";

/** The table, as markdown. */
function puzzleListMarkdown(catalog: Catalog): string {
  const rows = Object.entries(catalog)
    .sort(([, a], [, b]) => a.name.localeCompare(b.name, "en"))
    .map(
      ([id, { name, similar }]) =>
        `| [${name}](../${id}) | [help](${id}) | ${similar ?? ""} |`,
    );
  return [
    "| Puzzle | Instructions | Similar/related puzzles[\\*](#tm) |",
    "|---|---|---|",
    ...rows,
  ].join("\n");
}

/** The catalog names of `ids`, sorted, as "A, B and C". */
function gameNames(catalog: Catalog, ids: readonly string[]): string {
  const names = ids.map((id) => catalog[id]?.name ?? id).sort();
  return names.length < 2
    ? names.join("")
    : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** `source` with its markers replaced: the table, and the names of the games
 * in `noRightClick`. A page with no marker is returned as it is. */
export function insertGameLists(
  catalog: Catalog,
  source: string,
  noRightClick: readonly string[],
): string {
  return source
    .replace(TABLE, () => puzzleListMarkdown(catalog))
    .replaceAll(NO_RIGHT_CLICK, () => gameNames(catalog, noRightClick));
}
