# samegame Specification

## Purpose
Same Game, the puzzle of clearing the board by removing connected groups of one
color, scoring more for larger groups. This capability specifies its port to the
TS engine: guaranteed-soluble and random generation, removal with scoring and
compaction, and two-click selection, keyboard input and a live score.

## Requirements

### Requirement: Same Game implements the Game interface

The engine SHALL provide a registered `samegame` game implementing
`Game<SamegameParams, SamegameState, SamegameMove, SamegameUi,
SamegameDrawState>`: a block-clearing puzzle on a `w×h` grid of colored tiles
(colors `1..ncols`, `0` = empty) in which the player removes
orthogonally-connected groups of one color. Params SHALL be `w`, `h`, `ncols`
and `scoresub` (1 or 2), encoded `{w}x{h}c{ncols}s{scoresub}` with lenient
decode. Decoding SHALL leave upstream's trailing `r` unread, which asks for
colors scattered at random with no promise the grid can be cleared, and
encoding SHALL never write it. Five presets — `5×5`, `5×10`, `10×15` (all 3 colors), `10×15` and
`15×20` (4 colors), all `scoresub = 2` — SHALL be offered: upstream's
sizes, turned to draw taller than wide. Tiles fall down and emptied columns
close leftward, so a board of Same Game SHALL NOT declare `transposeParams`: a
tall board is a different game from a wide one, not the same one turned.
`validateParams` SHALL require `w ≥ 1`, `h ≥ 1`, `3 ≤ ncols ≤ 9`,
`scoresub ∈ {1,2}` and `w·h > 1`. The game SHALL provide `statusbarText` and `textFormat`, and SHALL NOT provide `solve`, `hint`, or `findMistakes`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 15, h: 10, ncols: 4, scoresub: 2 }` are
  encoded with `full = true`
- **THEN** the result is `15x10c4s2`
- **AND** decoding `15x10c4s2` round-trips those params
- **AND** decoding `15x10c4s2r` yields the same params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `ncols: 2`
- **THEN** it returns a non-null error string
- **AND** a `1×1` grid also returns a non-null error string

### Requirement: Same Game removes connected groups, scores, and compacts

A `SamegameMove` SHALL be `{ type: "remove"; tiles: number[] }` carrying the grid
indices to clear. `executeMove` SHALL be pure: it SHALL range-check each index,
set those tiles empty, add `max(0, n − scoresub)²` to the score (where `n` is the
number of removed tiles), let remaining tiles fall to the bottom of their
columns, shuffle non-empty columns to the left, and recompute `impossible` (no
two orthogonally-adjacent tiles share a color). `status` SHALL return `"solved"`
when the grid is empty and otherwise `"ongoing"` — a no-moves-left
(`impossible`) position is NOT `"lost"` (it is rescuable by Undo).

#### Scenario: Removing a group scores and compacts

- **WHEN** a `remove` move clearing a group of 4 tiles is executed with
  `scoresub = 2`
- **THEN** the new state's score increases by `(4 − 2)² = 4`
- **AND** tiles above the cleared cells have fallen and empty columns have moved
  right, and the source state is unmutated

#### Scenario: Clearing the last tiles wins

- **WHEN** a `remove` move empties the final non-empty tiles
- **THEN** the new state's grid is empty and `status()` returns `"solved"`

#### Scenario: A stuck board is impossible but not lost

- **WHEN** a state has no two orthogonally-adjacent same-color tiles and is not
  empty
- **THEN** that state's `impossible` flag is set and `status()` returns
  `"ongoing"`

### Requirement: Same Game supports two-click selection, keyboard input, and a live score

`interpretMove` SHALL implement the two-click select-then-remove gesture using a
selection held in `SamegameUi` (not in the game state): clicking a removable tile
(part of a same-color group of size ≥ 2) SHALL flood-select the connected region
and return a UI update; clicking again on that selection (left button or
`CURSOR_SELECT`) SHALL emit the `remove` move; right-clicking or `CURSOR_SELECT2`
on the selection SHALL clear it (UI update); clicking an empty or lone tile SHALL
select nothing. A keyboard cursor SHALL move with the cursor keys and act at the
cursor on select. `changedState` SHALL clear the selection on every real
transition. `statusbarText` SHALL show `"Score: N"`, extended to `"...  Selected:
K (P)"` while a region of `K` tiles worth `P = max(0, K − scoresub)²` points is
selected, the engine's completion words followed by `"Score: N"` when complete
(`"COMPLETED! Score: N"`), and `"Cannot move! Score: N"` when impossible.

#### Scenario: First click selects, second click removes

- **WHEN** a removable tile is clicked
- **THEN** `interpretMove` returns a UI update, the connected same-color region
  is selected in the Ui, and `statusbarText` reports the selected count and its
  potential points
- **WHEN** a selected tile is then clicked again
- **THEN** `interpretMove` returns a `remove` move carrying the selected indices

#### Scenario: A lone tile cannot be selected

- **WHEN** a tile with no same-color orthogonal neighbor is clicked
- **THEN** no selection is made and no `remove` move is produced

#### Scenario: The selection clears across a move

- **WHEN** a `remove` move is applied
- **THEN** `changedState` leaves the Ui with no active selection

### Requirement: Same Game generates boards that can be cleared

`newDesc` SHALL produce the board as a comma-separated list of `w·h` color
integers in row-major order, using the inverse-move generator (repeatedly
inserting a verified connected blob whose removal reproduces the prior grid, so
the board is clearable). No parameter SHALL deal a grid that may not be
clearable.
`validateDesc` SHALL reject a desc without exactly `w·h` comma-separated
integers, or any integer outside `0..ncols`. `newState` SHALL parse the desc into
the tile grid with score 0 and the complete/impossible flags clear.

#### Scenario: A generated description is well-formed

- **WHEN** `newDesc` runs for a preset with a fixed seed
- **THEN** `validateDesc` accepts it and `newState` parses `w·h` tiles

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with too few numbers, or one
  containing a color greater than `ncols`
- **THEN** it returns a non-null error string
