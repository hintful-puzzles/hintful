# build-pipeline Specification Delta — enable-crash-reporting

## ADDED Requirements

### Requirement: A stated reporting rule matches what the build does

Where this project states that errors reach an error-reporting service, a
deployed build SHALL actually be able to send them, or the statement SHALL be
amended to say that it does not. A rule enforced against nothing is worse than
no rule: it reads as a guarantee, code is written to satisfy it, and nobody
discovers it is inert until the failure it exists for is the one nobody heard
about.

`AGENTS.md` carried "let them propagate so Sentry records them" from before
there was anywhere to deploy, while `VITE_SENTRY_DSN` was never set. The first
outside failure — a stale chunk on the About dialog — reached the developer only
because a player read the error off their own screen and retyped it.

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

A client-side DSN is public by construction: it is compiled into the shipped
bundle and readable from the deployed assets. Whatever it is stored in, the
controls that restrict use are the reporting service's own allowed-domains list
and rate limits, and both SHALL be configured — an unrestricted public DSN
accepts traffic from anywhere.

Reporting SHALL be verified on the deployed origin by observing a deliberately
triggered and consented report arrive, since a DSN that is set but wrong is
indistinguishable from an app that never crashes.

#### Scenario: Error reporting is switched on for a deployment

- **WHEN** a deployment sets `VITE_SENTRY_DSN`
- **THEN** the CSP's `connect-src` names the reporting origin
- **AND** no `Accept-CH` header is emitted
- **AND** the service's allowed domains and rate limits are configured
- **AND** a deliberately triggered report the player agreed to is observed
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
