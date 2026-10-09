## MODIFIED Requirements

### Requirement: Inertia's status bar

Inertia's `statusbarText` SHALL give the remaining gem count, or `DEAD!` when
dead, and a running deaths tally, and no gem count once none remains. The
words that open the bar on a finished board, or after Solve, are the engine's
and the same in every game. The deaths tally SHALL be incremented only for a
death caused by a move the player just made on an unfinished board, so that
undoing and redoing a fatal move does not re-count it.

#### Scenario: Undo and redo do not re-count a death

- **WHEN** the player dies, undoes the fatal move, and redoes it
- **THEN** the deaths tally still reads 1

#### Scenario: The last gem is collected after a death

- **WHEN** a player who has died once and undone it collects the last gem
- **THEN** the bar reads the engine's completion words and then `Deaths: 1`,
  with no gem count

### Requirement: A hint is a nudge, and only Solve is a commitment

`hint` SHALL NOT record that the solver was used: Solve plays the whole route
and the engine records that, while a player asking for one nudge does not pay
that price. The engine's own mark that a board was helped, which it sets for
any game when a hint's step is shown and which labels the timer, is a
different record and is set here as everywhere.

#### Scenario: Asking for a hint does not brand the game auto-solved

- **WHEN** the player asks for a hint
- **THEN** the status bar does not report that the auto-solver was used

#### Scenario: A board finished after a hint

- **WHEN** the player takes one hint and then finishes the board by hand
- **THEN** the status bar reads as completed and not as auto-solved, and the
  timer shows the board as helped

### Requirement: Generated boards keep their gem candidates spread

The generator SHALL reject a grid in which some square is geometrically further
than a threshold from the nearest gem candidate, the threshold starting at 2
and relaxing by one every 50 rejections by this test, so that reachable squares
stay spread over the board. A grid refused for having too few gem candidates
SHALL NOT count toward the 50. This test SHALL run before the gems are placed.

#### Scenario: A board with a dead region is rejected

- **WHEN** a shuffled grid has enough gem candidates, but one square lies three
  squares from the nearest of them, on the generator's first attempt
- **THEN** the grid is rejected and another is shuffled
