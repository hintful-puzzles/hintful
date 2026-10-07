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

#### Scenario: A given segment is told by the cell under it

- **WHEN** a board with a given boat segment is drawn
- **THEN** that segment's square is the lifted surface
- **AND** a segment the player places is drawn on the water fill

#### Scenario: Undecided is surface and water is blue

- **WHEN** a board holds an undecided square beside one marked as water
- **THEN** the first is the cell surface and the second the water fill
