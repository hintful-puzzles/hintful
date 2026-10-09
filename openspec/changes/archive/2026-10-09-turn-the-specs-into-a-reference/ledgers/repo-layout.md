# Ledger: repo-layout

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Repo root holds product-level config only

| Rule | Where it went |
| --- | --- |
| The root holds only what conventionally belongs at the top level of a Node/TypeScript project, and the entry-point directories | spec: Repo root holds product-level config only |
| The file lists in parentheses are the whole of what the root holds | untrue: the root also tracks `tsconfig.node.json`, `unsupported.html` (a page `vite.config.ts` copies), `.github/` and `.claude/`, so the requirement names the categories, keeps the dotfile declarations the old list named and adds those entries |
| Scenario: a new tooling artifact goes in a role directory | spec: Repo root holds product-level config only |
| No `Brewfile`, and `npm install` is the entire setup | spec: The repository declares no native tool |
| The Brewfile was reduced to one halibut entry and went with the manual | history |
| A manifest listing no dependency is an instruction to install nothing | spec: The repository declares no native tool |
| `metrics/` holds only live instruments, and a finished round's dated snapshot is not one | spec: `metrics/` holds only live instruments |
| The live instruments are currently `mutation/report.json` and `color-inventory.md` | untrue: `metrics/` also holds `tier-walk.md`, `deal-walk.md` and `hint-deixis.md`, each written by a check in the tree, so the requirement states the rule and no list |
| `metrics/` was missing from the list while it held three snapshots | history |
| The build output is `dist/`, gitignored, and `build/` is not an entry-point directory | spec: The build output directory is `dist/` |
| `build/` was the partition for the Emscripten and native-harness outputs | history |

## Source tree under `src/` groups files by UI role

| Rule | Where it went |
| --- | --- |
| `src/` groups files by role into `screens/`, `dialogs/` and `components/` | spec: Source tree under `src/` groups files by UI role |
| The files each of those directories currently holds | figure |
| Page entries, the bootstrap, preflight, the service worker, cross-cutting modules and ambient types stay at `src/` root | spec: Entry points and cross-cutting modules stay at the `src/` root |
| `assets/`, `css/`, `store/` and `utils/` keep their shape | spec: The non-UI subdirectories of `src/` keep their scope |
| `src/puzzle/` holds the runtime at its root and the Lit components under `components/` | spec: `src/puzzle/` separates the runtime from its components |
| The list of the puzzle components by name | figure |
| A component file does not repeat its directory, and the custom element names do not change | spec: A puzzle component's file does not repeat its directory, and its element name does not change |
| The puzzle logic lives in `src/engine/` and `src/games/<puzzleId>/` | spec: The puzzle logic lives in `src/engine/` and `src/games/<puzzleId>/` |
| Shared leaf libraries live under the engine and keep their frozen corpus | spec: A shared library lives under `src/engine/` |
| A family of modules meaningless apart is a subdirectory, and unrelated helpers stay flat | spec: Engine modules that are meaningless apart are grouped, and the rest stay flat |
| The families are `grid/` and `color/`, and everything else is flat | untrue: `src/engine/` also has `testing/`, `random/` and `combi/`, so the requirement names the families beside the leaf libraries and the test utilities |
| The color layers are the three a named change designed, over twelve colors | history; figure |
| No subdirectory for a grouping that has to be argued for | spec: No engine subdirectory is created for a grouping that has to be argued for |
| A taxonomy nobody can predict is re-litigated at every addition | reason |
| `src/native/` does not exist | spec: `src/native/` does not exist |
| What `src/native/` was named for, and the other use of the word | history |
| No top-level category for a ported shared module, and no `bridge.ts` | spec: A shared library lives under `src/engine/` |
| The category and its `bridge.ts` slot existed for the seam-by-seam migration | history |
| Configuration for a removed toolchain is removed with it | spec: A shared library lives under `src/engine/` |
| Correctness is established by behavioral and property tests, per a named doctrine | spec: A module is not required to carry a C-captured fixture corpus |
| No module is required to carry a C-captured `__fixtures__/` corpus, and kept fixtures are not a layout element or a gate | spec: A module is not required to carry a C-captured fixture corpus |
| Scenario: a new Lit component lands in the right bucket | spec: Source tree under `src/` groups files by UI role; spec: `src/puzzle/` separates the runtime from its components |
| Scenario: a puzzle component moves without changing the markup | spec: A puzzle component's file does not repeat its directory, and its element name does not change |
| Scenario: page-entry script URLs still resolve | spec: Entry points and cross-cutting modules stay at the `src/` root |
| Scenario: renames preserve git history, by `git mv`, for files relocated from `src/` root into a subdirectory | spec: A relocation within `src/` preserves git history |
| Scenario: the engine and a game land in the right place | spec: The puzzle logic lives in `src/engine/` and `src/games/<puzzleId>/` |
| Scenario: a new engine helper is not given a speculative subdirectory | spec: No engine subdirectory is created for a grouping that has to be argued for |
| Scenario: a shared library is not given its own top-level directory | spec: A shared library lives under `src/engine/` |
| Scenario: `src/native/` is not in the tree | spec: `src/native/` does not exist |
| `src/css/native.css` is the only path anywhere that uses the word | untrue: `git ls-files` also lists archived changes under `openspec/changes/archive/` whose paths carry it, so the scenario says the only such path under `src/` |

## Behavior is testable in-process across three tiers

| Rule | Where it went |
| --- | --- |
| Behavior is testable in-process under vitest across three tiers, with browser automation for smoke checks only | spec: Behavior is testable in-process across three tiers |
| No C or WASM is involved | history |
| Pure logic and rendering ops run in `node`, and a component file opts into `happy-dom` | spec: Each tier runs in the cheapest environment that fits |
| Persistence under `fake-indexeddb` is opted into per file | untrue: `vitest.config.ts` installs it for every file through the setup file `src/test-setup/indexeddb.ts`, and only `happy-dom` is opted into per file |
| `happy-dom` and `fake-indexeddb` are devDependencies only | spec: Each tier runs in the cheapest environment that fits |
| New UI or persistence behavior ships a tier-2 or tier-3 test | spec: New UI or persistence behavior ships an in-process test |
| Scenario: a persistence round-trip without a browser | spec: Each tier runs in the cheapest environment that fits |
| Scenario: a component command path without a browser | spec: New UI or persistence behavior ships an in-process test |
| Scenario: the fast logic suites keep the node environment | spec: Each tier runs in the cheapest environment that fits |

