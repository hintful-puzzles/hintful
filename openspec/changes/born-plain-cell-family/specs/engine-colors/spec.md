## MODIFIED Requirements

### Requirement: A board colored half and half gives its clear squares a surface

The engine SHALL provide the clear square through one painter (`clear`,
`engine/render/pieces/stock.ts`): a surface of its own over the whole cell
(`CLEAR`) with the ruled-out cross drawn faint on it (`CLEAR_MARK`). A game
whose board is colored about half and half SHALL draw a cell known not to be
shaded with it. A game where a few squares are the answer and the rest is a
note SHALL keep the bare cross.

#### Scenario: The surface is the pair's second hue and the mark reads on it

- **WHEN** the two roles are resolved in either scheme
- **THEN** the surface has the hue of the pair's second member, and the mark
  stands more than a fifth of the lightness range from the surface and nearer
  to it than the scheme's ink does

#### Scenario: A square whose middle is taken

- **WHEN** a game draws the clear square of a cell that holds a number
- **THEN** the surface is drawn and no cross is

## ADDED Requirements

### Requirement: A clear square whose middle holds a number carries no cross

The `clear` painter SHALL draw the cross in the middle of a cell that holds
nothing else, and SHALL draw none where the cell holds a number, so that the
number has the square to itself and is never crossed through.

#### Scenario: A numbered square beside a bare one

- **WHEN** a game clears two squares, one holding a number and one holding
  nothing
- **THEN** both are the clear surface, the bare one carries the faint cross
  in its middle, and the numbered one carries its number and no cross

## REMOVED Requirements

### Requirement: A clear square whose middle is taken carries no cross

**Reason**: Its helper, `drawClearSquare`, lost its last caller when Pattern
was born from its description; the fill engine's `clear` painter draws the
clear square, and a win flash is the engine's own.
**Migration**: `A clear square whose middle holds a number carries no cross`.
