# mosaic Specification

## Purpose
Mosaic, the puzzle of deciding every square, marked or blank, so that each
number counts the marked squares in the three-by-three block centered on it:
boards solvable by deduction, toggle and paint moves, and a mistake check
against the deduced solution.

## Requirements

### Requirement: Mosaic game implements the Game interface

The engine SHALL provide a registered `mosaic` game implementing `Game`: a
grid-fill puzzle in which a numeric clue states how many cells of its 3×3
neighborhood, itself included, are marked, and the player decides every cell,
marked or blank. The game SHALL provide `statusbarText`, `solve` and
`textFormat`.

#### Scenario: The game is registered with its hooks

- **WHEN** the registry is asked for `mosaic`
- **THEN** it returns a game that has `statusbarText`, `solve` and `textFormat`

### Requirement: Mosaic's parameters and their encoding

Params SHALL be `width`, `height` and `aggressive`, which asks for harder
generation by clue minimization and defaults to true. They SHALL encode as
`{w}x{h}`, with an `h{0|1}` suffix in the full encoding when `aggressive`
differs from its default.

#### Scenario: Params round-trip

- **WHEN** params `{ width: 10, height: 8, aggressive: true }` are encoded in
  full
- **THEN** the result is `10x8` (default aggressiveness elided)
- **AND** `{ width: 50, height: 50, aggressive: false }` encodes to `50x50h0`
- **AND** decoding each string round-trips the params

### Requirement: Mosaic's presets and type summary

The game SHALL offer six presets: 3×3, 5×5, 10×10, 15×15 and 25×25 with
aggressive generation, and 50×50 without it. The type summary SHALL render
through the `width`, `height` and `aggressive-generation` config keys, with
`aggressive` surfaced as a boolean.

#### Scenario: The largest preset is not aggressive

- **WHEN** the presets are listed
- **THEN** the 50×50 preset has `aggressive` false and every other preset has
  it true

### Requirement: Mosaic's size limits

A board narrower or shorter than 3 SHALL be refused, by the engine, from the
bounds the game declares on its width and height fields. `validateParams`
SHALL refuse a board of more than 10000 tiles.

#### Scenario: Invalid params are rejected

- **WHEN** the params of a 2×3 board, or of a board of 101×100 cells, are
  checked
- **THEN** each is refused with a non-null error string
- **AND** a 3×3 board and a 100×100 board are accepted

### Requirement: Mosaic descriptions are run-length clue grids

The desc SHALL encode the board in scan order: a digit `0`-`9` for each shown
clue and a letter `a`-`z` for each run of 1-26 hidden cells. A desc holding
any other character, or one whose decoded length differs from `width*height`,
SHALL be refused.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded from the
  resulting board
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc with an invalid character, or with a decoded length
  mismatching the params, is checked
- **THEN** the check returns a non-null error

### Requirement: A Mosaic game's states share one clue board

`newState` SHALL parse the desc into a clue board that is frozen and shared by
reference across all states of the game. Every cell SHALL start unmarked, so
the count of clues left equals the number of shown clues.

#### Scenario: A move keeps the board

- **WHEN** a move is executed on a state
- **THEN** the resulting state holds the same board object as the one it came
  from

### Requirement: Mosaic generates deduction-solvable boards

`newDesc` SHALL generate a random image of marked and blank cells, one
`randomBits` bit per cell, and compute every cell's clue, a border cell
counting only its in-bounds neighbors. A clue is "full" when it fills its
neighborhood (9 interior, 6 edge, 4 corner) and "empty" at 0. `newDesc` SHALL
regenerate until the board has a usable starting deduction and the deductive
solver, visiting clues in shuffled order, completes it.

#### Scenario: Generated boards are valid and solvable

- **WHEN** `newDesc` runs for a seeded RNG across several sizes with
  aggressive generation on and off
- **THEN** every desc is accepted as a description of its params
- **AND** the deductive solver solves every resulting board from its visible
  clues alone

