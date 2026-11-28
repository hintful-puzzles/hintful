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

### Requirement: A born board's ruleset may draw its values as letters

A ruleset of a board of numbers MAY draw its values as letters from A
(`letters` on its choice), every other ruleset's drawing numerals. A board
SHALL draw, offer, print, say and write each value as its ruleset draws
it, its empty square as `X`; a letter key and a digit SHALL each type the
value at its place on every board of the game.

#### Scenario: The emptying fixture's two rulesets drawn

- **WHEN** a `5k3S` board and a `5k3B` board are dealt and drawn, and `A`,
  `a` and `1` typed into an open square of each
- **THEN** the first draws its clues and givens as letters and offers `A`
  to `C`, `X`, `O` and clear; the second draws numerals and offers `1` to
  `3`; each key types 1 on both

### Requirement: A clue at a slot may say a value

A clue kind at a slot whose number is one of the answer's values (`glyph`)
SHALL be drawn and printed as that value's glyph.

#### Scenario: The emptying fixture's clues drawn as letters

- **WHEN** a `5k3S` board is drawn and printed
- **THEN** its clues at the lines' ends are letters, no numeral among them

### Requirement: A born board's ID may write its values as the board draws them

An ID stream MAY write its own kind's number as the board's glyph, one
character (`glyphs`), the kind a given or a clue with `glyph`; a stream at
slots MAY write them in an order of sides of its own (`sides`), and any
stream MAY end in a mark written wherever it is written (`after`). A glyph
SHALL be read only as the board's ruleset draws it, and only up to the
largest value its sizes give.

#### Scenario: Salad's IDs

- **WHEN** an ID upstream Salad's generator writes is read by the draft of
  Salad's description, in either ruleset, from 3x3 to 9x9 and 2 to 9
  symbols
- **THEN** it holds the border clues, balls and givens the hand-written
  game reads, and is written back byte for byte

#### Scenario: The emptying fixture's slots in Salad's order

- **WHEN** the `4k3S` desc `dAk,p` is read
- **THEN** its one clue is at the left of the first row

### Requirement: A born deal's hide may be whole under a ruleset

A hidden kind's `whole` MAY name a ruleset as it names a variation: on a
board of that ruleset within the bounds, the deal SHALL hide every clue of
the kind.

#### Scenario: The emptying fixture's Sight boards below 5x5

- **WHEN** ten `4k3S` boards, ten `5k3S` boards and ten `4k3B` boards are
  dealt
- **THEN** no `4k3S` board shows a given, and some board of each of the
  others does

### Requirement: A born board's number size may be bounded by a side

A number setting MAY be less than a side of the grid (`under`): a board
whose number is not SHALL be refused, saying so.

#### Scenario: The emptying fixture's values

- **WHEN** `4k4` and `5k4` are validated
- **THEN** the first is refused with "Values must be less than the grid
  size." and the second is not

### Requirement: A born board's ruleset may bound a tier on some sizes

A ruleset's choice MAY bound the boards of a tier, as a choice of the deal's
does, on a board whose number sizes are those it names (`sizes`) alone; a
full ID's board outside them SHALL be refused as having no such tier, named
by its size, its ruleset and those sizes.

#### Scenario: The emptying fixture's Normal Balls boards of two values

- **WHEN** `4k2Bdn`, `5k2Bdn`, `4k3Bdn`, `4k2Sdn` and `4k2Bde` are
  validated as full IDs
- **THEN** only the first is refused, with "No 4x4 Balls puzzle with 2
  values is Normal."

### Requirement: A born deal may weaken a clue before it goes

A hidden kind MAY be hidden `after` another at the same places: its clue at
a place SHALL be tried straight after that kind's clue there goes, and kept
while that clue is shown.

#### Scenario: The emptying fixture's balls

- **WHEN** the hide orders a `5k3B` board's clues, and hides from it
- **THEN** every ball comes straight after the number at its square, every
  number left shown keeps its ball, and some ball is left where its number
  went

### Requirement: A born deal may refuse a board a part of its ladder finishes

The deal MAY name techniques of its ladder and a value (`refuse`): a board
on which those techniques alone, with what runs on placing, place every
square of the answer holding that value SHALL be drawn again.

#### Scenario: The emptying fixture's empty squares

- **WHEN** a `5k3B` board shows every number, or is hidden from at its tier
- **THEN** the first is refused, as its empty squares fall with no number
  placed, and a board hidden from is kept

