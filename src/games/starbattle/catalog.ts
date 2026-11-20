import type { PuzzleData } from "../../engine/catalog.ts";

export const entry: PuzzleData = {
  name: "Star Battle",
  aliases: ["Queens", "Two Not Touch"],
  description: "Star placement puzzle",
  objective:
    "Place stars so that every row, column and region holds the same number and no two touch.",
  collection: "own",
  family: "objects",
  similar: "Queens, Two Not Touch",
};
