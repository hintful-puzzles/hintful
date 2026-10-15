## ADDED Requirements

### Requirement: The engine mends a division until a game's deductions finish it

`src/engine/mend-division.ts` SHALL move single cells between neighboring
regions until a game's deductions finish the board and its easier tier does
not, each region staying connected and no smaller than the game's least
size, and a cell the game fixes never moving. The game SHALL supply only its
judge. A game whose regions are its only clue SHALL mend its division there.

#### Scenario: A judge that can be met

- **WHEN** a mend reports that it succeeded
- **THEN** the game's deductions leave no cell open on the division it left,
  and every region is connected and holds at least the least size

#### Scenario: A judge that cannot be met

- **WHEN** no division within the least size satisfies the judge
- **THEN** the mend reports that it failed, and does not loop

#### Scenario: A second answer

- **WHEN** the judge's search meets a second answer
- **THEN** the next cell moved is one the judge says breaks it
