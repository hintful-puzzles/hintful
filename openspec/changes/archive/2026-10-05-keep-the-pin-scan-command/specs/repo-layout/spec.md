## ADDED Requirements

### Requirement: One command scans a hint test's positions and writes its pins

The repository SHALL provide `npm run hint-scan -- <test file>`
(`scripts/hint-scan.ts`), which runs the scans the file declares through the
hint-position harness and writes each scan's positions into that call's `pins`
object, each pin under how many of the positions walked it held on. It SHALL
find a call's `pins` by parsing the file, so a call at any indent, inside a
`describe`, or the second of several in one file is written the same way. It
SHALL write no file but the test file it was given.

The command SHALL NOT replace a pin that still fires its kind, because tests and
snapshots are written against a pin's board; it brings that pin's count up to
date and no more, and replaces it only when asked for every pin. It SHALL leave
in place a pin for a kind the scan found no position for, and name it, because
such a pin is kept by hand for a kind the scan's line of play does not reach.
It SHALL exit non-zero, naming the kind, when a kind has neither a pin that
fires nor a position found.

An empty result SHALL NOT read as health: the command SHALL fail when the file
declares no scan, and when the file fails before any scan runs it SHALL fail
with the error the test runner gave. While a scan runs, a pin that does not
load SHALL NOT stop the file being collected: the harness hands a test that
reads such a pin a stand-in, so a test file that reads a pin in a `describe`
body can still be scanned for the pin it lacks.

A scan whose pins are not written in the call (a cross-game guard that keeps
them in a module of their own) SHALL have its positions printed and nothing
written.

#### Scenario: Adding a kind

- **WHEN** a game's hint gains a rung, or a test names a new kind, and the
  command is run on the test file
- **THEN** the file gains a pin for it under the count it held on
- **AND** every pin that still fires is byte-for-byte the board it was

#### Scenario: A pin kept by hand

- **WHEN** the scan finds no position for a kind whose pin still fires
- **THEN** the pin is left as written, comment and all
- **AND** the command says the pin is kept by hand and the scan reaches none

#### Scenario: A stale pin

- **WHEN** a pin no longer fires its kind and the scan finds a position that
  does
- **THEN** the pin is replaced by that position and its count

#### Scenario: A kind nothing fires

- **WHEN** a kind has no pin, or a stale one, and the scan finds no position
- **THEN** the command names the kind and exits non-zero
- **AND** it does not write a placeholder that would make the file look pinned

#### Scenario: A pin read while tests are collected

- **WHEN** a test file reads a pin in a `describe` body, and that pin is
  missing or stale
- **THEN** an ordinary run fails at collection with the command to run
- **AND** the command itself still scans the file and writes the pin

#### Scenario: A file with no scan

- **WHEN** the command is run on a test file that declares no hint pins
- **THEN** it fails saying so, and does not report that every pin stands

#### Scenario: A rung excused from a pin that fires

- **WHEN** a rung is listed as unreached and the scan finds a position that
  fires it
- **THEN** the command says so and prints the position to pin
