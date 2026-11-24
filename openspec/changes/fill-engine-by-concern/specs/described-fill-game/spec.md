## ADDED Requirements

### Requirement: A concept of the fill board is one module

Each concept the fill board offers a description (a clue location, a painter layer, an ID segment kind, a deal step) SHALL be implemented in a module of its own that registers with the code that runs it, so that adding a concept adds a module and does not add a branch to a shared function.

#### Scenario: A new ID segment kind

- **WHEN** a description needs an ID segment kind the engine does not have
- **THEN** it is added as one new module and one registry entry, and no existing segment kind's module changes
