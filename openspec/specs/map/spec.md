# map Specification

## Purpose
Map, the puzzle of four-coloring a map so that no two regions sharing an edge
have the same color, given a few regions already colored as clues that cannot
be changed. This capability specifies what is Map's own: its params and
description encodings, what its tiers mean and what the generator promises,
completion and mistakes, its drags, keys and selection, its hint, and the
decisions about how the map is drawn.

## Requirements

### Requirement: Rules: Map reports completion and mistakes

The board SHALL be completed when every region is colored and no two adjacent
regions share a color. `findMistakes` SHALL re-solve from the immutable clues
to the unique solution and return every region whose player-assigned color
differs from it.

#### Scenario: A partially-colored but correct board has no mistakes

- **WHEN** the player has colored only regions in agreement with the unique
  solution
- **THEN** `findMistakes` returns an empty result

### Requirement: Rules: Dots that leave out a region's color are a mistake

`findMistakes` SHALL also return every blank region whose dots leave out its
color in the unique solution, because a dot claims the region might be that
color. A blank region with no dots SHALL never be a mistake.

#### Scenario: Dots that leave out a region's color are flagged

- **WHEN** the player dots a blank region with colors that do not include the
  one the unique solution gives it, and `findMistakes` is invoked
- **THEN** that region is returned as a mistake, and a hint is refused until it
  is fixed

### Requirement: Rules: Map's digits, keys and color words name one order of the colors

The four colors SHALL have one order, pink, yellow, teal and violet: a clue
digit `0`–`3` in a desc is that color by position, the digit keys `1`–`4` and
the on-screen keys labeled with them enter the first to the fourth, and the
hint names a color by that word. On a dark board, where the first two are
drawn as a maroon and a brown, the hint SHALL name them maroon and brown.

#### Scenario: A clue digit, a key and a word agree

- **WHEN** the desc whose clue list is `0c1321b3e01a0b10b0032` is opened on
  `15x20n30de`
- **THEN** region 0 is a pink clue and region 4 a yellow one, and the key that
  would enter the color of region 4 elsewhere is `2`

#### Scenario: The dark board's words

- **WHEN** a hint says a region touches pink, yellow and violet, and the
  player's scheme is dark
- **THEN** it says the region touches maroon, brown and violet

### Requirement: Params: Map's parameters

Params SHALL be `w`, `h`, `n` (the number of regions) and `diff` (one of Easy,
Normal, Tricky, Unreasonable), encoded `{w}x{h}n{n}` with a full-form
`d{char}` difficulty suffix (chars `e`/`n`/`h`/`u`).

#### Scenario: Params round-trip

- **WHEN** params `{ w: 20, h: 15, n: 30, diff: Normal }` are encoded in full
- **THEN** the result is `20x15n30dn` and decoding it round-trips the params

### Requirement: Params: Map reads a params string with its height, region count or difficulty left out

`decodeParams` SHALL default an omitted `xH` to the width and an omitted `nN`
to `w*h/8`, SHALL read a `.` and the digits after it in the region count and
drop them, SHALL read a string with no `d` as Normal, and SHALL refuse a
difficulty char that is none of the four.

#### Scenario: Lenient decode

- **WHEN** `decodeParams` is given `12` (no height, no region count, no
  difficulty)
- **THEN** it yields `w = 12`, `h = 12`, `n = 12*12/8`, and Normal

### Requirement: Params: Map refuses params that describe no map

`validateParams` SHALL refuse more regions than grid squares (`n > w*h`), and
a width and height whose product overflows, the second in the collection's
sentence for an area too large.

#### Scenario: More regions than squares

- **WHEN** params with more regions than grid squares are validated
- **THEN** a non-null error string is returned

### Requirement: Params: Map refuses a tier that a map has no board at