### Requirement: The hint walks a value a unit holds more than once

On a board whose answer repeats a value in a unit, the candidate walk SHALL
count a unit as holding every value where its cells' domains, with the
repeated value's copies, are as many as its cells, so a value with one
square left in a line is a hidden single there. The repeated value SHALL
never be placed as a single, naked or hidden: the description's techniques
place it.

#### Scenario: The emptying fixture's walk

- **WHEN** six `5k3B` boards are dealt and each hint plan is followed
- **THEN** every board is solved, some step is a hidden single, and the
  empty square is placed only by the description's techniques

### Requirement: The cull of a value a unit holds more than once is said as the unit's last

A placement of a value a unit holds more than once SHALL strike it from the
unit's notes only where it is the last copy the unit needs, said in the
words of the description's `steps.last` step, which the compiler requires of
a description whose answer repeats a value. A set whose values include it
SHALL say its cells account for every copy their line still needs.

#### Scenario: The emptying fixture's last empty square

- **WHEN** a `5k3B` board's plan places a line's last empty square while
  another square of the line still notes it
- **THEN** the next step strikes it there, in the `last` step's words

### Requirement: A hint calls a value as the ruleset draws it

Where the description's `words` does not name a value, the hint SHALL call
it a letter on a board whose ruleset draws letters, and a number elsewhere.

#### Scenario: The emptying fixture's two rulesets

- **WHEN** a hint is asked on a `5k3S` board and on a `5k3B` board
- **THEN** the first's opening speaks of every candidate letter, the
  second's of every candidate number

### Requirement: A ball's notes are drawn inside its ring

A square drawn in a ball that holds notes SHALL draw them inside the ball's
ring, clear of its stroke, and a hint's ring round them SHALL go round them
where they are drawn. Squares without a ball keep their notes' size.

#### Scenario: A given ball holding notes

- **WHEN** a Number Ball board's notes are filled in
- **THEN** a square whose clue is a ball shows its notes inside the ring, and
  the other squares' notes are as large as before

### Requirement: A born board's text prints its ball and its ruleset's clues alone

The text format SHALL print an open square holding the clue kind
`play.numbers.empty` names as `O`, and SHALL print no rim for slot clue kinds
the board's ruleset does not deal.

#### Scenario: A Number Ball board

- **WHEN** `5n3Bde:d1cO32b3aXa1d2b` is printed as text
- **THEN** its ball's square reads `O`, its cross `X`, and the grid has no
  rim of border clues

### Requirement: A born game's own strikes are steps as its words speak of them

A firing of a description's own technique that strikes notes SHALL be one
step a value where its steps say `shown: value`; one step a cell where its
words name the step's cell (`{ring}`), the values it strikes (`{struck}`)
or a fact's own terms; and otherwise one step for every cell whose notes are
written, and one for each cell without, as the library's strikes are.

#### Scenario: A technique whose words name neither cell nor value

- **WHEN** a counting board is walked under the reading that pencils every
  candidate in first, and a line holding all of a letter it counts strikes
  that letter
- **THEN** one step strikes it from every open cell of the line that notes it

#### Scenario: Salad's nearest square

- **WHEN** a border clue sees B first and the square nearest it notes A, B
  and C
- **THEN** one step strikes A and C from that square, "so A and C must go"

### Requirement: A born board of numbers may select a shape by a drag

Where the description's `play.select` names a shape, a drag from the square
selected for typing SHALL select the squares of that shape from it to the
square under the pointer, each highlighted as the selected square is. A
value typed SHALL go into every square of the selection as one move, a
given holding it passed over. A press or an arrow SHALL drop the selection.
A board of buttons SHALL refuse a selection.

#### Scenario: A diagonal typed at once

- **WHEN** the player selects a square, drags along a diagonal across a
  given 3 and releases, then types 3
- **THEN** one move places 3 on every open square of the diagonal, and
  Undo takes them all off

#### Scenario: A selection refused or noted

- **WHEN** the selection crosses a given 2 and the player types 3
- **THEN** nothing is placed
- **WHEN** the player types 3 in notes mode
- **THEN** 3 is noted on each square of the selection lacking it, or struck
  from every one where all note it

### Requirement: A born square board of numbers may let the player rule dividers

