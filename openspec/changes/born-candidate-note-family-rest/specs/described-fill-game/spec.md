## ADDED Requirements

### Requirement: The candidate-note family is played from its descriptions

Solo, Salad, Group, ABCD, Undead, Magnets, Rome, Crossing and Map SHALL each
be dealt, drawn, played and hinted from its description on the fill board,
its directory under `src/games/` holding no TypeScript but tests, unless the
gap list sends a game to a later group of the route that builds what it
needs, naming the group.

#### Scenario: A moved game is its description

- **WHEN** a game of the nine has flipped
- **THEN** its directory holds its description and its `cases.yaml`, and no
  hand-written TypeScript

### Requirement: A born game with notes is walked over every unit it has

The candidate walk of a born game with notes SHALL read a value's places in
every unit of the board's space, rows, columns, diagonals and the blocks of
the partition among its units, beside the parts of each dealt partition a
rule holds distinct. A unit a modifier adds SHALL be a unit only of a board
the modifier is on. A partition among the units stated as `blocks(a, b)`
SHALL be cut by the engine from the board's sizes; a partition stated by
any other formula SHALL be refused.

#### Scenario: A single in a block or a diagonal

- **WHEN** a value has one place left in a block, or in a diagonal of a
  board with the diagonals' modifier on, and in no unit listed before it
- **THEN** the hint places it there, naming the block by its partition's
  name or the diagonal as a diagonal, and striping it whole

#### Scenario: A placed value's reach follows the modifier

- **WHEN** a value is placed with auto-pencil on, on a board in blocks with
  areas a rule holds distinct
- **THEN** it is struck from the notes of its row, column, block and area,
  and of its diagonal only where the diagonals' modifier is on; and the
  walk's words for that reach are the description's, chosen by the
  modifier as a flag by its name

#### Scenario: A board with no unit

- **WHEN** a born board with notes has no unit and no partition a rule
  holds distinct, and its description words the walk's steps
- **THEN** the walk strikes a placed value from the notes its placing
  techniques strike it from, finds no hidden single, and finishes a board
  the ladder finishes
- **AND** its hint lists no hidden-single rung, which no step could take

#### Scenario: A partition by another formula is refused

- **WHEN** a description states a partition by a formula other than
  `blocks(a, b)` with each side a number or a size, or states one by
  formula that is not among its units
- **THEN** the description does not compile

### Requirement: A born game is graded on each of its scales

A born game whose description names scales besides its tiers SHALL run its
ladder, for a deal, a solve, a hint and a search alike, capped at the
board's tier and at the top of each other scale. Its deal SHALL keep only a
board that needs the asked tier and, on each other scale its ladder has an
entry of, the top of that scale: the scale's tier under its top, with the
asked tier, does not finish it. A board of a search tier SHALL be held on
the tiers alone.

#### Scenario: A board needs the top of the other scale

- **WHEN** a board of a game with a second scale is dealt at any tier but
  the search's
- **THEN** its ladder finishes it at the asked tier with the other scale at
  its top, and does not with the other scale a tier under its top

#### Scenario: A hint reads the other scale

- **WHEN** a hint is asked on such a board
- **THEN** the walk may take a technique of the other scale up to its top,
  and hints the board to the end

### Requirement: A born game's blocks may be dealt in equal parts

A born game's partition among its units MAY be dealt, the board's space
then taking its blocks from the board's clues. `deal.divide` with `equal`
SHALL tile the board with connected parts of that many cells, and a desc
whose parts of that partition are not all of that size SHALL be refused.
`deal.divide` MAY list several partitions, divided in turn, and the answer
SHALL be searched under them all.

#### Scenario: Jigsaw blocks and cages

- **WHEN** a born game whose blocks are divided into parts of the board's
  width and whose cages are divided after them deals a 5×5 board
- **THEN** five connected blocks of five tile it, every row, column and
  block holds 1 to 5 once, and no cage repeats a number

#### Scenario: Blocks walled, cages inset, diagonals stroked

- **WHEN** such a board is drawn, with the diagonals' modifier on
- **THEN** its blocks are drawn as walls, its cages as dashed outlines
  inset inside the squares with each cage's sum at its first square clear
  of the dashes, and each diagonal as a line corner to corner

