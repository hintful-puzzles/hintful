## REMOVED Requirements

### Requirement: A module is mocked by at most one test file

**Reason**: One mocking file per module guarded only one of the ways a
`vi.mock` misses under `isolate: false`. A mock reaches only modules evaluated
after it, so any earlier file in the worker that imports a module between the
mocking file and the mocked module defeats it. `help-command-links.test.ts` and
`puzzle-command-homes.test.ts` did that to `puzzle-screen.test.ts`, and any
importer of `puzzle/puzzle.ts` did it to `utils/errors.test.ts`, while the rule
held.

**Migration**: Replaced by "No test file mocks a module", which forbids
`vi.mock` outright; the tests spy on the real export instead.

## ADDED Requirements

### Requirement: No test file mocks a module

No test file SHALL call `vi.mock`, `vi.doMock` or `vi.hoisted`, and a check
SHALL assert it across the test tree; a test SHALL stand in for a module's
behavior by spying on the real export (`vi.spyOn` on the module namespace or on
the shared object it exports) and restoring it after each test.

The suite runs with `isolate: false`, so each worker keeps one module graph from
file to file. `vi.mock` changes what the module registry hands to imports
evaluated after it and does not reach a module the graph already holds, so a
mocked test depends on no earlier file in its worker having loaded anything
between the test and the mocked module, which no file can arrange. That failed
twice: two files mocking `store/saved-games.ts` got each other's spies, and
`puzzle-screen.test.ts` lost its dialog mocks to either file that imports
`screens/puzzle-screen.ts` unmocked, failing eight tests and leaving one waiting
on a real modal until the suite's hour-long timeout. Vitest compiles an import
into a property read on the exporting module's namespace at call time, so a spy
reaches every importer however early it loaded, and restoring it gives the next
file in the worker the real function back.

The check SHALL assert how many test files it scanned, that it scanned the
`vite-plugins/` tests as well as `src/`, and that its pattern matches known
mock calls and not a spy, so a mis-rooted glob or a pattern that stopped
matching cannot report a clean suite.

#### Scenario: A test file that mocks a module is reported

- **WHEN** any test file calls `vi.mock`, `vi.doMock` or `vi.hoisted`
- **THEN** the check fails, naming the file

#### Scenario: A spied test passes in either file order

- **WHEN** a test file that spies on a module's export shares a worker with a
  file that imported that module's importers first
- **THEN** its spies observe the calls, and the next file in the worker calls
  the real function

#### Scenario: Localizing a suspected cross-file leak

- **WHEN** a test fails only in a full run and passes alone
- **THEN** the suspected files are forced into one worker
  (`VITEST_MAX_WORKERS=1 vitest run <a> <b>`) and run in both orders, with
  `--sequence.shuffle.files` under recorded seeds, because one worker still runs
  its files in the order the sequencer picks and a pair run once can pass by
  scheduling the victim first
