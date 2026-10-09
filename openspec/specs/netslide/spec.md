# netslide Specification

## Purpose
Netslide, the puzzle of sliding rows and columns, all but the source's own row
and column, until the wires on the tiles join one connected network with no
loops. This spec holds the rules, the params and description encodings, what
the generator promises, the controls, how the board is drawn, and the hint: it
has no solver, so Solve and the hint recover the finished grid from the board
itself and work from any position, and the hint explains and draws each slide
it proposes.

## Requirements

### Requirement: Netslide's board, its source and the lines that never slide

Netslide SHALL be played on a
`w × h` grid of Net wire tiles, each a 4-bit mask of connections `R=1`, `U=2`,
`L=4`, `D=8`, whose solved configuration is a spanning tree rooted at the
source, the tile at `⌊w/2⌋, ⌊h/2⌋`, scrambled by toroidal row and column
slides. The player SHALL slide rows and columns, never the source's row or the
source's column, until every tile is connected to the source.

#### Scenario: The source of an even-sized board

- **WHEN** a 4×4 game is created
- **THEN** its source is the tile at `2, 2` counting from zero, and neither
  that row nor that column can be slid

### Requirement: Netslide's params and their encoding

Params SHALL be `w`, `h`, `wrapping`, `barrierProbability` and `movetarget`,
encoded `{w}x{h}[w][b{prob}][m{target}]`, with `{n}` as the shorthand for a
square grid. The `b` suffix SHALL be written only in the full encoding, and
the `m` suffix in both, because the target move count is part of the puzzle.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, wrapping: true, barrierProbability: 0.5,
  movetarget: 20 }` are encoded in full
- **THEN** the result is `5x5wb0.5m20` and decoding it round-trips the params

### Requirement: Netslide descriptions encode wires and barriers

The desc SHALL encode the grid row-major: one hexadecimal digit per tile
giving its wire mask, each optionally followed by `v`, a barrier to the right
of that tile, and/or `h`, a barrier below it. A desc holding an unexpected
character, or one shorter or longer than `w × h` tiles, SHALL be refused. A
game that is not wrapping SHALL be walled around its whole border, which the
desc does not write.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState`
- **THEN** the wire grid and barrier positions match those the generator built

#### Scenario: A description one tile short

- **WHEN** a desc of `w × h − 1` tiles is offered for a `w × h` grid
- **THEN** it is refused

#### Scenario: A non-wrapping game is walled in

- **WHEN** `newState` builds a non-wrapping game
- **THEN** every tile on the outer edge carries a barrier on its outward side

### Requirement: The solved grid is grown from the source as a spanning tree

The solved grid `newDesc` builds SHALL be a spanning tree over every tile,
grown outward from the source: no tile SHALL be a full cross of four arms, and
the wires SHALL form no closed loop.

#### Scenario: The solved grid is a spanning tree

- **WHEN** a grid is generated
- **THEN** every tile is reachable from the source, no tile has four arms, and
  the wires contain no closed loop

### Requirement: The shuffle declines a slide that undoes or overshoots

`newDesc` SHALL then shuffle the solved grid by applying random row and column
slides, declining a slide that would directly undo the previous one, or that
would repeat so often as to be a shorter slide in the opposite direction. A
declined slide SHALL NOT count toward the move total. The number of slides
SHALL be `movetarget` when it is set, and otherwise `2 · (w−1) · (h−1)`.

#### Scenario: The default shuffle of a 3×3 grid

- **WHEN** a 3×3 grid is generated with no move target set
- **THEN** the shuffle applies eight slides, not counting any it declined

### Requirement: A move is one step of one line

A move SHALL be a single-step toroidal slide of one row or one column in one
direction, or the solve move.

#### Scenario: A slide wraps around

- **WHEN** a row is slid right
- **THEN** every tile in it moves one place right and the rightmost tile wraps
  around to the left end

### Requirement: A click in the gutter slides the line beside it

`interpretMove` SHALL map a click in the border gutter beside a row or column
to a slide of that line, with the right button reversing the direction. It
SHALL refuse a click beside the source's row or the source's column, which
cannot be slid.

#### Scenario: The right button reverses a slide

- **WHEN** the same border arrow is clicked with the left and then the right
  button
- **THEN** the two moves slide the same line in opposite directions

#### Scenario: The source's line cannot be slid

- **WHEN** the gutter beside the source's row or the source's column is clicked
- **THEN** no move is produced

### Requirement: The keyboard cursor walks the ring of arrows

A keyboard cursor SHALL walk the ring of border arrow positions: the top row
left to right, the right column downwards, the bottom row right to left, and
the left column upwards. It SHALL skip the positions beside the source's row
and the source's column, which cannot be slid, and select SHALL perform the
slide the cursor is on.

