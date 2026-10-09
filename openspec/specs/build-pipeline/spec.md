# build-pipeline Specification

## Purpose

How this repository decides that a tree is fit to commit, publish and run, and
what that decision is allowed to cost: the gate that `scripts/gate.sh` defines
and that the pre-commit hook and CI both run; the rule that no correctness
check is dropped or weakened to buy speed, and the scopings by role permitted
instead; what the hook may select, narrow or defer to the push, and what a
deferral must leave covered; the guards the gate carries of its own; the
metrics harness, which is not a gate; the compiler-strictness decisions; the
build's independence from any native toolchain, and what the build asserts of
its own output; error reporting; and the deploy, which publishes the gate's
own artifact and is verified against the deployed origin. What any single
test asserts belongs to the capability that test serves, and how a cost is
measured or a test made cheaper is `docs/games/testing.md`.

## Requirements

### Requirement: Continuous integration runs the full gate on push to main

The repository SHALL provide a GitHub Actions workflow that, on every push to
`main`, runs the same gate as the husky pre-commit hook: `npm run gate`, whose
steps `scripts/gate.sh` defines. The project is trunk-based, with no
pull-request flow, so the gate runs after the push and not before a merge, and
it is what catches a `--no-verify` commit or a clone whose hooks never
installed.

#### Scenario: A push to main is gated

- **WHEN** a commit is pushed to `main` (including one made with `--no-verify`)
- **THEN** the workflow runs `npm run gate` and fails the run on any gate failure

### Requirement: The pre-commit gate minimizes wall-clock without dropping checks

The pre-commit gate SHALL run every check `scripts/gate.sh` defines and SHALL
block a commit on any failure, except as the scopings by role in this spec
permit. The cheap checks SHALL run first as a fail-fast prefix, cheapest first,
so that a type, lint, formatting or guard failure costs seconds and not the
whole gate.

#### Scenario: A cheap check fails

- **WHEN** a commit stages a type error
- **THEN** the gate fails in its prefix, before `vitest run` or `vite build`
  start, and the commit is blocked

### Requirement: The two heavy checks run concurrently, whatever the machine load

`vitest run` and `vite build` share no inputs or outputs and SHALL run
concurrently, so the gate's wall-clock is the longer of the two and not their
sum. The gate SHALL fail if either fails. The gate SHALL NOT make that
concurrency conditional on machine load.

#### Scenario: The independent heavy steps run concurrently

- **WHEN** the pre-commit gate runs after its fail-fast prefix passes
- **THEN** `vitest run` and `vite build` execute concurrently, regardless of
  machine load
- **AND** the commit is rejected if either the tests or the production build
  fails

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

### Requirement: The gate verifies that every probe case still applies

The gate SHALL verify that every case in the local-feedback corpus still
applies: its anchor is present and unique in the module it names. The check
SHALL run no tests and SHALL assert nothing about the corpus's result. The
corpus is verbatim excerpts of engine source, so a refactor of a probed line
otherwise leaves the harness measuring a smaller corpus and reporting success.

#### Scenario: A refactor moves a line the probe corpus anchors on

- **WHEN** a commit changes an engine line that a probe case quotes as its anchor
- **THEN** the gate fails naming the case, and the case is re-anchored (or
  retired) as part of that commit
- **AND** re-anchoring is the moment a person decides whether the case still
  states the defect it claims to

### Requirement: The gate's biome step checks formatting and import order

The gate's biome step SHALL check formatting and import order as well as lint
rules, in the read-only form of `biome check`, so a file that is lint-clean but
unformatted cannot be committed. The fixer command `npm run check` SHALL NOT
stand in for it, because nothing requires the fixer to be run.

#### Scenario: A staged unformatted file is rejected by the hook

- **WHEN** a commit stages a file that satisfies every lint rule but is not
  formatted (or has unsorted imports) to the repository's biome configuration
- **THEN** the per-commit hook's staged biome check fails in the fail-fast
  prefix and the commit is blocked, before the heavy checks are spent

### Requirement: The biome step is scoped by role

The automatic per-commit hook SHALL check only the staged files
(`biome check --staged`), since a commit can make a file unformatted only by
touching it. CI and a manual `npm run gate` SHALL check the whole tree
(`biome ci`), and that SHALL NOT be scoped down: CI is the only gate a
`--no-verify` commit passes through, and the whole-tree pass is what forces a
tree-wide reformat when a biome upgrade restyles files no single commit
touched.

#### Scenario: An unformatted file that is not staged

- **WHEN** the tree holds an unformatted file that the commit does not stage
- **THEN** the hook does not block the commit on it, since it is outside what
  the commit introduces

#### Scenario: The whole-tree backstop still catches a bypass

- **WHEN** an unformatted file reaches `main` via a `--no-verify` commit, or a
  biome upgrade restyles files no single commit touched
- **THEN** the whole-tree `biome ci` in CI (and in a manual `npm run gate`) fails
- **BECAUSE** the per-commit scope is a per-commit optimization, not a relaxation
  of the guarantee that `main` stays formatted

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

### Requirement: An assertion defers to push only when it checks decay

An individual assertion SHALL defer from the per-commit hook to the push only
when it checks decay: whether something has stopped being true. The half of a
guard that catches what the author just wrote SHALL stay on the per-commit
path. Where an assertion's verdict depends on expensive work elsewhere in its
file, that work and the assertion SHALL defer together: an assertion run
against a walk narrowed beneath it reports a finding it has not measured.

#### Scenario: A decay check defers to push while its partner stays per-commit

- **WHEN** a guard has one half that catches a defect the commit just introduced
  and another whose verdict needs expensive work and reports decay
- **THEN** the per-commit hook runs the first half and skips the second, and the
  second runs in CI on every push and in a manual `npm run gate`

#### Scenario: A deferred assertion and the work it reads defer together

- **WHEN** an assertion's verdict is decided against a walk that the per-commit
  hook narrows
- **THEN** the assertion is skipped on that run and not evaluated against the
  narrowed walk
