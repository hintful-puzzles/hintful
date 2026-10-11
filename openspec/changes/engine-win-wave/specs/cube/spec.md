## ADDED Requirements

### Requirement: Cube's win flash sweeps the squares of the arena

The win flash SHALL sweep the arena diagonally: a square's position SHALL be
that of its center, on the square grid and on the triangular one alike, and a
lit square SHALL be filled with a flash color. The solid SHALL be drawn over
the arena as on any other frame.

#### Scenario: A triangular arena

- **WHEN** a board of a solid with triangular faces is won and frames of its
  flash are drawn from start to end
- **THEN** the first triangle lit is the one whose center is furthest to the
  bottom left, and every triangle of the arena is lit at some frame

## REMOVED Requirements

### Requirement: Cube has no win flash

**Reason**: Every game shows the win flash (`ts-engine`, "The win flash is one
traveling highlight in every game"), and Cube declares no flash length of its
own.

**Migration**: None. Nothing a player holds refers to the flash.
