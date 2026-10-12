# tracks Specification

## Purpose
Tracks, the puzzle of laying a single railway from A to B so that each row and
column holds its clued number of track segments: its rules, encodings and
controls, its tiers and what the generator promises, how it looks, and a hint
that explains the next deduction and marks it in the game's own vocabulary.

## Requirements

### Requirement: Rules: A Tracks board is solved while one track meets every clue

The player lays a single continuous train track from an entrance on the left
edge to an exit on the bottom edge of a `w × h` grid, using only straight and
curved rails that neither cross nor form a loop, so that every row and column
clue counts the track-bearing cells in its line. The board SHALL be reported
solved exactly while no errors exist and every clue's completed track count
matches.

#### Scenario: A whole track that meets its clues

- **WHEN** a continuous entrance→exit track is laid meeting every clue with no
  loop
- **THEN** `status` reports the board solved

### Requirement: Rules: A Tracks mistake is a mark on a square or its edges that the solution contradicts

`findMistakes(state)` SHALL re-solve the board's clues to the unique solution
and, when one exists, report every square holding a player's mark, on itself
or on one of its edges, that contradicts that solution: a track where the
solution has none, or a no-track where the solution lays track. Unmarked cells
SHALL never be mistakes.

#### Scenario: A wrong mark blocks Check & Save

- **WHEN** a cell is marked as track where the unique solution has none and
  `findMistakes` runs
- **THEN** that cell is reported

### Requirement: Rules: Tracks computes live errors on every move

`executeMove` SHALL recompute error state: a cell with more than two track
edges is an error; every cell on a track loop is an error; and once a continuous entrance→exit path exists,
any track cell not on that path is an error.

#### Scenario: A loop is flagged

- **WHEN** track edges are placed forming a closed loop
- **THEN** every cell on the loop carries the error flag

### Requirement: Rules: A Tracks clue is in error when its line cannot meet it

`executeMove` SHALL mark a row or column as a clue error when its track cells
exceed its clue, when its no-track cells exceed the complement, or when its
completed track count fails to match the clue once a continuous entrance→exit
path exists and no cell is in error.

#### Scenario: An over-filled clue is flagged

- **WHEN** a row has more track cells than its clue number
- **THEN** that row's clue is marked in error

### Requirement: Params: A Tracks params string may leave out its difficulty and its `o`

