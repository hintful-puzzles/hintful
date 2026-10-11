## MODIFIED Requirements

### Requirement: The Tracks completion flash runs the track from A to B

The completion flash SHALL run the finished track from the entrance to the
exit: a square's position SHALL be its place along the track, counted from the
entrance, and a lit square's rails SHALL be drawn in the flash color. A square
off the track SHALL never be lit. The color SHALL read against the rails and
the track bed in both color schemes.

#### Scenario: The flash runs from A to B

- **WHEN** a board is won and frames of its flash are drawn from start to end
- **THEN** the first lit square is the entrance's, the last is the exit's, and
  every square of the track is lit for one stretch of frames

#### Scenario: A track of several hundred squares

- **WHEN** a board whose track covers more than 256 squares is won
- **THEN** the highlight runs every square of it in turn

## REMOVED Requirements

### Requirement: The Tracks completion flash keeps one pace

**Reason**: The win flash lasts the same time on every board of every game
(`ts-engine`, "The win flash is one traveling highlight in every game"), so a
longer track's highlight moves faster and no game sets a pace.

**Migration**: None. Nothing a player holds refers to the flash.
