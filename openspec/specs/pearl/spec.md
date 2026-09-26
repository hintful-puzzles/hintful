# pearl Specification

## Purpose
Pearl (Masyu), the puzzle of drawing one closed loop through square centers that
turns at every black pearl but not in the squares either side of it, and runs
straight through every white pearl with a turn in at least one square beside it.
This capability specifies its port to the TS engine: the deductive solver and
the generator gated on it by default, completion and mistake reporting, and its
input and rendering.

## Requirements

### Requirement: Pearl descriptions use the upstream run-length encoding

The desc SHALL encode the clue grid row-major as a run-length string: lowercase
letters compress runs of unclued cells, `B` marks a black pearl and `W` marks a
white pearl. `validateDesc` SHALL reject an unknown character and a description
whose decoded cell count does not exactly fill the grid. `newState` SHALL parse
the desc into the immutable clue grid, with the loop lines and no-line marks
initially empty.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with too much or too little data to
  fill the grid
- **THEN** it returns a non-null error string

### Requirement: Pearl reports completion and mistakes

The game SHALL compute completion and always-on error marks by
`check_completion`'s rules — a union-find loop classification flagging squares of degree
greater than two, non-reciprocal links, and clue contradictions, and setting the
completed flag only when the lines form one closed loop satisfying every clue.
Because boards are uniquely solvable by default, the game SHALL implement
`findMistakes`: re-solve from the clues to the unique solution's line grid and
return every line segment the player has drawn that the solution does not contain,
and every no-line cross the player has placed on an edge the solution does contain
(each a definite mistake); a *missing* solution segment is not a mistake, and a board
that is not uniquely solvable (a `nosolve` board) yields no mistakes. Check & Save
depends on this hook and SHALL refuse to save while any mistake is present. The
always-on error marks and the `findMistakes` overlay are distinct signals; the
overlay SHALL draw a wrong cross in the mistake color.

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

### Requirement: Pearl input and rendering

`interpretMove` SHALL support drawing the loop by dragging along grid edges
(committing the traced path as a sequence of line-segment flips, respecting
existing no-line marks as barriers and the loop-closure degree rule), marking
"no-line" crosses with the secondary (right) drag, and a keyboard cursor that
draws lines or marks with modifiers; a drag or click that changes nothing SHALL
produce no move; laying a line over a mark SHALL be rejected. The game SHALL
decline the `H` key, so the app's Next hint shortcut reaches it; upstream's
in-place autosolve move SHALL still replay from a saved game. `redraw` SHALL
render the grid in the selected appearance style (traditional square outlines, or
loopy center-dots plus inter-cell grid), the black and white pearls, the no-line
crosses, the loop segments (with the drag preview and error recoloring), the
flagged-mistake segment color, the displayed hint step, and the completion flash.

#### Scenario: A drag draws a loop path

- **WHEN** the player left-drags along a sequence of grid edges
- **THEN** `interpretMove` yields a move whose execution sets those loop segments

#### Scenario: A no-op drag yields no move

- **WHEN** the player drags or clicks in a way that would change no segment or
  mark
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

### Requirement: Pearl game is registered and implements the Game interface

