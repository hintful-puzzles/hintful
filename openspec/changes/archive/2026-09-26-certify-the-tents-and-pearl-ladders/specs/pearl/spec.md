## ADDED Requirements

### Requirement: Pearl's solver is a certified deduction ladder

Pearl's solver SHALL run its deductions as a `runDeductionFixpoint` ladder of five
rungs: square shapes from known edges, edges from surviving shapes, the pearl clue
deductions, and a closed-loop rung, all at Easy; and the shortcut-loop rule at
Tricky. The closed-loop rung SHALL end the ladder through `settled` once a loop has
closed and everything off it is blank. The solver SHALL keep upstream's hand-written
loop as an oracle only a test calls. A ladder-equivalence test SHALL prove, over
generated boards at both tiers, that the ladder leaves the same verdict and the same
workspace as the oracle at both caps. The workspace is every square's surviving
shapes and every edge. The test SHALL also carry a firing census asserting that
every rung fires on the corpus.

#### Scenario: A silenced rung fails

- **WHEN** any rung is removed from the ladder
- **THEN** the ladder-equivalence test or the frozen differential fails

#### Scenario: A mis-tiered shortcut rung fails

- **WHEN** the shortcut-loop rung is declared at Easy
- **THEN** boards that need it pass as Easy, and the frozen differential fails