#### Scenario: Blocks of unequal size are refused

- **WHEN** a desc of such a game writes a 4×4 board's blocks as one of
  eight cells and two of four
- **THEN** the desc is refused as malformed

### Requirement: A born game's clues may keep a symmetry the player chooses

A born game's deal MAY hide a clue kind at cells keeping a symmetry, one
named by what it keeps or the one a deal option's choice names. A clue
SHALL be hidden with the clues of its orbit still shown, and one a square of
whose orbit holds none SHALL not be shown.

#### Scenario: Givens closed under the chosen symmetry

- **WHEN** a board is dealt with any of Solo's eight symmetries chosen
- **THEN** every square the symmetry takes a given's square to holds a
  given

### Requirement: A deal option may be written by its choices' codes

A deal option with no letter SHALL write its choice's code in a full game
ID, after the modifiers' letters, and nothing for its default; reading an
ID, the default's code or none SHALL give the default.

#### Scenario: Upstream solo.c's symmetry suffix

- **WHEN** a board with the diagonals' modifier and 4-way mirror symmetry is
  written as a full game ID
- **THEN** the ID ends `xm4` and its tier, and `r2` or no suffix reads as the
  default 2-way rotation

### Requirement: A born game may be sized by its blocks

A born game whose blocks are `blocks(a, b)` of two sizes, the grid `a * b`
on a side, MAY be sized by them (`play.blocks`). Its params SHALL give the
blocks across and down, written as upstream solo.c writes them, `{b}x{a}`,
or `{b}` and a letter where the blocks are one square wide, and a bare
number SHALL read as that many both ways. The variation that deals the
blocks SHALL be on exactly where they are one square wide; only there SHALL
the board deal them, and its desc write them.

#### Scenario: Jigsaw read as upstream writes it

- **WHEN** the params `5j` or `2x3` are read
- **THEN** the first is a 5×5 board that deals its blocks, the second a 6×6
  board of blocks 3 wide and 2 tall that deals none and writes none in its
  desc

### Requirement: The Custom dialog of a board sized by its blocks

The Custom dialog of a board sized by its blocks SHALL offer the blocks
across and down, and after them the game mode, which folds the blocks into
dealt ones and back to the squarest blocks of the order.

#### Scenario: The game mode folds the blocks

- **WHEN** the Custom dialog's game mode is set to the dealt blocks on a
  `2x3` board, and back
- **THEN** the board is a 6×6 dealing its blocks, then `2x3` again, with any
  modifier left as it was

### Requirement: A partition a modifier adds is the board's only under it

A partition a variation adds to a born game's space, and the clues at its
parts, SHALL be divided, derived, written in the desc, read from it and
drawn only on a board with the variation on. A clue kind at parts SHALL be
read at the parts of the partition it names, whichever the board deals
first. A technique the variation adds SHALL be a rung of the hint only on a
board with it on.

#### Scenario: Killer's cages

- **WHEN** a board of a game whose Killer modifier adds cages and their
  totals is dealt with Killer off, and with it on
- **THEN** the first deals, writes and draws no cage and no total, and the
  second deals both, each total its cage's sum in the answer

#### Scenario: A hint on a board without Killer

- **WHEN** a hint is asked, or the board drawn, on a Solo board with Killer
  off
- **THEN** it reads no cage technique and draws no cage, and neither fails

### Requirement: A born board's rules and text read its own space

The live errors and the answer check of a born game SHALL read the board's
own space: the units its variations have, and its blocks, cut by its sizes or
dealt. Its text format SHALL wall the partition the board draws as walls,
the blocks where it has them, and print a part's clues after the row of the
part's first cell.

#### Scenario: A repeat in a block, and one on a diagonal without X

- **WHEN** two equal numbers stand in one block of a Solo board, in neither
  one row nor one column, and on another board two stand on a long diagonal
  with X off
- **THEN** the first breaks the Latin rule and the second breaks nothing

#### Scenario: A Killer board's text

- **WHEN** a 2x2 Killer board is printed as text
- **THEN** its walls are the blocks', and each row is followed by the totals
  of the cages that start in it

