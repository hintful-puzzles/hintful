# map Specification

## Purpose
Map, the puzzle of four-coloring a map so that no two regions sharing an edge
have the same color, given a few regions already colored. This capability
specifies the game: its graded solver and the generator gated on it,
completion and mistake reporting, its hint, and its input, preferences and
rendering.

## Requirements

### Requirement: Map game implements the Game interface

The engine SHALL provide a registered `map` game implementing `Game`: color
every region of a map so that no two adjacent regions share a color, given some
regions pre-colored as immutable clues. The game SHALL provide `solve`, and
SHALL drive a completion flash that is suppressed after Solve.

#### Scenario: The flash follows the player's last move, not Solve

- **WHEN** the player colors the last region so that the board is complete
- **THEN** the completion flash plays
- **AND** a board completed by Solve does not flash

### Requirement: Map's parameters

Params SHALL be `w`, `h`, `n` (the number of regions) and `diff` (one of Easy,
Normal, Tricky, Unreasonable), encoded `{w}x{h}n{n}` with a full-form
`d{char}` difficulty suffix (chars `e`/`n`/`h`/`u`).

#### Scenario: Params round-trip

- **WHEN** params `{ w: 20, h: 15, n: 30, diff: Normal }` are encoded in full
- **THEN** the result is `20x15n30dn` and decoding it round-trips the params

### Requirement: Map decodes params leniently

`decodeParams` SHALL be lenient: an omitted `xH` defaults height to width, an
omitted `nN` defaults `n` to `w*h/8`, a `.` in the region count is tolerated
(truncated), and an unknown difficulty char is ignored.

#### Scenario: Lenient decode

- **WHEN** `decodeParams` is given `12` (no height, no region count, no
  difficulty)
- **THEN** it yields `w = 12`, `h = 12`, `n = 12*12/8`, and the default
  difficulty

### Requirement: Map's presets

Eight presets SHALL be offered: 15×20 with 30 regions and 25×30 with 75
regions, each at every difficulty.

#### Scenario: Each size is offered at every tier

- **WHEN** the preset menu is read
- **THEN** it holds 15×20 with 30 regions at Easy, Normal, Tricky and
  Unreasonable, and 25×30 with 75 regions at the same four

### Requirement: Map refuses params that describe no map

The game SHALL declare, in `paramConfig`, a minimum of 2 for the width and the
height and of 5 for the number of regions, which the engine refuses a value
below. `validateParams` SHALL refuse more regions than grid squares
(`n > w*h`), and a width and height whose product overflows.

#### Scenario: Invalid params are rejected

- **WHEN** params with fewer than five regions, or with more regions than grid
  squares, are validated
- **THEN** a non-null error string is returned

### Requirement: Map descriptions use the upstream two-part encoding

The desc SHALL encode the region boundaries and the clue colors as two
comma-separated run-length parts, the edge list and then the clue list. The
edge list SHALL be alternating runs of non-edge and edge, walked across all
horizontal edges row by row and then all vertical edges column by column, with
a lowercase letter giving each run's length, `z` standing for a run of 25 with
no state switch, and a notional leading non-edge.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: Map's clue list runs over the regions

The clue list, the desc's second part, SHALL be digits `0`–`3` for region clue
colors, interspersed with lowercase letters giving run lengths of unclued
regions, with `z` meaning a run of 26.

#### Scenario: A letter skips unclued regions

- **WHEN** a clue list reads a digit, the letter `c` and a digit
- **THEN** the first region is a clue, the next three have none, and the fifth
  is a clue

### Requirement: A malformed Map description is refused

Reading a desc, which is what the engine's `validateDesc` reports on, SHALL
rebuild the regions from the edge list via a union-find over non-edges, and
SHALL reject an unknown character, an edge list that defines the wrong number
of regions, and a clue list whose region count does not equal `n`.

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc whose clue list defines a region count
  other than `n`, or whose edge list defines the wrong number of regions
- **THEN** it returns a non-null error string

### Requirement: newState builds the immutable map

