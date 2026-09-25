# map Specification

## Purpose
Map, the puzzle of four-coloring a map so that no two regions sharing an edge
have the same color, given a few regions already colored. This capability
specifies its port to the TS engine: the graded solver and the generator gated
on it, completion and mistake reporting, and its input, preferences and
rendering.

## Requirements

### Requirement: Map game implements the Game interface

The engine SHALL provide a registered `map` game implementing
`Game<MapParams, MapState, MapMove, MapUi, MapDrawState, MapMistake>`: color
every region of a map so that no two adjacent regions share a color, given some
regions pre-colored as immutable clues. Params SHALL be `w`, `h`, `n` (number
of regions) and `diff` (one of Easy, Normal, Tricky, Unreasonable), encoded
`{w}x{h}n{n}` with a full-form `d{char}` difficulty suffix (chars `e`/`n`/`h`/`u`).
`decodeParams` SHALL be lenient: an omitted `xH` defaults height to width, an
omitted `nN` defaults `n` to `w*h/8`, a `.` in the region count is tolerated
(truncated), and an unknown difficulty char is ignored. Six presets (15×20 with
30 regions at each difficulty, and 25×30 with 75 regions at Normal and Tricky),
upstream's landscape sizes turned to draw taller than wide, SHALL be offered. `validateParams` SHALL enforce `w ≥ 2`,
`h ≥ 2`, `n ≥ 5`, `n ≤ w*h`, and the width×height overflow guard. The game SHALL
report `canSolve = true` and `canFormatAsText = true`, and SHALL drive a
completion flash suppressed after Solve.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 20, h: 15, n: 30, diff: Normal }` are encoded in full
- **THEN** the result is `20x15n30dn` and decoding it round-trips the params

#### Scenario: Lenient decode

- **WHEN** `decodeParams` is given `12` (no height, no region count, no
  difficulty)
- **THEN** it yields `w = 12`, `h = 12`, `n = 12*12/8`, and the default
  difficulty

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given fewer than five regions, or more regions
  than grid squares
- **THEN** it returns a non-null error string

### Requirement: Map descriptions use the upstream two-part encoding

The desc SHALL encode the region boundaries and the clue colors as two
comma-separated run-length parts: first the edge list — alternating runs of
edge/non-edge walked across all horizontal edges (row by row) then all vertical
edges (column by column), lowercase letters giving run lengths with the upstream
`z` "run of 25, no state switch" special case and a notional leading non-edge;
then the clue list — digits `0`–`3` for region clue colors interspersed with
lowercase letters giving run lengths of unclued regions (with `z` meaning a run
of 26). `validateDesc` SHALL rebuild the regions from the edge list via a
union-find over non-edges and reject an unknown character, an edge list that
defines the wrong number of regions, and a clue list whose region count does not
equal `n`. `newState` SHALL parse the desc into the immutable region structure
(the four-quadrant map, the adjacency graph, the clue coloring), run the
desc-seeded diagonal-smoothing pass, and compute the canonical edge/region label
points.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc whose clue list defines a region count
  other than `n`, or whose edge list defines the wrong number of regions
- **THEN** it returns a non-null error string

### Requirement: Map reports completion and mistakes

The board SHALL be completed when every region is colored and no two adjacent
regions share a color. Because boards are uniquely solvable, the game SHALL
implement `findMistakes`: re-solve from the immutable clues to the unique
solution and return every region whose player-assigned color differs from it (a
definite mistake), and every blank region whose dots leave out its color in that
solution, because a dot claims the region might be that color; a
non-uniquely-solvable board yields no mistakes, and a blank region with no dots
is never a mistake. Check & Save depends on this hook and SHALL
refuse to save while any mistake is present. The always-on red adjacency error
markers (drawn where two adjacent colored regions clash) SHALL remain,
independent of `findMistakes`.

#### Scenario: A region colored against the unique solution is flagged

- **WHEN** the player colors a region a color the unique solution does not give
  it, and `findMistakes` is invoked
- **THEN** that region is returned as a mistake

#### Scenario: A partially-colored but correct board has no mistakes

- **WHEN** the player has colored only regions in agreement with the unique
  solution
- **THEN** `findMistakes` returns an empty result

#### Scenario: Dots that leave out a region's color are flagged

- **WHEN** the player dots a blank region with colors that do not include the
  one the unique solution gives it, and `findMistakes` is invoked
- **THEN** that region is returned as a mistake, and a hint is refused until it
  is fixed

### Requirement: Map input, preferences and rendering

`interpretMove` SHALL support: a press that picks up the color of the region
under the pointer (or, on a blank region, its pencil marks) into a floating drag
blob; a release that drops the held color onto the region under the pointer; a
right-drag from a color to a blank region that toggles a single pencil-mark bit;
and a keyboard cursor that picks and drops via the select keys — with the
diagonally-split-cell quadrant hit-test of `region_from_coords`. A
drop that changes nothing SHALL produce no move. Penciling a colored region
SHALL be rejected. The three upstream preferences (victory-flash effect,
number-regions, stipple display style) SHALL be exposed through the `prefs` hook
with the upstream keyword slugs, stored on the `Ui` with `newUi` defaults, and
the `l`/`L` key SHALL toggle region numbers in play. `redraw` SHALL render region
fills, the diagonal second-region triangle of a split cell, pencil-mark stipples,
grid lines on region boundaries, the red adjacency error diamonds, optional
region numbers, the flagged-mistake region outline, the selected region's band,
the floating drag blob (a blitter sprite) while a color or its marks are
carried, and the selected completion-flash style — with a `BORDER` of 0
(NARROW_BORDERS).

#### Scenario: A drag colors a region

- **WHEN** the player presses on a colored region and releases on an adjacent
  blank region
- **THEN** `interpretMove` yields a move whose execution sets the blank region to
  the held color

#### Scenario: A no-op drop yields no move

- **WHEN** the player drops a color onto a region that already holds it (or onto
  the border, or onto an immutable clue region)
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

### Requirement: Map ports the graded solver and solver-gated generator

The port SHALL implement `map_solver` with its full graded deductive power over
the region-adjacency graph: at Easy, place a region that has exactly one possible
color left; at Normal, additionally exclude a shared color pair from the common
neighbors of an adjacent same-two-possibilities pair; at Tricky, additionally run
the forcing-chain BFS; at Unreasonable, additionally recurse (guess and verify).
The solver SHALL return the three-valued verdict (impossible / unique / stuck-or-
ambiguous), and a grading routine SHALL return the easiest difficulty that yields
a unique solution. The generator (`new_game_desc`) SHALL grow voronoi regions over
the cumulative-frequency table, four-color them recursively, reduce clues under the
solver's gate without ever removing the last region of a color, and retry below a
difficulty floor.
`solve` SHALL return the generator's aux when present, else re-solve from the
clues at maximum difficulty.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated for a given difficulty and graded by the TS
  solver
- **THEN** the grading is a unique solution at exactly the requested difficulty
  (or the generator's documented fallback for pathologically dense/sparse maps)

### Requirement: Map offers one key per color, and a tap selects a region

Map SHALL offer an on-screen key for each of its four colors and a Clear key.
Pressing a color key SHALL color the region at the keyboard cursor, or toggle
that color as a pencil mark while notes mode is on; Clear SHALL empty the
region. A key SHALL act only while the cursor is shown, and SHALL be declined
otherwise, as the digit games do — entry at a cursor nobody can see puts a color
where the player is not looking, and a decline is also what lets the app's
bare-letter shortcuts through.

A pointer gesture that commits no move SHALL **select** the region it ended on.
Map's keys act at the keyboard cursor and a player without a keyboard has no
other way to move one, so without this the whole panel is unreachable rather
than merely awkward. Selection is additive: a tap is a press and a release on
one region, so it picks that region's own color up and puts it straight back,
which is already no move at all. A drag that ends where it cannot commit — on a
clue, or back where it started — selects by the same rule rather than by a
second one. What that selection does to the highlight and to notes mode SHALL
be the note-taking cell's rule, with the button the gesture used: a region may
take a color when it is not a clue, and a mark when it is blank.

Selection SHALL name the region the pointer was on, not merely its cell. The
cursor is a cell **plus the direction it last moved**, which is how a
diagonally-split cell names one of the regions it holds, and the translation
from a pixel SHALL derive that direction from the same quadrant test the
pixel→region hit-test uses rather than restating it.

The selection SHALL be drawn as the note-taking cell's picture in a region's
shape: a band just inside the whole of the selected region's boundary, in the
palette's cursor color, in both modes, and in notes mode the corner triangle in
the region's first cell in reading order as well. The region's own fill SHALL
NOT change, because in this game the fill is the answer. A color carried by the
keyboard SHALL be drawn **inside the triangle the cursor names** on a divided
cell — at that triangle's centroid, a third of a tile from the cell's center —
keeping upstream's one-pixel nudge on a whole cell, so the carried color says
which half of a divided cell its drop will land in.

Dragging a color from one region to another SHALL continue to work unchanged,
and so SHALL the keyboard's pick-and-drop by select. The panel is a second way
in, not a replacement.

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

#### Scenario: A tap on a split cell selects the region under the finger

- **WHEN** a diagonally-split cell is tapped on one side of its diagonal
- **THEN** the cursor names the region that side belongs to, not the other one
- **AND** the band is drawn inside that region and nowhere outside it

#### Scenario: The selected region is outlined, not recolored

- **WHEN** a region is selected
- **THEN** every cell on that region's boundary carries the band, the band
  covers well under half of the region, and in notes mode the corner triangle
  appears in the region's first cell

### Requirement: Map explains the next deduction

`hint(state)` SHALL refuse through `commonHintRefusal` when the board is solved
or `findMistakes` reports a mistake, SHALL refuse with `DEDUCTION_EXHAUSTED` when
nothing follows, which only an Unreasonable board allows, and otherwise SHALL
return the forced steps from the player's own board as an ordered plan.

A blank region's colors SHALL be read as its dots, or all four colors when it
has none, less every color a neighbor shows. That is sound because
`findMistakes` flags any dots leaving out a region's answer. The plan SHALL
place dots only where a deduction rules out a color no neighbor shows, or where
a pair's or chain's premise needs them, so an Easy board's plan places none.

The deductions SHALL be the solver's three rungs, reported by the same functions
the solver runs: a region with one color left must take it; two touching regions
down to the same two colors use both, so a region touching both can be neither;
and a forcing chain, in which region 1 has two colors, each numbered region
forces the next if region 1 is not the struck color, and the last is driven to
it, so a region touching the first and the last cannot be that color. The plan
SHALL offer the lowest rung that fires anywhere on the board and choose within
it by continuing from its latest steps, so an Easy board's plan never shows a
pair and a Normal board's never shows a chain. A narrowing step SHALL color its
region when one color is left, remove the struck dots when the region has dots,
and otherwise dot the colors left, and its sentence SHALL say which. One firing
that narrows several regions SHALL be one journey, a leg per region.

A pair or chain firing SHALL open its journey with a leg for each region its
premise rests on that does not already show exactly its two colors as dots,
dotting them (or removing the dots a neighbor's color rules out), so that when
the pair or chain step is spoken every one of those regions shows its two
colors and the deduction can be followed on the board rather than worked out.

The chain step SHALL name what the dots show rather than a rule the player must
run. When every numbered region has a dot of the struck color, it SHALL say so
and that the color falls on every other region from region 2 when region 1 does
not take it. Otherwise it SHALL walk the chain by color, naming region 1's other
color and the color each later region then takes, for a chain of up to five
regions, and past that SHALL name the rule and where the chain ends. Either way
it SHALL conclude that region 1 or the last region takes the struck color, and
that this region touches both. The plan SHALL fail rather than speak a walk that
does not end on the struck color.

A step SHALL ring the region it acts on with a solid band inside the region's
boundary, in the hint's action color, and that band SHALL be the only hint mark
on any region boundary. A region with one color left SHALL outline nothing else,
because its neighbors' fills are its premise. The regions a pair or a chain
rests on SHALL be outlined by a thin dashed line in the hint's evidence color,
set in from their boundary, so that where they meet the target the two marks
stay apart. A chain's regions SHALL be numbered at their label points, with the
region numbers hidden while it shows. The selection band SHALL stay visible just
inside a hint band on the same region.

The generator SHALL NOT call the hint, and splitting the rungs into functions
SHALL change no solver verdict.

#### Scenario: A region whose neighbors show three colors takes the fourth

- **WHEN** a blank region with no dots touches regions of three different colors
  and a hint is requested
- **THEN** the step colors it the fourth, rings it, outlines nothing else, and
  names the three colors and the fourth

#### Scenario: A pair's undotted region is dotted before the pair is stated

- **WHEN** the next deduction is a pair one of whose regions shows no dots
- **THEN** the journey's first step rings that region, outlines the other,
  dots the two colors its neighbors leave it, and the pair step follows with
  both regions showing their two dots

#### Scenario: A chain's conclusion is dotted onto an unmarked region

- **WHEN** the next deduction is a forcing chain striking a color from a region
  with no dots
- **THEN** the journey first dots each numbered region without them with its two
  colors, then its last step dots that region with the colors it has left,
  numbers the chain's regions 1 to N on the board, and says region 1's two
  colors, the color region N is driven to, and that this region touches both
  ends

#### Scenario: A chain whose regions all carry the struck color is told as a pattern

- **WHEN** every numbered region of a chain has a dot of the struck color when
  the chain step is spoken
- **THEN** the sentence says so, and that the color falls on every other region
  if region 1 does not take it, instead of naming each region's color

#### Scenario: The hint's dots are the next step's premise

- **WHEN** the player follows a step that dots a region and asks for the next
  hint
- **THEN** a later deduction may read that region's colors from those dots, as
  the player can

### Requirement: Map offers Mark-all and the player's reading of an undotted region

Map SHALL declare `canMarkAll` and answer the `M` key with an adaptive Mark-all: while
some blank region has no dots, the press SHALL dot all four colors into every such
region and change no other; once none is left, it SHALL remove from each blank region
the dots of the colors its neighbors show, keeping a region's last dot rather than
emptying it; and a press with nothing to do SHALL be no move.

Map SHALL offer the shared `hint-notes` preference through a `candidateReading` field
in its `Ui`, defaulting to `implicit` with the reason stated in `newUi`. Under
`implicit` the hint SHALL plan as the requirement "Map explains the next deduction"
states. Under `populate` the plan SHALL open with the Mark-all press's moves, the fill
and then the clean, each only when the board needs it, as one journey, and SHALL then
plan from the dotted board by the same rungs. A player move equal to a setup step's
move, such as the Mark-all press itself, SHALL complete that step.

#### Scenario: Two presses dot each region with what its neighbors leave

- **WHEN** the player presses Mark-all twice on a fresh board
- **THEN** every blank region shows as dots exactly the colors no neighbor shows, and
  a third press is no move

#### Scenario: The press never refills a region the player narrowed

- **WHEN** some blank regions carry the player's dots and others carry none, and the
  player presses Mark-all
- **THEN** only the regions with no dots gain dots, and every other region's dots are
  unchanged

#### Scenario: The populate reading opens with the press

- **WHEN** the player has chosen "Every candidate first" and asks for a hint on a
  fresh board
- **THEN** the first step dots all four colors into each blank region, the second
  continues it by removing the colors neighbors show, and pressing Mark-all while the
  first is shown completes it

#### Scenario: The implicit reading never fills

- **WHEN** a hint is requested under the default reading
- **THEN** no step adds dots to more than one region
