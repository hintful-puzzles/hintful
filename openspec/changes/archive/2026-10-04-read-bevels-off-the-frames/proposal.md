# read-bevels-off-the-frames

Found by `declare-bevel-pairs-in-the-game`.

## Why

A game says which of its colors dark mode exchanges (`paletteScheme.darkSwaps`),
and a bevel it forgets to list is lit from the other side in the dark scheme
with nothing failing. The check on declared pairs cannot see a pair nobody
declared.

Two games had forgotten one. Pegs drew its board's relief through
`drawRaisedBevel` with no swap, and was lit from the top-left in the light
scheme and from the bottom-right in the dark one. Crossing's placed digit, a
raised tile, was pressed in on a dark board. Neither had an entry in the table
the declaration replaced, so the palette comparison that carried that change
could not see them.

## What Changes

- `src/puzzle/bevel-order.test.ts` reads every game's sample frames for
  bevels, by shape: two polygons in a row that split one box along its
  diagonal. For each, the lighter of its two colors in the light scheme must be
  the lighter in the dark one. A game joins by drawing a bevel; there is no
  list.
- Pegs declares its swap. Its empty hole and its flash share the lowlight slot
  and take the swapped dark value with it, which reads as a hole.
- Crossing's placed digit gets its own pair of slots, `COL_TILE_HIGH` and
  `COL_TILE_LOW`, and swaps those. Its highlight and lowlight are also tints
  (the flash, the cursor's corners, a struck clue), whose dark values stay as
  they were.

## Declined: marking the colors where they are made

The first design had `mkhighlight` (or a second constructor beside it) mark its
highlight and lowlight as a bevel, with the midend deriving the swaps, so that
no pair is listed. Reading the games ruled it out:

- About twenty games take the same highlight and lowlight as tints, and Pegs
  and Crossing use one slot both ways. Whether a color is a bevel is a fact
  about how it is drawn, not about how it was made, so a mark on the value
  would be a second declaration that can be wrong in the same way.
- Slide and Twiddle derive further bevel colors from the trio (`raise`, the
  gentle pair), each of which would need its own mark by hand.
- With either constructor as the default, the wrong choice is silent in one
  direction. Read off the frames, a forgotten swap fails whichever way the
  colors were made.

## Not covered

A bevel that reaches the canvas in another shape: Slide's piece parts (held by
its own trio test in `dark-palette.test.ts`), Twiddle's trapezoids, Black Box's.
And a bevel only input brings out, since the frames are the deal and one frame
some hint steps in.

## Acceptance

Pegs and Crossing change in the dark scheme, and both were looked at in the
app. The guard was red for exactly those two games before the fixes.
