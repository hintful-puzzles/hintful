# raise-the-hint-out-of-the-bar

**Status: done 2026-10-16, at the owner's word, in a playtest of the kept
hint room.**

## Why

Once a hint's room was kept under the board (`keep-the-board-still-under-a-hint`),
a one-line hint sat about 56px under a board at 1000x686: the board area's
24px padding, then the room's unused line. The owner (2026-10-16): "the margin
is still really big". A hint touching the board was rejected ("I don't like
how they touch the board, but have a large margin from the bar"); they asked
for the hint to be "an offshoot of the bar element, perhaps like a mechanism
emerging out of it, into the space between it and the board", with little
whitespace between it and the board, and for the same layout on a phone
("I want to avoid special-handling to the extent possible").

## What Changes

- The hint stands on the panel under it (the Bar, a phone's keypad panel, or
  the window's edge), with no rule between them, and rises out of it when it
  appears. Reduced motion turns the rise off.
- The hint fills the room kept for it, its words centered, so the room a short
  hint leaves is inside it and not a gap.
- The board stands at the foot of its area, just over the hint, and the height
  it does not use is left above it. The padding under the board is 12px (8px
  where the window is not wide).
- A deal still being looked for is said above the hint, never between it and
  the panel.

Measured 2026-10-16 on every hinted game's first hint: board to hint is 12px
at 1000x686 and 8px at 412x915, more only by a game's status line; the hint
covers the board in no game; the board moves in none but Untangle at
1000x686, whose first hint is longer than the room (the accepted case).

## Impact

- `app-shell`: the hint's place under the board. `src/screens/puzzle-screen.ts`
  only; no game changes.
