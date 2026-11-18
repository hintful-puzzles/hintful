## ADDED Requirements

### Requirement: A chained verdict names where its chain began

Where Check & save judges a move that follows from the board only after
other deductions, the verdict SHALL name the deduction the chain began with
wherever a replay of the game's walk finds the earliest deduction the move
cannot be made without, and SHALL NOT name a deduction the chain does not
rest on.

#### Scenario: A chain's start is named

- **WHEN** the player's last move follows from the board in a few steps,
  then activates Check & save
- **THEN** the words name the deduction the first of those steps took

#### Scenario: No start is named that the chain does not rest on

- **WHEN** the walk cannot tell which deduction the chain began with
- **THEN** the words say the move follows a few steps on, and name none
