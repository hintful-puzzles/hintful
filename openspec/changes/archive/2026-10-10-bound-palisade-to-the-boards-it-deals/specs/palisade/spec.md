## MODIFIED Requirements

### Requirement: Palisade refuses a region size the grid cannot be divided by

The bounds the params declare SHALL refuse a `w`, an `h` or a `k` below 1.
`validateParams` SHALL refuse a `k` that does not divide `w·h`. Under full
validation it SHALL also refuse `k = w·h`, and `k = 2` unless `w` or `h` is 1.
It SHALL refuse no size for the time its deal takes, at either difficulty: a
player can stop a deal.

#### Scenario: Invalid params are rejected

- **WHEN** params are fully validated with `k` not dividing `w·h`, or
  `k = w·h`, or `k = 2` on a board wider and taller than 1
- **THEN** the result is a non-null error string

#### Scenario: A region size of zero is refused by its bound

- **WHEN** params `{ w: 5, h: 5, k: 0 }` are validated
- **THEN** the refusal is "Region size must be at least 1."

#### Scenario: A large board and one in many regions are asked for

- **WHEN** a 14×13 board in sevens, a 30×30 board in threes and a 40×60 board
  in twenties are checked for dealing at Easy and at Unreasonable
- **THEN** none is refused

### Requirement: Palisade generates uniquely solvable boards

At Easy `newDesc` SHALL emit only a board the deductive solver solves from
its clues alone, so the board has one division and needs no guess. It SHALL
strip clues, keeping a clue removed only while the solver still solves the
board. It SHALL deal a board at every size `validateParams` admits, at both
difficulties: a division the solver cannot solve from all of its clues is
divided again where it stalls, and is not thrown away.

#### Scenario: Generated boards are solvable

- **WHEN** `newDesc` produces an Easy board for each preset across several
  seeds
- **THEN** the deductive solver solves each board to a valid division (every
  region size `k`, every clue satisfied, no stray walls)

#### Scenario: Boards in many small regions are dealt

- **WHEN** a 9×9 board in threes is dealt at Easy and at Unreasonable, and a
  12×12 board in fours at Easy
- **THEN** each is dealt, and the lowest difficulty that solves it is the one
  asked for

#### Scenario: No board of a size that stalls often is given up on

- **WHEN** a hundred Easy 6×6 boards in threes are dealt
- **THEN** every one is dealt, and the solver solves it

## REMOVED Requirements

### Requirement: Unreasonable is bounded on its own measurements

**Reason**: The bound refused boards that deal. Past it every Unreasonable
deal measured returned a board with one answer that the solver stops short
of, and only took longer, and a deal's wait is the player's to stop.

**Migration**: "Palisade refuses a region size the grid cannot be divided by"
says that no size is refused for its wait. A strip and a board in regions of
one are still refused at Unreasonable, by "Palisade refuses Unreasonable where
no board needs it".