## Rendering is verifiable in-process, agent-checkable

| Rule | Where it went |
| --- | --- |
| A game's redraw is captured as a deterministic draw record through the real midend, with no browser and no human | spec: Rendering is verifiable in-process, agent-checkable |
| The harness is dev and test only | spec: Rendering is verifiable in-process, agent-checkable |
| It complements the ad-hoc recording doubles by sharing one recorder | history |
| A recording drawing captures every call, and a scenario driver replays moves as `Move`s to the target frame | spec: The render harness is one recorder and one scenario driver |
| The driver is given params and a description | untrue: `renderScenario` takes one game id, which is the params and the desc or seed together (`src/engine/testing/render-scenario.ts`) |
| Output is deterministic: fixed tile size, rounded coordinates, stable ordering, no clock or random | spec: A draw record is deterministic |
| Verification is a snapshot plus targeted assertions, and new rendering behavior should ship such a test | spec: A render test pairs a snapshot with targeted assertions |
| Scenario: a hint frame is asserted without a browser or a human | spec: Rendering is verifiable in-process, agent-checkable |
| The colors a hint frame's ops are expected in, by name | figure |
| Scenario: a render regression is a reviewable snapshot diff | spec: A render test pairs a snapshot with targeted assertions |

## Developer guides live under docs/ and link to specs

| Rule | Where it went |
| --- | --- |
| A guide describes procedure, links the spec requirement and names exemplar files | spec: Developer guides live under docs/ and link to specs |
| The specs that are the source of truth, by name | figure |
| The guides are the `docs/games/` set by concern | spec: The game guides are organized by concern |
| The only repo-wide guide is `docs/test-strength.md` | untrue: `docs/` also holds `doctrine.md`, `method.md`, `work-management.md` and `help-pages.md`, so the requirement says a repo-wide guide sits directly under `docs/` |
| A section is cited by named heading, cited headings stay grep-stable, and positional numbers are not citation targets | spec: A guide section is cited by its heading |
| `docs/` holds this project's own guides, under the obligation to keep them current | spec: `docs/` holds only this project's own guides |
| The sentence quoted from `AGENTS.md` | untrue: `AGENTS.md` now says "The guides under `docs/` are a live wiki" and "Update the guide in the change that taught you something", so the requirement states the obligation and quotes nothing |
| A third-party explanation is a link, and a load-bearing one is carried by the module | spec: A third-party explanation is a link, not a copy |
| `docs/tilings/` was a copy of upstream's diagrams and was deleted | history |
| `docs/` holds nothing the app serves | spec: `docs/` holds only this project's own guides |
| Scenario: a guide states a normative rule | spec: Developer guides live under docs/ and link to specs |
| Scenario: a guide shows a code pattern | spec: Developer guides live under docs/ and link to specs |
| Scenario: a third-party explanation is needed by a module | spec: A third-party explanation is a link, not a copy |
| Scenario: deleting a copy does not delete the explanation | spec: A third-party explanation is a link, not a copy |
| Scenario: a guide section is cited from code | spec: A guide section is cited by its heading |

## A scaffolding script stamps out a new game-port skeleton

| Rule | Where it went |
| --- | --- |
| `scripts/new-game-port.sh` creates the stub modules, the fixtures placeholder and the starter tests, and refuses to overwrite | spec: A scaffolding script stamps out a new game-port skeleton |
| It prints and does not perform the manual-edit checklist, and the games README references it | spec: The scaffold prints the edits that need judgment and performs none |
| It emits no C-differential stub and no trace-harness instruction | spec: The scaffold promises no C oracle |
| The C build was deleted by a named change | history |
| Scenario: scaffolding a new game | spec: A scaffolding script stamps out a new game-port skeleton; spec: The scaffold prints the edits that need judgment and performs none |
| Scenario: the scaffold does not promise an oracle | spec: The scaffold promises no C oracle |

## A shared helper carries the byte-for-byte differential shape

| Rule | Where it went |
| --- | --- |
| `describeDescDifferential` asserts each fixture's desc, and a game with that shape uses it | spec: A shared helper carries the byte-for-byte differential shape |
| The solver-agreement shape is not modeled by the helper | spec: A shared helper carries the byte-for-byte differential shape |
| The byte-for-byte bar is valid only for a faithful generator over the bit-identical RNG | reason |
| The frozen-fixture fact is stated once in the helper, and no test file carries a regeneration recipe | spec: The frozen fixtures' provenance is stated once, and no recipe is carried |
| The sources and the build went with a named change | history |
| Scenario: a game's byte-match differential uses the helper | spec: A shared helper carries the byte-for-byte differential shape |
| Scenario: a fixture's provenance is recorded but its recipe is not | spec: The frozen fixtures' provenance is stated once, and no recipe is carried |

## The test suite is deterministic under parallel load

| Rule | Where it went |
| --- | --- |
| The full run is deterministic, generator tests are seed-deterministic, and a retry loop has a finite cap | spec: The test suite is deterministic under parallel load |
| No assertion on elapsed time, and a deterministic proxy instead | spec: Efficiency is asserted by a proxy, never by elapsed time |
| A timeout is a backstop, one ceiling in `vitest.config.ts`, and no per-test timeout | spec: There is one test timeout, and it is a backstop |
| About 39 per-test guesses each became a flake | figure; history |
| Raising or removing a clock gate is the fix for contention on terminating work, and re-guessing a constant is not | spec: A load-only failure is root-caused |
| A 30 second ceiling became 60 and 120 and still failed at a stated load | figure; history |
| A timeout is not relied on to catch a runaway, which is bounded by the retry limit and the step budget | spec: Non-termination is bounded in code, not by a timeout |
| A load-only failure is root-caused to one of four causes | spec: A load-only failure is root-caused |
| Scenario: a generator test gives the same verdict every run | spec: The test suite is deterministic under parallel load |
| Scenario: efficiency is asserted by a proxy | spec: Efficiency is asserted by a proxy, never by elapsed time |
| Scenario: a correct-but-slow test survives a saturated box | spec: There is one test timeout, and it is a backstop |
| Scenario: a load-only failure is investigated | spec: A load-only failure is root-caused |

