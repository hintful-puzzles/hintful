## MODIFIED Requirements

### Requirement: A game can supersede its game description mid-play

The engine SHALL let a game whose board is not settled until play begins say
which description names the board a state is on (`Game.supersededDesc`,
upstream `midend_supersede_game_desc`), without games holding a midend
back-reference and without `executeMove` losing purity. The answer SHALL be a
function of the state alone, and `null` SHALL mean the description the board
started from.

The description SHALL follow the position. The midend SHALL ask it of the state
in play, and SHALL emit its id-change notification whenever a step, forward or
back, moves the board onto another description, so that the shareable game ID
always names the board on screen. Undoing past the move that settled the board
SHALL return the starting description.

Restart SHALL enter the board the description in play opens, which for a
settled board is not the state its history began from.

A save SHALL carry the description in play, and beside it, as its private
description, the one the board started from wherever the two differ. Restoring
SHALL build the first state from the private description when there is one and
replay the move log onto it, and SHALL ask the description in play, not the
private one, whether its board can be finished. The move that settles a board
SHALL carry what it settled, so that a replay derives nothing again.

#### Scenario: Mines' first click generates the real layout

- **WHEN** a game's first move lays out the actual board (first-click-never-a-mine)
- **THEN** the id-change notification fires, and the shareable game ID names the
  real board

#### Scenario: Undoing the settling move

- **WHEN** the player undoes the move that settled the board
- **THEN** the id-change notification fires with the description the board
  started from
- **AND** Redo fires it again with the settled board's

#### Scenario: Restart after supersession

- **WHEN** the player restarts on a board whose description was superseded
- **THEN** the game restarts as the superseded description opens, not on the
  pre-supersession placeholder

#### Scenario: Save and restore mid-game

- **WHEN** the player saves after supersession and later restores
- **THEN** the restored game is built from the description the board started
  from, replays cleanly to the saved position, and names the settled board

#### Scenario: A replay settles nothing again

- **WHEN** a save's settling move carries a board other than the one the game
  would settle today
- **THEN** the restored game is on the board the move carries
