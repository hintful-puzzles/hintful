# pearl Specification

## Purpose
Pearl (Masyu), the puzzle of drawing one closed loop through square centers that
turns at every black pearl but not in the squares either side of it, and runs
straight through every white pearl with a turn in at least one square beside it.
This capability specifies the game: its rules, its description and params
encodings, completion and mistake reporting, its controls, the solver's ladder
and what the generator promises, its hint, and how it looks.

## Requirements

### Requirement: The rules of Pearl

The player SHALL draw a single closed loop through grid cells so that it turns
a right angle at every black pearl (and goes straight through at least one
cell on each side of it) and passes straight through every white pearl
(turning immediately before or after).

#### Scenario: A loop that runs straight through a black pearl

- **WHEN** the lines form one closed loop that runs straight through a black
  pearl
- **THEN** the board is not reported solved, and that pearl carries an error
  mark

### Requirement: Pearl descriptions use the upstream run-length encoding

The desc SHALL encode the clue grid row-major as a run-length string: lowercase
letters compress runs of unclued cells, `B` marks a black pearl and `W` marks a
white pearl. `validateDesc` SHALL reject an unknown character and a description
whose decoded cell count does not exactly fill the grid.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with too much or too little data to
  fill the grid
- **THEN** it returns a non-null error string

### Requirement: Pearl reports completion and mistakes

The game SHALL report the board solved exactly while the lines form one closed
loop satisfying every clue. It SHALL show always-on error marks, flagging
squares of degree greater than two and clue contradictions. A move that leaves
a line with no reciprocal line in the neighboring square SHALL be refused.

#### Scenario: A loop that misses a pearl is not solved

- **WHEN** the lines form one closed loop that leaves a pearl's square empty
- **THEN** the board is not reported solved, and that pearl carries an error
  mark

### Requirement: Pearl's findMistakes compares the board with its one solution

Because boards are uniquely solvable, the game SHALL implement `findMistakes`:
re-solve from the clues to the unique solution's line grid and return every
line segment the player has drawn that the solution does not contain, and every
no-line cross the player has placed on an edge the solution does contain, each
a definite mistake. A missing solution segment SHALL NOT be a mistake, and a
board the solver cannot finish SHALL yield no mistakes.

#### Scenario: A line the solution does not contain is flagged

- **WHEN** the player has drawn a loop segment that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that segment is returned as a mistake

#### Scenario: A cross on an edge the solution uses is flagged

- **WHEN** the player has placed a no-line cross on an edge that the unique
  solution's loop runs through, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake, marked as a cross

#### Scenario: A correct partial board has no mistakes

- **WHEN** the player has drawn only loop segments that the unique solution
  contains
- **THEN** `findMistakes` returns an empty result

### Requirement: Pearl's mistakes draw apart from its error marks

The always-on error marks and the `findMistakes` overlay are distinct signals;
the overlay SHALL draw a flagged-mistake segment and a wrong cross in the
mistake color.

#### Scenario: A flagged cross is drawn as a mistake

- **WHEN** `findMistakes` has flagged a cross and the board is redrawn with the
  mistakes shown
- **THEN** that cross is drawn in the mistake color, and the other crosses are
  not

### Requirement: Pearl draws the loop by dragging along grid edges

`interpretMove` SHALL support drawing the loop by dragging along grid edges,
committing the traced path as a sequence of line-segment flips. The traced path
SHALL respect existing no-line marks as barriers, and SHALL respect the
loop-closure degree rule: a drag that returns to its start does not close there
when that would leave the square with more than two lines.

#### Scenario: A drag draws a loop path

- **WHEN** the player left-drags along a sequence of grid edges
- **THEN** `interpretMove` yields a move whose execution sets those loop segments

### Requirement: Pearl previews a drag in progress

While a line drag is in progress, `redraw` SHALL preview it: the segments the
drag would add and the segments it would remove, each in its drag color.

#### Scenario: A drag in progress is previewed

- **WHEN** the board is redrawn while a line drag is in progress
- **THEN** the segments the drag would add and the segments it would remove are
  drawn in the drag colors

### Requirement: Pearl marks no-line crosses with the secondary drag

`interpretMove` SHALL support marking "no-line" crosses with the secondary
(right) drag. Laying a line over a mark SHALL be rejected.

#### Scenario: A line is refused on a crossed edge

- **WHEN** the player left-clicks an edge that holds a no-line cross
- **THEN** `interpretMove` yields no move, and the cross stays

