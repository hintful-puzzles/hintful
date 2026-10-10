# signpost Specification

## Purpose
Signpost, the puzzle of linking every square into one numbered sequence in which
each square's arrow points toward the next: its rules, its params and
description encodings, how the chains are numbered and colored, its mistake
checking, what its solver deduces, and how its squares look.

## Requirements

### Requirement: Signpost links every square into one numbered chain

Signpost SHALL be played on a `w × h` grid in which every cell carries an
arrow, one of 8 directions, and some cells carry immutable sequence numbers;
the player links cells into a single chain `1 … n`, where `n = w*h`, in which
every link follows its cell's arrow and the numbers run consecutively.

#### Scenario: A finished chain solves the board

- **WHEN** every cell is linked into one chain `1 … n` whose links each follow
  their cell's arrow
- **THEN** the game's status is solved

### Requirement: Signpost's parameters

Params SHALL be `w`, `h`, `forceCornerStart`, a boolean, and a difficulty,
Easy or Unreasonable. They SHALL encode as `{w}x{h}`, with a trailing `c` when
corner start is set and then the difficulty as `de` or `du`, both in the full
encoding only. A bare `{n}` SHALL decode as a square grid, and a string with
no difficulty letter as Easy. A width or a height below one SHALL be refused,
and `validateParams` SHALL refuse a 1×1 grid for full generation.

#### Scenario: Params round-trip

- **WHEN** Easy params `{ w: 5, h: 5, forceCornerStart: true }` are encoded
  in full
- **THEN** the result is `5x5cde` and decoding it round-trips the params
- **AND** `5x5c`, written before the game had tiers, decodes to the same
  params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 1×1 grid for full generation
- **THEN** it returns a non-null error string

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 5×5 board with corner start is encoded
- **THEN** the full encoding is `5x5cdu` and the shared one `5x5`

### Requirement: Signpost descriptions use the upstream per-cell encoding

The desc SHALL encode the grid row-major, one token per cell: a direction
letter `a`–`h` (`a` = N … `h` = NW) alone for a cell with no immutable number,
or the decimal number followed by the direction letter for an
immutable-numbered cell.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: A malformed Signpost description is refused

Validating a desc SHALL refuse an unknown character, a number out of range, and
a token count that does not match `w*h`.

#### Scenario: A malformed description is rejected

- **WHEN** a desc whose token count does not match `w*h`, or one holding an
  unknown direction character, is validated
- **THEN** the result is a non-null error

### Requirement: A new Signpost board holds the description's arrows and givens

`newState` SHALL parse the desc into per-cell arrow directions and immutable
numbers, which no move SHALL change in any later state of the game. The only
links a new board holds SHALL be those joining two consecutive immutable
numbers of which the lower one's arrow points at the higher.

#### Scenario: Consecutive givens start linked

- **WHEN** a desc gives `k` and `k+1` and the arrow of `k` points at `k+1`
- **THEN** the new state holds the link from `k` to `k+1`, and no link the
  givens do not make

### Requirement: Signpost's region colors follow the links

When the numbering is recomputed, merging two regions SHALL keep the larger
region's color group, adding a blank cell to a numbered region SHALL inherit
that region's color and extend its numbering, and joining two blank cells SHALL
pick the lowest unused color group. A blank cell inside a chain, which several
links made at once can leave, SHALL offer no color: a chain SHALL be given
real numbers only where one of its cells holds a given number.

#### Scenario: Linking renumbers a region

- **WHEN** the player links a cell numbered `k` to a blank cell it points at
- **THEN** the blank cell derives number `k+1` and the two cells share one
  region and color group

#### Scenario: Merging keeps the dominant color

- **WHEN** two differently-colored regions are joined
- **THEN** the merged region takes the color group of the larger of the two

#### Scenario: A blank square inside a chain does not number it

- **WHEN** the search runs on a 5×5 board with two chains, on which numbering
  a chain from zero would force links until one is left
- **THEN** it reports several answers

### Requirement: Signpost reports mistakes for Check & Save

