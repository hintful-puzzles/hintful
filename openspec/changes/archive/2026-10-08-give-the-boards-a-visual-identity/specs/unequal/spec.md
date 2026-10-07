## ADDED Requirements

### Requirement: Unequal draws its boxes as quiet surfaces, with a given's lifted

`redraw` SHALL draw each cell as its own box, apart from its neighbors, on the
collection's cell surface, and a box holding a given number on the collection's
lifted surface of a given, so that a given is told by the box under it as well
as by its ink. A box's outline SHALL be the collection's surface grid line. The
signs and bars between boxes are clues and SHALL keep their own colors, drawn
on the board between the boxes.

The selection's wash and its pencil-mode corner SHALL be drawn over whichever
surface the box has. The hint's marks SHALL stay in the gap beside the box.

#### Scenario: A given is told by the box under it

- **WHEN** a board with given numbers is drawn
- **THEN** each given's box is the lifted surface
- **AND** every other box is the cell surface, outlined in the surface grid line
