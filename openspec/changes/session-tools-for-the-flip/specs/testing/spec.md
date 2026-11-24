## ADDED Requirements

### Requirement: A flip's leftovers are reported by one command

The repository SHALL provide a command that, given a game being moved to its description, reports what the move has left undone in the tree: references to the game's deleted modules, guide paths that no longer exist, snapshots the move invalidated, and any list that names the game by hand.

#### Scenario: A guide still points at a deleted file

- **WHEN** a game's hand-written module is deleted and a guide still cites its path
- **THEN** the command names the guide and the path

### Requirement: A cost comparison builds its own baseline

The cost comparison SHALL accept a baseline commit, build that commit's tree itself, and remove it when done, so that no session builds a baseline by hand.

#### Scenario: A comparison against a commit

- **WHEN** the comparison is run with a baseline commit and a game
- **THEN** it reports that game's figures for both trees, and leaves no worktree behind
