## ADDED Requirements

### Requirement: Ascent's solver treats the last number like any other

The solver's rungs SHALL apply to the last number on the path exactly as to any
other: reach SHALL measure it from the nearest placed number below it,
`overlap` SHALL narrow it and tie the number before it to its candidates, and a
placement SHALL rule it out of the square just filled. Upstream stopped one
short in each place, which left "the last number sits next to the one before
it" to no rung and let a board need a harder tier than a player does.

#### Scenario: The last number is measured from the one below it

- **WHEN** the last number is missing and the number before it is placed
- **THEN** the reach rungs rule the last number out of every square too far
  from it

#### Scenario: A filled square holds no other number

- **WHEN** the solver places a number in a square
- **THEN** every other number, the last one included, is ruled out of that
  square
