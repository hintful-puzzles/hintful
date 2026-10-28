## ADDED Requirements

### Requirement: A ring is round, crosses no number, and only the engine draws one

Every mark in the ring role SHALL be round, as round as the element's content
allows and never rounder than a corner radius of a third of its short side
less, and SHALL NOT cross any text: not the element's own, notes included,
and not a neighbor's. A ring on a cell SHALL be centered on it. The engine
SHALL draw it, and a game SHALL have no way to draw in the ring's ink but the
engine's ring, so "ringed" names a round mark in every game.

#### Scenario: A ring clears the content

- **WHEN** a step rings a cell holding a digit or pencil notes
- **THEN** no stroke of the ring, nor its edge, crosses the cell's text, nor
  the text of a neighbor it reaches past the cell into
- **AND** a cell with nothing at its corners is ringed by a circle

#### Scenario: A placement rings the whole cell, round its notes

- **WHEN** a step places a value in a cell that shows notes and a cage clue
- **THEN** the cell's ring is centered on the cell and goes round every one
  of its notes and its clue, crossing none of them

#### Scenario: A cell's text leaves a ring room

- **WHEN** a cell shows notes, whether or not the step rings it
- **THEN** its notes and its clue lie inside the box a ring centered on the
  cell leaves, in every frame, so a hint does not move them
- **AND** a cell with a clue shows its notes at the size and on the rows of a
  cell without one

## REMOVED Requirements

### Requirement: A ring is round, and only the engine draws one

**Reason**: Its scenario "A placement crosses only the notes it replaces"
lets a placement's ring cross the ringed cell's own notes, which the owner
revoked on 2026-10-28: a ring crosses no number.

**Migration**: Replaced by "A ring is round, crosses no number, and only the
engine draws one", which carries "A ring clears the content" verbatim,
replaces the revoked scenario with "A placement rings the whole cell, round
its notes", and adds "A cell's text leaves a ring room".
