## ADDED Requirements

### Requirement: Pearl draws its loop on the collection's quiet surface

`redraw` SHALL draw every square as the collection's cell surface. In the
traditional appearance the line between squares and the frame round the grid
SHALL be the collection's surface grid line, one line wide; in the loopy
appearance the center dots and the lines between them SHALL be that same
color. A black pearl and a white pearl SHALL be drawn in a black and a white
that are the same in both schemes. The loop the player draws SHALL be drawn in
ink, which inverts with the scheme, so it stands off the surface in both; a
white pearl on it is parted from it by the pearl's black outline. A black
pearl SHALL carry a rim in ink, so it stands off the surface in the dark
scheme. The keyboard
cursor SHALL be brackets at the corners of its square, which the loop never
crosses, and SHALL NOT fill the square.

#### Scenario: The loop reads in the dark scheme

- **WHEN** a loop segment is drawn in the dark scheme
- **THEN** it is drawn in ink, the scheme's maximum contrast against the
  surface, and a black pearl on it stays black

#### Scenario: A black pearl reads on a fresh dark board

- **WHEN** a black pearl with no line through it is drawn in the dark scheme
- **THEN** its fill is black and its rim is ink, a light ring round it

#### Scenario: The cursor leaves the square's surface alone

- **WHEN** the keyboard cursor rests on a square
- **THEN** the square is the cell surface, with brackets at its corners
