import type { PuzzleData } from "../../engine/contract/catalog.ts";

export const entry: PuzzleData = {
  name: "Pearl",
  aliases: ["Masyu"],
  description: "Loop-drawing puzzle",
  objective:
    "Draw a single closed loop, given clues about corner and straight squares.",
  collection: "original",
  family: "lines",
  similar: "Masyu",
};
