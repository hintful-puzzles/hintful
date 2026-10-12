# pearl Specification

## Purpose
Pearl (Masyu), the puzzle of drawing one closed loop through square centers that
turns at every black pearl but not in the squares either side of it, and runs
straight through every white pearl with a turn in at least one square beside it.
This capability specifies what is the game's own: its rules, what a short
params string means and which sizes are refused, its description encoding,
completion and mistake reporting, its controls, the solver's ladder and what
the generator promises, its hint's techniques, and how it looks.

## Requirements

### Requirement: Rules: The rules of Pearl

The player SHALL draw a single closed loop through grid cells so that it turns
a right angle at every black pearl (and goes straight through at least one
cell on each side of it) and passes straight through every white pearl
(turning immediately before or after).

#### Scenario: A loop that runs straight through a black pearl

- **WHEN** the lines form one closed loop that runs straight through a black
  pearl
- **THEN** the board is not reported solved, and that pearl carries an error
  mark

### Requirement: Rules: Pearl reports completion and mistakes

The game SHALL report the board solved exactly while the lines form one closed
loop satisfying every clue. It SHALL show always-on error marks, flagging
squares of degree greater than two and clue contradictions. A move that leaves
a line with no reciprocal line in the neighboring square SHALL be refused.

#### Scenario: A loop that misses a pearl is not solved

- **WHEN** the lines form one closed loop that leaves a pearl's square empty
- **THEN** the board is not reported solved, and that pearl carries an error
  mark

### Requirement: Rules: A Pearl mistake is a line the solution lacks or a cross on an edge it uses

`findMistakes` SHALL re-solve from the clues to the unique solution's line
grid and return every line segment the player has drawn that the solution does
not contain, and every no-line cross the player has placed on an edge the
solution does contain. A missing solution segment SHALL NOT be a mistake.

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

### Requirement: Params: A Pearl params string with no difficulty letter is Easy

