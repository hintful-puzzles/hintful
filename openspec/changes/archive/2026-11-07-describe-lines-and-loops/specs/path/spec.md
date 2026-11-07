## MODIFIED Requirements

### Requirement: Solver: The ladder and its Checks

The ladder SHALL be the description's compiled ladder, each technique checked sound, and the hint SHALL walk the same ladder. Easy SHALL fill a square whose open edges are the lines it still needs. Normal SHALL cross out an edge whose line breaks the board at once, and give a square needing two lines from three edges the third where lines on the other two would break it. Tricky SHALL weigh a square needing two lines from four edges, pair by pair.

#### Scenario: A pair that breaks settles the third edge

- **WHEN** a square needs two lines from three open edges, and lines on two of them would join the 4 to the 1
- **THEN** the third edge takes a line

#### Scenario: Four edges are weighed pair by pair

- **WHEN** a square needs two lines from four open edges
- **THEN** an edge every pair that breaks nothing shares takes a line, and an edge no such pair takes is crossed out

#### Scenario: Nothing is followed from a tried line

- **WHEN** a line would break the board only after the Easy rung fires from it
- **THEN** no rung below Unreasonable decides that edge from it

#### Scenario: A board the hand-written ladder dealt keeps its tier

- **WHEN** a board dealt at Normal or Tricky before the ladder was described is graded
- **THEN** it grades at the tier it was dealt at
