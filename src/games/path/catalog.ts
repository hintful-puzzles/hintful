import type { PuzzleData } from "../../engine/contract/catalog.ts";

export const entry: PuzzleData = {
  name: "Path",
  aliases: ["Zip", "Numberlink", "Arukone", "Flow"],
  description: "Path-joining puzzle",
  objective:
    "Draw one line through the numbers in order, or join each pair of like numbers, so that the lines fill the grid and never cross.",
  collection: "own",
  family: "lines",
  similar: "Zip, Numberlink, Arukone, Flow Free®",
};
