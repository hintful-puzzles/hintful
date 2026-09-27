## ADDED Requirements

### Requirement: Ascent always offers a number beside the one selected

Selecting a placed number SHALL offer a number to place in the squares beside
it whenever one of its neighbors in the sequence is still missing: the one
after when the one before is placed, the one before when the one after is
placed, and the one after when neither is, with a right-click on an empty square
beside it cycling through the two.

#### Scenario: A number with neither neighbor placed

- **WHEN** the player selects a number whose neighbors in the sequence are both
  missing and clicks an empty square beside it
- **THEN** the next number is placed there
