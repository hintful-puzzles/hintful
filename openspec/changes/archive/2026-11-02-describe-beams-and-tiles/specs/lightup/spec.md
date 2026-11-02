## REMOVED Requirements

### Requirement: Generation: Unreasonable adds depth-capped recursion

**Reason**: Unreasonable is the engine's search by trial and error over the ladder, which finds every board upstream's five-deep recursion solved, and states no depth.
**Migration**: "Generation: An Unreasonable Light Up board is one only the search beneath the ladder finishes".

### Requirement: Solver: Solve works from the player's position, then from the clues

**Reason**: Solve goes by the board's one answer, which the search finds from the walls and numbers alone, as every search-tier game's Solve does.
**Migration**: "Solver: Light Up knows a board's answer from the search beneath its ladder".

### Requirement: Hint: Light Up's hint steps come in the solver's scan order

**Reason**: The hint walks the compiled ladder's firings, taking the one that carries on from its last step, as every ladder hint does; the scenario's second step was the 1's, not the 4's, before this change too.
**Migration**: "Hint: The Light Up hint carries on from its last step, by the rules in order".

## MODIFIED Requirements

### Requirement: Generation: Light Up grades boards with a tiered deductive solver

Light Up's ladder SHALL be compiled from its description and SHALL apply at Easy: forced-light (an unlit square with exactly one remaining way to be lit takes that bulb) and the two clue deductions (a satisfied clue marks its remaining neighbors impossible, and a clue whose remaining lights equal its remaining spaces fills them). Normal SHALL add the overlapping-set discount. Unreasonable SHALL be the engine's search beneath the ladder. Every technique SHALL be checked sound.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at difficulty `d > 0` is solved
- **THEN** the solver succeeds with the difficulty-`d` technique set and fails
  with the difficulty-`d−1` set

### Requirement: Generation: Normal adds the overlapping-set discount

At Normal and above the solver SHALL test every set of which one square must
hold a bulb against candidate squares that would rule the whole set out,
marking such a candidate impossible. A set SHALL come from an unlit square, or
from each combination of `n−m+1` of a clue's `n` free neighbors where `m`
bulbs are still owed. The cheap deductions SHALL restart after a pass of
discounts that ruled a square out.

#### Scenario: A clue owing one bulb among three neighbors

- **WHEN** a clue has three free neighbors and one bulb still to place
- **THEN** its one set is all three neighbors, and a candidate square is
  marked impossible only when a bulb there would rule out all three

## ADDED Requirements

### Requirement: Generation: An Unreasonable Light Up board is one only the search beneath the ladder finishes

An Unreasonable board SHALL have exactly one answer, which the engine's search by trial and error over the Normal ladder finds within its budget, and SHALL NOT be finished by the ladder at Normal. The search SHALL assume, where the ladder stops, the free square that would light the most dark squares holds no bulb, and then that it holds one. The hint SHALL NOT narrate the search: where only the search could progress, the hint refuses.

#### Scenario: A board upstream's recursion solved

- **WHEN** one of upstream's frozen Unreasonable boards is graded
- **THEN** it is solved at Unreasonable and not at Normal

### Requirement: Solver: Light Up knows a board's answer from the search beneath its ladder

Solve, the hint's refusal and the mistake check SHALL know a board's answer from the engine's search over the ladder, from its walls and numbers alone, whatever tier the board was dealt at. A board the search finds more than one answer for, or none, SHALL be one Solve refuses, saying which.

#### Scenario: Solve recovers a solution from a dirty board

- **WHEN** `solve()` is invoked on a mid-game state containing wrong bulbs
- **THEN** it returns a move that leaves the board correctly and completely
  lit

### Requirement: Hint: The Light Up hint carries on from its last step, by the rules in order

`hint` SHALL take, of the firings the ladder could make, the one that carries on from the squares its last step read and decided, and otherwise the first in the ladder's order: the squares column by column from the left, each column from the top, a forced light at an unlit square and a clue's count at a numbered wall, and only where none fires, the discounts. A discount that rules out several squares SHALL be taken as consecutive steps of one square each.

#### Scenario: A walled-in square comes before the clue beside it

- **WHEN** a hint is asked for on the 7×7 board `c2mBc2a1a4aBc2m1c` with
  nothing placed, whose fourth row reads 2, open, 1, open, 4, open, wall
- **THEN** the first step puts a bulb on the open square between the 1 and the
  4, which has a wall above it and a clue below, as the only square that can
  light it
- **AND** the second step is the 1 to its left, which now has its bulb and
  crosses out its other free neighbors