- **BECAUSE** an assertion run against a sample that cannot contain its subject
  reports a finding it never measured

### Requirement: A deferred assertion runs on every push and is reported as skipped

A deferred assertion SHALL run in CI on every push to `main`: it SHALL be
selected by the role toggle the hook sets and by nothing else. Deferring into a
tier that runs only on request is the slow tier's business. In the hook the
assertion SHALL be skipped at the runner level, so a run that did not check it
says so; it SHALL NOT be left to pass over a sample it could not take.

#### Scenario: The hook skips a deferred assertion

- **WHEN** the per-commit hook runs a test file that holds a deferred assertion
- **THEN** the test runner reports that assertion as skipped, and CI runs it on
  the push

### Requirement: The role toggle is the hook's alone, and a test holds it there

The push-time backstop SHALL be asserted by a test: a test SHALL fail if the
role toggle is ever set in CI, or if the hook stops setting it. Set in both
places, the deferred assertions run nowhere while both runs report green.

#### Scenario: The role toggle leaks into CI

- **WHEN** the CI workflow is edited to set the per-commit role toggle, or the
  hook stops setting it
- **THEN** a test fails naming it
- **BECAUSE** every deferral rests on CI being the backstop, and a toggle set in
  both places means the deferred assertions run nowhere while both runs report
  green

### Requirement: No correctness check is removed or weakened to buy speed

No correctness check SHALL be removed or weakened to buy speed, and none SHALL
be moved off the per-commit path except by a scoping by role that keeps the
push-time backstop intact. Such a scoping is not a weakening, because the
whole-tree, whole-suite run in CI and in `npm run gate` still holds `main` to
the guarantee. `vite build` SHALL remain in the gate: it is the only step that
exercises the production build.

#### Scenario: A step is proposed for removal to save time

- **WHEN** a change proposes dropping `vite build` from the gate because it is
  slow
- **THEN** it is refused, because nothing else in the gate exercises the
  production build

### Requirement: Pool tuning keeps the suite deterministic, or is reverted

Any vitest pool or isolation tuning adopted to reduce per-file module-load
overhead SHALL preserve the `repo-layout` requirement "The test suite is
deterministic under parallel load", verified by a green full run repeated
under the new configuration, including under file-order shuffle, which
stresses the shared module state a non-isolated pool exposes. Otherwise it
SHALL be reverted.

#### Scenario: A speed change never weakens the gate

- **WHEN** a pool/isolation setting is changed to speed up `vitest run`
- **THEN** the full suite is shown to remain green and deterministic under the
  new setting (repeated runs, including under file-order shuffle)
- **AND** if it does not, the setting is reverted and not shipped

### Requirement: The gate is one script, and the hook selects its role by environment

The gate's orchestration SHALL live in a single script, `scripts/gate.sh`,
invoked by both `.husky/pre-commit` and `npm run gate`, so the hook and the
manual command cannot drift. The hook's narrower role SHALL be selected by
environment toggles the hook sets and not by a second copy of the gate:
`GATE_BIOME_STAGED` for the biome scope, and `GATE_PRECOMMIT` for everything
else the hook does less of. `GATE_PRECOMMIT` SHALL be the only signal an
individual deferred assertion reads.

#### Scenario: The gate is run by hand

- **WHEN** `npm run gate` is run with neither toggle set
- **THEN** the same script runs as in the hook, with biome over the whole tree
  and the whole suite

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

### Requirement: A round's metrics snapshot is filed under the change that ordered it

A round's dated snapshot SHALL be committed under the openspec change that
produced it, once it is final, and SHALL travel into the archive with that
change: it is evidence for one piece of work, and it measures a tree that no
longer exists. The harness itself SHALL write to the stable path
`metrics/<date>/`, and the change's author files the finished snapshot, which
keeps `repo-layout`'s rule that a tool SHALL NOT write its output into an
`openspec/changes/<id>/` directory.

#### Scenario: A refactoring round records its baseline

- **WHEN** a change orders a metrics round
- **THEN** `npm run metrics` writes the raw tool output and a summary
- **AND** the snapshot is committed under that change's directory, not at the
  repository root

### Requirement: Cognitive complexity comes from Biome

Cognitive complexity SHALL be obtained from Biome's
`complexity/noExcessiveCognitiveComplexity`, which implements the published
Sonar algorithm in the linter already installed. A second lint toolchain SHALL
NOT be added to compute it.

#### Scenario: A round measures cognitive complexity

- **WHEN** the metrics harness measures cognitive complexity
- **THEN** it runs Biome with that rule, and no other linter is installed for it

### Requirement: A static-analysis finding is triaged against the type information behind it

Type-aware analysis that reports a condition as impossible SHALL have each such
finding triaged before any code is removed, as exactly one of three things: a
guard made redundant by a type tightened after it was written, which is
deleted; a check that was intended to fire and cannot, which is a defect, fixed
with the behavior change reported; or a correct runtime guard that the type
system misrepresents, which is kept, with the reason recorded so the next
audit does not raise it again.

#### Scenario: A never-firing check turns out to be load-bearing

- **WHEN** triage finds a reported condition was genuinely written to reject an
  invalid state and cannot do so
- **THEN** the condition is corrected so that it fires as intended, with a test
- **AND** any resulting change in generated boards is reported, not absorbed

### Requirement: A guard the type system misrepresents is kept

A correct runtime guard that analysis reports as dead SHALL be kept. It is the
common case in this repository, by two mechanisms. Narrowing is not
invalidated by a mutating call, so a solver's second check of a mutable flag,
after a technique that can set it, reads as dead. Index access is typed as
total while `noUncheckedIndexedAccess` is off, so a comparison of an indexed
read against `undefined` reads as having no overlap; these are mostly
description parsers validating a pasted game ID.

#### Scenario: A bounds check in a description parser is reported as dead

- **WHEN** type-aware analysis reports `if (c === undefined)` after an indexed
  read as having no overlap
