## REMOVED Requirements

### Requirement: An untiered game's board loads unless finishesByDeduction refuses it

**Reason**: it made the hook optional, and a game that left it out loaded every
board that parsed. Palisade, Signpost, Crossing, Sticks, Filling, Mosaic,
Pattern, Separate and ABCD did.

**Migration**: "An untiered game says whether deduction finishes a board", which
requires the answer and keeps the Mines scenario.

## ADDED Requirements

### Requirement: An untiered game says whether deduction finishes a board

Every game without a difficulty contract SHALL implement `finishesByDeduction`,
and `registerGame` SHALL throw for one that does not. A description of such a
game SHALL load exactly when `finishesByDeduction` answers yes for the board's
opening state, and SHALL otherwise be refused with `DESC_NOT_DEDUCIBLE`.

#### Scenario: An untiered game's board that needs a guess

- **WHEN** a Mines game ID names a layout and first click from which the
  numbers do not determine every square
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE`, as is a save of that board

#### Scenario: A board with no clues

- **WHEN** the Palisade game ID `5x5n5:a`, a board with no clues, is opened
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE`, and no hint is asked of it

#### Scenario: A game that does not answer

- **WHEN** a game with no difficulty contract and no `finishesByDeduction` is
  registered
- **THEN** `registerGame` throws, naming the game

### Requirement: A tiered game does not answer a second time

A game with a difficulty contract SHALL NOT implement `finishesByDeduction`,
and `registerGame` SHALL throw for one that does: its boards are held to its
tiers, and nothing would read the second answer.

#### Scenario: A tiered game with both

- **WHEN** a game with a difficulty contract and a `finishesByDeduction` is
  registered
- **THEN** `registerGame` throws, naming the game

### Requirement: The engine provides an untiered game's two usual answers

The engine SHALL provide `hintAndSolveFinish`, for a game whose hint or solver
deduces: yes exactly when the game's `solve` answers the board and its `hint`,
followed from the opening a whole plan at a time, ends on a solved board. It
SHALL provide `nothingToDeduce`, which says yes to every board, for a game
whose board is moved, searched or guessed.

#### Scenario: A board Solve finishes and the hint does not

- **WHEN** the Sticks description `1aB_1_2bBcB1aB3cB_1a3aB0a1` of a 5x5 board,
  which its `solve` returns a move for and its hint stops partway through, is
  loaded
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE`

#### Scenario: A sliding puzzle

- **WHEN** a Fifteen game ID names any arrangement its parser reads
- **THEN** `finishesByDeduction` answers yes, and the board loads

### Requirement: An untiered game's answer is held to what the game is

A guard SHALL hold `nothingToDeduce` to the game's own code: the untiered games
that answer it SHALL be exactly those whose code cannot end a hint with the
deduction-exhausted refusal, itself or through an engine helper that returns
it. For every untiered game that answers otherwise, the guard SHALL hold one
description the game reads and refuses with `DESC_NOT_DEDUCIBLE`.

#### Scenario: A deductive game answers that it deduces nothing

- **WHEN** an untiered game whose hint can return the deduction-exhausted
  refusal declares `nothingToDeduce`
- **THEN** the guard fails, naming the game

#### Scenario: A test of a game's own that always says yes

- **WHEN** an untiered game's `finishesByDeduction` answers yes for the
  description the guard holds for it
- **THEN** the guard fails, naming the game and the description
