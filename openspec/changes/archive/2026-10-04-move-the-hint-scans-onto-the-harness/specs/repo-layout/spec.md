## MODIFIED Requirements

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
first step and asking again, and SHALL report for every kind how many of the
positions walked it held on and the one of them that is fewest moves in. Where
a test says so, it SHALL play moves before the first hint, ask the hint under
a `Ui` the test names, and walk a second line of play that the test steers,
for a kind hint-guided play does not meet. A pin SHALL be recorded with that
count. A hint test SHALL NOT pin a position found by a scan that is not in the
tree, unless the scan in the tree was run and did not reach the kind, which
the pin SHALL say with the count walked.

A hint test SHALL NOT walk seeds to find the position it asserts on. A test
that asserts a property of every board or step it walks is a sweep and not a
scan for a position, and is not covered by this requirement.

#### Scenario: A pin stops firing

- **WHEN** a change to a hint, a solver or a generator leaves a pinned
  position opening with a step of another kind
- **THEN** the pin's test fails, quoting what the hint says there now
- **AND** the failure names the command that scans for a position that fires

#### Scenario: Scanning again

- **WHEN** a hint test file is run with `HINT_SCAN` set
- **THEN** it walks its boards and fails with a position for every kind, the
  one fewest moves in, as pins to paste
- **AND** each is reported with how many of the positions walked it held on,
  and a kind that held on none is reported as not found

#### Scenario: A kind with no pin

- **WHEN** a test names a kind and pins no position for it
- **THEN** the file does not typecheck

#### Scenario: A sentence spoken only off the hint's line

- **WHEN** a hint keeps to lines that finish, and a sentence is about a move
  that would not
- **THEN** the test gives the scan a second line of play, naming the move
  played at each turn from the board and the move the hint offers
- **AND** the kinds are counted over both lines

#### Scenario: A board on which a solver rung fires

- **WHEN** a test wants the board a rung fires on, and no step says the rung
- **THEN** the kind is a predicate that asks the solver about the board the
  hint is asked from, and the pin is that board

#### Scenario: A refusal

- **WHEN** a test wants a board the hint refuses
- **THEN** it keeps the board by hand and says why beside it, because a
  refusal has no step for a pin's loader to return

#### Scenario: A cross-game guard needs a frame only some games produce

- **WHEN** a guard over every hinted game checks a frame that only some
  games' hints produce, as a numbered chain is
- **THEN** it pins one position for each such game and searches for none on a
  normal run
- **AND** a walk another guard already makes fails on such a step from a game
  with no pin, so which games are checked stays derived from what their hints
  do