- **THEN** the guard is kept, because the read can return `undefined` at runtime
  regardless of its declared type
- **AND** the finding is recorded as an analysis artifact and not triaged again
  on every later audit

#### Scenario: A solver's second contradiction check is reported as always falsy

- **WHEN** a solver checks a mutable flag, calls a technique that can set it, and
  checks it again
- **THEN** the second check is kept
- **BECAUSE** the narrowing that makes it look dead does not survive the call at
  runtime, and removing it would let an impossible board be reported as solved

### Requirement: An analysis that depends on a declined compiler flag is not a gate

An analysis whose soundness depends on a compiler flag the project has declined
SHALL NOT be adopted as a blocking gate. Without the flag it is wrong in a
specific and confident direction, and a mechanical fix pass would delete
exactly the validation the declined flag existed to enforce.

#### Scenario: A type-aware rule is proposed for the gate

- **WHEN** a rule that reports impossible conditions, and is sound only under
  `noUncheckedIndexedAccess`, is proposed as a blocking check
- **THEN** it is not adopted as one, and what it reports is triaged finding by
  finding

### Requirement: Compiler strictness is adopted on measured evidence, not from a checklist

Additional TypeScript strictness flags SHALL be adopted on the evidence of what
they cost and what they buy, measured against this tree, and the reasoning for
a declined flag SHALL be recorded in `tsconfig.json` beside the ones that are
on, so the next reader gets the measurement and does not derive it again.

#### Scenario: A strictness flag is proposed from a checklist

- **WHEN** a change proposes enabling a compiler strictness flag
- **THEN** its error count against the current tree is measured first
- **AND** the flag is adopted only if the errors represent distinctions the code
  genuinely blurs, and not assertions restating what the surrounding control
  flow already guarantees, or widenings that restore the semantics already in
  force

#### Scenario: A declined flag is proposed again later

- **WHEN** a contributor considers enabling a flag that was previously declined
- **THEN** `tsconfig.json` states the measured cost and the reason
- **AND** the decision is revisited only on new evidence, such as a format that
  begins to distinguish a missing key from an explicit null

### Requirement: noUncheckedIndexedAccess stays off, and a boundary checks explicitly

`noUncheckedIndexedAccess` SHALL NOT be enabled tree-wide. It applies to typed
arrays, the house pattern for game state and render cache keys, and where an
index comes from the loop bounds above it the only fix is a non-null assertion
at every access. Where the guarantee is earned (decoding a save,
parsing a game ID or a user-supplied description) it SHALL be obtained with an
explicit check at that boundary, and such checks SHALL NOT be removed on the
word of an analysis that cannot see them.

#### Scenario: A description parser reads past its input

- **WHEN** a description parser reads a character by index
- **THEN** it tests the read explicitly before using it, and that test stays
  whatever a type-aware analysis says of it

### Requirement: A test is not deferred when it is the only cover of a configuration

Deferral to the opt-in tier, `npm run test:slow`, SHALL be reserved for cases
where the cost is board size and not configuration. A test SHALL NOT be deferred when it is the only
one covering some configuration: deferring the only fixture for a grid type
silently removes that grid type from every commit. The remaining coverage
SHALL be stated where the deferral is made.

#### Scenario: A differential fixture is deferred

- **WHEN** the largest board of a game's frozen differential is moved to the
  opt-in tier
- **THEN** every mode, difficulty and grid type it carried is still asserted on
  every commit by the smaller fixtures, and that is stated at the call site
- **BECAUSE** the differentials are the refactoring net: a refactor that changes a
  solver's verdict must still change a desc the gate checks

### Requirement: The app builds from a clean checkout with no toolchain but Node

A clean checkout SHALL build the complete app (every game, every help page, the
service worker and the PWA assets) with `npm install` as the entire setup, and
SHALL pass the gate in CI with `npm ci` as the entire setup. No native
toolchain, no system package and no generated artifact SHALL be required, at
config-load time or at build time, and CI SHALL NOT provision or cache one.

#### Scenario: A clean checkout builds with nothing installed but Node

- **WHEN** the app is built from a fresh clone on a machine with no native
  toolchain and no system package beyond Node
- **THEN** `npm install && npm run build` produces the complete app
- **AND** every game and every help page is present in `dist/`
- **AND** nothing is missing or degraded relative to a machine that has such
  tools

#### Scenario: The workflow installs no system package

- **WHEN** the CI workflow's steps are inspected
- **THEN** the only setup is `actions/setup-node` and `npm ci`
- **AND** no `apt-get`, `brew` or other native-tool provisioning step is present

### Requirement: Nothing is generated into the source tree

Nothing the build reads SHALL be generated: the game catalog is committed
TypeScript source (`src/puzzle/catalog-data.ts`), the per-puzzle icons are a
committed snapshot, and the help pages are committed markdown. There SHALL be
no asset build step.

#### Scenario: No artifact is generated into the source tree

- **WHEN** the repository is inspected after a build
- **THEN** `src/assets/` holds only committed files
- **AND** `.gitignore` carries no rule for a generated directory under `src/`

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

### Requirement: The build-side files are a separate project, as strict as the app's

The build-side files (the vite and vitest configs, the vite plugins, and the
advisory checks that run outside the gate) SHALL be a separate project from
the app and not folded into it, because the app's project is deliberately
browser-shaped (`"types": []`, a DOM lib) and tests read source through
`import.meta.glob` to stay inside it. The separation SHALL be by runtime only:
every strictness flag SHALL be identical, so a file does not become more
permissive by being a build file.

#### Scenario: The app's type world stays browser-shaped

- **WHEN** the build-side project is configured
- **THEN** it is a separate project with a Node runtime
- **AND** the app's project still declares no ambient Node types

### Requirement: A live build option the tool's type does not declare is kept

Where a build tool's published type is narrower than its implementation, the
option SHALL be kept and its type widened at the one property, with the
evidence that the option is live recorded beside it. It SHALL NOT be deleted on
the strength of the type alone, and it SHALL NOT be preserved by asserting the
type of its whole containing object, which stops checking every sibling key.
The type says the same thing about a dead option and a live one.

