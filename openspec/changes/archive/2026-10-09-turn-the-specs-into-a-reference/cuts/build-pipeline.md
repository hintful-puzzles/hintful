# Cuts: build-pipeline

Requirements: 100 before, 78 after.

| Cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The gate needs no generated asset, and CI provisions no native tool | duplicate | Merged into "The app builds from a clean checkout with no toolchain but Node", which now names the gate, `npm ci` and CI, and carries the workflow scenario. |
| "The gate SHALL invoke `scripts/feedback-probe.mjs --verify` with node directly and not through npm" (in "The gate verifies that every probe case still applies") | how | `scripts/gate.sh` is the invocation; the rule is what the step checks. |
| The probe's rate is never gated | duplicate | "The gate verifies that every probe case still applies" (it asserts nothing about the corpus's result), and `repo-layout` "The local-feedback probe plants a defect and runs only the module's own tests" (a diagnostic and not a ratchet). |
| The spelling guard runs ahead of the documentation-only shortcut | duplicate | `repo-layout` "The spelling guard runs in the gate's fast prefix, not as a test" says it whole; "The gate's checks are listed in one place" leaves a guard's membership to its own capability. |
| The top-level metrics directory holds only live instruments | duplicate | `repo-layout` "`metrics/` holds only live instruments"; where a finished snapshot goes stays here, in "A round's metrics snapshot is filed under the change that ordered it". |
| A snapshot's note points at something checkable | particular | A rule for one kind of note in an archived snapshot; nothing reads it and no one would revisit it. |
| An enforced metric's threshold is a ratchet | process | `docs/games/testing.md` § "Metrics and instruments", rule 1. The complexity ceiling's own rule stays. |
| The commit gate's cost is proportional to what it protects | process | `docs/games/testing.md` § "Right-sizing the gate"; its scenario is § "Break the code under a new test". |
| A test is made cheaper by one of three treatments, in order of preference | process | `docs/games/testing.md` § "Right-sizing the gate", the three treatments, the stale pin's fallback included. |
| A seed count is reduced only for a systematic property | process | `docs/games/testing.md` § "Right-sizing the gate", treatment 2, and § "Narrowing a game's own sweep". |
| The opt-in tier is run in every refactoring round | process | `docs/games/testing.md` § "Right-sizing the gate", treatment 3. |
| A gate saving is quoted in CPU time | process | `docs/games/testing.md` § "Where the cost actually is", "Measure CPU rather than wall". |
| A broad header rule carries the common value, and the exceptions detach | how | How the rule count is kept from growing; `templates/_headers.txt.hbs` says it at the site, and "The emitted header rules do not grow with the catalog" keeps the rule. |
| The header rule count is asserted by the build | duplicate | Merged into "The emitted header rules do not grow with the catalog", which now fails on no rule at all and carries the truncation scenario. |
| A retirement audit ranks and counts its population | process | `docs/method.md` § "Measure a proposal's number before designing against it" and § "Count what the check looked at"; `docs/games/testing.md` § "Right-sizing the gate" ("Answer per fixture"). |
| Suite cost is attributed per game, and quoted in CPU | process | `docs/games/testing.md` § "Where the cost actually is", "Attribute cost per game, not per directory". |
| A cost figure is CPU from a single-file run, with the machine's conditions recorded | process | `docs/games/testing.md` § "Where the cost actually is" ("Measure CPU rather than wall") and § "Timing anything under vitest: two things to know first". |
| A figure taken under paging is an upper bound | process | The same two sections of `docs/games/testing.md`. |
| The opt-in slow tier is invokable for one area at a time | process | `docs/games/testing.md` § "One board of each kind per commit", "Run the slow tier targeted, not whole"; `package.json` is the command. |
| A game whose hint searches is sliced by board size in the gate | process | `docs/games/testing.md` § "Where the cost actually is" and § "Slicing a preset sweep for the gate"; the rule it applies stays as "A cross-game guard bounds its cost on the axis the game varies". |
| "The floor on the resolved fraction SHALL count only specifiers the check was asked to resolve" (in "The unused-export check floors what it read") | how | How the floor is computed, in `scripts/checks/unused-exports.mjs`. |
| A type named by a reached signature is used, and only then | duplicate | "What counts as a use of an export is a rule, never a list" counts a name in the signature of an export that is itself reached; the fixpoint is how. |
| A helper that globs a broad tree is kept apart | process | `docs/games/testing.md` § "Where the cost actually is", "A helper's glob is paid for by every file that imports it". |
| A session runs a sweep wide before committing a change to what it guards | process | `docs/games/testing.md` § "One board of each kind per commit". |
| ", under its own requirements" (in "A deferred assertion runs on every push and is reported as skipped") | duplicate | A pointer to requirements now in the guide; "A test is not deferred when it is the only cover of a configuration" names the tier. |
