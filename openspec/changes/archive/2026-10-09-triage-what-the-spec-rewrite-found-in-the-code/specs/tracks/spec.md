## MODIFIED Requirements

### Requirement: Tracks hint evidence is drawn in the evidence color

Evidence on the grid SHALL be drawn in `COL_HINT_CELL`: a contour round the
squares the deduction reasons from, painted per side wherever the neighbor
across it is not also evidence, and a bar on a cited side. A clue the step
counts with SHALL have its digit drawn in `COL_HINT` in the margin, because a
clue is part of the deduction and is not on the grid, and the `hintMarks`
legend SHALL say that the number takes the hint color.

#### Scenario: A clue the step counts with is recolored

- **WHEN** the step for a clue that is already met is displayed
- **THEN** the clue's track squares carry the evidence contour in
  `COL_HINT_CELL` and the clue's digit is drawn in `COL_HINT` in the margin

### Requirement: The Tracks completion flash keeps one pace

The completion flash SHALL run at one pace on every board whose track takes a
second or more at that pace, so a longer track takes longer, whatever its
length. On a shorter track the flash SHALL last one second, the highlight
slowing to fill it. Its color SHALL read against the rails and the track bed
in both color schemes.

#### Scenario: A track of several hundred squares

- **WHEN** a board whose track covers more than 256 squares is won
- **THEN** the highlight runs every square of it in turn, at the pace of any
  other long track

#### Scenario: A longer track flashes for longer

- **WHEN** two boards are won, one with a longer track than the other
- **THEN** the longer track's flash runs at least as long as the shorter's,
  and neither runs under a second

#### Scenario: Two short tracks flash for the same time

- **WHEN** two boards are won whose tracks are both too short to take a second
  at the common pace, one longer than the other
- **THEN** both flashes last one second, and the shorter track's highlight
  moves the slower of the two
