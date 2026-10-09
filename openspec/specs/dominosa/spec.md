# dominosa Specification

## Purpose
Dominosa, the puzzle of tiling a grid of numbers with dominoes so that every
pairing, doubles included, appears exactly once: its rules, its params and
description encodings, its controls, what each tier's solver may use, its
explained deductive hint, its domino reference with a spotlight on where a
pair can go, and the decisions about how its board is drawn.

## Requirements

### Requirement: Dominosa tiles a grid of numbers with one of every domino

The puzzle SHALL be to partition a grid of numbers, each `0…n`, into 2×1
dominoes so that the placed dominoes are exactly the
`DCOUNT(n) = (n+1)(n+2)/2` distinct number-pairs `0-0 … n-n`, one of each,
with every domino's two numbers matching the underlying clues. The grid SHALL
be `n+1` wide and `n+2` tall when `tall` is set, and `n+2` wide and `n+1` tall
when it is not.

#### Scenario: A board that is not tall is the wide one

- **WHEN** a board is built for `n = 6` with `tall` false
- **THEN** it is 8 squares wide and 7 tall

### Requirement: Dominosa params are the highest number, a tier and the tall flag

Params SHALL be `n` (maximum face number, default 6), `diff` (Easy / Normal /
Tricky / `Unreasonable`) and `tall`, encoded `"{n}"`, then `"t"` when `tall`,
with a full-form `"d{t|b|h|e}"` difficulty suffix. An encoding without the
`"t"` SHALL decode as the wide board, so that an id with no `"t"` in it names
the board its desc was laid out for.

#### Scenario: Params round-trip

- **WHEN** params `{ n: 6, diff: DIFF_HARD, tall: false }` (the Tricky tier)
  are encoded in full
- **THEN** the result is `"6dh"` and decoding it round-trips the params

#### Scenario: An id without the tall flag loads as the wide board

- **WHEN** a params string without a `t`, such as `"6db"`, is decoded
- **THEN** `tall` is false and the board is `n+2` wide and `n+1` tall
- **AND** encoding the result in full gives back `"6db"`

#### Scenario: The default board is dealt tall

- **WHEN** the default params are encoded in full
- **THEN** the result is `"6tdb"` and the board is 7 wide and 8 tall

### Requirement: The fourth Dominosa tier is named Unreasonable and keeps its character

The fourth tier SHALL be named `Unreasonable`, because its forcing-chain
deduction is a search over a closure of all placements, and its difficulty
character SHALL be `"e"`.

#### Scenario: The fourth tier keeps its difficulty character

- **WHEN** params at the fourth tier are encoded in full
- **THEN** the suffix is `"de"`, so a game ID that says `"de"` names the same
  board whatever the tier is called

### Requirement: An id asking for an unchecked board names no tier

The difficulty suffix `"da"` and the bare `"a"` that upstream writes, which ask
for a board not checked for a unique solution, SHALL name no tier, so the
default tier stands.

#### Scenario: An ambiguous-board id decodes to the default tier

- **WHEN** `"6da"` is decoded
- **THEN** `diff` is the default tier, Normal, and the params are valid

### Requirement: Dominosa refuses params outside its bounds

Params with `n` below 1 SHALL be refused. `validateParams` SHALL enforce the
bound on `n` that keeps the grid's area from overflowing, and SHALL refuse in
full form a tier above Easy at `n = 1` and a tier above Normal at `n = 2`,
which no board of that size reaches.

#### Scenario: Invalid params are rejected

- **WHEN** params with `n = 0` are checked
- **THEN** they are refused with a non-null error string

#### Scenario: A tier the smallest set cannot reach is refused

- **WHEN** params with `n = 1` at Normal are checked in full form
- **THEN** `validateParams` returns a non-null error string

### Requirement: Dominosa descriptions carry the clue grid

The desc SHALL be a row-major string of the `w·h` clue numbers, each rendered as
a single digit or, for a number ≥ 10, as `[NN]` in decimal. `validateDesc`
SHALL reject a desc that is too short or too long, a number out of the range
`0…n`, a missing `]`, and a clue grid in which any number `0…n` does not occur
exactly `n+2` times.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and its numbers re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc whose number balance is wrong
- **THEN** it returns a non-null error string

