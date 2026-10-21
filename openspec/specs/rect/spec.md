# rect Specification

## Purpose
Rectangles (Shikaku), the puzzle of dividing a grid into rectangles that each
contain exactly one number, equal to its area: its params and description
encodings, what its generator promises of a board, completion and mistake
reporting, its hint, its input, and the look that is its own.

## Requirements

### Requirement: Rules: Rectangles reports completion and mistakes

A cell SHALL be correct if and only if it belongs to a valid rectangle: all of
its boundary edges present, none interior, and exactly one contained number,
equal to the rectangle's area. The board SHALL be completed when every cell is
correct.

#### Scenario: The last rectangle completes the board

- **WHEN** the player's edges divide the whole grid into rectangles that each
  hold exactly one number, equal to its area
- **THEN** every cell is correct and the game is reported solved

#### Scenario: A rectangle holding two numbers is not correct

- **WHEN** the player's edges enclose a rectangle that holds two numbers
- **THEN** none of its cells is correct

### Requirement: Rules: Rectangles flags a drawn edge the solution lacks

`findMistakes` SHALL return every edge the player has drawn that the board's
one answer does not contain. A missing edge SHALL NOT be a mistake.

#### Scenario: A wall the solution does not contain is flagged

- **WHEN** the player has drawn an edge that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake

### Requirement: Params: Rectangles' parameters and their encoding

