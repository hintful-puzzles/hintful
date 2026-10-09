# slant Specification

## Purpose
Slant (Gokigen Naname), the puzzle of drawing a diagonal in every square so that
no loop forms and each numbered point meets that many lines. This capability
specifies the game: its live errors, its two preferences, its same-slant marks,
its mistake-checking, and an explained deductive hint drawn in the element-type
legend.

## Requirements

### Requirement: Slant game implements the Game interface

The engine SHALL provide a registered `slant` game implementing `Game`: fill
every square of a `w × h` grid with a `/` or `\` diagonal so that every
numbered vertex clue (0–4, on the `(w+1) × (h+1)` point grid) is met by
exactly that many incident diagonals and the diagonals form no closed loop.
The game SHALL provide `solve` and `textFormat`, and SHALL declare its
completion flash through `solvedFlash`, which is not played after Solve.

#### Scenario: The game is registered

- **WHEN** the registry is asked for the game with id `slant`
- **THEN** it returns a game whose `solve`, `textFormat` and `solvedFlash` are
  defined

### Requirement: Slant's parameters are a size and a difficulty

Params SHALL be `w`, `h` and `diff` (Easy or Normal), encoded `{w}x{h}d{e|h}`,
with the short form `{w}x{h}` and the square shorthand `{n}`. The presets SHALL
be 5×5, 8×8 and 10×12, each at Easy and at Normal.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 12, h: 10, diff: DIFF_HARD }` (the Normal tier) are
  encoded in full
- **THEN** the result is `12x10dh` and decoding it round-trips the params

### Requirement: Slant refuses a grid narrower or shorter than two squares

The bounds the params declare SHALL refuse a `w` or an `h` below 2.

#### Scenario: Invalid params are rejected

- **WHEN** params for a 1-wide or a 1-high grid are validated
- **THEN** the result is a non-null error string

### Requirement: Slant descriptions are run-length clue grids

The desc SHALL encode the `(w+1) × (h+1)` vertex-clue grid row-major, one
digit `0`–`4` per clue, with maximal runs of clueless vertices compressed as
`a`–`z` (a run of 1–26, a longer run emitting `z` chunks). Validating a desc
SHALL reject an unknown character, a desc too short to fill the grid and a
desc that overruns it.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc with an invalid character, or with a clue count not matching
  `(w+1) × (h+1)`, is validated
- **THEN** the result is a non-null error

### Requirement: A new Slant board holds its clues and blank squares

`newState` SHALL parse the desc into a clue grid that every state of the game
shares by reference and no move writes, with every square initially blank.

#### Scenario: A move leaves the clues shared

- **WHEN** a move is made on a new board
- **THEN** the state it returns holds the same clue grid, by reference, as the
  state before it

### Requirement: A click cycles a square through its three states

