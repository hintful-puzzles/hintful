## MODIFIED Requirements

### Requirement: Generation: Ascent solves with a four-tier deductive solver

The solver SHALL find the unique completion of a graded puzzle or report that
it cannot, by the ladder Ascent's description states, without guessing. Easy
SHALL apply single-position and simple proximity, Normal full proximity,
Tricky simple single-number, and Hard full single-number and overlap. An
Edges board SHALL add each arrow's line at Easy and overlap at Normal.

#### Scenario: A graded board is solved only at its difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** the graded solver reaches the unique completion at that difficulty, and
  a strictly weaker ruleset does not

## ADDED Requirements

### Requirement: Generation: Ascent's solver reasons only as its hint teaches

The solver SHALL NOT reason over path links, which the player cannot mark and
the hint does not teach, so that every board the generator deals is one the
hint finishes.

#### Scenario: Every board the generator deals is finished by the hint

- **WHEN** a board is dealt at any tier and grid mode and the hint is followed
  from its start
- **THEN** the hint finishes it, one true number at a time
