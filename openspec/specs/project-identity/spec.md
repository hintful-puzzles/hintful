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
icon. The repository's name, `hintful`, SHALL NOT be presented as the
product's. The surfaces built from code or a template SHALL read the name, the
tagline and the support links from `src/project-identity.ts`. A static page
writes the name out, since it is served as written.

#### Scenario: Every surface shows the same name

- **WHEN** a player reads the front page heading, installs the app, or opens
  the About dialog
- **THEN** each shows "Hintful Puzzles", and the manifest gives "Hintful" as
  the short label for the installed icon

#### Scenario: A deployment brands itself without changing the project

- **WHEN** a deployment sets `VITE_APP_NAME`
- **THEN** the dialog title and the manifest show that name
- **AND** the license panel still labels the MIT notice with the project name

#### Scenario: No surface carries its own copy

- **WHEN** the About dialog, the manifest, a page title or the front page's
  heading shows the name, or a surface links to the source code or the bug
  reports
- **THEN** it takes the string from `src/project-identity.ts`

#### Scenario: A static page

- **WHEN** the privacy notes, the unsupported-browser page, the not-found page
  or one of the help site's own pages names the product
- **THEN** the name is written in that file, and a rename edits it there as
  well as in `src/project-identity.ts`

#### Scenario: The repository's address

- **WHEN** the About dialog links to the source code
- **THEN** the link's text is the repository's address, which is the one place
  a player reads the repository's name

### Requirement: Player-facing text is this project's own, and the lineage is credited in one place

Every sentence a player reads outside the per-game help pages SHALL be this
project's own writing, in its own voice: the front page, the page titles and
descriptions, the help site's own pages, the unsupported-browser and not-found
pages, and the privacy notes. Text inherited from `puzzles-web` SHALL NOT
survive verbatim on those surfaces. The per-game pages under `help/games/` are
excluded on purpose and keep upstream's wording.

#### Scenario: A page outside the per-game help is written or revised

- **WHEN** the front page, one of the help site's own pages, the
  unsupported-browser page, the not-found page or the privacy notes is written
  or revised
- **THEN** its text is written for this project, and no paragraph of
  `puzzles-web`'s is carried into it verbatim

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

The Privacy panel and the crash dialog SHALL state, truthfully for the build
in use, that crash reporting asks before sending, and that a report carries the errors shown, any other errors recorded since the page
opened, a record of recent activity in the app (buttons pressed, pages opened,
network requests the app made, console messages), the app's version, the
browser, the screen, the puzzle being played, a few of the app's settings and
the player's note, and no identity and no saved game.

#### Scenario: A player reads about crash reports

- **WHEN** a player opens the About dialog's Privacy panel
- **THEN** it says a crash report is sent only if they choose to send it
- **AND** it says "It does not include your identity or any saved game."

#### Scenario: The settings a report carries

- **WHEN** a report is sent
- **THEN** it says whether offline use and automatic updates are on, whether
  the app is installed, and whether the app had to repair part of its display
- **AND** both texts say so, and the panel says of the player's preferences
  that these are the one exception to their never being sent

#### Scenario: A player is asked to send a report

- **WHEN** the crash dialog offers *Send report*
- **THEN** its words under "What a report includes" are the Privacy panel's
  own sentences about what a report includes, whole

#### Scenario: A tag is added to what a report carries

- **WHEN** the app attaches a new tag or context to its reports through the
  SDK and the Privacy panel has no words for it
- **THEN** a test fails, naming the tag

### Requirement: The privacy notes promise no more than the code keeps

The privacy notes SHALL NOT promise
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
