## MODIFIED Requirements

### Requirement: Solver: Spokes solves with a tiered deductive solver

Spokes SHALL provide a solver that draws the forced lines and marks for a board, or
reports the board invalid or incomplete, at a requested difficulty of Easy, Normal
or `Unreasonable`. The solver SHALL apply hub saturation and exhaustion,
diagonal-crossing marks, and the two-ones rule; Normal SHALL add its Check on one
spoke, and `Unreasonable` the contradiction look-ahead.

#### Scenario: The solver deduces the unique solution

- **WHEN** a generated board is solved at its difficulty
- **THEN** the solver reaches a single fully connected, fully satisfied
  configuration of lines and marks

### Requirement: Hint: Spokes explains why each hinted move is forced

Each hint SHALL narrate the argument that forces the move, not merely the
move. The narration SHALL state the premises it rests on before its
conclusion, and every claim it makes SHALL be one the implementation has
checked.

#### Scenario: The two-ones rule names the connectivity constraint

- **WHEN** two adjacent hubs each still need exactly one line and the spoke
  between them must be ruled out
- **THEN** the hint states that joining them would finish both and seal them off
  from the rest of the board, which the one-connected-group rule forbids
- **AND** concludes that the spoke between them is ruled out

#### Scenario: A contradiction hint states its hypothesis

- **WHEN** a spoke is forced only because the other state breaks the board at once
- **THEN** the hint states the state tried and the break it makes, naming the
  hub a rule-out leaves no spare spoke, then the hub given too many lines or too
  few spokes, the diagonals that would cross, or the hubs that would be
  stranded, and only then the conclusion

#### Scenario: A saturated hub is explained by the count that forces it

- **WHEN** a hub still needs as many lines as it has spokes left that could carry
  one, and the player asks for a hint
- **THEN** the hint states that the hub's remaining count and its remaining places
  are equal, and concludes that every one of those spokes is a line

## REMOVED Requirements

### Requirement: Generation: The look-ahead runs at two strengths, which are two rungs

**Reason**: Normal's look-ahead, bounded at four deductions, was a supposition followed to a clash, which the owner ruled is Search (`retire-hint-ordinals` D4).
**Migration**: "Solver: Normal's rung is a Check on one spoke" replaces it at Normal; the unbounded look-ahead stays at `Unreasonable`.

### Requirement: Solver: The look-ahead's bound has one definition

**Reason**: No look-ahead below `Unreasonable` remains, so there is no bound.
**Migration**: None.

## ADDED Requirements

### Requirement: Solver: Normal's rung is a Check on one spoke

Normal SHALL rule out a free spoke whose line breaks the board at once, the hubs it fills taking no more spokes, and draw one whose rule-out does, a hub left with no spare spoke drawing all its others. Nothing SHALL be followed from the state tried: the board is read as it would stand, with every free spoke of a full hub ruled out.

#### Scenario: A rule-out that starves a hub forces a line

- **WHEN** ruling a spoke out leaves the 7 at one end no spare spoke, and the 7's other spokes would leave a 4 too few spokes
- **THEN** the spoke is a line

#### Scenario: A break past one look belongs to the top tier

- **WHEN** a spoke's other state breaks the board only after a further deduction
- **THEN** the solver at Normal does not decide it on that account, and at `Unreasonable` it does
