## MODIFIED Requirements

### Requirement: A drag carries a color or its marks

`interpretMove` SHALL support a press that picks up the color of the region
under the pointer (or, on a blank region, its pencil marks) into a floating
drag blob, and a release that drops the held color onto the region under the
pointer. The region under a pixel SHALL be found by the quadrant hit-test of a
diagonally-split cell.

#### Scenario: A drag colors a region

- **WHEN** the player presses on a colored region and releases on an adjacent
  blank region
- **THEN** `interpretMove` yields a move whose execution sets the blank region to
  the held color

#### Scenario: A no-op drop yields no move

- **WHEN** the player drops a color onto the border, or onto an immutable clue
  region
- **THEN** `interpretMove` yields no move (returns null or a UI update only)
