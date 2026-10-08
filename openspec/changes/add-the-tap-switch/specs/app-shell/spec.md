## ADDED Requirements

### Requirement: A switch in the Game controls says what a tap does

In a game that has a second action on a target, the Game controls SHALL carry
a two-part switch that names the game's own two actions, and the part that is
lit SHALL be the action a tap or a left click performs. Choosing the other
part SHALL swap the two, so that a run of second actions needs no long press.

The switch SHALL be shown to every player, with no preference to turn it on.
It SHALL NOT be shown in a game that has no second action. Its state SHALL be
kept for the visit and reset on leaving the puzzle.

#### Scenario: Laying a run of the second action by tapping

- **WHEN** a player in Tracks chooses the switch's second part and taps three
  squares
- **THEN** each tap does what a right click does there
- **AND** the switch names both actions in the game's own words, with the
  second lit

#### Scenario: A game with one action

- **WHEN** a player opens a game that ignores the secondary button
- **THEN** the Game controls carry no switch

#### Scenario: Coming back to a puzzle

- **WHEN** a player leaves a puzzle with the switch on its second part and
  opens it again
- **THEN** a tap performs the first action