## Test worker processes do not outlive their runner

| Rule | Where it went |
| --- | --- |
| A run leaves no workers, and its entry points reap orphans before starting | spec: Test worker processes do not outlive their runner |
| How a killed run orphans a synchronous worker | reason |
| The reaper kills only this repo's orphans by exact PID and is fail-safe | spec: The reaper kills only this repo's orphans, and never fails a run |
| Every generate-until-success loop is bounded by the shared retry-limit helper, a probabilistic argument counts as unbounded, and fixpoints are exempt | spec: Every generate-until-success loop is bounded by the shared retry limit |
| Exhaustion throws or hands over to a bounded recovery, with recovery preferred where a path exists | spec: An exhausted retry limit throws, or hands over to a bounded recovery |
| Scenario: orphaned workers are reaped before a run | spec: Test worker processes do not outlive their runner |
| Scenario: a live run's workers are never reaped | spec: The reaper kills only this repo's orphans, and never fails a run |
| Scenario: a runaway generator fails fast | spec: Every generate-until-success loop is bounded by the shared retry limit |
| Net with a wrapping dimension of 2 as the params that admit no puzzle | reason |
| Scenario: a stalled loop recovers rather than failing the puzzle | spec: An exhausted retry limit throws, or hands over to a bounded recovery |

## Every help page the app serves lives under `help/`

| Rule | Where it went |
| --- | --- |
| Every served help page lives under `help/`, in one directory and one format, with no `upstream/` subdirectory | spec: Every help page the app serves lives under `help/` |
| The earlier split kept upstream-authored pages read-only | history |
| Adopted words keep their words, and who may fix them is a licensing question the notices discharge | spec: Adopting or relocating a help page changes no words, attribution or URL |
| No served page documents a platform this app is not | spec: No served page documents a platform this app is not |
| The halibut manual, what it told players, its size and how many games it covered | history; figure |
| Every cataloged puzzle has a page and every page a cataloged game, asserted both ways | spec: Every cataloged puzzle has a help page, and every page a cataloged game |
| The gap that hid without the invariant, and the tests whose style it follows | history |
| Relocating or adopting a page changes no content, attribution or URL | spec: Adopting or relocating a help page changes no words, attribution or URL |
| A help source directory does not shadow a served URL directory | spec: A help source directory does not shadow a served URL directory |
| A page introduces the puzzle and carries no development status | spec: A game's help page introduces the puzzle, not its implementation |
| Scenario: every cataloged puzzle has a help page | spec: Every cataloged puzzle has a help page, and every page a cataloged game |
| Scenario: a help page is served from one place in one format | spec: Every help page the app serves lives under `help/` |
| Scenario: adoption changes no URL and no words | spec: Adopting or relocating a help page changes no words, attribution or URL |
| Scenario: a served page does not describe a different platform | spec: No served page documents a platform this app is not |
| Scenario: a help source directory does not shadow a served URL directory | spec: A help source directory does not shadow a served URL directory |

## The module layering is enforced, not merely observed

| Rule | Where it went |
| --- | --- |
| The layering is enforced by a check that fails CI, no game imports another, and preflight keeps its Baseline gate | spec: The module layering is enforced, not merely observed |
| The count of games | figure |
| `engine/` does not import `games/`, with exceptions listed by name and reason and no wildcard | spec: `engine/` imports `games/` only from named test-only files |
| There is one exception, `engine/testing/hint-games.ts` | untrue: `src/module-layering.test.ts` names three, `enrollment.ts`, `hint-games.ts` and `params-corpus.ts` |
| Each hinting port adds itself to `hint-games.ts` | untrue: `HINT_GAMES` is filtered from the registry by whether a game declares `hint` (`src/engine/testing/hint-games.ts`), so the scenario is now a file the check does not name |
| The engine and the games import nothing else under `src/`, stated as an invariant and not a blocklist | spec: The engine and the games import nothing else under `src/` |
| The invariant is affordable because the violation count is zero | reason |
| The blocklist form was green while 182 files crossed the boundary | history; figure |
| Each rule is verified to fail when violated | spec: Each layering rule is seen to fail |
| The check asserts that every relative specifier resolves and that the number resolved is far above zero | spec: The layering check guards its own reach |
| A bulk rewrite blinded the resolver and six of seven tests still passed | history; figure |
| The two earlier instances of the shape, by test file | history |
| An instrument that counts violations also counts what it looked at, as a floor and not a ratchet | spec: A check that counts violations also counts what it looked at |
| The check should be an in-repo test and not a new dependency | spec: The module layering is enforced, not merely observed |
| Scenario: a game reaches into another game | spec: The module layering is enforced, not merely observed |
| Scenario: a new hinting port enrolls itself | spec: `engine/` imports `games/` only from named test-only files |
| Scenario: an engine module reaches into a directory the rule never named | spec: The engine and the games import nothing else under `src/` |
| Scenario: the checker is broken rather than the code | spec: The layering check guards its own reach |
| Scenario: a cross-cutting invariant test states its own coverage | spec: A check that counts violations also counts what it looked at |

## The import-cycle metric counts runtime cycles

| Rule | Where it went |
| --- | --- |
| The measurement reports runtime cycles and not type-only ones, is ratcheted at zero, and is verified to detect a real cycle | spec: The import-cycle metric counts runtime cycles |
| Moving a shared type into a type-only import is the standard resolution for a cycle | reason |
| The raw and runtime counts on a stated date | figure |
| Both scenarios | spec: The import-cycle metric counts runtime cycles |

