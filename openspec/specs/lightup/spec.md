# lightup Specification

## Purpose
Light Up (Akari), the puzzle of placing bulbs to light every open square
without two bulbs lighting each other, meeting the counts on numbered walls.
It has live errors, mistake checking, an explained deductive hint drawn in the
element-type legend, and no tier below Unreasonable that requires guessing.

## Requirements

### Requirement: Light Up's parameters

Params SHALL be `w`, `h`, `blackpc` (the percentage of walls), `symm` (none,
2-way mirror, 2-way rotational, 4-way mirror or 4-way rotational, in that
order) and `difficulty` (Easy, Normal or Unreasonable). They SHALL be encoded
`{w}x{h}b{blackpc}s{symm}d{difficulty}` in full, and `{w}x{h}` in the short
form.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, blackpc: 20, symm: ROT2, difficulty: 1 }`
  are encoded in full
- **THEN** the result is `10x10b20s2d1` and decoding it round-trips the params

### Requirement: Light Up decodes params leniently

Decoding SHALL accept two forms beyond the full encoding. A params string that
names no symmetry SHALL demote a default of 4-way rotational symmetry to 2-way
rotational when `w ≠ h`. The legacy `r` flag SHALL decode as difficulty 2.

#### Scenario: Lenient decode quirks

- **WHEN** `18x10` is decoded with defaults carrying 4-way-rotational symmetry
- **THEN** the symmetry demotes to 2-way rotational
- **AND** a params string using the legacy `r` suffix decodes as difficulty 2

### Requirement: Light Up's params are validated

Params SHALL be refused when the width or the height is below 2, or when the
symmetry or the difficulty is not one of its listed values: the engine refuses
these from the game's `paramConfig`. `validateParams` SHALL refuse, of full
params, a `blackpc` outside 5 to 100, 4-way rotational symmetry on a grid that
is not square, either 4-way symmetry on a grid whose width and height are
both below 3, and a board too small for the tier asked for.

#### Scenario: Invalid params are rejected

- **WHEN** full params carry a 1-wide grid, a `blackpc` outside 5 to 100, or
  4-way rotational symmetry on a non-square grid
- **THEN** they are refused with a non-null error string

#### Scenario: 4-way mirror symmetry on a non-square grid

- **WHEN** `validateParams` is given a 5×7 grid with 4-way mirror symmetry
- **THEN** it does not refuse the symmetry

#### Scenario: A board too small for its tier

- **WHEN** full params ask for a 2×2 above Easy, a 3×3 at Normal under a 4-way
  symmetry, or at `Unreasonable` a board of fewer than 9 squares, a 3×3 under
  any symmetry or a 4×4 under a 4-way symmetry
- **THEN** they are refused, saying that no such puzzle is of that tier or
  that such puzzles are too rare to deal

#### Scenario: A board too small for its tier arrives written

- **WHEN** a game ID carries a 2×2 Normal board with its description
- **THEN** the params are accepted and the board loads

### Requirement: Light Up descriptions use the upstream run-length encoding

The desc SHALL encode the grid row-major, one character per wall
(`B` unnumbered, `0`–`4` numbered) with maximal runs of open squares
compressed as `a`–`z` (a run of 1 to 26). `validateDesc` SHALL reject unknown
characters, short descs and over-long descs.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an invalid character or a
  length not matching `w × h`
- **THEN** it returns a non-null error string

### Requirement: Light Up accepts pointer and cursor input

A left-click SHALL toggle a bulb on an open square that carries no mark, and a
right-click the impossible-mark on an open square that carries no bulb. A
click on a wall or outside the grid SHALL be a no-op. A left-click on a marked
square, and a right-click on a bulb, SHALL be rejected without a history
entry. A right-drag SHALL repeat the right-click on the squares it passes that held
what the pressed square held, and a left-drag SHALL repeat nothing, because a
row of bulbs light each other.

#### Scenario: Left-click places and toggles a bulb

- **WHEN** the player left-clicks an empty open square, then left-clicks it
  again
- **THEN** a bulb appears (lighting its row and column to the nearest walls)
  and then disappears

#### Scenario: Marks block bulbs

- **WHEN** the player left-clicks a square carrying an impossible-mark
- **THEN** no move is produced and no history entry is created

#### Scenario: A right-drag crosses a row

- **WHEN** the player right-drags across three empty open squares
- **THEN** all three carry the impossible-mark
- **AND WHEN** the player left-drags across three empty open squares
- **THEN** only the first holds a bulb

### Requirement: Light Up's keyboard cursor

The arrow keys SHALL move a cursor over the grid and reveal it. Select or
Enter SHALL toggle a bulb on the cursor's square, and select2 or `i` SHALL
toggle a mark there, under the same rejection rules as the two clicks.
Completing the board SHALL hide the cursor.

#### Scenario: The keyboard is refused where the click is

- **WHEN** the cursor is on a square carrying an impossible-mark and the
  player presses Enter
- **THEN** no move is produced and no history entry is created

### Requirement: A bulb and a mark exclude each other

In `executeMove` a bulb and an impossible-mark SHALL be mutually exclusive on
a square: placing a bulb SHALL clear any mark there, and placing a mark SHALL
remove any bulb there.

#### Scenario: A bulb placed over a mark

- **WHEN** a move places a bulb on a square that carries an impossible-mark
- **THEN** the square holds the bulb and no mark

### Requirement: Light Up is solved exactly while the grid is correct

Bulbs go on the open squares of a `w × h` grid. A bulb SHALL light its own
square and every open square along its row and its column, as far as the
nearest wall each way. The board SHALL be reported solved exactly while the
grid is correct: every open square is lit, no bulb is lit by another, and
every numbered wall has exactly that many orthogonally adjacent bulbs.

#### Scenario: A bulb lights its row and column

- **WHEN** a bulb is placed on an open square
- **THEN** every open square along its row and its column, as far as the
  nearest wall each way, is lit

#### Scenario: Completion is detected

- **WHEN** a move leaves every open square lit, no bulb lit by another, and
  every clue exactly satisfied
- **THEN** `status` reports the board solved and the solve-completion flash
  plays

### Requirement: Light Up ships findMistakes

The game SHALL implement `findMistakes(state)`: re-solve the clues to the
unique solution and flag every player bulb on a square the solution leaves
bulb-less (`kind: "light"`) and every impossible-mark sitting on a solution
bulb position (`kind: "mark"`). A board without a unique solution SHALL yield
`[]`. A flagged square SHALL render with a distinct error overlay that
repaints on the frame it is computed.

#### Scenario: Check & Save flags a wrong bulb

- **WHEN** `findMistakes` runs on a board with a bulb where the unique
  solution has none
- **THEN** that square is returned as a mistake and rendered with the mistake
  overlay on the next redraw

#### Scenario: A merely-unhelpful mark is not flagged

- **WHEN** a mark sits on a square the solution leaves empty
- **THEN** it is not reported as a mistake

### Requirement: Light Up ships an explained deductive hint

The game SHALL implement `hint()` returning a plan of narrated steps computed
by the game's own solver techniques from the player's current position,
honoring the bulbs and impossible-marks already placed.

#### Scenario: The plan completes deductive boards

- **WHEN** the plan is computed on any generated Easy or Normal board
- **THEN** following it step by step solves the board with no un-narrated step

### Requirement: A Light Up hint step names its technique and says why

Each step SHALL name its technique. Its narration SHALL lead with the
recognizable indication, state why the move is forced, and conclude in the
necessity voice. One deduction firing SHALL be one step: a clue firing that
forces several squares is one grouped multi-cell step.

#### Scenario: A forced bulb is explained

- **WHEN** the plan reaches a square with exactly one remaining way to be lit
- **THEN** the step's move places that bulb, and its narration names the
  unlit square and why every other candidate is gone, concluding with a
  necessity modal

#### Scenario: A satisfied clue groups its marks

- **WHEN** a clue already adjacent to its full bulb count has k > 1 free
  neighbors
- **THEN** one step emits one move marking all k squares impossible, narrated
  as a single deduction

### Requirement: Light Up narrates each of its deductive techniques

The narrated techniques SHALL cover at minimum: forced-light (an unlit square
with one remaining way to be lit), clue-satisfied (a full clue crossing out
its remaining neighbors), clue-saturated (a clue whose remaining bulbs equal
its remaining spaces), and the overlapping-set discount (a candidate square
that would extinguish every way to satisfy an unlit square or a clue).

#### Scenario: A saturated clue fills its neighbors

- **WHEN** a clue needs as many more bulbs as it has free neighbors
- **THEN** one step places a bulb on each of them, narrated from that clue

### Requirement: A hint step that rules a square out places the impossible-mark

A step that rules squares out SHALL emit the game's own impossible-mark move,
so that the marks a followed plan leaves on the board show the deductions
later steps rest on.

#### Scenario: A discounted square is crossed

- **WHEN** a discount step is applied
- **THEN** the square it rules out carries the impossible-mark, as if the
  player had right-clicked it

### Requirement: A partly followed hint step shrinks in place

`hintKeepTrack` SHALL classify a player's partial completion of a multi-cell
step as on-track, and SHALL shrink the step in place to the squares that
remain.

#### Scenario: One of three marks is placed by hand

- **WHEN** a step marks three squares impossible and the player marks one of
  them
- **THEN** the move is on-track and the step now marks the other two

### Requirement: A discount narration describes the set as the deduction counts it

A discount narration SHALL describe the set it discounts as the deduction
counts it. For an unlit square that set, of which one square must hold a bulb,
includes the square itself wherever a bulb could still go there. The display
marks it as the outlined dark square, apart from the other outlined squares,
so the sentence SHALL say which of the two it means. It SHALL state the
premise its conclusion needs, that one of those squares must hold the bulb,
and SHALL NOT leave the reader to supply it.

#### Scenario: A discounted square's narration counts every candidate

- **WHEN** a discount step's rule-out set contains the outlined dark square
  itself, so that only the remaining members are the other outlined squares
- **THEN** the narration names the dark square itself alongside the other
  outlined ones as a place the bulb could go, and does not attribute the whole
  set to the other outlined squares

### Requirement: Light Up hint rendering follows the element-type legend

The displayed hint SHALL highlight, not perform. Each target square SHALL be
ringed `COL_HINT` at its edge with no bulb or mark preview, so that a bulb or
a cross already on it stays visible. A bulb target and a mark target SHALL
look identical: the narration says which action it is.

#### Scenario: A target keeps its content

- **WHEN** a forced-light step is displayed
- **THEN** the target square is ringed `COL_HINT` with its content un-obscured

### Requirement: Light Up draws a hint's evidence by what it is

An evidence square no bulb lights SHALL be shaded `COL_HINT_CELL`. A lit one
SHALL keep its lit fill and take a doubled ring in `COL_HINT_LITERF`. The
unlit square the deduction is about SHALL take a doubled ring in
`COL_HINT_DARKREF`. The driving clue SHALL keep its white digit and be ringed
at its wall's edge in `COL_HINT_CLUE`, the collection's evidence color, with a
line in the digit's white inside the ring.

#### Scenario: Evidence is visible as an area

- **WHEN** a forced-light step is displayed
- **THEN** each unlit square of the corridor it reasons over, other than the
  target and the square the deduction is about, renders `COL_HINT_CELL`

#### Scenario: A hint step's marks stay inside its evidence

- **WHEN** any grouped clue step is displayed
- **THEN** every target square lies within the narrated clue's neighbor set

### Requirement: On an Unreasonable board the hint stops at the guess point

On a board of the `Unreasonable` tier the hint SHALL narrate the deductions
that remain from the player's position and SHALL refuse honestly at the guess
point, where none remains.

#### Scenario: Deduction runs dry

- **WHEN** a hint is asked for on an `Unreasonable` board where no narrated
  technique fires
- **THEN** it refuses, saying that deduction has run out

### Requirement: Light Up grades boards with a tiered deductive solver

Light Up's solver SHALL apply at Easy: forced-light (an unlit square with
exactly one remaining way to be lit takes that bulb) and the two clue
deductions (a satisfied clue marks its remaining neighbors impossible, and a
clue whose remaining lights equal its remaining spaces fills them). Normal
SHALL add the overlapping-set discount, and Unreasonable SHALL add recursion
to that.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at difficulty `d > 0` is solved
- **THEN** the solver succeeds with the difficulty-`d` technique set and fails
  (or needs recursion it is denied) with the difficulty-`d−1` set

### Requirement: Normal adds the overlapping-set discount

At Normal and above the solver SHALL test every set of which one square must
hold a bulb against candidate squares that would rule the whole set out,
marking such a candidate impossible. A set SHALL come from an unlit square, or
from each combination of `n−m+1` of a clue's `n` free neighbors where `m`
bulbs are still owed. The cheap deductions SHALL restart after the first
successful discount.

#### Scenario: A clue owing one bulb among three neighbors

- **WHEN** a clue has three free neighbors and one bulb still to place
- **THEN** its one set is all three neighbors, and a candidate square is
  marked impossible only when a bulb there would rule out all three

### Requirement: Unreasonable adds depth-capped recursion

At Unreasonable the solver SHALL additionally recurse, to a depth of at most
5. Where a unique solution is required, a branch that hits the depth limit
SHALL make the result "unknown".

#### Scenario: A board with two solutions

- **WHEN** a unique solution is required of a board that needs one guess and
  has a solution on each branch of it
- **THEN** the solver reports two solutions, so the board is not unique

### Requirement: Solve works from the player's position, then from the clues

`solve()` SHALL solve from the player's current position where that reaches a
solution, and from the clean clues where it does not. It SHALL NOT require
the solution to be unique.

#### Scenario: Solve recovers a solution from a dirty board

- **WHEN** `solve()` is invoked on a mid-game state containing wrong bulbs
- **THEN** it returns a move that leaves the board correctly and completely
  lit

### Requirement: Light Up generates solver-gated boards

The generator SHALL place walls symmetrically per the symmetry mode, SHALL
number every wall from a correct set of bulbs, and SHALL accept the grid only
when the solver solves it at the target difficulty. It SHALL then strip
numbers, keeping each removal only while the puzzle stays good, and SHALL
reject a board that is then still solvable one difficulty lower. Generation
from a given seed SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` is run twice for the same preset and seed
- **THEN** both runs produce the identical description

#### Scenario: A removal that breaks the puzzle is put back

- **WHEN** removing a number leaves the board unsolvable at the target
  difficulty
- **THEN** the number is restored

### Requirement: The generator adds walls when no board turns up

After 20 failed grids the generator SHALL add 5 to `blackpc` while it is below
90, and SHALL start again from the percentage asked for once it is not.

#### Scenario: A ramp from 20% reaches the top

- **WHEN** generation asked for at 20% walls has failed at every step up to
  90%
- **THEN** the next round of grids is built at 20% again

### Requirement: Light Up renders with live error feedback

A clue that is provably wrong (too many adjacent bulbs, or too few even if
every plausible neighbor were filled) SHALL sit on a disc in the full error
color, which stands off a wall in both schemes, with its digit in that color's
text color. A bulb that another bulb lights SHALL be a disc in the full error
color.

#### Scenario: Overlapping bulbs render as errors

- **WHEN** two bulbs light each other
- **THEN** both are drawn in the error color

#### Scenario: A wrong clue reads on its wall in the dark scheme

- **WHEN** a numbered wall has more adjacent bulbs than its clue
- **THEN** its number sits on a disc in the full error color, not that color's
  wash

### Requirement: Light Up draws walls, bulbs and light on the collection's quiet surface

`redraw` SHALL draw an open square no bulb lights as the collection's cell
surface, with the collection's surface grid line between squares and a frame
round the grid no heavier than that line. A lit square SHALL keep its yellow
wash. A wall SHALL be a solid block in the collection's wall color, over its
whole tile, so that adjacent walls read as one block.

