## ADDED Requirements

### Requirement: An instruction file that loads by itself is bounded in size

`AGENTS.md` at the repository root SHALL be no longer than 200 lines and 20,000 bytes, and so SHALL every instruction file the agent loads without being asked. The gate SHALL fail, in its fast prefix, when one of them exceeds either bound, naming the file and the overage.

The line bound is the one the tool's documentation gives for a file read into every session. The byte bound exists because a line count is met by a file that never wraps.

`AGENTS.md` SHALL hold only what applies whatever a session is working on. A rule that binds one part of the tree SHALL live in an instruction file scoped to that part, which the agent loads on touching a matching file. Where a completed change establishes a rule, the rule SHALL go in the narrowest such file that loads when it applies. `AGENTS.md` SHALL name each scoped file and the part of the tree it binds.

#### Scenario: a change adds a paragraph past the bound

- **WHEN** a commit leaves `AGENTS.md` or a scoped instruction file over 200 lines or over 20,000 bytes
- **THEN** the gate fails before any test runs, naming the file and by how much

#### Scenario: the check stops seeing the files

- **WHEN** the check finds fewer instruction files than its floor
- **THEN** it fails and says so, rather than passing over nothing

#### Scenario: a rule about one part of the tree reaches a session there

- **WHEN** a fresh session reads a file under a scoped file's paths
- **THEN** it can state a rule that is written only in that scoped file

#### Scenario: a session that touches nothing still has the brief

- **WHEN** a fresh session is asked about a rule that applies everywhere
- **THEN** it answers from `AGENTS.md` without reading any file