### Requirement: Dominosa input places dominoes and barrier edges

A left-click or `CURSOR_SELECT` between two adjacent clue numbers SHALL toggle a
domino covering them, erasing any dominoes or barrier edges that overlap the new
placement. A right-click or `CURSOR_SELECT2` between two adjacent *empty*
squares SHALL toggle a barrier edge, an annotation that never affects the win
condition and is forbidden next to any placed domino.

#### Scenario: Placing a domino erases an overlapping one

- **WHEN** a domino is placed on a square already covered by another domino
- **THEN** the previously overlapping domino is removed and the new one placed

#### Scenario: A barrier edge cannot be drawn next to a domino

- **WHEN** the player right-clicks an edge one of whose squares is part of a
  placed domino
- **THEN** no edge is toggled

### Requirement: A right-click on a number or a digit key toggles a value highlight

A right-click on a clue number, or a digit key, SHALL toggle that number in one
of two value-highlight slots, a UI-only solver aid.

#### Scenario: A digit key clears the highlight it set

- **WHEN** a number is highlighted and its digit key is pressed again
- **THEN** its slot empties and no move is made

### Requirement: The Dominosa keyboard cursor walks the half-grid

Cursor keys SHALL move a half-grid keyboard cursor over the
`(2w−1) × (2h−1)` lattice of squares, gaps and edges.

#### Scenario: The cursor can rest on an edge between two squares

- **WHEN** the visible cursor is at a lattice position with exactly one odd
  coordinate
- **THEN** it is on the edge between two squares, where `CURSOR_SELECT`
  toggles a domino covering the two

### Requirement: Dominosa detects completion

The game SHALL mark the board completed when the placed dominoes cover every
square as the full set of `DCOUNT(n)` distinct number-pairs with no repeated
value.

#### Scenario: The last domino of the set completes the board

- **WHEN** every other domino of the set is in place and the player places
  the one still missing
- **THEN** the board is completed

### Requirement: Dominosa flags a domino the unique solution lacks

The game SHALL implement `findMistakes`, since a generated Dominosa board is
uniquely solvable: re-solve to the unique solution and return both cells of
every player-placed domino the solution does not contain. A board that is not
uniquely solvable SHALL yield no mistakes, and blank squares and barrier edges
SHALL never be flagged.

#### Scenario: A wrong placement is flagged

- **WHEN** the player places a domino that the unique solution does not contain
- **THEN** `findMistakes` includes both its cells and Check & Save refuses to
  save

### Requirement: A flagged cell is drawn distinctly from a clash

The renderer SHALL overlay flagged cells distinctly from the always-on red
**clash** highlight, which marks a domino value placed more than once.

#### Scenario: A mistake overlay repaints on a later frame

- **WHEN** a domino is drawn, then `findMistakes` flags it on a subsequent frame
  without the cell's own value changing
- **THEN** the mistake overlay is painted on that later frame

### Requirement: Dominosa provides an explained deductive hint

The `dominosa` game SHALL implement `Game.hint(state)`, returning a narrated
plan computed from the player's current board by running the deductive solver
one firing at a time, seeded from the placed dominoes. Each step SHALL carry a
forced move and an explanation of *why* it is forced.

#### Scenario: The plan solves the board from any mid-game position

- **WHEN** a non-mistaken board that needs no forcing chain is advanced by
  applying one freshly-recomputed hint step at a time
- **THEN** every step makes progress and the board reaches solved

### Requirement: A placement step places a domino that has one spot left

A hint step SHALL be a **placement** step when a domino has exactly one
remaining spot, its move placing that domino there, or when a square has only
one neighbor left to pair with.

#### Scenario: A placement hint names the forced domino and explains why

- **WHEN** a domino has exactly one remaining spot on the current board
- **THEN** the next hint step's move places that domino and its explanation
  states, in the necessity voice, that it is the only spot left

### Requirement: A barrier step draws the edge a technique rules out

