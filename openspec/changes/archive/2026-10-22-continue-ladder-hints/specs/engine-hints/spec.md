# engine-hints Specification Delta — continue-ladder-hints

## ADDED Requirements

### Requirement: A deduction ladder's hint plan continues from its latest steps

A hint plan driven by the deduction ladder SHALL take, at each step, a firing that continues from what its latest steps wrote where one is available at no harder a tier than the ladder's order would fire, the rung order breaking ties, and otherwise the first firing of the first rung that has one. Each technique SHALL offer its firings with what each reads and writes, keyed on what the player follows; a firing writing nothing keyed SHALL leave the plan where it was.

#### Scenario: A plan never reaches for a harder tier to continue

- **WHEN** an easy firing is available across the board and only a harder one continues from the latest step
- **THEN** the plan takes the easy firing

#### Scenario: A Path plan finishes the line it is working on

- **WHEN** a Path plan has drawn a line from the 3 and the crosses beside that line and the join of the 3 follow
- **THEN** the plan takes them before any step on another number's line
