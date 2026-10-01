## MODIFIED Requirements

### Requirement: Unruly descriptions are run-length color grids

The desc SHALL encode the immutable clue cells in scan order using upstream's
run-length alphabet: a lowercase letter advances past a run of empty cells and
places a `zero` clue, an uppercase letter does the same placing a `one` clue,
and `z`/`Z` advance 25 cells without placing a clue; the encoded positions SHALL
sum to exactly `w2·h2 + 1`. `validateDesc` SHALL reject any other character and
any desc whose decoded length differs from `w2·h2 + 1`. `newState` SHALL parse
the desc into the grid with clue cells holding their color and marked
immutable, and every other cell empty.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and the clue grid is
  re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an invalid character or a decoded
  length mismatching the params
- **THEN** it returns a non-null error string

### Requirement: Unruly marks cells via three-state cycling moves

An `UnrulyMove` SHALL place a color or empty at a cell (upstream's `P{c},{x},{y}`)
or apply a full solution grid (upstream's `S`). `executeMove` SHALL be pure and
reject an out-of-bounds or immutable-cell target; the board SHALL be reported
solved exactly while it is counts-valid plus run-valid, judged from the board however it was reached. Left-button / select on a
non-immutable cell SHALL cycle
empty → one → zero → empty; right-button / select2 SHALL cycle
empty → zero → one → empty; the `1` key SHALL place one, `0`/`2` zero, and
Backspace clear; an immutable cell SHALL be inert. A keyboard
cursor SHALL move within the grid. A click or key that would not change the
target cell SHALL produce no history move.

#### Scenario: Left and right cycle in opposite directions

- **WHEN** an empty non-immutable cell receives a left-button action, then
  another, then another
- **THEN** it passes one → zero → empty
- **AND** the same cell under three right-button actions passes zero → one →
  empty

#### Scenario: Immutable cells reject marking

- **WHEN** a marking action targets an immutable clue cell
- **THEN** `interpretMove` produces no move and the cell is unchanged

#### Scenario: Completing the board is detected

- **WHEN** a move fills the final cell of a valid solution
- **THEN** `status` returns `"solved"`, and a flash plays

### Requirement: Unruly renders the grid with live error highlighting and a completion flash

`redraw` SHALL draw each cell in its color fill (white for zero, black for one,
neutral for empty), an inset bevel on immutable clue cells, and — recomputed
each frame — error overlays: a red bar spanning any three-in-a-row run, a `!`
marker on cells of a row or column whose color count is exceeded, and (in
`unique` mode) a red bar across any pair of identical full rows or columns. A
keyboard cursor SHALL be drawn as an outline on the focused cell. On completion
a flash SHALL play, inverting filled tiles toward their highlight/lowlight in
alternating frames. The palette SHALL use the upstream color-enum index layout
so the app's dark-mode palette overrides apply unchanged, deriving the
black/white highlight and lowlight from the shared `mkhighlightSpecific` helper.

#### Scenario: A three-in-a-row reddens live

- **WHEN** three consecutive same-color cells exist in a row or column
- **THEN** `redraw` draws an error-colored bar across them without any explicit
  check action

#### Scenario: The completion flash plays once

- **WHEN** a player move transitions the board from unsolved to solved (not the
  Solve command)
- **THEN** a flash of positive duration plays and `redraw` inverts the filled
  tiles during it