## The test suite's strength is audited, not assumed

| Rule | Where it went |
| --- | --- |
| The suite's strength is measured by mutation-testing the shared engine, with a triaged survivor list, and where survivors cluster is reported | spec: The test suite's strength is audited, not assumed |
| Line coverage cannot answer whether a wrong answer would be noticed | reason |
| The audit is not a gate and its score is not ratcheted | spec: The mutation audit is not a gate, and its score is not ratcheted |
| The harness is sanity-checked by a deliberate bug before its results are trusted | spec: A measuring harness is checked before its results are trusted |
| The two earlier instruments that passed while measuring nothing | history; figure |
| Scenario: a refactor is justified by an unmoved fixture | spec: The test suite's strength is audited, not assumed |
| Scenario: a snapshot's paired assertions are not load-bearing | spec: The test suite's strength is audited, not assumed |
| Scenario: a shared module's semantics are pinned only by a distant consumer | spec: The test suite's strength is audited, not assumed |
| Scenario: a count's unit is checked against the unit the rule is about | spec: A measuring harness is checked before its results are trusted |
| The six phantom violations the snapshot-pairing check reported | figure |

## A shared module's tests give feedback where the code lives

| Rule | Where it went |
| --- | --- |
| An engine module can fail its own tests and does not rely solely on a consumer or a differential | spec: A shared module's tests give feedback where the code lives |
| The measurable form is to plant a defect and run only the module's own tests, which `npm run probe` does over a committed corpus | spec: The local-feedback probe plants a defect and runs only the module's own tests |
| The probe is a diagnostic and not a ratchet, no test is written to move its number, and a behavior-preserving case is recorded and excluded | spec: The local-feedback probe plants a defect and runs only the module's own tests |
| A module's own tests are every engine test file importing it or a barrel re-exporting it, derived and not assumed | spec: A module's own tests are derived from what imports it |
| The three wrong answers to that question | history; figure |
| A differential is not a local test | spec: A module's own tests are derived from what imports it |
| The derivation walks the engine recursively and fails below a committed floor of test files | spec: The probe walks the engine recursively and fails below a floor of test files |
| The walk was one level deep while the engine was flat | history |
| A guarantee left to a differential is stated in the test file and verified | spec: A guarantee left to a differential is stated and verified |
| Scenario: logic is extracted into the engine, with its tests in the same change | spec: A shared module's tests give feedback where the code lives |
| Scenario: a module is fully protected but locally silent | spec: A shared module's tests give feedback where the code lives |
| Scenario: the instrument stops finding tests | spec: The probe walks the engine recursively and fails below a floor of test files |
| Scenario: a feedback metric is derived from a tool's internals | spec: A feedback claim read off a tool's field checks what the field means |
| The ranking the misread field produced, by module | history |
| Scenario: an assertion's two sides derive from the same value | spec: An assertion's two sides do not derive from the same value |
| The grid test that could not fail, and its counts | history; figure |

## A change that moves or deletes a path updates the unarchived changes that name it

| Rule | Where it went |
| --- | --- |
| A change that moves a path sweeps the pending changes, and archived changes are left as written | spec: A change that moves or deletes a path updates the unarchived changes that name it |
| A stale path in a spec is a wrong pointer a reader notices | reason |
| Twelve unarchived changes named moved paths on a stated date | figure; history |
| The sweep is scoped to the moved paths, and each edited change is re-validated strictly | spec: A path sweep of a pending change is scoped, and re-validated |
| The sweep covers globs, `new URL` and depth-keyed path arithmetic, not only imports | spec: A path sweep covers every construct that names a file |
| The `new URL` form fails loudly because a named test asserts every one resolves | reason |
| A depth-keyed derivation states its assumption and fails when it does not hold | spec: A path derivation states its assumption and fails when it does not hold |
| No tool writes its output into a change directory, and durable artifacts go under `metrics/` | spec: No tool writes its output into a change directory |
| Scenario: a path is moved while work is queued against it | spec: A change that moves or deletes a path updates the unarchived changes that name it; spec: A path sweep of a pending change is scoped, and re-validated |
| Scenario: the sweep is scoped to what the move invalidated | spec: A path sweep of a pending change is scoped, and re-validated |
| Scenario: a moved file names a sibling by something other than an import | spec: A path sweep covers every construct that names a file |
| The palette test whose glob matched nothing after a move | history |
| Scenario: a generated artifact outlives the change that asked for it | spec: No tool writes its output into a change directory |
| The inventory test that wrote into a change directory | history |

## A comment stating a procedure is executable, or is marked as history

| Rule | Where it went |
| --- | --- |
| A procedural comment is executable or says it is a record, and dead instructions and false present-tense statements go | spec: A comment stating a procedure is executable, or is marked as history |
| A comment of provenance or absence is not a procedure and is kept | spec: A comment of provenance or absence is kept |
| The provenance comments and absence guards kept, by file | history |
| An absence guard lives as long as the file that hosts it | spec: A comment of provenance or absence is kept |
| The Brewfile's guard went with the Brewfile, and what it protected is now a requirement | history; spec: The repository declares no native tool |
| A partially repointed procedure is not produced | spec: A procedure is retired whole, never partly repointed |
| A file marked generated names a generator that exists, or its header says it is ordinary source | spec: A file marked generated names a generator that exists |
| Scenario: a change removes the machinery a comment describes | spec: A comment stating a procedure is executable, or is marked as history |
| Scenario: a dead recipe is repointed rather than retired | spec: A procedure is retired whole, never partly repointed |
| The thirty-seven differential headers and their recipe | history; figure |
| Scenario: a generated file outlives its generator | spec: A file marked generated names a generator that exists |
| The spectre tables file and where its invariants are asserted | history |
| Scenario: a comment-only sweep is verified by count | spec: A comment-only sweep is verified by count, not by green |

## A bulk mechanical edit is checked for shape and for scope

