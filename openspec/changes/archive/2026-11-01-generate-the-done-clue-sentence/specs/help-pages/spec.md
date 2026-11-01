## ADDED Requirements

### Requirement: A clue's done mark is described by a generated sentence

A game whose player can mark a clue done SHALL declare the mark as its
`doneClues`, built with `dragMarkVerbs`. Its help page SHALL mark where the
sentence about the mark goes, inside its Controls section, and the help build
SHALL replace the mark with a sentence generated from the declaration: what is
marked, with which button, and that a drag repeats it. A page without the mark
its game owes, or with one its game does not, SHALL fail the build.

#### Scenario: Adjacent's bars are named

- **WHEN** Adjacent's help page is read in the app
- **THEN** its Controls section says to click a bar, with either button, to
  mark it done, and that a drag does the same to every bar passed over

#### Scenario: A page words the done mark for itself

- **WHEN** Magnets' page has no `{{done-clues}}` in its Controls section
- **THEN** the help-coverage guard fails, naming the page and the mark

## MODIFIED Requirements

### Requirement: A note-taking game's shared Controls sentences are generated

A help page SHALL mark where the sentence about the Mark-all press goes when
its game declares `markAll`, and where the sentence about sticky pencil mode
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