`newState` SHALL parse the desc into the immutable region structure (the
four-quadrant map, the adjacency graph, the clue coloring), run the
desc-seeded diagonal-smoothing pass, and compute the canonical edge and region
label points.

#### Scenario: The same description draws the same map

- **WHEN** `newState` is given one desc twice
- **THEN** both states split the same cells along the same diagonals

### Requirement: Map reports completion and mistakes

The board SHALL be completed when every region is colored and no two adjacent
regions share a color. Because boards are uniquely solvable, the game SHALL
implement `findMistakes`: re-solve from the immutable clues to the unique
solution and return every region whose player-assigned color differs from it
(a definite mistake). A non-uniquely-solvable board SHALL yield no mistakes.

#### Scenario: A region colored against the unique solution is flagged

- **WHEN** the player colors a region a color the unique solution does not give
  it, and `findMistakes` is invoked
- **THEN** that region is returned as a mistake

#### Scenario: A partially-colored but correct board has no mistakes

- **WHEN** the player has colored only regions in agreement with the unique
  solution
- **THEN** `findMistakes` returns an empty result

### Requirement: Dots that leave out a region's color are a mistake

`findMistakes` SHALL also return every blank region whose dots leave out its
color in the unique solution, because a dot claims the region might be that
color. A blank region with no dots SHALL never be a mistake.

#### Scenario: Dots that leave out a region's color are flagged

- **WHEN** the player dots a blank region with colors that do not include the
  one the unique solution gives it, and `findMistakes` is invoked
- **THEN** that region is returned as a mistake, and a hint is refused until it
  is fixed

### Requirement: Check & Save refuses a Map board with a mistake

Check & Save depends on `findMistakes` and SHALL refuse to save while any
mistake is present.

#### Scenario: A wrong color blocks the save

- **WHEN** a region is colored against the unique solution and the player
  presses Check & Save
- **THEN** the board is not saved

### Requirement: Map's adjacency error markers are always on

The red adjacency error markers, drawn where two adjacent colored regions
clash, SHALL always be drawn, independent of `findMistakes`.

#### Scenario: A clash is marked without a check

- **WHEN** two adjacent regions hold the same color and no mistake check has
  been asked for
- **THEN** a red marker is drawn on the border between them

### Requirement: A drag carries a color or its marks

`interpretMove` SHALL support a press that picks up the color of the region
under the pointer (or, on a blank region, its pencil marks) into a floating
drag blob, and a release that drops the held color onto the region under the
pointer. The region under a pixel SHALL be found by the quadrant hit-test of a
diagonally-split cell. A drop that changes nothing SHALL produce no move.

#### Scenario: A drag colors a region

- **WHEN** the player presses on a colored region and releases on an adjacent
  blank region
- **THEN** `interpretMove` yields a move whose execution sets the blank region to
  the held color

#### Scenario: A no-op drop yields no move

- **WHEN** the player drops a color onto a region that already holds it (or onto
  the border, or onto an immutable clue region)
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

### Requirement: A right-drag pencils one color

`interpretMove` SHALL support a right-drag from a color to a blank region that
toggles a single pencil-mark bit. Penciling a colored region SHALL be
rejected.

#### Scenario: A right-drag toggles one dot

- **WHEN** the player right-drags from a colored region onto a blank region
- **THEN** the blank region gains a dot of that color and stays blank
- **AND** the same right-drag again removes the dot

### Requirement: The keyboard cursor picks and drops

`interpretMove` SHALL support a keyboard cursor that picks and drops via the
select keys, naming its region by the same quadrant hit-test of a
diagonally-split cell that the pointer uses.

#### Scenario: Select carries a color to another region

- **WHEN** notes mode is off, the cursor is shown on a colored region, the
  primary select key is pressed, the cursor is moved to a blank region and the
  primary select key is pressed again
- **THEN** the blank region takes the color that was picked up

### Requirement: Map's preferences

The three preferences victory-flash effect, number-regions and stipple display
style SHALL be exposed through the `prefs` hook under the keywords
`flash-type`, `show-numbers` and `stipple-style`, and stored on the `Ui` with
`newUi` defaults. The `l`/`L` key SHALL toggle region numbers in play.

