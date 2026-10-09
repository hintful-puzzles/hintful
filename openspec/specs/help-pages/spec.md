# help-pages Specification

## Purpose

The help the app serves: where its pages live, the one skeleton a game's page
follows and what is generated into it from the game, how a page names a
control, a choice or a hint mark, and what the site-level pages owe a player
about the features this fork adds. `src/help-coverage.test.ts` holds most of
these, and how to write a page is `docs/help-pages.md`.

## Requirements

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

### Requirement: A help page lists what is not in the game, with the game's reason

A game's help page SHALL list, in a generated "Not in this game" section above
its parameters, every contract section the game declares not applicable, with
the game's reason. A page author SHALL write nothing for it.

#### Scenario: A reason reaches the help page

- **WHEN** Fifteen's help page is built
- **THEN** it has a "Not in this game" section, above "Fifteen parameters",
  naming Checking for mistakes with Fifteen's reason

### Requirement: A bound game's help SHALL list its marks from its legend

A bound game's help page SHALL mark where its list of marks goes, and the help
build SHALL replace that mark with one entry per role in the game's legend, led
by the engine's words for the role. A bound game's page without the mark, or an
unbound game's page with one, SHALL fail the build.

#### Scenario: A game binds its hint

- **WHEN** a game declares `hintMarks`
- **THEN** its help page's Hints section lists "A ring marks …", "An outline
  marks …" and "Stripes mark …" for the roles its legend lists, in the game's
  own words for what each marks there