### Requirement: A stated wording names a unit by the board's unit

A born game's stated wording SHALL say `{unit}` as the board's unit holding
the cells it refers to: row, column, the blocks' partition by its name, or
diagonal.

#### Scenario: A block single

- **WHEN** Solo's hint places a number with one place left in a block
- **THEN** it says "No other cell in this block can be" the number

### Requirement: A part's clue may be written as upstream Solo writes it

A born game's `digits` segment of a clue kind at parts SHALL write each
part's clue at the part's first cell in reading order, and SHALL read it at
any cell of the part, refusing a desc that gives a part none or two. A
`blocks` segment with `counts: false` SHALL write a letter's repeats out,
never as a count, and either form SHALL be read.

#### Scenario: A Killer board's sums

- **WHEN** a Killer board's desc is written and read back, and then read
  with each cage's sum at its last cell, and with a cage given two
- **THEN** the first reads back byte for byte, the second reads the same
  totals, and the third is refused

### Requirement: A modifier may hide a kind whole and bound the board

A born game's `deal.hideWhole` MAY name a variation, `with:`, under which
the deal hides every clue of the kind, drawing the answer again until the
board finishes without it. A modifier MAY state `bounds` on the board's
size, as `play.bounds` states them, which a board with it on SHALL keep. A
clue at a part with no sign in `play.signs` SHALL be drawn as its number.

#### Scenario: Killer shows no given

- **WHEN** a board is dealt with Killer on, whose `hideWhole` names it
- **THEN** it shows no given number, its cages' totals drawn as plain
  numbers, and a board past Killer's bounds is refused with Killer's name

### Requirement: A born game's size may be a number

