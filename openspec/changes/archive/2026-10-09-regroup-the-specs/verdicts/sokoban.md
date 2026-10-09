# Verdicts: sokoban

## reword `sokoban`: Sokoban generation is deterministic

The sentence "A level SHALL be generated exactly as upstream generates it" goes as `port`. `docs/games/testing.md` § "The frozen differentials" says none of the frozen fixtures is kept for parity's sake and one may be deleted with its test, and `docs/doctrine.md` § "Upstream" says the app hands out boards and never seeds, so changing which board a seed deals breaks nothing. For the same reason the clause that shared game IDs stay reproducible is dropped: a game ID carries the board. `sokoban-differential.test.ts` still pins the stream as a net under refactoring, which that guide describes. That one seed gives one board stays.

### Requirement: Sokoban generation is deterministic

Sokoban generation SHALL use a reverse-move generator over the shared seeded RNG, so
that a given seed always produces the same board.

#### Scenario: The same seed reproduces the same board

- **WHEN** the same size and seed are used twice to generate a game
- **THEN** both runs produce the identical description

#### Scenario: A new game produces a solvable board

- **WHEN** a new game is generated at a legal size
- **THEN** a board is produced with exactly one player and at least one barrel and
  target, and the board is solvable (it is constructed by reversing a solution)

## keep `sokoban`: Sokoban's search keeps to the pushes into a fenced floor only where it has to be opened

It is a rule and not only how the search is built: it is the condition under which leaving pushes out is sound, and "Sokoban's search leaves out only what a finishing line can do without" refers to it by name for what may be left out. A session editing `searchPushes` in `src/games/sokoban/solver.ts` checks the change against it.

## keep `sokoban`: Sokoban rendering

The clause is true and it is the cue: `src/games/sokoban/render.ts` draws a pit and a deep pit as the same disc in two palette slots (`COL_PIT`, a step off the floor, and `COL_DEEP_PIT`, ink), so color is all that tells one from the other.

## note sokoban: the cut sentence on no mistake check stays cut

"Sokoban has no findMistakes because any line of pushes wins" is held by `notApplicable.findMistakes` in `src/games/sokoban/index.ts`, with that reason, which the engine reads and the help page shows. It is not restored. The same verdict is given here for Inertia's "Inertia has no mistake check" and Same Game's "Same Game does not turn its board".

## note sokoban: "Check & Save SHALL ask the hint" is already gone

The entry R sokoban 1 names a sentence of "Sokoban game implements the Game interface", a requirement the pruning removed. The rule is the midend's for every game and `engine-hints`, "The check asks the hint whether a position is a dead end", states it. There is nothing left in `sokoban` to move.
