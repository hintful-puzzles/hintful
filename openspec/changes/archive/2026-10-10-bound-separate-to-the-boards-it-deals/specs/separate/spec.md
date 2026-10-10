## ADDED Requirements

### Requirement: Separate refuses to deal a size its generator gives up on

Under full validation, on a grid wider and taller than one square,
`validateParams` SHALL refuse more than 13 letters; from 8 letters, a grid
whose squares times letters squared exceed 10,000; 13 letters on a grid two
squares wide; and 9 or more letters on a grid three squares wide that they
divide into two regions. The refusal SHALL say to use fewer letters or a
smaller grid.

#### Scenario: Many letters on a large grid

- **WHEN** a 10×11 board with ten letters, or a 12×14 board with eight, is
  checked for dealing
- **THEN** it is refused as too rare to deal, with the advice to use fewer
  letters or a smaller grid
- **AND** a 10×10 board with ten letters and a 12×12 board with eight are not
  refused

#### Scenario: The narrow shapes

- **WHEN** a 4×7 board with fourteen letters, a 2×13 board with thirteen, or
  a 3×6 board with nine is checked for dealing
- **THEN** each is refused
- **AND** a 4×13 board with thirteen letters, a 2×12 board with twelve and a
  3×4 board with six are not

#### Scenario: A strip takes any letter count

- **WHEN** a 1×52 board with 26 letters is checked for dealing
- **THEN** it is not refused

### Requirement: Separate refuses no size of up to seven letters

`validateParams` SHALL refuse no board of seven letters or fewer for its
size or for the time its deal takes, at either difficulty, beyond the area
the params can hold: a player can stop a deal.

#### Scenario: A large board in few letters is asked for

- **WHEN** a 40×40 board with two letters and a 21×21 board with seven are
  checked for dealing at Easy
- **THEN** neither is refused

### Requirement: A Separate board of a size that is not dealt still opens

A board that arrives with its description SHALL be opened at any size
`validateParams` admits without full validation, the sizes it refuses to
deal among them.

#### Scenario: A pasted board of a refused size

- **WHEN** a 3×6 board with nine letters that has one answer is loaded from
  its ID
- **THEN** it opens, at the difficulty it needs

## MODIFIED Requirements

### Requirement: Every generated Separate board is solved by its own solver

At Easy the generator SHALL emit only a board the solver, run to a fixpoint
from an empty board, fully solves, so every Easy board has one partition and
that solver reaches it. It SHALL deal a board at every size `validateParams`
admits for dealing, at both difficulties: it divides the grid into regions
none of which holds a ring of squares, and places the letters so that the
solver finishes.

#### Scenario: Generated boards are uniquely solvable

- **WHEN** the generator produces an Easy board for given params
- **THEN** the solver run to a fixpoint partitions it into `k`-ominoes each
  holding one of each letter

#### Scenario: Boards in many regions and in many letters are dealt

- **WHEN** a 12×12 board with two letters, a 9×9 board with three, an 8×8
  board with eight and a 4×5 board with ten are dealt at Easy
- **THEN** each is dealt, and the solver solves it

#### Scenario: The same sizes are dealt at Unreasonable

- **WHEN** a 9×9 board with three letters and an 8×8 board with eight are
  dealt at Unreasonable
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable
