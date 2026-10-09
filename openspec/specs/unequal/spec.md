# unequal Specification

## Purpose
Unequal (Futoshiki), the Latin-square puzzle whose clues between squares
constrain neighbors: greater-than signs in Unequal mode, and in Adjacent mode
bars on exactly the pairs of consecutive values. This spec holds the puzzle's
rules, its params and description formats, its controls and keypad, what its
generator promises, how its board looks, its mistake check, and its explained
deduction hint. What it shares with every note-taking game is in
`engine-notes`, `engine-hints` and `engine-candidate-hints`.

## Requirements

### Requirement: Unequal is a Latin square with clues between neighbors

Unequal SHALL be a Latin-square puzzle on an `order × order` grid: the player
places a number `1..order` in every cell so each row and column contains every
number exactly once, subject to clues between orthogonally adjacent cells. The
board SHALL be reported solved exactly while the filled grid satisfies every
row, column and clue constraint. The game SHALL provide `solve` and
`textFormat`, and SHALL NOT provide `statusbarText`.

#### Scenario: Entering the last correct number completes the board

- **WHEN** the player enters the final number that completes a correct grid
- **THEN** `status` reports the resulting state as solved

### Requirement: Unequal has two modes

The game SHALL support two modes. In **Unequal** a greater-than sign between
two cells means the number at its open end is greater than the number at its
pointed end. In **Adjacent** a bar between two cells means their numbers differ
by exactly 1, and the absence of a bar between two cells means they do not.

#### Scenario: A missing bar is a clue

- **WHEN** an Adjacent-mode grid is filled as a Latin square in which two
  neighboring cells with no bar between them hold 2 and 3
- **THEN** the board is not solved

### Requirement: Unequal's parameters and their encoding

Params SHALL be `order`, `mode` (Unequal or Adjacent), and `diff`, held as the
values `"trivial"`, `"easy"`, `"tricky"`, `"extreme"` and `"recursive"`. They
SHALL be encoded `{order}` with an `a` suffix for Adjacent mode and a `d{c}`
suffix for difficulty when full, `c` being `t`, `e`, `k`, `x` or `r` in that
order of the values.

#### Scenario: Params round-trip

- **WHEN** params `{ order: 5, mode: "adjacent", diff: "tricky" }` are encoded
  with `full = true`
- **THEN** the result is `5adk`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `5a`

### Requirement: Unequal's top tier is named Unreasonable and keeps its character

The five difficulty values SHALL be named Easy, Normal, Tricky, Hard and
Unreasonable, in the order of the values. The top tier SHALL be named
Unreasonable because it branches and backtracks, which is the one thing the
collection reserves that name for. Its difficulty character SHALL stay `r`, so
an existing game ID names the same board.

#### Scenario: The top tier keeps its difficulty character

- **WHEN** params at the top tier are encoded with `full = true`
- **THEN** the difficulty suffix is `dr`

### Requirement: Unequal refuses the parameters it cannot deal

The game SHALL declare its size's bounds as 3 to the largest value a candidate
mask holds (`MAX_CANDIDATE_VALUE`), and an order outside them SHALL be refused.
`validateParams` SHALL require a known difficulty, SHALL refuse an Adjacent
puzzle of Tricky difficulty or harder below order 5, and SHALL refuse, when a
board is to be dealt, an order of 3 at Tricky or Unreasonable, which no 3×3
board needs.

#### Scenario: Invalid params are rejected

- **WHEN** the params are checked with `order < 3` or an unknown difficulty
- **THEN** they are refused with an error string

#### Scenario: A small Adjacent puzzle has no upper tiers

- **WHEN** `validateParams` is called with an Adjacent puzzle below order 5 at
  Tricky or harder
- **THEN** it returns a non-null error string

### Requirement: Unequal descriptions encode per-cell numbers and adjacency flags

The desc SHALL encode the grid in scan order as one field per cell, each ending
in a comma: a decimal number (`0` for a blank cell) followed by zero or more of
the flag letters `U`, `R`, `D`, `L`, in that order, marking an adjacency clue
toward the up, right, down, or left neighbor.

#### Scenario: Description round-trips through generate and decode

- **WHEN** a board is generated and its desc decoded by `newState`
- **THEN** every given number is on the board and cannot be edited
- **AND** every adjacency flag is placed at its decoded cell
- **AND** every non-given cell starts empty with no pencil marks

### Requirement: A malformed Unequal description is refused

A desc SHALL be refused when it has the wrong number of cells, a number outside
`0..order`, a flag pointing off the grid, or contradictory flags: in Adjacent
mode a clue toward a neighbor requires the reciprocal clue back, and in Unequal
mode a `>` toward a neighbor forbids the reciprocal `>`. Every cell SHALL be
written out: a letter standing for a run of blank cells SHALL be refused.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with the wrong number of cells or a flag that points off the
  grid is validated
