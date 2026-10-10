# rect Specification

## Purpose
Rectangles (Shikaku), the puzzle of dividing a grid into rectangles that each
contain exactly one number, equal to its area: its params and description
encodings, what its generator promises of a board, completion and mistake
reporting, its hint, its input, and the look that is its own.

## Requirements

### Requirement: Rectangles' parameters and their encoding

Params SHALL be `w`, `h`, `expandfactor`, a non-negative float that defaults
to 0, and the difficulty. They SHALL encode as `{w}x{h}`, with an `e{%g}`
suffix for a non-zero expansion factor and then the difficulty, Easy as `de`
or Unreasonable as `du`, in the full form only. A bare `{n}` SHALL decode as a
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

### Requirement: Rectangles reads past upstream's unchecked-board letter

Decoding SHALL read past upstream's trailing `a`, which asks for a board with
no promised single answer, and SHALL read the difficulty after it. Encoding
SHALL never write the `a`.

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `9x7a` is decoded
- **THEN** the params are those of `9x7`, and a board dealt from them has one
  solution
- **AND** `10x10e0.5adu` decodes as an Unreasonable 10×10 board with an
  expansion factor of 0.5

### Requirement: Rectangles descriptions use the upstream encoding

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

### Requirement: Rectangles reports completion and mistakes

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

### Requirement: Rectangles flags a drawn edge the solution lacks

The game SHALL implement `findMistakes`: take the board's one answer from the
search that counts its answers, at either difficulty, and return every edge
the player has drawn that the answer does not contain. A missing edge SHALL
NOT be a mistake, and a board the search did not prove has exactly one answer
SHALL yield no mistakes.

#### Scenario: A wall the solution does not contain is flagged

- **WHEN** the player has drawn an edge that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake

### Requirement: Rectangles input

`interpretMove` SHALL support a left-drag drawing a rectangle outline, a
right-drag erasing interior edges, a click near an edge toggling it,
and a half-grid keyboard cursor with press-to-drag. Escape, Backspace or
Delete SHALL cancel that drag, or else hide the cursor. A pointer position
SHALL resolve to a grid corner or a square's center when close to one, else
to the nearer edge. A drag or click that changes no edge SHALL produce no
move. The status bar SHALL show a dragged rectangle's size.

#### Scenario: A drag draws a rectangle outline

- **WHEN** the player left-drags from one grid vertex to another spanning a
  rectangle
- **THEN** `interpretMove` yields a rectangle move whose execution sets the four
  boundary edges of that rectangle and clears its interior edges

#### Scenario: A no-op click yields no move

- **WHEN** the player clicks in a way that would change no edge
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

#### Scenario: The status bar gives the dragged size

- **WHEN** a drag spans a rectangle three squares wide and two tall
- **THEN** the status bar reads `3x2`, and it is empty once the drag ends

### Requirement: Rectangles rendering

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

### Requirement: Rectangles generates by tiling, stretching and solving

The generator SHALL tile the base grid at random, leave no rectangle of one
square, and stretch it to full size by the expansion factor. At Easy it SHALL
call the solver on every layout, which places the numbers, and return only one
the solver reaches a unique placement for.

#### Scenario: A layout the solver cannot make unique is discarded

- **WHEN** the solver does not reach a unique placement on a layout dealt for
  an Easy board
- **THEN** the generator lays out another grid

### Requirement: Rectangles' Solve returns the unique solution's edges

`solve` SHALL return the generator's `aux` when it is present, and otherwise
SHALL take the board's answer from the search that counts its answers, at
either difficulty, and return its edges, or an error when the numbers admit
no division or more than one.

#### Scenario: Solve without aux

- **WHEN** `solve` is called on a generated board with no `aux`
- **THEN** its move leaves the board solved
- **AND** on an Unreasonable board it is the move the `aux` gives

### Requirement: Rectangles offers an explained hint that reads only the board

Rectangles SHALL offer a hint whose every step draws one rectangle or one line
and says why it is forced, reasoning only from the clues and the lines drawn.
A clue's fits are the rectangles of its area that contain it, stay on the
board, take in no other clue and cross no drawn line.

#### Scenario: The player draws the rectangle a side at a time

- **WHEN** the displayed step draws a rectangle and the player draws one of its
  sides
- **THEN** the step stays displayed, and it completes when the last side is
  drawn

#### Scenario: Upstream's 10x10 board is hinted to the end

- **WHEN** the hint is followed on `10x10e0.5:a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c`
- **THEN** it finishes the board, one of its steps a line, and the generator
  returns that board for upstream's seed

### Requirement: A Rectangles hint step is one of five deductions

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

### Requirement: A line step names the clues that cannot cross the edge

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

### Requirement: A hint's rectangle is ringed as the contour of its squares

The rectangle a step draws SHALL be ringed as the contour of its squares.

#### Scenario: A rectangle of several squares

- **WHEN** the displayed step draws a rectangle of several squares
- **THEN** each square carries the ring on those of its sides that lie on the
  rectangle's edge, and on no side shared with another of its squares

### Requirement: Rectangles deals only boards its hint can finish

At Easy the generator SHALL deal only boards the hint's steps finish from an
empty board, dealing again where a board it laid out would leave them short.
The desc of a seed for which upstream deals such a board SHALL differ from
upstream's.

#### Scenario: A board past the hint is dealt again

- **WHEN** the generator, dealing an Easy board, lays out a uniquely solvable
  board the hint's steps cannot finish
