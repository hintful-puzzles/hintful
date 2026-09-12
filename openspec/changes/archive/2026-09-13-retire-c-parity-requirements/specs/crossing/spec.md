## ADDED Requirements

### Requirement: Crossing never generates a cell no clue can reach

Generation SHALL reject a candidate board containing an open cell that belongs
to no run, since no clue number can reach it: it would stay blank on a finished
board, and — the completion check inspecting only runs — would accept any digit
the player put there. Upstream produces such boards and records the fault as a
generator TODO.

#### Scenario: Every open cell of a generated board lies in a run

- **WHEN** a board is generated for any preset or legal size
- **THEN** every cell that is not a wall belongs to at least one horizontal or
  vertical run

## MODIFIED Requirements

### Requirement: Crossing descriptions use the upstream run-length encoding

A Crossing description SHALL encode the walls in row-major order as alternating
runs — a decimal count for a run of open cells and a letter `a`–`z` for a run of
1 to 26 wall cells — followed by a comma and the list of clue numbers as decimal
digits separated by commas. The clue numbers SHALL be stored sorted by length and
then lexicographically, matching the order the description emits.

Validation SHALL reject a description containing an unknown wall character, a
description that supplies more cell data than the board holds, a clue number
longer than the maximum row length, and a duplicate clue number. Those are its only
checks: it does not reject an over-short description or an invalid digit
character.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board and re-encoded
- **THEN** the resulting description is identical

#### Scenario: A description with an unknown wall character is rejected

- **WHEN** a description whose wall section contains a character outside the
  digit and `a`–`z` runs is validated
- **THEN** it is rejected as containing an invalid character

#### Scenario: A description with a duplicate clue number is rejected

- **WHEN** a description whose clue list repeats a number is validated
- **THEN** it is rejected as containing a duplicate number

## REMOVED Requirements

### Requirement: Crossing generates no cell that a clue cannot reach

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. It required a generator option reproducing upstream's descriptions byte-for-byte for the C-reference differential, with a scenario asserting it; a `MODIFIED` block cannot drop that scenario.

**Migration**: Replaced by "Crossing never generates a cell no clue can reach", which keeps the rejection rule and its scenario. The option and the differential that uses it stay in the code as a refactoring net, required by no spec.
