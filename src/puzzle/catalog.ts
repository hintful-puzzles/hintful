import {
  type PuzzleData,
  type PuzzleFamily,
  puzzleCatalog,
  puzzleFamilies,
  puzzleIds,
} from "./catalog-data.ts";

export type { PuzzleData, PuzzleFamily } from "./catalog-data.ts";
export { puzzleFamilies, puzzleIds } from "./catalog-data.ts";

export interface PuzzleDataMap {
  [id: string]: PuzzleData;
}

export const puzzleDataMap: Readonly<PuzzleDataMap> = puzzleCatalog;

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
