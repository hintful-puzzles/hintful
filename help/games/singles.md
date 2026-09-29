# Singles

Black out some of the squares, in such a way that:

- no number appears twice in any row or column
- no two black squares are adjacent
- the white squares form a single connected group (connections
  along diagonals do not count).

## Controls

Click in a square to black it out, and again to uncover it.
Right-click in a square to mark it with a circle, indicating that
you're sure it should *not* be blacked out.

With the keyboard, the arrow keys move a cursor around the grid. Press
Enter to black out the square under it, or Space to circle it; either key
clears a square that is already blacked out or circled.

A blacked-out square hides its number. Clicking outside the grid shows
the numbers on the black squares, and clicking there again hides them;
it is the same setting as the **Show numbers on black squares**
preference.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the numbers and your own black squares and circles, so it
carries on from wherever you are, as long as none of those is wrong; if
one is, it asks you to fix the highlighted mistakes first.

In its words, a *black* square is one you have blacked out, and a
*white* square is one that stays uncovered. When a step says a square
must be white, record that with a circle (right-click); when it must be
black, click it.

{{hint-marks}}

A few patterns are worth learning by name:

* **A sandwich.** Two equal numbers with one square between them: one of
  the two must be black, so the square between them must be white.
* **A touching pair.** Two equal numbers side by side: one of them stays
  white, so every other copy of that number in their row or column must
  be black.
* **Pairs in neighboring lines.** A pair of equal numbers in one row and
  another pair in the next, lined up so that blacking out either of two
  squares would force two black squares side by side. Both must be white.
* **Corners.** Where matching numbers crowd a corner of the grid, some
  ways of blacking them out would leave the corner square with no white
  neighbor, so those are ruled out.
* **Keeping the white squares joined.** A square that would cut the
  white squares in two if black, or seal a white square off, must be
  white.

## Singles parameters

{{parameters}}