#### Scenario: A key shows and hides the region numbers

- **WHEN** the region numbers are hidden and `l` is pressed during play
- **THEN** the region numbers are shown, and pressing it again hides them

### Requirement: What Map draws

`redraw` SHALL render region fills, the diagonal second-region triangle of a
split cell, pencil-mark stipples, grid lines on region boundaries, the red
adjacency error diamonds, optional region numbers, the flagged-mistake region
outline, the selected region's band, the floating drag blob (a blitter sprite)
while a color or its marks are carried, and the selected completion-flash
style.

#### Scenario: A split cell shows both of its regions

- **WHEN** a cell divided diagonally between a colored region and another
  region is drawn
- **THEN** each triangle of the cell takes its own region's fill

### Requirement: Map's board has no border of its own

The board SHALL be drawn with no border of its own. The canvas SHALL be the
board grown on every side by the room the pencil-mode indicator needs
(`pencilIndicatorCanvas`), and by nothing else.

#### Scenario: The canvas is the board and the indicator's room

- **WHEN** the canvas size is computed for a tile size
- **THEN** it is the grid's own extent with the pencil-mode indicator's room
  added on each side

### Requirement: Map's solver is graded by tier

The solver SHALL have its full graded deductive power over the
region-adjacency graph: at Easy, place a region that has exactly one possible
color left; at Normal, additionally exclude a shared color pair from the
common neighbors of an adjacent same-two-possibilities pair; at Tricky,
additionally run the forcing-chain breadth-first search; at Unreasonable,
additionally recurse (guess and verify).

#### Scenario: A board that needs a pair is not solved at Easy

- **WHEN** a board whose solution needs the shared-pair deduction, and nothing
  above it, is solved with the Easy cap
- **THEN** the solver does not report a unique solution
- **AND** with the Normal cap it does

### Requirement: The solver returns a three-valued verdict

The solver SHALL return the three-valued verdict (impossible, unique, or stuck
or ambiguous), and a grading routine SHALL return the easiest difficulty that
yields a unique solution.

#### Scenario: Clashing clues are impossible

- **WHEN** the solver is given clues that color two adjacent regions alike
- **THEN** its verdict is impossible, at every difficulty

### Requirement: Map's generator is gated on the solver

The generator SHALL grow voronoi regions over the cumulative-frequency table,
four-color them recursively, reduce clues under the solver's gate without ever
removing the last region of a color, and retry below a difficulty floor.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated for a given difficulty and graded by the solver
- **THEN** the grading is a unique solution at exactly the requested difficulty

### Requirement: Solve uses the generator's answer when it has one

`solve` SHALL return the generator's aux when present, else re-solve from the
clues at maximum difficulty.

#### Scenario: A board with no aux is re-solved from its clues

- **WHEN** Solve is asked on a board loaded from a desc alone
- **THEN** the answer comes from solving the clues at the top difficulty, and
  the player's own colors do not enter it

### Requirement: Map offers one key per color, and a tap selects a region

Map SHALL offer an on-screen key for each of its four colors and a Clear key.
Pressing a color key SHALL color the region at the keyboard cursor, or toggle
that color as a pencil mark while notes mode is on; Clear SHALL empty the
region. A key SHALL act only while the cursor is shown, and SHALL be declined
otherwise, as the digit games do: entry at a cursor nobody can see puts a color
where the player is not looking.

#### Scenario: A region is colored without dragging

- **WHEN** a blank, non-clue region is tapped and a color key is pressed
- **THEN** that region takes that color, with no drag anywhere in the gesture

#### Scenario: The same key marks while notes mode is on

- **WHEN** notes mode is armed, a blank region is tapped and a color key is
  pressed
- **THEN** that color is toggled as a pencil mark, the region stays blank, and
  pressing the same key again rubs the mark out

#### Scenario: A clue refuses a color key

- **WHEN** a clue region is selected and a color key is pressed
- **THEN** no move is produced

