## ADDED Requirements

### Requirement: The per-commit hook walks one board of each kind, and the push walks the rest

A cross-game sweep MAY do less work in the automatic per-commit hook than
everywhere else, where the work it leaves out is **more of the same**: a second
or later board of one params set, a game's largest board where a smaller board
of every mode, tier and choice is still walked, or the later steps of one
board's plan. The amount SHALL be chosen through `perCommit(hook, wide)` in
`src/engine/testing/slow.ts`, which reads the role toggle the hook sets and
nothing else, so CI, a manual `npm run gate` and a bare `vitest` all do the wide
amount.

This is a fourth scoping by role, beside the staged biome check, the
documentation-only shortcut and the deferred decay assertion, and it rests on
the same backstop: CI runs the whole suite wide on every push to `main`, and
`src/gate-scope.test.ts` fails if the toggle is ever set there. It differs from
a deferred assertion in that every assertion still runs in the hook, over fewer
boards.

The hook SHALL keep, for every sweep:

- at least one board of every params set the sweep walks;
- a board for every value of every mode, tier and choice a game's presets or its
  Custom dialog offer, which is what `gatePresets` returns with the largest
  board left out;
- every check a single board can fail.

A sweep SHALL NOT use the lever to leave out the only board of a kind, and the
call site SHALL say what the hook's amount still walks.

An assertion held against what a sweep found (a ledger of sentences heard, a
floor on boards walked) SHALL be true of the hook's boards and of the push's.
The two can differ by more than size: the slice takes the smallest preset
supplying each value still wanted, so leaving out the largest board can change
which preset a mode is walked on.

A session that changes the code a sweep guards SHALL run that sweep wide before
committing (`npx vitest run <the sweep's file>`), because the hook no longer
does. The guide for writing tests names the sweeps.

Measured 2026-10-08 on the owner's machine at load 4 to 5, with every test
selected and the hook's toggle set, one run each back to back: 1,643 s of CPU
(`user + sys`) and 763 s of wall before this requirement and the shared dealer
(`ts-engine`, "A cross-game sweep deals each board once"), 865 s and 387 s
after.

#### Scenario: A sweep walks several boards of one params set

- **WHEN** a cross-game sweep walks four boards of each tier
- **THEN** the per-commit hook walks one of each and CI walks the four
- **BECAUSE** the first board catches a defect that shows on every board of the
  tier, and the others catch what a push can catch in time

#### Scenario: A mode is offered only on a game's largest preset

- **WHEN** a value of a boolean or choice setting appears on no preset but the
  largest
- **THEN** the hook still walks a board with that value
- **BECAUSE** the lever takes off size, never a mode

#### Scenario: A hint planner is changed

- **WHEN** a session edits a hint planner and commits
- **THEN** it has run the hint sweeps wide for that planner's games first, and
  the hook's narrower run is not what it relied on

#### Scenario: A ledger is held against the hook's walk and the push's

- **WHEN** a sentence over the length limit is spoken only on a board the hook
  walks and the push does not, or the reverse
- **THEN** the ledger lists it with a board that speaks it, and both runs pass
