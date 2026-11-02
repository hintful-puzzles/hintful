# described-ladder Specification

## Purpose
What a game whose techniques are stated in a description runs on, whatever
its board: the marks the engine owns, the space the description declares, the
ladder run capped per scale, the library paired by the engine, and the hint
built from the same compiled firings, so that a game states its techniques
and pairs its own reasons and writes no solver loop.

## Requirements

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

### Requirement: A board may be cells alone, its neighbors a relation it deals

A description SHALL be able to state its board as a count of cells with no geometry, in place of a grid, with each cell's neighbors a relation the board deals; the compiler SHALL refuse the grid's geometry on it, the compiled module's `Dealt` SHALL carry the relation, and the soundness checker SHALL check each technique over every relation on its cells, each pair in it or not.

#### Scenario: A Map region and the regions it borders

- **WHEN** Map's hint or solver reads which regions a region borders
- **THEN** it reads the `borders` relation the map deals, and the compiled ladder runs on the regions as the space's cells

### Requirement: Map runs its compiled ladder

Map's solver, generator, hint and answer check SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung; its Unreasonable tier SHALL be the engine's answer search over the compiled marks.

#### Scenario: A Tricky board's hint

- **WHEN** a Tricky Map board's hint weighs a region
- **THEN** the step is a firing of the compiled `weigh`, and the board was graded at Tricky by the compiled ladder
