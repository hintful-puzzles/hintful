# testing Specification

## Purpose

How behavior is tested here: the in-process tiers and the render harness, the
rules that keep the suite deterministic under load and its workers from
outliving it, the rule against mocking a module, how a test's strength is
audited and probed, what an assertion must be able to catch, the frozen C
fixtures and what they still guarantee, the capability snapshot, the harness
that pins a hint test's positions, and the boards a cross-game sweep walks
and how many of them on a commit. What the gate runs, and
what it may defer, is `build-pipeline`; how to write a test is
`docs/games/testing.md` and how to judge one is `docs/test-strength.md`.

## Requirements

### Requirement: Behavior is testable in-process across three tiers

The project SHALL make behavior testable in-process under `vitest`, with no
browser, across three tiers, and SHALL reserve browser automation for visual
and full-integration smoke checks only:

1. Pure logic: `Game` implementations, the `Midend`, solvers, generators and
   codecs.
2. Rendering ops: a game's `redraw` driven against a recording `GameDrawing`
   double, asserting the draw calls it makes.
3. Components and persistence: Lit components, and Dexie/IndexedDB
   persistence.

#### Scenario: A rendering op is asserted without a browser

- **WHEN** a game's `redraw` is driven against a recording `GameDrawing`
- **THEN** the test asserts the draw calls it makes, such as a mistake-colored
  rect for a flagged cell, with no browser involved

### Requirement: Each tier runs in the cheapest environment that fits

The pure-logic and rendering tiers SHALL run in the default `node` environment.
A component test SHALL opt into `happy-dom` per file. Persistence SHALL be
tested against an in-memory `fake-indexeddb`, which a setup file installs.
`happy-dom` and `fake-indexeddb` SHALL be devDependencies only, with no runtime
or bundle impact.

#### Scenario: The fast logic suites keep the node environment

- **WHEN** the pure-logic suites run
- **THEN** they execute in the default `node` environment and do not pay
  DOM setup cost; only files that need it opt into `happy-dom`

#### Scenario: A persistence round-trip is tested without a browser

- **WHEN** the saved-games suite runs
- **THEN** a quick-save is written and read back through Dexie against an
  in-memory `fake-indexeddb`, asserting the round-trip and the reactive
  `hasQuickSave` signal, with no browser involved

### Requirement: New UI or persistence behavior ships an in-process test

New UI or persistence behavior SHALL ship a tier-2 or tier-3 in-process test
rather than relying on a human eyeballing a browser run.

#### Scenario: A component command path is tested without a browser

- **WHEN** the puzzle screen's suite mounts the element under `happy-dom`
  with a fake `Puzzle`
- **THEN** the Check & save command saves on zero mistakes and refuses to
  save on a positive mistake count, asserted in-process

### Requirement: The render harness is one recorder and one scenario driver

The harness SHALL include a recording `GameDrawing` that captures every draw
call with all its arguments, with colors resolved through the game's palette to
stable labels. It SHALL include a scenario driver that, given a game, a game
id, an optional move list, and flags to show the active hint or the mistakes,
drives a real `Midend` to the target frame and returns the captured record. The
driver SHALL replay moves as `Move`s, not as pointer events.

#### Scenario: A frame is reached by its moves

- **WHEN** a scenario names a game id and a move list
- **THEN** the driver applies the moves to a real `Midend` as `Move`s and
  captures the frame the midend then draws
- **AND** no pointer event is synthesized to reach it

### Requirement: A draw record is deterministic

The harness's output SHALL be deterministic: a fixed tile size, rounded
coordinates, stable ordering, and no `Date` or `Math.random`.

#### Scenario: The same scenario is captured twice

- **WHEN** one scenario is captured on two runs, or on two machines
- **THEN** the two records are identical

### Requirement: A render test pairs a snapshot with targeted assertions

Verification of a draw record SHALL use `toMatchSnapshot` on the record plus
targeted assertions on specific ops. New rendering behavior SHOULD ship such a
test, with browser automation reserved for genuine full-integration and
real-canvas smoke checks.

#### Scenario: A render regression is a reviewable snapshot diff

- **WHEN** the captured record is compared against its `toMatchSnapshot`
  baseline after a rendering change
- **THEN** an unintended visual change surfaces as a text diff an agent reviews,
  and an intended one is re-baselined with `vitest -u`

### Requirement: A shared helper carries the byte-for-byte differential shape

The engine testing utilities SHALL provide `describeDescDifferential` in
`src/engine/testing/differential.ts`: given a fixture list, a `params` mapper
and a game's `newDesc`, it asserts for each fixture that
`newDesc(params(fixture), randomNew(fixture.seed)).desc` equals the recorded C
desc, with an optional `extra` callback for a follow-on assertion. A game whose
gated differential has that shape SHALL use the helper. The solver-agreement
shape is game-specific and is not modeled by it.

#### Scenario: A game's byte-match differential uses the helper

