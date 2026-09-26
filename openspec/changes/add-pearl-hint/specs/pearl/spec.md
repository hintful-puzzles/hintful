## MODIFIED Requirements

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

## ADDED Requirements

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
