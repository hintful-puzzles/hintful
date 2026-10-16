# keep-the-board-still-under-a-hint

## Why

The owner, playing Target (2026-10-16): showing a hint shrank the board, and
clearing it grew the board back. The words under the board took their height
from the board's row each time a hint appeared.

## What Changes

- **In a game with a hint, the hint's room is kept under the board** whether
  or not a hint is showing: the height of a hint box of two lines in a wide
  window and three in any other. Showing or clearing a hint then leaves the
  board as it was.
- **A longer hint grows past the room** rather than being cut off; the board
  gives up only what it needs beyond the room.
- A game with no hint keeps no room.

## What it was measured against (2026-10-16)

The first hint of every game with a hint, on its first preset, at 1280×720:
35 took one line (40 px), 18 two (57 to 61 px), and Sticks and Towers a
journey label over two lines (79 px). With two lines kept, 53 of the 55 move
nothing, and those two take 15 and 18 px from the board. Keeping a third
line would take about 20 px from every board, all the time, for those two.
At 390×844 the board is limited by the width, so none of the six games
measured there moved, Palisade's four-line hint included.

## Impact

- `app-shell`: "A hint's words sit under the board".
- `src/screens/puzzle-screen.ts`.
