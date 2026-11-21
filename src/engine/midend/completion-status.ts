/**
 * The words a status bar opens with once the board is finished, or once the
 * solver has been used on it.
 *
 * They say two facts that are the same in every game, so every game's status
 * bar says them in the same words.
 *
 * **Four states, not three.** A game whose "solved" is recomputed on each move
 * lets a player use Solve and then move off the solution, and its status bar
 * then says the solver was used rather than that the board is solved. Some
 * games said "Auto-solved." there too, which was false.
 */

export const COMPLETED = "COMPLETED!";
export const AUTO_SOLVED = "Auto-solved.";
export const AUTO_SOLVER_USED = "Auto-solver used.";

/**
 * The status bar's opening words, then `rest` after a space: just `rest` on a
 * board that is neither finished nor helped, and just the words when `rest` is
 * empty.
 *
 * The two facts are passed as booleans because games store "finished" as a
 * flag, a move count or a counter of clues left, and only the game knows which.
 */
export function completionStatus(
  completed: boolean,
  cheated: boolean,
  rest = "",
): string {
  const words = completed
    ? cheated
      ? AUTO_SOLVED
      : COMPLETED
    : cheated
      ? AUTO_SOLVER_USED
      : "";
  if (words === "") return rest;
  return rest === "" ? words : `${words} ${rest}`;
}
