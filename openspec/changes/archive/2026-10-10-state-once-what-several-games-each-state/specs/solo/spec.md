## MODIFIED Requirements

### Requirement: Solo flags mistakes against its unique solution

The game SHALL implement `findMistakes`: re-solve from the given cells (and,
for killer, the cage sums) to the unique solution, and return every player cell
that contradicts it: a filled cell whose digit is wrong (`"cell"`), and an
empty cell whose non-empty pencil notes have crossed out its solution digit
(`"note"`). When the board is not uniquely solvable from the givens the result
SHALL be empty.

#### Scenario: A wrong digit and a wrong note are flagged

- **WHEN** the player fills a cell with a digit other than its solution value, or
  pencils out the solution digit in an empty cell
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose notes merely carry extra (non-solution) candidates is not
  flagged

### Requirement: Solo exposes pencil-mark preferences

The game SHALL expose, via the `prefs` hook, a sticky-pencil-mode preference,
an auto-pencil preference, and a keep-mouse-highlight-after-pencil preference.
With auto-pencil off, note cleanup is manual: the player removes obvious
candidates via the mark-all control or a hint.

#### Scenario: Pencil preferences are exposed with their defaults

- **WHEN** the game's preferences are read
- **THEN** they include a sticky-pencil-mode boolean defaulting to on
- **AND** an auto-pencil boolean defaulting to off
- **AND** a keep-highlight boolean defaulting to on

### Requirement: Solo provides an explained deduction hint

The game SHALL implement `hint(state, aux?, ui?)`, returning a plan of
`HintStep`s that teaches the player the next deduction in pencil-notes terms.
The plan SHALL be built by walking a working copy of the board the way a person
solves it.

#### Scenario: A region elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a placed
  digit, or a deductive technique, rules a digit out of a cell
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates

### Requirement: Solo's hint marks pair each color with a shape

When a single step names two or more board-element types at once, each type
SHALL carry a stable per-game color always paired with a non-color cue: a ring
round the cell the step acts on, an outline round the cells the reason rests
on, and stripes over the region the sentence names.

#### Scenario: A strike shows its region, its cell and its candidates

- **WHEN** a strike step that names a region is shown
- **THEN** the region's cells are striped, the cell acted on is ringed, and the
  struck candidates are crossed through among its pencil marks

## REMOVED Requirements

### Requirement: Solo selects a cell by pointer or keyboard

**Reason**: Every sentence of it is the family's. The presses with the sticky preference on and off, and the repeat press, are `engine-notes`, "The button and the sticky preference decide the mode a press selects for" and "The sticky pencil toggle is a mode switch, not a selection"; that Solo starts sticky is `engine-notes`, "Every member offers the keep-highlight preference, defaulted the same way"; the select key is `engine-notes`, "The select key on a showing highlight toggles pencil mode"; and the cursor keys are `engine-input`, "One arrow press reveals the cursor and moves it". Solo's `interpretMove` hands the press to `pressNoteTakingCell` and the key to `toggleNoteTakingMode` and adds nothing. Its three scenarios are the shared requirements' own.

### Requirement: Every hint step is monotone progress

**Reason**: `engine-candidate-hints`, "A candidate plan's step is never undone by a later
one", holds the first sentence. `engine-hints`, "Only a searching hint is
excused the walk's promise" (a hint never gives up on a solvable board) and
"The hint walk SHALL cover every preset a game offers" (from any reached
position, on every preset, so Solo's standard, X, jigsaw and killer boards),
hold the second; and `engine-hints`, "A displayed hint step never references
already-resolved state", holds the skip of what the board already shows.
