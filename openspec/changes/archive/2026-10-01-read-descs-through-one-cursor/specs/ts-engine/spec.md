## ADDED Requirements

### Requirement: A game reads its description once

Every game SHALL read its description with one parser returning a
`DescParse` (`engine/desc-error.ts`): `validateDesc` SHALL answer from that
parse's verdict and `newState` SHALL build from its value, so the two cannot
disagree about a character. A check that needs the parsed board (a count, a
region, a rule of the puzzle's own) SHALL run inside that parse. A parser
SHALL accept what the game's own encoder writes and SHALL refuse what the
grammar has no place for, rather than skip it.

The engine SHALL provide a cursor over a description (`engine/desc-reader.ts`)
whose reads fail with the collection's `DescError` kinds: a character or
number missing because the description ended is too short, one with another
character in its place names that character, a number outside the bounds its
caller states is out of range, and text after the board is too long. The
cursor SHALL offer no way to read a number without bounds.

#### Scenario: A description the generator wrote

- **WHEN** a game's own generator writes a description for any preset the
  near-miss test reaches
- **THEN** `validateDesc` accepts it

#### Scenario: A description that ends early

- **WHEN** a description ends where the cursor expected a separator or a
  number
- **THEN** the parse fails as too short, never as a bad character or as
  malformed

#### Scenario: A number too large for its board

- **WHEN** a description gives a number larger than its caller's bound,
  however many digits it has
- **THEN** the parse fails as out of range, rather than storing a value a
  typed array wraps