Params SHALL be `w`, `h`, `expandfactor`, a non-negative float that defaults
to 0, and the difficulty. They SHALL encode as `{w}x{h}`, followed in the
full form only by an `e{%g}` suffix for a non-zero expansion factor and then
the difficulty, Easy as `de` or Unreasonable as `du`; the short form SHALL
write neither. A bare `{n}` SHALL decode as a
square of that side, and an ID with no difficulty letter SHALL decode as Easy.
A grid whose area is less than 2 SHALL be refused.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, expandfactor: 0.5 }` at Unreasonable are
  encoded in full
- **THEN** the result is `10x10e0.5du` and decoding it round-trips the params

#### Scenario: A string from before the tiers

- **WHEN** `9x7`, written before the game had tiers, is decoded
- **THEN** the params are Easy, and their full encoding is `9x7de`

#### Scenario: The short form drops the expansion factor

- **WHEN** params `{ w: 7, h: 7, expandfactor: 0.5 }` are encoded in the short
  form
- **THEN** the result is `7x7`

#### Scenario: A grid of one square is refused

- **WHEN** params of a 1×1 grid are validated
- **THEN** they are refused with an error string

### Requirement: Params: Rectangles reads past upstream's unchecked-board letter

Decoding SHALL read past upstream's trailing `a`, which asks for a board with
no promised single answer, and SHALL read the difficulty after it. Encoding
SHALL never write the `a`.

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `9x7a` is decoded
- **THEN** the params are those of `9x7`, and a board dealt from them has one
  solution
- **AND** `10x10e0.5adu` decodes as an Unreasonable 10×10 board with an
  expansion factor of 0.5

### Requirement: Params: Rectangles' menu offers its two largest sizes at Easy alone

Rectangles' menu SHALL be the grid `presets` builds from its sizes
(`engine-params`, "The preset menu is a grid"), with one departure: the two
largest, 17×17 and 19×19, SHALL be offered as Easy alone.

#### Scenario: The menu's twelve lines

- **WHEN** Rectangles' preset menu is read
- **THEN** its first five sizes each appear as Easy and then as Unreasonable,
  and 17×17 and 19×19 follow as Easy

### Requirement: Params: Rectangles refuses no board for the time its deal takes

`validateParams` SHALL refuse no size, at either difficulty, for the time its
deal takes: a player can stop a deal.

#### Scenario: A large board is asked for at both difficulties

- **WHEN** a 21×21, an 8×50 and a 100×100 board are checked for dealing at
  Unreasonable, and a 100×100 board at Easy
- **THEN** none is refused

#### Scenario: A board past the menu is dealt and opens

- **WHEN** an Easy 60×60 board is dealt and its ID is pasted back
- **THEN** it opens as Easy

### Requirement: Params: Rectangles refuses a grid of more than a million squares

`validateParams` SHALL refuse a grid of more than 1,000,000 squares, whether a
board is to be dealt or one arrives with its description.

#### Scenario: One row too many

- **WHEN** the height of `7x7de` is changed to 142858
- **THEN** the params are refused with "Width times height must not be
  unreasonably large."
- **AND** with a height of 142857 they are not

### Requirement: Params: Rectangles refuses Unreasonable only where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide, one two wide and up to eight long, a 3×3 one and a 3×4
one. The hint finishes every board of those shapes that has one answer. A
board two wide and nine long or more SHALL be dealt, though the generator
seldom draws one ("A rare tier is dealt under the deadline").

#### Scenario: The small boards are not dealt at Unreasonable

- **WHEN** a 1×30, a 2×8, a 3×3 and a 4×3 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×8 board is still dealt at Easy, and a 2×12, a 3×5 and a 4×4
  board are admitted at Unreasonable

#### Scenario: Every board of a refused shape is tried

- **WHEN** every division into rectangles of a 1×2, 1×5 and 1×8 board, of a
  2×2 to a 2×8 board, and of a 3×3 and a 3×4 board, with each rectangle's
  number on each of its squares, is given to the solver, and those it leaves
  unfinished that have one answer are given to the hint's steps
- **THEN** the steps finish every one
- **AND** the same walk over a 3×5 board finds 48 they do not

#### Scenario: The short two-wide boards are dealt

- **WHEN** a 2×9 and an 11×2 board are asked for at Unreasonable
- **THEN** neither is refused

### Requirement: Description: Rectangles descriptions use the upstream encoding

The desc SHALL encode the `w × h` grid row-major as a run-length string: a
lowercase letter `a`–`z` for a run of 1–26 consecutive empty (non-numbered)
squares, a decimal number for each numbered square, and a `_` between two
adjacent numbers. A desc with an unknown character, or whose decoded square
count does not exactly fill the grid, SHALL be refused.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc with too much or too little data to fill the grid is
  validated
- **THEN** the result is a non-null error string

### Requirement: Description: A Rectangles description's number is from 1 to the grid's area

Parsing a desc SHALL refuse a number below 1 or above `w * h`. A `_` SHALL be
required between two numbers with no empty square between them, and SHALL be
refused anywhere else.

#### Scenario: A dealt 7×7 board

- **WHEN** `2e6b2_4c5d2b2a4b6a2e2c4_2_2c4c` is read as a 7×7 board
- **THEN** its first row is a 2, five empty squares and a 6, and its second
  row opens with two empty squares, a 2 and a 4 side by side

#### Scenario: A number larger than the grid

- **WHEN** the first `2` of that description is changed to `50`
- **THEN** the board is refused with "This game ID has a number out of range
  for its board."
- **AND** with `49` there instead, the description is read

#### Scenario: Two numbers with no separator

- **WHEN** the `_` of that description's `2_4` is taken out
- **THEN** the two read as one square holding 24, and the description is
  refused as too short for its board

### Requirement: Generation: Rectangles generates by tiling, stretching and solving

The generator SHALL tile the base grid at random, leave no rectangle of one
square, and stretch it to full size by the expansion factor. At Easy it SHALL
call the solver on every layout, which places the numbers, and return only one
the solver reaches a unique placement for.

#### Scenario: A layout the solver cannot make unique is discarded

- **WHEN** the solver does not reach a unique placement on a layout dealt for
  an Easy board
- **THEN** the generator lays out another grid

### Requirement: Generation: Rectangles deals only boards its hint can finish

At Easy the generator SHALL deal only boards the hint's steps finish from an
empty board, dealing again where a board it laid out would leave them short.
The desc of a seed for which upstream deals such a board SHALL differ from
upstream's.

#### Scenario: A board past the hint is dealt again

- **WHEN** the generator, dealing an Easy board, lays out a uniquely solvable
  board the hint's steps cannot finish
- **THEN** it draws another board instead of returning that one

### Requirement: Generation: An Easy Rectangles board is one the hint finishes

The lowest difficulty SHALL solve a board exactly where the hint's steps
finish it from an empty board and the search proves it has one answer,
whether or not the solver reaches a unique placement on it.

#### Scenario: A board only the hint finishes is Easy

- **WHEN** `7x7:b4c2b3a2_2a2b3c4a4b3_6b6h4e2a2a` is entered, a board the
  hint's steps finish and the solver stalls on
- **THEN** it opens as Easy

#### Scenario: A board the solver finishes and the hint does not is Unreasonable

- **WHEN** `9x9:c4c5b9c12b2h2k12e2f2_3c12a8l3d5d` is entered, a board the
  solver settles by ruling placements out that no line can record
- **THEN** it opens as Unreasonable

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the hint does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

### Requirement: Generation: An Unreasonable Rectangles board has one answer that the hint does not reach

At Unreasonable the generator SHALL put each number on a square of its
rectangle at random and, while the search finds an answer other than the
division as dealt, move a number whose rectangle differs in it to a square of
its dealt rectangle that the other leaves out. It SHALL keep the board only
where the dealt division is then the only answer and neither the solver nor
the hint's steps finish it. Each search SHALL have a budget well under a
pasted board's.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards at 5×5, 7×7 and 3×10, and at
  11×11 with an expansion factor of 0.5
- **THEN** neither the solver nor the hint's steps finish any of them
- **AND** exactly one division fits each board of up to 49 squares, by a count
  that has no search in it
- **AND** Solve's answer is the division the board was drawn as

#### Scenario: The smallest boards and the largest carry the tier

- **WHEN** an Unreasonable 4×4 board, a 4×5 board, a 5×5 board, a 2×12 board,
  a 15×15 board, a 19×19 board and a 30×30 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Generation: Rectangles deals a strip with an expansion factor

The generator SHALL make the base grid of a board one square wide one square
wide, whatever the expansion factor.

#### Scenario: A strip is stretched along its length alone

- **WHEN** a 1×7 and a 9×1 board are dealt with an expansion factor of 0.5 and
  of 2
- **THEN** each is dealt, and the hint's steps finish it

### Requirement: Solver: Rectangles' Solve returns the generator's answer, or the search's, as edges

`solve` SHALL return the generator's `aux` when it is present, and otherwise
SHALL be made from the answer of the game's search, as its edges.

#### Scenario: Solve without aux

- **WHEN** `solve` is called on a generated board with no `aux`
- **THEN** its move leaves the board solved
- **AND** on an Unreasonable board it is the move the `aux` gives

### Requirement: Solver: Rectangles' search tries the number with the fewest placements left

Rectangles SHALL count a board's answers with the engine's search over its
solver (`engine-difficulty`, "The engine counts a searching game's answers up
to two, within a budget of positions"). Where the solver stops, the search
SHALL take the first number with the fewest placements left and assume each
in turn. A position SHALL be impossible where the solver's deductions broke
off at a square no rectangle can cover, or a number has no placement left.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 5×5 board the solver finishes, on one with one
  answer that it does not reach, on a 4×4 board with several, on a 5×5 board
  whose numbers come to 26 and on one with no number
- **THEN** it reports one answer for the first two, several for the third and
  none for the last two

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 4×5 to 7×7, the same with a number moved to the
  square beside it and the same with two numbers swapped are each counted by
  covering the grid a rectangle at a time, each holding exactly one number
  that is its area
- **THEN** the search reports one answer exactly where one division fits,
  several where more do and none where none does

### Requirement: Controls: Rectangles input

`interpretMove` SHALL support a left-drag drawing a rectangle outline, a
right-drag erasing interior edges, a click near an edge toggling it,
and a keyboard cursor, moved square to square, with press-to-drag. Escape,
Backspace or Delete SHALL cancel that drag, or else hide the cursor. A pointer
position SHALL resolve to a grid corner or a square's center when close to
one, else to the nearer edge.

#### Scenario: A drag draws a rectangle outline

- **WHEN** the player left-drags from one grid vertex to another spanning a
  rectangle
- **THEN** `interpretMove` yields a rectangle move whose execution sets the four
  boundary edges of that rectangle and clears its interior edges

#### Scenario: A no-op click yields no move

- **WHEN** the player clicks where the pointer resolves to a grid corner or to
  a square's center, which names no edge
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

### Requirement: Controls: Rectangles' Enter draws from the cursor's square and Space clears

Enter or Space on a hidden cursor SHALL only show it. On a showing cursor
either SHALL start a drag at the middle of the cursor's square, and the arrows
SHALL then stretch it a square at a time. The same key again SHALL end it:
Enter SHALL draw the rectangle's outline and clear the lines inside it, and
Space SHALL only clear the lines inside. Ending with the other key SHALL make
no move and end the drag. A pointer press SHALL abandon a drag the keys
started.

#### Scenario: Space clears an area

- **WHEN** Space is pressed on a square, the cursor is moved one square right
  and one down, and Space is pressed again, over an area with lines inside it
- **THEN** one move clears the lines inside those four squares and draws none

#### Scenario: Enter twice on one square

- **WHEN** Enter is pressed twice with no arrow between
- **THEN** no move is made

### Requirement: Hint: A Rectangles hint step draws one rectangle or one line, and reads only the board

Every step of the hint SHALL draw one rectangle or one line, reasoning only
from the clues and the lines drawn. A clue's fits are the rectangles of its
area that contain it, stay on the board, take in no other clue and cross no
drawn line.

#### Scenario: The player draws the rectangle a side at a time

- **WHEN** the displayed step draws a rectangle and the player draws one of its
  sides
- **THEN** the step stays displayed, and it completes when the last side is
  drawn

#### Scenario: Upstream's 10x10 board is hinted to the end

- **WHEN** the hint is followed on `10x10e0.5:a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c`
- **THEN** it finishes the board, one of its steps a line, and the generator
  returns that board for upstream's seed

#### Scenario: The hint goes on from a rectangle drawn rightly

- **WHEN** the hint is followed on an Unreasonable board, and the solution's
  rectangle is drawn wherever the hint stops
- **THEN** the hint finishes the board

### Requirement: Hint: A Rectangles hint step is one of five deductions

A step SHALL be one of: a clue with one fit; a square only one clue's fits
reach, with one of those fits covering it; squares every fit of another clue
covers, leaving a clue one fit that avoids them; a fit that would leave another
clue no fit or a square no fit covers, when one fit remains; or an edge that
some fit crosses and that every fit across it is ruled out for, drawn as a
line.

#### Scenario: A clue with one fit

- **WHEN** every other rectangle of a clue's area around it runs off the board,
  takes in another clue or crosses a line
- **THEN** the hint rings the one that fits and names what rules out the others,
  outlining any clue it would take in

### Requirement: Hint: A line step names the clues that cannot cross the edge

A fit across an edge is ruled out when it takes a square every fit of another
clue covers, or leaves out a square no other clue's fits reach. The words of a
step that draws a line SHALL name the clues that could cross the edge and why
they cannot. An edge no fit crosses SHALL NOT be a step, since a line there
changes no fit.

#### Scenario: A line records a fit that is ruled out

- **WHEN** the only fits across an edge are one clue's, and each takes a square
  another clue covers wherever it goes
- **THEN** the hint rings the edge, outlines both clues, stripes the square, and
  draws the edge as a line, after which no fit crosses it

### Requirement: Hint: A hint's rectangle is ringed as the contour of its squares

The rectangle a step draws SHALL be ringed as the contour of its squares.

#### Scenario: A rectangle of several squares

- **WHEN** the displayed step draws a rectangle of several squares
- **THEN** each square carries the ring on those of its sides that lie on the
  rectangle's edge, and on no side shared with another of its squares

### Requirement: Hint: A Rectangles hint plan is the firings its boards give

The hint MAY carry what it read of a board from one step of a plan to the
next. Every step of a plan SHALL be the step the hint gives when asked of that
step's board alone.

#### Scenario: A plan is replayed a board at a time

- **WHEN** the hint's plan for a dealt board at each difficulty is followed,
  and at each step the hint is asked afresh of the board reached
- **THEN** it gives that step's move
- **AND** where the plan ends the hint asked afresh has no step, or the board
  is solved

### Requirement: Hint: Rectangles' hint tries its five deductions plainest first

At each step the hint SHALL give the first that fires of its five deductions,
in this order: a clue with one fit, a square only one clue's fits reach,
squares another clue is sure to cover, a fit that would leave no room, and
last a line. It SHALL look across the whole board for one before it tries the
next.

#### Scenario: A line is the last resort

- **WHEN** some clue has one fit left and some edge could also be drawn as a
  line
- **THEN** the step draws the clue's rectangle

### Requirement: Status bar: The Rectangles status bar gives the size of a dragged rectangle

While a rectangle is being dragged, the status bar SHALL show its size as
width `x` height, and it SHALL be empty at every other time.

#### Scenario: The status bar gives the dragged size

- **WHEN** a drag spans a rectangle three squares wide and two tall
- **THEN** the status bar reads `3x2`, and it is empty once the drag ends

### Requirement: Look: Rectangles rendering

An edge SHALL be drawn in one of three colors: a drawn line solid in ink, a drag's
drawing preview in the shared drag-add color, and its erasing preview in the
shared drag-remove color. An edge flagged as a mistake SHALL be drawn in the
error color.

#### Scenario: A drag previews the rectangle it would draw

- **WHEN** a left-drag spans a rectangle and has not been released
- **THEN** the rectangle's boundary edges inside the grid, and the corners they
  meet at, are drawn in the drag-add color

#### Scenario: A flagged edge is redrawn

- **WHEN** `redraw` is given a mistake on an edge of a square already drawn
- **THEN** the square is repainted with that edge in the error color

### Requirement: Look: Rectangles draws its squares on the collection's quiet surface

`redraw` SHALL draw every square on the collection's cell surface, with the
surface's thin grid line between squares. A square that holds a number SHALL
sit on the lifted surface of a given, so the numbers the puzzle fixed are told
by the cell under them, and the number itself SHALL stay in ink. The edges of
the player's rectangles, and the board's outer edge, which bounds every
rectangle that reaches it, are content and SHALL stay in ink at their full
width.

#### Scenario: A number is told by the cell under it

- **WHEN** an untouched board is drawn
- **THEN** every square holding a number is the lifted surface
- **AND** every other square is the plain cell surface

### Requirement: Look: A finished rectangle fills whole with the finished-region role

A rectangle the game counts as correct SHALL fill whole with the shared
finished-region role. The fill SHALL cover the number's square too.

#### Scenario: A finished rectangle shades whole

- **WHEN** the player's edges enclose a rectangle holding exactly one number,
  equal to its area
- **THEN** every square of it, the number's included, is drawn in the
  completed-region color

### Requirement: Look: The Rectangles cursor is brackets at its square's corners

The keyboard cursor SHALL be brackets in the cursor color at the corners of its
square, beside the number, and SHALL take no fill.

#### Scenario: The cursor leaves the square's surface alone

- **WHEN** the keyboard cursor rests on a square
- **THEN** the square keeps the surface it had
- **AND** the cursor is drawn at its corners in the cursor color
