## MODIFIED Requirements

### Requirement: A hint test's pinned positions keep the scan that finds them

The test harness SHALL provide one way to pin the position each of a hint's
rungs is tested on (`src/engine/testing/hint-positions.ts`). A game's hint test
SHALL pin one position for every rung the game declares (`Game.hintRungs`),
keyed by the rung's id, as an input: a `params:desc`, with the moves played on
it where the board mid-game is not itself a desc. A rung's pin is a position
whose plan holds a step of that rung. A rung that no known board fires SHALL be
excused only by listing it with the reason, and the scan SHALL walk the excused
rungs too and say when one fires.

A test MAY pin further kinds, each a predicate over the step a plan opens with
and the board it is asked from, for what a rung id does not say: a step's
shape, which of a rung's cases it is, or the board's. A kind SHALL read the
step's fields and SHALL NOT be a pattern matched against its sentence; the
harness's type for a kind does not admit one. A test file that pins positions
of its own beside the game's rungs SHALL do so through the same harness, with
kinds that are rung ids or predicates.

The harness SHALL declare the test that every pin's plan still fires its kind,
and SHALL fail a pin that does not with the command that finds another. It
SHALL also hold the sentence said at each pin as a snapshot, which is where a
rung's wording is asserted now that no pin reads it.

The scan SHALL walk hint-guided play over fixed seeds, taking each plan's
first step and asking again, and SHALL report for every kind how many of the
positions walked it held on and the one of them to pin: one where the kind's
step opens the plan before one where it comes later, then the fewest moves in.
Where a test says so, it SHALL play moves before the first hint, ask the hint
under a `Ui` the test names, and walk a second line of play that the test
steers, for a kind hint-guided play does not meet. A pin SHALL be recorded with
that count. A hint test SHALL NOT pin a position found by a scan that is not in
the tree, unless the scan in the tree was run and did not reach the kind, which
the pin SHALL say with the count walked.

A hint test SHALL NOT walk seeds to find the position it asserts on. A test
that asserts a property of every board or step it walks is a sweep and not a
scan for a position, and is not covered by this requirement.

#### Scenario: A pin stops firing

- **WHEN** a change to a hint, a solver or a generator leaves a pinned
  position whose plan no longer fires the pin's kind
- **THEN** the pin's test fails, quoting what the hint says there now and the
  rungs of its plan
- **AND** the failure names the command that scans for a position that fires

#### Scenario: Scanning again

- **WHEN** the scan command is run on a hint test file
- **THEN** it walks its boards and reports a position for every kind
- **AND** each is reported with how many of the positions walked it held on,
  and a kind that held on none is reported as not found

#### Scenario: A kind with no pin

- **WHEN** a test names a kind and pins no position for it
- **THEN** the file does not typecheck

#### Scenario: A rung with no pin

- **WHEN** a game's hint gains a rung, and its hint test neither pins a
  position for it nor lists it as unreached
- **THEN** the test file does not typecheck

#### Scenario: A rung that is only ever a later leg

- **WHEN** a rung is never the step a plan opens with, as a placement's cull
  is not
- **THEN** it is pinned on a position whose plan holds a step of it, and the
  loader says where in the plan that step is

#### Scenario: A reworded sentence

- **WHEN** a hint's sentence is reworded and its deduction is not changed
- **THEN** every pin still fires, and the snapshot of what each pin says is
  the test that changes

#### Scenario: A sentence spoken only off the hint's line

- **WHEN** a hint keeps to lines that finish, and a rung is about a move
  that would not
- **THEN** the test gives the scan a second line of play, naming the move
  played at each turn from the board and the move the hint offers
- **AND** the kinds are counted over both lines

#### Scenario: A board on which a solver rung fires

- **WHEN** a test wants the board a solver rung fires on, and no step says so
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
