# magnets Specification

## Purpose
Magnets, the puzzle of filling each domino with a magnet or a neutral piece so
that no two like poles are orthogonally adjacent and each row and column meets
its clued pole counts: its description and params encodings, input that cycles
a domino's contents and marks clues done, mistake checking against the unique
solution, the two solver tiers, the board's look, and an explained hint whose
sentences and marks are read off the board.

## Requirements

### Requirement: Rules: What a Magnets board asks, and when it is solved

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

### Requirement: Rules: Magnets flags mistakes against the unique solution

Because a generated board is uniquely solvable, the game SHALL implement
`findMistakes`: re-solve from the dominoes and the row and column counts, and
return every player-set cell whose content contradicts the unique solution, and
every cell of a domino marked `?` that is neutral in it, since the hint reads a
`?` as a fact. Empty cells, and a `?` on a domino that is a magnet in the
solution, SHALL never be flagged.

#### Scenario: A wrong placement is flagged

- **WHEN** the player sets a domino to a polarity the unique solution
  contradicts, without yet violating adjacency or a count
- **THEN** `findMistakes` includes that cell and Check & Save refuses to save

#### Scenario: A `?` on a neutral domino is flagged

- **WHEN** the player marks `?` on a domino that is neutral in the unique
  solution
- **THEN** `findMistakes` includes its cells, and the hint refuses until the
  mark is fixed

### Requirement: Params: Magnets' parameters

