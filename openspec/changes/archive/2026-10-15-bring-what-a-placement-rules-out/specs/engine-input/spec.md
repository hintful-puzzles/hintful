## MODIFIED Requirements

### Requirement: One drag is one step of Undo

The midend SHALL treat the moves of one drag as one step: one Undo takes all
of them back and one Redo replays all of them. A save SHALL keep the
grouping, so a reloaded game undoes the drag in one step too. A save written
without it SHALL load, with each move its own step.

#### Scenario: One Undo takes a drag back

- **WHEN** a drag has marked four targets and the player presses Undo once
- **THEN** all four are as they were before the press
- **AND** one Redo marks all four again

#### Scenario: A reloaded drag is still one step

- **WHEN** a drag has marked four targets, the game is saved and loaded, and
  the player presses Undo once
- **THEN** all four are as they were before the drag

## ADDED Requirements

### Requirement: A placement can bring the marks it rules out

A game that declares what a placement rules out at a glance (`rulesOut`)
SHALL be offered the `auto-cross` preference in its own words, off unless the
player turns it on. With it on, every move the player makes SHALL be followed
by the marks it rules out, as one step of Undo with the move. Those marks
SHALL change no square the player has marked.

#### Scenario: One Undo takes a placement and its marks back

- **WHEN** the preference is on, the player places something that rules out
  squares, and then presses Undo once
- **THEN** the placement and the marks it brought are both gone
