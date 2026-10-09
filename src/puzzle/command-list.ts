/**
 * **Every command the Bar and the Menu offer, as one ordered list, cut once.**
 *
 * The Bar shows the list's leading entries and the Menu holds the rest, so the
 * Menu is a *suffix* of the list and never a selection from it: a player who
 * sees where the Bar stops knows where the Menu starts. That is why the Bar's
 * entries come first, and why both panels read this module and neither keeps a
 * list of its own: order and wording cannot drift between them.
 *
 * Nothing here depends on the game in play beyond whether it can hint, solve
 * or be checked. What a game brings of its own is in the Game controls panel
 * (`components/game-controls.ts`).
 */
import { savedGames } from "../store/saved-games.ts";
import type { Puzzle } from "./puzzle.ts";
import { justSaved } from "./quick-save-actions.ts";

/** The Menu's groups, in order. `bar` is the unlabeled run that leads the list:
 * the entries the Bar shows while it has room for them. */
export type CommandGroup = "bar" | "help" | "board" | "files" | "app";

export const GROUP_LABEL: Readonly<Record<CommandGroup, string | null>> = {
  bar: null,
  help: "Help",
  board: "Board",
  files: "Share & files",
  app: "App",
};

export interface CommandEntry {
  /**
   * `command` runs the `commandMap` key in `id`. The other two are in the list
   * because they have a place in its order, and are not commands: the help
   * page is a link, and the timeline is a menu of its own.
   */
  readonly kind: "command" | "help-link" | "timeline";
  readonly id: string;
  readonly group: CommandGroup;
  readonly icon: string;
  readonly label: string;
  /** The caption on the Bar, where it must be shorter than the Menu's row. */
  readonly barLabel?: string;
  /** The caption this one stands in for, for a moment. The Bar's slot keeps
   * that caption's room meanwhile, so the swap moves no neighbor. */
  readonly standsInFor?: string;
  /** Unavailable for now (nothing to undo). A command the game cannot run at
   * all is not in the list: "present and grayed out" teaches a player that the
   * app is broken for this puzzle. */
  readonly disabled?: boolean;
  /** Drawn quieter than its neighbors: a terminal or rarely wanted action. */
  readonly quiet?: boolean;
}

/** What the list reads off the puzzle. A `Pick`, so a test can stand one in. */
export type CommandPuzzle = Pick<
  Puzzle,
  | "puzzleId"
  | "canUndo"
  | "canRedo"
  | "canHint"
  | "canSolve"
  | "canCheck"
  | "isSolved"
  | "hintPending"
  | "hintArmedToApply"
  | "autoHintActive"
>;

const CHECK_AND_SAVE = "Check & save";

/** The Bar never shows fewer than this many of the list's leading entries. */
export const MIN_BAR_LENGTH = 4;

