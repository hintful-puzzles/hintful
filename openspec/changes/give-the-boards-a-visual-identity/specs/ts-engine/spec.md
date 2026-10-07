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
