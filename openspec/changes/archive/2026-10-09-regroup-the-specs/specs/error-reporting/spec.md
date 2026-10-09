## ADDED Requirements

### Requirement: A stated reporting rule matches what the build does

Where this project states that errors reach an error-reporting service, a
deployed build SHALL actually be able to send them, or the statement SHALL be
amended to say that it does not. A rule enforced against nothing is worse than
no rule: it reads as a guarantee, code is written to satisfy it, and nobody
discovers it is inert until the failure it exists for is the one nobody heard
about.

#### Scenario: A reporting rule is stated but no build implements it

- **WHEN** the project documents that unrecoverable errors reach a reporting
  service
- **THEN** either the deployed build can send them, or the documentation records
  that reporting is deliberately off

### Requirement: Turning on error reporting settles its side effects deliberately

Enabling error reporting SHALL NOT be treated as setting one variable. Setting
`VITE_SENTRY_DSN` widens the Content-Security-Policy's `connect-src` to the
reporting origin, and SHALL NOT turn on anything else a player's browser sends
by itself: the build requests no high-entropy client hints (`Accept-CH`), the
SDK tracks no sessions and sends no client reports, and nothing is sent while
nothing has gone wrong.

#### Scenario: Error reporting is switched on for a deployment

- **WHEN** a deployment sets `VITE_SENTRY_DSN`
- **THEN** the CSP's `connect-src` names the reporting origin
- **AND** no `Accept-CH` header is emitted

### Requirement: A public DSN is restricted at the reporting service

A client-side DSN is public by construction: it is compiled into the shipped
bundle and readable from the deployed assets, whatever it is stored in. The
reporting service's own allowed-domains list and rate limits are the controls
that restrict its use, and both SHALL be configured, since an unrestricted
public DSN accepts traffic from anywhere.

#### Scenario: A DSN is set for a deployment

- **WHEN** a deployment sets `VITE_SENTRY_DSN`
- **THEN** the service's allowed domains and rate limits are configured

### Requirement: Error reporting is verified on the deployed origin

Reporting SHALL be verified on the deployed origin by observing a deliberately
triggered and consented report arrive, since a DSN that is set but wrong is
indistinguishable from an app that never crashes.

#### Scenario: Reporting has just been switched on

- **WHEN** a deployment sets `VITE_SENTRY_DSN`
- **THEN** a deliberately triggered report the player agreed to is observed
  arriving

### Requirement: What a crash report carries matches what the privacy notes promise

The privacy notes a player can read SHALL describe what a crash report actually
contains. Before reporting is enabled, one real payload SHALL be read against
those notes, and any excess SHALL be turned off or the notes amended in the same
change.

#### Scenario: A crash report would carry more than the notes describe

- **WHEN** the payload a deployment would send exceeds what the privacy notes
  promise
- **THEN** the excess is disabled, or the notes are corrected in the same change

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
