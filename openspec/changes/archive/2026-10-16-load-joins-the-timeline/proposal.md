# load-joins-the-timeline

## Why

The owner (2026-10-16): Back to last save, shown as Load on the Bar, is
pressed far less often than Undo, Redo, Hint and Check & save beside it, so
it does not earn a Bar slot. It belongs beside the move number in the Menu,
whose timeline also takes the board back to an earlier position.

## What Changes

- **Back to last save leaves the Bar** and is the Menu's row after the move
  number, in the Board group, in every game.
- **The Bar's commands are Undo, Redo, Hint and Check & save**, and Undo, Redo
  and Check & save in a game with no hint. Its short caption, "Load", goes,
  and with it the one use of a separate Bar caption (`barLabel`).

## Impact

- `app-shell`: "The Bar and the Menu are one ordered list, cut once".
- `src/puzzle/command-list.ts`, `src/puzzle/components/bar.ts`,
  `help/features.md`.
