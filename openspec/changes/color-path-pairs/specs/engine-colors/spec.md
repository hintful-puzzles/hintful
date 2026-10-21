# engine-colors Specification Delta — color-path-pairs

## ADDED Requirements

### Requirement: Colors that mean nothing come from a set of their own

The collection SHALL hold a set of colors a player tells apart that carry no meaning: none is a color the collection uses for an error, a hint, a cursor, a held or done state, nor one a player would take for one. A game whose pieces are told apart by color alone, with no meaning, SHALL take its colors from this set, and MAY repeat them past its size where something else, such as a number, tells the pieces apart.

#### Scenario: A pair's color is never the error's

- **WHEN** a game colors its pieces from the free set
- **THEN** no piece is drawn in the color its board uses for an error or a hint mark
