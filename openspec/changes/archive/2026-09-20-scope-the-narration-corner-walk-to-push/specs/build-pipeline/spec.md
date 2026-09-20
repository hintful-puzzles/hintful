# build-pipeline Specification Delta — scope-the-narration-corner-walk-to-push

## MODIFIED Requirements

### Requirement: The pre-commit gate minimizes wall-clock without dropping checks

The pre-commit gate SHALL run **every check `scripts/gate.sh` defines** and block
a commit on any failure — with the single documentation-only exception scoped
below — while being orchestrated to reduce wall-clock: the cheap checks run first
as a fail-fast prefix, cheapest first, so a type, lint, formatting or guard
failure costs seconds rather than the whole gate; and the two heavy,
mutually-independent checks (`vitest run` and `vite build`, which share no inputs
or outputs) SHALL run **concurrently**, making the gate's wall-clock
~max(vitest, build) rather than their sum.

**This requirement deliberately does not list the checks, and the reason is that
it used to.** It read "SHALL run all six checks (`tsc -b --noEmit`, biome,
`npm run probe -- --verify`, the spelling guard, `vitest run`, `vite build`)" —
a bare count in the present tense, which `AGENTS.md` § "Method" calls a census
nobody re-runs. By 2026-09-09 the gate ran eleven, the named compiler had been
replaced by `tsgo` thirty-five days earlier, and four more prose copies of the
same list elsewhere in the tree had each rotted differently. **The list has one
executable definition (`scripts/gate.sh`) and one readable one (`AGENTS.md`
§ "Git", which carries the per-step rationale); a spec states the gate's
properties instead.**

Membership is therefore normative *per check*: a guard belongs in the gate
because its own capability requirement says so, and this requirement says only
that the gate runs all of them, fails closed, and is ordered fast-first. That is
also what stops a check being quietly dropped — deleting one now contradicts the
requirement that introduced it, rather than a count in a neighbor's prose.

