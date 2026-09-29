# Range

Color some squares black, so as to meet the following conditions:

- No two black squares are orthogonally adjacent.
- No group of white squares is separated from the rest of the grid by
  black squares.
- Each numbered cell can see precisely that many white squares in
  total by looking in all four orthogonal directions, counting itself.
  (Black squares block the view. So, for example, a 2 clue must be
  adjacent to three black squares or grid edges, and in the fourth
  direction there must be one white square and then a black one beyond
  it.)

## Controls

{{controls}}

Clicking again moves on round the same three states: a left-click
turns a black square into a dot and a dot back into an empty square,
and a right-click turns a dot black and a black square empty.

Hold Shift while moving the cursor to put a dot in every empty square
it passes over.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the numbers, your black squares and your dots, so it carries
on from wherever you are, as long as none of those is wrong; if one is,
it asks you to fix the highlighted mistakes first. Its sentences call a
square a *cell*, and when one says a cell "must be white" it means
you can mark it with a dot.

{{hint-marks}}

The ideas it teaches:

* **Black squares never touch**, so every cell beside a black square is
  white.
* **A clue that sees enough** stops at the first cell past what it sees,
  so that cell must be black. Likewise, a cell that would let a clue see
  too far must be black.
* **A clue that needs to see further** than its other directions allow
  must see along the rest of the way, so those cells are white.
* **White stays connected.** A cell whose blackening would cut some of
  the white cells around it off from the rest must stay white.

## Range parameters

{{parameters}}
