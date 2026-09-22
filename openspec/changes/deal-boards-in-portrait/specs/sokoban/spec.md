## MODIFIED Requirements

### Requirement: Sokoban game implements the Game interface

The engine SHALL provide `src/games/sokoban/` implementing the `Game`
interface for Sokoban, registered so the puzzle is served by the TypeScript engine.

Sokoban SHALL support rectangular boards parameterized by width and height (both at
least 4), with presets 10×12, 12×16 and 16×20 (upstream's sizes, turned to draw taller
than wide). Because Sokoban is a
non-deductive movement puzzle with no solver and no wrong-but-legal cell state, it
SHALL NOT implement `solve`, `hint` or `findMistakes`; Check & Save SHALL therefore
degrade to a plain quick-save, which is correct for a non-uniquely-solvable game.

#### Scenario: A new game produces a solvable board

- **WHEN** a new game is generated at a legal size
- **THEN** a board is produced with exactly one player and at least one barrel and
  target, and the board is solvable (it is constructed by reversing a solution)

#### Scenario: Parameters round-trip

- **WHEN** a parameter string naming a width and height is encoded and decoded
- **THEN** the same width and height are recovered, and a bare single number is read
  as a square board
