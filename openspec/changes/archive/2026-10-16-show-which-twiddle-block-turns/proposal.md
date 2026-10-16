# show-which-twiddle-block-turns

**Filed 2026-10-16 at the owner's word**: "it's really unclear which block would
be turned when clicking on a particular square". A survey of the controls
(measured with the app open, 2026-10-16) found worse than unclear: most of the
board did nothing.

## Why

A click turned the block whose center it was nearest, but only within a tile
of that center, as upstream does. The share of the board where a click did
nothing:

- 3×3 with 2×2 blocks: 56%, though every square had some quarter that turned
  something;
- 4×4 with 3×3 blocks: 75%, and 12 of its 16 squares never turned anything;
- 5×5 with 3×3 blocks: 64%, and 16 of 25 squares never did;
- 6×6 with 4×4 blocks: 75%, and 20 of 36 squares never did.

Nothing on the board showed where the targets were. The keyboard cursor was a
hairline along the tile bevels, hard to see, and the help said to "click in the
center of a square" for 3×3 blocks without saying that most squares do
nothing.

## What changes

The owner chose all four of the survey's options:

- **Every square answers.** A click anywhere on a square turns the block, among
  those holding that square, whose center is nearest the click. A click off
  the squares does nothing. This changes what a click does: clicks that did
  nothing now turn a block.
- **The mouse shows the block before it turns it.** While the pointer is over
  the board, the block a click would turn is outlined (`Game.hover`; mouse
  only, so nothing depends on it).
- **The keyboard cursor is a band.** It is drawn the way the hint's ring is, in
  the cursor color, and the hover outline uses the same look.
- **A dot marks every block's center.** It sits on the grid corner for a block
  of even side, and below the number of the middle square for one of odd side.
  This is the one cue touch has before a turn.

The hint's gesture is unchanged: it clicks a block at its center, which
still turns that block.

## Impact

- `src/games/twiddle/index.ts`: `blockAt`, the geometry's `pointerTarget`,
  `hover`.
- `src/games/twiddle/render.ts`: the cursor and hover bands, the pivot dots
  (`COL_PIVOT`).
- `src/games/twiddle/state.ts`: `TwiddleUi.hoverBlock`.
- `help/games/twiddle.md` § Controls.