When a board is to be dealt above Easy, `validateParams` SHALL refuse, as
having no board at the tier: a map of 7 regions or fewer, a map two squares
wide or tall, a map whose every square is a region, and a map of 8 regions
above Normal. The refusal SHALL name the map and the tier and say there is
none. None of these SHALL be refused at Easy, or when a game ID is loaded.

#### Scenario: Seven regions have only Easy boards

- **WHEN** `4x4n7dn`, a 4x4 map of 7 regions at Normal, is validated for a deal
- **THEN** it is refused with "No map of 7 regions is Normal."
- **AND** the same params validated for loading are accepted

#### Scenario: Eight regions stop at Normal

- **WHEN** `4x4n8dh`, a 4x4 map of 8 regions at Tricky, is validated for a deal
- **THEN** it is refused with "No map of 8 regions is Tricky."

### Requirement: Description: Map descriptions use the upstream two-part encoding

The desc SHALL encode the region boundaries and the clue colors as two
comma-separated run-length parts, the edge list and then the clue list. The
edge list SHALL be alternating runs of non-edge and edge, walked across all
horizontal edges row by row and then all vertical edges column by column, with
a lowercase letter giving each run's length, `z` standing for a run of 25 with
no state switch, and a notional leading non-edge.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: Description: Map's clue list runs over the regions

The clue list, the desc's second part, SHALL be digits `0`–`3` for region clue
colors, interspersed with lowercase letters giving run lengths of unclued
regions, with `z` meaning a run of 26.

#### Scenario: A letter skips unclued regions

- **WHEN** a clue list reads a digit, the letter `c` and a digit
- **THEN** the first region is a clue, the next three have none, and the fifth
  is a clue

### Requirement: Description: A malformed Map description is refused

Reading a desc, which is what the engine's `validateDesc` reports on, SHALL
rebuild the regions from the edge list, and SHALL reject an unknown character,
an edge list that defines the wrong number of regions, and a clue list whose
region count does not equal `n`.

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc whose clue list defines a region count
  other than `n`, or whose edge list defines the wrong number of regions
- **THEN** it returns a non-null error string

### Requirement: Description: One description draws one map

The pass that smooths region borders into diagonals SHALL be seeded from the
desc alone, so a desc draws the same map every time it is opened.

#### Scenario: The same description draws the same map

- **WHEN** `newState` is given one desc twice
- **THEN** both states split the same cells along the same diagonals

### Requirement: Generation: Map's solver is graded by tier

The solver SHALL have its full graded deductive power over the
region-adjacency graph: at Easy, place a region that has exactly one possible
color left; at Normal, additionally exclude a shared color pair from the
common neighbors of an adjacent same-two-possibilities pair; at Tricky,
additionally weigh every color of one region, each read off its neighbors'
dots; at Unreasonable, additionally recurse (guess and verify).

#### Scenario: A board that needs a pair is not solved at Easy

- **WHEN** a board whose solution needs the shared-pair deduction, and nothing
  above it, is solved with the Easy cap
- **THEN** the solver does not report a unique solution
- **AND** with the Normal cap it does

#### Scenario: A board that needs a forcing chain longer than three is Unreasonable

- **WHEN** a board whose ID says Tricky needs a forcing chain the
  weighing does not reach
- **THEN** it opens as Unreasonable, keeps its ID, and its hint refuses where
  the chain was, as on any Unreasonable board

### Requirement: Generation: Map's generator never removes the last clue of a color

The clues of a generated board SHALL be reduced without ever removing the
last clue of a color, so every color is on the board to be picked up.

#### Scenario: The only clue of a color stays

- **WHEN** the reduction comes to a clue that is the last still given of its
  color
- **THEN** that clue stays given, whether or not the board would have one
  solution without it

### Requirement: Solver: Solve uses the generator's answer when it has one

`solve` SHALL return the generator's aux when present, else re-solve from the
clues at maximum difficulty.

#### Scenario: A board with no aux is re-solved from its clues

