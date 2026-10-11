## ADDED Requirements

### Requirement: A Bridges description writes a count above nine as a capital letter

An island's count SHALL be written `1` to `9`, then `A` to `G` for 10 to 16,
and a run of empty squares as a lowercase letter, `a` for one to `z` for
twenty-six. The description SHALL cover every square of the grid, the empty
ones after the last island included.

#### Scenario: A dealt 7×7 board

- **WHEN** `2d1c1a3a3a2a6a2h5b7b5g2b1b2` is opened as a 7×7 board
- **THEN** its top row holds a 2 in its first square and a 1 in its sixth, and
  its last square holds a 2
- **AND** with that last `2` written `H` it is refused for the character,
  where `G` is read as an island of 16

### Requirement: Bridges refuses a tier that so few islands cannot need

When a board is to be dealt above Easy, `validateParams` SHALL refuse, as a
board with no such puzzle, one whose island target (the percentage of its
squares, and never under three) is three; at Tricky one of four, or of five
with two bridges a line and no loops made; and at Normal with one bridge a
line one of five or fewer, or one with loops allowed and 100% expansion. No
loops are made where loops are disallowed or the expansion is 0%.

#### Scenario: Four islands at Tricky

- **WHEN** a 4×4 board at 25% islands, whose target is four, is asked for at
  Tricky and at Normal with two bridges a line
- **THEN** the first is refused with "No puzzle of 4 islands is Tricky." and
  the second is not refused

### Requirement: Bridges refuses a percentage past its last choice when dealing

When a board is to be dealt, `validateParams` SHALL refuse an island
percentage over 30 and an expansion over 100. A typed ID can carry one that
the engine's check of the field's choices lets by, the few values that fall
to the last choice; the engine refuses the rest, for a deal and for a board
that arrives with its description alike.

#### Scenario: Thirty-two percent islands

- **WHEN** the preset `7x7i30e10m2d0` is asked for with its `i30` written
  `i32`
- **THEN** it is refused with "%age of island squares must be between 1% and
  30%."

### Requirement: A Bridges arrow steps the cursor to the nearest island that way

A bare arrow SHALL move the keyboard cursor to an island in that direction:
the one least far to the side, and of those the nearest forward, never one
further to the side than forward. It SHALL leave the cursor where it is when
there is none. The letters `A` to `F`, in either case, SHALL
jump to an island of 10 to 15 as a digit does to one of its number, and `0`
to one of 16. `G`, in either case, SHALL switch the possible-bridge lines on
or off, as the `show-hints` preference does.

#### Scenario: The nearest island is off the cursor's row

- **WHEN** the cursor is on an island with no island to its right in its own
  row, and there is one a column to the right and a row down
- **THEN** Right moves the cursor to that island

### Requirement: A Bridges hint asks its stages in order after every step

The hint SHALL ask its stages in this order and take the first that fires,
starting again from the first after each firing: the single-island
arithmetic; from Normal the direction counting with its loop check, then
sealing off; from Tricky the connected-group deductions. Within a stage it
SHALL take the islands in the order the description lists them.

#### Scenario: An Easy deduction is spoken before a Normal one

- **WHEN** on a Normal board one island has exactly enough room left, and
  another needs a bridge one way by counting its other directions
- **THEN** the step is the first island's

### Requirement: A Bridges label says only what departs from two bridges, 30% islands and 10% expansion

A board's label SHALL say "no loops" where loops are disallowed, "max N
bridges" (or "max 1 bridge") where the most bridges a line may carry is not
two, "N% islands" where that is not 30, and "N% expansion" where that is not
10, and SHALL say none of them otherwise.

#### Scenario: The preset that disallows loops

- **WHEN** `10x10i30e10m2Ld1` is labeled
- **THEN** the label is "10x10 Normal, no loops"
