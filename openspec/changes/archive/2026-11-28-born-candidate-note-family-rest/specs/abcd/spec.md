## MODIFIED Requirements

### Requirement: Params: ABCD needs five letters where diagonal touching is disallowed

ABCD SHALL be played from its description alone (`described-fill-game`), and
its letter count SHALL be a number size of at least 5 under the **No diagonal
touching** modifier, at least 3 and at most 9 otherwise.

#### Scenario: Four letters and no diagonal touching

- **WHEN** parameters request four letters with no diagonal touching
- **THEN** validation rejects them with "Letters must be at least 5 with no
  diagonal touching."

### Requirement: Params: An ABCD params string is its declared codec's, and one with no difficulty letter is Easy

ABCD's params (a width, a height, a letter count `n`, the modifier `D` for no
diagonal touching, the deal flag `R` for clues removed, and a tier) SHALL be
written as the hand-written game wrote them, `R` and the tier in the full
encoding only. A string with no difficulty letter SHALL decode as Easy, and a
lone size as a square of the default letters.

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 5×5 board of five letters, diagonal touching
  disallowed and clues removed, is encoded
- **THEN** the full encoding is `5x5n5DRdu` and the shared one `5x5n5D`
- **AND** `5x5n5DR`, written before the game had tiers, decodes as Easy

#### Scenario: The preset that disallows diagonal touching

- **WHEN** `6x6n5Dde` is decoded
- **THEN** it is a 6×6 Easy board of five letters with no diagonal touching
  and every clue showing, labeled "6x6 Easy, 5 letters, no diagonal"
- **AND** its shared encoding is `6x6n5D`

### Requirement: Params: ABCD's board without diagonal touching is a preset of its own

The rule against diagonal touching needs five letters, which no board of the
menu's grid has, so the menu SHALL reach it by a variant of its own, a 6×6
Easy board of five letters, and the Custom dialog by its box, "No diagonal
touching", on for the rule.

#### Scenario: The rule against diagonal touching is on the menu

- **WHEN** ABCD's preset menu is read
- **THEN** it holds a 6x6 board with five letters and no diagonal touching,
  titled with the words the label gives that rule

#### Scenario: The board deals at once and the hint finishes it

- **WHEN** that preset is dealt
- **THEN** the deal is immediate, and following the hint solves the board

### Requirement: Params: ABCD refuses Unreasonable where none of a size's boards needs it

When a board is to be dealt with every clue showing, the params SHALL refuse
Unreasonable for any grid of nine squares or fewer, as a size with no such
puzzle. With clues removed no refusal applies.

#### Scenario: A 3x3 Unreasonable board with every clue showing is not dealt

- **WHEN** `3x3n3du` is checked for dealing
- **THEN** it is refused with "No 3x3 puzzle with every clue showing is
  Unreasonable."
- **AND** `3x3n3Rdu` is not

#### Scenario: No fill of a refused size needs search

- **WHEN** every fill of three letters of a 3×3, 2×4 and 2×2 grid, and of
  four letters of a 2×4, is given to the ladder with every clue showing
- **THEN** none has one answer the ladder stops short of

#### Scenario: Hidden clues give the smallest boards the tier

- **WHEN** an Unreasonable 3×3 or 2×2 board is dealt with clues removed
- **THEN** it is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Description: An ABCD description is validated against its clue count and its lines

Validation SHALL reject a description whose clue count is not exactly
`(width + height) × letters`, distinguishing too few clues from too many,
one with a clue larger than its line is long, and one that contains an
unrecognized character or a clue without the comma after it.

#### Scenario: A description with the wrong number of clues is rejected

- **WHEN** a description carrying more or fewer clue entries than
  `(width + height) × letters` is validated
- **THEN** it is rejected with a message distinguishing too few from too many

### Requirement: Generation: ABCD's generator accepts only a uniquely solvable fill

A board SHALL be dealt from a fill of random letters that keeps the no-touch
rule, its clues counted from it, and kept only where it has one answer at the
tier asked. With clues removed, as many clues SHALL be hidden as can go while
the board keeps one answer at its tier.

#### Scenario: A board with clues removed still has one solution

- **WHEN** an Easy board is dealt with clues removed
- **THEN** its ladder finishes it, hidden clues included

### Requirement: Solver: ABCD's solver classifies a clue set by deduction alone

ABCD's ladder SHALL be its description's techniques: a placed letter struck
from its neighbors (and its diagonal neighbors with no diagonal touching), a
letter struck from a line that holds its count of it, a cell's one letter
left placed, and runs, placing the letters a line's open cells force where
they fit, with no two touching, just as many as the line still needs. Each
SHALL be checked sound.

#### Scenario: The solver classifies a puzzle

- **WHEN** the ladder is run on a clue set
- **THEN** it finishes it, or stops where the search decides one answer, several
  or none