- **WHEN** Solve is asked on a board loaded from a desc alone
- **THEN** the answer comes from solving the clues at the top difficulty, and
  the player's own colors do not enter it

### Requirement: Controls: A drag carries a color or its marks

`interpretMove` SHALL support a press that picks up the color of the region
under the pointer (or, on a blank region, its pencil marks) into a floating
drag blob, and a release that drops the held color onto the region under the
pointer. The region under a pixel SHALL be found by the quadrant hit-test of a
diagonally-split cell.

#### Scenario: A drag colors a region

- **WHEN** the player presses on a colored region and releases on an adjacent
  blank region
- **THEN** `interpretMove` yields a move whose execution sets the blank region to
  the held color

#### Scenario: A no-op drop yields no move

- **WHEN** the player drops a color onto the border, or onto an immutable clue
  region
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

### Requirement: Controls: A right-drag pencils one color

`interpretMove` SHALL support a right-drag from a color to a blank region that
toggles a single pencil-mark bit. Penciling a colored region SHALL be
rejected.

#### Scenario: A right-drag toggles one dot

- **WHEN** the player right-drags from a colored region onto a blank region
- **THEN** the blank region gains a dot of that color and stays blank
- **AND** the same right-drag again removes the dot

### Requirement: Controls: The keyboard cursor picks and drops

`interpretMove` SHALL support a keyboard cursor that picks and drops via the
select keys, naming its region by the same quadrant hit-test of a
diagonally-split cell that the pointer uses.

#### Scenario: Select carries a color to another region

- **WHEN** notes mode is off, the cursor is shown on a colored region, the
  primary select key is pressed, the cursor is moved to a blank region and the
  primary select key is pressed again
- **THEN** the blank region takes the color that was picked up

### Requirement: Controls: Map offers one key per color, and a tap selects a region

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

### Requirement: Controls: A gesture that commits no move selects its region

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

### Requirement: Controls: A Map selection follows the note-taking cell's rule

What a selecting gesture does to the highlight and to notes mode SHALL be the
note-taking cell's rule (`engine-notes`, "The button and the sticky preference
decide the mode a press selects for"), with the button the gesture used: a
region may take a color when it is not a clue, and a mark when it is blank.

#### Scenario: A clue is a region that takes nothing

- **WHEN** a clue region is tapped
- **THEN** the note-taking cell's rule is asked about a region that can take
  neither a color nor a mark

### Requirement: Controls: Selection names the region, not its cell

Selection SHALL name the region the pointer was on, not merely its cell. The
cursor is a cell plus the direction it last moved, which is how a
diagonally-split cell names one of the regions it holds.

#### Scenario: A tap on a split cell selects the region under the finger

- **WHEN** a diagonally-split cell is tapped on one side of its diagonal
- **THEN** the cursor names the region that side belongs to, not the other one
- **AND** the band is drawn inside that region and nowhere outside it

### Requirement: Controls: Dragging and select work beside the color keys

Dragging a color from one region to another SHALL work as it does without the
keys, and so SHALL the keyboard's pick-and-drop by select. The panel is a
second way in and SHALL NOT replace either.

#### Scenario: A drag still colors while a region is selected

- **WHEN** a region is selected, notes mode is off, and the player drags a
  color from a second region onto a third, blank one
- **THEN** the third region takes that color

### Requirement: Controls: Map's Mark-all press is adaptive

Map's `markAll` SHALL be the adaptive press of `engine-notes`, "Mark-all is
adaptive in a game with an obvious-candidate rule", by a rule of its own: a
blank region with no dots is filled with all four colors, and an obvious
candidate is the dot of a color one of the region's neighbors shows. Where
that would strike every dot of a region, its first dot in the colors' order
SHALL stay.

#### Scenario: Two presses dot each region with what its neighbors leave

- **WHEN** the player presses Mark-all twice on a fresh board
- **THEN** every blank region shows as dots exactly the colors no neighbor shows, and
  a third press is no move

