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
