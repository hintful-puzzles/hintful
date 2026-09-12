## MODIFIED Requirements

### Requirement: Salad ports the solver as a shared Latin-square consumer

Salad SHALL provide a solver built on the shared `engine/latin.ts` framework, adding
its own deduction — in ABC End View mode — the border-clue deduction. The "some
squares empty" rule SHALL be realized by declaring the empty square to the shared
cube as its repeated symbol (`nums + 1`, appearing `order − nums` times per line),
so that the cube's own positional, numeric and set eliminations reason about
empty squares directly; a cross SHALL be that symbol placed and a ball that symbol
struck, and the board's marker array SHALL be read back off the solved cube.

The solver SHALL provide two difficulties, Easy and Normal, and both SHALL be
solvable by pure deduction without guessing. The generator SHALL use the solver to
keep every board uniquely solvable: it SHALL generate a full Latin square, then
remove clues in a randomized order, keeping a removal only while the puzzle stays
uniquely solvable at the target difficulty. Generation from a given seed SHALL be
reproducible.

#### Scenario: The solver deduces the unique solution without guessing

- **WHEN** a generated board is solved at its difficulty
- **THEN** the solver reaches the unique completion using only its deductive
  techniques, never backtracking search

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

## REMOVED Requirements

### Requirement: Salad grades its difficulty tiers honestly

**Reason**: It names Salad's tiers Normal and Extreme, and its scenario's heading
carries the retired word; the tiers are Easy and Normal. A scenario is matched by
its heading, so the heading cannot be corrected in place.

**Migration**: Replaced by "Salad's Normal tier is never soluble at Easy", which
states the same gate, measurements and retry bound in the current tier names.

## ADDED Requirements

### Requirement: Salad's Normal tier is never soluble at Easy

A Salad board generated at Normal SHALL NOT be soluble at Easy.

This diverges from upstream, which has no difficulty gate at all: it strips clues
while the board still solves at the target tier and publishes the result. The
setting therefore did not bind — **12 of the 13 Normal-tier boards in this game's
own frozen reference fixtures are soluble at Easy**, as were 71 of 80 freshly
generated boards, and in the Number Ball mode at 5×5 and 6×6 it was every board
sampled.

Because generation is solver-gated at every clue removal, the correction changes
every Normal-tier description; the byte-for-byte differential SHALL retain a way
to run upstream's original gate, used by that differential alone.

Normal-tier boards are genuinely rare in the Number Ball mode — a median of 486
candidate boards per success at 5×5, and a worst measured case of 4,419 — so the
generation retry bound SHALL be set high enough that a legal seed cannot exhaust
it. Exhaustion is a failure a player sees.

#### Scenario: A Normal board genuinely needs the Normal tier

- **WHEN** a board generated at Normal is solved at Easy
- **THEN** the solver does not reach a solution
- **AND** solving the same board at Normal does
