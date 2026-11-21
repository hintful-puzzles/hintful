## MODIFIED Requirements

### Requirement: Solver: Pearl's solver is a certified deduction ladder

Pearl's solver SHALL deduce only, as the ladder `pearl.description.yaml`
states, over the edges alone: at Easy, a square read off its own edges, a
black pearl's turn one axis at a time, its run-on and the run-on it cannot
take, a white pearl that cannot turn or turns opposite, and a closed loop;
at Normal, an edge or a way through a square that would close a loop early.
Each technique SHALL be checked sound on square boards, and a planted defect
of each found unsound.

#### Scenario: A mis-tiered shortcut rung fails

- **WHEN** the early-loop technique is declared at Easy
- **THEN** boards that need it pass as Easy, and the tier gate fails or the
  hint-walk snapshots move

#### Scenario: A silenced rung fails

- **WHEN** any technique is removed from the description
- **THEN** the firing census fails
