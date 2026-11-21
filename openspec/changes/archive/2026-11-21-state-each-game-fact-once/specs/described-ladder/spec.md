## ADDED Requirements

### Requirement: A description states what the catalog does not

A game's name and the family a player browses by SHALL be stated in its
`catalog.ts` alone. A description SHALL state what the game `produces`
(shading, latin, ...), which groups the games whose techniques a candidate
may share. Its `sizes` SHALL be the ranges its rules are stated over, the
worlds the soundness check builds, not the Custom dialog's bounds, which
`paramConfig` states. A size's `max` SHALL be absent where the rules set none.

#### Scenario: A description names its game

- **WHEN** a description states a `name` or a `family`
- **THEN** it fails to load, and the catalog's entry is the one to edit

#### Scenario: A size the rules do not bound

- **WHEN** a description's rules hold at any width
- **THEN** its `w` states a `min` and no `max`
