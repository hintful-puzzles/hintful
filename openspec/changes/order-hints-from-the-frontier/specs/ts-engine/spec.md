# ts-engine

> An ordering requirement stood here and has been withdrawn, not softened. Measuring
> first showed there is nothing to order: a plan position offers a median of one
> firing, and 86.1% of the jumps this change set out to remove were forced by the
> board (`findings.md` § 1.1). A requirement the collection cannot satisfy, and that
> nothing intends to implement, must not reach the live spec.

## ADDED Requirements

### Requirement: A note a hint asks for is placed beside the step that uses it

Where a hint plan asks the player to record a fact as a note, and the note's own
explanation asserts only what stays true as the board fills, that note SHALL be placed
immediately before the step whose reasoning rests on it. Where the explanation asserts
something the board can stop satisfying, the note SHALL be placed at a position its
explanation still describes. A note SHALL be part of its consumer's journey rather than
a step of its own.

A note placed where the solver happened to *discover* the fact reads as an unmotivated
triviality, because nothing on screen connects it to the deduction it serves.

Deferring a note cannot make its fact underivable, since facts only accumulate — but
it can make the note's *explanation* false, where that explanation asserts something
the board can stop satisfying, such as which of a clue's edges are still open. A plan
SHALL NOT offer a note whose explanation is false of the board it is shown on, and the
placement rule is bounded by that.

#### Scenario: a fact found long before it is used

- **WHEN** a plan's step rests on a fact its solver derived many steps earlier, and the
  note's explanation asserts only what stays true as the board fills
- **THEN** the note placing that fact is offered immediately before that step, in the
  same journey, not at the point it was derived

#### Scenario: an explanation the board outgrows

- **WHEN** a note's explanation names which of a clue's or a dot's edges are still
  open, and further edges are settled before the step that cites the note
- **THEN** the note is **not** moved to its consumer, and is offered at a position its
  explanation still describes, rather than beside its consumer carrying a stale claim
