## MODIFIED Requirements

### Requirement: A step asking for several elements is followed one element at a time

`trackTargets` SHALL judge a move against a step's targets by the changes the
game hands it: what the move changed on the board, never its ops. It SHALL
answer `"off"` where the move changed nothing, or changed any element but to
the value a target asks of it; otherwise `"completed"` once every target
holds, else `"onTrack"` with the targets that do not yet. On `"onTrack"` the
game SHALL shrink the step's move, marks and words to those left.

#### Scenario: Two of three squares in one drag

- **WHEN** a step asks three squares to take one mark, and the player's drag
  sets two of them and changes nothing else
- **THEN** the verdict is `"onTrack"`, and the step's move, its ring and its
  words are of the third square alone

#### Scenario: A right square and another beside it

- **WHEN** a move sets one of a step's squares as the step asks and also
  changes a square the step does not name
- **THEN** the verdict is `"off"`, and the plan is dropped

#### Scenario: The last of them by another gesture

- **WHEN** a step's move is a drag over its squares, and the player sets the
  only square still outstanding with a click
- **THEN** the verdict is `"completed"`

#### Scenario: The board shows the shrunk step at once

- **WHEN** a step's sentence is shown whole and the player makes one of its
  ringed squares, so that the sentence's words stay as they were
- **THEN** the next frame rings only the squares left, with the marks the app
  lays over the board in each reference's color measured again from the
  shrunk step
