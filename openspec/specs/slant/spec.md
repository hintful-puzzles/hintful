# slant Specification

## Purpose
Slant (Gokigen Naname), the puzzle of drawing a diagonal in every square so that
no loop forms and each numbered point meets that many lines. This capability
specifies what is the game's own: its description format and what a short
params string means, its live errors, its same-slant marks and the notes mode
that sets them, its mistake-checking, what its two preferences change, what
each difficulty's solver may use and how the generator strips clues, how the
board is drawn, and its deductive hint: its techniques, their order, the marks
a step puts down first and what its legend does not say. Its clicks and keys
are its `targetVerbs` declaration and its params its `paramConfig`.

## Requirements

### Requirement: Rules: Slant is solved when every square is slashed, every clue met and no loop closed

Every square of the `w × h` grid SHALL take a `/` or `\` diagonal so that every
numbered vertex clue (0–4, on the `(w+1) × (h+1)` point grid) is met by exactly
that many incident diagonals and the diagonals form no closed loop. The board
SHALL be reported solved exactly while no errors exist and no square is blank.

#### Scenario: Completion follows the board

- **WHEN** the last blank square is filled consistently with all clues and
  no loop exists
- **THEN** `status` reports the board solved
- **AND** a later move that leaves a square blank or makes an error reports it
  unsolved again

### Requirement: Rules: Slant ships findMistakes

`findMistakes(state)` SHALL re-solve the board's clues with the Normal solver
and return one mistake per square whose placed diagonal differs from the
unique solution. A blank square SHALL never be a mistake. A mistaken square
SHALL be marked in the error color.

#### Scenario: A wrong diagonal blocks Check & Save

- **WHEN** a square holds the diagonal opposite to the unique solution and
  `findMistakes` runs
- **THEN** exactly that square is reported and rendered red

#### Scenario: Blank squares are not mistakes

- **WHEN** the board is partially filled with only correct diagonals
- **THEN** `findMistakes` returns an empty list

### Requirement: Rules: A same-slant mark the solution contradicts is a mistake

`findMistakes` SHALL also return one mistake, carrying the side it sits on,
per same-slant mark joining two squares whose solution slants differ. Such a
mark SHALL be drawn in the mistake color.

#### Scenario: A wrong mark is a mistake

- **WHEN** a same-slant mark joins two squares the solution slants differently
- **THEN** `findMistakes` reports that mark

### Requirement: Rules: Slant notes mode marks squares that slant alike

The game SHALL offer a same-slant mark between any two squares that share a
side, set or cleared by an absolute `alike` move so that replaying one is
harmless.

#### Scenario: A move log of diagonals alone replays without marks

- **WHEN** a move log holding only diagonals is replayed
- **THEN** it produces the same board, with no marks

### Requirement: Rules: Slant computes live errors after every move

The state `executeMove` returns SHALL carry the board's errors: every diagonal
lying on a loop edge is a loop error; every clue vertex whose degree exceeds its clue, or whose
maximum achievable degree is below its clue, is a vertex error; and every
diagonal in the border-connected vertex component is grounded.

#### Scenario: A closed loop is flagged

- **WHEN** diagonals are placed forming a closed loop
- **THEN** each diagonal on the loop carries the loop-error flag

#### Scenario: An over-committed clue is flagged

- **WHEN** a vertex clue `1` has two incident diagonals
- **THEN** that vertex carries the vertex-error flag

### Requirement: Params: A Slant string with no difficulty letter reads as Easy

Slant's params (a size and a difficulty, Easy or Normal), their bounds and
their encoding SHALL be those its `paramConfig` and its declared codec give
(`engine-params`, "A game declares its params encoding once, and both codec
halves are derived"), and its menu what `presets` lists. Normal SHALL keep the
letter `h`. `decodeParams` SHALL read a string with no `d` segment as the
default difficulty, Easy.

#### Scenario: The short form of a Normal preset

- **WHEN** `5x5`, the short form of the preset `5x5dh`, is decoded
- **THEN** the params are 5 by 5 at Easy, the board `5x5de` names

### Requirement: Params: Slant refuses a grid too large to count

`validateParams` SHALL refuse a width times height past the largest whole
number the app counts exactly, whether or not the board is to be dealt, with
the collection's sentence "Width times height must not be unreasonably large."

#### Scenario: A height of sixteen digits

- **WHEN** `5x5de` is entered with its height written `9007199254740991`
- **THEN** the params are refused with that sentence

### Requirement: Description: Slant descriptions are run-length clue grids

The desc SHALL be the `(w+1) × (h+1)` vertex-clue grid row-major, in the
engine's run-letter grammar (`engine-params`, "The engine provides the
run-letter description grammar"): one digit `0`–`4` per clue, and the
grammar's letters for the clueless vertices. Validating a desc SHALL reject an
unknown character, a desc too short to fill the grid and a desc that overruns
it.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc with an invalid character, or with a clue count not matching
  `(w+1) × (h+1)`, is validated
- **THEN** the result is a non-null error

### Requirement: Description: A Slant clue above 4 is refused

`newState` SHALL refuse a description holding a digit from `5` to `9`, as a
number out of range and not as an unknown character: a point has four squares
round it at most.

#### Scenario: A 5 where a 0 was

- **WHEN** `1a0a11a22a3b22b1a1g330a1b1a` is loaded on a `5x5de` board with
  its first `0` written `5`
- **THEN** it is refused as holding a number out of range for its board

### Requirement: Generation: The Easy solver counts clues and avoids immediate loops

At Easy the solver SHALL apply the clue-point counting deduction (a clue whose
remaining lines equal zero or its remaining undecided neighbors fills all of
them) and immediate loop avoidance (a square whose one orientation would
close a loop takes the other).

#### Scenario: A 4 clue fills its four squares

- **WHEN** a 4 clue has four undecided squares around it
- **THEN** the solver slants all four toward it

### Requirement: Generation: The Normal solver tracks squares that slant alike

At Normal the solver SHALL additionally track single-pair equivalence around
clue points: two adjacent undecided equivalent squares count jointly as one
line, and a clue with one line left and exactly two undecided neighbors, side
by side around it, marks them equivalent. A slash value SHALL propagate
through an equivalence class.

#### Scenario: A placed square decides its class

- **WHEN** one square of an equivalence class is given a slash
- **THEN** the solver gives every other square of the class the same slash

### Requirement: Generation: The Normal solver avoids dead ends

At Normal the solver SHALL additionally apply dead-end avoidance: it SHALL
never connect two non-border vertex groups that each have at most one
remaining exit.

#### Scenario: Two dead ends are kept apart

- **WHEN** one slant of an empty square would join two vertex groups, neither
  touching the border and each with at most one exit left
- **THEN** the solver places the other slant

### Requirement: Generation: The Normal solver rules out v-shapes

At Normal the solver SHALL additionally apply the v-shape bitmap deductions:
placed slashes, 1-clues and 3-clues rule out v-shapes; 2-clues propagate
ruled-out v-shapes to their far side; and a square pair with both v-shapes
ruled out becomes equivalent.

#### Scenario: A 1 at each end joins the pair

- **WHEN** two side-by-side squares have a 1 clue at each end of their shared
  side, both ends inside the grid
- **THEN** neither v-shape is left to the pair and the two become equivalent

### Requirement: Generation: Slant strips clues while its difficulty's solver still solves the board

A clue SHALL stay removed only while the solver of the board's difficulty
still finds the unique solution, and above Easy the obvious starting points
(4s, 0s, border 2s and corner 1s) SHALL be tried for removal before the rest,
so that few of them survive.

#### Scenario: A removal the solver cannot bear is undone

- **WHEN** removing a clue leaves a board the solver no longer solves uniquely
  at the board's difficulty
- **THEN** the clue is put back

### Requirement: Solver: Slant solves with a graded deductive solver

The solver SHALL apply its deductions by difficulty, Normal adding to Easy,
and SHALL return one of three verdicts: impossible, unique or non-converged.
The solver SHALL be reused by `solve()` and `findMistakes`.

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong diagonals
- **THEN** the returned move list yields the unique solution

### Requirement: Controls: Slant's clicks and keys are its declared verbs, and a preference swaps the buttons

Slant SHALL take its clicks, its cursor and its select keys from its
`targetVerbs` declaration (`engine-input`, "The engine owns a declaring game's
press and select keys"): a left-click cycles a square blank→`\`→`/`→blank and
a right-click the other way round. The two SHALL be swapped when the
`left-button` preference selects `/`-first.

#### Scenario: Swapped button order

- **WHEN** the `left-button` preference is set to `/`-first and a blank
  square is left-clicked
- **THEN** the square becomes `/`

### Requirement: Controls: A notes-mode press marks the nearest side

In notes mode a press of either button SHALL toggle the mark on the side of
the pressed square nearest the press, and SHALL do nothing when that side is
the board's outer edge.

#### Scenario: A tap marks the nearest shared side

- **WHEN** notes mode is on and a square is pressed near its right side
- **THEN** the move toggles the mark between that square and its right neighbor
- **AND** a press near the same side from the neighbor toggles the same mark

### Requirement: Controls: The notes-mode keyboard pins a square and marks toward a neighbor

In notes mode Enter or Space SHALL pin the cursor square, toggle the mark
between the pin and a square beside it, let go of the pin when pressed on it,
and move the pin when pressed elsewhere. Escape SHALL let go of a pin.

#### Scenario: The keyboard pins and pairs

- **WHEN** notes mode is on, Enter is pressed on a square, the cursor moves to
  the square below and Enter is pressed again
- **THEN** the move sets the mark between the two squares and the pin is released

### Requirement: Controls: Slant's own keys set the cursor square outright

Each key-only verb of `targetVerbs` SHALL set the cursor square to its state
directly, whatever the square held, where a click or a select key cycles it.

#### Scenario: A literal key replaces the other diagonal

- **WHEN** the cursor is on a square holding `\` and the `/` key is pressed
- **THEN** the square holds `/`, with no empty state between

### Requirement: Preferences: Slant's two preferences swap the buttons and fade grounded diagonals

Of the two preferences `prefs` declares, `left-button`, whose choices are in
order `\`-first, the default, and `/`-first, SHALL swap which way round each
button cycles a square, and `fade-grounded`, off unless set, SHALL
fade the diagonals in the border-connected component to a dimmed color so that
the diagonals that could still close a loop stand out.

#### Scenario: Fade-grounded dims border-connected diagonals

- **WHEN** `fade-grounded` is enabled and a diagonal is connected to the
  border
- **THEN** it renders in the grounded color instead of its slash color

### Requirement: Hint: Each Slant technique is narrated by its own reason

A clue-counting step SHALL name the clue and say why its count forces the
slants, and SHALL fill every square the clue forces in one journey. A
loop-avoidance step SHALL say that the ruled-out slant would close a loop, and
a dead-end step that it would seal points off from the grid's edge; each SHALL
shade the chain or the trapped components involved.

#### Scenario: A clue-counting firing is explained and grouped

- **WHEN** the plan reaches a clue whose remaining lines equal its remaining
  empty neighbors (or is already satisfied)
- **THEN** one journey fills all forced neighbors, its opening leg naming the
  clue and why the count forces the slant, concluding with a necessity modal,
  and continuation legs flagged `continuesPrevious`

### Requirement: Hint: A hint step rests only on what the board shows

A step SHALL rest only on diagonals, clues and same-slant marks on the board.
Every equivalence a firing uses, whether a square taking the slant of a placed
square or a clue counting two squares as one line, SHALL cite the marks
joining the two squares.

#### Scenario: A cited mark is on the board

- **WHEN** the plan forces a square because it slants the same as a placed one
- **THEN** every mark the step cites is on the board when the step is shown

### Requirement: Hint: A mark the board lacks is placed by a step of its own

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

### Requirement: Hint: Slant's hint marks are its legend's, with no slash drawn in a ringed square

A step's marks SHALL be the roles `hintMarks` declares, in the hint colors of
its palette: a ring on what the step decides, and an outline on what it
reasons from. A ringed square SHALL hold no slash preview: the diagonal is
drawn only once the move is made. The evidence a step outlines SHALL be
computed against the board as that step fires.

#### Scenario: A target is ringed and left empty

- **WHEN** a clue-counting step is displayed
- **THEN** the target square(s) render `COL_HINT` with no slash drawn

#### Scenario: Every step carries visible evidence

- **WHEN** any step is displayed
- **THEN** it carries a non-empty evidence area, a ringed anchor, a clue it
  reads or a mark it cites, never a bare conclusion

### Requirement: Hint: Slant's hint steps come in the order its solver finds them

The hint's square steps SHALL come in the order the solver forces them from
the player's position. Clues are read first, row by row. Only when no clue
forces a square are the empty squares read, for a slant that would close a
loop, join two dead ends, or differ from a placed square marked alike with it;
where several hold, the step names the last of them that does. Only then are
v-shapes read, which join pairs and force no square. A pass that forces
anything starts the clues again.

#### Scenario: A clue comes before a loop

- **WHEN** one clue has exactly as many empty squares as lines left, and an
  empty square elsewhere would close a loop if slanted one way
- **THEN** the plan's first step is the clue's

### Requirement: Hint: Slant's hint uses every technique at either difficulty

`hint` SHALL seed the solver with the player's position, the placed diagonals
and the same-slant marks. It SHALL plan with the Normal solver's techniques on
every board, an Easy one included, so that a same-slant mark the player has
put down is used whatever the board's difficulty.

#### Scenario: A mark is used on an Easy board

- **WHEN** on the Easy board `5x5de:1a0a11a22a3b22b1a1g330a1b1a` the clues
  force nothing more, and an empty square is marked as slanting alike with a
  drawn one
- **THEN** the reading of the squares that follows gives it the drawn
  square's slant, citing the mark

### Requirement: Look: Slant draws its squares on the collection's quiet surface

`redraw` SHALL draw every square of the grid on the collection's cell surface,
slashed or not, with the surface's thin grid line between squares: the slash is
the content, and a filled square takes no tint of its own. The cursor square
SHALL take the cursor highlight. The ring of tiles round the grid, which holds
the border clues, SHALL stay the board's tone.

#### Scenario: A slashed square keeps the surface

- **WHEN** a board holds a slashed square and an empty one
- **THEN** both are drawn on the same cell surface
- **AND** the slashed one holds its diagonal in ink

### Requirement: Look: A diagonal is a thick ink line with corner dots

`redraw` SHALL draw a diagonal as a thick line in ink, and SHALL draw the
corner dots where the diagonals of neighboring squares meet a tile.

#### Scenario: A neighbor's diagonal reaches the tile's corner

- **WHEN** a square holds a diagonal ending at a corner it shares with another
  tile
- **THEN** that tile draws the dot of the diagonal at the corner

### Requirement: Look: A clue is drawn on a lifted disc

A clue SHALL be drawn on a disc of the lifted surface of a given, with a ring
and its number in ink. A clue on the outer border of the point grid SHALL be
drawn by the ring of tiles round the grid.

#### Scenario: A clue is lifted

- **WHEN** a board with a clue is drawn
- **THEN** the clue's disc is the lifted surface

#### Scenario: Border clue circles draw

- **WHEN** a clue sits on the outer border of the point grid
- **THEN** the border-ring tile pass draws its circle and number

### Requirement: Look: Slant draws its live errors in the error color

`redraw` SHALL draw in the error color every diagonal that lies on a loop
edge, its corner dots included, and the number of every clue whose vertex is
in error.

#### Scenario: A loop is drawn red

- **WHEN** diagonals form a closed loop
- **THEN** each diagonal on the loop, with its corner dots, is drawn in the
  error color

### Requirement: Look: A same-slant mark is two short bars across the shared side

A mark SHALL be drawn as two short bars across the middle of the shared side
in the pencil color.

#### Scenario: A marked pair shows its bars

- **WHEN** two squares side by side are marked as slanting alike
- **THEN** the bars are drawn across the middle of the side the two share, in
  the pencil color

### Requirement: Look: The completion flash lights the grid's squares

The completion flash SHALL sweep the grid's squares, and SHALL fill a lit
square with a flash color under its diagonal and its clue discs. The margin
round the grid, where the outer clues are drawn, SHALL never be lit.

#### Scenario: A square the highlight has not reached

- **WHEN** the flash is drawn before its highlight reaches a square
- **THEN** that square is drawn on the cell surface