The probe-anchor check (`scripts/feedback-probe.mjs --verify`, **0.02–0.03 s**
user CPU measured over three runs — `npm run probe -- --verify` is ~0.2 s, which
is npm's own overhead, so the gate invokes node directly) verifies
that every case in the local-feedback corpus still **applies** — its anchor is
present and unique in the module it names. It runs no tests and asserts nothing
about the corpus's *result*.

That distinction is the whole of it, and it is load-bearing in both directions:

- The corpus is built from verbatim excerpts of engine source, so a refactor of
  a probed line silently stops the case matching. The harness then measures a
  smaller corpus and **reports success**, which reads exactly like health. The
  full run is ~20 minutes and deliberately outside the gate, so nothing else
  would notice.
- The probe's **rate** SHALL NOT be gated or ratcheted. A gated feedback number
  invites tests written against the number rather than against behavior, which
  the `repo-layout` requirement it serves explicitly forbids. A survivor is a
  finding to read; only a case that no longer applies is a failure.

The spelling guard (`scripts/checks/spelling.mjs`, ~1 s) scans every tracked
file outside the record and other people's words for a British stem, per the
`repo-layout` spelling requirement. It SHALL run in the fast prefix, ahead of
the documentation-only shortcut, because the shortcut skips `vitest run` and a
test may not read `docs/` or `openspec/` at all — so a vitest guard would be
blind to exactly the commits most likely to reintroduce a British spelling.

The gate's biome step SHALL check formatting and import order as well as lint
rules (the read-only form of `biome check`), so a file that is lint-clean but
unformatted cannot be committed. Gating only `biome lint` left the tree
lint-clean but never format-clean, so the first `biome check --write` run
reformatted ~150 unrelated files and buried the real diff; the fixer command
(`npm run check`) is not a substitute, because nothing requires it to be run.

The biome step SHALL be scoped by role, since a commit can only make a file
unformatted by touching it:

- The **automatic per-commit hook** SHALL check only the staged files
  (`biome check --staged`), so it inspects exactly the files the commit
  introduces and does no redundant work on an already-clean tree.
- **CI and the manual `npm run gate`** SHALL check the whole tree (`biome ci`)
  as the backstop. This is deliberate and SHALL NOT be scoped down: CI is the
  only gate a `--no-verify` commit passes through, and the whole-tree pass is
  also what forces a tree-wide reformat when biome itself is upgraded and
  restyles files no single commit touched.

**The heavy checks SHALL likewise be scoped by role, and only for a commit that
cannot affect them.** The automatic per-commit hook MAY skip `vitest run` and
`vite build` when **every** staged path is documentation that is neither a test
input nor a build input; one staged path outside that set SHALL run the whole
gate. CI and a manual `npm run gate` SHALL run everything, so the branch's
guarantee is unchanged — the same backstop argument as the biome scope, and
permitted for the same reason.

The set of skippable paths SHALL be asserted rather than assumed: a test SHALL
fail if any test, source or build-side module acquires a **read** of a path in
that set, so the exception stops being safe *and says so* rather than silently
skipping a check that has become real. That assertion SHALL key on the shape of
a read and not on the paths' names, since this repo's documentation is cited in
prose throughout its sources. `help/` SHALL NOT be skippable: it is a
`vite build` input and `help-coverage.test.ts`'s subject.

Selecting *individual tests* by what a commit changed is a different question
and is NOT authorized by this requirement. The cross-game guards here reach
their subjects through `import.meta.glob(..., "?raw")` rather than through
imports, so a graph-based selection may omit exactly the guards that exist to
catch a change to one game. Such a scheme SHALL first demonstrate that its
selection reaches those guards.

**An individual assertion MAY defer to the push-time backstop, under all four
of the conditions below.** This is the third scoping by role and the narrowest;
it exists because a guard's cost can land on every commit while its subject is
*decay* rather than the code being committed. All four SHALL hold:

1. **It checks decay, not the commit's own code.** The half of a guard that
   catches what the author just wrote SHALL stay on the per-commit path. Only a
   check of whether something has *stopped* being true may defer.
2. **A push-time backstop actually runs it.** CI SHALL run it on every push to
   `main`, which means it is selected by the role toggle the hook sets and by
   nothing else. Deferring into a tier that runs only on request is the slow
   tier's business and is governed by its own requirement.
3. **It is reported as skipped, never silently passed.** A deferred assertion
   SHALL be skipped at the runner level, so a run that did not check it says so.
   An assertion left to pass over a sample it could not take is the failure this
   repository punishes hardest.
4. **The backstop is asserted by a test.** A test SHALL fail if the role toggle
   is ever set in CI, or if the hook stops setting it — because the failure
   otherwise is silent in the worst direction: set it in both places and the
   deferred assertions run **nowhere**, while both runs report green.

Where an assertion's verdict depends on expensive work elsewhere in its file,
that work and the assertion SHALL defer **together**: running the assertion
against a walk narrowed beneath it makes it report a finding it has not
measured.

No correctness check may be removed or weakened to buy speed, and none may be
moved off the per-commit path except by a scoping-by-role that keeps the
push-time backstop intact — scoping the hook to staged files is not a
weakening, because the whole-tree backstop in CI and `npm run gate` still
guarantees nothing unformatted survives on `main`, and the same argument, under
the four conditions above, is what permits an individual assertion to defer.
`vite build` SHALL remain in the gate (it is the only
step that exercises the production build, where two prod-only regressions have
shipped undetected). Any vitest pool/isolation tuning adopted to reduce per-file
module-load overhead SHALL preserve the `repo-layout` requirement that "the test
suite is deterministic under parallel load" — verified by a green full run
repeated under the new configuration (including under file-order shuffle, which
stresses the shared-module-state that non-isolated pools expose) — or be
reverted.

The gate SHALL NOT make its concurrency conditional on machine load. It once
probed the 1-minute load average and serialized on a busy box, because
oversubscription starved timeout-bound tests past their per-test deadlines. That
rationale was retired with the per-test timeouts themselves (one 600s ceiling in
`vitest.config.ts`, no per-test timeouts), so contention now makes a test
*slower*, never *failed* — and the probe only cost time, reading "busy" on a
deliberately-loaded box and putting the build on the critical path against a
danger that no longer exists. Reliability remains the gate's first duty; it is
bought by not gating tests on the clock rather than by hoarding cores.

The gate's orchestration SHALL live in a single script (`scripts/gate.sh`)
invoked by both `.husky/pre-commit` and `npm run gate`, so the hook and the
manual command cannot drift; the per-commit-vs-backstop biome scope is selected
by an environment toggle the hook sets, not by a second copy of the gate. That
same toggle SHALL be the only signal an individual deferred assertion reads, so
there is one name for one idea rather than a second switch to keep in step.

#### Scenario: The independent heavy steps run concurrently

- **WHEN** the pre-commit gate runs after its fail-fast prefix passes
- **THEN** `vitest run` and `vite build` execute concurrently, regardless of
  machine load
- **AND** the commit is rejected if either the tests or the production build
  fails

#### Scenario: A staged unformatted file is rejected by the hook

- **WHEN** a commit stages a file that satisfies every lint rule but is not
  formatted (or has unsorted imports) to the repository's biome configuration
- **THEN** the per-commit hook's staged biome check fails in the fail-fast
  prefix and the commit is blocked, before the heavy checks are spent
- **AND** an unformatted file that is NOT staged does not block the commit
  (it is outside the commit's blast radius)

#### Scenario: The whole-tree backstop still catches a bypass

- **WHEN** an unformatted file reaches `main` via a `--no-verify` commit, or a
  biome upgrade restyles files no single commit touched
- **THEN** the whole-tree `biome ci` in CI (and in a manual `npm run gate`) fails
- **BECAUSE** the per-commit scope is a per-commit optimization, not a relaxation
  of the guarantee that `main` stays formatted

#### Scenario: A speed change never weakens the gate

- **WHEN** a pool/isolation setting is changed to speed up `vitest run`
- **THEN** the full suite is shown to remain green and deterministic under the
  new setting (repeated runs, including under file-order shuffle)
- **AND** if it does not, the setting is reverted rather than shipped

#### Scenario: A refactor moves a line the probe corpus anchors on

- **WHEN** a commit changes an engine line that a probe case quotes as its anchor
- **THEN** the gate fails in ~0.2 s naming the case, and the case is re-anchored
  (or retired) as part of that commit
- **BECAUSE** an anchor that no longer applies makes the harness measure a
  smaller corpus and report success — the failure mode this project keeps
  naming, where a silent cap reads as health. Re-anchoring is also the moment a
  human decides whether the case still states the defect it claims to.

#### Scenario: A documentation-only commit skips the heavy checks

- **WHEN** every path staged for a commit is documentation that no test and no
  build input reads
- **THEN** the per-commit hook runs the fast prefix and skips `vitest run` and
  `vite build`
- **AND** it says so, naming what it skipped and where the full gate still runs

#### Scenario: One source file cancels the exception

- **WHEN** a commit stages documentation together with any other path
- **THEN** the whole gate runs, because the exception is an all-or-nothing test
  on the staged set rather than a per-file filter

#### Scenario: A skippable path acquires a reader

- **WHEN** a test, source or build-side module begins reading a path the gate
  may skip
- **THEN** a test fails, naming the file and the path
- **BECAUSE** the exception's whole basis is that those paths reach nothing, and
  a check skipped for a path that has become real is a dropped check reporting
  success

#### Scenario: A documentation-only commit is still spell-checked

- **WHEN** a commit stages only `docs/`, `openspec/` or the root agent files,
  and one of them carries a British spelling outside an allowance
- **THEN** the spelling guard fails in the fast prefix and blocks the commit,
  before the documentation-only shortcut is reached

#### Scenario: A decay check defers to push while its partner stays per-commit

- **WHEN** a guard has one half that catches a defect the commit just introduced
  and another whose verdict needs expensive work and reports decay
- **THEN** the per-commit hook runs the first half and skips the second, and the
  second runs in CI on every push and in a manual `npm run gate`
- **AND** the skipped half is reported as skipped by the test runner

#### Scenario: A deferred assertion and the work it reads defer together

- **WHEN** an assertion's verdict is decided against a walk that the per-commit
  hook narrows
- **THEN** the assertion is skipped on that run rather than evaluated against
  the narrowed walk
- **BECAUSE** an assertion run against a sample that cannot contain its subject
  reports a finding it never measured

#### Scenario: The role toggle leaks into CI

- **WHEN** the CI workflow is edited to set the per-commit role toggle, or the
  hook stops setting it
- **THEN** a test fails naming it
- **BECAUSE** every deferral rests on CI being the backstop, and a toggle set in
  both places means the deferred assertions run nowhere while both runs report
  green
