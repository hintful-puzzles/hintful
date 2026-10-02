## ADDED Requirements

### Requirement: Black Box verifies guesses, and a reveal is a win

The verify (reveal) move SHALL run `checkGuesses`, which compares the player's
guessed layout with the real one by the lasers. When the player's already-fired
lasers contradict their guess, or an un-fired laser would have distinguished the
layouts, it SHALL flag one such laser (deterministically chosen from the current
grid) and set `justwrong` without revealing. Otherwise every laser goes where the
real layout sends it, so the guess is the answer: it SHALL accept the guesses as
the real balls and reveal. Solve SHALL guess exactly the real balls and reveal.
`status` SHALL return `"solved"` when revealed and `"ongoing"` before; a reveal
is only ever of a guess proven to be the answer, or Solve's, so a Black Box board
is never lost. A wrong verify SHALL increment a session error counter shown in
the status bar.

#### Scenario: A correct reveal is solved

- **WHEN** the guessed balls exactly match the real layout and the player
  verifies
- **THEN** `status` returns `"solved"` and the status bar reads a success message

#### Scenario: An inconsistent verify shows one error and does not reveal

- **WHEN** the player verifies a guess that a fired laser contradicts
- **THEN** `justwrong` is set, exactly one laser is flagged wrong, the full
  layout is not revealed, and the session error counter increments

#### Scenario: Solve replaces the guesses with the answer

- **WHEN** the player invokes Solve with some balls guessed wrongly
- **THEN** the guesses become exactly the real balls, the arena is revealed, and
  `status` returns `"solved"`

## MODIFIED Requirements

### Requirement: Black Box marks, fires, locks, and reveals via moves

A `BlackboxMove` SHALL be one of: toggle a guessed ball at an arena cell, toggle
a per-cell lock, lock/unlock a whole column or row, fire a laser at a range
cell, reveal/verify the current guesses, or solve (guess the real balls and
reveal).
`executeMove` SHALL be pure (returning a new state) and SHALL reject an illegal
move by throwing. Toggling a ball SHALL be disallowed on a locked cell and SHALL
update the guess count. Firing an already-fired laser SHALL be rejected.
Revealing SHALL be allowed only when the guess count is within
`[minballs, maxballs]`. A whole-column/row lock SHALL set every cell locked iff
fewer than half are currently locked, else unlock them.

#### Scenario: Toggling a ball updates the guess count

- **WHEN** `executeMove` applies a toggle-ball on an empty unlocked arena cell
- **THEN** the new state has a guessed ball there and `nguesses` incremented
- **AND** applying the same toggle again removes it and decrements `nguesses`

#### Scenario: Firing a laser records its result

- **WHEN** `executeMove` applies a fire on an un-fired range cell
- **THEN** the new state's `exits` for that range index is no longer empty

#### Scenario: Reveal is gated on the ball count

- **WHEN** the guess count is below `minballs`
- **THEN** a reveal move is rejected (throws)

## REMOVED Requirements

### Requirement: Black Box verifies guesses and reports the outcome

**Reason**: its loss — a reveal with missed or wrong balls — was reachable only
through a Solve that revealed the answer as a give-up, and Solve now finishes the
board (`ts-engine` § "Solve leaves a solved board"). The player's verify only
ever reveals a guess proven to be the answer.
**Migration**: "Black Box verifies guesses, and a reveal is a win".