### Requirement: A gesture that commits no move selects its region

A pointer gesture that commits no move SHALL select the region it ended on,
because a player without a keyboard has no other way to move the cursor the
keys act at. A drag that ends where it cannot commit, on a clue or back where
it started, SHALL select by the same rule and not by a second one.

#### Scenario: A tap selects

- **WHEN** nothing is selected and a blank region is pressed and released
  without leaving it
- **THEN** no move is made and that region is selected

#### Scenario: A drag onto a clue resolves as a tap on the clue

- **WHEN** a color is dragged from one region and released on a clue region
- **THEN** no move is made, and the selection changes as a tap on the clue
  region would change it

### Requirement: A Map selection follows the note-taking cell's rule

What a selecting gesture does to the highlight and to notes mode SHALL be the
note-taking cell's rule, with the button the gesture used: a region may take a
color when it is not a clue, and a mark when it is blank.

#### Scenario: A clue is a region that takes nothing

- **WHEN** a clue region is tapped
- **THEN** the note-taking cell's rule is asked about a region that can take
  neither a color nor a mark

### Requirement: Selection names the region, not its cell

Selection SHALL name the region the pointer was on, not merely its cell. The
cursor is a cell plus the direction it last moved, which is how a
diagonally-split cell names one of the regions it holds, and the translation
from a pixel SHALL derive that direction from the same quadrant test the
pixel-to-region hit-test uses and SHALL NOT restate it.

#### Scenario: A tap on a split cell selects the region under the finger

- **WHEN** a diagonally-split cell is tapped on one side of its diagonal
- **THEN** the cursor names the region that side belongs to, not the other one
- **AND** the band is drawn inside that region and nowhere outside it

### Requirement: The selected region is drawn as a band

The selection SHALL be drawn as the note-taking cell's picture in a region's
shape: a band just inside the whole of the selected region's boundary, in the
palette's cursor color, in both modes, and in notes mode the corner triangle
in the region's first cell in reading order as well. The region's own fill
SHALL NOT change, because in this game the fill is the answer.

#### Scenario: The selected region is outlined, not recolored

- **WHEN** a region is selected
- **THEN** every cell on that region's boundary carries the band, the band
  covers well under half of the region, and in notes mode the corner triangle
  appears in the region's first cell

### Requirement: A color carried by the keyboard sits in the triangle the cursor names

A color carried by the keyboard SHALL be drawn inside the triangle the cursor
names on a divided cell, at that triangle's centroid, a third of a tile from
the cell's center, so the carried color says which half of a divided cell its
drop will land in. On a whole cell it SHALL be drawn with a one-pixel nudge
from the center.

#### Scenario: The carried color sits on the cursor's side of a diagonal

- **WHEN** a color is picked up by a select key with the cursor on a divided
  cell
- **THEN** the color is drawn within the triangle the cursor names, and not on
  the diagonal

### Requirement: Dragging and select work beside the color keys

Dragging a color from one region to another SHALL work as it does without the
keys, and so SHALL the keyboard's pick-and-drop by select. The panel is a
second way in and SHALL NOT replace either.

#### Scenario: A drag still colors while a region is selected

- **WHEN** a region is selected, notes mode is off, and the player drags a
  color from a second region onto a third, blank one
- **THEN** the third region takes that color

### Requirement: Map explains the next deduction

A hint SHALL be refused when the board is solved or `findMistakes` reports a
mistake, by the midend before it asks the game. `hint(state)` SHALL refuse
with `DEDUCTION_EXHAUSTED` when nothing follows, which only an Unreasonable
board allows, and otherwise SHALL return the forced steps from the player's
own board as an ordered plan.

#### Scenario: A board that needs a guess is refused

- **WHEN** a hint is requested on an Unreasonable board where no deduction
  fires
- **THEN** `hint` refuses with `DEDUCTION_EXHAUSTED`

### Requirement: A blank region's colors are read from its dots

