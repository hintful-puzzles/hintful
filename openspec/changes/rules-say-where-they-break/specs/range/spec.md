## MODIFIED Requirements

### Requirement: Rules: Range is solved exactly while it has no error

The player paints some white squares black so that no two black squares are
orthogonally adjacent, all white squares stay connected, and every numbered
clue equals the number of white squares visible from it in a straight line,
itself counted once (`h + v - 1`). The board SHALL be reported solved exactly
while its rules (`Game.rules`) hold of it, an unmarked square counting as
white.

#### Scenario: A clue counts itself once

- **WHEN** a clue sees a horizontal white run of 3 and a vertical white run of
  2, each run including the clue's own square
- **THEN** the clue it must equal is 4

#### Scenario: Completing the board is detected

- **WHEN** a move paints the final black square of the unique solution
- **THEN** the rules report no violation and `status` returns `"solved"`

### Requirement: Rules: Range highlights errors live

`redraw` SHALL frame in the error color, each frame, every square where the
board breaks a rule (`Game.rules`), a square beside a black one read as
white: two black squares orthogonally adjacent, both framed; a clue that can
no longer see its number, or already sees more; and, where the white squares
can no longer be one group, the black squares that touch two of the groups.

#### Scenario: A black-adjacency violation reddens live

- **WHEN** two orthogonally adjacent cells are both painted black
- **THEN** `redraw` frames both in the error color without any explicit check
  action

#### Scenario: A corner cut off

- **WHEN** the two squares beside a corner are painted black
- **THEN** both are framed in the error color, and the corner is not
