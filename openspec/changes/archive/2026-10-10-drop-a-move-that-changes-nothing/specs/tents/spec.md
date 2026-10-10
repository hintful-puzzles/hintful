## MODIFIED Requirements

### Requirement: Tents places tents and grass by click and drag

`interpretMove` SHALL start a one-cell drag on a left or right press, extend it
along the single nearer row or column, and enact it on release. A left click
SHALL set a blank square to a tent or clear a non-blank square; a right click
SHALL set a blank to a non-tent or clear a non-blank; a right-drag SHALL set
every blank square it covers to a non-tent. Trees SHALL never be modified.

#### Scenario: A left click toggles a tent

- **WHEN** a blank square is left-clicked, then left-clicked again
- **THEN** the square becomes a tent, then blank

#### Scenario: A right-drag paints non-tents

- **WHEN** the right button is dragged across a row of blank squares
- **THEN** every covered blank square becomes a non-tent