#### Scenario: An option the bundler's type does not declare

- **WHEN** the typechecker rejects a build option as an unknown property
- **THEN** whether the tool's implementation still reads it is established
  before anything is changed
- **AND** a dead option is deleted, while a live one is kept with its type
  widened at that property alone and the evidence recorded

### Requirement: Every asset the build emits is precached, or the build fails

The production build SHALL verify that every file it writes to the output
directory appears in the service worker's precache manifest, and SHALL fail
otherwise. The check SHALL run against the built output and the generated
service worker, not against the configuration, which is the thing being
checked. An asset whose extension is missing from the precache allowlist still
builds and ships, and is only missing offline, where nothing else can see it.

#### Scenario: A new asset type ships outside the offline cache

- **WHEN** the build emits a file whose extension is not in the precache
  allowlist and is not deliberately excluded
- **THEN** the build fails, naming the extension and an example file

### Requirement: The precache check's exclusions are shared and held exactly

A file deliberately kept out of the precache SHALL be excluded through the
same declaration Workbox's own `globIgnores` reads, and not by a second copy
beside it. The check's own ledger of build machinery, which is never
precached, SHALL be held to being exactly right: an unconditional entry
matching no file fails the build, and an entry emitted only under some
configurations SHALL be marked as such, so the check does not have to be
weakened to survive an ordinary local build.

#### Scenario: A file is deliberately kept out of the precache

- **WHEN** a file the build emits, such as the 404 page, is deliberately kept
  out of the precache
- **THEN** the same declaration is what Workbox skips and what the check skips

#### Scenario: An excuse outlives its file

- **WHEN** an unconditional entry of the check's ledger matches no file the
  build emits
- **THEN** the build fails, naming the entry

### Requirement: The precache check reports extensions and cannot pass over nothing

The check SHALL report the offending file extensions and not the files, since
the fix is always to the allowlist and a list of hashed filenames buries it. It
SHALL fail on its own input count, so a listing that matches nothing cannot
report health.

#### Scenario: The check cannot pass over nothing

- **WHEN** the output listing finds implausibly few files
- **THEN** the build fails on the count and does not report coverage

### Requirement: A host that cannot deliver the security headers is a recorded decision

The build emits `dist/_headers` (the Content-Security-Policy, the cache-control
policy for immutable asset paths, and the rest of the security headers) in the
format one specific host reads. A host that cannot set response headers, or
that reads a different format, SHALL NOT be adopted silently: either the rules
are translated into that host's own configuration, or the loss is stated as a
decision with its cost. An inert `_headers` in the build output looks exactly
like a working one.

#### Scenario: Adopting a host without header support

- **WHEN** a host is chosen that cannot deliver the emitted headers
- **THEN** the loss is recorded in the change's design with what it costs, and
  the headers are not left looking as though they apply

### Requirement: The cache-control rules are translated with the CSP

The cache-control rules SHALL be translated alongside the CSP when a
translation is needed. Hashed asset paths are `immutable` for a year and the
HTML entry points are not; inverting that ships an app that cannot update
itself.

#### Scenario: The header rules are translated for another host

- **WHEN** the emitted rules are rewritten in another host's configuration
- **THEN** the hashed asset paths are still served `immutable` and the HTML
  entry points are still not

### Requirement: The content security policy grants only origins the app loads

Every origin named in the CSP SHALL correspond to something the app actually
loads, and an origin that is conditional on configuration SHALL be added
conditionally, as the Sentry origin is added only when `VITE_SENTRY_DSN` is
set. A policy that whitelists an unused third-party script origin is strictly
weaker than one that does not, for no benefit.

#### Scenario: An unused vendor origin is not whitelisted

- **WHEN** the app is built with no analytics block configured
- **THEN** the emitted CSP names no analytics vendor origin

### Requirement: The emitted header rules do not grow with the catalog

The `_headers` file the build emits SHALL contain a number of rules that does
not depend on how many puzzles the catalog holds, and the build SHALL fail if
the rendered file exceeds the host's rule limit or holds no rule at all. That
limit is a parser limit and not a quota: it cannot be raised by migrating or
by paying, and rules past it are dropped with no error and no visible change,
so one rule per puzzle page would turn it into a limit on the number of games.

#### Scenario: Adding a puzzle does not add a header rule

- **WHEN** a puzzle is added to the catalog
- **THEN** the number of rules in the emitted `_headers` file is unchanged

#### Scenario: A build whose header rules would be silently truncated

- **WHEN** the rendered `_headers` file contains more rules than the host will
  parse, or no rule at all
- **THEN** the build fails, naming the count and the limit

### Requirement: A test is retired or deferred by measurement, never by category

A test SHALL be judged by what it would catch in a refactor that no cheaper
test would, and never by the era or the category it belongs to. "It was written
for the port" is not by itself a reason: the frozen `c-reference` differentials
are porting artifacts and also the strongest net under solver refactoring,
because a change to a solver's verdict changes which boards exist.

#### Scenario: A configuration would lose its last cover

- **WHEN** retiring or deferring a test would leave a mode, grid type, difficulty
  or board size with nothing asserting it on every commit
- **THEN** the test stays, however slow, unless the change names the test that
  still covers that configuration at the site of the change
- **BECAUSE** a silently removed configuration reads identically to one that was
  never covered

### Requirement: A cross-game guard bounds its cost on the axis the game varies

Where a cross-game guard walks a game's presets, it SHALL slice them on the
axis that game actually varies, and it SHALL derive any cost exemption from a
property the game already has and not from a list of game ids.

#### Scenario: A guard excuses some games a cost

- **WHEN** a cross-game guard needs to walk some games less than the rest
- **THEN** the games are found from a property each already has, read from the
  game, and the guard carries no list of ids

### Requirement: The hint-resume walk excuses the games that can say a search ran out