A hint step SHALL be a **barrier** step when a deductive technique proves a
spot cannot hold a domino, and its move SHALL draw that barrier edge. The step
SHALL be narrated by the technique: a square that can be part of only one
domino, must-overlap, either duplicate-forcing deduction, odd-region parity, or
set analysis.

#### Scenario: A parity barrier says why the spot is ruled out

- **WHEN** a domino on a spot would split the empty squares into odd-sized
  regions
- **THEN** the step's move draws the barrier edge on that spot and its
  explanation says that dominoes cannot fill such regions

### Requirement: Barriers ruled out by one firing form one journey

Barriers ruled out by one firing SHALL group into one `continuesPrevious`
journey, and a barrier the player has already drawn SHALL be skipped for
display while still advancing the deduction.

#### Scenario: A barrier already drawn is not shown again

- **WHEN** one firing rules out two spots and the player has already drawn the
  barrier on one of them
- **THEN** the plan shows a step for the other spot only, and the deduction
  goes on as if both were ruled out

### Requirement: A hint is refused on an ambiguous board

`hint()` SHALL refuse (`{ ok: false, error }`) on a board that is not uniquely
solvable, which has no forced deduction to teach.

#### Scenario: A board with two solutions gets no plan

- **WHEN** a hint is requested on a board whose clue grid has more than one
  solution
- **THEN** `hint()` returns a refusal and no step

### Requirement: Dominosa renders the hint distinctly

The renderer SHALL draw the current hint step's forced cells (a placement's two
squares, or a barrier's two squares and its edge) in `COL_HINT`, and the
deduction's evidence squares in `COL_HINT_CELL`.

#### Scenario: A placement hint highlights the target domino cells

- **WHEN** a placement hint step is displayed
- **THEN** the two cells of the forced domino render in `COL_HINT`

### Requirement: Dominosa provides a domino reference with pair-occurrence highlight

Dominosa SHALL implement the engine reference-aid hooks so the app shows a
domino reference: a checklist of exactly one item for each of the game's
`DCOUNT(n)` distinct number-pairs (`0-0 … n-n`), each carrying its two face
values as `pips`, an `"a–b"` `label` and its found status, with a
click-to-highlight of a pair's candidate placements. The model's `selected`
SHALL be the highlighted pair's key, or null.

#### Scenario: The reference lists the whole set

- **WHEN** `reference()` is asked on any board of maximum number `n` while no
  pair is highlighted
- **THEN** it returns `DCOUNT(n)` items, one for each pair from `0-0` to `n-n`,
  each carrying its two numbers as `pips`, and `selected` is null

### Requirement: A reference item's status counts the player's own dominoes

Status SHALL be derived purely from the player's placed dominoes, with no
solver and no solution information. A pair placed zero times SHALL be
`outstanding`, once SHALL be `placed`, and two or more times SHALL be
`conflict`.

#### Scenario: The checklist reflects placed, outstanding, and conflicting pairs

- **WHEN** the player has placed the `2-5` domino once and left `0-0` unplaced,
  and has placed two separate dominoes whose values are both `1-3`
- **THEN** `reference()` returns `DCOUNT(n)` items in which `2-5` is `placed`,
  `0-0` is `outstanding`, and `1-3` is `conflict`

### Requirement: The highlighted pair clears on completion and survives a move

The highlighted pair SHALL be reset to null when the board is completed,
together with the number-highlight slots. It SHALL NOT otherwise be cleared by
`executeMove`, so a programmatic move or the panel closing keeps it, which is
what lets a player mark a pair, close the panel and then place it.

#### Scenario: The highlight clears on completion

- **WHEN** a pair is highlighted and the player then completes the board
- **THEN** the highlight is cleared, and so are the number-highlight slots

### Requirement: Any pointer tap on the board dismisses the spotlight

Any pointer tap on the board, an `interpretMove` for a left or right button
within the grid, SHALL clear `highlightPair`, because Escape is undiscoverable
and unavailable on touch. The tap SHALL still perform its normal action: place
or remove a domino, toggle a barrier, toggle a number highlight. A tap that
would otherwise do nothing SHALL repaint, so the cleared spotlight disappears.

#### Scenario: A board tap dismisses the spotlight while doing its action