`signpost` SHALL implement `findMistakes(state)`: it SHALL take the board's
one chain from the search that counts its answers, at either difficulty, and
flag every cell whose player `next` link disagrees with the solution's. A
flagged cell, a given's included, SHALL be drawn with its number in the error
color. A cell with no outgoing player link SHALL never be flagged. Where the
search did not prove exactly one chain, `findMistakes` SHALL return no
mistakes.

#### Scenario: A wrong link is flagged

- **WHEN** the player links two cells that are not consecutive in the unique
  solution and requests Check & Save
- **THEN** `findMistakes` flags that link, its cell is drawn with the error
  styling on the next paint, and the save is refused

#### Scenario: A wrong link out of a given

- **WHEN** the player drags a link out of the `1` to a cell the solution does
  not put second, and requests Check & Save
- **THEN** the `1` is drawn in the error color, though a clash of numbers
  never recolors a given

#### Scenario: A hand-typed ambiguous board reports nothing

- **WHEN** `findMistakes` runs on a desc with no unique solution
- **THEN** it returns an empty list

### Requirement: Signpost's live error overlay is not its mistake check

The live error overlay SHALL flag links that are locally inconsistent, a loop
or a clash of numbers, and SHALL NOT flag a link for being globally wrong,
which is what `findMistakes` reports.

#### Scenario: A wrong link that clashes with nothing

- **WHEN** on a generated board the player makes a link that is not in the
  solution and causes no loop and no clash of numbers
- **THEN** the live overlay shows no error, and Check & Save flags the link

### Requirement: Signpost exposes the victory-flash preference

`signpost` SHALL expose one preference, `flash-type`, a choice of
"unidirectional" or "meshing gears" victory rotation. The win flash SHALL spin
the arrows: every arrow one way when unidirectional, and alternate squares in
opposite ways when meshing gears.

#### Scenario: The flash preference is offered and applied

- **WHEN** the player opens Preferences for signpost
- **THEN** a victory-rotation-effect choice is shown, and selecting "meshing
  gears" makes alternate cells spin in opposite directions on the next win

### Requirement: Signpost solves by forced-link deduction

The solver SHALL iterate the renumbering and a single forced-link deduction to
a fixpoint: if a cell has exactly one legal next cell it can link to, the
solver SHALL make that link, and symmetrically for a sole legal predecessor. A
link SHALL be legal to the solver only where the region fits the numeric gap it
would bridge. The solver SHALL report the board solved, stuck, or impossible.
`solve()` SHALL take the chain from the search that counts a board's answers,
at either difficulty.

#### Scenario: Forced links are deduced

- **WHEN** the solver runs on a board where a cell points at exactly one
  legal continuation
- **THEN** it links them, and iterating to a fixpoint solves any generated
  Easy board

#### Scenario: Solve recovers the chain from a dirty state

- **WHEN** `solve()` is invoked on a partially- and wrongly-linked board
- **THEN** it returns a move reconstructing the correct full `1 … n` chain

### Requirement: Signpost generates solver-gated boards reproducibly

For a given random seed and params, `newDesc` SHALL produce the same desc on
every run, and at Easy the clues it leaves SHALL be enough for the solver to
solve the board.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Signpost description

### Requirement: An arrow follows a Signpost drag

While a drag is in progress an arrow SHALL be drawn at the pointer, over the
board, and SHALL leave nothing behind it when the pointer moves.

#### Scenario: The sprite moves

- **WHEN** a drag moves between two frames
- **THEN** the second frame shows the arrow at the new position and the board
  as it was where the first frame drew it

### Requirement: Signpost draws its squares on the collection's quiet surface

`redraw` SHALL draw a square that is in no chain on the collection's cell
surface, and a square whose number the puzzle fixed on the lifted surface of a
given, so a given is told by the cell under it as well as by its number's
color. Every other square SHALL keep its chain's region color, which is the
game. The surface's thin grid line SHALL run between squares, so two squares of
one chain are still two squares, and the frame round the grid SHALL be no
heavier than it.

#### Scenario: Three kinds of square

- **WHEN** a board holds a square in no chain, a given and a square the player
  has linked into a lettered chain
- **THEN** the first is the plain cell surface, the second the lifted surface
  and the third its chain's region color

### Requirement: A Signpost given keeps its surface and its number's strength

