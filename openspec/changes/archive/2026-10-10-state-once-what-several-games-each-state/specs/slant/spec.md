## ADDED Requirements

### Requirement: Slant generates solver-gated boards

A generated board SHALL have a unique solution that its difficulty's solver
finds, and above Easy SHALL NOT be solvable one level down. A clue SHALL stay
removed only while that solver still finds the solution, and above Easy the
obvious starting points (4s, 0s, border 2s and corner 1s) SHALL be tried for
removal before the rest, so that few of them survive.

#### Scenario: A removal the solver cannot bear is undone

- **WHEN** removing a clue leaves a board the solver no longer solves uniquely
  at the board's difficulty
- **THEN** the clue is put back

## MODIFIED Requirements

### Requirement: A click cycles a square through its three states

`interpretMove` SHALL cycle a square blank→`\`→`/`→blank on a left-click and
blank→`/`→`\`→blank on a right-click, the two swapped when the `left-button`
preference selects `/`-first.

#### Scenario: Left-click cycles a square

- **WHEN** a blank square is left-clicked three times (default button
  order)
- **THEN** the square becomes `\`, then `/`, then blank

#### Scenario: Swapped button order

- **WHEN** the `left-button` preference is set to `/`-first and a blank
  square is left-clicked
- **THEN** the square becomes `/`

### Requirement: The completion flash lifts the squares in three phases

The completion flash SHALL run in three phases, lit on the first and the last.
On its lit beats it SHALL lift the squares to the given's surface.

#### Scenario: The middle phase is unlit

- **WHEN** the flash is in its middle third
- **THEN** the squares are drawn on the cell surface

## REMOVED Requirements

### Requirement: Slant generates solver-gated boards reproducibly

**Reason**: Restated as "Slant generates solver-gated boards". Retitled without "reproducibly", and the first sentence and its scenario go:
both are `engine-difficulty`, "A generator's board depends only on its params
and its random state". Nothing cites the title. The rest is unchanged.
