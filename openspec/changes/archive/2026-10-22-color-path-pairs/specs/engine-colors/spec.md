# engine-colors Specification Delta — color-path-pairs

## ADDED Requirements

### Requirement: Colors that mean nothing come from one set of their own

The collection SHALL hold one set of colors a player tells apart that carry no meaning, each with a name a player would say: none is near the color a board draws an error, a cursor, a held or dragged piece, or a hint's first ring or outline in, in either scheme. Every game whose pieces are told apart by a color that means nothing SHALL take its colors from this set, the first of them first, and MAY repeat them past its size only where something else, such as a number, tells the pieces apart.

#### Scenario: A piece's color is never the error's

- **WHEN** a game colors its pieces from the free set
- **THEN** no piece is drawn in the color its board uses for an error or a hint's first ring or outline

#### Scenario: A sentence names a piece by the set's word

- **WHEN** Flood's or Same Game's hint names a color
- **THEN** the word is the one the set gives that color