Tracks' params (a size, a tier and whether consecutive 1 clues are
disallowed), their bounds, encoding and label words SHALL be
those its `paramConfig` and its declared codec give (`engine-params`, "A game
declares its params encoding once, and both codec halves are derived"), and
its menu what `presets` builds. A string with no `d` SHALL decode as Normal.
Its `o` SHALL allow consecutive 1 clues, and a string without it, which the
short form always is, SHALL decode with them disallowed.

#### Scenario: An Easy preset's short form

- **WHEN** the Easy 8×8 preset, `8x8de`, is encoded without its difficulty and
  the result, `8x8`, is decoded
- **THEN** the params are an 8×8 board at Normal

### Requirement: Params: Tracks refuses a 4×4 above Easy

`validateParams` SHALL refuse a 4×4 grid, the smallest its bounds allow, above
Easy when the params are to deal a board (its `full` argument), in the words
of `noSuchTier`, because no 4×4 board needs a higher tier.

#### Scenario: A 4×4 above Easy is refused

- **WHEN** the params `4x4dt` or `4x4dh` are checked for a deal
- **THEN** they are refused, and no board is dealt

### Requirement: Params: Tracks refuses a grid whose area cannot be counted

`validateParams` SHALL refuse, at every check, a width and a height whose
product is past the largest whole number the program counts exactly.

#### Scenario: A width in the thousands of millions of millions

- **WHEN** the width of `8x8de` is changed to 1200000000000000 and the params
  are checked, for a deal or for a board that arrives written
- **THEN** they are refused: "Width times height must not be unreasonably
  large."

### Requirement: Description: Tracks descriptions use the upstream encoding

The desc SHALL encode the `w × h` square grid row-major: one lowercase
character `a`–`z` for a run of 1–26 consecutive non-clue squares, and one
hexadecimal character (`0`–`9`, `A`–`F`) per clue square giving that clue's
two track-edge direction flags. A `,`-separated list of `w + h` clue numbers
SHALL follow, column clues first and then row clues, with an `S` prefix
marking the exit column and the entrance row.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: Description: newState parses a Tracks description and refuses a malformed one

`newState` SHALL parse the desc into a board whose player grid is blank. It
SHALL refuse a desc with an unknown character, clue flags whose bit-count is
not exactly two, a number list that is too short, or anything but exactly one
entrance and one exit.

#### Scenario: A malformed description is rejected

- **WHEN** a desc with a clue flag of the wrong bit-count, or without exactly
  one entrance and one exit, is validated
- **THEN** the result is a non-null error

### Requirement: Description: A Tracks clue square's character adds up the sides its track leaves by

A clue square's hexadecimal character SHALL be the sum of the two sides its
track leaves by: 1 for the right, 2 for the top, 4 for the left and 8 for the
bottom. A square at the grid's rim MAY name the side on the rim, which is how
the entrance and the exit are written.

#### Scenario: A dealt 8×8 board is read

- **WHEN** `zn5CbApAb,5,8,8,7,4,S4,3,3,2,3,4,4,5,S8,8,8` is read as an 8×8
  board
- **THEN** its first clue square, at the left of the sixth row, is `5`, track
  from the left side to the right, and that row's number carries the `S` of
  the entrance
- **AND** the `C` beside it turns the track from the left side to the bottom,
  and each `A` is track from top to bottom, the second at the foot of the
  sixth column, whose number carries the `S` of the exit

### Requirement: Description: A Tracks number is at most the length of its line

`newState` SHALL refuse a description in which a column's number is above the
height of the grid or a row's number above its width, and one whose run
letters and clue squares count past the grid's area.

#### Scenario: A column of an 8×8 board is given 9 track squares

- **WHEN** the first number of `zn5CbApAb,5,8,8,7,4,S4,3,3,2,3,4,4,5,S8,8,8`,
  the first column's 5, is changed to 9
- **THEN** it is refused as holding a number out of range for its board

#### Scenario: One square too many

- **WHEN** the last `b` of that description's grid is changed to `c`
- **THEN** it is refused as too long for its board

### Requirement: Generation: Each Tracks difficulty adds its rungs

Easy SHALL run edge and square flag propagation (`update-flags`), row and
column track counts (`count-clues`) and immediate loop avoidance
(`check-loop`). Normal SHALL add single-track reasoning
(`check-single`), loose-end reasoning (`check-loose-ends`) and the one-way
neighbor deduction (`check-neighbors`). Tricky SHALL add the two-way neighbor
deduction (`check-neighbors-both-ways`) and the bridge-parity argument
(`check-bridge-parity`).

#### Scenario: A capped solve leaves the higher rungs out

- **WHEN** the solver runs capped at Normal
- **THEN** neither the two-way neighbor deduction nor the bridge-parity
  argument runs

### Requirement: Generation: Tracks generates solver-gated boards

`newDesc` SHALL strip every clue the board solves at its tier without. It
SHALL lay the track by construction and not by throwing tracks away: a walk
that does not leave the board while a row or column holds no track, and that
never steps where the squares still free no longer reach every such row and
column and the bottom edge. Every clue of a dealt board SHALL therefore be at
least 1, at any size the params allow.

#### Scenario: A long thin board deals

- **WHEN** `newDesc` runs at 60x8, 8x60 or 40x12 at Easy
- **THEN** it returns a board that solves at Easy, with every clue at least 1,
  and does not throw `RetryLimitExceeded`

### Requirement: Generation: Tracks meets singleOnes by bending the track

Under `singleOnes` a dealt board SHALL have no 1 as the clue of the entrance's
column or of the exit's row, and no two 1 clues next to each other in the list
of column clues then row clues. The generator SHALL reach that by bending the
laid track, taking the one step that crosses two such lines round three sides
of a square, and SHALL lay another track only where a bend has no room.

#### Scenario: A long thin board has no forbidden 1

- **WHEN** `newDesc` runs at 60x8, 8x60 or 40x12 at Easy with `singleOnes`
- **THEN** it returns a board with no 1 clue where `singleOnes` forbids one,
  and does not throw `RetryLimitExceeded`

### Requirement: Generation: A stalled bare Tracks board goes on to clue-laying

The generator SHALL reject a laid track as too easy only when its bare board
(the row and column counts, the entrance and the exit) solves completely
without reaching the target tier. A bare board that stalls SHALL go on to
clue-laying whatever rungs fired before it stalled, since the clue-laying loop
already refuses any clue that finishes the board below the target tier.

#### Scenario: A stalled bare board is not too easy

- **WHEN** the bare board of a laid track stalls at the target tier without any
  of that tier's rungs having fired
- **THEN** the generator lays clues on it and does not ask for a new track

### Requirement: Controls: Tracks input maps drag, click and cursor

`interpretMove` SHALL support two drags, told apart by what the pressed square
holds and never by where in it the press lands. A left-drag from a square that
carries no track SHALL paint track along a single straight row or column, and
a right-drag from any square SHALL paint no-track the same way, each toggling
based on the drag-start cell's current state. A right-drag SHALL NOT mark an
edge, since a run of crosses on edges is no use to a player.

#### Scenario: A drag lays a straight run of track

- **WHEN** the player left-drags across three cells of one row from a blank
  start, the press landing anywhere in the first cell
- **THEN** those three cells are marked as track, and no edge carries a
  segment

#### Scenario: A right-drag from an edge's strip crosses squares

- **WHEN** the player presses the right button on the strip along an edge and
  drags along the row
- **THEN** the squares of the run are marked no-track, and no edge is

#### Scenario: A drag that drifts out of bounds keeps its last valid extent

- **WHEN** an in-progress straight drag is continued to a position on neither
  the start row nor the start column (e.g. the pointer wanders off the grid)
- **THEN** the drag stays active with its last valid extent frozen, and
  resumes when the pointer returns to the start row or column

### Requirement: Controls: A drag from a square that carries track lays segments

A left-drag from a square that carries track (the player marked it, or a
segment reaches it) SHALL mark no square. To every edge it crosses that held
what the first edge crossed held, it SHALL do what a click does to that first
edge, laying track segments or taking them away, turning corners freely, as
one step of Undo.

#### Scenario: A drag from a square that carries track lays segments

- **WHEN** the player left-drags from a square marked as track through the
  centers of the next two squares in the row
- **THEN** the two edges crossed each carry a track segment and no square mark
  changes
- **AND** one Undo removes both segments
- **AND WHEN** the player makes the same drag again
- **THEN** both segments are taken away

### Requirement: Controls: A Tracks click toggles a square or an edge

A left-click near a cell center SHALL toggle the square's track, and one near
a cell edge SHALL toggle that edge's track. A right-click SHALL toggle
no-track on the square, except on the strip along an edge, an eighth of a tile
either side of its line and never under four pixels, where it SHALL toggle
no-track on that edge.

#### Scenario: A right-click crosses the square unless it is on an edge

- **WHEN** the player right-clicks a blank square well off its middle and
  short of the strip along its edge
- **THEN** the square is marked no-track
- **AND WHEN** the player right-clicks two pixels inside the square's side
- **THEN** that edge is marked no-track and the square is not

### Requirement: Controls: The Tracks keyboard cursor walks a half-grid

The keyboard cursor SHALL walk a half-grid whose stops are the squares (cell
centers) and the edges (cell borders) a press addresses.

#### Scenario: Select on a cell border toggles the edge

- **WHEN** the cursor shows on the border between two undecided squares and
  Enter is pressed
- **THEN** that edge carries a track segment and neither square's mark changes

### Requirement: Controls: A Tracks press outside the grid, or a no-track drag over track, makes no move

An interaction outside the grid SHALL produce no history move. A right-drag
SHALL set no no-track mark on a square that holds track.

#### Scenario: A no-track drag over squares that hold track

- **WHEN** a right-drag (no-track) covers only cells that already hold track,
  so no flag can change
- **THEN** `interpretMove` returns no history move

### Requirement: Hint: The Tracks hint starts from the player's marks and is capped at the board's own tier

`hint` SHALL deduce its plan from the player's current marks, on squares and
on edges. Its ladder SHALL be capped at the board's own difficulty and not at
the highest tier, since the board's own is the tier the generator certified it
soluble at.

#### Scenario: An Easy board is not handed a harder argument

- **WHEN** a hint is requested on a board dealt at Easy
- **THEN** no step of its plan comes from a rung above Easy

### Requirement: Hint: One Tracks firing is one hint step

One firing SHALL be one step: with a recorder attached, a rung SHALL return at
its first premise that changed the board, so that a rung that scans the whole
grid cannot pile several independent deductions into one step. Where one
premise forces several ops, the step's move SHALL carry them all.

#### Scenario: A hint explains a clue that is already met

- **WHEN** a line holds as many track squares as its clue allows and a hint is
  requested
- **THEN** the step's narration names that count, its move marks every other
  square in the line empty, and its evidence is exactly the clue's own track
  squares with the clue's digit recolored

### Requirement: Hint: A firing the board already shows is hidden

Every change a rung makes SHALL be recorded. Tracks' `showable` judgment
SHALL hide a firing that declares no reason or whose every change the
player's board already decides. A change is already decided when the game
would refuse the player its contrary: track on a side of a square marked
empty or of the rim, track as a third side of a finished piece, or "no track"
on a square showing a rail.

#### Scenario: A blocked side on the rim is not a step

- **WHEN** a rule with a reason fires and the one side it blocks lies on the
  grid's rim
- **THEN** the plan shows no step for it

### Requirement: Hint: Three rules of update-flags declare no reason

Three rules of the `update-flags` rung SHALL declare no reason, because the
player's board already decides what each concludes: a square with a track side
is a track square, a blocked square's four sides are blocked, and a finished
piece's other two sides are blocked. Every reason-less firing SHALL be evident
by the already-decided test.

#### Scenario: A finished piece's sides are never a step

- **WHEN** a finished piece's two free sides border squares the player has
  marked empty and a hint is requested
- **THEN** no step in the plan asks for either side to be blocked

### Requirement: Hint: Tracks marks a hint in its own vocabulary

What a step decides SHALL be drawn in the game's own shapes: its center
cross, its rail stubs and its edge cross. A clue the step counts with is not
on the grid, so its digit SHALL be drawn in `COL_HINT` in the margin.

#### Scenario: A forced side is drawn as the action it asks for

- **WHEN** a step forces one side to carry track and another to be blocked
- **THEN** the first is drawn as rail stubs and the second as a cross, both in
  the action color, and neither renders the finished piece

#### Scenario: A clue the step counts with is recolored

- **WHEN** the step for a clue that is already met is displayed
- **THEN** the clue's track squares carry the evidence contour in
  `COL_HINT_CELL` and the clue's digit is drawn in `COL_HINT` in the margin

### Requirement: Hint: The Tracks hint settles a square from its blocked sides

A square with three or four sides blocked SHALL be marked empty ("Every side
of this square but one is blocked, and track needs two"). A square that holds
track and has two sides blocked SHALL have track laid across its other two
("The track here has two sides blocked, so it must run through the other
two"). The grid's rim counts as blocked except where the entrance or the exit
crosses it, and the blocked sides SHALL be the evidence the step outlines.

#### Scenario: A track square in a corner

- **WHEN** a corner square of the grid, away from the entrance and the exit,
  is marked as holding track
- **THEN** a step lays track across its two inner sides

### Requirement: Hint: The Tracks hint counts a row or column against its clue

A row or column that holds as many track squares as its clue SHALL have every
other square in it marked empty ("This column already has all 4 of the track
squares its clue allows"). One that has as many squares marked empty as its
length less its clue SHALL have every other square in it marked as track. The
step SHALL stripe the line, and outline its clue and the squares it counted.

#### Scenario: A clue as long as its line

- **WHEN** a hint is asked for on the 8×8 Normal board
  `zn5CbApAb,5,8,8,7,4,S4,3,3,2,3,4,4,5,S8,8,8` with nothing marked
- **THEN** the first step is about the second column, whose clue is 8: "This
  column's clue is 8 and it is 8 squares long, so every square in it must
  carry track."

### Requirement: Hint: The Tracks hint blocks a side that would close a loop or finish the track too soon

For two track squares side by side with nothing marked on the side between
them, a step SHALL block that side where track already joins the two, since a
segment there would close a loop. It SHALL also block it where one square is
joined to the entrance and the other to the exit, and either some track is
joined to neither, which the step outlines as stranded, or some row or column
holds fewer track squares than its clue, which the step names.

#### Scenario: The two runs meet with a clue still short

- **WHEN** the run from A and the run from B reach neighboring squares, every
  track square on the board is on one run or the other, and one row holds
  fewer track squares than its clue
- **THEN** the side between the two squares is blocked, in the words that
  joining the runs there would finish the track with that row's clue short

### Requirement: Hint: The Tracks hint runs a lone loose end straight on

On a Normal or a Tricky board, in a row or column where exactly one square
holds a single segment running along the line, where the clue less the squares
that hold two segments is 2, and where every square without two segments has a
side blocked across the line, a step SHALL lay that square's track straight on
along the line ("This row has two track squares left and no way across it, so
the loose end must run straight on").

#### Scenario: An Easy board is not given it

- **WHEN** an Easy board reaches a position where a line has one loose end,
  two track squares left and no way across it
- **THEN** no step runs the loose end on, and the hint goes on with what the
  Easy techniques decide

### Requirement: Hint: The Tracks hint decides two neighbors whose track would run on

For two undecided squares side by side in a row or column, where the first has
at most one side not blocked other than the side they share, track in the
first would run on into the second. On a Normal or a Tricky board, where the
line needs one more track square, a step SHALL mark the first empty. On a
Tricky board, where the line can take one more empty square, a step SHALL mark
the second as track, and where both hold it SHALL do both.

#### Scenario: A line with room for one more track square

- **WHEN** a column of a Normal board needs one more track square, and an
  undecided square in it has its left and right sides blocked, with an
  undecided square below it
- **THEN** a step marks the first square empty: track there would carry on
  downward and the column has room for one more track square

### Requirement: Hint: The Tracks hint counts the crossings of a closed block

On a Tricky board, for an undecided side that lies on no loop of undecided
sides, the squares reached from one of its two squares through undecided
sides, without crossing it, are a block the track enters as often as it
leaves. A step SHALL lay track on the side where an odd number of the other
sides on the block's border hold track, and SHALL block it where an even
number do ("Every entry to the striped block needs an exit"). It SHALL stripe
the block and outline those crossings.

#### Scenario: One crossing is marked

- **WHEN** a block of squares is closed off but for one undecided side, and
  one side on its border holds track
- **THEN** a step lays track on the undecided side, the block's last

### Requirement: Hint: The Tracks hint tries a square's sides, then the clues, then the loop

`hint` SHALL take the first of these that decides something the board does not
show, and begin again after each: a square's blocked sides, the columns left
to right and each from the top; a clue's count, columns before rows, a clue
that is met before one whose empty squares are all marked; a loop or an early
finish. Then, above Easy, a loose end, and the two neighbors where the line
needs one more track square. Then, at Tricky, the two neighbors both ways and
a block's crossings.

#### Scenario: A dealt board's first steps

- **WHEN** a hint is asked for on the 8×8 Normal board
  `zn5CbApAb,5,8,8,7,4,S4,3,3,2,3,4,4,5,S8,8,8` with nothing marked
- **THEN** the first two steps fill the second and third columns, whose clues
  are 8, and the third empties the rest of the top row, whose clue of 2 those
  columns have met
- **AND** only then does a step lay track through a square with two sides
  blocked, since no square had two until the row was emptied

### Requirement: Look: Tracks renders rails, clues, drag previews and the completion flash

`redraw` SHALL render, with no gutter and a one-tile margin holding the clue
numbers and the A and B entrance and exit labels: straight rails drawn with
sleepers, curved rails, no-track crosses on squares and edges, the in-progress
drag preview (a newly-set piece in `COL_DRAGON` blue, a cleared piece in
`COL_DRAGOFF` light blue), row and column clue numbers (red on a clue error),
the cursor highlight, and the completion flash.

#### Scenario: A completed row clue turns red when over-filled

- **WHEN** a row holds more track cells than its clue
- **THEN** that row's clue number renders in the error color

#### Scenario: A drag preview shows provisional pieces

- **WHEN** a left-drag is in progress over blank cells
- **THEN** the covered cells render their provisional track in the drag color

### Requirement: Look: The Tracks completion flash runs the track from A to B

The completion flash SHALL run the finished track from the entrance to the
exit: a square's position SHALL be its place along the track, counted from the
entrance, and a lit square's rails SHALL be drawn in a flash color. A square
off the track SHALL never be lit. The color SHALL read against the rails and
the track bed in both color schemes.

#### Scenario: The flash runs from A to B

- **WHEN** a board is won and frames of its flash are drawn from start to end
- **THEN** the first lit square is the entrance's, the last is the exit's, and
  every square of the track is lit for one stretch of frames

#### Scenario: A track of several hundred squares

- **WHEN** a board whose track covers more than 256 squares is won
- **THEN** the highlight runs every square of it in turn

### Requirement: Look: An undecided Tracks square is the cell surface

`redraw` SHALL draw a square the player has not decided on the collection's
cell surface, with the surface's grid line between squares one pixel wide at
every tile size and the frame round the grid no heavier.

#### Scenario: The grid line does not grow with the tile

- **WHEN** a board is drawn at a small tile size and at a large one
- **THEN** the grid line between two undecided squares is one pixel wide in
  both

### Requirement: Look: A given Tracks rail is told by the cell under it

A square the puzzle laid track in SHALL sit on the lifted surface of a given,
and its rails SHALL be the same ink rails the player's are: a given is told by
the cell under it and not by the color of its rail.

#### Scenario: A given rail is the same rail

- **WHEN** a board holds a rail the puzzle laid and a rail the player laid
- **THEN** both rails are drawn in the same ink
- **AND** the puzzle's square is the lifted surface and the player's is the
  track bed

### Requirement: Look: A square that carries track is the track bed

A square that carries track and is not a given SHALL be filled with the track
bed, a purple of the theme's first hue, whether it holds a whole piece of
rail, a rail end, or no rail yet, and SHALL hold no other mark for that state.
The bed SHALL differ in hue from the cell surface and from a given's surface
in both color schemes, so that "track here" is never a step of gray, and a
rail SHALL read on it in both.

#### Scenario: A square a given rail leads into is the bed

- **WHEN** a fresh board is drawn
- **THEN** each square a given rail's open end leads into is the track bed
  and holds no mark

### Requirement: Look: Tracks tells a square's state by its surface and a cross

A square marked as holding no track SHALL stay the cell surface and hold the
collection's ruled-out cross, in the ruled-out color. An edge marked as
carrying no track SHALL hold a smaller cross on the edge.

#### Scenario: Undecided, no track and track are told apart

- **WHEN** a board holds an undecided square, a square marked no-track and a
  square marked as track with no rail yet
- **THEN** the first two are the cell surface and the third is the track bed
- **AND** the first holds nothing, the second holds the ruled-out cross and
  the third holds nothing

### Requirement: Look: The Tracks keyboard cursor's outline is at least two pixels thick

The keyboard cursor's outline SHALL be at least two pixels thick.

#### Scenario: The outline at a small tile

- **WHEN** the cursor is shown at a tile size whose marks are one pixel thick
- **THEN** the cursor's outline is two pixels thick
