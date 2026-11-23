## MODIFIED Requirements

### Requirement: Rules: Towers' mistake check re-solves from its clues and givens

Towers' `findMistakes` SHALL judge the board against its one answer, which
its clues and givens decide (`described-fill-game`). A wrong tower and a note
set that lacks its height SHALL render as the same red cell overlay.

#### Scenario: A wrong tower that breaks no rule

- **WHEN** the player enters a height that repeats nothing in its row or
  column, contradicts no clue as the board stands, and is not the answer's
- **THEN** `findMistakes` includes that cell, though nothing is drawn as an
  error before the check

### Requirement: Params: A Towers params string is its declared codec's, and one with no difficulty is Easy

Towers' params, a grid size and a tier, and their encoding SHALL be those its
description states (`described-fill-game`), with no departure from the codec
grammar. The tier letters SHALL be `e`, `h`, `x` and `u` for Easy, Normal,
Tricky and Unreasonable, upstream's. A params string that carries no tier
SHALL decode to Easy. The menu SHALL offer 4×4, 5×5 and 6×6 at every tier,
and the default board SHALL be 5×5 Easy.

#### Scenario: The tier letters are not the tiers' initials

- **WHEN** `5dh` is decoded
- **THEN** it is a 5×5 board at Normal, whose short form is `5`
- **AND** `4` decoded is a 4×4 board at Easy

### Requirement: Params: A 3×3 Towers is not dealt above Normal

When a board is to be dealt, a 3×3 board at Tricky or Unreasonable SHALL be
refused, in the collection's sentence for a size that has no board of the
tier, because no 3×3 board needs more than Normal.

#### Scenario: A 3×3 Tricky is asked for

- **WHEN** a board of `3dx` is to be dealt
- **THEN** it is refused: "No 3x3 puzzle is Tricky."
- **AND** a board of `3dh` is dealt

### Requirement: Description: Towers' reading of a description refuses a malformed one

The reading of the desc SHALL refuse the wrong number of clue fields, a clue
out of `1..w`, an out-of-range given, grid data of a length other than `w²`,
a `_` anywhere but between two adjacent givens, and clues and givens that
have no answer or more than one.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with too few clue fields, or a grid of the wrong length, is
  read
- **THEN** it is refused with an error and no state is built

#### Scenario: Two facing clues of the grid size

- **WHEN** a 4×4 desc has 4 at both ends of a row
- **THEN** it is refused as contradictory, since both ends would hold height 1

### Requirement: Generation: An Easy Towers board keeps every clue

An Easy board SHALL keep every one of its `4w` edge clues, and an Easy board
of up to 5×5 SHALL show no given, as upstream's; a deal whose clues alone do
not finish at Easy SHALL be drawn again. Above Easy the deal SHALL hide grid
givens first and then clues, each while the board stays solvable at its
tier.

#### Scenario: An Easy board and a Normal one

- **WHEN** a 5×5 board is dealt at Easy
- **THEN** every one of its `4w` clue fields holds a number and no square
  holds a given
- **AND** a board dealt above Easy may leave clue fields empty

### Requirement: Solver: Towers' ladder is its description

Towers' solver SHALL run the ladder of `towers.description.yaml`: the full
line, the tallest nearest and the facing pairs, which place towers; the clue
bounds and the arrangements, which strike heights; and the Latin library's
it places, each at the tier the description gives it, checked sound against
the description's rules, a Latin square whose clues count the towers seen
along their lines. The search above them stays the engine's.

#### Scenario: The facing pairs place their towers once

- **WHEN** a board has two facing pairs that sum to one more than its size,
  and the solver is asked at any cap
- **THEN** its first firing places the tallest tower in both lines, recorded
  with each pair
- **AND** no later call of the facing technique is a firing, since both
  towers then stand

#### Scenario: A height no arrangement allows is struck at Hard

