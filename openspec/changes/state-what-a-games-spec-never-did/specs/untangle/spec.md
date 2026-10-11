## ADDED Requirements

### Requirement: A graph that is not planar does not load

`hasNoSolution` SHALL say yes exactly of a graph that is not planar, by the
planarity test the solved layout comes from, wherever its points stand. A
description the parser reads is therefore still refused when it is opened, if
no layout of its lines is free of crossings.

#### Scenario: Five points all joined

- **WHEN** the game ID `5:0-1,0-2,0-3,0-4,1-2,1-3,1-4,2-3,2-4,3-4` is opened
- **THEN** its ten pairs are read without complaint, and it is refused as
  having no solution

#### Scenario: A dealt board

- **WHEN** `0-2,0-5,1-2,1-3,1-4,1-5,2-4,2-5,3-4,3-5` is opened for 6 points
- **THEN** it loads, drawn on a circle with lines crossing

### Requirement: Snap-to-grid drops a point in the middle of a grid square

With `snap-to-grid` on, a point dragged by the pointer or nudged with the
arrow keys SHALL be placed at the middle of the square it is over, of a grid
of `n − 1` squares each way across the play area. With it off the point SHALL
be placed at the pixel it is over. The preference SHALL NOT move a point
already placed.

#### Scenario: A drop on a board of six points

- **WHEN** snap-to-grid is on and a point of a 6-point board drawn 256 pixels
  wide is dropped at pixel (100, 100)
- **THEN** it is placed at 1.2 of the board's 4 units each way, pixel 76.8,
  the middle of the second of five squares
- **AND** with the preference off it is placed at pixel (100, 100)

### Requirement: Untangle's keyboard starts from point 0

With no point selected, Enter, Space or Tab SHALL select point 0, and an
arrow key SHALL select the point nearest point 0 in its direction, or point 0
where none lies that way. A point SHALL lie in an arrow's direction when it is
within 45° of it. A nudge SHALL move a held point half a board unit.

#### Scenario: Up on a board just opened

- **WHEN** Up is pressed on a board just opened, whose point 0 is at the top
  of the circle
- **THEN** point 0 is selected, no point lying above it

### Requirement: An Untangle title is its number of points

A board's label SHALL be its number of points followed by `points`.

#### Scenario: The default board

- **WHEN** the params `10` are labeled
- **THEN** the label reads "10 points"
