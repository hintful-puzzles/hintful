import { showAlert } from "../dialogs/alert-dialog.ts";
import type { Puzzle } from "./puzzle.ts";

/**
 * Deal a new board, and say so where the generator found none. Every control
 * that deals goes through here, so a type whose boards are rare or absent
 * answers in one voice wherever it was asked for. Resolves to whether a board
 * was dealt. A deal the player stopped says nothing: they know.
 */
export async function dealNewGame(puzzle: Puzzle): Promise<boolean> {
  const outcome = await puzzle.newGame();
  if (outcome === "dealt") return true;
  if (outcome === "stopped") return false;
  await showAlert({
    label: "No puzzle dealt",
    message: outcome.refusal,
    type: "warning",
    lightDismiss: true,
  });
  return false;
}
