## MODIFIED Requirements

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

### Requirement: Signpost solves by forced-link deduction

The solver SHALL iterate the renumbering and a single forced-link deduction to
a fixpoint: if a cell has exactly one legal next cell it can link to, the
solver SHALL make that link, and symmetrically for a sole legal predecessor. A
link SHALL be legal to the solver only where the region fits the numeric gap it
would bridge. The solver SHALL report the board solved, stuck, or impossible.
`solve()` SHALL take the chain from the search that counts a board's answers,
at either difficulty, whatever links the player has made.

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

## ADDED Requirements

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