Which games the hint-resume walk excuses its completion promise SHALL be a
separate population, `SEARCH_REACH_GAMES`: the games whose own code names
`SEARCH_OUT_OF_REACH`, the refusal that admits a search ran out, or hands a
search's outcome to `searchRefusal`, which names it for them. A game can
search without the slide planner, so the excuse SHALL NOT be keyed on the
planner.

#### Scenario: A game that searches without the slide planner may refuse past its reach

- **WHEN** a game's hint can say `SEARCH_OUT_OF_REACH` from a search of its own
- **THEN** the hint-resume walk excuses it by the same derivation, and its ledger
  entry is required before the guard passes

### Requirement: An excused game's reason and remaining cover are recorded per member

The reason a member is excused, and the test that still covers its largest
board on every commit, SHALL be recorded per member, with the derivation
asserted to be exactly the ledger, so a game that later joins the mechanic
fails the guard until someone writes that sentence.

#### Scenario: A newly enrolled game has no ledger entry

- **WHEN** the derivation enrolls a game the ledger does not name
- **THEN** the ledger's equality assertion fails until its entry names what
  covers its largest board

### Requirement: Import-graph selection alone is unsound here, and is used only in a union

Selecting which tests a commit runs by walking the static import graph alone
(`vitest related`, `vitest --changed`, or any equivalent) SHALL NOT be adopted.
A cross-game guard reads what a game is, its source text included, through
`import.meta.glob(..., "?raw")`, and a file read as text forms no import edge.
The graph SHALL be used only as one term of a union with a glob-reach channel,
which "The pre-commit hook may run a selected subset of the suite" specifies.

#### Scenario: A commit touches only help pages

- **WHEN** a selector reports no tests for a change under `help/`
- **THEN** the selector is rejected, and the guards are not skipped
- **BECAUSE** `help/` is a build input and the subject of the help-coverage
  guard, which is why it is already excluded from the documentation-only
  shortcut

### Requirement: A test selector is accepted only against two experiments

A scheme that selects on what a test actually read at runtime is acceptable
too. Any selection scheme SHALL be accepted only against two experiments, a
change to one game's source and a change to a `help/` page, and only if it
selects the glob-based guards for both. It SHALL treat an unclassifiable
change as "run everything" and never as "run nothing".

#### Scenario: A test-impact selector is proposed

- **WHEN** a change proposes to run only the tests downstream of a commit
- **THEN** it is run against a game source change and a `help/` change, and
  adopted only if it selects the glob-based guards for both
- **BECAUSE** the guards this project most relies on are exactly the ones a
  static graph cannot see, and switching them off is silent

### Requirement: The pre-commit hook may run a selected subset of the suite

The automatic per-commit hook runs only the test files a commit can have
broken. CI and a manual `npm run gate` SHALL continue to run the whole suite,
so the guarantee on `main` is unchanged. The selection SHALL be the union of
two channels, because neither is sufficient alone: the static import graph,
via `vitest list --changed`; and every test whose walk reaches a staged path.

#### Scenario: A commit changes a help page

- **WHEN** only files under `help/` are staged
- **THEN** the guards that glob `help/` are selected and run
- **BECAUSE** the import graph alone selects nothing for such a change

### Requirement: The selector's walk reads the globs of every module it visits

The walk SHALL follow imports and SHALL read the `import.meta.glob` calls of
every module it visits, not only of the test file. A guard that reads source
through a helper reads what the helper's glob matches, and a scan of the test
file alone cannot see it.

#### Scenario: A guard reads source through a helper

- **WHEN** an engine module is staged, and a guard reads engine source only
  through a helper module's glob
- **THEN** the guard is selected
- **BECAUSE** the helper's glob is read by every file that imports the helper,
  and a selector that read only the test file's own globs would skip it

### Requirement: A glob is matched by its literal base directory

The glob channel SHALL match by the pattern's literal base directory, the
prefix before its first wildcard, and SHALL NOT evaluate the pattern. A matcher
for Vite's glob syntax that is subtly wrong silently skips a guard, while
matching by base directory can only select more tests.
The one narrowing it takes is to require a match to end in the pattern's
literal last segment, or in the literal after a last segment of the form
`*<literal>`, since every file the pattern matches does.

#### Scenario: A staged file lies under a glob's base directory

- **WHEN** a test globs a directory with wildcards in the middle of its pattern,
  and a staged path lies under the literal prefix and ends as the pattern ends
- **THEN** the test is selected, whether or not the full pattern would match
  the path

### Requirement: The selector fails closed

The selector SHALL fail closed, resolving to the whole suite whenever a staged
path lies outside the directories it models, the union is empty, or anything
at all goes wrong.

#### Scenario: A commit touches a file the selector does not model

- **WHEN** a staged path lies outside the modeled directories: a config file, a
  template, a script
- **THEN** the whole suite runs
- **BECAUSE** a wrong "everything" costs minutes and a wrong subset costs a guard

### Requirement: No test reaches its subject through a channel the selector cannot model

A test SHALL NOT reach its subject through a channel the selector cannot
model. A guard SHALL assert this by reading the tree, failing on a computed
`import.meta.glob` pattern or on a direct filesystem read from a test inside
the gate's `include`, and SHALL be shown to fail before it is trusted.

#### Scenario: A test acquires an unmodeled read channel

- **WHEN** a test is written with a computed glob pattern, or reads the
  filesystem directly
- **THEN** the guard fails the build and names the file
- **BECAUSE** the coupling would otherwise be invisible to the selector, and the
  commit that broke it would pass without ever running it

### Requirement: The gate holds the selector's walk to known couplings

The gate SHALL hold the walk to known couplings on the real tree, among them a
glob reached only through a helper, so that a walk gone blind fails and does
not report a small selection.

#### Scenario: The walk stops seeing a helper's glob

- **WHEN** a change to the walk makes it miss a glob that a test reaches only
  through a helper
- **THEN** the gate fails on the known coupling

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

