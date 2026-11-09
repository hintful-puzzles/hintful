## MODIFIED Requirements

### Requirement: Solver: Signpost solves by forced-link deduction

The solver SHALL be the ladder `signpost.description.yaml` states, run to a
fixpoint, each square's number read off its chain of links: `onlyNext` links a square to
the one square its arrow points at that can come next, and `onlyBefore`
links a square other than the 1 to the one arrow that can lead into it. A
link SHALL be legal to the solver only where the region fits the numeric gap
it would bridge. The solver SHALL report the board solved, stuck, or
impossible.

#### Scenario: Forced links are deduced

- **WHEN** the solver runs on a board where a cell points at exactly one
  legal continuation
- **THEN** it links them, and iterating to a fixpoint solves any generated
  Easy board

### Requirement: Hint: Signpost's hint finds the one square that can come next

Where all but one of the squares an unlinked arrow points at are ruled out, the
hint SHALL link the arrow to the one left. A square SHALL be ruled out when it
is in the arrow's own chain, when it already follows another square, or when
its number or its chain's cannot follow the arrow's, and SHALL be given the
first of those it has. The sentence SHALL give each reason some ruled-out
square is given: "follow others", "are in its chain", "hold the wrong
number", in the singular of one such square.

#### Scenario: An arrow with one square ahead of it

- **WHEN** the first step is asked for on the 4×4 board `1e9cfgddgadcaaabh16a`
- **THEN** it links the last square of the second row to the one square its
  arrow points at, and says "This arrow points only at the ringed square, so
  it must come next."

#### Scenario: One rival

- **WHEN** the first step is asked for on the 5×5 board
  `degffe1egegb4eccacbbagca25aah`, where an arrow points at two squares and
  one holds a number that cannot come next
- **THEN** the step says "This arrow's other square holds the wrong number,
  so only the ringed one can follow."

#### Scenario: Two reasons among the rivals

- **WHEN** of the squares an arrow points at, one already follows another
  square and one holds a number that cannot come next
- **THEN** the step says "This arrow's other squares follow others or hold
  the wrong number, so only the ringed one can follow."

### Requirement: Hint: Signpost's hint finds the one arrow that can lead in

Where a square other than the 1 has nothing before it and all but one of the
arrows pointing at it are ruled out, the hint SHALL link the arrow left to it.
An arrow SHALL be ruled out when its square already leads elsewhere, is in
the target's own chain, or holds a number that cannot come before the
target's, and SHALL be given the first of those reasons it has. The sentence
SHALL give each reason some ruled-out arrow is given: "lead elsewhere", "are
in its chain", "hold the wrong number".

#### Scenario: One arrow points at the square

- **WHEN** a single arrow points at a square with nothing before it
- **THEN** the step says "Only this arrow points at the ringed square, so the
  square must follow it."

#### Scenario: Rivals with two reasons

- **WHEN** of the other arrows pointing at the square, one is already linked
  onward and one is in the square's own chain
- **THEN** the step says "The outlined arrows into the ringed square lead
  elsewhere or are in its chain, so it must follow this arrow."

## REMOVED Requirements

### Requirement: Params: Signpost refuses an area past what a signed 32-bit number holds

**Reason**: A side is at most 31 squares, since a square's link is a value of the ladder's candidate mask, so no board's area comes near the limit.
**Migration**: "Params: Signpost refuses a side longer than 31 squares" states the bound.

### Requirement: Hint: Signpost's hint tries the next square, then the arrow in

**Reason**: The hint is the ladder's walk, as every described game's is: it takes the link that continues from the squares its latest steps linked, so a player follows one deduction into the next it opens.
**Migration**: "Hint: Signpost's hint continues from its last link" states the order.

## ADDED Requirements

### Requirement: Params: Signpost refuses a side longer than 31 squares

Signpost's width and height SHALL each be bounded to 31 by its `paramConfig`,
so a game ID or a Custom size with a longer side SHALL be refused, naming
the field.

#### Scenario: A height of 32

- **WHEN** the preset `4x4cde` has its height changed to `32`
- **THEN** the params are refused with "Height must be at most 31."

### Requirement: Hint: Signpost's hint continues from its last link

`hint` SHALL take, of every link the ladder could make, one that continues
from the squares the latest steps linked, and otherwise the first in the
ladder's order: an arrow with one square that can come next, the first in
reading order; failing that, a square with one arrow that can lead in, the
first in reading order.

#### Scenario: An arrow in waits for the arrows out

- **WHEN** no link the ladder could make continues from the latest steps, one
  arrow on the board has a single square that can come next, and an earlier
  square in reading order has a single arrow that can lead into it
- **THEN** the step is the arrow with one square that can come next
