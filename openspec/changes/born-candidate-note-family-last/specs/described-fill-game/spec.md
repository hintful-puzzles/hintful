## ADDED Requirements

### Requirement: A born game's clue at the board may be derived from its answer

A clue at the board whose deal samples an answer SHALL be dealt as one
record for each value of every field but the last, in their values' order,
the last field read off the answer by the meaning `E = f(k)`. A meaning of
any other shape, or a key field whose values are no range of numbers, SHALL
be refused by the compiler. While the answer is built, the clue SHALL hold
no record.

#### Scenario: The totals of a board

- **WHEN** a `totaling` board is dealt and solved
- **THEN** its clue holds a record for blocks and one for discs, each
  counting the squares of the answer holding it

### Requirement: A born game's ID may write a clue at the board

The ID's `numbers` segment of a clue at the board the deal derives SHALL
write each record's last field, in the records' order, and a desc whose
value is past the field's range SHALL be refused.

#### Scenario: The totals written first

- **WHEN** a `totaling` board is dealt
- **THEN** its ID begins with the count of blocks and of discs, and reads
  back to the same board

### Requirement: A born game's clue at the board may be drawn as a row of counts

`play.counts` SHALL draw a clue at the board the deal derives beneath the
board, each record its value's piece and its count, the count in the error
color where the rules break the record and gray where every one of its
value is placed; the row SHALL be centered within the board's width. A
press on a record SHALL place its value as the value's key does.

#### Scenario: A pressed count places its value

- **WHEN** the cursor is on an open square of a `totaling` board and the
  disc's count is pressed
- **THEN** the square holds a disc

#### Scenario: A finished count

- **WHEN** every ghost of a `portraying` board's total is placed
- **THEN** the ghost's count is gray, and not in the error color

### Requirement: A row of counts may read in the player's style

`play.countStyle` SHALL offer the player a preference, under the key it
names, for how a count reads: Total, Remaining, Placed/Total, or
Left/Total, the last by default, every style fitting the same row.

#### Scenario: A count in each style

- **WHEN** a `portraying` board whose total of ghosts is 3 holds one ghost,
  drawn in each count style
- **THEN** the ghost's count reads `3`, `−2`, `1/3` and `2/3`

### Requirement: A born game's board of numbers may be drawn as pictures

`play.numbers.pictures` SHALL draw each value the player places by the
painter it names in place of its glyph: placed, as a piece filling its
square; noted, as a small piece in a two-by-two grid filling the square;
and in a row of counts, as its record's piece. The player's preference,
named by the description and pictures by default, SHALL draw the glyphs
instead, and `A` SHALL switch it.

#### Scenario: Pictures and letters

- **WHEN** a `portraying` board is drawn, and drawn again with the
  preference switched
- **THEN** a given ghost is drawn as a ghost and no `G`, then as a `G` and
  no ghost, and the row of counts likewise

#### Scenario: Notes drawn as pictures

- **WHEN** an open square of a `portraying` board is noted a ghost, a
  vampire and a zombie
- **THEN** it draws three small monsters, the first two side by side and
  the third beneath the first

### Requirement: A board of numbers may be drawn as arrows

A painter that points SHALL note its piece small on the side of its square
it points to, where every piece of the board points. An arrow SHALL be
drawn in the player's entry color, in ink where the puzzle gave it, and as
a note in pencil. Where `play.numbers.pictures` names no preference, the
board SHALL always be drawn as pictures, offer no preference for the
glyphs, and `A` SHALL switch nothing.

#### Scenario: Arrows noted on their sides

- **WHEN** an open square of a `pointing` board is noted each arrow in turn
- **THEN** each is three pencil strokes under a third of the square across,
  above its middle for up, below it for down, left of it for left and right
  of it for right

#### Scenario: A board that is only pictures

- **WHEN** a `pointing` board's preferences are asked for, and `A` is typed
- **THEN** none chooses pictures or glyphs, and the board is still pictures

### Requirement: A board whose every piece points is dragged by its way

