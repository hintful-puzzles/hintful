## MODIFIED Requirements

### Requirement: Solver: Unequal's ladder is its two descriptions

Unequal's solver SHALL run the ladder of `unequal.description.yaml` in
Unequal mode and of `adjacent.description.yaml` in Adjacent mode: the sign
and bar techniques they state and the Latin library's they place, each at the
tier the description gives it. The search above them stays the engine's.

#### Scenario: A sign fires as its description states it

- **WHEN** a sign's smaller end has 3 as its least candidate and the larger
  end still notes 2 and 3, at a cap of Easy or above
- **THEN** the solver strikes 2 and 3 from the larger end in one firing