Params SHALL be `w`, `h`, `diff` (Easy or Normal) and `stripclues` (boolean),
encoded `{w}x{h}` with, in the full form, a `d{e|t}` difficulty suffix and an
`S` strip-clues suffix; a bare `{n}` SHALL decode as a square. `w` and `h`
SHALL each be declared bounded from 2 to 61, the largest count one description
character writes. `validateParams` SHALL refuse Easy unless `w ≥ 3` or
`h ≥ 3`, Normal unless `w ≥ 5` or `h ≥ 5`, and, of full params, Normal at
3×6 and 6×3.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 9, diff: DIFF_TRICKY, stripclues: true }` (the
  Normal tier) are encoded in full
- **THEN** the result is `10x9dtS` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 4×4 grid at Normal difficulty
- **THEN** it returns a non-null error string (Normal needs a side ≥ 5)

#### Scenario: A 3×6 Normal board that arrives written still loads

- **WHEN** a game ID carries a 3×6 Normal board with its description
- **THEN** the params are accepted, and the same params are refused when a
  board is to be dealt

### Requirement: Params: Every Magnets preset size is offered at each tier

Each preset size, the largest included, SHALL be offered at Easy, at Normal,
and at Normal with stripped clues.

#### Scenario: The largest board is offered at Easy

- **WHEN** the preset menu is read
- **THEN** it holds a 9×10 Easy board beside the two 9×10 Normal ones

### Requirement: Description: Magnets descriptions carry the clues and domino layout

The desc SHALL encode, comma-separated: the `w` column `+` counts, the `h` row
`+` counts, the `w` column `−` counts, the `h` row `−` counts (each a digit or
letter, or `.` for a stripped or absent clue), then a `w·h`-character row-major
string of domino orientations: `L`, `R`, `T` or `B` for the left, right, top or
bottom half of a domino, and `*` for a singleton square.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: Description: A malformed Magnets description is refused

The game's reading of a desc SHALL refuse a short desc, a
character out of range, an inconsistent domino description (an end not pointing
back at its partner), and a count that exceeds its row's or column's size.

#### Scenario: A malformed description is rejected

- **WHEN** a desc whose domino ends are inconsistent is validated
- **THEN** it is refused with a non-null error string

### Requirement: Generation: Magnets grades boards with a tiered deductive solver

A generated board SHALL be solved by the solver at its own difficulty, and a
Normal board SHALL NOT be solved at Easy. The solver SHALL propagate a
deduction across a domino to its partner: a color excluded at one end excludes
the opposite color at the other.

#### Scenario: A generated board is uniquely solvable at its difficulty

- **WHEN** a board generated at difficulty `d` is solved from empty
- **THEN** the solver returns solved at `d`, and, for a Normal board, fails to
  fully solve it at Easy

### Requirement: Generation: The deductions of Magnets' Easy tier

The Easy tier SHALL perform: set-and-hold of the initial givens,
force-by-flags, the neutral deduction that neither end can be a magnet, the
row and column count-full pass (a color complete excludes it from the rest; the
remaining unset squares all needed sets them), and the odd-length-section
deduction.

#### Scenario: A met count clears its line

- **WHEN** a column already holds all the `+` its clue allows
- **THEN** the solver at Easy rules `+` out of the column's other squares

### Requirement: Generation: The deductions of Magnets' Normal tier

The Normal tier SHALL perform the Easy tier's deductions and additionally: the
advanced-full pass that counts the polarized dominoes lying in a row or column,
the single-neutral-left exclusion, and the two count-dominoes passes (all
remaining dominoes being magnets rules out neutral; a domino with one placeable
end has it set).

#### Scenario: Easy stops short of them

- **WHEN** the solver is run at Easy
- **THEN** none of the deductions the Normal tier adds is applied

### Requirement: Generation: Strip clues removes each number a Magnets board does not need

With `stripclues` set, `newDesc` SHALL take the board's `+` and `−` numbers in
a random order and remove each one without which the solver at the board's
difficulty still reaches the same answer, so a row or column may carry no
number for a pole. A removed number SHALL be written `.` in the description. A
params label with it set SHALL end in the words "strip clues".

#### Scenario: A stripped preset and a board of it

- **WHEN** the preset whose params are `5x6dtS` is read
- **THEN** it is titled "5x6 Normal, strip clues", and on a board of it such
  as `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` only the third
  and fourth of the five columns have a `+` number, 3 and 1

### Requirement: Controls: Magnets input cycles domino contents and toggles clue aids

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

### Requirement: Controls: A Magnets singleton square takes no input

A click or cursor action on a singleton square SHALL do nothing.

#### Scenario: A singleton is clicked

- **WHEN** the player left-clicks or right-clicks a singleton square
- **THEN** no move is made and the board is unchanged

### Requirement: Controls: The Magnets cursor walks onto the clues

The keyboard cursor SHALL range over the tiles and the ring of clue slots
around them, and SHALL NOT enter the four corners, which hold no clue.
`CURSOR_SELECT` on a clue slot SHALL toggle that clue's done mark as a
left-click there does, and `CURSOR_SELECT2` on one SHALL do nothing.

#### Scenario: Up from the top row, then Enter

- **WHEN** the 5x6 board
  `13231,210232,31222,301123,LRTLRTTBLRBBTTTLRBBBTLRLRBLRLR` is opened and the
  player presses Up and then Enter
- **THEN** the cursor shows on the first column's `+` clue, above the grid, and
  that clue is marked done

#### Scenario: The cursor stops short of a corner

- **WHEN** the cursor is on the first column's `+` clue and the player presses
  Left
- **THEN** the cursor stays where it is

### Requirement: Controls: A Magnets drag repeats its press across tiles or across clues

Magnets SHALL declare a sweep for both buttons. A drag on from a press on a
tile SHALL repeat the press on each square that holds what the pressed square
held, a square's contents and its `?` mark together being what it holds, and
SHALL pass over every clue. A drag on from a press on a clue SHALL repeat it on
each clue whose done mark matched, and SHALL pass over every tile. A singleton
square SHALL never be swept.

#### Scenario: A drag off the grid marks no clue

- **WHEN** the player presses an empty tile, which puts a `+` there, and drags
  across a neutral tile, another empty tile and out over a clue
- **THEN** the second empty tile takes a `+` in the square the pointer crossed,
  and the neutral tile and the clue are left as they were

### Requirement: Hint: Magnets offers an explained hint

Magnets SHALL implement `hint` as the recording projection of its graded
solver: the same ladder, run one firing at a time from the player's board, each
firing narrated with the premise that forced it. The hint SHALL start from the
player's placed dominoes and `?` marks.

#### Scenario: The hint finishes the board

- **WHEN** the player asks for hints on a fresh board of any preset and follows
  every step
- **THEN** the board is solved without a refusal

### Requirement: Hint: A Magnets firing the player can write is one journey of legs

A firing that places dominoes SHALL be one journey of placement legs, and one
that concludes dominoes cannot be neutral SHALL be one journey of legs that
mark them `?`, so every "cannot be neutral" fact a later step rests on is on
the board.

#### Scenario: Two dominoes found to be magnets

- **WHEN** one firing concludes that two dominoes cannot be neutral
- **THEN** the hint shows one journey of two legs, each marking one of them `?`

### Requirement: Hint: A Magnets firing the board already says is not shown

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

### Requirement: Hint: Following a Magnets leg through its press cycle keeps the plan

Following a leg through the game's own press cycle SHALL keep the plan: the
press on the way to the leg's value (a + before a −, neutral before a `?`)
SHALL hold the leg, and the press that lands it SHALL complete the leg.

#### Scenario: Placing a − through its cycle keeps the plan

- **WHEN** a leg asks for a − and the player presses the square once, making it
  a +
- **THEN** the leg is held, and the second press completes it

### Requirement: Hint: A Magnets count premise shows why the rest of its line is ruled out

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

### Requirement: Hint: A Magnets count premise marks what rules each square out

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

### Requirement: Hint: A domino along a counted Magnets line gives its far end's reason in its own leg

In a count premise's journey, a domino lying along the counted line SHALL say
in its own leg why its far end cannot take the pole, read off the board with
the journey's earlier legs placed. No earlier leg SHALL ring it before that
board forces it.

#### Scenario: A leg forced by the leg before it

- **WHEN** a count premise places a domino lying along its line whose far end
  loses the pole only to an earlier leg's placement
- **THEN** no step before that leg rings it, and its own step names the pole
  the earlier leg placed as the reason

### Requirement: Hint: A Magnets hint hatches the line its sentence names

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

### Requirement: Hint: A met Magnets line cited as a reason is marked by its clue digit

A met line a hint step cites only as a reason SHALL be marked by its clue digit
in the evidence color, never by an outline. The outlines of a hint step whose
sentence names a row or column SHALL each join a square only to its own
domino's other half.

#### Scenario: A cited column's clue

- **WHEN** the hint is asked of the 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` with its second
  column's bottom domino neutral
