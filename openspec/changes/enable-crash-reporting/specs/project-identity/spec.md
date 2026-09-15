# project-identity Specification Delta — enable-crash-reporting

## MODIFIED Requirements

### Requirement: The privacy notes describe what the app does with a player's data

The About dialog's Privacy panel SHALL state, truthfully for the build a player
is using, that the app collects and stores no personal information; that games,
saves, checkpoints and preferences live in the player's own browser storage and
are never sent anywhere; that any usage measurement the app may perform counts
anonymous aggregate actions only, with no personal information and no cookies
or other client-side identifier; and that crash reporting, where a build has it
switched on, asks before sending anything, and sends only the error, the app,
browser and screen it happened on, the last few buttons pressed before it, the
puzzle being played (which game, its game ID and how far in) and any note the
player adds, with personal information disabled in the reporting.

The notes SHALL NOT be a development placeholder, and SHALL NOT promise more
than the code keeps: the crash-report description is bound to `sendDefaultPii:
false` and to the consent gate in `src/utils/sentry.ts`, and the measurement
description is bound to whatever analytics block a deployment injects — a
deployment that adds identifying measurement MUST change the notes in the same
change.

#### Scenario: A player reads the privacy notes

- **WHEN** a player opens the About dialog's Privacy panel
- **THEN** it says no personal information is collected or stored
- **AND** it says their games and settings stay on their device
- **AND** it says any measurement is anonymous and aggregate, with no cookies
  or client-side identifier
- **AND** it says a crash report is sent only if they choose to send it
- **AND** it describes crash reports as carrying no identity and nothing they
  have saved

## ADDED Requirements

### Requirement: A crash report leaves the device only with the player's consent

When an unexpected error opens the crash dialog in a build with reporting
switched on, the app SHALL send nothing to the reporting service until the
player chooses to send the report. Declining, closing the dialog or reloading
the page SHALL discard what was held, and it SHALL never be sent afterwards.

The consent SHALL be enforced where every outgoing request passes — the SDK's
transport — rather than per integration, so that no integration can send around
it, and held reports SHALL NOT be written to storage before consent. Errors that
never open the dialog are therefore never sent.

#### Scenario: A player declines

- **WHEN** an error opens the crash dialog and the player presses *Don't send*,
  closes the dialog, or reloads
- **THEN** no request reaches the reporting service for that error, then or
  later

#### Scenario: A player sends

- **WHEN** the player presses *Send report*, optionally with a note
- **THEN** the held report is sent, followed by the note
- **AND** the dialog shows the report's event ID