### Requirement: Controls: A drag from off the map or from a blank region carries no color

A press that is on no region SHALL pick up no color and no dots, and a press
on a blank region SHALL pick up no color and that region's dots. Dropped by a
left-drag, outside notes mode, on a region that is not a clue, either SHALL
clear the region's color and leave it exactly the dots carried. A right-drag carrying no color
SHALL do the same to a blank region and SHALL change nothing on a colored one.

#### Scenario: A drag from outside the grid erases

- **WHEN** the player presses outside the grid and releases on a region they
  colored earlier
- **THEN** the region is blank and has no dots

#### Scenario: A blank region's dots are copied

- **WHEN** the player drags from a blank region showing two dots onto another
  blank region showing none
- **THEN** the second region shows the same two dots and the first keeps its
  own

### Requirement: Controls: Notes mode makes every drop a pencil drop

While notes mode is on, the release of a left-drag and the primary select key
SHALL drop what is carried as a right-drag's release does: a carried color
toggles its dot on a blank region, and nothing is changed on a colored one.
The Marks key SHALL only switch the mode and SHALL make no move.

#### Scenario: A left-drag dots while the mode is on

- **WHEN** the Marks key has been pressed and the player left-drags from a
  colored region onto a blank one
- **THEN** the blank region gains a dot of that color and stays blank

#### Scenario: A colored region cannot be erased by a drag in notes mode

- **WHEN** notes mode is on and the player drags from outside the grid onto a
  region they colored
- **THEN** no move is made, and the gesture resolves as a tap on that region
  does in notes mode: the highlight moves there and is not shown, since a
  colored region takes no dot

### Requirement: Controls: A second select where the color was picked up erases, and the secondary select dots

A select key pressed while the cursor is hidden SHALL only show the cursor.
A second select with the cursor not moved since the pick-up SHALL drop "no
color" there, which, by the primary key with notes mode off, erases a region
the player colored. The secondary select key SHALL drop what is carried as a
right-drag's release does, toggling a carried color's dot on a blank region,
whatever the notes mode.

#### Scenario: Select twice erases

- **WHEN** notes mode is off, the cursor is shown on a region the player
  colored, and the primary select key is pressed twice without an arrow
  between
- **THEN** the region is blank

#### Scenario: The secondary select leaves a dot

- **WHEN** a color is picked up with the primary select key, the cursor is
  moved to a blank region and the secondary select key is pressed
- **THEN** that region gains a dot of the color and stays blank

### Requirement: Preferences: The `l` key shows and hides the region numbers

The `l`/`L` key SHALL toggle the `show-numbers` preference in play.

#### Scenario: A key shows and hides the region numbers

- **WHEN** the region numbers are hidden and `l` is pressed during play
- **THEN** the region numbers are shown, and pressing it again hides them

### Requirement: Preferences: The stipple-style preference sizes the dots

The `stipple-style` preference SHALL choose the radius of a pencil-mark dot:
a seventh of a tile under "Small", the default, and a quarter of a tile under
"Large". It SHALL change nothing else about where or whether a dot is drawn.

#### Scenario: Large dots sit where small ones did

- **WHEN** a dotted region is drawn under "Small" and again under "Large"
- **THEN** the dots have the same centers and colors, and the larger radius

### Requirement: Hint: A blank region's colors are read from its dots

A blank region's colors SHALL be read as its dots, or all four colors when it
has none, less every color a neighbor shows. That is sound because
`findMistakes` flags any dots leaving out a region's answer. The plan SHALL
place dots only where a deduction rules out a color no neighbor shows, or
where a pair's or weighing's premise needs them, so an Easy board's plan
places none.

#### Scenario: The hint's dots are the next step's premise

- **WHEN** the player follows a step that dots a region and asks for the next
  hint
- **THEN** a later deduction may read that region's colors from those dots, as
  the player can

