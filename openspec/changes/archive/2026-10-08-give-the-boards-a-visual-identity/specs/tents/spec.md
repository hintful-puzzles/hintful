## ADDED Requirements

### Requirement: Tents draws its squares on the collection's quiet surface

`redraw` SHALL draw a square the player has not decided as the collection's
cell surface, with the collection's surface grid line between squares and
round the grid. A square that is grass, a tree or a tent SHALL keep its grass
fill, so an undecided square and a grass one differ in hue and not by a step of
gray, in both schemes. The trees and the tents keep their shapes and colors.
The clues, a link between a tent and its tree, the keyboard cursor and the
edge of an error diamond SHALL be drawn in ink, not in the grid's color.

#### Scenario: Undecided and grass are told apart by hue

- **WHEN** a board holds an undecided square beside one marked as grass
- **THEN** the first is the cell surface and the second the grass fill

#### Scenario: A link is ink on a quiet grid

- **WHEN** a tent is linked to its tree
- **THEN** the link is drawn in ink
- **AND** the grid line it crosses is the surface's grid line
