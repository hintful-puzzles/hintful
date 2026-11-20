import type { PuzzleData } from "../../engine/catalog.ts";

export const entry: PuzzleData = {
  name: "Loopy",
  aliases: ["Slitherlink"],
  description: "Loop-drawing puzzle",
  objective: "Draw a single closed loop, given clues about number of adjacent edges.",
  collection: "original",
  family: "lines",
  similar: "Slitherlink",
};
