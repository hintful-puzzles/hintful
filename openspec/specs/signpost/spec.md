# signpost Specification

## Purpose
Signpost, the puzzle of linking every square into one numbered sequence in which
each square's arrow points toward the next: its rules, what its params refuse
and its description encoding, how the chains are numbered and colored, its
mistake checking, what its solver and its hint deduce, and how its squares
look.

## Requirements

### Requirement: Rules: Signpost links every square into one numbered chain

Signpost SHALL be played on a `w × h` grid in which every cell carries an
arrow, one of 8 directions, and some cells carry immutable sequence numbers;
the player links cells into a single chain `1 … n`, where `n = w*h`, in which
every link follows its cell's arrow and the numbers run consecutively.

#### Scenario: A finished chain solves the board

- **WHEN** every cell is linked into one chain `1 … n` whose links each follow
  their cell's arrow
- **THEN** the game's status is solved

### Requirement: Rules: A new Signpost board holds the description's arrows and givens

`newState` SHALL parse the desc into per-cell arrow directions and immutable
numbers, which no move SHALL change in any later state of the game. The only
links a new board holds SHALL be those joining two consecutive immutable
numbers of which the lower one's arrow points at the higher.

#### Scenario: Consecutive givens start linked

- **WHEN** a desc gives `k` and `k+1` and the arrow of `k` points at `k+1`
- **THEN** the new state holds the link from `k` to `k+1`, and no link the
  givens do not make

### Requirement: Rules: Signpost's region colors follow the links

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

### Requirement: Rules: Signpost reports mistakes for Check & Save

`findMistakes(state)` SHALL flag every cell whose player `next` link
disagrees with the board's one chain. A flagged cell, a given's included,
SHALL be drawn with its number in the error color. A cell with no outgoing
player link SHALL never be flagged.

#### Scenario: A wrong link out of a given

- **WHEN** the player drags a link out of the `1` to a cell the solution does
  not put second, and requests Check & Save
- **THEN** the `1` is drawn in the error color, though a clash of numbers
  never recolors a given

### Requirement: Rules: Signpost's live error overlay is not its mistake check

The live error overlay SHALL flag links that are locally inconsistent, a loop
or a clash of numbers, and SHALL NOT flag a link for being globally wrong,
which is what `findMistakes` reports.

#### Scenario: A wrong link that clashes with nothing

- **WHEN** on a generated board the player makes a link that is not in the
  solution and causes no loop and no clash of numbers
- **THEN** the live overlay shows no error, and Check & Save flags the link

### Requirement: Rules: Signpost links a number to the next by itself

On a new board and after every move, wherever two squares hold numbers of the
sequence `k` and `k + 1` and the arrow of `k` points at `k + 1`, the game SHALL
link them itself, so a link between consecutive numbers is never the player's
to make.

#### Scenario: The 14 and the 15

- **WHEN** the first nine steps of the hint's plan are played from the fresh
  4×4 board `1e9cfgddgadcaaabh16a`, which leaves the second and third squares
  of the second row numbered 15 and 14, the 14's arrow pointing at the 15
- **THEN** the 14 is linked to the 15, though none of the nine links joined
  them

### Requirement: Params: A Signpost params string may leave out its height and its difficulty

