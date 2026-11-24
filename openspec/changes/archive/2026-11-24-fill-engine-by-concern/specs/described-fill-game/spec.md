## ADDED Requirements

### Requirement: A concept of the fill board is one module

Each concept the fill board offers a description (a clue location, a
painter layer, an ID segment kind, a deal step) SHALL be implemented in a
module of its own that registers with the code that runs it, so that adding
a concept adds a module and does not add a branch to a shared function.

#### Scenario: A new ID segment kind

- **WHEN** a description needs an ID segment kind the engine does not have
- **THEN** it is added as one new module, its line in the engine's registry
  and the compiler's check keyed beside it, which the typecheck demands, and
  no existing segment kind's module changes