Where every value the player places is drawn by a painter that points, a
press on an open square SHALL commit nothing; a drag from it SHALL choose
the value pointing along its dominant axis, across on a tie, previewed,
a way the square's domain lacks being none; the release SHALL place it,
or with the right button or in notes mode toggle its note on an empty
square. A release back on the square SHALL clear it, and one that commits
nothing SHALL be a tap.

#### Scenario: A drag places an arrow

- **WHEN** a `pointing` board's open square is pressed and dragged a
  square up and a little right, and released
- **THEN** the press makes no move and selects nothing, and the release
  places the up arrow there

#### Scenario: A drag back clears

- **WHEN** a square holding an arrow is pressed and released on itself
- **THEN** its arrow is cleared

### Requirement: A board whose every piece points is keyed by its way

On such a board each value SHALL be typed by the number pad digit of its
way (8 up, 2 down, 4 left, 6 right), its key labeled by an arrow. Enter
SHALL arm the selection for an arrow key, which places the value pointing
its way, and SHALL NOT switch notes; Space SHALL arm a note on an empty
square, or clear where a value is armed. An armed selection SHALL show a
`?`, in the entry color for a value and in pencil for a note.

#### Scenario: Keys by their ways

- **WHEN** the keypad of a `pointing` board is asked for, and 8 is typed
- **THEN** its keys are labeled ↑ ↓ ← → and send 8, 2, 4 and 6, and 8
  places the up arrow

#### Scenario: Enter arms an arrow key

- **WHEN** Enter is pressed on a selected open square, and then the left
  arrow key
- **THEN** a `?` shows in the entry color, then the left arrow is placed
  there and the selection does not move

### Requirement: A born game's board may show highlights the player switches

`play.highlights` MAY list washes, each over the cells, placed and given
included, a formula holds of on the values as they stand. Each SHALL be a
boolean preference by its key and name, on unless the description says
off, and SHALL paint a shown cell's surface in its paint, the goal's wash
or the mistake's, the first listed where two hold. A highlight SHALL be an
aid to reading the board alone: neither the rules, the live errors nor the
hint read it.

#### Scenario: Arrows leading off the board

- **WHEN** a `pointing` board has two arrows leading off its top edge, one
  of them through the other, and two side by side pointing at each other
- **THEN** the three leading off are washed in the goal's wash, and the two
  pointing at each other are washed in the mistake's wash only once the
  loop preference, off by default, is switched on

### Requirement: A picture's name is how a player is told its value

Each picture SHALL have a name, which the hint says its value by, with its
article ("can only be a ghost", "the struck ghost must go"), and the keypad
labels its key with, capitalized. A digit SHALL type the value it numbers
whatever the alphabet's letters.

#### Scenario: The keypad of a board of monsters

- **WHEN** the keys of a `sighting` board are asked for, and `1` and `3`
  are typed on an open square
- **THEN** they are labeled Ghost, Vampire, Zombie and Clear, and the square
  holds a ghost, then a zombie

### Requirement: The compiler refuses pictures a board cannot draw

The compiler SHALL refuse `play.numbers.pictures` naming a painter no
description may name, painting values that are not every value from 1,
beside an alphabet of another length, or holding A where the player may
switch the pictures for the glyphs, or beside a raised
value or an empty square.

#### Scenario: An alphabet holding A

- **WHEN** a `portraying` description's alphabet is `GAZ`
- **THEN** the compiler refuses it, since `A` switches the pictures

### Requirement: A board of notes no placement narrows offers no auto-pencil preference

A born game whose board has no unit and no technique run on placing SHALL
offer no preference to remove what a placement rules out, since a placement
rules out nothing.

#### Scenario: A board of monsters

- **WHEN** the preferences of a `sighting` game are listed
- **THEN** none of them removes what a placement rules out

### Requirement: The compiler refuses a step the walk never reads

The compiler SHALL refuse a board of notes' step worded under a name the
candidate walk reads on no board and no other step's clause speaks, since
the walk says its singles and its opening in the engine's words.

#### Scenario: A worded single

- **WHEN** a `boxing` description words a step `single`
- **THEN** the compiler refuses it

### Requirement: A born game's board of numbers may hold values only the deal places

