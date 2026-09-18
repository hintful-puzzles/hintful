# loopy

## ADDED Requirements

### Requirement: Loopy rules out the edges counting has settled

Loopy SHALL provide a preference that, while it is on, extends a move that draws a
line so that the move also marks as excluded every edge the drawn line has settled by
counting alone: the remaining edges at a dot that now carries two lines, and the
remaining edges of a face whose clue is now met exactly.

The excluded edges SHALL be part of the drawing move rather than a move of their own,
so that a single undo restores the board to the position before the line was drawn.

Only a drawn line SHALL trigger this. Excluding an edge and erasing a line can neither
give a dot its second line nor complete a clue's count, so neither extends a move, and
no edge excluded this way can settle a further one.

An edge the player has already set SHALL NOT be changed — only an edge still unknown
is marked.

Both facts are exact counts rather than deductions, so the player who is not asked to
mark them has not been told anything they could have worked out; they have been spared
bookkeeping. The preference exists because a player may still prefer to keep their own
board, and it defaults **on** — a divergence from the collection's aids-default-off
posture, which is justified where an aid discards nothing and removes no decision.

#### Scenario: A dot's second line rules out its other edges

- **WHEN** the preference is on and a drawn line gives a dot its second line
- **THEN** every still-unknown edge at that dot is marked excluded by the same move,
  and one undo restores all of it

#### Scenario: A satisfied clue rules out its other edges

- **WHEN** the preference is on and a drawn line brings a face's line count up to its
  clue
- **THEN** every still-unknown edge of that face is marked excluded by the same move

#### Scenario: Excluding an edge settles nothing further

- **WHEN** the preference is on and the player marks an edge excluded, or erases a line
- **THEN** the move sets that edge alone

#### Scenario: The preference off leaves the move alone

- **WHEN** the preference is off and a drawn line gives a dot its second line
- **THEN** the move sets only the edges the click itself asked for
