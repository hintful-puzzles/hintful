# loopy

## ADDED Requirements

### Requirement: Loopy settles a blocked corner pair in one deduction

Loopy's solver SHALL recognize, as a single deduction at its easiest tier, a clued
face needing all but one of its still-open edges where two dots adjacent around it
each already carry a line: the edge between those two dots SHALL be ruled out and
every other open edge of the face SHALL be drawn, in one firing.

The deduction SHALL be stated over the clue rather than over any one digit or any
one tiling — a square clued 3 and a triangle clued 2 are the same deduction — and
SHALL rest on the same guard as the one-dot deduction it strengthens, so that a
face already carrying some of its lines is covered without a second rule.

The conclusions this deduction reaches SHALL already be reachable by the tier's
existing rungs, so that no board changes the tier it is graded at and no generated
description changes. A future strengthening that is *not* conclusion-preserving
SHALL be measured against a corpus graded both ways before it is written, because
a board labeled at a tier a player no longer needs is a dishonest difficulty.

`hint(state)` SHALL narrate this firing as one step that rings both dots, outlines
the clue, and bands every edge it settles — solid for the lines, broken for the
edge it rules out — and SHALL name the excluded edge as the one joining the two
dots rather than by any direction, since most of Loopy's tilings have no top. The
sentence SHALL NOT describe the loop's path around the clue, because the same
firing covers faces where the loop goes round nothing.

#### Scenario: Two blocked dots settle the whole clue at once

- **WHEN** a clue needs all but one of its open edges and two dots next to each
  other around it already have a line
- **THEN** one firing rules out the edge between those dots and draws every other
  open edge of the clue, and the hint shows it as a single step with both dots
  ringed

#### Scenario: The same deduction on a face that is not a square

- **WHEN** the face is a triangle clued 2, or any other face clued one short of
  its order
- **THEN** the same deduction fires and its sentence reads the same with that
  clue's digit throughout

#### Scenario: Teaching the solver the pattern regrades no board

- **WHEN** every board of the frozen differential is generated and graded
- **THEN** each description is unchanged byte for byte and each board still needs
  the difficulty it was recorded at, rather than becoming solvable one tier lower