`play.given` on a board of numbers SHALL name values, running on from one
another above every value the player places, that only a clue fixing a
cell holds: each SHALL be drawn by its painter whatever the player's
preference, printed as its glyph, offered no key and taken by no note, and
the keypad SHALL end below them. The answer's domain MAY differ from cell
to cell where such a clue narrows it, and the board's givens SHALL be the
values below them.

#### Scenario: A mirror on a board of monsters

- **WHEN** a `sighting` board with a mirror is drawn as pictures and again
  as letters
- **THEN** the mirror is drawn as the same lines both times, and its
  keypad offers a ghost and a zombie alone

### Requirement: A born game's derived clue may read a kind dealt before it

A clue a sampled deal derives whose meaning reads another clue kind SHALL
be handed the clues dealt before it, and the compiler SHALL refuse one
reading a kind dealt after it. A clue at the board read a binding whose
binding or fields read a clue kind, directly or through a definition,
SHALL be handed the clues dealt before it the same way.

#### Scenario: Sightlines through mirrors

- **WHEN** the `sighting` description lists its sightline numbers after
  its mirrors, and again before them
- **THEN** the first deals the numbers through the mirrors, and the second
  is refused

#### Scenario: Runs between walls

- **WHEN** an `opening` board is dealt, its list read along the runs a
  definition finds between its walls
- **THEN** the list holds each run's digits

### Requirement: A born game's ID may write slots side by side, a side backwards

An `id:` segment of a kind at slots, `numbers` or a stream, SHALL write
the slots side by side in the order `sides` names, each side left to right
or top to bottom, or the other way where it is named `backwards`, and the
compiler SHALL refuse a side named twice. The text format SHALL print a
row of counts beneath the grid, each record its value's glyph and count.

#### Scenario: Upstream Undead's clockwise numbers

- **WHEN** a `sighting` ID writes twelve numbers round a 3x3 grid as
  top, right, bottom backwards, left backwards
- **THEN** each number is read at the slot going round the grid clockwise
  from the top left, and the board writes back the same ID

### Requirement: A born game's first cells may be laid a cell at a time, each one of several values

A sample's `first` cells SHALL be laid either by a share and a symmetry
the settings give, or each cell alone at a `chance`, the board drawn again
until the share laid is within `within`; of a list of values, each cell
laid SHALL take one at random. A build on first cells SHALL read only the
clue kinds the answer's domain reads.

#### Scenario: Undead's mirrors

- **WHEN** the `sighting` fixture deals 4x4 boards, its mirrors laid at a
  chance of one in five within a tenth and a half of the squares
- **THEN** each board holds between two and eight mirrors, and both ways
  of mirror appear among them

### Requirement: A born game's deal may refuse its first cells and its board by tier

A first cells' `keep`, one formula or one a tier, SHALL draw the first
cells again before the build or the uniform draw unless it holds of the
clues they deal and the sizes, and the compiler SHALL refuse one reading a
kind the domain does not read. A deal's `keep` SHALL draw a board again unless it holds of the
clues its answer derives, before any is hidden. The compiler SHALL refuse
a keep by tier that leaves a tier out, and one that is no truth.

#### Scenario: Upstream Undead's sightlines and kinds of monster

- **WHEN** the `sighting` fixture deals boards with a keep on its first
  cells' longest sightline and one on its counts
- **THEN** no dealt board's sightline passes more squares than the keep
  allows, and every dealt board's counts hold as the keep says

### Requirement: A born game's build may fill sightlines first, each singled out by its numbers

A sample's `sightlines` SHALL, before the build, take each sightline
through the cells of a kind, the fewest squares first, and give its
undecided cells at random a filling whose two end clues no other filling
of them derives, until no more than the tier's `open` cells are undecided.

#### Scenario: Upstream Undead's get_unique

- **WHEN** the sightlines are laid on a 4x4 with no mirror
- **THEN** the first sightline's two numbers are those of its filling
  alone

### Requirement: A born game's tier may bound how often a rung fires

A technique's `most` SHALL make a board that the ladder at the
technique's own tier finishes only by firing it more often than that a
board of the tier above. The hint and the solve SHALL run the technique as
often as it fires.

#### Scenario: Upstream Undead's Easy passes

