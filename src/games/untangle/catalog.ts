import type { PuzzleData } from "../../engine/catalog.ts";

export const entry: PuzzleData = {
  name: "Untangle",
  aliases: ["Planarity"],
  description: "Planar graph layout puzzle",
  objective: "Reposition the points so that the lines do not cross.",
  collection: "original",
  family: "rearranging",
  similar: "Planarity",
};
