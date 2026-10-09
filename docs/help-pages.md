# Help pages

The rules for the pages under `help/`. What must hold is the
[`help-pages`](../openspec/specs/help-pages/spec.md) capability, and
`src/help-coverage.test.ts` holds most of it; read it for what is checked.
This guide is the part a test cannot say.

## One directory, owned by this project

Every page the app serves is this project's own markdown, whoever first wrote
the words: site-level pages at the top of `help/`, one page per game in
`help/games/`.

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

One skeleton: the rules, unheaded; `## Controls`; any sections of the game's
own; `## Where the puzzle comes from` when the page credits its puzzle;
`## Hints` exactly when the game has a `hint()`; and `## <Name> parameters`
last, naming every field the Custom dialog offers and every choice that is a
word.

- **A puzzle's inventor, its other names and a link to more of it go under
  "Where the puzzle comes from"**, never in the rules: a reader on the way to
  the controls wants to know how to play. A game with rulesets is several
  puzzles, so its heading is "Where the puzzles come from", and it names each
  one by `{{choice:ruleset:<index>}}`. The words are a credit to the people
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
  ([`games/mechanics.md`](./games/mechanics.md) § "Params are declared once,
  on `paramConfig`").
- **A piece's color is typed nowhere.** A page about pieces of the two-state
  pair writes `{{pair:0}}` and `{{pair:1}}`, and the build says the palette's
  word (`TWO_NAMES`). Say the shape too ("a {{pair:0}} square"): a shape is
  what a player who cannot tell the hues goes by.
- **The Hints section is checked for presence, not content.** It says what
  the hint's marks mean in that game, which are the player's own notation,
  and the words its sentences use for them
  ([`games/hints.md`](./games/hints.md) § "The help teaches the marks").
