/**
 * **What a puzzle search matches on** — one definition, used by the home
 * screen's search box and by the `Ctrl/Cmd+K` quick-switch, because two search
 * boxes agree about what they search only if there is one answer.
 *
 * The haystack is deliberately wide — a **name, its other names, its one-line
 * description, its family and its objective** — because a puzzle search is a recall aid, not a
 * filter over structured data. Someone typing "sudoku" wants Solo, someone
 * typing "loop" wants Loopy and Pearl and Tracks, and someone typing "letters"
 * wants ABCD. Missing the game they meant costs far more than surfacing one
 * they did not.
 */
import {
  familyLabel,
  type PuzzleFamily,
  puzzleDataMap,
  puzzleFamilies,
} from "./catalog.ts";

/** Everything a query is matched against for `puzzleId`, lowercased. Built per
 * call: the catalog is 57 entries and a keystroke is not a hot loop. */
function searchHaystack(puzzleId: string): string {
  const data = puzzleDataMap[puzzleId];
  if (!data) return "";
  const { name, aliases, description, objective, family } = data;
  return [name, ...(aliases ?? []), description, familyLabel(family), objective]
    .join(" ")
    .toLowerCase();
}

/** Whether `puzzleId` matches `query`. An empty query matches everything —
 * "show me nothing until you type" is not what an empty box means. */
export function matchesQuery(puzzleId: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return searchHaystack(puzzleId).includes(needle);
}

/**
 * The puzzles of `ids` that match `query`, the closest first: one whose name
 * the query is, then names it begins, then another name of a puzzle it is or
 * begins, then every other match, each in the order `ids` gives. A player
 * who types a game's whole name wants that game, and the quick-switch's
 * Enter takes the first row (owner, 2026-10-23: "path" listed Ascent first,
 * whose objective says "path").
 */
export function searchResults(ids: readonly string[], query: string): string[] {
  const needle = query.trim().toLowerCase();
  const hits = ids.filter((id) => matchesQuery(id, query));
  if (!needle) return hits;
  const rank = (id: string): number => {
    const data = puzzleDataMap[id];
    if (!data) return 4;
    const name = data.name.toLowerCase();
    const others = (data.aliases ?? []).map((a) => a.toLowerCase());
    if (name === needle) return 0;
    if (name.startsWith(needle)) return 1;
    if (others.includes(needle)) return 2;
    if (others.some((a) => a.startsWith(needle))) return 3;
    return 4;
  };
  return hits
    .map((id, order) => ({ id, order, rank: rank(id) }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .map(({ id }) => id);
}

/** The family chips the home screen offers beside `query`. Once something is
 * typed the search answers, a family's label included, and on a phone the chips
 * are four rows standing between the box and its results under the keyboard.
 * The pressed chip stays: it is still narrowing the list, and a narrowing with
 * no control on screen cannot be undone. */
export function familiesOffered(
  query: string,
  pressed: PuzzleFamily | null,
): readonly (typeof puzzleFamilies)[number][] {
  if (!query.trim()) return puzzleFamilies;
  return puzzleFamilies.filter(({ id }) => id === pressed);
}
