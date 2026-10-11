## ADDED Requirements

### Requirement: A board colored half and half gives its clear squares a surface

The engine SHALL provide the clear square through one helper
(`drawClearSquare`): a surface of its own over the whole cell (`CLEAR`) with
the ruled-out cross drawn faint on it (`CLEAR_MARK`). A game whose board is
colored about half and half SHALL draw a cell known not to be shaded through
it. A game where a few squares are the answer and the rest is a note SHALL
keep the bare cross.

#### Scenario: The surface is the pair's second hue and the mark reads on it

- **WHEN** the two roles are resolved in either scheme
- **THEN** the surface has the hue of the pair's second member, and the mark
  stands more than a fifth of the lightness range from the surface and nearer
  to it than the scheme's ink does

#### Scenario: A square whose middle is taken

- **WHEN** a game draws the clear square of a cell that holds a number
- **THEN** the surface is drawn and no cross is
