## MODIFIED Requirements

### Requirement: Pearl's solver is a certified deduction ladder

Pearl's solver SHALL run its deductions as a `runDeductionFixpoint` ladder of five
rungs: square shapes from known edges, edges from surviving shapes, the pearl clue
deductions, and a closed-loop rung, all at Easy; and the shortcut-loop rule at
Tricky. The closed-loop rung SHALL end the ladder through `settled` once a loop has
closed and everything off it is blank. A firing census SHALL walk generated boards
at both tiers, at both caps, and assert that every rung fires on the corpus. The
hand-written loop the ladder replaced SHALL NOT be kept once the adoption is
proved; git holds it.

#### Scenario: A silenced rung fails

- **WHEN** any rung is removed from the ladder
- **THEN** the firing census or the frozen differential fails

#### Scenario: A mis-tiered shortcut rung fails

- **WHEN** the shortcut-loop rung is declared at Easy
- **THEN** boards that need it pass as Easy, and the frozen differential fails
