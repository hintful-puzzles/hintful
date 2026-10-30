# describe-games-in-yaml-with-their-help

**Status: filed on the owner's decision (2026-10-30).** It reverses one
earlier decision: the language investigation and the pilot
(`build-a-game-from-its-description`, archived; its `report.md` § "The
recommendation") declined building a help page from the description. The
owner's reasons are below. **It starts after `compile-the-latin-ladder` is
archived**, whose descriptions it converts, and
`show-how-to-play-on-first-open` starts after this one.

## Why

A game's help page is prose kept beside its code, held to a skeleton after
the fact by `src/help-coverage.test.ts`, and its rules are written a second
time, apart from the formal rules a description states. The owner wants one
file per game that is both what a player reads and what the engine is built
from:

- **The help page's sections become fields a schema requires**, so a page
  cannot lack one or put it out of order; the order is the renderer's,
  written once. That replaces a check with a structure.
- **A sentence several games share is a reference, not a copy.** A game's
  controls can name the shared Latin entry scheme, rendered from one source,
  so no page says "uses the same control scheme as Solo"
  (`help-pages.md` § "A game's page" already asks for this).
- **The prose rules sit beside the formal ones**, so a reviewer reads both
  together.
- **Readme-driven development**: a new game starts as its description, what
  a player reads and how it is played, and its code is compiled from it or
  held to it.

## What Changes

- **A description is YAML**: `<name>.description.yaml`, validated against
  the JSON Schema it has now (`src/describe/description.schema.json`), and
  named in the file by a `# yaml-language-server: $schema=...` line. Prose
  sections are `|` block scalars of markdown. Comments replace most `note`
  fields that exist only for an editor.
- **The schema gains the help page's sections** as fields (the rules, the
  controls, the game's own sections, where the puzzle comes from, hints, the
  parameters), required where the page skeleton requires them today.
- **The help page is built from the description**, in place of
  `help/games/<id>.md`, by the help build in `vite.config.ts`.
- **Piloted on Unequal**, whose two descriptions (`src/games/unequal/`) and
  the Latin library (`src/engine/latin.description.json`) convert from JSON
  in the pilot. `npm run describe`'s loader reads YAML; the compiler and
  `compile.test.ts` are otherwise unchanged.
- **Then every other game's page moves into a description**, most of them
  prose alone at first, with no word changed: the help-pages requirement
  "Adopting or relocating a help page changes no words" binds the move, and
  credits move verbatim. Rewording is `show-how-to-play-on-first-open`'s
  review, after this.

## Design notes for the session (2026-10-30; re-check)

- **Every formula and every prose field is a block scalar or quoted.** Read
  unquoted, `forall c in cells: known(c)` is a map, a leading `{` a flow
  mapping, and ` #` a comment. The schema says these fields are strings and
  the loader refuses anything else by name, so such a slip fails at compile
  time instead of reading as something else.
- **The parser is `yaml`**, already installed (2.9, through Vite and
  openspec), read only by the compile script and the help build, never by
  the app. It parses YAML 1.2's core schema, so `no` stays a string; the
  loader pins that rather than relying on the default.
- **What is lost**: an editor highlights a block scalar as a string, not as
  markdown, and Biome formats no YAML. Pages are still read in the running
  app, as `docs/help-pages.md` requires.
- **What the help build does today**: `help/games/*.md` rendered through
  `help/_game.html.hbs`, with placeholders such as `{{mark-all}}` from
  `vite-plugins/note-controls.ts`, and the skeleton held by
  `src/help-coverage.test.ts`. That test's checks become the schema's, and
  what is left of it is the session's to decide.
- **The interpreter and the checker** (`research/describe/`,
  `research/technique-check/`) read the descriptions too; their loaders move
  with the compiler's.

## Acceptance

Unequal's help page, built from its description, reads in the app as it
does today (the owner reads it), and every other game's page is unchanged
in the app after the move. The compiled modules are unchanged by the
conversion, which `compile.test.ts` shows.