#### Scenario: The cursor steps over the source's column

- **WHEN** the cursor is on the top row's arrow just left of the source's
  column and the right arrow key is pressed
- **THEN** the cursor lands on the arrow just right of the source's column

### Requirement: Netslide slides rows and columns, and powers the connected tiles

The game SHALL compute the set of active, powered tiles as those reachable
from the source through mutually connected wires not separated by a barrier. A
row or column that is mid-slide SHALL be treated as unpowered, so the
highlight does not appear to jump across a line in motion. The game SHALL be
complete when every tile is active.

#### Scenario: Completion is every tile powered

- **WHEN** a slide leaves every tile reachable from the source
- **THEN** the game reports itself complete and plays a completion flash

### Requirement: Netslide renders wires, barriers, arrows and the slide animation

`redraw` SHALL draw each tile's wires in the powered color when the tile is
active and in the wire color otherwise, with a box at the source and at every
endpoint, a tile of a single arm, and SHALL draw the connection stubs across
tile borders. Barriers SHALL be drawn in the barrier color, joined cleanly
where they meet at a corner.

#### Scenario: Powered and unpowered wires differ

- **WHEN** a board is drawn with some tiles connected to the source
- **THEN** the connected tiles' wires are drawn in the powered color and the
  rest in the plain wire color

### Requirement: A slide arrow sits beside every line that slides

Slide arrows SHALL be drawn in the border gutter beside every slidable row and
column, with the cursor's arrow highlighted. The arrows SHALL stay on the
board, outlined in ink.

#### Scenario: No arrow beside the source's lines

- **WHEN** a board is drawn
- **THEN** every row and column has an arrow in the gutter at each end, except
  the source's row and the source's column, which have none

### Requirement: A slide is animated, and completion flashes outward

A slide SHALL be animated by offsetting the moving line, drawing the wrapping
tile in its off-grid position for the duration. Completion SHALL flash tiles
outward from the source.

#### Scenario: A slide is animated

- **WHEN** a frame is captured partway through a row slide
- **THEN** that row's tiles are drawn offset from their grid positions and the
  tile wrapping around is also drawn beyond the far edge

### Requirement: The status bar counts moves and powered tiles

The game's status bar text SHALL report the move count, the target move count
when one is set, and how many tiles are currently active.

#### Scenario: A game with a move target

- **WHEN** three slides have been made on a game whose move target is 20
- **THEN** the status bar gives three moves, the target of 20, and the number
  of active tiles out of all the tiles

### Requirement: The hint plans against a finished grid

Because Netslide has no solver, the hint SHALL plan against a finished grid:
the generator's `aux`, the unshuffled grid, when the game came with one, and
otherwise a grid recovered from the board itself.

#### Scenario: A hint on a board that came with no answer

- **WHEN** a hint is requested on a game created from a `params:desc` id, such
  as a shared link or a bookmark, which carries no `aux`
- **THEN** the hint recovers the finished grid from the board and plans against
  it, and does not give up

### Requirement: The plan's goal is every tile powered

The plan's goal test SHALL be "every tile is powered", not "the board equals
the target", so that a board the player completes by another route is
recognized as finished.

#### Scenario: A finished network that is not the target grid

- **WHEN** a plan reaches an arrangement that powers every tile and differs
  from the grid it was planned against
- **THEN** the plan ends there, with no further slide

### Requirement: The hint names what the player can see

The hint SHALL name board elements as the player can see or count them, never
by a claim it has not checked. The immovable tile SHALL be called the source,
the tile power flows from, drawn as the black box. It SHALL NOT be called "the
center": it sits at `⌊w/2⌋, ⌊h/2⌋`, which on an even-sized board is visibly
not the center.

#### Scenario: The immovable tile is never called the center

- **WHEN** any hint step is narrated, on a board of any size
- **THEN** its explanation calls the immovable tile the source, and never the
  center, which on an even-sized board would name a tile the player can see it
  is not

### Requirement: The hint leads with the tile's one degree of freedom

The hint SHALL lead with what the game can prove about this move: a tile in
the source's row can only be moved by sliding its column, and a tile in the
source's column only by sliding its row. That is the single degree of freedom
that is the game's technique. The line that cannot be slid SHALL be named as
"this row" or "this column" and hatched on the board, which draws no row or
column numbers.

#### Scenario: A frozen line is named and hatched

- **WHEN** a hint step turns on the single degree of freedom: the tile sits in
  the source's row, so only its column can shift it
- **THEN** the explanation says "This row never slides", the row is hatched,
  and the explanation says that only a column move shifts the tile

### Requirement: The hint does not restate the rules

