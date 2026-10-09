# path Specification Delta — add-path-ts-port

## ADDED Requirements

### Requirement: Path provides a Numberlink solver that proves uniqueness

The engine SHALL provide `src/games/path/solver.ts` implementing a Numberlink
solver that, given a board of numbered endpoint pairs, determines whether the
board is solvable and whether its solution is unique. Unique-solution
generation is impossible without it, so it SHALL be proven before the game and
the generator are built.

#### Scenario: The solver classifies a board's solution count

- **WHEN** the solver is run on a hand-authored board known to be uniquely
  solvable, ambiguous, or unsolvable
- **THEN** it reports the matching classification

### Requirement: Path is the Numberlink game

The engine SHALL provide a registered `path` game implementing `Game`: on a
`w × h` grid the player links each pair of like-numbered endpoints with a
non-crossing path, filling the grid under the standard ruleset. The game SHALL
be reported solved when every pair is joined by a non-crossing path satisfying
the ruleset.

#### Scenario: Completing all paths wins

- **WHEN** every numbered pair is joined by a non-crossing path satisfying the
  ruleset
- **THEN** the game is reported solved

### Requirement: Path's generator accepts only a uniquely solvable board

The generator SHALL use upstream `path.c`'s path-growing strategy to produce
candidates, and SHALL accept only a candidate the solver proves uniquely
solvable. It SHALL mitigate the faults upstream recorded: too many trivial
paths, hopelessly interwoven grids, and boring straight-line paths. The
capability's assurance SHALL be behavioral, that every generated board is
uniquely solvable, and not a byte-for-byte differential against C.

#### Scenario: Generated boards are uniquely solvable

- **WHEN** a new game is generated at any offered size and difficulty
- **THEN** the board it produces has exactly one solution under the solver

### Requirement: Path is played by dragging between adjacent cells

Input SHALL be a click and drag between adjacent cells to create a link, over a
connection-based data model that lets the player mark sections of a path before
they are joined to an endpoint.

#### Scenario: Linking adjacent cells builds a path

- **WHEN** the player drags from a cell to an adjacent cell
- **THEN** a link is created between them and recorded as an undoable move
