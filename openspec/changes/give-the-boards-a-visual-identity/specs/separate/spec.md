## ADDED Requirements

### Requirement: Separate draws its cells on the collection's quiet surface

`redraw` SHALL draw every cell's body on the collection's cell surface, with
its letter in ink. Every cell holds a letter the puzzle fixed and the player
enters none, so no cell is lifted as a given: the surface is one tone and the
edges carry the board. The edges keep their own roles and strengths: a wall in
ink, an edge ruled out and an edge undecided each in its own color.

A completed correct region SHALL shade in the shared completed-region color
derived from the cell surface. The solved flash SHALL lift every cell to the
given's surface on its lit beats, a step that reads in both schemes.

#### Scenario: Every cell is the same surface

- **WHEN** an untouched board is drawn
- **THEN** every cell's body is the plain cell surface

#### Scenario: The flash lifts the cells

- **WHEN** the solved flash is on a lit beat
- **THEN** every cell's body is the lifted surface
