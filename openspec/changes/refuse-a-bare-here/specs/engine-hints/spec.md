# engine-hints Specification Delta — refuse-a-bare-here

## ADDED Requirements

### Requirement: A word that points at a place on the board is a reference

Building a hint sentence SHALL refuse a literal "here", or a "there" that names a place, outside a reference to a mark, naming the word. A "there" that opens "there is", "there are", "there's" or "there would" SHALL build.

#### Scenario: A bare "here" refuses to build

- **WHEN** a hint sentence is built with the literal words "a line here would" outside a reference
- **THEN** building it throws, naming "here"

#### Scenario: "There is" builds

- **WHEN** a hint sentence is built with the literal words "there is only one way left"
- **THEN** it builds

#### Scenario: The place said as a reference builds

- **WHEN** a hint sentence says "a line on [this edge] would", the edge a reference to its ring
- **THEN** it builds
