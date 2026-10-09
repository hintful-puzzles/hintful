# Ledger: build-pipeline

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Continuous integration runs the full gate on push to main

| Rule | Where it went |
| --- | --- |
| A workflow runs `npm run gate`, the hook's gate, on every push to `main` | spec: Continuous integration runs the full gate on push to main |
| The gate runs after the push because the project is trunk-based, and it is what catches a `--no-verify` commit or a clone without hooks | spec: Continuous integration runs the full gate on push to main |
| A `pull_request` trigger could be added if a PR flow is adopted | reason |
| The gate requires no generated assets, and the workflow provisions no wasm toolchain and caches no generated asset | spec: The gate needs no generated asset, and CI provisions no native tool |
| The workflow provisions no native tool at all, and the job is `npm ci` and the gate | spec: The gate needs no generated asset, and CI provisions no native tool |
| The original requirement said there was no asset-free tier, while the catalog and types were Emscripten artifacts | history |
| The workflow once installed halibut and ran `npm run build:assets` for the manual | history |
| Scenarios: a push is gated, the gate runs without generated assets, the workflow installs no system package | spec: Continuous integration runs the full gate on push to main; spec: The gate needs no generated asset, and CI provisions no native tool |

## The pre-commit gate minimizes wall-clock without dropping checks

| Rule | Where it went |
| --- | --- |
| The gate runs every check `scripts/gate.sh` defines and blocks on any failure, cheap checks first as a fail-fast prefix | spec: The pre-commit gate minimizes wall-clock without dropping checks |
| The single documentation-only exception | spec: The pre-commit gate minimizes wall-clock without dropping checks; spec: A documentation-only commit skips the heavy checks in the hook |
| `vitest run` and `vite build` run concurrently and either failing fails the gate | spec: The two heavy checks run concurrently, whatever the machine load |
| The requirement does not list the checks, and the list has one definition in `scripts/gate.sh` | spec: The gate's checks are listed in one place |
| Membership is normative per check, so deleting one contradicts the requirement that introduced it | spec: The gate's checks are listed in one place |
| The requirement once read "all six checks", the gate later ran eleven, and four prose copies had rotted | history |
| The probe-anchor check verifies every case still applies, runs no tests and asserts nothing about the result | spec: The gate verifies that every probe case still applies |
| The gate invokes node directly for the probe check | spec: The gate verifies that every probe case still applies |
| The probe check's measured CPU, npm's overhead, and the length of the full probe run | figure |
| A refactor of a probed line makes the harness measure a smaller corpus and report success | spec: The gate verifies that every probe case still applies |
| The probe's rate is not gated or ratcheted, and a survivor is a finding to read | spec: The probe's rate is never gated |
| The spelling guard runs in the fast prefix ahead of the documentation-only shortcut | spec: The spelling guard runs ahead of the documentation-only shortcut |
| The spelling guard's run time | figure |
| The biome step checks formatting and import order as well as lint, and the fixer command is not a substitute | spec: The gate's biome step checks formatting and import order |
| Gating only `biome lint` left the tree unformatted, and the first fixer run reformatted about 150 files | history |
| The hook checks staged files, and CI and the manual gate check the whole tree, which is not scoped down | spec: The biome step is scoped by role |
| The hook skips the heavy checks only when every staged path is documentation that is neither a test input nor a build input | spec: A documentation-only commit skips the heavy checks in the hook |
| CI and a manual gate run everything | spec: A documentation-only commit skips the heavy checks in the hook |
| `help/` is not skippable | spec: A documentation-only commit skips the heavy checks in the hook |
| A test fails if a test, source or build-side module acquires a read of a skippable path, keyed on the shape of a read | spec: The skippable paths are asserted to have no reader |
| Selecting individual tests is not authorized by this requirement, and a scheme first demonstrates that it reaches the glob-based guards | spec: Import-graph selection alone is unsound here, and is used only in a union; spec: A test selector is accepted only against two experiments |
| An assertion defers to push only when it checks decay, and the half that catches what the author wrote stays per-commit | spec: An assertion defers to push only when it checks decay |
| A push-time backstop runs a deferred assertion, selected by the role toggle and nothing else | spec: A deferred assertion runs on every push and is reported as skipped |
| A deferred assertion is skipped at the runner level, never silently passed | spec: A deferred assertion runs on every push and is reported as skipped |
| A test fails if the role toggle is set in CI or the hook stops setting it | spec: The role toggle is the hook's alone, and a test holds it there |
| An assertion and the expensive work its verdict depends on defer together | spec: An assertion defers to push only when it checks decay |
| No correctness check is removed or weakened to buy speed, or moved off the per-commit path except by a scoping by role | spec: No correctness check is removed or weakened to buy speed |
| `vite build` remains in the gate | spec: No correctness check is removed or weakened to buy speed |
| Two prod-only regressions shipped undetected | history |
| Pool or isolation tuning preserves determinism under parallel load, shown by repeated green runs including shuffle, or is reverted | spec: Pool tuning keeps the suite deterministic, or is reverted |
| The gate does not make its concurrency conditional on machine load | spec: The two heavy checks run concurrently, whatever the machine load |
| The gate once probed the load average and serialized on a busy box | history |
| Reliability is bought by not gating tests on the clock | guide: docs/games/testing.md § "Seed-deterministic, never clock-gated" |
| There is one 600 s ceiling in `vitest.config.ts`, so contention makes a test slower and never failed | untrue: `vitest.config.ts` sets `testTimeout: 3_600_000`, and the header of `scripts/gate.sh` records two tests failing the gate under contention at the earlier ceiling, so the sentence is dropped and the rule it argued for stands |
| The orchestration lives in `scripts/gate.sh`, invoked by the hook and by `npm run gate` | spec: The gate is one script, and the hook selects its role by environment |
| The biome scope is selected by an environment toggle the hook sets, not a second copy of the gate | spec: The gate is one script, and the hook selects its role by environment |
| The toggle that selects the biome scope is the same one a deferred assertion reads | untrue: the hook sets two, `GATE_BIOME_STAGED=1 GATE_PRECOMMIT=1 sh scripts/gate.sh` in `.husky/pre-commit`. `scripts/gate.sh` reads the first for the biome branch only, and `src/engine/testing/slow.ts` reads `GATE_PRECOMMIT`, so the requirement names both |
| Scenarios: concurrent heavy steps, a staged unformatted file, the whole-tree backstop, a speed change | spec: The two heavy checks run concurrently, whatever the machine load; spec: The gate's biome step checks formatting and import order; spec: The biome step is scoped by role; spec: Pool tuning keeps the suite deterministic, or is reverted |
| Scenarios: a moved probe anchor, a documentation-only commit, one source file, a skippable path with a reader, a spell-checked documentation commit | spec: The gate verifies that every probe case still applies; spec: A documentation-only commit skips the heavy checks in the hook; spec: The skippable paths are asserted to have no reader; spec: The spelling guard runs ahead of the documentation-only shortcut |
| Scenarios: a decay check defers, an assertion and its work defer together, the toggle leaks into CI | spec: An assertion defers to push only when it checks decay; spec: A deferred assertion runs on every push and is reported as skipped; spec: The role toggle is the hook's alone, and a test holds it there |
| The probe scenario's "fails in ~0.2 s" | figure |