- **WHEN** a domino is spotlighted and the player taps the board to place a
  domino
- **THEN** that domino is placed AND the spotlight is cleared
- **AND** a tap that resolves to no move still clears the spotlight and
  repaints

### Requirement: The spotlight boxes every candidate placement of the pair

When `highlightPair` is set, `redraw` SHALL box **both** squares of every
orthogonally adjacent square-pair whose two clue values are that domino, which
are all its candidate placements, and SHALL box no other squares. The box SHALL
be in a dedicated `COL_REFERENCE`, the collection's color for what the player
is after, which no domino, mistake, hint or value highlight takes. It SHALL
coexist with the number-highlight aid as an independent visual channel.

#### Scenario: Selecting a pair boxes exactly its candidate placements

- **WHEN** the player selects the `2-5` item
- **THEN** `redraw` draws a `COL_REFERENCE` box around both squares of every
  adjacent square-pair showing a 2 next to a 5, and around no other squares
- **AND** selecting it again clears the boxes, and selecting another pair
  replaces them

### Requirement: Each Dominosa tier adds its deductions to the tier below

Easy SHALL perform the domino-single-placement and square-single-placement
deductions. Normal SHALL additionally perform square-single-domino,
domino-must-overlap, the two local-duplicate deductions, and the parity
deduction. Tricky SHALL additionally perform set analysis without doubles.
`Unreasonable` SHALL additionally perform set analysis with doubles and the
forcing-chain deduction.

#### Scenario: A cap leaves out the deductions above it

- **WHEN** a board that needs set analysis is solved with the solver capped at
  Normal
- **THEN** the verdict is ambiguous (2)

### Requirement: What the parity and forcing-chain deductions conclude

The parity deduction SHALL rule out a domino whose placement would split the
unfilled area into two odd-sized regions. The forcing-chain deduction SHALL
follow parity-linked chains of forced placements.

#### Scenario: A placement that splits the board oddly is ruled out

- **WHEN** a domino on a spot would leave an odd number of unfilled squares on
  each side of it
- **THEN** the parity deduction rules a domino out of that spot

### Requirement: The forcing chain grades boards and is never narrated

The forcing-chain deduction SHALL remain in the solver, so the generator grades
on it. It SHALL NOT be recorded by the hint's deduction pass, because a closure
over all placements is a search and no hint narrates a search on any tier.

#### Scenario: A position only the forcing chain advances gets no firing

- **WHEN** the hint's deduction pass reaches a position where only the forcing
  chain makes progress
- **THEN** the pass yields no firing, while the solver still solves the board

### Requirement: Dominosa renders dominoes, barriers and overlays under the web geometry

The renderer SHALL draw the rounded-corner domino ends, the clue numbers, the barrier edge lines, the two value-highlight
colors, the red clash fill, the half-grid cursor corners, and the completion
flash, with the board's border set to minus the domino gutter, so the gutters
bleed to the canvas edge. Every per-square overlay (domino type / clash /
highlight / edge / cursor / flash / mistake / hint / reference spotlight) SHALL
be part of the render diff key so it repaints and clears correctly.

#### Scenario: A clash renders red

- **WHEN** the same domino value is placed in two locations
- **THEN** both placements render with the clash color rather than the normal
  domino color

### Requirement: Dominosa draws a domino as a piece in the theme pair's first color

`redraw` SHALL fill a placed domino with the collection's color for a placed
piece, the theme pair's first member, and a clashing domino with the
collection's error color, with the number on either in a white that is the same
in both schemes.

#### Scenario: The domino's number does not invert with the scheme

- **WHEN** a board with a placed domino is drawn in the dark scheme
- **THEN** the number on the domino is the same white as in the light scheme

### Requirement: A highlighted number on a domino sits on a disc of the board's color

A number carrying a value highlight on a domino SHALL be drawn on a disc of the
board's own color, inside the mistake outline, so the highlight's color reads
there as it does on an open square.

#### Scenario: A highlighted number on a domino sits on a badge

- **WHEN** a value is highlighted and a square showing it is covered by a domino
- **THEN** a disc in the board's color is drawn under that number
- **AND** no disc is drawn under a number that is not highlighted
