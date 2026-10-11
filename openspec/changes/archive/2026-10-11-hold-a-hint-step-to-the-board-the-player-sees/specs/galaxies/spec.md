## REMOVED Requirements

### Requirement: The hint settles a square only one dot can own

**Reason**: Its first scenario is named for, and states, a reason that is
false of most boards the step is said on: a dot is also dropped when the
square is past its reach, or lies in a finished galaxy.

**Migration**: "The hint settles a square no other dot's galaxy can stretch
to" states the same two steps with a sentence true of every firing.

## ADDED Requirements

### Requirement: The hint settles a square no other dot's galaxy can stretch to

The hint SHALL settle a square when exactly one dot passes the test a
cell-to-dot drag rings its candidates by, marking none of the dots that fail
it, and SHALL give no one way a dot fails as its reason. It SHALL settle a
square only one galaxy can still stretch to, saying no other galaxy reaches it
and striping that galaxy's reach. Each step SHALL ring the square, its partner
and the dot.

#### Scenario: A drag from the square would ring one dot

- **WHEN** a drag from an empty square would ring exactly one dot, and no
  earlier deduction applies
- **THEN** the step says no galaxy around another dot can stretch to this
  cell, so it and its partner must belong to the ringed dot

#### Scenario: A dot dropped for reach alone

- **WHEN** another dot's mirror of the square is on the board and on no dot,
  and other dots' squares cut the square off from it
- **THEN** the step's sentence is still true of that dot

#### Scenario: Only one galaxy reaches a square

- **WHEN** one galaxy alone can still stretch to an empty square, and no
  earlier deduction applies, a square only one dot can own among them
- **THEN** the step says no other galaxy reaches this cell, so it and its
  partner must join the ringed dot, whose reach the stripes show