## Refactoring metrics are measured on demand and ratcheted in the gate

| Rule | Where it went |
| --- | --- |
| An on-demand harness, `npm run metrics`, records duplication, cycles, dead code and cognitive complexity as committed raw output | spec: Refactoring metrics are measured on demand |
| The harness is not part of the gate or of CI's blocking checks | spec: Refactoring metrics are measured on demand |
| A round's dated snapshot is committed under the change that produced it, once final, and archived with it | spec: A round's metrics snapshot is filed under the change that ordered it |
| The harness writes to `metrics/<date>/` and the author files the snapshot, which keeps the `repo-layout` rule on tool output | spec: A round's metrics snapshot is filed under the change that ordered it |
| The same reasoning files an audit's findings and the unbuildable C sources under their changes | history |
| A top-level `metrics/` holds only live instruments | spec: The top-level metrics directory holds only live instruments |
| The live instruments are currently the mutation report and the color inventory | untrue: `metrics/` also holds `deal-walk.md`, `hint-deixis.md` and `tier-walk.md`, each written by an instrument under `scripts/` (`scripts/deal-walk.ts`, `scripts/checks/hint-deixis.test.ts`, `scripts/checks/tier-walk.test.ts`), so the requirement states the rule and carries no list |
| A snapshot carries a note that it cannot be regenerated, pointing at something checkable | spec: A snapshot's note points at something checkable |
| The first round's three READMEs cite paths under a tree deleted the next day | history |
| Cognitive complexity comes from Biome's rule, and no second lint toolchain is added | spec: Cognitive complexity comes from Biome |
| An enforced metric's threshold is a ratchet and never an aspiration | spec: An enforced metric's threshold is a ratchet |
| Scenarios: a round records its baseline, a finished snapshot is not left at the root, the harness is not in the gate | spec: A round's metrics snapshot is filed under the change that ordered it; spec: The top-level metrics directory holds only live instruments; spec: Refactoring metrics are measured on demand |

