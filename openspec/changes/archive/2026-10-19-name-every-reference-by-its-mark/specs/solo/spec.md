## MODIFIED Requirements

### Requirement: Hint: A Solo step's indication is its firing region, or what the player looks at

The indication of a step that fires on a region SHALL be that region, named
by its kind (a killer cage with its clue or the sum the clue leaves), and its
conclusion SHALL be that what an elimination strikes "must go", and "must be"
or "can only be" the number a placement enters. The indication of a step with
no firing region SHALL be what the player looks at: the cell for a single, the
number just placed for the cull after it, and the notes for a step that sets
them up.

#### Scenario: A strike's sentence names its region and ends in necessity

- **WHEN** the player asks for a hint on a fully-penciled board where a
  deductive technique rules a digit out of a cell
- **THEN** the narration names the firing region (row / column / block /
  diagonal, or "this killer cage") and concludes in the necessity voice

#### Scenario: What an elimination's conclusion names

- **WHEN** a step strikes one number, or several, or numbers its reasoning has
  just listed
- **THEN** it concludes "the 5 must go", or "1 and 2 must go", naming the
  numbers in every case

#### Scenario: The cull after a placement names where the number cannot repeat

- **WHEN** a step strikes the number just placed from the cells that share a
  region with it
- **THEN** its narration begins "The 5 just placed can't repeat in its" and
  names every kind of region the cell lies in, not one firing region

#### Scenario: A cage is named by what its open cells must make

- **WHEN** a killer step strikes a number, reasoning from a cage some of whose
  cells are filled
- **THEN** it gives the sum the clue leaves and not the clue: "This killer
  cage's open cells make 9"

#### Scenario: A cage of one open cell and nothing filled

- **WHEN** the next step fills the only cell of a cage
- **THEN** it concludes "it must be its total," and the number

#### Scenario: A single read off one cell's notes names the cell

- **WHEN** the next step places the only number an empty cell's notes leave
- **THEN** its narration begins "Every other number has been ruled out in" that
  cell, names no region, and concludes "it can only be" that number
