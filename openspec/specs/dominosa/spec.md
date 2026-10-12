# dominosa Specification

## Purpose
Dominosa, the puzzle of tiling a grid of numbers with dominoes so that every
pairing, doubles included, appears exactly once: its rules, its params and
description encodings, its controls, what each tier's solver may use, its
explained deductive hint, its domino reference with a spotlight on where a
pair can go, and the decisions about how its board is drawn.

## Requirements

### Requirement: Rules: Dominosa tiles a grid of numbers with one of every domino

The puzzle SHALL be to partition a grid of numbers, each `0…n`, into 2×1
dominoes so that the placed dominoes are exactly the
`DCOUNT(n) = (n+1)(n+2)/2` distinct number-pairs `0-0 … n-n`, one of each,
with every domino's two numbers matching the underlying clues. The grid SHALL
be `n+1` wide and `n+2` tall when `tall` is set, and `n+2` wide and `n+1` tall
when it is not.

#### Scenario: A board that is not tall is the wide one

- **WHEN** a board is built for `n = 6` with `tall` false
- **THEN** it is 8 squares wide and 7 tall

### Requirement: Rules: Dominosa detects completion

The game SHALL mark the board completed when the placed dominoes cover every
square as the full set of `DCOUNT(n)` distinct number-pairs with no repeated
value.

#### Scenario: The last domino of the set completes the board

- **WHEN** every other domino of the set is in place and the player places
  the one still missing
- **THEN** the board is completed

### Requirement: Rules: Dominosa flags a domino the unique solution lacks

`findMistakes` SHALL re-solve the board to its unique solution and return both
cells of every player-placed domino the solution does not contain. A board
that is not uniquely solvable SHALL yield no mistakes, and blank squares and
barrier edges SHALL never be flagged.

#### Scenario: A wrong placement is flagged

- **WHEN** the player places a domino that the unique solution does not contain
- **THEN** `findMistakes` includes both its cells

### Requirement: Params: Dominosa params are the highest number, a tier and the tall flag

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

### Requirement: Params: The fourth Dominosa tier is named Unreasonable and keeps its character

The fourth tier SHALL be named `Unreasonable`, because its forcing-chain
deduction is a search over a closure of all placements, and its difficulty
character SHALL be `"e"`.

#### Scenario: The fourth tier keeps its difficulty character

- **WHEN** params at the fourth tier are encoded in full
- **THEN** the suffix is `"de"`, so a game ID that says `"de"` names the same
  board whatever the tier is called

### Requirement: Params: An id asking for an unchecked board names no tier

The difficulty suffix `"da"` and the bare `"a"` that upstream writes, which ask
for a board not checked for a unique solution, SHALL name no tier, so the
default tier stands.

#### Scenario: An ambiguous-board id decodes to the default tier

- **WHEN** `"6da"` is decoded
- **THEN** `diff` is the default tier, Normal, and the params are valid

### Requirement: Params: Dominosa refuses params outside its bounds

`validateParams` SHALL enforce the bound on `n` that keeps the grid's area
from overflowing, and SHALL refuse in full form a tier above Easy at `n = 1`
and a tier above Normal at `n = 2`, which no board of that size reaches.

#### Scenario: A tier the smallest set cannot reach is refused

- **WHEN** params with `n = 1` at Normal are checked in full form
- **THEN** `validateParams` returns a non-null error string

### Requirement: Description: Dominosa descriptions carry the clue grid

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

### Requirement: Description: A Dominosa description brackets only a number of 10 or more

`newState` SHALL refuse a bracketed number below 10, as it refuses one above
`n`, and SHALL refuse any character that is neither a digit nor a bracket
where a number is due: `newDesc` writes a number under 10 as its one digit
and nothing else.

#### Scenario: A small number in brackets

- **WHEN** `[0]0012113233302132120`, the first preset's board
  `00012113233302132120` with its first number put in brackets, is read for
  `3t`
- **THEN** it is refused as holding a number out of range

### Requirement: Generation: Each Dominosa tier adds its deductions to the tier below

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

### Requirement: Solver: What the parity and forcing-chain deductions conclude

The parity deduction SHALL rule out a domino whose placement would split the
unfilled area into two odd-sized regions. The forcing-chain deduction SHALL
follow parity-linked chains of forced placements.

