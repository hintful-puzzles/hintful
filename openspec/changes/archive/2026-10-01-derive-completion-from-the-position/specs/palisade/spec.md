## MODIFIED Requirements

### Requirement: Palisade detects completion and the unique-division solve

`isSolved` SHALL report a state solved iff the walls divide the grid into
connected components every of size `k`, every clue equals its cell's wall
count, and no wall lies within a single component (no stray border).
`status` SHALL report a win exactly when `isSolved` holds of the board, however
it was reached. The `solve` command SHALL run the deductive solver from the
bare rim and, on success, emit the full solution border set as a `solve` move;
the engine records that the solver was used.

#### Scenario: A correct division is complete

- **WHEN** the walls divide the grid into size-`k` regions matching all clues
  with no stray walls
- **THEN** `isSolved` returns true and `status` reports a win

#### Scenario: Solve fills a correct division

- **WHEN** the `solve` command runs on a solvable board
- **THEN** the resulting state is solved and the game reports itself solved
  with help

### Requirement: Palisade renders walls, clues, live errors, and a solve flash

`redraw` SHALL draw the grid-corner dots and background once on first draw,
then per-tile (diffed against an `Int32Array` flag cache) draw the four border
edges colored wall/no-wall/unknown, the clue text, and the half-grid cursor
box. It SHALL redden, from the current borders, any wall whose region is too
large or too small and any wall dangling within a single region, and redden a
clue whose wall count is already impossible. A 0.7-second flash SHALL play
whenever a *player* move brings the board into a solved state — including a
genuine manual completion after a prior Solve — and SHALL NOT play on the Solve
command itself. The game supplies the duration (`solvedFlash`); when it plays
is the engine's, read off the board's status.

#### Scenario: An over-large region reddens its walls

- **WHEN** the player's walls enclose a region larger than `k`
- **THEN** `redraw` emits the boundary walls of that region in the error color

#### Scenario: A player completion flashes; the Solve command does not

- **WHEN** a player move brings the board into a solved state — whether a first
  manual completion or a manual re-completion after a prior Solve
- **THEN** a 0.7-second flash plays
- **AND** none plays on the Solve command itself, nor when a move breaks a
  previously-solved board
