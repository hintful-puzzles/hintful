## ADDED Requirements

### Requirement: Boats draws its squares on the collection's quiet surface

`redraw` SHALL draw an undecided square as the collection's cell surface, with
the collection's surface grid line between squares and round the grid. A square
the player has decided, water or segment, and a water square the puzzle gave
SHALL keep the water fill, and given water SHALL keep its waves. A boat segment
the puzzle gave SHALL sit on the collection's lifted surface of a given, so it
is told from a segment the player placed by the cell under it. The waves and
the edge of a collision diamond SHALL be drawn in ink, not in the grid's color.
The help page SHALL say that a given segment sits on a lighter square.

A boat segment SHALL be drawn in the collection's color for a placed piece, the
theme pair's first member, whether the player placed it or the puzzle gave it,
and a boat still to be found in the fleet tally SHALL be drawn in that same
color. The keyboard cursor SHALL be a ring in the collection's cursor color at
the square's edge, outside a segment's outline.

#### Scenario: A given segment is told by the cell under it

- **WHEN** a board with a given boat segment is drawn
- **THEN** that segment's square is the lifted surface
- **AND** a segment the player places is drawn on the water fill

#### Scenario: The tally shows the piece on the board

- **WHEN** a board is drawn with a boat placed and a boat still to be found
- **THEN** the placed segment and the unfound boat in the fleet tally are
  filled with the same color

#### Scenario: Undecided is surface and water is blue

- **WHEN** a board holds an undecided square beside one marked as water
- **THEN** the first is the cell surface and the second the water fill
