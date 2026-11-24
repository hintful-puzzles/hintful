## ADDED Requirements

### Requirement: The description's shape has one source

The shape of a game's description SHALL be stated once, in `description.schema.json`, and the TypeScript the compiler reads a description as SHALL be generated from it by every command that reads it, never committed, so that code reading a field the schema lacks fails the typecheck.

#### Scenario: Code reads a field the schema lacks

- **WHEN** the compiler reads a description field that the schema does not state
- **THEN** the typecheck fails, naming the field

#### Scenario: The schema changes

- **WHEN** a field's statement in the schema changes
- **THEN** the next command that reads a description regenerates the types, with no step to remember
