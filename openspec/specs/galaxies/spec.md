# galaxies Specification

## Purpose
Galaxies, the puzzle of dividing a grid along its edges into regions that each
have two-way rotational symmetry about the one dot they contain: uniquely
solvable boards at each difficulty, a two-way drag that assigns squares to
dots, mistake highlighting, and a deduction hint narrated in terms of which dot
a square belongs to. What every game does the same way (registration, pure
moves, the win flash, the hint's refusal on a mistaken board) is in `ts-engine`
and `engine-hints`, and is not restated here.

## Requirements

### Requirement: Galaxies parameter strings decode leniently and round-trip

Galaxies' parameters SHALL be a width, a height, and a difficulty of `Easy` or
`Unreasonable`. Parameter decoding SHALL accept a bare size as a square board
(`"7"` is 7×7), the form `WxH`, and an optional trailing `dn` for the Easy tier
or `du` for Unreasonable. Encoding SHALL round-trip a decoded parameter set.

#### Scenario: The lenient forms decode

- **WHEN** `"7"`, `"7x7"`, `"7x7dn"` and `"7x7du"` are decoded
- **THEN** each gives a 7×7 board, Easy for the first three and Unreasonable
  for the last
- **AND** encoding each result and decoding it again gives the same parameters

### Requirement: Galaxies generates uniquely-solvable boards at the requested difficulty

For every preset, `newDesc` SHALL produce a board whose layout of dots admits
exactly one valid tile-to-dot association under 180° rotational symmetry about
each dot, and whose minimum solver difficulty matches the requested `Easy` or
`Unreasonable`. A board the solver diagnoses as `Ambiguous`, `Impossible`, or
at a different difficulty than requested SHALL NOT be returned.

#### Scenario: Generated boards are uniquely solvable at the right difficulty

- **WHEN** a Galaxies board is generated for any preset
- **THEN** the solver run at the requested difficulty completes the board
- **AND** the solver diagnosis is exactly the requested difficulty (neither
  lower, nor `Ambiguous`, nor `Impossible`)

### Requirement: The Galaxies solver grades by deduction, then bounded recursion

The Galaxies solver SHALL run a difficulty-graded deduction chain and, for
`Unreasonable`, bounded recursion. It SHALL return one of the `GalaxiesDiff`
verdicts `Normal` (solvable at the Easy tier), `Unreasonable`, `Ambiguous`,
`Impossible`, or `Unfinished`.

#### Scenario: Unsolvable hand-entered position

- **WHEN** the solver runs on a position with no consistent association
- **THEN** it reports `Impossible` rather than returning a move

### Requirement: Galaxies reports solved from its edges

The game SHALL report `solved` when the set edges divide the board into regions
that are each symmetric about the one dot at their center, with no other dot on
them and no set edge inside them.

#### Scenario: Solving and completion

- **WHEN** the player completes the partition into a valid galaxy for every dot
- **THEN** the game status becomes `solved`

### Requirement: The association drag runs from either button, the keyboard, and either end

The association drag SHALL be reachable from either mouse button and from the
keyboard, and SHALL run in either direction: from a dot out to a cell, or from
a cell back to the dot that owns it.

#### Scenario: The keyboard reaches both drag directions

- **WHEN** the player selects a plain tile with the cursor
- **THEN** a cell-to-dot drag begins, the cursor keys pick the dot by landing
  on it, and a second select commits the pair

#### Scenario: A right drag from a dot associates too

- **WHEN** the player presses the right button on a dot, drags to a tile it
  could own, and releases
- **THEN** the tile and its 180° partner associate to that dot

### Requirement: A left press is resolved by what follows it

Because the left button carries both a click and a drag, a left press SHALL be
resolved by what follows it: a release close to the press SHALL toggle the
nearest legal edge, and travel beyond a small slop SHALL start a drag from the
press point instead. That drag SHALL be the association drag, unless the press
landed on an edge's line with no dot under it.

#### Scenario: The left button distinguishes a click from a drag

- **WHEN** the player presses the left button and releases it without moving
- **THEN** the nearest legal edge toggles
- **AND WHEN** the player presses inside a tile, away from its edges, and then
  moves beyond the slop
- **THEN** an association drag begins from the press point and the release
  commits it, toggling no edge

### Requirement: A left drag from an edge's line draws walls

A left drag whose press landed on an edge's line with no dot under it SHALL
toggle every edge the pointer passes the middle of that held what the pressed
edge held, the pressed edge first, turning corners freely, as one step of Undo.
Its release SHALL toggle nothing more.

#### Scenario: A drag along the grid draws three walls

- **WHEN** the player presses on an edge's line and drags along the grid past
  the middles of two more edges with no line
- **THEN** all three edges gain a line, the release toggles nothing more, and
  one Undo removes all three

### Requirement: A press that ends far from where it began commits nothing

A press that did not become a drag and ends far from where it began SHALL
commit nothing at all: it SHALL NOT toggle an edge on the far side of the
board. A canceled press is the engine's (`engine-input`, "A canceled press
leaves the game as it was before the press"), and the game does not read a
drag off the board as one: an arrow dragged off any side of the board is
removed.

#### Scenario: A canceled press toggles no edge

- **WHEN** a left press is followed, with no drag between, by a release far
  from the press point
- **THEN** no edge toggles and no history entry is added

#### Scenario: A canceled press leaves the arrow under it

- **WHEN** a tile that carries an arrow is pressed with either button, or by a
  finger held past the touch hold, and the press is canceled, before the
  pointer moves or after
- **THEN** the arrow and its partner's stay, and no history entry is added

### Requirement: A drag's release commits the pair its preview showed

A release SHALL commit the snapped target the preview showed: the target tile
and its 180° partner associate to the dot as one move, and Undo reverses it as
one step. A release on the tile the drag started from SHALL change nothing. Any
other release where nothing can commit, off the board or on an uncommittable
tile, SHALL remove the dragged arrow if one existed, and otherwise SHALL add no
history entry.

#### Scenario: Drag-to-associate commits the previewed pair

- **WHEN** the player presses on or near a dot, or on a tile with an existing
  arrow, drags, and releases
- **THEN** the release commits the snapped target the preview showed, as one
  move that one Undo reverses

#### Scenario: An arrow dragged off the board is removed

- **WHEN** the player picks up a tile's arrow and releases it off the board
- **THEN** the arrow and its partner's are removed
- **AND WHEN** a drag from a dot is released off the board
- **THEN** no history entry is added

### Requirement: Only an association some galaxy could contain is offered

A drag SHALL offer a (cell, dot) pair only if the cell is reachable from the dot
by a connected, 180°-symmetric region that avoids every other dot's own tiles.
That test SHALL depend on the dot layout alone, so one mistaken arrow cannot
veto a correct one elsewhere. The player's walls are read for one thing: a tile
inside a locally valid region, or whose partner is, SHALL NOT be offered. The
check SHALL NOT run the deduction chain, which would narrow the offer to an
answer.

#### Scenario: A wrong arrow elsewhere does not change the offer

- **WHEN** the player has associated a neighboring cell with the wrong dot and
  then aims a drag at a (cell, dot) pair
- **THEN** the pair is offered or not exactly as it was before that arrow

### Requirement: A drag from a cell finds its dot

A drag from a tile with no dot and no arrow SHALL hold the tile and let the
pointer pick the dot: it SHALL snap to the nearest dot within reach that a
release could legally associate the tile with, and to none when no such dot is
in reach. The release SHALL commit the tile and its 180° partner to the picked
dot as one move, or nothing if no dot was picked. A press on a tile that
already carries an arrow SHALL pick that arrow up and carry it elsewhere.

#### Scenario: The pointer picks the dot

- **WHEN** the player drags from a tile that has no dot and no arrow toward a
  dot it could join, and releases within reach of it
- **THEN** the tile and its 180° partner are committed to that dot as one move
- **AND WHEN** the release comes with no dot picked
- **THEN** nothing is committed

### Requirement: A bare right click on an empty cell does nothing

A right click on an empty tile, without a drag, SHALL commit nothing. The
cell-to-dot gesture is a drag, and a click SHALL NOT associate a cell with
whichever dot happens to be nearest. A right press on a dot that sits on an
edge or a corner starts its drag aimed at the tile under the pointer, so a
click there SHALL commit that tile and its partner to the dot, both of them
cells the dot sits on.

#### Scenario: A bare right click on an empty cell

- **WHEN** the player right-clicks an empty tile without dragging
- **THEN** nothing is committed

#### Scenario: A bare right click on a dot on an edge

- **WHEN** the player right-clicks, without dragging, a dot that sits on the
  edge between two cells
- **THEN** both cells gain an arrow to that dot, as one history entry

### Requirement: Galaxies renders its board through GameDrawing

Galaxies SHALL render, through `GameDrawing`, the subcell grid, region fills,
white and black dots, set edges, an association arrow from each associated tile
to its dot, and the keyboard cursor. A region fill SHALL be colored by the
completion check: a locally valid region, symmetric about its single dot, is
filled in its dot's color. An association SHALL NOT color a tile.

#### Scenario: An arrow does not fill its tile

- **WHEN** a tile away from its dot is associated with it and its region is
  not yet closed
- **THEN** the tile shows its arrow on the plain cell surface

### Requirement: Galaxies reports its difficulty in the status bar

The game SHALL provide a status-bar string reporting the current puzzle's
difficulty when it is known.

#### Scenario: An Easy board says so

- **WHEN** an Easy board is in play
- **THEN** the status bar reads `Difficulty Easy.`

### Requirement: Galaxies has a plain-text format

The game SHALL provide a plain-text format of the board.

#### Scenario: The board is copied as text

- **WHEN** the board is asked for as text
- **THEN** each dot is an `o`, each grid vertex with no dot a `+`, each set
  edge a `|` or a `-`, and each tile associated with a dot a `W` or a `B` for
  that dot's color
- **AND** an edge that is not set and a tile with no association are spaces

### Requirement: An association drag previews discretely

An in-progress association drag SHALL preview discretely: the pointer's snapped
drop-target tile and its 180° partner about the drag dot, exactly the pair a
release would commit, SHALL each show an arrow toward the dot in a transient
color distinct from committed arrows, and the drop target SHALL additionally be
outlined. A target where a release would not commit SHALL show no preview.

#### Scenario: The drag preview tracks discretely

- **WHEN** the player drags from a dot across several tiles
- **THEN** at each snapped target the preview shows the target's arrow, with
  the tile outlined, and its 180° partner's arrow in the transient color

#### Scenario: An uncommittable target previews nothing

- **WHEN** the drag's snapped target is a tile where a release would not commit
  (a dot tile, a tile whose 180° partner is off the board, or a tile inside a
  locally valid region)
- **THEN** no preview is drawn: the absence is the feedback

### Requirement: A transient overlay is clipped to a tile and erased by its repaint

Every pixel a transient overlay paints, the drag preview and the keyboard
cursor alike, SHALL be clipped to a tile and erased by that tile's own repaint
when the overlay moves on. There SHALL be no paint outside the board, no stale
frame, and no full-board update per pointer move.

#### Scenario: The drag preview cleans up after itself

- **WHEN** the player drags from a dot across several tiles and releases
- **THEN** the tiles the preview vacates repaint clean, and after the release
  no preview paint remains anywhere, including outside the board, where nothing
  repaints

#### Scenario: The keyboard cursor cleans up after itself too

- **WHEN** the player walks the cursor across vertices and edges
- **THEN** each cell it leaves repaints clean, and hiding the cursor leaves no
  mark anywhere on the board

#### Scenario: Nothing is painted undeclared

- **WHEN** Galaxies is played through the app
- **THEN** no pixel is painted outside what Galaxies' `redraw` declares

### Requirement: The transient affordances use authored colors

The drag preview and the keyboard cursor SHALL both use authored colors, not
colors derived from the board, because a color derived from the board is by
construction not prominent against it, in either scheme.

#### Scenario: The host background does not tint them

- **WHEN** the host supplies a different default background
- **THEN** the colors of the drag preview and of the cursor are not derived
  from it

### Requirement: Candidate dots are ringed during a cell-to-dot drag, by preference

While a cell-to-dot drag is in progress, every dot the cell could legally join
SHALL be ringed and the picked one emphasized. Under the key `galaxies-show-drag-candidates`, on by default, the rings SHALL be subject to a
preference, because they are a solving aid. The gesture SHALL NOT be gated by
that preference.

#### Scenario: Candidate dots are ringed, and can be switched off

- **WHEN** a cell-to-dot drag is in progress
- **THEN** exactly the dots a release could legally commit to are ringed, the
  picked one more heavily, and the rings are erased when the drag ends
- **AND WHEN** the candidate preference is off
- **THEN** no rings are drawn, and the drag and its commit preview are
  unaffected

### Requirement: Galaxies detects mistakes against the unique solution

Galaxies SHALL implement the engine's `findMistakes` hook. It SHALL recover the
puzzle's unique solution by solving a cleared copy of the state, dots only, to
its tile-to-dot partition. It SHALL flag every tile the player has associated
with a dot different from the solution's dot for that tile, and every interior
wall the player has set whose two adjacent tiles the solution assigns to the
same region.

#### Scenario: A wrong association is flagged

- **WHEN** the player associates a tile with a dot other than the one the
  unique solution assigns it, and invokes mistake checking
- **THEN** Galaxies flags exactly that tile, and its 180° partner if the player
  likewise mis-associated it

### Requirement: Mistake checking covers walls as well as associations

Mistake checking SHALL cover both ways the game is played. Wall detection SHALL
NOT be left out: Galaxies is commonly played by drawing region boundaries with
no association arrows at all, and a check blind to walls would let a wrong
wall-only board pass as clean.

#### Scenario: A wall inside a single region is flagged

- **WHEN** the player draws an interior wall between two tiles that the unique
  solution places in the same region, and invokes mistake checking
- **THEN** Galaxies flags that wall, even when the board has no association
  arrows at all

### Requirement: What is incomplete is not flagged

A tile the player has not associated and a wall the player has not drawn SHALL
NOT be flagged: they are incomplete, not mistaken. If the cleared copy does not
solve to a unique solution, which is possible only for a hand-entered board
that is not unique, Galaxies SHALL flag nothing.

#### Scenario: A correct partial board is clean

- **WHEN** every association the player has made matches the solution, though
  the board is not yet complete
- **THEN** Galaxies flags no cells and mistake checking reports zero

#### Scenario: A wall on a true region boundary is clean

- **WHEN** the player draws an interior wall that the unique solution also has
- **THEN** Galaxies does not flag it

#### Scenario: A solved board is clean

- **WHEN** the player has completed the board correctly
- **THEN** mistake checking reports zero, and the engine's lifecycle has
  already cleared any earlier highlight on the solving move

### Requirement: Galaxies highlights the mistakes it finds

Galaxies SHALL render the flagged tiles and walls with a distinct mistake
highlight.

#### Scenario: A flagged tile and a flagged wall are lit

- **WHEN** mistake checking has flagged a tile and a wall
- **THEN** the renderer highlights the tile, and draws the wall in the mistake
  color

### Requirement: Galaxies explains its deductions in association vocabulary

Galaxies SHALL implement the engine's `hint()` hook as a recorded projection of
its own solver: the same deduction chain that generates and solves boards runs
with a recorder, and each recorded firing becomes one narrated hint journey meeting
the collection's hint quality bar. A journey SHALL explain why the association
is forced, such as the blocked symmetric partner or the only dot whose symmetry
can reach the tile, and never merely what to do.

#### Scenario: A forced association is taught as one step

- **WHEN** the player requests a hint on a board where a deduction forces a
  tile's dot
- **THEN** one step is shown whose narration states the forcing reason and
  whose single move associates both the tile and its 180° partner

### Requirement: A hint step's action is a move the game already has

A step's action SHALL be a move the game already has: the committed
association, or a wall the board forces. A firing that claims a cell SHALL
claim its 180° partner in the same step, because the game commits the pair
atomically and a separate leg for the partner would be a move that changes
nothing. The step's sentence SHALL name the partner, and the hint's legend
SHALL say why the two travel together: the partner is the square opposite the
dot, and the same arrow brings it along.

#### Scenario: The partner comes in the same step

- **WHEN** a hint step settles a tile whose 180° partner is a different tile
- **THEN** the step's one move associates both, and no later step is spent on
  the partner

#### Scenario: A step that brings a partner

- **WHEN** a step's sentence reads "it and its partner"
- **THEN** the sentence does not explain the symmetry, and the legend's entry
  for the ring does

### Requirement: The hint plan finishes the board with walls

Because associations alone never complete a board and only walls do, the plan
SHALL carry the deduction through to the walls it justifies. Followed from any
position it is asked from, the hints SHALL reach a solved board, or, on an
Unreasonable board only, the refusal that deduction has run out.

#### Scenario: The plan finishes the board, not just the notation

- **WHEN** hints are followed one at a time from a fresh board
- **THEN** the plan draws the walls its associations justify and reaches a
  solved board

### Requirement: Hint marks name what the player can see

Evidence SHALL be highlighted in the hint color legend, and
dots SHALL be named by properties the player can see. A rule-out SHALL NOT be
demanded of the player as a move, and where it is shown it SHALL be shown as
evidence. Equivalent moves SHALL share a color.

#### Scenario: A dot is named by its color

- **WHEN** a step's narration names a dot
- **THEN** it calls it the white dot or the black dot, or names it by the mark
  drawn on it

### Requirement: The hint's action color is not the drag's

The hint's action color SHALL be distinct from the association drag's, which
marks the same objects, a dot and a cell, while the player follows a hint.

#### Scenario: A hint and a drag are on screen together

- **WHEN** a hint step is displayed
- **THEN** its evidence and its action are drawn in the hint legend's two
  colors, neither of them the drag preview's

### Requirement: A stored plan survives the player working ahead

A stored plan SHALL survive the player working ahead: a step whose tile the
player has meanwhile associated SHALL be refreshed away, and the plan SHALL
advance.

#### Scenario: The plan survives the player committing ahead

- **WHEN** a hint journey is displayed and the player directly commits the
  association it was leading to
- **THEN** the resolved step is dropped without being shown as stale and the
  plan advances, recomputing only if it drains

### Requirement: The Galaxies hint never guesses

Every step the hint offers SHALL be a deduction the player could make from the
board in front of them. The hint SHALL NOT guess: where the remaining progress
can only be found by hypothesizing a cell's dot and propagating until something
breaks, the hint SHALL refuse, and the refusal SHALL say that deduction has run
out and what the player can do instead.

#### Scenario: Deduction running out is said plainly, not guessed past

- **WHEN** the remaining progress can only be found by trying a cell's dot and
  following it until something breaks
- **THEN** the hint refuses, saying that nothing further follows by deduction
  and that the position can be tried from a saved checkpoint
- **AND** it does not report the survivor of a search as though it were a
  technique

### Requirement: An Easy board is finished by deduction alone

An Easy board SHALL be carried all the way to solved by deduction alone. The
refusal that deduction has run out SHALL NOT be reached on an Easy board:
reaching it is what the Unreasonable tier means.

#### Scenario: An Easy board is always finished by deduction

- **WHEN** hints are followed from a fresh board at the Easy tier
- **THEN** every step is a deduction whose premise is visible on the board as
  it stands, and the board reaches solved

### Requirement: Galaxies draws its cells on the collection's quiet surface

`redraw` SHALL draw a cell that belongs to no finished region as the
collection's cell surface, with the collection's surface grid line between
cells. The edges the player draws and the border of the board SHALL keep their
weight and their ink: they are the content, and the grid is not.

#### Scenario: Edges are stronger than the grid

- **WHEN** the player draws an edge
- **THEN** it is drawn in ink, heavier than the grid line beside it

### Requirement: A white dot's finished region is the lifted surface

A locally valid region of a white dot SHALL be filled with the collection's
lifted surface, which is brighter than the cell surface in both schemes. This
is the fill that is the dot's color for a white dot.

#### Scenario: A finished region stands off the cells around it in both schemes

- **WHEN** a region symmetric about its single white dot is closed
- **THEN** its cells are filled with the lifted surface
- **AND** the cells around it are the cell surface

### Requirement: The dots keep their white and their black in both schemes

A white dot SHALL be drawn in a white and a black dot in a black that are the
same in both schemes, as a hint's words name them, each with a rim in ink.

#### Scenario: The dots read on a fresh dark board

- **WHEN** a fresh board is drawn in the dark scheme
- **THEN** each white dot is a white disc on its dark cells