- **WHEN** a board of ghosts is solved at Easy with its sightline rung
  allowed one firing, and allowed none
- **THEN** the first is solved at Easy, and the second only at the tier
  above

### Requirement: A born game's clue at the board may be a list read a binding

A clue at the board the deal states records for (`deal.records`) SHALL be
dealt one record for each binding of its `for`, each field read off its
formula, a list field the answer's values along the ordered cells its
formula gives, and the records SHALL be held sorted, field by field, a
list shorter first and then member by member. A field read off no formula,
or a list field off anything but an ordered set of cells, SHALL be refused
by the compiler.

#### Scenario: Every line's digits

- **WHEN** a `listing` board is dealt and solved
- **THEN** its clue holds each row's and each column's digits, sorted

### Requirement: A born game's ID may write a list read a binding whole

The ID's `numbers` segment of a clue at the board read a binding SHALL
write every record whole, a digit a member, between commas, and read
records to the desc's end, held sorted however the desc orders them. The
compiler SHALL refuse the segment anywhere but last, and a list field
whose members are not digits.

#### Scenario: The digits written whole

- **WHEN** a `listing` board is dealt
- **THEN** its ID is each record's digits between commas, and reads back
  to the same clue in any order

### Requirement: A born game's answer may be drawn a value a cell

A deal whose sample is `uniform` SHALL draw each cell a value from 1 to the
top of the answer's domain at random, each alike, after its first cells,
whose values it lays on no other cell. The top SHALL be read with the
clues the first cells deal, where the domain reads them.

#### Scenario: A board drawn with nothing to steer it

- **WHEN** a `listing` board is dealt, whose list no build can read
- **THEN** a board is dealt, and the ladder finishes it

### Requirement: A born game's first cells may be what an opening leaves

First cells `opened` SHALL be laid on every cell an opening leaves: the
cells opened one at a time in a random order, tried before each opening
and after the last, until every two by two block holds an open cell and
the open cells are joined, the opening begun again where it tries every
cell and never gets there. Each try SHALL lay any cell whose block's other
three are open, opened or not.

#### Scenario: Upstream Crossing's walls

- **WHEN** `opening` boards are dealt at 5x4, 7x7 and 9x6
- **THEN** every two by two block of each holds a wall and an open square,
  and every open square has an open neighbor

#### Scenario: A layout the keep refuses

- **WHEN** `opening` boards are dealt at 7x7, its keep refusing a run
  longer than four squares
- **THEN** no board holds one, and layouts were refused before an answer
  was drawn on them

### Requirement: A born game's opening may keep a symmetry

With first cells `opened` under a `symmetry`, on where flag `when` is on
or always with no `when`, a cell the opening opens or lays SHALL open or
lay its orbit with it.

#### Scenario: Symmetric walls on a board even in a side

- **WHEN** `opening` boards are dealt at 7x6 with the symmetric flag on,
  and with it off
- **THEN** every board with it on is the same turned half round, and some
  with it off are not

### Requirement: The compiler refuses an opening laid any other way besides

The compiler SHALL refuse first cells `opened` with a share, a symmetry
of their own, a chance or a bound, a `when` that is no flag the settings
give, and a `when` with no symmetry.

#### Scenario: An opening at a chance

- **WHEN** the `opening` description's first cells are given a chance
  beside their opening, and then a `when` naming a size
- **THEN** each is refused

### Requirement: A born game's ID may write a marker's cells as runs

The ID's `spans` segment of a cell's one-valued marker SHALL write every
cell in a run: a run of the marker's cells a letter, `a` one to `z` 26,
letters side by side adding, and a run of the other cells its length as a
number. It SHALL refuse runs past the board or short of it. The compiler
SHALL refuse the segment of a kind that is no one-valued marker.

#### Scenario: Upstream Crossing's wall runs

- **WHEN** a 9x4 `opening` ID writes 27 walls and then 9 open squares
- **THEN** it reads `za9`, and `yb9` reads the same walls

### Requirement: A born game's clue at the board may be drawn as a list