The engine SHALL provide a registered `pearl` game implementing
`Game<PearlParams, PearlState, PearlMove, PearlUi, PearlDrawState, PearlMistake>`:
draw a single closed loop through grid cells so that it turns a right angle at
every black pearl (and goes straight through at least one cell on each side of
it) and passes straight through every white pearl (turning immediately before or
after). Params SHALL be `w`, `h`, `difficulty` (Easy or Normal) and `nosolve`
(allow an unsoluble board, default false), encoded `{w}x{h}` with a full-form
`d{char}` difficulty suffix and an `n` suffix when `nosolve` is set.
`validateParams` SHALL enforce `w ≥ 5`, `h ≥ 5`, that width×height does not
overflow, and that a Normal board has `w + h ≥ 11`. Eight presets
(6×6, 8×8, 10×10, 8×12 each at Easy and Normal; upstream's 12×8 turned to draw
taller than wide) SHALL be offered. The game SHALL provide `solve` and `textFormat`, and SHALL drive a
completion flash suppressed after Solve. The two upstream appearance styles
(traditional Masyu and loopy) SHALL be selectable via an `appearance`
preference (default traditional).

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, difficulty: DIFF_TRICKY, nosolve: false }` (the
  Normal tier) are encoded in full
- **THEN** decoding the result round-trips the params

#### Scenario: The Normal tier requires a large enough board

- **WHEN** `validateParams` is given a Normal board with `w + h < 11`, or any
  board with `w < 5` or `h < 5`
- **THEN** it returns a non-null error string

### Requirement: Pearl ports the deductive solver and solver-gated generator

The port SHALL implement `pearl_solve` as pure iterative constraint propagation
(no guessing or recursion) over the edge/square workspace: edge↔square
elimination, the black-pearl and white-pearl clue deductions, and shortcut-loop
detection over a union-find, with the Normal tier additionally applying the
premature-short-loop rules. It SHALL return the three-valued verdict
(inconsistent / unique / ambiguous), and a grading routine SHALL return the
easiest difficulty that yields a unique solution. The generator SHALL build a
random loop via the shared `generateLoop` (biased toward black-pearl corners),
derive a maximal clue set, gate on the solver finding a unique solution at the
requested difficulty (and failing one tier easier), then greedily minimize the
clues, generating a 5×5 Normal request at Easy. `solve` SHALL return
the generator's aux when present, else re-solve from the clues.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated with `nosolve = false` and graded by the TS solver
- **THEN** the grading is a unique solution at exactly the requested difficulty

### Requirement: Pearl's solver is a certified deduction ladder

Pearl's solver SHALL run its deductions as a `runDeductionFixpoint` ladder of five
rungs: square shapes from known edges, edges from surviving shapes, the pearl clue
deductions, and a closed-loop rung, all at Easy; and the shortcut-loop rule at
Tricky. The closed-loop rung SHALL end the ladder through `settled` once a loop has
closed and everything off it is blank. The solver SHALL keep upstream's hand-written
loop as an oracle only a test calls. A ladder-equivalence test SHALL prove, over
generated boards at both tiers, that the ladder leaves the same verdict and the same
workspace as the oracle at both caps. The workspace is every square's surviving
shapes and every edge. The test SHALL also carry a firing census asserting that
every rung fires on the corpus.

#### Scenario: A silenced rung fails

- **WHEN** any rung is removed from the ladder
- **THEN** the ladder-equivalence test or the frozen differential fails

#### Scenario: A mis-tiered shortcut rung fails

- **WHEN** the shortcut-loop rung is declared at Easy
- **THEN** boards that need it pass as Easy, and the frozen differential fails

### Requirement: Pearl explains the next deduction

The game SHALL implement `hint` as a recording projection of its own solver
ladder, one premise per step: a square read off its own edges (one axis of a
black pearl at a time), each of the four pearl rules, an edge that would close a
loop early, and a square state that would. Every fact a step rests on SHALL be an
edge the player has drawn or crossed, or a pearl: before each firing, every
square's possible shapes SHALL be re-read from its pearl and its four edges, and
a shape the ladder rules out SHALL count only through the edges it settles at its
own square in the same step. A step SHALL NOT ask for a cross beside a square that
already has its two lines. Each step SHALL name why its edges are forced, in one
sentence of at most 120 characters, draw each decided edge in the hint's action
color as the line or cross it asks for, and outline the squares it reasons from.
The hint SHALL refuse on a solved board and while `findMistakes` reports anything.
`hintKeepTrack` SHALL judge a move by the edges it changes, holding a step whose
edges are only partly made and shrinking it to what is left.

#### Scenario: Following the hint finishes a board

- **WHEN** a generated board at either tier is played by repeatedly taking the
  first step of a fresh hint
- **THEN** the board is completed, and every line a step asked for is in the
  solution and every cross is not

#### Scenario: A step rests on nothing the player cannot mark

- **WHEN** any firing of the hint's recording pass is taken
- **THEN** every square in the board it reasons from holds exactly the shapes its
  pearl and edges allow

#### Scenario: A wrong cross is refused

- **WHEN** the player has crossed out an edge the solution uses and asks for a hint
- **THEN** the hint refuses and asks for the highlighted mistakes to be fixed first
