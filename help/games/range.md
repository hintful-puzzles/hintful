# Range

Shade some squares, so as to meet the following conditions. A shaded
square holds a {{pair:0}} square; every other square is clear.

- No two shaded squares are orthogonally adjacent.
- No group of clear squares is separated from the rest of the grid by
  shaded squares.
- Each numbered cell can see precisely that many clear squares in
  total by looking in all four orthogonal directions, counting itself.
  (Shaded squares block the view. So, for example, a 2 clue must be
  adjacent to three shaded squares or grid edges, and in the fourth
  direction there must be one clear square and then a shaded one beyond
  it.)

The numbered cells sit on a lighter square. They are always clear, and
cannot be changed.

## Controls

{{controls}}

A dot is your own note that a square is clear. Clicking again moves on
round the same three states: a left-click turns a {{pair:0}} square into
a dot and a dot back into an empty square, and a right-click turns a dot
{{pair:0}} and a {{pair:0}} square empty.

Hold Shift while moving the cursor to put a dot in every empty square
it passes over.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the numbers, your {{pair:0}} squares and your dots, so it
carries on from wherever you are, as long as none of those is wrong; if
one is, it asks you to fix the highlighted mistakes first. Its sentences
call a square a *cell*, and when one says a cell "must be clear" it
means you can mark it with a dot.

{{hint-marks}}

The ideas it teaches:

* **Shaded squares never touch**, so every cell beside a {{pair:0}}
  square is clear.
* **A clue that sees enough** stops at the first cell past what it sees,
  so that cell must be {{pair:0}}. Likewise, a cell that would let a clue
  see too far must be {{pair:0}}.
* **A clue that needs to see further** than its other directions allow
  must see along the rest of the way, so those cells are clear.
* **Clear stays connected.** A cell that would cut some of the clear
  cells around it off from the rest, if it were shaded, must stay clear.

## Range parameters

{{parameters}}
