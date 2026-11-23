## MODIFIED Requirements

### Requirement: Two trees' cost is compared in instructions retired

The repository SHALL provide an on-demand command, `npm run compare-cost`, that walks and deals the same boards in a baseline tree and the working tree and reports, per game, the instructions each run retired net of its process's start-up, and their difference. Each run SHALL be of the tree bundled as the app bundles it. A comparison SHALL NOT be reported in wall time or CPU time, which move with the machine's load. The command SHALL NOT be part of the gate.

#### Scenario: A comparison on a loaded machine

- **WHEN** the command compares a tree with itself while other processes load the machine
- **THEN** each game's difference is within the spread the command reports for repeated runs of one tree, and does not grow with the load

#### Scenario: A machine without the counter

- **WHEN** the command runs where instructions retired cannot be read
- **THEN** it fails, saying so, and reports no figure in place of the count

#### Scenario: A born game against the hand-written one it replaced

- **WHEN** a born game is compared against the commit before it was born
- **THEN** neither tree's count holds a module runner's getter on a call between the compiled techniques and their runtime
