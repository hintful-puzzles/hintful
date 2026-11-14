## MODIFIED Requirements

### Requirement: Hint: A killer sum has one of three origins

A killer sum SHALL be one of three: a cage's open cells make its clue less its
placed digits; the open cells a row, column or block leaves, once its placed
digits and the cages inside it are taken out, make the rest of its total; or,
where those cells all lie in one cage, that cage's other open cells make its
clue less that and its placed digits. A killer step's reason SHALL say which,
built from what its technique says, and its `reads` SHALL name every filled
cell the sum rests on.

#### Scenario: A recorded killer sum follows from the board and its reads

- **WHEN** the reason of a killer step the hint offers is checked against the
  board it is offered on
- **THEN** its cells are open, its sum is theirs in the solution, and the sum
  follows from its origin using only filled cells its `reads` name

### Requirement: Hint: Solo's hint is the candidate walk's, started on the implicit reading

Solo's hint SHALL be a plan of the shared candidate walk
(`engine-candidate-hints`, "A shared candidate-elimination hint plan"), its
marks those of its legend (`hintMarks`), run on the player's notes
(`engine-candidate-hints`, "A described technique is a rung read off the
notes"): each technique of its ladder a step can teach SHALL be a rung, its
reason built from what the technique says, at the board's tiers on both of
its scales. A value with one place left in a block SHALL be the walk's
hidden single, with no rung of its own. Solo SHALL start the plan on the
implicit reading of a cell with no notes (`engine-candidate-hints`, "A
candidate hint plan reads an unmarked cell the way the player chose").

#### Scenario: Nothing is filled in under Solo's own reading

- **WHEN** the player asks for a hint on a board with no pencil notes, without
  having changed how hints pencil in
- **THEN** no step of the plan is the fill-all move

#### Scenario: A killer technique past the board's killer tier

- **WHEN** a hint is asked on a killer board dealt at a killer tier below the
  region rule
- **THEN** no step of the plan places or strikes by what a row, column or
  block leaves

## ADDED Requirements

### Requirement: Solver: Solo's ladder runs a rung alone as the hint does

Solo's solver SHALL run its techniques as a `runDeductionFixpoint` ladder of
named rungs, in the order its description states them, then the forcing
chain. A rung SHALL read nothing a rung before it left behind in the same
pass, so that the hint, which runs each technique alone on marks built from
the board's values and notes, finds what the ladder finds. No hand-written
technique loop SHALL be kept beside it.

#### Scenario: A rung run alone

- **WHEN** the hint runs one of Solo's techniques alone on marks built from a
  board's values and notes
- **THEN** its firings are the ones it makes from the same marks inside the
  ladder

## REMOVED Requirements

### Requirement: Solver: Solo's solver is a certified deduction ladder whose rungs run alone

**Reason**: It named the premise audit's replay, which is gone with the
recording it replayed; its scenario was the audit's.
**Migration**: "Solver: Solo's ladder runs a rung alone as the hint does".
