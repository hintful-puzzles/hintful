## MODIFIED Requirements

### Requirement: Mines finishes by deduction as its hint's plan

The game SHALL implement `finishesByDeduction` as the engine's walk of its
hint (`hintFinishes`), played from the first click, opening every safe square.
A board not laid out yet SHALL pass: it will be laid out to finish from
whichever square is opened first. A board already won SHALL pass.

#### Scenario: A board not laid out yet passes

- **WHEN** `finishesByDeduction` is asked of a board whose first square has not
  been opened
- **THEN** it answers that the board finishes

#### Scenario: A board its first square wins

- **WHEN** the first click on a `9x9n1` board opens every safe square
- **THEN** `finishesByDeduction` answers that the board finishes, the game ID
  the board then shows opens it again, and its save restores

## ADDED Requirements

### Requirement: A Mines description's first square has no mine in it or beside it

`newState` SHALL refuse a laid-out description whose first square holds a mine
or has one beside it, with a sentence of the game's own that says so. No
generator writes one: upstream's and this one keep that 3×3 block clear.

#### Scenario: A mine beside the first square

- **WHEN** `1,0,u800000000000000000000`, one mine at the top-left square, is
  read on a 9×9 grid
- **THEN** it is refused as a first square that is a mine or has one beside it

#### Scenario: The first square is the mine

- **WHEN** `0,0,u800000000000000000000` is read on a 9×9 grid
- **THEN** it is refused with the same sentence, and not as a board that needs
  trial and error

#### Scenario: A mine two squares away

- **WHEN** `2,0,u800000000000000000000` is read on a 9×9 grid
- **THEN** it reads