A blank region's colors SHALL be read as its dots, or all four colors when it
has none, less every color a neighbor shows. That is sound because
`findMistakes` flags any dots leaving out a region's answer. The plan SHALL
place dots only where a deduction rules out a color no neighbor shows, or
where a pair's or chain's premise needs them, so an Easy board's plan places
none.

#### Scenario: The hint's dots are the next step's premise

- **WHEN** the player follows a step that dots a region and asks for the next
  hint
- **THEN** a later deduction may read that region's colors from those dots, as
  the player can

### Requirement: The hint's deductions are the solver's three rungs

The deductions SHALL be the solver's three rungs, reported by the same
functions the solver runs: a region with one color left must take it; two
touching regions down to the same two colors use both, so a region touching
both can be neither; and a forcing chain, in which region 1 has two colors,
each numbered region forces the next if region 1 is not the struck color, and
the last is driven to it, so a region touching the first and the last cannot
be that color.

#### Scenario: A region whose neighbors show three colors takes the fourth

- **WHEN** a blank region with no dots touches regions of three different colors
  and a hint is requested
- **THEN** the step colors it the fourth, rings it, outlines nothing else, and
  names the three colors and the fourth

### Requirement: The plan offers the lowest rung that fires

The plan SHALL offer the lowest rung that fires anywhere on the board and
choose within it by continuing from its latest steps, so an Easy board's plan
never shows a pair and a Normal board's never shows a chain.

#### Scenario: A single elsewhere comes before a pair nearby

- **WHEN** a pair fires beside the last step's region and a region somewhere
  else has one color left
- **THEN** the next step colors the region with one color left

### Requirement: A narrowing step says what it does

A narrowing step SHALL color its region when one color is left, remove the
struck dots when the region has dots, and otherwise dot the colors left, and
its sentence SHALL say which. One firing that narrows several regions SHALL be
one journey, a leg per region.

#### Scenario: A pair strikes dots the player made

- **WHEN** a pair rules a color out of a region that carries a dot of it, and
  more than one color is left to that region
- **THEN** the step removes that dot and its sentence says the dot must go

### Requirement: A pair or chain first dots its premise

