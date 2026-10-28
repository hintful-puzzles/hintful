# Proposal

## Why

The owner (2026-10-28), playtesting Keen with a mouse: clicks stopped
selecting a cell for a number and only selected it for marks, and toggling
**Marks** on and off did not bring normal selection back. It was working as
designed, and still confused them: *"We can still see about making it better
usability-wise, but it is working as designed."*

Pencil mode is one flag, `ui.pencilMode` (`src/engine/note-taking-cell.ts`),
and four things flip it: the Marks key (`PENCIL_MODE_BUTTON`), a right
press when sticky pencil mode is on (`pencilSticky`, on by default in Keen;
a two-finger trackpad click is one), the `p` shortcut
(`src/puzzle/shortcuts.ts`), and the bar's Right-click mode. The Marks key
(`src/puzzle/components/keys.ts`) is a plain button with no pressed state,
so nothing on screen says the mode is on until a cell is selected, and a
player who presses Marks "on and off" after a right-click leaves it on.
Reproduced 2026-10-28 at `f3257d36`: right-click a cell, press Marks twice,
left-click another cell, and it is selected for marks.

## What Changes

- The Marks key shows pencil mode as on or off, read from the game's state
  whichever of the four switched it, so one look tells the player and one
  press always takes them back. Its look and its wording (pressed, a lit
  icon, "Marks on") are the owner's to see, in both schemes and at phone
  width.
- The engine owns it for every game whose keypad has `pencilModeKey`: the
  key reads the mode through the game's `Ui`, not a copy the frontend keeps.

## Impact

`src/puzzle/components/keys.ts` and what feeds it its keys
(`game-controls.ts`), a way for the frontend to read a game's pencil mode,
the note-taking games' help sentence on sticky pencil mode
(`STICKY_PENCIL_HELP`), and `engine-notes`.
