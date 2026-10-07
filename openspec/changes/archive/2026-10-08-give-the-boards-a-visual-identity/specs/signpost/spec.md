## ADDED Requirements

### Requirement: Signpost draws its squares on the collection's quiet surface

`redraw` SHALL draw a square that is in no chain on the collection's cell
surface, and a square whose number the puzzle fixed on the lifted surface of a
given, so a given is told by the cell under it as well as by its number's
color. Every other square SHALL keep its chain's region color, which is the
game. The surface's thin grid line SHALL run between squares, so two squares of
one chain are still two squares, and the frame round the grid SHALL be no
heavier than it.

A given SHALL keep its lifted surface while a drag dims the rest of the board.
A given's number SHALL be drawn at full strength whether or not the square is
linked on both sides, and at its middle strength only while a drag dims it,
since the faint strengths are made for a region's fill and do not clear the
lifted surface in the dark scheme.

#### Scenario: Three kinds of square

- **WHEN** a board holds a square in no chain, a given and a square the player
  has linked into a lettered chain
- **THEN** the first is the plain cell surface, the second the lifted surface
  and the third its chain's region color

#### Scenario: A linked given stays readable

- **WHEN** a given is linked to its successor and has no predecessor to find
- **THEN** its number is drawn in the full fixed-number color on the lifted
  surface
