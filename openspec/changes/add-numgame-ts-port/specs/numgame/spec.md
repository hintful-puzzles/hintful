# numgame Specification Delta — add-numgame-ts-port

## ADDED Requirements

### Requirement: Numgame is a game designed over the ported solver

The engine SHALL provide `src/games/numgame/` implementing `Game` for a
Countdown-style number puzzle: the player is given a multiset of source numbers
and a target, and combines numbers by addition, subtraction, multiplication and
division to reach the target. Its rules (the operators allowed, whether a
fractional intermediate result is permitted, how many times a source may be
used) SHALL be fixed explicitly before implementation.

#### Scenario: A generated puzzle is reachable at the requested difficulty

- **WHEN** a new game is generated at a difficulty
- **THEN** its target is reachable from its sources, is not trivially reachable,
  and meets the chosen difficulty heuristic

### Requirement: Numgame's solver is the ported breadth-first search

The exhaustive breadth-first solver SHALL be ported from `numgame.c` as the
core that the generator and any hint build on. Its deduplication SHALL be an
idiomatic value-keyed map, since the ordering is a pure lookup.

#### Scenario: The solver enumerates reachable values faithfully

- **WHEN** the ported solver is run on a source multiset
- **THEN** it reports exactly the values reachable under the fixed rules, with
  the count of distinct derivations of each, matching the C utility's arithmetic

### Requirement: Numgame's play is one arithmetic operation a move

Numgame SHALL present the source numbers and the numbers derived from them, and
SHALL let the player make one arithmetic operation a move, combining two
available numbers into a new one. It SHALL support undo, and SHALL report the
puzzle solved when a derived number equals the target. This play is specified
here and not matched against C, and SHALL be covered by behavioral and render
tests.

#### Scenario: Combining two numbers produces a new one

- **WHEN** the player selects two available numbers and an operator whose result
  is legal under the fixed rules
- **THEN** a new derived number appears and the two operands are consumed for
  that branch, recorded as one undoable move

#### Scenario: Reaching the target wins

- **WHEN** a derived number equals the target
- **THEN** the game is reported solved
