## MODIFIED Requirements

### Requirement: Solver: Tents' solver is a certified deduction ladder

Tents' solver SHALL deduce only, as the ladder `tents.description.yaml`
states. Each technique SHALL be checked sound, and a planted defect of each
found unsound. The boards of its firing census SHALL be those generated at
every preset and at a non-square size, at every cap the generator uses, and
every technique SHALL fire on them.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: A mis-tiered Normal technique fails

- **WHEN** either Normal technique is declared at Easy
- **THEN** the generator's gate accepts different boards, and the hint-walk
  snapshots move or the tier gate fails

#### Scenario: A silenced technique fails

- **WHEN** any technique is removed from the description
- **THEN** the firing census fails

#### Scenario: A Normal rung nothing depends on is still certified

- **WHEN** the tree diagonal-pair technique is silenced
- **THEN** the census reports it as never fired, even though every board is
  still dealt at its tier, because other techniques reach its conclusions