The hint SHALL NOT restate the rules of the game step after step. That the
source cannot move is a rule the board already shows, since no arrows are
drawn beside its row or column, and no move follows from it: it belongs in the
help text and SHALL NOT be said in every hint. A step whose tile merely
belongs beside the source SHALL say that plainly, without a preamble.

#### Scenario: A tile that belongs beside the source

- **WHEN** a step opens a journey that takes a tile, one not in the source's
  row or column, to a cell beside the source where it belongs
- **THEN** the explanation says the tile belongs beside the source, and does
  not say that the source cannot move

### Requirement: Each move is narrated by its consequence

The hint SHALL narrate each move by its consequence: whether it places a tile
where it belongs, or is a setting-up move that brings one within reach. It
SHALL use the shared sliding-tile hint vocabulary, SHALL NOT merely restate
the move, and SHALL NOT say a tile "belongs" twice in one sentence.

#### Scenario: A slide that stops short

- **WHEN** the step that opens a journey lands its tile short of the cell the
  plan is taking it to
- **THEN** the explanation says the move sets the tile up, and does not say
  that the tile has arrived where it belongs

### Requirement: A subgoal of several slides is one journey

A subgoal that takes several slides SHALL be emitted as one multi-leg journey,
its continuation legs flagged `continuesPrevious`, so that it reads and
auto-plays as a single hint.

#### Scenario: A tile two slides from its destination

- **WHEN** a step's slide leaves its tile short of its destination, and the
  plan's next slide carries that tile nearer
- **THEN** the next step is flagged `continuesPrevious`

### Requirement: The hint claims a tile belongs only where its wires are wanted

The hint SHALL claim only what it has checked. Netslide's tiles are wire masks
and many are identical, so a tile does not have one home: it belongs anywhere
the finished board wants its wires. The hint SHALL say a tile belongs at a
cell only when the finished board wants that tile's wires there, and SHALL NOT
claim it is the only cell it could occupy.

#### Scenario: A tile is only ever said to belong where its wires are wanted

- **WHEN** a hint step says a tile belongs at a cell
- **THEN** the finished board holds exactly that tile's wires in that cell

### Requirement: A tile an unfinished plan parks is narrated as set up

A plan that runs out of budget before finishing can leave a tile somewhere
merely useful. Such a move SHALL be narrated as setting up, not as arriving.

#### Scenario: A plan that ends before the board is finished

- **WHEN** the step that opens a journey takes its tile to the end of that
  journey, a cell the finished board does not want its wires in
- **THEN** the step is narrated as setting up, and does not say the tile
  belongs there

### Requirement: Netslide can be solved from any position

Following Netslide's hint SHALL finish the board from any position a player
can reach, on any preset, whether or not the game came with a known answer.
The hint SHALL never give up on a solvable board, and SHALL never walk the
player in circles.

#### Scenario: Following the hint finishes a board that came with no answer

- **WHEN** a hint is requested on any preset, with no `aux` available, and its
  plan is followed to the end, repeatedly, as the midend does
- **THEN** a finished board is reached

### Requirement: The distance to finished is a pure function of the board

That the hint always finishes SHALL be achieved structurally, and SHALL NOT be
worked around by caching the plan, which hides the defect. The measure of how
far a board is from finished SHALL be a pure function of that board,
recomputed against it, so that it cannot report progress on a move that makes
the picture worse and cannot disagree with itself between recomputes.

#### Scenario: One board measured twice

- **WHEN** the same board is measured at two different points of a search, or
  in two recomputes of the hint
- **THEN** both measurements are the same number

### Requirement: An endgame the heuristic cannot see past is searched exactly

An endgame the heuristic cannot see past, such as two tiles wanting each
other's cells, which reads as two cells from finished and is many more moves
away, SHALL be planned by an exact shortest search, so that the plan's first
move provably shortens the distance to a finished board. A heuristic plan
carries no such guarantee, and loops.

#### Scenario: Two tiles in each other's cells

- **WHEN** a hint is requested on a board where two tiles want each other's
  cells and every other tile is where it belongs
- **THEN** the plan's first move is the first move of a shortest way to a
  finished board, and leaves the board one move nearer one

### Requirement: The grid the hint plans against is reachable by sliding

The grid the hint plans against SHALL be reachable from the board by sliding.
Not every valid finished grid is: a slide of a line of length `k` is a
`k`-cycle, even exactly when `k` is odd, so on an all-odd grid only half the
arrangements exist at all.

#### Scenario: The hint never aims at a grid the board cannot reach

- **WHEN** the finished grid is recovered from the board
- **THEN** it is one the board can actually be slid into

### Requirement: The hint holds its subgoal across a journey

The hint SHALL hold a stable subgoal, the tile it is currently placing, across
the legs of its journey, and SHALL mark that tile on the board.

#### Scenario: The second leg of a journey

