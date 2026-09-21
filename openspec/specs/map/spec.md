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
(truncated), and an unknown difficulty char is ignored. All 6 upstream landscape
presets (20×15 with 30 regions at each difficulty, and 30×25 with 75 regions at
Normal and Tricky) SHALL be offered. `validateParams` SHALL enforce `w ≥ 2`,
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
definite mistake); a non-uniquely-solvable board yields no mistakes, and an
uncolored region is never a mistake. Check & Save depends on this hook and SHALL
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
region numbers, the flagged-mistake region outline, the floating drag/cursor
blob (a blitter sprite), and the selected completion-flash style — with a `BORDER` of 0
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
second one.

Selection SHALL name the region the pointer was on, not merely its cell. The
cursor is a cell **plus the direction it last moved**, which is how a
diagonally-split cell names one of the regions it holds, and the translation
from a pixel SHALL derive that direction from the same quadrant test the
pixel→region hit-test uses rather than restating it.

The cursor SHALL be **drawn inside the triangle it names** on a divided cell —
at that triangle's centroid, a third of a tile from the cell's center — keeping
upstream's one-pixel nudge on a whole cell, where all four quadrants are one
region and the offset would only announce which way the player last moved. A
selection every key press acts on has to say which half of a divided cell it
means, and a ring parked on the diagonal does not.

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
- **AND** the cursor ring is drawn on that side of the diagonal rather than on it
