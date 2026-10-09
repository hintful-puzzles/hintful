# magnets Specification

## Purpose
Magnets, the puzzle of filling each domino with a magnet or a neutral piece so
that no two like poles are orthogonally adjacent and each row and column meets
its clued pole counts: its description and params encodings, input that cycles
a domino's contents and marks clues done, mistake checking against the unique
solution, the two solver tiers, the board's look, and an explained hint whose
sentences and marks are read off the board.

## Requirements

### Requirement: What a Magnets board asks, and when it is solved

A Magnets board SHALL be a `w × h` grid of pre-laid 2×1 dominoes, solved when
each domino is either a magnet (one `+` cell and one `−` cell) or neutral (both
cells blank), no two orthogonally adjacent cells share a polarity, and each row
and column contains exactly its clue count of `+` and of `−` cells. A layout
SHALL be able to hold singleton squares, which are fixed and permanently
neutral.

#### Scenario: A filled board is solved

- **WHEN** every domino is set, every clue count is met and no two like poles
  touch
- **THEN** the game reports the board solved

### Requirement: Magnets' parameters

Params SHALL be `w`, `h`, `diff` (Easy or Normal) and `stripclues` (boolean),
encoded `{w}x{h}` with, in the full form, a `d{e|t}` difficulty suffix and an
`S` strip-clues suffix; a bare `{n}` SHALL decode as a square. `w` and `h`
SHALL each be declared bounded from 2 to 61, the largest count one description
character writes. `validateParams` SHALL refuse Easy unless `w ≥ 3` or
`h ≥ 3`, and Normal unless `w ≥ 5` or `h ≥ 5`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 9, diff: DIFF_TRICKY, stripclues: true }` (the
  Normal tier) are encoded in full
- **THEN** the result is `10x9dtS` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 4×4 grid at Normal difficulty
- **THEN** it returns a non-null error string (Normal needs a side ≥ 5)

### Requirement: Every Magnets preset size is offered at each tier

Each preset size, the largest included, SHALL be offered at Easy, at Normal,
and at Normal with stripped clues.

#### Scenario: The largest board is offered at Easy

- **WHEN** the preset menu is read
- **THEN** it holds a 9×10 Easy board beside the two 9×10 Normal ones

### Requirement: Magnets descriptions carry the clues and domino layout

The desc SHALL encode, comma-separated: the `w` column `+` counts, the `h` row
`+` counts, the `w` column `−` counts, the `h` row `−` counts (each a digit or
letter, or `.` for a stripped or absent clue), then a `w·h`-character row-major
string of domino orientations: `L`, `R`, `T` or `B` for the left, right, top or
bottom half of a domino, and `*` for a singleton square.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: A malformed Magnets description is refused

The game's reading of a desc SHALL refuse a short desc, a
character out of range, an inconsistent domino description (an end not pointing
back at its partner), and a count that exceeds its row's or column's size.

#### Scenario: A malformed description is rejected

- **WHEN** a desc whose domino ends are inconsistent is validated
- **THEN** it is refused with a non-null error string

### Requirement: Magnets input cycles domino contents and toggles clue aids

A left-click or `CURSOR_SELECT` on a domino cell SHALL cycle its content
empty → `+` → `−` → empty, setting the partner to the opposite polarity, and
SHALL refuse to start from a placed neutral. A right-click or `CURSOR_SELECT2`
SHALL cycle the whole domino empty → neutral → not-neutral (`?`) → empty, and
SHALL refuse to start from a magnet. A left-click on a border clue number SHALL
toggle that clue's "done" gray highlight, an aid tracked in the state that
never affects the win condition.

#### Scenario: The magnet cycle sets both domino ends

- **WHEN** the player left-clicks the left cell of a horizontal domino twice
- **THEN** after the first click that cell is `+` and its partner `−`, and
  after the second the cell is `−` and its partner `+`

#### Scenario: Clue-done toggle does not affect completion

- **WHEN** the player clicks a border clue number
- **THEN** that clue renders grayed and the board's solved status is unchanged

### Requirement: A Magnets singleton square takes no input

A click or cursor action on a singleton square SHALL do nothing.

#### Scenario: A singleton is clicked

- **WHEN** the player left-clicks or right-clicks a singleton square
- **THEN** no move is made and the board is unchanged

### Requirement: Magnets flags mistakes against the unique solution

Because a generated board is uniquely solvable, the game SHALL implement
`findMistakes`: re-solve from the dominoes and the row and column counts, and
return every player-set cell whose content contradicts the unique solution, and
every cell of a domino marked `?` that is neutral in it, since the hint reads a
`?` as a fact. Empty cells, and a `?` on a domino that is a magnet in the
solution, SHALL never be flagged; a board that is not uniquely solvable SHALL
yield no mistakes.

#### Scenario: A wrong placement is flagged

- **WHEN** the player sets a domino to a polarity the unique solution
  contradicts, without yet violating adjacency or a count
- **THEN** `findMistakes` includes that cell and Check & Save refuses to save

#### Scenario: A `?` on a neutral domino is flagged

- **WHEN** the player marks `?` on a domino that is neutral in the unique
  solution
- **THEN** `findMistakes` includes its cells, and the hint refuses until the
  mark is fixed

### Requirement: A Magnets mistake is drawn apart from the live errors

The renderer SHALL overlay the cells `findMistakes` flags distinctly from the
live error highlighting. That highlighting SHALL always be on, in red: two
touching identical poles, and a clue whose count is exceeded, or is short with
no undecided square left in its line.

#### Scenario: A live error needs no check

- **WHEN** the player places two `+` poles side by side
- **THEN** both are drawn as errors at once, with no mistake check asked for

### Requirement: Magnets grades boards with a tiered deductive solver

A generated board SHALL be solved by the solver at its own difficulty, and a
Normal board SHALL NOT be solved at Easy. The solver SHALL propagate a
deduction across a domino to its partner: a color excluded at one end excludes
the opposite color at the other.

#### Scenario: A generated board is uniquely solvable at its difficulty

- **WHEN** a board generated at difficulty `d` is solved from empty
- **THEN** the solver returns solved at `d`, and, for a Normal board, fails to
  fully solve it at Easy

### Requirement: The deductions of Magnets' Easy tier

The Easy tier SHALL perform: set-and-hold of the initial givens,
force-by-flags, the neutral deduction that neither end can be a magnet, the
row and column count-full pass (a color complete excludes it from the rest; the
remaining unset squares all needed sets them), and the odd-length-section
deduction.

#### Scenario: A met count clears its line

- **WHEN** a column already holds all the `+` its clue allows
- **THEN** the solver at Easy rules `+` out of the column's other squares

### Requirement: The deductions of Magnets' Normal tier

The Normal tier SHALL perform the Easy tier's deductions and additionally: the
advanced-full pass that counts the polarized dominoes lying in a row or column,
the single-neutral-left exclusion, and the two count-dominoes passes (all
remaining dominoes being magnets rules out neutral; a domino with one placeable
end has it set).

#### Scenario: Easy stops short of them

- **WHEN** the solver is run at Easy
- **THEN** none of the deductions the Normal tier adds is applied

### Requirement: Magnets renders under the web geometry

The canvas SHALL be `(w+2) × (h+2)` tiles: a one-tile clue margin on each side
and no border beyond it. The renderer SHALL draw the `+` and `−` clue counts on
all four borders (top: column `+`; bottom: column `−`; left: row `+`; right:
row `−`) with the corner `+` and `−` symbols.

#### Scenario: A board's canvas

- **WHEN** a 5×6 board is drawn at a tile size
- **THEN** its canvas is 7 tiles wide and 8 tiles high

### Requirement: What Magnets draws in a square

The renderer SHALL draw rounded-corner dominoes, the `+` and `−` magnet
symbols, the neutral cross, and the blue not-neutral `?`. A singleton square
SHALL be drawn as bare background, with no domino on it.

#### Scenario: A marked domino

- **WHEN** the player marks a domino `?`
- **THEN** each of its squares shows a blue `?`

### Requirement: Magnets offers an explained hint

Magnets SHALL implement `hint` as the recording projection of its graded
solver: the same ladder, run one firing at a time from the player's board, each
firing narrated with the premise that forced it. The hint SHALL start from the
player's placed dominoes and `?` marks.

#### Scenario: The hint finishes the board

- **WHEN** the player asks for hints on a fresh board of any preset and follows
  every step
- **THEN** the board is solved without a refusal

### Requirement: A Magnets firing the player can write is one journey of legs

A firing that places dominoes SHALL be one journey of placement legs, and one
that concludes dominoes cannot be neutral SHALL be one journey of legs that
mark them `?`, so every "cannot be neutral" fact a later step rests on is on
the board.

#### Scenario: Two dominoes found to be magnets

- **WHEN** one firing concludes that two dominoes cannot be neutral
- **THEN** the hint shows one journey of two legs, each marking one of them `?`

### Requirement: A Magnets firing the board already says is not shown

A firing that concludes only that a square cannot hold + or − SHALL advance the
plan without being shown, because the board already says it: every such fact
follows from a placed pole beside the square, a line whose count is met
(counting each marked magnet lying along it as one + and one −), or the same
fact about the domino's other end. A later step citing one SHALL name it in
those terms.

#### Scenario: A hidden fact is one the board shows

- **WHEN** the solver, run one firing at a time, rules + or − out of an
  undecided square
- **THEN** that square touches the same pole, lies in a line whose count for it
  is met counting marked magnets, or has a partner of which the same holds for
  the opposite pole

### Requirement: Following a Magnets leg through its press cycle keeps the plan

Following a leg through the game's own press cycle SHALL keep the plan: the
press on the way to the leg's value (a + before a −, neutral before a `?`)
SHALL hold the leg, and the press that lands it SHALL complete the leg.

#### Scenario: Placing a − through its cycle keeps the plan

- **WHEN** a leg asks for a − and the player presses the square once, making it
  a +
- **THEN** the leg is held, and the second press completes it

### Requirement: A Magnets count premise shows why the rest of its line is ruled out

A hint step whose premise counts the squares of a line still able to take a
pole SHALL name, in board terms, why each other empty square of that line
cannot take it: a + (or −) there would touch its own kind or overfill the
square's row or column, or its domino's other end would then hold the opposite
pole beside its own kind or one too many in a line. That line SHALL be named by
where it lies from the counted one: "this column", "the column beside it",
"a row".

#### Scenario: A met column beside the counted one

- **WHEN** the hint is asked of the 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` with its second
  column's bottom domino neutral