`play.list` SHALL draw a clue at the board whose records are lists beneath
the board, each record its members' glyphs, laid out as upstream crossing.c's
`draw_numbers` lays its numbers: in columns, as many rows deep as fit the
board's width, the slack spread between them. A record SHALL be struck and
gray where its meaning holds of the board as placed, and in the error color
where the rules break it. The text format SHALL print the list beneath the
grid, a line a length.

#### Scenario: A number read once, and one read twice

- **WHEN** a `listing` board's first row reads 1123, and then its second
  row reads 1123 too
- **THEN** 1123 is struck and gray, and then in the error color and not
  struck

### Requirement: A hint marks a record of a list where the list draws it

A hint's ring and outline on a record of a clue at the board SHALL go round
it where the list draws it, and no tile SHALL draw them. The compiler SHALL
refuse a list naming no clue at the board the deal derives, or one whose
records are not one list each.

#### Scenario: A step reading a number

- **WHEN** a step of a `listing` board rings the number only one line fits
- **THEN** the ring goes round that number in the list, and none is drawn
  on the grid for it

### Requirement: A born game's typing may go along its list's sites

`play.along` SHALL make a value typed on a board of numbers move the
selection to the next square of the site it is filling, a site being the
ordered cells a binding of `deal.records` reads a record of the list off.
It SHALL NOT move for a note, a clear or with the `advance` preference off,
and after a site's last square a selection the pointer placed SHALL be put
away.

#### Scenario: A whole number after one press

- **WHEN** the first square of a `running` board's three-square row is
  pressed and its three digits typed
- **THEN** each digit fills the next square, and after the last no square
  is selected

#### Scenario: A value the square holds already

- **WHEN** a square holding 8 is selected and 8 is typed
- **THEN** no move is made and the selection moves on

### Requirement: The way typing goes along a site is the player's

On a board typed along its list's sites, the way the selection moves, a
row's or a column's, SHALL be set by the arrow last pressed, snapped to the
one site through a square that lies in one, and turned by a second press on
a square selected for typing that two sites cross; a second press elsewhere
SHALL put the selection away, as on any board of numbers.

#### Scenario: A second press turns the way

- **WHEN** a square where a row and a column cross is pressed twice and a
  digit typed
- **THEN** the selection moves down the column

### Requirement: A born game's list may be written whole into a site

On a board typed along its list's sites, a press on a record of the list
SHALL write it into a site through the square selected for typing that it
fits, or else pick it up, or put it down where it was held. A record SHALL
fit a site as long as it, agreeing with every value placed there, and read
along no other site; where both sites through the square take it, the one
holding more values SHALL, a tie going the selection's way. In notes a
press on a record SHALL only hold it.

#### Scenario: The run more written in takes it

- **WHEN** a `running` square where an empty row crosses a column holding
  one of 813's digits is selected, the way the row's, and 813 is pressed
- **THEN** 813 is written down the column

### Requirement: A held record is dropped into a site or put down

A press on a square of a site a held record fits SHALL write it there and
leave the square selected; a press on an open square it fits no site
through, or a value or clear typed, SHALL put it down; a press on a fixed
square, a right press and an arrow SHALL leave it held.

#### Scenario: A press where it cannot go

- **WHEN** the four-digit number of a `running` board is held and a square
  of three-square runs is pressed
- **THEN** nothing is written, no number is held, and the square is
  selected

### Requirement: A born game's sites through the selection are washed

On a board typed along its list's sites, the sites through the selection
SHALL be washed, the row's and the column's each its own color, unless the
`wash` preference is off or a hint shows. A held record's sites SHALL be
washed: the one it is read along, else every one it fits, its values
previewed on the empty squares where one site alone takes it.

#### Scenario: A number one run takes

- **WHEN** the one four-digit number of a `running` board is held
- **THEN** the four-square column is washed and the number's digits are
  previewed down it

### Requirement: A born game's list may also be its reference aid

Where `play.along.panel` names what a record and a site are called, the
game SHALL offer the list as its reference aid, titled by the record's
plural, its records grouped by length: each placed or in conflict as the
list strikes or reddens it, fitting where a press on it would write it in,
and ruled out otherwise. A pick SHALL do what a press on the record in the
list does.

#### Scenario: Nothing selected

