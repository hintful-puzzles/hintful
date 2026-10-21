# engine-hints Specification Delta — continue-ladder-hints

## ADDED Requirements

### Requirement: A deduction ladder's hint plan continues from its latest steps

A hint plan driven by the deduction ladder SHALL take, at each step, a firing that continues from what the plan's latest steps wrote where one is available, the rung order breaking ties, and only with none continuing the first firing of the first rung that has one. Each technique SHALL offer its firings with what each reads and writes, keyed on what the game's player follows, and a firing that writes nothing keyed SHALL leave the plan where it was.

#### Scenario: A Path plan finishes the line it is working on

- **WHEN** a Path plan has drawn a line from the 3 and the crosses beside that line and the join of the 3 follow
- **THEN** the plan takes them before any step on another number's line
