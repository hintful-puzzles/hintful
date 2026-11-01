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
