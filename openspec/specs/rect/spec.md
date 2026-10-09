# rect Specification

## Purpose
Rectangles (Shikaku), the puzzle of dividing a grid into rectangles that each
contain exactly one number, equal to its area: its params and description
encodings, what its generator promises of a board, completion and mistake
reporting, its hint, its input, and the look that is its own.

## Requirements

### Requirement: Rectangles' parameters and their encoding

Params SHALL be `w`, `h` and `expandfactor`, a non-negative float that
defaults to 0. They SHALL encode as `{w}x{h}`, with an `e{%g}` suffix for a
non-zero expansion factor in the full form only, and a bare `{n}` SHALL decode
as a square of that side. A grid whose area is less than 2 SHALL be refused.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, expandfactor: 0.5 }` are encoded in full
- **THEN** the result is `10x10e0.5` and decoding it round-trips the params

#### Scenario: The short form drops the expansion factor

- **WHEN** params `{ w: 7, h: 7, expandfactor: 0.5 }` are encoded in the short
  form
- **THEN** the result is `7x7`

#### Scenario: A grid of one square is refused

- **WHEN** params of a 1×1 grid are validated
- **THEN** they are refused with an error string

### Requirement: Rectangles reads past upstream's unchecked-board letter

Decoding SHALL read past upstream's trailing `a`, which asks for a board with
no promised single answer, and encoding SHALL never write it.

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `9x7a` is decoded
- **THEN** the params are those of `9x7`, and a board dealt from them has one
  solution

### Requirement: Rectangles loads only a board its hint finishes

The game SHALL implement `finishesByDeduction` as its solver reaching a unique
placement from the board's numbers and its hint's steps finishing the board,
so that a board that loads is one its hint finishes.

#### Scenario: A board past the hint does not load

- **WHEN** `9x9:c4c5b9c12b2h2k12e2f2_3c12a8l3d5d` is loaded, a board the solver
  settles by ruling placements out that no line can record
- **THEN** loading refuses it as not deducible

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

Because boards are uniquely solvable, the game SHALL implement `findMistakes`:
re-solve from the numbers to the unique solution's edges and return every edge
the player has drawn that the unique solution does not contain. A missing edge
SHALL NOT be a mistake, and a board that is not uniquely solvable SHALL yield
no mistakes. Check & Save depends on this hook and SHALL refuse to save while
any mistake is present.

#### Scenario: A wall the solution does not contain is flagged

- **WHEN** the player has drawn an edge that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake

### Requirement: Rectangles input

`interpretMove` SHALL support a left-drag drawing a rectangle outline, a
right-drag erasing interior edges, a click near an edge toggling that single
edge, and a half-grid keyboard cursor with press-to-drag. A pointer position
SHALL be allocated to a grid corner or a square's center when it is close to
one, and otherwise to the nearer edge. A drag or click that changes no edge
SHALL produce no move.

#### Scenario: A drag draws a rectangle outline

- **WHEN** the player left-drags from one grid vertex to another spanning a
  rectangle
- **THEN** `interpretMove` yields a rectangle move whose execution sets the four
  boundary edges of that rectangle and clears its interior edges

#### Scenario: A no-op click yields no move

- **WHEN** the player clicks in a way that would change no edge
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

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

The generator SHALL tile the base grid at random, remove singletons, stretch
it to full size by the expansion factor, and call the solver on every layout,
returning only one the solver reaches a unique placement for.

#### Scenario: A layout the solver cannot make unique is discarded

- **WHEN** the solver does not reach a unique placement on a layout
- **THEN** the generator lays out another grid

### Requirement: Rectangles' Solve returns the unique solution's edges

`solve` SHALL return the generator's `aux` when it is present, and otherwise
SHALL run the solver from the fixed numbers and return the unique solution's
edges.

#### Scenario: Solve without aux

- **WHEN** `solve` is called on a generated board with no `aux`
- **THEN** its move leaves the board solved

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

The generator SHALL deal only boards the hint's steps finish from an empty
board, dealing again where a board it laid out would leave them short. The
desc of a seed for which upstream deals such a board SHALL differ from
upstream's.

#### Scenario: A board past the hint is dealt again

- **WHEN** the generator lays out a uniquely solvable board the hint's steps
  cannot finish
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
