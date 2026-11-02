## MODIFIED Requirements

### Requirement: A shared library lives under `src/engine/`

A shared leaf library, such as `random/`, is an engine library and SHALL live under `src/engine/`, keeping its own frozen characterization corpus where it has one. There SHALL NOT be a separate top-level category for a shared or leaf module.

#### Scenario: A shared library is not given its own top-level directory

- **WHEN** a contributor adds a shared library used by the engine or by
  more than one game
- **THEN** it lands under `src/engine/`, not as a sibling of it
