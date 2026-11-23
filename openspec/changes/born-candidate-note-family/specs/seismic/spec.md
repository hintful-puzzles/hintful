## MODIFIED Requirements

### Requirement: Params: A preset is never a long wait

A preset SHALL NOT be a size whose worst observed deal is a long wait: it is
offered to everyone who opens the Type menu, so a long deal there is a wait
nobody chose, whereas a Custom size is a wait the player asked for, and a
slow Custom size SHALL be accepted. The menu SHALL offer 4x4, 6x6, 6x8 and
7x9, each in both modes at both tiers, with 6x6 Seismic at Easy the default.

#### Scenario: A size whose worst case is a long wait is kept out of the menu

- **WHEN** presets are enumerated
- **THEN** the largest is 7x9, in either mode, whatever the Custom dialog
  admits

#### Scenario: The largest preset may take a moment

- **WHEN** the Type menu is opened
- **THEN** 7x9 is offered in both modes at both tiers

#### Scenario: A large Custom board is dealt however long it takes

- **WHEN** a 20x20 board is asked for, in either mode
- **THEN** its params are accepted

### Requirement: Description: A Seismic description is validated against its regions

Validation SHALL reject a description that uses an unknown clue character,
that forms an area of more squares than a cell's numbers reach (31), or that
places a clue larger than its area's size. It SHALL also reject a clue of 0,
and a clue list that does not cover the board exactly, and SHALL otherwise
accept a description of the two comma-separated parts, the clue list left out
included. An area of ten to 31 squares, which upstream refused because its
notes stopped at nine, SHALL be read.

#### Scenario: An over-large clue is rejected

- **WHEN** a description whose clue exceeds the size of its area is validated
- **THEN** it is rejected as out of range

#### Scenario: An area past what a cell holds is rejected

- **WHEN** an 8x4 description with no wall inside, one area of 32 squares, is
  validated
- **THEN** it is rejected as out of range

### Requirement: Controls: The on-screen keypad offers only digits a board can accept

Seismic's keypad SHALL offer the digits up to the largest area the deal
draws in the board's mode, plus a clear key: entry is capped at the pressed
cell's area size, so a digit no dealt board accepts is a key that does
nothing. Where the board in play, from a game ID dealt elsewhere, has a
larger area, the keypad SHALL reach that area's size. The bound SHALL be read
from the sizes the description deals, never restated.

#### Scenario: Widening the generator widens the panel

- **WHEN** the description's drawn sizes admit a larger area
- **THEN** the keypad admits the corresponding digits

#### Scenario: An upstream board with an area of six

- **WHEN** upstream's `6x6de:2c1aa4aaa6bb4aba2a1aba3a,g2b5l3l`, whose largest
  area is six squares, is opened
- **THEN** the keypad offers 1 to 6, where a dealt 6x6 board's offers 1 to 5

### Requirement: Hint: The deductions the hint makes

The hint SHALL deduce: a cell with one candidate left can only hold it; a
number with one cell left in its area must go there, unless that cell's
candidates are down to it already, which is the previous deduction; and a
number is struck from every cell outside an area that clashes, under the
mode's keep-apart rule, with every cell the area still has for it. The last
SHALL be taken only when no other applies. An area of one has its 1 placed
as the board is dealt, so no step places it.

#### Scenario: An area starved of a number rules it out of every cell that clashes with all its homes

- **WHEN** every cell an area still notes for 3 lies within 3 cells, along a row
  or column, of a cell outside the area that also notes 3, and a hint is requested
  at that point in Seismic mode
- **THEN** the plan strikes 3 from each such cell, a step a cell, ringing the
  cell, hatching the area, and saying each cell the area has left for its 3
  is in line with that cell and within 3 of it

#### Scenario: A number's last home that has one candidate left is a one-candidate step

- **WHEN** a number has one cell left in its area and that cell's notes are
  already down to that number
- **THEN** the step is narrated as a cell with one candidate left, and the
  one-cell-left narration is used only where the cell still notes another number

### Requirement: Hint: The starved-area deduction is the solver's trial rung

The starved-area deduction is the solver's trial rung in the form a player
can see: it SHALL strike exactly the candidates the trial rung rejects
wherever it is the next step, and every cell ruled out by one area and one
number SHALL be one firing, told a cell at a time. It is a Check, so it SHALL
be narrated directly. It SHALL never be needed on an Easy board, whose
certification uses the singles alone.

#### Scenario: An Easy board is never taught the trial

- **WHEN** a hint plan is followed from the deal to the end of an Easy board
- **THEN** no step of it is the starved-area deduction

### Requirement: Hint: A note-less Seismic cell is told by what stands within reach

Where the hint places the one number left for a cell with no notes, it SHALL
ring the cell and say what rules the others out in the mode's own words:
"Every other number is already in this cell's area or within reach along its
row or column, so it can only be 2." in Seismic mode, and "Every other number
is already in this cell's area or in a cell touching it, so it can only be 4."
in Tectonic mode.

#### Scenario: Notes written for a deduction say the same reach

- **WHEN** a Seismic-mode step first writes a note-less cell's notes, and the
  cell's area and the numbers within reach leave it 1 and 3
- **THEN** it says "Only 1 and 3 aren't already in this cell's area or within
  reach along its row or column, so pencil them in."

#### Scenario: A cell nothing reaches yet

- **WHEN** a step writes the notes of a cell no placed number rules anything
  out of
- **THEN** it says "No number stands near enough to rule one out of this cell
  yet, so pencil in every one."

## ADDED Requirements

### Requirement: Rules: An area of one shows its 1 from the start

A cell whose area is itself alone SHALL hold its 1 from the deal, placed as
a given is and changed by no edit, and the game ID SHALL NOT write it, so an
upstream ID reads and writes back byte for byte.

#### Scenario: Upstream's 4x4 with two areas of one

- **WHEN** `4x4de:11bafa,d4c1f3` is opened
- **THEN** its second and fourth squares of the top row show 1, and its ID
  writes back unchanged
