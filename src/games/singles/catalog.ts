import type { PuzzleData } from "../../engine/contract/catalog.ts";

export const entry: PuzzleData = {
  name: "Singles",
  aliases: ["Hitori"],
  description: "Number-removing puzzle",
  objective: "Shade the right set of duplicate numbers.",
  collection: "original",
  family: "shading",
  similar: "Hitori (一人)",
};
