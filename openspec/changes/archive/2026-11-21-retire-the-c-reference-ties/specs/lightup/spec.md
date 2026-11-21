## MODIFIED Requirements

### Requirement: Generation: An Unreasonable Light Up board is one only the search beneath the ladder finishes

An Unreasonable board SHALL have exactly one answer, which the engine's search by trial and error over the Normal ladder finds within its budget, and SHALL NOT be finished by the ladder at Normal. The search SHALL assume, where the ladder stops, the free square that would light the most dark squares holds no bulb, and then that it holds one. The hint SHALL NOT narrate the search: where only the search could progress, the hint refuses.

#### Scenario: A board upstream's recursion solved

- **WHEN** one of the Unreasonable boards upstream's generator dealt is graded
- **THEN** it is solved at Unreasonable and not at Normal
