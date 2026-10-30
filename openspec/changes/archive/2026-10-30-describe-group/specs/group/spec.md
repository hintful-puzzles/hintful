## ADDED Requirements

### Requirement: Solver: Group's ladder is its description

Group's solver SHALL run the ladder of `group.description.yaml`: the
associativity, identity and not-the-identity techniques it states and the
Latin library's it places, each at the tier the description gives it, checked
sound against the description's rules, a Latin square whose product is
associative. The search above them stays the engine's.

#### Scenario: Associativity fires as its description states it

- **WHEN** `a·b`, `b·c` and `(a·b)·c` are placed, `a·(b·c)` is open and can
  still hold `(a·b)·c`, at a cap of Normal or above
- **THEN** the solver places `a·(b·c)` equal to `(a·b)·c`, recorded with the
  triple and the three cells it read

#### Scenario: A product that changes a letter rules its partner out

- **WHEN** `j·a` is placed and is not `j`, at a cap of Tricky or above
- **THEN** the solver strikes, for every `k`, the letter `k` from the cells
  `k·a` and `a·k`, in one firing, recorded with the least such `j` as its
  witness