#### Scenario: A preset is added to the menu

- **WHEN** a board is added to the description's `play.boards`
- **THEN** the cross-game hint walks deal it with no other edit

### Requirement: Hint: ABCD offers an explained hint

ABCD's hint SHALL be the candidate walk of a board with no unit
(`described-fill-game`), its reach the no-touch rule, its own rungs its
description's line techniques, each said in the words the description
states.

#### Scenario: A letter placed where diagonal touching is disallowed

- **WHEN** the hint places a letter on a board that disallows diagonal
  touching, in a cell away from the grid's edge
- **THEN** the cull after it strikes that letter from the marks of the eight
  cells round it that still show it

### Requirement: Hint: The satisfied-clue rung strikes a letter from a line that has its count

For a row or column that already holds its count of a letter, or whose count is
0, the hint's satisfied-clue rung SHALL strike that letter from every cell of
the line that still shows it, in one step, naming the line, striping it and
outlining in the margin the clue it reads.

#### Scenario: A row that holds its one A

- **WHEN** the hint shows a satisfied-clue step for a row whose clue for A is 1
  and that holds an A
- **THEN** it says "This row already holds its one A, so the As must go.",
  strikes A from the row's other cells that show it, stripes the row, and
  outlines its 1 in the margin and its A

#### Scenario: A row that may hold no A

- **WHEN** the hint shows a satisfied-clue step for a row whose clue for A is 0
- **THEN** it says "This row must hold no A, so the As must go.", strikes A
  from the row's cells that show it, stripes the row, and outlines its 0

### Requirement: Hint: The runs rung places the letters a line's open cells force

For a row or column whose cells that can still take a letter fit, with no two
touching, exactly as many as the line still needs, the hint's runs rung SHALL
place every letter that forces, as one journey, outlining those cells,
striping the line and outlining its clue for the letter in the margin.

#### Scenario: A runs step names the line and the count

- **WHEN** the hint shows the first step of a runs journey on a line with more
  open cells than letters to place
- **THEN** its sentence says how many of the letter the line needs and that the
  outlined cells fit only that many apart, and the cell to fill is ringed
- **AND** a later step of the journey says the cell must be that letter too,
  for the same striped line

#### Scenario: The runs claim holds for every line shape

- **WHEN** the soundness check runs the runs technique
- **THEN** every way of placing that many letters in the line's open cells with
  no two touching puts a letter on each position it forces, and its planted
  defect, an even stretch read as having one shape, is found unsound

### Requirement: Look: What ABCD draws

ABCD SHALL be drawn as a born board of letters: each row's clues in a margin
before it and each column's above it, a letter heading each margin's lines,
notes in empty cells, a small cross at each inner corner under no diagonal
touching, and the live errors of a broken rule.

#### Scenario: A clue its line can still reach is not red

- **WHEN** a row holds fewer of a letter than its clue asks and has empty cells
  enough to make up the difference
- **THEN** nothing is drawn in the error color
- **AND** a letter placed in a row whose clue for it is 0 is

#### Scenario: Two letters side by side

- **WHEN** two Bs are placed side by side
- **THEN** the no-touch rule is reported broken, and with no diagonal
  touching two Bs corner to corner are too

## REMOVED Requirements

### Requirement: Description: ABCD descriptions use the edge-clue encoding

**Reason**: The born game's ID segment is the description's (`id:`), and a
board the hand-written game wrote is read and written back byte for byte
(`abcd.cases.yaml`).
**Migration**: None.

### Requirement: Generation: An Unreasonable ABCD board has one answer that the ladder does not reach

**Reason**: The engine's deal of a tier, which every born game shares
(`described-fill-game`).
**Migration**: None.

### Requirement: Generation: An ABCD board is Easy where the ladder and the hint both finish it

**Reason**: A born board's tier is graded by its ladder, which its hint
walks, for every born game.
**Migration**: None.

### Requirement: Solver: ABCD counts a clue set's answers by a bounded search

**Reason**: The engine's search over the compiled ladder, every born game's.
**Migration**: None.

### Requirement: Controls: ABCD's obvious marks are a touching letter and a letter its line has in full

**Reason**: Mark-all on a born board of notes strikes what its placing
techniques reach (`engine-notes`).
**Migration**: None.

### Requirement: Controls: ABCD's keypad offers the board's letters and Clear

**Reason**: The keypad of a board of letters (`described-fill-game`, "A board
of numbers may play its values as letters").
**Migration**: None.

### Requirement: Hint: The runs rung is the hint's last resort

**Reason**: The walk's frontier chooses among the firings it can take, for
every born game.
**Migration**: None.

### Requirement: Look: ABCD draws its letters on a quiet surface

**Reason**: Every born board of numbers is drawn on the collection's cell
surface.
**Migration**: None.