#### Scenario: A placement that splits the board oddly is ruled out

- **WHEN** a domino on a spot would leave an odd number of unfilled squares on
  each side of it
- **THEN** the parity deduction rules a domino out of that spot

### Requirement: Controls: Dominosa input places dominoes and barrier edges

Placing a domino SHALL erase any dominoes or barrier edges that overlap it. A
barrier edge SHALL be an annotation that never affects the win condition, and
SHALL be refused next to any placed domino.

#### Scenario: Placing a domino erases an overlapping one

- **WHEN** a domino is placed on a square already covered by another domino
- **THEN** the previously overlapping domino is removed and the new one placed

#### Scenario: A barrier edge cannot be drawn next to a domino

- **WHEN** the player right-clicks an edge one of whose squares is part of a
  placed domino
- **THEN** no edge is toggled

### Requirement: Controls: A right-click on a number or a digit key toggles a value highlight

A right-click on a clue number, or a digit key, SHALL toggle that number in one
of two value-highlight slots, a UI-only solver aid.

#### Scenario: A digit key clears the highlight it set

- **WHEN** a number is highlighted and its digit key is pressed again
- **THEN** its slot empties and no move is made

### Requirement: Controls: The Dominosa keyboard cursor walks the half-grid

Cursor keys SHALL move a half-grid keyboard cursor over the
`(2w−1) × (2h−1)` lattice of squares, gaps and edges.

#### Scenario: The cursor can rest on an edge between two squares

- **WHEN** the visible cursor is at a lattice position with exactly one odd
  coordinate
- **THEN** it is on the edge between two squares, where `CURSOR_SELECT`
  toggles a domino covering the two

### Requirement: Controls: Dominosa provides a domino reference with pair-occurrence highlight

Dominosa's `reference` SHALL be a domino reference: a checklist of exactly one
item for each of the game's
`DCOUNT(n)` distinct number-pairs (`0-0 … n-n`), each carrying its two face
values as `pips`, an `"a–b"` `label` and its found status, with a
click-to-highlight of a pair's candidate placements. The model's `selected`
SHALL be the highlighted pair's key, or null.

#### Scenario: The reference lists the whole set

- **WHEN** `reference()` is asked on any board of maximum number `n` while no
  pair is highlighted
- **THEN** it returns `DCOUNT(n)` items, one for each pair from `0-0` to `n-n`,
  each carrying its two numbers as `pips`, and `selected` is null

### Requirement: Controls: A reference item's status counts the player's own dominoes

Status SHALL be derived purely from the player's placed dominoes, with no
solver and no solution information. A pair placed zero times SHALL be
`outstanding`, once SHALL be `placed`, and two or more times SHALL be
`conflict`.

#### Scenario: The checklist reflects placed, outstanding, and conflicting pairs

- **WHEN** the player has placed the `2-5` domino once and left `0-0` unplaced,
  and has placed two separate dominoes whose values are both `1-3`
- **THEN** `reference()` returns `DCOUNT(n)` items in which `2-5` is `placed`,
  `0-0` is `outstanding`, and `1-3` is `conflict`

### Requirement: Controls: The highlighted pair clears on completion and survives a move

The highlighted pair SHALL be reset to null when the board is completed,
together with the number-highlight slots. It SHALL NOT otherwise be cleared by
`executeMove`, so a programmatic move or the panel closing keeps it, which is
what lets a player mark a pair, close the panel and then place it.

#### Scenario: The highlight clears on completion

- **WHEN** a pair is highlighted and the player then completes the board
- **THEN** the highlight is cleared, and so are the number-highlight slots

### Requirement: Controls: Any pointer tap on the board dismisses the spotlight

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

### Requirement: Hint: Dominosa's hint is seeded from the placed dominoes

The hint's plan SHALL be computed by running the deductive solver one firing
at a time, seeded from the placed dominoes.

#### Scenario: The plan solves the board from any mid-game position

- **WHEN** a non-mistaken board that needs no forcing chain is advanced by
  applying one freshly-recomputed hint step at a time
- **THEN** every step makes progress and the board reaches solved

### Requirement: Hint: A placement step places a domino that has one spot left

