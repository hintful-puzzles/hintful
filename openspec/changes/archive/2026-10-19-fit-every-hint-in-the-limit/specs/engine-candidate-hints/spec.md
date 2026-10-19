## MODIFIED Requirements

### Requirement: A candidate strike SHALL end in the walk's conclusion

A candidate-elimination game on the shared plan walk SHALL give a strike's words
as a premise (`Premise`): the clause saying why the struck values go, without a
conclusion. The walk SHALL end every strike's sentence with the plan's
`conclude` words for the move its step makes: a strike ("so 2 and 4 must go"),
a placement ("so this cell must be 3") or a note of the values left ("so pencil
in only 1 and 5"). A game off the row/column preset SHALL supply its own
`conclude`.

#### Scenario: A game writes no strike conclusion

- **WHEN** a game on the walk narrates any strike
- **THEN** its words carry a premise and no explanation, and the step's sentence
  is that premise followed by the walk's conclusion for the step's move