- **WHEN** no square of a `running` board is selected for typing
- **THEN** every number that fits some run is offered as fitting

#### Scenario: The numbers that fit the selection

- **WHEN** square 0 of a `running` board, on a two-square row and a
  four-square column, is selected for typing
- **THEN** the Numbers panel says the two-digit numbers and the four-digit
  one fit, and every three-digit number is ruled out

#### Scenario: A pick writes a number in

- **WHEN** the first square of a three-square run is selected and a number
  that fits it is picked in the panel
- **THEN** the number is written along the run, as a press on it in the
  list would write it

### Requirement: A born game's build may fall back on a value where none fits

Where `sample.fallback` names a value, a build SHALL give it to an
undecided cell its placements leave no value, whether or not the cell's
domain holds it while the answer is built, and SHALL go on building. A
build that gives it to more cells than its `most`, a number or a formula
of the board's sizes, SHALL be thrown away.

#### Scenario: A goal where no arrow fits

- **WHEN** a `merging` board is dealt
- **THEN** its answer holds at least one goal, and no more than one in 25
  of its squares or one

#### Scenario: Too many goals

- **WHEN** `merging` boards of 36 and 40 squares are dealt
- **THEN** some builds needing a second goal are thrown away

### Requirement: A born game's partition may be merged on its answer

Where `deal.merge` names a dealt partition, it SHALL be a part a cell while
the answer is drawn; then each two neighboring cells, in a random order,
SHALL have their parts joined wherever the answer, its clues derived on the
joined partition, is still an answer. The compiler SHALL refuse a merge of
no dealt partition, and one beside a grow or a divide.

#### Scenario: Areas no two of which could join

- **WHEN** a `merging` board is dealt and solved
- **THEN** each area holds each arrow at most once and a goal alone, and
  any two neighboring areas joined would hold an arrow twice or a goal
  with another square

### Requirement: A born game's hint may say a value with the verb a cell takes it by

`words.be` MAY name the verb a cell takes a value by; the candidate walk's
own sentences SHALL then say a value with that verb and no article.
`words.note` MAY name what a struck value is called, which the walk's
strikes SHALL say in place of the value alone.

#### Scenario: A square that can point only one way

- **WHEN** a Rome hint places the one arrow left in a square with marks
- **THEN** its sentence says the square must point that way, with no
  article before the way

#### Scenario: A struck way

- **WHEN** a Rome hint strikes, from the rest of an area, a way a square
  of it was just given
- **THEN** its sentence says the struck mark of that way must go

### Requirement: A hint says why a distinct part must hold a value

Where a description's parts are distinct and its `steps` word
`hiddenSingle`, a hidden single in a part SHALL be said with that step's
words, the part striped and its size a term, so a sentence can say why the
part must hold the value: it has as many cells as values, or its cells can
take no more values between them than it has cells. The compiler SHALL
refuse a `hiddenSingle` step that marks anything but the part's stripes.

#### Scenario: An area of three at the board's edge

- **WHEN** a Rome hint places the one arrow only one square of a
  three-square area on the left edge can still point
- **THEN** its sentence says the area's three squares can point only three
  ways between them, and the area is striped

### Requirement: A born game's partition may be dealt as dominoes

Where `deal.divide` names a dealt partition with `dominoes`, the board
SHALL be tiled at random by parts of two neighboring cells, one cell alone
where its area is odd, before the answer is drawn, and an answer the deal
builds SHALL be built on it. The ID's `pairs` segment SHALL write it as a
letter a cell, where its partner lies or `*` alone, and SHALL refuse two
cells that do not name each other or a partner across the board's edge.

#### Scenario: An odd board

- **WHEN** a 5x3 `tiling` board is dealt
- **THEN** every part is two neighboring cells but one, which is alone,
  and its answer holds a 1 and a 2 in each domino

#### Scenario: A pair round a row's end

- **WHEN** a `tiling` ID names the last cell of the top row and the first
  of the next as each other's partner
- **THEN** the ID is refused

### Requirement: A born game's clue one a value may be of some values, at a line's two ends

