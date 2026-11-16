## RENAMED Requirements

- FROM: `### Requirement: The library's techniques are paired by the engine`
- TO: `### Requirement: Every technique is paired by the engine`

## MODIFIED Requirements

### Requirement: Every technique is paired by the engine

The engine SHALL pair every technique of a described game's ladder: each of the game's own with the clues the board deals where its compiled module declares that it reads them, and each of the library's with the library's reason. A game SHALL name a technique only where it supplies something the compiled module cannot: a reason of its own, or a rung that runs it otherwise. The clues a game passes SHALL be of the type its module's techniques read, and SHALL be `null` where none reads any.

#### Scenario: A game whose techniques all say what they read names none

- **WHEN** Norinori's ladder is built
- **THEN** the game passes only its dealt regions, and its techniques that read them and those that do not both run

#### Scenario: A table names the game's own

- **WHEN** Solo's ladder is built
- **THEN** its table names only the library's `latin.set`, which it gives a reason of its own, and every other technique runs as compiled
