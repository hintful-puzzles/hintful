## ADDED Requirements

### Requirement: The engine owns what a board of pieces looks like

The engine SHALL provide, once for the collection, the look of a board whose
content is pieces, and a game SHALL take it by reference:

- the **surface**: the color of a cell that holds a piece or will, the color of
  the line between two cells, and the lifted color of the cell under a piece
  the puzzle gave, each a shared role that authors both schemes. The line
  SHALL stand off both cell colors in both schemes;
- the **piece**: a drawing helper that paints a piece as a shape inset on its
  cell, so that the grid shows between neighboring pieces and a mark drawn at
  the cell's edge lands beside the piece;
- the **two-state pair**: two colors, the two words a player would call them,
  and two shapes, each indexed alike, for a game with two states of which
  neither is the important one.

The pair's colors SHALL be none of the hues the shared roles spend on marks
drawn over a board (the error, the hint's action, the cursor, and the orange a
hint outlines premises in), and SHALL stand apart in lightness in both schemes,
so that a player who cannot tell the hues still has the lightness and the
shape.

A game that uses the pair SHALL name no hue or shape of its own for a state:
its palette, its hint sentences and its control words take the pair's members
by index, and its help page names a member's color by a placeholder the help
build fills from the same words. Replacing the pair SHALL therefore be a change
to the engine's declaration alone.

#### Scenario: A different pair changes no game

- **WHEN** the engine's two-state pair is given other colors, words or shapes
- **THEN** a game that uses the pair draws, narrates and documents the new pair
- **AND** no file under that game's directory and no line of its help page
  changes

#### Scenario: A help page that types a pair name fails

- **WHEN** a game's help page names the pair by placeholder
- **AND** also types one of the pair's color words
- **THEN** the cross-game help guard fails and names the page

#### Scenario: The pair survives a loss of hue

- **WHEN** the pair's two colors are measured in either scheme
- **THEN** their lightnesses stand apart by more than the gap that was too
  close to play by
- **AND** their shapes differ

### Requirement: The pair's hues carry what a player moves, seeks and finishes

The engine SHALL provide shared roles, each a reference to a member of the
two-state pair or to its wash, for the things that are a board's content
without being one of two states: a thing the player pushes or carries
(`MOVED`), where the player is going or what they are after (`GOAL`, and
`GOAL_WASH` for the cell it is in), and the surface of a region the player has
finished correctly (`REGION_DONE`). A game SHALL take these by reference and
name no hue for them, so that replacing the pair recolors them too.

The figure the player steers SHALL NOT take a pair hue: it is the cursor's
color, which says where the player is.

#### Scenario: A finished region is colored, not a step of gray

- **WHEN** `REGION_DONE` is resolved in either scheme
- **THEN** it carries the first pair member's hue
- **AND** it is distinct from the lifted surface under a given and from the
  wash under a selected cell

#### Scenario: A pushed thing and its destination are the two of the pair

- **WHEN** a game draws a thing the player pushes and the place it belongs
- **THEN** the first is `MOVED` and the second is `GOAL`

## MODIFIED Requirements

### Requirement: A ruled-out edge is discernible in both schemes

The shared "ruled out" role (`lineNoColor`) SHALL resolve to a color a clear
step off the board in both schemes — a mid gray — and SHALL remain visibly
distinct from the completed-region fill (`REGION_DONE`) it may be drawn
across, so that a player, and in particular a keyboard player whose cursor walks
the edges, can see where a ruled-out edge lies while still reading it as
disabled rather than drawn.

#### Scenario: A ruled-out edge stands off a dark board

- **WHEN** the role is resolved for the dark scheme against the collection's
  board
- **THEN** its lightness differs from the board's by more than the undecided
  edge's did before this change (the value the owner's playtest found nearly
  invisible)
- **AND** it remains darker than ink

#### Scenario: A ruled-out edge across a completed region still shows

- **WHEN** the role and `REGION_DONE` are resolved against the same
  board in either scheme
- **THEN** the two are visibly distinct
