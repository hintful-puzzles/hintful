## REMOVED Requirements

### Requirement: Every help page the app serves lives under `help/`

**Reason**: A game's page is built from its description under `src/games/`,
not from markdown under `help/`.

**Migration**: "A game's help page is built from its description" states
where each page comes from.

### Requirement: Every game's help page has one skeleton, read off the game

**Reason**: The renderer writes every heading, so a page out of order is no
longer a state the guard can find.

**Migration**: "A game's help page has one skeleton, which its renderer
writes".

### Requirement: A puzzle's credits sit under the origins heading and nowhere else

**Reason**: The origins heading is the renderer's, so a misplaced or misnamed
one cannot be written.

**Migration**: "A puzzle's credits are its description's origins".

### Requirement: A game's parameters section is generated from its paramConfig

**Reason**: The renderer writes `{{parameters}}`, so a page cannot lack it.

**Migration**: "A game's parameter list is generated from its paramConfig".

## ADDED Requirements

### Requirement: A game's help page is built from its description

Every help page the app serves SHALL be this project's own. The site-level
pages SHALL be `help/*.md`, and each cataloged game's page SHALL be built from
the `help` of its description, `src/games/<puzzleId>/<puzzleId>.description.yaml`,
and served at `/help/<puzzleId>.html`. There SHALL NOT be an `upstream/`
subdirectory under `help/`: a page describing a game must be correctable by
the change that alters the game.

#### Scenario: A game's page is read from its description

- **WHEN** the help build renders a game's page
- **THEN** it reads the game's description and no other source
- **AND** no served page is read from a directory that forbids editing it

### Requirement: A game's help page has one skeleton, which its renderer writes

A game's page SHALL be rendered from its description's help fields in one
order: the catalog's name as its title; `rules`, unheaded; `controls` under
`## Controls`; each of `sections` under its own heading; `origins`; `hints`
under `## Hints`; and `## <Name> parameters` last. Every `#` and `##` heading
SHALL be the renderer's, and a prose field that writes one SHALL fail the
load, naming the file and the field.

#### Scenario: A prose field writes a section heading

- **WHEN** a description's `controls` holds a line `## Keyboard`
- **THEN** rendering the page fails, naming the description and `controls`
- **AND** a `### Keyboard` line is the section's own and renders

#### Scenario: A description-only commit runs the guard

- **WHEN** a commit stages only a game's description
- **THEN** the pre-commit hook selects the help-coverage guard, because the
  test selector reaches a description through the help pages' glob

### Requirement: A puzzle's credits are its description's origins

A puzzle's inventor, its other names and a link to more of it SHALL be in its
description's `origins` and nowhere else on the page. The renderer SHALL head
it `## Where the puzzles come from` for a game that declares rulesets, which
is several puzzles, and `## Where the puzzle comes from` for any other.

#### Scenario: A game gains rulesets

- **WHEN** a game whose page has an origins section declares rulesets
- **THEN** its heading reads "Where the puzzles come from" with no edit to
  the description

#### Scenario: A credit is left in the rules

- **WHEN** a page says who invented its puzzle, who designed it, what it is
  known as or what it is an implementation of, anywhere outside its origins
  section
- **THEN** the help-coverage guard fails, naming the game and the words it
  found
- **AND** a credit phrased in none of those words passes, since the words are
  the only thing a test can tell a credit by

### Requirement: A game's parameter list is generated from its paramConfig

The renderer SHALL write `{{parameters}}` between a description's
`parameters.before` and `parameters.after`, and the help build SHALL replace
it with a list generated from the game's `paramConfig`: each field's dialog
label, its `doc`, and a sentence stating its declared `bounds`, with the
difficulty field's standard text linking to what the tier names mean. A
prose field that writes `{{parameters}}` SHALL fail the load.

#### Scenario: A description writes the list's placeholder

- **WHEN** a description's `hints` holds `{{parameters}}`
- **THEN** rendering the page fails, naming the description and `hints`

#### Scenario: A game gains a field

- **WHEN** a game adds a `paramConfig` field
- **THEN** its page lists the field with no edit to the description, and the
  field's `doc` is what the page says of it

## MODIFIED Requirements

### Requirement: Every cataloged puzzle has a help page, and every page a cataloged game

Every cataloged `puzzleId` SHALL have a help page, and every help page SHALL
name a cataloged game. Both directions SHALL be asserted automatically.

#### Scenario: Every cataloged puzzle has a help page

- **WHEN** the help coverage is checked
- **THEN** every `puzzleId` in the catalog has a description at
  `src/games/<puzzleId>/<puzzleId>.description.yaml` that carries `help`
- **AND** every description that carries `help` names a cataloged game and
  sits at that game's path, the skeletons' aside
- **AND** both directions are asserted, so a page orphaned by a rename is caught
  as well as a game with no page

### Requirement: Adopting or relocating a help page changes no words, attribution or URL

Relocating or adopting a help page SHALL change neither its content nor its
attribution, and SHALL NOT change the URL any page is served at. Words adopted
from upstream keep their words; who may fix them afterwards is a licensing
question, which the notices under `licenses/` and `LICENSE.md` discharge.

#### Scenario: Adoption changes no URL and no words

- **WHEN** a help page is moved into a game's description
- **THEN** it is served at the same URL as before
- **AND** its words and the project's attribution are unchanged

### Requirement: A help source directory does not shadow a served URL directory

A help source directory SHALL NOT shadow a URL directory the build emits pages
into. A game's page renders to the top level, `/help/<puzzleId>.html`, from
wherever its description is.

#### Scenario: A help source directory does not shadow a served URL directory

- **WHEN** a help source is placed under `help/`
- **THEN** its directory name does not collide with a URL subdirectory the build
  emits pages into
- **AND** the production build succeeds

### Requirement: The sections a page owes are derived from the game

Which sections a page owes SHALL be derived from the game, never from a list:
the `hint()` declaration decides the Hints section, and `paramConfig` decides
what the parameters section names.

#### Scenario: A hinted game has no Hints section, or a hintless one has one

- **WHEN** a game declares `hint()` and its description has no `hints`, or
  declares none and its description has one
- **THEN** the help-coverage guard fails, naming the game
