## ADDED Requirements

### Requirement: Subsets solves by candidate elimination and generates uniqueness-gated boards

Subsets SHALL provide a solver that reports whether a board is complete,
unfinished or invalid, driven by a candidate-elimination fixpoint over the set of
possible set-values per cell. The solver SHALL apply arrow propagation (a superset
cell contains its subset neighbor's confirmed letters, and a subset cell cannot
hold letters its superset lacks), missing-arrow disjointness, single-count and
single-position placement, and the advanced arrow-subset elimination, in the
upstream order.

The solver SHALL take an explicit difficulty cap, with no default: an implicit
cap is how a caller silently measures a tier it did not mean. At the lowest tier
the rule set SHALL be upstream's compiled strength exactly — that is, without
upstream's disabled advanced-rule branch. Above it the solver SHALL additionally
apply the **mirror half** of the advanced arrow rule: where an arrow forces
`set(head) ⊂ set(tail)`, a surviving candidate at the head that fits inside no
surviving candidate at the tail SHALL be eliminated. Upstream wrote this half,
commented it out under `TODO repair this`, and shipped without it.

That elimination SHALL be sound: it SHALL never remove a set-value that the
board's own solution places in that cell. An unsound elimination yields a puzzle
whose advertised unique solution the solver has ruled out, which is worse than a
weak solver, so soundness SHALL be checked against the generator's known
assignment rather than against the other cap.

The generator SHALL assign every set-value to the grid by a single shuffle, derive
all arrow clues from the subset relation, then blank cells in a shuffled order,
keeping a cell blank only while the solver, capped at the requested tier, still
reaches a complete solution. Above the lowest tier the generator SHALL also
reject a candidate board that the tier below already solves, and SHALL redraw a
wholly fresh board rather than perturbing the rejected one — every candidate here
consumes fresh randomness, so a plain retry cannot re-derive what it rejected.

Generation from a given seed SHALL be reproducible.

#### Scenario: The solver classifies a board

- **WHEN** a solvable board, an ambiguous board and a rule-violating board are each
  solved
- **THEN** the solver reports complete, unfinished and invalid respectively

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

#### Scenario: A board above the lowest tier needs its tier

- **WHEN** a board generated above the lowest tier is solved with the ladder
  capped one tier below it
- **THEN** the solver does not reach a complete solution

#### Scenario: The restored elimination never removes the true answer

- **WHEN** a generated board is re-solved from its description with the ladder at
  its top
- **THEN** the solved board matches, cell for cell, the assignment the generator
  blanked to produce it

## REMOVED Requirements

### Requirement: Subsets ports the deductive solver and uniqueness-gated generator

**Reason**: It required the lowest tier's generator to reproduce the C description byte-for-byte, with a scenario asserting it. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Subsets solves by candidate elimination and generates uniqueness-gated boards", which keeps the solver, the restored elimination, the generator and its scenarios without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.