- **THEN** the result is a non-null error

#### Scenario: A bar flagged from one end only

- **WHEN** an Adjacent-mode desc flags a clue toward a neighbor that does not
  flag it back
- **THEN** the desc is refused as contradictory

### Requirement: Unequal generates uniquely-solvable boards at the target difficulty

`newDesc` SHALL deal a puzzle solvable at the chosen difficulty and not below
it. It SHALL NOT fall back to an easier difficulty: it
keeps looking, and a tier no board of the size needs is refused by
`validateParams` before a board is dealt. The result SHALL be uniquely
solvable.

#### Scenario: Generated board is unique and correctly graded

- **WHEN** a board is generated at a difficulty `d` in either mode
- **THEN** the solver solves it at difficulty `d`
- **AND** the solved grid is a valid Latin square satisfying every clue

### Requirement: An Adjacent board carries every bar

In Adjacent mode `newDesc` SHALL flag every adjacency the solution implies, so
that the absence of a bar is a clue, and only number givens are added and
stripped.

#### Scenario: An Adjacent board carries every bar

- **WHEN** a board is generated in Adjacent mode
- **THEN** a bar is flagged, from both ends, between every pair of neighboring
  cells whose solution values differ by exactly 1, and between no other pair

### Requirement: Unequal accepts digit, pencil, clue-spent, and solve moves

`interpretMove` SHALL select a cell by mouse (left button = real-entry
highlight, right button = pencil-mark highlight) or keyboard cursor. With a
cell highlighted, a digit `1..order` (entered as a digit, or a letter for 11
and above) SHALL place that number, or toggle the pencil mark in pencil mode,
and backspace, space, or below order 10 the `0` key, SHALL clear it. Entering a value a cell already
holds SHALL be a no-op. Immutable (given) cells SHALL reject entry.

#### Scenario: Entry into an immutable cell is rejected

- **WHEN** `interpretMove` would enter a digit into a given cell
- **THEN** it returns `null` (no move)

### Requirement: A clue is struck through by a click or a modified arrow

A click on a greater-than sign or adjacency bar in the gap between two cells,
or a shift/ctrl-cursor toward a neighboring clue, SHALL toggle that clue's
struck-through ("spent") state.

#### Scenario: Clicking a clue toggles its spent state

- **WHEN** the player clicks a greater-than sign or adjacency bar
- **THEN** `executeMove` toggles that clue's spent flag

### Requirement: The M key is Unequal's Mark-all

The `M`/`m` key SHALL be the Mark-all press. While some empty cell has no
pencil marks it SHALL fill every such cell with all candidate pencil marks.
On a board where every empty cell has notes it SHALL instead be the engine's
cleanup of the candidates a placed number in the cell's row or column rules
out.

#### Scenario: The first press fills

- **WHEN** the player presses `M` on a board with no pencil marks
- **THEN** every empty cell holds every candidate `1..order`

### Requirement: Unequal renders greater-than signs or adjacency bars between cells

`redraw` SHALL render the `order × order` grid with a gap between cells,
drawing, in Unequal mode, a greater-than sign in the gap pointing from the
larger toward the smaller cell of each inequality clue, and, in Adjacent mode,
a bar in the gap of each adjacency clue. Each clue SHALL be colored to
distinguish a normal clue, a currently-violated clue (red), and a
struck-through ("spent") clue.

#### Scenario: Unequal mode draws greater-than signs

- **WHEN** the initial frame of a generated Unequal-mode board is rendered
- **THEN** a greater-than polygon is drawn in the gap of each inequality clue

#### Scenario: Adjacent mode draws adjacency bars

- **WHEN** the initial frame of a generated Adjacent-mode board is rendered
- **THEN** an adjacency bar is drawn in the gap of each adjacency clue

### Requirement: Unequal draws a cell's number or its pencil marks

Filled cells SHALL show their number, colored to distinguish given,
user-entered, and error cells. Empty cells SHALL show their pencil marks in an
auto-sized grid layout.

#### Scenario: A duplicate is drawn as an error

- **WHEN** the player enters a number its row already holds
- **THEN** the entered number is drawn in the error color, and a given is still
  drawn in the color of a given

### Requirement: Unequal exposes pencil-mark preferences

The game SHALL offer a "sticky pencil mode" preference (default on: right-click
toggles a persistent pencil mode), an "auto-pencil" preference (default off:
when on, placing a number strikes it from the pencil marks of its row and
column), and a "keep mouse highlight after changing a pencil mark" preference
(default on). With auto-pencil off, note cleanup SHALL be manual: the player
removes obvious candidates via the mark-all control or a hint.

