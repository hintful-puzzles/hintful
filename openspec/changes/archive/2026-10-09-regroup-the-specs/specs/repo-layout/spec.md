## REMOVED Requirements

### Requirement: The build output directory is `dist/`

**Reason**: declared: `.gitignore` carries `/dist/`, the build writes there by
Vite's default (no `outDir` is set for the app build), and `build-pipeline`
reads `dist/` throughout. The refusal of `build/` is held by "Repo root holds
product-level config only", whose list of entry-point directories is closed and
has no `build/`; the directory was dead C-toolchain output (commit 04bbd76e)
and nothing is left that would produce one.

### Requirement: Behavior is testable in-process across three tiers

**Reason**: Moved to `testing`, with its words.

### Requirement: Each tier runs in the cheapest environment that fits

**Reason**: Moved to `testing`, with its words.

### Requirement: New UI or persistence behavior ships an in-process test

**Reason**: Moved to `testing`, with its words.

### Requirement: The render harness is one recorder and one scenario driver

**Reason**: Moved to `testing`, with its words.

### Requirement: A draw record is deterministic

**Reason**: Moved to `testing`, with its words.

### Requirement: A render test pairs a snapshot with targeted assertions

**Reason**: Moved to `testing`, with its words.

### Requirement: A shared helper carries the byte-for-byte differential shape

**Reason**: Moved to `testing`, with its words.

### Requirement: The frozen fixtures' provenance is stated once, and no recipe is carried

**Reason**: Moved to `testing`, with its words.

### Requirement: The test suite is deterministic under parallel load

**Reason**: Moved to `testing`, with its words.

### Requirement: Efficiency is asserted by a proxy, never by elapsed time

**Reason**: Moved to `testing`, with its words.

### Requirement: There is one test timeout, and it is a backstop

**Reason**: Moved to `testing`, with its words.

### Requirement: Non-termination is bounded in code, not by a timeout

**Reason**: Moved to `testing`, with its words.

### Requirement: A load-only failure is root-caused

**Reason**: Moved to `testing`, with its words.

### Requirement: Test worker processes do not outlive their runner

**Reason**: Moved to `testing`, with its words.

### Requirement: The reaper kills only this repo's orphans, and never fails a run

**Reason**: Moved to `testing`, with its words.

### Requirement: Every generate-until-success loop is bounded by the shared retry limit

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: An exhausted retry limit throws, or hands over to a bounded recovery

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: Every help page the app serves lives under `help/`

**Reason**: Moved to `help-pages`, with its words.

### Requirement: No served page documents a platform this app is not

**Reason**: Moved to `help-pages`, with its words.

### Requirement: Every cataloged puzzle has a help page, and every page a cataloged game

**Reason**: Moved to `help-pages`, with its words.

### Requirement: Adopting or relocating a help page changes no words, attribution or URL

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A help source directory does not shadow a served URL directory

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A game's help page introduces the puzzle, not its implementation

**Reason**: Moved to `help-pages`, with its words.

### Requirement: The test suite's strength is audited, not assumed

**Reason**: Moved to `testing`, with its words.

### Requirement: The mutation audit is not a gate, and its score is not ratcheted

**Reason**: Moved to `testing`, with its words.

### Requirement: A shared module's tests give feedback where the code lives

**Reason**: Moved to `testing`, with its words.

### Requirement: The local-feedback probe plants a defect and runs only the module's own tests

**Reason**: Moved to `testing`, with its words.

### Requirement: A module's own tests are derived from what imports it

**Reason**: Moved to `testing`, with its words.

### Requirement: The probe walks the engine recursively and fails below a floor of test files

**Reason**: Moved to `testing`, with its words.

### Requirement: A guarantee left to a differential is stated and verified

**Reason**: Moved to `testing`, with its words.

### Requirement: An assertion's two sides do not derive from the same value

**Reason**: Moved to `testing`, with its words.

### Requirement: An assertion distinguishes the value it names from a superstring

**Reason**: Moved to `testing`, with its words.

