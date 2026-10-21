# repo-layout Specification Delta — add-edges-skeleton

## ADDED Requirements

### Requirement: An edges game is stamped from a skeleton of its own

The repository SHALL hold a second skeleton, `src/skeleton/edges/`, a small game whose player draws lines along the edges between squares, written on the engine's square-edge geometry, line drag and edge hint marks, and `scripts/new-game.sh <gameId> edges` SHALL stamp a game from it as it does from the grid skeleton.

#### Scenario: Scaffolding an edges game

- **WHEN** a contributor runs `scripts/new-game.sh loops edges`
- **THEN** `src/games/loops/` holds the edges skeleton's modules and tests, named for the new game, and the copy plays