| Rule | Where it went |
| --- | --- |
| A bulk edit is verified by a shape check and a scope check, and neither subsumes the other | spec: A bulk mechanical edit is checked for shape and for scope |
| A rename is checked by folding each new name back and requiring the committed file | spec: A rename is checked by folding the new names back |
| Two old names folding to one are chosen per file, and a file that used both is reported | spec: Two old names that fold to one are resolved per file |
| A rewrap residue is reported separately from a content difference | spec: A rewrap residue is reported apart from a content difference |
| `scripts/check-rename-shape.mjs` performs these, is not a gate step, and reports what it inspected | spec: The rename-shape tool is run on demand, and says what it inspected |
| The layering test that passed six of seven tests blind | history; figure |
| Scenario: a rewriter edits a line of the right kind in the wrong file | spec: A bulk mechanical edit is checked for shape and for scope |
| Seven files gained an extension in a named change | history; figure |
| Scenario: a rewriter edits prose that looks like code | spec: A bulk mechanical edit is checked for shape and for scope |
| Scenario: an edit rides along with a rename sweep | spec: A rename is checked by folding the new names back |

## An assertion distinguishes the value it names from a superstring

| Rule | Where it went |
| --- | --- |
| An assertion can fail on its defect, a short-needle `toContain` does not, a rendering is asserted whole with a paired targeted assertion, and the negative form is not covered | spec: An assertion distinguishes the value it names from a superstring |
| An inline snapshot fills itself in on first run | reason |
| The test that stayed green over a corrupted board, with its count | history; figure |
| Scenario: a text-format test is written with single-character needles | spec: An assertion distinguishes the value it names from a superstring |

## A C-recorded fixture is kept for what cannot be derived, not as a quality bar

| Rule | Where it went |
| --- | --- |
| A frozen capture is retained where it records a fact with no independent derivation | spec: A C-recorded fixture is kept for what cannot be derived, not as a quality bar |
| A capture used as a relative quality bar is replaced by the independent computation | spec: A peer-comparison bar is replaced by the independent computation |
| The question is asked of every fact the fixture asserts | spec: Retiring a fixture accounts for every fact it asserted |
| Scenario: a generator differential is kept | spec: A C-recorded fixture is kept for what cannot be derived, not as a quality bar |
| Scenario: a peer-comparison bar is replaced by the real yardstick | spec: A peer-comparison bar is replaced by the independent computation |
| Scenario: retiring a fixture accounts for its incidental assertions | spec: Retiring a fixture accounts for every fact it asserted |

## Design-fiction docs are labeled and quarantined

| Rule | Where it went |
| --- | --- |
| Design fiction lives under a directory named as vision material, and every file opens with a status banner | spec: Design-fiction docs are labeled and quarantined |
| It is not cited as shipped behavior, and a guide's link names it as future direction | spec: Design fiction is not cited as shipped behavior |
| When part ships, it moves into the real guides or specs in the shipping change | spec: Shipped fiction moves into the real guides and specs |
| The one such directory was retired by a named change on a stated date | history |
| Scenario: a reader opens a vision doc | spec: Design-fiction docs are labeled and quarantined |
| Scenario: fiction ships | spec: Shipped fiction moves into the real guides and specs |

## The openspec CLI is pinned by the repository and its floor is asserted

| Rule | Where it went |
| --- | --- |
| The CLI is a declared dependency at a stated version, with a floor asserted at least where archive refuses to drop a scenario | spec: The openspec CLI is pinned by the repository and its floor is asserted |
| The CLI was installed globally and sat nine months and fifteen releases behind | history; figure |
| Checking what the installed tool does and generalizing it is trusting an instrument unchecked | reason |
| The gate runs the CLI's validation over the specs and every open change | spec: The gate validates the specs and every open change |
| Scenarios: an older CLI is refused, the repository states its version, setup is one install | spec: The openspec CLI is pinned by the repository and its floor is asserted |
| Scenario: a stale delta blocks the commit | spec: The gate validates the specs and every open change |

## A change the agent scoped and decided is archived without an acceptance checkpoint

| Rule | Where it went |
| --- | --- |
| A change the agent decided is implemented, verified, committed and archived in one session, and what counts as such | spec: A change the agent scoped and decided is archived without an acceptance checkpoint |
| Owner acceptance is required only for player-visible work, work named by the owner, and a compatibility break raised first | spec: Owner acceptance is required only where the owner is the only judge |
| Asking converts a decision the agent owns into a queue item | reason |
| Scenario: an agent-initiated change completes without a checkpoint | spec: A change the agent scoped and decided is archived without an acceptance checkpoint |
| Scenarios: player-visible work waits, and a compatibility break is raised before the work | spec: Owner acceptance is required only where the owner is the only judge |

## The site-level help documents the features this fork adds

| Rule | Where it went |
| --- | --- |
| The help describes the fork's features a player can invoke, and no shipped control is undiscoverable | spec: The site-level help documents the features this fork adds |
| Thirty games had a hint and the help mentioned hints once, on a stated date | history; figure |
| The help names a control the way the app names it | spec: The help names a control the way the app names it |
| The help described a toolbar and a game menu that were deleted | history |
| The hint's description says why it differs and when it refuses | spec: The help says why the hint differs, and when it refuses |
| A cross-game mark's meaning is stated once, shape first | spec: A cross-game hint mark is explained once, by its shape |
| The help describes a feature and not its rollout, with a named population only where a test derives it | spec: The help describes a feature's rule, never its rollout |
| Coverage is asserted from the app, seen to fail, and fail-closed for new capabilities | spec: Help coverage is asserted from the app, and fails closed |
| A glyph a help page names resolves to a real icon rule | spec: A glyph a help page names resolves to a real icon rule |
| Scenario: a player can find out what the Hint button does | spec: The site-level help documents the features this fork adds |
| Scenario: a refused hint is explained before the player meets one | spec: The help says why the hint differs, and when it refuses |
| Scenario: a cross-game hint mark is explained once, by its shape | spec: A cross-game hint mark is explained once, by its shape |
| Scenario: a partly-implemented feature is described by its rule | spec: The help describes a feature's rule, never its rollout |
| Scenario: a newly shipped feature control cannot go undocumented | spec: Help coverage is asserted from the app, and fails closed |
| Scenario: the chrome is rebuilt and the help still names its controls | spec: The help names a control the way the app names it |
| Scenario: a named tier promises something the help has explained | spec: Help coverage is asserted from the app, and fails closed |
| Scenario: a help glyph names an icon that exists | spec: A glyph a help page names resolves to a real icon rule |
| Scenario: one word does not name two features | spec: The help names a control the way the app names it |

