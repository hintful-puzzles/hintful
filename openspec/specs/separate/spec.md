# separate Specification

## Purpose
Separate: every cell of a `w × h` grid holds one of `k` letters, each letter
occurring `w·h/k` times, and the player draws walls along the edges to divide
the grid into connected regions of `k` cells that each hold one of each letter.
This capability specifies the game's own part: its params and description, its
three-valued walls and half-grid cursor, what counts as solved and as a
mistake, what its generator promises, its shading of completed regions, and its
deduction hint and that hint's words. The border-marking mechanic is shared
with Palisade, and this spec says what is shared and what stays Separate's.

## Requirements

### Requirement: Separate's parameters are a size and a letter count

Params SHALL be `w`, `h`, `k` (the letter count) and a difficulty, Easy or
Unreasonable. They SHALL encode as `{w}x{h}n{k}`, and the difficulty in the
full form only, as `de` or `du`. A bare `{w}` SHALL decode to a square
`w × w` grid with `k = w`, and a string with no difficulty letter as Easy.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, h: 6, k: 4 }` are encoded
- **THEN** the result is `6x6n4`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `5` yields `{ w: 5, h: 5, k: 5 }`

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 6×6 board with four letters is encoded
- **THEN** the full encoding is `6x6n4du` and the shared one `6x6n4`
- **AND** `6x6n4`, written before the game had tiers, decodes as Easy

### Requirement: Separate refuses a letter count the grid cannot be divided by

`validateParams` SHALL refuse a `k` that does not divide `w·h`, and an
unreasonably large `w·h`. Under full validation it SHALL also refuse a `k`
equal to the whole grid, a `k` of 1, and a `k` above 26, the letters of the
alphabet.

#### Scenario: Invalid params are rejected

- **WHEN** params are fully validated with a `k` that does not divide `w·h`,
  or with `k = w·h`
- **THEN** the result is a non-null error string

#### Scenario: One letter, or more letters than the alphabet

- **WHEN** a 6×6 board is fully validated with `k = 1`, or a 27×27 board with
  `k = 27`
- **THEN** the result is a non-null error string

### Requirement: Separate descriptions encode the letters grid

The desc SHALL be the `w·h` letters in row-major order, each an uppercase
letter `A + grid[i]`, so `k` distinct letters from `A`. Validating a desc SHALL
reject one of the wrong length, and one containing a character outside
`A .. A+k-1`.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and its letters are
  re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc of the wrong length, or with a letter outside the alphabet
  `A .. A+k-1`, is validated
- **THEN** the result is a non-null error string

### Requirement: A new Separate board holds its letters and only the rim walls

`newState` SHALL parse the desc into the letters and an all-unknown wall
state, with only the grid-rim walls set.

#### Scenario: A fresh board has no interior wall

- **WHEN** `newState` builds a board from a valid desc
- **THEN** every edge on the grid's rim is a wall
- **AND** every edge between two cells is unknown

### Requirement: Separate uses a three-valued wall model with a half-grid cursor

The player SHALL divide the grid by toggling edges. Each edge SHALL be
three-valued (wall, no-wall mark or unknown) and shared between the two cells
it separates, so every edit records both sides. A half-grid keyboard cursor,
with corner, edge and center coordinates in `[1, 2w-1] × [1, 2h-1]`, SHALL move
with the arrow keys and set the edge it rests on with select and select2.

#### Scenario: Clicking an interior edge toggles a wall on both sides

- **WHEN** the player left-clicks near the shared edge between two adjacent
  cells
- **THEN** the returned move sets the wall bit on that edge of both cells
- **AND** re-applying the same click clears it

### Requirement: Each button toggles the nearest edge toward its own state

A left click SHALL act on the edge nearest the pointer, toggling it between
wall and unknown. A right click SHALL toggle it between no-wall mark and
unknown. An edge holding the other button's state SHALL go straight to the
clicked button's state, without passing through unknown.

#### Scenario: A right click turns a wall into a no-wall mark

- **WHEN** the player right-clicks near an interior edge that is a wall
- **THEN** the returned move clears the wall bit and sets the no-wall bit on
  that edge of both cells

### Requirement: The grid rim cannot be edited

`executeMove` SHALL reject a move that would toggle a grid-rim wall. An input
that changes nothing SHALL return `null`, so it leaves no history entry.

#### Scenario: Rim walls cannot be toggled

- **WHEN** a move would toggle a wall on the outer boundary of the grid
- **THEN** `executeMove` rejects it

### Requirement: Separate is solved when every region is a one-of-each k-omino

A state SHALL be solved iff the walls divide the grid into connected components
each of exactly `k` cells, each component containing each of the `k` letters
exactly once, and no wall lies interior to a component. `status` SHALL report
`solved` in that case and `ongoing` otherwise.

#### Scenario: A correct partition is solved

- **WHEN** the walls partition the grid into `k`-ominoes each holding one of each
  letter
- **THEN** `status` reports `solved`

#### Scenario: A duplicate-letter region is not solved

- **WHEN** a wall-bounded region has size `k` but contains a repeated letter
- **THEN** `status` reports `ongoing`

### Requirement: Every generated Separate board is solved by its own solver

At Easy the generator SHALL emit only a board the solver, run to a fixpoint
from an empty board, fully solves, so every Easy board has one partition and
that solver reaches it. It SHALL deal a board at every size `validateParams`
admits for dealing, at both difficulties: it divides the grid into regions
none of which holds a ring of squares, and places the letters so that the
solver finishes.

#### Scenario: Generated boards are uniquely solvable

- **WHEN** the generator produces an Easy board for given params
- **THEN** the solver run to a fixpoint partitions it into `k`-ominoes each
  holding one of each letter

#### Scenario: Boards in many regions and in many letters are dealt

- **WHEN** a 12×12 board with two letters, a 9×9 board with three, an 8×8
  board with eight and a 4×5 board with ten are dealt at Easy
- **THEN** each is dealt, and the solver solves it

#### Scenario: The same sizes are dealt at Unreasonable

- **WHEN** a 9×9 board with three letters and an 8×8 board with eight are
  dealt at Unreasonable
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Separate shades completed correct regions

The render SHALL fill a wall-bounded region with the shared finished-region
role, `REGION_DONE`, a wash of the theme pair's first hue, once it is a
completed, correct region: exactly `k` cells, holding one of each letter with
no duplicate, with no wall interior to it. The untouched board, one undivided
region, SHALL NOT be filled. The fill SHALL be a local check on the region as
drawn, not a check against the unique solution.

#### Scenario: A completed region is shaded, the rest is not

- **WHEN** the player seals one region of the unique solution (its full boundary)
  while the rest of the grid is still undivided
- **THEN** exactly that region's `k` cells render with the finished-region fill
- **AND** the untouched remainder does not

#### Scenario: Breaking a region clears its fill

- **WHEN** the player removes a wall from the boundary of a filled region
- **THEN** the next `redraw` draws that region's cells without the fill

### Requirement: Separate ships findMistakes for Check & Save

The game SHALL implement `findMistakes`: take the board's one partition from
the search that counts its answers, at either difficulty, and return every
player edge whose state contradicts it, a wall where the solution has none or
a no-wall mark where the solution has a wall. A flagged edge SHALL be drawn
in the error color. Where the search did not prove exactly one partition
`findMistakes` SHALL return an empty list.

#### Scenario: A contradicting wall is flagged

- **WHEN** the player draws a wall that the unique solution does not have and
  Check & Save runs
- **THEN** `findMistakes` includes that edge
- **AND** the next `redraw` draws that edge in the error color

### Requirement: Separate's clue layer stays its own

Separate's region constraints (required region sizes and the cells that must
be kept apart), its solver, its generator and its clue rendering SHALL remain
entirely its own: the letter, the repeated-letter error inside a completed
region, and the test that decides when a region is finished.

#### Scenario: A repeated letter in a completed region is Separate's error

- **WHEN** a wall-bounded region of exactly `k` cells holds one letter twice
- **THEN** Separate's own tile callback draws both of those letters in the
  error color

### Requirement: Separate runs its solver as a declared ladder that its hint shares

Separate's solver SHALL run on `runDeductionFixpoint` as three tier-0
techniques, in order: `shared-letter`, `walled-apart` and `only-way`. The
working state SHALL carry the same facts as border-grid bytes, so the generator
and the hint run the same techniques on the same state.

#### Scenario: The hint and the generator run one ladder

- **WHEN** the hint asks for the next firing on a player's board
- **THEN** it comes from the same three techniques, in the same order, that
  the generator's solve attempt runs

### Requirement: The ladder's three techniques disconnect, wall and merge

`shared-letter` SHALL mark two adjacent components that already hold a common
letter disconnected, and wall every edge between them. `walled-apart` SHALL
wall an open edge between two disconnected components. `only-way` SHALL merge
an under-size component that has exactly one legal neighboring square with that
square, marking the edges between them "no wall".

#### Scenario: Two neighbors with the same letter are walled apart

- **WHEN** two adjacent lone squares hold the same letter
- **THEN** `shared-letter` disconnects them and walls the edge between them

### Requirement: Separate offers a deduction-based hint

Separate SHALL provide `hint()`, seeded from the player's own marks (no-wall
marks merge, walls disconnect), returning one multi-leg journey per firing of
its ladder, each leg setting one edge.

#### Scenario: The hint finishes from the player's own positions

- **WHEN** hints are followed one recomputed step at a time from a fresh board or from a board revealing a random share of the solution's edges
- **THEN** the board is solved and no hint refuses

### Requirement: A hint sentence rests on the player's own marks

Every hint sentence SHALL rest only on letters, walls and regions joined by the
player's own marks. A step citing two regions SHALL stripe one and outline the
other and name both marks, calling a lone square a square and never a region.
A `shared-letter` or `only-way` firing's first sentence SHALL instead name a
lone square by its letter, and two lone squares that share a letter SHALL both
be outlined.

#### Scenario: Two regions are named by their marks

- **WHEN** a displayed step cites two regions of more than one square each
- **THEN** one is striped and the other outlined, and the sentence names both
  marks

#### Scenario: A lone square is named by its letter

- **WHEN** the first step of a `shared-letter` firing cites a region and a lone
  square
- **THEN** the region is striped and the square outlined
- **AND** the sentence names the square by its letter, not as a region

#### Scenario: A lone square a wall separates keeps its mark

- **WHEN** a `walled-apart` step cites a lone square and a larger region
- **THEN** one is striped and the other outlined, either of which may be the
  lone one, and the sentence calls it a square: "A wall already separates the
  striped square and the outlined region" where the square is the striped one,
  and "the striped region and the outlined square" where it is the outlined

### Requirement: Separate draws its cells on the collection's quiet surface

`redraw` SHALL draw every cell's body on the collection's cell surface, with
its letter in ink. No cell SHALL be lifted as a given, since every cell holds a
letter the puzzle fixed and the player enters none: the surface is one tone and
the edges carry the board. The edges SHALL keep their own roles and strengths:
a wall in ink, an edge ruled out and an edge undecided each in its own color.

#### Scenario: Every cell is the same surface

- **WHEN** an untouched board is drawn
- **THEN** every cell's body is the plain cell surface

### Requirement: The solved flash lifts every cell

The solved flash SHALL lift every cell to the given's surface on its lit beats,
a step that reads in both schemes.

#### Scenario: The flash lifts the cells

- **WHEN** the solved flash is on a lit beat
- **THEN** every cell's body is the lifted surface

### Requirement: Separate counts a board's answers by a bounded search

The game SHALL count a board's partitions up to two by trial and error over
the solver: where the solver stops, it SHALL take the region with the fewest
squares it could still grow into and assume it takes the first of them, and
then that it does not. It SHALL report one answer, several, none, or that it
stopped at its budget, which SHALL be counted in positions and never in time.
Solve SHALL take the answer from it at either difficulty.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 4×4 board the solver finishes, on one with
  one partition that it does not reach, on one whose rows and whose 2×2
  blocks each hold one of each letter, and on one that is all As
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, and the same with letters swapped
  anywhere, are each counted by laying whole regions down one at a time
- **THEN** the search reports one answer exactly where one partition fits,
  several where more do and none where none does

### Requirement: Separate's solver run says when a position is impossible

After the rungs stop, a position SHALL be reported contradictory where a
region short of its size has no neighboring square it may still take, and
solved once every region is of full size.

#### Scenario: A region that cannot grow is told at once

- **WHEN** a 5×5 board that needs 13 positions is searched with 13, and with
  12
- **THEN** it has one answer with 13 and is out of reach with 12

### Requirement: An Unreasonable Separate board has one answer that the solver does not reach

At Unreasonable the generator SHALL take an Easy board and swap pairs of
letters inside a region it was dealt from, each only while the search still
proves one partition within a budget of its own, well under the search's, and
SHALL keep the board only when the solver stops short on it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 4×4 to 6×6
- **THEN** the solver leaves each unfinished
- **AND** exactly one partition fits each, by a count that has no search in it

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 4×2 board with four letters, 3×3 with three, 6×2
  with three and 6×6 with six is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Separate refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide or high, one with two letters, and a 3×2 board with
three. No such board has one partition that the solver does not reach.

#### Scenario: Such a board is not dealt at Unreasonable

- **WHEN** a 6×1 board with three letters, a 4×4 board with two and a 2×3
  board with three are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** the same params with a description supplied are accepted
- **AND** a 6×1 board with three letters is still dealt at Easy

#### Scenario: Every fill of a small such board is tried

- **WHEN** every fill of a strip, of a board with two letters up to 4×4 and
  of a 3×2 board with three letters is given to the solver, and those it
  leaves unfinished are counted by laying whole regions down
- **THEN** none of them has exactly one partition
- **AND** a 3×3 board with three letters has a fill that the solver leaves
  unfinished and that has exactly one

### Requirement: Separate's menu offers each board at both difficulties

Separate's presets SHALL offer each of its four boards, 4×4 with four
letters, 5×5 with five, 6×6 with four and 6×6 with six, as Easy and as
Unreasonable, and the default SHALL be the Easy 5×5.

#### Scenario: Every board is offered at both difficulties

- **WHEN** Separate's preset menu is read
- **THEN** its four boards each appear as Easy and then as Unreasonable

### Requirement: A pasted Separate board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one partition that
they do not reach, whatever lower difficulty its ID states. A board with
several partitions SHALL be refused as having more than one solution, and a
board with none as one that contradicts itself.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one partition the solver does not reach
  is entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4n4du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 4×4 board whose rows and 2×2 blocks each hold one of each
  letter, and one that is all As, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Separate's hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the edges its rungs force from the player's walls and marks and no
others, and where none is forced it SHALL refuse with the collection's
sentence that deduction has run out. It SHALL go on from the edges the player
then decides.

#### Scenario: The hint stops, and goes on from an edge tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** an edge decided wrongly there is reported by the mistake check
- **AND** with an edge decided as the solution has it wherever the hint
  stops, the hint finishes the board

### Requirement: Separate refuses to deal a size its generator gives up on

Under full validation, on a grid wider and taller than one square,
`validateParams` SHALL refuse more than 13 letters; from 8 letters, a grid
whose squares times letters squared exceed 10,000; 13 letters on a grid two
squares wide; and 9 or more letters on a grid three squares wide that they
divide into two regions. The refusal SHALL say to use fewer letters or a
smaller grid.

#### Scenario: Many letters on a large grid

- **WHEN** a 10×11 board with ten letters, or a 12×14 board with eight, is
  checked for dealing
- **THEN** it is refused as too rare to deal, with the advice to use fewer
  letters or a smaller grid
- **AND** a 10×10 board with ten letters and a 12×12 board with eight are not
  refused

#### Scenario: The narrow shapes

- **WHEN** a 4×7 board with fourteen letters, a 2×13 board with thirteen, or
  a 3×6 board with nine is checked for dealing
- **THEN** each is refused
- **AND** a 4×13 board with thirteen letters, a 2×12 board with twelve and a
  3×4 board with six are not

#### Scenario: A strip takes any letter count

- **WHEN** a 1×52 board with 26 letters is checked for dealing
- **THEN** it is not refused

### Requirement: Separate refuses no size of up to seven letters

`validateParams` SHALL refuse no board of seven letters or fewer for its
size or for the time its deal takes, at either difficulty, beyond the area
the params can hold: a player can stop a deal.

#### Scenario: A large board in few letters is asked for

- **WHEN** a 40×40 board with two letters and a 21×21 board with seven are
  checked for dealing at Easy
- **THEN** neither is refused

### Requirement: A Separate board of a size that is not dealt still opens

A board that arrives with its description SHALL be opened at any size
`validateParams` admits without full validation, the sizes it refuses to
deal among them.

#### Scenario: A pasted board of a refused size

- **WHEN** a 3×6 board with nine letters that has one answer is loaded from
  its ID
- **THEN** it opens, at the difficulty it needs
