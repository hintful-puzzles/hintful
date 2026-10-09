## ADDED Requirements

### Requirement: Flip's status bar counts the moves

Flip SHALL provide a status bar string reporting the move count.

#### Scenario: The status bar after a press

- **WHEN** the player presses a square on a fresh board
- **THEN** the status bar reports one move

## MODIFIED Requirements

### Requirement: Flip's solver finds a shortest set of presses

The Flip solver SHALL return a shortest set of presses, or report that no
solution exists for a hand-entered position. Solve SHALL press every square of
the solution in one move.

#### Scenario: Unsolvable hand-entered position

- **WHEN** the solver runs on a position with no solution
- **THEN** it reports that no solution exists rather than returning a
  move

#### Scenario: Solve is one move

- **WHEN** the player uses Solve on a board that takes several presses
- **THEN** every square is lit after one move, and one undo restores the board
  as it was

### Requirement: Flip's rulesets are Crosses and Random

Flip SHALL declare Crosses and Random as its two rulesets, each with the rule
for which squares a press flips.

#### Scenario: The help says what Random changes

- **WHEN** a player reads Flip's help page
- **THEN** its rules say which squares a press flips in Crosses and which in
  Random

## REMOVED Requirements

### Requirement: Flip's status bar counts the moves, and the board has a text format

**Reason**: Reworded in `flip` as "Flip's status bar counts the moves". The
text-format half goes as `type`, and the title with it. It said only that a
text format exists, which is the presence of `textFormat` on the game
(`ts-engine` "Solve, the status bar and text export follow from the game's
methods"); the layout of the export is stated nowhere and is a promise to no
one, since nothing saved or shared holds it. What the status bar says is
player-visible and stays.
