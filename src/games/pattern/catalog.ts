import type { PuzzleData } from "../../engine/contract/catalog.ts";

export const entry: PuzzleData = {
  name: "Pattern",
  aliases: ["Nonogram", "Picross", "Griddlers", "Paint by Numbers"],
  description: "Pattern puzzle",
  objective:
    "Fill in the pattern in the grid, given only the lengths of runs of black squares.",
  collection: "original",
  family: "shading",
  similar: "Nonograms, Picross®",
};