Pearl's params (a size and a tier), their bounds and their encoding SHALL be
those its `paramConfig` and its declared codec give (`engine-params`, "A game
declares its params encoding once, and both codec halves are derived"), and
its menu what `presets` builds. Decoding a string with no difficulty letter
SHALL give Easy, whatever the default preset's difficulty.

#### Scenario: A string with no letter

- **WHEN** `6x6` is decoded
- **THEN** the board is Easy and its full encoding is `6x6de`, though the
  default preset, `8x8dt`, is Normal

### Requirement: Params: Pearl refuses a Normal board whose width and height sum under 11

`validateParams` SHALL enforce that width×height does not overflow, and that a
Normal board has `w + h ≥ 11`.

#### Scenario: The Normal tier requires a large enough board

- **WHEN** `validateParams` is given a Normal board with `w + h < 11`
- **THEN** it returns a non-null error string

### Requirement: Description: Pearl descriptions use the upstream run-length encoding

The desc SHALL encode the clue grid row-major as a run-length string: lowercase
letters compress runs of unclued cells, `B` marks a black pearl and `W` marks a
white pearl. The unclued squares after the last pearl SHALL be written too, so
that the description covers the grid exactly. A description with an unknown
character, or whose decoded cell count does not exactly fill the grid, SHALL
be refused.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc with too much or too little data to fill the grid is read
- **THEN** the board is refused with an error string

#### Scenario: A dealt 6×6 board

- **WHEN** `BbBjWBWbBmWaB` is read as a 6×6 board
- **THEN** its first row is a black pearl, two unclued squares, a black pearl
  and two unclued squares, the `j` covers those two and the eight squares
  after them, and the board's last square is a black pearl

### Requirement: Generation: Pearl's generator gates every board on the solver

The generator SHALL keep a loop only where its full set of pearls passes the
collection's two-way gate (`engine-difficulty`, "A difficulty tier binds the
board it generates"), a tier being the rungs of "Solver: Pearl's solver is a
certified deduction ladder", and SHALL then greedily remove white pearls,
trying each in a shuffled order twice. It SHALL remove no black pearl.

#### Scenario: A pearl is taken away after the gate

- **WHEN** a loop's full set of pearls has passed the gate and a white pearl
  is removed
- **THEN** the removal stands only where the solver still finds the one
  solution at the tier asked for, and the lower tier is not asked again

### Requirement: Solver: Pearl's Solve uses the generator's solution when it has one

`solve` SHALL return the generator's aux when present, else re-solve from the
clues.

#### Scenario: A board entered by its description

- **WHEN** `solve` is invoked on a board that came with no aux
- **THEN** the move it returns draws the solution the solver finds from the
  clues

### Requirement: Solver: Pearl's solver is a certified deduction ladder

Pearl's solver SHALL deduce only, with no guessing or recursion, as a
`runDeductionFixpoint` ladder of these rungs: square shapes from known edges,
edges from surviving shapes, the pearl clue deductions, and a closed-loop rung,
all at Easy; and the shortcut-loop rule at Normal. The closed-loop rung SHALL
end the ladder through `settled` once a loop has closed and everything off it
is blank.

#### Scenario: A mis-tiered shortcut rung fails

- **WHEN** the shortcut-loop rung is declared at Easy
- **THEN** boards that need it pass as Easy, and the frozen differential fails

#### Scenario: A silenced rung fails

- **WHEN** any rung is removed from the ladder
- **THEN** the firing census or the frozen differential fails

### Requirement: Controls: Pearl draws the loop by dragging along grid edges

`interpretMove` SHALL support drawing the loop by dragging along grid edges,
committing the traced path as a sequence of line-segment flips. The traced path
SHALL respect existing no-line marks as barriers, and SHALL respect the
loop-closure degree rule: a drag that returns to its start does not close there
when that would leave the square with more than two lines.

#### Scenario: A drag draws a loop path

- **WHEN** the player left-drags along a sequence of grid edges
- **THEN** `interpretMove` yields a move whose execution sets those loop segments

### Requirement: Controls: Pearl marks no-line crosses with the secondary drag

`interpretMove` SHALL support marking "no-line" crosses with the secondary
(right) drag. Laying a line over a mark SHALL be rejected.

#### Scenario: A line is refused on a crossed edge

- **WHEN** the player left-clicks an edge that holds a no-line cross
- **THEN** `interpretMove` yields no move, and the cross stays

### Requirement: Controls: Pearl leaves the H key to the app

The game SHALL decline the `H` key, so the app's Next hint shortcut reaches it.
Upstream's in-place autosolve move SHALL still replay from a saved game.

#### Scenario: A saved game that used the autosolve move

- **WHEN** a saved game whose history holds the in-place autosolve move is
  loaded
- **THEN** the move is replayed and not refused

### Requirement: Controls: A Pearl click toggles the edge nearest the press

A press and release with no drag between SHALL address the side of the pressed
square nearest the press. The left button SHALL draw or undraw the line across
it, and the right button SHALL set or clear its cross. A press within a
quarter of a square of the square's middle, or nearest a side on the grid's
rim, SHALL make no move. A cross SHALL be refused on an edge that holds a
line.

#### Scenario: A cross on a drawn line

- **WHEN** the player right-clicks an edge that holds a line
- **THEN** no move is made and the line stays

#### Scenario: A click on the middle of a square

- **WHEN** the player clicks the middle of a square with either button
- **THEN** no move is made

### Requirement: Controls: Pearl's Enter key traces a path the arrows extend

Enter on a hidden cursor SHALL only show it. On a showing one it SHALL start a
path at the cursor's square, each arrow SHALL then extend it as a drag would,
and Enter again SHALL commit it as a drag's release does. Space, Escape,
Backspace or Delete SHALL abandon it. Ctrl with an arrow SHALL draw or
undraw the line that way and move the cursor along it. Shift with
an arrow SHALL set or clear the cross there and leave the cursor; with both
held the line is toggled and the cursor stays.

#### Scenario: A path traced by keys

- **WHEN** on a board with no line or cross Enter is pressed on a square, the
  right arrow twice, and Enter again
- **THEN** one move draws the two segments the cursor crossed

#### Scenario: A path abandoned

- **WHEN** Enter is pressed on a square, the right arrow twice, and then Space
- **THEN** no move is made, and the next Enter starts a new path
- **AND** Delete in place of Space does the same

#### Scenario: A modified arrow key marks the edge it points across

- **WHEN** the cursor is showing on a square and the player presses an arrow
  key toward a neighboring square, across an edge with no line or cross, with
  Ctrl held, or with Shift held
- **THEN** with Ctrl the move draws a line on the edge between the two squares,
  and with Shift it marks that edge with a no-line cross

### Requirement: Preferences: Pearl's appearance preference

The two appearance styles (traditional Masyu and loopy) SHALL be selectable via
an `appearance` preference (default traditional).

#### Scenario: A player who has set nothing

- **WHEN** the game is opened with no `appearance` preference stored
- **THEN** the board is drawn in the traditional style

### Requirement: Hint: One Pearl hint step is one premise of the solver's ladder

A hint step SHALL be one premise of the solver's ladder: a square read off its
own edges (one axis of a black pearl at a time), each of the four pearl rules,
an edge that would close a loop early, and a square state that would.

#### Scenario: A black pearl settled on both axes

- **WHEN** a black pearl's own edges settle an edge to its left or right and
  an edge above or below it
- **THEN** the step decides the edges to its left and right alone, and the
  others are a step of their own

### Requirement: Hint: A Pearl hint step rests only on edges and pearls

Every fact a hint step rests on SHALL be an edge the player has drawn or
crossed, or a pearl: before each firing, every square's possible shapes SHALL
be re-read from its pearl and its four edges, and a shape the ladder rules out
SHALL count only through the edges it settles at its own square in the same
step.

#### Scenario: A step rests on nothing the player cannot mark

- **WHEN** any firing of the hint's recording pass is taken
- **THEN** every square in the board it reasons from holds exactly the shapes its
  pearl and edges allow

### Requirement: Hint: A Pearl hint step asks for no cross the square already shows

A hint step SHALL NOT ask for a cross beside a square that already has its two
lines.

#### Scenario: An edge ruled out beside a full square

- **WHEN** a step's deduction rules out an edge of a square that already has
  two lines
- **THEN** the step does not ask the player to cross that edge

### Requirement: Hint: Pearl's hint draws a black pearl's arm whole

A hint step SHALL also draw, in the same step and the same move, every open
edge the pearls' rules carry on from the lines it draws, and from those in
turn: a line leaving a black pearl runs on through the next square, and a line
entering a white pearl leaves by the opposite edge.

#### Scenario: A black pearl's forced edge comes with its run-on

- **WHEN** a hint step decides that the edge beside a black pearl must be a line,
  and the far edge of the square past it is open
- **THEN** the step asks for both lines, and its sentence says the pearl's line
  must run that way through the next square

### Requirement: Hint: Pearl's hint names every line it carries on

Where a hint step draws a line the pearls' rules carry on, the black pearl's
own sentence SHALL say its line runs through the next square, and a step that
carries a line through a white pearl SHALL say so in a second sentence. No step
SHALL draw a carried line its sentence does not name.

#### Scenario: A line into a white pearl comes out the other side

- **WHEN** a hint step draws a line into a white pearl whose opposite edge is open
- **THEN** the step also asks for that opposite edge, and its explanation ends
  "It runs straight on through the next white pearl too."

### Requirement: Hint: Pearl's hint reads a square off its own edges

A step about one square SHALL conclude, from that square's pearl and edges
alone: a square with two lines takes no other; a line with one other way to go
on takes it; a square with no line and one open edge cannot use it; a black
pearl takes no line opposite one it has, and takes the edge whose opposite is
ruled out or off the board; a white pearl's line leaves by the edge opposite
the one it enters, and runs along the axis no edge of which is ruled out or
off the board.

#### Scenario: A white pearl on the board's edge

- **WHEN** a white pearl with no line sits in the top row
- **THEN** the step asks for the lines to its left and its right, and says its
  line must run along the board's edge

### Requirement: Hint: Pearl's hint reads a black pearl from the square past it

A step SHALL conclude that a black pearl's line carries on out of the far side
of the next square, outlining the pearl. It SHALL conclude that a black pearl
cannot point at a square that cannot run straight on, because that square
holds a black pearl, has a line off to the side, has its far edge ruled out,
or is at the board's edge, outlining that square and saying which.

#### Scenario: Two black pearls side by side

- **WHEN** the square beside a black pearl holds another black pearl
- **THEN** the step crosses the edge between them, outlines the second pearl's
  square, and says it holds a black pearl, which must turn

### Requirement: Hint: Pearl's hint reads a white pearl from the squares beside it

Where neither square beside a white pearl on one axis could turn into it, a
step SHALL run the pearl's line along the other axis, outlining those two
squares. Where a white pearl's line runs straight on through the square on one
side, a step SHALL make the square on the other side turn, by the line that
turns it or the cross that stops it running straight on, outlining the square
the line runs through.

#### Scenario: A white pearl whose line runs on to the right

- **WHEN** a white pearl's line runs straight through it and through the
  square to its right
- **THEN** the step decides an edge of the square to its left, and says the
  pearl turns on its other side

### Requirement: Hint: Pearl's hint rules out a loop that would close early

Where an edge would join the two ends of one stretch of line into a loop that
leaves something out, a step SHALL cross that edge. Where a square's one way
through would do so, the step SHALL cross its edges and say it stays empty,
and where a white pearl would do so along one axis, the step SHALL run it
along the other. The step SHALL outline the stretch of line, and say whether
the loop would miss a pearl or only other lines.

#### Scenario: A loop that would miss only lines

- **WHEN** an edge would close a stretch of line into a loop with every pearl
  on it, and another line is drawn elsewhere
- **THEN** the step crosses the edge and says the loop would miss other lines

### Requirement: Hint: Pearl's hint tries a square, then a pearl, then an early loop

At each step the hint SHALL take the first that fires of: a square read off
its own edges, a pearl read from the squares beside it, and, only where
neither fires anywhere, a loop that would close early, an edge before a
square. It SHALL apply no difficulty cap, so a board dealt at Easy and one
dealt at Normal are hinted in the same order.

#### Scenario: A loop rule waits for the plainer steps

- **WHEN** some square can be read off its own edges and some edge would also
  close a loop early
- **THEN** the step is the square's

### Requirement: Look: Pearl's mistakes draw apart from its error marks

The always-on error marks and the `findMistakes` overlay are distinct signals;
the overlay SHALL draw a flagged-mistake segment and a wrong cross in the
mistake color.

#### Scenario: A flagged cross is drawn as a mistake

- **WHEN** `findMistakes` has flagged a cross and the board is redrawn with the
  mistakes shown
- **THEN** that cross is drawn in the mistake color, and the other crosses are
  not

### Requirement: Look: Pearl previews a drag in progress

While a line drag is in progress, `redraw` SHALL preview it: the segments the
drag would add and the segments it would remove, each in its drag color.

#### Scenario: A drag in progress is previewed

- **WHEN** the board is redrawn while a line drag is in progress
- **THEN** the segments the drag would add and the segments it would remove are
  drawn in the drag colors

### Requirement: Look: Pearl draws its loop on the collection's quiet surface

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

### Requirement: Look: Pearl's pearls are the same black and white in both schemes

A black pearl and a white pearl SHALL be drawn in a black and a white that are
the same in both schemes. A white pearl on the loop SHALL be parted from it by
the pearl's black outline. A black pearl SHALL carry a rim in ink, so it stands
off the surface in the dark scheme.

#### Scenario: A black pearl reads on a fresh dark board

- **WHEN** a black pearl with no line through it is drawn in the dark scheme
- **THEN** its fill is black and its rim is ink, a light ring round it

### Requirement: Look: Pearl's keyboard cursor is brackets at its square's corners

The keyboard cursor SHALL be brackets at the corners of its square, which the
loop never crosses, and SHALL NOT fill the square.

#### Scenario: The cursor leaves the square's surface alone

- **WHEN** the keyboard cursor rests on a square
- **THEN** the square is the cell surface, with brackets at its corners
