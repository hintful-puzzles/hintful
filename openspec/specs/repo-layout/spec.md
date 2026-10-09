# repo-layout Specification

## Purpose
How this repository is organized and kept honest: where code, help, docs and
tooling live, the in-process test tiers and the determinism they rely on, the
harness that pins a hint's test positions, the developer guides under `docs/`
and the agent brief, and the checks and audits that hold module layering, test
strength, bulk edits, comments, spelling and change-id citations to what they
claim. It is mainly the contract for working in the tree; what the served help
must cover is its one player-facing part. How a change is accepted and
archived is in `docs/work-management.md`.

## Requirements

### Requirement: Repo root holds product-level config only

The repository root SHALL hold only what conventionally belongs at the top level
of a Node/TypeScript project: package manifests, language and tool config,
runtime, CI and tool declarations (`.gitignore`, `.gitattributes`, `.nvmrc`,
`.husky/`, `.github/`, `.claude/`), top-level documentation, the page entry
`unsupported.html`, and the entry-point directories `src/`, `public/`, `help/`,
`licenses/`, `scripts/`, `openspec/`, `templates/`, `vite-plugins/`, `docs/`
and `metrics/`.

#### Scenario: A new tooling artifact is added

- **WHEN** a contributor adds a build script, harness, or generated artifact
- **THEN** it goes in `scripts/`, `vite-plugins/`, or another role directory
- **AND** the repo root gains no new file unless it is product-level config

### Requirement: The repository declares no native tool

The repository root SHALL NOT hold a `Brewfile` or any other native-package
manifest, and `npm install` SHALL be the entire setup of a clean checkout. A
manifest that lists no dependency is an instruction to run an installer for
nothing.

#### Scenario: The repository declares no native tool

- **WHEN** a contributor sets the project up from a clean checkout
- **THEN** `npm install` is the entire setup
- **AND** the root holds no `Brewfile` or other native-package manifest

### Requirement: `metrics/` holds only live instruments

`metrics/` SHALL hold only live instruments: generated output that something
still reads. A finished round's dated snapshot is not a live instrument, and
`build-pipeline` governs where it goes.

#### Scenario: A generated report is still read

- **WHEN** a check regenerates a report that a guide or a session reads
- **THEN** the report is committed under `metrics/`

#### Scenario: A round's snapshot is finished

- **WHEN** a measurement round has finished and nothing reads its dated snapshot
- **THEN** the snapshot is not a live instrument and is filed where
  `build-pipeline` says

### Requirement: The build output directory is `dist/`

The build output directory SHALL be `dist/`, and it SHALL be gitignored.
`build/` SHALL NOT be among the entry-point directories: a directory kept for
whatever comes next is a slot with no occupant.

#### Scenario: A production build leaves the tree clean

- **WHEN** the production build runs
- **THEN** its output lands under `dist/`
- **AND** git reports no new file, and no `build/` directory is created

### Requirement: Source tree under `src/` groups files by UI role

`src/` SHALL group TypeScript files by the role they play, not by filename
pattern:

- `src/screens/` holds the top-level screen components, one per HTML page, and
  the base class they extend.
- `src/dialogs/` holds the modal and popover Lit components shown as overlays
  from one or more screens.
- `src/components/` holds the reusable leaf Lit components that are neither a
  screen nor a dialog.

#### Scenario: A new Lit component lands in the right bucket

- **WHEN** a contributor adds a new top-level screen, dialog, or leaf
  component
- **THEN** the file is placed under `src/screens/`, `src/dialogs/`, or
  `src/components/` respectively, or under `src/puzzle/components/` when it is
  puzzle-specific
- **AND** the file is NOT added loose at `src/` root, and NOT loose at
  `src/puzzle/` root alongside the runtime

### Requirement: Entry points and cross-cutting modules stay at the `src/` root

The following SHALL stay at `src/` root and not under a subdirectory, because
they are entry points or cross-cutting:

- the HTML page entries referenced by `templates/*.html.hbs`;
- the main bootstrap `main.ts`, the old-browser preflight gate `preflight.ts`,
  and the service worker `sw.ts`;
- cross-cutting modules with no single-screen owner, such as `routing.ts`,
  `color-scheme.ts` and `icons.ts`;
- ambient-type files such as `vite-env.d.ts`.

#### Scenario: Page-entry script URLs in HTML templates still resolve

- **WHEN** files under `src/` are reorganized
- **THEN** `templates/index.html.hbs` continues to load `/src/home-page.ts` and
  `templates/puzzle.html.hbs` continues to load `/src/puzzle-page.ts`
- **AND** neither file moves, because both are HTML page entries

### Requirement: The non-UI subdirectories of `src/` keep their scope

The subdirectories of `src/` with a non-UI scope SHALL keep their shape:
`src/assets/` for committed icons and images, `src/css/` for styles,
`src/store/` for the Dexie schema, and `src/utils/` for general-purpose
helpers.

#### Scenario: A general-purpose helper is added

- **WHEN** a contributor adds a helper that belongs to no screen, dialog or
  puzzle
- **THEN** it goes under `src/utils/`, and a stylesheet goes under `src/css/`

### Requirement: `src/puzzle/` separates the runtime from its components

`src/puzzle/` SHALL separate its two roles into the directory root and one
subdirectory. The root holds the main-thread puzzle runtime: the `Puzzle`
object, the Comlink worker host, the canvas `Drawing`, the engine surface, the
worker adapter and the committed catalog. `src/puzzle/components/` holds the
puzzle-specific Lit components.

#### Scenario: A puzzle-specific component is added

- **WHEN** a contributor adds a Lit component that only the puzzle page uses
- **THEN** it goes under `src/puzzle/components/`
- **AND** it is not added loose at `src/puzzle/` root alongside the runtime

### Requirement: A puzzle component's file does not repeat its directory, and its element name does not change

A file under `src/puzzle/components/` SHALL NOT repeat the directory in its
name: `components/view.ts`, not `components/puzzle-view.ts`. The custom element
names SHALL NOT change: `<puzzle-view>`, `<puzzle-keys>` and the rest are the
app's DOM vocabulary, used from `templates/*.html.hbs` and from every
component's templates, so renaming one changes the app's markup contract where
renaming a file is a refactor.

#### Scenario: A puzzle component moves without changing the markup

- **WHEN** a puzzle component's file is renamed or relocated
- **THEN** its `@customElement` tag name is unchanged
- **AND** `templates/*.html.hbs` and every template using `<puzzle-…>` are
  untouched

### Requirement: The puzzle logic lives in `src/engine/` and `src/games/<puzzleId>/`

The puzzle logic, everything that runs in the worker, SHALL live in two sibling
directories at `src/` root:

- `src/engine/`: the midend, the `Game` interface, the per-game registry, the
  save codec, the drawing, color and palette contracts, the engine's own type
  vocabulary (`types.ts`), and the shared solver and generator libraries, with
  behavioral tests colocated.
- `src/games/<puzzleId>/`: one folder per game, named by catalog `puzzleId`,
  with the `Game` implementation and its behavioral tests.

#### Scenario: The engine and a game land in the right place

- **WHEN** engine-level behavior is added and, later, a game is added
- **THEN** the midend, `Game` interface, registry, save codec and shared
  libraries live under `src/engine/`
- **AND** the game lives under `src/games/<puzzleId>/` with its
  behavioral tests colocated
- **AND** neither is added loose at `src/` root

### Requirement: A shared library lives under `src/engine/`

A shared leaf library, such as `random/` and `combi/`, is an engine library and
SHALL live under `src/engine/`, keeping its own frozen characterization corpus
where it has one. There SHALL NOT be a separate top-level category for a
shared or leaf module.

#### Scenario: A shared library is not given its own top-level directory

- **WHEN** a contributor adds a shared library used by the engine or by
  more than one game
- **THEN** it lands under `src/engine/`, not as a sibling of it

### Requirement: Engine modules that are meaningless apart are grouped, and the rest stay flat

Within `src/engine/`, a family of modules that are meaningless apart from each
other SHALL be grouped into a subdirectory, and unrelated helpers SHALL stay
flat. The families are `grid/` (the grid builders, geometry, descriptions,
trimming and the aperiodic `tilings/`, with `grid/index.ts` the barrel callers
import from) and `color/` (the palette, the role-to-color meanings and the
board-relative per-game colors), beside the leaf libraries and the test
utilities under `testing/`.

#### Scenario: A new member of a family joins it

- **WHEN** a contributor adds a grid builder
- **THEN** it lands under `src/engine/grid/` and is exported through the barrel

### Requirement: No engine subdirectory is created for a grouping that has to be argued for

A subdirectory SHALL NOT be created under `src/engine/` for a grouping that has
to be argued for. The test is whether a reader looking for a file would know to
look there without being told; where the answer needs the rationale explained,
the file SHALL stay flat.

#### Scenario: A new engine helper is not given a speculative subdirectory

- **WHEN** a contributor adds an engine helper that belongs to no existing
  family
- **THEN** it lands flat in `src/engine/`
- **AND** a new subdirectory is created only for a family whose members have no
  readership apart from each other

### Requirement: Behavior is testable in-process across three tiers

The project SHALL make behavior testable in-process under `vitest`, with no
browser, across three tiers, and SHALL reserve browser automation for visual
and full-integration smoke checks only:

1. Pure logic: `Game` implementations, the `Midend`, solvers, generators and
   codecs.
2. Rendering ops: a game's `redraw` driven against a recording `GameDrawing`
   double, asserting the draw calls it makes.
3. Components and persistence: Lit components, and Dexie/IndexedDB
   persistence.

#### Scenario: A rendering op is asserted without a browser

- **WHEN** a game's `redraw` is driven against a recording `GameDrawing`
- **THEN** the test asserts the draw calls it makes, such as a mistake-colored
  rect for a flagged cell, with no browser involved

### Requirement: Each tier runs in the cheapest environment that fits

The pure-logic and rendering tiers SHALL run in the default `node` environment.
A component test SHALL opt into `happy-dom` per file. Persistence SHALL be
tested against an in-memory `fake-indexeddb`, which a setup file installs.
`happy-dom` and `fake-indexeddb` SHALL be devDependencies only, with no runtime
or bundle impact.

#### Scenario: The fast logic suites keep the node environment

- **WHEN** the pure-logic suites run
- **THEN** they execute in the default `node` environment and do not pay
  DOM setup cost; only files that need it opt into `happy-dom`

#### Scenario: A persistence round-trip is tested without a browser

- **WHEN** the saved-games suite runs
- **THEN** a quick-save is written and read back through Dexie against an
  in-memory `fake-indexeddb`, asserting the round-trip and the reactive
  `hasQuickSave` signal, with no browser involved

### Requirement: New UI or persistence behavior ships an in-process test

New UI or persistence behavior SHALL ship a tier-2 or tier-3 in-process test
rather than relying on a human eyeballing a browser run.

#### Scenario: A component command path is tested without a browser

- **WHEN** the puzzle screen's suite mounts the element under `happy-dom`
  with a fake `Puzzle`
- **THEN** the Check & save command saves on zero mistakes and refuses to
  save on a positive mistake count, asserted in-process

### Requirement: The render harness is one recorder and one scenario driver

The harness SHALL include a recording `GameDrawing` that captures every draw
call with all its arguments, with colors resolved through the game's palette to
stable labels. It SHALL include a scenario driver that, given a game, a game
id, an optional move list, and flags to show the active hint or the mistakes,
drives a real `Midend` to the target frame and returns the captured record. The
driver SHALL replay moves as `Move`s, not as pointer events.

#### Scenario: A frame is reached by its moves

- **WHEN** a scenario names a game id and a move list
- **THEN** the driver applies the moves to a real `Midend` as `Move`s and
  captures the frame the midend then draws
- **AND** no pointer event is synthesized to reach it

### Requirement: A draw record is deterministic

