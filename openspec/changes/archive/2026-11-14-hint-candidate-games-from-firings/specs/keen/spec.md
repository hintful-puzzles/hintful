## MODIFIED Requirements

### Requirement: Hint: Keen's hint is the shared candidate plan over rows and columns

Keen's hint SHALL be the collection's candidate-elimination plan, taken through
its row/column preset (`engine-candidate-hints`, "A shared candidate-elimination
hint plan" and "A row/column Latin square answers no question its regions
already settle"), with no departure. Keen SHALL supply its cage techniques as
rungs over the notes, each saying its cage, and the words of its two cage
deductions, which the requirements below state.

#### Scenario: A single on a Keen board

- **WHEN** a step places a digit because it fits one cell of its row
- **THEN** its sentence is the shared narrator's and names no cage

### Requirement: Hint: A cage elimination is one firing, and a firing is one cage's

A cage elimination SHALL be taught as one firing: no layout of the cage's
digits consistent with its clue leaves a candidate possible in a cage cell, or,
at the harder level, a digit the cage requires along a row or column is ruled
out elsewhere in that line. A firing SHALL be one cage's, so a hint step never
mixes cages, and its strikes SHALL be a step a cell.

#### Scenario: A cage elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a cage's
  arithmetic clue rules a digit out of one of its cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the cage's cells are striped and the cell is ringed in the hint color

#### Scenario: Two cages could prune at once

- **WHEN** a board's notes let two cages each rule a candidate out
- **THEN** each cage's strikes are a firing of their own, and no step strikes
  for both

### Requirement: Hint: Keen's hint deduces at the tier of the board's params

On a board below Unreasonable the hint SHALL run only the techniques of the
board's own tier, so a hint step never rests on a deduction above the tier the
board was dealt at.

#### Scenario: A hint on a Normal board

- **WHEN** a hint is asked for on a board of `6dn`
- **THEN** no step is a digit a cage requires along a line, a set deduction or
  a forcing chain