## A static-analysis finding is triaged against the type information behind it

| Rule | Where it went |
| --- | --- |
| Each finding of an impossible condition is triaged before code is removed, as one of three things | spec: A static-analysis finding is triaged against the type information behind it |
| The third kind, a correct guard the type system misrepresents, is the common case, by two mechanisms | spec: A guard the type system misrepresents is kept |
| All 53 findings of one round were of the third kind | figure |
| Generation is gated on the solver's contradiction verdict, and a mutable solver state is the house style | reason |
| An analysis whose soundness depends on a declined compiler flag is not adopted as a blocking gate | spec: An analysis that depends on a declined compiler flag is not a gate |
| Scenarios: a parser's bounds check, a solver's second check, a never-firing check that was meant to fire | spec: A guard the type system misrepresents is kept; spec: A static-analysis finding is triaged against the type information behind it |

## Compiler strictness is adopted on measured evidence, not from a checklist

| Rule | Where it went |
| --- | --- |
| Strictness flags are adopted on measured cost and benefit, and a declined flag's reasoning is recorded in `tsconfig.json` | spec: Compiler strictness is adopted on measured evidence, not from a checklist |
| `noUncheckedIndexedAccess` is not enabled tree-wide, because of typed arrays and loop-bound indices | spec: noUncheckedIndexedAccess stays off, and a boundary checks explicitly |
| Its measured error count | figure; held: tsconfig.json "noUncheckedIndexedAccess — 9,028 errors" |
| Where the guarantee is earned it is obtained with an explicit check at the boundary, and those checks are not removed | spec: noUncheckedIndexedAccess stays off, and a boundary checks explicitly |
| Scenarios: a flag proposed from a checklist, a declined flag proposed again | spec: Compiler strictness is adopted on measured evidence, not from a checklist |

## The commit gate's cost is proportional to what it protects

| Rule | Where it went |
| --- | --- |
| The gate is kept affordable, and a test whose cost is more of the same is reduced or moved to the opt-in tier | spec: The commit gate's cost is proportional to what it protects |
| Five files were 66% of test time and about ten tests 54% | figure |
| Three treatments in order of preference, and a recorded pin is never what correctness depends on | spec: A test is made cheaper by one of three treatments, in order of preference |
| A seed count is reduced only for a systematic property with the assertion still exercised many times, and the change states the count | spec: A seed count is reduced only for a systematic property |
| Deferral is reserved for cost that is board size, a test that is the only cover of a configuration is not deferred, and the remaining coverage is stated | spec: A test is not deferred when it is the only cover of a configuration |
| The opt-in tier is run in a refactoring round with the metrics | spec: The opt-in tier is run in every refactoring round |
| A gate saving is quoted in CPU time, not wall clock or summed durations | spec: A gate saving is quoted in CPU time |
| Per-test durations remain the tool for locating cost | spec: A cost figure is CPU from a single-file run, with the machine's conditions recorded |
| Duration sums reported 68 to 70% where CPU showed 53% | figure |
| Scenarios: a gate saving is reported, a test is made cheaper and shown to still discriminate, a differential fixture is deferred | spec: A gate saving is quoted in CPU time; spec: The commit gate's cost is proportional to what it protects; spec: A test is not deferred when it is the only cover of a configuration |

## The app builds from a clean checkout with no toolchain but Node

