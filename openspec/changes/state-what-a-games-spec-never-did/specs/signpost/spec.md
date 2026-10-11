## ADDED Requirements

### Requirement: A Signpost description gives no number twice

A desc that gives the same number to two cells SHALL be refused.

#### Scenario: Two cells given 1

- **WHEN** `1e9cfgddgadcaaabh16a`, a 4×4 board whose givens are 1, 9 and 16,
  has its 9 changed to 1
- **THEN** it is refused with "This game ID gives the same number twice."

### Requirement: Signpost refuses an area past what a signed 32-bit number holds

`validateParams` SHALL refuse a `w·h` above 2,147,483,647, in the collection's
sentence "Width times height must not be unreasonably large."

#### Scenario: A height of ten digits

- **WHEN** the preset `4x4cde` has its height changed to `1000000000`
- **THEN** the params are refused with "Width times height must not be
  unreasonably large."

### Requirement: A Signpost drag links the square pressed and the square released on

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

### Requirement: A Signpost drag off the grid unlinks

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

### Requirement: Signpost's keys pick a square up and put it down

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

### Requirement: Signpost links a number to the next by itself

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

### Requirement: A Signpost hint asks for no link the board already holds

Every step the hint shows SHALL be a link the board does not hold. A link
between consecutive numbers, which the board makes itself, SHALL NOT be shown
as a step for the player to make.

#### Scenario: A plan made afresh

- **WHEN** a hint is asked for on a board with no plan on display, as on the
  fresh 4×4 board `1e9cfgddgadcaaabh16a`
- **THEN** the step shown links two squares the board does not hold linked

### Requirement: Signpost's hint finds the one square that can come next

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

### Requirement: Signpost's hint finds the one arrow that can lead in

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

### Requirement: Signpost's hint tries the next square, then the arrow in

Each step of the plan SHALL be one link, the first that the board allows with
the plan's earlier links made: an arrow with one square that can come next,
the first in reading order; failing that, a square with one arrow that can
lead in, the first in reading order.

#### Scenario: An arrow in waits for the arrows out

- **WHEN** one arrow on the board has a single square that can come next, and
  an earlier square in reading order has a single arrow that can lead into it
- **THEN** the step is the arrow with one square that can come next

### Requirement: A Signpost hint step marks both ends of its link

A step SHALL draw the arrow its link leaves by in the hint color and ring the
square the link arrives at. A step for the one square that can come next SHALL
stripe every square its arrow points at, where there are several, and a step
for the one arrow that can lead in SHALL outline the other squares whose arrows
point at the ringed square.

#### Scenario: An arrow with one square ahead of it stripes nothing

- **WHEN** a step's arrow points at a single square
- **THEN** that square is ringed, the arrow is in the hint color, and no
  square is striped
