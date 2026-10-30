# Help pages

The rules for the help the app serves. What must hold is the
[`help-pages`](../openspec/specs/help-pages/spec.md) capability; the
renderer (`src/describe/help-page.ts`) writes a game page's skeleton, and
`src/help-coverage.test.ts` holds most of the rest; read it for what is
checked. This guide is the part a test cannot say.

## Owned by this project

Every page the app serves is this project's own markdown, whoever first wrote
the words: site-level pages in `help/`, and each game's page in the `help` of
its description, `src/games/<id>/<id>.description.yaml`
([`descriptions.md`](./descriptions.md)).

- **Never split help by authorship.** A page describing a game this project
  changes has to be correctable by the change that alters it.
- **A change that alters what a page describes updates the page**, in the
  same change. That includes a feature that diverges from upstream, a hint's
  marks or words, and a parameter.
- **Never ship a page that documents a platform this app is not**: no
  printing, no command-line options, no claim that nothing is saved.
- **Never name a help source directory after a URL subdirectory the build
  emits pages into.** A real directory shadowing a generated page namespace
  fails `vite build` with `EISDIR`. Every source renders to the top level,
  `/help/<name>`.

## A game's page

One skeleton, which the renderer writes from the description's `help`
fields: `rules`, unheaded; `controls` under `## Controls`; each of
`sections` under its `heading`; `origins` under `## Where the puzzle comes
from`; `hints` under `## Hints`, exactly when the game has a `hint()`; and
`## <Name> parameters` last, its generated list between `parameters.before`
and `parameters.after`. The title is the catalog's name. A field writes no
`#` or `##` heading and no `{{parameters}}`, and the load refuses one that
does; a `###` subheading is the section's own.

- **Write every field as a `|-` block scalar.** Markdown starting with `*`,
  `[` or `{{` reads as something else in a plain scalar, and a block
  scalar never does. The schema comment on the file's first line lets an
  editor check the fields against the schema as you type.
- **Read the page in the running app**, not the YAML: an editor shows a
  block scalar as a string, and nothing formats it.

- **A puzzle's inventor, its other names and a link to more of it go in
  `origins`**, never in the rules: a reader on the way to the controls wants
  to know how to play. A game with rulesets is several puzzles, so the
  renderer heads it "Where the puzzles come from", and it names each one by
  `{{choice:ruleset:<index>}}`. The words are a credit to the people
  who designed the puzzle: move them, do not rewrite them.
- **The check finds a credit left in the rules by its words**, which is a
  floor: a credit phrased in none of them passes. Read the page.
- **A ruleset does not carry its origin.** A generated list would need each
  credit recast as a "Name: …" line, and a credit can belong to the whole game
  (Ascent's does). The placeholder already keeps a renamed ruleset's credit
  with it.

- **The page names every mode the game's Type menu offers.** The pages
  adopted from upstream describe the headline rule only. An omission
  inherited that way is ours to fix: "keeps upstream's wording" protects the
  words that are there.
- **A check on modes keys on the dialog's fields (`paramConfig`), never on
  preset titles.** A title is a label someone composed, not the field it sets.
- **A mode's name is typed once.** Rulesets and modifiers are declared on
  `paramConfig`, and the page writes `{{rulesets}}`, `{{modifiers}}` or
  `{{choice:<kw>:<index>}}` where it names one
  ([`mechanics.md`](./mechanics.md) § "Params are declared once,
  on `paramConfig`").
- **A piece's color is typed nowhere.** A page about pieces of the two-state
  pair writes `{{pair:0}}` and `{{pair:1}}`, and the build says the palette's
  word (`TWO_NAMES`). Say the shape too ("a {{pair:0}} square"): a shape is
  what a player who cannot tell the hues goes by.
- **A sentence several pages would each write is the engine's.** The Mark-all
  press is `{{mark-all}}` and sticky pencil mode is `{{sticky-pencil}}`
  (`vite-plugins/note-controls.ts`); the page adds after it only what is the
  game's own, such as what a second press crosses out. Before writing a
  sentence about a key, a preference's default or a shared control on a second
  page, ask what declaration it could be rendered from: ten pages called
  sticky pencil mode something "a preference switches on" after every game
  had come to start with it on.
- **Hand-written Controls prose is read against `interpretMove`, key by key**,
  when the game's input changes. Nothing else holds it: a page can name a key
  the game does not answer, and leave out one it does.
- **A link to a site-level help page is its bare name** (`features#mark-all`),
  and `../x` is the game `x`: every page is served from `/help/`, so a link
  written to the source tree's shape renders and leads nowhere.
- **The Hints section is checked for presence, not content.** It says what
  the hint's marks mean in that game, which are the player's own notation,
  and the words its sentences use for them
  ([`hints.md`](./hints.md) § "The help teaches the marks").

## A generated section reads the game when it renders

A transform that reads a game takes the collection from
`await gameCode(addWatchFile)` (`vite-plugins/game-code.ts`), and what it
needs from the engine is re-exported by `src/build-facts.ts`. Nothing under
`vite-plugins/`, and nothing `vite.config.ts` imports, imports `src/games/`
or `src/engine/`, not even lazily or for one constant.

- **Why.** Vite restarts the dev server on any edit to a file the config
  imports, and every restart keeps the old config in memory for good. With
  the games imported there, each game edit was a restart, and a day's
  editing ran the server out of memory. Read the game, and an edit is a hot
  reload that the page picks up on its next load.
- **`vite-plugins/config-imports.test.ts` refuses an import**, and names the
  files it pulled in. It asks Vite for the config's dependencies, so a
  re-export or a literal `import()` is caught too.
- **The dev server's heap is measured by `scripts/dev-server-heap.mjs`**:
  forced restarts by default, or `--touch <file>` for what an edit to that
  file costs. Re-run it after changing a plugin that runs in dev.
