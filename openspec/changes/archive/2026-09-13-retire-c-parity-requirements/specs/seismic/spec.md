## ADDED Requirements

### Requirement: Seismic solves by candidate elimination and generates regions before numbers

Seismic SHALL provide a solver that fills the grid by candidate elimination — a
naked single and a hidden single within a region at Easy, plus a trial-placement
deduction at Normal — reporting the difficulty reached or that the puzzle is not
uniquely soluble. The solver SHALL enforce the mode's keep-apart rule and the
one-of-each-number-per-region rule while eliminating candidates.

The generator SHALL partition the grid into connected regions **before** placing
any number, and SHALL then fill each region with the numbers 1 to its size by
searching over the solver's own candidate propagation, so that a region holds
exactly the numbers it requires by construction. It SHALL NOT depend on a
post-hoc test that a randomly-merged region happens to hold a valid number set:
that is upstream's approach, its author records it as needing replacement, and its
success rate falls to nothing above roughly fifty cells. The generator SHALL then
strip clues while the puzzle stays soluble at the target difficulty, and accept a
puzzle only when it is soluble at that difficulty and not at the difficulty below
— both stages unchanged. Generation from a given seed SHALL be reproducible.

Every generated board SHALL satisfy, by test rather than by luck: every region is
connected and holds exactly the numbers 1 to its size; the mode's keep-apart rule
holds across the whole solution; and the description round-trips through the
codec.

#### Scenario: The solver grades a puzzle's difficulty

- **WHEN** a uniquely soluble puzzle is solved
- **THEN** the solver reports the lowest difficulty at which its deductions
  complete the grid

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

#### Scenario: Every region is valid by construction

- **WHEN** a board is generated at any preset
- **THEN** each of its regions is connected and holds exactly one of each number
  from 1 to that region's size, and no two equal numbers violate the mode's
  keep-apart rule

## REMOVED Requirements

### Requirement: Seismic ports the deductive solver and solver-gated generator

**Reason**: It required the frozen C-reference descriptions, through upstream's generator retained behind a differential-only option, to match upstream's C byte-for-byte, a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement, and that obligation is a scenario of its own, which a `MODIFIED` block cannot drop.

**Migration**: Replaced by "Seismic solves by candidate elimination and generates regions before numbers", which keeps the solver, the regions-first generator, the by-test board properties and the three behavioral scenarios without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.