- **WHEN** a game's gated differential asserts its `newDesc` reproduces the C desc
  byte-for-byte across a fixture set
- **THEN** it calls `describeDescDifferential` with its fixtures, params mapper, and
  `newDesc`, rather than re-declaring the `describe`/`for`/`it`/`expect` loop

#### Scenario: A differential decodes a board and runs the solver

- **WHEN** a game's differential decodes a recorded board, runs the solver and
  asserts the recorded difficulty
- **THEN** it is written in the game's own test, not through this helper

### Requirement: The frozen fixtures' provenance is stated once, and no recipe is carried

The C-reference fixtures are frozen and cannot be regenerated. That fact SHALL
be stated once, in the shared differential helper, rather than repeated per
game, and a differential test file SHALL NOT carry a regeneration recipe,
because no such recipe can be executed.

#### Scenario: A fixture's provenance is recorded but its recipe is not

- **WHEN** a differential test file documents where its fixture came from
- **THEN** it names the harness that captured it, as history
- **AND** it does NOT carry the commands, because none of them can be run

### Requirement: The test suite is deterministic under parallel load

The full `vitest run` SHALL pass deterministically: a test SHALL NOT fail as a
function of execution order, worker scheduling or CPU contention. Heavy
generator and solver tests, which loop until a uniquely solvable board is
produced, SHALL be seed-deterministic, and a generator's retry loop SHALL have
a finite iteration cap rather than rely on probabilistic termination within a
timeout.

#### Scenario: A generator test gives the same verdict every run

- **WHEN** a generator/solver test runs with a fixed seed, alone or inside the
  full parallel suite
- **THEN** it produces the same board and the same pass/fail verdict, regardless
  of how many other tests run concurrently

### Requirement: Efficiency is asserted by a proxy, never by elapsed time

A test SHALL NOT assert on elapsed wall-clock time as a proxy for an algorithm
being efficient, because elapsed time under a saturated box measures spare
capacity and not the code. Such a property SHALL be asserted by a deterministic
proxy instead, a bounded node or expansion count, an iteration count or a
result shape, that is identical whatever the machine load.

#### Scenario: Efficiency is asserted by a proxy, not by elapsed time

