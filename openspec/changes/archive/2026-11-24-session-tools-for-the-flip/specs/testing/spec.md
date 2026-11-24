## ADDED Requirements

### Requirement: A flip's leftovers are reported by one command

The repository SHALL provide a command that, given a game being moved to its description, reports what the move has left undone, before its commit or after it: what is left in the game's directory, every file outside it citing one of the game's modules (deleted ones included), the ceiling on hand-written game code, the snapshots naming the game with the test writing each, and the guards' lines naming its id. It SHALL change nothing.

#### Scenario: A guide still points at a deleted file

- **WHEN** a game's hand-written module is deleted and a guide still cites its path
- **THEN** the command names the guide and the path, whether the deletion is committed or not

### Requirement: A cost comparison builds its own baseline

The cost comparison SHALL accept a baseline commit, check that commit out itself, and remove the checkout when it ends, however it ends, so that no session builds a baseline by hand. It SHALL offer a quick run, of one board a menu entry and one round, which says that it measured no spread.

#### Scenario: A comparison against a commit

- **WHEN** the comparison is run with a baseline commit and a game
- **THEN** it reports that game's figures for both trees, and leaves no worktree behind

#### Scenario: A comparison is interrupted

- **WHEN** the comparison is stopped by a signal while it runs
- **THEN** the checkout it made is removed and unregistered

### Requirement: A game is played in the browser by one command

The repository SHALL provide a command that plays a game's deal in Chrome on a development server of its own: input on the board, the hint walked to the solve, and screenshots of the deal, the finish and the solved board in both color schemes. It SHALL report the moves it saw, the hint's sentences, and every console error, page exception and failed request, and SHALL exit with failure where the walk did not solve the board or any of those were seen. It SHALL stop only the server it started.

#### Scenario: A game whose hint stalls

- **WHEN** the hint stops short of the solve
- **THEN** the command reports the sentence it stopped at and exits with failure