| Rule | Where it went |
| --- | --- |
| A clean checkout builds the whole app with `npm install` as the entire setup, with no native toolchain, system package or generated artifact | spec: The app builds from a clean checkout with no toolchain but Node |
| The build configuration depends on no generated, gitignored artifact at config-load time | spec: The app builds from a clean checkout with no toolchain but Node |
| Nothing is generated: the catalog, the icons and the help pages are committed, and there is no asset build | spec: Nothing is generated into the source tree |
| `npm run build:assets`, the manual's build script and `Brewfile` are removed, at the end of a sequence of retirements | history |
| Scenarios: a clean checkout builds, no artifact is generated into the source tree | spec: The app builds from a clean checkout with no toolchain but Node; spec: Nothing is generated into the source tree |

## The typechecker sees every TypeScript file in the repository

| Rule | Where it went |
| --- | --- |
| Every `.ts` and `.mts` file belongs to a project the gate checks | spec: The typechecker sees every TypeScript file in the repository |
| The build-side files are a separate project, separated by runtime only, with identical strictness | spec: The build-side files are a separate project, as strict as the app's |
| The gap hid a dead `output.validate` setting in the config that renders every help page | history |
| A live option the tool's type does not declare is kept and widened at the one property with its evidence, never deleted on the type alone or kept by asserting the whole object | spec: A live build option the tool's type does not declare is kept |
| Of two unknown properties found, one was dead and one a live workaround | history |
| Scenarios: a build-side type error, the app's type world, an undeclared option | spec: The typechecker sees every TypeScript file in the repository; spec: The build-side files are a separate project, as strict as the app's; spec: A live build option the tool's type does not declare is kept |

## Every asset the build emits is precached, or the build fails

| Rule | Where it went |
| --- | --- |
| The build verifies every emitted file is in the precache manifest and fails otherwise, against the built output and the generated service worker | spec: Every asset the build emits is precached, or the build fails |
| An asset outside the extension allowlist still builds and ships and is only missing offline | spec: Every asset the build emits is precached, or the build fails |
| The fonts and the favicon were the two gaps the check found | history; held: vite-plugins/precache-coverage.ts "self-hosted three" |
| Files a page never loads are excluded through Workbox's own `globIgnores`, not restated | spec: The precache check's exclusions are shared and held exactly |
| The exclusion ledger is exactly right, with conditional entries marked | spec: The precache check's exclusions are shared and held exactly |
| Scenario: the exclusions are one list | untrue: there are two declarations. `PRECACHE_IGNORES` in `vite.config.ts` is handed to both Workbox and the check, and `NOT_PRECACHEABLE` in `vite-plugins/precache-coverage.ts` is the check's own ledger of build machinery (the service worker, the manifest, `_headers`, source maps, the crawler files), which is the one held exactly. The requirement states each |
| The check reports extensions and fails on its own input count | spec: The precache check reports extensions and cannot pass over nothing |
| Scenarios: a new asset type, the check cannot pass over nothing | spec: Every asset the build emits is precached, or the build fails; spec: The precache check reports extensions and cannot pass over nothing |

## A host that cannot deliver the security headers is a recorded decision

| Rule | Where it went |
| --- | --- |
| A host that cannot deliver the emitted `_headers` is not adopted silently: the rules are translated or the loss is a stated decision | spec: A host that cannot deliver the security headers is a recorded decision |
| The cache-control rules are translated with the CSP | spec: The cache-control rules are translated with the CSP |
| Scenario: adopting a host without header support | spec: A host that cannot deliver the security headers is a recorded decision |

## The content security policy grants only origins the app loads

| Rule | Where it went |
| --- | --- |
| Every CSP origin is something the app loads, and a conditional origin is added conditionally | spec: The content security policy grants only origins the app loads |
| The inherited policy granted two Cloudflare analytics origins unconditionally | history; held: vite.config.ts "static.cloudflareinsights.com" |
| Scenario: an unused vendor origin is not whitelisted | spec: The content security policy grants only origins the app loads |

## The emitted header rules do not grow with the catalog

| Rule | Where it went |
| --- | --- |
| The number of `_headers` rules does not depend on the catalog, and the build fails over the host's limit | spec: The emitted header rules do not grow with the catalog |
| The limit is a parser limit and not a quota | spec: The emitted header rules do not grow with the catalog |
| The host reads at most 100 rules on every product and plan | figure; held: vite.config.ts "CLOUDFLARE_HEADER_RULE_LIMIT = 100" |
| The broad rule carries the common value and the exceptions detach | spec: A broad header rule carries the common value, and the exceptions detach |
| The count is asserted by the build with a vacuity guard | spec: The header rule count is asserted by the build |
| Scenarios: a truncating build fails, adding a puzzle adds no rule | spec: The header rule count is asserted by the build; spec: The emitted header rules do not grow with the catalog |