A given SHALL keep its lifted surface while a drag dims the rest of the board.
A given's number SHALL be drawn at full strength whether or not the square is
linked on both sides, and at its middle strength only while a drag dims it,
since the faint strengths are made for a region's fill and do not clear the
lifted surface in the dark scheme.

#### Scenario: A linked given stays readable

- **WHEN** a given is linked to its successor and has no predecessor to find
- **THEN** its number is drawn in the full fixed-number color on the lifted
  surface

### Requirement: Signpost counts a board's answers by a bounded search

The game SHALL count a board's chains up to two by trial and error over the
solver: where the solver stops, it SHALL take the cell with the fewest cells
it could link to and assume each in turn, nearest first. It SHALL report one
answer, several, none, or that it stopped at its budget, which SHALL be
counted in positions and never in time.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 4×4 board the solver finishes, on one with
  one chain that it does not reach, on the first without its one middle
  given, and on the first with the `1`'s arrow pointing off the grid
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given four positions on a board that needs five
- **THEN** it reports that it stopped, and with five it reports one answer

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with their middle givens
  taken away and the same with one arrow turned are each counted by numbering
  the squares one after another along the arrows
- **THEN** the search reports one answer exactly where one chain fits,
  several where more do and none where none does

### Requirement: An Unreasonable Signpost board has one answer that the solver does not reach

At Unreasonable the generator SHALL take an Easy board and strip further
given numbers, never the first or the last, each only while the search still
proves one chain within a budget of its own, well under the search's, and
SHALL keep the board only when the solver stops short on it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 4×4 to 6×6, with the
  ends in the corners and free
- **THEN** the solver leaves each unfinished
- **AND** exactly one chain fits each, by a count that has no search in it

#### Scenario: The smallest boards and the largest carry the tier

- **WHEN** an Unreasonable 1×6 board, a 3×3 board with free ends, a 2×5
  board, a 7×7 board and a 15×15 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Signpost refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of five squares or fewer, a 2×3 or 2×4 board, and a 3×3 board with its
ends in the corners. The solver finishes every board of these that shows its
first and last numbers and has one chain.

#### Scenario: Such a board is not dealt at Unreasonable

- **WHEN** a 1×5 board, a 2×3 board, a 4×2 board and a 3×3 board with corner
  start are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 1×6 board, a 2×5 board and a 3×3 board with free ends are
  admitted

#### Scenario: Every board of such a shape is tried

- **WHEN** every chain through a shape's squares, with every set of givens
  that includes the first and last numbers, is given to the solver, and those
  it leaves unfinished are counted
- **THEN** none of them has exactly one chain
- **AND** the same walk over a 1×6 board with corner start finds two that do

### Requirement: Unreasonable Signpost is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 225 squares or longer than 30 on a side, with a reason
naming the difficulty. The same size SHALL still be asked for at Easy.

#### Scenario: A size past the bound is refused at Unreasonable only

- **WHEN** a 16×16 board and a 5×45 board are checked for dealing at each
  difficulty
- **THEN** each is refused at Unreasonable and not at Easy
- **AND** a 15×15, a 9×25 and a 7×30 board are admitted at Unreasonable

### Requirement: Signpost's menu offers each size at both difficulties

Signpost's presets SHALL offer each of 4×4, 5×5, 6×6 and 7×7 with corner
start as Easy and as Unreasonable, then 4×4 and 5×5 with free ends at Easy,
and the default SHALL be the Easy 4×4 with corner start.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Signpost's preset menu is read
- **THEN** its four sizes each appear as Easy and then as Unreasonable,
  followed by the two boards with free ends

### Requirement: A pasted Signpost board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one chain that they
do not reach, whatever lower difficulty its ID states. A board with several
chains SHALL be refused as having more than one solution, and a board with
none as one that contradicts itself.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one chain the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params end in `du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 4×4 board with two places for its 8, and one whose `1` points
  off the grid, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Signpost's hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the links forced from the player's own and no others, and where none is
forced it SHALL refuse with the collection's sentence that deduction has run
out. It SHALL go on from the links the player then makes.

#### Scenario: The hint stops, and goes on from a link tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a link made wrongly there is reported by the mistake check
- **AND** with a link made as the solution has it wherever the hint stops,
  the hint finishes the board
