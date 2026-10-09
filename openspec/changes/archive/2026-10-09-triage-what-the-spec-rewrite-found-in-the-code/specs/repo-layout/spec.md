## MODIFIED Requirements

### Requirement: The record and other people's words keep their spelling

Text that is this project's record, is not its words, or is generated SHALL
be exempt:

- `openspec/changes/archive/` and `openspec/postmortems/`. A live document
  that cites an archived change by a British id is not reported.
- The two notices under `licenses/`; the upstream C kept as a reading
  reference under a change's `reference/`; and the lockfile.
- Generated output: what is under `metrics/`, and test snapshots.
- The spelling tooling itself, whose table has to name every British stem.

#### Scenario: The archive is left in its own words

- **WHEN** the guard runs
- **THEN** nothing under `openspec/changes/archive/` or `openspec/postmortems/`
  is scanned or rewritten
- **AND** an archived change with a British word in its name keeps that name,
  and a live document citing it by that name is not reported

#### Scenario: This project's own file beside the notices

- **WHEN** `licenses/README.md`, which this project wrote, gains a British
  spelling
- **THEN** the guard reports it, since only the two notices there are someone
  else's words

#### Scenario: A snapshot holds a British word

- **WHEN** a test snapshot or a report under `metrics/` holds a British
  spelling
- **THEN** the guard does not report it, since the file is written by a tool
  from source the guard does read, and is corrected by correcting that source

#### Scenario: An image or a font

- **WHEN** the tracked files include an image or a font
- **THEN** the guard does not read it, since it holds no words

#### Scenario: A C file outside a change's reference directory

- **WHEN** a `.c` or `.h` file is tracked anywhere but under a change's
  `reference/`
- **THEN** the guard scans it like any other file
