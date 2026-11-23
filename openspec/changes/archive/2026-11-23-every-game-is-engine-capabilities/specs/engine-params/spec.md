## RENAMED Requirements

- FROM: `### Requirement: A params encoding the grammar does not fit stays hand-written`
- TO: `### Requirement: A params encoding the grammar does not fit grows the grammar`

## MODIFIED Requirements

### Requirement: A params encoding the grammar does not fit grows the grammar

A game whose params encoding the segment grammar cannot express SHALL be met by a new segment or option, which another game could adopt: it is stated in terms of the encoding's shape, such as a float-valued param or a letter before the dimensions, and never in terms of the game. An option with one user is allowed. A hand-written codec is a game not yet moved to the grammar, not a form a game keeps.

#### Scenario: A bespoke codec is held to the same guarantee

- **WHEN** a game still has a hand-written codec
- **THEN** its encodings are asserted by the same byte-stability guard as every
  declared one, so the two shapes differ in how they are written and not in
  what is promised

#### Scenario: A shape only one game has

- **WHEN** a game's params put a letter before the dimensions, and no other game's do
- **THEN** the grammar gains an option for a leading letter, which a later game's declaration can name
