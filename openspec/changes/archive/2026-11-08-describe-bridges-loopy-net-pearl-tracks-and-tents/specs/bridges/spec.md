## MODIFIED Requirements

### Requirement: Generation: Bridges Easy runs the single-island deductions

Easy SHALL run the single-island deductions: draw the bridges an island must place because its remaining count equals the room it has along its lines, and draw one bridge to every neighbor of an island whose count is more than the others could carry at the bridge limit. A line to an island with all its bridges, or across a bridge drawn, has no room.

#### Scenario: An island with exactly enough room is filled at Easy

- **WHEN** an island still needs two bridges and the spans around it have room
  for exactly two
- **THEN** the Easy solver draws both

### Requirement: Solver: Bridges solves with a graded multi-stage deductive solver

Bridges' ladder SHALL be its description's compiled ladder, each technique checked sound, and the hint SHALL walk the same ladder. The solver SHALL run the techniques of its tier and no others, and SHALL be purely deductive: it SHALL NOT guess and verify.

#### Scenario: A board the stages leave short

- **WHEN** the techniques allowed at a tier stop with a span still undecided
- **THEN** the solver reports the board unsolved at that tier, having tried no
  bridge to see what follows

### Requirement: Hint: One Bridges firing is one hint step

One firing of a technique SHALL be one step, and a technique SHALL fire for one island at a time. Where one premise forces bridges on several spans, the step's move SHALL carry them all.

#### Scenario: One premise that forces two spans is one step

- **WHEN** an island needs two more bridges and has room for exactly one in
  each of two directions
- **THEN** one step's move draws both bridges, and no other island's deduction
  is in that step