- **THEN** its first step colors the second column's − clue as a reason

### Requirement: Hint: A Magnets domino step gives each pole its own reason

A hint step about a single domino SHALL give, in its sentence, each pole the
reason that rules that pole out at that end.

#### Scenario: One end of a domino, both facts read through its partner

- **WHEN** a domino's end touches a + and lies in a column whose − clue is met,
  and the domino is concluded neutral
- **THEN** the step says the end touches a + and a − there would overfill its
  column, and hatches that column

### Requirement: Hint: Magnets calls its pieces tiles when a player reads about them

Every Magnets hint sentence, the Magnets help page and the refusal of a
description whose layout is inconsistent SHALL call the two-square piece a
tile, and a filled one a magnet or a neutral tile; they SHALL NOT call it a
domino. A tile's halves SHALL be its ends or squares, and a hint sentence
SHALL call a tile marked `?` a marked magnet. The code's names for the layout are not player vocabulary and are
outside this requirement.

#### Scenario: No sentence says domino

- **WHEN** every sentence the Magnets hint can speak is produced, at every value
  that changes its words
- **THEN** none contains "domino"

#### Scenario: The help page says tile

- **WHEN** the Magnets help page is read
- **THEN** it describes filling each tile with a magnet or a neutral tile, and
  never says "domino"

#### Scenario: A game ID whose layout is inconsistent

- **WHEN** a game ID is opened in which one square's letter does not point back
  at its partner
- **THEN** the player reads "This game ID has a tile whose two ends don't point
  at each other."

### Requirement: Hint: Magnets' hint settles one tile from what its ends cannot hold

