## ADDED Requirements

### Requirement: A note-taking game's shared Controls sentences are generated

A help page SHALL mark where the sentence about the Mark-all press goes when
its game declares `canMarkAll`, and where the sentence about sticky pencil mode
goes when its game offers that preference, each inside its Controls section.
The help build SHALL replace each mark with the engine's one sentence. A page
without a mark its game owes, or with one its game does not, SHALL fail the
build.

#### Scenario: A page words the Mark-all press for itself

- **WHEN** Seismic's page has no `{{mark-all}}` in its Controls section
- **THEN** the help-coverage guard fails, naming the page and the mark

#### Scenario: A game starts with sticky pencil mode off

- **WHEN** a game offering the sticky pencil preference has it off in the `Ui`
  it starts with
- **THEN** a guard fails, naming the game, because the generated sentence tells
  the reader to turn the preference off

### Requirement: A link out of a game's help page names a game

A link in a game's help page that climbs out of the help directory SHALL name
a cataloged game. A link to a site-level help page SHALL be that page's bare
name, because every help page is served from one directory whatever directory
its source is in.

#### Scenario: A page links the features page by its source path

- **WHEN** a game's page links `../features#difficulty`
- **THEN** the help-coverage guard fails, naming the page and the target