- **WHEN** no filling of a clue's line from its cells' candidates, every
  height once, that shows the clue's count puts a height in a cell, at a cap
  of Normal or above
- **THEN** the solver strikes that height from that cell, in a firing of its
  own for the cell, recorded with the clue

### Requirement: Controls: An outside clue is struck through by a click or a modified cursor key

A press on an outside clue, a drag across outside clues, or a cursor key held
with Shift or Ctrl that points onto one, SHALL toggle that clue's
struck-through ("done") state, as every born game's clue marked done
(`described-fill-game`).

#### Scenario: Clue strike toggles

- **WHEN** the player clicks an outside clue
- **THEN** that clue's done flag is toggled, and it is drawn gray

### Requirement: Hint: Towers' hint is the shared candidate plan over rows and columns

Towers' hint SHALL be the candidate walk every born game with notes hints
through (`described-fill-game`), over rows and columns, with no departure.
Its techniques SHALL be its description's, each saying its clue in words
the description states, a value called a height. What its marks stand for
SHALL be the legend's (`hint.marks`).

#### Scenario: A single on a Towers board

- **WHEN** a step places a height because it fits one cell of its row
- **THEN** its sentence calls the value a height, and reasons from no clue

### Requirement: Hint: Towers' own rung is the clue lines that need no notes

The clue lines that need no notes SHALL be techniques that place and read no
note, offered before the notes are set up: a clue equal to the grid size,
whose line climbs from 1 beside the clue ("Clue 4 sees every tower in this
line, so heights must climb 1, 2, … from the clue"), and a clue of 1, which
has the tallest tower beside it ("Clue 1 sees one tower in its line, so the
tallest must stand next to it").

#### Scenario: A full-height clue opens an empty board

- **WHEN** a hint is requested on an empty board with no notes, one of whose
  clues equals the grid size
- **THEN** the plan opens by placing that clue's line in order from the clue,
  one cell a leg, before any step that fills in notes

### Requirement: Hint: A Towers clue one short of its count keeps the short heights from the cell beside it

Where the towers a clue already sees, the placed heights from the tallest
down until one is missing, each nearer than the last, number one fewer than
the clue, the cell beside the clue holds the last tower it sees. A step SHALL
strike from that cell as many of the shortest heights as there are cells
between it and the nearest tower counted, none at or behind that tower, a
height a step ("Clue 2 already sees 1 tower in the line, so the cell nearest
it must top all between; height 1 can't").

#### Scenario: The tallest tower stands fourth from a clue of 2

- **WHEN** a clue of 2 on a 5×5 board has height 5 in the fourth cell of its
  line and no other tower in it
- **THEN** heights 1 and 2 are struck from the cell beside the clue, one for
  each of the two cells between

### Requirement: Hint: Towers' clue eliminations are tried a facing pair first and arrangements last

The deductions `hint` narrates SHALL be found in the order the description
states them, beginning again after each: the row and column placements, the
full lines, the tallest nearest and the facing pairs; then, clue by clue, the
one short of its count and the heights too near it; the row and column
singles; and only then, on a board above Easy, a clue's arrangements, ahead
of the sets. `hint` SHALL use no deduction above the board's own tier.

#### Scenario: An Easy board never hears of arrangements

- **WHEN** the hint is followed on an Easy 4×4 board with nothing entered
- **THEN** no step of the plan speaks of an arrangement, a set or a chain

### Requirement: Look: Towers tells its inks apart

The renderer SHALL color given towers, user-entered towers, struck-through
("done") clues, and errors distinctly.

#### Scenario: Two towers of one height in a row

- **WHEN** the player enters a height a second time in one row
- **THEN** both are marked in the error color, as a repeat is on every
  board of numbers

## REMOVED Requirements

### Requirement: Look: Towers repaints the neighbors a tower reaches into

**Reason**: A raised value's repaint is every born game's, stated once in
`described-fill-game` ("A born game's values may be drawn raised").

**Migration**: None; Towers draws its values raised through the engine.
