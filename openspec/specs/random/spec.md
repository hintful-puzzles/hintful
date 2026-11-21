# random Specification

## Purpose
The seeded random-number generator that game generation draws on: what a
generator asks of it, a seed's stream, a draw's range and a state that
continues. Which numbers a seed gives is not held to upstream's or to an
earlier build.

## Requirements

### Requirement: A seed deals one stream

`randomNew` SHALL deal, from the same seed, the same stream of draws every
time within a build, and a different stream from a different seed. Which
numbers the stream holds SHALL NOT be pinned, to `random.c` or to an earlier
build: no board a player keeps names a seed.

#### Scenario: The same seed twice

- **WHEN** two states are made from the same seed and 200 draws of 32 bits are
  taken from each
- **THEN** the two runs are equal, and a run from another seed is not

#### Scenario: A change moves the stream

- **WHEN** a change to the module makes a seed deal other numbers
- **THEN** no test fails for that alone, and the boards it moves are noticed by
  the hint-walk snapshots

### Requirement: A draw stays within its range

`randomBits(state, n)` SHALL return an integer in `[0, 2^n)`, a 32-bit draw
unsigned with no sign extension or precision loss. `randomUpto(state, limit)`
SHALL return an integer in `[0, limit)`, and reach every such value.

#### Scenario: A 32-bit draw lands in the top half

- **WHEN** `randomBits(state, 32)` is drawn repeatedly
- **THEN** every value is a non-negative integer below 2^32, and some are at or
  above 2^31

#### Scenario: Every value below a limit is reached

- **WHEN** `randomUpto` is drawn forty times per value for a limit
- **THEN** every value is below the limit, and every value below it occurs

### Requirement: A copy or an encoded state continues the stream

`randomCopy` SHALL return a state whose draws continue the original's stream
and run on independently of it. `randomStateDecode(randomStateEncode(state))`
SHALL do the same, and encode back to the same string.

#### Scenario: A copy continues the stream

- **WHEN** a state is copied part way through its stream, and 50 draws are
  taken from each
- **THEN** the two runs are equal

#### Scenario: An encoded state continues the stream

- **WHEN** a state is encoded and decoded part way through its stream
- **THEN** the decoded state encodes to the same string, and its next draws are
  the original's