A hint step SHALL be a **placement** step when a domino has exactly one
remaining spot, its move placing that domino there, or when a square has only
one neighbor left to pair with.

#### Scenario: A placement hint names the forced domino and explains why

- **WHEN** a domino has exactly one remaining spot on the current board
- **THEN** the next hint step's move places that domino and its explanation
  states, in the necessity voice, that it is the only spot left

### Requirement: Hint: A barrier step draws the edge a technique rules out

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

### Requirement: Hint: A barrier the player has already drawn is not shown again

A barrier the player has already drawn SHALL be skipped for display while
still advancing the deduction.

#### Scenario: A barrier already drawn is not shown again

- **WHEN** one firing rules out two spots and the player has already drawn the
  barrier on one of them
- **THEN** the plan shows a step for the other spot only, and the deduction
  goes on as if both were ruled out

### Requirement: Hint: A hint is refused on an ambiguous board

`hint()` SHALL refuse (`{ ok: false, error }`) on a board that is not uniquely
solvable, which has no forced deduction to teach.

#### Scenario: A board with two solutions gets no plan

- **WHEN** a hint is requested on a board whose clue grid has more than one
  solution
- **THEN** `hint()` returns a refusal and no step

### Requirement: Hint: The forcing chain grades boards and is never narrated

The forcing-chain deduction SHALL remain in the solver, so the generator grades
on it. It SHALL NOT be recorded by the hint's deduction pass, because a closure
over all placements is a search and no hint narrates a search on any tier.

#### Scenario: A position only the forcing chain advances gets no firing

- **WHEN** the hint's deduction pass reaches a position where only the forcing
  chain makes progress
- **THEN** the pass yields no firing, while the solver still solves the board

### Requirement: Hint: Dominosa's hint tries its techniques in one order

Each firing of the hint's plan SHALL be the first that applies of: a domino
with one spot left that is not yet placed there; a square with one neighbor
left to pair with; a square that can only be part of one domino; a spot that
overlaps every spot of a domino; the two duplicate deductions; odd regions;
and set analysis, without doubles and then with them. The hint SHALL try all
of them on every board, whatever tier it was dealt at.

#### Scenario: A placement is taken before a line

- **WHEN** a board holds both a domino with one spot left and a spot that
  set analysis rules out
- **THEN** the plan's first step places the domino

#### Scenario: An Easy board never reaches the later techniques

- **WHEN** the hint is followed from the start of a board dealt at Easy
- **THEN** every step is a domino with one spot left or a square with one
  neighbor left

### Requirement: Hint: A square that takes one domino rules that domino out elsewhere

Where every spot left to a square, more than one, would put the same domino
on it, that domino is used there. The step SHALL rule the domino out of each
spot of its own that does not cover the square, and SHALL outline the square.

#### Scenario: Two ways to pair a square, one domino

- **WHEN** a 2 can still pair with the 4 above it or the 4 beside it, and with
  nothing else, and the 2–4 domino has a third spot across the board
- **THEN** the technique's step draws a line on that third spot, and its
  sentence says the outlined square can only be part of the 2–4 domino

### Requirement: Hint: A spot that overlaps every spot of a domino is ruled out

Where one spot overlaps every spot left to some domino, a domino on it would
leave that one nowhere to go. The step SHALL rule the spot out, and SHALL
outline the squares of the spots left to the domino it protects. The spots
need share no one square for it to overlap them all.

#### Scenario: Two spots end to end

- **WHEN** a row reads 3, 5, 5, 3 and the 3–5 domino has only the first pair
  and the last pair left
- **THEN** the step draws a line between the two 5s, whose spot overlaps both

### Requirement: Hint: A spot that would force a domino twice is ruled out

A step SHALL rule a spot out where a domino on it would leave a square beside
it with no spot left but ones of that same domino, which would then be on the
board twice, and SHALL outline that square. It SHALL rule a spot out where a
domino on it would leave two squares beside it each with only spots of one
and the same domino, none of them covering both, and SHALL outline the two.

#### Scenario: One square forced to repeat the domino

- **WHEN** a 1–6 domino on a spot would take from the 6 beside it every pairing
  but ones with a 1
