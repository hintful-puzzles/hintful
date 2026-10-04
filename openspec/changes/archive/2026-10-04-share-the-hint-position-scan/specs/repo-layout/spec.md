## ADDED Requirements

### Requirement: A hint test's pinned positions keep the scan that finds them

The test harness SHALL provide one way to pin the position each of a hint's
sentences is tested on (`src/engine/testing/hint-positions.ts`). A game's test
names its kinds, each the sentence a hint opens with or a predicate over the
opening step and its board, and pins one position a kind as an input: a
`params:desc`, with the moves played on it where the board mid-game is not
itself a desc. The harness SHALL declare the test that every pin's hint still
opens with a step of its kind, and SHALL fail a pin that does not with the
command that finds another.

That command SHALL walk hint-guided play over fixed seeds, taking each plan's
first step and asking again, and SHALL report for every kind the first
position it held on and how many of the positions walked it held on. A pin
SHALL be recorded with that count. A hint test SHALL NOT pin a position found
by a scan that is not in the tree.

#### Scenario: A pin stops firing

- **WHEN** a change to a hint, a solver or a generator leaves a pinned
  position opening with a step of another kind
- **THEN** the pin's test fails, quoting what the hint says there now
- **AND** the failure names the command that scans for a position that fires

#### Scenario: Scanning again

- **WHEN** a hint test file is run with `HINT_SCAN` set
- **THEN** it walks its boards and fails with every kind's first position, as
  pins to paste
- **AND** each is reported with how many of the positions walked it held on,
  and a kind that held on none is reported as not found

#### Scenario: A kind with no pin

- **WHEN** a test names a kind and pins no position for it
- **THEN** the file does not typecheck