### Requirement: Mosaic hides the clues a board does not need

Once a generated board is solvable, `newDesc` SHALL hide every clue whose
deduction never narrowed anything. In aggressive mode it SHALL additionally
try hiding each remaining clue, in random order, and SHALL revert any hide
that makes the board unsolvable.

#### Scenario: An aggressive board still solves

- **WHEN** a board is generated with aggressive generation on
- **THEN** the deductive solver solves it from the clues left showing

### Requirement: Mosaic marks cells via toggle and straight-line paint moves

A `MosaicMove` SHALL be one of: toggle a cell, by one step or by two; paint a
straight run of cells with a captured target state; fill a hint step's cells
with one mark; or solve. `executeMove` SHALL be pure and SHALL throw on an
out-of-bounds target. One step of a toggle takes a cell around the cycle
unmarked, marked, blank; two steps are the right button's and select2's way
round it.

#### Scenario: Toggling cycles a cell

- **WHEN** a cell is toggled three times (single steps)
- **THEN** it passes marked → blank → unmarked

#### Scenario: A double toggle goes the other way

- **WHEN** an unmarked cell is toggled by two steps
- **THEN** it is blank

### Requirement: A Mosaic toggle cycles a mark and a paint fills only unmarked cells

A toggle SHALL strip any `SOLVED` or `ERROR` overlay from its cell and then
cycle the cell's mark. A paint SHALL set only the still-unmarked cells along
its run. The game SHALL make no `paint` move of its own, and SHALL still
replay one from a saved game.

#### Scenario: Painting fills only unmarked cells

- **WHEN** a paint move covers a run containing a marked cell and unmarked
  cells, painting blank
- **THEN** the unmarked cells become blank and the already-marked cell is
  unchanged

### Requirement: Mosaic flags a satisfied clue and a contradicted one

After each toggle, paint or fill the game SHALL reflag every clue the move
affects: `SOLVED` when the clue is exactly satisfied with no cell of its
neighborhood unmarked, and `ERROR` when it is overcommitted, with more cells
marked than the clue or too few cells left that could be. The count of clues
left SHALL follow the marks.

#### Scenario: A satisfied clue grays out and a contradicted clue reddens

- **WHEN** a clue's neighborhood is fully determined with exactly the clue's
  count marked
- **THEN** the clue carries the `SOLVED` flag (drawn gray)
- **AND** when more cells are marked around a clue than its value, it carries
  the `ERROR` flag (drawn red)

### Requirement: A Mosaic press toggles a cell and a drag repeats it

A pointer press SHALL toggle the cell it lands on, and a drag on from it SHALL
be the engine's: every further cell the pointer passes that held what the
pressed cell held SHALL take the same toggle, in any direction. So a drag from
an unmarked cell lays a mark and a drag from a marked cell clears marks, and
the whole drag SHALL be one step of Undo.

#### Scenario: A drag from a marked cell clears marks

- **WHEN** the player presses a marked cell with the primary button and drags
  across a marked cell and an unmarked cell
- **THEN** both marked cells become blank and the unmarked cell is left as it
  was

### Requirement: Mosaic's keyboard, margin and finished board

A keyboard cursor with select and select2 SHALL mirror the two click
behaviors. A click in the margin SHALL be ignored. Once the board is complete,
the game SHALL accept only cursor movement.

#### Scenario: A finished board takes no click

- **WHEN** the board is complete and the player clicks a cell
- **THEN** no move is made
- **AND** an arrow key still moves the cursor

### Requirement: Mosaic is complete when every clue is satisfied

Whether the board is complete SHALL be judged from the board itself, every
clue satisfied with no cell of its neighborhood unmarked, so a solve move
needs no completion bookkeeping of its own. A completed board SHALL report
`status` `"solved"`, show `COMPLETED!` in the status bar and play a flash.

