## ADDED Requirements

### Requirement: Separate's status bar says how many letters a region holds

`statusbarText` SHALL return "`k` letters per region" for a board of `k`
letters, the same at every point of play, which the engine's completion words
precede on a finished board.

#### Scenario: A board of four letters

- **WHEN** the 4×4 board `CCADDBBDABDCABCA` of `4x4n4de` is opened
- **THEN** the status bar reads "4 letters per region"
- **AND** after Solve the game's part of it still reads so, behind the
  engine's "Auto-solved."

### Requirement: A Separate hint says why its edge is forced

The hint SHALL say, of two touching regions that hold the same letter, that
they can't join, so the edge between them must be a wall; of two regions a
wall already separates, that the edge between them must be a wall too; and of
a region short of its size with one square left to take, that the edge to
that square can't be a wall.

#### Scenario: Two lone squares with one letter

- **WHEN** two neighboring squares joined to nothing both hold an A
- **THEN** the step says "These two As can't share a region, so the edge
  between them must be a wall."

#### Scenario: A region and a lone square

- **WHEN** a region the player has joined holds an A and a lone A touches it
- **THEN** the step says "The striped region already holds an A, so the
  outlined A can't join it: the edge between them must be a wall."

#### Scenario: One square left to take

- **WHEN** a region of two squares on a board of four letters has one square
  left that it may take
- **THEN** the step says "The striped region has 2 of its 4 squares and one
  square left to grow into, so this edge can't be a wall."
- **AND** of a lone A in the same case it says "This A is walled in on every
  side but one, so this edge can't be a wall."

### Requirement: A Separate size with no letter count takes its width

A params string with no `n` SHALL decode with as many letters as the grid is
wide, whether or not it gives a height.

#### Scenario: A preset without its letter count

- **WHEN** the `n4` is taken out of the preset `6x6n4de`, leaving `6x6de`
- **THEN** it decodes as a 6×6 board with six letters, whose full encoding is
  `6x6n6de`