## A test is retired or deferred by measurement, never by category

| Rule | Where it went |
| --- | --- |
| A test is judged by what it would catch that no cheaper test would, never by era or category | spec: A test is retired or deferred by measurement, never by category |
| The population is ranked and counted before anything is retired or deferred | spec: A retirement audit ranks and counts its population |
| The differentials' measured share of suite time across the test files | figure |
| Scenario: a retirement is proposed for a category | spec: A retirement audit ranks and counts its population |
| Scenario: a configuration would lose its last cover | spec: A test is retired or deferred by measurement, never by category |

## Suite cost is attributed per game, and quoted in CPU

| Rule | Where it went |
| --- | --- |
| A cross-game guard's per-game case is attributed to the game it names, joined on the case title | spec: Suite cost is attributed per game, and quoted in CPU |
| Sixteen's share by directory and by attribution, and three games' share | figure; held: src/engine/testing/hint-games.ts "Sixteen 30%" |
| Every cost figure is CPU from `/usr/bin/time` on a single-file run on a quiet box, with the load average stated | spec: A cost figure is CPU from a single-file run, with the machine's conditions recorded |
| Summed per-test duration is permitted for locating cost and for nothing else | spec: A cost figure is CPU from a single-file run, with the machine's conditions recorded |
| A measurement records free memory and swap beside the load average | spec: A cost figure is CPU from a single-file run, with the machine's conditions recorded |
| A figure taken under paging is an upper bound, and a ratio survives where an absolute second does not | spec: A figure taken under paging is an upper bound |
| The two files measured again, the inflation factors, and the box's memory and swap | figure |
| Recording the conditions is what makes an error recoverable | reason |
| Ask which resource is scarce before choosing the instrument | reason; guide: docs/games/testing.md § "Where the cost actually is — measured 2026-09-09, so you need not re-derive it" |
| Scenario: a suite-cost finding is reported | spec: A cost figure is CPU from a single-file run, with the machine's conditions recorded |
| The first figure for this question was taken at load 533 | figure |

## The opt-in slow tier is invokable for one area at a time

| Rule | Where it went |
| --- | --- |
| `npm run test:slow` forwards its arguments, and the targeted form is documented where the tier is defined | spec: The opt-in slow tier is invokable for one area at a time |
| A change that defers work names the targeted invocation | spec: The opt-in slow tier is invokable for one area at a time |
| The size of the deferred tier and of the suite the bare command also runs | figure; held: src/engine/testing/slow.ts "six deferred" |
| Scenario: work is deferred into the slow tier | spec: The opt-in slow tier is invokable for one area at a time |

## A cross-game guard bounds its cost on the axis the game varies

| Rule | Where it went |
| --- | --- |
| A guard slices a game's presets on the axis the game varies, and derives a cost exemption from a property of the game | spec: A cross-game guard bounds its cost on the axis the game varies |
| Games whose hint searches are sliced by board size in the gate and walked in full in the slow tier, the population derived from source | spec: A game whose hint searches is sliced by board size in the gate |
| The hint-resume walk's excused population is `SEARCH_REACH_GAMES`, separate from the planner's | spec: The hint-resume walk excuses the games that can say a search ran out |
| That population is the games whose own code names `SEARCH_OUT_OF_REACH` | untrue: `SEARCH_REACH_GAMES` in `src/engine/testing/hint-games.ts` also takes a game that hands its search's outcome to `searchRefusal(`, which names the refusal for it, so the requirement states both |
| Keying the excuse on the planner left such games unexcused | history |
| The reason and the remaining cover are recorded per member, with the derivation asserted equal to the ledger | spec: An excused game's reason and remaining cover are recorded per member |
| Scenarios: a game joins the searching-hint population, a game searches without the slide planner | spec: A game whose hint searches is sliced by board size in the gate; spec: An excused game's reason and remaining cover are recorded per member; spec: The hint-resume walk excuses the games that can say a search ran out |

## Import-graph selection alone is unsound here, and is used only in a union

