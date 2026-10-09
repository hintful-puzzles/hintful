# repo-layout Specification

## Purpose

How this repository is organized and kept honest: where code, help, docs and
tooling live, the script that scaffolds a game, the developer guides under
`docs/` and the agent brief, design-fiction documents, the form a spec's
requirement takes, and the checks and audits that hold module layering, an
open change's paths, bulk edits, comments, spelling and citations to what
they claim. It
is the contract for working in the tree. How behavior is tested is `testing`,
what the served help must cover is `help-pages`, and how a change is accepted
and archived is `docs/work-management.md`.

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

Text that is this project's record, is not its words, or is generated SHALL
be exempt:

- `openspec/changes/archive/` and `openspec/postmortems/`. A live document
  that cites an archived change by a British id is not reported.
- The two notices under `licenses/`; the upstream C kept as a reading
  reference under a change's `reference/`; and the lockfile.
- Generated output: what is under `metrics/`, and test snapshots.
- The spelling tooling itself, whose table has to name every British stem.

#### Scenario: The archive is left in its own words

- **WHEN** the guard runs
- **THEN** nothing under `openspec/changes/archive/` or `openspec/postmortems/`
  is scanned or rewritten
- **AND** an archived change with a British word in its name keeps that name,
  and a live document citing it by that name is not reported

#### Scenario: This project's own file beside the notices

- **WHEN** `licenses/README.md`, which this project wrote, gains a British
  spelling
- **THEN** the guard reports it, since only the two notices there are someone
  else's words

#### Scenario: A snapshot holds a British word

- **WHEN** a test snapshot or a report under `metrics/` holds a British
  spelling
- **THEN** the guard does not report it, since the file is written by a tool
  from source the guard does read, and is corrected by correcting that source

#### Scenario: An image or a font

- **WHEN** the tracked files include an image or a font
- **THEN** the guard does not read it, since it holds no words

#### Scenario: A C file outside a change's reference directory

- **WHEN** a `.c` or `.h` file is tracked anywhere but under a change's
  `reference/`
- **THEN** the guard scans it like any other file

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

### Requirement: A requirement states a rule, and nothing else

A requirement under `openspec/specs/` SHALL state what must hold, in the
present tense, with at most one sentence of reason. It SHALL NOT hold how the
decision was reached, what the rule replaced, a measured figure, a date or a
change id. A change to a subject a capability already covers SHALL modify that
requirement and SHALL NOT add a second beside it.

#### Scenario: A change adds a rule to a subject the spec covers

- **WHEN** a change alters how a game's hint behaves, and the game's spec has a
  requirement for that part of its hint
- **THEN** the change's delta modifies that requirement
- **AND** the merged requirement reads as the rule that now holds, with no
  mention of the change

#### Scenario: A rule needs a long argument

- **WHEN** a rule cannot be justified in one sentence
- **THEN** the requirement states the rule and the guide carries the argument

### Requirement: The gate holds a spec to its form

The gate SHALL fail when a requirement's text before its first scenario is
longer than the validator allows, and when a `spec.md` contains a date or the
id of a change. The check SHALL read every `spec.md` under `openspec/specs/`,
and SHALL say in its failure what a requirement holds.

#### Scenario: A delta is archived into an over-long requirement

- **WHEN** archiving a change leaves a requirement over the validator's bound
- **THEN** the commit that archives it fails the gate

#### Scenario: A delta's words name its change

- **WHEN** archiving a change leaves its id or a date in a `spec.md`
- **THEN** the commit fails the gate, naming the file and the line

### Requirement: A requirement cited by its title resolves

A requirement cited by its capability and its title, in `src/`, `docs/`,
`scripts/` or `AGENTS.md`, SHALL resolve to a requirement of that capability,
and the gate SHALL fail on one that does not.

#### Scenario: A requirement is renamed

- **WHEN** a change renames a requirement that a source comment cites by title
- **THEN** the gate fails until the comment cites the new title
