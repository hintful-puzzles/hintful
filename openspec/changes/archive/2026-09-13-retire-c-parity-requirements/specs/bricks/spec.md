## ADDED Requirements

### Requirement: Bricks solves and generates by deduction

Bricks SHALL provide a solver that decides whether a grid is complete, still
unfinished, or invalid, from three rules: no three consecutive shaded cells in a
horizontal line, every shaded cell supported by a shaded cell below it, and every
numbered cell's shaded-neighbor count consistent with its clue. The solver SHALL
place cells by contradiction — tentatively shading or unshading a cell and forcing
the opposite when that leads to an invalid grid — with bounded lookahead for the
harder difficulties. Every difficulty tier SHALL be solvable by pure deduction; the
solver SHALL NOT rely on guessing.

The generator SHALL use the solver to keep every puzzle uniquely solvable at its
target difficulty: it SHALL fill the grid under the support and run-length
constraints, number it, then remove numbers in a randomized order, keeping a
removal only while the puzzle stays uniquely solvable. Generation from a given seed
SHALL be reproducible.

#### Scenario: The solver reaches the unique solution

- **WHEN** a generated board is solved
- **THEN** the solver marks it complete and its cells match the intended solution

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

## MODIFIED Requirements

### Requirement: Bricks grades the tiers it does offer

A Bricks board generated at a difficulty above the easiest SHALL NOT be soluble at
the tier below it. The acceptance gate SHALL probe the tier immediately below the
one requested; upstream probes at Easy whatever tier was requested, which is
correct for the second tier only by coincidence.

The rename changes no description: it is a menu label, and the
solver's rungs are untouched.

#### Scenario: An Unreasonable board genuinely needs its own tier

- **WHEN** a board generated at `Unreasonable` is solved at Easy
- **THEN** the solver does not reach a solution
- **AND** solving the same board at `Unreasonable` does

## REMOVED Requirements

### Requirement: Bricks ports the deductive solver and generator faithfully

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. Its heading promised a faithful port of upstream's solver and generator. The requirement is restated under a name that does not assert fidelity to upstream, which a `MODIFIED` block cannot rename.

**Migration**: Replaced by "Bricks solves and generates by deduction", whose body is unchanged.
