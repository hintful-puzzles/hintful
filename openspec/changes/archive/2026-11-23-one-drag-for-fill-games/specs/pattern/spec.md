## MODIFIED Requirements

### Requirement: Controls: A Pattern drag sweeps

A drag SHALL keep to the row or column it runs along, as upstream's did, and
give every square it passes that held what the pressed square held what the
pressed square became, so a drag never rewrites a square the player marked
otherwise, and an undecided square's drag never erases.

#### Scenario: A drag over a marked square

- **WHEN** the player drags from an undecided square, which a press shades,
  across a square they marked clear onto an undecided one
- **THEN** both undecided squares are shaded and the clear one stays clear

#### Scenario: A drag that wanders keeps to its row

- **WHEN** the player drags along a row and the pointer strays into the row
  below
- **THEN** the squares filled are the row's, up to the column the pointer is
  in