- **THEN** its first step says a + anywhere else in the third column would put
  one − too many in the column beside it

### Requirement: A Magnets count premise marks what rules each square out

The evidence of a hint step whose premise counts the squares of a line still
able to take a pole SHALL be the squares ruled out and what rules each out (the
placed pole it touches, or the met line's clue digit), not the rest of the
line. Its targets SHALL be only the squares that take the pole.

#### Scenario: The outlines of a count premise

- **WHEN** the hint is asked of the 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` with its second
  column's bottom domino neutral
- **THEN** its first step outlines the two dominoes ruled out and nothing else,
  and marks the second column's − clue as the reason

### Requirement: A domino along a counted Magnets line gives its far end's reason in its own leg

In a count premise's journey, a domino lying along the counted line SHALL say
in its own leg why its far end cannot take the pole, read off the board with
the journey's earlier legs placed. No earlier leg SHALL ring it before that
board forces it.

#### Scenario: A leg forced by the leg before it

- **WHEN** a count premise places a domino lying along its line whose far end
  loses the pole only to an earlier leg's placement
- **THEN** no step before that leg rings it, and its own step names the pole
  the earlier leg placed as the reason

### Requirement: A Magnets hint hatches the line its sentence names

A Magnets hint step whose sentence names a row or column SHALL hatch that line,
its squares and both clue slots, and SHALL hatch no other: a line premise
hatches the line it counts, and a step about a single domino hatches the one
line it names as "its row" or "its column" when it names exactly one.

#### Scenario: A count premise hatches its own column only

- **WHEN** the hint is asked of the 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` with its second
  column's bottom domino neutral
- **THEN** its first step hatches the third column and its clue slots, and no
  other line

### Requirement: A met Magnets line cited as a reason is marked by its clue digit

A met line a hint step cites only as a reason SHALL be marked by its clue digit
in the evidence color, never by an outline. The outlines of a hint step whose
sentence names a row or column SHALL each join a square only to its own
domino's other half.

#### Scenario: A cited column's clue

- **WHEN** the hint is asked of the 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` with its second
  column's bottom domino neutral
- **THEN** its first step colors the second column's − clue as a reason

### Requirement: A Magnets domino step gives each pole its own reason

A hint step about a single domino SHALL give, in its sentence, each pole the
reason that rules that pole out at that end.

#### Scenario: One end of a domino, both facts read through its partner

- **WHEN** a domino's end touches a + and lies in a column whose − clue is met,
  and the domino is concluded neutral
- **THEN** the step says the end touches a + and a − there would overfill its
  column, and hatches that column

### Requirement: Magnets calls its pieces tiles when a player reads about them

Every Magnets hint sentence and the Magnets help page SHALL call the two-square
piece a tile, and a filled one a magnet or a neutral tile; they SHALL NOT call it
a domino. A tile's halves SHALL be its ends or squares, and a tile marked `?` a
marked magnet. The code's names for the layout are not player vocabulary and are
outside this requirement.

#### Scenario: No sentence says domino

- **WHEN** every sentence the Magnets hint can speak is produced, at every value
  that changes its words
- **THEN** none contains "domino"

#### Scenario: The help page says tile

- **WHEN** the Magnets help page is read
- **THEN** it describes filling each tile with a magnet or a neutral tile, and
  never says "domino"

### Requirement: An undecided Magnets domino is the collection's cell surface

`redraw` SHALL fill a domino the player has not decided with the collection's
cell surface, so the board recedes and a decided domino is told by its pole
colors or its neutral color and never by a step of gray. The pole colors, the
neutral color and the `?` mark SHALL keep their colors, which the game names.

#### Scenario: An undecided domino is surface

- **WHEN** an opening board is drawn
- **THEN** every domino is filled with the cell surface

#### Scenario: A decided domino carries the color

- **WHEN** the player sets a domino to a magnet
- **THEN** its two squares are filled with the two pole colors