- **WHEN** a test wants to assert an algorithm (e.g. a hint planner's search) is
  efficient
- **THEN** it asserts a load-independent proxy (bounded expansions / iterations /
  result shape), not that it finished within a wall-clock millisecond budget

### Requirement: There is one test timeout, and it is a backstop

A test timeout is a runaway backstop and not a gate: an otherwise-good commit
SHALL NOT be rejected merely because work took long. There SHALL be exactly one
generous ceiling, `testTimeout` and `hookTimeout` in `vitest.config.ts`, sized
far clear of the worst loaded runtime. An individual test SHALL NOT set its own
timeout: a per-test ceiling is a guess about contention, and is tighter than
the global one without showing it.

#### Scenario: A correct-but-slow test survives a saturated box

- **WHEN** a test whose work terminates and whose assertions are deterministic
  runs while the machine is heavily loaded, taking many times its solo runtime
- **THEN** it still passes, because no per-test clock gate stands between it and
  its assertions: only the single generous ceiling, which is sized for runaway
  work rather than for contention

### Requirement: Non-termination is bounded in code, not by a timeout

A timeout SHALL NOT be relied on to catch a runaway loop: the suite is
synchronous, so a runaway blocks the event loop and the timeout cannot fire.
Non-termination SHALL be bounded where it can be caught, by
`engine/retry-limit.ts` for generator retries and by `engine/step-budget.ts`
for solver and hint fixpoints.

#### Scenario: A fixpoint stops making progress

- **WHEN** a hint's deduction loop reports progress without changing the board
- **THEN** its step budget throws a labeled failure
- **AND** no test waits on the timeout to end it

### Requirement: A load-only failure is root-caused

A failure observed only under full-suite load SHALL be root-caused and not
dismissed as flaky. Root-causing means identifying which cause applies:
contention on terminating work, shared state or order dependence, a logic edge
case, or non-termination. Where the cause is contention on work that
terminates, removing or raising the clock gate SHALL be the fix, and
re-guessing a per-test constant SHALL NOT be.

#### Scenario: A load-only failure is investigated, not ignored

- **WHEN** a test fails during a full `vitest run` but passes in isolation
- **THEN** its cause is identified (contention, shared state, order dependence,
  a logic edge case, or non-termination) and fixed at that cause: the leak is
  fixed, the code is fixed, or the loop is bounded in code
- **AND** where the cause is contention on terminating work, the fix is to stop
  gating that test on the clock, never to re-guess a per-test constant

### Requirement: Test worker processes do not outlive their runner

A `vitest` run SHALL NOT leave worker processes running after it ends. A run's
entry points, the pre-commit gate and the `test` and `test:run` npm scripts,
SHALL reap orphaned workers before starting. The reaper runs before a run and
not after it, because the interrupt that creates an orphan also kills any
post-run hook.

#### Scenario: Orphaned workers are reaped before a run

- **WHEN** a test entry point (the gate or a `test`/`test:run` npm script) starts
  and a prior run left an orphaned worker (a repo `vitest` worker with PPID 1)
- **THEN** that orphan is killed by its exact PID before the new run begins, so
  orphans never accumulate across runs

### Requirement: The reaper kills only this repo's orphans, and never fails a run

The reaper SHALL kill only this repo's `vitest` worker processes whose parent
is PID 1, which are orphans by definition, by exact PID. It SHALL NOT use
`pkill` or `killall`, and SHALL NOT kill a live run's workers or another
user's processes. It SHALL be fail-safe: any error is swallowed and the run
proceeds.

#### Scenario: A live run's workers are never reaped

- **WHEN** the reaper runs while another `vitest` run is in progress
- **THEN** that run's workers (which have their runner as parent, not PID 1) are
  left untouched, and only true orphans are killed

### Requirement: The test suite's strength is audited, not assumed

The repository SHALL periodically measure whether its tests would catch a
regression, not merely whether they execute the code, by mutation-testing the
shared engine and triaging the survivors. The deliverable SHALL be a triaged
survivor list, each survivor classified as a missing assertion, a genuinely
unreachable branch or an equivalent mutant. Where survivors cluster SHALL be
reported: survivors in code the differentials are meant to protect mean the
fixture net is thinner than believed.

#### Scenario: A refactor is justified by an unmoved fixture

- **WHEN** a change argues it is behavior-preserving because a differential
  fixture did not move
- **THEN** that argument is only as strong as the fixture's measured coverage of
  the paths the change touched
- **AND** where the audit has shown that coverage to be thin, the change adds a
  direct assertion rather than relying on the fixture alone

#### Scenario: A snapshot's paired assertions are not load-bearing

- **WHEN** the audit finds surviving mutants in a render path protected only by a
  snapshot
- **THEN** the targeted assertions that snapshot is required to be paired with are
  strengthened
- **BECAUSE** a snapshot alone can be re-baselined with `vitest -u` and the
  guarantee silently lost

#### Scenario: A shared module's semantics are pinned only by a distant consumer

- **WHEN** a mutant in a shared engine module survives that module's own test file
  and is killed only by a game's tests or a frozen differential
- **THEN** an assertion is added to the module's own test file, naming the
  behavior rather than the mutant
- **BECAUSE** coverage several layers away is adequate as protection and poor as
  feedback: a run of just the relevant test files is then green on a broken
  module

### Requirement: The mutation audit is not a gate, and its score is not ratcheted

The mutation audit SHALL NOT be a gate and its score SHALL NOT be ratcheted.
Mutation testing re-runs the covering tests per mutant, and a score that
invites maximizing also invites tests written against mutants rather than
against behavior.

#### Scenario: The score moves between two audits

- **WHEN** an audit reports a lower score than the one before it
- **THEN** no commit is blocked by it, and its survivors are triaged

### Requirement: A shared module's tests give feedback where the code lives

A module in `src/engine/` SHALL be able to fail its own tests when its behavior
changes, and SHALL NOT rely solely on a consumer's tests or a game's frozen
differential to notice. Logic that moves from a game into `src/engine/` SHALL
have its tests written in the same change. A session runs the files it
touched, so a module whose own tests cannot see its defects returns green on a
broken module.

#### Scenario: Logic is extracted into the engine

- **WHEN** logic moves from a game into `src/engine/`
- **THEN** its tests are written in the same change
- **BECAUSE** extraction moves the code but not its tests: the game's
  differential still catches defects, so nothing turns red and the module
  silently arrives with no local assertions

#### Scenario: A module is fully protected but locally silent

- **WHEN** a module has few or no surviving mutants but its own tests do not fail
  on a defect planted in it
- **THEN** that is a feedback defect to fix, not a coverage success to report
- **BECAUSE** the failure it produces is a green targeted run on a broken module

### Requirement: The local-feedback probe plants a defect and runs only the module's own tests

Local feedback SHALL be measured by planting a real defect, running only the
module's own tests, and seeing whether they fail. `npm run probe`
(`scripts/feedback-probe.mjs`) is that measurement, with a committed corpus of
hand-chosen defects. It SHALL be a diagnostic and not a ratchet, and a test
SHALL NOT be written to move its number rather than to state a behavior. A case
argued behavior-preserving SHALL be recorded as such and excluded from the
rate rather than chased.

#### Scenario: A planted defect survives

- **WHEN** a case's defect is planted and the module's own tests still pass
- **THEN** the probe reports a survivor, which is a finding and not a failed run

### Requirement: A module's own tests are derived from what imports it

A module's own tests SHALL be derived rather than assumed: they are every
engine test file that imports the module, or imports a barrel re-exporting it,
and not one file named after it. A differential SHALL NOT count as a local
test, even an engine-local one, because its guarantee is a frozen fixture
noticing that the boards moved.

#### Scenario: A module is tested through its barrel

- **WHEN** a test file imports a barrel that re-exports a module
- **THEN** that file is among the module's own tests, whatever it is named

### Requirement: The probe walks the engine recursively and fails below a floor of test files

The derivation of own tests SHALL walk `src/engine/` recursively, and SHALL
fail rather than proceed when it discovers fewer engine test files than a
committed floor. Fewer tests run against each planted defect means more cases
report as survivors, which reads as the tests having got worse, and the anchor
check does not cover it: a pure file move leaves every quoted source line in
place.

#### Scenario: The instrument stops finding tests

- **WHEN** a refactor nests engine modules deeper than the probe's directory walk
  reaches
- **THEN** the probe fails on the discovered-test-file floor
- **AND** it does NOT report a lower rate, which would be indistinguishable from
  the tests having genuinely got worse

### Requirement: A guarantee left to a differential is stated and verified

Where a module's guarantee genuinely belongs to a differential, such as an RNG
draw order or a region sizing that decides which boards exist, that division of
labor SHALL be stated in the module's test file and SHALL be verified, by
confirming the differential does fail on the defect the local tests
deliberately let through.

#### Scenario: A draw order is left to the differential

- **WHEN** a module's own tests deliberately let a change of draw order through
- **THEN** its test file says the differential holds that guarantee
- **AND** the differential has been seen to fail on that defect

### Requirement: An assertion's two sides do not derive from the same value

A test SHALL NOT compare a quantity against the thing that produced it:
`x.length` against the value `x` was sized from, a getter against its own
field, a total against the sum it was computed from. Such a comparison is a
decoration and SHALL be replaced by the independent statement the code under
test has to get right.

#### Scenario: An assertion's two sides derive from the same value

- **WHEN** a test asserts that an array's length equals the count the array was
  allocated with
- **THEN** it is replaced by a count taken independently, such as a dot's degree
  counted from the edges that name the dot as an endpoint

### Requirement: An assertion distinguishes the value it names from a superstring

An assertion SHALL be able to fail on the defect it was written for. A positive
`toContain`, or an equivalent substring check, whose needle is a single
character or a short string in a small alphabet does not meet that bar, since
the corruptions that occur are superstrings. Where the subject is a whole
rendering, the assertion SHALL be on the whole value, and an inline snapshot
SHALL be paired with at least one targeted assertion. The negative form
`not.toContain` is not covered.

#### Scenario: A text-format test is written with single-character needles

- **WHEN** a test asserts a rendered text format
- **THEN** it asserts the whole rendering, not the presence of individual
  characters
- **BECAUSE** a board whose empty-cell character `"."` is corrupted into `"./"`
  still contains `"."`

### Requirement: A C-recorded fixture is kept for what cannot be derived, not as a quality bar

The frozen C captures under `__fixtures__/` SHALL be retained where they record
a fact that has no independent derivation: which board a solver-gated generator
produces for a seed, the RNG stream, a tiling's incidence in emission order.
There the recording is the specification. This covers the per-game desc
differentials, the grid incidence differentials and the RNG corpus, which
remain the regression net for refactoring.

#### Scenario: A generator differential is kept

- **WHEN** a fixture records the description a solver-gated generator produced for
  a given seed
- **THEN** it is retained, because no independent computation yields that board
- **AND** a change that deliberately diverges retires or re-founds it, rather than
  re-recording it against a C build that no longer exists

### Requirement: A local-feedback probe case is anchored within a named function

Each case in the local-feedback probe corpus SHALL identify the function or
method whose behavior it perturbs, and its search text SHALL be required to
match exactly once within that function, rather than once within the whole
module. The anchor check SHALL keep aborting the run, and failing the commit
gate, on a missing or ambiguous anchor, because an edit that does not apply
reports a survivor, which is indistinguishable from a finding.

#### Scenario: An unrelated duplicate elsewhere in the module does not break a case

- **WHEN** a module gains a line matching a case's search text, outside the
  function that case names
- **THEN** the case still resolves, and the anchor check passes

#### Scenario: An ambiguous anchor inside the named function still aborts

- **WHEN** a case's search text matches more than once within the function it
  names
- **THEN** the run aborts rather than choosing one

### Requirement: No test file mocks a module

No test file SHALL call `vi.mock`, `vi.doMock` or `vi.hoisted`, and a check
SHALL assert it across the test tree. A test SHALL stand in for a module's
behavior by spying on the real export, with `vi.spyOn` on the module namespace
or on the shared object it exports, and SHALL restore it after each test. The
suite runs with `isolate: false`, so a module mock does not reach an importer
an earlier file in the worker already loaded, where a spy does.

#### Scenario: A test file that mocks a module is reported

- **WHEN** any test file calls `vi.mock`, `vi.doMock` or `vi.hoisted`
- **THEN** the check fails, naming the file

#### Scenario: A spied test passes in either file order

- **WHEN** a test file that spies on a module's export shares a worker with a
  file that imported that module's importers first
- **THEN** its spies observe the calls, and the next file in the worker calls
  the real function

### Requirement: The mock check says what it scanned

The mock check SHALL assert how many test files it scanned, that it scanned the
`vite-plugins/` tests as well as `src/`, and that its pattern matches known
mock calls and not a spy, so a mis-rooted glob or a pattern that stopped
matching cannot report a clean suite.

#### Scenario: The check's glob is mis-rooted

- **WHEN** the check's glob stops matching the test tree
- **THEN** the check fails on the number of files scanned, and does not report
  a suite with no mocks

### Requirement: A hint test's pinned positions keep the scan that finds them

The test harness SHALL provide one way to pin the position each of a hint's
rungs is tested on (`src/engine/testing/hint-positions.ts`). A game's hint test
SHALL pin one position for every rung the game declares (`Game.hintRungs`),
keyed by the rung's id, as an input: a `params:desc`, with the moves played on
it where the board mid-game is not itself a desc. A rung's pin is a position
whose plan holds a step of that rung.

#### Scenario: A rung with no pin

- **WHEN** a game's hint gains a rung, and its hint test neither pins a
  position for it nor lists it as unreached
- **THEN** the test file does not typecheck

#### Scenario: A rung that is only ever a later leg

- **WHEN** a rung is never the step a plan opens with, as a placement's cull
  is not
- **THEN** it is pinned on a position whose plan holds a step of it, and the
  loader says where in the plan that step is

### Requirement: A rung no known board fires is excused by name, with its reason

A rung that no known board fires SHALL be excused from its pin only by listing
it with the reason, and the scan SHALL walk the excused rungs too and say when
one fires.

#### Scenario: A rung excused from a pin that fires

- **WHEN** a rung is listed as unreached and the scan finds a position that
  fires it
- **THEN** the scan command says so and prints the position to pin

### Requirement: A further kind is a predicate over the step, never a pattern over its sentence

A kind a test pins beyond the rung ids SHALL be a predicate over the step a
plan opens with, the board it is asked from and the plan, for what a rung id
does not say: a step's shape, which of a rung's cases it is, the board's, or
the plan's. A predicate SHALL be given the plan and SHALL NOT ask the game's
hint for it. A kind SHALL read the step's fields and SHALL NOT be a pattern
matched against its sentence; the harness's type for a kind does not admit
one.

#### Scenario: A kind with no pin

- **WHEN** a test names a kind and pins no position for it
- **THEN** the file does not typecheck

#### Scenario: A kind about the plan

- **WHEN** a kind is a plan whose opening step has a continuation after it
- **THEN** its predicate reads the plan it is given, and the hint is asked
  once for that position

#### Scenario: A board on which a solver rung fires

- **WHEN** a test wants the board a solver rung fires on, and no step says so
- **THEN** the kind is a predicate that asks the solver about the board the
  hint is asked from, and the pin is that board

### Requirement: A kind named as a leg is held by any step of the plan

A kind that names its predicate as a leg SHALL be held by any step of the plan,
as a rung id is; the board its predicate is given is still the one the plan was
asked from. A test file that pins positions of its own beside the game's rungs
SHALL do so through the same harness, with kinds that are rung ids, predicates
or legs.

#### Scenario: A case of a rung that is only ever a later leg

- **WHEN** a test wants one case of a rung, which a predicate tells apart, and
  that case is not the step a plan opens with
- **THEN** the kind names the predicate as a leg, and the loader returns the
  first step of the plan it accepts and where that step is

### Requirement: The harness tests that every pin still fires, and snapshots what it says

The harness SHALL declare the test that every pin's plan still fires its kind,
and SHALL fail a pin that does not with the command that finds another. It
SHALL also hold the sentence said at each pin as a snapshot, which is where a
rung's wording is asserted, since no pin reads it.

#### Scenario: A pin stops firing

- **WHEN** a change to a hint, a solver or a generator leaves a pinned
  position whose plan no longer fires the pin's kind
- **THEN** the pin's test fails, quoting what the hint says there now and the
  rungs of its plan
- **AND** the failure names the command that scans for a position that fires

#### Scenario: A reworded sentence

- **WHEN** a hint's sentence is reworded and its deduction is not changed
- **THEN** every pin still fires, and the snapshot of what each pin says is
  the test that changes

### Requirement: A pinned step's frame is drawn through the midend

The harness SHALL provide the frame of a pinned position's step
(`renderPinnedHint`, `src/engine/testing/render-scenario.ts`), drawn through
the midend with the legs before that step played as the midend plays a hint. It
SHALL fail where the step the midend shows is not the pin's, by its sentence
and its move. A test SHALL NOT reach a hint's frame by walking a plan on a
board it keeps by hand.

#### Scenario: The frame of a later leg

- **WHEN** a render test wants the frame of a pin whose step is a later leg
- **THEN** the frame shows that step on the board the legs before it leave
- **AND** a pin whose opening step says the same sentence is not taken for it

### Requirement: The scan walks hint-guided play over fixed seeds and counts each kind

The scan SHALL walk hint-guided play over fixed seeds, taking each plan's first
step and asking again. It SHALL report for every kind how many of the positions
walked it held on and the one of them to pin: one where the kind's step opens
the plan before one where it comes later, then the fewest moves in.

#### Scenario: Scanning again

- **WHEN** the scan command is run on a hint test file
- **THEN** it walks its boards and reports a position for every kind
- **AND** each is reported with how many of the positions walked it held on,
  and a kind that held on none is reported as not found

### Requirement: A scan plays what its test says, for a kind hint-guided play does not meet

Where a test says so, the scan SHALL play moves before the first hint, ask the
hint under a `Ui` the test names, and walk a second line of play that the test
steers, for a kind hint-guided play does not meet.

#### Scenario: A sentence spoken only off the hint's line

- **WHEN** a hint keeps to lines that finish, and a rung is about a move
  that would not
- **THEN** the test gives the scan a second line of play, naming the move
  played at each turn from the board and the move the hint offers
- **AND** the kinds are counted over both lines

### Requirement: A pin carries its count, and comes from the scan in the tree

A pin SHALL be recorded with the count of positions walked that its kind held
on. A hint test SHALL NOT pin a position found by a scan that is not in the
tree, unless the scan in the tree was run and did not reach the kind, which the
pin SHALL say with the count walked.

#### Scenario: The scan in the tree does not reach a kind

- **WHEN** the tree's scan walks its boards and no position holds a kind, and a
  position for it is known by other means
- **THEN** the pin is kept by hand and says that the scan reached none, with
  the count it walked

### Requirement: A hint test does not walk seeds to find its position

A hint test SHALL NOT walk seeds to find the position it asserts on. A test
that asserts a property of every board or step it walks is a sweep and not a
scan for a position, and is not covered by this requirement.

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

### Requirement: One command scans a hint test's positions and writes its pins

The repository SHALL provide `npm run hint-scan -- <test file>`
(`scripts/hint-scan.ts`), which runs the scans the file declares through the
hint-position harness and writes each scan's positions into that call's `pins`
object, each pin under how many of the positions walked it held on. It SHALL
find a call's `pins` by parsing the file, so a call at any indent, inside a
`describe`, or the second of several in one file is written the same way. It
SHALL write no file but that test file.

#### Scenario: Adding a kind

- **WHEN** a game's hint gains a rung, or a test names a new kind, and the
  command is run on the test file
- **THEN** the file gains a pin for it under the count it held on
- **AND** every pin that still fires is byte-for-byte the board it was

### Requirement: The scan command keeps a pin that still fires

The scan command SHALL NOT replace a pin that still fires its kind, because
tests and snapshots are written against a pin's board: it brings that pin's
count up to date and no more, and replaces it only when asked for every pin. It
SHALL leave in place a pin for a kind the scan found no position for, and name
it, because such a pin is kept by hand for a kind the scan's line of play does
not reach.

#### Scenario: A pin kept by hand

- **WHEN** the scan finds no position for a kind whose pin still fires
- **THEN** the pin is left as written, comment and all
- **AND** the command says the pin is kept by hand and the scan reaches none

#### Scenario: A stale pin

- **WHEN** a pin no longer fires its kind and the scan finds a position that
  does
- **THEN** the pin is replaced by that position and its count

### Requirement: The scan command fails on a kind nothing fires, and on an empty scan

The scan command SHALL exit non-zero, naming the kind, when a kind has neither
a pin that fires nor a position found. An empty result SHALL NOT read as
health: the command SHALL fail when the file declares no scan, and when the
file fails before any scan runs it SHALL fail with the error the test runner
gave.

#### Scenario: A kind nothing fires

- **WHEN** a kind has no pin, or a stale one, and the scan finds no position
- **THEN** the command names the kind and exits non-zero
- **AND** it does not write a placeholder that would make the file look pinned

#### Scenario: A file with no scan

- **WHEN** the command is run on a test file that declares no hint pins
- **THEN** it fails saying so, and does not report that every pin stands

### Requirement: A pin that does not load does not stop a scan

While a scan runs, a pin that does not load SHALL NOT stop the file being
collected: the harness hands a test that reads such a pin a stand-in, so a test
file that reads a pin in a `describe` body can still be scanned for the pin it
lacks.

#### Scenario: A pin read while tests are collected

- **WHEN** a test file reads a pin in a `describe` body, and that pin is
  missing or stale
- **THEN** an ordinary run fails at collection with the command to run
- **AND** the command itself still scans the file and writes the pin

### Requirement: A scan whose pins live elsewhere is printed, not written

A scan whose pins are not written in the call, as a cross-game guard's are when
it keeps them in a module of their own, SHALL have its positions printed and
nothing written.

#### Scenario: A cross-game guard is scanned

- **WHEN** the command is run on a guard whose pins are in another module
- **THEN** it prints the positions it found and edits no file

### Requirement: A cross-game sweep SHALL take its boards from the shared slice, not build them

A test that walks the collection SHALL obtain the boards it walks from the one
shared preset enumeration, and SHALL NOT construct a population of its own out
of a game's parts, such as a game's first preset or a tier written onto it.

#### Scenario: A sweep is written that walks the collection

- **WHEN** a new cross-game test needs a board per game
- **THEN** it calls the shared slice, and gains every game's every mode with no
  key of its own to maintain

#### Scenario: A guard needs a configuration the presets menu does not offer

- **WHEN** the behavior a guard observes needs a params combination no preset
  carries, such as a small grid at a hard tier, which a menu never pairs
- **THEN** the guard walks the slice and that combination, and says which
  behavior needs it

### Requirement: The shared slice holds the cost discipline of a searching hint

A hint that plans by searching pays for board size in each search and in the
number of moves to make. The shared enumeration SHALL give such games every
mode on the smallest board offering it and no large board at all, derived from
the same axes as every other game's slice. It SHALL NOT be a count of presets
to keep.

#### Scenario: A slice is taken for a game whose hint searches

- **WHEN** the shared enumeration slices the presets of a game whose hint plans
  by searching
- **THEN** the slice holds every mode, each on the smallest board offering it,
  and no large board, with no count of presets to raise when a mode is added

### Requirement: A cross-game sweep SHALL deal every choice the Custom dialog offers

The shared preset enumeration a cross-game sweep takes its boards from SHALL
deal, beside the slice of the menu, a board for every value of a `"boolean"` or
`"choices"` param that no preset holds. A game is dealt on everything its
dialog offers by having a `paramConfig`, and no list of games or values SHALL
be kept anywhere.

#### Scenario: A game's dialog offers a tier its menu stops short of

- **WHEN** a game's difficulty item lists a tier and none of its presets is at
  that tier
- **THEN** every cross-game sweep that takes its boards from the shared
  enumeration deals a board at that tier, on the first preset that accepts it,
  per commit and in the slow tier
- **AND** a throw planted in a hint arm only that tier reaches turns those
  sweeps red

#### Scenario: A game gains a choice

- **WHEN** a game's `paramConfig` gains a checkbox or a choice, or a list of
  choices gains a member, and no preset is changed
- **THEN** the new value is dealt from that commit, with no line added anywhere
  to enroll it

#### Scenario: A sweep reads the menu by itself

- **WHEN** a cross-game sweep slices or lists a game's presets directly
- **THEN** it deals nothing the menu leaves out, which is right only for a
  sweep whose subject is the menu or the slicing rule

### Requirement: Every value is dealt, the generator's choices included

Every value SHALL be dealt, the generator's own choices, such as symmetry and
density, included. A ledger excusing the values a hint is unlikely to read
SHALL NOT be kept: it would be a second copy to keep true.

#### Scenario: A generator choice no preset holds

- **WHEN** a game's dialog offers a symmetry that no preset holds
- **THEN** a board is dealt at it, as for a tier or a rule

### Requirement: Whether every value is dealt is asserted apart from the derivation

Whether every value is dealt SHALL be asserted from `paramConfig` and the dealt
boards alone, not through the derivation that deals them, and the assertion
SHALL name known boards by the params they carry.

#### Scenario: The derivation drops a value

- **WHEN** the derivation that deals the boards stops dealing a value a
  dialog offers
- **THEN** the assertion, reading `paramConfig` and the dealt boards, fails

### Requirement: A cross-game sweep deals each board once

A cross-game sweep that needs a board of given params SHALL take it from
`dealt(game, params, n)` in `src/engine/testing/dealt.ts`, and a sweep that
drives a `Midend` SHALL begin it with `beginDealt`, which hands the midend the
same board by the route New game takes with a board dealt ahead, the
generator's `aux` included. The dealer SHALL keep each board for the life of
the worker, so every sweep in a worker reads one deal of it. A deal that throws
SHALL be kept and thrown again.

#### Scenario: Two sweeps walk the same preset

- **WHEN** two cross-game sweeps in one worker each walk Group's 8x8 at Hard
- **THEN** the board is dealt once and both walk it

#### Scenario: A sweep drives a midend

- **WHEN** a sweep begins a midend on a dealt board
- **THEN** the midend holds the generator's `aux` for it, as it does for a
  board a player was dealt

#### Scenario: A board cannot be dealt

- **WHEN** the generator runs out its retries on a params set
- **THEN** every sweep asking for that board gets the same refusal, and the
  generator runs once

### Requirement: A cross-game guard bounds its cost on the axis the game varies

Where a cross-game guard walks a game's presets, it SHALL slice them on the
axis that game actually varies, and it SHALL derive any cost exemption from a
property the game already has and not from a list of game ids.

#### Scenario: A guard excuses some games a cost

- **WHEN** a cross-game guard needs to walk some games less than the rest
- **THEN** the games are found from a property each already has, read from the
  game, and the guard carries no list of ids

### Requirement: A sweep's per-commit amount is chosen through perCommit

The amount a sweep does in the hook SHALL be chosen through
`perCommit(hook, wide)` in `src/engine/testing/slow.ts`, which reads the role
toggle the hook sets and nothing else, so CI, a manual `npm run gate` and a
bare `vitest` all do the wide amount.

#### Scenario: A sweep is run outside the hook

- **WHEN** a sweep's file is run by a bare `vitest`, with no toggle set
- **THEN** it walks the wide amount

### Requirement: A sweep's ledger is true of the hook's boards and of the push's

An assertion held against what a sweep found (a ledger of sentences heard, a
floor on boards walked) SHALL be true of the hook's boards and of the push's.
The two can differ by more than size: the slice takes the smallest preset
supplying each value still wanted, so leaving out the largest board can change
which preset a mode is walked on.

#### Scenario: A ledger is held against the hook's walk and the push's

- **WHEN** a sentence over the length limit is spoken only on a board the hook
  walks and the push does not, or the reverse
- **THEN** the ledger lists it with a board that speaks it, and both runs pass

### Requirement: The gate rejects a test whose every assertion is conditional

The gate SHALL fail on a test whose every assertion sits behind a condition
without the test also asserting how many cases it examined, and the check SHALL
carry a floor on the test files and the tests it scanned. A condition means an
`if`, and equally `if (…) continue;` or `if (…) return;`, the same guard
written the other way round. A test that cannot fail passes forever, and a
green test and a vacuous one are the same observation.

#### Scenario: a test scans for a case and finds none

- **WHEN** a test's assertions run only inside a conditional
- **THEN** the gate fails unless the test also asserts the number of cases it
  examined, outside that conditional
- **AND** a fixture that stops producing the case then fails and does not pass
  silently

#### Scenario: a test has already written its own vacuity guard

- **WHEN** a scan returns on finding its case and ends in an unconditional
  `throw`, or an `if`/`else` asserts on both branches
- **THEN** the guard is silent, because one of those paths always runs
- **AND** the exemption is derived from the syntax and not held in a roster

#### Scenario: a test genuinely cannot count what it examined

- **WHEN** the healthy state of the system is that the condition never fires
- **THEN** the test is carried in the guard's ledger with the reason, keyed on
  its title and not its line, so the entry survives edits above it
- **AND** the ledger is asserted exactly equal to the guard's findings, so an
  entry that stops being needed fails as loudly as a new offender

#### Scenario: the guard is proven before it is trusted

- **WHEN** the guard runs
- **THEN** it first checks itself against fixtures for every shape it claims to
  catch and every exemption it claims to make, and fails if any behaves wrongly
- **AND** a guard about tests that cannot fail is therefore never one itself

### Requirement: Which test shapes the gate guards is decided by measurement

Which shapes are guarded SHALL be decided by measuring each candidate against a
corpus of tests known to be vacuous, not by how confident a shape looks. Of the
candidates measured, only "every assertion conditional" is built. "Both sides
of an assertion are one expression" and "a bound the type guarantees" caught
none of the corpus, and reported only sound or already-reviewed sites.

#### Scenario: A new shape is proposed for the check

- **WHEN** a change proposes that the check also reject another shape of test
- **THEN** the candidate is run over tests known to be vacuous, and what it
  catches there and what else it reports decide whether it is built

### Requirement: A game's render test records through the shared recording drawing

A test asserting what a game draws SHALL drive the engine's shared recording
drawing rather than a double of its own, so that the record it asserts against
contains every primitive the game emitted. A hand-rolled double records only
the calls its author anticipated, so a game that begins drawing something new,
or stops drawing something, leaves such a test green.

#### Scenario: a game changes what it draws

- **WHEN** a game's renderer emits a primitive it did not emit before
- **THEN** the recording contains it, whether or not the test asserts on it
- **AND** a test asserting the frame as a whole shows it as a reviewable diff

### Requirement: The capability snapshot records a draw state's field names and judges none

The derived capability snapshot SHALL record the field names of a game's draw
state as well as of its `Ui`, read as `newDrawState` returns it at the game's
preferred tile size, before any `redraw`. It SHALL record names only, and SHALL
assert nothing about which names a game uses: its job is to make a change a
reviewable line in a diff, and an approved vocabulary would be a list only this
check reads.

#### Scenario: a game's draw state loses a field

- **GIVEN** a change that removes a field from one game's draw state
- **WHEN** the suite runs
- **THEN** the snapshot moves, and the loss is visible in the diff
- **AND** no assertion is made about what any field should be called
