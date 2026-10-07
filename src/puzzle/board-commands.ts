/**
 * The commands the chrome draws unavailable until the page has its first
 * board: each acts on the board in play, and there is none yet.
 *
 * What the control shows, and nothing more. A command run early all the same
 * (a key has no disabled state) waits for the board in `Puzzle.board`, so a
 * command missing from here is a control that looks live a moment early, never
 * a command the engine is asked before it can answer.
 */
const BOARD_COMMANDS: ReadonlySet<string> = new Set([
  "check-and-save",
  "check-only",
  "copy-image",
  "hint",
  "mark-all",
  "restart-game",
  "save-game",
  "share",
  "solve",
  "toggle-auto-hint",
]);

/** Whether `command`'s control is unavailable because no board has arrived. */
export function awaitsFirstBoard(
  command: string,
  puzzle: { readonly hasBoard: boolean } | null,
): boolean {
  return puzzle?.hasBoard !== true && BOARD_COMMANDS.has(command);
}