| Rule | Where it went |
| --- | --- |
| Selection by the static import graph alone is not adopted | spec: Import-graph selection alone is unsound here, and is used only in a union |
| The two experiments' results, and the count of test files that read through a raw glob | figure |
| A guard finds its population by reading what a game is, and a list only a check reads is not part of that | held: AGENTS.md "guard derives its population from what each game is" |
| A file read as text forms no import edge, which is why the guards are invisible to the graph | spec: Import-graph selection alone is unsound here, and is used only in a union |
| Every glob in the tree takes a literal pattern, so the graph is permitted as one term of a union | spec: Import-graph selection alone is unsound here, and is used only in a union; spec: No test reaches its subject through a channel the selector cannot model |
| A runtime-read scheme is acceptable, and any scheme is accepted only against the two experiments and treats an unclassifiable change as run everything | spec: A test selector is accepted only against two experiments |
| The requirement bounds test selection only and not the biome scope or the documentation shortcut | spec: The biome step is scoped by role; spec: A documentation-only commit skips the heavy checks in the hook |
| Scenarios: a selector is proposed, a commit touches only help pages | spec: A test selector is accepted only against two experiments; spec: Import-graph selection alone is unsound here, and is used only in a union |

## The pre-commit hook may run a selected subset of the suite

| Rule | Where it went |
| --- | --- |
| The hook runs only the files a commit can have broken, and CI and a manual gate run the whole suite | spec: The pre-commit hook may run a selected subset of the suite |
| The selection is the union of the import graph and the reach walk | spec: The pre-commit hook may run a selected subset of the suite |
| The walk follows imports and reads the globs of every module it visits | spec: The selector's walk reads the globs of every module it visits |
| The glob channel matches by literal base directory and does not evaluate the pattern, narrowed only by the literal ending | spec: A glob is matched by its literal base directory |
| The selector fails closed | spec: The selector fails closed |
| No test reaches its subject through an unmodeled channel, and a guard asserts it and was seen to fail | spec: No test reaches its subject through a channel the selector cannot model |
| The gate holds the walk to known couplings | spec: The gate holds the selector's walk to known couplings |
| Scenarios: a help page, an unmodeled file, an unmodeled read channel, a helper's glob | spec: The pre-commit hook may run a selected subset of the suite; spec: The selector fails closed; spec: No test reaches its subject through a channel the selector cannot model; spec: The selector's walk reads the globs of every module it visits |

## The gate rejects a test whose every assertion is conditional

| Rule | Where it went |
| --- | --- |
| The gate fails a test whose every assertion is conditional unless it asserts how many cases it examined, with a floor on what the check scanned | spec: The gate rejects a test whose every assertion is conditional |
| A condition is an `if` and equally an `if` that continues or returns | spec: The gate rejects a test whose every assertion is conditional |
| Thirteen games carried such a test, found by planting defects | history; held: scripts/checks/vacuous-assertions.mjs "thirteen games" |
| Which shapes are guarded is decided by measuring against the corpus, and only the third is built | spec: Which test shapes the gate guards is decided by measurement |
| What each candidate caught of the thirteen and what else it reported | figure |
| Reading only the first spelling of a condition misses one game's fifth scan | history |
| Scenarios: a scan that finds none, a test with its own vacuity guard, a test that cannot count, the guard proving itself | spec: The gate rejects a test whose every assertion is conditional |

## A complexity ceiling is set from the tree's own distribution

| Rule | Where it went |
| --- | --- |
| The ceiling is a number from the measured distribution, recorded with it, and never one no function can reach | spec: A complexity ceiling is set from the tree's own distribution |
| The ceiling before was 150 and no function reached it | history |
| The measured distribution, and the ceiling of 130 with six accepted sites | figure; held: biome.json "maxAllowedComplexity" |
| The ceiling is chosen for the size of its exception list, and one that names every inherent shape is suppressed and ignored | spec: A complexity ceiling is set from the tree's own distribution |
| Scenarios: a new function over the ceiling, an existing site accepted with its reason | spec: A complexity ceiling is set from the tree's own distribution |

## Nothing exports a symbol no other file imports