### Requirement: Hint: The hint's deductions are the solver's three rungs

The deductions SHALL be the solver's three rungs, reported by the same
functions the solver runs: a region with one color left must take it; two
touching regions down to the same two colors use both, so a region touching
both can be neither; and a weighing, in which every color a middle region can
take but one, `x`, leaves a neighbor dotted with that color and `x` with `x`
alone, so a region touching every such neighbor, and the middle region where
it could be `x`, cannot be `x`.

#### Scenario: A region whose neighbors show three colors takes the fourth

- **WHEN** a blank region with no dots touches regions of three different colors
  and a hint is requested
- **THEN** the step colors it the fourth, rings it, outlines nothing else, and
  names the three colors and the fourth

#### Scenario: A three-region chain is a weighing

- **WHEN** a region can be yellow or pink, one neighbor is dotted yellow and
  teal, another pink and teal, and a third region touches both neighbors
- **THEN** the weighing rules teal out of the third region

### Requirement: Hint: The plan offers the lowest rung that fires

The plan SHALL offer the lowest rung that fires anywhere on the board and
choose within it by continuing from its latest steps, so an Easy board's plan
never shows a pair and a Normal board's never shows a weighing.

#### Scenario: A single elsewhere comes before a pair nearby

- **WHEN** a pair fires beside the last step's region and a region somewhere
  else has one color left
- **THEN** the next step colors the region with one color left

### Requirement: Hint: A narrowing step says what it does

A narrowing step SHALL color its region when one color is left, remove the
struck dots when the region has dots, and otherwise dot the colors left, and
its sentence SHALL say which. One firing that narrows several regions SHALL be
one journey, a leg per region.

#### Scenario: A pair strikes dots the player made

- **WHEN** a pair rules a color out of a region that carries a dot of it, and
  more than one color is left to that region
- **THEN** the step removes that dot and its sentence says the dot must go

### Requirement: Hint: A hint step rings the region it acts on

The ring's band on the region a step acts on SHALL be the only hint mark on
any region boundary. A region with one color left SHALL outline nothing else,
because its neighbors' fills are its premise.

#### Scenario: A single's neighbors carry no mark

- **WHEN** a step colors a region whose neighbors leave it one color
- **THEN** the region is ringed and no neighbor is ringed or outlined

### Requirement: Hint: A premise's regions are outlined apart from the ring

The outline of the regions a pair or a weighing rests on, which the legend
sets in from their boundary, SHALL stay apart from the ring where one of them
meets the target. The selection band SHALL stay visible just inside a hint
band on the same region.

#### Scenario: An outlined pair beside its target

- **WHEN** a pair step is shown and one of the pair borders the ringed region
- **THEN** the dashed line and the solid band on either side of that border do
  not touch

### Requirement: Hint: Map offers the player's reading of an undotted region

Map SHALL offer the shared `hint-notes` preference, defaulting to `implicit`.
Under `implicit` the hint SHALL plan as the requirements from "A blank
region's colors are read from its dots" to "A premise's regions are outlined
apart from the ring" state.

#### Scenario: The implicit reading never fills

- **WHEN** a hint is requested under the default reading
- **THEN** no step adds dots to more than one region

### Requirement: Hint: The populate reading opens with the Mark-all press

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

### Requirement: Hint: A pair or weighing first dots its premise

