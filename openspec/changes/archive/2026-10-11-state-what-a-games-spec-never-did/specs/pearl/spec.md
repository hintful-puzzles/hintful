## ADDED Requirements

### Requirement: A Pearl run letter counts its unclued squares from a

In a description, the letters `a` through `z` SHALL each stand for a run of 1
to 26 unclued squares, a longer run being written as several letters. The
unclued squares after the last pearl SHALL be written too, so that the
description covers the grid exactly.

#### Scenario: A dealt 6×6 board

- **WHEN** `BbBjWBWbBmWaB` is read as a 6×6 board
- **THEN** its first row is a black pearl, two unclued squares, a black pearl
  and two unclued squares, the `j` covers those two and the eight squares
  after them, and the board's last square is a black pearl

### Requirement: Pearl's difficulty letters are e and t

The letter after `d` SHALL be `e` for Easy and `t` for Normal, and the short
form SHALL leave both out. Decoding a string with no difficulty letter, or
with a letter that is neither, SHALL give Easy, whatever the default preset's
difficulty.

#### Scenario: A string with no letter

- **WHEN** `6x6` is decoded
- **THEN** the board is Easy and its full encoding is `6x6de`, though the
  default preset, `8x8dt`, is Normal

#### Scenario: The Normal preset

- **WHEN** `6x6dt` is decoded
- **THEN** the board is the 6×6 Normal preset, and its short form is `6x6`

### Requirement: A Pearl click toggles the edge nearest the press

A press and release with no drag between SHALL address the side of the pressed
square nearest the press. The left button SHALL draw or undraw the line across
it, and the right button SHALL set or clear its cross. A press within a
quarter of a square of the square's middle, or nearest a side on the grid's
rim, SHALL make no move. A cross SHALL be refused on an edge that holds a
line.

#### Scenario: A cross on a drawn line

- **WHEN** the player right-clicks an edge that holds a line
- **THEN** no move is made and the line stays

#### Scenario: A click on the middle of a square

- **WHEN** the player clicks the middle of a square with either button
- **THEN** no move is made

### Requirement: Pearl's Enter key traces a path the arrows extend

Enter on a hidden cursor SHALL only show it. On a showing one it SHALL start a
path at the cursor's square, each arrow SHALL then extend it as a drag would,
and Enter again SHALL commit it as a drag's release does. Space, Escape,
Backspace or Delete SHALL abandon it. Ctrl with an arrow SHALL draw or
undraw the line that way and move the cursor along it. Shift with
an arrow SHALL set or clear the cross there and leave the cursor; with both
held the line is toggled and the cursor stays.

#### Scenario: A path traced by keys

- **WHEN** on a board with no line or cross Enter is pressed on a square, the
  right arrow twice, and Enter again
- **THEN** one move draws the two segments the cursor crossed

#### Scenario: A path abandoned

- **WHEN** Enter is pressed on a square, the right arrow twice, and then Space
- **THEN** no move is made, and the next Enter starts a new path
- **AND** Delete in place of Space does the same

### Requirement: Pearl's hint reads a square off its own edges

A step about one square SHALL conclude, from that square's pearl and edges
alone: a square with two lines takes no other; a line with one other way to go
on takes it; a square with no line and one open edge cannot use it; a black
pearl takes no line opposite one it has, and takes the edge whose opposite is
ruled out or off the board; a white pearl's line leaves by the edge opposite
the one it enters, and runs along the axis no edge of which is ruled out or
off the board.

#### Scenario: A white pearl on the board's edge

- **WHEN** a white pearl with no line sits in the top row
- **THEN** the step asks for the lines to its left and its right, and says its
  line must run along the board's edge

### Requirement: Pearl's hint reads a black pearl from the square past it

A step SHALL conclude that a black pearl's line carries on out of the far side
of the next square, outlining the pearl. It SHALL conclude that a black pearl
cannot point at a square that cannot run straight on, because that square
holds a black pearl, has a line off to the side, has its far edge ruled out,
or is at the board's edge, outlining that square and saying which.

#### Scenario: Two black pearls side by side

- **WHEN** the square beside a black pearl holds another black pearl
- **THEN** the step crosses the edge between them, outlines the second pearl's
  square, and says it holds a black pearl, which must turn

### Requirement: Pearl's hint reads a white pearl from the squares beside it

Where neither square beside a white pearl on one axis could turn into it, a
step SHALL run the pearl's line along the other axis, outlining those two
squares. Where a white pearl's line runs straight on through the square on one
side, a step SHALL make the square on the other side turn, by the line that
turns it or the cross that stops it running straight on, outlining the square
the line runs through.

#### Scenario: A white pearl whose line runs on to the right

- **WHEN** a white pearl's line runs straight through it and through the
  square to its right
- **THEN** the step decides an edge of the square to its left, and says the
  pearl turns on its other side

### Requirement: Pearl's hint rules out a loop that would close early

Where an edge would join the two ends of one stretch of line into a loop that
leaves something out, a step SHALL cross that edge. Where a square's one way
through would do so, the step SHALL cross its edges and say it stays empty,
and where a white pearl would do so along one axis, the step SHALL run it
along the other. The step SHALL outline the stretch of line, and say whether
the loop would miss a pearl or only other lines.

#### Scenario: A loop that would miss only lines

- **WHEN** an edge would close a stretch of line into a loop with every pearl
  on it, and another line is drawn elsewhere
- **THEN** the step crosses the edge and says the loop would miss other lines

### Requirement: Pearl's hint tries a square, then a pearl, then an early loop

At each step the hint SHALL take the first that fires of: a square read off
its own edges, a pearl read from the squares beside it, and, only where
neither fires anywhere, a loop that would close early, an edge before a
square. It SHALL apply no difficulty cap, so a board dealt at Easy and one
dealt at Normal are hinted in the same order.

#### Scenario: A loop rule waits for the plainer steps

- **WHEN** some square can be read off its own edges and some edge would also
  close a loop early
- **THEN** the step is the square's
