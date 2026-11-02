## ADDED Requirements

### Requirement: A clue revealed during play is read as a dealt clue

A game whose clues come from play SHALL build the compiled module's `Dealt` from its state on each hint and solve, and the description language SHALL declare nothing about where a clue came from; a clue at the board SHALL be stated with fields, each a function of the clue and, where the field is one a cell, of a cell.

#### Scenario: A Mines number opened by the hint

- **WHEN** a Mines hint's step opens a square
- **THEN** the walk's clue list holds that square's number before its next firing, and the marks it had are kept

#### Scenario: A Guess score

- **WHEN** a Guess row is scored
- **THEN** the compiled ladder reads its pegs, black and total as one clue at the board

### Requirement: A technique may read a laser's path over partial marks

The description language SHALL give a technique `beam(s)`, where the laser fired in from slot `s` goes over the values placed, `beam(s, c, v)`, the same supposing cell `c` holds `v`, and `ahead(s)`, the first cell no value is placed in that decides it; the game, the compiled code and the soundness checker SHALL read one tracer for it.

#### Scenario: A laser through an open square

- **WHEN** a Black Box laser's path reaches a square nothing has settled, and a ball there would send it where it did not go
- **THEN** `ray` places an empty square there

### Requirement: Mines certifies its boards on its compiled ladder

Mines' generator SHALL accept a layout only where the compiled ladder, opening each square it proves safe, finishes the board from the first square opened, and SHALL keep no second solver for it.

#### Scenario: An Expert board

- **WHEN** a 30×16 board with 99 mines is laid out at the first click
- **THEN** the hint's own ladder finishes it from there
