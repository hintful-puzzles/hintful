# engine-colors Specification Delta — color-path-pairs

## ADDED Requirements

### Requirement: Colors that mean nothing come from a set of their own

The collection SHALL hold a set of colors a player tells apart that carry no meaning: none is near a color a board draws an error, a cursor, a held or dragged piece, or a hint's ring or outline in, in either scheme. A game whose pieces are told apart by a color that means nothing, while something else such as a number says which is which, SHALL take its colors from this set and MAY repeat them past its size.

#### Scenario: A pair's color is never the error's

- **WHEN** a game colors its pieces from the free set
- **THEN** no piece is drawn in the color its board uses for an error or a hint's ring or outline