Signpost's params, a size, whether the chain starts and ends in corners, and
a difficulty, SHALL be bounded and encoded as its `paramConfig` and its
declared codec give (`engine-params`, "A game declares its params encoding
once, and both codec halves are derived"), and its menu and default SHALL be
what `presets` and `defaultParams` give. A bare number SHALL decode as a
square grid, a string with no difficulty letter as Easy, and one with no `c`,
the short form among them, with free ends.

#### Scenario: A string that leaves the difficulty out

- **WHEN** `5x5c`, written before the game had tiers, is decoded
- **THEN** it decodes to the params `5x5cde` does

#### Scenario: A string that leaves the corner letter out

- **WHEN** `6x4` is decoded
- **THEN** it decodes to the params `6x4de` does, a board with free ends

### Requirement: Params: Signpost refuses to deal a 1×1 board

`validateParams` SHALL refuse a 1×1 grid when a board is to be dealt.

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 1×1 grid for full generation
- **THEN** it answers "Width and height cannot both be one."

### Requirement: Params: Signpost refuses Unreasonable where no board needs it

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

### Requirement: Params: Signpost refuses an area past what a signed 32-bit number holds

`validateParams` SHALL refuse a `w·h` above 2,147,483,647, in the collection's
sentence "Width times height must not be unreasonably large."

#### Scenario: A height of ten digits

- **WHEN** the preset `4x4cde` has its height changed to `1000000000`
- **THEN** the params are refused with "Width times height must not be
  unreasonably large."

### Requirement: Description: Signpost descriptions use the upstream per-cell encoding

The desc SHALL encode the grid row-major, one token per cell: a direction
letter `a`–`h` (`a` = N … `h` = NW) alone for a cell with no immutable number,
or the decimal number followed by the direction letter for an
immutable-numbered cell.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: Description: A malformed Signpost description is refused

Validating a desc SHALL refuse an unknown character, a number out of range, and
a token count that does not match `w*h`.

#### Scenario: A malformed description is rejected

- **WHEN** a desc whose token count does not match `w*h`, or one holding an
  unknown direction character, is validated
- **THEN** the result is a non-null error

### Requirement: Description: A Signpost description gives no number twice

A desc that gives the same number to two cells SHALL be refused.

#### Scenario: Two cells given 1

- **WHEN** `1e9cfgddgadcaaabh16a`, a 4×4 board whose givens are 1, 9 and 16,
  has its 9 changed to 1
- **THEN** it is refused with "This game ID gives the same number twice."

### Requirement: Generation: Signpost generates solver-gated boards

At Easy the clues `newDesc` leaves SHALL be enough for the solver to solve the
board.

#### Scenario: A number the solver needs stays given

- **WHEN** `newDesc` strips an Easy board, and taking a number out leaves a
  board the solver does not finish
- **THEN** that number stays given

### Requirement: Generation: An Unreasonable Signpost board is an Easy one with more numbers taken away

Signpost's Unreasonable boards SHALL be dealt by the engine's deal
(`engine-difficulty`, "The engine deals the Unreasonable board of a game that
searches"), from an Easy board, with a strip of the game's own: further given
numbers are taken away, never the first or the last, each only while the
search still proves one chain.

#### Scenario: The smallest boards and the largest carry the tier

- **WHEN** an Unreasonable 1×6 board, a 3×3 board with free ends, a 2×5
  board, a 7×7 board and a 15×15 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Generation: A Signpost board is Easy where the solver and the hint both finish it

A board SHALL count as Easy where the solver and the hint finish it, and as
Unreasonable where it has exactly one chain that they do not reach.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one chain the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params end in `du`

### Requirement: Solver: Signpost solves by forced-link deduction

The solver SHALL iterate the renumbering and a single forced-link deduction to
a fixpoint: if a cell has exactly one legal next cell it can link to, the
solver SHALL make that link, and symmetrically for a sole legal predecessor. A
link SHALL be legal to the solver only where the region fits the numeric gap it
would bridge. The solver SHALL report the board solved, stuck, or impossible.

#### Scenario: Forced links are deduced

- **WHEN** the solver runs on a board where a cell points at exactly one
  legal continuation
- **THEN** it links them, and iterating to a fixpoint solves any generated
  Easy board

### Requirement: Solver: Signpost's search assumes each link of the cell with the fewest, nearest first

Signpost's search for a board's chains SHALL run over the solver: where the
solver stops, it SHALL take the cell with the fewest cells it could link to
and assume each in turn, nearest first.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 4×4 board the solver finishes, on one with
  one chain that it does not reach, on the first without its one middle
  given, and on the first with the `1`'s arrow pointing off the grid
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with their middle givens
  taken away and the same with one arrow turned are each counted by numbering
  the squares one after another along the arrows
- **THEN** the search reports one answer exactly where one chain fits,
  several where more do and none where none does

### Requirement: Controls: A Signpost drag links the square pressed and the square released on

A left-drag SHALL link the square pressed to the square it is released on as
the one that follows it, and a right-drag as the one that precedes it. The link
SHALL be made only where the earlier square's arrow points at the later, the
two are in different chains, the earlier is not the given last number nor the
later the given 1, and, where both hold numbers of the sequence, those are
consecutive. Making it SHALL break the link the earlier square had onward and
the one the later had inward.

#### Scenario: The same link from either end

- **WHEN** on the 4×4 board `1e9cfgddgadcaaabh16a` the last square of the
  second row, whose arrow points north, is left-dragged to the square above
  it, or that square is right-dragged down to it
- **THEN** either drag links the lower square to the upper as the one that
  follows it

#### Scenario: A release on the square pressed

- **WHEN** a square is pressed and released without leaving it
- **THEN** no move is made

#### Scenario: A press that starts no drag

- **WHEN** the given last number is pressed with the left button, or the given
  1 with the right
- **THEN** no drag starts, since nothing follows the one and nothing precedes
  the other

### Requirement: Controls: A Signpost drag off the grid unlinks

A left-drag released off the grid SHALL break both links of the square
pressed. A right-drag released off the grid SHALL break every link of every
square in that square's chain, unless the chain is numbered from a given, when
it SHALL break only the links of the square pressed. A drag off the grid from
a square with no link SHALL make no move.

#### Scenario: A lettered chain is broken up

- **WHEN** three squares are linked in a chain that reaches no given, and the
  middle one is right-dragged off the grid
- **THEN** none of the three is linked

#### Scenario: A numbered chain loses one square

- **WHEN** a square in the chain that runs from the given 1 is right-dragged
  off the grid
- **THEN** only that square's two links are broken

### Requirement: Controls: Signpost's keys pick a square up and put it down

With the cursor showing, Enter SHALL begin a link from the cursor's square to
the one that follows it, and Space to the one that precedes it; the arrow keys
SHALL then carry the drag with the cursor, and Enter or Space SHALL release it
on the cursor's square as a pointer does. `x` SHALL break the links of the
cursor's square as a left-drag off the grid does, and Shift+X those of its
chain as a right-drag off the grid does. The cursor SHALL stop at the grid's
edges.

#### Scenario: A hidden cursor is only shown

- **WHEN** Enter or Space is pressed while the cursor is hidden
- **THEN** the cursor shows and no square is picked up
- **AND** `x` pressed while the cursor is hidden does nothing

#### Scenario: Either key puts the square down

- **WHEN** Enter picks a square up, the cursor is moved to a square its arrow
  points at, and Space is pressed
- **THEN** the first square is linked to the second as the one before it

### Requirement: Hint: Signpost's hint finishes an Unreasonable board from links tried rightly

On an Unreasonable board the hint's steps SHALL be the links forced from the
player's own, and with a link made as the solution has it wherever the hint
stops, the hint SHALL finish the board.

#### Scenario: The hint goes on from a link tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses, and
  a link is made as the solution has it wherever the hint stops
- **THEN** the hint finishes the board

### Requirement: Hint: A Signpost hint asks for no link the board already holds

Every step the hint shows SHALL be a link the board does not hold. A link
between consecutive numbers, which the board makes itself, SHALL NOT be shown
as a step for the player to make: the plan SHALL make those links on its own
copy after each step, as the board does after each move.

#### Scenario: A plan made afresh

- **WHEN** a hint is asked for on a board with no plan on display, as on the
  fresh 4×4 board `1e9cfgddgadcaaabh16a`
- **THEN** the step shown links two squares the board does not hold linked

#### Scenario: A plan followed to its end

- **WHEN** the plan made on the fresh 4×4 board `1e9cfgddgadcaaabh16a` is
  followed step by step
- **THEN** every step links two squares the board does not hold linked when
  it is reached, and none says a number "must come right after" another

### Requirement: Hint: Signpost's hint finds the one square that can come next

Where all but one of the squares an unlinked arrow points at are ruled out, the
hint SHALL link the arrow to the one left. A square SHALL be ruled out when it
is in the arrow's own chain, when its number or its chain's cannot follow the
arrow's, or when it already follows another square. The sentence SHALL give
each reason some ruled-out square has: "follow others", "are in its chain",
"hold the wrong number", in the singular of one such square.

#### Scenario: An arrow with one square ahead of it

- **WHEN** the first step is asked for on the 4×4 board `1e9cfgddgadcaaabh16a`
- **THEN** it links the last square of the second row to the one square its
  arrow points at, and says "This arrow points only at the ringed square, so
  it must come next."

#### Scenario: One rival

- **WHEN** the first step is asked for on the 5×5 board
  `degffe1egegb4eccacbbagca25aah`, where an arrow points at two squares and
  one holds a number that cannot come next
- **THEN** the step says "The other square this arrow points at holds the
  wrong number, so only the ringed one can follow it."

#### Scenario: Two reasons among the rivals

- **WHEN** of the squares an arrow points at, one already follows another
  square and one holds a number that cannot come next
- **THEN** the step says "The other squares this arrow points at follow others
  or hold the wrong number, so only the ringed one can follow it."

### Requirement: Hint: Signpost's hint finds the one arrow that can lead in

Where a square other than the 1 has nothing before it and all but one of the
arrows pointing at it are ruled out, the hint SHALL link the arrow left to it.
An arrow SHALL be ruled out when its square already leads elsewhere, is in the
target's own chain, or holds a number that cannot come before the target's,
and the sentence SHALL give each reason some ruled-out arrow has: "lead
elsewhere", "are in its chain", "hold the wrong number".

#### Scenario: One arrow points at the square

- **WHEN** a single arrow points at a square with nothing before it
- **THEN** the step says "Only this arrow points at the ringed square, so it
  must lead there."

#### Scenario: Rivals with two reasons

- **WHEN** of the other arrows pointing at the square, one is already linked
  onward and one is in the square's own chain
- **THEN** the step says "The outlined arrows into the ringed square lead
  elsewhere or are in its chain, so this arrow must lead there."

### Requirement: Hint: Signpost's hint tries the next square, then the arrow in

Each step of the plan SHALL be one link, the first that the board allows with
the plan's earlier links made: an arrow with one square that can come next,
the first in reading order; failing that, a square with one arrow that can
lead in, the first in reading order.

#### Scenario: An arrow in waits for the arrows out

- **WHEN** one arrow on the board has a single square that can come next, and
  an earlier square in reading order has a single arrow that can lead into it
- **THEN** the step is the arrow with one square that can come next

### Requirement: Hint: A Signpost hint step stripes the squares ahead of its arrow only where there are several

A step for the one square that can come next SHALL stripe the squares its
arrow points at only where there are several.

#### Scenario: An arrow with one square ahead of it stripes nothing

- **WHEN** a step's arrow points at a single square
- **THEN** that square is ringed, the arrow is in the hint color, and no
  square is striped

### Requirement: Look: An arrow follows a Signpost drag

While a drag is in progress an arrow SHALL be drawn at the pointer, over the
board, and SHALL leave nothing behind it when the pointer moves.

#### Scenario: The sprite moves

- **WHEN** a drag moves between two frames
- **THEN** the second frame shows the arrow at the new position and the board
  as it was where the first frame drew it

### Requirement: Look: Signpost draws its squares on the collection's quiet surface

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

### Requirement: Look: A Signpost given keeps its surface and its number's strength

A given SHALL keep its lifted surface while a drag dims the rest of the board.
A given's number SHALL be drawn at full strength whether or not the square is
linked on both sides, and at its middle strength only while a drag dims it,
since the faint strengths are made for a region's fill and do not clear the
lifted surface in the dark scheme.

#### Scenario: A linked given stays readable

- **WHEN** a given is linked to its successor and has no predecessor to find
- **THEN** its number is drawn in the full fixed-number color on the lifted
  surface

### Requirement: Look: A chain's color is a region fill, repeated past the eighth

A floating chain SHALL take its color from the region palette's eight by its
letter, in an order that stands each color furthest from the next, and a
chain past the eighth SHALL take them again from the first. No chain color
SHALL be a mix of two fills, and any two SHALL stand at least the neighbor
floor apart in both schemes.

#### Scenario: The ninth chain

- **WHEN** a ninth floating chain is lettered
- **THEN** it takes the first chain's color, and its letter tells the two
  apart