### Requirement: A C-recorded fixture is kept for what cannot be derived, not as a quality bar

**Reason**: Moved to `testing`, with its words.

### Requirement: The site-level help documents the features this fork adds

**Reason**: Moved to `help-pages`, with its words.

### Requirement: The help names a control the way the app names it

**Reason**: Moved to `help-pages`, with its words.

### Requirement: The help says why the hint differs, and when it refuses

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A cross-game hint mark is explained once, by its shape

**Reason**: Moved to `help-pages`, with its words.

### Requirement: The help describes a feature's rule, never its rollout

**Reason**: Moved to `help-pages`, with its words.

### Requirement: Help coverage is asserted from the app, and fails closed

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A glyph a help page names resolves to a real icon rule

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A local-feedback probe case is anchored within a named function

**Reason**: Moved to `testing`, with its words.

### Requirement: Every game's help page has one skeleton, read off the game

**Reason**: Moved to `help-pages`, with its words.

### Requirement: The sections a page owes are derived from the game

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A puzzle's credits sit under the origins heading and nowhere else

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A game's Hints section teaches its hint marks

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A game's parameters section is generated from its paramConfig

**Reason**: Moved to `help-pages`, with its words.

### Requirement: No test file mocks a module

**Reason**: Moved to `testing`, with its words.

### Requirement: The mock check says what it scanned

**Reason**: Moved to `testing`, with its words.

### Requirement: A suspected cross-file leak is localized in one worker, in both orders

**Reason**: process: a debugging procedure no change is checked against, read
by a session with a test that fails only in a full run, which reads
`docs/games/testing.md` § "Seed-deterministic, never clock-gated". That section
says only "re-run the file alone, then the suite under
`--sequence.shuffle.files=true`", so the guide entry below carries the rest.

### Requirement: A hint test's pinned positions keep the scan that finds them

**Reason**: Moved to `testing`, with its words.

### Requirement: A rung no known board fires is excused by name, with its reason

**Reason**: Moved to `testing`, with its words.

### Requirement: A further kind is a predicate over the step, never a pattern over its sentence

**Reason**: Moved to `testing`, with its words.

### Requirement: A kind named as a leg is held by any step of the plan

**Reason**: Moved to `testing`, with its words.

### Requirement: The harness tests that every pin still fires, and snapshots what it says

**Reason**: Moved to `testing`, with its words.

### Requirement: A pinned step's frame is drawn through the midend

**Reason**: Moved to `testing`, with its words.

### Requirement: The scan walks hint-guided play over fixed seeds and counts each kind

**Reason**: Moved to `testing`, with its words.

### Requirement: A scan plays what its test says, for a kind hint-guided play does not meet

**Reason**: Moved to `testing`, with its words.

### Requirement: A pin carries its count, and comes from the scan in the tree

**Reason**: Moved to `testing`, with its words.

### Requirement: A hint test does not walk seeds to find its position

**Reason**: Moved to `testing`, with its words.

### Requirement: One command scans a hint test's positions and writes its pins

**Reason**: Moved to `testing`, with its words.

### Requirement: The scan command keeps a pin that still fires

**Reason**: Moved to `testing`, with its words.

### Requirement: The scan command fails on a kind nothing fires, and on an empty scan

**Reason**: Moved to `testing`, with its words.

### Requirement: A pin that does not load does not stop a scan

**Reason**: Moved to `testing`, with its words.

### Requirement: A scan whose pins live elsewhere is printed, not written

**Reason**: Moved to `testing`, with its words.

### Requirement: A help page names a field's choice through a placeholder

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A help page does not type a choice's name

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A game page's list of rulesets is generated

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A game page's list of rule modifiers is generated

**Reason**: Moved to `help-pages`, with its words.

### Requirement: The gate holds every open loop that draws randomness to a stated bound

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: The open-loop scan keys on shape and references

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: The open-loop scan runs in the source-scan pass and carries its known positives

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A loop that deals a whole board again takes the guard, and the ledger is for the rest

**Reason**: Moved to `engine-difficulty`, with its words.
