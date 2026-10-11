## ADDED Requirements

### Requirement: Light Up's hint steps come in the solver's scan order

The steps of `hint()` SHALL come in the order the solver makes them. A pass
SHALL visit the squares column by column from the left, each column from the
top, trying the forced light at an unlit open square, and at a numbered wall
the full clue and then the clue with just enough room. A discount SHALL be
tried only after a pass that changed nothing, in the same scan, and the passes
SHALL begin again after the first square or clue whose discount rules a square
out.

#### Scenario: A walled-in square comes before the clue beside it

- **WHEN** a hint is asked for on the 7×7 board `c2mBc2a1a4aBc2m1c` with
  nothing placed, whose fourth row reads 2, open, 1, open, 4, open, wall
- **THEN** the first step puts a bulb on the open square between the 1 and the
  4, which has a wall above it and a clue below, as the only square that can
  light it
- **AND** the second step is the 4 to its right, which now has exactly three
  free neighbors left for its three bulbs

### Requirement: Light Up refuses a grid too large to count

`validateParams` SHALL refuse a width and a height whose product is over
2147483647, for a deal and for a game ID alike, in the collection's sentence
for an area too large.

#### Scenario: A width that overflows the count

- **WHEN** the preset params `7x7b20s4d0` are changed in one place, the width,
  to read `400000000x7b20s4d0`
- **THEN** they are refused with "Width times height must not be unreasonably
  large."

### Requirement: A Light Up label names its walls and symmetry only when they are unusual

The label of a set of params SHALL add `N% walls` after the tier only when
`blackpc` is not 20. It SHALL add the symmetry only when it is not the usual
one for the size: 4-way rotational on a square grid of fewer than 50 squares
and 2-way rotational on any other. The symmetry SHALL read as its name in the
Custom dialog, and as `no symmetry` for none.

#### Scenario: A board with more walls and no symmetry

- **WHEN** the params `7x7b30s0d0` are labeled
- **THEN** the label reads "7x7 Easy, 30% walls, no symmetry"

#### Scenario: The usual symmetry depends on the size

- **WHEN** the params `7x7b20s4d0` and `10x10b20s2d1` are labeled
- **THEN** they read "7x7 Easy" and "10x10 Normal"
- **AND** `10x10b20s4d1` reads "10x10 Normal, 4-way rotational"