#### Scenario: Sticky pencil mode persists across left-clicks

- **WHEN** sticky pencil mode is on and the player right-clicks to enter pencil
  mode, then left-clicks another empty cell
- **THEN** the new cell is highlighted for pencil entry (the mode is not reset)

#### Scenario: A placement with auto-pencil off

- **WHEN** the player places a number with auto-pencil off
- **THEN** the pencil marks of the other cells in its row and column are left
  as they were

### Requirement: Unequal checks for mistakes against the unique solution

`findMistakes` SHALL re-solve the board from its givens and clues, never from
the player's notes, and return every player-entered cell whose number
contradicts the unique solution, plus every empty cell whose non-empty pencil
notes have crossed out its solution value. When the board is not uniquely
solvable from the givens it SHALL return an empty result.

#### Scenario: A wrong number is flagged, ordinary notes are not

- **WHEN** the player enters a number that contradicts the unique solution
- **THEN** `findMistakes` includes that cell
- **AND** a cell carrying notes that still include its solution value is never
  included

#### Scenario: An ambiguous board

- **WHEN** `findMistakes` is asked about a board whose givens and clues admit
  two solutions
- **THEN** it returns an empty result, whatever the player has entered

### Requirement: Unequal provides an explained deduction hint

The game's hint SHALL teach the player the next deduction in pencil-notes
terms.
It SHALL work in a sound candidate cube seeded from the placed givens and
entries only, never from the player's pencil notes: a note can be wrong, and
that is what `findMistakes` flags.

#### Scenario: An inequality bound is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled Unequal-mode board
  where a greater-than clue rules a value out of one of its two cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the narration names the greater-than relationship and the bounding
  cell's smallest/largest possible value, concluding in the necessity voice

#### Scenario: An adjacency clue is taught in Adjacent mode

- **WHEN** the player asks for a hint on a fully-penciled Adjacent-mode board
  where a bar (or its absence) beside a filled cell rules a value out of the
  neighbor
- **THEN** the hint returns a `pencilStrike` step clearing those candidates, the
  narration stating that the two numbers must (or must not) differ by exactly one

### Requirement: The hint prefers a single, then a strike, then a placement

At each step the plan SHALL prefer a naked single, an empty cell whose live
notes have collapsed to a single candidate, placed via a `set` move. Failing
one it SHALL take the basic Latin eliminations a given or placed value implies
in its row and column, struck via `pencilStrike`. Failing those it SHALL take
the next clue elimination, and failing that a forced placement of a cell whose
sound candidates have collapsed to one.

#### Scenario: A naked single comes before any elimination

- **WHEN** a hint is asked on a fully-penciled, mistake-free board where one
  cell's notes have been narrowed to its solution value
- **THEN** the first step places that value there with a `set` move

### Requirement: A clue elimination is one firing of one clue

A clue elimination SHALL be the Unequal-mode greater-than "link" bound
deduction or the Adjacent-mode differ-by-1 deduction: a single technique
firing, striking the candidates it rules out of one cell by one `pencilStrike`
move. One recorded firing (one inequality link, or one cell and direction of an
adjacency clue) SHALL map to exactly one `group`, so a hint step never mixes
clues.

#### Scenario: A strike step stays in its narrated cell

- **WHEN** a clue elimination's step is built in either mode
- **THEN** every mark its `pencilStrike` clears lies in one cell, and that cell
  is one of the two the clue sits between

### Requirement: A firing that forces several strikes is one journey

A single firing forcing several strikes SHALL be one journey, its continuation
legs flagged `continuesPrevious`.

#### Scenario: Both ends of a link

- **WHEN** on a fully-penciled board one greater-than link rules values out of
  both of its cells
- **THEN** the two strikes are consecutive steps, the second flagged
  `continuesPrevious`

### Requirement: The hint starts on the implicit reading

Unequal's `newUi` SHALL state the implicit reading of an unmarked cell, because
a sign strikes from one cell at a time.

#### Scenario: A hint on a board with no notes

- **WHEN** a hint is asked, under the game's own default reading, on a board
  with no pencil notes
- **THEN** no step is the fill-all move

### Requirement: Unequal's hint narration meets the hint quality bar

Each step SHALL carry a narration meeting the hint quality bar: leading with
the spotted indication (the inequality or adjacency pattern), then the
reasoning, then a necessity-voice conclusion, "must cross out the N" for an
elimination and "can only be N" for a placement. It SHALL
read correctly at the degenerate value extremes: the differ-by-1 clue SHALL
speak of being one away from N and SHALL NOT say "N−1 or N+1".

