# described-position Specification

## Purpose
A planning game (one whose player moves pieces toward a finished position, rather than deducing a hidden answer) states its position, moves, finish and dead-end claims in its description. The game runs on the rules compiled from them, and each dead-end claim is checked sound before it compiles.

## Requirements

### Requirement: A planning game's rules are compiled from its description

A planning game's description SHALL state its position's layers, its moves, its finish and its dead-end claims, and its compiled module SHALL export `rules`, the engine's `PositionRules`: the legal moves of a position, whether one is legal, the position after it, and whether a position is finished, lost or a proved dead end. The game SHALL decide each only by them.

#### Scenario: A move the rules refuse is not made

- **WHEN** a Fifteen move names a square off the gap's row and column
- **THEN** the compiled rules call it illegal and the game refuses it

#### Scenario: The finish is the description's

- **WHEN** a Twiddle board's numbers read in order and one tile is turned, with orientation on
- **THEN** the compiled finish is false and the game's status is not solved

### Requirement: A move's assignments are simultaneous

Each assignment of a move SHALL read the position as it stood before the move, so a move that carries a line's tiles round reads every tile where it was.

#### Scenario: A slide reads the line before it

- **WHEN** a Sixteen row is slid one square on
- **THEN** every tile of the row moves one square, the last coming round to the first

### Requirement: A variation's rules hold only where it is on

A layer, assignment, finish formula or dead-end claim a variation adds SHALL hold only on a board with the variation on, and a layer it adds SHALL be all zeros on a board without it.

#### Scenario: Turns are kept only where orientation matters

- **WHEN** a Twiddle block is turned on a board without orientation
- **THEN** no tile's turn changes

### Requirement: A dead-end claim is checked sound before it is compiled

Every dead-end claim SHALL be checked sound by a search of every position of the small boards the checker reaches, each planted defect beside it SHALL come out unsound, and the gate SHALL refuse a compiled claim whose statement or rules have changed since it was found sound.

#### Scenario: An edited claim is refused until it is checked

- **WHEN** a claim, or a move or finish it was checked under, is edited and not checked again
- **THEN** `compile.test.ts` fails, naming the claim

### Requirement: A permutation planner is fed the compiled moves

A planning game whose hint plans with a shared planner SHALL give it the moves its compiled rules list, and a planner that takes a move's effect SHALL read it off the compiled move.

#### Scenario: Twiddle's generators are its compiled turns

- **WHEN** Twiddle's hint plans
- **THEN** each generator is the effect of one of the description's anticlockwise turns

### Requirement: A definition that reads itself is its least fixed point

A planning game's definition of one cell that reads itself SHALL compile to the least set of cells for which its body holds, and the compiler SHALL refuse one whose reads of itself could make the set smaller as it grows: under a negation, beside `iff` or `=`, on the left of `implies`, in a `forall`'s `where`, inside an aggregate, or through another definition.

#### Scenario: Pegs' frozen peg rests on a fixed point

- **WHEN** a Pegs board has a peg beside which no peg can ever come to stand, and another peg
- **THEN** the compiled `frozen` claim holds, and the checker finds it sound

#### Scenario: A read under a negation is refused

- **WHEN** a definition `r(c)` reads `not r(c)`
- **THEN** compiling the description fails, naming `r`

### Requirement: A dead-end claim names the cells it holds of

A claim whose last conjunct is `exists x in S: P` SHALL give, through the rules' `witnesses`, every `x` for which the conjuncts before it and `P` hold, and a game's dead-end banner SHALL outline those cells.

#### Scenario: Inertia outlines its stranded gem

- **WHEN** a slide leaves an Inertia gem no slide can ever pass over
- **THEN** the hint's refusal outlines that gem, the compiled claim's witness

### Requirement: A lost position has no moves

Where a description states `lose`, its compiled rules SHALL list no move from a lost position and call every move from it illegal.

#### Scenario: A dead ball cannot slide

- **WHEN** Inertia's ball stops on a mine
- **THEN** no slide is legal until the move is undone

### Requirement: A search's own copy of the moves is measured and held to them

A solver or planner that applies moves by code of its own SHALL do so only where the compiled move was measured too slow for it, with the measurement beside the code and a test holding the two to agreement.

#### Scenario: Pegs' packed jumps agree with the compiled ones

- **WHEN** Pegs' packed board lists its jumps and frozen pegs on positions of random games
- **THEN** they are the compiled rules' moves and the `frozen` claim's witnesses

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
