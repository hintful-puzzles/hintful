## MODIFIED Requirements

### Requirement: A note a hint asks for is placed beside the step that uses it

Where a hint plan asks the player to record a fact as a note, and the note's own
explanation asserts only what stays true as the board fills, that note SHALL be placed
immediately before the step whose reasoning rests on it. Where the explanation asserts
something the board can stop satisfying, the note SHALL be placed at the latest
position its explanation still describes, which is beside its consumer whenever the
board allows. A journey SHALL be one deduction: the notes placed together SHALL be
split into the separate derivations they make, each its own journey, and a note SHALL
NOT be part of the journey of a step that does not rest on it.

A note placed where the solver happened to *discover* the fact reads as an unmotivated
triviality, because nothing on screen connects it to the deduction it serves. And a
journey that gathers every note a step rests on reads as a tour of the board, because
independent derivations sit wherever their clues are.

Deferring a note cannot make its fact underivable, since facts only accumulate — but
it can make the note's *explanation* false, where that explanation asserts something
the board can stop satisfying, such as which of a clue's edges are still open. A plan
SHALL NOT offer a note whose explanation is false of the board it is shown on, and the
placement rule is bounded by that.

#### Scenario: a fact found long before it is used

- **WHEN** a plan's step rests on a fact its solver derived many steps earlier, and the
  note's explanation asserts only what stays true as the board fills
- **THEN** the note placing that fact is offered immediately before that step, not at
  the point it was derived

#### Scenario: an explanation the board outgrows

- **WHEN** a note's explanation names which of a clue's or a dot's edges are still
  open, and further edges are settled before the step that cites the note
- **THEN** the note is **not** moved to its consumer, and is offered at a position its
  explanation still describes, rather than beside its consumer carrying a stale claim

#### Scenario: a step resting on two separate derivations

- **WHEN** a step rests on notes that come from two derivations, neither citing the
  other
- **THEN** each derivation is offered as its own journey, and the step follows them
  as a journey of its own rather than as the last leg of either

#### Scenario: a step resting on one derivation

- **WHEN** every note a step needs placed comes from one derivation
- **THEN** the notes and the step are one journey, the step its last leg
