## MODIFIED Requirements

### Requirement: A diagonal line automatically rules out its crossing

Spokes SHALL rule out a diagonal's crossing automatically, because a drawn
diagonal visibly blocks the other diagonal of the same square. Drawing a diagonal
line SHALL mark its crossing spoke; erasing that line SHALL clear the mark it
placed, and SHALL leave a mark the player had made there before the line; and a
crossing so blocked SHALL be inert to input while the line stands. The rule-out
SHALL be a real mark, so the solver and the hint count it, and the hint SHALL
therefore never propose it.

#### Scenario: Drawing a diagonal blocks its crossing, erasing it unblocks

- **WHEN** the player draws a diagonal line across a square
- **THEN** the crossing diagonal of that square becomes ruled out without any
  further action, and the player cannot toggle that mark while the line remains
- **AND WHEN** the player erases the diagonal line
- **THEN** the automatic mark on the crossing is removed

#### Scenario: The player's own mark outlives the line drawn over it

- **WHEN** the player rules out one diagonal of a square, draws the other
  diagonal as a line, and erases that line
- **THEN** the first diagonal is still ruled out

### Requirement: Spokes' parameters

Parameters SHALL be a width, a height, and a difficulty: Easy, Normal or
`Unreasonable`. Validation SHALL require width and height each at least 2, with
no upper bound. When a board is to be dealt it SHALL also refuse `Unreasonable`
on a board of eight squares or fewer, which has no such board, and on a board
two squares wide, where one is too rare to deal. A game ID SHALL encode the
width, height and difficulty and round-trip through decode.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and difficulty are recovered

#### Scenario: A narrow board at the top tier

- **WHEN** a 2×6 board is asked for at `Unreasonable`
- **THEN** the parameters are refused, and the same size at Normal is not
