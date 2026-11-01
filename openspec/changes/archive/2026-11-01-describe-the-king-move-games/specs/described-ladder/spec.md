## ADDED Requirements

### Requirement: A technique may read the king's-move neighborhood

The description language SHALL give a technique a cell's eight neighbors, `adj8(c)`, and the cells within `r` king's moves of it, `within(c, r)`, the cell among them, in reading order; the compiler, the runtime and the soundness checker SHALL each read both.

#### Scenario: A Mosaic number's block

- **WHEN** a Mosaic number in a corner is read
- **THEN** its block, `within(c, 1)`, is its own square and the three beside it

#### Scenario: Nothing touches a star

- **WHEN** a star is placed on a Star Battle board
- **THEN** the compiled `around` makes the squares in `adj8` of it empty

### Requirement: A described game's generator grades on its compiled ladder

A described game's generator SHALL decide a board's tier by running the compiled ladder capped at each tier, and SHALL keep no second solver for grading.

#### Scenario: Mosaic's Easy deal

- **WHEN** an Easy Mosaic board is dealt
- **THEN** the compiled ladder capped at Easy finishes it, and no other solver is asked

#### Scenario: Clusters' prune reads the board alone

- **WHEN** Clusters' generator prunes neighboring dots of one color
- **THEN** it compares their colors and dots, and no bit a solver wrote into the grid
