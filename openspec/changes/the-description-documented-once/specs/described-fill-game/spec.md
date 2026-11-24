## ADDED Requirements

### Requirement: The description's shape has one source

The shape of a game's description SHALL be stated once, in either its schema or its types, with the other generated from it, and a check SHALL fail when the two differ.

#### Scenario: A field added to one side only

- **WHEN** a field is added to the description's source and the generated side is not regenerated
- **THEN** the check fails, naming the field
