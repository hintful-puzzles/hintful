## ADDED Requirements

### Requirement: A born game's tests are data the engine reads

A game born from its description SHALL hold no test code of its own: its directory SHALL hold only data that engine tests read, such as example IDs and params with the outcome expected, positions with the outcome expected, hint pins and planted defects. Every assertion SHALL be an engine test of a capability or a cross-game guard that reads its games from their declarations.

#### Scenario: A case that needs a loop

- **WHEN** a game's test data would need branching or a loop to state what it expects
- **THEN** an engine check is missing, and it is written in the engine for any game to name

#### Scenario: An expected outcome recorded from the engine's own output

- **WHEN** an example's expected value is what the engine wrote rather than something known apart from it, such as an ID upstream's generator wrote
- **THEN** the example says it is a recorded snapshot

### Requirement: A capability is tested on a description of its own

Each capability a born game names SHALL be tested in the engine on a small description made for the test, not the description of the first game that used it, so that the test shows another game can adopt it.

#### Scenario: A capability only one game uses

- **WHEN** only one born game names a capability
- **THEN** its engine test still runs it on a fixture description that names no game