`interpretMove` SHALL cycle a square blank→`\`→`/`→blank on a left-click and
blank→`/`→`\`→blank on a right-click, the two swapped when the `left-button`
preference selects `/`-first. A click outside the grid SHALL be ignored.

#### Scenario: Left-click cycles a square

- **WHEN** a blank square is left-clicked three times (default button
  order)
- **THEN** the square becomes `\`, then `/`, then blank

#### Scenario: Swapped button order

- **WHEN** the `left-button` preference is set to `/`-first and a blank
  square is left-clicked
- **THEN** the square becomes `/`

### Requirement: The keyboard cursor cycles and sets squares

Arrow keys SHALL move a cursor, revealing it in the same press. Select and
select2 SHALL cycle the cursor square, one in each direction. The literal keys
`\` and `/` SHALL set the cursor square directly and Backspace SHALL clear it,
each returning no move when the square already holds that value.

#### Scenario: A key that changes nothing makes no move

- **WHEN** the cursor is on a square holding `\` and the `\` key is pressed
- **THEN** no move is returned

### Requirement: Slant ships findMistakes

`findMistakes(state)` SHALL re-solve the board's clues with the Normal solver
and, when a unique solution exists, return one mistake per square whose placed
diagonal differs from that solution. A blank square SHALL never be a mistake.
It SHALL return an empty list when the board is not uniquely solvable. A
mistaken square SHALL be marked in the error color.

#### Scenario: A wrong diagonal blocks Check & Save

- **WHEN** a square holds the diagonal opposite to the unique solution and
  `findMistakes` runs
- **THEN** exactly that square is reported and rendered red

#### Scenario: Blank squares are not mistakes

- **WHEN** the board is partially filled with only correct diagonals
- **THEN** `findMistakes` returns an empty list

### Requirement: A same-slant mark the solution contradicts is a mistake

When the board has a unique solution, `findMistakes` SHALL also return one
mistake, carrying the side it sits on, per same-slant mark joining two squares
whose solution slants differ. Such a mark SHALL be drawn in the mistake color.

#### Scenario: A wrong mark is a mistake

- **WHEN** a same-slant mark joins two squares the solution slants differently
- **THEN** `findMistakes` reports that mark and the hint refuses

### Requirement: Slant exposes its two upstream preferences

The game SHALL expose via the `Game.prefs` hook: `left-button` (choices
"Left \, right /", the default, and "Left /, right \") mapping to the
click-cycle swap, and `fade-grounded` (boolean, default off) fading the
diagonals in the border-connected component to a dimmed color so that the
diagonals that could still close a loop stand out.

#### Scenario: Fade-grounded dims border-connected diagonals

- **WHEN** `fade-grounded` is enabled and a diagonal is connected to the
  border
- **THEN** it renders in the grounded color instead of its slash color

### Requirement: Slant ships an explained deductive hint

The game SHALL implement `hint()` returning a plan of narrated steps computed
by the game's own solver techniques from the player's current position: the
solver seeded with the placed diagonals and the player's same-slant marks.

#### Scenario: The plan completes deductive boards

- **WHEN** the plan is computed on any generated Easy or Normal board
- **THEN** following it step-by-step solves the board with no un-narrated step

### Requirement: A Slant hint is refused on a solved or mistaken board

A hint SHALL be refused on a solved board, and on a board with detectable
mistakes, where the refusal SHALL come with the `findMistakes` overlay and the
banner.

#### Scenario: Refusal on a wrong board

- **WHEN** `hint()` is invoked on a board where `findMistakes` is non-empty
- **THEN** it refuses with an error and the mistake overlay is displayed

### Requirement: The hint's recorder leaves the generator's solve unchanged

The plan's recording and seeding SHALL be options of the solver that are off
unless asked for. The generator SHALL solve with them off, so that the hint
changes no verdict the generator reads.

#### Scenario: The generator solves with no recorder

- **WHEN** `newDesc` asks the solver whether a board is still solvable
- **THEN** it passes no recorder and no seed

### Requirement: Each hint step names its technique and says why the move is forced

Each step SHALL name its technique, lead with the recognizable indication,
state why the move is forced and conclude in the necessity voice. No displayed
step SHALL be a generic, un-narrated fallback.

#### Scenario: Loop and dead-end firings name the connectivity reason

- **WHEN** the plan reaches a square forced by simple loop avoidance or by
  dead-end avoidance
- **THEN** the step's narration explains that the ruled-out slant would close a
  loop (or seal points off from the grid's edge), and its evidence shades the
  connected chain / trapped components involved

### Requirement: One deduction firing is one journey

One firing of a deduction SHALL be one journey. A clue firing that forces
several squares SHALL be one multi-leg journey, its later legs flagged
`continuesPrevious`, and SHALL NOT be several independent hints.

#### Scenario: A clue-counting firing is explained and grouped

- **WHEN** the plan reaches a clue whose remaining lines equal its remaining
  empty neighbors (or is already satisfied)
- **THEN** one journey fills all forced neighbors, its opening leg naming the
  clue and why the count forces the slant, concluding with a necessity modal,
  and continuation legs flagged `continuesPrevious`

### Requirement: A hint step rests only on what the board shows

A step SHALL rest only on diagonals, clues and same-slant marks on the board.
Every equivalence a firing uses, whether a square taking the slant of a placed
square or a clue counting two squares as one line, SHALL cite the marks
joining the two squares.

#### Scenario: A cited mark is on the board

- **WHEN** the plan forces a square because it slants the same as a placed one
- **THEN** every mark the step cites is on the board when the step is shown

### Requirement: A mark the board lacks is placed by a step of its own

Every mark a firing cites that the board does not show SHALL be placed by an
earlier step of its own, narrated by why the two squares slant alike: a clue
with one line left for exactly those two squares, or the two v-shapes the pair
cannot form, as with the same clue at both ends of their shared side. A
straight line of 2s capped at both ends by the same kind of limit SHALL be
named as that pattern. No mark SHALL be placed that no firing uses.

#### Scenario: An equivalence rests on a mark the plan placed

- **WHEN** the plan forces a square because it slants the same as a placed one
  and the board lacks a mark the step cites
- **THEN** that mark was placed by an earlier step saying why its two squares
  slant alike

### Requirement: Slant hint rendering follows the element-type legend

The displayed hint SHALL highlight, not perform. A target square SHALL be
ringed `COL_HINT` with no slash preview: the diagonal is drawn only once the
move is made. A mark the step places SHALL be drawn in `COL_HINT`.

#### Scenario: A target is ringed and left empty

- **WHEN** a clue-counting step is displayed
- **THEN** the target square(s) render `COL_HINT` with no slash drawn

### Requirement: A hint's evidence is drawn in the evidence color

The deduction's evidence SHALL be outlined `COL_HINT_CELL`: the clue's
neighborhood, the loop chain, the trapped components, or the pairs a v-shape
argument reads, computed against the board as that step fires. The marks the
step cites SHALL be drawn `COL_HINT_CELL`, the clues it reads recolored
`COL_HINT`, and a cited filled anchor ringed `COL_HINT_REF`.

#### Scenario: Evidence is visible as an area

- **WHEN** a clue-counting step is displayed
- **THEN** the clue's digit recolors `COL_HINT` and the reasoned neighborhood
  renders `COL_HINT_CELL`

#### Scenario: Every step carries visible evidence

- **WHEN** any step is displayed
- **THEN** it carries a non-empty evidence area, a ringed anchor, a clue it
  reads or a mark it cites, never a bare conclusion

### Requirement: Every hint bit is part of what the tile cache compares

The hint colors SHALL be appended to the palette after `COL_BACKGROUND`
through `COL_GROUNDED`, whose indices they leave as they are, and every hint
bit SHALL participate in the per-tile render-cache diff key.

#### Scenario: A hint repaints an unchanged tile

- **WHEN** a tile is painted and a hint step then rings it, with no change to
  the board
- **THEN** the next `redraw` paints the tile again, ringed

### Requirement: Slant solves with a graded deductive solver

The solver SHALL apply its deductions by difficulty, Normal adding to Easy,
and SHALL return one of three verdicts: impossible, unique or non-converged.
The solver SHALL be reused by `solve()` and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong diagonals
- **THEN** the returned move list yields the unique solution

### Requirement: The Easy solver counts clues and avoids immediate loops

At Easy the solver SHALL apply the clue-point counting deduction (a clue whose
remaining lines equal zero or its remaining undecided neighbors fills all of
them) and immediate loop avoidance (a square whose one orientation would
close a loop takes the other).

#### Scenario: A 4 clue fills its four squares

- **WHEN** a 4 clue has four undecided squares around it
- **THEN** the solver slants all four toward it

### Requirement: The Normal solver tracks squares that slant alike

At Normal the solver SHALL additionally track single-pair equivalence around
clue points: two adjacent undecided equivalent squares count jointly as one
line, and a clue with one line left and exactly two undecided neighbors, side
by side around it, marks them equivalent. A slash value SHALL propagate
through an equivalence class.

#### Scenario: A placed square decides its class

- **WHEN** one square of an equivalence class is given a slash
- **THEN** the solver gives every other square of the class the same slash

### Requirement: The Normal solver avoids dead ends

At Normal the solver SHALL additionally apply dead-end avoidance: it SHALL
never connect two non-border vertex groups that each have at most one
remaining exit.

#### Scenario: Two dead ends are kept apart

- **WHEN** one slant of an empty square would join two vertex groups, neither
  touching the border and each with at most one exit left
- **THEN** the solver places the other slant

### Requirement: The Normal solver rules out v-shapes

At Normal the solver SHALL additionally apply the v-shape bitmap deductions:
placed slashes, 1-clues and 3-clues rule out v-shapes; 2-clues propagate
ruled-out v-shapes to their far side; and a square pair with both v-shapes
ruled out becomes equivalent.

#### Scenario: A 1 at each end joins the pair

- **WHEN** two side-by-side squares have a 1 clue at each end of their shared
  side, both ends inside the grid
- **THEN** neither v-shape is left to the pair and the two become equivalent

### Requirement: Slant generates solver-gated boards reproducibly

`newDesc` SHALL generate the same board for the same seed. It SHALL grow a
filled grid over a shuffled square order, a square taking the slant the vertex
DSF forces where the other would form a loop and otherwise one random draw of
two, derive every clue, remove clues under the solver, and regenerate while the
board is solvable one difficulty level down.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Slant description

### Requirement: Clue removal runs in two solver-gated passes

After a single shuffle of the clue order, `newDesc` SHALL try removing each
clue in two passes, keeping a removal only while the solver at the board's
difficulty still finds the unique solution. Pass 0 SHALL take the obvious
starting points (4s, 0s, border 2s and corner 1s), or every clue at Easy, and
pass 1 the rest.

#### Scenario: A removal the solver cannot bear is undone

- **WHEN** removing a clue leaves a board the solver no longer solves uniquely
  at the board's difficulty
- **THEN** the clue is put back

### Requirement: Slant draws its squares on the collection's quiet surface

`redraw` SHALL draw every square of the grid on the collection's cell surface,
slashed or not, with the surface's thin grid line between squares: the slash is
the content, and a filled square takes no tint of its own. The cursor square
SHALL take the cursor highlight. The ring of tiles round the grid, which holds
the border clues, SHALL stay the board's tone.

#### Scenario: A slashed square keeps the surface

- **WHEN** a board holds a slashed square and an empty one
- **THEN** both are drawn on the same cell surface
- **AND** the slashed one holds its diagonal in ink

### Requirement: A diagonal is a thick ink line with corner dots

`redraw` SHALL draw a diagonal as a thick line in ink, and SHALL draw the
corner dots where the diagonals of neighboring squares meet a tile.

#### Scenario: A neighbor's diagonal reaches the tile's corner

- **WHEN** a square holds a diagonal ending at a corner it shares with another
  tile
- **THEN** that tile draws the dot of the diagonal at the corner

### Requirement: A clue is drawn on a lifted disc

A clue SHALL be drawn on a disc of the lifted surface of a given, with a ring
and its number in ink. A clue on the outer border of the point grid SHALL be
drawn by the ring of tiles round the grid.

#### Scenario: A clue is lifted

- **WHEN** a board with a clue is drawn
- **THEN** the clue's disc is the lifted surface

#### Scenario: Border clue circles draw

- **WHEN** a clue sits on the outer border of the point grid
- **THEN** the border-ring tile pass draws its circle and number

### Requirement: Slant draws its live errors in the error color

`redraw` SHALL draw in the error color every diagonal that lies on a loop
edge, its corner dots included, and the number of every clue whose vertex is
in error.

#### Scenario: A loop is drawn red

- **WHEN** diagonals form a closed loop
- **THEN** each diagonal on the loop, with its corner dots, is drawn in the
  error color

### Requirement: The completion flash lifts the squares in three phases

The completion flash SHALL run in three phases, lit on the first and the last.
On its lit beats it SHALL lift the squares to the given's surface, a step that
reads in both schemes.

#### Scenario: The middle phase is unlit

- **WHEN** the flash is in its middle third
- **THEN** the squares are drawn on the cell surface

### Requirement: The drawstate diffs a packed word for every tile and the ring

The drawstate SHALL diff a `(w+2) × (h+2)` packed `Int32Array` covering the
border ring, rebuilt every frame, with the `findMistakes` overlay carried in
the diff key.

#### Scenario: A mistake overlay repaints an unchanged tile

- **WHEN** a tile is painted, `findMistakes` flags it, and `redraw` runs
  again with no tile change
- **THEN** the second paint renders the red mistake styling

### Requirement: Slant notes mode marks squares that slant alike

The game SHALL offer a same-slant mark between any two squares that share a
side, stored per square as a mark to the right and a mark below, and set or
cleared by an absolute `alike` move so that replaying one is harmless.

#### Scenario: A move log of diagonals alone replays without marks

- **WHEN** a move log holding only diagonals is replayed
- **THEN** it produces the same board, with no marks

### Requirement: The Marks key turns Slant's notes mode on and off

Notes mode (`ui.pencilMode`) SHALL be toggled by the collection's Marks key,
which SHALL be the only key on Slant's keypad. While notes mode is on, the
pencil indicator SHALL show at `pencilIndicatorBox`. With notes mode off,
input SHALL be unchanged.

#### Scenario: Notes mode off leaves a click cycling

- **WHEN** notes mode is off and a blank square is left-clicked
- **THEN** the move sets the square's diagonal and no mark

### Requirement: A notes-mode press marks the nearest side

In notes mode a press of either button SHALL toggle the mark on the side of
the pressed square nearest the press, and SHALL do nothing when that side is
the board's outer edge.

#### Scenario: A tap marks the nearest shared side

- **WHEN** notes mode is on and a square is pressed near its right side
- **THEN** the move toggles the mark between that square and its right neighbor
- **AND** a press near the same side from the neighbor toggles the same mark

### Requirement: The notes-mode keyboard pins a square and marks toward a neighbor

In notes mode Enter or Space SHALL pin the cursor square, toggle the mark
between the pin and a square beside it, let go of the pin when pressed on it,
and move the pin when pressed elsewhere. Escape SHALL let go of a pin.

#### Scenario: The keyboard pins and pairs

- **WHEN** notes mode is on, Enter is pressed on a square, the cursor moves to
  the square below and Enter is pressed again
- **THEN** the move sets the mark between the two squares and the pin is released

### Requirement: A same-slant mark is two short bars across the shared side

A mark SHALL be drawn as two short bars across the middle of the shared side
in the pencil color.

#### Scenario: A marked pair shows its bars

- **WHEN** two squares side by side are marked as slanting alike
- **THEN** the bars are drawn across the middle of the side the two share, in
  the pencil color

### Requirement: Slant computes live errors after every move

The state `executeMove` returns SHALL carry the board's errors: every diagonal
lying on a loop edge, found by the engine's `findLoops` over the vertex graph,
is a loop error; every clue vertex whose degree exceeds its clue, or whose
maximum achievable degree is below its clue, is a vertex error; and every
diagonal in the border-connected vertex component is grounded.

#### Scenario: A closed loop is flagged

- **WHEN** diagonals are placed forming a closed loop
- **THEN** each diagonal on the loop carries the loop-error flag

#### Scenario: An over-committed clue is flagged

- **WHEN** a vertex clue `1` has two incident diagonals
- **THEN** that vertex carries the vertex-error flag

### Requirement: Slant judges completion from the board

The board SHALL be reported solved exactly while no errors exist and no square
is blank, judged from the board however it was reached.

#### Scenario: Completion follows the board

- **WHEN** the last blank square is filled consistently with all clues and
  no loop exists
- **THEN** `status` reports the board solved
- **AND** a later move that leaves a square blank or makes an error reports it
  unsolved again