#### Scenario: An unlit square is surface and a lit one is washed

- **WHEN** a board with one bulb is drawn
- **THEN** the squares the bulb lights are filled with the lit wash
- **AND** every other open square is the cell surface

### Requirement: A clue and a bulb are one white in both schemes

A numbered wall SHALL show its clue in a white that is the same in both
schemes. A bulb SHALL be a disc in that same white, outlined in a black that
is the same in both schemes, so that it reads on a lit and an unlit square
alike.

#### Scenario: A bulb in the dark scheme

- **WHEN** a board with a bulb and a numbered wall is drawn in the dark scheme
- **THEN** the bulb's disc and the clue's digit are the white they are in the
  light scheme, and the bulb's outline is the same black

### Requirement: The impossible-mark is the ruled-out cross

The mark for a square that cannot hold a bulb SHALL be the collection's
ruled-out cross. It SHALL be suppressed on a lit square when the
`show-lit-blobs` preference is off. That preference SHALL default to on.

#### Scenario: Lit blobs honor the preference

- **WHEN** a marked square becomes lit and `show-lit-blobs` is off
- **THEN** the cross is not drawn (and reappears when the preference is
  re-enabled)

### Requirement: Light Up's cursor and completion flash

The keyboard cursor SHALL be brackets at the corners of its square, clear of a
bulb. The completion flash SHALL have three phases and SHALL blink the lit
squares to the lifted surface.

#### Scenario: The cursor on a bulb

- **WHEN** the cursor is on a square that holds a bulb
- **THEN** the brackets are drawn at the square's corners and the bulb's disc
  is not overdrawn

### Requirement: Light Up's words call the square a wall

The game's words (its help page and its Custom dialog) SHALL call the square a
wall, and SHALL NOT call it a black square.

#### Scenario: The Custom dialog's percentage field

- **WHEN** the Custom dialog is opened
- **THEN** the field for `blackpc` is labeled as a percentage of walls
