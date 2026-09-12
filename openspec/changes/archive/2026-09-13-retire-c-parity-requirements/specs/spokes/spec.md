## ADDED Requirements

### Requirement: Spokes' difficulty tiers bind the boards they generate

A Spokes board generated at a difficulty above the easiest SHALL NOT be soluble at
the tier below it. The acceptance check that decides this SHALL run from an empty
position, so that its verdict describes the board being offered rather than any
state left over from an earlier candidate.

This deliberately diverges from upstream, whose equivalent check re-solves a scratch
board whose lines still carry the previous candidate's solution, and which therefore
both rejects boards for reasons unrelated to difficulty and admits boards an easier
tier can crack. Because generation is solver-gated, the divergence changes every
description on the two harder tiers.

#### Scenario: An Unreasonable board genuinely needs its own tier

- **WHEN** a board generated at `Unreasonable` is solved at Normal
- **THEN** the solver does not reach a solution
- **AND** solving the same board at `Unreasonable` does reach one

## REMOVED Requirements

### Requirement: Spokes grades its difficulty tiers honestly

**Reason**: It required the game to retain upstream's original acceptance check so a byte-for-byte differential against the C could still run, with a scenario asserting the match. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Spokes' difficulty tiers bind the boards they generate", which keeps the tier-honesty rule, its empty-position check and its scenario without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.
