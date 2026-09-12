## ADDED Requirements

### Requirement: Cloudflare Pages deploy tooling lives in the CI deploy job

The app SHALL be published to Cloudflare Pages by direct upload from the CI
workflow's deploy job, which runs `cloudflare/wrangler-action` at a pinned
`wranglerVersion` against the gate's own build artifact; `build-pipeline` "The
app is published from a green gate, and the publish is verified on the deployed
origin" governs the gating and the verification.

The repository SHALL NOT otherwise carry Cloudflare Pages tooling:

- No `wrangler.toml` at the repository root.
- No `wrangler` package in `dependencies` or `devDependencies` of
  `package.json`.
- No `preview:pages` (or similarly named) script that invokes
  `wrangler`.

Wrangler is invoked by the deploy job alone, and the action provisions it at the
pinned version, so a dependency would install a CLI that no local command uses.
Standard Vite preview (`npm run preview`) covers the local-preview need for the
PWA.

#### Scenario: Wrangler is confined to the deploy job

- **WHEN** the repository is inspected
- **THEN** there is no `wrangler.toml` and `package.json` names no `wrangler`
  package or script
- **AND** the only invocation of wrangler is the deploy job's
  `cloudflare/wrangler-action` step in `.github/workflows/ci.yml`, with its
  version pinned

## MODIFIED Requirements

### Requirement: Source tree under `src/` groups files by UI role

`src/` SHALL group TypeScript files by the role they play, not by
filename pattern. The role-based subdirectories are:

- `src/screens/` — top-level screen components (one per HTML page) and
  the base class they extend. Currently: `screen.ts` (base),
  `home-screen.ts`, `puzzle-screen.ts`. Future per-screen Lit
  components belong here.
- `src/dialogs/` — modal / popover Lit components shown as overlays from
  one or more screens, such as `about-dialog.ts`, `settings-dialog.ts` and
  `share-dialog.ts`.
- `src/components/` — reusable leaf Lit components that don't fit
  screen-or-dialog, such as `catalog-card.ts`, `help-viewer.ts` and
  `saved-game-list.ts`.

The following kinds of files SHALL stay at `src/` root, not under a
subdirectory, because they are entry points or cross-cutting:

- HTML page entries referenced by `templates/*.html.hbs` (currently
  `home-page.ts`, `puzzle-page.ts`).
- The main bootstrap (`main.ts`), the old-browser preflight gate
  (`preflight.ts`), and the service worker (`sw.ts`).
- Cross-cutting modules with no single-screen owner, such as `routing.ts`,
  `color-scheme.ts`, `color-scheme-init.ts`, `icons.ts` and
  `project-identity.ts`.
- Ambient-type files such as `vite-env.d.ts`.

Existing subdirectories with non-UI scope SHALL keep their shape:
`src/assets/` (committed icons and images), `src/css/` (styles), `src/store/` (Dexie
schema), `src/utils/` (general-purpose helpers).

`src/puzzle/` SHALL separate its two roles into the directory root and one
subdirectory:

- `src/puzzle/` — the main-thread puzzle runtime: the `Puzzle` object, the
  Comlink worker host, the canvas `Drawing`, the engine surface, the worker
  adapter, and the committed catalog.
- `src/puzzle/components/` — the puzzle-specific Lit components (the view, the
  interactive view, the key bar, the history bar, the type menu, the config
  dialog, the context provider, the other-puzzles menu, the end notification).

The component **filenames** SHALL NOT repeat the directory (`components/view.ts`,
not `components/puzzle-view.ts`), and the **custom element names** SHALL NOT
change: `<puzzle-view>`, `<puzzle-keys>` and the rest are the app's DOM
vocabulary, used from `templates/*.html.hbs` and from every component's
templates. Renaming a file is a refactor; renaming a custom element changes the
app's markup contract.

The puzzle logic — everything that runs in the worker — SHALL live in two
sibling directories at `src/` root:

- `src/engine/` — the TS midend, the `Game` interface, the per-game
  registry, the save codec, the drawing/color/palette contracts, the
  engine's own type vocabulary (`types.ts`), and the shared solver and
  generator libraries, with behavioral `*.test.ts` colocated. Shared
  leaf libraries ported from upstream (`random/`, `combi/`) are engine
  libraries and live under it, each keeping its own frozen
  characterization corpus where it has one.
- `src/games/<puzzleId>/` — one folder per game (the `Game`
  implementation and its behavioral `*.test.ts`), named by catalog
  `puzzleId`.

Within `src/engine/`, a **family of modules that are meaningless apart from each
other** SHALL be grouped into a subdirectory; unrelated helpers SHALL stay flat.
The families are `grid/` (the grid builders, geometry, descriptions, trimming and
the aperiodic `tilings/`, with `grid/index.ts` the barrel its own doc comment
tells callers to import from) and `color/` (the twelve-color palette, the
role-to-color meanings, and the board-relative per-game colors — the three
layers `consolidate-colour-palette` designed).

