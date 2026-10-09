# open-the-switcher-from-the-name

Owner, 2026-10-08: *"Please bring back the game selection feature of clicking
on the game's name at the top left - I think it should be the same as the
menu's Switch Puzzle option."*

## Why

The three-panel puzzle screen made the row above the board readouts only, and
the game's name a plain heading. Switching puzzle then took the Menu and its
`Switch puzzle…` row, or `Ctrl/Cmd+K`, which a phone does not have. The name
is where a player looks to see which puzzle this is, and it is the obvious
thing to press to get another.

## What Changes

- **The game's name is a button** inside the page's `h1`, with a small
  chevron, and it opens the quick-switch: the same dialog and the same
  handler as the Menu's row. The Menu's row and the shortcut stay.

Nothing a player has saved or shared changes.

## Capabilities

### Modified Capabilities

- `app-shell`: the readout row holds a way to another puzzle.

## Acceptance

The owner's, who asked for it by name.
