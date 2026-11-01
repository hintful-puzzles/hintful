## ADDED Requirements

### Requirement: A layer may say where its value stands, and that no rule reads it

A layer's `on` formula of a cell SHALL say where its value may be other than 0, which the dead-end checker reads to leave out positions no board holds. A `carried` layer SHALL be one no rule reads but its own assignment, which the compiler enforces and the checker holds at 0.

#### Scenario: A rule that reads a barrel's letter is refused

- **WHEN** a description's move reads a carried layer outside an assignment to it
- **THEN** compiling the description fails, naming the layer

#### Scenario: Sokoban's checker searches no barrel off the floor

- **WHEN** the checker searches Sokoban's small boards
- **THEN** no position it searches has a barrel or a target off the floor, and its claims are found sound

### Requirement: A board that is not a rectangle is its cells and the tables it deals

A description SHALL be able to state a board as a count of cells with no geometry, a second sort of element counted by a size, layers over that sort, and tables the board deals from elements and numbers to an element. The compiler SHALL refuse the geometry on a board of cells alone, and an element of one sort where another is read.

#### Scenario: Cube rolls by its dealt table

- **WHEN** the solid rolls on a triangular arena
- **THEN** the square it lands on and each face's paint are the compiled roll's, read from the table the arena deals

#### Scenario: The geometry is refused on cells alone

- **WHEN** a description of cells alone reads `adj4(c)`
- **THEN** compiling it fails

### Requirement: A claim over what a board deals is checked on boards the game deals

Where a description reads a relation or table the board deals, the dead-end checker SHALL check its claims on small boards the game's own dealing code deals, listed by the game in `research/technique-check/boards/`, and SHALL refuse to check such a description with no list.

#### Scenario: Cube's short paint is checked on its own arenas

- **WHEN** the checker runs on Cube
- **THEN** it searches small arenas of the tetrahedron and the cube, each with its roll table, and finds the claim sound
