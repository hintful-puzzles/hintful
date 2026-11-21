## RENAMED Requirements

- FROM: `### Requirement: Params: An Undead params string is its declared codec's, and a grid past 54 squares is refused`
- TO: `### Requirement: Params: An Undead params string is its declared codec's`

## MODIFIED Requirements

### Requirement: Params: An Undead params string is its declared codec's

Undead's params (a width, a height and a difficulty), their bounds and their
encoding SHALL be those its `paramConfig` and its declared codec give
(`engine-params`, "A game declares its params encoding once, and both codec
halves are derived"), with no departure from the codec grammar. A params
string that carries no difficulty SHALL decode as Normal, at every size.

#### Scenario: A string with no difficulty

- **WHEN** `4x4` is decoded
- **THEN** it is a 4×4 board at Normal, whose full form is `4x4dn`

#### Scenario: A grid of 54 squares and one of 60

- **WHEN** a 6×9 board and a 6×10 board go through the engine's params check
- **THEN** both are accepted: Undead's area is the engine's
