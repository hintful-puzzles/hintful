## REMOVED Requirements

### Requirement: Params: ABCD refuses board sizes it cannot generate

**Reason**: The bound was drawn from generation rates, which say a board is
rare and not that none exists, and a rare size is dealt (`engine-difficulty`,
"A rare tier is dealt under the deadline"). Measured 2026-10-21 under the
deal's deadline, an Easy 10×10 of four letters, refused as having no puzzle,
was found on 5 deals of 12.

**Migration**: None. These sizes are dealt, and the deadline answers one
that finds no board in time.

### Requirement: Params: The bound is measured across size, shape and letter count

**Reason**: There is no Easy bound to measure ("ABCD refuses board sizes it
cannot generate" is removed).

**Migration**: None.

### Requirement: Params: ABCD's bound is asserted in both directions

**Reason**: There is no bound to assert ("ABCD refuses board sizes it cannot
generate" is removed). Every preset is still held to being accepted.

**Migration**: None.

### Requirement: Params: Unreasonable is bounded on its own measurements

**Reason**: The bound was drawn from deal times, and a size is not refused
for its wait (`engine-difficulty`, "A rare tier is dealt under the
deadline"). Measured 2026-10-21, an Unreasonable 12×12 of three letters
deals in 12 s and a 9×9 of eight without diagonal touching in 57 s.

**Migration**: None. These sizes are dealt, and the deadline answers one
that finds no board in time.

## MODIFIED Requirements

### Requirement: Params: ABCD refuses Unreasonable where none of a size's boards needs it

When a board is to be dealt with every clue showing, `validateParams` SHALL
refuse Unreasonable for any grid of nine squares or fewer, as a size with no
such puzzle. A grid two squares wide with diagonal touching disallowed is
rare at the tier and SHALL be dealt (`engine-difficulty`, "A rare tier is
dealt under the deadline"). With "remove clues" set no refusal applies.

#### Scenario: A 3x3 Unreasonable board with every clue showing is not dealt

- **WHEN** the params of an Unreasonable 3×3, 2×4 or 2×2 board with every clue
  showing are checked for dealing
- **THEN** each is refused
- **AND** the same params are accepted for a board that arrives with its
  description

#### Scenario: No fill of a refused size needs search

- **WHEN** every fill of three and of four letters of every grid of up to nine
  squares is given to the ladder
- **THEN** wherever the ladder stops short, a second grid fits the same clues

#### Scenario: Hidden clues give the smallest boards the tier

- **WHEN** an Unreasonable 3×3 or 2×2 board is dealt with "remove clues" set
- **THEN** it is dealt, and the lowest difficulty that solves it is
  Unreasonable
