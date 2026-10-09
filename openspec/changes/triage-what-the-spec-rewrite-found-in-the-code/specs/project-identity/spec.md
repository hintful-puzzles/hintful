## MODIFIED Requirements

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

### Requirement: Consent is enforced at the reporting SDK's transport

The consent SHALL be enforced where every outgoing request passes, the SDK's
transport, so that no integration can send around it. Nothing SHALL be sent
before the player sends a report, and held reports SHALL NOT be written to
storage. A sent report SHALL carry what was recorded since the page opened or
the player last answered, up to a bound on the reports held: the errors the
dialog lists, errors captured without a dialog, and the record of activity.
Nothing personal SHALL be recorded.

#### Scenario: More errors than are held

- **WHEN** an error is captured while as many reports are held as the bound
  allows
- **THEN** the oldest held report of an error the dialog does not list is
  dropped to make room, and a listed error's report goes only when every held
  report is of a listed error

#### Scenario: A report is held while the player has not answered

- **WHEN** the SDK captures an error and the player has not chosen to send
- **THEN** the report is held in memory and nothing reaches the reporting
  service
- **AND** nothing of it is written to storage

#### Scenario: Errors that never opened the dialog, then one that does

- **WHEN** the SDK captures an error the dialog does not show (one on the
  dialog's ignore list, a service worker failure the app caught, a dialog that
  failed to open, an earlier send that failed), and the player later presses
  *Send report* for a different error
- **THEN** every held report is sent, with the console lines and the note of
  each ignored error in the record
- **AND** had the player not pressed it, none would have been

#### Scenario: An error out of a browser extension or third-party code

- **WHEN** an error's text or stack names a browser extension's file, or its
  stack runs through code that is not this app's
- **THEN** no report of it is held, the dialog does not open, and the record
  notes only that an error was ignored, without its text
- **BECAUSE** such an error can name the player's extensions or quote another
  site

#### Scenario: Third-party code in a build with reporting off

- **WHEN** a build has no reporting configured and an error's stack runs
  through code that is not this app's, with no extension's file in its text
- **THEN** the dialog shows it, since telling whose code a stack runs through
  is the SDK's, and nothing is held or sent in such a build

#### Scenario: The player arrived from another site

- **WHEN** the page was reached from a link on another site, one whose
  address begins with this app's own included
- **THEN** a report does not carry that address, and carries the address of a
  page of this app the player came from

#### Scenario: The dialog shows an error the SDK captured nothing for

- **WHEN** the dialog lists an error the SDK did not capture, such as one
  thrown in the puzzle worker or a rejection with no error object
- **THEN** a report of it is captured as the dialog shows it, and *Send report*
  sends that report

#### Scenario: The event ID the dialog shows

- **WHEN** several reports are sent by one press
- **THEN** the event ID shown is that of an error the dialog listed
- **AND** where no report of a listed error went, as when the SDK's own filter
  turned the listed error away, no event ID is shown

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
