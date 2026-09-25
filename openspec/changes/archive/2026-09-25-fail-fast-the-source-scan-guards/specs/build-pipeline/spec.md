## ADDED Requirements

### Requirement: The gate runs the source-scan tests as a pass ahead of the rest of the suite

The gate SHALL run the **source-scan test files** as a vitest pass of their own,
after the node guards of the fail-fast prefix and before the rest of the suite
and `vite build` start, and SHALL fail without starting either when a scan fails.
A source scan costs milliseconds, and as an ordinary vitest file it was reported
only after the whole run: on 2026-09-22 one commit failed twice that way, each
time about eight minutes in.

Membership SHALL be **derived from what the file is**, never listed: a test file
is a source scan when it reads source through an `import.meta.glob` with a `?raw`
query, no glob it calls imports code, and its import closure reaches no module
under `src/games/`. That last condition is structural rather than a timing, since
a file that cannot reach a `Game` cannot build a board. Anything the derivation
cannot resolve SHALL count against membership, which only moves a file into the
main pass.

The two passes SHALL **partition** the suite: one list is the scan pass's
`include` and the main pass's `exclude`, and the gate SHALL ask vitest before the
scan pass to confirm that every test file an unsplit run would run lands in
exactly one pass and that the scan pass is not empty. The split changes only when
a failure is reported, never what runs. Outside the gate the suite is one run of
everything, and the hook's test selection applies to both passes unchanged.

#### Scenario: A commit breaks a source scan

- **WHEN** a staged change fails a source-scan test, such as a palette slot that
  departs from its shared role without a reason
- **THEN** the gate fails in the scan pass, before the main vitest pass or `vite
  build` start
- **BECAUSE** measured with such a plant on 2026-09-25, the gate reported it
  twenty seconds after starting, where the same class of failure had cost about
  eight minutes on 2026-09-22

#### Scenario: A test file falls out of both passes

- **WHEN** a configuration change leaves a test file in neither pass, or in both
- **THEN** the partition check fails and names the file, before any test runs
- **BECAUSE** a file in neither pass would pass by never running; both plants
  were shown to fail on 2026-09-25

#### Scenario: A source scan starts importing a game

- **WHEN** a scan-pass file acquires an import whose closure reaches `src/games/`
- **THEN** it moves into the main pass on the next run, with no list to edit
- **BECAUSE** membership is read from the file's imports, and the partition holds
  whatever the derivation answers