export function commandList(puzzle: CommandPuzzle, gameName: string): CommandEntry[] {
  const solved = puzzle.isSolved;
  const command = (
    group: CommandGroup,
    id: string,
    icon: string,
    label: string,
    more: Partial<CommandEntry> = {},
  ): CommandEntry => ({ kind: "command", id, group, icon, label, ...more });
  const when = (present: boolean, entry: CommandEntry) => (present ? [entry] : []);

  return [
    command("bar", "undo", "undo", "Undo", { disabled: !puzzle.canUndo }),
    command("bar", "redo", "redo", "Redo", { disabled: !puzzle.canRedo }),
    ...when(
      puzzle.canHint,
      // The hint has two beats, show then play, and the label says which one
      // the next press is; while a press is still being answered it says the
      // button is working, not dead.
      command(
        "bar",
        "hint",
        "hint",
        puzzle.hintPending
          ? "Thinking…"
          : puzzle.hintArmedToApply
            ? "Apply the hint"
            : "Hint",
        { disabled: solved },
      ),
    ),
    justSaved(puzzle.puzzleId)
      ? command("bar", "check-and-save", "success", "Saved", {
          standsInFor: CHECK_AND_SAVE,
        })
      : command("bar", "check-and-save", "check-and-save", CHECK_AND_SAVE),
    command("bar", "quick-load", "back-to-last-save", "Back to last save", {
      barLabel: "Load",
      disabled: !savedGames.hasQuickSave(puzzle.puzzleId),
    }),

    {
      kind: "help-link",
      id: "help",
      group: "help",
      icon: "help",
      label: `How to play ${gameName}`,
    },
    ...when(
      puzzle.canHint,
      // One button whose label and icon say what pressing it will do. Not a
      // switch: this is something running right now that a player will want
      // to stop, not a setting left in a position.
      puzzle.autoHintActive
        ? command("help", "toggle-auto-hint", "stop", "Stop auto-solving")
        : command("help", "toggle-auto-hint", "play", "Auto-solve for me", {
            disabled: solved,
          }),
    ),
    ...when(
      puzzle.canSolve,
      command("help", "solve", "show-solution", "Show solution…", {
        quiet: true,
        disabled: solved,
      }),
    ),

    { kind: "timeline", id: "timeline", group: "board", icon: "history", label: "" },
    command("board", "restart-game", "restart-game", "Start over"),
    // Beside Start over and not on the Bar: the two commands that put a
    // board away are together, and neither is pressed often enough to hold a
    // slot a thumb passes over.
    command("board", "new-game", "new-game", "New game"),
    ...when(
      puzzle.canCheck,
      command("board", "check-only", "check-only", "Check without saving", {
        quiet: true,
      }),
    ),

    command("files", "share", "share", "Share"),
    command("files", "enter-gameid", "gameid", "Open a shared game"),
    ...when(
      // clipboard.write is Baseline 2024 (Firefox 6/2024; others ~2020)
      typeof navigator.clipboard?.write === "function",
      command("files", "copy-image", "copy-image", "Copy image"),
    ),
    command("files", "save-game", "save-game", "Save as…"),
    command("files", "load-game", "load-game", "Open saved…"),

    command("app", "switch-puzzle", "switch-puzzle", "Switch puzzle…"),
    command("app", "settings", "settings", "Preferences"),
    command("app", "about", "info", "About"),
  ];
}

/** How many of `list`'s entries the Bar may show at most: its leading run. */
export function barCapacity(list: readonly CommandEntry[]): number {
  const end = list.findIndex((entry) => entry.group !== "bar");
  return end === -1 ? list.length : end;
}

/**
 * Cut `list` at the Bar's length: the Bar's entries, and the Menu's, which are
 * every entry that follows. `barLength` is held between {@link MIN_BAR_LENGTH}
 * and the leading run's length.
 */
export function cutCommandList(
  list: readonly CommandEntry[],
  barLength: number,
): { bar: CommandEntry[]; menu: CommandEntry[] } {
  const capacity = barCapacity(list);
  const length = Math.min(capacity, Math.max(MIN_BAR_LENGTH, barLength));
  return { bar: list.slice(0, length), menu: list.slice(length) };
}

/**
 * How many leading entries a Bar of `extent` shows: as many as fit beside the
 * `Menu` button and the button toggle, by the slot sizes its stylesheet lays out (`components/bar.ts`).
 * Along the bottom `extent` is its width and the hint's slot is double; down a
 * side it is its height and every slot is one tile.
 */
export function barLengthThatFits(
  list: readonly CommandEntry[],
  extent: number,
  rem: number,
  along: "bottom" | "side",
  buttonToggle: boolean,
): number {
  const capacity = barCapacity(list);
  // The slots that are not entries: the `Menu` button, and the button toggle
  // where the Bar shows one. Each has a rule beside it.
  const fixed = buttonToggle ? 2 : 1;
  const needs = (length: number): number => {
    // The last term of each is the Bar's padding and the rules.
    if (along === "side") {
      return (length + fixed) * 3.375 * rem + (0.5 + fixed * 0.125) * rem;
    }
    const hint = list.slice(0, length).some((entry) => entry.id === "hint") ? 1 : 0;
    const slots = length + fixed + hint;
    return slots * 4.25 * rem + length * 0.25 * rem + (0.5 + fixed * 0.75) * rem;
  };
  let length = Math.min(MIN_BAR_LENGTH, capacity);
  while (length < capacity && needs(length + 1) <= extent) length++;
  return length;
}
