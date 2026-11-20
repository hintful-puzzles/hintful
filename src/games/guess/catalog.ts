import type { PuzzleData } from "../../engine/contract/catalog.ts";

export const entry: PuzzleData = {
  name: "Guess",
  aliases: ["Mastermind", "Bulls and Cows"],
  description: "Combination-guessing puzzle",
  objective: "Guess the hidden combination of colors.",
  collection: "original",
  family: "hidden",
  similar: "Mastermind®",
};