## A local-feedback probe case is anchored within a named function

| Rule | Where it went |
| --- | --- |
| A case names its function, its text matches once within it, and a missing or ambiguous anchor aborts the run and fails the gate | spec: A local-feedback probe case is anchored within a named function |
| Whole-file anchoring made a case breakable by an unrelated edit | reason |
| All three scenarios | spec: A local-feedback probe case is anchored within a named function |

## Source, documentation and specs use American English spelling

| Rule | Where it went |
| --- | --- |
| Every word this project writes is spelled the American way, in the places listed | spec: Source, documentation and specs use American English spelling |
| The stem table is the one copy, and the fold script proves a respelling diff | spec: The spelling table is the convention's one copy |
| The archive, the postmortems, the license files, the reference C and the lockfile are exempt | spec: The record and other people's words keep their spelling |
| Those three kinds are the whole of what the guard does not read | untrue: `scripts/checks/spelling.mjs` also excludes the spelling tooling itself, whose table names every British stem, so the requirement lists it |
| A name this project does not own is allowed by an entry scoped to its file | spec: A name this project does not own is allowed where it is expected |
| The platform's own spelling is American | reason |
| The guard scans every tracked file for every stem as a substring, reports file and line, and floors its file count | spec: The spelling guard scans every tracked file and counts them |
| It is enforced by the gate, in the fast prefix, and is not a vitest file | spec: The spelling guard runs in the gate's fast prefix, not as a test |
| Generated output is checked at its source | spec: Generated output is spell-checked at its source |
| Scenario: a British spelling enters a swept area, and the gate blocks a commit that touches no source | spec: Source, documentation and specs use American English spelling; spec: The spelling guard runs in the gate's fast prefix, not as a test |
| Scenario: a quotation of an upstream symbol is allowed where it is expected | spec: A name this project does not own is allowed where it is expected |
| Scenario: the archive is left in its own words | spec: The record and other people's words keep their spelling |
| Scenario: the guard counts what it looked at | spec: The spelling guard scans every tracked file and counts them |

## A design-fiction doc SHALL NOT carry a hand-maintained status column

| Rule | Where it went |
| --- | --- |
| No hand-maintained status in a design-fiction doc, an outcome is stated at its claim, and what remains resolves through the tool and the archive | spec: A design-fiction doc SHALL NOT carry a hand-maintained status column |
| The vision README's table and the row that stayed wrong for three days | history; figure |
| A status column rots because keeping it true is nobody's job when it becomes false | spec: A design-fiction doc SHALL NOT carry a hand-maintained status column |
| A withdrawn or completed item is struck through and kept, and each withdrawal has a postmortem | spec: A withdrawn or completed vision item is struck through and kept |
| The withdrawals that were the most reused prose | history |
| A vision doc is not the home of a live rule | spec: Shipped fiction moves into the real guides and specs |
| A vision with nothing left is retired, with its rules moved, postmortems confirmed and citations repointed | spec: A vision with nothing left to report is retired |
| Scenarios: a vision item completes, and a reader asks how far along the framework is | spec: A design-fiction doc SHALL NOT carry a hand-maintained status column |
| Scenario: a vision has nothing left to report | spec: A vision with nothing left to report is retired |

## A change id cited outside the archive SHALL resolve

| Rule | Where it went |
| --- | --- |
| A change id in `docs/` or `AGENTS.md` resolves, and a guard in the fast prefix asserts it | spec: A change id cited outside the archive SHALL resolve |
| The homes are an open change, an archive entry and a postmortem | untrue: `scripts/checks/change-citations.mjs` also resolves the name of a capability under `openspec/specs/`, so the requirement lists four homes |
| Non-ids are held in a ledger asserted exactly the unresolved set | spec: Tokens that are not change ids are held in an exact ledger |
| The archive is out of scope, and the specs are out of scope on a measurement, with a scan widened only where the measurement comes back the other way | spec: The citation scan leaves the archive and the specs alone |
| The token counts measured in the specs | figure |
| The guard was declined, and a dead citation appeared 46 minutes later and stood five days | history; figure |
| The resolver knows every home, and the file and token counts are floored | spec: The citation resolver knows every home, and the scan is floored |
| Eleven false positives of twelve on the first run | figure; history |
| Scenario: a change is renamed | spec: A change id cited outside the archive SHALL resolve |
| Scenario: a token is not a change id | spec: Tokens that are not change ids are held in an exact ledger |
| Scenario: the scan matches nothing | spec: The citation resolver knows every home, and the scan is floored |

## A comment says what the code cannot, and a name answers its own question

| Rule | Where it went |
| --- | --- |
| A comment stays only where it says what the code does not, and is no longer than it needs | spec: A comment says what the code cannot, and a name answers its own question |
| An identifier is renamed if and only if a domain reader has to ask, and the short conventional names are kept | spec: An identifier is renamed only when a domain reader has to ask |
| A style pass changes no behavior and adds no abstraction | spec: A style pass changes no behavior and adds no abstraction |
| Scenarios: a comment defends a byte-match, and a comment records provenance or an absence | spec: A comment says what the code cannot, and a name answers its own question |
| Scenario: a terse name is judged by its context | spec: An identifier is renamed only when a domain reader has to ask |
| Scenario: a style pass over a game is committed | spec: A style pass changes no behavior and adds no abstraction |

## A change id cited in source resolves, on the same terms as one in docs