### Requirement: A complexity ceiling is set from the tree's own distribution

The cognitive-complexity ceiling SHALL be a number taken from the measured
distribution of this repository, recorded with that measurement, and SHALL NOT
be left at a value no function in the tree can reach: a rule that never fires
reads as enforced and is off. The distribution has a long tail, so the ceiling
is chosen for the size of the exception list it produces: one whose list is
the `interpretMove`, `redraw` and deduction-loop shapes a port inherently has
is suppressed at each and ignored.

#### Scenario: a new function exceeds the ceiling

- **WHEN** a function is added whose cognitive complexity is above the ceiling
- **THEN** the gate fails, and the author either simplifies it or records at the
  site why the shape is inherent

#### Scenario: an existing site is accepted rather than simplified

- **WHEN** a site named by the rule is an input arbitrator, a redraw diff or a
  deduction loop whose branching is inherent
- **THEN** it stays, with a comment at the site stating the reason it is that
  shape
- **AND** the comment states the constraint, not the history of the decision

### Requirement: Nothing exports a symbol no other file imports

The repository SHALL carry a check reporting every export under `src/`,
`vite-plugins/` and `scripts/` that no other file imports. It SHALL run in the
gate's fast prefix, with a ledger naming every export that is kept despite
having no importer, and the ledger SHALL be asserted exactly equal to the
check's findings, so an entry that stops earning its place fails as loudly as
a new dead export, and an empty ledger is itself a claim.

#### Scenario: an export loses its last importer

- **WHEN** the only import of an exported symbol is deleted
- **THEN** the gate fails, naming the symbol and its file
- **AND** deleting the export, or importing it again, makes the gate pass

### Requirement: The unused-export check floors what it read

The check SHALL carry vacuity floors on the files it parsed, the exports it
found and the fraction of internal import specifiers it resolved.

#### Scenario: the resolver stops following this tree's imports

- **WHEN** a change makes internal `.ts` specifiers stop resolving
- **THEN** the floor on the resolved fraction fails, and the check does not
  report a clean tree

### Requirement: What counts as a use of an export is a rule, never a list

A use SHALL be defined by rule each time and never by a list: a named or
namespace import, a re-export, an entry file, a glob whose modules are really
imported, and a name mentioned in the signature of another export that is
itself reached, because a caller writing the object literal an exported
function takes reaches that type whether or not it imports the name. Being
reached only through `export * from` a barrel, or through a `?raw` glob that
reads the module as text, SHALL NOT count as a use.

#### Scenario: a relay is counted as a consumer

- **WHEN** a module is reached only through `export * from` a barrel, or through
  an `import.meta.glob` that reads it as text with `?raw`
- **THEN** its exports are NOT thereby counted as used, because neither is a use
- **AND** the check's report is verified against a deliberately planted dead
  export, since both of those blind spots are silent and not wrong

### Requirement: The unused-export check is the repository's own, not knip

The check SHALL be the repository's own script and SHALL NOT be `knip`. This
repository writes every import with a `.ts` specifier, which knip's resolver
does not follow, so its module graph stops at each entry file and its clean
report is a scan of nothing.

#### Scenario: knip is proposed for dead exports again

- **WHEN** a change proposes installing knip to find unused exports
- **THEN** it is declined, because on this tree knip follows no import past an
  entry file and so reports no unused export at all

### Requirement: The gate holds absence to one spelling

The repository SHALL carry `scripts/checks/absence-spelling.mjs`, run in the
gate's fast prefix, and it SHALL fail on two shapes across every tracked
TypeScript file. First, `undefined` written as a member of a union type
anywhere but inside a cast, which is the `ts-engine` rule "Absence has one
spelling" held by syntax. Second, a strict comparison against `null` or
`undefined` whose other operand's type holds the other word and not this one:
always false, and what a respelling leaves behind.

#### Scenario: a respelled helper leaves a dead comparison

- **WHEN** a function's declared return moves from `T | undefined` to `T | null` and a caller still tests `=== undefined`
- **THEN** the gate fails naming the comparison and the operand's type, although the typechecker passes

### Requirement: The absence guard derives its exceptions and proves itself

The guard's exceptions SHALL be derived from syntax and never listed: a cast
describes a value the language produced, a comparison against an index read is
a bounds check while `noUncheckedIndexedAccess` is off, and an operand whose
type is generic, `any` or `unknown` has no absent word the checker can know.
The guard SHALL prove both halves on every run against fixtures parsed in
memory, and SHALL floor the files, unions and comparisons it examined.

#### Scenario: a cast is not a declaration

- **WHEN** a render function reads `hint?.highlights as MyHint | undefined`
- **THEN** the guard does not report it, however deep inside an inline type the union sits

#### Scenario: the guard stops seeing the tree

- **WHEN** the file listing, the parse or the program load examines fewer files, unions or comparisons than its floor
- **THEN** the guard fails and says which floor, and does not pass

### Requirement: A stated reporting rule matches what the build does

Where this project states that errors reach an error-reporting service, a
deployed build SHALL actually be able to send them, or the statement SHALL be
amended to say that it does not. A rule enforced against nothing is worse than
no rule: it reads as a guarantee, code is written to satisfy it, and nobody
discovers it is inert until the failure it exists for is the one nobody heard
about.

#### Scenario: A reporting rule is stated but no build implements it

- **WHEN** the project documents that unrecoverable errors reach a reporting
  service
- **THEN** either the deployed build can send them, or the documentation records
  that reporting is deliberately off

### Requirement: Turning on error reporting settles its side effects deliberately

Enabling error reporting SHALL NOT be treated as setting one variable. Setting
`VITE_SENTRY_DSN` widens the Content-Security-Policy's `connect-src` to the
reporting origin, and SHALL NOT turn on anything else a player's browser sends
by itself: the build requests no high-entropy client hints (`Accept-CH`), the
SDK tracks no sessions and sends no client reports, and nothing is sent while
nothing has gone wrong.

#### Scenario: Error reporting is switched on for a deployment