- **THEN** the step draws a line on the spot, and its sentence says a 1–6
  there would force a second 1–6 at the outlined square

#### Scenario: Two squares forced to share a domino

- **WHEN** a domino on a spot would leave a 0 beside one of its squares and a 0
  beside the other each able to pair only with a 3
- **THEN** the step draws a line on the spot, and its sentence says both
  outlined squares would need one and the same domino

### Requirement: Hint: Set analysis rules a group's dominoes out of every other spot

Among the squares showing one number, where a group, no two of which the
number's double could still cover, can between them be part of only as many
different dominoes as the group has squares, each of those dominoes is used
on the group. The step SHALL rule each out of every spot that covers no
square of the group, and SHALL outline the group. A group of one domino, and
one leaving out fewer than two of the number's squares, SHALL NOT fire.

#### Scenario: Two 4s that share two partners

- **WHEN** two of the 4s on the board, not adjacent, can each still pair only
  with a 1 or a 6
- **THEN** the technique rules 1–4 and 4–6 out of every spot away from those
  two squares, one line a step

### Requirement: Hint: Set analysis with doubles lets the double cover two of the group

The hint SHALL then try a group two of whose squares the number's double
could still cover. Where the group can hold one domino fewer than
it has squares, the step SHALL rule the double out of every spot covering
fewer than two of the group, and the others out of every spot covering none.
Where it can hold as many as it has squares, the step SHALL rule out only the
double, from every spot covering none. A group that can hold one domino, or
every domino showing the number, SHALL NOT fire.

#### Scenario: Three 2s and two dominoes

- **WHEN** three 2s, two of them adjacent, can between them be part of only
  the 2–2 and the 2–5
- **THEN** the technique rules the 2–2 out of every spot but ones covering
  two of the three, and the 2–5 out of every spot away from them

### Requirement: Hint: A later line of one firing does not repeat its reason

Where one firing rules out several spots, the first step SHALL give the
reason and each later one SHALL say only that its spot cannot hold a domino
either, for the same reason, naming the outlined squares where the reason has
any.

#### Scenario: The second line of an odd region

- **WHEN** the odd-regions deduction, which outlines nothing, rules out two
  spots
- **THEN** the second step reads "…and this spot can't hold a domino either,
  for the same reason."

### Requirement: Look: A flagged cell is drawn distinctly from a clash

The renderer SHALL overlay flagged cells distinctly from the always-on red
**clash** highlight, which marks a domino value placed more than once.

#### Scenario: A mistake overlay repaints on a later frame

- **WHEN** a domino is drawn, then `findMistakes` flags it on a subsequent frame
  without the cell's own value changing
- **THEN** the mistake overlay is painted on that later frame

### Requirement: Look: The spotlight boxes every candidate placement of the pair

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

### Requirement: Look: Dominosa renders dominoes, barriers and overlays under the web geometry

The renderer SHALL draw the rounded-corner domino ends, the clue numbers, the barrier edge lines, the two value-highlight
colors, the red clash fill, the half-grid cursor corners, and the completion
flash, with the board's border set to minus the domino gutter, so the gutters
bleed to the canvas edge.

#### Scenario: A clash renders red

- **WHEN** the same domino value is placed in two locations
- **THEN** both placements render with the clash color rather than the normal
  domino color

### Requirement: Look: Dominosa draws a domino as a piece in the theme pair's first color

`redraw` SHALL fill a placed domino with the collection's color for a placed
piece, the theme pair's first member, and a clashing domino with the
collection's error color, with the number on either in a white that is the same
in both schemes.

#### Scenario: The domino's number does not invert with the scheme

- **WHEN** a board with a placed domino is drawn in the dark scheme
- **THEN** the number on the domino is the same white as in the light scheme

### Requirement: Look: A highlighted number on a domino sits on a disc of the board's color

A number carrying a value highlight on a domino SHALL be drawn on a disc of the
board's own color, inside the mistake outline, so the highlight's color reads
there as it does on an open square.

#### Scenario: A highlighted number on a domino sits on a badge

- **WHEN** a value is highlighted and a square showing it is covered by a domino
- **THEN** a disc in the board's color is drawn under that number
- **AND** no disc is drawn under a number that is not highlighted
