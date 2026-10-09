## MODIFIED Requirements

### Requirement: The gate's checks are listed in one place

The list of the gate's checks SHALL have one definition, `scripts/gate.sh`,
which carries the reason for each step in a comment. A spec, a guide and a
workflow's comment SHALL state the gate's properties and SHALL NOT restate the
list. Membership is normative per check: a guard belongs in the gate because
its own capability requirement says so, and this capability says only that the
gate runs all of them, fails closed and is ordered fast-first.

#### Scenario: A reader asks which checks the gate runs

- **WHEN** a session needs the gate's steps or the reason for one
- **THEN** `scripts/gate.sh` answers, and no spec or guide carries a second
  list to disagree with it

#### Scenario: The CI workflow describes a job that runs the gate

- **WHEN** the CI workflow's comment or a step's name says what the gate job
  runs, or what the build job runs of the gate before it builds
- **THEN** it names `scripts/gate.sh` as where the steps are, and lists no step

#### Scenario: A check is deleted from the gate

- **WHEN** a change removes a guard's step from `scripts/gate.sh`
- **THEN** it contradicts the requirement of the capability that put the guard
  there, and that requirement is what the change has to answer

### Requirement: A documentation-only commit skips the heavy checks in the hook

The automatic per-commit hook skips `vitest run` and `vite build` only when
every staged path is documentation that is neither a test input nor a build
input; one staged path outside that set SHALL run the whole gate. A staged
path is any path the commit changes: a deleted file's, and both paths of a
moved one. CI and a manual `npm run gate` SHALL run everything. `help/` SHALL
NOT be skippable: it is a `vite build` input. A run that takes the shortcut
SHALL say what it skipped.

#### Scenario: A documentation-only commit skips the heavy checks

- **WHEN** every path staged for a commit is documentation that no test and no
  build input reads
- **THEN** the per-commit hook runs the fast prefix and skips `vitest run` and
  `vite build`
- **AND** it says so, naming what it skipped and where the full gate still runs

#### Scenario: One source file cancels the exception

- **WHEN** a commit stages documentation together with any other path
- **THEN** the whole gate runs, because the exception is an all-or-nothing test
  on the staged set and not a per-file filter

#### Scenario: A source file is deleted beside a documentation edit

- **WHEN** a commit stages an edit under `docs/` and the deletion of a file
  under `src/`
- **THEN** the whole gate runs, as it does for a file moved from `src/` into
  `docs/`, whose old path is staged with its new one

#### Scenario: A commit that only deletes documentation

- **WHEN** every path a commit stages is a deletion under `docs/`
- **THEN** the hook takes the shortcut, as it does for an edit there

#### Scenario: A root markdown file that something reads

- **WHEN** a commit stages only `README.md`, which a test reads, or only
  `LICENSE.md`, which the About dialog imports
- **THEN** the whole gate runs, as it does not for `CREDITS.md`, which nothing
  reads

### Requirement: The skippable paths are asserted to have no reader

The set of paths the documentation-only shortcut skips SHALL be asserted and
not assumed: a test SHALL fail if a module the skipped steps load acquires a
read of a path in that set. The test SHALL take the set from the shortcut's
own pattern in `scripts/gate.sh`, and SHALL key on the shape of a read (a
file-reading call or an import whose path is written out) and not on the
paths' names, since the documentation is cited in prose throughout the
sources.

#### Scenario: A skippable path acquires a reader

- **WHEN** a test, source or build-side module begins reading a path the gate
  may skip
- **THEN** a test fails, naming the file and the path
- **BECAUSE** the exception's whole basis is that those paths reach nothing, and
  a check skipped for a path that has become real is a dropped check reporting
  success

#### Scenario: What the skipped steps load

- **WHEN** the test gathers the modules to scan
- **THEN** they are the sources and tests under `src/`, the build's
  configuration and its plugins, the test runner's configuration, and the
  TypeScript under `scripts/`: the test selector, the scan pass and the test
  files run on demand

#### Scenario: A check in the fast prefix reads the documentation

- **WHEN** a node check the gate runs ahead of the shortcut reads `docs/`, as
  the engine catalog's and the spelling guard's do
- **THEN** the test does not scan it, since the shortcut does not skip it

#### Scenario: A path is added to the shortcut's pattern

- **WHEN** a path that a test globs, or that a module imports as text, is added
  to the pattern in `scripts/gate.sh`
- **THEN** the test fails on that path with no second list to update

#### Scenario: A path assembled as the code runs

- **WHEN** a module reads a file whose path it builds from parts and does not
  write out
- **THEN** the test does not see that read, which is the bound of what it
  measures

### Requirement: Refactoring metrics are measured on demand

The repository SHALL provide an on-demand metrics harness, `npm run metrics`,
orchestrated by `scripts/metrics.sh`, that records code-health measurements
(duplication, import cycles, dead code and cognitive complexity) as the
tools' own output, reduced only where a later round has nothing to diff
against, and committed with the work it measured. The harness SHALL NOT be
part of the pre-commit gate or of CI's blocking checks: its value is the diff
between rounds, not per-commit freshness.

#### Scenario: The metrics harness is not in the gate

- **WHEN** a commit is made
- **THEN** the pre-commit gate does not run the metrics harness
- **AND** the round-over-round diff remains the harness's purpose

#### Scenario: A reading that is reduced

- **WHEN** the harness records duplication and cognitive complexity
- **THEN** the duplication report keeps where each clone is and how long, and
  not the source text the tool repeats
- **AND** the complexity report keeps each function's file, line and score,
  measured on a copy of the source with the rule's suppressions removed, so a
  suppressed function is still counted

#### Scenario: The import-cycle reading

- **WHEN** the harness records import cycles
- **THEN** the tool's raw output is kept beside the reading made from it,
  which counts only the cycles that exist at run time

#### Scenario: The dead-code reading

- **WHEN** the harness records dead code
- **THEN** the reading is the output of the gate's own unused-export check
- **AND** a reading that is missing is reported as missing and not as a clean
  tree

### Requirement: The typechecker sees every TypeScript file in the repository

Every `.ts` / `.mts` file in the repository SHALL belong to a TypeScript
project the gate checks, and the gate SHALL fail, naming the file, on a tracked
one that belongs to none. A file outside every project's `include` is checked
by nothing, and the compiler cannot say so, since it reports on the files it
was given.

#### Scenario: A build-side file gains a type error

- **WHEN** a change introduces a type error in a vite config, a vite plugin, or
  a check under `scripts/checks/`
- **THEN** the gate's typecheck fails

#### Scenario: A script is added beside the checks

- **WHEN** a TypeScript file is added under `scripts/` and no project's
  `include` is edited
- **THEN** it is in the build-side project, which includes that directory whole

#### Scenario: A TypeScript file in a new top-level directory

- **WHEN** a TypeScript file is tracked in a directory no project includes
- **THEN** the gate fails before anything else can pass over it, and names the
  file
