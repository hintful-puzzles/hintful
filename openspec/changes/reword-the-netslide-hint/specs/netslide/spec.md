## ADDED Requirements

### Requirement: Hint: The hint names the piece, its way and its effect

The hint SHALL name the piece to slide, by its shape, with the way it slides
as a word ("left", "right", "up" or "down") and what the slide does for it. It
SHALL NOT say what cannot be done: that a line never slides is a rule the
board shows and the help page teaches, and a step SHALL NOT stripe the line.
The tile to slide is ringed, with the arrow to click, and nothing else is
marked.

#### Scenario: A tile on a frozen line is sent along the other line

- **WHEN** a hint step moves a tile that sits in the source's row
- **THEN** the explanation says to slide this piece up or down, and does not
  say that the row never slides
- **AND** only the tile and the arrow are ringed, and no line is hatched

### Requirement: Hint: A Netslide journey opens on its stated reason

The step that opens a journey SHALL say that the tile belongs beside the
source where the journey ends on a square sharing a side with the source and
the finished grid wants the tile's wires there; failing that, only the piece,
the way it slides and what that does. A later leg SHALL say the way it slides
the same tile on.

#### Scenario: A tile that belongs beside the source

- **WHEN** a journey opens on a tile whose destination is a square beside the
  source, where the finished grid wants its wires
- **THEN** the opening step says it belongs beside the source

## REMOVED Requirements

### Requirement: Hint: The hint leads with the tile's one degree of freedom

**Reason**: It led with a rule (a line that never slides), which says what
cannot be done; replaced by "The hint names the piece, its way and its
effect".

### Requirement: Hint: The destination mark stays on its cell during a slide

**Reason**: A step names the way a piece slides in a word, so it rings no
destination square.

### Requirement: Hint: A Netslide journey opens on the first reason that holds

**Reason**: Its first reason, that the source's line never slides, is a rule
and no longer said; replaced by "A Netslide journey opens on its stated
reason".