| Rule | Where it went |
| --- | --- |
| A change id in a comment, test title or error string under `src/` resolves on the same terms | spec: A change id cited in source resolves, on the same terms as one in docs |
| The scan was widened on a measurement, with its counts and date | history; figure |
| A numbered section or a design tag says which document it means, and a numbered section resolves in two places only | spec: A numbered section or a design tag names its document |
| Six dead numbered references stood in source, survivors of a deleted directory's numbering | history; figure |
| Scenario: a dead citation is added to a source comment | spec: A change id cited in source resolves, on the same terms as one in docs |
| Scenario: a token matching the key is not a change id, carried with its reason | spec: Tokens that are not change ids are held in an exact ledger |
| Scenario: a design tag names no document | spec: A numbered section or a design tag names its document |

## Cloudflare Pages deploy tooling lives in the CI deploy job

| Rule | Where it went |
| --- | --- |
| The app is published by direct upload from the CI deploy job at a pinned wrangler version, and the repository carries no other Pages tooling | spec: Cloudflare Pages deploy tooling lives in the CI deploy job |
| The title of the `build-pipeline` requirement that governs gating | reason |
| A dependency would install a CLI no local command uses | reason |
| Scenario: wrangler is confined to the deploy job | spec: Cloudflare Pages deploy tooling lives in the CI deploy job |

## Every game's help page has one skeleton, read off the game

| Rule | Where it went |
| --- | --- |
| Every game page has the one skeleton, in order | spec: Every game's help page has one skeleton, read off the game |
| Which sections a page owes is derived from the game | spec: The sections a page owes are derived from the game |
| Credits sit under the origins heading only, plural for a game with rulesets | spec: A puzzle's credits sit under the origins heading and nowhere else |
| The pages were adopted from two sources in two shapes | history |
| Scenarios: a missing or misordered section, and a help-only commit runs the guard | spec: Every game's help page has one skeleton, read off the game |
| Scenario: a hinted game has no Hints section, or a hintless one has one | spec: The sections a page owes are derived from the game |
| Scenarios: a misplaced origins section, and a credit left in the rules | spec: A puzzle's credits sit under the origins heading and nowhere else |
| The name of the test file that fails | reason |

## A game's Hints section teaches its hint marks

| Rule | Where it went |
| --- | --- |
| The section says what the marks mean, which are the player's and how they are made, and the words used, and it agrees with the hint | spec: A game's Hints section teaches its hint marks |
| The guard checks presence and not content | spec: A game's Hints section teaches its hint marks |
| The examples of a sentence naming its marks | reason |
| Scenario: a hint's marks change | spec: A game's Hints section teaches its hint marks |

## A game's parameters section is generated from its paramConfig

| Rule | Where it went |
| --- | --- |
| The section writes the placeholder and the build generates the list from `paramConfig` | spec: A game's parameters section is generated from its paramConfig |
| The list was a hand-written copy, and nine pages did not link the tier names | history; figure |
| Both scenarios | spec: A game's parameters section is generated from its paramConfig |

## No test file mocks a module

| Rule | Where it went |
| --- | --- |
| No test file calls a module mock, a check asserts it, and a test spies on the real export and restores it | spec: No test file mocks a module |
| Why a module mock fails under `isolate: false` and a spy does not | spec: No test file mocks a module |
| The two failures, by file, and the eight tests | history; figure |
| The check asserts what it scanned and that its pattern matches | spec: The mock check says what it scanned |
| Scenarios: a mocking file is reported, and a spied test passes in either order | spec: No test file mocks a module |
| Scenario: localizing a suspected cross-file leak | spec: A suspected cross-file leak is localized in one worker, in both orders |

## A hint test's pinned positions keep the scan that finds them

| Rule | Where it went |
| --- | --- |
| The harness pins one position per declared rung, keyed by rung id, as an input | spec: A hint test's pinned positions keep the scan that finds them |
| A rung no board fires is excused only by name and reason, and the scan walks it too | spec: A rung no known board fires is excused by name, with its reason |
| A further kind is a predicate over the step, given the plan, reading fields and never the sentence | spec: A further kind is a predicate over the step, never a pattern over its sentence |
| A kind named as a leg is held by any step, and a test's own pins go through the same harness | spec: A kind named as a leg is held by any step of the plan |
| The harness tests that every pin fires and snapshots the sentence said at each | spec: The harness tests that every pin still fires, and snapshots what it says |
| The frame of a pinned step is drawn through the midend, and no test walks a plan on a hand-kept board for it | spec: A pinned step's frame is drawn through the midend |
| The scan walks hint-guided play over fixed seeds and reports a count and a position per kind | spec: The scan walks hint-guided play over fixed seeds and counts each kind |
| The scan plays opening moves, asks under a named Ui and walks a second line where a test says so | spec: A scan plays what its test says, for a kind hint-guided play does not meet |
| A pin is recorded with its count and comes from the scan in the tree | spec: A pin carries its count, and comes from the scan in the tree |
| A hint test does not walk seeds to find its position, and a sweep is not covered | spec: A hint test does not walk seeds to find its position |
| Scenarios: a pin stops firing, and a reworded sentence | spec: The harness tests that every pin still fires, and snapshots what it says |
| Scenario: scanning again | spec: The scan walks hint-guided play over fixed seeds and counts each kind |
| Scenarios: a kind with no pin, a kind about the plan, and a board on which a solver rung fires | spec: A further kind is a predicate over the step, never a pattern over its sentence |
| Scenarios: a rung with no pin, and a rung that is only ever a later leg | spec: A hint test's pinned positions keep the scan that finds them |
| Scenario: a case of a rung that is only ever a later leg | spec: A kind named as a leg is held by any step of the plan |
| Scenario: the frame of a later leg | spec: A pinned step's frame is drawn through the midend |
| Scenario: a sentence spoken only off the hint's line | spec: A scan plays what its test says, for a kind hint-guided play does not meet |
| Scenarios: a refusal, and a cross-game guard that needs a frame only some games produce | spec: A hint test does not walk seeds to find its position |

