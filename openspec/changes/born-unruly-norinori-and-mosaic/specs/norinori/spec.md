## MODIFIED Requirements

### Requirement: Generation: A dealt board has one answer

The deal SHALL draw the answer as dominoes touching only at corners, close
some as regions of their own, and grow regions round the rest
(`deal.grow`), mended until its deductions finish the board, so a dealt
board has exactly one answer. Every region SHALL be connected; a region of
two squares SHALL be a domino of the answer, and every other region SHALL
hold at least three squares.

#### Scenario: Any dealt board

- **WHEN** a board is dealt
- **THEN** Solve finishes it, and every region of two squares is shaded in
  the answer

### Requirement: Controls: The left button shades and the right crosses out

Norinori's buttons, keys and drag SHALL be those the fill engine derives
from its description (`described-fill-game`): a click SHALL take a square
round blank, shaded, crossed out, and a right click round the other way,
crossed out first. A drag SHALL sweep the value the pressed square took
over the squares it crosses. Every move SHALL be an engine `Edit`; a saved
game of the hand-written Norinori is not read, since the born game breaks
its saves (the owner's decision, 2026-11-22).

#### Scenario: Two left clicks

- **WHEN** a blank square is clicked twice with the left button
- **THEN** it is shaded after the first click and crossed out after the
  second

### Requirement: Look: Two shaded squares that touch only each other are one domino

Two shaded squares that are beside each other and beside no other shaded
square SHALL be drawn as one domino, the `domino` painter's halves meeting
at the side they share with a divider in the board's color, over the line
or region wall between them. A shaded square beside two or more others
SHALL be drawn as a piece of its own.

#### Scenario: A domino across a region wall

- **WHEN** two shaded squares in different regions touch only each other
- **THEN** they are drawn as one domino over the wall between them

#### Scenario: A run of three is no domino

- **WHEN** three shaded squares are in a row
- **THEN** each is drawn as a piece of its own

### Requirement: Look: A shaded square or cross is red where the board breaks a rule

Each shaded square or cross where the board breaks a rule SHALL be drawn in
the error color: a shaded square beside two others, or with no square left
beside it to pair with; every shaded square of a region holding more than
two; every cross of a region its crosses leave no room for two. A region's
breach SHALL be drawn on its squares however they lie, never as a run's bar
or a pair's mark between two squares.

#### Scenario: A region with three shaded

- **WHEN** a region holds three shaded squares in a row
- **THEN** all three are drawn in the error color, and no bar along them

#### Scenario: A shaded square boxed in alone

- **WHEN** a shaded square has a cross or the edge on every side
- **THEN** it is drawn in the error color

#### Scenario: A region of two crossed out

- **WHEN** both squares of a region of two are crossed out
- **THEN** both crosses are drawn in the error color, and no mark between
  them