- **WHEN** a deployment sets `VITE_SENTRY_DSN`
- **THEN** the CSP's `connect-src` names the reporting origin
- **AND** no `Accept-CH` header is emitted

### Requirement: A public DSN is restricted at the reporting service

A client-side DSN is public by construction: it is compiled into the shipped
bundle and readable from the deployed assets, whatever it is stored in. The
reporting service's own allowed-domains list and rate limits are the controls
that restrict its use, and both SHALL be configured, since an unrestricted
public DSN accepts traffic from anywhere.

#### Scenario: A DSN is set for a deployment

- **WHEN** a deployment sets `VITE_SENTRY_DSN`
- **THEN** the service's allowed domains and rate limits are configured

### Requirement: Error reporting is verified on the deployed origin

Reporting SHALL be verified on the deployed origin by observing a deliberately
triggered and consented report arrive, since a DSN that is set but wrong is
indistinguishable from an app that never crashes.

#### Scenario: Reporting has just been switched on

- **WHEN** a deployment sets `VITE_SENTRY_DSN`
- **THEN** a deliberately triggered report the player agreed to is observed
  arriving

### Requirement: What a crash report carries matches what the privacy notes promise

The privacy notes a player can read SHALL describe what a crash report actually
contains. Before reporting is enabled, one real payload SHALL be read against
those notes, and any excess SHALL be turned off or the notes amended in the same
change.

#### Scenario: A crash report would carry more than the notes describe

- **WHEN** the payload a deployment would send exceeds what the privacy notes
  promise
- **THEN** the excess is disabled, or the notes are corrected in the same change

### Requirement: The gate runs the source-scan tests as a pass ahead of the rest of the suite

The gate SHALL run the source-scan test files as a vitest pass of their own,
after the node guards of the fail-fast prefix and before the rest of the suite
and `vite build` start, and SHALL fail without starting either when a scan
fails. A source scan costs milliseconds, and as an ordinary vitest file it is
reported only after the whole run.

#### Scenario: A commit breaks a source scan

- **WHEN** a staged change fails a source-scan test, such as a palette slot that
  departs from its shared role without a reason
- **THEN** the gate fails in the scan pass, before the main vitest pass or `vite
  build` start

### Requirement: Source-scan membership is derived from what the file is

Membership SHALL be derived from what the file is, never listed: a test file is
a source scan when it reads source through an `import.meta.glob` with a `?raw`
query, no glob it calls imports code, and its import closure reaches no module
under `src/games/`. That last condition is structural and not a timing, since a
file that cannot reach a `Game` cannot build a board. Anything the derivation
cannot resolve SHALL count against membership, which only moves a file into
the main pass.

#### Scenario: A source scan starts importing a game

- **WHEN** a scan-pass file acquires an import whose closure reaches `src/games/`
- **THEN** it moves into the main pass on the next run, with no list to edit
- **BECAUSE** membership is read from the file's imports, and the partition holds
  whatever the derivation answers

### Requirement: The scan pass and the main pass partition the suite

The two passes SHALL partition the suite: one list is the scan pass's `include`
and the main pass's `exclude`, and the gate SHALL ask vitest before the scan
pass to confirm that every test file an unsplit run would run lands in exactly
one pass and that the scan pass is not empty. The split changes only when a
failure is reported, never what runs. Outside the gate the suite is one run of
everything, and the hook's test selection applies to both passes unchanged.

#### Scenario: A test file falls out of both passes

- **WHEN** a configuration change leaves a test file in neither pass, or in both
- **THEN** the partition check fails and names the file, before any test runs
- **BECAUSE** a file in neither pass would pass by never running

### Requirement: The app is published once the fast checks and the build pass

The app SHALL be deployed to a public HTTPS origin, and the deploy SHALL wait
on the gate's checks up to and including the production build: the typecheck,
the lint, the source checks and openspec validation, run by `scripts/gate.sh`
itself with `GATE_BUILD_ONLY=1`, so the deploy and the gate cannot disagree
about what those checks are. The build that runs there SHALL be the artifact
published.

#### Scenario: A commit that fails the fast checks does not reach the public URL

- **WHEN** a commit lands on `main` whose typecheck, lint, source checks or build
  fail
- **THEN** no deploy is published for that commit

### Requirement: The test suite runs beside the deploy and does not hold it back

The test suite SHALL run in CI beside the deploy, as the full `npm run gate`,
and a failure there SHALL fail the run without holding back the deploy.

#### Scenario: The suite does not hold back the deploy

- **WHEN** a commit lands on `main`
- **THEN** it is published once the fast checks and the build pass, and the
  suite's result arrives on the same run afterwards

### Requirement: The publish is verified on the deployed origin

Verification SHALL be performed against the deployed origin, not against a
local build, for what fails silently there. A route SHALL load by its clean URL
(`/pegs` served from `pegs.html`): extensionless resolution is host behavior,
so it is checked and never assumed. The security headers SHALL be seen to
arrive, by inspecting the response and not inferred from `dist/_headers`
existing in the output.

#### Scenario: A puzzle route is reachable by its clean URL

- **WHEN** the deployed origin is asked for a puzzle route with no `.html`
  extension
- **THEN** the corresponding page is served

### Requirement: The service worker and the crawler files are verified on the deployed origin

On the deployed origin the service worker SHALL be seen to register and the app
to open with the network off, since registration is scope- and
`base`-sensitive and a local preview exercises neither. `sitemap.xml` SHALL be
seen to be present, with the `robots.txt` written beside it: the sitemap
plugin runs only when `VITE_CANONICAL_BASE_URL` is set, and without it the
build ships no sitemap and the committed default `robots.txt`, which nothing
visible reports.

#### Scenario: A deploy is built without the canonical URL

- **WHEN** the published build was made with `VITE_CANONICAL_BASE_URL` unset
- **THEN** the check of the deployed origin finds no `sitemap.xml`, which the
  build itself did not report