The harness's output SHALL be deterministic: a fixed tile size, rounded
coordinates, stable ordering, and no `Date` or `Math.random`.

#### Scenario: The same scenario is captured twice

- **WHEN** one scenario is captured on two runs, or on two machines
- **THEN** the two records are identical

### Requirement: A render test pairs a snapshot with targeted assertions

Verification of a draw record SHALL use `toMatchSnapshot` on the record plus
targeted assertions on specific ops. New rendering behavior SHOULD ship such a
test, with browser automation reserved for genuine full-integration and
real-canvas smoke checks.

#### Scenario: A render regression is a reviewable snapshot diff

- **WHEN** the captured record is compared against its `toMatchSnapshot`
  baseline after a rendering change
- **THEN** an unintended visual change surfaces as a text diff an agent reviews,
  and an intended one is re-baselined with `vitest -u`

### Requirement: Developer guides live under docs/ and link to specs

Developer guides under `docs/` SHALL describe procedure, the followable how,
and SHALL NOT restate normative requirements. A guide MUST link to the
authoritative spec requirement rather than paraphrase it, and MUST name
exemplar files rather than copy code that would rot. The specs then stay the
single source of what is required, and a guide can go stale but cannot
silently contradict a requirement.

#### Scenario: A guide states a normative rule

- **WHEN** a `docs/` guide mentions a rule that a spec owns (e.g. the hint
  quality bar)
- **THEN** the guide states it briefly and links to the owning spec
  requirement
- **AND** the guide does not contain the authoritative wording such that the
  two could diverge

#### Scenario: A guide shows a code pattern

- **WHEN** a `docs/` guide describes an implementation pattern (e.g. the
  `Int32Array` packed-bits render cache key)
- **THEN** it points at an exemplar file that demonstrates the pattern
- **AND** it does not paste a code snippet that would drift from the source

### Requirement: The game guides are organized by concern

The game guides SHALL be the `docs/games/` set, one guide for each concern,
with `README.md` the map, the game lifecycle and the definition of done. A
repo-wide guide SHALL sit directly under `docs/`.

#### Scenario: A lesson about rendering is written down

- **WHEN** a change teaches something about how a game redraws
- **THEN** it is written into `docs/games/rendering.md`, the guide for that
  concern, and not into a guide named for the change

### Requirement: A guide section is cited by its heading

A guide section SHALL be citable by named heading, as `<file> § "Heading"`. A
heading that is cited from code or specs SHALL be kept short, distinctive and
grep-stable. A positional section number SHALL NOT be used as a citation
target, because it shifts on insertion and strands every citation; the two
documents with numbered sections are named in "A numbered section or a design
tag names its document".

#### Scenario: A guide section is cited from code

- **WHEN** a source comment or spec cites a guide section
- **THEN** the citation names the guide file and the section's heading text
- **AND** renaming that heading repoints every citation in the same change

### Requirement: `docs/` holds only this project's own guides

`docs/` SHALL hold this project's own guides. Everything under it carries the
standing obligation `AGENTS.md` states, to update the guide in the change that
taught something, so material this project may not edit SHALL NOT be there.
`docs/` is developer-facing and SHALL NOT hold anything the app serves: a page
the app serves is a build input and lives under `help/`.

#### Scenario: A page for players is written

- **WHEN** a contributor writes a page the app will serve
- **THEN** it goes under `help/`, and nothing under `docs/` is a build input

### Requirement: A third-party explanation is a link, not a copy

A third-party explanation SHALL be carried as a link to its maintained source,
not as a copy in this repository. Where a linked explanation is load-bearing
for a module, the module SHALL carry the pointer, in the file a reader would
already have open, and not a line in `AGENTS.md`.

#### Scenario: A third-party explanation is needed by a module

- **WHEN** a module implements an algorithm explained by a third-party document
- **THEN** the module's own header links that document at its maintained source
- **AND** the repository does not carry a copy of it under `docs/`

#### Scenario: Deleting a copy does not delete the explanation

- **WHEN** a copied third-party reference is removed
- **THEN** the link that replaces it is confirmed present in the implementing
  modules first
- **AND** anything the linked source does not cover is moved into the code as a
  comment where a reader of that code would look

### Requirement: A scaffolding script stamps out a new game-port skeleton

The repository SHALL provide `scripts/new-game-port.sh <gameId>`, which creates
`src/games/<gameId>/` holding typed `Game<…>` stub modules in the
`index`/`state`/`solver`/`generator`/`render` file shape the game guides
prescribe, an empty `__fixtures__/` placeholder, a `<gameId>.test.ts` with a
save round-trip skeleton and a `renderScenario` smoke skeleton, and a
`<gameId>-generation.test.ts` stub for the generation invariants. It SHALL
refuse to overwrite an existing game directory.

#### Scenario: Scaffolding a new game

- **WHEN** a contributor runs `scripts/new-game-port.sh singles`
- **THEN** `src/games/singles/` is created with the typed stub modules, an
  empty `__fixtures__/`, a starter `singles.test.ts`, and a
  `singles-generation.test.ts` stub
- **AND** the emitted files type-check and lint clean

#### Scenario: The game directory already exists

- **WHEN** the script is run with the id of a game that has a directory
- **THEN** it refuses and writes nothing

### Requirement: The scaffold prints the edits that need judgment and performs none

The scaffolding script SHALL print, and SHALL NOT itself perform, the
manual-edit checklist that requires judgment: registering the game in
`src/games/index.ts`, adding its catalog entry to `src/puzzle/catalog-data.ts`,
stating what the generation test asserts, and adding the two committed icon
PNGs. `docs/games/README.md` SHALL reference the script as the
copy-from-exemplar entry point.

#### Scenario: The checklist is printed, not performed

- **WHEN** the script has scaffolded a game
- **THEN** it prints the manual-edit checklist (the two registration points, the
  generation invariants, the icon PNGs) without editing those files

### Requirement: The scaffold promises no C oracle

The scaffold SHALL NOT emit a C-differential stub or instruct a contributor to
write a trace harness: a new game has no upstream oracle to record a fixture
against. The frozen fixtures of games ported while a C build existed are
unaffected.

#### Scenario: The scaffold does not promise an oracle that no longer exists

- **WHEN** the scaffold is generated
- **THEN** it contains no C-differential stub and no trace-harness instruction
- **AND** the generation-test stub states that the game's assurance is
  behavioral

### Requirement: A shared helper carries the byte-for-byte differential shape

The engine testing utilities SHALL provide `describeDescDifferential` in
`src/engine/testing/differential.ts`: given a fixture list, a `params` mapper
and a game's `newDesc`, it asserts for each fixture that
`newDesc(params(fixture), randomNew(fixture.seed)).desc` equals the recorded C
desc, with an optional `extra` callback for a follow-on assertion. A game whose
gated differential has that shape SHALL use the helper. The solver-agreement
shape is game-specific and is not modeled by it.

#### Scenario: A game's byte-match differential uses the helper

- **WHEN** a game's gated differential asserts its `newDesc` reproduces the C desc
  byte-for-byte across a fixture set
- **THEN** it calls `describeDescDifferential` with its fixtures, params mapper, and
  `newDesc`, rather than re-declaring the `describe`/`for`/`it`/`expect` loop

#### Scenario: A differential decodes a board and runs the solver

- **WHEN** a game's differential decodes a recorded board, runs the solver and
  asserts the recorded difficulty
- **THEN** it is written in the game's own test, not through this helper

### Requirement: The frozen fixtures' provenance is stated once, and no recipe is carried

The C-reference fixtures are frozen and cannot be regenerated. That fact SHALL
be stated once, in the shared differential helper, rather than repeated per
game, and a differential test file SHALL NOT carry a regeneration recipe,
because no such recipe can be executed.

#### Scenario: A fixture's provenance is recorded but its recipe is not

- **WHEN** a differential test file documents where its fixture came from
- **THEN** it names the harness that captured it, as history
- **AND** it does NOT carry the commands, because none of them can be run

### Requirement: The test suite is deterministic under parallel load

The full `vitest run` SHALL pass deterministically: a test SHALL NOT fail as a
function of execution order, worker scheduling or CPU contention. Heavy
generator and solver tests, which loop until a uniquely solvable board is
produced, SHALL be seed-deterministic, and a generator's retry loop SHALL have
a finite iteration cap rather than rely on probabilistic termination within a
timeout.

#### Scenario: A generator test gives the same verdict every run

- **WHEN** a generator/solver test runs with a fixed seed, alone or inside the
  full parallel suite
- **THEN** it produces the same board and the same pass/fail verdict, regardless
  of how many other tests run concurrently

### Requirement: Efficiency is asserted by a proxy, never by elapsed time

A test SHALL NOT assert on elapsed wall-clock time as a proxy for an algorithm
being efficient, because elapsed time under a saturated box measures spare
capacity and not the code. Such a property SHALL be asserted by a deterministic
proxy instead, a bounded node or expansion count, an iteration count or a
result shape, that is identical whatever the machine load.

#### Scenario: Efficiency is asserted by a proxy, not by elapsed time

