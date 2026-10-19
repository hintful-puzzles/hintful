## MODIFIED Requirements

### Requirement: A candidate strike SHALL end in the walk's conclusion

A candidate-elimination game on the shared plan walk SHALL give a strike's words
as a premise (`Premise`): the clause saying why the struck values go, without a
conclusion. The walk SHALL end every strike's sentence with the plan's
`conclude` words for the move its step makes: a strike ("so 2 and 4 must go"),
a placement ("so this cell must be 3") or a note of the values left ("so this
cell can only be 1 or 5"). The walk SHALL build the reference, over the struck
values or the cell alone, and never over the clause. A game off the row/column
preset SHALL supply its own `conclude`.

#### Scenario: A game writes no strike conclusion

- **WHEN** a game on the walk narrates any strike
- **THEN** its words carry a premise and no explanation, and the step's sentence
  is that premise followed by the walk's conclusion for the step's move

#### Scenario: The reference is the struck values

- **WHEN** a strike's step ends "so 2 and 4 must go"
- **THEN** its reference to the struck notes says "2 and 4", and "must go" is
  outside it

## REMOVED Requirements

### Requirement: A premise says how its conclusion refers to the struck notes

**Reason**: Its `named` premise had the conclusion refer back to the struck
values by a pronoun ("so they must go"), and a pronoun is no thing on the board
for a reference to name.

**Migration**: "A strike's conclusion names the struck values, even after its
premise" replaces it, without `named`.

## ADDED Requirements

### Requirement: A strike's conclusion names the struck values, even after its premise

The conclusion SHALL refer to the struck notes the way the premise says: by
`where` for a strike that reaches beyond the cell it is about, and by `struck`
where a word names the notes better than a list of their values. Otherwise it
SHALL name their values, even where the premise has just named them.

#### Scenario: A premise that names the values is followed by them

- **WHEN** a strike's premise says "puts 2 in this cell"
- **THEN** its conclusion reads "so the 2 must go", and not "so it must go"
