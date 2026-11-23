## ADDED Requirements

### Requirement: Two trees' cost is compared in instructions retired

The repository SHALL provide an on-demand command, `npm run compare-cost`, that walks and deals the same boards in a baseline tree and the working tree and reports, per game, the instructions each run retired net of its process's start-up, and their difference. A comparison SHALL NOT be reported in wall time or CPU time, which move with the machine's load. The command SHALL NOT be part of the gate.

#### Scenario: A comparison on a loaded machine

- **WHEN** the command compares a tree with itself while other processes load the machine
- **THEN** each game's difference is within the spread the command reports for repeated runs of one tree, and does not grow with the load

#### Scenario: A machine without the counter

- **WHEN** the command runs where instructions retired cannot be read
- **THEN** it fails, saying so, and reports no figure in place of the count

### Requirement: A comparison reports the engine's own counts beside the instructions

Each game's line of a cost comparison SHALL also report, for each tree, the hint walk's steps and the technique firings it tried, so that a change in instructions can be read against a change in the work done.

#### Scenario: A walk that takes more steps

- **WHEN** the working tree's hint walk on the same boards takes more steps than the baseline's
- **THEN** the comparison shows both step counts on that game's line, whatever the instructions did

### Requirement: A comparison reads the boards from one list

A cost comparison SHALL load the same game IDs in both trees, dealt once at the baseline, and SHALL report a board either tree refuses to load by its ID, never dropping it silently.

#### Scenario: A board one tree refuses

- **WHEN** a board's ID loads at the baseline and the working tree refuses it
- **THEN** the comparison names that board as refused and counts it in neither tree's figures
