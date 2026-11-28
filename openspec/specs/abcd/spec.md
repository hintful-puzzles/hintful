# abcd Specification

## Purpose
ABCD, the puzzle of writing a letter in every cell so that no two identical
letters touch horizontally or vertically and each edge number counts one letter
in its row or column, with a solver-gated generator, a refusal of the board
sizes that generator cannot produce, and an explained hint.

## Requirements

### Requirement: Rules: ABCD is solved when the grid is full and every rule holds

The game SHALL be reported solved when every cell is filled, every clue is
satisfied, and no two identical letters are adjacent under the active adjacency
rule.

#### Scenario: Completing the grid correctly wins

- **WHEN** the final cell is filled so that every clue is met and no identical
  letters are adjacent
- **THEN** the game is reported solved

### Requirement: Rules: ABCD checks letters and notes against the one answer its clues fix

ABCD's `findMistakes` SHALL report what the collection's check reports of
entries and of notes (`ts-engine`, "A mistake check compares with the one
answer, hidden or not" and "A candidate note that excludes the answer is a
mistake"), against the one answer the search proves from the clues
(`engine-difficulty`, "One search answers a board for everything that asks").

#### Scenario: A mark that has crossed out the answer is a mistake

- **WHEN** the mistake check runs on an empty cell whose pencil marks leave out the
  letter the unique solution puts there
- **THEN** that cell is reported as a mistake

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

### Requirement: Controls: ABCD enters a letter into the selected cell

ABCD SHALL be played on the collection's note-taking cell (`engine-notes`,
"The note-taking cell is one shared mechanic"): a click or the arrow keys
select a cell, and a key enters a letter there or, in pencil mode, a mark.
Entering a letter SHALL accept the letter keys and the bare digit keys `1` to
`9` up to the letter count. Clearing SHALL accept Backspace, Space, and `0`.

#### Scenario: Entering a letter fills the selected cell

- **WHEN** a cell is selected and a letter key (or its digit) within the letter
  count is pressed
- **THEN** that letter is placed in the cell

### Requirement: Controls: Clearing an ABCD cell that holds only marks is a move

Clearing an empty cell that carries marks SHALL be a real move, because it
wipes them.

#### Scenario: Clearing a cell that holds only marks is a real move

- **WHEN** an empty cell carrying pencil marks is cleared
- **THEN** a move is produced, and undoing it restores the marks

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

### Requirement: Hint: ABCD's hint stops where the ladder does

On an Unreasonable board as on any other, the steps of ABCD's hint SHALL be
those the three techniques force from the player's marks.

#### Scenario: The hint stops, and goes on from a letter tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** with a letter entered as the solution has it wherever the hint
  stops, the hint finishes the board

### Requirement: Hint: ABCD's hint reads a line only once the notes are set up

The hint's satisfied-clue and runs rungs SHALL fire only once the notes are
set up: after the fill-all and its clean where the `hint-notes` preference
is "Every candidate first", and after the clean where it is "Only as needed".
Until then the hint SHALL offer only the walk's own singles.

#### Scenario: A row that may hold no A, on a board just dealt

- **WHEN** a hint is asked on `0,2,1,1,1,0,1,2,1,1,1,1,0,2,1,1,1,1,0,2,0,1,1,2,1,1,2,0,0,2,1,1,`,
  a 4×4 board of four letters whose top and bottom rows' numbers for A are
  0, under "Every candidate first"
- **THEN** the first step pencils every letter into each empty cell, and
  only the step after it crosses A out of a row that may hold none

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