A size beyond the grid's MAY be a number setting (`kind: number, gives:
size`), which SHALL be written in a brief ID as its letter and the number,
read as its default where absent, and refused outside its range.

#### Scenario: The number of values

- **WHEN** the `counting` fixture's params `4x5k4`, `4x5` and `4x4k5` are
  read
- **THEN** the first writes back as it was, the second has 3 values, and
  the third is refused, saying the range

### Requirement: A born game may deal a clue one a value

A born game whose deal samples an answer SHALL derive a clue kind `per:
value` at each element for each value of the answer's domain, and its
`numbers` segment SHALL write and read each element's values in turn; no
other segment writes one. An answer built by the ladder with nothing laid
first SHALL be built on no clue.

#### Scenario: A line's count of each value

- **WHEN** the `counting` fixture deals a board of `k` values, and its desc
  is read back
- **THEN** each row and column holds one clue for each value, the count of
  it the answer holds, written rows then columns, each line's values from 1
  in turn; and a desc with a clue too many or too few is refused

### Requirement: A board of numbers may play its values as letters

A born board of numbers with `play.numbers.letters` SHALL draw each value,
its notes and a hint's word for it as a letter from A, offer a key a
letter, and take a letter of either case, or a digit, as the letter at its
place. A count SHALL still be said in digits.

#### Scenario: Typing B three ways

- **WHEN** a square of a `counting` board of three letters is selected and
  `b`, `B` or `2` is pressed
- **THEN** each enters B, and `d` or `4` enters nothing

### Requirement: A line's clues one a value are drawn in a margin before it

A born board's clue kind at lines `per: value` SHALL be drawn before each
line's start, a tile a value, value 1 furthest out, headed by each value's
glyph. A clue SHALL be red where the rules break it, hatched where a step
stripes its line, and outlined where a step's term names it. The compiler
SHALL refuse such a kind beside a list or labels at lines.

#### Scenario: Reading a count from the margin

- **WHEN** a `counting` board of three letters is drawn, and the walk's
  step that a line already holds all of a letter is shown
- **THEN** each count sits in its letter's tile before its line, A, B and C
  head the tiles, and the count the step reads is outlined, its line
  hatched through the margin

### Requirement: A clue in the margin before a line is marked done and printed

A clue one a value at a line marked done (`play.done`) SHALL be drawn gray.
A press on it SHALL mark it done, and Shift or Ctrl with Left or Up the
cursor's row's or column's clue for the value its square holds. The text
format SHALL print the clues before their lines as the board draws them,
each headed by its value.

#### Scenario: Marking a count done

- **WHEN** a count in the margin is pressed, or Shift-Left is pressed with
  the cursor on a square holding B
- **THEN** the pressed count is drawn gray, and the key marks the cursor's
  row's count of B

### Requirement: A born board's modifier bounds a size and lifts a tier's bound

A number size MAY state a `least` under a variation, refused below it while
the variation is on, naming the variation. A deal flag MAY state
`offBounds`, a tier's size bounds held only while it is off, a full ID past
them refused as having no such tier. `play.cornerCrosses` SHALL draw a
small cross at each corner inside the grid while its variation is on.

#### Scenario: ABCD's bounds on the counting fixture

- **WHEN** `4x4k3D` is read, and a full `2x2k2` ID at Easy with and
  without remove-clues
- **THEN** the first is refused, values must be at least 4 with no
  diagonal touching; the 2x2 is refused as no Easy puzzle with every clue
  showing, and not with clues hidden

### Requirement: A born board's answer may hold a value more than once in a unit

Where the answer declares a value a unit repeats (`answer.value.repeat`),
the ladder's marks and the candidate walk SHALL count it as many times as
the description says a unit holds it. A Latin sample SHALL be folded to the
domain: each value past its top reads as the top. A derived clue's meaning
MAY read a size the params give.

#### Scenario: The emptying fixture

- **WHEN** a `5k3` board is sampled, and its clues derived from the answer
- **THEN** each line holds 1 to 3 once and the empty square twice, each clue
  is a number up to 3, and the ladder never proves the board impossible

### Requirement: A born board's ruleset may choose the clue kinds it is dealt

A choice of a size (a ruleset) MAY name the clue kinds dealt on its boards
alone (`deals`). Such a kind SHALL be derived, hidden, drawn and written in
the ID only on a board of a ruleset naming it; elsewhere it SHALL hold no
clue, an ID segment of such kinds alone SHALL be neither written nor read,
and a stream SHALL read no code of it. A kind no choice names SHALL be
dealt on every board. A ruleset written by a code SHALL be written at its
default too, unless the code is empty.

#### Scenario: The emptying fixture's two rulesets

- **WHEN** a `5k3B` board is dealt, a `4k3` board's params written, and a
  `4k3S` desc read whose squares hold `O`
- **THEN** the first holds balls and no clue at a line's end, and its desc
  writes no slots; the params read `4k3S`; the desc is refused

### Requirement: A born board of numbers may have an empty square

A board of numbers whose answer repeats a value in a unit MAY declare it
the empty square (`play.numbers.empty`). It SHALL be typed by `X`, `-` and
`_`, never by its glyph's key, drawn as the engine's cross, and noted as an
X. The keypad SHALL offer the other values, then `X`, `O` and clear. A
placed empty square SHALL strike itself from its unit's notes only once the
unit holds every copy of it.

#### Scenario: The emptying fixture's empty square

- **WHEN** on a `5k3B` board `X` is typed into an open square, and `4` into
  another
- **THEN** the first holds the empty square drawn as a cross, and the
  second is unchanged

#### Scenario: The empty square's reach

- **WHEN** the empty square is placed with auto-pencil in an empty row of
  five whose units hold it twice, then placed again in the same row
- **THEN** the first placement strikes nothing from the row, and the second
  strikes it from the row's other three squares

### Requirement: A ball is the empty square struck from a square's notes

On a board with an empty square, `O`, `+` and `=` SHALL strike it from an
open square's notes, from every value where the square has none, and SHALL
put it back where it is struck, a square left noted every other value then
holding no notes. A square whose notes lack it, and a square holding the
clue kind `play.numbers.empty` names, SHALL be drawn in a ball, the clue's
in ink and the player's in the entry color; a square noted every other
value SHALL show no notes inside it.

#### Scenario: A ball typed and taken back

- **WHEN** on a `5k3B` board `O` is typed twice into an open square with no
  notes
- **THEN** after the first it is noted 1 to 3 and drawn as a bare ball, and
  after the second it holds no notes and no ball