### Requirement: Pearl's keyboard cursor draws lines and marks

`interpretMove` SHALL support a keyboard cursor that draws lines or marks with
modifiers.

#### Scenario: A modified arrow key marks the edge it points across

- **WHEN** the cursor is showing on a square and the player presses an arrow
  key toward a neighboring square, across an edge with no line or cross, with
  Ctrl held, or with Shift held
- **THEN** with Ctrl the move draws a line on the edge between the two squares,
  and with Shift it marks that edge with a no-line cross

### Requirement: A Pearl input that changes nothing makes no move

A drag or click that changes nothing SHALL produce no move.

#### Scenario: A no-op drag yields no move

- **WHEN** the player drags or clicks in a way that would change no segment or
  mark
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

### Requirement: Pearl leaves the H key to the app

The game SHALL decline the `H` key, so the app's Next hint shortcut reaches it.
Upstream's in-place autosolve move SHALL still replay from a saved game.

#### Scenario: A saved game that used the autosolve move

- **WHEN** a saved game whose history holds the in-place autosolve move is
  loaded
- **THEN** the move is replayed and not refused

### Requirement: Pearl's parameters

Params SHALL be `w`, `h` and `difficulty` (Easy or Normal), encoded `{w}x{h}`
with a full-form `d{char}` difficulty suffix. Decoding SHALL leave upstream's
trailing `n` unread, which asks for a board nothing has checked, and encoding
SHALL never write it.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, difficulty: DIFF_TRICKY }` (the
  Normal tier) are encoded in full
- **THEN** decoding the result round-trips the params

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `12x8dtn` is decoded
- **THEN** the params are those of `12x8dt`

### Requirement: Pearl's parameter bounds

`w` and `h` SHALL each be at least 5, which the game declares as the bounds of
its dimension fields and the engine's check enforces. `validateParams` SHALL
enforce that width×height does not overflow, and that a Normal board has
`w + h ≥ 11`.

#### Scenario: The Normal tier requires a large enough board

- **WHEN** `validateParams` is given a Normal board with `w + h < 11`
- **THEN** it returns a non-null error string

#### Scenario: A board narrower than the minimum

- **WHEN** params with `w < 5` or `h < 5` are checked for validity
- **THEN** they are refused

### Requirement: Pearl's appearance preference

The two appearance styles (traditional Masyu and loopy) SHALL be selectable via
an `appearance` preference (default traditional).

#### Scenario: A player who has set nothing

- **WHEN** the game is opened with no `appearance` preference stored
- **THEN** the board is drawn in the traditional style

### Requirement: Pearl's generator gates every board on the solver

The generator SHALL gate every board on the solver finding a unique solution
at the requested difficulty (and failing one tier easier), and SHALL then
greedily minimize the clues.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated and graded by the solver
- **THEN** the grading is a unique solution at exactly the requested difficulty

### Requirement: Pearl's Solve uses the generator's solution when it has one

`solve` SHALL return the generator's aux when present, else re-solve from the
clues.

#### Scenario: A board entered by its description

- **WHEN** `solve` is invoked on a board that came with no aux
- **THEN** the move it returns draws the solution the solver finds from the
  clues

### Requirement: Pearl's solver is a certified deduction ladder

Pearl's solver SHALL deduce only, with no guessing or recursion, as a
`runDeductionFixpoint` ladder of these rungs: square shapes from known edges,
edges from surviving shapes, the pearl clue deductions, and a closed-loop rung,
all at Easy; and the shortcut-loop rule at Normal. The closed-loop rung SHALL
end the ladder through `settled` once a loop has closed and everything off it
is blank. A firing census SHALL assert that every rung fires, at both caps.

#### Scenario: A mis-tiered shortcut rung fails

- **WHEN** the shortcut-loop rung is declared at Easy
- **THEN** boards that need it pass as Easy, and the frozen differential fails

#### Scenario: A silenced rung fails

- **WHEN** any rung is removed from the ladder
- **THEN** the firing census or the frozen differential fails

### Requirement: Pearl explains the next deduction

The game SHALL implement `hint` as a recording projection of its own solver
ladder, one premise per step: a square read off its own edges (one axis of a
black pearl at a time), each of the four pearl rules, an edge that would close
a loop early, and a square state that would.

#### Scenario: Following the hint finishes a board

- **WHEN** a generated board at either tier is played by repeatedly taking the
  first step of a fresh hint
- **THEN** the board is completed, and every line a step asked for is in the
  solution and every cross is not

### Requirement: A Pearl hint step rests only on edges and pearls

Every fact a hint step rests on SHALL be an edge the player has drawn or
crossed, or a pearl: before each firing, every square's possible shapes SHALL
be re-read from its pearl and its four edges, and a shape the ladder rules out
SHALL count only through the edges it settles at its own square in the same
step.

#### Scenario: A step rests on nothing the player cannot mark

- **WHEN** any firing of the hint's recording pass is taken
- **THEN** every square in the board it reasons from holds exactly the shapes its
  pearl and edges allow

### Requirement: A Pearl hint step asks for no cross the square already shows

A hint step SHALL NOT ask for a cross beside a square that already has its two
lines.

#### Scenario: An edge ruled out beside a full square

- **WHEN** a step's deduction rules out an edge of a square that already has
  two lines
- **THEN** the step does not ask the player to cross that edge

### Requirement: A Pearl hint step says why and marks what it decides

Each hint step SHALL name why its edges are forced, draw each decided edge in
the hint's action color as the line or cross it asks for, and outline the
squares it reasons from.

#### Scenario: A step that asks for a cross

- **WHEN** a displayed step decides that an edge cannot be a line
- **THEN** the edge is drawn as a cross in the hint's action color, and the
  squares the step reasons from are outlined

### Requirement: Pearl's hint follows a step made one edge at a time

`hintKeepTrack` SHALL judge a move by the edges it changes, holding a step
whose edges are only partly made and shrinking it to what is left.

#### Scenario: One of a step's two edges is made

- **WHEN** a displayed step asks for two edges and the player makes one of them
- **THEN** the step stays, and asks for the other edge alone

### Requirement: Pearl's hint draws a black pearl's arm whole

A hint step SHALL also draw, in the same step and the same move, every open
edge the pearls' rules carry on from the lines it draws, and from those in
turn: a line leaving a black pearl runs on through the next square, and a line
entering a white pearl leaves by the opposite edge.

#### Scenario: A black pearl's forced edge comes with its run-on

- **WHEN** a hint step decides that the edge beside a black pearl must be a line,
  and the far edge of the square past it is open
- **THEN** the step asks for both lines, and its sentence says the pearl's line
  must run that way through the next square

### Requirement: Pearl's hint names every line it carries on

Where a hint step draws a line the pearls' rules carry on, the black pearl's
own sentence SHALL say its line runs through the next square, and a step that
carries a line through a white pearl SHALL say so in a second sentence. No step
SHALL draw a carried line its sentence does not name.

#### Scenario: A line into a white pearl comes out the other side

- **WHEN** a hint step draws a line into a white pearl whose opposite edge is open
- **THEN** the step also asks for that opposite edge, and its explanation ends
  "It runs straight on through the next white pearl too."

### Requirement: Pearl draws its loop on the collection's quiet surface

`redraw` SHALL draw every square as the collection's cell surface. In the
traditional appearance the line between squares and the frame round the grid
SHALL be the collection's surface grid line, one line wide; in the loopy
appearance the center dots and the lines between them SHALL be that same
color. The loop the player draws SHALL be drawn in ink, which inverts with the
scheme, so it stands off the surface in both.

#### Scenario: The loop reads in the dark scheme

- **WHEN** a loop segment is drawn in the dark scheme
- **THEN** it is drawn in ink, the scheme's maximum contrast against the
  surface, and a black pearl on it stays black

### Requirement: Pearl's pearls are the same black and white in both schemes

A black pearl and a white pearl SHALL be drawn in a black and a white that are
the same in both schemes. A white pearl on the loop SHALL be parted from it by
the pearl's black outline. A black pearl SHALL carry a rim in ink, so it stands
off the surface in the dark scheme.

#### Scenario: A black pearl reads on a fresh dark board

- **WHEN** a black pearl with no line through it is drawn in the dark scheme
- **THEN** its fill is black and its rim is ink, a light ring round it

### Requirement: Pearl's keyboard cursor is brackets at its square's corners

The keyboard cursor SHALL be brackets at the corners of its square, which the
loop never crosses, and SHALL NOT fill the square.

#### Scenario: The cursor leaves the square's surface alone

- **WHEN** the keyboard cursor rests on a square
- **THEN** the square is the cell surface, with brackets at its corners
