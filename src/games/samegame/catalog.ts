import type { PuzzleData } from "../../engine/catalog.ts";

export const entry: PuzzleData = {
  name: "Same Game",
  aliases: ["Chain Shot"],
  description: "Block-clearing puzzle",
  objective: "Clear the grid by removing touching groups of the same color squares.",
  collection: "original",
  family: "moves",
  similar: "Chain Shot, Clickomania, Mahki",
};
