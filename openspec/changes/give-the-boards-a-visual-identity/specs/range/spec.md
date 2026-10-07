## ADDED Requirements

### Requirement: Range draws a shaded cell as the collection's shaded piece

`redraw` SHALL draw the board as pieces on a quiet surface. A cell the player
has shaded (the state the other requirements call black, after upstream) SHALL
hold the collection's shaded piece, in its color and shape, inset on its cell.
A cell the player has marked as not shaded (the state they call white) SHALL
hold the collection's ruled-out dot and take no fill of its own, and an
undecided cell SHALL be the plain cell surface, so no state is told by a step
of gray. A clue cell SHALL sit on the lifted surface of a given, with its
number in ink. The line between cells and the frame round the grid SHALL be
the surface's grid line.

A cell in error SHALL keep its content and take a frame in the error color at
its edge, with a clue's number or a dot drawn in the error color; a shaded
piece keeps its own color. The completion flash SHALL lift every cell to the
given's surface on its lit beats, a step that reads in both schemes, and leave
the pieces standing. The keyboard cursor and every
hint mark SHALL be drawn at the cell's edge, beside the piece.

The game SHALL name no hue of its own: its hint sentences, its control words
and its hint-mark legend SHALL say the collection's word for the shaded color
and its word for a cell that is not shaded, and its help page SHALL name the
shaded color by placeholder.

#### Scenario: Three states on one surface

- **WHEN** a board holds a shaded cell, a cell marked not shaded and an
  undecided cell
- **THEN** all three are drawn on the same cell surface
- **AND** the first holds the shaded piece, the second the ruled-out dot and
  the third nothing

#### Scenario: A clue is told by the cell under it

- **WHEN** a board with a clue is drawn
- **THEN** the clue's cell is the lifted surface and no other cell is

#### Scenario: A shaded cell in error is still a shaded piece

- **WHEN** two orthogonally adjacent cells are both shaded
- **THEN** each holds a piece in the shaded color
- **AND** each cell is framed in the error color

#### Scenario: A hint says the word for the color the piece is drawn in

- **WHEN** a hint step concludes that a cell must be shaded
- **THEN** its sentence says the collection's word for the shaded color
- **AND** applying the step draws the shaded piece in the cell

## MODIFIED Requirements

### Requirement: Range provides an explained deduction hint

The `range` game SHALL implement `hint(state)` returning a plan-carrying,
narrated hint that explains *why* each move is forced (the fork's hint quality
bar), and `hintKeepTrack` so the plan auto-advances as the player follows it.
The hint SHALL refuse (a `{ ok: false }` result) when the board is already
solved or when `findMistakes(state)` is non-empty, since a deduction seeded
from contradictory marks would mislead. Otherwise it SHALL deduce, from the
player's current marks, the ordered sequence of forced cells (the remaining
no-recursion solution) and return one narrated `HintStep` per forced cell.
Each step's narration SHALL state the deduction that forces the cell — the
adjacent black square (a neighbor of a black must be white), a clue already
satisfied (its run must stop, so the next cell is black), a clue that would be
overrun (the cell must be black), a clue that can only reach its count one way
(the cell must be white), or a cut-vertex of the white region (it must be
white to keep the white cells connected). `hintKeepTrack` SHALL report
`"completed"` when the player's move sets the hinted cell to the hinted value
and `"off"` otherwise. `redraw` SHALL render the displayed step: the target
cell highlighted in the hint color with a preview of the forced mark, and the
deduction's **evidence shaded as an area** in a lighter hint color — the
clue's line of sight (satisfied/overrun), the run it must reach along (reach),
or the non-black cells a cut would isolate (connect) — so the shaded picture
the narration names is visible, not merely a single premise cell. A premise
that cannot take the area shade (an adjacent **black** square, which must stay
black) SHALL instead be **ringed** in the hint color. The shaded area SHALL be
computed against the board state as each step's deduction fires (the prior
steps applied), so the run grows as the player follows the plan, and SHALL
never include the target cell itself.

Independently of hints, `redraw` SHALL render a **known-white cell so that it
is told from an undecided one without a fill of its own**: a clue by the
lifted surface under it (clues are implicitly white), and a player white mark
by its dot, leaving an undecided cell the plain cell surface, so a beginner
reads determined state at a glance.

#### Scenario: Hint explains the next forced move

- **WHEN** `hint` is called on an unsolved, mistake-free generated board
- **THEN** it returns `{ ok: true }` with a non-empty list of steps
- **AND** the first step's move is a legal `executeMove` whose narration names
  the deduction (adjacency / clue / connectedness) that forces its cell
- **AND** applying every step's move in order solves the board

#### Scenario: Every hint step shows visible evidence

- **WHEN** `hint` returns a plan for a generated board
- **THEN** every step carries either a non-empty shaded area or a ringed black
  premise cell — never a bare conclusion — and no step's area contains its own
  target cell

#### Scenario: Hint refuses on a solved or mistaken board

- **WHEN** `hint` is called on a solved board, or on a board where the player
  has marked a cell contradicting the unique solution
- **THEN** it returns `{ ok: false }` with an explanatory error

#### Scenario: Following the hint advances the plan

- **WHEN** the player makes the move the current hint step describes
- **THEN** `hintKeepTrack` returns `"completed"`
- **AND** a move that sets a different cell, or the hinted cell to a different
  value, returns `"off"`
