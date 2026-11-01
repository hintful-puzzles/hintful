## ADDED Requirements

### Requirement: A compiled ladder runs on the engine's marks, whatever the board

The engine SHALL own the marks a compiled technique reads, a value and a mask of candidates a cell, and SHALL run a compiled module's ladder on them: one technique an entry, in the module's order, capped and graded per scale, and the module's techniques run on placing as each value is placed. A game's solver SHALL extend the marks only to keep what no description states, a search.

#### Scenario: A board with no units

- **WHEN** Unruly's ladder solves a board
- **THEN** it runs on the engine's marks with no unit, and a placement culls nothing

#### Scenario: A Latin game's solve is unchanged

- **WHEN** a Latin game's board is dealt and hinted on the engine's marks
- **THEN** every deal and every hint step's rung, move and words are what the per-tier runner gave

### Requirement: The space is the one the description declares

A compiled module SHALL list the description's units in its order, and the engine SHALL build the board's space from them: rows and columns lines whether or not they are units, and the one partition among the units the space's boxes. The library's `placed` SHALL strike a placed value from every unit holding it.

#### Scenario: A placed value leaves its box

- **WHEN** a value is placed on a Solo board
- **THEN** it is struck from the rest of its row, column and box, and of each diagonal holding it on an X board

### Requirement: A domain may be a cell's

Where a description's answer domain reads the cell, `c`, the compiled module SHALL export each cell's domain, the engine SHALL start each cell's candidates from it, the soundness checker SHALL bound each cell's answer and marks by it, and the bare name `domain` SHALL be refused in a technique.

#### Scenario: A Seismic area's numbers

- **WHEN** a Seismic board with an area of three squares is solved
- **THEN** each of its squares starts able to hold 1, 2 and 3 only

### Requirement: The library's techniques are paired by the engine

A described game SHALL pair only its own techniques with their reasons, and the engine SHALL pair the library's, unless the game pairs one with a reason of its own. A technique of the game's own that its description states and the game does not pair SHALL be a type error.

#### Scenario: A table names the game's own

- **WHEN** Unequal's ladder is built
- **THEN** its table pairs `sign` alone, and the library's five techniques run with the engine's reasons

### Requirement: A technique a variation adds runs only where it is on

A technique a variation adds SHALL run only on a board the variation is on, SHALL come in the ladder before the first technique of a higher tier on its scale, and SHALL be checked sound in the worlds that have it.

#### Scenario: Unruly's unique rows

- **WHEN** an Unruly board without the unique rule is solved
- **THEN** the unique-rows technique does not run

### Requirement: A hint walks the compiled firings

A described game's hint SHALL be built from its compiled ladder's firings: recorded into the candidate walk where the game has notes, and otherwise by a walk that takes, one firing a step, the firing continuing from the walk's last steps, the ladder's order breaking ties, and never one of a higher tier than the ladder's own next firing.

#### Scenario: An easier step is never passed over

- **WHEN** an Unruly board offers a three in a row and a near-complete line, the line beside the hint's last step
- **THEN** the next step is the three in a row
