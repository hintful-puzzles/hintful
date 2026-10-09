## MODIFIED Requirements

### Requirement: The hint refuses honestly when the move to make is undo

`hint` SHALL refuse when the ball is dead, and when some gem can no longer be
reached by any sequence of moves, outlining each such gem, and each refusal SHALL say that the move to
make is to undo.

#### Scenario: The hint refuses honestly when the ball is dead

- **WHEN** the player asks for a hint with the ball dead
- **THEN** the hint refuses, and says that the move to make is to undo

#### Scenario: The hint refuses honestly when a gem is out of reach for ever

- **WHEN** the player asks for a hint from a position where some gem can no longer
  be reached by any sequence of moves
- **THEN** the hint refuses, says that a gem can no longer be reached, and says
  that the move to make is to undo

## REMOVED Requirements

### Requirement: Inertia has no mistake check

**Reason**: declared: `notApplicable.findMistakes` in
`src/games/inertia/index.ts` says it with the reason the engine reads and the
help page shows ("Any route that collects every gem wins, so there is no single
answer to check a move against"), as `ts-engine`, "A game's contract sections
are implemented, not applicable, or absent, and an absent one makes it a draft"
and "A not-applicable reason is a fact about the puzzle", require. That reason
is the later of the two and the one a player reads; the spec's "a death is
undone, not corrected" was an older wording of the same absence and not a
second decision. What a dead ball gets from a check is in "The hint refuses
honestly when the move to make is undo" and `engine-hints`, "The check asks the
hint whether a position is a dead end".