A pair or chain firing SHALL open its journey with a leg for each region its
premise rests on that does not already show exactly its two colors as dots,
dotting them (or removing the dots a neighbor's color rules out), so that when
the pair or chain step is spoken every one of those regions shows its two
colors and the deduction can be followed on the board without being worked
out.

#### Scenario: A pair's undotted region is dotted before the pair is stated

- **WHEN** the next deduction is a pair one of whose regions shows no dots
- **THEN** the journey's first step rings that region, outlines nothing, dots
  the two colors its neighbors leave it, and the pair step follows with both
  regions showing their two dots

#### Scenario: A chain's conclusion is dotted onto an unmarked region

- **WHEN** the next deduction is a forcing chain striking a color from a region
  with no dots
- **THEN** the journey first dots each numbered region without them with its two
  colors, then its last step dots that region with the colors it has left,
  numbers the chain's regions 1 to N on the board, and says region 1's two
  colors, the color region N is driven to, and that this region touches both
  ends

### Requirement: The chain step names what the dots show

The chain step SHALL name what the dots show, not a rule the player must run.
When every numbered region has a dot of the struck color, it SHALL say so and
that the color falls on every other region from region 2 when region 1 does
not take it. Otherwise it SHALL walk the chain by color, naming region 1's
other color and the color each later region then takes, for a chain of up to
five regions, and past that SHALL name the rule and where the chain ends.

#### Scenario: A chain whose regions all carry the struck color is told as a pattern

- **WHEN** every numbered region of a chain has a dot of the struck color when
  the chain step is spoken
- **THEN** the sentence says so, and that the color falls on every other region
  if region 1 does not take it, instead of naming each region's color

### Requirement: The chain step ends on the struck color

Whether it tells the pattern or walks the chain, the chain step SHALL conclude
that region 1 or the last region takes the struck color, and that this region
touches both. The plan SHALL fail and SHALL NOT speak a walk that does not end
on the struck color.

#### Scenario: Both tellings reach the same conclusion

- **WHEN** a chain step is spoken, as a pattern or as a walk
- **THEN** it says region 1 or the last region is the struck color, and that
  the ringed region touches both

### Requirement: A hint step rings the region it acts on

A step SHALL ring the region it acts on with a solid band inside the region's
boundary, in the hint's action color, and that band SHALL be the only hint mark
on any region boundary. A region with one color left SHALL outline nothing
else, because its neighbors' fills are its premise.

#### Scenario: A single's neighbors carry no mark

- **WHEN** a step colors a region whose neighbors leave it one color
- **THEN** the region is ringed and no neighbor is ringed or outlined

### Requirement: A premise's regions are outlined apart from the ring

The regions a pair or a chain rests on SHALL be outlined by a thin dashed line
in the hint's evidence color, set in from their boundary, so that where they
meet the target the two marks stay apart. A chain's regions SHALL be numbered
at their label points, with the region numbers hidden while it shows. The
selection band SHALL stay visible just inside a hint band on the same region.

#### Scenario: An outlined pair beside its target

- **WHEN** a pair step is shown and one of the pair borders the ringed region
- **THEN** the dashed line and the solid band on either side of that border do
  not touch

### Requirement: The generator does not call the hint

The generator SHALL NOT call the hint, and splitting the rungs into functions
SHALL change no solver verdict.

#### Scenario: The hint reads the rungs without applying them

- **WHEN** the hint collects a rung's firings from a board
- **THEN** the solver's verdict on that board, and the board a seed generates,
  are what they would be had no hint been asked

### Requirement: Map's Mark-all press is adaptive

Map SHALL declare `canMarkAll` and answer the `M` key with an adaptive
Mark-all: while some blank region has no dots, the press SHALL dot all four
colors into every such region and change no other; once none is left, it SHALL
remove from each blank region the dots of the colors its neighbors show,
keeping a region's last dot and not emptying it; and a press with nothing to
do SHALL be no move.

#### Scenario: Two presses dot each region with what its neighbors leave

- **WHEN** the player presses Mark-all twice on a fresh board
- **THEN** every blank region shows as dots exactly the colors no neighbor shows, and
  a third press is no move

#### Scenario: The press never refills a region the player narrowed

- **WHEN** some blank regions carry the player's dots and others carry none, and the
  player presses Mark-all
- **THEN** only the regions with no dots gain dots, and every other region's dots are
  unchanged

### Requirement: Map offers the player's reading of an undotted region

Map SHALL offer the shared `hint-notes` preference through a
`candidateReading` field in its `Ui`, defaulting to `implicit` with the reason
stated in `newUi`. Under `implicit` the hint SHALL plan as the requirements
from "Map explains the next deduction" to "The generator does not call the
hint" state.

#### Scenario: The implicit reading never fills

- **WHEN** a hint is requested under the default reading
- **THEN** no step adds dots to more than one region

### Requirement: The populate reading opens with the Mark-all press

Under `populate` the plan SHALL open with the Mark-all press's moves, the fill
and then the clean, each only when the board needs it, as one journey, and
SHALL then plan from the dotted board by the same rungs. A player move equal
to a setup step's move, such as the Mark-all press itself, SHALL complete that
step.

#### Scenario: The populate reading opens with the press

- **WHEN** the player has chosen "Every candidate first" and asks for a hint on a
  fresh board
- **THEN** the first step dots all four colors into each blank region, the second
  continues it by removing the colors neighbors show, and pressing Mark-all while the
  first is shown completes it

### Requirement: Map draws an uncolored region on the collection's quiet surface

`redraw` SHALL fill a region that has no color with the collection's cell
surface, so the map reads as a field apart from the board round it and the
four fills are all the color on it. The four fills and the ink region borders
are the game and SHALL stay as they are. The drag blob that carries "no color"
and a region blanked by the completion flash SHALL take the same surface.

#### Scenario: An uncolored region is the cell surface

- **WHEN** a board with an uncolored region is drawn
- **THEN** that region is filled with the cell surface
- **AND** a colored region beside it keeps its fill, with the ink border
  between them