- **WHEN** the second leg of a journey is displayed
- **THEN** the tile it marks is the tile the first leg marked, in the cell the
  first leg's slide landed it in

### Requirement: Netslide renders the displayed hint step

`redraw` SHALL show the current hint step: the tile being placed highlighted,
the cell the plan is taking it to marked, and the slide arrow the player
should press drawn in the hint color.

#### Scenario: A displayed step

- **WHEN** a hint step is displayed on a board with no keyboard cursor showing
- **THEN** the tile it places is highlighted, its destination cell is marked,
  and the arrow that performs the slide is drawn in the hint color

### Requirement: A destination a tile belongs in is marked apart from a stop on the way

A destination the tile genuinely belongs in SHALL be marked distinctly from
one it is only passing through, so that a setting-up move never reads as the
answer.

#### Scenario: A destination the tile does not belong in

- **WHEN** a displayed step takes its tile to a cell the finished board does
  not want its wires in
- **THEN** that cell's mark differs from the mark of a cell a tile belongs in

### Requirement: The tile mark travels with the tile during a slide

The tile mark marks a tile, which moves, so it SHALL travel with the tile it
marks. While the hinted slide is animating, the displayed step's `tile` cell
is the cell the tile set off from, because the midend advances the plan when
the animation ends. So `redraw` SHALL mark the cell the slide lands the tile
in, and SHALL NOT mark the vacated cell, which by then holds a different tile.

#### Scenario: The tile mark travels with the tile mid-slide

- **WHEN** a frame is captured partway through the slide the displayed hint step
  asked for
- **THEN** the tile highlight is drawn on the tile being placed, at the offset
  position that tile is drawn at, and not on the cell it has left

### Requirement: The destination mark stays on its cell during a slide

The destination mark marks a cell, which does not move, so it SHALL stay where
the cell is while the line slides underneath it, and SHALL NOT be drawn with
the animation's offset.

#### Scenario: The destination mark stays put mid-slide

- **WHEN** a frame is captured partway through a slide whose line contains the
  cell the hint is taking the tile to
- **THEN** that cell's outline is drawn at the cell's own position, unshifted by
  the animation

### Requirement: Netslide solves from the generator's grid when it has one

The game has no deduction solver. `newDesc` SHALL save the unshuffled grid as
`aux`, and `solve` SHALL replay it when the game came with one. On a board
that carries no `aux`, a game created from a `params:desc` id such as a shared
link or a bookmark, `solve` SHALL recover the finished grid from the board
itself, and SHALL NOT refuse it as upstream does.

#### Scenario: Solve on a freshly generated game

- **WHEN** Solve is invoked on a game created from a random seed
- **THEN** the board is restored to the generator's unshuffled grid and is
  reported solved-with-help

#### Scenario: Solving a game built from a descriptive id

- **WHEN** Solve is used on a game created from a `params:desc` id
- **THEN** the board is completed, and Solve is not refused as having no
  solution to give

### Requirement: Netslide has no mistake check

Netslide SHALL NOT implement `findMistakes`. Every reachable board is legal,
since the solution can still be reached from any state by sliding, so there is
no wrong-but-legal state to flag, and Check & Save SHALL flag no mistake on
any board.

#### Scenario: Check & Save on a scrambled board

- **WHEN** Check & Save is used on a board the player has slid about
- **THEN** no mistake is flagged

### Requirement: Netslide draws its tiles on a quiet surface

`redraw` SHALL draw each tile's face as the collection's cell surface, with
the surface's grid line as the tile's border, so that the grid of tiles stands
a step off the board that holds the slide arrows. A wall SHALL keep its own
color and weight, since it is content. A tile SHALL carry no bevel, and a tile
in motion SHALL be drawn with the same face and border as one at rest.

#### Scenario: A tile's face is the cell surface

- **WHEN** a board is drawn at rest
- **THEN** every tile's face is the cell surface inside a border in the
  surface's grid color

### Requirement: The completion flash lifts the tiles

The completion flash SHALL lift a tile to the collection's lifted surface on
its lit beats, the surface Net lifts its tiles to, a step that reads in both
schemes.

#### Scenario: The flash lifts the tiles

- **WHEN** a frame of the completion flash is drawn
- **THEN** the tiles on a lit beat are drawn on the lifted surface

### Requirement: The network is drawn at Net's weight

A wire and an endpoint SHALL be drawn at the weight Net draws them at the same
tile size: the wire's width and the endpoint's outline SHALL scale with the
tile, and a powered wire SHALL be a core of the powered color inside the ink.

#### Scenario: The network is as heavy as Net's

- **WHEN** a board is drawn at a tile size at which Net's wires are several
  pixels wide
- **THEN** Netslide's wires are that wide, and are not hairlines
