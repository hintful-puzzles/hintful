## MODIFIED Requirements

### Requirement: Flip rendering, timing, and text format

Flip SHALL render the grid, per-cell toggle diagram and keyboard
cursor through `GameDrawing`, with a
flip animation on a move and a win flash on completion, and
SHALL provide a statusbar string reporting move count and
completed/auto-solved state, and a plain-text format of the board.
Colors SHALL be derived from the supplied default background.

`redraw` SHALL draw the board as pieces on a quiet surface. A square's two
states SHALL be the two members of the collection's two-state pair: an unlit
square holds the first member and a lit square the second, each drawn in that
member's color and shape, inset on its square, so a finished board is every
square holding the second member. No state SHALL be a step of gray. The toggle
diagram SHALL be drawn on the piece, in a color pinned against that piece so
that it reads in both schemes. The keyboard cursor and a hint's marks SHALL sit
at the square's edge, beside the piece.

A move SHALL animate each square it flips as the old piece shrinking away and
the new one growing in its place, never both at once. The win flash SHALL be a
ring of squares showing the first member, moving outward from the middle of
the board.

The game SHALL name no hue of its own for either state: its hint sentences and
hint-mark legends SHALL say "lit" and "unlit", and its help page SHALL name the
two pieces by placeholder and by shape.

#### Scenario: Flip renders and animates through the engine

- **WHEN** Flip is played through the app
- **THEN** moves animate, completion flashes, the statusbar shows the
  move count and completion wording, and the palette is derived from
  the host background
- **AND** the board has a correct plain-text representation

#### Scenario: A lit square is told from an unlit one by its piece

- **WHEN** a board with lit and unlit squares is drawn, in either scheme
- **THEN** every unlit square holds the pair's first piece and every lit square
  the second, on the same surface
- **AND** the diagram on each piece is drawn in a pinned color that the piece
  is not