Where the description's `play.dividers` is set, on a square board of numbers
with line labels, a press in the labels' margin SHALL toggle a divider at
the gap between two labels nearest it, and `|` and `-` the one after the
cursor's column or row. A divider SHALL be drawn as a wall between its two
rows and between the same two columns. It SHALL be a move a save holds,
undone as any, and a restart SHALL take every divider away. A description
setting it elsewhere SHALL be refused.

#### Scenario: A divider ruled and taken away

- **WHEN** the player presses between the labels of lines 2 and 3
- **THEN** a wall is drawn between rows 2 and 3 and between columns 2 and 3
- **WHEN** the player presses there again, or undoes
- **THEN** the wall is gone

#### Scenario: A divider keyed

- **WHEN** the cursor is in column 2 and the player types `|`
- **THEN** the divider after column 2 is toggled, and with it the one after
  row 2

### Requirement: A born square board of numbers may let the player order its lines

Where the description's `play.order` is set, on a square board of numbers
with line labels, a label dragged along its margin SHALL carry its row and
the same column to where it is let go, and Shift with an arrow SHALL move
the cursor's column or row a place. The order SHALL be a move a save holds,
which a restart undoes. A description setting it off such a board, or with
a unit beyond the lines or a clue off the cells, SHALL be refused.

#### Scenario: A line dragged by its label

- **WHEN** the player drags the label of the first column to the third
  place
- **THEN** that column and the same row are drawn third, their labels and
  values with them

#### Scenario: A line moved from the keyboard

- **WHEN** the cursor is in the second column and the player types
  Shift+Right
- **THEN** that column and the same row move to the third place, and the
  cursor is still on them

### Requirement: A born board in an order is drawn and played where its lines are shown

On a board whose lines the player orders, every value, given, note, live
error, mistake and hint mark SHALL be drawn at the place its line is shown,
a square pressed or typed into SHALL be the one drawn there, and a line
being dragged SHALL be shown as selected. Where dividers are on, a press on
the labels SHALL toggle its divider on its release, and only where it never
dragged; a divider whose two lines an order parts SHALL be taken away.

#### Scenario: A broken rule after a reorder

- **WHEN** two squares of a row hold the same number and the lines are
  reversed
- **THEN** both numerals are drawn red in the last row, at the places their
  columns are shown

#### Scenario: A press on the labels that never drags

- **WHEN** the player presses between two labels and lets go there
- **THEN** the divider there is toggled on the release

### Requirement: A born board may label a rule's breach at its squares

Where the description's `breaches` labels a rule, each binding of the
rule's leading `forall`s that a board breaks SHALL be drawn as its labels,
each written small in red above or below the square its formula names, its
numbers as the board writes those values, and its squares SHALL NOT be
drawn in error for it. A square SHALL show the first label of each place.
Where a label reads a square still open, the breach SHALL be drawn at its
squares. A label the compiler cannot place SHALL be refused.

#### Scenario: A failed product labeled

- **WHEN** a group's table holds a·b = c and b·c = a, and c·c reads c while
  a·a reads b
- **THEN** `(ab)c` is written over the c of c·c and `a(bc)` under the b of
  a·a, in red, and no letter is red

#### Scenario: A label refused

- **WHEN** a label names no statement, its formula is no square, or a term
  of its text is no number
- **THEN** the description is refused

## MODIFIED Requirements

### Requirement: A born game's answer may be searched under a partition dealt first

`deal.divide` with `sizes` SHALL deal a partition before the answer, one
part at a time grown to a size drawn from a list (one list a ruleset, with
`by`), and `deal.sample: { search: true }` SHALL find the answer under it
by a search over the ladder's easiest tier, a cell's values tried in a
random order, a draw whose search runs out divided again. Where a
cell's domain is its part's numbers, the keypad SHALL run to the largest
size drawn, and a cell SHALL take no number past its part's size.

#### Scenario: Areas of drawn sizes, each holding 1 to its size

- **WHEN** a born game whose areas are divided to sizes drawn from 2, 3 and
  4 deals a 6×7 board
- **THEN** no area is larger than 4, the board has one answer, and each
  area holds 1 to its size once

#### Scenario: A ruleset written as its bare letter

- **WHEN** a born game's ruleset setting names `letters: ["", T]` and a
  board of the second ruleset is written
- **THEN** its params are `6x6T`, the first ruleset's `6x6`, each read back
  to its ruleset, and the Custom dialog offers both as its game mode

#### Scenario: A number past the cell's area is not typed

- **WHEN** a player selects a cell of an area of three and types 4
- **THEN** nothing is entered, and the keypad offers 1 to 4
