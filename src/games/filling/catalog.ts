import type { PuzzleData } from "../../engine/contract/catalog.ts";

export const entry: PuzzleData = {
  name: "Filling",
  aliases: ["Fillomino"],
  description: "Polyomino puzzle",
  objective: "Mark every square with the area of its containing region.",
  collection: "original",
  family: "regions",
  similar: "Fillomino",
};