#### Scenario: Completing every clue solves the game

- **WHEN** the last clue becomes satisfied
- **THEN** no clue is left, `status` returns `"solved"`, the status bar reads
  `COMPLETED!`, and a 0.5s flash plays

### Requirement: Mosaic's Solve applies the deduced solution

The Solve command SHALL run the deductive solver on the clue board and apply
the full solution, its cells flagged solved and the status bar reading
`Auto-solved.`. It SHALL fail with an error when deduction cannot complete the
board.

#### Scenario: Solve completes the board

- **WHEN** the Solve command runs on a generated board
- **THEN** every cell is determined, `status` returns `"solved"`, and the
  status bar reads `Auto-solved.`

### Requirement: Mosaic checks mistakes against the deduced solution

`findMistakes` SHALL return every cell the player has determined whose mark
contradicts the deduced solution, and each SHALL be drawn with an
error-colored outline overlay. It SHALL return no mistakes when deduction
stalls or when the marks are consistent.

#### Scenario: findMistakes flags a wrong mark

- **WHEN** the player marks a cell that is blank in the solution and Check &
  Save runs
- **THEN** `findMistakes` returns that cell
- **AND** a correctly-marked board returns no mistakes

### Requirement: Mosaic draws its marks as a piece and a cross on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface. Every cell SHALL
have the same surface whatever its mark, and the line between cells SHALL be
the collection's thin surface grid. A marked cell SHALL hold the collection's
shaded piece, inset on its cell. An unmarked cell SHALL be plain surface.

#### Scenario: The three marks are told apart without a fill

- **WHEN** a board holding a marked cell, a blank cell and an unmarked cell is
  drawn
- **THEN** all three cells are filled with the same surface color
- **AND** the marked cell holds the shaded piece, the blank cell holds a cross
  and the unmarked cell holds neither

### Requirement: A blank Mosaic cell carries a cross that leaves its number the middle

A blank cell SHALL hold no piece and no fill of its own. It SHALL carry the
collection's ruled-out cross: in the middle of the cell, or small in a corner
of it where the cell has a number, so that the number keeps the middle.

#### Scenario: A blank cell's cross and its number both read

- **WHEN** a blank cell that has a number is drawn
- **THEN** the cross is small and lies wholly to the right of the number's
  center and wholly above it

### Requirement: A Mosaic number reads over whatever its cell holds

A cell's number SHALL be drawn over whatever the cell holds and SHALL read
against it in both color schemes: on the shaded piece it is drawn in a color
that does not invert with the scheme. A satisfied number SHALL be drawn grayer
than an unsatisfied one on every kind of cell, the piece included.

#### Scenario: A satisfied number grays on the piece and off it

- **WHEN** a satisfied number is drawn on a marked cell
- **THEN** it is drawn in a different color from an unsatisfied number on a
  marked cell
- **AND** a satisfied number on a blank cell is drawn in a different color
  from an unsatisfied number on a blank cell

### Requirement: A contradicted Mosaic number is red, and a badge on the piece

A contradicted number SHALL be drawn in the error color on bare surface. On
the shaded piece it SHALL be drawn as a badge: a disc in the error color under
the number.

#### Scenario: A contradicted number on a marked cell

- **WHEN** a marked cell's number has more marked cells around it than its
  value
- **THEN** a disc in the error color is drawn on the piece, and the number
  over the disc

### Requirement: Mosaic names no hue of its own for either mark

The game SHALL name no hue of its own for either mark: its hint sentences, its
control words and its hint-mark legend SHALL say the engine's words for a
shaded cell and for a cell known not to be shaded, and its help page SHALL
name the shaded color by placeholder.

#### Scenario: A hint names the mark by the engine's word

- **WHEN** a hint step concludes that squares must be marked
- **THEN** its sentence says the engine's word for the shaded color
- **AND** a step that concludes squares must be blank says the engine's word
  for a cell known not to be shaded
