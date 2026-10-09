# project-identity Specification

## Purpose
How the app presents itself to a player: its name, who maintains it, the
lineage it credits and where, whose words and logo it shows, where its support
links go, and what its privacy notes promise. The legal side of the same
lineage is the `licensing` capability; this one is the presentational side.

## Requirements

### Requirement: The product is named Hintful Puzzles, from one source

The product SHALL be presented to players as **Hintful Puzzles**, with the
short label **Hintful** where a full name does not fit, as under an installed
icon. The repository's name, `hintful` in the `hintful-puzzles` organization,
SHALL NOT be presented as the product's: the product and the codebase are
different things with different names.

#### Scenario: Every surface shows the same name

- **WHEN** a player reads the front page heading, installs the app, or opens
  the About dialog
- **THEN** each shows "Hintful Puzzles", and the manifest gives "Hintful" as
  the short label for the installed icon

#### Scenario: A deployment brands itself without changing the project

- **WHEN** a deployment sets `VITE_APP_NAME`
- **THEN** the dialog title and the manifest show that name
- **AND** the license panel still labels the MIT notice with the project name

### Requirement: The name and the support links are read from one source

The name and the support links SHALL have one source in the code,
`src/project-identity.ts`. Every surface that shows a support link SHALL read
it from there. The name SHALL be read from there by the About dialog's title
and description, the PWA manifest, the front page's title and heading, and the
home screen's header.

#### Scenario: No listed surface carries its own copy

- **WHEN** the front page heading, the manifest and the About dialog's title
  and description show the name
- **THEN** none of them carries its own copy of the string

#### Scenario: The source-code link

- **WHEN** the About dialog and the front page's footer link to the source code
- **THEN** both take the address from `src/project-identity.ts`

### Requirement: Player-facing text is this project's own, and the lineage is credited in one place

Every sentence a player reads outside the per-game help pages SHALL be this
project's own writing, in its own voice: the front page, the page titles and
descriptions, the help site's own pages, the unsupported-browser and not-found
pages, and the privacy notes. Text inherited from `puzzles-web` SHALL NOT
survive verbatim on those surfaces. The per-game pages under `help/games/` are
excluded on purpose and keep upstream's wording.

#### Scenario: Inherited copy is gone

- **WHEN** the front page, the help site's own pages, the unsupported-browser
  page and the not-found page are compared with `puzzles-web`'s
- **THEN** no paragraph is shared verbatim

### Requirement: The header and the page titles speak for the product

The header and the page titles SHALL describe the product and SHALL name no
other project. The front page's header and title SHALL show the product name
with the tagline from `src/project-identity.ts`. The lineage SHALL be credited
in the About dialog and in the help pages that explain the collection's
origin: a header that names a predecessor presents the app as that
predecessor's.

#### Scenario: The header speaks for the product

- **WHEN** a player reads the front page's header or its title
- **THEN** it shows the product name and the tagline
- **AND** it names no other project or person

#### Scenario: A puzzle's page title

- **WHEN** a player reads the title of a puzzle's page
- **THEN** it shows the puzzle and the product name
- **AND** it names no other project or person

### Requirement: The logo is this project's own drawing

The logo SHALL be this project's own drawing, held in `public/favicon.svg`,
which is the single source of every generated PWA icon. The app SHALL ship no
third-party logo. The icons that depict a browser's own controls in the
install instructions are drawn from an openly licensed icon set and are not
logos.

#### Scenario: An installed icon

- **WHEN** the build generates the icons an installed app shows
- **THEN** each is generated from `public/favicon.svg`

### Requirement: The privacy notes describe what the app does with a player's data

The About dialog's Privacy panel SHALL state, truthfully for the build a player
is using, that the app collects and stores no personal information; that games,
saves, checkpoints and preferences live in the player's own browser storage and
are never sent anywhere; and that any usage measurement the app performs counts
anonymous aggregate actions only, with no personal information and no cookies
or other client-side identifier.

#### Scenario: A player reads the privacy notes

- **WHEN** a player opens the About dialog's Privacy panel
- **THEN** it says no personal information is collected or stored
- **AND** it says their games and settings stay on their device
- **AND** it says any measurement is anonymous and aggregate, with no cookies
  or client-side identifier

### Requirement: The privacy notes say what a crash report carries

The Privacy panel SHALL state, truthfully for the build a player is using, that
crash reporting, where a build has it switched on, asks before sending
anything, and sends only the error, the app, the browser and screen it happened
on, the last few buttons pressed before it, the puzzle being played (which
game, its game ID and how far in) and any note the player adds, with personal
information disabled in the reporting.

#### Scenario: A player reads about crash reports

- **WHEN** a player opens the About dialog's Privacy panel
- **THEN** it says a crash report is sent only if they choose to send it
- **AND** it describes crash reports as carrying no identity and nothing they
  have saved

### Requirement: The privacy notes promise no more than the code keeps

The privacy notes SHALL NOT be a development placeholder, and SHALL NOT promise
more than the code keeps. The crash-report description is bound to
`sendDefaultPii: false` and to the consent gate in `src/utils/sentry.ts`. The
measurement description is bound to whatever analytics block a deployment
injects: a deployment that adds identifying measurement MUST change the notes
in the same change.

