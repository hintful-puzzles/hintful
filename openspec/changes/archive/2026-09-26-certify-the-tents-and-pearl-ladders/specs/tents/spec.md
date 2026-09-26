## ADDED Requirements

### Requirement: Tents' solver is a certified deduction ladder

Tents' solver SHALL run its deductions as a `runDeductionFixpoint` ladder of seven
rungs: the tent↔tree link, beneath Easy so the generator's links-only cap runs it
alone; the two grass rules, a tree's single candidate and the per-line count at
Easy; and at Tricky the tree diagonal-pair elimination and the line count's reading
of the two lines alongside, each a rung of its own that writes only what its Tricky
half deduces. It SHALL keep upstream's hand-written loop as an oracle only a test
calls. A ladder-equivalence test SHALL prove, over generated boards covering the
preset sizes at both tiers and a non-square board, that the ladder leaves the same
verdict, squares and links as the oracle at every cap the generator uses. The test
SHALL also carry a firing census asserting that every rung fires on the corpus.

#### Scenario: A Tricky rung nothing depends on is still certified

- **WHEN** the tree diagonal-pair rung is silenced
- **THEN** the census reports it as never fired, even though every board comparison
  and the frozen differential still pass, because other rungs reach its conclusions
  on nearly every board

#### Scenario: A mis-tiered Tricky rung fails

- **WHEN** either Tricky rung is declared at Easy
- **THEN** the generator's gate accepts different boards, and the frozen
  differential fails