- **WHEN** a test wants to assert an algorithm (e.g. a hint planner's search) is
  efficient
- **THEN** it asserts a load-independent proxy (bounded expansions / iterations /
  result shape), not that it finished within a wall-clock millisecond budget

### Requirement: There is one test timeout, and it is a backstop

A test timeout is a runaway backstop and not a gate: an otherwise-good commit
SHALL NOT be rejected merely because work took long. There SHALL be exactly one
generous ceiling, `testTimeout` and `hookTimeout` in `vitest.config.ts`, sized
far clear of the worst loaded runtime. An individual test SHALL NOT set its own
timeout: a per-test ceiling is a guess about contention, and is tighter than
the global one without showing it.

#### Scenario: A correct-but-slow test survives a saturated box

- **WHEN** a test whose work terminates and whose assertions are deterministic
  runs while the machine is heavily loaded, taking many times its solo runtime
- **THEN** it still passes, because no per-test clock gate stands between it and
  its assertions: only the single generous ceiling, which is sized for runaway
  work rather than for contention

### Requirement: Non-termination is bounded in code, not by a timeout

A timeout SHALL NOT be relied on to catch a runaway loop: the suite is
synchronous, so a runaway blocks the event loop and the timeout cannot fire.
Non-termination SHALL be bounded where it can be caught, by
`engine/retry-limit.ts` for generator retries and by `engine/step-budget.ts`
for solver and hint fixpoints.

#### Scenario: A fixpoint stops making progress

- **WHEN** a hint's deduction loop reports progress without changing the board
- **THEN** its step budget throws a labeled failure
- **AND** no test waits on the timeout to end it

### Requirement: A load-only failure is root-caused

A failure observed only under full-suite load SHALL be root-caused and not
dismissed as flaky. Root-causing means identifying which cause applies:
contention on terminating work, shared state or order dependence, a logic edge
case, or non-termination. Where the cause is contention on work that
terminates, removing or raising the clock gate SHALL be the fix, and
re-guessing a per-test constant SHALL NOT be.

#### Scenario: A load-only failure is investigated, not ignored

- **WHEN** a test fails during a full `vitest run` but passes in isolation
- **THEN** its cause is identified (contention, shared state, order dependence,
  a logic edge case, or non-termination) and fixed at that cause: the leak is
  fixed, the code is fixed, or the loop is bounded in code
- **AND** where the cause is contention on terminating work, the fix is to stop
  gating that test on the clock, never to re-guess a per-test constant

### Requirement: Test worker processes do not outlive their runner

A `vitest` run SHALL NOT leave worker processes running after it ends. A run's
entry points, the pre-commit gate and the `test` and `test:run` npm scripts,
SHALL reap orphaned workers before starting. The reaper runs before a run and
not after it, because the interrupt that creates an orphan also kills any
post-run hook.

#### Scenario: Orphaned workers are reaped before a run

- **WHEN** a test entry point (the gate or a `test`/`test:run` npm script) starts
  and a prior run left an orphaned worker (a repo `vitest` worker with PPID 1)
- **THEN** that orphan is killed by its exact PID before the new run begins, so
  orphans never accumulate across runs

### Requirement: The reaper kills only this repo's orphans, and never fails a run

The reaper SHALL kill only this repo's `vitest` worker processes whose parent
is PID 1, which are orphans by definition, by exact PID. It SHALL NOT use
`pkill` or `killall`, and SHALL NOT kill a live run's workers or another
user's processes. It SHALL be fail-safe: any error is swallowed and the run
proceeds.

#### Scenario: A live run's workers are never reaped

- **WHEN** the reaper runs while another `vitest` run is in progress
- **THEN** that run's workers (which have their runner as parent, not PID 1) are
  left untouched, and only true orphans are killed

### Requirement: Every generate-until-success loop is bounded by the shared retry limit

Every generate-until-success retry loop in a game generator SHALL be finitely
bounded, and the bound SHALL come from the shared `engine/retry-limit.ts`
helper rather than a hand-rolled counter, so every loop reports failure the
same way: `RetryLimitExceeded`, naming the loop and its budget. A loop whose
only termination argument is probabilistic counts as unbounded. Fixpoint
solvers, and loops that terminate by a stated monotone-progress argument, are
exempt.

#### Scenario: A runaway generator fails fast instead of orphaning a worker

- **WHEN** a game generator's retry loop is given an input for which it never
  reaches success (a porting divergence, or params that admit no puzzle)
- **THEN** it throws `RetryLimitExceeded`, naming the loop, after a finite number
  of attempts rather than looping forever, so the worker returns control (and can
  be torn down) instead of becoming an uninterruptible orphan

### Requirement: An exhausted retry limit throws, or hands over to a bounded recovery

Exhaustion of a retry limit SHALL either throw, or transfer to a recovery path
that is itself bounded. Throwing is the default, and cannot alter a seed that
converges. Recovery SHALL be preferred where the algorithm already has such a
path, since a cap that throws turns a rare but legal seed into a failed puzzle
where recovery makes it a slower one.

#### Scenario: A stalled loop recovers rather than failing the puzzle

- **WHEN** a retry loop has a natural recovery path and stops making progress
  (Net's loop-fixing rounds ceasing to reduce the loop-square count)
- **THEN** it takes that recovery path (a full reshuffle) once the stall is
  detected, bounded by an outer `retryLimit`, so the player gets a slower puzzle
  rather than an error

### Requirement: Every help page the app serves lives under `help/`

Every help page the app serves to players SHALL live under `help/`, and SHALL
be this project's own page, maintained by this project. There SHALL be one help
source directory in one format: `help/*.md` for the site-level pages and
`help/games/<puzzleId>.md` for the per-puzzle ones, rendered to
`/help/<puzzleId>.html`. There SHALL NOT be an `upstream/` subdirectory under
`help/`: a page describing a game must be correctable by the change that alters
the game.

#### Scenario: A help page is served from one place in one format

- **WHEN** the help sources are located
- **THEN** every served page is markdown under `help/`
- **AND** no served page is read from a directory that forbids editing it

### Requirement: No served page documents a platform this app is not

No page the app serves SHALL document a platform this app is not: menus, file
dialogs, printing or command-line options that belong to upstream's desktop
builds.

#### Scenario: A served page does not describe a different platform

- **WHEN** a help page describes how to save, print, or configure the game
- **THEN** it describes what this app does
- **AND** it does not document menus, file dialogs, printing or command-line
  options that belong to upstream's desktop builds

### Requirement: Every cataloged puzzle has a help page, and every page a cataloged game

Every cataloged `puzzleId` SHALL have a help page, and every help page SHALL
name a cataloged game. Both directions SHALL be asserted automatically.

#### Scenario: Every cataloged puzzle has a help page

- **WHEN** the help coverage is checked
- **THEN** every `puzzleId` in the catalog has a `help/games/<puzzleId>.md`
- **AND** every `help/games/*.md` names a cataloged game
- **AND** both directions are asserted, so a page orphaned by a rename is caught
  as well as a game with no page

### Requirement: Adopting or relocating a help page changes no words, attribution or URL

Relocating or adopting a help page SHALL change neither its content nor its
attribution, and SHALL NOT change the URL any page is served at. Words adopted
from upstream keep their words; who may fix them afterwards is a licensing
question, which the notices under `licenses/` and `LICENSE.md` discharge.

#### Scenario: Adoption changes no URL and no words

- **WHEN** an upstream-authored help page is adopted into `help/games/`
- **THEN** it is served at the same URL as before
- **AND** its words and the project's attribution are unchanged

### Requirement: A help source directory does not shadow a served URL directory

A help source directory SHALL NOT shadow a URL directory the build emits pages
into. Sources whose pages render to the top level, as `help/games/` renders to
`/help/<puzzleId>.html`, are unaffected.

#### Scenario: A help source directory does not shadow a served URL directory

- **WHEN** a help source is placed under `help/`
- **THEN** its directory name does not collide with a URL subdirectory the build
  emits pages into
- **AND** the production build succeeds

### Requirement: A game's help page introduces the puzzle, not its implementation

A per-puzzle help page SHALL introduce the puzzle: its rules, its provenance,
its controls and its parameters. It SHALL NOT carry development status,
known-issue lists or roadmap notes: a player is not the audience for a
statement about the implementation, and such a statement goes stale silently
once the issue is addressed.

#### Scenario: A game has a known shortfall

- **WHEN** a game's implementation has an open issue or unfinished work
- **THEN** its help page says nothing of it

### Requirement: The module layering is enforced, not merely observed

The source tree's layering SHALL be enforced by an automated check that fails
CI on violation. No game SHALL import another game: each game under
`src/games/<puzzleId>/` is independent, and shared behavior belongs in
`src/engine/`. `preflight.ts` SHALL import nothing that breaks its Baseline
2023 gate. The check SHOULD be an in-repo test in the style of the other
cross-cutting invariant tests rather than a new dependency, unless the rules
outgrow what a test expresses clearly.

#### Scenario: A game reaches into another game

- **WHEN** a change adds an import from one game directory into another
- **THEN** the layering check fails in CI
- **AND** the shared code is moved to `src/engine/` instead

### Requirement: `engine/` imports `games/` only from named test-only files

`engine/` SHALL NOT import `games/`, except from the test-only files under
`engine/testing/` that derive a cross-game guard's population from the
registry, each of which has to import the modules that populate it. Each
exception SHALL be listed explicitly with its reason, and SHALL NOT be granted
by a wildcard over `engine/testing/`.

#### Scenario: Another engine file imports a game

- **WHEN** a file under `engine/` that the check does not name imports from
  `games/`
- **THEN** the layering check fails
- **AND** the named files' permission reaches no other file under
  `engine/testing/`

### Requirement: The engine and the games import nothing else under `src/`

`engine/` and `games/` SHALL import nothing under `src/` outside those two
directories: the puzzle engine runs in a worker and must not depend on the app
shell. The check SHALL express this as that invariant and SHALL NOT express it
as a list of forbidden directories, because a blocklist permits by default and
a directory added later is then allowed silently.

#### Scenario: An engine module reaches into a directory the rule never named

- **WHEN** an engine or game module imports from any directory under `src/`
  other than `src/engine/` or `src/games/`, including one added after the rule
  was written
- **THEN** the layering check fails
- **AND** it fails without the rule having been updated to know about that
  directory

### Requirement: The layering check guards its own reach

The layering check SHALL assert what it actually inspected: that every relative
source specifier in the tree resolves, and that the number resolved is far
above zero. Every rule reports offenders, and a resolver that resolves nothing
finds none, so without this the check passes while inspecting nothing.

#### Scenario: The checker is broken rather than the code

- **WHEN** the layering check's import resolution stops working, because a
  refactor edited it or the tree moved under it
- **THEN** the check fails, naming the specifiers it could not resolve
- **AND** it does NOT report zero violations, which is what a checker that
  inspected nothing would otherwise report

### Requirement: A check that counts violations also counts what it looked at

An instrument that answers "how many violations?" SHALL also answer "how many
things did I look at?", so that "none found" and "nothing checked" are
different results. A count asserted this way SHALL be a floor set well below
the true value and not a ratchet: its job is to separate working from resolving
nothing, and a tight number would wobble on every legitimate deletion.

#### Scenario: A cross-cutting invariant test states its own coverage

- **WHEN** a test asserts that a set of violations is empty across the tree
- **THEN** it also asserts how many items it examined to reach that conclusion
- **AND** the count is a floor set well below the true value, so it distinguishes
  "nothing was wrong" from "nothing was checked" without ratcheting on a number
  that legitimate deletions change

### Requirement: The import-cycle metric counts runtime cycles

The repository's import-cycle measurement SHALL report cycles that exist at
runtime, and SHALL NOT count a cycle whose every instance in one direction is a
type-only import, which `verbatimModuleSyntax` erases at build time. Runtime
cycles SHALL be ratcheted at zero, and the check SHALL be verified to still
detect a genuine cycle, so that a reported zero means a real absence rather
than a broken detector.

#### Scenario: A type-only back-reference is not reported

- **WHEN** a game's `render.ts` imports its game's hint type from `index.ts`
  while `index.ts` imports render functions as values
- **THEN** the cycle metric does not report a cycle
- **BECAUSE** the type import is erased and no runtime cycle exists

#### Scenario: A genuine value cycle is reported

- **WHEN** two modules import values from each other
- **THEN** the cycle metric reports it and the ratchet fails
- **AND** the calibrated check is periodically confirmed to catch such a case,
  so that a zero reading is evidence rather than silence

### Requirement: The test suite's strength is audited, not assumed

The repository SHALL periodically measure whether its tests would catch a
regression, not merely whether they execute the code, by mutation-testing the
shared engine and triaging the survivors. The deliverable SHALL be a triaged
survivor list, each survivor classified as a missing assertion, a genuinely
unreachable branch or an equivalent mutant. Where survivors cluster SHALL be
reported: survivors in code the differentials are meant to protect mean the
fixture net is thinner than believed.

#### Scenario: A refactor is justified by an unmoved fixture

- **WHEN** a change argues it is behavior-preserving because a differential
  fixture did not move
- **THEN** that argument is only as strong as the fixture's measured coverage of
  the paths the change touched
- **AND** where the audit has shown that coverage to be thin, the change adds a
  direct assertion rather than relying on the fixture alone

#### Scenario: A snapshot's paired assertions are not load-bearing

- **WHEN** the audit finds surviving mutants in a render path protected only by a
  snapshot
- **THEN** the targeted assertions that snapshot is required to be paired with are
  strengthened
- **BECAUSE** a snapshot alone can be re-baselined with `vitest -u` and the
  guarantee silently lost

#### Scenario: A shared module's semantics are pinned only by a distant consumer

- **WHEN** a mutant in a shared engine module survives that module's own test file
  and is killed only by a game's tests or a frozen differential
- **THEN** an assertion is added to the module's own test file, naming the
  behavior rather than the mutant
- **BECAUSE** coverage several layers away is adequate as protection and poor as
  feedback: a run of just the relevant test files is then green on a broken
  module

### Requirement: The mutation audit is not a gate, and its score is not ratcheted

The mutation audit SHALL NOT be a gate and its score SHALL NOT be ratcheted.
Mutation testing re-runs the covering tests per mutant, and a score that
invites maximizing also invites tests written against mutants rather than
against behavior.

#### Scenario: The score moves between two audits

- **WHEN** an audit reports a lower score than the one before it
- **THEN** no commit is blocked by it, and its survivors are triaged

### Requirement: A shared module's tests give feedback where the code lives

A module in `src/engine/` SHALL be able to fail its own tests when its behavior
changes, and SHALL NOT rely solely on a consumer's tests or a game's frozen
differential to notice. Logic that moves from a game into `src/engine/` SHALL
have its tests written in the same change. A session runs the files it
touched, so a module whose own tests cannot see its defects returns green on a
broken module.

#### Scenario: Logic is extracted into the engine

- **WHEN** logic moves from a game into `src/engine/`
- **THEN** its tests are written in the same change
- **BECAUSE** extraction moves the code but not its tests: the game's
  differential still catches defects, so nothing turns red and the module
  silently arrives with no local assertions

#### Scenario: A module is fully protected but locally silent

- **WHEN** a module has few or no surviving mutants but its own tests do not fail
  on a defect planted in it
- **THEN** that is a feedback defect to fix, not a coverage success to report
- **BECAUSE** the failure it produces is a green targeted run on a broken module

### Requirement: The local-feedback probe plants a defect and runs only the module's own tests

Local feedback SHALL be measured by planting a real defect, running only the
module's own tests, and seeing whether they fail. `npm run probe`
(`scripts/feedback-probe.mjs`) is that measurement, with a committed corpus of
hand-chosen defects. It SHALL be a diagnostic and not a ratchet, and a test
SHALL NOT be written to move its number rather than to state a behavior. A case
argued behavior-preserving SHALL be recorded as such and excluded from the
rate rather than chased.

#### Scenario: A planted defect survives

- **WHEN** a case's defect is planted and the module's own tests still pass
- **THEN** the probe reports a survivor, which is a finding and not a failed run

### Requirement: A module's own tests are derived from what imports it

A module's own tests SHALL be derived rather than assumed: they are every
engine test file that imports the module, or imports a barrel re-exporting it,
and not one file named after it. A differential SHALL NOT count as a local
test, even an engine-local one, because its guarantee is a frozen fixture
noticing that the boards moved.

#### Scenario: A module is tested through its barrel

- **WHEN** a test file imports a barrel that re-exports a module
- **THEN** that file is among the module's own tests, whatever it is named

### Requirement: The probe walks the engine recursively and fails below a floor of test files

The derivation of own tests SHALL walk `src/engine/` recursively, and SHALL
fail rather than proceed when it discovers fewer engine test files than a
committed floor. Fewer tests run against each planted defect means more cases
report as survivors, which reads as the tests having got worse, and the anchor
check does not cover it: a pure file move leaves every quoted source line in
place.

#### Scenario: The instrument stops finding tests

- **WHEN** a refactor nests engine modules deeper than the probe's directory walk
  reaches
- **THEN** the probe fails on the discovered-test-file floor
- **AND** it does NOT report a lower rate, which would be indistinguishable from
  the tests having genuinely got worse

### Requirement: A guarantee left to a differential is stated and verified

Where a module's guarantee genuinely belongs to a differential, such as an RNG
draw order or a region sizing that decides which boards exist, that division of
labor SHALL be stated in the module's test file and SHALL be verified, by
confirming the differential does fail on the defect the local tests
deliberately let through.

#### Scenario: A draw order is left to the differential

- **WHEN** a module's own tests deliberately let a change of draw order through
- **THEN** its test file says the differential holds that guarantee
- **AND** the differential has been seen to fail on that defect

### Requirement: An assertion's two sides do not derive from the same value

A test SHALL NOT compare a quantity against the thing that produced it:
`x.length` against the value `x` was sized from, a getter against its own
field, a total against the sum it was computed from. Such a comparison is a
decoration and SHALL be replaced by the independent statement the code under
test has to get right.

#### Scenario: An assertion's two sides derive from the same value

- **WHEN** a test asserts that an array's length equals the count the array was
  allocated with
- **THEN** it is replaced by a count taken independently, such as a dot's degree
  counted from the edges that name the dot as an endpoint

### Requirement: A change that moves or deletes a path updates the unarchived changes that name it

A change that relocates, renames or deletes a path SHALL sweep the pending
changes under `openspec/changes/`, those not yet archived, and correct every
reference the move invalidates, as part of its own definition of done: a
pending change's tasks are steps someone will execute verbatim. An archived
change is a record and SHALL be left as written.

#### Scenario: A path is moved while work is queued against it

- **WHEN** a change moves, renames or deletes a path
- **THEN** every unarchived change under `openspec/changes/` naming that path is
  corrected in the same change
- **AND** archived changes are left as written, being a record of what was true

### Requirement: A path sweep of a pending change is scoped

The sweep of a pending change SHALL correct references to the moved paths and
nothing else.

#### Scenario: The sweep is scoped to what the move actually invalidated

- **WHEN** the sweep is performed
- **THEN** it corrects references to the moved paths and nothing else
- **AND** a pending change's reasoning, scope and tasks are otherwise untouched:
  a path fix is not an occasion to revise someone else's plan

### Requirement: A path sweep covers every construct that names a file

Within the source tree, a path sweep SHALL cover every construct that names a
file, not only import statements: `import.meta.glob`, whose unmatched glob
yields an empty object so the file's assertions pass over nothing;
`new URL(…, import.meta.url)`; and path arithmetic keyed to depth, such as
`p.split("/")[3]` or a fixed prefix stripped from a key, which no string sweep
can see.

#### Scenario: A moved file names a sibling by something other than an import

- **WHEN** a file that uses `import.meta.glob`, `new URL(…, import.meta.url)` or
  a depth-keyed path derivation is relocated
- **THEN** each of those is repointed in the same change as the imports

### Requirement: A path derivation states its assumption and fails when it does not hold

A path derivation keyed to depth SHALL state its assumption and SHALL fail when
the assumption does not hold, rather than degrade: cutting a glob key at
`/games/` and throwing when the match fails is correct at any depth, where
stripping a fixed prefix silently yields a wrong game id.

#### Scenario: A glob key no longer has the expected shape

- **WHEN** a file that derives a game id from a glob key is moved to another
  depth
- **THEN** the derivation either still yields the game id or throws
- **AND** it does not yield `".."` or another wrong id

### Requirement: No tool writes its output into a change directory

A tool SHALL NOT write its output into an `openspec/changes/<id>/` directory:
archiving renames that directory the day the change ships. Durable generated
artifacts SHALL go under `metrics/`.

#### Scenario: A generated artifact outlives the change that asked for it

- **WHEN** a script writes a reviewable artifact
- **THEN** it writes under `metrics/`, not into a change directory

### Requirement: A comment stating a procedure is executable, or is marked as history

A comment that tells a reader to do something SHALL be executable as written,
or SHALL say plainly that it is a record of something that can no longer be
done. A dead instruction, which is a command block naming a binary, a source
tree, a build flag or an output directory that no longer exists, SHALL be
removed, and so SHALL a present-tense statement that is false.

#### Scenario: A change removes the machinery a comment describes

- **WHEN** a toolchain, build or harness is deleted
- **THEN** every comment instructing a reader to invoke it is rewritten as
  history or removed
- **AND** comments recording provenance, or explaining why the machinery is
  absent, are kept

### Requirement: A comment of provenance or absence is kept

A comment that records where something came from, or why something is absent,
is not a procedure and SHALL be kept as it is. Provenance names the upstream
source a behavior was derived from, and is the only remaining answer to where
the behavior came from. An absence guard stops removed machinery being
re-added, and lives as long as the file that hosts it.

#### Scenario: A comment names the upstream source of a behavior

- **WHEN** a sweep removes mentions of a retired build
- **THEN** a comment saying which upstream file a port derives from stays
- **AND** so does a note saying that a piece of machinery was removed on purpose

### Requirement: A file marked generated names a generator that exists

A file marked "generated, do not edit by hand" SHALL name a generator that
exists. Where the generator has been removed, the file becomes ordinary
committed source and its header SHALL say so, since the alternative leaves a
contributor no permitted way to change it.

#### Scenario: A generated file outlives its generator

- **WHEN** a file's generator is deleted
- **THEN** the file's header stops claiming it is generated and stops forbidding
  hand edits
- **AND** any invariant the generator used to assert on its output is confirmed
  to be asserted somewhere that still runs

### Requirement: A comment-only sweep is verified by count, not by green

A change that edits comments across many test files SHALL compare the test and
assertion counts before and after, and SHALL NOT take a green suite as the
check: a comment edit that swallows a `describe` leaves a passing suite with
fewer tests in it.

#### Scenario: A comment-only sweep is verified by count, not by green

- **WHEN** a change edits comments across many test files
- **THEN** the test and assertion counts are compared before and after, not
  merely observed to be green

### Requirement: A bulk mechanical edit is checked for shape and for scope

A bulk mechanical edit, which is a file move, an import repoint or a rename
sweep, SHALL be verified by two checks before it is committed. Shape: every
changed line is the kind of line the edit was meant to change. Scope: every
changed file has some connection to what moved. Neither subsumes the other.

#### Scenario: A rewriter edits a line of the right kind in the wrong file

- **WHEN** a bulk import repoint is verified
- **THEN** the scope check reports every changed file that mentions none of the
  moved paths, such as one whose extensionless specifier gained an extension

#### Scenario: A rewriter edits prose that looks like code

- **WHEN** a bulk import repoint is verified
- **THEN** the shape check reports every changed line that is not an import line,
  such as an import written as an example inside a doc comment

### Requirement: A rename is checked by folding the new names back

For the renaming of an identifier, where shape says almost nothing because the
edit changes lines of every kind, the tool SHALL offer a stronger check: map
each new name back to the old one it replaced and require the result to be the
committed file, byte for byte. Anything else in the diff survives that fold and
SHALL be reported.

#### Scenario: An edit rides along with a rename sweep

- **WHEN** a vocabulary rename is verified with the fold check
- **AND** one changed file also carries an unrelated edit
- **THEN** that file is named as not explained by the rename

### Requirement: Two old names that fold to one are resolved per file

Where two old names fold to one new one, which is what merging two
vocabularies looks like, the tool SHALL choose per file whichever old name that
file actually used, because folding both would rewrite the other name into it.
It SHALL report rather than guess at a file that used both.

#### Scenario: A file used both old names

- **WHEN** two old names fold to one new name and a changed file used both
- **THEN** the tool reports that file and does not choose between them

### Requirement: A rewrap residue is reported apart from a content difference

A rename lengthens identifiers, so the formatter rewraps lines, and a rewrap is
not invertible. The tool SHALL report a residue explained only by line breaks
and trailing commas separately from a difference in content, so that neither is
silently folded into the other.

#### Scenario: A renamed object literal no longer fits its line

- **WHEN** a rename makes the formatter expand an object literal, which gains a
  trailing comma
- **THEN** the fold check reports that file as a rewrap residue, apart from any
  file whose content differs

### Requirement: The rename-shape tool is run on demand, and says what it inspected

`scripts/check-rename-shape.mjs` performs the shape, scope and fold checks. It
SHALL NOT be a commit-gate step: only the author knows a diff was meant to be a
pure rename, so its report is a prompt to look and not a verdict. It SHALL
report how many lines it inspected alongside how many offended, and how many
files the fold check compared.

#### Scenario: The tool parsed nothing

- **WHEN** the tool's diff parser yields no changed lines
- **THEN** its report says that no lines were inspected, and does not read as a
  clean bill of health

### Requirement: An assertion distinguishes the value it names from a superstring

An assertion SHALL be able to fail on the defect it was written for. A positive
`toContain`, or an equivalent substring check, whose needle is a single
character or a short string in a small alphabet does not meet that bar, since
the corruptions that occur are superstrings. Where the subject is a whole
rendering, the assertion SHALL be on the whole value, and an inline snapshot
SHALL be paired with at least one targeted assertion. The negative form
`not.toContain` is not covered.

#### Scenario: A text-format test is written with single-character needles

- **WHEN** a test asserts a rendered text format
- **THEN** it asserts the whole rendering, not the presence of individual
  characters
- **BECAUSE** a board whose empty-cell character `"."` is corrupted into `"./"`
  still contains `"."`

### Requirement: A C-recorded fixture is kept for what cannot be derived, not as a quality bar

The frozen C captures under `__fixtures__/` SHALL be retained where they record
a fact that has no independent derivation: which board a solver-gated generator
produces for a seed, the RNG stream, a tiling's incidence in emission order.
There the recording is the specification. This covers the per-game desc
differentials, the grid incidence differentials and the RNG corpus, which
remain the regression net for refactoring.

#### Scenario: A generator differential is kept

- **WHEN** a fixture records the description a solver-gated generator produced for
  a given seed
- **THEN** it is retained, because no independent computation yields that board
- **AND** a change that deliberately diverges retires or re-founds it, rather than
  re-recording it against a C build that no longer exists

### Requirement: Design-fiction docs are labeled and quarantined

Design-fiction documents, which describe a designed but unimplemented
architecture, SHALL be labeled and quarantined: they SHALL live under a
directory whose name marks them as vision material, and every file in it SHALL
open with a status banner stating that it describes a system that does not
exist yet and naming the change or session that authored it.

#### Scenario: A reader opens a vision doc

- **WHEN** any file under a design-fiction directory is opened
- **THEN** its first visible block states it is design fiction, not a
  description of the current system

### Requirement: Design fiction is not cited as shipped behavior

A design-fiction doc SHALL NOT be cited from code, specs or the
current-architecture guides as if it described shipped behavior. Where a
current-architecture guide links to one, the link SHALL name it explicitly as
future direction.

#### Scenario: A guide points at a vision doc

- **WHEN** a current-architecture guide links a design-fiction doc
- **THEN** the link says the doc is future direction
- **AND** no source comment or spec cites the doc for how the system behaves

### Requirement: Shipped fiction moves into the real guides and specs

When part of the fiction ships, the shipped part SHALL move into the real
guides or specs in the shipping change, and the fiction SHALL be updated or
retired rather than left claiming the present tense. A vision doc SHALL NOT be
the home of a rule that has become live: the rule moves to `AGENTS.md`, a
`docs/games/` guide or a spec, and the vision links to it, because a rule
stated only in a document labeled as fiction cannot be cited by the code that
obeys it.

#### Scenario: Fiction ships

- **WHEN** a change implements a mechanism the fiction describes
- **THEN** that change moves the now-true material into the real guides or
  specs and updates the fiction so no file claims unshipped behavior in the
  present tense

### Requirement: A withdrawn or completed vision item is struck through and kept

While a vision is live, a withdrawn or completed item SHALL be struck through
and kept with its argument, never deleted: a deletion leaves the next session
free to propose it again. Each withdrawal SHALL also have its postmortem under
`openspec/postmortems/`, which is where the argument outlives the vision.

#### Scenario: A vision item is withdrawn

- **WHEN** an item a live vision argues for is withdrawn
- **THEN** its passage is struck through and its argument stays on the page
- **AND** a postmortem for the withdrawal is written under
  `openspec/postmortems/`

### Requirement: The openspec CLI is pinned by the repository and its floor is asserted

The `openspec` CLI SHALL be declared as a dependency of this repository at a
stated version, and a minimum version SHALL be asserted mechanically, so that a
machine running an older CLI is told rather than allowed to proceed. The floor
SHALL be at least the version at which `openspec archive` refuses to drop a
scenario a live requirement still has, since below that the archiver can
silently delete committed work.

#### Scenario: An older CLI is refused rather than trusted

- **WHEN** the assertion runs against an openspec CLI below the stated floor
- **THEN** it fails, naming the installed version and the required one

#### Scenario: The repository states the version it expects

- **WHEN** a reader asks which openspec the workflow assumes
- **THEN** the answer is in the repository's own dependency declaration, not in
  whatever happens to be installed on the machine

#### Scenario: Setup is still a single install step

- **WHEN** a fresh checkout is prepared for work
- **THEN** the documented setup command installs the pinned CLI along with
  everything else, with no separate global install required

### Requirement: The gate validates the specs and every open change

The commit gate SHALL run the CLI's own validation over the specs and every
open change, so that a delta which would lose work blocks a commit rather than
surfacing at archive time.

#### Scenario: A stale delta blocks the commit, not the archive

- **WHEN** an open change carries a MODIFIED delta omitting a scenario the live
  requirement still has
- **THEN** the commit gate fails, naming the scenarios to copy back

### Requirement: The site-level help documents the features this fork adds

The help pages the app serves SHALL describe the features this fork adds beyond
upstream that a player can invoke from the app's own controls: at minimum the
explained hint, including its stepper and continuous modes, mistake checking,
the one-slot save the mistake check gates, and the controls that have no
keyboard equivalent a touch player can reach. A feature the app ships a control
for SHALL NOT be undiscoverable from the help.

#### Scenario: A player can find out what the Hint button does

- **WHEN** the help is searched for the hint feature
- **THEN** a section describes it, distinguishes it from a move-reveal, and
  covers both the step-at-a-time and the continuous modes

### Requirement: The help names a control the way the app names it

The help SHALL name a control the way the app names it, and SHALL NOT send a
player to a surface the app no longer has: such a page reads as maintained and
fails on its first step.

#### Scenario: The chrome is rebuilt and the help still names its controls

- **WHEN** a command moves to a different surface, or a surface is removed
- **THEN** every help page that directed a player to the old surface is
  corrected in the same change

#### Scenario: One word does not name two features

- **WHEN** the app and the help both use a term for a saved position
- **THEN** the term refers to one feature, or the difference is made in the app's
  own wording rather than explained away in the help

### Requirement: The help says why the hint differs, and when it refuses

The hint's description SHALL say what distinguishes it from upstream's: that it
explains why a move is forced rather than only revealing the move. It SHALL
state that a hint requested on a board that contradicts its own clues refuses
and surfaces the offending squares instead of deducing onward from a wrong
position.

#### Scenario: A refused hint is explained before the player meets one

- **WHEN** the help describes the hint
- **THEN** it states that a board contradicting its clues gets a refusal with
  the offending squares highlighted, rather than a deduction
- **AND** it distinguishes that refusal from the one that means deduction has
  run out, which the player otherwise cannot tell apart

### Requirement: A cross-game hint mark is explained once, by its shape

Where a hint mark carries a meaning that is the same in every game, the help
SHALL state that meaning once, so a player learns it once rather than per
puzzle. That statement SHALL lead with the mark's shape, what is ringed, what
is outlined, what carries an ordinal, and treat color as a secondary cue,
because shape is what the games are held to and what survives for a colorblind
player.

#### Scenario: A cross-game hint mark is explained once, by its shape

- **WHEN** a hint mark means the same thing in every game that draws it
- **THEN** the site-level help states that meaning, rather than each puzzle's
  page restating it or no page stating it
- **AND** it identifies the mark by shape first, with color as a secondary cue

### Requirement: The help describes a feature's rule, never its rollout

The help pages SHALL describe a feature, never the state of its rollout.
Where a control is present for some puzzles and not others, the help SHALL
state the property that governs it and SHALL NOT hand-maintain a list of the
puzzles. A named population SHALL appear only where a test derives it from the
declaration that defines it, so that it cannot rot unnoticed.

#### Scenario: A partly-implemented feature is described by its rule

- **WHEN** the help describes a feature that only some puzzles offer
- **THEN** it states the property that decides which puzzles offer it
- **AND** it names none of them, unless a test derives the names from the
  declaration that defines the population

### Requirement: Help coverage is asserted from the app, and fails closed

Coverage of the fork's features by the help SHALL be asserted automatically,
from the app rather than from a hand-maintained list, and the assertion SHALL
be shown to fail before it is relied upon. It SHALL be fail-closed with respect
to new capabilities: a capability added to the `Game` contract with no
classification SHALL fail the check rather than pass by omission.

#### Scenario: A newly shipped feature control cannot go undocumented

- **WHEN** the app gains a control for a feature the help has no section for
- **THEN** the help-coverage check fails
- **AND** it fails for a capability that is merely absent from the check's own
  list, not only for one whose section was deleted

#### Scenario: A named tier promises something the help has explained

- **WHEN** a game declares a difficulty tier whose name tells the player that
  deduction alone may not finish the board
- **THEN** the help has a section stating what that name promises

### Requirement: A glyph a help page names resolves to a real icon rule

A glyph a help page names SHALL resolve to a real icon rule. An unresolved
glyph renders as empty space with no error at build time or run time, so the
reference SHALL be checked against the stylesheet that defines it rather than
assumed.

#### Scenario: A help glyph names an icon that exists

- **WHEN** a help page references an icon
- **THEN** a rule defining that icon exists in the help stylesheet
- **AND** the reference is checked, because an unresolved one fails silently

### Requirement: A local-feedback probe case is anchored within a named function

Each case in the local-feedback probe corpus SHALL identify the function or
method whose behavior it perturbs, and its search text SHALL be required to
match exactly once within that function, rather than once within the whole
module. The anchor check SHALL keep aborting the run, and failing the commit
gate, on a missing or ambiguous anchor, because an edit that does not apply
reports a survivor, which is indistinguishable from a finding.

#### Scenario: An unrelated duplicate elsewhere in the module does not break a case

- **WHEN** a module gains a line matching a case's search text, outside the
  function that case names
- **THEN** the case still resolves, and the anchor check passes

#### Scenario: An ambiguous anchor inside the named function still aborts

- **WHEN** a case's search text matches more than once within the function it
  names
- **THEN** the run aborts rather than choosing one

### Requirement: Source, documentation and specs use American English spelling

Every word this project writes SHALL use American English spelling: in
TypeScript identifiers, in file and directory names, in comments, in `docs/`,
in the root markdown, in `scripts/`, in `openspec/specs/`, and in pending
changes under `openspec/changes/`. The stems are `color`, `center`, `gray`,
`neighbor`, `behavior`, `initialize`, `serialize`, `normalize`, `license`,
`catalog`, `analyze`, `artifact` and the rest of the table in
`scripts/checks/spelling-table.mjs`.

#### Scenario: A British spelling enters a swept area

- **WHEN** a file under `src/`, `docs/`, `scripts/` or `openspec/specs/` gains
  an identifier, path or word spelled the British way
- **THEN** the spelling guard fails, naming the file and line

### Requirement: The spelling table is the convention's one copy

`scripts/checks/spelling-table.mjs` SHALL be the convention's one copy: the
guard scans for every stem in it, and `scripts/checks/spelling-fold.mjs`
applies it to stdin, which is how a respelling diff is proved to be nothing
else.

#### Scenario: A respelling diff is proved to be only that

- **WHEN** the removed and the added lines of a respelling diff are both folded
- **THEN** every removed line equals its added line

### Requirement: The record and other people's words keep their spelling

Text that is this project's record, or is not its words, SHALL be exempt:

- `openspec/changes/archive/` and `openspec/postmortems/`. A change archived
  under a British name keeps it, and a live document that cites it by its id
  is not reported.
- The files under `licenses/`, which this project renames without touching
  their bytes; the upstream C kept as a reading reference under a change's
  `reference/`; and the lockfile.
- The spelling tooling itself, whose table has to name every British stem.

#### Scenario: The archive is left in its own words

- **WHEN** the guard runs
- **THEN** nothing under `openspec/changes/archive/` or `openspec/postmortems/`
  is scanned or rewritten
- **AND** an archived change with a British word in its name keeps that name,
  and a live document citing it by that name is not reported

### Requirement: A name this project does not own is allowed where it is expected

A name this project does not own SHALL be exempt: an upstream C function such
as `game_colours`, named in a comment as what a port implements, and a
third-party API member. A quotation respelled is a pointer falsified, and an
API member respelled does not compile. The table SHALL carry an explicit
allowance for each, scoped to the file it is expected in.

#### Scenario: A quotation of an upstream symbol is allowed where it is expected

- **WHEN** a comment names `game_colours` in the file the allowance lists
- **THEN** the guard accepts it
- **AND** the same token in a file the allowance does not list is reported

### Requirement: The spelling guard scans every tracked file and counts them

The spelling guard SHALL scan every tracked file outside the exemptions for
every stem in the table, as a substring and case-insensitively, so that a stem
inside a longer identifier is found and not only the whole word. It SHALL
report file and line for each hit outside an allowance, and SHALL assert that
the number of files it scanned exceeds a floor, so a broken listing cannot
report health over nothing.

#### Scenario: The guard counts what it looked at

- **WHEN** the guard's file listing yields fewer files than its floor
- **THEN** it fails on the count before asserting anything about spelling

### Requirement: The spelling guard runs in the gate's fast prefix, not as a test

The spelling convention SHALL be enforced by the gate, not by review. The guard
SHALL run in the gate's fast prefix, ahead of the documentation-only shortcut,
and SHALL NOT be a vitest file: a test may not read `docs/` or `openspec/`,
which the shortcut's safety rests on, and those are the directories a British
spelling most easily re-enters.

#### Scenario: A documentation-only commit is still checked

- **WHEN** a commit that touches no source adds a British spelling to a guide
- **THEN** the pre-commit gate blocks the commit

### Requirement: Generated output is spell-checked at its source

Generated output SHALL be checked at its source and not at its product:
`metrics/` and the render snapshots under `__snapshots__/` are excluded from
the scan because their generators are scanned.

#### Scenario: A snapshot carries a word

- **WHEN** a render snapshot or a generated report holds a word
- **THEN** the guard does not read it, and reads the file that generated it

### Requirement: A change id cited outside the archive SHALL resolve

A change id written in `docs/` or `AGENTS.md` SHALL resolve to an open change
directory, an archive entry, cited with or without its date prefix, a
postmortem, or a capability under `openspec/specs/`. A guard in the gate's fast
prefix SHALL assert this.

#### Scenario: A change is renamed

- **WHEN** a change directory is renamed or withdrawn while prose still names the
  old id
- **THEN** the gate fails on that id, naming the file and line, before the commit
  lands

### Requirement: A change id cited in source resolves, on the same terms as one in docs

A change id written in a comment, a test title or an error string under `src/`
SHALL resolve on the same terms as one written in `docs/`, and the same guard
SHALL assert it.

#### Scenario: a dead citation is added to a source comment

- **WHEN** a comment, test title or error string under `src/` cites a change that
  is renamed or withdrawn
- **THEN** the gate fails, naming the file and line, before the commit lands

### Requirement: Tokens that are not change ids are held in an exact ledger

The tokens the citation scan catches that are not change ids SHALL be held in a
ledger, each with the reason it is there. The ledger SHALL be asserted to be
exactly the unresolved set, so an entry cannot silently absorb a real dead
citation and an entry that starts resolving fails as loudly as a new dead one.

#### Scenario: A token is not a change id

- **WHEN** the scan's key catches a CSS feature, a git tag, a script name, a DOM
  event, a preference key, a command id, a solver rung name or a params string
- **THEN** it is carried in the ledger with the reason it is there
- **AND** the ledger is asserted to be exactly the unresolved set, so it fails
  if the token later starts resolving or if a genuinely dead citation is added
  to it

### Requirement: The citation scan leaves the archive and the specs alone

`openspec/changes/archive/` SHALL be out of the citation scan's scope: an
archived change is history, and forcing its citations to track later renames
falsifies the record. `openspec/specs/` SHALL be out of scope too, because a
spec's kebab-cased tokens are the product's own vocabulary and not change ids.
A scan SHALL be widened only where the measurement that excluded the specs,
how many of a root's tokens fail to resolve and how many of those are change
ids, comes back the other way.

#### Scenario: An archived change cites an id that was later renamed

- **WHEN** the guard runs over a tree whose archive names a renamed change
- **THEN** the archive is neither reported nor edited

### Requirement: The citation scan is floored

The citation scan SHALL carry a vacuity number: the files scanned and the
tokens found SHALL be floored, so a docs restructure that stops the scan
matching fails loudly rather than passing over nothing.

#### Scenario: The scan matches nothing

- **WHEN** a docs restructure moves the files out from under the scan's glob
- **THEN** the floors on files scanned and tokens found fail, rather than every
  downstream assertion passing over an empty set

### Requirement: A numbered section or a design tag names its document

A citation of a numbered section, or of a design tag such as `D5`, SHALL say
which document's numbering it means. The `docs/games/` guides have no numbered
headings, so a `§<number>` pointing into one is dead by construction; a
numbered section resolves only in `docs/test-strength.md` and in an archived
change's own document.

#### Scenario: a design tag names no document

- **WHEN** a source comment or test title carries a `D<n>` or `§<n>` tag
- **THEN** it names the change or the file whose numbering it means, so it
  resolves through the citation scan rather than needing a scan of its own
- **AND** where the tag appears in test titles, the change is named once in the
  file's header comment, so no test title changes and no snapshot key is orphaned

### Requirement: A comment says what the code cannot, and a name answers its own question

Source under `src/` SHALL carry a comment only where it tells a reader
something the code does not: why the code is the way it is, a constraint that
still binds, where a behavior came from, or why something is absent. A comment
that restates the code, narrates a past edit, or justifies a constraint that no
longer binds SHALL be removed, and a comment that stays SHALL be no longer than
what it has to say.

#### Scenario: A comment defends a byte-match

- **WHEN** a comment justifies reproducing upstream's logic so that a recorded
  fixture still matches
- **THEN** it is kept while that fixture exists and is checked by a test
- **AND** it is removed, or reduced to a statement of provenance, once nothing
  checks it

#### Scenario: A comment records provenance or an absence

- **WHEN** a comment says which upstream behavior a piece of code derives from,
  or why some machinery is deliberately absent
- **THEN** it is kept, as the requirement on procedural comments already
  provides

### Requirement: An identifier is renamed only when a domain reader has to ask

An identifier SHALL be renamed if and only if a reader who knows the domain has
to ask what it stands for and the surrounding code does not answer. A short
name the context makes obvious, and that the codebase uses the same way
elsewhere, SHALL be kept: `x` and `y` for a position, `w` and `h` for a size,
`r`, `g` and `b` in a color calculation, a loop index. Where a name carries
domain knowledge the reader needs, the descriptive name SHALL be preferred over
a comment explaining a terse one.

#### Scenario: A terse name is judged by its context

- **WHEN** a function computing over a grid names its dimensions `w` and `h`
- **THEN** the names are kept
- **WHEN** a two-letter name stands for a domain concept that the reader cannot
  recover from the lines around it
- **THEN** it is renamed to the domain word, and any comment that existed only
  to explain the abbreviation is removed

### Requirement: A style pass changes no behavior and adds no abstraction

A pass made to meet the comment and naming requirements SHALL NOT change
behavior, and SHALL NOT add an abstraction. A simplification is one that leaves
the code both shorter and easier to read; shorter alone does not qualify.

#### Scenario: A style pass over a game is committed

- **WHEN** a commit makes only comment, naming or simplifying edits to a game
- **THEN** the game's frozen differential fixtures and render snapshots pass
  without being re-recorded
- **AND** the commit removes more lines than it adds

### Requirement: Cloudflare Pages deploy tooling lives in the CI deploy job

The app SHALL be published to Cloudflare Pages by direct upload from the CI
deploy job, which runs `cloudflare/wrangler-action` at a pinned
`wranglerVersion` against the gate's own build artifact; `build-pipeline`
governs the gating and the verification. The repository SHALL NOT otherwise
carry Cloudflare Pages tooling: no `wrangler.toml` at the root, no `wrangler`
package in `dependencies` or `devDependencies`, and no script that invokes
`wrangler`. `npm run preview` is the local preview.

#### Scenario: Wrangler is confined to the deploy job

- **WHEN** the repository is inspected
- **THEN** there is no `wrangler.toml` and `package.json` names no `wrangler`
  package or script
- **AND** the only invocation of wrangler is the deploy job's
  `cloudflare/wrangler-action` step in `.github/workflows/ci.yml`, with its
  version pinned

### Requirement: Every game's help page has one skeleton, read off the game

Every page under `help/games/` SHALL have the same skeleton: the rules first
and unheaded; then `## Controls`; then any sections of the game's own; then,
when the page credits its puzzle, its origins section; then `## Hints` when,
and only when, the game declares `hint()`; and last, `## <Name> parameters`,
where `<Name>` is the game's catalog name.

#### Scenario: A page is missing a section, or has them out of order

- **WHEN** a page's first `##` heading is not `Controls`, or its last is not
  `<Name> parameters`, or `## Hints` is not immediately before the parameters
  section
- **THEN** the help-coverage guard fails, naming the game

#### Scenario: A help-only commit runs the guard

- **WHEN** a commit stages only a page under `help/games/`
- **THEN** the pre-commit hook selects the help-coverage guard, because
  `help/` is outside the documentation-only shortcut and the test selector
  reaches a help page through the guard's glob

### Requirement: The sections a page owes are derived from the game

Which sections a page owes SHALL be derived from the game, never from a list:
the `hint()` declaration decides the Hints section, and `paramConfig` decides
what the parameters section names.

#### Scenario: A hinted game has no Hints section, or a hintless one has one

- **WHEN** a game declares `hint()` and its page has no `## Hints`, or declares
  none and its page has one
- **THEN** the help-coverage guard fails, naming the game

### Requirement: A puzzle's credits sit under the origins heading and nowhere else

A puzzle's inventor, its other names and a link to more of it SHALL be under
the origins heading and nowhere else on the page. The heading SHALL read
`## Where the puzzles come from` for a game that declares rulesets, which is
several puzzles, and `## Where the puzzle comes from` for any other.

#### Scenario: A page's origins section is misplaced or misnamed

- **WHEN** a page has an origins heading that is not immediately before
  `## Hints` (or before the parameters section, on a hintless game's page), or
  that is the singular on a page whose game declares rulesets, or the plural on
  one whose game does not
- **THEN** the help-coverage guard fails, naming the game

#### Scenario: A credit is left in the rules

- **WHEN** a page says who invented its puzzle, who designed it, what it is
  known as or what it is an implementation of, anywhere outside its origins
  section
- **THEN** the help-coverage guard fails, naming the game and the words it
  found
- **AND** a credit phrased in none of those words passes, since the words are
  the only thing a test can tell a credit by

### Requirement: A game's Hints section teaches its hint marks

A game's `## Hints` section SHALL say what the hint's marks mean in that game,
which of them are the player's own notation and how the player makes them, and
the words the hint's sentences use for its marks. The guard checks presence,
not content: a heading proves a section exists and nothing about what it
teaches. What a section says SHALL agree with the game's hint as it narrates
and draws, and whoever writes or changes either holds it to that.

#### Scenario: A hint's marks change

- **WHEN** a change alters what a game's hint draws or the words it uses for a mark
- **THEN** the same change updates that game's `## Hints` section

### Requirement: A game's parameters section is generated from its paramConfig

A page's `## <Name> parameters` section SHALL write `{{parameters}}` where its
list of fields goes, and the help build SHALL replace it with a list generated
from the game's `paramConfig`: each field's dialog label, its `doc`, and a
sentence stating its declared `bounds`, with the difficulty field's standard
text linking to what the tier names mean. Prose around the placeholder stays
hand-written.

#### Scenario: A page without the placeholder

- **WHEN** a game page's parameters section does not carry `{{parameters}}`
- **THEN** the help-coverage guard fails, naming the page
- **AND** the help build refuses it too

#### Scenario: A game gains a field

- **WHEN** a game adds a `paramConfig` field
- **THEN** its page lists the field with no edit to the page, and the field's
  `doc` is what the page says of it

### Requirement: No test file mocks a module

No test file SHALL call `vi.mock`, `vi.doMock` or `vi.hoisted`, and a check
SHALL assert it across the test tree. A test SHALL stand in for a module's
behavior by spying on the real export, with `vi.spyOn` on the module namespace
or on the shared object it exports, and SHALL restore it after each test. The
suite runs with `isolate: false`, so a module mock does not reach an importer
an earlier file in the worker already loaded, where a spy does.

#### Scenario: A test file that mocks a module is reported

- **WHEN** any test file calls `vi.mock`, `vi.doMock` or `vi.hoisted`
- **THEN** the check fails, naming the file

#### Scenario: A spied test passes in either file order

- **WHEN** a test file that spies on a module's export shares a worker with a
  file that imported that module's importers first
- **THEN** its spies observe the calls, and the next file in the worker calls
  the real function

### Requirement: The mock check says what it scanned

The mock check SHALL assert how many test files it scanned, that it scanned the
`vite-plugins/` tests as well as `src/`, and that its pattern matches known
mock calls and not a spy, so a mis-rooted glob or a pattern that stopped
matching cannot report a clean suite.

#### Scenario: The check's glob is mis-rooted

- **WHEN** the check's glob stops matching the test tree
- **THEN** the check fails on the number of files scanned, and does not report
  a suite with no mocks

### Requirement: A suspected cross-file leak is localized in one worker, in both orders

A test that fails only in a full run and passes alone SHALL be localized by
forcing the suspected files into one worker and running them in both orders,
with the file order shuffled under recorded seeds: one worker still runs its
files in the order the sequencer picks, and a pair run once can pass by
scheduling the victim first.

#### Scenario: Localizing a suspected cross-file leak

- **WHEN** a test fails only in a full run and passes alone
- **THEN** the suspected files are forced into one worker
  (`VITEST_MAX_WORKERS=1 vitest run <a> <b>`) and run in both orders, with
  `--sequence.shuffle.files` under recorded seeds

### Requirement: A hint test's pinned positions keep the scan that finds them

The test harness SHALL provide one way to pin the position each of a hint's
rungs is tested on (`src/engine/testing/hint-positions.ts`). A game's hint test
SHALL pin one position for every rung the game declares (`Game.hintRungs`),
keyed by the rung's id, as an input: a `params:desc`, with the moves played on
it where the board mid-game is not itself a desc. A rung's pin is a position
whose plan holds a step of that rung.

#### Scenario: A rung with no pin

- **WHEN** a game's hint gains a rung, and its hint test neither pins a
  position for it nor lists it as unreached
- **THEN** the test file does not typecheck

#### Scenario: A rung that is only ever a later leg

- **WHEN** a rung is never the step a plan opens with, as a placement's cull
  is not
- **THEN** it is pinned on a position whose plan holds a step of it, and the
  loader says where in the plan that step is

### Requirement: A rung no known board fires is excused by name, with its reason

A rung that no known board fires SHALL be excused from its pin only by listing
it with the reason, and the scan SHALL walk the excused rungs too and say when
one fires.

#### Scenario: A rung excused from a pin that fires

- **WHEN** a rung is listed as unreached and the scan finds a position that
  fires it
- **THEN** the scan command says so and prints the position to pin

### Requirement: A further kind is a predicate over the step, never a pattern over its sentence

A kind a test pins beyond the rung ids SHALL be a predicate over the step a
plan opens with, the board it is asked from and the plan, for what a rung id
does not say: a step's shape, which of a rung's cases it is, the board's, or
the plan's. A predicate SHALL be given the plan and SHALL NOT ask the game's
hint for it. A kind SHALL read the step's fields and SHALL NOT be a pattern
matched against its sentence; the harness's type for a kind does not admit
one.

#### Scenario: A kind with no pin

- **WHEN** a test names a kind and pins no position for it
- **THEN** the file does not typecheck

#### Scenario: A kind about the plan

- **WHEN** a kind is a plan whose opening step has a continuation after it
- **THEN** its predicate reads the plan it is given, and the hint is asked
  once for that position

#### Scenario: A board on which a solver rung fires

- **WHEN** a test wants the board a solver rung fires on, and no step says so
- **THEN** the kind is a predicate that asks the solver about the board the
  hint is asked from, and the pin is that board

### Requirement: A kind named as a leg is held by any step of the plan

A kind that names its predicate as a leg SHALL be held by any step of the plan,
as a rung id is; the board its predicate is given is still the one the plan was
asked from. A test file that pins positions of its own beside the game's rungs
SHALL do so through the same harness, with kinds that are rung ids, predicates
or legs.

#### Scenario: A case of a rung that is only ever a later leg

- **WHEN** a test wants one case of a rung, which a predicate tells apart, and
  that case is not the step a plan opens with
- **THEN** the kind names the predicate as a leg, and the loader returns the
  first step of the plan it accepts and where that step is

### Requirement: The harness tests that every pin still fires, and snapshots what it says

The harness SHALL declare the test that every pin's plan still fires its kind,
and SHALL fail a pin that does not with the command that finds another. It
SHALL also hold the sentence said at each pin as a snapshot, which is where a
rung's wording is asserted, since no pin reads it.

#### Scenario: A pin stops firing

- **WHEN** a change to a hint, a solver or a generator leaves a pinned
  position whose plan no longer fires the pin's kind
- **THEN** the pin's test fails, quoting what the hint says there now and the
  rungs of its plan
- **AND** the failure names the command that scans for a position that fires

#### Scenario: A reworded sentence

- **WHEN** a hint's sentence is reworded and its deduction is not changed
- **THEN** every pin still fires, and the snapshot of what each pin says is
  the test that changes

### Requirement: A pinned step's frame is drawn through the midend

The harness SHALL provide the frame of a pinned position's step
(`renderPinnedHint`, `src/engine/testing/render-scenario.ts`), drawn through
the midend with the legs before that step played as the midend plays a hint. It
SHALL fail where the step the midend shows is not the pin's, by its sentence
and its move. A test SHALL NOT reach a hint's frame by walking a plan on a
board it keeps by hand.

#### Scenario: The frame of a later leg

- **WHEN** a render test wants the frame of a pin whose step is a later leg
- **THEN** the frame shows that step on the board the legs before it leave
- **AND** a pin whose opening step says the same sentence is not taken for it

### Requirement: The scan walks hint-guided play over fixed seeds and counts each kind

The scan SHALL walk hint-guided play over fixed seeds, taking each plan's first
step and asking again. It SHALL report for every kind how many of the positions
walked it held on and the one of them to pin: one where the kind's step opens
the plan before one where it comes later, then the fewest moves in.

#### Scenario: Scanning again

- **WHEN** the scan command is run on a hint test file
- **THEN** it walks its boards and reports a position for every kind
- **AND** each is reported with how many of the positions walked it held on,
  and a kind that held on none is reported as not found

### Requirement: A scan plays what its test says, for a kind hint-guided play does not meet

Where a test says so, the scan SHALL play moves before the first hint, ask the
hint under a `Ui` the test names, and walk a second line of play that the test
steers, for a kind hint-guided play does not meet.

#### Scenario: A sentence spoken only off the hint's line

- **WHEN** a hint keeps to lines that finish, and a rung is about a move
  that would not
- **THEN** the test gives the scan a second line of play, naming the move
  played at each turn from the board and the move the hint offers
- **AND** the kinds are counted over both lines

### Requirement: A pin carries its count, and comes from the scan in the tree

A pin SHALL be recorded with the count of positions walked that its kind held
on. A hint test SHALL NOT pin a position found by a scan that is not in the
tree, unless the scan in the tree was run and did not reach the kind, which the
pin SHALL say with the count walked.

#### Scenario: The scan in the tree does not reach a kind

- **WHEN** the tree's scan walks its boards and no position holds a kind, and a
  position for it is known by other means
- **THEN** the pin is kept by hand and says that the scan reached none, with
  the count it walked

### Requirement: A hint test does not walk seeds to find its position

A hint test SHALL NOT walk seeds to find the position it asserts on. A test
that asserts a property of every board or step it walks is a sweep and not a
scan for a position, and is not covered by this requirement.

#### Scenario: A refusal

- **WHEN** a test wants a board the hint refuses
- **THEN** it keeps the board by hand and says why beside it, because a
  refusal has no step for a pin's loader to return

#### Scenario: A cross-game guard needs a frame only some games produce

- **WHEN** a guard over every hinted game checks a frame that only some
  games' hints produce, as a numbered chain is
- **THEN** it pins one position for each such game and searches for none on a
  normal run
- **AND** a walk another guard already makes fails on such a step from a game
  with no pin, so which games are checked stays derived from what their hints
  do

### Requirement: One command scans a hint test's positions and writes its pins

The repository SHALL provide `npm run hint-scan -- <test file>`
(`scripts/hint-scan.ts`), which runs the scans the file declares through the
hint-position harness and writes each scan's positions into that call's `pins`
object, each pin under how many of the positions walked it held on. It SHALL
find a call's `pins` by parsing the file, so a call at any indent, inside a
`describe`, or the second of several in one file is written the same way. It
SHALL write no file but that test file.

#### Scenario: Adding a kind

- **WHEN** a game's hint gains a rung, or a test names a new kind, and the
  command is run on the test file
- **THEN** the file gains a pin for it under the count it held on
- **AND** every pin that still fires is byte-for-byte the board it was

### Requirement: The scan command keeps a pin that still fires

The scan command SHALL NOT replace a pin that still fires its kind, because
tests and snapshots are written against a pin's board: it brings that pin's
count up to date and no more, and replaces it only when asked for every pin. It
SHALL leave in place a pin for a kind the scan found no position for, and name
it, because such a pin is kept by hand for a kind the scan's line of play does
not reach.

#### Scenario: A pin kept by hand

- **WHEN** the scan finds no position for a kind whose pin still fires
- **THEN** the pin is left as written, comment and all
- **AND** the command says the pin is kept by hand and the scan reaches none

#### Scenario: A stale pin

- **WHEN** a pin no longer fires its kind and the scan finds a position that
  does
- **THEN** the pin is replaced by that position and its count

### Requirement: The scan command fails on a kind nothing fires, and on an empty scan

The scan command SHALL exit non-zero, naming the kind, when a kind has neither
a pin that fires nor a position found. An empty result SHALL NOT read as
health: the command SHALL fail when the file declares no scan, and when the
file fails before any scan runs it SHALL fail with the error the test runner
gave.

#### Scenario: A kind nothing fires

- **WHEN** a kind has no pin, or a stale one, and the scan finds no position
- **THEN** the command names the kind and exits non-zero
- **AND** it does not write a placeholder that would make the file look pinned

#### Scenario: A file with no scan

- **WHEN** the command is run on a test file that declares no hint pins
- **THEN** it fails saying so, and does not report that every pin stands

### Requirement: A pin that does not load does not stop a scan

While a scan runs, a pin that does not load SHALL NOT stop the file being
collected: the harness hands a test that reads such a pin a stand-in, so a test
file that reads a pin in a `describe` body can still be scanned for the pin it
lacks.

#### Scenario: A pin read while tests are collected

- **WHEN** a test file reads a pin in a `describe` body, and that pin is
  missing or stale
- **THEN** an ordinary run fails at collection with the command to run
- **AND** the command itself still scans the file and writes the pin

### Requirement: A scan whose pins live elsewhere is printed, not written

A scan whose pins are not written in the call, as a cross-game guard's are when
it keeps them in a module of their own, SHALL have its positions printed and
nothing written.

#### Scenario: A cross-game guard is scanned

- **WHEN** the command is run on a guard whose pins are in another module
- **THEN** it prints the positions it found and edits no file

### Requirement: A help page names a field's choice through a placeholder

Where a game's help page names a choice of one of its `"choices"` fields, it
SHALL write `{{choice:<kw>:<index>}}`, the field's keyword and the choice's
zero-based index, and the help build SHALL replace it with that choice's name
from the game's `paramConfig`. A placeholder that names no choices field of the
game, or an index the field does not have, SHALL fail the build, naming the
page.

#### Scenario: A mode is renamed

- **WHEN** a game changes a name in a field's `choices`
- **THEN** the Custom dialog, the params label, the menu section and every
  sentence of its help page that names the choice change with it, with no edit
  to the page

#### Scenario: A placeholder names no choice

- **WHEN** a page writes `{{choice:mode:2}}` and the field has two choices
- **THEN** the help-coverage guard fails and the help build refuses the page

### Requirement: A help page does not type a choice's name

A page SHALL NOT type the name of a choice out. The help-coverage guard scans
each page for every choice name of the game as a whole, case-matched word.
Three kinds of name are outside the scan: the game's own name, which a page
says as the game far more often than as a mode; the difficulty tiers, which are
ordinary words explained once for every game; and a name with no letter in it.

#### Scenario: A page types a choice's name

- **WHEN** a game page spells out the name of a choice the game offers
- **THEN** the help-coverage guard fails, naming the page and the placeholder to
  write

### Requirement: A game page's list of rulesets is generated

The help page of a game that declares rulesets SHALL write `{{rulesets}}` once,
in the unheaded rules at its top, and the help build SHALL replace it with a
list generated from the declaration: one line for each ruleset, its name and
its `rule`. A declaring game's page without the placeholder, and any other
game's page with one, SHALL fail the build, and the help-coverage guard SHALL
say so first.

#### Scenario: A ruleset's rule is reworded

- **WHEN** a game changes a ruleset's `rule` or `name`
- **THEN** its help page's list says the new words with no edit to the page

#### Scenario: A page and its game disagree about having rulesets

- **WHEN** a game declares rulesets and its page lacks `{{rulesets}}`, or a
  page carries it and its game declares none
- **THEN** the help-coverage guard fails, naming the page, and the help build
  refuses it

### Requirement: A game page's list of rule modifiers is generated

The help page of a game that declares rule modifiers SHALL write
`{{modifiers}}` once, in the unheaded rules at its top, and the help build
SHALL replace it with a list generated from the declarations: one line for each
modifier, headed by the words a params label says for it and stating its rule.
A declaring game's page without the placeholder, and any other game's page with
one, SHALL fail the build, and the help-coverage guard SHALL say so first.

#### Scenario: A player meets a word in the Type menu

- **WHEN** a preset's title carries a modifier's words, such as "wrapping"
- **THEN** the game's help page has a line headed by those words stating the
  rule

#### Scenario: A page and its game disagree about having modifiers

- **WHEN** a game declares a modifier and its page lacks `{{modifiers}}`, or a
  page carries it and its game declares none
- **THEN** the help-coverage guard fails, naming the page, and the help build
  refuses it

### Requirement: Agent instructions have one root file, and no record of completed work is hand-maintained

The repository SHALL keep one agent-facing instruction file at its root,
`AGENTS.md`, and `CLAUDE.md` SHALL be a symbolic link to it so that tools
reading either name see the same content. No tool SHALL generate a second
agent-facing instruction file inside the repository: a generated file that must
be edited to be correct is a file whose corrections have an expiry date.

#### Scenario: CLAUDE.md and AGENTS.md never drift

- **WHEN** a contributor reads `CLAUDE.md`
- **THEN** the content is identical to `AGENTS.md`
- **AND** `readlink CLAUDE.md` resolves to `AGENTS.md`

#### Scenario: openspec generates no second instruction file

- **WHEN** the repository is searched for an openspec-generated instruction file
- **THEN** neither `openspec/AGENTS.md` nor `openspec/OPENSPEC_AGENTS.md` exists
- **AND** the workflow is reached through the installed `openspec-*` skills

### Requirement: No record of completed work is hand-maintained

No record of work already completed SHALL be hand-maintained anywhere: not in
`AGENTS.md`, not in `README.md`, not in a guide. The record is
`openspec/changes/archive/`, `openspec/postmortems/` and the git log, all
produced by the workflow as a side effect of doing the work.

#### Scenario: A completed change is recorded by the workflow, not by hand

- **WHEN** a change is archived
- **THEN** its record is the archived change directory and the git log, with no digest of it written into any maintained document
- **AND** whatever rule the change established is stated in the present tense in the guide for the part of the tree it binds

### Requirement: A rule is lifted out before the history around it is removed

When history is removed from a maintained document, any rule stated only inside
it SHALL be lifted out first. A sweep of the removed text for normative
language is what catches a lesson embedded in an incident write-up.

#### Scenario: Removing history does not lose a rule

- **WHEN** history is removed from a maintained document
- **THEN** the removed text is first swept for normative statements, and each is either already present in a retained section, lifted into one, or confirmed to be a fact about the past rather than a rule

### Requirement: The root brief is bounded, and the project's rules live in the README and the guides

`AGENTS.md` at the repository root SHALL be no longer than 200 lines and 20,000
bytes; a line count alone is met by a file that never wraps. The gate SHALL
fail, in its fast prefix, when it exceeds either bound, naming the overage. Any
other instruction file an agent loads without being asked SHALL be held to the
same bound by the same check. `AGENTS.md` SHALL open by saying that a change
which would make it longer is made only when there is no better way to achieve
the same thing.

#### Scenario: a change adds a paragraph past the bound

- **WHEN** a commit leaves `AGENTS.md` over 200 lines or over 20,000 bytes
- **THEN** the gate fails before any test runs, naming the file and by how much

#### Scenario: the check stops seeing the file

- **WHEN** `AGENTS.md` is missing or `CLAUDE.md` no longer resolves to it
- **THEN** the check fails and says so, rather than passing over nothing

### Requirement: `AGENTS.md` holds what binds every session, and the rest lives where any reader finds it

`AGENTS.md` SHALL hold three things: the rules that apply whatever a session is
working on, a map naming the guide to read before touching each part of the
tree, and what is specific to a coding agent. Everything else SHALL live where
any reader finds it: what the project is, how it is laid out and how it is
built in `README.md`, and how work is done here in a guide under `docs/`.

#### Scenario: A contributor asks how the project is built

- **WHEN** a reader wants to know what the project is or how it is built
- **THEN** `README.md` says so, and `AGENTS.md` does not hold it

### Requirement: A completed change's rule goes in the guide for the part of the tree it binds

Where a completed change establishes a rule, the rule SHALL go in the guide for
the part of the tree it binds, and in `AGENTS.md` only when it binds every
session.

#### Scenario: A change establishes a rule about one part of the tree

- **WHEN** a completed change establishes a rule that binds only hint work
- **THEN** the rule is written into the hints guide and not into `AGENTS.md`

### Requirement: Material addressed to one tool holds only what is specific to that tool

Material addressed to one tool SHALL be used only for what is inherently
specific to that tool, and SHALL NOT be the only place a rule of this project
is written.

#### Scenario: a rule is readable without the tool

- **WHEN** a contributor who uses no coding agent looks for the rule that governs a part of the tree
- **THEN** it is in `README.md` or under `docs/`, and no file under a tool's own directory is needed to find it

### Requirement: A fact the tree states is not restated

A fact the tree itself states SHALL NOT be restated in `AGENTS.md`, `README.md`
or a guide: which directories exist, what a script runs, what a file contains.
The source answers these and cannot go stale, and `AGENTS.md` SHALL tell a
reader to go to it. What is written down is what the source cannot say: a rule,
a decision, a reason, or a trap the code does not warn about.

#### Scenario: a fact about the tree is asked of the tree

- **WHEN** a session needs to know what the gate runs or where a kind of file lives
- **THEN** it reads the script or lists the directory, and no instruction file or guide carries a copy to disagree with it

### Requirement: A third-party tool's behavior is not described

How a third-party tool behaves SHALL NOT be described in `AGENTS.md`,
`README.md` or a guide, openspec included: its commands, its file formats and
what its versions accept are documented by the tool and change with it. This
repository states which tool it uses and what it has decided about its own
workflow.

#### Scenario: A session needs an openspec command

- **WHEN** a session needs to know what an openspec command accepts
- **THEN** it reads the tool's own documentation, and the guides say only which
  tool the workflow uses and what this project decided about it

### Requirement: No history is written into `AGENTS.md` or a guide

History SHALL NOT be written into `AGENTS.md` or carried from it into a guide:
the incident that taught a rule, when it happened, what a file used to say.
What is kept from an incident is what a later session acts on, which is the
rule and any concrete shape to look for. The record is the archive and the git
log.

#### Scenario: An incident teaches a rule

- **WHEN** a session writes down what an incident taught
- **THEN** the guide gains the rule and the shape to look for
- **AND** it gains no account of the incident or of when it happened

### Requirement: The gate holds every open loop that draws randomness to a stated bound

A loop under `src/games/` or `src/engine/` whose header does not count (a
`while`, a `do…while`, or a `for` missing its condition or its incrementor) and
which draws from the RNG SHALL either call a `retryLimit` guard once per pass,
or be listed in a ledger with what ends it. The ledger SHALL be asserted equal
to the set of such loops the scan finds unguarded, in both directions. A
deterministic open loop is outside this requirement: the first test to reach
one that never ends finds it.

#### Scenario: A generator's guard is removed

- **WHEN** the call to a `retryLimit` guard is removed from a retry loop that
  draws from the RNG, whatever file it is in and whether the loop is
  `for (;;)`, `while (true)`, `do…while` or `while (!generate(rng))`
- **THEN** the gate fails in its source-scan pass, naming the loop by file,
  function and line

#### Scenario: A ledger entry outlives its loop

- **WHEN** a ledgered loop is deleted, renamed with its function, or given a
  guard
- **THEN** the gate fails until the entry is removed

### Requirement: The open-loop scan keys on shape and references

The open-loop scan SHALL key on the loop's shape and on references, not on a
file name or a list of games: an RNG is a declaration typed `RandomState` or
initialized from a function declared to return one, a draw is followed through
local functions and relative imports, and a guard is a variable initialized
from the `retryLimit` that `engine/retry-limit.ts` exports.

#### Scenario: A deal lives in a file not named for generation

- **WHEN** a game's retry loop sits in its state or solver module
- **THEN** the scan finds it by its shape and its draw, as it finds one in a
  generator module

### Requirement: The open-loop scan runs in the source-scan pass and carries its known positives

The open-loop scan SHALL run in the gate's source-scan pass, and SHALL carry
its own known positives: a bare loop of each open shape that it finds, and a
guard that is not the loop's own that it refuses.

#### Scenario: A loop borrows another loop's guard

- **WHEN** the scan is given an open loop that draws from the RNG and whose
  only guard call belongs to a nested loop or function
- **THEN** it reports the loop as unguarded

### Requirement: A loop that deals a whole board again takes the guard, and the ledger is for the rest

A loop that deals a whole board again until one is acceptable SHALL take the
guard, a loop that only rejects an already-solved shuffle included. A ledger
entry is for a loop that uses something up each pass, that counts for itself,
or that is rejection sampling for a single item; for the last, the reason SHALL
say what keeps an acceptable draw on offer. A default-budget guard SHALL NOT be
put on per-item rejection sampling, because a legal board can exhaust it.

#### Scenario: A loop rejects a shuffle that is already solved

- **WHEN** a generator shuffles a whole board again until it is not solved
- **THEN** the loop takes a `retryLimit` guard, and a ledger entry does not
  excuse it

#### Scenario: A new game samples a free square by rejection

- **WHEN** a generator draws a square until it finds one not taken, in an open
  loop
- **THEN** the gate fails until the ledger says what keeps a free square on
  offer