- **THEN** it draws another board instead of returning that one

### Requirement: Rectangles draws its squares on the collection's quiet surface

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

### Requirement: A finished rectangle fills whole with the finished-region role

A rectangle the game counts as correct SHALL fill whole with the shared
finished-region role, a wash of the theme pair's first hue, so it is told by
hue from an unfinished square and from a number's lifted square in both
schemes. The fill SHALL cover the number's square too.

#### Scenario: A finished rectangle shades whole

- **WHEN** the player's edges enclose a rectangle holding exactly one number,
  equal to its area
- **THEN** every square of it, the number's included, is drawn in the
  completed-region color

### Requirement: The Rectangles cursor is brackets at its square's corners

The keyboard cursor SHALL be brackets in the cursor color at the corners of its
square, beside the number, and SHALL take no fill.

#### Scenario: The cursor leaves the square's surface alone

- **WHEN** the keyboard cursor rests on a square
- **THEN** the square keeps the surface it had
- **AND** the cursor is drawn at its corners in the cursor color

### Requirement: Rectangles counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
solver: where the solver stops, it SHALL take the first number with the
fewest placements left and assume each in turn. A position SHALL be
impossible where the solver's deductions broke off at a square no rectangle
can cover, or a number has no placement left. It SHALL report one answer,
several, none, or that it stopped at its budget, which SHALL be counted in
positions and never in time.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 5×5 board the solver finishes, on one with one
  answer that it does not reach, on a 4×4 board with several, on a 5×5 board
  whose numbers come to 26 and on one with no number
- **THEN** it reports one answer for the first two, several for the third and
  none for the last two

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given two positions on a board that needs three
- **THEN** it reports that it stopped, and with three it reports one answer

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 4×5 to 7×7, the same with a number moved to the
  square beside it and the same with two numbers swapped are each counted by
  covering the grid a rectangle at a time, each holding exactly one number
  that is its area
- **THEN** the search reports one answer exactly where one division fits,
  several where more do and none where none does

### Requirement: An Easy Rectangles board is one the hint finishes

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

### Requirement: An Unreasonable Rectangles board has one answer that the hint does not reach

At Unreasonable the generator SHALL put each number on a square of its
rectangle at random, and SHALL keep the board only where the solver does not
reach a unique placement, the search proves one answer within a budget of its
own, well under the search's, and the hint's steps do not finish the board.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards at 5×5, 7×7 and 3×10, and at
  11×11 with an expansion factor of 0.5
- **THEN** neither the solver nor the hint's steps finish any of them
- **AND** exactly one division fits each board of up to 49 squares, by a count
  that has no search in it
- **AND** Solve's answer is the division the board was drawn as

#### Scenario: The smallest boards and the largest carry the tier

- **WHEN** an Unreasonable 4×5 board, a 5×5 board, a 15×15 board and a 19×19
  board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Rectangles refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide, one two wide and up to eight long, a 3×3 one and a 3×4
one. The hint finishes every board of those shapes that has one answer.

#### Scenario: The small boards are not dealt at Unreasonable

- **WHEN** a 1×30, a 2×8, a 3×3 and a 4×3 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×8 board is still dealt at Easy, and a 2×9, a 3×5 and a 4×4
  board are admitted at Unreasonable

#### Scenario: Every board of a refused shape is tried

- **WHEN** every division into rectangles of a 1×2, 1×5 and 1×8 board, of a
  2×2 to a 2×8 board, and of a 3×3 and a 3×4 board, with each rectangle's
  number on each of its squares, is given to the solver, and those it leaves
  unfinished that have one answer are given to the hint's steps
- **THEN** the steps finish every one
- **AND** the same walk over a 3×5 board finds 48 they do not

### Requirement: Unreasonable Rectangles is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 400 squares, with a reason naming the difficulty. The same
size SHALL still be asked for at Easy.

#### Scenario: A size past the bound is refused at Unreasonable only

- **WHEN** a 21×21 board is checked for dealing at each difficulty
- **THEN** it is refused at Unreasonable and not at Easy
- **AND** a 20×20 and an 8×50 board are admitted at Unreasonable

### Requirement: Rectangles' menu offers its sizes at both difficulties, the largest two at Easy

Rectangles' presets SHALL offer each of 7×7, 9×9, 11×11, 13×13 and 15×15 as
Easy and as Unreasonable, and 17×17 and 19×19 as Easy alone, and the default
SHALL be the Easy 7×7.

#### Scenario: The menu's twelve lines

- **WHEN** Rectangles' preset menu is read
- **THEN** its first five sizes each appear as Easy and then as Unreasonable,
  and 17×17 and 19×19 follow as Easy

### Requirement: A pasted Rectangles board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the hint finishes
it, and as Unreasonable where it has exactly one answer that the hint does
not reach, whatever lower difficulty its ID states. A board with several
answers SHALL be refused as having more than one solution, and a board with
none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the hint does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** the 4×4 board `2b2_2a2b2b2a2_2`, which has several answers, and a
  5×5 board whose numbers come to 26, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Rectangles' hint stops where its steps do

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the rectangles and lines its five deductions force from the player's
lines and no others, and where none is forced it SHALL refuse with the
collection's sentence that deduction has run out. It SHALL go on from the
rectangles the player then draws.

#### Scenario: The hint stops, and goes on from a rectangle drawn rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a rectangle drawn a square too narrow there is reported by the
  mistake check
- **AND** with the solution's rectangle drawn wherever the hint stops, the
  hint finishes the board