## One command scans a hint test's positions and writes its pins

| Rule | Where it went |
| --- | --- |
| `npm run hint-scan` runs a file's scans and writes its pins by parsing the file, and writes no other file | spec: One command scans a hint test's positions and writes its pins |
| It keeps a pin that still fires and a pin the scan cannot reach | spec: The scan command keeps a pin that still fires |
| It exits non-zero on a kind nothing fires, on a file with no scan, and on a file that fails first | spec: The scan command fails on a kind nothing fires, and on an empty scan |
| A pin that does not load does not stop the file being collected during a scan | spec: A pin that does not load does not stop a scan |
| A scan whose pins live elsewhere is printed and nothing is written | spec: A scan whose pins live elsewhere is printed, not written |
| Scenario: adding a kind | spec: One command scans a hint test's positions and writes its pins |
| Scenarios: a pin kept by hand, and a stale pin | spec: The scan command keeps a pin that still fires |
| Scenarios: a kind nothing fires, and a file with no scan | spec: The scan command fails on a kind nothing fires, and on an empty scan |
| Scenario: a pin read while tests are collected | spec: A pin that does not load does not stop a scan |
| Scenario: a rung excused from a pin that fires | spec: A rung no known board fires is excused by name, with its reason |

## A help page names a field's choice through a placeholder

| Rule | Where it went |
| --- | --- |
| A page names a choice through the placeholder, and a bad placeholder fails the build | spec: A help page names a field's choice through a placeholder |
| A page does not type a choice's name, and the guard scans for each as a whole word | spec: A help page does not type a choice's name |
| Two kinds of name are outside the scan | untrue: `src/help-coverage.test.ts` skips a third, a choice name with no letter in it, so the requirement lists three |
| Salad's page said one name where its menu said another | history |
| Scenarios: a mode is renamed, and a placeholder names no choice | spec: A help page names a field's choice through a placeholder |
| Scenario: a page types a choice's name | spec: A help page does not type a choice's name |

## A game page's list of rulesets is generated

| Rule | Where it went |
| --- | --- |
| A declaring game's page writes the placeholder once in its rules, the build generates the list, and a mismatch fails the build and the guard | spec: A game page's list of rulesets is generated |
| The list was hand-written beside a dialog field | history |
| Both scenarios | spec: A game page's list of rulesets is generated |

## A game page's list of rule modifiers is generated

| Rule | Where it went |
| --- | --- |
| A declaring game's page writes the placeholder once in its rules, the build generates the list, and a mismatch fails the build and the guard | spec: A game page's list of rule modifiers is generated |
| Where two games' added rules used to be explained | history |
| Both scenarios | spec: A game page's list of rule modifiers is generated |

## Agent instructions have one root file, and no record of completed work is hand-maintained

| Rule | Where it went |
| --- | --- |
| One root instruction file with `CLAUDE.md` a symlink to it, and no tool generates a second | spec: Agent instructions have one root file, and no record of completed work is hand-maintained |
| No record of completed work is hand-maintained anywhere | spec: No record of completed work is hand-maintained |
| A rule stated only inside removed history is lifted out first | spec: A rule is lifted out before the history around it is removed |
| Scenarios: the two names never drift, openspec generates no second file, and the tool's update does not silently overwrite | spec: Agent instructions have one root file, and no record of completed work is hand-maintained |
| Scenario: a completed change is recorded by the workflow | spec: No record of completed work is hand-maintained |
| Scenario: removing history does not lose a rule | spec: A rule is lifted out before the history around it is removed |

## The root brief is bounded, and the project's rules live in the README and the guides

| Rule | Where it went |
| --- | --- |
| The brief is bounded in lines and bytes, the gate fails on either in its fast prefix, and any other auto-loaded instruction file is held to the same | spec: The root brief is bounded, and the project's rules live in the README and the guides |
| The line bound is the one the tool's documentation gives | reason |
| The brief holds three things, and everything else lives in the README and the guides | spec: `AGENTS.md` holds what binds every session, and the rest lives where any reader finds it |
| A completed change's rule goes in the guide for the part of the tree it binds | spec: A completed change's rule goes in the guide for the part of the tree it binds |
| A fact the tree states is not restated | spec: A fact the tree states is not restated |
| A third-party tool's behavior is not described | spec: A third-party tool's behavior is not described |
| No history in the brief or carried from it into a guide | spec: No history is written into `AGENTS.md` or a guide |
| The brief opens by saying it is not to grow | spec: The root brief is bounded, and the project's rules live in the README and the guides |
| Material addressed to one tool holds only what is specific to it | spec: Material addressed to one tool holds only what is specific to that tool |
| Scenarios: a paragraph past the bound, and the check stops seeing the file | spec: The root brief is bounded, and the project's rules live in the README and the guides |
| Scenario: a fact about the tree is asked of the tree | spec: A fact the tree states is not restated |
| Scenario: a rule is readable without the tool | spec: Material addressed to one tool holds only what is specific to that tool |

## The gate holds every open loop that draws randomness to a stated bound

| Rule | Where it went |
| --- | --- |
| An open loop that draws from the RNG calls a guard once per pass or is ledgered, and the ledger equals the unguarded set both ways | spec: The gate holds every open loop that draws randomness to a stated bound |
| The scan keys on shape and references | spec: The open-loop scan keys on shape and references |
| It runs in the source-scan pass and carries its known positives | spec: The open-loop scan runs in the source-scan pass and carries its known positives |
| A loop dealing a whole board takes the guard, a ledger entry is for the rest, and no default-budget guard on per-item sampling | spec: A loop that deals a whole board again takes the guard, and the ledger is for the rest |
| A deterministic open loop is outside the requirement | spec: The gate holds every open loop that draws randomness to a stated bound |
| Scenarios: a generator's guard is removed, and a ledger entry outlives its loop | spec: The gate holds every open loop that draws randomness to a stated bound |
| Scenario: a new game samples a free square by rejection | spec: A loop that deals a whole board again takes the guard, and the ledger is for the rest |