### Requirement: The pre-commit hook narrows the cross-game sweeps to the games a commit can reach

The automatic per-commit hook SHALL skip the cross-game cases of every game
whose code cannot reach a staged path, and SHALL NOT skip anything else on that
basis. CI and a manual `npm run gate` SHALL never narrow, so the guarantee on
`main` is unchanged. When no game reaches a staged path the hook SHALL NOT
narrow at all. Skipped cases SHALL be reported as skipped at the runner level.

#### Scenario: A commit touches only one game

- **WHEN** every staged path is under `src/games/pearl/`
- **THEN** the hook skips every cross-game case titled for a game other than
  Pearl, and runs Pearl's
- **AND** reports the skipped cases as skipped
- **BECAUSE** no other game's verdict can have changed, and CI runs them all

### Requirement: The scope is the games that reach a staged path

The scope SHALL be the games that reach a staged path: a game whose directory
holds it, and a game whose own files' walk reaches it through imports, globs or
text imports. A test file outside the game directories whose walk reaches a
staged path without passing through a game directory SHALL run with every
game's cases, in a test run of its own, because the name filter is one per
run.

#### Scenario: A commit touches an engine module some games use

- **WHEN** the staged path is an engine module that the Latin-square games
  import and no guard imports itself
- **THEN** the cross-game guards run the cases of the games that reach it and
  skip the rest
- **AND** a test file that imports the module itself runs with every game's
  cases
- **BECAUSE** a game that does not reach the module cannot have changed
  verdict, while a file that reads the module itself can fail in any case

#### Scenario: A commit touches a module every guard reads itself

- **WHEN** the staged path is the midend, which every cross-game guard imports
  directly
- **THEN** those guards run with every game's cases
- **BECAUSE** a module a guard reads itself can change every case in it

### Requirement: A skipped case is one the commit could not have turned red

A skipped case SHALL be one the commit could not have turned red, which needs
both: the case's file reaches no staged path
except through a game, and every such game is in scope; and a case titled
`<id>: …` depends on no game but `<id>`, which holds because a game cannot
import another game and no case reads a second one on purpose. A case SHALL be
recognized by that title and by nothing else, so a guard that titles its cases
otherwise is not narrowed, which only costs time.

#### Scenario: A guard titles its cases another way

- **WHEN** a cross-game guard's per-game cases do not begin `<id>: `
- **THEN** none of them is skipped on a narrowed run

### Requirement: The game scope travels as one value beside the role toggle

The scope SHALL travel as a single value, `GATE_GAME_SCOPE`, honored only
beside `GATE_PRECOMMIT=1`, so it inherits that toggle's backstop. The name
filter that skips the cases and the helpers that narrow the assertions spanning
a sweep SHALL both be derived from it, so they cannot disagree about which
games ran.

#### Scenario: The scope is set without the role toggle

- **WHEN** a run has `GATE_GAME_SCOPE` set and `GATE_PRECOMMIT` unset
- **THEN** no case is skipped and no assertion is narrowed

### Requirement: An assertion that reads across a sweep is narrowed with the sweep

An assertion that reads across a sweep SHALL be narrowed with the sweep. A
ledger compared against what the cases found SHALL be filtered to the games
that ran, so the touched game's entry is still held to its case. A floor over
the whole population that no subset can be expected to meet SHALL be skipped
on a narrowed run, unless a touched game could move it on its own; such a floor
SHALL be computed over the whole population without the narrowed work, so that
it still runs.

#### Scenario: A ledger is compared on a narrowed run

- **WHEN** the hook narrowed the run to one game, and a guard compares an
  exemption ledger against the games its cases found
- **THEN** the comparison is made over the ledger's entries for the games that
  ran
- **BECAUSE** skipping it would drop a check of the touched game's own entry,
  and making it whole would fail on every game whose case never ran

#### Scenario: A game drops out of a population no case can see

- **WHEN** a commit touching only one game removes that game's keypad, so it
  has no on-screen-key case left to fail
- **THEN** the floor on the number of games offering a keypad is still
  evaluated over every game, exactly as on an unnarrowed run
- **BECAUSE** that floor is read from the games without building a board, so
  narrowing the cases does not narrow it

### Requirement: The per-commit hook walks one board of each kind, and the push walks the rest

A cross-game sweep SHALL do less work in the automatic per-commit hook than
everywhere else only where what it leaves out is more of the same: a second or
later board of one params set, a game's largest board where a
smaller board of every mode, tier and choice is still walked, or the later
steps of one board's plan.

#### Scenario: A sweep walks several boards of one params set

- **WHEN** a cross-game sweep walks four boards of each tier
- **THEN** the per-commit hook walks one of each and CI walks the four
- **BECAUSE** the first board catches a defect that shows on every board of the
  tier, and the others catch what a push can catch in time

### Requirement: A sweep's per-commit amount is chosen through perCommit

The amount a sweep does in the hook SHALL be chosen through
`perCommit(hook, wide)` in `src/engine/testing/slow.ts`, which reads the role
toggle the hook sets and nothing else, so CI, a manual `npm run gate` and a
bare `vitest` all do the wide amount.

#### Scenario: A sweep is run outside the hook

- **WHEN** a sweep's file is run by a bare `vitest`, with no toggle set
- **THEN** it walks the wide amount

### Requirement: The hook keeps a board of every kind and every check one board can fail

For every sweep the hook SHALL keep: at least one board of every params set the
sweep walks; a board for every value of every mode, tier and choice a game's
presets or its Custom dialog offer, which is what `gatePresets` returns with
the largest board left out; and every check a single board can fail, so every
assertion still runs in the hook, over fewer boards. A sweep SHALL NOT use the
lever to leave out the only board of a kind, and the call site SHALL say what
the hook's amount still walks.

#### Scenario: A mode is offered only on a game's largest preset

- **WHEN** a value of a boolean or choice setting appears on no preset but the
  largest
- **THEN** the hook still walks a board with that value
- **BECAUSE** the lever takes off size, never a mode

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
