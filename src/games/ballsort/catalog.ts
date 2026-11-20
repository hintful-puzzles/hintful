import type { PuzzleData } from "../../engine/contract/catalog.ts";

export const entry: PuzzleData = {
  name: "Ball Sort",
  aliases: ["Water Sort", "Color Sort"],
  description: "Tube-sorting puzzle",
  objective: "Pour balls between tubes until each tube holds one color.",
  collection: "own",
  family: "moves",
  similar: "Water Sort, Color Sort",
};
