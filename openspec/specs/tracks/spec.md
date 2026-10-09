# tracks Specification

## Purpose
Tracks, the puzzle of laying a single railway from A to B so that each row and
column holds its clued number of track segments, with live errors, mistake
checking, and a hint that explains the next deduction and marks it in the
game's own vocabulary.

## Requirements

### Requirement: Tracks game implements the Game interface

The engine SHALL provide a registered `tracks` game implementing `Game`: the
player lays a single continuous train track from an entrance on the left edge
to an exit on the bottom edge of a `w × h` grid, using only straight and curved
rails that neither cross nor form a loop, so that every row and column clue
counts the track-bearing cells in that row or column. The game SHALL provide
`solve` and `textFormat`.

#### Scenario: The game is registered

- **WHEN** the registry is asked for the game with the id `tracks`
- **THEN** it returns a game that provides `solve` and `textFormat`

### Requirement: Tracks' parameters

Params SHALL be `w`, `h`, `diff` (Easy, Normal or Tricky, the constants
`DIFF_EASY`, `DIFF_TRICKY` and `DIFF_HARD`) and `singleOnes` (disallow
consecutive 1 clues). They SHALL be encoded `{w}x{h}`, followed in the full
form by `d` and one of `e`, `t` or `h` for the difficulty, and by an `o` when
`singleOnes` is false. A bare `{n}` SHALL decode as an `n × n` grid.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 8, diff: DIFF_TRICKY, singleOnes: false }` (the
  Normal tier) are encoded in full
- **THEN** the result is `10x8dto` and decoding it round-trips the params

### Requirement: Tracks refuses a grid under 4×4, and a 4×4 above Easy

The params config SHALL bound the width and the height at a minimum of 4, so
that the engine refuses a smaller grid. `validateParams` SHALL refuse a 4×4
grid above Easy when the params are to deal a board (its `full` argument), in
the words of `noSuchTier`, because no 4×4 board needs a higher tier.

#### Scenario: Invalid params are rejected

- **WHEN** params for a grid smaller than 4×4 are checked
- **THEN** they are refused with a non-null error string

#### Scenario: A 4×4 above Easy is refused

- **WHEN** the params `4x4dt` or `4x4dh` are checked for a deal
- **THEN** they are refused, and no board is dealt

### Requirement: Tracks' presets are drawn taller than wide

The presets SHALL be 8×8, 8×10, 10×10, 10×15 and 15×15 at Easy and at Normal,
and 10×10 and 15×15 at Tricky as well, each with `singleOnes` on. A preset
that is not square SHALL be the size that draws taller than wide.

#### Scenario: No preset is wider than tall

- **WHEN** the preset menu is read
- **THEN** it offers 8×10 and 10×15, and no preset whose width exceeds its
  height

### Requirement: Tracks descriptions use the upstream encoding

The desc SHALL encode the `w × h` square grid row-major: one lowercase
character `a`–`z` for a run of 1–26 consecutive non-clue squares, and one
hexadecimal character (`0`–`9`, `A`–`F`) per clue square giving that clue's
two track-edge direction flags. A `,`-separated list of `w + h` clue numbers
SHALL follow, column clues first and then row clues, with an `S` prefix
marking the exit column and the entrance row.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: newState parses a Tracks description and refuses a malformed one

`newState` SHALL parse the desc into per-cell track edges and the shared,
immutable clue-number and station data, with the player grid initially blank.
It SHALL refuse, as a desc error the engine's `validateDesc` reports, a desc
with an unknown character, clue flags whose bit-count is not exactly two, a
number list that is too short, or anything but exactly one entrance and one
exit.

#### Scenario: A malformed description is rejected

- **WHEN** a desc with a clue flag of the wrong bit-count, or without exactly
  one entrance and one exit, is validated
- **THEN** the result is a non-null error

### Requirement: Tracks input maps drag, click and cursor

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

### Requirement: A drag from a square that carries track lays segments

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

### Requirement: A Tracks click toggles a square or an edge

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

### Requirement: The Tracks keyboard cursor walks a half-grid

`interpretMove` SHALL support a half-grid keyboard cursor whose select toggles
a square (at a cell center) or an edge (on a cell border), with select2
toggling no-track.

#### Scenario: Select on a cell border toggles the edge

- **WHEN** the cursor stands on the border between two undecided squares and
  select is pressed
- **THEN** that edge carries a track segment and neither square's mark changes

### Requirement: A Tracks interaction that changes nothing makes no move

Moves that would change nothing, and interactions outside the grid, SHALL
produce no history move.

#### Scenario: A no-op interaction produces no move

- **WHEN** a right-drag (no-track) covers only cells that already hold track,
  so no flag can change
- **THEN** `interpretMove` returns no history move

### Requirement: Tracks ships findMistakes

`findMistakes(state)` SHALL re-solve the board's clues to the unique solution
and, when one exists, report every square holding a player's mark, on itself
or on one of its edges, that contradicts that solution: a track where the
solution has none, or a no-track where the solution lays track. Unmarked cells
SHALL never be mistakes. It SHALL return an empty list when the board is not
uniquely solvable.

#### Scenario: A wrong mark blocks Check & Save

- **WHEN** a cell is marked as track where the unique solution has none and
  `findMistakes` runs
- **THEN** that cell is reported and rendered red

### Requirement: A Tracks mistake is drawn in the mistake styling

Mistakes SHALL render with the collection's red mistake styling, carried in
the render diff key so a mistake highlights even on a tile that did not
otherwise change.

#### Scenario: A mistake overlay repaints an unchanged tile

- **WHEN** a tile is painted, `findMistakes` flags it, and `redraw` runs again
  with no other change to that tile
- **THEN** the second paint renders the red mistake styling

### Requirement: Tracks explains the next deduction

A hint SHALL be refused when the board is solved or `findMistakes` reports any
mark, by the midend before it asks the game. `hint(state)` SHALL otherwise
return the forced deductions from the player's current marks as an ordered
plan, each step narrating why its moves are forced from premises the sentence
itself states.

#### Scenario: A hint runs from the player's own marks

- **WHEN** the player has made correct marks of their own and asks for a hint
- **THEN** the plan is deduced from those marks and its first step is a
  deduction that follows from them

#### Scenario: A hint refuses rather than reasoning from a wrong board

- **WHEN** a mark contradicts the unique solution and a hint is requested
- **THEN** the hint refuses with the collection's shared mistakes wording and
  produces no plan

#### Scenario: Following the plan solves the board at every tier

- **WHEN** a hint is requested, its first step applied, and the hint requested
  again, repeatedly, on a board of any tier
- **THEN** deduction never runs out before the board is solved

### Requirement: The Tracks hint runs the solver's own rungs

The plan SHALL be produced by the same `DeductionTechnique` objects
`tracksSolve` runs, taken one firing at a time through the engine's
`singleFirings`, with a recorder attached to the working `Board`. No rung
SHALL be reimplemented for the hint, and the generator's solve path SHALL
remain unchanged.

#### Scenario: The generator solves without a recorder

- **WHEN** the solver runs for the generator or for `findMistakes`
- **THEN** its board carries no recorder

### Requirement: The Tracks hint is capped at the board's own tier

The hint's ladder SHALL be capped at the board's own difficulty and not at the
highest tier, since the board's own is the tier the generator certified it
soluble at.

#### Scenario: An Easy board is not handed a harder argument

- **WHEN** a hint is requested on a board dealt at Easy
- **THEN** no step of its plan comes from a rung above Easy

### Requirement: One Tracks firing is one hint step

One firing SHALL be one step: with a recorder attached, a rung SHALL return at
its first premise that changed the board, so that a rung that scans the whole
grid cannot pile several independent deductions into one step. Where one
premise forces several ops, the step's move SHALL carry them all, and
`hintKeepTrack` SHALL then verdict `"onTrack"` and shrink the step in place
until the last of them is placed.

#### Scenario: A hint explains a clue that is already met

- **WHEN** a line holds as many track squares as its clue allows and a hint is
  requested
- **THEN** the step's narration names that count, its move marks every other
  square in the line empty, and its evidence is exactly the clue's own track
  squares with the clue's digit recolored

### Requirement: A firing the board already shows is hidden

Every change a rung makes SHALL be recorded. Through the shared plan loop's
`showable` hook, the plan SHALL hide (apply to its working board, but not
show) a firing that declares no reason or whose every change the player's
board already decides. A change is already decided when the game would refuse
the player its contrary: track on a side of a square marked empty or of the
rim, track as a third side of a finished piece, or "no track" on a square
showing a rail.

#### Scenario: A narrated rule the board already shows is not a step

- **WHEN** a rule with a reason fires and every side it blocks borders a
  square the player has marked empty
- **THEN** the plan applies the firing to its working board and shows no step
  for it

### Requirement: Three rules of update-flags declare no reason

Three rules of the `update-flags` rung SHALL declare no reason, because the
player's board already decides what each concludes: a square with a track side
is a track square, a blocked square's four sides are blocked, and a finished
piece's other two sides are blocked. Every reason-less firing SHALL be evident
by the already-decided test.

#### Scenario: A finished piece's sides are never a step

- **WHEN** a finished piece's two free sides border squares the player has
  marked empty and a hint is requested
- **THEN** no step in the plan asks for either side to be blocked

### Requirement: Tracks marks a hint in its own vocabulary

`redraw` SHALL draw the displayed step's marks from the marks the step's words
carry, using the shape of the action and not color alone to say which action
is meant: a square the step decides is ringed in `COL_HINT`, and additionally
carries the game's own center cross in that color when the move marks it
empty; a side that must carry track is drawn as the game's own rail stubs; a
side that must be blocked is drawn as the game's own edge cross. Nothing SHALL
be a fill.

#### Scenario: A forced side is drawn as the action it asks for

- **WHEN** a step forces one side to carry track and another to be blocked
- **THEN** the first is drawn as rail stubs and the second as a cross, both in
  the action color, and neither renders the finished piece

### Requirement: Tracks hint evidence is drawn in the evidence color

Evidence SHALL be drawn in `COL_HINT_CELL`: a contour round the squares the
deduction reasons from, painted per side wherever the neighbor across it is
not also evidence, and a bar on a cited side. A clue the step counts with
SHALL have its digit recolored in the margin, because a clue is part of the
deduction and is not on the grid.

#### Scenario: A clue the step counts with is recolored

- **WHEN** the step for a clue that is already met is displayed
- **THEN** the clue's track squares carry the evidence contour and the clue's
  digit is recolored in the margin

### Requirement: A Tracks hint is part of the tile's cache key and the clue row's

The per-square hint marks SHALL be carried in an `Int32Array` compared in the
tile cache's diff key, so that a hint requested a frame after the move that
drew the board still repaints. The hint SHALL be part of the clue row's cache
key as well as the per-tile one, which the recolored digit requires.

#### Scenario: A displayed hint repaints an otherwise unchanged frame

- **WHEN** the board is painted, a hint is displayed, and `redraw` runs again
  with nothing else changed
- **THEN** the frame carries the step's marks

### Requirement: Tracks solves with a graded deductive solver

The solver SHALL run its deductions in rung order at each difficulty, a higher
difficulty adding its rungs to those below it. The solver SHALL return
impossible, unique and non-converged verdicts, and SHALL be reused by
`solve()` and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Tricky is solved
- **THEN** the Tricky solver reaches the unique solution
- **AND** the Normal solver fails to converge on it

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong track marks
- **THEN** the returned move yields the unique solution

### Requirement: Each Tracks difficulty adds its rungs

Easy SHALL run edge and square flag propagation (`update-flags`), row and
column track counts (`count-clues`) and immediate loop avoidance
over a `Dsf` (`check-loop`). Normal SHALL add single-track reasoning
(`check-single`), loose-end reasoning (`check-loose-ends`) and the one-way
neighbor deduction (`check-neighbors`). Tricky SHALL add the two-way neighbor
deduction (`check-neighbors-both-ways`) and the bridge-parity argument
(`check-bridge-parity`) over the shared `findLoops` bridge finder.

#### Scenario: A capped solve leaves the higher rungs out

- **WHEN** the solver runs capped at Normal
- **THEN** neither the two-way neighbor deduction nor the bridge-parity
  argument runs

### Requirement: Tracks generates solver-gated boards reproducibly

`newDesc` SHALL generate the same board for the same seed. It SHALL lay a path
as a random walk from a random left-edge entrance to a bottom exit and derive
the clue numbers from it. It SHALL reject a boring board (one with a clue of
0) and, under `singleOnes`, a board with a 1 as the clue of the entrance's
column or of the exit's row, or with two 1 clues next to each other in the
list of column clues then row clues.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Tracks description

### Requirement: Tracks lays clues until the board solves at exactly its tier

`newDesc` SHALL lay clues until the board is soluble at exactly the target
difficulty, then strip redundant clues, re-running the solver on each
candidate.

#### Scenario: A dealt board is graded at its preset's tier

- **WHEN** a board is generated at a preset's tier
- **THEN** it solves at that tier and, above Easy, not at the tier below

### Requirement: Tracks rejects a bare board as too easy only when it solves

The generator SHALL reject a laid path as too easy only when its bare board
(the row and column counts, the entrance and the exit) solves completely
without reaching the target tier. A bare board that stalls SHALL go on to
clue-laying whatever rungs fired before it stalled, since the clue-laying loop
already refuses any clue that finishes the board below the target tier.

#### Scenario: A stalled bare board is not too easy

- **WHEN** the bare board of a laid path stalls at the target tier without any
  of that tier's rungs having fired
- **THEN** the generator lays clues on it and does not ask for a new path

#### Scenario: 15x15 deals at the top tier

- **WHEN** `newDesc` runs at 15x15 Tricky (`DIFF_HARD`) from any of the seeds
  `pin-0`, `pin-66`, `pin-71`, `pin-79`, `pin-83`, `pin-94` and `pin-96`
- **THEN** it returns a board that solves at Tricky and not at Normal, and
  does not throw `RetryLimitExceeded`

#### Scenario: Easy boards are unchanged

- **WHEN** `newDesc` runs at an Easy preset from a seed recorded against
  upstream's generator
- **THEN** it emits upstream's desc byte-for-byte

### Requirement: Tracks renders rails, clues, drag previews and the completion flash

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

### Requirement: The Tracks drawstate diffs committed and drag flags

The drawstate SHALL diff per-cell `Int32Array`s of committed and drag flags
plus a clue-error sidecar, with the findMistakes overlay carried in the diff
key.

#### Scenario: A drag repaints only the squares its preview changes

- **WHEN** a left-drag in progress extends over one more blank square and
  `redraw` runs
- **THEN** that square is repainted and a square whose flags did not change is
  not

### Requirement: The Tracks completion flash runs the track from A to B

The completion flash SHALL be a highlight a few squares long that runs the
finished track from the entrance to the exit: at any moment only those few
squares' rails are drawn in the flash color, every square of the track is lit
once and in order, and the last goes dark before the flash ends. The game
SHALL declare it through `solvedFlash`, so that it is suppressed after Solve.

#### Scenario: The flash runs from A to B

- **WHEN** a board is won and frames of its flash are drawn from start to end
- **THEN** no frame lights more than a few squares, the first lit square is
  the entrance's, and every square of the track is lit for one stretch of
  frames

### Requirement: The Tracks completion flash keeps one pace

The completion flash SHALL run at one pace on every board, so a longer track
takes longer, and never under a second. Its color SHALL read against the rails
and the track bed in both color schemes.

#### Scenario: A longer track flashes for longer

- **WHEN** two boards are won, one with a longer track than the other
- **THEN** the longer track's flash runs at least as long as the shorter's,
  and neither runs under a second

### Requirement: Tracks computes live errors on every move

`executeMove` SHALL recompute error state: a cell with more than two track
edges is an error; every cell on a track loop (via the shared `findLoops` over
the track graph) is an error; and once a continuous entrance→exit path exists,
any track cell not on that path is an error.

#### Scenario: A loop is flagged

- **WHEN** track edges are placed forming a closed loop
- **THEN** every cell on the loop carries the error flag

### Requirement: A Tracks clue is in error when its line cannot meet it

`executeMove` SHALL mark a row or column as a clue error when its track cells
exceed its clue, when its no-track cells exceed the complement, or when its
completed track count fails to match the clue once a continuous entrance→exit
path exists and no cell is in error.

#### Scenario: An over-filled clue is flagged

- **WHEN** a row has more track cells than its clue number
- **THEN** that row's clue is marked in error

### Requirement: Tracks judges completion from the board

The board SHALL be reported solved exactly while no errors exist and every
clue's completed track count matches, judged from the board however it was
reached.

#### Scenario: Completion follows the board

- **WHEN** a continuous entrance→exit track is laid meeting every clue with no
  loop
- **THEN** `status` reports the board solved
- **AND** a later move that breaks the track or a clue reports it unsolved again

### Requirement: An undecided Tracks square is the cell surface

`redraw` SHALL draw a square the player has not decided on the collection's
cell surface, with the surface's grid line between squares one pixel wide at
every tile size and the frame round the grid no heavier.

#### Scenario: The grid line does not grow with the tile

- **WHEN** a board is drawn at a small tile size and at a large one
- **THEN** the grid line between two undecided squares is one pixel wide in
  both

### Requirement: A given Tracks rail is told by the cell under it

A square the puzzle laid track in SHALL sit on the lifted surface of a given,
and its rails SHALL be the same ink rails the player's are: a given is told by
the cell under it and not by the color of its rail.

#### Scenario: A given rail is the same rail

- **WHEN** a board holds a rail the puzzle laid and a rail the player laid
- **THEN** both rails are drawn in the same ink
- **AND** the puzzle's square is the lifted surface and the player's is the
  track bed

### Requirement: A square that carries track is the track bed

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

### Requirement: Tracks tells a square's state by its surface and a cross

A square marked as holding no track SHALL stay the cell surface and hold the
collection's ruled-out cross, in the ruled-out color. An edge marked as
carrying no track SHALL hold a smaller cross on the edge.

#### Scenario: Undecided, no track and track are told apart

- **WHEN** a board holds an undecided square, a square marked no-track and a
  square marked as track with no rail yet
- **THEN** the first two are the cell surface and the third is the track bed
- **AND** the first holds nothing, the second holds the ruled-out cross and
  the third holds nothing

### Requirement: The Tracks keyboard cursor's outline is at least two pixels thick

The keyboard cursor's outline SHALL be at least two pixels thick.

#### Scenario: The outline at a small tile

- **WHEN** the cursor is shown at a tile size whose marks are one pixel thick
- **THEN** the cursor's outline is two pixels thick