A clue kind whose `per` lists values SHALL be dealt, written and read for
those values alone. Where `play.ends` lays them, a line's clues of `start`
SHALL be drawn before its start and of `end` past its end, each end's
values headed in its corner, a press or Shift with the arrow toward an end
marking that end's clue done. The `numbers` segment's `alphabet` SHALL
write a value a character, `byValue` a value at a time.

#### Scenario: Counts at both ends

- **WHEN** an `ending` board is drawn
- **THEN** each line's count of 1s stands before it and of 3s after it, and
  no count of 2s is drawn, dealt or written

#### Scenario: The ID a character a count

- **WHEN** an `ending` 4x4 board is written
- **THEN** its ID is the columns' and rows' 1s, then their 3s, four
  characters a run, each run closed by a comma

### Requirement: A born game's dealt part may be played whole

Where `play.whole` names a dealt partition, a value placed in one square of
a part, by any edit, SHALL write each other open square of it `others` of
that value, and emptying one SHALL empty them. A `click` given by button
SHALL go round empty and that button's values from the square pressed, and
SHALL leave a square holding a value its list does not name. A build's
`count` SHALL give its value to that many first cells, and `prefer` each
later cell the first value it may hold.

#### Scenario: A magnet turned round

- **WHEN** a `poling` domino's left end is clicked twice
- **THEN** it holds a 3 there and a 1 at the other end, and a third click
  empties both

#### Scenario: A neutral tile is the right button's

- **WHEN** a `poling` domino holding two 2s is clicked with the left button
- **THEN** nothing changes

#### Scenario: A few neutral tiles first

- **WHEN** a `poling` 4x4 board is dealt, its build laying a tenth of the
  squares 2s and then preferring a 1
- **THEN** its answer holds two 2s, one domino's, and every other domino
  is a magnet

#### Scenario: A placed tile is drawn as one

- **WHEN** a `poling` domino holds a 1 and a 3
- **THEN** its + half, red, reaches the line where its − half, ink, begins,
  and a domino of 2s is drawn green at both ends, each with its cross

### Requirement: A born game's clue at an edge may be a horseshoe

A born game's clue at an edge valued by which of its two cells holds the
other, 1 the cell above or left, 2 the other and 0 neither, MAY be drawn
as a horseshoe in the gap (`shoe`): its open side SHALL face the cell that
holds and its rounded side the cell held, nothing SHALL be drawn where it
is 0, and a 0 that breaks its meaning SHALL be drawn as a cross in the
error color.

#### Scenario: A horseshoe opens toward the holder

- **WHEN** a `holding` board has {A} above the empty set
- **THEN** the horseshoe between them opens upward, and none is drawn
  between {A} and {B} beside it

#### Scenario: A missing horseshoe breaks

- **WHEN** the empty set is placed beside {B} with no horseshoe between
- **THEN** a cross is drawn in the error color in their gap

### Requirement: A born game's notes may be full from the deal

A born game's candidate notes MAY be declared full: what each open cell
can still hold, never a cell left unnoted. Every open cell's notes SHALL
be its domain as dealt and again wherever its value is cleared; a move
that leaves a cell one note SHALL place that value there; a strike that
would leave an open cell no note SHALL leave its notes as they were; and
the game SHALL offer no hint-notes preference.

#### Scenario: Narrowed to one set

- **WHEN** a `holding` square's notes are struck down to {A}
- **THEN** the square holds {A}

#### Scenario: A set cleared

- **WHEN** a `holding` square's set is cleared
- **THEN** its notes are every set again

### Requirement: A born game's value may be drawn as its features

A born board of numbers whose notes are full MAY declare each value a set
of features, each drawn as its letter in a fixed slot of the square. A
placed value SHALL draw each feature it has as its letter and a cross in
each other slot; an open square SHALL draw a feature's letter where every
note has it, a cross where no note has it, and nothing in the slot
otherwise. The compiler SHALL refuse features over notes not kept full, or
beside another way of drawing the values.

#### Scenario: A placed set's letters

- **WHEN** a `holding` square holds {A}
- **THEN** its first slot shows A and its second a cross

#### Scenario: What the notes agree on

- **WHEN** a `holding` square's notes are {A} and {A, B}
- **THEN** its first slot shows A and its second shows nothing
