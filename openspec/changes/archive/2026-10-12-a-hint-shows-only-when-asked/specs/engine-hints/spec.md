## MODIFIED Requirements

### Requirement: A player move is classified against the stored plan

While a plan is active, displayed or not, the `Midend` SHALL classify each
player move by the game's `hintKeepTrack(move, currentStep, state)` verdict.
`"completed"` SHALL advance the plan and hide the display. `"onTrack"` SHALL
keep the current step, with any adjustment the game made to its move, displayed
only where it was displayed before the move. `"off"` SHALL drop the plan. A
player's move SHALL never display a step: one is shown only by a hint request
or by auto-play.

#### Scenario: Exact-follow keeps the plan and a conflict drops it

- **WHEN** the player makes a move that exactly follows the displayed hint
- **THEN** the plan is kept (advanced), not dropped
- **AND WHEN** the player instead makes a conflicting move
- **THEN** the plan is dropped and the next hint recomputes from the new state

#### Scenario: A leg of a journey is completed by hand

- **WHEN** the player's move completes a displayed step and the next step is
  flagged `continuesPrevious`
- **THEN** no step is displayed
- **AND** the next hint request displays that next step from the kept plan

#### Scenario: A hidden plan's next step is made by hand

- **WHEN** a step has been applied with `executeHint(true)`, so that the plan
  is stored and hidden, and the player then makes the plan's next move, or
  part of it
- **THEN** no step is displayed

### Requirement: One deduction firing is one journey

Where a game's `hint()` derives its plan from a solver or deduction engine, a
single logical deduction that forces more than one move SHALL be emitted as
one journey: an ordered run of `HintStep`s whose first leg carries the full
explanation and whose later legs are flagged `continuesPrevious` with
abbreviated narration. The first leg SHOULD show the whole set, with the other
forced moves as sibling highlights. Distinct deductions SHALL remain separate
hints, the first leg of each unflagged.

#### Scenario: One clue forces two edges

- **WHEN** a single deduction forces two moves: a coupled pair of edges, or a
  clue that resolves several of its sides at once
- **THEN** the plan holds two steps for it, the first with the full
  explanation and the second flagged `continuesPrevious`
- **AND** a displayed leg is counted within the journey, and auto-play
  animates the legs back to back as one multi-part move

## REMOVED Requirements

### Requirement: A journey stays on screen through its legs

**Reason**: A hint sentence the player did not ask for appeared after their own
move, and in a game whose journeys are long (Ascent's runs) it went on
appearing move after move.
**Migration**: None for a game. `continuesPrevious` still groups steps into a
journey; each leg is displayed when the player asks for it.
