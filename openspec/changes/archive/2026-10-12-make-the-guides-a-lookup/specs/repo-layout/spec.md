## MODIFIED Requirements

### Requirement: The game guides are organized by concern

The guides SHALL sit directly under `docs/`, one for each concern of a game
and one for each repo-wide subject. `docs/new-game.md` SHALL hold the route
through them by kind of game, the lifecycle of a game and the definition of
done. The table in `README.md` SHALL be the one index of the guides, one row
a guide, and no other file SHALL list them.

#### Scenario: A lesson about rendering is written down

- **WHEN** a change teaches something about how a game redraws
- **THEN** it is written into `docs/rendering.md`, the guide for that
  concern, and not into a guide named for the change

#### Scenario: A guide is added

- **WHEN** a concern gets a guide of its own
- **THEN** the table in `README.md` gains its row, and no index beside it does

### Requirement: `AGENTS.md` holds what binds every session, and the rest lives where any reader finds it

`AGENTS.md` SHALL hold three things: the rules that apply whatever a session is
working on, how a session uses the guides, and what is specific to a coding
agent. Everything else SHALL live where any reader finds it: what the project
is, how it is laid out, how it is built and the index of its guides in
`README.md`, and how work is done here in a guide under `docs/`.

#### Scenario: A contributor asks how the project is built

- **WHEN** a reader wants to know what the project is or how it is built
- **THEN** `README.md` says so, and `AGENTS.md` does not hold it

#### Scenario: A session looks for the guide to a part of the tree

- **WHEN** a session is about to touch a part of the tree
- **THEN** `AGENTS.md` sends it to the table in `README.md`, which names the guide

## ADDED Requirements

### Requirement: A guide opens with its how-to and a table of its sections

A guide that a game's author looks things up in SHALL open with one
paragraph, a section `What every game does`, and a section `Sections` whose
table names every `##` and `###` heading below it beside when a game needs
it. The gate SHALL fail, in its fast prefix, when a heading has no row, a row
names no heading, or the opening exceeds its budget of bytes. A guide without
the table SHALL be named in the check with its reason.

#### Scenario: A section is added to a guide

- **WHEN** a commit adds a `###` section to `docs/input.md` and no row for it
- **THEN** the gate fails before any test runs, naming the guide and the heading

#### Scenario: A new guide has no table

- **WHEN** a guide is added under `docs/` with no `Sections` table and no entry
  among the guides read whole
- **THEN** the gate fails, naming it

#### Scenario: The check stops seeing the guides

- **WHEN** the guides move out from under the check
- **THEN** it fails on having held none, rather than passing over nothing

### Requirement: A guide section is one rule, readable alone

A guide's `What every game does` SHALL say what a game does for the concern,
in the order it is done, pointing at the skeleton. Every section after it
SHALL state one rule, contract or helper and SHALL be readable without the
sections around it, with at most one sentence of reason beside a rule. A
guide SHALL NOT tell how a named game came to teach a rule; a game is named
as the exemplar to read.

#### Scenario: A rule was learned from one game

- **WHEN** a change teaches a rule on one game that other games must follow
- **THEN** the guide gains the rule and names the game as its exemplar
- **AND** what is true of that game alone goes to its spec or to a comment on
  the lines it explains

#### Scenario: A guide describes a cross-game guard

- **WHEN** a guard holds every game to a rule
- **THEN** the guide says what a game owes the guard and the command that runs it
- **AND** how the guard finds its population and what it once missed is in the
  guard's own header

### Requirement: A citation of a guide section resolves

A citation `<guide>.md § "Heading"` in a tracked file outside the archive and
the postmortems SHALL name a heading that guide has, and the gate SHALL fail,
in its fast prefix, on one that does not. A guide's headings SHALL be
distinct and SHALL hold no double quote, a citation being the text between
two.

#### Scenario: A cited heading is reworded

- **WHEN** a commit rewords a heading that a source comment cites and leaves
  the comment as it was
- **THEN** the gate fails before any test runs, naming the comment's file and
  the heading it asks for

#### Scenario: A section moves to another guide

- **WHEN** a section moves from one guide to another
- **THEN** every citation of it names the guide it moved to