#### Scenario: A bound at the edge of the range

- **WHEN** a greater-than clue strikes 1 from its larger cell while the cell
  across it can still be 1
- **THEN** the narration says the larger side cannot hold the smallest number,
  and does not say the other cell is "at least 1"

### Requirement: A hint's marks ring the struck cell and outline the clue's pair

A clue elimination's step SHALL ring the cell it strikes from and outline the
two cells its sign or bar sits between, and SHALL show every candidate it rules
out with a line through it. Equivalent strikes of one firing SHALL share the
target hint color.

#### Scenario: A link elimination is drawn

- **WHEN** an Unequal-mode link elimination is the displayed step
- **THEN** the clue's two cells are outlined, the struck cell is ringed, and the
  struck candidates are drawn with a line through them

### Requirement: The hint's deduction is capped below recursion

The deduction SHALL be capped below recursion, because a guess is not a
teachable note strike.

#### Scenario: An Unreasonable board

- **WHEN** a hint is asked on a board dealt at Unreasonable
- **THEN** the recording solver runs no higher than Hard, and no step rests on a
  guess

### Requirement: Every hint step is monotone progress

Every step SHALL be monotone progress, a note added by populate, a note removed
by a strike, or a cell filled by a placement, never undone by the hint. A
freshly recomputed hint from any solvable, mistake-free mid-game position SHALL
therefore make progress and lead to a solved board, and on recompute the plan
SHALL skip any operation already reflected on the board.

#### Scenario: The hint resumes from a self-played mid-game position

- **WHEN** a hint is requested from a solvable, mistake-free board the player
  reached by their own notes and placements, in either mode
- **THEN** the freshly-recomputed hint makes progress and, applied step by step
  with recompute, leads to a solved board

### Requirement: A kept plan follows the player's own move

`hintKeepTrack` SHALL advance the plan when the player's move matches the
displayed step's intent: a pencil toggle clearing one of a strike step's marks
is `onTrack` (the step shrinks in place), or `completed` when it was the last,
a `pencilStrike` of all the step's marks is `completed`, and a placement of the
hinted value is `completed`. Any other move SHALL drop the plan (`off`).

#### Scenario: A strike followed one mark at a time

- **WHEN** the player clears one of a two-mark strike step's marks with a
  pencil toggle
- **THEN** the verdict is `onTrack` and the step shrinks to the mark left
- **AND** clearing that one is `completed`

### Requirement: Unequal provides on-screen key labels

Unequal SHALL implement `requestKeys(params)` returning one button per grid
value `1..order` followed by a clear key (button code `8`, labeled `"Clear"`),
in both the Unequal and Adjacent modes. Each value button's label SHALL be its
own character.

#### Scenario: The keypad covers the grid's digits plus clear (order < 10)

- **WHEN** the key labels are requested for an order-4 Unequal board
- **THEN** the result is the buttons `1,2,3,4` followed by a clear key

### Requirement: The keypad is zero-based from order 10

The value-to-button mapping SHALL depend on the order, so it does not come from
the shared `digitKeys` helper the other digit games use. For `order < 10` the
buttons SHALL be `'1'..'9'`, value `v` being the character `'0' + v`. For
`order ≥ 10` the keypad SHALL be `'0'`-based: `'0'..'9'` cover values `1..10`
and `'a'`, `'b'` and so on cover `11..order`.

#### Scenario: The keypad is '0'-based for order ≥ 10

- **WHEN** the key labels are requested for an order-11 Unequal board
- **THEN** the result is the buttons `0,1,…,9,a` (values 1..11) followed by a clear key

### Requirement: Unequal draws its boxes as quiet surfaces, with a given's lifted

`redraw` SHALL draw each cell as its own box, apart from its neighbors, on the
collection's cell surface, and a box holding a given number on the collection's
lifted surface of a given, so that a given is told by the box under it as well
as by its ink. A box's outline SHALL be the collection's surface grid line. The
signs and bars between boxes are clues and SHALL keep their own colors, drawn
on the board between the boxes.

#### Scenario: A given is told by the box under it

- **WHEN** a board with given numbers is drawn
- **THEN** each given's box is the lifted surface
- **AND** every other box is the cell surface, outlined in the surface grid line

### Requirement: The selection is drawn over the box and the hint's marks beside it

The selection's wash and its pencil-mode corner SHALL be drawn over whichever
surface the box has. The hint's marks SHALL stay in the gap beside the box.

#### Scenario: A selected box a hint rings

- **WHEN** an empty box is selected for an entry while a hint rings it
- **THEN** the wash fills the box, and the ring is drawn in the gap around it
