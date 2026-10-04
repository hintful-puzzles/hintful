## ADDED Requirements

### Requirement: A board deduction cannot finish loads only on a tier that permits search

The engine SHALL refuse to load a description, whoever wrote it, when deduction
alone cannot finish its board and the params it loads under do not state a tier
named Unreasonable (refused with `DESC_NOT_DEDUCIBLE`). The verdict SHALL be
part of `loadDesc`. For a game with a difficulty contract, the board SHALL load
when the contract's solver solves it at some cap, whatever tier its params
state. For a game without one, the board SHALL load unless the game implements
`finishesByDeduction` and that returns false for the board's opening state. A
game that declares `nonUniqueTiers` SHALL NOT be asked. Where a save carries a
private description, the midend SHALL ask the public one.

No game SHALL offer a parameter that switches its generator's checks off: a
board that needs trial and error is dealt only at a tier named Unreasonable,
and no board is dealt that cannot be solved.

#### Scenario: A board no tier solves

- **WHEN** a Pearl game ID names a board neither tier's rules finish
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE` under either tier's params,
  and nothing throws

#### Scenario: A board harder than its ID says

- **WHEN** a board that solves only at a tiered game's third cap is loaded under
  params stating its first tier
- **THEN** it loads

#### Scenario: A board on a tier that permits search

- **WHEN** a board no cap solves is loaded under params stating a tier named
  Unreasonable
- **THEN** it loads

#### Scenario: An untiered game's board that needs a guess

- **WHEN** a Mines game ID names a layout and first click from which the
  numbers do not determine every square
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE`, as is a save of that board

#### Scenario: A game ID upstream wrote with its checks on

- **WHEN** a desc from a frozen upstream fixture is loaded under the params its
  fixture states
- **THEN** it loads, and a fixture naming an option that switches a generator's
  checks off names it at the value that leaves them on