| Rule | Where it went |
| --- | --- |
| A check reports every unimported export under three roots, in the fast prefix, with a ledger asserted equal to its findings | spec: Nothing exports a symbol no other file imports |
| Vacuity floors on files, exports and the resolved fraction, the last counting only what the check was asked to resolve | spec: The unused-export check floors what it read |
| What counts as a use is a rule each time, never a list, and a relay is not a use | spec: What counts as a use of an export is a rule, never a list |
| A signature-named type is resolved to a fixpoint after the dead set is known, only from a reached owner | spec: A type named by a reached signature is used, and only then |
| The signature rule was 163 of 376 findings | figure; held: scripts/checks/unused-exports.mjs "163 of" |
| A tidy pass found the dead exports by hand | history |
| The check is written here and knip is removed, since its resolver does not follow `.ts` specifiers | spec: The unused-export check is the repository's own, not knip |
| The knip version, its config and what it answered | figure; held: scripts/checks/unused-exports.mjs "Measured 2026-09-12 at the pinned 6.31.0" |
| Scenarios: a last importer deleted, a relay, the resolver, a signature-named type | spec: Nothing exports a symbol no other file imports; spec: What counts as a use of an export is a rule, never a list; spec: The unused-export check floors what it read; spec: A type named by a reached signature is used, and only then |

## The gate holds absence to one spelling

| Rule | Where it went |
| --- | --- |
| The guard runs in the fast prefix and fails on `undefined` in a union outside a cast, and on a strict comparison that is always false | spec: The gate holds absence to one spelling |
| Its exceptions are derived from syntax, and it proves both halves and floors what it examined on every run | spec: The absence guard derives its exceptions and proves itself |
| Scenarios: a respelled helper, a cast, the guard stops seeing the tree | spec: The gate holds absence to one spelling; spec: The absence guard derives its exceptions and proves itself |

## A stated reporting rule matches what the build does

| Rule | Where it went |
| --- | --- |
| Where the project states that errors reach a reporting service, a deployed build can send them or the statement is amended | spec: A stated reporting rule matches what the build does |
| The agent brief carried the rule while no DSN was set, and the first outside failure arrived by a player retyping it | history |
| Scenario: a reporting rule with no build behind it | spec: A stated reporting rule matches what the build does |

## Turning on error reporting settles its side effects deliberately

| Rule | Where it went |
| --- | --- |
| Setting the DSN widens `connect-src` and turns on nothing else the browser sends by itself | spec: Turning on error reporting settles its side effects deliberately |
| A public DSN's allowed domains and rate limits are both configured | spec: A public DSN is restricted at the reporting service |
| Reporting is verified on the deployed origin by a triggered and consented report | spec: Error reporting is verified on the deployed origin |
| Scenario: reporting is switched on for a deployment | spec: Turning on error reporting settles its side effects deliberately; spec: A public DSN is restricted at the reporting service; spec: Error reporting is verified on the deployed origin |

## What a crash report carries matches what the privacy notes promise

| Rule | Where it went |
| --- | --- |
| The privacy notes describe what a report contains, and a real payload is read against them before reporting is enabled | spec: What a crash report carries matches what the privacy notes promise |
| Scenario: a report would carry more than the notes describe | spec: What a crash report carries matches what the privacy notes promise |

## The gate runs the source-scan tests as a pass ahead of the rest of the suite

| Rule | Where it went |
| --- | --- |
| The source scans run as a pass of their own after the node guards, and a failure starts neither the suite nor the build | spec: The gate runs the source-scan tests as a pass ahead of the rest of the suite |
| One commit failed twice about eight minutes in, and a planted failure was later reported in twenty seconds | figure |
| Membership is derived from what the file is, and what cannot be resolved counts against it | spec: Source-scan membership is derived from what the file is |
| The two passes partition the suite, confirmed by vitest before the scan pass, and the split changes only when a failure is reported | spec: The scan pass and the main pass partition the suite |
| Both partition plants were shown to fail | history |
| Scenarios: a broken scan, a file in neither pass, a scan that imports a game | spec: The gate runs the source-scan tests as a pass ahead of the rest of the suite; spec: The scan pass and the main pass partition the suite; spec: Source-scan membership is derived from what the file is |

## The app is published once the fast checks and the build pass, and the publish is verified on the deployed origin