A pair or weighing firing SHALL open its journey with a leg for each region
its premise rests on that does not already show exactly its colors as dots,
dotting them (or removing the dots a neighbor's color rules out), so that when
the pair or weighing step is spoken every one of those regions shows its
colors and the deduction can be followed on the board without being worked
out. Such a leg SHALL ring the region it dots and outline nothing.

#### Scenario: A pair's undotted region is dotted before the pair is stated

- **WHEN** the next deduction is a pair one of whose regions shows no dots
- **THEN** the journey's first step rings that region, outlines nothing, dots
  the two colors its neighbors leave it, and the pair step follows with both
  regions showing their two dots

#### Scenario: A weighing's conclusion is dotted onto an unmarked region

- **WHEN** the next deduction is a weighing striking a color from a region
  with no dots
- **THEN** the journey first dots the middle region and each end without them
  with their colors, then its last step dots that region with the colors it
  has left and outlines the middle region and the ends

### Requirement: Hint: The weighing step names its middle region and its ends

The weighing step SHALL name the middle region and the ends, each a reference
of its own, and say that whatever the middle region is, it or an end beside
the ringed region is the struck color. The dots its regions show are the
ways, and the sentence SHALL NOT recite them color by color.

#### Scenario: A weighing is named by its parts

- **WHEN** a weighing step is spoken
- **THEN** pressing "the middle region" finds that region alone, and pressing
  "an end" finds the ends

### Requirement: Look: Map's adjacency error markers are always on

The red adjacency error markers, drawn where two adjacent colored regions
clash, SHALL always be drawn, independent of `findMistakes`.

#### Scenario: A clash is marked without a check

- **WHEN** two adjacent regions hold the same color and no mistake check has
  been asked for
- **THEN** a red marker is drawn on the border between them

### Requirement: Look: What Map draws

`redraw` SHALL render region fills, the diagonal second-region triangle of a
split cell, pencil-mark stipples, grid lines on region boundaries, the red
adjacency error diamonds, optional region numbers, the flagged-mistake region
outline, the selected region's band, the floating drag blob while a color or
its marks are carried, and the completion flash.

#### Scenario: A split cell shows both of its regions

- **WHEN** a cell divided diagonally between a colored region and another
  region is drawn
- **THEN** each triangle of the cell takes its own region's fill

### Requirement: Look: Map's board has no border of its own

The board SHALL be drawn with no border of its own. The canvas SHALL be the
board grown on every side by the room the pencil-mode indicator needs
(`pencilIndicatorCanvas`), and by nothing else.

#### Scenario: The canvas is the board and the indicator's room

- **WHEN** the canvas size is computed for a tile size
- **THEN** it is the grid's own extent with the pencil-mode indicator's room
  added on each side

### Requirement: Look: The selected region is drawn as a band

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

### Requirement: Look: A color carried by the keyboard sits in the triangle the cursor names

A color carried by the keyboard SHALL be drawn inside the triangle the cursor
names on a divided cell, at that triangle's centroid, a third of a tile from
the cell's center, so the carried color says which half of a divided cell its
drop will land in.

#### Scenario: The carried color sits on the cursor's side of a diagonal

- **WHEN** a color is picked up by a select key with the cursor on a divided
  cell
- **THEN** the color is drawn within the triangle the cursor names, and not on
  the diagonal

### Requirement: Look: Map draws an uncolored region on the collection's quiet surface

`redraw` SHALL fill a region that has no color with the collection's cell
surface, so the map reads as a field apart from the board round it and the
four fills are all the color on it. The four fills and the ink region borders
are the game and SHALL stay as they are. The drag blob that carries "no color"
SHALL take the same surface.

#### Scenario: An uncolored region is the cell surface

- **WHEN** a board with an uncolored region is drawn
- **THEN** that region is filled with the cell surface
- **AND** a colored region beside it keeps its fill, with the ink border
  between them

### Requirement: Look: The Map completion flash sweeps the regions

The completion flash SHALL sweep the map by region: the regions SHALL light in
the order of the points their numbers are drawn at along the diagonal, one
place apart however far apart the points are, and a region SHALL be lit
whole. The selected region's band SHALL be hidden while the flash plays.

#### Scenario: A region that spans the sweep

- **WHEN** a region reaches from one side of the map to the other and the
  highlight is on it
- **THEN** every cell of it is one flash color in that frame, a split cell's
  triangle included, and none of it is in a frame where the highlight is not
