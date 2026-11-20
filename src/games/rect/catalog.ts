import type { PuzzleData } from "../../engine/contract/catalog.ts";

export const entry: PuzzleData = {
  name: "Rectangles",
  aliases: ["Shikaku", "Patches"],
  description: "Rectangles puzzle",
  objective:
    "Divide the grid into rectangles, each holding one clue and the size or shape it asks for.",
  collection: "original",
  family: "regions",
  similar: "Shikaku, Patches",
};
