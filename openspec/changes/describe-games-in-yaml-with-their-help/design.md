# Design

## Where a game's help lives

Every cataloged game has `src/games/<id>/<id>.description.yaml`, whose
`game` is the id and which carries a `help` map. A description that states
another family member's techniques (Unequal's Adjacent,
`adjacent.description.yaml`) carries no help: a ruleset is described on its
game's page, through `{{rulesets}}` and `{{choice:…}}` as before. The Latin
library (`src/engine/latin.description.yaml`) is a library and has none.

## The help fields

| Field | Renders as | Required |
| --- | --- | --- |
| (the catalog's `name`) | `# <Name>` | written by the renderer |
| `rules` | the unheaded opening | yes |
| `controls` | `## Controls` | yes |
| `sections` | a list of `{heading, body}`, each `## <heading>` in order | no |
| `origins` | `## Where the puzzle comes from`, or `puzzles come` for a game with rulesets | no |
| `hints` | `## Hints` | when, and only when, the game has a `hint()` |
| `parameters.before`, `parameters.after` | `## <Name> parameters`, the prose either side of the generated list | no |

The renderer (`src/describe/help-page.ts`) writes every `#` and `##` heading
and `{{parameters}}`, so a page cannot lack a section, put one out of order,
misname its origins heading or drop its parameter list. A prose field that
writes a `#` or `##` heading line, or `{{parameters}}`, is refused, naming
the file and field: a `###` subheading inside a section is the section's
own. The page's title is the catalog's name, not a field, because the
catalog already holds it.

Three checks of `help-coverage.test.ts` become this structure and are
deleted: the skeleton's order, the origins heading's placement and number,
and the parameters placeholder. What a test can still say only by reading
words stays a test: a credit outside the origins section, each placeholder
present iff the game owes it, a typed choice name, a link's target, and
`hints` present iff the game has a hint (a draft game has none).

## A shared sentence

A sentence several pages share is the engine's, rendered from one
declaration through a placeholder (`{{mark-all}}`, `{{sticky-pencil}}`,
`{{wing}}`, …), and a description keeps writing those placeholders: a second
mechanism for the same thing would be a second way. The Latin entry scheme
the proposal names would be a new placeholder, and writing it changes the
words of the pages that say "the same control scheme as Solo", which this
change forbids; it is `show-how-to-play-on-first-open`'s review, which
already lists those pages.

## The loader

`src/describe/load.ts` parses a description's text with `yaml` under YAML
1.2's core schema (pinned, so `no` and `on` stay strings), then validates it
with Ajv against `description.schema.json`, and throws naming the file and
the JSON pointer of the first fault: a formula that YAML read as a map
fails as "must be string" at that field. The schema is therefore consumed,
not only an editor's hint. The schema gains a library branch, and a game's
description requires the formal fields only when it states techniques.

`yaml` and `ajv` become direct development dependencies (both were already
installed through Vite, openspec and Workbox). They are read by
`npm run describe`, the help build, the tests and the research tools, and
never by the app: nothing the app imports reaches `src/describe/`.

## Notes become comments

Every `note` field in the three formal descriptions becomes a YAML comment
above what it describes, and `note` leaves the schema. The soundness
fingerprint already skipped notes, so no verdict changes; the verdicts'
keys name the file and are rekeyed from `.json` to `.yaml`. A compiled
module names its source in its first line, which changes with the
extension; nothing else in it does, which `compile.test.ts` shows.

## The build

The per-game help pages become virtual pages of `extraPages`, one per
cataloged id, whose first transform reads the description (watched, so an
edit reloads the page in dev), renders it to the markdown the rest of the
pipeline already takes, and sets `gameId`, which the transforms that read the
game used to take from the source file's name. The description is loaded
and rendered on the configuration's side, and only the game's facts (its
rulesets, the parameters placeholder) come through `gameCode`: the module
runner that evaluates the game collection for `virtual:draft-puzzles` under
Vitest cannot evaluate Ajv, which is CommonJS, so the loader must stay out
of `build-facts.ts`. The renderer therefore imports nothing of the engine
and takes what it needs of the game as `PageFacts`.

## The tests

The tests that read a game's page markdown (`help-coverage`,
`help-lightness-words`, `catalog-aliases`, Magnets' hint test) read it from
`src/describe/help-pages.ts`, which globs the descriptions and renders each
through the same function the build uses.

## The move, and its proof

A scratch converter splits each `help/games/<id>.md` at its `##` headings
into the fields above and writes them as YAML block scalars. It refuses to
write a file unless rendering the YAML back gives the page byte for byte,
so no word moves. The production build's `dist/help/*.html` before and after
are then compared whole.
