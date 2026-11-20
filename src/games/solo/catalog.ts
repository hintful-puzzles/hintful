import type { PuzzleData } from "../../engine/contract/catalog.ts";

export const entry: PuzzleData = {
  name: "Solo",
  aliases: ["Sudoku", "Number Place"],
  description: "Number placement puzzle",
  objective: "Fill the grid so every row, column and block has one of each digit.",
  collection: "original",
  family: "latin",
  similar:
    "Sudoku, Diagonal (X) Sudoku, Hexdoku, Jigsaw Sudoku, Killer Sudoku, Mega Sudoku",
};
