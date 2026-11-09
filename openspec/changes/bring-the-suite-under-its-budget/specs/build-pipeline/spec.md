## ADDED Requirements

### Requirement: A game's deep tier runs where the game is worked on, never in CI

A game's own test files SHALL keep, in CI, a shallow form that holds each of the game's rules on at least one board. What only adds confidence about that one game, such as more boards, larger boards and longer walks, SHALL be its deep tier. The deep tier SHALL run in a local hook whose scope names the game, in a hook that runs the file whole, in a run by hand and in the slow tier, and SHALL NOT run in CI. CI's time SHALL go to the engine's tests and to the cross-game guards' cases of every game.

#### Scenario: A commit stages a game

- **WHEN** a commit stages a change to one game
- **THEN** its hook runs that game's own files with their deep tier, and CI later runs them without it
- **BECAUSE** with dozens of games to come, a game's depth is the work of the session that works on that game, and CI's time is the engine's

#### Scenario: A push carries a change to shared code

- **WHEN** a push carries a change to the engine that a game's code reaches
- **THEN** the push runs that game's own files with their deep tier, up to the push's ceiling
- **BECAUSE** an engine change can break a game's deep property, and the push is the last run that will look for it
