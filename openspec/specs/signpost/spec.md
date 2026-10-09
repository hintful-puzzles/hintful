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

Params SHALL be `w`, `h` and `forceCornerStart`, a boolean. They SHALL encode
as `{w}x{h}`, with a trailing `c` in the full encoding only, when corner start
is set, and a bare `{n}` SHALL decode as a square grid. A width or a height
below one SHALL be refused, and `validateParams` SHALL refuse a 1×1 grid for
full generation.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, forceCornerStart: true }` are encoded in
  full
- **THEN** the result is `5x5c` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 1×1 grid for full generation
- **THEN** it returns a non-null error string

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
pick the lowest unused color group.

#### Scenario: Linking renumbers a region

- **WHEN** the player links a cell numbered `k` to a blank cell it points at
- **THEN** the blank cell derives number `k+1` and the two cells share one
  region and color group

#### Scenario: Merging keeps the dominant color

- **WHEN** two differently-colored regions are joined
- **THEN** the merged region takes the color group of the larger of the two

### Requirement: Signpost reports mistakes for Check & Save

Because generated boards are uniquely solvable, `signpost` SHALL implement
`findMistakes(state)`: it SHALL re-solve from the immutable clues and, if that
yields a unique complete chain, flag every cell whose player `next` link
disagrees with the solution's link, and a flagged cell SHALL be drawn with the
error styling. Cells with no outgoing player link SHALL never be flagged. If
the board is not uniquely solvable, `findMistakes` SHALL return no mistakes.

#### Scenario: A wrong link is flagged

- **WHEN** the player links two cells that are not consecutive in the unique
  solution and requests Check & Save
- **THEN** `findMistakes` flags that link, its cell is drawn with the error
  styling on the next paint, and the save is refused

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

#### Scenario: Forced links are deduced

- **WHEN** the solver runs on a board where a cell points at exactly one
  legal continuation
- **THEN** it links them, and iterating to a fixpoint solves any generated
  board

#### Scenario: Solve recovers the chain from a dirty state

- **WHEN** `solve()` is invoked on a partially- and wrongly-linked board
- **THEN** it returns a move reconstructing the correct full `1 … n` chain

### Requirement: Signpost generates solver-gated boards reproducibly

For a given random seed and params, `newDesc` SHALL produce the same desc on
every run, and the clues it leaves SHALL be enough for the solver to solve the
board.

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