#### Scenario: A deployment adds identifying measurement

- **WHEN** a deployment injects an analytics block that sets a cookie or
  another client-side identifier
- **THEN** the same change changes the notes to say so

### Requirement: The app presents its own authorship and its lineage in order

The player-facing surfaces SHALL present this project as its own work,
**maintained by** Yoni Lavi, and never "by", which would claim the puzzles
themselves, and those are other people's designs. They SHALL name the lineage
it stands on in chronological order: Simon Tatham's Portable Puzzle Collection,
Lennard Sprong's `puzzles-unreleased` additions, Mike Edmunds' `puzzles-web`
PWA shell, then this project.

#### Scenario: The About dialog names the author and the lineage

- **WHEN** a player opens the About dialog
- **THEN** the project is presented as maintained by Yoni Lavi
- **AND** Simon Tatham, Lennard Sprong and Mike Edmunds are each credited, in
  that order

### Requirement: Mike Edmunds is credited as the author of puzzles-web

Mike Edmunds SHALL be credited explicitly as the author of `puzzles-web`, the
direct parent this project forked from. Claiming authorship of this version
SHALL NOT be a reason to state a predecessor's contribution less clearly than
it was stated before: this
project's name goes at the front of the chain and no name SHALL be removed from
the middle of it.

#### Scenario: The credits name puzzles-web's author

- **WHEN** a player opens the About dialog
- **THEN** Mike Edmunds is identified as the author of `puzzles-web`
- **AND** the credit says this project forked from it

### Requirement: The description says this version is a native TypeScript implementation

The description SHALL say what this version is: a **native TypeScript
implementation** of the collection on this project's own engine. It SHALL NOT
describe the app as a web adaptation of a C engine compiled to WebAssembly,
which describes `puzzles-web` and is not true of this project.

#### Scenario: The description matches what the app actually is

- **WHEN** the About dialog describes this version
- **THEN** it describes a native TypeScript implementation
- **AND** it does not describe the app as a WebAssembly adaptation

### Requirement: No player-facing first person lacks an owner

No player-facing text SHALL speak in a first person whose referent is not the
current author. Prose inherited from a predecessor SHALL be re-attributed to
them by name or rewritten without the pronoun: an unowned "I" reassigns a
personal statement to whoever holds the repository next.

#### Scenario: The About dialog's first person

- **WHEN** a player opens the About dialog
- **THEN** no first-person statement is attributed to nobody

### Requirement: Player-facing links resolve to this project

Every player-facing link SHALL resolve to a destination this project controls,
or SHALL be absent. This covers the links offered for source code, discussion,
bug reports and credits: the About dialog's source, forum and bug-report links
and the front-page footer's credits link. A link SHALL NOT direct a player to a
predecessor's repository for support with code that predecessor did not write.

#### Scenario: A bug report is not misrouted

- **WHEN** a player follows the app's bug-report or discussion link
- **THEN** the destination belongs to this project
- **AND** it is not a predecessor's issue tracker

#### Scenario: A destination this project does not have

- **WHEN** this project's repository has no discussion forum
- **THEN** the About dialog offers no forum link

### Requirement: Attribution links point at the projects they credit

A link that exists to credit a predecessor or upstream, pointing at
`puzzles-web`, at Simon Tatham's site or at `puzzles-unreleased`, is not a
support destination and SHALL be kept. What decides is what the link is for:
attribution points outward by design, and support SHALL point home. The
unsupported-browser page's links to the predecessors' sites, offered as other
places to play the same puzzles, are outward links of this kind.

#### Scenario: Attribution links are preserved

- **WHEN** the About dialog credits upstream, `puzzles-unreleased` or
  `puzzles-web`
- **THEN** those links still point at those projects

#### Scenario: A browser the app cannot run in

- **WHEN** a player reads the unsupported-browser page
- **THEN** its link to try again leads back to this app
- **AND** its other links lead to Simon Tatham's collection and Mike Edmunds'
  web version, as other places to play

### Requirement: A crash report leaves the device only with the player's consent

When an unexpected error opens the crash dialog in a build with reporting
switched on, the app SHALL send nothing to the reporting service until the
player chooses to send the report. Declining, closing the dialog or reloading
the page SHALL discard what was held, and it SHALL never be sent afterwards.

#### Scenario: A player declines

- **WHEN** an error opens the crash dialog and the player presses *Don't send*,
  closes the dialog, or reloads
- **THEN** no request reaches the reporting service for that error, then or
  later

#### Scenario: A player sends

- **WHEN** the player presses *Send report*, optionally with a note
- **THEN** the held report is sent, followed by the note
- **AND** the dialog shows the report's event ID

### Requirement: Consent is enforced at the reporting SDK's transport

The consent SHALL be enforced where every outgoing request passes, the SDK's
transport, and not per integration, so that no integration can send around it.
Held reports SHALL NOT be written to storage before consent. An error that
never opens the dialog SHALL never be sent.

#### Scenario: A report is held while the player has not answered

- **WHEN** the SDK captures an error and the player has not chosen to send
- **THEN** the report is held in memory and nothing reaches the reporting
  service
- **AND** nothing of it is written to storage
