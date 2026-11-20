import { type PuzzleFamily, puzzleFamilies } from "../engine/contract/catalog.ts";
import { type CatalogModule, catalogFrom } from "./catalog-data.ts";

export type { PuzzleData, PuzzleFamily } from "../engine/contract/catalog.ts";
export { puzzleFamilies };

/** Every game's catalog entry, by id, in id order. */
export const puzzleDataMap = catalogFrom(
  import.meta.glob<CatalogModule>("../games/*/catalog.ts", { eager: true }),
);

/** Catalog ids, sorted — the display order the home screen and menus use. */
export const puzzleIds: readonly string[] = Object.keys(puzzleDataMap);

/** A family's player-facing name. */
export function familyLabel(family: PuzzleFamily): string {
  const entry = puzzleFamilies.find(({ id }) => id === family);
  if (!entry) throw new Error(`Unknown puzzle family ${family}`);
  return entry.label;
}

/**
 * The puzzles in `family`, in catalog order. This is the query to write
 * wherever a family is the population — a corpus, an audit, a campaign — so
 * that it stays true as games join, where a list typed out would not.
 */
export function puzzlesInFamily(family: PuzzleFamily): readonly string[] {
  return puzzleIds.filter((puzzleId) => puzzleDataMap[puzzleId]?.family === family);
}
