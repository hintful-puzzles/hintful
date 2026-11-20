import type { PuzzleData } from "../../engine/contract/catalog.ts";

export const entry: PuzzleData = {
  name: "Map",
  description: "Map-coloring puzzle",
  objective: "Color the map so that adjacent regions are never the same color.",
  collection: "original",
  family: "regions",
};