A hint step about one tile SHALL conclude it from the poles the board rules
out of its two ends. A tile marked `?` with a pole ruled out of one end SHALL
take the other pole there ("This magnet's + can't go here, …, so this end must
be −"), or that pole at its other end when the fact is the far end's ("…can't
go at the other end, …, so it must go here"). An unmarked tile SHALL be made
neutral when one pole fits at neither end, or when one end can take neither
pole.

#### Scenario: A marked magnet beside a pole

- **WHEN** a tile marked `?` has an end beside a `−`
- **THEN** the step reads "This magnet's − can't go here, beside another −, so
  this end must be +."

#### Scenario: A tile lying along a met column

- **WHEN** the hint is asked of the unplayed 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB`
- **THEN** it reads "This tile lies along a column with all its −s, so it must
  be neutral." of the tile at the foot of the second column, whose `−` number
  is 0

### Requirement: Hint: Magnets' hint counts a line's neutral squares

Of a line with both its numbers, the hint SHALL conclude: when the numbers
leave no more neutral squares, that every tile with an empty square in the line
is a magnet, asking a `?` on each; when the line needs as many more neutral
squares as it has empty squares outside marked magnets, that those squares are
neutral; and, in the Normal tier's part, when it has room for just one more
neutral square, that each undecided tile lying along it is a magnet, asking a
`?` on each.

#### Scenario: A row whose numbers fill it

- **WHEN** the hint is asked of the unplayed 5x6 board
  `13231,210232,31222,301123,LRTLRTTBLRBBTTTLRBBBTLRLRBLRLR`, whose top row
  needs two `+` and three `−` in its five squares
- **THEN** it reads "This row's clues need a + or − in every one of its empty
  squares, so each tile there must be a magnet." and asks a `?` on the row's
  first tile

#### Scenario: Marked magnets are set aside

- **WHEN** the hint is followed on that board through the top row's three `?`
  marks, the middle one on a tile that reaches down into the second row,
  which needs one `+` and no `−`
- **THEN** the next step reads "This row needs 4 more neutral squares and only
  these 4 aren't in marked magnets, so they must be neutral."

### Requirement: Hint: Magnets' hint counts the squares that can still take a line's pole

When a line needs as many more of one pole as it has empty squares that can
still take that pole, the hint SHALL conclude that those squares hold it, and
SHALL place each of their tiles that way round.

#### Scenario: One square left for a pole

- **WHEN** a row needs one more `+` and its one empty square can take it
- **THEN** the step reads "This row needs one more + and only this square can
  still take one, so it must be +."

### Requirement: Hint: Magnets' hint counts the tiles that can still give a line its pole

In the Normal tier's part the hint SHALL count a line's tiles, one lying along
it counting once. Where the line needs as many more of a pole as it has
undecided tiles, each SHALL be a magnet and take a `?`. Where it needs as many
more as it has tiles that can still give one, a tile able to take the pole at
only one of its squares there SHALL take it. For `−` on a line with a `+`
number, that count takes in the tiles that can still give a `+`, so it
concludes only when none can.

#### Scenario: A tile lying along the column counts once

- **WHEN** the hint is asked of the 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` with its second
  column's bottom tile neutral
- **THEN** its step begins "This column needs 3 more +s, one per magnet, and
  just 3 tiles can give one"

#### Scenario: Every undecided tile is needed

- **WHEN** a row needs three more `−` and has three undecided tiles
- **THEN** the step reads "This row needs 3 more −s and has only 3 undecided
  tiles, so each must be a magnet."

### Requirement: Hint: Magnets' hint starts a line's one odd gap with the pole it has more of

When a line has all its neutral squares, needs exactly one more of one pole
than of the other, and exactly one of its runs of empty squares is of odd
length, the hint SHALL conclude that the first square of that run, the leftmost
or the topmost, holds the pole the line needs more of: "This row's empty
squares take alternating poles, one more + than −, so this odd-length gap must
start with +."

#### Scenario: Two odd gaps conclude nothing

- **WHEN** a line that needs one more `+` than `−` has two runs of empty
  squares of odd length
- **THEN** no step of this kind is offered for that line

### Requirement: Hint: Magnets' hint tries one tile first, then the lines, columns before rows

The hint SHALL begin again from its first technique after every step: a tile
settled from its ends; then a line's neutral count or pole count met or exactly
reachable; the odd gap; and then the Normal tier's part, in the order one
neutral square left, every undecided tile needed, and a tile's only end. A
technique about a line SHALL try the columns left to right and then the rows
top to bottom. Every technique SHALL be tried whatever the board's difficulty.

#### Scenario: A Normal board opens on a single tile

- **WHEN** the hint is asked of the unplayed 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB`, of the preset
  `5x6dtS`
- **THEN** its first step makes the tile at the foot of the second column
  neutral, and only the next counts a column's tiles

### Requirement: Look: A Magnets mistake is drawn apart from the live errors

The renderer SHALL overlay the cells `findMistakes` flags distinctly from the
live error highlighting. That highlighting SHALL always be on, in red: two
touching identical poles, and a clue whose count is exceeded, or is short with
no undecided square left in its line.

#### Scenario: A live error needs no check

- **WHEN** the player places two `+` poles side by side
- **THEN** both are drawn as errors at once, with no mistake check asked for

### Requirement: Look: Magnets renders under the web geometry

The canvas SHALL be `(w+2) × (h+2)` tiles: a one-tile clue margin on each side
and no border beyond it. The renderer SHALL draw the `+` and `−` clue counts on
all four borders (top: column `+`; bottom: column `−`; left: row `+`; right:
row `−`) with the corner `+` and `−` symbols.

#### Scenario: A board's canvas

- **WHEN** a 5×6 board is drawn at a tile size
- **THEN** its canvas is 7 tiles wide and 8 tiles high

### Requirement: Look: What Magnets draws in a square

The renderer SHALL draw rounded-corner dominoes, the `+` and `−` magnet
symbols, the neutral cross, and the blue not-neutral `?`. A singleton square
SHALL be drawn as bare background, with no domino on it.

#### Scenario: A marked domino

- **WHEN** the player marks a domino `?`
- **THEN** each of its squares shows a blue `?`

### Requirement: Look: An undecided Magnets domino is the collection's cell surface

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

### Requirement: Look: Magnets' win flash lights a domino whole

The win flash SHALL sweep the dominoes diagonally, a domino's position being
the middle of its two squares, so both squares light and go dark together. A
lit domino's ground SHALL be filled with a flash color in place of its
pole's, and SHALL keep its symbols.

#### Scenario: A domino across two diagonals

- **WHEN** the flash's highlight reaches a horizontal domino
- **THEN** both of its squares are lit in the same frame, though one is a
  diagonal ahead of the other