A subdirectory SHALL NOT be created for a grouping that has to be argued for. The
test is whether a reader looking for a file would know to look there without
being told; where the answer requires the rationale to be explained, the file
stays flat. A taxonomy nobody can predict is re-litigated at every addition, and
files then land wherever the last argument ended.

`src/native/` SHALL NOT exist. It was named for the distinction between
*native TypeScript* and *the C compiled to WASM*; `retire-c-engine`
deleted the other half, so the name partitioned the tree into "all the
code" and "the app shell" — while `src/css/native.css`, three directories
away, used the same word for native HTML elements. A directory name that
encodes a distinction the codebase no longer makes is a false signal, not
a neutral one.

There SHALL NOT be a separate top-level category for "a ported shared or
leaf module", and no module SHALL carry a `bridge.ts`. That category
existed for the bottom-up seam-by-seam migration, and its `bridge.ts`
slot held the wasm-side `--js-library` shim; both the migration and the
wasm are gone, and the category's last two occupants (`random`, `combi`)
are ordinary engine libraries. Configuration for a removed toolchain is
removed with it.

A module SHALL NOT be required to carry a `__fixtures__/`
characterization corpus captured from the native C build: per the
`ts-migration` doctrine, correctness is established by behavioral and
property tests. A module MAY keep fixtures where they aid behavioral
testing — the frozen per-game differentials and the `random`/`combi`
corpora are kept for exactly that reason — but they are not a mandated
layout element and are not an acceptance gate.

#### Scenario: A new Lit component lands in the right bucket

- **WHEN** a contributor adds a new top-level screen, dialog, or leaf
  component
- **THEN** the file is placed under `src/screens/`, `src/dialogs/`, or
  `src/components/` respectively — or `src/puzzle/components/` when it is
  puzzle-specific
- **AND** the file is NOT added loose at `src/` root, and NOT loose at
  `src/puzzle/` root alongside the runtime

#### Scenario: A puzzle component moves without changing the markup

- **WHEN** a puzzle component's file is renamed or relocated
- **THEN** its `@customElement` tag name is unchanged
- **AND** `templates/*.html.hbs` and every template using `<puzzle-…>` are
  untouched

#### Scenario: Page-entry script URLs in HTML templates still resolve

- **WHEN** the change has landed
- **THEN** `templates/index.html.hbs` continues to load
  `/src/home-page.ts` and `templates/puzzle.html.hbs` continues to load
  `/src/puzzle-page.ts`
- **AND** neither file moves, because both are HTML page entries

#### Scenario: Renames preserve git history

- **WHEN** files are relocated from `src/` root into a subdirectory
- **THEN** `git mv` is used (not delete + add) so
  `git log --follow <new path>` walks back into pre-move history

#### Scenario: The engine and a game land in the right place

- **WHEN** engine-level behavior is added and, later, a game is added
- **THEN** the midend, `Game` interface, registry, save codec and shared
  libraries live under `src/engine/`
- **AND** the game lives under `src/games/<puzzleId>/` with its
  behavioral tests colocated
- **AND** neither is added loose at `src/` root

#### Scenario: A new engine helper is not given a speculative subdirectory

- **WHEN** a contributor adds an engine helper that does not belong to `grid/`
  or `color/`
- **THEN** it lands flat in `src/engine/`
- **AND** a new subdirectory is created only for a family whose members have no
  readership apart from each other

#### Scenario: A shared library is not given its own top-level directory

- **WHEN** a contributor adds a shared library used by the engine or by
  more than one game
- **THEN** it lands under `src/engine/`, not as a sibling of it
- **AND** it carries no `bridge.ts`, there being no wasm to bridge to

#### Scenario: `src/native/` is not in the tree

- **WHEN** the repository is inspected after the change has landed
- **THEN** `git ls-files src/native` returns no rows
- **AND** the only remaining use of the word "native" in a path is
  `src/css/native.css`, which means native HTML elements

## REMOVED Requirements

### Requirement: Cloudflare Pages tooling is not maintained in-tree

**Reason**: It said the fork does not deploy to Cloudflare Pages, citing a `PLAN.md` that no longer exists, and its scenario required `git grep -i 'wrangler\|cloudflare'` to find nothing outside the archive. The app is published to Cloudflare Pages by the CI deploy job through `cloudflare/wrangler-action`, and `_headers`, the CSP and the workflow all name the host.

**Migration**: Replaced by "Cloudflare Pages deploy tooling lives in the CI deploy job", which keeps the three prohibitions that are still true — no `wrangler.toml`, no wrangler dependency, no `preview:pages` script — and states where wrangler does run.