| Rule | Where it went |
| --- | --- |
| The deploy waits on the gate's checks through the build, run by `scripts/gate.sh` with `GATE_BUILD_ONLY=1`, and that build is the artifact published | spec: The app is published once the fast checks and the build pass |
| The suite runs beside the deploy as the full gate, failing the run without holding back the deploy | spec: The test suite runs beside the deploy and does not hold it back |
| A clean URL and the security headers are verified against the deployed origin | spec: The publish is verified on the deployed origin |
| The service worker registers on that origin and the app opens offline | spec: The service worker and the crawler files are verified on the deployed origin |
| `sitemap.xml` is present, being emitted only with the canonical URL | spec: The service worker and the crawler files are verified on the deployed origin |
| `robots.txt` is emitted only when `VITE_CANONICAL_BASE_URL` is set | untrue: `public/robots.txt` is copied into every build, and the sitemap plugin overwrites it only when the variable is set (the comment on `robots.txt` in `vite-plugins/precache-coverage.ts`), so the requirement asks for the sitemap and the `robots.txt` written beside it |
| Scenarios: a commit failing the fast checks, the suite beside the deploy, a clean URL | spec: The app is published once the fast checks and the build pass; spec: The test suite runs beside the deploy and does not hold it back; spec: The publish is verified on the deployed origin |

## The pre-commit hook narrows the cross-game sweeps to the games a commit can reach

| Rule | Where it went |
| --- | --- |
| The hook skips the cross-game cases of games that cannot reach a staged path and nothing else, and CI and a manual gate never narrow | spec: The pre-commit hook narrows the cross-game sweeps to the games a commit can reach |
| The measured share of a Pearl-only commit's test time | figure; held: src/engine/testing/game-scope.ts "518 s of 593 s" |
| The scope is the games that reach a staged path, and a file that reaches one outside a game runs whole in a run of its own | spec: The scope is the games that reach a staged path |
| A skipped case is one the commit could not have turned red, by both halves, and a case is recognized by its title only | spec: A skipped case is one the commit could not have turned red |
| When no game reaches a staged path the hook does not narrow | spec: The pre-commit hook narrows the cross-game sweeps to the games a commit can reach |
| The scope travels as `GATE_GAME_SCOPE` beside `GATE_PRECOMMIT=1`, and the filter and the helpers derive from it | spec: The game scope travels as one value beside the role toggle |
| Skipped cases are reported as skipped | spec: The pre-commit hook narrows the cross-game sweeps to the games a commit can reach |
| An assertion across a sweep is narrowed with it: a ledger is filtered, and a whole-population floor is skipped or computed without the narrowed work | spec: An assertion that reads across a sweep is narrowed with the sweep |
| A helper that globs a broad tree is kept apart from helpers that do not | spec: A helper that globs a broad tree is kept apart |
| Scenarios: one game, an engine module some games use, a module every guard reads, a ledger on a narrowed run, a population no case can see | spec: The pre-commit hook narrows the cross-game sweeps to the games a commit can reach; spec: The scope is the games that reach a staged path; spec: An assertion that reads across a sweep is narrowed with the sweep |

## The per-commit hook walks one board of each kind, and the push walks the rest

| Rule | Where it went |
| --- | --- |
| A sweep does less in the hook only where what it leaves out is more of the same | spec: The per-commit hook walks one board of each kind, and the push walks the rest |
| The amount is chosen through `perCommit(hook, wide)`, which reads the role toggle only | spec: A sweep's per-commit amount is chosen through perCommit |
| It is a fourth scoping by role on the same backstop, which a test holds | spec: The role toggle is the hook's alone, and a test holds it there |
| Every assertion still runs in the hook, over fewer boards | spec: The hook keeps a board of every kind and every check one board can fail |
| The hook keeps a board of every params set, every value of every mode, tier and choice, and every check one board can fail | spec: The hook keeps a board of every kind and every check one board can fail |
| The lever never leaves out the only board of a kind, and the call site says what the hook still walks | spec: The hook keeps a board of every kind and every check one board can fail |
| An assertion held against what a sweep found is true of the hook's boards and the push's | spec: A sweep's ledger is true of the hook's boards and of the push's |
| A session that changes what a sweep guards runs it wide before committing | spec: A session runs a sweep wide before committing a change to what it guards |
| The measured CPU and wall time before and after | figure; guide: docs/games/testing.md § "One board of each kind per commit" |
| Scenarios: several boards of one params set, a mode only on the largest preset, a hint planner changed, a ledger held against both walks | spec: The per-commit hook walks one board of each kind, and the push walks the rest; spec: The hook keeps a board of every kind and every check one board can fail; spec: A session runs a sweep wide before committing a change to what it guards; spec: A sweep's ledger is true of the hook's boards and of the push's |
